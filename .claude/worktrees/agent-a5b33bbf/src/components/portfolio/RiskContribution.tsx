"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { computeRiskContributions } from "@/services/portfolio/optimizer";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPct(v: number, decimals = 1): string {
  return `${v.toFixed(decimals)}%`;
}

// ─── Colour scale ─────────────────────────────────────────────────────────────

function contributionColor(pct: number): string {
  // 0–20%: blue; 20–40%: amber; 40%+: red
  if (pct < 20) return "hsl(220, 70%, 55%)";
  if (pct < 40) return "hsl(35, 90%, 55%)";
  return "hsl(0, 72%, 55%)";
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RiskContributionProps {
  /** Tickers in the portfolio */
  tickers: string[];
  /** Portfolio weights per ticker (0..1, should sum to 1) */
  weights: number[];
  /** Annualised covariance matrix (n×n) */
  covMatrix: number[][];
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RiskContribution({ tickers, weights, covMatrix }: RiskContributionProps) {
  const contributions = useMemo(
    () => computeRiskContributions(tickers, weights, covMatrix),
    [tickers, weights, covMatrix],
  );

  // Sort by risk contribution descending
  const sorted = useMemo(
    () => [...contributions].sort((a, b) => b.contributionPct - a.contributionPct),
    [contributions],
  );

  // Portfolio-level risk (annualised std-dev)
  const portRisk = useMemo(() => {
    let v = 0;
    const n = weights.length;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) v += weights[i] * weights[j] * covMatrix[i][j];
    return Math.sqrt(Math.max(0, v));
  }, [weights, covMatrix]);

  const totalContribPct = sorted.reduce((s, r) => s + r.contributionPct, 0);

  if (sorted.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
        No positions to analyse
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Portfolio-level summary */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <SummaryChip
          label="Portfolio Volatility"
          value={fmtPct(portRisk * 100)}
          subLabel="annualised"
          color="text-foreground"
        />
        <SummaryChip
          label="Largest Contributor"
          value={sorted[0]?.ticker ?? "—"}
          subLabel={fmtPct(sorted[0]?.contributionPct ?? 0) + " of total risk"}
          color={contributionColor(sorted[0]?.contributionPct ?? 0)}
        />
        <SummaryChip
          label="Positions Analysed"
          value={`${sorted.length}`}
          subLabel="open positions"
          color="text-foreground"
        />
      </div>

      {/* Bar chart */}
      <div className="space-y-2">
        <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Risk Contribution per Position
        </div>
        {sorted.map((rc) => {
          const color = contributionColor(rc.contributionPct);
          const isConcentrated = rc.contributionPct > 30 && rc.weight < rc.contributionPct / 100 * 0.75;

          return (
            <div key={rc.ticker} className="space-y-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-10 font-mono font-semibold">{rc.ticker}</span>
                  {isConcentrated && (
                    <span className="rounded bg-amber-500/12 px-1 py-0.5 text-[9px] font-medium text-amber-400 uppercase">
                      concentrated
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span className="w-14 text-right text-muted-foreground font-mono">
                    {fmtPct(rc.weight * 100)} capital
                  </span>
                  <span className="w-14 text-right font-mono font-semibold" style={{ color }}>
                    {fmtPct(rc.contributionPct)} risk
                  </span>
                </div>
              </div>

              {/* Dual bar: capital weight vs risk contribution */}
              <div className="relative h-5 rounded overflow-hidden bg-muted/40">
                {/* Capital weight bar (background) */}
                <div
                  className="absolute left-0 top-0 h-full rounded opacity-30"
                  style={{
                    width: `${Math.min(rc.weight * 100, 100).toFixed(1)}%`,
                    backgroundColor: "hsl(var(--muted-foreground))",
                  }}
                />
                {/* Risk contribution bar (foreground) */}
                <div
                  className="absolute left-0 top-0 h-full rounded opacity-80"
                  style={{
                    width: `${Math.min(rc.contributionPct, 100).toFixed(1)}%`,
                    backgroundColor: color,
                  }}
                />
                {/* Label inside bar */}
                {rc.contributionPct > 8 && (
                  <span
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-white"
                    style={{ pointerEvents: "none" }}
                  >
                    {fmtPct(rc.contributionPct)}
                  </span>
                )}
              </div>

              {/* Narrative insight */}
              <InsightLine rc={rc} />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-muted-foreground/30 shrink-0" />
          Capital weight
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-blue-500 shrink-0" />
          Risk contribution
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-amber-500 shrink-0" />
          Elevated
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-red-500 shrink-0" />
          High
        </div>
      </div>

      {/* SVG summary chart */}
      <RiskPieChart contributions={sorted} />

      {/* Insight box */}
      <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-[11px] text-muted-foreground space-y-1">
        <p>
          <span className="font-medium text-foreground">Risk attribution insight: </span>
          {sorted[0]
            ? `${sorted[0].ticker} contributes ${fmtPct(sorted[0].contributionPct)} of total portfolio risk while representing only ${fmtPct(sorted[0].weight * 100)} of capital.`
            : "No positions."}
        </p>
        {sorted.length > 1 && (() => {
          const top2Pct = sorted[0].contributionPct + sorted[1].contributionPct;
          return top2Pct > 60 ? (
            <p>
              The top 2 positions ({sorted[0].ticker} &amp; {sorted[1].ticker}) account for{" "}
              <span className="font-medium text-amber-400">{fmtPct(top2Pct)}</span> of portfolio risk.
              Consider reducing concentration.
            </p>
          ) : null;
        })()}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryChip({
  label,
  value,
  subLabel,
  color,
}: {
  label: string;
  value: string;
  subLabel: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono text-sm font-semibold tabular-nums", color)}>{value}</div>
      <div className="text-[9px] text-muted-foreground/70 mt-0.5">{subLabel}</div>
    </div>
  );
}

function InsightLine({ rc }: { rc: ReturnType<typeof computeRiskContributions>[number] }) {
  const capitalPct = rc.weight * 100;
  const ratio = capitalPct > 0 ? rc.contributionPct / capitalPct : 1;

  if (ratio > 1.5) {
    return (
      <p className="text-[9px] text-amber-400/80">
        Contributes {(ratio).toFixed(1)}x more risk than its capital weight suggests.
      </p>
    );
  }
  if (ratio < 0.6) {
    return (
      <p className="text-[9px] text-blue-400/70">
        Acts as a risk diversifier — contributes less risk than its weight.
      </p>
    );
  }
  return null;
}

// ─── Mini donut chart ─────────────────────────────────────────────────────────

function RiskPieChart({
  contributions,
}: {
  contributions: ReturnType<typeof computeRiskContributions>;
}) {
  const cx = 80;
  const cy = 80;
  const R = 60;
  const r = 36;

  const total = contributions.reduce((s, c) => s + c.contributionPct, 0);
  if (total <= 0) return null;

  let cursor = -Math.PI / 2;
  const slices = contributions.map((rc, idx) => {
    const angle = (rc.contributionPct / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(cursor);
    const y1 = cy + R * Math.sin(cursor);
    const ix1 = cx + r * Math.cos(cursor);
    const iy1 = cy + r * Math.sin(cursor);
    cursor += angle;
    const x2 = cx + R * Math.cos(cursor);
    const y2 = cy + R * Math.sin(cursor);
    const ix2 = cx + r * Math.cos(cursor);
    const iy2 = cy + r * Math.sin(cursor);
    const large = angle > Math.PI ? 1 : 0;

    const d =
      angle < 0.001
        ? ""
        : `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${ix2.toFixed(2)} ${iy2.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`;

    const color = contributionColor(rc.contributionPct);
    return { d, color, ticker: rc.ticker, pct: rc.contributionPct, idx };
  });

  return (
    <div className="flex items-center gap-6">
      <svg
        width={160}
        height={160}
        viewBox="0 0 160 160"
        aria-label="Risk contribution donut chart"
        className="shrink-0"
      >
        {/* Background track */}
        <circle
          cx={cx} cy={cy}
          r={(R + r) / 2}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={R - r}
          opacity={0.3}
        />
        {slices.map(({ d, color, idx }) =>
          d ? (
            <path
              key={idx}
              d={d}
              fill={color}
              stroke="hsl(var(--background))"
              strokeWidth={1.5}
              opacity={0.85}
            />
          ) : null,
        )}
        <text
          x={cx} y={cy - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={8}
          fill="hsl(var(--muted-foreground))"
          style={{ userSelect: "none" }}
        >
          Portfolio
        </text>
        <text
          x={cx} y={cy + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={9}
          fontWeight={700}
          fill="hsl(var(--foreground))"
          fontFamily="monospace"
          style={{ userSelect: "none" }}
        >
          Risk
        </text>
      </svg>

      {/* Legend */}
      <div className="space-y-1 text-[11px]">
        {slices.map(({ ticker, pct, color }) => (
          <div key={ticker} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono font-medium w-8">{ticker}</span>
            <span className="font-mono text-muted-foreground tabular-nums">
              {pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
