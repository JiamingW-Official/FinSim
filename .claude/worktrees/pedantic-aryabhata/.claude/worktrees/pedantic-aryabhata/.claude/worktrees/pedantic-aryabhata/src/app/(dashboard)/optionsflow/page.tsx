"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  BarChart3,
  Eye,
  AlertTriangle,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Shield,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 773;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate all random values
const RND: number[] = [];
for (let i = 0; i < 600; i++) RND.push(rand());
let ri = 0;
const rnd = () => RND[ri++ % RND.length];

// ── Types ──────────────────────────────────────────────────────────────────────
interface OptionsFlowTrade {
  id: number;
  ticker: string;
  type: "CALL" | "PUT";
  strike: number;
  expiry: string;
  premium: number; // $M
  contracts: number;
  sentiment: "bullish" | "bearish" | "neutral";
  exchange: string;
  side: "BUY" | "SELL";
  unusual: boolean;
  time: string;
}

interface DarkPoolPrint {
  id: number;
  ticker: string;
  size: number; // shares
  price: number;
  advPct: number; // % of average daily volume
  notation: "above ask" | "below bid" | "at mid";
  side: "buy" | "sell" | "unknown";
  time: string;
}

interface SweepOrder {
  id: number;
  ticker: string;
  type: "CALL" | "PUT";
  strike: number;
  expiry: string;
  legs: number;
  premium: number;
  aggression: "high" | "medium" | "low";
  sentiment: "bullish" | "bearish";
  time: string;
}

// ── Static Data Generation ─────────────────────────────────────────────────────
const TICKERS = ["AAPL", "TSLA", "NVDA", "SPY", "QQQ", "AMZN", "META", "MSFT", "GOOGL", "AMD"];
const EXCHANGES = ["CBOE", "NASDAQ", "PHLX", "ISE", "BOX", "MIAX", "ARCA", "C2"];
const EXPIRY_DATES = ["03/28", "04/04", "04/11", "04/18", "05/16", "06/20", "09/19", "01/16/27"];

function generateFlowTrades(): OptionsFlowTrade[] {
  ri = 0;
  return Array.from({ length: 15 }, (_, i) => {
    const ticker = TICKERS[Math.floor(rnd() * TICKERS.length)];
    const type: "CALL" | "PUT" = rnd() > 0.52 ? "CALL" : "PUT";
    const basePrice = { AAPL: 175, TSLA: 245, NVDA: 880, SPY: 512, QQQ: 440, AMZN: 195, META: 525, MSFT: 415, GOOGL: 172, AMD: 165 }[ticker] ?? 200;
    const strikeMult = 0.9 + rnd() * 0.2;
    const strike = Math.round(basePrice * strikeMult / 5) * 5;
    const premium = +(0.5 + rnd() * 12).toFixed(2);
    const sentiment: "bullish" | "bearish" | "neutral" =
      type === "CALL" ? (rnd() > 0.3 ? "bullish" : "neutral") : rnd() > 0.3 ? "bearish" : "neutral";
    const hour = 9 + Math.floor(rnd() * 6);
    const min = Math.floor(rnd() * 60);
    return {
      id: i,
      ticker,
      type,
      strike,
      expiry: EXPIRY_DATES[Math.floor(rnd() * EXPIRY_DATES.length)],
      premium,
      contracts: Math.floor(100 + rnd() * 4900),
      sentiment,
      exchange: EXCHANGES[Math.floor(rnd() * EXCHANGES.length)],
      side: rnd() > 0.45 ? "BUY" : "SELL",
      unusual: rnd() > 0.65,
      time: `${hour}:${String(min).padStart(2, "0")}`,
    };
  });
}

function generateDarkPoolPrints(): DarkPoolPrint[] {
  ri = 20;
  return Array.from({ length: 10 }, (_, i) => {
    const ticker = TICKERS[Math.floor(rnd() * TICKERS.length)];
    const basePrice = { AAPL: 175, TSLA: 245, NVDA: 880, SPY: 512, QQQ: 440, AMZN: 195, META: 525, MSFT: 415, GOOGL: 172, AMD: 165 }[ticker] ?? 200;
    const price = +(basePrice * (0.995 + rnd() * 0.01)).toFixed(2);
    const notation: "above ask" | "below bid" | "at mid" =
      rnd() < 0.35 ? "above ask" : rnd() < 0.6 ? "below bid" : "at mid";
    const side: "buy" | "sell" | "unknown" =
      notation === "above ask" ? "buy" : notation === "below bid" ? "sell" : "unknown";
    const hour = 9 + Math.floor(rnd() * 6);
    const min = Math.floor(rnd() * 60);
    return {
      id: i,
      ticker,
      size: Math.floor(50000 + rnd() * 950000),
      price,
      advPct: +(1 + rnd() * 15).toFixed(1),
      notation,
      side,
      time: `${hour}:${String(min).padStart(2, "0")}`,
    };
  });
}

function generateSweepOrders(): SweepOrder[] {
  ri = 50;
  return Array.from({ length: 8 }, (_, i) => {
    const ticker = TICKERS[Math.floor(rnd() * TICKERS.length)];
    const type: "CALL" | "PUT" = rnd() > 0.5 ? "CALL" : "PUT";
    const basePrice = { AAPL: 175, TSLA: 245, NVDA: 880, SPY: 512, QQQ: 440, AMZN: 195, META: 525, MSFT: 415, GOOGL: 172, AMD: 165 }[ticker] ?? 200;
    const strike = Math.round(basePrice * (0.95 + rnd() * 0.1) / 5) * 5;
    const hour = 9 + Math.floor(rnd() * 6);
    const min = Math.floor(rnd() * 60);
    return {
      id: i,
      ticker,
      type,
      strike,
      expiry: EXPIRY_DATES[Math.floor(rnd() * EXPIRY_DATES.length)],
      legs: 2 + Math.floor(rnd() * 5),
      premium: +(0.8 + rnd() * 8).toFixed(2),
      aggression: rnd() > 0.6 ? "high" : rnd() > 0.35 ? "medium" : "low",
      sentiment: type === "CALL" ? "bullish" : "bearish",
      time: `${hour}:${String(min).padStart(2, "0")}`,
    };
  });
}

// ── Put/Call Ratio 30-day trend data ──────────────────────────────────────────
function generatePCRTrend(): { day: number; pcr: number; label: string }[] {
  ri = 100;
  const months = ["Feb", "Mar"];
  return Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const month = i < 14 ? months[0] : months[1];
    const dayNum = i < 14 ? i + 14 : i - 13;
    return {
      day,
      pcr: +(0.6 + rnd() * 0.9).toFixed(2),
      label: `${month} ${dayNum}`,
    };
  });
}

// ── Sector Sentiment Data ─────────────────────────────────────────────────────
interface SectorSentiment {
  sector: string;
  bullishFlow: number; // 0-100
  bearishFlow: number;
  netPremium: number; // $M net (positive = bullish)
  trend: "up" | "down" | "flat";
}

const SECTOR_SENTIMENT: SectorSentiment[] = (() => {
  ri = 150;
  const sectors = [
    "Technology", "Financials", "Healthcare", "Energy",
    "Consumer Disc.", "Industrials", "Materials", "Utilities",
  ];
  return sectors.map((sector) => {
    const bullish = Math.floor(30 + rnd() * 70);
    const bearish = Math.floor(20 + rnd() * 60);
    const total = bullish + bearish;
    const net = +(bullish / total * 2 - 1) * (50 + rnd() * 200);
    return {
      sector,
      bullishFlow: bullish,
      bearishFlow: bearish,
      netPremium: +net.toFixed(1),
      trend: rnd() > 0.6 ? "up" : rnd() > 0.4 ? "down" : "flat",
    };
  });
})();

// ── SVG Put/Call Ratio Chart ───────────────────────────────────────────────────
function PCRChart({ data }: { data: { day: number; pcr: number }[] }) {
  const W = 600;
  const H = 160;
  const PAD = { top: 16, right: 16, bottom: 32, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const minPCR = Math.min(...data.map((d) => d.pcr));
  const maxPCR = Math.max(...data.map((d) => d.pcr));
  const range = maxPCR - minPCR || 1;

  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => PAD.top + chartH - ((v - minPCR) / range) * chartH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(d.pcr).toFixed(1)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L ${toX(data.length - 1).toFixed(1)} ${(PAD.top + chartH).toFixed(1)} L ${toX(0).toFixed(1)} ${(PAD.top + chartH).toFixed(1)} Z`;

  // Reference line at PCR = 1.0
  const refY = toY(1.0);
  const yLabels = [minPCR, (minPCR + maxPCR) / 2, maxPCR].map((v) => v.toFixed(2));

  const xTickIndices = [0, 7, 14, 21, 29];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="pcrGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.top + chartH * (1 - t);
        return (
          <line
            key={t}
            x1={PAD.left}
            y1={y}
            x2={PAD.left + chartW}
            y2={y}
            stroke="#27272a"
            strokeWidth="1"
          />
        );
      })}
      {/* PCR = 1.0 reference */}
      {refY >= PAD.top && refY <= PAD.top + chartH && (
        <line
          x1={PAD.left}
          y1={refY}
          x2={PAD.left + chartW}
          y2={refY}
          stroke="#f59e0b"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
      )}
      {/* Area fill */}
      <path d={areaPath} fill="url(#pcrGrad)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
      {/* Y labels */}
      {yLabels.map((label, i) => {
        const yPos = PAD.top + chartH * (1 - i / 2);
        return (
          <text key={i} x={PAD.left - 6} y={yPos + 4} textAnchor="end" fontSize="9" fill="#71717a">
            {label}
          </text>
        );
      })}
      {/* X labels */}
      {xTickIndices.map((idx) => (
        <text
          key={idx}
          x={toX(idx)}
          y={H - 4}
          textAnchor="middle"
          fontSize="9"
          fill="#71717a"
        >
          {`D${idx + 1}`}
        </text>
      ))}
      {/* PCR=1.0 label */}
      {refY >= PAD.top && refY <= PAD.top + chartH && (
        <text x={PAD.left + chartW + 2} y={refY + 4} fontSize="8" fill="#f59e0b">
          1.0
        </text>
      )}
    </svg>
  );
}

// ── Sector Heatmap SVG ────────────────────────────────────────────────────────
function SectorHeatmap({ data }: { data: SectorSentiment[] }) {
  const cols = 4;
  const rows = Math.ceil(data.length / cols);
  const cellW = 130;
  const cellH = 64;
  const gap = 4;
  const W = cols * (cellW + gap) - gap;
  const H = rows * (cellH + gap) - gap;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {data.map((d, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * (cellW + gap);
        const y = row * (cellH + gap);
        const total = d.bullishFlow + d.bearishFlow;
        const bullPct = d.bullishFlow / total;
        // Color interpolation: bearish (red) → neutral (gray) → bullish (green)
        const color =
          bullPct > 0.6
            ? `rgba(34,197,94,${0.15 + (bullPct - 0.6) * 1.5})`
            : bullPct < 0.4
            ? `rgba(239,68,68,${0.15 + (0.4 - bullPct) * 1.5})`
            : "rgba(113,113,122,0.15)";
        const strokeColor =
          bullPct > 0.6 ? "#22c55e" : bullPct < 0.4 ? "#ef4444" : "#52525b";
        return (
          <g key={d.sector}>
            <rect
              x={x}
              y={y}
              width={cellW}
              height={cellH}
              rx={6}
              fill={color}
              stroke={strokeColor}
              strokeWidth="1"
              strokeOpacity="0.4"
            />
            <text x={x + 8} y={y + 18} fontSize="10" fontWeight="600" fill="#e4e4e7">
              {d.sector}
            </text>
            {/* Bullish/Bearish bar */}
            <rect x={x + 8} y={y + 28} width={cellW - 16} height={6} rx={3} fill="#27272a" />
            <rect
              x={x + 8}
              y={y + 28}
              width={Math.round((cellW - 16) * bullPct)}
              height={6}
              rx={3}
              fill={bullPct > 0.5 ? "#22c55e" : "#ef4444"}
            />
            <text x={x + 8} y={y + 52} fontSize="9" fill="#a1a1aa">
              {`${d.bullishFlow}% bull`}
            </text>
            <text x={x + cellW - 8} y={y + 52} textAnchor="end" fontSize="9" fill="#a1a1aa">
              {`${d.bearishFlow}% bear`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────
function SentimentBadge({ sentiment }: { sentiment: "bullish" | "bearish" | "neutral" }) {
  if (sentiment === "bullish")
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs">
        Bullish
      </Badge>
    );
  if (sentiment === "bearish")
    return (
      <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs">
        Bearish
      </Badge>
    );
  return (
    <Badge className="bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30 text-xs">
      Neutral
    </Badge>
  );
}

function AggressionBadge({ level }: { level: "high" | "medium" | "low" }) {
  if (level === "high")
    return (
      <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 text-xs">
        High
      </Badge>
    );
  if (level === "medium")
    return (
      <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 text-xs">
        Medium
      </Badge>
    );
  return (
    <Badge className="bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30 text-xs">
      Low
    </Badge>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OptionsFlowPage() {
  const [selectedSentimentFilter, setSelectedSentimentFilter] = useState<"all" | "bullish" | "bearish">("all");

  const flowTrades = useMemo(() => generateFlowTrades(), []);
  const darkPoolPrints = useMemo(() => generateDarkPoolPrints(), []);
  const sweepOrders = useMemo(() => generateSweepOrders(), []);
  const pcrData = useMemo(() => generatePCRTrend(), []);

  const filteredTrades = useMemo(() => {
    if (selectedSentimentFilter === "all") return flowTrades;
    return flowTrades.filter((t) => t.sentiment === selectedSentimentFilter);
  }, [flowTrades, selectedSentimentFilter]);

  // Key metrics
  const totalPremium = useMemo(
    () => flowTrades.reduce((sum, t) => sum + t.premium, 0).toFixed(1),
    [flowTrades]
  );
  const callCount = flowTrades.filter((t) => t.type === "CALL").length;
  const putCount = flowTrades.filter((t) => t.type === "PUT").length;
  const cpRatio = (callCount / putCount).toFixed(2);
  const unusualCount = flowTrades.filter((t) => t.unusual).length;
  const darkPoolVolPct = (15 + (RND[200] * 10)).toFixed(1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/10 border border-border">
              <Eye className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Options Flow &amp; Dark Pool Tracker
              </h1>
              <p className="text-sm text-muted-foreground">
                Simulated smart money signals — unusual options activity, institutional flow, and sweep orders
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Key Metrics ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Total Premium Traded",
              value: `$${totalPremium}M`,
              icon: <DollarSign className="w-4 h-4" />,
              color: "text-primary",
              bg: "bg-muted/10",
              border: "border-border",
              sub: "today's flow",
            },
            {
              label: "Calls / Puts Ratio",
              value: cpRatio,
              icon: <Activity className="w-4 h-4" />,
              color: parseFloat(cpRatio) > 1 ? "text-emerald-400" : "text-red-400",
              bg: parseFloat(cpRatio) > 1 ? "bg-emerald-500/5" : "bg-red-500/5",
              border: parseFloat(cpRatio) > 1 ? "border-emerald-500/20" : "border-red-500/20",
              sub: parseFloat(cpRatio) > 1 ? "bullish skew" : "bearish skew",
            },
            {
              label: "Unusual Activity (Simulated)",
              value: `${unusualCount} trades`,
              icon: <AlertTriangle className="w-4 h-4" />,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
              sub: "flagged as unusual",
            },
            {
              label: "Simulated Institutional Vol.",
              value: `${darkPoolVolPct}%`,
              icon: <Shield className="w-4 h-4" />,
              color: "text-sky-400",
              bg: "bg-sky-500/10",
              border: "border-sky-500/20",
              sub: "of total market volume",
            },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 + i * 0.05 }}
            >
              <Card className={`border ${m.border} bg-card`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className={`text-xl font-semibold ${m.color}`}>{m.value}</p>
                      <p className="text-xs text-muted-foreground">{m.sub}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${m.bg} ${m.color}`}>{m.icon}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Tabs defaultValue="flow">
            <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
              <TabsTrigger value="flow">Options Flow</TabsTrigger>
              <TabsTrigger value="darkpools">Dark Pools</TabsTrigger>
              <TabsTrigger value="sweeps">Sweep Orders</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            </TabsList>

            {/* ── Options Flow Tab ── */}
            <TabsContent value="flow" className="data-[state=inactive]:hidden space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Filter:</span>
                {(["all", "bullish", "bearish"] as const).map((f) => (
                  <Button
                    key={f}
                    variant={selectedSentimentFilter === f ? "default" : "outline"}
                    size="sm"
                    className="capitalize text-xs text-muted-foreground h-7"
                    onClick={() => setSelectedSentimentFilter(f)}
                  >
                    {f}
                  </Button>
                ))}
                <span className="ml-auto text-xs text-muted-foreground">
                  {filteredTrades.length} trades
                </span>
              </div>

              <Card className="border-border bg-card border-l-4 border-l-primary">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Time</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Ticker</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Type</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Strike</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Expiry</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Premium</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Contracts</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Sentiment</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Exchange</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Flag</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTrades.map((trade, idx) => (
                          <tr
                            key={trade.id}
                            className={`border-b border-border hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/5"}`}
                          >
                            <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">
                              <Clock className="w-3 h-3 inline mr-1 opacity-60" />
                              {trade.time}
                            </td>
                            <td className="px-4 py-2.5 font-semibold text-foreground">{trade.ticker}</td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`text-xs text-muted-foreground font-medium px-2 py-0.5 rounded ${
                                  trade.type === "CALL"
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : "bg-red-500/15 text-red-400"
                                }`}
                              >
                                {trade.type}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">${trade.strike}</td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{trade.expiry}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-primary font-mono text-xs">
                              ${trade.premium}M
                            </td>
                            <td className="px-4 py-2.5 text-right text-xs text-muted-foreground font-mono">
                              {trade.contracts.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5">
                              <SentimentBadge sentiment={trade.sentiment} />
                            </td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground">{trade.exchange}</td>
                            <td className="px-4 py-2.5">
                              {trade.unusual && (
                                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs">
                                  <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                                  Unusual
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Info note */}
              <div className="mt-8 flex items-start gap-2 p-3 rounded-lg bg-muted/5 border border-border text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-primary">Unusual activity</strong> is flagged when a trade has contract volume significantly above open interest or when premium size is outsized relative to historical norms for that ticker. This may indicate informed institutional positioning.
                </span>
              </div>
            </TabsContent>

            {/* ── Dark Pools Tab ── */}
            <TabsContent value="darkpools" className="data-[state=inactive]:hidden space-y-4">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-sky-500/5 border border-sky-500/20 text-xs text-muted-foreground mb-2">
                <Layers className="w-3.5 h-3.5 text-sky-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-sky-400">Simulated dark pool prints</strong> are modeled after real large block trades executed off-exchange. In real markets, they are reported post-trade but their direction (buy/sell) must be inferred from price relative to the bid/ask spread. Trades above the ask suggest institutional buying; below the bid suggests selling.
                </span>
              </div>

              <Card className="border-border bg-card">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Time</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Ticker</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Shares</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Price</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">% of ADV</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Notation</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Inferred Side</th>
                        </tr>
                      </thead>
                      <tbody>
                        {darkPoolPrints.map((print, idx) => (
                          <tr
                            key={print.id}
                            className={`border-b border-border hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/5"}`}
                          >
                            <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">
                              <Clock className="w-3 h-3 inline mr-1 opacity-60" />
                              {print.time}
                            </td>
                            <td className="px-4 py-2.5 font-semibold text-foreground">{print.ticker}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                              {print.size.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">${print.price}</td>
                            <td className="px-4 py-2.5 text-right">
                              <span
                                className={`text-xs text-muted-foreground font-medium ${
                                  print.advPct > 8 ? "text-amber-400" : "text-foreground"
                                }`}
                              >
                                {print.advPct}%
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`text-xs text-muted-foreground px-2 py-0.5 rounded font-medium ${
                                  print.notation === "above ask"
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : print.notation === "below bid"
                                    ? "bg-red-500/15 text-red-400"
                                    : "bg-muted-foreground/15 text-muted-foreground"
                                }`}
                              >
                                {print.notation}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              {print.side === "buy" ? (
                                <span className="flex items-center gap-1 text-xs text-emerald-400">
                                  <ArrowUpRight className="w-3 h-3" /> Buy
                                </span>
                              ) : print.side === "sell" ? (
                                <span className="flex items-center gap-1 text-xs text-red-400">
                                  <ArrowDownRight className="w-3 h-3" /> Sell
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Unknown</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Dark pool stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Avg Block Size", value: "185K shares", color: "text-sky-400" },
                  { label: "Net Dark Flow", value: "Buy-heavy", color: "text-emerald-400" },
                  { label: "Largest Print", value: `${(+darkPoolPrints.reduce((a, b) => a.size > b.size ? a : b).size / 1000).toFixed(0)}K shares`, color: "text-primary" },
                ].map((stat) => (
                  <Card key={stat.label} className="border-border bg-card">
                    <CardContent className="pt-3 pb-3">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={`text-lg font-medium ${stat.color}`}>{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ── Sweep Orders Tab ── */}
            <TabsContent value="sweeps" className="data-[state=inactive]:hidden space-y-4">
              {/* Educational callout */}
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    What are Sweep Orders?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2 pb-4">
                  <p>
                    A <strong className="text-foreground">sweep order</strong> is an aggressive options trade that simultaneously hits multiple exchanges to fill a large position as quickly as possible — often across 2–6 venues in milliseconds. This urgency signals that the buyer does not want to wait for a better price.
                  </p>
                  <p>
                    Sweep orders are typically interpreted as high-conviction institutional bets. The more exchanges swept (legs) and the higher the aggression rating, the stronger the directional signal. They are often followed by notable price moves within 1–5 trading days.
                  </p>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {[
                      {
                        label: "High Aggression",
                        desc: "Hits 5+ venues instantly, pays the ask. Strong signal.",
                        color: "text-orange-400",
                        border: "border-orange-500/30",
                      },
                      {
                        label: "Medium Aggression",
                        desc: "2–4 venues, slight price sensitivity. Moderate signal.",
                        color: "text-yellow-400",
                        border: "border-yellow-500/30",
                      },
                      {
                        label: "Low Aggression",
                        desc: "Spread across exchanges slowly. Weaker conviction.",
                        color: "text-muted-foreground",
                        border: "border-muted-foreground/30",
                      },
                    ].map((item) => (
                      <div key={item.label} className={`p-2 rounded border ${item.border} bg-background/40`}>
                        <p className={`text-xs text-muted-foreground font-medium ${item.color} mb-1`}>{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sweep orders table */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    Recent Sweep Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Time</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Ticker</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Type</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Strike</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Expiry</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Legs</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Premium</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Aggression</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Signal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sweepOrders.map((sweep, idx) => (
                          <tr
                            key={sweep.id}
                            className={`border-b border-border hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/5"}`}
                          >
                            <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">
                              <Clock className="w-3 h-3 inline mr-1 opacity-60" />
                              {sweep.time}
                            </td>
                            <td className="px-4 py-2.5 font-medium text-foreground">{sweep.ticker}</td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`text-xs text-muted-foreground font-medium px-2 py-0.5 rounded ${
                                  sweep.type === "CALL"
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : "bg-red-500/15 text-red-400"
                                }`}
                              >
                                {sweep.type}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">${sweep.strike}</td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{sweep.expiry}</td>
                            <td className="px-4 py-2.5 text-right text-xs text-muted-foreground font-mono">{sweep.legs}</td>
                            <td className="px-4 py-2.5 text-right font-medium text-amber-400 font-mono text-xs">
                              ${sweep.premium}M
                            </td>
                            <td className="px-4 py-2.5">
                              <AggressionBadge level={sweep.aggression} />
                            </td>
                            <td className="px-4 py-2.5">
                              {sweep.sentiment === "bullish" ? (
                                <span className="flex items-center gap-1 text-xs text-emerald-400">
                                  <TrendingUp className="w-3 h-3" />
                                  Bullish
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-red-400">
                                  <TrendingDown className="w-3 h-3" />
                                  Bearish
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Sentiment Tab ── */}
            <TabsContent value="sentiment" className="data-[state=inactive]:hidden space-y-4">
              {/* PCR Chart */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm text-foreground flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    30-Day Put/Call Ratio Trend
                    <Badge className="ml-auto bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs">
                      1.0 = neutral
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <PCRChart data={pcrData} />
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-indigo-500 inline-block" />
                      PCR value
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-0 border-t border-dashed border-amber-500 inline-block" />
                      Neutral (1.0)
                    </span>
                    <span className="ml-auto">PCR &gt; 1.0 = more puts = bearish sentiment; PCR &lt; 1.0 = more calls = bullish sentiment</span>
                  </div>
                </CardContent>
              </Card>

              {/* Sector Heatmap */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm text-foreground flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
                    Sector Options Flow Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <SectorHeatmap data={SECTOR_SENTIMENT} />
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500/50" />
                      Bullish call flow dominant
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-red-500/40 border border-red-500/50" />
                      Bearish put flow dominant
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-muted-foreground/40 border border-muted-foreground/50" />
                      Neutral / mixed
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment summary row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SECTOR_SENTIMENT.slice(0, 4).map((s) => {
                  const total = s.bullishFlow + s.bearishFlow;
                  const bullPct = ((s.bullishFlow / total) * 100).toFixed(0);
                  const isBullish = s.bullishFlow > s.bearishFlow;
                  return (
                    <Card key={s.sector} className="border-border bg-card">
                      <CardContent className="pt-3 pb-3">
                        <p className="text-xs text-muted-foreground mb-1">{s.sector}</p>
                        <p className={`text-base font-medium ${isBullish ? "text-emerald-400" : "text-red-400"}`}>
                          {bullPct}% bullish
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Net: {s.netPremium > 0 ? "+" : ""}${s.netPremium.toFixed(0)}M
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* ── Footer disclaimer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-start gap-2 p-3 rounded-lg bg-muted/10 border border-border text-xs text-muted-foreground"
        >
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Options flow and dark pool data shown is <strong className="text-foreground">simulated for educational purposes</strong>. In live trading, this data is sourced from CBOE, OCC, FINRA TRACE, and ATS reporting systems. Unusual flow should be interpreted in context — not all large trades are directional; some hedge existing positions.
          </span>
        </motion.div>
      </div>
    </div>
  );
}
