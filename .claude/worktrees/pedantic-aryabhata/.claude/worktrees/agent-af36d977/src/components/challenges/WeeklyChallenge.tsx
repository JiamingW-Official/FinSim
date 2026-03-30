"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart2,
  ChevronRight,
  Info,
  Award,
  Calendar,
  Target,
  AlertTriangle,
} from "lucide-react";
import {
  WEEKLY_SCENARIOS,
  getCurrentWeeklyScenario,
  getPastScenarios,
  getSecondsUntilFriday,
  DIFFICULTY_LABELS,
  SCORING_LABELS,
  type WeeklyScenario,
  type WeeklyDifficulty,
} from "@/data/weekly-scenarios";

/* ------------------------------------------------------------------ */
/* MOCK LEADERBOARD DATA                                               */
/* ------------------------------------------------------------------ */

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  pnl: number;
  pnlPercent: number;
  strategy: string;
  isCurrentUser?: boolean;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: "QuantAlpha", score: 3.84, pnl: 28410, pnlPercent: 28.41, strategy: "Put spreads + VIX calls" },
  { rank: 2, username: "DeltaHedger", score: 3.21, pnl: 21650, pnlPercent: 21.65, strategy: "Short SPY, long VIX" },
  { rank: 3, username: "VolSurfer99", score: 2.97, pnl: 18330, pnlPercent: 18.33, strategy: "Iron condor unwound at bar 2" },
  { rank: 4, username: "MacroMaven", score: 2.54, pnl: 14720, pnlPercent: 14.72, strategy: "TLT puts + cash pivot" },
  { rank: 5, username: "TailRiskPro", score: 2.31, pnl: 11880, pnlPercent: 11.88, strategy: "OTM put ladder" },
  { rank: 6, username: "GammaRider", score: 1.97, pnl: 9240, pnlPercent: 9.24, strategy: "Straddle at the money" },
  { rank: 7, username: "you", score: 1.62, pnl: 6110, pnlPercent: 6.11, strategy: "Partial hedge + cash", isCurrentUser: true },
  { rank: 8, username: "BetaArb", score: 1.44, pnl: 4980, pnlPercent: 4.98, strategy: "Sector rotation to utilities" },
  { rank: 9, username: "FlowTrader", score: 1.19, pnl: 3220, pnlPercent: 3.22, strategy: "Bought puts day 1 only" },
  { rank: 10, username: "NewbieInvests", score: 0.74, pnl: 1450, pnlPercent: 1.45, strategy: "Buy and hold — survived" },
];

interface PastWinner {
  scenarioId: string;
  username: string;
  score: number;
  strategy: string;
}

const MOCK_PAST_WINNERS: Record<string, PastWinner> = {
  "march-2020-vix-explosion": { scenarioId: "march-2020-vix-explosion", username: "VolSurfer99", score: 4.12, strategy: "Put spreads + VIX calls" },
  "nvidia-earnings-2024": { scenarioId: "nvidia-earnings-2024", username: "QuantAlpha", score: 31820, strategy: "Long straddle, closed pre-earnings" },
  "fed-policy-error": { scenarioId: "fed-policy-error", username: "MacroMaven", score: 3.41, strategy: "Short TLT + inverse equity ETFs" },
  "svb-contagion-week": { scenarioId: "svb-contagion-week", username: "DeltaHedger", score: 24600, strategy: "KRE puts from day 1" },
  "meme-stock-squeeze": { scenarioId: "meme-stock-squeeze", username: "GammaRider", score: 2.88, strategy: "Calls day 0-1, pivot to puts day 2" },
  "options-expiration-friday": { scenarioId: "options-expiration-friday", username: "FlowTrader", score: 8940, strategy: "0-DTE scalping around pin" },
  "inflation-cpi-surprise": { scenarioId: "inflation-cpi-surprise", username: "TailRiskPro", score: 2.95, strategy: "Long GLD, short TLT" },
  "tech-earnings-season": { scenarioId: "tech-earnings-season", username: "BetaArb", score: 19200, strategy: "Staggered earnings straddles" },
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "Closed";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function formatScore(score: number, method: string): string {
  if (method === "sharpe" || method === "risk-adjusted") return score.toFixed(2);
  return `$${score.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/* DIFFICULTY BADGE                                                    */
/* ------------------------------------------------------------------ */

const DIFFICULTY_STYLES: Record<WeeklyDifficulty, { bg: string; text: string; border: string }> = {
  beginner: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  intermediate: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  advanced: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  expert: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

function DifficultyBadge({ difficulty }: { difficulty: WeeklyDifficulty }) {
  const s = DIFFICULTY_STYLES[difficulty];
  return (
    <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest", s.bg, s.text, s.border)}>
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* RANK MEDAL (no emojis)                                              */
/* ------------------------------------------------------------------ */

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 border border-amber-400/40">
        <span className="text-[10px] font-black text-amber-400">1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-400/20 border border-slate-400/40">
        <span className="text-[10px] font-black text-slate-400">2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/20 border border-amber-700/40">
        <span className="text-[10px] font-black text-amber-700">3</span>
      </div>
    );
  }
  return (
    <div className="flex h-6 w-6 items-center justify-center">
      <span className="text-[11px] font-bold tabular-nums text-muted-foreground">{rank}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* LEADERBOARD ROW                                                     */
/* ------------------------------------------------------------------ */

function LeaderboardRow({ entry, index, scoringMethod }: {
  entry: LeaderboardEntry;
  index: number;
  scoringMethod: string;
}) {
  const AVATAR_COLORS = [
    "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
    "bg-violet-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
    "bg-teal-500", "bg-orange-500",
  ];
  const avatarColor = entry.isCurrentUser ? "bg-primary" : AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = entry.username.slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
        entry.isCurrentUser
          ? "bg-primary/8 border border-primary/20"
          : "hover:bg-accent/30",
      )}
    >
      <div className="flex w-7 shrink-0 items-center justify-center">
        <RankMedal rank={entry.rank} />
      </div>

      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[9px] font-black text-white", avatarColor)}>
        {initials}
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn("text-sm font-bold truncate", entry.isCurrentUser && "text-primary")}>
            {entry.username}
          </span>
          {entry.isCurrentUser && (
            <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-primary">
              You
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground truncate">{entry.strategy}</span>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-0.5">
        <span className="text-sm font-black tabular-nums text-foreground">
          {formatScore(entry.score, scoringMethod)}
        </span>
        <span className={cn("text-[10px] font-semibold tabular-nums", entry.pnl >= 0 ? "text-green-400" : "text-red-400")}>
          {entry.pnl >= 0 ? "+" : ""}{entry.pnlPercent.toFixed(2)}%
        </span>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* MY SUBMISSION PANEL                                                 */
/* ------------------------------------------------------------------ */

function MySubmissionPanel({ scenario }: { scenario: WeeklyScenario }) {
  const myEntry = MOCK_LEADERBOARD.find((e) => e.isCurrentUser);
  if (!myEntry) return null;

  const totalParticipants = MOCK_LEADERBOARD.length + 34; // mock total
  const percentile = Math.round(((totalParticipants - myEntry.rank) / totalParticipants) * 100);

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">My Submission</span>
        <span className="text-[10px] text-muted-foreground">Top {100 - percentile}%</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">Rank</span>
          <span className="text-lg font-black tabular-nums text-foreground">#{myEntry.rank}</span>
          <span className="text-[10px] text-muted-foreground">of {totalParticipants}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">Score</span>
          <span className="text-lg font-black tabular-nums text-foreground">
            {formatScore(myEntry.score, scenario.scoringMethod)}
          </span>
          <span className="text-[10px] text-muted-foreground">{SCORING_LABELS[scenario.scoringMethod]}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">vs Benchmark</span>
          <span className={cn("text-lg font-black tabular-nums", myEntry.pnlPercent - scenario.benchmarkReturn >= 0 ? "text-green-400" : "text-red-400")}>
            {myEntry.pnlPercent - scenario.benchmarkReturn >= 0 ? "+" : ""}
            {(myEntry.pnlPercent - scenario.benchmarkReturn).toFixed(2)}%
          </span>
          <span className="text-[10px] text-muted-foreground">{scenario.benchmarkLabel}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CURRENT CHALLENGE HERO                                              */
/* ------------------------------------------------------------------ */

function ChallengeHero({
  scenario,
  countdown,
  onEnter,
  onViewDetails,
}: {
  scenario: WeeklyScenario;
  countdown: number;
  onEnter: () => void;
  onViewDetails: () => void;
}) {
  const isOpen = countdown > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="rounded-lg border border-primary/30 bg-card overflow-hidden"
    >
      {/* Header stripe */}
      <div className="flex items-center justify-between bg-primary/10 px-4 py-2.5 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-widest text-primary">
            This Week&apos;s Challenge
          </span>
        </div>
        <div className={cn("flex items-center gap-1.5 rounded-md px-2 py-1", isOpen ? "bg-green-500/10 border border-green-500/20" : "bg-muted/30")}>
          <div className={cn("h-1.5 w-1.5 rounded-full", isOpen ? "bg-green-400" : "bg-muted-foreground")} />
          <span className={cn("text-[10px] font-bold", isOpen ? "text-green-400" : "text-muted-foreground")}>
            {isOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Title + badges */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black leading-tight mb-1">{scenario.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <DifficultyBadge difficulty={scenario.difficulty} />
              <span className="rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {SCORING_LABELS[scenario.scoringMethod]}
              </span>
              <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {scenario.topReward.toLocaleString()} XP prize
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{scenario.description}</p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
            <p className="text-[10px] text-muted-foreground mb-1">Starting Capital</p>
            <p className="text-base font-black tabular-nums">${(scenario.startingCapital / 1000).toFixed(0)}k</p>
          </div>
          <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
            <p className="text-[10px] text-muted-foreground mb-1">Primary Ticker</p>
            <p className="text-base font-black">{scenario.ticker}</p>
          </div>
          <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
            <p className="text-[10px] text-muted-foreground mb-1">Benchmark</p>
            <p className={cn("text-base font-black tabular-nums", scenario.benchmarkReturn >= 0 ? "text-green-400" : "text-red-400")}>
              {scenario.benchmarkReturn >= 0 ? "+" : ""}{scenario.benchmarkReturn.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Countdown timer */}
        <div className="flex items-center justify-between mb-4 rounded-lg border border-border/50 bg-muted/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Closes Friday 4:00 PM ET</span>
          </div>
          <span className={cn("text-lg font-black tabular-nums font-mono", countdown < 3600 * 4 ? "text-red-400" : "text-foreground")}>
            {formatCountdown(countdown)}
          </span>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3">
          <button
            onClick={onEnter}
            disabled={!isOpen}
            className={cn(
              "flex-1 rounded-md px-4 py-2.5 text-sm font-bold transition-all",
              isOpen
                ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
                : "bg-muted/30 text-muted-foreground cursor-not-allowed",
            )}
          >
            {isOpen ? "Enter Challenge" : "Challenge Closed"}
          </button>
          <button
            onClick={onViewDetails}
            className="rounded-md border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* CHALLENGE DETAILS PANEL                                             */
/* ------------------------------------------------------------------ */

function ChallengeDetails({ scenario, onClose }: { scenario: WeeklyScenario; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="rounded-lg border border-border bg-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Scenario Details</span>
        <button onClick={onClose} className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-semibold">
          Close
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Background */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Background</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{scenario.background}</p>
        </div>

        {/* Rules */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Target className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Rules</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {scenario.rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Events timeline */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">Market Events</span>
          </div>
          <div className="flex flex-col gap-2">
            {scenario.events.map((evt, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/20 border border-border/50 p-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 border border-primary/20">
                  <span className="text-[10px] font-black text-primary">D{evt.barIndex + 1}</span>
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-snug">{evt.headline}</p>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold tabular-nums", evt.priceImpact >= 1 ? "text-green-400" : "text-red-400")}>
                      {evt.priceImpact >= 1 ? "+" : ""}{((evt.priceImpact - 1) * 100).toFixed(1)}%
                    </span>
                    {evt.vixSpike !== undefined && evt.vixSpike !== 0 && (
                      <span className={cn("text-[10px] text-muted-foreground tabular-nums")}>
                        VIX {evt.vixSpike > 0 ? "+" : ""}{evt.vixSpike}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring */}
        <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Scoring</span>
          </div>
          <p className="text-sm font-semibold text-foreground">{SCORING_LABELS[scenario.scoringMethod]}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Benchmark: {scenario.benchmarkLabel} ({scenario.benchmarkReturn >= 0 ? "+" : ""}{scenario.benchmarkReturn.toFixed(1)}%)
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* PAST CHALLENGES ARCHIVE                                             */
/* ------------------------------------------------------------------ */

function PastChallengeCard({ scenario, index }: { scenario: WeeklyScenario; index: number }) {
  const winner = MOCK_PAST_WINNERS[scenario.id];
  const isProfit = scenario.benchmarkReturn < 0; // if benchmark lost, winning usually means making money

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 280, damping: 24 }}
      className="rounded-lg border border-border/60 bg-card/60 p-3 hover:border-primary/30 hover:bg-card transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate">{scenario.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {formatDate(scenario.startDate)} — {formatDate(scenario.endDate)}
          </p>
        </div>
        <DifficultyBadge difficulty={scenario.difficulty} />
      </div>

      {winner ? (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40">
          <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-amber-400 truncate">{winner.username}</p>
            <p className="text-[10px] text-muted-foreground truncate">{winner.strategy}</p>
          </div>
          <span className={cn("text-[11px] font-black tabular-nums shrink-0", isProfit ? "text-green-400" : "text-red-400")}>
            {formatScore(winner.score, scenario.scoringMethod)}
          </span>
        </div>
      ) : (
        <div className="mt-2 pt-2 border-t border-border/40">
          <p className="text-[10px] text-muted-foreground">No winner recorded</p>
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */

type ActiveTab = "challenge" | "leaderboard" | "archive";

export function WeeklyChallenge() {
  const currentScenario = getCurrentWeeklyScenario();
  const pastScenarios = getPastScenarios();

  const [activeTab, setActiveTab] = useState<ActiveTab>("challenge");
  const [showDetails, setShowDetails] = useState(false);
  const [countdown, setCountdown] = useState(() => getSecondsUntilFriday(currentScenario.endDate));

  // Tick countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getSecondsUntilFriday(currentScenario.endDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentScenario.endDate]);

  const handleEnterChallenge = useCallback(() => {
    // Navigate to trade page with scenario pre-loaded via query param
    window.location.href = `/trade?scenario=${currentScenario.id}`;
  }, [currentScenario.id]);

  const TABS: { id: ActiveTab; label: string }[] = [
    { id: "challenge", label: "Challenge" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "archive", label: "Archive" },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-muted/30 p-1 border border-border/50">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowDetails(false); }}
            className={cn(
              "flex-1 rounded-md py-2 text-xs font-bold transition-all",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "challenge" && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-4"
          >
            <ChallengeHero
              scenario={currentScenario}
              countdown={countdown}
              onEnter={handleEnterChallenge}
              onViewDetails={() => setShowDetails((v) => !v)}
            />

            <AnimatePresence>
              {showDetails && (
                <ChallengeDetails
                  scenario={currentScenario}
                  onClose={() => setShowDetails(false)}
                />
              )}
            </AnimatePresence>

            <MySubmissionPanel scenario={currentScenario} />
          </motion.div>
        )}

        {activeTab === "leaderboard" && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black">{currentScenario.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {MOCK_LEADERBOARD.length + 34} participants &middot; Scored by {SCORING_LABELS[currentScenario.scoringMethod]}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="tabular-nums font-mono">{formatCountdown(countdown)}</span>
              </div>
            </div>

            {/* Podium top 3 */}
            <div className="grid grid-cols-3 gap-2 mb-1">
              {MOCK_LEADERBOARD.slice(0, 3).map((entry) => (
                <div
                  key={entry.rank}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-3 text-center",
                    entry.rank === 1 ? "border-amber-400/30 bg-amber-400/5" :
                    entry.rank === 2 ? "border-slate-400/30 bg-slate-400/5" :
                    "border-amber-700/30 bg-amber-700/5",
                  )}
                >
                  <RankMedal rank={entry.rank} />
                  <span className="text-[10px] font-black truncate max-w-full">{entry.username}</span>
                  <span className="text-xs font-black tabular-nums text-foreground">
                    {formatScore(entry.score, currentScenario.scoringMethod)}
                  </span>
                  <span className={cn("text-[9px] tabular-nums", entry.pnl >= 0 ? "text-green-400" : "text-red-400")}>
                    {entry.pnl >= 0 ? "+" : ""}{entry.pnlPercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>

            {/* Full table */}
            <div className="flex flex-col gap-1">
              {MOCK_LEADERBOARD.map((entry, i) => (
                <LeaderboardRow
                  key={entry.rank}
                  entry={entry}
                  index={i}
                  scoringMethod={currentScenario.scoringMethod}
                />
              ))}
            </div>

            {/* Benchmark reference */}
            <div className="rounded-lg border border-border/50 bg-muted/10 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentScenario.benchmarkReturn >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                )}
                <span className="text-[11px] text-muted-foreground">{currentScenario.benchmarkLabel}</span>
              </div>
              <span className={cn("text-xs font-black tabular-nums", currentScenario.benchmarkReturn >= 0 ? "text-green-400" : "text-red-400")}>
                {currentScenario.benchmarkReturn >= 0 ? "+" : ""}{currentScenario.benchmarkReturn.toFixed(1)}%
              </span>
            </div>
          </motion.div>
        )}

        {activeTab === "archive" && (
          <motion.div
            key="archive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-3"
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-black">Past Challenges</h3>
                <p className="text-[11px] text-muted-foreground">Previous weeks &amp; winning strategies</p>
              </div>
            </div>

            {pastScenarios.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 rounded-lg border border-border/50 bg-muted/10 px-6 py-10 text-center"
              >
                <Trophy className="h-8 w-8 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-bold text-muted-foreground">No past challenges yet</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    Completed challenges will appear here every Friday.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("challenge")}
                  className="rounded-md bg-primary/10 border border-primary/20 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
                >
                  View Current Challenge
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {pastScenarios.map((s, i) => (
                  <PastChallengeCard key={s.id} scenario={s} index={i} />
                ))}
              </div>
            )}

            {/* All scenarios preview */}
            <div className="mt-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Upcoming Scenarios ({WEEKLY_SCENARIOS.length} total)
              </p>
              <div className="flex flex-col gap-1">
                {WEEKLY_SCENARIOS.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-md border border-border/40 bg-muted/5 px-3 py-2"
                  >
                    <span className="text-[10px] font-black tabular-nums text-muted-foreground/60 w-5 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{s.title}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(s.startDate)}</p>
                    </div>
                    <DifficultyBadge difficulty={s.difficulty} />
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
