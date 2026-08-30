import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../api/hooks/useAuth";
import { apiErrorMessage } from "../api/client";

export default function Register() {
  const register = useRegister();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", headline: "" });
  const [error, setError] = useState("");

  const apiBase = import.meta.env.VITE_API_URL || "/api";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await register.mutateAsync(form);
      navigate("/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err, "Registration failed"));
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">Join the DevConnect community</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="label">Full name</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label className="label">Email</label>
          <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <label className="label">Password</label>
          <input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <label className="label">Headline (optional)</label>
          <input placeholder="e.g. Frontend Developer" className="input" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />

          <button className="btn-primary mt-6" disabled={register.isPending}>
            {register.isPending ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" /> OR <div className="h-px flex-1 bg-gray-200" />
        </div>

        <a href={`${apiBase}/auth/github`} className="btn-secondary w-full">
          Continue with GitHub
        </a>

        <p className="mt-4 text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-brand-600 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
