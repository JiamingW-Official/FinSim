"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Lock, X, Crown, Flame } from "lucide-react";
import { useDailyRewardsStore, DAY_REWARDS } from "@/stores/daily-rewards-store";
import { soundEngine } from "@/services/audio/sound-engine";

const DAY_EMOJIS = ["🎁", "⭐", "💰", "🔥", "💎", "🚀", "👑"];

// Confetti colors and shapes
const CONFETTI_COLORS = ["#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#3b82f6"];

export function DailyRewardsPopup() {
  const canClaim = useDailyRewardsStore((s) => s.canClaimToday());
  const claimedDays = useDailyRewardsStore((s) => s.claimedDays);
  const getCurrentDay = useDailyRewardsStore((s) => s.getCurrentDay);
  const claimToday = useDailyRewardsStore((s) => s.claimToday);
  const streakCount = useDailyRewardsStore((s) => s.streakCount);

  const [show, setShow] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [particles, setParticles] = useState<Array<{
    id: number; x: number; y: number;
    tx: number; ty: number;
    color: string; rotate: number; shape: "circle" | "rect";
  }>>([]);

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

      // 40 confetti particles from center
      const newParticles = Array.from({ length: 40 }, (_, i) => {
        const angle = (i / 40) * Math.PI * 2;
        const spread = 80 + Math.random() * 80;
        return {
          id: i,
          x: 50,
          y: 50,
          tx: Math.cos(angle) * spread,
          ty: Math.sin(angle) * spread - 60,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          rotate: Math.random() * 360,
          shape: (i % 3 === 0 ? "rect" : "circle") as "circle" | "rect",
        };
      });
      setParticles(newParticles);

      setTimeout(() => {
        setShow(false);
        setClaimed(false);
        setParticles([]);
      }, 2400);
    }
  }, [claimed, claimToday]);

  const handleClose = useCallback(() => setShow(false), []);

  const currentDay = getCurrentDay();
  const dayIndex = currentDay === -1 ? 0 : currentDay;
  const todayXP = DAY_REWARDS[dayIndex] ?? DAY_REWARDS[0];
  const isDay7 = dayIndex === 6;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="relative w-[420px] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              title="Close"
              aria-label="Close"
              className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Top gradient band */}
            <div className={cn(
              "relative flex flex-col items-center gap-2 px-6 pt-6 pb-4",
              isDay7
                ? "bg-gradient-to-b from-amber-500/15 to-transparent"
                : "bg-gradient-to-b from-primary/10 to-transparent",
            )}>
              {/* Animated icon */}
              <motion.div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl text-3xl border",
                  isDay7
                    ? "border-amber-400/40 bg-amber-500/15"
                    : "border-primary/30 bg-primary/10",
                )}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: [0, 1.2, 1], rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
              >
                {isDay7 ? "👑" : "🎁"}
              </motion.div>

              <div className="text-center">
                <h2 className="text-xl font-black tracking-tight">Daily Check-In</h2>
                {streakCount > 0 ? (
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-[12px] font-bold text-orange-400">
                      {streakCount} day streak!
                    </span>
                  </div>
                ) : (
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    Log in daily to earn bonus XP
                  </p>
                )}
              </div>
            </div>

            {/* 7-day grid */}
            <div className="px-5 pb-2">
              <div className="grid grid-cols-7 gap-1.5">
                {DAY_REWARDS.map((xp, i) => {
                  const isClaimed = claimedDays.includes(i);
                  const isCurrent = i === dayIndex && canClaim && !claimed;
                  const isFuture = i > dayIndex && !isClaimed;
                  const isLastDay = i === 6;

                  return (
                    <motion.div
                      key={i}
                      className={cn(
                        "relative flex flex-col items-center gap-1 rounded-xl border py-2.5 px-1 transition-all",
                        isClaimed
                          ? "border-emerald-500/40 bg-emerald-500/8"
                          : isCurrent
                            ? isLastDay
                              ? "border-amber-400/60 bg-amber-500/12 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                              : "border-primary/50 bg-primary/10 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                            : "border-border/30 bg-muted/5 opacity-50",
                        isLastDay && !isClaimed && !isFuture && "border-amber-400/50",
                      )}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: isFuture ? 0.45 : 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.045, type: "spring", stiffness: 300, damping: 22 }}
                    >
                      {/* Day label */}
                      <span className={cn(
                        "text-[8px] font-bold uppercase tracking-wider",
                        isCurrent ? (isLastDay ? "text-amber-400" : "text-primary") : "text-muted-foreground/60",
                      )}>
                        D{i + 1}
                      </span>

                      {/* Icon */}
                      <div className="flex h-7 w-7 items-center justify-center">
                        {isClaimed ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          >
                            <Check className="h-4 w-4 text-emerald-400" />
                          </motion.div>
                        ) : isFuture ? (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground/30" />
                        ) : (
                          <motion.span
                            className="text-base leading-none"
                            animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                          >
                            {isLastDay ? <Crown className="h-4 w-4 text-amber-400" /> : DAY_EMOJIS[i]}
                          </motion.span>
                        )}
                      </div>

                      {/* XP label */}
                      <span className={cn(
                        "text-[9px] font-black tabular-nums leading-tight",
                        isClaimed
                          ? "text-emerald-400"
                          : isCurrent
                            ? isLastDay ? "text-amber-400" : "text-primary"
                            : "text-muted-foreground/40",
                      )}>
                        +{xp}
                      </span>

                      {/* Current day pulse ring */}
                      {isCurrent && !claimed && (
                        <motion.div
                          className={cn(
                            "absolute inset-0 rounded-xl border-2",
                            isLastDay ? "border-amber-400/40" : "border-primary/30",
                          )}
                          animate={{ opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 1.8, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="mx-5 my-3 border-t border-border/30" />

            {/* Bottom: Today's reward + claim */}
            <div className="px-5 pb-5 space-y-3">
              {/* Today's reward callout */}
              {!claimed && canClaim && (
                <motion.div
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3",
                    isDay7
                      ? "border-amber-400/30 bg-amber-500/8"
                      : "border-primary/20 bg-primary/5",
                  )}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Today's Reward
                    </p>
                    <p className={cn(
                      "text-2xl font-black tabular-nums mt-0.5",
                      isDay7 ? "text-amber-400" : "text-primary",
                    )}>
                      +{todayXP} <span className="text-sm font-bold">XP</span>
                    </p>
                  </div>
                  <span className="text-4xl">{DAY_EMOJIS[dayIndex]}</span>
                </motion.div>
              )}

              {/* Claim button / success state */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {claimed ? (
                  <motion.div
                    className="flex items-center justify-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/12 px-5 py-3"
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 14 }}
                  >
                    <span className="text-xl">✨</span>
                    <span className="text-base font-black text-emerald-400">
                      +{earnedXP} XP Claimed!
                    </span>
                    <span className="text-xl">✨</span>
                  </motion.div>
                ) : canClaim ? (
                  <motion.button
                    type="button"
                    onClick={handleClaim}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className={cn(
                      "w-full rounded-xl py-3 text-sm font-black text-white transition-all",
                      isDay7
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                        : "bg-primary hover:brightness-110 shadow-[0_0_16px_rgba(16,185,129,0.25)]",
                    )}
                  >
                    {isDay7 ? "👑 Claim Day 7 Bonus!" : `Claim Day ${dayIndex + 1} Reward`}
                  </motion.button>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-border/30 bg-muted/10 px-5 py-3">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-bold text-muted-foreground">Today's reward claimed!</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Confetti burst */}
            <AnimatePresence>
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className={cn(
                    "pointer-events-none absolute",
                    p.shape === "circle" ? "h-2 w-2 rounded-full" : "h-1.5 w-3 rounded-sm",
                  )}
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    backgroundColor: p.color,
                  }}
                  initial={{ scale: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    scale: [0, 1.4, 0.8],
                    opacity: [1, 1, 0],
                    x: p.tx,
                    y: p.ty,
                    rotate: p.rotate,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.0, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
