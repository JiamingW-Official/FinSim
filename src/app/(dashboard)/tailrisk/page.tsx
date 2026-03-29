"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  TrendingDown,
  BarChart2,
  DollarSign,
  Info,
  Zap,
  Activity,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// PRNG (seed 903)
// ─────────────────────────────────────────────────────────────────────────────

function makePrng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

interface TailEvent {
  year: string;
  name: string;
  peakToTrough: number;
  vixSpike: number;
  recoveryMonths: number;
  category: string;
}

const TAIL_EVENTS: TailEvent[] = [
  { year: "1987", name: "Black Monday", peakToTrough: -33.5, vixSpike: 150, recoveryMonths: 24, category: "Crash" },
  { year: "1998", name: "LTCM / Russia Default", peakToTrough: -19.3, vixSpike: 45, recoveryMonths: 5, category: "Credit" },
  { year: "2000", name: "Dot-com Bust", peakToTrough: -49.1, vixSpike: 42, recoveryMonths: 55, category: "Bubble" },
  { year: "2001", name: "9/11 Shock", peakToTrough: -11.6, vixSpike: 43, recoveryMonths: 8, category: "Geopolitical" },
  { year: "2008", name: "Global Financial Crisis", peakToTrough: -56.8, vixSpike: 80, recoveryMonths: 49, category: "Credit" },
  { year: "2010", name: "Flash Crash", peakToTrough: -6.7, vixSpike: 40, recoveryMonths: 1, category: "Systemic" },
  { year: "2011", name: "EU Sovereign Debt", peakToTrough: -21.6, vixSpike: 48, recoveryMonths: 7, category: "Credit" },
  { year: "2018", name: "Volmageddon (Feb)", peakToTrough: -10.2, vixSpike: 50, recoveryMonths: 3, category: "Vol" },
  { year: "2020", name: "COVID-19 Crash", peakToTrough: -33.9, vixSpike: 82, recoveryMonths: 5, category: "Exogenous" },
  { year: "2022", name: "Rate Hike Selloff", peakToTrough: -25.4, vixSpike: 38, recoveryMonths: 14, category: "Macro" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Crash: "#ef4444",
  Credit: "#f97316",
  Bubble: "#eab308",
  Geopolitical: "#8b5cf6",
  Systemic: "#ec4899",
  Vol: "#06b6d4",
  Exogenous: "#10b981",
  Macro: "#3b82f6",
};

// ─────────────────────────────────────────────────────────────────────────────
// SVG helpers
// ─────────────────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1: Black Swan Events
// ─────────────────────────────────────────────────────────────────────────────

function FatTailSVG() {
  const W = 560;
  const H = 180;
  const pad = { l: 40, r: 20, t: 20, b: 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  // Normal distribution PDF
  function normalPDF(x: number, mu: number, sigma: number) {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
  }
  // Fat-tail (Student-t like via manual formula, df=3)
  function fatTailPDF(x: number) {
    const df = 3;
    const num = Math.pow(1 + (x * x) / df, -(df + 1) / 2);
    return num * 0.5; // scale to overlay nicely
  }

  const xs = Array.from({ length: 200 }, (_, i) => lerp(-5, 5, i / 199));
  const normalY = xs.map((x) => normalPDF(x, 0, 1));
  const fatY = xs.map((x) => fatTailPDF(x));
  const maxY = Math.max(...normalY, ...fatY);

  function toSVG(x: number, y: number) {
    const sx = pad.l + ((x + 5) / 10) * plotW;
    const sy = pad.t + plotH - (y / maxY) * plotH;
    return { sx, sy };
  }

  const normalPath = xs
    .map((x, i) => {
      const { sx, sy } = toSVG(x, normalY[i]);
      return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");

  const fatPath = xs
    .map((x, i) => {
      const { sx, sy } = toSVG(x, fatY[i]);
      return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");

  // Tail fill: x < -2.5 (left tail region)
  const leftTailNormal = xs
    .filter((x) => x <= -2.5)
    .map((x, i) => {
      const idx = xs.indexOf(x);
      const { sx, sy } = toSVG(x, normalY[idx]);
      return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");

  const baseY = pad.t + plotH;

  const xLabels = [-4, -2, 0, 2, 4];
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {/* Grid */}
      {yTicks.map((t) => {
        const y = pad.t + plotH - t * plotH;
        return <line key={t} x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#ffffff10" strokeWidth={1} />;
      })}
      {/* Tail area fill */}
      <path
        d={`M${pad.l},${baseY} ${leftTailNormal} L${pad.l},${baseY}Z`}
        fill="#3b82f620"
      />
      <path
        d={`M${pad.l},${baseY} ${xs
          .filter((x) => x <= -2.5)
          .map((x, i) => {
            const idx = xs.indexOf(x);
            const { sx, sy } = toSVG(x, fatY[idx]);
            return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
          })
          .join(" ")} L${pad.l},${baseY}Z`}
        fill="#ef444430"
      />
      {/* Normal curve */}
      <path d={normalPath} stroke="#3b82f6" strokeWidth={2} fill="none" />
      {/* Fat tail curve */}
      <path d={fatPath} stroke="#ef4444" strokeWidth={2} fill="none" strokeDasharray="4 2" />
      {/* Axes */}
      <line x1={pad.l} x2={W - pad.r} y1={pad.t + plotH} y2={pad.t + plotH} stroke="#ffffff40" strokeWidth={1} />
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + plotH} stroke="#ffffff40" strokeWidth={1} />
      {/* X labels */}
      {xLabels.map((v) => {
        const { sx } = toSVG(v, 0);
        return (
          <text key={v} x={sx} y={H - 8} textAnchor="middle" fill="#94a3b8" fontSize={10}>
            {v}σ
          </text>
        );
      })}
      {/* Legend */}
      <line x1={W - 160} x2={W - 140} y1={pad.t + 10} y2={pad.t + 10} stroke="#3b82f6" strokeWidth={2} />
      <text x={W - 135} y={pad.t + 14} fill="#94a3b8" fontSize={10}>Normal</text>
      <line x1={W - 160} x2={W - 140} y1={pad.t + 26} y2={pad.t + 26} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" />
      <text x={W - 135} y={pad.t + 30} fill="#94a3b8" fontSize={10}>Fat Tail</text>
      {/* Annotation */}
      <text x={pad.l + 8} y={pad.t + 55} fill="#ef4444" fontSize={9}>More extreme</text>
      <text x={pad.l + 8} y={pad.t + 65} fill="#ef4444" fontSize={9}>events here</text>
    </svg>
  );
}

function CorrelationMatrixSVG() {
  const assets = ["S&P 500", "Bonds", "Gold", "Commodities"];
  const normalCorr = [
    [1.0, -0.3, 0.1, 0.2],
    [-0.3, 1.0, 0.2, -0.1],
    [0.1, 0.2, 1.0, 0.1],
    [0.2, -0.1, 0.1, 1.0],
  ];
  const crisisCorr = [
    [1.0, 0.4, -0.1, 0.7],
    [0.4, 1.0, -0.3, 0.5],
    [-0.1, -0.3, 1.0, -0.2],
    [0.7, 0.5, -0.2, 1.0],
  ];

  const cell = 58;
  const labelW = 80;
  const pad = 8;
  const W = labelW + assets.length * cell + pad * 2;
  const H = 30 + assets.length * cell + pad;

  function corrColor(v: number, isCrisis: boolean) {
    if (v === 1.0) return "#1e293b";
    if (isCrisis) {
      if (v > 0.5) return "#ef4444";
      if (v > 0.2) return "#f97316";
      if (v < -0.2) return "#22c55e";
      return "#374151";
    } else {
      if (v > 0.5) return "#3b82f6";
      if (v > 0.1) return "#60a5fa";
      if (v < -0.2) return "#22c55e";
      return "#374151";
    }
  }

  function Matrix({ corr, isCrisis, xOffset }: { corr: number[][], isCrisis: boolean, xOffset: number }) {
    return (
      <g transform={`translate(${xOffset},0)`}>
        <text x={labelW + (assets.length * cell) / 2} y={16} textAnchor="middle" fill={isCrisis ? "#ef4444" : "#60a5fa"} fontSize={11} fontWeight="bold">
          {isCrisis ? "Crisis" : "Normal"}
        </text>
        {assets.map((a, i) => (
          <text key={a} x={labelW - 4} y={30 + i * cell + cell / 2 + 4} textAnchor="end" fill="#94a3b8" fontSize={9}>
            {a}
          </text>
        ))}
        {assets.map((_, ci) => (
          <text key={ci} x={labelW + ci * cell + cell / 2} y={28} textAnchor="middle" fill="#94a3b8" fontSize={9}>
            {assets[ci].slice(0, 5)}
          </text>
        ))}
        {corr.map((row, ri) =>
          row.map((v, ci) => {
            const x = labelW + ci * cell;
            const y = 30 + ri * cell;
            return (
              <g key={`${ri}-${ci}`}>
                <rect x={x + 2} y={y + 2} width={cell - 4} height={cell - 4} fill={corrColor(v, isCrisis)} rx={3} />
                <text x={x + cell / 2} y={y + cell / 2 + 4} textAnchor="middle" fill="white" fontSize={10}>
                  {v.toFixed(1)}
                </text>
              </g>
            );
          })
        )}
      </g>
    );
  }

  const totalW = (W * 2) + 20;
  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${H}`}>
      <Matrix corr={normalCorr} isCrisis={false} xOffset={0} />
      <Matrix corr={crisisCorr} isCrisis={true} xOffset={W + 20} />
    </svg>
  );
}

function BlackSwanTab() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Taleb Definition Card */}
      <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-300 mb-1">Nassim Taleb's Black Swan Theory</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              A Black Swan event has three attributes: it is an <span className="text-slate-200">outlier</span> beyond regular expectations, it carries an <span className="text-slate-200">extreme impact</span>, and — in retrospect — human nature makes us concoct explanations that make it appear predictable. Traditional financial models based on Gaussian distributions systematically <span className="text-red-300">underestimate tail risk</span> because real asset returns exhibit fat tails (excess kurtosis) and negative skew.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Events Table */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Historical Tail Events</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-3 py-2.5 text-left text-slate-500 font-medium">Year</th>
                <th className="px-3 py-2.5 text-left text-slate-500 font-medium">Event</th>
                <th className="px-3 py-2.5 text-left text-slate-500 font-medium">Category</th>
                <th className="px-3 py-2.5 text-right text-slate-500 font-medium">S&P Peak→Trough</th>
                <th className="px-3 py-2.5 text-right text-slate-500 font-medium">VIX Spike</th>
                <th className="px-3 py-2.5 text-right text-slate-500 font-medium">Recovery</th>
              </tr>
            </thead>
            <tbody>
              {TAIL_EVENTS.map((ev, i) => (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-slate-800/50 transition-colors cursor-default",
                    hoveredRow === i ? "bg-slate-800/50" : i % 2 === 0 ? "bg-slate-900/20" : ""
                  )}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-3 py-2 text-slate-400 font-mono">{ev.year}</td>
                  <td className="px-3 py-2 text-slate-200 font-medium">{ev.name}</td>
                  <td className="px-3 py-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: CATEGORY_COLORS[ev.category] + "30", color: CATEGORY_COLORS[ev.category] }}
                    >
                      {ev.category}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-red-400">{ev.peakToTrough.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right font-mono">
                    <span className={cn(ev.vixSpike >= 60 ? "text-red-400" : ev.vixSpike >= 40 ? "text-orange-400" : "text-yellow-400")}>
                      {ev.vixSpike}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-300">
                    {ev.recoveryMonths < 3 ? `${ev.recoveryMonths}mo` : ev.recoveryMonths >= 12 ? `${(ev.recoveryMonths / 12).toFixed(1)}yr` : `${ev.recoveryMonths}mo`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fat Tail Distribution */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Fat Tail vs Normal Distribution</h3>
        <p className="text-xs text-slate-500 mb-3">Real returns have heavier tails — extreme events occur far more often than a Gaussian model predicts.</p>
        <FatTailSVG />
        <div className="mt-2 flex gap-4 text-xs text-slate-500">
          <span><span className="text-blue-400 font-semibold">Blue:</span> Normal (Gaussian) — underestimates tail events</span>
          <span><span className="text-red-400 font-semibold">Red dashed:</span> Fat tail (Student-t df=3) — closer to reality</span>
        </div>
      </div>

      {/* Correlation Breakdown */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Correlation Breakdown in Crises</h3>
        <p className="text-xs text-slate-500 mb-3">In calm markets, assets appear diversified. During crises, correlations converge toward +1 — diversification fails precisely when you need it most.</p>
        <CorrelationMatrixSVG />
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-blue-950/30 border border-blue-900/30 p-2.5">
            <p className="text-blue-400 font-semibold mb-1">Normal Regime</p>
            <p className="text-slate-400">Bonds negatively correlated with equities (-0.3). Gold and commodities provide diversification. Classic 60/40 portfolio appears resilient.</p>
          </div>
          <div className="rounded-lg bg-red-950/30 border border-red-900/30 p-2.5">
            <p className="text-red-400 font-semibold mb-1">Crisis Regime</p>
            <p className="text-slate-400">Correlations spike as forced deleveraging hits all assets. Only gold and long-duration Treasuries reliably decouple. "Risk-on / risk-off" dominates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2: Hedging Instruments
// ─────────────────────────────────────────────────────────────────────────────

function OTMPutPayoffSVG() {
  const W = 520;
  const H = 200;
  const pad = { l: 50, r: 20, t: 20, b: 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const spot = 100;
  const strikes = [85, 90, 95];
  const premia = [1.2, 2.5, 5.0];
  const colors = ["#10b981", "#f59e0b", "#ef4444"];
  const labels = ["5% OTM put ($1.2)", "10% OTM put ($2.5)", "15% OTM put ($5.0)"];

  const xMin = 60;
  const xMax = 110;
  const yMin = -6;
  const yMax = 30;

  function toSVG(x: number, y: number) {
    const sx = pad.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const sy = pad.t + plotH - ((y - yMin) / (yMax - yMin)) * plotH;
    return { sx, sy };
  }

  const xTicks = [65, 75, 85, 95, 105];
  const yTicks = [-5, 0, 5, 10, 15, 20, 25];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {/* Grid */}
      {yTicks.map((t) => {
        const { sy } = toSVG(xMin, t);
        return <line key={t} x1={pad.l} x2={W - pad.r} y1={sy} y2={sy} stroke="#ffffff10" strokeWidth={1} />;
      })}
      {/* Zero line */}
      <line x1={pad.l} x2={W - pad.r} y1={toSVG(0, 0).sy} y2={toSVG(0, 0).sy} stroke="#ffffff30" strokeWidth={1} strokeDasharray="4 2" />
      {/* Payoff lines */}
      {strikes.map((K, idx) => {
        const premium = premia[idx];
        const pts = Array.from({ length: 100 }, (_, i) => {
          const x = lerp(xMin, xMax, i / 99);
          const payoff = Math.max(0, K - x) - premium;
          return toSVG(x, payoff);
        });
        const d = pts.map(({ sx, sy }, i) => `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`).join(" ");
        return <path key={idx} d={d} stroke={colors[idx]} strokeWidth={2} fill="none" />;
      })}
      {/* Axes */}
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#ffffff40" strokeWidth={1} />
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={H - pad.b} stroke="#ffffff40" strokeWidth={1} />
      {/* Spot marker */}
      <line x1={toSVG(spot, 0).sx} x2={toSVG(spot, 0).sx} y1={pad.t} y2={H - pad.b} stroke="#ffffff50" strokeWidth={1} strokeDasharray="3 3" />
      <text x={toSVG(spot, 0).sx} y={pad.t - 4} textAnchor="middle" fill="#94a3b8" fontSize={9}>Spot=100</text>
      {/* Labels */}
      {xTicks.map((v) => {
        const { sx } = toSVG(v, 0);
        return <text key={v} x={sx} y={H - pad.b + 14} textAnchor="middle" fill="#64748b" fontSize={9}>{v}</text>;
      })}
      {yTicks.map((v) => {
        const { sy } = toSVG(xMin, v);
        return <text key={v} x={pad.l - 6} y={sy + 3} textAnchor="end" fill="#64748b" fontSize={9}>{v}</text>;
      })}
      <text x={W / 2} y={H - 4} textAnchor="middle" fill="#64748b" fontSize={9}>Underlying Price at Expiry</text>
      <text transform={`translate(12,${H / 2}) rotate(-90)`} textAnchor="middle" fill="#64748b" fontSize={9}>P&L</text>
      {/* Legend */}
      {labels.map((lbl, i) => (
        <g key={i}>
          <line x1={pad.l + 8} x2={pad.l + 24} y1={pad.t + 8 + i * 16} y2={pad.t + 8 + i * 16} stroke={colors[i]} strokeWidth={2} />
          <text x={pad.l + 28} y={pad.t + 12 + i * 16} fill="#94a3b8" fontSize={9}>{lbl}</text>
        </g>
      ))}
    </svg>
  );
}

function CTACrisisAlphaSVG() {
  // Simplified bar chart: CTA returns in 2008, 2020 vs S&P
  const W = 400;
  const H = 180;
  const pad = { l: 50, r: 20, t: 30, b: 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const data = [
    { label: "2008", sp: -37, cta: 14 },
    { label: "2020\nQ1", sp: -34, cta: 8 },
    { label: "2022", sp: -19, cta: 22 },
  ];

  const yMin = -45;
  const yMax = 30;
  const barW = plotW / (data.length * 3);

  function toY(v: number) {
    return pad.t + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  }

  const zeroY = toY(0);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {/* Grid */}
      {[-40, -20, 0, 20].map((v) => (
        <line key={v} x1={pad.l} x2={W - pad.r} y1={toY(v)} y2={toY(v)} stroke="#ffffff10" strokeWidth={1} />
      ))}
      <line x1={pad.l} x2={W - pad.r} y1={zeroY} y2={zeroY} stroke="#ffffff30" strokeWidth={1} />
      {data.map((d, i) => {
        const groupX = pad.l + i * (plotW / data.length) + plotW / (data.length * 2) - barW;
        const spY = toY(d.sp);
        const ctaY = toY(d.cta);
        return (
          <g key={i}>
            {/* S&P bar */}
            <rect
              x={groupX}
              y={Math.min(spY, zeroY)}
              width={barW * 0.9}
              height={Math.abs(spY - zeroY)}
              fill="#ef444460"
              stroke="#ef4444"
              strokeWidth={1}
              rx={2}
            />
            {/* CTA bar */}
            <rect
              x={groupX + barW + 4}
              y={Math.min(ctaY, zeroY)}
              width={barW * 0.9}
              height={Math.abs(ctaY - zeroY)}
              fill="#10b98160"
              stroke="#10b981"
              strokeWidth={1}
              rx={2}
            />
            <text x={groupX + barW} y={zeroY + 14} textAnchor="middle" fill="#94a3b8" fontSize={10}>{d.label}</text>
            <text x={groupX + barW * 0.45} y={Math.min(spY, zeroY) - 3} textAnchor="middle" fill="#ef4444" fontSize={9}>{d.sp}%</text>
            <text x={groupX + barW + 4 + barW * 0.45} y={Math.min(ctaY, zeroY) - 3} textAnchor="middle" fill="#10b981" fontSize={9}>+{d.cta}%</text>
          </g>
        );
      })}
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={H - pad.b} stroke="#ffffff40" strokeWidth={1} />
      {[-40, -20, 0, 20].map((v) => (
        <text key={v} x={pad.l - 6} y={toY(v) + 3} textAnchor="end" fill="#64748b" fontSize={9}>{v}%</text>
      ))}
      {/* Legend */}
      <rect x={W - 110} y={pad.t} width={10} height={10} fill="#ef444460" stroke="#ef4444" strokeWidth={1} rx={2} />
      <text x={W - 97} y={pad.t + 9} fill="#94a3b8" fontSize={9}>S&P 500</text>
      <rect x={W - 110} y={pad.t + 16} width={10} height={10} fill="#10b98160" stroke="#10b981" strokeWidth={1} rx={2} />
      <text x={W - 97} y={pad.t + 25} fill="#94a3b8" fontSize={9}>CTA/Trend</text>
    </svg>
  );
}

interface HedgeInstrument {
  name: string;
  mechanism: string;
  annualCost: string;
  crisisPayoff: string;
  liquidity: number;
  complexity: number;
}

const HEDGE_INSTRUMENTS: HedgeInstrument[] = [
  { name: "OTM Put Options", mechanism: "Buy put 5–15% OTM; profit if market falls below strike", annualCost: "1–3%", crisisPayoff: "5–20×", liquidity: 5, complexity: 2 },
  { name: "VIX Call Spreads", mechanism: "Buy VIX calls; benefit from vol spike. Correlation to crashes ~0.85", annualCost: "0.5–1.5%", crisisPayoff: "3–10×", liquidity: 4, complexity: 3 },
  { name: "Put Spreads", mechanism: "Buy put + sell lower put; reduces cost by 40–60% at the cost of capped upside", annualCost: "0.5–1.5%", crisisPayoff: "2–8×", liquidity: 5, complexity: 3 },
  { name: "Variance Swaps", mechanism: "Pay fixed (implied vol), receive realized vol. Profits when realized > implied", annualCost: "Vol premium ~2pt", crisisPayoff: "Variable", liquidity: 2, complexity: 5 },
  { name: "Tail Risk Funds", mechanism: "Universa, 36 South, Capstone: dedicated long-vol managers; roll premium strategy", annualCost: "1–2% mgmt fee + drag", crisisPayoff: "Universa: 3,600%+ (2020)", liquidity: 3, complexity: 4 },
  { name: "CTA / Trend Following", mechanism: "Systematic trend signals; natural crisis alpha via short risk assets in downtrends", annualCost: "1% + 20% perf", crisisPayoff: "10–25% in major crises", liquidity: 4, complexity: 3 },
];

function RatingDots({ value, max = 5, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className="h-2 w-2 rounded-full" style={{ backgroundColor: i < value ? color : "#1e293b" }} />
      ))}
    </div>
  );
}

function HedgingInstrumentsTab() {
  const [selected, setSelected] = useState<number | null>(0);
  const sel = selected !== null ? HEDGE_INSTRUMENTS[selected] : null;

  return (
    <div className="space-y-6">
      {/* OTM Put Payoff */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">OTM Put Option Payoff Profiles</h3>
        <p className="text-xs text-slate-500 mb-3">Deeper OTM puts cost less but require a larger drawdown to become profitable. The breakeven = Strike − Premium.</p>
        <OTMPutPayoffSVG />
      </div>

      {/* Instruments table */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Hedging Instrument Comparison</h3>
        <div className="grid gap-2">
          {HEDGE_INSTRUMENTS.map((inst, i) => (
            <motion.div
              key={i}
              className={cn(
                "rounded-xl border p-3 cursor-pointer transition-colors",
                selected === i ? "border-blue-600 bg-blue-950/30" : "border-slate-800 bg-slate-900/30 hover:border-slate-700"
              )}
              onClick={() => setSelected(selected === i ? null : i)}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-200">{inst.name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{inst.annualCost}/yr</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-500">Liquidity</p>
                    <RatingDots value={inst.liquidity} color="#3b82f6" />
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-500">Complexity</p>
                    <RatingDots value={inst.complexity} color="#f59e0b" />
                  </div>
                  <span className="text-xs text-green-400 font-mono font-semibold">{inst.crisisPayoff}</span>
                </div>
              </div>
              <AnimatePresence>
                {selected === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 overflow-hidden"
                  >
                    <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">{inst.mechanism}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Crisis Alpha */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">CTA / Trend Following Crisis Alpha</h3>
        <p className="text-xs text-slate-500 mb-3">Systematic trend followers systematically go short risk assets during sustained downtrends, generating positive returns when markets crash.</p>
        <CTACrisisAlphaSVG />
      </div>

      {/* Variance Swap explainer */}
      <div className="rounded-xl border border-orange-900/30 bg-orange-950/10 p-4">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-orange-300 mb-1">Variance Swap Mechanics</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              P&L = Notional × (Realized Vol² − Strike Vol²). In 2008, S&P realized vol reached ~80 vs an implied strike of ~25 — a variance swap payer netted a <span className="text-orange-300">~10× return</span>. The convexity of vol squaring means payoff accelerates dramatically in tail events. However, counterparty risk and liquidity constraints make these instruments inaccessible to most retail investors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3: Cost-Benefit Analysis
// ─────────────────────────────────────────────────────────────────────────────

function DragCostSVG() {
  const W = 520;
  const H = 200;
  const pad = { l: 55, r: 20, t: 20, b: 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const years = 20;
  const dragRates = [0.01, 0.02, 0.03];
  const colors = ["#22c55e", "#f59e0b", "#ef4444"];
  const labels = ["1% drag", "2% drag", "3% drag"];
  const baseReturn = 0.08; // 8% annual

  function compoundValue(rate: number, y: number) {
    return Math.pow(1 + baseReturn - rate, y);
  }

  const xs = Array.from({ length: years + 1 }, (_, i) => i);
  const noHedge = xs.map((y) => Math.pow(1 + baseReturn, y));
  const maxY = noHedge[years];
  const minY = 0.8;

  function toSVG(x: number, y: number) {
    const sx = pad.l + (x / years) * plotW;
    const sy = pad.t + plotH - ((y - minY) / (maxY - minY)) * plotH;
    return { sx, sy };
  }

  const noHedgePath = xs
    .map((x, i) => {
      const { sx, sy } = toSVG(x, noHedge[i]);
      return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");

  const xTicks = [0, 5, 10, 15, 20];
  const yTicks = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {yTicks.map((t) => {
        const { sy } = toSVG(0, t);
        if (sy < pad.t || sy > pad.t + plotH) return null;
        return <line key={t} x1={pad.l} x2={W - pad.r} y1={sy} y2={sy} stroke="#ffffff10" strokeWidth={1} />;
      })}
      {/* No hedge baseline */}
      <path d={noHedgePath} stroke="#64748b" strokeWidth={1.5} fill="none" strokeDasharray="5 3" />
      {/* Dragged curves */}
      {dragRates.map((drag, idx) => {
        const path = xs
          .map((x, i) => {
            const { sx, sy } = toSVG(x, compoundValue(drag, i));
            return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
          })
          .join(" ");
        return <path key={idx} d={path} stroke={colors[idx]} strokeWidth={2} fill="none" />;
      })}
      {/* Axes */}
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#ffffff40" strokeWidth={1} />
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={H - pad.b} stroke="#ffffff40" strokeWidth={1} />
      {xTicks.map((v) => {
        const { sx } = toSVG(v, 0);
        return <text key={v} x={sx} y={H - pad.b + 14} textAnchor="middle" fill="#64748b" fontSize={9}>{v}yr</text>;
      })}
      {yTicks.map((v) => {
        const { sy } = toSVG(0, v);
        if (sy < pad.t || sy > pad.t + plotH) return null;
        return <text key={v} x={pad.l - 6} y={sy + 3} textAnchor="end" fill="#64748b" fontSize={9}>{v.toFixed(1)}×</text>;
      })}
      <text x={W / 2} y={H - 4} textAnchor="middle" fill="#64748b" fontSize={9}>Years</text>
      <text transform={`translate(12,${H / 2}) rotate(-90)`} textAnchor="middle" fill="#64748b" fontSize={9}>Portfolio Multiple</text>
      {/* Legend */}
      <line x1={W - 140} x2={W - 120} y1={pad.t + 8} y2={pad.t + 8} stroke="#64748b" strokeWidth={1.5} strokeDasharray="5 3" />
      <text x={W - 115} y={pad.t + 12} fill="#94a3b8" fontSize={9}>No hedge (8%/yr)</text>
      {labels.map((lbl, i) => (
        <g key={i}>
          <line x1={W - 140} x2={W - 120} y1={pad.t + 24 + i * 16} y2={pad.t + 24 + i * 16} stroke={colors[i]} strokeWidth={2} />
          <text x={W - 115} y={pad.t + 28 + i * 16} fill="#94a3b8" fontSize={9}>{lbl}</text>
        </g>
      ))}
    </svg>
  );
}

function HedgeRatioSVG() {
  const W = 440;
  const H = 180;
  const pad = { l: 50, r: 20, t: 20, b: 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  // Tradeoff: hedge ratio 0–100%, x=ratio, y=expected utility (higher = better)
  // Utility = crisis protection - drag cost
  const xs = Array.from({ length: 100 }, (_, i) => i / 99);

  // Simplified utility: protection value - cost
  // peak around 15–25% hedge ratio
  function utility(r: number) {
    const protection = 1 - Math.exp(-5 * r); // concave benefit
    const cost = 2.5 * r; // linear cost (drag)
    return protection - cost;
  }

  const ys = xs.map(utility);
  const maxU = Math.max(...ys);
  const minU = Math.min(...ys);

  const optX = xs[ys.indexOf(maxU)];

  function toSVG(x: number, y: number) {
    const sx = pad.l + x * plotW;
    const sy = pad.t + plotH - ((y - minU) / (maxU - minU)) * plotH;
    return { sx, sy };
  }

  const path = xs
    .map((x, i) => {
      const { sx, sy } = toSVG(x, ys[i]);
      return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");

  const optSVG = toSVG(optX, maxU);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const { sy } = toSVG(0, minU + t * (maxU - minU));
        return <line key={t} x1={pad.l} x2={W - pad.r} y1={sy} y2={sy} stroke="#ffffff10" strokeWidth={1} />;
      })}
      <path d={path} stroke="#8b5cf6" strokeWidth={2.5} fill="none" />
      {/* Fill under curve */}
      <path
        d={`M${pad.l},${toSVG(0, minU).sy} ${path.slice(1)} L${W - pad.r},${toSVG(0, minU).sy}Z`}
        fill="#8b5cf620"
      />
      {/* Optimal point */}
      <line x1={optSVG.sx} x2={optSVG.sx} y1={pad.t} y2={H - pad.b} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" />
      <circle cx={optSVG.sx} cy={optSVG.sy} r={5} fill="#f59e0b" />
      <text x={optSVG.sx + 6} y={optSVG.sy - 4} fill="#f59e0b" fontSize={9}>Optimal ~{(optX * 100).toFixed(0)}%</text>
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#ffffff40" strokeWidth={1} />
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={H - pad.b} stroke="#ffffff40" strokeWidth={1} />
      {[0, 25, 50, 75, 100].map((v) => {
        const { sx } = toSVG(v / 100, 0);
        return <text key={v} x={sx} y={H - pad.b + 14} textAnchor="middle" fill="#64748b" fontSize={9}>{v}%</text>;
      })}
      <text x={W / 2} y={H - 4} textAnchor="middle" fill="#64748b" fontSize={9}>Hedge Ratio (% of Portfolio)</text>
      <text transform={`translate(12,${H / 2}) rotate(-90)`} textAnchor="middle" fill="#64748b" fontSize={9}>Expected Utility</text>
    </svg>
  );
}

function CostBenefitTab() {
  // 2-year backtest simulation: 500 days, 3 crash scenarios
  const { days, unhedgedPath, hedgedPath, crashDays } = useMemo(() => {
    const r = makePrng(903);
    const n = 504; // ~2 trading years
    const unhedged: number[] = [100];
    const hedged: number[] = [100];
    const crashes: number[] = [];

    // Predefined crash scenarios at day ~80, ~250, ~420
    const crashScenarios = [80, 250, 420];
    const crashDepths = [-0.12, -0.18, -0.08];

    for (let i = 1; i < n; i++) {
      const drift = 0.0003;
      const vol = 0.012;
      const ret = drift + vol * (r() * 2 - 1) * 1.41421;

      let unhedgedRet = ret;
      let hedgedRet = ret - 0.00008; // 2% annual drag ≈ 0.008% daily

      const crashIdx = crashScenarios.indexOf(i);
      if (crashIdx >= 0) {
        unhedgedRet += crashDepths[crashIdx];
        hedgedRet += crashDepths[crashIdx] * 0.35; // hedge absorbs 65%
        crashes.push(i);
      }

      unhedged.push(unhedged[i - 1] * (1 + unhedgedRet));
      hedged.push(hedged[i - 1] * (1 + hedgedRet));
    }

    return { days: Array.from({ length: n }, (_, i) => i), unhedgedPath: unhedged, hedgedPath: hedged, crashDays: crashes };
  }, []);

  const W = 560;
  const H = 200;
  const pad = { l: 50, r: 20, t: 20, b: 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const allVals = [...unhedgedPath, ...hedgedPath];
  const yMin = Math.min(...allVals) * 0.98;
  const yMax = Math.max(...allVals) * 1.02;

  function toSVG(x: number, y: number) {
    const sx = pad.l + (x / (days.length - 1)) * plotW;
    const sy = pad.t + plotH - ((y - yMin) / (yMax - yMin)) * plotH;
    return { sx, sy };
  }

  const uPath = days
    .map((d, i) => {
      const { sx, sy } = toSVG(d, unhedgedPath[i]);
      return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");

  const hPath = days
    .map((d, i) => {
      const { sx, sy } = toSVG(d, hedgedPath[i]);
      return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");

  const finalUnhedged = unhedgedPath[unhedgedPath.length - 1].toFixed(1);
  const finalHedged = hedgedPath[hedgedPath.length - 1].toFixed(1);

  return (
    <div className="space-y-6">
      {/* Drag cost */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Compound Drag Cost of Continuous Hedging</h3>
        <p className="text-xs text-slate-500 mb-3">Paying 1–3%/year in option premium or fund fees creates a compounding drag. Over 20 years at 8% base return, a 3% hedge cost reduces final wealth by ~35%.</p>
        <DragCostSVG />
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { drag: "1%/yr", final20: (Math.pow(1.07, 20)).toFixed(2), color: "text-green-400" },
            { drag: "2%/yr", final20: (Math.pow(1.06, 20)).toFixed(2), color: "text-yellow-400" },
            { drag: "3%/yr", final20: (Math.pow(1.05, 20)).toFixed(2), color: "text-red-400" },
          ].map((d) => (
            <div key={d.drag} className="rounded-lg bg-slate-800/60 p-2">
              <p className="text-slate-500">{d.drag} drag</p>
              <p className={cn("font-semibold", d.color)}>{d.final20}×</p>
              <p className="text-slate-500">20yr multiple</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2-year backtest simulation */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Crisis Payoff Simulation (2-Year Backtest, 3 Crash Scenarios)</h3>
        <p className="text-xs text-slate-500 mb-3">Seed-903 PRNG backtest. Red markers = crash events. Hedged portfolio absorbs 65% of each crash at the cost of 2%/yr drag.</p>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
          {[yMin, yMin + (yMax - yMin) * 0.33, yMin + (yMax - yMin) * 0.67, yMax].map((v) => {
            const { sy } = toSVG(0, v);
            return <line key={v} x1={pad.l} x2={W - pad.r} y1={sy} y2={sy} stroke="#ffffff10" strokeWidth={1} />;
          })}
          {/* Crash markers */}
          {crashDays.map((d) => {
            const { sx } = toSVG(d, 0);
            return (
              <g key={d}>
                <line x1={sx} x2={sx} y1={pad.t} y2={H - pad.b} stroke="#ef444440" strokeWidth={1} strokeDasharray="2 2" />
                <text x={sx} y={pad.t - 4} textAnchor="middle" fill="#ef4444" fontSize={8}>▼</text>
              </g>
            );
          })}
          <path d={uPath} stroke="#ef4444" strokeWidth={1.5} fill="none" opacity={0.8} />
          <path d={hPath} stroke="#10b981" strokeWidth={2} fill="none" />
          <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#ffffff40" strokeWidth={1} />
          <line x1={pad.l} x2={pad.l} y1={pad.t} y2={H - pad.b} stroke="#ffffff40" strokeWidth={1} />
          {[0, 100, 200, 300, 400, 500].map((v) => {
            if (v >= days.length) return null;
            const { sx } = toSVG(v, 0);
            return <text key={v} x={sx} y={H - pad.b + 14} textAnchor="middle" fill="#64748b" fontSize={9}>d{v}</text>;
          })}
          {/* Y labels */}
          {[yMin, 100, yMax].map((v) => {
            const { sy } = toSVG(0, v);
            return <text key={v} x={pad.l - 6} y={sy + 3} textAnchor="end" fill="#64748b" fontSize={9}>{v.toFixed(0)}</text>;
          })}
          {/* Legend */}
          <line x1={W - 140} x2={W - 120} y1={pad.t + 8} y2={pad.t + 8} stroke="#ef4444" strokeWidth={1.5} />
          <text x={W - 115} y={pad.t + 12} fill="#94a3b8" fontSize={9}>Unhedged ({finalUnhedged})</text>
          <line x1={W - 140} x2={W - 120} y1={pad.t + 24} y2={pad.t + 24} stroke="#10b981" strokeWidth={2} />
          <text x={W - 115} y={pad.t + 28} fill="#94a3b8" fontSize={9}>Hedged ({finalHedged})</text>
        </svg>
      </div>

      {/* Optimal hedge ratio */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Optimal Hedge Ratio vs Cost Tradeoff</h3>
        <p className="text-xs text-slate-500 mb-3">Expected utility (protection benefit minus drag cost) peaks at roughly 15–20% hedge allocation. Beyond this, marginal cost exceeds marginal benefit.</p>
        <HedgeRatioSVG />
      </div>

      {/* Strategy explainers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          {
            title: "Barbell Strategy",
            color: "border-purple-900/40 bg-purple-950/20",
            titleColor: "text-purple-300",
            body: "Taleb's barbell: allocate 85–90% to ultra-safe assets (T-bills, cash) and 10–15% to highly convex speculative positions. Avoid the middle. This way, you can never lose more than ~15% while retaining unlimited upside.",
          },
          {
            title: "Dynamic Hedging (VIX-Timed)",
            color: "border-cyan-900/40 bg-cyan-950/20",
            titleColor: "text-cyan-300",
            body: "Buy protection when it is cheap (VIX < 15). Roll off expensive hedges when VIX spikes above 30 and fear is already priced in. This reduces annual drag by 30–50% versus static continuous hedging.",
          },
          {
            title: "Kelly Criterion for Fat Tails",
            color: "border-amber-900/40 bg-amber-950/20",
            titleColor: "text-amber-300",
            body: "Standard Kelly assumes log-normal returns. With fat tails, use fractional Kelly (25–50%) or incorporate higher moments. The formula: f* = (μ − r_f) / σ² must be adjusted downward for excess kurtosis.",
          },
          {
            title: "Put Spread vs Naked Put",
            color: "border-green-900/40 bg-green-950/20",
            titleColor: "text-green-300",
            body: "Selling a lower-strike put against your long put reduces premium cost by 40–60%, sacrificing protection below the short strike. Ideal when the portfolio manager expects a moderate correction, not a catastrophic tail event.",
          },
        ].map((card) => (
          <div key={card.title} className={cn("rounded-xl border p-3", card.color)}>
            <p className={cn("text-xs font-semibold mb-1", card.titleColor)}>{card.title}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 4: Portfolio Construction
// ─────────────────────────────────────────────────────────────────────────────

interface StressScenario {
  name: string;
  spReturn: number;
  goldReturn: number;
  bondsReturn: number;
  vixChange: number;
}

const STRESS_SCENARIOS: StressScenario[] = [
  { name: "2008 GFC", spReturn: -56.8, goldReturn: 5.2, bondsReturn: 25.9, vixChange: 480 },
  { name: "2020 COVID", spReturn: -33.9, goldReturn: 3.5, bondsReturn: 19.7, vixChange: 315 },
  { name: "2022 Rate Hike", spReturn: -25.4, goldReturn: -0.3, bondsReturn: -18.1, vixChange: 70 },
  { name: "Flash Crash", spReturn: -6.7, goldReturn: 1.1, bondsReturn: 2.4, vixChange: 90 },
  { name: "Dot-com Bust", spReturn: -49.1, goldReturn: 11.4, bondsReturn: 32.4, vixChange: 140 },
];

interface HedgeOverlay {
  name: string;
  color: string;
  allocation: number; // % of portfolio
  // Sensitivity to each input
  spBeta: number;
  goldBeta: number;
  bondsBeta: number;
  vixBeta: number; // gain per 10pt VIX move (as fraction of portfolio)
}

const HEDGE_OVERLAYS: HedgeOverlay[] = [
  { name: "No Hedge", color: "#ef4444", allocation: 0, spBeta: 1, goldBeta: 0, bondsBeta: 0, vixBeta: 0 },
  { name: "+5% OTM Puts (2%)", color: "#f97316", allocation: 2, spBeta: 0.85, goldBeta: 0, bondsBeta: 0, vixBeta: 0.04 },
  { name: "Gold (10%) + VIX (1%)", color: "#eab308", allocation: 11, spBeta: 0.89, goldBeta: 0.1, bondsBeta: 0, vixBeta: 0.02 },
  { name: "Full Tail Hedge (3%)", color: "#10b981", allocation: 3, spBeta: 0.8, goldBeta: 0, bondsBeta: 0, vixBeta: 0.08 },
];

function overlayPortfolioReturn(overlay: HedgeOverlay, scenario: StressScenario): number {
  // Simplified: equity portion * sp sensitivity + asset contributions
  const equityWeight = (100 - overlay.allocation) / 100;
  const spContrib = equityWeight * overlay.spBeta * (scenario.spReturn / 100);
  const goldContrib = overlay.goldBeta * (scenario.goldReturn / 100);
  const vixContrib = overlay.vixBeta * (scenario.vixChange / 10); // per 10pt VIX move
  return (spContrib + goldContrib + vixContrib) * 100;
}

function TailScenarioHeatmapSVG() {
  const cellW = 100;
  const cellH = 36;
  const labelW = 130;
  const headerH = 50;
  const W = labelW + STRESS_SCENARIOS.length * cellW + 16;
  const H = headerH + HEDGE_OVERLAYS.length * cellH + 8;

  function retColor(v: number) {
    if (v > 5) return "#166534";
    if (v > 0) return "#14532d";
    if (v > -10) return "#7c2d12";
    if (v > -20) return "#991b1b";
    return "#7f1d1d";
  }
  function retTextColor(v: number) {
    if (v > 5) return "#4ade80";
    if (v > 0) return "#86efac";
    if (v > -10) return "#fca5a5";
    if (v > -20) return "#f87171";
    return "#ef4444";
  }

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {/* Column headers */}
      {STRESS_SCENARIOS.map((sc, ci) => {
        const x = labelW + ci * cellW + cellW / 2;
        return (
          <g key={ci}>
            <text x={x} y={14} textAnchor="middle" fill="#94a3b8" fontSize={9} fontWeight="bold">{sc.name}</text>
            <text x={x} y={26} textAnchor="middle" fill="#ef4444" fontSize={8}>S&P {sc.spReturn}%</text>
            <text x={x} y={38} textAnchor="middle" fill="#64748b" fontSize={7}>VIX +{sc.vixChange}%</text>
          </g>
        );
      })}
      {/* Rows */}
      {HEDGE_OVERLAYS.map((ov, ri) => {
        const y = headerH + ri * cellH;
        return (
          <g key={ri}>
            <text x={4} y={y + cellH / 2 + 4} fill={ov.color} fontSize={9} fontWeight="bold">{ov.name}</text>
            {STRESS_SCENARIOS.map((sc, ci) => {
              const ret = overlayPortfolioReturn(ov, sc);
              const x = labelW + ci * cellW;
              return (
                <g key={ci}>
                  <rect x={x + 2} y={y + 2} width={cellW - 4} height={cellH - 4} fill={retColor(ret)} rx={3} />
                  <text x={x + cellW / 2} y={y + cellH / 2 + 4} textAnchor="middle" fill={retTextColor(ret)} fontSize={10} fontWeight="bold">
                    {ret.toFixed(1)}%
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function TailAssetPerformanceSVG() {
  // Bar chart: Gold, Long Bonds, Vol Overlay performance in tail scenarios
  const W = 480;
  const H = 200;
  const pad = { l: 60, r: 20, t: 30, b: 50 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const assets = [
    { label: "Gold", values: [5.2, 3.5, -0.3, 1.1, 11.4], color: "#f59e0b" },
    { label: "LT Bonds", values: [25.9, 19.7, -18.1, 2.4, 32.4], color: "#3b82f6" },
    { label: "Vol Overlay", values: [38, 28, 12, 15, 22], color: "#8b5cf6" },
  ];

  const scenarios = STRESS_SCENARIOS.map((s) => s.name);
  const allVals = assets.flatMap((a) => a.values);
  const yMin = Math.min(...allVals) - 5;
  const yMax = Math.max(...allVals) + 5;

  const groupW = plotW / scenarios.length;
  const barW = groupW / (assets.length + 1);
  const zeroY = pad.t + plotH - ((0 - yMin) / (yMax - yMin)) * plotH;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {[-20, 0, 20, 40].map((v) => {
        const y = pad.t + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
        if (y < pad.t || y > pad.t + plotH) return null;
        return <line key={v} x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#ffffff10" strokeWidth={1} />;
      })}
      <line x1={pad.l} x2={W - pad.r} y1={zeroY} y2={zeroY} stroke="#ffffff30" strokeWidth={1} />
      {scenarios.map((sc, si) => {
        const groupX = pad.l + si * groupW;
        return (
          <g key={si}>
            <text x={groupX + groupW / 2} y={H - pad.b + 14} textAnchor="middle" fill="#64748b" fontSize={8}>{sc.replace(" ", "\n")}</text>
            {assets.map((asset, ai) => {
              const v = asset.values[si];
              const bx = groupX + (ai + 0.5) * barW;
              const by = pad.t + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
              return (
                <rect
                  key={ai}
                  x={bx}
                  y={Math.min(by, zeroY)}
                  width={barW * 0.8}
                  height={Math.abs(by - zeroY)}
                  fill={asset.color + "80"}
                  stroke={asset.color}
                  strokeWidth={1}
                  rx={2}
                />
              );
            })}
          </g>
        );
      })}
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={H - pad.b} stroke="#ffffff40" strokeWidth={1} />
      {[-20, 0, 20, 40].map((v) => {
        const y = pad.t + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
        if (y < pad.t || y > pad.t + plotH) return null;
        return <text key={v} x={pad.l - 6} y={y + 3} textAnchor="end" fill="#64748b" fontSize={9}>{v}%</text>;
      })}
      {assets.map((a, i) => (
        <g key={i}>
          <rect x={pad.l + 8 + i * 80} y={pad.t} width={10} height={10} fill={a.color + "80"} stroke={a.color} strokeWidth={1} rx={2} />
          <text x={pad.l + 22 + i * 80} y={pad.t + 9} fill="#94a3b8" fontSize={9}>{a.label}</text>
        </g>
      ))}
    </svg>
  );
}

function PortfolioConstructionTab() {
  return (
    <div className="space-y-6">
      {/* Convexity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-slate-300">Convexity as a Feature</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Long options add positive convexity: the P&L profile curves upward, so large moves generate disproportionate gains. A portfolio with embedded convexity can lose less in small moves while gaining far more in large ones. This is the core of tail risk fund designs like Universa's Black Swan Protection Protocol.
          </p>
          <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-yellow-950/30 border border-yellow-900/30">
            <span className="text-yellow-400 text-xs font-mono">Convexity = dΔ/dS = Gamma × S</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-300">Tail-Risk Parity</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Traditional risk parity equalizes volatility contributions. Tail-risk parity equalizes the <span className="text-purple-300">Expected Tail Loss (CVaR)</span> contribution of each asset. This results in larger allocations to crisis-resilient assets (Treasuries, gold) and smaller equity exposure than standard risk parity.
          </p>
          <div className="mt-3 flex gap-2 text-xs">
            <div className="px-2 py-1 rounded bg-purple-950/40 border border-purple-900/30 text-purple-300">Equities: 25%</div>
            <div className="px-2 py-1 rounded bg-blue-950/40 border border-blue-900/30 text-blue-300">Bonds: 45%</div>
            <div className="px-2 py-1 rounded bg-yellow-950/40 border border-yellow-900/30 text-yellow-300">Gold: 20%</div>
            <div className="px-2 py-1 rounded bg-green-950/40 border border-green-900/30 text-green-300">Vol: 10%</div>
          </div>
        </div>
      </div>

      {/* Asset performance in tail scenarios */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Tail Hedge Asset Performance by Crisis</h3>
        <p className="text-xs text-slate-500 mb-3">Long-duration bonds and vol overlays have been the most reliable tail hedges historically. Note: bonds failed in 2022 (rate-driven crash).</p>
        <TailAssetPerformanceSVG />
      </div>

      {/* Regime-based hedging */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Regime-Based Hedging Rules</h3>
        <div className="space-y-2">
          {[
            { regime: "Calm (VIX < 15)", action: "Accumulate cheap OTM puts. Add VIX calls. Build convexity at low cost.", status: "Accumulate", color: "green" },
            { regime: "Normal (VIX 15–25)", action: "Maintain core hedge (1–1.5% drag). Avoid over-hedging. Rebalance quarterly.", status: "Maintain", color: "blue" },
            { regime: "Elevated (VIX 25–35)", action: "Partially roll down hedge; some protection already triggered. Reduce drag.", status: "Reduce", color: "yellow" },
            { regime: "Stress (VIX 35–50)", action: "Close profitable hedges, lock in gains. Market is already pricing fear.", status: "Close/Harvest", color: "orange" },
            { regime: "Crisis (VIX > 50)", action: "Hedges are maximally valuable. Consider rebalancing back into equities.", status: "Redeploy", color: "red" },
          ].map((r) => (
            <div key={r.regime} className={cn("flex items-start gap-3 p-2.5 rounded-lg border", {
              "border-green-900/40 bg-green-950/10": r.color === "green",
              "border-blue-900/40 bg-blue-950/10": r.color === "blue",
              "border-yellow-900/40 bg-yellow-950/10": r.color === "yellow",
              "border-orange-900/40 bg-orange-950/10": r.color === "orange",
              "border-red-900/40 bg-red-950/10": r.color === "red",
            })}>
              <div className="min-w-[120px]">
                <p className={cn("text-xs font-semibold", {
                  "text-green-400": r.color === "green",
                  "text-blue-400": r.color === "blue",
                  "text-yellow-400": r.color === "yellow",
                  "text-orange-400": r.color === "orange",
                  "text-red-400": r.color === "red",
                })}>{r.regime}</p>
                <span className={cn("text-[11px] px-1 py-0.5 rounded mt-0.5 inline-block font-medium", {
                  "bg-green-900/40 text-green-300": r.color === "green",
                  "bg-blue-900/40 text-blue-300": r.color === "blue",
                  "bg-yellow-900/40 text-yellow-300": r.color === "yellow",
                  "bg-orange-900/40 text-orange-300": r.color === "orange",
                  "bg-red-900/40 text-red-300": r.color === "red",
                })}>{r.status}</span>
              </div>
              <p className="text-xs text-slate-400">{r.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stress Test Heatmap */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Stress Test Dashboard</h3>
        <p className="text-xs text-slate-500 mb-3">Portfolio P&L (%) across 5 crisis scenarios for 4 hedge overlays. Green = less negative / positive; Red = larger loss.</p>
        <div className="overflow-x-auto">
          <TailScenarioHeatmapSVG />
        </div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
          {HEDGE_OVERLAYS.map((ov) => (
            <div key={ov.name} className="rounded-lg bg-slate-800/60 p-1.5">
              <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: ov.color }} />
              <p className="text-slate-300 font-medium">{ov.name}</p>
              {ov.allocation > 0 && <p className="text-slate-500">{ov.allocation}% allocated</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Liquidity Premium */}
      <div className="rounded-xl border border-amber-900/30 bg-amber-950/10 p-4">
        <div className="flex items-start gap-2">
          <DollarSign className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-300 mb-1">Liquidity Premium vs Tail Risk Tradeoff</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Illiquid assets (private equity, real estate, infrastructure) typically offer a <span className="text-amber-300">3–5% liquidity premium</span> but cannot be hedged or liquidated in a crisis. When correlations spike and margin calls arrive, illiquid holdings become forced-sale candidates. Tail-risk aware portfolios must maintain a <span className="text-amber-300">liquid buffer (20–30%)</span> to survive crisis periods without crystallizing losses at the worst time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function TailRiskPage() {
  const [activeTab, setActiveTab] = useState("blackswan");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-red-950/40 border border-red-900/40 p-3">
            <Shield className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Tail Risk Hedging</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Protecting portfolios against black swans, volatility spikes, and the cost-benefit of tail protection strategies.
            </p>
          </div>
        </div>

        {/* Key metrics strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "2008 GFC Drawdown", value: "-56.8%", sub: "S&P peak → trough", color: "text-red-400", icon: TrendingDown },
            { label: "Max VIX Spike", value: "82", sub: "COVID crash (Mar 2020)", color: "text-orange-400", icon: BarChart2 },
            { label: "Optimal Hedge Cost", value: "1–2%/yr", sub: "Annual drag budget", color: "text-yellow-400", icon: DollarSign },
            { label: "Universa 2020 Return", value: "+3,600%", sub: "Tail fund payoff", color: "text-green-400", icon: Zap },
          ].map(({ label, value, sub, color, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn("h-3.5 w-3.5", color)} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
              <p className={cn("text-lg font-bold font-mono", color)}>{value}</p>
              <p className="text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 bg-slate-900 border border-slate-800 h-auto p-1">
            {[
              { value: "blackswan", label: "Black Swan Events" },
              { value: "instruments", label: "Hedging Instruments" },
              { value: "costbenefit", label: "Cost-Benefit" },
              { value: "portfolio", label: "Portfolio Construction" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs py-2 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <TabsContent value="blackswan" forceMount className={activeTab !== "blackswan" ? "hidden" : ""}>
                <BlackSwanTab />
              </TabsContent>
              <TabsContent value="instruments" forceMount className={activeTab !== "instruments" ? "hidden" : ""}>
                <HedgingInstrumentsTab />
              </TabsContent>
              <TabsContent value="costbenefit" forceMount className={activeTab !== "costbenefit" ? "hidden" : ""}>
                <CostBenefitTab />
              </TabsContent>
              <TabsContent value="portfolio" forceMount className={activeTab !== "portfolio" ? "hidden" : ""}>
                <PortfolioConstructionTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
