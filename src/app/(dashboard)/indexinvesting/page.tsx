"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  Layers,
  Target,
  Shield,
  DollarSign,
  PieChart,
  Info,
  CheckCircle,
  AlertTriangle,
  Globe,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 652006;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface IndexDef {
  name: string;
  ticker: string;
  asset: string;
  methodology: string;
  constituents: number;
  annualReturn: number;
  volatility: number;
  ytd: number;
  color: string;
}

interface ETFDef {
  ticker: string;
  name: string;
  expenseRatio: number;
  trackingError: number;
  bidAsk: number;
  aumB: number;
  lendingIncome: number;
  color: string;
}

interface FactorETF {
  ticker: string;
  name: string;
  factor: string;
  expenseRatio: number;
  premiumAnnual: number;
  sharpe: number;
  maxDD: number;
  color: string;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const INDICES: IndexDef[] = [
  {
    name: "S&P 500",
    ticker: "SPX",
    asset: "US Large Cap Equity",
    methodology: "Float-adj. Market Cap",
    constituents: 503,
    annualReturn: 10.7,
    volatility: 15.2,
    ytd: 8.4,
    color: "#6366f1",
  },
  {
    name: "MSCI World",
    ticker: "MSCI",
    asset: "Global Developed Equity",
    methodology: "Float-adj. Market Cap",
    constituents: 1460,
    annualReturn: 9.8,
    volatility: 14.1,
    ytd: 6.9,
    color: "#22d3ee",
  },
  {
    name: "Bloomberg Agg",
    ticker: "AGG",
    asset: "US Investment-Grade Bonds",
    methodology: "Market-value Weighted",
    constituents: 10400,
    annualReturn: 4.2,
    volatility: 5.6,
    ytd: 1.8,
    color: "#f59e0b",
  },
  {
    name: "CRSP Total Market",
    ticker: "VTI",
    asset: "US Total Stock Market",
    methodology: "Float-adj. Market Cap",
    constituents: 3800,
    annualReturn: 10.9,
    volatility: 15.8,
    ytd: 8.1,
    color: "#10b981",
  },
  {
    name: "MSCI EM",
    ticker: "EEM",
    asset: "Emerging Markets Equity",
    methodology: "Float-adj. Market Cap",
    constituents: 1430,
    annualReturn: 7.3,
    volatility: 20.4,
    ytd: 5.2,
    color: "#f43f5e",
  },
  {
    name: "Russell 2000",
    ticker: "RUT",
    asset: "US Small Cap Equity",
    methodology: "Float-adj. Market Cap",
    constituents: 2000,
    annualReturn: 9.1,
    volatility: 19.6,
    ytd: 4.3,
    color: "#a78bfa",
  },
];

const ETFS: ETFDef[] = [
  {
    ticker: "SPY",
    name: "SPDR S&P 500 ETF",
    expenseRatio: 0.0945,
    trackingError: 0.025,
    bidAsk: 0.01,
    aumB: 520,
    lendingIncome: 0.0,
    color: "#6366f1",
  },
  {
    ticker: "IVV",
    name: "iShares Core S&P 500",
    expenseRatio: 0.03,
    trackingError: 0.015,
    bidAsk: 0.015,
    aumB: 480,
    lendingIncome: 0.005,
    color: "#22d3ee",
  },
  {
    ticker: "VOO",
    name: "Vanguard S&P 500 ETF",
    expenseRatio: 0.03,
    trackingError: 0.012,
    bidAsk: 0.02,
    aumB: 450,
    lendingIncome: 0.01,
    color: "#10b981",
  },
  {
    ticker: "SCHB",
    name: "Schwab US Broad Market",
    expenseRatio: 0.03,
    trackingError: 0.018,
    bidAsk: 0.025,
    aumB: 25,
    lendingIncome: 0.008,
    color: "#f59e0b",
  },
];

const FACTOR_ETFS: FactorETF[] = [
  {
    ticker: "IWD",
    name: "iShares Russell 1000 Value",
    factor: "Value",
    expenseRatio: 0.19,
    premiumAnnual: 2.8,
    sharpe: 0.52,
    maxDD: -42.1,
    color: "#f59e0b",
  },
  {
    ticker: "IWF",
    name: "iShares Russell 1000 Growth",
    factor: "Growth",
    expenseRatio: 0.19,
    premiumAnnual: 1.9,
    sharpe: 0.61,
    maxDD: -38.4,
    color: "#22d3ee",
  },
  {
    ticker: "MTUM",
    name: "iShares MSCI USA Momentum",
    factor: "Momentum",
    expenseRatio: 0.15,
    premiumAnnual: 3.4,
    sharpe: 0.68,
    maxDD: -44.7,
    color: "#6366f1",
  },
  {
    ticker: "QUAL",
    name: "iShares MSCI USA Quality",
    factor: "Quality",
    expenseRatio: 0.15,
    premiumAnnual: 2.1,
    sharpe: 0.72,
    maxDD: -35.2,
    color: "#10b981",
  },
  {
    ticker: "USMV",
    name: "iShares MSCI USA Min Vol",
    factor: "Low Volatility",
    expenseRatio: 0.15,
    premiumAnnual: 1.4,
    sharpe: 0.65,
    maxDD: -28.9,
    color: "#a78bfa",
  },
  {
    ticker: "SIZE",
    name: "iShares MSCI USA Size Factor",
    factor: "Size",
    expenseRatio: 0.15,
    premiumAnnual: 2.2,
    sharpe: 0.48,
    maxDD: -51.3,
    color: "#f43f5e",
  },
];

// ── Helper: generate seeded returns series ─────────────────────────────────────

function generateReturnSeries(years: number, annualMu: number, vol: number, seed: number): number[] {
  s = seed;
  const vals: number[] = [100];
  for (let i = 0; i < years; i++) {
    const r = annualMu / 100 + (rand() - 0.5) * 2 * (vol / 100);
    vals.push(vals[vals.length - 1] * (1 + r));
  }
  return vals;
}

// ── Section: SVG Cost Drag Chart ───────────────────────────────────────────────

function CostDragChart() {
  const W = 500;
  const H = 220;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const years = Array.from({ length: 31 }, (_, i) => i);
  const initial = 10000;

  const scenarios = [
    { label: "0.03% (VOO)", cost: 0.0003, color: "#10b981" },
    { label: "0.09% (SPY)", cost: 0.0009, color: "#6366f1" },
    { label: "0.50% Avg Active", cost: 0.005, color: "#f59e0b" },
    { label: "1.00% High Cost", cost: 0.01, color: "#f43f5e" },
  ];

  const grossReturn = 0.10;
  const vals = scenarios.map((sc) =>
    years.map((y) => initial * Math.pow(1 + grossReturn - sc.cost, y))
  );

  const maxVal = Math.max(...vals.flat());
  const toX = (y: number) => pad.left + (y / 30) * chartW;
  const toY = (v: number) => pad.top + chartH - (v / maxVal) * chartH;

  const toPath = (series: number[]) =>
    series.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");

  const fmt = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = pad.top + chartH - t * chartH;
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#334155" strokeDasharray="3,3" />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={9}>
              {fmt(maxVal * t)}
            </text>
          </g>
        );
      })}
      {/* x axis labels */}
      {[0, 10, 20, 30].map((y) => (
        <text key={y} x={toX(y)} y={H - 8} textAnchor="middle" fill="#64748b" fontSize={9}>
          Yr {y}
        </text>
      ))}
      {/* paths */}
      {vals.map((series, i) => (
        <path
          key={i}
          d={toPath(series)}
          fill="none"
          stroke={scenarios[i].color}
          strokeWidth={2}
        />
      ))}
      {/* end labels */}
      {vals.map((series, i) => (
        <text
          key={i}
          x={toX(30) + 4}
          y={toY(series[30]) + 4}
          fill={scenarios[i].color}
          fontSize={8}
        >
          {fmt(series[30])}
        </text>
      ))}
      {/* legend */}
      {scenarios.map((sc, i) => (
        <g key={i} transform={`translate(${pad.left + (i % 2) * 200}, ${H - 30 + Math.floor(i / 2) * 12})`}>
          <rect width={16} height={2} y={5} fill={sc.color} rx={1} />
          <text x={20} y={10} fill="#94a3b8" fontSize={8}>
            {sc.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Section: Index Size Breakdown Chart (Donut) ────────────────────────────────

function IndexSizeChart({ index }: { index: IndexDef }) {
  const segments = [
    { label: "Top 10", pct: 0.32, color: "#6366f1" },
    { label: "Top 11–50", pct: 0.28, color: "#22d3ee" },
    { label: "Next 50–200", pct: 0.22, color: "#10b981" },
    { label: "Rest", pct: 0.18, color: "#64748b" },
  ];

  const cx = 60;
  const cy = 60;
  const r = 45;
  const rInner = 28;
  let cumAngle = -Math.PI / 2;

  const slices = segments.map((seg) => {
    const startAngle = cumAngle;
    const sweepAngle = seg.pct * 2 * Math.PI;
    cumAngle += sweepAngle;
    const endAngle = cumAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + rInner * Math.cos(startAngle);
    const iy1 = cy + rInner * Math.sin(startAngle);
    const ix2 = cx + rInner * Math.cos(endAngle);
    const iy2 = cy + rInner * Math.sin(endAngle);
    const large = sweepAngle > Math.PI ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${rInner} ${rInner} 0 ${large} 0 ${ix1} ${iy1}`,
      "Z",
    ].join(" ");

    return { d, color: seg.color, label: seg.label, pct: seg.pct };
  });

  return (
    <svg viewBox="0 0 200 130" className="w-full max-w-xs">
      {slices.map((sl, i) => (
        <path key={i} d={sl.d} fill={sl.color} opacity={0.85} />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#e2e8f0" fontSize={8} fontWeight="bold">
        {index.ticker}
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="#94a3b8" fontSize={7}>
        {index.constituents.toLocaleString()} stocks
      </text>
      {slices.map((sl, i) => (
        <g key={i} transform={`translate(130, ${18 + i * 26})`}>
          <rect width={10} height={10} fill={sl.color} rx={2} />
          <text x={14} y={9} fill="#94a3b8" fontSize={8}>
            {sl.label} ({Math.round(sl.pct * 100)}%)
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Section: Factor Return Chart ───────────────────────────────────────────────

function FactorReturnChart() {
  const W = 520;
  const H = 220;
  const pad = { top: 20, right: 20, bottom: 40, left: 55 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const years = 25;
  const factors = [
    { label: "Value", color: "#f59e0b", mu: 0.108, vol: 0.16, seed: 652001 },
    { label: "Momentum", color: "#6366f1", mu: 0.115, vol: 0.18, seed: 652002 },
    { label: "Quality", color: "#10b981", mu: 0.111, vol: 0.14, seed: 652003 },
    { label: "Low Vol", color: "#a78bfa", mu: 0.096, vol: 0.11, seed: 652004 },
    { label: "Market", color: "#94a3b8", mu: 0.10, vol: 0.155, seed: 652005 },
  ];

  const series = factors.map((f) => generateReturnSeries(years, f.mu * 100, f.vol * 100, f.seed));
  const maxVal = Math.max(...series.flat());
  const minVal = Math.min(...series.flat());
  const range = maxVal - minVal;

  const toX = (i: number) => pad.left + (i / years) * chartW;
  const toY = (v: number) => pad.top + chartH - ((v - minVal) / range) * chartH;

  const toPath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");

  const yTicks = [minVal, minVal + range * 0.33, minVal + range * 0.67, maxVal];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {yTicks.map((v, i) => {
        const y = toY(v);
        return (
          <g key={i}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#1e293b" strokeDasharray="3,3" />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={9}>
              ${v.toFixed(0)}
            </text>
          </g>
        );
      })}
      {[0, 5, 10, 15, 20, 25].map((y) => (
        <text key={y} x={toX(y)} y={H - 6} textAnchor="middle" fill="#64748b" fontSize={9}>
          {2001 + y}
        </text>
      ))}
      {series.map((vals, i) => (
        <path key={i} d={toPath(vals)} fill="none" stroke={factors[i].color} strokeWidth={1.8} />
      ))}
      {factors.map((f, i) => (
        <g key={i} transform={`translate(${pad.left + (i % 3) * 120}, ${H - 30 + Math.floor(i / 3) * 12})`}>
          <rect width={12} height={2} y={5} fill={f.color} rx={1} />
          <text x={16} y={10} fill="#94a3b8" fontSize={8}>
            {f.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Section: Glide Path / Allocation Over Time ─────────────────────────────────

function GlidePathChart({ age }: { age: number }) {
  const W = 500;
  const H = 200;
  const pad = { top: 15, right: 20, bottom: 35, left: 45 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const ages = Array.from({ length: 46 }, (_, i) => 25 + i); // 25–70

  // equity = 110 - age, capped 20–90
  const equity = ages.map((a) => Math.max(20, Math.min(90, 110 - a)));
  const intl = ages.map((a) => Math.max(5, Math.min(30, (110 - a) * 0.3)));
  const bonds = ages.map((_a, idx) => 100 - equity[idx]);

  const toX = (idx: number) => pad.left + (idx / 45) * chartW;
  const toY = (pct: number) => pad.top + chartH - (pct / 100) * chartH;

  // Stacked areas
  const equityPoints = equity.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const equityBase = `${toX(45)},${toY(0)} ${toX(0)},${toY(0)}`;
  const equityPath = `M ${equityPoints} L ${equityBase} Z`;

  // Current age vertical line
  const currentIdx = Math.min(45, Math.max(0, age - 25));
  const currentX = toX(currentIdx);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* grid */}
      {[0, 25, 50, 75, 100].map((t) => {
        const y = toY(t);
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#1e293b" strokeDasharray="3,3" />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={9}>
              {t}%
            </text>
          </g>
        );
      })}
      {/* x-axis */}
      {[25, 35, 45, 55, 65, 70].map((a) => {
        const idx = a - 25;
        return (
          <text key={a} x={toX(idx)} y={H - 6} textAnchor="middle" fill="#64748b" fontSize={9}>
            {a}
          </text>
        );
      })}
      <text x={W / 2} y={H - 2} textAnchor="middle" fill="#64748b" fontSize={8}>
        Age
      </text>

      {/* bond area (bottom) */}
      <path
        d={`M ${bonds.map((v, i) => `${toX(i)},${toY(v)}`).join(" L ")} L ${toX(45)},${toY(0)} ${toX(0)},${toY(0)} Z`}
        fill="#f59e0b"
        opacity={0.5}
      />
      {/* equity area (top) */}
      <path d={equityPath} fill="#6366f1" opacity={0.5} />
      {/* intl area overlay */}
      <path
        d={`M ${intl.map((v, i) => `${toX(i)},${toY(v)}`).join(" L ")} L ${toX(45)},${toY(0)} ${toX(0)},${toY(0)} Z`}
        fill="#22d3ee"
        opacity={0.35}
      />

      {/* current age line */}
      <line x1={currentX} y1={pad.top} x2={currentX} y2={pad.top + chartH} stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4,3" />
      <text x={currentX + 3} y={pad.top + 10} fill="#e2e8f0" fontSize={8}>
        Age {age}
      </text>

      {/* legend */}
      {[
        { label: "US Equity", color: "#6366f1" },
        { label: "Intl Equity", color: "#22d3ee" },
        { label: "Bonds", color: "#f59e0b" },
      ].map((l, i) => (
        <g key={i} transform={`translate(${pad.left + i * 130}, ${H - 14})`}>
          <rect width={12} height={6} fill={l.color} opacity={0.7} rx={1} />
          <text x={16} y={9} fill="#94a3b8" fontSize={8}>
            {l.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Section: SPIVA / Active vs Passive ─────────────────────────────────────────

function SPIVAChart() {
  const W = 480;
  const H = 220;
  const pad = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const categories = [
    { label: "US Large Cap", underperf1: 63, underperf5: 78, underperf15: 92 },
    { label: "US Mid Cap", underperf1: 61, underperf5: 80, underperf15: 90 },
    { label: "US Small Cap", underperf1: 58, underperf5: 75, underperf15: 87 },
    { label: "Intl Developed", underperf1: 70, underperf5: 83, underperf15: 94 },
    { label: "Emerging Mkts", underperf1: 56, underperf5: 72, underperf15: 85 },
  ];

  const barW = (chartW / categories.length) * 0.25;
  const groupW = chartW / categories.length;
  const maxPct = 100;

  const barSeries = [
    { key: "underperf1" as keyof (typeof categories)[0], color: "#f59e0b", label: "1Y" },
    { key: "underperf5" as keyof (typeof categories)[0], color: "#f43f5e", label: "5Y" },
    { key: "underperf15" as keyof (typeof categories)[0], color: "#7f1d1d", label: "15Y" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* grid */}
      {[0, 25, 50, 75, 100].map((t) => {
        const y = pad.top + chartH - (t / maxPct) * chartH;
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#1e293b" strokeDasharray="3,3" />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={9}>
              {t}%
            </text>
          </g>
        );
      })}

      {categories.map((cat, ci) => {
        const gx = pad.left + ci * groupW;
        return (
          <g key={ci}>
            {barSeries.map((bs, bi) => {
              const val = cat[bs.key] as number;
              const bh = (val / maxPct) * chartH;
              const bx = gx + bi * (barW + 2) + 4;
              const by = pad.top + chartH - bh;
              return (
                <g key={bi}>
                  <rect x={bx} y={by} width={barW} height={bh} fill={bs.color} rx={2} opacity={0.85} />
                  <text x={bx + barW / 2} y={by - 2} textAnchor="middle" fill={bs.color} fontSize={7}>
                    {val}
                  </text>
                </g>
              );
            })}
            <text
              x={gx + groupW / 2 - 6}
              y={H - 6}
              textAnchor="middle"
              fill="#64748b"
              fontSize={7.5}
            >
              {cat.label}
            </text>
          </g>
        );
      })}

      {/* legend */}
      {barSeries.map((bs, i) => (
        <g key={i} transform={`translate(${pad.left + i * 100}, ${H - 22})`}>
          <rect width={12} height={8} fill={bs.color} rx={2} opacity={0.85} />
          <text x={16} y={8} fill="#94a3b8" fontSize={8}>
            {bs.label} underperform
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Section: Methodology Comparison ───────────────────────────────────────────

interface MethodDef {
  name: string;
  pros: string[];
  cons: string[];
  turnover: string;
  example: string;
  color: string;
}

const METHODS: MethodDef[] = [
  {
    name: "Cap-Weighted",
    pros: ["Self-rebalancing", "Low turnover", "Representational"],
    cons: ["Overweights overvalued", "Concentration risk", "Momentum bias"],
    turnover: "3–5% p.a.",
    example: "S&P 500 / MSCI World",
    color: "#6366f1",
  },
  {
    name: "Equal-Weighted",
    pros: ["Size diversification", "Small-cap tilt", "Mean reversion"],
    cons: ["High turnover", "Illiquidity cost", "Implementation drag"],
    turnover: "20–30% p.a.",
    example: "RSP (S&P 500 EW)",
    color: "#22d3ee",
  },
  {
    name: "Fundamental",
    pros: ["Value discipline", "Avoids momentum bubbles", "RAFI methodology"],
    cons: ["Value factor risk", "Moderate turnover", "Tracking error"],
    turnover: "10–15% p.a.",
    example: "PRF / FNDB",
    color: "#10b981",
  },
];

// ── Three-Fund Portfolio Builder ───────────────────────────────────────────────

function ThreeFundBuilder() {
  const [usAlloc, setUsAlloc] = useState(60);
  const [intlAlloc, setIntlAlloc] = useState(30);
  const bondsAlloc = Math.max(0, 100 - usAlloc - intlAlloc);

  const assumptions = {
    us: { ret: 10.5, vol: 15.2 },
    intl: { ret: 8.8, vol: 16.4 },
    bonds: { ret: 4.2, vol: 5.6 },
  };

  const usFrac = usAlloc / 100;
  const intlFrac = intlAlloc / 100;
  const bondFrac = bondsAlloc / 100;

  const expectedReturn =
    usFrac * assumptions.us.ret +
    intlFrac * assumptions.intl.ret +
    bondFrac * assumptions.bonds.ret;

  const expectedVol = Math.sqrt(
    Math.pow(usFrac * assumptions.us.vol, 2) +
    Math.pow(intlFrac * assumptions.intl.vol, 2) +
    Math.pow(bondFrac * assumptions.bonds.vol, 2)
  );

  const sharpe = (expectedReturn - 4.5) / expectedVol;

  const slices = [
    { label: "US Equity", pct: usAlloc, color: "#6366f1" },
    { label: "Intl Equity", pct: intlAlloc, color: "#22d3ee" },
    { label: "Bonds", pct: bondsAlloc, color: "#f59e0b" },
  ].filter((s) => s.pct > 0);

  // mini donut
  const cx = 55;
  const cy = 55;
  const r = 42;
  const ri = 26;
  let cumA = -Math.PI / 2;

  const donutSlices = slices.map((sl) => {
    const startAngle = cumA;
    const sweep = (sl.pct / 100) * 2 * Math.PI;
    cumA += sweep;
    const end = cumA;
    const large = sweep > Math.PI ? 1 : 0;
    const cos1 = Math.cos(startAngle);
    const sin1 = Math.sin(startAngle);
    const cos2 = Math.cos(end);
    const sin2 = Math.sin(end);
    const d = [
      `M ${cx + r * cos1} ${cy + r * sin1}`,
      `A ${r} ${r} 0 ${large} 1 ${cx + r * cos2} ${cy + r * sin2}`,
      `L ${cx + ri * cos2} ${cy + ri * sin2}`,
      `A ${ri} ${ri} 0 ${large} 0 ${cx + ri * cos1} ${cy + ri * sin1}`,
      "Z",
    ].join(" ");
    return { d, color: sl.color, label: sl.label, pct: sl.pct };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-indigo-400">US Equity (VTI)</span>
              <span className="text-sm font-bold text-white">{usAlloc}%</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[usAlloc]}
              onValueChange={([v]) => {
                setUsAlloc(v);
                if (v + intlAlloc > 100) setIntlAlloc(100 - v);
              }}
              className="accent-indigo-500"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-cyan-400">Intl Equity (VXUS)</span>
              <span className="text-sm font-bold text-white">{intlAlloc}%</span>
            </div>
            <Slider
              min={0}
              max={Math.max(0, 100 - usAlloc)}
              step={5}
              value={[intlAlloc]}
              onValueChange={([v]) => setIntlAlloc(v)}
              className="accent-cyan-500"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-amber-400">Bonds (BND)</span>
              <span className="text-sm font-bold text-white">{bondsAlloc}%</span>
            </div>
            <div className="h-4 rounded bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${bondsAlloc}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Auto-calculated from remainder</p>
          </div>
        </div>

        {/* Donut + stats */}
        <div className="flex flex-col items-center gap-4">
          <svg viewBox="0 0 110 110" className="w-32 h-32">
            {donutSlices.map((sl, i) => (
              <path key={i} d={sl.d} fill={sl.color} opacity={0.85} />
            ))}
            <text x={cx} y={cy - 4} textAnchor="middle" fill="#e2e8f0" fontSize={9} fontWeight="bold">
              {expectedReturn.toFixed(1)}%
            </text>
            <text x={cx} y={cy + 7} textAnchor="middle" fill="#94a3b8" fontSize={7}>
              exp. return
            </text>
          </svg>
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-400">{expectedReturn.toFixed(1)}%</div>
              <div className="text-xs text-slate-400">Exp. Return</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-amber-400">{expectedVol.toFixed(1)}%</div>
              <div className="text-xs text-slate-400">Volatility</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-indigo-400">{sharpe.toFixed(2)}</div>
              <div className="text-xs text-slate-400">Sharpe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fund map */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            ticker: "VTI",
            name: "Vanguard Total Market",
            er: "0.03%",
            desc: "US total market, 3,800+ stocks",
            color: "#6366f1",
            pct: usAlloc,
          },
          {
            ticker: "VXUS",
            name: "Vanguard Total Intl",
            er: "0.07%",
            desc: "All non-US developed + EM",
            color: "#22d3ee",
            pct: intlAlloc,
          },
          {
            ticker: "BND",
            name: "Vanguard Total Bond",
            er: "0.03%",
            desc: "US inv-grade bonds, ~10k issues",
            color: "#f59e0b",
            pct: bondsAlloc,
          },
        ].map((f) => (
          <div key={f.ticker} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm" style={{ color: f.color }}>
                {f.ticker}
              </span>
              <Badge variant="outline" className="text-xs">
                {f.er}
              </Badge>
            </div>
            <div className="text-xs text-slate-300 font-medium">{f.name}</div>
            <div className="text-xs text-slate-500 mt-1">{f.desc}</div>
            <div className="mt-2 text-base font-bold text-white">{f.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ETF Comparison Table ───────────────────────────────────────────────────────

function ETFTable() {
  const [initialInvest, setInitialInvest] = useState(10000);
  const years = 30;

  const netCostRows = ETFS.map((etf) => {
    const totalCostDrag = etf.expenseRatio - etf.lendingIncome;
    const finalValue = initialInvest * Math.pow(1 + 0.10 - totalCostDrag / 100, years);
    const noFeeValue = initialInvest * Math.pow(1.10, years);
    const costDollar = noFeeValue - finalValue;
    return { ...etf, totalCostDrag, finalValue, costDollar };
  });

  const cols = [
    "Ticker",
    "Expense Ratio",
    "Tracking Err",
    "Bid-Ask",
    "AUM ($B)",
    "Lending Inc.",
    "Net Cost",
    `30Y Cost ($${(initialInvest / 1000).toFixed(0)}k)`,
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-400">Initial Investment</label>
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <span className="text-green-400 font-bold">${initialInvest.toLocaleString()}</span>
          <Slider
            min={1000}
            max={100000}
            step={1000}
            value={[initialInvest]}
            onValueChange={([v]) => setInitialInvest(v)}
            className="flex-1"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c} className="text-left text-xs text-slate-400 pb-2 pr-3 whitespace-nowrap border-b border-slate-700">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {netCostRows.map((etf, i) => (
              <tr key={etf.ticker} className={cn("border-b border-slate-800/50", i % 2 === 0 && "bg-slate-800/20")}>
                <td className="py-2.5 pr-3">
                  <span className="font-bold" style={{ color: etf.color }}>
                    {etf.ticker}
                  </span>
                  <div className="text-xs text-slate-500">{etf.name}</div>
                </td>
                <td className="py-2.5 pr-3 font-mono text-amber-400">{etf.expenseRatio.toFixed(4)}%</td>
                <td className="py-2.5 pr-3 font-mono text-slate-300">{etf.trackingError.toFixed(3)}%</td>
                <td className="py-2.5 pr-3 font-mono text-slate-300">{etf.bidAsk.toFixed(3)}%</td>
                <td className="py-2.5 pr-3 font-mono text-slate-300">${etf.aumB}</td>
                <td className="py-2.5 pr-3 font-mono text-green-400">
                  {etf.lendingIncome > 0 ? `+${etf.lendingIncome.toFixed(3)}%` : "–"}
                </td>
                <td className="py-2.5 pr-3 font-mono text-cyan-400">{etf.totalCostDrag.toFixed(4)}%</td>
                <td className="py-2.5 pr-3 font-mono">
                  <span className={etf.costDollar > 5000 ? "text-red-400" : "text-slate-300"}>
                    ${etf.costDollar.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-4">
          <p className="text-sm text-slate-300 font-medium mb-2">30-Year Cost Drag (10% gross return assumed)</p>
          <CostDragChart />
        </CardContent>
      </Card>
    </div>
  );
}

// ── Section: Active vs Passive ─────────────────────────────────────────────────

function ActivePassiveSection() {
  const [horizon, setHorizon] = useState(15);

  const survivorshipPenalty = 12; // % of funds that disappear
  const feeAdvantage = 0.75; // % passive lower fees
  const alphaDecay = 0.08; // % alpha decays per year

  const compoundAdv = Math.pow(1 + feeAdvantage / 100, horizon) - 1;

  return (
    <div className="space-y-6">
      {/* SPIVA Chart */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">SPIVA Scorecard — % of Active Funds Underperforming Index</CardTitle>
          <p className="text-xs text-slate-400">Source: S&P Dow Jones SPIVA Report 2024. Data as of Dec 2023.</p>
        </CardHeader>
        <CardContent>
          <SPIVAChart />
        </CardContent>
      </Card>

      {/* Fee math */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-400 whitespace-nowrap">Holding Period</label>
        <span className="text-indigo-400 font-bold w-12">{horizon}Y</span>
        <Slider
          min={1}
          max={40}
          step={1}
          value={[horizon]}
          onValueChange={([v]) => setHorizon(v)}
          className="flex-1 max-w-xs"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Avg Active Fund Fee",
            value: "0.82%",
            sub: "per year",
            color: "text-red-400",
            icon: <DollarSign className="w-4 h-4" />,
          },
          {
            label: "Avg Passive ETF Fee",
            value: "0.07%",
            sub: "per year",
            color: "text-green-400",
            icon: <DollarSign className="w-4 h-4" />,
          },
          {
            label: `Fee Drag over ${horizon}Y`,
            value: `${(compoundAdv * 100).toFixed(1)}%`,
            sub: "cumulative",
            color: "text-amber-400",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            label: "Survivorship Bias",
            value: `~${survivorshipPenalty}%`,
            sub: "funds liquidated/merged",
            color: "text-purple-400",
            icon: <AlertTriangle className="w-4 h-4" />,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-1 text-slate-400 mb-1 text-xs">
              {stat.icon}
              {stat.label}
            </div>
            <div className={cn("text-xl font-bold", stat.color)}>{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Evidence bullets */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Why Passive Usually Wins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              ok: true,
              text: "Zero-sum before costs: For every outperforming active manager, another underperforms by the same amount. After fees, the average active investor must lag.",
            },
            {
              ok: true,
              text: "Survivorship bias inflates active fund track records — only the winners remain in databases. The true average return is lower.",
            },
            {
              ok: true,
              text: "Persistence: Studies (Carhart 1997, Fama & French 2010) show past outperformance does not predict future outperformance beyond what factor exposures explain.",
            },
            {
              ok: false,
              text: "Exception: Some niche asset classes (micro-cap, distressed debt, private credit) may reward skilled active managers due to higher information asymmetry.",
            },
            {
              ok: false,
              text: "Taxes: Active funds typically distribute more capital gains, reducing after-tax returns further vs. buy-and-hold index funds.",
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-2 text-sm">
              {item.ok ? (
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              )}
              <span className="text-slate-300">{item.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Alpha decay chart */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Cumulative Performance: Passive vs Active (simulated)</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivePassiveChart horizon={horizon} />
        </CardContent>
      </Card>
    </div>
  );
}

function ActivePassiveChart({ horizon }: { horizon: number }) {
  const W = 480;
  const H = 200;
  const pad = { top: 15, right: 20, bottom: 30, left: 50 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const years = Array.from({ length: horizon + 1 }, (_, i) => i);
  const passive = years.map((y) => 100 * Math.pow(1.10 - 0.0007, y));
  const activeHigh = years.map((y) => 100 * Math.pow(1.10 + 0.005 - 0.0082, y));
  const activeAvg = years.map((y) => 100 * Math.pow(1.10 - 0.0082, y));
  const activeLow = years.map((y) => 100 * Math.pow(1.10 - 0.015 - 0.0082, y));

  const allVals = [...passive, ...activeHigh, ...activeAvg, ...activeLow];
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);

  const toX = (i: number) => pad.left + (i / horizon) * chartW;
  const toY = (v: number) => pad.top + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const path = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 0.33, 0.67, 1].map((t) => {
        const v = minV + t * (maxV - minV);
        const y = toY(v);
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#1e293b" strokeDasharray="3,3" />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={9}>
              ${v.toFixed(0)}
            </text>
          </g>
        );
      })}
      {[0, Math.floor(horizon / 4), Math.floor(horizon / 2), Math.floor((3 * horizon) / 4), horizon].map((y) => (
        <text key={y} x={toX(y)} y={H - 4} textAnchor="middle" fill="#64748b" fontSize={9}>
          Yr {y}
        </text>
      ))}

      {/* active range fill */}
      <path
        d={`${path(activeHigh)} L${toX(horizon)},${toY(activeLow[horizon])} ${activeLow
          .map((v, i) => `${toX(horizon - i)},${toY(v)}`)
          .join(" ")} Z`}
        fill="#f59e0b"
        opacity={0.1}
      />

      <path d={path(activeLow)} fill="none" stroke="#f43f5e" strokeWidth={1.2} strokeDasharray="4,3" />
      <path d={path(activeAvg)} fill="none" stroke="#f59e0b" strokeWidth={1.8} />
      <path d={path(activeHigh)} fill="none" stroke="#22d3ee" strokeWidth={1.2} strokeDasharray="4,3" />
      <path d={path(passive)} fill="none" stroke="#10b981" strokeWidth={2.2} />

      {[
        { label: "Passive (0.07%)", color: "#10b981" },
        { label: "Active Avg (0.82%)", color: "#f59e0b" },
        { label: "Active Best", color: "#22d3ee" },
        { label: "Active Worst", color: "#f43f5e" },
      ].map((l, i) => (
        <g key={i} transform={`translate(${pad.left + (i % 2) * 200}, ${H - 20 + Math.floor(i / 2) * 11})`}>
          <rect width={12} height={2} y={5} fill={l.color} rx={1} />
          <text x={16} y={9} fill="#94a3b8" fontSize={8}>
            {l.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Factor ETF Section ─────────────────────────────────────────────────────────

function FactorSection() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {["ETF", "Factor", "Expense", "Premium (ann.)", "Sharpe", "Max DD", ""].map((c) => (
                <th key={c} className="text-left text-xs text-slate-400 pb-2 pr-3 border-b border-slate-700 whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FACTOR_ETFS.map((etf) => (
              <tr
                key={etf.ticker}
                onClick={() => setSelected(selected === etf.ticker ? null : etf.ticker)}
                className={cn(
                  "border-b border-slate-800/50 cursor-pointer transition-colors",
                  selected === etf.ticker ? "bg-slate-700/40" : "hover:bg-slate-800/30"
                )}
              >
                <td className="py-2.5 pr-3">
                  <span className="font-bold" style={{ color: etf.color }}>
                    {etf.ticker}
                  </span>
                  <div className="text-xs text-slate-500">{etf.name}</div>
                </td>
                <td className="py-2.5 pr-3">
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: etf.color, color: etf.color }}
                  >
                    {etf.factor}
                  </Badge>
                </td>
                <td className="py-2.5 pr-3 font-mono text-amber-400">{etf.expenseRatio}%</td>
                <td className="py-2.5 pr-3 font-mono text-green-400">+{etf.premiumAnnual}%</td>
                <td className="py-2.5 pr-3 font-mono text-indigo-400">{etf.sharpe}</td>
                <td className="py-2.5 pr-3 font-mono text-red-400">{etf.maxDD}%</td>
                <td className="py-2.5 pr-3 text-slate-500 text-xs">{selected === etf.ticker ? "▲" : "▼"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Factor premium evidence */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Factor Premium Evidence (simulated 25-year, $100 start)</CardTitle>
        </CardHeader>
        <CardContent>
          <FactorReturnChart />
        </CardContent>
      </Card>

      {/* Factor descriptions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          {
            factor: "Value",
            color: "#f59e0b",
            desc: "Cheap stocks (low P/B, P/E). Outperform long-term but can lag growth for a decade.",
            risk: "Value traps; may cluster in declining industries.",
          },
          {
            factor: "Momentum",
            color: "#6366f1",
            desc: "Recent winners continue to outperform. Strong academic evidence since Jegadeesh & Titman (1993).",
            risk: "Crashes hard in market reversals (Jan 2009, May 2020).",
          },
          {
            factor: "Quality",
            color: "#10b981",
            desc: "High ROE, low leverage, stable earnings. Defensive factor with moderate premium.",
            risk: "Expensive in risk-off environments; lower premium than value.",
          },
          {
            factor: "Low Volatility",
            color: "#a78bfa",
            desc: "Low-beta stocks outperform risk-adjusted (CAPM anomaly). Popular in retirement portfolios.",
            risk: "Underperforms in bull markets; rate-sensitive (bond proxy).",
          },
          {
            factor: "Size",
            color: "#f43f5e",
            desc: "Small caps historically outperform large caps over long horizons (Fama & French 1992).",
            risk: "Higher transaction costs, illiquidity, and business risk.",
          },
          {
            factor: "Growth",
            color: "#22d3ee",
            desc: "High revenue/earnings growth companies. Strong in low-rate environments (2010–2021).",
            risk: "Expensive multiples amplify downside in rate hike cycles.",
          },
        ].map((f) => (
          <div key={f.factor} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700">
            <div className="font-semibold text-sm mb-1" style={{ color: f.color }}>
              {f.factor}
            </div>
            <div className="text-xs text-slate-300 mb-2">{f.desc}</div>
            <div className="flex items-start gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-400">{f.risk}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function IndexInvestingPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [age, setAge] = useState(35);

  const idx = INDICES[selectedIndex];

  // Pre-compute methodology comparison data with useMemo to avoid re-renders
  const methodData = useMemo(() => METHODS, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-indigo-500/15 rounded-lg">
            <Globe className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Index Investing</h1>
          <Badge variant="outline" className="text-indigo-300 border-indigo-500/40">
            Passive Strategy Suite
          </Badge>
        </div>
        <p className="text-slate-400 text-sm ml-12">
          Index funds, ETF selection, factor premiums, portfolio construction, and the active vs. passive debate.
        </p>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "S&P 500 YTD", value: "+8.4%", color: "text-green-400", icon: <TrendingUp className="w-4 h-4" /> },
          { label: "Avg ETF Fee", value: "0.07%", color: "text-amber-400", icon: <DollarSign className="w-4 h-4" /> },
          { label: "Active Underperf (15Y)", value: "92%", color: "text-red-400", icon: <Activity className="w-4 h-4" /> },
          { label: "Three-Fund AUM", value: "$1.4T+", color: "text-indigo-400", icon: <Layers className="w-4 h-4" /> },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900 border border-slate-800 rounded-lg p-3"
          >
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              {stat.icon}
              {stat.label}
            </div>
            <div className={cn("text-xl font-bold", stat.color)}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="universe" className="space-y-4">
        <TabsList className="bg-slate-900 border border-slate-800 flex-wrap h-auto gap-1 p-1">
          {[
            { value: "universe", label: "Index Universe", icon: <Globe className="w-3.5 h-3.5" /> },
            { value: "etfselect", label: "ETF Selection", icon: <DollarSign className="w-3.5 h-3.5" /> },
            { value: "factors", label: "Factor ETFs", icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { value: "portfolio", label: "Portfolio Construction", icon: <PieChart className="w-3.5 h-3.5" /> },
            { value: "active", label: "Active vs Passive", icon: <Shield className="w-3.5 h-3.5" /> },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="flex items-center gap-1.5 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              {t.icon}
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── TAB 1: Index Universe ───────────────────────────────────────────── */}
        <TabsContent value="universe" className="space-y-4">
          {/* Indices table */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                Major Indices — Click to Inspect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {["Index", "Asset Class", "Methodology", "# Stocks", "Ann. Return", "Volatility", "YTD"].map((c) => (
                        <th key={c} className="text-left text-xs text-slate-400 pb-2 pr-3 border-b border-slate-700 whitespace-nowrap">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {INDICES.map((idx2, i) => (
                      <tr
                        key={idx2.ticker}
                        onClick={() => setSelectedIndex(i)}
                        className={cn(
                          "border-b border-slate-800/50 cursor-pointer transition-colors",
                          selectedIndex === i ? "bg-slate-700/40" : "hover:bg-slate-800/30"
                        )}
                      >
                        <td className="py-2.5 pr-3">
                          <span className="font-bold" style={{ color: idx2.color }}>
                            {idx2.name}
                          </span>
                          <div className="text-xs text-slate-500">{idx2.ticker}</div>
                        </td>
                        <td className="py-2.5 pr-3 text-slate-300 text-xs">{idx2.asset}</td>
                        <td className="py-2.5 pr-3 text-slate-400 text-xs">{idx2.methodology}</td>
                        <td className="py-2.5 pr-3 font-mono text-slate-300">{idx2.constituents.toLocaleString()}</td>
                        <td className="py-2.5 pr-3 font-mono text-green-400">+{idx2.annualReturn}%</td>
                        <td className="py-2.5 pr-3 font-mono text-amber-400">{idx2.volatility}%</td>
                        <td className="py-2.5 pr-3 font-mono">
                          <span className={idx2.ytd >= 0 ? "text-green-400" : "text-red-400"}>
                            {idx2.ytd >= 0 ? "+" : ""}{idx2.ytd}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Selected index detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span style={{ color: idx.color }} className="font-bold">
                    {idx.name}
                  </span>
                  — Size Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IndexSizeChart index={idx} />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="bg-slate-800 rounded-lg p-2">
                    <div className="text-xs text-slate-400">Annual Return (hist.)</div>
                    <div className="text-sm font-bold text-green-400">+{idx.annualReturn}%</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-2">
                    <div className="text-xs text-slate-400">Volatility (ann.)</div>
                    <div className="text-sm font-bold text-amber-400">{idx.volatility}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Methodology Comparison */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  Weighting Methodology Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {methodData.map((m) => (
                  <div key={m.name} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm" style={{ color: m.color }}>
                        {m.name}
                      </span>
                      <Badge variant="outline" className="text-xs text-slate-400">
                        Turnover: {m.turnover}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">Example: {m.example}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-green-400 font-medium mb-1">Pros</div>
                        {m.pros.map((p) => (
                          <div key={p} className="flex items-center gap-1 text-xs text-slate-300">
                            <CheckCircle className="w-2.5 h-2.5 text-green-400 flex-shrink-0" />
                            {p}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="text-xs text-red-400 font-medium mb-1">Cons</div>
                        {m.cons.map((c) => (
                          <div key={c} className="flex items-center gap-1 text-xs text-slate-300">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 2: ETF Selection ────────────────────────────────────────────── */}
        <TabsContent value="etfselect" className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                ETF Cost & Quality Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ETFTable />
            </CardContent>
          </Card>

          {/* Key concepts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                title: "Expense Ratio",
                icon: <DollarSign className="w-4 h-4 text-amber-400" />,
                color: "#f59e0b",
                desc: "Annual fee deducted from NAV continuously. The single biggest controllable drag on returns. Prefer < 0.05% for core positions.",
              },
              {
                title: "Tracking Error",
                icon: <Activity className="w-4 h-4 text-indigo-400" />,
                color: "#6366f1",
                desc: "Std. deviation of fund return minus index return. Low tracking error (<0.05%) means the fund accurately replicates the index.",
              },
              {
                title: "Securities Lending",
                icon: <TrendingUp className="w-4 h-4 text-green-400" />,
                color: "#10b981",
                desc: "ETFs can lend shares to short sellers and earn income, which partially offsets the expense ratio. Vanguard passes all proceeds to shareholders.",
              },
            ].map((c) => (
              <div key={c.title} className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  {c.icon}
                  <span className="font-semibold text-sm" style={{ color: c.color }}>
                    {c.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{c.desc}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── TAB 3: Factor ETFs ──────────────────────────────────────────────── */}
        <TabsContent value="factors" className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Smart Beta / Factor ETF Comparison
              </CardTitle>
              <p className="text-xs text-slate-400">
                Factor premiums are excess returns above the market that compensate for systematic risk exposures.
              </p>
            </CardHeader>
            <CardContent>
              <FactorSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: Portfolio Construction ───────────────────────────────────── */}
        <TabsContent value="portfolio" className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                Three-Fund Portfolio Builder
              </CardTitle>
              <p className="text-xs text-slate-400">
                The simplest diversified portfolio: US stocks + International stocks + Bonds.
              </p>
            </CardHeader>
            <CardContent>
              <ThreeFundBuilder />
            </CardContent>
          </Card>

          {/* Glide path */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Glide Path Simulator — Equity Allocation Over Time
              </CardTitle>
              <p className="text-xs text-slate-400">
                Rule of thumb: Equity % = 110 − Age. Adjust your age to see recommended allocation shift.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-400 whitespace-nowrap">Your Age</label>
                <span className="text-indigo-400 font-bold w-10">{age}</span>
                <Slider
                  min={20}
                  max={75}
                  step={1}
                  value={[age]}
                  onValueChange={([v]) => setAge(v)}
                  className="flex-1 max-w-sm"
                />
              </div>
              <GlidePathChart age={age} />
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "US Equity",
                    value: `${Math.max(20, Math.min(90, 110 - age))}%`,
                    color: "text-indigo-400",
                    fund: "VTI",
                  },
                  {
                    label: "Intl Equity",
                    value: `${Math.round(Math.max(5, Math.min(30, (110 - age) * 0.3)))}%`,
                    color: "text-cyan-400",
                    fund: "VXUS",
                  },
                  {
                    label: "Bonds",
                    value: `${Math.max(10, age - 10)}%`,
                    color: "text-amber-400",
                    fund: "BND",
                  },
                ].map((al) => (
                  <div key={al.label} className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className={cn("text-2xl font-bold", al.color)}>{al.value}</div>
                    <div className="text-xs text-slate-400">{al.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{al.fund}</div>
                  </div>
                ))}
              </div>

              {/* Rebalancing info */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-sm text-white">Rebalancing Guidelines</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-200 font-medium">Calendar Rebalancing</span>
                    <br />Rebalance once per year. Simple, low friction. Works well in tax-advantaged accounts.
                  </div>
                  <div>
                    <span className="text-slate-200 font-medium">Threshold Rebalancing</span>
                    <br />Rebalance when any asset class drifts ±5% from target. More responsive to market moves.
                  </div>
                  <div>
                    <span className="text-slate-200 font-medium">Cash Flow Rebalancing</span>
                    <br />Direct new contributions to underweight assets. Zero transaction costs, tax-efficient.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 5: Active vs Passive ────────────────────────────────────────── */}
        <TabsContent value="active" className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                Active vs. Passive — The Evidence
              </CardTitle>
              <p className="text-xs text-slate-400">
                SPIVA data, survivorship bias, fee math, and why the market-beaters are rare.
              </p>
            </CardHeader>
            <CardContent>
              <ActivePassiveSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
