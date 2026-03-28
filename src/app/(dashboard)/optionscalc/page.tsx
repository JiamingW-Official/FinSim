"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  Layers,
  TrendingUp,
  GitCompare,
  Activity,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Info,
  Zap,
  Shield,
  BarChart2,
  Target,
  ArrowUpDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// ── Black-Scholes Engine ──────────────────────────────────────────────────────

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422820 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return x >= 0 ? 1 - p : p;
}

function normalPDF(x: number): number {
  return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
}

function bsPrice(S: number, K: number, T: number, r: number, sigma: number, isCall: boolean): number {
  if (T <= 0) return Math.max(0, isCall ? S - K : K - S);
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  if (isCall) return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
  return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
}

function bsGreeks(S: number, K: number, T: number, r: number, sigma: number, isCall: boolean) {
  if (T <= 0) {
    const intrinsic = Math.max(0, isCall ? S - K : K - S);
    return { price: intrinsic, delta: isCall ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, theta: 0, vega: 0, rho: 0 };
  }
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const price = isCall
    ? S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2)
    : K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
  const delta = isCall ? normalCDF(d1) : normalCDF(d1) - 1;
  const gamma = normalPDF(d1) / (S * sigma * sqrtT);
  const thetaRaw = isCall
    ? (-S * normalPDF(d1) * sigma / (2 * sqrtT) - r * K * Math.exp(-r * T) * normalCDF(d2))
    : (-S * normalPDF(d1) * sigma / (2 * sqrtT) + r * K * Math.exp(-r * T) * normalCDF(-d2));
  const theta = thetaRaw / 365;
  const vega = S * normalPDF(d1) * sqrtT / 100;
  const rho = isCall
    ? K * T * Math.exp(-r * T) * normalCDF(d2) / 100
    : -K * T * Math.exp(-r * T) * normalCDF(-d2) / 100;
  return { price, delta, gamma, theta, vega, rho };
}

// ── mulberry32 PRNG ───────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface OptionLeg {
  id: string;
  position: "buy" | "sell";
  type: "call" | "put";
  strike: number;
  expiry: number; // days
  qty: number;
}

interface StrategyPreset {
  name: string;
  description: string;
  tags: string[];
  legs: Omit<OptionLeg, "id">[];
}

interface GreeksPosition {
  id: string;
  ticker: string;
  type: "call" | "put";
  strike: number;
  expiry: number;
  qty: number;
  side: "long" | "short";
}

// ── Strategy Presets ──────────────────────────────────────────────────────────

function buildPresets(spot: number): Record<string, StrategyPreset> {
  const atm = Math.round(spot / 5) * 5;
  const otm1 = atm + 5;
  const otm2 = atm + 10;
  const itm1 = atm - 5;
  const itm2 = atm - 10;

  return {
    "Covered Call": {
      name: "Covered Call",
      description: "Own 100 shares + sell OTM call. Generates income, caps upside.",
      tags: ["Income", "Defined Risk"],
      legs: [
        { position: "sell", type: "call", strike: otm1, expiry: 30, qty: 1 },
      ],
    },
    "Protective Put": {
      name: "Protective Put",
      description: "Own shares + buy put for downside protection.",
      tags: ["Hedge", "Defined Risk"],
      legs: [
        { position: "buy", type: "put", strike: itm1, expiry: 30, qty: 1 },
      ],
    },
    "Bull Call Spread": {
      name: "Bull Call Spread",
      description: "Buy lower-strike call, sell higher-strike call. Bullish, defined risk.",
      tags: ["Speculation", "Defined Risk"],
      legs: [
        { position: "buy", type: "call", strike: atm, expiry: 45, qty: 1 },
        { position: "sell", type: "call", strike: otm2, expiry: 45, qty: 1 },
      ],
    },
    "Bear Put Spread": {
      name: "Bear Put Spread",
      description: "Buy higher-strike put, sell lower-strike put. Bearish, defined risk.",
      tags: ["Speculation", "Defined Risk"],
      legs: [
        { position: "buy", type: "put", strike: atm, expiry: 45, qty: 1 },
        { position: "sell", type: "put", strike: itm2, expiry: 45, qty: 1 },
      ],
    },
    "Long Straddle": {
      name: "Long Straddle",
      description: "Buy ATM call + put. Profits from big moves in either direction.",
      tags: ["Earnings Play", "Speculation"],
      legs: [
        { position: "buy", type: "call", strike: atm, expiry: 30, qty: 1 },
        { position: "buy", type: "put", strike: atm, expiry: 30, qty: 1 },
      ],
    },
    "Short Straddle": {
      name: "Short Straddle",
      description: "Sell ATM call + put. Profits from low volatility, unlimited risk.",
      tags: ["Income"],
      legs: [
        { position: "sell", type: "call", strike: atm, expiry: 30, qty: 1 },
        { position: "sell", type: "put", strike: atm, expiry: 30, qty: 1 },
      ],
    },
    "Iron Condor": {
      name: "Iron Condor",
      description: "Sell OTM strangle, buy wings. Maximum profit in range-bound markets.",
      tags: ["Income", "Defined Risk"],
      legs: [
        { position: "buy", type: "put", strike: itm2, expiry: 45, qty: 1 },
        { position: "sell", type: "put", strike: itm1, expiry: 45, qty: 1 },
        { position: "sell", type: "call", strike: otm1, expiry: 45, qty: 1 },
        { position: "buy", type: "call", strike: otm2, expiry: 45, qty: 1 },
      ],
    },
    "Butterfly Spread": {
      name: "Butterfly Spread",
      description: "Buy wing calls, sell 2x body calls. Max profit at body strike.",
      tags: ["Speculation", "Defined Risk"],
      legs: [
        { position: "buy", type: "call", strike: itm1, expiry: 30, qty: 1 },
        { position: "sell", type: "call", strike: atm, expiry: 30, qty: 2 },
        { position: "buy", type: "call", strike: otm1, expiry: 30, qty: 1 },
      ],
    },
    "Calendar Spread": {
      name: "Calendar Spread",
      description: "Sell near-term option, buy longer-dated same strike. Time decay play.",
      tags: ["Income"],
      legs: [
        { position: "sell", type: "call", strike: atm, expiry: 30, qty: 1 },
        { position: "buy", type: "call", strike: atm, expiry: 60, qty: 1 },
      ],
    },
    "Ratio Spread": {
      name: "Ratio Spread",
      description: "Buy 1 ATM call, sell 2 OTM calls. Profits from modest upside.",
      tags: ["Speculation"],
      legs: [
        { position: "buy", type: "call", strike: atm, expiry: 30, qty: 1 },
        { position: "sell", type: "call", strike: otm2, expiry: 30, qty: 2 },
      ],
    },
  };
}

// ── Volatility data (seeded) ──────────────────────────────────────────────────

const TICKERS = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "META", "GOOGL", "SPY", "QQQ", "AMD"];

function buildVolData() {
  return TICKERS.map((ticker, i) => {
    const rng = mulberry32(ticker.charCodeAt(0) * 13 + i * 37);
    const hv = 0.15 + rng() * 0.55;
    const iv = hv * (0.8 + rng() * 0.7);
    const iv52Low = hv * 0.5;
    const iv52High = hv * 2.2;
    const ivPct = (iv - iv52Low) / (iv52High - iv52Low);
    const ivRank = Math.min(1, Math.max(0, ivPct));
    return { ticker, hv, iv, ivRank, ivPct: ivPct * 100, iv52Low, iv52High };
  });
}

const VOL_DATA = buildVolData();

function buildSmileData(ticker: string, spot: number) {
  const rng = mulberry32(ticker.charCodeAt(0) * 7);
  const baseIV = VOL_DATA.find(v => v.ticker === ticker)?.iv ?? 0.3;
  const strikes = [-30, -20, -15, -10, -5, 0, 5, 10, 15, 20, 30];
  return strikes.map(pct => {
    const K = spot * (1 + pct / 100);
    const skew = pct < 0 ? baseIV * (1 + Math.abs(pct) * 0.015 * (0.5 + rng())) : baseIV * (1 + pct * 0.005 * rng());
    return { strike: Math.round(K), pct, iv: skew };
  });
}

function buildTermStructure(ticker: string) {
  const rng = mulberry32(ticker.charCodeAt(0) * 11);
  const baseIV = VOL_DATA.find(v => v.ticker === ticker)?.iv ?? 0.3;
  const dtes = [7, 30, 60, 90, 180, 365];
  return dtes.map(dte => {
    const termPrem = dte < 30 ? 1.1 + rng() * 0.2 : dte > 90 ? 0.85 + rng() * 0.15 : 1.0 + rng() * 0.1;
    return { dte, iv: baseIV * termPrem };
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2) {
  return n.toFixed(decimals);
}

function fmtDollar(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function clsNum(n: number) {
  return n >= 0 ? "text-emerald-400" : "text-red-400";
}

function computePayoff(legs: OptionLeg[], spot: number, S: number, r: number, sigma: number): number {
  let pnl = 0;
  for (const leg of legs) {
    const T = leg.expiry / 365;
    const premium = bsPrice(spot, leg.strike, T, r, sigma, leg.type === "call");
    const intrinsic = leg.type === "call" ? Math.max(0, S - leg.strike) : Math.max(0, leg.strike - S);
    const legPnl = (intrinsic - premium) * leg.qty * 100;
    pnl += leg.position === "buy" ? legPnl : -legPnl;
  }
  return pnl;
}

function computeBreakevens(legs: OptionLeg[], spot: number, r: number, sigma: number): number[] {
  const low = spot * 0.5;
  const high = spot * 1.5;
  const steps = 500;
  const bes: number[] = [];
  let prev = computePayoff(legs, spot, low, r, sigma);
  for (let i = 1; i <= steps; i++) {
    const S = low + (high - low) * (i / steps);
    const curr = computePayoff(legs, spot, S, r, sigma);
    if ((prev < 0 && curr >= 0) || (prev >= 0 && curr < 0)) {
      bes.push(Math.round((S + (S - (high - low) / steps)) / 2));
    }
    prev = curr;
  }
  return [...new Set(bes)];
}

function computeProbabilityOfProfit(legs: OptionLeg[], spot: number, sigma: number, expiry: number): number {
  const steps = 200;
  const T = expiry / 365;
  const low = spot * 0.4;
  const high = spot * 1.6;
  let profitCount = 0;
  for (let i = 0; i <= steps; i++) {
    const S = low + (high - low) * (i / steps);
    const pnl = computePayoff(legs, spot, S, 0.05, sigma);
    if (pnl > 0) profitCount++;
  }
  return profitCount / (steps + 1);
}

// ── SVG Payoff Chart ──────────────────────────────────────────────────────────

function PayoffChart({
  legs,
  spot,
  r,
  sigma,
  width = 540,
  height = 200,
  colors,
  extraLegsGroups,
}: {
  legs: OptionLeg[];
  spot: number;
  r: number;
  sigma: number;
  width?: number;
  height?: number;
  colors?: string[];
  extraLegsGroups?: { legs: OptionLeg[]; color: string }[];
}) {
  const low = spot * 0.7;
  const high = spot * 1.3;
  const steps = 100;
  const pad = { top: 16, bottom: 28, left: 48, right: 16 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const mainPnls = useMemo(() => {
    return Array.from({ length: steps + 1 }, (_, i) => {
      const S = low + (high - low) * (i / steps);
      return { S, pnl: computePayoff(legs, spot, S, r, sigma) };
    });
  }, [legs, spot, r, sigma, low, high]);

  const extraPnlGroups = useMemo(() => {
    if (!extraLegsGroups) return [];
    return extraLegsGroups.map(g => ({
      color: g.color,
      data: Array.from({ length: steps + 1 }, (_, i) => {
        const S = low + (high - low) * (i / steps);
        return { S, pnl: computePayoff(g.legs, spot, S, r, sigma) };
      }),
    }));
  }, [extraLegsGroups, spot, r, sigma, low, high]);

  const allPnls = [
    ...mainPnls.map(d => d.pnl),
    ...extraPnlGroups.flatMap(g => g.data.map(d => d.pnl)),
  ];
  const minPnl = Math.min(...allPnls);
  const maxPnl = Math.max(...allPnls);
  const range = maxPnl - minPnl || 1;
  const pad2 = range * 0.1;

  const toX = (S: number) => pad.left + ((S - low) / (high - low)) * innerW;
  const toY = (pnl: number) => pad.top + ((maxPnl + pad2 - pnl) / (range + 2 * pad2)) * innerH;

  const makePath = (data: { S: number; pnl: number }[]) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.S).toFixed(1)} ${toY(d.pnl).toFixed(1)}`).join(" ");

  const mainPath = makePath(mainPnls);
  const zeroY = toY(0);
  const xTicks = [low, spot * 0.85, spot, spot * 1.15, high];
  const yTicks = [minPnl, 0, maxPnl];

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
      {/* Zero line */}
      <line x1={pad.left} y1={zeroY} x2={width - pad.right} y2={zeroY} stroke="#374151" strokeWidth={1} strokeDasharray="4 3" />
      {/* Spot line */}
      <line x1={toX(spot)} y1={pad.top} x2={toX(spot)} y2={height - pad.bottom} stroke="#6B7280" strokeWidth={1} strokeDasharray="3 3" />

      {/* Extra strategy lines */}
      {extraPnlGroups.map((g, i) => (
        <path key={i} d={makePath(g.data)} fill="none" stroke={g.color} strokeWidth={1.5} opacity={0.7} />
      ))}

      {/* Main strategy line — split above/below zero */}
      <defs>
        <clipPath id={`clip-above-${width}`}>
          <rect x={pad.left} y={pad.top} width={innerW} height={Math.max(0, zeroY - pad.top)} />
        </clipPath>
        <clipPath id={`clip-below-${width}`}>
          <rect x={pad.left} y={zeroY} width={innerW} height={Math.max(0, height - pad.bottom - zeroY)} />
        </clipPath>
      </defs>
      <path d={mainPath} fill="none" stroke="#10B981" strokeWidth={2} clipPath={`url(#clip-above-${width})`} />
      <path d={mainPath} fill="none" stroke="#EF4444" strokeWidth={2} clipPath={`url(#clip-below-${width})`} />

      {/* X-axis ticks */}
      {xTicks.map((S, i) => (
        <g key={i}>
          <line x1={toX(S)} y1={height - pad.bottom} x2={toX(S)} y2={height - pad.bottom + 4} stroke="#6B7280" strokeWidth={1} />
          <text x={toX(S)} y={height - 6} textAnchor="middle" fill="#9CA3AF" fontSize={9}>
            {S >= 1000 ? `${(S / 1000).toFixed(1)}k` : S.toFixed(0)}
          </text>
        </g>
      ))}

      {/* Y-axis ticks */}
      {[...new Set(yTicks)].map((pnl, i) => (
        <g key={i}>
          <text x={pad.left - 4} y={toY(pnl) + 3} textAnchor="end" fill="#9CA3AF" fontSize={9}>
            {pnl >= 0 ? "+" : ""}{pnl >= 1000 || pnl <= -1000 ? `${(pnl / 1000).toFixed(1)}k` : pnl.toFixed(0)}
          </text>
        </g>
      ))}

      {/* Current spot dot */}
      <circle cx={toX(spot)} cy={toY(computePayoff(legs, spot, spot, r, sigma))} r={3} fill="#60A5FA" />
    </svg>
  );
}

// ── Greek Sensitivity Chart ───────────────────────────────────────────────────

function GreekSensitivityChart({
  S0, K, T, r, sigma, isCall, greek,
}: {
  S0: number; K: number; T: number; r: number; sigma: number; isCall: boolean; greek: "delta" | "gamma" | "theta" | "vega";
}) {
  const low = S0 * 0.8;
  const high = S0 * 1.2;
  const steps = 60;
  const width = 300; const height = 100;
  const pad = { top: 8, bottom: 20, left: 40, right: 8 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const data = useMemo(() => Array.from({ length: steps + 1 }, (_, i) => {
    const S = low + (high - low) * (i / steps);
    const g = bsGreeks(S, K, T, r, sigma, isCall);
    return { S, val: g[greek] };
  }), [low, high, K, T, r, sigma, isCall, greek]);

  const vals = data.map(d => d.val);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const toX = (S: number) => pad.left + ((S - low) / (high - low)) * innerW;
  const toY = (v: number) => pad.top + ((maxV - v) / range) * innerH;
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.S).toFixed(1)} ${toY(d.val).toFixed(1)}`).join(" ");
  const zeroY = toY(0);

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
      {minV < 0 && <line x1={pad.left} y1={zeroY} x2={width - pad.right} y2={zeroY} stroke="#374151" strokeWidth={1} strokeDasharray="3 2" />}
      <line x1={toX(S0)} y1={pad.top} x2={toX(S0)} y2={height - pad.bottom} stroke="#6B7280" strokeWidth={1} strokeDasharray="3 2" />
      <path d={path} fill="none" stroke="#818CF8" strokeWidth={1.5} />
      <circle cx={toX(S0)} cy={toY(bsGreeks(S0, K, T, r, sigma, isCall)[greek])} r={3} fill="#F59E0B" />
      <text x={pad.left - 2} y={pad.top + 4} textAnchor="end" fill="#9CA3AF" fontSize={8}>{maxV.toFixed(3)}</text>
      <text x={pad.left - 2} y={height - pad.bottom} textAnchor="end" fill="#9CA3AF" fontSize={8}>{minV.toFixed(3)}</text>
      <text x={toX(S0)} y={height - 4} textAnchor="middle" fill="#9CA3AF" fontSize={8}>Spot</text>
    </svg>
  );
}

// ── Gauge SVG ─────────────────────────────────────────────────────────────────

function GaugeSVG({ value, label, color }: { value: number; label: string; color: string }) {
  const angle = -135 + value * 2.7;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const cx = 60; const cy = 56; const r = 44;
  const startAngle = -135;
  const endAngle = 135;
  const startX = cx + r * Math.cos(toRad(startAngle));
  const startY = cy + r * Math.sin(toRad(startAngle));
  const endX = cx + r * Math.cos(toRad(endAngle));
  const endY = cy + r * Math.sin(toRad(endAngle));
  const needleX = cx + (r - 8) * Math.cos(toRad(angle));
  const needleY = cy + (r - 8) * Math.sin(toRad(angle));

  return (
    <svg width={120} height={76} viewBox="0 0 120 76">
      <path d={`M ${startX} ${startY} A ${r} ${r} 0 1 1 ${endX} ${endY}`} fill="none" stroke="#1F2937" strokeWidth={8} />
      <path d={`M ${startX} ${startY} A ${r} ${r} 0 1 1 ${needleX} ${needleY}`} fill="none" stroke={color} strokeWidth={8} />
      <circle cx={cx} cy={cy} r={4} fill="#6B7280" />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#F9FAFB" strokeWidth={1.5} />
      <text x={cx} y={cy + 18} textAnchor="middle" fill="#F9FAFB" fontSize={13} fontWeight="bold">{value.toFixed(0)}</text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill="#9CA3AF" fontSize={7}>{label}</text>
    </svg>
  );
}

// ── IV Smile Chart ────────────────────────────────────────────────────────────

function IVSmileChart({ data }: { data: { strike: number; pct: number; iv: number }[] }) {
  const width = 340; const height = 140;
  const pad = { top: 12, bottom: 28, left: 44, right: 12 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const minIV = Math.min(...data.map(d => d.iv));
  const maxIV = Math.max(...data.map(d => d.iv));
  const ivRange = maxIV - minIV || 0.01;
  const minPct = data[0].pct; const maxPct = data[data.length - 1].pct;

  const toX = (pct: number) => pad.left + ((pct - minPct) / (maxPct - minPct)) * innerW;
  const toY = (iv: number) => pad.top + ((maxIV - iv) / ivRange) * innerH;
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.pct).toFixed(1)} ${toY(d.iv).toFixed(1)}`).join(" ");

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke="#818CF8" strokeWidth={2} />
      {data.map((d, i) => (
        <circle key={i} cx={toX(d.pct)} cy={toY(d.iv)} r={2.5} fill="#818CF8" />
      ))}
      {[-20, -10, 0, 10, 20].map(p => (
        <g key={p}>
          <text x={toX(p)} y={height - 8} textAnchor="middle" fill="#9CA3AF" fontSize={8}>{p > 0 ? `+${p}` : p}%</text>
        </g>
      ))}
      <text x={pad.left - 2} y={pad.top + 4} textAnchor="end" fill="#9CA3AF" fontSize={8}>{(maxIV * 100).toFixed(0)}%</text>
      <text x={pad.left - 2} y={height - pad.bottom} textAnchor="end" fill="#9CA3AF" fontSize={8}>{(minIV * 100).toFixed(0)}%</text>
      <line x1={toX(0)} y1={pad.top} x2={toX(0)} y2={height - pad.bottom} stroke="#6B7280" strokeWidth={1} strokeDasharray="3 2" />
    </svg>
  );
}

// ── Term Structure Chart ──────────────────────────────────────────────────────

function TermStructureChart({ data }: { data: { dte: number; iv: number }[] }) {
  const width = 340; const height = 140;
  const pad = { top: 12, bottom: 28, left: 44, right: 12 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const ivs = data.map(d => d.iv);
  const minIV = Math.min(...ivs); const maxIV = Math.max(...ivs);
  const ivRange = maxIV - minIV || 0.01;
  const dtes = data.map(d => d.dte);
  const minDTE = dtes[0]; const maxDTE = dtes[dtes.length - 1];

  const toX = (dte: number) => pad.left + ((dte - minDTE) / (maxDTE - minDTE)) * innerW;
  const toY = (iv: number) => pad.top + ((maxIV - iv) / ivRange) * innerH;
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.dte).toFixed(1)} ${toY(d.iv).toFixed(1)}`).join(" ");

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke="#34D399" strokeWidth={2} />
      {data.map((d, i) => (
        <circle key={i} cx={toX(d.dte)} cy={toY(d.iv)} r={2.5} fill="#34D399" />
      ))}
      {[30, 90, 180, 365].map(dte => (
        <text key={dte} x={toX(dte)} y={height - 8} textAnchor="middle" fill="#9CA3AF" fontSize={8}>{dte}d</text>
      ))}
      <text x={pad.left - 2} y={pad.top + 4} textAnchor="end" fill="#9CA3AF" fontSize={8}>{(maxIV * 100).toFixed(0)}%</text>
      <text x={pad.left - 2} y={height - pad.bottom} textAnchor="end" fill="#9CA3AF" fontSize={8}>{(minIV * 100).toFixed(0)}%</text>
    </svg>
  );
}

// ── Theta Decay Chart ─────────────────────────────────────────────────────────

function ThetaDecayChart({ S, K, r, sigma, isCall }: { S: number; K: number; r: number; sigma: number; isCall: boolean }) {
  const width = 360; const height = 160;
  const pad = { top: 12, bottom: 28, left: 48, right: 12 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxDays = 90;
  const data = useMemo(() => Array.from({ length: 91 }, (_, i) => {
    const daysLeft = maxDays - i;
    const T = Math.max(daysLeft, 0.5) / 365;
    return { days: daysLeft, price: bsPrice(S, K, T, r, sigma, isCall) };
  }), [S, K, r, sigma, isCall]);

  const prices = data.map(d => d.price);
  const maxP = Math.max(...prices);
  const minP = 0;
  const range = maxP - minP || 1;

  const toX = (days: number) => pad.left + ((maxDays - days) / maxDays) * innerW;
  const toY = (p: number) => pad.top + ((maxP - p) / range) * innerH;
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.days).toFixed(1)} ${toY(d.price).toFixed(1)}`).join(" ");

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke="#F59E0B" strokeWidth={2} />
      {[90, 60, 30, 7, 0].map(d => (
        <g key={d}>
          <line x1={toX(d)} y1={pad.top} x2={toX(d)} y2={height - pad.bottom} stroke="#374151" strokeWidth={1} strokeDasharray="3 2" />
          <text x={toX(d)} y={height - 8} textAnchor="middle" fill="#9CA3AF" fontSize={8}>{d}d</text>
        </g>
      ))}
      <text x={pad.left - 2} y={pad.top + 4} textAnchor="end" fill="#9CA3AF" fontSize={8}>${maxP.toFixed(2)}</text>
      <text x={pad.left - 2} y={height - pad.bottom} textAnchor="end" fill="#9CA3AF" fontSize={8}>$0</text>
    </svg>
  );
}

// ── Metric Row ────────────────────────────────────────────────────────────────

function MetricRow({ label, value, colored, info }: { label: string; value: string; colored?: boolean; info?: string }) {
  const color = colored
    ? value.startsWith("+") ? "text-emerald-400" : value.startsWith("-") ? "text-red-400" : "text-white"
    : "text-white";
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
      <span className="text-xs text-gray-400 flex items-center gap-1">
        {label}
        {info && <Info size={10} className="text-gray-600" title={info} />}
      </span>
      <span className={`text-xs font-mono font-medium ${color}`}>{value}</span>
    </div>
  );
}

// ── Tab 1: Single Option Calculator ──────────────────────────────────────────

function SingleOptionTab() {
  const [spot, setSpot] = useState(150);
  const [strike, setStrike] = useState(150);
  const [dte, setDte] = useState(30);
  const [ivPct, setIvPct] = useState(30);
  const [rfr, setRfr] = useState(5);
  const [isCall, setIsCall] = useState(true);
  const [isBuy, setIsBuy] = useState(true);
  const [showGreek, setShowGreek] = useState<"delta" | "gamma" | "theta" | "vega">("delta");

  const T = dte / 365;
  const sigma = ivPct / 100;
  const r = rfr / 100;
  const g = useMemo(() => bsGreeks(spot, strike, T, r, sigma, isCall), [spot, strike, T, r, sigma, isCall]);

  const intrinsic = Math.max(0, isCall ? spot - strike : strike - spot);
  const timeValue = Math.max(0, g.price - intrinsic);
  const scenarios = [-20, -10, -5, 0, 5, 10, 20].map(pct => {
    const S = spot * (1 + pct / 100);
    const val = Math.max(0, isCall ? S - strike : strike - S);
    const pnl = isBuy ? (val - g.price) * 100 : (g.price - val) * 100;
    return { pct, S, pnl };
  });

  const legs: OptionLeg[] = [{ id: "1", position: isBuy ? "buy" : "sell", type: isCall ? "call" : "put", strike, expiry: dte, qty: 1 }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Inputs */}
      <Card className="lg:col-span-2 bg-gray-900 border-gray-800 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Calculator size={14} /> Parameters</h3>

        <div className="flex gap-2">
          <button onClick={() => setIsCall(true)} className={`flex-1 py-1.5 text-xs rounded font-medium transition-colors ${isCall ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>Call</button>
          <button onClick={() => setIsCall(false)} className={`flex-1 py-1.5 text-xs rounded font-medium transition-colors ${!isCall ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>Put</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsBuy(true)} className={`flex-1 py-1.5 text-xs rounded font-medium transition-colors ${isBuy ? "bg-emerald-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>Buy</button>
          <button onClick={() => setIsBuy(false)} className={`flex-1 py-1.5 text-xs rounded font-medium transition-colors ${!isBuy ? "bg-red-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>Sell</button>
        </div>

        {(
          [
            { label: `Stock Price: $${spot}`, val: spot, set: setSpot, min: 50, max: 500, step: 1 },
            { label: `Strike Price: $${strike}`, val: strike, set: setStrike, min: 50, max: 500, step: 1 },
            { label: `Days to Expiry: ${dte}d`, val: dte, set: setDte, min: 1, max: 365, step: 1 },
            { label: `Implied Volatility: ${ivPct}%`, val: ivPct, set: setIvPct, min: 1, max: 200, step: 1 },
            { label: `Risk-Free Rate: ${rfr}%`, val: rfr, set: setRfr, min: 0, max: 20, step: 0.1 },
          ] as { label: string; val: number; set: (v: number) => void; min: number; max: number; step: number }[]
        ).map(({ label, val, set, min, max, step }) => (
          <div key={label.split(":")[0]} className="space-y-1">
            <label className="text-xs text-gray-400">{label}</label>
            <Slider value={[val]} onValueChange={([v]) => set(v)} min={min} max={max} step={step} className="w-full" />
          </div>
        ))}
      </Card>

      {/* Outputs */}
      <div className="lg:col-span-3 space-y-4">
        {/* Metrics */}
        <Card className="bg-gray-900 border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Option Metrics</h3>
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <MetricRow label="Theoretical Price" value={`$${fmt(g.price)}`} />
              <MetricRow label="Intrinsic Value" value={`$${fmt(intrinsic)}`} />
              <MetricRow label="Time Value" value={`$${fmt(timeValue)}`} />
              <MetricRow label="Moneyness" value={spot > strike ? (isCall ? "ITM" : "OTM") : spot < strike ? (isCall ? "OTM" : "ITM") : "ATM"} />
            </div>
            <div>
              <MetricRow label="Delta" value={fmt(g.delta, 4)} info="Price change per $1 move" />
              <MetricRow label="Gamma" value={fmt(g.gamma, 4)} info="Delta change per $1 move" />
              <MetricRow label="Theta (per day)" value={fmtDollar(g.theta * 100)} colored info="Daily time decay in dollars" />
              <MetricRow label="Vega (per 1% IV)" value={fmtDollar(g.vega * 100)} colored info="P&L change per 1% IV move" />
              <MetricRow label="Rho (per 1%)" value={fmtDollar(g.rho * 100)} colored info="P&L change per 1% rate move" />
            </div>
          </div>
        </Card>

        {/* Payoff Diagram */}
        <Card className="bg-gray-900 border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Payoff at Expiry (1 contract = 100 shares)</h3>
          <PayoffChart legs={legs} spot={spot} r={r} sigma={sigma} height={180} />
        </Card>

        {/* Greeks sensitivity */}
        <Card className="bg-gray-900 border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Greeks Sensitivity (±20% stock range)</h3>
            <div className="flex gap-1">
              {(["delta", "gamma", "theta", "vega"] as const).map(gk => (
                <button key={gk} onClick={() => setShowGreek(gk)} className={`px-2 py-0.5 text-xs rounded transition-colors ${showGreek === gk ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400"}`}>{gk}</button>
              ))}
            </div>
          </div>
          <GreekSensitivityChart S0={spot} K={strike} T={T} r={r} sigma={sigma} isCall={isCall} greek={showGreek} />
        </Card>

        {/* What-if table */}
        <Card className="bg-gray-900 border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">What-If P&L Scenarios at Expiry</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 pb-1.5 font-medium">Move</th>
                  <th className="text-right text-gray-400 pb-1.5 font-medium">Stock Price</th>
                  <th className="text-right text-gray-400 pb-1.5 font-medium">P&L (1 contract)</th>
                  <th className="text-right text-gray-400 pb-1.5 font-medium">Return</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map(s => (
                  <tr key={s.pct} className={`border-b border-gray-800/50 ${s.pct === 0 ? "bg-gray-800/30" : ""}`}>
                    <td className="py-1 text-gray-400">{s.pct > 0 ? `+${s.pct}` : s.pct}%</td>
                    <td className="py-1 text-right text-gray-300">${s.S.toFixed(2)}</td>
                    <td className={`py-1 text-right font-mono ${clsNum(s.pnl)}`}>{fmtDollar(s.pnl)}</td>
                    <td className={`py-1 text-right font-mono ${clsNum(s.pnl)}`}>{fmt((s.pnl / (g.price * 100)) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 2: Strategy Builder ───────────────────────────────────────────────────

function StrategyBuilderTab() {
  const [spot, setSpot] = useState(150);
  const [sigma, setSigma] = useState(0.30);
  const [r] = useState(0.05);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [legs, setLegs] = useState<OptionLeg[]>([]);
  const [stressIV, setStressIV] = useState<"normal" | "double" | "half">("normal");

  const presets = useMemo(() => buildPresets(spot), [spot]);
  const effectiveSigma = stressIV === "double" ? sigma * 2 : stressIV === "half" ? sigma * 0.5 : sigma;

  const addLeg = useCallback(() => {
    setLegs(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      position: "buy",
      type: "call",
      strike: Math.round(spot / 5) * 5,
      expiry: 30,
      qty: 1,
    }]);
  }, [spot]);

  const updateLeg = useCallback((id: string, field: keyof OptionLeg, val: string | number) => {
    setLegs(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l));
  }, []);

  const removeLeg = useCallback((id: string) => setLegs(prev => prev.filter(l => l.id !== id)), []);

  const applyPreset = useCallback((name: string) => {
    setSelectedPreset(name);
    const p = buildPresets(spot)[name];
    if (p) {
      setLegs(p.legs.map((l, i) => ({ ...l, id: `leg-${i}` })));
    }
  }, [spot]);

  const netGreeks = useMemo(() => {
    let delta = 0, gamma = 0, theta = 0, vega = 0;
    for (const leg of legs) {
      const T = leg.expiry / 365;
      const g = bsGreeks(spot, leg.strike, T, r, sigma, leg.type === "call");
      const sign = leg.position === "buy" ? 1 : -1;
      const qty = leg.qty * 100;
      delta += sign * g.delta * qty;
      gamma += sign * g.gamma * qty;
      theta += sign * g.theta * qty;
      vega += sign * g.vega * qty;
    }
    return { delta, gamma, theta, vega };
  }, [legs, spot, r, sigma]);

  const breakevens = useMemo(() => legs.length > 0 ? computeBreakevens(legs, spot, r, effectiveSigma) : [], [legs, spot, r, effectiveSigma]);
  const pop = useMemo(() => legs.length > 0 ? computeProbabilityOfProfit(legs, spot, effectiveSigma, legs[0]?.expiry ?? 30) : 0, [legs, spot, effectiveSigma]);

  const pnlRange = useMemo(() => {
    if (legs.length === 0) return { maxProfit: 0, maxLoss: 0 };
    const pnls: number[] = [];
    for (let i = 0; i <= 200; i++) {
      const S = spot * 0.5 + spot * (i / 200);
      pnls.push(computePayoff(legs, spot, S, r, effectiveSigma));
    }
    return {
      maxProfit: Math.max(...pnls),
      maxLoss: Math.min(...pnls),
    };
  }, [legs, spot, r, effectiveSigma]);

  const tagColors: Record<string, string> = {
    "Income": "bg-emerald-900/50 text-emerald-300",
    "Defined Risk": "bg-blue-900/50 text-blue-300",
    "Earnings Play": "bg-purple-900/50 text-purple-300",
    "Speculation": "bg-amber-900/50 text-amber-300",
    "Hedge": "bg-teal-900/50 text-teal-300",
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Layers size={14} /> Setup</h3>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Stock Price: ${spot}</label>
            <Slider value={[spot]} onValueChange={([v]) => setSpot(v)} min={50} max={500} step={1} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">IV: {(sigma * 100).toFixed(0)}%</label>
            <Slider value={[sigma * 100]} onValueChange={([v]) => setSigma(v / 100)} min={5} max={150} step={1} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">IV Stress Test</p>
            <div className="flex gap-1.5">
              {(["normal", "double", "half"] as const).map(s => (
                <button key={s} onClick={() => setStressIV(s)} className={`flex-1 py-1 text-xs rounded ${stressIV === s ? "bg-amber-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                  {s === "normal" ? "Normal" : s === "double" ? "IV×2" : "IV÷2"}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 bg-gray-900 border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Strategy Presets</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
            {Object.entries(presets).map(([name, preset]) => (
              <button key={name} onClick={() => applyPreset(name)}
                className={`text-left p-2 rounded border text-xs transition-all ${selectedPreset === name ? "border-blue-500 bg-blue-900/30" : "border-gray-700 bg-gray-800/50 hover:border-gray-600"}`}>
                <div className="font-medium text-gray-200 truncate">{name}</div>
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {preset.tags.map(t => <span key={t} className={`px-1 py-0.5 rounded text-[9px] ${tagColors[t] ?? "bg-gray-700 text-gray-300"}`}>{t}</span>)}
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Legs Editor */}
      <Card className="bg-gray-900 border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Legs</h3>
          <Button size="sm" variant="outline" className="h-7 text-xs border-gray-700 text-gray-300 hover:bg-gray-800" onClick={addLeg}>
            <Plus size={12} className="mr-1" /> Add Leg
          </Button>
        </div>
        {legs.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">Select a preset or add legs manually</p>
        ) : (
          <div className="space-y-2">
            {legs.map((leg, idx) => {
              const T = leg.expiry / 365;
              const premium = bsPrice(spot, leg.strike, T, r, sigma, leg.type === "call");
              return (
                <div key={leg.id} className="grid grid-cols-7 gap-1.5 items-center bg-gray-800/50 rounded p-2">
                  <span className="text-xs text-gray-500">#{idx + 1}</span>
                  <select value={leg.position} onChange={e => updateLeg(leg.id, "position", e.target.value)} className="bg-gray-800 border border-gray-700 text-xs text-gray-200 rounded px-1 py-1">
                    <option value="buy">Buy</option><option value="sell">Sell</option>
                  </select>
                  <select value={leg.type} onChange={e => updateLeg(leg.id, "type", e.target.value)} className="bg-gray-800 border border-gray-700 text-xs text-gray-200 rounded px-1 py-1">
                    <option value="call">Call</option><option value="put">Put</option>
                  </select>
                  <input type="number" value={leg.strike} onChange={e => updateLeg(leg.id, "strike", +e.target.value)} className="bg-gray-800 border border-gray-700 text-xs text-gray-200 rounded px-1.5 py-1 w-full" placeholder="Strike" />
                  <input type="number" value={leg.expiry} onChange={e => updateLeg(leg.id, "expiry", +e.target.value)} className="bg-gray-800 border border-gray-700 text-xs text-gray-200 rounded px-1.5 py-1 w-full" placeholder="DTE" />
                  <input type="number" value={leg.qty} onChange={e => updateLeg(leg.id, "qty", +e.target.value)} min={1} className="bg-gray-800 border border-gray-700 text-xs text-gray-200 rounded px-1.5 py-1 w-full" placeholder="Qty" />
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-gray-400">${premium.toFixed(2)}</span>
                    <button onClick={() => removeLeg(leg.id)} className="ml-auto text-gray-600 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Results */}
      {legs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Card className="lg:col-span-3 bg-gray-900 border-gray-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Combined Payoff at Expiry {stressIV !== "normal" && <span className="text-amber-400 text-xs ml-1">({stressIV === "double" ? "IV×2" : "IV÷2"})</span>}</h3>
            <PayoffChart legs={legs} spot={spot} r={r} sigma={effectiveSigma} height={200} />
          </Card>
          <Card className="lg:col-span-2 bg-gray-900 border-gray-800 p-4 space-y-1">
            <h3 className="text-sm font-semibold text-white mb-2">Strategy Metrics</h3>
            <MetricRow label="Max Profit" value={pnlRange.maxProfit > 9999 ? "Unlimited" : fmtDollar(pnlRange.maxProfit)} colored />
            <MetricRow label="Max Loss" value={pnlRange.maxLoss < -9999 ? "Unlimited" : fmtDollar(pnlRange.maxLoss)} colored />
            <MetricRow label="Breakeven(s)" value={breakevens.length ? breakevens.map(b => `$${b}`).join(", ") : "N/A"} />
            <MetricRow label="Prob. of Profit" value={`${(pop * 100).toFixed(1)}%`} />
            <div className="pt-2 border-t border-gray-800 mt-2">
              <p className="text-xs text-gray-500 mb-1">Net Greeks (position)</p>
              <MetricRow label="Net Delta" value={fmt(netGreeks.delta, 2)} colored />
              <MetricRow label="Net Gamma" value={fmt(netGreeks.gamma, 4)} colored />
              <MetricRow label="Net Theta/day" value={fmtDollar(netGreeks.theta)} colored />
              <MetricRow label="Net Vega/1%IV" value={fmtDollar(netGreeks.vega)} colored />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Volatility Analysis ────────────────────────────────────────────────

function VolatilityTab() {
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const spot = 150;
  const smileData = useMemo(() => buildSmileData(selectedTicker, spot), [selectedTicker]);
  const termData = useMemo(() => buildTermStructure(selectedTicker), [selectedTicker]);
  const tickerVol = VOL_DATA.find(v => v.ticker === selectedTicker)!;

  const richCheap = tickerVol.ivPct > 75
    ? { signal: "IV Rich — Sell Premium", color: "text-amber-400", desc: "IV is historically elevated. Favor short premium strategies: Iron Condor, Short Strangle, Credit Spreads." }
    : tickerVol.ivPct < 25
      ? { signal: "IV Cheap — Buy Premium", color: "text-emerald-400", desc: "IV is historically low. Favor long premium strategies: Long Straddle, Debit Spreads, Calendar Spreads." }
      : { signal: "IV Neutral", color: "text-gray-300", desc: "IV is in the middle of its 52-week range. No strong edge for buyers or sellers." };

  return (
    <div className="space-y-4">
      {/* Ticker selector */}
      <Card className="bg-gray-900 border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">IV vs HV by Ticker</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {TICKERS.map(t => (
            <button key={t} onClick={() => setSelectedTicker(t)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${selectedTicker === t ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                {["Ticker", "IV (30d)", "HV (30d)", "IV/HV", "IV %ile", "IV Rank", "Signal"].map(h => (
                  <th key={h} className="text-left text-gray-400 pb-1.5 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VOL_DATA.map(d => {
                const ratio = d.iv / d.hv;
                const sig = d.ivPct > 75 ? { label: "Rich", cls: "text-amber-400" } : d.ivPct < 25 ? { label: "Cheap", cls: "text-emerald-400" } : { label: "Fair", cls: "text-gray-400" };
                return (
                  <tr key={d.ticker} onClick={() => setSelectedTicker(d.ticker)}
                    className={`border-b border-gray-800/50 cursor-pointer hover:bg-gray-800/30 transition-colors ${d.ticker === selectedTicker ? "bg-blue-900/20" : ""}`}>
                    <td className="py-1.5 pr-4 font-medium text-gray-200">{d.ticker}</td>
                    <td className="py-1.5 pr-4 text-blue-400">{(d.iv * 100).toFixed(1)}%</td>
                    <td className="py-1.5 pr-4 text-gray-400">{(d.hv * 100).toFixed(1)}%</td>
                    <td className={`py-1.5 pr-4 ${ratio > 1.1 ? "text-amber-400" : ratio < 0.9 ? "text-emerald-400" : "text-gray-300"}`}>{ratio.toFixed(2)}x</td>
                    <td className="py-1.5 pr-4 text-gray-300">{d.ivPct.toFixed(0)}th</td>
                    <td className="py-1.5 pr-4 text-gray-300">{(d.ivRank * 100).toFixed(0)}</td>
                    <td className={`py-1.5 pr-4 font-medium ${sig.cls}`}>{sig.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Selected ticker detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800 p-4 flex flex-col items-center justify-center gap-3">
          <h3 className="text-sm font-semibold text-white self-start">{selectedTicker} IV Gauges</h3>
          <div className="flex gap-4">
            <div className="text-center">
              <GaugeSVG value={tickerVol.ivPct} label="IV %ile" color="#818CF8" />
            </div>
            <div className="text-center">
              <GaugeSVG value={tickerVol.ivRank * 100} label="IV Rank" color="#34D399" />
            </div>
          </div>
          <div className={`text-center text-xs font-medium ${richCheap.color}`}>{richCheap.signal}</div>
          <p className="text-xs text-gray-400 text-center">{richCheap.desc}</p>
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Volatility Skew (30 DTE)</h3>
          <IVSmileChart data={smileData} />
          <p className="text-xs text-gray-500 mt-2">Put skew: OTM puts trade at higher IV, reflecting demand for downside protection.</p>
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Term Structure</h3>
          <TermStructureChart data={termData} />
          <p className="text-xs text-gray-500 mt-2">
            {termData[0].iv > termData[termData.length - 1].iv ? "Inverted: near-term IV > long-term IV. Market expects near-term volatility event." : "Normal contango: long-term IV > near-term IV."}
          </p>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 4: Strategy Comparison ────────────────────────────────────────────────

const COMPARE_STRATEGIES = [
  "Bull Call Spread", "Bear Put Spread", "Long Straddle", "Short Straddle", "Iron Condor", "Butterfly Spread", "Covered Call", "Protective Put",
];

const STRATEGY_COLORS = ["#60A5FA", "#F59E0B", "#34D399"];

function StrategyComparisonTab() {
  const [spot, setSpot] = useState(150);
  const [sigma, setSigma] = useState(0.30);
  const [r] = useState(0.05);
  const [selected, setSelected] = useState<[string, string, string]>(["Bull Call Spread", "Iron Condor", "Long Straddle"]);

  const presets = useMemo(() => buildPresets(spot), [spot]);

  const strategyLegs = useMemo(() =>
    selected.map(name => presets[name]?.legs.map((l, i) => ({ ...l, id: `${name}-${i}` })) ?? []),
    [selected, presets]
  );

  const metrics = useMemo(() => strategyLegs.map((legs, si) => {
    const pnls: number[] = [];
    for (let i = 0; i <= 200; i++) {
      const S = spot * 0.5 + spot * (i / 200);
      pnls.push(computePayoff(legs, spot, S, r, sigma));
    }
    const maxProfit = Math.max(...pnls);
    const maxLoss = Math.min(...pnls);
    const pop = computeProbabilityOfProfit(legs, spot, sigma, legs[0]?.expiry ?? 45);
    const cost = legs.reduce((acc, leg) => {
      const T = leg.expiry / 365;
      const prem = bsPrice(spot, leg.strike, T, r, sigma, leg.type === "call");
      return acc + (leg.position === "buy" ? prem : -prem) * leg.qty;
    }, 0);
    let netTheta = 0;
    for (const leg of legs) {
      const T = leg.expiry / 365;
      const g = bsGreeks(spot, leg.strike, T, r, sigma, leg.type === "call");
      netTheta += (leg.position === "buy" ? g.theta : -g.theta) * leg.qty * 100;
    }
    return { maxProfit, maxLoss, pop, cost, netTheta };
  }), [strategyLegs, spot, r, sigma]);

  const strategyTags: Record<string, string[]> = {
    "Bull Call Spread": ["Speculation", "Defined Risk"],
    "Bear Put Spread": ["Speculation", "Defined Risk"],
    "Long Straddle": ["Earnings Play", "Speculation"],
    "Short Straddle": ["Income"],
    "Iron Condor": ["Income", "Defined Risk"],
    "Butterfly Spread": ["Speculation", "Defined Risk"],
    "Covered Call": ["Income", "Defined Risk"],
    "Protective Put": ["Hedge", "Defined Risk"],
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><ArrowUpDown size={14} /> Setup</h3>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Underlying: ${spot}</label>
            <Slider value={[spot]} onValueChange={([v]) => setSpot(v)} min={50} max={500} step={1} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">IV: {(sigma * 100).toFixed(0)}%</label>
            <Slider value={[sigma * 100]} onValueChange={([v]) => setSigma(v / 100)} min={5} max={150} step={1} />
          </div>
          <div className="space-y-2 pt-1">
            {([0, 1, 2] as const).map(i => (
              <div key={i}>
                <label className="text-xs mb-1 block" style={{ color: STRATEGY_COLORS[i] }}>Strategy {i + 1}</label>
                <select value={selected[i]} onChange={e => setSelected(prev => { const n = [...prev] as [string, string, string]; n[i] = e.target.value; return n; })}
                  className="w-full bg-gray-800 border border-gray-700 text-xs text-gray-200 rounded px-2 py-1.5">
                  {COMPARE_STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3 bg-gray-900 border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Overlaid Payoff Diagram</h3>
          {strategyLegs[0].length > 0 && (
            <PayoffChart
              legs={strategyLegs[0]}
              spot={spot}
              r={r}
              sigma={sigma}
              height={220}
              extraLegsGroups={[
                { legs: strategyLegs[1], color: STRATEGY_COLORS[1] },
                { legs: strategyLegs[2], color: STRATEGY_COLORS[2] },
              ]}
            />
          )}
          <div className="flex gap-4 mt-2">
            {selected.map((name, i) => (
              <div key={name} className="flex items-center gap-1.5">
                <div className="w-4 h-0.5" style={{ backgroundColor: STRATEGY_COLORS[i] }} />
                <span className="text-xs text-gray-400">{name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Comparison table */}
      <Card className="bg-gray-900 border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Side-by-Side Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 pb-2 font-medium">Metric</th>
                {selected.map((name, i) => (
                  <th key={name} className="text-right pb-2 font-medium pr-4" style={{ color: STRATEGY_COLORS[i] }}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Net Cost/Credit", vals: metrics.map(m => (m.cost >= 0 ? `+$${m.cost.toFixed(2)}` : `-$${Math.abs(m.cost).toFixed(2)}`)), colored: true },
                { label: "Max Profit", vals: metrics.map(m => m.maxProfit > 9999 ? "Unlimited" : fmtDollar(m.maxProfit)), colored: true },
                { label: "Max Loss", vals: metrics.map(m => m.maxLoss < -9999 ? "Unlimited" : fmtDollar(m.maxLoss)), colored: true },
                { label: "Prob. of Profit", vals: metrics.map(m => `${(m.pop * 100).toFixed(1)}%`), colored: false },
                { label: "Theta/Day", vals: metrics.map(m => fmtDollar(m.netTheta)), colored: true },
              ].map(row => (
                <tr key={row.label} className="border-b border-gray-800/50">
                  <td className="py-1.5 text-gray-400">{row.label}</td>
                  {row.vals.map((v, i) => (
                    <td key={i} className={`py-1.5 text-right font-mono pr-4 ${row.colored ? (v.startsWith("+") ? "text-emerald-400" : v.startsWith("-") ? "text-red-400" : "text-gray-300") : "text-gray-300"}`}>{v}</td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-gray-800/50">
                <td className="py-1.5 text-gray-400">Best For</td>
                {selected.map(name => (
                  <td key={name} className="py-1.5 text-right pr-4">
                    <div className="flex flex-wrap gap-1 justify-end">
                      {(strategyTags[name] ?? []).map(tag => (
                        <Badge key={tag} variant="outline" className="text-[9px] px-1 py-0 border-gray-700 text-gray-400">{tag}</Badge>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Tab 5: Greeks Dashboard ───────────────────────────────────────────────────

function GreeksDashboardTab() {
  const [spot, setSpot] = useState(150);
  const [r] = useState(0.05);
  const [sigma, setSigma] = useState(0.30);
  const [isCall, setIsCall] = useState(true);
  const [positions, setPositions] = useState<GreeksPosition[]>([
    { id: "1", ticker: "AAPL", type: "call", strike: 155, expiry: 30, qty: 2, side: "long" },
    { id: "2", ticker: "AAPL", type: "put", strike: 145, expiry: 30, qty: 1, side: "long" },
  ]);

  const addPosition = () => {
    setPositions(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      ticker: "AAPL",
      type: "call",
      strike: Math.round(spot / 5) * 5,
      expiry: 30,
      qty: 1,
      side: "long",
    }]);
  };

  const updatePos = (id: string, field: keyof GreeksPosition, val: string | number) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  const removePos = (id: string) => setPositions(prev => prev.filter(p => p.id !== id));

  const aggregated = useMemo(() => {
    let delta = 0, gamma = 0, theta = 0, vega = 0, portfolioValue = 0;
    for (const pos of positions) {
      const T = pos.expiry / 365;
      const g = bsGreeks(spot, pos.strike, T, r, sigma, pos.type === "call");
      const sign = pos.side === "long" ? 1 : -1;
      const multiplier = pos.qty * 100;
      delta += sign * g.delta * multiplier;
      gamma += sign * g.gamma * multiplier;
      theta += sign * g.theta * multiplier;
      vega += sign * g.vega * multiplier;
      portfolioValue += sign * g.price * multiplier;
    }
    return { delta, gamma, theta, vega, portfolioValue };
  }, [positions, spot, r, sigma]);

  const sharesForDeltaNeutral = -Math.round(aggregated.delta);
  const gammaPnlExample = (() => {
    const move = spot * 0.01;
    return 0.5 * aggregated.gamma * move * move;
  })();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Activity size={14} /> Parameters</h3>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Underlying Price: ${spot}</label>
            <Slider value={[spot]} onValueChange={([v]) => setSpot(v)} min={50} max={500} step={1} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">IV: {(sigma * 100).toFixed(0)}%</label>
            <Slider value={[sigma * 100]} onValueChange={([v]) => setSigma(v / 100)} min={5} max={150} step={1} />
          </div>
          <h3 className="text-xs font-semibold text-white pt-2">Portfolio Greeks</h3>
          <MetricRow label="Portfolio Value" value={`$${aggregated.portfolioValue.toFixed(2)}`} />
          <MetricRow label="Net Delta" value={fmt(aggregated.delta, 2)} colored />
          <MetricRow label="Net Gamma" value={fmt(aggregated.gamma, 4)} colored />
          <MetricRow label="Net Theta/day" value={fmtDollar(aggregated.theta)} colored />
          <MetricRow label="Net Vega/1%IV" value={fmtDollar(aggregated.vega)} colored />
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Shield size={14} /> Delta-Neutral Hedging</h3>
          <p className="text-xs text-gray-400 mb-3">Your portfolio delta tells you the equivalent share exposure. To hedge to delta-neutral, trade the opposite in shares.</p>
          <div className="bg-gray-800/60 rounded p-3 space-y-2">
            <MetricRow label="Current Portfolio Delta" value={fmt(aggregated.delta, 2)} colored />
            <MetricRow label="Shares to Hedge" value={`${sharesForDeltaNeutral > 0 ? "Buy" : "Sell"} ${Math.abs(sharesForDeltaNeutral)} shares`} />
            <MetricRow label="Post-Hedge Delta" value={`≈ 0.00`} />
          </div>
          <div className="mt-3 p-2 bg-amber-900/20 border border-amber-800/40 rounded">
            <p className="text-xs text-amber-300 font-medium mb-1">Gamma Scalping</p>
            <p className="text-xs text-gray-400">With net gamma <span className="text-white font-mono">{fmt(aggregated.gamma, 4)}</span>, a 1% move in the stock generates approximately <span className={`font-mono font-medium ${clsNum(gammaPnlExample)}`}>{fmtDollar(gammaPnlExample)}</span> in gamma P&L before re-hedging costs.</p>
          </div>
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><Zap size={14} /> Theta Decay</h3>
          <ThetaDecayChart S={spot} K={Math.round(spot / 5) * 5} r={r} sigma={sigma} isCall={isCall} />
          <div className="flex gap-2 mt-2">
            <button onClick={() => setIsCall(true)} className={`flex-1 py-1 text-xs rounded ${isCall ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}>Call</button>
            <button onClick={() => setIsCall(false)} className={`flex-1 py-1 text-xs rounded ${!isCall ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"}`}>Put</button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Time value accelerates to zero non-linearly — the last 30 days lose the most value per day.</p>
        </Card>
      </div>

      {/* Positions table */}
      <Card className="bg-gray-900 border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Option Positions (up to 5)</h3>
          <Button size="sm" variant="outline" className="h-7 text-xs border-gray-700 text-gray-300 hover:bg-gray-800" onClick={addPosition} disabled={positions.length >= 5}>
            <Plus size={12} className="mr-1" /> Add Position
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                {["Ticker", "Side", "Type", "Strike", "DTE", "Qty", "Price", "Delta", "Gamma", "Theta", "Vega", ""].map(h => (
                  <th key={h} className="text-left text-gray-400 pb-1.5 pr-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map(pos => {
                const T = pos.expiry / 365;
                const g = bsGreeks(spot, pos.strike, T, r, sigma, pos.type === "call");
                const sign = pos.side === "long" ? 1 : -1;
                return (
                  <tr key={pos.id} className="border-b border-gray-800/50">
                    <td className="py-1.5 pr-2"><input value={pos.ticker} onChange={e => updatePos(pos.id, "ticker", e.target.value)} className="w-14 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-gray-200" /></td>
                    <td className="pr-2"><select value={pos.side} onChange={e => updatePos(pos.id, "side", e.target.value)} className="bg-gray-800 border border-gray-700 text-xs text-gray-200 rounded px-1 py-0.5">
                      <option value="long">Long</option><option value="short">Short</option>
                    </select></td>
                    <td className="pr-2"><select value={pos.type} onChange={e => updatePos(pos.id, "type", e.target.value)} className="bg-gray-800 border border-gray-700 text-xs text-gray-200 rounded px-1 py-0.5">
                      <option value="call">Call</option><option value="put">Put</option>
                    </select></td>
                    <td className="pr-2"><input type="number" value={pos.strike} onChange={e => updatePos(pos.id, "strike", +e.target.value)} className="w-16 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-gray-200" /></td>
                    <td className="pr-2"><input type="number" value={pos.expiry} onChange={e => updatePos(pos.id, "expiry", +e.target.value)} className="w-12 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-gray-200" /></td>
                    <td className="pr-2"><input type="number" value={pos.qty} onChange={e => updatePos(pos.id, "qty", +e.target.value)} min={1} className="w-10 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-gray-200" /></td>
                    <td className="pr-2 font-mono text-gray-300">${g.price.toFixed(2)}</td>
                    <td className={`pr-2 font-mono ${clsNum(sign * g.delta)}`}>{(sign * g.delta * pos.qty * 100).toFixed(2)}</td>
                    <td className={`pr-2 font-mono ${clsNum(sign * g.gamma)}`}>{(sign * g.gamma * pos.qty * 100).toFixed(4)}</td>
                    <td className={`pr-2 font-mono ${clsNum(sign * g.theta)}`}>{fmtDollar(sign * g.theta * pos.qty * 100)}</td>
                    <td className={`pr-2 font-mono ${clsNum(sign * g.vega)}`}>{fmtDollar(sign * g.vega * pos.qty * 100)}</td>
                    <td><button onClick={() => removePos(pos.id)} className="text-gray-600 hover:text-red-400"><Trash2 size={12} /></button></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-700">
                <td colSpan={7} className="pt-2 text-gray-400 font-medium">Portfolio Total</td>
                <td className={`pt-2 font-mono font-medium ${clsNum(aggregated.delta)}`}>{aggregated.delta.toFixed(2)}</td>
                <td className={`pt-2 font-mono font-medium ${clsNum(aggregated.gamma)}`}>{aggregated.gamma.toFixed(4)}</td>
                <td className={`pt-2 font-mono font-medium ${clsNum(aggregated.theta)}`}>{fmtDollar(aggregated.theta)}</td>
                <td className={`pt-2 font-mono font-medium ${clsNum(aggregated.vega)}`}>{fmtDollar(aggregated.vega)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Vega exposure */}
        <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-800/40 rounded">
          <p className="text-xs text-indigo-300 font-medium mb-1">Vega (IV) Exposure</p>
          <p className="text-xs text-gray-400">
            Your portfolio net vega is <span className={`font-mono font-medium ${clsNum(aggregated.vega)}`}>{fmtDollar(aggregated.vega)}</span> per 1% IV change.
            If IV rises 5%, your portfolio changes by <span className={`font-mono font-medium ${clsNum(aggregated.vega * 5)}`}>{fmtDollar(aggregated.vega * 5)}</span>.
            If IV falls 5%, your portfolio changes by <span className={`font-mono font-medium ${clsNum(-aggregated.vega * 5)}`}>{fmtDollar(-aggregated.vega * 5)}</span>.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OptionsCalcPage() {
  const [activeTab, setActiveTab] = useState("single");

  const tabs = [
    { id: "single", label: "Single Option", icon: Calculator },
    { id: "builder", label: "Strategy Builder", icon: Layers },
    { id: "volatility", label: "Volatility", icon: TrendingUp },
    { id: "compare", label: "Compare", icon: GitCompare },
    { id: "greeks", label: "Greeks Dashboard", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Calculator size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Options Strategies Calculator</h1>
              <p className="text-sm text-gray-400">Black-Scholes pricing · Real-time payoff diagrams · Multi-leg strategies</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="border-blue-700 text-blue-400 text-xs">Black-Scholes</Badge>
            <Badge variant="outline" className="border-purple-700 text-purple-400 text-xs">Greeks</Badge>
            <Badge variant="outline" className="border-emerald-700 text-emerald-400 text-xs">10 Strategies</Badge>
            <Badge variant="outline" className="border-amber-700 text-amber-400 text-xs">Vol Analysis</Badge>
            <Badge variant="outline" className="border-teal-700 text-teal-400 text-xs">Risk Metrics</Badge>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-900 border border-gray-800 p-1 flex flex-wrap gap-1 h-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5 text-xs data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400 px-3 py-1.5">
                  <Icon size={12} />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <TabsContent value="single" className="mt-4 data-[state=inactive]:hidden">
                <SingleOptionTab />
              </TabsContent>
              <TabsContent value="builder" className="mt-4 data-[state=inactive]:hidden">
                <StrategyBuilderTab />
              </TabsContent>
              <TabsContent value="volatility" className="mt-4 data-[state=inactive]:hidden">
                <VolatilityTab />
              </TabsContent>
              <TabsContent value="compare" className="mt-4 data-[state=inactive]:hidden">
                <StrategyComparisonTab />
              </TabsContent>
              <TabsContent value="greeks" className="mt-4 data-[state=inactive]:hidden">
                <GreeksDashboardTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
