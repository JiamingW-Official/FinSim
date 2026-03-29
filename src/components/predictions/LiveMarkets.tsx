"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Droplets,
  Calendar,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACTIVE_MARKETS,
  ACTIVE_CATEGORY_LABELS,
  ACTIVE_CATEGORY_COLORS,
  type ActiveMarket,
} from "@/data/active-prediction-markets";

// ── Types ────────────────────────────────────────────────────────────────────

interface UserPosition {
  side: "yes" | "no";
  shares: number;
  avgPrice: number; // price paid (0–100 scale)
}

const STORAGE_KEY = "liveMarkets_balance_v1";
const POSITIONS_KEY = "liveMarkets_positions_v1";
const DEFAULT_BALANCE = 1000;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDollars(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

// ── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({
  data,
  width = 80,
  height = 28,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
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
  const stroke = delta > 3 ? "#22c55e" : delta < -3 ? "#ef4444" : "#71717a";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Market Card ───────────────────────────────────────────────────────────────

function MarketCard({
  market,
  position,
  onSelect,
}: {
  market: ActiveMarket;
  position?: UserPosition;
  onSelect: (m: ActiveMarket) => void;
}) {
  const TrendIcon =
    market.trend === "rising"
      ? TrendingUp
      : market.trend === "falling"
        ? TrendingDown
        : Minus;
  const trendColor =
    market.trend === "rising"
      ? "text-green-400"
      : market.trend === "falling"
        ? "text-red-400"
        : "text-muted-foreground";

  const unrealizedPnl = position
    ? position.side === "yes"
      ? ((market.yesPrice - position.avgPrice) * position.shares) / 100
      : ((market.noPrice - position.avgPrice) * position.shares) / 100
    : null;

  return (
    <button
      onClick={() => onSelect(market)}
      className="w-full rounded-lg border border-border bg-card p-3.5 text-left transition-colors hover:border-border/60 hover:bg-muted/10"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium",
                ACTIVE_CATEGORY_COLORS[market.category],
              )}
            >
              {ACTIVE_CATEGORY_LABELS[market.category]}
            </span>
            {market.resolution !== "pending" && (
              <span
                className={cn(
                  "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase",
                  market.resolution === "yes"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/5 text-red-400",
                )}
              >
                {market.resolution === "yes" ? (
                  <CheckCircle2 className="h-2.5 w-2.5" />
                ) : (
                  <XCircle className="h-2.5 w-2.5" />
                )}
                Resolved {market.resolution.toUpperCase()}
              </span>
            )}
            {position && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase text-primary">
                {position.side.toUpperCase()} {position.shares}sh
              </span>
            )}
          </div>
          <p className="text-[12px] font-medium leading-snug text-foreground line-clamp-2">
            {market.question}
          </p>
        </div>
        <Sparkline data={market.priceHistory} />
      </div>

      <div className="flex items-center gap-3">
        {/* Yes price bar */}
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-green-400 font-semibold">
              YES {market.yesPrice}¢
            </span>
            <span className="text-red-400 font-medium">
              NO {market.noPrice}¢
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-red-500/20">
            <div
              className="h-full rounded-full bg-green-500/60 transition-all"
              style={{ width: `${market.yesPrice}%` }}
            />
          </div>
        </div>

        {/* Trend + meta */}
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <div className={cn("flex items-center gap-0.5 text-xs font-medium", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            {market.trend}
          </div>
          {unrealizedPnl !== null && (
            <span
              className={cn(
                "text-[11px] font-semibold",
                unrealizedPnl >= 0 ? "text-green-400" : "text-red-400",
              )}
            >
              {unrealizedPnl >= 0 ? "+" : ""}
              {unrealizedPnl.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground font-mono tabular-nums">
        <span className="flex items-center gap-0.5">
          <BarChart3 className="h-3 w-3" />
          {formatDollars(market.volume24h)} 24h
        </span>
        <span className="flex items-center gap-0.5">
          <Droplets className="h-3 w-3" />
          {formatDollars(market.totalLiquidity)} liq
        </span>
        <span className="flex items-center gap-0.5">
          <Calendar className="h-3 w-3" />
          {daysUntil(market.resolveDate)}d left
        </span>
      </div>
    </button>
  );
}

// ── Detail Panel ─────────────────────────────────────────────────────────────

function MarketDetail({
  market,
  position,
  balance,
  onBuy,
  onResolve,
  onBack,
}: {
  market: ActiveMarket;
  position?: UserPosition;
  balance: number;
  onBuy: (side: "yes" | "no", shares: number) => void;
  onResolve: () => void;
  onBack: () => void;
}) {
  const [orderSide, setOrderSide] = useState<"yes" | "no">("yes");
  const [orderShares, setOrderShares] = useState(10);
  const [resolveResult, setResolveResult] = useState<{
    gain: number;
    side: string;
  } | null>(null);

  const price = orderSide === "yes" ? market.yesPrice : market.noPrice;
  const totalCost = (price * orderShares) / 100;
  const maxShares = Math.max(1, Math.floor((balance * 100) / price));
  const canBuy = totalCost <= balance && market.resolution === "pending";

  // Potential gain if correct (shares payout at $1 each → gain = shares - cost)
  const potentialGain = orderShares - totalCost;

  // Unrealized P&L for existing position
  const unrealizedPnl = position
    ? position.side === "yes"
      ? ((market.yesPrice - position.avgPrice) * position.shares) / 100
      : ((market.noPrice - position.avgPrice) * position.shares) / 100
    : null;

  const handleBuy = () => {
    if (!canBuy) return;
    onBuy(orderSide, orderShares);
  };

  const handleResolve = () => {
    if (!position || market.resolution === "pending") return;
    const won = position.side === market.resolution;
    const gain = won ? position.shares - (position.avgPrice * position.shares) / 100 : -(position.avgPrice * position.shares) / 100;
    setResolveResult({ gain, side: position.side });
    onResolve();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-3 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to markets
      </button>

      {/* Market question */}
      <div className="mb-4 rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[11px] font-medium",
              ACTIVE_CATEGORY_COLORS[market.category],
            )}
          >
            {ACTIVE_CATEGORY_LABELS[market.category]}
          </span>
          {market.resolution !== "pending" && (
            <span
              className={cn(
                "flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase",
                market.resolution === "yes"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/5 text-red-400",
              )}
            >
              {market.resolution === "yes" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              Resolved {market.resolution.toUpperCase()}
            </span>
          )}
        </div>
        <h2 className="text-sm font-semibold leading-snug text-foreground mb-3">
          {market.question}
        </h2>

        {/* Big Yes/No buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => setOrderSide("yes")}
            className={cn(
              "rounded-lg py-2.5 text-sm font-semibold transition-colors",
              orderSide === "yes"
                ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/30"
                : "bg-green-500/8 text-green-400/70 hover:bg-green-500/15",
            )}
          >
            YES {market.yesPrice}¢
          </button>
          <button
            onClick={() => setOrderSide("no")}
            className={cn(
              "rounded-lg py-2.5 text-sm font-semibold transition-colors",
              orderSide === "no"
                ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                : "bg-red-500/8 text-red-400/70 hover:bg-red-500/15",
            )}
          >
            NO {market.noPrice}¢
          </button>
        </div>

        {/* 7-day price history sparkline */}
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>7-day YES price history</span>
          <span className="font-mono tabular-nums">
            {market.priceHistory[0]}¢ → {market.priceHistory[6]}¢
          </span>
        </div>
        <div className="rounded bg-muted/30 p-2">
          <Sparkline data={market.priceHistory} width={320} height={48} />
        </div>
      </div>

      {/* Market stats */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: "24h Volume", value: formatDollars(market.volume24h) },
          { label: "Liquidity", value: formatDollars(market.totalLiquidity) },
          {
            label: "Resolves",
            value: `${daysUntil(market.resolveDate)}d`,
          },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-card px-3 py-2">
            <div className="text-[11px] text-muted-foreground">{label}</div>
            <div className="font-mono tabular-nums text-sm font-semibold text-foreground">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Order form */}
      {market.resolution === "pending" && (
        <div className="mb-4 rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Buy {orderSide === "yes" ? "YES" : "NO"}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Wallet className="h-3 w-3" />
              <span className="font-mono">${balance.toFixed(2)}</span>
            </div>
          </div>

          {/* Shares input */}
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Shares</span>
              <span className="font-medium text-foreground">{orderShares}</span>
            </div>
            <input
              type="range"
              min={1}
              max={Math.min(200, maxShares)}
              step={1}
              value={orderShares}
              onChange={(e) => setOrderShares(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground">
              <span>1</span>
              <span>{Math.min(200, maxShares)}</span>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded bg-muted/50 px-2 py-1.5 text-center">
              <div className="text-[11px] text-muted-foreground">Cost</div>
              <div className="text-xs font-semibold text-foreground">
                ${totalCost.toFixed(2)}
              </div>
            </div>
            <div className="rounded bg-muted/50 px-2 py-1.5 text-center">
              <div className="text-[11px] text-muted-foreground">Shares</div>
              <div className="text-xs font-semibold text-foreground">
                {orderShares}
              </div>
            </div>
            <div className="rounded bg-muted/50 px-2 py-1.5 text-center">
              <div className="text-[11px] text-muted-foreground">If correct</div>
              <div
                className={cn(
                  "text-xs font-semibold",
                  potentialGain >= 0 ? "text-green-400" : "text-red-400",
                )}
              >
                +${potentialGain.toFixed(2)}
              </div>
            </div>
          </div>

          {!canBuy && balance < totalCost && (
            <div className="mb-2 flex items-center gap-1 rounded bg-red-500/5 px-2 py-1.5 text-xs text-red-400">
              <AlertCircle className="h-3 w-3 shrink-0" />
              Insufficient balance. Need ${totalCost.toFixed(2)}, have ${balance.toFixed(2)}.
            </div>
          )}

          <button
            onClick={handleBuy}
            disabled={!canBuy}
            className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            Buy {orderSide === "yes" ? "YES" : "NO"} — ${totalCost.toFixed(2)}
          </button>
        </div>
      )}

      {/* Existing position panel */}
      {position && (
        <div className="mb-4 rounded-lg border border-border bg-muted/20 p-4">
          <div className="mb-2 text-[11px] font-semibold text-muted-foreground">
            Your Position
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              {
                label: "Side",
                value: position.side.toUpperCase(),
                color:
                  position.side === "yes" ? "text-green-400" : "text-red-400",
              },
              { label: "Shares", value: String(position.shares) },
              {
                label: "Avg Price",
                value: `${position.avgPrice.toFixed(1)}¢`,
              },
              {
                label: "Unrealized P&L",
                value:
                  unrealizedPnl !== null
                    ? `${unrealizedPnl >= 0 ? "+" : ""}$${unrealizedPnl.toFixed(2)}`
                    : "--",
                color:
                  unrealizedPnl !== null
                    ? unrealizedPnl >= 0
                      ? "text-green-400"
                      : "text-red-400"
                    : undefined,
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded bg-muted/40 px-2 py-1.5">
                <div className="text-[11px] text-muted-foreground">{label}</div>
                <div
                  className={cn(
                    "font-mono tabular-nums text-xs font-semibold",
                    color || "text-foreground",
                  )}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Resolve button for settled markets */}
          {market.resolution !== "pending" && (
            <div>
              {resolveResult ? (
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-center text-xs font-semibold",
                    resolveResult.gain >= 0
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/5 text-red-400",
                  )}
                >
                  {resolveResult.gain >= 0 ? "Correct!" : "Incorrect"}{" "}
                  {resolveResult.gain >= 0 ? "+" : ""}$
                  {resolveResult.gain.toFixed(2)} P&L
                </div>
              ) : (
                <button
                  onClick={handleResolve}
                  className="w-full rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  Resolve Position — market settled {market.resolution.toUpperCase()}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Positions List ────────────────────────────────────────────────────────────

function PositionsList({
  positions,
  onSelectMarket,
}: {
  positions: Map<string, UserPosition>;
  onSelectMarket: (id: string) => void;
}) {
  if (positions.size === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-card text-muted-foreground">
        <span className="text-sm">No positions yet</span>
        <span className="text-xs opacity-60">
          Buy YES or NO shares in any market above
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from(positions.entries()).map(([id, pos]) => {
        const market = ACTIVE_MARKETS.find((m) => m.id === id);
        if (!market) return null;
        const currentPrice =
          pos.side === "yes" ? market.yesPrice : market.noPrice;
        const pnl = ((currentPrice - pos.avgPrice) * pos.shares) / 100;
        return (
          <button
            key={id}
            onClick={() => onSelectMarket(id)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-border/60"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-foreground leading-snug line-clamp-1 flex-1">
                {market.question}
              </p>
              <span
                className={cn(
                  "shrink-0 font-mono tabular-nums text-[11px] font-semibold",
                  pnl >= 0 ? "text-green-400" : "text-red-400",
                )}
              >
                {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono tabular-nums">
              <span
                className={cn(
                  "rounded px-1 py-0.5 text-[11px] font-semibold uppercase",
                  pos.side === "yes"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/5 text-red-400",
                )}
              >
                {pos.side}
              </span>
              <span>{pos.shares} shares</span>
              <span>avg {pos.avgPrice.toFixed(1)}¢</span>
              <span>now {currentPrice}¢</span>
              {market.resolution !== "pending" && (
                <span
                  className={cn(
                    "rounded px-1 py-0.5 text-[11px] font-semibold uppercase",
                    market.resolution === "yes"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/5 text-red-400",
                  )}
                >
                  Resolved {market.resolution}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Main LiveMarkets Component ────────────────────────────────────────────────

type CategoryFilter = "all" | ActiveMarket["category"];

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "macro", label: "Macro" },
  { value: "earnings", label: "Earnings" },
  { value: "crypto", label: "Crypto" },
  { value: "politics", label: "Politics" },
  { value: "commodities", label: "Commodities" },
];

export function LiveMarkets() {
  const [balance, setBalance] = useState<number>(DEFAULT_BALANCE);
  const [positions, setPositions] = useState<Map<string, UserPosition>>(
    new Map(),
  );
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [activeTab, setActiveTab] = useState<"markets" | "positions">(
    "markets",
  );

  // Load from localStorage
  useEffect(() => {
    try {
      const savedBalance = localStorage.getItem(STORAGE_KEY);
      if (savedBalance) setBalance(parseFloat(savedBalance));
      const savedPositions = localStorage.getItem(POSITIONS_KEY);
      if (savedPositions) {
        const parsed = JSON.parse(savedPositions) as [string, UserPosition][];
        setPositions(new Map(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem(
      POSITIONS_KEY,
      JSON.stringify(Array.from(positions.entries())),
    );
  }, [positions]);

  const filteredMarkets = useMemo(
    () =>
      categoryFilter === "all"
        ? ACTIVE_MARKETS
        : ACTIVE_MARKETS.filter((m) => m.category === categoryFilter),
    [categoryFilter],
  );

  const selectedMarket = useMemo(
    () => (selectedMarketId ? ACTIVE_MARKETS.find((m) => m.id === selectedMarketId) ?? null : null),
    [selectedMarketId],
  );

  // Total portfolio value
  const portfolioStats = useMemo(() => {
    let invested = 0;
    let currentValue = 0;
    positions.forEach((pos, id) => {
      const market = ACTIVE_MARKETS.find((m) => m.id === id);
      if (!market) return;
      const cost = (pos.avgPrice * pos.shares) / 100;
      const current =
        pos.side === "yes"
          ? (market.yesPrice * pos.shares) / 100
          : (market.noPrice * pos.shares) / 100;
      invested += cost;
      currentValue += current;
    });
    return { invested, currentValue, pnl: currentValue - invested };
  }, [positions]);

  const handleBuy = useCallback(
    (side: "yes" | "no", shares: number) => {
      if (!selectedMarket) return;
      const price = side === "yes" ? selectedMarket.yesPrice : selectedMarket.noPrice;
      const cost = (price * shares) / 100;
      if (cost > balance) return;

      setBalance((b) => parseFloat((b - cost).toFixed(2)));
      setPositions((prev) => {
        const next = new Map(prev);
        const existing = next.get(selectedMarket.id);
        if (existing && existing.side === side) {
          const totalShares = existing.shares + shares;
          const totalCost =
            (existing.avgPrice * existing.shares) / 100 + cost;
          next.set(selectedMarket.id, {
            side,
            shares: totalShares,
            avgPrice: parseFloat(((totalCost / totalShares) * 100).toFixed(2)),
          });
        } else {
          next.set(selectedMarket.id, {
            side,
            shares,
            avgPrice: price,
          });
        }
        return next;
      });
    },
    [selectedMarket, balance],
  );

  const handleResolve = useCallback(() => {
    if (!selectedMarket) return;
    const pos = positions.get(selectedMarket.id);
    if (!pos || selectedMarket.resolution === "pending") return;

    const won = pos.side === selectedMarket.resolution;
    const payout = won ? pos.shares : 0; // each share pays $1 if correct
    setBalance((b) => parseFloat((b + payout).toFixed(2)));
    setPositions((prev) => {
      const next = new Map(prev);
      next.delete(selectedMarket.id);
      return next;
    });
  }, [selectedMarket, positions]);

  const handleSelectMarketById = useCallback((id: string) => {
    setSelectedMarketId(id);
    setActiveTab("markets");
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Balance + stats bar */}
      <div className="border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5">
            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Balance</span>
            <span className="font-mono tabular-nums text-xs font-semibold text-foreground">
              ${balance.toFixed(2)}
            </span>
          </div>
          {positions.size > 0 && (
            <>
              <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5">
                <span className="text-xs text-muted-foreground">Invested</span>
                <span className="font-mono tabular-nums text-xs font-semibold text-foreground">
                  ${portfolioStats.invested.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5">
                <span className="text-xs text-muted-foreground">P&L</span>
                <span
                  className={cn(
                    "font-mono tabular-nums text-xs font-semibold",
                    portfolioStats.pnl >= 0 ? "text-green-400" : "text-red-400",
                  )}
                >
                  {portfolioStats.pnl >= 0 ? "+" : ""}$
                  {portfolioStats.pnl.toFixed(2)}
                </span>
              </div>
            </>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-0.5">
            {(["markets", "positions"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded px-2.5 py-1 text-[11px] font-medium transition-colors capitalize",
                  activeTab === tab
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab}
                {tab === "positions" && positions.size > 0 && (
                  <span className="ml-1 rounded-full bg-primary/20 px-1 text-[11px] font-bold text-primary">
                    {positions.size}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "markets" && !selectedMarket && (
          <>
            {/* Category filter */}
            <div className="mb-4 flex items-center gap-1 overflow-x-auto pb-0.5">
              {CATEGORY_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setCategoryFilter(f.value)}
                  className={cn(
                    "shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    categoryFilter === f.value
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "border-border/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Market grid */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {filteredMarkets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  position={positions.get(market.id)}
                  onSelect={(m) => setSelectedMarketId(m.id)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === "markets" && selectedMarket && (
          <MarketDetail
            market={selectedMarket}
            position={positions.get(selectedMarket.id)}
            balance={balance}
            onBuy={handleBuy}
            onResolve={handleResolve}
            onBack={() => setSelectedMarketId(null)}
          />
        )}

        {activeTab === "positions" && (
          <div>
            <h2 className="mb-3 text-xs font-semibold text-muted-foreground">
              My Positions ({positions.size})
            </h2>
            <PositionsList
              positions={positions}
              onSelectMarket={handleSelectMarketById}
            />
          </div>
        )}
      </div>
    </div>
  );
}
