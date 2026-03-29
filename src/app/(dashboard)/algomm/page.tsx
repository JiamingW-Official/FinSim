"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Zap,
  DollarSign,
  AlertTriangle,
  Clock,
  Shield,
  ChevronRight,
  Target,
  Cpu,
  Gauge,
  ArrowUpDown,
  Lock,
  CheckCircle as CheckCircleIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ─────────────────────────────────────────────────────────────

let s = 702002;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed: number = 702002) {
  s = seed;
}

// ── Utility helpers ─────────────────────────────────────────────────────────

const fmt2 = (n: number) => n.toFixed(2);
const fmt4 = (n: number) => n.toFixed(4);
const fmtK = (n: number) =>
  Math.abs(n) >= 1000 ? (n / 1000).toFixed(1) + "k" : n.toFixed(0);
const fmtDollar = (n: number) =>
  (n < 0 ? "-$" : "$") +
  Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ── Types ───────────────────────────────────────────────────────────────────

interface OrderBookLevel {
  price: number;
  size: number;
  side: "bid" | "ask";
  flash: boolean;
}

interface PnlDay {
  day: number;
  spreadCapture: number;
  adverseSelection: number;
  inventoryPnl: number;
  total: number;
  cumulative: number;
}

interface QuotePoint {
  inventory: number;
  bid: number;
  ask: number;
  mid: number;
}

interface LatencyRow {
  venue: string;
  colocated: number;
  remote: number;
  technique: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

const LATENCY_DATA: LatencyRow[] = [
  { venue: "NYSE / ARCA", colocated: 8, remote: 420, technique: "FPGA NIC" },
  { venue: "NASDAQ", colocated: 11, remote: 380, technique: "Kernel bypass" },
  { venue: "CBOE", colocated: 15, remote: 540, technique: "DPDK UDP" },
  { venue: "CME Globex", colocated: 3, remote: 690, technique: "InfiniBand" },
  { venue: "IEX (IEX Cloud)", colocated: 350, remote: 380, technique: "Speed bump" },
  { venue: "BATS BZX", colocated: 9, remote: 410, technique: "FPGA NIC" },
];

const FLASH_CRASH_EVENTS = [
  { time: "14:32", price: 1056.26, event: "Large E-Mini sell order hits market" },
  { time: "14:41", price: 1011.0, event: "Stub quotes activated; DJIA -998 pts" },
  { time: "14:45", price: 972.5, event: "Liquidity evaporates — bid/ask spread widens 1000×" },
  { time: "14:47", price: 1056.8, event: "CME pauses; HFT firms reconnect — snap-back begins" },
  { time: "15:00", price: 1103.6, event: "Market largely recovers within 36 minutes" },
];

const CIRCUIT_BREAKERS = [
  { trigger: "S&P 500 -7%", halt: "15 min", type: "Level 1" },
  { trigger: "S&P 500 -13%", halt: "15 min", type: "Level 2" },
  { trigger: "S&P 500 -20%", halt: "Remainder of day", type: "Level 3" },
  { trigger: "Single stock ±5–10%", halt: "5 min LULD", type: "LULD" },
];

// ── Generate order book ─────────────────────────────────────────────────────

function generateOrderBook(midPrice: number, spread: number): OrderBookLevel[] {
  resetSeed(702002 + Math.round(midPrice * 100));
  const levels: OrderBookLevel[] = [];
  const half = spread / 2;
  for (let i = 0; i < 8; i++) {
    const bidPrice = midPrice - half - i * 0.01;
    const askPrice = midPrice + half + i * 0.01;
    levels.push({
      price: bidPrice,
      size: Math.round(100 + rand() * 900),
      side: "bid",
      flash: i === 0,
    });
    levels.push({
      price: askPrice,
      size: Math.round(100 + rand() * 900),
      side: "ask",
      flash: i === 0,
    });
  }
  return levels;
}

// ── Generate Avellaneda-Stoikov quote displacement ──────────────────────────

function generateQuotePoints(gamma: number, sigma: number): QuotePoint[] {
  const mid = 100;
  const T = 1;
  const t = 0.5;
  const k = 1.5;
  const points: QuotePoint[] = [];
  for (let inv = -10; inv <= 10; inv++) {
    const reservation = mid - inv * gamma * sigma * sigma * (T - t);
    const halfSpread = (gamma * sigma * sigma * (T - t)) / 2 + Math.log(1 + gamma / k) / gamma;
    points.push({
      inventory: inv,
      bid: reservation - halfSpread,
      ask: reservation + halfSpread,
      mid: reservation,
    });
  }
  return points;
}

// ── Generate 30-day P&L data ─────────────────────────────────────────────────

function generatePnlData(): PnlDay[] {
  resetSeed(702002);
  const days: PnlDay[] = [];
  let cumulative = 0;
  for (let day = 1; day <= 30; day++) {
    const spreadCapture = 800 + rand() * 600;
    const adverseSelection = -(200 + rand() * 400);
    const inventoryPnl = (rand() - 0.5) * 300;
    const total = spreadCapture + adverseSelection + inventoryPnl;
    cumulative += total;
    days.push({ day, spreadCapture, adverseSelection, inventoryPnl, total, cumulative });
  }
  return days;
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

// ── InfoCard ─────────────────────────────────────────────────────────────────

function InfoCard({
  title,
  children,
  accent = "blue",
}: {
  title: string;
  children: React.ReactNode;
  accent?: "blue" | "amber" | "green" | "red" | "purple";
}) {
  const colors: Record<string, string> = {
    blue: "border-primary/40 bg-primary/5",
    amber: "border-amber-500/40 bg-amber-500/5",
    green: "border-green-500/40 bg-green-500/5",
    red: "border-red-500/40 bg-red-500/5",
    purple: "border-primary/40 bg-primary/5",
  };
  return (
    <div className={cn("rounded-lg border p-4", colors[accent])}>
      <p className="text-xs font-semibold text-muted-foreground mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

// ── StatChip ─────────────────────────────────────────────────────────────────

function StatChip({ label, value, up }: { label: string; value: string; up?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md bg-muted/40 px-3 py-2">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          up === true ? "text-green-400" : up === false ? "text-red-400" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ── OrderBookSVG ─────────────────────────────────────────────────────────────

function OrderBookSVG({
  midPrice,
  spread,
  flashTick,
}: {
  midPrice: number;
  spread: number;
  flashTick: number;
}) {
  const levels = useMemo(
    () => generateOrderBook(midPrice, spread),
    [midPrice, spread]
  );
  const bids = levels.filter((l) => l.side === "bid").sort((a, b) => b.price - a.price);
  const asks = levels.filter((l) => l.side === "ask").sort((a, b) => a.price - b.price);
  const maxSize = Math.max(...levels.map((l) => l.size));
  const W = 520;
  const H = 220;
  const rowH = 22;
  const barMaxW = 180;
  const labelX = W / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="font-mono text-xs text-muted-foreground">
      {/* Mid price line */}
      <line
        x1={0}
        y1={H / 2}
        x2={W}
        y2={H / 2}
        stroke="#6b7280"
        strokeWidth={0.5}
        strokeDasharray="4 3"
      />
      <text x={labelX} y={H / 2 - 4} textAnchor="middle" fill="#9ca3af" fontSize={9}>
        MID {fmt4(midPrice)}
      </text>

      {/* Bid rows (below mid) */}
      {bids.map((b, i) => {
        const barW = (b.size / maxSize) * barMaxW;
        const y = H / 2 + 4 + i * rowH;
        const isFlash = b.flash && flashTick % 2 === 0;
        return (
          <g key={`bid-${i}`}>
            <rect
              x={labelX - barW}
              y={y + 1}
              width={barW}
              height={rowH - 3}
              fill={isFlash ? "#22c55e" : "#16a34a"}
              opacity={isFlash ? 0.8 : 0.35}
            />
            <text x={labelX - barMaxW - 4} y={y + 14} textAnchor="end" fill="#86efac" fontSize={10}>
              {fmt4(b.price)}
            </text>
            <text x={labelX - 8} y={y + 14} textAnchor="end" fill="#6b7280" fontSize={10}>
              {fmtK(b.size)}
            </text>
          </g>
        );
      })}

      {/* Ask rows (above mid) */}
      {asks.map((a, i) => {
        const barW = (a.size / maxSize) * barMaxW;
        const y = H / 2 - 4 - (i + 1) * rowH;
        const isFlash = a.flash && flashTick % 2 === 1;
        return (
          <g key={`ask-${i}`}>
            <rect
              x={labelX}
              y={y + 1}
              width={barW}
              height={rowH - 3}
              fill={isFlash ? "#ef4444" : "#dc2626"}
              opacity={isFlash ? 0.8 : 0.35}
            />
            <text x={labelX + barMaxW + 4} y={y + 14} textAnchor="start" fill="#fca5a5" fontSize={10}>
              {fmt4(a.price)}
            </text>
            <text x={labelX + 8} y={y + 14} textAnchor="start" fill="#6b7280" fontSize={10}>
              {fmtK(a.size)}
            </text>
          </g>
        );
      })}

      {/* Column headers */}
      <text x={20} y={H - 4} fill="#4b5563" fontSize={9}>
        PRICE
      </text>
      <text x={labelX - 8} y={H - 4} textAnchor="end" fill="#4b5563" fontSize={9}>
        SIZE
      </text>
      <text x={labelX + 8} y={H - 4} fill="#4b5563" fontSize={9}>
        SIZE
      </text>
      <text x={W - 20} y={H - 4} textAnchor="end" fill="#4b5563" fontSize={9}>
        PRICE
      </text>
    </svg>
  );
}

// ── SpreadModelSVG ────────────────────────────────────────────────────────────

function SpreadModelSVG({ gamma, sigma }: { gamma: number; sigma: number }) {
  const points = useMemo(() => generateQuotePoints(gamma, sigma), [gamma, sigma]);
  const W = 540;
  const H = 200;
  const PAD = { t: 20, b: 30, l: 50, r: 20 };
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;

  const allPrices = points.flatMap((p) => [p.bid, p.ask, p.mid]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const range = maxP - minP || 1;

  const px = (inv: number) => PAD.l + ((inv + 10) / 20) * iw;
  const py = (price: number) => PAD.t + ih - ((price - minP) / range) * ih;

  const bidPath =
    "M " + points.map((p) => `${px(p.inventory)},${py(p.bid)}`).join(" L ");
  const askPath =
    "M " + points.map((p) => `${px(p.inventory)},${py(p.ask)}`).join(" L ");
  const midPath =
    "M " + points.map((p) => `${px(p.inventory)},${py(p.mid)}`).join(" L ");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {/* Grid lines */}
      {[-10, -5, 0, 5, 10].map((inv) => (
        <line
          key={inv}
          x1={px(inv)}
          y1={PAD.t}
          x2={px(inv)}
          y2={H - PAD.b}
          stroke="#374151"
          strokeWidth={0.5}
        />
      ))}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={PAD.l}
          y1={PAD.t + ih * (1 - f)}
          x2={W - PAD.r}
          y2={PAD.t + ih * (1 - f)}
          stroke="#374151"
          strokeWidth={0.5}
          strokeDasharray="3 3"
        />
      ))}

      {/* Shaded spread band */}
      <path
        d={
          "M " +
          points.map((p) => `${px(p.inventory)},${py(p.bid)}`).join(" L ") +
          " L " +
          [...points]
            .reverse()
            .map((p) => `${px(p.inventory)},${py(p.ask)}`)
            .join(" L ") +
          " Z"
        }
        fill="#3b82f6"
        opacity={0.1}
      />

      {/* Paths */}
      <path d={bidPath} fill="none" stroke="#22c55e" strokeWidth={2} />
      <path d={askPath} fill="none" stroke="#ef4444" strokeWidth={2} />
      <path d={midPath} fill="none" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="5 3" />

      {/* Zero inventory marker */}
      <line
        x1={px(0)}
        y1={PAD.t}
        x2={px(0)}
        y2={H - PAD.b}
        stroke="#f59e0b"
        strokeWidth={1}
        strokeDasharray="4 2"
      />

      {/* X-axis labels */}
      {[-10, -5, 0, 5, 10].map((inv) => (
        <text
          key={inv}
          x={px(inv)}
          y={H - 6}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={9}
        >
          {inv}
        </text>
      ))}
      <text x={W / 2} y={H} textAnchor="middle" fill="#6b7280" fontSize={9}>
        Inventory
      </text>

      {/* Legend */}
      <rect x={PAD.l} y={PAD.t} width={8} height={8} rx={2} fill="#22c55e" />
      <text x={PAD.l + 12} y={PAD.t + 7} fill="#d1d5db" fontSize={9}>
        Bid
      </text>
      <rect x={PAD.l + 40} y={PAD.t} width={8} height={8} rx={2} fill="#ef4444" />
      <text x={PAD.l + 52} y={PAD.t + 7} fill="#d1d5db" fontSize={9}>
        Ask
      </text>
      <rect x={PAD.l + 80} y={PAD.t} width={8} height={8} rx={2} fill="#60a5fa" />
      <text x={PAD.l + 92} y={PAD.t + 7} fill="#d1d5db" fontSize={9}>
        Reservation mid
      </text>
    </svg>
  );
}

// ── PnlChartSVG ───────────────────────────────────────────────────────────────

function PnlChartSVG({ data }: { data: PnlDay[] }) {
  const W = 560;
  const H = 240;
  const PAD = { t: 20, b: 40, l: 60, r: 20 };
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;

  const cums = data.map((d) => d.cumulative);
  const minC = Math.min(...cums, 0);
  const maxC = Math.max(...cums, 0);
  const range = maxC - minC || 1;

  const px = (day: number) => PAD.l + ((day - 1) / 29) * iw;
  const py = (v: number) => PAD.t + ih - ((v - minC) / range) * ih;

  const linePath =
    "M " + data.map((d) => `${px(d.day)},${py(d.cumulative)}`).join(" L ");

  // Drawdown tracking
  let peak = cums[0];
  const drawdowns = cums.map((v) => {
    if (v > peak) peak = v;
    return peak > 0 ? (v - peak) / peak : 0;
  });
  const maxDD = Math.min(...drawdowns);

  // Sharpe (simplified, annualized)
  const totals = data.map((d) => d.total);
  const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
  const std = Math.sqrt(totals.reduce((a, b) => a + (b - mean) ** 2, 0) / totals.length);
  const sharpe = std > 0 ? ((mean / std) * Math.sqrt(252)).toFixed(2) : "N/A";

  const totalPnl = cums[cums.length - 1];

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="flex flex-wrap gap-2">
        <StatChip label="Total P&L" value={fmtDollar(totalPnl)} up={totalPnl >= 0} />
        <StatChip label="Sharpe" value={String(sharpe)} up={Number(sharpe) > 1} />
        <StatChip label="Max Drawdown" value={(maxDD * 100).toFixed(1) + "%"} up={false} />
        <StatChip
          label="Win Days"
          value={data.filter((d) => d.total > 0).length + "/" + data.length}
        />
        <StatChip
          label="Avg Spread Capture"
          value={fmtDollar(data.reduce((a, d) => a + d.spreadCapture, 0) / data.length)}
          up
        />
      </div>

      {/* SVG chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* Zero line */}
        <line
          x1={PAD.l}
          y1={py(0)}
          x2={W - PAD.r}
          y2={py(0)}
          stroke="#4b5563"
          strokeWidth={1}
          strokeDasharray="4 3"
        />

        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const v = minC + f * range;
          return (
            <g key={f}>
              <line
                x1={PAD.l}
                y1={py(v)}
                x2={W - PAD.r}
                y2={py(v)}
                stroke="#1f2937"
                strokeWidth={0.5}
              />
              <text x={PAD.l - 6} y={py(v) + 4} textAnchor="end" fill="#6b7280" fontSize={9}>
                {fmtK(v)}
              </text>
            </g>
          );
        })}

        {/* Fill area */}
        <path
          d={
            linePath +
            ` L ${px(30)},${py(0)} L ${px(1)},${py(0)} Z`
          }
          fill={totalPnl >= 0 ? "#22c55e" : "#ef4444"}
          opacity={0.1}
        />

        {/* P&L line */}
        <path
          d={linePath}
          fill="none"
          stroke={totalPnl >= 0 ? "#22c55e" : "#ef4444"}
          strokeWidth={2}
        />

        {/* Day markers */}
        {data.map((d) => (
          <circle
            key={d.day}
            cx={px(d.day)}
            cy={py(d.cumulative)}
            r={2}
            fill={d.total >= 0 ? "#22c55e" : "#ef4444"}
          />
        ))}

        {/* X-axis */}
        {[1, 5, 10, 15, 20, 25, 30].map((d) => (
          <text
            key={d}
            x={px(d)}
            y={H - PAD.b + 14}
            textAnchor="middle"
            fill="#6b7280"
            fontSize={9}
          >
            D{d}
          </text>
        ))}
        <text x={W / 2} y={H - 2} textAnchor="middle" fill="#6b7280" fontSize={9}>
          Trading Day
        </text>
        <text
          x={PAD.l - 10}
          y={H / 2}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={9}
          transform={`rotate(-90, ${PAD.l - 10}, ${H / 2})`}
        >
          Cum. P&amp;L ($)
        </text>
      </svg>

      {/* Stacked bar breakdown legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm bg-green-500" />
          Spread Capture
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm bg-red-500" />
          Adverse Selection
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm bg-primary" />
          Inventory P&L
        </span>
      </div>
    </div>
  );
}

// ── FlashCrashSVG ─────────────────────────────────────────────────────────────

function FlashCrashSVG() {
  const W = 520;
  const H = 160;
  const PAD = { t: 16, b: 30, l: 50, r: 20 };
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;

  const prices = FLASH_CRASH_EVENTS.map((e) => e.price);
  const minP = Math.min(...prices) - 20;
  const maxP = Math.max(...prices) + 20;
  const range = maxP - minP;

  const px = (i: number) => PAD.l + (i / (FLASH_CRASH_EVENTS.length - 1)) * iw;
  const py = (price: number) => PAD.t + ih - ((price - minP) / range) * ih;

  const path =
    "M " +
    FLASH_CRASH_EVENTS.map((e, i) => `${px(i)},${py(e.price)}`).join(" L ");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const v = minP + f * range;
        return (
          <g key={f}>
            <line
              x1={PAD.l}
              y1={py(v)}
              x2={W - PAD.r}
              y2={py(v)}
              stroke="#1f2937"
              strokeWidth={0.5}
            />
            <text x={PAD.l - 6} y={py(v) + 4} textAnchor="end" fill="#6b7280" fontSize={9}>
              {v.toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* Fill */}
      <path
        d={path + ` L ${px(4)},${H - PAD.b} L ${px(0)},${H - PAD.b} Z`}
        fill="#ef4444"
        opacity={0.08}
      />

      {/* Price line */}
      <path d={path} fill="none" stroke="#ef4444" strokeWidth={2} />

      {/* Event markers */}
      {FLASH_CRASH_EVENTS.map((e, i) => (
        <g key={i}>
          <circle cx={px(i)} cy={py(e.price)} r={4} fill="#f59e0b" />
          <text x={px(i)} y={py(e.price) - 8} textAnchor="middle" fill="#fbbf24" fontSize={8}>
            {e.time}
          </text>
        </g>
      ))}

      {/* X labels */}
      <text x={W / 2} y={H - 4} textAnchor="middle" fill="#6b7280" fontSize={9}>
        May 6, 2010 — Eastern Time
      </text>
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Tab content components
// ────────────────────────────────────────────────────────────────────────────

function Tab1MarketMaking101() {
  const [spread, setSpread] = useState(0.04);
  const [flashTick, setFlashTick] = useState(0);
  const midPrice = 100.0;

  useEffect(() => {
    const id = setInterval(() => setFlashTick((t) => t + 1), 800);
    return () => clearInterval(id);
  }, []);

  const spreadIncome = (spread / 2) * 1000; // per 1000 shares
  const adverseSelectionCost = spreadIncome * 0.35;
  const inventoryCost = spreadIncome * 0.15;
  const netRevenue = spreadIncome - adverseSelectionCost - inventoryCost;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left: concepts */}
        <div className="space-y-4">
          <InfoCard title="Bid-Ask Spread Economics" accent="blue">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Market makers quote a two-sided market: the <span className="text-green-400 font-medium">bid</span> (price
              to buy) and the <span className="text-red-400 font-medium">ask</span> (price to sell). The spread
              represents gross revenue. Net profitability depends on managing three costs below.
            </p>
          </InfoCard>
          <InfoCard title="Three Revenue Drivers" accent="green">
            <div className="space-y-2 text-sm">
              {[
                {
                  label: "Spread Capture",
                  desc: "Half-spread × 2-sided volume. This is the core revenue engine.",
                  color: "text-green-400",
                },
                {
                  label: "Adverse Selection",
                  desc: "Informed traders take the other side when they know the true price — the biggest leak.",
                  color: "text-red-400",
                },
                {
                  label: "Inventory Risk",
                  desc: "Accumulating directional inventory exposes the MM to market moves.",
                  color: "text-amber-400",
                },
              ].map((item) => (
                <div key={item.label} className="flex gap-2">
                  <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                  <span>
                    <span className={cn("font-medium", item.color)}>{item.label}:</span>{" "}
                    <span className="text-muted-foreground">{item.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </InfoCard>
          <InfoCard title="Quote Stuffing" accent="amber">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Submitting and cancelling massive numbers of orders to overload a competitor&apos;s feed
              processing. Banned under FINRA Rule 5210 and EU MAR. Detection requires nanosecond
              surveillance.
            </p>
          </InfoCard>
        </div>

        {/* Right: interactive order book */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border/50 bg-background/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground">
                Live Order Book (simulated)
              </p>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                MID {fmt4(midPrice)}
              </Badge>
            </div>
            <OrderBookSVG midPrice={midPrice} spread={spread} flashTick={flashTick} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">
                Quoted Spread: <span className="text-foreground font-medium">{fmt4(spread)}</span>
              </label>
              <span className="text-xs text-muted-foreground">
                ({((spread / midPrice) * 100).toFixed(3)}%)
              </span>
            </div>
            <Slider
              min={0.01}
              max={0.20}
              step={0.005}
              value={[spread]}
              onValueChange={([v]) => setSpread(v)}
            />

            <div className="grid grid-cols-2 gap-2">
              <StatChip label="Spread Income/1k" value={fmtDollar(spreadIncome)} up />
              <StatChip label="Adverse Selection" value={fmtDollar(-adverseSelectionCost)} up={false} />
              <StatChip label="Inventory Cost" value={fmtDollar(-inventoryCost)} up={false} />
              <StatChip
                label="Net Revenue/1k"
                value={fmtDollar(netRevenue)}
                up={netRevenue > 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tab2SpreadModeling() {
  const [gamma, setGamma] = useState(0.1);
  const [sigma, setSigma] = useState(2.0);

  const halfSpreadApprox = (gamma * sigma * sigma * 0.5) / 2 + Math.log(1 + gamma / 1.5) / gamma;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-4">
          <InfoCard title="Avellaneda-Stoikov (2008)" accent="purple">
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              The canonical stochastic optimal control model for market making. The market maker
              maximises expected exponential utility over inventory q and remaining time T−t.
            </p>
            <div className="rounded-md bg-muted/60 p-3 font-mono text-xs text-foreground space-y-1">
              <p>r(t) = s(t) − q·γ·σ²·(T−t)</p>
              <p>δ* = γ·σ²·(T−t)/2 + ln(1 + γ/k)/γ</p>
              <p>b* = r − δ*     a* = r + δ*</p>
            </div>
          </InfoCard>
          <InfoCard title="Parameters" accent="blue">
            <div className="space-y-4 mt-1">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="text-muted-foreground">Risk Aversion γ</span>
                  <span className="font-mono text-foreground">{gamma.toFixed(2)}</span>
                </div>
                <Slider
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  value={[gamma]}
                  onValueChange={([v]) => setGamma(v)}
                />
                <p className="text-xs text-muted-foreground">
                  Higher γ → wider spread, stronger inventory skew
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="text-muted-foreground">Volatility σ</span>
                  <span className="font-mono text-foreground">{sigma.toFixed(1)}</span>
                </div>
                <Slider
                  min={0.5}
                  max={5.0}
                  step={0.1}
                  value={[sigma]}
                  onValueChange={([v]) => setSigma(v)}
                />
                <p className="text-xs text-muted-foreground">
                  Higher σ → wider spread to compensate for price uncertainty
                </p>
              </div>
            </div>
          </InfoCard>
          <div className="grid grid-cols-2 gap-2">
            <StatChip label="Optimal Half-Spread" value={fmt4(halfSpreadApprox)} />
            <StatChip label="Optimal Full Spread" value={fmt4(halfSpreadApprox * 2)} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border/50 bg-background/60 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Quote Displacement by Inventory (A-S Model)
            </p>
            <SpreadModelSVG gamma={gamma} sigma={sigma} />
          </div>
          <InfoCard title="Intuition" accent="green">
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>
                When inventory is <span className="text-red-400">long</span>, the reservation price
                shifts down — the MM lowers both bid and ask to shed inventory.
              </p>
              <p>
                When inventory is <span className="text-green-400">short</span>, the MM raises quotes to
                attract sellers and rebalance.
              </p>
              <p>
                The spread widens with higher volatility and risk aversion, protecting against larger
                adverse moves.
              </p>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}

function Tab3HFTStrategies() {
  const [selectedStrategy, setSelectedStrategy] = useState<string>("latency");

  const strategies = [
    {
      id: "latency",
      label: "Latency Arbitrage",
      icon: Zap,
      color: "text-yellow-400",
    },
    {
      id: "statarb",
      label: "Statistical Arbitrage",
      icon: BarChart3,
      color: "text-primary",
    },
    {
      id: "colocation",
      label: "Co-location Economics",
      icon: Cpu,
      color: "text-primary",
    },
    {
      id: "flashboys",
      label: "Flash Boys",
      icon: Activity,
      color: "text-red-400",
    },
  ];

  const content: Record<string, React.ReactNode> = {
    latency: (
      <div className="space-y-4">
        <InfoCard title="Latency Arbitrage Explained" accent="amber">
          <p className="text-sm text-muted-foreground leading-relaxed">
            When a large order moves the price on Exchange A, a co-located HFT firm detects it in
            microseconds and front-runs the same trade on Exchange B before the price updates there.
            The edge window is often 10–100μs — invisible to humans.
          </p>
        </InfoCard>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left p-2.5 text-muted-foreground font-medium">Venue</th>
                <th className="text-right p-2.5 text-muted-foreground font-medium">Co-located (μs)</th>
                <th className="text-right p-2.5 text-muted-foreground font-medium">Remote (μs)</th>
                <th className="text-right p-2.5 text-muted-foreground font-medium">Technique</th>
              </tr>
            </thead>
            <tbody>
              {LATENCY_DATA.map((row, i) => (
                <tr
                  key={row.venue}
                  className={cn(
                    "border-b border-border/30 hover:bg-muted/20",
                    i % 2 === 0 ? "bg-background/30" : ""
                  )}
                >
                  <td className="p-2.5 font-medium">{row.venue}</td>
                  <td className="p-2.5 text-right text-green-400 font-mono">{row.colocated}</td>
                  <td className="p-2.5 text-right text-amber-400 font-mono">{row.remote}</td>
                  <td className="p-2.5 text-right text-muted-foreground">{row.technique}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <InfoCard title="IEX Speed Bump" accent="blue">
          <p className="text-sm text-muted-foreground">
            IEX introduced a 350-microsecond intentional delay (38-mile coil of fiber) to level the
            playing field. Co-location at IEX provides essentially no edge — reflected in the table
            above.
          </p>
        </InfoCard>
      </div>
    ),
    statarb: (
      <div className="space-y-4">
        <InfoCard title="Statistical Arbitrage" accent="blue">
          <p className="text-sm text-muted-foreground leading-relaxed">
            HFT stat-arb identifies short-term mean-reverting relationships across securities — pairs,
            ETF/basket vs. constituent divergences, or cross-exchange price discrepancies. Positions
            are held for milliseconds to seconds.
          </p>
        </InfoCard>
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              title: "ETF Arbitrage",
              desc: "When SPY trades at a premium to the sum of its components, create/redeem units. Typical edge: 0.1–0.5 bps, completed in <1ms.",
              accent: "green" as const,
            },
            {
              title: "Cross-Exchange Arb",
              desc: "AAPL shows $150.01 on NASDAQ and $150.00 on NYSE simultaneously. Buy NYSE, sell NASDAQ. Race to execute before other arbitrageurs.",
              accent: "purple" as const,
            },
            {
              title: "Futures-Spot Basis",
              desc: "ES futures vs. SPY basket diverge intraday. HFT firms maintain real-time fair-value models and trade convergence. Holding period: 50–500ms.",
              accent: "amber" as const,
            },
          ].map((item) => (
            <InfoCard key={item.title} title={item.title} accent={item.accent}>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </InfoCard>
          ))}
        </div>
      </div>
    ),
    colocation: (
      <div className="space-y-4">
        <InfoCard title="Co-location Economics" accent="purple">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Co-location means renting rack space inside the exchange&apos;s own data center. Network
            distance to the matching engine drops from hundreds of miles to meters — translating to
            microseconds vs. milliseconds.
          </p>
        </InfoCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "NYSE Mahwah co-lo cost", value: "$15k–$50k/month/rack" },
            { label: "CME Aurora co-lo cost", value: "$25k–$80k/month" },
            { label: "Speed of light fiber lag", value: "~5ns/meter" },
            { label: "Microwave NY→Chicago", value: "~8.3ms vs 13ms fiber" },
            { label: "FPGA order latency", value: "<1μs (vs 10μs software)" },
            { label: "Kernel bypass gain", value: "5–10μs vs full stack" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-border/40 bg-muted/20 p-3"
            >
              <p className="text-[11px] text-muted-foreground mb-0.5">{item.label}</p>
              <p className="text-sm font-medium text-primary">{item.value}</p>
            </div>
          ))}
        </div>
        <InfoCard title="Microwave Networks" accent="amber">
          <p className="text-sm text-muted-foreground">
            Line-of-sight microwave towers relay data 40% faster than fiber. Jump Trading and others
            invested $100M+ in tower networks between Chicago and New York. Towers must be licensed
            and perfectly aligned.
          </p>
        </InfoCard>
      </div>
    ),
    flashboys: (
      <div className="space-y-4">
        <InfoCard title="Flash Boys: The Core Argument" accent="red">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Michael Lewis&apos;s 2014 book argued that HFT firms use superior technology to detect large
            institutional orders mid-route (via complex order routing) and trade ahead of them on
            destination exchanges — a form of electronic front-running.
          </p>
        </InfoCard>
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              title: "Order Anticipation",
              desc: "HFT detects partial fills on one venue and infers the full order size, then races to adjust quotes on remaining venues before the order arrives.",
              accent: "red" as const,
            },
            {
              title: "SIP vs. Direct Feed",
              desc: "The Consolidated Tape (SIP) is ~500ms slower than proprietary direct feeds. HFT firms use direct feeds to see prices invisible to retail quote systems.",
              accent: "amber" as const,
            },
            {
              title: "Industry Response",
              desc: "Many exchanges now offer 'Immediate or Cancel' orders, enhanced surveillance, and IEX-style speed bumps. SEC Rule 15c3-5 mandates pre-trade risk checks.",
              accent: "green" as const,
            },
          ].map((item) => (
            <InfoCard key={item.title} title={item.title} accent={item.accent}>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </InfoCard>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="space-y-4">
      {/* Strategy selector */}
      <div className="flex flex-wrap gap-2">
        {strategies.map((strat) => {
          const Icon = strat.icon;
          return (
            <button
              key={strat.id}
              onClick={() => setSelectedStrategy(strat.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground font-medium transition-colors",
                selectedStrategy === strat.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", selectedStrategy === strat.id ? "text-primary" : strat.color)} />
              {strat.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedStrategy}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {content[selectedStrategy]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


function Tab4PnlAttribution() {
  const data = useMemo(() => generatePnlData(), []);

  const totalSpread = data.reduce((a, d) => a + d.spreadCapture, 0);
  const totalAdverse = data.reduce((a, d) => a + d.adverseSelection, 0);
  const totalInv = data.reduce((a, d) => a + d.inventoryPnl, 0);
  const total = totalSpread + totalAdverse + totalInv;

  const grandAbs = Math.abs(totalSpread) + Math.abs(totalAdverse) + Math.abs(totalInv);
  const spreadPct = grandAbs > 0 ? (Math.abs(totalSpread) / grandAbs) * 100 : 0;
  const adversePct = grandAbs > 0 ? (Math.abs(totalAdverse) / grandAbs) * 100 : 0;
  const invPct = grandAbs > 0 ? (Math.abs(totalInv) / grandAbs) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Top attribution cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Spread Capture",
            value: totalSpread,
            pct: spreadPct,
            color: "bg-green-500",
            textColor: "text-green-400",
            desc: "Revenue from quoting bid-ask spread and capturing the crossing flow",
          },
          {
            label: "Adverse Selection",
            value: totalAdverse,
            pct: adversePct,
            color: "bg-red-500",
            textColor: "text-red-400",
            desc: "Loss from informed traders taking the other side at unfavorable prices",
          },
          {
            label: "Inventory P&L",
            value: totalInv,
            pct: invPct,
            color: "bg-primary",
            textColor: "text-primary",
            desc: "Gain/loss from net inventory position carried across time",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border/50 bg-background/60 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {item.label}
            </p>
            <p className={cn("text-xl font-bold tabular-nums mb-1", item.textColor)}>
              {fmtDollar(item.value)}
            </p>
            <div className="w-full h-1.5 rounded-full bg-muted/40 mb-2">
              <div
                className={cn("h-full rounded-full", item.color)}
                style={{ width: `${item.pct.toFixed(1)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Net P&L summary */}
      <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-3">
        <Target className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">30-Day Net P&L</p>
          <p className={cn("text-lg font-bold tabular-nums", total >= 0 ? "text-green-400" : "text-red-400")}>
            {fmtDollar(total)}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>Adverse ratio: {((Math.abs(totalAdverse) / totalSpread) * 100).toFixed(1)}%</p>
          <p>of spread captured</p>
        </div>
      </div>

      {/* P&L chart */}
      <div className="rounded-lg border border-border/50 bg-background/60 p-4">
        <p className="text-xs font-medium text-muted-foreground mb-4">
          Cumulative P&L — 30 Days
        </p>
        <PnlChartSVG data={data} />
      </div>

      {/* Per-day breakdown table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <p className="text-xs font-medium text-muted-foreground p-3 border-b border-border/50">
          Daily Breakdown
        </p>
        <div className="overflow-x-auto max-h-48 overflow-y-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead className="sticky top-0 bg-background/95">
              <tr className="border-b border-border/50">
                {["Day", "Spread", "Adverse Sel.", "Inventory", "Net", "Cumulative"].map((h) => (
                  <th key={h} className="text-right first:text-left p-2 text-muted-foreground font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.day} className="border-b border-border/20 hover:bg-muted/10">
                  <td className="p-2 text-muted-foreground">D{d.day}</td>
                  <td className="p-2 text-right text-green-400 font-mono">{fmtDollar(d.spreadCapture)}</td>
                  <td className="p-2 text-right text-red-400 font-mono">{fmtDollar(d.adverseSelection)}</td>
                  <td className={cn("p-2 text-right font-mono", d.inventoryPnl >= 0 ? "text-primary" : "text-amber-400")}>
                    {fmtDollar(d.inventoryPnl)}
                  </td>
                  <td className={cn("p-2 text-right font-mono font-medium", d.total >= 0 ? "text-green-400" : "text-red-400")}>
                    {fmtDollar(d.total)}
                  </td>
                  <td className={cn("p-2 text-right font-mono", d.cumulative >= 0 ? "text-foreground" : "text-red-400")}>
                    {fmtDollar(d.cumulative)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Tab5RegulationRisk() {
  const [caseStudyOpen, setCaseStudyOpen] = useState(false);

  const regs = [
    {
      rule: "SEC Rule 15c3-5",
      name: "Market Access Rule",
      year: 2010,
      desc: "Requires broker-dealers to implement pre-trade risk controls and supervisory procedures for all market access — no naked sponsored access.",
      icon: Shield,
      accent: "blue" as const,
    },
    {
      rule: "Reg SHO",
      name: "Short Sale Regulation",
      year: 2005,
      desc: "Mandates locate requirements before short selling. Market makers get an exemption for bona fide market making but must still comply with close-out requirements.",
      icon: ArrowUpDown,
      accent: "amber" as const,
    },
    {
      rule: "FINRA Rule 5210",
      name: "Publication of Transactions",
      year: 2014,
      desc: "Prohibits manipulation including quote stuffing, spoofing, and layering. FINRA uses surveillance systems analyzing millions of orders per day.",
      icon: AlertTriangle,
      accent: "red" as const,
    },
    {
      rule: "EU MAR Article 12",
      name: "Market Manipulation",
      year: 2016,
      desc: "EU Market Abuse Regulation explicitly includes algorithmic strategies that create false/misleading price signals. Extraterritorial reach to EU instruments.",
      icon: Lock,
      accent: "purple" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regs.map((reg) => {
          const Icon = reg.icon;
          return (
            <InfoCard key={reg.rule} title={`${reg.rule} (${reg.year})`} accent={reg.accent}>
              <div className="flex gap-2 mb-2">
                <Icon className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">{reg.name}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{reg.desc}</p>
            </InfoCard>
          );
        })}
      </div>

      {/* Circuit Breakers */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <p className="text-xs font-medium text-muted-foreground p-3 border-b border-border/50">
          US Market Circuit Breakers
        </p>
        <table className="w-full text-xs text-muted-foreground">
          <thead>
            <tr className="border-b border-border/40 bg-muted/20">
              {["Type", "Trigger", "Halt Duration"].map((h) => (
                <th key={h} className="text-left p-2.5 text-muted-foreground font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CIRCUIT_BREAKERS.map((cb, i) => (
              <tr
                key={cb.type}
                className={cn("border-b border-border/20", i % 2 === 0 ? "bg-background/30" : "")}
              >
                <td className="p-2.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs text-muted-foreground",
                      cb.type === "Level 3"
                        ? "border-red-500/40 text-red-400"
                        : cb.type === "Level 2"
                        ? "border-amber-500/40 text-amber-400"
                        : cb.type === "Level 1"
                        ? "border-yellow-500/40 text-yellow-400"
                        : "border-primary/40 text-primary"
                    )}
                  >
                    {cb.type}
                  </Badge>
                </td>
                <td className="p-2.5 text-foreground">{cb.trigger}</td>
                <td className="p-2.5 text-muted-foreground">{cb.halt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fat Finger Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Fat Finger Controls",
            items: [
              "Max order size per symbol",
              "Max notional per second",
              "Price deviation from NBBO",
              "Daily loss limit (DLL)",
            ],
            icon: Gauge,
            color: "text-amber-400",
          },
          {
            label: "Kill Switch",
            items: [
              "One-button all-orders cancel",
              "FIX session termination",
              "Exchange-level kill switch API",
              "Mandatory hardware cutoff",
            ],
            icon: Zap,
            color: "text-red-400",
          },
          {
            label: "Pre-trade Checks",
            items: [
              "Symbol whitelist/blacklist",
              "Order rate limiter (msg/s)",
              "P&L mark-to-market check",
              "Duplicate order detection",
            ],
            icon: CheckCircleIcon,
            color: "text-green-400",
          },
        ].map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.label} className="rounded-lg border border-border/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn("h-4 w-4", section.color)} />
                <p className="text-xs text-muted-foreground font-medium">{section.label}</p>
              </div>
              <ul className="space-y-1.5">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Flash Crash Case Study */}
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 overflow-hidden">
        <button
          onClick={() => setCaseStudyOpen((v) => !v)}
          className="w-full flex items-center justify-between p-4 hover:bg-red-500/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm font-medium">Case Study: 2010 Flash Crash (May 6)</span>
          </div>
          <motion.div
            animate={{ rotate: caseStudyOpen ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {caseStudyOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                <FlashCrashSVG />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FLASH_CRASH_EVENTS.map((e) => (
                    <div
                      key={e.time}
                      className="flex gap-2 rounded-md bg-muted/20 p-3"
                    >
                      <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-amber-300">{e.time} ET</p>
                        <p className="text-[11px] text-muted-foreground">{e.event}</p>
                        <p className="text-xs font-mono text-foreground mt-0.5">
                          E-Mini S&P: {e.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <InfoCard title="Lessons Learned" accent="amber">
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {[
                      "HFT firms withdrew liquidity simultaneously — creating a vacuum, not a crisis",
                      "Stub quotes ($0.01 bids, $99,999 asks) should never trade — exchanges added price bands",
                      "LULD (Limit Up/Limit Down) bands introduced in 2012 prevent >5–10% single-stock moves",
                      "Co-ordinated circuit breakers across exchanges remain incomplete — risk persists",
                    ].map((item) => (
                      <li key={item} className="flex gap-2">
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </InfoCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────────

export default function AlgoMMPage() {
  const tabs = [
    { value: "mm101", label: "Market Making 101", icon: BookOpen },
    { value: "spread", label: "Spread Modeling", icon: Target },
    { value: "hft", label: "HFT Strategies", icon: Zap },
    { value: "pnl", label: "P&L Attribution", icon: DollarSign },
    { value: "reg", label: "Regulation & Risk", icon: Shield },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 max-w-5xl mx-auto">
      {/* HERO Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="border-l-4 border-l-primary rounded-md bg-card p-6 space-y-1"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Activity className="h-3.5 w-3.5 text-muted-foreground/50" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Algorithmic Market Making</h1>
            <p className="text-sm text-muted-foreground">
              Electronic trading simulator — spreads, HFT mechanics, P&L attribution, regulation
            </p>
          </div>
        </div>

        {/* KPI row */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { label: "Asset Class", value: "Equities / Futures" },
            { label: "Model", value: "Avellaneda-Stoikov" },
            { label: "Latency Target", value: "<10μs" },
            { label: "Strategies", value: "4 HFT Types" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
            >
              <span className="text-muted-foreground">{kpi.label}:</span>
              <span className="font-medium">{kpi.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="mm101" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap gap-1 bg-muted/30 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs text-muted-foreground data-[state=active]:bg-background"
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="mm101" className="mt-0 data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Tab1MarketMaking101 />
            </motion.div>
          </TabsContent>

          <TabsContent value="spread" className="mt-0 data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Tab2SpreadModeling />
            </motion.div>
          </TabsContent>

          <TabsContent value="hft" className="mt-0 data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Tab3HFTStrategies />
            </motion.div>
          </TabsContent>

          <TabsContent value="pnl" className="mt-0 data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Tab4PnlAttribution />
            </motion.div>
          </TabsContent>

          <TabsContent value="reg" className="mt-0 data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Tab5RegulationRisk />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
