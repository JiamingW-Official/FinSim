"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  X,
  ChevronRight,
  AlertTriangle,
  BookOpen,
  BarChart2,
  Layers,
  Wheat,
  Flame,
  Coins,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface FuturesContract {
  symbol: string;
  description: string;
  basePrice: number;
  contractSize: number; // in units
  tickSize: number;
  exchange: string;
  sector: "equity" | "energy" | "metals" | "agriculture" | "fx";
}

interface FuturesRow extends FuturesContract {
  last: number;
  change: number;
  changePct: number;
  openInterest: number;
  volume: number;
  settlement: number;
}

interface ForwardCurvePoint {
  month: string;
  price: number;
}

interface CommodityRow {
  symbol: string;
  name: string;
  price: number;
  change1d: number;
  low52w: number;
  high52w: number;
  inflationCorr: number; // -1 to 1
  sector: "energy" | "metals" | "agriculture";
  unit: string;
}

// ── Contract definitions ──────────────────────────────────────────────────────

const CONTRACTS: FuturesContract[] = [
  { symbol: "ES",  description: "E-mini S&P 500",      basePrice: 5210,  contractSize: 50,    tickSize: 0.25, exchange: "CME",   sector: "equity"      },
  { symbol: "NQ",  description: "E-mini Nasdaq-100",   basePrice: 18240, contractSize: 20,    tickSize: 0.25, exchange: "CME",   sector: "equity"      },
  { symbol: "YM",  description: "E-mini Dow Jones",    basePrice: 39180, contractSize: 5,     tickSize: 1,    exchange: "CBOT",  sector: "equity"      },
  { symbol: "RTY", description: "E-mini Russell 2000", basePrice: 2084,  contractSize: 50,    tickSize: 0.1,  exchange: "CME",   sector: "equity"      },
  { symbol: "CL",  description: "Crude Oil WTI",       basePrice: 82.4,  contractSize: 1000,  tickSize: 0.01, exchange: "NYMEX", sector: "energy"      },
  { symbol: "NG",  description: "Natural Gas",         basePrice: 2.184, contractSize: 10000, tickSize: 0.001,exchange: "NYMEX", sector: "energy"      },
  { symbol: "GC",  description: "Gold",                basePrice: 2345,  contractSize: 100,   tickSize: 0.1,  exchange: "COMEX", sector: "metals"      },
  { symbol: "SI",  description: "Silver",              basePrice: 27.84, contractSize: 5000,  tickSize: 0.005,exchange: "COMEX", sector: "metals"      },
  { symbol: "ZC",  description: "Corn",                basePrice: 452.5, contractSize: 5000,  tickSize: 0.25, exchange: "CBOT",  sector: "agriculture" },
  { symbol: "ZW",  description: "Wheat",               basePrice: 598.25,contractSize: 5000,  tickSize: 0.25, exchange: "CBOT",  sector: "agriculture" },
  { symbol: "6E",  description: "Euro FX",             basePrice: 1.0842,contractSize: 125000,tickSize: 0.00005,exchange: "CME", sector: "fx"          },
  { symbol: "6J",  description: "Japanese Yen",        basePrice: 0.00651,contractSize: 12500000,tickSize: 0.0000001,exchange: "CME",sector: "fx"      },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ── Data generators ───────────────────────────────────────────────────────────

function generateRows(seed: number): FuturesRow[] {
  return CONTRACTS.map((c) => {
    const rng = mulberry32(hashStr(c.symbol) ^ seed);
    const changePct = (rng() - 0.48) * 3;
    const change = c.basePrice * changePct / 100;
    const last = c.basePrice + change;
    const settlement = c.basePrice * (1 + (rng() - 0.5) * 0.002);
    const oi = Math.floor(100000 + rng() * 900000);
    const vol = Math.floor(oi * (0.1 + rng() * 0.4));
    return { ...c, last, change, changePct, openInterest: oi, volume: vol, settlement };
  });
}

function generateForwardCurve(seed: number): ForwardCurvePoint[] {
  const rng = mulberry32(seed);
  const base = 82.4 + (rng() - 0.5) * 4;
  const now = new Date();
  // slight contango by default, with random noise
  const contango = rng() > 0.35; // 65% contango
  const slope = contango ? 0.4 + rng() * 0.8 : -(0.3 + rng() * 0.6);

  return Array.from({ length: 6 }, (_, i) => {
    const monthIdx = (now.getMonth() + i) % 12;
    const noise = (rng() - 0.5) * 0.3;
    const price = base + slope * i + noise;
    return { month: MONTHS[monthIdx], price };
  });
}

function generateCommodities(seed: number): CommodityRow[] {
  const defs: Omit<CommodityRow, "price" | "change1d" | "low52w" | "high52w" | "inflationCorr">[] = [
    { symbol: "WTI",  name: "Crude Oil WTI",  sector: "energy",      unit: "$/bbl" },
    { symbol: "BRT",  name: "Brent Crude",    sector: "energy",      unit: "$/bbl" },
    { symbol: "NG",   name: "Natural Gas",    sector: "energy",      unit: "$/mmBtu" },
    { symbol: "HO",   name: "Heating Oil",    sector: "energy",      unit: "$/gal" },
    { symbol: "GC",   name: "Gold",           sector: "metals",      unit: "$/oz" },
    { symbol: "SI",   name: "Silver",         sector: "metals",      unit: "$/oz" },
    { symbol: "HG",   name: "Copper",         sector: "metals",      unit: "$/lb" },
    { symbol: "PL",   name: "Platinum",       sector: "metals",      unit: "$/oz" },
    { symbol: "ZC",   name: "Corn",           sector: "agriculture", unit: "cents/bu" },
    { symbol: "ZW",   name: "Wheat",          sector: "agriculture", unit: "cents/bu" },
    { symbol: "ZS",   name: "Soybeans",       sector: "agriculture", unit: "cents/bu" },
    { symbol: "KC",   name: "Coffee",         sector: "agriculture", unit: "cents/lb" },
  ];

  const basePrices: Record<string, number> = {
    WTI: 82.4, BRT: 86.2, NG: 2.184, HO: 2.67,
    GC: 2345, SI: 27.84, HG: 4.22, PL: 1012,
    ZC: 452.5, ZW: 598.25, ZS: 1148, KC: 182.4,
  };

  const inflCorr: Record<string, number> = {
    WTI: 0.72, BRT: 0.71, NG: 0.58, HO: 0.68,
    GC: 0.61, SI: 0.44, HG: 0.38, PL: 0.31,
    ZC: 0.52, ZW: 0.55, ZS: 0.48, KC: 0.33,
  };

  return defs.map((d) => {
    const rng = mulberry32(hashStr(d.symbol) ^ seed);
    const base = basePrices[d.symbol];
    const changePct = (rng() - 0.48) * 3.2;
    const price = base * (1 + changePct / 100);
    const change1d = price - base;
    const swingLow = rng() * 0.18;
    const swingHigh = rng() * 0.22;
    const low52w = base * (1 - swingLow);
    const high52w = base * (1 + swingHigh);
    return { ...d, price, change1d, low52w, high52w, inflationCorr: inflCorr[d.symbol] };
  });
}

// ── Format helpers ─────────────────────────────────────────────────────────────

function fmtPrice(n: number, decimals?: number): string {
  if (decimals !== undefined) return n.toFixed(decimals);
  if (n >= 10000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1)     return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toFixed(5);
}

function fmtChange(n: number, base: number): string {
  if (base >= 1000) return n.toFixed(1);
  if (base >= 1)    return n.toFixed(2);
  return n.toFixed(5);
}

function fmtLargeNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

const SECTOR_COLORS: Record<FuturesContract["sector"], string> = {
  equity:      "text-blue-400",
  energy:      "text-orange-400",
  metals:      "text-yellow-400",
  agriculture: "text-green-400",
  fx:          "text-purple-400",
};

const SECTOR_LABELS: Record<FuturesContract["sector"], string> = {
  equity:      "Equity",
  energy:      "Energy",
  metals:      "Metals",
  agriculture: "Agri",
  fx:          "FX",
};

// ── Order Modal ────────────────────────────────────────────────────────────────

interface OrderModalProps {
  contract: FuturesRow;
  onClose: () => void;
}

function OrderModal({ contract, onClose }: OrderModalProps) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [contracts, setContracts] = useState(1);
  const [stopPct, setStopPct] = useState(1.0);
  const [submitted, setSubmitted] = useState(false);

  const notionalValue = contract.last * contract.contractSize * contracts;
  const initialMargin = notionalValue * 0.05; // ~5% initial margin (simplified)
  const stopPrice = side === "buy"
    ? contract.last * (1 - stopPct / 100)
    : contract.last * (1 + stopPct / 100);
  const maxLoss = Math.abs(contract.last - stopPrice) * contract.contractSize * contracts;

  function handleSubmit() {
    setSubmitted(true);
    setTimeout(onClose, 1800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-foreground">{contract.symbol}</span>
            <span className="ml-2 text-sm text-muted-foreground">{contract.description}</span>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current price */}
        <div className="mb-4 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Last Price</span>
            <span className={cn("text-sm font-semibold tabular-nums", contract.change >= 0 ? "text-emerald-400" : "text-red-400")}>
              {fmtPrice(contract.last)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Contract Size</span>
            <span className="text-xs text-muted-foreground">{contract.contractSize.toLocaleString()} units · {contract.exchange}</span>
          </div>
        </div>

        {/* Side toggle */}
        <div className="mb-3 flex rounded-lg border border-border overflow-hidden">
          <button
            className={cn("flex-1 py-2 text-sm font-semibold transition-colors", side === "buy" ? "bg-emerald-500/20 text-emerald-400" : "bg-transparent text-muted-foreground hover:bg-accent/50")}
            onClick={() => setSide("buy")}
          >
            Buy / Long
          </button>
          <button
            className={cn("flex-1 py-2 text-sm font-semibold transition-colors", side === "sell" ? "bg-red-500/20 text-red-400" : "bg-transparent text-muted-foreground hover:bg-accent/50")}
            onClick={() => setSide("sell")}
          >
            Sell / Short
          </button>
        </div>

        {/* Contracts input */}
        <div className="mb-3">
          <label className="mb-1 block text-xs text-muted-foreground">Number of Contracts</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setContracts(Math.max(1, contracts - 1))} className="h-8 w-8 rounded-md border border-border text-sm hover:bg-accent flex items-center justify-center font-bold">−</button>
            <span className="flex-1 text-center text-sm font-semibold tabular-nums">{contracts}</span>
            <button onClick={() => setContracts(contracts + 1)} className="h-8 w-8 rounded-md border border-border text-sm hover:bg-accent flex items-center justify-center font-bold">+</button>
          </div>
        </div>

        {/* Stop loss */}
        <div className="mb-4">
          <label className="mb-1 block text-xs text-muted-foreground">Stop Loss (%)</label>
          <input
            type="range"
            min={0.25}
            max={5}
            step={0.25}
            value={stopPct}
            onChange={(e) => setStopPct(parseFloat(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Stop @ {fmtPrice(stopPrice)}</span>
            <span>{stopPct.toFixed(2)}%</span>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-4 rounded-lg border border-border bg-muted/20 px-3 py-2.5 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Notional Value</span>
            <span className="font-medium">${notionalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Est. Initial Margin (5%)</span>
            <span className="font-medium">${initialMargin.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Max Loss at Stop</span>
            <span className="font-medium text-red-400">${maxLoss.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 py-2.5 text-center text-sm font-semibold text-emerald-400">
            Order Simulated
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className={cn(
              "w-full rounded-lg py-2.5 text-sm font-semibold transition-colors",
              side === "buy"
                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                : "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30",
            )}
          >
            {side === "buy" ? "Buy" : "Sell"} {contracts} {contracts === 1 ? "Contract" : "Contracts"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Tab 1: Futures Quotes ──────────────────────────────────────────────────────

function FuturesQuotesTab({ rows }: { rows: FuturesRow[] }) {
  const [selected, setSelected] = useState<FuturesRow | null>(null);
  const [sectorFilter, setSectorFilter] = useState<FuturesContract["sector"] | "all">("all");

  const filtered = sectorFilter === "all" ? rows : rows.filter((r) => r.sector === sectorFilter);

  return (
    <div className="flex flex-col gap-3">
      {/* Sector filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {(["all", "equity", "energy", "metals", "agriculture", "fx"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSectorFilter(s)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors capitalize",
              sectorFilter === s
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {s === "all" ? "All" : SECTOR_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Symbol</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Description</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Last</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Change</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Chg%</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Open Int.</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Volume</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Settlement</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const up = row.change >= 0;
              return (
                <tr
                  key={row.symbol}
                  className={cn(
                    "border-b border-border/50 transition-colors cursor-pointer",
                    up ? "hover:bg-emerald-500/5" : "hover:bg-red-500/5",
                  )}
                  onClick={() => setSelected(row)}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded", SECTOR_COLORS[row.sector], "bg-current/10")}>
                        {row.symbol}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{row.description}</td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                    {fmtPrice(row.last)}
                  </td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums text-xs font-medium", up ? "text-emerald-400" : "text-red-400")}>
                    {up ? "+" : ""}{fmtChange(row.change, row.last)}
                  </td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums text-xs font-semibold", up ? "text-emerald-400" : "text-red-400")}>
                    <span className={cn("inline-flex items-center gap-0.5 rounded px-1.5 py-0.5", up ? "bg-emerald-500/10" : "bg-red-500/10")}>
                      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {up ? "+" : ""}{row.changePct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-muted-foreground tabular-nums">
                    {fmtLargeNum(row.openInterest)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-muted-foreground tabular-nums">
                    {fmtLargeNum(row.volume)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-muted-foreground tabular-nums">
                    {fmtPrice(row.settlement)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground/50 text-center">
        Click any row to open the order entry panel. Prices are simulated for educational purposes.
      </p>

      {selected && <OrderModal contract={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ── Tab 2: Contango / Backwardation ───────────────────────────────────────────

function ContangoTab({ seed }: { seed: number }) {
  const curve = useMemo(() => generateForwardCurve(seed), [seed]);

  const front = curve[0]?.price ?? 82;
  const second = curve[1]?.price ?? 82;
  const rollDiff = second - front; // positive = contango cost
  const isContango = rollDiff > 0;
  const carryPct = (rollDiff / front) * 100;

  // SVG dimensions
  const W = 480;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 36, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const prices = curve.map((p) => p.price);
  const minP = Math.min(...prices) - 0.5;
  const maxP = Math.max(...prices) + 0.5;
  const scaleY = (p: number) => PAD.top + chartH - ((p - minP) / (maxP - minP)) * chartH;
  const scaleX = (i: number) => PAD.left + (i / (curve.length - 1)) * chartW;

  // Build polyline points
  const polyline = curve.map((p, i) => `${scaleX(i)},${scaleY(p.price)}`).join(" ");

  // Area path
  const areaPath = [
    `M ${scaleX(0)},${scaleY(curve[0]?.price ?? 0)}`,
    ...curve.map((p, i) => `L ${scaleX(i)},${scaleY(p.price)}`),
    `L ${scaleX(curve.length - 1)},${H - PAD.bottom}`,
    `L ${scaleX(0)},${H - PAD.bottom}`,
    "Z",
  ].join(" ");

  // Y-axis ticks
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => minP + (i / yTicks) * (maxP - minP));

  // Roll cost / carry table
  const rollRows = curve.slice(0, 5).map((point, i) => {
    const next = curve[i + 1];
    if (!next) return null;
    const diff = next.price - point.price;
    const pct = (diff / point.price) * 100;
    return { from: point.month, to: next.month, front: point.price, next: next.price, diff, pct };
  }).filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      {/* Header card */}
      <div className={cn(
        "rounded-xl border p-4",
        isContango ? "border-orange-500/30 bg-orange-500/5" : "border-blue-500/30 bg-blue-500/5",
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            isContango ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400",
          )}>
            {isContango ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          </div>
          <div>
            <div className={cn("text-base font-bold", isContango ? "text-orange-400" : "text-blue-400")}>
              {isContango ? "Contango" : "Backwardation"}
            </div>
            <div className="text-xs text-muted-foreground">
              {isContango
                ? "Forward prices > spot — futures curve slopes upward. Rolling costs money."
                : "Forward prices < spot — futures curve slopes downward. Rolling earns a premium."}
            </div>
          </div>
        </div>
      </div>

      {/* Forward curve SVG chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold">Crude Oil (WTI) — 6-Month Forward Curve</span>
          <span className="text-xs text-muted-foreground">$/bbl</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
          <defs>
            <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isContango ? "#f97316" : "#3b82f6"} stopOpacity={0.25} />
              <stop offset="100%" stopColor={isContango ? "#f97316" : "#3b82f6"} stopOpacity={0.01} />
            </linearGradient>
          </defs>

          {/* Y-axis gridlines + labels */}
          {yTickValues.map((v, i) => (
            <g key={i}>
              <line
                x1={PAD.left} y1={scaleY(v)}
                x2={W - PAD.right} y2={scaleY(v)}
                stroke="currentColor" strokeOpacity={0.06} strokeWidth={1}
              />
              <text
                x={PAD.left - 4} y={scaleY(v) + 4}
                textAnchor="end" fontSize={9}
                fill="currentColor" fillOpacity={0.4}
              >
                {v.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#curveGrad)" />

          {/* Curve line */}
          <polyline
            points={polyline}
            fill="none"
            stroke={isContango ? "#f97316" : "#3b82f6"}
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {/* Data points */}
          {curve.map((p, i) => (
            <g key={i}>
              <circle cx={scaleX(i)} cy={scaleY(p.price)} r={3.5} fill={isContango ? "#f97316" : "#3b82f6"} />
              <text x={scaleX(i)} y={H - PAD.bottom + 14} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.6}>
                {p.month}
              </text>
              <text x={scaleX(i)} y={scaleY(p.price) - 7} textAnchor="middle" fontSize={8.5} fill="currentColor" fillOpacity={0.7}>
                {p.price.toFixed(2)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Roll cost / carry calculator */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 text-sm font-semibold">Roll Cost / Benefit Calculator</div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Front Month ({curve[0]?.month})</span>
              <span className="font-semibold tabular-nums">${front.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Next Month ({curve[1]?.month})</span>
              <span className="font-semibold tabular-nums">${second.toFixed(2)}</span>
            </div>
            <div className="my-2 border-t border-border" />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Roll {isContango ? "Cost" : "Benefit"}</span>
              <span className={cn("font-bold tabular-nums", isContango ? "text-red-400" : "text-emerald-400")}>
                {isContango ? "+" : ""}${rollDiff.toFixed(2)} / contract ({carryPct.toFixed(2)}%)
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isContango
              ? `Rolling from ${curve[0]?.month} to ${curve[1]?.month} costs $${Math.abs(rollDiff).toFixed(2)}/bbl. Commodity ETFs and passive long funds systematically lose value through this roll cost in contango markets.`
              : `Rolling from ${curve[0]?.month} to ${curve[1]?.month} earns $${Math.abs(rollDiff).toFixed(2)}/bbl. Backwardation benefits long futures holders who roll forward.`}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 text-sm font-semibold">Monthly Roll Schedule</div>
          <div className="space-y-1">
            {rollRows.map((r) => r && (
              <div key={r.from + r.to} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/30 text-xs">
                <span className="text-muted-foreground">{r.from} → {r.to}</span>
                <span className="tabular-nums">${r.next.toFixed(2)}</span>
                <span className={cn("tabular-nums font-medium", r.diff >= 0 ? "text-red-400" : "text-emerald-400")}>
                  {r.diff >= 0 ? "+" : ""}${r.diff.toFixed(2)} ({r.pct.toFixed(2)}%)
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">Carry Calculator</div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Annualized Roll Yield</span>
              <span className={cn("font-semibold tabular-nums", isContango ? "text-red-400" : "text-emerald-400")}>
                {(carryPct * 12).toFixed(1)}% / yr
              </span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-muted-foreground">Cost per 1000 bbl contract</span>
              <span className={cn("font-semibold tabular-nums", isContango ? "text-red-400" : "text-emerald-400")}>
                ${(Math.abs(rollDiff) * 1000).toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Commodities Dashboard ──────────────────────────────────────────────

interface CommodityCardProps {
  row: CommodityRow;
}

function CommodityCard({ row }: CommodityCardProps) {
  const up = row.change1d >= 0;
  const rangeSpan = row.high52w - row.low52w;
  const pos = rangeSpan > 0 ? ((row.price - row.low52w) / rangeSpan) * 100 : 50;
  const corrStr = row.inflationCorr >= 0.5 ? "High" : row.inflationCorr >= 0.3 ? "Moderate" : "Low";
  const corrColor = row.inflationCorr >= 0.5 ? "text-orange-400" : row.inflationCorr >= 0.3 ? "text-yellow-400" : "text-muted-foreground";

  return (
    <div className="rounded-lg border border-border bg-card/60 p-3 hover:border-border/80 transition-colors">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="text-sm font-bold">{row.symbol}</span>
          <span className="ml-1.5 text-xs text-muted-foreground">{row.name}</span>
        </div>
        <span className={cn("text-xs font-semibold tabular-nums", up ? "text-emerald-400" : "text-red-400")}>
          {up ? "+" : ""}{((row.change1d / (row.price - row.change1d)) * 100).toFixed(2)}%
        </span>
      </div>

      <div className="mb-2 flex items-baseline gap-1">
        <span className="text-base font-bold tabular-nums">{row.price >= 100 ? row.price.toFixed(2) : row.price.toFixed(3)}</span>
        <span className="text-xs text-muted-foreground">{row.unit}</span>
        <span className={cn("ml-auto text-xs tabular-nums", up ? "text-emerald-400" : "text-red-400")}>
          {up ? "+" : ""}{row.change1d >= 0.01 ? row.change1d.toFixed(2) : row.change1d.toFixed(4)}
        </span>
      </div>

      {/* 52-week range bar */}
      <div className="mb-2">
        <div className="relative h-1 rounded-full bg-muted/50">
          <div
            className={cn("absolute h-full rounded-full", up ? "bg-emerald-500/40" : "bg-red-500/40")}
            style={{ width: `${pos}%` }}
          />
          <div
            className="absolute top-1/2 h-2.5 w-1 -translate-y-1/2 rounded-sm bg-primary"
            style={{ left: `${pos}%` }}
          />
        </div>
        <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground/50 tabular-nums">
          <span>{row.low52w.toFixed(row.low52w >= 100 ? 0 : 2)}</span>
          <span>52W Range</span>
          <span>{row.high52w.toFixed(row.high52w >= 100 ? 0 : 2)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Inflation Correlation</span>
        <span className={cn("text-[10px] font-semibold", corrColor)}>
          {corrStr} ({row.inflationCorr.toFixed(2)})
        </span>
      </div>
    </div>
  );
}

function CommoditiesTab({ commodities }: { commodities: CommodityRow[] }) {
  const energy      = commodities.filter((c) => c.sector === "energy");
  const metals      = commodities.filter((c) => c.sector === "metals");
  const agriculture = commodities.filter((c) => c.sector === "agriculture");

  // WTI / Brent spread
  const wti   = commodities.find((c) => c.symbol === "WTI");
  const brent = commodities.find((c) => c.symbol === "BRT");
  const spread = brent && wti ? brent.price - wti.price : null;

  return (
    <div className="flex flex-col gap-5">
      {/* WTI-Brent spread banner */}
      {spread !== null && wti && brent && (
        <div className="rounded-xl border border-border bg-card/40 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">WTI / Brent Spread</span>
            <span className="text-xs text-muted-foreground">Typical range: $1–$5</span>
          </div>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex-1 text-center">
              <div className="text-xs text-muted-foreground">WTI</div>
              <div className="text-base font-bold tabular-nums">${wti.price.toFixed(2)}</div>
            </div>
            <div className="text-2xl text-muted-foreground/30">—</div>
            <div className="flex-1 text-center">
              <div className="text-xs text-muted-foreground">Brent</div>
              <div className="text-base font-bold tabular-nums">${brent.price.toFixed(2)}</div>
            </div>
            <div className="text-2xl text-muted-foreground/30">=</div>
            <div className="flex-1 text-center">
              <div className="text-xs text-muted-foreground">Spread</div>
              <div className={cn("text-base font-bold tabular-nums", spread >= 0 ? "text-emerald-400" : "text-red-400")}>
                {spread >= 0 ? "+" : ""}${spread.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Energy */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-semibold">Energy</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {energy.map((c) => <CommodityCard key={c.symbol} row={c} />)}
        </div>
      </div>

      {/* Metals */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Coins className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-semibold">Metals</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {metals.map((c) => <CommodityCard key={c.symbol} row={c} />)}
        </div>
      </div>

      {/* Agriculture */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Wheat className="h-4 w-4 text-green-400" />
          <span className="text-sm font-semibold">Agriculture</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {agriculture.map((c) => <CommodityCard key={c.symbol} row={c} />)}
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Futures Education ───────────────────────────────────────────────────

const EDU_SECTIONS = [
  {
    id: "leverage",
    icon: BarChart2,
    title: "Leverage and Margin in Futures",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    body: [
      {
        heading: "How Leverage Works",
        text: "A single E-mini S&P 500 (ES) futures contract controls $50 × index price ≈ $260,000 notional. Yet the initial margin requirement is roughly $12,000 — giving you ~21× leverage. This cuts both ways: a 1% move in the index is a ~21% move on your margin.",
      },
      {
        heading: "Initial vs. Maintenance Margin",
        text: "Initial margin is the deposit required to open a position. Maintenance margin is the minimum equity needed to hold it. If your account falls below maintenance, you receive a margin call and must top up or the broker liquidates your position.",
      },
      {
        heading: "Mark-to-Market Daily Settlement",
        text: "Futures are settled every day at the 4PM settlement price. Gains are credited to your account; losses are debited. This daily cash flow is called variation margin. Unlike options, you can lose more than your initial deposit.",
      },
      {
        heading: "Example",
        text: "You buy 1 ES contract at 5,200. The index drops 1% to 5,148. Daily P&L = −(5,200 − 5,148) × $50 = −$2,600. That comes directly out of your account that night.",
      },
    ],
  },
  {
    id: "roll",
    icon: Layers,
    title: "Roll Dates and Delivery",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    body: [
      {
        heading: "Contract Expiration",
        text: "Futures contracts expire on a fixed date — equity index futures (ES, NQ) expire quarterly on the third Friday of March, June, September, and December. Commodity contracts (CL, GC) expire monthly.",
      },
      {
        heading: "The Roll",
        text: 'If you want to maintain continuous exposure, you must "roll" before expiry: sell the expiring front-month contract and buy the next-month contract. Failure to roll a commodity contract can result in physical delivery — you do not want 1,000 barrels of crude oil delivered to your house.',
      },
      {
        heading: "Roll Window",
        text: "Most traders roll 5–10 days before first notice day (for commodities) or expiry (for financials). Open interest in the front month falls dramatically as it approaches expiry and migrates to the next contract.",
      },
      {
        heading: "Volume Watch",
        text: "A practical signal: when the back-month contract's volume exceeds the front-month, it is time to roll. Major index futures roll during the quarterly IMM dates.",
      },
    ],
  },
  {
    id: "basis",
    icon: AlertTriangle,
    title: "Basis Risk",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    body: [
      {
        heading: "What is Basis?",
        text: "Basis = Spot Price − Futures Price. In a perfectly efficient market, basis converges to zero at expiry. In practice, carry costs, supply/demand dynamics, and transport costs cause the futures price to differ from spot.",
      },
      {
        heading: "Basis Risk",
        text: "When using futures to hedge a cash position, basis risk is the risk that the spot–futures relationship changes unexpectedly. A hedge with a different underlying (e.g., using WTI futures to hedge jet fuel) has more basis risk because the two prices don't move perfectly together.",
      },
      {
        heading: "Convergence at Expiry",
        text: "Basis narrows as expiry approaches because arbitrageurs can profit from any gap. At delivery, the futures price must equal the spot price (adjusted for quality/location differentials).",
      },
      {
        heading: "Cross-Hedge Basis",
        text: "A corn farmer selling ZC futures faces basis risk because local elevator prices differ from Chicago CME prices due to transport costs. Basis = local cash − CME futures. Changes in this spread create imperfect hedge outcomes.",
      },
    ],
  },
  {
    id: "hedging",
    icon: BookOpen,
    title: "Hedging with Futures — Real-World Examples",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    body: [
      {
        heading: "Airlines Hedge Jet Fuel",
        text: "Airlines face massive fuel-cost exposure. Southwest Airlines famously locked in jet fuel prices using crude oil and heating oil futures contracts, saving billions when oil spiked in the 2000s. They sell future production exposure by buying futures — if oil rises, futures gains offset higher fuel bills.",
      },
      {
        heading: "Farmers Hedge Crops",
        text: "A corn farmer planting in March expects to harvest 50,000 bushels in October. At $4.50/bu, they sell 10 ZC contracts (5,000 bu each). If prices fall to $3.80, the farmer loses $35,000 on the cash sale but gains ~$35,000 on the short futures — locking in the original price.",
      },
      {
        heading: "Fund Managers Hedge Equity",
        text: "A portfolio manager with $26M in equities can neutralize market risk by selling ~100 ES contracts (each controlling $260K notional). The portfolio rises and falls roughly in line with the index, but futures P&L offsets most market movement (delta hedge).",
      },
      {
        heading: "Miners Hedge Gold Production",
        text: "Gold mining companies (Barrick, Newmont) sometimes hedge forward production by selling GC futures. This locks in revenue regardless of where spot gold moves, reducing earnings volatility — though it also caps upside if gold rallies.",
      },
    ],
  },
];

function EducationTab() {
  const [open, setOpen] = useState<string | null>("leverage");

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-border bg-card/40 p-4 mb-1">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Futures Fundamentals</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Futures contracts are standardized agreements to buy or sell an asset at a predetermined price on a future date. They are traded on regulated exchanges with central clearing, eliminating counterparty risk. Unlike options, futures obligate both parties.
        </p>
      </div>

      {EDU_SECTIONS.map((section) => {
        const isOpen = open === section.id;
        return (
          <div key={section.id} className={cn("rounded-xl border transition-colors", section.borderColor, isOpen ? section.bgColor : "bg-card/40 border-border")}>
            <button
              className="flex w-full items-center gap-3 p-4 text-left"
              onClick={() => setOpen(isOpen ? null : section.id)}
            >
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", section.bgColor)}>
                <section.icon className={cn("h-4 w-4", section.color)} />
              </div>
              <span className="flex-1 text-sm font-semibold">{section.title}</span>
              <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-4">
                {section.body.map((block, i) => (
                  <div key={i}>
                    <div className={cn("mb-1 text-xs font-semibold uppercase tracking-wide", section.color)}>
                      {block.heading}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{block.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="rounded-xl border border-border bg-muted/20 p-4 mt-1">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-amber-400">Educational Only.</span> Futures trading involves substantial risk. The leverage available in futures markets can lead to losses exceeding your initial deposit. All prices and examples on this page are simulated for learning purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FuturesPage() {
  const seed = useMemo(() => dateSeed(), []);
  const rows = useMemo(() => generateRows(seed), [seed]);
  const commodities = useMemo(() => generateCommodities(seed), [seed]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <DollarSign className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-none">Futures &amp; Commodities</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Simulated futures quotes, forward curves, and education</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="quotes" className="flex flex-col h-full">
          <div className="shrink-0 border-b border-border px-4 pt-2">
            <TabsList className="h-8 gap-0">
              <TabsTrigger value="quotes"     className="text-xs px-3">Futures Quotes</TabsTrigger>
              <TabsTrigger value="contango"   className="text-xs px-3">Contango / Backwardation</TabsTrigger>
              <TabsTrigger value="commodities" className="text-xs px-3">Commodities</TabsTrigger>
              <TabsTrigger value="education"  className="text-xs px-3">Education</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="quotes" className="flex-1 overflow-y-auto p-4 data-[state=inactive]:hidden">
            <FuturesQuotesTab rows={rows} />
          </TabsContent>

          <TabsContent value="contango" className="flex-1 overflow-y-auto p-4 data-[state=inactive]:hidden">
            <ContangoTab seed={seed} />
          </TabsContent>

          <TabsContent value="commodities" className="flex-1 overflow-y-auto p-4 data-[state=inactive]:hidden">
            <CommoditiesTab commodities={commodities} />
          </TabsContent>

          <TabsContent value="education" className="flex-1 overflow-y-auto p-4 data-[state=inactive]:hidden">
            <EducationTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
