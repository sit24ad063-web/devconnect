import jwt from "jsonwebtoken";
import { Response } from "express";
import { env } from "../config/env";
import type { PublicUser } from "@devconnect/shared";

export function signToken(userId: string): string {
  return jwt.sign(
    { sub: userId },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    } as jwt.SignOptions
  );
}

export function verifyToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwtSecret) as { sub: string };
}

/**
 * Issues the authentication JWT as an httpOnly cookie.
 */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

/**
 * Clears the authentication JWT cookie.
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
}

/**
 * Converts a Prisma User into the safe PublicUser object.
 */
export function toPublicUser(user: any): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    headline: user.headline ?? null,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? null,
    location: user.location ?? null,
    githubUrl: user.githubUrl ?? null,
    linkedinUrl: user.linkedinUrl ?? null,
    websiteUrl: user.websiteUrl ?? null,
    githubId: user.githubId ?? null,
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : user.createdAt,
  };
}