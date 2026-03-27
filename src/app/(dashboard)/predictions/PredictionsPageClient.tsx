"use client";

import { useState, useMemo, useCallback } from "react";
import {
  TrendingUp,
  Target,
  BarChart3,
  Coins,
  Info,
  ArrowUpDown,
  Briefcase,
  Trophy,
  Calculator,
  BookOpen,
  Search,
  X,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PREDICTION_MARKETS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type MarketCategory,
} from "@/data/prediction-markets";
import type { PredictionMarket } from "@/data/prediction-markets";
import {
  ACTIVE_MARKETS,
  type ActiveMarket,
} from "@/data/active-prediction-markets";
import { usePredictionMarketStore } from "@/stores/prediction-market-store";
import { AccuracyTracker } from "@/components/predictions/AccuracyTracker";
import { PredictionLeaderboard } from "@/components/predictions/PredictionLeaderboard";
import { KellyCalculator } from "@/components/predictions/KellyCalculator";
import { MarketDepth } from "@/components/predictions/MarketDepth";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// ── Types ─────────────────────────────────────────────────────────────────────

type PageTab = "markets" | "bets" | "leaderboard" | "tools";
type FilterTab = "all" | MarketCategory;
type SortMode = "volume" | "closing" | "probability" | "activity";

const PAGE_TABS: { value: PageTab; label: string; icon: React.ReactNode }[] = [
  { value: "markets", label: "Markets", icon: <TrendingUp className="h-3 w-3" /> },
  { value: "bets", label: "My Bets", icon: <Briefcase className="h-3 w-3" /> },
  { value: "leaderboard", label: "Leaderboard", icon: <Trophy className="h-3 w-3" /> },
  { value: "tools", label: "Tools", icon: <Calculator className="h-3 w-3" /> },
];

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "fed", label: "Fed" },
  { value: "macro", label: "Macro" },
  { value: "equities", label: "Equities" },
  { value: "crypto", label: "Crypto" },
  { value: "earnings", label: "Earnings" },
  { value: "geopolitics", label: "Geopolitics" },
];

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "volume", label: "By Volume" },
  { value: "closing", label: "Closing Soon" },
  { value: "probability", label: "Probability" },
  { value: "activity", label: "Recent Activity" },
];

type ToolTab = "kelly" | "depth" | "calibration" | "tips";

// ── Seeded PRNG helpers ────────────────────────────────────────────────────────

function hashStr(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (Math.imul(h, 0x01000193) >>> 0);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Synthetic computed fields from seeded PRNG — deterministic per market id
function getMarketVolume(m: PredictionMarket): number {
  const rand = mulberry32(hashStr(m.id + "vol"));
  return Math.round(rand() * 50000 + 1000);
}

function getMarketActivity(m: PredictionMarket): number {
  const rand = mulberry32(hashStr(m.id + "act"));
  return Math.round(rand() * 200 + 1);
}

function getPriceHistory(m: PredictionMarket): number[] {
  const rand = mulberry32(hashStr(m.id + "ph"));
  const pts: number[] = [m.initialProbability];
  for (let i = 1; i < 20; i++) {
    const last = pts[i - 1];
    const noise = (rand() - 0.5) * 8;
    pts.push(Math.max(2, Math.min(98, Math.round(last + noise))));
  }
  return pts;
}

function getRecentTrades(m: PredictionMarket): { side: "YES" | "NO"; amount: number; price: number; timeAgo: string }[] {
  const rand = mulberry32(hashStr(m.id + "trades"));
  const times = ["2m ago", "5m ago", "12m ago", "23m ago", "41m ago", "1h ago", "2h ago"];
  return Array.from({ length: 5 }, (_, i) => ({
    side: rand() > 0.5 ? "YES" : "NO",
    amount: Math.round(rand() * 500 + 50),
    price: m.initialProbability + Math.round((rand() - 0.5) * 10),
    timeAgo: times[i] ?? "3h ago",
  }));
}

// ── Sparkline ──────────────────────────────────────────────────────────────────

function Sparkline({ data, width = 60, height = 24 }: { data: number[]; width?: number; height?: number }) {
  const pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const delta = data[data.length - 1] - data[0];
  const stroke = delta > 2 ? "#22c55e" : delta < -2 ? "#ef4444" : "#71717a";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Market Card (compact grid view) ───────────────────────────────────────────

function MarketCard({
  market,
  priceHistory,
  volume,
  onSelect,
}: {
  market: PredictionMarket;
  priceHistory: number[];
  volume: number;
  onSelect: (m: PredictionMarket) => void;
}) {
  const bet = usePredictionMarketStore((s) => s.getMarketBet(market.id));

  return (
    <button
      onClick={() => onSelect(market)}
      className="group w-full rounded-lg border border-border bg-card p-3.5 text-left transition-colors hover:border-border/60 hover:bg-muted/10"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5 flex-wrap">
            <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider", CATEGORY_COLORS[market.category])}>
              {CATEGORY_LABELS[market.category]}
            </span>
            {bet && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-primary">
                {bet.position.toUpperCase()}
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-[12px] font-medium leading-snug text-foreground">
            {market.question}
          </p>
        </div>
        <Sparkline data={priceHistory} />
      </div>

      {/* YES probability bar */}
      <div className="mb-2">
        <div className="mb-1 flex justify-between text-[10px]">
          <span className="font-semibold text-green-400">YES {market.initialProbability}%</span>
          <span className="text-red-400/80">NO {100 - market.initialProbability}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-red-500/15">
          <div className="h-full rounded-full bg-green-500/60 transition-all" style={{ width: `${market.initialProbability}%` }} />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2 font-mono tabular-nums">
          <span className="flex items-center gap-0.5">
            <BarChart3 className="h-3 w-3" />
            ${volume.toLocaleString()}
          </span>
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {market.expiresInDays}d
          </span>
        </div>
        <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
      </div>
    </button>
  );
}

// ── Price History Chart (SVG) ──────────────────────────────────────────────────

function PriceHistoryChart({ data, title }: { data: number[]; title: string }) {
  const w = 400;
  const h = 100;
  const pad = { top: 10, right: 16, bottom: 20, left: 36 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const min = Math.max(0, Math.min(...data) - 5);
  const max = Math.min(100, Math.max(...data) + 5);
  const range = max - min || 1;

  const toX = (i: number) => pad.left + (i / (data.length - 1)) * plotW;
  const toY = (v: number) => pad.top + (1 - (v - min) / range) * plotH;

  const points = data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");

  // Filled area under curve
  const areaPoints =
    `${toX(0).toFixed(1)},${(pad.top + plotH).toFixed(1)} ` +
    data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ") +
    ` ${toX(data.length - 1).toFixed(1)},${(pad.top + plotH).toFixed(1)}`;

  const delta = data[data.length - 1] - data[0];
  const lineColor = delta >= 0 ? "#22c55e" : "#ef4444";

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        <span className={cn("font-mono tabular-nums text-xs font-semibold", delta >= 0 ? "text-green-400" : "text-red-400")}>
          {delta >= 0 ? "+" : ""}{delta.toFixed(0)}pp
        </span>
      </div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full" aria-hidden="true">
        {/* Grid lines */}
        {[25, 50, 75].map((v) => (
          <line key={v} x1={pad.left} x2={pad.left + plotW} y1={toY(v)} y2={toY(v)} stroke="currentColor" strokeOpacity={0.08} strokeDasharray="3 3" />
        ))}
        {/* Area fill */}
        <polygon points={areaPoints} fill={lineColor} fillOpacity={0.08} />
        {/* Line */}
        <polyline points={points} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Current dot */}
        <circle cx={toX(data.length - 1)} cy={toY(data[data.length - 1])} r={3} fill={lineColor} />
        {/* Y axis labels */}
        {[25, 50, 75].map((v) => (
          <text key={v} x={pad.left - 4} y={toY(v) + 3} textAnchor="end" fontSize={8} className="fill-muted-foreground">{v}%</text>
        ))}
        {/* X axis labels */}
        {[0, Math.floor((data.length - 1) / 2), data.length - 1].map((i, idx) => (
          <text key={idx} x={toX(i)} y={h - 4} textAnchor="middle" fontSize={8} className="fill-muted-foreground">
            {i === 0 ? "Start" : i === data.length - 1 ? "Now" : "Mid"}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── Market Detail Drawer ───────────────────────────────────────────────────────

function MarketDetailDrawer({
  market,
  onClose,
}: {
  market: PredictionMarket;
  onClose: () => void;
}) {
  const [orderSide, setOrderSide] = useState<"yes" | "no">("yes");
  const [betAmount, setBetAmount] = useState(50);
  const [betProbability, setBetProbability] = useState(market.initialProbability);

  const placeBet = usePredictionMarketStore((s) => s.placeBet);
  const insightPoints = usePredictionMarketStore((s) => s.insightPoints);
  const existingBet = usePredictionMarketStore((s) => s.getMarketBet(market.id));

  const priceHistory = useMemo(() => getPriceHistory(market), [market.id]);
  const recentTrades = useMemo(() => getRecentTrades(market), [market.id]);
  const volume = useMemo(() => getMarketVolume(market), [market.id]);

  // Find matching ActiveMarket for order book
  const activeMarket: ActiveMarket | undefined = useMemo(
    () => ACTIVE_MARKETS.find((m) => m.id === market.id) ?? ACTIVE_MARKETS[0],
    [market.id],
  );

  const expectedPayout = useMemo(() => {
    const prob = betProbability / 100;
    if (orderSide === "yes") return Math.round(betAmount * (1 / prob));
    return Math.round(betAmount * (1 / (1 - prob)));
  }, [orderSide, betAmount, betProbability]);

  const handlePlaceBet = () => {
    if (existingBet) return;
    if (betAmount > insightPoints) return;
    placeBet(market.id, orderSide, betAmount, betProbability);
  };

  const difficultyLabel = market.difficulty === 1 ? "Easy" : market.difficulty === 2 ? "Medium" : "Hard";

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Back button */}
      <button
        onClick={onClose}
        className="mb-4 flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to markets
      </button>

      {/* Header */}
      <div className="mb-4 rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-1.5 flex-wrap">
          <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider", CATEGORY_COLORS[market.category])}>
            {CATEGORY_LABELS[market.category]}
          </span>
          <span className="text-[10px] text-muted-foreground">{difficultyLabel}</span>
          <span className="text-[10px] text-muted-foreground">{market.expiresInDays}d left</span>
        </div>
        <h2 className="mb-2 text-sm font-semibold leading-snug text-foreground">{market.question}</h2>
        <p className="text-[11px] leading-relaxed text-muted-foreground">{market.description}</p>
      </div>

      {/* Resolution criteria */}
      <div className="mb-4 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Resolution Criteria</div>
        <p className="text-[11px] leading-relaxed text-foreground/80">{market.resolutionCriteria}</p>
      </div>

      {/* Price history chart */}
      <div className="mb-4">
        <PriceHistoryChart data={priceHistory} title="YES Probability History" />
      </div>

      {/* Stats row */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: "YES prob", value: `${market.initialProbability}%` },
          { label: "Volume", value: `$${(volume / 1000).toFixed(1)}K` },
          { label: "Closes", value: `${market.expiresInDays}d` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-card px-3 py-2 text-center">
            <div className="text-[9px] text-muted-foreground">{label}</div>
            <div className="font-mono tabular-nums text-sm font-semibold text-foreground">{value}</div>
          </div>
        ))}
      </div>

      {/* Order book */}
      <div className="mb-4">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Order Book</div>
        <MarketDepth market={activeMarket} />
      </div>

      {/* Trade panel */}
      {!existingBet ? (
        <div className="mb-4 rounded-lg border border-border bg-card p-4">
          <div className="mb-3 text-xs font-semibold text-foreground">Place a Prediction</div>

          {/* YES / NO toggle */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setOrderSide("yes")}
              className={cn(
                "rounded-lg py-2 text-xs font-semibold transition-colors",
                orderSide === "yes"
                  ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/30"
                  : "bg-green-500/8 text-green-400/60 hover:bg-green-500/12",
              )}
            >
              YES {market.initialProbability}%
            </button>
            <button
              onClick={() => setOrderSide("no")}
              className={cn(
                "rounded-lg py-2 text-xs font-semibold transition-colors",
                orderSide === "no"
                  ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                  : "bg-red-500/8 text-red-400/60 hover:bg-red-500/12",
              )}
            >
              NO {100 - market.initialProbability}%
            </button>
          </div>

          {/* Amount slider */}
          <div className="mb-3">
            <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
              <span>Stake</span>
              <span className="font-semibold text-foreground">{betAmount} pts</span>
            </div>
            <input
              type="range"
              min={10}
              max={Math.min(100, insightPoints)}
              step={10}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
              <span>10</span><span>{Math.min(100, insightPoints)}</span>
            </div>
          </div>

          {/* My probability */}
          <div className="mb-3">
            <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
              <span>My probability estimate</span>
              <span className="font-semibold text-foreground">{betProbability}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={99}
              step={1}
              value={betProbability}
              onChange={(e) => setBetProbability(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
              <span>1%</span><span>99%</span>
            </div>
          </div>

          {/* Payout calculation */}
          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Stake", value: `${betAmount} pts` },
              { label: "Payout if correct", value: `${expectedPayout} pts`, highlight: true },
              { label: "Profit", value: `+${expectedPayout - betAmount} pts`, highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="rounded bg-muted/50 px-2 py-1.5">
                <div className="text-[9px] text-muted-foreground">{label}</div>
                <div className={cn("text-xs font-semibold", highlight ? "text-green-400" : "text-foreground")}>{value}</div>
              </div>
            ))}
          </div>

          <button
            onClick={handlePlaceBet}
            disabled={betAmount > insightPoints}
            className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            Place Bet — {betAmount} pts
          </button>
        </div>
      ) : (
        <div className="mb-4 rounded-lg border border-border bg-muted/20 px-3 py-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your Bet</div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className={cn("rounded px-1.5 py-0.5 font-semibold uppercase text-[10px]", existingBet.position === "yes" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
              {existingBet.position.toUpperCase()}
            </span>
            <span className="text-muted-foreground">{existingBet.amount} pts at {Math.round(existingBet.probability * 100)}%</span>
          </div>
        </div>
      )}

      {/* Recent trades */}
      <div className="mb-4">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Trades</div>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {recentTrades.map((trade, i) => (
            <div key={i} className={cn("flex items-center justify-between px-3 py-2 text-[11px]", i < recentTrades.length - 1 ? "border-b border-border/50" : "")}>
              <div className="flex items-center gap-2">
                <span className={cn("rounded px-1 py-0.5 text-[9px] font-semibold", trade.side === "YES" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                  {trade.side}
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">{trade.price}%</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="font-mono tabular-nums">${trade.amount}</span>
                <span className="text-[10px]">{trade.timeAgo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational note */}
      <div className="mb-4 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Why This Matters</div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">{market.educationalNote}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {market.relatedConcepts.map((c) => (
            <span key={c} className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-foreground/60">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── My Bets Tab ────────────────────────────────────────────────────────────────

function MyBetsTab() {
  const bets = usePredictionMarketStore((s) => s.bets);
  const insightPoints = usePredictionMarketStore((s) => s.insightPoints);
  const totalResolved = usePredictionMarketStore((s) => s.totalResolved);
  const correctPredictions = usePredictionMarketStore((s) => s.correctPredictions);
  const resolveBet = usePredictionMarketStore((s) => s.resolveBet);

  const activeBets = useMemo(() => bets.filter((b) => !b.resolved), [bets]);
  const resolvedBets = useMemo(() => bets.filter((b) => b.resolved), [bets]);

  const totalStaked = useMemo(() => bets.reduce((sum, b) => sum + b.amount, 0), [bets]);
  const totalWon = useMemo(() => resolvedBets.reduce((sum, b) => sum + ((b.payout ?? 0) > b.amount ? (b.payout ?? 0) - b.amount : 0), 0), [resolvedBets]);
  const totalLost = useMemo(() => resolvedBets.reduce((sum, b) => sum + ((b.payout ?? 0) === 0 ? b.amount : 0), 0), [resolvedBets]);
  const netPnl = totalWon - totalLost;
  const roi = totalStaked > 0 ? ((netPnl / totalStaked) * 100) : 0;

  if (bets.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card text-center">
        <Briefcase className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">No bets placed yet</p>
        <p className="max-w-xs text-xs text-muted-foreground/60">Switch to the Markets tab to browse open prediction markets and place your first bet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          { label: "Total Staked", value: `${totalStaked} pts` },
          { label: "Total Won", value: `+${totalWon} pts`, color: "text-green-400" },
          { label: "Total Lost", value: `-${totalLost} pts`, color: "text-red-400" },
          { label: "Net P&L", value: `${netPnl >= 0 ? "+" : ""}${netPnl} pts`, color: netPnl >= 0 ? "text-green-400" : "text-red-400" },
          { label: "ROI", value: `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`, color: roi >= 0 ? "text-green-400" : "text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg border border-border bg-card px-3 py-2">
            <div className="text-[9px] text-muted-foreground">{label}</div>
            <div className={cn("font-mono tabular-nums text-sm font-semibold", color ?? "text-foreground")}>{value}</div>
          </div>
        ))}
      </div>

      {/* Accuracy tracker */}
      <AccuracyTracker />

      {/* Active bets */}
      {activeBets.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active Positions ({activeBets.length})
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-[11px] min-w-[480px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Market</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">Position</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Stake</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Est. Payout</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Odds</th>
                </tr>
              </thead>
              <tbody>
                {activeBets.map((bet) => {
                  const market = PREDICTION_MARKETS.find((m) => m.id === bet.marketId);
                  const prob = bet.probability;
                  const estPayout = bet.position === "yes"
                    ? Math.round(bet.amount * (1 / prob))
                    : Math.round(bet.amount * (1 / (1 - prob)));
                  const estPnl = estPayout - bet.amount;
                  return (
                    <tr key={bet.marketId + bet.timestamp} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="max-w-[200px] truncate px-3 py-2 text-foreground">
                        {market?.question.slice(0, 40) ?? bet.marketId}
                        {(market?.question.length ?? 0) > 40 ? "…" : ""}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", bet.position === "yes" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                          {bet.position.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{bet.amount} pts</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                        {estPayout} pts
                        <span className="ml-1 text-green-400/80">(+{estPnl})</span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                        {Math.round(prob * 100)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resolved bets */}
      {resolvedBets.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Resolved Bets ({resolvedBets.length})
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-[11px] min-w-[480px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Market</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">Position</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">Outcome</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Stake</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">P&L</th>
                </tr>
              </thead>
              <tbody>
                {resolvedBets.slice().reverse().map((bet) => {
                  const market = PREDICTION_MARKETS.find((m) => m.id === bet.marketId);
                  const isCorrect = (bet.position === "yes" && bet.outcome === true) || (bet.position === "no" && bet.outcome === false);
                  const pnl = (bet.payout ?? 0) - bet.amount;
                  return (
                    <tr key={bet.marketId + bet.timestamp} className="border-b border-border/50 last:border-0">
                      <td className="max-w-[200px] truncate px-3 py-2 text-foreground">
                        {market?.question.slice(0, 40) ?? bet.marketId}
                        {(market?.question.length ?? 0) > 40 ? "…" : ""}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", bet.position === "yes" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                          {bet.position.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {isCorrect ? (
                          <span className="flex items-center justify-center gap-0.5 text-green-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="text-[10px] font-semibold">Correct</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-0.5 text-red-400">
                            <XCircle className="h-3 w-3" />
                            <span className="text-[10px] font-semibold">Wrong</span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{bet.amount} pts</td>
                      <td className={cn("px-3 py-2 text-right font-mono tabular-nums font-semibold", pnl >= 0 ? "text-green-400" : "text-red-400")}>
                        {pnl >= 0 ? "+" : ""}{pnl} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Calibration Chart ──────────────────────────────────────────────────────────

function CalibrationChartSection() {
  const bets = usePredictionMarketStore((s) => s.bets);

  const calibrationData = useMemo(() => {
    const resolvedBets = bets.filter((b) => b.resolved);
    const buckets: Record<string, { sum: number; count: number; actual: number }> = {};
    for (const bet of resolvedBets) {
      const forecast = bet.position === "yes" ? bet.probability : 1 - bet.probability;
      const bucket = (Math.floor(forecast * 10) / 10).toFixed(1);
      if (!buckets[bucket]) buckets[bucket] = { sum: 0, count: 0, actual: 0 };
      buckets[bucket].sum += forecast;
      buckets[bucket].count += 1;
      buckets[bucket].actual += bet.outcome ? 1 : 0;
    }
    return Object.entries(buckets).map(([bucket, { sum, count, actual }]) => ({
      bucket,
      predicted: sum / count,
      actual: actual / count,
      count,
    }));
  }, [bets]);

  const w = 320;
  const h = 200;
  const pad = { top: 20, right: 20, bottom: 36, left: 40 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  if (calibrationData.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
        Resolve bets to see your calibration chart
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Predicted vs Actual Outcomes</h3>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxWidth: w }} aria-hidden>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <line key={`g-${v}`} x1={pad.left} x2={pad.left + plotW} y1={pad.top + plotH * (1 - v)} y2={pad.top + plotH * (1 - v)} stroke="currentColor" strokeOpacity={0.1} />
        ))}
        {/* Perfect calibration line */}
        <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="4 4" />
        {calibrationData.map((d, i) => (
          <circle key={i} cx={pad.left + d.predicted * plotW} cy={pad.top + (1 - d.actual) * plotH} r={Math.min(9, 3 + d.count)} fill="hsl(var(--primary))" fillOpacity={0.6} stroke="hsl(var(--primary))" strokeWidth={1} />
        ))}
        {/* Axis labels */}
        <text x={pad.left + plotW / 2} y={h - 4} textAnchor="middle" className="fill-muted-foreground text-[10px]" fontSize={10}>Predicted Probability</text>
        {[0, 0.5, 1].map((v) => (
          <text key={`xl-${v}`} x={pad.left + v * plotW} y={pad.top + plotH + 14} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>{Math.round(v * 100)}%</text>
        ))}
        {[0, 0.5, 1].map((v) => (
          <text key={`yl-${v}`} x={pad.left - 6} y={pad.top + plotH * (1 - v) + 3} textAnchor="end" className="fill-muted-foreground" fontSize={9}>{Math.round(v * 100)}%</text>
        ))}
      </svg>
      <p className="mt-1 text-center text-[10px] text-muted-foreground">Points on the dashed line = perfectly calibrated</p>
    </div>
  );
}

// ── Predictor Tips ─────────────────────────────────────────────────────────────

const PREDICTOR_TIPS = [
  {
    title: "Think in probabilities, not certainties",
    body: "Even a 90% confident prediction is wrong 10% of the time. Always assign a probability, never say something 'will' or 'won't' happen.",
  },
  {
    title: "Use base rates as your anchor",
    body: "Before adjusting for new information, ask: historically, how often does this type of event happen? Start from that base rate.",
  },
  {
    title: "Update beliefs on new evidence",
    body: "Good forecasters change their predictions when relevant new information arrives. Stubbornness is the enemy of accuracy.",
  },
  {
    title: "Avoid inside view bias",
    body: "Don't let your enthusiasm for a specific scenario override historical frequencies. The 'reference class' of similar events usually wins.",
  },
  {
    title: "Track and review your predictions",
    body: "The Brier score and calibration chart show whether your 70% confident calls really happen 70% of the time. Review regularly.",
  },
];

function PredictorTips() {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How to Be a Good Predictor</h2>
      {PREDICTOR_TIPS.map((tip, i) => (
        <div key={i} className="rounded-lg border border-border bg-card px-4 py-3">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {i + 1}
            </span>
            <span className="text-xs font-semibold text-foreground">{tip.title}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground pl-7">{tip.body}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main PredictionsPageClient ────────────────────────────────────────────────

export function PredictionsPageClient() {
  const [pageTab, setPageTab] = useState<PageTab>("markets");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [sortMode, setSortMode] = useState<SortMode>("closing");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const [toolTab, setToolTab] = useState<ToolTab>("kelly");
  const [depthMarketIndex, setDepthMarketIndex] = useState(0);

  const insightPoints = usePredictionMarketStore((s) => s.insightPoints);
  const bets = usePredictionMarketStore((s) => s.bets);
  const totalResolved = usePredictionMarketStore((s) => s.totalResolved);
  const storeRef = usePredictionMarketStore.getState;
  const accuracy = useMemo(() => storeRef().getAccuracy(), [storeRef, bets, totalResolved]);
  const brierScore = useMemo(() => storeRef().getBrierScore(), [storeRef, bets]);

  const activeBetCount = useMemo(() => bets.filter((b) => !b.resolved).length, [bets]);

  // Filtered + sorted markets
  const filteredMarkets = useMemo(() => {
    let markets =
      activeFilter === "all"
        ? [...PREDICTION_MARKETS]
        : PREDICTION_MARKETS.filter((m) => m.category === activeFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      markets = markets.filter(
        (m) =>
          m.question.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q),
      );
    }

    switch (sortMode) {
      case "volume":
        markets.sort((a, b) => getMarketVolume(b) - getMarketVolume(a));
        break;
      case "closing":
        markets.sort((a, b) => a.expiresInDays - b.expiresInDays);
        break;
      case "probability":
        markets.sort((a, b) => b.initialProbability - a.initialProbability);
        break;
      case "activity":
        markets.sort((a, b) => getMarketActivity(b) - getMarketActivity(a));
        break;
    }
    return markets;
  }, [activeFilter, sortMode, searchQuery]);

  const handleSelectMarket = useCallback((m: PredictionMarket) => {
    setSelectedMarket(m);
  }, []);

  const handleCloseMarket = useCallback(() => {
    setSelectedMarket(null);
  }, []);

  const selectedDepthMarket = ACTIVE_MARKETS[depthMarketIndex] ?? ACTIVE_MARKETS[0];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/50 px-4 pt-4 pb-0">
        <div className="flex items-center gap-3 pb-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
            <TrendingUp className="h-4 w-4 text-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold tracking-tight">Prediction Markets</h1>
            <p className="text-xs text-muted-foreground">
              {PREDICTION_MARKETS.length} markets — bet on real outcomes, learn probability thinking
            </p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono tabular-nums text-xs font-semibold text-foreground">
              {insightPoints.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Page-level tabs */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {PAGE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setPageTab(tab.value); setSelectedMarket(null); }}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-[11px] font-medium transition-colors",
                pageTab === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.value === "bets" && activeBetCount > 0 && (
                <span className="rounded-full bg-primary/20 px-1 text-[9px] font-bold text-primary">{activeBetCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row (Markets tab only) */}
      {pageTab === "markets" && (
        <div className="border-b border-border/50 px-4 py-2">
          <div className="flex flex-wrap items-center gap-3">
            <StatChip icon={<BarChart3 className="h-3 w-3" />} label="Bets" value={String(bets.length)} />
            <StatChip icon={<Target className="h-3 w-3" />} label="Accuracy" value={totalResolved > 0 ? `${accuracy}%` : "--"} />
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center gap-1.5 rounded bg-muted/50 px-2 py-1">
                  <span className="text-[10px] text-muted-foreground">Brier</span>
                  <span className="font-mono tabular-nums text-xs font-semibold text-foreground">
                    {totalResolved > 0 ? brierScore.toFixed(3) : "--"}
                  </span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-64 text-xs">
                Brier Score measures calibration (0 = perfect, 1 = worst). Below 0.25 is well-calibrated.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Markets Tab */}
      {pageTab === "markets" && (
        <div className="flex flex-1 overflow-hidden">
          {/* Main markets list / detail */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {selectedMarket ? (
              <div className="flex-1 overflow-y-auto p-4">
                <MarketDetailDrawer market={selectedMarket} onClose={handleCloseMarket} />
              </div>
            ) : (
              <>
                {/* Search + filter + sort bar */}
                <div className="border-b border-border/50 px-4 py-3 space-y-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search markets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-md border border-border bg-muted/30 py-1.5 pl-8 pr-8 text-[11px] text-foreground placeholder-muted-foreground/60 outline-none focus:border-primary/50"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>

                  {/* Category filter + sort */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center gap-1 overflow-x-auto">
                      {FILTER_TABS.map((tab) => (
                        <button
                          key={tab.value}
                          onClick={() => setActiveFilter(tab.value)}
                          className={cn(
                            "shrink-0 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors",
                            activeFilter === tab.value
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-border/40 text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      <select
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value as SortMode)}
                        className="appearance-none rounded bg-muted px-2 py-1 text-[10px] font-medium text-foreground outline-none"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Market grid */}
                <div className="flex-1 overflow-y-auto p-4">
                  {filteredMarkets.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {filteredMarkets.map((market) => (
                        <div key={market.id} id={`market-${market.id}`}>
                          <MarketCard
                            market={market}
                            priceHistory={getPriceHistory(market)}
                            volume={getMarketVolume(market)}
                            onSelect={handleSelectMarket}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center gap-1 text-sm text-muted-foreground">
                      <span>No markets found</span>
                      <span className="text-xs text-muted-foreground/60">Try a different category or search term</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* My Bets Tab */}
      {pageTab === "bets" && (
        <div className="flex-1 overflow-y-auto p-4">
          <MyBetsTab />
        </div>
      )}

      {/* Leaderboard Tab */}
      {pageTab === "leaderboard" && (
        <div className="flex-1 overflow-y-auto p-4">
          <PredictionLeaderboard />
        </div>
      )}

      {/* Tools Tab */}
      {pageTab === "tools" && (
        <div className="flex-1 overflow-y-auto">
          {/* Tool sub-tabs */}
          <div className="border-b border-border/50 px-4">
            <div className="flex items-center gap-0.5 overflow-x-auto">
              {(
                [
                  { value: "kelly", label: "Kelly Calculator", icon: <Calculator className="h-3 w-3" /> },
                  { value: "depth", label: "Market Depth", icon: <BarChart3 className="h-3 w-3" /> },
                  { value: "calibration", label: "Calibration", icon: <Target className="h-3 w-3" /> },
                  { value: "tips", label: "Forecaster Tips", icon: <BookOpen className="h-3 w-3" /> },
                ] as { value: ToolTab; label: string; icon: React.ReactNode }[]
              ).map((t) => (
                <button
                  key={t.value}
                  onClick={() => setToolTab(t.value)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[11px] font-medium transition-colors",
                    toolTab === t.value
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            {toolTab === "kelly" && (
              <div className="max-w-2xl space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Kelly Criterion Calculator</h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Compute the optimal bet size that maximizes long-run log-growth of wealth.
                  </p>
                </div>
                <KellyCalculator />
              </div>
            )}

            {toolTab === "depth" && (
              <div className="max-w-2xl space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Market Depth — Order Book</h2>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Simulated YES/NO order book. The mid price equals the implied probability.
                    </p>
                  </div>
                  <select
                    value={depthMarketIndex}
                    onChange={(e) => setDepthMarketIndex(Number(e.target.value))}
                    className="max-w-[200px] shrink-0 appearance-none truncate rounded-lg border border-border bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground outline-none focus:border-primary/50"
                  >
                    {ACTIVE_MARKETS.map((m, i) => (
                      <option key={m.id} value={i}>
                        {m.question.slice(0, 45)}{m.question.length > 45 ? "…" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <MarketDepth market={selectedDepthMarket} />
              </div>
            )}

            {toolTab === "calibration" && (
              <div className="max-w-2xl space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Calibration Chart</h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Shows whether your predicted probabilities match actual outcome rates.
                  </p>
                </div>
                <CalibrationChartSection />
                <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Calibration</span> means your 70% confident predictions should resolve YES about 70% of the time. Points above the diagonal = overconfident. Points below = underconfident.
                </div>
              </div>
            )}

            {toolTab === "tips" && (
              <div className="max-w-2xl">
                <PredictorTips />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded bg-muted/50 px-2 py-1">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}
