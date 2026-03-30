"use client";

import { useState, useCallback, useMemo } from "react";
import { Play, TrendingUp, TrendingDown, Activity, BarChart3, Clock, Target, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { BACKTEST_STRATEGIES, type StrategyId } from "@/services/backtest/strategies";
import { runSimpleBacktest, type SimpleBacktestResult, type SimpleBacktestTrade } from "@/services/backtest/simple-engine";

// ── Constants ───────────────────────────────────────────────────────────────

const TICKERS = ["AAPL", "TSLA", "NVDA", "MSFT", "SPY"];

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmtPct(n: number, decimals = 2): string {
  const prefix = n >= 0 ? "+" : "";
  return `${prefix}${n.toFixed(decimals)}%`;
}

function fmtNum(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

// ── SVG Equity Curve ─────────────────────────────────────────────────────────

function EquityCurveSVG({ equityCurve }: { equityCurve: SimpleBacktestResult["equityCurve"] }) {
  const W = 600;
  const H = 200;
  const PAD_LEFT = 52;
  const PAD_RIGHT = 12;
  const PAD_TOP = 12;
  const PAD_BOTTOM = 20;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  if (equityCurve.length < 2) {
    return (
      <div className="flex items-center justify-center gap-2 p-6 text-xs text-muted-foreground">
        <Activity className="h-4 w-4 opacity-40" />
        Run a backtest to see the equity curve
      </div>
    );
  }

  const equities = equityCurve.map((p) => p.equity);
  const minE = Math.min(...equities);
  const maxE = Math.max(...equities);
  const rangeE = maxE - minE || 1;
  const startEquity = equityCurve[0].equity;
  const endEquity = equityCurve[equityCurve.length - 1].equity;
  const isProfit = endEquity >= startEquity;

  const toX = (i: number) => PAD_LEFT + (i / (equityCurve.length - 1)) * chartW;
  const toY = (v: number) => PAD_TOP + (1 - (v - minE) / rangeE) * chartH;

  const points = equityCurve.map((p, i) => `${toX(i).toFixed(1)},${toY(p.equity).toFixed(1)}`).join(" ");

  // Fill polygon: close the path along the bottom
  const firstX = toX(0).toFixed(1);
  const lastX = toX(equityCurve.length - 1).toFixed(1);
  const baseY = (PAD_TOP + chartH).toFixed(1);
  const fillPoints = `${firstX},${baseY} ${points} ${lastX},${baseY}`;

  // Y-axis labels
  const yLabels = [minE, (minE + maxE) / 2, maxE];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = PAD_TOP + pct * chartH;
        return (
          <line
            key={pct}
            x1={PAD_LEFT}
            x2={W - PAD_RIGHT}
            y1={y}
            y2={y}
            stroke="currentColor"
            className="text-border/20"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Fill area */}
      <polygon
        points={fillPoints}
        fill={isProfit ? "hsl(142 70% 45% / 0.12)" : "hsl(0 70% 50% / 0.10)"}
      />

      {/* Equity line */}
      <polyline
        points={points}
        fill="none"
        stroke={isProfit ? "hsl(142 70% 45%)" : "hsl(0 70% 55%)"}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Y-axis labels */}
      {yLabels.map((v, i) => (
        <text
          key={i}
          x={PAD_LEFT - 4}
          y={toY(v) + 3}
          textAnchor="end"
          fontSize={8}
          className="fill-muted-foreground"
        >
          {v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`}
        </text>
      ))}

      {/* X-axis: start / mid / end labels */}
      {[0, Math.floor((equityCurve.length - 1) / 2), equityCurve.length - 1].map((idx) => (
        <text
          key={idx}
          x={toX(idx)}
          y={H - 4}
          textAnchor="middle"
          fontSize={8}
          className="fill-muted-foreground"
        >
          Bar {equityCurve[idx].bar}
        </text>
      ))}
    </svg>
  );
}

// ── Metric Card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  positive?: boolean;
  negative?: boolean;
  neutral?: boolean;
}

function MetricCard({ label, value, icon, positive, negative, neutral }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border/40 bg-card p-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span className="h-3.5 w-3.5 shrink-0">{icon}</span>
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <div
        className={cn(
          "font-mono tabular-nums text-base font-semibold",
          positive && "text-green-500",
          negative && "text-red-500",
          neutral && "text-foreground",
          !positive && !negative && !neutral && "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

// ── Trade Row ────────────────────────────────────────────────────────────────

function TradeRow({ trade, index }: { trade: SimpleBacktestTrade; index: number }) {
  const win = trade.pnlPct > 0;
  return (
    <tr className="border-b border-border/20 hover:bg-accent/20 transition-colors">
      <td className="px-2 py-1 text-[11px] text-muted-foreground tabular-nums">#{index + 1}</td>
      <td className="px-2 py-1 text-[11px] tabular-nums">{trade.entryBar}</td>
      <td className="px-2 py-1 text-[11px] tabular-nums">{trade.exitBar}</td>
      <td className="px-2 py-1 text-[11px] tabular-nums">${trade.entryPrice.toFixed(2)}</td>
      <td className="px-2 py-1 text-[11px] tabular-nums">${trade.exitPrice.toFixed(2)}</td>
      <td className={cn("px-2 py-1 text-[11px] tabular-nums font-medium", win ? "text-green-500" : "text-red-500")}>
        {fmtPct(trade.pnlPct)}
      </td>
      <td className="px-2 py-1 text-[11px] text-muted-foreground">{trade.exitBar - trade.entryBar}d</td>
    </tr>
  );
}

// ── Param Input ──────────────────────────────────────────────────────────────

interface ParamInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

function ParamInput({ label, value, onChange, min = 1, max = 200, step = 1 }: ParamInputProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-muted-foreground">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded border border-border/50 bg-background px-2 py-1 text-xs font-mono tabular-nums text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
      />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function BacktestPanel() {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyId>("sma_crossover");
  const [selectedTicker, setSelectedTicker] = useState<string>("AAPL");
  const [params, setParams] = useState<Record<string, number>>(
    BACKTEST_STRATEGIES[0].defaultParams,
  );
  const [result, setResult] = useState<SimpleBacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const strategy = useMemo(
    () => BACKTEST_STRATEGIES.find((s) => s.id === selectedStrategy)!,
    [selectedStrategy],
  );

  const handleStrategyChange = useCallback(
    (id: StrategyId) => {
      const s = BACKTEST_STRATEGIES.find((s) => s.id === id)!;
      setSelectedStrategy(id);
      setParams({ ...s.defaultParams });
      setResult(null);
    },
    [],
  );

  const handleParamChange = useCallback((key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setResult(null);
    // Simulate async delay for UX feedback
    setTimeout(() => {
      const r = runSimpleBacktest(selectedStrategy, selectedTicker, params, 252);
      setResult(r);
      setIsRunning(false);
    }, 500);
  }, [selectedStrategy, selectedTicker, params]);

  // Derived display values — memoized to avoid re-computation on unrelated state changes
  const { winRatePct, totalReturnStr, maxDDStr, sharpeStr, avgHoldStr, recentTrades } =
    useMemo(() => {
      if (!result) {
        return {
          winRatePct: "—",
          totalReturnStr: "—",
          maxDDStr: "—",
          sharpeStr: "—",
          avgHoldStr: "—",
          recentTrades: [] as SimpleBacktestTrade[],
        };
      }
      return {
        winRatePct: (result.winRate * 100).toFixed(1),
        totalReturnStr: fmtPct(result.totalReturn),
        maxDDStr: `-${result.maxDrawdown.toFixed(1)}%`,
        sharpeStr: fmtNum(result.sharpeRatio),
        avgHoldStr: `${result.avgHoldDays}d`,
        recentTrades: result.trades.slice(-10).reverse(),
      };
    }, [result]);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Strategy Backtester</span>
        <span className="ml-auto text-[10px] text-muted-foreground">Synthetic 252-bar simulation</span>
      </div>

      {/* Config card */}
      <div className="rounded-lg border border-border/40 bg-card divide-y divide-border/30">
        {/* Strategy tabs */}
        <div className="p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Strategy</div>
          <div className="flex flex-wrap gap-1.5">
            {BACKTEST_STRATEGIES.map((s) => (
              <button
                key={s.id}
                onClick={() => handleStrategyChange(s.id)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs transition-colors border",
                  selectedStrategy === s.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border/40 hover:border-border hover:text-foreground",
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">{strategy.description}</p>
          <div className="flex gap-3 mt-1 text-[10px]">
            <span className="text-muted-foreground">
              Entry: <span className="text-foreground">{strategy.entryCondition}</span>
            </span>
            <span className="text-muted-foreground">
              Exit: <span className="text-foreground">{strategy.exitCondition}</span>
            </span>
          </div>
        </div>

        {/* Ticker + params */}
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3 items-end">
            {/* Ticker dropdown */}
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] text-muted-foreground">Ticker</label>
              <select
                value={selectedTicker}
                onChange={(e) => { setSelectedTicker(e.target.value); setResult(null); }}
                className="w-full rounded border border-border/50 bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                {TICKERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                isRunning
                  ? "bg-primary/50 text-primary-foreground/70 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              <Play className={cn("h-3 w-3", isRunning && "animate-pulse")} />
              {isRunning ? "Running…" : "Run Backtest"}
            </button>
          </div>

          {/* Strategy params */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(strategy.paramLabels).map(([key, label]) => (
              <ParamInput
                key={key}
                label={label}
                value={params[key] ?? strategy.defaultParams[key]}
                onChange={(v) => handleParamChange(key, v)}
                min={1}
                max={key.toLowerCase().includes("std") ? 5 : 200}
                step={key.toLowerCase().includes("std") ? 0.5 : 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-4">
          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <MetricCard
              label="Win Rate"
              value={`${winRatePct}%`}
              icon={<Target className="h-3.5 w-3.5" />}
              positive={result.winRate >= 0.5}
              negative={result.winRate < 0.4}
              neutral={result.winRate >= 0.4 && result.winRate < 0.5}
            />
            <MetricCard
              label="Total Return"
              value={totalReturnStr}
              icon={result.totalReturn >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              positive={result.totalReturn > 0}
              negative={result.totalReturn < 0}
            />
            <MetricCard
              label="Max Drawdown"
              value={maxDDStr}
              icon={<ShieldAlert className="h-3.5 w-3.5" />}
              negative={result.maxDrawdown > 20}
              neutral={result.maxDrawdown <= 20}
            />
            <MetricCard
              label="Sharpe Ratio"
              value={sharpeStr}
              icon={<Activity className="h-3.5 w-3.5" />}
              positive={result.sharpeRatio >= 1}
              negative={result.sharpeRatio < 0}
              neutral={result.sharpeRatio >= 0 && result.sharpeRatio < 1}
            />
            <MetricCard
              label="Avg Hold"
              value={avgHoldStr}
              icon={<Clock className="h-3.5 w-3.5" />}
              neutral
            />
          </div>

          {/* Equity curve */}
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
              Equity Curve — {result.totalTrades} trades · {result.ticker}
            </div>
            <EquityCurveSVG equityCurve={result.equityCurve} />
          </div>

          {/* Trade list */}
          {recentTrades.length > 0 && (
            <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
              <div className="px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground border-b border-border/30">
                Last {recentTrades.length} Trades
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30">
                      {["#", "Entry Bar", "Exit Bar", "Entry $", "Exit $", "P&L %", "Hold"].map((h) => (
                        <th
                          key={h}
                          className="px-2 py-1.5 text-left text-[10px] text-muted-foreground font-normal"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrades.map((t, i) => (
                      <TradeRow key={i} trade={t} index={result.trades.length - recentTrades.length + i} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.totalTrades === 0 && (
            <div className="rounded-lg border border-border/40 bg-card p-4 text-center text-xs text-muted-foreground">
              No trades were generated. Try adjusting the parameters or choosing a different strategy.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BacktestPanel;
