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
} from "lucide-react";
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

type ResultTab = "overview" | "trades" | "walkforward" | "montecarlo";

export default function BacktestPage() {
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
