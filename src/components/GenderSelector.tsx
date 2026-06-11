"use client";

import type { Gender } from "@prisma/client";

const OPTIONS: { value: Gender; label: string; emoji: string }[] = [
  { value: "MALE", label: "Uomo", emoji: "👨" },
  { value: "FEMALE", label: "Donna", emoji: "👩" },
  { value: "COUPLE", label: "Coppia", emoji: "👫" },
];

export function GenderSelector({
  value,
  onChange,
}: {
  value: Gender;
  onChange: (g: Gender) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`p-4 rounded-xl border-2 transition-all text-center ${
            value === opt.value
              ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-lg shadow-[var(--accent-glow)]"
              : "border-[var(--border)] hover:border-[var(--accent)]/50 bg-white/5"
          }`}
        >
          <span className="text-2xl block mb-1">{opt.emoji}</span>
          <span className="text-sm font-medium">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
