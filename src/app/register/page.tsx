"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { GenderSelector } from "@/components/GenderSelector";
import { ITALIAN_REGIONS } from "@/lib/constants";
import type { Gender } from "@prisma/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [age, setAge] = useState(18);
  const [region, setRegion] = useState("Lombardia");
  const [stato, setStato] = useState("online");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Devi accettare i termini di servizio e la privacy policy");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, gender, age, region, stato }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore durante la registrazione");
        return;
      }
      if (data.devVerifyLink) {
        router.push(`/profile?verify=${encodeURIComponent(data.devVerifyLink)}`);
      } else {
        router.push("/profile");
      }
    } catch {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center px-4 py-8">
      <div className="glass rounded-2xl p-8 w-full max-w-lg animate-fade-in">
        <div className="text-center mb-6">
          <UserPlus className="w-10 h-10 text-[var(--accent)] mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Registrati</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Crea il tuo account su Ome Ita (solo 18+)
          </p>
        </div>

        <GoogleSignInButton label="Registrati con Google" />

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
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="text-sm text-[var(--text-secondary)] mb-1 block">Password (min. 8 caratteri)</label>
            <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          </div>

          <div>
            <label className="text-sm text-[var(--text-secondary)] mb-2 block">Sesso</label>
            <GenderSelector value={gender} onChange={setGender} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-1 block">Età</label>
              <input type="number" className="input-field" value={age} onChange={(e) => setAge(Number(e.target.value))} min={18} max={99} required />
            </div>
            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-1 block">Regione</label>
              <select className="input-field" value={region} onChange={(e) => setRegion(e.target.value)}>
                {ITALIAN_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-[var(--text-secondary)] mb-1 block">Stato</label>
            <input className="input-field" value={stato} onChange={(e) => setStato(e.target.value)} placeholder="es. online, single..." />
          </div>

          <label className="flex items-start gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 accent-[var(--accent)]"
            />
            <span>
              Dichiaro di avere almeno 18 anni e accetto i{" "}
              <Link href="/termini" className="text-[var(--accent)] underline">Termini di Servizio</Link>{" "}
              e la{" "}
              <Link href="/privacy" className="text-[var(--accent)] underline">Privacy Policy</Link>
            </span>
          </label>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Registrazione..." : "Crea Account"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          Hai già un account?{" "}
          <Link href="/login" className="text-[var(--accent)] underline">Accedi</Link>
        </p>
      </div>
    </div>
  );
}
