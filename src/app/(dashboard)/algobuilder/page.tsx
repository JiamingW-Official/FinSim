"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Play,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Bell,
  BellRing,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Layers,
  Settings,
  Eye,
  Filter,
  Download,
  GitCompare,
  Cpu,
  Gauge,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stable top-level PRNG instance (seed = 1984)
const rng = mulberry32(1984);
function stableRng(calls: number) {
  const r = mulberry32(1984);
  for (let i = 0; i < calls; i++) r();
  return r();
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SignalCategory = "trend" | "mean-reversion" | "momentum" | "volume" | "sentiment" | "fundamental" | "alternative";
type SignalRating = "A" | "B" | "C";
type EntryLogic = "AND" | "OR";
type ExitType = "opposite" | "profit-target" | "stop-loss" | "time" | "trailing";
type Universe = "sp500" | "nasdaq100" | "russell1000" | "custom";
type Rebalancing = "daily" | "weekly" | "monthly" | "signal";
type Sizing = "equal" | "vol-target" | "momentum";

interface Signal {
  id: string;
  name: string;
  category: SignalCategory;
  description: string;
  winRate: number;
  avgReturn: number;
  maxDrawdown: number;
  tradesPerYear: number;
  rating: SignalRating;
  correlation: Record<string, number>;
}

interface StrategyConfig {
  signals: string[];
  entryLogic: EntryLogic;
  exits: ExitType[];
  profitTarget: number;
  stopLoss: number;
  timeExit: number;
  trailingStop: number;
  universe: Universe;
  rebalancing: Rebalancing;
  sizing: Sizing;
}

interface BacktestResult {
  totalReturn: number;
  cagr: number;
  sharpe: number;
  sortino: number;
  calmar: number;
  maxDrawdown: number;
  avgDrawdown: number;
  recoveryDays: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  annualTurnover: number;
  numTrades: number;
  equityCurve: number[];
  drawdownCurve: number[];
  monthlyReturns: number[][];
  rolling12m: number[];
  spyReturn: number;
  spyCurve: number[];
}

interface LiveSignal {
  id: string;
  ticker: string;
  signalType: string;
  strength: number;
  entryPrice: number;
  positionSize: number;
  timestamp: string;
  direction: "long" | "short";
}

// ── Category Metadata ─────────────────────────────────────────────────────────

const CAT_META: Record<SignalCategory, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  trend:           { label: "Trend",           color: "text-primary",   bg: "bg-primary/10",   icon: <TrendingUp size={12} /> },
  "mean-reversion":{ label: "Mean Reversion",  color: "text-amber-400",  bg: "bg-amber-500/10",  icon: <RefreshCw size={12} /> },
  momentum:        { label: "Momentum",        color: "text-primary", bg: "bg-primary/10", icon: <Zap size={12} /> },
  volume:          { label: "Volume",          color: "text-emerald-400",   bg: "bg-teal-500/10",   icon: <BarChart2 size={12} /> },
  sentiment:       { label: "Sentiment",       color: "text-pink-400",   bg: "bg-pink-500/10",   icon: <Activity size={12} /> },
  fundamental:     { label: "Fundamental",     color: "text-emerald-400",bg: "bg-emerald-500/10",icon: <Target size={12} /> },
  alternative:     { label: "Alternative",     color: "text-orange-400", bg: "bg-orange-500/10", icon: <Eye size={12} /> },
};

// ── Signal Library ─────────────────────────────────────────────────────────────

const SIGNALS: Signal[] = [
  // Trend
  {
    id: "ma-golden-cross",
    name: "50MA × 200MA Golden Cross",
    category: "trend",
    description: "50-day MA crosses above 200-day MA — classic trend-following entry",
    winRate: 61, avgReturn: 14.2, maxDrawdown: -18.3, tradesPerYear: 2.4,
    rating: "A",
    correlation: { "ema-ribbon": 0.82, "adx-25": 0.65, "donchian-breakout": 0.71 },
  },
  {
    id: "ema-ribbon",
    name: "EMA Ribbon Alignment",
    category: "trend",
    description: "8/13/21/34 EMAs all aligned upward — strong trend confirmation",
    winRate: 58, avgReturn: 11.8, maxDrawdown: -16.1, tradesPerYear: 4.1,
    rating: "A",
    correlation: { "ma-golden-cross": 0.82, "adx-25": 0.70, "supertrend": 0.77 },
  },
  {
    id: "adx-25",
    name: "ADX > 25 Trend Strength",
    category: "trend",
    description: "ADX above 25 confirms strong trending regime — use with direction filter",
    winRate: 55, avgReturn: 9.4, maxDrawdown: -12.8, tradesPerYear: 8.6,
    rating: "B",
    correlation: { "ma-golden-cross": 0.65, "ema-ribbon": 0.70, "momentum-12-1": 0.58 },
  },
  {
    id: "donchian-breakout",
    name: "Donchian Channel Breakout",
    category: "trend",
    description: "Price breaks above 20-period Donchian upper band — breakout signal",
    winRate: 49, avgReturn: 18.7, maxDrawdown: -24.5, tradesPerYear: 12.3,
    rating: "B",
    correlation: { "ma-golden-cross": 0.71, "volume-thrust": 0.55, "momentum-12-1": 0.62 },
  },
  {
    id: "supertrend",
    name: "SuperTrend Flip",
    category: "trend",
    description: "Price flips above SuperTrend(10, 3) line — adaptive trend signal",
    winRate: 57, avgReturn: 12.1, maxDrawdown: -15.4, tradesPerYear: 6.8,
    rating: "A",
    correlation: { "ema-ribbon": 0.77, "adx-25": 0.61, "macd-histogram": 0.48 },
  },
  // Mean Reversion
  {
    id: "rsi-30-bounce",
    name: "RSI < 30 Bounce",
    category: "mean-reversion",
    description: "RSI drops below 30 then recrosses — oversold mean reversion entry",
    winRate: 64, avgReturn: 7.3, maxDrawdown: -11.2, tradesPerYear: 18.4,
    rating: "A",
    correlation: { "bb-squeeze": 0.59, "zscore-dev": 0.72, "pair-spread": 0.31 },
  },
  {
    id: "bb-squeeze",
    name: "Bollinger Band Squeeze",
    category: "mean-reversion",
    description: "BB width contracts to 1-year low — volatility expansion imminent",
    winRate: 52, avgReturn: 8.9, maxDrawdown: -13.7, tradesPerYear: 14.2,
    rating: "B",
    correlation: { "rsi-30-bounce": 0.59, "zscore-dev": 0.64, "volume-thrust": 0.41 },
  },
  {
    id: "zscore-dev",
    name: "Z-Score Deviation",
    category: "mean-reversion",
    description: "Price z-score > 2.0 SD from 60-day mean — statistical mean reversion",
    winRate: 66, avgReturn: 5.8, maxDrawdown: -9.4, tradesPerYear: 22.1,
    rating: "A",
    correlation: { "rsi-30-bounce": 0.72, "bb-squeeze": 0.64, "pair-spread": 0.45 },
  },
  {
    id: "pair-spread",
    name: "Pair Spread Mean Reversion",
    category: "mean-reversion",
    description: "Cointegrated pair spread deviates > 2σ — long/short pair trade",
    winRate: 69, avgReturn: 6.1, maxDrawdown: -8.7, tradesPerYear: 31.5,
    rating: "A",
    correlation: { "rsi-30-bounce": 0.31, "zscore-dev": 0.45, "bb-squeeze": 0.38 },
  },
  // Momentum
  {
    id: "momentum-12-1",
    name: "12-1 Month Momentum",
    category: "momentum",
    description: "12-month return excluding last month — Fama-French momentum factor",
    winRate: 59, avgReturn: 13.4, maxDrawdown: -22.1, tradesPerYear: 12.0,
    rating: "A",
    correlation: { "macd-histogram": 0.53, "roc-threshold": 0.77, "adx-25": 0.58 },
  },
  {
    id: "macd-histogram",
    name: "MACD Histogram",
    category: "momentum",
    description: "MACD histogram crosses zero from negative — accelerating momentum",
    winRate: 54, avgReturn: 9.7, maxDrawdown: -14.3, tradesPerYear: 16.8,
    rating: "B",
    correlation: { "momentum-12-1": 0.53, "roc-threshold": 0.68, "supertrend": 0.48 },
  },
  {
    id: "roc-threshold",
    name: "Rate of Change Threshold",
    category: "momentum",
    description: "20-day ROC exceeds +5% threshold — price acceleration signal",
    winRate: 51, avgReturn: 10.2, maxDrawdown: -16.8, tradesPerYear: 24.3,
    rating: "B",
    correlation: { "momentum-12-1": 0.77, "macd-histogram": 0.68, "donchian-breakout": 0.55 },
  },
  // Volume
  {
    id: "obv-breakout",
    name: "OBV Breakout",
    category: "volume",
    description: "On-balance volume breaks above 20-period high — smart money accumulation",
    winRate: 56, avgReturn: 11.3, maxDrawdown: -15.6, tradesPerYear: 9.7,
    rating: "B",
    correlation: { "volume-thrust": 0.73, "adl": 0.61, "donchian-breakout": 0.49 },
  },
  {
    id: "volume-thrust",
    name: "Volume Thrust",
    category: "volume",
    description: "Volume > 2.5× 20-day average with positive close — institutional buying",
    winRate: 62, avgReturn: 8.4, maxDrawdown: -12.1, tradesPerYear: 21.6,
    rating: "B",
    correlation: { "obv-breakout": 0.73, "adl": 0.55, "bb-squeeze": 0.41 },
  },
  {
    id: "adl",
    name: "Accumulation/Distribution Line",
    category: "volume",
    description: "A/D line makes new high while price consolidates — bullish divergence",
    winRate: 58, avgReturn: 9.1, maxDrawdown: -13.4, tradesPerYear: 11.2,
    rating: "B",
    correlation: { "obv-breakout": 0.61, "volume-thrust": 0.55, "macd-histogram": 0.44 },
  },
  // Sentiment
  {
    id: "pcr-extreme",
    name: "Put/Call Ratio Extreme",
    category: "sentiment",
    description: "PCR spikes above 1.4 — excessive fear, contrarian bullish signal",
    winRate: 67, avgReturn: 6.8, maxDrawdown: -9.3, tradesPerYear: 8.3,
    rating: "A",
    correlation: { "vix-spike": 0.81, "short-interest": 0.42 },
  },
  {
    id: "vix-spike",
    name: "VIX Spike/Reversion",
    category: "sentiment",
    description: "VIX spikes > 30 then falls 20%+ — fear peak and mean reversion",
    winRate: 71, avgReturn: 8.2, maxDrawdown: -10.7, tradesPerYear: 5.1,
    rating: "A",
    correlation: { "pcr-extreme": 0.81, "short-interest": 0.38 },
  },
  {
    id: "short-interest",
    name: "Short Interest Extreme",
    category: "sentiment",
    description: "Short float > 25%, days-to-cover > 5 — potential short squeeze setup",
    winRate: 53, avgReturn: 22.4, maxDrawdown: -31.2, tradesPerYear: 6.8,
    rating: "C",
    correlation: { "pcr-extreme": 0.42, "vix-spike": 0.38 },
  },
  // Fundamental
  {
    id: "pe-below-median",
    name: "P/E Below Sector Median",
    category: "fundamental",
    description: "Forward P/E > 30% discount to sector median — value opportunity",
    winRate: 57, avgReturn: 12.8, maxDrawdown: -19.4, tradesPerYear: 4.2,
    rating: "B",
    correlation: { "eps-accel": 0.38, "rev-beat": 0.51 },
  },
  {
    id: "eps-accel",
    name: "EPS Acceleration",
    category: "fundamental",
    description: "EPS growth rate accelerating 3 consecutive quarters — earnings momentum",
    winRate: 63, avgReturn: 15.7, maxDrawdown: -17.8, tradesPerYear: 7.1,
    rating: "A",
    correlation: { "pe-below-median": 0.38, "rev-beat": 0.72 },
  },
  {
    id: "rev-beat",
    name: "Revenue Beat + Raise",
    category: "fundamental",
    description: "Beat revenue estimate AND raised full-year guidance — quality earnings",
    winRate: 68, avgReturn: 11.4, maxDrawdown: -13.2, tradesPerYear: 9.8,
    rating: "A",
    correlation: { "pe-below-median": 0.51, "eps-accel": 0.72 },
  },
  // Alternative
  {
    id: "options-sweep",
    name: "Options Flow Bullish Sweep",
    category: "alternative",
    description: "Large bullish call sweeps > $500K premium — informed flow signal",
    winRate: 61, avgReturn: 16.3, maxDrawdown: -21.7, tradesPerYear: 14.6,
    rating: "B",
    correlation: { "insider-buy": 0.47, "analyst-upgrade": 0.55 },
  },
  {
    id: "insider-buy",
    name: "Insider Cluster Buy",
    category: "alternative",
    description: "3+ insiders purchase shares within 30 days — insider confidence signal",
    winRate: 65, avgReturn: 14.9, maxDrawdown: -18.6, tradesPerYear: 8.2,
    rating: "A",
    correlation: { "options-sweep": 0.47, "analyst-upgrade": 0.61 },
  },
  {
    id: "analyst-upgrade",
    name: "Analyst Upgrade Cluster",
    category: "alternative",
    description: "2+ analyst upgrades within 5 days with PT raise — wall st. conviction",
    winRate: 59, avgReturn: 10.8, maxDrawdown: -14.3, tradesPerYear: 18.4,
    rating: "B",
    correlation: { "options-sweep": 0.55, "insider-buy": 0.61 },
  },
];

// ── SVG Mini-Chart for Signal Cards ──────────────────────────────────────────

function SignalMiniChart({ signalId, rating }: { signalId: string; rating: SignalRating }) {
  const points = useMemo(() => {
    const r = mulberry32(signalId.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
    const pts: number[] = [50];
    for (let i = 1; i < 30; i++) {
      const drift = rating === "A" ? 0.4 : rating === "B" ? 0.15 : -0.1;
      pts.push(Math.max(5, Math.min(95, pts[i - 1] + (r() - 0.5 + drift) * 8)));
    }
    return pts;
  }, [signalId, rating]);

  const color = rating === "A" ? "#34d399" : rating === "B" ? "#60a5fa" : "#f87171";

  const w = 120, h = 40;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const pathD = `M ${coords.join(" L ")}`;
  const areaD = `M 0,${h} L ${coords.join(" L ")} L ${w},${h} Z`;

  // Find signal trigger point (last local min for long signals)
  const triggerIdx = Math.floor(points.length * 0.4);
  const tx = (triggerIdx / (points.length - 1)) * w;
  const ty = h - ((points[triggerIdx] - min) / range) * (h - 4) - 2;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${signalId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${signalId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Trigger marker */}
      <line x1={tx} y1={0} x2={tx} y2={h} stroke={color} strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
      <circle cx={tx} cy={ty} r="3" fill={color} />
    </svg>
  );
}

// ── Equity Curve SVG ─────────────────────────────────────────────────────────

function EquityCurveSVG({ equity, spy, drawdown }: { equity: number[]; spy: number[]; drawdown: number[] }) {
  const w = 600, h = 160, dh = 60;
  const eMin = Math.min(...equity), eMax = Math.max(...equity);
  const sMin = Math.min(...spy), sMax = Math.max(...spy);
  const allMin = Math.min(eMin, sMin), allMax = Math.max(eMax, sMax);
  const range = allMax - allMin || 1;

  const toY = (v: number) => h - ((v - allMin) / range) * (h - 8) - 4;

  const equityPath = equity.map((v, i) => `${(i / (equity.length - 1)) * w},${toY(v)}`).join(" L ");
  const spyPath = spy.map((v, i) => `${(i / (spy.length - 1)) * w},${toY(v)}`).join(" L ");

  const ddMin = Math.min(...drawdown);
  const toDD = (v: number) => dh - (v / ddMin) * (dh - 4) - 2;
  const ddPath = drawdown.map((v, i) => `${(i / (drawdown.length - 1)) * w},${toDD(v)}`).join(" L ");
  const ddArea = `M 0,2 L ${ddPath} L ${w},2 Z`;

  // Y axis labels
  const yLabels = [0, 25, 50, 75, 100].map(pct => {
    const val = allMin + (pct / 100) * range;
    return { pct, val: val.toFixed(0) };
  });

  return (
    <div className="space-y-1">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        <defs>
          <linearGradient id="equity-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid */}
        {yLabels.map(({ pct, val }) => {
          const y = h - (pct / 100) * (h - 8) - 4;
          return (
            <g key={pct}>
              <line x1={0} y1={y} x2={w} y2={y} stroke="#374151" strokeWidth="1" />
              <text x={-4} y={y + 4} textAnchor="end" fill="#6b7280" fontSize="10">{val}%</text>
            </g>
          );
        })}
        {/* SPY */}
        <path d={`M ${spyPath}`} fill="none" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4,3" />
        {/* Equity area */}
        <path
          d={`M 0,${toY(equity[0])} L ${equityPath} L ${w},${h} L 0,${h} Z`}
          fill="url(#equity-grad)"
        />
        <path d={`M ${equityPath}`} fill="none" stroke="#34d399" strokeWidth="2" />
      </svg>
      {/* Drawdown panel */}
      <svg width="100%" viewBox={`0 0 ${w} ${dh}`} className="overflow-visible">
        <path d={ddArea} fill="#ef444420" />
        <path d={`M ${ddPath}`} fill="none" stroke="#ef4444" strokeWidth="1.5" />
        <text x={2} y={12} fill="#6b7280" fontSize="10">Drawdown</text>
        <text x={w - 2} y={12} textAnchor="end" fill="#ef4444" fontSize="10">{drawdown[drawdown.length - 1].toFixed(1)}%</text>
      </svg>
      <div className="flex gap-4 text-[11px] text-muted-foreground mt-1">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-400 inline-block" /> Strategy</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-muted-foreground inline-block border-dashed border-b" /> SPY Benchmark</span>
      </div>
    </div>
  );
}

// ── Monthly Returns Heatmap ──────────────────────────────────────────────────

function MonthlyHeatmap({ data }: { data: number[][] }) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = ["2020", "2021", "2022", "2023", "2024"];
  const maxAbs = Math.max(...data.flat().map(Math.abs), 0.01);

  return (
    <div className="overflow-x-auto">
      <table className="text-[11px] border-separate border-spacing-0.5 w-full">
        <thead>
          <tr>
            <th className="text-left text-muted-foreground font-normal pr-2 pb-1">Year</th>
            {months.map(m => <th key={m} className="text-center text-muted-foreground font-normal pb-1 w-8">{m}</th>)}
            <th className="text-center text-muted-foreground font-normal pb-1 pl-2">Ann.</th>
          </tr>
        </thead>
        <tbody>
          {years.map((year, yi) => {
            const annualized = data[yi].reduce((acc, r) => acc * (1 + r / 100), 1) - 1;
            return (
              <tr key={year}>
                <td className="text-muted-foreground pr-2 py-0.5">{year}</td>
                {data[yi].map((ret, mi) => {
                  const intensity = Math.abs(ret) / maxAbs;
                  const isPos = ret >= 0;
                  return (
                    <td key={mi} className="text-center py-0.5">
                      <div
                        className={cn(
                          "rounded px-1 py-0.5 text-xs font-mono",
                          isPos ? "text-emerald-300" : "text-red-300"
                        )}
                        style={{
                          backgroundColor: isPos
                            ? `rgba(52,211,153,${intensity * 0.5})`
                            : `rgba(239,68,68,${intensity * 0.5})`,
                        }}
                      >
                        {ret > 0 ? "+" : ""}{ret.toFixed(1)}
                      </div>
                    </td>
                  );
                })}
                <td className="text-center pl-2 py-0.5">
                  <span className={cn("font-mono font-medium", annualized >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {annualized >= 0 ? "+" : ""}{(annualized * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Rolling 12-Month Chart ────────────────────────────────────────────────────

function Rolling12mChart({ data }: { data: number[] }) {
  const w = 500, h = 80;
  const min = Math.min(...data, -5), max = Math.max(...data, 5);
  const range = max - min;
  const toY = (v: number) => h - ((v - min) / range) * (h - 8) - 4;
  const zero = toY(0);

  const coords = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: toY(v) }));
  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x},${c.y}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <line x1={0} y1={zero} x2={w} y2={zero} stroke="#374151" strokeWidth="1" />
      {/* Fill above zero */}
      <path
        d={`M 0,${zero} ${coords.map(c => `L ${c.x},${Math.min(c.y, zero)}`).join(" ")} L ${w},${zero} Z`}
        fill="#34d39930"
      />
      {/* Fill below zero */}
      <path
        d={`M 0,${zero} ${coords.map(c => `L ${c.x},${Math.max(c.y, zero)}`).join(" ")} L ${w},${zero} Z`}
        fill="#ef444430"
      />
      <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth="1.5" />
    </svg>
  );
}

// ── Factor Exposure Bar Chart ─────────────────────────────────────────────────

function FactorExposureChart({ factors }: { factors: { name: string; beta: number; ci: number }[] }) {
  const w = 300, barH = 20, gap = 8;
  const maxAbs = Math.max(...factors.map(f => Math.abs(f.beta) + f.ci), 0.01);
  const scale = (v: number) => (v / maxAbs) * (w / 2 - 10);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${factors.length * (barH + gap)}`} className="overflow-visible">
      {/* Center axis */}
      <line x1={w / 2} y1={0} x2={w / 2} y2={factors.length * (barH + gap)} stroke="#374151" strokeWidth="1" />
      {factors.map((f, i) => {
        const y = i * (barH + gap);
        const cx = w / 2;
        const barW = Math.abs(scale(f.beta));
        const isPos = f.beta >= 0;
        const barX = isPos ? cx : cx - barW;
        const ciLeft = cx + scale(f.beta) - scale(f.ci);
        const ciRight = cx + scale(f.beta) + scale(f.ci);
        return (
          <g key={f.name}>
            <text x={cx - 6} y={y + barH / 2 + 4} textAnchor="end" fill="#9ca3af" fontSize="11">{f.name}</text>
            <rect x={barX} y={y + 2} width={barW} height={barH - 4} rx={2}
              fill={isPos ? "#3b82f640" : "#ef444440"}
              stroke={isPos ? "#3b82f6" : "#ef4444"}
              strokeWidth="1"
            />
            {/* Confidence interval */}
            <line x1={Math.max(0, ciLeft)} y1={y + barH / 2} x2={Math.min(w, ciRight)} y2={y + barH / 2}
              stroke={isPos ? "#60a5fa" : "#f87171"} strokeWidth="1.5" />
            <line x1={Math.max(0, ciLeft)} y1={y + 4} x2={Math.max(0, ciLeft)} y2={y + barH - 4}
              stroke={isPos ? "#60a5fa" : "#f87171"} strokeWidth="1.5" />
            <line x1={Math.min(w, ciRight)} y1={y + 4} x2={Math.min(w, ciRight)} y2={y + barH - 4}
              stroke={isPos ? "#60a5fa" : "#f87171"} strokeWidth="1.5" />
            <text x={isPos ? cx + barW + 8 + scale(f.ci) : cx - barW - scale(f.ci) - 8}
              y={y + barH / 2 + 4}
              textAnchor={isPos ? "start" : "end"}
              fill={isPos ? "#60a5fa" : "#f87171"} fontSize="11"
            >
              {f.beta > 0 ? "+" : ""}{f.beta.toFixed(2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Signal Strength Histogram ─────────────────────────────────────────────────

function SignalHistogram({ signals }: { signals: LiveSignal[] }) {
  const buckets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => ({
    range: `${i * 10}-${(i + 1) * 10}`,
    count: signals.filter(s => s.strength >= i * 10 && s.strength < (i + 1) * 10).length,
  }));
  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  const w = 300, h = 80;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      {buckets.map((b, i) => {
        const barH = (b.count / maxCount) * (h - 20);
        const x = i * (w / buckets.length) + 2;
        const bw = w / buckets.length - 4;
        return (
          <g key={i}>
            <rect x={x} y={h - 20 - barH} width={bw} height={barH} rx={2}
              fill={i >= 7 ? "#34d39980" : i >= 4 ? "#60a5fa80" : "#f8717180"}
            />
          </g>
        );
      })}
      <line x1={0} y1={h - 20} x2={w} y2={h - 20} stroke="#374151" strokeWidth="1" />
      <text x={0} y={h - 6} fill="#6b7280" fontSize="9">0</text>
      <text x={w / 2} y={h - 6} textAnchor="middle" fill="#6b7280" fontSize="9">Strength 50</text>
      <text x={w} y={h - 6} textAnchor="end" fill="#6b7280" fontSize="9">100</text>
    </svg>
  );
}

// ── Generate Backtest ─────────────────────────────────────────────────────────

function generateBacktest(signals: string[], strategy: StrategyConfig): BacktestResult {
  const r = mulberry32(1984 + signals.length * 31 + signals.reduce((a, s) => a + s.charCodeAt(0), 0));

  // Base metrics influenced by signal quality
  const avgRating = signals.reduce((acc, id) => {
    const sig = SIGNALS.find(s => s.id === id);
    return acc + (sig ? (sig.rating === "A" ? 3 : sig.rating === "B" ? 2 : 1) : 2);
  }, 0) / Math.max(signals.length, 1);

  const numSignals = signals.length;
  const diversification = numSignals >= 2 ? 1.15 : 1.0;

  const baseReturn = 8 + avgRating * 4 + r() * 6;
  const cagr = baseReturn * diversification * (0.85 + r() * 0.3);
  const sharpe = 0.6 + avgRating * 0.3 + r() * 0.4;
  const sortino = sharpe * (1.2 + r() * 0.3);
  const maxDD = -(12 + r() * 18 + (3 - avgRating) * 4);
  const calmar = cagr / Math.abs(maxDD);
  const winRate = 50 + avgRating * 5 + r() * 10;
  const avgWin = 3 + r() * 5;
  const avgLoss = -(1.5 + r() * 2.5);
  const profitFactor = (winRate / 100 * avgWin) / ((1 - winRate / 100) * Math.abs(avgLoss));
  const numTrades = Math.floor(20 + r() * 60 * numSignals);
  const turnover = Math.floor(50 + r() * 200);

  // Equity curve (5 years, 260 bars each = 1300 bars)
  const n = 260;
  const equity: number[] = [100];
  const spy: number[] = [100];
  const drawdown: number[] = [0];
  const monthlyReturns: number[][] = Array.from({ length: 5 }, () => []);

  let peak = 100;
  let spyPeak = 100;

  for (let year = 0; year < 5; year++) {
    for (let day = 0; day < n; day++) {
      const i = year * n + day;
      const drift = cagr / 100 / n;
      const vol = (Math.abs(maxDD) / 100) / Math.sqrt(n) * 2;
      const ret = drift + (r() - 0.5) * vol * 2.5;
      const newEq = equity[i] * (1 + ret);
      equity.push(newEq);

      const spyDrift = 0.10 / n;
      const spyVol = 0.16 / Math.sqrt(n);
      const spyRet = spyDrift + (r() - 0.5) * spyVol * 2;
      spy.push(spy[i] * (1 + spyRet));

      peak = Math.max(peak, newEq);
      const dd = ((newEq - peak) / peak) * 100;
      drawdown.push(dd);

      if (day % Math.floor(n / 12) === 0 && monthlyReturns[year].length < 12) {
        const monthRet = (ret * Math.floor(n / 12)) * 100 + (r() - 0.5) * 4;
        monthlyReturns[year].push(parseFloat(monthRet.toFixed(1)));
      }
    }
    // Pad to 12 months
    while (monthlyReturns[year].length < 12) {
      monthlyReturns[year].push(parseFloat(((r() - 0.4) * 5).toFixed(1)));
    }
  }

  // Rolling 12-month returns
  const rolling12m: number[] = [];
  for (let i = n; i < equity.length; i += 5) {
    rolling12m.push(((equity[i] / equity[Math.max(0, i - n)] - 1) * 100));
  }

  const spyReturn = ((spy[spy.length - 1] / spy[0]) - 1) * 100;
  const totalReturn = ((equity[equity.length - 1] / 100) - 1) * 100;

  return {
    totalReturn,
    cagr,
    sharpe,
    sortino,
    calmar,
    maxDrawdown: maxDD,
    avgDrawdown: maxDD * 0.35,
    recoveryDays: Math.floor(45 + r() * 120),
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    annualTurnover: turnover,
    numTrades,
    equityCurve: equity.map(v => v - 100),
    drawdownCurve: drawdown,
    monthlyReturns,
    rolling12m,
    spyReturn,
    spyCurve: spy.map(v => v - 100),
  };
}

// ── Generate Live Signals ─────────────────────────────────────────────────────

const TICKERS = ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "TSLA", "AMZN", "JPM", "XOM", "AMD"];

function generateLiveSignals(selectedSignals: string[], seed: number): LiveSignal[] {
  if (selectedSignals.length === 0) return [];
  const r = mulberry32(seed);
  const count = 3 + Math.floor(r() * 7);
  return Array.from({ length: count }, (_, i) => {
    const ticker = TICKERS[Math.floor(r() * TICKERS.length)];
    const sigId = selectedSignals[Math.floor(r() * selectedSignals.length)];
    const sig = SIGNALS.find(s => s.id === sigId)!;
    const price = 50 + r() * 450;
    const strength = Math.floor(40 + r() * 60);
    const now = new Date();
    now.setSeconds(now.getSeconds() - Math.floor(r() * 180));
    return {
      id: `sig-${seed}-${i}`,
      ticker,
      signalType: sig?.name ?? sigId,
      strength,
      entryPrice: parseFloat(price.toFixed(2)),
      positionSize: parseFloat((1 + r() * 9).toFixed(1)),
      timestamp: now.toLocaleTimeString(),
      direction: r() > 0.3 ? "long" : "short",
    };
  });
}

// ── Regime Analysis Data ──────────────────────────────────────────────────────

function generateRegimeData(seed: number) {
  const r = mulberry32(seed);
  return [
    { regime: "Bull Market",   ret: 18 + r() * 15, sharpe: 1.2 + r() * 0.8, pct: 42 },
    { regime: "Bear Market",   ret: -8 + r() * 6,  sharpe: -0.3 + r() * 0.5, pct: 18 },
    { regime: "High Vol",      ret: 5 + r() * 12,  sharpe: 0.4 + r() * 0.6, pct: 22 },
    { regime: "Low Vol",       ret: 14 + r() * 8,  sharpe: 1.5 + r() * 0.5, pct: 28 },
    { regime: "Rate Rising",   ret: 2 + r() * 10,  sharpe: 0.2 + r() * 0.7, pct: 30 },
    { regime: "Rate Falling",  ret: 16 + r() * 10, sharpe: 1.1 + r() * 0.6, pct: 20 },
  ];
}

function generateFactors(seed: number) {
  const r = mulberry32(seed);
  return [
    { name: "Market β",  beta: 0.6 + r() * 0.5,  ci: 0.05 + r() * 0.1 },
    { name: "Size (SMB)", beta: -0.1 + r() * 0.4, ci: 0.08 + r() * 0.1 },
    { name: "Value (HML)",beta: -0.2 + r() * 0.5, ci: 0.07 + r() * 0.1 },
    { name: "Mom (MOM)",  beta: 0.3 + r() * 0.5,  ci: 0.09 + r() * 0.12 },
    { name: "Quality",    beta: 0.1 + r() * 0.4,  ci: 0.06 + r() * 0.1 },
    { name: "Low Vol",    beta: 0.0 + r() * 0.3,  ci: 0.05 + r() * 0.08 },
  ];
}

function generateStressTests(seed: number) {
  const r = mulberry32(seed + 7);
  return [
    { event: "2008 GFC",        stratRet: -12 - r() * 18, mktRet: -51, period: "Sep 2008 – Mar 2009" },
    { event: "2020 COVID Crash",stratRet: -8 - r() * 12,  mktRet: -34, period: "Feb 2020 – Mar 2020" },
    { event: "2022 Rate Shock", stratRet: -15 - r() * 10, mktRet: -25, period: "Jan 2022 – Oct 2022" },
  ];
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AlgoBuilderPage() {
  const [activeTab, setActiveTab] = useState("signals");

  // Signal Library state
  const [selectedCategory, setSelectedCategory] = useState<SignalCategory | "all">("all");
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  // Strategy Constructor state
  const [strategy, setStrategy] = useState<StrategyConfig>({
    signals: [],
    entryLogic: "AND",
    exits: ["stop-loss", "profit-target"],
    profitTarget: 15,
    stopLoss: 7,
    timeExit: 30,
    trailingStop: 5,
    universe: "sp500",
    rebalancing: "weekly",
    sizing: "equal",
  });

  // Backtest state
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Live signals state
  const [liveSeed, setLiveSeed] = useState(1984);
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>([]);
  const [newSignalCount, setNewSignalCount] = useState(0);
  const tickRef = useRef(0);

  // Sync selected signals to strategy
  useEffect(() => {
    setStrategy(prev => ({ ...prev, signals: selectedSignals }));
  }, [selectedSignals]);

  // Live signal ticker
  useEffect(() => {
    if (activeTab !== "monitor") return;
    const interval = setInterval(() => {
      tickRef.current++;
      const seed = 1984 + tickRef.current * 17;
      setLiveSeed(seed);
      const sigs = generateLiveSignals(
        selectedSignals.length > 0 ? selectedSignals : ["rsi-30-bounce", "ma-golden-cross"],
        seed
      );
      setLiveSignals(sigs);
      if (tickRef.current > 1) setNewSignalCount(prev => prev + Math.floor(Math.random() * 2));
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab, selectedSignals]);

  // Init live signals
  useEffect(() => {
    if (activeTab === "monitor") {
      const sigs = generateLiveSignals(
        selectedSignals.length > 0 ? selectedSignals : ["rsi-30-bounce", "ma-golden-cross"],
        1984
      );
      setLiveSignals(sigs);
      setNewSignalCount(0);
    }
  }, [activeTab, selectedSignals]);

  const toggleSignal = useCallback((id: string) => {
    setSelectedSignals(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }, []);

  const runBacktest = useCallback(async () => {
    if (selectedSignals.length === 0) return;
    setIsRunning(true);
    await new Promise(r => setTimeout(r, 1200));
    const result = generateBacktest(selectedSignals, strategy);
    setBacktestResult(result);
    setIsRunning(false);
    setHasRun(true);
  }, [selectedSignals, strategy]);

  const filteredSignals = useMemo(() =>
    selectedCategory === "all" ? SIGNALS : SIGNALS.filter(s => s.category === selectedCategory),
    [selectedCategory]
  );

  // Correlation matrix for selected signals
  const correlationMatrix = useMemo(() => {
    if (selectedSignals.length < 2) return null;
    return selectedSignals.map(idA => ({
      id: idA,
      correlations: selectedSignals.map(idB => {
        if (idA === idB) return 1;
        const sigA = SIGNALS.find(s => s.id === idA);
        return sigA?.correlation[idB] ?? mulberry32(idA.length + idB.length + 42)();
      }),
    }));
  }, [selectedSignals]);

  const strategyEnglish = useMemo(() => {
    if (selectedSignals.length === 0) return "No signals selected. Choose 2–4 signals to build a strategy.";
    const sigNames = selectedSignals.map(id => SIGNALS.find(s => s.id === id)?.name ?? id);
    const entryStr = `Enter when ${strategy.entryLogic === "AND" ? "all" : "any"} of: ${sigNames.join(", ")}.`;
    const exitParts: string[] = [];
    if (strategy.exits.includes("profit-target")) exitParts.push(`profit target +${strategy.profitTarget}%`);
    if (strategy.exits.includes("stop-loss")) exitParts.push(`stop loss -${strategy.stopLoss}%`);
    if (strategy.exits.includes("trailing")) exitParts.push(`trailing stop ${strategy.trailingStop}%`);
    if (strategy.exits.includes("time")) exitParts.push(`time exit after ${strategy.timeExit} days`);
    if (strategy.exits.includes("opposite")) exitParts.push("opposite signal");
    const exitStr = exitParts.length > 0 ? `Exit on: ${exitParts.join(" or ")}.` : "";
    const sizeMap: Record<Sizing, string> = {
      "equal": "equal weight",
      "vol-target": "volatility-targeted sizing",
      "momentum": "momentum-proportional sizing",
    };
    const universeMap: Record<Universe, string> = {
      sp500: "S&P 500", nasdaq100: "NASDAQ 100", russell1000: "Russell 1000", custom: "custom list",
    };
    return `${entryStr} ${exitStr} Rebalance ${strategy.rebalancing} across ${universeMap[strategy.universe]} using ${sizeMap[strategy.sizing]}.`;
  }, [selectedSignals, strategy]);

  const regimeData = useMemo(() => generateRegimeData(1984 + selectedSignals.length), [selectedSignals]);
  const factorData = useMemo(() => generateFactors(1984 + selectedSignals.length * 7), [selectedSignals]);
  const stressData = useMemo(() => generateStressTests(1984 + selectedSignals.length * 3), [selectedSignals]);

  const tailMetrics = useMemo(() => {
    const r = mulberry32(1984 + selectedSignals.length * 13);
    return {
      var95: -(2 + r() * 3),
      var99: -(4 + r() * 4),
      cvar95: -(3.5 + r() * 4),
      cvar99: -(6 + r() * 5),
      maxLoss: -(8 + r() * 12),
      skewness: -0.3 + r() * 0.6,
      kurtosis: 2 + r() * 4,
    };
  }, [selectedSignals]);

  const categories = (["all", "trend", "mean-reversion", "momentum", "volume", "sentiment", "fundamental", "alternative"] as const);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Cpu size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Algorithmic Trading System Builder</h1>
              <p className="text-xs text-muted-foreground">Design, backtest, and monitor systematic strategies</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedSignals.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedSignals.length} signal{selectedSignals.length !== 1 ? "s" : ""} selected
              </Badge>
            )}
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <Download size={12} /> Export
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/50">
            <TabsTrigger value="signals" className="text-xs">Signal Library</TabsTrigger>
            <TabsTrigger value="constructor" className="text-xs">Strategy Constructor</TabsTrigger>
            <TabsTrigger value="backtest" className="text-xs">Backtest Engine</TabsTrigger>
            <TabsTrigger value="risk" className="text-xs">Risk Analytics</TabsTrigger>
            <TabsTrigger value="monitor" className="text-xs relative">
              Live Monitor
              {newSignalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[11px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {newSignalCount > 9 ? "9+" : newSignalCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: Signal Library ─────────────────────────────────────────── */}
          <TabsContent value="signals" className="space-y-6">
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => {
                const meta = cat === "all" ? null : CAT_META[cat];
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground/50",
                      meta && !isActive && meta.color
                    )}
                  >
                    {cat === "all" ? "All Signals" : meta?.label}
                  </button>
                );
              })}
            </div>

            {/* Selection info */}
            {selectedSignals.length > 0 && (
              <Card className="p-4 border-primary/30 bg-primary/5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-primary mb-2">Selected for Strategy ({selectedSignals.length}/4)</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedSignals.map(id => {
                        const sig = SIGNALS.find(s => s.id === id)!;
                        const meta = CAT_META[sig.category];
                        return (
                          <button
                            key={id}
                            onClick={() => toggleSignal(id)}
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded text-xs border",
                              meta.bg, meta.color, "border-current/30 hover:opacity-80"
                            )}
                          >
                            {sig.name}
                            <X size={10} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {selectedSignals.length >= 2 && correlationMatrix && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Avg Signal Correlation</p>
                      {(() => {
                        const pairs = correlationMatrix.flatMap(row =>
                          row.correlations.filter((_, j) => row.id !== selectedSignals[j])
                        );
                        const avg = pairs.reduce((a, b) => a + b, 0) / Math.max(pairs.length, 1);
                        const isHigh = avg > 0.7;
                        return (
                          <span className={cn("text-lg font-bold", isHigh ? "text-amber-400" : "text-emerald-400")}>
                            {avg.toFixed(2)}
                            {isHigh && <span className="text-xs text-amber-400 ml-1">(correlated)</span>}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Signal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSignals.map(signal => {
                const meta = CAT_META[signal.category];
                const isSelected = selectedSignals.includes(signal.id);
                const isExpanded = expandedSignal === signal.id;
                const canAdd = !isSelected && selectedSignals.length < 4;

                return (
                  <motion.div
                    key={signal.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card
                      className={cn(
                        "p-4 border transition-all cursor-pointer hover:border-muted-foreground/30",
                        isSelected && "border-primary/50 bg-primary/5"
                      )}
                      onClick={() => setExpandedSignal(isExpanded ? null : signal.id)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border border-current/30", meta.bg, meta.color)}>
                              {meta.icon} {meta.label}
                            </span>
                            <span className={cn(
                              "text-xs font-bold px-1.5 py-0.5 rounded",
                              signal.rating === "A" ? "bg-emerald-500/20 text-emerald-400" :
                              signal.rating === "B" ? "bg-primary/20 text-primary" :
                              "bg-red-500/20 text-red-400"
                            )}>
                              {signal.rating}
                            </span>
                          </div>
                          <h3 className="text-sm font-medium leading-tight">{signal.name}</h3>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); toggleSignal(signal.id); }}
                          className={cn(
                            "ml-2 p-1.5 rounded border transition-all text-xs",
                            isSelected
                              ? "bg-primary/20 border-primary text-primary hover:bg-primary/30"
                              : canAdd
                              ? "border-border hover:border-primary hover:text-primary"
                              : "border-border text-muted-foreground opacity-40 cursor-not-allowed"
                          )}
                        >
                          {isSelected ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                        </button>
                      </div>

                      {/* Mini chart */}
                      <div className="mb-3">
                        <SignalMiniChart signalId={signal.id} rating={signal.rating} />
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <div className="text-xs font-semibold text-emerald-400">{signal.winRate}%</div>
                          <div className="text-xs text-muted-foreground">Win Rate</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-primary">+{signal.avgReturn}%</div>
                          <div className="text-xs text-muted-foreground">Avg Return</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-red-400">{signal.maxDrawdown}%</div>
                          <div className="text-xs text-muted-foreground">Max DD</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground">{signal.tradesPerYear}</div>
                          <div className="text-xs text-muted-foreground">Trades/Yr</div>
                        </div>
                      </div>

                      {/* Expanded */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground leading-relaxed">{signal.description}</p>
                              {Object.entries(signal.correlation).length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-muted-foreground mb-1">Signal Correlation</p>
                                  <div className="space-y-1">
                                    {Object.entries(signal.correlation).map(([otherId, corr]) => {
                                      const other = SIGNALS.find(s => s.id === otherId);
                                      if (!other) return null;
                                      return (
                                        <div key={otherId} className="flex items-center gap-2 text-xs">
                                          <span className="text-muted-foreground truncate flex-1">{other.name}</span>
                                          <div className="w-16 h-1.5 rounded bg-muted overflow-hidden">
                                            <div
                                              className={cn("h-full rounded", corr > 0.7 ? "bg-amber-400" : "bg-emerald-400")}
                                              style={{ width: `${corr * 100}%` }}
                                            />
                                          </div>
                                          <span className={cn("font-mono", corr > 0.7 ? "text-amber-400" : "text-emerald-400")}>
                                            {corr.toFixed(2)}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* ── TAB 2: Strategy Constructor ───────────────────────────────────── */}
          <TabsContent value="constructor" className="space-y-6">
            {selectedSignals.length === 0 && (
              <Card className="p-8 text-center border-dashed">
                <Layers size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Select 2–4 signals from the Signal Library to build your strategy</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveTab("signals")}>
                  Browse Signal Library
                </Button>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Configuration */}
              <div className="lg:col-span-2 space-y-4">

                {/* Selected Signals */}
                {selectedSignals.length > 0 && (
                  <Card className="p-5">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Zap size={14} className="text-primary" /> Active Signals
                    </h3>
                    <div className="space-y-2">
                      {selectedSignals.map(id => {
                        const sig = SIGNALS.find(s => s.id === id)!;
                        const meta = CAT_META[sig.category];
                        return (
                          <div key={id} className="flex items-center gap-3 p-2 rounded bg-muted/30 border border-border">
                            <span className={cn("text-xs px-1.5 py-0.5 rounded border border-current/30", meta.bg, meta.color)}>
                              {meta.label}
                            </span>
                            <span className="text-xs flex-1">{sig.name}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">Win: {sig.winRate}%</span>
                              <span className="text-xs text-muted-foreground ml-2">Avg: +{sig.avgReturn}%</span>
                            </div>
                            <button onClick={() => toggleSignal(id)} className="text-muted-foreground hover:text-foreground">
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Entry Logic */}
                <Card className="p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <ArrowUpRight size={14} className="text-emerald-400" /> Entry Logic
                  </h3>
                  <div className="flex gap-3 mb-4">
                    {(["AND", "OR"] as EntryLogic[]).map(logic => (
                      <button
                        key={logic}
                        onClick={() => setStrategy(prev => ({ ...prev, entryLogic: logic }))}
                        className={cn(
                          "flex-1 py-2 rounded text-xs font-medium border transition-all",
                          strategy.entryLogic === logic
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:border-muted-foreground/50"
                        )}
                      >
                        {logic === "AND" ? "ALL Conditions (AND)" : "ANY Condition (OR)"}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Exit Logic */}
                <Card className="p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <ArrowDownRight size={14} className="text-red-400" /> Exit Rules
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {([
                      { id: "opposite", label: "Opposite Signal" },
                      { id: "profit-target", label: "Profit Target" },
                      { id: "stop-loss", label: "Stop Loss" },
                      { id: "time", label: "Time Exit" },
                      { id: "trailing", label: "Trailing Stop" },
                    ] as { id: ExitType; label: string }[]).map(exit => (
                      <button
                        key={exit.id}
                        onClick={() => setStrategy(prev => ({
                          ...prev,
                          exits: prev.exits.includes(exit.id)
                            ? prev.exits.filter(e => e !== exit.id)
                            : [...prev.exits, exit.id],
                        }))}
                        className={cn(
                          "py-2 px-3 rounded text-xs border transition-all text-left",
                          strategy.exits.includes(exit.id)
                            ? "bg-primary/10 border-primary/40 text-primary"
                            : "border-border text-muted-foreground hover:border-muted-foreground/50"
                        )}
                      >
                        {exit.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {strategy.exits.includes("profit-target") && (
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-muted-foreground">Profit Target</span>
                          <span className="text-emerald-400 font-mono">+{strategy.profitTarget}%</span>
                        </div>
                        <Slider
                          value={[strategy.profitTarget]}
                          min={2} max={50} step={1}
                          onValueChange={([v]) => setStrategy(prev => ({ ...prev, profitTarget: v }))}
                        />
                      </div>
                    )}
                    {strategy.exits.includes("stop-loss") && (
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-muted-foreground">Stop Loss</span>
                          <span className="text-red-400 font-mono">-{strategy.stopLoss}%</span>
                        </div>
                        <Slider
                          value={[strategy.stopLoss]}
                          min={1} max={30} step={0.5}
                          onValueChange={([v]) => setStrategy(prev => ({ ...prev, stopLoss: v }))}
                        />
                      </div>
                    )}
                    {strategy.exits.includes("trailing") && (
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-muted-foreground">Trailing Stop</span>
                          <span className="text-amber-400 font-mono">{strategy.trailingStop}%</span>
                        </div>
                        <Slider
                          value={[strategy.trailingStop]}
                          min={1} max={20} step={0.5}
                          onValueChange={([v]) => setStrategy(prev => ({ ...prev, trailingStop: v }))}
                        />
                      </div>
                    )}
                    {strategy.exits.includes("time") && (
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-muted-foreground">Max Holding Days</span>
                          <span className="font-mono text-primary">{strategy.timeExit} days</span>
                        </div>
                        <Slider
                          value={[strategy.timeExit]}
                          min={1} max={252} step={1}
                          onValueChange={([v]) => setStrategy(prev => ({ ...prev, timeExit: v }))}
                        />
                      </div>
                    )}
                  </div>
                </Card>

                {/* Universe & Rebalancing */}
                <Card className="p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Filter size={14} className="text-primary" /> Universe & Rebalancing
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Stock Universe</label>
                      <div className="space-y-1">
                        {([
                          { id: "sp500", label: "S&P 500" },
                          { id: "nasdaq100", label: "NASDAQ 100" },
                          { id: "russell1000", label: "Russell 1000" },
                          { id: "custom", label: "Custom List" },
                        ] as { id: Universe; label: string }[]).map(u => (
                          <button
                            key={u.id}
                            onClick={() => setStrategy(prev => ({ ...prev, universe: u.id }))}
                            className={cn(
                              "w-full text-left py-1.5 px-3 rounded text-xs border transition-all",
                              strategy.universe === u.id
                                ? "bg-primary/10 border-primary/40 text-primary"
                                : "border-border text-muted-foreground hover:border-muted-foreground/30"
                            )}
                          >
                            {u.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Rebalancing</label>
                      <div className="space-y-1">
                        {([
                          { id: "daily", label: "Daily" },
                          { id: "weekly", label: "Weekly" },
                          { id: "monthly", label: "Monthly" },
                          { id: "signal", label: "Signal-Triggered" },
                        ] as { id: Rebalancing; label: string }[]).map(rb => (
                          <button
                            key={rb.id}
                            onClick={() => setStrategy(prev => ({ ...prev, rebalancing: rb.id }))}
                            className={cn(
                              "w-full text-left py-1.5 px-3 rounded text-xs border transition-all",
                              strategy.rebalancing === rb.id
                                ? "bg-primary/10 border-primary/40 text-primary"
                                : "border-border text-muted-foreground hover:border-muted-foreground/30"
                            )}
                          >
                            {rb.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Position Sizing */}
                <Card className="p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Gauge size={14} className="text-primary" /> Position Sizing
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { id: "equal", label: "Equal Weight", desc: "Each position equally sized" },
                      { id: "vol-target", label: "Vol-Target", desc: "Equal vol contribution per position" },
                      { id: "momentum", label: "Momentum Weight", desc: "Weight ∝ signal strength" },
                    ] as { id: Sizing; label: string; desc: string }[]).map(sz => (
                      <button
                        key={sz.id}
                        onClick={() => setStrategy(prev => ({ ...prev, sizing: sz.id }))}
                        className={cn(
                          "p-3 rounded border text-left transition-all",
                          strategy.sizing === sz.id
                            ? "bg-primary/10 border-primary/40"
                            : "border-border hover:border-muted-foreground/30"
                        )}
                      >
                        <div className={cn("text-xs font-medium mb-1", strategy.sizing === sz.id ? "text-primary" : "")}>
                          {sz.label}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{sz.desc}</div>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Transaction Cost Model */}
                <Card className="p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Settings size={14} className="text-muted-foreground" /> Transaction Cost Model
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded bg-muted/30 border border-border">
                      <div className="text-muted-foreground mb-1">Commission</div>
                      <div className="font-mono text-foreground">$0.005/share</div>
                    </div>
                    <div className="p-3 rounded bg-muted/30 border border-border">
                      <div className="text-muted-foreground mb-1">Market Impact</div>
                      <div className="font-mono text-foreground">0.10% (S&P 500)</div>
                    </div>
                    <div className="p-3 rounded bg-muted/30 border border-border">
                      <div className="text-muted-foreground mb-1">Slippage</div>
                      <div className="font-mono text-foreground">0.05% avg</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right: Plain English Preview */}
              <div className="space-y-4">
                <Card className="p-5 sticky top-24">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Bot size={14} className="text-primary" /> Strategy Description
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{strategyEnglish}</p>

                  {selectedSignals.length > 0 && (
                    <>
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        <div className="text-xs text-muted-foreground">Estimated Characteristics</div>
                        {(() => {
                          const r = mulberry32(1984 + selectedSignals.length * 9);
                          return [
                            { label: "Expected Trades/Year", value: `${Math.floor(20 + r() * 60)}` },
                            { label: "Avg Holding Period", value: `${Math.floor(5 + r() * 25)} days` },
                            { label: "Estimated Sharpe", value: `${(0.7 + r() * 0.9).toFixed(2)}` },
                            { label: "Expected Drawdown", value: `-${(10 + r() * 15).toFixed(0)}%` },
                          ];
                        })().map(item => (
                          <div key={item.label} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-mono">{item.value}</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        className="w-full mt-4 text-xs"
                        size="sm"
                        onClick={() => setActiveTab("backtest")}
                      >
                        <Play size={12} className="mr-1.5" /> Run Backtest
                      </Button>
                    </>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB 3: Backtest Engine ─────────────────────────────────────────── */}
          <TabsContent value="backtest" className="space-y-6">
            {selectedSignals.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Play size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground mb-4">Select signals and configure your strategy first</p>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("signals")}>Go to Signal Library</Button>
              </Card>
            ) : (
              <>
                {/* Run button */}
                <div className="flex items-center gap-4">
                  <Button
                    onClick={runBacktest}
                    disabled={isRunning}
                    className="gap-2"
                  >
                    {isRunning ? (
                      <><RefreshCw size={14} className="animate-spin" /> Running Backtest...</>
                    ) : (
                      <><Play size={14} /> Run 5-Year Backtest</>
                    )}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Strategy: {selectedSignals.length} signal{selectedSignals.length !== 1 ? "s" : ""} ·{" "}
                    {strategy.universe === "sp500" ? "S&P 500" : strategy.universe} · {strategy.rebalancing}
                  </span>
                </div>

                <AnimatePresence>
                  {backtestResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Performance Dashboard */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {[
                          { label: "Total Return", value: `${backtestResult.totalReturn > 0 ? "+" : ""}${backtestResult.totalReturn.toFixed(1)}%`, color: backtestResult.totalReturn >= 0 ? "text-emerald-400" : "text-red-400" },
                          { label: "CAGR", value: `${backtestResult.cagr.toFixed(1)}%`, color: "text-emerald-400" },
                          { label: "Sharpe Ratio", value: backtestResult.sharpe.toFixed(2), color: backtestResult.sharpe >= 1 ? "text-emerald-400" : "text-amber-400" },
                          { label: "Sortino", value: backtestResult.sortino.toFixed(2), color: "text-primary" },
                          { label: "Calmar", value: backtestResult.calmar.toFixed(2), color: "text-primary" },
                          { label: "Max Drawdown", value: `${backtestResult.maxDrawdown.toFixed(1)}%`, color: "text-red-400" },
                          { label: "Win Rate", value: `${backtestResult.winRate.toFixed(0)}%`, color: "text-emerald-400" },
                          { label: "Avg Win", value: `+${backtestResult.avgWin.toFixed(1)}%`, color: "text-emerald-400" },
                          { label: "Avg Loss", value: `${backtestResult.avgLoss.toFixed(1)}%`, color: "text-red-400" },
                          { label: "Profit Factor", value: backtestResult.profitFactor.toFixed(2), color: backtestResult.profitFactor >= 1.5 ? "text-emerald-400" : "text-amber-400" },
                          { label: "# Trades", value: backtestResult.numTrades.toString(), color: "text-muted-foreground" },
                          { label: "Annual Turnover", value: `${backtestResult.annualTurnover}%`, color: "text-muted-foreground" },
                        ].map(metric => (
                          <Card key={metric.label} className="p-3">
                            <div className={cn("text-lg font-bold font-mono", metric.color)}>{metric.value}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{metric.label}</div>
                          </Card>
                        ))}
                      </div>

                      {/* Strategy vs Benchmark */}
                      <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold flex items-center gap-2">
                            <BarChart2 size={14} /> Equity Curve vs SPY
                          </h3>
                          <div className="flex gap-3 text-xs">
                            <span className="text-emerald-400 font-mono">
                              Strategy: {backtestResult.totalReturn > 0 ? "+" : ""}{backtestResult.totalReturn.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground font-mono">
                              SPY: {backtestResult.spyReturn > 0 ? "+" : ""}{backtestResult.spyReturn.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <EquityCurveSVG
                          equity={backtestResult.equityCurve}
                          spy={backtestResult.spyCurve}
                          drawdown={backtestResult.drawdownCurve}
                        />
                      </Card>

                      {/* Monthly Heatmap */}
                      <Card className="p-5">
                        <h3 className="text-sm font-semibold mb-4">Monthly Returns Heatmap</h3>
                        <MonthlyHeatmap data={backtestResult.monthlyReturns} />
                      </Card>

                      {/* Rolling 12-Month */}
                      <Card className="p-5">
                        <h3 className="text-sm font-semibold mb-3">Rolling 12-Month Returns</h3>
                        <Rolling12mChart data={backtestResult.rolling12m} />
                        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-emerald-400/30 inline-block rounded" /> Positive periods</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-red-400/30 inline-block rounded" /> Negative periods</span>
                        </div>
                      </Card>

                      {/* Additional stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Avg Drawdown</div>
                          <div className="text-lg font-bold font-mono text-amber-400">{backtestResult.avgDrawdown.toFixed(1)}%</div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Avg Recovery Time</div>
                          <div className="text-lg font-bold font-mono text-primary">{backtestResult.recoveryDays} days</div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Alpha vs SPY</div>
                          <div className="text-lg font-bold font-mono text-emerald-400">
                            +{(backtestResult.totalReturn - backtestResult.spyReturn).toFixed(1)}%
                          </div>
                        </Card>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!hasRun && !isRunning && (
                  <Card className="p-8 text-center border-dashed">
                    <Activity size={28} className="mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Click "Run Backtest" to simulate 5-year performance</p>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* ── TAB 4: Risk Analytics ─────────────────────────────────────────── */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Factor Exposures */}
              <Card className="p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <GitCompare size={14} className="text-primary" /> Factor Exposures
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Bars show β exposure; whiskers show 95% confidence interval</p>
                <FactorExposureChart factors={factorData} />
              </Card>

              {/* Regime Analysis */}
              <Card className="p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-amber-400" /> Regime Performance
                </h3>
                <div className="space-y-3">
                  {regimeData.map(r => (
                    <div key={r.regime}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{r.regime}</span>
                        <div className="flex gap-3">
                          <span className={cn("font-mono", r.ret >= 0 ? "text-emerald-400" : "text-red-400")}>
                            {r.ret > 0 ? "+" : ""}{r.ret.toFixed(1)}%
                          </span>
                          <span className="text-muted-foreground font-mono">Sharpe {r.sharpe.toFixed(2)}</span>
                          <span className="text-muted-foreground">{r.pct}% of time</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded transition-all", r.ret >= 0 ? "bg-emerald-400" : "bg-red-400")}
                          style={{ width: `${Math.min(100, Math.abs(r.ret) * 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Tail Risk Metrics */}
              <Card className="p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-400" /> Tail Risk Metrics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "VaR (95%)", value: `${tailMetrics.var95.toFixed(1)}%`, desc: "1-day loss at 95% confidence" },
                    { label: "VaR (99%)", value: `${tailMetrics.var99.toFixed(1)}%`, desc: "1-day loss at 99% confidence" },
                    { label: "CVaR (95%)", value: `${tailMetrics.cvar95.toFixed(1)}%`, desc: "Expected loss beyond VaR 95%" },
                    { label: "CVaR (99%)", value: `${tailMetrics.cvar99.toFixed(1)}%`, desc: "Expected loss beyond VaR 99%" },
                    { label: "Max 1-Day Loss", value: `${tailMetrics.maxLoss.toFixed(1)}%`, desc: "Historical worst day" },
                    { label: "Skewness", value: tailMetrics.skewness.toFixed(2), desc: "Return distribution asymmetry" },
                    { label: "Kurtosis", value: tailMetrics.kurtosis.toFixed(2), desc: "Fat-tail measure (normal = 3)" },
                  ].map(m => (
                    <div key={m.label} className="p-3 rounded bg-muted/30 border border-border">
                      <div className="text-base font-bold font-mono text-red-400">{m.value}</div>
                      <div className="text-xs text-foreground mt-0.5">{m.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Stress Tests */}
              <Card className="p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Shield size={14} className="text-primary" /> Historical Stress Tests
                </h3>
                <div className="space-y-4">
                  {stressData.map(st => (
                    <div key={st.event} className="p-3 rounded border border-border bg-muted/20">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-xs font-medium">{st.event}</div>
                          <div className="text-xs text-muted-foreground">{st.period}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-red-400">{st.stratRet.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">strategy</div>
                        </div>
                      </div>
                      {/* Comparison bars */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-16 text-muted-foreground">Strategy</span>
                          <div className="flex-1 h-1.5 rounded bg-muted overflow-hidden">
                            <div
                              className="h-full rounded bg-red-400"
                              style={{ width: `${Math.min(100, Math.abs(st.stratRet) / 55 * 100)}%` }}
                            />
                          </div>
                          <span className="w-12 text-right font-mono text-red-400">{st.stratRet.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-16 text-muted-foreground">Market</span>
                          <div className="flex-1 h-1.5 rounded bg-muted overflow-hidden">
                            <div
                              className="h-full rounded bg-muted-foreground"
                              style={{ width: `${Math.min(100, Math.abs(st.mktRet) / 55 * 100)}%` }}
                            />
                          </div>
                          <span className="w-12 text-right font-mono text-muted-foreground">{st.mktRet}%</span>
                        </div>
                      </div>
                      <div className={cn(
                        "text-xs mt-2 font-medium",
                        st.stratRet > st.mktRet ? "text-emerald-400" : "text-red-400"
                      )}>
                        {st.stratRet > st.mktRet
                          ? `Protected +${(st.stratRet - st.mktRet).toFixed(1)}% vs market`
                          : `Underperformed ${(st.stratRet - st.mktRet).toFixed(1)}% vs market`}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Diversification / Correlation */}
              <Card className="p-5 lg:col-span-2">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Layers size={14} className="text-emerald-400" /> Risk Factor Correlation & Diversification
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { factor: "SPY (Market)", corr: 0.45 + mulberry32(1984)() * 0.3, benefit: "moderate" },
                    { factor: "AGG (Bonds)", corr: -0.15 + mulberry32(1985)() * 0.2, benefit: "high" },
                    { factor: "GLD (Gold)", corr: -0.05 + mulberry32(1986)() * 0.25, benefit: "high" },
                    { factor: "VIX", corr: -0.35 + mulberry32(1987)() * 0.2, benefit: "very high" },
                  ].map(f => {
                    const absCorr = Math.abs(f.corr);
                    const color = absCorr < 0.2 ? "text-emerald-400" : absCorr < 0.4 ? "text-amber-400" : "text-red-400";
                    return (
                      <div key={f.factor} className="p-3 rounded border border-border text-center">
                        <div className="text-xs text-muted-foreground mb-2">{f.factor}</div>
                        <div className={cn("text-xl font-bold font-mono", color)}>
                          {f.corr > 0 ? "+" : ""}{f.corr.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Diversification: {f.benefit}</div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* ── TAB 5: Live Signal Monitor ─────────────────────────────────────── */}
          <TabsContent value="monitor" className="space-y-6">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-medium">Live Signal Monitor</span>
                </div>
                <Badge variant="outline" className="text-xs">Updates every 3s</Badge>
                {newSignalCount > 0 && (
                  <Badge className="text-xs gap-1">
                    <BellRing size={10} /> {newSignalCount} new signals
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1"
                onClick={() => { setNewSignalCount(0); }}
              >
                <Bell size={12} /> Clear Alerts
              </Button>
            </div>

            {selectedSignals.length === 0 && (
              <Card className="p-4 border-amber-500/30 bg-amber-500/5">
                <p className="text-xs text-amber-400 flex items-center gap-2">
                  <AlertTriangle size={12} /> No signals selected. Showing default RSI + Golden Cross signals.
                </p>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Signal Table */}
              <div className="lg:col-span-2">
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Active Signals</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          {["Ticker", "Signal", "Direction", "Strength", "Entry Price", "Size (%)", "Time"].map(h => (
                            <th key={h} className="text-left text-xs text-muted-foreground font-normal pb-2 pr-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence mode="popLayout">
                          {liveSignals.map(sig => (
                            <motion.tr
                              key={sig.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                            >
                              <td className="py-2 pr-3 font-mono font-semibold">{sig.ticker}</td>
                              <td className="py-2 pr-3 text-muted-foreground max-w-[160px] truncate">{sig.signalType}</td>
                              <td className="py-2 pr-3">
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded text-xs font-medium",
                                  sig.direction === "long"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/20 text-red-400"
                                )}>
                                  {sig.direction === "long" ? "▲ Long" : "▼ Short"}
                                </span>
                              </td>
                              <td className="py-2 pr-3">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-12 h-1.5 rounded bg-muted overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full rounded",
                                        sig.strength >= 70 ? "bg-emerald-400" : sig.strength >= 50 ? "bg-amber-400" : "bg-red-400"
                                      )}
                                      style={{ width: `${sig.strength}%` }}
                                    />
                                  </div>
                                  <span className="font-mono">{sig.strength}</span>
                                </div>
                              </td>
                              <td className="py-2 pr-3 font-mono">${sig.entryPrice.toFixed(2)}</td>
                              <td className="py-2 pr-3 font-mono">{sig.positionSize.toFixed(1)}%</td>
                              <td className="py-2 text-muted-foreground font-mono">{sig.timestamp}</td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Right panel */}
              <div className="space-y-4">
                {/* Signal Strength Distribution */}
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Signal Strength Distribution</h3>
                  <SignalHistogram signals={liveSignals} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span className="text-red-400">Weak</span>
                    <span className="text-amber-400">Medium</span>
                    <span className="text-emerald-400">Strong</span>
                  </div>
                </Card>

                {/* Portfolio Construction */}
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Portfolio Recommendations</h3>
                  {liveSignals.length > 0 ? (
                    <div className="space-y-2">
                      {liveSignals.slice(0, 5).map(sig => (
                        <div key={sig.id} className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-semibold w-12">{sig.ticker}</span>
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded w-14 text-center",
                            sig.direction === "long" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                          )}>
                            {sig.direction === "long" ? "BUY" : "SELL"}
                          </span>
                          <div className="flex-1 h-1 rounded bg-muted overflow-hidden">
                            <div
                              className={cn("h-full", sig.direction === "long" ? "bg-emerald-400" : "bg-red-400")}
                              style={{ width: `${sig.positionSize * 10}%` }}
                            />
                          </div>
                          <span className="font-mono text-muted-foreground w-10 text-right">{sig.positionSize.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No signals active</p>
                  )}
                </Card>

                {/* Expected Portfolio Metrics */}
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Expected Portfolio (Next Rebalance)</h3>
                  {(() => {
                    const r = mulberry32(liveSeed);
                    return [
                      { label: "# Positions", value: `${3 + Math.floor(r() * 8)}` },
                      { label: "Expected Return (ann.)", value: `+${(8 + r() * 12).toFixed(1)}%` },
                      { label: "Est. Volatility", value: `${(10 + r() * 8).toFixed(1)}%` },
                      { label: "Concentration (top 3)", value: `${(25 + r() * 20).toFixed(0)}%` },
                      { label: "Beta to Market", value: `${(0.5 + r() * 0.6).toFixed(2)}` },
                    ].map(m => (
                      <div key={m.label} className="flex justify-between text-xs py-1 border-b border-border/40 last:border-0">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-mono">{m.value}</span>
                      </div>
                    ));
                  })()}
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
