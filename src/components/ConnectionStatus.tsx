"use client";

import { Wifi, WifiOff, Loader2, Users } from "lucide-react";

type Status = "idle" | "connecting" | "waiting" | "matched" | "disconnected";

const LABELS: Record<Status, { text: string; color: string }> = {
  idle: { text: "Disconnesso", color: "var(--text-secondary)" },
  connecting: { text: "Connessione...", color: "var(--warning)" },
  waiting: { text: "In coda — cerco qualcuno", color: "var(--accent)" },
  matched: { text: "Connesso con un partner", color: "var(--success)" },
  disconnected: { text: "Connessione persa", color: "var(--danger)" },
};

export function ConnectionStatus({ status }: { status: Status }) {
  const info = LABELS[status];
  const Icon =
    status === "connecting" || status === "waiting"
      ? Loader2
      : status === "matched"
        ? Users
        : status === "disconnected"
          ? WifiOff
          : Wifi;

  return (
    <div
      className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full glass w-fit"
      style={{ color: info.color }}
    >
      <Icon className={`w-4 h-4 ${status === "connecting" || status === "waiting" ? "animate-spin" : ""}`} />
      <span>{info.text}</span>
      {status === "matched" && (
        <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
      )}
    </div>
  );
}
