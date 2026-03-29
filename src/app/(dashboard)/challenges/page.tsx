"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
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
      "Bonus points for 10%+ gain on single trade",
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
      "rounded px-1.5 py-0.5 text-[10px] font-medium",
      difficulty === "Easy" && "bg-emerald-500/8 text-emerald-500/80",
      difficulty === "Medium" && "bg-amber-500/8 text-amber-500/80",
      difficulty === "Hard" && "bg-red-500/8 text-red-500/80",
    )}>
      {difficulty}
    </span>
  );
}

// ── Weekly challenges tab ─────────────────────────────────────────────────────

function WeeklyTab() {
  const weeklyCountdown = useSundayCountdown();

  return (
    <div className="space-y-1">
      {/* Header info */}
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="text-xs text-muted-foreground">Resets Sunday</span>
        <span className="text-xs font-mono tabular-nums text-muted-foreground">{weeklyCountdown} left</span>
      </div>

      {/* All weekly challenges — compact rows */}
      {WEEKLY_CHALLENGES.map((challenge, i) => {
        const isActive = challenge.progress > 0 && challenge.progress < 100;
        return (
          <div
            key={challenge.id}
            className={cn(
              "rounded px-3 py-2.5 transition-colors hover:bg-muted/20",
              isActive && "border-l-2 border-border/20",
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium truncate">{challenge.title}</span>
                  <DifficultyBadge difficulty={challenge.difficulty} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{challenge.description}</p>
              </div>
              <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0">{challenge.progress}%</span>
              <span className="text-xs text-muted-foreground shrink-0">+{challenge.xpReward}</span>
            </div>
            <div className="h-1 mt-2 rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-muted-foreground/40"
                style={{ width: `${challenge.progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Special events tab ────────────────────────────────────────────────────────

function EventCard({ event, index }: { event: SpecialEvent; index: number }) {
  const remaining = useCountdown(event.endsAt);

  return (
    <div className="rounded-md border border-border/20 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">{event.title}</span>
          {event.isNew && (
            <span className="rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">new</span>
          )}
        </div>
        <span className="text-xs font-mono tabular-nums text-muted-foreground">{remaining}</span>
      </div>

      <div className="px-3 py-2.5 space-y-2">
        <p className="text-xs text-muted-foreground">{event.subtitle}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>

        {/* Rules */}
        <div className="space-y-1">
          {event.rules.map((rule, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/30" />
              <span className="text-xs text-muted-foreground">{rule}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">+{event.xpReward} &middot; &quot;{event.badge}&quot; badge</span>
          <button
            type="button"
            className="rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}

function SpecialEventsTab() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground px-1">
        Limited-time competitions. Complete before expiry for badges and bonus points.
      </p>
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
    <div className="space-y-3">
      {/* Summary — inline text */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs px-1">
        <span className="text-muted-foreground">Completed <span className="font-mono tabular-nums font-medium text-foreground">{history.length}</span></span>
        <span className="text-border/30">&middot;</span>
        <span className="text-muted-foreground">Full clear <span className="font-mono tabular-nums font-medium text-foreground">{successCount}</span></span>
        <span className="text-border/30">&middot;</span>
        <span className="text-muted-foreground">Earned <span className="font-mono tabular-nums font-medium text-foreground">+{totalXP}</span></span>
      </div>

      {/* History table */}
      <div className="overflow-x-auto rounded-lg border border-border/20">
        <table className="w-full text-xs min-w-[420px]">
          <thead>
            <tr className="border-b border-border/20 bg-muted/5">
              <th className="px-3 py-1.5 text-left text-xs font-medium text-muted-foreground">Challenge</th>
              <th className="px-3 py-1.5 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th className="px-3 py-1.5 text-right text-xs font-medium text-muted-foreground">Points</th>
              <th className="px-3 py-1.5 text-center text-xs font-medium text-muted-foreground">Score</th>
              <th className="px-3 py-1.5 text-center text-xs font-medium text-muted-foreground">Result</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.id} className="border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors">
                <td className="px-3 py-1.5">
                  <span className="text-xs text-foreground">{entry.name}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground/50">{TYPE_LABELS[entry.type]}</span>
                </td>
                <td className="px-3 py-1.5 font-mono tabular-nums text-xs text-muted-foreground">{entry.date.slice(5)}</td>
                <td className={cn(
                  "px-3 py-1.5 font-mono tabular-nums text-xs text-right",
                  entry.xpEarned > 0 ? "text-foreground" : "text-muted-foreground/40",
                )}>
                  {entry.xpEarned > 0 ? `+${entry.xpEarned}` : "--"}
                </td>
                <td className="px-3 py-1.5 font-mono tabular-nums text-xs text-center text-muted-foreground">{entry.score}</td>
                <td className={cn(
                  "px-3 py-1.5 text-xs text-center",
                  entry.result === "success" && "text-emerald-500/80",
                  entry.result === "partial" && "text-amber-500/80",
                  entry.result === "fail" && "text-red-500/80",
                )}>
                  {entry.result === "success" ? "pass" : entry.result === "partial" ? "partial" : "fail"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div className="rounded-md border border-border/20 px-4 py-3 mb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium">{challenge.title}</span>
            <DifficultyBadge difficulty={challenge.difficulty} />
          </div>
          <p className="text-xs text-muted-foreground">{challenge.description}</p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">+{challenge.xpReward}</span>
          <span className="text-xs font-mono tabular-nums text-muted-foreground">{countdown}</span>
          <Link
            href="/trade"
            className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
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

  const tabs: { id: Tab; label: string }[] = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "events", label: "Events" },
    { id: "scenarios", label: "Scenarios" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* ===== HEADER ===== */}
      <div className="border-b border-border/20 px-4 pt-4 pb-0">
        <div className="flex items-center gap-3 pb-2">
          <div className="min-w-0">
            <h1 className="text-sm font-serif font-medium tracking-tight">Challenges</h1>
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              {totalDailyCompleted} daily &middot; {scenariosCompleted}/8 scenarios{sRankCount > 0 ? ` · S x${sRankCount}` : ""}
              {tab === "daily" ? ` · resets in ${dailyCountdown}` : ""}
            </p>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2 text-[11px] font-medium transition-colors whitespace-nowrap",
                tab === id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-8">
        {/* Daily Challenge Hero — only on daily tab */}
        {tab === "daily" && <DailyHeroCard countdown={dailyCountdown} />}

        {tab === "daily" && <DailyTab onSelectChallenge={handleSelectDaily} />}
        {tab === "weekly" && <WeeklyTab />}
        {tab === "events" && <SpecialEventsTab />}
        {tab === "scenarios" && (
          <>
            <h3 className="text-xs text-muted-foreground mb-3">Historical scenarios</h3>
            <ScenariosTab onSelectScenario={handleSelectScenario} />
          </>
        )}
        {tab === "history" && <HistoryTab />}
      </div>
    </div>
  );
}
