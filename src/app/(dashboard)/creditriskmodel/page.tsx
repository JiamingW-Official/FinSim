"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Activity,
  Layers,
  Target,
  Info,
  DollarSign,
  Percent,
  PieChart,
  RefreshCw,
  ArrowRight,
  Building2,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 833;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const RAND_POOL: number[] = [];
for (let i = 0; i < 600; i++) RAND_POOL.push(rand());
let ri = 0;
const r = () => RAND_POOL[ri++ % RAND_POOL.length];

// ── Math helpers ──────────────────────────────────────────────────────────────

function erf(x: number): number {
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741,
    a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + p * ax);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtPct(n: number, d = 2): string {
  return `${n.toFixed(d)}%`;
}

function fmtM(n: number): string {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(2)}B`;
  return `$${n.toFixed(1)}M`;
}

function fmtNum(n: number, d = 2): string {
  return n.toFixed(d);
}

// ── Merton Model helpers ───────────────────────────────────────────────────────

function mertonDD(
  V: number,
  D: number,
  sigma: number,
  T: number,
  r: number
): { dd: number; pd: number; eqValue: number; debtValue: number } {
  if (V <= 0 || D <= 0 || sigma <= 0 || T <= 0) {
    return { dd: 0, pd: 0.5, eqValue: 0, debtValue: 0 };
  }
  const d1 =
    (Math.log(V / D) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const pd = normalCDF(-d2);
  const eqValue =
    V * normalCDF(d1) - D * Math.exp(-r * T) * normalCDF(d2);
  const debtValue = V - eqValue;
  return { dd: d2, pd, eqValue, debtValue };
}

// ── Credit Ratings ────────────────────────────────────────────────────────────

const RATINGS = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "D"];
const RATING_COLORS: Record<string, string> = {
  AAA: "#22c55e",
  AA: "#4ade80",
  A: "#86efac",
  BBB: "#fbbf24",
  BB: "#f97316",
  B: "#ef4444",
  CCC: "#dc2626",
  D: "#7f1d1d",
};

// 1-year transition matrix (rows = from, cols = to)
// Based loosely on historical S&P/Moody's data
const TRANSITION_1Y: number[][] = [
  [89.37, 6.44, 0.52, 0.09, 0.06, 0.02, 0.00, 0.00], // AAA
  [0.60, 87.76, 7.94, 1.10, 0.24, 0.10, 0.02, 0.00], // AA
  [0.04, 2.13, 88.96, 5.27, 0.80, 0.25, 0.05, 0.06], // A
  [0.01, 0.16, 4.22, 85.61, 6.04, 2.08, 0.55, 0.28], // BBB
  [0.01, 0.06, 0.28, 5.78, 79.44, 8.27, 2.47, 1.22], // BB
  [0.00, 0.05, 0.19, 0.48, 6.14, 77.29, 5.21, 5.71], // B
  [0.00, 0.01, 0.09, 0.26, 1.51, 11.21, 56.61, 26.87], // CCC
  [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 100.0], // D
];

// 5-year cumulative default rates (%)
const CUM_DEFAULT_5Y: Record<string, number> = {
  AAA: 0.10,
  AA: 0.30,
  A: 0.71,
  BBB: 3.42,
  BB: 12.4,
  B: 25.6,
  CCC: 52.8,
  D: 100.0,
};

// ── Portfolio loans ───────────────────────────────────────────────────────────

interface Loan {
  id: number;
  name: string;
  sector: string;
  rating: string;
  ead: number;
  pd: number;
  lgd: number;
  el: number;
  weight: number;
}

function buildPortfolio(): Loan[] {
  const names = [
    "Acme Industries",
    "Beta Retail Corp",
    "Gamma Energy LLC",
    "Delta Tech Inc",
    "Epsilon Finance",
    "Zeta Healthcare",
    "Eta Real Estate",
    "Theta Logistics",
    "Iota Consumer",
    "Kappa Media",
  ];
  const sectors = [
    "Industrial",
    "Retail",
    "Energy",
    "Technology",
    "Finance",
    "Healthcare",
    "Real Estate",
    "Logistics",
    "Consumer",
    "Media",
  ];
  const ratings = ["BBB", "BB", "BBB", "A", "BBB", "A", "BB", "BBB", "B", "BB"];
  const eads = [120, 85, 200, 150, 95, 110, 180, 70, 60, 90];

  const pdMap: Record<string, number> = {
    AAA: 0.01, AA: 0.03, A: 0.07, BBB: 0.28, BB: 1.22, B: 5.71, CCC: 26.87, D: 100,
  };
  const lgdMap: Record<string, number> = {
    Industrial: 42, Retail: 55, Energy: 48, Technology: 60, Finance: 35,
    Healthcare: 40, "Real Estate": 30, Logistics: 50, Consumer: 58, Media: 65,
  };

  const totalEad = eads.reduce((a, b) => a + b, 0);
  return names.map((name, i) => {
    const pd = pdMap[ratings[i]] / 100;
    const lgd = lgdMap[sectors[i]] / 100;
    const ead = eads[i];
    return {
      id: i + 1,
      name,
      sector: sectors[i],
      rating: ratings[i],
      ead,
      pd,
      lgd,
      el: pd * lgd * ead,
      weight: ead / totalEad,
    };
  });
}

const PORTFOLIO_LOANS = buildPortfolio();

// ── Shared components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral";
  icon?: React.ElementType;
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : "text-white";

  return (
    <div className="bg-muted/60 border border-border/50 rounded-lg p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </div>
      <div className={`text-lg font-bold ${valClass}`}>{value}</div>
      {sub && <div className="text-muted-foreground text-xs">{sub}</div>}
    </div>
  );
}

// ── SVG Default Probability Gauge ─────────────────────────────────────────────

function DefaultGauge({ pd }: { pd: number }) {
  const cx = 120,
    cy = 110,
    r = 80;
  const startAngle = -200;
  const sweepAngle = 220;

  function polarToXY(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(aStart: number, aSweep: number, radius: number) {
    const end = aStart + aSweep;
    const s = polarToXY(aStart, radius);
    const e = polarToXY(end, radius);
    const largeArc = Math.abs(aSweep) > 180 ? 1 : 0;
    const dir = aSweep > 0 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} ${dir} ${e.x} ${e.y}`;
  }

  // pd clamped to [0, 1], needle angle
  const pdClamped = Math.min(Math.max(pd, 0), 1);
  const logPd = pdClamped > 0 ? Math.log10(Math.max(pdClamped, 0.0001)) : -4;
  const logMin = -4; // 0.01%
  const logMax = Math.log10(1); // 100%
  const frac = (logPd - logMin) / (logMax - logMin);
  const needleAngle = startAngle + frac * sweepAngle;

  const zones = [
    { color: "#22c55e", sweep: sweepAngle * 0.35 },
    { color: "#fbbf24", sweep: sweepAngle * 0.3 },
    { color: "#f97316", sweep: sweepAngle * 0.2 },
    { color: "#ef4444", sweep: sweepAngle * 0.15 },
  ];

  let zoneStart = startAngle;
  const zoneArcs = zones.map((z) => {
    const path = arcPath(zoneStart, z.sweep, r);
    zoneStart += z.sweep;
    return { path, color: z.color };
  });

  const needleTip = polarToXY(needleAngle, r - 10);

  const pdColor =
    pdClamped < 0.01
      ? "#22c55e"
      : pdClamped < 0.05
      ? "#fbbf24"
      : pdClamped < 0.2
      ? "#f97316"
      : "#ef4444";

  return (
    <svg viewBox="0 0 240 130" className="w-full max-w-xs mx-auto">
      {/* Background arc */}
      <path
        d={arcPath(startAngle, sweepAngle, r)}
        fill="none"
        stroke="#27272a"
        strokeWidth={14}
        strokeLinecap="round"
      />
      {/* Colored zone arcs */}
      {zoneArcs.map((z, i) => (
        <path
          key={i}
          d={z.path}
          fill="none"
          stroke={z.color}
          strokeWidth={14}
          strokeLinecap="butt"
          opacity={0.8}
        />
      ))}
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={needleTip.x}
        y2={needleTip.y}
        stroke={pdColor}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={5} fill={pdColor} />
      {/* Labels */}
      <text x={cx} y={cy + 20} textAnchor="middle" fill={pdColor} fontSize={18} fontWeight="bold">
        {(pdClamped * 100).toFixed(2)}%
      </text>
      <text x={cx} y={cy + 34} textAnchor="middle" fill="#71717a" fontSize={10}>
        Probability of Default
      </text>
      <text x={40} y={cy + 24} fill="#22c55e" fontSize={9}>Low</text>
      <text x={180} y={cy + 24} fill="#ef4444" fontSize={9}>High</text>
    </svg>
  );
}

// ── SVG Migration Heatmap ──────────────────────────────────────────────────────

function MigrationHeatmap({ matrix }: { matrix: number[][] }) {
  const cellSize = 44;
  const marginLeft = 44;
  const marginTop = 44;
  const w = marginLeft + RATINGS.length * cellSize + 4;
  const h = marginTop + RATINGS.length * cellSize + 4;

  function heatColor(val: number, isDefault: boolean): string {
    if (isDefault && val > 0) return `rgba(239,68,68,${Math.min(val / 30, 1)})`;
    const t = Math.min(val / 100, 1);
    if (t > 0.6) return `rgba(34,197,94,${t})`;
    if (t > 0.1) return `rgba(251,191,36,${t * 0.9})`;
    return `rgba(239,68,68,${Math.min(val / 10, 0.8)})`;
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {/* Column headers (To) */}
      {RATINGS.map((r2, j) => (
        <text
          key={j}
          x={marginLeft + j * cellSize + cellSize / 2}
          y={marginTop - 6}
          textAnchor="middle"
          fill={RATING_COLORS[r2]}
          fontSize={9}
          fontWeight="bold"
        >
          {r2}
        </text>
      ))}
      {/* Row headers (From) */}
      {RATINGS.map((r1, i) => (
        <text
          key={i}
          x={marginLeft - 4}
          y={marginTop + i * cellSize + cellSize / 2 + 4}
          textAnchor="end"
          fill={RATING_COLORS[r1]}
          fontSize={9}
          fontWeight="bold"
        >
          {r1}
        </text>
      ))}
      {/* Cells */}
      {matrix.map((row, i) =>
        row.map((val, j) => (
          <g key={`${i}-${j}`}>
            <rect
              x={marginLeft + j * cellSize + 1}
              y={marginTop + i * cellSize + 1}
              width={cellSize - 2}
              height={cellSize - 2}
              fill={heatColor(val, j === RATINGS.length - 1)}
              rx={2}
            />
            <text
              x={marginLeft + j * cellSize + cellSize / 2}
              y={marginTop + i * cellSize + cellSize / 2 + 4}
              textAnchor="middle"
              fill={val > 10 ? "#fff" : "#a1a1aa"}
              fontSize={8}
            >
              {val.toFixed(val >= 10 ? 0 : 1)}
            </text>
          </g>
        ))
      )}
      {/* Axis labels */}
      <text x={marginLeft + (RATINGS.length * cellSize) / 2} y={h - 2} textAnchor="middle" fill="#71717a" fontSize={9}>
        To Rating →
      </text>
    </svg>
  );
}

// ── SVG Loss Distribution Histogram ───────────────────────────────────────────

function LossHistogram({
  pd,
  lgd,
  ead,
  confidence,
}: {
  pd: number;
  lgd: number;
  ead: number;
  confidence: number;
}) {
  const el = pd * lgd * ead;
  const sigma = Math.sqrt(pd * (1 - pd)) * lgd * ead;
  const bins = 40;
  const maxLoss = ead * lgd * 1.2;
  const step = maxLoss / bins;

  // Normal approximation with slight skew
  const counts: number[] = Array(bins).fill(0);
  const total = 2000;
  for (let i = 0; i < total; i++) {
    const u1 = Math.max(r(), 1e-9);
    const u2 = r();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const loss = el + sigma * z * 1.5 + (r() - 0.5) * sigma * 0.5;
    const clamped = Math.max(0, Math.min(loss, maxLoss - 0.01));
    const bin = Math.floor(clamped / step);
    if (bin >= 0 && bin < bins) counts[bin]++;
  }

  const maxCount = Math.max(...counts);
  const svgW = 440, svgH = 200;
  const padL = 40, padR = 20, padT = 20, padB = 30;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const barW = chartW / bins;

  // VaR at confidence level
  let cumulative = 0;
  let varLoss = 0;
  for (let i = 0; i < bins; i++) {
    cumulative += counts[i] / total;
    if (cumulative >= confidence / 100) {
      varLoss = (i + 0.5) * step;
      break;
    }
  }

  const ul = varLoss - el;
  const econCapital = Math.max(ul, 0);

  function xPos(lossVal: number) {
    return padL + (lossVal / maxLoss) * chartW;
  }

  return (
    <div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={padL}
            y1={padT + t * chartH}
            x2={svgW - padR}
            y2={padT + t * chartH}
            stroke="#3f3f46"
            strokeDasharray="2,3"
          />
        ))}
        {/* Bars */}
        {counts.map((c, i) => {
          const bh = (c / maxCount) * chartH;
          const lossVal = (i + 0.5) * step;
          const isVaR = lossVal >= el && lossVal <= varLoss;
          return (
            <rect
              key={i}
              x={padL + i * barW + 0.5}
              y={padT + chartH - bh}
              width={barW - 1}
              height={bh}
              fill={isVaR ? "#f97316" : "#3b82f6"}
              opacity={0.75}
            />
          );
        })}
        {/* EL line */}
        <line
          x1={xPos(el)}
          y1={padT}
          x2={xPos(el)}
          y2={padT + chartH}
          stroke="#22c55e"
          strokeWidth={2}
          strokeDasharray="4,3"
        />
        <text x={xPos(el) + 3} y={padT + 12} fill="#22c55e" fontSize={9}>EL</text>
        {/* VaR line */}
        <line
          x1={xPos(varLoss)}
          y1={padT}
          x2={xPos(varLoss)}
          y2={padT + chartH}
          stroke="#f43f5e"
          strokeWidth={2}
          strokeDasharray="4,3"
        />
        <text x={xPos(varLoss) + 3} y={padT + 12} fill="#f43f5e" fontSize={9}>
          VaR {confidence}%
        </text>
        {/* X axis */}
        <line x1={padL} y1={padT + chartH} x2={svgW - padR} y2={padT + chartH} stroke="#52525b" />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={padL + t * chartW} y={padT + chartH + 12} textAnchor="middle" fill="#71717a" fontSize={8}>
            {fmtM(t * maxLoss)}
          </text>
        ))}
        <text x={svgW / 2} y={svgH - 2} textAnchor="middle" fill="#71717a" fontSize={9}>Loss Amount</text>
      </svg>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="bg-muted/60 border border-border/50 rounded p-2 text-center">
          <div className="text-muted-foreground text-xs">Expected Loss</div>
          <div className="text-emerald-400 font-bold text-sm">{fmtM(el)}</div>
        </div>
        <div className="bg-muted/60 border border-border/50 rounded p-2 text-center">
          <div className="text-muted-foreground text-xs">VaR ({confidence}%)</div>
          <div className="text-rose-400 font-bold text-sm">{fmtM(varLoss)}</div>
        </div>
        <div className="bg-muted/60 border border-border/50 rounded p-2 text-center">
          <div className="text-muted-foreground text-xs">Economic Capital</div>
          <div className="text-amber-400 font-bold text-sm">{fmtM(econCapital)}</div>
        </div>
      </div>
    </div>
  );
}

// ── SVG Portfolio Scatter ──────────────────────────────────────────────────────

function PortfolioScatter({
  loans,
  correlation,
}: {
  loans: Loan[];
  correlation: number;
}) {
  const svgW = 360, svgH = 220;
  const padL = 50, padR = 20, padT = 20, padB = 36;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const totalEad = loans.reduce((a, l) => a + l.ead, 0);

  // Simulate 300 portfolio loss scenarios
  const scenarios: { base: number; stressed: number }[] = [];
  for (let i = 0; i < 300; i++) {
    let baseLoss = 0, stressedLoss = 0;
    const systemFactor = r() * 2 - 1; // common factor
    for (const loan of loans) {
      const idio = r() * 2 - 1;
      const factor = Math.sqrt(correlation) * systemFactor + Math.sqrt(1 - correlation) * idio;
      const defaultThreshold = -1.5 + factor * 0.5;
      const pdAdj = Math.max(0, Math.min(loan.pd * (1 + factor * 0.3), 1));
      const loss = (r() < pdAdj ? loan.lgd * loan.ead : 0);
      baseLoss += loss;
      // Stress: double PDs, correlation spikes
      const stressFactor = Math.sqrt(0.8) * systemFactor + Math.sqrt(0.2) * (r() * 2 - 1);
      const pdStressed = Math.max(0, Math.min(loan.pd * 3 * (1 + stressFactor * 0.5), 1));
      const lossStressed = (r() < pdStressed ? loan.lgd * loan.ead * 1.2 : 0);
      stressedLoss += lossStressed;
    }
    scenarios.push({ base: baseLoss, stressed: stressedLoss });
  }

  const maxLoss = Math.max(...scenarios.map((s) => Math.max(s.base, s.stressed))) * 1.05;

  function sx(v: number) {
    return padL + (v / maxLoss) * chartW;
  }
  function sy(v: number) {
    return padT + chartH - (v / maxLoss) * chartH;
  }

  const avgBase =
    scenarios.reduce((a, s) => a + s.base, 0) / scenarios.length;
  const avgStressed =
    scenarios.reduce((a, s) => a + s.stressed, 0) / scenarios.length;

  return (
    <div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={padL} y1={padT + t * chartH} x2={svgW - padR} y2={padT + t * chartH} stroke="#3f3f46" strokeDasharray="2,3" />
            <line x1={padL + t * chartW} y1={padT} x2={padL + t * chartW} y2={padT + chartH} stroke="#3f3f46" strokeDasharray="2,3" />
          </g>
        ))}
        {/* Scatter points */}
        {scenarios.map((s, i) => (
          <circle
            key={i}
            cx={sx(s.base)}
            cy={sy(s.stressed)}
            r={2.5}
            fill="#3b82f6"
            opacity={0.4}
          />
        ))}
        {/* Diagonal reference line */}
        <line x1={sx(0)} y1={sy(0)} x2={sx(maxLoss * 0.8)} y2={sy(maxLoss * 0.8)} stroke="#52525b" strokeDasharray="3,3" />
        {/* Avg markers */}
        <circle cx={sx(avgBase)} cy={sy(avgStressed)} r={6} fill="none" stroke="#f97316" strokeWidth={2} />
        {/* Axes */}
        <line x1={padL} y1={padT + chartH} x2={svgW - padR} y2={padT + chartH} stroke="#52525b" />
        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="#52525b" />
        {/* Labels */}
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <text x={padL + t * chartW} y={padT + chartH + 14} textAnchor="middle" fill="#71717a" fontSize={8}>
              {fmtM(t * maxLoss)}
            </text>
            <text x={padL - 4} y={padT + (1 - t) * chartH + 4} textAnchor="end" fill="#71717a" fontSize={8}>
              {fmtM(t * maxLoss)}
            </text>
          </g>
        ))}
        <text x={svgW / 2} y={svgH - 4} textAnchor="middle" fill="#71717a" fontSize={9}>Base Loss →</text>
        <text x={10} y={padT + chartH / 2} textAnchor="middle" fill="#71717a" fontSize={9} transform={`rotate(-90, 10, ${padT + chartH / 2})`}>Stressed Loss</text>
        {/* Legend */}
        <circle cx={svgW - padR - 80} cy={padT + 14} r={3} fill="#3b82f6" opacity={0.5} />
        <text x={svgW - padR - 74} y={padT + 18} fill="#71717a" fontSize={8}>Scenarios</text>
        <circle cx={svgW - padR - 80} cy={padT + 26} r={5} fill="none" stroke="#f97316" strokeWidth={1.5} />
        <text x={svgW - padR - 74} y={padT + 30} fill="#71717a" fontSize={8}>Average</text>
      </svg>
      <div className="grid grid-cols-2 gap-2 mt-1.5">
        <div className="bg-muted/60 border border-border/50 rounded p-2 text-center">
          <div className="text-muted-foreground text-xs">Avg Base Loss</div>
          <div className="text-primary font-bold text-sm">{fmtM(avgBase)}</div>
        </div>
        <div className="bg-muted/60 border border-border/50 rounded p-2 text-center">
          <div className="text-muted-foreground text-xs">Avg Stressed Loss</div>
          <div className="text-rose-400 font-bold text-sm">{fmtM(avgStressed)}</div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CreditRiskModelPage() {
  // Merton Model state
  const [firmValue, setFirmValue] = useState(150); // $M
  const [debtFace, setDebtFace] = useState(100); // $M
  const [firmVol, setFirmVol] = useState(25); // %
  const [maturity, setMaturity] = useState(1); // years
  const riskFree = 0.045;

  // Migration state
  const [selectedFromRating, setSelectedFromRating] = useState("BBB");
  const [showCumulative, setShowCumulative] = useState(false);
  const [animStep, setAnimStep] = useState(0);

  // Loss Distribution state
  const [ldPd, setLdPd] = useState(3); // %
  const [ldLgd, setLdLgd] = useState(45); // %
  const [ldEad, setLdEad] = useState(500); // $M
  const [confidence, setConfidence] = useState(99); // %

  // Portfolio state
  const [portCorr, setPortCorr] = useState(0.15);
  const [selectedLoan, setSelectedLoan] = useState<number | null>(null);

  // ── Merton calculations ──
  const merton = useMemo(() => {
    return mertonDD(
      firmValue,
      debtFace,
      firmVol / 100,
      maturity,
      riskFree
    );
  }, [firmValue, debtFace, firmVol, maturity]);

  const leverage = (debtFace / firmValue) * 100;

  // ── Migration: upgrade/downgrade probabilities ──
  const ratingIdx = RATINGS.indexOf(selectedFromRating);
  const migRow =
    ratingIdx >= 0 ? TRANSITION_1Y[ratingIdx] : TRANSITION_1Y[3];

  const upgradePct = migRow.slice(0, ratingIdx).reduce((a, b) => a + b, 0);
  const downgradePct = migRow
    .slice(ratingIdx + 1)
    .reduce((a, b) => a + b, 0);
  const stablePct = migRow[ratingIdx];
  const defaultPct = migRow[RATINGS.length - 1];

  // Migration animation steps (10 companies at start BBB)
  const migrationSteps = [
    { label: "Year 0", distribution: { AAA: 0, AA: 0, A: 0, BBB: 10, BB: 0, B: 0, CCC: 0, D: 0 } },
    { label: "Year 1", distribution: { AAA: 0, AA: 0, A: 0.4, BBB: 8.6, BB: 0.6, B: 0.2, CCC: 0.1, D: 0.03 } },
    { label: "Year 3", distribution: { AAA: 0, AA: 0.1, A: 0.9, BBB: 7.2, BB: 1.1, B: 0.5, CCC: 0.2, D: 0.1 } },
    { label: "Year 5", distribution: { AAA: 0, AA: 0.2, A: 1.1, BBB: 6.1, BB: 1.5, B: 0.8, CCC: 0.3, D: 0.34 } },
  ];
  const curMigStep = migrationSteps[Math.min(animStep, migrationSteps.length - 1)];

  // ── Portfolio stats ──
  const totalEL = PORTFOLIO_LOANS.reduce((a, l) => a + l.el, 0);
  const totalEAD = PORTFOLIO_LOANS.reduce((a, l) => a + l.ead, 0);
  const avgPD = PORTFOLIO_LOANS.reduce((a, l) => a + l.pd * l.weight, 0);
  const avgLGD = PORTFOLIO_LOANS.reduce((a, l) => a + l.lgd * l.weight, 0);

  // HHI concentration
  const hhi = PORTFOLIO_LOANS.reduce((a, l) => a + l.weight * l.weight, 0);
  const hhiPct = hhi * 100;

  // Diversification benefit
  const undiversifiedLoss = PORTFOLIO_LOANS.reduce(
    (a, l) => a + l.pd * l.lgd * l.ead,
    0
  );
  const divBenefit = (1 - Math.sqrt(portCorr)) * undiversifiedLoss * 0.3;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg border border-border">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Credit Risk Modeling</h1>
            <p className="text-muted-foreground text-sm">
              Merton model · KMV distance to default · migration matrices · LGD/PD/EAD · portfolio credit risk
            </p>
          </div>
        </div>

        {/* Top stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <StatCard
            icon={Activity}
            label="Merton PD"
            value={fmtPct(merton.pd * 100)}
            sub={`DD = ${fmtNum(merton.dd, 2)}σ`}
            highlight={merton.pd < 0.05 ? "pos" : merton.pd < 0.2 ? "neutral" : "neg"}
          />
          <StatCard
            icon={TrendingDown}
            label="Portfolio EL"
            value={fmtM(totalEL)}
            sub={`${fmtPct(totalEL / totalEAD * 100, 3)} of EAD`}
            highlight="neutral"
          />
          <StatCard
            icon={Layers}
            label="HHI Concentration"
            value={fmtPct(hhiPct, 2)}
            sub={hhiPct < 15 ? "Well diversified" : hhiPct < 25 ? "Moderate" : "Concentrated"}
            highlight={hhiPct < 15 ? "pos" : hhiPct < 25 ? "neutral" : "neg"}
          />
          <StatCard
            icon={DollarSign}
            label="Equity Value"
            value={fmtM(merton.eqValue)}
            sub={`Debt: ${fmtM(merton.debtValue)}`}
            highlight="neutral"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="merton">
        <TabsList className="bg-card border border-border mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="merton" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
            <Building2 className="w-3.5 h-3.5 mr-1" />
            Merton Model
          </TabsTrigger>
          <TabsTrigger value="migration" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
            <ArrowRight className="w-3.5 h-3.5 mr-1" />
            Migration
          </TabsTrigger>
          <TabsTrigger value="loss" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
            <BarChart3 className="w-3.5 h-3.5 mr-1" />
            Loss Distribution
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
            <PieChart className="w-3.5 h-3.5 mr-1" />
            Portfolio
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Merton Model ── */}
        <TabsContent value="merton" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Controls */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Firm Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Firm Asset Value (V)</span>
                    <span className="text-white font-medium">{fmtM(firmValue)}</span>
                  </div>
                  <Slider
                    value={[firmValue]}
                    min={50}
                    max={500}
                    step={5}
                    onValueChange={([v]) => setFirmValue(v)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>$50M</span><span>$500M</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Debt Face Value (D) — Default Barrier</span>
                    <span className="text-white font-medium">{fmtM(debtFace)}</span>
                  </div>
                  <Slider
                    value={[debtFace]}
                    min={20}
                    max={450}
                    step={5}
                    onValueChange={([v]) => setDebtFace(v)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>$20M</span><span>$450M</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Asset Volatility (σ)</span>
                    <span className="text-white font-medium">{firmVol}%</span>
                  </div>
                  <Slider
                    value={[firmVol]}
                    min={5}
                    max={80}
                    step={1}
                    onValueChange={([v]) => setFirmVol(v)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>5%</span><span>80%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Time Horizon (T)</span>
                    <span className="text-white font-medium">{maturity} yr{maturity !== 1 ? "s" : ""}</span>
                  </div>
                  <Slider
                    value={[maturity]}
                    min={0.25}
                    max={5}
                    step={0.25}
                    onValueChange={([v]) => setMaturity(v)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>3m</span><span>5y</span>
                  </div>
                </div>

                {/* Formula display */}
                <div className="bg-muted/80 rounded-lg p-3 space-y-1.5 text-xs font-mono">
                  <div className="text-muted-foreground text-xs mb-1">Merton Formula</div>
                  <div className="text-muted-foreground">
                    d₂ = [ln(V/D) + (r - ½σ²)T] / σ√T
                  </div>
                  <div className="text-muted-foreground">
                    = [{`ln(${fmtNum(firmValue/debtFace, 3)})`} + ({riskFree} - {fmtNum(0.5*Math.pow(firmVol/100,2),4)})×{maturity}] / {fmtNum(firmVol/100,3)}×{fmtNum(Math.sqrt(maturity),3)}
                  </div>
                  <div className="text-primary font-bold">= {fmtNum(merton.dd, 4)}</div>
                  <div className="text-muted-foreground mt-1.5">PD = N(-d₂) = N({fmtNum(-merton.dd, 4)})</div>
                  <div className="text-emerald-300 font-bold">= {fmtPct(merton.pd * 100, 4)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Gauge + Equity call analogy */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-rose-400" />
                    KMV Distance to Default
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DefaultGauge pd={merton.pd} />
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-center">
                      <div className="text-muted-foreground text-xs">Distance to Default</div>
                      <div className={`font-bold text-sm ${merton.dd > 2 ? "text-emerald-400" : merton.dd > 0 ? "text-amber-400" : "text-rose-400"}`}>
                        {fmtNum(merton.dd, 2)}σ
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground text-xs">Leverage</div>
                      <div className={`font-bold text-sm ${leverage < 50 ? "text-emerald-400" : leverage < 80 ? "text-amber-400" : "text-rose-400"}`}>
                        {fmtPct(leverage, 1)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground text-xs">Buffer</div>
                      <div className="font-bold text-sm text-primary">{fmtM(firmValue - debtFace)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Equity as Call Option */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    Equity as Call Option
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-3">
                    Equity = Call option on firm assets (strike = debt face value)
                  </div>
                  {/* Simple payoff diagram */}
                  <svg viewBox="0 0 280 130" className="w-full mb-3">
                    {/* Axes */}
                    <line x1={30} y1={110} x2={270} y2={110} stroke="#52525b" />
                    <line x1={30} y1={10} x2={30} y2={110} stroke="#52525b" />
                    {/* Strike line */}
                    <line
                      x1={30 + (debtFace / 500) * 220}
                      y1={10}
                      x2={30 + (debtFace / 500) * 220}
                      y2={110}
                      stroke="#fbbf24"
                      strokeDasharray="3,2"
                    />
                    <text
                      x={30 + (debtFace / 500) * 220}
                      y={8}
                      textAnchor="middle"
                      fill="#fbbf24"
                      fontSize={8}
                    >
                      D={fmtM(debtFace)}
                    </text>
                    {/* Equity payoff line */}
                    <polyline
                      points={`30,110 ${30 + (debtFace / 500) * 220},110 270,${110 - Math.max(0, 500 - debtFace) / 500 * 95}`}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                    {/* Current firm value marker */}
                    <circle
                      cx={30 + (firmValue / 500) * 220}
                      cy={110 - Math.max(0, firmValue - debtFace) / 500 * 95}
                      r={5}
                      fill="#3b82f6"
                    />
                    <text
                      x={30 + (firmValue / 500) * 220 + 6}
                      y={110 - Math.max(0, firmValue - debtFace) / 500 * 95 - 4}
                      fill="#3b82f6"
                      fontSize={8}
                    >
                      V={fmtM(firmValue)}
                    </text>
                    {/* Labels */}
                    <text x={150} y={125} textAnchor="middle" fill="#71717a" fontSize={8}>Firm Asset Value →</text>
                    <text x={14} y={60} textAnchor="middle" fill="#71717a" fontSize={8} transform="rotate(-90,14,60)">Equity Value</text>
                    <text x={270} y={106} fill="#22c55e" fontSize={8}>E</text>
                  </svg>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2">
                      <div className="text-emerald-400 font-semibold">Equity Value</div>
                      <div className="text-white font-bold">{fmtM(merton.eqValue)}</div>
                      <div className="text-muted-foreground text-xs">= V·N(d₁) - D·e^(-rT)·N(d₂)</div>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded p-2">
                      <div className="text-rose-400 font-semibold">Risky Debt Value</div>
                      <div className="text-white font-bold">{fmtM(merton.debtValue)}</div>
                      <div className="text-muted-foreground text-xs">= V - Equity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Migration ── */}
        <TabsContent value="migration" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Heatmap */}
            <Card className="bg-card border-border lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  1-Year Rating Transition Matrix
                  <Badge variant="outline" className="ml-auto text-xs text-muted-foreground border-border">S&P Based</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-2">Row = From rating · Column = To rating · Values in %</div>
                <MigrationHeatmap matrix={TRANSITION_1Y} />
                <div className="flex flex-wrap gap-2 mt-3">
                  {RATINGS.map((r2) => (
                    <div key={r2} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: RATING_COLORS[r2] }} />
                      <span className="text-xs text-muted-foreground">{r2}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Right panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Rating selector & breakdown */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white">From Rating Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {RATINGS.slice(0, -1).map((rr) => (
                      <button
                        key={rr}
                        onClick={() => setSelectedFromRating(rr)}
                        className={`px-2.5 py-0.5 rounded text-xs font-bold border transition-all ${
                          selectedFromRating === rr
                            ? "text-black"
                            : "bg-transparent text-muted-foreground border-border"
                        }`}
                        style={
                          selectedFromRating === rr
                            ? { background: RATING_COLORS[rr], borderColor: RATING_COLORS[rr] }
                            : {}
                        }
                      >
                        {rr}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { label: "Upgrade probability", val: upgradePct, color: "bg-emerald-500" },
                      { label: "Stable (stay same)", val: stablePct, color: "bg-primary" },
                      { label: "Downgrade probability", val: downgradePct - defaultPct, color: "bg-amber-500" },
                      { label: "1-yr default rate", val: defaultPct, color: "bg-rose-600" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-0.5">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="text-white font-medium">{fmtPct(item.val, 2)}</span>
                        </div>
                        <Progress value={Math.min(item.val, 100)} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cumulative default rates */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    5-Year Cumulative Default Rates
                    <button
                      onClick={() => setShowCumulative(!showCumulative)}
                      className="ml-auto text-muted-foreground hover:text-muted-foreground transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence>
                    {showCumulative && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-muted-foreground bg-muted/60 rounded p-2 mb-3"
                      >
                        Cumulative default rates show the probability that a bond originally rated X will default within 5 years. Investment-grade (BBB and above) dramatically outperforms high-yield.
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="space-y-1.5">
                    {Object.entries(CUM_DEFAULT_5Y).map(([rtg, def]) => (
                      <div key={rtg} className="flex items-center gap-2 text-xs">
                        <span
                          className="font-bold w-9 text-right text-xs"
                          style={{ color: RATING_COLORS[rtg] }}
                        >
                          {rtg}
                        </span>
                        <div className="flex-1 h-3 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full rounded transition-all"
                            style={{
                              width: `${Math.min(def, 100)}%`,
                              background: RATING_COLORS[rtg],
                              opacity: 0.75,
                            }}
                          />
                        </div>
                        <span className="text-muted-foreground w-12 text-right font-medium">{fmtPct(def, 2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Migration animation */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white">BBB Portfolio Migration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-3">
                    10 loans initially rated BBB · watch how they migrate over time
                  </div>
                  <div className="flex gap-1.5 mb-3">
                    {migrationSteps.map((step, i) => (
                      <button
                        key={i}
                        onClick={() => setAnimStep(i)}
                        className={`px-2 py-0.5 rounded text-xs transition-all border ${
                          animStep === i
                            ? "bg-primary border-primary text-white"
                            : "bg-muted border-border text-muted-foreground hover:border-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {RATINGS.map((rr) => {
                      const val =
                        (curMigStep.distribution as Record<string, number>)[rr] ?? 0;
                      return (
                        <motion.div
                          key={rr}
                          className="flex items-center gap-2 text-xs"
                          layout
                        >
                          <span className="w-8 font-bold text-right" style={{ color: RATING_COLORS[rr] }}>
                            {rr}
                          </span>
                          <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                            <motion.div
                              className="h-full rounded"
                              animate={{ width: `${Math.min(val * 10, 100)}%` }}
                              style={{ background: RATING_COLORS[rr], opacity: 0.8 }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                          <span className="text-muted-foreground w-8 text-right">{val.toFixed(1)}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Loss Distribution ── */}
        <TabsContent value="loss" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Controls */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-400" />
                  LGD / PD / EAD Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Probability of Default (PD)</span>
                    <span className="text-rose-400 font-medium">{ldPd}%</span>
                  </div>
                  <Slider
                    value={[ldPd]}
                    min={0.1}
                    max={30}
                    step={0.1}
                    onValueChange={([v]) => setLdPd(v)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>0.1%</span><span>30%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Loss Given Default (LGD)</span>
                    <span className="text-amber-400 font-medium">{ldLgd}%</span>
                  </div>
                  <Slider
                    value={[ldLgd]}
                    min={5}
                    max={95}
                    step={1}
                    onValueChange={([v]) => setLdLgd(v)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>5%</span><span>95%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Exposure at Default (EAD)</span>
                    <span className="text-primary font-medium">{fmtM(ldEad)}</span>
                  </div>
                  <Slider
                    value={[ldEad]}
                    min={50}
                    max={2000}
                    step={10}
                    onValueChange={([v]) => setLdEad(v)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>$50M</span><span>$2B</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">VaR Confidence Level</span>
                    <span className="text-primary font-medium">{confidence}%</span>
                  </div>
                  <Slider
                    value={[confidence]}
                    min={90}
                    max={99.9}
                    step={0.1}
                    onValueChange={([v]) => setConfidence(v)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>90%</span><span>99.9%</span>
                  </div>
                </div>

                {/* Formula box */}
                <div className="bg-muted/80 rounded-lg p-3 space-y-2 text-xs font-mono">
                  <div className="text-muted-foreground text-xs mb-1">Credit Loss Formulas</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div>EL = PD × LGD × EAD</div>
                    <div className="text-emerald-300">
                      = {ldPd}% × {ldLgd}% × {fmtM(ldEad)}
                    </div>
                    <div className="text-emerald-300 font-bold">
                      = {fmtM((ldPd / 100) * (ldLgd / 100) * ldEad)}
                    </div>
                  </div>
                  <div className="border-t border-border pt-2 space-y-1 text-muted-foreground">
                    <div>UL = VaR - EL</div>
                    <div className="text-amber-300 text-xs">Unexpected loss is capital buffer needed</div>
                  </div>
                  <div className="border-t border-border pt-2 space-y-1 text-muted-foreground">
                    <div>Econ Capital ≈ VaR({confidence}%) - EL</div>
                    <div className="text-primary text-xs">Capital to absorb tail losses at {confidence}% confidence</div>
                  </div>
                </div>

                {/* Recovery rate note */}
                <div className="bg-primary/10 border border-border rounded-lg p-3 text-xs">
                  <div className="text-primary font-semibold mb-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Recovery Rate
                  </div>
                  <div className="text-muted-foreground">
                    Recovery Rate = 1 − LGD = <span className="text-white font-medium">{(100 - ldLgd).toFixed(0)}%</span>
                  </div>
                  <div className="text-muted-foreground text-xs mt-1">
                    Senior secured: ~65–75% recovery · Subordinated: ~20–35%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loss distribution chart */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Loss Distribution
                  <Badge variant="outline" className="ml-auto text-xs border-border text-muted-foreground">Monte Carlo</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LossHistogram
                  pd={ldPd / 100}
                  lgd={ldLgd / 100}
                  ead={ldEad}
                  confidence={confidence}
                />

                {/* Basel framework note */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-muted/60 border border-border/50 rounded-lg p-3 text-xs">
                    <div className="text-muted-foreground font-semibold mb-1.5">Basel III Capital</div>
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Minimum CET1</span>
                        <span className="text-white">4.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tier 1 Capital</span>
                        <span className="text-white">6.0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Capital</span>
                        <span className="text-white">8.0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conservation Buffer</span>
                        <span className="text-white">2.5%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/60 border border-border/50 rounded-lg p-3 text-xs">
                    <div className="text-muted-foreground font-semibold mb-1.5">IRBA Risk Weight</div>
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>PD Input</span>
                        <span className="text-rose-400">{ldPd}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LGD Input</span>
                        <span className="text-amber-400">{ldLgd}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Implied RWA%</span>
                        <span className="text-primary">
                          {fmtPct(Math.min(ldPd * ldLgd * 2.5, 150), 1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capital Req (8%)</span>
                        <span className="text-emerald-400">
                          {fmtM(ldEad * Math.min(ldPd / 100 * ldLgd / 100 * 2.5, 1.5) * 0.08)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 4: Portfolio ── */}
        <TabsContent value="portfolio" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Loan table */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  10-Loan Credit Portfolio
                  <Badge variant="outline" className="ml-auto border-border text-muted-foreground text-xs">
                    EAD: {fmtM(totalEAD)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left pb-2 font-medium">Borrower</th>
                        <th className="text-left pb-2 font-medium">Sector</th>
                        <th className="text-center pb-2 font-medium">Rtg</th>
                        <th className="text-right pb-2 font-medium">EAD</th>
                        <th className="text-right pb-2 font-medium">PD</th>
                        <th className="text-right pb-2 font-medium">LGD</th>
                        <th className="text-right pb-2 font-medium">EL</th>
                        <th className="text-right pb-2 font-medium">Wt%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {PORTFOLIO_LOANS.map((loan) => (
                        <motion.tr
                          key={loan.id}
                          onClick={() =>
                            setSelectedLoan(selectedLoan === loan.id ? null : loan.id)
                          }
                          className={`cursor-pointer transition-colors ${
                            selectedLoan === loan.id
                              ? "bg-primary/10"
                              : "hover:bg-muted/40"
                          }`}
                          whileHover={{ x: 2 }}
                        >
                          <td className="py-1.5 text-foreground font-medium">{loan.name}</td>
                          <td className="py-1.5 text-muted-foreground">{loan.sector}</td>
                          <td className="py-1.5 text-center">
                            <span
                              className="px-1.5 py-0.5 rounded text-xs font-bold"
                              style={{
                                background: RATING_COLORS[loan.rating] + "33",
                                color: RATING_COLORS[loan.rating],
                              }}
                            >
                              {loan.rating}
                            </span>
                          </td>
                          <td className="py-1.5 text-right text-foreground">{fmtM(loan.ead)}</td>
                          <td className="py-1.5 text-right text-rose-400">{fmtPct(loan.pd * 100, 2)}</td>
                          <td className="py-1.5 text-right text-amber-400">{fmtPct(loan.lgd * 100, 0)}</td>
                          <td className="py-1.5 text-right text-emerald-400">{fmtM(loan.el)}</td>
                          <td className="py-1.5 text-right text-muted-foreground">{fmtPct(loan.weight * 100, 1)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border text-muted-foreground font-semibold">
                        <td className="pt-2" colSpan={3}>Portfolio Total</td>
                        <td className="pt-2 text-right">{fmtM(totalEAD)}</td>
                        <td className="pt-2 text-right text-rose-400">{fmtPct(avgPD * 100, 2)}</td>
                        <td className="pt-2 text-right text-amber-400">{fmtPct(avgLGD * 100, 0)}</td>
                        <td className="pt-2 text-right text-emerald-400">{fmtM(totalEL)}</td>
                        <td className="pt-2 text-right">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Correlation slider */}
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Default Correlation (ρ)
                    </span>
                    <span className="text-white font-medium">{fmtPct(portCorr * 100, 0)}</span>
                  </div>
                  <Slider
                    value={[portCorr * 100]}
                    min={0}
                    max={60}
                    step={1}
                    onValueChange={([v]) => setPortCorr(v / 100)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>0% — fully idiosyncratic</span>
                    <span>60% — highly correlated</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio analytics */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-primary" />
                    Portfolio Risk Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Total EL", val: fmtM(totalEL), sub: `${fmtPct(totalEL / totalEAD * 100, 3)} of EAD`, color: "text-emerald-400" },
                    { label: "Avg Weighted PD", val: fmtPct(avgPD * 100, 3), sub: "Expected annual default rate", color: "text-rose-400" },
                    { label: "Avg Weighted LGD", val: fmtPct(avgLGD * 100, 1), sub: "Expected severity on default", color: "text-amber-400" },
                    { label: "HHI Concentration", val: fmtPct(hhiPct, 2), sub: hhiPct < 15 ? "Well diversified" : "Moderate concentration", color: hhiPct < 15 ? "text-emerald-400" : "text-amber-400" },
                    { label: "Diversification Benefit", val: fmtM(divBenefit), sub: `At ρ = ${fmtPct(portCorr * 100, 0)}`, color: "text-primary" },
                  ].map((m) => (
                    <div key={m.label} className="flex flex-col gap-0.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className={`font-bold ${m.color}`}>{m.val}</span>
                      </div>
                      <div className="text-muted-foreground text-xs">{m.sub}</div>
                    </div>
                  ))}

                  {/* Concentration by sector */}
                  <div className="pt-2 border-t border-border">
                    <div className="text-muted-foreground text-xs mb-2">EAD by Sector</div>
                    <div className="space-y-1">
                      {Array.from(
                        PORTFOLIO_LOANS.reduce((acc, l) => {
                          const cur = acc.get(l.sector) ?? 0;
                          acc.set(l.sector, cur + l.ead);
                          return acc;
                        }, new Map<string, number>())
                      )
                        .sort(([, a], [, b]) => b - a)
                        .map(([sector, ead]) => (
                          <div key={sector} className="flex items-center gap-1.5 text-xs">
                            <span className="text-muted-foreground w-20 truncate">{sector}</span>
                            <div className="flex-1 h-1.5 bg-muted rounded overflow-hidden">
                              <div
                                className="h-full bg-primary rounded"
                                style={{ width: `${(ead / totalEAD) * 100}%`, opacity: 0.7 }}
                              />
                            </div>
                            <span className="text-muted-foreground w-8 text-right">
                              {fmtPct((ead / totalEAD) * 100, 0)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scatter plot */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-rose-400" />
                    Loss Scenario Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-2">Base vs Stressed loss (300 scenarios)</div>
                  <PortfolioScatter loans={PORTFOLIO_LOANS} correlation={portCorr} />

                  {/* Correlation impact */}
                  <div className="mt-3 bg-muted/60 border border-border/50 rounded-lg p-2.5 text-xs">
                    <div className="text-muted-foreground font-semibold mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      Correlation Impact
                    </div>
                    <div className="text-muted-foreground space-y-0.5">
                      <div>At ρ = {fmtPct(portCorr * 100, 0)}, diversification is
                        <span className={`ml-1 font-medium ${portCorr < 0.1 ? "text-emerald-400" : portCorr < 0.3 ? "text-amber-400" : "text-rose-400"}`}>
                          {portCorr < 0.1 ? "strong" : portCorr < 0.3 ? "moderate" : "limited"}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs mt-1">
                        In a crisis, correlations spike toward 1.0, causing portfolio losses to converge — this is the key systemic risk in credit portfolios.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            icon: Shield,
            title: "Merton / KMV",
            desc: "Structural credit models treat equity as a call option on firm assets. Distance to default (DD) measures how many standard deviations the firm is from insolvency.",
            color: "text-primary",
            bg: "bg-primary/10",
            border: "border-border",
          },
          {
            icon: ArrowRight,
            title: "Migration Risk",
            desc: "Credit ratings are not static. Rating transitions affect bond prices, credit spreads, and regulatory capital requirements — downgrade risk is a major portfolio concern.",
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
          },
          {
            icon: Layers,
            title: "Portfolio Credit Risk",
            desc: "Default correlation drives portfolio loss tail risk. The 2008 crisis showed that assuming low correlations dramatically underestimates catastrophic loss scenarios.",
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
          },
        ].map((item) => (
          <div
            key={item.title}
            className={`${item.bg} border ${item.border} rounded-lg p-3`}
          >
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${item.color} mb-1`}>
              <item.icon className="w-3.5 h-3.5" />
              {item.title}
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
