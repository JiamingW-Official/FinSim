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
  TrendingUp,
  TrendingDown,
  Wallet,
  Flame,
  Trophy,
  Target,
  Sparkles,
} from "lucide-react";
import { SeasonProgress } from "@/components/season/SeasonProgress";
import { LearningProgressCard } from "@/components/home/LearningProgressCard";
import { PersonalizedInsights } from "@/components/home/PersonalizedInsights";

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
          className="rounded-lg border border-border bg-card p-5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Welcome</h1>
              <p className="text-xs text-muted-foreground">
                Lv.{level} {title}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/30">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <span className="text-[10px] tabular-nums font-medium text-muted-foreground">
                  {xp} XP
                </span>
              </div>
            </div>
            {achievements.length > 0 && (
              <div className="flex items-center gap-1 rounded-md bg-amber-500/8 px-2 py-1">
                <Trophy className="h-3 w-3 text-amber-400" />
                <span className="text-[10px] font-semibold text-amber-400">
                  {achievements.length}
                </span>
              </div>
            )}
          </div>
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

        {/* Learning Progress */}
        <motion.div variants={fadeUp}>
          <LearningProgressCard />
        </motion.div>

        {/* Personalized Insights (agentic recommendations) */}
        <motion.div variants={fadeUp}>
          <PersonalizedInsights />
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
          <div className="rounded-lg border border-border bg-card">
            {recentTrades.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 py-6 text-muted-foreground">
                <BarChart3 className="h-5 w-5 opacity-20" />
                <p className="text-[11px]">No trades yet</p>
                <p className="text-[10px] opacity-50">
                  Place a trade to get started
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
                  <div
                    key={a.id}
                    className="flex flex-col items-center gap-1.5 rounded-lg border border-amber-500/15 bg-amber-500/5 p-3"
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
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={cn("text-sm font-semibold tabular-nums", valueClass)}>
        {value}
      </p>
      {sub && (
        <p className="text-[9px] text-muted-foreground tabular-nums">{sub}</p>
      )}
    </div>
  );
}
