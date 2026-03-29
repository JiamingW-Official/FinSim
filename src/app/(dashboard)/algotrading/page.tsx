"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Clock,
  TrendingUp,
  BarChart2,
  Activity,
  Target,
  Shield,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 985;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate stable values
const VALS = Array.from({ length: 2000 }, () => rand());
let vi = 0;
const sv = () => VALS[vi++ % VALS.length];

// ── TWAP/VWAP execution data ───────────────────────────────────────────────────
const EXEC_PERIODS = 20;
const execData = (() => {
  vi = 0;
  const basePrice = 100;
  const arr: { t: number; actual: number; twap: number; vwap: number; volume: number }[] = [];
  let twapAccum = 0;
  let vwapPriceVol = 0;
  let vwapVol = 0;

  for (let i = 0; i < EXEC_PERIODS; i++) {
    const drift = (sv() - 0.5) * 0.4;
    const price = basePrice + drift * (i + 1) * 0.2 + (sv() - 0.5) * 0.6;
    const actualSlip = (sv() - 0.48) * 0.3;
    const actual = price + actualSlip;
    const volume = 800 + sv() * 1200;

    twapAccum += price;
    const twap = twapAccum / (i + 1);

    vwapPriceVol += price * volume;
    vwapVol += volume;
    const vwap = vwapPriceVol / vwapVol;

    arr.push({ t: i, actual, twap, vwap, volume });
  }
  return arr;
})();

const ARRIVAL_PRICE = execData[0].actual;
const AVG_ACTUAL = execData.reduce((a, b) => a + b.actual, 0) / execData.length;
const IMPL_SHORTFALL_BPS = Math.round((AVG_ACTUAL - ARRIVAL_PRICE) * 10000 / ARRIVAL_PRICE);
const TWAP_END = execData[execData.length - 1].twap;
const VWAP_END = execData[execData.length - 1].vwap;
const TWAP_SHORTFALL = Math.round((AVG_ACTUAL - TWAP_END) * 10000 / TWAP_END);
const VWAP_SHORTFALL = Math.round((AVG_ACTUAL - VWAP_END) * 10000 / VWAP_END);

// ── Backtesting data ──────────────────────────────────────────────────────────
const BT_PERIODS = 60;
const btEquity = (() => {
  vi = 50;
  const arr: number[] = [10000];
  for (let i = 1; i < BT_PERIODS; i++) {
    const prev = arr[i - 1];
    const ret = (sv() - 0.47) * 0.025;
    arr.push(Math.max(prev * (1 + ret), prev * 0.88));
  }
  return arr;
})();

const btPeak: number[] = [];
let peak = btEquity[0];
btEquity.forEach((v) => {
  if (v > peak) peak = v;
  btPeak.push(peak);
});
const drawdowns = btEquity.map((v, i) => (v - btPeak[i]) / btPeak[i]);
const maxDrawdown = Math.min(...drawdowns);

const monthlyReturns = (() => {
  vi = 100;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = ["2023", "2024"];
  const rows: { year: string; months: { label: string; ret: number }[] }[] = [];
  for (const yr of years) {
    rows.push({
      year: yr,
      months: months.map((m) => ({ label: m, ret: (sv() - 0.44) * 6 })),
    });
  }
  return rows;
})();

const finalEquity = btEquity[btEquity.length - 1];
const totalReturn = (finalEquity - 10000) / 10000;
const dailyRets: number[] = [];
for (let i = 1; i < btEquity.length; i++) {
  dailyRets.push((btEquity[i] - btEquity[i - 1]) / btEquity[i - 1]);
}
const meanRet = dailyRets.reduce((a, b) => a + b, 0) / dailyRets.length;
const stdRet = Math.sqrt(
  dailyRets.reduce((a, b) => a + (b - meanRet) ** 2, 0) / dailyRets.length
);
const sharpe = (meanRet / stdRet) * Math.sqrt(252);
const wins = dailyRets.filter((r) => r > 0);
const losses = dailyRets.filter((r) => r <= 0);
const winRate = wins.length / dailyRets.length;
const avgWin = wins.reduce((a, b) => a + b, 0) / Math.max(wins.length, 1);
const avgLoss = Math.abs(losses.reduce((a, b) => a + b, 0) / Math.max(losses.length, 1));

// ── Market impact data ────────────────────────────────────────────────────────
function calcImpact(sizeAdv: number, urgency: number): number {
  // Almgren-Chriss simplified: impact = eta * sigma * (shares/adv) ^ 0.6 * urgency_factor
  const sigma = 0.015;
  const eta = 0.1;
  const urgencyFactor = 0.5 + urgency * 1.5;
  return eta * sigma * Math.pow(sizeAdv / 100, 0.6) * urgencyFactor * 10000;
}

// ── Order types ───────────────────────────────────────────────────────────────
interface OrderType {
  name: string;
  abbr: string;
  color: string;
  bg: string;
  description: string;
  whenToUse: string;
  risk: "Low" | "Medium" | "High";
}

const ORDER_TYPES: OrderType[] = [
  {
    name: "Market Order",
    abbr: "MKT",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    description: "Execute immediately at the best available price.",
    whenToUse: "Liquidity is high and speed matters more than price precision.",
    risk: "Medium",
  },
  {
    name: "Limit Order",
    abbr: "LMT",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    description: "Execute only at a specified price or better.",
    whenToUse: "Price precision is critical; willing to risk non-execution.",
    risk: "Low",
  },
  {
    name: "Stop Order",
    abbr: "STP",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    description: "Becomes a market order once a trigger price is reached.",
    whenToUse: "Cutting losses or protecting profits automatically.",
    risk: "Medium",
  },
  {
    name: "Stop-Limit",
    abbr: "STPLMT",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    description: "Becomes a limit order once the stop price is hit.",
    whenToUse: "Controlling slippage on stop orders in volatile markets.",
    risk: "Medium",
  },
  {
    name: "Market-on-Close",
    abbr: "MOC",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    description: "Executes at the official closing auction price.",
    whenToUse: "Index rebalancing, ETF creation/redemption at closing NAV.",
    risk: "Low",
  },
  {
    name: "Limit-on-Close",
    abbr: "LOC",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
    description: "Participates in closing auction only if price limit is met.",
    whenToUse: "Closing auction participation with price protection.",
    risk: "Low",
  },
  {
    name: "TWAP",
    abbr: "TWAP",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    description: "Splits order evenly across equal time intervals.",
    whenToUse: "Minimizing market impact for large orders over a fixed window.",
    risk: "Low",
  },
  {
    name: "VWAP",
    abbr: "VWAP",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    description: "Participates proportionally to historical volume profile.",
    whenToUse: "Benchmark-sensitive execution aligned with natural liquidity.",
    risk: "Low",
  },
];

// ── Execution quality metrics ─────────────────────────────────────────────────
const EXEC_METRICS = [
  { metric: "Effective Spread", value: "4.2 bps", benchmark: "5.0 bps", status: "good" },
  { metric: "Price Improvement", value: "0.8 bps", benchmark: "0 bps", status: "good" },
  { metric: "Fill Rate", value: "97.4%", benchmark: "95.0%", status: "good" },
  { metric: "Queue Position (avg)", value: "3.1", benchmark: "< 5", status: "neutral" },
  { metric: "Slippage vs VWAP", value: "+2.1 bps", benchmark: "< 3 bps", status: "neutral" },
  { metric: "Slippage vs Arrival", value: "+5.8 bps", benchmark: "< 5 bps", status: "bad" },
];

// ── HFT strategy cards ────────────────────────────────────────────────────────
interface HFTStrategy {
  name: string;
  icon: React.ReactNode;
  mechanics: string;
  profitability: string;
  concern: string;
  tag: string;
  tagColor: string;
}

// ── SVG chart: TWAP/VWAP execution ───────────────────────────────────────────
function ExecutionChart() {
  const W = 520;
  const H = 200;
  const PAD = { l: 44, r: 16, t: 16, b: 36 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const allPrices = execData.flatMap((d) => [d.actual, d.twap, d.vwap]);
  const minP = Math.min(...allPrices) - 0.2;
  const maxP = Math.max(...allPrices) + 0.2;
  const toX = (i: number) => PAD.l + (i / (EXEC_PERIODS - 1)) * cW;
  const toY = (v: number) => PAD.t + cH - ((v - minP) / (maxP - minP)) * cH;

  const actualPts = execData.map((d) => `${toX(d.t)},${toY(d.actual)}`).join(" ");
  const twapPts = execData.map((d) => `${toX(d.t)},${toY(d.twap)}`).join(" ");
  const vwapPts = execData.map((d) => `${toX(d.t)},${toY(d.vwap)}`).join(" ");

  const yTicks = [minP, (minP + maxP) / 2, maxP];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
      {yTicks.map((v, i) => (
        <line key={`gl-${i}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {yTicks.map((v, i) => (
        <text key={`gy-${i}`} x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="9" textAnchor="end">
          {v.toFixed(2)}
        </text>
      ))}
      {[0, 5, 10, 15, 19].map((i) => (
        <text key={`xl-${i}`} x={toX(i)} y={H - 6} fill="#71717a" fontSize="9" textAnchor="middle">
          T{i + 1}
        </text>
      ))}
      <polyline points={twapPts} fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4 2" />
      <polyline points={vwapPts} fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="4 2" />
      <polyline points={actualPts} fill="none" stroke="#f59e0b" strokeWidth="2" />
      {execData.map((d, i) => (
        <circle key={`adot-${i}`} cx={toX(d.t)} cy={toY(d.actual)} r="2.5" fill="#f59e0b" />
      ))}
      {/* Legend */}
      <line x1={340} y1={PAD.t + 8} x2={358} y2={PAD.t + 8} stroke="#f59e0b" strokeWidth="2" />
      <text x={362} y={PAD.t + 12} fill="#f59e0b" fontSize="9">Actual</text>
      <line x1={400} y1={PAD.t + 8} x2={418} y2={PAD.t + 8} stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4 2" />
      <text x={422} y={PAD.t + 12} fill="#22d3ee" fontSize="9">TWAP</text>
      <line x1={455} y1={PAD.t + 8} x2={473} y2={PAD.t + 8} stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="4 2" />
      <text x={477} y={PAD.t + 12} fill="#a78bfa" fontSize="9">VWAP</text>
    </svg>
  );
}

// ── SVG chart: Market Impact ──────────────────────────────────────────────────
function MarketImpactChart({ urgency }: { urgency: number }) {
  const W = 520;
  const H = 180;
  const PAD = { l: 44, r: 16, t: 16, b: 36 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const sizes = Array.from({ length: 50 }, (_, i) => (i + 1) * 2);
  const impacts = sizes.map((sz) => calcImpact(sz, urgency));
  const maxImpact = Math.max(...impacts);

  const toX = (sz: number) => PAD.l + ((sz - 2) / 98) * cW;
  const toY = (v: number) => PAD.t + cH - (v / (maxImpact * 1.1)) * cH;

  const pts = sizes.map((sz, i) => `${toX(sz)},${toY(impacts[i])}`).join(" ");
  const area = [
    `${toX(2)},${PAD.t + cH}`,
    ...sizes.map((sz, i) => `${toX(sz)},${toY(impacts[i])}`),
    `${toX(100)},${PAD.t + cH}`,
  ].join(" ");

  const yTicks = [0, maxImpact * 0.25, maxImpact * 0.5, maxImpact * 0.75, maxImpact];
  const xTicks = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      <defs>
        <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map((v, i) => (
        <line key={`gy-${i}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {yTicks.map((v, i) => (
        <text key={`gt-${i}`} x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="9" textAnchor="end">
          {v.toFixed(0)}
        </text>
      ))}
      {xTicks.map((v) => (
        <text key={`xl-${v}`} x={toX(v === 0 ? 2 : v)} y={H - 6} fill="#71717a" fontSize="9" textAnchor="middle">
          {v}%
        </text>
      ))}
      <polygon points={area} fill="url(#impactGrad)" />
      <polyline points={pts} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
      <text x={PAD.l + 4} y={PAD.t + 12} fill="#71717a" fontSize="9">Market Impact (bps)</text>
      <text x={W / 2} y={H - 2} fill="#71717a" fontSize="9" textAnchor="middle">Trade Size (% of ADV)</text>
    </svg>
  );
}

// ── SVG chart: Equity Curve ───────────────────────────────────────────────────
function EquityCurveChart() {
  const W = 520;
  const H = 180;
  const PAD = { l: 52, r: 16, t: 16, b: 36 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const minE = Math.min(...btEquity) * 0.995;
  const maxE = Math.max(...btEquity) * 1.005;
  const toX = (i: number) => PAD.l + (i / (BT_PERIODS - 1)) * cW;
  const toY = (v: number) => PAD.t + cH - ((v - minE) / (maxE - minE)) * cH;

  const pts = btEquity.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const area = [
    `${toX(0)},${PAD.t + cH}`,
    ...btEquity.map((v, i) => `${toX(i)},${toY(v)}`),
    `${toX(BT_PERIODS - 1)},${PAD.t + cH}`,
  ].join(" ");

  const ddPts = drawdowns
    .map((d, i) => `${toX(i)},${PAD.t + cH * 0.3 - d * cH * 0.3}`)
    .join(" ");

  const yTicks = [10000, 10500, 11000, 11500, 12000].filter((v) => v >= minE && v <= maxE);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      <defs>
        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f87171" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {yTicks.map((v, i) => (
        <line key={`gl-${i}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {yTicks.map((v, i) => (
        <text key={`gy-${i}`} x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="9" textAnchor="end">
          ${(v / 1000).toFixed(1)}k
        </text>
      ))}
      {/* Drawdown fill at top */}
      <polyline points={ddPts} fill="url(#ddGrad)" strokeWidth="0" />
      <polygon points={area} fill="url(#eqGrad)" />
      <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
      {[0, 15, 30, 45, 59].map((i) => (
        <text key={`xl-${i}`} x={toX(i)} y={H - 6} fill="#71717a" fontSize="9" textAnchor="middle">
          D{i + 1}
        </text>
      ))}
    </svg>
  );
}

// ── Monthly heatmap ───────────────────────────────────────────────────────────
function MonthlyHeatmap() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left text-zinc-500 font-normal pr-3 py-1 w-12">Year</th>
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
              <th key={m} className="text-center text-zinc-500 font-normal px-1 py-1 w-10">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthlyReturns.map((row) => (
            <tr key={row.year}>
              <td className="text-zinc-400 pr-3 py-1">{row.year}</td>
              {row.months.map((m) => (
                <td key={m.label} className="px-0.5 py-0.5 text-center">
                  <div
                    className={cn(
                      "rounded px-1 py-0.5 text-[10px] font-medium tabular-nums",
                      m.ret >= 2 ? "bg-emerald-500/30 text-emerald-300" :
                      m.ret >= 0.5 ? "bg-emerald-500/15 text-emerald-400" :
                      m.ret >= -0.5 ? "bg-zinc-700/50 text-zinc-400" :
                      m.ret >= -2 ? "bg-red-500/15 text-red-400" :
                      "bg-red-500/30 text-red-300"
                    )}
                  >
                    {m.ret > 0 ? "+" : ""}{m.ret.toFixed(1)}%
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AlgoTradingPage() {
  const [tradeSize, setTradeSize] = useState(10);
  const [urgency, setUrgency] = useState(0.5);
  const impactBps = calcImpact(tradeSize, urgency);

  const hftStrategies: HFTStrategy[] = [
    {
      name: "Market Making",
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      mechanics:
        "Post two-sided quotes (bid & ask) at tight spreads, capturing the bid-ask spread repeatedly. Inventory risk is managed by skewing quotes.",
      profitability:
        "High Sharpe, low per-trade PnL. Profits ~0.1–0.5 bps per share, but millions of trades per day.",
      concern: "Regulatory scrutiny over quote stuffing; spoofing rules (SEC Rule 15c3-5).",
      tag: "Liquidity Provider",
      tagColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    },
    {
      name: "Latency Arbitrage",
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      mechanics:
        "Co-locate servers at exchanges, using microsecond speed to detect and act on price discrepancies across venues before slower participants.",
      profitability:
        "Very consistent; profits decay as infrastructure improves. Arms race keeps margins thin.",
      concern: "Fairness debate; requires massive infrastructure spend (~$10M+ per exchange).",
      tag: "Speed-Based",
      tagColor: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    },
    {
      name: "Statistical Arbitrage",
      icon: <BarChart2 className="w-5 h-5 text-blue-400" />,
      mechanics:
        "Exploit mean-reversion in correlated instruments (pairs, sector ETFs vs constituents). Enter when spread exceeds 2σ; exit at mean.",
      profitability:
        "Strong risk-adjusted returns; Sharpe 1.5–3. Capacity-constrained and crowded.",
      concern: "Crowding risk — many players use similar signals, leading to simultaneous unwinds.",
      tag: "Mean-Reversion",
      tagColor: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    },
    {
      name: "Momentum Ignition",
      icon: <TrendingUp className="w-5 h-5 text-red-400" />,
      mechanics:
        "Place layered orders to create the appearance of momentum, trigger stop orders and algos, then reverse the position at a profit.",
      profitability:
        "Potentially high short-term gains, but highly risky. Detected by surveillance systems.",
      concern: "Illegal under most regulatory regimes (market manipulation). Subject to civil/criminal charges.",
      tag: "Controversial",
      tagColor: "bg-red-500/15 text-red-400 border-red-500/20",
    },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div {...fadeUp}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Algorithmic Trading &amp; Market Microstructure</h1>
            <p className="text-sm text-zinc-500">Order types, execution algorithms, market impact models, and HFT strategies</p>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Impl. Shortfall", value: `${IMPL_SHORTFALL_BPS > 0 ? "+" : ""}${IMPL_SHORTFALL_BPS} bps`, sub: "vs arrival price", icon: <Target className="w-4 h-4 text-amber-400" />, col: "text-amber-400" },
            { label: "TWAP Shortfall", value: `${TWAP_SHORTFALL > 0 ? "+" : ""}${TWAP_SHORTFALL} bps`, sub: "vs benchmark", icon: <Clock className="w-4 h-4 text-cyan-400" />, col: "text-cyan-400" },
            { label: "VWAP Shortfall", value: `${VWAP_SHORTFALL > 0 ? "+" : ""}${VWAP_SHORTFALL} bps`, sub: "vs benchmark", icon: <BarChart2 className="w-4 h-4 text-purple-400" />, col: "text-purple-400" },
            { label: "Backtest Sharpe", value: sharpe.toFixed(2), sub: "momentum strategy", icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, col: "text-emerald-400" },
          ].map((k) => (
            <Card key={k.label} className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  {k.icon}
                  <span className="text-xs text-zinc-500">{k.label}</span>
                </div>
                <div className={cn("text-lg font-semibold tabular-nums", k.col)}>{k.value}</div>
                <div className="text-xs text-zinc-600">{k.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div {...fadeUp} transition={{ delay: 0.1, duration: 0.4 }}>
        <Tabs defaultValue="orders">
          <TabsList className="bg-zinc-900 border border-zinc-800 flex flex-wrap gap-0 h-auto">
            {[
              { value: "orders", label: "Order Types" },
              { value: "execution", label: "TWAP/VWAP" },
              { value: "impact", label: "Market Impact" },
              { value: "hft", label: "HFT Strategies" },
              { value: "backtest", label: "Backtesting" },
              { value: "quality", label: "Exec Quality" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs px-3 py-1.5 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Order Types ───────────────────────────────────────────── */}
          <TabsContent value="orders" className="data-[state=inactive]:hidden mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ORDER_TYPES.map((ot) => (
                <Card key={ot.name} className={cn("border", ot.bg)}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={cn("font-mono text-xs px-2 py-0.5", ot.color, "bg-transparent border-current border")}>
                        {ot.abbr}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 py-0.5",
                          ot.risk === "Low" ? "bg-emerald-500/15 text-emerald-400" :
                          ot.risk === "Medium" ? "bg-amber-500/15 text-amber-400" :
                          "bg-red-500/15 text-red-400"
                        )}
                      >
                        {ot.risk} Risk
                      </Badge>
                    </div>
                    <CardTitle className={cn("text-sm mt-2", ot.color)}>{ot.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <p className="text-xs text-zinc-400 leading-relaxed">{ot.description}</p>
                    <div className="flex items-start gap-1.5">
                      <ChevronRight className="w-3 h-3 text-zinc-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-zinc-500 leading-relaxed">{ot.whenToUse}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-zinc-300">Order Priority Rules</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-400">
                  <div>
                    <div className="text-zinc-300 font-medium mb-1">Price-Time Priority</div>
                    <p>Orders are matched first by best price, then by time of submission. Limit orders at better prices always execute first.</p>
                  </div>
                  <div>
                    <div className="text-zinc-300 font-medium mb-1">Pro-Rata Allocation</div>
                    <p>Some exchanges (CME interest rates) split fills proportional to order size, favoring larger participants at the same price level.</p>
                  </div>
                  <div>
                    <div className="text-zinc-300 font-medium mb-1">Maker-Taker Fees</div>
                    <p>Limit orders earn a rebate (maker); market orders pay a fee (taker). Shapes strategy — rebate-driven algos post limits to collect spread + rebate.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TWAP/VWAP Execution ───────────────────────────────────── */}
          <TabsContent value="execution" className="data-[state=inactive]:hidden mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col gap-2">
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-3">
                    <div className="text-xs text-zinc-500 mb-1">Arrival Price</div>
                    <div className="text-base font-semibold text-zinc-200 tabular-nums">${ARRIVAL_PRICE.toFixed(3)}</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-3">
                    <div className="text-xs text-zinc-500 mb-1">Avg Execution Price</div>
                    <div className="text-base font-semibold text-amber-400 tabular-nums">${AVG_ACTUAL.toFixed(3)}</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-3">
                    <div className="text-xs text-zinc-500 mb-1">Implementation Shortfall</div>
                    <div className={cn("text-base font-semibold tabular-nums", IMPL_SHORTFALL_BPS >= 0 ? "text-red-400" : "text-emerald-400")}>
                      {IMPL_SHORTFALL_BPS > 0 ? "+" : ""}{IMPL_SHORTFALL_BPS} bps
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-3">
                    <div className="text-xs text-zinc-500 mb-1">vs TWAP / VWAP</div>
                    <div className="text-sm font-medium text-zinc-300 tabular-nums">
                      <span className={TWAP_SHORTFALL >= 0 ? "text-red-400" : "text-emerald-400"}>{TWAP_SHORTFALL > 0 ? "+" : ""}{TWAP_SHORTFALL}</span>
                      <span className="text-zinc-600 mx-1">/</span>
                      <span className={VWAP_SHORTFALL >= 0 ? "text-red-400" : "text-emerald-400"}>{VWAP_SHORTFALL > 0 ? "+" : ""}{VWAP_SHORTFALL}</span>
                      <span className="text-zinc-600 text-xs ml-1">bps</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="md:col-span-2">
                <Card className="bg-zinc-900/60 border-zinc-800 h-full">
                  <CardHeader className="p-4 pb-1">
                    <CardTitle className="text-sm text-zinc-300">Execution vs Benchmark (20 Periods)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <ExecutionChart />
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-zinc-300">Algorithm Mechanics</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-400">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-0.5 bg-cyan-400" style={{ borderTop: "1.5px dashed #22d3ee" }}></div>
                      <span className="text-cyan-400 font-medium">TWAP — Time Weighted Average Price</span>
                    </div>
                    <p className="leading-relaxed">Divides total order into equal-sized child orders across N time slices. Simple and predictable but ignores volume distribution — may consume disproportionate liquidity during low-volume periods.</p>
                    <div className="mt-2 p-2 bg-zinc-800/50 rounded text-zinc-500 font-mono">
                      slice_qty = total_qty / N<br />
                      interval = T / N
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-0.5 bg-purple-400" style={{ borderTop: "1.5px dashed #a78bfa" }}></div>
                      <span className="text-purple-400 font-medium">VWAP — Volume Weighted Average Price</span>
                    </div>
                    <p className="leading-relaxed">Schedules participation according to a historical intraday volume profile. More sophisticated — trades heavier near open/close when volume is highest, minimizing market impact relative to natural flow.</p>
                    <div className="mt-2 p-2 bg-zinc-800/50 rounded text-zinc-500 font-mono">
                      slice_qty[t] = total_qty &times; vol_pct[t]<br />
                      where &Sigma;vol_pct[t] = 1
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Market Impact ─────────────────────────────────────────── */}
          <TabsContent value="impact" className="data-[state=inactive]:hidden mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-4">
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm text-zinc-300">Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-5">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-2">
                        <span>Trade Size</span>
                        <span className="text-amber-400 font-medium tabular-nums">{tradeSize}% of ADV</span>
                      </div>
                      <Slider
                        value={[tradeSize]}
                        onValueChange={(v) => setTradeSize(v[0])}
                        min={1}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-2">
                        <span>Urgency Factor</span>
                        <span className="text-orange-400 font-medium tabular-nums">{urgency.toFixed(1)}</span>
                      </div>
                      <Slider
                        value={[urgency * 10]}
                        onValueChange={(v) => setUrgency(v[0] / 10)}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                        <span>Patient</span>
                        <span>Urgent</span>
                      </div>
                    </div>
                    <Card className="bg-zinc-800/60 border-zinc-700">
                      <CardContent className="p-3">
                        <div className="text-xs text-zinc-500 mb-1">Estimated Market Impact</div>
                        <div className="text-2xl font-bold text-amber-400 tabular-nums">{impactBps.toFixed(1)} bps</div>
                        <div className="text-xs text-zinc-600 mt-0.5">
                          ≈ ${(impactBps / 10000 * 100).toFixed(3)} per $100 notional
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
              <div className="md:col-span-2">
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardHeader className="p-4 pb-1">
                    <CardTitle className="text-sm text-zinc-300">Impact Curve (Almgren-Chriss Simplified)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <MarketImpactChart urgency={urgency} />
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-zinc-300">Model Reference</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-zinc-800/50 rounded">
                    <div className="text-zinc-300 font-medium mb-1">Temporary Impact</div>
                    <div className="font-mono text-zinc-400 mb-1.5">h(v) = &eta; &sigma; (v/ADV)^0.6</div>
                    <p className="text-zinc-500">Decays after order completion. Proportional to participation rate raised to a power (&lt;1 = concave — economies of scale in spreading).</p>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded">
                    <div className="text-zinc-300 font-medium mb-1">Permanent Impact</div>
                    <div className="font-mono text-zinc-400 mb-1.5">g(v) = &gamma; (v/ADV)</div>
                    <p className="text-zinc-500">Persists indefinitely. Information leakage — large buy signals demand, permanently shifting the price level up regardless of trading speed.</p>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded">
                    <div className="text-zinc-300 font-medium mb-1">Urgency Trade-off</div>
                    <div className="font-mono text-zinc-400 mb-1.5">TC = f(speed, mkt_risk)</div>
                    <p className="text-zinc-500">Fast execution reduces timing risk (price drift) but increases market impact. Optimal trajectory minimizes total cost = impact + price risk.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── HFT Strategies ────────────────────────────────────────── */}
          <TabsContent value="hft" className="data-[state=inactive]:hidden mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hftStrategies.map((strat) => (
                <Card key={strat.name} className="bg-zinc-900/60 border-zinc-800">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-zinc-800 border border-zinc-700">
                        {strat.icon}
                      </div>
                      <div>
                        <CardTitle className="text-sm text-zinc-100">{strat.name}</CardTitle>
                        <Badge className={cn("text-[10px] px-1.5 py-0 mt-1 border", strat.tagColor)}>
                          {strat.tag}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Mechanics</div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{strat.mechanics}</p>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Profitability</div>
                      <div className="flex items-start gap-1.5">
                        <ArrowUpRight className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-zinc-400 leading-relaxed">{strat.profitability}</p>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Regulatory / Risk</div>
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-zinc-400 leading-relaxed">{strat.concern}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-zinc-300">Microstructure Concepts</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {[
                    { term: "Co-location", def: "Server racks physically adjacent to exchange matching engine; reduces round-trip latency to ~1 microsecond." },
                    { term: "Order Book Depth", def: "Cumulative volume at each price level. Thin books amplify market impact; deep books absorb large orders." },
                    { term: "Adverse Selection", def: "Market makers get picked off when informed traders know price will move — the core risk of passive quoting." },
                    { term: "Lit vs Dark Pools", def: "Lit exchanges display pre-trade quotes; dark pools offer anonymous midpoint crossing with zero pre-trade transparency." },
                  ].map((c) => (
                    <div key={c.term} className="p-3 bg-zinc-800/50 rounded">
                      <div className="text-zinc-300 font-medium mb-1">{c.term}</div>
                      <p className="text-zinc-500 leading-relaxed">{c.def}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Backtesting ───────────────────────────────────────────── */}
          <TabsContent value="backtest" className="data-[state=inactive]:hidden mt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Return", value: `${totalReturn >= 0 ? "+" : ""}${(totalReturn * 100).toFixed(1)}%`, icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, col: totalReturn >= 0 ? "text-emerald-400" : "text-red-400" },
                { label: "Sharpe Ratio", value: sharpe.toFixed(2), icon: <Activity className="w-4 h-4 text-blue-400" />, col: "text-blue-400" },
                { label: "Max Drawdown", value: `${(maxDrawdown * 100).toFixed(1)}%`, icon: <ArrowDownRight className="w-4 h-4 text-red-400" />, col: "text-red-400" },
                { label: "Win Rate", value: `${(winRate * 100).toFixed(1)}%`, icon: <Target className="w-4 h-4 text-purple-400" />, col: "text-purple-400" },
                { label: "Avg Win", value: `+${(avgWin * 100).toFixed(2)}%`, icon: <ArrowUpRight className="w-4 h-4 text-emerald-400" />, col: "text-emerald-400" },
                { label: "Avg Loss", value: `-${(avgLoss * 100).toFixed(2)}%`, icon: <ArrowDownRight className="w-4 h-4 text-red-400" />, col: "text-red-400" },
                { label: "Win/Loss Ratio", value: (avgWin / avgLoss).toFixed(2), icon: <BarChart2 className="w-4 h-4 text-amber-400" />, col: "text-amber-400" },
                { label: "Total Trades", value: String(dailyRets.length), icon: <Zap className="w-4 h-4 text-zinc-400" />, col: "text-zinc-300" },
              ].map((k) => (
                <Card key={k.label} className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {k.icon}
                      <span className="text-xs text-zinc-500">{k.label}</span>
                    </div>
                    <div className={cn("text-lg font-semibold tabular-nums", k.col)}>{k.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader className="p-4 pb-1">
                  <CardTitle className="text-sm text-zinc-300">Equity Curve — Momentum Strategy (60-Day Backtest)</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <EquityCurveChart />
                  <p className="text-xs text-zinc-600 mt-2">Red area = drawdown depth (top); green = cumulative equity</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader className="p-4 pb-1">
                  <CardTitle className="text-sm text-zinc-300">Monthly Returns Heatmap</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <MonthlyHeatmap />
                </CardContent>
              </Card>
            </div>

            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-xs text-zinc-400 space-y-1">
                    <div className="text-amber-400 font-medium">Common Backtesting Pitfalls</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                      {[
                        { title: "Look-ahead Bias", desc: "Using future data in signal calculation (e.g., closing price of the same bar for entry). Always use t-1 close for t entry." },
                        { title: "Survivorship Bias", desc: "Testing only on stocks that exist today. Firms that went bankrupt are missing. This inflates historical returns." },
                        { title: "Overfitting", desc: "Too many parameters tuned on in-sample data. Use walk-forward analysis and out-of-sample validation to avoid curve-fitting." },
                      ].map((p) => (
                        <div key={p.title} className="p-2 bg-zinc-900/60 rounded">
                          <div className="text-amber-400 font-medium mb-0.5">{p.title}</div>
                          <p className="text-zinc-500 leading-relaxed">{p.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Execution Quality ─────────────────────────────────────── */}
          <TabsContent value="quality" className="data-[state=inactive]:hidden mt-4 space-y-4">
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-zinc-300">Execution Quality Metrics — Sample Order Flow</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left text-zinc-500 font-normal py-2 pr-4">Metric</th>
                        <th className="text-right text-zinc-500 font-normal py-2 px-4">Measured</th>
                        <th className="text-right text-zinc-500 font-normal py-2 px-4">Benchmark</th>
                        <th className="text-right text-zinc-500 font-normal py-2 pl-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {EXEC_METRICS.map((row) => (
                        <tr key={row.metric} className="hover:bg-zinc-800/20">
                          <td className="py-2.5 pr-4 text-zinc-300 font-medium">{row.metric}</td>
                          <td className="py-2.5 px-4 text-right text-zinc-200 tabular-nums font-mono">{row.value}</td>
                          <td className="py-2.5 px-4 text-right text-zinc-500 tabular-nums font-mono">{row.benchmark}</td>
                          <td className="py-2.5 pl-4 text-right">
                            <Badge
                              className={cn(
                                "text-[10px] px-1.5 py-0",
                                row.status === "good" ? "bg-emerald-500/15 text-emerald-400" :
                                row.status === "neutral" ? "bg-amber-500/15 text-amber-400" :
                                "bg-red-500/15 text-red-400"
                              )}
                            >
                              {row.status === "good" ? "Beat" : row.status === "neutral" ? "In-Line" : "Miss"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm text-zinc-300">Metric Definitions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2.5">
                  {[
                    { term: "Effective Spread", def: "2 × |execution price − midpoint|. Measures total round-trip transaction cost versus the midpoint at time of order." },
                    { term: "Price Improvement", def: "Amount execution beats the NBBO at time of order. Positive = better than posted spread; reward for providing patient orders." },
                    { term: "Fill Rate", def: "% of shares in limit orders that received full fills. Low fill rate = too aggressive limit pricing or low liquidity." },
                    { term: "Queue Position", def: "Rank in the order queue at a given price level. Position 1 = first to fill. Lower numbers = faster execution." },
                  ].map((d) => (
                    <div key={d.term} className="flex gap-2 text-xs">
                      <Shield className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-zinc-300 font-medium">{d.term}: </span>
                        <span className="text-zinc-500">{d.def}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm text-zinc-300">Regulatory Context (SEC Rule 605/606)</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3 text-xs text-zinc-400">
                  <p className="leading-relaxed">
                    <span className="text-zinc-300 font-medium">Rule 605</span> requires market centers to publish monthly execution quality statistics including effective spreads, realized spreads, price improvement rates, and fill rates.
                  </p>
                  <p className="leading-relaxed">
                    <span className="text-zinc-300 font-medium">Rule 606</span> requires brokers to disclose order routing practices quarterly, including payment for order flow (PFOF) arrangements and venues receiving retail flow.
                  </p>
                  <p className="leading-relaxed">
                    <span className="text-zinc-300 font-medium">Best Execution</span> obligation requires brokers to seek the most favorable terms for clients, considering price, speed, likelihood of fill, and total transaction costs — not just headline price.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
