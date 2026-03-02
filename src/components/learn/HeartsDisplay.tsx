"use client";

import { useLearnStore } from "@/stores/learn-store";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

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
  // Track which heart index was just lost for shake animation
  const [lostIndex, setLostIndex] = useState<number | null>(null);
  const prevEffectiveRef = useRef<number | null>(null);

  const effectiveHearts = computeRegenHearts(hearts, lastHeartLoss);

  // Detect heart loss → trigger shake on the newly-empty slot
  useEffect(() => {
    if (prevEffectiveRef.current !== null && effectiveHearts < prevEffectiveRef.current) {
      const newLost = effectiveHearts; // the index of the heart that just disappeared
      setLostIndex(newLost);
      const t = setTimeout(() => setLostIndex(null), 700);
      return () => clearTimeout(t);
    }
    prevEffectiveRef.current = effectiveHearts;
  }, [effectiveHearts]);

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
        <motion.div
          animate={lostIndex !== null ? { x: [-3, 3, -3, 3, 0] } : {}}
          transition={{ duration: 0.35 }}
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5 transition-colors duration-300",
              effectiveHearts > 0 ? "fill-red-500 text-red-500" : "fill-none text-muted-foreground",
            )}
          />
        </motion.div>
        <span className="text-xs font-bold tabular-nums">{effectiveHearts}</span>
        {effectiveHearts >= 5 ? (
          <span className="text-[9px] font-bold text-emerald-400">Full ✓</span>
        ) : regenTimer ? (
          <span className="text-[9px] tabular-nums text-muted-foreground">{regenTimer}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const active = i < effectiveHearts;
        const isJustLost = i === lostIndex;

        return (
          <AnimatePresence key={i} mode="wait">
            <motion.div
              key={`${i}-${active}`}
              initial={isJustLost ? { scale: 1.4, rotate: -15 } : false}
              animate={{
                scale: active ? 1 : 0.78,
                opacity: active ? 1 : 0.28,
                rotate: 0,
              }}
              transition={{
                scale: { type: "spring", stiffness: 400, damping: 18 },
                opacity: { duration: 0.25 },
              }}
            >
              <motion.div
                animate={isJustLost ? { x: [-4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Heart
                  className={cn(
                    "h-5 w-5 transition-colors duration-300",
                    active
                      ? "fill-red-500 text-red-500"
                      : "fill-none text-muted-foreground/40",
                  )}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        );
      })}
      {regenTimer && (
        <motion.span
          className="ml-1 text-[10px] tabular-nums text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {regenTimer}
        </motion.span>
      )}
    </div>
  );
}
