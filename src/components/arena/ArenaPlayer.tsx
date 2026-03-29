"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, Flag, X, ArrowUpRight, ArrowDownRight, Minus, Zap, Flame } from "lucide-react";
import { MiniChart } from "@/components/learn/practice/MiniChart";
import { MiniTradePanel } from "@/components/learn/practice/MiniTradePanel";
import { useMiniSimulator } from "@/components/learn/practice/useMiniSimulator";
import { ArenaRankBadge } from "./ArenaRankBadge";
import { generateRealisticBars } from "@/data/lessons/practice-data";
import { calculateArenaScore } from "@/types/arena";
import { ARENA_TYPE_PATTERNS, ARENA_PATTERNS_BY_ID } from "@/data/arena/historical-patterns";
import type { ArenaTypeConfig, ArenaNPC } from "@/types/arena";
import type { PracticeChallenge } from "@/data/lessons/types";

interface ArenaPlayerProps {
  config: ArenaTypeConfig;
  opponent: ArenaNPC;
  onFinish: (result: {
    pnl: number;
    pnlPercent: number;
    maxDrawdown: number;
    tradesCount: number;
    winRate: number;
    score: number;
    timeUsedSeconds: number;
  }) => void;
  onCancel: () => void;
}

// ── Opponent simulation (cosmetic) ──────────────────────────

interface OpponentState {
  pnl: number;
  positionDir: "long" | "short" | "flat";
  tradeCount: number;
  lastAction: string;
}

const OPP_ACTIONS = ["Opened Long", "Closed Long", "Opened Short", "Covered Short", "Took Profit", "Cut Loss", "Scaling In", "Flat"];

function simulateOpponent(elapsed: number, timeLimit: number, skill: number, seed: number): OpponentState {
  const progress = elapsed / timeLimit;
  const t = elapsed;
  const baseReturn = skill * 2.5 * progress;
  const noise = (Math.sin(t * 0.7 + seed) * 0.5 + Math.sin(t * 1.3 + seed * 2) * 0.3) * (1 - skill * 0.3);
  const pnl = (baseReturn + noise) * 100;
  const posPhase = Math.sin(t * 0.12 + seed * 0.5);
  const positionDir = posPhase > 0.2 ? "long" : posPhase < -0.2 ? "short" : "flat";
  const tradeCount = Math.max(0, Math.floor(elapsed / 6 + Math.sin(t * 0.4 + seed) * 1.5));
  const actionIdx = Math.abs(Math.floor(Math.sin(t * 0.08 + seed * 3) * OPP_ACTIONS.length)) % OPP_ACTIONS.length;
  return { pnl, positionDir, tradeCount, lastAction: OPP_ACTIONS[actionIdx] };
}

// ── Main ────────────────────────────────────────────────────

export function ArenaPlayer({ config, opponent, onFinish, onCancel }: ArenaPlayerProps) {
  const startingCash = 10000;

  const challenge = useMemo<PracticeChallenge>(() => {
    const matchSeed = Math.floor(Math.random() * 100000);

    // Pick a random historical pattern suited for this arena type
    const patternIds = ARENA_TYPE_PATTERNS[config.id] ?? Object.keys(ARENA_PATTERNS_BY_ID);
    const patternId = patternIds[matchSeed % patternIds.length];
    const pattern = ARENA_PATTERNS_BY_ID[patternId];

    let bars;
    if (pattern) {
      const patternConfig = pattern.getConfig(matchSeed, config.barCount);
      bars = generateRealisticBars({
        count: config.barCount,
        seed: matchSeed,
        ...patternConfig,
      });
    } else {
      bars = generateRealisticBars({
        count: config.barCount,
        startPrice: config.startPrice,
        seed: matchSeed,
        drift: config.barGenConfig.drift ?? 0.002,
        volatility: config.barGenConfig.volatility ?? 0.018,
        meanReversion: config.barGenConfig.meanReversion ?? 0.04,
        target: config.barGenConfig.target ?? 100,
        momentumBias: config.barGenConfig.momentumBias ?? 0.5,
      });
    }
    return { priceData: bars, objectives: [], startingCash, initialReveal: 35 } as PracticeChallenge;
  }, [config]);

  const sim = useMiniSimulator(challenge, {
    playSpeedMs: 650,
    initialIndicators: ["sma20", "ema", "bb", "rsi", "macd", "vwap", "stoch"],
  });

  // Timer state
  const [timeLeft, setTimeLeft] = useState(config.timeLimitSeconds);
  const startTimeRef = useRef(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // Opponent
  const [oppState, setOppState] = useState<OpponentState>({ pnl: 0, positionDir: "flat", tradeCount: 0, lastAction: "Flat" });
  const oppSeedRef = useRef(Math.random() * 1000);
  const [oppActionKey, setOppActionKey] = useState(0);
  const prevOppAction = useRef("Flat");

  useEffect(() => {
    if (isFinished) return;
    const iv = setInterval(() => {
      const el = (Date.now() - startTimeRef.current) / 1000;
      const newState = simulateOpponent(el, config.timeLimitSeconds, opponent.skillLevel, oppSeedRef.current);
      setOppState(newState);
      if (newState.lastAction !== prevOppAction.current) {
        prevOppAction.current = newState.lastAction;
        setOppActionKey((k) => k + 1);
      }
    }, 400);
    return () => clearInterval(iv);
  }, [isFinished, config.timeLimitSeconds, opponent.skillLevel]);

  // Max drawdown tracking
  const maxDDRef = useRef(0);
  const peakRef = useRef(startingCash);
  useEffect(() => { maxDDRef.current = 0; peakRef.current = startingCash; }, []);

  useEffect(() => {
    const val = startingCash + sim.realizedPnL + sim.unrealizedPnL;
    if (val > peakRef.current) peakRef.current = val;
    const dd = ((peakRef.current - val) / peakRef.current) * 100;
    if (dd > maxDDRef.current) maxDDRef.current = dd;
  }, [sim.realizedPnL, sim.unrealizedPnL]);

  // Countdown — time-up = match over
  useEffect(() => {
    if (isFinished) return;
    const iv = setInterval(() => {
      const el = (Date.now() - startTimeRef.current) / 1000;
      const rem = Math.max(0, config.timeLimitSeconds - el);
      setTimeLeft(rem);
      if (rem <= 0) { setIsFinished(true); clearInterval(iv); }
    }, 100);
    return () => clearInterval(iv);
  }, [config.timeLimitSeconds, isFinished]);

  // Auto-play on mount
  useEffect(() => {
    if (isFinished) return;
    sim.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowQuitConfirm((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Finish early
  const handleFinish = useCallback(() => { if (!isFinished) setIsFinished(true); }, [isFinished]);

  // Submit results when finished
  useEffect(() => {
    if (!isFinished) return;
    sim.pause();
    if (sim.position) sim.closePosition();

    const totalPnl = sim.realizedPnL + sim.unrealizedPnL;
    const pnlPct = (totalPnl / startingCash) * 100;
    const timeUsed = (Date.now() - startTimeRef.current) / 1000;
    const tc = sim.trades.length;
    const tpm = tc / Math.max(1, timeUsed / 60);

    // Win rate: FIFO matching for both long and short round-trips
    let wins = 0;
    let trips = 0;
    const buyStack: Array<{ price: number; qty: number }> = [];
    const shortStack: Array<{ price: number; qty: number }> = [];
    for (const t of sim.trades) {
      if (t.side === "buy") buyStack.push({ price: t.price, qty: t.quantity });
      else if (t.side === "sell") {
        let rem = t.quantity;
        while (rem > 0 && buyStack.length > 0) {
          const b = buyStack[0];
          const m = Math.min(b.qty, rem);
          if (t.price > b.price) wins++;
          trips++;
          b.qty -= m; rem -= m;
          if (b.qty <= 0) buyStack.shift();
        }
      } else if (t.side === "short") shortStack.push({ price: t.price, qty: t.quantity });
      else if (t.side === "cover") {
        let rem = t.quantity;
        while (rem > 0 && shortStack.length > 0) {
          const s = shortStack[0];
          const m = Math.min(s.qty, rem);
          if (t.price < s.price) wins++;
          trips++;
          s.qty -= m; rem -= m;
          if (s.qty <= 0) shortStack.shift();
        }
      }
    }
    const winRate = trips > 0 ? (wins / trips) * 100 : 0;

    const score = calculateArenaScore(config.scoringWeights, pnlPct, maxDDRef.current, winRate, tpm);

    onFinish({
      pnl: totalPnl,
      pnlPercent: pnlPct,
      maxDrawdown: maxDDRef.current,
      tradesCount: tc,
      winRate,
      score,
      timeUsedSeconds: Math.min(timeUsed, config.timeLimitSeconds),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const totalPnl = sim.realizedPnL + sim.unrealizedPnL;
  const pnlPct = (totalPnl / startingCash) * 100;
  const secs = Math.floor(timeLeft);
  const mm = Math.floor(secs / 60);
  const ss = secs % 60;

  // P&L comparison: player vs opponent
  const playerAhead = totalPnl > oppState.pnl;
  const pnlDiff = totalPnl - oppState.pnl;
  const maxPnlRange = Math.max(Math.abs(totalPnl), Math.abs(oppState.pnl), 50);
  const playerBarWidth = Math.min(50, (Math.max(0, totalPnl) / maxPnlRange) * 50);
  const oppBarWidth = Math.min(50, (Math.max(0, oppState.pnl) / maxPnlRange) * 50);

  // Time urgency levels
  const isUrgent = timeLeft <= 10;
  const isWarning = timeLeft <= 30 && timeLeft > 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className={cn(
      "flex h-full flex-col bg-background transition-colors",
      isUrgent && "ring-1 ring-inset ring-red-500/20",
    )}>
      {/* Critical time vignette overlay */}
      {isUrgent && (
        <div className="pointer-events-none fixed inset-0 z-40">
          <div className={cn(
            "absolute inset-0 rounded-none",
            isCritical
              ? "bg-red-900/10"
              : "bg-red-900/5",
          )} />
        </div>
      )}

      {/* ═══ Top HUD ═══ */}
      <div className="flex flex-col border-b border-border/20 bg-black/60">
        {/* Row 1: Timer + Controls */}
        <div className="flex items-center gap-2 px-3 py-1.5">
          {/* Timer */}
          <motion.div
            animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
            transition={isCritical ? { duration: 0.5, repeat: Infinity, type: "tween" } : {}}
            className={cn(
              "arena-timer flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-lg font-semibold tabular-nums",
              isUrgent ? "bg-red-500/20 text-red-400"
                : isWarning ? "bg-amber-500/10 text-amber-400"
                : "bg-muted/20 text-foreground",
            )}
          >
            <Clock className={cn("h-4 w-4", isCritical && "animate-ping")} />
            {mm > 0 ? `${mm}:${String(ss).padStart(2, "0")}` : `${ss}s`}
          </motion.div>

          <div className="flex items-center gap-1.5 rounded-lg border border-border/20 bg-muted/10 px-2 py-1">
            <Zap className={cn("h-3 w-3", config.color)} />
            <span className={cn("text-xs font-semibold", config.color)}>{config.name}</span>
          </div>

          <div className="flex-1" />

          {/* Player P&L */}
          <div className="text-right">
            <motion.div
              key={Math.round(totalPnl * 10)}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              className={cn("text-sm font-semibold tabular-nums", totalPnl >= 0 ? "text-emerald-400" : "text-red-400")}
            >
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
            </motion.div>
            <div className="text-xs text-muted-foreground/70 tabular-nums">{pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%</div>
          </div>

          {/* Position badge */}
          <div className="flex items-center gap-1 rounded-lg border border-border/20 bg-muted/10 px-2 py-1">
            {sim.position ? (
              <>
                {sim.position.side === "long"
                  ? <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  : <ArrowDownRight className="h-3 w-3 text-red-400" />}
                <span className={cn("text-xs font-semibold", sim.position.side === "long" ? "text-emerald-400" : "text-red-400")}>
                  {sim.position.side === "long" ? "LONG" : "SHORT"} {sim.position.quantity}
                </span>
              </>
            ) : (
              <><Minus className="h-3 w-3 text-muted-foreground/70" /><span className="text-xs text-muted-foreground/70">FLAT</span></>
            )}
          </div>

          {/* Trades count */}
          <div className="rounded-lg border border-border/20 bg-muted/10 px-2 py-1 text-center">
            <div className="text-xs font-semibold tabular-nums text-muted-foreground">{sim.trades.length}</div>
            <div className="text-[11px] text-muted-foreground/70">trades</div>
          </div>

          {/* Finish */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleFinish} disabled={isFinished}
            className="flex items-center gap-1 rounded-lg bg-muted/20 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-50">
            <Flag className="h-3 w-3" />
            Finish
          </motion.button>
        </div>

        {/* Row 2: P&L Comparison Bar + Opponent */}
        <div className="flex items-center gap-2 px-3 py-1 border-t border-border/20">
          {/* Player label */}
          <span className="text-[11px] font-semibold text-muted-foreground w-8">YOU</span>

          {/* P&L comparison bar */}
          <div className="flex-1 flex items-center h-4 rounded-full bg-foreground/[0.03] overflow-hidden relative">
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/10 z-10" />

            {/* Player bar (left side, grows right from center) */}
            <div className="w-1/2 flex justify-end">
              <motion.div
                className={cn(
                  "h-full rounded-l-full",
                  totalPnl >= 0 ? "bg-emerald-500/40" : "bg-red-500/40",
                )}
                animate={{ width: `${playerBarWidth}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Opponent bar (right side, grows left from center) */}
            <div className="w-1/2 flex justify-start">
              <motion.div
                className={cn(
                  "h-full rounded-r-full",
                  oppState.pnl >= 0 ? "bg-emerald-500/25" : "bg-red-500/25",
                )}
                animate={{ width: `${oppBarWidth}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Diff indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn(
                "text-[11px] font-semibold tabular-nums px-1 rounded",
                playerAhead ? "text-emerald-400" : pnlDiff === 0 ? "text-muted-foreground" : "text-red-400",
              )}>
                {pnlDiff >= 0 ? "+" : ""}{pnlDiff.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Opponent info */}
          <div className="flex items-center gap-1.5">
            <ArenaRankBadge rank={opponent.rank} size="xs" showLabel={false} />
            <span className="text-[11px] font-semibold text-muted-foreground">{opponent.name}</span>
          </div>

          {/* Opponent P&L */}
          <div className={cn("text-xs font-semibold tabular-nums min-w-[50px] text-right", oppState.pnl >= 0 ? "text-emerald-400/60" : "text-red-400/60")}>
            {oppState.pnl >= 0 ? "+" : ""}${oppState.pnl.toFixed(0)}
          </div>

          {/* Opponent position */}
          <div className="flex items-center gap-0.5">
            {oppState.positionDir === "long" && <ArrowUpRight className="h-2.5 w-2.5 text-emerald-400/40" />}
            {oppState.positionDir === "short" && <ArrowDownRight className="h-2.5 w-2.5 text-red-400/40" />}
            {oppState.positionDir === "flat" && <Minus className="h-2.5 w-2.5 text-muted-foreground/50" />}
            <span className="text-[11px] text-muted-foreground/70 tabular-nums">{oppState.tradeCount}t</span>
          </div>

          {/* Opponent activity ticker */}
          <AnimatePresence mode="wait">
            <motion.span
              key={oppActionKey}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.5, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] text-muted-foreground/70 italic min-w-[60px]"
            >
              {oppState.lastAction}
            </motion.span>
          </AnimatePresence>

          {/* Lead indicator */}
          {Math.abs(pnlDiff) > 20 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
                playerAhead ? "bg-emerald-500/5" : "bg-red-500/5",
              )}
            >
              <Flame className={cn("h-2.5 w-2.5", playerAhead ? "text-emerald-400" : "text-red-400")} />
              <span className={cn("text-[11px] font-semibold", playerAhead ? "text-emerald-400" : "text-red-400")}>
                {playerAhead ? "LEAD" : "BEHIND"}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══ Chart + Panel ═══ */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <MiniChart
            bars={challenge.priceData}
            revealedCount={sim.revealedCount}
            trades={sim.trades}
            activeIndicators={sim.activeIndicators}
            currentPrice={sim.currentPrice}
            maxVisibleBars={120}
          />
        </div>
        <div className="w-72 border-l border-border/20 overflow-y-auto">
          <MiniTradePanel
            actionType="free-trade"
            currentPrice={sim.currentPrice}
            cash={sim.cash}
            position={sim.position}
            unrealizedPnL={sim.unrealizedPnL}
            revealedCount={sim.revealedCount}
            totalBars={sim.totalBars}
            isPlaying={sim.isPlaying}
            activeIndicators={sim.activeIndicators}
            allComplete={false}
            onBuy={sim.buy}
            onSell={sim.sell}
            onShort={sim.short}
            onCover={sim.cover}
            onClosePosition={sim.closePosition}
            onAdvance={sim.advance}
            onPlay={sim.play}
            onPause={sim.pause}
            onToggleIndicator={sim.toggleIndicator}
            enableKeyboard
          />
        </div>
      </div>

      {/* ═══ Quit confirm ═══ */}
      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-md border border-border/20 bg-card p-6 text-center shadow-sm">
              <X className="mx-auto mb-3 h-8 w-8 text-red-400" />
              <h3 className="text-sm font-semibold text-foreground">Quit Match?</h3>
              <p className="mt-1 text-xs text-muted-foreground">Your progress will be lost.</p>
              <div className="mt-4 flex items-center gap-3">
                <button type="button" onClick={() => setShowQuitConfirm(false)}
                  className="rounded-lg border border-border/20 bg-muted/20 px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/50">
                  Continue
                </button>
                <button type="button" onClick={onCancel}
                  className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-red-400">
                  Quit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
