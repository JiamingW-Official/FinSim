"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Loader2, TrendingUp, TrendingDown, Activity, Layers, DollarSign, Percent, BarChart2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimeTravelControls } from "@/components/chart/TimeTravelControls";
import { TradeHistory } from "@/components/trading/TradeHistory";
import { PositionsTable } from "@/components/trading/PositionsTable";
import { OpenPositionsTable } from "@/components/trading/OpenPositionsTable";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useTradingStore } from "@/stores/trading-store";
import { useGameStore } from "@/stores/game-store";
import { cn, formatCurrency } from "@/lib/utils";
import {
  CRYPTO_ASSETS,
  generateCryptoDailyBars,
  generateCryptoHourlyBars,
  aggregateCryptoWeeklyBars,
  getDefiMetrics,
  getFundingRate,
  getOpenInterest,
  type CryptoAsset,
  type DefiMetrics,
} from "@/services/market-data/crypto-generator";

// Dynamic import so lightweight-charts only loads client-side
const CandlestickChart = dynamic(
  () =>
    import("@/components/chart/CandlestickChart").then(
      (mod) => mod.CandlestickChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading chart...
      </div>
    ),
  },
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatLargeUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatCryptoPrice(price: number): string {
  if (price >= 10_000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (price >= 100) return `$${price.toFixed(2)}`;
  if (price >= 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

function computeLiquidationPrice(
  entryPrice: number,
  leverage: number,
  side: "long" | "short",
): number {
  // Simplified: liquidation when loss = margin (initial margin = 1/leverage)
  const maintenanceMarginRate = 0.005; // 0.5%
  if (side === "long") {
    return entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
  } else {
    return entryPrice * (1 + (1 / leverage) - maintenanceMarginRate);
  }
}

// ---------------------------------------------------------------------------
// Crypto Watchlist component
// ---------------------------------------------------------------------------
function CryptoWatchlist({
  selected,
  onSelect,
  currentPrices,
}: {
  selected: string;
  onSelect: (ticker: string) => void;
  currentPrices: Record<string, number>;
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium border-b border-border">
        Crypto Assets
      </div>
      {CRYPTO_ASSETS.map((asset) => {
        const price = currentPrices[asset.ticker] ?? asset.basePrice;
        const isActive = selected === asset.ticker;
        return (
          <button
            key={asset.ticker}
            onClick={() => onSelect(asset.ticker)}
            className={cn(
              "flex flex-col gap-0.5 px-3 py-2 text-left transition-colors border-b border-border/40",
              isActive
                ? "bg-primary/10 border-l-2 border-l-primary"
                : "hover:bg-accent/30",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">{asset.ticker}</span>
              <span className="text-xs font-mono tabular-nums">
                {formatCryptoPrice(price)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{asset.category}</span>
              <span className="text-[10px] text-muted-foreground">{asset.name}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Market-always-open badge
// ---------------------------------------------------------------------------
function MarketStatusBadge() {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
      </span>
      <span className="text-[10px] font-medium text-green-500">24/7 Open</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Leverage selector
// ---------------------------------------------------------------------------
const LEVERAGE_OPTIONS = [1, 2, 5, 10] as const;
type Leverage = (typeof LEVERAGE_OPTIONS)[number];

function LeverageSelector({
  value,
  onChange,
}: {
  value: Leverage;
  onChange: (v: Leverage) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Layers className="h-3 w-3" />
        Leverage
      </div>
      <div className="grid grid-cols-4 gap-0.5 rounded-md bg-muted p-0.5">
        {LEVERAGE_OPTIONS.map((lev) => (
          <button
            key={lev}
            onClick={() => onChange(lev)}
            className={cn(
              "rounded py-1 text-[10px] font-semibold transition-colors",
              value === lev
                ? "bg-amber-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {lev}x
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DeFi metrics sidebar panel
// ---------------------------------------------------------------------------
function DefiMetricsPanel({ ticker, barTimestamp }: { ticker: string; barTimestamp: number }) {
  const asset = CRYPTO_ASSETS.find((a) => a.ticker === ticker);
  const defi = useMemo(() => getDefiMetrics(ticker, barTimestamp), [ticker, barTimestamp]);
  const fundingRate = useMemo(() => getFundingRate(ticker, barTimestamp), [ticker, barTimestamp]);
  const oi = useMemo(
    () => (asset ? getOpenInterest(asset, barTimestamp) : 0),
    [asset, barTimestamp],
  );

  const fundingColor =
    fundingRate > 0 ? "text-green-500" : fundingRate < 0 ? "text-red-400" : "text-muted-foreground";

  return (
    <div className="space-y-3 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        On-Chain Metrics — {ticker}
      </div>

      <div className="space-y-2">
        {/* Protocol */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Protocol</span>
          <span className="font-medium text-right text-[11px]">{defi.protocol}</span>
        </div>

        {/* TVL */}
        {defi.tvlUsd > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Lock className="h-3 w-3" />
              TVL
            </span>
            <span className="font-mono tabular-nums text-xs font-medium">
              {formatLargeUsd(defi.tvlUsd)}
            </span>
          </div>
        )}

        {/* Staking yield */}
        {defi.stakingYieldPct > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Percent className="h-3 w-3" />
              Staking APY
            </span>
            <span className="font-mono tabular-nums text-xs font-medium text-green-500">
              {defi.stakingYieldPct.toFixed(2)}%
            </span>
          </div>
        )}

        {/* 7-day on-chain volume */}
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <BarChart2 className="h-3 w-3" />
            7d On-Chain Vol
          </span>
          <span className="font-mono tabular-nums text-xs font-medium">
            {formatLargeUsd(defi.onChainVolume7dUsd)}
          </span>
        </div>

        {/* Market dominance */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Dominance</span>
          <span className="font-mono tabular-nums text-xs">{defi.dominancePct.toFixed(2)}%</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Perps data */}
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        Perpetuals
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Funding Rate (8h)</span>
          <span className={cn("font-mono tabular-nums text-xs font-medium", fundingColor)}>
            {fundingRate >= 0 ? "+" : ""}
            {(fundingRate * 100).toFixed(4)}%
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Open Interest</span>
          <span className="font-mono tabular-nums text-xs font-medium">
            {formatLargeUsd(oi)}
          </span>
        </div>
        <div className="mt-1 rounded bg-muted/50 p-2 text-[10px] text-muted-foreground leading-relaxed">
          {fundingRate > 0
            ? "Positive funding: longs pay shorts. Market is bullish-biased."
            : fundingRate < 0
            ? "Negative funding: shorts pay longs. Market is bearish-biased."
            : "Neutral funding rate."}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Crypto order entry (leverage-aware)
// ---------------------------------------------------------------------------
function CryptoOrderEntry({
  ticker,
  price,
  leverage,
  onLeverageChange,
}: {
  ticker: string;
  price: number;
  leverage: Leverage;
  onLeverageChange: (v: Leverage) => void;
}) {
  const [side, setSide] = useState<"long" | "short">("long");
  const [quantity, setQuantity] = useState("0.1");

  const cash = useTradingStore((s) => s.cash);
  const positions = useTradingStore((s) => s.positions);
  const placeBuyOrder = useTradingStore((s) => s.placeBuyOrder);
  const placeSellOrder = useTradingStore((s) => s.placeSellOrder);
  const placeShortOrder = useTradingStore((s) => s.placeShortOrder);
  const recordTrade = useGameStore((s) => s.recordTrade);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const currentBar = allData.length > 0 && revealedCount > 0
    ? allData[revealedCount - 1]
    : null;

  const qty = Math.max(0, parseFloat(quantity) || 0);
  const notionalValue = qty * price;
  const marginRequired = notionalValue / leverage;
  const commission = Math.max(0.5, notionalValue * 0.0006); // 0.06% taker fee

  const liquidationPrice = price > 0 && qty > 0
    ? computeLiquidationPrice(price, leverage, side)
    : null;

  const longPosition = positions.find((p) => p.ticker === ticker && p.side === "long");
  const shortPosition = positions.find((p) => p.ticker === ticker && p.side === "short");

  const canExecute =
    qty > 0 &&
    price > 0 &&
    (side === "long" ? marginRequired + commission <= cash : true);

  const handleExecute = useCallback(() => {
    if (!currentBar || qty <= 0 || price <= 0) return;
    const simDate = currentBar.timestamp;

    if (side === "long") {
      // For simplicity, use 1 share = qty coins; leverage only affects display cost
      // We simulate by buying qty shares at price but only charging margin
      const order = placeBuyOrder(ticker, qty, price, simDate);
      if (order) {
        toast.success(`Long ${qty} ${ticker} @ ${formatCryptoPrice(price)} (${leverage}x)`);
        recordTrade(0, ticker, false, false);
      } else {
        toast.error("Insufficient margin");
      }
    } else {
      if (longPosition && longPosition.quantity >= qty) {
        const order = placeSellOrder(ticker, qty, price, simDate);
        if (order) {
          const pnl = (order.avgFillPrice - longPosition.avgPrice) * qty * leverage;
          toast.success(`Closed ${qty} ${ticker} — P&L: ${pnl >= 0 ? "+" : ""}${formatCurrency(pnl)}`);
          recordTrade(pnl, ticker, false, false);
        }
      } else {
        placeShortOrder(ticker, qty, price, simDate);
        toast.success(`Short ${qty} ${ticker} @ ${formatCryptoPrice(price)} (${leverage}x)`);
        recordTrade(0, ticker, true, false);
      }
    }
  }, [
    currentBar, qty, price, side, leverage, ticker,
    placeBuyOrder, placeSellOrder, placeShortOrder, recordTrade, longPosition,
  ]);

  return (
    <div className="flex flex-col gap-2.5 p-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Order Entry
        </div>
        <MarketStatusBadge />
      </div>

      {/* Price */}
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">{ticker}</span>
        <span className="text-lg font-bold tabular-nums tracking-tight">
          {price > 0 ? formatCryptoPrice(price) : "---"}
        </span>
      </div>

      {/* Long / Short */}
      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-0.5">
        <button
          onClick={() => setSide("long")}
          className={cn(
            "rounded py-1.5 text-xs font-semibold transition-all",
            side === "long"
              ? "bg-green-500 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            LONG
          </span>
        </button>
        <button
          onClick={() => setSide("short")}
          className={cn(
            "rounded py-1.5 text-xs font-semibold transition-all",
            side === "short"
              ? "bg-red-500 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="inline-flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            SHORT
          </span>
        </button>
      </div>

      {/* Leverage */}
      <LeverageSelector value={leverage} onChange={onLeverageChange} />

      {/* Quantity */}
      <div>
        <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          Amount ({ticker})
        </label>
        <Input
          type="number"
          step="0.001"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="h-8 bg-background text-sm font-mono tabular-nums"
        />
      </div>

      {/* Quick amount buttons */}
      <div className="flex gap-1">
        {["0.01", "0.1", "0.5", "1", "5"].map((q) => (
          <button
            key={q}
            onClick={() => setQuantity(q)}
            className={cn(
              "flex-1 rounded py-1 text-[10px] font-medium transition-all",
              quantity === q
                ? "bg-primary text-white"
                : "border border-border/40 text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Order summary */}
      {price > 0 && qty > 0 && (
        <div className="space-y-1 rounded-md bg-muted/50 p-2">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Notional
            </span>
            <span className="font-mono tabular-nums font-medium">
              {formatCurrency(notionalValue)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Margin ({leverage}x)</span>
            <span className="font-mono tabular-nums">{formatCurrency(marginRequired)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Fee (0.06%)</span>
            <span className="font-mono tabular-nums">{formatCurrency(commission)}</span>
          </div>
          {liquidationPrice !== null && leverage > 1 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-500">Liq. Price</span>
              <span className="font-mono tabular-nums text-amber-500 font-semibold">
                {formatCryptoPrice(liquidationPrice)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Cash */}
      <div className="rounded-md bg-muted/50 p-2 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] text-muted-foreground">Available Margin</span>
          <span className="font-mono tabular-nums text-xs font-medium">
            {formatCurrency(cash)}
          </span>
        </div>
        {longPosition && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Long</span>
            <span className="tabular-nums font-medium text-green-500">
              {longPosition.quantity.toFixed(4)} {ticker}
            </span>
          </div>
        )}
        {shortPosition && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Short</span>
            <span className="tabular-nums font-medium text-red-400">
              {shortPosition.quantity.toFixed(4)} {ticker}
            </span>
          </div>
        )}
      </div>

      {/* Execute */}
      <Button
        onClick={handleExecute}
        disabled={!canExecute}
        className={cn(
          "w-full font-semibold tracking-wide uppercase text-sm transition-all",
          side === "long"
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-red-500 hover:bg-red-600 text-white",
        )}
      >
        {side === "long" ? "LONG" : "SHORT"} {ticker}
      </Button>

      {leverage > 1 && (
        <p className="text-[10px] text-amber-500/80 text-center">
          {leverage}x leverage — high risk. Losses are magnified.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeframe buttons (crypto: 1h | 1D | 1W — no intraday market session)
// ---------------------------------------------------------------------------
type CryptoTimeframe = "1h" | "1d" | "1wk";

function CryptoTimeframeBar({
  value,
  onChange,
}: {
  value: CryptoTimeframe;
  onChange: (v: CryptoTimeframe) => void;
}) {
  const options: { value: CryptoTimeframe; label: string }[] = [
    { value: "1h", label: "1H" },
    { value: "1d", label: "1D" },
    { value: "1wk", label: "1W" },
  ];
  return (
    <div className="flex items-center gap-1 border-b border-border px-3 py-1.5 bg-card">
      <span className="text-[10px] text-muted-foreground mr-1">TF</span>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
            value === o.value
              ? "bg-primary text-white"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function CryptoPage() {
  const [selectedTicker, setSelectedTicker] = useState<string>("BTC");
  const [timeframe, setTimeframe] = useState<CryptoTimeframe>("1d");
  const [leverage, setLeverage] = useState<Leverage>(1);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});

  const setTicker = useChartStore((s) => s.setTicker);
  const setTimeframeFn = useChartStore((s) => s.setTimeframe);
  const setAllData = useMarketDataStore((s) => s.setAllData);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  // Generate and inject bars whenever ticker or timeframe changes
  useEffect(() => {
    const asset = CRYPTO_ASSETS.find((a) => a.ticker === selectedTicker);
    if (!asset) return;

    // Always generate daily bars as the base
    const dailyBars = generateCryptoDailyBars(asset, 500);

    let bars;
    if (timeframe === "1h") {
      bars = generateCryptoHourlyBars(dailyBars);
    } else if (timeframe === "1wk") {
      bars = aggregateCryptoWeeklyBars(dailyBars);
    } else {
      bars = dailyBars;
    }

    setAllData(bars);
    setTicker(selectedTicker);
    // Map to the chart store timeframe (1h maps to "1h", 1d to "1d", 1wk to "1wk")
    setTimeframeFn(timeframe === "1h" ? "1h" : timeframe === "1wk" ? "1wk" : "1d");
  }, [selectedTicker, timeframe, setAllData, setTicker, setTimeframeFn]);

  // Build a price map from the last known close for each crypto asset
  // We generate minimal data just for the watchlist (5-day peek)
  useEffect(() => {
    const prices: Record<string, number> = {};
    for (const asset of CRYPTO_ASSETS) {
      const bars = generateCryptoDailyBars(asset, 5);
      prices[asset.ticker] = bars[bars.length - 1]?.close ?? asset.basePrice;
    }
    setCurrentPrices(prices);
  }, []);

  // Current price for the selected asset
  const currentPrice = useMemo(() => {
    if (allData.length === 0 || revealedCount === 0) return 0;
    return allData[Math.min(revealedCount - 1, allData.length - 1)]?.close ?? 0;
  }, [allData, revealedCount]);

  // Bar timestamp for seeding DeFi metrics
  const barTimestamp = useMemo(() => {
    if (allData.length === 0 || revealedCount === 0) return Date.now();
    return allData[Math.min(revealedCount - 1, allData.length - 1)]?.timestamp ?? Date.now();
  }, [allData, revealedCount]);

  const handleTickerSelect = useCallback(
    (ticker: string) => {
      setSelectedTicker(ticker);
    },
    [],
  );

  return (
    <div className="flex h-full">
      {/* Left: Crypto Watchlist */}
      <div className="hidden md:flex w-44 shrink-0 flex-col border-r border-border bg-card overflow-hidden">
        <CryptoWatchlist
          selected={selectedTicker}
          onSelect={handleTickerSelect}
          currentPrices={currentPrices}
        />
      </div>

      {/* Center: Chart */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5 bg-card shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{selectedTicker}/USDT</span>
            <span className="text-xs text-muted-foreground">
              {CRYPTO_ASSETS.find((a) => a.ticker === selectedTicker)?.name}
            </span>
            <MarketStatusBadge />
          </div>
          <div className="flex items-center gap-2">
            {currentPrice > 0 && (
              <span className="font-mono text-sm font-bold tabular-nums">
                {formatCryptoPrice(currentPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Timeframe selector */}
        <CryptoTimeframeBar value={timeframe} onChange={setTimeframe} />

        {/* Chart */}
        <div className="relative flex-1">
          <CandlestickChart />
        </div>

        {/* Time travel controls */}
        <TimeTravelControls />

        {/* Bottom tabs */}
        <div className="h-36 shrink-0 overflow-hidden border-t border-border">
          <Tabs defaultValue="open-positions" className="h-full flex flex-col">
            <TabsList className="h-7 w-full justify-start rounded-none border-b border-border bg-card px-2">
              {[
                { value: "open-positions", label: "Open Positions" },
                { value: "positions", label: "Positions" },
                { value: "history", label: "History" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="open-positions" className="flex-1 overflow-auto mt-0">
              <OpenPositionsTable />
            </TabsContent>
            <TabsContent value="positions" className="flex-1 overflow-auto mt-0">
              <PositionsTable />
            </TabsContent>
            <TabsContent value="history" className="flex-1 overflow-auto mt-0">
              <TradeHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right: Order Entry + DeFi Metrics */}
      <div className="hidden md:flex w-64 shrink-0 flex-col border-l border-border bg-card overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <CryptoOrderEntry
            ticker={selectedTicker}
            price={currentPrice}
            leverage={leverage}
            onLeverageChange={setLeverage}
          />

          <div className="border-t border-border">
            <DefiMetricsPanel ticker={selectedTicker} barTimestamp={barTimestamp} />
          </div>
        </div>
      </div>
    </div>
  );
}
