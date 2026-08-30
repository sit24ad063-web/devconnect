import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
const value = process.env[name] ?? fallback;

if (value === undefined) {
throw new Error(`Missing required environment variable: ${name}`);
}

return value;
}

export const env = {
// Environment
nodeEnv: process.env.NODE_ENV || "development",

// Render automatically provides PORT
port: parseInt(process.env.PORT || "5000", 10),

// Frontend URL
clientUrl:
process.env.CLIENT_URL ||
"http://localhost:5173",

// JWT
jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),

jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

cookieName: process.env.COOKIE_NAME || "devconnect_token",

// GitHub OAuth
githubClientId: process.env.GITHUB_CLIENT_ID || "",

githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",

githubCallbackUrl:
process.env.GITHUB_CALLBACK_URL ||
"https://devconnect-dt2y.onrender.com/api/auth/github/callback",

// Cloudinary
cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",

cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",

cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
};

export const isGithubOAuthConfigured = Boolean(
env.githubClientId &&
env.githubClientSecret &&
env.githubCallbackUrl
);

export const isCloudinaryConfigured = Boolean(
env.cloudinaryCloudName &&
env.cloudinaryApiKey &&
env.cloudinaryApiSecret
);
