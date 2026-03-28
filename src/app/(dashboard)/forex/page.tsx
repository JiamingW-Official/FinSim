"use client";

import { useState, useMemo } from "react";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Calculator,
  BarChart2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

interface FxPair {
  pair: string;
  base: string;
  quote: string;
  basePrice: number;
  isJpy: boolean;
  description: string;
}

interface FxRow extends FxPair {
  bid: number;
  ask: number;
  spread: number; // pips
  change1d: number; // pct
  change1w: number; // pct
  high52w: number;
  low52w: number;
  currentPrice: number;
  volatility: number; // annualised %
  carryRate: number; // net overnight rate %
}

interface FxCandle {
  o: number;
  h: number;
  l: number;
  c: number;
  t: number; // unix timestamp
}

interface FxPosition {
  id: string;
  pair: string;
  side: "buy" | "sell";
  lots: number;
  lotSize: number;
  openPrice: number;
  currentPrice: number;
  openTime: number;
}

type LotType = "micro" | "mini" | "standard";

// ── Static pair definitions ───────────────────────────────────────────────────

const PAIRS: FxPair[] = [
  { pair: "EUR/USD", base: "EUR", quote: "USD", basePrice: 1.0842, isJpy: false, description: "Euro / US Dollar — most traded pair globally" },
  { pair: "GBP/USD", base: "GBP", quote: "USD", basePrice: 1.2654, isJpy: false, description: "British Pound / US Dollar — 'Cable'" },
  { pair: "USD/JPY", base: "USD", quote: "JPY", basePrice: 151.42, isJpy: true,  description: "US Dollar / Japanese Yen" },
  { pair: "USD/CHF", base: "USD", quote: "CHF", basePrice: 0.8923, isJpy: false, description: "US Dollar / Swiss Franc — 'Swissie'" },
  { pair: "AUD/USD", base: "AUD", quote: "USD", basePrice: 0.6571, isJpy: false, description: "Australian Dollar / US Dollar — 'Aussie'" },
  { pair: "USD/CAD", base: "USD", quote: "CAD", basePrice: 1.3612, isJpy: false, description: "US Dollar / Canadian Dollar — 'Loonie'" },
  { pair: "NZD/USD", base: "NZD", quote: "USD", basePrice: 0.6082, isJpy: false, description: "New Zealand Dollar / US Dollar — 'Kiwi'" },
  { pair: "EUR/GBP", base: "EUR", quote: "GBP", basePrice: 0.8567, isJpy: false, description: "Euro / British Pound — cross pair" },
];

// Overnight / carry interest rates (annualised, net long position)
const CARRY_RATES: Record<string, { longRate: number; shortRate: number; netCarry: number }> = {
  "EUR/USD": { longRate: 4.00, shortRate: -5.25, netCarry: -1.25 },
  "GBP/USD": { longRate: 5.25, shortRate: -5.25, netCarry:  0.00 },
  "USD/JPY": { longRate: 5.25, shortRate:  0.10, netCarry:  5.15 },
  "USD/CHF": { longRate: 5.25, shortRate: -1.75, netCarry:  3.50 },
  "AUD/USD": { longRate: 4.35, shortRate: -5.25, netCarry: -0.90 },
  "USD/CAD": { longRate: 5.25, shortRate: -5.00, netCarry:  0.25 },
  "NZD/USD": { longRate: 5.50, shortRate: -5.25, netCarry:  0.25 },
  "EUR/GBP": { longRate: 4.00, shortRate: -5.25, netCarry: -1.25 },
};

// Central bank rates
const CB_RATES = [
  { bank: "Federal Reserve (Fed)",        currency: "USD", rate: 5.25,  trend: "hold",  nextMeeting: "May 2026" },
  { bank: "European Central Bank (ECB)",  currency: "EUR", rate: 4.00,  trend: "cut",   nextMeeting: "Apr 2026" },
  { bank: "Bank of England (BoE)",        currency: "GBP", rate: 5.25,  trend: "hold",  nextMeeting: "May 2026" },
  { bank: "Bank of Japan (BoJ)",          currency: "JPY", rate: 0.10,  trend: "hike",  nextMeeting: "Apr 2026" },
  { bank: "Swiss National Bank (SNB)",    currency: "CHF", rate: 1.75,  trend: "cut",   nextMeeting: "Jun 2026" },
  { bank: "Reserve Bank of Australia",    currency: "AUD", rate: 4.35,  trend: "hold",  nextMeeting: "May 2026" },
  { bank: "Bank of Canada (BoC)",         currency: "CAD", rate: 5.00,  trend: "cut",   nextMeeting: "Apr 2026" },
  { bank: "Reserve Bank of NZ (RBNZ)",    currency: "NZD", rate: 5.50,  trend: "cut",   nextMeeting: "May 2026" },
];

// Currency correlations (approx, 90-day rolling)
const CORRELATIONS: string[][] = [
  ["",         "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD"],
  ["EUR/USD",  "1.00",    "0.87",    "-0.74",   "-0.89",    "0.82",    "-0.68"],
  ["GBP/USD",  "0.87",    "1.00",    "-0.61",   "-0.78",    "0.76",    "-0.58"],
  ["USD/JPY",  "-0.74",   "-0.61",   "1.00",     "0.71",   "-0.55",    "0.62"],
  ["USD/CHF",  "-0.89",   "-0.78",   "0.71",    "1.00",    "-0.77",    "0.61"],
  ["AUD/USD",  "0.82",    "0.76",    "-0.55",   "-0.77",    "1.00",    "-0.49"],
  ["USD/CAD",  "-0.68",   "-0.58",   "0.62",    "0.61",    "-0.49",    "1.00"],
];

// ── Data generators ───────────────────────────────────────────────────────────

function generateFxRows(seed: number): FxRow[] {
  return PAIRS.map((p) => {
    const rng = mulberry32(hashStr(p.pair) ^ seed);
    const change1d = (rng() - 0.5) * 1.2; // ±0.6%
    const change1w = (rng() - 0.5) * 3.0; // ±1.5%
    const priceMult = 1 + change1d / 100;
    const current = p.basePrice * priceMult;
    const pipSize = p.isJpy ? 0.01 : 0.0001;
    const spreadPips = p.isJpy ? (1 + rng() * 1.5) : (0.5 + rng() * 1.5);
    const halfSpread = spreadPips * pipSize / 2;
    const vol = 6 + rng() * 12; // 6–18% annualised
    return {
      ...p,
      bid:          current - halfSpread,
      ask:          current + halfSpread,
      spread:       Math.round(spreadPips * 10) / 10,
      change1d,
      change1w,
      high52w:      current * (1 + (0.04 + rng() * 0.06)),
      low52w:       current * (1 - (0.04 + rng() * 0.06)),
      currentPrice: current,
      volatility:   vol,
      carryRate:    CARRY_RATES[p.pair]?.netCarry ?? 0,
    };
  });
}

function generateCandles(pair: string, seed: number, bars = 30): FxCandle[] {
  const pairDef = PAIRS.find((p) => p.pair === pair);
  if (!pairDef) return [];
  const rng = mulberry32(hashStr(pair) ^ seed);
  const pipSize = pairDef.isJpy ? 0.01 : 0.0001;
  let price = pairDef.basePrice;
  const now = Math.floor(Date.now() / 1000);
  const barSec = 24 * 3600; // daily bars

  return Array.from({ length: bars }, (_, i) => {
    const open = price;
    const move = (rng() - 0.5) * pipSize * 80;
    const close = open + move;
    const highExtra = rng() * pipSize * 40;
    const lowExtra  = rng() * pipSize * 40;
    const high = Math.max(open, close) + highExtra;
    const low  = Math.min(open, close) - lowExtra;
    price = close;
    return { o: open, h: high, l: low, c: close, t: now - (bars - 1 - i) * barSec };
  });
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtFx(price: number, isJpy: boolean): string {
  return isJpy ? price.toFixed(2) : price.toFixed(4);
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtLotSize(lot: LotType): number {
  return lot === "micro" ? 1000 : lot === "mini" ? 10000 : 100000;
}

function calcPipValue(pair: FxPair, lotSize: number, currentPrice: number): number {
  // For USD quote pairs (EUR/USD, GBP/USD, AUD/USD, NZD/USD): pip value = 0.0001 * lotSize in USD
  // For USD/XXX pairs: pip value = 0.0001 * lotSize / currentPrice in USD (approx)
  // For JPY pairs: pip = 0.01
  if (pair.isJpy) {
    if (pair.base === "USD") return (0.01 * lotSize) / currentPrice;
    return 0.01 * lotSize / currentPrice;
  }
  if (pair.quote === "USD") return 0.0001 * lotSize;
  if (pair.base === "USD") return (0.0001 * lotSize) / currentPrice;
  return 0.0001 * lotSize; // approximation
}

function calcMargin(lotSize: number, currentPrice: number, leverage = 30): number {
  const notional = pair_isUsdQuote_guard(lotSize, currentPrice);
  return notional / leverage;
}

function pair_isUsdQuote_guard(lotSize: number, price: number): number {
  // Notional in USD (approximation — works for most majors)
  return lotSize * price;
}

// ── SVG candlestick chart ─────────────────────────────────────────────────────

function FxCandleChart({
  candles,
  pair,
  isJpy,
}: {
  candles: FxCandle[];
  pair: string;
  isJpy: boolean;
}) {
  const W = 600, H = 260, PAD_L = 70, PAD_R = 12, PAD_T = 16, PAD_B = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const prices = candles.flatMap((c) => [c.h, c.l]);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const barW = chartW / candles.length;

  const toX = (i: number) => PAD_L + (i + 0.5) * barW;
  const toY = (p: number) => PAD_T + ((maxP - p) / range) * chartH;

  const pipSize = isJpy ? 0.01 : 0.0001;

  // Round-number S/R levels
  const roundStep = isJpy ? 0.5 : 0.005;
  const levels: number[] = [];
  let lv = Math.ceil(minP / roundStep) * roundStep;
  while (lv <= maxP) {
    levels.push(lv);
    lv = Math.round((lv + roundStep) * 100000) / 100000;
    if (levels.length > 12) break;
  }

  // Auto S/R from swing highs/lows (simplified)
  const swingHighs: number[] = [];
  const swingLows: number[] = [];
  for (let i = 2; i < candles.length - 2; i++) {
    const h = candles[i].h;
    const l = candles[i].l;
    if (h > candles[i-1].h && h > candles[i-2].h && h > candles[i+1].h && h > candles[i+2].h) {
      swingHighs.push(h);
    }
    if (l < candles[i-1].l && l < candles[i-2].l && l < candles[i+1].l && l < candles[i+2].l) {
      swingLows.push(l);
    }
  }

  // Y-axis price labels
  const priceLabels: number[] = [];
  const numLabels = 5;
  for (let i = 0; i <= numLabels; i++) {
    priceLabels.push(minP + (i / numLabels) * range);
  }

  // Date labels (every 5 bars)
  const dateLabels: { x: number; label: string }[] = [];
  candles.forEach((c, i) => {
    if (i % 5 === 0) {
      const d = new Date(c.t * 1000);
      dateLabels.push({ x: toX(i), label: `${d.getMonth() + 1}/${d.getDate()}` });
    }
  });

  void pipSize; // used by caller

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block" preserveAspectRatio="xMidYMid meet">
      {/* Background */}
      <rect x={PAD_L} y={PAD_T} width={chartW} height={chartH} fill="transparent" />

      {/* Grid lines */}
      {priceLabels.map((p, i) => (
        <line
          key={`grid-${i}`}
          x1={PAD_L} y1={toY(p)}
          x2={W - PAD_R} y2={toY(p)}
          stroke="currentColor" strokeOpacity={0.06} strokeWidth={1}
        />
      ))}

      {/* Round-number key levels */}
      {levels.map((lv) => (
        <g key={`lvl-${lv}`}>
          <line
            x1={PAD_L} y1={toY(lv)}
            x2={W - PAD_R} y2={toY(lv)}
            stroke="#6366f1" strokeOpacity={0.25} strokeWidth={1} strokeDasharray="4 3"
          />
          <text
            x={PAD_L - 3} y={toY(lv) + 4}
            fontSize={8} textAnchor="end"
            fill="#6366f1" fillOpacity={0.6}
            className="font-mono"
          >
            {fmtFx(lv, isJpy)}
          </text>
        </g>
      ))}

      {/* Swing highs/lows as S/R */}
      {swingHighs.slice(0, 3).map((h, i) => (
        <line
          key={`sh-${i}`}
          x1={PAD_L} y1={toY(h)}
          x2={W - PAD_R} y2={toY(h)}
          stroke="#ef4444" strokeOpacity={0.35} strokeWidth={1} strokeDasharray="3 4"
        />
      ))}
      {swingLows.slice(0, 3).map((l, i) => (
        <line
          key={`sl-${i}`}
          x1={PAD_L} y1={toY(l)}
          x2={W - PAD_R} y2={toY(l)}
          stroke="#22c55e" strokeOpacity={0.35} strokeWidth={1} strokeDasharray="3 4"
        />
      ))}

      {/* Candles */}
      {candles.map((c, i) => {
        const x = toX(i);
        const bw = Math.max(3, barW * 0.65);
        const isUp = c.c >= c.o;
        const color = isUp ? "#22c55e" : "#ef4444";
        const bodyTop = toY(Math.max(c.o, c.c));
        const bodyH = Math.max(1, Math.abs(toY(c.o) - toY(c.c)));
        return (
          <g key={i}>
            <line
              x1={x} y1={toY(c.h)}
              x2={x} y2={toY(c.l)}
              stroke={color} strokeWidth={1}
            />
            <rect
              x={x - bw / 2} y={bodyTop}
              width={bw} height={bodyH}
              fill={color}
            />
          </g>
        );
      })}

      {/* Y-axis price labels */}
      {priceLabels.map((p, i) => (
        <text
          key={`ylabel-${i}`}
          x={PAD_L - 5} y={toY(p) + 4}
          fontSize={9} textAnchor="end"
          fill="currentColor" fillOpacity={0.45}
          className="font-mono"
        >
          {fmtFx(p, isJpy)}
        </text>
      ))}

      {/* X-axis date labels */}
      {dateLabels.map(({ x, label }) => (
        <text
          key={`xlabel-${label}-${x}`}
          x={x} y={H - 4}
          fontSize={9} textAnchor="middle"
          fill="currentColor" fillOpacity={0.4}
        >
          {label}
        </text>
      ))}

      {/* Pair label */}
      <text x={PAD_L + 8} y={PAD_T + 14} fontSize={11} fontWeight="600" fill="currentColor" fillOpacity={0.7}>
        {pair}
      </text>

      {/* Legend */}
      <g transform={`translate(${W - 120}, ${PAD_T + 6})`}>
        <line x1={0} y1={4} x2={12} y2={4} stroke="#6366f1" strokeOpacity={0.5} strokeWidth={1} strokeDasharray="4 3" />
        <text x={16} y={7} fontSize={8} fill="currentColor" fillOpacity={0.5}>Round lvl</text>
        <line x1={0} y1={16} x2={12} y2={16} stroke="#ef4444" strokeOpacity={0.5} strokeWidth={1} strokeDasharray="3 4" />
        <text x={16} y={19} fontSize={8} fill="currentColor" fillOpacity={0.5}>Resistance</text>
        <line x1={0} y1={28} x2={12} y2={28} stroke="#22c55e" strokeOpacity={0.5} strokeWidth={1} strokeDasharray="3 4" />
        <text x={16} y={31} fontSize={8} fill="currentColor" fillOpacity={0.5}>Support</text>
      </g>
    </svg>
  );
}

// ── 52W range bar ─────────────────────────────────────────────────────────────

function RangeBar({ low, high, current, isJpy }: { low: number; high: number; current: number; isJpy: boolean }) {
  const pct = Math.min(1, Math.max(0, (current - low) / (high - low)));
  return (
    <div className="flex items-center gap-1.5 min-w-[120px]">
      <span className="text-[10px] text-muted-foreground tabular-nums">{fmtFx(low, isJpy)}</span>
      <div className="relative flex-1 h-1.5 rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/50"
          style={{ width: `${pct * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 w-0.5 rounded-full bg-primary"
          style={{ left: `${pct * 100}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums">{fmtFx(high, isJpy)}</span>
    </div>
  );
}

// ── Tab 1: Currency Pairs ─────────────────────────────────────────────────────

function CurrencyPairsTab({
  rows,
  onSelectPair,
}: {
  rows: FxRow[];
  onSelectPair: (pair: string) => void;
}) {
  const [selectedPair, setSelectedPair] = useState<string | null>(null);
  const selected = rows.find((r) => r.pair === selectedPair);

  function handleSelect(pair: string) {
    setSelectedPair(pair === selectedPair ? null : pair);
    onSelectPair(pair);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap">
        {["Majors", "8 pairs", "1:30 leverage", "From 0.5 pip spread"].map((t) => (
          <span key={t} className="inline-flex items-center rounded-full border border-border/50 bg-card px-2.5 py-0.5 text-[11px] text-muted-foreground">
            {t}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Pair</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Bid</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Ask</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Spread (pips)</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">1D</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">1W</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground">52W Range</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isActive = row.pair === selectedPair;
              return (
                <tr
                  key={row.pair}
                  onClick={() => handleSelect(row.pair)}
                  className={cn(
                    "border-b border-border/30 last:border-0 cursor-pointer transition-colors",
                    isActive ? "bg-primary/5" : "hover:bg-muted/20"
                  )}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                      <span className="font-semibold tabular-nums">{row.pair}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-sm font-mono">
                    {fmtFx(row.bid, row.isJpy)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-sm font-mono">
                    {fmtFx(row.ask, row.isJpy)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted/50">{row.spread}</span>
                  </td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums text-xs", row.change1d >= 0 ? "text-green-500" : "text-red-500")}>
                    {row.change1d >= 0 ? <TrendingUp className="inline h-3 w-3 mr-0.5" /> : <TrendingDown className="inline h-3 w-3 mr-0.5" />}
                    {fmtPct(row.change1d)}
                  </td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums text-xs", row.change1w >= 0 ? "text-green-500" : "text-red-500")}>
                    {fmtPct(row.change1w)}
                  </td>
                  <td className="px-3 py-2.5">
                    <RangeBar
                      low={row.low52w}
                      high={row.high52w}
                      current={row.currentPrice}
                      isJpy={row.isJpy}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected pair order entry panel */}
      {selected && (
        <div className="rounded-lg border border-primary/30 bg-card p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-base">{selected.pair}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{selected.description}</div>
            </div>
            <button
              onClick={() => setSelectedPair(null)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded bg-muted/30 px-2.5 py-2">
              <div className="text-[10px] text-muted-foreground">Bid</div>
              <div className="text-sm font-mono font-semibold text-red-500">{fmtFx(selected.bid, selected.isJpy)}</div>
            </div>
            <div className="rounded bg-muted/30 px-2.5 py-2">
              <div className="text-[10px] text-muted-foreground">Ask</div>
              <div className="text-sm font-mono font-semibold text-green-500">{fmtFx(selected.ask, selected.isJpy)}</div>
            </div>
            <div className="rounded bg-muted/30 px-2.5 py-2">
              <div className="text-[10px] text-muted-foreground">1D Change</div>
              <div className={cn("text-sm font-semibold", selected.change1d >= 0 ? "text-green-500" : "text-red-500")}>
                {fmtPct(selected.change1d)}
              </div>
            </div>
            <div className="rounded bg-muted/30 px-2.5 py-2">
              <div className="text-[10px] text-muted-foreground">Volatility</div>
              <div className="text-sm font-semibold">{selected.volatility.toFixed(1)}%</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Click <span className="text-primary font-medium">Trade FX</span> tab to open positions on this pair.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: FX Charts ──────────────────────────────────────────────────────────

function FxChartsTab({ rows, seed }: { rows: FxRow[]; seed: number }) {
  const [selectedPair, setSelectedPair] = useState("EUR/USD");
  const pairDef = PAIRS.find((p) => p.pair === selectedPair)!;
  const candles = useMemo(() => generateCandles(selectedPair, seed), [selectedPair, seed]);
  const currentRow = rows.find((r) => r.pair === selectedPair);

  return (
    <div className="flex flex-col gap-4">
      {/* Pair selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground">Pair:</label>
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="rounded border border-border/50 bg-card px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            {PAIRS.map((p) => (
              <option key={p.pair} value={p.pair}>{p.pair}</option>
            ))}
          </select>
        </div>
        {currentRow && (
          <div className="flex items-center gap-3">
            <span className="font-mono font-semibold text-base tabular-nums">
              {fmtFx(currentRow.currentPrice, pairDef.isJpy)}
            </span>
            <span className={cn("text-xs font-medium", currentRow.change1d >= 0 ? "text-green-500" : "text-red-500")}>
              {fmtPct(currentRow.change1d)}
            </span>
            <span className="text-xs text-muted-foreground">Spread: {currentRow.spread} pips</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border/50 bg-card p-2 overflow-hidden">
        <FxCandleChart candles={candles} pair={selectedPair} isJpy={pairDef.isJpy} />
      </div>

      {/* Key stats row */}
      {currentRow && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {[
            { label: "52W High", value: fmtFx(currentRow.high52w, pairDef.isJpy) },
            { label: "52W Low",  value: fmtFx(currentRow.low52w, pairDef.isJpy) },
            { label: "Bid",      value: fmtFx(currentRow.bid, pairDef.isJpy) },
            { label: "Ask",      value: fmtFx(currentRow.ask, pairDef.isJpy) },
            { label: "Spread",   value: `${currentRow.spread} pips` },
            { label: "HV Ann.",  value: `${currentRow.volatility.toFixed(1)}%` },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border/30 bg-card px-3 py-2">
              <div className="text-[10px] text-muted-foreground">{item.label}</div>
              <div className="text-sm font-mono font-semibold tabular-nums mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Chart shows 30 daily bars. Dashed purple = round-number key levels. Dashed red/green = swing resistance/support.
      </p>
    </div>
  );
}

// ── Tab 3: Trade FX ───────────────────────────────────────────────────────────

function TradeFxTab({ rows, seed }: { rows: FxRow[]; seed: number }) {
  const [selectedPair, setSelectedPair] = useState("EUR/USD");
  const [lotType, setLotType] = useState<LotType>("mini");
  const [positions, setPositions] = useState<FxPosition[]>([]);
  const LEVERAGE = 30;

  const pairDef = PAIRS.find((p) => p.pair === selectedPair)!;
  const row = rows.find((r) => r.pair === selectedPair)!;
  const lotSize = fmtLotSize(lotType);
  const pipValue = calcPipValue(pairDef, lotSize, row.currentPrice);
  const margin = (lotSize * row.currentPrice) / LEVERAGE;

  // Tick positions to current price
  const livePositions = positions.map((pos) => {
    const liveRow = rows.find((r) => r.pair === pos.pair);
    const current = liveRow?.currentPrice ?? pos.openPrice;
    return { ...pos, currentPrice: current };
  });

  function openPosition(side: "buy" | "sell") {
    const openPrice = side === "buy" ? row.ask : row.bid;
    setPositions((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        pair: selectedPair,
        side,
        lots: 1,
        lotSize,
        openPrice,
        currentPrice: openPrice,
        openTime: Date.now(),
      },
    ]);
  }

  function closePosition(id: string) {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  }

  function calcPnlPips(pos: FxPosition): number {
    const pairInfo = PAIRS.find((p) => p.pair === pos.pair);
    if (!pairInfo) return 0;
    const pipSz = pairInfo.isJpy ? 0.01 : 0.0001;
    const diff = pos.currentPrice - pos.openPrice;
    const pips = diff / pipSz;
    return pos.side === "buy" ? pips : -pips;
  }

  function calcPnlUsd(pos: FxPosition): number {
    const pairInfo = PAIRS.find((p) => p.pair === pos.pair);
    if (!pairInfo) return 0;
    const pv = calcPipValue(pairInfo, pos.lotSize, pos.currentPrice);
    return calcPnlPips(pos) * pv;
  }

  const LOT_OPTIONS: { label: string; value: LotType; desc: string }[] = [
    { label: "Micro", value: "micro", desc: "1,000 units" },
    { label: "Mini",  value: "mini",  desc: "10,000 units" },
    { label: "Standard", value: "standard", desc: "100,000 units" },
  ];

  void seed;

  return (
    <div className="flex flex-col gap-4">
      {/* Order entry card */}
      <div className="rounded-lg border border-border/50 bg-card p-4 flex flex-col gap-4">
        <div className="font-semibold text-sm">Open FX Position</div>

        {/* Pair + lot type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Currency Pair</label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-full rounded border border-border/50 bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              {PAIRS.map((p) => (
                <option key={p.pair} value={p.pair}>{p.pair}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Lot Size</label>
            <div className="flex gap-1">
              {LOT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLotType(opt.value)}
                  className={cn(
                    "flex-1 rounded border text-xs py-1.5 transition-colors",
                    lotType === opt.value
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border/50 text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {LOT_OPTIONS.find((o) => o.value === lotType)?.desc}
            </div>
          </div>
        </div>

        {/* Derived stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded bg-muted/30 px-3 py-2">
            <div className="text-[10px] text-muted-foreground">Required Margin</div>
            <div className="text-sm font-semibold tabular-nums">${margin.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            <div className="text-[10px] text-muted-foreground">1:{LEVERAGE} leverage</div>
          </div>
          <div className="rounded bg-muted/30 px-3 py-2">
            <div className="text-[10px] text-muted-foreground">Pip Value</div>
            <div className="text-sm font-semibold tabular-nums">${pipValue.toFixed(2)}</div>
            <div className="text-[10px] text-muted-foreground">per pip</div>
          </div>
          <div className="rounded bg-muted/30 px-3 py-2">
            <div className="text-[10px] text-muted-foreground">Current Price</div>
            <div className="text-sm font-mono font-semibold tabular-nums">{fmtFx(row.currentPrice, pairDef.isJpy)}</div>
            <div className={cn("text-[10px]", row.change1d >= 0 ? "text-green-500" : "text-red-500")}>
              {fmtPct(row.change1d)}
            </div>
          </div>
        </div>

        {/* Bid/Ask */}
        <div className="flex gap-3">
          <div className="flex-1 rounded bg-muted/20 px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Bid: </span>
            <span className="font-mono font-semibold text-red-500">{fmtFx(row.bid, pairDef.isJpy)}</span>
          </div>
          <div className="flex-1 rounded bg-muted/20 px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Ask: </span>
            <span className="font-mono font-semibold text-green-500">{fmtFx(row.ask, pairDef.isJpy)}</span>
          </div>
        </div>

        {/* Buy / Sell */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => openPosition("buy")}
            className="rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 text-sm transition-colors"
          >
            Buy {fmtFx(row.ask, pairDef.isJpy)}
          </button>
          <button
            onClick={() => openPosition("sell")}
            className="rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 text-sm transition-colors"
          >
            Sell {fmtFx(row.bid, pairDef.isJpy)}
          </button>
        </div>
      </div>

      {/* Open positions */}
      <div className="rounded-lg border border-border/50 bg-card">
        <div className="px-4 py-2.5 border-b border-border/30 flex items-center justify-between">
          <span className="text-sm font-semibold">Open FX Positions</span>
          <span className="text-xs text-muted-foreground">{livePositions.length} position{livePositions.length !== 1 ? "s" : ""}</span>
        </div>
        {livePositions.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No open positions. Use Buy/Sell above to open one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-muted/20">
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Pair</th>
                <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">Side</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Lots</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Open</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Current</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">P&L (pips)</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">P&L ($)</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {livePositions.map((pos) => {
                const pairInfo = PAIRS.find((p) => p.pair === pos.pair)!;
                const pnlPips = calcPnlPips(pos);
                const pnlUsd = calcPnlUsd(pos);
                return (
                  <tr key={pos.id} className="border-b border-border/20 last:border-0">
                    <td className="px-3 py-2 font-medium">{pos.pair}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded", pos.side === "buy" ? "bg-green-500/15 text-green-500" : "bg-red-500/15 text-red-500")}>
                        {pos.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-xs">{(pos.lotSize / 1000).toFixed(0)}K</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-xs">{fmtFx(pos.openPrice, pairInfo.isJpy)}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-xs">{fmtFx(pos.currentPrice, pairInfo.isJpy)}</td>
                    <td className={cn("px-3 py-2 text-right tabular-nums text-xs font-semibold", pnlPips >= 0 ? "text-green-500" : "text-red-500")}>
                      {pnlPips >= 0 ? "+" : ""}{pnlPips.toFixed(1)}
                    </td>
                    <td className={cn("px-3 py-2 text-right tabular-nums text-xs font-semibold", pnlUsd >= 0 ? "text-green-500" : "text-red-500")}>
                      {pnlUsd >= 0 ? "+" : ""}${Math.abs(pnlUsd).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => closePosition(pos.id)}
                        className="text-xs text-muted-foreground hover:text-red-500 transition-colors px-1.5 py-0.5 rounded hover:bg-red-500/10"
                      >
                        Close
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Tab 4: Carry Trade Calculator ─────────────────────────────────────────────

function CarryTradeTab({ rows }: { rows: FxRow[] }) {
  // Sort by net carry descending
  const sorted = [...rows].sort((a, b) => Math.abs(b.carryRate) - Math.abs(a.carryRate));
  const bestLong = [...rows].filter((r) => r.carryRate > 0).sort((a, b) => b.carryRate - a.carryRate);

  return (
    <div className="flex flex-col gap-4">
      {/* Best carry trades leaderboard */}
      <div className="rounded-lg border border-border/50 bg-card">
        <div className="px-4 py-2.5 border-b border-border/30">
          <div className="font-semibold text-sm">Best Carry Trades This Week</div>
          <div className="text-xs text-muted-foreground mt-0.5">Net annual carry if long the pair (before spread costs)</div>
        </div>
        <div className="flex flex-col divide-y divide-border/20">
          {bestLong.slice(0, 4).map((row, i) => {
            const carry = CARRY_RATES[row.pair];
            return (
              <div key={row.pair} className="flex items-center gap-3 px-4 py-3">
                <span className="text-lg font-bold text-muted-foreground/40 w-6 tabular-nums">{i + 1}</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{row.pair}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Long @ {carry.longRate.toFixed(2)}% / Short @ {Math.abs(carry.shortRate).toFixed(2)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("font-bold text-sm tabular-nums", row.carryRate >= 0 ? "text-green-500" : "text-red-500")}>
                    {row.carryRate >= 0 ? "+" : ""}{row.carryRate.toFixed(2)}% p.a.
                  </div>
                  <div className="text-[10px] text-muted-foreground">HV: {row.volatility.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full carry table */}
      <div className="rounded-lg border border-border/50 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Pair</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Long Rate</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Short Rate</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Net Carry</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">HV (ann.)</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Risk/Carry</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const carry = CARRY_RATES[row.pair];
              const riskRatio = Math.abs(row.volatility / (carry.netCarry || 0.01));
              return (
                <tr key={row.pair} className="border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-3 py-2.5 font-semibold">{row.pair}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-xs text-green-500">
                    +{carry.longRate.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-xs text-red-500">
                    {carry.shortRate.toFixed(2)}%
                  </td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums text-xs font-bold", carry.netCarry >= 0 ? "text-green-500" : "text-red-500")}>
                    {carry.netCarry >= 0 ? "+" : ""}{carry.netCarry.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-xs">{row.volatility.toFixed(1)}%</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-xs text-muted-foreground">
                    {riskRatio.toFixed(1)}x
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-600 dark:text-amber-400">
        <Info className="inline h-3.5 w-3.5 mr-1.5" />
        Carry trades earn positive roll by buying high-yield vs low-yield currencies. Risk: sudden currency reversals can wipe out months of carry income. Risk/Carry ratio = HV / Net Carry — lower is better.
      </div>
    </div>
  );
}

// ── Tab 5: FX Education ───────────────────────────────────────────────────────

function FxEducationTab() {
  const [expandedSection, setExpandedSection] = useState<string | null>("basics");

  const sections = [
    {
      id: "basics",
      title: "FX Basics — Pips, Lots & Leverage",
      icon: BookOpen,
      content: (
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Pip</strong> — The smallest price increment. For most pairs (EUR/USD, GBP/USD etc.) 1 pip = 0.0001. For JPY pairs 1 pip = 0.01.
          </p>
          <p>
            <strong className="text-foreground">Lot size</strong> — Standard contracts. 1 standard lot = 100,000 units. 1 mini = 10,000 units. 1 micro = 1,000 units.
          </p>
          <p>
            <strong className="text-foreground">Pip value</strong> — For EUR/USD with a mini lot (10,000): pip value = 0.0001 × 10,000 = $1 per pip.
          </p>
          <p>
            <strong className="text-foreground">Leverage</strong> — Retail FX brokers typically offer 1:30 (EU) or 1:50 (US). $1,000 margin can control $30,000 notional.
          </p>
          <p>
            <strong className="text-foreground">Spread</strong> — Difference between bid and ask in pips. EUR/USD often trades at 0.5–1.5 pip spread. This is the broker's commission.
          </p>
          <p>
            <strong className="text-foreground">Rollover/Swap</strong> — Holding a position overnight incurs a debit or credit based on interest rate differentials between the two currencies.
          </p>
        </div>
      ),
    },
    {
      id: "cbrates",
      title: "Central Bank Interest Rates",
      icon: BarChart2,
      content: (
        <div className="flex flex-col gap-2">
          <div className="rounded-lg border border-border/50 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Central Bank</th>
                  <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">Currency</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Rate</th>
                  <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">Bias</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Next Meeting</th>
                </tr>
              </thead>
              <tbody>
                {CB_RATES.map((cb) => (
                  <tr key={cb.currency} className="border-b border-border/20 last:border-0 hover:bg-muted/10">
                    <td className="px-3 py-2.5 text-sm">{cb.bank}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-muted/50">{cb.currency}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold tabular-nums">{cb.rate.toFixed(2)}%</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={cn("text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
                        cb.trend === "hike" ? "bg-green-500/15 text-green-600 dark:text-green-400" :
                        cb.trend === "cut"  ? "bg-red-500/15 text-red-600 dark:text-red-400" :
                        "bg-muted/50 text-muted-foreground"
                      )}>
                        {cb.trend}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">{cb.nextMeeting}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Higher interest rates generally strengthen a currency as global capital seeks higher yields. Rate decisions are the most market-moving FX events.
          </p>
        </div>
      ),
    },
    {
      id: "carry",
      title: "Carry Trade Mechanics",
      icon: TrendingUp,
      content: (
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            A carry trade borrows in a low-interest-rate currency and invests in a high-interest-rate currency. The classic example is short JPY (0.1%) / long USD (5.25%) — netting ~5.15% annual carry.
          </p>
          <p>
            <strong className="text-foreground">How it works:</strong> Each day you hold a USD/JPY long, your broker credits the interest differential to your account (divided by 360 or 365).
          </p>
          <p>
            <strong className="text-foreground">Risks:</strong> Carry trades are exposed to sharp reversals ("carry unwind"). When risk appetite collapses, traders rush to close carry positions simultaneously, causing rapid JPY strengthening.
          </p>
          <p>
            <strong className="text-foreground">The carry-to-risk ratio</strong> measures annual carry divided by annualised volatility. A ratio above 0.5 is considered attractive.
          </p>
          <div className="rounded bg-muted/30 p-3 text-xs font-mono">
            Daily carry = (Long rate − Short rate) / 360 × Notional
          </div>
        </div>
      ),
    },
    {
      id: "correlations",
      title: "Currency Correlations Matrix",
      icon: Calculator,
      content: (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">90-day rolling correlations between major pairs. Values near +1.0 move together; near -1.0 move oppositely.</p>
          <div className="rounded-lg border border-border/50 overflow-auto">
            <table className="text-[11px] w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  {CORRELATIONS[0].map((cell, i) => (
                    <th key={i} className={cn("px-2 py-2 font-medium text-muted-foreground", i === 0 ? "text-left" : "text-center")}>
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CORRELATIONS.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b border-border/20 last:border-0">
                    {row.map((cell, ci) => {
                      const val = parseFloat(cell);
                      const isNum = !isNaN(val);
                      const isSelf = isNum && val === 1.0;
                      const bg = isSelf
                        ? "bg-primary/10"
                        : isNum && val >= 0.7
                        ? "bg-green-500/10"
                        : isNum && val <= -0.7
                        ? "bg-red-500/10"
                        : "";
                      return (
                        <td key={ci} className={cn("px-2 py-2 tabular-nums", ci === 0 ? "font-semibold text-left" : "text-center", bg)}>
                          {isNum ? (
                            <span className={cn(
                              "font-mono",
                              val >= 0.7 && !isSelf ? "text-green-600 dark:text-green-400" :
                              val <= -0.7 ? "text-red-600 dark:text-red-400" :
                              ""
                            )}>
                              {cell}
                            </span>
                          ) : cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section) => {
        const isOpen = expandedSection === section.id;
        return (
          <div key={section.id} className="rounded-lg border border-border/50 bg-card overflow-hidden">
            <button
              onClick={() => setExpandedSection(isOpen ? null : section.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <section.icon className="h-4 w-4 text-primary/70 shrink-0" />
                <span className="font-semibold text-sm">{section.title}</span>
              </div>
              <span className="text-muted-foreground text-xs">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-border/30 pt-3">
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ForexPage() {
  const seed = useMemo(() => dateSeed(), []);
  const rows = useMemo(() => generateFxRows(seed), [seed]);
  const [chartPair, setChartPair] = useState("EUR/USD");

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Forex</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Trade major currency pairs with virtual capital. 1:30 leverage, tight spreads.
          </p>
        </div>
        {/* Live summary chips */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end">
          {rows.slice(0, 3).map((r) => (
            <div key={r.pair} className="rounded-lg border border-border/40 bg-card px-2.5 py-1.5 text-right">
              <div className="text-[10px] text-muted-foreground">{r.pair}</div>
              <div className="font-mono text-xs font-semibold tabular-nums">{fmtFx(r.currentPrice, r.isJpy)}</div>
              <div className={cn("text-[10px] font-medium", r.change1d >= 0 ? "text-green-500" : "text-red-500")}>
                {fmtPct(r.change1d)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pairs" className="w-full">
        <TabsList className="h-9 gap-1 flex-wrap">
          <TabsTrigger value="pairs"   className="text-xs h-7 px-3">Currency Pairs</TabsTrigger>
          <TabsTrigger value="charts"  className="text-xs h-7 px-3">FX Charts</TabsTrigger>
          <TabsTrigger value="trade"   className="text-xs h-7 px-3">Trade FX</TabsTrigger>
          <TabsTrigger value="carry"   className="text-xs h-7 px-3">Carry Trade</TabsTrigger>
          <TabsTrigger value="learn"   className="text-xs h-7 px-3">FX Education</TabsTrigger>
        </TabsList>

        <TabsContent value="pairs" className="mt-4 data-[state=inactive]:hidden">
          <CurrencyPairsTab rows={rows} onSelectPair={setChartPair} />
        </TabsContent>

        <TabsContent value="charts" className="mt-4 data-[state=inactive]:hidden">
          <FxChartsTab rows={rows} seed={seed} />
        </TabsContent>

        <TabsContent value="trade" className="mt-4 data-[state=inactive]:hidden">
          <TradeFxTab rows={rows} seed={seed} />
        </TabsContent>

        <TabsContent value="carry" className="mt-4 data-[state=inactive]:hidden">
          <CarryTradeTab rows={rows} />
        </TabsContent>

        <TabsContent value="learn" className="mt-4 data-[state=inactive]:hidden">
          <FxEducationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
