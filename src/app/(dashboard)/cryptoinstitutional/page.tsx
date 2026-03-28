"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  DollarSign,
  BarChart2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Cpu,
  AlertTriangle,
  RefreshCw,
  Wallet,
  PieChart,
  GitMerge,
  Clock,
} from "lucide-react";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 805;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed(seed: number = 805) {
  s = seed;
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface CustodyAllocation {
  label: string;
  pct: number;
  color: string;
  description: string;
}

interface CryptoAllocation {
  symbol: string;
  name: string;
  pct: number;
  aum: number;
  color: string;
}

interface InstitutionalMetric {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

interface OTCOrder {
  id: string;
  side: "buy" | "sell";
  asset: string;
  size: number;
  price: number;
  premium: number;
  settlementHrs: number;
  counterparty: string;
  tier: "tier1" | "tier2" | "tier3";
}

interface OTCBookLevel {
  price: number;
  size: number;
  cumSize: number;
  premiumBps: number;
}

interface PerpContract {
  symbol: string;
  fundingRate: number;
  openInterest: number;
  volume24h: number;
  basis: number;
  longShortRatio: number;
  nextFunding: string;
}

interface FuturesTerm {
  expiry: string;
  daysToExpiry: number;
  price: number;
  basis: number;
  annualisedBasis: number;
}

interface BasisTrade {
  symbol: string;
  spotPrice: number;
  futuresPrice: number;
  basis: number;
  annReturn: number;
  size: number;
  pnl: number;
}

interface VaRMetric {
  asset: string;
  var95: number;
  var99: number;
  es: number;
  maxDrawdown: number;
  beta: number;
}

interface CorrelationEntry {
  asset: string;
  spx: number;
  gold: number;
  usd: number;
  bonds: number;
}

interface PositionLimit {
  asset: string;
  current: number;
  limit: number;
  utilisation: number;
  status: "ok" | "warning" | "breach";
}

// ── Data generators ────────────────────────────────────────────────────────────
function generateCryptoAllocations(): CryptoAllocation[] {
  resetSeed();
  const assets = [
    { symbol: "BTC", name: "Bitcoin", color: "#f59e0b" },
    { symbol: "ETH", name: "Ethereum", color: "#6366f1" },
    { symbol: "SOL", name: "Solana", color: "#10b981" },
    { symbol: "AVAX", name: "Avalanche", color: "#ef4444" },
    { symbol: "Other", name: "Other", color: "#8b5cf6" },
  ];
  const rawPcts = [38 + rand() * 8, 28 + rand() * 6, 12 + rand() * 4, 7 + rand() * 3, 0];
  const sumExLast = rawPcts.slice(0, 4).reduce((a, b) => a + b, 0);
  rawPcts[4] = 100 - sumExLast;
  const totalAUM = 4_200_000_000;
  return assets.map((a, i) => ({
    ...a,
    pct: parseFloat(rawPcts[i].toFixed(1)),
    aum: Math.round((rawPcts[i] / 100) * totalAUM),
  }));
}

function generateCustodyAllocations(): CustodyAllocation[] {
  resetSeed(812);
  return [
    {
      label: "Cold Storage",
      pct: 55 + rand() * 5,
      color: "#3b82f6",
      description: "Air-gapped hardware vaults",
    },
    {
      label: "MPC Wallets",
      pct: 28 + rand() * 4,
      color: "#10b981",
      description: "Multi-party computation",
    },
    {
      label: "Hot Wallets",
      pct: 0,
      color: "#f59e0b",
      description: "Operational liquidity",
    },
  ].map((c, i, arr) => {
    if (i === 2) {
      const sum = arr[0].pct + arr[1].pct;
      return { ...c, pct: parseFloat((100 - sum).toFixed(1)) };
    }
    return { ...c, pct: parseFloat(c.pct.toFixed(1)) };
  });
}

function generateInstitutionalMetrics(): InstitutionalMetric[] {
  resetSeed(820);
  return [
    {
      label: "Total AUM",
      value: "$4.2B",
      change: 12.4 + rand() * 5,
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      label: "Avg Trade Size",
      value: "$18.5M",
      change: 3.2 + rand() * 2,
      icon: <BarChart2 className="w-4 h-4" />,
    },
    {
      label: "Sharpe Ratio",
      value: (1.4 + rand() * 0.4).toFixed(2),
      change: 0.18 + rand() * 0.1,
      icon: <Activity className="w-4 h-4" />,
    },
    {
      label: "Active Counterparties",
      value: String(Math.floor(24 + rand() * 10)),
      change: 2 + rand() * 2,
      icon: <GitMerge className="w-4 h-4" />,
    },
    {
      label: "30D Volume",
      value: "$892M",
      change: -(3.1 + rand() * 2),
      icon: <Layers className="w-4 h-4" />,
    },
    {
      label: "Custody Providers",
      value: "4",
      change: 0,
      icon: <Lock className="w-4 h-4" />,
    },
  ];
}

function generateOTCBook(): { bids: OTCBookLevel[]; asks: OTCBookLevel[] } {
  resetSeed(830);
  const spot = 68_420;
  const bids: OTCBookLevel[] = [];
  const asks: OTCBookLevel[] = [];
  let cumBid = 0;
  let cumAsk = 0;
  for (let i = 0; i < 8; i++) {
    const bidPremiumBps = -(5 + rand() * 15);
    const askPremiumBps = 5 + rand() * 15;
    const bidPrice = spot * (1 + bidPremiumBps / 10000);
    const askPrice = spot * (1 + askPremiumBps / 10000);
    const bidSize = 10 + rand() * 90;
    const askSize = 10 + rand() * 90;
    cumBid += bidSize;
    cumAsk += askSize;
    bids.push({
      price: Math.round(bidPrice),
      size: parseFloat(bidSize.toFixed(2)),
      cumSize: parseFloat(cumBid.toFixed(2)),
      premiumBps: parseFloat(bidPremiumBps.toFixed(1)),
    });
    asks.push({
      price: Math.round(askPrice),
      size: parseFloat(askSize.toFixed(2)),
      cumSize: parseFloat(cumAsk.toFixed(2)),
      premiumBps: parseFloat(askPremiumBps.toFixed(1)),
    });
  }
  bids.sort((a, b) => b.price - a.price);
  asks.sort((a, b) => a.price - b.price);
  return { bids, asks };
}

function generateOTCOrders(): OTCOrder[] {
  resetSeed(840);
  const assets = ["BTC", "ETH", "SOL", "BTC", "ETH"];
  const counterparties = ["Galaxy Digital", "Cumberland", "B2C2", "Wintermute", "Jump Trading"];
  const tiers: ("tier1" | "tier2" | "tier3")[] = ["tier1", "tier2", "tier3"];
  return Array.from({ length: 6 }, (_, i) => ({
    id: `OTC-${1000 + i}`,
    side: rand() > 0.5 ? "buy" : "sell",
    asset: assets[i % assets.length],
    size: parseFloat((5 + rand() * 95).toFixed(2)),
    price: assets[i % assets.length] === "BTC" ? 68000 + Math.round(rand() * 1000) : 3400 + Math.round(rand() * 200),
    premium: parseFloat((-(8) + rand() * 16).toFixed(1)),
    settlementHrs: [1, 4, 24, 48][Math.floor(rand() * 4)],
    counterparty: counterparties[Math.floor(rand() * counterparties.length)],
    tier: tiers[Math.floor(rand() * tiers.length)],
  }));
}

function generatePerpContracts(): PerpContract[] {
  resetSeed(850);
  const symbols = ["BTC-PERP", "ETH-PERP", "SOL-PERP", "AVAX-PERP", "BNB-PERP"];
  return symbols.map((sym) => ({
    symbol: sym,
    fundingRate: parseFloat((-(0.04) + rand() * 0.08).toFixed(4)),
    openInterest: parseFloat((500 + rand() * 4500).toFixed(0)),
    volume24h: parseFloat((200 + rand() * 2800).toFixed(0)),
    basis: parseFloat((-(0.5) + rand() * 1.0).toFixed(2)),
    longShortRatio: parseFloat((0.8 + rand() * 0.8).toFixed(2)),
    nextFunding: `${Math.floor(rand() * 7)}h ${Math.floor(rand() * 59)}m`,
  }));
}

function generateTermStructure(): FuturesTerm[] {
  resetSeed(860);
  const spot = 68_420;
  const expiries = [
    { label: "Mar 28", days: 0 },
    { label: "Apr 25", days: 28 },
    { label: "Jun 27", days: 91 },
    { label: "Sep 26", days: 182 },
    { label: "Dec 26", days: 273 },
    { label: "Mar 27", days: 364 },
  ];
  return expiries.map(({ label, days }) => {
    const annBasis = 4.5 + rand() * 8;
    const basisAbs = spot * (annBasis / 100) * (days / 365);
    const price = spot + basisAbs;
    return {
      expiry: label,
      daysToExpiry: days,
      price: Math.round(price),
      basis: parseFloat(basisAbs.toFixed(0)),
      annualisedBasis: parseFloat(annBasis.toFixed(2)),
    };
  });
}

function generateBasisTrades(): BasisTrade[] {
  resetSeed(870);
  const assets = ["BTC", "ETH", "SOL"];
  return assets.map((sym) => {
    const spot = sym === "BTC" ? 68420 : sym === "ETH" ? 3450 : 148;
    const basis = spot * (0.05 + rand() * 0.06);
    const annReturn = 8 + rand() * 12;
    const size = 500_000 + rand() * 4_500_000;
    return {
      symbol: sym,
      spotPrice: spot,
      futuresPrice: Math.round(spot + basis),
      basis: parseFloat(basis.toFixed(2)),
      annReturn: parseFloat(annReturn.toFixed(2)),
      size: Math.round(size),
      pnl: parseFloat(((rand() - 0.3) * size * 0.02).toFixed(0)),
    };
  });
}

function generateVaRMetrics(): VaRMetric[] {
  resetSeed(880);
  const assets = ["BTC", "ETH", "SOL", "AVAX", "Portfolio"];
  return assets.map((asset) => ({
    asset,
    var95: parseFloat((3 + rand() * 8).toFixed(2)),
    var99: parseFloat((6 + rand() * 14).toFixed(2)),
    es: parseFloat((8 + rand() * 18).toFixed(2)),
    maxDrawdown: parseFloat((15 + rand() * 55).toFixed(1)),
    beta: parseFloat((0.6 + rand() * 0.8).toFixed(2)),
  }));
}

function generateCorrelations(): CorrelationEntry[] {
  resetSeed(890);
  const assets = ["BTC", "ETH", "SOL", "AVAX"];
  return assets.map((asset) => ({
    asset,
    spx: parseFloat((0.1 + rand() * 0.4).toFixed(2)),
    gold: parseFloat((-(0.1) + rand() * 0.25).toFixed(2)),
    usd: parseFloat((-(0.3) + rand() * 0.2).toFixed(2)),
    bonds: parseFloat((-(0.2) + rand() * 0.2).toFixed(2)),
  }));
}

function generatePositionLimits(): PositionLimit[] {
  resetSeed(900);
  const assets = ["BTC", "ETH", "SOL", "AVAX", "BNB"];
  return assets.map((asset) => {
    const utilisation = 20 + rand() * 90;
    const limit = 500_000_000;
    const current = Math.round((utilisation / 100) * limit);
    const status: PositionLimit["status"] =
      utilisation > 85 ? "breach" : utilisation > 70 ? "warning" : "ok";
    return {
      asset,
      current,
      limit,
      utilisation: parseFloat(utilisation.toFixed(1)),
      status,
    };
  });
}

// ── SVG: Crypto Allocation Pie ─────────────────────────────────────────────────
function CryptoAllocPie({ allocations }: { allocations: CryptoAllocation[] }) {
  const cx = 100;
  const cy = 100;
  const r = 75;
  const innerR = 45;

  let cumAngle = -Math.PI / 2;
  const slices = allocations.map((alloc) => {
    const angle = (alloc.pct / 100) * 2 * Math.PI;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(startAngle);
    const iy1 = cy + innerR * Math.sin(startAngle);
    const ix2 = cx + innerR * Math.cos(endAngle);
    const iy2 = cy + innerR * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const d = [
      `M ${ix1} ${iy1}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      "Z",
    ].join(" ");

    const midAngle = startAngle + angle / 2;
    const labelR = r + 14;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    return { d, color: alloc.color, symbol: alloc.symbol, pct: alloc.pct, lx, ly };
  });

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[200px]">
      {slices.map((sl, i) => (
        <path key={i} d={sl.d} fill={sl.color} opacity={0.85} stroke="hsl(var(--background))" strokeWidth={1.5} />
      ))}
      {slices.map((sl, i) => (
        <text
          key={`l-${i}`}
          x={sl.lx}
          y={sl.ly}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={6.5}
          fill={sl.color}
          fontWeight="600"
        >
          {sl.symbol}
        </text>
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={10} fill="hsl(var(--foreground))" fontWeight="700">
        $4.2B
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize={7} fill="hsl(var(--muted-foreground))">
        AUM
      </text>
    </svg>
  );
}

// ── SVG: Term Structure ────────────────────────────────────────────────────────
function TermStructureChart({ terms }: { terms: FuturesTerm[] }) {
  const W = 420;
  const H = 180;
  const padL = 60;
  const padR = 16;
  const padT = 16;
  const padB = 36;

  const prices = terms.map((t) => t.price);
  const minP = Math.min(...prices) - 200;
  const maxP = Math.max(...prices) + 200;

  const xStep = (W - padL - padR) / (terms.length - 1);
  const scaleY = (p: number) =>
    padT + ((maxP - p) / (maxP - minP)) * (H - padT - padB);

  const points = terms.map((t, i) => ({
    x: padL + i * xStep,
    y: scaleY(t.price),
    ...t,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${H - padB} L ${points[0].x} ${H - padB} Z`;

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round(minP + (i / yTicks) * (maxP - minP))
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Y-axis grid */}
      {yTickValues.map((v, i) => {
        const y = scaleY(v);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3 3" />
            <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize={8} fill="hsl(var(--muted-foreground))">
              {(v / 1000).toFixed(0)}k
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#tsGrad)" opacity={0.25} />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round" />

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#6366f1" />
          <text x={p.x} y={H - padB + 10} textAnchor="middle" fontSize={7.5} fill="hsl(var(--muted-foreground))">
            {p.expiry}
          </text>
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize={7} fill="#a5b4fc">
            {p.annualisedBasis.toFixed(1)}%
          </text>
        </g>
      ))}

      {/* Gradient */}
      <defs>
        <linearGradient id="tsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Axis label */}
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={8} fill="hsl(var(--muted-foreground))">
        BTC Futures Term Structure — Annualised Basis %
      </text>
    </svg>
  );
}

// ── SVG: Drawdown Bar Chart ────────────────────────────────────────────────────
function DrawdownChart({ metrics }: { metrics: VaRMetric[] }) {
  const W = 380;
  const H = 160;
  const padL = 60;
  const padR = 16;
  const padT = 12;
  const padB = 24;

  const maxDD = Math.max(...metrics.map((m) => m.maxDrawdown));
  const barW = (W - padL - padR) / (metrics.length * 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 25, 50, 75].map((v) => {
        const x = padL + (v / maxDD) * (W - padL - padR);
        return (
          <g key={v}>
            <line x1={x} y1={padT} x2={x} y2={H - padB} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3 3" />
            <text x={x} y={H - padB + 10} textAnchor="middle" fontSize={7} fill="hsl(var(--muted-foreground))">
              {v}%
            </text>
          </g>
        );
      })}

      {metrics.map((m, i) => {
        const y = padT + i * ((H - padT - padB) / metrics.length) + 2;
        const ddW = (m.maxDrawdown / maxDD) * (W - padL - padR);
        const varW = (m.var99 / maxDD) * (W - padL - padR);
        const color = m.maxDrawdown > 50 ? "#ef4444" : m.maxDrawdown > 30 ? "#f59e0b" : "#10b981";

        return (
          <g key={i}>
            <text x={padL - 4} y={y + barW * 0.6} textAnchor="end" dominantBaseline="middle" fontSize={8} fill="hsl(var(--foreground))">
              {m.asset}
            </text>
            {/* Max drawdown bar */}
            <rect x={padL} y={y} width={ddW} height={barW} rx={2} fill={color} opacity={0.6} />
            {/* VaR 99 bar */}
            <rect x={padL} y={y + barW + 1} width={varW} height={barW * 0.7} rx={2} fill={color} opacity={0.3} />
          </g>
        );
      })}

      <text x={padL} y={padT - 2} fontSize={7.5} fill="hsl(var(--muted-foreground))">
        Max Drawdown (solid) / VaR 99 (faded)
      </text>
    </svg>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(n: number, decimals = 0): string {
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(decimals)}K`;
  return `$${n.toFixed(decimals)}`;
}

function TierBadge({ tier }: { tier: "tier1" | "tier2" | "tier3" }) {
  const styles: Record<string, string> = {
    tier1: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    tier2: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    tier3: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };
  const labels: Record<string, string> = { tier1: "Tier 1", tier2: "Tier 2", tier3: "Tier 3" };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${styles[tier]}`}>
      {labels[tier]}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CryptoInstitutionalPage() {
  const [activeOTCFilter, setActiveOTCFilter] = useState<"all" | "buy" | "sell">("all");
  const [selectedPerp, setSelectedPerp] = useState<string>("BTC-PERP");
  const [refreshKey, setRefreshKey] = useState(0);

  const cryptoAlloc = useMemo(() => generateCryptoAllocations(), [refreshKey]);
  const custodyAlloc = useMemo(() => generateCustodyAllocations(), [refreshKey]);
  const instMetrics = useMemo(() => generateInstitutionalMetrics(), [refreshKey]);
  const otcBook = useMemo(() => generateOTCBook(), [refreshKey]);
  const otcOrders = useMemo(() => generateOTCOrders(), [refreshKey]);
  const perps = useMemo(() => generatePerpContracts(), [refreshKey]);
  const termStructure = useMemo(() => generateTermStructure(), [refreshKey]);
  const basisTrades = useMemo(() => generateBasisTrades(), [refreshKey]);
  const varMetrics = useMemo(() => generateVaRMetrics(), [refreshKey]);
  const correlations = useMemo(() => generateCorrelations(), [refreshKey]);
  const posLimits = useMemo(() => generatePositionLimits(), [refreshKey]);

  const filteredOrders = useMemo(
    () =>
      activeOTCFilter === "all"
        ? otcOrders
        : otcOrders.filter((o) => o.side === activeOTCFilter),
    [otcOrders, activeOTCFilter]
  );

  const selectedPerpData = useMemo(
    () => perps.find((p) => p.symbol === selectedPerp) ?? perps[0],
    [perps, selectedPerp]
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            Institutional Crypto Strategies
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Custody, OTC desk, derivatives, and risk management for digital assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-indigo-500/40 text-indigo-400">
            Prime Brokerage
          </Badge>
          <Badge variant="outline" className="text-xs border-green-500/40 text-green-400">
            Live Feed
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="gap-1 text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="otc">OTC Desk</TabsTrigger>
          <TabsTrigger value="derivatives">Derivatives</TabsTrigger>
          <TabsTrigger value="risk">Risk Mgmt</TabsTrigger>
        </TabsList>

        {/* ── Tab: Overview ──────────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
          {/* Metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {instMetrics.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border bg-card">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs">{m.label}</span>
                      {m.icon}
                    </div>
                    <p className="text-lg font-bold">{m.value}</p>
                    {m.change !== 0 && (
                      <p
                        className={`text-xs flex items-center gap-0.5 ${
                          m.change > 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {m.change > 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {Math.abs(m.change).toFixed(1)}
                        {typeof m.value === "string" && m.value.includes(".") ? "" : "%"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Allocation + Custody */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Crypto Allocation Pie */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-400" />
                  Crypto Portfolio Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <CryptoAllocPie allocations={cryptoAlloc} />
                  <div className="flex-1 space-y-2">
                    {cryptoAlloc.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: a.color }}
                          />
                          <span className="text-foreground font-medium">{a.symbol}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground text-xs">{a.pct}%</span>
                          <p className="text-xs text-muted-foreground">{fmt(a.aum)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custody Breakdown */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  Custody Solutions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {custodyAlloc.map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {i === 0 && <Lock className="w-3.5 h-3.5 text-blue-400" />}
                        {i === 1 && <Cpu className="w-3.5 h-3.5 text-emerald-400" />}
                        {i === 2 && <Wallet className="w-3.5 h-3.5 text-amber-400" />}
                        <span className="font-medium">{c.label}</span>
                      </div>
                      <span className="font-bold" style={{ color: c.color }}>
                        {c.pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{c.description}</p>
                  </div>
                ))}

                <div className="mt-2 pt-3 border-t border-border space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    Insurance coverage up to $250M per incident
                  </p>
                  <p className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Cold storage withdrawal: T+1 settlement
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: OTC Desk ──────────────────────────────────────────────────────── */}
        <TabsContent value="otc" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Order Book */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  OTC Order Book — BTC/USD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {/* Asks */}
                  <div className="grid grid-cols-4 text-[10px] text-muted-foreground font-semibold mb-1 px-1">
                    <span>Premium</span>
                    <span className="text-right">Size (BTC)</span>
                    <span className="text-right">Cum.</span>
                    <span className="text-right">Price</span>
                  </div>
                  {otcBook.asks.slice(0, 5).map((a, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-4 text-xs py-0.5 px-1 rounded hover:bg-red-500/5 relative"
                    >
                      <div
                        className="absolute inset-y-0 right-0 bg-red-500/10 rounded"
                        style={{ width: `${(a.cumSize / otcBook.asks[4].cumSize) * 100}%` }}
                      />
                      <span className="text-red-400 relative z-10 text-[10px]">
                        +{a.premiumBps.toFixed(1)}bps
                      </span>
                      <span className="text-right text-red-300 relative z-10">{a.size.toFixed(1)}</span>
                      <span className="text-right text-muted-foreground relative z-10 text-[10px]">
                        {a.cumSize.toFixed(0)}
                      </span>
                      <span className="text-right font-mono text-red-400 relative z-10">
                        {a.price.toLocaleString()}
                      </span>
                    </div>
                  ))}

                  {/* Spread */}
                  <div className="text-center text-xs text-muted-foreground py-1 border-y border-border my-1">
                    Spot: $68,420 &nbsp;|&nbsp; OTC Premium Avg: ±8.2 bps
                  </div>

                  {/* Bids */}
                  {otcBook.bids.slice(0, 5).map((b, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-4 text-xs py-0.5 px-1 rounded hover:bg-green-500/5 relative"
                    >
                      <div
                        className="absolute inset-y-0 right-0 bg-green-500/10 rounded"
                        style={{ width: `${(b.cumSize / otcBook.bids[4].cumSize) * 100}%` }}
                      />
                      <span className="text-green-400 relative z-10 text-[10px]">
                        {b.premiumBps.toFixed(1)}bps
                      </span>
                      <span className="text-right text-green-300 relative z-10">{b.size.toFixed(1)}</span>
                      <span className="text-right text-muted-foreground relative z-10 text-[10px]">
                        {b.cumSize.toFixed(0)}
                      </span>
                      <span className="text-right font-mono text-green-400 relative z-10">
                        {b.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Trade size tiers */}
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Trade Size Tiers</p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    {[
                      { tier: "Tier 1", size: ">$10M", premium: "±3–5 bps", settle: "T+0" },
                      { tier: "Tier 2", size: "$1–10M", premium: "±5–12 bps", settle: "T+0/T+1" },
                      { tier: "Tier 3", size: "<$1M", premium: "±12–25 bps", settle: "T+1" },
                    ].map((t, i) => (
                      <div
                        key={i}
                        className="bg-muted/30 rounded p-2 border border-border space-y-0.5"
                      >
                        <p className="font-semibold text-foreground">{t.tier}</p>
                        <p className="text-muted-foreground">{t.size}</p>
                        <p className="text-indigo-400">{t.premium}</p>
                        <p className="text-muted-foreground">{t.settle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent OTC Trades */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Recent OTC Trades
                  </CardTitle>
                  <div className="flex gap-1">
                    {(["all", "buy", "sell"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveOTCFilter(f)}
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                          activeOTCFilter === f
                            ? "bg-indigo-500 text-white"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredOrders.map((o, i) => (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between p-2 rounded border border-border bg-muted/20 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold ${o.side === "buy" ? "text-green-400" : "text-red-400"}`}
                        >
                          {o.side.toUpperCase()}
                        </span>
                        <span className="font-semibold text-foreground">{o.asset}</span>
                        <TierBadge tier={o.tier} />
                      </div>
                      <p className="text-muted-foreground">{o.counterparty}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="font-mono font-semibold">{fmt(o.size * o.price)}</p>
                      <p className="text-muted-foreground text-[10px]">
                        {o.size.toFixed(1)} {o.asset} @ {o.price.toLocaleString()}
                      </p>
                      <p
                        className={`text-[10px] ${o.premium > 0 ? "text-amber-400" : "text-blue-400"}`}
                      >
                        {o.premium > 0 ? "+" : ""}
                        {o.premium.toFixed(1)} bps &nbsp;|&nbsp; T+{o.settlementHrs}h
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: Derivatives ───────────────────────────────────────────────────── */}
        <TabsContent value="derivatives" className="space-y-4">
          {/* Perp Funding Rates */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Perpetual Funding Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left pb-2 font-semibold">Contract</th>
                      <th className="text-right pb-2 font-semibold">Funding Rate</th>
                      <th className="text-right pb-2 font-semibold">OI ($M)</th>
                      <th className="text-right pb-2 font-semibold">Vol 24h ($M)</th>
                      <th className="text-right pb-2 font-semibold">Basis</th>
                      <th className="text-right pb-2 font-semibold">L/S Ratio</th>
                      <th className="text-right pb-2 font-semibold">Next Funding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perps.map((p, i) => (
                      <tr
                        key={i}
                        onClick={() => setSelectedPerp(p.symbol)}
                        className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/20 ${
                          selectedPerp === p.symbol ? "bg-indigo-500/10" : ""
                        }`}
                      >
                        <td className="py-2 font-semibold text-foreground">{p.symbol}</td>
                        <td className="py-2 text-right">
                          <span
                            className={`font-mono ${
                              p.fundingRate > 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {p.fundingRate > 0 ? "+" : ""}
                            {(p.fundingRate * 100).toFixed(4)}%
                          </span>
                        </td>
                        <td className="py-2 text-right text-muted-foreground">
                          {p.openInterest.toLocaleString()}
                        </td>
                        <td className="py-2 text-right text-muted-foreground">
                          {p.volume24h.toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          <span
                            className={`${p.basis > 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {p.basis > 0 ? "+" : ""}
                            {p.basis.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <span
                            className={`${p.longShortRatio > 1 ? "text-green-400" : "text-red-400"}`}
                          >
                            {p.longShortRatio.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 text-right text-muted-foreground">{p.nextFunding}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Selected perp detail */}
              {selectedPerpData && (
                <motion.div
                  key={selectedPerp}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 rounded border border-indigo-500/30 bg-indigo-500/5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs"
                >
                  <div>
                    <p className="text-muted-foreground">Ann. Funding (Est.)</p>
                    <p className="font-bold text-indigo-400">
                      {(selectedPerpData.fundingRate * 3 * 365 * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">OI Notional</p>
                    <p className="font-bold">${selectedPerpData.openInterest.toLocaleString()}M</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Market Bias</p>
                    <p
                      className={`font-bold ${
                        selectedPerpData.longShortRatio > 1 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {selectedPerpData.longShortRatio > 1 ? "Long-biased" : "Short-biased"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next Funding</p>
                    <p className="font-bold">{selectedPerpData.nextFunding}</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Term Structure + Basis Trades */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  BTC Futures Term Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TermStructureChart terms={termStructure} />
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-emerald-400" />
                  Basis Trading Positions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {basisTrades.map((bt, i) => (
                  <div
                    key={i}
                    className="p-3 rounded border border-border bg-muted/20 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{bt.symbol} Cash & Carry</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          bt.pnl >= 0
                            ? "border-green-500/40 text-green-400"
                            : "border-red-500/40 text-red-400"
                        }`}
                      >
                        P&L: {bt.pnl >= 0 ? "+" : ""}
                        {fmt(bt.pnl)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <p className="text-muted-foreground">Spot</p>
                        <p className="font-mono">${bt.spotPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Futures</p>
                        <p className="font-mono">${bt.futuresPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ann. Return</p>
                        <p className="text-emerald-400 font-bold">{bt.annReturn.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Size</p>
                        <p className="font-mono">{fmt(bt.size)}</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500"
                        style={{ width: `${Math.min((bt.annReturn / 20) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: Risk Management ───────────────────────────────────────────────── */}
        <TabsContent value="risk" className="space-y-4">
          {/* VaR Table */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Value at Risk (VaR) — 1-Day, $4.2B Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left pb-2 font-semibold">Asset</th>
                      <th className="text-right pb-2 font-semibold">VaR 95%</th>
                      <th className="text-right pb-2 font-semibold">VaR 99%</th>
                      <th className="text-right pb-2 font-semibold">Exp. Shortfall</th>
                      <th className="text-right pb-2 font-semibold">Max DD</th>
                      <th className="text-right pb-2 font-semibold">Beta to BTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {varMetrics.map((v, i) => (
                      <tr
                        key={i}
                        className={`border-b border-border/50 ${
                          v.asset === "Portfolio" ? "bg-indigo-500/5 font-semibold" : ""
                        }`}
                      >
                        <td className="py-2 text-foreground">{v.asset}</td>
                        <td className="py-2 text-right text-amber-400">{v.var95.toFixed(2)}%</td>
                        <td className="py-2 text-right text-orange-400">{v.var99.toFixed(2)}%</td>
                        <td className="py-2 text-right text-red-400">{v.es.toFixed(2)}%</td>
                        <td className="py-2 text-right">
                          <span
                            className={`${
                              v.maxDrawdown > 50
                                ? "text-red-400"
                                : v.maxDrawdown > 30
                                ? "text-amber-400"
                                : "text-green-400"
                            }`}
                          >
                            -{v.maxDrawdown.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2 text-right text-muted-foreground">
                          {v.beta.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Drawdown Chart */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  Drawdown Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DrawdownChart metrics={varMetrics} />
              </CardContent>
            </Card>

            {/* Correlations */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  TradFi Correlations (90D)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left pb-2 font-semibold">Asset</th>
                      <th className="text-right pb-2">vs SPX</th>
                      <th className="text-right pb-2">vs Gold</th>
                      <th className="text-right pb-2">vs USD</th>
                      <th className="text-right pb-2">vs Bonds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {correlations.map((c, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 font-semibold">{c.asset}</td>
                        {[c.spx, c.gold, c.usd, c.bonds].map((val, j) => {
                          const intensity = Math.abs(val);
                          const color =
                            val > 0.2
                              ? "text-green-400"
                              : val < -0.2
                              ? "text-red-400"
                              : "text-muted-foreground";
                          return (
                            <td key={j} className={`py-2 text-right font-mono ${color}`}>
                              {val > 0 ? "+" : ""}
                              {val.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Positive = positive correlation; Negative = inverse. Values range -1 to +1.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Position Limits */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                Position Limits & Utilisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {posLimits.map((pl, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground w-12">{pl.asset}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            pl.status === "breach"
                              ? "border-red-500/40 text-red-400"
                              : pl.status === "warning"
                              ? "border-amber-500/40 text-amber-400"
                              : "border-green-500/40 text-green-400"
                          }`}
                        >
                          {pl.status === "breach"
                            ? "BREACH"
                            : pl.status === "warning"
                            ? "WARNING"
                            : "OK"}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="font-mono">{fmt(pl.current)}</span>
                        <span className="text-muted-foreground"> / {fmt(pl.limit)}</span>
                        <span
                          className={`ml-2 font-bold ${
                            pl.status === "breach"
                              ? "text-red-400"
                              : pl.status === "warning"
                              ? "text-amber-400"
                              : "text-green-400"
                          }`}
                        >
                          {pl.utilisation.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          pl.status === "breach"
                            ? "bg-red-500"
                            : pl.status === "warning"
                            ? "bg-amber-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(pl.utilisation, 100)}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-3 text-[11px]">
                <div className="text-center p-2 rounded bg-green-500/5 border border-green-500/20">
                  <p className="text-green-400 font-bold">
                    {posLimits.filter((p) => p.status === "ok").length}
                  </p>
                  <p className="text-muted-foreground">Within Limits</p>
                </div>
                <div className="text-center p-2 rounded bg-amber-500/5 border border-amber-500/20">
                  <p className="text-amber-400 font-bold">
                    {posLimits.filter((p) => p.status === "warning").length}
                  </p>
                  <p className="text-muted-foreground">Warning Zone</p>
                </div>
                <div className="text-center p-2 rounded bg-red-500/5 border border-red-500/20">
                  <p className="text-red-400 font-bold">
                    {posLimits.filter((p) => p.status === "breach").length}
                  </p>
                  <p className="text-muted-foreground">Limit Breach</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
