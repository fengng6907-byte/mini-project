"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-gold shimmer">GOLD</span>{" "}
            <span className="text-foreground">Eyes</span>
          </h1>
          <p className="text-muted text-sm mt-2">Trading Simulator</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-5">
            {mode === "login" ? "Sign In" : "Create Account"}
          </h2>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs text-muted mb-1">Display Name (optional)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Gold Trader"
                  className="w-full bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold/50 transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-muted mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="w-full bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••"
                required
                minLength={6}
                className="w-full bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-background font-semibold py-2.5 rounded-xl text-sm hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-5">
            {mode === "login" ? (
              <>
                No account?{" "}
                <Link href="/register" className="text-gold hover:underline">
                  Register
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="text-gold hover:underline">
                  Sign In
                </Link>
              </>
            )}
          </p>
        </div>

        {mode === "register" && (
          <p className="text-center text-xs text-muted mt-4">
            Start with a virtual <span className="text-gold">$10,000</span> balance.
          </p>
        )}
      </div>
    </div>
  );
}
