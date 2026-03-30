"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Minus, Clock, User, Cpu,
  ArrowUp, ArrowDown, Star,
} from "lucide-react";
import { ArenaRankBadge } from "./ArenaRankBadge";
import { simulateOpponentResult } from "@/data/arena/arena-npcs";
import { calculateEloChange } from "@/types/arena";
import { useArenaStore } from "@/stores/arena-store";
import type { ArenaTypeConfig, ArenaNPC } from "@/types/arena";

// ── Bar countdown display ──────────────────────────────────────

function BarCountdown({ total, revealed }: { total: number; revealed: number }) {
  const bars = Math.min(5, total);
  const filledCount = Math.min(5, Math.floor((revealed / total) * 5));

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "h-1.5 w-5 rounded-full transition-colors duration-300",
            i < filledCount ? "bg-red-500" : "bg-white/10",
          )}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}

// ── Side card ─────────────────────────────────────────────────

interface SideCardProps {
  label: string;
  isPlayer: boolean;
  pnl: number;
  pnlPercent: number;
  tradesCount: number;
  positionDir: "long" | "short" | "flat";
  lastAction?: string;
  /** Show as "vs NPC" faded cosmetic pane */
  isNpc?: boolean;
}

function SideCard({
  label,
  isPlayer,
  pnl,
  pnlPercent,
  tradesCount,
  positionDir,
  lastAction,
  isNpc = false,
}: SideCardProps) {
  const positive = pnl >= 0;
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-3 rounded-xl border p-4",
        isPlayer
          ? "border-cyan-500/20 bg-cyan-500/[0.04]"
          : "border-red-500/20 bg-red-500/[0.04]",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            isPlayer ? "bg-cyan-500/10" : "bg-red-500/10",
          )}
        >
          {isPlayer ? (
            <User className="h-4 w-4 text-cyan-400" />
          ) : (
            <Cpu className="h-4 w-4 text-red-400" />
          )}
        </div>
        <span className={cn("text-sm font-bold", isPlayer ? "text-cyan-300" : "text-red-300")}>
          {label}
        </span>
        {isNpc && (
          <span className="ml-auto text-[10px] text-zinc-600 italic">simulated</span>
        )}
      </div>

      {/* P&L */}
      <div>
        <motion.div
          key={Math.round(pnl * 10)}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className={cn(
            "text-2xl font-black tabular-nums",
            isNpc ? (positive ? "text-green-400/60" : "text-red-400/60") : positive ? "text-green-400" : "text-red-400",
          )}
        >
          {positive ? "+" : ""}${Math.abs(pnl).toFixed(2)}
        </motion.div>
        <div className={cn("text-xs tabular-nums", positive ? "text-green-500/60" : "text-red-500/60")}>
          {positive ? "+" : ""}{pnlPercent.toFixed(2)}%
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
        {/* Position */}
        <div className="flex items-center gap-1">
          {positionDir === "long" && <TrendingUp className="h-3 w-3 text-green-400" />}
          {positionDir === "short" && <TrendingDown className="h-3 w-3 text-red-400" />}
          {positionDir === "flat" && <Minus className="h-3 w-3 text-zinc-600" />}
          <span className={cn(
            "font-medium",
            positionDir === "long" ? "text-green-400" : positionDir === "short" ? "text-red-400" : "text-zinc-600",
          )}>
            {positionDir.toUpperCase()}
          </span>
        </div>

        <span className="text-zinc-700">|</span>
        <span>{tradesCount} trade{tradesCount !== 1 ? "s" : ""}</span>

        {lastAction && (
          <>
            <span className="text-zinc-700">|</span>
            <span className="italic truncate">{lastAction}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ── ELO change animation ───────────────────────────────────────

function EloChangeOverlay({
  eloBefore,
  eloAfter,
  eloChange,
  playerWon,
  onDone,
}: {
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  playerWon: boolean;
  onDone: () => void;
}) {
  const [displayElo, setDisplayElo] = useState(eloBefore);

  useEffect(() => {
    const duration = 1200;
    const start = Date.now();
    const diff = eloAfter - eloBefore;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayElo(Math.round(eloBefore + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [eloBefore, eloAfter]);

  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center gap-3"
    >
      <span className={cn("text-4xl font-black", playerWon ? "text-green-400" : "text-red-400")}>
        {playerWon ? "VICTORY" : "DEFEAT"}
      </span>

      {/* ELO bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-500">ELO</span>
        <span className="text-lg font-bold tabular-nums text-zinc-400">{eloBefore}</span>
        <motion.span
          initial={{ x: -8, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={cn(
            "flex items-center gap-1 text-xl font-black tabular-nums",
            eloChange >= 0 ? "text-green-400" : "text-red-400",
          )}
        >
          {eloChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          {eloChange >= 0 ? "+" : ""}{eloChange}
        </motion.span>
        <motion.span
          className="text-xl font-bold tabular-nums text-zinc-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {displayElo}
        </motion.span>
      </div>

      {playerWon && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1"
        >
          <Star className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">XP Earned</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────

export interface ArenaMatchResult {
  playerWon: boolean;
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  playerScore: number;
  opponentScore: number;
  playerPnL: number;
  playerPnLPercent: number;
  opponentPnL: number;
  opponentPnLPercent: number;
}

interface ArenaMatchProps {
  config: ArenaTypeConfig;
  opponent: ArenaNPC;
  /** Called every time the player trade state changes (from parent) */
  playerPnL: number;
  playerPnLPercent: number;
  playerTradesCount: number;
  playerPosition: "long" | "short" | "flat";
  playerScore: number;
  playerMaxDrawdown: number;
  playerWinRate: number;
  /** Total bars vs revealed count — drives the 5-bar countdown */
  revealedCount: number;
  totalBars: number;
  timeLimitSeconds: number;
  timeLeftSeconds: number;
  isFinished: boolean;
  matchSeed: number;
  onEloAnimationDone?: () => void;
}

export function ArenaMatch({
  config,
  opponent,
  playerPnL,
  playerPnLPercent,
  playerTradesCount,
  playerPosition,
  playerScore,
  playerMaxDrawdown,
  playerWinRate,
  revealedCount,
  totalBars,
  timeLimitSeconds,
  timeLeftSeconds,
  isFinished,
  matchSeed,
  onEloAnimationDone,
}: ArenaMatchProps) {
  const elo = useArenaStore((s) => s.elo);
  const rank = useArenaStore((s) => s.rank);

  // Opponent cosmetic simulation
  const [oppPnl, setOppPnl] = useState(0);
  const [oppDir, setOppDir] = useState<"long" | "short" | "flat">("flat");
  const [oppTrades, setOppTrades] = useState(0);
  const [oppAction, setOppAction] = useState("Flat");
  const prevOppActionRef = useRef("Flat");
  const startTimeRef = useRef(Date.now());

  const OPP_ACTIONS = [
    "Opened Long", "Closed Long", "Opened Short", "Covered Short",
    "Took Profit", "Cut Loss", "Scaling In", "Flat",
  ];

  useEffect(() => {
    if (isFinished) return;
    const iv = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const progress = elapsed / timeLimitSeconds;
      const baseReturn = opponent.skillLevel * 2.5 * progress;
      const noise =
        (Math.sin(elapsed * 0.7 + matchSeed) * 0.5 +
          Math.sin(elapsed * 1.3 + matchSeed * 2) * 0.3) *
        (1 - opponent.skillLevel * 0.3);
      const pnl = (baseReturn + noise) * 100;
      const posPhase = Math.sin(elapsed * 0.12 + matchSeed * 0.5);
      const dir: "long" | "short" | "flat" =
        posPhase > 0.2 ? "long" : posPhase < -0.2 ? "short" : "flat";
      const tc = Math.max(0, Math.floor(elapsed / 6 + Math.sin(elapsed * 0.4 + matchSeed) * 1.5));
      const actionIdx =
        Math.abs(Math.floor(Math.sin(elapsed * 0.08 + matchSeed * 3) * OPP_ACTIONS.length)) %
        OPP_ACTIONS.length;
      const action = OPP_ACTIONS[actionIdx];

      setOppPnl(pnl);
      setOppDir(dir);
      setOppTrades(tc);
      if (action !== prevOppActionRef.current) {
        prevOppActionRef.current = action;
        setOppAction(action);
      }
    }, 400);
    return () => clearInterval(iv);
  }, [isFinished, timeLimitSeconds, opponent.skillLevel, matchSeed]);

  // Final simulated opponent result (after match ends)
  const finalOppResult = isFinished
    ? simulateOpponentResult(opponent, matchSeed, config)
    : null;

  const displayOppPnl = isFinished && finalOppResult ? finalOppResult.pnl : oppPnl;
  const displayOppPnlPct = isFinished && finalOppResult ? finalOppResult.pnlPercent : (oppPnl / 100);

  // ELO outcome
  const playerWon = isFinished && finalOppResult
    ? playerScore > finalOppResult.score
    : false;
  const eloChange = isFinished ? calculateEloChange(elo, opponent.elo, playerWon) : 0;
  const newElo = Math.max(0, elo + eloChange);

  // Time display
  const secs = Math.floor(timeLeftSeconds);
  const mm = Math.floor(secs / 60);
  const ss = secs % 60;
  const isUrgent = timeLeftSeconds <= 10;
  const isWarning = timeLeftSeconds <= 30 && timeLeftSeconds > 10;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.01] p-3">
      {/* Header row: timer + rank badges */}
      <div className="flex items-center gap-3">
        {/* Timer */}
        <motion.div
          animate={isUrgent && !isFinished ? { scale: [1, 1.05, 1] } : {}}
          transition={isUrgent ? { duration: 0.5, repeat: Infinity, type: "tween" } : {}}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-sm font-black tabular-nums",
            isFinished
              ? "bg-white/5 text-zinc-500"
              : isUrgent
              ? "bg-red-500/20 text-red-400"
              : isWarning
              ? "bg-amber-500/10 text-amber-400"
              : "bg-white/5 text-zinc-200",
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          {isFinished
            ? "Done"
            : mm > 0
            ? `${mm}:${String(ss).padStart(2, "0")}`
            : `${ss}s`}
        </motion.div>

        {/* Bar progress */}
        <BarCountdown total={totalBars} revealed={revealedCount} />

        <div className="flex-1" />

        {/* ELO badges */}
        <div className="flex items-center gap-2">
          <ArenaRankBadge rank={rank} size="xs" />
          <span className="text-[10px] tabular-nums text-zinc-600">{elo}</span>
          <span className="text-[10px] text-zinc-700">vs</span>
          <ArenaRankBadge rank={opponent.rank} size="xs" />
          <span className="text-[10px] tabular-nums text-zinc-600">{opponent.elo}</span>
        </div>
      </div>

      {/* Side-by-side cards */}
      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key="live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-3"
          >
            <SideCard
              label="You"
              isPlayer={true}
              pnl={playerPnL}
              pnlPercent={playerPnLPercent}
              tradesCount={playerTradesCount}
              positionDir={playerPosition}
            />
            <SideCard
              label={opponent.name}
              isPlayer={false}
              pnl={oppPnl}
              pnlPercent={oppPnl / 100}
              tradesCount={oppTrades}
              positionDir={oppDir}
              lastAction={oppAction}
              isNpc={true}
            />
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-2"
          >
            {/* Final comparison */}
            <div className="flex w-full gap-3">
              <SideCard
                label="You"
                isPlayer={true}
                pnl={playerPnL}
                pnlPercent={playerPnLPercent}
                tradesCount={playerTradesCount}
                positionDir="flat"
              />
              <SideCard
                label={opponent.name}
                isPlayer={false}
                pnl={displayOppPnl}
                pnlPercent={displayOppPnlPct}
                tradesCount={finalOppResult?.tradesCount ?? oppTrades}
                positionDir="flat"
                isNpc={true}
              />
            </div>

            {/* ELO animation */}
            <EloChangeOverlay
              eloBefore={elo}
              eloAfter={newElo}
              eloChange={eloChange}
              playerWon={playerWon}
              onDone={onEloAnimationDone ?? (() => {})}
            />

            {/* Score comparison */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className={cn("text-2xl font-black tabular-nums", playerWon ? "text-green-400" : "text-zinc-400")}>
                  {playerScore}
                </div>
                <div className="text-[10px] text-zinc-600">Your Score</div>
              </div>
              <span className="text-zinc-700 font-bold">vs</span>
              <div className="text-center">
                <div className={cn("text-2xl font-black tabular-nums", !playerWon ? "text-red-400" : "text-zinc-500")}>
                  {finalOppResult?.score ?? 0}
                </div>
                <div className="text-[10px] text-zinc-600">{opponent.name}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
