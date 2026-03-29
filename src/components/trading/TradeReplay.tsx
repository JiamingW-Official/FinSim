"use client";

import { useState, useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import type { TradeRecord } from "@/types/trading";
import { formatCurrency, formatShortDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Crown,
  Skull,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
} from "lucide-react";

// ── Mulberry32 seeded PRNG ───────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashTicker(ticker: string, date: number): number {
  let h = ((date / 86400000) | 0) * 2654435761;
  for (let i = 0; i < ticker.length; i++) {
    h = (Math.imul(h, 31) + ticker.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// ── Synthetic bar generator for replay ───────────────────────────────────────
interface SyntheticBar {
  open: number;
  high: number;
  low: number;
  close: number;
  vol: number;
}

function generateReplayBars(
  entryPrice: number,
  exitPrice: number,
  seed: number,
  totalBars: number,
  entryBar: number,
  exitBar: number,
): SyntheticBar[] {
  const rand = mulberry32(seed);
  const bars: SyntheticBar[] = [];

  // Generate a price path that goes through entryPrice at entryBar and exitPrice at exitBar
  const priceRange = Math.abs(exitPrice - entryPrice);
  const baseVol = entryPrice * 0.015; // 1.5% daily volatility
  const sigma = Math.max(priceRange * 0.08, baseVol);

  // Create price path points
  let currentPrice = entryPrice * (0.98 + rand() * 0.04); // start slightly away from entry
  const prices: number[] = [currentPrice];

  for (let i = 1; i < totalBars; i++) {
    let drift = 0;
    if (i < entryBar) {
      // Pre-entry: drift toward entry price
      drift = (entryPrice - currentPrice) * 0.15;
    } else if (i === entryBar) {
      currentPrice = entryPrice;
    } else if (i < exitBar) {
      // Between entry/exit: drift toward exit
      const progress = (i - entryBar) / (exitBar - entryBar);
      drift = (exitPrice - entryPrice) * 0.05 + (rand() - 0.5) * sigma * 0.3;
      // nudge toward target
      drift += (exitPrice - currentPrice) * progress * 0.1;
    } else if (i === exitBar) {
      currentPrice = exitPrice;
    } else {
      // Post-exit: random walk
      drift = (rand() - 0.5) * sigma * 0.5;
    }
    currentPrice = currentPrice + drift + (rand() - 0.5) * sigma * 0.4;
    if (currentPrice < entryPrice * 0.7) currentPrice = entryPrice * 0.7;
    prices.push(currentPrice);
  }

  // Convert to OHLCV bars
  for (let i = 0; i < totalBars; i++) {
    const close = prices[i];
    const open = i === 0 ? close : prices[i - 1] * (0.998 + rand() * 0.004);
    const wickUp = rand() * sigma * 0.5;
    const wickDown = rand() * sigma * 0.5;
    const high = Math.max(open, close) + wickUp;
    const low = Math.min(open, close) - wickDown;
    const vol = 0.5 + rand() * 1.5;
    bars.push({ open, high, low, close, vol });
  }

  return bars;
}

// ── Compute MFE/MAE from bars ─────────────────────────────────────────────────
function computeMFEMAE(
  bars: SyntheticBar[],
  entryPrice: number,
  exitPrice: number,
  entryBar: number,
  exitBar: number,
  side: "buy" | "sell",
): { mfe: number; mae: number } {
  let mfe = 0;
  let mae = 0;

  for (let i = entryBar; i <= exitBar && i < bars.length; i++) {
    const bar = bars[i];
    if (side === "buy") {
      const favorable = bar.high - entryPrice;
      const adverse = entryPrice - bar.low;
      if (favorable > mfe) mfe = favorable;
      if (adverse > mae) mae = adverse;
    } else {
      const favorable = entryPrice - bar.low;
      const adverse = bar.high - entryPrice;
      if (favorable > mfe) mfe = favorable;
      if (adverse > mae) mae = adverse;
    }
  }

  return { mfe, mae };
}

// ── SVG Mini Chart ────────────────────────────────────────────────────────────
interface ReplayChartProps {
  bars: SyntheticBar[];
  entryBar: number;
  exitBar: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  width?: number;
  height?: number;
}

function ReplayChart({
  bars,
  entryBar,
  exitBar,
  entryPrice,
  exitPrice,
  stopLoss,
  width = 600,
  height = 300,
}: ReplayChartProps) {
  if (bars.length === 0) return null;

  const padL = 8;
  const padR = 8;
  const padT = 20;
  const padB = 24;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  // Price bounds
  const allPrices = bars.flatMap((b) => [b.high, b.low]);
  allPrices.push(entryPrice, exitPrice, stopLoss);
  let minP = Math.min(...allPrices);
  let maxP = Math.max(...allPrices);
  const pRange = maxP - minP || entryPrice * 0.05;
  maxP += pRange * 0.08;
  minP -= pRange * 0.08;

  const totalRange = maxP - minP;
  const barW = chartW / bars.length;
  const bodyMinW = 1;

  const toX = (i: number) => padL + (i + 0.5) * barW;
  const toY = (p: number) => padT + chartH * (1 - (p - minP) / totalRange);

  const isProfitable = exitPrice > entryPrice;
  const shadeFill = isProfitable ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)";
  const shadeBorder = isProfitable ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)";

  const entryY = toY(entryPrice);
  const exitY = toY(exitPrice);
  const entryX = toX(entryBar);
  const exitX = toX(exitBar);

  // Shaded region polygon between entry and exit bar
  const shadePoints = [
    `${entryX},${entryY}`,
    `${exitX},${entryY}`,
    `${exitX},${exitY}`,
    `${entryX},${exitY}`,
  ].join(" ");

  // Annotation markers at key bars
  const annotations: Array<{ bar: number; label: string; color: string }> = [];
  const midBar = Math.floor((entryBar + exitBar) / 2);
  if (midBar > entryBar && midBar < exitBar) {
    const midPrice = bars[midBar]?.close ?? entryPrice;
    const midPct = ((midPrice - entryPrice) / entryPrice) * 100;
    if (Math.abs(midPct) >= 1) {
      annotations.push({
        bar: midBar,
        label: `${midPct >= 0 ? "+" : ""}${midPct.toFixed(1)}%`,
        color: midPct >= 0 ? "#10b981" : "#ef4444",
      });
    }
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="select-none"
    >
      {/* Background */}
      <rect width={width} height={height} fill="transparent" />

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = padT + chartH * t;
        const price = maxP - totalRange * t;
        return (
          <g key={t}>
            <line
              x1={padL}
              y1={y}
              x2={width - padR}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text
              x={padL + 2}
              y={y - 2}
              fontSize={8}
              fill="rgba(255,255,255,0.3)"
            >
              {price.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Stop loss dashed line */}
      {stopLoss > 0 && (
        <line
          x1={padL}
          y1={toY(stopLoss)}
          x2={width - padR}
          y2={toY(stopLoss)}
          stroke="#ef4444"
          strokeWidth={1}
          strokeDasharray="4,3"
          opacity={0.6}
        />
      )}

      {/* Shaded P&L region */}
      <polygon points={shadePoints} fill={shadeFill} stroke={shadeBorder} strokeWidth={1} />

      {/* Candlesticks */}
      {bars.map((bar, i) => {
        const x = toX(i);
        const openY = toY(bar.open);
        const closeY = toY(bar.close);
        const highY = toY(bar.high);
        const lowY = toY(bar.low);
        const isGreen = bar.close >= bar.open;
        const color = isGreen ? "#10b981" : "#ef4444";
        const bodyTop = Math.min(openY, closeY);
        const bodyH = Math.max(Math.abs(closeY - openY), bodyMinW);
        const bodyX = x - barW * 0.35;
        const bodyWidth = barW * 0.7;

        return (
          <g key={i}>
            {/* Wick */}
            <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth={0.8} />
            {/* Body */}
            <rect
              x={bodyX}
              y={bodyTop}
              width={bodyWidth}
              height={bodyH}
              fill={color}
              opacity={i >= entryBar && i <= exitBar ? 0.9 : 0.45}
            />
          </g>
        );
      })}

      {/* Entry marker: green upward triangle */}
      <polygon
        points={`${entryX},${entryY - 14} ${entryX - 7},${entryY - 2} ${entryX + 7},${entryY - 2}`}
        fill="#10b981"
        stroke="#fff"
        strokeWidth={0.5}
      />
      <text
        x={entryX}
        y={entryY - 17}
        fontSize={7}
        fill="#10b981"
        textAnchor="middle"
        fontWeight="600"
      >
        ENTRY
      </text>

      {/* Exit marker: red downward triangle */}
      <polygon
        points={`${exitX},${exitY + 14} ${exitX - 7},${exitY + 2} ${exitX + 7},${exitY + 2}`}
        fill="#ef4444"
        stroke="#fff"
        strokeWidth={0.5}
      />
      <text
        x={exitX}
        y={exitY + 24}
        fontSize={7}
        fill="#ef4444"
        textAnchor="middle"
        fontWeight="600"
      >
        EXIT
      </text>

      {/* Annotation markers */}
      {annotations.map((ann, idx) => {
        const ax = toX(ann.bar);
        const ay = toY(bars[ann.bar]?.high ?? entryPrice) - 8;
        return (
          <g key={idx}>
            <rect
              x={ax - 18}
              y={ay - 10}
              width={36}
              height={12}
              rx={3}
              fill="rgba(0,0,0,0.7)"
              stroke={ann.color}
              strokeWidth={0.5}
            />
            <text
              x={ax}
              y={ay}
              fontSize={7}
              fill={ann.color}
              textAnchor="middle"
              fontWeight="600"
            >
              {ann.label}
            </text>
          </g>
        );
      })}

      {/* X-axis bar indices */}
      {bars.map((_, i) => {
        if (i % Math.max(1, Math.floor(bars.length / 6)) !== 0) return null;
        return (
          <text
            key={`xi-${i}`}
            x={toX(i)}
            y={height - 6}
            fontSize={7}
            fill="rgba(255,255,255,0.25)"
            textAnchor="middle"
          >
            {i}
          </text>
        );
      })}
    </svg>
  );
}

// ── Mini sparkline SVG ─────────────────────────────────────────────────────────
function MiniSparkline({
  prices,
  color,
  width = 60,
  height = 24,
}: {
  prices: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (prices.length < 2) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const pts = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * width;
    const y = height - ((p - min) / range) * height * 0.8 - height * 0.1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Rubric scoring ─────────────────────────────────────────────────────────────
interface RubricScores {
  entryTiming: number;
  exitTiming: number;
  riskManagement: number;
  trendAlignment: number;
}

function computeRubric(
  trade: TradeRecord,
  mfe: number,
  mae: number,
  entryPrice: number,
  exitPrice: number,
): RubricScores {
  const grossPnL = trade.realizedPnL + trade.fees;
  const pnlPct = (grossPnL / (entryPrice * trade.quantity)) * 100;
  const efficiency = mfe > 0 ? Math.abs(exitPrice - entryPrice) / mfe : 0;

  // Entry timing: if profitable, good entry. If loss, lower score.
  const entryTiming = pnlPct > 5 ? 8 + Math.min(2, pnlPct / 10) : pnlPct > 0 ? 6 + pnlPct * 0.2 : Math.max(1, 5 + pnlPct * 0.3);

  // Exit timing: based on efficiency ratio
  const exitTiming = Math.min(10, efficiency * 10);

  // Risk management: MAE relative to MFE
  const maeRatio = mfe > 0 ? mae / mfe : 1;
  const riskManagement = Math.max(1, 10 - maeRatio * 6);

  // Trend alignment: buy side profitable = aligned
  const trendAlignment = trade.side === "buy"
    ? (exitPrice > entryPrice ? 7 + Math.min(3, pnlPct * 0.3) : Math.max(1, 6 - Math.abs(pnlPct) * 0.4))
    : (exitPrice < entryPrice ? 7 + Math.min(3, Math.abs(pnlPct) * 0.3) : Math.max(1, 6 - Math.abs(pnlPct) * 0.4));

  return {
    entryTiming: Math.round(Math.min(10, Math.max(1, entryTiming)) * 10) / 10,
    exitTiming: Math.round(Math.min(10, Math.max(1, exitTiming)) * 10) / 10,
    riskManagement: Math.round(Math.min(10, Math.max(1, riskManagement)) * 10) / 10,
    trendAlignment: Math.round(Math.min(10, Math.max(1, trendAlignment)) * 10) / 10,
  };
}

function computeGrade(scores: RubricScores): string {
  const avg = (scores.entryTiming + scores.exitTiming + scores.riskManagement + scores.trendAlignment) / 4;
  if (avg >= 8.5) return "A";
  if (avg >= 7) return "B";
  if (avg >= 5.5) return "C";
  if (avg >= 4) return "D";
  return "F";
}

// ── AI Critique generator ─────────────────────────────────────────────────────
function generateCritique(
  trade: TradeRecord,
  mfe: number,
  mae: number,
  entryPrice: number,
  exitPrice: number,
): string[] {
  const lines: string[] = [];
  const grossPnL = trade.realizedPnL + trade.fees;
  const actualMove = Math.abs(exitPrice - entryPrice);
  const efficiency = mfe > 0 ? actualMove / mfe : 0;
  const maeRatio = mae > 0 ? grossPnL / (mae * trade.quantity) : Infinity;

  if (efficiency < 0.4 && mfe > 0 && grossPnL > 0) {
    lines.push(
      `You captured only ${(efficiency * 100).toFixed(0)}% of the available move (MFE ${formatCurrency(mfe * trade.quantity)}). Consider trailing stops or a wider T2 target to hold winners longer.`,
    );
  } else if (efficiency >= 0.75) {
    lines.push(
      `Excellent execution — you captured ${(efficiency * 100).toFixed(0)}% of the peak move. Low drawdown, strong efficiency ratio.`,
    );
  }

  if (mae > 0 && (mae / mfe > 0.6) && grossPnL >= 0) {
    lines.push(
      `Drawdown risk was elevated (MAE ${formatCurrency(mae * trade.quantity)}). Tightening your stop or sizing down would improve your risk-adjusted returns.`,
    );
  }

  if (grossPnL < 0) {
    lines.push(
      `This trade went against you. Review the entry signal quality — was there a clear catalyst or pattern confirming the direction?`,
    );
    if (mae > mfe * 2) {
      lines.push(
        `The price action showed strong adverse momentum early. Consider using a tighter initial stop (e.g. below key support) to limit MAE on losing trades.`,
      );
    }
  }

  if (maeRatio > 3 && grossPnL > 0) {
    lines.push(
      `Good R:R outcome — your profit was ${maeRatio.toFixed(1)}× your worst drawdown. Keep targeting setups with this kind of risk-reward profile.`,
    );
  }

  if (lines.length === 0) {
    lines.push(
      `Solid trade. Entry and exit were within expected ranges. Continue monitoring your efficiency ratio and MAE/MFE for further refinement.`,
    );
  }

  return lines;
}

// ── Score bar component ───────────────────────────────────────────────────────
function ScoreBar({ score, label }: { score: number; label: string }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 8 ? "#10b981" : score >= 6 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-2">
      <span className="w-28 text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-6 text-xs font-semibold tabular-nums" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

// ── Alternative scenario ──────────────────────────────────────────────────────
interface AlternativeScenario {
  label: string;
  description: string;
  pnl: number;
  prices: number[];
  color: string;
}

function computeAlternatives(
  trade: TradeRecord,
  bars: SyntheticBar[],
  entryBar: number,
  exitBar: number,
  entryPrice: number,
  exitPrice: number,
): AlternativeScenario[] {
  const qty = trade.quantity;
  const alts: AlternativeScenario[] = [];

  // Alternative 1: Exit 2 bars earlier
  if (exitBar - 2 > entryBar) {
    const earlyExitBar = exitBar - 2;
    const earlyExit = bars[earlyExitBar]?.close ?? exitPrice;
    const earlyPnL = trade.side === "buy"
      ? (earlyExit - entryPrice) * qty
      : (entryPrice - earlyExit) * qty;
    const prices = bars.slice(entryBar, earlyExitBar + 1).map((b) => b.close);
    alts.push({
      label: "Earlier exit",
      description: `If you exited 2 bars earlier at ${formatCurrency(earlyExit)}`,
      pnl: earlyPnL,
      prices,
      color: earlyPnL >= 0 ? "#10b981" : "#ef4444",
    });
  }

  // Alternative 2: Tighter stop (1% from entry)
  const tightStop = trade.side === "buy"
    ? entryPrice * 0.99
    : entryPrice * 1.01;
  let stoppedOut = false;
  let stopBar = exitBar;
  for (let i = entryBar; i <= exitBar && i < bars.length; i++) {
    const bar = bars[i];
    if (trade.side === "buy" && bar.low <= tightStop) {
      stoppedOut = true;
      stopBar = i;
      break;
    }
    if (trade.side === "sell" && bar.high >= tightStop) {
      stoppedOut = true;
      stopBar = i;
      break;
    }
  }
  const tightStopPnL = stoppedOut
    ? trade.side === "buy"
      ? (tightStop - entryPrice) * qty
      : (entryPrice - tightStop) * qty
    : (exitPrice - entryPrice) * qty * (trade.side === "buy" ? 1 : -1);
  const stopPrices = bars.slice(entryBar, stopBar + 1).map((b) => b.close);
  alts.push({
    label: "Tighter stop",
    description: stoppedOut
      ? `1% tight stop hit at ${formatCurrency(tightStop)} (bar ${stopBar})`
      : `1% stop never triggered — same exit`,
    pnl: tightStopPnL,
    prices: stopPrices,
    color: tightStopPnL >= 0 ? "#10b981" : "#ef4444",
  });

  // Alternative 3: Hold to T2 (2× the initial target distance)
  const t2Distance = Math.abs(exitPrice - entryPrice) * 2;
  const t2Price = trade.side === "buy"
    ? entryPrice + t2Distance
    : entryPrice - t2Distance;
  let reachedT2 = false;
  let t2Bar = bars.length - 1;
  for (let i = exitBar; i < bars.length; i++) {
    const bar = bars[i];
    if (trade.side === "buy" && bar.high >= t2Price) {
      reachedT2 = true;
      t2Bar = i;
      break;
    }
    if (trade.side === "sell" && bar.low <= t2Price) {
      reachedT2 = true;
      t2Bar = i;
      break;
    }
  }
  const t2Pnl = reachedT2
    ? (trade.side === "buy" ? 1 : -1) * t2Distance * qty
    : (trade.side === "buy" ? bars[bars.length - 1]?.close ?? exitPrice : entryPrice * 2 - (bars[bars.length - 1]?.close ?? exitPrice))
    * qty - entryPrice * qty;
  const t2Prices = bars.slice(entryBar, t2Bar + 1).map((b) => b.close);
  alts.push({
    label: "Hold to T2",
    description: reachedT2
      ? `T2 target ${formatCurrency(t2Price)} reached at bar ${t2Bar}`
      : `T2 ${formatCurrency(t2Price)} not reached in remaining bars`,
    pnl: reachedT2 ? t2Distance * qty * (trade.side === "buy" ? 1 : -1) : (bars[bars.length - 1]?.close ?? exitPrice) * qty - entryPrice * qty,
    prices: t2Prices,
    color: "#6366f1",
  });

  return alts;
}

// ── Trade pair finder (buy/sell matched) ────────────────────────────────────
interface TradePair {
  buy: TradeRecord;
  sell: TradeRecord;
  netPnL: number;
}

function buildTradePairs(tradeHistory: TradeRecord[]): TradePair[] {
  const pairs: TradePair[] = [];
  // Sort ascending by timestamp
  const sorted = [...tradeHistory].sort((a, b) => a.timestamp - b.timestamp);

  // Match buy→sell by ticker
  const openBuys: Record<string, TradeRecord[]> = {};
  for (const trade of sorted) {
    if (trade.side === "buy") {
      if (!openBuys[trade.ticker]) openBuys[trade.ticker] = [];
      openBuys[trade.ticker].push(trade);
    } else if (trade.side === "sell") {
      const buys = openBuys[trade.ticker];
      if (buys && buys.length > 0) {
        const buy = buys.shift()!;
        pairs.push({ buy, sell: trade, netPnL: trade.realizedPnL - trade.fees });
      }
    }
  }

  return pairs.reverse(); // most recent first
}

// ── Main component ────────────────────────────────────────────────────────────
export function TradeReplay() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const [selectedPairIndex, setSelectedPairIndex] = useState<number | null>(null);

  const tradePairs = useMemo(() => buildTradePairs(tradeHistory), [tradeHistory]);

  // Best / worst trade indices
  const bestIndex = useMemo(() => {
    if (tradePairs.length === 0) return -1;
    let best = 0;
    for (let i = 1; i < tradePairs.length; i++) {
      if (tradePairs[i].netPnL > tradePairs[best].netPnL) best = i;
    }
    return best;
  }, [tradePairs]);

  const worstIndex = useMemo(() => {
    if (tradePairs.length === 0) return -1;
    let worst = 0;
    for (let i = 1; i < tradePairs.length; i++) {
      if (tradePairs[i].netPnL < tradePairs[worst].netPnL) worst = i;
    }
    return worst;
  }, [tradePairs]);

  const selectedPair = selectedPairIndex !== null ? tradePairs[selectedPairIndex] : null;

  // Generate replay data for selected pair
  const replayData = useMemo(() => {
    if (!selectedPair) return null;

    const { buy, sell } = selectedPair;
    const entryPrice = buy.price;
    const exitPrice = sell.price;
    const totalBars = 41; // ±20 bars around trade
    const entryBar = 10;
    const exitBar = Math.min(30, entryBar + Math.max(2, Math.floor(Math.abs(sell.simulationDate - buy.simulationDate) / 86400000)));

    const seed = hashTicker(buy.ticker, buy.simulationDate);
    const bars = generateReplayBars(entryPrice, exitPrice, seed, totalBars, entryBar, exitBar);

    const { mfe, mae } = computeMFEMAE(bars, entryPrice, exitPrice, entryBar, exitBar, buy.side);
    const rubric = computeRubric(sell, mfe, mae, entryPrice, exitPrice);
    const grade = computeGrade(rubric);
    const critique = generateCritique(sell, mfe, mae, entryPrice, exitPrice);
    const alternatives = computeAlternatives(sell, bars, entryBar, exitBar, entryPrice, exitPrice);

    // Stop loss estimate: 2% below entry for buys
    const stopLoss = buy.side === "buy" ? entryPrice * 0.98 : entryPrice * 1.02;

    return {
      bars,
      entryBar,
      exitBar,
      entryPrice,
      exitPrice,
      stopLoss,
      mfe,
      mae,
      rubric,
      grade,
      critique,
      alternatives,
    };
  }, [selectedPair]);

  // Empty state
  if (tradePairs.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center p-8">
        <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">No completed trades to replay</p>
        <p className="text-xs text-muted-foreground/60 max-w-xs">
          Make a trade (buy then sell) to unlock the replay analyzer. Review your entries,
          exits, and learn from each trade.
        </p>
      </div>
    );
  }

  const gradeColor = {
    A: "text-emerald-400",
    B: "text-green-400",
    C: "text-yellow-400",
    D: "text-orange-400",
    F: "text-red-400",
  };

  const displayPairs = tradePairs.slice(0, 10);

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left panel: Trade selection ── */}
      <div
        className="flex flex-col border-r border-border/40 bg-card overflow-y-auto shrink-0"
        style={{ width: 280 }}
      >
        <div className="px-3 py-2 border-b border-border/40">
          <p className="text-xs font-semibold text-muted-foreground">
            Recent Trades
          </p>
        </div>
        <div className="flex flex-col gap-0.5 p-1.5">
          {displayPairs.map((pair, idx) => {
            const isSelected = selectedPairIndex === idx;
            const isBest = idx === bestIndex && tradePairs.length > 1;
            const isWorst = idx === worstIndex && tradePairs.length > 1;
            const { buy, sell } = pair;
            const direction = buy.side === "buy" ? "Long" : "Short";
            const netPnL = sell.realizedPnL - sell.fees;
            const pnlPct = ((sell.price - buy.price) / buy.price) * 100;

            return (
              <button
                key={sell.id}
                onClick={() => setSelectedPairIndex(idx)}
                className={cn(
                  "w-full text-left rounded-md px-2.5 py-2 transition-colors",
                  isSelected
                    ? "bg-primary/15 border border-primary/30"
                    : "hover:bg-muted/20 border border-transparent",
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">{buy.ticker}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] px-1 py-0 h-4",
                        buy.side === "buy"
                          ? "border-emerald-500/30 text-emerald-400"
                          : "border-red-500/30 text-red-400",
                      )}
                    >
                      {direction}
                    </Badge>
                    {isBest && (
                      <Crown className="h-3 w-3 text-yellow-400" />
                    )}
                    {isWorst && (
                      <Skull className="h-3 w-3 text-red-400/70" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums",
                      netPnL >= 0 ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {netPnL >= 0 ? "+" : ""}{formatCurrency(netPnL)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatShortDate(buy.simulationDate)}
                  </span>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      pnlPct >= 0 ? "text-emerald-400/70" : "text-red-400/70",
                    )}
                  >
                    {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main area ── */}
      {!selectedPair || !replayData ? (
        <div className="flex flex-1 items-center justify-center text-center p-8">
          <div>
            <Target className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Select a trade to replay</p>
            <p className="text-xs text-muted-foreground/50 mt-1">
              Click any trade on the left to view the replay analysis
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">
                {selectedPair.buy.ticker} Trade Replay
              </h2>
              <p className="text-xs text-muted-foreground">
                {formatShortDate(selectedPair.buy.simulationDate)} →{" "}
                {formatShortDate(selectedPair.sell.simulationDate)}
              </p>
            </div>
            <div
              className={cn(
                "text-3xl font-bold",
                gradeColor[replayData.grade as keyof typeof gradeColor] ?? "text-muted-foreground",
              )}
            >
              {replayData.grade}
            </div>
          </div>

          <div className="flex gap-4">
            {/* ── Center: Replay Chart ── */}
            <div className="flex-1 min-w-0">
              <Card className="border-border/50">
                <CardHeader className="pb-1 pt-3 px-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Price Replay — ±20 Bars
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-3">
                  <div className="overflow-x-auto">
                    <ReplayChart
                      bars={replayData.bars}
                      entryBar={replayData.entryBar}
                      exitBar={replayData.exitBar}
                      entryPrice={replayData.entryPrice}
                      exitPrice={replayData.exitPrice}
                      stopLoss={replayData.stopLoss}
                      width={560}
                      height={280}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Right: Trade Stats ── */}
            <div className="shrink-0" style={{ width: 220 }}>
              <Card className="border-border/50 h-full">
                <CardHeader className="pb-1 pt-3 px-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Trade Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  {[
                    { label: "Entry", value: formatCurrency(selectedPair.buy.price) },
                    { label: "Exit", value: formatCurrency(selectedPair.sell.price) },
                    { label: "Quantity", value: selectedPair.buy.quantity.toString() },
                    {
                      label: "Gross P&L",
                      value: formatCurrency(selectedPair.sell.realizedPnL),
                      colored: true,
                      num: selectedPair.sell.realizedPnL,
                    },
                    {
                      label: "Commission",
                      value: formatCurrency(selectedPair.sell.fees ?? 0),
                    },
                    {
                      label: "Net P&L",
                      value: formatCurrency(selectedPair.sell.realizedPnL - (selectedPair.sell.fees ?? 0)),
                      colored: true,
                      num: selectedPair.sell.realizedPnL - (selectedPair.sell.fees ?? 0),
                      bold: true,
                    },
                    {
                      label: "Hold period",
                      value: (() => {
                        const diffMs = selectedPair.sell.simulationDate - selectedPair.buy.simulationDate;
                        const days = Math.floor(diffMs / 86400000);
                        return days > 0 ? `${days}d` : "< 1d";
                      })(),
                    },
                    {
                      label: "MFE",
                      value: formatCurrency(replayData.mfe * selectedPair.buy.quantity),
                      colored: true,
                      num: 1,
                    },
                    {
                      label: "MAE",
                      value: formatCurrency(replayData.mae * selectedPair.buy.quantity),
                      colored: true,
                      num: -1,
                    },
                    {
                      label: "Efficiency",
                      value:
                        replayData.mfe > 0
                          ? `${(
                              (Math.abs(replayData.exitPrice - replayData.entryPrice) /
                                replayData.mfe) *
                              100
                            ).toFixed(0)}%`
                          : "N/A",
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{row.label}</span>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          row.bold && "font-semibold",
                          row.colored && row.num !== undefined
                            ? row.num > 0
                              ? "text-emerald-400"
                              : "text-red-400"
                            : "",
                        )}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── AI Critique ── */}
          <Card className="border-border/50">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                AI Critique
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              {/* Critique text */}
              <div className="space-y-1.5">
                {replayData.critique.map((line, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {replayData.grade === "A" || replayData.grade === "B" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">{line}</p>
                  </div>
                ))}
              </div>

              {/* Rubric scores */}
              <div className="border-t border-border/50 pt-3 space-y-2">
                <ScoreBar score={replayData.rubric.entryTiming} label="Entry Timing" />
                <ScoreBar score={replayData.rubric.exitTiming} label="Exit Timing" />
                <ScoreBar score={replayData.rubric.riskManagement} label="Risk Management" />
                <ScoreBar score={replayData.rubric.trendAlignment} label="Trend Alignment" />
              </div>

              {/* Overall grade */}
              <div className="border-t border-border/50 pt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Overall Grade</span>
                <span
                  className={cn(
                    "text-xl font-bold",
                    gradeColor[replayData.grade as keyof typeof gradeColor] ?? "text-muted-foreground",
                  )}
                >
                  {replayData.grade}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ── Hypothetical Alternatives ── */}
          <Card className="border-border/50">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                What Would You Do Differently?
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-3 gap-3">
                {replayData.alternatives.map((alt, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border/50 bg-background/50 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{alt.label}</span>
                      <span
                        className={cn(
                          "text-xs font-semibold tabular-nums",
                          alt.pnl >= 0 ? "text-emerald-400" : "text-red-400",
                        )}
                      >
                        {alt.pnl >= 0 ? "+" : ""}
                        {formatCurrency(alt.pnl)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {alt.description}
                    </p>
                    {alt.prices.length >= 2 && (
                      <MiniSparkline
                        prices={alt.prices}
                        color={alt.color}
                        width={64}
                        height={28}
                      />
                    )}
                    {/* Delta vs actual */}
                    <div className="flex items-center gap-1">
                      {alt.pnl >= selectedPair.sell.realizedPnL ? (
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {alt.pnl >= selectedPair.sell.realizedPnL
                          ? `+${formatCurrency(alt.pnl - selectedPair.sell.realizedPnL)} vs actual`
                          : `${formatCurrency(alt.pnl - selectedPair.sell.realizedPnL)} vs actual`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Spacer */}
          <div className="h-4" />
        </div>
      )}
    </div>
  );
}
