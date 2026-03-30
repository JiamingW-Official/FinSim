"use client";

import { useState, useMemo, useCallback } from "react";
import {
  FlaskConical,
  Play,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  ShieldAlert,
  Clock,
  Activity,
  Shuffle,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Layers,
  GitBranch,
  Network,
  Calendar,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import EventBacktestPanel from "@/components/backtest/EventBacktestPanel";
import StressTestSummary from "@/components/backtest/StressTestSummary";
import { cn } from "@/lib/utils";
import {
  type BacktestConfig,
  type BacktestResult,
  type BacktestTrade,
  type WalkForwardResult,
  type MonteCarloBacktestResult,
  STRATEGIES,
  runProfessionalBacktest,
  runWalkForwardAnalysis,
  runMonteCarloBacktest,
  generateSyntheticBars,
} from "@/services/quant/backtester";
import {
  runPortfolioBacktest,
  computeStrategyCorrelationMatrix,
  type PortfolioBacktestResult,
  type StrategyCorrelationMatrix,
} from "@/services/backtest/portfolio";
import {
  runWalkForwardOptimization,
  type WalkForwardReport,
} from "@/services/backtest/walk-forward";
import {
  runMonteCarlo,
  type MonteCarloReport,
} from "@/services/backtest/monte-carlo";
import { BACKTEST_STRATEGIES, type StrategyId } from "@/services/backtest/strategies";
import { runSimpleBacktest } from "@/services/backtest/simple-engine";

// ── Ticker options ──────────────────────────────────────────────────────

const TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "SPY", "QQQ", "JPM"];

const POSITION_SIZING_OPTIONS = [
  { value: "fixed" as const, label: "Fixed Size" },
  { value: "percent" as const, label: "% of Equity" },
  { value: "kelly" as const, label: "Kelly Criterion" },
  { value: "volatility-adjusted" as const, label: "Vol-Adjusted" },
];

// ── Helpers ─────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

function fmtPct(n: number): string {
  const prefix = n >= 0 ? "+" : "";
  return `${prefix}${n.toFixed(2)}%`;
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

// ── SVG Equity Curve ─────────────────────────────────────────────────────

function EquityCurveSVG({ equityCurve }: { equityCurve: BacktestResult["equityCurve"] }) {
  const W = 600, H = 200, PAD = 30;

  if (equityCurve.length < 2) return <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground"><Activity className="h-4 w-4 opacity-40" /> Run a backtest to see the equity curve</div>;

  const equities = equityCurve.map((p) => p.equity);
  const drawdowns = equityCurve.map((p) => p.drawdown);
  const minE = Math.min(...equities);
  const maxE = Math.max(...equities);
  const rangeE = maxE - minE || 1;
  const maxDD = Math.max(...drawdowns, 1);

  const eqPoints = equityCurve.map((p, i) => {
    const x = PAD + (i / (equityCurve.length - 1)) * (W - PAD * 2);
    const y = PAD + (1 - (p.equity - minE) / rangeE) * (H * 0.6 - PAD);
    return `${x},${y}`;
  }).join(" ");

  const ddH = H * 0.35;
  const ddY0 = H * 0.65;
  const ddPoints = equityCurve.map((p, i) => {
    const x = PAD + (i / (equityCurve.length - 1)) * (W - PAD * 2);
    const y = ddY0 + (p.drawdown / maxDD) * (ddH - 10);
    return `${x},${y}`;
  }).join(" ");

  const ddFill = `${PAD},${ddY0} ${ddPoints} ${PAD + ((equityCurve.length - 1) / (equityCurve.length - 1)) * (W - PAD * 2)},${ddY0}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
        <line key={pct} x1={PAD} x2={W - PAD} y1={PAD + pct * (H * 0.6 - PAD)} y2={PAD + pct * (H * 0.6 - PAD)} stroke="currentColor" className="text-border/30" strokeWidth={0.5} />
      ))}
      {/* Equity curve */}
      <polyline points={eqPoints} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} />
      {/* Labels */}
      <text x={2} y={PAD + 4} className="text-[8px] fill-muted-foreground">{fmtCurrency(maxE)}</text>
      <text x={2} y={H * 0.6 - 2} className="text-[8px] fill-muted-foreground">{fmtCurrency(minE)}</text>
      {/* Drawdown area */}
      <polygon points={ddFill} fill="hsl(0 70% 50% / 0.15)" />
      <polyline points={ddPoints} fill="none" stroke="hsl(0 70% 50% / 0.6)" strokeWidth={1} />
      <text x={2} y={ddY0 + 10} className="text-[8px] fill-muted-foreground">DD</text>
      <text x={2} y={ddY0 + ddH - 4} className="text-[8px] fill-muted-foreground">-{fmt(maxDD, 1)}%</text>
    </svg>
  );
}

// ── Monthly Returns Heatmap ──────────────────────────────────────────────

function MonthlyHeatmap({ monthlyReturns }: { monthlyReturns: BacktestResult["monthlyReturns"] }) {
  if (monthlyReturns.length === 0) return <div className="flex items-center justify-center gap-2 p-2 text-xs text-muted-foreground"><BarChart3 className="h-4 w-4 opacity-40" /> No monthly returns to display yet</div>;

  // Group by year
  const years = new Map<string, Map<number, number>>();
  for (const mr of monthlyReturns) {
    const [yr, mo] = mr.month.split("-");
    if (!years.has(yr)) years.set(yr, new Map());
    years.get(yr)!.set(parseInt(mo), mr.return);
  }

  const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const allRets = monthlyReturns.map((m) => m.return);
  const absMax = Math.max(Math.abs(Math.min(...allRets, 0)), Math.abs(Math.max(...allRets, 0)), 1);

  function cellColor(ret: number): string {
    const intensity = Math.min(1, Math.abs(ret) / absMax);
    if (ret > 0) return `rgba(34,197,94,${0.15 + intensity * 0.55})`;
    if (ret < 0) return `rgba(239,68,68,${0.15 + intensity * 0.55})`;
    return "transparent";
  }

  return (
    <div className="overflow-x-auto">
      <table className="font-mono tabular-nums text-[9px] w-full">
        <thead>
          <tr>
            <th className="p-1 text-left text-muted-foreground font-normal">Year</th>
            {monthLabels.map((m, i) => (
              <th key={i} className="p-1 text-center text-muted-foreground font-normal w-8">{m}</th>
            ))}
            <th className="p-1 text-center text-muted-foreground font-normal">Total</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(years.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([year, months]) => {
            const yearTotal = Array.from(months.values()).reduce((a, b) => a + b, 0);
            return (
              <tr key={year}>
                <td className="p-1 text-muted-foreground">{year}</td>
                {Array.from({ length: 12 }, (_, i) => {
                  const ret = months.get(i + 1);
                  return (
                    <td key={i} className="p-1 text-center" style={{ backgroundColor: ret !== undefined ? cellColor(ret) : "transparent" }}>
                      {ret !== undefined ? fmt(ret, 1) : ""}
                    </td>
                  );
                })}
                <td className="p-1 text-center font-medium" style={{ backgroundColor: cellColor(yearTotal) }}>
                  {fmt(yearTotal, 1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Trade Table ──────────────────────────────────────────────────────────

type SortKey = "entryDate" | "pnl" | "rMultiple" | "holdingPeriod" | "pnlPercent";

function TradeTable({ trades }: { trades: BacktestTrade[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("entryDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(() => {
    const s = [...trades].sort((a, b) => {
      const diff = sortAsc ? a[sortKey] as number - (b[sortKey] as number) : (b[sortKey] as number) - (a[sortKey] as number);
      if (sortKey === "entryDate") {
        return sortAsc ? a.entryDate.localeCompare(b.entryDate) : b.entryDate.localeCompare(a.entryDate);
      }
      return diff;
    });
    return expanded ? s : s.slice(0, 10);
  }, [trades, sortKey, sortAsc, expanded]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  const SortIcon = ({ k }: { k: SortKey }) => (
    sortKey === k ? (sortAsc ? <ChevronUp className="h-3 w-3 inline ml-0.5" /> : <ChevronDown className="h-3 w-3 inline ml-0.5" />) : <ArrowUpDown className="h-3 w-3 inline ml-0.5 opacity-30" />
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full font-mono tabular-nums text-[11px]">
          <thead>
            <tr className="border-b border-border/30">
              <th className="p-1.5 text-left text-[10px] uppercase tracking-wider font-medium text-muted-foreground cursor-pointer" onClick={() => toggleSort("entryDate")}>Entry<SortIcon k="entryDate" /></th>
              <th className="p-1.5 text-left text-[10px] uppercase tracking-wider font-medium text-muted-foreground">Exit</th>
              <th className="p-1.5 text-center text-[10px] uppercase tracking-wider font-medium text-muted-foreground">Side</th>
              <th className="p-1.5 text-right text-[10px] uppercase tracking-wider font-medium text-muted-foreground cursor-pointer" onClick={() => toggleSort("pnl")}>P&L<SortIcon k="pnl" /></th>
              <th className="p-1.5 text-right text-[10px] uppercase tracking-wider font-medium text-muted-foreground cursor-pointer" onClick={() => toggleSort("pnlPercent")}>P&L %<SortIcon k="pnlPercent" /></th>
              <th className="p-1.5 text-right text-[10px] uppercase tracking-wider font-medium text-muted-foreground cursor-pointer" onClick={() => toggleSort("rMultiple")}>R-Mult<SortIcon k="rMultiple" /></th>
              <th className="p-1.5 text-right text-[10px] uppercase tracking-wider font-medium text-muted-foreground">MAE</th>
              <th className="p-1.5 text-right text-[10px] uppercase tracking-wider font-medium text-muted-foreground">MFE</th>
              <th className="p-1.5 text-right text-[10px] uppercase tracking-wider font-medium text-muted-foreground cursor-pointer" onClick={() => toggleSort("holdingPeriod")}>Bars<SortIcon k="holdingPeriod" /></th>
              <th className="p-1.5 text-left text-[10px] uppercase tracking-wider font-medium text-muted-foreground">Reason</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => (
              <tr key={`trade-${t.entryDate}-${i}`} className="border-b border-border/10 hover:bg-accent/10">
                <td className="p-1.5 text-muted-foreground">{t.entryDate}</td>
                <td className="p-1.5 text-muted-foreground">{t.exitDate}</td>
                <td className="p-1.5 text-center">
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", t.side === "long" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400")}>{t.side}</span>
                </td>
                <td className={cn("p-1.5 text-right font-medium", t.pnl >= 0 ? "text-green-400" : "text-red-400")}>{fmtCurrency(t.pnl)}</td>
                <td className={cn("p-1.5 text-right", t.pnlPercent >= 0 ? "text-green-400" : "text-red-400")}>{fmtPct(t.pnlPercent)}</td>
                <td className={cn("p-1.5 text-right font-medium", t.rMultiple >= 0 ? "text-green-400" : "text-red-400")}>{fmt(t.rMultiple)}R</td>
                <td className="p-1.5 text-right text-amber-400">{fmt(t.mae, 1)}%</td>
                <td className="p-1.5 text-right text-blue-400">{fmt(t.mfe, 1)}%</td>
                <td className="p-1.5 text-right text-muted-foreground">{t.holdingPeriod}</td>
                <td className="p-1.5 text-muted-foreground truncate max-w-[120px]">{t.exitReason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {trades.length > 10 && (
        <button onClick={() => setExpanded(!expanded)} className="w-full py-1.5 text-[11px] text-primary hover:text-primary/80 text-center">
          {expanded ? "Show less" : `Show all ${trades.length} trades`}
        </button>
      )}
    </div>
  );
}

// ── Walk Forward Results ─────────────────────────────────────────────────

function WalkForwardPanel({ wf }: { wf: WalkForwardResult }) {
  if (wf.folds.length === 0) return <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground"><ShieldAlert className="h-4 w-4 opacity-40" /> Not enough data for walk-forward analysis. Try a longer bar count.</div>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-border/30 p-2.5">
          <div className="text-muted-foreground mb-1">IS Avg Return</div>
          <div className="font-mono tabular-nums font-semibold text-sm">{fmtPct(wf.inSampleAvgReturn)}</div>
        </div>
        <div className="rounded-lg border border-border/30 p-2.5">
          <div className="text-muted-foreground mb-1">OOS Avg Return</div>
          <div className={cn("font-mono tabular-nums font-semibold text-sm", wf.outOfSampleAvgReturn >= 0 ? "text-green-400" : "text-red-400")}>
            {fmtPct(wf.outOfSampleAvgReturn)}
          </div>
        </div>
        <div className="rounded-lg border border-border/30 p-2.5">
          <div className="text-muted-foreground mb-1">Robustness</div>
          <div className={cn("font-mono tabular-nums font-semibold text-sm", wf.robustnessScore >= 60 ? "text-green-400" : wf.robustnessScore >= 40 ? "text-amber-400" : "text-red-400")}>
            {wf.robustnessScore}/100
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-border/30 p-2.5">
          <div className="text-muted-foreground mb-1">Degradation Ratio</div>
          <div className="font-mono tabular-nums font-semibold">{fmt(wf.degradationRatio)} <span className="text-muted-foreground font-normal">(OOS/IS)</span></div>
        </div>
        <div className="rounded-lg border border-border/30 p-2.5">
          <div className="text-muted-foreground mb-1">OOS Avg Sharpe</div>
          <div className="font-mono tabular-nums font-semibold">{fmt(wf.outOfSampleAvgSharpe)}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full text-[11px] min-w-[350px]">
        <thead>
          <tr className="border-b border-border/30">
            <th className="p-1 text-left text-muted-foreground font-normal">Fold</th>
            <th className="p-1 text-right text-muted-foreground font-normal">IS Return</th>
            <th className="p-1 text-right text-muted-foreground font-normal">OOS Return</th>
            <th className="p-1 text-right text-muted-foreground font-normal">IS Sharpe</th>
            <th className="p-1 text-right text-muted-foreground font-normal">OOS Sharpe</th>
            <th className="p-1 text-right text-muted-foreground font-normal">IS Trades</th>
            <th className="p-1 text-right text-muted-foreground font-normal">OOS Trades</th>
          </tr>
        </thead>
        <tbody>
          {wf.folds.map((f) => (
            <tr key={f.foldIndex} className="border-b border-border/10">
              <td className="p-1 text-muted-foreground">{f.foldIndex + 1}</td>
              <td className={cn("p-1 text-right", f.inSampleReturn >= 0 ? "text-green-400" : "text-red-400")}>{fmtPct(f.inSampleReturn)}</td>
              <td className={cn("p-1 text-right font-medium", f.outOfSampleReturn >= 0 ? "text-green-400" : "text-red-400")}>{fmtPct(f.outOfSampleReturn)}</td>
              <td className="p-1 text-right">{fmt(f.inSampleSharpe)}</td>
              <td className="p-1 text-right font-medium">{fmt(f.outOfSampleSharpe)}</td>
              <td className="p-1 text-right text-muted-foreground">{f.inSampleTrades}</td>
              <td className="p-1 text-right text-muted-foreground">{f.outOfSampleTrades}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ── Monte Carlo Results ──────────────────────────────────────────────────

function MonteCarloPanel({ mc }: { mc: MonteCarloBacktestResult }) {
  if (mc.confidenceIntervals.length === 0) return <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground"><Shuffle className="h-4 w-4 opacity-40" /> No trades generated to run Monte Carlo simulation</div>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="rounded-lg border border-border/30 p-2.5">
          <div className="text-muted-foreground mb-1">Simulations</div>
          <div className="font-mono tabular-nums font-semibold text-sm">{mc.simulations}</div>
        </div>
        <div className="rounded-lg border border-border/30 p-2.5">
          <div className="text-muted-foreground mb-1">Median Return</div>
          <div className={cn("font-mono tabular-nums font-semibold text-sm", mc.medianReturn >= 0 ? "text-green-400" : "text-red-400")}>
            {fmtPct(mc.medianReturn)}
          </div>
        </div>
        <div className="rounded-lg border border-border/30 p-2.5">
          <div className="text-muted-foreground mb-1">Median Max DD</div>
          <div className="font-mono tabular-nums font-semibold text-sm text-red-400">-{fmt(mc.medianMaxDrawdown)}%</div>
        </div>
        <div className="rounded-lg border border-border/30 p-2.5">
          <div className="text-muted-foreground mb-1">Ruin Prob</div>
          <div className={cn("font-mono tabular-nums font-semibold text-sm", mc.ruinProbability <= 5 ? "text-green-400" : mc.ruinProbability <= 15 ? "text-amber-400" : "text-red-400")}>
            {fmt(mc.ruinProbability, 1)}%
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full text-[11px] min-w-[350px]">
        <thead>
          <tr className="border-b border-border/30">
            <th className="p-1.5 text-left text-muted-foreground font-normal">Metric</th>
            <th className="p-1.5 text-right text-muted-foreground font-normal">P5</th>
            <th className="p-1.5 text-right text-muted-foreground font-normal">P25</th>
            <th className="p-1.5 text-right text-muted-foreground font-normal">P50</th>
            <th className="p-1.5 text-right text-muted-foreground font-normal">P75</th>
            <th className="p-1.5 text-right text-muted-foreground font-normal">P95</th>
          </tr>
        </thead>
        <tbody>
          {mc.confidenceIntervals.map((ci) => (
            <tr key={ci.metric} className="border-b border-border/10">
              <td className="p-1.5 font-medium">{ci.metric}</td>
              <td className="p-1.5 text-right text-red-400">{fmt(ci.p5)}</td>
              <td className="p-1.5 text-right text-amber-400">{fmt(ci.p25)}</td>
              <td className="p-1.5 text-right font-medium">{fmt(ci.p50)}</td>
              <td className="p-1.5 text-right text-blue-400">{fmt(ci.p75)}</td>
              <td className="p-1.5 text-right text-green-400">{fmt(ci.p95)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Distribution visualization */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground font-medium">Return Distribution (P5 to P95)</div>
        {mc.confidenceIntervals.filter(ci => ci.metric === "Total Return %").map((ci) => {
          const range = ci.p95 - ci.p5 || 1;
          const zeroPos = ci.p5 < 0 ? Math.min(100, Math.abs(ci.p5) / range * 100) : 0;
          return (
            <div key={ci.metric} className="h-6 rounded bg-accent/20 relative overflow-hidden">
              {/* Zero line */}
              {ci.p5 < 0 && ci.p95 > 0 && (
                <div className="absolute top-0 bottom-0 w-px bg-foreground/30" style={{ left: `${zeroPos}%` }} />
              )}
              {/* P25-P75 band */}
              <div
                className="absolute top-1 bottom-1 rounded bg-primary/30"
                style={{
                  left: `${((ci.p25 - ci.p5) / range) * 100}%`,
                  width: `${((ci.p75 - ci.p25) / range) * 100}%`,
                }}
              />
              {/* P50 marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary"
                style={{ left: `${((ci.p50 - ci.p5) / range) * 100}%` }}
              />
              {/* Original value marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400"
                style={{ left: `${((mc.originalReturn - ci.p5) / range) * 100}%` }}
                title={`Original: ${fmtPct(mc.originalReturn)}`}
              />
            </div>
          );
        })}
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>P5</span>
          <span>Median</span>
          <span>P95</span>
        </div>
      </div>
    </div>
  );
}

// ── Metric Card ──────────────────────────────────────────────────────────

function MetricCard({ label, value, color, subtitle }: { label: string; value: string; color?: string; subtitle?: string }) {
  return (
    <div className="rounded-lg border border-border/30 p-2.5 hover:border-border/60 transition-colors">
      <div className="text-[10px] text-muted-foreground mb-0.5">{label}</div>
      <div className={cn("font-mono tabular-nums text-sm font-semibold", color)}>{value}</div>
      {subtitle && <div className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

type ResultTab = "overview" | "trades" | "walkforward" | "montecarlo" | "advanced";

function ProfessionalBacktestTab() {
  // Config state
  const [strategyId, setStrategyId] = useState(STRATEGIES[0].id);
  const [ticker, setTicker] = useState("AAPL");
  const [initialCapital, setInitialCapital] = useState(100000);
  const [positionSizing, setPositionSizing] = useState<BacktestConfig["positionSizing"]>("percent");
  const [slippage, setSlippage] = useState(5);
  const [commission, setCommission] = useState(1);
  const [riskPerTrade, setRiskPerTrade] = useState(0.02);
  const [barCount, setBarCount] = useState(500);
  const [seed, setSeed] = useState(12345);

  // Results state
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [wfResult, setWfResult] = useState<WalkForwardResult | null>(null);
  const [mcResult, setMcResult] = useState<MonteCarloBacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [tab, setTab] = useState<ResultTab>("overview");

  // Advanced analysis state
  const [portfolioResult, setPortfolioResult] = useState<PortfolioBacktestResult | null>(null);
  const [wfOptReport, setWfOptReport] = useState<WalkForwardReport | null>(null);
  const [mcSimReport, setMcSimReport] = useState<MonteCarloReport | null>(null);
  const [correlationMatrix, setCorrelationMatrix] = useState<StrategyCorrelationMatrix | null>(null);
  const [isRunningAdvanced, setIsRunningAdvanced] = useState(false);

  const selectedStrategy = useMemo(() => STRATEGIES.find((s) => s.id === strategyId)!, [strategyId]);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setResult(null);
    setWfResult(null);
    setMcResult(null);

    // Defer to allow UI update
    setTimeout(() => {
      try {
        const data = generateSyntheticBars(barCount, 100, 0.0003, 0.015, seed);
        const cfg: BacktestConfig = {
          strategyId,
          ticker,
          startDate: data[0] ? new Date(data[0].timestamp).toISOString().split("T")[0] : "",
          endDate: data[data.length - 1] ? new Date(data[data.length - 1].timestamp).toISOString().split("T")[0] : "",
          initialCapital,
          positionSizing,
          slippage,
          commission,
          maxPositions: 1,
          riskPerTrade,
        };

        const res = runProfessionalBacktest(data, cfg);
        setResult(res);

        // Walk-forward
        const wf = runWalkForwardAnalysis(data, cfg, 200, 50);
        setWfResult(wf);

        // Monte Carlo
        const mc = runMonteCarloBacktest(res, 500);
        setMcResult(mc);

        setTab("overview");
      } catch (e) {
        // Backtest error silently handled — UI remains on previous state
      } finally {
        setIsRunning(false);
      }
    }, 50);
  }, [strategyId, ticker, initialCapital, positionSizing, slippage, commission, riskPerTrade, barCount, seed]);

  const handleRunAdvanced = useCallback(() => {
    setIsRunningAdvanced(true);
    setPortfolioResult(null);
    setWfOptReport(null);
    setMcSimReport(null);
    setCorrelationMatrix(null);

    setTimeout(() => {
      try {
        // Map the professional strategy ID (kebab-case) to simple-engine strategy ID (snake_case)
        const PROF_TO_SIMPLE: Record<string, StrategyId> = {
          "sma-crossover": "sma_crossover",
          "rsi-mean-reversion": "rsi_reversion",
          "macd-divergence": "macd_trend",
          "breakout": "breakout",
          "bollinger-squeeze": "bollinger_mean",
          "momentum": "momentum_3m",
          "mean-reversion": "mean_reversion_2std",
          "pairs-trading": "pairs_trading",
          "trend-atr": "trend_atr_stop",
          "volatility": "volatility_breakout",
        };
        const simpleStrategyId: StrategyId = PROF_TO_SIMPLE[strategyId] ?? "sma_crossover";
        const simpleStrategy = BACKTEST_STRATEGIES.find((s) => s.id === simpleStrategyId);
        const simpleParams = simpleStrategy?.defaultParams ?? { fastPeriod: 20, slowPeriod: 50 };
        const simpleBars = Math.max(barCount, 252);

        // 1. Portfolio backtest: run across all 10 tickers
        const portfolio = runPortfolioBacktest(simpleStrategyId, TICKERS, simpleParams, simpleBars, initialCapital);
        setPortfolioResult(portfolio);

        // 2. Walk-forward optimization (SMA-specific IS/OOS split)
        const wfOpt = runWalkForwardOptimization(ticker, simpleBars, 0.7, [10, 20, 50], 3);
        setWfOptReport(wfOpt);

        // 3. Monte Carlo: shuffle trade P&L 1000 times
        // Use a single-ticker run to get trades
        const singleResult = runSimpleBacktest(simpleStrategyId, ticker, simpleParams, simpleBars);
        const mc = runMonteCarlo(singleResult.trades, 1000, initialCapital, seed);
        setMcSimReport(mc);

        // 4. Strategy correlation matrix
        const corr = computeStrategyCorrelationMatrix(ticker, simpleBars);
        setCorrelationMatrix(corr);

        setTab("advanced");
      } catch (e) {
        // Advanced analysis error silently handled
      } finally {
        setIsRunningAdvanced(false);
      }
    }, 80);
  }, [strategyId, ticker, initialCapital, barCount, seed]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 px-4 sm:px-6 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <FlaskConical className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Professional Backtester</h1>
          <p className="text-xs text-muted-foreground">8 strategies, walk-forward analysis, Monte Carlo simulation</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* ── Left Config Panel ─────────────────────────────────────── */}
        <div className="w-full md:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-border/50 overflow-y-auto p-4 space-y-4">
          {/* Strategy Selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Strategy</label>
            <select
              value={strategyId}
              onChange={(e) => setStrategyId(e.target.value)}
              className="w-full rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {STRATEGIES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground mt-1">{selectedStrategy.description}</p>
            <span className={cn(
              "inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-medium",
              selectedStrategy.category === "trend" ? "bg-blue-500/15 text-blue-400" :
                selectedStrategy.category === "mean-reversion" ? "bg-purple-500/15 text-purple-400" :
                  selectedStrategy.category === "momentum" ? "bg-green-500/15 text-green-400" :
                    selectedStrategy.category === "breakout" ? "bg-amber-500/15 text-amber-400" :
                      "bg-pink-500/15 text-pink-400"
            )}>{selectedStrategy.category}</span>
          </div>

          <div className="h-px bg-border/30" />

          {/* Ticker */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ticker</label>
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {TICKERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Bar count + seed */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bars</label>
              <input type="number" value={barCount} onChange={(e) => setBarCount(parseInt(e.target.value) || 500)}
                className="w-full rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Seed</label>
              <input type="number" value={seed} onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                className="w-full rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          {/* Capital */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Initial Capital</label>
            <input type="number" value={initialCapital} onChange={(e) => setInitialCapital(parseInt(e.target.value) || 100000)}
              className="w-full rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          {/* Position Sizing */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Position Sizing</label>
            <select
              value={positionSizing}
              onChange={(e) => setPositionSizing(e.target.value as BacktestConfig["positionSizing"])}
              className="w-full rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {POSITION_SIZING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Risk + Slippage + Commission */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Risk/Trade</label>
              <input type="number" step="0.01" value={riskPerTrade} onChange={(e) => setRiskPerTrade(parseFloat(e.target.value) || 0.02)}
                className="w-full rounded-md border border-border/50 bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Slip (bps)</label>
              <input type="number" value={slippage} onChange={(e) => setSlippage(parseInt(e.target.value) || 0)}
                className="w-full rounded-md border border-border/50 bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Comm ($)</label>
              <input type="number" step="0.5" value={commission} onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                className="w-full rounded-md border border-border/50 bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div className="h-px bg-border/30" />

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors",
              isRunning
                ? "bg-primary/20 text-primary/50 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {isRunning ? (
              <>
                <Activity className="h-3.5 w-3.5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Run Backtest
              </>
            )}
          </button>

          {/* Quick summary if result exists */}
          {result && (
            <div className="rounded-lg border border-border/30 p-3 space-y-2">
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Quick Summary</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Return</div>
                  <div className={cn("font-mono tabular-nums font-semibold", result.totalReturn >= 0 ? "text-green-400" : "text-red-400")}>
                    {fmtPct(result.totalReturn)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Sharpe</div>
                  <div className="font-mono tabular-nums font-semibold">{fmt(result.sharpeRatio)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Win Rate</div>
                  <div className="font-mono tabular-nums font-semibold">{fmt(result.winRate, 1)}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Max DD</div>
                  <div className="font-mono tabular-nums font-semibold text-red-400">-{fmt(result.maxDrawdown)}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Results Panel ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {!result && !isRunning && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <FlaskConical className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <h2 className="text-lg font-semibold text-muted-foreground mb-2">Configure and Run</h2>
              <p className="text-xs text-muted-foreground max-w-md">
                Select a strategy, configure parameters, then click Run Backtest.
                Results include equity curve, risk metrics, walk-forward validation,
                and Monte Carlo confidence intervals.
              </p>
            </div>
          )}

          {!result && !isRunning && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <FlaskConical className="h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">No backtest results yet</p>
              <p className="text-xs opacity-60 text-center max-w-xs">Configure your strategy and parameters in the left panel, then click Run Backtest</p>
            </div>
          )}

          {isRunning && (
            <div className="flex flex-col items-center justify-center h-full">
              <Activity className="h-8 w-8 text-primary animate-spin mb-3" />
              <div className="text-sm font-medium">Running backtest...</div>
              <div className="text-xs text-muted-foreground mt-1">Executing strategy, computing walk-forward, running 500 Monte Carlo sims</div>
            </div>
          )}

          {result && !isRunning && (
            <div className="p-4 space-y-4">
              {/* Tab bar */}
              <div className="flex gap-1 border-b border-border/30 pb-px overflow-x-auto whitespace-nowrap">
                {(
                  [
                    { id: "overview" as const, label: "Overview", icon: BarChart3 },
                    { id: "trades" as const, label: `Trades (${result.totalTrades})`, icon: Target },
                    { id: "walkforward" as const, label: "Walk-Forward", icon: Layers },
                    { id: "montecarlo" as const, label: "Monte Carlo", icon: Shuffle },
                    { id: "advanced" as const, label: "Advanced Analysis", icon: Network },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors border-b-2",
                      tab === t.id
                        ? "border-primary text-foreground bg-accent/30"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <t.icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── Overview Tab ─────────────────────────────── */}
              {tab === "overview" && (
                <div className="space-y-4">
                  {/* Equity curve */}
                  <div className="rounded-lg border border-border/30 p-3">
                    <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      Equity Curve &amp; Drawdown
                    </div>
                    <EquityCurveSVG equityCurve={result.equityCurve} />
                  </div>

                  {/* Performance metrics grid */}
                  <div>
                    <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                      Performance
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <MetricCard label="Total Return" value={fmtPct(result.totalReturn)} color={result.totalReturn >= 0 ? "text-green-400" : "text-red-400"} />
                      <MetricCard label="CAGR" value={fmtPct(result.cagr)} color={result.cagr >= 0 ? "text-green-400" : "text-red-400"} />
                      <MetricCard label="Sharpe Ratio" value={fmt(result.sharpeRatio)} color={result.sharpeRatio >= 1 ? "text-green-400" : result.sharpeRatio >= 0 ? "text-foreground" : "text-red-400"} />
                      <MetricCard label="Sortino Ratio" value={fmt(result.sortinoRatio)} />
                      <MetricCard label="Calmar Ratio" value={fmt(result.calmarRatio)} />
                      <MetricCard label="Max Drawdown" value={`-${fmt(result.maxDrawdown)}%`} color="text-red-400" subtitle={`${result.maxDrawdownDuration} bars`} />
                      <MetricCard label="Profit Factor" value={fmt(result.profitFactor)} color={result.profitFactor >= 1.5 ? "text-green-400" : "text-foreground"} />
                      <MetricCard label="Expectancy" value={fmtCurrency(result.expectancy)} color={result.expectancy >= 0 ? "text-green-400" : "text-red-400"} subtitle="per trade" />
                    </div>
                  </div>

                  {/* Trade stats */}
                  <div>
                    <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-amber-400" />
                      Trade Statistics
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <MetricCard label="Total Trades" value={String(result.totalTrades)} />
                      <MetricCard label="Win Rate" value={`${fmt(result.winRate, 1)}%`} color={result.winRate >= 50 ? "text-green-400" : "text-amber-400"} />
                      <MetricCard label="Avg Win" value={`${fmtPct(result.avgWin)}`} color="text-green-400" />
                      <MetricCard label="Avg Loss" value={`${fmtPct(result.avgLoss)}`} color="text-red-400" />
                      <MetricCard label="Avg R-Multiple" value={`${fmt(result.avgRMultiple)}R`} color={result.avgRMultiple >= 0 ? "text-green-400" : "text-red-400"} />
                      <MetricCard label="Max Win Streak" value={String(result.maxConsecutiveWins)} color="text-green-400" />
                      <MetricCard label="Max Loss Streak" value={String(result.maxConsecutiveLosses)} color="text-red-400" />
                      <MetricCard label="Avg Hold Period" value={`${fmt(result.avgHoldingPeriod, 1)} bars`} />
                    </div>
                  </div>

                  {/* Risk metrics */}
                  <div>
                    <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                      Risk Metrics
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <MetricCard label="VaR 95%" value={`${fmtPct(result.var95)}`} color="text-red-400" subtitle="Daily" />
                      <MetricCard label="CVaR 95%" value={`${fmtPct(result.cvar95)}`} color="text-red-400" subtitle="Expected Shortfall" />
                      <MetricCard label="Ulcer Index" value={fmt(result.ulcerIndex)} subtitle="DD Severity" />
                    </div>
                  </div>

                  {/* Monthly heatmap */}
                  <div className="rounded-lg border border-border/30 p-3">
                    <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-purple-400" />
                      Monthly Returns Heatmap
                    </div>
                    <MonthlyHeatmap monthlyReturns={result.monthlyReturns} />
                  </div>
                </div>
              )}

              {/* ── Trades Tab ──────────────────────────────── */}
              {tab === "trades" && (
                <div className="rounded-lg border border-border/30 p-3">
                  <TradeTable trades={result.trades} />
                </div>
              )}

              {/* ── Walk-Forward Tab ────────────────────────── */}
              {tab === "walkforward" && wfResult && (
                <div className="rounded-lg border border-border/30 p-3">
                  <div className="text-xs font-medium mb-3 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-blue-400" />
                    Walk-Forward Optimization (IS: 200 bars / OOS: 50 bars)
                  </div>
                  <WalkForwardPanel wf={wfResult} />
                </div>
              )}

              {/* ── Monte Carlo Tab ─────────────────────────── */}
              {tab === "montecarlo" && mcResult && (
                <div className="rounded-lg border border-border/30 p-3">
                  <div className="text-xs font-medium mb-3 flex items-center gap-1.5">
                    <Shuffle className="h-3.5 w-3.5 text-purple-400" />
                    Monte Carlo Simulation (Trade Reshuffling)
                  </div>
                  <MonteCarloPanel mc={mcResult} />
                </div>
              )}

              {/* ── Advanced Analysis Tab ─────────────────────────── */}
              {tab === "advanced" && (
                <AdvancedAnalysisPanel
                  ticker={ticker}
                  strategyId={strategyId}
                  portfolioResult={portfolioResult}
                  wfOptReport={wfOptReport}
                  mcSimReport={mcSimReport}
                  correlationMatrix={correlationMatrix}
                  isRunning={isRunningAdvanced}
                  onRun={handleRunAdvanced}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Advanced Analysis Panel ──────────────────────────────────────────────────

function AdvancedAnalysisPanel({
  ticker,
  strategyId,
  portfolioResult,
  wfOptReport,
  mcSimReport,
  correlationMatrix,
  isRunning,
  onRun,
}: {
  ticker: string;
  strategyId: string;
  portfolioResult: PortfolioBacktestResult | null;
  wfOptReport: WalkForwardReport | null;
  mcSimReport: MonteCarloReport | null;
  correlationMatrix: StrategyCorrelationMatrix | null;
  isRunning: boolean;
  onRun: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Run button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium">Portfolio-Level Analysis</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Multi-ticker portfolio, SMA walk-forward optimization, 1000-run Monte Carlo, strategy correlation matrix
          </div>
        </div>
        <button
          onClick={onRun}
          disabled={isRunning}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap",
            isRunning
              ? "bg-primary/20 text-primary/50 cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {isRunning ? (
            <>
              <Activity className="h-3.5 w-3.5 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Run Advanced Analysis
            </>
          )}
        </button>
      </div>

      {!portfolioResult && !isRunning && (
        <div className="rounded-lg border border-border/30 p-8 text-center text-xs text-muted-foreground">
          <Network className="h-8 w-8 opacity-20 mx-auto mb-3" />
          Click Run Advanced Analysis to see multi-ticker portfolio simulation, walk-forward optimization, 1000-run Monte Carlo, and strategy correlation matrix.
        </div>
      )}

      {isRunning && (
        <div className="rounded-lg border border-border/30 p-8 text-center">
          <Activity className="h-6 w-6 text-primary animate-spin mx-auto mb-3" />
          <div className="text-xs font-medium">Running advanced analysis...</div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Running all 10 tickers, walk-forward on 3 folds, 1000 Monte Carlo simulations, correlation matrix
          </div>
        </div>
      )}

      {/* ── 1. Multi-Ticker Portfolio ── */}
      {portfolioResult && (
        <div className="rounded-lg border border-border/30 p-3 space-y-3">
          <div className="text-xs font-medium flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-blue-400" />
            Multi-Ticker Portfolio — All 10 Tickers (Equal Weight)
          </div>

          {/* Portfolio summary metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/30 p-2.5">
              <div className="text-[10px] text-muted-foreground mb-0.5">Portfolio Return</div>
              <div className={cn("font-mono tabular-nums font-semibold text-sm", portfolioResult.portfolioTotalReturn >= 0 ? "text-green-400" : "text-red-400")}>
                {fmtPct(portfolioResult.portfolioTotalReturn)}
              </div>
            </div>
            <div className="rounded-lg border border-border/30 p-2.5">
              <div className="text-[10px] text-muted-foreground mb-0.5">Portfolio Sharpe</div>
              <div className={cn("font-mono tabular-nums font-semibold text-sm", portfolioResult.portfolioSharpe >= 1 ? "text-green-400" : "text-foreground")}>
                {fmt(portfolioResult.portfolioSharpe)}
              </div>
            </div>
            <div className="rounded-lg border border-border/30 p-2.5">
              <div className="text-[10px] text-muted-foreground mb-0.5">Max Drawdown</div>
              <div className="font-mono tabular-nums font-semibold text-sm text-red-400">
                -{fmt(portfolioResult.portfolioMaxDrawdown)}%
              </div>
            </div>
          </div>

          {/* Portfolio equity curve SVG */}
          <PortfolioEquityCurveSVG portfolioResult={portfolioResult} />

          {/* Per-ticker breakdown */}
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono tabular-nums min-w-[500px]">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="p-1.5 text-left text-[10px] text-muted-foreground font-normal">Ticker</th>
                  <th className="p-1.5 text-right text-[10px] text-muted-foreground font-normal">Return</th>
                  <th className="p-1.5 text-right text-[10px] text-muted-foreground font-normal">Sharpe</th>
                  <th className="p-1.5 text-right text-[10px] text-muted-foreground font-normal">Max DD</th>
                  <th className="p-1.5 text-right text-[10px] text-muted-foreground font-normal">Win %</th>
                  <th className="p-1.5 text-right text-[10px] text-muted-foreground font-normal">Trades</th>
                </tr>
              </thead>
              <tbody>
                {portfolioResult.tickerResults.map((tr) => (
                  <tr key={tr.ticker} className="border-b border-border/10 hover:bg-accent/10">
                    <td className="p-1.5 font-medium">{tr.ticker}</td>
                    <td className={cn("p-1.5 text-right font-medium", tr.result.totalReturn >= 0 ? "text-green-400" : "text-red-400")}>
                      {fmtPct(tr.result.totalReturn)}
                    </td>
                    <td className={cn("p-1.5 text-right", tr.result.sharpeRatio >= 1 ? "text-green-400" : tr.result.sharpeRatio < 0 ? "text-red-400" : "text-foreground")}>
                      {fmt(tr.result.sharpeRatio)}
                    </td>
                    <td className="p-1.5 text-right text-red-400">-{fmt(tr.result.maxDrawdown)}%</td>
                    <td className={cn("p-1.5 text-right", tr.result.winRate >= 0.5 ? "text-green-400" : "text-amber-400")}>
                      {(tr.result.winRate * 100).toFixed(1)}%
                    </td>
                    <td className="p-1.5 text-right text-muted-foreground">{tr.result.totalTrades}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 2. Walk-Forward Optimization ── */}
      {wfOptReport && (
        <div className="rounded-lg border border-border/30 p-3 space-y-3">
          <div className="text-xs font-medium flex items-center gap-1.5">
            <GitBranch className="h-3.5 w-3.5 text-amber-400" />
            SMA Walk-Forward Optimization — IS 70% / OOS 30% ({wfOptReport.folds.length} folds)
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-lg border border-border/30 p-2.5">
              <div className="text-[10px] text-muted-foreground mb-0.5">Avg IS Sharpe</div>
              <div className="font-mono tabular-nums font-semibold text-sm">{fmt(wfOptReport.avgIsSharpe)}</div>
            </div>
            <div className="rounded-lg border border-border/30 p-2.5">
              <div className="text-[10px] text-muted-foreground mb-0.5">Avg OOS Sharpe</div>
              <div className={cn("font-mono tabular-nums font-semibold text-sm", wfOptReport.avgOosSharpe >= 0 ? "text-green-400" : "text-red-400")}>
                {fmt(wfOptReport.avgOosSharpe)}
              </div>
            </div>
            <div className="rounded-lg border border-border/30 p-2.5">
              <div className="text-[10px] text-muted-foreground mb-0.5">IS-OOS Degradation</div>
              <div className={cn("font-mono tabular-nums font-semibold text-sm", wfOptReport.avgDegradationPct < 30 ? "text-green-400" : wfOptReport.avgDegradationPct < 60 ? "text-amber-400" : "text-red-400")}>
                {wfOptReport.avgDegradationPct > 0 ? "+" : ""}{wfOptReport.avgDegradationPct.toFixed(1)}%
              </div>
            </div>
            <div className="rounded-lg border border-border/30 p-2.5">
              <div className="text-[10px] text-muted-foreground mb-0.5">Robustness</div>
              <div className={cn("font-mono tabular-nums font-semibold text-sm", wfOptReport.robustnessScore >= 60 ? "text-green-400" : wfOptReport.robustnessScore >= 40 ? "text-amber-400" : "text-red-400")}>
                {wfOptReport.robustnessScore}/100
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className="rounded-lg bg-accent/20 px-3 py-2 text-[11px] text-muted-foreground border border-border/20">
            {wfOptReport.verdict}
          </div>

          {/* Fold table */}
          {wfOptReport.folds.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono tabular-nums min-w-[520px]">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="p-1.5 text-left text-[10px] text-muted-foreground font-normal">Fold</th>
                    <th className="p-1.5 text-right text-[10px] text-muted-foreground font-normal">Best Period</th>
                    <th className="p-1.5 text-right text-[10px] text-muted-foreground font-normal">IS Sharpe</th>
                    <th className="p-1.5 text-right text-[10px] text-muted-foreground font-normal">IS Return</th>
                    <th className="p-1.5 text-right text-[10px] text-muted-foreground font-normal">OOS Sharpe</th>
                    <th className="p-1.5 text-right text-[10px] text-muted-foreground font-normal">OOS Return</th>
                    <th className="p-1.5 text-right text-[10px] text-muted-foreground font-normal">Degradation</th>
                  </tr>
                </thead>
                <tbody>
                  {wfOptReport.folds.map((fold) => (
                    <tr key={fold.foldIndex} className="border-b border-border/10 hover:bg-accent/10">
                      <td className="p-1.5 text-muted-foreground">{fold.foldIndex + 1}</td>
                      <td className="p-1.5 text-right font-medium">SMA({fold.bestPeriod})</td>
                      <td className="p-1.5 text-right">{fmt(fold.isSharpe)}</td>
                      <td className={cn("p-1.5 text-right", fold.isReturn >= 0 ? "text-green-400" : "text-red-400")}>{fmtPct(fold.isReturn)}</td>
                      <td className={cn("p-1.5 text-right font-medium", fold.oosSharpe >= 0 ? "text-green-400" : "text-red-400")}>{fmt(fold.oosSharpe)}</td>
                      <td className={cn("p-1.5 text-right font-medium", fold.oosReturn >= 0 ? "text-green-400" : "text-red-400")}>{fmtPct(fold.oosReturn)}</td>
                      <td className={cn("p-1.5 text-right", fold.degradationPct < 30 ? "text-green-400" : fold.degradationPct < 60 ? "text-amber-400" : "text-red-400")}>
                        {fold.degradationPct > 0 ? "+" : ""}{fold.degradationPct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* IS period comparison for fold 0 */}
          {wfOptReport.folds.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] text-muted-foreground">IS Period Comparison (Fold 1)</div>
              <div className="flex gap-2 flex-wrap">
                {wfOptReport.folds[0].isResults.map((r) => (
                  <div
                    key={r.period}
                    className={cn(
                      "rounded border px-2.5 py-1.5 text-xs font-mono",
                      r.period === wfOptReport.folds[0].bestPeriod
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/30 text-muted-foreground",
                    )}
                  >
                    <span className="font-medium">SMA({r.period})</span>
                    <span className="ml-2">Sharpe {fmt(r.sharpe)}</span>
                    <span className="ml-2 opacity-70">{fmtPct(r.totalReturn)}</span>
                    {r.period === wfOptReport.folds[0].bestPeriod && (
                      <span className="ml-1.5 text-[10px] text-primary font-medium">best</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 3. Monte Carlo (1000 sims) ── */}
      {mcSimReport && (
        <div className="rounded-lg border border-border/30 p-3 space-y-3">
          <div className="text-xs font-medium flex items-center gap-1.5">
            <Shuffle className="h-3.5 w-3.5 text-purple-400" />
            Monte Carlo Simulation — {mcSimReport.simulations} trade-sequence reshuffles
          </div>

          {/* Summary chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-lg border border-border/30 p-2.5">
              <div className="text-[10px] text-muted-foreground mb-0.5">P10 Final</div>
              <div className="font-mono tabular-nums font-semibold text-sm text-red-400">
                {fmtCurrency(mcSimReport.p10Final)}
              </div>
            </div>
            <div className="rounded-lg border border-border/30 p-2.5">
              <div className="text-[10px] text-muted-foreground mb-0.5">P50 Final (Median)</div>
              <div className={cn("font-mono tabular-nums font-semibold text-sm", mcSimReport.p50Final >= mcSimReport.startingEquity ? "text-green-400" : "text-red-400")}>
                {fmtCurrency(mcSimReport.p50Final)}
              </div>
            </div>
            <div className="rounded-lg border border-border/30 p-2.5">
              <div className="text-[10px] text-muted-foreground mb-0.5">P90 Final</div>
              <div className="font-mono tabular-nums font-semibold text-sm text-green-400">
                {fmtCurrency(mcSimReport.p90Final)}
              </div>
            </div>
            <div className="rounded-lg border border-border/30 p-2.5">
              <div className="text-[10px] text-muted-foreground mb-0.5">Ruin Prob</div>
              <div className={cn("font-mono tabular-nums font-semibold text-sm", mcSimReport.ruinProbabilityPct <= 5 ? "text-green-400" : mcSimReport.ruinProbabilityPct <= 15 ? "text-amber-400" : "text-red-400")}>
                {mcSimReport.ruinProbabilityPct.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Confidence interval callout */}
          <div className="rounded-lg bg-accent/20 border border-border/20 px-3 py-2 text-[11px]">
            95% confidence interval: final portfolio between{" "}
            <span className="font-mono font-semibold text-foreground">{fmtCurrency(mcSimReport.ci95Low)}</span>
            {" "}and{" "}
            <span className="font-mono font-semibold text-foreground">{fmtCurrency(mcSimReport.ci95High)}</span>
            {" "}(starting from {fmtCurrency(mcSimReport.startingEquity)})
          </div>

          {/* SVG percentile equity curve */}
          <MonteCarloPercentileSVG report={mcSimReport} />

          {/* Percentile return table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono tabular-nums min-w-[320px]">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="p-1.5 text-left text-[10px] text-muted-foreground font-normal">Percentile</th>
                  <th className="p-1.5 text-right text-[10px] text-muted-foreground font-normal">Final Equity</th>
                  <th className="p-1.5 text-right text-[10px] text-muted-foreground font-normal">Return</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "P10 (Pessimistic)", final: mcSimReport.p10Final, ret: mcSimReport.p10ReturnPct },
                  { label: "P50 (Median)", final: mcSimReport.p50Final, ret: mcSimReport.p50ReturnPct },
                  { label: "P90 (Optimistic)", final: mcSimReport.p90Final, ret: mcSimReport.p90ReturnPct },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-border/10">
                    <td className="p-1.5 text-muted-foreground">{row.label}</td>
                    <td className="p-1.5 text-right">{fmtCurrency(row.final)}</td>
                    <td className={cn("p-1.5 text-right font-medium", row.ret >= 0 ? "text-green-400" : "text-red-400")}>
                      {fmtPct(row.ret)}
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-border/10">
                  <td className="p-1.5 text-muted-foreground">Profit probability</td>
                  <td className="p-1.5 text-right" colSpan={2}>
                    <span className={cn("font-semibold", mcSimReport.profitProbabilityPct >= 60 ? "text-green-400" : "text-amber-400")}>
                      {mcSimReport.profitProbabilityPct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 text-muted-foreground">Median max drawdown</td>
                  <td className="p-1.5 text-right" colSpan={2}>
                    <span className="text-red-400 font-mono">-{mcSimReport.medianMaxDrawdownPct.toFixed(1)}%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 4. Strategy Correlation Matrix ── */}
      {correlationMatrix && (
        <div className="rounded-lg border border-border/30 p-3 space-y-3">
          <div className="text-xs font-medium flex items-center gap-1.5">
            <Network className="h-3.5 w-3.5 text-cyan-400" />
            Strategy Correlation Matrix — Daily Return Series ({correlationMatrix.ticker})
          </div>
          <div className="text-[10px] text-muted-foreground">
            Low correlation between strategies = good diversification. Values near 0 suggest independent return drivers.
          </div>
          <CorrelationHeatmapSVG matrix={correlationMatrix} />
        </div>
      )}
    </div>
  );
}

// ── Portfolio Equity Curve SVG ────────────────────────────────────────────────

function PortfolioEquityCurveSVG({ portfolioResult }: { portfolioResult: PortfolioBacktestResult }) {
  const W = 600, H = 200, PAD_L = 52, PAD_R = 12, PAD_T = 12, PAD_B = 20;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const combined = portfolioResult.portfolioCurve;
  const tickerCurves = portfolioResult.tickerResults.map((tr) => tr.portfolioEquity);

  if (combined.length < 2) return null;

  const allEquities = combined.map((e) => e.equity);
  for (const tc of tickerCurves) tc.forEach((e) => allEquities.push(e.equity));
  const minE = Math.min(...allEquities);
  const maxE = Math.max(...allEquities);
  const rangeE = maxE - minE || 1;

  const toX = (i: number, len: number) => PAD_L + (i / Math.max(1, len - 1)) * chartW;
  const toY = (v: number) => PAD_T + (1 - (v - minE) / rangeE) * chartH;

  const combinedPts = combined
    .map((e, i) => `${toX(i, combined.length).toFixed(1)},${toY(e.equity).toFixed(1)}`)
    .join(" ");

  const TICKER_COLORS = [
    "hsl(210 70% 55% / 0.4)",
    "hsl(160 60% 50% / 0.4)",
    "hsl(40 80% 55% / 0.4)",
    "hsl(280 60% 60% / 0.4)",
    "hsl(0 70% 55% / 0.4)",
    "hsl(180 60% 50% / 0.4)",
    "hsl(320 60% 60% / 0.4)",
    "hsl(70 60% 55% / 0.4)",
    "hsl(240 60% 65% / 0.4)",
    "hsl(20 70% 55% / 0.4)",
  ];

  return (
    <div className="space-y-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line
            key={pct}
            x1={PAD_L} x2={W - PAD_R}
            y1={PAD_T + pct * chartH} y2={PAD_T + pct * chartH}
            stroke="currentColor" className="text-border/20" strokeWidth={0.5}
          />
        ))}

        {/* Per-ticker thin lines */}
        {tickerCurves.map((tc, ci) => {
          if (tc.length < 2) return null;
          const pts = tc
            .map((e, i) => `${toX(i, tc.length).toFixed(1)},${toY(e.equity).toFixed(1)}`)
            .join(" ");
          return (
            <polyline
              key={`ticker-${ci}`}
              points={pts}
              fill="none"
              stroke={TICKER_COLORS[ci % TICKER_COLORS.length]}
              strokeWidth={1}
            />
          );
        })}

        {/* Combined portfolio (bold) */}
        <polyline
          points={combinedPts}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Y-axis labels */}
        {[minE, (minE + maxE) / 2, maxE].map((v, i) => (
          <text key={i} x={PAD_L - 4} y={toY(v) + 3} textAnchor="end" fontSize={8} className="fill-muted-foreground">
            {v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`}
          </text>
        ))}
      </svg>
      <div className="flex items-center gap-3 text-[9px] text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-4 bg-primary inline-block" style={{ height: 2 }} />
          Portfolio (equal weight)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-4 inline-block" style={{ height: 1.5, backgroundColor: "hsl(210 70% 55% / 0.5)" }} />
          Individual tickers
        </span>
      </div>
    </div>
  );
}

// ── Monte Carlo Percentile SVG ────────────────────────────────────────────────

function MonteCarloPercentileSVG({ report }: { report: MonteCarloReport }) {
  if (report.curves.length === 0 || report.tradeCount === 0) return null;

  const W = 600, H = 200, PAD_L = 52, PAD_R = 12, PAD_T = 12, PAD_B = 24;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  // All equity values across all 3 curves
  const allVals: number[] = [];
  for (const curve of report.curves) allVals.push(...curve.equity);
  const minE = Math.min(...allVals);
  const maxE = Math.max(...allVals);
  const rangeE = maxE - minE || 1;
  const n = report.curves[0].equity.length;

  const toX = (i: number) => PAD_L + (i / Math.max(1, n - 1)) * chartW;
  const toY = (v: number) => PAD_T + (1 - (v - minE) / rangeE) * chartH;

  const CURVE_STYLES: { percentile: number; color: string; width: number; dash?: string }[] = [
    { percentile: 10, color: "hsl(0 70% 55%)", width: 1.5, dash: "4,2" },
    { percentile: 50, color: "hsl(var(--primary))", width: 2 },
    { percentile: 90, color: "hsl(142 70% 45%)", width: 1.5, dash: "4,2" },
  ];

  // Fill band between p10 and p90
  const p10Curve = report.curves.find((c) => c.percentile === 10);
  const p90Curve = report.curves.find((c) => c.percentile === 90);
  let bandPoly = "";
  if (p10Curve && p90Curve) {
    const forward = p90Curve.equity.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
    const backward = [...p10Curve.equity].reverse().map((v, i) => `${toX(n - 1 - i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
    bandPoly = `${forward} ${backward}`;
  }

  // Starting equity horizontal reference line
  const startY = toY(report.startingEquity);

  return (
    <div className="space-y-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line key={pct} x1={PAD_L} x2={W - PAD_R} y1={PAD_T + pct * chartH} y2={PAD_T + pct * chartH}
            stroke="currentColor" className="text-border/20" strokeWidth={0.5} />
        ))}

        {/* Starting equity reference */}
        <line
          x1={PAD_L} x2={W - PAD_R}
          y1={startY} y2={startY}
          stroke="currentColor" className="text-border/40"
          strokeWidth={1} strokeDasharray="2,2"
        />

        {/* P10-P90 band */}
        {bandPoly && (
          <polygon points={bandPoly} fill="hsl(var(--primary) / 0.07)" />
        )}

        {/* The 3 percentile curves */}
        {CURVE_STYLES.map((style) => {
          const curve = report.curves.find((c) => c.percentile === style.percentile);
          if (!curve || curve.equity.length < 2) return null;
          const pts = curve.equity
            .map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`)
            .join(" ");
          return (
            <polyline
              key={`p${style.percentile}`}
              points={pts}
              fill="none"
              stroke={style.color}
              strokeWidth={style.width}
              strokeDasharray={style.dash}
              strokeLinejoin="round"
            />
          );
        })}

        {/* Y-axis labels */}
        {[minE, (minE + maxE) / 2, maxE].map((v, i) => (
          <text key={i} x={PAD_L - 4} y={toY(v) + 3} textAnchor="end" fontSize={8} className="fill-muted-foreground">
            {v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`}
          </text>
        ))}

        {/* X-axis: trade count */}
        {[0, Math.floor((n - 1) / 2), n - 1].map((idx) => (
          <text key={idx} x={toX(idx)} y={H - 6} textAnchor="middle" fontSize={8} className="fill-muted-foreground">
            Trade {idx}
          </text>
        ))}
      </svg>
      <div className="flex items-center gap-4 text-[9px] text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3 bg-red-500 inline-block" style={{ height: 1.5 }} />
          P10 (pessimistic)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3 bg-primary inline-block" style={{ height: 2 }} />
          P50 (median)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3 bg-green-500 inline-block" style={{ height: 1.5 }} />
          P90 (optimistic)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-3 rounded-sm inline-block" style={{ backgroundColor: "hsl(var(--primary) / 0.15)" }} />
          Confidence band
        </span>
      </div>
    </div>
  );
}

// ── Strategy Correlation Heatmap SVG ──────────────────────────────────────────

function CorrelationHeatmapSVG({ matrix }: { matrix: StrategyCorrelationMatrix }) {
  const n = matrix.strategies.length;
  if (n === 0) return null;

  // Short strategy name abbreviations for the axis labels
  const shortNames = matrix.strategyNames.map((name) => {
    // Take first word or up to 8 chars
    const parts = name.split(" ");
    if (parts.length === 1) return name.slice(0, 8);
    return parts.map((p) => p[0]).join("").toUpperCase().slice(0, 5);
  });

  const CELL = 36;
  const LABEL_W = 80;
  const LABEL_H = 60;
  const W = LABEL_W + n * CELL + 4;
  const H = LABEL_H + n * CELL + 4;

  function cellColor(corr: number): string {
    if (corr === 1) return "hsl(210 50% 30% / 0.6)"; // diagonal
    const abs = Math.abs(corr);
    const intensity = abs;
    if (corr > 0) return `hsl(210 70% ${Math.round(70 - intensity * 40)}% / ${0.3 + intensity * 0.55})`;
    return `hsl(0 70% ${Math.round(70 - intensity * 40)}% / ${0.3 + intensity * 0.55})`;
  }

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", minWidth: `${Math.min(W, 480)}px` }}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Column headers (rotated) */}
        {shortNames.map((name, ci) => (
          <text
            key={`col-${ci}`}
            x={LABEL_W + ci * CELL + CELL / 2}
            y={LABEL_H - 4}
            textAnchor="end"
            fontSize={8}
            className="fill-muted-foreground"
            transform={`rotate(-45, ${LABEL_W + ci * CELL + CELL / 2}, ${LABEL_H - 4})`}
          >
            {name}
          </text>
        ))}

        {/* Row headers */}
        {shortNames.map((name, ri) => (
          <text
            key={`row-${ri}`}
            x={LABEL_W - 4}
            y={LABEL_H + ri * CELL + CELL / 2 + 3}
            textAnchor="end"
            fontSize={8}
            className="fill-muted-foreground"
          >
            {name}
          </text>
        ))}

        {/* Cells */}
        {matrix.matrix.map((row, ri) =>
          row.map((corr, ci) => {
            const x = LABEL_W + ci * CELL;
            const y = LABEL_H + ri * CELL;
            return (
              <g key={`cell-${ri}-${ci}`}>
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={CELL - 2}
                  height={CELL - 2}
                  rx={2}
                  fill={cellColor(corr)}
                />
                <text
                  x={x + CELL / 2}
                  y={y + CELL / 2 + 3}
                  textAnchor="middle"
                  fontSize={7}
                  className="fill-foreground"
                  opacity={0.85}
                >
                  {corr === 1 ? "1.0" : corr.toFixed(2)}
                </text>
              </g>
            );
          }),
        )}
      </svg>
      <div className="flex items-center gap-4 mt-2 text-[9px] text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm inline-block" style={{ backgroundColor: "hsl(210 70% 30% / 0.7)" }} />
          High positive correlation
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm inline-block" style={{ backgroundColor: "hsl(0 70% 30% / 0.7)" }} />
          High negative correlation
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm border border-border/30 inline-block" style={{ backgroundColor: "transparent" }} />
          Uncorrelated (diversifying)
        </span>
      </div>
    </div>
  );
}
