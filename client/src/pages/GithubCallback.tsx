import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

/**
 * The server sets the auth cookie and redirects here after a successful
 * GitHub OAuth exchange. We just need to refetch /auth/me and move on —
 * App.tsx's auth bootstrap will pick up the new session.
 */
export default function GithubCallback() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    qc.invalidateQueries({ queryKey: ["auth", "me"] }).finally(() => {
      navigate("/dashboard", { replace: true });
    });
  }, [qc, navigate]);

  return <div className="py-24 text-center text-gray-500">Signing you in with GitHub...</div>;
}
