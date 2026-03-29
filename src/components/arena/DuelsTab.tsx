"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search, Clock, Trophy, TrendingUp, TrendingDown,
  RotateCcw, ArrowRight, Swords, ChevronRight,
} from "lucide-react";
import { ArenaRankBadge } from "./ArenaRankBadge";
import { findOpponent, generateArenaOpponents } from "@/data/arena/arena-npcs";
import { calculateEloChange, getArenaRankForElo } from "@/types/arena";
import { useArenaStore } from "@/stores/arena-store";
import type { ArenaNPC, ArenaRank } from "@/types/arena";

// ── Seeded PRNG ─────────────────────────────────────────────────

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Types ───────────────────────────────────────────────────────

type DuelMode = "quick" | "standard" | "marathon";
type DuelPhase = "lobby" | "searching" | "active" | "results";

interface DuelModeConfig {
  id: DuelMode;
  label: string;
  duration: number; // seconds
  description: string;
}

const DUEL_MODES: DuelModeConfig[] = [
  { id: "quick",    label: "Quick",    duration: 60,  description: "Fast-paced 1-minute battle" },
  { id: "standard", label: "Standard", duration: 180, description: "Balanced 3-minute match" },
  { id: "marathon", label: "Marathon", duration: 600, description: "10-minute endurance duel" },
];

interface PlayerSide {
  pnl: number;
  trades: number;
  position: "long" | "short" | "flat";
}

// ── Mini synthetic SVG chart ────────────────────────────────────

function MiniSVGChart({ seed, revealedBars, totalBars }: { seed: number; revealedBars: number; totalBars: number }) {
  const W = 280;
  const H = 80;
  const BAR_W = W / totalBars;

  const rng = seededRng(seed);
  let price = 100;
  const bars: { o: number; h: number; l: number; c: number }[] = [];
  for (let i = 0; i < totalBars; i++) {
    const drift = (rng() - 0.48) * 2.5;
    const vol = 1.2 + rng() * 1.8;
    const o = price;
    const c = o + drift;
    const h = Math.max(o, c) + rng() * vol;
    const l = Math.min(o, c) - rng() * vol;
    bars.push({ o, h, l, c });
    price = c;
  }

  const visible = bars.slice(0, revealedBars);
  const allPrices = visible.flatMap((b) => [b.h, b.l]);
  const minP = Math.min(...allPrices, price - 2);
  const maxP = Math.max(...allPrices, price + 2);
  const range = maxP - minP || 1;

  const toY = (v: number) => H - ((v - minP) / range) * H;

  return (
    <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {visible.map((b, i) => {
        const x = i * BAR_W + BAR_W / 2;
        const bull = b.c >= b.o;
        const color = bull ? "#10b981" : "#ef4444";
        const bodyTop = toY(Math.max(b.o, b.c));
        const bodyBot = toY(Math.min(b.o, b.c));
        const bodyH = Math.max(1, bodyBot - bodyTop);
        return (
          <g key={i}>
            <line x1={x} y1={toY(b.h)} x2={x} y2={toY(b.l)} stroke={color} strokeWidth={0.5} strokeOpacity={0.6} />
            <rect x={x - BAR_W * 0.35} y={bodyTop} width={BAR_W * 0.7} height={bodyH} fill={color} fillOpacity={0.8} />
          </g>
        );
      })}
    </svg>
  );
}

// ── P&L Race Bar ────────────────────────────────────────────────

function PnlRaceBar({ yourPnl, oppPnl }: { yourPnl: number; oppPnl: number }) {
  const maxAbs = Math.max(Math.abs(yourPnl), Math.abs(oppPnl), 50);
  const youPct = Math.min(50, (Math.max(0, yourPnl) / maxAbs) * 50);
  const oppPct = Math.min(50, (Math.max(0, oppPnl) / maxAbs) * 50);
  const youAhead = yourPnl > oppPnl;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground w-6 text-right">YOU</span>
      <div className="flex-1 relative h-5 rounded-full bg-foreground/[0.03] overflow-hidden flex">
        {/* Left half — you */}
        <div className="w-1/2 flex justify-end">
          <motion.div
            className={cn("h-full rounded-l-full", yourPnl >= 0 ? "bg-teal-500/50" : "bg-red-500/40")}
            animate={{ width: `${youPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/15 z-10" />
        {/* Right half — opp */}
        <div className="w-1/2 flex justify-start">
          <motion.div
            className={cn("h-full rounded-r-full", oppPnl >= 0 ? "bg-emerald-500/30" : "bg-red-500/25")}
            animate={{ width: `${oppPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={cn("text-[11px] font-semibold tabular-nums", youAhead ? "text-emerald-400" : "text-muted-foreground")}>
            {(yourPnl - oppPnl) >= 0 ? "+" : ""}{(yourPnl - oppPnl).toFixed(0)}
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold text-muted-foreground w-6">OPP</span>
    </div>
  );
}

// ── Active Duel ─────────────────────────────────────────────────

interface ActiveDuelProps {
  mode: DuelModeConfig;
  opponent: ArenaNPC;
  matchSeed: number;
  onComplete: (yourPnl: number, oppPnl: number, yourTrades: number) => void;
}

function ActiveDuel({ mode, opponent, matchSeed, onComplete }: ActiveDuelProps) {
  const TOTAL_BARS = 30;
  const [timeLeft, setTimeLeft] = useState(mode.duration);
  const [revealedBars, setRevealedBars] = useState(10);
  const [yours, setYours] = useState<PlayerSide>({ pnl: 0, trades: 0, position: "flat" });
  const [opp, setOpp] = useState<PlayerSide>({ pnl: 0, trades: 0, position: "flat" });
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const rng = useRef(seededRng(matchSeed + 999));

  // Opponent behavior: trade every 5-15 simulated bars
  const lastOppTradeBar = useRef(0);
  const oppPnlAccum = useRef(0);

  // Advance chart bars
  useEffect(() => {
    const barInterval = (mode.duration / TOTAL_BARS) * 1000;
    const iv = setInterval(() => {
      setRevealedBars((b) => Math.min(b + 1, TOTAL_BARS));
    }, barInterval);
    return () => clearInterval(iv);
  }, [mode.duration]);

  // Opponent AI: trades at random intervals
  useEffect(() => {
    const iv = setInterval(() => {
      setRevealedBars((current) => {
        const barsSinceLastTrade = current - lastOppTradeBar.current;
        const tradeInterval = 5 + Math.floor(rng.current() * 10);
        if (barsSinceLastTrade >= tradeInterval) {
          lastOppTradeBar.current = current;
          const gain = (rng.current() - 0.45) * 80 * opponent.skillLevel;
          oppPnlAccum.current += gain;
          setOpp((prev) => ({
            pnl: oppPnlAccum.current,
            trades: prev.trades + 1,
            position: rng.current() > 0.5 ? "long" : rng.current() > 0.3 ? "short" : "flat",
          }));
        }
        return current;
      });
    }, 300);
    return () => clearInterval(iv);
  }, [opponent.skillLevel]);

  // Countdown
  useEffect(() => {
    const iv = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const rem = Math.max(0, mode.duration - elapsed);
      setTimeLeft(rem);
      if (rem <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        clearInterval(iv);
        onComplete(yours.pnl, opp.pnl, yours.trades);
      }
    }, 200);
    return () => clearInterval(iv);
  }, [mode.duration, yours.pnl, opp.pnl, yours.trades, onComplete]);

  const handleBuy = useCallback(() => {
    const gain = (seededRng(Date.now() % 100000)() - 0.42) * 120;
    setYours((prev) => ({
      pnl: prev.pnl + gain,
      trades: prev.trades + 1,
      position: "long",
    }));
  }, []);

  const handleSell = useCallback(() => {
    const gain = (seededRng((Date.now() + 1) % 100000)() - 0.42) * 120;
    setYours((prev) => ({
      pnl: prev.pnl + gain,
      trades: prev.trades + 1,
      position: "flat",
    }));
  }, []);

  const handleFinishEarly = useCallback(() => {
    if (!finishedRef.current) {
      finishedRef.current = true;
      onComplete(yours.pnl, opp.pnl, yours.trades);
    }
  }, [yours.pnl, opp.pnl, yours.trades, onComplete]);

  const mm = Math.floor(timeLeft / 60);
  const ss = Math.floor(timeLeft % 60);
  const isUrgent = timeLeft <= 15;

  return (
    <div className="flex flex-col gap-3">
      {/* Timer */}
      <div className="flex items-center justify-center">
        <motion.div
          animate={isUrgent ? { scale: [1, 1.06, 1] } : {}}
          transition={isUrgent ? { duration: 0.6, repeat: Infinity } : {}}
          className={cn(
            "flex items-center gap-2 rounded-md px-5 py-2 font-mono text-2xl font-semibold tabular-nums",
            isUrgent ? "bg-red-500/15 text-red-400" : "bg-muted/20 text-foreground",
          )}
        >
          <Clock className="h-5 w-5" />
          {mm > 0 ? `${mm}:${String(ss).padStart(2, "0")}` : `${ss}s`}
        </motion.div>
      </div>

      {/* Player panels */}
      <div className="grid grid-cols-2 gap-2">
        {/* Your side */}
        <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
          <div className="text-xs font-semibold text-emerald-400 mb-1">YOU</div>
          <div className={cn("text-lg font-semibold tabular-nums", yours.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
            {yours.pnl >= 0 ? "+" : ""}${yours.pnl.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{yours.trades} trades</div>
          <div className="text-[11px] text-muted-foreground/70 capitalize mt-0.5">{yours.position}</div>
        </div>

        {/* Opponent side */}
        <div className="rounded-lg border border-border/20 bg-muted/10 p-3">
          <div className="flex items-center gap-1 mb-1">
            <ArenaRankBadge rank={opponent.rank} size="xs" showLabel={false} />
            <span className="text-xs font-semibold text-muted-foreground truncate">{opponent.name}</span>
          </div>
          <div className={cn("text-lg font-semibold tabular-nums", opp.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
            {opp.pnl >= 0 ? "+" : ""}${opp.pnl.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{opp.trades} trades</div>
          <div className="text-[11px] text-muted-foreground/70 capitalize mt-0.5">{opp.position}</div>
        </div>
      </div>

      {/* P&L race bar */}
      <PnlRaceBar yourPnl={yours.pnl} oppPnl={opp.pnl} />

      {/* Chart */}
      <div className="rounded-lg border border-border/20 bg-muted/10 p-2">
        <MiniSVGChart seed={matchSeed} revealedBars={revealedBars} totalBars={TOTAL_BARS} />
      </div>

      {/* Trade buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleBuy}
          className="flex items-center justify-center gap-2 rounded-lg bg-teal-500/20 border border-teal-500/30 py-3 text-sm font-semibold text-emerald-400 transition-colors hover:bg-teal-500/30 active:scale-95"
        >
          <TrendingUp className="h-4 w-4" />
          Buy / Long
        </button>
        <button
          type="button"
          onClick={handleSell}
          className="flex items-center justify-center gap-2 rounded-lg bg-red-500/20 border border-red-500/30 py-3 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/30 active:scale-95"
        >
          <TrendingDown className="h-4 w-4" />
          Sell / Short
        </button>
      </div>

      <button
        type="button"
        onClick={handleFinishEarly}
        className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors py-1"
      >
        Finish early
      </button>
    </div>
  );
}

// ── Post-duel results ───────────────────────────────────────────

interface DuelResultsProps {
  yourPnl: number;
  oppPnl: number;
  yourTrades: number;
  opponent: ArenaNPC;
  mode: DuelModeConfig;
  eloChange: number;
  eloBefore: number;
  eloAfter: number;
  onRematch: () => void;
  onFindNew: () => void;
}

function DuelResults({ yourPnl, oppPnl, yourTrades, opponent, mode, eloChange, eloBefore, eloAfter, onRematch, onFindNew }: DuelResultsProps) {
  const won = yourPnl > oppPnl;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 py-4"
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className={cn("text-xl font-semibold tracking-tight", won ? "text-emerald-400" : "text-red-400")}
      >
        {won ? "VICTORY!" : "DEFEAT"}
      </motion.div>

      <div className="text-xs text-muted-foreground">{mode.label} duel vs {opponent.name}</div>

      {/* Score comparison */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">You</div>
          <div className={cn("text-2xl font-semibold tabular-nums", yourPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
            {yourPnl >= 0 ? "+" : ""}${yourPnl.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground/70 mt-0.5">{yourTrades} trades</div>
        </div>
        <div className="text-muted-foreground/50 text-xl font-semibold">vs</div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArenaRankBadge rank={opponent.rank} size="xs" showLabel={false} />
            <span className="text-xs text-muted-foreground">{opponent.name}</span>
          </div>
          <div className={cn("text-2xl font-semibold tabular-nums", oppPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
            {oppPnl >= 0 ? "+" : ""}${oppPnl.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground/70 mt-0.5">{opponent.elo} ELO</div>
        </div>
      </div>

      {/* ELO change */}
      <div className="flex items-center gap-3 rounded-lg border border-border/20 bg-muted/10 px-4 py-2">
        <span className="text-xs text-muted-foreground">ELO</span>
        <span className="text-sm font-semibold text-muted-foreground tabular-nums">{eloBefore}</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground/70" />
        <span className={cn("text-sm font-semibold tabular-nums", eloChange >= 0 ? "text-emerald-400" : "text-red-400")}>
          {eloChange >= 0 ? "+" : ""}{eloChange}
        </span>
        <ChevronRight className="h-3 w-3 text-muted-foreground/70" />
        <span className="text-sm font-semibold text-foreground tabular-nums">{eloAfter}</span>
        <ArenaRankBadge rank={getArenaRankForElo(eloAfter)} size="xs" showLabel={false} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRematch}
          className="flex items-center gap-2 rounded-lg bg-teal-500/20 border border-teal-500/30 px-5 py-2.5 text-sm font-semibold text-emerald-400 transition-colors hover:bg-teal-500/30"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Rematch
        </button>
        <button
          type="button"
          onClick={onFindNew}
          className="flex items-center gap-2 rounded-lg border border-border/20 bg-muted/20 px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/50"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          Find New Match
        </button>
      </div>
    </motion.div>
  );
}

// ── Main DuelsTab ───────────────────────────────────────────────

export function DuelsTab() {
  const elo = useArenaStore((s) => s.elo);
  const [phase, setPhase] = useState<DuelPhase>("lobby");
  const [selectedMode, setSelectedMode] = useState<DuelModeConfig>(DUEL_MODES[1]);
  const [searchSeconds, setSearchSeconds] = useState(0);
  const [foundOpponent, setFoundOpponent] = useState<ArenaNPC | null>(null);
  const [matchSeed, setMatchSeed] = useState(0);
  const [duelResult, setDuelResult] = useState<{ yourPnl: number; oppPnl: number; yourTrades: number } | null>(null);
  const [eloInfo, setEloInfo] = useState<{ change: number; before: number; after: number }>({ change: 0, before: elo, after: elo });

  const searchRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFindMatch = useCallback(() => {
    setPhase("searching");
    setSearchSeconds(0);
    const start = Date.now();
    searchRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setSearchSeconds(elapsed);
      if (elapsed >= 2) {
        if (searchRef.current) clearInterval(searchRef.current);
        const opp = findOpponent(elo);
        setFoundOpponent(opp);
        setMatchSeed(Math.floor(Math.random() * 1_000_000));
        setPhase("active");
      }
    }, 200);
  }, [elo]);

  const handleComplete = useCallback((yourPnl: number, oppPnl: number, yourTrades: number) => {
    setDuelResult({ yourPnl, oppPnl, yourTrades });
    const won = yourPnl > oppPnl;
    const opponent = foundOpponent!;
    const change = calculateEloChange(elo, opponent.elo, won);
    const after = Math.max(0, elo + change);
    setEloInfo({ change, before: elo, after });
    setPhase("results");
  }, [elo, foundOpponent]);

  const handleRematch = useCallback(() => {
    setDuelResult(null);
    setMatchSeed(Math.floor(Math.random() * 1_000_000));
    setPhase("active");
  }, []);

  const handleFindNew = useCallback(() => {
    setDuelResult(null);
    setFoundOpponent(null);
    setPhase("lobby");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchRef.current) clearInterval(searchRef.current);
    };
  }, []);

  // Leaderboard preview
  const opponents = generateArenaOpponents().slice(0, 5);

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {phase === "lobby" && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Mode selector */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">Game Mode</div>
              <div className="grid grid-cols-3 gap-2">
                {DUEL_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMode(m)}
                    className={cn(
                      "rounded-lg border px-3 py-3 text-left transition-colors",
                      selectedMode.id === m.id
                        ? "border-teal-500/40 bg-teal-500/10"
                        : "border-border/20 bg-muted/10 hover:bg-muted/30",
                    )}
                  >
                    <div className={cn("text-xs font-semibold", selectedMode.id === m.id ? "text-emerald-400" : "text-muted-foreground")}>
                      {m.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{m.duration}s</div>
                    <div className="text-[11px] text-muted-foreground/70 mt-1">{m.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Find match button */}
            <button
              type="button"
              onClick={handleFindMatch}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-500 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-teal-400 active:scale-95"
            >
              <Swords className="h-4 w-4" />
              Find Match
            </button>

            {/* Your ELO */}
            <div className="flex items-center justify-between rounded-lg border border-border/20 bg-muted/10 px-3 py-2">
              <span className="text-xs text-muted-foreground">Your ELO</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tabular-nums text-foreground">{elo}</span>
                <ArenaRankBadge rank={getArenaRankForElo(elo)} size="xs" showLabel={false} />
              </div>
            </div>

            {/* Nearby opponents */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <Trophy className="h-3 w-3" />
                Potential Opponents
              </div>
              <div className="space-y-1.5">
                {opponents.map((opp) => (
                  <div key={opp.id} className="flex items-center gap-2 rounded-lg border border-foreground/[0.03] bg-foreground/[0.01] px-3 py-2 text-xs">
                    <ArenaRankBadge rank={opp.rank} size="xs" showLabel={false} />
                    <span className="flex-1 text-muted-foreground">{opp.name}</span>
                    <span className="tabular-nums text-muted-foreground">{opp.elo} ELO</span>
                    <span className="text-xs text-muted-foreground/70 capitalize">{opp.personality}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {phase === "searching" && (
          <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <Search className="h-10 w-10 text-emerald-400" />
            </motion.div>
            <div className="text-sm font-semibold text-foreground">Finding opponent...</div>
            <div className="text-xs text-muted-foreground tabular-nums">{searchSeconds}s elapsed</div>
            <button
              type="button"
              onClick={() => { if (searchRef.current) clearInterval(searchRef.current); setPhase("lobby"); }}
              className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {phase === "active" && foundOpponent && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                {selectedMode.label} Duel
              </span>
              <span className="text-xs text-muted-foreground/70">vs {foundOpponent.name}</span>
            </div>
            <ActiveDuel
              mode={selectedMode}
              opponent={foundOpponent}
              matchSeed={matchSeed}
              onComplete={handleComplete}
            />
          </motion.div>
        )}

        {phase === "results" && foundOpponent && duelResult && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DuelResults
              yourPnl={duelResult.yourPnl}
              oppPnl={duelResult.oppPnl}
              yourTrades={duelResult.yourTrades}
              opponent={foundOpponent}
              mode={selectedMode}
              eloChange={eloInfo.change}
              eloBefore={eloInfo.before}
              eloAfter={eloInfo.after}
              onRematch={handleRematch}
              onFindNew={handleFindNew}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
