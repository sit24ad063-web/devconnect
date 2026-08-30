import { Request, Response, NextFunction } from "express";
import axios from "axios";

import prisma from "../config/prisma";
import { env, isGithubOAuthConfigured } from "../config/env";
import { signToken, setAuthCookie } from "../utils/token";
import { ApiError } from "../utils/apiResponse";

/**

* Step 1: Redirect the browser to GitHub's authorization screen.
  */
  export function githubRedirect(
  _req: Request,
  res: Response,
  next: NextFunction
  ) {
  try {
  if (!isGithubOAuthConfigured) {
  throw new ApiError(
  "GitHub OAuth is not configured on this server.",
  503
  );
  }

  const params = new URLSearchParams({
  client_id: env.githubClientId,
  redirect_uri: env.githubCallbackUrl,
  scope: "read:user user:email",
  });

  res.redirect(
  `https://github.com/login/oauth/authorize?${params.toString()}`
  );
  } catch (err) {
  next(err);
  }
  }

interface GithubUserResponse {
id: number;
login: string;
name: string | null;
avatar_url: string;
html_url: string;
bio: string | null;
location: string | null;
blog: string | null;
}

interface GithubEmailResponse {
email: string;
primary: boolean;
verified: boolean;
}

/**

* Step 2: GitHub redirects here with a code.
* Exchange the code for an access token.
  */
  export async function githubCallback(
  req: Request,
  res: Response,
  next: NextFunction
  ) {
  try {
  if (!isGithubOAuthConfigured) {
  throw new ApiError(
  "GitHub OAuth is not configured on this server.",
  503
  );
  }

  const { code } = req.query;

  if (!code || typeof code !== "string") {
  throw new ApiError("Missing OAuth code from GitHub", 400);
  }

  // Exchange GitHub authorization code for an access token
  const tokenRes = await axios.post(
  "https://github.com/login/oauth/access_token",
  {
  client_id: env.githubClientId,
  client_secret: env.githubClientSecret,
  code,
  redirect_uri: env.githubCallbackUrl,
  },
  {
  headers: {
  Accept: "application/json",
  },
  }
  );

  const accessToken = tokenRes.data.access_token as string | undefined;

  if (!accessToken) {
  throw new ApiError(
  "Failed to obtain GitHub access token",
  502
  );
  }

  const githubHeaders = {
  Authorization: `Bearer ${accessToken}`,
  Accept: "application/vnd.github+json",
  };

  // Get GitHub profile and email information
  const [profileRes, emailsRes] = await Promise.all([
  axios.get<GithubUserResponse>(
  "https://api.github.com/user",
  {
  headers: githubHeaders,
  }
  ),

  axios.get<GithubEmailResponse[]>(
  "https://api.github.com/user/emails",
  {
  headers: githubHeaders,
  }
  ),
  ]);

  const profile = profileRes.data;

  // Find the user's primary verified GitHub email
  const primaryEmail =
  emailsRes.data.find(
  (email) => email.primary && email.verified
  )?.email ||
  emailsRes.data.find(
  (email) => email.verified
  )?.email ||
  emailsRes.data[0]?.email ||
  `${profile.login}@users.noreply.github.com`;

  const githubId = String(profile.id);

  // Check whether this GitHub account already exists
  let user = await prisma.user.findUnique({
  where: {
  githubId,
  },
  });

  // If GitHub account does not exist, check for an existing account
  // using the same email address
  if (!user) {
  user = await prisma.user.findUnique({
  where: {
  email: primaryEmail,
  },
  });
  }

  // Update existing user
  if (user) {
  user = await prisma.user.update({
  where: {
  id: user.id,
  },
  data: {
  githubId,
  avatarUrl: user.avatarUrl || profile.avatar_url,
  githubUrl: user.githubUrl || profile.html_url,
  bio: user.bio || profile.bio || undefined,
  location: user.location || profile.location || undefined,
  websiteUrl: user.websiteUrl || profile.blog || undefined,
  },
  });
  } else {
  // Create a new DevConnect user from GitHub
  user = await prisma.user.create({
  data: {
  name: profile.name || profile.login,
  email: primaryEmail,
  password: null,
  githubId,
  avatarUrl: profile.avatar_url,
  githubUrl: profile.html_url,
  bio: profile.bio || null,
  location: profile.location || null,
  websiteUrl: profile.blog || null,
  },
  });
  }

  // Create DevConnect JWT
  const token = signToken(user.id);

  // Store JWT securely in an HTTP-only cookie
  setAuthCookie(res, token);

  // Send the user back to the React frontend
  res.redirect(`${env.clientUrl}/oauth/callback`);
  } catch (err) {
  next(err);
  }
  }
