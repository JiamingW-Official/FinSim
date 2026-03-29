"use client";

import { useState, useMemo } from "react";
import {
  Activity,
  BarChart3,
  Clock,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
  Shield,
  DollarSign,
  Layers,
  Info,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 772;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Data Generation ────────────────────────────────────────────────────────────

interface IntradayBar {
  hour: number;
  minute: number;
  label: string;
  volume: number;
  vwapPrice: number;
  algoFillPrice: number;
  fillQty: number;
  cumulativeFill: number;
}

function generateIntradayData(): IntradayBar[] {
  s = 772;
  const bars: IntradayBar[] = [];
  const times = [
    { h: 9, m: 30 }, { h: 10, m: 0 }, { h: 10, m: 30 }, { h: 11, m: 0 },
    { h: 11, m: 30 }, { h: 12, m: 0 }, { h: 12, m: 30 }, { h: 13, m: 0 },
    { h: 13, m: 30 }, { h: 14, m: 0 }, { h: 14, m: 30 }, { h: 15, m: 0 },
    { h: 15, m: 30 }, { h: 16, m: 0 },
  ];
  let basePrice = 150.0;
  let cumFill = 0;
  const totalOrder = 100000;

  times.forEach((t, i) => {
    // U-shaped volume profile
    const normalizedPos = i / (times.length - 1);
    const uShape = Math.pow(normalizedPos - 0.5, 2) * 4 + 0.3;
    const volBase = uShape * 2000000;
    const volume = Math.round(volBase * (0.85 + rand() * 0.3));

    // Price walk
    basePrice += (rand() - 0.5) * 0.4;
    const vwapPrice = basePrice + (rand() - 0.5) * 0.05;

    // VWAP algo fills proportional to volume
    const volShare = volume / (2000000 * 14 * 0.55);
    const fillQty = Math.round(totalOrder * Math.min(volShare, 0.12) * (0.9 + rand() * 0.2));
    cumFill = Math.min(cumFill + fillQty, totalOrder);

    // Small slippage vs VWAP
    const slippage = (rand() - 0.48) * 0.03;
    const algoFillPrice = vwapPrice + slippage;

    bars.push({
      hour: t.h,
      minute: t.m,
      label: `${t.h}:${t.m.toString().padStart(2, "0")}`,
      volume,
      vwapPrice,
      algoFillPrice,
      fillQty,
      cumulativeFill: cumFill,
    });
  });
  return bars;
}

interface ImpactPoint {
  orderSizePct: number;
  impact_bps: number;
  vwap_bps: number;
  is_bps: number;
  pov_bps: number;
}

function generateImpactData(): ImpactPoint[] {
  s = 772;
  const points: ImpactPoint[] = [];
  for (let i = 1; i <= 20; i++) {
    const pct = i * 0.5;
    const sqrtPct = Math.sqrt(pct);
    // Square-root market impact model: I = sigma * sqrt(Q/ADV)
    const base = 3.5 * sqrtPct;
    points.push({
      orderSizePct: pct,
      impact_bps: base * (1 + rand() * 0.15),
      vwap_bps: base * 0.65 * (1 + rand() * 0.1),
      is_bps: base * 0.75 * (1 + rand() * 0.12),
      pov_bps: base * 0.80 * (1 + rand() * 0.1),
    });
  }
  return points;
}

interface VenueData {
  name: string;
  type: "exchange" | "dark" | "internal";
  fillRate: number;
  spreadCapture: number;
  impactBps: number;
  volume: number;
}

function generateVenueData(): VenueData[] {
  s = 772;
  return [
    { name: "NYSE", type: "exchange", fillRate: 0.94, spreadCapture: 0.48, impactBps: 8.2, volume: 28 },
    { name: "NASDAQ", type: "exchange", fillRate: 0.96, spreadCapture: 0.52, impactBps: 7.8, volume: 35 },
    { name: "ARCA", type: "exchange", fillRate: 0.91, spreadCapture: 0.45, impactBps: 9.1, volume: 14 },
    { name: "Dark Pool A", type: "dark", fillRate: 0.72, spreadCapture: 0.61, impactBps: 4.5, volume: 12 },
    { name: "Dark Pool B", type: "dark", fillRate: 0.68, spreadCapture: 0.58, impactBps: 4.8, volume: 7 },
    { name: "Internalized", type: "internal", fillRate: 0.99, spreadCapture: 0.72, impactBps: 2.1, volume: 4 },
  ];
}

// ── Algo Comparison Data ────────────────────────────────────────────────────────

interface AlgoInfo {
  name: string;
  fullName: string;
  useCase: string;
  pros: string[];
  cons: string[];
  typicalSlippage: string;
  complexity: "Low" | "Medium" | "High";
  color: string;
}

const ALGO_DATA: AlgoInfo[] = [
  {
    name: "VWAP",
    fullName: "Volume Weighted Average Price",
    useCase: "Minimize market impact by trading in-line with volume",
    pros: ["Low market impact", "Benchmark widely accepted", "Reduces timing risk"],
    cons: ["Misses price momentum", "Slow execution", "Poor in thin markets"],
    typicalSlippage: "2–5 bps",
    complexity: "Low",
    color: "#3b82f6",
  },
  {
    name: "TWAP",
    fullName: "Time Weighted Average Price",
    useCase: "Spread order evenly across a fixed time window",
    pros: ["Simple to understand", "Predictable execution", "Good for illiquid stocks"],
    cons: ["Ignores volume patterns", "Can be front-run", "Suboptimal vs VWAP"],
    typicalSlippage: "3–7 bps",
    complexity: "Low",
    color: "#8b5cf6",
  },
  {
    name: "IS",
    fullName: "Implementation Shortfall",
    useCase: "Minimize total cost including opportunity cost",
    pros: ["Balances speed vs impact", "Adapts to market conditions", "Minimizes total cost"],
    cons: ["Complex to tune", "Requires good volatility forecast", "Black-box feel"],
    typicalSlippage: "1–4 bps",
    complexity: "High",
    color: "#10b981",
  },
  {
    name: "POV",
    fullName: "Percentage of Volume",
    useCase: "Participate at a fixed fraction of market volume",
    pros: ["Maintains market anonymity", "Scales naturally", "Flexible participation rate"],
    cons: ["Completion time uncertain", "Risk in low-volume days", "May trigger spoofing"],
    typicalSlippage: "2–6 bps",
    complexity: "Medium",
    color: "#f59e0b",
  },
  {
    name: "Arrival",
    fullName: "Arrival Price / Aggressive IS",
    useCase: "Execute near the decision price when alpha decays fast",
    pros: ["Minimizes opportunity cost", "Fast execution", "Good for momentum signals"],
    cons: ["Higher market impact", "Not suitable for large orders", "Sensitive to timing"],
    typicalSlippage: "4–10 bps",
    complexity: "Medium",
    color: "#ef4444",
  },
];

// ── TC Breakdown ────────────────────────────────────────────────────────────────

interface TCBreakdown {
  category: string;
  subcategory: string;
  bps: number;
  type: "explicit" | "implicit";
  description: string;
}

const TC_DATA: TCBreakdown[] = [
  { category: "Commissions", subcategory: "Broker fees", bps: 1.2, type: "explicit", description: "Negotiated rate per share or basis point of notional" },
  { category: "Exchange fees", subcategory: "Take/make", bps: 0.3, type: "explicit", description: "ECN take fee minus maker rebate" },
  { category: "Taxes", subcategory: "STT/FTT", bps: 0.5, type: "explicit", description: "Securities transaction or financial transaction taxes" },
  { category: "Bid-Ask Spread", subcategory: "Half-spread", bps: 3.8, type: "implicit", description: "Cost of crossing the spread; half-spread per trade" },
  { category: "Market Impact", subcategory: "Price impact", bps: 5.5, type: "implicit", description: "Permanent + temporary impact from order flow" },
  { category: "Timing Risk", subcategory: "Opportunity cost", bps: 2.1, type: "implicit", description: "Alpha decay between decision and execution" },
  { category: "Delay Cost", subcategory: "Order latency", bps: 0.8, type: "implicit", description: "Price movement while order is in flight" },
];

// ── SVG Chart: VWAP Execution ──────────────────────────────────────────────────

function VWAPChart({ data }: { data: IntradayBar[] }) {
  const W = 600;
  const H = 280;
  const PAD = { top: 20, right: 20, bottom: 50, left: 60 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const maxVol = Math.max(...data.map((d) => d.volume));
  const prices = data.flatMap((d) => [d.vwapPrice, d.algoFillPrice]);
  const minPrice = Math.min(...prices) - 0.2;
  const maxPrice = Math.max(...prices) + 0.2;

  const x = (i: number) => PAD.left + (i / (data.length - 1)) * cW;
  const yPrice = (p: number) => PAD.top + cH - ((p - minPrice) / (maxPrice - minPrice)) * cH;
  const yVol = (v: number) => PAD.top + cH - (v / maxVol) * cH * 0.35;

  const vwapPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${yPrice(d.vwapPrice)}`).join(" ");
  const algoPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${yPrice(d.algoFillPrice)}`).join(" ");
  const barW = (cW / data.length) * 0.7;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 280 }}>
      {/* Volume bars */}
      {data.map((d, i) => (
        <rect
          key={i}
          x={x(i) - barW / 2}
          y={yVol(d.volume)}
          width={barW}
          height={PAD.top + cH - yVol(d.volume)}
          fill="#3b82f620"
          stroke="#3b82f640"
        />
      ))}
      {/* VWAP line */}
      <path d={vwapPath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" />
      {/* Algo fills */}
      <path d={algoPath} fill="none" stroke="#10b981" strokeWidth={2} />
      {/* Algo fill dots */}
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={yPrice(d.algoFillPrice)} r={3} fill="#10b981" />
      ))}
      {/* Y axis */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const p = minPrice + t * (maxPrice - minPrice);
        const yy = yPrice(p);
        return (
          <g key={t}>
            <line x1={PAD.left} y1={yy} x2={PAD.left + cW} y2={yy} stroke="#ffffff10" />
            <text x={PAD.left - 6} y={yy + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
              {p.toFixed(2)}
            </text>
          </g>
        );
      })}
      {/* X axis labels */}
      {data.filter((_, i) => i % 2 === 0).map((d, idx) => {
        const realIdx = idx * 2;
        return (
          <text key={realIdx} x={x(realIdx)} y={H - 10} textAnchor="middle" fontSize={9} fill="#9ca3af">
            {d.label}
          </text>
        );
      })}
      {/* Legend */}
      <line x1={PAD.left} y1={H - 38} x2={PAD.left + 20} y2={H - 38} stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" />
      <text x={PAD.left + 24} y={H - 34} fontSize={10} fill="#9ca3af">VWAP benchmark</text>
      <line x1={PAD.left + 120} y1={H - 38} x2={PAD.left + 140} y2={H - 38} stroke="#10b981" strokeWidth={2} />
      <text x={PAD.left + 144} y={H - 34} fontSize={10} fill="#9ca3af">Algo fills</text>
      <rect x={PAD.left + 240} y={H - 42} width={12} height={8} fill="#3b82f620" stroke="#3b82f640" />
      <text x={PAD.left + 256} y={H - 34} fontSize={10} fill="#9ca3af">Volume profile</text>
    </svg>
  );
}

// ── SVG Chart: Market Impact Model ─────────────────────────────────────────────

function MarketImpactChart({ data }: { data: ImpactPoint[] }) {
  const W = 600;
  const H = 280;
  const PAD = { top: 20, right: 20, bottom: 50, left: 60 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const maxX = 10;
  const maxY = Math.max(...data.map((d) => d.impact_bps)) + 2;

  const x = (v: number) => PAD.left + (v / maxX) * cW;
  const y = (v: number) => PAD.top + cH - (v / maxY) * cH;

  const makePath = (key: keyof ImpactPoint) =>
    data
      .filter((d) => d.orderSizePct <= maxX)
      .map((d, i) => `${i === 0 ? "M" : "L"} ${x(d.orderSizePct)} ${y(d[key] as number)}`)
      .join(" ");

  const lines: Array<{ key: keyof ImpactPoint; color: string; label: string; dash?: string }> = [
    { key: "impact_bps", color: "#ef4444", label: "Market Impact (sqrt model)" },
    { key: "vwap_bps", color: "#3b82f6", label: "VWAP cost" },
    { key: "is_bps", color: "#10b981", label: "IS cost" },
    { key: "pov_bps", color: "#f59e0b", label: "POV cost" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 280 }}>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const yy = PAD.top + t * cH;
        const val = maxY * (1 - t);
        return (
          <g key={t}>
            <line x1={PAD.left} y1={yy} x2={PAD.left + cW} y2={yy} stroke="#ffffff10" />
            <text x={PAD.left - 6} y={yy + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
              {val.toFixed(1)}
            </text>
          </g>
        );
      })}
      {/* X grid */}
      {[2, 4, 6, 8, 10].map((v) => (
        <g key={v}>
          <line x1={x(v)} y1={PAD.top} x2={x(v)} y2={PAD.top + cH} stroke="#ffffff10" />
          <text x={x(v)} y={PAD.top + cH + 14} textAnchor="middle" fontSize={9} fill="#9ca3af">
            {v}%
          </text>
        </g>
      ))}
      {/* Axis labels */}
      <text x={PAD.left + cW / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#6b7280">
        Order Size (% of ADV)
      </text>
      <text
        x={-(PAD.top + cH / 2)}
        y={14}
        textAnchor="middle"
        fontSize={10}
        fill="#6b7280"
        transform="rotate(-90)"
      >
        Cost (bps)
      </text>
      {/* Lines */}
      {lines.map((l) => (
        <path
          key={l.key}
          d={makePath(l.key)}
          fill="none"
          stroke={l.color}
          strokeWidth={2}
          strokeDasharray={l.key === "impact_bps" ? "none" : undefined}
        />
      ))}
      {/* Legend */}
      {lines.map((l, i) => (
        <g key={l.key} transform={`translate(${PAD.left + i * 135}, ${H - 36})`}>
          <line x1={0} y1={0} x2={18} y2={0} stroke={l.color} strokeWidth={2} />
          <text x={22} y={4} fontSize={9} fill="#9ca3af">
            {l.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── SVG Chart: Venue Fill Quality ──────────────────────────────────────────────

function VenueChart({ data }: { data: VenueData[] }) {
  const W = 500;
  const H = 220;
  const PAD = { top: 20, right: 20, bottom: 40, left: 100 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const barH = (cH / data.length) * 0.65;
  const gap = cH / data.length;

  const typeColor: Record<string, string> = {
    exchange: "#3b82f6",
    dark: "#8b5cf6",
    internal: "#10b981",
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const xx = PAD.left + t * cW;
        return (
          <g key={t}>
            <line x1={xx} y1={PAD.top} x2={xx} y2={PAD.top + cH} stroke="#ffffff10" />
            <text x={xx} y={PAD.top + cH + 14} textAnchor="middle" fontSize={9} fill="#9ca3af">
              {Math.round(t * 100)}%
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const yy = PAD.top + i * gap + (gap - barH) / 2;
        const fillW = d.fillRate * cW;
        const color = typeColor[d.type] ?? "#6b7280";
        return (
          <g key={d.name}>
            <text x={PAD.left - 8} y={yy + barH / 2 + 4} textAnchor="end" fontSize={10} fill="#d1d5db">
              {d.name}
            </text>
            <rect x={PAD.left} y={yy} width={cW} height={barH} fill="#ffffff08" rx={3} />
            <rect x={PAD.left} y={yy} width={fillW} height={barH} fill={color + "99"} rx={3} />
            <rect x={PAD.left} y={yy} width={fillW} height={barH / 3} fill={color + "30"} rx={3} />
            <text x={PAD.left + fillW + 6} y={yy + barH / 2 + 4} fontSize={10} fill="#9ca3af">
              {(d.fillRate * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}
      <text x={PAD.left + cW / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#6b7280">
        Fill Rate
      </text>
    </svg>
  );
}

// ── SVG Chart: TC Breakdown ─────────────────────────────────────────────────────

function TCBreakdownChart({ data }: { data: TCBreakdown[] }) {
  const W = 500;
  const H = 200;
  const PAD = { top: 16, right: 20, bottom: 30, left: 120 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const maxBps = Math.max(...data.map((d) => d.bps)) + 1;
  const barH = (cH / data.length) * 0.65;
  const gap = cH / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
      {data.map((d, i) => {
        const yy = PAD.top + i * gap + (gap - barH) / 2;
        const bw = (d.bps / maxBps) * cW;
        const color = d.type === "explicit" ? "#3b82f6" : "#f59e0b";
        return (
          <g key={d.category}>
            <text x={PAD.left - 8} y={yy + barH / 2 + 4} textAnchor="end" fontSize={10} fill="#d1d5db">
              {d.category}
            </text>
            <rect x={PAD.left} y={yy} width={cW} height={barH} fill="#ffffff08" rx={2} />
            <rect x={PAD.left} y={yy} width={bw} height={barH} fill={color + "aa"} rx={2} />
            <text x={PAD.left + bw + 6} y={yy + barH / 2 + 4} fontSize={10} fill="#9ca3af">
              {d.bps.toFixed(1)} bps
            </text>
          </g>
        );
      })}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const xx = PAD.left + t * cW;
        return (
          <g key={t}>
            <line x1={xx} y1={PAD.top} x2={xx} y2={PAD.top + cH} stroke="#ffffff10" />
            <text x={xx} y={PAD.top + cH + 14} textAnchor="middle" fontSize={9} fill="#9ca3af">
              {(t * maxBps).toFixed(1)}
            </text>
          </g>
        );
      })}
      <text x={PAD.left + cW / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#6b7280">
        Cost (bps)
      </text>
    </svg>
  );
}

// ── Complexity Badge ────────────────────────────────────────────────────────────

function ComplexityBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const cls =
    level === "Low"
      ? "bg-green-900/40 text-green-400 border-green-700/50"
      : level === "Medium"
      ? "bg-yellow-900/40 text-yellow-400 border-yellow-700/50"
      : "bg-red-900/40 text-red-400 border-red-700/50";
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${cls}`}>{level}</span>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────────

export default function AlgoExecutionPage() {
  const [selectedAlgo, setSelectedAlgo] = useState<string>("VWAP");

  const intradayData = useMemo(() => generateIntradayData(), []);
  const impactData = useMemo(() => generateImpactData(), []);
  const venueData = useMemo(() => generateVenueData(), []);

  const selectedAlgoData = ALGO_DATA.find((a) => a.name === selectedAlgo) ?? ALGO_DATA[0];

  // Key metrics
  const marketImpact = 4.8;
  const implShortfall = 7.2;
  const vwapSlippage = 2.3;
  const fillRate = 98.6;

  const metrics = [
    {
      label: "Market Impact",
      value: `${marketImpact} bps`,
      icon: Activity,
      color: "text-yellow-400",
      bg: "bg-yellow-900/20",
      border: "border-yellow-700/30",
      sub: "vs 5.4 bps expected",
      positive: true,
    },
    {
      label: "Impl. Shortfall",
      value: `${implShortfall} bps`,
      icon: TrendingDown,
      color: "text-primary",
      bg: "bg-muted/40",
      border: "border-border",
      sub: "vs arrival price",
      positive: true,
    },
    {
      label: "VWAP Slippage",
      value: `${vwapSlippage} bps`,
      icon: BarChart3,
      color: "text-green-400",
      bg: "bg-green-900/20",
      border: "border-green-700/30",
      sub: "better than benchmark",
      positive: true,
    },
    {
      label: "Fill Rate",
      value: `${fillRate}%`,
      icon: Target,
      color: "text-primary",
      bg: "bg-muted/40",
      border: "border-border",
      sub: "of target shares",
      positive: true,
    },
  ];

  const explicitTotal = TC_DATA.filter((d) => d.type === "explicit").reduce((a, b) => a + b.bps, 0);
  const implicitTotal = TC_DATA.filter((d) => d.type === "implicit").reduce((a, b) => a + b.bps, 0);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted/50 border border-border">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Algorithmic Execution Strategies</h1>
            <p className="text-sm text-muted-foreground">
              VWAP · TWAP · Implementation Shortfall · POV — minimize market impact and transaction costs
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {metrics.map((m) => (
          <Card key={m.label} className={`border ${m.border} ${m.bg}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{m.label}</span>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{m.sub}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs defaultValue="vwap">
          <TabsList className="mb-4">
            <TabsTrigger value="vwap">VWAP / TWAP</TabsTrigger>
            <TabsTrigger value="impact">Market Impact</TabsTrigger>
            <TabsTrigger value="comparison">Algo Comparison</TabsTrigger>
            <TabsTrigger value="venue">Venue Analysis</TabsTrigger>
          </TabsList>

          {/* ── Tab: VWAP/TWAP ── */}
          <TabsContent value="vwap" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Chart */}
              <Card className="lg:col-span-2 border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Intraday VWAP Execution
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Volume profile (bars) vs VWAP benchmark vs algo fills — 100,000 shares order
                  </p>
                </CardHeader>
                <CardContent>
                  <VWAPChart data={intradayData} />
                </CardContent>
              </Card>

              {/* Stats Panel */}
              <div className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Execution Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {[
                      { label: "Order Size", value: "100,000 shs" },
                      { label: "Filled", value: "98,600 shs" },
                      { label: "VWAP benchmark", value: "$150.14" },
                      { label: "Avg Fill Price", value: "$150.17" },
                      { label: "Slippage", value: "+2.3 bps" },
                      { label: "Duration", value: "6.5 hrs" },
                      { label: "Participation Rate", value: "4.2%" },
                      { label: "Commission", value: "$245" },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between">
                        <span className="text-muted-foreground">{r.label}</span>
                        <span className="font-medium">{r.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border bg-muted/30">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                      <Info className="w-4 h-4" />
                      VWAP vs TWAP
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">VWAP</strong> weights participation by
                      real-time volume — heavier at open/close (U-shape). Ideal when you want to
                      blend in naturally with the market.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">TWAP</strong> divides the order evenly
                      over equal time slices. Simpler and more predictable but ignores natural
                      volume patterns.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Volume Profile Breakdown */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Intraday Volume Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground mb-1">
                  {["Open", "10:00", "11:00", "12:00", "13:00", "14:00", "Close"].map((t) => (
                    <div key={t}>{t}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 items-end h-16">
                  {[38, 18, 10, 9, 10, 18, 42].map((v, i) => (
                    <div key={i} className="flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full bg-primary/40 border border-primary/60 rounded-t"
                        style={{ height: `${(v / 42) * 100}%` }}
                      />
                      <div className="text-xs mt-1 text-muted-foreground">{v}%</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  U-shaped volume profile: high at open and close, lowest at midday
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Market Impact ── */}
          <TabsContent value="impact" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-400" />
                    Square-Root Market Impact Model
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Impact (bps) = σ · √(Q/ADV) — cost rises with order size for each algo
                  </p>
                </CardHeader>
                <CardContent>
                  <MarketImpactChart data={impactData} />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Impact Drivers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-muted-foreground">
                    {[
                      {
                        label: "Order Size / ADV",
                        desc: "Larger % of daily volume = more price impact. Sqrt relationship.",
                        color: "text-red-400",
                      },
                      {
                        label: "Volatility (σ)",
                        desc: "Higher volatility amplifies impact — same order moves price more.",
                        color: "text-yellow-400",
                      },
                      {
                        label: "Participation Rate",
                        desc: "Trading too fast raises market impact; too slow increases timing risk.",
                        color: "text-primary",
                      },
                      {
                        label: "Spread Width",
                        desc: "Wide spreads mean each trade is costlier at the touch.",
                        color: "text-primary",
                      },
                      {
                        label: "Dark Pool Access",
                        desc: "Off-exchange fills reduce information leakage and permanent impact.",
                        color: "text-green-400",
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex gap-2">
                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${item.color.replace("text", "bg")}`} />
                        <div>
                          <span className={`font-semibold ${item.color}`}>{item.label}: </span>
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-yellow-700/30 bg-yellow-900/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      Permanent vs Temporary
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Permanent impact</strong> reflects new
                      information revealed by your order — the market adjusts permanently.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong className="text-foreground">Temporary impact</strong> is the
                      short-term price pressure from your urgency — it reverts as you stop trading.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* TC Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    Transaction Cost Breakdown
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Explicit (blue) vs Implicit (amber) costs per trade
                  </p>
                </CardHeader>
                <CardContent>
                  <TCBreakdownChart data={TC_DATA} />
                  <div className="flex gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-primary/60" />
                      <span className="text-muted-foreground">Explicit: {explicitTotal.toFixed(1)} bps</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-yellow-500/60" />
                      <span className="text-muted-foreground">Implicit: {implicitTotal.toFixed(1)} bps</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Cost Components Detail
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {TC_DATA.map((d) => (
                    <div key={d.category} className="flex items-start gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className={`flex-shrink-0 text-xs px-1.5 py-0 ${
                          d.type === "explicit"
                            ? "border-border text-primary"
                            : "border-yellow-700/50 text-yellow-400"
                        }`}
                      >
                        {d.type === "explicit" ? "EX" : "IM"}
                      </Badge>
                      <div>
                        <span className="font-medium text-foreground">{d.category}</span>
                        <span className="text-muted-foreground"> — {d.description}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab: Algo Comparison ── */}
          <TabsContent value="comparison" className="space-y-4">
            {/* Selector */}
            <div className="flex flex-wrap gap-2">
              {ALGO_DATA.map((a) => (
                <Button
                  key={a.name}
                  variant={selectedAlgo === a.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAlgo(a.name)}
                  style={selectedAlgo === a.name ? { backgroundColor: a.color, borderColor: a.color } : {}}
                >
                  {a.name}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Detail card */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">{selectedAlgoData.fullName}</CardTitle>
                    <div className="flex items-center gap-2">
                      <ComplexityBadge level={selectedAlgoData.complexity} />
                      <Badge variant="outline" className="text-xs">
                        {selectedAlgoData.typicalSlippage}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedAlgoData.useCase}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold mb-2">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Pros
                    </div>
                    <ul className="space-y-1">
                      {selectedAlgoData.pros.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Cons
                    </div>
                    <ul className="space-y-1">
                      {selectedAlgoData.cons.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison table */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Side-by-Side Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left pb-2 text-muted-foreground font-medium">Algo</th>
                          <th className="text-center pb-2 text-muted-foreground font-medium">Slippage</th>
                          <th className="text-center pb-2 text-muted-foreground font-medium">Speed</th>
                          <th className="text-center pb-2 text-muted-foreground font-medium">Complexity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ALGO_DATA.map((a) => (
                          <tr
                            key={a.name}
                            className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/30 ${
                              selectedAlgo === a.name ? "bg-muted/40" : ""
                            }`}
                            onClick={() => setSelectedAlgo(a.name)}
                          >
                            <td className="py-2 font-semibold" style={{ color: a.color }}>
                              {a.name}
                            </td>
                            <td className="py-2 text-center text-muted-foreground">{a.typicalSlippage}</td>
                            <td className="py-2 text-center text-muted-foreground">
                              {a.name === "Arrival" ? "Fast" : a.name === "TWAP" ? "Slow" : "Medium"}
                            </td>
                            <td className="py-2 text-center">
                              <ComplexityBadge level={a.complexity} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* When to use guide */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Decision Framework: Which Algo to Use?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {[
                    {
                      scenario: "Large order, passive mandate",
                      algo: "VWAP",
                      reason: "Distributes participation across the day's natural volume pattern",
                      color: "#3b82f6",
                    },
                    {
                      scenario: "Illiquid stock, predictable timing",
                      algo: "TWAP",
                      reason: "Even pacing avoids concentrating impact in specific periods",
                      color: "#8b5cf6",
                    },
                    {
                      scenario: "Alpha signal with decay",
                      algo: "Arrival Price",
                      reason: "Execute quickly near decision price before the edge evaporates",
                      color: "#ef4444",
                    },
                    {
                      scenario: "Risk-sensitive, optimize total cost",
                      algo: "IS",
                      reason: "Balances market impact and opportunity cost across risk-aversion param",
                      color: "#10b981",
                    },
                    {
                      scenario: "Anonymous participation",
                      algo: "POV",
                      reason: "Stays hidden by always trading a fixed % of observed market volume",
                      color: "#f59e0b",
                    },
                    {
                      scenario: "Basket / portfolio trade",
                      algo: "IS + dark pools",
                      reason: "Combine IS with dark pool routing to reduce cross-impact and spread",
                      color: "#06b6d4",
                    },
                  ].map((item) => (
                    <div key={item.scenario} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                      <div className="font-semibold" style={{ color: item.color }}>
                        {item.algo}
                      </div>
                      <div className="text-muted-foreground italic">{item.scenario}</div>
                      <div className="text-foreground/80">{item.reason}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Venue Analysis ── */}
          <TabsContent value="venue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Fill Rate Chart */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Venue Fill Rates
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Exchange · Dark Pool · Internalized — fill rate comparison
                  </p>
                </CardHeader>
                <CardContent>
                  <VenueChart data={venueData} />
                  <div className="flex gap-3 mt-2 text-xs flex-wrap">
                    {[
                      { type: "Exchange", color: "bg-primary/60" },
                      { type: "Dark Pool", color: "bg-primary/60" },
                      { type: "Internalized", color: "bg-green-500/60" },
                    ].map((l) => (
                      <div key={l.type} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded ${l.color}`} />
                        <span className="text-muted-foreground">{l.type}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Venue metrics table */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Venue Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left pb-2 text-muted-foreground font-medium">Venue</th>
                          <th className="text-center pb-2 text-muted-foreground font-medium">Fill %</th>
                          <th className="text-center pb-2 text-muted-foreground font-medium">Spread Cap.</th>
                          <th className="text-center pb-2 text-muted-foreground font-medium">Impact bps</th>
                          <th className="text-center pb-2 text-muted-foreground font-medium">Vol %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {venueData.map((v) => {
                          const typeColor =
                            v.type === "exchange"
                              ? "text-primary"
                              : v.type === "dark"
                              ? "text-primary"
                              : "text-green-400";
                          return (
                            <tr key={v.name} className="border-b border-border/50">
                              <td className={`py-2 font-medium ${typeColor}`}>{v.name}</td>
                              <td className="py-2 text-center text-muted-foreground">
                                {(v.fillRate * 100).toFixed(0)}%
                              </td>
                              <td className="py-2 text-center text-muted-foreground">
                                {(v.spreadCapture * 100).toFixed(0)}%
                              </td>
                              <td className="py-2 text-center text-muted-foreground">{v.impactBps}</td>
                              <td className="py-2 text-center text-muted-foreground">{v.volume}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Venue type explainers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Lit Exchanges",
                  icon: Activity,
                  color: "text-primary",
                  bg: "bg-muted/30",
                  border: "border-border",
                  points: [
                    "Fully transparent pre/post-trade",
                    "Best price discovery via NBBO",
                    "High fill certainty",
                    "Higher market impact from visibility",
                    "Examples: NYSE, NASDAQ, CBOE",
                  ],
                },
                {
                  title: "Dark Pools (ATSs)",
                  icon: Shield,
                  color: "text-primary",
                  bg: "bg-muted/30",
                  border: "border-border",
                  points: [
                    "No pre-trade transparency",
                    "Midpoint pricing (no spread cost)",
                    "Lower market impact, reduced info leakage",
                    "Uncertain fill — may not execute",
                    "Used for block trades >10k shares",
                  ],
                },
                {
                  title: "Internalization",
                  icon: Zap,
                  color: "text-green-400",
                  bg: "bg-green-900/10",
                  border: "border-green-700/30",
                  points: [
                    "Broker fills order from own inventory",
                    "Minimal market impact",
                    "Best spread capture",
                    "PFOF regulation controversy",
                    "Not available for all order types",
                  ],
                },
              ].map((section) => (
                <Card key={section.title} className={`border ${section.border} ${section.bg}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm font-semibold flex items-center gap-2 ${section.color}`}>
                      <section.icon className="w-4 h-4" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {section.points.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight className={`w-3 h-3 flex-shrink-0 mt-0.5 ${section.color}`} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Smart Order Routing */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  Smart Order Routing (SOR) Logic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  {[
                    { step: "1", label: "Price Check", desc: "Find best bid/offer across all venues via NBBO sweep", color: "bg-primary" },
                    { step: "2", label: "Dark Sweep", desc: "Check dark pools for resting liquidity at midpoint", color: "bg-primary" },
                    { step: "3", label: "IOC Lit", desc: "Send immediate-or-cancel orders to lit venues with price improvement", color: "bg-green-500" },
                    { step: "4", label: "Post & Internalize", desc: "Post remainder or internalize if broker has inventory", color: "bg-yellow-500" },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-3 p-3 rounded-lg border border-border bg-muted/20">
                      <div className={`w-6 h-6 rounded-full ${item.color} flex items-center justify-center text-foreground font-bold flex-shrink-0`}>
                        {item.step}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground mb-0.5">{item.label}</div>
                        <div className="text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
