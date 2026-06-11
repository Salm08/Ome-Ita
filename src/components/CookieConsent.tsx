"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = (type: "all" | "essential") => {
    localStorage.setItem(
      "cookie_consent",
      JSON.stringify({ type, date: new Date().toISOString() })
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto glass rounded-2xl p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <Cookie className="w-6 h-6 text-[var(--accent)] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Utilizzo dei Cookie</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Utilizziamo cookie tecnici necessari al funzionamento del sito e cookie analitici
              (solo con il tuo consenso) per migliorare l&apos;esperienza. Per maggiori
              informazioni consulta la nostra{" "}
              <Link href="/cookie-policy" className="text-[var(--accent)] underline">
                Cookie Policy
              </Link>{" "}
              e la{" "}
              <Link href="/privacy" className="text-[var(--accent)] underline">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => accept("all")} className="btn-primary text-sm py-2 px-4">
                Accetta tutti
              </button>
              <button onClick={() => accept("essential")} className="btn-secondary text-sm py-2 px-4">
                Solo necessari
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
