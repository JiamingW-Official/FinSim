"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bitcoin,
  CircleDollarSign,
  Database,
  Flame,
  Globe,
  Hash,
  Layers,
  Lock,
  Network,
  Server,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 642004;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Formatting helpers ─────────────────────────────────────────────────────────

function fmtB(n: number): string {
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}

function fmtNum(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

function fmtPct(n: number, d = 2): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`;
}

// ── Generate time-series data ──────────────────────────────────────────────────

function genSeries(base: number, volatility: number, count: number): number[] {
  const arr: number[] = [base];
  for (let i = 1; i < count; i++) {
    const drift = (rand() - 0.48) * volatility;
    arr.push(Math.max(arr[i - 1] * (1 + drift), base * 0.3));
  }
  return arr;
}

const DAYS = 60;

const hashRateSeries = genSeries(600, 0.03, DAYS);
const activeAddrSeries = genSeries(950000, 0.04, DAYS);
const txCountSeries = genSeries(380000, 0.05, DAYS);
const feesSeries = genSeries(12, 0.08, DAYS);

const ethHashRateSeries = genSeries(1200, 0.025, DAYS); // EH/s (stake-adjusted)
const ethActiveAddrSeries = genSeries(440000, 0.045, DAYS);
const ethTxCountSeries = genSeries(1100000, 0.04, DAYS);
const ethFeesSeries = genSeries(5.2, 0.09, DAYS);

// MVRV, NVT, Puell, SOPR series
const mvrvSeries = genSeries(2.1, 0.04, DAYS);
const nvtSeries = genSeries(68, 0.05, DAYS);
const puellSeries = genSeries(1.3, 0.06, DAYS);
const soprSeries = genSeries(1.02, 0.015, DAYS);

// ── Pure SVG sparkline ─────────────────────────────────────────────────────────

function Sparkline({
  data,
  width = 200,
  height = 56,
  color = "#6366f1",
  fillOpacity = 0.12,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
}) {
  const pad = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (width - pad * 2));
  const ys = data.map((v) => pad + ((max - v) / range) * (height - pad * 2));
  const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const areaPath = `${linePath} L${xs[xs.length - 1]},${height - pad} L${xs[0]},${height - pad} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity * 2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${color.replace("#", "")})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={3} fill={color} />
    </svg>
  );
}

// ── SVG stacked bar chart ──────────────────────────────────────────────────────

const UTXO_BANDS = [
  { label: "< 1d", color: "#f43f5e", pct: 4.2 },
  { label: "1d–1w", color: "#fb923c", pct: 6.8 },
  { label: "1w–1m", color: "#facc15", pct: 9.1 },
  { label: "1m–3m", color: "#4ade80", pct: 11.3 },
  { label: "3m–6m", color: "#34d399", pct: 8.7 },
  { label: "6m–1y", color: "#22d3ee", pct: 12.4 },
  { label: "1y–2y", color: "#60a5fa", pct: 14.6 },
  { label: "2y–3y", color: "#818cf8", pct: 10.9 },
  { label: "3y–5y", color: "#a78bfa", pct: 12.2 },
  { label: "5y+", color: "#c084fc", pct: 9.8 },
];

function StackedBarChart() {
  const W = 640;
  const H = 160;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const BAR_COUNT = 12;

  // Generate stacked bands for each month
  const months = Array.from({ length: BAR_COUNT }, (_, mi) => {
    // slightly vary each band's pct across months
    return UTXO_BANDS.map((b) => ({
      ...b,
      pct: Math.max(1, b.pct + (rand() - 0.5) * 3),
    }));
  });

  const barW = (chartW / BAR_COUNT) * 0.72;
  const gap = chartW / BAR_COUNT;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Y-axis gridlines */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const y = padT + chartH - (pct / 100) * chartH;
        return (
          <g key={pct}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#334155" strokeWidth={0.5} />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#64748b">
              {pct}%
            </text>
          </g>
        );
      })}
      {/* Stacked bars */}
      {months.map((bands, mi) => {
        const total = bands.reduce((a, b) => a + b.pct, 0);
        let cumPct = 0;
        const x = padL + mi * gap + (gap - barW) / 2;
        return (
          <g key={mi}>
            {bands.map((band) => {
              const barH = (band.pct / total) * chartH;
              const y = padT + chartH - ((cumPct + band.pct) / total) * chartH;
              cumPct += band.pct;
              return (
                <rect
                  key={band.label}
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  fill={band.color}
                  opacity={0.85}
                />
              );
            })}
            <text
              x={x + barW / 2}
              y={H - padB + 14}
              textAnchor="middle"
              fontSize={8}
              fill="#94a3b8"
            >
              M{mi + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── SVG bar chart (DeFi) ───────────────────────────────────────────────────────

const DEX_PROTOCOLS = [
  { name: "Uniswap v3", vol: 1.82e9, color: "#f43f5e" },
  { name: "Curve Finance", vol: 0.64e9, color: "#818cf8" },
  { name: "PancakeSwap", vol: 0.53e9, color: "#facc15" },
  { name: "dYdX", vol: 0.41e9, color: "#4ade80" },
  { name: "Balancer", vol: 0.29e9, color: "#22d3ee" },
  { name: "SushiSwap", vol: 0.18e9, color: "#fb923c" },
  { name: "Velodrome", vol: 0.12e9, color: "#a78bfa" },
];

const CEX_VOL = 24.6e9;

function DexCexBarChart() {
  const W = 640;
  const H = 200;
  const padL = 80;
  const padR = 16;
  const padT = 16;
  const padB = 8;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const allItems = [
    { name: "CEX (Agg.)", vol: CEX_VOL, color: "#334155" },
    ...DEX_PROTOCOLS,
  ];
  const maxVol = allItems[0].vol;
  const barH = chartH / allItems.length - 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 25, 50, 75, 100].map((pct) => {
        const x = padL + (pct / 100) * chartW;
        return (
          <g key={pct}>
            <line x1={x} x2={x} y1={padT} y2={H - padB} stroke="#334155" strokeWidth={0.5} />
          </g>
        );
      })}
      {allItems.map((item, i) => {
        const barW = (item.vol / maxVol) * chartW;
        const y = padT + i * (barH + 4);
        return (
          <g key={item.name}>
            <text x={padL - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
              {item.name}
            </text>
            <rect x={padL} y={y} width={barW} height={barH} fill={item.color} rx={2} opacity={0.85} />
            <text x={padL + barW + 4} y={y + barH / 2 + 4} fontSize={9} fill="#cbd5e1">
              {fmtB(item.vol)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── SVG donut chart (pool distribution) ───────────────────────────────────────

const MINING_POOLS = [
  { name: "Foundry USA", pct: 28.4, color: "#6366f1" },
  { name: "AntPool", pct: 19.7, color: "#22d3ee" },
  { name: "F2Pool", pct: 14.2, color: "#4ade80" },
  { name: "ViaBTC", pct: 11.8, color: "#facc15" },
  { name: "Binance Pool", pct: 9.3, color: "#fb923c" },
  { name: "BTC.com", pct: 7.1, color: "#f43f5e" },
  { name: "Others", pct: 9.5, color: "#475569" },
];

function DonutChart() {
  const cx = 110;
  const cy = 110;
  const r = 80;
  const innerR = 52;
  const total = MINING_POOLS.reduce((a, b) => a + b.pct, 0);
  let cumAngle = -Math.PI / 2;

  const slices = MINING_POOLS.map((pool) => {
    const angle = (pool.pct / total) * 2 * Math.PI;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    return {
      ...pool,
      d: `M${x1},${y1} A${r},${r},0,${largeArc},1,${x2},${y2} L${ix1},${iy1} A${innerR},${innerR},0,${largeArc},0,${ix2},${iy2} Z`,
    };
  });

  return (
    <svg viewBox="0 0 220 220" className="w-48 h-48">
      {slices.map((s) => (
        <path key={s.name} d={s.d} fill={s.color} stroke="#0f172a" strokeWidth={1.5} />
      ))}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize={11} fill="#94a3b8">
        Hash rate
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={15} fontWeight="bold" fill="#e2e8f0">
        600
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fontSize={10} fill="#64748b">
        EH/s
      </text>
    </svg>
  );
}

// ── SVG signal chart with zones ────────────────────────────────────────────────

interface SignalChartProps {
  data: number[];
  label: string;
  overbought: number;
  oversold: number;
  color: string;
  min?: number;
  max?: number;
}

function SignalChart({ data, label, overbought, oversold, color, min, max }: SignalChartProps) {
  const W = 400;
  const H = 90;
  const padL = 36;
  const padR = 12;
  const padT = 10;
  const padB = 18;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const dataMin = min ?? Math.min(...data) * 0.95;
  const dataMax = max ?? Math.max(...data) * 1.05;
  const range = dataMax - dataMin || 1;

  const toY = (v: number) => padT + ((dataMax - v) / range) * chartH;
  const toX = (i: number) => padL + (i / (data.length - 1)) * chartW;

  const obY = toY(overbought);
  const osY = toY(oversold);
  const linePath = data.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Overbought zone */}
      <rect x={padL} y={padT} width={chartW} height={obY - padT} fill="#f43f5e" opacity={0.08} />
      {/* Oversold zone */}
      <rect x={padL} y={osY} width={chartW} height={H - padB - osY} fill="#4ade80" opacity={0.08} />
      {/* Zone lines */}
      <line x1={padL} x2={W - padR} y1={obY} y2={obY} stroke="#f43f5e" strokeWidth={0.8} strokeDasharray="3,2" />
      <line x1={padL} x2={W - padR} y1={osY} y2={osY} stroke="#4ade80" strokeWidth={0.8} strokeDasharray="3,2" />
      {/* Y axis labels */}
      <text x={padL - 4} y={obY + 3} textAnchor="end" fontSize={8} fill="#f43f5e">
        {overbought}
      </text>
      <text x={padL - 4} y={osY + 3} textAnchor="end" fontSize={8} fill="#4ade80">
        {oversold}
      </text>
      {/* Data line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={toX(data.length - 1)} cy={toY(data[data.length - 1])} r={3} fill={color} />
      {/* Label */}
      <text x={padL} y={H - 4} fontSize={9} fill="#64748b">
        {label}
      </text>
      <text x={W - padR} y={H - 4} textAnchor="end" fontSize={9} fontWeight="600" fill={color}>
        {data[data.length - 1].toFixed(2)}
      </text>
    </svg>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
}

function StatCard({ label, value, change, sub, icon, color = "text-indigo-400" }: StatCardProps) {
  const isPos = (change ?? 0) >= 0;
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className={cn("p-2 rounded-lg bg-muted", color)}>{icon}</span>
          {change !== undefined && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs border-0",
                isPos ? "text-emerald-400 bg-emerald-900/30" : "text-red-400 bg-red-900/30"
              )}
            >
              {isPos ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {fmtPct(change ?? 0)}
            </Badge>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── Whale wallet data ──────────────────────────────────────────────────────────

interface WhaleEntry {
  address: string;
  balance: string;
  change24h: number;
  label: string;
  type: "accumulating" | "distributing" | "dormant";
}

const WHALE_WALLETS: WhaleEntry[] = [
  { address: "1P5ZED...kQnT", balance: "94,820 BTC", change24h: 0, label: "Binance Hot", type: "dormant" },
  { address: "3FZbgi...J4xS", balance: "62,310 BTC", change24h: 1240, label: "MicroStrategy", type: "accumulating" },
  { address: "bc1q9x...7mPr", balance: "47,900 BTC", change24h: -580, label: "Unknown", type: "distributing" },
  { address: "1HQ3Go...NcKp", balance: "41,200 BTC", change24h: 0, label: "Satoshi (est.)", type: "dormant" },
  { address: "3E5RvH...2bWq", balance: "38,750 BTC", change24h: 2100, label: "Galaxy Digital", type: "accumulating" },
  { address: "1FeexV...GEMd", balance: "31,000 BTC", change24h: -1200, label: "OKX Reserve", type: "distributing" },
  { address: "bc1qar...vCMf", balance: "28,400 BTC", change24h: 450, label: "Grayscale GBTC", type: "accumulating" },
  { address: "1Ay8uM...jRtK", balance: "22,100 BTC", change24h: 0, label: "Unknown", type: "dormant" },
];

// ── DeFi protocol TVL data ─────────────────────────────────────────────────────

interface TVLEntry {
  protocol: string;
  chain: string;
  tvl: number;
  change7d: number;
  category: string;
}

const TVL_DATA: TVLEntry[] = [
  { protocol: "Lido", chain: "Ethereum", tvl: 28.4e9, change7d: 4.2, category: "Liquid Staking" },
  { protocol: "AAVE v3", chain: "Multi-chain", tvl: 12.8e9, change7d: 2.1, category: "Lending" },
  { protocol: "Uniswap v3", chain: "Multi-chain", tvl: 6.3e9, change7d: -1.4, category: "DEX" },
  { protocol: "EigenLayer", chain: "Ethereum", tvl: 14.7e9, change7d: 8.6, category: "Restaking" },
  { protocol: "Curve Finance", chain: "Multi-chain", tvl: 3.8e9, change7d: 1.7, category: "DEX" },
  { protocol: "MakerDAO", chain: "Ethereum", tvl: 8.2e9, change7d: 0.9, category: "CDP" },
  { protocol: "Pendle", chain: "Multi-chain", tvl: 4.1e9, change7d: 12.3, category: "Yield" },
  { protocol: "Compound v3", chain: "Multi-chain", tvl: 3.1e9, change7d: -0.6, category: "Lending" },
  { protocol: "JupiterAgg", chain: "Solana", tvl: 2.4e9, change7d: 5.8, category: "DEX" },
  { protocol: "Morpho Blue", chain: "Ethereum", tvl: 1.9e9, change7d: 18.2, category: "Lending" },
];

// ── Stablecoin supply data ─────────────────────────────────────────────────────

const STABLECOINS = [
  { name: "USDT", supply: 108.4e9, color: "#4ade80", pct: 47.1 },
  { name: "USDC", supply: 44.2e9, color: "#60a5fa", pct: 19.2 },
  { name: "DAI/USDS", supply: 8.7e9, color: "#facc15", pct: 3.8 },
  { name: "FDUSD", supply: 6.3e9, color: "#fb923c", pct: 2.7 },
  { name: "FRAX", supply: 3.1e9, color: "#a78bfa", pct: 1.3 },
  { name: "Others", supply: 59.3e9, color: "#475569", pct: 25.9 },
];

// ── Main page ──────────────────────────────────────────────────────────────────

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function OnchainPage() {
  const [activeTab, setActiveTab] = useState("network");

  // Compute latest values and 30d changes
  const networkStats = useMemo(() => {
    const last = (arr: number[]) => arr[arr.length - 1];
    const pct30 = (arr: number[]) => ((last(arr) - arr[arr.length - 30]) / arr[arr.length - 30]) * 100;
    return {
      btcHashRate: last(hashRateSeries),
      btcHashRateChg: pct30(hashRateSeries),
      btcActiveAddr: last(activeAddrSeries),
      btcActiveAddrChg: pct30(activeAddrSeries),
      btcTxCount: last(txCountSeries),
      btcTxCountChg: pct30(txCountSeries),
      btcFees: last(feesSeries),
      btcFeesChg: pct30(feesSeries),
    };
  }, []);

  const signalStats = useMemo(() => {
    const last = (arr: number[]) => arr[arr.length - 1];
    return {
      mvrv: last(mvrvSeries),
      nvt: last(nvtSeries),
      puell: last(puellSeries),
      sopr: last(soprSeries),
    };
  }, []);

  // exchange flow data
  const exchangeInflow = 14820;
  const exchangeOutflow = 12340;
  const netFlow = exchangeInflow - exchangeOutflow;

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Network className="w-6 h-6 text-indigo-400" />
            On-Chain Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Blockchain intelligence — BTC &amp; ETH network data, DeFi metrics, miner &amp; validator health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-emerald-400 border-emerald-800 bg-emerald-900/20 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 inline-block" />
            Live · 28 Mar 2026
          </Badge>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border h-10 mb-6">
            <TabsTrigger value="network" className="data-[state=active]:bg-indigo-600 text-xs px-3">
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              Network Health
            </TabsTrigger>
            <TabsTrigger value="holders" className="data-[state=active]:bg-indigo-600 text-xs px-3">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Holder Analysis
            </TabsTrigger>
            <TabsTrigger value="defi" className="data-[state=active]:bg-indigo-600 text-xs px-3">
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              DeFi Metrics
            </TabsTrigger>
            <TabsTrigger value="mining" className="data-[state=active]:bg-indigo-600 text-xs px-3">
              <Server className="w-3.5 h-3.5 mr-1.5" />
              Mining &amp; Validators
            </TabsTrigger>
            <TabsTrigger value="signals" className="data-[state=active]:bg-indigo-600 text-xs px-3">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Market Signals
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Network Health ─────────────────────────────────────────── */}
          <TabsContent value="network" className="data-[state=inactive]:hidden">
            <div className="flex flex-col gap-6">
              {/* BTC stat cards */}
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Bitcoin className="w-4 h-4 text-amber-400" />
                  Bitcoin Network
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Hash Rate"
                    value={`${networkStats.btcHashRate.toFixed(0)} EH/s`}
                    change={networkStats.btcHashRateChg}
                    sub="30-day change"
                    icon={<Hash className="w-4 h-4" />}
                    color="text-amber-400"
                  />
                  <StatCard
                    label="Active Addresses"
                    value={fmtNum(networkStats.btcActiveAddr)}
                    change={networkStats.btcActiveAddrChg}
                    sub="Unique daily senders"
                    icon={<Users className="w-4 h-4" />}
                    color="text-primary"
                  />
                  <StatCard
                    label="Daily Transactions"
                    value={fmtNum(networkStats.btcTxCount)}
                    change={networkStats.btcTxCountChg}
                    sub="Confirmed txs"
                    icon={<Activity className="w-4 h-4" />}
                    color="text-emerald-400"
                  />
                  <StatCard
                    label="Avg Fee (sats/vB)"
                    value={`${networkStats.btcFees.toFixed(1)} s/vB`}
                    change={networkStats.btcFeesChg}
                    sub="Median fee rate"
                    icon={<CircleDollarSign className="w-4 h-4" />}
                    color="text-primary"
                  />
                </div>
              </div>

              {/* Sparkline charts */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Hash Rate (EH/s)", data: hashRateSeries, color: "#f59e0b" },
                  { title: "Active Addresses", data: activeAddrSeries, color: "#60a5fa" },
                  { title: "Transaction Count", data: txCountSeries, color: "#4ade80" },
                  { title: "Fee Rate (sats/vB)", data: feesSeries, color: "#a78bfa" },
                ].map((chart) => (
                  <Card key={chart.title} className="bg-card border-border">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-xs text-muted-foreground font-medium">{chart.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <Sparkline data={chart.data} width={280} height={72} color={chart.color} />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* BTC vs ETH comparison */}
              <Card className="bg-card border-border border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-muted-foreground">
                    BTC vs ETH — Network Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-xs text-muted-foreground font-medium">Metric</th>
                          <th className="text-right py-2 text-xs font-medium text-amber-400">Bitcoin</th>
                          <th className="text-right py-2 text-xs font-medium text-indigo-400">Ethereum</th>
                          <th className="text-right py-2 text-xs text-muted-foreground font-medium">Leader</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {[
                          {
                            metric: "Hash Rate / Stake",
                            btc: `${hashRateSeries[hashRateSeries.length - 1].toFixed(0)} EH/s`,
                            eth: `${ethHashRateSeries[ethHashRateSeries.length - 1].toFixed(0)} EH/s equiv.`,
                            leader: "BTC",
                          },
                          {
                            metric: "Active Addresses",
                            btc: fmtNum(activeAddrSeries[activeAddrSeries.length - 1]),
                            eth: fmtNum(ethActiveAddrSeries[ethActiveAddrSeries.length - 1]),
                            leader: "ETH",
                          },
                          {
                            metric: "Daily Transactions",
                            btc: fmtNum(txCountSeries[txCountSeries.length - 1]),
                            eth: fmtNum(ethTxCountSeries[ethTxCountSeries.length - 1]),
                            leader: "ETH",
                          },
                          {
                            metric: "Avg Fee",
                            btc: `${feesSeries[feesSeries.length - 1].toFixed(1)} s/vB`,
                            eth: `${ethFeesSeries[ethFeesSeries.length - 1].toFixed(1)} Gwei`,
                            leader: "ETH",
                          },
                          { metric: "Market Cap", btc: "$1.92T", eth: "$456B", leader: "BTC" },
                          { metric: "Finality", btc: "~60 min", eth: "~12 sec", leader: "ETH" },
                          { metric: "Issuance / yr", btc: "~1.7%", eth: "~0.6%", leader: "ETH" },
                          { metric: "Validators / Nodes", btc: "18,400 nodes", eth: "1.04M validators", leader: "ETH" },
                        ].map((row) => (
                          <tr key={row.metric} className="hover:bg-muted/30 transition-colors">
                            <td className="py-2 text-muted-foreground text-xs">{row.metric}</td>
                            <td className="py-2 text-right text-xs text-amber-300 font-mono">{row.btc}</td>
                            <td className="py-2 text-right text-xs text-indigo-300 font-mono">{row.eth}</td>
                            <td className="py-2 text-right">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs border-0",
                                  row.leader === "BTC"
                                    ? "text-amber-400 bg-amber-900/20"
                                    : "text-indigo-400 bg-indigo-900/20"
                                )}
                              >
                                {row.leader}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab 2: Holder Analysis ────────────────────────────────────────── */}
          <TabsContent value="holders" className="data-[state=inactive]:hidden">
            <div className="flex flex-col gap-6">
              {/* UTXO Age Bands */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                    HODLer Waves — UTXO Age Bands (12-Month View)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Proportion of BTC supply last moved within each time band. Rising long-term bands = conviction holding.
                  </p>
                </CardHeader>
                <CardContent>
                  <StackedBarChart />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {UTXO_BANDS.map((b) => (
                      <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: b.color }} />
                        {b.label}
                        <span className="text-muted-foreground">{b.pct.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Exchange flow */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  label="Exchange Inflow (24h)"
                  value={`${fmtNum(exchangeInflow)} BTC`}
                  sub="Coins moving to exchanges"
                  icon={<TrendingDown className="w-4 h-4" />}
                  color="text-red-400"
                  change={3.2}
                />
                <StatCard
                  label="Exchange Outflow (24h)"
                  value={`${fmtNum(exchangeOutflow)} BTC`}
                  sub="Coins leaving exchanges"
                  icon={<TrendingUp className="w-4 h-4" />}
                  color="text-emerald-400"
                  change={-1.4}
                />
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="p-2 rounded-lg bg-muted text-indigo-400">
                        <BarChart3 className="w-4 h-4" />
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs border-0",
                          netFlow > 0 ? "text-red-400 bg-red-900/30" : "text-emerald-400 bg-emerald-900/30"
                        )}
                      >
                        {netFlow > 0 ? "Net Inflow" : "Net Outflow"}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {netFlow > 0 ? "+" : ""}
                      {fmtNum(netFlow)} BTC
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Net Exchange Flow (24h)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Positive = bearish pressure</p>
                  </CardContent>
                </Card>
              </div>

              {/* Whale wallet tracker */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Whale Wallet Tracker — Top BTC Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-xs text-muted-foreground font-medium">Address</th>
                          <th className="text-left py-2 text-xs text-muted-foreground font-medium">Label</th>
                          <th className="text-right py-2 text-xs text-muted-foreground font-medium">Balance</th>
                          <th className="text-right py-2 text-xs text-muted-foreground font-medium">24h Change</th>
                          <th className="text-right py-2 text-xs text-muted-foreground font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {WHALE_WALLETS.map((w) => (
                          <tr key={w.address} className="hover:bg-muted/30 transition-colors">
                            <td className="py-2 text-xs font-mono text-muted-foreground">{w.address}</td>
                            <td className="py-2 text-xs text-muted-foreground">{w.label}</td>
                            <td className="py-2 text-right text-xs font-mono text-foreground">{w.balance}</td>
                            <td className="py-2 text-right text-xs font-mono">
                              <span
                                className={cn(
                                  w.change24h > 0
                                    ? "text-emerald-400"
                                    : w.change24h < 0
                                    ? "text-red-400"
                                    : "text-muted-foreground"
                                )}
                              >
                                {w.change24h > 0 ? "+" : ""}
                                {w.change24h !== 0 ? `${fmtNum(Math.abs(w.change24h))} BTC` : "—"}
                              </span>
                            </td>
                            <td className="py-2 text-right">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs border-0",
                                  w.type === "accumulating"
                                    ? "text-emerald-400 bg-emerald-900/20"
                                    : w.type === "distributing"
                                    ? "text-red-400 bg-red-900/20"
                                    : "text-muted-foreground bg-muted"
                                )}
                              >
                                {w.type}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab 3: DeFi Metrics ───────────────────────────────────────────── */}
          <TabsContent value="defi" className="data-[state=inactive]:hidden">
            <div className="flex flex-col gap-6">
              {/* Summary stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total TVL (DeFi)"
                  value="$107.4B"
                  change={3.8}
                  sub="All chains combined"
                  icon={<Lock className="w-4 h-4" />}
                  color="text-indigo-400"
                />
                <StatCard
                  label="Stablecoin Supply"
                  value="$230B"
                  change={1.2}
                  sub="All stablecoins"
                  icon={<CircleDollarSign className="w-4 h-4" />}
                  color="text-emerald-400"
                />
                <StatCard
                  label="DEX 24h Volume"
                  value="$4.0B"
                  change={-2.1}
                  sub="Across all DEXes"
                  icon={<BarChart3 className="w-4 h-4" />}
                  color="text-amber-400"
                />
                <StatCard
                  label="DEX / CEX Ratio"
                  value="16.3%"
                  change={0.4}
                  sub="DEX share of spot vol"
                  icon={<Globe className="w-4 h-4" />}
                  color="text-muted-foreground"
                />
              </div>

              {/* TVL by protocol table */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    TVL by Protocol — Top 10
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-xs text-muted-foreground font-medium">#</th>
                          <th className="text-left py-2 text-xs text-muted-foreground font-medium">Protocol</th>
                          <th className="text-left py-2 text-xs text-muted-foreground font-medium">Chain</th>
                          <th className="text-left py-2 text-xs text-muted-foreground font-medium">Category</th>
                          <th className="text-right py-2 text-xs text-muted-foreground font-medium">TVL</th>
                          <th className="text-right py-2 text-xs text-muted-foreground font-medium">7d Change</th>
                          <th className="text-right py-2 text-xs text-muted-foreground font-medium">Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {TVL_DATA.map((row, i) => {
                          const totalTVL = TVL_DATA.reduce((a, b) => a + b.tvl, 0);
                          const share = (row.tvl / totalTVL) * 100;
                          return (
                            <tr key={row.protocol} className="hover:bg-muted/30 transition-colors">
                              <td className="py-2 text-xs text-muted-foreground font-mono">{i + 1}</td>
                              <td className="py-2 text-xs font-medium text-foreground">{row.protocol}</td>
                              <td className="py-2 text-xs text-muted-foreground">{row.chain}</td>
                              <td className="py-2">
                                <Badge variant="outline" className="text-xs border-border text-muted-foreground bg-muted">
                                  {row.category}
                                </Badge>
                              </td>
                              <td className="py-2 text-right text-xs font-mono text-foreground">{fmtB(row.tvl)}</td>
                              <td className="py-2 text-right text-xs font-mono">
                                <span className={row.change7d >= 0 ? "text-emerald-400" : "text-red-400"}>
                                  {fmtPct(row.change7d)}
                                </span>
                              </td>
                              <td className="py-2 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-xs text-muted-foreground">{share.toFixed(1)}%</span>
                                  <div className="w-16">
                                    <Progress value={share} className="h-1.5 bg-muted" />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Stablecoin breakdown */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Stablecoin Supply Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {STABLECOINS.map((sc) => (
                      <div key={sc.name} className="flex items-center gap-3">
                        <span className="w-12 text-xs font-medium text-muted-foreground">{sc.name}</span>
                        <div className="flex-1">
                          <Progress
                            value={sc.pct}
                            className="h-3 bg-muted"
                            style={{ "--progress-color": sc.color } as React.CSSProperties}
                          />
                        </div>
                        <span className="w-20 text-right text-xs font-mono text-muted-foreground">{fmtB(sc.supply)}</span>
                        <span className="w-10 text-right text-xs text-muted-foreground">{sc.pct}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* DEX vs CEX bar chart */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    DEX Volume vs CEX — 24h Spot Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DexCexBarChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab 4: Mining & Validators ────────────────────────────────────── */}
          <TabsContent value="mining" className="data-[state=inactive]:hidden">
            <div className="flex flex-col gap-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Miner Revenue (24h)"
                  value="$46.2M"
                  change={2.1}
                  sub="Block reward + fees"
                  icon={<Flame className="w-4 h-4" />}
                  color="text-orange-400"
                />
                <StatCard
                  label="Mining Difficulty"
                  value="88.1T"
                  change={0.9}
                  sub="Next adj. in 8 days"
                  icon={<Database className="w-4 h-4" />}
                  color="text-primary"
                />
                <StatCard
                  label="ETH Validators"
                  value="1.04M"
                  change={0.6}
                  sub="Active on beacon chain"
                  icon={<Shield className="w-4 h-4" />}
                  color="text-indigo-400"
                />
                <StatCard
                  label="ETH Staking Ratio"
                  value="27.4%"
                  change={0.3}
                  sub="% of ETH supply staked"
                  icon={<Lock className="w-4 h-4" />}
                  color="text-emerald-400"
                />
              </div>

              {/* Pool distribution + details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Mining Pool Distribution (30d)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <DonutChart />
                      <div className="flex-1 space-y-2">
                        {MINING_POOLS.map((pool) => (
                          <div key={pool.name} className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                              style={{ background: pool.color }}
                            />
                            <span className="text-xs text-muted-foreground flex-1">{pool.name}</span>
                            <div className="w-24">
                              <Progress value={pool.pct} className="h-1.5 bg-muted" />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">{pool.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      ETH Staking Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Lido (stETH)", pct: 31.2, color: "#4ade80" },
                      { label: "Coinbase (cbETH)", pct: 14.8, color: "#60a5fa" },
                      { label: "Binance (BETH)", pct: 8.3, color: "#facc15" },
                      { label: "Rocket Pool", pct: 7.1, color: "#fb923c" },
                      { label: "Frax Finance", pct: 3.4, color: "#a78bfa" },
                      { label: "Solo Stakers", pct: 16.9, color: "#34d399" },
                      { label: "Other", pct: 18.3, color: "#475569" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                          style={{ background: item.color }}
                        />
                        <span className="text-xs text-muted-foreground flex-1 min-w-0 truncate">{item.label}</span>
                        <div className="w-28">
                          <Progress value={item.pct} className="h-2 bg-muted" />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right">{item.pct}%</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Total ETH Staked</span>
                        <span className="text-foreground font-mono">33.2M ETH</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Annualized Reward</span>
                        <span className="text-emerald-400 font-mono">+3.8% APR</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Withdrawal Queue</span>
                        <span className="text-muted-foreground font-mono">~2,400 ETH</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Miner revenue sparkline */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Miner Revenue (60-Day Trend)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Sparkline
                    data={genSeries(46e6, 0.05, DAYS)}
                    width={640}
                    height={80}
                    color="#f97316"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab 5: Market Signals ─────────────────────────────────────────── */}
          <TabsContent value="signals" className="data-[state=inactive]:hidden">
            <div className="flex flex-col gap-6">
              {/* Signal summary cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: "MVRV Ratio",
                    value: signalStats.mvrv.toFixed(2),
                    threshold: { ob: 3.5, os: 1.0 },
                    desc: "Market Val / Realized Val",
                    icon: <BarChart3 className="w-4 h-4" />,
                    color: "text-primary",
                  },
                  {
                    name: "NVT Signal",
                    value: signalStats.nvt.toFixed(1),
                    threshold: { ob: 150, os: 45 },
                    desc: "Network Value / Txn Volume",
                    icon: <Activity className="w-4 h-4" />,
                    color: "text-primary",
                  },
                  {
                    name: "Puell Multiple",
                    value: signalStats.puell.toFixed(2),
                    threshold: { ob: 4.0, os: 0.5 },
                    desc: "Miner Revenue / 365d MA",
                    icon: <Zap className="w-4 h-4" />,
                    color: "text-amber-400",
                  },
                  {
                    name: "SOPR",
                    value: signalStats.sopr.toFixed(3),
                    threshold: { ob: 1.05, os: 0.97 },
                    desc: "Spent Output Profit Ratio",
                    icon: <TrendingUp className="w-4 h-4" />,
                    color: "text-emerald-400",
                  },
                ].map((sig) => {
                  const numVal = parseFloat(sig.value);
                  const isOB = numVal >= sig.threshold.ob;
                  const isOS = numVal <= sig.threshold.os;
                  const zone = isOB ? "overbought" : isOS ? "oversold" : "neutral";
                  return (
                    <Card key={sig.name} className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className={cn("p-2 rounded-lg bg-muted", sig.color)}>{sig.icon}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs border-0",
                              zone === "overbought"
                                ? "text-red-400 bg-red-900/30"
                                : zone === "oversold"
                                ? "text-emerald-400 bg-emerald-900/30"
                                : "text-muted-foreground bg-muted"
                            )}
                          >
                            {zone}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-foreground mt-2">{sig.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{sig.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{sig.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Signal charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-muted-foreground font-medium">MVRV Ratio (60d)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SignalChart
                      data={mvrvSeries}
                      label="MVRV Ratio"
                      overbought={3.5}
                      oversold={1.0}
                      color="#60a5fa"
                      min={0.5}
                      max={5}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      MVRV &gt; 3.5 = historically overbought (cycle tops). &lt; 1.0 = capitulation zone.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-muted-foreground font-medium">NVT Signal (60d)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SignalChart
                      data={nvtSeries}
                      label="NVT Signal"
                      overbought={150}
                      oversold={45}
                      color="#a78bfa"
                      min={20}
                      max={200}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      High NVT = network overvalued vs on-chain activity. Low NVT = undervalued.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-muted-foreground font-medium">Puell Multiple (60d)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SignalChart
                      data={puellSeries}
                      label="Puell Multiple"
                      overbought={4.0}
                      oversold={0.5}
                      color="#f59e0b"
                      min={0}
                      max={6}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Measures miner profitability vs historical average. Extreme highs precede sell pressure.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-muted-foreground font-medium">SOPR (60d)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SignalChart
                      data={soprSeries}
                      label="SOPR"
                      overbought={1.05}
                      oversold={0.97}
                      color="#4ade80"
                      min={0.93}
                      max={1.1}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      SOPR &gt; 1 = coins sold at profit. Dropping below 1 = sellers capitulating (potential reversal).
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Signal interpretation guide */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    On-Chain Signal Interpretation Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[
                      {
                        signal: "MVRV Ratio",
                        bull: "Value &lt; 1.5 during corrections",
                        bear: "Value &gt; 3.5 after extended rallies",
                        neutral: "1.5 – 3.5 = fair value range",
                        color: "#60a5fa",
                      },
                      {
                        signal: "NVT Signal",
                        bull: "Falling NVT during price rise = organic demand",
                        bear: "Rising NVT = speculative premium building",
                        neutral: "45 – 150 = normal operating range",
                        color: "#a78bfa",
                      },
                      {
                        signal: "Puell Multiple",
                        bull: "0.3 – 0.5 zone = miner capitulation, accumulate",
                        bear: "4.0+ zone = miners selling aggressively",
                        neutral: "0.5 – 4.0 = neutral miner behavior",
                        color: "#f59e0b",
                      },
                      {
                        signal: "SOPR",
                        bull: "Bouncing off 1.0 support in bull market",
                        bear: "Consistent below 1.0 = bear market selling",
                        neutral: "Oscillating around 1.0 = healthy market",
                        color: "#4ade80",
                      },
                    ].map((item) => (
                      <div
                        key={item.signal}
                        className="p-3 rounded-lg border border-border bg-background"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                          <span className="text-xs font-medium text-foreground">{item.signal}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-emerald-400">
                            <span className="text-muted-foreground mr-1">Bull:</span>
                            <span dangerouslySetInnerHTML={{ __html: item.bull }} />
                          </p>
                          <p className="text-xs text-red-400">
                            <span className="text-muted-foreground mr-1">Bear:</span>
                            {item.bear}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="text-muted-foreground mr-1">Neutral:</span>
                            {item.neutral}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
