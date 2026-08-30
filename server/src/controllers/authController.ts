import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { signToken, setAuthCookie, clearAuthCookie, toPublicUser } from "../utils/token";
import { sendSuccess, ApiError } from "../utils/apiResponse";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, headline } = req.body;

    if (!name || !email || !password) {
      throw new ApiError("name, email and password are required", 400);
    }
    if (password.length < 6) {
      throw new ApiError("Password must be at least 6 characters", 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError("An account with this email already exists", 409);

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, headline: headline || null },
    });

    const token = signToken(user.id);
    setAuthCookie(res, token);
    sendSuccess(res, { user: toPublicUser(user), token }, "Account created", 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError("email and password are required", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) throw new ApiError("Invalid email or password", 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ApiError("Invalid email or password", 401);

    const token = signToken(user.id);
    setAuthCookie(res, token);
    sendSuccess(res, { user: toPublicUser(user), token }, "Logged in");
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new ApiError("User not found", 404);
    sendSuccess(res, { user: toPublicUser(user) }, "OK");
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  sendSuccess(res, null, "Logged out");
}
