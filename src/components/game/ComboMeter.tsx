"use client";

import { useGameStore } from "@/stores/game-store";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ComboMeter() {
  const comboCount = useGameStore((s) => s.stats.comboCount);
  const comboMultiplier = useGameStore((s) => s.comboMultiplier);

  // Determine visual tier
  const tier =
    comboCount >= 8 ? "max" :
    comboCount >= 5 ? "fire" :
    comboCount >= 3 ? "hot" :
    comboCount >= 1 ? "warm" :
    "none";

  return (
    <AnimatePresence>
      {comboCount > 0 && (
        <motion.div
          initial={{ scale: 0.3, opacity: 0, x: 20 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0.5, opacity: 0, x: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="fixed right-4 top-16 z-[85]"
        >
          <motion.div
            animate={
              tier === "max"
                ? { scale: [1, 1.06, 1] }
                : tier === "fire"
                  ? { scale: [1, 1.04, 1] }
                  : tier === "hot"
                    ? { scale: [1, 1.02, 1] }
                    : {}
            }
            transition={
              tier !== "warm"
                ? {
                    type: "tween",
                    duration: tier === "max" ? 0.8 : tier === "fire" ? 1 : 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : undefined
            }
            className={cn(
              "flex items-center gap-2.5 rounded-md border px-4 py-2 backdrop-blur-sm shadow-sm",
              tier === "max" && "border-amber-400/60 bg-amber-500/15",
              tier === "fire" && "border-orange-400/40 bg-orange-500/10",
              tier === "hot" && "border-amber-500/30 bg-amber-500/10",
              tier === "warm" && "border-primary/20 bg-card/90",
            )}
          >
            {/* Icon */}
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              tier === "max" && "bg-amber-500/20",
              tier === "fire" && "bg-orange-500/15",
              tier === "hot" && "bg-amber-500/10",
              tier === "warm" && "bg-primary/10",
            )}>
              {tier === "max" ? (
                <Crown className="h-4 w-4 text-amber-400" />
              ) : tier === "fire" || tier === "hot" ? (
                <Flame className={cn("h-4 w-4", tier === "fire" ? "text-orange-400" : "text-amber-400")} />
              ) : (
                <Zap className="h-4 w-4 text-primary" />
              )}
            </div>

            {/* Combo count */}
            <div className="flex flex-col items-center">
              <motion.span
                key={comboCount}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "text-xl font-semibold tabular-nums leading-none",
                  tier === "max" && "text-amber-400",
                  tier === "fire" && "text-orange-400",
                  tier === "hot" && "text-amber-300",
                  tier === "warm" && "text-primary",
                )}
              >
                {comboCount}
              </motion.span>
              <span className={cn(
                "text-[11px] font-semibold",
                tier === "max" ? "text-amber-500/70" :
                tier === "fire" ? "text-orange-500/70" :
                tier === "hot" ? "text-amber-500/60" :
                "text-muted-foreground/60",
              )}>
                COMBO
              </span>
            </div>

            {/* Multiplier */}
            <div className={cn(
              "rounded-lg px-2 py-1 text-sm font-semibold tabular-nums",
              tier === "max" && "bg-amber-500/20 text-amber-300",
              tier === "fire" && "bg-orange-500/15 text-orange-300",
              tier === "hot" && "bg-amber-500/10 text-amber-300/80",
              tier === "warm" && "bg-primary/10 text-primary",
            )}>
              {comboMultiplier.toFixed(2)}x
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
