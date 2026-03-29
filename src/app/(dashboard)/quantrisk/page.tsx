"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  Activity,
  Layers,
  Target,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  PieChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 820;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 820;
}

// ── Math helpers ──────────────────────────────────────────────────────────────
function erf(x: number): number {
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741;
  const a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + p * ax);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function invNorm(p: number): number {
  if (p <= 0) return -6;
  if (p >= 1) return 6;
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425,
    pHigh = 1 - pLow;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    const a = [
      -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
      1.383577518672690e2, -3.066479806614716e1, 2.506628277459239,
    ];
    const b = [
      -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
      6.680131188771972e1, -1.328068155288572e1,
    ];
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q +
        c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

// Box-Muller using seeded PRNG
function randNormal(mean = 0, std = 1): number {
  const u1 = rand();
  const u2 = rand();
  return mean + std * Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface VaRResult {
  method: string;
  var95: number;
  var99: number;
  var999: number;
  color: string;
}

interface StressScenario {
  name: string;
  year: string;
  portfolioLoss: number;
  equityLoss: number;
  bondsGain: number;
  fxLoss: number;
  frtbCapital: number;
  color: string;
}

interface RiskFactor {
  name: string;
  contribution: number;
  marginalVaR: number;
  color: string;
}

interface BacktestResult {
  day: number;
  pnl: number;
  var99: number;
  exception: boolean;
}

// ── Data generation ───────────────────────────────────────────────────────────

function generateVaRData(confidenceIdx: number, holdingIdx: number): VaRResult[] {
  resetSeed();
  const confLevels = [0.95, 0.99, 0.999];
  const holdingDays = [1, 10];
  const sqrtT = Math.sqrt(holdingDays[holdingIdx]);
  const sigma = 0.012; // daily vol
  const portfolioValue = 10_000_000;

  // Parametric VaR
  const zScores = confLevels.map((c) => -invNorm(1 - c));
  const paramVar95 = zScores[0] * sigma * sqrtT * portfolioValue;
  const paramVar99 = zScores[1] * sigma * sqrtT * portfolioValue;
  const paramVar999 = zScores[2] * sigma * sqrtT * portfolioValue;

  // Historical VaR (simulated from sorted historical returns)
  const histReturns: number[] = [];
  for (let i = 0; i < 500; i++) histReturns.push(randNormal(0, sigma));
  histReturns.sort((a, b) => a - b);
  const hist95 = Math.abs(histReturns[Math.floor(500 * 0.05)]) * sqrtT * portfolioValue;
  const hist99 = Math.abs(histReturns[Math.floor(500 * 0.01)]) * sqrtT * portfolioValue;
  const hist999 = Math.abs(histReturns[Math.floor(500 * 0.001)]) * sqrtT * portfolioValue;

  // Monte Carlo VaR
  const mcReturns: number[] = [];
  for (let i = 0; i < 10000; i++) mcReturns.push(randNormal(0, sigma));
  mcReturns.sort((a, b) => a - b);
  const mc95 = Math.abs(mcReturns[Math.floor(10000 * 0.05)]) * sqrtT * portfolioValue;
  const mc99 = Math.abs(mcReturns[Math.floor(10000 * 0.01)]) * sqrtT * portfolioValue;
  const mc999 = Math.abs(mcReturns[Math.floor(10000 * 0.001)]) * sqrtT * portfolioValue;

  const _ = confidenceIdx; // used by slider but results show all three

  return [
    { method: "Parametric", var95: paramVar95, var99: paramVar99, var999: paramVar999, color: "#6366f1" },
    { method: "Historical", var95: hist95, var99: hist99, var999: hist999, color: "#0ea5e9" },
    { method: "Monte Carlo", var95: mc95, var99: mc99, var999: mc999, color: "#10b981" },
  ];
}

function generatePnLDistribution(): { x: number; freq: number; isLoss: boolean }[] {
  resetSeed();
  const buckets = 40;
  const min = -0.055, max = 0.055;
  const step = (max - min) / buckets;
  const freq: number[] = Array(buckets).fill(0);
  for (let i = 0; i < 2000; i++) {
    const r = randNormal(0, 0.012);
    const idx = Math.floor((r - min) / step);
    if (idx >= 0 && idx < buckets) freq[idx]++;
  }
  return freq.map((f, i) => ({
    x: min + (i + 0.5) * step,
    freq: f,
    isLoss: min + (i + 0.5) * step < -0.0245, // 99% VaR approx
  }));
}

function generateBacktestData(): BacktestResult[] {
  resetSeed();
  const sigma = 0.012;
  const portfolioValue = 10_000_000;
  const var99 = invNorm(0.99) * sigma * portfolioValue;
  const results: BacktestResult[] = [];
  for (let day = 1; day <= 250; day++) {
    const pnl = randNormal(0.0003, sigma) * portfolioValue;
    results.push({ day, pnl, var99, exception: pnl < -var99 });
  }
  return results;
}

function generateStressScenarios(): StressScenario[] {
  resetSeed();
  return [
    {
      name: "2008 GFC",
      year: "2008",
      portfolioLoss: -(0.32 + rand() * 0.08),
      equityLoss: -(0.42 + rand() * 0.1),
      bondsGain: 0.08 + rand() * 0.04,
      fxLoss: -(0.12 + rand() * 0.05),
      frtbCapital: 0.18 + rand() * 0.04,
      color: "#ef4444",
    },
    {
      name: "COVID Crash",
      year: "2020",
      portfolioLoss: -(0.22 + rand() * 0.06),
      equityLoss: -(0.34 + rand() * 0.08),
      bondsGain: 0.05 + rand() * 0.03,
      fxLoss: -(0.08 + rand() * 0.04),
      frtbCapital: 0.14 + rand() * 0.03,
      color: "#f97316",
    },
    {
      name: "Rate Shock",
      year: "2022",
      portfolioLoss: -(0.18 + rand() * 0.05),
      equityLoss: -(0.19 + rand() * 0.05),
      bondsGain: -(0.14 + rand() * 0.04), // bonds lost too
      fxLoss: -(0.06 + rand() * 0.03),
      frtbCapital: 0.12 + rand() * 0.03,
      color: "#eab308",
    },
    {
      name: "Dot-Com Bust",
      year: "2000",
      portfolioLoss: -(0.28 + rand() * 0.07),
      equityLoss: -(0.48 + rand() * 0.1),
      bondsGain: 0.10 + rand() * 0.04,
      fxLoss: -(0.05 + rand() * 0.02),
      frtbCapital: 0.16 + rand() * 0.04,
      color: "#a855f7",
    },
    {
      name: "9/11 Shock",
      year: "2001",
      portfolioLoss: -(0.09 + rand() * 0.03),
      equityLoss: -(0.14 + rand() * 0.04),
      bondsGain: 0.03 + rand() * 0.02,
      fxLoss: -(0.03 + rand() * 0.02),
      frtbCapital: 0.08 + rand() * 0.02,
      color: "#64748b",
    },
    {
      name: "Eurozone Crisis",
      year: "2011",
      portfolioLoss: -(0.15 + rand() * 0.05),
      equityLoss: -(0.22 + rand() * 0.06),
      bondsGain: 0.06 + rand() * 0.03,
      fxLoss: -(0.07 + rand() * 0.03),
      frtbCapital: 0.11 + rand() * 0.02,
      color: "#06b6d4",
    },
  ];
}

function generateRiskFactors(): RiskFactor[] {
  resetSeed();
  return [
    { name: "Equity", contribution: 38 + rand() * 6, marginalVaR: 0.0181 + rand() * 0.004, color: "#6366f1" },
    { name: "Rates", contribution: 22 + rand() * 5, marginalVaR: 0.0104 + rand() * 0.003, color: "#0ea5e9" },
    { name: "FX", contribution: 18 + rand() * 4, marginalVaR: 0.0085 + rand() * 0.002, color: "#10b981" },
    { name: "Credit", contribution: 14 + rand() * 3, marginalVaR: 0.0066 + rand() * 0.002, color: "#f59e0b" },
    { name: "Commodity", contribution: 8 + rand() * 2, marginalVaR: 0.0038 + rand() * 0.001, color: "#ef4444" },
  ];
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtUSD(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

// ── SVG Charts ────────────────────────────────────────────────────────────────

function PnLHistogram({
  data,
  varLine,
}: {
  data: { x: number; freq: number; isLoss: boolean }[];
  varLine: number;
}) {
  const W = 480, H = 180;
  const padL = 40, padR = 16, padT = 12, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxFreq = Math.max(...data.map((d) => d.freq));
  const minX = data[0].x;
  const maxX = data[data.length - 1].x;
  const xScale = (x: number) => padL + ((x - minX) / (maxX - minX)) * chartW;
  const yScale = (f: number) => padT + chartH - (f / maxFreq) * chartH;
  const barW = chartW / data.length - 1;
  // varLine in terms of return (negative)
  const varXpct = -varLine;
  const varPx = xScale(varXpct);

  const xTicks = [-0.04, -0.02, 0, 0.02, 0.04];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Axes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="currentColor" strokeOpacity={0.2} />
      <line x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH} stroke="currentColor" strokeOpacity={0.2} />
      {/* Bars */}
      {data.map((d, i) => {
        const bx = xScale(d.x) - barW / 2;
        const by = yScale(d.freq);
        const bh = padT + chartH - by;
        return (
          <rect
            key={i}
            x={bx}
            y={by}
            width={Math.max(barW, 1)}
            height={Math.max(bh, 0)}
            fill={d.isLoss ? "#ef4444" : "#6366f1"}
            fillOpacity={0.75}
          />
        );
      })}
      {/* VaR line */}
      <line x1={varPx} y1={padT} x2={varPx} y2={padT + chartH} stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 2" />
      <text x={varPx + 4} y={padT + 10} fill="#fbbf24" fontSize={9}>99% VaR</text>
      {/* X ticks */}
      {xTicks.map((t) => (
        <g key={t}>
          <line x1={xScale(t)} y1={padT + chartH} x2={xScale(t)} y2={padT + chartH + 4} stroke="currentColor" strokeOpacity={0.4} />
          <text x={xScale(t)} y={padT + chartH + 13} fill="currentColor" fillOpacity={0.5} fontSize={8} textAnchor="middle">
            {(t * 100).toFixed(0)}%
          </text>
        </g>
      ))}
      <text x={W / 2} y={H - 2} fill="currentColor" fillOpacity={0.4} fontSize={8} textAnchor="middle">Daily P&L Return</text>
    </svg>
  );
}

function TailLossChart({ backtestData }: { backtestData: BacktestResult[] }) {
  const W = 480, H = 160;
  const padL = 48, padR = 16, padT = 12, padB = 24;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxAbs = Math.max(...backtestData.map((d) => Math.abs(d.pnl)));
  const yScale = (v: number) => padT + chartH / 2 - (v / maxAbs) * (chartH / 2);
  const xScale = (i: number) => padL + (i / (backtestData.length - 1)) * chartW;

  const pnlPath = backtestData
    .map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(d.pnl).toFixed(1)}`)
    .join(" ");
  const varY = yScale(-backtestData[0].var99);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="currentColor" strokeOpacity={0.2} />
      <line x1={padL} y1={padT + chartH / 2} x2={padL + chartW} y2={padT + chartH / 2} stroke="currentColor" strokeOpacity={0.15} strokeDasharray="3 3" />
      {/* VaR band */}
      <rect x={padL} y={varY} width={chartW} height={padT + chartH - varY} fill="#ef4444" fillOpacity={0.07} />
      <line x1={padL} y1={varY} x2={padL + chartW} y2={varY} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={padL + 4} y={varY - 3} fill="#fbbf24" fontSize={8}>−99% VaR</text>
      {/* P&L line */}
      <path d={pnlPath} fill="none" stroke="#6366f1" strokeWidth={1.5} />
      {/* Exception dots */}
      {backtestData
        .filter((d) => d.exception)
        .map((d, i) => (
          <circle key={i} cx={xScale(d.day - 1)} cy={yScale(d.pnl)} r={3.5} fill="#ef4444" />
        ))}
      {/* Axis labels */}
      {[0, 50, 100, 150, 200, 250].map((t) => (
        <text key={t} x={xScale(t)} y={padT + chartH + 13} fill="currentColor" fillOpacity={0.4} fontSize={8} textAnchor="middle">
          {t}
        </text>
      ))}
      <text x={W / 2} y={H - 2} fill="currentColor" fillOpacity={0.4} fontSize={8} textAnchor="middle">Trading Day</text>
      <text x={padL - 4} y={padT + chartH / 2} fill="currentColor" fillOpacity={0.4} fontSize={8} textAnchor="middle" transform={`rotate(-90,${padL - 4},${padT + chartH / 2})`}>P&L</text>
    </svg>
  );
}

function StressBarChart({ scenarios }: { scenarios: StressScenario[] }) {
  const W = 520, H = 200;
  const padL = 100, padR = 16, padT = 16, padB = 24;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxLoss = Math.max(...scenarios.map((s) => Math.abs(s.portfolioLoss)));
  const barH = (chartH / scenarios.length) * 0.65;
  const gap = chartH / scenarios.length;
  const xScale = (v: number) => padL + (1 - Math.abs(v) / maxLoss) * chartW * 0 + (chartW / 2) + (v / maxLoss) * (chartW / 2);
  const zeroX = padL + chartW / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={zeroX} y1={padT} x2={zeroX} y2={padT + chartH} stroke="currentColor" strokeOpacity={0.25} />
      {[-0.3, -0.2, -0.1, 0].map((t) => {
        const px = zeroX + (t / maxLoss) * (chartW / 2);
        return (
          <g key={t}>
            <line x1={px} y1={padT} x2={px} y2={padT + chartH} stroke="currentColor" strokeOpacity={0.1} />
            <text x={px} y={padT + chartH + 13} fill="currentColor" fillOpacity={0.4} fontSize={8} textAnchor="middle">{(t * 100).toFixed(0)}%</text>
          </g>
        );
      })}
      {scenarios.map((s, i) => {
        const cy = padT + i * gap + gap / 2;
        const lossW = Math.abs(s.portfolioLoss / maxLoss) * (chartW / 2);
        return (
          <g key={s.name}>
            <text x={padL - 6} y={cy + 4} fill="currentColor" fillOpacity={0.7} fontSize={9} textAnchor="end">{s.name}</text>
            <rect x={zeroX - lossW} y={cy - barH / 2} width={lossW} height={barH} fill={s.color} fillOpacity={0.8} rx={2} />
            <text x={zeroX - lossW - 4} y={cy + 4} fill={s.color} fontSize={8} textAnchor="end">{fmtPct(s.portfolioLoss)}</text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 2} fill="currentColor" fillOpacity={0.4} fontSize={8} textAnchor="middle">Portfolio P&L Impact</text>
    </svg>
  );
}

function RiskPieChart({ factors }: { factors: RiskFactor[] }) {
  const cx = 90, cy = 90, r = 72;
  const total = factors.reduce((s, f) => s + f.contribution, 0);
  let startAngle = -Math.PI / 2;
  const slices = factors.map((f) => {
    const angle = (f.contribution / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle);
    const y2 = cy + r * Math.sin(startAngle + angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const midAngle = startAngle + angle / 2;
    const lx = cx + (r + 16) * Math.cos(midAngle);
    const ly = cy + (r + 16) * Math.sin(midAngle);
    const slice = { ...f, x1, y1, x2, y2, largeArc, midAngle, lx, ly, startAngle };
    startAngle += angle;
    return slice;
  });

  return (
    <svg viewBox="0 0 220 180" className="w-full h-auto">
      {slices.map((sl, i) => (
        <g key={i}>
          <path
            d={`M${cx},${cy} L${sl.x1.toFixed(2)},${sl.y1.toFixed(2)} A${r},${r} 0 ${sl.largeArc},1 ${sl.x2.toFixed(2)},${sl.y2.toFixed(2)} Z`}
            fill={sl.color}
            fillOpacity={0.85}
            stroke="hsl(var(--background))"
            strokeWidth={2}
          />
          {sl.contribution > 8 && (
            <text
              x={cx + (r * 0.6) * Math.cos(sl.startAngle + ((sl.contribution / total) * 2 * Math.PI) / 2)}
              y={cy + (r * 0.6) * Math.sin(sl.startAngle + ((sl.contribution / total) * 2 * Math.PI) / 2) + 4}
              fill="#fff"
              fontSize={9}
              textAnchor="middle"
              fontWeight="600"
            >
              {sl.contribution.toFixed(0)}%
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function QuantRiskPage() {
  const [confidenceIdx, setConfidenceIdx] = useState(1); // 0=95%, 1=99%, 2=99.9%
  const [holdingIdx, setHoldingIdx] = useState(0); // 0=1d, 1=10d
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  const confLabels = ["95%", "99%", "99.9%"];
  const holdingLabels = ["1 Day", "10 Days"];

  const varData = useMemo(() => generateVaRData(confidenceIdx, holdingIdx), [confidenceIdx, holdingIdx]);
  const pnlDist = useMemo(() => generatePnLDistribution(), []);
  const backtestData = useMemo(() => generateBacktestData(), []);
  const stressScenarios = useMemo(() => generateStressScenarios(), []);
  const riskFactors = useMemo(() => generateRiskFactors(), []);

  const exceptions = backtestData.filter((d) => d.exception).length;
  const trafficLight =
    exceptions <= 4 ? "green" : exceptions <= 9 ? "amber" : "red";

  // ES = E[Loss | Loss > VaR] ≈ VaR × φ(z) / (1-conf) × σ
  const confValues = [0.95, 0.99, 0.999];
  const zForConf = -invNorm(1 - confValues[confidenceIdx]);
  const phi = Math.exp(-0.5 * zForConf * zForConf) / Math.sqrt(2 * Math.PI);
  const sigma = 0.012;
  const sqrtT = Math.sqrt([1, 10][holdingIdx]);
  const portfolioValue = 10_000_000;
  const esMultiplier = phi / (1 - confValues[confidenceIdx]);
  const parametricES = esMultiplier * sigma * sqrtT * portfolioValue;
  const parametricVaR = varData[0][confidenceIdx === 0 ? "var95" : confidenceIdx === 1 ? "var99" : "var999"];

  const totalFactorContrib = riskFactors.reduce((s, f) => s + f.contribution, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            Quantitative Risk Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            VaR methodologies, Expected Shortfall, stress testing, FRTB capital &amp; risk factor decomposition
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">Portfolio: $10M</Badge>
          <Badge variant="outline" className="text-xs">Basel III / FRTB</Badge>
        </div>
      </motion.div>

      {/* KPI strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: "99% 1D VaR", value: fmtUSD(varData[1].var99), icon: <TrendingDown className="w-4 h-4 text-red-500" />, sub: "Historical" },
          { label: "Expected Shortfall", value: fmtUSD(parametricES), icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, sub: `ES at ${confLabels[confidenceIdx]}` },
          { label: "Backtest Exceptions", value: `${exceptions}/250`, icon: <Activity className="w-4 h-4 text-primary" />, sub: trafficLight === "green" ? "Green zone" : trafficLight === "amber" ? "Amber zone" : "Red zone" },
          { label: "Dominant Risk", value: riskFactors[0].name, icon: <PieChart className="w-4 h-4 text-primary" />, sub: `${riskFactors[0].contribution.toFixed(0)}% of VaR` },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                {kpi.icon}
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <div className="text-xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main tabs */}
      <Tabs defaultValue="var" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="var">VaR Models</TabsTrigger>
          <TabsTrigger value="es">Exp. Shortfall</TabsTrigger>
          <TabsTrigger value="stress">Stress Tests</TabsTrigger>
          <TabsTrigger value="attribution">Risk Attribution</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: VaR Models ── */}
        <TabsContent value="var" className="space-y-4 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Controls */}
            <Card className="border-border bg-card border-l-4 border-l-primary">
              <CardHeader className="pb-2 p-6">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Confidence Level</span>
                    <span className="text-xs font-semibold text-indigo-400">{confLabels[confidenceIdx]}</span>
                  </div>
                  <div className="flex gap-2">
                    {confLabels.map((l, i) => (
                      <Button
                        key={l}
                        size="sm"
                        variant={confidenceIdx === i ? "default" : "outline"}
                        className="flex-1 text-xs h-7"
                        onClick={() => setConfidenceIdx(i)}
                      >
                        {l}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Holding Period</span>
                    <span className="text-xs font-semibold text-sky-400">{holdingLabels[holdingIdx]}</span>
                  </div>
                  <div className="flex gap-2">
                    {holdingLabels.map((l, i) => (
                      <Button
                        key={l}
                        size="sm"
                        variant={holdingIdx === i ? "default" : "outline"}
                        className="flex-1 text-xs h-7"
                        onClick={() => setHoldingIdx(i)}
                      >
                        {l}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="pt-2 space-y-2 text-xs text-muted-foreground border-t border-border">
                  <p className="font-medium text-foreground">Assumptions</p>
                  <p>Daily vol (σ): 1.20%</p>
                  <p>Portfolio: $10M notional</p>
                  <p>Historical window: 500 days</p>
                  <p>MC simulations: 10,000 paths</p>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-border bg-card col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-500" />
                  VaR Comparison — {holdingLabels[holdingIdx]} Horizon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">Method</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">95% VaR</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">99% VaR</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">99.9% VaR</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">As % Portfolio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {varData.map((row) => {
                        const selVar =
                          confidenceIdx === 0 ? row.var95 : confidenceIdx === 1 ? row.var99 : row.var999;
                        return (
                          <tr key={row.method} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 font-medium" style={{ color: row.color }}>{row.method}</td>
                            <td className="py-2.5 text-right tabular-nums">{fmtUSD(row.var95)}</td>
                            <td className="py-2.5 text-right tabular-nums">{fmtUSD(row.var99)}</td>
                            <td className="py-2.5 text-right tabular-nums">{fmtUSD(row.var999)}</td>
                            <td className="py-2.5 text-right tabular-nums text-red-400">{fmtPct(selVar / portfolioValue)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Delta note */}
                <div className="mt-4 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                  <Info className="w-3 h-3 inline mr-1" />
                  Parametric assumes normal returns; Historical uses empirical distribution (fat tails captured); Monte Carlo uses 10K normal simulations. The {holdingIdx === 1 ? "10-day VaR applies the √T rule" : "1-day VaR is the base regulatory measure"}.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* P&L histogram */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                P&amp;L Distribution with VaR Threshold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PnLHistogram
                data={pnlDist}
                varLine={varData[1].var99 / portfolioValue}
              />
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />Normal P&amp;L region</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />Tail loss region (&lt; 99% VaR)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />99% VaR threshold</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Expected Shortfall ── */}
        <TabsContent value="es" className="space-y-4 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* ES vs VaR panel */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  ES vs VaR — All Confidence Levels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {confLabels.map((cl, ci) => {
                  const z = -invNorm(1 - confValues[ci]);
                  const phi2 = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
                  const esM = phi2 / (1 - confValues[ci]);
                  const varAmt = varData[0][ci === 0 ? "var95" : ci === 1 ? "var99" : "var999"];
                  const esAmt = esM * sigma * sqrtT * portfolioValue;
                  const esRatio = esAmt / varAmt;
                  return (
                    <div key={cl} className="p-3 rounded-lg border border-border bg-muted/20">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-medium text-foreground">Confidence: {cl}</span>
                        <Badge variant="outline" className="text-xs">ES/VaR ratio: {esRatio.toFixed(2)}x</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">VaR (Parametric)</div>
                          <div className="text-base font-medium text-indigo-400">{fmtUSD(varAmt)}</div>
                          <Progress value={50} className="h-1.5 mt-1" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Exp. Shortfall</div>
                          <div className="text-base font-medium text-red-400">{fmtUSD(esAmt)}</div>
                          <Progress value={50 * esRatio} className="h-1.5 mt-1" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                  <Info className="w-3 h-3 inline mr-1" />
                  Expected Shortfall (CVaR) = average loss in the worst (1−c)% of cases. Under FRTB, ES at 97.5% replaced VaR at 99%.
                </div>
              </CardContent>
            </Card>

            {/* Backtesting */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-500" />
                  250-Day Backtesting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <TailLossChart backtestData={backtestData} />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/20 border border-border">
                    <div className="text-lg font-medium text-foreground">{exceptions}</div>
                    <div className="text-xs text-muted-foreground">Exceptions</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/20 border border-border">
                    <div className="text-lg font-medium text-foreground">{fmtPct(exceptions / 250)}</div>
                    <div className="text-xs text-muted-foreground">Exception rate</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/20 border border-border">
                    <div className="text-lg font-medium text-foreground">1%</div>
                    <div className="text-xs text-muted-foreground">Expected rate</div>
                  </div>
                </div>
                {/* Traffic light */}
                <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${trafficLight === "green" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : trafficLight === "amber" ? "border-amber-500/40 bg-amber-500/10 text-amber-400" : "border-red-500/40 bg-red-500/10 text-red-400"}`}>
                  {trafficLight === "green" ? <CheckCircle className="w-4 h-4" /> : trafficLight === "amber" ? <AlertTriangle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <div>
                    <span className="font-medium capitalize">{trafficLight} zone</span>
                    {" — "}
                    {trafficLight === "green" && "0–4 exceptions: model acceptable (Basel Zone 1)"}
                    {trafficLight === "amber" && "5–9 exceptions: model under scrutiny (Basel Zone 2)"}
                    {trafficLight === "red" && "10+ exceptions: model rejected (Basel Zone 3)"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ES interpretation card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                FRTB Framework — ES Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "ES (97.5%, 1D)", value: fmtUSD(varData[0].var99 * 1.18), note: "IMA base" },
                  { label: "Stressed ES", value: fmtUSD(varData[0].var99 * 1.18 * 1.3), note: "×1.3 stress mult." },
                  { label: "Liquidity Adj. ES", value: fmtUSD(varData[0].var99 * 1.18 * 1.5), note: "LH-adjusted" },
                  { label: "FRTB Capital Req.", value: fmtUSD(varData[0].var99 * 1.18 * 2.1), note: "×multiplier" },
                ].map((m) => (
                  <div key={m.label} className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                    <div className="text-lg font-medium text-foreground">{m.value}</div>
                    <div className="text-xs text-muted-foreground">{m.note}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Stress Tests ── */}
        <TabsContent value="stress" className="space-y-4 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Scenario list */}
            <div className="space-y-2 lg:col-span-2">
              <h3 className="text-xs font-medium text-muted-foreground">Historical Scenarios</h3>
              {stressScenarios.map((sc, i) => (
                <motion.div
                  key={sc.name}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedScenario(i === selectedScenario ? null : i)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedScenario === i
                      ? "border-indigo-500/60 bg-indigo-500/10"
                      : "border-border bg-card hover:bg-muted/30"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-foreground">{sc.name}</div>
                      <div className="text-xs text-muted-foreground">{sc.year}</div>
                    </div>
                    <Badge
                      variant="outline"
                      style={{ color: sc.color, borderColor: `${sc.color}50` }}
                      className="text-xs"
                    >
                      {fmtPct(sc.portfolioLoss)}
                    </Badge>
                  </div>
                  {selectedScenario === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2 pt-2 border-t border-border/50 grid grid-cols-2 gap-1 text-xs"
                    >
                      <span className="text-muted-foreground">Equity P&L:</span>
                      <span className="text-right text-red-400">{fmtPct(sc.equityLoss)}</span>
                      <span className="text-muted-foreground">Bond P&L:</span>
                      <span className={`text-right ${sc.bondsGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtPct(sc.bondsGain)}</span>
                      <span className="text-muted-foreground">FX P&L:</span>
                      <span className="text-right text-red-400">{fmtPct(sc.fxLoss)}</span>
                      <span className="text-muted-foreground">FRTB Capital:</span>
                      <span className="text-right text-amber-400">{fmtPct(sc.frtbCapital)}</span>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Bar chart */}
            <Card className="border-border bg-card lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  Portfolio P&amp;L Impact by Scenario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StressBarChart scenarios={stressScenarios} />
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">FRTB Capital Requirements</h4>
                  {stressScenarios.map((sc) => (
                    <div key={sc.name} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-28 shrink-0">{sc.name}</span>
                      <Progress
                        value={sc.frtbCapital * 100}
                        className="flex-1 h-2"
                      />
                      <span className="text-xs font-medium tabular-nums w-12 text-right" style={{ color: sc.color }}>
                        {fmtPct(sc.frtbCapital)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scenario comparison matrix */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Cross-Scenario Risk Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground">Scenario</th>
                      <th className="text-right py-2 text-muted-foreground">Portfolio P&L</th>
                      <th className="text-right py-2 text-muted-foreground">Equity Impact</th>
                      <th className="text-right py-2 text-muted-foreground">Bond Impact</th>
                      <th className="text-right py-2 text-muted-foreground">FX Impact</th>
                      <th className="text-right py-2 text-muted-foreground">FRTB Capital</th>
                      <th className="text-right py-2 text-muted-foreground">$ Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stressScenarios.map((sc) => (
                      <tr key={sc.name} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-2 font-medium" style={{ color: sc.color }}>{sc.name} ({sc.year})</td>
                        <td className="py-2 text-right text-red-400 tabular-nums">{fmtPct(sc.portfolioLoss)}</td>
                        <td className="py-2 text-right text-red-400 tabular-nums">{fmtPct(sc.equityLoss)}</td>
                        <td className={`py-2 text-right tabular-nums ${sc.bondsGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtPct(sc.bondsGain)}</td>
                        <td className="py-2 text-right text-red-400 tabular-nums">{fmtPct(sc.fxLoss)}</td>
                        <td className="py-2 text-right text-amber-400 tabular-nums">{fmtPct(sc.frtbCapital)}</td>
                        <td className="py-2 text-right text-red-500 tabular-nums font-medium">{fmtUSD(sc.portfolioLoss * portfolioValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Risk Attribution ── */}
        <TabsContent value="attribution" className="space-y-4 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie + legend */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-500" />
                  Factor VaR Decomposition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-48 shrink-0">
                    <RiskPieChart factors={riskFactors} />
                  </div>
                  <div className="flex-1 space-y-2">
                    {riskFactors.map((f) => (
                      <div key={f.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                        <span className="text-xs text-foreground w-16">{f.name}</span>
                        <div className="flex-1">
                          <Progress value={(f.contribution / totalFactorContrib) * 100} className="h-1.5" />
                        </div>
                        <span className="text-xs font-medium tabular-nums w-10 text-right" style={{ color: f.color }}>
                          {f.contribution.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
                      Total: {totalFactorContrib.toFixed(1)}% allocated across {riskFactors.length} risk factors
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marginal VaR */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-500" />
                  Marginal VaR by Factor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {riskFactors.map((f) => {
                  const mvarPct = (f.marginalVaR * 100);
                  const mvarUSD = f.marginalVaR * portfolioValue;
                  return (
                    <div key={f.name} className="p-3 rounded-lg border border-border bg-muted/10 hover:bg-muted/20 transition-colors">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium" style={{ color: f.color }}>{f.name} Factor</span>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{mvarPct.toFixed(3)}%</Badge>
                          <Badge variant="outline" className="text-xs">{fmtUSD(mvarUSD)}</Badge>
                        </div>
                      </div>
                      <Progress value={(f.marginalVaR / riskFactors[0].marginalVaR) * 100} className="h-1.5" />
                      <div className="text-xs text-muted-foreground mt-1">
                        Marginal VaR: change in portfolio VaR per unit increase in {f.name.toLowerCase()} exposure
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Component VaR table */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Component VaR — Position Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground">Asset / Factor</th>
                      <th className="text-right py-2 text-muted-foreground">Notional</th>
                      <th className="text-right py-2 text-muted-foreground">Weight</th>
                      <th className="text-right py-2 text-muted-foreground">Beta to Factor</th>
                      <th className="text-right py-2 text-muted-foreground">Marginal VaR</th>
                      <th className="text-right py-2 text-muted-foreground">Component VaR</th>
                      <th className="text-right py-2 text-muted-foreground">% Total VaR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskFactors.map((f, i) => {
                      const notional = portfolioValue * (f.contribution / totalFactorContrib);
                      const weight = f.contribution / totalFactorContrib;
                      const betaVal = 0.85 + i * 0.15 + rand() * 0.2;
                      const compVaR = f.marginalVaR * notional;
                      return (
                        <tr key={f.name} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="py-2 font-medium" style={{ color: f.color }}>{f.name}</td>
                          <td className="py-2 text-right tabular-nums">{fmtUSD(notional)}</td>
                          <td className="py-2 text-right tabular-nums">{fmtPct(weight)}</td>
                          <td className="py-2 text-right tabular-nums">{betaVal.toFixed(2)}x</td>
                          <td className="py-2 text-right tabular-nums text-amber-400">{(f.marginalVaR * 100).toFixed(4)}%</td>
                          <td className="py-2 text-right tabular-nums font-medium">{fmtUSD(compVaR)}</td>
                          <td className="py-2 text-right tabular-nums">{f.contribution.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                    <tr className="font-medium border-t border-border">
                      <td className="py-2">Total Portfolio</td>
                      <td className="py-2 text-right tabular-nums">{fmtUSD(portfolioValue)}</td>
                      <td className="py-2 text-right">100%</td>
                      <td className="py-2 text-right">1.00x</td>
                      <td className="py-2 text-right text-amber-400">{((varData[1].var99 / portfolioValue) * 100).toFixed(4)}%</td>
                      <td className="py-2 text-right">{fmtUSD(varData[1].var99)}</td>
                      <td className="py-2 text-right">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                <Info className="w-3 h-3 inline mr-1" />
                Component VaR sums to total VaR (diversification benefit already captured in covariance matrix). Marginal VaR measures sensitivity of total VaR to marginal increase in a position.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
