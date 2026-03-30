"use client";

import { useState, useMemo, useCallback } from "react";
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
  LogOut,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACTIVE_MARKETS,
  ACTIVE_CATEGORY_LABELS,
  ACTIVE_CATEGORY_COLORS,
  type ActiveMarket,
} from "@/data/active-prediction-markets";
import { useLiveMarketStore } from "@/stores/prediction-market-store";

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

// ── Probability Movement Sparkline ────────────────────────────────────────────

function ProbSparkline({
  data,
  width = 80,
  height = 28,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;
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

  // Area fill
  const firstPt = `${pad.toFixed(1)},${(pad + (height - pad * 2)).toFixed(1)}`;
  const lastPt = `${(pad + (width - pad * 2)).toFixed(1)},${(pad + (height - pad * 2)).toFixed(1)}`;
  const areaPath = `M ${firstPt} L ${pts
    .split(" ")
    .map((p) => `L ${p}`)
    .join(" ")} L ${lastPt} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={areaPath} fill={stroke} fillOpacity={0.08} />
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
  unrealizedPnl,
  onSelect,
  onCashOut,
}: {
  market: ActiveMarket;
  position: ReturnType<typeof useLiveMarketStore.getState>["positions"][number] | undefined;
  unrealizedPnl: number | null;
  onSelect: (m: ActiveMarket) => void;
  onCashOut: (marketId: string) => void;
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

  const currentPrice =
    position?.side === "yes" ? market.yesPrice : position?.side === "no" ? market.noPrice : null;
  const positionCost = position ? (position.avgPrice * position.shares) / 100 : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(market)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(market); }}
      className="w-full rounded-lg border border-border bg-card p-3.5 text-left transition-colors hover:border-border/60 hover:bg-muted/10 cursor-pointer"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-medium",
                ACTIVE_CATEGORY_COLORS[market.category],
              )}
            >
              {ACTIVE_CATEGORY_LABELS[market.category]}
            </span>
            {market.resolution !== "pending" && (
              <span
                className={cn(
                  "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                  market.resolution === "yes"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400",
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
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-primary">
                Position
              </span>
            )}
          </div>
          <p className="text-[12px] font-medium leading-snug text-foreground line-clamp-2">
            {market.question}
          </p>
        </div>

        {/* Probability movement sparkline */}
        <div className="shrink-0">
          <ProbSparkline data={market.priceHistory} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Yes price bar */}
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-[10px]">
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

        {/* Trend + P&L */}
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <div className={cn("flex items-center gap-0.5 text-[10px] font-medium", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            {market.trend}
          </div>
          {unrealizedPnl !== null && (
            <span
              className={cn(
                "text-[9px] font-semibold",
                unrealizedPnl >= 0 ? "text-green-400" : "text-red-400",
              )}
            >
              {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Position summary row */}
      {position && currentPrice !== null && positionCost !== null && unrealizedPnl !== null && (
        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/20 px-2.5 py-1.5">
          <div className="flex items-center gap-2 text-[10px] font-mono tabular-nums">
            <span className="font-semibold text-foreground">
              You:{" "}
              <span className={position.side === "yes" ? "text-green-400" : "text-red-400"}>
                {position.side.toUpperCase()}
              </span>
              {" @ "}{position.avgPrice.toFixed(0)}¢
            </span>
            <span className="text-muted-foreground">
              {position.shares} shares
            </span>
            <span className="text-muted-foreground">
              ${positionCost.toFixed(2)} in
            </span>
            <span
              className={cn(
                "font-semibold",
                unrealizedPnl >= 0 ? "text-green-400" : "text-red-400",
              )}
            >
              {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)}
            </span>
          </div>
          {market.resolution === "pending" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCashOut(market.id);
              }}
              className="flex shrink-0 items-center gap-1 rounded border border-border/60 bg-card px-2 py-0.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              <LogOut className="h-3 w-3" />
              Cash Out {currentPrice}¢
            </button>
          )}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground font-mono tabular-nums">
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
    </div>
  );
}

// ── Detail Panel ─────────────────────────────────────────────────────────────

function MarketDetail({
  market,
  onBack,
}: {
  market: ActiveMarket;
  onBack: () => void;
}) {
  const [orderSide, setOrderSide] = useState<"yes" | "no">("yes");
  const [orderShares, setOrderShares] = useState(10);
  const [resolveResult, setResolveResult] = useState<{
    gain: number;
    won: boolean;
  } | null>(null);

  const { bankroll, invest, cashOut, getPosition } = useLiveMarketStore();
  const position = getPosition(market.id);

  const price = orderSide === "yes" ? market.yesPrice : market.noPrice;
  const totalCost = (price * orderShares) / 100;
  const maxShares = Math.max(1, Math.floor((bankroll * 100) / price));
  const canBuy = totalCost <= bankroll && market.resolution === "pending";

  const potentialGain = orderShares - totalCost;

  const unrealizedPnl = position
    ? position.side === "yes"
      ? ((market.yesPrice - position.avgPrice) * position.shares) / 100
      : ((market.noPrice - position.avgPrice) * position.shares) / 100
    : null;

  const handleBuy = () => {
    if (!canBuy) return;
    invest(market.id, orderSide, orderShares, price);
  };

  const handleCashOut = () => {
    if (!position || market.resolution !== "pending") return;
    const currentPrice = position.side === "yes" ? market.yesPrice : market.noPrice;
    const proceeds = (currentPrice * position.shares) / 100;
    const cost = (position.avgPrice * position.shares) / 100;
    const gain = proceeds - cost;
    cashOut(market.id, currentPrice);
    setResolveResult({ gain, won: gain >= 0 });
  };

  const handleResolve = () => {
    if (!position || market.resolution === "pending") return;
    const won = position.side === market.resolution;
    const payout = won ? position.shares : 0;
    const cost = (position.avgPrice * position.shares) / 100;
    const gain = payout - cost;
    // Use resolveAll with a single-market resolution map
    const { resolveAll } = useLiveMarketStore.getState();
    resolveAll({ [market.id]: market.resolution });
    setResolveResult({ gain, won });
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
              "rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-medium",
              ACTIVE_CATEGORY_COLORS[market.category],
            )}
          >
            {ACTIVE_CATEGORY_LABELS[market.category]}
          </span>
          {market.resolution !== "pending" && (
            <span
              className={cn(
                "flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                market.resolution === "yes"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400",
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

        {/* 7-day probability movement chart */}
        <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>7-day YES probability movement</span>
          <span className="font-mono tabular-nums">
            {market.priceHistory[0]}¢ → {market.priceHistory[6]}¢
          </span>
        </div>
        <div className="rounded bg-muted/30 p-2">
          <ProbSparkline data={market.priceHistory} width={320} height={48} />
        </div>

        {/* Probability momentum note */}
        {(() => {
          const delta = market.priceHistory[6] - market.priceHistory[0];
          const absDelta = Math.abs(delta);
          if (absDelta < 4) return null;
          return (
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Probability moved{" "}
              <span className={delta > 0 ? "text-green-400" : "text-red-400"}>
                {delta > 0 ? "+" : ""}{delta.toFixed(0)} pp
              </span>{" "}
              over 7 days — information is being incorporated into the market.
            </p>
          );
        })()}
      </div>

      {/* Market stats */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: "24h Volume", value: formatDollars(market.volume24h) },
          { label: "Liquidity", value: formatDollars(market.totalLiquidity) },
          { label: "Resolves", value: `${daysUntil(market.resolveDate)}d` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-card px-3 py-2">
            <div className="text-[9px] text-muted-foreground">{label}</div>
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
              <span className="font-mono">${bankroll.toFixed(2)}</span>
            </div>
          </div>

          {/* Shares input */}
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
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
            <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
              <span>1</span>
              <span>{Math.min(200, maxShares)}</span>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded bg-muted/50 px-2 py-1.5 text-center">
              <div className="text-[9px] text-muted-foreground">Cost</div>
              <div className="text-xs font-semibold text-foreground">
                ${totalCost.toFixed(2)}
              </div>
            </div>
            <div className="rounded bg-muted/50 px-2 py-1.5 text-center">
              <div className="text-[9px] text-muted-foreground">Shares</div>
              <div className="text-xs font-semibold text-foreground">
                {orderShares}
              </div>
            </div>
            <div className="rounded bg-muted/50 px-2 py-1.5 text-center">
              <div className="text-[9px] text-muted-foreground">If correct</div>
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

          {!canBuy && bankroll < totalCost && (
            <div className="mb-2 flex items-center gap-1 rounded bg-red-500/10 px-2 py-1.5 text-[10px] text-red-400">
              <AlertCircle className="h-3 w-3 shrink-0" />
              Insufficient balance. Need ${totalCost.toFixed(2)}, have ${bankroll.toFixed(2)}.
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
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your Position
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              {
                label: "Side",
                value: position.side.toUpperCase(),
                color: position.side === "yes" ? "text-green-400" : "text-red-400",
              },
              { label: "Shares", value: String(position.shares) },
              { label: "Avg Price", value: `${position.avgPrice.toFixed(1)}¢` },
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
                <div className="text-[9px] text-muted-foreground">{label}</div>
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

          {resolveResult ? (
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-center text-xs font-semibold",
                resolveResult.won
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400",
              )}
            >
              {resolveResult.won ? "Profitable" : "Loss"}{" "}
              {resolveResult.gain >= 0 ? "+" : ""}${resolveResult.gain.toFixed(2)} P&L
            </div>
          ) : (
            <div className="space-y-2">
              {/* Cash out at current market price */}
              {market.resolution === "pending" && (
                <button
                  onClick={handleCashOut}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cash Out at {position.side === "yes" ? market.yesPrice : market.noPrice}¢
                  <span
                    className={cn(
                      "ml-1 font-mono tabular-nums",
                      unrealizedPnl !== null && unrealizedPnl >= 0
                        ? "text-green-400"
                        : "text-red-400",
                    )}
                  >
                    ({unrealizedPnl !== null ? (unrealizedPnl >= 0 ? "+" : "") + "$" + unrealizedPnl.toFixed(2) : ""})
                  </span>
                </button>
              )}
              {/* Settle against resolved market */}
              {market.resolution !== "pending" && (
                <button
                  onClick={handleResolve}
                  className="w-full rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  Settle Position — market resolved {market.resolution.toUpperCase()}
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
  positions: ReturnType<typeof useLiveMarketStore.getState>["positions"];
  onSelectMarket: (id: string) => void;
}) {
  if (positions.length === 0) {
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
      {positions.map((pos) => {
        const market = ACTIVE_MARKETS.find((m) => m.id === pos.marketId);
        if (!market) return null;
        const currentPrice =
          pos.side === "yes" ? market.yesPrice : market.noPrice;
        const pnl = ((currentPrice - pos.avgPrice) * pos.shares) / 100;
        return (
          <button
            key={pos.marketId}
            onClick={() => onSelectMarket(pos.marketId)}
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
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono tabular-nums">
              <span
                className={cn(
                  "rounded px-1 py-0.5 text-[9px] font-semibold uppercase",
                  pos.side === "yes"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400",
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
                    "rounded px-1 py-0.5 text-[9px] font-semibold uppercase",
                    market.resolution === "yes"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400",
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

// ── History List ──────────────────────────────────────────────────────────────

function HistoryList({
  history,
}: {
  history: ReturnType<typeof useLiveMarketStore.getState>["history"];
}) {
  if (history.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-card text-muted-foreground">
        <span className="text-sm">No closed positions</span>
        <span className="text-xs opacity-60">Cash out or settle a market position to populate history</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[480px] text-[11px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Market</th>
            <th className="px-3 py-2 text-center font-medium text-muted-foreground">Side</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Shares</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">P&L</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Date</th>
          </tr>
        </thead>
        <tbody>
          {history.slice(0, 20).map((h, i) => {
            const market = ACTIVE_MARKETS.find((m) => m.id === h.marketId);
            return (
              <tr key={i} className="border-b border-border/40 last:border-0">
                <td className="max-w-[200px] truncate px-3 py-2 text-foreground">
                  {market?.question.slice(0, 40) ?? h.marketId}
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={cn(
                      "rounded px-1 py-0.5 text-[9px] font-semibold uppercase",
                      h.side === "yes"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400",
                    )}
                  >
                    {h.side}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                  {h.shares}
                </td>
                <td
                  className={cn(
                    "px-3 py-2 text-right font-mono tabular-nums font-semibold",
                    h.pnl >= 0 ? "text-green-400" : "text-red-400",
                  )}
                >
                  {h.pnl >= 0 ? "+" : ""}${h.pnl.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground">
                  {new Date(h.resolvedAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main LiveMarkets Component ────────────────────────────────────────────────

type CategoryFilter = "all" | ActiveMarket["category"];
type ActiveTab = "markets" | "positions" | "history";

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "macro", label: "Macro" },
  { value: "earnings", label: "Earnings" },
  { value: "crypto", label: "Crypto" },
  { value: "politics", label: "Politics" },
  { value: "commodities", label: "Commodities" },
];

export function LiveMarkets() {
  const { bankroll, positions, history } = useLiveMarketStore();

  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [activeTab, setActiveTab] = useState<ActiveTab>("markets");

  const filteredMarkets = useMemo(
    () =>
      categoryFilter === "all"
        ? ACTIVE_MARKETS
        : ACTIVE_MARKETS.filter((m) => m.category === categoryFilter),
    [categoryFilter],
  );

  const selectedMarket = useMemo(
    () =>
      selectedMarketId
        ? ACTIVE_MARKETS.find((m) => m.id === selectedMarketId) ?? null
        : null,
    [selectedMarketId],
  );

  // Total portfolio stats
  const portfolioStats = useMemo(() => {
    let invested = 0;
    let currentValue = 0;
    for (const pos of positions) {
      const market = ACTIVE_MARKETS.find((m) => m.id === pos.marketId);
      if (!market) continue;
      const cost = (pos.avgPrice * pos.shares) / 100;
      const current =
        pos.side === "yes"
          ? (market.yesPrice * pos.shares) / 100
          : (market.noPrice * pos.shares) / 100;
      invested += cost;
      currentValue += current;
    }
    return { invested, currentValue, pnl: currentValue - invested };
  }, [positions]);

  const handleSelectMarketById = useCallback((id: string) => {
    setSelectedMarketId(id);
    setActiveTab("markets");
  }, []);

  const handleCardCashOut = useCallback(
    (marketId: string) => {
      const pos = useLiveMarketStore.getState().positions.find((p) => p.marketId === marketId);
      if (!pos) return;
      const market = ACTIVE_MARKETS.find((m) => m.id === marketId);
      if (!market) return;
      const currentPrice = pos.side === "yes" ? market.yesPrice : market.noPrice;
      useLiveMarketStore.getState().cashOut(marketId, currentPrice);
    },
    [],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Balance + stats bar */}
      <div className="border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5">
            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Bankroll</span>
            <span className="font-mono tabular-nums text-xs font-semibold text-foreground">
              ${bankroll.toFixed(2)}
            </span>
          </div>
          {positions.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5">
                <span className="text-[10px] text-muted-foreground">Invested</span>
                <span className="font-mono tabular-nums text-xs font-semibold text-foreground">
                  ${portfolioStats.invested.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5">
                <span className="text-[10px] text-muted-foreground">Unrealized P&L</span>
                <span
                  className={cn(
                    "font-mono tabular-nums text-xs font-semibold",
                    portfolioStats.pnl >= 0 ? "text-green-400" : "text-red-400",
                  )}
                >
                  {portfolioStats.pnl >= 0 ? "+" : ""}${portfolioStats.pnl.toFixed(2)}
                </span>
              </div>
            </>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-0.5">
            {(["markets", "positions", "history"] as ActiveTab[]).map((tab) => (
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
                {tab === "positions" && positions.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary/20 px-1 text-[9px] font-bold text-primary">
                    {positions.length}
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
              {filteredMarkets.map((market) => {
                const pos = positions.find((p) => p.marketId === market.id);
                const unrealizedPnl = pos
                  ? pos.side === "yes"
                    ? ((market.yesPrice - pos.avgPrice) * pos.shares) / 100
                    : ((market.noPrice - pos.avgPrice) * pos.shares) / 100
                  : null;
                return (
                  <MarketCard
                    key={market.id}
                    market={market}
                    position={pos}
                    unrealizedPnl={unrealizedPnl}
                    onSelect={(m) => setSelectedMarketId(m.id)}
                    onCashOut={handleCardCashOut}
                  />
                );
              })}
            </div>
          </>
        )}

        {activeTab === "markets" && selectedMarket && (
          <MarketDetail
            market={selectedMarket}
            onBack={() => setSelectedMarketId(null)}
          />
        )}

        {activeTab === "positions" && (
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Open Positions ({positions.length})
            </h2>
            <PositionsList
              positions={positions}
              onSelectMarket={handleSelectMarketById}
            />
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Clock className="mr-1 inline h-3.5 w-3.5" />
                Closed Positions ({history.length})
              </h2>
              {history.length > 0 && (
                <span
                  className={cn(
                    "font-mono tabular-nums text-xs font-semibold",
                    history.reduce((s, h) => s + h.pnl, 0) >= 0
                      ? "text-green-400"
                      : "text-red-400",
                  )}
                >
                  Total realized:{" "}
                  {history.reduce((s, h) => s + h.pnl, 0) >= 0 ? "+" : ""}$
                  {history.reduce((s, h) => s + h.pnl, 0).toFixed(2)}
                </span>
              )}
            </div>
            <HistoryList history={history} />
          </div>
        )}
      </div>
    </div>
  );
}
