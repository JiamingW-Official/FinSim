"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Lock, Zap, TrendingUp, TrendingDown, Flame, BarChart3,
  Award, Target, DollarSign, Layers, BookOpen, GraduationCap, Star,
  Crown, Eye, Sparkles, Gift, FlaskConical, Shield, ScrollText,
  Swords, Medal, Brain,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useGameStore } from "@/stores/game-store";
import {
  ACHIEVEMENT_DEFS,
  LEARNING_ACHIEVEMENT_DEFS,
  MINIGAME_ACHIEVEMENT_DEFS,
} from "@/types/game";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, TrendingUp, TrendingDown, Flame, BarChart3, Award, Target,
  DollarSign, Layers, BookOpen, GraduationCap, Star, Crown, Eye,
  Sparkles, Gift, FlaskConical, Shield, ScrollText, Swords, Medal,
  Trophy, Brain,
};

interface AchievementEntry {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const TABS = [
  {
    key: "trading" as const,
    label: "Trading",
    defs: ACHIEVEMENT_DEFS.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      icon: d.icon,
    })),
  },
  {
    key: "learning" as const,
    label: "Learning",
    defs: LEARNING_ACHIEVEMENT_DEFS.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      icon: d.icon,
    })),
  },
  {
    key: "minigames" as const,
    label: "Mini-Games",
    defs: MINIGAME_ACHIEVEMENT_DEFS.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      icon: d.icon,
    })),
  },
];

function getProgress(defId: string, stats: { totalTrades: number; profitableTrades: number; consecutiveWins: number; shortTradesCount: number; limitOrdersUsed: number; largestWin: number; uniqueTickersTraded: string[]; dailyStreak: number; comboCount: number }): number | null {
  switch (defId) {
    case "first_trade": return Math.min(stats.totalTrades / 1, 1) * 100;
    case "first_profit": return Math.min(stats.profitableTrades / 1, 1) * 100;
    case "five_streak": return Math.min(stats.consecutiveWins / 5, 1) * 100;
    case "ten_trades": return Math.min(stats.totalTrades / 10, 1) * 100;
    case "fifty_trades": return Math.min(stats.totalTrades / 50, 1) * 100;
    case "short_seller": return Math.min(stats.shortTradesCount / 1, 1) * 100;
    case "limit_master": return Math.min(stats.limitOrdersUsed / 5, 1) * 100;
    case "big_win": return Math.min(stats.largestWin / 5000, 1) * 100;
    case "diversified": return Math.min(stats.uniqueTickersTraded.length / 5, 1) * 100;
    case "on_a_roll": return Math.min(stats.dailyStreak / 3, 1) * 100;
    case "dedicated": return Math.min(stats.dailyStreak / 7, 1) * 100;
    case "combo_master": return Math.min(stats.comboCount / 5, 1) * 100;
    default: return null;
  }
}

export function AchievementGallery() {
  const [activeTab, setActiveTab] = useState<string>("trading");
  const achievements = useGameStore((s) => s.achievements);
  const stats = useGameStore((s) => s.stats);

  const unlockedIds = new Set(achievements.map((a) => a.id));
  const currentTab = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  return (
    <div>
      {/* Tab Bar */}
      <div className="mb-3 flex gap-1">
        {TABS.map((tab) => {
          const unlocked = tab.defs.filter((d) => unlockedIds.has(d.id)).length;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative rounded-lg px-2.5 py-1 text-xs font-bold transition-colors",
                activeTab === tab.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              <span className="ml-1 text-[11px] opacity-60">
                {unlocked}/{tab.defs.length}
              </span>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="achievement-tab-indicator"
                  className="absolute inset-0 rounded-lg border border-primary/20"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {currentTab.defs.map((def, i) => {
          const isUnlocked = unlockedIds.has(def.id);
          const progress = !isUnlocked ? getProgress(def.id, stats) : null;
          const IconComp = ICON_MAP[def.icon] ?? Star;

          return (
            <motion.div
              key={def.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "relative flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center transition-colors",
                isUnlocked
                  ? "border-amber-500/20 bg-amber-500/5"
                  : "border-border bg-card/50 opacity-60",
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                isUnlocked ? "bg-amber-500/15" : "bg-muted/30",
              )}>
                {isUnlocked ? (
                  <IconComp className="h-4 w-4 text-amber-400" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                )}
              </div>
              <p className={cn(
                "text-xs font-bold leading-tight",
                isUnlocked ? "text-amber-300" : "text-muted-foreground",
              )}>
                {def.name}
              </p>
              <p className="text-[11px] leading-tight text-muted-foreground/70 line-clamp-2">
                {def.description}
              </p>
              {/* Progress bar for locked trading achievements */}
              {!isUnlocked && progress !== null && progress > 0 && (
                <div className="mt-0.5 w-full">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted/30">
                    <motion.div
                      className="h-full rounded-full bg-primary/50"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground/50">
                    {Math.round(progress)}%
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
