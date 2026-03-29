"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Trophy, Star } from "lucide-react";
import { toast } from "sonner";
import type { Achievement } from "@/types/game";
import { ACHIEVEMENT_DEFS } from "@/types/game";
import { DynamicIcon } from "@/components/social/DynamicIcon";

// ─────────────────────────────────────────────
// Card content
// ─────────────────────────────────────────────

interface AchievementShareCardProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementShareCard({ achievement, onClose }: AchievementShareCardProps) {
  const def = ACHIEVEMENT_DEFS.find((d) => d.id === achievement.id);
  const xpReward = def?.xpReward ?? 0;

  const shareText = `I just unlocked "${achievement.name}" in FinSim! ${achievement.description}. +${xpReward} XP. Can you unlock it? finsim.app`;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareText)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Copy failed — try manually"));
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest text-primary">FINSIM</span>
          <span className="text-xs text-muted-foreground">Achievement</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col items-center gap-4 px-6 py-5">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
          <DynamicIcon name={achievement.icon} className="h-8 w-8 text-primary" />
        </div>

        {/* Name + description */}
        <div className="text-center">
          <div className="text-xs font-bold text-muted-foreground">
            Unlocked in FinSim
          </div>
          <div className="mt-1 text-xl font-bold">{achievement.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">{achievement.description}</div>
        </div>

        {/* XP badge */}
        {xpReward > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">+{xpReward} XP</span>
          </div>
        )}

        <div className="text-[11px] text-muted-foreground">finsim.app</div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-border px-4 py-3">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[11px] font-bold text-white transition-colors hover:bg-primary/90 active:bg-primary/80"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Share Text
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-3 py-2 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-accent"
        >
          Dismiss
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Modal wrapper
// ─────────────────────────────────────────────

interface AchievementShareModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementShareModal({ achievement, onClose }: AchievementShareModalProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <AchievementShareCard achievement={achievement} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Inline toast content (used by game-store)
// ─────────────────────────────────────────────

interface AchievementToastProps {
  achievement: Achievement;
  xpReward: number;
  toastId: string | number;
}

export function AchievementToastContent({ achievement, xpReward, toastId }: AchievementToastProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
        <DynamicIcon name={achievement.icon} className="h-4.5 w-4.5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">
            Achievement
          </span>
          {xpReward > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary">
              +{xpReward} XP
            </span>
          )}
        </div>
        <div className="truncate text-sm font-bold">{achievement.name}</div>
        <div className="truncate text-[11px] text-muted-foreground">{achievement.description}</div>
      </div>
      <button
        onClick={() => toast.dismiss(toastId)}
        className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-accent"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
