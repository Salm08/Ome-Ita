"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Video, MessageCircle, Users, Shield, Zap } from "lucide-react";
import { OnboardingModal } from "@/components/OnboardingModal";
import { GenderSelector } from "@/components/GenderSelector";
import { ITALIAN_REGIONS } from "@/lib/constants";
import type { Gender } from "@prisma/client";

interface SessionUser {
  id: string;
  email: string;
  gender: Gender;
  age: number;
  region: string;
  stato: string;
  role: string;
  preferRegionMatch?: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [gender, setGender] = useState<Gender>("MALE");
  const [region, setRegion] = useState("Lombardia");
  const [stato, setStato] = useState("online");
  const [session, setSession] = useState<SessionUser | null>(null);
  const [preferRegionMatch, setPreferRegionMatch] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setSession(data.user);
          setGender(data.user.gender);
          setRegion(data.user.region);
          setStato(data.user.stato);
          setPreferRegionMatch(data.user.preferRegionMatch || false);
        }
      });
  }, []);

  const savePrefs = () => {
    sessionStorage.setItem(
      "ome_prefs",
      JSON.stringify({
        gender,
        region,
        stato,
        userId: session?.id,
        age: session?.age,
        isAdmin: session?.role === "ADMIN",
        preferRegionMatch,
      })
    );
  };

  const startVideo = () => {
    savePrefs();
    router.push("/video");
  };

  const startText = () => {
    savePrefs();
    router.push("/text");
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col">
      <OnboardingModal />
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Incontra persone{" "}
            <span className="bg-gradient-to-r from-[var(--accent)] to-[#a29bfe] bg-clip-text text-transparent">
              a caso
            </span>{" "}
            in Italia
          </h1>
          <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-lg mx-auto">
            Videochat e chat testuale anonima con persone di tutta Italia. Scegli la modalità e inizia subito.
          </p>

          {/* Mode Selection */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={startVideo}
              className="glass rounded-2xl p-6 text-left hover:border-[var(--accent)] border border-transparent transition-all group"
            >
              <Video className="w-10 h-10 text-[var(--accent)] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-1">Video Chat</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Vedi, senti e chatta con sconosciuti in tempo reale
              </p>
            </button>
            <button
              onClick={startText}
              className="glass rounded-2xl p-6 text-left hover:border-[var(--accent)] border border-transparent transition-all group"
            >
              <MessageCircle className="w-10 h-10 text-[var(--accent)] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-1">Solo Testo</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Chatta solo con messaggi, senza video
              </p>
            </button>
          </div>

          {/* Preferences */}
          <div className="glass rounded-2xl p-6 text-left space-y-5">
            <h3 className="font-semibold text-center">Le tue preferenze</h3>

            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-2 block">Il tuo sesso</label>
              <GenderSelector value={gender} onChange={setGender} />
            </div>

            {!session && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">Regione</label>
                  <select className="input-field" value={region} onChange={(e) => setRegion(e.target.value)}>
                    {ITALIAN_REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">Stato</label>
                  <input
                    className="input-field"
                    value={stato}
                    onChange={(e) => setStato(e.target.value)}
                    placeholder="es. online, single..."
                  />
                </div>
              </div>
            )}

            {session && (
              <p className="text-sm text-[var(--text-secondary)] text-center">
                Profilo: {session.email} — {region}, {stato}
              </p>
            )}

            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer justify-center">
              <input
                type="checkbox"
                checked={preferRegionMatch}
                onChange={(e) => setPreferRegionMatch(e.target.checked)}
                className="accent-[var(--accent)]"
              />
              Preferisci match dalla mia regione
            </label>

            {!session && (
              <p className="text-xs text-[var(--text-secondary)] text-center">
                <Link href="/register" className="text-[var(--accent)] underline">Registrati</Link> per mostrare la tua età e salvare le preferenze
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-12 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <Users className="w-8 h-8 text-[var(--accent)] mx-auto" />
            <h4 className="font-semibold">Match Random</h4>
            <p className="text-sm text-[var(--text-secondary)]">Connettiti istantaneamente con persone nuove</p>
          </div>
          <div className="space-y-2">
            <Shield className="w-8 h-8 text-[var(--accent)] mx-auto" />
            <h4 className="font-semibold">Sicuro</h4>
            <p className="text-sm text-[var(--text-secondary)]">Segnalazioni, moderazione e privacy GDPR</p>
          </div>
          <div className="space-y-2">
            <Zap className="w-8 h-8 text-[var(--accent)] mx-auto" />
            <h4 className="font-semibold">Veloce</h4>
            <p className="text-sm text-[var(--text-secondary)]">Skip istantaneo per trovare qualcuno di nuovo</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-6 border-t border-[var(--border)] text-center text-sm text-[var(--text-secondary)]">
        <div className="flex flex-wrap justify-center gap-4 mb-2">
          <Link href="/privacy" className="hover:text-[var(--accent)]">Privacy Policy</Link>
          <Link href="/cookie-policy" className="hover:text-[var(--accent)]">Cookie Policy</Link>
          <Link href="/come-funziona" className="hover:text-[var(--accent)]">Come funziona</Link>
          <Link href="/termini" className="hover:text-[var(--accent)]">Termini di Servizio</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Ome Ita. Tutti i diritti riservati. Solo per maggiorenni (18+).</p>
      </footer>
    </div>
  );
}
