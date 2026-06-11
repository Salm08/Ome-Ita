"use client";

import { MapPin, User, Heart } from "lucide-react";
import { GENDER_LABELS } from "@/lib/constants";
import type { PartnerInfo as PartnerInfoType } from "@/hooks/useSocket";

export function PartnerInfoBar({ partner }: { partner: PartnerInfoType }) {
  return (
    <div className="glass rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-3 text-sm">
      <span className="flex items-center gap-1.5">
        <User className="w-4 h-4 text-[var(--accent)]" />
        <span className="font-medium">{GENDER_LABELS[partner.gender]}</span>
      </span>
      <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
        <MapPin className="w-3.5 h-3.5" />
        {partner.region}
      </span>
      <span className="text-[var(--text-secondary)]">
        Stato: <span className="text-[var(--success)]">{partner.stato}</span>
      </span>
      {partner.isRegistered && partner.age && (
        <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Heart className="w-3.5 h-3.5" />
          {partner.age} anni
        </span>
      )}
      {!partner.isRegistered && (
        <span className="text-xs text-[var(--text-secondary)] italic">Ospite</span>
      )}
    </div>
  );
}
