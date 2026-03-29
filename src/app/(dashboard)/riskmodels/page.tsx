"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  BarChart2,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Layers,
  Target,
  FileWarning,
  GitBranch,
  Gauge,
  Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ─────────────────────────────────────────────────────────────
let s = 954;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const sv = () => _vals[_vi++ % _vals.length];

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt2(n: number) {
  return n.toFixed(2);
}
function fmtPct(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
}
const posColor = (v: number) => (v >= 0 ? "text-emerald-400" : "text-red-400");
void fmtPct;
void posColor;

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Market Risk Models
// ═══════════════════════════════════════════════════════════════════════════════

// Historical VaR — 500-day P&L distribution
const HistoricalPnLData: number[] = Array.from({ length: 500 }, () => sv() * 2 - 1);
// Sort ascending for distribution chart
const sortedPnL = [...HistoricalPnLData].sort((a, b) => a - b);
const VAR_99_IDX = Math.floor(500 * 0.01); // 5th worst = 99% VaR

// Monte Carlo P&L distribution
const MonteCarloPnL: number[] = Array.from({ length: 10000 }, () => {
  // Box-Muller for normal distribution
  const u1 = sv();
  const u2 = sv();
  const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
  return z * 1.5;
});

// Backtesting exceptions — 250 days
const BacktestDays = 250;
const BacktestExceptions = Array.from({ length: BacktestDays }, (_, i) => {
  const pnl = sv() * 2 - 1;
  const varEstimate = -1.2;
  return { day: i + 1, pnl, exception: pnl < varEstimate };
});
const exceptionCount = BacktestExceptions.filter((d) => d.exception).length;
const baselZone =
  exceptionCount <= 4 ? "green" : exceptionCount <= 9 ? "amber" : "red";

function HistSimVaRChart() {
  const W = 480;
  const H = 160;
  const PAD = { l: 44, r: 12, t: 14, b: 28 };
  const bins = 50;
  const minV = -2;
  const maxV = 2;
  const step = (maxV - minV) / bins;
  const counts = Array(bins).fill(0);
  sortedPnL.forEach((v) => {
    const idx = Math.min(Math.floor((v - minV) / step), bins - 1);
    counts[idx]++;
  });
  const maxCount = Math.max(...counts);
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const barW = chartW / bins;
  const toX = (v: number) => PAD.l + ((v - minV) / (maxV - minV)) * chartW;
  const toY = (c: number) => PAD.t + chartH - (c / maxCount) * chartH;
  const var99x = toX(sortedPnL[VAR_99_IDX]);
  const cvarVal = sortedPnL.slice(0, Math.floor(500 * 0.025)).reduce((a, b) => a + b, 0) / Math.floor(500 * 0.025);
  const cvarX = toX(cvarVal);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      {counts.map((c, i) => {
        const x = PAD.l + i * barW;
        const isTail = i < VAR_99_IDX * (bins / 500);
        return (
          <rect
            key={`b${i}`}
            x={x}
            y={toY(c)}
            width={barW - 0.5}
            height={chartH - (toY(c) - PAD.t)}
            fill={isTail ? "#ef4444" : "#6366f1"}
            opacity="0.7"
          />
        );
      })}
      {/* VaR 99% line */}
      <line x1={var99x} x2={var99x} y1={PAD.t} y2={PAD.t + chartH} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,2" />
      <text x={var99x + 3} y={PAD.t + 10} fill="#f59e0b" fontSize="8">99% VaR</text>
      {/* CVaR line */}
      <line x1={cvarX} x2={cvarX} y1={PAD.t} y2={PAD.t + chartH} stroke="#f87171" strokeWidth="1.5" strokeDasharray="4,2" />
      <text x={cvarX - 30} y={PAD.t + 20} fill="#f87171" fontSize="8">CVaR 97.5%</text>
      {/* X axis labels */}
      {[-2, -1, 0, 1, 2].map((v) => (
        <text key={`xl${v}`} x={toX(v)} y={H - 4} fill="#71717a" fontSize="9" textAnchor="middle">
          {v > 0 ? `+${v}%` : `${v}%`}
        </text>
      ))}
      <text x={PAD.l - 4} y={PAD.t + 10} fill="#71717a" fontSize="9" textAnchor="end">Days</text>
    </svg>
  );
}

function BacktestChart() {
  const W = 480;
  const H = 120;
  const PAD = { l: 12, r: 12, t: 14, b: 24 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const toX = (i: number) => PAD.l + (i / BacktestDays) * chartW;
  const toY = (v: number) => PAD.t + chartH / 2 - (v / 2.5) * (chartH / 2);
  const varLine = PAD.t + chartH / 2 + (1.2 / 2.5) * (chartH / 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
      {/* VaR line */}
      <line x1={PAD.l} x2={W - PAD.r} y1={varLine} y2={varLine} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3" />
      <text x={W - PAD.r - 2} y={varLine - 3} fill="#f59e0b" fontSize="8" textAnchor="end">-VaR</text>
      {/* Zero line */}
      <line x1={PAD.l} x2={W - PAD.r} y1={PAD.t + chartH / 2} y2={PAD.t + chartH / 2} stroke="#3f3f46" strokeWidth="1" />
      {BacktestDays > 0 && BacktestExceptions.map((d, i) => (
        <line
          key={`bt${i}`}
          x1={toX(i)}
          x2={toX(i)}
          y1={PAD.t + chartH / 2}
          y2={toY(d.pnl)}
          stroke={d.exception ? "#ef4444" : "#4f46e5"}
          strokeWidth="1.5"
          opacity="0.8"
        />
      ))}
      {/* Exception dots */}
      {BacktestExceptions.filter((d) => d.exception).map((d, i) => (
        <circle key={`ex${i}`} cx={toX(d.day)} cy={toY(d.pnl)} r="3" fill="#ef4444" />
      ))}
      {[-2, -1, 0, 1].map((v) => (
        <text key={`by${v}`} x={PAD.l - 2} y={toY(v) + 3} fill="#52525b" fontSize="8" textAnchor="end">
          {v > 0 ? `+${v}` : `${v}`}
        </text>
      ))}
    </svg>
  );
}

function CorrelationMatrixSVG() {
  const assets = ["SPY", "TLT", "GLD", "VIX", "USD"];
  const n = assets.length;
  // Precomputed plausible correlation matrix
  const corr: number[][] = [
    [1.0, -0.6, 0.1, -0.7, -0.3],
    [-0.6, 1.0, 0.3, 0.5, 0.2],
    [0.1, 0.3, 1.0, -0.1, -0.4],
    [-0.7, 0.5, -0.1, 1.0, 0.2],
    [-0.3, 0.2, -0.4, 0.2, 1.0],
  ];
  const W = 260;
  const H = 260;
  const cell = 44;
  const off = 28;
  const colorCell = (v: number) => {
    if (v >= 0.8) return "#1e3a2f";
    if (v >= 0.3) return "#14532d";
    if (v >= -0.3) return "#1e1b4b";
    if (v >= -0.6) return "#450a0a";
    return "#7f1d1d";
  };
  const textColor = (v: number) => (v > 0.3 ? "#6ee7b7" : v < -0.3 ? "#fca5a5" : "#a5b4fc");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs mx-auto">
      {assets.map((a, i) => (
        <text key={`ch${i}`} x={off + i * cell + cell / 2} y={16} fill="#a1a1aa" fontSize="8" textAnchor="middle" fontWeight="bold">
          {a}
        </text>
      ))}
      {assets.map((a, i) => (
        <text key={`cv${i}`} x={off - 4} y={off + i * cell + cell / 2 + 4} fill="#a1a1aa" fontSize="8" textAnchor="end" fontWeight="bold">
          {a}
        </text>
      ))}
      {corr.map((row, ri) =>
        row.map((v, ci) => (
          <g key={`cc${ri}-${ci}`}>
            <rect
              x={off + ci * cell + 2}
              y={off + ri * cell + 2}
              width={cell - 4}
              height={cell - 4}
              rx="3"
              fill={colorCell(v)}
            />
            <text
              x={off + ci * cell + cell / 2}
              y={off + ri * cell + cell / 2 + 4}
              fill={textColor(v)}
              fontSize="9"
              textAnchor="middle"
              fontWeight="bold"
            >
              {fmt2(v)}
            </text>
          </g>
        ))
      )}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Credit Risk Models
// ═══════════════════════════════════════════════════════════════════════════════

function MertonModelSVG() {
  const W = 480;
  const H = 180;
  const PAD = { l: 40, r: 20, t: 20, b: 32 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  // Firm value paths
  const T = 50;
  const debtLevel = 0.55;
  const paths: number[][] = Array.from({ length: 5 }, (_, pi) => {
    const seed = 0.3 + pi * 0.15;
    let val = 1.0;
    return Array.from({ length: T }, () => {
      val = val * (1 + (sv() * 0.08 - 0.04));
      return val;
    });
  });
  const allVals = paths.flat();
  const minV = Math.min(...allVals, 0.3);
  const maxV = Math.max(...allVals, 1.4);
  const toX = (t: number) => PAD.l + (t / (T - 1)) * chartW;
  const toY = (v: number) => PAD.t + chartH - ((v - minV) / (maxV - minV)) * chartH;
  const debtY = toY(debtLevel);
  const pathColors = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      {/* Debt threshold */}
      <line x1={PAD.l} x2={W - PAD.r} y1={debtY} y2={debtY} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6,3" />
      <text x={W - PAD.r - 2} y={debtY - 4} fill="#f87171" fontSize="9" textAnchor="end">Debt Threshold (D)</text>
      {paths.map((path, pi) => {
        const pts = path.map((v, t) => `${toX(t)},${toY(v)}`).join(" ");
        const lastVal = path[T - 1];
        const defaulted = lastVal < debtLevel;
        return (
          <polyline
            key={`fp${pi}`}
            points={pts}
            fill="none"
            stroke={defaulted ? "#ef4444" : pathColors[pi]}
            strokeWidth="1.5"
            opacity="0.85"
            strokeLinejoin="round"
          />
        );
      })}
      {/* Y axis labels */}
      {[0.4, 0.7, 1.0, 1.3].map((v) => (
        <text key={`my${v}`} x={PAD.l - 4} y={toY(v) + 3} fill="#52525b" fontSize="8" textAnchor="end">
          {v.toFixed(1)}
        </text>
      ))}
      <text x={PAD.l} y={H - 4} fill="#71717a" fontSize="8">t=0</text>
      <text x={W - PAD.r} y={H - 4} fill="#71717a" fontSize="8" textAnchor="end">t=T</text>
      <text x={PAD.l - 6} y={PAD.t + chartH / 2} fill="#71717a" fontSize="8" textAnchor="middle" transform={`rotate(-90, ${PAD.l - 14}, ${PAD.t + chartH / 2})`}>Firm Value V</text>
    </svg>
  );
}

function CreditMigrationMatrix() {
  const ratings = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "D"];
  // Simplified 1-year transition probabilities (%)
  const matrix: number[][] = [
    [93.0, 5.5, 0.9, 0.4, 0.1, 0.05, 0.02, 0.02],
    [0.6, 91.0, 6.8, 1.1, 0.3, 0.1, 0.05, 0.05],
    [0.05, 2.0, 91.5, 5.4, 0.7, 0.2, 0.06, 0.09],
    [0.03, 0.2, 4.4, 89.5, 4.9, 0.7, 0.12, 0.15],
    [0.01, 0.06, 0.4, 6.2, 83.5, 7.8, 1.0, 1.03],
    [0.01, 0.05, 0.2, 0.5, 6.5, 83.0, 5.2, 4.54],
    [0.0, 0.02, 0.2, 0.7, 2.0, 11.0, 65.0, 21.08],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 100.0],
  ];
  const cellColor = (v: number, ri: number, ci: number) => {
    if (ri === ci) return "bg-indigo-900/60";
    if (ci === 7) return v > 0 ? "bg-red-900/60" : "";
    if (v > 5) return "bg-emerald-900/40";
    if (v > 1) return "bg-muted";
    return "";
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-muted-foreground border-collapse">
        <thead>
          <tr>
            <th className="py-1 px-2 text-muted-foreground text-left">From \ To</th>
            {ratings.map((r) => (
              <th key={r} className={cn("py-1 px-2 text-center font-mono", r === "D" ? "text-red-400" : "text-muted-foreground")}>{r}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, ri) => (
            <tr key={ri} className="border-t border-border/50">
              <td className={cn("py-1 px-2 font-bold font-mono", ri === 7 ? "text-red-400" : "text-indigo-400")}>{ratings[ri]}</td>
              {row.map((v, ci) => (
                <td key={ci} className={cn("py-1 px-2 text-center font-mono", cellColor(v, ri, ci), ri === ci ? "text-indigo-300 font-bold" : ci === 7 ? "text-red-300" : "text-muted-foreground")}>
                  {v.toFixed(v >= 10 ? 0 : v >= 1 ? 1 : 2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CCRProfileSVG() {
  const W = 480;
  const H = 160;
  const PAD = { l: 44, r: 16, t: 16, b: 28 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const T = 60;
  // EE and PFE 95% profiles
  const ee: number[] = [];
  const pfe: number[] = [];
  for (let t = 0; t < T; t++) {
    const drift = t / T;
    const base = Math.sin((t / T) * Math.PI) * 0.7 + drift * 0.1;
    ee.push(base * 0.6 + 0.05);
    pfe.push(base * 1.0 + 0.12);
  }
  const maxV = Math.max(...pfe, 0.9);
  const toX = (t: number) => PAD.l + (t / (T - 1)) * chartW;
  const toY = (v: number) => PAD.t + chartH - (v / maxV) * chartH;
  const eePts = ee.map((v, t) => `${toX(t)},${toY(v)}`).join(" ");
  const pfePts = pfe.map((v, t) => `${toX(t)},${toY(v)}`).join(" ");
  // EPE = average of EE
  const epe = ee.reduce((a, b) => a + b, 0) / T;
  const epeY = toY(epe);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <defs>
        <linearGradient id="pfeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="eeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1.0].map((v) => (
        <line key={`cg${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v * maxV)} y2={toY(v * maxV)} stroke="#27272a" strokeWidth="1" />
      ))}
      {/* PFE area */}
      <polyline points={pfePts} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
      {/* EE area */}
      <polyline points={eePts} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
      {/* EPE line */}
      <line x1={PAD.l} x2={W - PAD.r} y1={epeY} y2={epeY} stroke="#34d399" strokeWidth="1" strokeDasharray="5,3" />
      <text x={W - PAD.r - 2} y={epeY - 3} fill="#34d399" fontSize="8" textAnchor="end">EPE</text>
      {/* Labels */}
      <text x={toX(T * 0.6)} y={toY(pfe[Math.floor(T * 0.6)]) - 4} fill="#fbbf24" fontSize="8">PFE 95%</text>
      <text x={toX(T * 0.4)} y={toY(ee[Math.floor(T * 0.4)]) - 4} fill="#818cf8" fontSize="8">EE</text>
      {/* Y axis */}
      {[0, 0.25, 0.5, 0.75].map((v) => (
        <text key={`cy${v}`} x={PAD.l - 4} y={toY(v * maxV) + 3} fill="#52525b" fontSize="8" textAnchor="end">
          {(v * maxV * 100).toFixed(0)}%
        </text>
      ))}
      {/* X axis */}
      {[0, 1, 2, 3, 4, 5].map((yr) => {
        const t = Math.floor((yr / 5) * (T - 1));
        return (
          <text key={`cx${yr}`} x={toX(t)} y={H - 4} fill="#71717a" fontSize="8" textAnchor="middle">
            Y{yr}
          </text>
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Stress Testing
// ═══════════════════════════════════════════════════════════════════════════════

const STRESS_SCENARIOS = [
  {
    name: "2008 GFC",
    type: "Historical",
    equity: -52,
    credit: -38,
    rates: -180,
    fx: -15,
    liquidity: "Severe",
    color: "#ef4444",
  },
  {
    name: "2020 COVID",
    type: "Historical",
    equity: -34,
    credit: -25,
    rates: -150,
    fx: -8,
    liquidity: "High",
    color: "#f97316",
  },
  {
    name: "2022 Rate Shock",
    type: "Historical",
    equity: -20,
    credit: -12,
    rates: +425,
    fx: +12,
    liquidity: "Moderate",
    color: "#f59e0b",
  },
  {
    name: "DFAST Severely Adverse",
    type: "Regulatory",
    equity: -45,
    credit: -35,
    rates: -300,
    fx: -10,
    liquidity: "Severe",
    color: "#8b5cf6",
  },
  {
    name: "NGFS Net Zero 2050",
    type: "Climate",
    equity: -22,
    credit: -18,
    rates: +80,
    fx: -5,
    liquidity: "Low",
    color: "#10b981",
  },
  {
    name: "NGFS Hot House World",
    type: "Climate",
    equity: -38,
    credit: -30,
    rates: +40,
    fx: -20,
    liquidity: "High",
    color: "#dc2626",
  },
];

function StressWaterfallSVG() {
  const W = 480;
  const H = 180;
  const PAD = { l: 88, r: 16, t: 20, b: 28 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  // Loss components
  const components = [
    { label: "Market Risk", loss: 35, color: "#6366f1" },
    { label: "Credit Risk", loss: 28, color: "#f59e0b" },
    { label: "Liquidity Risk", loss: 15, color: "#10b981" },
    { label: "FX Risk", loss: 12, color: "#8b5cf6" },
    { label: "Op Risk", loss: 8, color: "#ec4899" },
  ];
  const total = components.reduce((a, c) => a + c.loss, 0);
  const maxV = total + 5;
  let cumulative = 0;
  const toX = (v: number) => PAD.l + (v / maxV) * chartW;
  const barH = Math.floor(chartH / components.length) - 4;
  const totalY = PAD.t + chartH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      {/* Grid */}
      {[0, 25, 50, 75, 100].map((v) => (
        <line key={`wg${v}`} x1={toX(v)} x2={toX(v)} y1={PAD.t} y2={PAD.t + chartH} stroke="#27272a" strokeWidth="1" />
      ))}
      {components.map((c, i) => {
        const y = PAD.t + i * (barH + 4);
        const startX = toX(cumulative);
        const w = toX(cumulative + c.loss) - startX;
        cumulative += c.loss;
        return (
          <g key={`wc${i}`}>
            <rect x={startX} y={y} width={w} height={barH} rx="3" fill={c.color} opacity="0.8" />
            <text x={PAD.l - 4} y={y + barH / 2 + 3} fill="#a1a1aa" fontSize="9" textAnchor="end">{c.label}</text>
            <text x={startX + w / 2} y={y + barH / 2 + 3} fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">
              {c.loss}bp
            </text>
          </g>
        );
      })}
      {/* Total */}
      <line x1={toX(total)} x2={toX(total)} y1={PAD.t} y2={PAD.t + chartH} stroke="#f87171" strokeWidth="1.5" strokeDasharray="4,2" />
      <text x={toX(total) + 2} y={PAD.t + 12} fill="#f87171" fontSize="8">Total: {total}bp</text>
      {/* X labels */}
      {[0, 25, 50, 75, 100].map((v) => (
        <text key={`wx${v}`} x={toX(v)} y={H - 4} fill="#71717a" fontSize="8" textAnchor="middle">{v}bp</text>
      ))}
      <text x={PAD.l} y={totalY + 14} fill="#52525b" fontSize="8">Capital Impact (basis points of RWA)</text>
    </svg>
  );
}

function NGFSScenarioSVG() {
  // 4 NGFS scenarios — temperature paths
  const W = 480;
  const H = 160;
  const PAD = { l: 32, r: 16, t: 14, b: 28 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const years = [2020, 2030, 2040, 2050, 2060, 2070, 2080];
  const scenarios = [
    { name: "Net Zero 2050", temps: [1.1, 1.4, 1.5, 1.5, 1.5, 1.5, 1.5], color: "#10b981" },
    { name: "Delayed Transition", temps: [1.1, 1.6, 1.9, 2.0, 1.9, 1.9, 1.9], color: "#f59e0b" },
    { name: "Divergent Net Zero", temps: [1.1, 1.5, 1.7, 1.7, 1.6, 1.6, 1.6], color: "#6366f1" },
    { name: "Hot House World", temps: [1.1, 1.7, 2.3, 2.9, 3.2, 3.5, 3.8], color: "#ef4444" },
  ];
  const minTemp = 1.0;
  const maxTemp = 4.0;
  const toX = (i: number) => PAD.l + (i / (years.length - 1)) * chartW;
  const toY = (t: number) => PAD.t + chartH - ((t - minTemp) / (maxTemp - minTemp)) * chartH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      {[1.5, 2.0, 2.5, 3.0, 3.5].map((t) => (
        <line key={`ng${t}`} x1={PAD.l} x2={W - PAD.r} y1={toY(t)} y2={toY(t)} stroke="#27272a" strokeWidth="1" strokeDasharray={t === 1.5 ? "4,2" : "1,0"} />
      ))}
      <text x={W - PAD.r - 2} y={toY(1.5) - 3} fill="#6ee7b7" fontSize="7" textAnchor="end">1.5°C target</text>
      {scenarios.map((sc, si) => {
        const pts = sc.temps.map((t, i) => `${toX(i)},${toY(t)}`).join(" ");
        return (
          <g key={`sc${si}`}>
            <polyline points={pts} fill="none" stroke={sc.color} strokeWidth="2" strokeLinejoin="round" />
            <text x={toX(years.length - 1) + 2} y={toY(sc.temps[years.length - 1]) + 3} fill={sc.color} fontSize="7">
              {sc.name.split(" ").slice(-1)}
            </text>
          </g>
        );
      })}
      {years.map((yr, i) => (
        <text key={`ny${i}`} x={toX(i)} y={H - 4} fill="#71717a" fontSize="8" textAnchor="middle">{yr}</text>
      ))}
      {[1.5, 2.0, 2.5, 3.0, 3.5].map((t) => (
        <text key={`nt${t}`} x={PAD.l - 4} y={toY(t) + 3} fill="#52525b" fontSize="7" textAnchor="end">{t}°C</text>
      ))}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Model Risk Management
// ═══════════════════════════════════════════════════════════════════════════════

function ModelLifecycleSVG() {
  const stages = [
    { label: "Development", color: "#6366f1", icon: "Dev" },
    { label: "Validation", color: "#8b5cf6", icon: "Val" },
    { label: "Approval", color: "#10b981", icon: "App" },
    { label: "Monitoring", color: "#f59e0b", icon: "Mon" },
    { label: "Retirement", color: "#ef4444", icon: "Ret" },
  ];
  const W = 480;
  const H = 100;
  const nodeR = 24;
  const spacing = W / (stages.length + 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24">
      <defs>
        {stages.map((st, i) => (
          <marker key={`ma${i}`} id={`ma${i}`} markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={stages[Math.min(i + 1, stages.length - 1)].color} />
          </marker>
        ))}
      </defs>
      {/* Connecting lines */}
      {stages.slice(0, -1).map((_, i) => (
        <line
          key={`ml${i}`}
          x1={spacing * (i + 1) + nodeR}
          y1={H / 2}
          x2={spacing * (i + 2) - nodeR}
          y2={H / 2}
          stroke={stages[i + 1].color}
          strokeWidth="2"
          markerEnd={`url(#ma${i})`}
        />
      ))}
      {/* Nodes */}
      {stages.map((st, i) => (
        <g key={`mn${i}`}>
          <circle cx={spacing * (i + 1)} cy={H / 2} r={nodeR} fill={st.color} opacity="0.2" stroke={st.color} strokeWidth="1.5" />
          <text x={spacing * (i + 1)} y={H / 2 - 4} fill={st.color} fontSize="9" textAnchor="middle" fontWeight="bold">
            {st.icon}
          </text>
          <text x={spacing * (i + 1)} y={H / 2 + 7} fill={st.color} fontSize="7" textAnchor="middle">
            {st.label.split(" ")[0]}
          </text>
          <text x={spacing * (i + 1)} y={H - 6} fill="#71717a" fontSize="7" textAnchor="middle">
            {st.label.split(" ")[1] || ""}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ModelInventoryTable() {
  const models = [
    { name: "Credit Scorecard", type: "Credit", tier: "High", psi: 0.08, gini: 72.1, lastVal: "2024 Q3", status: "Active" },
    { name: "Market VaR ES", type: "Market", tier: "High", psi: 0.04, gini: 85.3, lastVal: "2024 Q4", status: "Active" },
    { name: "CECL PD Model", type: "Credit", tier: "High", psi: 0.11, gini: 68.4, lastVal: "2024 Q2", status: "Review" },
    { name: "Stress Test LGD", type: "Credit", tier: "Medium", psi: 0.06, gini: 61.0, lastVal: "2024 Q1", status: "Active" },
    { name: "Fraud Detection", type: "Op Risk", tier: "Medium", psi: 0.14, gini: 78.9, lastVal: "2024 Q3", status: "Monitor" },
    { name: "Prepayment Model", type: "ALM", tier: "Medium", psi: 0.09, gini: 55.2, lastVal: "2024 Q2", status: "Active" },
    { name: "FX Options Pricer", type: "Market", tier: "Low", psi: 0.02, gini: 91.0, lastVal: "2024 Q4", status: "Active" },
  ];
  const tierColor = (t: string) => t === "High" ? "text-red-400" : t === "Medium" ? "text-amber-400" : "text-emerald-400";
  const statusColor = (s: string) => {
    if (s === "Active") return "text-emerald-400";
    if (s === "Review") return "text-amber-400";
    if (s === "Monitor") return "text-orange-400";
    return "text-muted-foreground";
  };
  const psiColor = (v: number) => v > 0.1 ? "text-red-400" : v > 0.05 ? "text-amber-400" : "text-emerald-400";
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-muted-foreground">
        <thead>
          <tr className="border-b border-border">
            {["Model Name", "Type", "Tier", "PSI", "Gini", "Last Val", "Status"].map((h) => (
              <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {models.map((m, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
              <td className="py-2 px-2 text-foreground font-medium">{m.name}</td>
              <td className="py-2 px-2 text-muted-foreground">{m.type}</td>
              <td className={cn("py-2 px-2 font-medium", tierColor(m.tier))}>{m.tier}</td>
              <td className={cn("py-2 px-2 font-mono", psiColor(m.psi))}>{m.psi.toFixed(2)}</td>
              <td className="py-2 px-2 text-indigo-400 font-mono">{m.gini.toFixed(1)}</td>
              <td className="py-2 px-2 text-muted-foreground">{m.lastVal}</td>
              <td className={cn("py-2 px-2 font-medium", statusColor(m.status))}>{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Expand/Collapse concept card ─────────────────────────────────────────────
interface ConceptCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}
function ConceptCard({ title, icon, children, defaultOpen = false }: ConceptCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="bg-card border-border">
      <button
        className="w-full text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">{icon}{title}</span>
            {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent>{children}</CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ── Formula block ──────────────────────────────────────────────────────────────
function FormulaBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm text-indigo-300 my-2 overflow-x-auto">
      {children}
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function Chip({ label, value, color = "text-foreground" }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-muted/60 rounded-lg px-3 py-2 flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className={cn("text-sm font-medium font-mono", color)}>{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function RiskModelsPage() {
  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-md bg-red-500/5 border border-red-500/20">
          <ShieldAlert className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Risk Models</h1>
          <p className="text-muted-foreground text-sm mt-1">
            VaR frameworks, credit risk methodology, stress testing, and model risk governance — the quantitative foundations of risk management.
          </p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Chip label="99% VaR Confidence" value="2.326σ" color="text-indigo-400" />
        <Chip label="FRTB ES Level" value="97.5%" color="text-amber-400" />
        <Chip label="Basel Green Zone" value="≤ 4 Exceptions" color="text-emerald-400" />
        <Chip label="SR 11-7 Pillars" value="3 Tiers" color="text-primary" />
      </div>

      <Tabs defaultValue="market" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="market" className="data-[state=active]:bg-muted text-xs text-muted-foreground sm:text-sm">
            Market Risk
          </TabsTrigger>
          <TabsTrigger value="credit" className="data-[state=active]:bg-muted text-xs text-muted-foreground sm:text-sm">
            Credit Risk
          </TabsTrigger>
          <TabsTrigger value="stress" className="data-[state=active]:bg-muted text-xs text-muted-foreground sm:text-sm">
            Stress Testing
          </TabsTrigger>
          <TabsTrigger value="modelrisk" className="data-[state=active]:bg-muted text-xs text-muted-foreground sm:text-sm">
            Model Risk
          </TabsTrigger>
        </TabsList>

        {/* ─────────────────────────────────────────────────────────────────────
            TAB 1: MARKET RISK MODELS
        ───────────────────────────────────────────────────────────────────── */}
        <TabsContent value="market" className="space-y-4 data-[state=inactive]:hidden">
          {/* VaR approaches overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                method: "Parametric VaR",
                aka: "Variance-Covariance",
                formula: "VaR = μ − zα · σ",
                detail: "Assumes returns are normally distributed. 1-day 99% VaR uses z = 2.326. Fast to compute but misses fat tails and non-linearities.",
                color: "border-indigo-500/40",
                badge: "Normal Distribution",
                badgeColor: "bg-indigo-900/60 text-indigo-300",
              },
              {
                method: "Historical Simulation",
                aka: "HS VaR",
                formula: "VaR₉₉ = 5th worst P&L (500-day)",
                detail: "Re-values portfolio using 500 days of observed market moves. Non-parametric, naturally captures fat tails and correlations. Slow to react to new regimes.",
                color: "border-amber-500/40",
                badge: "500-Day Lookback",
                badgeColor: "bg-amber-900/60 text-amber-300",
              },
              {
                method: "Monte Carlo VaR",
                aka: "MC Simulation",
                formula: "VaR = percentile(sim P&L, 1%)",
                detail: "Generate 10,000+ scenarios from calibrated stochastic processes. Handles optionality, path-dependency. Computationally intensive. Gold standard for complex portfolios.",
                color: "border-emerald-500/40",
                badge: "10,000 Scenarios",
                badgeColor: "bg-emerald-900/60 text-emerald-300",
              },
            ].map((m, i) => (
              <Card key={i} className={cn("bg-card border", m.color)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">{m.method}</CardTitle>
                  <p className="text-xs text-muted-foreground">{m.aka}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="bg-background rounded px-3 py-2 font-mono text-xs text-indigo-300">{m.formula}</div>
                  <p className="text-xs text-muted-foreground">{m.detail}</p>
                  <Badge className={m.badgeColor}>{m.badge}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Historical VaR chart */}
          <Card className="bg-card border-border border-l-4 border-l-primary">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                Historical Simulation VaR — 500-Day P&L Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HistSimVaRChart />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <Chip label="99% VaR" value={`${Math.abs(sortedPnL[VAR_99_IDX]).toFixed(2)}%`} color="text-amber-400" />
                <Chip label="CVaR 97.5%" value={`${Math.abs(sortedPnL.slice(0, Math.floor(500 * 0.025)).reduce((a, b) => a + b, 0) / Math.floor(500 * 0.025)).toFixed(2)}%`} color="text-red-400" />
                <Chip label="Lookback" value="500 days" color="text-muted-foreground" />
                <Chip label="Confidence" value="99.0%" color="text-indigo-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Red bars represent the 1% tail losses. CVaR (Expected Shortfall) at 97.5% is the average loss beyond the VaR threshold — a coherent risk measure satisfying sub-additivity, monotonicity, positive homogeneity, and translation invariance.
              </p>
            </CardContent>
          </Card>

          {/* Backtesting — Basel Traffic Light */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Backtesting: Basel Traffic Light Approach (250-day)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BacktestChart />
              <div className="grid grid-cols-3 gap-3 mt-3">
                {[
                  { zone: "Green", exceptions: "0–4", multiplier: "3.0", color: "text-emerald-400", bg: "bg-emerald-900/20 border-emerald-800" },
                  { zone: "Amber", exceptions: "5–9", multiplier: "3.4–3.8", color: "text-amber-400", bg: "bg-amber-900/20 border-amber-800" },
                  { zone: "Red", exceptions: "10+", multiplier: "4.0", color: "text-red-400", bg: "bg-red-900/20 border-red-800" },
                ].map((z) => (
                  <div key={z.zone} className={cn("rounded-lg border p-3", z.bg)}>
                    <div className={cn("font-medium text-sm", z.color)}>{z.zone} Zone</div>
                    <div className="text-xs text-muted-foreground mt-1">Exceptions: <span className="text-foreground">{z.exceptions}</span></div>
                    <div className="text-xs text-muted-foreground">Capital ×: <span className={z.color}>{z.multiplier}</span></div>
                  </div>
                ))}
              </div>
              <div className={cn("mt-3 p-3 rounded-lg border text-sm font-medium flex items-center gap-2",
                baselZone === "green" ? "bg-emerald-900/20 border-emerald-800 text-emerald-400" :
                baselZone === "amber" ? "bg-amber-900/20 border-amber-800 text-amber-400" :
                "bg-red-900/20 border-red-800 text-red-400"
              )}>
                {baselZone === "green" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                Simulated outcome: <strong>{exceptionCount} exceptions</strong> — {baselZone.charAt(0).toUpperCase() + baselZone.slice(1)} Zone
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Basel III requires daily backtesting of 99% 1-day VaR against actual and hypothetical P&L. P&L attribution compares actual (includes intraday) vs hypothetical (end-of-day revaluation using same risk factors). FRTB requires both comparisons to pass.
              </p>
            </CardContent>
          </Card>

          {/* FRTB & Sensitivity-Based Approach */}
          <ConceptCard
            title="FRTB: ES vs VaR — Fundamental Review of the Trading Book"
            icon={<TrendingDown className="w-3.5 h-3.5 text-muted-foreground/50" />}
            defaultOpen
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-lg p-3 space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Basel 2.5 (Old)</div>
                  <div className="text-xs text-muted-foreground">• 10-day 99% VaR × multiplier</div>
                  <div className="text-xs text-muted-foreground">• Stressed VaR supplement</div>
                  <div className="text-xs text-muted-foreground">• IRC (Incremental Risk Charge)</div>
                  <div className="text-xs text-muted-foreground">• Not coherent (VaR violates sub-additivity)</div>
                </div>
                <div className="bg-muted/40 rounded-lg p-3 space-y-1">
                  <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">FRTB IMA (New)</div>
                  <div className="text-xs text-muted-foreground">• 97.5% Expected Shortfall (ES)</div>
                  <div className="text-xs text-muted-foreground">• Liquidity horizons: 10/20/40/60/120d</div>
                  <div className="text-xs text-muted-foreground">• DRC (Default Risk Charge) replaces IRC</div>
                  <div className="text-xs text-muted-foreground">• Coherent, captures tail risk better</div>
                </div>
              </div>
              <div className="text-xs font-medium text-muted-foreground mt-2">Sensitivity-Based Approach (SBA) — Standardised Method</div>
              <div className="grid grid-cols-3 gap-2">
                {["Delta (Δ) — linear price sensitivity to risk factors", "Vega (ν) — sensitivity of options to implied vol", "Curvature — captures non-linear option risk (γ)"].map((item, i) => (
                  <div key={i} className="bg-muted/30 rounded p-2 text-xs text-muted-foreground">{item}</div>
                ))}
              </div>
            </div>
          </ConceptCard>

          {/* Correlation matrix */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
                Correlation Matrix Construction Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                <div>
                  <CorrelationMatrixSVG />
                  <p className="text-xs text-muted-foreground mt-2">Cross-asset correlation matrix. Green = positive correlation, red = negative.</p>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Historical Correlation", desc: "Equal-weighted rolling window (typically 1–2yr). Stable but slow to update. Risk: non-stationarity." },
                    { name: "Exponential Weighting (EWMA)", desc: "λ decay factor (RiskMetrics: λ=0.94 daily). Recent observations weighted more. Responds faster to regime changes." },
                    { name: "Factor Model", desc: "Decompose returns into systematic factors (market, sector, style). Correlation implied by factor loadings. Avoids full Σ matrix estimation for large portfolios." },
                  ].map((m, i) => (
                    <div key={i} className="bg-muted/40 rounded-lg p-3">
                      <div className="text-xs font-medium text-indigo-300">{m.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─────────────────────────────────────────────────────────────────────
            TAB 2: CREDIT RISK MODELS
        ───────────────────────────────────────────────────────────────────── */}
        <TabsContent value="credit" className="space-y-4 data-[state=inactive]:hidden">
          {/* EL = PD × LGD × EAD */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Expected Loss Framework: EL = PD × LGD × EAD
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    abbr: "PD",
                    name: "Probability of Default",
                    def: "Likelihood borrower defaults within 1 year. Driven by credit score, leverage, coverage ratios, macro cycle.",
                    range: "0.01% (AAA) → 20%+ (CCC)",
                    color: "text-red-400",
                  },
                  {
                    abbr: "LGD",
                    name: "Loss Given Default",
                    def: "Percentage of EAD lost if default occurs. = 1 − Recovery Rate. Depends on collateral, seniority, workout process.",
                    range: "10% (secured) → 90% (unsecured sub)",
                    color: "text-amber-400",
                  },
                  {
                    abbr: "EAD",
                    name: "Exposure at Default",
                    def: "Expected outstanding balance at time of default. For revolving credit: drawn + CCF × undrawn commitments.",
                    range: "Equal to notional for term loans",
                    color: "text-indigo-400",
                  },
                ].map((c) => (
                  <div key={c.abbr} className="bg-muted/40 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-lg font-medium font-mono", c.color)}>{c.abbr}</span>
                      <span className="text-xs text-muted-foreground">{c.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.def}</p>
                    <div className="text-xs text-muted-foreground italic">{c.range}</div>
                  </div>
                ))}
              </div>
              <FormulaBlock>
                EL = PD × LGD × EAD{"\n"}
                Unexpected Loss (UL) = EAD × LGD × √(PD × (1−PD)){"\n"}
                Economic Capital ≈ k · σ(Loss) = UL × capital multiplier
              </FormulaBlock>
            </CardContent>
          </Card>

          {/* Structural vs Reduced Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Merton Structural Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <MertonModelSVG />
                <p className="text-xs text-muted-foreground">
                  Default occurs when firm asset value V falls below debt threshold D at maturity T. Equity = call option on firm value: <span className="text-indigo-300 font-mono">E = V·N(d₁) − D·e⁻ʳᵀ·N(d₂)</span>. PD = N(−d₂).
                </p>
                <p className="text-xs text-muted-foreground">Blue paths = survival. Red paths = default (V &lt; D at T). Volatility of asset value σᵥ is key input — inferred from equity vol.</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Reduced Form Models</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Default is modeled as a Poisson arrival with intensity λ (hazard rate). Default time τ is the first jump of a Poisson process.
                </p>
                <FormulaBlock>
                  P(τ &gt; t) = exp(−∫₀ᵗ λ(s)ds){"\n"}
                  λ extracted from CDS spreads:{"\n"}
                  λ ≈ CDS spread / (1 − Recovery Rate)
                </FormulaBlock>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Jarrow-Turnbull", note: "Constant hazard rate" },
                    { label: "Duffie-Singleton", note: "Stochastic intensity" },
                    { label: "Hull-White", note: "CDS calibration" },
                    { label: "SABR credit", note: "Stochastic LGD" },
                  ].map((m, i) => (
                    <div key={i} className="bg-muted/30 rounded p-2">
                      <div className="text-xs text-indigo-300 font-medium">{m.label}</div>
                      <div className="text-xs text-muted-foreground">{m.note}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Credit Migration Matrix */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-muted-foreground/50" />
                Credit Migration Matrix — 1-Year Rating Transition Probabilities (%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CreditMigrationMatrix />
              <p className="text-xs text-muted-foreground mt-2">
                Diagonal = probability of staying in rating; off-diagonal = transition probability. Multi-year matrices computed via matrix exponentiation: M(t) = M(1)^t. Used in credit VaR, CECL, IFRS 9, and scenario analysis.
              </p>
            </CardContent>
          </Card>

          {/* Basel IRB */}
          <ConceptCard
            title="Basel IRB Approach: Foundation vs Advanced"
            icon={<Database className="w-4 h-4 text-indigo-400" />}
            defaultOpen
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                  <div className="text-xs font-medium text-amber-300">F-IRB (Foundation)</div>
                  <div className="text-xs text-muted-foreground">Bank provides own <span className="text-foreground">PD</span> estimates.</div>
                  <div className="text-xs text-muted-foreground">Regulator provides LGD, EAD, M.</div>
                  <div className="text-xs text-muted-foreground">Corporate: LGD = 45%, EAD = drawn + 75% × undrawn.</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                  <div className="text-xs font-medium text-emerald-300">A-IRB (Advanced)</div>
                  <div className="text-xs text-muted-foreground">Bank provides own <span className="text-foreground">PD, LGD, EAD, M</span>.</div>
                  <div className="text-xs text-muted-foreground">Higher data requirements (7yr history).</div>
                  <div className="text-xs text-muted-foreground">Lower capital floor (output floor: 72.5% of SA).</div>
                </div>
              </div>
              <div className="text-xs font-medium text-muted-foreground">AIRB Capital Formula (Simplified)</div>
              <FormulaBlock>
                ρ = 0.12 × (1−exp(−50×PD)) / (1−exp(−50)) + 0.24 × [1 − (1−exp(−50×PD)) / (1−exp(−50))]{"\n"}
                K = LGD × [N(√(1/1−ρ) × G(PD) + √(ρ/(1−ρ)) × G(0.999)) − PD]{"\n"}
                RWA = K × 12.5 × EAD × M adjustment
              </FormulaBlock>
              <p className="text-xs text-muted-foreground">
                ρ = asset correlation (sector-dependent). G = inverse normal CDF. 0.999 quantile = 99.9% confidence (1-in-1000yr loss). Maturity adjustment penalises longer-dated exposures.
              </p>
            </div>
          </ConceptCard>

          {/* CCR Exposure Profile */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Counterparty Credit Risk: EE / PFE / EPE / CVA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CCRProfileSVG />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                {[
                  { abbr: "EE", name: "Expected Exposure", color: "text-indigo-400" },
                  { abbr: "PFE", name: "Potential Future Exposure (95%)", color: "text-amber-400" },
                  { abbr: "EPE", name: "Effective Positive Exposure", color: "text-emerald-400" },
                  { abbr: "CVA", name: "Credit Valuation Adjustment", color: "text-red-400" },
                ].map((m) => (
                  <div key={m.abbr} className="bg-muted/30 rounded p-2">
                    <div className={cn("text-xs text-muted-foreground font-medium font-mono", m.color)}>{m.abbr}</div>
                    <div className="text-xs text-muted-foreground">{m.name}</div>
                  </div>
                ))}
              </div>
              <FormulaBlock>CVA ≈ (1−R) × Σ EE(tᵢ) × [PD(tᵢ₋₁,tᵢ)] × D(tᵢ)</FormulaBlock>
              <p className="text-xs text-muted-foreground mt-1">CVA is the market value of counterparty default risk. Banks must hold CVA capital under Basel III. DVA (debit valuation adjustment) is the mirror — own credit risk to counterparty.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─────────────────────────────────────────────────────────────────────
            TAB 3: STRESS TESTING
        ───────────────────────────────────────────────────────────────────── */}
        <TabsContent value="stress" className="space-y-4 data-[state=inactive]:hidden">
          {/* Scenario table */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Historical & Regulatory Stress Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-muted-foreground">
                  <thead>
                    <tr className="border-b border-border">
                      {["Scenario", "Type", "Equity Δ", "Credit Spread Δ", "Rates Δ (bps)", "FX Δ", "Liquidity"].map((h) => (
                        <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {STRESS_SCENARIOS.map((sc, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-2 font-medium" style={{ color: sc.color }}>{sc.name}</td>
                        <td className="py-2 px-2 text-muted-foreground">{sc.type}</td>
                        <td className={cn("py-2 px-2 font-mono", sc.equity < 0 ? "text-red-400" : "text-emerald-400")}>
                          {sc.equity > 0 ? `+${sc.equity}` : sc.equity}%
                        </td>
                        <td className={cn("py-2 px-2 font-mono", sc.credit < 0 ? "text-red-400" : "text-amber-400")}>
                          {sc.credit > 0 ? `+${sc.credit}` : sc.credit}%
                        </td>
                        <td className={cn("py-2 px-2 font-mono", sc.rates > 0 ? "text-amber-400" : "text-primary")}>
                          {sc.rates > 0 ? `+${sc.rates}` : sc.rates}
                        </td>
                        <td className={cn("py-2 px-2 font-mono", sc.fx < 0 ? "text-red-400" : "text-emerald-400")}>
                          {sc.fx > 0 ? `+${sc.fx}` : sc.fx}%
                        </td>
                        <td className="py-2 px-2 text-muted-foreground">{sc.liquidity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Stress loss waterfall */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-400" />
                Stress Loss Decomposition by Risk Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StressWaterfallSVG />
              <p className="text-xs text-muted-foreground mt-2">
                Capital impact decomposed into risk type contributions. Expressed in basis points of Risk-Weighted Assets (RWA). Market and credit risk typically dominate; liquidity adds tail stress multiplier.
              </p>
            </CardContent>
          </Card>

          {/* NGFS Climate Scenarios */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                NGFS Climate Scenarios — Temperature Pathways
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NGFSScenarioSVG />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                {[
                  { name: "Net Zero 2050", desc: "Orderly. Carbon price rises steeply. Transition risk high, physical risk low.", color: "text-emerald-400" },
                  { name: "Delayed Transition", desc: "Policies delayed, then abrupt. Highest transition risk. Some physical risk.", color: "text-amber-400" },
                  { name: "Divergent Net Zero", desc: "Different sectors/regions decarbonise at different speeds.", color: "text-indigo-400" },
                  { name: "Hot House World", desc: "Current policies only. High chronic physical risk. >3°C warming.", color: "text-red-400" },
                ].map((sc, i) => (
                  <div key={i} className="bg-muted/30 rounded p-2">
                    <div className={cn("text-xs text-muted-foreground font-medium", sc.color)}>{sc.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{sc.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stress test types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConceptCard
              title="Reverse Stress Testing"
              icon={<TrendingDown className="w-4 h-4 text-red-400" />}
              defaultOpen
            >
              <p className="text-xs text-muted-foreground">
                Start from the outcome (failure/critical loss) and work backwards to identify scenarios that could cause it. Mandated by regulators (PRA, ECB). Forces management to confront tail risks not captured by forward stress tests.
              </p>
              <div className="mt-2 space-y-1">
                {["Identify critical loss threshold (e.g., CET1 &lt; 4.5%)", "Search scenario space: what shocks breach the threshold?", "Assess plausibility of breaking scenarios", "Design mitigants before they occur"].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-indigo-400 font-medium shrink-0">{i + 1}.</span>
                    <span dangerouslySetInnerHTML={{ __html: step }} />
                  </div>
                ))}
              </div>
            </ConceptCard>
            <ConceptCard
              title="CCAR / DFAST Regulatory Framework"
              icon={<ShieldAlert className="w-3.5 h-3.5 text-muted-foreground/50" />}
              defaultOpen
            >
              <div className="space-y-2 text-xs text-muted-foreground">
                <div><span className="text-foreground font-medium">DFAST:</span> Dodd-Frank Act Stress Test. Annual. Three scenarios: Baseline, Adverse, Severely Adverse. Published by Fed. BHCs &gt;$100B required.</div>
                <div><span className="text-foreground font-medium">CCAR:</span> Comprehensive Capital Analysis and Review. Adds qualitative assessment: capital planning processes, governance, assumptions. Can fail quantitative but pass qualitatively (and vice versa).</div>
                <div><span className="text-foreground font-medium">Severely Adverse:</span> ~10% unemployment, 50% equity decline, 300bps rate drop, global recession. Horizon: 9 quarters.</div>
              </div>
            </ConceptCard>
          </div>

          {/* Sensitivity vs Scenario */}
          <ConceptCard
            title="Sensitivity Analysis vs Scenario Analysis — Key Distinction"
            icon={<BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-xs font-medium text-primary mb-1">Sensitivity Analysis</div>
                <div className="text-xs text-muted-foreground">Varies one factor at a time (DV01, CS01, equity delta). Measures marginal impact. Fast, tractable. Ignores cross-factor correlations. Used for hedging, limit-setting, P&L attribution.</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-xs font-medium text-primary mb-1">Scenario Analysis</div>
                <div className="text-xs text-muted-foreground">Moves multiple factors simultaneously using economic logic. Captures correlation and second-order effects. Historical: uses observed crisis moves. Hypothetical: custom narrative (e.g., geopolitical shock). Regulatorily required.</div>
              </div>
            </div>
          </ConceptCard>
        </TabsContent>

        {/* ─────────────────────────────────────────────────────────────────────
            TAB 4: MODEL RISK MANAGEMENT
        ───────────────────────────────────────────────────────────────────── */}
        <TabsContent value="modelrisk" className="space-y-4 data-[state=inactive]:hidden">
          {/* SR 11-7 */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-amber-400" />
                SR 11-7 / OCC 2011-12: Model Risk Management Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Federal Reserve and OCC supervisory guidance (2011) defines model risk as the potential for adverse consequences from decisions based on incorrect or misused model outputs. Two sources: <span className="text-foreground">model error</span> (incorrect design, wrong assumptions, implementation bugs) and <span className="text-foreground">model misuse</span> (applied outside intended scope, limitations not understood).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    pillar: "1. Development & Implementation",
                    items: ["Conceptual soundness documentation", "Data quality and governance", "Testing and benchmarking", "Independent code review"],
                    color: "border-indigo-500/40 text-indigo-300",
                  },
                  {
                    pillar: "2. Validation",
                    items: ["Performed by independent team", "Conceptual review", "Ongoing monitoring", "Annual revalidation minimum"],
                    color: "border-amber-500/40 text-amber-300",
                  },
                  {
                    pillar: "3. Governance & Controls",
                    items: ["Model inventory completeness", "Model tiering (High/Med/Low)", "Board and senior mgmt oversight", "Model risk appetite statement"],
                    color: "border-emerald-500/40 text-emerald-300",
                  },
                ].map((p, i) => (
                  <div key={i} className={cn("rounded-lg border p-3 space-y-2", p.color.split(" ")[0])}>
                    <div className={cn("text-xs text-muted-foreground font-medium", p.color.split(" ")[1])}>{p.pillar}</div>
                    {p.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <span className="text-muted-foreground">•</span>
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Model Lifecycle */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                Model Validation Lifecycle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ModelLifecycleSVG />
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                {[
                  { stage: "Development", items: "Design, data, code, documentation" },
                  { stage: "Validation", items: "Independent review, benchmark, testing" },
                  { stage: "Approval", items: "MRM committee sign-off, conditions" },
                  { stage: "Monitoring", items: "PSI, CSI, Gini, calibration drift" },
                  { stage: "Retirement", items: "Decommission, successor transition" },
                ].map((st, i) => (
                  <div key={i} className="bg-muted/30 rounded p-2">
                    <div className="text-xs font-medium text-muted-foreground">{st.stage}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{st.items}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Model Inventory */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-muted-foreground/50" />
                Model Inventory — Risk Tiering &amp; Monitoring Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ModelInventoryTable />
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { metric: "PSI", name: "Population Stability Index", thresholds: "<0.1 stable | 0.1–0.25 shift | >0.25 unstable", color: "text-indigo-400" },
                  { metric: "CSI", name: "Characteristic Stability Index", thresholds: "Per-variable analog of PSI; flags input distribution drift", color: "text-amber-400" },
                  { metric: "Gini", name: "Gini Coefficient", thresholds: ">60% good | 40–60% acceptable | <40% poor discrimination", color: "text-emerald-400" },
                ].map((m, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-2">
                    <div className={cn("text-sm font-medium font-mono", m.color)}>{m.metric}</div>
                    <div className="text-xs text-muted-foreground">{m.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{m.thresholds}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Backtesting vs Benchmarking */}
          <ConceptCard
            title="Backtesting vs Benchmarking — Validation Techniques"
            icon={<Activity className="w-3.5 h-3.5 text-muted-foreground/50" />}
            defaultOpen
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="space-y-2">
                <div className="text-foreground font-medium">Backtesting</div>
                <p className="text-muted-foreground">Compares model predictions against actual observed outcomes over historical period. Tests predictive accuracy. Example: VaR backtesting (exceptions count), PD backtesting (realised default rates vs predicted PDs). Statistical tests: Kupiec (proportion of failures), Christoffersen (independence of failures).</p>
              </div>
              <div className="space-y-2">
                <div className="text-foreground font-medium">Benchmarking</div>
                <p className="text-muted-foreground">Compares primary model outputs against independent reference models (challenger models). Doesn&apos;t require outcomes — useful for validation before model goes live. Example: internal credit scorecard vs vendor bureau score, IRB PD model vs external rating agency PDs. Identifies systematic bias.</p>
              </div>
            </div>
          </ConceptCard>

          {/* TRIM & CECL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConceptCard
              title="ECB TRIM: Targeted Review of Internal Models"
              icon={<ShieldAlert className="w-4 h-4 text-red-400" />}
              defaultOpen
            >
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>ECB launched TRIM 2016–2021 to reduce unwarranted RWA variability across European banks using IRB models. Key findings:</p>
                {["PD calibration often too optimistic vs realised defaults", "LGD downturn estimates inconsistent across peers", "EAD credit conversion factors lacked conservatism", "Data quality and IT infrastructure weaknesses", "Outcome: many banks required to raise RWA (+~12% on average)"].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-red-400 shrink-0">▸</span>
                    {item}
                  </div>
                ))}
              </div>
            </ConceptCard>
            <ConceptCard
              title="CECL: Current Expected Credit Loss"
              icon={<TrendingDown className="w-4 h-4 text-amber-400" />}
              defaultOpen
            >
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>ASC 326 (FASB). Effective 2020 for large banks, replaced incurred loss model. Key change: <span className="text-foreground">lifetime expected loss on day 1</span>.</p>
                {[
                  "Forward-looking: incorporates economic forecasts (macroeconomic scenarios + probability weights)",
                  "Loss recognised when loan originated (not when loss likely)",
                  "Multiple economic scenarios (base, adverse, optimistic) probability-weighted",
                  "Segment loans by similar risk characteristics",
                  "IFRS 9 equivalent: 3-stage model (Stage 1→2→3 as credit quality deteriorates)",
                ].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-amber-400 shrink-0">▸</span>
                    {item}
                  </div>
                ))}
              </div>
            </ConceptCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
