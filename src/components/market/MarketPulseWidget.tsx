"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TickerAsset {
  symbol: string;
  name: string;
  basePrice: number;
  price: number;
  prevPrice: number;
  changeDollar: number;
  changePct: number;
  flash: "up" | "down" | null;
  seed: number;
}

interface SectorData {
  name: string;
  abbr: string;
  color: string;
  perf1D: number;
  perf1W: number;
  perf1M: number;
  perf3M: number;
  inflow: "strong" | "moderate" | "outflow";
}

interface VixTermStructure {
  spot: number;
  m1: number;
  m2: number;
  m3: number;
  hv30: number;
  vvix: number;
}

interface FearGreedComponent {
  name: string;
  value: number;
  weight: number;
  signal: string;
}

// ─── Static Seed Data ─────────────────────────────────────────────────────────

const TICKER_SEEDS: TickerAsset[] = [
  { symbol: "SPY",     name: "S&P 500 ETF",   basePrice: 512.34, price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1001 },
  { symbol: "QQQ",     name: "Nasdaq 100",    basePrice: 432.18, price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1002 },
  { symbol: "IWM",     name: "Russell 2000",  basePrice: 203.45, price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1003 },
  { symbol: "GLD",     name: "Gold ETF",      basePrice: 218.72, price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1004 },
  { symbol: "TLT",     name: "20Y Treasuries",basePrice: 94.81,  price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1005 },
  { symbol: "VIX",     name: "Volatility Idx",basePrice: 18.34,  price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1006 },
  { symbol: "BTC",     name: "Bitcoin",       basePrice: 67450.0,price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1007 },
  { symbol: "ETH",     name: "Ethereum",      basePrice: 3812.0, price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1008 },
  { symbol: "EUR/USD", name: "Euro/Dollar",   basePrice: 1.0834, price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1009 },
  { symbol: "USD/JPY", name: "Dollar/Yen",    basePrice: 149.72, price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1010 },
  { symbol: "OIL",     name: "Crude Oil",     basePrice: 78.45,  price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1011 },
  { symbol: "GAS",     name: "Nat. Gas",      basePrice: 2.134,  price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1012 },
  { symbol: "AAPL",    name: "Apple Inc.",    basePrice: 182.45, price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1013 },
  { symbol: "TSLA",    name: "Tesla Inc.",    basePrice: 248.73, price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1014 },
  { symbol: "NVDA",    name: "Nvidia Corp.",  basePrice: 875.40, price: 0, prevPrice: 0, changeDollar: 0, changePct: 0, flash: null, seed: 1015 },
];

const SECTOR_STATIC: Omit<SectorData, "perf1D" | "perf1W" | "perf1M" | "perf3M" | "inflow">[] = [
  { name: "Technology",        abbr: "Tech",    color: "#6366f1" },
  { name: "Healthcare",        abbr: "Health",  color: "#10b981" },
  { name: "Financials",        abbr: "Fin",     color: "#3b82f6" },
  { name: "Energy",            abbr: "Energy",  color: "#f59e0b" },
  { name: "Industrials",       abbr: "Indus",   color: "#8b5cf6" },
  { name: "Consumer Disc.",    abbr: "Disc",    color: "#ec4899" },
  { name: "Consumer Staples",  abbr: "Staples", color: "#14b8a6" },
  { name: "Utilities",         abbr: "Utils",   color: "#64748b" },
  { name: "Materials",         abbr: "Mats",    color: "#84cc16" },
  { name: "Real Estate",       abbr: "REIT",    color: "#f97316" },
  { name: "Comm. Services",    abbr: "Comm",    color: "#06b6d4" },
];

const CORR_ASSETS = ["SPY", "TLT", "GLD", "OIL", "USD", "BTC"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number, symbol: string): string {
  if (symbol === "EUR/USD") return price.toFixed(4);
  if (symbol === "GAS") return price.toFixed(3);
  if (symbol === "BTC") return price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (symbol === "ETH") return price.toFixed(2);
  if (price >= 1000) return price.toFixed(2);
  return price.toFixed(2);
}

function buildInitialPrices(tickSeed: number): TickerAsset[] {
  return TICKER_SEEDS.map((t) => {
    const rng = seededRandom(t.seed + tickSeed);
    const drift = (rng() - 0.5) * 0.04;
    const price = t.basePrice * (1 + drift);
    const prevPrice = t.basePrice * (1 + (rng() - 0.5) * 0.04);
    const changeDollar = price - prevPrice;
    const changePct = (changeDollar / prevPrice) * 100;
    return { ...t, price, prevPrice, changeDollar, changePct, flash: null };
  });
}

function perturbPrices(assets: TickerAsset[], tickSeed: number): TickerAsset[] {
  return assets.map((t) => {
    const rng = seededRandom(t.seed + tickSeed);
    const delta = (rng() - 0.495) * 0.0015 * t.price;
    const newPrice = Math.max(t.price + delta, 0.01);
    const changeDollar = newPrice - t.basePrice;
    const changePct = (changeDollar / t.basePrice) * 100;
    const flash: "up" | "down" = delta >= 0 ? "up" : "down";
    return { ...t, prevPrice: t.price, price: newPrice, changeDollar, changePct, flash };
  });
}

function buildSectors(seed: number): SectorData[] {
  const rng = seededRandom(seed + 5000);
  return SECTOR_STATIC.map((s, i) => {
    const base1D = (rng() - 0.5) * 4;
    const base1W = base1D * 1.4 + (rng() - 0.5) * 5;
    const base1M = base1W * 1.8 + (rng() - 0.5) * 8;
    const base3M = base1M * 2.2 + (rng() - 0.5) * 15;
    const r = rng();
    const inflow: SectorData["inflow"] = base1D > 0.8 ? "strong" : base1D > 0 ? "moderate" : "outflow";
    return { ...s, perf1D: base1D, perf1W: base1W, perf1M: base1M, perf3M: base3M, inflow };
  });
}

function buildFearGreed(seed: number): { composite: number; components: FearGreedComponent[]; history: number[] } {
  const rng = seededRandom(seed + 9000);
  const vix = rng() * 100;
  const momentum = rng() * 100;
  const breadth = rng() * 100;
  const putCall = rng() * 100;
  const safeHaven = rng() * 100;
  const components: FearGreedComponent[] = [
    { name: "VIX (Fear)", value: Math.round(vix), weight: 0.25, signal: vix < 30 ? "Low fear" : vix < 60 ? "Moderate" : "High fear" },
    { name: "Momentum",   value: Math.round(momentum), weight: 0.25, signal: momentum > 60 ? "Bullish" : momentum > 40 ? "Neutral" : "Bearish" },
    { name: "Breadth",    value: Math.round(breadth), weight: 0.20, signal: breadth > 60 ? "Wide" : breadth > 40 ? "Narrow" : "Very narrow" },
    { name: "Put/Call",   value: Math.round(putCall), weight: 0.15, signal: putCall > 60 ? "Call heavy" : putCall > 40 ? "Balanced" : "Put heavy" },
    { name: "Safe Haven", value: Math.round(safeHaven), weight: 0.15, signal: safeHaven > 60 ? "Risk-on" : safeHaven > 40 ? "Mixed" : "Risk-off" },
  ];
  const composite = Math.round(components.reduce((acc, c) => acc + c.value * c.weight, 0));
  const history = Array.from({ length: 7 }, () => Math.round(rng() * 100));
  return { composite, components, history };
}

function buildVixTermStructure(seed: number): VixTermStructure {
  const rng = seededRandom(seed + 7000);
  const spot = 15 + rng() * 20;
  const m1 = spot + (rng() - 0.3) * 3;
  const m2 = m1 + (rng() - 0.25) * 2.5;
  const m3 = m2 + (rng() - 0.2) * 2;
  const hv30 = 12 + rng() * 18;
  const vvix = 80 + rng() * 60;
  return { spot, m1, m2, m3, hv30, vvix };
}

function buildCorrelationMatrix(seed: number): number[][] {
  const rng = seededRandom(seed + 3000);
  const n = CORR_ASSETS.length;
  const mat: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i === j) return 1;
      if (i > j) return 0; // filled below
      const r = (rng() - 0.5) * 2;
      return Math.max(-0.99, Math.min(0.99, r));
    })
  );
  // make symmetric
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      mat[j][i] = mat[i][j];
    }
  }
  return mat;
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {badge && (
        <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{badge}</span>
      )}
    </div>
  );
}

// ─── Section 1: Live Ticker ───────────────────────────────────────────────────

function LiveTickerSection({ assets }: { assets: TickerAsset[] }) {
  return (
    <div>
      <SectionHeader title="Live Market Ticker" badge="2s" />
      <div className="space-y-0.5">
        {assets.map((asset) => {
          const isUp = asset.changePct >= 0;
          return (
            <motion.div
              key={asset.symbol}
              className={cn(
                "flex items-center justify-between px-2 py-1 rounded transition-colors duration-300",
                asset.flash === "up" && "bg-emerald-500/10",
                asset.flash === "down" && "bg-red-500/10",
              )}
              layout
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs font-bold w-16 shrink-0 text-foreground">{asset.symbol}</span>
                <span className="text-[10px] text-muted-foreground truncate hidden sm:block">{asset.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={asset.price.toFixed(4)}
                    initial={{ opacity: 0, y: asset.flash === "up" ? -4 : 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-mono text-xs font-semibold text-foreground tabular-nums w-20 text-right"
                  >
                    {formatPrice(asset.price, asset.symbol)}
                  </motion.span>
                </AnimatePresence>
                <span
                  className={cn(
                    "font-mono text-[10px] tabular-nums w-14 text-right",
                    isUp ? "text-emerald-400" : "text-red-400",
                  )}
                >
                  {isUp ? "+" : ""}{asset.changePct.toFixed(2)}%
                </span>
                <span
                  className={cn(
                    "font-mono text-[10px] tabular-nums w-12 text-right",
                    isUp ? "text-emerald-400/70" : "text-red-400/70",
                  )}
                >
                  {isUp ? "+" : ""}{asset.changeDollar >= 0.01 || asset.changeDollar <= -0.01 ? asset.changeDollar.toFixed(2) : asset.changeDollar.toFixed(4)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section 2: Market Breadth Gauge ─────────────────────────────────────────

function BreadthArcGauge({ value, label }: { value: number; label: string }) {
  const cx = 60, cy = 55, r = 42;
  const angle = Math.PI - (value / 100) * Math.PI;
  const needleX = cx + r * 0.75 * Math.cos(angle);
  const needleY = cy - r * 0.75 * Math.sin(angle);

  const color = value >= 60 ? "#22c55e" : value >= 40 ? "#eab308" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 120 70" className="w-24">
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#1e293b" strokeWidth={10}
        />
        {/* filled arc */}
        {(() => {
          const endAngle = Math.PI - (value / 100) * Math.PI;
          const ex = cx + r * Math.cos(endAngle);
          const ey = cy - r * Math.sin(endAngle);
          const largeArc = value > 50 ? 1 : 0;
          return (
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`}
              fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
            />
          );
        })()}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY}
          stroke="#f1f5f9" strokeWidth={2} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={3} fill="#f1f5f9" />
        <text x={cx} y={cy - 14} textAnchor="middle" fontSize="13"
          fontFamily="monospace" fill={color} fontWeight="bold">
          {value}%
        </text>
      </svg>
      <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

function MarketBreadthSection({ seed }: { seed: number }) {
  const rng = useMemo(() => seededRandom(seed + 200), [seed]);
  const advancers = useMemo(() => Math.round(1200 + rng() * 800), [seed]);
  const decliners = useMemo(() => Math.round(800 + rng() * 800), [seed]);
  const above50dma = useMemo(() => Math.round(30 + rng() * 60), [seed]);
  const newHighs = useMemo(() => Math.round(50 + rng() * 200), [seed]);
  const newLows = useMemo(() => Math.round(20 + rng() * 150), [seed]);
  const upVol = useMemo(() => Math.round(3 + rng() * 6), [seed]);
  const downVol = useMemo(() => Math.round(2 + rng() * 6), [seed]);
  const mcclellan = useMemo(() => Math.round((rng() - 0.5) * 200), [seed]);
  const adRatio = advancers / (decliners || 1);
  const adPct = (advancers / (advancers + decliners)) * 100;

  return (
    <div>
      <SectionHeader title="Market Breadth" />
      <div className="flex justify-around mb-4">
        <BreadthArcGauge value={Math.round(adPct)} label="A/D Ratio" />
        <BreadthArcGauge value={above50dma} label="Above 50 DMA" />
      </div>
      <div className="space-y-2">
        {/* Advance/Decline bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span className="text-emerald-400 font-mono">{advancers.toLocaleString()} Adv</span>
            <span className="font-mono text-xs">{adRatio.toFixed(2)}x A/D</span>
            <span className="text-red-400 font-mono">{decliners.toLocaleString()} Dec</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
            <div className="bg-emerald-500 h-full rounded-l-full"
              style={{ width: `${adPct}%` }} />
            <div className="bg-red-500 h-full flex-1 rounded-r-full" />
          </div>
        </div>
        {/* New Highs vs Lows */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span className="text-emerald-400 font-mono">{newHighs} 52W Hi</span>
            <span className="text-red-400 font-mono">{newLows} 52W Lo</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
            <div className="bg-emerald-500/80 h-full"
              style={{ width: `${(newHighs / (newHighs + newLows)) * 100}%` }} />
            <div className="bg-red-500/80 h-full flex-1" />
          </div>
        </div>
        {/* Up/Down Volume */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Up Vol/Down Vol</span>
          <span className={cn("font-mono text-xs font-semibold",
            upVol > downVol ? "text-emerald-400" : "text-red-400")}>
            {upVol}B / {downVol}B ({(upVol / downVol).toFixed(2)}x)
          </span>
        </div>
        {/* McClellan Oscillator */}
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground">McClellan Osc.</span>
          <span className={cn("font-mono text-xs font-semibold",
            mcclellan > 0 ? "text-emerald-400" : "text-red-400")}>
            {mcclellan > 0 ? "+" : ""}{mcclellan}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Section 3: Fear & Greed ──────────────────────────────────────────────────

function FearGreedGauge({ value }: { value: number }) {
  const cx = 100, cy = 85, r = 66;
  const angle = Math.PI - (value / 100) * Math.PI;
  const needleX = cx + r * 0.78 * Math.cos(angle);
  const needleY = cy - r * 0.78 * Math.sin(angle);

  const segments = [
    { start: 180, end: 144, color: "#ef4444", label: "Extreme\nFear" },
    { start: 144, end: 108, color: "#f97316", label: "Fear" },
    { start: 108, end: 72,  color: "#eab308", label: "Neutral" },
    { start: 72,  end: 36,  color: "#22c55e", label: "Greed" },
    { start: 36,  end: 0,   color: "#16a34a", label: "Extreme\nGreed" },
  ];

  const getLabel = () => {
    if (value < 20) return { text: "Extreme Fear", color: "#ef4444" };
    if (value < 40) return { text: "Fear", color: "#f97316" };
    if (value < 60) return { text: "Neutral", color: "#eab308" };
    if (value < 80) return { text: "Greed", color: "#22c55e" };
    return { text: "Extreme Greed", color: "#16a34a" };
  };

  const { text: labelText, color: labelColor } = getLabel();

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 100" className="w-full max-w-[220px]">
        {segments.map((seg, i) => {
          const startRad = (seg.start * Math.PI) / 180;
          const endRad = (seg.end * Math.PI) / 180;
          const x1 = cx + r * Math.cos(startRad);
          const y1 = cy - r * Math.sin(startRad);
          const x2 = cx + r * Math.cos(endRad);
          const y2 = cy - r * Math.sin(endRad);
          return (
            <path key={i}
              d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
              fill="none" stroke={seg.color} strokeWidth={11}
              strokeLinecap="butt" opacity={0.85}
            />
          );
        })}
        {/* needle */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY}
          stroke="#f8fafc" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={4.5} fill="#f8fafc" />
        {/* value */}
        <text x={cx} y={cy - 16} textAnchor="middle" fontSize="22"
          fontFamily="monospace" fill="#f8fafc" fontWeight="bold">{value}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9"
          fill={labelColor} fontWeight="600">{labelText}</text>
        {/* scale */}
        <text x={8} y={94} fontSize="8" fill="#64748b">0</text>
        <text x={92} y={12} fontSize="8" fill="#64748b">50</text>
        <text x={184} y={94} fontSize="8" fill="#64748b">100</text>
      </svg>
    </div>
  );
}

function FearGreedMiniChart({ history }: { history: number[] }) {
  const w = 160, h = 28;
  const min = Math.min(...history);
  const max = Math.max(...history, min + 1);
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  });
  const pathD = "M " + pts.join(" L ");
  const areaD = `${pathD} L ${w},${h} L 0,${h} Z`;
  const lastVal = history[history.length - 1];
  const color = lastVal >= 60 ? "#22c55e" : lastVal >= 40 ? "#eab308" : "#ef4444";

  return (
    <div className="mt-2">
      <p className="text-[10px] text-muted-foreground mb-1">Last 7 days</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 28 }}>
        <defs>
          <linearGradient id="fg-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#fg-grad)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} />
        {history.map((v, i) => {
          const x = (i / (history.length - 1)) * w;
          const y = h - ((v - min) / (max - min)) * h;
          return <circle key={i} cx={x} cy={y} r={2} fill={color} />;
        })}
      </svg>
    </div>
  );
}

function FearGreedSection({ seed }: { seed: number }) {
  const { composite, components, history } = useMemo(() => buildFearGreed(seed), [seed]);

  return (
    <div>
      <SectionHeader title="Fear & Greed Index" />
      <FearGreedGauge value={composite} />
      <div className="mt-3 space-y-2">
        {components.map((c) => {
          const barColor = c.value < 30 ? "bg-red-500" : c.value < 50 ? "bg-orange-500"
            : c.value < 70 ? "bg-yellow-500" : "bg-emerald-500";
          return (
            <div key={c.name} className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">{c.name}</span>
                <span className="font-mono text-foreground">{c.value} — {c.signal}</span>
              </div>
              <div className="h-1 w-full rounded-full bg-muted">
                <div className={cn("h-full rounded-full", barColor)}
                  style={{ width: `${c.value}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <FearGreedMiniChart history={history} />
    </div>
  );
}

// ─── Section 4: Sector Rotation ───────────────────────────────────────────────

type PerfPeriod = "1D" | "1W" | "1M" | "3M";

function SectorPerfBar({ value, maxAbs }: { value: number; maxAbs: number }) {
  const pct = maxAbs > 0 ? (Math.abs(value) / maxAbs) * 50 : 0;
  const isUp = value >= 0;
  return (
    <div className="flex items-center gap-1 flex-1">
      {/* left (negative) side */}
      <div className="flex-1 h-2 flex justify-end">
        {!isUp && (
          <div className="bg-red-500 h-full rounded-l-sm" style={{ width: `${pct}%` }} />
        )}
      </div>
      {/* center line */}
      <div className="w-px h-3 bg-border shrink-0" />
      {/* right (positive) side */}
      <div className="flex-1 h-2">
        {isUp && (
          <div className="bg-emerald-500 h-full rounded-r-sm" style={{ width: `${pct}%` }} />
        )}
      </div>
    </div>
  );
}

function SectorHeatmapGrid({ sectors, period }: { sectors: SectorData[]; period: PerfPeriod }) {
  const perfKey: keyof SectorData = period === "1D" ? "perf1D"
    : period === "1W" ? "perf1W"
    : period === "1M" ? "perf1M" : "perf3M";

  const vals = sectors.map((s) => s[perfKey] as number);
  const maxAbs = Math.max(...vals.map(Math.abs), 0.01);

  return (
    <div className="grid grid-cols-4 gap-0.5">
      {sectors.map((s) => {
        const v = s[perfKey] as number;
        const intensity = Math.min(Math.abs(v) / maxAbs, 1);
        const bg = v >= 0
          ? `rgba(34,197,94,${0.15 + intensity * 0.5})`
          : `rgba(239,68,68,${0.15 + intensity * 0.5})`;
        return (
          <div key={s.abbr}
            className="rounded px-1 py-1 text-center"
            style={{ background: bg }}>
            <div className="text-[9px] font-semibold text-foreground">{s.abbr}</div>
            <div className={cn("text-[9px] font-mono", v >= 0 ? "text-emerald-300" : "text-red-300")}>
              {v >= 0 ? "+" : ""}{v.toFixed(1)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectorRotationSection({ seed }: { seed: number }) {
  const [period, setPeriod] = useState<PerfPeriod>("1D");
  const sectors = useMemo(() => buildSectors(seed), [seed]);

  const perfKey: keyof SectorData = period === "1D" ? "perf1D"
    : period === "1W" ? "perf1W"
    : period === "1M" ? "perf1M" : "perf3M";

  const sorted = useMemo(() =>
    [...sectors].sort((a, b) => (b[perfKey] as number) - (a[perfKey] as number)),
    [sectors, perfKey]
  );

  const maxAbs = Math.max(...sorted.map((s) => Math.abs(s[perfKey] as number)), 0.01);
  const inflowSectors = sectors.filter((s) => s.inflow !== "outflow").map((s) => s.abbr).slice(0, 3);

  return (
    <div>
      <SectionHeader title="Sector Rotation" />
      {/* Period toggle */}
      <div className="flex gap-1 mb-3">
        {(["1D", "1W", "1M", "3M"] as PerfPeriod[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={cn("text-[10px] px-2 py-0.5 rounded font-mono transition-colors",
              period === p
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
            {p}
          </button>
        ))}
      </div>
      {/* Mini bar chart */}
      <div className="space-y-0.5 mb-3">
        {sorted.map((s) => {
          const v = s[perfKey] as number;
          return (
            <div key={s.abbr} className="flex items-center gap-2">
              <span className="text-[10px] font-mono w-12 text-muted-foreground shrink-0">{s.abbr}</span>
              <SectorPerfBar value={v} maxAbs={maxAbs} />
              <span className={cn("text-[10px] font-mono w-10 text-right tabular-nums shrink-0",
                v >= 0 ? "text-emerald-400" : "text-red-400")}>
                {v >= 0 ? "+" : ""}{v.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
      {/* Heatmap grid */}
      <div className="mb-2">
        <p className="text-[10px] text-muted-foreground mb-1.5">Performance Heatmap ({period})</p>
        <SectorHeatmapGrid sectors={sectors} period={period} />
      </div>
      {/* Money flow */}
      <div className="pt-2 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground">
          Inflows today:{" "}
          <span className="text-emerald-400 font-mono">{inflowSectors.join(", ")}</span>
        </p>
      </div>
    </div>
  );
}

// ─── Section 5: Volatility Dashboard ─────────────────────────────────────────

function VixTermStructureChart({ data }: { data: VixTermStructure }) {
  const labels = ["Spot", "M1", "M2", "M3"];
  const values = [data.spot, data.m1, data.m2, data.m3];
  const w = 200, h = 60, padLeft = 24, padBottom = 16, padRight = 8, padTop = 8;
  const innerW = w - padLeft - padRight;
  const innerH = h - padTop - padBottom;
  const minV = Math.min(...values) - 1;
  const maxV = Math.max(...values) + 1;

  const pts = values.map((v, i) => {
    const x = padLeft + (i / (values.length - 1)) * innerW;
    const y = padTop + innerH - ((v - minV) / (maxV - minV)) * innerH;
    return { x, y, v };
  });

  const pathD = "M " + pts.map((p) => `${p.x},${p.y}`).join(" L ");
  const contango = data.m3 > data.spot;
  const lineColor = contango ? "#22c55e" : "#ef4444";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 60 }}>
      {/* Grid */}
      {[0, 0.5, 1].map((t, i) => {
        const y = padTop + t * innerH;
        const val = maxV - t * (maxV - minV);
        return (
          <g key={i}>
            <line x1={padLeft} y1={y} x2={w - padRight} y2={y}
              stroke="#1e293b" strokeWidth={0.5} />
            <text x={padLeft - 2} y={y + 3} textAnchor="end" fontSize="7" fill="#64748b">
              {val.toFixed(0)}
            </text>
          </g>
        );
      })}
      <path d={pathD} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill={lineColor} />
          <text x={p.x} y={h - 2} textAnchor="middle" fontSize="7.5" fill="#94a3b8">
            {labels[i]}
          </text>
          <text x={p.x} y={p.y - 5} textAnchor="middle" fontSize="7" fill={lineColor}>
            {p.v.toFixed(1)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function VolRegimeBadge({ vix }: { vix: number }) {
  if (vix < 15) return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">Low Regime</span>;
  if (vix < 25) return <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-semibold">Normal Regime</span>;
  if (vix < 35) return <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold">Elevated Regime</span>;
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">Crisis Regime</span>;
}

function VolatilitySection({ seed }: { seed: number }) {
  const data = useMemo(() => buildVixTermStructure(seed), [seed]);
  const volRich = data.spot > data.hv30 * 1.1;
  const vvixHigh = data.vvix > 110;
  const contango = data.m3 > data.spot;

  return (
    <div>
      <SectionHeader title="Volatility Dashboard" />
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="font-mono text-xl font-bold text-foreground">{data.spot.toFixed(2)}</span>
          <span className="text-[10px] text-muted-foreground ml-1">VIX</span>
        </div>
        <VolRegimeBadge vix={data.spot} />
      </div>
      {/* Term structure chart */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-muted-foreground">VIX Term Structure</p>
          <span className={cn("text-[10px] font-mono", contango ? "text-emerald-400" : "text-red-400")}>
            {contango ? "Contango" : "Backwardation"}
          </span>
        </div>
        <VixTermStructureChart data={data} />
      </div>
      {/* VIX vs HV30 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-muted/50 rounded p-2">
          <p className="text-[10px] text-muted-foreground">HV30</p>
          <p className="font-mono text-sm font-semibold">{data.hv30.toFixed(1)}</p>
        </div>
        <div className={cn("rounded p-2", volRich ? "bg-red-500/10" : "bg-emerald-500/10")}>
          <p className="text-[10px] text-muted-foreground">Vol</p>
          <p className={cn("font-mono text-sm font-semibold", volRich ? "text-red-400" : "text-emerald-400")}>
            {volRich ? "Rich" : "Cheap"}
          </p>
        </div>
        <div className={cn("rounded p-2", vvixHigh ? "bg-orange-500/10" : "bg-muted/50")}>
          <p className="text-[10px] text-muted-foreground">VVIX</p>
          <p className={cn("font-mono text-sm font-semibold", vvixHigh ? "text-orange-400" : "text-foreground")}>
            {data.vvix.toFixed(0)}
          </p>
        </div>
      </div>
      {/* Vol ratio bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>IV/HV Ratio</span>
          <span className="font-mono">{(data.spot / data.hv30).toFixed(2)}x</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div className={cn("h-full rounded-full", volRich ? "bg-red-500" : "bg-emerald-500")}
            style={{ width: `${Math.min(100, (data.spot / data.hv30) * 50)}%` }} />
        </div>
      </div>
      {vvixHigh && (
        <div className="mt-2 px-2 py-1.5 rounded bg-orange-500/10 border border-orange-500/20">
          <p className="text-[10px] text-orange-400">VVIX elevated — unstable vol regime</p>
        </div>
      )}
    </div>
  );
}

// ─── Section 6: Cross-Asset Correlation ──────────────────────────────────────

function CorrCell({ value, i, j }: { value: number; i: number; j: number }) {
  const isDiag = i === j;
  if (isDiag) return (
    <div className="aspect-square rounded text-center flex items-center justify-center bg-muted/30">
      <span className="text-[9px] font-mono text-muted-foreground">1.00</span>
    </div>
  );
  const intensity = Math.abs(value);
  const bg = value > 0
    ? `rgba(34,197,94,${0.1 + intensity * 0.6})`
    : `rgba(239,68,68,${0.1 + intensity * 0.6})`;
  return (
    <div className="aspect-square rounded text-center flex items-center justify-center"
      style={{ background: bg }}>
      <span className={cn("text-[9px] font-mono",
        value > 0 ? "text-emerald-200" : "text-red-200")}>
        {value.toFixed(2)}
      </span>
    </div>
  );
}

function CorrelationSection({ seed }: { seed: number }) {
  const matrix = useMemo(() => buildCorrelationMatrix(seed), [seed]);

  // Determine regime
  const spyTlt = matrix[0][1]; // SPY vs TLT
  const spyGld = matrix[0][2]; // SPY vs GLD
  const riskOn = spyTlt < -0.2 && spyGld < 0;
  const riskOff = spyTlt > 0.2 || spyGld > 0.3;

  // Detect broken correlations
  const brokenPairs: string[] = [];
  if (Math.abs(spyTlt) < 0.1) brokenPairs.push("SPY/TLT decoupling");
  if (matrix[0][5] > 0.5) brokenPairs.push("SPY-BTC high corr");
  if (matrix[2][3] > 0.5) brokenPairs.push("GLD-OIL convergence");

  return (
    <div>
      <SectionHeader title="Cross-Asset Correlations" />
      {/* Regime badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold",
          riskOn ? "bg-emerald-500/20 text-emerald-400"
            : riskOff ? "bg-amber-500/20 text-amber-400"
            : "bg-muted text-muted-foreground")}>
          {riskOn ? "Risk-On" : riskOff ? "Risk-Off" : "Mixed Signals"}
        </span>
        <span className="text-[10px] text-muted-foreground">
          SPY/TLT: <span className="font-mono text-foreground">{spyTlt.toFixed(2)}</span>
        </span>
      </div>
      {/* Correlation heatmap */}
      <div className="mb-2">
        {/* Header row */}
        <div className="grid gap-0.5 mb-0.5" style={{ gridTemplateColumns: `auto repeat(${CORR_ASSETS.length}, 1fr)` }}>
          <div />
          {CORR_ASSETS.map((a) => (
            <div key={a} className="text-center">
              <span className="text-[8px] font-mono text-muted-foreground">{a}</span>
            </div>
          ))}
        </div>
        {/* Data rows */}
        {CORR_ASSETS.map((rowAsset, i) => (
          <div key={rowAsset} className="grid gap-0.5 mb-0.5"
            style={{ gridTemplateColumns: `auto repeat(${CORR_ASSETS.length}, 1fr)` }}>
            <div className="flex items-center pr-1">
              <span className="text-[8px] font-mono text-muted-foreground w-7">{rowAsset}</span>
            </div>
            {CORR_ASSETS.map((_, j) => (
              <CorrCell key={j} value={matrix[i][j]} i={i} j={j} />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: "rgba(34,197,94,0.6)" }} />
          <span className="text-[9px] text-muted-foreground">Positive</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: "rgba(239,68,68,0.6)" }} />
          <span className="text-[9px] text-muted-foreground">Negative</span>
        </div>
      </div>
      {/* Divergence alerts */}
      {brokenPairs.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground font-semibold">Correlation Breaks</p>
          {brokenPairs.map((pair) => (
            <div key={pair} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-[10px] text-amber-400">{pair}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab Navigation ───────────────────────────────────────────────────────────

type TabId = "ticker" | "breadth" | "feargreed" | "sectors" | "volatility" | "correlation";

interface Tab {
  id: TabId;
  label: string;
  shortLabel: string;
}

const TABS: Tab[] = [
  { id: "ticker",      label: "Live Ticker",    shortLabel: "Ticker" },
  { id: "breadth",     label: "Breadth",        shortLabel: "Breadth" },
  { id: "feargreed",   label: "Fear & Greed",   shortLabel: "F&G" },
  { id: "sectors",     label: "Sectors",        shortLabel: "Sectors" },
  { id: "volatility",  label: "Volatility",     shortLabel: "Vol" },
  { id: "correlation", label: "Correlations",   shortLabel: "Corr" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MarketPulseWidget() {
  const [activeTab, setActiveTab] = useState<TabId>("ticker");
  const [tick, setTick] = useState(0);
  const [assets, setAssets] = useState<TickerAsset[]>(() => {
    const timeSeed = Math.floor(Date.now() / 2000);
    return buildInitialPrices(timeSeed);
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const tickRef = useRef(0);

  // Ticker live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSeed = Math.floor(Date.now() / 2000);
      tickRef.current = timeSeed;
      setTick(timeSeed);
      setAssets((prev) => perturbPrices(prev, timeSeed));
      setLastUpdated(new Date());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Clear flash after 400ms
  useEffect(() => {
    const t = setTimeout(() => {
      setAssets((prev) => prev.map((a) => ({ ...a, flash: null })));
    }, 400);
    return () => clearTimeout(t);
  }, [tick]);

  // Slow-changing seed for breadth/sentiment/sectors (changes every 10s)
  const slowSeed = useMemo(() => Math.floor(Date.now() / 10000), []);

  const timeStr = lastUpdated.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });

  return (
    <div className="bg-[#0d1117] border border-[#21262d] rounded-xl overflow-hidden flex flex-col"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#21262d] bg-[#161b22]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <span className="text-[11px] font-semibold text-[#e6edf3] tracking-wider uppercase">
            Market Pulse Terminal
          </span>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
          </motion.div>
          <span className="text-[10px] text-[#8b949e] font-mono">{timeStr}</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[#21262d] bg-[#161b22] overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-2 text-[10px] font-mono whitespace-nowrap transition-colors shrink-0",
              activeTab === tab.id
                ? "text-[#e6edf3] border-b-2 border-blue-500 -mb-px bg-[#0d1117]"
                : "text-[#8b949e] hover:text-[#c9d1d9]",
            )}
          >
            {tab.shortLabel}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "ticker" && <LiveTickerSection assets={assets} />}
            {activeTab === "breadth" && <MarketBreadthSection seed={slowSeed} />}
            {activeTab === "feargreed" && <FearGreedSection seed={slowSeed} />}
            {activeTab === "sectors" && <SectorRotationSection seed={slowSeed} />}
            {activeTab === "volatility" && <VolatilitySection seed={slowSeed} />}
            {activeTab === "correlation" && <CorrelationSection seed={slowSeed} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-[#21262d] bg-[#161b22] flex items-center justify-between">
        <span className="text-[9px] text-[#8b949e] font-mono">Simulated data — educational use only</span>
        <span className="text-[9px] text-[#8b949e] font-mono">FinSim v2</span>
      </div>
    </div>
  );
}
