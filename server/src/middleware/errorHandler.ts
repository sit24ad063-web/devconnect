import { Request, Response, NextFunction } from "express";
import { ApiError, sendError } from "../utils/apiResponse";

export function notFound(req: Request, res: Response) {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (env_isTest()) {
    // keep test output clean
  } else {
    console.error(err);
  }

  if (err instanceof ApiError) {
    return sendError(res, err.message, err.status);
  }

  if (err?.code === "P2002") {
    return sendError(res, "A record with this value already exists.", 409);
  }

  if (err?.name === "MulterError") {
    return sendError(res, err.message, 400);
  }

  return sendError(res, err?.message || "Internal server error", err?.status || 500);
}

function env_isTest() {
  return process.env.NODE_ENV === "test";
}
