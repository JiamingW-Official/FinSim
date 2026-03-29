"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  Layers,
  Target,
  Zap,
  BookOpen,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Award,
  Filter,
  GitBranch,
  Repeat,
  Shield,
  Clock,
  DollarSign,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSvgX(i: number, total: number, w: number, pad = 10) {
  return pad + (i / (total - 1)) * (w - pad * 2);
}
function toSvgY(v: number, min: number, max: number, h: number, pad = 10) {
  return pad + ((max - v) / (max - min)) * (h - pad * 2);
}
function polyline(pts: [number, number][]) {
  return pts.map(([x, y]) => `${x},${y}`).join(" ");
}

// ── Tab 1: Price Action patterns ──────────────────────────────────────────────

interface PriceActionConcept {
  title: string;
  description: string;
  confluence: string;
  svgComponent: React.ReactNode;
}

function SRSvg() {
  const w = 220;
  const h = 110;
  const prices = [60, 58, 72, 70, 68, 75, 73, 71, 74, 72, 69, 73, 75, 74, 76, 72, 70, 74, 73, 75];
  const min = 55;
  const max = 82;
  const pts: [number, number][] = prices.map((p, i) => [toSvgX(i, prices.length, w), toSvgY(p, min, max, h)]);
  const resY = toSvgY(75, min, max, h);
  const supY = toSvgY(68, min, max, h);
  return (
    <svg width={w} height={h} className="rounded">
      <defs>
        <linearGradient id="sr-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#sr-bg)" rx={4} />
      <line x1={10} y1={resY} x2={w - 10} y2={resY} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.8} />
      <line x1={10} y1={supY} x2={w - 10} y2={supY} stroke="#22d3ee" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.8} />
      <polyline points={polyline(pts)} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2} fill="#60a5fa" opacity={0.6} />
      ))}
      <text x={w - 12} y={resY - 4} fill="#f59e0b" fontSize={9} textAnchor="end">Resistance</text>
      <text x={w - 12} y={supY + 12} fill="#22d3ee" fontSize={9} textAnchor="end">Support</text>
    </svg>
  );
}

function TrendLineSvg() {
  const w = 220;
  const h = 110;
  const prices = [50, 52, 51, 55, 54, 58, 57, 61, 60, 63, 62, 66, 65, 68, 70, 69, 73, 72, 75, 78];
  const min = 44;
  const max = 84;
  const pts: [number, number][] = prices.map((p, i) => [toSvgX(i, prices.length, w), toSvgY(p, min, max, h)]);
  const tlStart: [number, number] = [toSvgX(0, prices.length, w), toSvgY(48, min, max, h)];
  const tlEnd: [number, number] = [toSvgX(19, prices.length, w), toSvgY(76, min, max, h)];
  return (
    <svg width={w} height={h} className="rounded">
      <rect width={w} height={h} fill="#0f172a" rx={4} />
      <line x1={tlStart[0]} y1={tlStart[1]} x2={tlEnd[0]} y2={tlEnd[1]} stroke="#22d3ee" strokeWidth={1.5} />
      <polyline points={polyline(pts)} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
      <text x={14} y={tlEnd[1] + 10} fill="#22d3ee" fontSize={9}>Uptrend Line</text>
    </svg>
  );
}

function ChannelSvg() {
  const w = 220;
  const h = 110;
  const prices = [52, 56, 54, 59, 57, 62, 60, 65, 63, 68, 66, 70, 68, 73, 71, 75, 73, 77, 75, 79];
  const min = 44;
  const max = 88;
  const pts: [number, number][] = prices.map((p, i) => [toSvgX(i, prices.length, w), toSvgY(p, min, max, h)]);
  const n = prices.length;
  const lowerLine = (i: number): number => 50 + i * 1.5;
  const upperLine = (i: number): number => 58 + i * 1.5;
  const lPts: [number, number][] = [0, n - 1].map((i) => [toSvgX(i, n, w), toSvgY(lowerLine(i), min, max, h)]);
  const uPts: [number, number][] = [0, n - 1].map((i) => [toSvgX(i, n, w), toSvgY(upperLine(i), min, max, h)]);
  return (
    <svg width={w} height={h} className="rounded">
      <rect width={w} height={h} fill="#0f172a" rx={4} />
      <line x1={lPts[0][0]} y1={lPts[0][1]} x2={lPts[1][0]} y2={lPts[1][1]} stroke="#22d3ee" strokeWidth={1.2} />
      <line x1={uPts[0][0]} y1={uPts[0][1]} x2={uPts[1][0]} y2={uPts[1][1]} stroke="#f59e0b" strokeWidth={1.2} />
      <polyline points={polyline(pts)} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
      <text x={10} y={uPts[0][1] - 3} fill="#f59e0b" fontSize={9}>Upper</text>
      <text x={10} y={lPts[0][1] + 12} fill="#22d3ee" fontSize={9}>Lower</text>
    </svg>
  );
}

function WedgeSvg() {
  const w = 220;
  const h = 110;
  const min = 44;
  const max = 88;
  const prices = [80, 75, 78, 73, 76, 71, 74, 70, 72, 68, 70, 67, 69, 66, 68, 65, 62, 58, 55, 52];
  const pts: [number, number][] = prices.map((p, i) => [toSvgX(i, prices.length, w), toSvgY(p, min, max, h)]);
  const n = prices.length;
  const upperLine = (i: number) => 82 - i * 1.4;
  const lowerLine = (i: number) => 76 - i * 1.1;
  const uPts: [number, number][] = [0, n - 1].map((i) => [toSvgX(i, n, w), toSvgY(upperLine(i), min, max, h)]);
  const lPts: [number, number][] = [0, n - 1].map((i) => [toSvgX(i, n, w), toSvgY(lowerLine(i), min, max, h)]);
  return (
    <svg width={w} height={h} className="rounded">
      <rect width={w} height={h} fill="#0f172a" rx={4} />
      <line x1={uPts[0][0]} y1={uPts[0][1]} x2={uPts[1][0]} y2={uPts[1][1]} stroke="#f59e0b" strokeWidth={1.2} />
      <line x1={lPts[0][0]} y1={lPts[0][1]} x2={lPts[1][0]} y2={lPts[1][1]} stroke="#22d3ee" strokeWidth={1.2} />
      <polyline points={polyline(pts)} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
      <text x={80} y={h - 6} fill="#ef4444" fontSize={9}>Falling Wedge (Bullish)</text>
    </svg>
  );
}

function FlagSvg() {
  const w = 220;
  const h = 110;
  const min = 44;
  const max = 100;
  const poleBase = 50;
  const poleTop = 90;
  const flagPrices = [90, 87, 88, 85, 86, 83, 84, 82, 83, 85, 88, 92, 96];
  const poleX1 = toSvgX(0, 20, w);
  const poleX2 = toSvgX(7, 20, w);
  const poleY1 = toSvgY(poleBase, min, max, h);
  const poleY2 = toSvgY(poleTop, min, max, h);
  const flagPts: [number, number][] = flagPrices.map((p, i) => [toSvgX(i + 7, 20, w), toSvgY(p, min, max, h)]);
  return (
    <svg width={w} height={h} className="rounded">
      <rect width={w} height={h} fill="#0f172a" rx={4} />
      <line x1={poleX1} y1={poleY1} x2={poleX2} y2={poleY2} stroke="#22c55e" strokeWidth={2.5} />
      <polyline points={polyline(flagPts)} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
      <text x={poleX1} y={poleY2 - 4} fill="#22c55e" fontSize={9}>Pole</text>
      <text x={toSvgX(10, 20, w)} y={toSvgY(84, min, max, h)} fill="#f59e0b" fontSize={9}>Flag</text>
    </svg>
  );
}

function PennantSvg() {
  const w = 220;
  const h = 110;
  const min = 44;
  const max = 100;
  const poleX2 = toSvgX(6, 20, w);
  const poleY1 = toSvgY(50, min, max, h);
  const poleY2 = toSvgY(88, min, max, h);
  const pennantTop = (i: number) => 88 - i * 2.2;
  const pennantBot = (i: number) => 80 + i * 1.5;
  const tPts: [number, number][] = Array.from({ length: 8 }, (_, i) => [toSvgX(i + 6, 20, w), toSvgY(pennantTop(i), min, max, h)]);
  const bPts: [number, number][] = Array.from({ length: 8 }, (_, i) => [toSvgX(i + 6, 20, w), toSvgY(pennantBot(i), min, max, h)]);
  return (
    <svg width={w} height={h} className="rounded">
      <rect width={w} height={h} fill="#0f172a" rx={4} />
      <line x1={toSvgX(0, 20, w)} y1={poleY1} x2={poleX2} y2={poleY2} stroke="#22c55e" strokeWidth={2.5} />
      <polyline points={polyline(tPts)} fill="none" stroke="#f59e0b" strokeWidth={1.2} />
      <polyline points={polyline(bPts)} fill="none" stroke="#22d3ee" strokeWidth={1.2} />
      <text x={poleX2 + 4} y={toSvgY(85, min, max, h)} fill="#a3a3a3" fontSize={9}>Pennant</text>
    </svg>
  );
}

function HnSSvg() {
  const w = 220;
  const h = 110;
  const min = 44;
  const max = 92;
  const prices = [60, 65, 62, 68, 64, 75, 70, 80, 72, 75, 68, 62, 65, 58, 55, 52, 50, 48, 47, 45];
  const pts: [number, number][] = prices.map((p, i) => [toSvgX(i, prices.length, w), toSvgY(p, min, max, h)]);
  const necklineY = toSvgY(62, min, max, h);
  return (
    <svg width={w} height={h} className="rounded">
      <rect width={w} height={h} fill="#0f172a" rx={4} />
      <line x1={10} y1={necklineY} x2={w - 10} y2={necklineY} stroke="#ef4444" strokeWidth={1.2} strokeDasharray="4,3" />
      <polyline points={polyline(pts)} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
      <text x={10} y={necklineY - 4} fill="#ef4444" fontSize={9}>Neckline</text>
      <text x={toSvgX(7, 20, w)} y={toSvgY(80, min, max, h) - 5} fill="#a3a3a3" fontSize={8}>Head</text>
    </svg>
  );
}

function DoubleSvg() {
  const w = 220;
  const h = 110;
  const min = 44;
  const max = 90;
  const prices = [60, 65, 68, 72, 70, 68, 65, 63, 66, 70, 72, 70, 67, 64, 61, 58, 55, 52, 50, 49];
  const pts: [number, number][] = prices.map((p, i) => [toSvgX(i, prices.length, w), toSvgY(p, min, max, h)]);
  const necklineY = toSvgY(64, min, max, h);
  return (
    <svg width={w} height={h} className="rounded">
      <rect width={w} height={h} fill="#0f172a" rx={4} />
      <line x1={10} y1={necklineY} x2={w - 10} y2={necklineY} stroke="#f59e0b" strokeWidth={1.2} strokeDasharray="4,3" />
      <polyline points={polyline(pts)} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
      <text x={10} y={necklineY - 4} fill="#f59e0b" fontSize={9}>Support Break</text>
      <text x={toSvgX(3, 20, w)} y={toSvgY(72, min, max, h) - 5} fill="#22d3ee" fontSize={8}>Top1</text>
      <text x={toSvgX(11, 20, w)} y={toSvgY(72, min, max, h) - 5} fill="#22d3ee" fontSize={8}>Top2</text>
    </svg>
  );
}

const PRICE_ACTION_CONCEPTS: PriceActionConcept[] = [
  {
    title: "Support & Resistance",
    description: "Price levels where buying/selling pressure consistently emerges. Support is a floor where demand overwhelms supply; resistance is a ceiling where supply overwhelms demand. Flipped levels become opposite zones.",
    confluence: "Strong S/R coincides with round numbers, prior swing highs/lows, and Fibonacci levels.",
    svgComponent: <SRSvg />,
  },
  {
    title: "Trend Lines",
    description: "Diagonal lines connecting swing lows (uptrend) or swing highs (downtrend). A valid trend line requires at least 3 touches. The more touches, the more significant the level.",
    confluence: "Trend line break on high volume with close beyond the line signals trend change.",
    svgComponent: <TrendLineSvg />,
  },
  {
    title: "Channels",
    description: "Two parallel trend lines creating a price corridor. Price bounces between channel boundaries. Buy near lower channel in uptrend; sell near upper channel. Channel breaks signal acceleration or reversal.",
    confluence: "Channel + RSI overbought/oversold at boundaries increases probability.",
    svgComponent: <ChannelSvg />,
  },
  {
    title: "Wedges",
    description: "Converging trend lines both angling in the same direction. Rising wedges (bearish) form in uptrends; falling wedges (bullish) form in downtrends. Volume typically contracts within the wedge.",
    confluence: "Wedge breakout direction opposite to wedge direction. Volume expansion on break required.",
    svgComponent: <WedgeSvg />,
  },
  {
    title: "Flags",
    description: "Short consolidation against the preceding trend (pole), forming a rectangle slightly angled opposite. Represent brief pauses before trend continuation. Usually resolve in 5–15 bars.",
    confluence: "Flag + EMA support + MACD momentum alignment = high probability continuation.",
    svgComponent: <FlagSvg />,
  },
  {
    title: "Pennants",
    description: "Small symmetrical triangles that form after sharp moves (pole). Converging trend lines meet at apex. Like flags but triangular. Breakout typically in direction of pole with measured move equal to pole length.",
    confluence: "Pennant on decreasing volume + breakout volume surge = textbook continuation.",
    svgComponent: <PennantSvg />,
  },
  {
    title: "Head & Shoulders",
    description: "Three-peak reversal pattern: left shoulder, head (highest), right shoulder. Neckline drawn through the two troughs. Bearish when price breaks below neckline. Measured move = head height from neckline.",
    confluence: "H&S at major resistance with diverging RSI and volume decline on right shoulder.",
    svgComponent: <HnSSvg />,
  },
  {
    title: "Double Tops / Bottoms",
    description: "Two peaks/troughs at approximately same price. Neckline at intervening trough/peak. Confirmed on neckline break. Target = distance from peaks to neckline, projected from break. Most reliable reversal pattern.",
    confluence: "Double top/bottom + RSI divergence at second touch = very high probability reversal.",
    svgComponent: <DoubleSvg />,
  },
];

// ── Tab 2: Advanced Indicators ────────────────────────────────────────────────

function IchimokuSvg() {
  const w = 320;
  const h = 160;
  const n = 40;
  const rng = makeRng(42);
  const prices: number[] = [];
  let p = 100;
  for (let i = 0; i < n + 26; i++) {
    p += (rng() - 0.47) * 2.5;
    prices.push(p);
  }
  const min = Math.min(...prices) - 5;
  const max = Math.max(...prices) + 5;
  const ys = (v: number) => toSvgY(v, min, max, h, 8);
  const xs = (i: number) => toSvgX(i, n, w, 8);

  const tenkan: number[] = [];
  const kijun: number[] = [];
  const spanA: number[] = [];
  const spanB: number[] = [];
  for (let i = 0; i < n; i++) {
    const t9 = prices.slice(i, i + 9);
    const k26 = prices.slice(i, i + 26);
    const t52 = prices.slice(i, i + 52);
    tenkan.push((Math.max(...t9) + Math.min(...t9)) / 2);
    kijun.push((Math.max(...k26) + Math.min(...k26)) / 2);
    spanA.push((tenkan[i] + kijun[i]) / 2);
    if (t52.length === 52) {
      spanB.push((Math.max(...t52) + Math.min(...t52)) / 2);
    }
  }

  const pricePts: [number, number][] = prices.slice(0, n).map((v, i) => [xs(i), ys(v)]);
  const tenkanPts: [number, number][] = tenkan.map((v, i) => [xs(i), ys(v)]);
  const kijunPts: [number, number][] = kijun.map((v, i) => [xs(i), ys(v)]);
  const spanAPts: [number, number][] = spanA.map((v, i) => [xs(i), ys(v)]);

  return (
    <svg width={w} height={h} className="rounded w-full">
      <rect width={w} height={h} fill="#0f172a" rx={4} />
      <polyline points={polyline(spanAPts)} fill="none" stroke="#22c55e" strokeWidth={1} opacity={0.5} />
      <polyline points={polyline(tenkanPts)} fill="none" stroke="#ef4444" strokeWidth={1.2} />
      <polyline points={polyline(kijunPts)} fill="none" stroke="#3b82f6" strokeWidth={1.2} />
      <polyline points={polyline(pricePts)} fill="none" stroke="#e2e8f0" strokeWidth={1.8} />
      <text x={8} y={14} fill="#ef4444" fontSize={8}>Tenkan</text>
      <text x={55} y={14} fill="#3b82f6" fontSize={8}>Kijun</text>
      <text x={100} y={14} fill="#22c55e" fontSize={8}>Senkou A</text>
      <text x={155} y={14} fill="#a78bfa" fontSize={8}>Cloud</text>
    </svg>
  );
}

function VWAPSvg() {
  const w = 300;
  const h = 130;
  const rng = makeRng(77);
  const n = 50;
  const prices: number[] = [];
  let p = 150;
  for (let i = 0; i < n; i++) {
    p += (rng() - 0.49) * 2;
    prices.push(p);
  }
  const vwap = prices.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(prices.reduce((a, b) => a + (b - vwap) ** 2, 0) / n);
  const min = Math.min(...prices) - std * 2.5;
  const max = Math.max(...prices) + std * 2.5;
  const ys = (v: number) => toSvgY(v, min, max, h, 8);
  const xs = (i: number) => toSvgX(i, n, w, 8);
  const pricePts: [number, number][] = prices.map((v, i) => [xs(i), ys(v)]);
  const vwapY = ys(vwap);
  const b1Y = ys(vwap + std);
  const b2Y = ys(vwap + std * 2);
  const s1Y = ys(vwap - std);
  const s2Y = ys(vwap - std * 2);
  return (
    <svg width={w} height={h} className="rounded w-full">
      <rect width={w} height={h} fill="#0f172a" rx={4} />
      <line x1={8} y1={b2Y} x2={w - 8} y2={b2Y} stroke="#ef4444" strokeWidth={1} strokeDasharray="3,2" opacity={0.7} />
      <line x1={8} y1={b1Y} x2={w - 8} y2={b1Y} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3,2" opacity={0.7} />
      <line x1={8} y1={vwapY} x2={w - 8} y2={vwapY} stroke="#a78bfa" strokeWidth={1.5} />
      <line x1={8} y1={s1Y} x2={w - 8} y2={s1Y} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3,2" opacity={0.7} />
      <line x1={8} y1={s2Y} x2={w - 8} y2={s2Y} stroke="#22c55e" strokeWidth={1} strokeDasharray="3,2" opacity={0.7} />
      <polyline points={polyline(pricePts)} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
      <text x={w - 55} y={vwapY - 4} fill="#a78bfa" fontSize={8}>VWAP</text>
      <text x={w - 40} y={b2Y - 4} fill="#ef4444" fontSize={8}>+2σ</text>
      <text x={w - 40} y={s2Y + 12} fill="#22c55e" fontSize={8}>-2σ</text>
    </svg>
  );
}

function DivergenceSvg() {
  const w = 300;
  const h = 140;
  const prices = [60, 62, 65, 68, 70, 72, 74, 76, 78, 80, 79, 77, 75, 73, 71, 70, 72, 74, 76, 78, 79, 81, 82, 83, 82];
  const rsiVals = [50, 52, 55, 58, 62, 64, 66, 67, 68, 65, 63, 61, 58, 55, 53, 51, 53, 55, 57, 59, 60, 61, 61, 61, 60];
  const priceMin = 55;
  const priceMax = 90;
  const rsiMin = 40;
  const rsiMax = 80;
  const n = prices.length;
  const priceH = 75;
  const rsiH = 50;
  const pricePts: [number, number][] = prices.map((v, i) => [toSvgX(i, n, w, 8), toSvgY(v, priceMin, priceMax, priceH, 5) + 8]);
  const rsiPts: [number, number][] = rsiVals.map((v, i) => [toSvgX(i, n, w, 8), toSvgY(v, rsiMin, rsiMax, rsiH, 5) + priceH + 20]);
  const peak1X = toSvgX(9, n, w, 8);
  const peak2X = toSvgX(23, n, w, 8);
  const peak1PY = toSvgY(80, priceMin, priceMax, priceH, 5) + 8;
  const peak2PY = toSvgY(83, priceMin, priceMax, priceH, 5) + 8;
  const peak1RY = toSvgY(65, rsiMin, rsiMax, rsiH, 5) + priceH + 20;
  const peak2RY = toSvgY(61, rsiMin, rsiMax, rsiH, 5) + priceH + 20;
  return (
    <svg width={w} height={h} className="rounded w-full">
      <rect width={w} height={h} fill="#0f172a" rx={4} />
      <text x={8} y={16} fill="#a3a3a3" fontSize={8}>Price</text>
      <polyline points={polyline(pricePts)} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
      <line x1={8} y1={priceH + 14} x2={w - 8} y2={priceH + 14} stroke="#334155" strokeWidth={0.5} />
      <text x={8} y={priceH + 28} fill="#a3a3a3" fontSize={8}>RSI</text>
      <polyline points={polyline(rsiPts)} fill="none" stroke="#a78bfa" strokeWidth={1.5} />
      <line x1={peak1X} y1={peak1PY} x2={peak2X} y2={peak2PY} stroke="#ef4444" strokeWidth={1.2} strokeDasharray="3,2" />
      <line x1={peak1X} y1={peak1RY} x2={peak2X} y2={peak2RY} stroke="#22c55e" strokeWidth={1.2} strokeDasharray="3,2" />
      <text x={toSvgX(16, n, w, 8)} y={peak1PY - 5} fill="#ef4444" fontSize={8}>Bearish Div</text>
    </svg>
  );
}

const ADVANCED_INDICATORS = [
  {
    title: "Ichimoku Cloud",
    description: "All-in-one indicator with 5 components: Tenkan-sen (9-period midpoint), Kijun-sen (26-period midpoint), Senkou Span A (average of Tenkan/Kijun projected 26 bars forward), Senkou Span B (52-period midpoint projected forward), and Chikou Span (close shifted 26 bars back). Price above cloud = bullish; below = bearish.",
    components: ["Tenkan-sen (conversion)", "Kijun-sen (base)", "Senkou A (fast cloud)", "Senkou B (slow cloud)", "Chikou Span (lagging)"],
    svgComponent: <IchimokuSvg />,
    color: "text-green-400",
  },
  {
    title: "VWAP + Standard Deviation Bands",
    description: "Volume Weighted Average Price represents the average price paid weighted by volume. VWAP bands at ±1σ and ±2σ create dynamic support/resistance. Price above VWAP = institutional buyers in control. Below VWAP = sellers. ±2σ levels are extreme — expect mean reversion.",
    components: ["+2σ (overbought extreme)", "+1σ (mild overbought)", "VWAP (fair value)", "-1σ (mild oversold)", "-2σ (oversold extreme)"],
    svgComponent: <VWAPSvg />,
    color: "text-primary",
  },
  {
    title: "Divergence: Regular vs Hidden",
    description: "Regular bullish divergence: price makes lower low, RSI makes higher low — exhaustion of selling pressure, potential reversal up. Regular bearish divergence: price makes higher high, RSI makes lower high — weakening momentum. Hidden bullish/bearish divergence confirms continuation in the trend direction.",
    components: ["Regular bullish (lower low price, higher low RSI)", "Regular bearish (higher high price, lower high RSI)", "Hidden bullish (continuation)", "Hidden bearish (continuation)", "Confirmation: hold 3+ bars"],
    svgComponent: <DivergenceSvg />,
    color: "text-red-400",
  },
  {
    title: "Market Profile & POC",
    description: "Market Profile shows time price opportunity (TPO) — how long price spent at each level. Value Area: 70% of volume traded here. Point of Control (POC): highest volume price level. Price above Value Area High = potential breakout. Price below Value Area Low = potential breakdown. POC acts as magnetic attractor.",
    components: ["Value Area (70% of volume)", "Value Area High (VAH)", "Value Area Low (VAL)", "Point of Control (POC)", "Developing vs. Previous POC"],
    svgComponent: null,
    color: "text-muted-foreground",
  },
  {
    title: "Order Flow: Cumulative Delta",
    description: "Cumulative Delta tracks the difference between buying and selling volume (ask volume - bid volume). Rising delta with rising price = healthy trend. Divergence (rising price, falling delta) = distribution. Large negative delta spikes at support = absorption — smart money buying into selling pressure.",
    components: ["Delta = Ask vol - Bid vol", "Cumulative delta trend", "Delta divergence from price", "Absorption (large delta at key level)", "Footprint chart integration"],
    svgComponent: null,
    color: "text-yellow-400",
  },
  {
    title: "Relative Strength vs Index",
    description: "Compare asset performance to benchmark (SPY or sector ETF). RS line rising while both are falling = leadership/accumulation. RS line falling while both are rising = distribution/weakness. Breakouts in RS line often precede price breakouts. Trade leaders, avoid laggards.",
    components: ["RS = Stock / Index", "RS breakout = leadership", "RS breakdown = distribution", "Sector relative strength", "Leading vs lagging identification"],
    svgComponent: null,
    color: "text-orange-400",
  },
];

// ── Tab 3: Trading System Design ──────────────────────────────────────────────

function ExpectancySvg() {
  const scenarios: { wr: number; avgWin: number; avgLoss: number }[] = [
    { wr: 0.35, avgWin: 3.2, avgLoss: 1.0 },
    { wr: 0.42, avgWin: 1.8, avgLoss: 1.0 },
    { wr: 0.52, avgWin: 1.5, avgLoss: 1.0 },
    { wr: 0.55, avgWin: 1.2, avgLoss: 1.0 },
    { wr: 0.65, avgWin: 0.9, avgLoss: 1.0 },
  ];
  const expectancies = scenarios.map((s) => s.wr * s.avgWin - (1 - s.wr) * s.avgLoss);
  const w = 280;
  const h = 120;
  const max = Math.max(...expectancies) + 0.2;
  const min = Math.min(...expectancies) - 0.1;
  const barW = (w - 40) / scenarios.length;
  return (
    <svg width={w} height={h} className="rounded w-full">
      <rect width={w} height={h} fill="#0f172a" rx={4} />
      <line x1={30} y1={8} x2={30} y2={h - 20} stroke="#334155" strokeWidth={1} />
      <line x1={30} y1={h - 20} x2={w - 8} y2={h - 20} stroke="#334155" strokeWidth={1} />
      {expectancies.map((e, i) => {
        const x = 32 + i * barW;
        const barH = ((e - min) / (max - min)) * (h - 30);
        const y = h - 20 - barH;
        const color = e > 0 ? "#22c55e" : "#ef4444";
        return (
          <g key={i}>
            <rect x={x + 4} y={y} width={barW - 10} height={barH} fill={color} opacity={0.8} rx={2} />
            <text x={x + barW / 2 - 2} y={h - 8} fill="#94a3b8" fontSize={7} textAnchor="middle">
              {Math.round(scenarios[i].wr * 100)}%WR
            </text>
            <text x={x + barW / 2 - 2} y={y - 3} fill={color} fontSize={8} textAnchor="middle">
              {e.toFixed(2)}R
            </text>
          </g>
        );
      })}
      <text x={14} y={(h - 20) / 2} fill="#94a3b8" fontSize={7} textAnchor="middle" transform={`rotate(-90, 14, ${(h - 20) / 2})`}>
        Expectancy
      </text>
    </svg>
  );
}

const SYSTEM_SECTIONS = [
  {
    icon: <Target className="w-4 h-4" />,
    title: "Entry Rules",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    points: [
      "Primary signal: trend indicator alignment (EMA cross, ADX direction)",
      "Confirmation: price action (breakout, pullback, pattern completion)",
      "Timing: bar close above/below level — never enter mid-bar on daily",
      "Context filter: market regime must match strategy type",
      "Avoid entries: within 30 min of major news events",
    ],
  },
  {
    icon: <Shield className="w-4 h-4" />,
    title: "Exit Rules",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    points: [
      "Profit target 1: 1.5R — capture quick moves, reduce breakeven risk",
      "Profit target 2: 2.5–3R — let runners with trailing stop",
      "Stop loss: 1.5–2× ATR(14) below entry for longs",
      "Trailing stop: move to breakeven at 1R profit, trail by ATR thereafter",
      "Time stop: exit if position not profitable after N bars",
    ],
  },
  {
    icon: <DollarSign className="w-4 h-4" />,
    title: "Position Sizing",
    color: "text-primary",
    bgColor: "bg-primary/10",
    points: [
      "Risk per trade: 1–2% of account equity (fixed fractional)",
      "Max open risk: 6% portfolio (3 positions at 2% each)",
      "Shares = (Account × risk%) / (Entry - Stop)",
      "Reduce size 50% after 3 consecutive losses",
      "Never add to losing positions — pyramiding only on winners",
    ],
  },
  {
    icon: <BarChart2 className="w-4 h-4" />,
    title: "Walk-Forward Testing",
    color: "text-primary",
    bgColor: "bg-primary/10",
    points: [
      "In-sample period: optimize parameters on first 70% of data",
      "Out-of-sample: validate on remaining 30% — no further optimization",
      "Rolling window: repeat process advancing window forward quarterly",
      "OOS performance ≥ 80% of IS performance = robust system",
      "Overfitting warning: too many parameters relative to trades",
    ],
  },
  {
    icon: <AlertTriangle className="w-4 h-4" />,
    title: "System Degradation Signals",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    points: [
      "6+ consecutive losses beyond historical max = review immediately",
      "Drawdown exceeds 2× historical max drawdown = stop trading",
      "Win rate drops 10+ percentage points from backtest average",
      "Market regime changed: ADX regime now mismatches strategy type",
      "Edge erosion: typical in mean reversion when vol-of-vol rises",
    ],
  },
];

// ── Tab 4: Market Regime ──────────────────────────────────────────────────────

interface RegimeCard {
  regime: string;
  condition: string;
  strategy: string;
  posSize: string;
  indicators: string[];
  color: string;
  icon: React.ReactNode;
}

const REGIMES: RegimeCard[] = [
  {
    regime: "Trending",
    condition: "ADX > 25, price above 200 EMA, higher highs/lows",
    strategy: "Momentum: breakout entries, EMA pullback longs, trend following",
    posSize: "Full (1–2% risk per trade)",
    indicators: ["ADX > 25", "+DI > -DI (uptrend)", "Price > 200 EMA", "Rising volume on breaks"],
    color: "border-green-500/40 bg-green-500/5",
    icon: <TrendingUp className="w-5 h-5 text-green-400" />,
  },
  {
    regime: "Ranging",
    condition: "ADX < 20, price oscillating between horizontal S/R",
    strategy: "Mean reversion: RSI extremes, Bollinger Band touches, fade moves",
    posSize: "Standard (1% risk — tighter targets)",
    indicators: ["ADX < 20", "Price between clear S/R", "Flat 50 EMA", "Declining volume"],
    color: "border-cyan-500/40 bg-cyan-500/5",
    icon: <Repeat className="w-5 h-5 text-muted-foreground" />,
  },
  {
    regime: "Volatile / Crisis",
    condition: "VIX > 25, ATR expanded 2× its 20-day average",
    strategy: "Reduce exposure: smaller size, wider stops, avoid new entries",
    posSize: "50% reduction (0.5–1% risk)",
    indicators: ["VIX > 25", "ATR > 2× 20-day avg", "Large overnight gaps", "Bid-ask spreads widened"],
    color: "border-red-500/40 bg-red-500/5",
    icon: <Zap className="w-5 h-5 text-red-400" />,
  },
  {
    regime: "Low Volatility",
    condition: "VIX < 15, ATR contracted, Bollinger Band squeeze",
    strategy: "Prepare for breakout: reduce size in range, load on breakout confirmation",
    posSize: "25–50% (breakout pending, conserve capital)",
    indicators: ["VIX < 15", "BB width at 52W low", "Consolidation pattern", "Volume drying up"],
    color: "border-yellow-500/40 bg-yellow-500/5",
    icon: <Filter className="w-5 h-5 text-yellow-400" />,
  },
];

function RegimeAdaptiveSvg() {
  const w = 300;
  const h = 120;
  const rng = makeRng(99);
  const n = 60;
  const prices: number[] = [];
  let p = 100;
  for (let i = 0; i < n; i++) {
    if (i < 20) p += (rng() - 0.4) * 1.5;
    else if (i < 40) p += (rng() - 0.5) * 3;
    else p += (rng() - 0.45) * 2;
    prices.push(p);
  }
  const min = Math.min(...prices) - 5;
  const max = Math.max(...prices) + 5;
  const pts: [number, number][] = prices.map((v, i) => [toSvgX(i, n, w, 8), toSvgY(v, min, max, h, 10)]);
  return (
    <svg width={w} height={h} className="rounded w-full">
      <rect width={w} height={h} fill="#0f172a" rx={4} />
      <rect x={8} y={8} width={(w - 16) * (20 / 60)} height={h - 18} fill="#22c55e" opacity={0.06} />
      <rect x={8 + (w - 16) * (20 / 60)} y={8} width={(w - 16) * (20 / 60)} height={h - 18} fill="#ef4444" opacity={0.06} />
      <rect x={8 + (w - 16) * (40 / 60)} y={8} width={(w - 16) * (20 / 60)} height={h - 18} fill="#3b82f6" opacity={0.06} />
      <text x={16} y={18} fill="#22c55e" fontSize={7}>Trending</text>
      <text x={8 + (w - 16) * (20 / 60) + 4} y={18} fill="#ef4444" fontSize={7}>Volatile</text>
      <text x={8 + (w - 16) * (40 / 60) + 4} y={18} fill="#3b82f6" fontSize={7}>Ranging</text>
      <polyline points={polyline(pts)} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
    </svg>
  );
}

// ── Tab 5: Options TA ─────────────────────────────────────────────────────────

const OPTIONS_TA_CONCEPTS = [
  {
    title: "Options Flow as TA Signal",
    badge: "Sentiment",
    badgeColor: "bg-primary/20 text-primary",
    description: "Large unusual options sweeps at key technical levels amplify the significance of those levels. A $2M call sweep at the 200-day EMA on above-average volume confirms institutional interest at that level. Combine flow with classical S/R analysis for high-conviction trades.",
    rules: [
      "Premium > $500K = significant",
      "Sweep order (multi-exchange) = urgency",
      "At key technical level = highest conviction",
      "OTM with short expiry = directional bet",
    ],
  },
  {
    title: "Put/Call Ratio Divergence",
    badge: "Contrarian",
    badgeColor: "bg-red-500/20 text-red-300",
    description: "Extreme put/call ratio divergence from price is a contrarian signal. P/C > 1.2 while price makes new high = hedging/fear at tops — consider reducing longs. P/C < 0.7 while price makes new low = complacency at bottoms. Works best at multi-month extremes, not intraday.",
    rules: [
      "P/C > 1.2 + price at resistance = bearish",
      "P/C < 0.7 + price at support = bullish",
      "Divergence must persist 2+ days",
      "Combine with VIX for confirmation",
    ],
  },
  {
    title: "Max Pain Theory",
    badge: "Expiry",
    badgeColor: "bg-yellow-500/20 text-yellow-300",
    description: "Max pain is the strike where the greatest number of options (by dollar value) expire worthless — causing maximum pain to options buyers. Stock tends to drift toward max pain as expiration approaches due to market maker delta hedging. Effect strongest in final 2–3 days before expiry.",
    rules: [
      "Max pain = Σ(OI × |current - strike|) minimized",
      "Effect strongest Thursday/Friday expiry week",
      "Large divergence from max pain = pull toward it",
      "Less reliable with large open interest imbalances",
    ],
  },
  {
    title: "Gamma Exposure (GEX)",
    badge: "Market Structure",
    badgeColor: "bg-cyan-500/20 text-muted-foreground",
    description: "Gamma Exposure measures market maker net gamma position. Positive GEX: MMs are long gamma, so they sell rallies and buy dips (price stabilization). Negative GEX: MMs are short gamma, must buy rallies and sell dips (price amplification). GEX flips at major strikes create volatility transitions.",
    rules: [
      "Positive GEX → range-bound, buy dips",
      "Negative GEX → trending, follow momentum",
      "GEX flip strike = potential volatility event",
      "Zero GEX level = key pivot price",
    ],
  },
  {
    title: "Delta Hedging Flows",
    badge: "Mechanics",
    badgeColor: "bg-orange-500/20 text-orange-300",
    description: "Market makers hedge delta by trading the underlying. When large call strikes are nearby, MMs are short calls and buy stock as price approaches (magnetic effect). When MMs are short puts below market, they buy stock as price falls (support). Understanding hedging flows explains 'magnetic' price behavior near strikes.",
    rules: [
      "Large call OI above = resistance cluster",
      "Large put OI below = support cluster",
      "Price through large strike = acceleration (gamma unwind)",
      "OpEx week = increased volatility at key strikes",
    ],
  },
  {
    title: "VIX Term Structure as TA Signal",
    badge: "Vol Signal",
    badgeColor: "bg-green-500/20 text-green-300",
    description: "VIX term structure (spot vs. 3-month VIX futures) encodes near-term fear. Contango (VIX3M > VIX) = normal, low near-term fear, bullish. Backwardation (VIX > VIX3M) = elevated near-term fear, potential crash. Rapid shift from contango to backwardation = imminent volatility event signal.",
    rules: [
      "Contango ratio > 1.05 = bullish backdrop",
      "Backwardation (ratio < 0.95) = bearish signal",
      "Rapid shift from contango → backwardation = alert",
      "Combine with SPX technical level for entry timing",
    ],
  },
];

// ── Tab 6: Backtesting ────────────────────────────────────────────────────────

interface StratResult {
  name: string;
  shortName: string;
  winRate: number;
  avgR: number;
  sharpe: number;
  maxDD: number;
  totalTrades: number;
  color: string;
}

const STRATEGIES: StratResult[] = [
  { name: "EMA Crossover (10/50)", shortName: "EMA X", winRate: 0.42, avgR: 1.8, sharpe: 0.65, maxDD: 18.4, totalTrades: 312, color: "#60a5fa" },
  { name: "RSI Mean Reversion (30/70)", shortName: "RSI MR", winRate: 0.55, avgR: 1.2, sharpe: 0.82, maxDD: 12.1, totalTrades: 487, color: "#a78bfa" },
  { name: "Breakout System (52W High)", shortName: "52W BRK", winRate: 0.35, avgR: 3.2, sharpe: 0.71, maxDD: 22.7, totalTrades: 156, color: "#22c55e" },
  { name: "Trend Following (ADX>25)", shortName: "TF ADX", winRate: 0.40, avgR: 2.1, sharpe: 0.78, maxDD: 15.3, totalTrades: 203, color: "#f59e0b" },
  { name: "Candlestick Patterns", shortName: "CNDL", winRate: 0.52, avgR: 1.5, sharpe: 0.61, maxDD: 14.8, totalTrades: 391, color: "#f87171" },
];

function EquityCurveSvg({ strategy, seed }: { strategy: StratResult; seed: number }) {
  const rng = makeRng(seed);
  const trades = 80;
  const equity: number[] = [100];
  for (let i = 0; i < trades; i++) {
    const win = rng() < strategy.winRate;
    const last = equity[equity.length - 1];
    const change = win ? last * (strategy.avgR * 0.01 * (0.8 + rng() * 0.4)) : last * (-0.01 * (0.8 + rng() * 0.4));
    equity.push(Math.max(last + change, last * 0.5));
  }
  const w = 240;
  const h = 80;
  const min = Math.min(...equity) * 0.98;
  const max = Math.max(...equity) * 1.02;
  const pts: [number, number][] = equity.map((v, i) => [toSvgX(i, equity.length, w, 6), toSvgY(v, min, max, h, 6)]);
  const final = equity[equity.length - 1];
  const gain = ((final - 100) / 100) * 100;
  return (
    <svg width={w} height={h} className="rounded w-full">
      <defs>
        <linearGradient id={`eq-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strategy.color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={strategy.color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="#0f172a" rx={3} />
      <polygon
        points={`${pts[0][0]},${toSvgY(min, min, max, h, 6)} ${polyline(pts)} ${pts[pts.length - 1][0]},${toSvgY(min, min, max, h, 6)}`}
        fill={`url(#eq-${seed})`}
      />
      <polyline points={polyline(pts)} fill="none" stroke={strategy.color} strokeWidth={1.5} />
      <text x={w - 8} y={14} fill={gain >= 0 ? "#22c55e" : "#ef4444"} fontSize={9} textAnchor="end">
        {gain >= 0 ? "+" : ""}{gain.toFixed(1)}%
      </text>
    </svg>
  );
}

function MonthlyHeatmapSvg({ seed, winRate }: { seed: number; winRate: number }) {
  const rng = makeRng(seed + 1000);
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const years = [2020, 2021, 2022, 2023, 2024];
  const cellW = 16;
  const cellH = 14;
  const padL = 28;
  const padT = 16;
  const w = padL + months.length * cellW + 8;
  const h = padT + years.length * cellH + 8;
  return (
    <svg width={w} height={h} className="rounded">
      <rect width={w} height={h} fill="#0f172a" rx={3} />
      {months.map((m, mi) => (
        <text key={mi} x={padL + mi * cellW + cellW / 2} y={padT - 3} fill="#64748b" fontSize={7} textAnchor="middle">{m}</text>
      ))}
      {years.map((y, yi) => (
        <g key={yi}>
          <text x={padL - 3} y={padT + yi * cellH + cellH / 2 + 3} fill="#64748b" fontSize={7} textAnchor="end">{y}</text>
          {months.map((_, mi) => {
            const r = rng();
            const win = r < winRate;
            const intensity = 0.4 + rng() * 0.6;
            const fill = win ? `rgba(34,197,94,${intensity * 0.7})` : `rgba(239,68,68,${intensity * 0.6})`;
            return (
              <rect
                key={mi}
                x={padL + mi * cellW + 1}
                y={padT + yi * cellH + 1}
                width={cellW - 2}
                height={cellH - 2}
                fill={fill}
                rx={1}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

const MONTHLY_CORRELATION = [
  [1.00, 0.42, 0.18, 0.35, 0.28],
  [0.42, 1.00, 0.12, 0.29, 0.45],
  [0.18, 0.12, 1.00, 0.61, 0.09],
  [0.35, 0.29, 0.61, 1.00, 0.23],
  [0.28, 0.45, 0.09, 0.23, 1.00],
];

function CorrelationMatrixSvg() {
  const labels = STRATEGIES.map((s) => s.shortName);
  const n = labels.length;
  const cell = 38;
  const pad = 48;
  const w = pad + n * cell;
  const h = pad + n * cell;
  return (
    <svg width={w} height={h} className="rounded w-full">
      <rect width={w} height={h} fill="#0f172a" rx={4} />
      {labels.map((l, i) => (
        <g key={i}>
          <text x={pad + i * cell + cell / 2} y={pad - 6} fill="#94a3b8" fontSize={8} textAnchor="middle">{l}</text>
          <text x={pad - 6} y={pad + i * cell + cell / 2 + 3} fill="#94a3b8" fontSize={8} textAnchor="end">{l}</text>
        </g>
      ))}
      {MONTHLY_CORRELATION.map((row, ri) =>
        row.map((val, ci) => {
          const r = Math.round((1 - val) * 128);
          const g = Math.round(val * 128 + 40);
          const b = Math.round((1 - Math.abs(val - 0.5) * 2) * 80);
          const fill = ri === ci ? "#334155" : `rgb(${r},${g},${b})`;
          return (
            <g key={`${ri}-${ci}`}>
              <rect x={pad + ci * cell} y={pad + ri * cell} width={cell} height={cell} fill={fill} />
              <text x={pad + ci * cell + cell / 2} y={pad + ri * cell + cell / 2 + 4} fill="#e2e8f0" fontSize={8} textAnchor="middle">
                {val.toFixed(2)}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdvancedTAPage() {
  const [activeTab, setActiveTab] = useState("priceaction");
  const [expandedConcept, setExpandedConcept] = useState<number | null>(null);
  const [expandedIndicator, setExpandedIndicator] = useState<number | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState(0);

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-4">
      {/* HERO header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 border-l-4 border-l-primary rounded-md bg-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Advanced Technical Analysis</h1>
            <p className="text-sm text-muted-foreground">Professional strategies, systems design, and backtested results</p>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6 h-auto gap-1 bg-muted/30">
          {[
            { value: "priceaction", label: "Price Action" },
            { value: "indicators", label: "Indicators" },
            { value: "system", label: "Systems" },
            { value: "regime", label: "Regime" },
            { value: "options", label: "Options TA" },
            { value: "backtest", label: "Backtest" },
          ].map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs text-muted-foreground py-1.5">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab 1: Price Action ─────────────────────────────────────────────── */}
        <TabsContent value="priceaction" className="data-[state=inactive]:hidden space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PRICE_ACTION_CONCEPTS.map((concept, i) => (
              <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                <Card
                  className="p-4 cursor-pointer border-border/50 hover:border-primary/40 transition-all"
                  onClick={() => setExpandedConcept(expandedConcept === i ? null : i)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-foreground">{concept.title}</h3>
                    {expandedConcept === i ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="w-full overflow-hidden rounded mb-3">{concept.svgComponent}</div>
                  <AnimatePresence>
                    {expandedConcept === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{concept.description}</p>
                        <div className="p-2 rounded bg-primary/5 border border-primary/20">
                          <p className="text-xs text-primary font-medium mb-0.5">Confluence Zone</p>
                          <p className="text-xs text-muted-foreground">{concept.confluence}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Volume + Multi-TF sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Card className="p-4 border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Volume Confirmation</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Breakout + High Volume", note: "Institutional participation confirms move", color: "bg-green-500" },
                  { label: "Breakout + Low Volume", note: "Suspect — high failure rate, wait for retest", color: "bg-yellow-500" },
                  { label: "Rejection + Low Volume", note: "Normal — lack of conviction at extreme", color: "bg-cyan-500" },
                  { label: "Rejection + High Volume", note: "Absorption — smart money opposing the move", color: "bg-primary" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={cn("w-2 h-2 rounded-full mt-1 shrink-0", item.color)} />
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-yellow-400" />
                <h3 className="font-semibold text-sm">Multi-Timeframe Analysis</h3>
              </div>
              <div className="space-y-3">
                {[
                  { tf: "Weekly", role: "Bias & Major S/R", desc: "Identifies the dominant trend direction. Only trade in weekly trend direction.", color: "text-yellow-400" },
                  { tf: "Daily", role: "Entry Timeframe", desc: "Sets up patterns, flags, pullbacks. Primary chart for position entries.", color: "text-primary" },
                  { tf: "Hourly", role: "Precise Timing", desc: "Fine-tunes entry within the daily setup. Tighten stops using intraday structure.", color: "text-green-400" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <Badge variant="outline" className={cn("text-xs text-muted-foreground shrink-0", item.color)}>
                      {item.tf}
                    </Badge>
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.role}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 2: Advanced Indicators ─────────────────────────────────────── */}
        <TabsContent value="indicators" className="data-[state=inactive]:hidden space-y-4">
          {ADVANCED_INDICATORS.map((ind, i) => (
            <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible">
              <Card
                className="p-4 border-border/50 hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => setExpandedIndicator(expandedIndicator === i ? null : i)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className={cn("w-4 h-4", ind.color)} />
                    <h3 className="font-medium text-sm">{ind.title}</h3>
                  </div>
                  {expandedIndicator === i ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {ind.svgComponent && (
                  <div className="w-full overflow-hidden rounded mb-3">{ind.svgComponent}</div>
                )}

                <AnimatePresence>
                  {expandedIndicator === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{ind.description}</p>
                      <div className="grid grid-cols-1 gap-1">
                        {ind.components.map((comp, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                            <p className="text-xs text-muted-foreground">{comp}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {expandedIndicator !== i && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{ind.description}</p>
                )}
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Tab 3: Trading System Design ───────────────────────────────────── */}
        <TabsContent value="system" className="data-[state=inactive]:hidden space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYSTEM_SECTIONS.map((section, i) => (
              <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                <Card className={cn("p-4 border h-full", section.color.replace("text-", "border-").replace("-400", "-500/30"))}>
                  <div className={cn("flex items-center gap-2 mb-3 p-2 rounded-lg w-fit", section.bgColor)}>
                    <span className={section.color}>{section.icon}</span>
                    <h3 className={cn("font-medium text-sm", section.color)}>{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.points.map((point, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0 mt-1.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">{point}</p>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Expectancy chart */}
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-yellow-400" />
              <h3 className="font-medium text-sm">Expectancy by Win Rate / Average R</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Expectancy = (Win% × Avg Win) − (Loss% × Avg Loss). A system with 35% win rate can outperform a 65% win rate system if the average R is large enough.
            </p>
            <div className="max-w-sm">
              <ExpectancySvg />
            </div>
            <div className="mt-3 p-3 rounded bg-yellow-500/5 border border-yellow-500/20">
              <p className="text-xs text-yellow-300 font-medium">Key Insight</p>
              <p className="text-xs text-muted-foreground mt-1">
                A 35% win rate breakout system with 3.2R average win achieves +0.56R expectancy — better than a 65% win rate system grinding 0.9R avg wins with −0.02R expectancy.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Market Regime ───────────────────────────────────────────── */}
        <TabsContent value="regime" className="data-[state=inactive]:hidden space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REGIMES.map((r, i) => (
              <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                <Card className={cn("p-4 border", r.color)}>
                  <div className="flex items-center gap-2 mb-2">
                    {r.icon}
                    <h3 className="font-medium text-sm">{r.regime} Market</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{r.condition}</p>
                  <div className="p-2 rounded bg-background/40 mb-2">
                    <p className="text-xs font-medium text-foreground mb-0.5">Strategy</p>
                    <p className="text-xs text-muted-foreground">{r.strategy}</p>
                  </div>
                  <div className="p-2 rounded bg-background/40 mb-2">
                    <p className="text-xs font-medium text-foreground mb-0.5">Position Size</p>
                    <p className="text-xs text-muted-foreground">{r.posSize}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.indicators.map((ind, j) => (
                      <Badge key={j} variant="outline" className="text-xs text-muted-foreground py-0">
                        {ind}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-3.5 h-3.5 text-muted-foreground/50" />
              <h3 className="font-medium text-sm">Adaptive Parameters by Regime</h3>
            </div>
            <div className="max-w-sm mb-3">
              <RegimeAdaptiveSvg />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  label: "Stops",
                  high: "1.5–2.5× ATR (high vol)",
                  low: "1.0–1.5× ATR (low vol)",
                  icon: <Shield className="w-3 h-3" />,
                  color: "text-red-400",
                },
                {
                  label: "Targets",
                  high: "3–5× R (trending)",
                  low: "1.5–2× R (ranging)",
                  icon: <Target className="w-3 h-3" />,
                  color: "text-green-400",
                },
                {
                  label: "Correlation Filter",
                  high: "Avoid trades correlated > 0.7 with open positions",
                  low: "Diversify across uncorrelated strategies",
                  icon: <Filter className="w-3 h-3" />,
                  color: "text-muted-foreground",
                },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded bg-muted/20 border border-border/30">
                  <div className={cn("flex items-center gap-1 mb-2", item.color)}>
                    {item.icon}
                    <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.high}</p>
                  <p className="text-xs text-muted-foreground mt-1 pt-1 border-t border-border/30">{item.low}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ── Tab 5: Options TA ──────────────────────────────────────────────── */}
        <TabsContent value="options" className="data-[state=inactive]:hidden space-y-3">
          {OPTIONS_TA_CONCEPTS.map((concept, i) => (
            <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible">
              <Card className="p-4 border-border/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                    <h3 className="font-medium text-sm">{concept.title}</h3>
                  </div>
                  <Badge className={cn("text-xs text-muted-foreground shrink-0", concept.badgeColor)}>{concept.badge}</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{concept.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {concept.rules.map((rule, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0 mt-1" />
                      <p className="text-xs text-muted-foreground">{rule}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Tab 6: Backtesting ─────────────────────────────────────────────── */}
        <TabsContent value="backtest" className="data-[state=inactive]:hidden space-y-4">
          {/* Strategy selector */}
          <div className="flex flex-wrap gap-2">
            {STRATEGIES.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedStrategy(i)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs text-muted-foreground font-medium border transition-all",
                  selectedStrategy === i
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-border"
                )}
              >
                {s.shortName}
              </button>
            ))}
          </div>

          {/* Selected strategy detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedStrategy}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm" style={{ color: STRATEGIES[selectedStrategy].color }}>
                    {STRATEGIES[selectedStrategy].name}
                  </h3>
                  <div className="flex gap-2">
                    {[
                      { label: "Win Rate", value: `${(STRATEGIES[selectedStrategy].winRate * 100).toFixed(0)}%` },
                      { label: "Avg R", value: `${STRATEGIES[selectedStrategy].avgR}R` },
                      { label: "Sharpe", value: STRATEGIES[selectedStrategy].sharpe.toFixed(2) },
                      { label: "Max DD", value: `-${STRATEGIES[selectedStrategy].maxDD}%` },
                    ].map((m, i) => (
                      <div key={i} className="text-center">
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="text-xs font-bold text-foreground">{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Equity Curve (80 trades)</p>
                    <EquityCurveSvg strategy={STRATEGIES[selectedStrategy]} seed={(selectedStrategy + 1) * 37} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Monthly Returns Heatmap</p>
                    <MonthlyHeatmapSvg seed={(selectedStrategy + 1) * 37} winRate={STRATEGIES[selectedStrategy].winRate} />
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Drawdown comparison table */}
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <h3 className="font-medium text-sm">Drawdown & Performance Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-muted-foreground">
                <thead>
                  <tr className="border-b border-border/40">
                    {["Strategy", "Win %", "Avg R", "Sharpe", "Max DD", "Trades", "Expectancy"].map((h) => (
                      <th key={h} className="py-2 px-2 text-left text-muted-foreground font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STRATEGIES.map((s, i) => {
                    const exp = s.winRate * s.avgR - (1 - s.winRate) * 1.0;
                    return (
                      <tr
                        key={i}
                        className={cn(
                          "border-b border-border/20 hover:bg-muted/20 cursor-pointer transition-colors",
                          selectedStrategy === i && "bg-muted/30"
                        )}
                        onClick={() => setSelectedStrategy(i)}
                      >
                        <td className="py-2 px-2 font-medium" style={{ color: s.color }}>
                          {s.shortName}
                        </td>
                        <td className="py-2 px-2 text-foreground">{(s.winRate * 100).toFixed(0)}%</td>
                        <td className="py-2 px-2 text-foreground">{s.avgR}R</td>
                        <td className="py-2 px-2 text-foreground">{s.sharpe}</td>
                        <td className="py-2 px-2 text-red-400">-{s.maxDD}%</td>
                        <td className="py-2 px-2 text-muted-foreground">{s.totalTrades}</td>
                        <td className={cn("py-2 px-2 font-medium", exp > 0 ? "text-green-400" : "text-red-400")}>
                          {exp > 0 ? "+" : ""}{exp.toFixed(2)}R
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Correlation matrix */}
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Strategy Return Correlation Matrix</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Low inter-strategy correlation provides diversification benefit. Combining uncorrelated strategies reduces overall portfolio drawdown even when individual strategies are in drawdown.
            </p>
            <div className="overflow-x-auto">
              <CorrelationMatrixSvg />
            </div>
            <div className="mt-3 p-3 rounded bg-cyan-500/5 border border-cyan-500/20">
              <p className="text-xs text-muted-foreground font-medium">Diversification Insight</p>
              <p className="text-xs text-muted-foreground mt-1">
                EMA Crossover + Breakout System correlation = 0.18. Combining these two strategies reduces portfolio max drawdown by ~30% vs. trading either alone, while maintaining combined positive expectancy.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
