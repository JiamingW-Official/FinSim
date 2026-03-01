"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { useLearnStore } from "@/stores/learn-store";
import { useQuestStore } from "@/stores/quest-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { getXPForNextLevel, LEVEL_THRESHOLDS } from "@/types/game";
import { formatCurrency, cn } from "@/lib/utils";
import {
  BarChart3,
  GraduationCap,
  Swords,
  Crosshair,
  TrendingUp,
  TrendingDown,
  Wallet,
  Flame,
  Trophy,
  Target,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { SeasonProgress } from "@/components/season/SeasonProgress";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
} as const;
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 },
  },
};

const QUICK_ACTIONS = [
  {
    icon: BarChart3,
    label: "Start Trading",
    href: "/trade",
    color: "emerald",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    description: "Continue your simulation",
  },
  {
    icon: GraduationCap,
    label: "Continue Learning",
    href: "/learn",
    color: "amber",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    description: "Next lesson awaits",
  },
  {
    icon: Swords,
    label: "Daily Challenge",
    href: "/challenges",
    color: "rose",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    description: "Test your skills",
  },
  {
    icon: Crosshair,
    label: "Arena Match",
    href: "/arena",
    color: "red",
    bg: "bg-red-500/10",
    text: "text-red-400",
    description: "Battle an opponent",
  },
];

export default function HomePage() {
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const xp = useGameStore((s) => s.xp);
  const stats = useGameStore((s) => s.stats);
  const achievements = useGameStore((s) => s.achievements);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const learningStreak = useLearnStore((s) => s.learningStreak);
  const dailyStreakCount = useQuestStore((s) => s.dailyStreakCount);

  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPct = INITIAL_CAPITAL > 0 ? (totalPnL / INITIAL_CAPITAL) * 100 : 0;
  const winRate =
    stats.totalTrades > 0
      ? ((stats.profitableTrades / stats.totalTrades) * 100).toFixed(1)
      : "0.0";

  const currentLevelXP = level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0;
  const nextLevelXP = getXPForNextLevel(level);
  const xpProgress =
    level >= 50
      ? 100
      : Math.min(
          ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100,
          100,
        );

  // Last 5 trades for recent activity
  const recentTrades = tradeHistory.slice(-5).reverse();

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <motion.div
        className="mx-auto w-full max-w-2xl space-y-5 p-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Welcome Banner */}
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5"
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15"
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Sparkles className="h-7 w-7 text-primary" />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-xl font-black">Welcome back!</h1>
              <p className="text-[11px] text-muted-foreground">
                Lv.{level} {title}
              </p>
              {/* XP progress bar */}
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/30">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[9px] tabular-nums font-bold text-primary">
                  {xp} XP
                </span>
              </div>
            </div>
            {achievements.length > 0 && (
              <div className="badge-gold flex items-center gap-1 rounded-lg px-2.5 py-1.5">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[11px] font-bold text-amber-400">
                  {achievements.length}
                </span>
              </div>
            )}
          </div>
          {/* Decorative corner glow */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3">
          <StatCard
            icon={<Wallet className="h-3.5 w-3.5 text-blue-400" />}
            label="Portfolio"
            value={formatCurrency(portfolioValue)}
          />
          <StatCard
            icon={
              totalPnL >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              )
            }
            label="Total P&L"
            value={`${totalPnL >= 0 ? "+" : ""}${formatCurrency(totalPnL)}`}
            valueClass={totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}
            sub={`${totalPnLPct >= 0 ? "+" : ""}${totalPnLPct.toFixed(1)}%`}
          />
          <StatCard
            icon={<Target className="h-3.5 w-3.5 text-cyan-400" />}
            label="Win Rate"
            value={`${winRate}%`}
            sub={`${stats.totalTrades} trades`}
          />
          <StatCard
            icon={<Flame className="h-3.5 w-3.5 text-orange-400" />}
            label="Streaks"
            value={`${dailyStreakCount}d`}
            sub={learningStreak > 0 ? `Learn: ${learningStreak}` : "Quest streak"}
          />
        </motion.div>

        {/* Season Progress */}
        <motion.div variants={fadeUp}>
          <SeasonProgress />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <h2 className="mb-2.5 text-xs font-bold text-muted-foreground">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href}>
                <motion.div
                  className="card-hover-glow flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-border/80"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      action.bg,
                    )}
                  >
                    <action.icon className={cn("h-4.5 w-4.5", action.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{action.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeUp}>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-xs font-bold text-muted-foreground">
              Recent Trades
            </h2>
            {tradeHistory.length > 0 && (
              <Link
                href="/portfolio"
                className="text-[10px] font-medium text-primary hover:underline"
              >
                View All
              </Link>
            )}
          </div>
          <div className="card-hover-glow rounded-xl border border-border bg-card">
            {recentTrades.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 py-6 text-muted-foreground">
                <BarChart3 className="h-5 w-5 opacity-30" />
                <p className="text-[11px]">No trades yet</p>
                <p className="text-[10px] opacity-60">
                  Start trading to see your activity here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentTrades.map((trade, i) => (
                  <div
                    key={`${trade.timestamp}-${i}`}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          trade.side === "buy"
                            ? "bg-emerald-400"
                            : "bg-red-400",
                        )}
                      />
                      <span className="text-[11px] font-semibold">
                        {trade.ticker}
                      </span>
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {trade.side}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        x{trade.quantity}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[11px] font-bold tabular-nums",
                        trade.realizedPnL >= 0
                          ? "text-emerald-400"
                          : "text-red-400",
                      )}
                    >
                      {trade.realizedPnL >= 0 ? "+" : ""}
                      {formatCurrency(trade.realizedPnL)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Achievement Showcase */}
        {achievements.length > 0 && (
          <motion.div variants={fadeUp}>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-xs font-bold text-muted-foreground">
                Latest Achievements
              </h2>
              <Link
                href="/portfolio"
                className="text-[10px] font-medium text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {achievements
                .slice(-3)
                .reverse()
                .map((a) => (
                  <motion.div
                    key={a.id}
                    className="card-hover-glow flex flex-col items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"
                    whileHover={{ scale: 1.03 }}
                  >
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <p className="text-center text-[10px] font-bold leading-tight">
                      {a.name}
                    </p>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

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
    <div className="card-hover-glow rounded-xl border border-border bg-card/50 p-3">
      <div className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={cn("text-sm font-black tabular-nums", valueClass)}>
        {value}
      </p>
      {sub && (
        <p className="text-[9px] text-muted-foreground tabular-nums">{sub}</p>
      )}
    </div>
  );
}
