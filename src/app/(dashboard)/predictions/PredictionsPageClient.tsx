"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, HelpCircle } from "lucide-react";
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

type FilterTab = "all" | MarketCategory;
type SortMode = "volume" | "closing" | "probability" | "activity";
type ToolTab = "kelly" | "depth" | "calibration" | "tips";

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "fed", label: "Fed" },
  { value: "macro", label: "Macro" },
  { value: "equities", label: "Equities" },
  { value: "crypto", label: "Crypto" },
  { value: "earnings", label: "Earnings" },
  { value: "geopolitics", label: "Geo" },
];

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
  const stroke = delta > 2 ? "#10b981" : delta < -2 ? "#ef4444" : "#71717a";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Price History Chart ────────────────────────────────────────────────────────

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
  const areaPoints =
    `${toX(0).toFixed(1)},${(pad.top + plotH).toFixed(1)} ` +
    data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ") +
    ` ${toX(data.length - 1).toFixed(1)},${(pad.top + plotH).toFixed(1)}`;

  const delta = data[data.length - 1] - data[0];
  const lineColor = delta >= 0 ? "#10b981" : "#ef4444";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40">{title}</span>
        <span className={cn("font-mono tabular-nums text-[10px]", delta >= 0 ? "text-emerald-500" : "text-red-400")}>
          {delta >= 0 ? "+" : ""}{delta.toFixed(0)}pp
        </span>
      </div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full" aria-hidden="true">
        {[25, 50, 75].map((v) => (
          <line key={v} x1={pad.left} x2={pad.left + plotW} y1={toY(v)} y2={toY(v)} stroke="currentColor" strokeOpacity={0.08} strokeDasharray="3 3" />
        ))}
        <polygon points={areaPoints} fill={lineColor} fillOpacity={0.08} />
        <polyline points={points} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={toX(data.length - 1)} cy={toY(data[data.length - 1])} r={3} fill={lineColor} />
        {[25, 50, 75].map((v) => (
          <text key={v} x={pad.left - 4} y={toY(v) + 3} textAnchor="end" fontSize={8} className="fill-muted-foreground">{v}%</text>
        ))}
        {[0, Math.floor((data.length - 1) / 2), data.length - 1].map((i, idx) => (
          <text key={idx} x={toX(i)} y={h - 4} textAnchor="middle" fontSize={8} className="fill-muted-foreground">
            {i === 0 ? "Start" : i === data.length - 1 ? "Now" : "Mid"}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── Market Card ────────────────────────────────────────────────────────────────

function MarketCard({
  market,
  volume,
  onSelect,
}: {
  market: PredictionMarket;
  volume: number;
  onSelect: (m: PredictionMarket) => void;
}) {
  const bet = usePredictionMarketStore((s) => s.getMarketBet(market.id));
  const prob = market.initialProbability;
  const priceHistory = useMemo(() => getPriceHistory(market), [market.id]);

  return (
    <button
      onClick={() => onSelect(market)}
      className="group w-full text-left rounded-lg border border-border bg-card p-5 hover:bg-muted/30 transition-colors duration-150"
    >
      {/* Category + badges row */}
      <div className="flex items-center gap-2 mb-3">
        <span className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest",
          CATEGORY_COLORS[market.category]
        )}>
          {CATEGORY_LABELS[market.category]}
        </span>
        {market.expiresInDays <= 7 && (
          <span className="inline-flex items-center rounded-full border border-amber-500/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-amber-500">
            {market.expiresInDays}d left
          </span>
        )}
        {bet && (
          <span className={cn(
            "ml-auto rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest",
            bet.position === "yes" ? "text-emerald-500 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
          )}>
            {bet.position}
          </span>
        )}
      </div>

      {/* Question */}
      <p className="text-sm font-medium leading-snug mb-4 line-clamp-2">
        {market.question}
      </p>

      {/* Probability bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1.5">
          <span>YES {prob}%</span>
          <span>NO {100 - prob}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted/30">
          <div
            className="h-full rounded-full bg-emerald-500/60 transition-all duration-500"
            style={{ width: `${prob}%` }}
          />
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/40">
          <span className="font-mono tabular-nums">Vol ${(volume / 1000).toFixed(0)}K</span>
          <span>·</span>
          <span>Closes {market.expiresInDays}d</span>
        </div>
        <Sparkline data={priceHistory} width={48} height={16} />
      </div>

      {/* YES / NO bet buttons */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className={cn(
          "rounded-full border border-border px-4 py-1.5 text-center text-[11px] font-medium transition-colors",
          "group-hover:border-emerald-500/30 group-hover:text-emerald-500"
        )}>
          YES {prob}%
        </div>
        <div className={cn(
          "rounded-full border border-border px-4 py-1.5 text-center text-[11px] font-medium transition-colors",
          "group-hover:border-red-400/30 group-hover:text-red-400"
        )}>
          NO {100 - prob}%
        </div>
      </div>
    </button>
  );
}

// ── Market Detail View ─────────────────────────────────────────────────────────

function MarketDetailView({
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
      <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">

        {/* Back */}
        <button
          onClick={onClose}
          className="mb-6 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to markets
        </button>

        {/* Header card */}
        <div className="rounded-lg border border-border border-t-2 border-t-emerald-500/30 bg-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest", CATEGORY_COLORS[market.category])}>
              {CATEGORY_LABELS[market.category]}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40">{difficultyLabel}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40">{market.expiresInDays}d left</span>
          </div>
          <h2 className="text-xl font-serif tracking-tight text-foreground mb-2">{market.question}</h2>
          <p className="text-sm text-muted-foreground/60 leading-relaxed">{market.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Price history + stats */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
            <PriceHistoryChart data={priceHistory} title="YES Probability History" />
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs font-mono tabular-nums text-muted-foreground/40">
              <span>YES <span className="text-foreground/60">{market.initialProbability}%</span></span>
              <span>·</span>
              <span>Vol <span className="text-foreground/60">${(volume / 1000).toFixed(1)}K</span></span>
              <span>·</span>
              <span>Closes <span className="text-foreground/60">{market.expiresInDays}d</span></span>
            </div>
          </div>

          {/* Trade panel */}
          <div className="rounded-lg border border-border bg-muted/30 p-5">
            {!existingBet ? (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-4">Place a Prediction</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setOrderSide("yes")}
                    className={cn(
                      "rounded-full border px-3 py-2 text-[11px] font-medium transition-colors",
                      orderSide === "yes"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                        : "border-border text-muted-foreground/40 hover:bg-foreground/5"
                    )}
                  >
                    YES {market.initialProbability}%
                  </button>
                  <button
                    onClick={() => setOrderSide("no")}
                    className={cn(
                      "rounded-full border px-3 py-2 text-[11px] font-medium transition-colors",
                      orderSide === "no"
                        ? "border-red-400/40 bg-red-500/10 text-red-400"
                        : "border-border text-muted-foreground/40 hover:bg-foreground/5"
                    )}
                  >
                    NO {100 - market.initialProbability}%
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-2">
                    <span>Stake</span>
                    <span className="font-mono tabular-nums text-foreground/60">{betAmount} pts</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={Math.min(100, insightPoints)}
                    step={10}
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="h-1 w-full cursor-pointer appearance-none rounded-full bg-muted/30 accent-primary"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground/30 mt-1">
                    <span>10</span><span>{Math.min(100, insightPoints)}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-2">
                    <span>My estimate</span>
                    <span className="font-mono tabular-nums text-foreground/60">{betProbability}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={99}
                    step={1}
                    value={betProbability}
                    onChange={(e) => setBetProbability(Number(e.target.value))}
                    className="h-1 w-full cursor-pointer appearance-none rounded-full bg-muted/30 accent-primary"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground/30 mt-1">
                    <span>1%</span><span>99%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono tabular-nums mb-4 px-1">
                  <span className="text-muted-foreground/40">Payout <span className="text-emerald-500">{expectedPayout} pts</span></span>
                  <span className="text-muted-foreground/40">+{expectedPayout - betAmount} profit</span>
                </div>

                <button
                  onClick={handlePlaceBet}
                  disabled={betAmount > insightPoints}
                  className="w-full rounded-full border border-border px-5 py-2 text-[11px] font-medium hover:bg-foreground/[0.03] disabled:opacity-40 transition-colors"
                >
                  Place Bet — {betAmount} pts
                </button>
              </div>
            ) : (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-3">Your Bet</p>
                <div className="flex items-center gap-2 text-sm font-mono">
                  <span className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium",
                    existingBet.position === "yes" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-400"
                  )}>
                    {existingBet.position.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground/40 tabular-nums">{existingBet.amount} pts at {Math.round(existingBet.probability * 100)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border mb-6" />

        {/* Resolution criteria */}
        <div className="rounded-lg border border-border bg-muted/30 p-5 mb-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-2">Resolution Criteria</p>
          <p className="text-sm leading-relaxed text-foreground/70">{market.resolutionCriteria}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Order book */}
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-4">Order Book</p>
            <MarketDepth market={activeMarket} />
          </div>

          {/* Recent trades */}
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-4">Recent Trades</p>
            <div className="space-y-0 divide-y divide-border">
              {recentTrades.map((trade, i) => (
                <div key={i} className="flex items-center justify-between py-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] uppercase",
                      trade.side === "YES" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-400"
                    )}>
                      {trade.side}
                    </span>
                    <span className="tabular-nums text-muted-foreground/40">{trade.price}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground/40">
                    <span className="tabular-nums">${trade.amount}</span>
                    <span>{trade.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Educational note */}
        <div className="rounded-lg border border-border bg-muted/30 p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-2">Why This Matters</p>
          <p className="text-sm leading-relaxed text-muted-foreground/60 mb-3">{market.educationalNote}</p>
          <div className="flex flex-wrap gap-1.5">
            {market.relatedConcepts.map((c) => (
              <span key={c} className="rounded-full border border-border px-2.5 py-0.5 text-[10px] text-muted-foreground/40">{c}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── My Bets Section ────────────────────────────────────────────────────────────

function MyBetsSection() {
  const bets = usePredictionMarketStore((s) => s.bets);
  const insightPoints = usePredictionMarketStore((s) => s.insightPoints);
  const totalResolved = usePredictionMarketStore((s) => s.totalResolved);
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
      <div className="rounded-lg border border-border bg-muted/30 p-5 flex h-40 items-center justify-center">
        <p className="text-xs text-muted-foreground/40">No bets placed yet. Browse open markets to place your first prediction.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Staked", value: `${totalStaked} pts`, color: "" },
          { label: "Won", value: `+${totalWon} pts`, color: "text-emerald-500" },
          { label: "Lost", value: `-${totalLost} pts`, color: "text-red-400" },
          { label: "ROI", value: `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`, color: roi >= 0 ? "text-emerald-500" : "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">{s.label}</p>
            <p className={cn("text-xl font-serif tracking-tight", s.color || "text-foreground")}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Accuracy tracker */}
      <AccuracyTracker />

      {/* Active bets */}
      {activeBets.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-3">Active Positions ({activeBets.length})</p>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-xs font-mono min-w-[480px]">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-muted-foreground/40">Market</th>
                  <th className="px-4 py-3 text-center text-[10px] uppercase tracking-widest text-muted-foreground/40">Pos</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-muted-foreground/40">Stake</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-muted-foreground/40">Payout</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest text-muted-foreground/40">Odds</th>
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
                    <tr key={bet.marketId + bet.timestamp} className="border-b border-border last:border-0 hover:bg-foreground/[0.02] transition-colors">
                      <td className="max-w-[200px] truncate px-4 py-3 text-foreground/70">
                        {market?.question.slice(0, 40) ?? bet.marketId}
                        {(market?.question.length ?? 0) > 40 ? "…" : ""}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase", bet.position === "yes" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-400")}>
                          {bet.position.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground/60">{bet.amount} pts</td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground/60">
                        {estPayout} pts
                        <span className="ml-1 text-emerald-500/50">(+{estPnl})</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground/40">
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
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-3">Resolved ({resolvedBets.length})</p>
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {resolvedBets.slice().reverse().map((bet) => {
              const market = PREDICTION_MARKETS.find((m) => m.id === bet.marketId);
              const isCorrect = (bet.position === "yes" && bet.outcome === true) || (bet.position === "no" && bet.outcome === false);
              const pnl = (bet.payout ?? 0) - bet.amount;
              return (
                <div key={bet.marketId + bet.timestamp} className="flex items-center gap-3 px-4 py-2.5">
                  <span className={cn("shrink-0 text-xs font-mono font-medium", isCorrect ? "text-emerald-500" : "text-red-400")}>
                    {isCorrect ? "WIN" : "LOSS"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-mono text-muted-foreground/40">
                    {market?.question.slice(0, 50) ?? bet.marketId}
                  </span>
                  <span className="shrink-0 text-xs font-mono uppercase tracking-widest text-muted-foreground/40">{bet.position}</span>
                  <span className={cn("shrink-0 tabular-nums text-xs font-mono", pnl >= 0 ? "text-emerald-500" : "text-red-400")}>
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
      <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground/40">
        Resolve bets to see your calibration chart
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-4">Predicted vs Actual Outcomes</p>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxWidth: w }} aria-hidden>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <line key={`g-${v}`} x1={pad.left} x2={pad.left + plotW} y1={pad.top + plotH * (1 - v)} y2={pad.top + plotH * (1 - v)} stroke="currentColor" strokeOpacity={0.1} />
        ))}
        <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="4 4" />
        {calibrationData.map((d, i) => (
          <circle key={i} cx={pad.left + d.predicted * plotW} cy={pad.top + (1 - d.actual) * plotH} r={Math.min(9, 3 + d.count)} fill="hsl(var(--primary))" fillOpacity={0.6} stroke="hsl(var(--primary))" strokeWidth={1} />
        ))}
        <text x={pad.left + plotW / 2} y={h - 4} textAnchor="middle" className="fill-muted-foreground text-xs" fontSize={10}>Predicted Probability</text>
        {[0, 0.5, 1].map((v) => (
          <text key={`xl-${v}`} x={pad.left + v * plotW} y={pad.top + plotH + 14} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>{Math.round(v * 100)}%</text>
        ))}
        {[0, 0.5, 1].map((v) => (
          <text key={`yl-${v}`} x={pad.left - 6} y={pad.top + plotH * (1 - v) + 3} textAnchor="end" className="fill-muted-foreground" fontSize={9}>{Math.round(v * 100)}%</text>
        ))}
      </svg>
      <p className="mt-2 text-center text-[10px] text-muted-foreground/40">Points on the dashed line = perfectly calibrated</p>
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
    <div className="rounded-lg border border-border bg-card divide-y divide-border">
      <div className="px-5 py-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">How to Be a Good Predictor</p>
      </div>
      {PREDICTOR_TIPS.map((tip, i) => (
        <div key={i} className="px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="shrink-0 text-[10px] font-mono tabular-nums text-muted-foreground/30 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="text-sm font-medium mb-1">{tip.title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground/60">{tip.body}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main PredictionsPageClient ────────────────────────────────────────────────

export function PredictionsPageClient() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [sortMode, setSortMode] = useState<SortMode>("closing");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const [toolTab, setToolTab] = useState<ToolTab>("kelly");
  const [depthMarketIndex, setDepthMarketIndex] = useState(0);

  const insightPoints = usePredictionMarketStore((s) => s.insightPoints);
  const bets = usePredictionMarketStore((s) => s.bets);
  const totalResolved = usePredictionMarketStore((s) => s.totalResolved);
  const correctPredictions = usePredictionMarketStore((s) => s.correctPredictions);
  const storeRef = usePredictionMarketStore.getState;
  const accuracy = useMemo(() => storeRef().getAccuracy(), [storeRef, bets, totalResolved]);
  const brierScore = useMemo(() => storeRef().getBrierScore(), [storeRef, bets]);

  const activeBets = useMemo(() => bets.filter((b) => !b.resolved), [bets]);
  const totalStaked = useMemo(() => activeBets.reduce((sum, b) => sum + b.amount, 0), [activeBets]);
  const totalPotentialPayout = useMemo(() => activeBets.reduce((sum, b) => {
    const prob = b.probability;
    return sum + (b.position === "yes" ? Math.round(b.amount * (1 / prob)) : Math.round(b.amount * (1 / (1 - prob))));
  }, 0), [activeBets]);

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

  // If a market is selected, show the detail view
  if (selectedMarket) {
    return <MarketDetailView market={selectedMarket} onClose={handleCloseMarket} />;
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">

        {/* Page title row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-serif tracking-tight text-foreground mb-1">Prediction Markets</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">Forecast · Earn Coins · Track Accuracy</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Balance</p>
            <p className="text-xl font-serif font-light tracking-tight font-mono tabular-nums">{insightPoints.toLocaleString()} pts</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors ml-auto mt-1">
                  <HelpCircle className="h-3 w-3" />
                  How it works
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end" className="max-w-72 text-xs leading-relaxed">
                <p className="mb-1.5 font-medium text-foreground">How prediction markets work</p>
                <ol className="list-decimal space-y-1 pl-3.5 text-muted-foreground">
                  <li>Browse markets and estimate the probability of each outcome.</li>
                  <li>Place a YES or NO bet using your Insight Points.</li>
                  <li>Markets resolve based on real-world outcomes. Correct predictions earn points.</li>
                  <li>Track your calibration — are your 70% bets right 70% of the time?</li>
                </ol>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Section divider */}
        <div className="border-t border-border mb-6" />

        {/* Stats row — 3 cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Active Markets summary — col-span-2 */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-4">Active Markets</p>
            {activeBets.length === 0 ? (
              <p className="text-sm text-muted-foreground/40">No open positions. Browse markets below to place your first bet.</p>
            ) : (
              <div>
                <div className="flex items-end gap-6 mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Open Bets</p>
                    <p className="text-2xl font-serif font-light tracking-tight">{activeBets.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Total Staked</p>
                    <p className="text-2xl font-serif font-light tracking-tight">{totalStaked} <span className="text-sm text-muted-foreground/40">pts</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Potential Payout</p>
                    <p className="text-2xl font-serif font-light tracking-tight text-emerald-500">{totalPotentialPayout} <span className="text-sm text-muted-foreground/40">pts</span></p>
                  </div>
                </div>
                {/* Performance bar */}
                <div>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1.5">
                    <span>Staked</span>
                    <span>Potential return {totalStaked > 0 ? `+${(((totalPotentialPayout - totalStaked) / totalStaked) * 100).toFixed(0)}%` : "—"}</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-muted/30">
                    <div
                      className="h-full rounded-full bg-emerald-500/60"
                      style={{ width: totalPotentialPayout > 0 ? `${Math.min(100, (totalStaked / totalPotentialPayout) * 100)}%` : "0%" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accuracy card */}
          <div className="rounded-lg border border-border bg-muted/30 p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-4">Your Accuracy</p>
            <p className="text-4xl font-serif font-light tracking-tight mb-1">
              {totalResolved > 0 ? `${accuracy}%` : "—"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-4">accuracy rate</p>
            <div className="space-y-1.5 text-xs font-mono tabular-nums">
              <div className="flex justify-between">
                <span className="text-muted-foreground/40">Bets placed</span>
                <span>{bets.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground/40">Resolved</span>
                <span>{totalResolved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground/40">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help border-b border-dashed border-muted-foreground/30">Brier score</span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-64 text-xs">
                      Brier Score measures calibration (0 = perfect, 1 = worst). Below 0.25 is well-calibrated.
                    </TooltipContent>
                  </Tooltip>
                </span>
                <span>{totalResolved > 0 ? brierScore.toFixed(3) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground/40">Correct</span>
                <span className="text-emerald-500">{correctPredictions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section divider */}
        <div className="border-t border-border mb-6" />

        {/* Open Markets section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif tracking-tight text-foreground">Open Markets</h2>
            <span className="text-[10px] text-muted-foreground/40 font-mono tabular-nums">{filteredMarkets.length} markets</span>
          </div>

          {/* Filter + sort bar */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {/* Search */}
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/70 placeholder-muted-foreground/30 outline-none focus:border-foreground/20 transition-colors min-w-[160px]"
            />

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                    activeFilter === tab.value
                      ? "border-foreground/20 bg-foreground/[0.06] text-foreground"
                      : "border-border text-muted-foreground/40 hover:text-muted-foreground hover:bg-foreground/[0.03]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Sort links */}
            <div className="flex items-center gap-3 text-[11px]">
              {[
                { value: "volume" as SortMode, label: "Volume" },
                { value: "closing" as SortMode, label: "Closing" },
                { value: "probability" as SortMode, label: "Probability" },
              ].map((opt, i) => (
                <span key={opt.value} className="flex items-center gap-3">
                  {i > 0 && <span className="text-muted-foreground/20">·</span>}
                  <button
                    onClick={() => setSortMode(opt.value)}
                    className={cn(
                      "transition-colors",
                      sortMode === opt.value
                        ? "text-foreground"
                        : "text-muted-foreground/40 hover:text-muted-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Market cards grid */}
          {filteredMarkets.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredMarkets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  volume={getMarketVolume(market)}
                  onSelect={handleSelectMarket}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground/40">No markets found. Try a different category or search term.</p>
            </div>
          )}
        </div>

        {/* Section divider */}
        <div className="border-t border-border mb-6" />

        {/* My Bets + Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* My Bets */}
          <div>
            <p className="text-xl font-serif tracking-tight text-foreground mb-4">My Bets</p>
            <MyBetsSection />
          </div>

          {/* Leaderboard */}
          <div>
            <p className="text-xl font-serif tracking-tight text-foreground mb-4">Leaderboard</p>
            <PredictionLeaderboard />
          </div>
        </div>

        {/* Section divider */}
        <div className="border-t border-border mb-6" />

        {/* Tools row */}
        <div>
          <p className="text-xl font-serif tracking-tight text-foreground mb-4">Tools</p>

          {/* Tool sub-tabs */}
          <div className="flex items-center gap-1.5 mb-5">
            {(
              [
                { value: "kelly", label: "Kelly Calculator" },
                { value: "depth", label: "Market Depth" },
                { value: "calibration", label: "Calibration" },
                { value: "tips", label: "Predictor Tips" },
              ] as { value: ToolTab; label: string }[]
            ).map((t) => (
              <button
                key={t.value}
                onClick={() => setToolTab(t.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-[11px] font-medium transition-colors",
                  toolTab === t.value
                    ? "border-foreground/20 bg-foreground/[0.06] text-foreground"
                    : "border-border text-muted-foreground/40 hover:text-muted-foreground hover:bg-foreground/[0.03]"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {toolTab === "kelly" && (
              <div className="lg:col-span-2 max-w-2xl">
                <div className="rounded-lg border border-border bg-muted/30 p-5 mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Kelly Criterion Calculator</p>
                  <p className="text-xs text-muted-foreground/60">
                    Compute the optimal bet size that maximizes long-run log-growth of wealth.
                  </p>
                </div>
                <KellyCalculator />
              </div>
            )}

            {toolTab === "depth" && (
              <div className="lg:col-span-2 max-w-2xl">
                <div className="rounded-lg border border-border bg-muted/30 p-5 mb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">Market Depth</p>
                      <p className="text-xs text-muted-foreground/60">
                        Simulated YES/NO order book. The mid price equals the implied probability.
                      </p>
                    </div>
                    <select
                      value={depthMarketIndex}
                      onChange={(e) => setDepthMarketIndex(Number(e.target.value))}
                      className="shrink-0 appearance-none rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground/60 outline-none focus:border-foreground/20 max-w-[200px]"
                    >
                      {ACTIVE_MARKETS.map((m, i) => (
                        <option key={m.id} value={i}>
                          {m.question.slice(0, 45)}{m.question.length > 45 ? "…" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <MarketDepth market={selectedDepthMarket} />
              </div>
            )}

            {toolTab === "calibration" && (
              <div className="lg:col-span-2 max-w-2xl space-y-4">
                <CalibrationChartSection />
                <div className="rounded-lg border border-border bg-muted/30 p-5 text-sm leading-relaxed text-muted-foreground/60">
                  <span className="font-medium text-foreground">Calibration</span> means your 70% confident predictions should resolve YES about 70% of the time. Points above the diagonal = overconfident. Points below = underconfident.
                </div>
              </div>
            )}

            {toolTab === "tips" && (
              <div className="lg:col-span-2 max-w-2xl">
                <PredictorTips />
              </div>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />
        <p className="mt-8 pb-4 text-[10px] font-mono text-muted-foreground/30">All prediction markets are simulated for educational purposes.</p>

      </div>
    </div>
  );
}
