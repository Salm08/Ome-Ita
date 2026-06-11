"use client";

import { useEffect, useRef } from "react";

export function useMatchSound(status: string) {
  const played = useRef(false);

  useEffect(() => {
    if (status === "matched") {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);

        if ("vibrate" in navigator) navigator.vibrate(100);
      } catch {
        // audio non disponibile
      }
      played.current = true;
    }
    if (status === "waiting") played.current = false;
  }, [status]);
}
