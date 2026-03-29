"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Position {
  ticker: string;
  weight: number;
  sigma: number; // annualized vol
}

// ---------------------------------------------------------------------------
// Mulberry32 seeded PRNG
// ---------------------------------------------------------------------------
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller for normal random variable
function boxMuller(rand: () => number): number {
  const u1 = Math.max(rand(), 1e-10);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ---------------------------------------------------------------------------
// Correlation helpers
// ---------------------------------------------------------------------------

function pearsonCorr(a: number[], b: number[]): number {
  const n = a.length;
  if (n < 2) return 0;
  const ma = a.reduce((s, x) => s + x, 0) / n;
  const mb = b.reduce((s, x) => s + x, 0) / n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  const denom = Math.sqrt(da * db);
  return denom > 0 ? num / denom : 0;
}

// Generate return series with given correlation to a market factor
function generateReturnSeries(
  rand: () => number,
  n: number,
  marketFactor: number[],
  beta: number,
  idioVol: number,
): number[] {
  return Array.from({ length: n }, (_, i) => {
    const idio = boxMuller(rand) * idioVol;
    return beta * (marketFactor[i] ?? 0) + idio;
  });
}

// ---------------------------------------------------------------------------
// Data computation
// ---------------------------------------------------------------------------

function computeAllMetrics(
  positions: Position[],
  portfolioValue: number,
): {
  normalCorr: number[][];
  crisisCorr: number[][];
  rollingSeries: { day: number; corr: number }[][];
  stabilityScores: number[];
  diversificationBenefit: number;
  sumIndividualVaR: number;
  portfolioVaR: number;
} {
  const rand = mulberry32(9999);
  const N_DAYS = 60; // 60 days of rolling data

  // Generate a market factor (SPY-like daily returns)
  const marketFactor = Array.from({ length: N_DAYS }, () => boxMuller(rand) * 0.012);

  // Generate return series per position
  const betas = positions.map((p, i) => 0.5 + (i * 0.4 + mulberry32(i * 777 + 1)() * 0.5));
  const idioVols = positions.map((p, i) => 0.006 + mulberry32(i * 333 + 2)() * 0.008);

  const returnSeries = positions.map((_, i) =>
    generateReturnSeries(mulberry32(i * 1234 + 567), N_DAYS, marketFactor, betas[i], idioVols[i]),
  );

  // Crisis return series: all highly correlated with market
  const crisisMarket = Array.from({ length: N_DAYS }, () => boxMuller(mulberry32(8888)) * 0.025);
  const crisisReturnSeries = positions.map((_, i) =>
    generateReturnSeries(mulberry32(i * 999 + 111), N_DAYS, crisisMarket, 0.92 + mulberry32(i * 22)() * 0.05, 0.003),
  );

  // Compute pairwise correlation matrices
  const n = positions.length;
  const normalCorr: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => {
      if (i === j) return 1.0;
      return parseFloat(pearsonCorr(returnSeries[i], returnSeries[j]).toFixed(3));
    }),
  );
  const crisisCorr: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => {
      if (i === j) return 1.0;
      return parseFloat(pearsonCorr(crisisReturnSeries[i], crisisReturnSeries[j]).toFixed(3));
    }),
  );

  // Rolling 30-day correlation (shift window day by day over 60 days)
  const WINDOW = 30;
  const rollingSeries: { day: number; corr: number }[][] = [];
  // Each pair (i,j) with i < j
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const series: { day: number; corr: number }[] = [];
      for (let d = WINDOW; d <= N_DAYS; d++) {
        const a = returnSeries[i].slice(d - WINDOW, d);
        const b = returnSeries[j].slice(d - WINDOW, d);
        series.push({ day: d, corr: pearsonCorr(a, b) });
      }
      rollingSeries.push(series);
    }
  }

  // Correlation stability: std dev of rolling correlations (lower = more stable)
  const stabilityScores = rollingSeries.map((series) => {
    const corrs = series.map((s) => s.corr);
    const mean = corrs.reduce((a, b) => a + b, 0) / corrs.length;
    const variance = corrs.reduce((a, b) => a + (b - mean) ** 2, 0) / corrs.length;
    const std = Math.sqrt(variance);
    // Convert to 0–100 stability score: 100 = perfectly stable (std=0), 0 = totally unstable (std=1)
    return Math.max(0, Math.round((1 - std * 3) * 100));
  });

  // Diversification benefit
  // Portfolio VaR (Markowitz): sqrt(w^T * Cov * w) * z95 * pv
  // Individual VaR sum: sum of |wi * sigma_i * z95 * pv|
  const dailyVols = positions.map((p, i) => idioVols[i] + betas[i] * 0.012); // approx daily vol
  const z95 = 1.645;

  let portfolioVariance = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      portfolioVariance +=
        positions[i].weight * positions[j].weight * dailyVols[i] * dailyVols[j] * normalCorr[i][j];
    }
  }
  const portfolioVol = Math.sqrt(Math.max(portfolioVariance, 0));
  const portfolioVaR = portfolioVol * z95 * portfolioValue;
  const sumIndividualVaR = positions.reduce(
    (sum, p, i) => sum + p.weight * dailyVols[i] * z95 * portfolioValue,
    0,
  );
  const diversificationBenefit = sumIndividualVaR - portfolioVaR;

  return {
    normalCorr,
    crisisCorr,
    rollingSeries,
    stabilityScores,
    diversificationBenefit,
    sumIndividualVaR,
    portfolioVaR,
  };
}

// ---------------------------------------------------------------------------
// SVG: Correlation heatmap
// ---------------------------------------------------------------------------
function CorrHeatmap({
  matrix,
  labels,
  title,
}: {
  matrix: number[][];
  labels: string[];
  title: string;
}) {
  const n = labels.length;
  const cellSize = 44;
  const labelW = 36;
  const W = labelW + n * cellSize;
  const H = labelW + n * cellSize + 16;

  function corrColor(v: number): string {
    if (v >= 0.85) return "rgba(239,68,68,0.9)";
    if (v >= 0.7) return "rgba(249,115,22,0.8)";
    if (v >= 0.5) return "rgba(234,179,8,0.65)";
    if (v >= 0.3) return "rgba(34,197,94,0.55)";
    if (v >= 0) return "rgba(59,130,246,0.55)";
    return "rgba(139,92,246,0.55)";
  }

  return (
    <div>
      <p className="text-xs font-medium mb-1.5 text-muted-foreground">{title}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[280px]" preserveAspectRatio="xMidYMid meet">
        {labels.map((t, i) => (
          <text
            key={`col-${i}`}
            x={labelW + i * cellSize + cellSize / 2}
            y={labelW - 5}
            textAnchor="middle"
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
          >
            {t}
          </text>
        ))}
        {labels.map((t, j) => (
          <text
            key={`row-${j}`}
            x={labelW - 4}
            y={labelW + j * cellSize + cellSize / 2 + 3}
            textAnchor="end"
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
          >
            {t}
          </text>
        ))}
        {matrix.map((row, j) =>
          row.map((v, i) => (
            <g key={`${i}-${j}`}>
              <rect
                x={labelW + i * cellSize}
                y={labelW + j * cellSize}
                width={cellSize - 2}
                height={cellSize - 2}
                rx={2}
                fill={corrColor(v)}
              />
              <text
                x={labelW + i * cellSize + (cellSize - 2) / 2}
                y={labelW + j * cellSize + (cellSize - 2) / 2 + 4}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="white"
              >
                {v.toFixed(2)}
              </text>
            </g>
          )),
        )}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG: Rolling correlation line chart (single pair)
// ---------------------------------------------------------------------------
function RollingCorrChart({
  series,
  pairLabel,
  normalAvg,
}: {
  series: { day: number; corr: number }[];
  pairLabel: string;
  normalAvg: number;
}) {
  const W = 260;
  const H = 80;
  const pad = { l: 28, r: 8, t: 8, b: 16 };
  const gW = W - pad.l - pad.r;
  const gH = H - pad.t - pad.b;

  const n = series.length;
  if (n < 2) return null;

  function sx(i: number) {
    return pad.l + (i / (n - 1)) * gW;
  }
  function sy(v: number) {
    return pad.t + ((1 - v) / 2) * gH; // map -1..1 to bottom..top
  }

  const linePath = series
    .map((s, i) => `${i === 0 ? "M" : "L"} ${sx(i)} ${sy(s.corr)}`)
    .join(" ");

  const avgY = sy(normalAvg);

  const ticks = [-1, -0.5, 0, 0.5, 1];

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{pairLabel}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {ticks.map((v) => (
          <g key={`tick-${v}`}>
            <line
              x1={pad.l}
              y1={sy(v)}
              x2={W - pad.r}
              y2={sy(v)}
              stroke="hsl(var(--border))"
              strokeWidth="0.4"
            />
            <text x={pad.l - 3} y={sy(v) + 3} textAnchor="end" fontSize="7" fill="hsl(var(--muted-foreground))">
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        {/* Average line */}
        <line x1={pad.l} y1={avgY} x2={W - pad.r} y2={avgY} stroke="hsl(var(--primary))" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.5" />
        {/* Rolling line */}
        <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG: Diversification benefit bar
// ---------------------------------------------------------------------------
function DiversificationBar({
  portfolioVaR,
  sumIndividualVaR,
  benefit,
}: {
  portfolioVaR: number;
  sumIndividualVaR: number;
  benefit: number;
}) {
  const W = 420;
  const H = 70;
  const pad = { l: 90, r: 16, t: 10, b: 10 };
  const gW = W - pad.l - pad.r;

  const maxVal = sumIndividualVaR;
  const pvW = (portfolioVaR / maxVal) * gW;
  const simW = gW;
  const benefitW = (benefit / maxVal) * gW;

  const rowH = 20;
  const rows = [
    { label: "Sum of VaRs", w: simW, fill: "rgba(239,68,68,0.6)", y: pad.t },
    { label: "Portfolio VaR", w: pvW, fill: "hsl(var(--primary))", y: pad.t + rowH + 6 },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[420px]" preserveAspectRatio="xMidYMid meet">
      {rows.map((r, i) => (
        <g key={`row-${i}`}>
          <text x={pad.l - 4} y={r.y + rowH / 2 + 3} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">
            {r.label}
          </text>
          <rect x={pad.l} y={r.y} width={r.w} height={rowH} rx={3} fill={r.fill} />
          <text x={pad.l + r.w + 4} y={r.y + rowH / 2 + 3} fontSize="9" fill="hsl(var(--foreground))">
            ${(i === 0 ? sumIndividualVaR : portfolioVaR).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </text>
        </g>
      ))}
      {/* Benefit bracket */}
      <line x1={pad.l + pvW} y1={pad.t} x2={pad.l + pvW} y2={pad.t + rowH * 2 + 6} stroke="hsl(var(--primary))" strokeWidth="0.8" strokeDasharray="2,2" />
      <line x1={pad.l + simW} y1={pad.t} x2={pad.l + simW} y2={pad.t + rowH + 3} stroke="rgba(239,68,68,0.6)" strokeWidth="0.8" strokeDasharray="2,2" />
      {/* Benefit label */}
      <text
        x={pad.l + pvW + benefitW / 2}
        y={H - 2}
        textAnchor="middle"
        fontSize="8"
        fill="hsl(var(--primary))"
      >
        Diversification benefit: ${benefit.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        &nbsp;({((benefit / sumIndividualVaR) * 100).toFixed(1)}%)
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main CorrelationAnalysis component
// ---------------------------------------------------------------------------

const DEMO_POSITIONS: Position[] = [
  { ticker: "AAPL", weight: 0.30, sigma: 0.22 },
  { ticker: "MSFT", weight: 0.28, sigma: 0.18 },
  { ticker: "TSLA", weight: 0.15, sigma: 0.55 },
  { ticker: "SPY",  weight: 0.27, sigma: 0.15 },
];

interface CorrelationAnalysisProps {
  positions?: Position[];
  portfolioValue: number;
}

export default function CorrelationAnalysis({ positions, portfolioValue }: CorrelationAnalysisProps) {
  const pv = portfolioValue > 0 ? portfolioValue : 100000;
  const pos = positions && positions.length >= 2 ? positions : DEMO_POSITIONS;
  const labels = pos.map((p) => p.ticker);

  const {
    normalCorr,
    crisisCorr,
    rollingSeries,
    stabilityScores,
    diversificationBenefit,
    sumIndividualVaR,
    portfolioVaR,
  } = useMemo(() => computeAllMetrics(pos, pv), [pos, pv]);

  // Pair labels
  const pairs: string[] = [];
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) {
      pairs.push(`${pos[i].ticker} / ${pos[j].ticker}`);
    }
  }

  // Average normal correlation (off-diagonal)
  const n = pos.length;
  let avgNormalCorr = 0;
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      avgNormalCorr += normalCorr[i][j];
      count++;
    }
  }
  avgNormalCorr = count > 0 ? avgNormalCorr / count : 0;

  // Average crisis correlation
  let avgCrisisCorr = 0;
  count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      avgCrisisCorr += crisisCorr[i][j];
      count++;
    }
  }
  avgCrisisCorr = count > 0 ? avgCrisisCorr / count : 0;

  // Overall stability score (average)
  const overallStability =
    stabilityScores.length > 0
      ? Math.round(stabilityScores.reduce((a, b) => a + b, 0) / stabilityScores.length)
      : 50;

  const stabilityLabel =
    overallStability >= 70
      ? { label: "Stable", cls: "bg-green-500/20 text-green-600 dark:text-green-400" }
      : overallStability >= 45
        ? { label: "Moderate", cls: "bg-amber-500/20 text-amber-600 dark:text-amber-400" }
        : { label: "Unstable", cls: "bg-red-500/20 text-red-600 dark:text-red-400" };

  return (
    <div className="space-y-5">

      {/* Section 1: Normal vs Crisis correlation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Correlation Matrices — Normal vs Crisis Regime</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-8">
            <CorrHeatmap matrix={normalCorr} labels={labels} title="Normal Conditions (rolling 60d)" />
            <CorrHeatmap matrix={crisisCorr} labels={labels} title="Crisis Conditions (VIX > 60)" />

            <div className="flex-1 min-w-[200px] space-y-3 text-xs text-muted-foreground">
              <div className="space-y-1">
                <p className="font-medium text-foreground text-xs">Correlation Key</p>
                <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-red-500/80" /><span>0.85–1.0 Extreme</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-orange-500/70" /><span>0.7–0.85 High</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-yellow-500/60" /><span>0.5–0.7 Moderate</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-green-500/55" /><span>0.3–0.5 Low</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-blue-500/55" /><span>0.0–0.3 Very low</span></div>
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2.5 text-xs">
                <p className="font-semibold text-red-600 dark:text-red-400 mb-1">Crisis Correlation</p>
                <p>
                  During market stress, correlations spike toward 1.0 — all assets fall together, destroying
                  diversification exactly when you need it most. This is the &quot;diversification illusion.&quot;
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span>Avg normal corr</span>
                  <span className="font-semibold text-foreground">{avgNormalCorr.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg crisis corr</span>
                  <span className="font-semibold text-red-500">{avgCrisisCorr.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Correlation spike</span>
                  <span className="font-semibold text-amber-500">+{((avgCrisisCorr - avgNormalCorr) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Rolling correlation series */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Rolling 30-Day Correlations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Each chart shows the 30-day rolling Pearson correlation for a pair. Flat lines indicate stable
            relationships; large swings signal regime changes or momentum shifts.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rollingSeries.map((series, idx) => {
              const avgCorr = series.reduce((a, s) => a + s.corr, 0) / series.length;
              return (
                <div key={`pair-${idx}`} className="rounded-lg border border-border/50 p-2.5">
                  <RollingCorrChart
                    series={series}
                    pairLabel={`${pairs[idx]} — 30-day rolling`}
                    normalAvg={avgCorr}
                  />
                  <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                    <span>Avg: <span className="font-medium text-foreground">{avgCorr.toFixed(2)}</span></span>
                    <span>Stability: <span className={`font-medium ${stabilityScores[idx] >= 70 ? "text-green-500" : stabilityScores[idx] >= 45 ? "text-amber-500" : "text-red-500"}`}>{stabilityScores[idx]}/100</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Correlation stability */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Correlation Stability Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center rounded-lg border border-border/50 px-5 py-3">
              <p className="text-3xl font-bold">{overallStability}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Portfolio Stability</p>
            </div>
            <Badge className={stabilityLabel.cls + " text-xs px-3 py-1"}>{stabilityLabel.label}</Badge>
            <p className="text-xs text-muted-foreground flex-1 min-w-[200px]">
              Stability score (0–100) measures how consistently each pair maintains its correlation.
              High stability (70+) means correlations are predictable; low stability means
              your diversification assumptions may break down unexpectedly.
            </p>
          </div>

          <div className="space-y-2">
            {pairs.map((pair, idx) => (
              <div key={`stab-${idx}`} className="flex items-center gap-3 text-xs">
                <span className="w-28 font-medium shrink-0">{pair}</span>
                <div className="flex-1">
                  <Progress value={stabilityScores[idx]} className="h-1.5" />
                </div>
                <span className={`w-12 text-right font-semibold ${stabilityScores[idx] >= 70 ? "text-green-500" : stabilityScores[idx] >= 45 ? "text-amber-500" : "text-red-500"}`}>
                  {stabilityScores[idx]}/100
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How stability is measured</p>
            <p>
              Stability = 1 − 3 × std_dev(rolling 30-day correlations), scaled 0–100. A portfolio with unstable
              correlations cannot rely on historical diversification for risk management — positions that
              appeared uncorrelated may suddenly move in lockstep during market dislocations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Diversification benefit */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Diversification Benefit — VaR Reduction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            The <span className="font-medium text-foreground">diversification benefit</span> is the difference between
            the sum of individual asset VaRs (assuming perfect correlation) and the actual portfolio VaR
            (accounting for imperfect correlations). Lower portfolio correlations = greater benefit.
          </p>

          <DiversificationBar
            portfolioVaR={portfolioVaR}
            sumIndividualVaR={sumIndividualVaR}
            benefit={diversificationBenefit}
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center">
              <p className="text-[11px] text-muted-foreground">Sum of VaRs</p>
              <p className="mt-1 text-lg font-bold text-red-500">
                ${sumIndividualVaR.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">(no diversification)</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
              <p className="text-[11px] text-muted-foreground">Portfolio VaR</p>
              <p className="mt-1 text-lg font-bold text-primary">
                ${portfolioVaR.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">(with diversification)</p>
            </div>
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-center">
              <p className="text-[11px] text-muted-foreground">Benefit</p>
              <p className="mt-1 text-lg font-bold text-green-500">
                ${diversificationBenefit.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">
                {((diversificationBenefit / sumIndividualVaR) * 100).toFixed(1)}% saved
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
            <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">Crisis warning</p>
            <p className="text-muted-foreground">
              This diversification benefit assumes current correlations hold. Under crisis conditions (avg corr
              {" "}
              <span className="font-medium text-foreground">{avgCrisisCorr.toFixed(2)}</span> vs normal{" "}
              <span className="font-medium text-foreground">{avgNormalCorr.toFixed(2)}</span>), the portfolio VaR
              would approach the undiversified sum — a potential additional risk of{" "}
              <span className="font-medium text-red-500">
                ${(diversificationBenefit * 0.7).toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>{" "}
              materializing simultaneously.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
