"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { useLearnStore } from "@/stores/learn-store";
import { useQuestStore } from "@/stores/quest-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { LEVEL_THRESHOLDS, getXPForNextLevel } from "@/types/game";
import { formatCurrency, cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Trophy,
} from "lucide-react";
import { SeasonProgress } from "@/components/season/SeasonProgress";
import { LearningProgressCard } from "@/components/home/LearningProgressCard";
import { PersonalizedInsights } from "@/components/home/PersonalizedInsights";
import { QuickActions } from "@/components/home/QuickActions";
import { RecentActivity } from "@/components/home/RecentActivity";
import { MarketMovers } from "@/components/home/MarketMovers";
import { AlphaSignal } from "@/components/home/AlphaSignal";
import { StreakWidget } from "@/components/home/StreakWidget";
import { NewsFeed } from "@/components/home/NewsFeed";

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
};

/* ------------------------------------------------------------------ */
/*  XP progress helper                                                 */
/* ------------------------------------------------------------------ */

function getXPProgress(xp: number, level: number) {
  const currentLevelXP = level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0;
  const nextLevelXP = getXPForNextLevel(level);
  const range = nextLevelXP - currentLevelXP;
  const earned = xp - currentLevelXP;
  const pct = range > 0 ? Math.min(100, Math.round((earned / range) * 100)) : 100;
  return { earned, needed: range, pct };
}

/* ------------------------------------------------------------------ */
/*  Greeting helper                                                    */
/* ------------------------------------------------------------------ */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const xp = useGameStore((s) => s.xp);
  const stats = useGameStore((s) => s.stats);
  const achievements = useGameStore((s) => s.achievements);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const learningStreak = useLearnStore((s) => s.learningStreak);
  const dailyStreakCount = useQuestStore((s) => s.dailyStreakCount);

  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPct = INITIAL_CAPITAL > 0 ? (totalPnL / INITIAL_CAPITAL) * 100 : 0;
  const winRate =
    stats.totalTrades > 0
      ? ((stats.profitableTrades / stats.totalTrades) * 100).toFixed(1)
      : "0.0";

  const { pct: xpPct } = getXPProgress(xp, level);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <motion.div
        className="mx-auto w-full max-w-7xl space-y-5 p-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* ── Personalized Greeting Header ── */}
        <motion.div variants={fadeUp} className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {getGreeting()}, Trader
            </h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Level badge + XP progress bar */}
          <div className="shrink-0 text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <span className="text-xs text-muted-foreground">
                Lv.{level} — {title}
              </span>
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary tabular-nums">
                  {level}
                </span>
              </div>
            </div>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted/20">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <p className="mt-0.5 text-[9px] tabular-nums text-muted-foreground/60">
              {xp.toLocaleString()} XP total
            </p>
          </div>
        </motion.div>

        {/* ── Quick Stats Row ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<Wallet className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Portfolio"
            value={formatCurrency(portfolioValue)}
          />
          <StatCard
            icon={
              totalPnL >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
              )
            }
            label="Total P&L"
            value={`${totalPnL >= 0 ? "+" : ""}${formatCurrency(totalPnL)}`}
            valueClass={totalPnL >= 0 ? "text-green-400" : "text-red-400"}
            sub={`${totalPnLPct >= 0 ? "+" : ""}${totalPnLPct.toFixed(1)}%`}
          />
          <StatCard
            icon={<Target className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Win Rate"
            value={`${winRate}%`}
            sub={`${stats.totalTrades} trades`}
          />
          <StatCard
            icon={<Target className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Learning"
            value={
              learningStreak > 0
                ? `${learningStreak}d streak`
                : dailyStreakCount > 0
                  ? `${dailyStreakCount}d streak`
                  : "Start now"
            }
            sub={learningStreak > 0 ? "Daily lessons" : "No streak yet"}
          />
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div variants={fadeUp}>
          <QuickActions />
        </motion.div>

        {/* ── 3-Column Main Grid ── */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          {/* Column 1: Market intelligence */}
          <div className="space-y-5">
            <AlphaSignal />
            <MarketMovers />
          </div>

          {/* Column 2: Streak + learning progress */}
          <div className="space-y-5">
            <StreakWidget />
            <LearningProgressCard />
          </div>

          {/* Column 3: News + recent activity */}
          <div className="space-y-5">
            <NewsFeed />
            <RecentActivity />
          </div>
        </motion.div>

        {/* ── Season Progress (full-width) ── */}
        <motion.div variants={fadeUp}>
          <SeasonProgress />
        </motion.div>

        {/* ── Personalized Insights (full-width) ── */}
        <motion.div variants={fadeUp}>
          <PersonalizedInsights />
        </motion.div>

        {/* ── Achievement Showcase ── */}
        {achievements.length > 0 && (
          <motion.div variants={fadeUp}>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-xs font-medium text-muted-foreground">
                Latest Achievements
              </h2>
              <Link
                href="/portfolio"
                className="text-[10px] font-medium text-primary hover:underline transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {achievements
                .slice(-3)
                .reverse()
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-col items-center gap-1.5 rounded-lg border border-border/40 bg-muted/20 p-3 hover:border-border/60 transition-colors"
                  >
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    <p className="text-center text-[10px] font-medium leading-tight">
                      {a.name}
                    </p>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StatCard                                                           */
/* ------------------------------------------------------------------ */

function StatCard({
  icon,
  label,
  value,
  valueClass,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  sub?: string;
}) {
  return (
    <div className="surface-card p-3 hover:border-border/60 transition-colors">
      <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={cn("text-sm font-semibold tabular-nums tracking-tight", valueClass)}>
        {value}
      </p>
      {sub && (
        <p className="text-[9px] text-muted-foreground tabular-nums">{sub}</p>
      )}
    </div>
  );
}
