"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Crown, Sparkles, Zap } from "lucide-react";
import { useGameStore } from "@/stores/game-store";
import { soundEngine } from "@/services/audio/sound-engine";
import { cn } from "@/lib/utils";

const STREAK_CONFIG: Record<number, {
  icon: typeof Flame;
  title: string;
  message: string;
  size: "sm" | "md" | "lg" | "xl";
  color: string;
  bg: string;
  border: string;
}> = {
  3: {
    icon: Flame,
    title: "3 Day Streak!",
    message: "You're building momentum!",
    size: "sm",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  7: {
    icon: Zap,
    title: "7 Day Streak!",
    message: "A full week of trading! Incredible!",
    size: "md",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  14: {
    icon: Sparkles,
    title: "14 Day Streak!",
    message: "Two weeks strong! You're unstoppable!",
    size: "lg",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  30: {
    icon: Crown,
    title: "30 Day Streak!",
    message: "You've achieved legendary status!",
    size: "xl",
    color: "text-amber-300",
    bg: "bg-gradient-to-br from-amber-500/15 to-orange-500/15",
    border: "border-amber-400/40",
  },
};

export function StreakCelebration() {
  const lastStreakMilestone = useGameStore((s) => s.lastStreakMilestone);
  const clearStreakMilestone = useGameStore((s) => s.clearStreakMilestone);
  const [show, setShow] = useState(false);
  const [milestone, setMilestone] = useState(3);

  useEffect(() => {
    if (lastStreakMilestone === null) return;
    setMilestone(lastStreakMilestone);
    setShow(true);
    soundEngine.playStreak();

    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(clearStreakMilestone, 400);
    }, 3500);

    return () => clearTimeout(timer);
  }, [lastStreakMilestone, clearStreakMilestone]);

  const config = STREAK_CONFIG[milestone] ?? STREAK_CONFIG[3];
  const IconComp = config.icon;
  const isLarge = config.size === "lg" || config.size === "xl";

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop for larger celebrations */}
          {isLarge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[95] bg-black/30 backdrop-blur-[2px]"
              onClick={() => {
                setShow(false);
                setTimeout(clearStreakMilestone, 300);
              }}
            />
          )}

          <motion.div
            initial={
              isLarge
                ? { scale: 0.5, opacity: 0 }
                : { scale: 0.3, opacity: 0, y: 20 }
            }
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={
              isLarge
                ? { scale: 0.8, opacity: 0 }
                : { scale: 0.5, opacity: 0, y: 10 }
            }
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={cn(
              "fixed z-[96]",
              isLarge
                ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                : "bottom-24 right-4",
            )}
          >
            <motion.div
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border p-5 shadow-xl backdrop-blur-sm",
                config.bg,
                config.border,
                isLarge && "min-w-[240px]",
              )}
              animate={config.size === "xl" ? { scale: [1, 1.03, 1] } : {}}
              transition={config.size === "xl" ? { duration: 1.5, repeat: Infinity, type: "tween" } : undefined}
            >
              {/* Icon */}
              <motion.div
                initial={{ rotate: -15, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 }}
                className={cn(
                  "flex items-center justify-center rounded-xl",
                  isLarge ? "h-14 w-14" : "h-10 w-10",
                  config.bg,
                )}
              >
                <IconComp className={cn(isLarge ? "h-7 w-7" : "h-5 w-5", config.color)} />
              </motion.div>

              {/* Title */}
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className={cn(
                  "font-black",
                  isLarge ? "text-lg" : "text-sm",
                  config.color,
                )}
              >
                {config.title}
              </motion.p>

              {/* Message */}
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className={cn(
                  "text-center text-muted-foreground",
                  isLarge ? "text-xs" : "text-[10px]",
                )}
              >
                {config.message}
              </motion.p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
