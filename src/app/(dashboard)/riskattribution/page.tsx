"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  TrendingUp,
  BarChart3,
  Activity,
  AlertTriangle,
  Layers,
  Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 994;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const RAND_POOL: number[] = [];
for (let i = 0; i < 400; i++) RAND_POOL.push(rand());
let ri = 0;
const r = () => RAND_POOL[ri++ % RAND_POOL.length];

// ── Static data generation ─────────────────────────────────────────────────────

const SECTORS = [
  "Technology",
  "Health Care",
  "Financials",
  "Industrials",
  "Cons. Disc.",
  "Comm. Svcs",
  "Cons. Stpl.",
  "Energy",
  "Materials",
  "Utilities",
];

interface SectorRow {
  sector: string;
  pw: number; // portfolio weight
  bw: number; // benchmark weight
  pr: number; // portfolio return
  br: number; // benchmark return
  alloc: number;
  sel: number;
  inter: number;
  total: number;
}

function buildBHBData(): SectorRow[] {
  // raw weights — make sure they sum to 1
  const rawPW = SECTORS.map(() => 0.05 + r() * 0.15);
  const rawBW = SECTORS.map(() => 0.05 + r() * 0.15);
  const sumPW = rawPW.reduce((a, b) => a + b, 0);
  const sumBW = rawBW.reduce((a, b) => a + b, 0);
  const pw = rawPW.map((v) => v / sumPW);
  const bw = rawBW.map((v) => v / sumBW);

  const overallBR = bw.reduce((acc, w, i) => acc + w * (0.02 + r() * 0.18 - 0.05), 0);

  return SECTORS.map((sector, i) => {
    const pRet = 0.02 + r() * 0.2 - 0.04;
    const bRet = 0.02 + r() * 0.18 - 0.03;
    // BHB: alloc = (pw - bw) * (bRet - overallBR)
    const alloc = (pw[i] - bw[i]) * (bRet - overallBR);
    // sel = bw * (pRet - bRet)
    const sel = bw[i] * (pRet - bRet);
    // inter = (pw - bw) * (pRet - bRet)
    const inter = (pw[i] - bw[i]) * (pRet - bRet);
    const total = alloc + sel + inter;
    return { sector, pw: pw[i], bw: bw[i], pr: pRet, br: bRet, alloc, sel, inter, total };
  });
}

const BHB_DATA = buildBHBData();

// Factor decomposition data
interface FactorRow {
  name: string;
  beta: number;
  contribution: number;
  color: string;
}

const FACTOR_COLORS: Record<string, string> = {
  Market: "#6366f1",
  Size: "#22d3ee",
  Value: "#f59e0b",
  Momentum: "#10b981",
  Quality: "#a78bfa",
  Residual: "#f87171",
};

function buildFactorData(): FactorRow[] {
  const names = ["Market", "Size", "Value", "Momentum", "Quality", "Residual"];
  const raw = names.map((name) => ({
    name,
    beta: name === "Market" ? 0.9 + r() * 0.2 : -0.5 + r() * 1.0,
    contribution: name === "Market" ? 0.06 + r() * 0.04 : -0.03 + r() * 0.06,
    color: FACTOR_COLORS[name],
  }));
  return raw;
}

const FACTOR_DATA = buildFactorData();

// Risk contribution positions
interface Position {
  ticker: string;
  weight: number;
  vol: number;
  mctr: number;
  pctContrib: number;
}

function buildPositions(): Position[] {
  const tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "JNJ", "XOM"];
  const rawW = tickers.map(() => 0.05 + r() * 0.2);
  const sumW = rawW.reduce((a, b) => a + b, 0);
  const weights = rawW.map((v) => v / sumW);
  const vols = tickers.map(() => 0.15 + r() * 0.35);
  const rawMCTR = tickers.map((_, i) => weights[i] * vols[i] * (0.3 + r() * 0.7));
  const totalRisk = rawMCTR.reduce((a, b) => a + b, 0);
  return tickers.map((ticker, i) => ({
    ticker,
    weight: weights[i],
    vol: vols[i],
    mctr: rawMCTR[i],
    pctContrib: rawMCTR[i] / totalRisk,
  }));
}

const POSITIONS = buildPositions().sort((a, b) => b.pctContrib - a.pctContrib);

// Scenario analysis
interface Scenario {
  name: string;
  description: string;
  portfolioImpact: number;
  benchmarkImpact: number;
  color: string;
}

const SCENARIOS: Scenario[] = [
  {
    name: "Rate Shock +200bps",
    description: "Fed raises rates sharply; duration risk hits bonds & growth",
    portfolioImpact: -(0.06 + r() * 0.04),
    benchmarkImpact: -(0.05 + r() * 0.03),
    color: "#f87171",
  },
  {
    name: "Equity Crash -30%",
    description: "Global equity selloff; beta determines drawdown",
    portfolioImpact: -(0.22 + r() * 0.08),
    benchmarkImpact: -0.3,
    color: "#ef4444",
  },
  {
    name: "USD Strength +15%",
    description: "Dollar rally hurts international exposure and commodities",
    portfolioImpact: -(0.03 + r() * 0.04),
    benchmarkImpact: -(0.04 + r() * 0.03),
    color: "#f59e0b",
  },
  {
    name: "Recession",
    description: "Earnings compression across cyclicals; defensives outperform",
    portfolioImpact: -(0.08 + r() * 0.06),
    benchmarkImpact: -(0.1 + r() * 0.05),
    color: "#fb923c",
  },
  {
    name: "Inflation Spike",
    description: "Persistent inflation erodes real returns; energy/materials benefit",
    portfolioImpact: -(0.02 + r() * 0.03),
    benchmarkImpact: -(0.03 + r() * 0.03),
    color: "#facc15",
  },
];

// 12-month attribution history
interface MonthPoint {
  month: string;
  cumAlpha: number;
  allocEffect: number;
  selEffect: number;
}

function buildHistory(): MonthPoint[] {
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  let cumAlpha = 0;
  let cumAlloc = 0;
  let cumSel = 0;
  return months.map((month) => {
    const alpha = -0.005 + r() * 0.015;
    const alloc = -0.003 + r() * 0.008;
    const sel = alpha - alloc;
    cumAlpha += alpha;
    cumAlloc += alloc;
    cumSel += sel;
    return { month, cumAlpha, allocEffect: cumAlloc, selEffect: cumSel };
  });
}

const HISTORY = buildHistory();

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(n: number, digits = 2) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${(n * 100).toFixed(digits)}%`;
}

function pctColor(n: number) {
  return n >= 0 ? "text-emerald-400" : "text-rose-400";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral";
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className={cn("text-xl font-bold", valClass)}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Tab 1: Brinson-Hood-Beebower ──────────────────────────────────────────────

function BHBTab() {
  const totalAlloc = BHB_DATA.reduce((a, r) => a + r.alloc, 0);
  const totalSel = BHB_DATA.reduce((a, r) => a + r.sel, 0);
  const totalInter = BHB_DATA.reduce((a, r) => a + r.inter, 0);
  const totalActive = totalAlloc + totalSel + totalInter;

  // SVG stacked bar chart
  const chartW = 560;
  const chartH = 200;
  const padL = 110;
  const padR = 20;
  const padT = 16;
  const padB = 20;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const barH = Math.floor(innerH / BHB_DATA.length) - 3;

  const maxAbs = Math.max(...BHB_DATA.map((d) => Math.abs(d.total) * 100)) + 1;
  const xScale = (v: number) => ((v * 100 + maxAbs) / (maxAbs * 2)) * innerW;
  const zero = xScale(0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Allocation Effect" value={pct(totalAlloc)} highlight={totalAlloc >= 0 ? "pos" : "neg"} sub="Sector weight decisions" />
        <StatCard label="Selection Effect" value={pct(totalSel)} highlight={totalSel >= 0 ? "pos" : "neg"} sub="Stock picking within sector" />
        <StatCard label="Interaction Effect" value={pct(totalInter)} highlight={totalInter >= 0 ? "pos" : "neg"} sub="Weight × return interaction" />
        <StatCard label="Total Active Return" value={pct(totalActive)} highlight={totalActive >= 0 ? "pos" : "neg"} sub="Portfolio vs benchmark" />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeading title="Active Return by Sector" sub="Stacked bars: allocation (indigo) + selection (cyan) + interaction (amber)" />
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
          {/* grid */}
          {[-2, -1, 0, 1, 2].map((tick) => {
            const x = padL + xScale(tick / 100);
            return (
              <g key={tick}>
                <line x1={x} y1={padT} x2={x} y2={chartH - padB} stroke="#ffffff18" strokeDasharray="3 3" />
                <text x={x} y={chartH - 4} textAnchor="middle" fontSize={8} fill="#71717a">
                  {tick > 0 ? `+${tick}` : tick}%
                </text>
              </g>
            );
          })}
          {/* zero line */}
          <line x1={padL + zero} y1={padT} x2={padL + zero} y2={chartH - padB} stroke="#ffffff40" strokeWidth={1} />

          {BHB_DATA.map((row, i) => {
            const y = padT + i * (innerH / BHB_DATA.length);
            let cursor = zero;
            const bars: Array<{ x: number; w: number; fill: string }> = [];
            for (const [val, fill] of [
              [row.alloc, "#6366f1"],
              [row.sel, "#22d3ee"],
              [row.inter, "#f59e0b"],
            ] as [number, string][]) {
              const w = (val * 100 / (maxAbs * 2)) * innerW;
              bars.push({ x: val >= 0 ? cursor : cursor + w, w: Math.abs(w), fill });
              cursor += w;
            }
            return (
              <g key={row.sector}>
                <text x={padL - 6} y={y + barH / 2 + 1} textAnchor="end" fontSize={9} fill="#a1a1aa" dominantBaseline="middle">
                  {row.sector}
                </text>
                {bars.map((b, j) => (
                  <rect key={j} x={padL + b.x} y={y + 1} width={b.w} height={barH} fill={b.fill} opacity={0.85} rx={1} />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              {["Sector", "Port Wt", "Bmk Wt", "Port Ret", "Bmk Ret", "Alloc", "Sel", "Inter", "Total"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-zinc-400 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BHB_DATA.map((row) => (
              <tr key={row.sector} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-3 py-2 text-zinc-200 font-medium">{row.sector}</td>
                <td className="px-3 py-2 text-zinc-300">{(row.pw * 100).toFixed(1)}%</td>
                <td className="px-3 py-2 text-zinc-300">{(row.bw * 100).toFixed(1)}%</td>
                <td className={cn("px-3 py-2 font-mono", pctColor(row.pr))}>{pct(row.pr, 1)}</td>
                <td className={cn("px-3 py-2 font-mono", pctColor(row.br))}>{pct(row.br, 1)}</td>
                <td className={cn("px-3 py-2 font-mono", pctColor(row.alloc))}>{pct(row.alloc, 2)}</td>
                <td className={cn("px-3 py-2 font-mono", pctColor(row.sel))}>{pct(row.sel, 2)}</td>
                <td className={cn("px-3 py-2 font-mono", pctColor(row.inter))}>{pct(row.inter, 2)}</td>
                <td className={cn("px-3 py-2 font-mono font-bold", pctColor(row.total))}>{pct(row.total, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-3">
        <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-xs text-zinc-400">
          <span className="text-indigo-300 font-semibold">Brinson-Hood-Beebower</span> (1986) decomposes active return into three sources.
          <strong className="text-white"> Allocation effect</strong> rewards over/underweighting sectors with above/below benchmark returns.
          <strong className="text-white"> Selection effect</strong> rewards picking stocks that beat the sector benchmark.
          <strong className="text-white"> Interaction effect</strong> captures the combined weight-and-selection decision.
        </p>
      </div>
    </div>
  );
}

// ── Tab 2: Factor Risk Decomposition ─────────────────────────────────────────

function FactorTab() {
  const totalReturn = FACTOR_DATA.reduce((a, f) => a + f.contribution, 0);

  // Waterfall SVG
  const chartW = 560;
  const chartH = 220;
  const padL = 80;
  const padR = 24;
  const padT = 20;
  const padB = 28;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const n = FACTOR_DATA.length;
  const barW = Math.floor(innerW / (n + 1)) - 6;

  const maxVal = Math.max(...FACTOR_DATA.map((f) => Math.abs(f.contribution))) * 1.3;
  const yScale = (v: number) => innerH / 2 - (v / maxVal) * (innerH / 2);

  let running = 0;
  const bars = FACTOR_DATA.map((f) => {
    const base = running;
    running += f.contribution;
    return { ...f, base, top: running };
  });

  const yticks = [-0.04, -0.02, 0, 0.02, 0.04, 0.06];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {FACTOR_DATA.map((f) => (
          <StatCard
            key={f.name}
            label={f.name}
            value={pct(f.contribution)}
            highlight={f.contribution >= 0 ? "pos" : "neg"}
            sub={`β: ${f.beta.toFixed(2)}`}
          />
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeading title="Factor Contribution Waterfall" sub="Cumulative return decomposition by risk factor" />
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
          {yticks.map((tick) => {
            const y = padT + yScale(tick);
            if (y < padT || y > chartH - padB) return null;
            return (
              <g key={tick}>
                <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#ffffff18" strokeDasharray="3 3" />
                <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#71717a">
                  {tick > 0 ? `+${(tick * 100).toFixed(0)}` : (tick * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
          {/* zero line */}
          <line x1={padL} y1={padT + yScale(0)} x2={chartW - padR} y2={padT + yScale(0)} stroke="#ffffff40" strokeWidth={1} />

          {bars.map((bar, i) => {
            const x = padL + i * (innerW / n) + 8;
            const y1 = padT + yScale(Math.max(bar.base, bar.top));
            const y2 = padT + yScale(Math.min(bar.base, bar.top));
            const h = Math.max(2, y2 - y1);
            return (
              <g key={bar.name}>
                <rect x={x} y={y1} width={barW} height={h} fill={bar.color} opacity={0.85} rx={2} />
                {/* connector line */}
                {i < bars.length - 1 && (
                  <line
                    x1={x + barW}
                    y1={padT + yScale(bar.top)}
                    x2={x + barW + (innerW / n) - barW + 2}
                    y2={padT + yScale(bar.top)}
                    stroke="#ffffff30"
                    strokeDasharray="2 2"
                    strokeWidth={1}
                  />
                )}
                <text x={x + barW / 2} y={chartH - padB + 12} textAnchor="middle" fontSize={9} fill="#a1a1aa">
                  {bar.name}
                </text>
              </g>
            );
          })}

          {/* total bar */}
          <g>
            <rect
              x={padL + n * (innerW / n) + 8}
              y={padT + yScale(Math.max(0, totalReturn))}
              width={barW}
              height={Math.max(2, Math.abs(yScale(0) - yScale(totalReturn)))}
              fill={totalReturn >= 0 ? "#10b981" : "#f87171"}
              opacity={0.9}
              rx={2}
            />
            <text
              x={padL + n * (innerW / n) + 8 + barW / 2}
              y={chartH - padB + 12}
              textAnchor="middle"
              fontSize={9}
              fill="#a1a1aa"
            >
              Total
            </text>
          </g>
        </svg>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              {["Factor", "Beta Exposure", "Factor Return", "Contribution", "% of Total"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-zinc-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FACTOR_DATA.map((f) => (
              <tr key={f.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: f.color }} />
                    <span className="text-zinc-200 font-medium">{f.name}</span>
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-zinc-300">{f.beta.toFixed(3)}</td>
                <td className="px-3 py-2 font-mono text-zinc-300">{pct(f.contribution / Math.abs(f.beta), 2)}</td>
                <td className={cn("px-3 py-2 font-mono font-semibold", pctColor(f.contribution))}>{pct(f.contribution)}</td>
                <td className="px-3 py-2 font-mono text-zinc-400">
                  {Math.abs(totalReturn) > 0 ? ((f.contribution / totalReturn) * 100).toFixed(1) : "—"}%
                </td>
              </tr>
            ))}
            <tr className="border-t border-white/20">
              <td className="px-3 py-2 text-white font-bold" colSpan={3}>Total Portfolio Return</td>
              <td className={cn("px-3 py-2 font-mono font-bold", pctColor(totalReturn))}>{pct(totalReturn)}</td>
              <td className="px-3 py-2 font-mono text-zinc-400">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Active Share & Tracking Error ─────────────────────────────────────

function ActiveShareTab() {
  const [conviction, setConviction] = useState(50);

  const { activeShare, trackingError, ir, zone } = useMemo(() => {
    const as = 20 + conviction * 0.7;
    const te = 1.5 + conviction * 0.085;
    const irVal = (conviction < 30 ? 0.1 + conviction * 0.01 : 0.4 + (conviction - 30) * 0.008).toFixed(2);
    let z = "Active Manager";
    if (as < 60) z = "Closet Indexer";
    else if (as < 75) z = "Moderately Active";
    else z = "High Conviction";
    return { activeShare: as, trackingError: te, ir: irVal, zone: z };
  }, [conviction]);

  const zoneColor =
    zone === "Closet Indexer"
      ? "text-rose-400"
      : zone === "Moderately Active"
      ? "text-amber-400"
      : "text-emerald-400";

  // AS vs TE scatter-style chart
  const chartW = 520;
  const chartH = 200;
  const padL = 48;
  const padR = 20;
  const padT = 16;
  const padB = 32;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const teMin = 0;
  const teMax = 12;
  const asMin = 0;
  const asMax = 100;

  const xPos = padL + ((trackingError - teMin) / (teMax - teMin)) * innerW;
  const yPos = padT + ((asMax - activeShare) / (asMax - asMin)) * innerH;

  const xTicks = [0, 2, 4, 6, 8, 10, 12];
  const yTicks = [0, 20, 40, 60, 80, 100];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading title="Conviction Level Simulator" sub="Drag the slider to adjust portfolio concentration" />
        <div className="flex items-center gap-4 mb-6">
          <span className="text-xs text-zinc-400 w-20">Conviction</span>
          <Slider
            value={[conviction]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => setConviction(v[0])}
            className="flex-1"
          />
          <span className="text-sm font-bold text-white w-8">{conviction}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Active Share" value={`${activeShare.toFixed(1)}%`} sub="Deviation from benchmark" />
          <StatCard label="Tracking Error" value={`${trackingError.toFixed(2)}%`} sub="Annualised volatility of alpha" />
          <StatCard label="Information Ratio" value={irVal(conviction)} sub="Alpha per unit of TE" highlight="neutral" />
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-zinc-400 mb-1">Classification</p>
            <p className={cn("text-base font-bold", zoneColor)}>{zone}</p>
            {activeShare < 60 && (
              <p className="text-xs text-rose-400/80 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Closet indexing risk
              </p>
            )}
          </div>
        </div>

        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
          {/* closet indexer zone */}
          <rect
            x={padL}
            y={padT + ((asMax - 60) / (asMax - asMin)) * innerH}
            width={innerW}
            height={((60 - asMin) / (asMax - asMin)) * innerH}
            fill="#f8717110"
          />
          <text
            x={padL + 4}
            y={padT + ((asMax - 30) / (asMax - asMin)) * innerH}
            fontSize={9}
            fill="#f87171"
            opacity={0.6}
          >
            Closet Indexer Zone
          </text>

          {xTicks.map((tick) => {
            const x = padL + ((tick - teMin) / (teMax - teMin)) * innerW;
            return (
              <g key={tick}>
                <line x1={x} y1={padT} x2={x} y2={chartH - padB} stroke="#ffffff18" strokeDasharray="3 3" />
                <text x={x} y={chartH - padB + 12} textAnchor="middle" fontSize={8} fill="#71717a">{tick}%</text>
              </g>
            );
          })}
          {yTicks.map((tick) => {
            const y = padT + ((asMax - tick) / (asMax - asMin)) * innerH;
            return (
              <g key={tick}>
                <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#ffffff18" strokeDasharray="3 3" />
                <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize={8} fill="#71717a">{tick}%</text>
              </g>
            );
          })}

          <text x={chartW / 2} y={chartH - 4} textAnchor="middle" fontSize={9} fill="#71717a">Tracking Error (%)</text>
          <text x={12} y={chartH / 2} textAnchor="middle" fontSize={9} fill="#71717a" transform={`rotate(-90, 12, ${chartH / 2})`}>Active Share (%)</text>

          {/* dot */}
          <circle cx={xPos} cy={yPos} r={8} fill="#6366f1" opacity={0.3} />
          <circle cx={xPos} cy={yPos} r={5} fill="#6366f1" />
          <text x={xPos + 10} y={yPos - 4} fontSize={9} fill="#a5b4fc">{activeShare.toFixed(1)}% / {trackingError.toFixed(2)}%</text>
        </svg>

        <p className="text-xs text-zinc-500 text-center mt-1">TE (x-axis) vs Active Share (y-axis)</p>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-zinc-400">
          <span className="text-amber-300 font-semibold">Closet indexers</span> charge active fees while holding a portfolio nearly identical to the benchmark (Active Share &lt;60%). Academic research (Cremers &amp; Petajisto 2009) shows truly active funds with AS &gt;80% significantly outperform. A high IR above 0.5 indicates skill; below 0.3 suggests random returns may explain performance.
        </p>
      </div>
    </div>
  );
}

function irVal(conviction: number): string {
  return (conviction < 30 ? 0.1 + conviction * 0.01 : 0.4 + (conviction - 30) * 0.008).toFixed(2);
}

// ── Tab 4: Risk Contribution by Position ──────────────────────────────────────

function RiskContribTab() {
  const chartW = 560;
  const chartH = 200;
  const padL = 60;
  const padR = 20;
  const padT = 16;
  const padB = 20;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const n = POSITIONS.length;
  const barH = Math.floor(innerH / n) - 3;
  const maxPct = POSITIONS[0].pctContrib + 0.02;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Positions" value={`${POSITIONS.length}`} sub="Equal-weight benchmark" />
        <StatCard
          label="Top Risk Contrib."
          value={`${(POSITIONS[0].pctContrib * 100).toFixed(1)}%`}
          sub={POSITIONS[0].ticker}
          highlight="neg"
        />
        <StatCard
          label="Portfolio Vol"
          value={`${(POSITIONS.reduce((a, p) => a + p.mctr, 0) * 100).toFixed(2)}%`}
          sub="Weighted avg MCTR"
        />
        <StatCard
          label="Concentration HHI"
          value={(POSITIONS.reduce((a, p) => a + p.pctContrib ** 2, 0) * 10000).toFixed(0)}
          sub="< 1500 = diversified"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeading title="Risk Contribution by Position" sub="Sorted by % contribution to total portfolio risk" />
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
          {[0, 0.05, 0.1, 0.15, 0.2, 0.25].map((tick) => {
            const x = padL + (tick / maxPct) * innerW;
            if (x > chartW - padR + 2) return null;
            return (
              <g key={tick}>
                <line x1={x} y1={padT} x2={x} y2={chartH - padB} stroke="#ffffff18" strokeDasharray="3 3" />
                <text x={x} y={chartH - 4} textAnchor="middle" fontSize={8} fill="#71717a">{(tick * 100).toFixed(0)}%</text>
              </g>
            );
          })}
          {POSITIONS.map((pos, i) => {
            const y = padT + i * (innerH / n);
            const barW = (pos.pctContrib / maxPct) * innerW;
            const intensity = 0.4 + pos.pctContrib / POSITIONS[0].pctContrib * 0.6;
            return (
              <g key={pos.ticker}>
                <text x={padL - 6} y={y + barH / 2 + 1} textAnchor="end" fontSize={9} fill="#a1a1aa" dominantBaseline="middle">
                  {pos.ticker}
                </text>
                <rect x={padL} y={y + 1} width={barW} height={barH} fill={`rgba(99,102,241,${intensity})`} rx={2} />
                <text x={padL + barW + 4} y={y + barH / 2 + 1} fontSize={9} fill="#a1a1aa" dominantBaseline="middle">
                  {(pos.pctContrib * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              {["#", "Ticker", "Weight", "Standalone Vol", "MCTR", "% Risk Contrib", "Risk Bar"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-zinc-400 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {POSITIONS.map((pos, i) => (
              <tr key={pos.ticker} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-3 py-2 text-zinc-500">{i + 1}</td>
                <td className="px-3 py-2 text-white font-bold">{pos.ticker}</td>
                <td className="px-3 py-2 font-mono text-zinc-300">{(pos.weight * 100).toFixed(1)}%</td>
                <td className="px-3 py-2 font-mono text-zinc-300">{(pos.vol * 100).toFixed(1)}%</td>
                <td className={cn("px-3 py-2 font-mono", pos.mctr > 0.03 ? "text-rose-400" : "text-zinc-300")}>
                  {(pos.mctr * 100).toFixed(3)}%
                </td>
                <td className="px-3 py-2 font-mono font-bold text-zinc-200">{(pos.pctContrib * 100).toFixed(2)}%</td>
                <td className="px-3 py-2 w-28">
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${Math.min(100, pos.pctContrib / POSITIONS[0].pctContrib * 100)}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 5: Scenario Analysis ───────────────────────────────────────────────────

function ScenarioTab() {
  const chartW = 560;
  const chartH = 220;
  const padL = 140;
  const padR = 80;
  const padT = 16;
  const padB = 20;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const n = SCENARIOS.length;
  const barH = Math.floor(innerH / n) - 6;
  const maxAbs = Math.max(...SCENARIOS.flatMap((s) => [Math.abs(s.portfolioImpact), Math.abs(s.benchmarkImpact)])) * 1.1;
  const zero = innerW / 2;
  const xScale = (v: number) => (v / maxAbs) * (innerW / 2);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeading title="Macro Scenario Impact" sub="Estimated portfolio vs benchmark response to stress scenarios" />
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
          <line x1={padL + zero} y1={padT} x2={padL + zero} y2={chartH - padB} stroke="#ffffff40" strokeWidth={1} />
          {[-20, -10, 0, 10].map((tick) => {
            const x = padL + zero + xScale(tick / 100);
            return (
              <g key={tick}>
                <line x1={x} y1={padT} x2={x} y2={chartH - padB} stroke="#ffffff15" strokeDasharray="3 3" />
                <text x={x} y={chartH - 4} textAnchor="middle" fontSize={8} fill="#71717a">{tick}%</text>
              </g>
            );
          })}

          {SCENARIOS.map((sc, i) => {
            const y = padT + i * (innerH / n) + 4;
            const portW = Math.abs(xScale(sc.portfolioImpact));
            const bmkW = Math.abs(xScale(sc.benchmarkImpact));
            const portX = padL + zero - portW;
            const bmkX = padL + zero - bmkW;
            const outperform = sc.portfolioImpact > sc.benchmarkImpact;

            return (
              <g key={sc.name}>
                <text x={padL - 6} y={y + barH / 2 - 2} textAnchor="end" fontSize={9} fill="#e4e4e7" dominantBaseline="middle">
                  {sc.name}
                </text>
                {/* benchmark bar */}
                <rect x={bmkX} y={y + 1} width={bmkW} height={barH / 2 - 1} fill="#ffffff30" rx={1} />
                {/* portfolio bar */}
                <rect x={portX} y={y + barH / 2 + 1} width={portW} height={barH / 2 - 1} fill={outperform ? "#10b981" : "#f87171"} opacity={0.85} rx={1} />
                <text x={padL + zero + 4} y={y + barH / 2 - 2} fontSize={9} fill="#a1a1aa">
                  Bmk: {pct(sc.benchmarkImpact, 1)}
                </text>
                <text x={padL + zero + 4} y={y + barH - 2} fontSize={9} fill={outperform ? "#34d399" : "#f87171"}>
                  Port: {pct(sc.portfolioImpact, 1)}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="text-xs text-zinc-500 mt-2 text-center">Green = portfolio outperforms in scenario | White = benchmark bar</p>
      </div>

      <div className="space-y-3">
        {SCENARIOS.map((sc) => {
          const excess = sc.portfolioImpact - sc.benchmarkImpact;
          return (
            <div key={sc.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{sc.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{sc.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-zinc-500">Portfolio</p>
                      <p className={cn("text-sm font-bold font-mono", pctColor(sc.portfolioImpact))}>{pct(sc.portfolioImpact, 1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Benchmark</p>
                      <p className={cn("text-sm font-bold font-mono", pctColor(sc.benchmarkImpact))}>{pct(sc.benchmarkImpact, 1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Excess</p>
                      <p className={cn("text-sm font-bold font-mono", pctColor(excess))}>{pct(excess, 2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", excess >= 0 ? "bg-emerald-500" : "bg-rose-500")}
                  style={{ width: `${Math.min(100, Math.abs(excess) / 0.05 * 50)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 6: Attribution History ────────────────────────────────────────────────

function HistoryTab() {
  const chartW = 560;
  const chartH = 220;
  const padL = 52;
  const padR = 20;
  const padT = 16;
  const padB = 28;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const allVals = HISTORY.flatMap((h) => [h.cumAlpha, h.allocEffect, h.selEffect]);
  const minV = Math.min(...allVals) - 0.005;
  const maxV = Math.max(...allVals) + 0.005;
  const range = maxV - minV;

  const xPos = (i: number) => padL + (i / (HISTORY.length - 1)) * innerW;
  const yPos = (v: number) => padT + ((maxV - v) / range) * innerH;

  const makePath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${xPos(i)} ${yPos(v)}`).join(" ");

  const alphaPath = makePath(HISTORY.map((h) => h.cumAlpha));
  const allocPath = makePath(HISTORY.map((h) => h.allocEffect));
  const selPath = makePath(HISTORY.map((h) => h.selEffect));

  const yticks = 5;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Cumulative Alpha"
          value={pct(HISTORY[HISTORY.length - 1].cumAlpha)}
          highlight={HISTORY[HISTORY.length - 1].cumAlpha >= 0 ? "pos" : "neg"}
          sub="12-month total"
        />
        <StatCard
          label="Allocation Effect"
          value={pct(HISTORY[HISTORY.length - 1].allocEffect)}
          highlight={HISTORY[HISTORY.length - 1].allocEffect >= 0 ? "pos" : "neg"}
          sub="Sector weight decisions"
        />
        <StatCard
          label="Selection Effect"
          value={pct(HISTORY[HISTORY.length - 1].selEffect)}
          highlight={HISTORY[HISTORY.length - 1].selEffect >= 0 ? "pos" : "neg"}
          sub="Stock picking skill"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeading title="Cumulative Attribution — 12 Months" sub="Alpha (white) · Allocation (indigo) · Selection (cyan)" />
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
          {Array.from({ length: yticks }, (_, i) => {
            const v = minV + (range / (yticks - 1)) * i;
            const y = yPos(v);
            return (
              <g key={i}>
                <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#ffffff18" strokeDasharray="3 3" />
                <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#71717a">
                  {v > 0 ? `+${(v * 100).toFixed(1)}` : (v * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}
          {/* zero */}
          {minV < 0 && maxV > 0 && (
            <line x1={padL} y1={yPos(0)} x2={chartW - padR} y2={yPos(0)} stroke="#ffffff40" strokeWidth={1} />
          )}

          {HISTORY.map((h, i) => (
            <text key={h.month} x={xPos(i)} y={chartH - padB + 12} textAnchor="middle" fontSize={8} fill="#71717a">
              {h.month}
            </text>
          ))}

          {/* area under alpha */}
          <path
            d={`${alphaPath} L ${xPos(HISTORY.length - 1)} ${yPos(0)} L ${xPos(0)} ${yPos(0)} Z`}
            fill={HISTORY[HISTORY.length - 1].cumAlpha >= 0 ? "#10b98120" : "#f8717120"}
          />

          <path d={allocPath} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round" />
          <path d={selPath} fill="none" stroke="#22d3ee" strokeWidth={2} strokeLinejoin="round" />
          <path d={alphaPath} fill="none" stroke="#ffffff" strokeWidth={2.5} strokeLinejoin="round" />

          {/* end dots */}
          {[
            { path: HISTORY[HISTORY.length - 1].cumAlpha, color: "#ffffff" },
            { path: HISTORY[HISTORY.length - 1].allocEffect, color: "#6366f1" },
            { path: HISTORY[HISTORY.length - 1].selEffect, color: "#22d3ee" },
          ].map(({ path: v, color }) => (
            <circle
              key={color}
              cx={xPos(HISTORY.length - 1)}
              cy={yPos(v)}
              r={4}
              fill={color}
            />
          ))}
        </svg>

        <div className="flex gap-4 mt-3 justify-center">
          {[
            { color: "#ffffff", label: "Cumulative Alpha" },
            { color: "#6366f1", label: "Allocation Effect" },
            { color: "#22d3ee", label: "Selection Effect" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded-full" style={{ background: color }} />
              <span className="text-xs text-zinc-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              {["Month", "Cum. Alpha", "Alloc Effect", "Sel Effect", "Monthly Delta"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-zinc-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((h, i) => {
              const prev = i > 0 ? HISTORY[i - 1].cumAlpha : 0;
              const delta = h.cumAlpha - prev;
              return (
                <tr key={h.month} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-3 py-2 text-zinc-300 font-medium">{h.month} &apos;25</td>
                  <td className={cn("px-3 py-2 font-mono font-bold", pctColor(h.cumAlpha))}>{pct(h.cumAlpha)}</td>
                  <td className={cn("px-3 py-2 font-mono", pctColor(h.allocEffect))}>{pct(h.allocEffect)}</td>
                  <td className={cn("px-3 py-2 font-mono", pctColor(h.selEffect))}>{pct(h.selEffect)}</td>
                  <td className={cn("px-3 py-2 font-mono", pctColor(delta))}>{pct(delta)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "bhb", label: "BHB Attribution", icon: Layers },
  { id: "factor", label: "Factor Decomp.", icon: BarChart3 },
  { id: "active", label: "Active Share", icon: Activity },
  { id: "riskcontrib", label: "Risk Contrib.", icon: PieChart },
  { id: "scenario", label: "Scenario", icon: AlertTriangle },
  { id: "history", label: "History", icon: TrendingUp },
];

export default function RiskAttributionPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-indigo-500/20 border border-indigo-500/30 p-3">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio Risk Attribution</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Decompose sources of active return and risk — BHB attribution, factor exposures, active share, and scenario stress testing.
          </p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Active Return"
          value={pct(BHB_DATA.reduce((a, r) => a + r.total, 0))}
          highlight={BHB_DATA.reduce((a, r) => a + r.total, 0) >= 0 ? "pos" : "neg"}
          sub="Portfolio vs S&P 500"
        />
        <StatCard
          label="Portfolio Alpha"
          value={pct(FACTOR_DATA.find((f) => f.name === "Residual")?.contribution ?? 0)}
          highlight={(FACTOR_DATA.find((f) => f.name === "Residual")?.contribution ?? 0) >= 0 ? "pos" : "neg"}
          sub="Factor-adjusted alpha"
        />
        <StatCard
          label="Active Share"
          value="68.5%"
          sub="Moderately active"
          highlight="neutral"
        />
        <StatCard
          label="Top Risk Position"
          value={`${(POSITIONS[0].pctContrib * 100).toFixed(1)}%`}
          sub={`${POSITIONS[0].ticker} contribution`}
          highlight="neg"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bhb">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {TABS.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="flex items-center gap-1.5 text-xs py-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="bhb" className="data-[state=inactive]:hidden mt-4">
          <BHBTab />
        </TabsContent>
        <TabsContent value="factor" className="data-[state=inactive]:hidden mt-4">
          <FactorTab />
        </TabsContent>
        <TabsContent value="active" className="data-[state=inactive]:hidden mt-4">
          <ActiveShareTab />
        </TabsContent>
        <TabsContent value="riskcontrib" className="data-[state=inactive]:hidden mt-4">
          <RiskContribTab />
        </TabsContent>
        <TabsContent value="scenario" className="data-[state=inactive]:hidden mt-4">
          <ScenarioTab />
        </TabsContent>
        <TabsContent value="history" className="data-[state=inactive]:hidden mt-4">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
