"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  DollarSign,
  BarChart2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Wallet,
  PieChart,
  GitMerge,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Seeded PRNG (spec-mandated) ────────────────────────────────────────────────
let s = 11;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed: number = 11) {
  s = seed;
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

interface Trade {
  price: number;
  size: number;
  side: "buy" | "sell";
  time: string;
}

interface CandleBar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CryptoInfo {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  sector: string;
}

interface DexPool {
  protocol: string;
  pair: string;
  tvl: number;
  apy: number;
  volumeTvlRatio: number;
}

interface Holding {
  token: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
}

// ── Static data generators ─────────────────────────────────────────────────────

const PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "AVAX/USDT"];

const BASE_PRICES: Record<string, number> = {
  "BTC/USDT": 67420,
  "ETH/USDT": 3540,
  "SOL/USDT": 172,
  "BNB/USDT": 598,
  "XRP/USDT": 0.598,
  "AVAX/USDT": 38.4,
};

const PERP_PAIRS = ["BTC/USDT", "ETH/USDT"];

function genOrderBook(midPrice: number, seed: number): { bids: OrderBookLevel[]; asks: OrderBookLevel[] } {
  resetSeed(seed);
  const tickSize = midPrice > 1000 ? 0.1 : midPrice > 10 ? 0.01 : 0.0001;
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];
  let bidTotal = 0;
  let askTotal = 0;
  for (let i = 0; i < 10; i++) {
    const bidPrice = +(midPrice - tickSize * (i + 1) * (1 + rand() * 0.5)).toFixed(midPrice < 1 ? 5 : 2);
    const bidSize = +(1 + rand() * 10).toFixed(4);
    bidTotal += bidSize;
    bids.push({ price: bidPrice, size: bidSize, total: +bidTotal.toFixed(4) });

    const askPrice = +(midPrice + tickSize * (i + 1) * (1 + rand() * 0.5)).toFixed(midPrice < 1 ? 5 : 2);
    const askSize = +(1 + rand() * 10).toFixed(4);
    askTotal += askSize;
    asks.push({ price: askPrice, size: askSize, total: +askTotal.toFixed(4) });
  }
  return { bids, asks };
}

function genRecentTrades(midPrice: number, seed: number): Trade[] {
  resetSeed(seed);
  const trades: Trade[] = [];
  const now = Date.now();
  for (let i = 0; i < 15; i++) {
    const spread = midPrice * 0.0005;
    const price = +(midPrice + (rand() - 0.5) * spread * 2).toFixed(midPrice < 1 ? 5 : 2);
    const size = +(0.01 + rand() * 2).toFixed(4);
    const side = rand() > 0.5 ? "buy" : "sell";
    const ms = now - i * (5000 + rand() * 15000);
    const d = new Date(ms);
    const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
    trades.push({ price, size, side, time });
  }
  return trades;
}

function genCandles(midPrice: number, seed: number, bars = 30): CandleBar[] {
  resetSeed(seed);
  const candles: CandleBar[] = [];
  let price = midPrice * (0.85 + rand() * 0.1);
  for (let i = 0; i < bars; i++) {
    const open = price;
    const change = (rand() - 0.48) * price * 0.025;
    const close = Math.max(open * 0.97, open + change);
    const highAdd = rand() * Math.abs(close - open) * 0.5 + price * 0.005;
    const lowSub = rand() * Math.abs(close - open) * 0.5 + price * 0.005;
    const high = Math.max(open, close) + highAdd;
    const low = Math.min(open, close) - lowSub;
    const volume = 50 + rand() * 500;
    candles.push({ open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2), volume: +volume.toFixed(2) });
    price = close;
  }
  return candles;
}

function genFundingRateHistory(seed: number): number[] {
  resetSeed(seed);
  return Array.from({ length: 24 }, () => (rand() - 0.48) * 0.01);
}

function genOpenInterest(seed: number): number[] {
  resetSeed(seed);
  let oi = 1_200_000_000;
  return Array.from({ length: 30 }, () => {
    oi += (rand() - 0.48) * 80_000_000;
    return Math.max(800_000_000, oi);
  });
}

function genTop20Cryptos(seed: number): CryptoInfo[] {
  resetSeed(seed);
  const cryptos: CryptoInfo[] = [
    { symbol: "BTC", name: "Bitcoin", price: 67420, change24h: 2.34, change7d: 8.12, marketCap: 1_320_000_000_000, volume24h: 38_000_000_000, sector: "Layer 1" },
    { symbol: "ETH", name: "Ethereum", price: 3540, change24h: 1.87, change7d: 5.43, marketCap: 425_000_000_000, volume24h: 18_000_000_000, sector: "Layer 1" },
    { symbol: "BNB", name: "BNB", price: 598, change24h: -0.42, change7d: 3.21, marketCap: 87_000_000_000, volume24h: 2_100_000_000, sector: "Layer 1" },
    { symbol: "SOL", name: "Solana", price: 172, change24h: 4.21, change7d: 12.4, marketCap: 77_000_000_000, volume24h: 3_200_000_000, sector: "Layer 1" },
    { symbol: "XRP", name: "XRP", price: 0.598, change24h: -1.23, change7d: -2.1, marketCap: 33_000_000_000, volume24h: 1_400_000_000, sector: "Layer 1" },
    { symbol: "AVAX", name: "Avalanche", price: 38.4, change24h: 3.12, change7d: 9.87, marketCap: 16_000_000_000, volume24h: 890_000_000, sector: "Layer 1" },
    { symbol: "UNI", name: "Uniswap", price: 11.2, change24h: 5.43, change7d: 14.2, marketCap: 8_400_000_000, volume24h: 420_000_000, sector: "DeFi" },
    { symbol: "LINK", name: "Chainlink", price: 18.7, change24h: 2.1, change7d: 6.5, marketCap: 11_000_000_000, volume24h: 560_000_000, sector: "DeFi" },
    { symbol: "MATIC", name: "Polygon", price: 0.89, change24h: -2.3, change7d: -5.4, marketCap: 8_200_000_000, volume24h: 380_000_000, sector: "Layer 2" },
    { symbol: "ARB", name: "Arbitrum", price: 1.24, change24h: 6.78, change7d: 18.3, marketCap: 4_900_000_000, volume24h: 290_000_000, sector: "Layer 2" },
    { symbol: "OP", name: "Optimism", price: 2.87, change24h: 4.32, change7d: 11.2, marketCap: 3_100_000_000, volume24h: 180_000_000, sector: "Layer 2" },
    { symbol: "AXS", name: "Axie Infinity", price: 8.4, change24h: -3.21, change7d: -8.7, marketCap: 1_200_000_000, volume24h: 95_000_000, sector: "GameFi" },
    { symbol: "SAND", name: "The Sandbox", price: 0.54, change24h: -1.87, change7d: -4.2, marketCap: 940_000_000, volume24h: 62_000_000, sector: "GameFi" },
    { symbol: "FET", name: "Fetch.ai", price: 2.34, change24h: 8.91, change7d: 24.3, marketCap: 2_100_000_000, volume24h: 320_000_000, sector: "AI" },
    { symbol: "RNDR", name: "Render", price: 10.2, change24h: 7.43, change7d: 19.8, marketCap: 3_900_000_000, volume24h: 410_000_000, sector: "AI" },
    { symbol: "FIL", name: "Filecoin", price: 6.8, change24h: 1.23, change7d: 3.4, marketCap: 3_600_000_000, volume24h: 220_000_000, sector: "Storage" },
    { symbol: "STORJ", name: "Storj", price: 0.68, change24h: -0.87, change7d: 1.2, marketCap: 250_000_000, volume24h: 18_000_000, sector: "Storage" },
    { symbol: "CRV", name: "Curve", price: 0.51, change24h: 3.45, change7d: 7.8, marketCap: 640_000_000, volume24h: 78_000_000, sector: "DeFi" },
    { symbol: "GMX", name: "GMX", price: 28.4, change24h: 5.67, change7d: 13.4, marketCap: 960_000_000, volume24h: 87_000_000, sector: "DeFi" },
    { symbol: "IMX", name: "Immutable X", price: 2.14, change24h: -1.43, change7d: -3.2, marketCap: 3_200_000_000, volume24h: 160_000_000, sector: "Layer 2" },
  ];
  // apply small random noise using seeded PRNG
  return cryptos.map((c) => ({
    ...c,
    price: +(c.price * (1 + (rand() - 0.5) * 0.002)).toFixed(c.price < 1 ? 5 : c.price < 10 ? 3 : 2),
    change24h: +(c.change24h + (rand() - 0.5) * 0.1).toFixed(2),
  }));
}

function genDexPools(seed: number): DexPool[] {
  resetSeed(seed);
  return [
    { protocol: "Uniswap V3", pair: "ETH/USDC", tvl: 420_000_000, apy: 12.4, volumeTvlRatio: 0.38 },
    { protocol: "Uniswap V3", pair: "WBTC/ETH", tvl: 280_000_000, apy: 8.7, volumeTvlRatio: 0.24 },
    { protocol: "Curve", pair: "3pool", tvl: 620_000_000, apy: 5.2, volumeTvlRatio: 0.18 },
    { protocol: "Curve", pair: "stETH/ETH", tvl: 840_000_000, apy: 4.8, volumeTvlRatio: 0.12 },
    { protocol: "Balancer", pair: "WBTC/WETH/USDC", tvl: 180_000_000, apy: 9.3, volumeTvlRatio: 0.28 },
    { protocol: "GMX", pair: "GLP", tvl: 520_000_000, apy: 18.7, volumeTvlRatio: 0.72 },
    { protocol: "dYdX", pair: "BTC-USD Perp", tvl: 340_000_000, apy: 14.2, volumeTvlRatio: 1.24 },
    { protocol: "Aave V3", pair: "USDC Supply", tvl: 1_200_000_000, apy: 6.1, volumeTvlRatio: 0.09 },
  ];
}

function genEquityCurve(seed: number): number[] {
  resetSeed(seed);
  let eq = 10_000;
  return Array.from({ length: 30 }, () => {
    eq += (rand() - 0.46) * 400;
    return Math.max(7000, +eq.toFixed(2));
  });
}

function fmtPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(3);
  return price.toFixed(5);
}

function fmtCompact(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(2)}`;
}

// ── SVG Components ─────────────────────────────────────────────────────────────

function CandlestickSVG({ candles, width = 580, height = 160 }: { candles: CandleBar[]; width?: number; height?: number }) {
  const volHeight = 30;
  const priceHeight = height - volHeight - 8;
  const prices = candles.flatMap((c) => [c.high, c.low]);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const pRange = maxP - minP || 1;
  const maxVol = Math.max(...candles.map((c) => c.volume));
  const barW = (width / candles.length) * 0.7;
  const gap = width / candles.length;

  const toY = (p: number) => priceHeight - ((p - minP) / pRange) * (priceHeight - 4) - 2;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {candles.map((c, i) => {
        const x = i * gap + gap / 2;
        const isUp = c.close >= c.open;
        const color = isUp ? "#22c55e" : "#ef4444";
        const bodyTop = toY(Math.max(c.open, c.close));
        const bodyBot = toY(Math.min(c.open, c.close));
        const bodyH = Math.max(1, bodyBot - bodyTop);
        const volBarH = (c.volume / maxVol) * volHeight;
        return (
          <g key={i}>
            {/* wick */}
            <line x1={x} y1={toY(c.high)} x2={x} y2={toY(c.low)} stroke={color} strokeWidth={1} />
            {/* body */}
            <rect x={x - barW / 2} y={bodyTop} width={barW} height={bodyH} fill={color} opacity={0.85} />
            {/* volume */}
            <rect
              x={x - barW / 2}
              y={priceHeight + 8 + (volHeight - volBarH)}
              width={barW}
              height={volBarH}
              fill={color}
              opacity={0.4}
            />
          </g>
        );
      })}
    </svg>
  );
}

function OrderBookSVG({ bids, asks }: { bids: OrderBookLevel[]; asks: OrderBookLevel[] }) {
  const maxTotal = Math.max(...bids.map((b) => b.total), ...asks.map((a) => a.total));
  const W = 200;
  const rowH = 18;

  return (
    <div className="flex gap-1">
      {/* Bids */}
      <svg width={W} height={asks.length * rowH + bids.length * rowH + 20} className="overflow-visible">
        {/* Asks (reversed so lowest ask on bottom) */}
        {[...asks].reverse().map((a, i) => {
          const barW = (a.total / maxTotal) * W;
          return (
            <g key={`ask-${i}`}>
              <rect x={W - barW} y={i * rowH} width={barW} height={rowH - 1} fill="#ef4444" opacity={0.15} />
              <text x={4} y={i * rowH + 13} fill="#ef4444" fontSize={10} fontFamily="monospace">
                {fmtPrice(a.price)}
              </text>
              <text x={W - 4} y={i * rowH + 13} fill="#94a3b8" fontSize={10} fontFamily="monospace" textAnchor="end">
                {a.size.toFixed(3)}
              </text>
            </g>
          );
        })}
        {/* Spread indicator */}
        <rect x={0} y={asks.length * rowH} width={W} height={18} fill="#1e293b" />
        <text x={W / 2} y={asks.length * rowH + 13} fill="#64748b" fontSize={10} textAnchor="middle" fontFamily="monospace">
          Spread
        </text>
        {/* Bids */}
        {bids.map((b, i) => {
          const barW = (b.total / maxTotal) * W;
          const y = asks.length * rowH + 20 + i * rowH;
          return (
            <g key={`bid-${i}`}>
              <rect x={W - barW} y={y} width={barW} height={rowH - 1} fill="#22c55e" opacity={0.15} />
              <text x={4} y={y + 13} fill="#22c55e" fontSize={10} fontFamily="monospace">
                {fmtPrice(b.price)}
              </text>
              <text x={W - 4} y={y + 13} fill="#94a3b8" fontSize={10} fontFamily="monospace" textAnchor="end">
                {b.size.toFixed(3)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function FundingRateBarChart({ data }: { data: number[] }) {
  const W = 320;
  const H = 60;
  const barW = W / data.length - 2;
  const maxAbs = Math.max(...data.map(Math.abs), 0.001);
  const midY = H / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <line x1={0} y1={midY} x2={W} y2={midY} stroke="#334155" strokeWidth={1} />
      {data.map((v, i) => {
        const x = i * (W / data.length);
        const barH = (Math.abs(v) / maxAbs) * (H / 2 - 4);
        const isPos = v >= 0;
        return (
          <rect
            key={i}
            x={x + 1}
            y={isPos ? midY - barH : midY}
            width={barW}
            height={barH}
            fill={isPos ? "#22c55e" : "#ef4444"}
            opacity={0.8}
          />
        );
      })}
    </svg>
  );
}

function OpenInterestLine({ data }: { data: number[] }) {
  const W = 320;
  const H = 60;
  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - minV) / range) * (H - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="oiGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth={1.5} />
    </svg>
  );
}

function LongShortGauge({ longPct }: { longPct: number }) {
  const W = 140;
  const H = 80;
  const cx = W / 2;
  const cy = H - 10;
  const r = 55;
  const startAngle = Math.PI;
  const endAngle = 0;
  const totalAngle = endAngle - startAngle; // negative, going clockwise from left

  function polarToXY(angle: number, radius: number) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  // Arc from startAngle to split
  const splitAngle = startAngle + (totalAngle * longPct) / 100;
  const longEnd = polarToXY(splitAngle, r);
  const arcStart = polarToXY(startAngle, r);
  const arcEnd = polarToXY(endAngle, r);

  const longLargeArc = Math.abs(splitAngle - startAngle) > Math.PI ? 1 : 0;
  const shortLargeArc = Math.abs(endAngle - splitAngle) > Math.PI ? 1 : 0;

  // Needle
  const needleAngle = startAngle + (totalAngle * longPct) / 100;
  const needleEnd = polarToXY(needleAngle, r - 8);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Short arc (red) */}
      <path
        d={`M ${longEnd.x} ${longEnd.y} A ${r} ${r} 0 ${shortLargeArc} 1 ${arcEnd.x} ${arcEnd.y}`}
        fill="none"
        stroke="#ef4444"
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* Long arc (green) */}
      <path
        d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 ${longLargeArc} 0 ${longEnd.x} ${longEnd.y}`}
        fill="none"
        stroke="#22c55e"
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke="#f8fafc" strokeWidth={2} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill="#f8fafc" />
      <text x={cx - 30} y={cy - 38} fill="#22c55e" fontSize={9} textAnchor="middle">
        L {longPct.toFixed(0)}%
      </text>
      <text x={cx + 30} y={cy - 38} fill="#ef4444" fontSize={9} textAnchor="middle">
        S {(100 - longPct).toFixed(0)}%
      </text>
    </svg>
  );
}

function SparkSVG({ values, color }: { values: number[]; color: string }) {
  const W = 60;
  const H = 20;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

function EquityCurveSVG({ data }: { data: number[] }) {
  const W = 500;
  const H = 120;
  const min = Math.min(...data) * 0.99;
  const max = Math.max(...data) * 1.01;
  const range = max - min;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");
  const lastColor = data[data.length - 1] >= data[0] ? "#22c55e" : "#ef4444";
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lastColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={lastColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill */}
      <polygon
        points={`0,${H} ${pts} ${W},${H}`}
        fill="url(#eqGrad)"
      />
      <polyline points={pts} fill="none" stroke={lastColor} strokeWidth={2} />
      {/* Start/end labels */}
      <text x={4} y={H - 4} fill="#64748b" fontSize={9}>
        ${data[0].toLocaleString()}
      </text>
      <text x={W - 4} y={H - 4} fill={lastColor} fontSize={9} textAnchor="end">
        ${data[data.length - 1].toLocaleString()}
      </text>
    </svg>
  );
}

function DexBarChart({ labels, values }: { labels: string[]; values: number[] }) {
  const W = 400;
  const H = 100;
  const maxV = Math.max(...values);
  const barW = (W / labels.length) * 0.6;
  const gap = W / labels.length;
  const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6"];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {labels.map((label, i) => {
        const x = i * gap + gap / 2;
        const barH = (values[i] / maxV) * (H - 20);
        return (
          <g key={i}>
            <rect x={x - barW / 2} y={H - 20 - barH} width={barW} height={barH} fill={COLORS[i % COLORS.length]} opacity={0.85} rx={2} />
            <text x={x} y={H - 6} fill="#94a3b8" fontSize={9} textAnchor="middle">
              {label}
            </text>
            <text x={x} y={H - 22 - barH} fill="#e2e8f0" fontSize={8} textAnchor="middle">
              {fmtCompact(values[i])}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CryptoExchangePage() {
  const [activeTab, setActiveTab] = useState("spot");
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [perpPair, setPerpPair] = useState("BTC/USDT");
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop-limit">("market");
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [orderPrice, setOrderPrice] = useState("");
  const [orderSize, setOrderSize] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [leverage, setLeverage] = useState(10);
  const [tick, setTick] = useState(0);

  // wallet state
  const [wallet] = useState<{ usdt: number; holdings: Holding[] }>({
    usdt: 8_240.5,
    holdings: [
      { token: "BTC", amount: 0.04, avgPrice: 64200, currentPrice: 67420 },
      { token: "ETH", amount: 0.85, avgPrice: 3200, currentPrice: 3540 },
      { token: "SOL", amount: 12.5, avgPrice: 155, currentPrice: 172 },
    ],
  });

  // Animate prices every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const midPrice = useMemo(() => {
    const base = BASE_PRICES[selectedPair];
    resetSeed(42 + tick);
    return +(base * (1 + (rand() - 0.5) * 0.002)).toFixed(base < 1 ? 5 : 2);
  }, [selectedPair, tick]);

  const perpPrice = useMemo(() => {
    const base = BASE_PRICES[perpPair];
    resetSeed(77 + tick);
    return +(base * (1 + (rand() - 0.5) * 0.002)).toFixed(base < 1 ? 5 : 2);
  }, [perpPair, tick]);

  const { bids, asks } = useMemo(() => genOrderBook(midPrice, 100 + tick), [midPrice, tick]);
  const recentTrades = useMemo(() => genRecentTrades(midPrice, 200 + tick), [midPrice, tick]);
  const candles = useMemo(() => genCandles(midPrice, 300), [midPrice]);
  const fundingHistory = useMemo(() => genFundingRateHistory(400 + tick), [tick]);
  const openInterest = useMemo(() => genOpenInterest(500), []);
  const top20 = useMemo(() => genTop20Cryptos(600 + tick), [tick]);
  const dexPools = useMemo(() => genDexPools(700), []);
  const equityCurve = useMemo(() => genEquityCurve(800), []);

  const fundingRate = useMemo(() => {
    resetSeed(900 + tick);
    return (rand() - 0.48) * 0.01;
  }, [tick]);

  const longPct = useMemo(() => {
    resetSeed(1000 + tick);
    return 45 + rand() * 20;
  }, [tick]);

  const spread = asks[0] ? +(asks[0].price - bids[0].price) : 0;
  const spreadBps = midPrice > 0 ? +((spread / midPrice) * 10000).toFixed(2) : 0;

  const entrySize = parseFloat(orderSize) || 1;
  const entryPrice = parseFloat(orderPrice) || perpPrice;
  const liqPrice =
    orderSide === "buy"
      ? +(entryPrice * (1 - 1 / leverage + 0.005)).toFixed(2)
      : +(entryPrice * (1 + 1 / leverage - 0.005)).toFixed(2);
  const marginReq = +((entryPrice * entrySize) / leverage).toFixed(2);

  const gainers = [...top20].sort((a, b) => b.change24h - a.change24h).slice(0, 5);
  const losers = [...top20].sort((a, b) => a.change24h - b.change24h).slice(0, 5);
  const volumeLeaders = [...top20].sort((a, b) => b.volume24h - a.volume24h).slice(0, 10);

  const newListings = useMemo(() => {
    resetSeed(1100);
    return [
      { symbol: "PYTH", name: "Pyth Network", listDate: "2026-03-20", change: +(rand() * 80 - 10).toFixed(1) },
      { symbol: "JTO", name: "Jito", listDate: "2026-03-18", change: +(rand() * 60 + 5).toFixed(1) },
      { symbol: "STRK", name: "Starknet", listDate: "2026-03-15", change: +(rand() * 40 - 20).toFixed(1) },
      { symbol: "DYM", name: "Dymension", listDate: "2026-03-12", change: +(rand() * 100 - 5).toFixed(1) },
      { symbol: "ALT", name: "AltLayer", listDate: "2026-03-10", change: +(rand() * 50 - 15).toFixed(1) },
    ];
  }, []);

  const sectorPerf = useMemo(() => {
    const sectors = ["DeFi", "Layer 1", "Layer 2", "GameFi", "AI", "Storage"];
    return sectors.map((sector) => {
      const sectorCryptos = top20.filter((c) => c.sector === sector);
      const avg = sectorCryptos.length > 0 ? sectorCryptos.reduce((s, c) => s + c.change24h, 0) / sectorCryptos.length : 0;
      return { sector, avg: +avg.toFixed(2) };
    });
  }, [top20]);

  const generateSparkData = useCallback((seed: number) => {
    resetSeed(seed);
    return Array.from({ length: 12 }, () => 50 + rand() * 50);
  }, []);

  const totalPortfolioValue = wallet.holdings.reduce((sum, h) => sum + h.amount * h.currentPrice, 0) + wallet.usdt;
  const totalPnl = wallet.holdings.reduce((sum, h) => sum + h.amount * (h.currentPrice - h.avgPrice), 0);
  const totalPnlPct = wallet.holdings.reduce((sum, h) => sum + h.amount * h.avgPrice, 0) > 0
    ? (totalPnl / wallet.holdings.reduce((sum, h) => sum + h.amount * h.avgPrice, 0)) * 100
    : 0;

  const feesPaid = useMemo(() => ({ exchange: 42.7, gas: 18.4, bridge: 7.2 }), []);

  const tradeHistory = useMemo(() => {
    resetSeed(1200);
    const sides = ["buy", "sell"] as const;
    const tokens = ["BTC", "ETH", "SOL", "BNB", "XRP"];
    return Array.from({ length: 20 }, (_, i) => {
      const token = tokens[Math.floor(rand() * tokens.length)];
      const side = sides[Math.floor(rand() * 2)];
      const price = BASE_PRICES[`${token}/USDT`] * (1 + (rand() - 0.5) * 0.05);
      const amount = +(0.01 + rand() * 2).toFixed(4);
      const pnl = side === "sell" ? +((rand() - 0.4) * price * amount * 0.05).toFixed(2) : null;
      const daysAgo = Math.floor(rand() * 30);
      return { id: i + 1, token, side, price: +price.toFixed(2), amount, pnl, date: `2026-${String(3 - Math.floor(daysAgo / 30)).padStart(2, "0")}-${String(28 - (daysAgo % 28)).padStart(2, "0")}` };
    });
  }, []);

  const dexLabels = ["Uniswap", "Curve", "dYdX", "GMX", "Balancer"];
  const dexVolumes = [1_240_000_000, 820_000_000, 480_000_000, 360_000_000, 210_000_000];

  const bridgeFlows = useMemo(() => {
    resetSeed(1300);
    const chains = ["ETH", "BSC", "Polygon", "Arbitrum", "Optimism"];
    return chains.map((from) =>
      chains.filter((c) => c !== from).map((to) => ({
        from,
        to,
        volume: Math.floor(rand() * 500_000_000 + 50_000_000),
      }))
    ).flat().slice(0, 8);
  }, []);

  const protocolRevenue = [
    { protocol: "Uniswap", revenue: 12_400_000 },
    { protocol: "Aave", revenue: 8_700_000 },
    { protocol: "Curve", revenue: 6_200_000 },
    { protocol: "GMX", revenue: 5_800_000 },
    { protocol: "dYdX", revenue: 4_300_000 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* HERO Header */}
      <div className="flex items-center justify-between mb-8 border-l-4 border-l-primary rounded-md bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Crypto Exchange</h1>
            <p className="text-xs text-muted-foreground">Simulated trading environment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block mr-1.5 animate-pulse" />
            Live
          </Badge>
          <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Simulated</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="spot" className="data-[state=active]:bg-muted text-xs">
            <BarChart2 className="w-3 h-3 mr-1.5" />
            Spot Trading
          </TabsTrigger>
          <TabsTrigger value="perp" className="data-[state=active]:bg-muted text-xs">
            <Zap className="w-3 h-3 mr-1.5" />
            Perpetuals
          </TabsTrigger>
          <TabsTrigger value="market" className="data-[state=active]:bg-muted text-xs">
            <TrendingUp className="w-3 h-3 mr-1.5" />
            Market Overview
          </TabsTrigger>
          <TabsTrigger value="defi" className="data-[state=active]:bg-muted text-xs">
            <Layers className="w-3 h-3 mr-1.5" />
            DeFi Dashboard
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-muted text-xs">
            <Wallet className="w-3 h-3 mr-1.5" />
            Portfolio
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Spot Trading ─────────────────────────────────────────────── */}
        <TabsContent value="spot" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Left: Pair selector + Chart */}
            <div className="xl:col-span-2 space-y-4">
              {/* Pair selector */}
              <div className="bg-card border border-border rounded-md p-4">
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {PAIRS.map((pair) => (
                    <button
                      key={pair}
                      onClick={() => setSelectedPair(pair)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        selectedPair === pair
                          ? "bg-indigo-600 text-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {pair}
                    </button>
                  ))}
                </div>
                {/* Price header */}
                <div className="flex items-baseline gap-3">
                  <motion.span
                    key={`price-${tick}`}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-bold text-foreground font-mono"
                  >
                    {fmtPrice(midPrice)}
                  </motion.span>
                  <span className="text-sm text-green-400 font-mono">+1.87%</span>
                  <span className="text-xs text-muted-foreground">24h</span>
                  <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Spread: <span className="text-muted-foreground font-mono">{spreadBps} bps</span></span>
                    <span>Bid: <span className="text-green-400 font-mono">{bids[0] ? fmtPrice(bids[0].price) : "-"}</span></span>
                    <span>Ask: <span className="text-red-400 font-mono">{asks[0] ? fmtPrice(asks[0].price) : "-"}</span></span>
                  </div>
                </div>
              </div>

              {/* Candlestick chart */}
              <div className="bg-card border border-border rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Price Chart (30 bars)</span>
                  <div className="flex gap-1">
                    {["1m", "5m", "15m", "1h", "4h", "1D"].map((tf) => (
                      <button key={tf} className="px-2 py-0.5 rounded text-xs text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors">
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <CandlestickSVG candles={candles} />
              </div>

              {/* Recent Trades */}
              <div className="bg-card border border-border rounded-md p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Trades</h3>
                <div className="grid grid-cols-3 text-xs text-muted-foreground mb-2 px-1">
                  <span>Price (USDT)</span>
                  <span className="text-center">Amount</span>
                  <span className="text-right">Time</span>
                </div>
                <div className="space-y-0.5 max-h-64 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {recentTrades.map((trade, i) => (
                      <motion.div
                        key={`trade-${i}-${tick}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-3 text-xs px-1 py-0.5 rounded hover:bg-muted/50"
                      >
                        <span className={cn("font-mono", trade.side === "buy" ? "text-green-400" : "text-red-400")}>
                          {fmtPrice(trade.price)}
                        </span>
                        <span className="text-center text-muted-foreground font-mono">{trade.size.toFixed(4)}</span>
                        <span className="text-right text-muted-foreground font-mono">{trade.time}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right: Order Book + Order Form */}
            <div className="space-y-4">
              {/* Order Book */}
              <div className="bg-card border border-border rounded-md p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Order Book</h3>
                <div className="grid grid-cols-3 text-xs text-muted-foreground mb-2">
                  <span>Price</span>
                  <span className="text-center">Size</span>
                  <span className="text-right">Total</span>
                </div>
                {/* Asks */}
                <div className="space-y-0.5 mb-1">
                  {[...asks].reverse().map((a, i) => {
                    const barPct = (a.total / (asks[asks.length - 1]?.total || 1)) * 100;
                    return (
                      <div key={`ask-${i}`} className="relative grid grid-cols-3 text-xs py-0.5 px-1 rounded overflow-hidden">
                        <div className="absolute inset-0 right-0" style={{ width: `${barPct}%`, background: "rgba(239,68,68,0.08)", marginLeft: "auto" }} />
                        <span className="relative text-red-400 font-mono">{fmtPrice(a.price)}</span>
                        <span className="relative text-center text-muted-foreground font-mono">{a.size.toFixed(3)}</span>
                        <span className="relative text-right text-muted-foreground font-mono">{a.total.toFixed(3)}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Spread */}
                <div className="py-1 px-1 text-center text-xs text-muted-foreground bg-muted/50 rounded mb-1">
                  Spread {spreadBps} bps
                </div>
                {/* Bids */}
                <div className="space-y-0.5">
                  {bids.map((b, i) => {
                    const barPct = (b.total / (bids[bids.length - 1]?.total || 1)) * 100;
                    return (
                      <div key={`bid-${i}`} className="relative grid grid-cols-3 text-xs py-0.5 px-1 rounded overflow-hidden">
                        <div className="absolute inset-0 right-0" style={{ width: `${barPct}%`, background: "rgba(34,197,94,0.08)", marginLeft: "auto" }} />
                        <span className="relative text-green-400 font-mono">{fmtPrice(b.price)}</span>
                        <span className="relative text-center text-muted-foreground font-mono">{b.size.toFixed(3)}</span>
                        <span className="relative text-right text-muted-foreground font-mono">{b.total.toFixed(3)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trade Form */}
              <div className="bg-card border border-border rounded-md p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Place Order</h3>
                {/* Order type */}
                <div className="flex gap-1 mb-3">
                  {(["market", "limit", "stop-limit"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setOrderType(t)}
                      className={cn(
                        "flex-1 py-1 rounded text-xs font-medium transition-all",
                        orderType === t ? "bg-indigo-600 text-foreground" : "bg-muted text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {t === "stop-limit" ? "Stop" : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                {/* Buy/Sell toggle */}
                <div className="flex gap-1 mb-3">
                  <button
                    onClick={() => setOrderSide("buy")}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-semibold transition-all", orderSide === "buy" ? "bg-green-600 text-foreground" : "bg-muted text-muted-foreground hover:bg-green-900/30 hover:text-green-400")}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setOrderSide("sell")}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-semibold transition-all", orderSide === "sell" ? "bg-red-600 text-foreground" : "bg-muted text-muted-foreground hover:bg-red-900/30 hover:text-red-400")}
                  >
                    Sell
                  </button>
                </div>
                {/* Price inputs */}
                {orderType === "stop-limit" && (
                  <div className="mb-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Stop Price</label>
                    <Input
                      value={stopPrice}
                      onChange={(e) => setStopPrice(e.target.value)}
                      placeholder={fmtPrice(midPrice * 0.99)}
                      className="bg-muted border-border text-foreground h-8 text-sm"
                    />
                  </div>
                )}
                {orderType !== "market" && (
                  <div className="mb-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Limit Price</label>
                    <Input
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(e.target.value)}
                      placeholder={fmtPrice(midPrice)}
                      className="bg-muted border-border text-foreground h-8 text-sm"
                    />
                  </div>
                )}
                <div className="mb-3">
                  <label className="text-xs text-muted-foreground mb-1 block">Amount ({selectedPair.split("/")[0]})</label>
                  <Input
                    value={orderSize}
                    onChange={(e) => setOrderSize(e.target.value)}
                    placeholder="0.001"
                    className="bg-muted border-border text-foreground h-8 text-sm"
                  />
                </div>
                {/* Quick size buttons */}
                <div className="flex gap-1 mb-3">
                  {["25%", "50%", "75%", "100%"].map((pct) => (
                    <button key={pct} className="flex-1 py-1 bg-muted hover:bg-muted text-xs text-muted-foreground rounded transition-colors">
                      {pct}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mb-3 space-y-1">
                  <div className="flex justify-between">
                    <span>Est. Total</span>
                    <span className="text-muted-foreground font-mono">
                      ${((parseFloat(orderSize) || 0) * midPrice).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee (0.1%)</span>
                    <span className="text-muted-foreground font-mono">
                      ${((parseFloat(orderSize) || 0) * midPrice * 0.001).toFixed(4)}
                    </span>
                  </div>
                </div>
                <Button
                  className={cn("w-full font-medium", orderSide === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700")}
                >
                  {orderSide === "buy" ? "Buy" : "Sell"} {selectedPair.split("/")[0]}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Perpetuals ───────────────────────────────────────────────── */}
        <TabsContent value="perp" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Main perp panel */}
            <div className="xl:col-span-2 space-y-4">
              {/* Perp pair selector + stats */}
              <div className="bg-card border border-border rounded-md p-4">
                <div className="flex items-center gap-3 mb-4">
                  {PERP_PAIRS.map((pair) => (
                    <button
                      key={pair}
                      onClick={() => setPerpPair(pair)}
                      className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", perpPair === pair ? "bg-indigo-600 text-foreground" : "bg-muted text-muted-foreground hover:bg-muted")}
                    >
                      {pair} PERP
                    </button>
                  ))}
                </div>
                <div className="flex items-baseline gap-3 mb-4">
                  <motion.span
                    key={`perp-price-${tick}`}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-bold font-mono"
                  >
                    {fmtPrice(perpPrice)}
                  </motion.span>
                  <span className="text-sm text-green-400">+2.14%</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Funding Rate</div>
                    <div className={cn("text-sm font-mono font-medium", fundingRate >= 0 ? "text-red-400" : "text-green-400")}>
                      {fundingRate >= 0 ? "+" : ""}{(fundingRate * 100).toFixed(4)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {fundingRate >= 0 ? "Longs pay shorts" : "Shorts pay longs"}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Open Interest</div>
                    <div className="text-sm font-mono font-medium text-foreground">{fmtCompact(openInterest[openInterest.length - 1])}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
                    <div className="text-sm font-mono font-medium text-foreground">{fmtCompact(perpPair === "BTC/USDT" ? 28_400_000_000 : 14_200_000_000)}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Mark Price</div>
                    <div className="text-sm font-mono font-medium text-foreground">{fmtPrice(perpPrice * 1.0002)}</div>
                  </div>
                </div>
              </div>

              {/* Funding rate history */}
              <div className="bg-card border border-border rounded-md p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Funding Rate History (24h)</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-sm inline-block" /> Shorts pay</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-sm inline-block" /> Longs pay</span>
                </div>
                <FundingRateBarChart data={fundingHistory} />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>24h ago</span>
                  <span>Now</span>
                </div>
              </div>

              {/* Open Interest trend */}
              <div className="bg-card border border-border rounded-md p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Open Interest Trend (30 periods)</h3>
                <OpenInterestLine data={openInterest} />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>{fmtCompact(openInterest[0])}</span>
                  <span className="text-indigo-400">{fmtCompact(openInterest[openInterest.length - 1])}</span>
                </div>
              </div>
            </div>

            {/* Right: Long/Short gauge + Leverage form */}
            <div className="space-y-4">
              {/* Long/Short ratio */}
              <div className="bg-card border border-border rounded-md p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Long / Short Ratio</h3>
                <div className="flex justify-center mb-2">
                  <LongShortGauge longPct={longPct} />
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <div className="text-center">
                    <div className="text-green-400 font-medium text-sm">{longPct.toFixed(1)}%</div>
                    <div className="text-muted-foreground">Longs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 font-medium text-sm">{(100 - longPct).toFixed(1)}%</div>
                    <div className="text-muted-foreground">Shorts</div>
                  </div>
                </div>
              </div>

              {/* Leverage selector */}
              <div className="bg-card border border-border rounded-md p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Leverage & Margin</h3>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Leverage</span>
                    <span className="text-sm font-medium text-amber-400">{leverage}x</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={leverage}
                    onChange={(e) => setLeverage(+e.target.value)}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1x</span>
                    <span>25x</span>
                    <span>50x</span>
                    <span>100x</span>
                  </div>
                </div>
                <div className="flex gap-1 mb-3 flex-wrap">
                  {[2, 5, 10, 20, 50, 100].map((lv) => (
                    <button
                      key={lv}
                      onClick={() => setLeverage(lv)}
                      className={cn("px-2 py-1 rounded text-xs transition-all", leverage === lv ? "bg-amber-600 text-foreground" : "bg-muted text-muted-foreground hover:bg-muted")}
                    >
                      {lv}x
                    </button>
                  ))}
                </div>
                <Separator className="bg-muted my-3" />
                <h4 className="text-xs text-muted-foreground mb-3">Liquidation Calculator</h4>
                <div className="space-y-2 mb-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Entry Price</label>
                    <Input
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(e.target.value)}
                      placeholder={fmtPrice(perpPrice)}
                      className="bg-muted border-border text-foreground h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Position Size (contracts)</label>
                    <Input
                      value={orderSize}
                      onChange={(e) => setOrderSize(e.target.value)}
                      placeholder="1"
                      className="bg-muted border-border text-foreground h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="bg-muted/60 rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margin Required</span>
                    <span className="text-foreground font-mono">${marginReq.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Liq. Price ({orderSide === "buy" ? "Long" : "Short"})</span>
                    <span className="text-red-400 font-mono font-medium">{fmtPrice(liqPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Liq. Distance</span>
                    <span className="text-amber-400 font-mono">{(Math.abs(liqPrice - entryPrice) / entryPrice * 100).toFixed(2)}%</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setOrderSide("buy")}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", orderSide === "buy" ? "bg-green-600 text-foreground" : "bg-muted text-muted-foreground hover:text-green-400")}
                  >
                    Long {leverage}x
                  </button>
                  <button
                    onClick={() => setOrderSide("sell")}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", orderSide === "sell" ? "bg-red-600 text-foreground" : "bg-muted text-muted-foreground hover:text-red-400")}
                  >
                    Short {leverage}x
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Market Overview ──────────────────────────────────────────── */}
        <TabsContent value="market" className="data-[state=inactive]:hidden space-y-4">
          {/* Sector performance */}
          <div className="bg-card border border-border rounded-md p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Sector Performance (24h)</h3>
            <div className="flex flex-wrap gap-2">
              {sectorPerf.map(({ sector, avg }) => (
                <div
                  key={sector}
                  className={cn(
                    "flex-1 min-w-24 rounded-lg p-3 border text-center",
                    avg >= 0 ? "bg-green-950/40 border-green-800/40" : "bg-red-950/40 border-red-800/40"
                  )}
                >
                  <div className="text-xs text-muted-foreground mb-1">{sector}</div>
                  <div className={cn("text-sm font-medium font-mono", avg >= 0 ? "text-green-400" : "text-red-400")}>
                    {avg >= 0 ? "+" : ""}{avg}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 20 table */}
          <div className="bg-card border border-border rounded-md p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Top 20 by Market Cap</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left pb-2 pr-3 font-medium">#</th>
                    <th className="text-left pb-2 pr-3 font-medium">Asset</th>
                    <th className="text-right pb-2 pr-3 font-medium">Price</th>
                    <th className="text-right pb-2 pr-3 font-medium">24h %</th>
                    <th className="text-right pb-2 pr-3 font-medium">7d %</th>
                    <th className="text-right pb-2 pr-3 font-medium">Market Cap</th>
                    <th className="text-right pb-2 font-medium">Volume 24h</th>
                  </tr>
                </thead>
                <tbody>
                  {top20.map((coin, i) => (
                    <tr key={coin.symbol} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2 pr-3 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground" style={{ fontSize: 8 }}>
                            {coin.symbol[0]}
                          </div>
                          <div>
                            <div className="text-foreground font-medium">{coin.symbol}</div>
                            <div className="text-muted-foreground">{coin.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-right font-mono text-foreground">${fmtPrice(coin.price)}</td>
                      <td className={cn("py-2 pr-3 text-right font-mono", coin.change24h >= 0 ? "text-green-400" : "text-red-400")}>
                        {coin.change24h >= 0 ? "+" : ""}{coin.change24h}%
                      </td>
                      <td className={cn("py-2 pr-3 text-right font-mono", coin.change7d >= 0 ? "text-green-400" : "text-red-400")}>
                        {coin.change7d >= 0 ? "+" : ""}{coin.change7d}%
                      </td>
                      <td className="py-2 pr-3 text-right text-muted-foreground font-mono">{fmtCompact(coin.marketCap)}</td>
                      <td className="py-2 text-right text-muted-foreground font-mono">{fmtCompact(coin.volume24h)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Gainers */}
            <div className="bg-card border border-border rounded-md p-4">
              <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" /> Top Gainers (24h)
              </h3>
              <div className="space-y-2">
                {gainers.map((coin, i) => (
                  <div key={coin.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                      <span className="text-sm font-medium text-foreground">{coin.symbol}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <SparkSVG values={generateSparkData(i * 13 + 1)} color="#22c55e" />
                      <span className="text-green-400 text-xs font-mono w-12 text-right">+{coin.change24h}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="bg-card border border-border rounded-md p-4">
              <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4" /> Top Losers (24h)
              </h3>
              <div className="space-y-2">
                {losers.map((coin, i) => (
                  <div key={coin.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                      <span className="text-sm font-medium text-foreground">{coin.symbol}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <SparkSVG values={generateSparkData(i * 17 + 7)} color="#ef4444" />
                      <span className="text-red-400 text-xs font-mono w-12 text-right">{coin.change24h}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Volume leaders */}
            <div className="bg-card border border-border rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Volume Leaders (24h)
              </h3>
              <div className="space-y-2">
                {volumeLeaders.slice(0, 8).map((coin, i) => {
                  const maxVol = volumeLeaders[0].volume24h;
                  const pct = (coin.volume24h / maxVol) * 100;
                  return (
                    <div key={coin.symbol} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                      <span className="text-xs font-medium text-muted-foreground w-12">{coin.symbol}</span>
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono w-14 text-right">{fmtCompact(coin.volume24h)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* New listings */}
          <div className="bg-card border border-border rounded-md p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> New Listings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {newListings.map((listing) => (
                <div key={listing.symbol} className="bg-muted/60 rounded-lg p-3 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{listing.symbol}</span>
                    <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400 px-1 py-0">NEW</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{listing.name}</div>
                  <div className="text-xs text-muted-foreground mb-1">Listed: {listing.listDate}</div>
                  <div className={cn("text-sm font-medium font-mono", listing.change >= 0 ? "text-green-400" : "text-red-400")}>
                    {listing.change >= 0 ? "+" : ""}{listing.change}%
                  </div>
                  <div className="text-xs text-muted-foreground">Since listing</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 4: DeFi Dashboard ───────────────────────────────────────────── */}
        <TabsContent value="defi" className="data-[state=inactive]:hidden space-y-4">
          {/* DEX Volume */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">DEX Volume (24h)</h3>
              <DexBarChart labels={dexLabels} values={dexVolumes} />
            </div>

            {/* Protocol Revenue */}
            <div className="bg-card border border-border rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Protocol Revenue (7d fees)</h3>
              <div className="space-y-3">
                {protocolRevenue.map((p, i) => {
                  const maxRev = protocolRevenue[0].revenue;
                  const pct = (p.revenue / maxRev) * 100;
                  const colors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-pink-500", "bg-cyan-500"];
                  return (
                    <div key={p.protocol} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16">{p.protocol}</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className={cn("h-2 rounded-full", colors[i])} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-16 text-right">{fmtCompact(p.revenue)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Pools */}
          <div className="bg-card border border-border rounded-md p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Top Liquidity Pools</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left pb-2 pr-4 font-medium">Protocol</th>
                    <th className="text-left pb-2 pr-4 font-medium">Pair</th>
                    <th className="text-right pb-2 pr-4 font-medium">TVL</th>
                    <th className="text-right pb-2 pr-4 font-medium">APY</th>
                    <th className="text-right pb-2 font-medium">Vol/TVL</th>
                  </tr>
                </thead>
                <tbody>
                  {dexPools.map((pool, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2 pr-4">
                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">{pool.protocol}</span>
                      </td>
                      <td className="py-2 pr-4 text-foreground font-medium">{pool.pair}</td>
                      <td className="py-2 pr-4 text-right font-mono text-muted-foreground">{fmtCompact(pool.tvl)}</td>
                      <td className="py-2 pr-4 text-right font-mono text-green-400 font-medium">{pool.apy.toFixed(1)}%</td>
                      <td className="py-2 text-right font-mono">
                        <span className={cn("px-1.5 py-0.5 rounded text-xs", pool.volumeTvlRatio > 0.5 ? "bg-green-900/40 text-green-400" : "bg-muted text-muted-foreground")}>
                          {pool.volumeTvlRatio.toFixed(2)}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Yield opportunities + Bridge Volume */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Yield Opportunities (Risk-Adjusted)</h3>
              <div className="space-y-2">
                {[
                  { name: "Aave USDC", apy: 6.1, risk: "Low", protocol: "Aave" },
                  { name: "Curve 3pool", apy: 5.2, risk: "Low", protocol: "Curve" },
                  { name: "GMX GLP", apy: 18.7, risk: "Medium", protocol: "GMX" },
                  { name: "Uniswap ETH/USDC", apy: 12.4, risk: "Medium", protocol: "Uniswap" },
                  { name: "dYdX Perp", apy: 14.2, risk: "High", protocol: "dYdX" },
                  { name: "Balancer BPT", apy: 9.3, risk: "Medium", protocol: "Balancer" },
                ].sort((a, b) => b.apy - a.apy).map((y, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-sm text-foreground">{y.name}</div>
                      <div className="text-xs text-muted-foreground">{y.protocol}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          y.risk === "Low" ? "border-green-500/40 text-green-400" :
                          y.risk === "Medium" ? "border-amber-500/40 text-amber-400" :
                          "border-red-500/40 text-red-400"
                        )}
                      >
                        {y.risk}
                      </Badge>
                      <span className="text-green-400 font-medium font-mono text-sm">{y.apy.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bridge volume */}
            <div className="bg-card border border-border rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <GitMerge className="w-4 h-4" /> Bridge Volume (24h)
              </h3>
              <div className="space-y-2">
                {bridgeFlows.slice(0, 8).map((flow, i) => {
                  const chainColors: Record<string, string> = {
                    ETH: "text-indigo-400",
                    BSC: "text-amber-400",
                    Polygon: "text-primary",
                    Arbitrum: "text-primary",
                    Optimism: "text-red-400",
                  };
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={cn("font-medium w-16", chainColors[flow.from] || "text-muted-foreground")}>{flow.from}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className={cn("font-medium w-16", chainColors[flow.to] || "text-muted-foreground")}>{flow.to}</span>
                      <div className="flex-1 bg-muted rounded-full h-1.5 mx-2">
                        <div
                          className="bg-indigo-500/60 h-1.5 rounded-full"
                          style={{ width: `${(flow.volume / 500_000_000) * 100}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground font-mono w-14 text-right">{fmtCompact(flow.volume)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 5: Portfolio & Wallet ───────────────────────────────────────── */}
        <TabsContent value="portfolio" className="data-[state=inactive]:hidden space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-md p-4">
              <div className="text-xs text-muted-foreground mb-1">Total Value</div>
              <div className="text-xl font-medium text-foreground font-mono">${totalPortfolioValue.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Starting: $10,000.00</div>
            </div>
            <div className="bg-card border border-border rounded-md p-4">
              <div className="text-xs text-muted-foreground mb-1">Total P&L</div>
              <div className={cn("text-xl font-medium font-mono", totalPnl >= 0 ? "text-green-400" : "text-red-400")}>
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
              </div>
              <div className={cn("text-xs", totalPnlPct >= 0 ? "text-green-500" : "text-red-500")}>
                {totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}%
              </div>
            </div>
            <div className="bg-card border border-border rounded-md p-4">
              <div className="text-xs text-muted-foreground mb-1">USDT Balance</div>
              <div className="text-xl font-medium text-foreground font-mono">${wallet.usdt.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Available</div>
            </div>
            <div className="bg-card border border-border rounded-md p-4">
              <div className="text-xs text-muted-foreground mb-1">Total Fees Paid</div>
              <div className="text-xl font-medium text-foreground font-mono">
                ${(feesPaid.exchange + feesPaid.gas + feesPaid.bridge).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">All-time</div>
            </div>
          </div>

          {/* P&L equity curve */}
          <div className="bg-card border border-border rounded-md p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">30-Day Equity Curve</h3>
            <EquityCurveSVG data={equityCurve} />
          </div>

          {/* Holdings */}
          <div className="bg-card border border-border rounded-md p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4" /> Holdings
            </h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left pb-2 pr-4 font-medium">Token</th>
                  <th className="text-right pb-2 pr-4 font-medium">Amount</th>
                  <th className="text-right pb-2 pr-4 font-medium">Avg Price</th>
                  <th className="text-right pb-2 pr-4 font-medium">Current</th>
                  <th className="text-right pb-2 pr-4 font-medium">Value</th>
                  <th className="text-right pb-2 font-medium">P&L</th>
                </tr>
              </thead>
              <tbody>
                {wallet.holdings.map((h) => {
                  const value = h.amount * h.currentPrice;
                  const pnl = h.amount * (h.currentPrice - h.avgPrice);
                  const pnlPct = ((h.currentPrice - h.avgPrice) / h.avgPrice) * 100;
                  return (
                    <tr key={h.token} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium">
                            {h.token[0]}
                          </div>
                          <span className="text-foreground font-medium">{h.token}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right font-mono text-muted-foreground">{h.amount}</td>
                      <td className="py-3 pr-4 text-right font-mono text-muted-foreground">${h.avgPrice.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-right font-mono text-foreground">${h.currentPrice.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-right font-mono text-foreground">${value.toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <div className={cn("font-mono font-medium", pnl >= 0 ? "text-green-400" : "text-red-400")}>
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                        </div>
                        <div className={cn("text-xs", pnl >= 0 ? "text-green-500" : "text-red-500")}>
                          {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {/* USDT row */}
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 text-xs font-medium">$</div>
                      <span className="text-foreground font-medium">USDT</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-muted-foreground">{wallet.usdt.toFixed(2)}</td>
                  <td className="py-3 pr-4 text-right font-mono text-muted-foreground">$1.00</td>
                  <td className="py-3 pr-4 text-right font-mono text-foreground">$1.00</td>
                  <td className="py-3 pr-4 text-right font-mono text-foreground">${wallet.usdt.toFixed(2)}</td>
                  <td className="py-3 text-right font-mono text-muted-foreground">$0.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Fees breakdown + Trade history */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Fees Paid (All-Time)</h3>
              <div className="space-y-3">
                {[
                  { label: "Exchange Fees (0.1%)", value: feesPaid.exchange, color: "bg-indigo-500" },
                  { label: "Gas Fees (ETH/Polygon)", value: feesPaid.gas, color: "bg-amber-500" },
                  { label: "Bridge Fees", value: feesPaid.bridge, color: "bg-pink-500" },
                ].map((fee) => {
                  const total = feesPaid.exchange + feesPaid.gas + feesPaid.bridge;
                  return (
                    <div key={fee.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{fee.label}</span>
                        <span className="font-mono text-muted-foreground">${fee.value.toFixed(2)}</span>
                      </div>
                      <div className="bg-muted rounded-full h-1.5">
                        <div className={cn("h-1.5 rounded-full", fee.color)} style={{ width: `${(fee.value / total) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-border flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-mono font-medium text-foreground">${(feesPaid.exchange + feesPaid.gas + feesPaid.bridge).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Trade History (Last 20)</h3>
              <div className="overflow-y-auto max-h-64 space-y-1">
                {tradeHistory.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <span className={cn("px-1.5 py-0.5 rounded font-medium", trade.side === "buy" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400")}>
                        {trade.side.toUpperCase()}
                      </span>
                      <span className="text-foreground">{trade.token}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-mono">{trade.date}</span>
                      <span className="text-muted-foreground font-mono">{trade.amount}</span>
                      <span className="text-muted-foreground font-mono">@${trade.price.toLocaleString()}</span>
                      {trade.pnl !== null && (
                        <span className={cn("font-mono font-medium", trade.pnl >= 0 ? "text-green-400" : "text-red-400")}>
                          {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
