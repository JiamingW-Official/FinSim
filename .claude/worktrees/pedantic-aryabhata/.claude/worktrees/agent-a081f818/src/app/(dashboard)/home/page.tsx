"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { useLearnStore } from "@/stores/learn-store";
import { useQuestStore } from "@/stores/quest-store";
import { INITIAL_CAPITAL } from "@/types/trading";
// Game types imported via store
import { formatCurrency, cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Flame,
  Trophy,
  Target,
  BookOpen,
  LineChart,
  FlaskConical,
  ArrowRight,
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

  // XP progress is shown in the TopBar, not here

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
        {/* Welcome Header — clean, no card wrapper */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{(() => {
              const h = new Date().getHours();
              return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
            })()}, {title}</h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Lv.{level} {title}</p>
              <p className="text-[10px] tabular-nums text-primary">{xp} XP</p>
            </div>
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary tabular-nums">{level}</span>
            </div>
          </div>
        </motion.div>

        {/* Spacer after header */}

        {/* Quick Stats Row */}
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
            icon={<Flame className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Streak"
            value={dailyStreakCount > 0 ? `${dailyStreakCount}d` : "0"}
            sub={learningStreak > 0 ? `Learn: ${learningStreak}d` : dailyStreakCount > 0 ? "Quest streak" : "Start a streak!"}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <QuickAction href="/trade" icon={<BarChart3 className="h-4 w-4" />} label="Trade" />
          <QuickAction href="/learn" icon={<BookOpen className="h-4 w-4" />} label="Learn" />
          <QuickAction href="/predictions" icon={<LineChart className="h-4 w-4" />} label="Predict" />
          <QuickAction href="/backtest" icon={<FlaskConical className="h-4 w-4" />} label="Analyze" />
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
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Recent Trades
            </h2>
            {tradeHistory.length > 0 && (
              <Link
                href="/portfolio"
                className="text-[10px] font-medium text-primary hover:underline transition-colors"
              >
                View All
              </Link>
            )}
          </div>
          <div className="surface-elevated">
            {recentTrades.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                <BarChart3 className="h-5 w-5 text-muted-foreground/30" />
                <p className="text-[11px]">No trades yet</p>
                <p className="text-[10px] opacity-50">
                  Place a trade to get started
                </p>
                <Link
                  href="/trade"
                  className="mt-1 flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors hover:bg-primary/20"
                >
                  Start Trading
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {recentTrades.map((trade, i) => (
                  <div
                    key={`${trade.timestamp}-${i}`}
                    className="flex items-center justify-between px-3 py-2 hover:bg-accent/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          trade.side === "buy"
                            ? "bg-green-400"
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
                    {trade.realizedPnL !== 0 ? (
                      <span
                        className={cn(
                          "text-[11px] font-bold tabular-nums",
                          trade.realizedPnL >= 0
                            ? "text-green-400"
                            : "text-red-400",
                        )}
                      >
                        {trade.realizedPnL >= 0 ? "+" : ""}
                        {formatCurrency(trade.realizedPnL)}
                      </span>
                    ) : (
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {formatCurrency(trade.price * trade.quantity)}
                      </span>
                    )}
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

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-lg border border-border/40 py-2.5 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
