import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useLogin } from "../api/hooks/useAuth";
import { apiErrorMessage } from "../api/client";

export default function Login() {
  const login = useLogin();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Backend API URL
  const apiBase =
    import.meta.env.VITE_API_URL ||
    "https://devconnect-dt2y.onrender.com/api";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    try {
      await login.mutateAsync(form);

      navigate("/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err, "Login failed"));
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-bold">
          Welcome back
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Log in to your DevConnect account
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Email Login */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col"
        >
          <label className="label" htmlFor="email">
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <label
            className="label"
            htmlFor="password"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            className="input"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <button
            type="submit"
            className="btn-primary mt-6"
            disabled={login.isPending}
          >
            {login.isPending
              ? "Logging in..."
              : "Log in"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />

          <span>OR</span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* GitHub OAuth Login */}
        <a
          href={`${apiBase}/auth/github`}
          className="btn-secondary w-full"
        >
          Continue with GitHub
        </a>

        <p className="mt-4 text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-brand-600"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}