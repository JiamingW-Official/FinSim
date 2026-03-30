"use client";

import { useState, useMemo, useCallback } from "react";
import {
  TrendingUp,
  Target,
  BarChart3,
  Coins,
  Info,
  ArrowUpDown,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  Briefcase,
  History,
  Trophy,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PREDICTION_MARKETS,
  CATEGORY_LABELS,
  type MarketCategory,
} from "@/data/prediction-markets";
import { usePredictionMarketStore } from "@/stores/prediction-market-store";
import { PredictionCard } from "@/components/predictions/PredictionCard";
import { AccuracyTracker } from "@/components/predictions/AccuracyTracker";
import { PredictionLeaderboard } from "@/components/predictions/PredictionLeaderboard";
import { LiveMarkets } from "@/components/predictions/LiveMarkets";
import { MarketMaker } from "@/components/predictions/MarketMaker";
import { HistoricalResolution } from "@/components/predictions/HistoricalResolution";
import { CreateMarket } from "@/components/predictions/CreateMarket";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

type PageView = "live" | "markets" | "maker" | "history" | "create" | "accuracy" | "leaderboard";

const PAGE_TABS: { value: PageView; label: string; icon: React.ReactNode }[] = [
  { value: "live", label: "Live Markets", icon: <Zap className="h-3 w-3" /> },
  { value: "markets", label: "Markets", icon: <TrendingUp className="h-3 w-3" /> },
  { value: "maker", label: "Market Maker", icon: <ArrowUpDown className="h-3 w-3" /> },
  { value: "history", label: "History", icon: <History className="h-3 w-3" /> },
  { value: "create", label: "Create", icon: <Flame className="h-3 w-3" /> },
  { value: "accuracy", label: "My Accuracy", icon: <Target className="h-3 w-3" /> },
  { value: "leaderboard", label: "Leaderboard", icon: <Trophy className="h-3 w-3" /> },
];

type FilterTab = "all" | MarketCategory;
type SortMode = "volume" | "closing" | "probability" | "change";

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "fed", label: "Fed" },
  { value: "inflation", label: "Inflation" },
  { value: "employment", label: "Jobs" },
  { value: "gdp", label: "GDP" },
  { value: "equities", label: "Equities" },
  { value: "crypto", label: "Crypto" },
  { value: "earnings", label: "Earnings" },
  { value: "geopolitics", label: "Geopolitics" },
  { value: "commodities", label: "Commodities" },
  { value: "housing", label: "Housing" },
  { value: "ai", label: "AI/Tech" },
];

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "volume", label: "Volume" },
  { value: "closing", label: "Closing Soon" },
  { value: "probability", label: "Probability" },
  { value: "change", label: "Biggest Move" },
];

function daysUntilDate(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

function priceChange(history: number[]): number {
  if (history.length < 2) return 0;
  return history[history.length - 1] - history[0];
}

export function PredictionsPageClient() {
  const [pageView, setPageView] = useState<PageView>("markets");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [sortMode, setSortMode] = useState<SortMode>("volume");
  const [showTradeHistory, setShowTradeHistory] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);

  const insightPoints = usePredictionMarketStore((s) => s.insightPoints);
  const bets = usePredictionMarketStore((s) => s.bets);
  const totalResolved = usePredictionMarketStore((s) => s.totalResolved);
  const storeRef = usePredictionMarketStore.getState;
  const accuracy = useMemo(() => storeRef().getAccuracy(), [storeRef, bets, totalResolved]);
  const brierScore = useMemo(() => storeRef().getBrierScore(), [storeRef, bets]);
  const portfolio = useMemo(() => storeRef().getPortfolioValue(), [storeRef, bets, insightPoints]);
  const calibrationData = useMemo(() => storeRef().getCalibrationData(), [storeRef, bets]);
  const tradeHistory = useMemo(() => storeRef().getTradeHistory(), [storeRef, bets]);

  const activeBets = useMemo(
    () => bets.filter((b) => !b.resolved),
    [bets],
  );

  const filteredMarkets = useMemo(() => {
    let markets =
      activeFilter === "all"
        ? [...PREDICTION_MARKETS]
        : PREDICTION_MARKETS.filter((m) => m.category === activeFilter);

    switch (sortMode) {
      case "volume":
        markets.sort((a, b) => b.volume - a.volume);
        break;
      case "closing":
        markets.sort(
          (a, b) => daysUntilDate(a.closesAt) - daysUntilDate(b.closesAt),
        );
        break;
      case "probability":
        markets.sort((a, b) => b.probability - a.probability);
        break;
      case "change":
        markets.sort(
          (a, b) =>
            Math.abs(priceChange(b.priceHistory)) -
            Math.abs(priceChange(a.priceHistory)),
        );
        break;
    }
    return markets;
  }, [activeFilter, sortMode]);

  // Market movers — top 5 by absolute price change
  const movers = useMemo(() => {
    return [...PREDICTION_MARKETS]
      .map((m) => ({ ...m, change: priceChange(m.priceHistory) }))
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 5);
  }, []);

  const handleNavigate = useCallback((marketId: string) => {
    const el = document.getElementById(`market-${marketId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/50 px-4 pt-4 pb-0">
        <div className="flex items-center gap-3 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <TrendingUp className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Prediction Markets</h1>
            <p className="text-xs text-muted-foreground">
              {PREDICTION_MARKETS.length} markets across{" "}
              {Object.keys(CATEGORY_LABELS).length} categories
            </p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-foreground">
              {insightPoints.toLocaleString()}
            </span>
          </div>
        </div>
        {/* Page-level tab switcher */}
        <div className="flex items-center gap-0.5 overflow-x-auto pb-px">
          {PAGE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setPageView(tab.value)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 rounded-t-md border-b-2 px-3 py-2 text-[11px] font-medium transition-colors",
                pageView === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Markets tab */}
      {pageView === "live" && (
        <div className="flex-1 overflow-hidden">
          <LiveMarkets />
        </div>
      )}

      {/* Markets view: portfolio summary + stats row */}
      {pageView === "markets" && (
        <>
          {/* Portfolio summary */}
          {activeBets.length > 0 && (
            <div className="border-b border-border/50 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Portfolio
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <PortfolioChip
                  label="Invested"
                  value={`${portfolio.totalInvested} pts`}
                />
                <PortfolioChip
                  label="Market Value"
                  value={`${portfolio.currentValue} pts`}
                />
                <PortfolioChip
                  label="Unrealized P&L"
                  value={`${portfolio.unrealizedPnl >= 0 ? "+" : ""}${portfolio.unrealizedPnl}`}
                  color={
                    portfolio.unrealizedPnl > 0
                      ? "text-green-400"
                      : portfolio.unrealizedPnl < 0
                        ? "text-red-400"
                        : undefined
                  }
                />
                <PortfolioChip
                  label="Realized P&L"
                  value={`${portfolio.realizedPnl >= 0 ? "+" : ""}${portfolio.realizedPnl}`}
                  color={
                    portfolio.realizedPnl > 0
                      ? "text-green-400"
                      : portfolio.realizedPnl < 0
                        ? "text-red-400"
                        : undefined
                  }
                />
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="border-b border-border/50 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <StatChip
                icon={<BarChart3 className="h-3 w-3" />}
                label="Bets"
                value={String(bets.length)}
              />
              <StatChip
                icon={<Target className="h-3 w-3" />}
                label="Accuracy"
                value={totalResolved > 0 ? `${accuracy}%` : "--"}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 rounded bg-muted/50 px-2 py-1 cursor-help">
                    <span className="text-[10px] text-muted-foreground">
                      Brier
                    </span>
                    <span className="font-mono tabular-nums text-xs font-semibold text-foreground">
                      {totalResolved > 0 ? brierScore.toFixed(3) : "--"}
                    </span>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-64 text-xs">
                  Brier Score measures calibration (0 = perfect, 1 = worst). Below
                  0.25 means well-calibrated.
                </TooltipContent>
              </Tooltip>

              <div className="flex-1" />

              {/* Toggle buttons */}
              <button
                onClick={() => setShowCalibration(!showCalibration)}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-colors",
                  showCalibration
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Target className="h-3 w-3" />
                Calibration
              </button>
              <button
                onClick={() => setShowTradeHistory(!showTradeHistory)}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-colors",
                  showTradeHistory
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <History className="h-3 w-3" />
                History
              </button>
              <span className="text-[10px] text-muted-foreground">
                {activeBets.length} active
              </span>
            </div>
          </div>
        </>
      )}

      {/* Markets content */}
      {pageView === "markets" && (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Calibration chart */}
          {showCalibration && (
            <div className="mb-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Calibration Chart
              </h2>
              <CalibrationChart data={calibrationData} />
            </div>
          )}

          {/* Trade history */}
          {showTradeHistory && (
            <div className="mb-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trade History
              </h2>
              <TradeHistoryTable trades={tradeHistory} />
            </div>
          )}

          {/* Market movers */}
          {activeFilter === "all" && (
            <div className="mb-6">
              <h2 className="mb-3 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                <Flame className="h-3.5 w-3.5 text-orange-400" />
                Market Movers
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {movers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleNavigate(m.id)}
                    className="shrink-0 rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:border-border/60 cursor-pointer"
                    style={{ minWidth: 180 }}
                  >
                    <div className="mb-1 text-[10px] text-muted-foreground truncate">
                      {m.question.slice(0, 40)}...
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono tabular-nums text-sm font-semibold text-foreground">
                        {m.probability}%
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          m.change > 0
                            ? "text-green-400"
                            : m.change < 0
                              ? "text-red-400"
                              : "text-muted-foreground",
                        )}
                      >
                        {m.change > 0 ? "+" : ""}
                        {m.change}pp
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active bets section */}
          {activeBets.length > 0 && activeFilter === "all" && (
            <div className="mb-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Active Positions
              </h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {activeBets.map((bet) => {
                  const market = PREDICTION_MARKETS.find(
                    (m) => m.id === bet.marketId,
                  );
                  if (!market) return null;
                  return (
                    <PredictionCard
                      key={market.id}
                      market={market}
                      onNavigate={handleNavigate}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter tabs + sort */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex flex-1 items-center gap-1 overflow-x-auto">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={cn(
                    "shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    activeFilter === tab.value
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "border-border/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="appearance-none rounded bg-muted px-2 py-1 text-[11px] font-medium text-foreground outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* All markets */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredMarkets.map((market) => (
              <div key={market.id} id={`market-${market.id}`}>
                <PredictionCard
                  market={market}
                  onNavigate={handleNavigate}
                />
              </div>
            ))}
          </div>
          {filteredMarkets.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center gap-1 text-sm text-muted-foreground">
              <span>No markets in this category</span>
              <span className="text-xs text-muted-foreground/60">Try selecting a different category above</span>
            </div>
          )}
        </div>
      )}

      {/* Market Maker tab */}
      {pageView === "maker" && (
        <div className="flex-1 overflow-y-auto p-4">
          <MarketMaker />
        </div>
      )}

      {/* Historical Resolution tab */}
      {pageView === "history" && (
        <div className="flex-1 overflow-y-auto p-4">
          <HistoricalResolution />
        </div>
      )}

      {/* Create Market tab */}
      {pageView === "create" && (
        <div className="flex-1 overflow-y-auto p-4">
          <CreateMarket />
        </div>
      )}

      {/* My Accuracy tab */}
      {pageView === "accuracy" && (
        <div className="flex-1 overflow-y-auto p-4">
          <AccuracyTracker />
        </div>
      )}

      {/* Leaderboard tab */}
      {pageView === "leaderboard" && (
        <div className="flex-1 overflow-y-auto p-4">
          <PredictionLeaderboard />
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded bg-muted/50 px-2 py-1">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}

function PortfolioChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div
        className={cn("font-mono tabular-nums text-sm font-semibold", color || "text-foreground")}
      >
        {value}
      </div>
    </div>
  );
}

// ── Calibration Chart (SVG) ─────────────────────────────────

function CalibrationChart({
  data,
}: {
  data: { bucket: string; predicted: number; actual: number; count: number }[];
}) {
  const w = 320;
  const h = 200;
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
        Place and resolve bets to see your calibration chart.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 hover:border-border/60 transition-colors">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxWidth: w }} aria-hidden="true" role="img">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <line
            key={`grid-${v}`}
            x1={pad.left}
            x2={pad.left + plotW}
            y1={pad.top + plotH * (1 - v)}
            y2={pad.top + plotH * (1 - v)}
            stroke="currentColor"
            strokeOpacity={0.1}
          />
        ))}

        {/* Perfect calibration line */}
        <line
          x1={pad.left}
          y1={pad.top + plotH}
          x2={pad.left + plotW}
          y2={pad.top}
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeDasharray="4 4"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = pad.left + d.predicted * plotW;
          const y = pad.top + (1 - d.actual) * plotH;
          const r = Math.min(8, 3 + d.count);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
              stroke="hsl(var(--primary))"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis labels */}
        <text
          x={pad.left + plotW / 2}
          y={h - 4}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          Predicted Probability
        </text>
        <text
          x={12}
          y={pad.top + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90, 12, ${pad.top + plotH / 2})`}
          className="fill-muted-foreground text-[10px]"
        >
          Actual Frequency
        </text>

        {/* Tick labels */}
        {[0, 0.5, 1].map((v) => (
          <text
            key={`x-${v}`}
            x={pad.left + v * plotW}
            y={pad.top + plotH + 14}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {Math.round(v * 100)}%
          </text>
        ))}
        {[0, 0.5, 1].map((v) => (
          <text
            key={`y-${v}`}
            x={pad.left - 6}
            y={pad.top + plotH * (1 - v) + 3}
            textAnchor="end"
            className="fill-muted-foreground text-[9px]"
          >
            {Math.round(v * 100)}%
          </text>
        ))}
      </svg>
      <p className="mt-1 text-center text-[10px] text-muted-foreground">
        Dots on the dashed line = perfectly calibrated. Above = overconfident.
        Below = underconfident.
      </p>
    </div>
  );
}

// ── Trade History Table ─────────────────────────────────────

function TradeHistoryTable({
  trades,
}: {
  trades: {
    id: string;
    marketId: string;
    side: "yes" | "no";
    amount: number;
    price: number;
    timestamp: number;
    type: "buy" | "resolve";
    pnl?: number;
  }[];
}) {
  if (trades.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-card text-muted-foreground">
        <span className="text-sm">No trades yet</span>
        <span className="text-xs opacity-60">Buy shares in a prediction market above to get started</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card hover:border-border/60 transition-colors">
      <table className="w-full text-[11px] min-w-[500px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
              Time
            </th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
              Market
            </th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
              Type
            </th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
              Side
            </th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">
              Amount
            </th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">
              Price
            </th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">
              P&L
            </th>
          </tr>
        </thead>
        <tbody>
          {trades.slice(0, 20).map((trade) => {
            const market = PREDICTION_MARKETS.find(
              (m) => m.id === trade.marketId,
            );
            return (
              <tr
                key={trade.id}
                className="border-b border-border/50 last:border-0"
              >
                <td className="px-3 py-1.5 text-muted-foreground">
                  {new Date(trade.timestamp).toLocaleDateString()}
                </td>
                <td className="max-w-[160px] truncate px-3 py-1.5 text-foreground">
                  {market?.question.slice(0, 35) ?? trade.marketId}
                </td>
                <td className="px-3 py-1.5">
                  <span
                    className={cn(
                      "rounded px-1 py-0.5 text-[9px] font-semibold uppercase",
                      trade.type === "buy"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-foreground/60",
                    )}
                  >
                    {trade.type}
                  </span>
                </td>
                <td className="px-3 py-1.5">
                  <span
                    className={cn(
                      "rounded px-1 py-0.5 text-[9px] font-semibold uppercase",
                      trade.side === "yes"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400",
                    )}
                  >
                    {trade.side}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-right font-medium text-foreground">
                  {trade.amount}
                </td>
                <td className="px-3 py-1.5 text-right text-muted-foreground">
                  {Math.round(trade.price * 100)}c
                </td>
                <td className="px-3 py-1.5 text-right">
                  {trade.pnl !== undefined ? (
                    <span
                      className={cn(
                        "font-medium",
                        trade.pnl >= 0
                          ? "text-green-400"
                          : "text-red-400",
                      )}
                    >
                      {trade.pnl >= 0 ? "+" : ""}
                      {trade.pnl}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
