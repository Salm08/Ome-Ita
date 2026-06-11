"use client";

import { useRouter } from "next/navigation";
import { Square, SkipForward } from "lucide-react";

export function ActionButtons({ onStop, onSkip }: { onStop: () => void; onSkip: () => void }) {
  const router = useRouter();

  const handleStop = () => {
    onStop();
    router.push("/");
  };

  return (
    <div className="flex gap-3 justify-center">
      <button onClick={handleStop} className="btn-danger flex items-center gap-2">
        <Square className="w-4 h-4" />
        Stop
      </button>
      <button onClick={onSkip} className="btn-skip flex items-center gap-2">
        <SkipForward className="w-4 h-4" />
        Prossimo
      </button>
    </div>
  );
}
