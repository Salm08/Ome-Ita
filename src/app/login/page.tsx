"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { GOOGLE_LOGIN_ERRORS } from "@/lib/auth-errors";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      setError(GOOGLE_LOGIN_ERRORS[err] || "Errore durante l'accesso.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore durante il login");
        return;
      }
      router.push("/");
    } catch {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center px-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <LogIn className="w-10 h-10 text-[var(--accent)] mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Accedi</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Bentornato su Ome Ita</p>
        </div>

        <GoogleSignInButton label="Accedi con Google" />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--bg-card)] px-2 text-[var(--text-secondary)]">oppure con email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-[var(--text-secondary)] mb-1 block">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-[var(--text-secondary)] mb-1 block">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Accesso..." : "Accedi"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          Non hai un account?{" "}
          <Link href="/register" className="text-[var(--accent)] underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-60px)]">Caricamento...</div>}>
      <LoginForm />
    </Suspense>
  );
}
