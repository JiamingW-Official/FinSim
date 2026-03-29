"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp, TrendingDown, Target, Shield, BarChart2, Users } from "lucide-react";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
function makeRng(seed: number) {
  let s = seed;
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr: number[]): number {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
}

function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-0.5 * z * z);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return z < 0 ? p : 1 - p;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface AttributionRow {
  name: string;
  weight: number;
  allocation: number;
  selection: number;
  interaction: number;
  total: number;
}

interface RiskAdjustedMetrics {
  sharpe: number;
  sortino: number;
  calmar: number;
  omega: number;
  upsideCapture: number;
  downsideCapture: number;
  benchmarkSharpe: number;
  benchmarkSortino: number;
  benchmarkCalmar: number;
}

interface FactorLoading {
  name: string;
  label: string;
  loading: number;
  tStat: number;
  crowded: boolean;
  beneficial: boolean;
}

interface DrawdownEpisode {
  peak: string;
  trough: string;
  recovery: string;
  depth: number;
  durationDays: number;
  recoveryDays: number;
}

interface TailRiskData {
  histogram: { bin: number; actual: number; normal: number }[];
  cvar95: number;
  excessKurtosis: number;
  skewness: number;
  tailRatio: number;
  crisisPerf: { name: string; portfolio: number; market: number }[];
}

interface PeerMetric {
  label: string;
  value: string;
  quartile: number; // 1-4
  rawVal: number;
}

// ── Data generation ───────────────────────────────────────────────────────────

function generateAttributionData(): { rows: AttributionRow[]; alpha12m: number[]; icScatter: { x: number; y: number }[]; hitRate: number } {
  const rand = makeRng(27);

  const sectors = ["Technology", "Healthcare", "Financials", "Energy", "Consumer Disc.", "Industrials", "Materials", "Utilities", "Real Estate", "Communication"];
  const rows: AttributionRow[] = sectors.map((name) => {
    const weight = 0.05 + rand() * 0.15;
    const alloc = (rand() - 0.45) * 0.8;
    const sel = (rand() - 0.42) * 1.2;
    const inter = (rand() - 0.5) * 0.3;
    return {
      name,
      weight: parseFloat(weight.toFixed(3)),
      allocation: parseFloat(alloc.toFixed(3)),
      selection: parseFloat(sel.toFixed(3)),
      interaction: parseFloat(inter.toFixed(3)),
      total: parseFloat((alloc + sel + inter).toFixed(3)),
    };
  });

  const alpha12m: number[] = [];
  let cum = 0;
  for (let i = 0; i < 36; i++) {
    cum += (rand() - 0.46) * 0.8;
    alpha12m.push(parseFloat(cum.toFixed(3)));
  }

  const icScatter = Array.from({ length: 40 }, () => ({
    x: parseFloat(((rand() - 0.5) * 4).toFixed(3)),
    y: parseFloat(((rand() - 0.48) * 4 + (rand() - 0.5) * 0.5).toFixed(3)),
  }));

  const positiveContrib = rows.filter((r) => r.total > 0).length;
  const hitRate = positiveContrib / rows.length;

  return { rows, alpha12m, icScatter, hitRate };
}

function generateRiskAdjusted(): { metrics: RiskAdjustedMetrics; sharpeTimeSeries: number[]; } {
  const rand = makeRng(28);

  const monthlyReturns = Array.from({ length: 36 }, () => (rand() - 0.44) * 0.06);
  const benchReturns = Array.from({ length: 36 }, () => (rand() - 0.45) * 0.055);
  const rf = 0.0043;

  const portMean = mean(monthlyReturns) * 12;
  const portStd = stddev(monthlyReturns) * Math.sqrt(12);
  const sharpe = (portMean - rf * 12) / portStd;

  const downside = monthlyReturns.filter((r) => r < rf / 12);
  const downsideDev = downside.length > 0 ? stddev(downside) * Math.sqrt(12) : portStd;
  const sortino = (portMean - rf * 12) / downsideDev;

  let peak = 1;
  let maxDD = 0;
  let equity = 1;
  for (const r of monthlyReturns) {
    equity *= 1 + r;
    if (equity > peak) peak = equity;
    const dd = (peak - equity) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  const calmar = portMean / (maxDD || 0.01);

  const gains = monthlyReturns.filter((r) => r > rf / 12);
  const losses = monthlyReturns.filter((r) => r <= rf / 12);
  const omega = gains.length && losses.length
    ? gains.reduce((a, b) => a + (b - rf / 12), 0) / Math.abs(losses.reduce((a, b) => a + (b - rf / 12), 0))
    : 1;

  const upMonths = benchReturns.map((b, i) => ({ b, p: monthlyReturns[i] })).filter((d) => d.b > 0);
  const downMonths = benchReturns.map((b, i) => ({ b, p: monthlyReturns[i] })).filter((d) => d.b < 0);
  const upsideCapture = upMonths.length ? (mean(upMonths.map((d) => d.p)) / mean(upMonths.map((d) => d.b))) * 100 : 100;
  const downsideCapture = downMonths.length ? (mean(downMonths.map((d) => d.p)) / mean(downMonths.map((d) => d.b))) * 100 : 100;

  const bMean = mean(benchReturns) * 12;
  const bStd = stddev(benchReturns) * Math.sqrt(12);
  const bDownside = benchReturns.filter((r) => r < rf / 12);
  const bDDev = bDownside.length > 0 ? stddev(bDownside) * Math.sqrt(12) : bStd;
  let bPeak = 1; let bMaxDD = 0; let bEq = 1;
  for (const r of benchReturns) {
    bEq *= 1 + r;
    if (bEq > bPeak) bPeak = bEq;
    const dd = (bPeak - bEq) / bPeak;
    if (dd > bMaxDD) bMaxDD = dd;
  }

  // Rolling 12-month Sharpe
  const sharpeTimeSeries: number[] = [];
  for (let i = 11; i < monthlyReturns.length; i++) {
    const window = monthlyReturns.slice(i - 11, i + 1);
    const m = mean(window) * 12;
    const s = stddev(window) * Math.sqrt(12);
    sharpeTimeSeries.push(parseFloat(((m - rf * 12) / s).toFixed(3)));
  }

  return {
    metrics: {
      sharpe: parseFloat(sharpe.toFixed(2)),
      sortino: parseFloat(sortino.toFixed(2)),
      calmar: parseFloat(calmar.toFixed(2)),
      omega: parseFloat(omega.toFixed(2)),
      upsideCapture: parseFloat(upsideCapture.toFixed(1)),
      downsideCapture: parseFloat(downsideCapture.toFixed(1)),
      benchmarkSharpe: parseFloat(((bMean - rf * 12) / bStd).toFixed(2)),
      benchmarkSortino: parseFloat(((bMean - rf * 12) / bDDev).toFixed(2)),
      benchmarkCalmar: parseFloat(((bMean) / (bMaxDD || 0.01)).toFixed(2)),
    },
    sharpeTimeSeries,
  };
}

function generateFactorAnalysis(): { loadings: FactorLoading[]; rSquared: number; jensensAlpha: number } {
  const rand = makeRng(29);
  const factors: { name: string; label: string }[] = [
    { name: "Market (Rm-Rf)", label: "MKT" },
    { name: "Size (SMB)", label: "SMB" },
    { name: "Value (HML)", label: "HML" },
    { name: "Profitability (RMW)", label: "RMW" },
    { name: "Investment (CMA)", label: "CMA" },
  ];
  const loadings: FactorLoading[] = factors.map((f) => {
    const loading = parseFloat(((rand() - 0.35) * 2).toFixed(3));
    const tStat = parseFloat(((rand() - 0.3) * 4.5).toFixed(2));
    return {
      ...f,
      loading,
      tStat,
      crowded: rand() > 0.65,
      beneficial: rand() > 0.45,
    };
  });
  const rSquared = parseFloat((0.55 + rand() * 0.35).toFixed(3));
  const jensensAlpha = parseFloat(((rand() - 0.42) * 6).toFixed(2));
  return { loadings, rSquared, jensensAlpha };
}

function generateDrawdownData(): { underwaterSeries: number[]; episodes: DrawdownEpisode[]; painIndex: number; ddCorrelation: number } {
  const rand = makeRng(30);
  const n = 36;
  const prices: number[] = [100];
  for (let i = 1; i < n; i++) {
    prices.push(prices[i - 1] * (1 + (rand() - 0.47) * 0.05));
  }

  let peak = prices[0];
  const underwaterSeries = prices.map((p) => {
    if (p > peak) peak = p;
    return parseFloat(((p - peak) / peak * 100).toFixed(3));
  });

  const DATES = ["Jan 25", "Feb 25", "Mar 25", "Apr 25", "May 25", "Jun 25", "Jul 25", "Aug 25", "Sep 25", "Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26"];
  const episodes: DrawdownEpisode[] = Array.from({ length: 5 }, (_, i) => {
    const di = Math.floor(rand() * (DATES.length - 3));
    const dur = Math.floor(30 + rand() * 60);
    const rec = Math.floor(20 + rand() * 80);
    return {
      peak: DATES[di % DATES.length],
      trough: DATES[(di + 1) % DATES.length],
      recovery: DATES[(di + 2) % DATES.length],
      depth: parseFloat((-(rand() * 0.2 + i * 0.01 + 0.03)).toFixed(4)),
      durationDays: dur,
      recoveryDays: rec,
    };
  });

  const negValues = underwaterSeries.filter((v) => v < 0);
  const painIndex = negValues.length > 0 ? parseFloat((Math.abs(mean(negValues)) * (negValues.length / n)).toFixed(3)) : 0;
  const ddCorrelation = parseFloat((0.4 + rand() * 0.4).toFixed(3));

  return { underwaterSeries, episodes, painIndex, ddCorrelation };
}

function generateTailRisk(): TailRiskData {
  const rand = makeRng(31);
  const n = 100;
  const returns: number[] = [];
  for (let i = 0; i < n; i++) {
    // Box-Muller for approximate normal, then add fat tails
    const u1 = rand(); const u2 = rand();
    const normal = Math.sqrt(-2 * Math.log(u1 + 0.0001)) * Math.cos(2 * Math.PI * u2);
    const fatTail = rand() > 0.92 ? (rand() - 0.5) * 6 : 0;
    returns.push(normal * 0.012 + fatTail * 0.008 - 0.0005);
  }

  const sorted = [...returns].sort((a, b) => a - b);
  const worst5pct = sorted.slice(0, Math.floor(n * 0.05));
  const best5pct = sorted.slice(Math.floor(n * 0.95));
  const cvar95 = parseFloat((mean(worst5pct) * 100).toFixed(3));
  const tailRatio = parseFloat((Math.abs(mean(best5pct)) / Math.abs(mean(worst5pct))).toFixed(3));

  const m = mean(returns);
  const s = stddev(returns);
  const excessKurtosis = parseFloat((returns.reduce((a, r) => a + ((r - m) / s) ** 4, 0) / n - 3).toFixed(3));
  const skewness = parseFloat((returns.reduce((a, r) => a + ((r - m) / s) ** 3, 0) / n).toFixed(3));

  // Histogram: 20 bins from -4 to +4 percent
  const bins = Array.from({ length: 16 }, (_, i) => -4 + i * 0.5);
  const histogram = bins.map((bin) => {
    const actual = returns.filter((r) => r * 100 >= bin && r * 100 < bin + 0.5).length / n;
    const z1 = (bin / 100 - m) / (s || 0.001);
    const z2 = ((bin + 0.5) / 100 - m) / (s || 0.001);
    const normal = Math.abs(normalCDF(z2) - normalCDF(z1));
    return { bin, actual: parseFloat(actual.toFixed(4)), normal: parseFloat(normal.toFixed(4)) };
  });

  const crisisNames = ["COVID-19 Crash (Mar 2020)", "Rate Shock (2022)", "SVB Crisis (Mar 2023)", "AI Bubble Correction (2024)", "Global Recession (2025)"];
  const crisisPerf = crisisNames.map((name) => ({
    name,
    portfolio: parseFloat(((rand() - 0.55) * 20).toFixed(2)),
    market: parseFloat(((rand() - 0.62) * 22).toFixed(2)),
  }));

  return { histogram, cvar95, excessKurtosis, skewness, tailRatio, crisisPerf };
}

function generatePeerData(): { metrics: PeerMetric[]; styleBox: number; activeShare: number; trackingError: number; informationRatio: number } {
  const rand = makeRng(32);

  const metrics: PeerMetric[] = [
    { label: "1Y Return", value: `${((rand() - 0.3) * 30).toFixed(1)}%`, quartile: Math.ceil(rand() * 4), rawVal: rand() },
    { label: "Sharpe Ratio", value: (0.5 + rand() * 1.5).toFixed(2), quartile: Math.ceil(rand() * 4), rawVal: rand() },
    { label: "Max Drawdown", value: `${-(rand() * 15 + 5).toFixed(1)}%`, quartile: Math.ceil(rand() * 4), rawVal: rand() },
    { label: "Volatility", value: `${(8 + rand() * 12).toFixed(1)}%`, quartile: Math.ceil(rand() * 4), rawVal: rand() },
    { label: "Alpha", value: `${((rand() - 0.4) * 8).toFixed(2)}%`, quartile: Math.ceil(rand() * 4), rawVal: rand() },
    { label: "Info Ratio", value: (0.2 + rand() * 0.9).toFixed(2), quartile: Math.ceil(rand() * 4), rawVal: rand() },
  ];

  const styleBox = Math.floor(rand() * 9); // 0-8 (3x3 grid: value/blend/growth × small/mid/large)
  const activeShare = parseFloat((40 + rand() * 45).toFixed(1));
  const trackingError = parseFloat((3 + rand() * 8).toFixed(2));
  const informationRatio = parseFloat((0.1 + rand() * 0.9).toFixed(2));

  return { metrics, styleBox, activeShare, trackingError, informationRatio };
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

function SvgSparkline({ values, color, height = 60, showArea = true }: { values: number[]; color: string; height?: number; showArea?: boolean }) {
  const W = 300;
  const H = height;
  const padX = 4; const padY = 6;
  const innerW = W - padX * 2; const innerH = H - padY * 2;
  const minV = Math.min(...values); const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const xs = values.map((_, i) => padX + (i / (values.length - 1)) * innerW);
  const toY = (v: number) => padY + ((maxV - v) / range) * innerH;
  const pts = values.map((v, i) => `${xs[i]},${toY(v)}`).join(" L ");
  const areaD = `M ${xs[0]},${padY + innerH} L ${pts} L ${xs[xs.length - 1]},${padY + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {showArea && <path d={areaD} fill={color} opacity={0.15} />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} />
      <circle cx={xs[xs.length - 1]} cy={toY(values[values.length - 1])} r={2.5} fill={color} />
    </svg>
  );
}

// ── Section 1: Performance Attribution ───────────────────────────────────────

function PerformanceAttribution() {
  const { rows, alpha12m, icScatter, hitRate } = useMemo(() => generateAttributionData(), []);

  const W = 560; const H = 180;
  const padX = 36; const padY = 14; const innerW = W - padX * 2; const innerH = H - padY * 2;
  const minA = Math.min(...alpha12m); const maxA = Math.max(...alpha12m);
  const rangeA = maxA - minA || 1;
  const alphaXs = alpha12m.map((_, i) => padX + (i / (alpha12m.length - 1)) * innerW);
  const toYA = (v: number) => padY + ((maxA - v) / rangeA) * innerH;
  const alphaPath = "M " + alpha12m.map((v, i) => `${alphaXs[i]},${toYA(v)}`).join(" L ");
  const zeroY = toYA(0);

  const icW = 200; const icH = 160; const icPad = 20;
  const icInnerW = icW - icPad * 2; const icInnerH = icH - icPad * 2;
  const icMinX = Math.min(...icScatter.map((p) => p.x)); const icMaxX = Math.max(...icScatter.map((p) => p.x));
  const icMinY = Math.min(...icScatter.map((p) => p.y)); const icMaxY = Math.max(...icScatter.map((p) => p.y));
  const icToX = (v: number) => icPad + ((v - icMinX) / (icMaxX - icMinX || 1)) * icInnerW;
  const icToY = (v: number) => icPad + ((icMaxY - v) / (icMaxY - icMinY || 1)) * icInnerH;

  const totalAlpha = rows.reduce((a, r) => a + r.total, 0);
  const positiveRows = rows.filter((r) => r.total > 0).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total Alpha", value: `${totalAlpha > 0 ? "+" : ""}${(totalAlpha).toFixed(2)}%`, color: totalAlpha >= 0 ? "text-emerald-400" : "text-red-400" },
          { label: "Hit Rate", value: `${(hitRate * 100).toFixed(0)}%`, color: hitRate >= 0.5 ? "text-emerald-400" : "text-amber-400" },
          { label: "Positive Contributors", value: `${positiveRows}/10`, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border/20 bg-background/60 px-3 py-2">
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
            <div className={cn("text-sm font-semibold tabular-nums mt-0.5", s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Attribution table */}
      <div className="overflow-x-auto rounded-md border border-border/20">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/20 bg-muted/30">
              {["Sector", "Wt %", "Allocation", "Selection", "Interaction", "Total"].map((h) => (
                <th key={h} className={cn("px-3 py-2 font-medium text-muted-foreground", h === "Sector" ? "text-left" : "text-right")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                <td className="px-3 py-1.5 text-muted-foreground">{r.name}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{(r.weight * 100).toFixed(1)}%</td>
                {[r.allocation, r.selection, r.interaction, r.total].map((v, i) => (
                  <td key={i} className={cn("px-3 py-1.5 text-right tabular-nums font-medium", v > 0 ? "text-emerald-400" : v < 0 ? "text-red-400" : "text-muted-foreground")}>
                    {v > 0 ? "+" : ""}{(v * 100).toFixed(2)}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rolling 12m alpha chart */}
      <div>
        <div className="text-xs text-muted-foreground mb-2">Rolling 36-Month Active Return vs Benchmark</div>
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300 }}>
            {[0.25, 0.5, 0.75].map((t) => {
              const v = minA + (maxA - minA) * t;
              return <line key={t} x1={padX} y1={toYA(v)} x2={W - padX} y2={toYA(v)} stroke="#374151" strokeWidth={0.5} />;
            })}
            {/* Zero line */}
            <line x1={padX} y1={zeroY} x2={W - padX} y2={zeroY} stroke="#6b7280" strokeWidth={0.8} strokeDasharray="4 3" />
            {/* Fill above/below zero */}
            <clipPath id="above-zero"><rect x={padX} y={padY} width={innerW} height={zeroY - padY} /></clipPath>
            <clipPath id="below-zero"><rect x={padX} y={zeroY} width={innerW} height={innerH - (zeroY - padY)} /></clipPath>
            <path d={`M ${alphaXs[0]},${zeroY} L ${alphaPath.slice(2)} L ${alphaXs[alphaXs.length - 1]},${zeroY} Z`} fill="#10b981" opacity={0.2} clipPath="url(#above-zero)" />
            <path d={`M ${alphaXs[0]},${zeroY} L ${alphaPath.slice(2)} L ${alphaXs[alphaXs.length - 1]},${zeroY} Z`} fill="#ef4444" opacity={0.2} clipPath="url(#below-zero)" />
            <path d={alphaPath} fill="none" stroke="#3b82f6" strokeWidth={1.8} />
            {[0, 11, 23, 35].map((idx) => (
              <text key={idx} x={alphaXs[idx]} y={H - 2} textAnchor="middle" fontSize={8} fill="#6b7280">M{idx + 1}</text>
            ))}
            {[minA, 0, maxA].map((v) => (
              <text key={v} x={padX - 4} y={toYA(v) + 3} textAnchor="end" fontSize={8} fill="#6b7280">{(v * 100).toFixed(1)}%</text>
            ))}
          </svg>
        </div>
      </div>

      {/* IC Scatter */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted-foreground mb-2">Information Coefficient (Predicted vs Actual)</div>
          <svg viewBox={`0 0 ${icW} ${icH}`} className="w-full max-w-[200px]">
            <line x1={icPad} y1={icH - icPad} x2={icW - icPad} y2={icH - icPad} stroke="#374151" strokeWidth={0.5} />
            <line x1={icPad} y1={icPad} x2={icPad} y2={icH - icPad} stroke="#374151" strokeWidth={0.5} />
            {icScatter.map((pt, i) => (
              <circle key={i} cx={icToX(pt.x)} cy={icToY(pt.y)} r={2} fill="#3b82f6" opacity={0.7} />
            ))}
            {/* Trend line hint */}
            <line x1={icPad} y1={icH - icPad - 10} x2={icW - icPad} y2={icPad + 10} stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            <text x={icW / 2} y={icH - 3} textAnchor="middle" fontSize={8} fill="#6b7280">Predicted Return</text>
          </svg>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <div className="text-xs text-muted-foreground">IC measures correlation between predicted and actual returns. Target &gt; 0.05 is considered skilled.</div>
          <div className="rounded-md border border-border/20 bg-background/60 px-3 py-2">
            <div className="text-[11px] text-muted-foreground">Estimated IC</div>
            <div className="text-sm font-semibold text-primary tabular-nums">0.12</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section 2: Risk-Adjusted Returns ─────────────────────────────────────────

function CalmarGauge({ value }: { value: number }) {
  const max = 3; const min = -1;
  const clamp = Math.max(min, Math.min(max, value));
  const angle = ((clamp - min) / (max - min)) * 180 - 90;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const cx = 80; const cy = 70; const r = 55;
  const arcX = (deg: number) => cx + r * Math.cos(toRad(deg - 90));
  const arcY = (deg: number) => cy + r * Math.sin(toRad(deg - 90));

  return (
    <svg viewBox="0 0 160 90" className="w-full max-w-[180px]">
      {/* Background arc */}
      <path d={`M ${arcX(-90)} ${arcY(-90)} A ${r} ${r} 0 0 1 ${arcX(90)} ${arcY(90)}`} fill="none" stroke="#374151" strokeWidth={10} />
      {/* Color zones */}
      {[
        { start: -90, end: -30, color: "#ef4444" },
        { start: -30, end: 30, color: "#f59e0b" },
        { start: 30, end: 90, color: "#10b981" },
      ].map((zone) => (
        <path
          key={zone.color}
          d={`M ${arcX(zone.start)} ${arcY(zone.start)} A ${r} ${r} 0 0 1 ${arcX(zone.end)} ${arcY(zone.end)}`}
          fill="none"
          stroke={zone.color}
          strokeWidth={10}
          opacity={0.6}
        />
      ))}
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + (r - 10) * Math.cos(toRad(angle - 90))}
        y2={cy + (r - 10) * Math.sin(toRad(angle - 90))}
        stroke="#f1f5f9"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={4} fill="#f1f5f9" />
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize={12} fill="#f1f5f9" fontWeight="700">{value.toFixed(2)}</text>
      <text x={cx} y={cy + 26} textAnchor="middle" fontSize={8} fill="#6b7280">Calmar Ratio</text>
    </svg>
  );
}

function RiskAdjustedSection() {
  const { metrics, sharpeTimeSeries } = useMemo(() => generateRiskAdjusted(), []);

  const rows: { label: string; port: string; bench: string; portColor: string }[] = [
    { label: "Sharpe Ratio", port: metrics.sharpe.toFixed(2), bench: metrics.benchmarkSharpe.toFixed(2), portColor: metrics.sharpe > metrics.benchmarkSharpe ? "text-emerald-400" : "text-red-400" },
    { label: "Sortino Ratio", port: metrics.sortino.toFixed(2), bench: metrics.benchmarkSortino.toFixed(2), portColor: metrics.sortino > metrics.benchmarkSortino ? "text-emerald-400" : "text-red-400" },
    { label: "Calmar Ratio", port: metrics.calmar.toFixed(2), bench: metrics.benchmarkCalmar.toFixed(2), portColor: metrics.calmar > metrics.benchmarkCalmar ? "text-emerald-400" : "text-red-400" },
    { label: "Omega Ratio", port: metrics.omega.toFixed(2), bench: "1.00", portColor: metrics.omega > 1 ? "text-emerald-400" : "text-red-400" },
    { label: "Upside Capture", port: `${metrics.upsideCapture.toFixed(1)}%`, bench: "100.0%", portColor: metrics.upsideCapture > 100 ? "text-emerald-400" : "text-amber-400" },
    { label: "Downside Capture", port: `${metrics.downsideCapture.toFixed(1)}%`, bench: "100.0%", portColor: metrics.downsideCapture < 100 ? "text-emerald-400" : "text-red-400" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metrics table */}
        <div className="overflow-x-auto rounded-md border border-border/20">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/20 bg-muted/30">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Metric</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Portfolio</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Benchmark</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <td className="px-3 py-2 text-muted-foreground">{r.label}</td>
                  <td className={cn("px-3 py-2 text-right tabular-nums font-semibold", r.portColor)}>{r.port}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{r.bench}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calmar gauge + capture */}
        <div className="flex flex-col gap-3 items-center justify-center">
          <CalmarGauge value={metrics.calmar} />
          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="rounded-md border border-border/20 bg-background/60 px-2.5 py-2 text-center">
              <div className="text-[11px] text-muted-foreground">Up Capture</div>
              <div className={cn("text-sm font-semibold tabular-nums", metrics.upsideCapture > 100 ? "text-emerald-400" : "text-amber-400")}>{metrics.upsideCapture.toFixed(1)}%</div>
            </div>
            <div className="rounded-md border border-border/20 bg-background/60 px-2.5 py-2 text-center">
              <div className="text-[11px] text-muted-foreground">Down Capture</div>
              <div className={cn("text-sm font-semibold tabular-nums", metrics.downsideCapture < 100 ? "text-emerald-400" : "text-red-400")}>{metrics.downsideCapture.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rolling 12m Sharpe */}
      <div>
        <div className="text-xs text-muted-foreground mb-2">Rolling 12-Month Sharpe Ratio</div>
        <SvgSparkline values={sharpeTimeSeries} color="#3b82f6" height={70} />
      </div>
    </div>
  );
}

// ── Section 3: Factor Analysis ────────────────────────────────────────────────

function FactorLoadingChart({ loadings }: { loadings: FactorLoading[] }) {
  const W = 520; const H = 160;
  const labelW = 150; const barMaxW = W - labelW - 60;
  const rowH = H / loadings.length;
  const maxAbs = Math.max(...loadings.map((f) => Math.abs(f.loading)));

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
        <line x1={labelW} y1={0} x2={labelW} y2={H} stroke="#374151" strokeWidth={1} />
        {loadings.map((f, i) => {
          const y = i * rowH;
          const w = (Math.abs(f.loading) / (maxAbs || 1)) * barMaxW * 0.88;
          const positive = f.loading >= 0;
          return (
            <g key={f.label}>
              <text x={labelW - 6} y={y + rowH / 2 + 3} textAnchor="end" fontSize={9} fill="#9ca3af">{f.name}</text>
              <rect
                x={positive ? labelW + 2 : labelW - w - 2}
                y={y + rowH * 0.2}
                width={Math.max(w, 1)}
                height={rowH * 0.6}
                fill={positive ? "#3b82f6" : "#8b5cf6"}
                rx={2}
                opacity={0.85}
              />
              <text
                x={positive ? labelW + w + 6 : labelW - w - 6}
                y={y + rowH / 2 + 3}
                textAnchor={positive ? "start" : "end"}
                fontSize={9}
                fill={positive ? "#3b82f6" : "#8b5cf6"}
              >
                {f.loading > 0 ? "+" : ""}{f.loading.toFixed(2)}
              </text>
              {/* Crowded badge */}
              {f.crowded && (
                <text x={W - 4} y={y + rowH / 2 + 3} textAnchor="end" fontSize={8} fill="#ef4444">CROWDED</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function FactorAnalysisSection() {
  const { loadings, rSquared, jensensAlpha } = useMemo(() => generateFactorAnalysis(), []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "R-Squared", value: (rSquared * 100).toFixed(1) + "%", color: "text-primary", desc: "Explained by factors" },
          { label: "Jensen's Alpha", value: `${jensensAlpha > 0 ? "+" : ""}${jensensAlpha.toFixed(2)}%`, color: jensensAlpha >= 0 ? "text-emerald-400" : "text-red-400", desc: "Factor-adj. excess return" },
          { label: "Active Factors", value: `${loadings.filter((f) => Math.abs(f.tStat) > 2).length}/5`, color: "text-amber-400", desc: "|t-stat| > 2" },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border/20 bg-background/60 px-3 py-2">
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
            <div className={cn("text-sm font-semibold tabular-nums mt-0.5", s.color)}>{s.value}</div>
            <div className="text-[11px] text-muted-foreground/70 mt-0.5">{s.desc}</div>
          </div>
        ))}
      </div>

      <FactorLoadingChart loadings={loadings} />

      <div className="overflow-x-auto rounded-md border border-border/20">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/20 bg-muted/30">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Factor</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Loading</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">t-stat</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Timing</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Crowding</th>
            </tr>
          </thead>
          <tbody>
            {loadings.map((f) => (
              <tr key={f.label} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                <td className="px-3 py-2 text-muted-foreground">{f.name}</td>
                <td className={cn("px-3 py-2 text-right tabular-nums font-semibold", f.loading >= 0 ? "text-primary" : "text-primary")}>
                  {f.loading > 0 ? "+" : ""}{f.loading.toFixed(3)}
                </td>
                <td className={cn("px-3 py-2 text-right tabular-nums", Math.abs(f.tStat) > 2 ? "text-amber-400" : "text-muted-foreground")}>
                  {f.tStat.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">
                  <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", f.beneficial ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400")}>
                    {f.beneficial ? "Beneficial" : "Detrimental"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", f.crowded ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400")}>
                    {f.crowded ? "Crowded" : "Uncrowded"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Section 4: Drawdown Deep Dive ─────────────────────────────────────────────

function UnderwaterChart({ series }: { series: number[] }) {
  const W = 580; const H = 180;
  const padX = 40; const padY = 14;
  const innerW = W - padX * 2; const innerH = H - padY * 2 - 16;
  const minV = Math.min(...series);
  const xs = series.map((_, i) => padX + (i / (series.length - 1)) * innerW);
  const toY = (v: number) => padY + (v / (minV || -0.01)) * innerH;
  const zeroY = toY(0);
  const areaPath = `M ${xs[0]},${zeroY} ` + series.map((v, i) => `L ${xs[i]},${toY(v)}`).join(" ") + ` L ${xs[xs.length - 1]},${zeroY} Z`;
  const linePts = series.map((v, i) => `${xs[i]},${toY(v)}`).join(" ");
  const gridVals = [0, 0.33, 0.67, 1].map((t) => minV * t);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300 }}>
        {gridVals.map((v, idx) => (
          <g key={idx}>
            <line x1={padX} y1={toY(v)} x2={W - padX} y2={toY(v)} stroke="#374151" strokeWidth={0.5} />
            <text x={padX - 4} y={toY(v) + 3} textAnchor="end" fontSize={8} fill="#6b7280">{v.toFixed(1)}%</text>
          </g>
        ))}
        <line x1={padX} y1={zeroY} x2={W - padX} y2={zeroY} stroke="#6b7280" strokeWidth={0.8} />
        <path d={areaPath} fill="#ef4444" opacity={0.25} />
        <polyline points={linePts} fill="none" stroke="#ef4444" strokeWidth={1.5} />
        {/* Max drawdown marker */}
        {(() => {
          const mi = series.reduce((best, v, i) => v < series[best] ? i : best, 0);
          return (
            <g>
              <line x1={xs[mi]} y1={toY(series[mi])} x2={xs[mi]} y2={zeroY} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 2" />
              <circle cx={xs[mi]} cy={toY(series[mi])} r={3} fill="#f59e0b" />
              <text x={xs[mi] + 4} y={toY(series[mi]) - 3} fontSize={8} fill="#f59e0b">Max DD {series[mi].toFixed(1)}%</text>
            </g>
          );
        })()}
        {[0, 8, 17, 26, 35].map((idx) => (
          <text key={idx} x={xs[Math.min(idx, xs.length - 1)]} y={H - 2} textAnchor="middle" fontSize={8} fill="#6b7280">M{idx + 1}</text>
        ))}
      </svg>
    </div>
  );
}

function DrawdownSection() {
  const { underwaterSeries, episodes, painIndex, ddCorrelation } = useMemo(() => generateDrawdownData(), []);
  const maxDD = Math.min(...underwaterSeries);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Max Drawdown", value: `${maxDD.toFixed(2)}%`, color: "text-red-400" },
          { label: "Pain Index", value: painIndex.toFixed(3), color: "text-orange-400" },
          { label: "DD Correlation", value: ddCorrelation.toFixed(3), color: "text-amber-400" },
          { label: "Current Drawdown", value: `${underwaterSeries[underwaterSeries.length - 1].toFixed(2)}%`, color: underwaterSeries[underwaterSeries.length - 1] < -5 ? "text-red-400" : "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border/20 bg-background/60 px-2.5 py-2">
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
            <div className={cn("text-sm font-semibold tabular-nums mt-0.5", s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      <UnderwaterChart series={underwaterSeries} />

      <div className="overflow-x-auto rounded-md border border-border/20">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/20 bg-muted/30">
              {["#", "Peak", "Trough", "Recovery", "Depth", "Duration", "Recovery Time"].map((h, i) => (
                <th key={i} className={cn("px-3 py-2 font-medium text-muted-foreground", i <= 3 ? "text-left" : "text-right")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {episodes.map((ep, i) => (
              <tr key={i} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                <td className="px-3 py-2 text-muted-foreground/60">{i + 1}</td>
                <td className="px-3 py-2 text-muted-foreground">{ep.peak}</td>
                <td className="px-3 py-2 text-muted-foreground">{ep.trough}</td>
                <td className="px-3 py-2 text-emerald-400">{ep.recovery}</td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold text-red-400">{(ep.depth * 100).toFixed(2)}%</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{ep.durationDays}d</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{ep.recoveryDays}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-1.5 rounded-md border border-border/20 bg-primary/8 px-3 py-2 text-xs text-muted-foreground">
        <span className="text-primary font-medium shrink-0">DD Correlation {ddCorrelation.toFixed(2)}:</span>
        <span>{ddCorrelation > 0.6 ? "Portfolio drawdowns are highly correlated with market drawdowns — limited diversification benefit in crises." : "Portfolio shows some independence from market drawdowns — provides diversification in stress."}</span>
      </div>
    </div>
  );
}

// ── Section 5: Tail Risk ──────────────────────────────────────────────────────

function ReturnDistribution({ data }: { data: TailRiskData }) {
  const { histogram } = data;
  const W = 520; const H = 180;
  const padX = 36; const padY = 12;
  const innerW = W - padX * 2; const innerH = H - padY * 2 - 18;
  const maxVal = Math.max(...histogram.map((b) => Math.max(b.actual, b.normal)));
  const barW = innerW / histogram.length;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300 }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((t) => {
          const y = padY + (1 - t) * innerH;
          return <line key={t} x1={padX} y1={y} x2={W - padX} y2={y} stroke="#374151" strokeWidth={0.5} />;
        })}

        {/* Bars */}
        {histogram.map((b, i) => {
          const x = padX + i * barW;
          const barH = (b.actual / (maxVal || 1)) * innerH;
          const y = padY + innerH - barH;
          const isLeftTail = b.bin < -1.5;
          return (
            <rect key={i} x={x + 0.5} y={y} width={barW - 1} height={barH} fill={isLeftTail ? "#ef4444" : "#3b82f6"} opacity={0.7} rx={1} />
          );
        })}

        {/* Normal distribution overlay line */}
        {(() => {
          const pts = histogram.map((b, i) => {
            const x = padX + i * barW + barW / 2;
            const y = padY + (1 - b.normal / (maxVal || 1)) * innerH;
            return `${x},${y}`;
          }).join(" ");
          return <polyline points={pts} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" />;
        })()}

        {/* X-axis labels */}
        {histogram.filter((_, i) => i % 4 === 0).map((b, i) => (
          <text key={i} x={padX + (i * 4 + 0.5) * barW} y={H - 2} textAnchor="middle" fontSize={8} fill="#6b7280">{b.bin.toFixed(1)}%</text>
        ))}

        {/* Legend */}
        <rect x={padX + 4} y={padY + 2} width={10} height={7} fill="#3b82f6" opacity={0.7} rx={1} />
        <text x={padX + 18} y={padY + 9} fontSize={8} fill="#9ca3af">Actual</text>
        <line x1={padX + 55} y1={padY + 5} x2={padX + 68} y2={padY + 5} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" />
        <text x={padX + 72} y={padY + 9} fontSize={8} fill="#9ca3af">Normal</text>
        <rect x={padX + 110} y={padY + 2} width={10} height={7} fill="#ef4444" opacity={0.7} rx={1} />
        <text x={padX + 124} y={padY + 9} fontSize={8} fill="#9ca3af">Left tail</text>
      </svg>
    </div>
  );
}

function TailRiskSection() {
  const data = useMemo(() => generateTailRisk(), []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "CVaR (95%)", value: `${data.cvar95.toFixed(2)}%`, color: "text-red-400", desc: "Avg worst 5% days" },
          { label: "Tail Ratio", value: data.tailRatio.toFixed(2), color: data.tailRatio > 1 ? "text-emerald-400" : "text-red-400", desc: "95th / 5th pct gain/loss" },
          { label: "Excess Kurtosis", value: data.excessKurtosis.toFixed(2), color: data.excessKurtosis > 1 ? "text-amber-400" : "text-muted-foreground", desc: "Fat tail indicator" },
          { label: "Skewness", value: data.skewness.toFixed(2), color: data.skewness < 0 ? "text-red-400" : "text-emerald-400", desc: "Left skew = more bad days" },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border/20 bg-background/60 px-2.5 py-2">
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
            <div className={cn("text-sm font-semibold tabular-nums mt-0.5", s.color)}>{s.value}</div>
            <div className="text-[11px] text-muted-foreground/70 mt-0.5">{s.desc}</div>
          </div>
        ))}
      </div>

      <ReturnDistribution data={data} />

      {data.excessKurtosis > 1 && (
        <div className="flex items-start gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/8 px-3 py-2">
          <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground">
            <span className="text-amber-400 font-medium">Fat tails detected.</span> Excess kurtosis of {data.excessKurtosis.toFixed(2)} indicates the portfolio has more extreme return events than a normal distribution predicts. Standard VaR may underestimate true risk.
          </div>
        </div>
      )}

      <div>
        <div className="text-xs text-muted-foreground mb-2">Black Swan Resilience — Crisis Period Performance</div>
        <div className="overflow-x-auto rounded-md border border-border/20">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/20 bg-muted/30">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Crisis Period</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Portfolio</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Market</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Relative</th>
              </tr>
            </thead>
            <tbody>
              {data.crisisPerf.map((c) => {
                const rel = c.portfolio - c.market;
                return (
                  <tr key={c.name} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                    <td className="px-3 py-2 text-muted-foreground">{c.name}</td>
                    <td className={cn("px-3 py-2 text-right tabular-nums font-semibold", c.portfolio >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {c.portfolio > 0 ? "+" : ""}{c.portfolio.toFixed(1)}%
                    </td>
                    <td className={cn("px-3 py-2 text-right tabular-nums", c.market >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {c.market > 0 ? "+" : ""}{c.market.toFixed(1)}%
                    </td>
                    <td className={cn("px-3 py-2 text-right tabular-nums font-semibold", rel >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {rel > 0 ? "+" : ""}{rel.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Section 6: Peer Comparison ────────────────────────────────────────────────

function StyleBox({ styleIndex }: { styleIndex: number }) {
  const cols = ["Value", "Blend", "Growth"];
  const rows = ["Large", "Mid", "Small"];
  const row = Math.floor(styleIndex / 3);
  const col = styleIndex % 3;

  return (
    <div>
      <div className="text-[11px] text-muted-foreground mb-1 text-center">Morningstar Style Box</div>
      <div className="inline-grid grid-cols-3 gap-0.5">
        {rows.map((r, ri) =>
          cols.map((c, ci) => {
            const isActive = ri === row && ci === col;
            return (
              <div
                key={`${ri}-${ci}`}
                className={cn(
                  "h-8 w-8 rounded-sm border text-[11px] flex items-center justify-center text-center leading-none",
                  isActive ? "bg-primary/30 border-primary/60 text-primary font-semibold" : "border-border/20 bg-muted/10 text-muted-foreground/40"
                )}
                title={`${r} / ${c}`}
              >
                {isActive ? `${r[0]}/${c[0]}` : ""}
              </div>
            );
          })
        )}
      </div>
      <div className="flex justify-between mt-0.5 text-[11px] text-muted-foreground/50 w-24">
        <span>Val</span><span>Blnd</span><span>Grw</span>
      </div>
    </div>
  );
}

function QuartileBar({ quartile }: { quartile: number }) {
  const colors = ["", "bg-emerald-500", "bg-primary", "bg-amber-500", "bg-red-500"];
  const labels = ["", "Q1 (Top)", "Q2", "Q3", "Q4 (Bot)"];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5 w-16">
        {[1, 2, 3, 4].map((q) => (
          <div key={q} className={cn("h-3 flex-1 rounded-sm", q === quartile ? colors[q] : "bg-muted/30")} />
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground">{labels[quartile]}</span>
    </div>
  );
}

function PeerComparisonSection() {
  const { metrics, styleBox, activeShare, trackingError, informationRatio } = useMemo(() => generatePeerData(), []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Peer metrics table */}
        <div className="overflow-x-auto rounded-md border border-border/20">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/20 bg-muted/30">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Metric</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Value</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground pl-3">Quartile Rank</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.label} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <td className="px-3 py-2 text-muted-foreground">{m.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-foreground">{m.value}</td>
                  <td className="px-3 py-2">
                    <QuartileBar quartile={m.quartile} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Style box + conviction metrics */}
        <div className="space-y-3">
          <div className="flex items-start gap-6 p-3 rounded-md border border-border/20 bg-background/60">
            <StyleBox styleIndex={styleBox} />
            <div className="space-y-1.5 text-xs">
              <div className="text-muted-foreground font-medium">Style Classification</div>
              {[
                { label: "Active Share", value: `${activeShare.toFixed(1)}%`, color: activeShare > 60 ? "text-emerald-400" : "text-amber-400", note: activeShare > 60 ? "High conviction" : "Closet indexer risk" },
                { label: "Tracking Error", value: `${trackingError.toFixed(2)}%`, color: "text-primary", note: "Ann. excess return std dev" },
                { label: "Info Ratio", value: informationRatio.toFixed(2), color: informationRatio > 0.5 ? "text-emerald-400" : "text-amber-400", note: informationRatio > 0.5 ? "Above target" : "Target: > 0.5" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-muted-foreground/70 w-24">{s.label}</span>
                  <span className={cn("font-semibold tabular-nums", s.color)}>{s.value}</span>
                  <span className="text-muted-foreground/50 text-[11px]">{s.note}</span>
                </div>
              ))}
            </div>
          </div>

          {activeShare < 50 && (
            <div className="flex items-start gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/8 px-3 py-2">
              <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground">
                <span className="text-amber-400 font-medium">Closet indexer risk.</span> Active share below 50% suggests the portfolio closely mirrors the benchmark. Consider whether management fees are justified.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────

const TABS: { id: string; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "attribution", label: "Performance Attribution", icon: <TrendingUp className="h-3 w-3" />, color: "text-primary" },
  { id: "risk", label: "Risk-Adjusted Returns", icon: <Shield className="h-3 w-3" />, color: "text-emerald-400" },
  { id: "factors", label: "Factor Analysis", icon: <BarChart2 className="h-3 w-3" />, color: "text-primary" },
  { id: "drawdown", label: "Drawdown Deep Dive", icon: <TrendingDown className="h-3 w-3" />, color: "text-red-400" },
  { id: "tail", label: "Tail Risk", icon: <AlertTriangle className="h-3 w-3" />, color: "text-amber-400" },
  { id: "peers", label: "Peer Comparison", icon: <Users className="h-3 w-3" />, color: "text-muted-foreground" },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState("attribution");

  const sectionContent: Record<string, React.ReactNode> = {
    attribution: <PerformanceAttribution />,
    risk: <RiskAdjustedSection />,
    factors: <FactorAnalysisSection />,
    drawdown: <DrawdownSection />,
    tail: <TailRiskSection />,
    peers: <PeerComparisonSection />,
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Advanced Portfolio Analytics</h2>
        <span className="ml-auto text-xs text-muted-foreground">Professional-grade metrics</span>
      </div>

      {/* Tab nav */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? cn("bg-card border border-border shadow-sm", tab.color)
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            <span className={activeTab === tab.id ? tab.color : "text-muted-foreground"}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="rounded-lg border border-border/20 bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className={cn("h-1.5 w-1.5 rounded-full inline-block", activeTabMeta.color.replace("text-", "bg-"))} />
            <h3 className={cn("text-xs font-semibold", activeTabMeta.color)}>{activeTabMeta.label}</h3>
          </div>
          {sectionContent[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Named export alias for backward compatibility
export { AdvancedAnalytics };
