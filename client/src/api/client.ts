import axios from "axios";
import type { ApiResponse } from "@devconnect/shared";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // send/receive the httpOnly auth cookie
});

/** Unwraps the { success, data, message } envelope every endpoint returns. */
export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise;
  if (!res.data.success) {
    throw new Error(res.data.message || "Request failed");
  }
  return res.data.data as T;
}

export function apiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiResponse<null> | undefined;
    return body?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default api;
