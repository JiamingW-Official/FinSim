"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Swords, Calendar, Scroll, Sparkles, Zap, Star,
  Clock, Trophy, CheckCircle2, Lock, Flame,
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
      "rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
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

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/30 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">Resets Sunday</span>
        </div>
        <span className="text-[11px] font-bold tabular-nums text-primary">{weeklyCountdown} left</span>
      </div>

      {WEEKLY_CHALLENGES.map((challenge, i) => (
        <motion.div
          key={challenge.id}
          className="rounded-xl border border-border bg-card/50 p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              {challenge.category === "Profit" && <Zap className="h-4 w-4 text-primary" />}
              {challenge.category === "Consistency" && <Flame className="h-4 w-4 text-primary" />}
              {challenge.category === "Diversification" && <Star className="h-4 w-4 text-primary" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-bold">{challenge.title}</span>
                <DifficultyBadge difficulty={challenge.difficulty} />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{challenge.description}</p>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-sm font-bold text-primary">+{challenge.xpReward}</div>
              <div className="text-[11px] text-muted-foreground">XP</div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Target: {challenge.target}</span>
              <span className="text-xs font-bold tabular-nums">{challenge.progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${challenge.progress}%` }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              />
            </div>
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
      className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Banner */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wide">Special Event</span>
          {event.isNew && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold text-primary-foreground">NEW</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="font-bold">{remaining}</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-base font-bold">{event.title}</h3>
          <p className="text-xs text-muted-foreground">{event.subtitle}</p>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">{event.description}</p>

        {/* Rules */}
        <div className="rounded-lg border border-border/50 bg-card/50 p-3 space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground">Rules</span>
          {event.rules.map((rule, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-3 w-3 text-primary/60 shrink-0 mt-0.5" />
              <span className="text-xs text-muted-foreground">{rule}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-bold text-amber-400">+{event.xpReward} XP</span>
            <span className="text-xs text-muted-foreground">+ &quot;{event.badge}&quot; badge</span>
          </div>
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
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
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-card/30 px-3 py-2.5">
        <Sparkles className="h-3.5 w-3.5 text-primary/50 mt-0.5 shrink-0" />
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
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card/50 p-3 text-center">
          <div className="text-xl font-bold tabular-nums text-primary">{history.length}</div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">Completed</div>
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-3 text-center">
          <div className="text-xl font-bold tabular-nums text-emerald-400">{successCount}</div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">Full Clear</div>
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-3 text-center">
          <div className="text-xl font-bold tabular-nums text-amber-400">+{totalXP}</div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">XP Earned</div>
        </div>
      </div>

      {/* History table */}
      <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
        <div className="grid grid-cols-[1fr_4rem_4rem_3rem_3rem] gap-2 px-3 py-2 border-b border-border/50">
          <span className="text-[11px] font-bold text-muted-foreground">Challenge</span>
          <span className="text-[11px] font-bold text-muted-foreground">Date</span>
          <span className="text-[11px] font-bold text-muted-foreground text-right">XP</span>
          <span className="text-[11px] font-bold text-muted-foreground text-center">Score</span>
          <span className="text-[11px] font-bold text-muted-foreground text-center">Result</span>
        </div>

        {history.map((entry, i) => (
          <motion.div
            key={entry.id}
            className={cn(
              "grid grid-cols-[1fr_4rem_4rem_3rem_3rem] gap-2 items-center px-3 py-2.5",
              i % 2 === 0 ? "bg-muted/5" : "",
              "border-b border-border/20 last:border-0",
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className="min-w-0">
              <span className="text-[11px] font-bold truncate block">{entry.name}</span>
              <span className={cn(
                "text-[11px] font-bold uppercase",
                entry.type === "daily" && "text-primary/70",
                entry.type === "weekly" && "text-amber-400/70",
                entry.type === "event" && "text-purple-400/70",
                entry.type === "scenario" && "text-cyan-400/70",
              )}>
                {TYPE_LABELS[entry.type]}
              </span>
            </div>

            <span className="text-xs text-muted-foreground tabular-nums">{entry.date.slice(5)}</span>

            <span className={cn(
              "text-[11px] font-bold tabular-nums text-right",
              entry.xpEarned > 0 ? "text-primary" : "text-muted-foreground/50",
            )}>
              {entry.xpEarned > 0 ? `+${entry.xpEarned}` : "—"}
            </span>

            <span className="text-[11px] font-bold tabular-nums text-center">{entry.score}</span>

            <div className="flex justify-center">
              {entry.result === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
              {entry.result === "partial" && <Star className="h-3.5 w-3.5 text-amber-400" />}
              {entry.result === "fail" && <Lock className="h-3.5 w-3.5 text-red-400/50" />}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
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
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Swords className="h-5 w-5 text-rose-400" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold">Challenges</h1>
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
            <span className="text-xs font-bold text-primary">
              {totalDailyCompleted + scenariosCompleted} total
            </span>
          </motion.div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <motion.div
            className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold tabular-nums text-primary">{totalDailyCompleted}</span>
            <span className="text-xs text-muted-foreground">daily</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Scroll className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-bold tabular-nums text-amber-400">{scenariosCompleted}/8</span>
            <span className="text-xs text-muted-foreground">scenarios</span>
          </motion.div>

          {sRankCount > 0 && (
            <motion.div
              className="flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-1.5"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
            >
              <Star className="h-3 w-3 text-amber-400" />
              <span className="text-amber-400 text-[11px] font-bold">S x{sRankCount}</span>
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
                "relative flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-bold transition-colors whitespace-nowrap",
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
      <div className="flex-1 overflow-y-auto px-4 py-4">
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
