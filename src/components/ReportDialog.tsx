"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";
import { REPORT_REASONS } from "@/lib/constants";
import type { PartnerInfo } from "@/hooks/useSocket";

interface ReportDialogProps {
  partner: PartnerInfo;
  isLoggedIn: boolean;
}

export function ReportDialog({ partner, isLoggedIn }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/reports/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          description: description || undefined,
          reportedUserId: partner.userId,
          partnerInfo: partner,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
        setDescription("");
      }, 2000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5 text-[var(--danger)] border-[var(--danger)]/30"
      >
        <Flag className="w-4 h-4" />
        Segnala
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60">
          <div className="glass rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Segnala utente</h3>
              <button onClick={() => setOpen(false)} className="text-[var(--text-secondary)] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isLoggedIn && (
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                Puoi segnalare anche come ospite. La segnalazione verrà esaminata dai moderatori.
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-1 block">Motivo</label>
                <select className="input-field" value={reason} onChange={(e) => setReason(e.target.value)}>
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-1 block">Dettagli (opzionale)</label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrivi il problema..."
                />
              </div>

              {status === "sent" && (
                <p className="text-[var(--success)] text-sm">Segnalazione inviata. Grazie.</p>
              )}
              {status === "error" && (
                <p className="text-[var(--danger)] text-sm">Errore nell&apos;invio. Riprova.</p>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={() => setOpen(false)} className="btn-secondary flex-1">Annulla</button>
                <button
                  onClick={submit}
                  disabled={status === "sending" || status === "sent"}
                  className="btn-danger flex-1"
                >
                  {status === "sending" ? "Invio..." : status === "sent" ? "Inviato" : "Invia segnalazione"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
