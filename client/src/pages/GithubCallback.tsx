import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import api, { unwrap } from "../api/client";

import type { PublicUser } from "@devconnect/shared";

/**
 * The backend completes the GitHub OAuth exchange,
 * sets the authentication cookie, and redirects the user here.
 *
 * This page verifies the session using /auth/me,
 * updates the React Query cache, and redirects to the dashboard.
 */
export default function GithubCallback() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    async function completeGithubLogin() {
      try {
        // Verify that the backend authentication cookie is valid
        const data = await unwrap<{ user: PublicUser }>(
          api.get("/auth/me")
        );

        // Update the authentication cache immediately
        queryClient.setQueryData(["auth", "me"], data);

        // Redirect authenticated user to dashboard
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("GitHub authentication failed:", error);

        // Redirect back to login if OAuth authentication failed
        navigate("/login", { replace: true });
      }
    }

    completeGithubLogin();
  }, [navigate, queryClient]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md text-center">
        <h1 className="text-2xl font-bold">
          Signing you in with GitHub...
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Please wait while we securely complete your authentication.
        </p>

        <div className="mt-6 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
        </div>
      </div>
    </div>
  );
}