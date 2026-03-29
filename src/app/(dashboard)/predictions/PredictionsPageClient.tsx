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
  HelpCircle,
  Users,
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

function getMarketTraders(m: PredictionMarket): number {
  const rand = mulberry32(hashStr(m.id + "traders"));
  return Math.round(rand() * 400 + 50);
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
  const stroke = delta > 2 ? "#10b981" : delta < -2 ? "#ef4444" : "#71717a";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Compact Market Row (tiny list item) ──────────────────────────────────────

function MarketRow({
  market,
  volume,
  onSelect,
}: {
  market: PredictionMarket;
  volume: number;
  onSelect: (m: PredictionMarket) => void;
}) {
  const bet = usePredictionMarketStore((s) => s.getMarketBet(market.id));

  return (
    <button
      onClick={() => onSelect(market)}
      className="group flex w-full items-center gap-3 rounded px-2 py-2 text-left cursor-pointer hover:bg-muted/20 transition-colors duration-150"
    >
      {/* Category pill */}
      <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none", CATEGORY_COLORS[market.category])}>
        {CATEGORY_LABELS[market.category]}
      </span>

      {/* Question */}
      <span className="min-w-0 flex-1 truncate text-xs text-foreground">
        {market.question}
      </span>

      {/* Bet indicator */}
      {bet && (
        <span className={cn("shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-medium leading-none", bet.position === "yes" ? "bg-emerald-500/5 text-emerald-500" : "bg-red-500/5 text-red-500")}>
          {bet.position}
        </span>
      )}

      {/* YES odds */}
      <span className="shrink-0 w-10 text-right font-mono tabular-nums text-xs font-medium text-emerald-500">
        {market.initialProbability}%
      </span>

      {/* Volume */}
      <span className="hidden shrink-0 w-14 text-right font-mono tabular-nums text-[11px] text-muted-foreground sm:inline">
        ${(volume / 1000).toFixed(0)}K
      </span>

      {/* Expiry */}
      <span className={cn(
        "shrink-0 w-8 text-right font-mono tabular-nums text-[11px]",
        market.expiresInDays <= 3 ? "font-medium text-amber-500" : "text-muted-foreground",
      )}>
        {market.expiresInDays}d
      </span>

      <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/0 transition-all group-hover:text-muted-foreground/60 group-hover:translate-x-0.5" />
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
  const lineColor = delta >= 0 ? "#10b981" : "#ef4444";

  return (
    <div className="bg-transparent p-0">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <span className={cn("font-mono tabular-nums text-xs font-medium", delta >= 0 ? "text-emerald-500" : "text-red-500")}>
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

      {/* Header — HERO card */}
      <div className="mb-4 border-l-4 border-l-primary rounded-lg bg-card p-6">
        <div className="mb-2 flex items-center gap-1.5 flex-wrap">
          <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", CATEGORY_COLORS[market.category])}>
            {CATEGORY_LABELS[market.category]}
          </span>
          <span className="text-xs text-muted-foreground">{difficultyLabel}</span>
          <span className="text-xs text-muted-foreground">{market.expiresInDays}d left</span>
        </div>
        <h2 className="mb-2 text-sm font-medium leading-snug text-foreground">{market.question}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{market.description}</p>
      </div>

      {/* Resolution criteria */}
      <div className="mb-4 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
        <div className="mb-1 text-xs font-medium text-muted-foreground">Resolution Criteria</div>
        <p className="text-[11px] leading-relaxed text-foreground/80">{market.resolutionCriteria}</p>
      </div>

      {/* Price history chart */}
      <div className="mb-2">
        <PriceHistoryChart data={priceHistory} title="YES Probability History" />
      </div>

      {/* Stats row — inline text, no grid */}
      <div className="mb-6 flex items-center gap-3 text-xs px-1">
        <span className="text-muted-foreground">YES <span className="font-mono tabular-nums font-medium text-foreground">{market.initialProbability}%</span></span>
        <span className="text-border/30">·</span>
        <span className="text-muted-foreground">Vol <span className="font-mono tabular-nums font-medium text-foreground">${(volume / 1000).toFixed(1)}K</span></span>
        <span className="text-border/30">·</span>
        <span className="text-muted-foreground">Closes <span className="font-mono tabular-nums font-medium text-foreground">{market.expiresInDays}d</span></span>
      </div>

      {/* Order book */}
      <div className="mb-4">
        <div className="mb-1.5 text-xs font-medium text-muted-foreground">Order Book</div>
        <MarketDepth market={activeMarket} />
      </div>

      {/* Trade panel */}
      {!existingBet ? (
        <div className="mb-4 rounded-lg border border-border bg-card p-4">
          <div className="mb-3 text-xs font-medium text-foreground">Place a Prediction</div>

          {/* YES / NO toggle */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setOrderSide("yes")}
              className={cn(
                "rounded-lg py-2 text-xs font-medium transition-all duration-100 active:scale-95",
                orderSide === "yes"
                  ? "bg-emerald-500/20 text-emerald-500 ring-1 ring-emerald-500/30"
                  : "bg-emerald-500/8 text-emerald-500/60 hover:bg-emerald-500/12",
              )}
            >
              YES {market.initialProbability}%
            </button>
            <button
              onClick={() => setOrderSide("no")}
              className={cn(
                "rounded-lg py-2 text-xs font-medium transition-all duration-100 active:scale-95",
                orderSide === "no"
                  ? "bg-red-500/20 text-red-500 ring-1 ring-red-500/30"
                  : "bg-red-500/8 text-red-500/60 hover:bg-red-500/12",
              )}
            >
              NO {100 - market.initialProbability}%
            </button>
          </div>

          {/* Amount slider */}
          <div className="mb-3">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Stake</span>
              <span className="font-medium text-foreground">{betAmount} pts</span>
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
            <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground">
              <span>10</span><span>{Math.min(100, insightPoints)}</span>
            </div>
          </div>

          {/* My probability */}
          <div className="mb-3">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>My probability estimate</span>
              <span className="font-medium text-foreground">{betProbability}%</span>
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
            <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground">
              <span>1%</span><span>99%</span>
            </div>
          </div>

          {/* Payout calculation — inline */}
          <div className="mb-3 flex items-center gap-2.5 text-xs px-1 flex-wrap">
            <span className="text-muted-foreground">Stake <span className="font-medium text-foreground">{betAmount} pts</span></span>
            <span className="text-border/30">·</span>
            <span className="text-muted-foreground">Payout <span className="font-medium text-emerald-500">{expectedPayout} pts</span></span>
            <span className="text-border/30">·</span>
            <span className="text-muted-foreground">Profit <span className="font-medium text-emerald-500">+{expectedPayout - betAmount} pts</span></span>
          </div>

          <button
            onClick={handlePlaceBet}
            disabled={betAmount > insightPoints}
            className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            Place Bet — {betAmount} pts
          </button>
        </div>
      ) : (
        <div className="mb-4 rounded-lg border border-border bg-muted/20 px-3 py-3">
          <div className="mb-1 text-xs font-medium text-muted-foreground">Your Bet</div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className={cn("rounded-sm px-1.5 py-0.5 font-medium text-[10px]", existingBet.position === "yes" ? "bg-emerald-500/5 text-emerald-500" : "bg-red-500/5 text-red-500")}>
              {existingBet.position.toUpperCase()}
            </span>
            <span className="text-muted-foreground">{existingBet.amount} pts at {Math.round(existingBet.probability * 100)}%</span>
          </div>
        </div>
      )}

      {/* Recent trades — FLOW card (borderless, transparent) */}
      <div className="mb-4 bg-transparent p-0">
        <div className="mb-1.5 text-xs font-medium text-muted-foreground">Recent Trades</div>
        <div className="divide-y divide-border/20">
          {recentTrades.map((trade, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className={cn("rounded-sm px-1.5 py-0.5 text-[10px] font-medium", trade.side === "YES" ? "bg-emerald-500/5 text-emerald-500" : "bg-red-500/5 text-red-500")}>
                  {trade.side}
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">{trade.price}%</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="font-mono tabular-nums">${trade.amount}</span>
                <span className="text-xs">{trade.timeAgo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational note */}
      <div className="mb-4 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
        <div className="mb-1 text-xs font-medium text-muted-foreground">Why This Matters</div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">{market.educationalNote}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {market.relatedConcepts.map((c) => (
            <span key={c} className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground/60">{c}</span>
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
    <div className="space-y-5">
      {/* Summary stats — inline text */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs px-1">
        <span className="text-muted-foreground">Staked <span className="font-mono tabular-nums font-medium text-foreground">{totalStaked} pts</span></span>
        <span className="text-border/30">·</span>
        <span className="text-muted-foreground">Won <span className="font-mono tabular-nums font-medium text-emerald-500">+{totalWon} pts</span></span>
        <span className="text-border/30">·</span>
        <span className="text-muted-foreground">Lost <span className="font-mono tabular-nums font-medium text-red-500">-{totalLost} pts</span></span>
        <span className="text-border/30">·</span>
        <span className="text-muted-foreground">Net P&L <span className={cn("font-mono tabular-nums font-medium", netPnl >= 0 ? "text-emerald-500" : "text-red-500")}>{netPnl >= 0 ? "+" : ""}{netPnl} pts</span></span>
        <span className="text-border/30">·</span>
        <span className="text-muted-foreground">ROI <span className={cn("font-mono tabular-nums font-medium", roi >= 0 ? "text-emerald-500" : "text-red-500")}>{roi >= 0 ? "+" : ""}{roi.toFixed(1)}%</span></span>
      </div>

      {/* Accuracy tracker */}
      <AccuracyTracker />

      {/* Active bets */}
      {activeBets.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-medium text-muted-foreground">
            Active Positions ({activeBets.length})
          </h2>
          <div className="overflow-x-auto rounded-lg bg-card border border-border/40 p-0">
            <table className="w-full text-[11px] min-w-[480px]">
              <thead className="sticky top-0 z-10 bg-card">
                <tr className="border-b border-border/50">
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-muted-foreground">Market</th>
                  <th className="px-3 py-2 text-center text-[11px] font-medium text-muted-foreground">Position</th>
                  <th className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground">Stake</th>
                  <th className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground">Est. Payout</th>
                  <th className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground">Odds</th>
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
                    <tr key={bet.marketId + bet.timestamp} className="border-b border-border/50 last:border-0 transition-colors hover:bg-muted/50">
                      <td className="max-w-[200px] truncate px-3 py-2 text-foreground">
                        {market?.question.slice(0, 40) ?? bet.marketId}
                        {(market?.question.length ?? 0) > 40 ? "…" : ""}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={cn("rounded-sm px-1.5 py-0.5 text-[10px] font-medium", bet.position === "yes" ? "bg-emerald-500/5 text-emerald-500" : "bg-red-500/5 text-red-500")}>
                          {bet.position.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">{bet.amount} pts</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                        {estPayout} pts
                        <span className="ml-1 text-emerald-500/80">(+{estPnl})</span>
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

      {/* Resolved bets — breathing room, nearly invisible */}
      {resolvedBets.length > 0 && (
        <div className="mt-8 bg-transparent p-0 opacity-50">
          <h2 className="mb-1.5 text-[11px] font-normal text-muted-foreground/60">
            Resolved ({resolvedBets.length})
          </h2>
          <div className="space-y-0">
            {resolvedBets.slice().reverse().map((bet) => {
              const market = PREDICTION_MARKETS.find((m) => m.id === bet.marketId);
              const isCorrect = (bet.position === "yes" && bet.outcome === true) || (bet.position === "no" && bet.outcome === false);
              const pnl = (bet.payout ?? 0) - bet.amount;
              return (
                <div key={bet.marketId + bet.timestamp} className="flex items-center gap-2 py-0.5 text-[11px] text-muted-foreground">
                  <span className={cn("shrink-0", isCorrect ? "text-emerald-500/70" : "text-red-500/70")}>
                    {isCorrect ? "+" : "-"}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {market?.question.slice(0, 50) ?? bet.marketId}
                  </span>
                  <span className="shrink-0 text-[10px] font-medium">{bet.position}</span>
                  <span className={cn("shrink-0 font-mono tabular-nums text-[10px]", pnl >= 0 ? "text-emerald-500/70" : "text-red-500/70")}>
                    {pnl >= 0 ? "+" : ""}{pnl}
                  </span>
                </div>
              );
            })}
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
    <div className="rounded-lg bg-card border border-border/40 p-3">
      <h3 className="mb-3 text-[10px] text-muted-foreground">Predicted vs actual outcomes</h3>
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
        <text x={pad.left + plotW / 2} y={h - 4} textAnchor="middle" className="fill-muted-foreground text-xs" fontSize={10}>Predicted Probability</text>
        {[0, 0.5, 1].map((v) => (
          <text key={`xl-${v}`} x={pad.left + v * plotW} y={pad.top + plotH + 14} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>{Math.round(v * 100)}%</text>
        ))}
        {[0, 0.5, 1].map((v) => (
          <text key={`yl-${v}`} x={pad.left - 6} y={pad.top + plotH * (1 - v) + 3} textAnchor="end" className="fill-muted-foreground" fontSize={9}>{Math.round(v * 100)}%</text>
        ))}
      </svg>
      <p className="mt-1 text-center text-xs text-muted-foreground">Points on the dashed line = perfectly calibrated</p>
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
      <h2 className="text-xs font-medium text-muted-foreground">How to Be a Good Predictor</h2>
      {PREDICTOR_TIPS.map((tip, i) => (
        <div key={i} className="bg-transparent p-0 py-2">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {i + 1}
            </span>
            <span className="text-xs font-medium text-foreground">{tip.title}</span>
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

  // Featured market: first "Closing Soon" market, or highest volume
  const featuredMarket = useMemo(() => {
    const closingSoon = PREDICTION_MARKETS.find((m) => m.expiresInDays <= 3);
    if (closingSoon) return closingSoon;
    return [...PREDICTION_MARKETS].sort((a, b) => getMarketVolume(b) - getMarketVolume(a))[0] ?? null;
  }, []);

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
            <h1 className="text-sm font-medium">Practice Prediction Markets</h1>
            <p className="text-xs text-muted-foreground">
              Test your probability thinking with {PREDICTION_MARKETS.length} simulated markets — no real money involved
            </p>
          </div>
          <div className="flex-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                <HelpCircle className="h-3 w-3" />
                How it works
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end" className="max-w-72 text-xs leading-relaxed">
              <p className="mb-1.5 font-medium text-foreground">How Practice Markets Work</p>
              <ol className="list-decimal space-y-1 pl-3.5 text-muted-foreground">
                <li>Browse markets and estimate the probability of each outcome.</li>
                <li>Place a YES or NO bet using your Insight Points.</li>
                <li>Markets resolve based on real-world outcomes. Correct predictions earn points.</li>
                <li>Track your calibration — are your 70% bets right 70% of the time?</li>
              </ol>
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1">
            <Coins className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-mono tabular-nums text-xs font-medium text-foreground">
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
                <span className="rounded-full bg-primary/20 px-1 text-[11px] font-medium text-primary">{activeBetCount}</span>
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
                  <span className="text-xs text-muted-foreground">Brier</span>
                  <span className="font-mono tabular-nums text-xs font-medium text-foreground">
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
                            "shrink-0 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
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
                        className="appearance-none rounded bg-muted px-2 py-1 text-xs font-medium text-foreground outline-none"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Featured Market + Compact market list */}
                <div className="flex-1 overflow-y-auto p-4">
                  {/* ── FEATURED MARKET — dominant hero ── */}
                  {featuredMarket && !searchQuery.trim() && activeFilter === "all" && (
                    <div className="mb-8">
                      <button
                        onClick={() => handleSelectMarket(featuredMarket)}
                        className="group w-full border-l-4 border-l-primary rounded-lg bg-card p-6 sm:p-8 text-left transition-colors hover:bg-muted/10"
                      >
                        {/* Top meta */}
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-[11px] font-medium text-primary">Featured market</span>
                          <span className={cn("ml-1 rounded px-1.5 py-0.5 text-[10px] font-medium", CATEGORY_COLORS[featuredMarket.category])}>
                            {CATEGORY_LABELS[featuredMarket.category]}
                          </span>
                          {featuredMarket.expiresInDays <= 3 && (
                            <span className="flex items-center gap-0.5 rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500">
                              <Clock className="h-3 w-3" />
                              Closing soon
                            </span>
                          )}
                        </div>

                        {/* Large question */}
                        <p className="mb-5 text-lg font-medium leading-snug text-foreground sm:text-xl">
                          {featuredMarket.question}
                        </p>

                        {/* Description */}
                        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                          {featuredMarket.description}
                        </p>

                        {/* Massive YES / NO buttons */}
                        <div className="mb-5 grid grid-cols-2 gap-3">
                          <div className="flex h-12 items-center justify-center rounded-lg bg-emerald-500/12 text-sm font-medium font-mono tabular-nums text-emerald-500 ring-1 ring-emerald-500/20">
                            YES {featuredMarket.initialProbability}%
                          </div>
                          <div className="flex h-12 items-center justify-center rounded-lg bg-red-500/12 text-sm font-medium font-mono tabular-nums text-red-500 ring-1 ring-red-500/20">
                            NO {100 - featuredMarket.initialProbability}%
                          </div>
                        </div>

                        {/* Probability bar */}
                        <div className="mb-5">
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-red-500/15">
                            <div className="h-full rounded-full bg-emerald-500/60 transition-all" style={{ width: `${featuredMarket.initialProbability}%` }} />
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="mb-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-mono tabular-nums">
                            <BarChart3 className="h-3 w-3" />
                            ${getMarketVolume(featuredMarket).toLocaleString()} vol
                          </span>
                          <span className="flex items-center gap-1 font-mono tabular-nums">
                            <Users className="h-3 w-3" />
                            {getMarketTraders(featuredMarket).toLocaleString()} traders
                          </span>
                          <span className="flex items-center gap-1 font-mono tabular-nums">
                            <Clock className="h-3 w-3" />
                            {featuredMarket.expiresInDays}d left
                          </span>
                          <span className="text-muted-foreground/30">|</span>
                          <span className="font-mono tabular-nums">
                            Odds: {featuredMarket.initialProbability > 50 ? (featuredMarket.initialProbability / (100 - featuredMarket.initialProbability)).toFixed(1) : ((100 - featuredMarket.initialProbability) / featuredMarket.initialProbability).toFixed(1)}:1
                          </span>
                        </div>

                        {/* Sparkline + CTA */}
                        <div className="flex items-end justify-between">
                          <Sparkline data={getPriceHistory(featuredMarket)} width={120} height={32} />
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors group-hover:bg-primary/90">
                            Make Your Prediction
                            <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Buffer between featured hero and list — large breathing room */}
                  <div className="mt-10" />

                  {/* ── ALL MARKETS — compact list ── */}
                  <div className="mb-2">
                    <span className="text-xs text-muted-foreground/50">
                      All Markets ({filteredMarkets.length})
                    </span>
                  </div>

                  {filteredMarkets.length > 0 ? (
                    <div className="divide-y divide-border/30">
                      {filteredMarkets.map((market) => (
                        <MarketRow
                          key={market.id}
                          market={market}
                          volume={getMarketVolume(market)}
                          onSelect={handleSelectMarket}
                        />
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
              <div className="max-w-2xl space-y-3">
                <div>
                  <h2 className="text-sm font-medium text-foreground">Kelly Criterion Calculator</h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Compute the optimal bet size that maximizes long-run log-growth of wealth.
                  </p>
                </div>
                <KellyCalculator />
              </div>
            )}

            {toolTab === "depth" && (
              <div className="max-w-2xl space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-medium text-foreground">Market Depth — Order Book</h2>
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
              <div className="max-w-2xl space-y-6">
                <div>
                  <h2 className="text-sm font-medium text-foreground">Calibration Chart</h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Shows whether your predicted probabilities match actual outcome rates.
                  </p>
                </div>
                <CalibrationChartSection />
                <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">Calibration</span> means your 70% confident predictions should resolve YES about 70% of the time. Points above the diagonal = overconfident. Points below = underconfident.
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
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}
