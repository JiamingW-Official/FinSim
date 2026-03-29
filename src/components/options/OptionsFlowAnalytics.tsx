"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function makeRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TICKERS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOG", "META", "JPM", "SPY", "QQQ"];

const BASE_PRICES: Record<string, number> = {
  AAPL: 182, MSFT: 415, NVDA: 875, TSLA: 245,
  AMZN: 196, GOOG: 172, META: 510, JPM: 210,
  SPY: 520,  QQQ: 445,
};

const SECTORS: Record<string, string> = {
  AAPL: "Tech", MSFT: "Tech", NVDA: "Semi", TSLA: "Auto",
  AMZN: "Retail", GOOG: "Tech", META: "Social", JPM: "Finance",
  SPY: "Index", QQQ: "Index",
};

const SECTOR_LIST = ["Tech", "Semi", "Finance", "Energy", "Healthcare", "Utilities",
  "Materials", "Industrials", "Consumer", "Auto", "Index"];

const EXPIRIES_WEEKLY = [
  "2026-04-04", "2026-04-11", "2026-04-18", "2026-04-25",
  "2026-05-16", "2026-06-20", "2026-09-18", "2026-12-18",
];

type Sentiment = "bullish" | "bearish" | "neutral";
type OrderType  = "sweep" | "block" | "split";
type SortKey    = "premium" | "ticker" | "expiry";
type ComboFilter = "all" | "sweeps" | "blocks" | "calls" | "puts" | "bullish" | "bearish";

// ── Flow Entry ────────────────────────────────────────────────────────────────

interface FlowEntry {
  id:        string;
  ticker:    string;
  expiry:    string;
  strike:    number;
  callPut:   "call" | "put";
  orderType: OrderType;
  size:      number;
  premium:   number;
  oiPct:     number;
  iv:        number;
  sentiment: Sentiment;
  timestamp: number;
}

function generateFlowEntries(seed: number, count = 25): FlowEntry[] {
  const rand = makeRng(seed);
  const now  = Date.now();
  const entries: FlowEntry[] = [];

  for (let i = 0; i < count; i++) {
    const ticker    = TICKERS[Math.floor(rand() * TICKERS.length)];
    const base      = BASE_PRICES[ticker] ?? 100;
    const price     = base * (0.97 + rand() * 0.06);
    const strikeOff = [-20, -15, -10, -5, 0, 5, 10, 15, 20][Math.floor(rand() * 9)];
    const strike    = Math.round((price + strikeOff) / 5) * 5;
    const callPut   = rand() < 0.55 ? "call" : "put";
    const expiryIdx = Math.floor(rand() * EXPIRIES_WEEKLY.length);
    const expiry    = EXPIRIES_WEEKLY[expiryIdx];
    const types: OrderType[] = ["sweep", "block", "split"];
    const orderType = types[Math.floor(rand() * types.length)];
    const size      = Math.floor(rand() * 2000 + 100) * (rand() < 0.15 ? 10 : 1);
    const optPrice  = +(0.5 + rand() * 15).toFixed(2);
    const premium   = Math.round(size * optPrice * 100);
    const oiPct     = +(rand() * 4).toFixed(2);
    const iv        = +(0.2 + rand() * 0.6).toFixed(3);
    let sentiment: Sentiment;
    if (callPut === "call" && rand() < 0.7) sentiment = "bullish";
    else if (callPut === "put" && rand() < 0.7) sentiment = "bearish";
    else sentiment = rand() < 0.5 ? "bullish" : rand() < 0.5 ? "bearish" : "neutral";

    entries.push({
      id: `fe-${seed}-${i}`,
      ticker, expiry, strike, callPut, orderType, size,
      premium, oiPct, iv, sentiment,
      timestamp: now - Math.floor(rand() * 3 * 60 * 60 * 1000),
    });
  }

  return entries.sort((a, b) => b.timestamp - a.timestamp);
}

// ── Dark Pool Prints ──────────────────────────────────────────────────────────

interface DarkPrint {
  id:          string;
  ticker:      string;
  size:        number;
  price:       number;
  side:        "above_ask" | "below_bid" | "mid";
  timestamp:   number;
  dollarValue: number;
}

function generateDarkPrints(seed: number): DarkPrint[] {
  const rand  = makeRng(seed + 777);
  const now   = Date.now();
  const TOP5  = ["AAPL", "MSFT", "NVDA", "TSLA", "SPY"];
  const items: DarkPrint[] = [];

  for (let i = 0; i < 40; i++) {
    const ticker = TOP5[Math.floor(rand() * TOP5.length)];
    const base   = BASE_PRICES[ticker] ?? 100;
    const price  = +(base * (0.98 + rand() * 0.04)).toFixed(2);
    const sides: DarkPrint["side"][] = ["above_ask", "below_bid", "mid"];
    const side   = sides[Math.floor(rand() * 3)];
    const sizeK  = [10, 25, 50, 100, 250, 500, 1000, 2000];
    const size   = sizeK[Math.floor(rand() * sizeK.length)] * 1000;

    items.push({
      id: `dp-${seed}-${i}`,
      ticker, size, price, side,
      dollarValue: size * price,
      timestamp:   now - Math.floor(rand() * 6 * 60 * 60 * 1000),
    });
  }
  return items.sort((a, b) => b.timestamp - a.timestamp);
}

// ── P/C Ratio data ────────────────────────────────────────────────────────────

interface PCPoint {
  day:    string;
  equity: number;
  index:  number;
}

function generatePCHistory(seed: number): PCPoint[] {
  const rand  = makeRng(seed + 333);
  const days  = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return days.map((day) => ({
    day,
    equity: +(0.6 + rand() * 0.7).toFixed(3),
    index:  +(0.8 + rand() * 0.8).toFixed(3),
  }));
}

function generateSectorPC(seed: number): { sector: string; pc: number }[] {
  const rand = makeRng(seed + 555);
  return SECTOR_LIST.map((sector) => ({
    sector,
    pc: +(0.5 + rand() * 1.0).toFixed(2),
  }));
}

// ── OI / Max-pain data ────────────────────────────────────────────────────────

interface StrikeOI {
  strike:    number;
  callOI:    number;
  putOI:     number;
  callDelta: number;
  putDelta:  number;
}

function generateStrikeOI(seed: number, spot: number): StrikeOI[] {
  const rand    = makeRng(seed + 999);
  const strikes = [];
  for (let d = -10; d <= 10; d += 1) {
    strikes.push(Math.round((spot + d * 5) / 5) * 5);
  }
  return strikes.map((strike) => {
    const callOI = Math.floor(500 + rand() * 8000);
    const putOI  = Math.floor(500 + rand() * 8000);
    const moneyness = (strike - spot) / spot;
    const callDelta  = Math.max(0, 0.5 - moneyness * 2);
    const putDelta   = Math.max(0, 0.5 + moneyness * 2);
    return { strike, callOI, putOI, callDelta, putDelta };
  });
}

// ── Gamma Exposure ────────────────────────────────────────────────────────────

function computeGEX(rows: StrikeOI[]): { strike: number; gex: number }[] {
  return rows.map(({ strike, callOI, putOI, callDelta, putDelta }) => ({
    strike,
    gex: callOI * callDelta * 100 - putOI * putDelta * 100,
  }));
}

function computeMaxPain(rows: StrikeOI[]): number {
  let minPain   = Infinity;
  let maxPainSt = rows[0]?.strike ?? 0;
  for (const { strike } of rows) {
    let pain = 0;
    for (const r of rows) {
      pain += r.callOI * Math.max(0, r.strike - strike) * 100;
      pain += r.putOI  * Math.max(0, strike - r.strike) * 100;
    }
    if (pain < minPain) { minPain = pain; maxPainSt = strike; }
  }
  return maxPainSt;
}

// ── Correlation data ──────────────────────────────────────────────────────────

interface CorrelationEntry {
  ticker:           string;
  dpBuySide:        number; // % above_ask
  optionsSentiment: number; // % bullish
  correlation:      number; // -1 to 1
  signalScore:      number; // 0-100
  followThrough:    number; // % historical accuracy
  dpPrecedesOpts:   boolean;
}

function generateCorrelations(seed: number): CorrelationEntry[] {
  const rand = makeRng(seed + 444);
  return ["AAPL", "MSFT", "NVDA", "TSLA", "SPY"].map((ticker) => ({
    ticker,
    dpBuySide:        +(40 + rand() * 40).toFixed(1),
    optionsSentiment: +(40 + rand() * 40).toFixed(1),
    correlation:      +(-0.3 + rand() * 1.4).toFixed(2),
    signalScore:      Math.floor(30 + rand() * 70),
    followThrough:    +(45 + rand() * 45).toFixed(1),
    dpPrecedesOpts:   rand() > 0.4,
  }));
}

// ── Format helpers ────────────────────────────────────────────────────────────

function fmtPrem(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtShares(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function relTime(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterChip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-xs font-medium transition-colors",
        active
          ? "border border-primary/30 bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-border/50 px-4 py-2">
      <span className="text-xs font-bold text-muted-foreground">
        {children}
      </span>
    </div>
  );
}

// ── Section 1: Unusual Activity Feed ─────────────────────────────────────────

function ActivityFeed({ entries }: { entries: FlowEntry[] }) {
  const [filter, setFilter]   = useState<ComboFilter>("all");
  const [sortBy, setSortBy]   = useState<SortKey>("premium");

  const filters: { v: ComboFilter; l: string }[] = [
    { v: "all", l: "All" }, { v: "sweeps", l: "Sweeps" }, { v: "blocks", l: "Blocks" },
    { v: "calls", l: "Calls" }, { v: "puts", l: "Puts" },
    { v: "bullish", l: "Bullish" }, { v: "bearish", l: "Bearish" },
  ];

  const filtered = entries
    .filter((e) => {
      if (filter === "sweeps")  return e.orderType === "sweep";
      if (filter === "blocks")  return e.orderType === "block";
      if (filter === "calls")   return e.callPut   === "call";
      if (filter === "puts")    return e.callPut   === "put";
      if (filter === "bullish") return e.sentiment === "bullish";
      if (filter === "bearish") return e.sentiment === "bearish";
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "premium") return b.premium - a.premium;
      if (sortBy === "ticker")  return a.ticker.localeCompare(b.ticker);
      if (sortBy === "expiry")  return a.expiry.localeCompare(b.expiry);
      return 0;
    });

  const totalBullish = entries.filter((e) => e.sentiment === "bullish").reduce((s, e) => s + e.premium, 0);
  const totalBearish = entries.filter((e) => e.sentiment === "bearish").reduce((s, e) => s + e.premium, 0);
  const totalFlow    = totalBullish + totalBearish;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary bar */}
      <div className="mx-4 mt-3 rounded-md border border-border/50 bg-card/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Daily Flow Summary</span>
          <span className="text-[11px] text-muted-foreground">{entries.length} alerts</span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full">
          <div
            className="bg-emerald-500/70 transition-all"
            style={{ width: totalFlow > 0 ? `${(totalBullish / totalFlow * 100).toFixed(1)}%` : "50%" }}
          />
          <div
            className="bg-red-500/70 transition-all"
            style={{ width: totalFlow > 0 ? `${(totalBearish / totalFlow * 100).toFixed(1)}%` : "50%" }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px]">
          <span className="text-emerald-400">
            Bullish {totalFlow > 0 ? (totalBullish / totalFlow * 100).toFixed(0) : 50}% · {fmtPrem(totalBullish)}
          </span>
          <span className="text-red-400">
            Bearish {totalFlow > 0 ? (totalBearish / totalFlow * 100).toFixed(0) : 50}% · {fmtPrem(totalBearish)}
          </span>
        </div>
      </div>

      {/* Filter + sort bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/50 px-4 pb-2">
        <div className="flex items-center gap-0.5 rounded-md border border-border/50 bg-card p-0.5">
          {filters.map(({ v, l }) => (
            <FilterChip key={v} active={filter === v} onClick={() => setFilter(v)}>{l}</FilterChip>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
          Sort:
          {(["premium", "ticker", "expiry"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortBy(k)}
              className={cn(
                "rounded px-1.5 py-0.5 capitalize transition-colors",
                sortBy === k ? "text-primary" : "hover:text-foreground",
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border/50">
              {["Time","Ticker","Exp","Strike","C/P","Type","Size","Premium","OI%","IV","Sentiment"].map((h, i) => (
                <th key={`h-${i}`} className="px-3 py-2 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filtered.map((e) => {
                const isWhale    = e.premium >= 500_000;
                const isBullish  = e.sentiment === "bullish";
                const isBearish  = e.sentiment === "bearish";
                return (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-border/50 transition-colors hover:bg-muted/50"
                  >
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {relTime(e.timestamp)}
                    </td>
                    <td className="px-3 py-2 font-medium">{e.ticker}</td>
                    <td className="px-3 py-2 font-mono tabular-nums text-muted-foreground">{e.expiry.slice(5)}</td>
                    <td className="px-3 py-2 font-mono tabular-nums">${e.strike}</td>
                    <td className="px-3 py-2 font-mono tabular-nums">
                      <span className={e.callPut === "call" ? "text-emerald-500" : "text-red-500"}>
                        {e.callPut === "call" ? "C" : "P"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn(
                        "rounded px-1 py-0.5 text-[11px] font-medium",
                        e.orderType === "sweep"
                          ? "bg-orange-500/15 text-orange-400"
                          : e.orderType === "block"
                          ? "bg-orange-500/15 text-orange-500"
                          : "bg-muted text-muted-foreground",
                      )}>
                        {e.orderType.toUpperCase()}
                      </span>
                    </td>
                    <td className={cn(
                      "px-3 py-2 text-right font-mono tabular-nums font-medium",
                      isBullish ? "text-emerald-500" : isBearish ? "text-red-500" : "",
                    )}>
                      {e.size.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums font-medium text-orange-400 whitespace-nowrap">
                      {isWhale && (
                        <span className="mr-1 rounded bg-amber-500/20 px-1 py-0.5 text-[11px] font-medium text-amber-400">
                          WHALE
                        </span>
                      )}
                      {fmtPrem(e.premium)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">{e.oiPct.toFixed(1)}x</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">{(e.iv * 100).toFixed(0)}%</td>
                    <td className="px-3 py-2">
                      {isBullish ? (
                        <span className="text-emerald-500"><span className="mr-0.5 text-[11px]">●</span>Bullish</span>
                      ) : isBearish ? (
                        <span className="text-red-500"><span className="mr-0.5 text-[11px]">●</span>Bearish</span>
                      ) : (
                        <span className="text-muted-foreground"><span className="mr-0.5 text-[11px]">●</span>Neutral</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Section 2: Flow Heatmap ───────────────────────────────────────────────────

function FlowHeatmapSection({ entries }: { entries: FlowEntry[] }) {
  const uid = useId();
  const [selectedCell, setSelectedCell] = useState<{
    ticker: string; expiry: string; callFlow: number; putFlow: number;
    net: number; totalVol: number;
  } | null>(null);

  const expiries = Array.from(new Set(entries.map((e) => e.expiry))).sort().slice(0, 8);

  type Cell = { callFlow: number; putFlow: number; net: number; totalVol: number };
  const grid: Record<string, Record<string, Cell>> = {};
  for (const t of TICKERS) {
    grid[t] = {};
    for (const ex of expiries) grid[t][ex] = { callFlow: 0, putFlow: 0, net: 0, totalVol: 0 };
  }
  for (const e of entries) {
    const cell = grid[e.ticker]?.[e.expiry];
    if (!cell) continue;
    if (e.callPut === "call") cell.callFlow += e.premium;
    else cell.putFlow += e.premium;
    cell.totalVol += e.size;
  }
  let maxAbs = 1;
  for (const t of TICKERS) {
    for (const ex of expiries) {
      const c = grid[t][ex];
      c.net = c.callFlow - c.putFlow;
      const a = Math.abs(c.net);
      if (a > maxAbs) maxAbs = a;
    }
  }

  function flowColor(net: number): string {
    const ratio = Math.min(1, Math.abs(net) / maxAbs);
    if (net > 0) return `rgba(52,211,153,${(0.15 + ratio * 0.7).toFixed(2)})`;
    if (net < 0) return `rgba(251,113,133,${(0.15 + ratio * 0.7).toFixed(2)})`;
    return "rgba(100,100,100,0.1)";
  }

  // Sector flow aggregation
  const sectorFlow: Record<string, number> = {};
  for (const t of TICKERS) {
    const sec = SECTORS[t] ?? "Other";
    if (!sectorFlow[sec]) sectorFlow[sec] = 0;
    for (const ex of expiries) sectorFlow[sec] += grid[t][ex].net;
  }

  const totalBull = entries.filter((e) => e.sentiment === "bullish").reduce((s, e) => s + e.premium, 0);
  const totalBear = entries.filter((e) => e.sentiment === "bearish").reduce((s, e) => s + e.premium, 0);
  const totalAll  = totalBull + totalBear || 1;

  const COL_W = 68, ROW_H = 26, ML = 52, MT = 24, MB = 10;
  const svgW = ML + expiries.length * COL_W + 4;
  const svgH = MT + TICKERS.length * ROW_H + MB;

  // Top sector by abs net flow
  const topSector = Object.entries(sectorFlow).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-md border border-border/50 bg-card/40 p-2">
          <div className="mb-1 text-[11px] text-muted-foreground">Today&apos;s Flow</div>
          <div className="flex h-2 overflow-hidden rounded-full">
            <div className="bg-emerald-500/60" style={{ width: `${(totalBull / totalAll * 100).toFixed(0)}%` }} />
            <div className="bg-red-500/60"     style={{ width: `${(totalBear / totalAll * 100).toFixed(0)}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[11px]">
            <span className="text-emerald-400">Bull {fmtPrem(totalBull)}</span>
            <span className="text-red-400">Bear {fmtPrem(totalBear)}</span>
          </div>
        </div>
        {topSector && (
          <div className="rounded-md border border-border/50 bg-card/40 p-2 text-center">
            <div className="text-[11px] text-muted-foreground">Most Active Sector</div>
            <div className={cn(
              "mt-0.5 text-[11px] font-semibold",
              topSector[1] > 0 ? "text-emerald-400" : "text-red-400",
            )}>
              {topSector[0]}
            </div>
            <div className="text-[11px] text-muted-foreground">{fmtPrem(Math.abs(topSector[1]))}</div>
          </div>
        )}
      </div>

      {/* Heatmap SVG */}
      <div className="overflow-x-auto">
        <svg
          width="100%"
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="overflow-visible"
          onMouseLeave={() => setSelectedCell(null)}
        >
          <defs>
            <linearGradient id={`${uid}-lg`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%"   stopColor="rgba(251,113,133,0.8)" />
              <stop offset="50%"  stopColor="rgba(100,100,100,0.15)" />
              <stop offset="100%" stopColor="rgba(52,211,153,0.8)" />
            </linearGradient>
          </defs>

          {expiries.map((ex, ci) => (
            <text key={`ex-${ci}`} x={ML + ci * COL_W + COL_W / 2} y={MT - 6}
              textAnchor="middle" fontSize={8} className="fill-muted-foreground">
              {ex.slice(5)}
            </text>
          ))}

          {TICKERS.map((ticker, ri) => {
            const y = MT + ri * ROW_H;
            return (
              <g key={ticker}>
                <text x={ML - 4} y={y + ROW_H / 2 + 4} textAnchor="end" fontSize={8} className="fill-muted-foreground">
                  {ticker}
                </text>
                {expiries.map((ex, ci) => {
                  const cell  = grid[ticker][ex];
                  const cx    = ML + ci * COL_W + 2;
                  const cy    = y + 2;
                  const cw    = COL_W - 4;
                  const ch    = ROW_H - 4;
                  const isSelected =
                    selectedCell?.ticker === ticker && selectedCell?.expiry === ex;

                  return (
                    <g
                      key={`${ticker}-${ex}`}
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedCell(
                          isSelected ? null : { ticker, expiry: ex, ...cell },
                        )
                      }
                    >
                      <rect x={cx} y={cy} width={cw} height={ch} rx={3}
                        fill={flowColor(cell.net)}
                        stroke={isSelected ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.05)"}
                        strokeWidth={isSelected ? 1 : 0.5}
                      />
                      {(cell.totalVol > 0) && (
                        <text x={cx + cw / 2} y={cy + ch / 2 + 3}
                          textAnchor="middle" fontSize={7}
                          className={cell.net > 0 ? "fill-emerald-300" : cell.net < 0 ? "fill-red-300" : "fill-muted-foreground"}
                          fontWeight={500}>
                          {fmtPrem(Math.abs(cell.net)).replace("$", "")}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Legend */}
          <rect x={ML} y={svgH - MB + 2} width={120} height={6} rx={2} fill={`url(#${uid}-lg)`} />
          <text x={ML}       y={svgH} fontSize={7} className="fill-muted-foreground">Puts</text>
          <text x={ML + 60}  y={svgH} textAnchor="middle" fontSize={7} className="fill-muted-foreground">Neutral</text>
          <text x={ML + 120} y={svgH} textAnchor="end"   fontSize={7} className="fill-muted-foreground">Calls</text>
        </svg>
      </div>

      {/* Selected cell breakdown */}
      <AnimatePresence>
        {selectedCell && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-md border border-primary/30 bg-primary/5 p-3"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[11px] font-semibold">{selectedCell.ticker}</span>
              <span className="text-xs text-muted-foreground">{selectedCell.expiry}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Call Flow</div>
                <div className="font-medium text-emerald-400">{fmtPrem(selectedCell.callFlow)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Put Flow</div>
                <div className="font-medium text-red-400">{fmtPrem(selectedCell.putFlow)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Net</div>
                <div className={cn("font-medium", selectedCell.net > 0 ? "text-emerald-400" : "text-red-400")}>
                  {fmtPrem(selectedCell.net)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Vol</div>
                <div>{selectedCell.totalVol.toLocaleString()} contracts</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Section 3: Put/Call Ratio ─────────────────────────────────────────────────

function PCRatioDashboard({ seed }: { seed: number }) {
  const uid      = useId();
  const history  = generatePCHistory(seed);
  const sectorPC = generateSectorPC(seed);

  // 5-day line chart
  const W = 320, H = 80, PAD = { t: 10, r: 12, b: 24, l: 36 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const allVals = history.flatMap((d) => [d.equity, d.index]);
  const minV    = Math.min(...allVals) - 0.05;
  const maxV    = Math.max(...allVals) + 0.05;
  const yScale  = (v: number) => chartH - ((v - minV) / (maxV - minV)) * chartH;
  const xScale  = (i: number) => (i / (history.length - 1)) * chartW;

  function polyline(data: number[]): string {
    return data.map((v, i) => `${PAD.l + xScale(i)},${PAD.t + yScale(v)}`).join(" ");
  }

  const yLines = [0.7, 0.9, 1.1];

  // Bar chart for sector P/C
  const sorted   = [...sectorPC].sort((a, b) => a.pc - b.pc);
  const BAR_H    = 14;
  const BAR_W    = 200;
  const BAR_PAD  = 4;
  const barSvgH  = sorted.length * (BAR_H + BAR_PAD) + 10;
  const pcMin    = 0.4;
  const pcMax    = 1.8;

  // Historical extremes (contrarian)
  const extremes = [
    { date: "2025-08-05", pc: 1.42, signal: "Peak Fear", contrarian: "bullish" as Sentiment },
    { date: "2025-11-21", pc: 0.61, signal: "Peak Greed", contrarian: "bearish" as Sentiment },
    { date: "2026-01-15", pc: 1.38, signal: "Selloff Fear", contrarian: "bullish" as Sentiment },
    { date: "2026-03-02", pc: 0.64, signal: "Complacency", contrarian: "bearish" as Sentiment },
  ];

  // Current summary stats
  const latestEquity = history[history.length - 1].equity;
  const latestIndex  = history[history.length - 1].index;

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      {/* Equity vs Index P/C gauge row */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Equity P/C", value: latestEquity, desc: "Retail sentiment" },
          { label: "Index P/C",  value: latestIndex,  desc: "Institutional hedge" },
        ].map(({ label, value, desc }) => {
          const color =
            value < 0.7  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
            : value > 1.2 ? "text-red-400 border-red-500/30 bg-red-500/10"
            : "text-amber-400 border-amber-500/30 bg-amber-500/10";
          const signal =
            value < 0.7  ? "Bullish Extreme"
            : value > 1.2 ? "Bearish Extreme"
            : "Neutral";
          return (
            <div key={label} className={cn("rounded-md border p-3", color)}>
              <div className="text-[11px] text-muted-foreground">{label}</div>
              <div className="text-[22px] font-bold tabular-nums">{value.toFixed(2)}</div>
              <div className="text-[11px] font-medium">{signal}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{desc}</div>
            </div>
          );
        })}
      </div>

      {/* 5-day chart */}
      <div className="rounded-md border border-border/50 bg-card/40 p-3">
        <div className="mb-2 text-xs font-semibold">5-Day P/C Ratio</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="overflow-visible">
          <defs>
            <linearGradient id={`${uid}-eq`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(52,211,153,0.3)" />
              <stop offset="100%" stopColor="rgba(52,211,153,0)" />
            </linearGradient>
            <linearGradient id={`${uid}-idx`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(139,92,246,0.3)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0)" />
            </linearGradient>
          </defs>

          {/* Y-axis reference lines */}
          {yLines.map((v) => {
            const yPos = PAD.t + yScale(v);
            if (yPos < PAD.t || yPos > PAD.t + chartH) return null;
            return (
              <g key={`yl-${v}`}>
                <line x1={PAD.l} x2={W - PAD.r} y1={yPos} y2={yPos}
                  stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="3 3" />
                <text x={PAD.l - 3} y={yPos + 3} textAnchor="end" fontSize={7}
                  className="fill-muted-foreground">{v.toFixed(1)}</text>
              </g>
            );
          })}

          {/* Zone fills */}
          <rect x={PAD.l} y={PAD.t} width={chartW}
            height={Math.max(0, PAD.t + yScale(0.7) - PAD.t)}
            fill="rgba(52,211,153,0.06)" />
          <rect x={PAD.l} y={PAD.t + yScale(1.2)} width={chartW}
            height={Math.max(0, chartH - yScale(1.2))}
            fill="rgba(251,113,133,0.06)" />

          {/* Equity line */}
          <polyline
            points={polyline(history.map((d) => d.equity))}
            fill="none" stroke="rgba(52,211,153,0.8)" strokeWidth={1.5} />

          {/* Index line */}
          <polyline
            points={polyline(history.map((d) => d.index))}
            fill="none" stroke="rgba(139,92,246,0.8)" strokeWidth={1.5} strokeDasharray="4 2" />

          {/* X labels */}
          {history.map((d, i) => (
            <text key={`xl-${i}`} x={PAD.l + xScale(i)} y={H - 6}
              textAnchor="middle" fontSize={7} className="fill-muted-foreground">
              {d.day}
            </text>
          ))}

          {/* Dots */}
          {history.map((d, i) => (
            <g key={`dots-${i}`}>
              <circle cx={PAD.l + xScale(i)} cy={PAD.t + yScale(d.equity)} r={2.5}
                fill="rgba(52,211,153,0.9)" />
              <circle cx={PAD.l + xScale(i)} cy={PAD.t + yScale(d.index)} r={2.5}
                fill="rgba(139,92,246,0.9)" />
            </g>
          ))}
        </svg>
        <div className="mt-1 flex gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 rounded bg-emerald-400" />
            Equity
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 rounded bg-orange-400" style={{ borderTop: "1px dashed" }} />
            Index
          </span>
          <span className="ml-auto text-muted-foreground">0.7 = bullish · 1.2 = bearish</span>
        </div>
      </div>

      {/* Sector P/C bar chart */}
      <div className="rounded-md border border-border/50 bg-card/40 p-3">
        <div className="mb-2 text-xs font-semibold">P/C Ratio by Sector</div>
        <svg viewBox={`0 0 260 ${barSvgH}`} width="100%">
          {sorted.map(({ sector, pc }, i) => {
            const barLen = Math.max(4, ((pc - pcMin) / (pcMax - pcMin)) * BAR_W);
            const y = i * (BAR_H + BAR_PAD) + 4;
            const color = pc < 0.75 ? "rgba(52,211,153,0.7)" : pc > 1.15 ? "rgba(251,113,133,0.7)" : "rgba(250,189,0,0.6)";
            return (
              <g key={sector}>
                <text x={55} y={y + BAR_H - 3} textAnchor="end" fontSize={8} className="fill-muted-foreground">
                  {sector}
                </text>
                <rect x={58} y={y} width={barLen} height={BAR_H} rx={2} fill={color} />
                <text x={58 + barLen + 3} y={y + BAR_H - 3} fontSize={8}
                  className={cn(
                    "font-medium",
                    pc < 0.75 ? "fill-emerald-400" : pc > 1.15 ? "fill-red-400" : "fill-amber-400",
                  )}>
                  {pc.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Historical P/C extremes */}
      <div className="rounded-md border border-border/50 bg-card/40 p-3">
        <div className="mb-2 text-xs font-semibold">Historical Extremes (Contrarian Signals)</div>
        <div className="space-y-1.5">
          {extremes.map((ex) => (
            <div key={ex.date} className="flex items-center gap-2 text-xs">
              <span className="w-20 shrink-0 text-muted-foreground">{ex.date.slice(5)}</span>
              <span className={cn(
                "font-mono font-semibold tabular-nums",
                ex.pc > 1.2 ? "text-red-400" : "text-emerald-400",
              )}>{ex.pc.toFixed(2)}</span>
              <span className="flex-1 text-muted-foreground">{ex.signal}</span>
              <span className={cn(
                "rounded px-1 py-0.5 text-[11px] font-semibold",
                ex.contrarian === "bullish"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-red-500/15 text-red-400",
              )}>
                {ex.contrarian === "bullish" ? "Buy Signal" : "Sell Signal"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section 4: Open Interest Analysis ────────────────────────────────────────

function OIAnalysis({ seed }: { seed: number }) {
  const [selectedExpiry, setSelectedExpiry] = useState(0);
  const uid        = useId();
  const SPOT       = 182; // AAPL as example
  const expIndex   = selectedExpiry;
  const expLabel   = EXPIRIES_WEEKLY[expIndex] ?? EXPIRIES_WEEKLY[0];
  const strikeData = generateStrikeOI(seed + expIndex, SPOT);
  const gexData    = computeGEX(strikeData);
  const maxPain    = computeMaxPain(strikeData);

  // Call wall = strike with highest call OI
  const callWall = strikeData.reduce((best, r) => r.callOI > best.callOI ? r : best, strikeData[0]);
  const putWall  = strikeData.reduce((best, r) => r.putOI > best.putOI ? r : best, strikeData[0]);

  const maxOI   = Math.max(...strikeData.flatMap((r) => [r.callOI, r.putOI]));
  const maxGex  = Math.max(...gexData.map((g) => Math.abs(g.gex)));

  // OI chart
  const W   = 320, H = 120;
  const ML  = 36, MR = 12, MT = 10, MB = 22;
  const cW  = W - ML - MR;
  const cH  = H - MT - MB;
  const n   = strikeData.length;
  const bW  = Math.floor(cW / n / 2) - 1;

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      {/* Expiry selector */}
      <div className="flex flex-wrap gap-1">
        {EXPIRIES_WEEKLY.slice(0, 4).map((ex, i) => (
          <button
            key={ex}
            onClick={() => setSelectedExpiry(i)}
            className={cn(
              "rounded px-2 py-1 text-[11px] font-medium transition-colors",
              selectedExpiry === i
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {ex.slice(5)}
          </button>
        ))}
      </div>

      {/* Max Pain + Walls summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-border/50 bg-card/40 p-2 text-center">
          <div className="text-[11px] text-muted-foreground">Max Pain</div>
          <div className="text-[14px] font-bold tabular-nums">${maxPain}</div>
          <div className="text-[11px] text-muted-foreground">Options expire worthless</div>
        </div>
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2 text-center">
          <div className="text-[11px] text-muted-foreground">Call Wall</div>
          <div className="text-[14px] font-bold tabular-nums text-emerald-400">${callWall?.strike ?? 0}</div>
          <div className="text-[11px] text-muted-foreground">{fmtShares(callWall?.callOI ?? 0)} OI</div>
        </div>
        <div className="rounded-md border border-red-500/20 bg-red-500/5 p-2 text-center">
          <div className="text-[11px] text-muted-foreground">Put Wall</div>
          <div className="text-[14px] font-bold tabular-nums text-red-400">${putWall?.strike ?? 0}</div>
          <div className="text-[11px] text-muted-foreground">{fmtShares(putWall?.putOI ?? 0)} OI</div>
        </div>
      </div>

      {/* OI by Strike chart */}
      <div className="rounded-md border border-border/50 bg-card/40 p-3">
        <div className="mb-2 text-xs font-semibold">OI by Strike — {expLabel.slice(5)}</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="overflow-visible">
          {/* Y-axis */}
          {[0, 0.5, 1].map((frac) => {
            const y = MT + cH * (1 - frac);
            return (
              <g key={`oy-${frac}`}>
                <line x1={ML} x2={W - MR} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                <text x={ML - 3} y={y + 3} textAnchor="end" fontSize={7} className="fill-muted-foreground">
                  {fmtShares(Math.round(maxOI * frac))}
                </text>
              </g>
            );
          })}

          {/* Max pain line */}
          {strikeData.findIndex((r) => r.strike === maxPain) >= 0 && (() => {
            const idx = strikeData.findIndex((r) => r.strike === maxPain);
            const x   = ML + (idx / (n - 1)) * cW;
            return (
              <line x1={x} x2={x} y1={MT} y2={MT + cH}
                stroke="rgba(250,189,0,0.6)" strokeWidth={1.5} strokeDasharray="4 2" />
            );
          })()}

          {strikeData.map((r, i) => {
            const x     = ML + (i / (n - 1)) * cW;
            const callH = maxOI > 0 ? (r.callOI / maxOI) * cH : 0;
            const putH  = maxOI > 0 ? (r.putOI  / maxOI) * cH : 0;
            const isATM = Math.abs(r.strike - SPOT) < 3;
            return (
              <g key={`oi-${r.strike}`}>
                {/* Call OI bar */}
                <rect x={x - bW - 0.5} y={MT + cH - callH} width={bW} height={callH}
                  fill={isATM ? "rgba(52,211,153,0.9)" : "rgba(52,211,153,0.55)"} rx={1} />
                {/* Put OI bar */}
                <rect x={x + 0.5}      y={MT + cH - putH}  width={bW} height={putH}
                  fill={isATM ? "rgba(251,113,133,0.9)" : "rgba(251,113,133,0.55)"} rx={1} />
                {/* Strike label (every 2nd) */}
                {i % 2 === 0 && (
                  <text x={x} y={H - 6} textAnchor="middle" fontSize={6} className="fill-muted-foreground">
                    {r.strike}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="mt-1 flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-emerald-400/70" />Call OI
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-red-400/70" />Put OI
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 border-t-2 border-dashed border-amber-400/70" />Max Pain ${maxPain}
          </span>
        </div>
      </div>

      {/* GEX chart */}
      <div className="rounded-md border border-border/50 bg-card/40 p-3">
        <div className="mb-1 text-xs font-semibold">Gamma Exposure (GEX) by Strike</div>
        <div className="mb-2 text-[11px] text-muted-foreground">Positive GEX = market makers long gamma (stabilizing) · Negative GEX = short gamma (amplifying)</div>
        <svg viewBox={`0 0 ${W} 90`} width="100%" className="overflow-visible">
          {(() => {
            const GH = 90, GMT = 8, GMB = 18;
            const gcH = GH - GMT - GMB;
            const mid = GMT + gcH / 2;
            const gn  = gexData.length;
            return (
              <>
                <line x1={ML} x2={W - MR} y1={mid} y2={mid} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                {gexData.map((g, i) => {
                  const x   = ML + (i / (gn - 1)) * cW;
                  const bar = maxGex > 0 ? (g.gex / maxGex) * (gcH / 2) : 0;
                  const isPos = g.gex >= 0;
                  return (
                    <g key={`gex-${g.strike}`}>
                      <rect
                        x={x - bW}
                        y={isPos ? mid - bar : mid}
                        width={bW * 2}
                        height={Math.abs(bar)}
                        fill={isPos ? "rgba(52,211,153,0.6)" : "rgba(251,113,133,0.6)"}
                        rx={1}
                      />
                      {i % 2 === 0 && (
                        <text x={x} y={GH - 4} textAnchor="middle" fontSize={6} className="fill-muted-foreground">
                          {g.strike}
                        </text>
                      )}
                    </g>
                  );
                })}
              </>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

// ── Section 5: Dark Pool + Options Correlation ────────────────────────────────

function DarkPoolCorrelation({ seed }: { seed: number }) {
  const uid          = useId();
  const prints       = generateDarkPrints(seed);
  const correlations = generateCorrelations(seed);

  const buyDollar  = prints.filter((p) => p.side === "above_ask").reduce((s, p) => s + p.dollarValue, 0);
  const sellDollar = prints.filter((p) => p.side === "below_bid").reduce((s, p) => s + p.dollarValue, 0);
  const total      = buyDollar + sellDollar || 1;

  function formatDollar(n: number): string {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
    return `$${(n / 1e3).toFixed(0)}K`;
  }

  // Scatter-like correlation chart (simplified SVG)
  const W = 220, H = 100;
  const CPL = 36, CPR = 10, CPT = 10, CPB = 22;
  const CW  = W - CPL - CPR;
  const CH  = H - CPT - CPB;

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      {/* Dark pool buy/sell summary */}
      <div className="rounded-md border border-border/50 bg-card/40 p-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold">Simulated Institutional 24h Flow</span>
          <span className="text-muted-foreground">{prints.length} prints</span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full">
          <div className="bg-emerald-500/70" style={{ width: `${(buyDollar / total * 100).toFixed(0)}%` }} />
          <div className="bg-red-500/70"     style={{ width: `${(sellDollar / total * 100).toFixed(0)}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px]">
          <span className="text-emerald-400">Buy {(buyDollar / total * 100).toFixed(0)}% · {formatDollar(buyDollar)}</span>
          <span className="text-red-400">Sell {(sellDollar / total * 100).toFixed(0)}% · {formatDollar(sellDollar)}</span>
        </div>
      </div>

      {/* Correlation table */}
      <div className="rounded-md border border-border/50 bg-card/40 p-3">
        <div className="mb-2 text-xs font-semibold">DP + Options Signal Correlation</div>
        <div className="overflow-auto">
          <table className="w-full border-collapse text-[11px]">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border/50">
                {["Ticker","DP Buy%","Opts Bull%","Corr","Score","Follow-Thru","DP First?"].map((h, i) => (
                  <th key={`dph-${i}`} className="px-3 py-2 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlations.map((c) => {
                const highConviction = c.signalScore >= 70;
                return (
                  <tr key={c.ticker} className="border-b border-border/50 transition-colors hover:bg-muted/50">
                    <td className="px-3 py-2 font-medium">{c.ticker}</td>
                    <td className={cn("px-3 py-2 text-right font-mono tabular-nums", c.dpBuySide > 55 ? "text-emerald-500" : "text-red-500")}>
                      {c.dpBuySide.toFixed(0)}%
                    </td>
                    <td className={cn("px-3 py-2 text-right font-mono tabular-nums", c.optionsSentiment > 55 ? "text-emerald-500" : "text-red-500")}>
                      {c.optionsSentiment.toFixed(0)}%
                    </td>
                    <td className={cn(
                      "px-3 py-2 text-right font-mono tabular-nums font-medium",
                      c.correlation > 0.3 ? "text-emerald-500" : c.correlation < -0.3 ? "text-red-500" : "text-muted-foreground",
                    )}>
                      {c.correlation.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted/30">
                          <div
                            className={cn("h-full rounded-full", highConviction ? "bg-primary/80" : "bg-muted-foreground/40")}
                            style={{ width: `${c.signalScore}%` }}
                          />
                        </div>
                        <span className={cn("tabular-nums", highConviction ? "text-primary" : "text-muted-foreground")}>
                          {c.signalScore}
                        </span>
                      </div>
                    </td>
                    <td className={cn(
                      "px-3 py-2 text-right font-mono tabular-nums",
                      c.followThrough > 65 ? "text-emerald-500" : c.followThrough > 50 ? "text-amber-400" : "text-red-500",
                    )}>
                      {c.followThrough.toFixed(0)}%
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn(
                        "rounded px-1 py-0.5 text-[11px] font-medium",
                        c.dpPrecedesOpts ? "bg-orange-500/15 text-orange-400" : "bg-muted/20 text-muted-foreground",
                      )}>
                        {c.dpPrecedesOpts ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scatter: DP buy% vs Options bull% */}
      <div className="rounded-md border border-border/50 bg-card/40 p-3">
        <div className="mb-1 text-xs font-semibold">DP Buy% vs Options Bullish% (Conviction Map)</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="overflow-visible">
          <defs>
            <linearGradient id={`${uid}-conv`} x1="0" x2="1" y1="1" y2="0">
              <stop offset="0%"   stopColor="rgba(251,113,133,0.1)" />
              <stop offset="50%"  stopColor="rgba(100,100,100,0.05)" />
              <stop offset="100%" stopColor="rgba(52,211,153,0.1)" />
            </linearGradient>
          </defs>

          {/* Background gradient */}
          <rect x={CPL} y={CPT} width={CW} height={CH} fill={`url(#${uid}-conv)`} rx={3} />

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((frac) => {
            const x = CPL + frac * CW;
            const y = CPT + frac * CH;
            return (
              <g key={`sgrid-${frac}`}>
                <line x1={x} x2={x} y1={CPT} y2={CPT + CH} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                <line x1={CPL} x2={CPL + CW} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
              </g>
            );
          })}

          {/* Diagonal = agreement line */}
          <line x1={CPL} y1={CPT + CH} x2={CPL + CW} y2={CPT}
            stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="3 3" />

          {/* Axis labels */}
          <text x={CPL + CW / 2} y={H - 5} textAnchor="middle" fontSize={7} className="fill-muted-foreground">
            DP Buy%
          </text>
          <text x={10} y={CPT + CH / 2} textAnchor="middle" fontSize={7}
            className="fill-muted-foreground" transform={`rotate(-90, 10, ${CPT + CH / 2})`}>
            Opts Bull%
          </text>

          {/* Data points */}
          {correlations.map((c) => {
            const x  = CPL + ((c.dpBuySide - 30) / 60) * CW;
            const y  = CPT + CH - ((c.optionsSentiment - 30) / 60) * CH;
            const agree = Math.abs(c.dpBuySide - c.optionsSentiment) < 15;
            const fill  = agree
              ? (c.dpBuySide > 55 ? "rgba(52,211,153,0.9)" : "rgba(251,113,133,0.9)")
              : "rgba(160,160,180,0.7)";
            return (
              <g key={`sc-${c.ticker}`}>
                <circle cx={x} cy={y} r={c.signalScore / 20 + 3} fill={fill} opacity={0.8} />
                <text x={x + 5} y={y - 3} fontSize={7} className="fill-foreground font-medium">{c.ticker}</text>
              </g>
            );
          })}
        </svg>
        <div className="mt-1 text-[11px] text-muted-foreground">
          Circle size = signal score. On-diagonal = DP and options agree.
        </div>
      </div>

      {/* DP prints feed (top 10) */}
      <div className="rounded-md border border-border/50 bg-card/40 p-3">
        <div className="mb-2 text-xs font-semibold">Recent Simulated Institutional Prints</div>
        <div className="overflow-auto">
          <table className="w-full border-collapse text-[11px]">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border/50">
                {["Time","Ticker","Size","Price","$Value","Side"].map((h, i) => (
                  <th key={`dpt-${i}`} className="px-3 py-2 text-left text-[11px] font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prints.slice(0, 10).map((p) => {
                const isAbove = p.side === "above_ask";
                const isBelow = p.side === "below_bid";
                return (
                  <tr key={p.id} className="border-b border-border/50 transition-colors hover:bg-muted/50">
                    <td className="px-3 py-2 text-muted-foreground">{relTime(p.timestamp)}</td>
                    <td className="px-3 py-2 font-medium">{p.ticker}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums font-medium">{fmtShares(p.size)}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">${p.price.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-orange-400">{formatDollar(p.dollarValue)}</td>
                    <td className="px-3 py-2">
                      {isAbove ? (
                        <span className="rounded bg-emerald-500/15 px-1 py-0.5 text-[11px] font-medium text-emerald-500">Above Ask</span>
                      ) : isBelow ? (
                        <span className="rounded bg-red-500/15 px-1 py-0.5 text-[11px] font-medium text-red-500">Below Bid</span>
                      ) : (
                        <span className="rounded bg-muted/20 px-1 py-0.5 text-[11px] text-muted-foreground">Mid</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

}

// ── Tab navigation ────────────────────────────────────────────────────────────

type TabKey = "flow" | "heatmap" | "pcr" | "oi" | "darkpool";

const TABS: { key: TabKey; label: string }[] = [
  { key: "flow",     label: "Flow Feed" },
  { key: "heatmap",  label: "Heatmap" },
  { key: "pcr",      label: "P/C Ratio" },
  { key: "oi",       label: "OI Analysis" },
  { key: "darkpool", label: "Simulated Institutional Flow" },
];

// ── Root Component ────────────────────────────────────────────────────────────

export default function OptionsFlowAnalytics() {
  const [tab, setTab]         = useState<TabKey>("flow");
  const [tick, setTick]       = useState(0);
  const [entries, setEntries] = useState<FlowEntry[]>(() => generateFlowEntries(51));
  const seedRef               = { current: 51 + tick };

  // Refresh entries every 3 seconds with a new seed
  const refresh = useCallback(() => {
    setTick((t) => {
      const next = t + 1;
      setEntries(generateFlowEntries(51 + next));
      return next;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [refresh]);

  const seed = 51 + tick;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border/60 bg-card text-foreground">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold">Options Flow Analytics</span>
          <motion.span
            key={tick}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-400"
          >
            LIVE
          </motion.span>
        </div>
        <button
          onClick={refresh}
          className="rounded border border-border/50 bg-muted/20 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex shrink-0 items-center gap-0.5 border-b border-border/50 px-4 py-1.5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              tab === key
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {tab === "flow"     && <><SectionTitle>Unusual Options Activity Feed</SectionTitle><ActivityFeed entries={entries} /></>}
            {tab === "heatmap"  && <><SectionTitle>Flow Heatmap — Ticker × Expiry</SectionTitle><FlowHeatmapSection entries={entries} /></>}
            {tab === "pcr"      && <><SectionTitle>Put/Call Ratio Dashboard</SectionTitle><PCRatioDashboard seed={seed} /></>}
            {tab === "oi"       && <><SectionTitle>Open Interest Analysis</SectionTitle><OIAnalysis seed={seed} /></>}
            {tab === "darkpool" && <><SectionTitle>Simulated Institutional Flow + Options Correlation</SectionTitle><DarkPoolCorrelation seed={seed} /></>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
