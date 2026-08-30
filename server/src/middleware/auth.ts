import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";
import { sendError } from "../utils/apiResponse";
import { env } from "../config/env";

function extractToken(req: Request): string | null {
  // Primary: httpOnly cookie (set on login/register/OAuth callback).
  const cookieToken = req.cookies?.[env.cookieName];
  if (cookieToken) return cookieToken;

  // Fallback: Authorization header (useful for non-browser clients/tests).
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);

  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return sendError(res, "Authentication required", 401);

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub };
    next();
  } catch {
    return sendError(res, "Invalid or expired session", 401);
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub };
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}
