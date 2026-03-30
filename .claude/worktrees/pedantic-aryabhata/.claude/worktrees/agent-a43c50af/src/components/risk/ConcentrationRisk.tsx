"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";

// ── Slice colors ──────────────────────────────────────────────────────────────

const SLICE_COLORS = [
  "hsl(239 84% 67%)",  // indigo
  "hsl(199 89% 48%)",  // sky
  "hsl(38 92% 50%)",   // amber
  "hsl(142 71% 45%)",  // green
  "hsl(346 87% 61%)",  // rose
  "hsl(258 90% 66%)",  // violet
  "hsl(173 58% 39%)",  // teal
  "hsl(24 95% 55%)",   // orange
  "hsl(215 28% 57%)",  // slate-blue (cash)
];

// ── Donut chart ───────────────────────────────────────────────────────────────

interface Slice {
  ticker: string;
  pct: number;
  color: string;
}

function DonutChart({ slices, hhi }: { slices: Slice[]; hhi: number }) {
  const cx = 60;
  const cy = 60;
  const r = 46;
  const innerR = 26;
  const gap = 0.018;

  let cumAngle = -Math.PI / 2;
  const paths: { d: string; color: string }[] = [];

  for (const slice of slices) {
    if (slice.pct < 0.001) continue;
    const angleSpan = slice.pct * 2 * Math.PI - gap;
    const startAngle = cumAngle + gap / 2;
    const endAngle = startAngle + angleSpan;

    // Outer arc
    const ox1 = cx + r * Math.cos(startAngle);
    const oy1 = cy + r * Math.sin(startAngle);
    const ox2 = cx + r * Math.cos(endAngle);
    const oy2 = cy + r * Math.sin(endAngle);
    // Inner arc
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = angleSpan > Math.PI ? 1 : 0;

    const d = [
      `M ${ox1} ${oy1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${ox2} ${oy2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");

    paths.push({ d, color: slice.color });
    cumAngle += slice.pct * 2 * Math.PI;
  }

  const hhiLabel =
    hhi > 0.25 ? "High" : hhi > 0.15 ? "Moderate" : "Low";
  const hhiColor =
    hhi > 0.25
      ? "hsl(var(--destructive))"
      : hhi > 0.15
      ? "hsl(38 92% 50%)"
      : "hsl(142 71% 45%)";

  return (
    <div className="flex items-center gap-5">
      <svg width={120} height={120} viewBox="0 0 120 120" aria-label="Position concentration donut chart">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} />
        ))}
        {/* Center text */}
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          fontSize={9}
          fill="hsl(var(--muted-foreground))"
          fontFamily="inherit"
        >
          HHI
        </text>
        <text
          x={cx}
          y={cy + 7}
          textAnchor="middle"
          fontSize={13}
          fontWeight="600"
          fill={hhiColor}
          fontFamily="inherit"
        >
          {hhi.toFixed(3)}
        </text>
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          fontSize={8}
          fill={hhiColor}
          fontFamily="inherit"
        >
          {hhiLabel}
        </text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-sm shrink-0"
              style={{ background: s.color }}
            />
            <span className="text-[11px] text-muted-foreground">
              {s.ticker}
            </span>
            <span className="text-[11px] font-semibold tabular-nums ml-auto">
              {(s.pct * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar row ───────────────────────────────────────────────────────────────────

function WeightBar({
  ticker,
  pct,
  color,
  threshold,
}: {
  ticker: string;
  pct: number;
  color: string;
  threshold: number;
}) {
  const over = pct > threshold;
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px]">
        <span className={cn("font-medium", over ? "text-destructive" : "text-foreground")}>
          {ticker}
        </span>
        <span className={cn("tabular-nums font-semibold", over ? "text-destructive" : "text-muted-foreground")}>
          {(pct * 100).toFixed(1)}%
          {over && " — overweight"}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/30 relative overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(pct * 100, 100)}%`, background: color }}
        />
        {/* threshold marker */}
        <div
          className="absolute top-0 h-full w-px bg-border"
          style={{ left: `${threshold * 100}%` }}
        />
      </div>
    </div>
  );
}

// ── Suggestion chip ───────────────────────────────────────────────────────────

function Suggestion({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
      {text}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ConcentrationRisk() {
  const { positions, portfolioValue, cash } = useTradingStore((s) => ({
    positions: s.positions,
    portfolioValue: s.portfolioValue,
    cash: s.cash,
  }));

  const metrics = useMemo(() => {
    if (positions.length === 0) return null;

    const totalPosValue = positions.reduce(
      (sum, p) => sum + p.quantity * p.currentPrice,
      0,
    );
    if (totalPosValue <= 0) return null;

    const slices: Slice[] = positions.map((p, i) => {
      const posValue = p.quantity * p.currentPrice;
      return {
        ticker: p.ticker,
        pct: posValue / portfolioValue,
        color: SLICE_COLORS[i % (SLICE_COLORS.length - 1)],
      };
    });

    // Cash slice
    const cashPct = cash / portfolioValue;
    if (cashPct > 0.005) {
      slices.push({
        ticker: "CASH",
        pct: cashPct,
        color: SLICE_COLORS[SLICE_COLORS.length - 1],
      });
    }

    // Normalize so they sum to 1
    const total = slices.reduce((s, sl) => s + sl.pct, 0);
    const normalized = slices.map((sl) => ({ ...sl, pct: sl.pct / total }));

    // HHI = sum of squared weights (using equity weights, cash excluded)
    const equitySlices = normalized.filter((s) => s.ticker !== "CASH");
    const equityTotal = equitySlices.reduce((s, sl) => s + sl.pct, 0);
    const hhi =
      equityTotal > 0
        ? equitySlices.reduce(
            (sum, sl) => sum + (sl.pct / equityTotal) ** 2,
            0,
          )
        : 0;

    const largest = normalized.reduce(
      (max, s) => (s.pct > max.pct ? s : max),
      normalized[0],
    );

    const suggestions: string[] = [];
    if (hhi > 0.25) {
      suggestions.push(
        "HHI > 0.25 signals high concentration. Spread capital across more tickers.",
      );
    }
    if (largest.pct > 0.3) {
      suggestions.push(
        `${largest.ticker} is ${(largest.pct * 100).toFixed(0)}% of the portfolio — consider trimming to below 20%.`,
      );
    }
    if (equitySlices.length < 3 && equityTotal > 0.5) {
      suggestions.push(
        "Fewer than 3 positions. Add uncorrelated assets to improve diversification.",
      );
    }
    if (equitySlices.length === 0) {
      suggestions.push("No equity positions open. Add some positions to analyze concentration.");
    }
    if (suggestions.length === 0) {
      suggestions.push(
        "Concentration is within healthy bounds. Continue monitoring as positions grow.",
      );
    }

    return { slices: normalized, hhi, largest, suggestions, equitySlices };
  }, [positions, portfolioValue, cash]);

  const hhiRating =
    !metrics
      ? null
      : metrics.hhi > 0.25
      ? { label: "High Concentration Risk", color: "text-destructive" }
      : metrics.hhi > 0.15
      ? { label: "Moderate Concentration", color: "text-amber-500" }
      : { label: "Well Diversified", color: "text-green-500" };

  return (
    <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">
          Concentration Risk
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Herfindahl-Hirschman Index (HHI) and position weight analysis.
        </p>
      </div>

      {!metrics ? (
        <div className="flex items-start gap-2 text-xs text-muted-foreground py-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          No open positions. Open some trades to see concentration metrics.
        </div>
      ) : (
        <>
          {/* Donut + legend */}
          <DonutChart slices={metrics.slices} hhi={metrics.hhi} />

          {/* HHI rating */}
          {hhiRating && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium",
                metrics.hhi > 0.25
                  ? "border-destructive/30 bg-destructive/5 text-destructive"
                  : metrics.hhi > 0.15
                  ? "border-amber-500/30 bg-amber-500/5 text-amber-600"
                  : "border-green-500/30 bg-green-500/5 text-green-600",
              )}
            >
              {metrics.hhi > 0.25 ? (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              )}
              {hhiRating.label} — HHI {metrics.hhi.toFixed(3)}
              <span className="ml-auto text-[10px] font-normal text-muted-foreground">
                threshold: 0.25
              </span>
            </div>
          )}

          {/* Per-position weight bars */}
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Position Weights (20% threshold)
            </p>
            {metrics.slices
              .filter((s) => s.ticker !== "CASH")
              .map((s, i) => (
                <WeightBar
                  key={i}
                  ticker={s.ticker}
                  pct={s.pct}
                  color={s.color}
                  threshold={0.2}
                />
              ))}
          </div>

          {/* Suggestions */}
          <div className="space-y-1.5 border-t border-border/30 pt-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Recommendations
            </p>
            {metrics.suggestions.map((s, i) => (
              <Suggestion key={i} text={s} />
            ))}
          </div>

          {/* HHI formula note */}
          <p className="text-[10px] text-muted-foreground/60 font-mono">
            HHI = &Sigma;(weight&sup2;) across equity positions.
            Range: 1/n (perfectly diversified) to 1.0 (fully concentrated).
          </p>
        </>
      )}
    </div>
  );
}
