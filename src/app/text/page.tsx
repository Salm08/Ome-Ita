"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { useMatchSound } from "@/hooks/useMatchSound";
import { PartnerInfoBar } from "@/components/PartnerInfo";
import { ChatBox } from "@/components/ChatBox";
import { ActionButtons } from "@/components/ActionButtons";
import { ReportDialog } from "@/components/ReportDialog";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { OnboardingModal } from "@/components/OnboardingModal";
import type { Gender } from "@prisma/client";

interface Prefs {
  gender: Gender;
  region: string;
  stato: string;
  userId?: string;
  age?: number;
  isAdmin?: boolean;
  adminGenderFilter?: Gender | null;
  preferRegionMatch?: boolean;
}

export default function TextPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [started, setStarted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("ome_prefs");
    if (!raw) {
      router.push("/");
      return;
    }
    setPrefs(JSON.parse(raw));
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setIsLoggedIn(!!d.user));
  }, [router]);

  const socketOpts = useMemo(
    () =>
      prefs
        ? {
            mode: "text" as const,
            gender: prefs.gender,
            region: prefs.region,
            stato: prefs.stato,
            age: prefs.age,
            userId: prefs.userId,
            isAdmin: prefs.isAdmin,
            adminGenderFilter: prefs.adminGenderFilter,
            preferRegionMatch: prefs.preferRegionMatch,
          }
        : null,
    [prefs]
  );

  const {
    status,
    partner,
    messages,
    partnerTyping,
    banned,
    connect,
    skip,
    stop,
    sendMessage,
    sendTyping,
  } = useSocket(socketOpts || { mode: "text", gender: "MALE", region: "", stato: "" });

  useMatchSound(status);

  useEffect(() => {
    if (prefs && !started) {
      connect();
      setStarted(true);
    }
  }, [prefs, started, connect]);

  if (!prefs) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (banned) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[var(--danger)]">Accesso bloccato</h2>
        <p className="text-[var(--text-secondary)]">{banned.reason || "Il tuo accesso è stato sospeso."}</p>
        <button onClick={() => router.push("/")} className="btn-primary">Torna alla home</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 animate-fade-in">
      <OnboardingModal mode="text" />
      <ConnectionStatus status={status} />

      {status === "waiting" || status === "connecting" ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <MessageCircle className="w-12 h-12 text-[var(--accent)] animate-pulse" />
          <h2 className="text-xl font-semibold">Cerco qualcuno con cui chattare...</h2>
          <p className="text-[var(--text-secondary)]">Attendi il match</p>
          <ActionButtons onStop={stop} onSkip={skip} />
        </div>
      ) : status === "matched" && partner ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PartnerInfoBar partner={partner} />
            <ReportDialog partner={partner} isLoggedIn={isLoggedIn} />
          </div>

          <div className="glass rounded-2xl overflow-hidden min-h-[60vh] flex flex-col">
            <ChatBox
              messages={messages}
              onSend={sendMessage}
              onTyping={sendTyping}
              partnerTyping={partnerTyping}
            />
          </div>

          <ActionButtons onStop={stop} onSkip={skip} />
        </>
      ) : null}
    </div>
  );
}
