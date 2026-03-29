"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  TrendingUp,
  TrendingDown,
  Flame,
  Star,
  BarChart2,
} from "lucide-react";
import { useTradingStore } from "@/stores/trading-store";
import { useGameStore } from "@/stores/game-store";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { TradeRecord } from "@/types/trading";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

type Grade = "A" | "B" | "C" | "D" | "F";

function calcGrade(pnlPct: number): Grade {
  if (pnlPct > 15) return "A";
  if (pnlPct > 5) return "B";
  if (pnlPct > 0) return "C";
  if (pnlPct > -5) return "D";
  return "F";
}

const GRADE_COLOR: Record<Grade, string> = {
  A: "text-emerald-400",
  B: "text-emerald-400",
  C: "text-yellow-400",
  D: "text-orange-400",
  F: "text-red-400",
};

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.round(m / 60)}h`;
}

// ─────────────────────────────────────────────
// Mini portfolio growth SVG (for Portfolio Milestone variant)
// ─────────────────────────────────────────────

function MiniGrowthChart({ value, baseline }: { value: number; baseline: number }) {
  const W = 120;
  const H = 40;
  // Simulate a simple ascending path proportional to % growth
  const pts = [0, 0.2, 0.35, 0.5, 0.6, 0.75, 0.85, 1.0];
  const growth = Math.max(0, (value - baseline) / baseline);
  const scaled = pts.map((t, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - (pts[i] * growth * 0.9 + (i / (pts.length - 1)) * 0.1) * H;
    return `${x},${Math.max(2, y)}`;
  });
  const d = `M ${scaled.join(" L ")}`;
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline
        points={scaled.join(" ")}
        fill="none"
        stroke="rgb(52 211 153)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Variant: Trade Result
// ─────────────────────────────────────────────

function TradeResultCard({
  trade,
  level,
  xp,
  onClose,
}: {
  trade: TradeRecord;
  level: number;
  xp: number;
  onClose: () => void;
}) {
  const pnl = trade.realizedPnL ?? 0;
  const isProfit = pnl >= 0;
  const exitPrice = trade.price;
  const cost = exitPrice * trade.quantity;
  const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
  const grade = calcGrade(pnlPct);
  const pnlSign = isProfit ? "+" : "";
  const dateStr = new Date(trade.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const shareText = `I ${isProfit ? "made" : "lost"} ${pnlSign}${pnlPct.toFixed(1)}% on ${trade.ticker} in FinSim! Grade: ${grade}. Can you beat this? finsim.app`;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareText)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Copy failed — try manually"));
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest text-primary">
            FINSIM
          </span>
          <span className="text-xs text-muted-foreground">Trade Result</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{dateStr}</span>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col items-center gap-3 px-6 py-5">
        {/* Ticker + Grade */}
        <div className="flex w-full items-center justify-between">
          <span className="text-2xl font-bold tracking-wide">{trade.ticker}</span>
          <span className={`text-3xl font-bold ${GRADE_COLOR[grade]}`}>{grade}</span>
        </div>

        {/* P&L */}
        <div className={`flex flex-col items-center ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
          <div className="flex items-center gap-1.5">
            {isProfit ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            <span className="text-3xl font-bold tabular-nums">
              {pnlSign}{formatCurrency(Math.abs(pnl))}
            </span>
          </div>
          <span className="text-sm font-bold opacity-80">
            {pnlSign}{pnlPct.toFixed(1)}%
          </span>
        </div>

        {/* Details row */}
        <div className="grid w-full grid-cols-3 gap-1 rounded-lg bg-background/60 px-3 py-2 text-center text-xs">
          <div>
            <div className="text-muted-foreground">Exit</div>
            <div className="font-bold tabular-nums">{formatCurrency(exitPrice)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Shares</div>
            <div className="font-bold">{trade.quantity}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Fees</div>
            <div className="font-bold">{formatCurrency(trade.fees)}</div>
          </div>
        </div>

        <div className="h-px w-full bg-border/50" />

        {/* Player stats */}
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Level</div>
            <div className="text-lg font-bold text-primary">{level}</div>
          </div>
          <div className="h-8 w-px self-center bg-border/50" />
          <div>
            <div className="text-xs text-muted-foreground">Total XP</div>
            <div className="text-lg font-bold">{xp.toLocaleString()}</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="text-sm font-bold">Can you beat this?</div>
          <div className="text-[11px] text-muted-foreground">finsim.app</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-border px-4 py-3">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Share Text
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-3 py-2 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-accent"
        >
          Dismiss
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Variant: Streak Share
// ─────────────────────────────────────────────

function StreakShareCard({
  streak,
  level,
  onClose,
}: {
  streak: number;
  level: number;
  onClose: () => void;
}) {
  const shareText = `${streak} trade win streak in FinSim! Level ${level}. Can you beat this? finsim.app`;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareText)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Copy failed — try manually"));
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-background/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest text-primary">FINSIM</span>
          <span className="text-xs text-muted-foreground">Win Streak</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 px-6 py-6">
        <Flame className="h-10 w-10 text-orange-400" />
        <div className="flex items-baseline gap-1">
          <span className="text-6xl font-bold tabular-nums text-orange-400">{streak}</span>
          <span className="text-lg font-bold text-muted-foreground">in a row</span>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold">Trade Win Streak</div>
          <div className="text-xs text-muted-foreground">Level {level} • finsim.app</div>
        </div>
        <div className="text-xs text-muted-foreground">Can you beat this?</div>
      </div>

      <div className="flex gap-2 border-t border-border px-4 py-3">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Share Text
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-3 py-2 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-accent"
        >
          Dismiss
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Variant: Level Up Share
// ─────────────────────────────────────────────

function LevelUpShareCard({
  level,
  xp,
  title,
  onClose,
}: {
  level: number;
  xp: number;
  title: string;
  onClose: () => void;
}) {
  const shareText = `I just reached Level ${level} (${title}) in FinSim with ${xp.toLocaleString()} XP! finsim.app`;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareText)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Copy failed — try manually"));
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-background/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest text-primary">FINSIM</span>
          <span className="text-xs text-muted-foreground">Level Up</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 px-6 py-6">
        <Star className="h-10 w-10 text-primary" />
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-muted-foreground">Level</span>
            <span className="text-6xl font-bold tabular-nums text-primary">{level}</span>
          </div>
          <span className="mt-1 text-base font-bold text-foreground">{title}</span>
        </div>
        <div className="rounded-lg bg-background/60 px-4 py-2 text-center">
          <div className="text-xs text-muted-foreground">Total XP</div>
          <div className="text-lg font-bold tabular-nums">{xp.toLocaleString()}</div>
        </div>
        <div className="text-xs text-muted-foreground">finsim.app</div>
      </div>

      <div className="flex gap-2 border-t border-border px-4 py-3">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Share Text
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-3 py-2 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-accent"
        >
          Dismiss
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Variant: Portfolio Milestone
// ─────────────────────────────────────────────

function PortfolioMilestoneCard({
  portfolioValue,
  baseline,
  level,
  onClose,
}: {
  portfolioValue: number;
  baseline: number;
  level: number;
  onClose: () => void;
}) {
  const growthPct = baseline > 0 ? ((portfolioValue - baseline) / baseline) * 100 : 0;
  const shareText = `My FinSim portfolio just hit ${formatCurrency(portfolioValue)}! That's +${growthPct.toFixed(1)}% from start. Level ${level}. finsim.app`;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareText)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Copy failed — try manually"));
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-background/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest text-primary">FINSIM</span>
          <span className="text-xs text-muted-foreground">Portfolio Milestone</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 px-6 py-5">
        <BarChart2 className="h-8 w-8 text-emerald-400" />
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Portfolio Value</div>
          <div className="text-3xl font-bold tabular-nums text-emerald-400">
            {formatCurrency(portfolioValue)}
          </div>
          <div className="text-sm font-bold text-emerald-400">
            +{growthPct.toFixed(1)}% from start
          </div>
        </div>
        <MiniGrowthChart value={portfolioValue} baseline={baseline} />
        <div className="text-xs text-muted-foreground">Level {level} • finsim.app</div>
      </div>

      <div className="flex gap-2 border-t border-border px-4 py-3">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Share Text
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-3 py-2 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-accent"
        >
          Dismiss
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Main component — dispatches variants
// ─────────────────────────────────────────────

type ShareVariant =
  | { type: "trade"; trade: TradeRecord }
  | { type: "streak"; streak: number }
  | { type: "levelup"; level: number; xp: number; title: string }
  | { type: "portfolio"; portfolioValue: number; baseline: number };

export function TradeShareCard() {
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState<ShareVariant | null>(null);
  const prevLengthRef = useRef(0);
  const prevLevelRef = useRef(0);
  const prevPortfolioRef = useRef(0);
  const prevStreakRef = useRef(0);

  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const level = useGameStore((s) => s.level);
  const xp = useGameStore((s) => s.xp);
  const title = useGameStore((s) => s.title);
  const stats = useGameStore((s) => s.stats);

  // Initialize refs without triggering cards on first render
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevLengthRef.current = tradeHistory.length;
      prevLevelRef.current = level;
      prevPortfolioRef.current = stats.portfolioValue;
      prevStreakRef.current = stats.consecutiveWins;
      return;
    }

    // New sell trade
    if (tradeHistory.length > prevLengthRef.current) {
      const newest = tradeHistory[0];
      if (newest && newest.side === "sell" && newest.realizedPnL !== undefined) {
        setVariant({ type: "trade", trade: newest });
        setVisible(true);
      }
      prevLengthRef.current = tradeHistory.length;

      // Check streak milestone (3, 5, 10, 15...)
      const STREAK_MILESTONES = [3, 5, 10, 15, 20];
      const prev = prevStreakRef.current;
      const curr = stats.consecutiveWins;
      const milestone = STREAK_MILESTONES.find((m) => curr >= m && prev < m);
      if (milestone && !visible) {
        setVariant({ type: "streak", streak: milestone });
        setVisible(true);
      }
      prevStreakRef.current = curr;
    }

    // Level up
    if (level > prevLevelRef.current && prevLevelRef.current > 0) {
      setVariant({ type: "levelup", level, xp, title });
      setVisible(true);
      prevLevelRef.current = level;
    } else {
      prevLevelRef.current = level;
    }

    // Portfolio milestone ($110k, $120k, $150k, $200k...)
    const PORTFOLIO_MILESTONES = [110000, 120000, 150000, 200000, 300000, 500000];
    const prevP = prevPortfolioRef.current;
    const currP = stats.portfolioValue;
    const pMilestone = PORTFOLIO_MILESTONES.find((m) => currP >= m && prevP < m);
    if (pMilestone && !visible) {
      setVariant({ type: "portfolio", portfolioValue: currP, baseline: 100000 });
      setVisible(true);
    }
    prevPortfolioRef.current = currP;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeHistory, level, stats.portfolioValue, stats.consecutiveWins]);

  if (!variant) return null;

  const handleClose = () => setVisible(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            {variant.type === "trade" && (
              <TradeResultCard
                trade={variant.trade}
                level={level}
                xp={xp}
                onClose={handleClose}
              />
            )}
            {variant.type === "streak" && (
              <StreakShareCard
                streak={variant.streak}
                level={level}
                onClose={handleClose}
              />
            )}
            {variant.type === "levelup" && (
              <LevelUpShareCard
                level={variant.level}
                xp={variant.xp}
                title={variant.title}
                onClose={handleClose}
              />
            )}
            {variant.type === "portfolio" && (
              <PortfolioMilestoneCard
                portfolioValue={variant.portfolioValue}
                baseline={variant.baseline}
                level={level}
                onClose={handleClose}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
