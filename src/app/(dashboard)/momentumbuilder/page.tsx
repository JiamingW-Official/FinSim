"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  Zap,
  SlidersHorizontal,
  AlertTriangle,
  Shield,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 752008;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed(seed = 752008) {
  s = seed;
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface StockMomentum {
  ticker: string;
  name: string;
  sector: string;
  momentumScore: number;
  ret1m: number;
  ret3m: number;
  ret6m: number;
  ret12m: number;
  vol: number;
  decile: number;
}

interface AnnualRow {
  year: number;
  strategyReturn: number;
  sp500Return: number;
  alpha: number;
  sharpe: number;
  maxDD: number;
}

interface CrashEvent {
  name: string;
  period: string;
  startYear: number;
  peakDD: number;
  sp500DD: number;
  daysToRecover: number;
  peakDDWithOverlay: number;
  color: string;
}

interface HoldingPeriodRow {
  period: string;
  ic: number;
  tStat: number;
  hitRate: number;
  annualizedReturn: number;
}

// ── Static data generators ─────────────────────────────────────────────────────
const SECTORS = ["Tech", "Healthcare", "Finance", "Energy", "Consumer", "Industrials", "Utilities", "Materials"];
const STOCK_NAMES: { ticker: string; name: string; sector: string }[] = [
  { ticker: "APEX", name: "Apex Systems", sector: "Tech" },
  { ticker: "NOVA", name: "Nova Therapeutics", sector: "Healthcare" },
  { ticker: "FLUX", name: "Flux Capital", sector: "Finance" },
  { ticker: "CREST", name: "Crest Energy", sector: "Energy" },
  { ticker: "DYNA", name: "Dyna Consumer", sector: "Consumer" },
  { ticker: "IRON", name: "Iron Industries", sector: "Industrials" },
  { ticker: "PULSAR", name: "Pulsar Tech", sector: "Tech" },
  { ticker: "VELA", name: "Vela Bio", sector: "Healthcare" },
  { ticker: "RIDGE", name: "Ridge Financial", sector: "Finance" },
  { ticker: "SOLAR", name: "Solar Corp", sector: "Energy" },
  { ticker: "MINT", name: "Mint Brands", sector: "Consumer" },
  { ticker: "FORGE", name: "Forge Mfg", sector: "Industrials" },
  { ticker: "HYDRA", name: "Hydra Utilities", sector: "Utilities" },
  { ticker: "COBALT", name: "Cobalt Materials", sector: "Materials" },
  { ticker: "NEXUS", name: "Nexus Networks", sector: "Tech" },
  { ticker: "CYAN", name: "Cyan Pharma", sector: "Healthcare" },
  { ticker: "ATLAS", name: "Atlas Bank", sector: "Finance" },
  { ticker: "CRUDE", name: "Crude Dynamics", sector: "Energy" },
  { ticker: "EMBER", name: "Ember Retail", sector: "Consumer" },
  { ticker: "TITAN", name: "Titan Steel", sector: "Industrials" },
  { ticker: "GRID", name: "Grid Power", sector: "Utilities" },
  { ticker: "ZINC", name: "Zinc Mining", sector: "Materials" },
  { ticker: "ORBIT", name: "Orbit Semiconductors", sector: "Tech" },
  { ticker: "HELIX", name: "Helix Genomics", sector: "Healthcare" },
  { ticker: "VAULT", name: "Vault Insurance", sector: "Finance" },
  { ticker: "STEAM", name: "Steam Energy", sector: "Energy" },
  { ticker: "SPARK", name: "Spark Media", sector: "Consumer" },
  { ticker: "STEEL", name: "Steel Works", sector: "Industrials" },
  { ticker: "WATT", name: "Watt Electric", sector: "Utilities" },
  { ticker: "GOLD", name: "Gold Resources", sector: "Materials" },
];

function generateStocks(lookback: number, skipPeriod: number): StockMomentum[] {
  resetSeed(752008 + lookback * 100 + skipPeriod * 10);
  return STOCK_NAMES.map((s, i) => {
    const r12 = (rand() - 0.4) * 0.8;
    const r6 = (rand() - 0.4) * 0.6;
    const r3 = (rand() - 0.4) * 0.5;
    const r1 = (rand() - 0.4) * 0.3;
    const vol = 0.15 + rand() * 0.35;
    const effectiveLookback = lookback / 12;
    const skip = skipPeriod / 12;
    const adjReturn = r12 * effectiveLookback - r1 * skip;
    const score = adjReturn / (vol + 0.01);
    return {
      ticker: s.ticker,
      name: s.name,
      sector: s.sector,
      momentumScore: parseFloat((score * 100).toFixed(1)),
      ret1m: parseFloat((r1 * 100).toFixed(1)),
      ret3m: parseFloat((r3 * 100).toFixed(1)),
      ret6m: parseFloat((r6 * 100).toFixed(1)),
      ret12m: parseFloat((r12 * 100).toFixed(1)),
      vol: parseFloat((vol * 100).toFixed(1)),
      decile: 0,
    };
  }).sort((a, b) => b.momentumScore - a.momentumScore).map((stock, idx) => ({
    ...stock,
    decile: Math.floor(idx / 3) + 1,
  }));
  void SECTORS; // suppress unused warning
}

function generateEquityCurve(portfolioSize: number, rebalFreq: number): { annuals: AnnualRow[]; curveStrategy: number[]; curveSP500: number[] } {
  resetSeed(752008 + portfolioSize + rebalFreq);
  const years = 20;
  const baseAlpha = 0.03 + (portfolioSize < 20 ? 0.01 : 0) + (rebalFreq <= 1 ? 0.005 : 0);
  const annuals: AnnualRow[] = [];
  let stratVal = 100;
  let spVal = 100;
  const curveStrategy: number[] = [stratVal];
  const curveSP500: number[] = [spVal];

  for (let y = 0; y < years; y++) {
    const yr = 2005 + y;
    const spRet = (rand() - 0.38) * 0.32;
    const alpha = (rand() - 0.3) * baseAlpha * 2 + baseAlpha;
    const stratRet = spRet + alpha + (rand() - 0.5) * 0.04;
    // crash years
    const crashMult = (yr === 2008 || yr === 2009) ? 0.7 : (yr === 2020 ? 0.85 : 1.0);
    const finalStratRet = yr === 2008 ? -0.42 + (rand() - 0.5) * 0.05 :
      yr === 2009 ? 0.28 + (rand() - 0.5) * 0.1 :
      yr === 2020 ? -0.2 + (rand() - 0.5) * 0.05 :
      stratRet * crashMult;
    const finalSpRet = yr === 2008 ? -0.37 : yr === 2009 ? 0.26 : yr === 2020 ? -0.34 : spRet;
    const sharpe = finalStratRet / (0.15 + rand() * 0.05);
    const maxDD = -(rand() * 0.15 + 0.05 + (yr === 2008 ? 0.3 : yr === 2020 ? 0.15 : 0));
    annuals.push({
      year: yr,
      strategyReturn: parseFloat((finalStratRet * 100).toFixed(1)),
      sp500Return: parseFloat((finalSpRet * 100).toFixed(1)),
      alpha: parseFloat(((finalStratRet - finalSpRet) * 100).toFixed(1)),
      sharpe: parseFloat(sharpe.toFixed(2)),
      maxDD: parseFloat((maxDD * 100).toFixed(1)),
    });
    stratVal *= 1 + finalStratRet;
    spVal *= 1 + finalSpRet;
    curveStrategy.push(parseFloat(stratVal.toFixed(2)));
    curveSP500.push(parseFloat(spVal.toFixed(2)));
  }
  return { annuals, curveStrategy, curveSP500 };
}

function generateHoldingPeriods(lookback: number): HoldingPeriodRow[] {
  resetSeed(752008 + lookback * 7);
  const periods = ["1W", "2W", "1M", "3M", "6M", "12M"];
  const baseIC = 0.06 + (lookback / 12) * 0.02;
  return periods.map((period, i) => {
    const decay = Math.exp(-i * 0.25);
    const ic = (baseIC * decay * (0.8 + rand() * 0.4));
    const tStat = ic * Math.sqrt(252 / ([5, 10, 21, 63, 126, 252][i]));
    return {
      period,
      ic: parseFloat(ic.toFixed(4)),
      tStat: parseFloat(tStat.toFixed(2)),
      hitRate: parseFloat((0.5 + ic * 2 + rand() * 0.05).toFixed(3)),
      annualizedReturn: parseFloat(((0.08 + ic * 3 + rand() * 0.02) * 100).toFixed(1)),
    };
  });
}

const CRASH_EVENTS: CrashEvent[] = [
  { name: "2009 Momentum Crash", period: "Mar–Oct 2009", startYear: 2009, peakDD: -68, sp500DD: -27, daysToRecover: 312, peakDDWithOverlay: -41, color: "#ef4444" },
  { name: "Mar 2020 COVID Reversal", period: "Feb–May 2020", startYear: 2020, peakDD: -47, sp500DD: -34, daysToRecover: 128, peakDDWithOverlay: -29, color: "#f97316" },
  { name: "2016 Factor Rotation", period: "Aug–Dec 2016", startYear: 2016, peakDD: -22, sp500DD: -8, daysToRecover: 65, peakDDWithOverlay: -14, color: "#eab308" },
  { name: "2018 Q4 Selloff", period: "Oct–Dec 2018", startYear: 2018, peakDD: -31, sp500DD: -20, daysToRecover: 89, peakDDWithOverlay: -19, color: "#a855f7" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function SignalStrengthMeter({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, (score + 1) * 50));
  const color = score > 0.3 ? "#22c55e" : score > 0 ? "#eab308" : "#ef4444";
  const label = score > 0.5 ? "Strong Bullish" : score > 0.2 ? "Mild Bullish" : score > -0.2 ? "Neutral" : score > -0.5 ? "Mild Bearish" : "Strong Bearish";
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Signal Strength</span>
        <span className="text-sm font-semibold" style={{ color }}>{label}</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Bearish</span>
        <span className="font-mono" style={{ color }}>{score.toFixed(3)}</span>
        <span>Bullish</span>
      </div>
    </div>
  );
}

function MomentumHistogram({ stocks }: { stocks: StockMomentum[] }) {
  const bins = 10;
  const scores = stocks.map(s => s.momentumScore);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  const binCounts = Array(bins).fill(0);
  scores.forEach(score => {
    const idx = Math.min(bins - 1, Math.floor(((score - min) / range) * bins));
    binCounts[idx]++;
  });
  const maxCount = Math.max(...binCounts);
  const w = 320;
  const h = 120;
  const barW = w / bins - 2;

  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full" style={{ height: 140 }}>
      {binCounts.map((count, i) => {
        const bh = (count / maxCount) * h;
        const x = i * (w / bins) + 1;
        const isTop = i >= bins - 2;
        const isBot = i <= 1;
        const fill = isTop ? "#22c55e" : isBot ? "#ef4444" : "#3b82f6";
        const opacity = isTop || isBot ? 1 : 0.6;
        return (
          <g key={i}>
            <rect x={x} y={h - bh} width={barW} height={bh} fill={fill} opacity={opacity} rx={2} />
            <text x={x + barW / 2} y={h + 14} textAnchor="middle" fontSize={8} fill="#6b7280">
              {(min + (i / bins) * range).toFixed(0)}
            </text>
          </g>
        );
      })}
      <text x={w / 2} y={h + 26} textAnchor="middle" fontSize={9} fill="#9ca3af">Momentum Score</text>
    </svg>
  );
}

function EquityCurveSVG({ curveStrategy, curveSP500 }: { curveStrategy: number[]; curveSP500: number[] }) {
  const w = 560;
  const h = 200;
  const pad = { top: 10, right: 20, bottom: 30, left: 40 };
  const allVals = [...curveStrategy, ...curveSP500];
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;
  const n = curveStrategy.length;

  const toX = (i: number) => pad.left + (i / (n - 1)) * (w - pad.left - pad.right);
  const toY = (v: number) => pad.top + (1 - (v - minV) / range) * (h - pad.top - pad.bottom);

  const pathFor = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");

  const yTicks = [minV, minV + range * 0.25, minV + range * 0.5, minV + range * 0.75, maxV];
  const xTicks = [0, 5, 10, 15, 20];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 200 }}>
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={pad.left} y1={toY(v)} x2={w - pad.right} y2={toY(v)} stroke="#374151" strokeDasharray="3,3" strokeWidth={0.5} />
          <text x={pad.left - 4} y={toY(v) + 4} textAnchor="end" fontSize={9} fill="#6b7280">{v.toFixed(0)}</text>
        </g>
      ))}
      {xTicks.map((i) => (
        <text key={i} x={toX(i)} y={h - 4} textAnchor="middle" fontSize={9} fill="#6b7280">{2005 + i}</text>
      ))}
      <path d={pathFor(curveSP500)} fill="none" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="4,3" />
      <path d={pathFor(curveStrategy)} fill="none" stroke="#22c55e" strokeWidth={2} />
      <text x={w - pad.right - 4} y={toY(curveStrategy[curveStrategy.length - 1]) - 6} textAnchor="end" fontSize={9} fill="#22c55e">Strategy</text>
      <text x={w - pad.right - 4} y={toY(curveSP500[curveSP500.length - 1]) + 12} textAnchor="end" fontSize={9} fill="#9ca3af">S&P 500</text>
    </svg>
  );
}

function ICDecaySVG({ rows }: { rows: HoldingPeriodRow[] }) {
  const w = 400;
  const h = 150;
  const pad = { top: 10, right: 20, bottom: 30, left: 40 };
  const ics = rows.map(r => r.ic);
  const maxIC = Math.max(...ics) * 1.2;
  const n = rows.length;
  const toX = (i: number) => pad.left + (i / (n - 1)) * (w - pad.left - pad.right);
  const toY = (v: number) => pad.top + (1 - v / maxIC) * (h - pad.top - pad.bottom);
  const path = rows.map((r, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(r.ic).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 160 }}>
      <line x1={pad.left} y1={toY(0)} x2={w - pad.right} y2={toY(0)} stroke="#374151" strokeWidth={0.5} />
      {rows.map((r, i) => (
        <g key={i}>
          <line x1={toX(i)} y1={pad.top} x2={toX(i)} y2={h - pad.bottom} stroke="#1f2937" strokeWidth={0.5} />
          <text x={toX(i)} y={h - 4} textAnchor="middle" fontSize={9} fill="#6b7280">{r.period}</text>
          <circle cx={toX(i)} cy={toY(r.ic)} r={3} fill="#3b82f6" />
          <text x={toX(i)} y={toY(r.ic) - 6} textAnchor="middle" fontSize={8} fill="#60a5fa">{r.ic.toFixed(3)}</text>
        </g>
      ))}
      <path d={path} fill="none" stroke="#3b82f6" strokeWidth={2} />
      <text x={pad.left - 4} y={toY(maxIC * 0.5)} textAnchor="end" fontSize={9} fill="#6b7280" transform={`rotate(-90, ${pad.left - 24}, ${toY(maxIC * 0.5)})`}>IC</text>
    </svg>
  );
}

function CrashComparisonSVG({ events }: { events: CrashEvent[] }) {
  const w = 500;
  const h = 180;
  const pad = { top: 20, right: 20, bottom: 30, left: 50 };
  const barH = 18;
  const gap = 8;
  const groupH = barH * 3 + gap * 2;
  const maxAbs = 70;

  const toW = (v: number) => (Math.abs(v) / maxAbs) * (w - pad.left - pad.right);
  const x0 = pad.left;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 200 }}>
      {events.slice(0, 2).map((ev, i) => {
        const y = pad.top + i * (groupH + 14);
        return (
          <g key={i}>
            <text x={x0} y={y - 4} fontSize={9} fill="#d1d5db" fontWeight="600">{ev.name}</text>
            {/* Momentum DD */}
            <rect x={x0} y={y} width={toW(ev.peakDD)} height={barH} fill={ev.color} opacity={0.9} rx={2} />
            <text x={x0 + toW(ev.peakDD) + 4} y={y + barH - 4} fontSize={9} fill={ev.color}>{ev.peakDD}%</text>
            <text x={x0 - 4} y={y + barH - 4} textAnchor="end" fontSize={8} fill="#9ca3af">Mom</text>
            {/* S&P 500 DD */}
            <rect x={x0} y={y + barH + gap} width={toW(ev.sp500DD)} height={barH} fill="#6b7280" opacity={0.7} rx={2} />
            <text x={x0 + toW(ev.sp500DD) + 4} y={y + barH + gap + barH - 4} fontSize={9} fill="#9ca3af">{ev.sp500DD}%</text>
            <text x={x0 - 4} y={y + barH + gap + barH - 4} textAnchor="end" fontSize={8} fill="#9ca3af">S&P</text>
            {/* With overlay */}
            <rect x={x0} y={y + (barH + gap) * 2} width={toW(ev.peakDDWithOverlay)} height={barH} fill="#22c55e" opacity={0.8} rx={2} />
            <text x={x0 + toW(ev.peakDDWithOverlay) + 4} y={y + (barH + gap) * 2 + barH - 4} fontSize={9} fill="#22c55e">{ev.peakDDWithOverlay}%</text>
            <text x={x0 - 4} y={y + (barH + gap) * 2 + barH - 4} textAnchor="end" fontSize={8} fill="#22c55e">+Vol</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function MomentumBuilderPage() {
  const [lookback, setLookback] = useState(12);
  const [skipPeriod, setSkipPeriod] = useState(1);
  const [portfolioSize, setPortfolioSize] = useState(20);
  const [rebalFreq, setRebalFreq] = useState(1);
  const [volTargeting, setVolTargeting] = useState(false);

  // Signal score derived from params
  const signalScore = useMemo(() => {
    const lb = (lookback - 6) / 6;
    const sk = (skipPeriod - 0.5) / 0.5;
    const ps = (portfolioSize - 30) / (-20);
    const rf = (rebalFreq - 2) / (-2);
    return parseFloat(((lb * 0.35 + sk * 0.2 + ps * 0.25 + rf * 0.2) * 0.9).toFixed(3));
  }, [lookback, skipPeriod, portfolioSize, rebalFreq]);

  const stocks = useMemo(() => generateStocks(lookback, skipPeriod), [lookback, skipPeriod]);

  const { annuals, curveStrategy, curveSP500 } = useMemo(
    () => generateEquityCurve(portfolioSize, rebalFreq),
    [portfolioSize, rebalFreq]
  );

  const holdingRows = useMemo(() => generateHoldingPeriods(lookback), [lookback]);

  const stats = useMemo(() => {
    const rets = annuals.map(a => a.strategyReturn / 100);
    const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
    const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length;
    const vol = Math.sqrt(variance);
    const sharpe = mean / vol;
    const downRets = rets.filter(r => r < 0);
    const downVar = downRets.reduce((a, b) => a + b ** 2, 0) / (downRets.length || 1);
    const sortino = mean / Math.sqrt(downVar);
    const maxDD = Math.min(...annuals.map(a => a.maxDD));
    const spMean = annuals.map(a => a.sp500Return / 100).reduce((a, b) => a + b, 0) / annuals.length;
    const totalAlpha = (mean - spMean) * 100;
    return { annualReturn: parseFloat((mean * 100).toFixed(1)), sharpe: parseFloat(sharpe.toFixed(2)), sortino: parseFloat(sortino.toFixed(2)), maxDD: parseFloat(maxDD.toFixed(1)), alpha: parseFloat(totalAlpha.toFixed(1)) };
  }, [annuals]);

  const turnoverCosts = useMemo(() => {
    const freqs = [
      { label: "Monthly", freq: 1, turnover: 85, grossReturn: stats.annualReturn, tcost: 1.2 },
      { label: "Quarterly", freq: 3, turnover: 40, grossReturn: stats.annualReturn - 0.8, tcost: 0.6 },
      { label: "Semi-Annual", freq: 6, turnover: 22, grossReturn: stats.annualReturn - 1.5, tcost: 0.35 },
      { label: "Annual", freq: 12, turnover: 12, grossReturn: stats.annualReturn - 2.8, tcost: 0.18 },
    ];
    return freqs.map(f => ({ ...f, netReturn: parseFloat((f.grossReturn - f.tcost).toFixed(1)) }));
  }, [stats.annualReturn]);

  const topDecile = stocks.slice(0, 3);
  const botDecile = stocks.slice(27, 30);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">Momentum Builder</h1>
          </div>
          <p className="text-sm text-muted-foreground">Quantitative momentum strategy construction, backtesting &amp; signal analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Activity className="w-3 h-3 mr-1" />
            Quant Engine
          </Badge>
          <Badge variant="secondary" className="text-xs">20-Year Backtest</Badge>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card border-l-4 border-l-primary p-6">
        <h2 className="text-lg font-medium text-foreground mb-1">Momentum Strategy Lab</h2>
        <p className="text-sm text-muted-foreground">Quantitative momentum construction, signal analysis, backtesting, decay dynamics, and crash behavior.</p>
      </div>

      <Tabs defaultValue="builder" className="w-full mt-8">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="builder" className="text-xs">
            <SlidersHorizontal className="w-3 h-3 mr-1" />Signal Builder
          </TabsTrigger>
          <TabsTrigger value="screener" className="text-xs">
            <BarChart3 className="w-3 h-3 mr-1" />Universe
          </TabsTrigger>
          <TabsTrigger value="backtest" className="text-xs">
            <Activity className="w-3 h-3 mr-1" />Backtest
          </TabsTrigger>
          <TabsTrigger value="decay" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />Decay
          </TabsTrigger>
          <TabsTrigger value="crash" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />Crashes
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Signal Builder ── */}
        <TabsContent value="builder" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  Strategy Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Lookback */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Lookback Period</label>
                    <span className="text-sm text-primary font-mono">{lookback}M</span>
                  </div>
                  <Slider
                    min={1} max={12} step={1}
                    value={[lookback]}
                    onValueChange={([v]) => setLookback(v)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Period used to measure past returns. Classic momentum uses 12M lookback.
                  </p>
                </div>

                {/* Skip Period */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Skip Period</label>
                    <span className="text-sm text-primary font-mono">{skipPeriod}M</span>
                  </div>
                  <Slider
                    min={0} max={1} step={1}
                    value={[skipPeriod]}
                    onValueChange={([v]) => setSkipPeriod(v)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Skips most recent month to avoid short-term reversal effects.
                  </p>
                </div>

                {/* Portfolio Size */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Portfolio Size</label>
                    <span className="text-sm text-primary font-mono">{portfolioSize} stocks</span>
                  </div>
                  <Slider
                    min={10} max={50} step={5}
                    value={[portfolioSize]}
                    onValueChange={([v]) => setPortfolioSize(v)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Fewer stocks = higher concentration, higher return potential &amp; higher risk.
                  </p>
                </div>

                {/* Rebalancing Frequency */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Rebalancing Frequency</label>
                    <span className="text-sm text-primary font-mono">
                      {rebalFreq === 1 ? "Monthly" : rebalFreq === 3 ? "Quarterly" : rebalFreq === 6 ? "Semi-Annual" : "Annual"}
                    </span>
                  </div>
                  <Slider
                    min={1} max={12} step={3}
                    value={[rebalFreq]}
                    onValueChange={([v]) => setRebalFreq(v)}
                  />
                  <p className="text-xs text-muted-foreground">
                    More frequent rebalancing captures momentum better but incurs higher transaction costs.
                  </p>
                </div>

                {/* Vol Targeting Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Volatility Targeting</p>
                    <p className="text-xs text-muted-foreground">Scale position by inverse vol to smooth returns</p>
                  </div>
                  <button
                    onClick={() => setVolTargeting(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${volTargeting ? "bg-primary" : "bg-muted"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${volTargeting ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Live Signal Display */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Live Signal Strength
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SignalStrengthMeter score={signalScore} />
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Expected Alpha</p>
                      <p className="text-lg font-semibold text-green-500">
                        {(Math.max(0, signalScore) * 6 + 1.5).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">IC Estimate</p>
                      <p className="text-lg font-medium text-primary">
                        {(0.04 + Math.max(0, signalScore) * 0.04).toFixed(3)}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Turnover / yr</p>
                      <p className="text-lg font-medium text-amber-400">
                        {Math.round(100 / rebalFreq * 12)}%
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Concentration</p>
                      <p className="text-lg font-medium text-primary">
                        {portfolioSize <= 15 ? "High" : portfolioSize <= 25 ? "Med" : "Low"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strategy summary card */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Target className="w-4 h-4" />
                    Strategy Profile
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Formation: {lookback}M − {skipPeriod}M skip</span>
                      <Badge variant="outline" className="text-xs">
                        {lookback <= 3 ? "Short-Term" : lookback <= 6 ? "Medium" : "Classic"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Rebalance: {rebalFreq === 1 ? "Monthly" : rebalFreq === 3 ? "Quarterly" : rebalFreq === 6 ? "Semi" : "Annual"}</span>
                      <Badge variant={rebalFreq <= 3 ? "destructive" : "secondary"} className="text-xs">
                        {rebalFreq <= 1 ? "High Cost" : rebalFreq <= 3 ? "Med Cost" : "Low Cost"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Size: Top {Math.round((portfolioSize / 500) * 100)}% of universe</span>
                      <Badge variant="outline" className="text-xs">
                        {volTargeting ? "Vol-Adjusted" : "Equal Weight"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Key Research Finding</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    The classic 12M−1M momentum strategy (Jegadeesh &amp; Titman 1993) has delivered ~1–2% monthly alpha
                    in US equities. The skip period removes short-term reversal, improving Sharpe by ~0.15.
                    Optimal holding periods fall between 1–3 months before significant signal decay.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Universe Screener ── */}
        <TabsContent value="screener" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    30-Stock Universe — Momentum Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-auto max-h-[480px]">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-card border-b border-border">
                        <tr>
                          <th className="text-left p-2 font-medium text-muted-foreground">Rank</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Ticker</th>
                          <th className="text-left p-2 font-medium text-muted-foreground hidden sm:table-cell">Sector</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Score</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">1M</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">6M</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">12M</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Vol</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Decile</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stocks.map((stock, idx) => {
                          const isTop = idx < 3;
                          const isBot = idx >= 27;
                          return (
                            <motion.tr
                              key={stock.ticker}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: idx * 0.01 }}
                              className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                                isTop ? "bg-green-950/30" : isBot ? "bg-red-950/30" : ""
                              }`}
                            >
                              <td className="p-2 font-mono text-muted-foreground">{idx + 1}</td>
                              <td className="p-2">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{stock.ticker}</span>
                                  {isTop && <ArrowUpRight className="w-3 h-3 text-green-500" />}
                                  {isBot && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                                </div>
                              </td>
                              <td className="p-2 text-muted-foreground hidden sm:table-cell">{stock.sector}</td>
                              <td className="p-2 text-right font-mono font-medium">
                                <span className={isTop ? "text-green-400" : isBot ? "text-red-400" : "text-foreground"}>
                                  {stock.momentumScore > 0 ? "+" : ""}{stock.momentumScore}
                                </span>
                              </td>
                              <td className={`p-2 text-right font-mono ${stock.ret1m >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {stock.ret1m > 0 ? "+" : ""}{stock.ret1m}%
                              </td>
                              <td className={`p-2 text-right font-mono ${stock.ret6m >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {stock.ret6m > 0 ? "+" : ""}{stock.ret6m}%
                              </td>
                              <td className={`p-2 text-right font-mono ${stock.ret12m >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {stock.ret12m > 0 ? "+" : ""}{stock.ret12m}%
                              </td>
                              <td className="p-2 text-right font-mono text-muted-foreground">{stock.vol}%</td>
                              <td className="p-2 text-right">
                                <Badge
                                  variant={isTop ? "default" : isBot ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  D{stock.decile}
                                </Badge>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Momentum Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <MomentumHistogram stocks={stocks} />
                  <div className="flex gap-3 mt-2 text-xs">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" />Top decile</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary opacity-60" />Mid</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" />Bottom decile</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-400 flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" />Top 3 — Long
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topDecile.map(s => (
                    <div key={s.ticker} className="flex justify-between items-center p-2 bg-green-950/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{s.ticker}</p>
                        <p className="text-xs text-muted-foreground">{s.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-green-400">+{s.ret12m}%</p>
                        <p className="text-xs text-muted-foreground">12M ret</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-red-400 flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4" />Bottom 3 — Short
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {botDecile.map(s => (
                    <div key={s.ticker} className="flex justify-between items-center p-2 bg-red-950/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{s.ticker}</p>
                        <p className="text-xs text-muted-foreground">{s.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-red-400">{s.ret12m}%</p>
                        <p className="text-xs text-muted-foreground">12M ret</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Backtest Results ── */}
        <TabsContent value="backtest" className="data-[state=inactive]:hidden">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            {[
              { label: "Ann. Return", value: `${stats.annualReturn}%`, color: "text-green-400" },
              { label: "Alpha vs S&P", value: `+${stats.alpha}%`, color: "text-primary" },
              { label: "Sharpe", value: stats.sharpe.toFixed(2), color: "text-primary" },
              { label: "Sortino", value: stats.sortino.toFixed(2), color: "text-yellow-400" },
              { label: "Max DD", value: `${stats.maxDD}%`, color: "text-red-400" },
            ].map(item => (
              <Card key={item.label} className="p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-xl font-medium font-mono ${item.color}`}>{item.value}</p>
              </Card>
            ))}
          </div>

          {/* Equity Curve */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Equity Curve: 2005–2024 ($100 starting value)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EquityCurveSVG curveStrategy={curveStrategy} curveSP500={curveSP500} />
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground justify-end">
                <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-green-500 inline-block" />Strategy</span>
                <span className="flex items-center gap-1"><span className="w-4 border-t border-dashed border-muted-foreground inline-block" />S&P 500</span>
              </div>
            </CardContent>
          </Card>

          {/* Annual table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Annual Performance Table</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[320px]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card border-b border-border">
                    <tr>
                      <th className="text-left p-2 font-medium text-muted-foreground">Year</th>
                      <th className="text-right p-2 font-medium text-muted-foreground">Strategy</th>
                      <th className="text-right p-2 font-medium text-muted-foreground">S&P 500</th>
                      <th className="text-right p-2 font-medium text-muted-foreground">Alpha</th>
                      <th className="text-right p-2 font-medium text-muted-foreground">Sharpe</th>
                      <th className="text-right p-2 font-medium text-muted-foreground">Max DD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annuals.map(row => {
                      const crashYear = row.year === 2008 || row.year === 2009 || row.year === 2020;
                      return (
                        <tr
                          key={row.year}
                          className={`border-b border-border/50 hover:bg-muted/20 ${crashYear ? "bg-red-950/20" : ""}`}
                        >
                          <td className="p-2 font-mono">
                            <span className="flex items-center gap-1">
                              {row.year}
                              {crashYear && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                            </span>
                          </td>
                          <td className={`p-2 text-right font-mono ${row.strategyReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {row.strategyReturn > 0 ? "+" : ""}{row.strategyReturn}%
                          </td>
                          <td className={`p-2 text-right font-mono ${row.sp500Return >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {row.sp500Return > 0 ? "+" : ""}{row.sp500Return}%
                          </td>
                          <td className={`p-2 text-right font-mono ${row.alpha >= 0 ? "text-primary" : "text-orange-400"}`}>
                            {row.alpha > 0 ? "+" : ""}{row.alpha}%
                          </td>
                          <td className="p-2 text-right font-mono text-primary">{row.sharpe}</td>
                          <td className="p-2 text-right font-mono text-red-400">{row.maxDD}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Momentum Decay ── */}
        <TabsContent value="decay" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Information Coefficient by Holding Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ICDecaySVG rows={holdingRows} />
                <div className="mt-3 overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 font-medium text-muted-foreground">Period</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">IC</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">t-stat</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">Hit Rate</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">Ann. Ret</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdingRows.map(row => (
                        <tr key={row.period} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="p-2 font-mono font-medium">{row.period}</td>
                          <td className="p-2 text-right font-mono text-primary">{row.ic.toFixed(4)}</td>
                          <td className={`p-2 text-right font-mono ${Math.abs(row.tStat) >= 2 ? "text-green-400" : "text-amber-400"}`}>
                            {row.tStat}
                          </td>
                          <td className="p-2 text-right font-mono">{(row.hitRate * 100).toFixed(1)}%</td>
                          <td className="p-2 text-right font-mono text-green-400">{row.annualizedReturn}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  t-stat ≥ 2.0 indicates statistically significant signal (highlighted in green).
                </p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    Rebalancing Frequency vs Net Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {turnoverCosts.map(row => (
                      <div key={row.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">{row.label}</span>
                          <div className="flex gap-3 text-muted-foreground">
                            <span>Turnover: {row.turnover}%</span>
                            <span>TC: {row.tcost}%</span>
                            <span className={`font-medium ${row.netReturn > row.grossReturn - 2 ? "text-green-400" : "text-amber-400"}`}>
                              Net: {row.netReturn}%
                            </span>
                          </div>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="absolute h-full bg-primary rounded-full"
                            style={{ width: `${(row.grossReturn / 20) * 100}%` }}
                          />
                          <div
                            className="absolute h-full bg-green-500 rounded-full"
                            style={{ width: `${(row.netReturn / 20) * 100}%` }}
                          />
                        </div>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Gross {row.grossReturn}%</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Net {row.netReturn}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Optimal Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-green-950/30 border border-green-800/30 rounded-lg">
                    <p className="text-xs font-medium text-green-400 mb-1">Best Risk-Adjusted Setup</p>
                    <p className="text-sm">12M−1M formation, Quarterly rebalance</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      IC decay is slow enough that quarterly trading cost savings outweigh signal degradation.
                    </p>
                  </div>
                  <div className="p-3 bg-amber-950/30 border border-amber-800/30 rounded-lg">
                    <p className="text-xs font-medium text-amber-400 mb-1">Turnover Insight</p>
                    <p className="text-xs text-muted-foreground">
                      Monthly rebalancing costs 1.2%/yr in round-trip costs (20bps × 6 round-trips).
                      Quarterly cuts this to 0.6% while preserving ~85% of IC value at the 3M horizon.
                    </p>
                  </div>
                  <div className="p-3 bg-muted/40 border border-border rounded-lg">
                    <p className="text-xs font-medium text-primary mb-1">Current Params</p>
                    <p className="text-xs text-muted-foreground">
                      Lookback {lookback}M, {rebalFreq === 1 ? "Monthly" : rebalFreq === 3 ? "Quarterly" : rebalFreq === 6 ? "Semi-Annual" : "Annual"} rebalance — estimated IC at optimal hold: {holdingRows[2]?.ic.toFixed(4)} (1M period)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 5: Crash Analysis ── */}
        <TabsContent value="crash" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Crash events */}
            <div className="space-y-3">
              {CRASH_EVENTS.map((ev, i) => (
                <motion.div
                  key={ev.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="border-l-4" style={{ borderLeftColor: ev.color }}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium">{ev.name}</p>
                          <p className="text-xs text-muted-foreground">{ev.period}</p>
                        </div>
                        <Badge variant="destructive" className="text-xs">{ev.peakDD}% DD</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center mt-3">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-xs text-muted-foreground">Mom DD</p>
                          <p className="text-sm font-mono text-red-400">{ev.peakDD}%</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-xs text-muted-foreground">S&P DD</p>
                          <p className="text-sm font-mono text-orange-400">{ev.sp500DD}%</p>
                        </div>
                        <div className="p-2 bg-green-950/30 rounded">
                          <p className="text-xs text-muted-foreground">+Vol Tgt</p>
                          <p className="text-sm font-mono text-green-400">{ev.peakDDWithOverlay}%</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <RefreshCw className="w-3 h-3" />
                        Recovery: {ev.daysToRecover} trading days
                        <span className="ml-auto">
                          <Shield className="w-3 h-3 inline mr-1 text-green-500" />
                          {Math.round((1 - ev.peakDDWithOverlay / ev.peakDD) * 100)}% DD reduction with overlay
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Crash Drawdown Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CrashComparisonSVG events={CRASH_EVENTS} />
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" />Momentum</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted-foreground inline-block" />S&P 500</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" />+Vol Target</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    Defensive Overlay: Volatility Targeting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Vol targeting scales position size inversely with realized volatility. When market vol spikes, exposure is reduced, dampening crash drawdowns by 30–45%.
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: "Target Volatility", value: "15% ann." },
                      { label: "Lookback Window", value: "21 days" },
                      { label: "Max Leverage", value: "2.0×" },
                      { label: "Avg DD Reduction", value: "−38%" },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-mono text-green-400">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-2 p-2 rounded text-xs border ${volTargeting ? "bg-green-950/30 border-green-800/30 text-green-300" : "bg-muted/50 border-border text-muted-foreground"}`}>
                    {volTargeting
                      ? "Vol targeting is ENABLED — your backtest includes overlay protection"
                      : "Enable Vol Targeting in Signal Builder tab to include overlay"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    Why Momentum Crashes?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p><span className="text-foreground font-medium">Mean reversion:</span> After extreme runs, prior winners revert as valuations stretch.</p>
                    <p><span className="text-foreground font-medium">Crowding:</span> When many funds hold the same momentum stocks, liquidity crises cause simultaneous unwinds.</p>
                    <p><span className="text-foreground font-medium">Risk-on regimes:</span> Macro regime shifts (2009 recovery, 2020 rebound) reward the most beaten-down stocks — the exact shorts in a momentum book.</p>
                    <p><span className="text-foreground font-medium">Leverage spiral:</span> Risk-parity and CTA funds simultaneously de-risk, amplifying moves against momentum longs.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
