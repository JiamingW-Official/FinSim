"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTradingStore } from "@/stores/trading-store";
import { useGameStore } from "@/stores/game-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { WATCHLIST_STOCKS } from "@/types/market";
import { AllocationChart } from "@/components/portfolio/AllocationChart";
import { QuantDashboard } from "@/components/portfolio/QuantDashboard";
import { CorrelationHeatmap } from "@/components/portfolio/CorrelationHeatmap";
import { ExportMenu } from "@/components/portfolio/ExportMenu";
import { TradeJournal } from "@/components/portfolio/TradeJournal";
import { WinRateChart } from "@/components/portfolio/WinRateChart";
import { EquityCurve } from "@/components/portfolio/EquityCurve";
import { PairsTradingPanel } from "@/components/quant/PairsTradingPanel";
import { RebalancingPanel } from "@/components/quant/RebalancingPanel";
import { EfficientFrontier } from "@/components/portfolio/EfficientFrontier";
import { calculateCorrelationMatrix } from "@/services/quant/correlation";
import { computeEfficientFrontier } from "@/services/portfolio/optimizer";
import { formatCurrency, formatShortDate, cn } from "@/lib/utils";
import {
  Briefcase, TrendingUp, TrendingDown, Wallet, BarChart3,
  PieChart, Activity, ArrowUpDown, ChevronUp, ChevronDown,
  Clock, DollarSign, Target, Shield,
} from "lucide-react";

// ─── Dynamic imports ──────────────────────────────────────────────────────────

const EfficientFrontierChart = dynamic(
  () => import("@/components/quant/EfficientFrontierChart"),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading chart…</div> },
);

const PositionSizingPanel = dynamic(
  () => import("@/components/quant/PositionSizingPanel"),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading…</div> },
);

// ─── Tab definition ───────────────────────────────────────────────────────────

type PortfolioTab = "positions" | "history" | "analytics" | "optimization";

const TABS: { value: PortfolioTab; label: string }[] = [
  { value: "positions", label: "Positions" },
  { value: "history", label: "History" },
  { value: "analytics", label: "Analytics" },
  { value: "optimization", label: "Optimization" },
];

// ─── PRNG for synthetic data ──────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generatePrices(ticker: string, bars = 252): number[] {
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed = (seed * 31 + ticker.charCodeAt(i)) | 0;
  }
  const prices: number[] = [];
  let price = 80 + (Math.abs(seed) % 200);
  for (let i = 0; i < bars; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const change = (seed / 0x7fffffff - 0.5) * 3;
    price = Math.max(10, price + change);
    prices.push(Math.round(price * 100) / 100);
  }
  return prices;
}

// ─── Header stat chip ─────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  subvalue,
  color,
  icon,
}: {
  label: string;
  value: string;
  subvalue?: string;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={cn("font-mono text-sm font-semibold tabular-nums", color ?? "text-foreground")}>
        {value}
      </p>
      {subvalue && (
        <p className={cn("font-mono text-[10px] tabular-nums", color ? color : "text-muted-foreground")}>
          {subvalue}
        </p>
      )}
    </div>
  );
}

// ─── Performance summary cards ────────────────────────────────────────────────

interface PerfCardProps {
  label: string;
  value: string;
  subvalue?: string;
  interpretation: string;
  color?: string;
}

function PerfCard({ label, value, subvalue, interpretation, color }: PerfCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1.5 font-mono text-xl font-bold tabular-nums", color ?? "text-foreground")}>
        {value}
      </div>
      {subvalue && (
        <div className="font-mono text-[11px] text-muted-foreground tabular-nums">{subvalue}</div>
      )}
      <div className="mt-2 border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
        {interpretation}
      </div>
    </div>
  );
}

// ─── Active positions table ───────────────────────────────────────────────────

function ActivePositionsTable() {
  const positions = useTradingStore((s) => s.positions);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);

  const sorted = useMemo(
    () => [...positions].sort((a, b) => b.unrealizedPnL - a.unrealizedPnL),
    [positions],
  );

  const totals = useMemo(() => {
    return {
      posValue: positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0),
      pnl: positions.reduce((s, p) => s + p.unrealizedPnL, 0),
    };
  }, [positions]);

  const totalPnlPct =
    totals.posValue - totals.pnl > 0
      ? (totals.pnl / (totals.posValue - totals.pnl)) * 100
      : 0;

  if (sorted.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
        No open positions — go to Trade to open one
      </div>
    );
  }

  const headers = ["Ticker", "Type", "Entry", "Current", "Size", "P&L ($)", "P&L (%)", "Weight"];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-left">
            {headers.map((h) => (
              <th key={h} className="pb-2 pr-4 font-medium text-muted-foreground last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {sorted.map((pos) => {
            const isProfit = pos.unrealizedPnL >= 0;
            const posValue = pos.quantity * pos.currentPrice;
            const weight = portfolioValue > 0 ? (posValue / portfolioValue) * 100 : 0;
            return (
              <tr
                key={pos.ticker}
                className={cn(
                  "transition-colors",
                  isProfit
                    ? "bg-green-500/[0.04] hover:bg-green-500/[0.07]"
                    : "bg-red-500/[0.04] hover:bg-red-500/[0.07]",
                )}
              >
                <td className="py-2 pr-4 font-semibold tabular-nums">{pos.ticker}</td>
                <td className="py-2 pr-4">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                      pos.side === "long"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-400",
                    )}
                  >
                    {pos.side === "long" ? "Long" : "Short"}
                  </span>
                </td>
                <td className="py-2 pr-4 tabular-nums text-muted-foreground">
                  {formatCurrency(pos.avgPrice)}
                </td>
                <td className="py-2 pr-4 tabular-nums font-medium">
                  {formatCurrency(pos.currentPrice)}
                </td>
                <td className="py-2 pr-4 tabular-nums">{pos.quantity}</td>
                <td
                  className={cn(
                    "py-2 pr-4 tabular-nums font-semibold",
                    isProfit ? "text-green-500" : "text-red-400",
                  )}
                >
                  {pos.unrealizedPnL >= 0 ? "+" : ""}
                  {formatCurrency(pos.unrealizedPnL)}
                </td>
                <td
                  className={cn(
                    "py-2 pr-4 tabular-nums",
                    isProfit ? "text-green-500" : "text-red-400",
                  )}
                >
                  {pos.unrealizedPnLPercent >= 0 ? "+" : ""}
                  {pos.unrealizedPnLPercent.toFixed(2)}%
                </td>
                <td className="py-2 tabular-nums text-muted-foreground">
                  {weight.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-muted/30">
            <td className="py-2 pr-4 font-semibold text-muted-foreground" colSpan={5}>
              Total
            </td>
            <td
              className={cn(
                "py-2 pr-4 font-semibold tabular-nums",
                totals.pnl >= 0 ? "text-green-500" : "text-red-400",
              )}
            >
              {totals.pnl >= 0 ? "+" : ""}
              {formatCurrency(totals.pnl)}
            </td>
            <td
              className={cn(
                "py-2 pr-4 tabular-nums font-semibold",
                totalPnlPct >= 0 ? "text-green-500" : "text-red-400",
              )}
            >
              {totalPnlPct >= 0 ? "+" : ""}
              {totalPnlPct.toFixed(2)}%
            </td>
            <td className="py-2 tabular-nums text-muted-foreground">100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Trade history table ──────────────────────────────────────────────────────

type HistorySortField = "date" | "ticker" | "pnl" | "pct";
type HistorySortDir = "asc" | "desc";

function TradeHistoryTable() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const [sortField, setSortField] = useState<HistorySortField>("date");
  const [sortDir, setSortDir] = useState<HistorySortDir>("desc");
  const [filterTicker, setFilterTicker] = useState("");

  const closed = useMemo(
    () => tradeHistory.filter((t) => t.side === "sell"),
    [tradeHistory],
  );

  const processed = useMemo(() => {
    return closed
      .map((t) => {
        const approxEntry = t.price - t.realizedPnL / Math.max(t.quantity, 1);
        const entryValue = approxEntry * t.quantity;
        const pnlPct = entryValue > 0 ? (t.realizedPnL / entryValue) * 100 : 0;
        return { ...t, approxEntry, pnlPct };
      })
      .filter((t) =>
        filterTicker === "" ||
        t.ticker.toLowerCase().includes(filterTicker.toLowerCase()),
      )
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === "date") cmp = a.simulationDate - b.simulationDate;
        else if (sortField === "ticker") cmp = a.ticker.localeCompare(b.ticker);
        else if (sortField === "pnl") cmp = a.realizedPnL - b.realizedPnL;
        else if (sortField === "pct") cmp = a.pnlPct - b.pnlPct;
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [closed, sortField, sortDir, filterTicker]);

  function toggleSort(field: HistorySortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  }

  function SortIcon({ field }: { field: HistorySortField }) {
    if (sortField !== field) return null;
    return sortDir === "asc"
      ? <ChevronUp className="inline h-3 w-3" />
      : <ChevronDown className="inline h-3 w-3" />;
  }

  if (closed.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
        No closed trades yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={filterTicker}
          onChange={(e) => setFilterTicker(e.target.value)}
          placeholder="Filter by ticker…"
          className="h-7 rounded border border-border bg-background px-2 text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <span className="ml-auto text-[10px] text-muted-foreground">
          {processed.length} trade{processed.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left">
              <th
                className="cursor-pointer pb-2 pr-4 font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleSort("date")}
              >
                Date <SortIcon field="date" />
              </th>
              <th
                className="cursor-pointer pb-2 pr-4 font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleSort("ticker")}
              >
                Ticker <SortIcon field="ticker" />
              </th>
              <th className="pb-2 pr-4 font-medium text-muted-foreground">Type</th>
              <th className="pb-2 pr-4 font-medium text-muted-foreground">Entry</th>
              <th className="pb-2 pr-4 font-medium text-muted-foreground">Exit</th>
              <th className="pb-2 pr-4 font-medium text-muted-foreground">Qty</th>
              <th
                className="cursor-pointer pb-2 pr-4 font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleSort("pnl")}
              >
                P&L ($) <SortIcon field="pnl" />
              </th>
              <th
                className="cursor-pointer pb-2 font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleSort("pct")}
              >
                P&L (%) <SortIcon field="pct" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {processed.map((t) => {
              const isProfit = t.realizedPnL >= 0;
              return (
                <tr
                  key={t.id}
                  className={cn(
                    "transition-colors hover:bg-muted/20",
                    isProfit
                      ? "bg-green-500/[0.02]"
                      : "bg-red-500/[0.02]",
                  )}
                >
                  <td className="py-2 pr-4 text-muted-foreground">
                    {formatShortDate(t.simulationDate)}
                  </td>
                  <td className="py-2 pr-4 font-semibold">{t.ticker}</td>
                  <td className="py-2 pr-4">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      CLOSE
                    </span>
                  </td>
                  <td className="py-2 pr-4 tabular-nums text-muted-foreground">
                    {formatCurrency(t.approxEntry)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">{formatCurrency(t.price)}</td>
                  <td className="py-2 pr-4 tabular-nums">{t.quantity}</td>
                  <td
                    className={cn(
                      "py-2 pr-4 tabular-nums font-semibold",
                      isProfit ? "text-green-500" : "text-red-400",
                    )}
                  >
                    {t.realizedPnL >= 0 ? "+" : ""}
                    {formatCurrency(t.realizedPnL)}
                  </td>
                  <td
                    className={cn(
                      "py-2 tabular-nums",
                      isProfit ? "text-green-500" : "text-red-400",
                    )}
                  >
                    {t.pnlPct >= 0 ? "+" : ""}
                    {t.pnlPct.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Allocation sidebar (donut + concentration warning) ──────────────────────

function AllocationSidebar() {
  const cash = useTradingStore((s) => s.cash);
  const positions = useTradingStore((s) => s.positions);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);

  const equitiesValue = useMemo(
    () => positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0),
    [positions],
  );

  // Find largest position by weight
  const topConcentration = useMemo(() => {
    if (positions.length === 0 || portfolioValue === 0) return null;
    let top = positions[0];
    for (const p of positions) {
      if (p.quantity * p.currentPrice > top.quantity * top.currentPrice) top = p;
    }
    const pct = ((top.quantity * top.currentPrice) / portfolioValue) * 100;
    return { ticker: top.ticker, pct };
  }, [positions, portfolioValue]);

  return (
    <div className="space-y-3">
      <AllocationChart
        cash={cash}
        equities={equitiesValue}
        options={0}
        tokenized={0}
      />
      {topConcentration && topConcentration.pct > 25 && (
        <div className="rounded border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-500">
          Top concentration: {topConcentration.ticker} {topConcentration.pct.toFixed(0)}%
          {topConcentration.pct > 40 && " — consider diversifying"}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<PortfolioTab>("positions");

  // Store slices
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const cash = useTradingStore((s) => s.cash);
  const positions = useTradingStore((s) => s.positions);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const equityHistory = useTradingStore((s) => s.equityHistory);

  // ── Derived header stats ──────────────────────────────────────────────────

  const invested = useMemo(
    () => positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0),
    [positions],
  );

  const totalReturn = portfolioValue - INITIAL_CAPITAL;
  const totalReturnPct = (totalReturn / INITIAL_CAPITAL) * 100;

  const dayPnL = useMemo(() => {
    if (equityHistory.length < 2) return { dollar: 0, pct: 0 };
    const prev = equityHistory[equityHistory.length - 2].portfolioValue;
    const curr = equityHistory[equityHistory.length - 1].portfolioValue;
    const dollar = curr - prev;
    return { dollar, pct: prev > 0 ? (dollar / prev) * 100 : 0 };
  }, [equityHistory]);

  const { winRate, totalTrades } = useMemo(() => {
    const sells = tradeHistory.filter((t) => t.side === "sell");
    const wins = sells.filter((t) => t.realizedPnL > 0);
    return {
      winRate: sells.length > 0 ? (wins.length / sells.length) * 100 : 0,
      totalTrades: sells.length,
    };
  }, [tradeHistory]);

  // ── Performance card metrics ──────────────────────────────────────────────

  const perfMetrics = useMemo(() => {
    const sells = tradeHistory.filter((t) => t.side === "sell");
    const wins = sells.filter((t) => t.realizedPnL > 0);
    const losses = sells.filter((t) => t.realizedPnL < 0);

    const totalWins = wins.reduce((s, t) => s + t.realizedPnL, 0);
    const totalLosses = Math.abs(losses.reduce((s, t) => s + t.realizedPnL, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

    // Max drawdown
    let maxDrawdown = 0;
    let maxDrawdownPeak = 0;
    let maxDrawdownTrough = 0;
    let peak = INITIAL_CAPITAL;
    let peakTime = 0;
    for (const snap of equityHistory) {
      if (snap.portfolioValue > peak) { peak = snap.portfolioValue; peakTime = snap.timestamp; }
      const dd = ((peak - snap.portfolioValue) / peak) * 100;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
        maxDrawdownPeak = peak;
        maxDrawdownTrough = snap.portfolioValue;
      }
    }
    void maxDrawdownPeak; void maxDrawdownTrough; void peakTime;

    // Sharpe
    const dailyReturns: number[] = [];
    for (let i = 1; i < equityHistory.length; i++) {
      const prev = equityHistory[i - 1].portfolioValue;
      if (prev > 0) dailyReturns.push((equityHistory[i].portfolioValue - prev) / prev);
    }
    let sharpe = 0;
    if (dailyReturns.length > 1) {
      const mean = dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length;
      const variance = dailyReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / (dailyReturns.length - 1);
      const std = Math.sqrt(variance);
      sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;
    }

    const winRatePct = sells.length > 0 ? (wins.length / sells.length) * 100 : 0;

    return { sharpe, maxDrawdown, profitFactor, winRatePct, totalTrades: sells.length, winCount: wins.length };
  }, [tradeHistory, equityHistory]);

  // Sharpe interpretation
  const sharpeLabel =
    perfMetrics.sharpe > 2
      ? "Excellent risk-adjusted return"
      : perfMetrics.sharpe > 1
      ? "Good — above market average"
      : perfMetrics.sharpe > 0
      ? "Marginal — room to improve"
      : "Negative — review your strategy";

  const pfLabel =
    perfMetrics.profitFactor === Infinity
      ? "No losing trades yet"
      : perfMetrics.profitFactor >= 2
      ? "Strong — gross wins 2x losses"
      : perfMetrics.profitFactor >= 1
      ? "Profitable — above breakeven"
      : "Below breakeven (< 1.0)";

  // ── Optimization data ─────────────────────────────────────────────────────

  const correlations = useMemo(() => {
    const priceHistories: Record<string, number[]> = {};
    for (const stock of WATCHLIST_STOCKS) {
      priceHistories[stock.ticker] = generatePrices(stock.ticker);
    }
    return calculateCorrelationMatrix(priceHistories);
  }, []);

  const optimizationData = useMemo(() => {
    const positionTickers = positions.map((p) => p.ticker);
    const watchlistTickers = WATCHLIST_STOCKS.slice(0, 8)
      .map((s) => s.ticker)
      .filter((t) => !positionTickers.includes(t));
    const allTickers = [...positionTickers, ...watchlistTickers].slice(0, 8);
    if (allTickers.length < 2) return null;

    const priceHistories: Record<string, number[]> = {};
    for (const t of allTickers) priceHistories[t] = generatePrices(t);

    const logReturns: number[][] = allTickers.map((t) => {
      const p = priceHistories[t];
      return p.slice(1).map((v, i) => Math.log(v / p[i]));
    });

    const n = allTickers.length;
    const len = Math.min(...logReturns.map((r) => r.length));
    const means = logReturns.map((r) => r.slice(0, len).reduce((s, v) => s + v, 0) / len);
    const annReturns = means.map((m) => m * 252);

    const cov: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < len; k++) {
          sum += (logReturns[i][k] - means[i]) * (logReturns[j][k] - means[j]);
        }
        cov[i][j] = (sum / (len - 1)) * 252;
      }
    }

    const posValues = allTickers.map((t) => {
      const pos = positions.find((p) => p.ticker === t);
      return pos ? pos.quantity * pos.currentPrice : 0;
    });
    const totalPosValue = posValues.reduce((s, v) => s + v, 0);
    const currentWeights = posValues.map((v) => (totalPosValue > 0 ? v / totalPosValue : 0));

    let portRet: number | null = null;
    let portVar: number | null = null;
    if (totalPosValue > 0) {
      portRet = currentWeights.reduce((s, w, i) => s + w * annReturns[i], 0);
      let v = 0;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) v += currentWeights[i] * currentWeights[j] * cov[i][j];
      portVar = v;
    }

    const frontierPoints = computeEfficientFrontier(allTickers, annReturns, cov);

    return {
      frontierPoints,
      currentPortfolio:
        totalPosValue > 0 && portRet !== null && portVar !== null
          ? { expectedReturn: portRet, risk: Math.sqrt(Math.max(0, portVar)), label: "Your Portfolio" }
          : undefined,
    };
  }, [positions]);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-4 p-4">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Portfolio</h1>
              <p className="text-[10px] text-muted-foreground">Performance overview</p>
            </div>
          </div>
          <ExportMenu />
        </div>

        {/* ── Portfolio header bar ── */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <StatChip
            label="Total Equity"
            value={formatCurrency(portfolioValue)}
            icon={<Wallet className="h-3 w-3" />}
          />
          <StatChip
            label="Cash"
            value={formatCurrency(cash)}
            icon={<DollarSign className="h-3 w-3" />}
          />
          <StatChip
            label="Invested"
            value={formatCurrency(invested)}
            icon={<Shield className="h-3 w-3" />}
          />
          <StatChip
            label="Day P&L"
            value={`${dayPnL.dollar >= 0 ? "+" : ""}${formatCurrency(dayPnL.dollar)}`}
            subvalue={`${dayPnL.pct >= 0 ? "+" : ""}${dayPnL.pct.toFixed(2)}%`}
            color={dayPnL.dollar >= 0 ? "text-green-500" : "text-red-400"}
            icon={
              dayPnL.dollar >= 0
                ? <TrendingUp className="h-3 w-3 text-green-500" />
                : <TrendingDown className="h-3 w-3 text-red-400" />
            }
          />
          <StatChip
            label="Total Return"
            value={`${totalReturn >= 0 ? "+" : ""}${formatCurrency(totalReturn)}`}
            subvalue={`${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(2)}%`}
            color={totalReturn >= 0 ? "text-green-500" : "text-red-400"}
            icon={
              totalReturn >= 0
                ? <TrendingUp className="h-3 w-3 text-green-500" />
                : <TrendingDown className="h-3 w-3 text-red-400" />
            }
          />
          <StatChip
            label="Win Rate"
            value={`${winRate.toFixed(1)}%`}
            subvalue={`${totalTrades} trade${totalTrades !== 1 ? "s" : ""}`}
            color={winRate >= 50 ? "text-green-500" : winRate > 0 ? "text-amber-500" : "text-muted-foreground"}
            icon={<Target className="h-3 w-3" />}
          />
        </div>

        {/* ── Performance summary cards (2x2) ── */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <PerfCard
            label="Sharpe Ratio"
            value={isFinite(perfMetrics.sharpe) && perfMetrics.sharpe !== 0 ? perfMetrics.sharpe.toFixed(2) : "—"}
            subvalue="annualised approx."
            color={
              perfMetrics.sharpe > 1
                ? "text-green-500"
                : perfMetrics.sharpe > 0
                ? "text-amber-500"
                : "text-muted-foreground"
            }
            interpretation={sharpeLabel}
          />
          <PerfCard
            label="Max Drawdown"
            value={perfMetrics.maxDrawdown > 0 ? `-${perfMetrics.maxDrawdown.toFixed(2)}%` : "—"}
            color={
              perfMetrics.maxDrawdown > 20
                ? "text-red-400"
                : perfMetrics.maxDrawdown > 10
                ? "text-amber-500"
                : perfMetrics.maxDrawdown > 0
                ? "text-green-500"
                : "text-muted-foreground"
            }
            interpretation={
              perfMetrics.maxDrawdown > 0
                ? perfMetrics.maxDrawdown > 20
                  ? "High drawdown — review position sizing"
                  : perfMetrics.maxDrawdown > 10
                  ? "Moderate — within normal range"
                  : "Low drawdown — disciplined risk management"
                : "No drawdown recorded yet"
            }
          />
          <PerfCard
            label="Win Rate"
            value={perfMetrics.totalTrades > 0 ? `${perfMetrics.winRatePct.toFixed(1)}%` : "—"}
            subvalue={`${perfMetrics.winCount}W / ${perfMetrics.totalTrades - perfMetrics.winCount}L out of ${perfMetrics.totalTrades}`}
            color={
              perfMetrics.winRatePct >= 60
                ? "text-green-500"
                : perfMetrics.winRatePct >= 50
                ? "text-amber-500"
                : perfMetrics.winRatePct > 0
                ? "text-red-400"
                : "text-muted-foreground"
            }
            interpretation={
              perfMetrics.totalTrades === 0
                ? "Close a trade to see your win rate"
                : perfMetrics.winRatePct >= 60
                ? "Strong — well above 50% threshold"
                : perfMetrics.winRatePct >= 50
                ? "Break-even territory — watch risk/reward"
                : "Below 50% — focus on trade selection"
            }
          />
          <PerfCard
            label="Profit Factor"
            value={
              perfMetrics.profitFactor === Infinity
                ? "N/A"
                : perfMetrics.profitFactor > 0
                ? perfMetrics.profitFactor.toFixed(2)
                : "—"
            }
            subvalue="breakeven at 1.0"
            color={
              perfMetrics.profitFactor > 2
                ? "text-green-500"
                : perfMetrics.profitFactor >= 1
                ? "text-amber-500"
                : perfMetrics.profitFactor > 0
                ? "text-red-400"
                : "text-muted-foreground"
            }
            interpretation={pfLabel}
          />
        </div>

        {/* ── Tab navigation ── */}
        <div className="flex items-center gap-0 overflow-x-auto border-b border-border scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-4 py-1.5 text-xs font-medium transition-colors",
                activeTab === tab.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Positions tab ── */}
        {activeTab === "positions" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Main positions table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Active Positions
                  <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
                    {positions.length} open
                  </span>
                </div>
                <ActivePositionsTable />
              </div>

              {/* Equity curve */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Equity Curve
                </div>
                <EquityCurve />
              </div>
            </div>

            {/* Allocation sidebar */}
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <PieChart className="h-3.5 w-3.5" />
                  Allocation
                </div>
                <AllocationSidebar />
              </div>
            </div>
          </div>
        )}

        {/* ── History tab ── */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Closed Trade Log
              </div>
              <TradeHistoryTable />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 text-xs font-medium text-muted-foreground">Win Rate Chart</div>
                <WinRateChart />
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 text-xs font-medium text-muted-foreground">Trade Journal</div>
                <TradeJournal />
              </div>
            </div>
          </div>
        )}

        {/* ── Analytics tab ── */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            <QuantDashboard />

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                Asset Correlation Matrix
              </div>
              <CorrelationHeatmap correlations={correlations} />
            </div>
          </div>
        )}

        {/* ── Optimization tab ── */}
        {activeTab === "optimization" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Mean-Variance Efficient Frontier
                <span className="ml-auto text-[10px] text-muted-foreground/60">risk-free rate 4.5%</span>
              </div>
              {optimizationData ? (
                <EfficientFrontier
                  points={optimizationData.frontierPoints}
                  currentPortfolio={optimizationData.currentPortfolio}
                />
              ) : (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  Requires at least 2 assets in universe
                </p>
              )}
            </div>

            {optimizationData && (() => {
              const pts = optimizationData.frontierPoints;
              const toChartPoint = (p: typeof pts[0]) => ({
                return: p.expectedReturn,
                risk: p.risk,
                weights: p.weights,
                sharpe: p.sharpe,
              });
              const minVarPt = pts.find((p) => p.isMinVariance) ?? pts[0];
              const maxSharpePt = pts.find((p) => p.isMaxSharpe) ?? pts[Math.floor(pts.length / 2)];
              const eqIdx = Math.floor(pts.length / 2);
              const efResult = {
                frontier: pts.map(toChartPoint),
                minVariance: toChartPoint(minVarPt),
                maxSharpe: toChartPoint(maxSharpePt),
                equalWeight: toChartPoint(pts[eqIdx]),
              };
              return (
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-3 text-xs font-medium text-muted-foreground">Efficient Frontier Chart</div>
                  <EfficientFrontierChart result={efResult} />
                </div>
              );
            })()}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 text-xs font-medium text-muted-foreground">Rebalancing Advisor</div>
                <RebalancingPanel />
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 text-xs font-medium text-muted-foreground">Position Sizing</div>
                <PositionSizingPanel defaultPortfolioValue={portfolioValue} />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 text-xs font-medium text-muted-foreground">Pairs Trading</div>
              <PairsTradingPanel />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
