"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, Download, Trash2, Mail, CheckCircle } from "lucide-react";
import { GenderSelector } from "@/components/GenderSelector";
import { ITALIAN_REGIONS } from "@/lib/constants";
import type { Gender } from "@prisma/client";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [age, setAge] = useState(18);
  const [region, setRegion] = useState("Lombardia");
  const [stato, setStato] = useState("online");
  const [emailVerified, setEmailVerified] = useState(false);
  const [preferRegionMatch, setPreferRegionMatch] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    if (searchParams.get("verified") === "1") setMessage("Email verificata con successo!");
    if (searchParams.get("complete") === "1") setMessage("Account Google creato. Completa il tuo profilo.");
    const verifyLink = searchParams.get("verify");
    if (verifyLink) setMessage(`In dev, clicca per verificare: ${verifyLink}`);
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        setEmail(data.user.email);
        setGender(data.user.gender);
        setAge(data.user.age);
        setRegion(data.user.region);
        setStato(data.user.stato);
        setEmailVerified(data.user.emailVerified);
        setPreferRegionMatch(data.user.preferRegionMatch);
        setLoading(false);
      });
  }, [router, searchParams]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const body: Record<string, unknown> = { gender, age, region, stato, preferRegionMatch };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage("Profilo aggiornato");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore");
    } finally {
      setSaving(false);
    }
  };

  const sendVerifyEmail = async () => {
    const res = await fetch("/api/auth/verify-email/send", { method: "POST" });
    const data = await res.json();
    if (data.devVerifyLink) {
      setMessage(`Link verifica (dev): ${data.devVerifyLink}`);
    } else if (res.ok) {
      setMessage("Email di verifica inviata");
    } else {
      setError(data.error);
    }
  };

  const exportData = () => {
    window.open("/api/account/export", "_blank");
  };

  const deleteAccount = async () => {
    if (!confirm("Sei sicuro di voler eliminare definitivamente il tuo account?")) return;
    const res = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword, confirm: deleteConfirm }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/");
    } else {
      setError(data.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="text-center">
        <User className="w-10 h-10 text-[var(--accent)] mx-auto mb-2" />
        <h1 className="text-2xl font-bold">Il tuo profilo</h1>
        <p className="text-sm text-[var(--text-secondary)]">{email}</p>
      </div>

      {message && <div className="bg-[var(--success)]/10 text-[var(--success)] text-sm rounded-lg p-3">{message}</div>}
      {error && <div className="bg-[var(--danger)]/10 text-[var(--danger)] text-sm rounded-lg p-3">{error}</div>}

      {!emailVerified && (
        <div className="glass rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-[var(--warning)]" />
            Email non verificata
          </div>
          <button onClick={sendVerifyEmail} className="btn-secondary text-sm py-1.5 px-3">
            Invia verifica
          </button>
        </div>
      )}

      {emailVerified && (
        <div className="flex items-center gap-2 text-sm text-[var(--success)]">
          <CheckCircle className="w-4 h-4" /> Email verificata
        </div>
      )}

      <form onSubmit={saveProfile} className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-sm text-[var(--text-secondary)] mb-2 block">Sesso</label>
          <GenderSelector value={gender} onChange={setGender} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[var(--text-secondary)] mb-1 block">Età</label>
            <input type="number" className="input-field" value={age} onChange={(e) => setAge(Number(e.target.value))} min={18} max={99} />
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
          <input className="input-field" value={stato} onChange={(e) => setStato(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={preferRegionMatch} onChange={(e) => setPreferRegionMatch(e.target.checked)} className="accent-[var(--accent)]" />
          Preferisci match dalla mia regione
        </label>

        <hr className="border-[var(--border)]" />
        <p className="text-sm font-medium">Cambia password</p>
        <input type="password" className="input-field" placeholder="Password attuale" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <input type="password" className="input-field" placeholder="Nuova password (min. 8)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? "Salvataggio..." : "Salva modifiche"}
        </button>
      </form>

      <div className="glass rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Download className="w-4 h-4" /> I tuoi dati (GDPR)
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Scarica una copia di tutti i dati che conserviamo sul tuo account.
        </p>
        <button onClick={exportData} className="btn-secondary w-full">Esporta i miei dati</button>
      </div>

      <div className="glass rounded-2xl p-6 space-y-3 border border-[var(--danger)]/20">
        <h2 className="font-semibold text-[var(--danger)] flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Elimina account
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Questa azione è irreversibile. Tutti i tuoi dati verranno eliminati.
        </p>
        <input type="password" className="input-field" placeholder="Password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
        <input className="input-field" placeholder='Scrivi "ELIMINA" per confermare' value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
        <button onClick={deleteAccount} className="btn-danger w-full">Elimina definitivamente</button>
      </div>

      <p className="text-center text-sm">
        <Link href="/" className="text-[var(--accent)] underline">Torna alla home</Link>
      </p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-60px)]">Caricamento...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
