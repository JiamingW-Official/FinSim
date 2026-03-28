"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Bitcoin,
  TrendingUp,
  TrendingDown,
  Droplets,
  Cpu,
  BookOpen,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Zap,
  ImageIcon,
  PieChart,
  ShieldAlert,
  RefreshCw,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) & 0xffffffff;
  }
  return h >>> 0;
}

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CryptoAsset {
  symbol: string;
  name: string;
  basePrice: number;
  baseMcap: number; // in billions USD
  baseVolume: number; // in billions USD
}

interface CryptoRow extends CryptoAsset {
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
}

interface Pool {
  id: string;
  pair: string;
  token0: string;
  token1: string;
  apy: number;
  tvl: number; // millions USD
  fees24h: number; // thousands USD
}

interface StakingPool {
  id: string;
  name: string;
  asset: string;
  apy: number;
  minStake: number;
  lockDays: number;
}

interface LPPosition {
  poolId: string;
  pair: string;
  amount: number;
  lpTokens: number;
  dailyYield: number;
  entryDate: string;
}

interface CryptoPosition {
  symbol: string;
  name: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
}

interface WhaleRow {
  hash: string;
  wallet: string;
  amount: number;
  asset: string;
  direction: "to exchange" | "from exchange" | "wallet to wallet";
  chain: string;
  timeAgo: string;
}

interface YieldFarmOpportunity {
  id: string;
  protocol: string;
  pool: string;
  apy: number; // annual %
  isLP: boolean; // liquidity pool (has IL risk)
  token0?: string;
  token1?: string;
}

interface NftCollection {
  name: string;
  symbol: string;
  floorPrice: number; // ETH
  volume24h: number; // ETH
  holderCount: number;
  change24h: number; // %
}

interface CryptoPortfolioAsset {
  symbol: string;
  name: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  targetWeight: number; // 0-100
}

// ── Static asset definitions ──────────────────────────────────────────────────

const ASSETS: CryptoAsset[] = [
  { symbol: "BTC",   name: "Bitcoin",         basePrice: 68420,  baseMcap: 1348,  baseVolume: 28.4  },
  { symbol: "ETH",   name: "Ethereum",        basePrice: 3580,   baseMcap: 430,   baseVolume: 14.2  },
  { symbol: "BNB",   name: "BNB",             basePrice: 412,    baseMcap: 60.3,  baseVolume: 1.8   },
  { symbol: "SOL",   name: "Solana",          basePrice: 178,    baseMcap: 82.1,  baseVolume: 4.3   },
  { symbol: "ADA",   name: "Cardano",         basePrice: 0.612,  baseMcap: 21.5,  baseVolume: 0.48  },
  { symbol: "AVAX",  name: "Avalanche",       basePrice: 42.8,   baseMcap: 17.6,  baseVolume: 0.72  },
  { symbol: "DOT",   name: "Polkadot",        basePrice: 9.14,   baseMcap: 12.3,  baseVolume: 0.34  },
  { symbol: "LINK",  name: "Chainlink",       basePrice: 18.72,  baseMcap: 11.0,  baseVolume: 0.62  },
  { symbol: "UNI",   name: "Uniswap",         basePrice: 10.84,  baseMcap: 8.18,  baseVolume: 0.29  },
  { symbol: "AAVE",  name: "Aave",            basePrice: 106,    baseMcap: 1.58,  baseVolume: 0.15  },
  { symbol: "MATIC", name: "Polygon",         basePrice: 0.88,   baseMcap: 8.64,  baseVolume: 0.41  },
  { symbol: "ATOM",  name: "Cosmos",          basePrice: 11.2,   baseMcap: 4.38,  baseVolume: 0.18  },
  { symbol: "NEAR",  name: "NEAR Protocol",   basePrice: 7.34,   baseMcap: 8.02,  baseVolume: 0.31  },
  { symbol: "ARB",   name: "Arbitrum",        basePrice: 1.82,   baseMcap: 4.60,  baseVolume: 0.52  },
  { symbol: "OP",    name: "Optimism",        basePrice: 2.96,   baseMcap: 3.72,  baseVolume: 0.38  },
];

const TRADING_PAIRS = ["BTC/USD", "ETH/USD", "SOL/USD", "BNB/USD", "ADA/USD", "AVAX/USD"];

const POOLS_DEF: Omit<Pool, "apy" | "tvl" | "fees24h">[] = [
  { id: "btc-eth",    pair: "BTC-ETH",     token0: "BTC",   token1: "ETH"   },
  { id: "eth-usdc",   pair: "ETH-USDC",    token0: "ETH",   token1: "USDC"  },
  { id: "sol-usdc",   pair: "SOL-USDC",    token0: "SOL",   token1: "USDC"  },
  { id: "bnb-busd",   pair: "BNB-BUSD",    token0: "BNB",   token1: "BUSD"  },
  { id: "matic-eth",  pair: "MATIC-ETH",   token0: "MATIC", token1: "ETH"   },
];

const STAKING_DEF: Omit<StakingPool, "apy">[] = [
  { id: "eth-stake",  name: "ETH 2.0 Staking",  asset: "ETH",   minStake: 0.1,   lockDays: 0   },
  { id: "sol-stake",  name: "SOL Validator",     asset: "SOL",   minStake: 1,     lockDays: 0   },
  { id: "bnb-stake",  name: "BNB Earn",          asset: "BNB",   minStake: 0.1,   lockDays: 30  },
  { id: "aave-stake", name: "Aave Safety Module", asset: "AAVE", minStake: 0.1,   lockDays: 10  },
  { id: "atom-stake", name: "Cosmos Staking",    asset: "ATOM",  minStake: 1,     lockDays: 21  },
];

const YIELD_FARM_OPPORTUNITIES: YieldFarmOpportunity[] = [
  { id: "aave-usdc",    protocol: "AAVE",     pool: "USDC Lending",       apy: 4.2,  isLP: false },
  { id: "uni-eth-usdc", protocol: "Uniswap",  pool: "ETH/USDC LP",        apy: 12.0, isLP: true, token0: "ETH", token1: "USDC" },
  { id: "curve-3pool",  protocol: "Curve",    pool: "3pool (DAI/USDC/USDT)", apy: 5.8, isLP: true, token0: "USDC", token1: "DAI" },
  { id: "comp-dai",     protocol: "Compound", pool: "DAI Lending",        apy: 3.5,  isLP: false },
  { id: "bal-8020",     protocol: "Balancer", pool: "80/20 BAL/WETH",     apy: 18.0, isLP: true, token0: "BAL", token1: "WETH" },
];

const NFT_COLLECTIONS_DEF: Omit<NftCollection, "floorPrice" | "volume24h" | "holderCount" | "change24h">[] = [
  { name: "Bored Ape Yacht Club", symbol: "BAYC" },
  { name: "CryptoPunks",          symbol: "PUNK" },
  { name: "Azuki",                symbol: "AZUK" },
  { name: "Pudgy Penguins",       symbol: "PUDG" },
  { name: "Doodles",              symbol: "DOOD" },
];

const DEFI_GLOSSARY = [
  {
    term: "AMM",
    full: "Automated Market Maker",
    def: "A type of decentralized exchange that uses a mathematical formula to price assets. Instead of matching buyers and sellers, users trade against a liquidity pool.",
  },
  {
    term: "Liquidity Pool",
    full: "Liquidity Pool",
    def: "A smart contract containing locked pairs of tokens that users can trade against. Liquidity providers deposit tokens to earn a share of trading fees.",
  },
  {
    term: "Impermanent Loss",
    full: "Impermanent Loss (IL)",
    def: "The temporary loss of funds experienced by liquidity providers when the price ratio of pooled tokens changes. Loss is 'impermanent' because it only realizes when you withdraw.",
  },
  {
    term: "Yield Farming",
    full: "Yield Farming",
    def: "Strategies to maximize returns by moving crypto assets between DeFi protocols to chase the highest APY. Also called liquidity mining.",
  },
  {
    term: "LP Token",
    full: "Liquidity Provider Token",
    def: "A token received when you deposit into a liquidity pool. It represents your share of the pool and is redeemed when you withdraw your assets.",
  },
  {
    term: "DEX",
    full: "Decentralized Exchange",
    def: "A peer-to-peer marketplace where transactions occur directly on-chain using smart contracts, without a central authority. Examples: Uniswap, Curve, SushiSwap.",
  },
  {
    term: "CEX",
    full: "Centralized Exchange",
    def: "A traditional cryptocurrency exchange run by a company (e.g., Coinbase, Binance). Custodial — the exchange holds your funds.",
  },
  {
    term: "Smart Contract",
    full: "Smart Contract",
    def: "Self-executing code stored on a blockchain that automatically enforces and executes agreement terms when predetermined conditions are met.",
  },
];

// ── Data generators ───────────────────────────────────────────────────────────

function generateCryptoRows(seed: number): CryptoRow[] {
  return ASSETS.map((a) => {
    const rng = mulberry32(hashStr(a.symbol) ^ seed);
    const change24h = (rng() - 0.48) * 14; // roughly -7% to +7%
    const change7d  = (rng() - 0.48) * 28;
    const priceMult = 1 + change24h / 100;
    return {
      ...a,
      price:     a.basePrice * priceMult,
      change24h,
      change7d,
      marketCap: a.baseMcap * priceMult,
      volume24h: a.baseVolume * (0.6 + rng() * 0.8),
    };
  });
}

function generatePools(seed: number): Pool[] {
  return POOLS_DEF.map((p) => {
    const rng = mulberry32(hashStr(p.id) ^ seed);
    return {
      ...p,
      apy:     5 + rng() * 45,
      tvl:     20 + rng() * 480,
      fees24h: 2 + rng() * 48,
    };
  });
}

function generateStakingPools(seed: number): StakingPool[] {
  return STAKING_DEF.map((s) => {
    const rng = mulberry32(hashStr(s.id) ^ seed);
    return {
      ...s,
      apy: 8 + rng() * 17,
    };
  });
}

function generateWhales(seed: number): WhaleRow[] {
  const timeBucket = Math.floor(Date.now() / (1000 * 60 * 10)); // 10-min bucket
  const effectiveSeed = seed ^ timeBucket;
  const rng = mulberry32(effectiveSeed);

  const directions: WhaleRow["direction"][] = ["to exchange", "from exchange", "wallet to wallet"];
  const chains = ["Ethereum", "Bitcoin", "Solana", "BNB Chain", "Polygon"];
  const assets  = ["BTC", "ETH", "SOL", "BNB", "MATIC", "LINK", "ARB"];
  const timeAgoOptions = ["2 min ago", "8 min ago", "15 min ago", "23 min ago", "41 min ago", "1h ago", "1h 22m ago"];

  return Array.from({ length: 12 }, (_, i) => {
    const r = mulberry32(effectiveSeed ^ (i * 0x9f3a));
    const walletNum = Math.floor(r() * 0xffffffffffff);
    const wallet = `0x${walletNum.toString(16).padStart(12, "0").slice(0, 4)}...${walletNum.toString(16).slice(-4)}`;
    const asset = assets[Math.floor(r() * assets.length)];
    const amountUSD = 500_000 + r() * 49_500_000;
    const dir = directions[Math.floor(r() * directions.length)];
    const chain = chains[Math.floor(r() * chains.length)];
    const time = timeAgoOptions[Math.floor(r() * timeAgoOptions.length)];
    const hash = `0x${Math.floor(r() * 0xffffffffffff).toString(16).padStart(8, "0")}`;
    void rng; // suppress unused
    return { hash, wallet, amount: amountUSD, asset, direction: dir, chain, timeAgo: time };
  });
}

function generateMiniCandles(ticker: string, seed: number): { o: number; h: number; l: number; c: number }[] {
  const rng = mulberry32(hashStr(ticker) ^ seed);
  const baseAsset = ASSETS.find((a) => a.symbol === ticker.split("/")[0]);
  let price = baseAsset?.basePrice ?? 100;
  return Array.from({ length: 20 }, () => {
    const open = price;
    const move = (rng() - 0.5) * price * 0.04;
    const close = open + move;
    const high = Math.max(open, close) * (1 + rng() * 0.015);
    const low = Math.min(open, close) * (1 - rng() * 0.015);
    price = close;
    return { o: open, h: high, l: low, c: close };
  });
}

function generateNftCollections(seed: number): NftCollection[] {
  return NFT_COLLECTIONS_DEF.map((c) => {
    const rng = mulberry32(hashStr(c.symbol) ^ seed);
    const baseFloor: Record<string, number> = { BAYC: 18, PUNK: 42, AZUK: 7, PUDG: 11, DOOD: 3 };
    const base = baseFloor[c.symbol] ?? 5;
    const change24h = (rng() - 0.48) * 20;
    const floor = base * (1 + change24h / 100);
    return {
      ...c,
      floorPrice:  Math.max(0.1, floor),
      volume24h:   20 + rng() * 480,
      holderCount: Math.floor(2000 + rng() * 8000),
      change24h,
    };
  });
}

interface CryptoRiskMetric {
  symbol: string;
  realizedVol30d: number; // %
  maxDrawdown: number;    // % from ATH
  sharpe: number;         // vs risk-free 4.5%
  ath: number;
  currentPrice: number;
}

function generateRiskMetrics(rows: CryptoRow[], seed: number): CryptoRiskMetric[] {
  const ath: Record<string, number> = {
    BTC: 73750, ETH: 4800, BNB: 720, SOL: 260, ADA: 3.10,
    AVAX: 145, DOT: 55, LINK: 52, UNI: 45, AAVE: 660, MATIC: 2.92,
    ATOM: 44, NEAR: 20, ARB: 8.67, OP: 4.84,
  };
  return rows.map((r) => {
    const rng = mulberry32(hashStr(r.symbol + "risk") ^ seed);
    const vol = 40 + rng() * 80;
    const athPrice = ath[r.symbol] ?? r.basePrice * 3;
    const drawdown = ((r.price - athPrice) / athPrice) * 100;
    const annReturn = r.change7d * 52; // proxy
    const riskFree = 4.5;
    const sharpe = (annReturn - riskFree) / vol;
    return {
      symbol:        r.symbol,
      realizedVol30d: vol,
      maxDrawdown:   drawdown,
      sharpe,
      ath:           athPrice,
      currentPrice:  r.price,
    };
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(n: number): string {
  if (n >= 10000)    return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1)        return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(4)}`;
}

function fmtBil(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}T`;
  return `$${n.toFixed(1)}B`;
}

function fmtMil(n: number): string {
  return `$${n.toFixed(1)}M`;
}

function fmtPct(n: number, digits = 2): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

// Impermanent loss formula: 2*sqrt(r)/(1+r) - 1, r = price ratio change
function calcIL(priceDeltaPct: number): number {
  const r = 1 + priceDeltaPct / 100;
  if (r <= 0) return -100;
  return (2 * Math.sqrt(r) / (1 + r) - 1) * 100;
}

// ── SVG Components ────────────────────────────────────────────────────────────

function MiniCandleChart({ candles }: { candles: { o: number; h: number; l: number; c: number }[] }) {
  const W = 200, H = 60, PAD = 4;
  const prices = candles.flatMap((c) => [c.h, c.l]);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const barW = (W - PAD * 2) / candles.length;

  const toY = (p: number) => PAD + ((maxP - p) / range) * (H - PAD * 2);

  return (
    <svg width={W} height={H} className="block">
      {candles.map((c, i) => {
        const x = PAD + i * barW + barW * 0.15;
        const bw = barW * 0.7;
        const isUp = c.c >= c.o;
        const color = isUp ? "#22c55e" : "#ef4444";
        const bodyTop = toY(Math.max(c.o, c.c));
        const bodyH = Math.max(1, Math.abs(toY(c.o) - toY(c.c)));
        return (
          <g key={i}>
            <line
              x1={x + bw / 2} y1={toY(c.h)}
              x2={x + bw / 2} y2={toY(c.l)}
              stroke={color} strokeWidth={1}
            />
            <rect x={x} y={bodyTop} width={bw} height={bodyH} fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

function DominancePie({ rows }: { rows: CryptoRow[] }) {
  const total = rows.reduce((s, r) => s + r.marketCap, 0);
  const btcMc  = rows.find((r) => r.symbol === "BTC")?.marketCap ?? 0;
  const ethMc  = rows.find((r) => r.symbol === "ETH")?.marketCap ?? 0;
  const otherMc = total - btcMc - ethMc;

  const slices = [
    { label: "BTC", value: btcMc, color: "#f59e0b" },
    { label: "ETH", value: ethMc, color: "#6366f1" },
    { label: "Others", value: otherMc, color: "#64748b" },
  ];

  const CX = 70, CY = 70, R = 55, R_INNER = 30;
  let angle = -Math.PI / 2;

  const arcs = slices.map((s) => {
    const sweep = (s.value / total) * 2 * Math.PI;
    const startAngle = angle;
    angle += sweep;
    const endAngle = angle;
    const x1 = CX + R * Math.cos(startAngle);
    const y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle);
    const y2 = CY + R * Math.sin(endAngle);
    const xi1 = CX + R_INNER * Math.cos(endAngle);
    const yi1 = CY + R_INNER * Math.sin(endAngle);
    const xi2 = CX + R_INNER * Math.cos(startAngle);
    const yi2 = CY + R_INNER * Math.sin(startAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;
    const d = [
      `M ${x1} ${y1}`,
      `A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${xi1} ${yi1}`,
      `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${xi2} ${yi2}`,
      "Z",
    ].join(" ");
    return { ...s, d, pct: (s.value / total) * 100 };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={140} height={140}>
        {arcs.map((a) => (
          <path key={a.label} d={a.d} fill={a.color} opacity={0.85} />
        ))}
      </svg>
      <div className="flex flex-col gap-2">
        {arcs.map((a) => (
          <div key={a.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: a.color }} />
            <span className="text-muted-foreground font-medium w-12">{a.label}</span>
            <span className="tabular-nums font-semibold">{a.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FearGreedGauge({ value }: { value: number }) {
  // value: 0-100
  const W = 160, H = 90, CX = 80, CY = 85, R = 65, STROKE = 14;
  const startAngle = Math.PI;
  const sweepAngle = Math.PI;
  const fraction = value / 100;
  const angle = startAngle + sweepAngle * fraction;

  const sectors = [
    { label: "Extreme Fear", color: "#dc2626", from: 0, to: 0.2 },
    { label: "Fear",         color: "#f97316", from: 0.2, to: 0.4 },
    { label: "Neutral",      color: "#eab308", from: 0.4, to: 0.6 },
    { label: "Greed",        color: "#84cc16", from: 0.6, to: 0.8 },
    { label: "Extreme Greed",color: "#22c55e", from: 0.8, to: 1.0 },
  ];

  function sectorPath(from: number, to: number): string {
    const a1 = startAngle + sweepAngle * from;
    const a2 = startAngle + sweepAngle * to;
    const ri = R - STROKE;
    const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
    const x2 = CX + R * Math.cos(a2), y2 = CY + R * Math.sin(a2);
    const xi1 = CX + ri * Math.cos(a2), yi1 = CY + ri * Math.sin(a2);
    const xi2 = CX + ri * Math.cos(a1), yi2 = CY + ri * Math.sin(a1);
    const lf = (to - from) > 0.5 ? 1 : 0;
    return `M${x1} ${y1} A${R} ${R} 0 ${lf} 1 ${x2} ${y2} L${xi1} ${yi1} A${ri} ${ri} 0 ${lf} 0 ${xi2} ${yi2} Z`;
  }

  // Needle
  const needleLen = R - 2;
  const nx = CX + needleLen * Math.cos(angle);
  const ny = CY + needleLen * Math.sin(angle);

  const label = sectors.find((s) => fraction >= s.from && fraction < s.to)?.label
    ?? (fraction >= 1 ? "Extreme Greed" : "Extreme Fear");
  const needleColor = sectors.find((s) => fraction >= s.from && fraction < s.to)?.color ?? "#eab308";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={W} height={H}>
        {sectors.map((s) => (
          <path key={s.label} d={sectorPath(s.from, s.to)} fill={s.color} opacity={0.8} />
        ))}
        <line x1={CX} y1={CY} x2={nx} y2={ny} stroke={needleColor} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={5} fill={needleColor} />
      </svg>
      <div className="text-center -mt-1">
        <div className="text-2xl font-bold tabular-nums" style={{ color: needleColor }}>{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

// ── Tab: Markets ──────────────────────────────────────────────────────────────

function MarketsTab({ rows, seed }: { rows: CryptoRow[]; seed: number }) {
  const totalMcap = rows.reduce((s, r) => s + r.marketCap, 0);
  const totalVol  = rows.reduce((s, r) => s + r.volume24h, 0);
  const rng       = mulberry32(seed ^ 0xfeed);
  const fearGreed = Math.floor(20 + rng() * 60);

  return (
    <div className="flex flex-col gap-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border/50 bg-card p-3">
          <div className="text-xs text-muted-foreground mb-1">Total Market Cap</div>
          <div className="text-lg font-bold tabular-nums">{fmtBil(totalMcap)}</div>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-3">
          <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
          <div className="text-lg font-bold tabular-nums">{fmtBil(totalVol)}</div>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-3">
          <div className="text-xs text-muted-foreground mb-1">BTC Dominance</div>
          <div className="text-lg font-bold tabular-nums">
            {((rows.find((r) => r.symbol === "BTC")?.marketCap ?? 0) / totalMcap * 100).toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-3">
          <div className="text-xs text-muted-foreground mb-1">Active Assets</div>
          <div className="text-lg font-bold tabular-nums">{rows.length}</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Market Cap Dominance
          </div>
          <DominancePie rows={rows} />
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Fear &amp; Greed Index
          </div>
          <FearGreedGauge value={fearGreed} />
        </div>
      </div>

      {/* Price table */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">#</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Asset</th>
                <th className="py-2.5 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price</th>
                <th className="py-2.5 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">24h</th>
                <th className="py-2.5 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">7d</th>
                <th className="py-2.5 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Market Cap</th>
                <th className="py-2.5 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Volume 24h</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.symbol} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-3 text-muted-foreground tabular-nums text-xs">{i + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-primary w-12">{r.symbol}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-medium text-xs">{fmtPrice(r.price)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={cn("text-xs tabular-nums font-medium", r.change24h >= 0 ? "text-green-500" : "text-red-500")}>
                      {fmtPct(r.change24h)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={cn("text-xs tabular-nums font-medium", r.change7d >= 0 ? "text-green-500" : "text-red-500")}>
                      {fmtPct(r.change7d)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-xs text-muted-foreground hidden md:table-cell">{fmtBil(r.marketCap)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-xs text-muted-foreground hidden lg:table-cell">{fmtBil(r.volume24h)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Trade ────────────────────────────────────────────────────────────────

function TradeTab({ rows, seed }: { rows: CryptoRow[]; seed: number }) {
  const [selectedPair, setSelectedPair] = useState("BTC/USD");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState("");
  const [positions, setPositions] = useState<CryptoPosition[]>([]);

  const ticker = selectedPair.split("/")[0];
  const currentRow = rows.find((r) => r.symbol === ticker);
  const price = currentRow?.price ?? 0;
  const candles = useMemo(() => generateMiniCandles(selectedPair, seed), [selectedPair, seed]);

  const usdValue = parseFloat(qty || "0") * price;
  const existingPos = positions.find((p) => p.symbol === ticker);

  function executeTrade() {
    const parsedQty = parseFloat(qty);
    if (!parsedQty || parsedQty <= 0) return;

    if (side === "buy") {
      setPositions((prev) => {
        const existing = prev.find((p) => p.symbol === ticker);
        if (existing) {
          const newQty = existing.qty + parsedQty;
          const newAvg = (existing.qty * existing.avgPrice + parsedQty * price) / newQty;
          return prev.map((p) =>
            p.symbol === ticker ? { ...p, qty: newQty, avgPrice: newAvg, currentPrice: price } : p
          );
        }
        return [
          ...prev,
          { symbol: ticker, name: currentRow?.name ?? ticker, qty: parsedQty, avgPrice: price, currentPrice: price },
        ];
      });
    } else {
      setPositions((prev) => {
        const existing = prev.find((p) => p.symbol === ticker);
        if (!existing) return prev;
        const newQty = existing.qty - parsedQty;
        if (newQty <= 0.000001) return prev.filter((p) => p.symbol !== ticker);
        return prev.map((p) => (p.symbol === ticker ? { ...p, qty: newQty, currentPrice: price } : p));
      });
    }
    setQty("");
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* Left: Chart + Order entry */}
      <div className="flex flex-col gap-3 lg:flex-1">
        {/* Pair selector */}
        <div className="flex flex-wrap gap-1.5">
          {TRADING_PAIRS.map((pair) => (
            <button
              key={pair}
              type="button"
              onClick={() => setSelectedPair(pair)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                selectedPair === pair
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/50 text-muted-foreground hover:bg-accent/50",
              )}
            >
              {pair}
            </button>
          ))}
        </div>

        {/* Price + chart */}
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-xl font-bold tabular-nums">{fmtPrice(price)}</span>
            <span className={cn("text-sm font-medium tabular-nums", (currentRow?.change24h ?? 0) >= 0 ? "text-green-500" : "text-red-500")}>
              {fmtPct(currentRow?.change24h ?? 0)}
            </span>
          </div>
          <MiniCandleChart candles={candles} />
        </div>

        {/* Order entry */}
        <div className="rounded-lg border border-border/50 bg-card p-4 flex flex-col gap-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Spot Order</div>
          <div className="flex rounded-md border border-border/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setSide("buy")}
              className={cn("flex-1 py-2 text-sm font-semibold transition-colors", side === "buy" ? "bg-green-600 text-white" : "text-muted-foreground hover:bg-accent/50")}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setSide("sell")}
              className={cn("flex-1 py-2 text-sm font-semibold transition-colors", side === "sell" ? "bg-red-600 text-white" : "text-muted-foreground hover:bg-accent/50")}
            >
              Sell
            </button>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Quantity ({ticker})</label>
            <input
              type="number"
              min="0"
              step="0.001"
              placeholder="0.000"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="mt-1 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Estimated value</span>
            <span className="tabular-nums font-medium text-foreground">${usdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {side === "sell" && existingPos && (
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>Available</span>
              <span className="tabular-nums">{existingPos.qty.toFixed(4)} {ticker}</span>
            </div>
          )}

          <button
            type="button"
            onClick={executeTrade}
            disabled={!qty || parseFloat(qty) <= 0}
            className={cn(
              "w-full rounded-md py-2.5 text-sm font-semibold transition-colors disabled:opacity-50",
              side === "buy" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white",
            )}
          >
            {side === "buy" ? "Buy" : "Sell"} {ticker}
          </button>
        </div>
      </div>

      {/* Right: Positions */}
      <div className="lg:w-72 flex flex-col gap-3">
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">My Positions</div>
          {positions.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-6">No open positions</div>
          ) : (
            <div className="flex flex-col gap-2">
              {positions.map((pos) => {
                const liveRow = rows.find((r) => r.symbol === pos.symbol);
                const livePrice = liveRow?.price ?? pos.currentPrice;
                const pnl = (livePrice - pos.avgPrice) * pos.qty;
                const pnlPct = ((livePrice - pos.avgPrice) / pos.avgPrice) * 100;
                return (
                  <div key={pos.symbol} className="rounded-md border border-border/40 p-2.5 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-primary">{pos.symbol}</span>
                      <span className={cn("font-medium tabular-nums", pnl >= 0 ? "text-green-500" : "text-red-500")}>
                        {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex justify-between">
                      <span>{pos.qty.toFixed(4)} @ {fmtPrice(pos.avgPrice)}</span>
                      <span className={cn("tabular-nums", pnlPct >= 0 ? "text-green-500" : "text-red-500")}>
                        {fmtPct(pnlPct)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab: DeFi Simulator ───────────────────────────────────────────────────────

function DeFiTab({ seed }: { seed: number }) {
  const pools        = useMemo(() => generatePools(seed), [seed]);
  const stakingPools = useMemo(() => generateStakingPools(seed), [seed]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [depositAmt, setDepositAmt] = useState("");
  const [lpPositions, setLpPositions] = useState<LPPosition[]>([]);
  const [ilDeltaPct, setIlDeltaPct] = useState("50");

  const estimatedLpTokens = selectedPool && depositAmt
    ? (parseFloat(depositAmt) / selectedPool.tvl / 1000) * 1e6 // synthetic LP token calc
    : 0;
  const dailyYield = selectedPool && depositAmt
    ? (parseFloat(depositAmt) * selectedPool.apy) / 100 / 365
    : 0;

  function addLiquidity() {
    if (!selectedPool || !depositAmt || parseFloat(depositAmt) <= 0) return;
    setLpPositions((prev) => [
      ...prev,
      {
        poolId:     selectedPool.id,
        pair:       selectedPool.pair,
        amount:     parseFloat(depositAmt),
        lpTokens:   estimatedLpTokens,
        dailyYield,
        entryDate:  new Date().toLocaleDateString(),
      },
    ]);
    setDepositAmt("");
    setSelectedPool(null);
  }

  const ilValue = calcIL(parseFloat(ilDeltaPct || "0"));

  return (
    <div className="flex flex-col gap-4">
      {/* Liquidity Pools */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Liquidity Pools</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground">Pool</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground">APY</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground">TVL</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground">24h Fees</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {pools.map((pool) => (
                <tr
                  key={pool.id}
                  className={cn(
                    "border-b border-border/20 last:border-0 transition-colors",
                    selectedPool?.id === pool.id ? "bg-primary/10" : "hover:bg-muted/20",
                  )}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-xs">{pool.pair}</div>
                    <div className="text-xs text-muted-foreground">{pool.token0} / {pool.token1}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-green-500 font-semibold tabular-nums text-xs">{pool.apy.toFixed(1)}%</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-xs tabular-nums text-muted-foreground">{fmtMil(pool.tvl)}</td>
                  <td className="py-2.5 px-3 text-right text-xs tabular-nums text-muted-foreground">${pool.fees24h.toFixed(1)}K</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedPool(selectedPool?.id === pool.id ? null : pool)}
                      className="text-xs rounded-md border border-border/50 px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Liquidity flow */}
      {selectedPool && (
        <div className="rounded-lg border border-primary/30 bg-card p-4 flex flex-col gap-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Add Liquidity — {selectedPool.pair}
          </div>
          <div className="flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-xs text-amber-500">
              Impermanent loss risk: if token prices diverge significantly, your LP position may be worth less than holding outright.
            </span>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Deposit Amount (USD)</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="1000"
              value={depositAmt}
              onChange={(e) => setDepositAmt(e.target.value)}
              className="mt-1 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {depositAmt && parseFloat(depositAmt) > 0 && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-muted/30 p-2.5">
                <div className="text-muted-foreground">LP Tokens Received</div>
                <div className="font-semibold tabular-nums mt-0.5">{estimatedLpTokens.toFixed(2)}</div>
              </div>
              <div className="rounded-md bg-muted/30 p-2.5">
                <div className="text-muted-foreground">Est. Daily Yield</div>
                <div className="font-semibold text-green-500 tabular-nums mt-0.5">${dailyYield.toFixed(2)}</div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={addLiquidity}
            disabled={!depositAmt || parseFloat(depositAmt) <= 0}
            className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Confirm Deposit
          </button>
        </div>
      )}

      {/* My Positions */}
      {lpPositions.length > 0 && (
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">My Positions</div>
          <div className="flex flex-col gap-2">
            {lpPositions.map((pos, i) => (
              <div key={i} className="rounded-md border border-border/40 p-2.5 text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="col-span-2 font-semibold text-primary">{pos.pair}</div>
                <div className="text-muted-foreground">Deposited</div>
                <div className="text-right tabular-nums">${pos.amount.toLocaleString()}</div>
                <div className="text-muted-foreground">LP Tokens</div>
                <div className="text-right tabular-nums">{pos.lpTokens.toFixed(2)}</div>
                <div className="text-muted-foreground">Daily Yield</div>
                <div className="text-right text-green-500 tabular-nums">${pos.dailyYield.toFixed(2)}</div>
                <div className="text-muted-foreground">Since</div>
                <div className="text-right">{pos.entryDate}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staking Pools */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Yield Farming / Staking</div>
        <div className="flex flex-col gap-2">
          {stakingPools.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-md border border-border/30 px-3 py-2.5">
              <div>
                <div className="text-xs font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">Min {s.minStake} {s.asset} · {s.lockDays === 0 ? "Flexible" : `${s.lockDays}d lock`}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-green-500">{s.apy.toFixed(1)}% APY</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IL Calculator */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Impermanent Loss Calculator</div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Token B Price Change vs Token A (%)</label>
            <input
              type="number"
              step="1"
              value={ilDeltaPct}
              onChange={(e) => setIlDeltaPct(e.target.value)}
              className="mt-1 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2.5 text-xs">
            <span className="text-muted-foreground">Impermanent Loss</span>
            <span className={cn("font-bold tabular-nums", ilValue <= -1 ? "text-red-500" : "text-muted-foreground")}>
              {ilValue.toFixed(2)}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            Formula: IL = 2·sqrt(r)/(1+r) − 1, where r is the price ratio change.
            A 50% price move causes ~5.7% IL; 300% move causes ~25% IL.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: On-Chain ─────────────────────────────────────────────────────────────

function OnChainTab({ seed }: { seed: number }) {
  const whales = useMemo(() => generateWhales(seed), [seed]);
  const rng    = useMemo(() => mulberry32(seed ^ 0xc0de), [seed]);

  const ethGas  = useMemo(() => {
    const base = 15 + rng() * 40;
    return { slow: base * 0.85, standard: base, fast: base * 1.35 };
  }, [rng]);

  const networkStats = useMemo(() => ({
    ethTps:    12 + rng() * 8,
    solTps:    2400 + rng() * 800,
    bnbTps:    80 + rng() * 40,
    activeAddr: Math.floor(300_000 + rng() * 200_000),
    txCount:   Math.floor(1_000_000 + rng() * 500_000),
    avgFee:    0.5 + rng() * 4,
  }), [rng]);

  const directionColor = (dir: WhaleRow["direction"]) => {
    if (dir === "to exchange") return "text-red-500";
    if (dir === "from exchange") return "text-green-500";
    return "text-muted-foreground";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Gas tracker */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          ETH Gas Tracker (Gwei)
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Slow",     value: ethGas.slow,     color: "text-green-500",  time: "~3 min" },
            { label: "Standard", value: ethGas.standard, color: "text-amber-500",  time: "~30 sec" },
            { label: "Fast",     value: ethGas.fast,     color: "text-red-500",    time: "~10 sec" },
          ].map((tier) => (
            <div key={tier.label} className="rounded-md border border-border/40 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">{tier.label}</div>
              <div className={cn("text-lg font-bold tabular-nums", tier.color)}>{tier.value.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{tier.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Network stats */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Network Stats</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "ETH TPS",      value: networkStats.ethTps.toFixed(1) },
            { label: "SOL TPS",      value: networkStats.solTps.toFixed(0) },
            { label: "BNB TPS",      value: networkStats.bnbTps.toFixed(0) },
            { label: "Active Addrs", value: networkStats.activeAddr.toLocaleString() },
            { label: "Daily Txns",   value: networkStats.txCount.toLocaleString() },
            { label: "Avg Fee (USD)",value: `$${networkStats.avgFee.toFixed(2)}` },
          ].map((s) => (
            <div key={s.label} className="rounded-md border border-border/30 p-2.5 text-xs">
              <div className="text-muted-foreground">{s.label}</div>
              <div className="font-semibold tabular-nums mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Whale tracker */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Whale Tracker</div>
          <div className="text-xs text-muted-foreground mt-0.5">Large transactions (&gt; $500K)</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/30 bg-muted/20">
                <th className="py-2 px-3 text-left text-muted-foreground font-semibold">Wallet</th>
                <th className="py-2 px-3 text-right text-muted-foreground font-semibold">Amount</th>
                <th className="py-2 px-3 text-left text-muted-foreground font-semibold">Asset</th>
                <th className="py-2 px-3 text-left text-muted-foreground font-semibold">Direction</th>
                <th className="py-2 px-3 text-left text-muted-foreground font-semibold hidden sm:table-cell">Chain</th>
                <th className="py-2 px-3 text-right text-muted-foreground font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {whales.map((w) => (
                <tr key={w.hash} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">{w.wallet}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-medium">
                    ${(w.amount / 1_000_000).toFixed(2)}M
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-primary">{w.asset}</td>
                  <td className={cn("py-2.5 px-3 font-medium", directionColor(w.direction))}>{w.direction}</td>
                  <td className="py-2.5 px-3 text-muted-foreground hidden sm:table-cell">{w.chain}</td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground">{w.timeAgo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Education ────────────────────────────────────────────────────────────

function EducationTab() {
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"glossary" | "howdefi" | "risks">("glossary");

  const RISKS = [
    {
      title: "Smart Contract Risk",
      desc: "Code bugs or exploits in DeFi protocols can drain liquidity pools. Always research audits. Hundreds of millions have been lost to hacks.",
    },
    {
      title: "Rug Pulls",
      desc: "Project developers drain liquidity or sell tokens suddenly. Common with new, unaudited protocols. Check team transparency and lock periods.",
    },
    {
      title: "Impermanent Loss",
      desc: "If pooled asset prices diverge significantly, your LP position may underperform simply holding the assets. This is realized when you withdraw.",
    },
    {
      title: "Regulatory Risk",
      desc: "Crypto regulations are evolving globally. DeFi protocols may be restricted or banned in certain jurisdictions. Always check your local laws.",
    },
    {
      title: "Liquidation Risk",
      desc: "In lending protocols (Aave, Compound), collateral can be liquidated if its value falls below the health factor threshold.",
    },
  ];

  const HOW_DEFI_STEPS = [
    { step: 1, title: "Connect Your Wallet", desc: "Use a non-custodial wallet (MetaMask, Phantom) to interact with DeFi protocols. You hold your own private keys." },
    { step: 2, title: "Choose a Protocol",   desc: "Select a DEX (Uniswap, Curve) or lending protocol (Aave, Compound) based on your strategy." },
    { step: 3, title: "Provide Liquidity",   desc: "Deposit equal values of two tokens into a pool. You receive LP tokens representing your share." },
    { step: 4, title: "Earn Fees",           desc: "Every trade in the pool generates fees distributed proportionally to LP token holders." },
    { step: 5, title: "Claim Rewards",       desc: "Many protocols offer additional token incentives on top of trading fees — this is yield farming." },
    { step: 6, title: "Withdraw",            desc: "Redeem your LP tokens to get back your share of the pool (both tokens) plus accumulated fees." },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Section tabs */}
      <div className="flex gap-1.5">
        {[
          { id: "glossary" as const, label: "DeFi Glossary", icon: <BookOpen className="h-3 w-3" /> },
          { id: "howdefi"  as const, label: "How DeFi Works", icon: <Layers className="h-3 w-3" /> },
          { id: "risks"    as const, label: "Risks",           icon: <AlertTriangle className="h-3 w-3" /> },
        ].map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => setActiveSection(sec.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeSection === sec.id
                ? "bg-primary text-primary-foreground"
                : "border border-border/50 text-muted-foreground hover:bg-accent/50",
            )}
          >
            {sec.icon}
            {sec.label}
          </button>
        ))}
      </div>

      {/* Glossary */}
      {activeSection === "glossary" && (
        <div className="flex flex-col gap-2">
          {DEFI_GLOSSARY.map((g) => (
            <div key={g.term} className="rounded-lg border border-border/50 bg-card overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpandedTerm(expandedTerm === g.term ? null : g.term)}
              >
                <div>
                  <span className="text-sm font-semibold">{g.term}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{g.full !== g.term ? `(${g.full})` : ""}</span>
                </div>
                {expandedTerm === g.term
                  ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                }
              </button>
              {expandedTerm === g.term && (
                <div className="px-4 pb-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{g.def}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* How DeFi Works */}
      {activeSection === "howdefi" && (
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            How DeFi Works — Step by Step
          </div>
          <div className="flex flex-col gap-3">
            {HOW_DEFI_STEPS.map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {s.step}
                </div>
                <div>
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {activeSection === "risks" && (
        <div className="flex flex-col gap-3">
          {RISKS.map((r) => (
            <div key={r.title} className="rounded-lg border border-red-500/20 bg-card p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold mb-1">{r.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page tabs ─────────────────────────────────────────────────────────────────

type PageTab = "markets" | "trade" | "defi" | "onchain" | "education";

const PAGE_TABS: { id: PageTab; label: string; icon: React.ReactNode }[] = [
  { id: "markets",   label: "Markets",       icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { id: "trade",     label: "Trade",         icon: <ArrowUpRight className="h-3.5 w-3.5" /> },
  { id: "defi",      label: "DeFi Simulator",icon: <Droplets className="h-3.5 w-3.5" /> },
  { id: "onchain",   label: "On-Chain",      icon: <Cpu className="h-3.5 w-3.5" /> },
  { id: "education", label: "Education",     icon: <BookOpen className="h-3.5 w-3.5" /> },
];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CryptoPage() {
  const [activeTab, setActiveTab] = useState<PageTab>("markets");
  const seed = useMemo(() => dateSeed(), []);
  const cryptoRows = useMemo(() => generateCryptoRows(seed), [seed]);

  // suppress unused import warnings for icons only used in JSX
  void ArrowDownRight;
  void Zap;
  void Bitcoin;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border/50 bg-background px-4 pt-4 pb-0">
        <div className="flex items-center gap-2 mb-3">
          <Bitcoin className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold">Crypto &amp; DeFi</h1>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 overflow-x-auto">
          {PAGE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "markets"   && <MarketsTab rows={cryptoRows} seed={seed} />}
        {activeTab === "trade"     && <TradeTab rows={cryptoRows} seed={seed} />}
        {activeTab === "defi"      && <DeFiTab seed={seed} />}
        {activeTab === "onchain"   && <OnChainTab seed={seed} />}
        {activeTab === "education" && <EducationTab />}
      </div>
    </div>
  );
}
