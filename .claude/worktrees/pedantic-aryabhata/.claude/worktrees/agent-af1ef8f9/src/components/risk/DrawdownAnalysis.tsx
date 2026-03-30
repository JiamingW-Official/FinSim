"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { Info, ShieldCheck } from "lucide-react";

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtDollar(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "+";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(2)}`;
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

// ── Equity curve builder ──────────────────────────────────────────────────────

interface EquityPoint {
  index: number;
  value: number;
  drawdown: number; // fraction 0..1 (negative means below peak)
}

// ── SVG Underwater Plot ───────────────────────────────────────────────────────

function UnderwaterPlot({ points }: { points: EquityPoint[] }) {
  const W = 360;
  const H = 100;
  const PADL = 32;
  const PADR = 8;
  const PADT = 8;
  const PADB = 18;
  const innerW = W - PADL - PADR;
  const innerH = H - PADT - PADB;

  if (points.length < 2) return null;

  const minDd = Math.min(...points.map((p) => p.drawdown), -0.001); // at least -0.001
  const maxDd = 0; // zero line at top

  function toX(i: number) {
    return PADL + (i / (points.length - 1)) * innerW;
  }
  function toY(dd: number) {
    // dd = 0 maps to PADT; dd = minDd maps to PADT + innerH
    return PADT + ((maxDd - dd) / (maxDd - minDd)) * innerH;
  }

  const zeroY = toY(0);

  // Build SVG path
  const pathParts: string[] = [];
  pathParts.push(`M ${toX(0)} ${zeroY}`);
  for (const pt of points) {
    pathParts.push(`L ${toX(pt.index)} ${toY(pt.drawdown)}`);
  }
  pathParts.push(`L ${toX(points.length - 1)} ${zeroY} Z`);
  const fillPath = pathParts.join(" ");

  // Line path (no fill)
  const lineParts: string[] = points.map((pt, i) =>
    `${i === 0 ? "M" : "L"} ${toX(pt.index)} ${toY(pt.drawdown)}`,
  );

  // Y-axis labels
  const yTicks = [0, minDd * 0.5, minDd];

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      aria-label="Underwater drawdown plot"
    >
      {/* Fill area */}
      <path d={fillPath} fill="hsl(var(--destructive))" opacity={0.15} />
      {/* Line */}
      <polyline
        points={points.map((pt) => `${toX(pt.index)},${toY(pt.drawdown)}`).join(" ")}
        fill="none"
        stroke="hsl(var(--destructive))"
        strokeWidth={1.2}
      />
      {/* Zero baseline */}
      <line
        x1={PADL}
        y1={zeroY}
        x2={W - PADR}
        y2={zeroY}
        stroke="hsl(var(--border))"
        strokeWidth={0.75}
      />
      {/* Y-axis ticks */}
      {yTicks.map((dd, i) => (
        <g key={i}>
          <line
            x1={PADL - 3}
            y1={toY(dd)}
            x2={PADL}
            y2={toY(dd)}
            stroke="hsl(var(--border))"
            strokeWidth={0.5}
          />
          <text
            x={PADL - 5}
            y={toY(dd) + 3}
            fontSize={7}
            textAnchor="end"
            fill="hsl(var(--muted-foreground))"
            fontFamily="var(--font-mono, monospace)"
          >
            {(dd * 100).toFixed(1)}%
          </text>
        </g>
      ))}
      {/* X labels */}
      <text
        x={PADL}
        y={H - 2}
        fontSize={7}
        fill="hsl(var(--muted-foreground))"
        textAnchor="start"
      >
        Trade 1
      </text>
      <text
        x={W - PADR}
        y={H - 2}
        fontSize={7}
        fill="hsl(var(--muted-foreground))"
        textAnchor="end"
      >
        Trade {points.length}
      </text>
    </svg>
  );
}

// ── Metric row ────────────────────────────────────────────────────────────────

function MetricRow({
  label,
  value,
  valueClass,
  sub,
}: {
  label: string;
  value: string;
  valueClass?: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="text-right">
        <span className={`text-xs font-semibold tabular-nums ${valueClass ?? ""}`}>
          {value}
        </span>
        {sub && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DrawdownAnalysis() {
  const { tradeHistory, portfolioValue } = useTradingStore((s) => ({
    tradeHistory: s.tradeHistory,
    portfolioValue: s.portfolioValue,
  }));

  const metrics = useMemo(() => {
    const sellTrades = [...tradeHistory]
      .filter((t) => t.side === "sell" && typeof t.realizedPnL === "number")
      .reverse(); // oldest first

    if (sellTrades.length === 0) {
      return null;
    }

    let runningValue = INITIAL_CAPITAL;
    let peak = INITIAL_CAPITAL;
    let maxDd = 0;
    let maxDdStart = 0;
    let maxDdEnd = 0;
    let drawdownStart = -1;
    let totalDrawdown = 0;
    let drawdownPeriods = 0;
    let inDrawdown = false;
    let recoveryBars = 0;
    let totalRecovery = 0;
    let recoveryCount = 0;

    const equityPoints: EquityPoint[] = [
      { index: 0, value: INITIAL_CAPITAL, drawdown: 0 },
    ];

    for (let i = 0; i < sellTrades.length; i++) {
      const t = sellTrades[i];
      runningValue += t.realizedPnL;
      if (runningValue > peak) {
        if (inDrawdown) {
          // Recovered
          totalRecovery += i - drawdownStart;
          recoveryCount++;
          inDrawdown = false;
        }
        peak = runningValue;
        drawdownStart = i;
      }
      const dd = peak > 0 ? (runningValue - peak) / peak : 0; // 0 or negative
      if (dd < -0.0001) {
        if (!inDrawdown) {
          inDrawdown = true;
          drawdownStart = i;
          drawdownPeriods++;
          recoveryBars = 0;
        } else {
          recoveryBars++;
        }
        totalDrawdown += Math.abs(dd);
      }
      if (dd < maxDd) {
        maxDd = dd;
        maxDdEnd = i;
      }
      equityPoints.push({ index: i + 1, value: runningValue, drawdown: dd });
    }

    // Current drawdown
    const currentPeak = Math.max(peak, portfolioValue);
    const currentDd =
      currentPeak > 0 ? (portfolioValue - currentPeak) / currentPeak : 0;

    const avgDd =
      drawdownPeriods > 0
        ? totalDrawdown / Math.max(drawdownPeriods, 1)
        : 0;

    const avgRecovery =
      recoveryCount > 0 ? totalRecovery / recoveryCount : null;

    return {
      maxDrawdownPct: maxDd * 100,
      currentDrawdownPct: currentDd * 100,
      avgDrawdownPct: avgDd * 100,
      avgRecoveryTrades: avgRecovery,
      drawdownPeriods,
      peakValue: currentPeak,
      equityPoints,
      tradeCount: sellTrades.length,
    };
  }, [tradeHistory, portfolioValue]);

  if (!metrics) {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Drawdown Analysis
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Equity curve drawdowns over your trading history.
          </p>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted-foreground py-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          No closed trades yet. Make some trades to see drawdown analysis.
        </div>
      </div>
    );
  }

  const ddClass =
    metrics.currentDrawdownPct < -10
      ? "text-destructive"
      : metrics.currentDrawdownPct < -5
      ? "text-amber-500"
      : "text-muted-foreground";

  const maxDdClass =
    metrics.maxDrawdownPct < -20
      ? "text-destructive"
      : metrics.maxDrawdownPct < -10
      ? "text-amber-500"
      : "text-green-500";

  return (
    <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">
          Drawdown Analysis
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Equity curve drawdowns over your trading history.
        </p>
      </div>

      {/* Underwater plot */}
      <UnderwaterPlot points={metrics.equityPoints} />

      {/* Metrics */}
      <div className="space-y-0">
        <MetricRow
          label="Max Drawdown"
          value={fmtPct(metrics.maxDrawdownPct)}
          valueClass={maxDdClass}
          sub={`Peak: ${fmtDollar(metrics.peakValue - INITIAL_CAPITAL)} from initial capital`}
        />
        <MetricRow
          label="Current Drawdown"
          value={
            metrics.currentDrawdownPct < -0.01
              ? fmtPct(metrics.currentDrawdownPct)
              : "None"
          }
          valueClass={ddClass}
        />
        <MetricRow
          label="Avg Drawdown Depth"
          value={
            metrics.drawdownPeriods > 0
              ? fmtPct(-metrics.avgDrawdownPct)
              : "—"
          }
          valueClass="text-muted-foreground"
        />
        <MetricRow
          label="Drawdown Periods"
          value={String(metrics.drawdownPeriods)}
          valueClass="text-foreground"
        />
        <MetricRow
          label="Avg Recovery Time"
          value={
            metrics.avgRecoveryTrades !== null
              ? `${metrics.avgRecoveryTrades.toFixed(1)} trades`
              : "N/A"
          }
          valueClass="text-foreground"
        />
      </div>

      {metrics.currentDrawdownPct >= -0.5 && (
        <div className="flex items-center gap-1.5 text-[11px] text-green-500">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          No active drawdown — portfolio at or near peak.
        </div>
      )}

      {metrics.maxDrawdownPct < -20 && (
        <div className="text-[11px] text-destructive/80 border border-destructive/20 rounded-md px-3 py-2 bg-destructive/5">
          Max drawdown exceeds 20%. Consider reducing position sizes or
          tightening stop losses to protect capital.
        </div>
      )}
    </div>
  );
}
