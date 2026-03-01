"use client";

import { useLearnStore } from "@/stores/learn-store";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface HeartsDisplayProps {
  compact?: boolean;
}

function computeRegenHearts(currentHearts: number, lastHeartLoss: number): number {
  if (currentHearts >= 5 || lastHeartLoss === 0) return 5;
  const elapsed = Date.now() - lastHeartLoss;
  const hoursElapsed = Math.floor(elapsed / (1000 * 60 * 60));
  return Math.min(5, currentHearts + hoursElapsed);
}

export function HeartsDisplay({ compact }: HeartsDisplayProps) {
  const hearts = useLearnStore((s) => s.hearts);
  const lastHeartLoss = useLearnStore((s) => s.lastHeartLoss);
  const [regenTimer, setRegenTimer] = useState("");

  const effectiveHearts = computeRegenHearts(hearts, lastHeartLoss);

  useEffect(() => {
    if (effectiveHearts >= 5) {
      setRegenTimer("");
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - lastHeartLoss;
      const msPerHeart = 60 * 60 * 1000;
      const partialMs = elapsed % msPerHeart;
      const remaining = msPerHeart - partialMs;
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setRegenTimer(`${mins}:${secs.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const id = setInterval(updateTimer, 1000);
    return () => clearInterval(id);
  }, [effectiveHearts, lastHeartLoss]);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
        <span className="text-xs font-bold tabular-nums">{effectiveHearts}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{
            scale: i < effectiveHearts ? 1 : 0.8,
            opacity: i < effectiveHearts ? 1 : 0.3,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              i < effectiveHearts
                ? "fill-red-500 text-red-500"
                : "fill-none text-muted-foreground",
            )}
          />
        </motion.div>
      ))}
      {regenTimer && (
        <span className="ml-1 text-[10px] tabular-nums text-muted-foreground">
          {regenTimer}
        </span>
      )}
    </div>
  );
}
