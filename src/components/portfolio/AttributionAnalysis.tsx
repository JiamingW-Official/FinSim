"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Info, ChevronDown, ChevronUp } from "lucide-react";

// ─── mulberry32 PRNG (seed = 7777) ────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectorRow {
  sector: string;
  portfolioWeight: number;   // wp
  benchmarkWeight: number;   // wb
  portfolioReturn: number;   // rp
  benchmarkReturn: number;   // rb
  allocationEffect: number;  // (wp - wb) * (rb - Rb)
  selectionEffect: number;   // wb * (rp - rb)
  interactionEffect: number; // (wp - wb) * (rp - rb)
  totalContribution: number; // sum of 3 effects
}

interface Factor {
  name: string;
  loading: number;           // factor exposure
  factorReturn: number;      // factor return (annualised %)
  contribution: number;      // loading × factorReturn
  activeBet: number;         // loading vs benchmark loading
}

interface RollingPoint {
  day: number;
  alpha: number;
  beta: number;
  sharpe: number;
  infoRatio: number;
}

interface VaRPosition {
  ticker: string;
  weight: number;
  componentVaR: number;
  marginalVaR: number;
  corrContrib: number;       // positive = diversifying, negative = concentrating
}

// ─── Synthetic data generation ────────────────────────────────────────────────

const SECTORS = [
  "Technology",
  "Healthcare",
  "Financials",
  "Consumer Disc.",
  "Industrials",
  "Communication",
  "Consumer Stapl.",
  "Energy",
  "Materials",
  "Utilities",
  "Real Estate",
];

// Benchmark weights (S&P 500 approximation)
const BENCHMARK_WEIGHTS: Record<string, number> = {
  "Technology":     0.285,
  "Healthcare":     0.125,
  "Financials":     0.130,
  "Consumer Disc.": 0.105,
  "Industrials":    0.085,
  "Communication":  0.085,
  "Consumer Stapl.": 0.060,
  "Energy":         0.040,
  "Materials":      0.025,
  "Utilities":      0.025,
  "Real Estate":    0.030,
};

function generateAttributionData(rand: () => number): SectorRow[] {
  // Portfolio slightly overweights tech, underweights utilities
  const portfolioWeightAdjustments: Record<string, number> = {
    "Technology":     +0.10,   // heavy overweight
    "Healthcare":     +0.02,
    "Financials":     -0.01,
    "Consumer Disc.": +0.03,
    "Industrials":    -0.02,
    "Communication":  +0.01,
    "Consumer Stapl.": -0.02,
    "Energy":         -0.02,
    "Materials":      -0.02,
    "Utilities":      -0.04,   // underweight
    "Real Estate":    -0.03,
  };

  // Overall benchmark return
  const Rb = 0.112; // 11.2% benchmark total return

  return SECTORS.map((sector) => {
    const wb = BENCHMARK_WEIGHTS[sector];
    const adj = portfolioWeightAdjustments[sector] ?? 0;
    const wp = Math.max(0.005, wb + adj + (rand() - 0.5) * 0.01);

    // Sector returns: tech outperforms, utilities lag
    const baseSectorReturn: Record<string, number> = {
      "Technology":     0.22 + (rand() - 0.5) * 0.04,
      "Healthcare":     0.09 + (rand() - 0.5) * 0.04,
      "Financials":     0.14 + (rand() - 0.5) * 0.04,
      "Consumer Disc.": 0.13 + (rand() - 0.5) * 0.04,
      "Industrials":    0.10 + (rand() - 0.5) * 0.03,
      "Communication":  0.17 + (rand() - 0.5) * 0.04,
      "Consumer Stapl.": 0.04 + (rand() - 0.5) * 0.02,
      "Energy":         0.08 + (rand() - 0.5) * 0.06,
      "Materials":      0.07 + (rand() - 0.5) * 0.03,
      "Utilities":     -0.02 + (rand() - 0.5) * 0.03,
      "Real Estate":    0.03 + (rand() - 0.5) * 0.03,
    };

    const rb = baseSectorReturn[sector] ?? 0.10;
    // Portfolio slightly better stock selection in tech/comm, worse elsewhere
    const selectionAlpha: Record<string, number> = {
      "Technology":     +0.04,
      "Communication":  +0.02,
      "Healthcare":     +0.01,
      "Financials":     -0.01,
      "Consumer Disc.": +0.02,
    };
    const rp = rb + (selectionAlpha[sector] ?? 0) + (rand() - 0.5) * 0.02;

    const allocationEffect = (wp - wb) * (rb - Rb);
    const selectionEffect = wb * (rp - rb);
    const interactionEffect = (wp - wb) * (rp - rb);
    const totalContribution = allocationEffect + selectionEffect + interactionEffect;

    return {
      sector,
      portfolioWeight: wp,
      benchmarkWeight: wb,
      portfolioReturn: rp,
      benchmarkReturn: rb,
      allocationEffect,
      selectionEffect,
      interactionEffect,
      totalContribution,
    };
  });
}

function generateFactors(rand: () => number): Factor[] {
  const factors = [
    { name: "Market Beta",  bmLoading: 1.00, factorReturn: 0.112 },
    { name: "Size (SMB)",   bmLoading: 0.00, factorReturn: 0.028 },
    { name: "Value (HML)",  bmLoading: 0.00, factorReturn: 0.018 },
    { name: "Momentum (MOM)", bmLoading: 0.00, factorReturn: 0.085 },
    { name: "Quality (QMJ)", bmLoading: 0.00, factorReturn: 0.042 },
  ];

  // Portfolio tilts: high beta, small-cap bias, growth (anti-value), strong momentum, good quality
  const loadings = [1.18, -0.22, -0.35, 0.48, 0.31];

  return factors.map((f, i) => {
    const loading = loadings[i] + (rand() - 0.5) * 0.05;
    const factorReturn = f.factorReturn + (rand() - 0.5) * 0.01;
    const contribution = loading * factorReturn;
    const activeBet = loading - f.bmLoading;
    return { name: f.name, loading, factorReturn, contribution, activeBet };
  });
}

function generateRolling(rand: () => number): RollingPoint[] {
  const points: RollingPoint[] = [];
  let alpha = 0.018;
  let beta = 1.15;
  let sharpe = 1.2;
  let ir = 0.65;

  for (let day = 90; day <= 252; day++) {
    alpha += (rand() - 0.48) * 0.003;
    beta  += (rand() - 0.50) * 0.02;
    sharpe += (rand() - 0.48) * 0.04;
    ir    += (rand() - 0.48) * 0.03;

    alpha = Math.max(-0.05, Math.min(0.08, alpha));
    beta  = Math.max(0.7, Math.min(1.6, beta));
    sharpe = Math.max(-0.5, Math.min(2.5, sharpe));
    ir    = Math.max(-1.0, Math.min(1.8, ir));

    points.push({ day, alpha, beta, sharpe, infoRatio: ir });
  }
  return points;
}

function generateVaR(rand: () => number): VaRPosition[] {
  const tickers = ["AAPL", "NVDA", "MSFT", "TSLA", "AMZN", "GOOG", "JPM", "META"];
  const weights = [0.22, 0.18, 0.15, 0.12, 0.10, 0.09, 0.08, 0.06];

  return tickers.map((ticker, i) => {
    const weight = weights[i];
    const vol = 0.18 + rand() * 0.30;
    const componentVaR = weight * vol * 1.645 * Math.sqrt(1 / 252); // 1-day 95% VaR
    const marginalVaR = componentVaR / weight * (1 + (rand() - 0.5) * 0.1);
    // Corr contribution: negative means diversifying
    const corrContrib = i < 4 ? rand() * 0.3 - 0.1 : -(rand() * 0.15);
    return { ticker, weight, componentVaR, marginalVaR, corrContrib };
  });
}

// ─── Helper formatters ────────────────────────────────────────────────────────

function pct(v: number, decimals = 2) {
  return `${v >= 0 ? "+" : ""}${(v * 100).toFixed(decimals)}%`;
}

function effectColor(v: number) {
  return v >= 0 ? "text-emerald-400" : "text-red-400";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-2 mb-3">
      <div>
        <h3 className="text-xs font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Section 1: Performance Attribution ──────────────────────────────────────

function PerformanceAttributionSection({ rows }: { rows: SectorRow[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayRows = showAll ? rows : rows.slice(0, 6);

  const totals = rows.reduce(
    (acc, r) => ({
      allocationEffect: acc.allocationEffect + r.allocationEffect,
      selectionEffect: acc.selectionEffect + r.selectionEffect,
      interactionEffect: acc.interactionEffect + r.interactionEffect,
      totalContribution: acc.totalContribution + r.totalContribution,
    }),
    { allocationEffect: 0, selectionEffect: 0, interactionEffect: 0, totalContribution: 0 }
  );

  // SVG stacked bar chart
  const svgW = 560;
  const svgH = 120;
  const padL = 100;
  const padR = 16;
  const padT = 12;
  const padB = 28;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.totalContribution)), 0.01);
  const xScale = (v: number) => (v / maxAbs) * (chartW / 2);
  const midX = padL + chartW / 2;
  const barH = Math.max(4, chartH / rows.length - 2);

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4 space-y-4">
      <SectionHeader
        title="Section 1 — Brinson-Hood-Beebower Attribution"
        subtitle="Decomposes active return into allocation, selection, and interaction effects by GICS sector"
      />

      {/* Summary chips */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Allocation", value: totals.allocationEffect, color: "bg-primary/10 text-primary" },
          { label: "Selection", value: totals.selectionEffect, color: "bg-primary/10 text-primary" },
          { label: "Interaction", value: totals.interactionEffect, color: "bg-amber-500/10 text-amber-400" },
          { label: "Total Active", value: totals.totalContribution, color: totals.totalContribution >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400" },
        ].map((chip) => (
          <div key={chip.label} className={cn("rounded-md p-2 text-center", chip.color.split(" ")[0])}>
            <p className="text-[11px] text-muted-foreground mb-0.5">{chip.label}</p>
            <p className={cn("text-xs font-bold tabular-nums", chip.color.split(" ")[1])}>
              {pct(chip.value)}
            </p>
          </div>
        ))}
      </div>

      {/* SVG stacked bar — active return by sector */}
      <div>
        <p className="text-xs text-muted-foreground mb-1">Total Contribution by Sector</p>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: svgH }}>
          {/* Zero line */}
          <line x1={midX} y1={padT} x2={midX} y2={padT + chartH} stroke="hsl(var(--border))" strokeWidth={1} />

          {rows.map((r, i) => {
            const y = padT + i * (chartH / rows.length) + 1;
            const w = xScale(r.totalContribution);
            const x = r.totalContribution >= 0 ? midX : midX + w;
            return (
              <g key={r.sector}>
                <rect
                  x={x}
                  y={y}
                  width={Math.abs(w)}
                  height={barH}
                  fill={r.totalContribution >= 0 ? "#34d399" : "#f87171"}
                  opacity={0.8}
                  rx={1}
                />
                <text
                  x={padL - 4}
                  y={y + barH / 2 + 1}
                  textAnchor="end"
                  fontSize={7}
                  fill="hsl(var(--muted-foreground))"
                  dominantBaseline="middle"
                >
                  {r.sector.length > 12 ? r.sector.slice(0, 12) + "…" : r.sector}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {[-maxAbs, -maxAbs / 2, 0, maxAbs / 2, maxAbs].map((v) => (
            <text
              key={v}
              x={midX + xScale(v)}
              y={padT + chartH + 10}
              textAnchor="middle"
              fontSize={7}
              fill="hsl(var(--muted-foreground))"
            >
              {pct(v, 1)}
            </text>
          ))}
        </svg>
      </div>

      {/* Attribution table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/50">
              {["Sector", "Wt%", "Bm%", "Rp%", "Rb%", "Alloc", "Select", "Interact", "Total"].map((h) => (
                <th key={h} className="text-right first:text-left py-1 px-1 text-muted-foreground font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((r) => (
              <tr key={r.sector} className="border-b border-border/20 hover:bg-muted/20">
                <td className="py-1 px-1 font-medium whitespace-nowrap">{r.sector}</td>
                <td className="py-1 px-1 text-right tabular-nums">{(r.portfolioWeight * 100).toFixed(1)}</td>
                <td className="py-1 px-1 text-right tabular-nums text-muted-foreground">{(r.benchmarkWeight * 100).toFixed(1)}</td>
                <td className={cn("py-1 px-1 text-right tabular-nums", effectColor(r.portfolioReturn))}>{pct(r.portfolioReturn, 1)}</td>
                <td className="py-1 px-1 text-right tabular-nums text-muted-foreground">{pct(r.benchmarkReturn, 1)}</td>
                <td className={cn("py-1 px-1 text-right tabular-nums", effectColor(r.allocationEffect))}>{pct(r.allocationEffect, 2)}</td>
                <td className={cn("py-1 px-1 text-right tabular-nums", effectColor(r.selectionEffect))}>{pct(r.selectionEffect, 2)}</td>
                <td className={cn("py-1 px-1 text-right tabular-nums", effectColor(r.interactionEffect))}>{pct(r.interactionEffect, 2)}</td>
                <td className={cn("py-1 px-1 text-right tabular-nums font-semibold", effectColor(r.totalContribution))}>{pct(r.totalContribution, 2)}</td>
              </tr>
            ))}
            {/* Totals row */}
            <tr className="border-t border-border/40 bg-muted/20">
              <td className="py-1 px-1 font-semibold">Total</td>
              <td colSpan={4} />
              <td className={cn("py-1 px-1 text-right tabular-nums font-semibold", effectColor(totals.allocationEffect))}>{pct(totals.allocationEffect, 2)}</td>
              <td className={cn("py-1 px-1 text-right tabular-nums font-semibold", effectColor(totals.selectionEffect))}>{pct(totals.selectionEffect, 2)}</td>
              <td className={cn("py-1 px-1 text-right tabular-nums font-semibold", effectColor(totals.interactionEffect))}>{pct(totals.interactionEffect, 2)}</td>
              <td className={cn("py-1 px-1 text-right tabular-nums font-bold text-sm", effectColor(totals.totalContribution))}>{pct(totals.totalContribution, 2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {rows.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          {showAll ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {showAll ? "Show less" : `Show all ${rows.length} sectors`}
        </button>
      )}
    </div>
  );
}

// ─── Section 2: Factor Exposure ───────────────────────────────────────────────

function FactorExposureSection({ factors }: { factors: Factor[] }) {
  const maxLoading = Math.max(...factors.map((f) => Math.abs(f.loading)), 0.1);
  const totalR2 = Math.min(0.97, factors.reduce((s, f) => s + Math.abs(f.contribution) * 0.8, 0));

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4 space-y-4">
      <SectionHeader
        title="Section 2 — Factor Exposure (Fama-French + Momentum)"
        subtitle="Portfolio factor loadings, active tilts vs benchmark, and factor return contribution"
      />

      {/* R-squared chip */}
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 px-2 py-1">
          <span className="text-[11px] text-muted-foreground">Factor R²</span>
          <span className="ml-1.5 text-xs font-bold text-primary">{(totalR2 * 100).toFixed(1)}%</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {(totalR2 * 100).toFixed(0)}% of portfolio variance explained by 5 systematic factors
        </p>
      </div>

      {/* Horizontal bar chart — factor loadings */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Factor Loadings</p>
        {factors.map((f) => {
          const barPct = Math.abs(f.loading) / maxLoading;
          const isPos = f.loading >= 0;
          return (
            <div key={f.name} className="grid grid-cols-[110px_1fr_60px_60px] gap-2 items-center">
              <span className="text-xs text-muted-foreground truncate">{f.name}</span>
              <div className="h-3 bg-muted/30 rounded-full overflow-hidden relative flex items-center">
                <div
                  className={cn(
                    "absolute h-full rounded-full transition-all",
                    isPos ? "left-1/2 bg-primary/60" : "right-1/2 bg-amber-500/60"
                  )}
                  style={{ width: `${barPct * 50}%` }}
                />
                {/* center divider */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/60" />
              </div>
              <span className={cn("text-xs text-right tabular-nums font-medium", isPos ? "text-primary" : "text-amber-400")}>
                {f.loading.toFixed(2)}
              </span>
              <span className={cn("text-xs text-right tabular-nums", effectColor(f.contribution))}>
                {pct(f.contribution, 2)}
              </span>
            </div>
          );
        })}
        <div className="grid grid-cols-[110px_1fr_60px_60px] gap-2 text-[11px] text-muted-foreground/60 mt-1">
          <span />
          <span className="text-center">Loading (negative ← 0 → positive)</span>
          <span className="text-right">Loading</span>
          <span className="text-right">Contrib</span>
        </div>
      </div>

      {/* Active bets table */}
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-2">Active Factor Bets vs Benchmark</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/50">
                {["Factor", "Portfolio Loading", "Benchmark Loading", "Active Bet", "Factor Return", "Return Contrib."].map((h) => (
                  <th key={h} className="text-right first:text-left py-1 px-1.5 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {factors.map((f) => (
                <tr key={f.name} className="border-b border-border/20 hover:bg-muted/20">
                  <td className="py-1 px-1.5 font-medium">{f.name}</td>
                  <td className={cn("py-1 px-1.5 text-right tabular-nums", f.loading >= 0 ? "text-primary" : "text-amber-400")}>
                    {f.loading.toFixed(2)}
                  </td>
                  <td className="py-1 px-1.5 text-right tabular-nums text-muted-foreground">
                    {(f.loading - f.activeBet).toFixed(2)}
                  </td>
                  <td className={cn("py-1 px-1.5 text-right tabular-nums", effectColor(f.activeBet))}>
                    {f.activeBet >= 0 ? "+" : ""}{f.activeBet.toFixed(2)}
                  </td>
                  <td className={cn("py-1 px-1.5 text-right tabular-nums", effectColor(f.factorReturn))}>
                    {pct(f.factorReturn, 1)}
                  </td>
                  <td className={cn("py-1 px-1.5 text-right tabular-nums font-semibold", effectColor(f.contribution))}>
                    {pct(f.contribution, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Section 3: Rolling Performance ──────────────────────────────────────────

type RollingMetric = "alpha" | "beta" | "sharpe" | "infoRatio";

function RollingPerformanceSection({ points }: { points: RollingPoint[] }) {
  const [activeMetric, setActiveMetric] = useState<RollingMetric>("alpha");

  const metrics: { key: RollingMetric; label: string; color: string }[] = [
    { key: "alpha", label: "Alpha", color: "#34d399" },
    { key: "beta",  label: "Beta",  color: "#60a5fa" },
    { key: "sharpe", label: "Sharpe", color: "#a78bfa" },
    { key: "infoRatio", label: "Info Ratio", color: "#f59e0b" },
  ];

  const values = points.map((p) => p[activeMetric]);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const svgW = 560;
  const svgH = 140;
  const padL = 44;
  const padR = 12;
  const padT = 12;
  const padB = 24;
  const cW = svgW - padL - padR;
  const cH = svgH - padT - padB;

  const xOf = (i: number) => padL + (i / (points.length - 1)) * cW;
  const yOf = (v: number) => padT + cH - ((v - minV) / range) * cH;

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(p[activeMetric]).toFixed(1)}`)
    .join(" ");

  const zeroY = yOf(0);
  const isZeroInRange = minV < 0 && maxV > 0;

  // Consistency score (alpha): % of rolling periods with positive alpha
  const alphaPositivePct = (points.filter((p) => p.alpha > 0).length / points.length) * 100;

  // Regime analysis
  const midDay = Math.round((points[0].day + points[points.length - 1].day) / 2);
  const upMktPoints = points.filter((p) => p.day <= midDay);
  const dnMktPoints = points.filter((p) => p.day > midDay);
  const upAlpha = upMktPoints.reduce((s, p) => s + p.alpha, 0) / upMktPoints.length;
  const dnAlpha = dnMktPoints.reduce((s, p) => s + p.alpha, 0) / dnMktPoints.length;

  const activeColor = metrics.find((m) => m.key === activeMetric)?.color ?? "#34d399";

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4 space-y-4">
      <SectionHeader
        title="Section 3 — Rolling Performance (90-day window)"
        subtitle="3-month rolling alpha, beta, Sharpe ratio, and information ratio over 252 trading days"
      />

      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md bg-emerald-500/10 p-2">
          <p className="text-[11px] text-muted-foreground">Consistency Score</p>
          <p className="text-xs font-bold text-emerald-400 tabular-nums">{alphaPositivePct.toFixed(0)}%</p>
          <p className="text-[11px] text-muted-foreground">rolling periods w/ positive alpha</p>
        </div>
        <div className="rounded-md bg-primary/10 p-2">
          <p className="text-[11px] text-muted-foreground">Up-Mkt Alpha (avg)</p>
          <p className={cn("text-xs font-bold tabular-nums", effectColor(upAlpha))}>{pct(upAlpha, 2)}</p>
          <p className="text-[11px] text-muted-foreground">first half of period</p>
        </div>
        <div className="rounded-md bg-amber-500/10 p-2">
          <p className="text-[11px] text-muted-foreground">Dn-Mkt Alpha (avg)</p>
          <p className={cn("text-xs font-bold tabular-nums", effectColor(dnAlpha))}>{pct(dnAlpha, 2)}</p>
          <p className="text-[11px] text-muted-foreground">second half of period</p>
        </div>
      </div>

      {/* Metric selector */}
      <div className="flex gap-1.5 flex-wrap">
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            className={cn(
              "rounded px-2 py-0.5 text-xs font-medium transition-colors",
              activeMetric === m.key
                ? "bg-primary/20 text-primary"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* SVG line chart */}
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: svgH }}>
        {/* Zero line */}
        {isZeroInRange && (
          <line x1={padL} y1={zeroY} x2={padL + cW} y2={zeroY} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="4,2" />
        )}

        {/* Y grid */}
        {[0, 0.25, 0.5, 0.75, 1.0].map((t) => {
          const v = minV + t * range;
          const y = padT + (1 - t) * cH;
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={padL + cW} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} opacity={0.4} />
              <text x={padL - 4} y={y + 1} textAnchor="end" fontSize={7} fill="hsl(var(--muted-foreground))" dominantBaseline="middle">
                {activeMetric === "alpha" ? pct(v, 1) : v.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Path */}
        <path d={pathD} fill="none" stroke={activeColor} strokeWidth={1.5} />

        {/* X axis labels */}
        {[0, 0.25, 0.5, 0.75, 1.0].map((t, i) => {
          const idx = Math.round(t * (points.length - 1));
          const p = points[idx];
          return (
            <text key={i} x={xOf(idx)} y={svgH - 4} textAnchor="middle" fontSize={7} fill="hsl(var(--muted-foreground))">
              Day {p.day}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Section 4: Risk Attribution ──────────────────────────────────────────────

function RiskAttributionSection({ varPositions }: { varPositions: VaRPosition[] }) {
  const totalPortfolioVaR = varPositions.reduce((s, p) => s + p.componentVaR, 0) * 0.72; // diversification benefit
  const sumIndividualVaR = varPositions.reduce((s, p) => s + p.componentVaR, 0);
  const divBenefit = sumIndividualVaR - totalPortfolioVaR;
  const divBenefitPct = (divBenefit / sumIndividualVaR) * 100;

  const svgW = 560;
  const svgH = 100;
  const padL = 60;
  const padR = 12;
  const cW = svgW - padL - padR;
  const barH = 16;
  const barSpacing = 20;

  const maxVaR = Math.max(...varPositions.map((p) => p.componentVaR));

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4 space-y-4">
      <SectionHeader
        title="Section 4 — Risk Attribution (Component VaR)"
        subtitle="1-day 95% VaR decomposed by position; marginal VaR shows incremental risk of adding 1 more share"
      />

      {/* Diversification summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md bg-rose-500/10 p-2">
          <p className="text-[11px] text-muted-foreground">Portfolio VaR (95%)</p>
          <p className="text-xs font-bold text-rose-400 tabular-nums">{pct(totalPortfolioVaR, 3)}</p>
          <p className="text-[11px] text-muted-foreground">1-day at 95% confidence</p>
        </div>
        <div className="rounded-md bg-primary/10 p-2">
          <p className="text-[11px] text-muted-foreground">Sum of Individual VaRs</p>
          <p className="text-xs font-bold text-primary tabular-nums">{pct(sumIndividualVaR, 3)}</p>
          <p className="text-[11px] text-muted-foreground">undiversified VaR</p>
        </div>
        <div className="rounded-md bg-emerald-500/10 p-2">
          <p className="text-[11px] text-muted-foreground">Diversification Benefit</p>
          <p className="text-xs font-bold text-emerald-400 tabular-nums">{divBenefitPct.toFixed(1)}%</p>
          <p className="text-[11px] text-muted-foreground">reduction from correlation</p>
        </div>
      </div>

      {/* Stacked component VaR bar chart */}
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-2">Component VaR by Position</p>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: svgH }}>
          {varPositions.map((p, i) => {
            const y = i * barSpacing + 4;
            const w = (p.componentVaR / maxVaR) * cW;
            const hue = p.corrContrib >= 0 ? "#f87171" : "#34d399";
            return (
              <g key={p.ticker}>
                <rect x={padL} y={y} width={w} height={barH} fill={hue} opacity={0.7} rx={2} />
                <text x={padL - 4} y={y + barH / 2 + 1} textAnchor="end" fontSize={8} fill="hsl(var(--foreground))" dominantBaseline="middle" fontWeight={600}>
                  {p.ticker}
                </text>
                <text x={padL + w + 4} y={y + barH / 2 + 1} textAnchor="start" fontSize={7} fill="hsl(var(--muted-foreground))" dominantBaseline="middle">
                  {pct(p.componentVaR, 3)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* VaR table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/50">
              {["Ticker", "Weight", "Component VaR", "Marginal VaR", "Corr Contribution", "Role"].map((h) => (
                <th key={h} className="text-right first:text-left py-1 px-1.5 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {varPositions.map((p) => (
              <tr key={p.ticker} className="border-b border-border/20 hover:bg-muted/20">
                <td className="py-1 px-1.5 font-semibold">{p.ticker}</td>
                <td className="py-1 px-1.5 text-right tabular-nums">{(p.weight * 100).toFixed(1)}%</td>
                <td className="py-1 px-1.5 text-right tabular-nums text-rose-400">{pct(p.componentVaR, 3)}</td>
                <td className="py-1 px-1.5 text-right tabular-nums text-amber-400">{pct(p.marginalVaR, 3)}</td>
                <td className={cn("py-1 px-1.5 text-right tabular-nums", effectColor(-p.corrContrib))}>
                  {p.corrContrib >= 0 ? "+" : ""}{(p.corrContrib * 100).toFixed(2)}%
                </td>
                <td className="py-1 px-1.5 text-right">
                  <span className={cn(
                    "rounded px-1 py-0.5 text-[11px] font-medium",
                    p.corrContrib < 0
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  )}>
                    {p.corrContrib < 0 ? "Diversifying" : "Concentrating"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-md bg-muted/20 p-2 text-xs text-muted-foreground">
        <span className="text-foreground font-medium">How to read:</span> Component VaR = position&apos;s contribution to total portfolio VaR.
        Marginal VaR = extra risk from adding 1 more share. Diversifying positions (green) reduce overall portfolio risk through low/negative correlation.
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function AttributionAnalysis() {
  const rand = useMemo(() => mulberry32(7777), []);

  const { rows, factors, rollingPoints, varPositions } = useMemo(() => {
    // Reset rand deterministically by creating a fresh PRNG instance each render
    const r = mulberry32(7777);
    return {
      rows: generateAttributionData(r),
      factors: generateFactors(r),
      rollingPoints: generateRolling(r),
      varPositions: generateVaR(r),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="rounded-lg border border-border/40 bg-primary/5 p-3">
        <div className="flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-primary">Portfolio Attribution Analysis</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive attribution using the Brinson-Hood-Beebower model, Fama-French 5-factor analysis,
              rolling performance metrics, and component VaR decomposition. Synthetic data seeded for demo purposes.
            </p>
          </div>
        </div>
      </div>

      <PerformanceAttributionSection rows={rows} />
      <FactorExposureSection factors={factors} />
      <RollingPerformanceSection points={rollingPoints} />
      <RiskAttributionSection varPositions={varPositions} />
    </div>
  );
}
