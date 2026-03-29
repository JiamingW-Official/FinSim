"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Swords,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Trophy,
  Target,
  BarChart2,
} from "lucide-react";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import {
  useBeatTheBestStore,
  challengeTypeLabel,
  challengeTypeDescription,
} from "@/stores/beat-the-best-store";
import type { ChallengeType, ChallengeNPC, ActiveChallenge } from "@/stores/beat-the-best-store";
import type { RankedEntry } from "@/types/leaderboard";

// ── Helpers ──────────────────────────────────────────────────────────────────

const STRATEGIES = [
  "Momentum breakout",
  "Mean reversion",
  "Trend following",
  "Swing trading",
  "Scalping pullbacks",
  "Gap-and-go",
  "VWAP reclaim",
  "Support bounce",
  "Earnings fade",
  "Sector rotation",
];

const AVATAR_COLORS = [
  "bg-primary",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-primary",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function seededRng(seed: number) {
  let s = seed === 0 ? 1 : Math.abs(seed);
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function npcFromEntry(entry: RankedEntry): ChallengeNPC {
  const rng = seededRng(entry.avatarSeed);
  const elo = Math.round(1000 + entry.winRate * 12 + entry.sharpeRatio * 80 + rng() * 200);
  const streak = Math.max(0, Math.round(entry.longestStreak * 0.6 + rng() * 4));
  const strategyIdx = Math.floor(rng() * STRATEGIES.length);
  return {
    id: entry.id,
    name: entry.name,
    elo,
    winRate: entry.winRate,
    currentStreak: streak,
    recentStrategy: STRATEGIES[strategyIdx],
    avatarSeed: entry.avatarSeed,
  };
}

function getInitials(name: string): string {
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function avatarColor(seed: number): string {
  return AVATAR_COLORS[seed % AVATAR_COLORS.length];
}

function sharpeFromReturns(returns: number[]): number {
  if (returns.length < 2) return 0;
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - avg) ** 2, 0) / returns.length;
  const std = Math.sqrt(variance);
  return std > 0 ? avg / std : 0;
}

// ── Challenge type icon ───────────────────────────────────────────────────────

function TypeIcon({ type, className }: { type: ChallengeType; className?: string }) {
  switch (type) {
    case "pnl_race": return <TrendingUp className={className} />;
    case "accuracy": return <Target className={className} />;
    case "risk_adjusted": return <BarChart2 className={className} />;
  }
}

// ── Main Panel ────────────────────────────────────────────────────────────────

interface BeatTheBestPanelProps {
  top3: RankedEntry[];
}

export function BeatTheBestPanel({ top3 }: BeatTheBestPanelProps) {
  const { activeChallenges, completedChallenges, startChallenge, dismissChallenge, updateProgress } =
    useBeatTheBestStore();
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);

  const [historyOpen, setHistoryOpen] = useState(false);

  // Update progress whenever tradeHistory changes
  useEffect(() => {
    if (tradeHistory.length === 0) return;
    const latest = tradeHistory[0]; // newest first
    if (!latest || latest.realizedPnL === undefined) return;

    updateProgress({
      tradeTimestamp: latest.timestamp,
      realizedPnL: latest.realizedPnL,
      side: latest.side,
      capital: portfolioValue > 0 ? portfolioValue : INITIAL_CAPITAL,
    });
  }, [tradeHistory, portfolioValue, updateProgress]);

  // Non-user top 3 candidates
  const candidates = useMemo(
    () => top3.filter((e) => !e.isUser).slice(0, 3).map(npcFromEntry),
    [top3],
  );

  return (
    <div className="rounded-md border border-border bg-card/50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Swords className="h-4 w-4 text-amber-400 shrink-0" />
        <span className="text-sm font-semibold">Beat the Best</span>
        {activeChallenges.filter((c) => !c.completed).length > 0 && (
          <span className="ml-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 text-[11px] font-semibold text-amber-400 tabular-nums">
            {activeChallenges.filter((c) => !c.completed).length} active
          </span>
        )}
      </div>

      {/* NPC challenger rows */}
      <div className="space-y-2">
        {candidates.map((npc, i) => {
          const active = activeChallenges.find((c) => c.npc.id === npc.id && !c.completed);
          const lastCompleted = activeChallenges.find((c) => c.npc.id === npc.id && c.completed);
          const placeLabel = ["#1", "#2", "#3"][i];

          return (
            <NPCRow
              key={npc.id}
              npc={npc}
              placeLabel={placeLabel}
              activeChallenge={active}
              completedChallenge={lastCompleted}
              onStart={(type) => startChallenge(npc, type)}
              onDismiss={(id) => dismissChallenge(id)}
              capital={portfolioValue > 0 ? portfolioValue : INITIAL_CAPITAL}
            />
          );
        })}
      </div>

      {/* Challenge history toggle */}
      {completedChallenges.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <Trophy className="h-3 w-3" />
            History ({completedChallenges.length})
            <ChevronDown
              className={cn("h-3 w-3 transition-transform", historyOpen && "rotate-180")}
            />
          </button>

          <AnimatePresence>
            {historyOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-1.5 overflow-hidden"
              >
                {[...completedChallenges]
                  .sort((a, b) => b.completedAt - a.completedAt)
                  .slice(0, 5)
                  .map((c) => (
                    <div
                      key={c.id}
                      className={cn(
                        "flex items-start gap-2 rounded-lg px-2.5 py-2",
                        c.won
                          ? "bg-green-500/5 border border-green-500/15"
                          : "bg-red-500/5 border border-red-500/15",
                      )}
                    >
                      {c.won ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "text-xs font-semibold block",
                            c.won ? "text-green-400" : "text-red-400",
                          )}
                        >
                          {c.won ? "Won" : "Lost"} — {challengeTypeLabel(c.type)} vs {c.npcName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{c.summary}</span>
                      </div>
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── NPC Row ───────────────────────────────────────────────────────────────────

interface NPCRowProps {
  npc: ChallengeNPC;
  placeLabel: string;
  activeChallenge: ActiveChallenge | undefined;
  completedChallenge: ActiveChallenge | undefined;
  onStart: (type: ChallengeType) => void;
  onDismiss: (id: string) => void;
  capital: number;
}

function NPCRow({
  npc,
  placeLabel,
  activeChallenge,
  completedChallenge,
  onStart,
  onDismiss,
  capital,
}: NPCRowProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const color = avatarColor(npc.avatarSeed);
  const initials = getInitials(npc.name);

  const challenge = activeChallenge ?? completedChallenge;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/10">
      {/* NPC info */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="text-xs font-semibold text-muted-foreground w-5 text-center shrink-0">
          {placeLabel}
        </span>
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-primary-foreground",
            color,
          )}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold truncate block">{npc.name}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-muted-foreground tabular-nums">
              ELO {npc.elo.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground/40">|</span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {npc.winRate.toFixed(0)}% WR
            </span>
            {npc.currentStreak > 0 && (
              <>
                <span className="text-[11px] text-muted-foreground/40">|</span>
                <span className="text-[11px] text-amber-400 tabular-nums font-semibold">
                  {npc.currentStreak}W streak
                </span>
              </>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground/60 truncate block">
            {npc.recentStrategy}
          </span>
        </div>

        {/* Action button */}
        <AnimatePresence mode="wait">
          {!challenge ? (
            <motion.button
              key="challenge"
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="shrink-0 rounded-md bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              Challenge
            </motion.button>
          ) : challenge.completed ? (
            <motion.button
              key="dismiss"
              type="button"
              onClick={() => onDismiss(challenge.id)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="shrink-0 rounded-md bg-muted/20 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted/30 transition-colors"
            >
              Clear
            </motion.button>
          ) : (
            <motion.span
              key="in-progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="shrink-0 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-[11px] font-semibold text-amber-400"
            >
              Active
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Challenge type picker */}
      <AnimatePresence>
        {pickerOpen && !challenge && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-border/20"
          >
            <div className="px-3 py-2 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Select challenge type
              </span>
              {(["pnl_race", "accuracy", "risk_adjusted"] as ChallengeType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onStart(type);
                    setPickerOpen(false);
                  }}
                  className="flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-left hover:bg-muted/20 transition-colors group"
                >
                  <TypeIcon
                    type={type}
                    className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold block">
                      {challengeTypeLabel(type)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {challengeTypeDescription(type)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress / result */}
      <AnimatePresence>
        {challenge && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/20"
          >
            <div className="px-3 py-2">
              {challenge.completed ? (
                <ChallengeResult challenge={challenge} capital={capital} />
              ) : (
                <ChallengeProgress challenge={challenge} capital={capital} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Progress view ─────────────────────────────────────────────────────────────

function ChallengeProgress({ challenge, capital }: { challenge: ActiveChallenge; capital: number }) {
  const pct = Math.min(100, (challenge.tradesCompleted / challenge.totalRequired) * 100);
  const remaining = challenge.totalRequired - challenge.tradesCompleted;

  // Build status line
  let userLabel = "";
  let npcLabel = "";
  let userAhead = false;

  if (challenge.type === "pnl_race") {
    const uPct = (challenge.userPnL / capital) * 100;
    const nPct = (challenge.npcSimPnL / capital) * 100;
    userLabel = `You: ${uPct >= 0 ? "+" : ""}${uPct.toFixed(1)}%`;
    npcLabel = `${challenge.npc.name}: ${nPct >= 0 ? "+" : ""}${nPct.toFixed(1)}%`;
    userAhead = challenge.userPnL >= challenge.npcSimPnL;
  } else if (challenge.type === "accuracy") {
    userLabel = `You: ${challenge.userCorrect}/${challenge.tradesCompleted}`;
    npcLabel = `${challenge.npc.name}: ${challenge.npcCorrect}/${challenge.tradesCompleted}`;
    userAhead = challenge.userCorrect >= challenge.npcCorrect;
  } else {
    const uSharpe = sharpeFromReturns(challenge.userReturns);
    const nSharpe = sharpeFromReturns(challenge.npcReturns);
    userLabel = `You: ${uSharpe.toFixed(2)}`;
    npcLabel = `${challenge.npc.name}: ${nSharpe.toFixed(2)}`;
    userAhead = uSharpe >= nSharpe;
  }

  return (
    <div className="space-y-1.5">
      {/* Type label + remaining trades */}
      <div className="flex items-center gap-1.5">
        <TypeIcon type={challenge.type} className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">
          {challengeTypeLabel(challenge.type)}
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
          {remaining} trade{remaining !== 1 ? "s" : ""} left
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Status line */}
      {challenge.tradesCompleted > 0 ? (
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
            userAhead
              ? "bg-green-500/8 border border-green-500/15"
              : "bg-red-500/8 border border-red-500/15",
          )}
        >
          {userAhead ? (
            <TrendingUp className="h-3 w-3 text-green-400 shrink-0" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-400 shrink-0" />
          )}
          <span className={cn("font-semibold", userAhead ? "text-green-400" : "text-red-400")}>
            {userLabel}
          </span>
          <span className="text-muted-foreground/60">|</span>
          <span className="text-muted-foreground">{npcLabel}</span>
          {userAhead && (
            <span className="ml-auto font-semibold text-green-400 text-[11px]">WINNING</span>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Make your first trade to start the race.
        </p>
      )}
    </div>
  );
}

// ── Result view ───────────────────────────────────────────────────────────────

function ChallengeResult({ challenge, capital: _capital }: { challenge: ActiveChallenge; capital: number }) {
  const won = challenge.won ?? false;

  // Rebuild summary
  let summary = "";
  if (challenge.type === "pnl_race") {
    const uPct = (_capital > 0 ? (challenge.userPnL / _capital) * 100 : 0).toFixed(1);
    const nPct = (_capital > 0 ? (challenge.npcSimPnL / _capital) * 100 : 0).toFixed(1);
    summary = `You: ${challenge.userPnL >= 0 ? "+" : ""}${uPct}% | ${challenge.npc.name}: ${challenge.npcSimPnL >= 0 ? "+" : ""}${nPct}%`;
  } else if (challenge.type === "accuracy") {
    summary = `You: ${challenge.userCorrect}/${challenge.totalRequired} correct | ${challenge.npc.name}: ${challenge.npcCorrect}/${challenge.totalRequired}`;
  } else {
    const uS = sharpeFromReturns(challenge.userReturns).toFixed(2);
    const nS = sharpeFromReturns(challenge.npcReturns).toFixed(2);
    summary = `Your Sharpe: ${uS} | ${challenge.npc.name}: ${nS}`;
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md px-2.5 py-2",
        won
          ? "bg-green-500/8 border border-green-500/15"
          : "bg-red-500/8 border border-red-500/15",
      )}
    >
      {won ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
      )}
      <div className="min-w-0">
        <span
          className={cn(
            "text-xs font-semibold block",
            won ? "text-green-400" : "text-red-400",
          )}
        >
          {won ? "Challenge won!" : "Challenge lost"} — {challengeTypeLabel(challenge.type)}
        </span>
        <span className="text-[11px] text-muted-foreground">{summary}</span>
      </div>
    </div>
  );
}
