"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Swords, Calendar, Scroll, Sparkles, Zap, Star,
  Clock, Trophy, CheckCircle2, Lock, Flame,
  Target, ArrowRight,
} from "lucide-react";
import { DailyTab } from "@/components/challenges/DailyTab";
import { ScenariosTab } from "@/components/challenges/ScenariosTab";
import { ChallengePlayer } from "@/components/challenges/ChallengePlayer";
import { useChallengeStore } from "@/stores/challenge-store";
import type { DailyChallengeDefinition, ScenarioDefinition } from "@/types/challenges";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "daily" | "scenarios" | "weekly" | "events" | "history";

interface ActiveChallenge {
  mode: "daily" | "scenario";
  id: string;
  name: string;
  description: string;
  difficulty: string | number;
  xpReward: number;
  challenge: DailyChallengeDefinition["challenge"] | ScenarioDefinition["challenge"];
  gradingThresholds?: { S: number; A: number; B: number };
}

// ── Weekly challenge data ─────────────────────────────────────────────────────

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  xpReward: number;
  progress: number; // 0–100
  target: string;
  category: string;
}

const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: "wc-pnl-500",
    title: "Weekly Profit Target",
    description: "Earn at least $500 in total realized P&L this week across any number of trades.",
    difficulty: "Medium",
    xpReward: 300,
    progress: 40,
    target: "$500 P&L",
    category: "Profit",
  },
  {
    id: "wc-streak-5",
    title: "Winning Streak",
    description: "Close 5 consecutive profitable trades within the week without a losing trade.",
    difficulty: "Hard",
    xpReward: 500,
    progress: 60,
    target: "5-trade streak",
    category: "Consistency",
  },
  {
    id: "wc-diversify",
    title: "Portfolio Builder",
    description: "Trade at least 4 different tickers and close each position profitably.",
    difficulty: "Easy",
    xpReward: 150,
    progress: 75,
    target: "4 tickers",
    category: "Diversification",
  },
];

// ── Special Events data ───────────────────────────────────────────────────────

interface SpecialEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  endsAt: string; // ISO date string
  xpReward: number;
  badge: string;
  isNew: boolean;
  rules: string[];
}

function getEventDates(): { earningsDate: string; marketDate: string } {
  // Deterministic dates relative to March 27, 2026
  const earningsDate = new Date("2026-03-31T23:59:59Z").toISOString();
  const marketDate = new Date("2026-04-10T23:59:59Z").toISOString();
  return { earningsDate, marketDate };
}

const { earningsDate, marketDate } = getEventDates();

const SPECIAL_EVENTS: SpecialEvent[] = [
  {
    id: "evt-earnings-season",
    title: "Earnings Season Sprint",
    subtitle: "Limited Time — Ends Mar 31",
    description: "Trade around earnings announcements. Buy or short any ticker within 24h of its earnings report and close the position for a profit to score points.",
    endsAt: earningsDate,
    xpReward: 800,
    badge: "Earnings Pro",
    isNew: true,
    rules: [
      "Must trade within 24 hours of earnings release",
      "Position must be closed within 48 hours",
      "Minimum position size: 10 shares",
      "Bonus XP for 10%+ gain on single trade",
    ],
  },
  {
    id: "evt-market-crash",
    title: "Crash Survivor",
    subtitle: "Scenario Event — Ends Apr 10",
    description: "Navigate a simulated market downturn and protect your portfolio. The goal is to minimize drawdown while maintaining positive returns over 30 days.",
    endsAt: marketDate,
    xpReward: 1200,
    badge: "Risk Master",
    isNew: false,
    rules: [
      "Start with $25,000 simulated capital",
      "Must keep max drawdown below 10%",
      "Trade at least 15 times during the event",
      "Ranked on risk-adjusted return (Sharpe ratio)",
    ],
  },
];

// ── History data (synthetic) ──────────────────────────────────────────────────

interface HistoryEntry {
  id: string;
  name: string;
  type: "daily" | "weekly" | "event" | "scenario";
  date: string;
  xpEarned: number;
  score: string;
  result: "success" | "partial" | "fail";
}

function generateHistory(): HistoryEntry[] {
  const entries: HistoryEntry[] = [
    { id: "h1", name: "Bullish Breakout", type: "daily", date: "2026-03-26", xpEarned: 75, score: "S", result: "success" },
    { id: "h2", name: "Risk Management 101", type: "daily", date: "2026-03-25", xpEarned: 50, score: "A", result: "success" },
    { id: "h3", name: "Weekly Profit Target", type: "weekly", date: "2026-03-22", xpEarned: 300, score: "+$612", result: "success" },
    { id: "h4", name: "1987 Black Monday", type: "scenario", date: "2026-03-20", xpEarned: 150, score: "B", result: "partial" },
    { id: "h5", name: "Short Selling Sprint", type: "daily", date: "2026-03-19", xpEarned: 0, score: "C", result: "fail" },
    { id: "h6", name: "Winning Streak", type: "weekly", date: "2026-03-15", xpEarned: 500, score: "5/5", result: "success" },
    { id: "h7", name: "Dot-com Bubble", type: "scenario", date: "2026-03-10", xpEarned: 200, score: "A", result: "success" },
    { id: "h8", name: "Options Basics", type: "daily", date: "2026-03-08", xpEarned: 75, score: "S", result: "success" },
  ];
  return entries;
}

// ── Countdown hook ────────────────────────────────────────────────────────────

function useCountdown(targetIso: string): string {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function compute() {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Ended"); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (days > 0) setRemaining(`${days}d ${hours}h`);
      else if (hours > 0) setRemaining(`${hours}h ${mins}m`);
      else setRemaining(`${mins}m`);
    }
    compute();
    const id = setInterval(compute, 60000);
    return () => clearInterval(id);
  }, [targetIso]);

  return remaining;
}

// ── Daily midnight countdown ──────────────────────────────────────────────────

function useDailyCountdown(): string {
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, []);
  return useCountdown(tomorrow);
}

// ── Sunday countdown for weekly ───────────────────────────────────────────────

function useSundayCountdown(): string {
  const sunday = useMemo(() => {
    const d = new Date();
    const daysUntilSunday = (7 - d.getDay()) % 7 || 7;
    d.setDate(d.getDate() + daysUntilSunday);
    d.setHours(23, 59, 59, 0);
    return d.toISOString();
  }, []);
  return useCountdown(sunday);
}

// ── Difficulty badge ──────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: "Easy" | "Medium" | "Hard" }) {
  return (
    <span className={cn(
      "rounded-md px-2 py-0.5 text-[11px] font-medium",
      difficulty === "Easy" && "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
      difficulty === "Medium" && "bg-amber-500/10 border border-amber-500/20 text-amber-400",
      difficulty === "Hard" && "bg-red-500/10 border border-red-500/20 text-red-400",
    )}>
      {difficulty}
    </span>
  );
}

// ── Weekly challenges tab ─────────────────────────────────────────────────────

function WeeklyTab() {
  const weeklyCountdown = useSundayCountdown();

  // Find the challenge with highest progress as "active hero"
  const sorted = [...WEEKLY_CHALLENGES].sort((a, b) => b.progress - a.progress);
  const heroChallenge = sorted[0];
  const rest = sorted.slice(1);

  return (
    <div className="space-y-2">
      {/* Header info — flow card (borderless, content-like) */}
      <div className="flex items-center justify-between bg-transparent p-2">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">Resets Sunday</span>
        </div>
        <span className="text-[11px] font-medium tabular-nums text-primary">{weeklyCountdown} left</span>
      </div>

      {/* Hero — most progressed weekly challenge */}
      <motion.div
        className="border-l-4 border-l-primary bg-card rounded-lg p-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-medium">{heroChallenge.title}</span>
              <DifficultyBadge difficulty={heroChallenge.difficulty} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{heroChallenge.description}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-medium font-mono tabular-nums text-primary">+{heroChallenge.xpReward}</div>
            <div className="text-[11px] text-muted-foreground">XP</div>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Target: {heroChallenge.target}</span>
            <span className="text-xs font-medium tabular-nums">{heroChallenge.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${heroChallenge.progress}%` }}
              transition={{ delay: 0.2, duration: 0.6 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Remaining — compact secondary cards */}
      {rest.map((challenge, i) => (
        <motion.div
          key={challenge.id}
          className="bg-transparent rounded-lg p-2.5 cursor-pointer hover:bg-muted/20 transition-colors duration-150"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (i + 1) * 0.08 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium truncate">{challenge.title}</span>
                <DifficultyBadge difficulty={challenge.difficulty} />
              </div>
              <div className="h-1.5 mt-1.5 rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${challenge.progress}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                />
              </div>
            </div>
            <span className="text-[11px] font-medium tabular-nums text-muted-foreground">{challenge.progress}%</span>
            <span className="text-[11px] font-medium text-primary">+{challenge.xpReward}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Special events tab ────────────────────────────────────────────────────────

function EventCard({ event, index }: { event: SpecialEvent; index: number }) {
  const remaining = useCountdown(event.endsAt);

  return (
    <motion.div
      className="rounded-md border border-primary/20 bg-primary/5 overflow-hidden cursor-pointer hover:bg-primary/8 transition-colors duration-150"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Banner */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-primary">Special Event</span>
          {event.isNew && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-medium text-primary-foreground">NEW</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="font-medium">{remaining}</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium">{event.title}</h3>
          <p className="text-xs text-muted-foreground">{event.subtitle}</p>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">{event.description}</p>

        {/* Rules */}
        <div className="rounded-lg border border-border/50 bg-card/50 p-3 space-y-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">Rules</span>
          {event.rules.map((rule, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
              <span className="text-xs text-muted-foreground">{rule}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-medium text-amber-400">+{event.xpReward} XP</span>
            <span className="text-xs text-muted-foreground">+ &quot;{event.badge}&quot; badge</span>
          </div>
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Join Event
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SpecialEventsTab() {
  return (
    <div className="space-y-5">
      {/* Flow card (borderless, content-like) */}
      <div className="bg-transparent p-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Special events are limited-time competitions with unique rules. Complete them before they expire to earn exclusive badges and bonus XP.
        </p>
      </div>

      {SPECIAL_EVENTS.map((event, i) => (
        <EventCard key={event.id} event={event} index={i} />
      ))}
    </div>
  );
}

// ── History tab ───────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<HistoryEntry["type"], string> = {
  daily: "Daily",
  weekly: "Weekly",
  event: "Event",
  scenario: "Scenario",
};

function HistoryTab() {
  const history = useMemo(() => generateHistory(), []);
  const totalXP = history.reduce((s, e) => s + e.xpEarned, 0);
  const successCount = history.filter((e) => e.result === "success").length;

  return (
    <div className="space-y-4">
      {/* Summary — flow cards (borderless, content-like) */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-transparent p-2 text-center">
          <div className="text-sm font-medium font-mono tabular-nums text-primary">{history.length}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Completed</div>
        </div>
        <div className="bg-transparent p-2 text-center">
          <div className="text-sm font-medium font-mono tabular-nums text-emerald-400">{successCount}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Full clear</div>
        </div>
        <div className="bg-transparent p-2 text-center">
          <div className="text-sm font-medium font-mono tabular-nums text-amber-400">+{totalXP}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">XP earned</div>
        </div>
      </div>

      {/* History table — CONSOLE card (compact, tabular, data-dense) */}
      <div className="bg-card border border-border/40 rounded-lg p-3 overflow-hidden text-xs">
        <div className="grid grid-cols-[1fr_4rem_4rem_3rem_3rem] gap-2 px-2 py-1.5 border-b border-border/50">
          <span className="text-[11px] font-medium text-muted-foreground">Challenge</span>
          <span className="text-[11px] font-medium text-muted-foreground">Date</span>
          <span className="text-[11px] font-medium text-muted-foreground text-right">XP</span>
          <span className="text-[11px] font-medium text-muted-foreground text-center">Score</span>
          <span className="text-[11px] font-medium text-muted-foreground text-center">Result</span>
        </div>

        {history.map((entry, i) => (
          <div
            key={entry.id}
            className={cn(
              "grid grid-cols-[1fr_4rem_4rem_3rem_3rem] gap-2 items-center px-2 py-1.5",
              i % 2 === 0 ? "bg-muted/5" : "",
              "border-b border-border/20 last:border-0",
            )}
          >
            <div className="min-w-0">
              <span className="text-[11px] font-medium truncate block text-muted-foreground">{entry.name}</span>
              <span className={cn(
                "text-[11px]",
                entry.type === "daily" && "text-primary/50",
                entry.type === "weekly" && "text-amber-400/50",
                entry.type === "event" && "text-orange-400/50",
                entry.type === "scenario" && "text-muted-foreground/50",
              )}>
                {TYPE_LABELS[entry.type]}
              </span>
            </div>

            <span className="text-[11px] text-muted-foreground/70 tabular-nums">{entry.date.slice(5)}</span>

            <span className={cn(
              "text-[11px] tabular-nums text-right",
              entry.xpEarned > 0 ? "text-primary/70" : "text-muted-foreground/40",
            )}>
              {entry.xpEarned > 0 ? `+${entry.xpEarned}` : "—"}
            </span>

            <span className="text-[11px] tabular-nums text-center text-muted-foreground">{entry.score}</span>

            <div className="flex justify-center">
              {entry.result === "success" && <CheckCircle2 className="h-3 w-3 text-emerald-400/60" />}
              {entry.result === "partial" && <Star className="h-3 w-3 text-amber-400/60" />}
              {entry.result === "fail" && <Lock className="h-3 w-3 text-red-400/40" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Daily Challenge Hero ─────────────────────────────────────────────────────

interface DailyHeroChallenge {
  title: string;
  description: string;
  ticker: string;
  difficulty: "Easy" | "Medium" | "Hard";
  xpReward: number;
}

const DAILY_HERO_POOL: DailyHeroChallenge[] = [
  { title: "Bullish Conviction", description: "Achieve a 2% return on AAPL in 50 bars", ticker: "AAPL", difficulty: "Medium", xpReward: 150 },
  { title: "Short Seller", description: "Close a profitable short trade on TSLA", ticker: "TSLA", difficulty: "Hard", xpReward: 200 },
  { title: "Buy the Dip", description: "Enter NVDA after a 3% decline and close green", ticker: "NVDA", difficulty: "Medium", xpReward: 150 },
  { title: "Quick Scalp", description: "Make 3 profitable trades on MSFT in one session", ticker: "MSFT", difficulty: "Easy", xpReward: 100 },
  { title: "Risk Manager", description: "Close a trade on AMZN with less than 1% drawdown", ticker: "AMZN", difficulty: "Hard", xpReward: 200 },
  { title: "Momentum Rider", description: "Ride a 5-bar winning streak on GOOGL", ticker: "GOOGL", difficulty: "Medium", xpReward: 150 },
  { title: "Patience Pays", description: "Hold META for 30+ bars and exit with profit", ticker: "META", difficulty: "Easy", xpReward: 100 },
  { title: "Volatility Play", description: "Profit from a 4%+ move on AMD in either direction", ticker: "AMD", difficulty: "Hard", xpReward: 200 },
  { title: "Steady Gains", description: "Achieve 1.5% return on JPM without losing more than 0.5%", ticker: "JPM", difficulty: "Medium", xpReward: 150 },
  { title: "Trend Follower", description: "Enter NFLX on a moving average crossover and profit", ticker: "NFLX", difficulty: "Easy", xpReward: 100 },
];

function getTodayHeroChallenge(): DailyHeroChallenge {
  const date = new Date().toISOString().slice(0, 10);
  let seed = 0;
  for (let i = 0; i < date.length; i++) {
    seed = (seed * 31 + date.charCodeAt(i)) | 0;
  }
  seed = Math.abs(seed);
  return DAILY_HERO_POOL[seed % DAILY_HERO_POOL.length];
}

function DailyHeroCard({ countdown }: { countdown: string }) {
  const challenge = useMemo(() => getTodayHeroChallenge(), []);

  return (
    <motion.div
      className="border-l-4 border-primary bg-card p-5 rounded-lg mb-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-medium text-primary">Today&apos;s challenge</span>
              <DifficultyBadge difficulty={challenge.difficulty} />
            </div>
            <h2 className="text-sm font-medium mb-1">{challenge.title}</h2>
            <p className="text-sm text-muted-foreground">{challenge.description}</p>
          </div>
        </div>

        <div className="shrink-0 text-right space-y-2">
          <div>
            <div className="text-sm font-medium font-mono tabular-nums text-primary">+{challenge.xpReward}</div>
            <div className="text-[11px] text-muted-foreground">XP reward</div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{countdown} left</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <span className="text-[11px] text-muted-foreground">0/1 daily challenges completed</span>
        <Link
          href="/trade"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Accept Challenge
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const [tab, setTab] = useState<Tab>("daily");
  const [active, setActive] = useState<ActiveChallenge | null>(null);
  const dailyCountdown = useDailyCountdown();

  const totalDailyCompleted = useChallengeStore((s) => s.totalDailyChallengesCompleted);
  const scenarioResults = useChallengeStore((s) => s.scenarioResults);
  const scenariosCompleted = Object.keys(scenarioResults).length;

  const handleSelectDaily = useCallback((def: DailyChallengeDefinition) => {
    setActive({
      mode: "daily",
      id: def.id,
      name: def.name,
      description: def.description,
      difficulty: def.difficulty,
      xpReward: def.xpReward,
      challenge: def.challenge,
    });
  }, []);

  const handleSelectScenario = useCallback((scenario: ScenarioDefinition) => {
    setActive({
      mode: "scenario",
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      difficulty: scenario.difficulty,
      xpReward: scenario.xpReward,
      challenge: scenario.challenge,
      gradingThresholds: scenario.gradingThresholds,
    });
  }, []);

  const handleClose = useCallback(() => {
    setActive(null);
  }, []);

  // Full-screen challenge player overlay
  if (active) {
    return (
      <div className="fixed inset-0 z-40 bg-background">
        <ChallengePlayer
          key={active.id}
          mode={active.mode}
          id={active.id}
          name={active.name}
          description={active.description}
          difficulty={active.difficulty}
          xpReward={active.xpReward}
          challenge={active.challenge}
          gradingThresholds={active.gradingThresholds}
          onClose={handleClose}
        />
      </div>
    );
  }

  const sRankCount = Object.values(scenarioResults).filter((r) => r.grade === "S").length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "daily", label: "Daily", icon: <Calendar className="h-3.5 w-3.5" /> },
    { id: "weekly", label: "Weekly", icon: <Flame className="h-3.5 w-3.5" /> },
    { id: "events", label: "Events", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "scenarios", label: "Scenarios", icon: <Scroll className="h-3.5 w-3.5" /> },
    { id: "history", label: "History", icon: <Trophy className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* ===== HEADER ===== */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-md bg-rose-500/10"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Swords className="h-5 w-5 text-rose-400" />
          </motion.div>
          <div>
            <h1 className="text-sm font-medium">Challenges</h1>
            <p className="text-[11px] text-muted-foreground">
              Test your skills &amp; earn rewards
            </p>
          </div>
          <div className="flex-1" />
          <motion.div
            className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 15 }}
          >
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">
              {totalDailyCompleted + scenariosCompleted} total
            </span>
          </motion.div>
        </div>

        {/* Stats strip — flow cards (borderless, content-like) */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <motion.div
            className="flex items-center gap-1.5 bg-transparent p-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-medium tabular-nums text-primary">{totalDailyCompleted}</span>
            <span className="text-[11px] text-muted-foreground">daily</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-1.5 bg-transparent p-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Scroll className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-medium tabular-nums text-amber-400">{scenariosCompleted}/8</span>
            <span className="text-[11px] text-muted-foreground">scenarios</span>
          </motion.div>

          {sRankCount > 0 && (
            <motion.div
              className="flex items-center gap-1 bg-transparent p-2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
            >
              <Star className="h-3 w-3 text-amber-400" />
              <span className="text-amber-400 text-[11px] font-medium">S x{sRankCount}</span>
            </motion.div>
          )}

          {/* Daily reset countdown (only show on daily tab) */}
          {tab === "daily" && (
            <motion.div
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Clock className="h-3 w-3" />
              <span>Resets in {dailyCountdown}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="border-b border-border px-4 overflow-x-auto">
        <div className="flex gap-0">
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium transition-colors whitespace-nowrap",
                tab === id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {icon}
              {label}
              {id === "events" && (
                <span className="rounded-full bg-primary w-1.5 h-1.5 absolute top-2 right-1" />
              )}
              {tab === id && (
                <motion.span
                  layoutId="challenge-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-8">
        {/* Daily Challenge Hero — only on daily tab */}
        {tab === "daily" && <DailyHeroCard countdown={dailyCountdown} />}

        <AnimatePresence mode="wait">
          {tab === "daily" && (
            <motion.div
              key="daily"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <DailyTab onSelectChallenge={handleSelectDaily} />
            </motion.div>
          )}

          {tab === "weekly" && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <WeeklyTab />
            </motion.div>
          )}

          {tab === "events" && (
            <motion.div
              key="events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <SpecialEventsTab />
            </motion.div>
          )}

          {tab === "scenarios" && (
            <motion.div
              key="scenarios"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <h3 className="text-xs font-medium text-muted-foreground mb-3">Scenario Challenges</h3>
              <ScenariosTab onSelectScenario={handleSelectScenario} />
            </motion.div>
          )}

          {tab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <HistoryTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
