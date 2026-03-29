"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Bell,
  BarChart2,
  RefreshCw,
  Medal,
  Zap,
  Clock,
  DollarSign,
  Target,
  Shield,
  ChevronDown,
  ChevronUp,
  Calendar,
  Info,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────

let s = 73;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Reset seed helper for reproducible sub-sections
function resetSeed(seed: number) {
  s = seed;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Position {
  symbol: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  sector: string;
  beta: number;
  assetClass: string;
}

interface AssetClass {
  name: string;
  target: number;
  actual: number;
  color: string;
}

interface Alert {
  id: string;
  type: "stop_loss" | "earnings" | "dividend" | "rating" | "concentration";
  symbol: string;
  message: string;
  severity: "red" | "yellow" | "green";
  date?: string;
}

// ─── Static Data (seeded) ─────────────────────────────────────────────────────

resetSeed(73);

const RAW_POSITIONS: Position[] = [
  { symbol: "AAPL", shares: 80,  costBasis: 158.40, currentPrice: 0, sector: "Technology",    beta: 1.18, assetClass: "US Equity" },
  { symbol: "MSFT", shares: 45,  costBasis: 375.20, currentPrice: 0, sector: "Technology",    beta: 0.92, assetClass: "US Equity" },
  { symbol: "NVDA", shares: 20,  costBasis: 620.50, currentPrice: 0, sector: "Technology",    beta: 1.74, assetClass: "US Equity" },
  { symbol: "AMZN", shares: 30,  costBasis: 188.75, currentPrice: 0, sector: "Consumer",      beta: 1.21, assetClass: "US Equity" },
  { symbol: "JPM",  shares: 55,  costBasis: 198.30, currentPrice: 0, sector: "Financials",    beta: 1.05, assetClass: "US Equity" },
  { symbol: "JNJ",  shares: 60,  costBasis: 158.90, currentPrice: 0, sector: "Healthcare",    beta: 0.58, assetClass: "US Equity" },
  { symbol: "VEA",  shares: 200, costBasis: 48.30,  currentPrice: 0, sector: "International", beta: 0.88, assetClass: "Int'l Equity" },
  { symbol: "EFA",  shares: 150, costBasis: 72.40,  currentPrice: 0, sector: "International", beta: 0.84, assetClass: "Int'l Equity" },
  { symbol: "AGG",  shares: 120, costBasis: 96.50,  currentPrice: 0, sector: "Fixed Income",  beta: 0.12, assetClass: "Bonds" },
  { symbol: "BND",  shares: 90,  costBasis: 73.20,  currentPrice: 0, sector: "Fixed Income",  beta: 0.10, assetClass: "Bonds" },
  { symbol: "GLD",  shares: 35,  costBasis: 178.50, currentPrice: 0, sector: "Commodities",   beta: 0.08, assetClass: "Alternatives" },
  { symbol: "VTIP", shares: 110, costBasis: 49.80,  currentPrice: 0, sector: "Fixed Income",  beta: 0.06, assetClass: "Cash" },
];

// Assign current prices with seeded PRNG (±15% from cost)
resetSeed(73);
const POSITIONS: Position[] = RAW_POSITIONS.map((p) => ({
  ...p,
  currentPrice: +(p.costBasis * (0.85 + rand() * 0.30)).toFixed(2),
}));

const ASSET_CLASSES: AssetClass[] = [
  { name: "US Equity",     target: 45, actual: 0, color: "#3b82f6" },
  { name: "Int'l Equity",  target: 20, actual: 0, color: "#10b981" },
  { name: "Bonds",         target: 20, actual: 0, color: "#f59e0b" },
  { name: "Alternatives",  target: 10, actual: 0, color: "#8b5cf6" },
  { name: "Cash",          target: 5,  actual: 0, color: "#06b6d4" },
];

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt$(v: number, sign = false): string {
  const abs = Math.abs(v);
  let s: string;
  if (abs >= 1_000_000) s = `$${(Math.abs(v) / 1_000_000).toFixed(2)}M`;
  else if (abs >= 1_000) s = `$${(Math.abs(v) / 1_000).toFixed(1)}K`;
  else s = `$${Math.abs(v).toFixed(2)}`;
  if (v < 0) s = `-${s}`;
  if (sign && v > 0) s = `+${s}`;
  return s;
}

function fmtPct(v: number, sign = false): string {
  const s = `${Math.abs(v).toFixed(2)}%`;
  if (v < 0) return `-${s}`;
  if (sign && v > 0) return `+${s}`;
  return s;
}

function pctColor(v: number): string {
  if (v > 0) return "text-emerald-400";
  if (v < 0) return "text-red-400";
  return "text-muted-foreground";
}

// ─── AnimatedNumber ───────────────────────────────────────────────────────────

function AnimatedCounter({ value, formatter }: { value: number; formatter: (v: number) => string }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    setFlash(value > prev.current ? "up" : "down");
    prev.current = value;
    const start = display;
    const end = value;
    const dur = 600;
    const startTime = performance.now();
    function step(now: number) {
      const t = Math.min(1, (now - startTime) / dur);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplay(start + (end - start) * eased);
      if (t < 1) requestAnimationFrame(step);
      else setDisplay(end);
    }
    requestAnimationFrame(step);
    const timer = setTimeout(() => setFlash(null), 800);
    return () => clearTimeout(timer);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span
      className={cn(
        "tabular-nums transition-colors duration-300",
        flash === "up" && "text-emerald-400",
        flash === "down" && "text-red-400"
      )}
    >
      {formatter(display)}
    </span>
  );
}

// ─── Donut Chart SVG ──────────────────────────────────────────────────────────

function DonutChart({
  data,
  overlayData,
  size = 180,
}: {
  data: { value: number; color: string; label: string }[];
  overlayData?: { value: number; color: string }[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const innerR = outerR * 0.6;
  const total = data.reduce((s, d) => s + d.value, 0);
  const [hovered, setHovered] = useState<number | null>(null);

  let startAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const xi1 = cx + innerR * Math.cos(endAngle);
    const yi1 = cy + innerR * Math.sin(endAngle);
    const xi2 = cx + innerR * Math.cos(startAngle);
    const yi2 = cy + innerR * Math.sin(startAngle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${innerR} ${innerR} 0 ${large} 0 ${xi2} ${yi2} Z`;
    const mid = startAngle + angle / 2;
    startAngle = endAngle;
    return { ...d, path, mid, i };
  });

  // Overlay dashed ring (target)
  let overlayStart = -Math.PI / 2;
  const overlayTotal = overlayData?.reduce((s, d) => s + d.value, 0) ?? 1;
  const overlaySlices = overlayData?.map((d) => {
    const angle = (d.value / overlayTotal) * 2 * Math.PI;
    const endAngle = overlayStart + angle;
    const r = outerR + 6;
    const x1 = cx + r * Math.cos(overlayStart);
    const y1 = cy + r * Math.sin(overlayStart);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
    overlayStart = endAngle;
    return { ...d, path };
  });

  return (
    <svg width={size} height={size} className="overflow-visible">
      {slices.map((sl) => (
        <path
          key={sl.i}
          d={sl.path}
          fill={sl.color}
          opacity={hovered === null ? 0.85 : hovered === sl.i ? 1 : 0.45}
          className="cursor-pointer transition-all duration-150"
          onMouseEnter={() => setHovered(sl.i)}
          onMouseLeave={() => setHovered(null)}
        />
      ))}
      {overlaySlices?.map((sl, i) => (
        <path
          key={i}
          d={sl.path}
          fill="none"
          stroke={sl.color}
          strokeWidth={3}
          strokeDasharray="4 3"
          opacity={0.9}
        />
      ))}
      {hovered !== null && (
        <>
          <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize={11} fontWeight={600}>
            {slices[hovered].label}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize={10}>
            {slices[hovered].value.toFixed(1)}%
          </text>
        </>
      )}
      {hovered === null && (
        <text x={cx} y={cy + 5} textAnchor="middle" fill="#94a3b8" fontSize={11}>
          Allocation
        </text>
      )}
    </svg>
  );
}

// ─── Bar Chart SVG ────────────────────────────────────────────────────────────

function BarChart({
  data,
  width = 320,
  height = 120,
}: {
  data: { label: string; value: number; color: string }[];
  width?: number;
  height?: number;
}) {
  const padL = 52;
  const padR = 8;
  const padT = 8;
  const padB = 28;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)), 0.01);
  const zeroX = padL + (0 / (2 * maxAbs) + 0.5) * chartW;
  const barH = Math.max(8, Math.floor((chartH - (data.length - 1) * 4) / data.length));

  return (
    <svg width={width} height={height}>
      {/* zero line */}
      <line x1={zeroX} y1={padT} x2={zeroX} y2={height - padB} stroke="#334155" strokeWidth={1} />
      {data.map((d, i) => {
        const y = padT + i * (barH + 4);
        const barW = (Math.abs(d.value) / maxAbs) * (chartW / 2);
        const x = d.value >= 0 ? zeroX : zeroX - barW;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={d.color} rx={2} opacity={0.85} />
            <text
              x={padL - 4}
              y={y + barH / 2 + 4}
              textAnchor="end"
              fill="#94a3b8"
              fontSize={9}
              fontFamily="monospace"
            >
              {d.label}
            </text>
            <text
              x={d.value >= 0 ? x + barW + 3 : x - 3}
              y={y + barH / 2 + 4}
              textAnchor={d.value >= 0 ? "start" : "end"}
              fill={d.color}
              fontSize={9}
              fontFamily="monospace"
            >
              {d.value >= 0 ? "+" : ""}
              {d.value.toFixed(2)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Traffic Light ────────────────────────────────────────────────────────────

function TrafficLight({ status }: { status: "green" | "yellow" | "red" }) {
  return (
    <div className="flex items-center gap-1.5">
      {(["red", "yellow", "green"] as const).map((c) => (
        <div
          key={c}
          className={cn(
            "h-3 w-3 rounded-full transition-all",
            c === status
              ? c === "green"
                ? "bg-emerald-400"
                : c === "yellow"
                ? "bg-amber-400"
                : "bg-red-400"
              : "bg-muted opacity-30"
          )}
        />
      ))}
      <span
        className={cn(
          "ml-1 text-xs font-semibold",
          status === "green" ? "text-emerald-400" : status === "yellow" ? "text-amber-400" : "text-red-400"
        )}
      >
        {status === "green" ? "OK" : status === "yellow" ? "Review" : "Rebalance Now"}
      </span>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Metric Chip ──────────────────────────────────────────────────────────────

function MetricChip({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border bg-background px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("mt-0.5 text-sm font-bold tabular-nums", valueClass ?? "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

// ─── Section 1: Portfolio Snapshot ───────────────────────────────────────────

function PortfolioSnapshot({ positions }: { positions: (Position & { marketValue: number; pnl: number; pnlPct: number; weight: number })[] }) {
  const totalValue = positions.reduce((s, p) => s + p.marketValue, 0);
  const totalCost = positions.reduce((s, p) => s + p.shares * p.costBasis, 0);
  const totalPnL = totalValue - totalCost;
  const totalReturn = (totalPnL / totalCost) * 100;

  const sorted = [...positions].sort((a, b) => b.pnlPct - a.pnlPct);
  const winners = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();

  const medalColors = ["text-yellow-400", "text-muted-foreground", "text-amber-600"];

  return (
    <div className="space-y-4">
      {/* Totals bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-xs text-muted-foreground">Total Value</div>
          <div className="mt-1 text-lg font-bold text-foreground">
            <AnimatedCounter value={totalValue} formatter={(v) => fmt$(v)} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-xs text-muted-foreground">Total Cost</div>
          <div className="mt-1 text-lg font-bold text-foreground">{fmt$(totalCost)}</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-xs text-muted-foreground">Unrealized P&L</div>
          <div className={cn("mt-1 text-lg font-bold tabular-nums", pctColor(totalPnL))}>
            <AnimatedCounter value={totalPnL} formatter={(v) => fmt$(v, true)} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-xs text-muted-foreground">Overall Return</div>
          <div className={cn("mt-1 text-lg font-bold tabular-nums", pctColor(totalReturn))}>
            <AnimatedCounter value={totalReturn} formatter={(v) => fmtPct(v, true)} />
          </div>
        </div>
      </div>

      {/* Positions table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              {["Symbol", "Shares", "Cost", "Price", "Value", "P&L $", "P&L %", "Weight"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {positions.map((p) => (
              <motion.tr
                key={p.symbol}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="hover:bg-muted/20 transition-colors"
              >
                <td className="px-3 py-2 font-semibold text-foreground">{p.symbol}</td>
                <td className="px-3 py-2 tabular-nums text-muted-foreground">{p.shares}</td>
                <td className="px-3 py-2 tabular-nums text-muted-foreground">{fmt$(p.costBasis)}</td>
                <td className="px-3 py-2 tabular-nums text-foreground">{fmt$(p.currentPrice)}</td>
                <td className="px-3 py-2 tabular-nums font-medium text-foreground">{fmt$(p.marketValue)}</td>
                <td className={cn("px-3 py-2 tabular-nums font-medium", pctColor(p.pnl))}>{fmt$(p.pnl, true)}</td>
                <td className={cn("px-3 py-2 tabular-nums font-medium", pctColor(p.pnlPct))}>{fmtPct(p.pnlPct, true)}</td>
                <td className="px-3 py-2 tabular-nums text-muted-foreground">{p.weight.toFixed(1)}%</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Winners / Losers */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">Top Winners</span>
          </div>
          <div className="space-y-1.5">
            {winners.map((p, i) => (
              <div key={p.symbol} className="flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <Medal size={12} className={medalColors[i]} />
                  <span className="text-xs font-semibold text-foreground">{p.symbol}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">{fmtPct(p.pnlPct, true)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-xs font-semibold text-red-400">Top Losers</span>
          </div>
          <div className="space-y-1.5">
            {losers.map((p, i) => (
              <div key={p.symbol} className="flex items-center justify-between rounded-lg bg-red-500/10 px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <Medal size={12} className={medalColors[i]} />
                  <span className="text-xs font-semibold text-foreground">{p.symbol}</span>
                </div>
                <span className="text-xs font-bold text-red-400">{fmtPct(p.pnlPct, true)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section 2: Asset Allocation Monitor ─────────────────────────────────────

function AssetAllocationMonitor({ classes }: { classes: AssetClass[] }) {
  const lastRebalance = "47 days ago";
  const daysUntilReview = 13;

  const overallStatus: "green" | "yellow" | "red" = useMemo(() => {
    const maxDrift = Math.max(...classes.map((c) => Math.abs(c.actual - c.target)));
    if (maxDrift > 8) return "red";
    if (maxDrift > 5) return "yellow";
    return "green";
  }, [classes]);

  const donutActual = classes.map((c) => ({ value: c.actual, color: c.color, label: c.name }));
  const donutTarget = classes.map((c) => ({ value: c.target, color: c.color }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <TrafficLight status={overallStatus} />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={12} />
          Last rebalanced: <span className="font-semibold text-foreground">{lastRebalance}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Donut */}
        <div className="flex-shrink-0">
          <DonutChart data={donutActual} overlayData={donutTarget} size={180} />
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Solid = Actual · Dashed = Target
          </p>
        </div>

        {/* Drift table */}
        <div className="flex-1 space-y-2">
          {classes.map((c) => {
            const drift = c.actual - c.target;
            const driftAbs = Math.abs(drift);
            const alerting = driftAbs > 5;
            return (
              <div key={c.name} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-medium text-foreground">{c.name}</span>
                    {alerting && (
                      <AlertTriangle size={11} className={drift > 0 ? "text-amber-400" : "text-red-400"} />
                    )}
                  </div>
                  <div className="flex items-center gap-3 tabular-nums">
                    <span className="text-muted-foreground">T: {c.target}%</span>
                    <span className="font-semibold text-foreground">A: {c.actual.toFixed(1)}%</span>
                    <span className={cn("font-bold", alerting ? (drift > 0 ? "text-amber-400" : "text-red-400") : "text-muted-foreground")}>
                      {drift >= 0 ? "+" : ""}{drift.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
                  {/* Target marker */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-white/40"
                    style={{ left: `${Math.min(100, (c.target / 50) * 100)}%` }}
                  />
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (c.actual / 50) * 100)}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
          <div className="mt-3 rounded-lg border border-border bg-background p-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Next review:</span> in {daysUntilReview} days. Rebalance triggers when drift &gt; 5%.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section 3: Risk Dashboard ────────────────────────────────────────────────

function RiskDashboard({
  positions,
}: {
  positions: (Position & { marketValue: number; weight: number })[];
}) {
  resetSeed(201);
  const portfolioBeta = positions.reduce((s, p) => s + p.beta * (p.weight / 100), 0);
  const varDaily95 = +(portfolioBeta * 1.65 * 0.012 * 100).toFixed(2);
  const sharpe = +(0.8 + rand() * 0.9).toFixed(2);
  const maxDrawdown = +(4 + rand() * 12).toFixed(2);
  const top3Pct = positions
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .reduce((s, p) => s + p.weight, 0);

  // Correlation clusters (seeded)
  resetSeed(303);
  const clusters: { label: string; symbols: string[]; corr: number }[] = [
    { label: "Tech cluster", symbols: ["AAPL", "MSFT", "NVDA"], corr: 0.82 },
    { label: "Int'l cluster", symbols: ["VEA", "EFA"], corr: 0.91 },
    { label: "Fixed Income", symbols: ["AGG", "BND"], corr: 0.88 },
  ];

  const riskMetrics = [
    { label: "Portfolio Beta", value: portfolioBeta.toFixed(2), color: portfolioBeta > 1.2 ? "text-amber-400" : "text-foreground" },
    { label: "VaR (1D 95%)", value: `${varDaily95}%`, color: "text-red-400" },
    { label: "Sharpe (3M)", value: sharpe.toFixed(2), color: sharpe >= 1 ? "text-emerald-400" : sharpe >= 0.5 ? "text-amber-400" : "text-red-400" },
    { label: "Max Drawdown", value: `-${maxDrawdown.toFixed(2)}%`, color: "text-red-400" },
    { label: "Concentration", value: `${top3Pct.toFixed(1)}%`, color: top3Pct > 40 ? "text-amber-400" : "text-foreground" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {riskMetrics.map((m) => (
          <MetricChip key={m.label} label={m.label} value={m.value} valueClass={m.color} />
        ))}
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
          Correlation Clusters (&gt;0.7)
        </h4>
        <div className="space-y-2">
          {clusters.map((cl) => (
            <div key={cl.label} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
              <div className="flex items-center gap-2">
                <Shield size={13} className="text-amber-400" />
                <span className="text-xs font-semibold text-foreground">{cl.label}</span>
                <div className="flex gap-1">
                  {cl.symbols.map((sym) => (
                    <Badge key={sym} variant="outline" className="px-1.5 py-0 text-xs">
                      {sym}
                    </Badge>
                  ))}
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400">ρ={cl.corr.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
        <div className="flex items-start gap-2">
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0 text-amber-400" />
          <span className="text-amber-200">
            Top 3 positions represent <strong>{top3Pct.toFixed(1)}%</strong> of portfolio. Consider reducing concentration risk by diversifying into bonds or international equities.
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Section 4: Performance Attribution ──────────────────────────────────────

function PerformanceAttribution() {
  resetSeed(404);

  const portfolioReturn = +(4.2 + rand() * 8 - 2).toFixed(2);
  const spyReturn = +(3.8 + rand() * 5).toFixed(2);
  const alpha = +(portfolioReturn - spyReturn).toFixed(2);
  const trackingError = +(1.2 + rand() * 2.5).toFixed(2);

  const attribution = [
    { name: "Asset Allocation", value: +(rand() * 2 - 0.8).toFixed(2), color: "#3b82f6" },
    { name: "Security Selection", value: +(rand() * 3 - 0.5).toFixed(2), color: "#10b981" },
    { name: "Interaction Effect", value: +(rand() * 0.8 - 0.4).toFixed(2), color: "#f59e0b" },
  ];

  const factors = [
    { name: "Market (β)", loading: +(0.7 + rand() * 0.5).toFixed(2) },
    { name: "Size (SMB)", loading: +(rand() * 0.6 - 0.2).toFixed(2) },
    { name: "Value (HML)", loading: +(rand() * 0.5 - 0.25).toFixed(2) },
    { name: "Momentum", loading: +(rand() * 0.4 - 0.15).toFixed(2) },
  ];

  const sectorContrib = [
    { label: "Tech", value: +(rand() * 3 - 0.5).toFixed(2), color: "#3b82f6" },
    { label: "Financials", value: +(rand() * 2 - 1).toFixed(2), color: "#10b981" },
    { label: "Healthcare", value: +(rand() * 1.5 - 0.5).toFixed(2), color: "#f59e0b" },
    { label: "Consumer", value: +(rand() * 1.2 - 0.8).toFixed(2), color: "#8b5cf6" },
    { label: "Intl", value: +(rand() * 1.5 - 1).toFixed(2), color: "#06b6d4" },
    { label: "Fixed Inc.", value: +(rand() * 0.8 - 0.3).toFixed(2), color: "#ec4899" },
  ];

  const sortedContrib = [...sectorContrib].sort((a, b) => b.value - a.value);
  const topContrib = sortedContrib.slice(0, 3);
  const bottomContrib = sortedContrib.slice(-3).reverse();

  return (
    <div className="space-y-4">
      {/* Alpha and tracking error */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricChip label="Portfolio Return" value={fmtPct(portfolioReturn, true)} valueClass={pctColor(portfolioReturn)} />
        <MetricChip label="Benchmark (SPY)" value={fmtPct(spyReturn, true)} valueClass={pctColor(spyReturn)} />
        <MetricChip label="Alpha" value={fmtPct(alpha, true)} valueClass={pctColor(alpha)} />
        <MetricChip label="Tracking Error" value={`${trackingError}%`} />
      </div>

      {/* Brinson attribution */}
      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
          Brinson Attribution
        </h4>
        <div className="space-y-1.5">
          {attribution.map((a) => (
            <div key={a.name} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: a.color }} />
                <span className="text-xs text-muted-foreground">{a.name}</span>
              </div>
              <span className={cn("text-xs font-bold tabular-nums", pctColor(a.value))}>
                {fmtPct(a.value, true)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Factor loadings */}
      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
          Factor Exposures
        </h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {factors.map((f) => (
            <div key={f.name} className="rounded-lg border border-border bg-background px-2 py-1.5">
              <div className="text-xs text-muted-foreground">{f.name}</div>
              <div className={cn("text-xs font-bold tabular-nums", pctColor(f.loading))}>
                {f.loading >= 0 ? "+" : ""}{f.loading}
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.abs(f.loading) * 100)}%`,
                    backgroundColor: f.loading >= 0 ? "#10b981" : "#ef4444",
                    marginLeft: f.loading < 0 ? `${Math.max(0, 100 - Math.abs(f.loading) * 100)}%` : undefined,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sector bar chart */}
      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
          Sector Contribution
        </h4>
        <BarChart
          data={sectorContrib.map((d) => ({ label: d.label, value: +d.value, color: d.color }))}
          width={340}
          height={130}
        />
      </div>

      {/* Best/worst contributors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1.5 text-xs font-semibold text-emerald-400">Best Contributors</div>
          {topContrib.map((c, i) => (
            <div key={c.label} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <span className={medalColors[i]}><Medal size={11} /></span>
                <span className="text-xs text-foreground">{c.label}</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">{fmtPct(c.value, true)}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="mb-1.5 text-xs font-semibold text-red-400">Worst Contributors</div>
          {bottomContrib.map((c, i) => (
            <div key={c.label} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <span className={medalColors[i]}><Medal size={11} /></span>
                <span className="text-xs text-foreground">{c.label}</span>
              </div>
              <span className="text-xs font-bold text-red-400">{fmtPct(c.value, true)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const medalColors = ["text-yellow-400", "text-muted-foreground", "text-amber-600"];

// ─── Section 5: Trade Suggestions ────────────────────────────────────────────

interface TradeSuggestion {
  symbol: string;
  action: "BUY" | "SELL";
  shares: number;
  value: number;
  taxImpact: number | null;
  commission: number;
  spreadCost: number;
  reason: string;
  priority: "tax-loss" | "rebalance";
  unrealizedLoss?: number;
}

function TradeSuggestions({
  positions,
}: {
  positions: (Position & { marketValue: number; pnl: number; weight: number })[];
}) {
  resetSeed(505);
  const totalValue = positions.reduce((s, p) => s + p.marketValue, 0);

  const TARGETS: Record<string, number> = {
    "US Equity": 45, "Int'l Equity": 20, Bonds: 20, Alternatives: 10, Cash: 5,
  };

  const classValues: Record<string, number> = {};
  for (const p of positions) {
    classValues[p.assetClass] = (classValues[p.assetClass] ?? 0) + p.marketValue;
  }

  const suggestions: TradeSuggestion[] = [];

  // Tax-loss harvesting
  const lossPositions = positions.filter((p) => p.pnl < -1000);
  for (const p of lossPositions) {
    suggestions.push({
      symbol: p.symbol,
      action: "SELL",
      shares: p.shares,
      value: p.marketValue,
      taxImpact: Math.abs(p.pnl) * 0.22,
      commission: 0.65,
      spreadCost: +(p.currentPrice * 0.0005 * p.shares).toFixed(2),
      reason: `Tax-loss harvest: ${fmt$(p.pnl)} unrealized loss`,
      priority: "tax-loss",
      unrealizedLoss: p.pnl,
    });
  }

  // Rebalancing suggestions
  for (const [cls, targetPct] of Object.entries(TARGETS)) {
    const currentValue = classValues[cls] ?? 0;
    const currentPct = (currentValue / totalValue) * 100;
    const drift = currentPct - targetPct;
    if (Math.abs(drift) < 3) continue;

    const classPositions = positions.filter((p) => p.assetClass === cls);
    if (classPositions.length === 0) continue;

    const targetValue = (targetPct / 100) * totalValue;
    const diffValue = Math.abs(currentValue - targetValue);
    const rep = classPositions[0];
    const sharesToTrade = Math.round(diffValue / rep.currentPrice);
    if (sharesToTrade < 1) continue;

    suggestions.push({
      symbol: rep.symbol,
      action: drift > 0 ? "SELL" : "BUY",
      shares: sharesToTrade,
      value: sharesToTrade * rep.currentPrice,
      taxImpact: drift > 0 ? sharesToTrade * rep.currentPrice * 0.15 * 0.22 : null,
      commission: 0.65,
      spreadCost: +(rep.currentPrice * 0.0005 * sharesToTrade).toFixed(2),
      reason: `Rebalance ${cls}: ${drift >= 0 ? "+" : ""}${drift.toFixed(1)}% vs target`,
      priority: "rebalance",
    });
  }

  // Sort: tax-loss first
  const sorted = [...suggestions].sort((a, b) => {
    if (a.priority === "tax-loss" && b.priority !== "tax-loss") return -1;
    if (b.priority === "tax-loss" && a.priority !== "tax-loss") return 1;
    return b.value - a.value;
  });

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-background p-2.5 text-xs text-muted-foreground">
        <Info size={12} className="mr-1.5 inline text-primary" />
        Suggestions ordered by priority: tax-loss harvests first, then rebalancing trades.
      </div>

      {sorted.map((t, i) => (
        <motion.div
          key={`${t.symbol}-${t.action}-${i}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className={cn(
            "rounded-xl border p-3",
            t.priority === "tax-loss"
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-border bg-card"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "text-xs font-bold",
                  t.action === "BUY"
                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                )}
              >
                {t.action}
              </Badge>
              <span className="font-bold text-foreground">{t.symbol}</span>
              <span className="text-xs text-muted-foreground">{t.shares} shares</span>
              {t.priority === "tax-loss" && (
                <Badge variant="outline" className="border-emerald-500/50 text-xs text-emerald-400">
                  Tax-Loss Harvest
                </Badge>
              )}
            </div>
            <span className="text-xs font-bold text-foreground">{fmt$(t.value)}</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{t.reason}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {t.taxImpact !== null && (
              <span>
                Tax savings: <span className="font-semibold text-emerald-400">{fmt$(t.taxImpact)}</span>
              </span>
            )}
            <span>
              Commission: <span className="font-semibold text-foreground">${t.commission.toFixed(2)}</span>
            </span>
            <span>
              Spread cost: <span className="font-semibold text-foreground">${t.spreadCost.toFixed(2)}</span>
            </span>
            <span>
              Total cost:{" "}
              <span className="font-semibold text-amber-400">
                ${(t.commission + t.spreadCost).toFixed(2)}
              </span>
            </span>
          </div>
        </motion.div>
      ))}

      {sorted.length === 0 && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <CheckCircle size={20} className="mx-auto mb-1.5 text-emerald-400" />
          <p className="text-sm font-semibold text-emerald-400">Portfolio is well balanced</p>
          <p className="mt-0.5 text-xs text-muted-foreground">No rebalancing needed at this time.</p>
        </div>
      )}
    </div>
  );
}

// ─── Section 6: Alerts & Notifications ───────────────────────────────────────

function AlertsNotifications({ positions }: { positions: (Position & { weight: number })[] }) {
  resetSeed(606);
  const [expanded, setExpanded] = useState<string | null>("stop_loss");

  const stopLossAlerts: Alert[] = positions.slice(0, 10).map((p) => {
    const stopLevel = +(p.currentPrice * (0.88 + rand() * 0.06)).toFixed(2);
    const distPct = ((p.currentPrice - stopLevel) / p.currentPrice) * 100;
    const severity: Alert["severity"] = distPct < 3 ? "red" : distPct < 7 ? "yellow" : "green";
    return {
      id: `sl-${p.symbol}`,
      type: "stop_loss",
      symbol: p.symbol,
      message: `Stop loss at ${fmt$(stopLevel)} (${distPct.toFixed(1)}% below current)`,
      severity,
    };
  });

  const earningsAlerts: Alert[] = positions
    .filter((p) => !["AGG", "BND", "GLD", "VTIP", "VEA", "EFA"].includes(p.symbol))
    .map((p) => {
      const daysOut = Math.floor(rand() * 60 + 3);
      const date = new Date(Date.now() + daysOut * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const severity: Alert["severity"] = daysOut < 7 ? "red" : daysOut < 21 ? "yellow" : "green";
      return {
        id: `earn-${p.symbol}`,
        type: "earnings",
        symbol: p.symbol,
        message: `Earnings in ${daysOut}d (${date}) — est. EPS ${(rand() * 5 + 0.5).toFixed(2)}`,
        severity,
        date,
      };
    });

  const dividendAlerts: Alert[] = ["JNJ", "JPM", "AGG", "BND", "VTIP"].map((sym) => {
    const daysOut = Math.floor(rand() * 45 + 5);
    const date = new Date(Date.now() + daysOut * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const yld = (rand() * 3 + 0.8).toFixed(2);
    return {
      id: `div-${sym}`,
      type: "dividend",
      symbol: sym,
      message: `Ex-div on ${date} · Yield ${yld}%`,
      severity: "green" as const,
      date,
    };
  });

  const ratingAlerts: Alert[] = ["AAPL", "MSFT", "NVDA", "AMZN"].map((sym) => {
    const ratings = ["Upgraded to Buy", "Downgraded to Hold", "Reiterated Outperform", "Price target raised"];
    const rating = ratings[Math.floor(rand() * ratings.length)];
    const isDowngrade = rating.includes("Downgraded");
    return {
      id: `rat-${sym}`,
      type: "rating",
      symbol: sym,
      message: `${rating} by ${["Goldman Sachs", "Morgan Stanley", "JPMorgan", "BofA"][Math.floor(rand() * 4)]}`,
      severity: isDowngrade ? "yellow" : ("green" as const),
    };
  });

  const concentrationAlerts: Alert[] = positions
    .filter((p) => p.weight > 10)
    .map((p) => ({
      id: `conc-${p.symbol}`,
      type: "concentration" as const,
      symbol: p.symbol,
      message: `Position is ${p.weight.toFixed(1)}% of portfolio — exceeds 10% guideline`,
      severity: "red" as const,
    }));

  const groups: { key: string; label: string; icon: React.ReactNode; alerts: Alert[] }[] = [
    { key: "stop_loss", label: "Stop Loss", icon: <Shield size={13} />, alerts: stopLossAlerts },
    { key: "earnings", label: "Earnings Calendar", icon: <Calendar size={13} />, alerts: earningsAlerts },
    { key: "dividend", label: "Ex-Dividend Dates", icon: <DollarSign size={13} />, alerts: dividendAlerts },
    { key: "rating", label: "Analyst Ratings", icon: <BarChart2 size={13} />, alerts: ratingAlerts },
    { key: "concentration", label: "Concentration Alerts", icon: <AlertTriangle size={13} />, alerts: concentrationAlerts },
  ];

  const severityColor = (s: Alert["severity"]) =>
    s === "green" ? "text-emerald-400" : s === "yellow" ? "text-amber-400" : "text-red-400";
  const severityBg = (s: Alert["severity"]) =>
    s === "green" ? "bg-emerald-500/10" : s === "yellow" ? "bg-amber-500/10" : "bg-red-500/10";

  return (
    <div className="space-y-2">
      {groups.map((g) => (
        <div key={g.key} className="rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === g.key ? null : g.key)}
            className="flex w-full items-center justify-between bg-card px-4 py-2.5 text-left hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-primary">{g.icon}</span>
              <span className="text-xs font-semibold text-foreground">{g.label}</span>
              <Badge variant="outline" className="px-1.5 py-0 text-xs">
                {g.alerts.length}
              </Badge>
              {g.alerts.some((a) => a.severity === "red") && (
                <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              )}
            </div>
            {expanded === g.key ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>

          <AnimatePresence initial={false}>
            {expanded === g.key && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="divide-y divide-border border-t border-border">
                  {g.alerts.map((a) => (
                    <div
                      key={a.id}
                      className={cn("flex items-start gap-3 px-4 py-2.5", severityBg(a.severity))}
                    >
                      <div className={cn("mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full", {
                        "bg-emerald-400": a.severity === "green",
                        "bg-amber-400": a.severity === "yellow",
                        "bg-red-400": a.severity === "red",
                      })} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{a.symbol}</span>
                          <span className={cn("text-xs font-medium", severityColor(a.severity))}>
                            {a.severity === "red" ? "HIGH" : a.severity === "yellow" ? "MEDIUM" : "LOW"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{a.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PortfolioMonitor() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  // Derived positions with computed fields
  const enrichedPositions = useMemo(() => {
    const totalValue = POSITIONS.reduce((s, p) => s + p.shares * p.currentPrice, 0);
    return POSITIONS.map((p) => {
      const marketValue = p.shares * p.currentPrice;
      const pnl = marketValue - p.shares * p.costBasis;
      const pnlPct = (pnl / (p.shares * p.costBasis)) * 100;
      const weight = (marketValue / totalValue) * 100;
      return { ...p, marketValue, pnl, pnlPct, weight };
    });
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute actual asset class allocations
  const assetClasses: AssetClass[] = useMemo(() => {
    const totalValue = enrichedPositions.reduce((s, p) => s + p.marketValue, 0);
    return ASSET_CLASSES.map((ac) => {
      const actual = enrichedPositions
        .filter((p) => p.assetClass === ac.name)
        .reduce((s, p) => s + p.weight, 0);
      return { ...ac, actual: +actual.toFixed(1) };
    });
  }, [enrichedPositions]);

  function handleRefresh() {
    setLastUpdated(new Date());
    setRefreshKey((k) => k + 1);
  }

  const totalAlerts = useMemo(() => {
    return enrichedPositions.filter((p) => p.weight > 10).length + 4; // stop-loss reds + 4 fixed
  }, [enrichedPositions]);

  return (
    <div className="min-h-screen bg-background p-4 text-foreground md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Portfolio Monitor</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Simulated monitoring, rebalancing &amp; risk analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={12} />
            Updated {lastUpdated.toLocaleTimeString()}
          </div>
          {totalAlerts > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-400">
              <Bell size={11} />
              {totalAlerts} alerts
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="snapshot">
        <TabsList className="mb-4 flex flex-wrap gap-1 h-auto bg-muted/30">
          {[
            { value: "snapshot",    label: "Snapshot",    icon: <BarChart2 size={13} /> },
            { value: "allocation",  label: "Allocation",  icon: <Target size={13} /> },
            { value: "risk",        label: "Risk",        icon: <Shield size={13} /> },
            { value: "attribution", label: "Attribution", icon: <TrendingUp size={13} /> },
            { value: "trades",      label: "Suggestions", icon: <Zap size={13} /> },
            { value: "alerts",      label: "Alerts",      icon: <Bell size={13} /> },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="flex items-center gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              {t.icon}
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="snapshot" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SectionCard title="Portfolio Snapshot" icon={<BarChart2 size={15} />}>
                <PortfolioSnapshot positions={enrichedPositions} />
              </SectionCard>
            </motion.div>
          </TabsContent>

          <TabsContent value="allocation" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SectionCard title="Asset Allocation Monitor" icon={<Target size={15} />}>
                <AssetAllocationMonitor classes={assetClasses} />
              </SectionCard>
            </motion.div>
          </TabsContent>

          <TabsContent value="risk" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SectionCard title="Risk Dashboard" icon={<Shield size={15} />}>
                <RiskDashboard positions={enrichedPositions} />
              </SectionCard>
            </motion.div>
          </TabsContent>

          <TabsContent value="attribution" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SectionCard title="Performance Attribution" icon={<TrendingUp size={15} />}>
                <PerformanceAttribution />
              </SectionCard>
            </motion.div>
          </TabsContent>

          <TabsContent value="trades" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SectionCard title="Trade Suggestions" icon={<Zap size={15} />}>
                <TradeSuggestions positions={enrichedPositions} />
              </SectionCard>
            </motion.div>
          </TabsContent>

          <TabsContent value="alerts" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SectionCard title="Alerts &amp; Notifications" icon={<Bell size={15} />}>
                <AlertsNotifications positions={enrichedPositions} />
              </SectionCard>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
