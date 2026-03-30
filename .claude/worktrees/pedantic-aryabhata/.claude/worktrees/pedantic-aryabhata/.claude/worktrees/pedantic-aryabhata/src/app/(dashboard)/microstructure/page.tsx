"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign,
  Layers,
  Clock,
  Info,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  RefreshCw,
  Scale,
  Network,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 793;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate all random values up front
const _r: number[] = [];
for (let i = 0; i < 500; i++) _r.push(rand());
let _ri = 0;
const rnd = () => _r[_ri++ % _r.length];

// ── Types ──────────────────────────────────────────────────────────────────────
interface OrderLevel {
  price: number;
  size: number;
  cumSize: number;
  side: "bid" | "ask";
}

interface ImpactPoint {
  tradeSize: number; // shares (thousands)
  impact: number; // bps
}

interface SpreadPoint {
  hour: number;
  spread: number; // bps
  label: string;
}

interface ExchangeShare {
  name: string;
  abbr: string;
  share: number;
  color: string;
  type: string;
}

interface OrderTypeRow {
  name: string;
  abbr: string;
  fillCertainty: "High" | "Medium" | "Low" | "Conditional";
  priceRisk: "None" | "Low" | "Medium" | "High";
  speedRisk: "Fast" | "Medium" | "Slow";
  pros: string[];
  cons: string[];
  bestFor: string;
}

// ── Static data (deterministic) ────────────────────────────────────────────────
function buildOrderBook(): OrderLevel[] {
  const midPrice = 182.5;
  const tickSize = 0.01;
  const levels: OrderLevel[] = [];

  // bids: from mid-1 tick down
  let cumBid = 0;
  for (let i = 0; i < 12; i++) {
    const price = +(midPrice - tickSize * (i + 1)).toFixed(2);
    const size = Math.round(500 + rnd() * 4500);
    cumBid += size;
    levels.push({ price, size, cumSize: cumBid, side: "bid" });
  }

  // asks: from mid+1 tick up
  let cumAsk = 0;
  for (let i = 0; i < 12; i++) {
    const price = +(midPrice + tickSize * (i + 1)).toFixed(2);
    const size = Math.round(500 + rnd() * 4500);
    cumAsk += size;
    levels.push({ price, size, cumSize: cumAsk, side: "ask" });
  }

  return levels;
}

function buildImpactCurve(): ImpactPoint[] {
  const points: ImpactPoint[] = [];
  for (let k = 0; k <= 20; k++) {
    const tradeSize = k * 5; // 0 to 100k shares
    // Almgren-Chriss: impact ≈ η * σ * sqrt(v/V) + permanent impact
    const sqrtComponent = Math.sqrt(tradeSize / 100) * 18;
    const linearComponent = tradeSize * 0.04;
    const impact = sqrtComponent + linearComponent + rnd() * 1.5;
    points.push({ tradeSize, impact: +impact.toFixed(2) });
  }
  return points;
}

function buildSpreadPattern(): SpreadPoint[] {
  const sessions = [
    { hour: 9.5, label: "9:30" },
    { hour: 10, label: "10:00" },
    { hour: 10.5, label: "10:30" },
    { hour: 11, label: "11:00" },
    { hour: 11.5, label: "11:30" },
    { hour: 12, label: "12:00" },
    { hour: 12.5, label: "12:30" },
    { hour: 13, label: "13:00" },
    { hour: 13.5, label: "13:30" },
    { hour: 14, label: "14:00" },
    { hour: 14.5, label: "14:30" },
    { hour: 15, label: "15:00" },
    { hour: 15.5, label: "15:30" },
    { hour: 16, label: "16:00" },
  ];
  return sessions.map(({ hour, label }) => {
    // U-shape: high at open/close, low in midday
    const t = (hour - 9.5) / 6.5; // 0..1
    const uShape = 4 * (t - 0.5) * (t - 0.5); // 0..1 parabola
    const spread = 2.5 + uShape * 9.5 + rnd() * 1.2;
    return { hour, spread: +spread.toFixed(2), label };
  });
}

const EXCHANGE_SHARES: ExchangeShare[] = [
  { name: "NYSE", abbr: "NYSE", share: 22.4, color: "#3b82f6", type: "Lit Exchange" },
  { name: "NASDAQ", abbr: "NSDQ", share: 18.7, color: "#8b5cf6", type: "Lit Exchange" },
  { name: "CBOE EDGX", abbr: "EDGX", share: 11.2, color: "#06b6d4", type: "Lit Exchange" },
  { name: "CBOE BZX", abbr: "BZX", share: 9.8, color: "#14b8a6", type: "Lit Exchange" },
  { name: "IEX", abbr: "IEX", share: 3.1, color: "#84cc16", type: "Lit Exchange" },
  { name: "Dark Pools", abbr: "Dark", share: 14.6, color: "#f59e0b", type: "Dark Pool" },
  { name: "Internalized", abbr: "PFOF", share: 12.3, color: "#ef4444", type: "Internalized" },
  { name: "Other ATS", abbr: "ATS", share: 7.9, color: "#6b7280", type: "ATS" },
];

const ORDER_TYPES: OrderTypeRow[] = [
  {
    name: "Market Order",
    abbr: "MKT",
    fillCertainty: "High",
    priceRisk: "High",
    speedRisk: "Fast",
    pros: ["Immediate fill", "Simple execution", "Full size guaranteed"],
    cons: ["No price control", "High slippage in illiquid stocks", "Vulnerable to gaps"],
    bestFor: "Highly liquid large-caps where speed > price",
  },
  {
    name: "Limit Order",
    abbr: "LMT",
    fillCertainty: "Conditional",
    priceRisk: "None",
    speedRisk: "Slow",
    pros: ["Price certainty", "Adds liquidity (may earn rebate)", "Controls slippage"],
    cons: ["May not fill", "Opportunity cost if market moves away", "Partial fills possible"],
    bestFor: "Illiquid stocks, large positions, patient traders",
  },
  {
    name: "Stop Order",
    abbr: "STP",
    fillCertainty: "Conditional",
    priceRisk: "Medium",
    speedRisk: "Fast",
    pros: ["Automates risk management", "Triggers on breakouts", "No monitoring needed"],
    cons: ["Converts to market on trigger", "Gap risk at open", "Can be hunted by algos"],
    bestFor: "Stop-loss protection, breakout entries",
  },
  {
    name: "Immediate-or-Cancel",
    abbr: "IOC",
    fillCertainty: "Low",
    priceRisk: "Low",
    speedRisk: "Fast",
    pros: ["No residual resting orders", "Fast partial fill", "Clean cancel on remainder"],
    cons: ["Partial fills accepted", "May fill only a small portion", "Algorithmic only"],
    bestFor: "Algo trading when partial fills are acceptable",
  },
  {
    name: "Fill-or-Kill",
    abbr: "FOK",
    fillCertainty: "Low",
    priceRisk: "None",
    speedRisk: "Fast",
    pros: ["All-or-nothing certainty", "No partial fill risk", "Avoids size discovery"],
    cons: ["High rejection rate in thin markets", "Requires large resting liquidity"],
    bestFor: "Block trades, institutional size requirements",
  },
  {
    name: "Pegged Order",
    abbr: "PEG",
    fillCertainty: "Medium",
    priceRisk: "Low",
    speedRisk: "Medium",
    pros: ["Tracks NBBO automatically", "Competes dynamically", "Common in dark pools"],
    cons: ["Latency sensitivity", "Complex order type", "Exchange-specific rules"],
    bestFor: "Dark pool execution, midpoint liquidity seeking",
  },
];

// ── Framer variants ────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ── SVG helpers ────────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Level 2 order book depth chart */
function OrderBookSVG({ levels }: { levels: OrderLevel[] }) {
  const W = 560;
  const H = 300;
  const PAD = { top: 24, right: 16, bottom: 40, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const bids = levels.filter((l) => l.side === "bid").sort((a, b) => b.price - a.price);
  const asks = levels.filter((l) => l.side === "ask").sort((a, b) => a.price - b.price);

  const maxCum = Math.max(
    bids[bids.length - 1]?.cumSize ?? 1,
    asks[asks.length - 1]?.cumSize ?? 1
  );

  const allPrices = levels.map((l) => l.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;

  const px = (price: number) =>
    PAD.left + ((price - minPrice) / (priceRange || 1)) * innerW;
  const py = (cum: number) =>
    PAD.top + innerH - (cum / maxCum) * innerH;

  // Build step paths
  const bidPath = bids.map((l, i) => {
    const x = px(l.price);
    const y = py(l.cumSize);
    if (i === 0) return `M ${x} ${PAD.top + innerH} L ${x} ${y}`;
    const prev = bids[i - 1];
    return `L ${px(prev.price)} ${y} L ${x} ${y}`;
  }).join(" ");

  const askPath = asks.map((l, i) => {
    const x = px(l.price);
    const y = py(l.cumSize);
    if (i === 0) return `M ${x} ${PAD.top + innerH} L ${x} ${y}`;
    const prev = asks[i - 1];
    return `L ${px(prev.price)} ${y} L ${x} ${y}`;
  }).join(" ");

  const midPrice = 182.5;
  const midX = px(midPrice);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD.top + innerH - f * innerH,
    label: Math.round(f * maxCum / 1000) + "K",
  }));

  const xTickPrices = [minPrice, minPrice + priceRange * 0.25, midPrice, minPrice + priceRange * 0.75, maxPrice];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 300 }}>
      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <line
          key={i}
          x1={PAD.left}
          x2={PAD.left + innerW}
          y1={t.y}
          y2={t.y}
          stroke="rgba(255,255,255,0.06)"
          strokeDasharray="3,3"
        />
      ))}

      {/* Bid area fill */}
      <path
        d={bidPath + ` L ${px(bids[bids.length - 1]?.price ?? minPrice)} ${PAD.top + innerH} Z`}
        fill="rgba(34,197,94,0.15)"
        stroke="none"
      />
      {/* Bid step line */}
      <path d={bidPath} fill="none" stroke="#22c55e" strokeWidth={2} />

      {/* Ask area fill */}
      <path
        d={askPath + ` L ${px(asks[asks.length - 1]?.price ?? maxPrice)} ${PAD.top + innerH} Z`}
        fill="rgba(239,68,68,0.15)"
        stroke="none"
      />
      {/* Ask step line */}
      <path d={askPath} fill="none" stroke="#ef4444" strokeWidth={2} />

      {/* Mid price line */}
      <line
        x1={midX}
        x2={midX}
        y1={PAD.top}
        y2={PAD.top + innerH}
        stroke="rgba(251,191,36,0.7)"
        strokeWidth={1.5}
        strokeDasharray="4,3"
      />
      <text x={midX + 4} y={PAD.top + 14} fill="#fbbf24" fontSize={10}>
        Mid $182.50
      </text>

      {/* Y-axis labels */}
      {yTicks.map((t, i) => (
        <text key={i} x={PAD.left - 6} y={t.y + 4} textAnchor="end" fill="rgba(255,255,255,0.45)" fontSize={9}>
          {t.label}
        </text>
      ))}

      {/* X-axis labels */}
      {xTickPrices.map((p, i) => (
        <text
          key={i}
          x={px(p)}
          y={PAD.top + innerH + 16}
          textAnchor="middle"
          fill="rgba(255,255,255,0.45)"
          fontSize={9}
        >
          {p.toFixed(2)}
        </text>
      ))}

      {/* Legend */}
      <rect x={PAD.left} y={PAD.top + innerH + 26} width={10} height={10} fill="rgba(34,197,94,0.6)" rx={2} />
      <text x={PAD.left + 14} y={PAD.top + innerH + 35} fill="rgba(255,255,255,0.6)" fontSize={10}>Bid depth</text>
      <rect x={PAD.left + 80} y={PAD.top + innerH + 26} width={10} height={10} fill="rgba(239,68,68,0.6)" rx={2} />
      <text x={PAD.left + 94} y={PAD.top + innerH + 35} fill="rgba(255,255,255,0.6)" fontSize={10}>Ask depth</text>
    </svg>
  );
}

/** Almgren-Chriss price impact curve */
function PriceImpactSVG({ points }: { points: ImpactPoint[] }) {
  const W = 540;
  const H = 280;
  const PAD = { top: 24, right: 20, bottom: 44, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxImpact = Math.max(...points.map((p) => p.impact));
  const maxSize = 100; // k shares

  const px = (size: number) => PAD.left + (size / maxSize) * innerW;
  const py = (impact: number) => PAD.top + innerH - (impact / (maxImpact * 1.05)) * innerH;

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${px(p.tradeSize)} ${py(p.impact)}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${px(points[points.length - 1].tradeSize)} ${PAD.top + innerH} L ${px(0)} ${PAD.top + innerH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD.top + innerH - f * innerH,
    label: Math.round(f * maxImpact * 1.05) + "bp",
  }));

  const xTicks = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 280 }}>
      {/* Grid */}
      {yTicks.map((t, i) => (
        <line
          key={i}
          x1={PAD.left}
          x2={PAD.left + innerW}
          y1={t.y}
          y2={t.y}
          stroke="rgba(255,255,255,0.06)"
          strokeDasharray="3,3"
        />
      ))}

      {/* Area under curve */}
      <path d={areaD} fill="rgba(99,102,241,0.15)" />

      {/* Curve */}
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinejoin="round" />

      {/* Axes */}
      <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + innerH} stroke="rgba(255,255,255,0.2)" />
      <line x1={PAD.left} x2={PAD.left + innerW} y1={PAD.top + innerH} y2={PAD.top + innerH} stroke="rgba(255,255,255,0.2)" />

      {/* Y-axis labels */}
      {yTicks.map((t, i) => (
        <text key={i} x={PAD.left - 6} y={t.y + 4} textAnchor="end" fill="rgba(255,255,255,0.45)" fontSize={9}>
          {t.label}
        </text>
      ))}

      {/* X-axis labels */}
      {xTicks.map((v, i) => (
        <text key={i} x={px(v)} y={PAD.top + innerH + 14} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={9}>
          {v}K
        </text>
      ))}

      {/* Axis labels */}
      <text
        x={PAD.left + innerW / 2}
        y={H - 4}
        textAnchor="middle"
        fill="rgba(255,255,255,0.4)"
        fontSize={10}
      >
        Trade size (shares)
      </text>
      <text
        x={14}
        y={PAD.top + innerH / 2}
        textAnchor="middle"
        fill="rgba(255,255,255,0.4)"
        fontSize={10}
        transform={`rotate(-90, 14, ${PAD.top + innerH / 2})`}
      >
        Market impact (bps)
      </text>

      {/* Annotation */}
      <circle cx={px(50)} cy={py(points[10].impact)} r={4} fill="#6366f1" />
      <text x={px(50) + 8} y={py(points[10].impact) - 6} fill="#a5b4fc" fontSize={10}>
        50K = {points[10].impact.toFixed(1)}bp
      </text>
    </svg>
  );
}

/** Intraday U-shaped bid-ask spread */
function IntradaySpreadSVG({ points }: { points: SpreadPoint[] }) {
  const W = 540;
  const H = 260;
  const PAD = { top: 24, right: 20, bottom: 44, left: 52 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxSpread = Math.max(...points.map((p) => p.spread));
  const minSpread = Math.min(...points.map((p) => p.spread));
  const spreadRange = maxSpread - minSpread;

  const n = points.length;
  const px = (i: number) => PAD.left + (i / (n - 1)) * innerW;
  const py = (spread: number) =>
    PAD.top + innerH - ((spread - minSpread) / (spreadRange * 1.1 || 1)) * innerH;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(p.spread)}`).join(" ");
  const areaD =
    pathD + ` L ${px(n - 1)} ${PAD.top + innerH} L ${px(0)} ${PAD.top + innerH} Z`;

  const yTicks = [0, 0.3, 0.6, 1].map((f) => ({
    y: PAD.top + innerH - f * innerH,
    label: (minSpread + f * spreadRange * 1.1).toFixed(1) + "bp",
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
      {/* Grid */}
      {yTicks.map((t, i) => (
        <line
          key={i}
          x1={PAD.left}
          x2={PAD.left + innerW}
          y1={t.y}
          y2={t.y}
          stroke="rgba(255,255,255,0.06)"
          strokeDasharray="3,3"
        />
      ))}

      {/* Gradient area */}
      <defs>
        <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#spreadGrad)" />
      <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeLinejoin="round" />

      {/* Axes */}
      <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + innerH} stroke="rgba(255,255,255,0.2)" />
      <line x1={PAD.left} x2={PAD.left + innerW} y1={PAD.top + innerH} y2={PAD.top + innerH} stroke="rgba(255,255,255,0.2)" />

      {/* Y-axis labels */}
      {yTicks.map((t, i) => (
        <text key={i} x={PAD.left - 6} y={t.y + 4} textAnchor="end" fill="rgba(255,255,255,0.45)" fontSize={9}>
          {t.label}
        </text>
      ))}

      {/* X-axis labels (every 2nd point) */}
      {points.map((p, i) =>
        i % 2 === 0 ? (
          <text
            key={i}
            x={px(i)}
            y={PAD.top + innerH + 14}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize={9}
          >
            {p.label}
          </text>
        ) : null
      )}

      {/* Annotations */}
      <text x={px(0) + 4} y={py(points[0].spread) - 8} fill="#fbbf24" fontSize={9}>
        Open spike
      </text>
      <text x={px(n - 1) - 60} y={py(points[n - 1].spread) - 8} fill="#fbbf24" fontSize={9}>
        Close spike
      </text>
      <text x={px(7)} y={py(points[7].spread) + 16} fill="rgba(255,255,255,0.5)" fontSize={9}>
        Midday trough
      </text>

      {/* Axis label */}
      <text
        x={PAD.left + innerW / 2}
        y={H - 4}
        textAnchor="middle"
        fill="rgba(255,255,255,0.4)"
        fontSize={10}
      >
        Time of day (Eastern)
      </text>
    </svg>
  );
}

/** Exchange fragmentation pie chart */
function FragmentationPieSVG({ exchanges }: { exchanges: ExchangeShare[] }) {
  const W = 480;
  const H = 280;
  const cx = 150;
  const cy = 130;
  const R = 100;
  const rInner = 55;

  const total = exchanges.reduce((a, e) => a + e.share, 0);
  let angle = -Math.PI / 2;

  const slices = exchanges.map((e) => {
    const startAngle = angle;
    const sweep = (e.share / total) * 2 * Math.PI;
    angle += sweep;
    const endAngle = angle;
    const midAngle = (startAngle + endAngle) / 2;
    return { ...e, startAngle, endAngle, midAngle };
  });

  function arcPath(start: number, end: number, r: number, ri: number) {
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const xi1 = cx + ri * Math.cos(end);
    const yi1 = cy + ri * Math.sin(end);
    const xi2 = cx + ri * Math.cos(start);
    const yi2 = cy + ri * Math.sin(start);
    const largeArc = end - start > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${ri} ${ri} 0 ${largeArc} 0 ${xi2} ${yi2} Z`;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 280 }}>
      {/* Pie slices */}
      {slices.map((sl, i) => (
        <path key={i} d={arcPath(sl.startAngle, sl.endAngle, R, rInner)} fill={sl.color} opacity={0.85} />
      ))}

      {/* Center label */}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={11} fontWeight="600">
        US Equity
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={11} fontWeight="600">
        Volume
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={9}>
        ~12B shares/day
      </text>

      {/* Legend */}
      {exchanges.map((e, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const lx = 300 + col * 90;
        const ly = 20 + row * 28;
        return (
          <g key={i}>
            <rect x={lx} y={ly} width={10} height={10} fill={e.color} rx={2} opacity={0.85} />
            <text x={lx + 14} y={ly + 9} fill="rgba(255,255,255,0.7)" fontSize={10}>
              {e.abbr}
            </text>
            <text x={lx + 50} y={ly + 9} fill="rgba(255,255,255,0.45)" fontSize={10}>
              {e.share.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function MicrostructurePage() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const levels = useMemo(() => buildOrderBook(), []);
  const impactPoints = useMemo(() => buildImpactCurve(), []);
  const spreadPoints = useMemo(() => buildSpreadPattern(), []);

  const bids = levels.filter((l) => l.side === "bid");
  const asks = levels.filter((l) => l.side === "ask");

  // Key metrics
  const nbboSpread = (asks[0].price - bids[0].price).toFixed(2);
  const nbboSpreadBps = (((asks[0].price - bids[0].price) / 182.5) * 10000).toFixed(1);
  const totalBidDepth = (bids.reduce((a, b) => a + b.size, 0) / 1e6).toFixed(2);
  const totalAskDepth = (asks.reduce((a, b) => a + b.size, 0) / 1e6).toFixed(2);
  const marketDepth = (parseFloat(totalBidDepth) + parseFloat(totalAskDepth)).toFixed(2);

  const certColor = (c: string) => {
    if (c === "High") return "text-green-400";
    if (c === "Medium") return "text-yellow-400";
    if (c === "Low") return "text-red-400";
    return "text-primary";
  };

  const riskColor = (r: string) => {
    if (r === "None" || r === "Fast") return "text-green-400";
    if (r === "Low" || r === "Medium") return "text-yellow-400";
    return "text-red-400";
  };

  const selectedOrderData = ORDER_TYPES.find((o) => o.abbr === selectedOrder);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4 space-y-4">
      {/* ── Header ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary" />
            Equity Market Microstructure
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bid-ask spreads, price impact, market quality metrics, and execution dynamics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
            <RefreshCw className="w-3 h-3" />
            Live Snapshot
          </Badge>
          <Badge variant="outline" className="text-xs gap-1 text-green-400 border-green-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Market Open
          </Badge>
        </div>
      </motion.div>

      {/* ── Key Metrics Row — Hero ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, delay: 0.08 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-md border border-border bg-card border-l-4 border-l-primary p-6"
      >
        {[
          {
            icon: <Scale className="w-3.5 h-3.5 text-muted-foreground/50" />,
            label: "NBBO Spread",
            value: `$${nbboSpread}`,
            sub: `${nbboSpreadBps} bps`,
            trend: "down",
            trendLabel: "vs. 30d avg",
          },
          {
            icon: <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />,
            label: "Market Depth",
            value: `$${marketDepth}M`,
            sub: "Top 12 levels",
            trend: "up",
            trendLabel: "above avg",
          },
          {
            icon: <Zap className="w-4 h-4 text-amber-400" />,
            label: "HFT Volume %",
            value: "48.3%",
            sub: "of total volume",
            trend: "neutral",
            trendLabel: "in-line",
          },
          {
            icon: <Network className="w-4 h-4 text-green-400" />,
            label: "Trade-Through Rate",
            value: "0.04%",
            sub: "NBBO violations",
            trend: "down",
            trendLabel: "low quality risk",
          },
        ].map((m, i) => (
          <Card key={i} className="border-border">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {m.icon}
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                {m.trend === "up" && <TrendingUp className="w-3 h-3 text-green-400" />}
                {m.trend === "down" && <TrendingDown className="w-3 h-3 text-primary" />}
              </div>
              <div className="mt-2">
                <div className="text-xl font-semibold">{m.value}</div>
                <div className="text-xs text-muted-foreground">{m.sub}</div>
              </div>
              <div className="text-xs text-muted-foreground mt-1 opacity-60">{m.trendLabel}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, delay: 0.16 }}
      >
        <Tabs defaultValue="orderbook">
          <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
            <TabsTrigger value="orderbook" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Order Book</TabsTrigger>
            <TabsTrigger value="pricediscovery" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Price Discovery</TabsTrigger>
            <TabsTrigger value="liquidity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Liquidity</TabsTrigger>
            <TabsTrigger value="fragmentation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Fragmentation</TabsTrigger>
          </TabsList>

          {/* ── Order Book Tab ── */}
          <TabsContent value="orderbook" className="data-[state=inactive]:hidden space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* L2 Depth Chart */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
                    Level 2 Depth — AAPL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderBookSVG levels={levels} />
                </CardContent>
              </Card>

              {/* Ladder view */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
                    Order Book Ladder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0.5 text-xs text-muted-foreground font-mono">
                    {/* Header */}
                    <div className="grid grid-cols-3 text-muted-foreground border-b border-border pb-1 mb-2">
                      <span>Size</span>
                      <span className="text-center">Price</span>
                      <span className="text-right">Size</span>
                    </div>

                    {/* Ask levels (reversed — highest ask on top) */}
                    {asks.slice(0, 8).reverse().map((a, i) => (
                      <div key={i} className="grid grid-cols-3 items-center py-0.5 relative">
                        <div className="absolute inset-0 right-1/2" />
                        <span className="text-muted-foreground" />
                        <span className="text-center text-red-400 font-semibold">${a.price.toFixed(2)}</span>
                        <div className="relative">
                          <div
                            className="absolute top-0 left-0 h-full bg-red-500/5 rounded-sm"
                            style={{ width: `${clamp((a.size / 5000) * 100, 5, 100)}%` }}
                          />
                          <span className="relative text-right block text-red-300">{a.size.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}

                    {/* Spread row */}
                    <div className="grid grid-cols-3 border-y border-border py-1 my-1">
                      <span className="text-muted-foreground text-xs">SPREAD</span>
                      <span className="text-center text-amber-400">${nbboSpread}</span>
                      <span className="text-right text-muted-foreground text-xs">{nbboSpreadBps}bp</span>
                    </div>

                    {/* Bid levels */}
                    {bids.slice(0, 8).map((b, i) => (
                      <div key={i} className="grid grid-cols-3 items-center py-0.5 relative">
                        <div className="relative">
                          <div
                            className="absolute top-0 right-0 h-full bg-green-500/10 rounded-sm"
                            style={{ width: `${clamp((b.size / 5000) * 100, 5, 100)}%` }}
                          />
                          <span className="relative text-green-300">{b.size.toLocaleString()}</span>
                        </div>
                        <span className="text-center text-green-400 font-semibold">${b.price.toFixed(2)}</span>
                        <span className="text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* NBBO explanation */}
            <Card className="border-border border-border bg-muted/5">
              <CardContent className="pt-4 pb-3">
                <div className="flex gap-3">
                  <Info className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">National Best Bid and Offer (NBBO)</p>
                    <p>
                      Reg NMS requires broker-dealers to route orders to the exchange displaying the best price.
                      The NBBO aggregates the best bid and ask across all 16 registered equity exchanges.
                      A tighter spread indicates better market quality and lower execution costs.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="text-green-400">Best Bid: ${bids[0].price.toFixed(2)}</span>
                      <span className="text-red-400">Best Ask: ${asks[0].price.toFixed(2)}</span>
                      <span className="text-amber-400">Mid: $182.50</span>
                      <span className="text-primary">Spread: {nbboSpreadBps}bps</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Price Discovery Tab ── */}
          <TabsContent value="pricediscovery" className="data-[state=inactive]:hidden space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Market Impact (Almgren-Chriss)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PriceImpactSVG points={impactPoints} />
                  <p className="text-xs text-muted-foreground mt-2">
                    Estimated price impact in basis points vs. order size. Larger orders move the market disproportionately due to temporary and permanent impact components.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    Price Discovery Concepts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      title: "Permanent Impact",
                      desc: "Information content of trade permanently shifts the equilibrium price. Informed traders cause larger permanent moves.",
                      color: "text-red-400",
                    },
                    {
                      title: "Temporary Impact",
                      desc: "Liquidity-driven price displacement that mean-reverts after order completion. Inversely proportional to market depth.",
                      color: "text-amber-400",
                    },
                    {
                      title: "Implementation Shortfall",
                      desc: "Total cost = market impact + timing risk + spread costs. Measured as deviation from arrival price benchmark.",
                      color: "text-primary",
                    },
                    {
                      title: "VWAP Execution",
                      desc: "Participates in market volume proportionally throughout the day to minimize market impact on large orders.",
                      color: "text-green-400",
                    },
                    {
                      title: "Kyle's Lambda",
                      desc: "Empirical measure of price impact per unit of order flow imbalance. Higher λ = less liquid market.",
                      color: "text-primary",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <ArrowRight className={cn("w-3 h-3 mt-1 shrink-0", item.color)} />
                      <div>
                        <div className={cn("text-xs text-muted-foreground font-medium", item.color)}>{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order type table */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Order Type Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Type</th>
                        <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Fill</th>
                        <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Price Risk</th>
                        <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Speed</th>
                        <th className="text-left py-2 text-muted-foreground font-medium">Best For</th>
                        <th className="py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {ORDER_TYPES.map((o) => (
                        <tr
                          key={o.abbr}
                          className={cn(
                            "border-b border-border cursor-pointer transition-colors hover:bg-muted/30",
                            selectedOrder === o.abbr && "bg-muted/50"
                          )}
                          onClick={() =>
                            setSelectedOrder(selectedOrder === o.abbr ? null : o.abbr)
                          }
                        >
                          <td className="py-2 pr-3">
                            <span className="font-medium">{o.name}</span>
                            <Badge variant="outline" className="ml-1.5 text-xs text-muted-foreground px-1 py-0">
                              {o.abbr}
                            </Badge>
                          </td>
                          <td className={cn("py-2 pr-3", certColor(o.fillCertainty))}>
                            {o.fillCertainty}
                          </td>
                          <td className={cn("py-2 pr-3", riskColor(o.priceRisk))}>
                            {o.priceRisk}
                          </td>
                          <td className={cn("py-2 pr-3", riskColor(o.speedRisk))}>
                            {o.speedRisk}
                          </td>
                          <td className="py-2 text-muted-foreground max-w-[200px]">
                            {o.bestFor}
                          </td>
                          <td className="py-2 pl-2">
                            <ArrowRight
                              className={cn(
                                "w-3 h-3 transition-transform text-muted-foreground",
                                selectedOrder === o.abbr && "rotate-90"
                              )}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Expanded order detail */}
                {selectedOrderData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="text-sm font-medium mb-2">{selectedOrderData.name}</div>
                    <div className="grid md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div>
                        <div className="flex items-center gap-1 text-green-400 mb-1">
                          <CheckCircle className="w-3 h-3" />
                          <span className="font-medium">Pros</span>
                        </div>
                        <ul className="space-y-0.5 text-muted-foreground">
                          {selectedOrderData.pros.map((p, i) => (
                            <li key={i} className="flex gap-1">
                              <span className="text-green-400">+</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-red-400 mb-1">
                          <XCircle className="w-3 h-3" />
                          <span className="font-medium">Cons</span>
                        </div>
                        <ul className="space-y-0.5 text-muted-foreground">
                          {selectedOrderData.cons.map((c, i) => (
                            <li key={i} className="flex gap-1">
                              <span className="text-red-400">-</span> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Liquidity Tab ── */}
          <TabsContent value="liquidity" className="data-[state=inactive]:hidden space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Intraday Spread Pattern (U-Shape)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <IntradaySpreadSVG points={spreadPoints} />
                  <p className="text-xs text-muted-foreground mt-2">
                    Spreads are widest at open (information asymmetry, overnight news) and close (inventory risk, end-of-day positioning), narrowest midday.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    Liquidity Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      metric: "Effective Spread",
                      value: "0.018%",
                      benchmark: "0.022%",
                      label: "vs. 30d avg",
                      color: "bg-green-500",
                      pct: 82,
                      note: "Better than average — tight market",
                    },
                    {
                      metric: "Realized Spread",
                      value: "0.007%",
                      benchmark: "0.010%",
                      label: "vs. 30d avg",
                      color: "bg-primary",
                      pct: 70,
                      note: "Dealer profit component post-trade",
                    },
                    {
                      metric: "Price Impact (5min)",
                      value: "0.011%",
                      benchmark: "0.012%",
                      label: "vs. 30d avg",
                      color: "bg-primary",
                      pct: 92,
                      note: "Adverse selection component",
                    },
                    {
                      metric: "Amihud Illiquidity",
                      value: "0.0082",
                      benchmark: "0.0091",
                      label: "vs. 30d avg",
                      color: "bg-amber-500",
                      pct: 90,
                      note: "|Return| / Volume — lower is better",
                    },
                    {
                      metric: "Turnover Ratio",
                      value: "1.24%",
                      benchmark: "1.05%",
                      label: "vs. 30d avg",
                      color: "bg-teal-500",
                      pct: 88,
                      note: "Daily volume / market cap",
                    },
                  ].map((m, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span className="font-medium">{m.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{m.value}</span>
                          <span className="text-muted-foreground">{m.label}: {m.benchmark}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", m.color)}
                          style={{ width: `${m.pct}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{m.note}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Liquidity providers */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Market Maker Ecosystem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    {
                      name: "Designated Market Makers",
                      abbr: "DMMs",
                      role: "NYSE-assigned, must quote within price bands, capital commitment required",
                      share: "18%",
                      icon: <Scale className="w-3.5 h-3.5 text-muted-foreground/50" />,
                      badge: "Obligated",
                    },
                    {
                      name: "Registered Market Makers",
                      abbr: "RMMs",
                      role: "NASDAQ structure, competitive quoting, earn maker rebates for adding liquidity",
                      share: "34%",
                      icon: <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />,
                      badge: "Competitive",
                    },
                    {
                      name: "HFT Proprietary",
                      abbr: "HFT",
                      role: "Speed-driven, no formal obligations. Quote and cancel in microseconds. 48% of volume.",
                      share: "48%",
                      icon: <Zap className="w-4 h-4 text-amber-400" />,
                      badge: "Voluntary",
                    },
                  ].map((mm, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {mm.icon}
                          <span className="text-sm font-medium">{mm.abbr}</span>
                        </div>
                        <Badge variant="outline" className="text-xs text-muted-foreground">{mm.badge}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">{mm.name}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">{mm.role}</div>
                      <div className="mt-2 text-sm font-semibold">{mm.share} <span className="text-xs font-normal text-muted-foreground">of volume</span></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Fragmentation Tab ── */}
          <TabsContent value="fragmentation" className="data-[state=inactive]:hidden space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Network className="w-3.5 h-3.5 text-muted-foreground/50" />
                    US Equity Market Share
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FragmentationPieSVG exchanges={EXCHANGE_SHARES} />
                  <p className="text-xs text-muted-foreground mt-2">
                    US equity trading is fragmented across 16 registered exchanges, ~30 ATSs, and internalizers. Lit exchange share has declined from ~75% (2005) to ~55% (2024).
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Fragmentation Implications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      title: "Order Routing Complexity",
                      desc: "Smart Order Routers (SOR) must evaluate 16+ venues simultaneously, optimizing for price, size, speed, and rebate economics.",
                      icon: <Network className="w-3.5 h-3.5 text-primary" />,
                    },
                    {
                      title: "Maker-Taker Model",
                      desc: "Exchanges pay rebates (≈$0.002/share) to liquidity providers, charge fees to takers. Payment for order flow routes retail to internalizers.",
                      icon: <DollarSign className="w-3.5 h-3.5 text-green-400" />,
                    },
                    {
                      title: "IEX Speed Bump",
                      desc: "350-microsecond delay (38-mile fiber coil) prevents latency arbitrage, protecting resting orders from being picked off.",
                      icon: <Clock className="w-3.5 h-3.5 text-emerald-400" />,
                    },
                    {
                      title: "Dark Pool Benefits",
                      desc: "Institutional orders trade at midpoint with minimal market impact. Block prints often appear in FINRA ATS data with a delay.",
                      icon: <Layers className="w-3.5 h-3.5 text-primary" />,
                    },
                    {
                      title: "Reg NMS Trade-Through",
                      desc: "Exchanges cannot execute orders at prices inferior to the NBBO. Intermarket sweep orders (ISOs) allow simultaneous multi-venue sweeps.",
                      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="mt-0.5 shrink-0">{item.icon}</div>
                      <div>
                        <div className="text-xs text-muted-foreground font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Exchange comparison table */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Key Venue Characteristics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border">
                        {["Venue", "Type", "Market Share", "Fee Model", "Unique Feature"].map((h) => (
                          <th key={h} className="text-left py-2 pr-4 text-muted-foreground font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["NYSE", "Lit Exchange", "22.4%", "Maker-Taker", "DMM obligation, NYSE floor"],
                        ["NASDAQ", "Lit Exchange", "18.7%", "Maker-Taker", "Electronic, multiple protocols"],
                        ["CBOE EDGX", "Lit Exchange", "11.2%", "Taker-Maker", "Inverted fee schedule"],
                        ["IEX", "Lit Exchange", "3.1%", "Flat $0.0009", "350μs speed bump (POP)"],
                        ["Dark Pools", "ATS (Dark)", "14.6%", "Midpoint", "Minimize market impact"],
                        ["Internalized", "Off-exchange", "12.3%", "PFOF", "Retail price improvement"],
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-border hover:bg-muted/20 transition-colors">
                          {row.map((cell, j) => (
                            <td key={j} className={cn("py-2 pr-4", j === 0 && "font-medium")}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Regulatory note */}
            <Card className="border-border border-amber-500/20 bg-amber-500/5">
              <CardContent className="pt-4 pb-3">
                <div className="flex gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">SEC Rule 605/606 Reform (2024):</span>{" "}
                    The SEC&apos;s new rules require granular order execution quality disclosure by broker-dealers and enhance best execution obligations.
                    Proposed tick size harmonization and PFOF restrictions are designed to improve retail investor outcomes across all venues.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ── Footer disclaimer ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, delay: 0.24 }}
        className="text-xs text-muted-foreground text-center pb-2"
      >
        Order book data is synthetic for educational purposes. Market microstructure concepts are based on academic literature and industry practice.
      </motion.div>
    </div>
  );
}
