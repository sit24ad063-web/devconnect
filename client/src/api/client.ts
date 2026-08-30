import axios from "axios";

import type { ApiResponse } from "@devconnect/shared";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://devconnect-dt2y.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/**
 * Unwraps the { success, data, message } envelope
 * returned by API endpoints.
 */
export async function unwrap<T>(
  promise: Promise<{ data: ApiResponse<T> }>
): Promise<T> {
  const res = await promise;

  if (!res.data.success) {
    throw new Error(res.data.message || "Request failed");
  }

  return res.data.data as T;
}

export function apiErrorMessage(
  err: unknown,
  fallback = "Something went wrong"
): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiResponse<null> | undefined;

    return body?.message || err.message || fallback;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
}

export default api;