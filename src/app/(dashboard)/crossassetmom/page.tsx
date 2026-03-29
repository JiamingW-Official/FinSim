"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Layers,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  RefreshCw,
  Shield,
  GitBranch,
  Database,
  PieChart,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 894;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 894;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface AssetClass {
  name: string;
  shortName: string;
  momentumSharpe: number;
  annualReturn: number;
  maxDrawdown: number;
  color: string;
  signal: "strong_bull" | "bull" | "neutral" | "bear" | "strong_bear";
  volatility: number;
}

interface TrendModel {
  name: string;
  shortName: string;
  description: string;
  annualReturn: number;
  sharpe: number;
  maxDrawdown: number;
  winRate: number;
  avgHoldDays: number;
  color: string;
}

interface PortfolioAsset {
  name: string;
  shortName: string;
  volTarget: number;
  currentVol: number;
  signal: number;
  weight: number;
  contribution: number;
  color: string;
}

interface CrisisEvent {
  name: string;
  year: number;
  marketReturn: number;
  momentumReturn: number;
  trendReturn: number;
  label: string;
}

// ── Static data ─────────────────────────────────────────────────────────────

const ASSET_CLASSES: AssetClass[] = [
  {
    name: "Global Equities",
    shortName: "EQ",
    momentumSharpe: 0.71,
    annualReturn: 11.4,
    maxDrawdown: -38.2,
    color: "#6366f1",
    signal: "bull",
    volatility: 16.2,
  },
  {
    name: "Government Bonds",
    shortName: "Bonds",
    momentumSharpe: 0.55,
    annualReturn: 6.8,
    maxDrawdown: -14.6,
    color: "#22c55e",
    signal: "neutral",
    volatility: 7.4,
  },
  {
    name: "FX / Currencies",
    shortName: "FX",
    momentumSharpe: 0.62,
    annualReturn: 8.3,
    maxDrawdown: -18.9,
    color: "#f59e0b",
    signal: "bull",
    volatility: 9.1,
  },
  {
    name: "Commodities",
    shortName: "Cmdty",
    momentumSharpe: 0.58,
    annualReturn: 9.1,
    maxDrawdown: -41.7,
    color: "#ec4899",
    signal: "strong_bull",
    volatility: 22.8,
  },
  {
    name: "Credit Spreads",
    shortName: "Credit",
    momentumSharpe: 0.48,
    annualReturn: 5.9,
    maxDrawdown: -21.3,
    color: "#14b8a6",
    signal: "bear",
    volatility: 8.6,
  },
  {
    name: "Interest Rates",
    shortName: "Rates",
    momentumSharpe: 0.52,
    annualReturn: 7.2,
    maxDrawdown: -12.8,
    color: "#a855f7",
    signal: "neutral",
    volatility: 6.9,
  },
  {
    name: "Volatility",
    shortName: "Vol",
    momentumSharpe: 0.34,
    annualReturn: 4.6,
    maxDrawdown: -55.1,
    color: "#f97316",
    signal: "bear",
    volatility: 38.4,
  },
  {
    name: "Crypto Assets",
    shortName: "Crypto",
    momentumSharpe: 0.81,
    annualReturn: 24.7,
    maxDrawdown: -73.4,
    color: "#06b6d4",
    signal: "strong_bull",
    volatility: 68.2,
  },
];

const TREND_MODELS: TrendModel[] = [
  {
    name: "Exponential WMA Crossover",
    shortName: "EWMA",
    description: "Fast/slow exponential moving average crossover signal",
    annualReturn: 12.8,
    sharpe: 0.84,
    maxDrawdown: -19.2,
    winRate: 48.3,
    avgHoldDays: 62,
    color: "#6366f1",
  },
  {
    name: "Donchian Breakout",
    shortName: "Breakout",
    description: "Price breakout above/below N-day channel",
    annualReturn: 11.4,
    sharpe: 0.76,
    maxDrawdown: -22.8,
    winRate: 41.7,
    avgHoldDays: 94,
    color: "#22c55e",
  },
  {
    name: "Time-Series Regression",
    shortName: "Regression",
    description: "OLS slope of log-prices over lookback window",
    annualReturn: 13.6,
    sharpe: 0.91,
    maxDrawdown: -17.4,
    winRate: 52.1,
    avgHoldDays: 48,
    color: "#f59e0b",
  },
  {
    name: "Simple MA Crossover",
    shortName: "SMA",
    description: "50-day vs 200-day moving average crossover",
    annualReturn: 10.2,
    sharpe: 0.68,
    maxDrawdown: -25.6,
    winRate: 45.8,
    avgHoldDays: 118,
    color: "#ec4899",
  },
  {
    name: "Kalman Filter Trend",
    shortName: "Kalman",
    description: "State-space trend extraction via Kalman filter",
    annualReturn: 14.7,
    sharpe: 0.98,
    maxDrawdown: -15.8,
    winRate: 54.9,
    avgHoldDays: 35,
    color: "#a855f7",
  },
];

const PORTFOLIO_ASSETS: PortfolioAsset[] = [
  { name: "S&P 500", shortName: "SPX", volTarget: 10, currentVol: 16.2, signal: 0.74, weight: 8.3, contribution: 0.62, color: "#6366f1" },
  { name: "US 10Y Bonds", shortName: "UST10", volTarget: 10, currentVol: 7.4, signal: -0.21, weight: 13.5, contribution: -0.28, color: "#22c55e" },
  { name: "EUR/USD", shortName: "EURUSD", volTarget: 10, currentVol: 9.1, signal: 0.56, weight: 11.0, contribution: 0.31, color: "#f59e0b" },
  { name: "Crude Oil", shortName: "CL", volTarget: 10, currentVol: 22.8, signal: 0.89, weight: 4.4, contribution: 0.39, color: "#ec4899" },
  { name: "Gold", shortName: "GC", volTarget: 10, currentVol: 14.6, signal: 0.62, weight: 6.8, contribution: 0.42, color: "#14b8a6" },
  { name: "HY Credit", shortName: "HYG", volTarget: 10, currentVol: 8.6, signal: -0.44, weight: 11.6, contribution: -0.51, color: "#a855f7" },
  { name: "VIX Futures", shortName: "VX", volTarget: 10, currentVol: 38.4, signal: -0.31, weight: 2.6, contribution: -0.08, color: "#f97316" },
  { name: "Bitcoin", shortName: "BTC", volTarget: 10, currentVol: 68.2, signal: 0.95, weight: 1.5, contribution: 0.14, color: "#06b6d4" },
];

const CRISIS_EVENTS: CrisisEvent[] = [
  { name: "Tech Bubble Burst", year: 2001, marketReturn: -13.4, momentumReturn: 18.7, trendReturn: 22.4, label: "2001" },
  { name: "9/11 Shock", year: 2001, marketReturn: -11.9, momentumReturn: 4.2, trendReturn: 9.8, label: "9/11" },
  { name: "GFC Peak Drawdown", year: 2008, marketReturn: -38.5, momentumReturn: -17.8, trendReturn: 14.6, label: "2008" },
  { name: "Momentum Crash", year: 2009, marketReturn: 26.5, momentumReturn: -22.4, trendReturn: 8.1, label: "2009" },
  { name: "European Debt", year: 2011, marketReturn: -18.2, momentumReturn: 6.9, trendReturn: 12.3, label: "2011" },
  { name: "China Selloff", year: 2015, marketReturn: -12.4, momentumReturn: 3.1, trendReturn: 7.8, label: "2015" },
  { name: "COVID Crash", year: 2020, marketReturn: -33.8, momentumReturn: -8.4, trendReturn: 11.9, label: "2020" },
  { name: "Rate Shock", year: 2022, marketReturn: -19.4, momentumReturn: 22.8, trendReturn: 28.3, label: "2022" },
];

// ── SVG Charts ─────────────────────────────────────────────────────────────

function CrossSectionalVsTSMOMDiagram() {
  const W = 520;
  const H = 220;
  const assets = ["Asset A", "Asset B", "Asset C", "Asset D", "Asset E"];
  const csReturns = [18, 12, 4, -6, -14];
  const tsmomSignals = [1, 1, 1, -1, 1]; // long if positive past return, regardless of cross-section rank

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      {/* Left: Cross-Sectional */}
      <text x="100" y="18" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">CROSS-SECTIONAL</text>
      <text x="100" y="30" textAnchor="middle" fill="#64748b" fontSize="9">Rank, go long top / short bottom</text>
      {assets.map((a, i) => {
        const y = 45 + i * 32;
        const barW = Math.abs(csReturns[i]) * 3.5;
        const isLong = i < 2;
        const isShort = i > 3;
        return (
          <g key={a}>
            <text x="50" y={y + 9} textAnchor="end" fill="#94a3b8" fontSize="9">{a}</text>
            <rect
              x={55}
              y={y}
              width={barW}
              height={14}
              fill={isLong ? "#22c55e" : isShort ? "#ef4444" : "#475569"}
              rx={2}
              opacity={isLong || isShort ? 1 : 0.4}
            />
            <text x={55 + barW + 4} y={y + 10} fill={isLong ? "#22c55e" : isShort ? "#ef4444" : "#64748b"} fontSize="9">
              {isLong ? "LONG" : isShort ? "SHORT" : "skip"}
            </text>
          </g>
        );
      })}
      {/* Divider */}
      <line x1="210" y1="12" x2="210" y2="208" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
      {/* Right: TSMOM */}
      <text x="365" y="18" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">TIME-SERIES MOM</text>
      <text x="365" y="30" textAnchor="middle" fill="#64748b" fontSize="9">Compare each asset to its own past</text>
      {assets.map((a, i) => {
        const y = 45 + i * 32;
        const isLong = tsmomSignals[i] === 1;
        return (
          <g key={a + "-ts"}>
            <text x="265" y={y + 9} textAnchor="end" fill="#94a3b8" fontSize="9">{a}</text>
            <rect
              x={270}
              y={y}
              width={64}
              height={14}
              fill={isLong ? "#22c55e" : "#ef4444"}
              rx={2}
              opacity={0.85}
            />
            <text x={270 + 8} y={y + 10} fill="#fff" fontSize="9" fontWeight="600">
              {isLong ? "LONG" : "SHORT"}
            </text>
            <text x={350} y={y + 10} fill="#64748b" fontSize="8">{i === 3 ? "neg 12m" : "pos 12m"}</text>
          </g>
        );
      })}
    </svg>
  );
}

function MomentumCrash2009SVG() {
  const W = 460;
  const H = 170;
  resetSeed();
  // Simulate cumulative return path: momentum strategy 2008-2009
  const points: { x: number; y: number }[] = [];
  let val = 100;
  const months = 24;
  for (let i = 0; i <= months; i++) {
    if (i < 6) val *= 1 + (rand() * 0.02 + 0.005); // rising in 2008 (short market)
    else if (i < 12) val *= 1 + (rand() * 0.015 - 0.025); // 2008 crash - momentum winning
    else if (i === 12) val *= 0.82; // start of reversal
    else if (i < 16) val *= 1 - (rand() * 0.04 + 0.02); // severe crash
    else val *= 1 + (rand() * 0.02 - 0.005); // partial recovery
    points.push({ x: 30 + (i / months) * 400, y: val });
  }
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const scaleY = (v: number) => 20 + ((maxY - v) / (maxY - minY)) * 130;
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${scaleY(p.y)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 170 }}>
      <text x={W / 2} y="14" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        Momentum Strategy Cumulative Return — 2007-2009
      </text>
      {/* Zero reference */}
      <line x1="30" y1={scaleY(100)} x2="430" y2={scaleY(100)} stroke="#334155" strokeDasharray="3,3" strokeWidth="1" />
      {/* Crash annotation */}
      <rect x="230" y="18" width="100" height="28" rx="4" fill="#ef4444" opacity="0.15" />
      <text x="280" y="30" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="700">CRASH</text>
      <text x="280" y="41" textAnchor="middle" fill="#ef4444" fontSize="8">Mar 2009 reversal</text>
      {/* Path */}
      <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2" />
      {/* Area under */}
      <path
        d={`${pathD} L 430 ${scaleY(minY)} L 30 ${scaleY(minY)} Z`}
        fill="#ef4444"
        opacity="0.07"
      />
      {/* Labels */}
      <text x="30" y={H - 6} fill="#64748b" fontSize="8">2007</text>
      <text x="230" y={H - 6} fill="#64748b" fontSize="8">2008</text>
      <text x="400" y={H - 6} fill="#64748b" fontSize="8">2009</text>
      <text x="6" y={scaleY(100)} fill="#64748b" fontSize="8" dominantBaseline="middle">100</text>
      <text x="6" y={scaleY(minY)} fill="#ef4444" fontSize="8" dominantBaseline="middle">{minY.toFixed(0)}</text>
    </svg>
  );
}

function MomentumSharpeBarChart() {
  const W = 460;
  const H = 180;
  const maxSharpe = 1.0;
  const barW = 42;
  const gap = 14;
  const startX = 40;
  const bottom = H - 30;
  const chartH = bottom - 30;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
      <text x={W / 2} y="14" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        Momentum Sharpe Ratio by Asset Class
      </text>
      {ASSET_CLASSES.map((a, i) => {
        const x = startX + i * (barW + gap);
        const barH = (a.momentumSharpe / maxSharpe) * chartH;
        const y = bottom - barH;
        return (
          <g key={a.shortName}>
            <rect x={x} y={y} width={barW} height={barH} fill={a.color} rx={3} opacity={0.85} />
            <text
              x={x + barW / 2}
              y={y - 4}
              textAnchor="middle"
              fill={a.color}
              fontSize="9"
              fontWeight="600"
            >
              {a.momentumSharpe.toFixed(2)}
            </text>
            <text
              x={x + barW / 2}
              y={bottom + 12}
              textAnchor="middle"
              fill="#64748b"
              fontSize="8"
            >
              {a.shortName}
            </text>
          </g>
        );
      })}
      <line x1="30" y1={bottom} x2={W - 20} y2={bottom} stroke="#334155" strokeWidth="1" />
      <text x="6" y={30} fill="#64748b" fontSize="8">1.0</text>
      <line x1="30" y1={30} x2={W - 20} y2={30} stroke="#1e293b" strokeDasharray="3,3" strokeWidth="1" />
    </svg>
  );
}

function MAcrossoverSVG() {
  const W = 480;
  const H = 200;
  resetSeed();
  const n = 80;
  const prices: number[] = [100];
  for (let i = 1; i < n; i++) {
    prices.push(prices[i - 1] * (1 + (rand() - 0.48) * 0.025));
  }
  // SMA20 and SMA50
  const sma = (arr: number[], period: number, idx: number): number | null => {
    if (idx < period - 1) return null;
    const slice = arr.slice(idx - period + 1, idx + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  };
  const minP = Math.min(...prices) * 0.98;
  const maxP = Math.max(...prices) * 1.02;
  const scX = (i: number) => 40 + (i / (n - 1)) * 400;
  const scY = (v: number) => 20 + ((maxP - v) / (maxP - minP)) * 150;

  const pricePathD = prices.map((p, i) => `${i === 0 ? "M" : "L"} ${scX(i)} ${scY(p)}`).join(" ");
  const fast20: (number | null)[] = prices.map((_, i) => sma(prices, 20, i));
  const slow50: (number | null)[] = prices.map((_, i) => sma(prices, 50, i));

  const buildPath = (vals: (number | null)[]): string => {
    let d = "";
    vals.forEach((v, i) => {
      if (v === null) return;
      d += `${d === "" ? "M" : "L"} ${scX(i)} ${scY(v)} `;
    });
    return d;
  };

  // Find crossover points
  const crossovers: { x: number; y: number; isBullish: boolean }[] = [];
  for (let i = 1; i < n; i++) {
    const f0 = fast20[i - 1];
    const s0 = slow50[i - 1];
    const f1 = fast20[i];
    const s1 = slow50[i];
    if (f0 !== null && s0 !== null && f1 !== null && s1 !== null) {
      if (f0 < s0 && f1 >= s1) crossovers.push({ x: scX(i), y: scY(prices[i]), isBullish: true });
      if (f0 > s0 && f1 <= s1) crossovers.push({ x: scX(i), y: scY(prices[i]), isBullish: false });
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      <text x={W / 2} y="14" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        Moving Average Crossover Signal
      </text>
      <path d={pricePathD} fill="none" stroke="#475569" strokeWidth="1.5" opacity={0.6} />
      <path d={buildPath(fast20)} fill="none" stroke="#6366f1" strokeWidth="1.5" />
      <path d={buildPath(slow50)} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />
      {crossovers.map((c, i) => (
        <g key={i}>
          <circle
            cx={c.x}
            cy={c.y}
            r={5}
            fill={c.isBullish ? "#22c55e" : "#ef4444"}
            opacity={0.9}
          />
          <text
            x={c.x}
            y={c.y - 8}
            textAnchor="middle"
            fill={c.isBullish ? "#22c55e" : "#ef4444"}
            fontSize="8"
            fontWeight="700"
          >
            {c.isBullish ? "BUY" : "SELL"}
          </text>
        </g>
      ))}
      {/* Legend */}
      <rect x="40" y={H - 22} width="10" height="3" fill="#6366f1" />
      <text x="54" y={H - 16} fill="#6366f1" fontSize="8">SMA 20</text>
      <rect x="100" y={H - 22} width="10" height="3" fill="#f59e0b" />
      <text x="114" y={H - 16} fill="#f59e0b" fontSize="8">SMA 50</text>
      <rect x="160" y={H - 22} width="10" height="3" fill="#475569" />
      <text x="174" y={H - 16} fill="#94a3b8" fontSize="8">Price</text>
    </svg>
  );
}

function RegimeDiversificationSVG() {
  const W = 460;
  const H = 180;
  const regimes = [
    { label: "Bull Market", ctaCorr: 0.12, bondCorr: 0.08 },
    { label: "Sideways", ctaCorr: 0.04, bondCorr: 0.21 },
    { label: "Bear Market", ctaCorr: -0.31, bondCorr: -0.14 },
    { label: "Crisis", ctaCorr: -0.42, bondCorr: -0.38 },
    { label: "Recovery", ctaCorr: -0.18, bondCorr: 0.05 },
  ];
  const barW = 34;
  const gap = 28;
  const startX = 50;
  const midY = 110;
  const scaleH = 50;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
      <text x={W / 2} y="14" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        CTA Correlation to Equities by Market Regime
      </text>
      <line x1="30" y1={midY} x2={W - 20} y2={midY} stroke="#334155" strokeWidth="1" />
      <text x="20" y={midY - scaleH - 4} fill="#64748b" fontSize="8">+0.5</text>
      <text x="20" y={midY} fill="#64748b" fontSize="8" dominantBaseline="middle">0</text>
      <text x="20" y={midY + scaleH + 8} fill="#64748b" fontSize="8">-0.5</text>
      {regimes.map((r, i) => {
        const cx = startX + i * (barW + gap);
        const ctaH = Math.abs(r.ctaCorr) * scaleH * 2;
        const ctaY = r.ctaCorr >= 0 ? midY - ctaH : midY;
        const bondH = Math.abs(r.bondCorr) * scaleH * 2;
        const bondY = r.bondCorr >= 0 ? midY - bondH : midY;
        return (
          <g key={r.label}>
            {/* CTA bar */}
            <rect x={cx} y={ctaY} width={barW * 0.45} height={ctaH} fill="#6366f1" rx={2} opacity={0.85} />
            {/* Bond bar */}
            <rect x={cx + barW * 0.5} y={bondY} width={barW * 0.45} height={bondH} fill="#22c55e" rx={2} opacity={0.85} />
            <text x={cx + barW / 2} y={H - 8} textAnchor="middle" fill="#64748b" fontSize="7.5">
              {r.label}
            </text>
          </g>
        );
      })}
      {/* Legend */}
      <rect x="320" y="20" width="8" height="8" fill="#6366f1" rx={1} />
      <text x="332" y="28" fill="#6366f1" fontSize="8">CTA</text>
      <rect x="360" y="20" width="8" height="8" fill="#22c55e" rx={1} />
      <text x="372" y="28" fill="#22c55e" fontSize="8">Bonds</text>
    </svg>
  );
}

function BacktestPerformanceSVG() {
  const W = 480;
  const H = 200;
  resetSeed();
  const n = 120;
  // Generate monthly returns for Trend CTA vs S&P 500
  const ctaCum: number[] = [100];
  const spxCum: number[] = [100];
  for (let i = 1; i < n; i++) {
    const ctaRet = (rand() - 0.46) * 0.04 + 0.008;
    const spxRet = (rand() - 0.48) * 0.045 + 0.007;
    ctaCum.push(ctaCum[i - 1] * (1 + ctaRet));
    spxCum.push(spxCum[i - 1] * (1 + spxRet));
  }
  const allVals = [...ctaCum, ...spxCum];
  const minV = Math.min(...allVals) * 0.97;
  const maxV = Math.max(...allVals) * 1.03;
  const scX = (i: number) => 40 + (i / (n - 1)) * 400;
  const scY = (v: number) => 20 + ((maxV - v) / (maxV - minV)) * 160;

  const ctaPath = ctaCum.map((v, i) => `${i === 0 ? "M" : "L"} ${scX(i)} ${scY(v)}`).join(" ");
  const spxPath = spxCum.map((v, i) => `${i === 0 ? "M" : "L"} ${scX(i)} ${scY(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      <text x={W / 2} y="14" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        10-Year Backtest: Trend CTA vs S&P 500 (Cumulative)
      </text>
      <path d={spxPath} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,3" opacity={0.6} />
      <path d={ctaPath} fill="none" stroke="#6366f1" strokeWidth="2" />
      <path
        d={`${ctaPath} L ${scX(n - 1)} ${scY(minV)} L ${scX(0)} ${scY(minV)} Z`}
        fill="#6366f1"
        opacity="0.06"
      />
      <text x="44" y={scY(ctaCum[n - 1]) - 6} fill="#6366f1" fontSize="9">
        CTA {ctaCum[n - 1].toFixed(0)}
      </text>
      <text x="44" y={scY(spxCum[n - 1]) + 12} fill="#94a3b8" fontSize="9">
        SPX {spxCum[n - 1].toFixed(0)}
      </text>
      <line x1="30" y1={scY(100)} x2="440" y2={scY(100)} stroke="#334155" strokeDasharray="3,3" strokeWidth="1" />
      {/* Legend */}
      <rect x="40" y={H - 20} width="12" height="3" fill="#6366f1" />
      <text x="56" y={H - 14} fill="#6366f1" fontSize="8">Trend CTA</text>
      <rect x="130" y={H - 20} width="12" height="3" fill="#94a3b8" />
      <text x="146" y={H - 14} fill="#94a3b8" fontSize="8">S&P 500</text>
    </svg>
  );
}

function DiversificationContributionSVG() {
  const W = 460;
  const H = 180;
  const total = PORTFOLIO_ASSETS.reduce((sum, a) => sum + Math.abs(a.contribution), 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
      <text x={W / 2} y="14" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        Diversification Contribution by Asset Class
      </text>
      {PORTFOLIO_ASSETS.map((a, i) => {
        const y = 28 + i * 18;
        const maxBarW = 280;
        const barW = (Math.abs(a.contribution) / total) * maxBarW;
        const isPos = a.contribution >= 0;
        return (
          <g key={a.shortName}>
            <text x="58" y={y + 9} textAnchor="end" fill="#94a3b8" fontSize="8.5">{a.shortName}</text>
            <rect x={64} y={y} width={barW} height={13} fill={a.color} rx={2} opacity={0.8} />
            <text x={64 + barW + 4} y={y + 9} fill={isPos ? "#22c55e" : "#ef4444"} fontSize="8">
              {isPos ? "+" : ""}{a.contribution.toFixed(2)}
            </text>
            <text x={W - 60} y={y + 9} fill="#64748b" fontSize="8">
              wt: {a.weight.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CorrelationMatrixSVG() {
  resetSeed();
  const W = 460;
  const H = 300;
  const names = PORTFOLIO_ASSETS.map((a) => a.shortName);
  const n = names.length;
  // Generate symmetric correlation matrix with seeded PRNG
  const matrix: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i === j) return 1;
      if (j < i) return 0; // filled from upper
      const base = rand() * 0.6 - 0.2;
      // Make equities/credit correlated, bonds/rates negatively correlated with risk assets
      const overrides: Record<string, number> = {
        "SPX-HYG": 0.72,
        "SPX-EURUSD": 0.18,
        "SPX-UST10": -0.28,
        "SPX-CL": 0.31,
        "SPX-GC": -0.12,
        "SPX-BTC": 0.44,
        "UST10-GC": 0.31,
        "HYG-UST10": -0.41,
      };
      const key = `${names[i]}-${names[j]}`;
      const rkey = `${names[j]}-${names[i]}`;
      return overrides[key] ?? overrides[rkey] ?? base;
    })
  );
  // Mirror lower triangle
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      matrix[i][j] = matrix[j][i];
    }
  }

  const cellSize = 44;
  const offsetX = 46;
  const offsetY = 46;

  const corrColor = (v: number): string => {
    if (v >= 0.7) return "#1d4ed8";
    if (v >= 0.4) return "#3b82f6";
    if (v >= 0.1) return "#60a5fa";
    if (v >= -0.1) return "#334155";
    if (v >= -0.4) return "#f87171";
    if (v >= -0.7) return "#ef4444";
    return "#b91c1c";
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 300 }}>
      <text x={W / 2} y="16" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        Cross-Asset Correlation Matrix
      </text>
      {/* Row labels */}
      {names.map((name, i) => (
        <text
          key={`row-${name}`}
          x={offsetX - 4}
          y={offsetY + i * cellSize + cellSize / 2 + 4}
          textAnchor="end"
          fill="#94a3b8"
          fontSize="8.5"
        >
          {name}
        </text>
      ))}
      {/* Col labels */}
      {names.map((name, j) => (
        <text
          key={`col-${name}`}
          x={offsetX + j * cellSize + cellSize / 2}
          y={offsetY - 6}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="8.5"
        >
          {name}
        </text>
      ))}
      {/* Cells */}
      {matrix.map((row, i) =>
        row.map((v, j) => {
          const x = offsetX + j * cellSize;
          const y = offsetY + i * cellSize;
          return (
            <g key={`${i}-${j}`}>
              <rect x={x + 1} y={y + 1} width={cellSize - 2} height={cellSize - 2} fill={corrColor(v)} rx={2} opacity={0.8} />
              <text
                x={x + cellSize / 2}
                y={y + cellSize / 2 + 4}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="8"
                fontWeight={i === j ? "700" : "400"}
              >
                {v.toFixed(2)}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}

function CrisisPerformanceSVG() {
  const W = 480;
  const H = 220;
  const n = CRISIS_EVENTS.length;
  const barW = 12;
  const groupW = 50;
  const startX = 40;
  const midY = 110;
  const scaleH = 60;

  const scaleRet = (r: number) => midY - (r / 50) * scaleH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      <text x={W / 2} y="14" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        Crisis Performance: Market vs Momentum vs Trend
      </text>
      <line x1="30" y1={midY} x2={W - 20} y2={midY} stroke="#334155" strokeWidth="1" />
      <text x="8" y={midY - scaleH - 2} fill="#64748b" fontSize="7">+50%</text>
      <text x="8" y={midY} fill="#64748b" fontSize="7" dominantBaseline="middle">0%</text>
      <text x="8" y={midY + scaleH + 6} fill="#64748b" fontSize="7">-50%</text>

      {CRISIS_EVENTS.map((e, i) => {
        const cx = startX + i * groupW;
        const mktY = scaleRet(e.marketReturn);
        const momY = scaleRet(e.momentumReturn);
        const trendY = scaleRet(e.trendReturn);

        const drawBar = (y: number, color: string, offset: number) => {
          const isNeg = y > midY;
          return (
            <rect
              x={cx + offset}
              y={isNeg ? midY : y}
              width={barW}
              height={Math.abs(midY - y)}
              fill={color}
              rx={2}
              opacity={0.85}
            />
          );
        };

        return (
          <g key={e.label}>
            {drawBar(mktY, "#94a3b8", 0)}
            {drawBar(momY, "#6366f1", barW + 2)}
            {drawBar(trendY, "#22c55e", (barW + 2) * 2)}
            <text
              x={cx + groupW * 0.3}
              y={H - 8}
              textAnchor="middle"
              fill="#64748b"
              fontSize="7.5"
            >
              {e.label}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x="42" y={H - 24} width="8" height="8" fill="#94a3b8" rx={1} />
      <text x="54" y={H - 18} fill="#94a3b8" fontSize="8">Market</text>
      <rect x="110" y={H - 24} width="8" height="8" fill="#6366f1" rx={1} />
      <text x="122" y={H - 18} fill="#6366f1" fontSize="8">Momentum</text>
      <rect x="200" y={H - 24} width="8" height="8" fill="#22c55e" rx={1} />
      <text x="212" y={H - 18} fill="#22c55e" fontSize="8">Trend CTA</text>
    </svg>
  );
}

function SignalPipelineSVG() {
  const W = 480;
  const H = 180;
  const steps = [
    { label: "Raw\nPrices", icon: "DB", color: "#6366f1" },
    { label: "Return\nCalc", icon: "Σ", color: "#22c55e" },
    { label: "Z-Score\nNorm", icon: "z", color: "#f59e0b" },
    { label: "Vol\nScale", icon: "σ", color: "#ec4899" },
    { label: "Portfolio\nWeights", icon: "w", color: "#14b8a6" },
    { label: "Risk\nMgmt", icon: "R", color: "#a855f7" },
    { label: "Execute\nOrders", icon: "→", color: "#f97316" },
  ];
  const boxW = 52;
  const boxH = 44;
  const gap = 14;
  const totalW = steps.length * boxW + (steps.length - 1) * gap;
  const startX = (W - totalW) / 2;
  const midY = 80;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
      <text x={W / 2} y="16" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        Live Implementation Pipeline
      </text>
      {steps.map((step, i) => {
        const x = startX + i * (boxW + gap);
        return (
          <g key={step.label}>
            <rect x={x} y={midY - boxH / 2} width={boxW} height={boxH} rx={6} fill={step.color} opacity={0.15} />
            <rect x={x} y={midY - boxH / 2} width={boxW} height={boxH} rx={6} fill="none" stroke={step.color} strokeWidth="1.5" />
            <text x={x + boxW / 2} y={midY - 6} textAnchor="middle" fill={step.color} fontSize="13" fontWeight="700">
              {step.icon}
            </text>
            {step.label.split("\n").map((line, li) => (
              <text key={li} x={x + boxW / 2} y={midY + 10 + li * 11} textAnchor="middle" fill="#94a3b8" fontSize="7.5">
                {line}
              </text>
            ))}
            {i < steps.length - 1 && (
              <line
                x1={x + boxW + 2}
                y1={midY}
                x2={x + boxW + gap - 2}
                y2={midY}
                stroke="#475569"
                strokeWidth="1.5"
                markerEnd="url(#arrow)"
              />
            )}
          </g>
        );
      })}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
        </marker>
      </defs>
      <text x={W / 2} y={H - 8} textAnchor="middle" fill="#64748b" fontSize="8">
        Daily batch processing — signals computed after close, orders submitted pre-open
      </text>
    </svg>
  );
}

function ReturnAttributionSVG() {
  const W = 460;
  const H = 180;
  const segments = [
    { label: "Signal Strength", value: 42, color: "#6366f1" },
    { label: "Vol Scaling", value: 28, color: "#22c55e" },
    { label: "Diversification", value: 21, color: "#f59e0b" },
    { label: "Carry", value: 9, color: "#ec4899" },
  ];
  const totalW = 360;
  const barH = 32;
  const startX = 30;
  const startY = 60;
  let cumX = startX;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
      <text x={W / 2} y="16" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        Return Attribution — Source of Alpha
      </text>
      <text x={W / 2} y="30" textAnchor="middle" fill="#64748b" fontSize="9">
        Annual gross return decomposition (%)
      </text>
      {segments.map((seg) => {
        const w = (seg.value / 100) * totalW;
        const x = cumX;
        cumX += w;
        return (
          <g key={seg.label}>
            <rect x={x} y={startY} width={w} height={barH} fill={seg.color} opacity={0.85} />
            <text x={x + w / 2} y={startY + 18} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">
              {seg.value}%
            </text>
          </g>
        );
      })}
      {/* Legend */}
      {segments.map((seg, i) => (
        <g key={seg.label + "-leg"}>
          <rect x={30 + i * 110} y={startY + barH + 16} width="10" height="10" fill={seg.color} rx={2} />
          <text x={44 + i * 110} y={startY + barH + 25} fill="#94a3b8" fontSize="8">
            {seg.label}
          </text>
        </g>
      ))}
      <text x={W / 2} y={H - 8} textAnchor="middle" fill="#64748b" fontSize="8">
        Signal strength is the primary alpha source; vol scaling amplifies consistency
      </text>
    </svg>
  );
}

// ── Helper components ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color = "#6366f1",
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon size={14} style={{ color }} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="text-xl font-bold" style={{ color }}>
          {value}
        </div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function SignalBadge({ signal }: { signal: AssetClass["signal"] }) {
  const map: Record<AssetClass["signal"], { label: string; cls: string }> = {
    strong_bull: { label: "Strong Bull", cls: "bg-emerald-900 text-emerald-300 border-emerald-700" },
    bull: { label: "Bull", cls: "bg-green-900 text-green-300 border-green-800" },
    neutral: { label: "Neutral", cls: "bg-muted text-muted-foreground border-border" },
    bear: { label: "Bear", cls: "bg-red-900 text-red-300 border-red-800" },
    strong_bear: { label: "Strong Bear", cls: "bg-red-950 text-red-400 border-red-900" },
  };
  const { label, cls } = map[signal];
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function CrossAssetMomPage() {
  const [activeTab, setActiveTab] = useState("factor");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const selectedTrendModel = useMemo(
    () => TREND_MODELS.find((m) => m.shortName === selectedModel) ?? null,
    [selectedModel]
  );

  const selectedPortfolioAsset = useMemo(
    () => PORTFOLIO_ASSETS.find((a) => a.shortName === selectedAsset) ?? null,
    [selectedAsset]
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-indigo-900/40 border border-indigo-700/40">
            <TrendingUp size={22} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cross-Asset Momentum</h1>
            <p className="text-sm text-muted-foreground">
              Time-series momentum, cross-sectional signals, trend following &amp; AQR evidence
            </p>
          </div>
        </div>
        {/* Key metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <StatCard label="TSMOM Sharpe" value="0.88" sub="12-1 lookback" color="#6366f1" icon={BarChart3} />
          <StatCard label="CTA Avg Return" value="13.6%" sub="10yr backtest" color="#22c55e" icon={TrendingUp} />
          <StatCard label="Asset Classes" value="8" sub="diversified" color="#f59e0b" icon={Layers} />
          <StatCard label="Crisis Alpha" value="+14.6%" sub="2008 trend return" color="#ec4899" icon={Shield} />
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="factor" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-muted-foreground">
            <Activity size={13} className="mr-1.5" />
            Momentum Factor
          </TabsTrigger>
          <TabsTrigger value="trend" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-muted-foreground">
            <GitBranch size={13} className="mr-1.5" />
            Trend Following
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-muted-foreground">
            <Globe size={13} className="mr-1.5" />
            Multi-Asset Portfolio
          </TabsTrigger>
          <TabsTrigger value="implementation" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-muted-foreground">
            <Zap size={13} className="mr-1.5" />
            Strategy Implementation
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Momentum Factor ─────────────────────────────────────────── */}
        <TabsContent value="factor" className="data-[state=inactive]:hidden space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Definition */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-indigo-400 flex items-center gap-2">
                  <Info size={16} />
                  Price Momentum — Definition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Momentum is the empirical tendency for securities that have performed well over the past
                  3-12 months to continue outperforming in the near future. The canonical formulation uses
                  a{" "}
                  <span className="text-indigo-400 font-semibold">12-1 month lookback</span>: return from
                  12 months ago to 1 month ago, skipping the most recent month to avoid short-term reversal.
                </p>
                <div className="bg-muted rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground font-mono mb-1">Signal formula:</p>
                  <p className="text-sm text-emerald-400 font-mono">
                    MOM(t) = [P(t-1) / P(t-12)] - 1
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    where P(t) is price at time t (monthly). Skip t-0 to t-1 to avoid 1-month reversal.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  {[
                    { title: "Jegadeesh & Titman (1993)", body: "Found 10-12% annualized alpha sorting US stocks on 12-1m return, holding for 3-12m. Nobel-adjacent finding that launched factor investing." },
                    { title: "Cross-Sectional (XS-MOM)", body: "Rank all assets. Go long top decile, short bottom decile. Captures relative performance; beta-neutral within universe." },
                    { title: "Time-Series (TSMOM)", body: "Moskowitz, Ooi & Pedersen (2012). Each asset independently: long if past return > 0, short if < 0. Works across asset classes." },
                  ].map((item) => (
                    <div key={item.title} className="bg-muted/60 rounded-lg p-3 border border-border/50">
                      <p className="text-xs font-semibold text-indigo-300 mb-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cross-Sectional vs TSMOM diagram */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">Cross-Sectional vs Time-Series Momentum</CardTitle>
              </CardHeader>
              <CardContent>
                <CrossSectionalVsTSMOMDiagram />
                <p className="text-xs text-muted-foreground mt-2">
                  XS-MOM requires a ranking within universe (long top / short bottom relative to peers);
                  TSMOM evaluates each asset against its own history — more robust in multi-asset portfolios.
                </p>
              </CardContent>
            </Card>

            {/* Momentum crash */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-red-400 flex items-center gap-2">
                  <AlertTriangle size={15} />
                  Momentum Crash Risk — 2009 Reversal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MomentumCrash2009SVG />
                <div className="mt-3 bg-red-950/30 border border-red-800/40 rounded-lg p-3">
                  <p className="text-xs text-red-300 font-semibold mb-1">The March 2009 Crash Anatomy</p>
                  <p className="text-xs text-red-200/70 leading-relaxed">
                    In early 2009 (recovery from GFC), short-legs of momentum (recently beaten-down financials)
                    rebounded explosively +60-100%. The long-leg (defensive stocks that held up in 2008) lagged.
                    The combined effect produced the worst monthly momentum loss since 1932 — approximately -22%
                    in a single month. AQR documented this as a{" "}
                    <span className="text-red-300 font-medium">crowded unwind</span> driven by forced deleveraging.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { label: "Peak Drawdown", value: "-22.4%", color: "text-red-400" },
                    { label: "Duration", value: "3 months", color: "text-muted-foreground" },
                    { label: "Recovery", value: "18 months", color: "text-amber-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted rounded p-2 text-center">
                      <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Factor zoo + Sharpe by asset class */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-muted-foreground">Momentum in the Factor Zoo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { factor: "Market (Beta)", ic: 0.31, sr: 0.42, era: "CAPM 1964", color: "#6366f1" },
                    { factor: "Value (HML)", ic: 0.48, sr: 0.54, era: "FF3 1993", color: "#22c55e" },
                    { factor: "Size (SMB)", ic: 0.24, sr: 0.32, era: "FF3 1993", color: "#f59e0b" },
                    { factor: "Momentum (WML)", ic: 0.62, sr: 0.71, era: "Carhart 1997", color: "#ec4899" },
                    { factor: "Profitability (RMW)", ic: 0.41, sr: 0.49, era: "FF5 2015", color: "#14b8a6" },
                    { factor: "Quality (QMJ)", ic: 0.55, sr: 0.64, era: "AQR 2013", color: "#a855f7" },
                  ].map((f) => (
                    <div key={f.factor} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-36 shrink-0">{f.factor}</span>
                      <div className="flex-1 bg-muted rounded h-3 overflow-hidden">
                        <div className="h-full rounded" style={{ width: `${f.sr * 100}%`, backgroundColor: f.color }} />
                      </div>
                      <span className="text-xs font-mono w-10 text-right" style={{ color: f.color }}>
                        {f.sr.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground w-20 shrink-0">{f.era}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-1">
                    Momentum has the highest Sharpe ratio among traditional factors — also highest tail risk.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-muted-foreground">Momentum Sharpe by Asset Class</CardTitle>
                </CardHeader>
                <CardContent>
                  <MomentumSharpeBarChart />
                  <p className="text-xs text-muted-foreground mt-1">
                    Crypto shows highest Sharpe but extreme drawdowns. Bonds and Rates most consistent.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Persistence evidence */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">Momentum Persistence Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { period: "1-3 Months", alpha: "4.2% ann.", effect: "Reversal zone — avoid", sentiment: "negative", color: "#ef4444" },
                    { period: "3-12 Months", alpha: "11.4% ann.", effect: "Prime momentum window", sentiment: "strong", color: "#22c55e" },
                    { period: "12-36 Months", alpha: "6.8% ann.", effect: "Fading, still positive", sentiment: "moderate", color: "#f59e0b" },
                    { period: "36+ Months", alpha: "-2.1% ann.", effect: "Reversal to value", sentiment: "negative", color: "#ef4444" },
                  ].map((p) => (
                    <div key={p.period} className="bg-muted/60 border border-border/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground">{p.period}</p>
                      <p className="text-lg font-bold mt-1" style={{ color: p.color }}>{p.alpha}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.effect}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Source: Jegadeesh &amp; Titman (1993), Asness, Moskowitz &amp; Pedersen (AQR) cross-asset studies.
                  12-1 month formation period maximizes risk-adjusted return across all major universes.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Tab 2: Trend Following ──────────────────────────────────────────── */}
        <TabsContent value="trend" className="data-[state=inactive]:hidden space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* CTA Overview */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-indigo-400 flex items-center gap-2">
                  <Globe size={15} />
                  CTA / Managed Futures Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Commodity Trading Advisors (CTAs) are systematic managers that apply{" "}
                  <span className="text-indigo-400 font-semibold">trend following</span> across
                  futures markets — equities, bonds, currencies, commodities. The core premise: trends
                  persist due to behavioral biases (underreaction to information, herding) and structural
                  flows (central bank intervention, corporate hedging).
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "AUM (Managed Futures)", value: "$350B+", color: "#6366f1" },
                    { label: "Avg Gross Sharpe", value: "0.76", color: "#22c55e" },
                    { label: "Stock Corr (Crisis)", value: "-0.42", color: "#f59e0b" },
                    { label: "Crisis Alpha", value: "Yes", color: "#ec4899" },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted rounded p-2 text-center">
                      <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* MA Crossover */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">Long/Short Signal Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <MAcrossoverSVG />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="bg-muted/60 rounded-lg p-3 border border-border/50">
                    <p className="text-xs font-semibold text-emerald-400 mb-1">Long Signal</p>
                    <p className="text-xs text-muted-foreground">
                      Fast MA &gt; Slow MA — asset is in uptrend. Position = +1 (or fraction based on conviction).
                      Typical: SMA20 crosses above SMA50.
                    </p>
                  </div>
                  <div className="bg-muted/60 rounded-lg p-3 border border-border/50">
                    <p className="text-xs font-semibold text-red-400 mb-1">Short Signal</p>
                    <p className="text-xs text-muted-foreground">
                      Fast MA &lt; Slow MA — asset is in downtrend. Position = -1 (or fraction).
                      Shorting via futures is standard (no borrowing constraints).
                    </p>
                  </div>
                </div>
                <div className="mt-3 bg-muted rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground font-mono mb-1">Volatility-Scaled Position Size:</p>
                  <p className="text-sm text-amber-400 font-mono">
                    position = signal × (vol_target / asset_vol) × account_value
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    vol_target typically 10-15% annualized. asset_vol = rolling 60-day realized volatility.
                    This equalizes risk contribution regardless of asset class.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Regime diversification */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">Diversification Benefit — Correlation by Regime</CardTitle>
              </CardHeader>
              <CardContent>
                <RegimeDiversificationSVG />
                <p className="text-xs text-muted-foreground mt-2">
                  CTAs exhibit negative correlation to equities precisely when equities crash (crisis/bear regimes),
                  making them powerful diversifiers. Unlike bonds, CTA correlation is asymmetric and regime-dependent.
                </p>
              </CardContent>
            </Card>

            {/* 5 Trend Models */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">5 Trend Models Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {TREND_MODELS.map((m) => (
                    <button
                      key={m.shortName}
                      onClick={() => setSelectedModel(selectedModel === m.shortName ? null : m.shortName)}
                      className={`text-left rounded-lg p-3 border transition-all ${
                        selectedModel === m.shortName
                          ? "border-indigo-500 bg-indigo-900/20"
                          : "border-border/50 bg-muted/60 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold" style={{ color: m.color }}>
                          {m.shortName}
                        </span>
                        <span className="text-xs text-emerald-400 font-mono">{m.annualReturn}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{m.description}</p>
                      <div className="flex gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Sharpe</p>
                          <p className="text-xs font-semibold text-foreground">{m.sharpe}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">MaxDD</p>
                          <p className="text-xs font-semibold text-red-400">{m.maxDrawdown}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">WinRate</p>
                          <p className="text-xs font-semibold text-foreground">{m.winRate}%</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {selectedTrendModel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-indigo-950/30 border border-indigo-800/40 rounded-lg p-4"
                    >
                      <p className="text-sm font-semibold text-indigo-300 mb-2">
                        {selectedTrendModel.name} — Detail
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Annual Return</p>
                          <p className="text-base font-bold text-emerald-400">{selectedTrendModel.annualReturn}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
                          <p className="text-base font-bold text-indigo-300">{selectedTrendModel.sharpe}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Hold (days)</p>
                          <p className="text-base font-bold text-amber-400">{selectedTrendModel.avgHoldDays}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Backtest */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">Backtest Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <BacktestPerformanceSVG />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Tab 3: Multi-Asset Portfolio ───────────────────────────────────── */}
        <TabsContent value="portfolio" className="data-[state=inactive]:hidden space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* 8 Asset Class Signals */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-indigo-400 flex items-center gap-2">
                  <Globe size={15} />
                  8-Asset-Class Momentum Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {ASSET_CLASSES.map((a) => (
                    <div
                      key={a.shortName}
                      className="bg-muted/60 border border-border/50 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-muted-foreground">{a.shortName}</span>
                        <SignalBadge signal={a.signal} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{a.name}</p>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <p className="text-xs text-muted-foreground">Mom Sharpe</p>
                          <p className="text-sm font-semibold" style={{ color: a.color }}>{a.momentumSharpe}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ann. Ret</p>
                          <p className="text-sm font-semibold text-emerald-400">{a.annualReturn}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Max DD</p>
                          <p className="text-sm font-semibold text-red-400">{a.maxDrawdown}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Vol</p>
                          <p className="text-sm font-semibold text-muted-foreground">{a.volatility}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Construction */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">
                  Portfolio Construction — Equal Volatility Weighting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Each asset receives a weight proportional to its{" "}
                  <span className="text-indigo-400 font-semibold">inverse volatility</span>, so that every
                  position contributes equally to portfolio risk. Multiply by the momentum signal (±1 or
                  continuous z-score) to get the final position size.
                </p>
                <div className="bg-muted rounded-lg p-3 border border-border font-mono text-sm">
                  <p className="text-amber-400">w_i = (vol_target / vol_i) / Σ(vol_target / vol_j)</p>
                  <p className="text-muted-foreground text-xs mt-1">position_i = signal_i × w_i × portfolio_value</p>
                </div>
                <div className="space-y-2">
                  {PORTFOLIO_ASSETS.map((a) => (
                    <button
                      key={a.shortName}
                      onClick={() =>
                        setSelectedAsset(selectedAsset === a.shortName ? null : a.shortName)
                      }
                      className="w-full flex items-center gap-3 hover:bg-muted/50 rounded p-2 transition-colors text-left"
                    >
                      <span className="text-xs text-muted-foreground w-14 shrink-0">{a.shortName}</span>
                      <div className="flex-1 bg-muted rounded h-2">
                        <div
                          className="h-full rounded"
                          style={{ width: `${(a.weight / 15) * 100}%`, backgroundColor: a.color }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-10 text-right">{a.weight.toFixed(1)}%</span>
                      <span
                        className={`text-xs font-mono w-14 text-right ${
                          a.signal >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {a.signal >= 0 ? "+" : ""}{a.signal.toFixed(2)}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs w-12 text-center ${
                          a.signal >= 0
                            ? "border-emerald-700 text-emerald-400"
                            : "border-red-700 text-red-400"
                        }`}
                      >
                        {a.signal >= 0 ? "LONG" : "SHORT"}
                      </Badge>
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {selectedPortfolioAsset && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-indigo-950/30 border border-indigo-700/40 rounded-lg p-3"
                    >
                      <p className="text-xs font-semibold text-indigo-300 mb-1">
                        {selectedPortfolioAsset.name} ({selectedPortfolioAsset.shortName})
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Vol Target</span>
                          <p className="font-mono text-foreground">{selectedPortfolioAsset.volTarget}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current Vol</span>
                          <p className="font-mono text-amber-400">{selectedPortfolioAsset.currentVol}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Weight</span>
                          <p className="font-mono text-foreground">{selectedPortfolioAsset.weight.toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Contribution</span>
                          <p className={`font-mono ${selectedPortfolioAsset.contribution >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {selectedPortfolioAsset.contribution >= 0 ? "+" : ""}
                            {selectedPortfolioAsset.contribution.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Diversification contribution */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">Diversification Contribution</CardTitle>
              </CardHeader>
              <CardContent>
                <DiversificationContributionSVG />
              </CardContent>
            </Card>

            {/* Correlation matrix */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">8×8 Correlation Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <CorrelationMatrixSVG />
                <p className="text-xs text-muted-foreground mt-2">
                  Blue = positive correlation, Red = negative. SPX-HYG strongly positive (0.72); UST10-HYG
                  negative (-0.41) — bonds hedge credit risk. BTC shows moderate equity correlation (0.44).
                </p>
              </CardContent>
            </Card>

            {/* Crisis performance */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">
                  Crisis Performance — 2001 to 2022
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CrisisPerformanceSVG />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-3">
                    <p className="text-xs font-semibold text-emerald-400 mb-1">Trend CTA — Crisis Alpha</p>
                    <p className="text-xs text-emerald-200/70 leading-relaxed">
                      Trend following earned positive returns in 2001, 2008, 2011, 2015, 2020, and 2022 —
                      all major equity bear markets. The exception: 2009 momentum crash and V-shaped
                      recoveries that reverse trends quickly.
                    </p>
                  </div>
                  <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-3">
                    <p className="text-xs font-semibold text-amber-400 mb-1">2022 — The Best Year</p>
                    <p className="text-xs text-amber-200/70 leading-relaxed">
                      CTA strategies returned +28% average in 2022 as persistent inflation drove sustained
                      trends in bonds (short), commodities (long), and dollar (long). AQR Managed Futures
                      returned +43% while SPX fell -19%.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Tab 4: Strategy Implementation ────────────────────────────────── */}
        <TabsContent value="implementation" className="data-[state=inactive]:hidden space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Signal Construction */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-indigo-400 flex items-center gap-2">
                  <Activity size={15} />
                  Signal Construction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      title: "Z-Score Normalization",
                      desc: "Convert raw momentum signal to z-score: z = (mom - μ) / σ. Clamp to [-3, +3]. Enables cross-asset comparison and continuous position sizing.",
                      code: "z = (mom_12_1 - rolling_mean) / rolling_std",
                      color: "#6366f1",
                    },
                    {
                      title: "Lookback Sensitivity",
                      desc: "Short lookbacks (1-3m) are noisier; longer (12m+) have higher capacity but slower response. Most practitioners blend 3m, 6m, 12m signals with equal weighting.",
                      code: "signal = (z_3m + z_6m + z_12m) / 3",
                      color: "#22c55e",
                    },
                    {
                      title: "Volatility Scaling",
                      desc: "Divide signal by realized volatility to equalize risk contribution. Use exponentially weighted variance (EWMA) with ~60-day half-life for responsiveness.",
                      code: "pos = signal / ewma_vol × vol_target",
                      color: "#f59e0b",
                    },
                  ].map((item) => (
                    <div key={item.title} className="bg-muted/60 border border-border/50 rounded-lg p-3">
                      <p className="text-xs font-semibold mb-1" style={{ color: item.color }}>
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.desc}</p>
                      <code className="text-xs text-muted-foreground bg-card rounded px-2 py-1 block font-mono">
                        {item.code}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Execution Costs */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">Execution Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { source: "Futures Rolling (quarterly)", cost: "0.05–0.15%", impact: "Low", notes: "Roll spread at expiry; manageable for most markets", color: "#22c55e" },
                    { source: "Bid-Ask Spread", cost: "0.02–0.20%", impact: "Medium", notes: "Higher in less liquid markets (EM FX, small commodities)", color: "#f59e0b" },
                    { source: "Market Impact", cost: "0.10–0.50%", impact: "High", notes: "Scales with position size vs ADV; capacity-limiting at scale", color: "#ef4444" },
                    { source: "Slippage (signal delay)", cost: "0.05–0.30%", impact: "Medium", notes: "Executing 1 day late vs signal date — most impactful for fast signals", color: "#f59e0b" },
                    { source: "Financing (short positions)", cost: "0.50–2.0% ann.", impact: "Medium", notes: "Prime broker financing rate for short futures positions (varies by asset)", color: "#ec4899" },
                  ].map((row) => (
                    <div key={row.source} className="flex items-center gap-3 py-2 border-b border-border">
                      <span className="text-xs text-muted-foreground flex-1">{row.source}</span>
                      <span className="text-xs font-mono text-muted-foreground w-24 text-right">{row.cost}</span>
                      <Badge
                        variant="outline"
                        className="w-16 text-center text-xs"
                        style={{ borderColor: row.color + "60", color: row.color }}
                      >
                        {row.impact}
                      </Badge>
                      <span className="text-xs text-muted-foreground w-56 hidden lg:block">{row.notes}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 bg-amber-950/20 border border-amber-800/30 rounded-lg p-3">
                  <p className="text-xs text-amber-300 font-semibold mb-1">Capacity Constraints</p>
                  <p className="text-xs text-amber-200/70 leading-relaxed">
                    Market impact becomes significant at AUM &gt; $500M for single-asset strategies. Diversification
                    across 40-80 markets improves capacity significantly. AQR and Winton manage $10B+ through
                    careful execution scheduling and impact modeling.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Factor combination */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">
                  Momentum + Carry + Value Combination
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AQR's research (Asness, Moskowitz, Pedersen 2013) shows that momentum, carry, and value are
                  negatively correlated factors. Combining them dramatically improves the Sharpe ratio.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      name: "Momentum",
                      description: "12-1m return, vol-scaled",
                      sharpe: 0.71,
                      color: "#6366f1",
                      correlation: "Low to carry/value",
                    },
                    {
                      name: "Carry",
                      description: "Interest rate differential / roll yield",
                      sharpe: 0.62,
                      color: "#22c55e",
                      correlation: "Negative to momentum crashes",
                    },
                    {
                      name: "Value",
                      description: "PPP / yield spread / earnings yield",
                      sharpe: 0.54,
                      color: "#f59e0b",
                      correlation: "Negative to momentum",
                    },
                  ].map((f) => (
                    <div key={f.name} className="bg-muted/60 border border-border/50 rounded-lg p-3">
                      <p className="text-sm font-bold mb-1" style={{ color: f.color }}>{f.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">{f.description}</p>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">Sharpe:</span>
                        <span className="text-xs font-mono" style={{ color: f.color }}>{f.sharpe}</span>
                      </div>
                      <Progress value={f.sharpe * 100} className="h-1.5 mb-1" />
                      <p className="text-xs text-muted-foreground">{f.correlation}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-indigo-950/30 border border-indigo-700/40 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-indigo-300 font-semibold">Combined Portfolio (1/3 each)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Sharpe rises from ~0.6 individually to ~1.1 combined — subadditive volatility through low
                        factor correlation. This is the theoretical foundation of multi-factor style premia.
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-indigo-300">1.12</p>
                      <p className="text-xs text-muted-foreground">combined Sharpe</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pipeline */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">Live Implementation Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <SignalPipelineSVG />
              </CardContent>
            </Card>

            {/* Risk Management */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
                  <Shield size={14} />
                  Risk Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      title: "Stop-Loss",
                      rules: [
                        "Per-position: exit if -2× ATR from entry",
                        "Drawdown alert at -10% monthly",
                        "Tighten stops in high-vol regime",
                        "No averaging down on losing positions",
                      ],
                      color: "#ef4444",
                      icon: TrendingDown,
                    },
                    {
                      title: "Drawdown Limit",
                      rules: [
                        "Portfolio max drawdown cap: -20%",
                        "Reduce gross exposure 50% at -10% DD",
                        "Suspend new signals at -15% DD",
                        "Mandatory review at -20% DD",
                      ],
                      color: "#f59e0b",
                      icon: AlertTriangle,
                    },
                    {
                      title: "Correlation Cap",
                      rules: [
                        "Max pairwise corr between positions: 0.6",
                        "Reduce position if corr spike >0.8",
                        "Sector/country concentration limits",
                        "Stress test with 2008/2020 scenarios",
                      ],
                      color: "#a855f7",
                      icon: RefreshCw,
                    },
                  ].map((section) => (
                    <div
                      key={section.title}
                      className="bg-muted/60 border border-border/50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <section.icon size={13} style={{ color: section.color }} />
                        <p className="text-xs font-semibold" style={{ color: section.color }}>
                          {section.title}
                        </p>
                      </div>
                      <ul className="space-y-1">
                        {section.rules.map((r) => (
                          <li key={r} className="text-xs text-muted-foreground flex gap-1.5">
                            <span style={{ color: section.color }} className="mt-0.5">•</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Return attribution */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">Return Attribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ReturnAttributionSVG />
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Signal Strength", pct: 42, note: "Primary alpha driver", color: "#6366f1" },
                    { label: "Vol Scaling", pct: 28, note: "Consistency boost", color: "#22c55e" },
                    { label: "Diversification", pct: 21, note: "Cross-asset benefit", color: "#f59e0b" },
                    { label: "Carry", pct: 9, note: "Roll/coupon income", color: "#ec4899" },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted rounded p-2">
                      <p className="text-base font-bold" style={{ color: s.color }}>{s.pct}%</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AQR Evidence */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-indigo-400 flex items-center gap-2">
                  <Database size={15} />
                  AQR Evidence — Key Research
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      paper: "Moskowitz, Ooi & Pedersen (2012)",
                      title: "\"Time Series Momentum\"",
                      finding: "TSMOM earns positive returns across 58 liquid instruments over 25 years. The 12-month lookback is most robust. Strategy is distinct from cross-sectional momentum.",
                      sharpe: "0.88",
                      color: "#6366f1",
                    },
                    {
                      paper: "Asness, Moskowitz & Pedersen (2013)",
                      title: "\"Value and Momentum Everywhere\"",
                      finding: "Momentum and value premium exist in equities, bonds, commodities, and FX simultaneously. Low correlation between factors provides strong diversification.",
                      sharpe: "1.10 (combo)",
                      color: "#22c55e",
                    },
                    {
                      paper: "Daniel & Moskowitz (2016)",
                      title: "\"Momentum Crashes\"",
                      finding: "Momentum crashes occur in market rebounds after prolonged bear markets. Conditional on past market excess returns being very negative, momentum earns large negative returns.",
                      sharpe: "N/A (risk study)",
                      color: "#ef4444",
                    },
                    {
                      paper: "Hurst, Ooi & Pedersen (2017)",
                      title: "\"A Century of Evidence on Trend-Following\"",
                      finding: "Trend-following generated positive returns in each of 8 decades from 1880-2012 across equities, bonds, currencies, and commodities. Sharpe ~0.7 gross.",
                      sharpe: "0.76 (100yr)",
                      color: "#f59e0b",
                    },
                  ].map((p) => (
                    <div
                      key={p.paper}
                      className="bg-muted/60 border border-border/50 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-semibold" style={{ color: p.color }}>
                            {p.paper}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">{p.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.finding}</p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-xs text-muted-foreground">Sharpe</p>
                          <p className="text-sm font-mono font-bold" style={{ color: p.color }}>
                            {p.sharpe}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
