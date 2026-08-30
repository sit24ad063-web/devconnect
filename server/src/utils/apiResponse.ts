import { Response } from "express";
import type { ApiResponse } from "@devconnect/shared";

/** Every endpoint responds with { success, data, message } per the brief. */
export function sendSuccess<T>(res: Response, data: T, message = "OK", status = 200) {
  const body: ApiResponse<T> = { success: true, data, message };
  return res.status(status).json(body);
}

export function sendError(res: Response, message: string, status = 400) {
  const body: ApiResponse<null> = { success: false, data: null, message };
  return res.status(status).json(body);
}

/** Thrown inside controllers/middleware; caught centrally by errorHandler. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
