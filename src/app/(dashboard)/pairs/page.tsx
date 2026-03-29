"use client";

import { useState, useMemo, useCallback } from "react";
import { GitCompare, TrendingUp, TrendingDown, Minus, BookOpen, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PairDef {
  tickerA: string;
  tickerB: string;
  correlation: number;
  cointegPValue: number;
  basePriceA: number;
  basePriceB: number;
  seed: number;
}

interface SpreadPoint {
  idx: number;
  spread: number;
}

interface TradeLog {
  id: number;
  openBar: number;
  closeBar: number | null;
  direction: "long_a" | "long_b";
  entryZ: number;
  exitZ: number | null;
  pnl: number | null;
  open: boolean;
}

// ─── Pre-defined pairs ───────────────────────────────────────────────────────

const PAIRS: PairDef[] = [
  { tickerA: "AAPL",  tickerB: "MSFT", correlation: 0.91, cointegPValue: 0.023, basePriceA: 213,  basePriceB: 415,  seed: 1001 },
  { tickerA: "GOOG",  tickerB: "META", correlation: 0.87, cointegPValue: 0.041, basePriceA: 178,  basePriceB: 568,  seed: 1002 },
  { tickerA: "QQQ",   tickerB: "SPY",  correlation: 0.96, cointegPValue: 0.008, basePriceA: 468,  basePriceB: 548,  seed: 1003 },
  { tickerA: "NVDA",  tickerB: "AMD",  correlation: 0.83, cointegPValue: 0.067, basePriceA: 870,  basePriceB: 165,  seed: 1004 },
  { tickerA: "AMZN",  tickerB: "GOOG", correlation: 0.85, cointegPValue: 0.034, basePriceA: 204,  basePriceB: 178,  seed: 1005 },
  { tickerA: "JPM",   tickerB: "MSFT", correlation: 0.81, cointegPValue: 0.089, basePriceA: 225,  basePriceB: 415,  seed: 1006 },
];

// ─── Seeded PRNG (mulberry32) ─────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Generate 252 synthetic daily prices for a ticker ────────────────────────

function generatePrices(basePrice: number, seed: number, count = 252): number[] {
  const rand = mulberry32(seed);
  const prices: number[] = [basePrice];
  for (let i = 1; i < count; i++) {
    const r = rand();
    const drift = (r - 0.49) * 0.028;
    prices.push(Math.max(prices[i - 1] * (1 + drift), 1));
  }
  return prices;
}

// ─── OLS regression: returns {beta, alpha} ───────────────────────────────────

function olsRegression(y: number[], x: number[]): { beta: number; alpha: number } {
  const n = y.length;
  let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXX += x[i] * x[i];
    sumXY += x[i] * y[i];
  }
  const beta = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const alpha = (sumY - beta * sumX) / n;
  return { beta, alpha };
}

// ─── Compute spread series and z-score ───────────────────────────────────────

function computeSpread(pricesA: number[], pricesB: number[], beta: number, alpha: number): number[] {
  return pricesA.map((a, i) => a - beta * pricesB[i] - alpha);
}

function computeZScore(spread: number[]): number[] {
  const n = spread.length;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += spread[i];
  const mean = sum / n;
  let sumSq = 0;
  for (let i = 0; i < n; i++) sumSq += (spread[i] - mean) ** 2;
  const std = Math.sqrt(sumSq / n) || 1;
  return spread.map(v => (v - mean) / std);
}

// ─── Rolling correlation (60-day window) ─────────────────────────────────────

function rollingCorrelation(a: number[], b: number[], window = 60): number[] {
  const result: number[] = [];
  for (let i = 0; i < a.length; i++) {
    if (i < window - 1) { result.push(NaN); continue; }
    const sliceA = a.slice(i - window + 1, i + 1);
    const sliceB = b.slice(i - window + 1, i + 1);
    const meanA = sliceA.reduce((s, v) => s + v, 0) / window;
    const meanB = sliceB.reduce((s, v) => s + v, 0) / window;
    let num = 0, dA = 0, dB = 0;
    for (let j = 0; j < window; j++) {
      const da = sliceA[j] - meanA;
      const db = sliceB[j] - meanB;
      num += da * db;
      dA += da * da;
      dB += db * db;
    }
    const denom = Math.sqrt(dA * dB);
    result.push(denom === 0 ? 0 : num / denom);
  }
  return result;
}

// ─── Z-score color helper ─────────────────────────────────────────────────────

function zColor(z: number) {
  const abs = Math.abs(z);
  if (abs >= 2) return z > 0 ? "text-green-400" : "text-red-400";
  if (abs < 0.5) return "text-muted-foreground";
  return "text-amber-400";
}

function zBg(z: number) {
  const abs = Math.abs(z);
  if (abs >= 2) return z > 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30";
  if (abs < 0.5) return "bg-muted/30 border-border/30";
  return "bg-amber-500/10 border-amber-500/30";
}

// ─── SVG helpers ─────────────────────────────────────────────────────────────

function toSvgPoints(data: number[], w: number, h: number, padX = 0, padY = 8): string {
  if (data.length < 2) return "";
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = padX + (i / (data.length - 1)) * (w - padX * 2);
      const y = padY + (1 - (v - min) / range) * (h - padY * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function toSvgPath(points: string): string {
  const pts = points.split(" ").map(p => p.split(",").map(Number));
  if (pts.length < 2) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
}

// ─── Mini spread sparkline for Pair Finder ───────────────────────────────────

function SpreadSparkline({ zScores }: { zScores: number[] }) {
  const W = 160, H = 40;
  const points = toSvgPoints(zScores, W, H, 2, 4);
  const path = toSvgPath(points);
  // zero line
  const min = Math.min(...zScores);
  const max = Math.max(...zScores);
  const range = max - min || 1;
  const zeroY = 4 + (1 - (0 - min) / range) * (H - 8);
  return (
    <svg width={W} height={H} className="overflow-visible">
      <line x1={2} y1={zeroY} x2={W - 2} y2={zeroY} stroke="var(--color-border)" strokeWidth={0.5} strokeDasharray="2,2" />
      <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth={1.5} />
    </svg>
  );
}

// ─── Large SVG spread chart with bands ───────────────────────────────────────

function SpreadChart({
  spread,
  zScores,
  label,
}: {
  spread: number[];
  zScores: number[];
  label: string;
}) {
  const W = 700, H = 200;
  const padX = 48, padY = 16;

  const min = Math.min(...spread);
  const max = Math.max(...spread);
  const range = max - min || 1;
  const mean = spread.reduce((s, v) => s + v, 0) / spread.length;
  const std = Math.sqrt(spread.reduce((s, v) => s + (v - mean) ** 2, 0) / spread.length) || 1;

  function yPos(v: number) {
    return padY + (1 - (v - min) / range) * (H - padY * 2);
  }

  const points = spread
    .map((v, i) => {
      const x = padX + (i / (spread.length - 1)) * (W - padX * 2);
      const y = yPos(v);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const path = toSvgPath(points);
  const meanY = yPos(mean);
  const p1Y = yPos(mean + std);
  const m1Y = yPos(mean - std);
  const p2Y = yPos(mean + 2 * std);
  const m2Y = yPos(mean - 2 * std);

  const xRight = padX + (W - padX * 2);

  const currentZ = zScores[zScores.length - 1] ?? 0;
  const signal =
    currentZ >= 2 ? "Short A / Long B" :
    currentZ <= -2 ? "Long A / Short B" :
    "Neutral";
  const signalColor =
    currentZ >= 2 ? "#4ade80" :
    currentZ <= -2 ? "#f87171" :
    "var(--color-muted-foreground)";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label} Spread (Price_A - β × Price_B)</span>
        <span style={{ color: signalColor }} className="font-semibold">
          Signal: {signal} | Z = {currentZ.toFixed(2)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[180px] overflow-visible">
        {/* ±2σ band */}
        <rect x={padX} y={Math.min(p2Y, m2Y)} width={W - padX * 2} height={Math.abs(m2Y - p2Y)} fill="rgba(239,68,68,0.05)" />
        {/* ±1σ band */}
        <rect x={padX} y={Math.min(p1Y, m1Y)} width={W - padX * 2} height={Math.abs(m1Y - p1Y)} fill="rgba(168,85,247,0.07)" />
        {/* Band lines */}
        {[
          { y: p2Y, label: "+2σ", color: "#ef4444" },
          { y: p1Y, label: "+1σ", color: "#a855f7" },
          { y: meanY, label: "μ",   color: "#6b7280" },
          { y: m1Y,  label: "-1σ", color: "#a855f7" },
          { y: m2Y,  label: "-2σ", color: "#ef4444" },
        ].map(({ y, label: lbl, color }) => (
          <g key={lbl}>
            <line x1={padX} y1={y} x2={xRight} y2={y} stroke={color} strokeWidth={0.8} strokeDasharray="4,3" opacity={0.6} />
            <text x={padX - 4} y={y + 4} fill={color} fontSize={9} textAnchor="end" fontFamily="monospace">{lbl}</text>
          </g>
        ))}
        {/* Spread line */}
        <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth={1.5} />
        {/* Axes */}
        <line x1={padX} y1={padY} x2={padX} y2={H - padY} stroke="var(--color-border)" strokeWidth={0.5} />
        <line x1={padX} y1={H - padY} x2={xRight} y2={H - padY} stroke="var(--color-border)" strokeWidth={0.5} />
        {/* X labels */}
        {[0, 63, 126, 189, 251].map(idx => (
          <text key={idx} x={padX + (idx / 251) * (W - padX * 2)} y={H - padY + 11} fill="var(--color-muted-foreground)" fontSize={8} textAnchor="middle" fontFamily="monospace">
            {idx === 0 ? "-252d" : idx === 251 ? "Now" : `-${252 - idx}d`}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── Rolling correlation chart ────────────────────────────────────────────────

function RollingCorrChart({ corr }: { corr: number[] }) {
  const W = 700, H = 120;
  const padX = 32, padY = 12;
  const valid = corr.filter(v => !isNaN(v));
  if (valid.length < 2) return null;

  const minV = Math.min(...valid, -1);
  const maxV = Math.max(...valid, 1);
  const range = maxV - minV || 1;

  function yPos(v: number) {
    return padY + (1 - (v - minV) / range) * (H - padY * 2);
  }

  const points = corr
    .map((v, i) => {
      if (isNaN(v)) return null;
      const x = padX + (i / (corr.length - 1)) * (W - padX * 2);
      return `${x.toFixed(1)},${yPos(v).toFixed(1)}`;
    })
    .filter(Boolean)
    .join(" ");

  const path = toSvgPath(points);
  const y08 = yPos(0.8);
  const y00 = yPos(0);
  const xRight = padX + (W - padX * 2);

  return (
    <div className="space-y-2">
      <span className="text-xs text-muted-foreground">Rolling 60-Day Correlation</span>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[100px] overflow-visible">
        <rect x={padX} y={padY} width={W - padX * 2} height={y08 - padY} fill="rgba(74,222,128,0.04)" />
        <line x1={padX} y1={y08} x2={xRight} y2={y08} stroke="#4ade80" strokeWidth={0.7} strokeDasharray="3,3" opacity={0.5} />
        <text x={padX - 4} y={y08 + 3} fill="#4ade80" fontSize={8} textAnchor="end">0.8</text>
        <line x1={padX} y1={y00} x2={xRight} y2={y00} stroke="var(--color-border)" strokeWidth={0.5} strokeDasharray="2,2" />
        <text x={padX - 4} y={y00 + 3} fill="var(--color-muted-foreground)" fontSize={8} textAnchor="end">0</text>
        <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth={1.5} />
        <line x1={padX} y1={padY} x2={padX} y2={H - padY} stroke="var(--color-border)" strokeWidth={0.5} />
        <line x1={padX} y1={H - padY} x2={xRight} y2={H - padY} stroke="var(--color-border)" strokeWidth={0.5} />
      </svg>
    </div>
  );
}

// ─── Z-score chart for trade log ─────────────────────────────────────────────

function ZScoreChart({ zScores }: { zScores: number[] }) {
  const W = 700, H = 120;
  const padX = 32, padY = 12;

  function yPos(v: number) {
    const minV = -3.5, maxV = 3.5, range = maxV - minV;
    return padY + (1 - (v - minV) / range) * (H - padY * 2);
  }

  const points = zScores
    .map((v, i) => {
      const x = padX + (i / (zScores.length - 1)) * (W - padX * 2);
      return `${x.toFixed(1)},${yPos(v).toFixed(1)}`;
    })
    .join(" ");

  const path = toSvgPath(points);
  const xRight = padX + (W - padX * 2);

  return (
    <div className="space-y-2">
      <span className="text-xs text-muted-foreground">Z-Score History</span>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[100px] overflow-visible">
        {[2, 1, 0, -1, -2].map(v => {
          const y = yPos(v);
          const color = Math.abs(v) === 2 ? "#ef4444" : Math.abs(v) === 1 ? "#a855f7" : "#6b7280";
          return (
            <g key={v}>
              <line x1={padX} y1={y} x2={xRight} y2={y} stroke={color} strokeWidth={0.7} strokeDasharray="3,3" opacity={0.6} />
              <text x={padX - 4} y={y + 3} fill={color} fontSize={8} textAnchor="end">{v > 0 ? `+${v}` : v}</text>
            </g>
          );
        })}
        {/* Shade entry zones */}
        <rect x={padX} y={padY} width={W - padX * 2} height={yPos(2) - padY} fill="rgba(74,222,128,0.05)" />
        <rect x={padX} y={yPos(-2)} width={W - padX * 2} height={H - padY - yPos(-2)} fill="rgba(239,68,68,0.05)" />
        <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth={1.5} />
        <line x1={padX} y1={padY} x2={padX} y2={H - padY} stroke="var(--color-border)" strokeWidth={0.5} />
        <line x1={padX} y1={H - padY} x2={xRight} y2={H - padY} stroke="var(--color-border)" strokeWidth={0.5} />
      </svg>
    </div>
  );
}

// ─── Tab nav ──────────────────────────────────────────────────────────────────

type TabId = "finder" | "analysis" | "trade" | "education";

const TABS: { id: TabId; label: string }[] = [
  { id: "finder",    label: "Pair Finder" },
  { id: "analysis",  label: "Spread Analysis" },
  { id: "trade",     label: "Trade the Spread" },
  { id: "education", label: "Education" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PairsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("finder");
  const [selectedPair, setSelectedPair] = useState<PairDef>(PAIRS[0]);
  const [tickerA, setTickerA] = useState("AAPL");
  const [tickerB, setTickerB] = useState("MSFT");
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>([]);
  const [tradeIdCounter, setTradeIdCounter] = useState(1);
  const [totalPnl, setTotalPnl] = useState(0);

  const TICKERS = ["AAPL", "MSFT", "GOOG", "META", "NVDA", "AMZN", "QQQ", "SPY", "JPM", "TSLA"];

  // ── Pair Finder: compute per-pair z-scores ──────────────────────────────────

  const pairData = useMemo(() => {
    return PAIRS.map(pair => {
      const pA = generatePrices(pair.basePriceA, pair.seed);
      const pB = generatePrices(pair.basePriceB, pair.seed + 100);
      const { beta, alpha } = olsRegression(pA, pB);
      const spread = computeSpread(pA, pB, beta, alpha);
      const zScores = computeZScore(spread);
      const currentZ = zScores[zScores.length - 1];
      return { pair, zScores, currentZ };
    });
  }, []);

  // ── Spread Analysis: computed from tickerA / tickerB ────────────────────────

  const BASE_PRICES: Record<string, number> = useMemo(() => ({
    AAPL: 213, MSFT: 415, GOOG: 178, META: 568, NVDA: 870,
    AMZN: 204, QQQ: 468, SPY: 548, JPM: 225, TSLA: 248,
  }), []);

  function tickerSeed(t: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h;
  }

  const analysisData = useMemo(() => {
    const pA = generatePrices(BASE_PRICES[tickerA] ?? 100, tickerSeed(tickerA));
    const pB = generatePrices(BASE_PRICES[tickerB] ?? 100, tickerSeed(tickerB));
    const { beta, alpha } = olsRegression(pA, pB);
    const spread = computeSpread(pA, pB, beta, alpha);
    const zScores = computeZScore(spread);
    const corr = rollingCorrelation(pA, pB, 60);
    const currentZ = zScores[zScores.length - 1];
    const signal =
      currentZ >= 2 ? "Long A / Short B" :
      currentZ <= -2 ? "Short A / Long B" :
      "Neutral";
    // Full correlation over period
    const fullCorr = (() => {
      const meanA = pA.reduce((s, v) => s + v, 0) / pA.length;
      const meanB = pB.reduce((s, v) => s + v, 0) / pB.length;
      let num = 0, dA = 0, dB = 0;
      for (let i = 0; i < pA.length; i++) {
        num += (pA[i] - meanA) * (pB[i] - meanB);
        dA += (pA[i] - meanA) ** 2;
        dB += (pB[i] - meanB) ** 2;
      }
      return dA * dB === 0 ? 0 : num / Math.sqrt(dA * dB);
    })();
    return { pA, pB, beta, alpha, spread, zScores, corr, currentZ, signal, fullCorr };
  }, [tickerA, tickerB, BASE_PRICES]);

  // ── Trade actions ───────────────────────────────────────────────────────────

  const { zScores: tradeZ } = analysisData;

  const openTrades = tradeLogs.filter(t => t.open);
  const closedTrades = tradeLogs.filter(t => !t.open);

  const currentZ = tradeZ[tradeZ.length - 1] ?? 0;
  const canEnter = Math.abs(currentZ) >= 2 && openTrades.length === 0;
  const canExit = openTrades.length > 0 && Math.abs(currentZ) < 0.5;

  const handleEnter = useCallback(() => {
    if (!canEnter) return;
    const direction: TradeLog["direction"] = currentZ >= 2 ? "long_a" : "long_b";
    const newTrade: TradeLog = {
      id: tradeIdCounter,
      openBar: tradeZ.length - 1,
      closeBar: null,
      direction,
      entryZ: currentZ,
      exitZ: null,
      pnl: null,
      open: true,
    };
    setTradeLogs(prev => [newTrade, ...prev]);
    setTradeIdCounter(c => c + 1);
  }, [canEnter, currentZ, tradeIdCounter, tradeZ.length]);

  const handleExit = useCallback(() => {
    if (!canExit) return;
    setTradeLogs(prev => {
      return prev.map(t => {
        if (!t.open) return t;
        // P&L: enter at z=entryZ, exit at z=currentZ; mean reversion profit ≈ (|entryZ| - |currentZ|) × 100
        const pnl = (Math.abs(t.entryZ) - Math.abs(currentZ)) * 100 * (t.direction === "long_a" ? 1 : -1) * -1;
        // Simpler: profit when z reverts to 0
        const realPnl = Math.abs(t.entryZ) * 100 - Math.abs(currentZ) * 100;
        const signedPnl = t.direction === "long_a" ? (t.entryZ > 0 ? realPnl : -realPnl) : (t.entryZ < 0 ? realPnl : -realPnl);
        setTotalPnl(p => p + signedPnl);
        return { ...t, open: false, closeBar: tradeZ.length - 1, exitZ: currentZ, pnl: signedPnl };
      });
    });
  }, [canExit, currentZ, tradeZ.length]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 shrink-0">
        <GitCompare className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-base font-semibold">Pairs Trading</h1>
          <p className="text-xs text-muted-foreground">Statistical arbitrage via mean-reverting spreads</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-border/50 shrink-0 px-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Tab 1: Pair Finder ───────────────────────────────────────────────── */}
        {activeTab === "finder" && (
          <div className="p-6 space-y-4">
            <div className="grid gap-3">
              {pairData.map(({ pair, zScores, currentZ }) => {
                const abs = Math.abs(currentZ);
                const signalLabel =
                  currentZ >= 2 ? "Short A / Long B" :
                  currentZ <= -2 ? "Long A / Short B" :
                  abs < 0.5 ? "Neutral" : "Watch";
                return (
                  <div
                    key={`${pair.tickerA}-${pair.tickerB}`}
                    className={cn(
                      "rounded-lg border p-4 cursor-pointer transition-all hover:border-primary/40",
                      zBg(currentZ),
                    )}
                    onClick={() => {
                      setTickerA(pair.tickerA);
                      setTickerB(pair.tickerB);
                      setActiveTab("analysis");
                    }}
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Pair label */}
                      <div className="w-28">
                        <span className="text-sm font-bold text-foreground">{pair.tickerA}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-sm font-bold text-foreground">{pair.tickerB}</span>
                      </div>

                      {/* Stats chips */}
                      <div className="flex gap-3 flex-wrap flex-1 text-xs">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Correlation</span>
                          <span className="font-semibold text-foreground">{pair.correlation.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Coint. p-val</span>
                          <span className={cn("font-semibold", pair.cointegPValue < 0.05 ? "text-green-400" : "text-amber-400")}>
                            {pair.cointegPValue.toFixed(3)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Current Z</span>
                          <span className={cn("font-semibold tabular-nums", zColor(currentZ))}>
                            {currentZ > 0 ? "+" : ""}{currentZ.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Signal</span>
                          <span className={cn("font-semibold", zColor(currentZ))}>{signalLabel}</span>
                        </div>
                      </div>

                      {/* Sparkline */}
                      <div className="shrink-0">
                        <SpreadSparkline zScores={zScores} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center pt-2">
              Click any pair to open in Spread Analysis. Z-score: green = short A / long B opportunity; red = long A / short B opportunity.
            </p>
          </div>
        )}

        {/* ── Tab 2: Spread Analysis ───────────────────────────────────────────── */}
        {activeTab === "analysis" && (
          <div className="p-6 space-y-6">
            {/* Ticker selectors */}
            <div className="flex gap-4 items-end flex-wrap">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Ticker A (Long leg)</label>
                <select
                  value={tickerA}
                  onChange={e => setTickerA(e.target.value)}
                  className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {TICKERS.filter(t => t !== tickerB).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Ticker B (Short leg)</label>
                <select
                  value={tickerB}
                  onChange={e => setTickerB(e.target.value)}
                  className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {TICKERS.filter(t => t !== tickerA).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-6 text-sm ml-4">
                <div>
                  <div className="text-muted-foreground text-xs">Hedge Ratio (β)</div>
                  <div className="font-mono font-semibold">{analysisData.beta.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Intercept (α)</div>
                  <div className="font-mono font-semibold">{analysisData.alpha.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">252d Correlation</div>
                  <div className={cn("font-mono font-semibold", analysisData.fullCorr >= 0.8 ? "text-green-400" : "text-amber-400")}>
                    {analysisData.fullCorr.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Current Z</div>
                  <div className={cn("font-mono font-semibold tabular-nums", zColor(analysisData.currentZ))}>
                    {analysisData.currentZ > 0 ? "+" : ""}{analysisData.currentZ.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Signal banner */}
            <div className={cn("rounded-lg border px-4 py-3 flex items-center gap-3", zBg(analysisData.currentZ))}>
              {Math.abs(analysisData.currentZ) >= 2 ? (
                analysisData.currentZ > 0 ? <TrendingDown className="h-4 w-4 text-green-400" /> : <TrendingUp className="h-4 w-4 text-red-400" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <span className={cn("font-semibold text-sm", zColor(analysisData.currentZ))}>
                  Current Signal: {analysisData.signal}
                </span>
                <span className="text-xs text-muted-foreground ml-3">
                  {Math.abs(analysisData.currentZ) >= 2
                    ? "Spread is extended — mean reversion expected"
                    : Math.abs(analysisData.currentZ) < 0.5
                    ? "Spread is near equilibrium — no actionable setup"
                    : "Spread drifting — wait for |Z| > 2 to enter"}
                </span>
              </div>
            </div>

            {/* Spread chart */}
            <div className="rounded-lg border border-border/50 p-4 bg-card/30">
              <SpreadChart
                spread={analysisData.spread}
                zScores={analysisData.zScores}
                label={`${tickerA}/${tickerB}`}
              />
            </div>

            {/* Rolling corr chart */}
            <div className="rounded-lg border border-border/50 p-4 bg-card/30">
              <RollingCorrChart corr={analysisData.corr} />
            </div>

            {/* Spread formula */}
            <div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-xs text-muted-foreground font-mono">
              Spread = Price_{tickerA} - {analysisData.beta.toFixed(4)} × Price_{tickerB} - {analysisData.alpha.toFixed(2)}
            </div>
          </div>
        )}

        {/* ── Tab 3: Trade the Spread ───────────────────────────────────────────── */}
        {activeTab === "trade" && (
          <div className="p-6 space-y-6">
            {/* Pair selector info */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-sm font-medium">
                Trading: <span className="text-primary font-bold">{tickerA} / {tickerB}</span>
              </div>
              <button
                onClick={() => setActiveTab("analysis")}
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                Change pair in Spread Analysis
              </button>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Current Z-Score", value: (analysisData.currentZ > 0 ? "+" : "") + analysisData.currentZ.toFixed(2), color: zColor(analysisData.currentZ) },
                { label: "Signal", value: analysisData.signal, color: zColor(analysisData.currentZ) },
                { label: "Open Trades", value: String(openTrades.length), color: "text-foreground" },
                { label: "Total P&L", value: `$${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(0)}`, color: totalPnl >= 0 ? "text-green-400" : "text-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-lg border border-border/50 bg-card/30 p-3">
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className={cn("text-lg font-bold tabular-nums mt-0.5", color)}>{value}</div>
                </div>
              ))}
            </div>

            {/* Z-score chart */}
            <div className="rounded-lg border border-border/50 p-4 bg-card/30">
              <ZScoreChart zScores={analysisData.zScores} />
            </div>

            {/* Position sizing */}
            <div className="rounded-lg border border-border/50 bg-card/30 p-4 space-y-3">
              <h3 className="text-sm font-semibold">Position Sizing (Equal-Dollar)</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Account size: $10,000 | Risk per trade: 2% = $200</p>
                <p>Long leg: Buy ${(5000).toFixed(0)} of {tickerA} | Short leg: Sell ${(5000).toFixed(0)} of {tickerB}</p>
                <p>Entry trigger: |Z| &gt; 2 | Exit target: Z → 0 | Stop: Z diverges to ±3.5</p>
              </div>
            </div>

            {/* Trade buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleEnter}
                disabled={!canEnter}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors",
                  canEnter
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                Enter Spread Trade
                {canEnter && ` (${analysisData.currentZ >= 2 ? "Short A / Long B" : "Long A / Short B"})`}
              </button>
              <button
                onClick={handleExit}
                disabled={!canExit}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors",
                  canExit
                    ? "bg-green-600 text-foreground hover:bg-green-500"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                Exit Spread Trade
              </button>
            </div>
            {!canEnter && openTrades.length === 0 && (
              <p className="text-xs text-muted-foreground text-center">
                Need |Z| &ge; 2 to enter. Current |Z| = {Math.abs(analysisData.currentZ).toFixed(2)}.
              </p>
            )}
            {!canExit && openTrades.length > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                Waiting for Z to revert near 0 (|Z| &lt; 0.5). Current Z = {analysisData.currentZ.toFixed(2)}.
              </p>
            )}

            {/* Trade log */}
            {tradeLogs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Trade Log</h3>
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/30">
                      <tr>
                        {["#", "Direction", "Entry Z", "Exit Z", "P&L", "Status"].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-muted-foreground font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tradeLogs.map(t => (
                        <tr key={t.id} className="border-t border-border/30">
                          <td className="px-3 py-2 font-mono">{t.id}</td>
                          <td className="px-3 py-2">
                            <span className={t.direction === "long_a" ? "text-green-400" : "text-red-400"}>
                              {t.direction === "long_a" ? `Long ${tickerA} / Short ${tickerB}` : `Short ${tickerA} / Long ${tickerB}`}
                            </span>
                          </td>
                          <td className={cn("px-3 py-2 font-mono", zColor(t.entryZ))}>
                            {t.entryZ > 0 ? "+" : ""}{t.entryZ.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 font-mono text-muted-foreground">
                            {t.exitZ != null ? (t.exitZ > 0 ? "+" : "") + t.exitZ.toFixed(2) : "—"}
                          </td>
                          <td className={cn("px-3 py-2 font-mono font-semibold", t.pnl == null ? "text-muted-foreground" : t.pnl >= 0 ? "text-green-400" : "text-red-400")}>
                            {t.pnl != null ? `$${t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(0)}` : "—"}
                          </td>
                          <td className="px-3 py-2">
                            {t.open
                              ? <span className="text-amber-400 font-medium">Open</span>
                              : <span className="text-muted-foreground">Closed</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 4: Education ─────────────────────────────────────────────────── */}
        {activeTab === "education" && (
          <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">Pairs Trading Fundamentals</h2>
            </div>

            {[
              {
                title: "What is Pairs Trading?",
                content: `Pairs trading is a market-neutral strategy that matches a long position in one asset with a short position in a closely related asset. The goal is to profit from temporary mispricings between correlated assets — regardless of market direction.

The core idea: if two stocks historically move together and their spread widens beyond normal, bet on convergence. When A rises relative to B (positive Z-score), short A and long B. The trade closes when the spread reverts to its historical mean.`,
              },
              {
                title: "Mean Reversion vs. Trend Following",
                content: `Pairs trading is a mean-reversion strategy — the opposite of trend following. Trend following buys strength and sells weakness; pairs trading fades the divergence. This makes pairs strategies non-correlated to momentum factors, adding diversification.

Key risk: mean reversion fails when a structural break occurs (one company fundamentally changes — e.g., earnings disaster, merger). The spread may never revert. This is called "divergence risk" or a "regime change."`,
              },
              {
                title: "Cointegration vs. Correlation",
                content: `Correlation measures whether two price series move in the same direction at a given time. Two series can be highly correlated but trend apart permanently (spurious regression).

Cointegration is stronger: it requires that a linear combination of the two series is stationary (mean-reverting). Even if individual prices drift as random walks, the spread remains bounded. Cointegration implies a long-run equilibrium relationship. Test via Engle-Granger or Johansen tests. A p-value < 0.05 indicates cointegration at 95% confidence.`,
              },
              {
                title: "The Hedge Ratio (OLS Beta)",
                content: `The hedge ratio β is estimated by regressing Price_A on Price_B using Ordinary Least Squares (OLS). The spread is then:

  Spread = Price_A − β × Price_B − α

This creates a stationary series if the pair is cointegrated. The Z-score normalizes the spread: Z = (Spread − mean) / std. Enter when |Z| > 2, exit when |Z| → 0.

Dynamic hedging: in practice, re-estimate β on a rolling window (e.g., 60 days) to adapt to slowly changing relationships.`,
              },
              {
                title: "Risk: Divergence, Crowding, and Liquidity",
                content: `Three main risks in pairs trading:

1. Divergence risk — the spread never reverts because one asset fundamentally changed (earnings miss, regulatory action, product launch).

2. Crowded trades — many funds run similar pairs strategies. When one deleverages (e.g., quant meltdown of August 2007), all positions move adversely simultaneously, amplifying losses.

3. Liquidity risk — executing both legs quickly at favorable prices. In illiquid markets, slippage erodes expected profits. Optimal pairs have tight bid-ask spreads and high volume.`,
              },
              {
                title: "Famous Historical Pairs",
                content: `Shell / Royal Dutch (1907–2005): The most famous pairs trade. Shell and Royal Dutch owned the same cash flows but traded at different prices on different exchanges. Arbitrageurs exploited this for decades until the merger in 2005.

Ford / General Motors: Two legacy automakers with similar revenue drivers (consumer credit cycles, fuel costs). Spreads widen on company-specific news and revert.

Coca-Cola / PepsiCo: Consumer staple duopoly. Both track consumer spending but diverge on management decisions, product launches, or input cost sensitivities.

S&P 500 ETF (SPY) / Nasdaq ETF (QQQ): One of the most traded institutional pairs. QQQ is more tech-heavy; spreads widen during tech sector rotations.`,
              },
            ].map(({ title, content }) => (
              <div key={title} className="rounded-lg border border-border/50 bg-card/30 p-5 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
