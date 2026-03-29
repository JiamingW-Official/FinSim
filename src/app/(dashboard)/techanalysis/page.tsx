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
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── mulberry32 seeded PRNG (seed=7531) ───────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── OHLCV generation ─────────────────────────────────────────────────────────

interface Bar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function generateBars(n: number, seed: number, startPrice = 150): Bar[] {
  const rng = mulberry32(seed);
  const bars: Bar[] = [];
  let price = startPrice;
  for (let i = 0; i < n; i++) {
    const drift = (rng() - 0.48) * 3;
    const volatility = 2 + rng() * 4;
    const open = price;
    const close = open + drift;
    const high = Math.max(open, close) + rng() * volatility;
    const low = Math.min(open, close) - rng() * volatility;
    const volume = 500000 + rng() * 2000000;
    bars.push({
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume: Math.round(volume),
    });
    price = close;
  }
  return bars;
}

// ── EMA calculation ───────────────────────────────────────────────────────────

function calcEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let prev = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      ema.push(NaN);
    } else if (i === period - 1) {
      ema.push(prev);
    } else {
      prev = prices[i] * k + prev * (1 - k);
      ema.push(+prev.toFixed(3));
    }
  }
  return ema;
}

// ── RSI calculation ───────────────────────────────────────────────────────────

function calcRSI(closes: number[], period = 14): number[] {
  const rsi: number[] = Array(period).fill(NaN);
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff;
    else avgLoss += Math.abs(diff);
  }
  avgGain /= period;
  avgLoss /= period;
  rsi.push(100 - 100 / (1 + avgGain / (avgLoss || 0.001)));
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rsi.push(+(100 - 100 / (1 + avgGain / (avgLoss || 0.001))).toFixed(2));
  }
  return rsi;
}

// ── MACD calculation ──────────────────────────────────────────────────────────

function calcMACD(closes: number[], fast = 12, slow = 26, signal = 9) {
  const emaFast = calcEMA(closes, fast);
  const emaSlow = calcEMA(closes, slow);
  const macdLine = closes.map((_, i) =>
    isNaN(emaFast[i]) || isNaN(emaSlow[i]) ? NaN : +(emaFast[i] - emaSlow[i]).toFixed(4)
  );
  const validMacd = macdLine.filter((v) => !isNaN(v));
  const signalLine = calcEMA(validMacd, signal);
  const fullSignal: number[] = macdLine.map((v, i) => {
    if (isNaN(v)) return NaN;
    const idx = macdLine.slice(0, i + 1).filter((x) => !isNaN(x)).length - 1;
    return signalLine[idx] ?? NaN;
  });
  const histogram = macdLine.map((v, i) =>
    isNaN(v) || isNaN(fullSignal[i]) ? NaN : +(v - fullSignal[i]).toFixed(4)
  );
  return { macdLine, signalLine: fullSignal, histogram };
}

// ── Stochastic calculation ────────────────────────────────────────────────────

function calcStochastic(bars: Bar[], kPeriod = 14, dPeriod = 3) {
  const kLine: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (i < kPeriod - 1) { kLine.push(NaN); continue; }
    const slice = bars.slice(i - kPeriod + 1, i + 1);
    const highest = Math.max(...slice.map((b) => b.high));
    const lowest = Math.min(...slice.map((b) => b.low));
    kLine.push(+(((bars[i].close - lowest) / (highest - lowest || 1)) * 100).toFixed(2));
  }
  const dLine = calcEMA(kLine.filter((v) => !isNaN(v)), dPeriod);
  const fullD: number[] = kLine.map((v, i) => {
    if (isNaN(v)) return NaN;
    const idx = kLine.slice(0, i + 1).filter((x) => !isNaN(x)).length - 1;
    return dLine[idx] ?? NaN;
  });
  return { kLine, dLine: fullD };
}

// ── Bollinger Bands ───────────────────────────────────────────────────────────

function calcBollinger(closes: number[], period = 20, mult = 2) {
  const upper: number[] = [], middle: number[] = [], lower: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) { upper.push(NaN); middle.push(NaN); lower.push(NaN); continue; }
    const slice = closes.slice(i - period + 1, i + 1);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(slice.reduce((a, b) => a + (b - sma) ** 2, 0) / period);
    middle.push(+sma.toFixed(3));
    upper.push(+(sma + mult * std).toFixed(3));
    lower.push(+(sma - mult * std).toFixed(3));
  }
  return { upper, middle, lower };
}

// ── ADX calculation ───────────────────────────────────────────────────────────

function calcADX(bars: Bar[], period = 14): number {
  if (bars.length < period + 1) return 25;
  const trueRanges: number[] = [];
  const plusDMs: number[] = [];
  const minusDMs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const high = bars[i].high, low = bars[i].low, prevClose = bars[i - 1].close;
    const prevHigh = bars[i - 1].high, prevLow = bars[i - 1].low;
    trueRanges.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
    const plusDM = high - prevHigh > prevLow - low ? Math.max(high - prevHigh, 0) : 0;
    const minusDM = prevLow - low > high - prevHigh ? Math.max(prevLow - low, 0) : 0;
    plusDMs.push(plusDM);
    minusDMs.push(minusDM);
  }
  const last = bars.length - 1;
  const sliceTR = trueRanges.slice(Math.max(0, last - period));
  const slicePlus = plusDMs.slice(Math.max(0, last - period));
  const sliceMinus = minusDMs.slice(Math.max(0, last - period));
  const atr = sliceTR.reduce((a, b) => a + b, 0) / sliceTR.length;
  const plusDI = (slicePlus.reduce((a, b) => a + b, 0) / sliceTR.length / atr) * 100;
  const minusDI = (sliceMinus.reduce((a, b) => a + b, 0) / sliceTR.length / atr) * 100;
  const dx = (Math.abs(plusDI - minusDI) / (plusDI + minusDI || 1)) * 100;
  return +dx.toFixed(1);
}

// ── OBV calculation ───────────────────────────────────────────────────────────

function calcOBV(bars: Bar[]): number[] {
  const obv: number[] = [0];
  for (let i = 1; i < bars.length; i++) {
    const prev = obv[i - 1];
    if (bars[i].close > bars[i - 1].close) obv.push(prev + bars[i].volume);
    else if (bars[i].close < bars[i - 1].close) obv.push(prev - bars[i].volume);
    else obv.push(prev);
  }
  return obv;
}

// ── Shared synthetic data (seed=7531) ─────────────────────────────────────────

const BARS_60 = generateBars(60, 7531, 150);
const BARS_100 = generateBars(100, 7531, 150);

// ── Pattern definitions ───────────────────────────────────────────────────────

interface CandlePattern {
  id: string;
  name: string;
  sentiment: "bullish" | "bearish" | "neutral";
  reliability: number;
  timeframe: string;
  entry: string;
  stop: string;
  svgPath: React.ReactNode;
  barIndices?: number[];
}

const CANDLE_PATTERNS: CandlePattern[] = [
  {
    id: "hammer",
    name: "Hammer",
    sentiment: "bullish",
    reliability: 65,
    timeframe: "Daily / Weekly",
    entry: "Break above hammer high",
    stop: "Below hammer low",
    svgPath: (
      <g>
        <line x1="25" y1="5" x2="25" y2="14" stroke="#6b7280" strokeWidth="1" />
        <rect x="20" y="14" width="10" height="5" fill="#10b981" rx="1" />
        <line x1="25" y1="19" x2="25" y2="28" stroke="#10b981" strokeWidth="1.5" />
      </g>
    ),
    barIndices: [8, 22, 41],
  },
  {
    id: "bullish-engulfing",
    name: "Bullish Engulfing",
    sentiment: "bullish",
    reliability: 72,
    timeframe: "Daily / 4H",
    entry: "Next bar open",
    stop: "Below engulfing candle low",
    svgPath: (
      <g>
        <rect x="18" y="10" width="8" height="10" fill="#ef4444" rx="1" />
        <line x1="22" y1="8" x2="22" y2="10" stroke="#ef4444" strokeWidth="1" />
        <line x1="22" y1="20" x2="22" y2="23" stroke="#ef4444" strokeWidth="1" />
        <rect x="26" y="7" width="10" height="15" fill="#10b981" rx="1" />
        <line x1="31" y1="4" x2="31" y2="7" stroke="#10b981" strokeWidth="1" />
        <line x1="31" y1="22" x2="31" y2="26" stroke="#10b981" strokeWidth="1" />
      </g>
    ),
    barIndices: [15, 33],
  },
  {
    id: "morning-star",
    name: "Morning Star",
    sentiment: "bullish",
    reliability: 78,
    timeframe: "Daily / Weekly",
    entry: "Third candle close",
    stop: "Below middle candle low",
    svgPath: (
      <g>
        <rect x="8" y="6" width="8" height="14" fill="#ef4444" rx="1" />
        <line x1="12" y1="4" x2="12" y2="6" stroke="#ef4444" strokeWidth="1" />
        <line x1="12" y1="20" x2="12" y2="24" stroke="#ef4444" strokeWidth="1" />
        <rect x="21" y="17" width="6" height="4" fill="#6b7280" rx="1" />
        <line x1="24" y1="14" x2="24" y2="17" stroke="#6b7280" strokeWidth="1" />
        <line x1="24" y1="21" x2="24" y2="26" stroke="#6b7280" strokeWidth="1" />
        <rect x="32" y="8" width="8" height="12" fill="#10b981" rx="1" />
        <line x1="36" y1="5" x2="36" y2="8" stroke="#10b981" strokeWidth="1" />
        <line x1="36" y1="20" x2="36" y2="23" stroke="#10b981" strokeWidth="1" />
      </g>
    ),
    barIndices: [19, 47],
  },
  {
    id: "three-white-soldiers",
    name: "Three White Soldiers",
    sentiment: "bullish",
    reliability: 80,
    timeframe: "Daily",
    entry: "Third candle close",
    stop: "Below first candle low",
    svgPath: (
      <g>
        <rect x="5" y="18" width="8" height="10" fill="#10b981" rx="1" />
        <rect x="17" y="13" width="8" height="12" fill="#10b981" rx="1" />
        <rect x="29" y="8" width="8" height="14" fill="#10b981" rx="1" />
        <line x1="9" y1="16" x2="9" y2="18" stroke="#10b981" strokeWidth="1" />
        <line x1="21" y1="11" x2="21" y2="13" stroke="#10b981" strokeWidth="1" />
        <line x1="33" y1="6" x2="33" y2="8" stroke="#10b981" strokeWidth="1" />
      </g>
    ),
    barIndices: [28, 52],
  },
  {
    id: "piercing-line",
    name: "Piercing Line",
    sentiment: "bullish",
    reliability: 64,
    timeframe: "Daily",
    entry: "Next bar open",
    stop: "Below second candle low",
    svgPath: (
      <g>
        <rect x="12" y="6" width="9" height="14" fill="#ef4444" rx="1" />
        <line x1="16" y1="4" x2="16" y2="6" stroke="#ef4444" strokeWidth="1" />
        <line x1="16" y1="20" x2="16" y2="24" stroke="#ef4444" strokeWidth="1" />
        <rect x="26" y="11" width="9" height="12" fill="#10b981" rx="1" />
        <line x1="30" y1="9" x2="30" y2="11" stroke="#10b981" strokeWidth="1" />
        <line x1="30" y1="23" x2="30" y2="26" stroke="#10b981" strokeWidth="1" />
      </g>
    ),
    barIndices: [36],
  },
  {
    id: "dragonfly-doji",
    name: "Dragonfly Doji",
    sentiment: "bullish",
    reliability: 60,
    timeframe: "Daily / 4H",
    entry: "Break above doji high",
    stop: "Below doji low",
    svgPath: (
      <g>
        <line x1="25" y1="8" x2="25" y2="10" stroke="#10b981" strokeWidth="1" />
        <rect x="21" y="10" width="8" height="2" fill="#10b981" rx="1" />
        <line x1="25" y1="12" x2="25" y2="26" stroke="#10b981" strokeWidth="2" />
      </g>
    ),
    barIndices: [10, 44],
  },
  {
    id: "bullish-harami",
    name: "Bullish Harami",
    sentiment: "bullish",
    reliability: 56,
    timeframe: "Daily",
    entry: "Third bar confirmation",
    stop: "Below second candle low",
    svgPath: (
      <g>
        <rect x="14" y="6" width="10" height="16" fill="#ef4444" rx="1" />
        <line x1="19" y1="4" x2="19" y2="6" stroke="#ef4444" strokeWidth="1" />
        <line x1="19" y1="22" x2="19" y2="25" stroke="#ef4444" strokeWidth="1" />
        <rect x="26" y="11" width="8" height="8" fill="#10b981" rx="1" />
        <line x1="30" y1="9" x2="30" y2="11" stroke="#10b981" strokeWidth="1" />
        <line x1="30" y1="19" x2="30" y2="22" stroke="#10b981" strokeWidth="1" />
      </g>
    ),
    barIndices: [25],
  },
  {
    id: "shooting-star",
    name: "Shooting Star",
    sentiment: "bearish",
    reliability: 65,
    timeframe: "Daily / Weekly",
    entry: "Break below candle low",
    stop: "Above candle high",
    svgPath: (
      <g>
        <line x1="25" y1="5" x2="25" y2="18" stroke="#ef4444" strokeWidth="2" />
        <rect x="20" y="18" width="10" height="5" fill="#ef4444" rx="1" />
        <line x1="25" y1="23" x2="25" y2="26" stroke="#6b7280" strokeWidth="1" />
      </g>
    ),
    barIndices: [7, 30, 55],
  },
  {
    id: "bearish-engulfing",
    name: "Bearish Engulfing",
    sentiment: "bearish",
    reliability: 72,
    timeframe: "Daily / 4H",
    entry: "Next bar open",
    stop: "Above engulfing candle high",
    svgPath: (
      <g>
        <rect x="18" y="10" width="8" height="10" fill="#10b981" rx="1" />
        <line x1="22" y1="8" x2="22" y2="10" stroke="#10b981" strokeWidth="1" />
        <line x1="22" y1="20" x2="22" y2="23" stroke="#10b981" strokeWidth="1" />
        <rect x="26" y="7" width="10" height="15" fill="#ef4444" rx="1" />
        <line x1="31" y1="4" x2="31" y2="7" stroke="#ef4444" strokeWidth="1" />
        <line x1="31" y1="22" x2="31" y2="26" stroke="#ef4444" strokeWidth="1" />
      </g>
    ),
    barIndices: [12, 38, 57],
  },
  {
    id: "evening-star",
    name: "Evening Star",
    sentiment: "bearish",
    reliability: 78,
    timeframe: "Daily / Weekly",
    entry: "Third candle close",
    stop: "Above middle candle high",
    svgPath: (
      <g>
        <rect x="8" y="12" width="8" height="12" fill="#10b981" rx="1" />
        <line x1="12" y1="9" x2="12" y2="12" stroke="#10b981" strokeWidth="1" />
        <line x1="12" y1="24" x2="12" y2="27" stroke="#10b981" strokeWidth="1" />
        <rect x="21" y="7" width="6" height="4" fill="#6b7280" rx="1" />
        <line x1="24" y1="4" x2="24" y2="7" stroke="#6b7280" strokeWidth="1" />
        <line x1="24" y1="11" x2="24" y2="15" stroke="#6b7280" strokeWidth="1" />
        <rect x="32" y="14" width="8" height="12" fill="#ef4444" rx="1" />
        <line x1="36" y1="11" x2="36" y2="14" stroke="#ef4444" strokeWidth="1" />
        <line x1="36" y1="26" x2="36" y2="29" stroke="#ef4444" strokeWidth="1" />
      </g>
    ),
    barIndices: [20, 49],
  },
  {
    id: "three-black-crows",
    name: "Three Black Crows",
    sentiment: "bearish",
    reliability: 80,
    timeframe: "Daily",
    entry: "Third candle close",
    stop: "Above first candle high",
    svgPath: (
      <g>
        <rect x="5" y="6" width="8" height="10" fill="#ef4444" rx="1" />
        <rect x="17" y="11" width="8" height="12" fill="#ef4444" rx="1" />
        <rect x="29" y="17" width="8" height="12" fill="#ef4444" rx="1" />
        <line x1="9" y1="16" x2="9" y2="18" stroke="#ef4444" strokeWidth="1" />
        <line x1="21" y1="23" x2="21" y2="25" stroke="#ef4444" strokeWidth="1" />
        <line x1="33" y1="29" x2="33" y2="31" stroke="#ef4444" strokeWidth="1" />
      </g>
    ),
    barIndices: [40, 58],
  },
  {
    id: "dark-cloud-cover",
    name: "Dark Cloud Cover",
    sentiment: "bearish",
    reliability: 64,
    timeframe: "Daily",
    entry: "Next bar open",
    stop: "Above second candle high",
    svgPath: (
      <g>
        <rect x="12" y="12" width="9" height="12" fill="#10b981" rx="1" />
        <line x1="16" y1="9" x2="16" y2="12" stroke="#10b981" strokeWidth="1" />
        <line x1="16" y1="24" x2="16" y2="27" stroke="#10b981" strokeWidth="1" />
        <rect x="26" y="8" width="9" height="12" fill="#ef4444" rx="1" />
        <line x1="30" y1="5" x2="30" y2="8" stroke="#ef4444" strokeWidth="1" />
        <line x1="30" y1="20" x2="30" y2="24" stroke="#ef4444" strokeWidth="1" />
      </g>
    ),
    barIndices: [34],
  },
  {
    id: "gravestone-doji",
    name: "Gravestone Doji",
    sentiment: "bearish",
    reliability: 60,
    timeframe: "Daily / 4H",
    entry: "Break below doji low",
    stop: "Above doji high",
    svgPath: (
      <g>
        <line x1="25" y1="6" x2="25" y2="18" stroke="#ef4444" strokeWidth="2" />
        <rect x="21" y="18" width="8" height="2" fill="#ef4444" rx="1" />
        <line x1="25" y1="20" x2="25" y2="22" stroke="#ef4444" strokeWidth="1" />
      </g>
    ),
    barIndices: [16, 43],
  },
  {
    id: "bearish-harami",
    name: "Bearish Harami",
    sentiment: "bearish",
    reliability: 56,
    timeframe: "Daily",
    entry: "Third bar confirmation",
    stop: "Above second candle high",
    svgPath: (
      <g>
        <rect x="14" y="6" width="10" height="16" fill="#10b981" rx="1" />
        <line x1="19" y1="4" x2="19" y2="6" stroke="#10b981" strokeWidth="1" />
        <line x1="19" y1="22" x2="19" y2="25" stroke="#10b981" strokeWidth="1" />
        <rect x="26" y="11" width="8" height="8" fill="#ef4444" rx="1" />
        <line x1="30" y1="9" x2="30" y2="11" stroke="#ef4444" strokeWidth="1" />
        <line x1="30" y1="19" x2="30" y2="22" stroke="#ef4444" strokeWidth="1" />
      </g>
    ),
    barIndices: [27],
  },
  {
    id: "spinning-top",
    name: "Spinning Top",
    sentiment: "neutral",
    reliability: 45,
    timeframe: "All timeframes",
    entry: "Wait for directional confirmation",
    stop: "Beyond candle extremes",
    svgPath: (
      <g>
        <line x1="25" y1="5" x2="25" y2="11" stroke="#6b7280" strokeWidth="1" />
        <rect x="21" y="11" width="8" height="8" fill="#6b7280" rx="1" />
        <line x1="25" y1="19" x2="25" y2="26" stroke="#6b7280" strokeWidth="1" />
      </g>
    ),
    barIndices: [5, 18, 31, 50],
  },
];

// ── Candlestick chart SVG ─────────────────────────────────────────────────────

function CandleChart({
  bars,
  width = 700,
  height = 260,
  highlightIndices,
}: {
  bars: Bar[];
  width?: number;
  height?: number;
  highlightIndices?: number[];
}) {
  const padL = 40, padR = 10, padT = 10, padB = 30;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const n = bars.length;
  const allPrices = bars.flatMap((b) => [b.high, b.low]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const priceRange = maxP - minP || 1;
  const barW = Math.max(2, (chartW / n) * 0.6);
  const barSpacing = chartW / n;

  const maxVol = Math.max(...bars.map((b) => b.volume));

  function px(i: number) { return padL + i * barSpacing + barSpacing / 2; }
  function py(p: number) { return padT + ((maxP - p) / priceRange) * chartH; }

  // Y-axis labels
  const yLabels: number[] = [];
  const step = priceRange / 4;
  for (let i = 0; i <= 4; i++) yLabels.push(minP + i * step);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Grid lines */}
      {yLabels.map((p, i) => (
        <g key={i}>
          <line
            x1={padL} y1={py(p)} x2={width - padR} y2={py(p)}
            stroke="#374151" strokeWidth="0.5" strokeDasharray="3,3"
          />
          <text x={padL - 4} y={py(p) + 4} textAnchor="end" fontSize="8" fill="#6b7280">
            {p.toFixed(0)}
          </text>
        </g>
      ))}

      {/* Volume bars (bottom 20%) */}
      {bars.map((b, i) => {
        const volH = (b.volume / maxVol) * chartH * 0.18;
        return (
          <rect
            key={`vol-${i}`}
            x={px(i) - barW / 2}
            y={height - padB - volH}
            width={barW}
            height={volH}
            fill={b.close >= b.open ? "#10b98120" : "#ef444420"}
          />
        );
      })}

      {/* Candles */}
      {bars.map((b, i) => {
        const isHighlight = highlightIndices?.includes(i);
        const bullish = b.close >= b.open;
        const color = bullish ? "#10b981" : "#ef4444";
        const hlColor = isHighlight ? "#fbbf24" : color;
        const x = px(i);
        return (
          <g key={`candle-${i}`}>
            {isHighlight && (
              <circle cx={x} cy={py(b.high) - 6} r={3} fill="#fbbf24" opacity={0.8} />
            )}
            <line x1={x} y1={py(b.high)} x2={x} y2={py(b.low)} stroke={hlColor} strokeWidth={isHighlight ? 1.5 : 0.8} />
            <rect
              x={x - barW / 2}
              y={py(Math.max(b.open, b.close))}
              width={barW}
              height={Math.max(1, Math.abs(py(b.open) - py(b.close)))}
              fill={hlColor}
              opacity={isHighlight ? 1 : 0.85}
            />
          </g>
        );
      })}

      {/* X axis labels */}
      {[0, 10, 20, 30, 40, 50, 59].map((i) => (
        <text key={`xl-${i}`} x={px(i)} y={height - 4} textAnchor="middle" fontSize="8" fill="#6b7280">
          {i + 1}
        </text>
      ))}
    </svg>
  );
}

// ── Tab 1: Candlestick Mastery ────────────────────────────────────────────────

function CandlestickMasteryTab() {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [filter, setFilter] = useState<"all" | "bullish" | "bearish" | "neutral">("all");

  const activePattern = CANDLE_PATTERNS.find((p) => p.id === selectedPattern);
  const highlightIndices = showOverlay && activePattern ? activePattern.barIndices : undefined;

  const filtered = CANDLE_PATTERNS.filter(
    (p) => filter === "all" || p.sentiment === filter
  );

  return (
    <div className="space-y-4">
      {/* Chart */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">60-Bar Price Chart</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOverlay(!showOverlay)}
              className={cn(
                "h-7 text-xs border-gray-700",
                showOverlay ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" : "text-gray-400"
              )}
            >
              {showOverlay ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              {showOverlay ? "Overlay On" : "Overlay Off"}
            </Button>
          </div>
        </div>
        <CandleChart bars={BARS_60} highlightIndices={highlightIndices} />
        {activePattern && showOverlay && (
          <p className="text-xs text-yellow-400 mt-2 text-center">
            Highlighted bars: potential {activePattern.name} occurrences
          </p>
        )}
      </Card>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "bullish", "bearish", "neutral"] as const).map((f) => (
          <Button
            key={f}
            variant="outline"
            size="sm"
            onClick={() => setFilter(f)}
            className={cn(
              "h-7 text-xs border-gray-700 capitalize",
              filter === f
                ? f === "bullish" ? "bg-green-500/20 border-green-500 text-green-400"
                  : f === "bearish" ? "bg-red-500/20 border-red-500 text-red-400"
                  : f === "neutral" ? "bg-gray-500/20 border-gray-500 text-gray-300"
                  : "bg-primary/20 border-primary text-primary"
                : "text-gray-400"
            )}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Pattern grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((pattern) => (
          <motion.div
            key={pattern.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <Card
              className={cn(
                "p-3 cursor-pointer border transition-all bg-gray-900",
                selectedPattern === pattern.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-800 hover:border-gray-600"
              )}
              onClick={() => setSelectedPattern(selectedPattern === pattern.id ? null : pattern.id)}
            >
              <div className="flex items-center gap-3 mb-2">
                <svg viewBox="0 0 50 30" className="w-[50px] h-[30px] flex-shrink-0 bg-gray-950 rounded border border-gray-800">
                  {pattern.svgPath}
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-white truncate">{pattern.name}</span>
                    <Badge
                      className={cn(
                        "text-xs h-4 px-1",
                        pattern.sentiment === "bullish" ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : pattern.sentiment === "bearish" ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      )}
                    >
                      {pattern.sentiment}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">Reliability:</span>
                    <div className="flex-1 h-1 bg-gray-800 rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          pattern.reliability >= 75 ? "bg-green-500" : pattern.reliability >= 60 ? "bg-yellow-500" : "bg-orange-500"
                        )}
                        style={{ width: `${pattern.reliability}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-300">{pattern.reliability}%</span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {selectedPattern === pattern.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 border-t border-gray-800 space-y-1.5 mt-1">
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-xs h-4 border-gray-700 text-gray-400">
                          {pattern.timeframe}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400"><span className="text-primary font-medium">Entry:</span> {pattern.entry}</p>
                      <p className="text-xs text-gray-400"><span className="text-red-400 font-medium">Stop:</span> {pattern.stop}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs border-gray-700 text-yellow-400 hover:bg-yellow-500/10 w-full mt-1"
                        onClick={(e) => { e.stopPropagation(); setShowOverlay(true); }}
                      >
                        <Eye className="h-2.5 w-2.5 mr-1" /> Find in chart
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── EMA + Donchian chart ──────────────────────────────────────────────────────

function TrendChartSVG({ bars }: { bars: Bar[] }) {
  const closes = bars.map((b) => b.close);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const ema200 = calcEMA(closes, 200);

  const donchianPeriod = 20;
  const dcHigh: number[] = [];
  const dcLow: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (i < donchianPeriod - 1) { dcHigh.push(NaN); dcLow.push(NaN); continue; }
    const slice = bars.slice(i - donchianPeriod + 1, i + 1);
    dcHigh.push(Math.max(...slice.map((b) => b.high)));
    dcLow.push(Math.min(...slice.map((b) => b.low)));
  }

  const W = 700, H = 200;
  const padL = 40, padR = 10, padT = 10, padB = 30, volH = 35;
  const chartH = H - padT - padB - volH;
  const n = bars.length;

  const allPrices = [
    ...bars.flatMap((b) => [b.high, b.low]),
    ...ema20.filter((v) => !isNaN(v)),
    ...ema50.filter((v) => !isNaN(v)),
  ];
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const priceRange = maxP - minP || 1;
  const barSpacing = (W - padL - padR) / n;
  const barW = Math.max(2, barSpacing * 0.6);
  const maxVol = Math.max(...bars.map((b) => b.volume));

  function px(i: number) { return padL + i * barSpacing + barSpacing / 2; }
  function py(p: number) { return padT + ((maxP - p) / priceRange) * chartH; }
  function pLine(vals: number[], color: string, dash?: string, sw = 1.2) {
    const pts: string[] = [];
    vals.forEach((v, i) => {
      if (!isNaN(v)) pts.push(`${px(i).toFixed(1)},${py(v).toFixed(1)}`);
    });
    return pts.length ? (
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={dash} />
    ) : null;
  }

  // Golden / death cross detection
  const crosses: { i: number; type: "golden" | "death" }[] = [];
  for (let i = 1; i < n; i++) {
    if (!isNaN(ema20[i]) && !isNaN(ema50[i]) && !isNaN(ema20[i - 1]) && !isNaN(ema50[i - 1])) {
      const prevDiff = ema20[i - 1] - ema50[i - 1];
      const currDiff = ema20[i] - ema50[i];
      if (prevDiff < 0 && currDiff >= 0) crosses.push({ i, type: "golden" });
      else if (prevDiff > 0 && currDiff <= 0) crosses.push({ i, type: "death" });
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Donchian channel fill */}
      {(() => {
        const pts: string[] = [];
        for (let i = 0; i < n; i++) if (!isNaN(dcHigh[i])) pts.push(`${px(i).toFixed(1)},${py(dcHigh[i]).toFixed(1)}`);
        for (let i = n - 1; i >= 0; i--) if (!isNaN(dcLow[i])) pts.push(`${px(i).toFixed(1)},${py(dcLow[i]).toFixed(1)}`);
        return pts.length > 2 ? <polygon points={pts.join(" ")} fill="#3b82f610" /> : null;
      })()}
      {pLine(dcHigh, "#3b82f6", "4,3", 0.8)}
      {pLine(dcLow, "#3b82f6", "4,3", 0.8)}

      {/* Candle wicks and bodies */}
      {bars.map((b, i) => {
        const bullish = b.close >= b.open;
        const color = bullish ? "#10b981" : "#ef4444";
        return (
          <g key={i}>
            <line x1={px(i)} y1={py(b.high)} x2={px(i)} y2={py(b.low)} stroke={color} strokeWidth={0.7} />
            <rect x={px(i) - barW / 2} y={py(Math.max(b.open, b.close))} width={barW} height={Math.max(1, Math.abs(py(b.open) - py(b.close)))} fill={color} opacity={0.8} />
          </g>
        );
      })}

      {/* EMAs */}
      {pLine(ema20, "#eab308", undefined, 1.3)}
      {pLine(ema50, "#f97316", undefined, 1.3)}
      {pLine(ema200, "#ef4444", "5,3", 1.3)}

      {/* Cross annotations */}
      {crosses.map((c, idx) => (
        <g key={idx}>
          <line x1={px(c.i)} y1={padT} x2={px(c.i)} y2={H - padB - volH} stroke={c.type === "golden" ? "#fbbf24" : "#818cf8"} strokeWidth={0.8} strokeDasharray="2,2" />
          <text x={px(c.i)} y={padT + 10} textAnchor="middle" fontSize="7" fill={c.type === "golden" ? "#fbbf24" : "#818cf8"}>
            {c.type === "golden" ? "GC" : "DC"}
          </text>
        </g>
      ))}

      {/* Volume bars */}
      {bars.map((b, i) => {
        const volBarH = (b.volume / maxVol) * (volH - 4);
        return (
          <rect key={`v${i}`} x={px(i) - barW / 2} y={H - padB - volBarH} width={barW} height={volBarH}
            fill={b.close >= b.open ? "#10b98130" : "#ef444430"} />
        );
      })}

      {/* Legend */}
      <g>
        {[
          { color: "#eab308", label: "EMA20" },
          { color: "#f97316", label: "EMA50" },
          { color: "#ef4444", label: "EMA200", dash: true },
          { color: "#3b82f6", label: "Donchian", dash: true },
        ].map((item, i) => (
          <g key={i} transform={`translate(${padL + i * 70},${H - 6})`}>
            <line x1={0} y1={0} x2={18} y2={0} stroke={item.color} strokeWidth={1.5} strokeDasharray={item.dash ? "3,2" : undefined} />
            <text x={21} y={3} fontSize="7" fill="#9ca3af">{item.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── ADX Gauge ────────────────────────────────────────────────────────────────

function ADXGauge({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  const pct = clamped / 100;
  const angle = -135 + pct * 270;
  const cx = 60, cy = 65, r = 48;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  function arcPoint(deg: number) {
    return {
      x: cx + r * Math.cos(toRad(deg - 90)),
      y: cy + r * Math.sin(toRad(deg - 90)),
    };
  }
  const start = arcPoint(-135);
  const end = arcPoint(135);
  const current = arcPoint(angle);

  const zones = [
    { start: -135, end: -45, color: "#374151", label: "Weak" },
    { start: -45, end: 45, color: "#f59e0b", label: "Moderate" },
    { start: 45, end: 135, color: "#10b981", label: "Strong" },
  ];

  function arcPath(startDeg: number, endDeg: number) {
    const s = arcPoint(startDeg);
    const e = arcPoint(endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x.toFixed(1)} ${s.y.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(1)} ${e.y.toFixed(1)}`;
  }

  const label = value < 25 ? "Weak / No Trend" : value < 50 ? "Moderate Trend" : value < 75 ? "Strong Trend" : "Very Strong Trend";
  const labelColor = value < 25 ? "#6b7280" : value < 50 ? "#f59e0b" : "#10b981";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 90" className="w-32 h-auto">
        {zones.map((z, i) => (
          <path key={i} d={arcPath(z.start, z.end)} fill="none" stroke={z.color} strokeWidth={8} strokeLinecap="round" />
        ))}
        <path d={arcPath(-135, angle)} fill="none" stroke="#6366f1" strokeWidth={8} strokeLinecap="round" />
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={(cx + (r - 12) * Math.cos(toRad(angle - 90))).toFixed(1)}
          y2={(cy + (r - 12) * Math.sin(toRad(angle - 90))).toFixed(1)}
          stroke="white" strokeWidth={2} strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={3} fill="#6366f1" />
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">{value}</text>
        <text x={cx} y={cy + 25} textAnchor="middle" fontSize="6" fill="#9ca3af">ADX</text>
      </svg>
      <span className="text-xs font-medium mt-1" style={{ color: labelColor }}>{label}</span>
    </div>
  );
}

// ── Tab 2: Trend Analysis ─────────────────────────────────────────────────────

function TrendAnalysisTab() {
  const bars = BARS_60;
  const closes = bars.map((b) => b.close);
  const adx = useMemo(() => calcADX(bars, 14), []);
  const ema20 = useMemo(() => calcEMA(closes, 20), []);
  const ema50 = useMemo(() => calcEMA(closes, 50), []);

  // Golden/death cross detection
  const lastCross = useMemo(() => {
    for (let i = closes.length - 1; i > 0; i--) {
      if (!isNaN(ema20[i]) && !isNaN(ema50[i]) && !isNaN(ema20[i - 1]) && !isNaN(ema50[i - 1])) {
        const prevDiff = ema20[i - 1] - ema50[i - 1];
        const currDiff = ema20[i] - ema50[i];
        if (prevDiff < 0 && currDiff >= 0) return "golden";
        if (prevDiff > 0 && currDiff <= 0) return "death";
      }
    }
    return null;
  }, []);

  const ema20Last = ema20.findLast((v) => !isNaN(v)) ?? 0;
  const ema50Last = ema50.findLast((v) => !isNaN(v)) ?? 0;
  const trend = ema20Last > ema50Last ? "Bullish" : "Bearish";

  const channelTypes = [
    { name: "Ascending Channel", desc: "Higher highs + higher lows; bullish trend", signal: "Buy pullbacks to lower trendline", color: "#10b981" },
    { name: "Descending Channel", desc: "Lower highs + lower lows; bearish trend", signal: "Sell rallies to upper trendline", color: "#ef4444" },
    { name: "Parallel Channel", desc: "Price oscillates between two parallel lines", signal: "Buy support, sell resistance within channel", color: "#6366f1" },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gray-900 border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Multi-EMA + Donchian Channel</h3>
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", trend === "Bullish" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30")}>
              {trend === "Bullish" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {trend}
            </Badge>
            {lastCross && (
              <Badge className={cn("text-xs", lastCross === "golden" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-primary/20 text-primary border-border")}>
                {lastCross === "golden" ? "Golden Cross" : "Death Cross"} detected
              </Badge>
            )}
          </div>
        </div>
        <TrendChartSVG bars={bars} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ADX Gauge */}
        <Card className="p-4 bg-gray-900 border-gray-800">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            ADX Trend Strength
          </h3>
          <ADXGauge value={adx} />
          <div className="mt-3 space-y-1.5">
            {[
              { range: "0–25", label: "No Trend / Weak", color: "#6b7280" },
              { range: "25–50", label: "Moderate Trend", color: "#f59e0b" },
              { range: "50–75", label: "Strong Trend", color: "#10b981" },
              { range: "75–100", label: "Extreme Trend", color: "#6366f1" },
            ].map((row) => (
              <div key={row.range} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
                <span className="text-xs text-gray-400 w-10">{row.range}</span>
                <span className="text-xs text-gray-300">{row.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* EMA Levels */}
        <Card className="p-4 bg-gray-900 border-gray-800">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-orange-400" />
            Moving Average Levels
          </h3>
          <div className="space-y-2">
            {[
              { label: "EMA 20 (Fast)", value: ema20.findLast((v) => !isNaN(v)), color: "#eab308" },
              { label: "EMA 50 (Medium)", value: ema50.findLast((v) => !isNaN(v)), color: "#f97316" },
              { label: "Current Price", value: closes[closes.length - 1], color: "#f3f4f6" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-gray-400">{item.label}</span>
                </div>
                <span className="text-xs font-mono font-medium" style={{ color: item.color }}>
                  ${item.value?.toFixed(2) ?? "—"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 rounded bg-gray-800/50">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-yellow-400 font-medium">Golden Cross:</span> EMA20 crosses above EMA50 — bullish signal.{" "}
              <span className="text-primary font-medium">Death Cross:</span> EMA20 crosses below EMA50 — bearish signal.
            </p>
          </div>
        </Card>
      </div>

      {/* Channel patterns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {channelTypes.map((ch) => (
          <Card key={ch.name} className="p-3 bg-gray-900 border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: ch.color }} />
              <h4 className="text-xs font-semibold text-white">{ch.name}</h4>
            </div>
            <p className="text-xs text-gray-400 mb-1">{ch.desc}</p>
            <p className="text-xs" style={{ color: ch.color }}>
              <ArrowRight className="h-2.5 w-2.5 inline mr-0.5" />{ch.signal}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 3: Momentum & Oscillators ─────────────────────────────────────────────

function LineChartPanel({
  values,
  refLines,
  color,
  W = 700,
  H = 80,
  fillArea,
  histMode,
}: {
  values: number[];
  refLines?: { y: number; color: string; label?: string }[];
  color: string;
  W?: number;
  H?: number;
  fillArea?: boolean;
  histMode?: boolean;
}) {
  const padL = 38, padR = 8, padT = 6, padB = 6;
  const valid = values.filter((v) => !isNaN(v));
  if (!valid.length) return null;
  const minV = Math.min(...valid, ...(refLines?.map((r) => r.y) ?? []));
  const maxV = Math.max(...valid, ...(refLines?.map((r) => r.y) ?? []));
  const n = valid.length;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  function px(i: number) { return padL + (i / (n - 1)) * chartW; }
  function py(v: number) { return padT + ((maxV - v) / (maxV - minV || 1)) * chartH; }

  const pts = valid.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const zeroY = py(0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {refLines?.map((rl, idx) => {
        const ry = py(rl.y);
        return (
          <g key={idx}>
            <line x1={padL} y1={ry} x2={W - padR} y2={ry} stroke={rl.color} strokeWidth={0.7} strokeDasharray="3,3" />
            {rl.label && <text x={padL - 4} y={ry + 3} textAnchor="end" fontSize="7" fill={rl.color}>{rl.label}</text>}
          </g>
        );
      })}

      {histMode ? (
        valid.map((v, i) => {
          const barW = (chartW / n) * 0.7;
          const y = py(Math.max(v, 0));
          const barH = Math.abs(py(0) - py(v));
          return (
            <rect key={i} x={px(i) - barW / 2} y={y} width={barW} height={Math.max(1, barH)}
              fill={v >= 0 ? "#10b98180" : "#ef444480"} />
          );
        })
      ) : (
        <>
          {fillArea && (
            <polygon
              points={`${padL},${py(minV)} ${pts} ${px(n - 1)},${py(minV)}`}
              fill={color} opacity={0.08}
            />
          )}
          <polyline points={pts} fill="none" stroke={color} strokeWidth={1.3} />
        </>
      )}

      <text x={padL - 4} y={padT + 8} textAnchor="end" fontSize="7" fill="#6b7280">{maxV.toFixed(0)}</text>
      <text x={padL - 4} y={H - padB} textAnchor="end" fontSize="7" fill="#6b7280">{minV.toFixed(0)}</text>
    </svg>
  );
}

function OscillatorTab() {
  const bars = BARS_60;
  const closes = bars.map((b) => b.close);

  const bb = useMemo(() => calcBollinger(closes, 20, 2), []);
  const rsi = useMemo(() => calcRSI(closes, 14), []);
  const { macdLine, signalLine, histogram } = useMemo(() => calcMACD(closes), []);
  const { kLine, dLine } = useMemo(() => calcStochastic(bars, 14, 3), []);

  const lastRSI = rsi.findLast((v) => !isNaN(v)) ?? 50;
  const lastMACD = macdLine.findLast((v) => !isNaN(v)) ?? 0;
  const lastSignal = signalLine.findLast((v) => !isNaN(v)) ?? 0;
  const lastK = kLine.findLast((v) => !isNaN(v)) ?? 50;
  const lastD = dLine.findLast((v) => !isNaN(v)) ?? 50;

  const rsiSignal = lastRSI >= 70 ? "Overbought" : lastRSI <= 30 ? "Oversold" : lastRSI > 50 ? "Bullish" : "Bearish";
  const macdSignal = lastMACD > lastSignal ? "Bullish" : "Bearish";
  const stochSignal = lastK >= 80 ? "Overbought" : lastK <= 20 ? "Oversold" : lastK > 50 ? "Bullish" : "Bearish";

  const signalColor = (s: string) =>
    s === "Overbought" ? "#f59e0b" : s === "Oversold" ? "#6366f1" : s === "Bullish" ? "#10b981" : "#ef4444";

  // Bollinger chart
  const W = 700, H = 100;
  const padL = 38, padR = 8, padT = 6, padB = 6;
  const validCloses = closes.filter((_, i) => !isNaN(bb.upper[i]));
  const allBBPrices = [
    ...bb.upper.filter((v) => !isNaN(v)),
    ...bb.lower.filter((v) => !isNaN(v)),
    ...closes,
  ];
  const minBB = Math.min(...allBBPrices);
  const maxBB = Math.max(...allBBPrices);
  const n = closes.length;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  function pxBB(i: number) { return padL + (i / (n - 1)) * chartW; }
  function pyBB(v: number) { return padT + ((maxBB - v) / (maxBB - minBB || 1)) * chartH; }

  const upperPts = bb.upper.map((v, i) => isNaN(v) ? null : `${pxBB(i).toFixed(1)},${pyBB(v).toFixed(1)}`).filter(Boolean).join(" ");
  const midPts = bb.middle.map((v, i) => isNaN(v) ? null : `${pxBB(i).toFixed(1)},${pyBB(v).toFixed(1)}`).filter(Boolean).join(" ");
  const lowerPts = bb.lower.map((v, i) => isNaN(v) ? null : `${pxBB(i).toFixed(1)},${pyBB(v).toFixed(1)}`).filter(Boolean).join(" ");
  const closePts = closes.map((v, i) => `${pxBB(i).toFixed(1)},${pyBB(v).toFixed(1)}`).join(" ");

  // Divergence detection (simple: RSI makes higher low while price makes lower low)
  const rsiValid = rsi.map((v, i) => ({ v, i })).filter((x) => !isNaN(x.v));
  const hasDivergence = rsiValid.length >= 10;
  const last5Rsi = rsiValid.slice(-5).map((x) => x.v);
  const rsiTrend = last5Rsi[last5Rsi.length - 1] > last5Rsi[0] ? "rising" : "falling";
  const priceTrend = closes.slice(-5)[4] > closes.slice(-5)[0] ? "rising" : "falling";
  const divergenceType = rsiTrend !== priceTrend
    ? rsiTrend === "rising" ? "Bullish Divergence" : "Bearish Divergence"
    : null;

  const agreeing = [
    rsiSignal === "Bullish" || rsiSignal === "Oversold",
    macdSignal === "Bullish",
    stochSignal === "Bullish" || stochSignal === "Oversold",
  ].filter(Boolean).length;
  const confluence = agreeing >= 3 ? "High Conviction Bullish" : agreeing === 0 ? "High Conviction Bearish" : "Mixed";

  return (
    <div className="space-y-4">
      {/* Panel 1: Price + BB */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">Price + Bollinger Bands (20, 2σ)</h3>
          <div className="flex gap-2">
            {[{ color: "#6366f1", label: "Upper" }, { color: "#9ca3af", label: "Mid" }, { color: "#6366f1", label: "Lower" }, { color: "#f3f4f6", label: "Price" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1">
                <div className="w-3 h-0.5" style={{ background: l.color }} />
                <span className="text-[11px] text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* BB fill */}
          {upperPts && lowerPts && (
            <polygon
              points={`${upperPts} ${lowerPts.split(" ").reverse().join(" ")}`}
              fill="#6366f110"
            />
          )}
          <polyline points={upperPts} fill="none" stroke="#6366f1" strokeWidth={0.9} strokeDasharray="3,2" />
          <polyline points={midPts} fill="none" stroke="#9ca3af" strokeWidth={0.8} strokeDasharray="2,2" />
          <polyline points={lowerPts} fill="none" stroke="#6366f1" strokeWidth={0.9} strokeDasharray="3,2" />
          <polyline points={closePts} fill="none" stroke="#f3f4f6" strokeWidth={1.3} />
          <text x={padL - 4} y={padT + 8} textAnchor="end" fontSize="7" fill="#6b7280">{maxBB.toFixed(0)}</text>
          <text x={padL - 4} y={H - padB} textAnchor="end" fontSize="7" fill="#6b7280">{minBB.toFixed(0)}</text>
        </svg>
      </Card>

      {/* Panel 2: RSI */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">RSI (14)</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Current: <span className="font-mono text-white">{lastRSI.toFixed(1)}</span></span>
            <Badge className="text-xs h-5 px-1.5" style={{ background: `${signalColor(rsiSignal)}20`, color: signalColor(rsiSignal), borderColor: `${signalColor(rsiSignal)}50` }}>
              {rsiSignal}
            </Badge>
          </div>
        </div>
        <LineChartPanel values={rsi} color="#a78bfa" refLines={[{ y: 70, color: "#ef4444", label: "70" }, { y: 30, color: "#10b981", label: "30" }, { y: 50, color: "#374151" }]} />
        {divergenceType && (
          <div className={cn("mt-2 flex items-center gap-2 text-xs px-2 py-1 rounded", divergenceType.includes("Bullish") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
            <Zap className="h-3 w-3" />
            {divergenceType} detected — price and RSI moving in opposite directions
          </div>
        )}
      </Card>

      {/* Panel 3: MACD */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">MACD (12, 26, 9)</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">MACD: <span className="font-mono text-white">{lastMACD.toFixed(3)}</span></span>
            <Badge className="text-xs h-5 px-1.5" style={{ background: `${signalColor(macdSignal)}20`, color: signalColor(macdSignal), borderColor: `${signalColor(macdSignal)}50` }}>
              {macdSignal}
            </Badge>
          </div>
        </div>
        <div className="relative">
          <LineChartPanel values={histogram} color="#10b981" histMode />
          <div className="absolute inset-0 pointer-events-none">
            <svg viewBox={`0 0 700 80`} className="w-full h-auto">
              {(() => {
                const vMACD = macdLine.filter((v) => !isNaN(v));
                const vSig = signalLine.filter((v) => !isNaN(v));
                const all = [...vMACD, ...vSig];
                const minV = Math.min(...all);
                const maxV = Math.max(...all);
                const n2 = vMACD.length;
                const padL2 = 38, padR2 = 8, padT2 = 6, padB2 = 6;
                const W2 = 700, H2 = 80;
                function px2(i: number) { return padL2 + (i / (n2 - 1)) * (W2 - padL2 - padR2); }
                function py2(v: number) { return padT2 + ((maxV - v) / (maxV - minV || 1)) * (H2 - padT2 - padB2); }
                const mPts = vMACD.map((v, i) => `${px2(i).toFixed(1)},${py2(v).toFixed(1)}`).join(" ");
                const sPts = vSig.map((v, i) => `${px2(i).toFixed(1)},${py2(v).toFixed(1)}`).join(" ");
                return <>
                  <polyline points={mPts} fill="none" stroke="#6366f1" strokeWidth={1.3} />
                  <polyline points={sPts} fill="none" stroke="#f97316" strokeWidth={1} strokeDasharray="3,2" />
                </>;
              })()}
            </svg>
          </div>
        </div>
      </Card>

      {/* Panel 4: Stochastic */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">Stochastic (14, 3)</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">%K: <span className="font-mono text-white">{lastK.toFixed(1)}</span> %D: <span className="font-mono text-white">{lastD.toFixed(1)}</span></span>
            <Badge className="text-xs h-5 px-1.5" style={{ background: `${signalColor(stochSignal)}20`, color: signalColor(stochSignal), borderColor: `${signalColor(stochSignal)}50` }}>
              {stochSignal}
            </Badge>
          </div>
        </div>
        <LineChartPanel values={kLine} color="#06b6d4" refLines={[{ y: 80, color: "#ef4444", label: "80" }, { y: 20, color: "#10b981", label: "20" }]} />
      </Card>

      {/* Confluence */}
      <Card className={cn(
        "p-3 border",
        confluence.includes("High Conviction") ? "bg-green-500/5 border-green-500/30" : "bg-gray-900 border-gray-800"
      )}>
        <div className="flex items-center gap-2">
          <Zap className={cn("h-4 w-4", confluence.includes("Bullish") ? "text-green-400" : confluence.includes("Bearish") ? "text-red-400" : "text-gray-400")} />
          <span className="text-sm font-semibold text-white">Indicator Confluence:</span>
          <span className="text-sm" style={{ color: confluence.includes("Bullish") ? "#10b981" : confluence.includes("Bearish") ? "#ef4444" : "#9ca3af" }}>
            {confluence}
          </span>
          <span className="text-xs text-gray-500 ml-auto">{agreeing}/3 bullish signals</span>
        </div>
      </Card>
    </div>
  );
}

// ── Tab 4: Volume Analysis ─────────────────────────────────────────────────────

function VolumeAnalysisTab() {
  const bars = BARS_60;
  const closes = bars.map((b) => b.close);
  const obv = useMemo(() => calcOBV(bars), []);

  // VWAP
  const vwap = useMemo(() => {
    let cumTPV = 0, cumVol = 0;
    return bars.map((b) => {
      const tp = (b.high + b.low + b.close) / 3;
      cumTPV += tp * b.volume;
      cumVol += b.volume;
      return cumTPV / cumVol;
    });
  }, []);

  // Volume profile (10 levels)
  const minP = Math.min(...bars.map((b) => b.low));
  const maxP = Math.max(...bars.map((b) => b.high));
  const levelSize = (maxP - minP) / 10;
  const profile = useMemo(() => {
    const levels = Array.from({ length: 10 }, (_, i) => ({
      price: minP + (i + 0.5) * levelSize,
      vol: 0,
    }));
    bars.forEach((b) => {
      const idx = Math.min(9, Math.floor(((b.close - minP) / (maxP - minP)) * 10));
      if (idx >= 0 && idx < 10) levels[idx].vol += b.volume;
    });
    return levels;
  }, []);
  const maxProfileVol = Math.max(...profile.map((l) => l.vol));

  // Avg volume
  const avgVol = bars.reduce((a, b) => a + b.volume, 0) / bars.length;
  const lastVol = bars[bars.length - 1].volume;
  const volThrust = lastVol > avgVol * 2;
  const lastClose = closes[closes.length - 1];
  const prevClose = closes[closes.length - 2];
  const isBreakout = Math.abs(lastClose - prevClose) > (maxP - minP) * 0.015;

  const vsaSignals = [
    {
      name: "Volume Thrust",
      desc: "Volume > 2× average confirms the move",
      active: volThrust,
      bullish: lastClose > prevClose,
    },
    {
      name: "No-Volume Breakout",
      desc: "Breakout on low volume — watch for false move",
      active: isBreakout && lastVol < avgVol,
      bullish: false,
    },
    {
      name: "Climactic Volume",
      desc: "Extreme volume spike at price extremes = potential reversal",
      active: lastVol > avgVol * 3,
      bullish: lastClose < (minP + (maxP - minP) * 0.4),
    },
  ];

  // OBV chart
  const W = 700, H = 90;
  const padL = 42, padR = 8, padT = 8, padB = 8;
  const obvMin = Math.min(...obv), obvMax = Math.max(...obv);
  const priceMin = Math.min(...closes), priceMax = Math.max(...closes);
  const n = obv.length;
  function pxOBV(i: number) { return padL + (i / (n - 1)) * (W - padL - padR); }
  function pyOBV(v: number) { return padT + ((obvMax - v) / (obvMax - obvMin || 1)) * (H - padT - padB); }
  function pyP(v: number) { return padT + ((priceMax - v) / (priceMax - priceMin || 1)) * (H - padT - padB); }
  const obvPts = obv.map((v, i) => `${pxOBV(i).toFixed(1)},${pyOBV(v).toFixed(1)}`).join(" ");
  const pricePts = closes.map((v, i) => `${pxOBV(i).toFixed(1)},${pyP(v).toFixed(1)}`).join(" ");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Volume Profile */}
        <Card className="p-4 bg-gray-900 border-gray-800 md:col-span-1">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" />
            Volume Profile
          </h3>
          <div className="space-y-1">
            {[...profile].reverse().map((lvl, i) => {
              const pct = (lvl.vol / maxProfileVol) * 100;
              const isValueArea = pct > 50;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500 w-12 text-right">{lvl.price.toFixed(1)}</span>
                  <div className="flex-1 h-4 bg-gray-800 rounded-sm overflow-hidden">
                    <div
                      className={cn("h-full transition-all", isValueArea ? "bg-primary" : "bg-primary/40")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {isValueArea && <Badge className="text-[11px] h-4 px-1 bg-primary/20 text-primary border-border">VAP</Badge>}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">VAP = Value Area Price (high activity)</p>
        </Card>

        {/* OBV + Price overlay */}
        <Card className="p-4 bg-gray-900 border-gray-800 md:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-400" />
            OBV vs Price
          </h3>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <polyline points={obvPts} fill="none" stroke="#10b981" strokeWidth={1.3} />
            <polyline points={pricePts} fill="none" stroke="#6366f1" strokeWidth={1} strokeDasharray="3,2" />
            <text x={padL - 4} y={padT + 8} textAnchor="end" fontSize="7" fill="#10b981">{(obvMax / 1e6).toFixed(1)}M</text>
            <text x={padL - 4} y={H - padB} textAnchor="end" fontSize="7" fill="#10b981">{(obvMin / 1e6).toFixed(1)}M</text>
            <text x={W - padR} y={padT + 8} textAnchor="end" fontSize="7" fill="#6366f1">{priceMax.toFixed(0)}</text>
          </svg>
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-green-500" /><span className="text-xs text-gray-400">OBV</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-indigo-400" style={{ borderTop: "1px dashed #6366f1" }} /><span className="text-xs text-gray-400">Price</span></div>
          </div>
        </Card>
      </div>

      {/* VWAP chart */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-yellow-400" />
          VWAP (Volume Weighted Average Price)
        </h3>
        <svg viewBox={`0 0 ${W} 90`} className="w-full h-auto">
          {(() => {
            const allV = [...closes, ...vwap];
            const minV = Math.min(...allV), maxV = Math.max(...allV);
            const n2 = closes.length;
            function px2(i: number) { return padL + (i / (n2 - 1)) * (W - padL - padR); }
            function py2(v: number) { return 8 + ((maxV - v) / (maxV - minV || 1)) * (90 - 16); }
            const closePts2 = closes.map((v, i) => `${px2(i).toFixed(1)},${py2(v).toFixed(1)}`).join(" ");
            const vwapPts2 = vwap.map((v, i) => `${px2(i).toFixed(1)},${py2(v).toFixed(1)}`).join(" ");
            return <>
              <polyline points={closePts2} fill="none" stroke="#f3f4f6" strokeWidth={1} />
              <polyline points={vwapPts2} fill="none" stroke="#fbbf24" strokeWidth={1.5} />
            </>;
          })()}
        </svg>
        <div className="flex gap-3 mt-2">
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-white" /><span className="text-xs text-gray-400">Price</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-yellow-400" /><span className="text-xs text-gray-400">VWAP</span></div>
          <span className="text-xs text-gray-500 ml-auto">Current VWAP: ${vwap[vwap.length - 1].toFixed(2)}</span>
        </div>
      </Card>

      {/* VSA Signals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {vsaSignals.map((sig) => (
          <Card
            key={sig.name}
            className={cn(
              "p-3 border transition-all",
              sig.active
                ? sig.bullish ? "bg-green-500/5 border-green-500/40" : "bg-red-500/5 border-red-500/40"
                : "bg-gray-900 border-gray-800"
            )}
          >
            <div className="flex items-start gap-2">
              {sig.active ? (
                <CheckCircle className={cn("h-4 w-4 mt-0.5 flex-shrink-0", sig.bullish ? "text-green-400" : "text-red-400")} />
              ) : (
                <div className="h-4 w-4 mt-0.5 flex-shrink-0 rounded-full border border-gray-700" />
              )}
              <div>
                <p className="text-xs font-semibold text-white">{sig.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sig.desc}</p>
                {sig.active && (
                  <Badge className="mt-1 text-[11px] h-4 px-1" style={{
                    background: sig.bullish ? "#10b98120" : "#ef444420",
                    color: sig.bullish ? "#10b981" : "#ef4444",
                    borderColor: sig.bullish ? "#10b98150" : "#ef444450",
                  }}>
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 5: Support & Resistance ───────────────────────────────────────────────

interface SRLevel {
  price: number;
  type: "support" | "resistance";
  strength: "strong" | "medium" | "weak";
  touches: number;
  source: string;
}

function SRTab() {
  const bars = BARS_100;
  const closes = bars.map((b) => b.close);
  const [fibLow, setFibLow] = useState(30);
  const [fibHigh, setFibHigh] = useState(85);
  const [showFib, setShowFib] = useState(true);
  const [showPivots, setShowPivots] = useState(true);
  const [showSR, setShowSR] = useState(true);

  const priceMin = Math.min(...bars.map((b) => b.low));
  const priceMax = Math.max(...bars.map((b) => b.high));

  // Detect S/R levels from swing highs/lows
  const srLevels: SRLevel[] = useMemo(() => {
    const swingHighs: number[] = [];
    const swingLows: number[] = [];
    for (let i = 2; i < bars.length - 2; i++) {
      const h = bars[i].high;
      const l = bars[i].low;
      if (h > bars[i-1].high && h > bars[i-2].high && h > bars[i+1].high && h > bars[i+2].high) swingHighs.push(h);
      if (l < bars[i-1].low && l < bars[i-2].low && l < bars[i+1].low && l < bars[i+2].low) swingLows.push(l);
    }
    // Round to 0.5 clusters
    const cluster = (vals: number[], type: "support" | "resistance"): SRLevel[] => {
      const rounded = vals.map((v) => Math.round(v * 2) / 2);
      const counts: Record<number, number> = {};
      rounded.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
      return Object.entries(counts).map(([p, t]) => ({
        price: +p,
        type,
        touches: t,
        strength: t >= 3 ? "strong" : t >= 2 ? "medium" : "weak",
        source: type === "resistance" ? "Swing High" : "Swing Low",
      }));
    };
    const levels = [
      ...cluster(swingHighs, "resistance"),
      ...cluster(swingLows, "support"),
    ];
    // Add psychological round numbers
    const roundNums = [145, 150, 155, 160, 165, 170].filter((r) => r > priceMin && r < priceMax);
    roundNums.forEach((r) => {
      const closeLevel = levels.find((l) => Math.abs(l.price - r) < 1);
      if (!closeLevel) {
        levels.push({ price: r, type: r > closes[closes.length - 1] ? "resistance" : "support", touches: 1, strength: "medium", source: "Round Number" });
      }
    });
    return levels.sort((a, b) => a.price - b.price);
  }, []);

  // Fib levels
  const fibLowPrice = bars[fibLow].low;
  const fibHighPrice = bars[fibHigh].high;
  const fibRange = fibHighPrice - fibLowPrice;
  const fibLevels = [
    { pct: 0.0, color: "#10b981", label: "0.0%" },
    { pct: 0.236, color: "#06b6d4", label: "23.6%" },
    { pct: 0.382, color: "#6366f1", label: "38.2%" },
    { pct: 0.5, color: "#f59e0b", label: "50.0%" },
    { pct: 0.618, color: "#ef4444", label: "61.8%" },
    { pct: 0.786, color: "#ec4899", label: "78.6%" },
    { pct: 1.0, color: "#8b5cf6", label: "100%" },
  ].map((f) => ({
    ...f,
    price: fibHighPrice - f.pct * fibRange,
  }));

  // Classic pivot points (using last bar)
  const lastBar = bars[bars.length - 1];
  const pivot = (lastBar.high + lastBar.low + lastBar.close) / 3;
  const pivotLevels = [
    { label: "R3", price: pivot + 2 * (lastBar.high - lastBar.low), color: "#ef4444" },
    { label: "R2", price: pivot + (lastBar.high - lastBar.low), color: "#f97316" },
    { label: "R1", price: 2 * pivot - lastBar.low, color: "#f59e0b" },
    { label: "PP", price: pivot, color: "#9ca3af" },
    { label: "S1", price: 2 * pivot - lastBar.high, color: "#06b6d4" },
    { label: "S2", price: pivot - (lastBar.high - lastBar.low), color: "#6366f1" },
    { label: "S3", price: pivot - 2 * (lastBar.high - lastBar.low), color: "#8b5cf6" },
  ];

  // Chart rendering
  const W = 700, H = 280;
  const padL = 42, padR = 80, padT = 10, padB = 20;
  const chartH = H - padT - padB;
  const chartW = W - padL - padR;
  const n = bars.length;

  const allPrices = [
    ...bars.flatMap((b) => [b.high, b.low]),
    ...(showFib ? fibLevels.map((f) => f.price) : []),
    ...(showPivots ? pivotLevels.map((p) => p.price) : []),
  ].filter(isFinite);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);

  const barSpacing = chartW / n;
  const barW = Math.max(1.5, barSpacing * 0.55);

  function px(i: number) { return padL + i * barSpacing + barSpacing / 2; }
  function py(p: number) { return padT + ((maxP - p) / (maxP - minP || 1)) * chartH; }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <div className="flex flex-wrap gap-3 items-center mb-4">
          {[
            { label: "S/R Levels", active: showSR, toggle: () => setShowSR(!showSR), color: "yellow" },
            { label: "Fibonacci", active: showFib, toggle: () => setShowFib(!showFib), color: "purple" },
            { label: "Pivot Points", active: showPivots, toggle: () => setShowPivots(!showPivots), color: "blue" },
          ].map((btn) => (
            <Button
              key={btn.label}
              variant="outline"
              size="sm"
              onClick={btn.toggle}
              className={cn(
                "h-7 text-xs border-gray-700 transition-colors",
                btn.active
                  ? btn.color === "yellow" ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                    : btn.color === "purple" ? "bg-primary/20 border-primary text-primary"
                    : "bg-primary/20 border-primary text-primary"
                  : "text-gray-400"
              )}
            >
              {btn.active ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              {btn.label}
            </Button>
          ))}
        </div>

        {/* Fib range sliders */}
        {showFib && (
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-800/50 rounded-lg">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Fib Swing Low (bar)</span>
                <span className="text-primary">{fibLow} — ${fibLowPrice.toFixed(2)}</span>
              </div>
              <Slider value={[fibLow]} onValueChange={([v]) => setFibLow(Math.min(v, fibHigh - 5))} min={0} max={90} step={1} className="h-1" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Fib Swing High (bar)</span>
                <span className="text-primary">{fibHigh} — ${fibHighPrice.toFixed(2)}</span>
              </div>
              <Slider value={[fibHigh]} onValueChange={([v]) => setFibHigh(Math.max(v, fibLow + 5))} min={10} max={99} step={1} className="h-1" />
            </div>
          </div>
        )}

        {/* Main chart */}
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* S/R horizontal lines */}
          {showSR && srLevels.slice(-8).map((lvl, i) => {
            const y = py(lvl.price);
            if (y < padT || y > H - padB) return null;
            return (
              <g key={`sr-${i}`}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={lvl.type === "resistance" ? "#ef4444" : "#10b981"}
                  strokeWidth={lvl.strength === "strong" ? 1.2 : 0.7} strokeDasharray={lvl.strength === "strong" ? undefined : "4,3"} opacity={0.6} />
              </g>
            );
          })}

          {/* Fib levels */}
          {showFib && fibLevels.map((f, i) => {
            const y = py(f.price);
            if (y < padT || y > H - padB) return null;
            return (
              <g key={`fib-${i}`}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={f.color} strokeWidth={0.8} strokeDasharray="5,3" opacity={0.7} />
                <text x={W - padR + 3} y={y + 3} fontSize="7" fill={f.color}>{f.label}</text>
                <text x={W - padR + 3} y={y + 11} fontSize="6" fill="#6b7280">{f.price.toFixed(1)}</text>
              </g>
            );
          })}

          {/* Pivot levels */}
          {showPivots && pivotLevels.map((pl, i) => {
            const y = py(pl.price);
            if (y < padT || y > H - padB) return null;
            return (
              <g key={`pv-${i}`}>
                <line x1={padL} y1={y} x2={padL + chartW * 0.3} y2={y} stroke={pl.color} strokeWidth={1} strokeDasharray="2,4" opacity={0.8} />
                <text x={padL + chartW * 0.3 + 3} y={y + 3} fontSize="7" fill={pl.color}>{pl.label}</text>
              </g>
            );
          })}

          {/* Candles */}
          {bars.map((b, i) => {
            const bullish = b.close >= b.open;
            const color = bullish ? "#10b981" : "#ef4444";
            return (
              <g key={`c-${i}`}>
                <line x1={px(i)} y1={py(b.high)} x2={px(i)} y2={py(b.low)} stroke={color} strokeWidth={0.6} />
                <rect x={px(i) - barW / 2} y={py(Math.max(b.open, b.close))} width={barW}
                  height={Math.max(1, Math.abs(py(b.open) - py(b.close)))} fill={color} opacity={0.85} />
              </g>
            );
          })}

          {/* Fib bar markers */}
          {showFib && (
            <>
              <line x1={px(fibLow)} y1={padT} x2={px(fibLow)} y2={H - padB} stroke="#8b5cf6" strokeWidth={0.8} strokeDasharray="2,2" opacity={0.5} />
              <line x1={px(fibHigh)} y1={padT} x2={px(fibHigh)} y2={H - padB} stroke="#8b5cf6" strokeWidth={0.8} strokeDasharray="2,2" opacity={0.5} />
              <text x={px(fibLow)} y={padT + 8} textAnchor="middle" fontSize="7" fill="#8b5cf6">Low</text>
              <text x={px(fibHigh)} y={padT + 8} textAnchor="middle" fontSize="7" fill="#8b5cf6">High</text>
            </>
          )}
        </svg>
      </Card>

      {/* S/R level table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-gray-900 border-gray-800">
          <h3 className="text-sm font-semibold text-white mb-3">Auto-Detected S/R Levels</h3>
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {srLevels.slice(-12).reverse().map((lvl, i) => (
              <div key={i} className="flex items-center gap-2 py-1 border-b border-gray-800/50">
                <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", lvl.type === "resistance" ? "bg-red-400" : "bg-green-400")} />
                <span className="text-xs font-mono text-gray-200 w-14">${lvl.price.toFixed(2)}</span>
                <span className={cn("text-xs capitalize", lvl.type === "resistance" ? "text-red-400" : "text-green-400")}>{lvl.type}</span>
                <span className="text-xs text-gray-500 flex-1">{lvl.source}</span>
                <Badge
                  className={cn(
                    "text-[11px] h-4 px-1",
                    lvl.strength === "strong" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    : lvl.strength === "medium" ? "bg-primary/20 text-primary border-border"
                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  )}
                >
                  {lvl.strength} ({lvl.touches})
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Pivot point table */}
        <Card className="p-4 bg-gray-900 border-gray-800">
          <h3 className="text-sm font-semibold text-white mb-3">Classic Pivot Points</h3>
          <div className="space-y-1.5">
            {pivotLevels.map((pl) => (
              <div key={pl.label} className="flex items-center gap-2 py-1 border-b border-gray-800/50">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: pl.color }} />
                <span className="text-xs font-semibold w-8" style={{ color: pl.color }}>{pl.label}</span>
                <span className="text-xs font-mono text-gray-200">${pl.price.toFixed(2)}</span>
                <span className="text-xs text-gray-500 ml-auto">
                  {pl.label === "PP" ? "Pivot" : pl.label.startsWith("R") ? "Resistance" : "Support"}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Based on previous session H/L/C</p>
        </Card>
      </div>

      {/* Fib explanation */}
      {showFib && (
        <Card className="p-4 bg-gray-900 border-gray-800">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Fibonacci Retracement Levels
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {fibLevels.map((f) => (
              <div key={f.label} className="p-2 rounded bg-gray-800/60 border border-gray-700/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: f.color }} />
                  <span className="text-xs font-semibold text-gray-200">{f.label}</span>
                </div>
                <span className="text-xs font-mono" style={{ color: f.color }}>${f.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 p-2 rounded bg-gray-800/40">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-yellow-400 font-medium">Key levels:</span> 38.2%, 50%, and 61.8% are the most watched retracement zones. Price often pauses or reverses at these levels. The 61.8% "golden ratio" is considered the strongest.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Page component ─────────────────────────────────────────────────────────────

const TAB_CONFIG = [
  { id: "candles", label: "Candlestick Mastery", icon: BarChart2 },
  { id: "trend", label: "Trend Analysis", icon: TrendingUp },
  { id: "momentum", label: "Momentum & Oscillators", icon: Activity },
  { id: "volume", label: "Volume Analysis", icon: Layers },
  { id: "sr", label: "Support & Resistance", icon: Target },
] as const;

export default function TechAnalysisPage() {
  const [activeTab, setActiveTab] = useState<string>("candles");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-border">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Technical Analysis Masterclass</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Interactive charts · Pattern recognition · Indicators · Volume & S/R analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-900 border border-gray-800 p-1 h-auto flex-wrap gap-1 mb-6">
            {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className={cn(
                  "text-xs h-8 px-3 data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400 flex items-center gap-1.5 transition-colors"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="candles" className="mt-0 data-[state=inactive]:hidden">
                <CandlestickMasteryTab />
              </TabsContent>

              <TabsContent value="trend" className="mt-0 data-[state=inactive]:hidden">
                <TrendAnalysisTab />
              </TabsContent>

              <TabsContent value="momentum" className="mt-0 data-[state=inactive]:hidden">
                <OscillatorTab />
              </TabsContent>

              <TabsContent value="volume" className="mt-0 data-[state=inactive]:hidden">
                <VolumeAnalysisTab />
              </TabsContent>

              <TabsContent value="sr" className="mt-0 data-[state=inactive]:hidden">
                <SRTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
