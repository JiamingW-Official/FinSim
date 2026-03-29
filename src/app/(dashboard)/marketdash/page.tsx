"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Filter,
  BarChart3,
  Zap,
  Calendar,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  XCircle,
  Globe,
  Gauge,
  Layers,
} from "lucide-react";

// ── mulberry32 PRNG (seed=8765) ───────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(8765);

function rngRange(min: number, max: number) {
  return min + rng() * (max - min);
}

function rngSign() {
  return rng() > 0.5 ? 1 : -1;
}

// ── Animation variants ────────────────────────────────────────────────────────


// ── Market status helper ──────────────────────────────────────────────────────

function getMarketStatus(): { label: string; color: string } {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMin = now.getUTCMinutes();
  const totalMin = utcHour * 60 + utcMin;
  // NYSE: 14:30–21:00 UTC
  if (totalMin >= 13 * 60 + 0 && totalMin < 13 * 60 + 30) return { label: "Pre-Market", color: "text-amber-400" };
  if (totalMin >= 13 * 60 + 30 && totalMin < 20 * 60) return { label: "Open", color: "text-emerald-400" };
  if (totalMin >= 20 * 60 && totalMin < 24 * 60) return { label: "After-Hours", color: "text-sky-400" };
  return { label: "Closed", color: "text-muted-foreground" };
}

// ── Static data (generated once with seeded RNG) ──────────────────────────────

const TICKER_STRIP_SYMBOLS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "V", "UNH",
  "JNJ", "XOM", "BAC", "HD", "PG", "MA", "CVX", "ABBV", "MRK", "PEP",
];

function genStripData() {
  return TICKER_STRIP_SYMBOLS.map((sym) => ({
    sym,
    price: +(100 + rngRange(20, 280)).toFixed(2),
    pct: +(rngSign() * rngRange(0.1, 4.5)).toFixed(2),
  }));
}

const STRIP_DATA_INIT = genStripData();

const INDICES_INIT = [
  { name: "S&P 500",      value: 5218.43, pct: +(rngSign() * rngRange(0.1, 1.5)).toFixed(2), sparkSeed: 1 },
  { name: "NASDAQ",       value: 16384.21, pct: +(rngSign() * rngRange(0.1, 2.0)).toFixed(2), sparkSeed: 2 },
  { name: "DOW",          value: 38945.10, pct: +(rngSign() * rngRange(0.1, 1.2)).toFixed(2), sparkSeed: 3 },
  { name: "Russell 2000", value: 2042.87,  pct: +(rngSign() * rngRange(0.1, 2.5)).toFixed(2), sparkSeed: 4 },
  { name: "VIX",          value: 17.83,    pct: +(rngSign() * rngRange(0.5, 8.0)).toFixed(2), sparkSeed: 5 },
  { name: "10Y Yield",    value: 4.312,    pct: +(rngSign() * rngRange(0.1, 1.5)).toFixed(2), sparkSeed: 6 },
];

function genSparkline(seed: number, pts = 20): number[] {
  const r = mulberry32(seed * 333);
  const arr: number[] = [50];
  for (let i = 1; i < pts; i++) {
    arr.push(Math.max(5, Math.min(95, arr[i - 1] + (r() - 0.5) * 14)));
  }
  return arr;
}

// ── Sector heatmap data ───────────────────────────────────────────────────────

const SECTORS = [
  { name: "Technology",         weight: 28, pct: +(rngSign() * rngRange(0.1, 3.5)).toFixed(2) },
  { name: "Healthcare",         weight: 13, pct: +(rngSign() * rngRange(0.1, 2.8)).toFixed(2) },
  { name: "Financials",         weight: 13, pct: +(rngSign() * rngRange(0.1, 2.8)).toFixed(2) },
  { name: "Consumer Disc",      weight: 11, pct: +(rngSign() * rngRange(0.1, 3.2)).toFixed(2) },
  { name: "Industrials",        weight: 9,  pct: +(rngSign() * rngRange(0.1, 2.5)).toFixed(2) },
  { name: "Comm Services",      weight: 9,  pct: +(rngSign() * rngRange(0.1, 3.0)).toFixed(2) },
  { name: "Consumer Staples",   weight: 7,  pct: +(rngSign() * rngRange(0.1, 1.8)).toFixed(2) },
  { name: "Energy",             weight: 5,  pct: +(rngSign() * rngRange(0.1, 4.0)).toFixed(2) },
  { name: "Real Estate",        weight: 3,  pct: +(rngSign() * rngRange(0.1, 2.2)).toFixed(2) },
  { name: "Materials",          weight: 2,  pct: +(rngSign() * rngRange(0.1, 2.5)).toFixed(2) },
  { name: "Utilities",          weight: 2,  pct: +(rngSign() * rngRange(0.1, 1.5)).toFixed(2) },
];

const SECTOR_MOVERS: Record<string, { ticker: string; name: string; pct: number; price: number }[]> = {
  "Technology":        [
    { ticker: "NVDA", name: "NVIDIA",     pct: +(rngSign() * rngRange(0.5, 5)).toFixed(2), price: +(rngRange(400, 900)).toFixed(2) },
    { ticker: "AAPL", name: "Apple",      pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(150, 200)).toFixed(2) },
    { ticker: "MSFT", name: "Microsoft",  pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(300, 420)).toFixed(2) },
    { ticker: "AMD",  name: "AMD",        pct: +(rngSign() * rngRange(0.5, 5)).toFixed(2), price: +(rngRange(100, 200)).toFixed(2) },
    { ticker: "INTC", name: "Intel",      pct: +(rngSign() * rngRange(0.5, 4)).toFixed(2), price: +(rngRange(25, 45)).toFixed(2) },
  ],
  "Healthcare":        [
    { ticker: "LLY",  name: "Eli Lilly",  pct: +(rngSign() * rngRange(0.5, 4)).toFixed(2), price: +(rngRange(700, 900)).toFixed(2) },
    { ticker: "UNH",  name: "UnitedHealth",pct:+(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(450, 550)).toFixed(2) },
    { ticker: "JNJ",  name: "J&J",        pct: +(rngSign() * rngRange(0.5, 2)).toFixed(2), price: +(rngRange(145, 165)).toFixed(2) },
    { ticker: "ABBV", name: "AbbVie",     pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(150, 180)).toFixed(2) },
    { ticker: "MRK",  name: "Merck",      pct: +(rngSign() * rngRange(0.5, 2)).toFixed(2), price: +(rngRange(100, 130)).toFixed(2) },
  ],
  "Financials":        [
    { ticker: "JPM",  name: "JPMorgan",   pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(170, 210)).toFixed(2) },
    { ticker: "BAC",  name: "Bank of Am", pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(30, 42)).toFixed(2) },
    { ticker: "GS",   name: "Goldman",    pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(350, 450)).toFixed(2) },
    { ticker: "MS",   name: "Morgan St",  pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(80, 100)).toFixed(2) },
    { ticker: "WFC",  name: "Wells Fargo",pct: +(rngSign() * rngRange(0.5, 2)).toFixed(2), price: +(rngRange(50, 65)).toFixed(2) },
  ],
  "Consumer Disc":     [
    { ticker: "AMZN", name: "Amazon",     pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(160, 200)).toFixed(2) },
    { ticker: "TSLA", name: "Tesla",      pct: +(rngSign() * rngRange(0.5, 6)).toFixed(2), price: +(rngRange(170, 260)).toFixed(2) },
    { ticker: "HD",   name: "Home Depot", pct: +(rngSign() * rngRange(0.5, 2)).toFixed(2), price: +(rngRange(320, 380)).toFixed(2) },
    { ticker: "MCD",  name: "McDonald's", pct: +(rngSign() * rngRange(0.5, 2)).toFixed(2), price: +(rngRange(270, 300)).toFixed(2) },
    { ticker: "NKE",  name: "Nike",       pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(90, 115)).toFixed(2) },
  ],
  "Industrials":       [
    { ticker: "CAT",  name: "Caterpillar",pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(300, 380)).toFixed(2) },
    { ticker: "HON",  name: "Honeywell",  pct: +(rngSign() * rngRange(0.5, 2)).toFixed(2), price: +(rngRange(190, 220)).toFixed(2) },
    { ticker: "UPS",  name: "UPS",        pct: +(rngSign() * rngRange(0.5, 2)).toFixed(2), price: +(rngRange(130, 160)).toFixed(2) },
    { ticker: "GE",   name: "GE",         pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(130, 170)).toFixed(2) },
    { ticker: "BA",   name: "Boeing",     pct: +(rngSign() * rngRange(0.5, 4)).toFixed(2), price: +(rngRange(165, 210)).toFixed(2) },
  ],
  "Comm Services":     [
    { ticker: "META", name: "Meta",       pct: +(rngSign() * rngRange(0.5, 4)).toFixed(2), price: +(rngRange(400, 550)).toFixed(2) },
    { ticker: "GOOGL",name: "Alphabet",   pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(140, 180)).toFixed(2) },
    { ticker: "NFLX", name: "Netflix",    pct: +(rngSign() * rngRange(0.5, 4)).toFixed(2), price: +(rngRange(550, 700)).toFixed(2) },
    { ticker: "DIS",  name: "Disney",     pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(85, 115)).toFixed(2) },
    { ticker: "T",    name: "AT&T",       pct: +(rngSign() * rngRange(0.2, 2)).toFixed(2), price: +(rngRange(16, 22)).toFixed(2) },
  ],
  "Consumer Staples":  [
    { ticker: "PG",   name: "P&G",        pct: +(rngSign() * rngRange(0.2, 2)).toFixed(2), price: +(rngRange(145, 165)).toFixed(2) },
    { ticker: "KO",   name: "Coca-Cola",  pct: +(rngSign() * rngRange(0.2, 1.5)).toFixed(2),price:+(rngRange(55, 65)).toFixed(2) },
    { ticker: "WMT",  name: "Walmart",    pct: +(rngSign() * rngRange(0.2, 2)).toFixed(2), price: +(rngRange(55, 70)).toFixed(2) },
    { ticker: "COST", name: "Costco",     pct: +(rngSign() * rngRange(0.2, 2)).toFixed(2), price: +(rngRange(700, 800)).toFixed(2) },
    { ticker: "PM",   name: "Philip Mor", pct: +(rngSign() * rngRange(0.2, 2)).toFixed(2), price: +(rngRange(90, 105)).toFixed(2) },
  ],
  "Energy":            [
    { ticker: "XOM",  name: "ExxonMobil", pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(95, 120)).toFixed(2) },
    { ticker: "CVX",  name: "Chevron",    pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(145, 175)).toFixed(2) },
    { ticker: "COP",  name: "ConocoPhil", pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(105, 130)).toFixed(2) },
    { ticker: "SLB",  name: "Schlumberger",pct:+(rngSign() * rngRange(0.5, 4)).toFixed(2), price: +(rngRange(40, 55)).toFixed(2) },
    { ticker: "EOG",  name: "EOG Res",    pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(115, 140)).toFixed(2) },
  ],
  "Real Estate":       [
    { ticker: "AMT",  name: "Am Tower",   pct: +(rngSign() * rngRange(0.2, 2)).toFixed(2), price: +(rngRange(185, 215)).toFixed(2) },
    { ticker: "PLD",  name: "Prologis",   pct: +(rngSign() * rngRange(0.2, 2)).toFixed(2), price: +(rngRange(115, 135)).toFixed(2) },
    { ticker: "EQIX", name: "Equinix",    pct: +(rngSign() * rngRange(0.2, 2)).toFixed(2), price: +(rngRange(740, 820)).toFixed(2) },
    { ticker: "SPG",  name: "Simon Prop", pct: +(rngSign() * rngRange(0.2, 2)).toFixed(2), price: +(rngRange(140, 165)).toFixed(2) },
    { ticker: "O",    name: "Realty Inc", pct: +(rngSign() * rngRange(0.2, 1.5)).toFixed(2),price:+(rngRange(50, 62)).toFixed(2) },
  ],
  "Materials":         [
    { ticker: "LIN",  name: "Linde",      pct: +(rngSign() * rngRange(0.2, 2)).toFixed(2), price: +(rngRange(420, 480)).toFixed(2) },
    { ticker: "SHW",  name: "Sherwin-W",  pct: +(rngSign() * rngRange(0.2, 2)).toFixed(2), price: +(rngRange(280, 320)).toFixed(2) },
    { ticker: "FCX",  name: "Freeport",   pct: +(rngSign() * rngRange(0.5, 4)).toFixed(2), price: +(rngRange(35, 50)).toFixed(2) },
    { ticker: "NEM",  name: "Newmont",    pct: +(rngSign() * rngRange(0.5, 3)).toFixed(2), price: +(rngRange(35, 48)).toFixed(2) },
    { ticker: "APD",  name: "Air Products",pct:+(rngSign() * rngRange(0.2, 2)).toFixed(2), price: +(rngRange(220, 270)).toFixed(2) },
  ],
  "Utilities":         [
    { ticker: "NEE",  name: "NextEra",    pct: +(rngSign() * rngRange(0.2, 1.5)).toFixed(2),price:+(rngRange(55, 68)).toFixed(2) },
    { ticker: "DUK",  name: "Duke Energy",pct: +(rngSign() * rngRange(0.2, 1.5)).toFixed(2),price:+(rngRange(90, 110)).toFixed(2) },
    { ticker: "SO",   name: "Southern Co",pct: +(rngSign() * rngRange(0.2, 1.5)).toFixed(2),price:+(rngRange(68, 80)).toFixed(2) },
    { ticker: "D",    name: "Dominion",   pct: +(rngSign() * rngRange(0.2, 1.5)).toFixed(2),price:+(rngRange(45, 58)).toFixed(2) },
    { ticker: "AEP",  name: "Am Elec Pw", pct: +(rngSign() * rngRange(0.2, 1.5)).toFixed(2),price:+(rngRange(82, 98)).toFixed(2) },
  ],
};

// ── Most Active / Gainers / Losers ────────────────────────────────────────────

const REASON_TAGS = ["earnings", "downgrade", "sector", "macro"] as const;
type ReasonTag = (typeof REASON_TAGS)[number];

function genActiveStocks() {
  const tickers = ["GME", "PLTR", "RIVN", "SOFI", "MARA", "RIOT", "SNAP", "LCID", "BBAI", "SPCE"];
  return tickers.map((t, i) => ({
    ticker: t,
    price: +(rngRange(5, 60)).toFixed(2),
    vol: +(rngRange(20, 280)).toFixed(0) + "M",
    avgVol: +(rngRange(10, 120)).toFixed(0) + "M",
    ratio: +(rngRange(1.5, 8)).toFixed(1),
    seed: i,
  }));
}

function genGainers() {
  const tickers = ["SMCI", "IONQ", "AEHR", "ENPH", "CRWD", "DDOG", "CELH", "BILL", "ZS", "OKTA"];
  return tickers.map((t) => ({
    ticker: t,
    pct: +(rngRange(3.5, 18)).toFixed(2),
    price: +(rngRange(30, 300)).toFixed(2),
    spike: rng() > 0.5,
  }));
}

function genLosers() {
  const tickers = ["BYND", "TLRY", "SPWR", "PLUG", "FREY", "NKLA", "XPEV", "NIO", "WOLF", "OPEN"];
  return tickers.map((t) => ({
    ticker: t,
    pct: -(rngRange(3.5, 15)).toFixed(2) as unknown as number,
    price: +(rngRange(2, 80)).toFixed(2),
    reason: REASON_TAGS[Math.floor(rng() * REASON_TAGS.length)] as ReasonTag,
  }));
}

const ACTIVE_STOCKS = genActiveStocks();
const TOP_GAINERS = genGainers();
const TOP_LOSERS = genLosers();

// ── Options Flow ──────────────────────────────────────────────────────────────

const FLOW_TICKERS = ["AAPL", "SPY", "TSLA", "NVDA", "QQQ", "AMZN", "META", "AMD", "GOOGL", "MSFT", "JPM", "BAC", "XOM", "NFLX", "CRM"];

function genFlowRows() {
  return FLOW_TICKERS.map((ticker, i) => {
    const isCall = rng() > 0.42;
    const expDays = Math.floor(rngRange(3, 90));
    const today = new Date(2026, 2, 27);
    today.setDate(today.getDate() + expDays);
    const expiry = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const strike = +(rngRange(80, 600)).toFixed(0);
    const size = Math.floor(rngRange(150, 5000));
    const oi = Math.floor(rngRange(50, 1500));
    const premium = +(rngRange(0.2, 25)).toFixed(2);
    const totalPremium = +(size * premium * 100 / 1_000_000).toFixed(2);
    const types = ["Sweep", "Block", "Split"] as const;
    const flowType = types[Math.floor(rng() * 3)];
    const unusual = size > oi * 3;
    const bullish = isCall ? rng() > 0.3 : rng() > 0.7;
    return { ticker, expiry, strike, isCall, size, oi, premium: totalPremium, flowType, unusual, bullish, seed: i };
  });
}

const FLOW_ROWS = genFlowRows();

// ── Earnings & Events ─────────────────────────────────────────────────────────

const EARNINGS_TODAY = [
  { ticker: "ORCL",  name: "Oracle",       time: "pre",   eps: 1.42, epsEst: 1.38, surprise: "beat",   rev: "13.8B" },
  { ticker: "ADBE",  name: "Adobe",         time: "post",  eps: 4.97, epsEst: 5.01, surprise: "miss",   rev: "5.31B" },
  { ticker: "FDX",   name: "FedEx",         time: "post",  eps: 4.05, epsEst: 4.05, surprise: "inline", rev: "22.2B" },
  { ticker: "DKS",   name: "Dick's Sporting",time: "pre",  eps: 2.86, epsEst: 2.72, surprise: "beat",   rev: "3.88B" },
  { ticker: "ULTA",  name: "Ulta Beauty",   time: "post",  eps: 7.12, epsEst: 6.94, surprise: "beat",   rev: "3.49B" },
];

const MACRO_EVENTS = [
  { date: "Mar 28", title: "PCE Inflation Data", detail: "Fed's preferred inflation gauge", impact: "high" },
  { date: "Apr 1",  title: "Fed Chair Powell Speaks", detail: "Economic outlook remarks", impact: "high" },
  { date: "Apr 3",  title: "ISM Manufacturing PMI", detail: "March manufacturing activity", impact: "med" },
];

// ── Breadth data ──────────────────────────────────────────────────────────────

const BREADTH = {
  advancing: 1847,
  declining: 1203,
  unchanged: 156,
  newHighs: 127,
  newLows: 43,
  pctAbove200: 61,
  mcclellan: 45,
};

// ── Sparkline SVG component ───────────────────────────────────────────────────

function SparklineSVG({ data, positive, w = 80, h = 28 }: { data: number[]; positive: boolean; w?: number; h?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const color = positive ? "#10b981" : "#ef4444";
  const fill = positive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)";
  const pathD = `M${pts.join(" L")}`;
  const areaD = `M0,${h} L${pts.join(" L")} L${w},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={areaD} fill={fill} />
      <path d={pathD} stroke={color} strokeWidth={1.5} fill="none" />
    </svg>
  );
}

// ── Gauge SVG component ───────────────────────────────────────────────────────

function GaugeSVG({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const r = 36;
  const cx = 52;
  const cy = 52;
  const startAngle = -210;
  const sweepAngle = 240;
  const endAngle = startAngle + sweepAngle;
  function polar(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }
  const pct = Math.min(value / max, 1);
  const needleAngle = startAngle + pct * sweepAngle;
  const bgStart = polar(startAngle, r);
  const bgEnd = polar(endAngle, r);
  const fgEnd = polar(needleAngle, r);
  const largeArcBg = sweepAngle > 180 ? 1 : 0;
  const largeArcFg = pct * sweepAngle > 180 ? 1 : 0;
  const needle = polar(needleAngle, r - 4);
  return (
    <svg width={104} height={70} viewBox="0 0 104 70">
      <path
        d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArcBg} 1 ${bgEnd.x} ${bgEnd.y}`}
        fill="none" stroke="#27272a" strokeWidth={8} strokeLinecap="round"
      />
      <path
        d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArcFg} 1 ${fgEnd.x} ${fgEnd.y}`}
        fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
      />
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="white" strokeWidth={2} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={3} fill="white" />
      <text x={cx} y={cy + 18} textAnchor="middle" fill="white" fontSize={11} fontWeight="600">{value}</text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill="#71717a" fontSize={8}>{label}</text>
    </svg>
  );
}

// ── Color for sector pct ──────────────────────────────────────────────────────

function sectorColor(pct: number): string {
  if (pct >= 2.5) return "#166534";
  if (pct >= 1.5) return "#15803d";
  if (pct >= 0.5) return "#16a34a";
  if (pct >= 0) return "#4ade80";
  if (pct >= -0.5) return "#f87171";
  if (pct >= -1.5) return "#ef4444";
  if (pct >= -2.5) return "#dc2626";
  return "#991b1b";
}

function textColorForBg(pct: number): string {
  return Math.abs(pct) > 0.8 ? "white" : "#e4e4e7";
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MarketDashPage() {
  const [indices, setIndices] = useState(() =>
    INDICES_INIT.map((idx) => ({ ...idx, sparkData: genSparkline(idx.sparkSeed) }))
  );
  const [stripData] = useState(STRIP_DATA_INIT);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [flowFilter, setFlowFilter] = useState<"all" | "calls" | "puts" | "big">("all");
  const [tick, setTick] = useState(0);

  // Live ticking — add tiny ±0.1% noise every 2 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setIndices((prev) =>
        prev.map((idx) => {
          const noise = (Math.random() - 0.5) * 0.002; // ±0.1%
          const newValue = +(idx.value * (1 + noise)).toFixed(idx.value < 100 ? 3 : 2);
          const newPct = +(idx.pct + (Math.random() - 0.5) * 0.05).toFixed(2);
          const lastSpark = idx.sparkData[idx.sparkData.length - 1];
          const newSpark = Math.max(5, Math.min(95, lastSpark + (Math.random() - 0.5) * 5));
          return {
            ...idx,
            value: newValue,
            pct: newPct,
            sparkData: [...idx.sparkData.slice(1), newSpark],
          };
        })
      );
      setTick((t) => t + 1);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const marketStatus = useMemo(() => getMarketStatus(), [tick]);

  const filteredFlow = useMemo(() => {
    return FLOW_ROWS.filter((row) => {
      if (flowFilter === "calls") return row.isCall;
      if (flowFilter === "puts") return !row.isCall;
      if (flowFilter === "big") return row.premium >= 1;
      return true;
    });
  }, [flowFilter]);

  const bullishFlowPct = useMemo(() => {
    const bullish = FLOW_ROWS.filter((r) => r.bullish).length;
    return Math.round((bullish / FLOW_ROWS.length) * 100);
  }, []);

  // Treemap layout for sectors
  const treemapRects = useMemo(() => {
    const totalWeight = SECTORS.reduce((s, sec) => s + sec.weight, 0);
    const totalW = 600;
    const totalH = 220;
    const rects: { x: number; y: number; w: number; h: number; sector: (typeof SECTORS)[number] }[] = [];
    let x = 0;
    SECTORS.forEach((sec) => {
      const w = (sec.weight / totalWeight) * totalW;
      rects.push({ x, y: 0, w: Math.max(w - 2, 2), h: totalH, sector: sec });
      x += w;
    });
    return rects;
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-background text-foreground">
      <div className="max-w-[1400px] mx-auto p-4 space-y-6">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">Market Dashboard</h1>
            <Badge
              className={cn(
                "text-xs font-medium px-2 py-0.5",
                marketStatus.label === "Open"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : marketStatus.label === "Pre-Market"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : marketStatus.label === "After-Hours"
                  ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                  : "bg-muted/50 text-muted-foreground border-border/30"
              )}
              variant="outline"
            >
              <Radio className="h-2.5 w-2.5 mr-1 inline" />
              {marketStatus.label}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Simulated data
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            HERO — Market Overview
        ════════════════════════════════════════════════════════════════ */}
        <section className="rounded-xl border border-border bg-card border-l-4 border-l-primary p-6 space-y-5">
          {/* Ticker tape */}
          <div className="relative overflow-hidden h-9 bg-background border border-border rounded-xl flex items-center">
            <div className="flex gap-0 animate-[marquee_45s_linear_infinite] whitespace-nowrap">
              {[...stripData, ...stripData].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-4 text-xs">
                  <span className="font-medium text-foreground">{item.sym}</span>
                  <span className="text-muted-foreground">{item.price.toFixed(2)}</span>
                  <span className={item.pct >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {item.pct >= 0 ? "+" : ""}{item.pct}%
                  </span>
                  <span className="text-muted-foreground/50 ml-1">·</span>
                </span>
              ))}
            </div>
            <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent" />
          </div>

          {/* Index cards — hero sizing */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {indices.map((idx) => (
              <div key={idx.name} className="rounded-lg border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground mb-1 truncate">{idx.name}</div>
                <div className="text-lg font-bold tabular-nums">
                  {idx.value.toLocaleString(undefined, {
                    minimumFractionDigits: idx.value < 100 ? 3 : 2,
                    maximumFractionDigits: idx.value < 100 ? 3 : 2,
                  })}
                </div>
                <div className={cn("text-sm font-semibold flex items-center gap-0.5 mt-1", idx.pct >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {idx.pct >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {idx.pct >= 0 ? "+" : ""}{idx.pct}%
                </div>
                <div className="mt-2">
                  <SparklineSVG data={idx.sparkData} positive={idx.pct >= 0} w={80} h={24} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2 — Sector Heatmap
        ════════════════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-xs font-semibold text-muted-foreground">Sector Heatmap</h2>
            <span className="text-[11px] text-muted-foreground">Click sector to see top movers</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* SVG treemap */}
            <Card className="bg-card border-border p-2">
              <svg
                viewBox="0 0 600 220"
                className="w-full rounded-lg overflow-hidden"
                style={{ aspectRatio: "600/220" }}
              >
                {treemapRects.map(({ x, y, w, h, sector }) => (
                  <g key={sector.name} onClick={() => setSelectedSector(selectedSector === sector.name ? null : sector.name)} style={{ cursor: "pointer" }}>
                    <rect
                      x={x + 1}
                      y={y + 1}
                      width={w - 2}
                      height={h - 2}
                      rx={4}
                      fill={sectorColor(sector.pct)}
                      opacity={selectedSector && selectedSector !== sector.name ? 0.5 : 1}
                      stroke={selectedSector === sector.name ? "white" : "transparent"}
                      strokeWidth={1.5}
                    />
                    {w > 40 && (
                      <>
                        <text
                          x={x + w / 2}
                          y={y + h / 2 - 8}
                          textAnchor="middle"
                          fill={textColorForBg(sector.pct)}
                          fontSize={Math.min(13, Math.max(8, w / 8))}
                          fontWeight="600"
                        >
                          {sector.name.length > 10 && w < 80 ? sector.name.slice(0, 8) + "…" : sector.name}
                        </text>
                        <text
                          x={x + w / 2}
                          y={y + h / 2 + 8}
                          textAnchor="middle"
                          fill={textColorForBg(sector.pct)}
                          fontSize={Math.min(12, Math.max(7, w / 9))}
                        >
                          {sector.pct >= 0 ? "+" : ""}{sector.pct}%
                        </text>
                        {w > 55 && (
                          <text
                            x={x + w / 2}
                            y={y + h / 2 + 22}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.6)"
                            fontSize={Math.min(9, Math.max(6, w / 12))}
                          >
                            {sector.weight}%
                          </text>
                        )}
                      </>
                    )}
                  </g>
                ))}
              </svg>
              {/* Color legend */}
              <div className="flex items-center justify-center gap-1 mt-2">
                {["-3%+", "-2%", "-1%", "0%", "+1%", "+2%", "+3%+"].map((label, i) => {
                  const colors = ["#991b1b", "#dc2626", "#ef4444", "#4ade80", "#16a34a", "#15803d", "#166534"];
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <div className="w-6 h-2.5 rounded-sm" style={{ background: colors[i] }} />
                      <span className="text-[11px] text-muted-foreground">{label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Sector movers panel */}
            <Card className="bg-card border-border p-2">
              <AnimatePresence mode="wait">
                {selectedSector ? (
                  <motion.div
                    key={selectedSector}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">{selectedSector} — Top 5 Movers</h3>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-muted-foreground" onClick={() => setSelectedSector(null)}>
                        Clear
                      </Button>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-muted-foreground border-b border-border">
                          <th className="text-left pb-1.5 font-medium">Ticker</th>
                          <th className="text-left pb-1.5 font-medium">Name</th>
                          <th className="text-right pb-1.5 font-medium">Price</th>
                          <th className="text-right pb-1.5 font-medium">Chg%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(SECTOR_MOVERS[selectedSector] ?? []).map((m) => (
                          <tr key={m.ticker} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-1.5 font-mono font-medium text-foreground">{m.ticker}</td>
                            <td className="py-1.5 text-muted-foreground">{m.name}</td>
                            <td className="py-1.5 text-right tabular-nums">${m.price.toFixed(2)}</td>
                            <td className={cn("py-1.5 text-right tabular-nums font-medium", m.pct >= 0 ? "text-emerald-400" : "text-red-400")}>
                              {m.pct >= 0 ? "+" : ""}{m.pct}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-muted-foreground py-8 gap-2"
                  >
                    <Layers className="h-8 w-8 opacity-30" />
                    <p className="text-sm">Click a sector to see top movers</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3 — Most Active / Gainers / Losers
        ════════════════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-xs font-medium text-muted-foreground">Most Active Stocks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Most Active by Volume */}
            <Card className="bg-card border-border p-2">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart3 className="h-3 w-3 text-sky-400" />
                <span className="text-xs font-medium text-sky-400">Most Active by Volume</span>
              </div>
              <div className="space-y-1">
                {ACTIVE_STOCKS.map((s) => (
                  <div key={s.ticker} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0 text-xs">
                    <span className="font-mono font-medium w-14 text-foreground">{s.ticker}</span>
                    <span className="text-muted-foreground flex-1 text-center">{s.vol}</span>
                    <span className="text-muted-foreground flex-1 text-center">{s.avgVol}</span>
                    <span className={cn("font-medium tabular-nums w-10 text-right", s.ratio >= 3 ? "text-amber-400" : "text-muted-foreground")}>
                      {s.ratio}×
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Ticker</span><span>Volume</span><span>Avg Vol</span><span>Ratio</span>
              </div>
            </Card>

            {/* Top Gainers */}
            <Card className="bg-card border-border p-2">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Top Gainers</span>
              </div>
              <div className="space-y-1">
                {TOP_GAINERS.map((s) => (
                  <div key={s.ticker} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0 text-xs">
                    <span className="font-mono font-medium w-14 text-foreground">{s.ticker}</span>
                    <span className="text-muted-foreground tabular-nums flex-1">${s.price.toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      {s.spike && (
                        <span className="bg-amber-500/20 text-amber-400 text-[11px] px-1 rounded font-medium">Vol</span>
                      )}
                      <span className="text-emerald-400 font-medium tabular-nums w-12 text-right">
                        +{s.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Losers */}
            <Card className="bg-card border-border p-2">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingDown className="h-3 w-3 text-red-400" />
                <span className="text-xs font-medium text-red-400">Top Losers</span>
              </div>
              <div className="space-y-1">
                {TOP_LOSERS.map((s) => (
                  <div key={s.ticker} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0 text-xs">
                    <span className="font-mono font-medium w-14 text-foreground">{s.ticker}</span>
                    <span className="text-muted-foreground tabular-nums flex-1">${s.price.toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "text-[11px] px-1 rounded font-medium",
                        s.reason === "earnings" ? "bg-red-500/20 text-red-400" :
                        s.reason === "downgrade" ? "bg-orange-500/20 text-orange-400" :
                        s.reason === "sector" ? "bg-primary/20 text-primary" :
                        "bg-muted/50 text-muted-foreground"
                      )}>
                        {s.reason}
                      </span>
                      <span className="text-red-400 font-medium tabular-nums w-12 text-right">
                        {s.pct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4 — Options Flow
        ════════════════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">Unusual Options Activity</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              {(["all", "calls", "puts", "big"] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={flowFilter === f ? "default" : "outline"}
                  className={cn(
                    "h-6 px-2 text-xs",
                    flowFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted border-border text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setFlowFilter(f)}
                >
                  {f === "all" ? "All" : f === "calls" ? "Calls" : f === "puts" ? "Puts" : ">$1M"}
                </Button>
              ))}
            </div>
          </div>

          <Card className="bg-card border-border p-3">
            {/* Flow ratio */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
              <span className="text-xs text-muted-foreground shrink-0">Today's Flow:</span>
              <div className="flex-1">
                <Progress value={bullishFlowPct} className="h-2" />
              </div>
              <span className="text-xs font-medium text-emerald-400 shrink-0">{bullishFlowPct}% Bullish</span>
              <span className="text-xs font-medium text-red-400 shrink-0">{100 - bullishFlowPct}% Bearish</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    {["Ticker", "Expiry", "Strike", "Type", "Size", "OI", "Premium", "Flow", "Sentiment"].map((h) => (
                      <th key={h} className="text-left pb-1.5 pr-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredFlow.map((row) => (
                      <motion.tr
                        key={row.ticker + row.seed}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          "border-b border-border/50 hover:bg-muted/30 transition-colors",
                          row.unusual && "bg-amber-500/5"
                        )}
                      >
                        <td className="py-1.5 pr-3 font-mono font-medium text-foreground">{row.ticker}</td>
                        <td className="py-1.5 pr-3 text-muted-foreground">{row.expiry}</td>
                        <td className="py-1.5 pr-3 tabular-nums">${row.strike}</td>
                        <td className="py-1.5 pr-3">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-xs font-medium",
                            row.isCall
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          )}>
                            {row.isCall ? "CALL" : "PUT"}
                          </span>
                        </td>
                        <td className="py-1.5 pr-3 tabular-nums text-muted-foreground">{row.size.toLocaleString()}</td>
                        <td className="py-1.5 pr-3 tabular-nums text-muted-foreground">{row.oi.toLocaleString()}</td>
                        <td className="py-1.5 pr-3 tabular-nums font-medium text-foreground">${row.premium}M</td>
                        <td className="py-1.5 pr-3">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-xs font-medium",
                            row.flowType === "Sweep"
                              ? "bg-sky-500/20 text-sky-400"
                              : row.flowType === "Block"
                              ? "bg-primary/20 text-primary"
                              : "bg-muted/50 text-muted-foreground"
                          )}>
                            {row.flowType}
                          </span>
                        </td>
                        <td className="py-1.5">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-xs font-medium",
                            row.bullish
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          )}>
                            {row.bullish ? "Bullish" : "Bearish"}
                          </span>
                          {row.unusual && (
                            <span className="ml-1 text-[11px] text-amber-400 font-medium">Unusual</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5 — Earnings & Events Calendar
        ════════════════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Earnings & Events Calendar</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Earnings today */}
            <Card className="bg-card border-border p-3">
              <h3 className="text-xs font-medium text-muted-foreground mb-3">Today's Earnings — Mar 27, 2026</h3>

              {/* SVG timeline */}
              <div className="mb-4">
                <svg viewBox="0 0 520 56" className="w-full" style={{ aspectRatio: "520/56" }}>
                  {/* Timeline bar */}
                  <line x1={20} y1={28} x2={500} y2={28} stroke="#3f3f46" strokeWidth={2} />
                  {/* Time labels */}
                  {[
                    { x: 20, label: "Pre-Mkt" },
                    { x: 180, label: "9:30" },
                    { x: 340, label: "4:00pm" },
                    { x: 500, label: "AH" },
                  ].map(({ x, label }) => (
                    <g key={label}>
                      <line x1={x} y1={22} x2={x} y2={34} stroke="#52525b" strokeWidth={1.5} />
                      <text x={x} y={50} textAnchor="middle" fill="#71717a" fontSize={9}>{label}</text>
                    </g>
                  ))}
                  {/* Earnings markers */}
                  {EARNINGS_TODAY.map((e, i) => {
                    const xPos = e.time === "pre" ? 60 + i * 25 : 380 + i * 22;
                    const color = e.surprise === "beat" ? "#10b981" : e.surprise === "miss" ? "#ef4444" : "#a1a1aa";
                    return (
                      <g key={e.ticker}>
                        <circle cx={xPos} cy={28} r={6} fill={color} />
                        <text x={xPos} y={18} textAnchor="middle" fill="#e4e4e7" fontSize={8} fontWeight="600">{e.ticker}</text>
                      </g>
                    );
                  })}
                </svg>
                <div className="flex gap-3 mt-1 justify-center">
                  {[["beat", "#10b981"], ["miss", "#ef4444"], ["inline", "#a1a1aa"]].map(([label, color]) => (
                    <div key={label} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {EARNINGS_TODAY.map((e) => (
                  <div key={e.ticker} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-medium text-foreground w-12">{e.ticker}</span>
                      <span className="text-muted-foreground truncate">{e.name}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[11px] px-1 h-4 shrink-0",
                          e.time === "pre"
                            ? "border-amber-500/40 text-amber-400"
                            : "border-sky-500/40 text-sky-400"
                        )}
                      >
                        {e.time === "pre" ? "BMO" : "AMC"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-muted-foreground">EPS: <span className="text-foreground">{e.eps}</span></span>
                      <span className="text-muted-foreground">Est: {e.epsEst}</span>
                      <span className={cn(
                        "font-medium",
                        e.surprise === "beat" ? "text-emerald-400" :
                        e.surprise === "miss" ? "text-red-400" : "text-muted-foreground"
                      )}>
                        {e.surprise === "beat" ? <CheckCircle2 className="h-3.5 w-3.5 inline" /> :
                         e.surprise === "miss" ? <XCircle className="h-3.5 w-3.5 inline" /> :
                         <Minus className="h-3.5 w-3.5 inline" />}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Macro events */}
            <Card className="bg-card border-border p-3">
              <h3 className="text-xs font-medium text-muted-foreground mb-3">Key Macro Events This Week</h3>
              <div className="space-y-3">
                {MACRO_EVENTS.map((ev) => (
                  <div key={ev.title} className="flex gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50">
                    <div className="shrink-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs px-1.5 h-5",
                          ev.impact === "high"
                            ? "border-red-500/40 text-red-400 bg-red-500/10"
                            : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                        )}
                      >
                        {ev.impact === "high" ? "High" : "Med"}
                      </Badge>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-foreground">{ev.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{ev.detail}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{ev.date}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <div className="text-[11px] text-muted-foreground mb-2">Earnings Beat/Miss Summary</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(["beat", "miss", "inline"] as const).map((s) => {
                    const count = EARNINGS_TODAY.filter((e) => e.surprise === s).length;
                    return (
                      <div key={s} className={cn(
                        "rounded-lg p-2 text-xs",
                        s === "beat" ? "bg-emerald-500/10 text-emerald-400" :
                        s === "miss" ? "bg-red-500/10 text-red-400" : "bg-muted text-muted-foreground"
                      )}>
                        <div className="text-lg font-bold">{count}</div>
                        <div className="text-xs capitalize">{s === "inline" ? "In-line" : s}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 6 — Market Breadth
        ════════════════════════════════════════════════════════════════ */}
        <section className="pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Market Breadth</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* A/D ratio card */}
            <Card className="bg-card border-border p-3">
              <div className="text-xs font-medium text-muted-foreground mb-3">NYSE Advance/Decline</div>
              <div className="flex items-end gap-2 mb-2">
                <div className="flex-1">
                  <div className="text-xs text-emerald-400 mb-1">Advancing · {BREADTH.advancing.toLocaleString()}</div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-200"
                      style={{ width: `${(BREADTH.advancing / (BREADTH.advancing + BREADTH.declining)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-red-400 mb-1">Declining · {BREADTH.declining.toLocaleString()}</div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-200"
                    style={{ width: `${(BREADTH.declining / (BREADTH.advancing + BREADTH.declining)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                Unchanged: {BREADTH.unchanged} · Ratio: {(BREADTH.advancing / BREADTH.declining).toFixed(2)}
              </div>
              <div className="mt-2 flex justify-center">
                <GaugeSVG
                  value={BREADTH.advancing}
                  max={BREADTH.advancing + BREADTH.declining}
                  color="#10b981"
                  label="A/D"
                />
              </div>
            </Card>

            {/* 52W Highs/Lows */}
            <Card className="bg-card border-border p-3">
              <div className="text-xs font-medium text-muted-foreground mb-3">52-Week Highs / Lows</div>
              <div className="flex items-center justify-around py-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {BREADTH.newHighs}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">New Highs</div>
                  <ArrowUpRight className="h-4 w-4 text-emerald-400 mx-auto mt-1" />
                </div>
                <div className="w-px h-16 bg-muted" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {BREADTH.newLows}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">New Lows</div>
                  <ArrowDownRight className="h-4 w-4 text-red-400 mx-auto mt-1" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-[11px] text-muted-foreground mb-1">High/Low ratio</div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-200"
                    style={{ width: `${(BREADTH.newHighs / (BREADTH.newHighs + BREADTH.newLows)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                  <span>Highs {Math.round((BREADTH.newHighs / (BREADTH.newHighs + BREADTH.newLows)) * 100)}%</span>
                  <span>Lows {Math.round((BREADTH.newLows / (BREADTH.newHighs + BREADTH.newLows)) * 100)}%</span>
                </div>
              </div>
            </Card>

            {/* % Above 200 MA */}
            <Card className="bg-card border-border p-3">
              <div className="text-xs font-medium text-muted-foreground mb-3">% Stocks Above 200-Day MA</div>
              <div className="flex justify-center">
                <GaugeSVG
                  value={BREADTH.pctAbove200}
                  max={100}
                  color={BREADTH.pctAbove200 >= 60 ? "#10b981" : BREADTH.pctAbove200 >= 40 ? "#f59e0b" : "#ef4444"}
                  label="%>200MA"
                />
              </div>
              <div className="text-center mt-2">
                <div
                  className={cn(
                    "text-2xl font-bold",
                    BREADTH.pctAbove200 >= 60 ? "text-emerald-400" : BREADTH.pctAbove200 >= 40 ? "text-amber-400" : "text-red-400"
                  )}
                >
                  {BREADTH.pctAbove200}%
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  {BREADTH.pctAbove200 >= 60 ? "Bullish breadth" : BREADTH.pctAbove200 >= 40 ? "Mixed signals" : "Bearish breadth"}
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-200",
                      BREADTH.pctAbove200 >= 60 ? "bg-emerald-500" : BREADTH.pctAbove200 >= 40 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${BREADTH.pctAbove200}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* McClellan Oscillator */}
            <Card className="bg-card border-border p-3">
              <div className="text-xs font-medium text-muted-foreground mb-3">McClellan Oscillator</div>
              <div className="flex justify-center">
                <GaugeSVG
                  value={Math.abs(BREADTH.mcclellan)}
                  max={150}
                  color={BREADTH.mcclellan > 0 ? "#10b981" : "#ef4444"}
                  label="McClellan"
                />
              </div>
              <div className="text-center mt-2">
                <div
                  className={cn("text-2xl font-bold", BREADTH.mcclellan > 0 ? "text-emerald-400" : "text-red-400")}
                >
                  {BREADTH.mcclellan > 0 ? "+" : ""}{BREADTH.mcclellan}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  {BREADTH.mcclellan > 50 ? "Overbought territory" :
                   BREADTH.mcclellan > 0 ? "Bullish momentum" :
                   BREADTH.mcclellan > -50 ? "Bearish momentum" : "Oversold territory"}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 text-center text-xs gap-1">
                {[{ label: "Oversold", range: "< -50", color: "text-red-400" },
                  { label: "Neutral", range: "-50 to 50", color: "text-muted-foreground" },
                  { label: "Overbought", range: "> 50", color: "text-amber-400" }].map((z) => (
                  <div key={z.label} className={cn("rounded py-1 bg-muted/60", z.color)}>
                    <div className="font-medium">{z.label}</div>
                    <div className="text-muted-foreground">{z.range}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>

      {/* Ticker tape CSS animation */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
