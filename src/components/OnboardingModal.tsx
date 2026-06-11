"use client";

import { useEffect, useState } from "react";
import { Video, MessageCircle, Shield, X } from "lucide-react";
import Link from "next/link";

export function OnboardingModal({ mode }: { mode?: "video" | "text" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const key = mode ? `onboarding_${mode}` : "onboarding_home";
    if (!localStorage.getItem(key)) setVisible(true);
  }, [mode]);

  const dismiss = () => {
    const key = mode ? `onboarding_${mode}` : "onboarding_home";
    localStorage.setItem(key, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70">
      <div className="glass rounded-2xl p-6 max-w-md w-full animate-fade-in relative">
        <button onClick={dismiss} className="absolute top-4 right-4 text-[var(--text-secondary)]">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-2">
          {mode === "video" ? "Prima della videochat" : mode === "text" ? "Prima della chat" : "Benvenuto su Ome Ita"}
        </h2>

        <ul className="space-y-3 text-sm text-[var(--text-secondary)] my-4">
          {mode === "video" && (
            <li className="flex gap-2">
              <Video className="w-5 h-5 text-[var(--accent)] shrink-0" />
              Consenti l&apos;accesso a webcam e microfono quando richiesto dal browser.
            </li>
          )}
          {mode === "text" && (
            <li className="flex gap-2">
              <MessageCircle className="w-5 h-5 text-[var(--accent)] shrink-0" />
              Chatta in anonimo con persone di tutta Italia.
            </li>
          )}
          <li className="flex gap-2">
            <Shield className="w-5 h-5 text-[var(--accent)] shrink-0" />
            Non condividere dati personali. Usa &quot;Segnala&quot; per comportamenti inappropriati.
          </li>
          <li>Devi avere almeno 18 anni. Leggi i <Link href="/termini" className="text-[var(--accent)] underline">Termini</Link>.</li>
        </ul>

        <button onClick={dismiss} className="btn-primary w-full">
          Ho capito, inizia
        </button>
      </div>
    </div>
  );
}
