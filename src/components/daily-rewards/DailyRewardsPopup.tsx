"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Gift, Check, Lock, Crown, Sparkles, X } from "lucide-react";
import { useDailyRewardsStore, DAY_REWARDS } from "@/stores/daily-rewards-store";
import { soundEngine } from "@/services/audio/sound-engine";

export function DailyRewardsPopup() {
  const canClaim = useDailyRewardsStore((s) => s.canClaimToday());
  const claimedDays = useDailyRewardsStore((s) => s.claimedDays);
  const getCurrentDay = useDailyRewardsStore((s) => s.getCurrentDay);
  const claimToday = useDailyRewardsStore((s) => s.claimToday);
  const streakCount = useDailyRewardsStore((s) => s.streakCount);

  const [show, setShow] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; angle: number }>>([]);

  // Auto-show on mount if claimable
  useEffect(() => {
    if (canClaim) {
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, [canClaim]);

  const handleClaim = useCallback(() => {
    if (claimed) return;
    const xp = claimToday();
    if (xp > 0) {
      setEarnedXP(xp);
      setClaimed(true);
      soundEngine.playAchievement();

      // Spawn confetti particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 40,
        y: 50 + (Math.random() - 0.5) * 20,
        angle: Math.random() * 360,
      }));
      setParticles(newParticles);

      // Auto-dismiss after delay
      setTimeout(() => {
        setShow(false);
        setClaimed(false);
        setParticles([]);
      }, 2000);
    }
  }, [claimed, claimToday]);

  const handleClose = useCallback(() => {
    setShow(false);
  }, []);

  const currentDay = getCurrentDay();
  const dayIndex = currentDay === -1 ? 0 : currentDay;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative w-[380px] rounded-2xl border border-amber-500/30 bg-card px-6 py-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center gap-2 mb-5">
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
              >
                <Gift className="h-7 w-7 text-amber-400" />
              </motion.div>
              <h2 className="text-lg font-black">Daily Rewards</h2>
              <p className="text-[11px] text-muted-foreground">
                {streakCount > 0
                  ? `${streakCount} day streak! Keep it going!`
                  : "Log in daily to earn bonus XP!"}
              </p>
            </div>

            {/* 7-day grid */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {DAY_REWARDS.map((xp, i) => {
                const isClaimed = claimedDays.includes(i);
                const isCurrent = i === dayIndex && canClaim && !claimed;
                const isDay7 = i === 6;
                const isFuture = i > dayIndex && !isClaimed;

                return (
                  <motion.div
                    key={i}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border px-2.5 py-2.5 transition-all",
                      isClaimed
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : isCurrent
                          ? "border-amber-500/40 bg-amber-500/10 daily-reward-glow"
                          : "border-border/50 bg-muted/10 opacity-50",
                      isDay7 && !isClaimed && !isFuture && "border-amber-400/50",
                    )}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: isFuture && !isClaimed ? 0.5 : 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      Day {i + 1}
                    </span>

                    <div className="flex h-8 w-8 items-center justify-center">
                      {isClaimed ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          <Check className="h-5 w-5 text-emerald-400" />
                        </motion.div>
                      ) : isFuture ? (
                        <Lock className="h-4 w-4 text-muted-foreground/40" />
                      ) : isDay7 ? (
                        <Crown className="h-5 w-5 text-amber-400" />
                      ) : (
                        <Gift className={cn("h-5 w-5", isCurrent ? "text-amber-400" : "text-muted-foreground/60")} />
                      )}
                    </div>

                    <span className={cn(
                      "text-[10px] font-black tabular-nums",
                      isClaimed ? "text-emerald-400" : isCurrent ? "text-amber-400" : "text-muted-foreground/60",
                    )}>
                      +{xp} XP
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Claim button */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {claimed ? (
                <motion.div
                  className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-5 py-2.5"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-black text-emerald-400">+{earnedXP} XP Claimed!</span>
                </motion.div>
              ) : canClaim ? (
                <button
                  type="button"
                  onClick={handleClaim}
                  className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-black text-white transition-all hover:bg-amber-400 hover:scale-105 active:scale-95"
                >
                  Claim Day {dayIndex + 1} Reward
                </button>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-muted/15 px-5 py-2.5">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-bold text-muted-foreground">Today's reward claimed!</span>
                </div>
              )}
            </motion.div>

            {/* Confetti particles */}
            <AnimatePresence>
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    backgroundColor: ["#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"][p.id % 5],
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [1, 1, 0],
                    x: (Math.cos((p.angle * Math.PI) / 180) * 80),
                    y: (Math.sin((p.angle * Math.PI) / 180) * 80) - 40,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
