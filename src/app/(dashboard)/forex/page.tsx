"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  BookOpen,
  BarChart2,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  Info,
  Zap,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) & 0xffffffff;
  return h >>> 0;
}

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ── Constants ─────────────────────────────────────────────────────────────────

interface PairDef {
  pair: string;
  base: string;
  quote: string;
  baseRate: number;
  isJpy: boolean;
  category: "major" | "minor" | "exotic";
  flag1: string;
  flag2: string;
}

const PAIR_DEFS: PairDef[] = [
  { pair: "EUR/USD", base: "EUR", quote: "USD", baseRate: 1.0842, isJpy: false, category: "major",  flag1: "🇪🇺", flag2: "🇺🇸" },
  { pair: "GBP/USD", base: "GBP", quote: "USD", baseRate: 1.2654, isJpy: false, category: "major",  flag1: "🇬🇧", flag2: "🇺🇸" },
  { pair: "USD/JPY", base: "USD", quote: "JPY", baseRate: 151.42, isJpy: true,  category: "major",  flag1: "🇺🇸", flag2: "🇯🇵" },
  { pair: "USD/CHF", base: "USD", quote: "CHF", baseRate: 0.8923, isJpy: false, category: "major",  flag1: "🇺🇸", flag2: "🇨🇭" },
  { pair: "AUD/USD", base: "AUD", quote: "USD", baseRate: 0.6571, isJpy: false, category: "major",  flag1: "🇦🇺", flag2: "🇺🇸" },
  { pair: "USD/CAD", base: "USD", quote: "CAD", baseRate: 1.3612, isJpy: false, category: "major",  flag1: "🇺🇸", flag2: "🇨🇦" },
  { pair: "EUR/GBP", base: "EUR", quote: "GBP", baseRate: 0.8567, isJpy: false, category: "minor",  flag1: "🇪🇺", flag2: "🇬🇧" },
  { pair: "EUR/JPY", base: "EUR", quote: "JPY", baseRate: 163.92, isJpy: true,  category: "minor",  flag1: "🇪🇺", flag2: "🇯🇵" },
  { pair: "GBP/JPY", base: "GBP", quote: "JPY", baseRate: 191.54, isJpy: true,  category: "minor",  flag1: "🇬🇧", flag2: "🇯🇵" },
  { pair: "NZD/USD", base: "NZD", quote: "USD", baseRate: 0.6082, isJpy: false, category: "minor",  flag1: "🇳🇿", flag2: "🇺🇸" },
  { pair: "USD/MXN", base: "USD", quote: "MXN", baseRate: 17.05,  isJpy: false, category: "exotic", flag1: "🇺🇸", flag2: "🇲🇽" },
  { pair: "USD/ZAR", base: "USD", quote: "ZAR", baseRate: 18.72,  isJpy: false, category: "exotic", flag1: "🇺🇸", flag2: "🇿🇦" },
];

// Central bank rates
const CB_RATES: Record<string, number> = {
  USD: 5.25,
  EUR: 4.00,
  GBP: 5.00,
  JPY: 0.10,
  CHF: 1.75,
  AUD: 4.35,
  NZD: 5.25,
  CAD: 5.00,
  MXN: 11.00,
  ZAR: 8.25,
};

// Economic calendar events
const ECO_EVENTS = [
  { date: "Mar 28", time: "08:30", country: "🇺🇸", event: "Non-Farm Payrolls (NFP)", forecast: "185K", previous: "151K", impact: "high" as const },
  { date: "Mar 28", time: "08:30", country: "🇺🇸", event: "Unemployment Rate", forecast: "4.1%", previous: "4.0%", impact: "high" as const },
  { date: "Mar 28", time: "08:30", country: "🇺🇸", event: "Average Hourly Earnings MoM", forecast: "0.3%", previous: "0.3%", impact: "medium" as const },
  { date: "Apr 2",  time: "09:00", country: "🇪🇺", event: "ECB Monetary Policy Minutes", forecast: "—", previous: "—", impact: "high" as const },
  { date: "Apr 3",  time: "08:30", country: "🇺🇸", event: "Initial Jobless Claims", forecast: "225K", previous: "219K", impact: "medium" as const },
  { date: "Apr 7",  time: "09:30", country: "🇬🇧", event: "UK GDP MoM", forecast: "0.1%", previous: "0.0%", impact: "high" as const },
  { date: "Apr 8",  time: "19:00", country: "🇺🇸", event: "FOMC Meeting Minutes", forecast: "—", previous: "—", impact: "high" as const },
  { date: "Apr 10", time: "08:30", country: "🇺🇸", event: "CPI YoY", forecast: "3.1%", previous: "3.2%", impact: "high" as const },
  { date: "Apr 10", time: "08:30", country: "🇺🇸", event: "Core CPI MoM", forecast: "0.3%", previous: "0.4%", impact: "high" as const },
  { date: "Apr 11", time: "08:30", country: "🇺🇸", event: "PPI MoM", forecast: "0.2%", previous: "0.3%", impact: "medium" as const },
  { date: "Apr 14", time: "08:30", country: "🇨🇦", event: "Bank of Canada Rate Decision", forecast: "2.75%", previous: "3.00%", impact: "high" as const },
  { date: "Apr 17", time: "21:30", country: "🇦🇺", event: "RBA Meeting Minutes", forecast: "—", previous: "—", impact: "medium" as const },
  { date: "Apr 24", time: "03:00", country: "🇯🇵", event: "Bank of Japan Rate Decision", forecast: "0.50%", previous: "0.10%", impact: "high" as const },
  { date: "Apr 25", time: "08:30", country: "🇺🇸", event: "US GDP QoQ (Advance)", forecast: "2.4%", previous: "2.3%", impact: "high" as const },
  { date: "Apr 30", time: "09:15", country: "🇪🇺", event: "ECB Interest Rate Decision", forecast: "3.65%", previous: "3.90%", impact: "high" as const },
];

// Event historical pip moves
const EVENT_PIP_MOVES: Record<string, number> = {
  "Non-Farm Payrolls (NFP)": 85,
  "CPI YoY": 62,
  "FOMC Meeting Minutes": 55,
  "ECB Interest Rate Decision": 70,
  "Bank of Japan Rate Decision": 90,
  "UK GDP MoM": 40,
  "Bank of Canada Rate Decision": 48,
  "US GDP QoQ (Advance)": 38,
  "Core CPI MoM": 50,
};

// Correlation matrix (6×6 major pairs)
const CORR_PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "EUR/JPY", "NZD/USD"];
const CORR_MATRIX: number[][] = [
  [ 1.00,  0.87, -0.74, -0.89,  0.82, -0.68,  0.75,  0.79],
  [ 0.87,  1.00, -0.61, -0.78,  0.76, -0.58,  0.65,  0.72],
  [-0.74, -0.61,  1.00,  0.71, -0.55,  0.62,  0.88, -0.52],
  [-0.89, -0.78,  0.71,  1.00, -0.77,  0.61, -0.69, -0.74],
  [ 0.82,  0.76, -0.55, -0.77,  1.00, -0.49,  0.68,  0.93],
  [-0.68, -0.58,  0.62,  0.61, -0.49,  1.00, -0.54, -0.45],
  [ 0.75,  0.65,  0.88, -0.69,  0.68, -0.54,  1.00,  0.62],
  [ 0.79,  0.72, -0.52, -0.74,  0.93, -0.45,  0.62,  1.00],
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface FxPairData extends PairDef {
  price: number;
  bid: number;
  ask: number;
  spreadPips: number;
  change1d: number;
  sparkline: number[];
}

// ── Data generation ───────────────────────────────────────────────────────────

function generatePairData(seed: number): FxPairData[] {
  return PAIR_DEFS.map((def) => {
    const rng = mulberry32(hashStr(def.pair) ^ seed);
    const change1d = (rng() - 0.5) * 1.4;
    const price = def.baseRate * (1 + change1d / 100);
    const pipSize = def.isJpy ? 0.01 : 0.0001;

    let spreadPips: number;
    if (def.category === "major") spreadPips = 0.5 + rng() * 1.0;
    else if (def.category === "minor") spreadPips = 1.0 + rng() * 2.0;
    else spreadPips = 5.0 + rng() * 10.0;
    spreadPips = Math.round(spreadPips * 10) / 10;

    const halfSpread = (spreadPips * pipSize) / 2;

    // Sparkline: 20 bars
    let sp = def.baseRate;
    const sparkline: number[] = [];
    const spRng = mulberry32(hashStr(def.pair + "spark") ^ seed);
    for (let i = 0; i < 20; i++) {
      sp = sp * (1 + (spRng() - 0.5) * 0.003);
      sparkline.push(sp);
    }
    sparkline[19] = price;

    return {
      ...def,
      price,
      bid: price - halfSpread,
      ask: price + halfSpread,
      spreadPips,
      change1d,
      sparkline,
    };
  });
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtRate(price: number, isJpy: boolean): string {
  return isJpy ? price.toFixed(2) : price.toFixed(4);
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

// ── SVG Sparkline ─────────────────────────────────────────────────────────────

function Sparkline({ data, positive, width = 80, height = 28 }: { data: number[]; positive: boolean; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  const color = positive ? "#22c55e" : "#ef4444";
  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── SVG Bar Chart (carry) ─────────────────────────────────────────────────────

function CarryBarChart({ data }: { data: { pair: string; carry: number }[] }) {
  const W = 560;
  const H = 200;
  const PAD_L = 72;
  const PAD_B = 28;
  const PAD_T = 16;
  const PAD_R = 12;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.carry)));
  const barW = chartW / data.length;

  const zeroY = PAD_T + (maxAbs / (2 * maxAbs)) * chartH;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Zero line */}
      <line x1={PAD_L} y1={zeroY} x2={W - PAD_R} y2={zeroY} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />

      {/* Bars */}
      {data.map((d, i) => {
        const x = PAD_L + i * barW + barW * 0.15;
        const bw = barW * 0.7;
        const pct = d.carry / maxAbs;
        const barH = Math.abs(pct) * (chartH / 2);
        const isPos = d.carry >= 0;
        const color = isPos ? "#22c55e" : "#ef4444";
        const rectY = isPos ? zeroY - barH : zeroY;
        return (
          <g key={d.pair}>
            <rect x={x} y={rectY} width={bw} height={barH} fill={color} fillOpacity={0.75} rx={2} />
            <text x={x + bw / 2} y={H - PAD_B + 14} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.6}>
              {d.pair.split("/")[0]}/{d.pair.split("/")[1]}
            </text>
            <text
              x={x + bw / 2}
              y={isPos ? rectY - 4 : rectY + barH + 10}
              textAnchor="middle" fontSize={9} fill={color}
            >
              {d.carry >= 0 ? "+" : ""}{d.carry.toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* Y-axis label */}
      <text x={PAD_L - 8} y={zeroY + 4} textAnchor="end" fontSize={9} fill="currentColor" fillOpacity={0.4}>0</text>
      <text x={8} y={PAD_T + chartH / 4} textAnchor="start" fontSize={8} fill="currentColor" fillOpacity={0.4}
        transform={`rotate(-90, 8, ${PAD_T + chartH / 4})`}>
        USD/yr per 100k
      </text>
    </svg>
  );
}

// ── SVG Volatility Spike Chart ────────────────────────────────────────────────

function VolatilitySpikeChart({ events }: { events: typeof ECO_EVENTS }) {
  const topEvents = events.filter((e) => EVENT_PIP_MOVES[e.event]).slice(0, 8);
  const W = 560;
  const H = 180;
  const PAD_L = 160;
  const PAD_R = 60;
  const PAD_T = 16;
  const PAD_B = 24;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const maxPips = Math.max(...topEvents.map((e) => EVENT_PIP_MOVES[e.event] ?? 0));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {topEvents.map((e, i) => {
        const pips = EVENT_PIP_MOVES[e.event] ?? 20;
        const barH = (pips / maxPips) * chartH;
        const y = PAD_T + (chartH - barH);
        const barW = chartW / topEvents.length;
        const x = PAD_L + i * barW + barW * 0.2;
        const bw = barW * 0.6;
        const color = e.impact === "high" ? "#ef4444" : e.impact === "medium" ? "#f59e0b" : "#6366f1";
        return (
          <g key={`${e.event}-${i}`}>
            <rect x={x} y={y} width={bw} height={barH} fill={color} fillOpacity={0.7} rx={2} />
            <text x={x + bw / 2} y={H - PAD_B + 12} textAnchor="middle" fontSize={8} fill="currentColor" fillOpacity={0.5}>
              {e.country}
            </text>
            <text x={x + bw / 2} y={y - 4} textAnchor="middle" fontSize={9} fill={color}>
              {pips}p
            </text>
          </g>
        );
      })}
      {/* Left labels */}
      {topEvents.map((e, i) => (
        <text key={`lbl-${i}`} x={PAD_L - 6} y={PAD_T + (i * (chartH / topEvents.length)) + 12}
          textAnchor="end" fontSize={8} fill="currentColor" fillOpacity={0.45}>
          {e.event.length > 22 ? e.event.slice(0, 22) + "…" : e.event}
        </text>
      ))}
      {/* Axes */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + chartH} stroke="currentColor" strokeOpacity={0.15} />
      <line x1={PAD_L} y1={PAD_T + chartH} x2={W - PAD_R} y2={PAD_T + chartH} stroke="currentColor" strokeOpacity={0.15} />
    </svg>
  );
}

// ── SVG Correlation Heatmap ───────────────────────────────────────────────────

function CorrelationHeatmap() {
  const n = CORR_PAIRS.length;
  const CELL = 44;
  const PAD = 80;
  const W = PAD + n * CELL + 4;
  const H = PAD + n * CELL + 4;

  function corrColor(v: number): string {
    if (v >= 0.7) return "#16a34a";
    if (v >= 0.3) return "#4ade80";
    if (v >= -0.3) return "hsl(var(--muted))";
    if (v >= -0.7) return "#f87171";
    return "#dc2626";
  }

  function textColor(v: number): string {
    if (Math.abs(v) >= 0.5) return "#fff";
    return "currentColor";
  }

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ maxWidth: W }}>
      {/* Column headers */}
      {CORR_PAIRS.map((p, i) => (
        <text
          key={`ch-${p}`}
          x={PAD + i * CELL + CELL / 2}
          y={PAD - 6}
          textAnchor="middle"
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.6}
          transform={`rotate(-40, ${PAD + i * CELL + CELL / 2}, ${PAD - 6})`}
        >
          {p}
        </text>
      ))}
      {/* Row headers */}
      {CORR_PAIRS.map((p, i) => (
        <text
          key={`rh-${p}`}
          x={PAD - 6}
          y={PAD + i * CELL + CELL / 2 + 4}
          textAnchor="end"
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.6}
        >
          {p}
        </text>
      ))}
      {/* Cells */}
      {CORR_MATRIX.map((row, ri) =>
        row.map((val, ci) => {
          const x = PAD + ci * CELL;
          const y = PAD + ri * CELL;
          return (
            <g key={`cell-${ri}-${ci}`}>
              <rect x={x} y={y} width={CELL - 2} height={CELL - 2} fill={corrColor(val)} rx={2} />
              <text
                x={x + CELL / 2 - 1}
                y={y + CELL / 2 + 4}
                textAnchor="middle"
                fontSize={9}
                fontWeight={ri === ci ? "700" : "400"}
                fill={textColor(val)}
                fillOpacity={0.9}
              >
                {val.toFixed(2)}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}

// ── Tab 1: Currency Pairs ─────────────────────────────────────────────────────

function CurrencyPairsTab({ pairs }: { pairs: FxPairData[] }) {
  const [lotType, setLotType] = useState<"micro" | "mini" | "standard">("mini");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "major" | "minor" | "exotic">("all");

  const lotSize = lotType === "micro" ? 1000 : lotType === "mini" ? 10000 : 100000;
  const filtered = selectedCategory === "all" ? pairs : pairs.filter((p) => p.category === selectedCategory);

  function pipValueUsd(pair: FxPairData): number {
    const pipSize = pair.isJpy ? 0.01 : 0.0001;
    if (pair.quote === "USD") return pipSize * lotSize;
    if (pair.base === "USD") return (pipSize * lotSize) / pair.price;
    return pipSize * lotSize; // approximation
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {(["all", "major", "minor", "exotic"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1 rounded text-xs font-medium capitalize transition-colors",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">Pip calculator:</span>
          {(["micro", "mini", "standard"] as const).map((lt) => (
            <button
              key={lt}
              onClick={() => setLotType(lt)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors",
                lotType === lt ? "bg-primary/20 text-primary border border-primary/40" : "bg-muted/40 text-muted-foreground hover:bg-muted"
              )}
            >
              {lt} ({lt === "micro" ? "1k" : lt === "mini" ? "10k" : "100k"})
            </button>
          ))}
        </div>
      </div>

      {/* Pair grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((pair, idx) => {
          const isPos = pair.change1d >= 0;
          const pv = pipValueUsd(pair);
          return (
            <motion.div
              key={pair.pair}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.35 }}
            >
              <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-default">
                <CardContent className="p-3 flex flex-col gap-2">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base leading-none">{pair.flag1}</span>
                      <span className="text-base leading-none">{pair.flag2}</span>
                      <span className="font-bold text-sm">{pair.pair}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 capitalize ml-1">{pair.category}</Badge>
                    </div>
                    {isPos ? (
                      <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    )}
                  </div>

                  {/* Price + sparkline */}
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-lg font-mono font-bold tabular-nums">
                        {fmtRate(pair.price, pair.isJpy)}
                      </div>
                      <div className={cn("text-xs font-medium", isPos ? "text-green-500" : "text-red-500")}>
                        {fmtPct(pair.change1d)}
                      </div>
                    </div>
                    <Sparkline data={pair.sparkline} positive={isPos} />
                  </div>

                  {/* Bid/Ask */}
                  <div className="flex gap-2 text-xs">
                    <div className="flex-1 rounded bg-red-500/10 px-2 py-1 text-center">
                      <div className="text-[9px] text-muted-foreground mb-0.5">BID</div>
                      <div className="font-mono text-red-500 font-medium">{fmtRate(pair.bid, pair.isJpy)}</div>
                    </div>
                    <div className="flex-1 rounded bg-green-500/10 px-2 py-1 text-center">
                      <div className="text-[9px] text-muted-foreground mb-0.5">ASK</div>
                      <div className="font-mono text-green-500 font-medium">{fmtRate(pair.ask, pair.isJpy)}</div>
                    </div>
                  </div>

                  {/* Spread + pip value */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/30 pt-1.5">
                    <span>Spread: <span className="text-foreground font-medium">{pair.spreadPips} pips</span></span>
                    <span>1 pip = <span className="text-primary font-medium">${pv.toFixed(2)}</span></span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Pip value info */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-3 flex items-start gap-2">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pip values shown for <span className="text-foreground font-medium capitalize">{lotType} lot ({lotSize.toLocaleString()} units)</span> in USD.
            A pip is the 4th decimal place (0.0001) for most pairs, or the 2nd decimal place (0.01) for JPY pairs.
            Select a lot size above to see how much each pip move is worth in your account currency.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 2: FX Order Entry ─────────────────────────────────────────────────────

function OrderEntryTab({ pairs }: { pairs: FxPairData[] }) {
  const [selectedPair, setSelectedPair] = useState("EUR/USD");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [lots, setLots] = useState([0.1]);
  const [leverage, setLeverage] = useState<10 | 20 | 50 | 100>(50);
  const [slPips, setSlPips] = useState([30]);
  const [tpPips, setTpPips] = useState([60]);
  const [showDropdown, setShowDropdown] = useState(false);

  const pairData = pairs.find((p) => p.pair === selectedPair)!;
  const lotSize = 100000; // standard lot = 100k units
  const positionUnits = lots[0] * lotSize;
  const entryPrice = side === "buy" ? pairData.ask : pairData.bid;

  function pipValueUsd(): number {
    const pipSize = pairData.isJpy ? 0.01 : 0.0001;
    if (pairData.quote === "USD") return pipSize * positionUnits;
    if (pairData.base === "USD") return (pipSize * positionUnits) / entryPrice;
    return pipSize * positionUnits;
  }

  const pipVal = pipValueUsd();
  const notionalUsd = positionUnits * (pairData.isJpy ? entryPrice / 100 : entryPrice);
  const requiredMargin = notionalUsd / leverage;
  const slUsd = slPips[0] * pipVal;
  const tpUsd = tpPips[0] * pipVal;
  const rrRatio = slPips[0] > 0 ? (tpPips[0] / slPips[0]).toFixed(2) : "—";

  function handlePlaceOrder() {
    toast.success(
      `${side === "buy" ? "Buy" : "Sell"} ${lots[0].toFixed(2)} lots ${selectedPair}`,
      {
        description: `Entry: ${fmtRate(entryPrice, pairData.isJpy)} | SL: ${slPips[0]}p | TP: ${tpPips[0]}p | Margin: $${requiredMargin.toFixed(0)}`,
        duration: 4000,
      }
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex flex-col gap-5">
        {/* Pair selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Currency Pair</label>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedPair}</span>
                <span className="text-muted-foreground text-xs">
                  {fmtRate(pairData.price, pairData.isJpy)}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {showDropdown && (
              <div className="absolute top-full left-0 z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
                <div className="max-h-56 overflow-y-auto py-1">
                  {pairs.map((p) => (
                    <button
                      key={p.pair}
                      onClick={() => { setSelectedPair(p.pair); setShowDropdown(false); }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
                        p.pair === selectedPair && "bg-accent/60"
                      )}
                    >
                      <span>{p.flag1}{p.flag2}</span>
                      <span className="font-medium">{p.pair}</span>
                      <span className="ml-auto text-xs text-muted-foreground tabular-nums font-mono">
                        {fmtRate(p.price, p.isJpy)}
                      </span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 capitalize">{p.category}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buy/Sell toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Direction</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSide("buy")}
              className={cn(
                "flex items-center justify-center gap-2 h-11 rounded-md font-semibold text-sm transition-colors",
                side === "buy"
                  ? "bg-green-500 text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              BUY / Long
            </button>
            <button
              onClick={() => setSide("sell")}
              className={cn(
                "flex items-center justify-center gap-2 h-11 rounded-md font-semibold text-sm transition-colors",
                side === "sell"
                  ? "bg-red-500 text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <TrendingDown className="h-4 w-4" />
              SELL / Short
            </button>
          </div>
        </div>

        {/* Lot size slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-xs font-medium text-muted-foreground">Lot Size</label>
            <span className="text-xs font-bold tabular-nums">
              {lots[0].toFixed(2)} lots <span className="text-muted-foreground">({positionUnits.toLocaleString()} units)</span>
            </span>
          </div>
          <Slider
            min={0.01} max={10} step={0.01}
            value={lots}
            onValueChange={setLots}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0.01 lots (micro)</span>
            <span>1.00 lot (standard)</span>
            <span>10.00 lots</span>
          </div>
        </div>

        {/* Leverage selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Leverage</label>
          <div className="flex gap-2">
            {([10, 20, 50, 100] as const).map((lv) => (
              <button
                key={lv}
                onClick={() => setLeverage(lv)}
                className={cn(
                  "flex-1 h-9 rounded-md text-sm font-medium transition-colors",
                  leverage === lv
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {lv}x
              </button>
            ))}
          </div>
        </div>

        {/* SL / TP sliders */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-muted-foreground">Stop Loss</label>
              <span className="text-xs font-bold text-red-500">{slPips[0]} pips</span>
            </div>
            <Slider min={5} max={200} step={5} value={slPips} onValueChange={setSlPips} className="w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-muted-foreground">Take Profit</label>
              <span className="text-xs font-bold text-green-500">{tpPips[0]} pips</span>
            </div>
            <Slider min={5} max={400} step={5} value={tpPips} onValueChange={setTpPips} className="w-full" />
          </div>
        </div>

        {/* Position summary card */}
        <Card className="border-border/50 bg-muted/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">Entry Price</div>
                <div className="text-sm font-mono font-bold">{fmtRate(entryPrice, pairData.isJpy)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">Position Size</div>
                <div className="text-sm font-bold">${notionalUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">Required Margin</div>
                <div className="text-sm font-bold text-primary">${requiredMargin.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">1 Pip = </div>
                <div className="text-sm font-bold">${pipVal.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">SL Value</div>
                <div className="text-sm font-bold text-red-500">-${slUsd.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">TP Value</div>
                <div className="text-sm font-bold text-green-500">+${tpUsd.toFixed(0)}</div>
              </div>
            </div>

            {/* R:R ratio */}
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Risk/Reward Ratio</span>
              </div>
              <span className={cn(
                "text-sm font-bold",
                Number(rrRatio) >= 2 ? "text-green-500" : Number(rrRatio) >= 1 ? "text-amber-500" : "text-red-500"
              )}>
                1:{rrRatio}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Place order button */}
        <Button
          onClick={handlePlaceOrder}
          className={cn(
            "h-12 text-base font-bold",
            side === "buy" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
          )}
        >
          {side === "buy" ? "Place Buy Order" : "Place Sell Order"}
          <span className="ml-2 text-sm font-normal opacity-80">
            {lots[0].toFixed(2)} lots @ {fmtRate(entryPrice, pairData.isJpy)}
          </span>
        </Button>
      </div>
    </div>
  );
}

// ── Tab 3: Carry Trade Analysis ───────────────────────────────────────────────

function CarryTradeTab({ pairs }: { pairs: FxPairData[] }) {
  const carryData = useMemo(() => {
    return pairs.map((p) => {
      const baseRate = CB_RATES[p.base] ?? 0;
      const quoteRate = CB_RATES[p.quote] ?? 0;
      const differential = baseRate - quoteRate;
      // Carry per $100k per year
      const carryPerYear = (differential / 100) * 100000;
      const riskAdj = differential / (p.change1d === 0 ? 0.5 : Math.abs(p.change1d) * 52 ** 0.5);
      return {
        pair: p.pair,
        flag1: p.flag1,
        flag2: p.flag2,
        baseRate,
        quoteRate,
        differential,
        annualizedCarry: differential,
        carryPerYear,
        volatility: 6 + Math.abs(differential) * 0.5,
        carryRiskRatio: riskAdj,
      };
    }).sort((a, b) => b.differential - a.differential);
  }, [pairs]);

  const barData = carryData.map((d) => ({ pair: d.pair, carry: d.carryPerYear }));

  return (
    <div className="flex flex-col gap-5">
      {/* Explanation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">Carry trade</span>: borrow in a low-interest-rate currency and invest in a high-interest-rate currency, profiting from the interest rate differential (the "carry").
            The strategy works best in low-volatility, risk-on environments. The biggest risk is a sudden reversal ("carry unwind").
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-lg border border-border/50 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Pair</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Base Rate</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Quote Rate</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Differential</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Ann. Carry %</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Per $100k/yr</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Volatility</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Carry/Risk</th>
            </tr>
          </thead>
          <tbody>
            {carryData.map((row, i) => {
              const isPos = row.differential >= 0;
              return (
                <motion.tr
                  key={row.pair}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{row.flag1}{row.flag2}</span>
                      <span className="font-semibold">{row.pair}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{row.baseRate.toFixed(2)}%</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{row.quoteRate.toFixed(2)}%</td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums font-medium", isPos ? "text-green-500" : "text-red-500")}>
                    {isPos ? "+" : ""}{row.differential.toFixed(2)}%
                  </td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums", isPos ? "text-green-500" : "text-red-500")}>
                    {isPos ? "+" : ""}{row.annualizedCarry.toFixed(2)}%
                  </td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums font-mono", isPos ? "text-green-500" : "text-red-500")}>
                    {isPos ? "+" : ""}${row.carryPerYear.toFixed(0)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-amber-500">
                    {row.volatility.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    <Badge variant={row.carryRiskRatio > 0.5 ? "default" : "secondary"} className="text-[10px]">
                      {row.carryRiskRatio.toFixed(2)}
                    </Badge>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bar chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Carry Income per $100k Position (USD/year)</CardTitle>
        </CardHeader>
        <CardContent className="pb-4 px-4">
          <CarryBarChart data={barData} />
          <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-green-500/70" /> Positive carry (earn)</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-red-500/70" /> Negative carry (pay)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 4: Economic Calendar ──────────────────────────────────────────────────

function EconomicCalendarTab() {
  const impactColor = (impact: "high" | "medium" | "low") =>
    impact === "high" ? "bg-red-500/15 text-red-500 border-red-500/30" :
    impact === "medium" ? "bg-amber-500/15 text-amber-500 border-amber-500/30" :
    "bg-blue-500/15 text-blue-500 border-blue-500/30";

  return (
    <div className="flex flex-col gap-5">
      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500" /> High Impact
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> Medium Impact
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" /> Low Impact
        </div>
        <span className="ml-auto flex items-center gap-1">
          <RefreshCw className="h-3 w-3" /> Simulated data — for educational purposes
        </span>
      </div>

      {/* Events list */}
      <div className="rounded-lg border border-border/50 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Date / Time</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Country</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Event</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Forecast</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Previous</th>
              <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">Impact</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Avg Pip Move</th>
            </tr>
          </thead>
          <tbody>
            {ECO_EVENTS.map((ev, i) => {
              const pipMove = EVENT_PIP_MOVES[ev.event];
              return (
                <motion.tr
                  key={`${ev.event}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-3 py-2.5 tabular-nums text-xs">
                    <div className="font-medium">{ev.date}</div>
                    <div className="text-muted-foreground">{ev.time} ET</div>
                  </td>
                  <td className="px-3 py-2.5 text-center text-base">{ev.country}</td>
                  <td className="px-3 py-2.5 font-medium">{ev.event}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-xs font-mono">{ev.forecast}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-xs font-mono text-muted-foreground">{ev.previous}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", impactColor(ev.impact))}>
                      {ev.impact === "high" && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                      {ev.impact}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs">
                    {pipMove ? (
                      <span className="text-amber-500 font-medium">{pipMove}+ pips</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Volatility spike visualization */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Historical Pip Volatility on Major Events (EUR/USD)
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 px-4">
          <VolatilitySpikeChart events={ECO_EVENTS} />
          <p className="text-[10px] text-muted-foreground mt-2">
            Average pip movement in EUR/USD in the 4 hours following event release. High-impact events can cause immediate 50–100+ pip moves.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 5: FX Education ───────────────────────────────────────────────────────

const EDU_CARDS = [
  {
    icon: Calculator,
    title: "Pips & Lots",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    formula: "Pip Value = (0.0001 / Price) × Lot Size",
    explanation:
      "A pip (percentage in point) is the smallest standard move for a currency pair — the 4th decimal place (0.0001) for most pairs, and the 2nd decimal place for JPY pairs (0.01). Lot sizes: Micro = 1,000 units, Mini = 10,000, Standard = 100,000.",
    example: "1 standard lot EUR/USD at 1.0842: 1 pip = $10.00. 1 mini lot: $1.00 per pip.",
  },
  {
    icon: BarChart2,
    title: "Leverage & Margin",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    formula: "Required Margin = (Lot Size × Price) / Leverage",
    explanation:
      "Leverage lets you control large positions with a small deposit (margin). 100:1 leverage means $1,000 controls $100,000. While this amplifies gains, it equally amplifies losses. Margin call triggers when your equity falls below the required margin level.",
    example: "1 lot EUR/USD at 1.0842, 50x leverage: Margin = $100,000 / 50 = $2,000",
  },
  {
    icon: Globe,
    title: "Currency Correlations",
    color: "text-green-500",
    bg: "bg-green-500/10",
    formula: "Corr(A,B) = Cov(A,B) / (σA × σB)",
    explanation:
      "Currency pairs often move together or in opposition. EUR/USD and GBP/USD have a strong positive correlation (~0.87) because both are vs. USD. USD/JPY has negative correlation with EUR/USD. Understanding correlations prevents accidentally doubling exposure.",
    example: "Long EUR/USD + Long GBP/USD = ~doubled USD exposure due to 0.87 correlation.",
  },
  {
    icon: BookOpen,
    title: "Central Banks",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    formula: "Higher Rate → Currency Appreciation (capital inflow)",
    explanation:
      "Central banks set interest rates which are the primary long-term driver of FX. Fed (USD), ECB (EUR), BoE (GBP), BoJ (JPY), SNB (CHF), RBA (AUD), BoC (CAD), RBNZ (NZD). Rate hikes attract foreign capital → currency rises. Rate cuts → capital outflows → currency falls.",
    example: "USD at 5.25% vs JPY at 0.10% → 5.15% differential → strong USD/JPY carry trade.",
  },
];

function FxEducationTab() {
  return (
    <div className="flex flex-col gap-5">
      {/* Concept cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EDU_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Card className="border-border/50 h-full">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-md", card.bg)}>
                      <Icon className={cn("h-4 w-4", card.color)} />
                    </div>
                    <h3 className="font-semibold text-sm">{card.title}</h3>
                  </div>

                  {/* Formula */}
                  <div className="rounded bg-muted/50 px-3 py-2 font-mono text-xs text-primary">
                    {card.formula}
                  </div>

                  {/* Explanation */}
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.explanation}</p>

                  {/* Example */}
                  <div className="rounded border border-border/50 bg-muted/20 px-3 py-2">
                    <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> Example
                    </div>
                    <p className="text-xs text-foreground/80">{card.example}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Central bank rates table */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Current Central Bank Interest Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(CB_RATES).filter(([cur]) => ["USD","EUR","GBP","JPY","CHF","AUD","NZD","CAD"].includes(cur)).map(([currency, rate]) => {
              const isHigh = rate >= 4;
              const isLow = rate < 1;
              return (
                <div key={currency} className="rounded-lg border border-border/50 p-3 flex flex-col gap-1">
                  <div className="text-xs text-muted-foreground">{currency}</div>
                  <div className={cn("text-xl font-bold tabular-nums", isHigh ? "text-green-500" : isLow ? "text-red-500" : "text-amber-500")}>
                    {rate.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Correlation matrix */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" />
            Currency Pair Correlation Matrix (90-day)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 overflow-auto">
          <CorrelationHeatmap />
          <div className="flex items-center gap-6 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-green-600" /> Strong positive (0.7–1.0)</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-green-400" /> Moderate positive (0.3–0.7)</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-muted" /> Neutral (-0.3–0.3)</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-red-400" /> Moderate negative (-0.7–-0.3)</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-red-600" /> Strong negative (-1.0–-0.7)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ForexPage() {
  const seed = useMemo(() => dateSeed(), []);
  const pairs = useMemo(() => generatePairData(seed), [seed]);

  const [tab, setTab] = useState("pairs");

  // Stats for header chips
  const avgSpread = (pairs.reduce((s, p) => s + p.spreadPips, 0) / pairs.length).toFixed(1);
  const posCount = pairs.filter((p) => p.change1d >= 0).length;

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 min-h-0">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Forex Trading
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Foreign exchange simulator — major, minor &amp; exotic currency pairs
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            12 Pairs
          </Badge>
          <Badge variant="outline" className="text-xs">
            Avg spread {avgSpread} pips
          </Badge>
          <Badge
            variant="outline"
            className={cn("text-xs", posCount >= 6 ? "border-green-500/40 text-green-500" : "border-red-500/40 text-red-500")}
          >
            {posCount}/12 pairs up
          </Badge>
          <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/40">
            Simulated
          </Badge>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-4">
        <TabsList className="flex w-full overflow-x-auto h-auto flex-wrap gap-1 p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="pairs" className="flex items-center gap-1.5 text-xs">
            <Globe className="h-3.5 w-3.5" /> Currency Pairs
          </TabsTrigger>
          <TabsTrigger value="order" className="flex items-center gap-1.5 text-xs">
            <DollarSign className="h-3.5 w-3.5" /> FX Order Entry
          </TabsTrigger>
          <TabsTrigger value="carry" className="flex items-center gap-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5" /> Carry Trade
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5" /> Economic Calendar
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-1.5 text-xs">
            <BookOpen className="h-3.5 w-3.5" /> FX Education
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pairs" className="mt-0">
          <CurrencyPairsTab pairs={pairs} />
        </TabsContent>

        <TabsContent value="order" className="mt-0">
          <OrderEntryTab pairs={pairs} />
        </TabsContent>

        <TabsContent value="carry" className="mt-0">
          <CarryTradeTab pairs={pairs} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <EconomicCalendarTab />
        </TabsContent>

        <TabsContent value="education" className="mt-0">
          <FxEducationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
