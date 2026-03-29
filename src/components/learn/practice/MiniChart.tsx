"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { PracticeBar } from "@/data/lessons/types";
import type { MiniTrade } from "./useMiniSimulator";

interface MiniChartProps {
  bars: PracticeBar[];
  revealedCount: number;
  trades: MiniTrade[];
  activeIndicators: string[];
  currentPrice: number;
  maxVisibleBars?: number;
}

const CHART_W = 720;
const BASE_H = 220;
const PADDING = { top: 12, bottom: 36, left: 4, right: 4 };
const VOLUME_H = 28;
const SUB_PANEL_H = 44;

// ── Indicator computations ──────────────────────────────────

function computeSMA(bars: PracticeBar[], period: number): (number | null)[] {
  return bars.map((_, i) => {
    if (i < period - 1) return null;
    const slice = bars.slice(i - period + 1, i + 1);
    return slice.reduce((s, b) => s + b.close, 0) / period;
  });
}

function computeEMA(values: number[], period: number, skipBefore = 0): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);
  let ema: number | null = null;
  for (let i = 0; i < values.length; i++) {
    if (i < skipBefore) { result.push(null); continue; }
    if (ema === null) {
      if (i >= skipBefore + period - 1) {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) sum += values[j];
        ema = sum / period;
        result.push(ema);
      } else {
        result.push(null);
      }
    } else {
      ema = values[i] * k + ema * (1 - k);
      result.push(ema);
    }
  }
  return result;
}

function computeRSI(bars: PracticeBar[], period = 14): (number | null)[] {
  const result: (number | null)[] = [];
  if (bars.length === 0) return result;
  result.push(null);
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i < bars.length; i++) {
    const change = bars[i].close - bars[i - 1].close;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);
    if (i <= period) {
      avgGain += gain / period;
      avgLoss += loss / period;
      result.push(i < period ? null : 100 - 100 / (1 + avgGain / Math.max(avgLoss, 0.001)));
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      result.push(100 - 100 / (1 + avgGain / Math.max(avgLoss, 0.001)));
    }
  }
  return result;
}

function computeMACD(bars: PracticeBar[], fast = 12, slow = 26, signal = 9) {
  const emaFast = computeEMA(bars.map((b) => b.close), fast);
  const emaSlow = computeEMA(bars.map((b) => b.close), slow);
  const macdLine = emaFast.map((f, i) => {
    if (f === null || emaSlow[i] === null) return null;
    return f - emaSlow[i]!;
  });
  const signalLine = computeEMA(macdLine.map((v) => v ?? 0), signal, slow - 1);
  const histogram = macdLine.map((m, i) => {
    if (m === null || signalLine[i] === null) return null;
    return m - signalLine[i]!;
  });
  return { macdLine, signalLine, histogram };
}

function computeBollinger(bars: PracticeBar[], period = 20, mult = 2) {
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (i < period - 1) { upper.push(null); lower.push(null); continue; }
    const slice = bars.slice(i - period + 1, i + 1);
    const avg = slice.reduce((s, b) => s + b.close, 0) / period;
    const variance = slice.reduce((s, b) => s + (b.close - avg) ** 2, 0) / period;
    const stdDev = Math.sqrt(variance);
    upper.push(avg + stdDev * mult);
    lower.push(avg - stdDev * mult);
  }
  return { upper, lower };
}

function computeVWAP(bars: PracticeBar[]): (number | null)[] {
  let cumTPV = 0;
  let cumVol = 0;
  return bars.map((bar) => {
    const tp = (bar.high + bar.low + bar.close) / 3;
    cumTPV += tp * bar.volume;
    cumVol += bar.volume;
    return cumVol > 0 ? cumTPV / cumVol : null;
  });
}

function computeStochastic(bars: PracticeBar[], kPeriod = 14, smooth = 3, dPeriod = 3) {
  const rawK: (number | null)[] = bars.map((_, i) => {
    if (i < kPeriod - 1) return null;
    const slice = bars.slice(i - kPeriod + 1, i + 1);
    const lo = Math.min(...slice.map((b) => b.low));
    const hi = Math.max(...slice.map((b) => b.high));
    const range = hi - lo;
    return range > 0 ? ((bars[i].close - lo) / range) * 100 : 50;
  });
  const k: (number | null)[] = rawK.map((_, i) => {
    if (i < kPeriod - 1 + smooth - 1) return null;
    const vals: number[] = [];
    for (let j = i - smooth + 1; j <= i; j++) if (rawK[j] !== null) vals.push(rawK[j]!);
    return vals.length === smooth ? vals.reduce((s, v) => s + v, 0) / smooth : null;
  });
  const d: (number | null)[] = k.map((_, i) => {
    if (i < kPeriod - 1 + smooth - 1 + dPeriod - 1) return null;
    const vals: number[] = [];
    for (let j = i - dPeriod + 1; j <= i; j++) if (k[j] !== null) vals.push(k[j]!);
    return vals.length === dPeriod ? vals.reduce((s, v) => s + v, 0) / dPeriod : null;
  });
  return { k, d };
}

// ── Path builder ────────────────────────────────────────────

function buildPath(data: (number | null)[], barW: number, leftPad: number, yFn: (v: number) => number): string {
  let started = false;
  return data.map((val, i) => {
    if (val === null) return null;
    const x = leftPad + i * barW + barW / 2;
    const y = yFn(val);
    const cmd = !started ? "M" : "L";
    started = true;
    return `${cmd}${x.toFixed(1)},${y.toFixed(1)}`;
  }).filter(Boolean).join(" ");
}

// ── Main component ──────────────────────────────────────────

export function MiniChart({ bars, revealedCount, trades, activeIndicators, currentPrice, maxVisibleBars }: MiniChartProps) {
  const allRevealed = bars.slice(0, revealedCount);
  const windowSize = maxVisibleBars ?? allRevealed.length;
  const windowStart = Math.max(0, allRevealed.length - windowSize);
  const visible = allRevealed.slice(windowStart);

  const hasRSI = activeIndicators.includes("rsi");
  const hasMACD = activeIndicators.includes("macd");
  const hasStoch = activeIndicators.includes("stoch");
  const subPanels = (hasRSI ? 1 : 0) + (hasMACD ? 1 : 0) + (hasStoch ? 1 : 0);
  const CHART_H = BASE_H + subPanels * SUB_PANEL_H;

  const { minPrice, maxVol, priceRange } = useMemo(() => {
    if (visible.length === 0) return { minPrice: 0, maxVol: 1, priceRange: 1 };
    const lows = visible.map((b) => b.low);
    const highs = visible.map((b) => b.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const pad = (max - min) * 0.08;
    return { minPrice: min - pad, maxVol: Math.max(...visible.map((b) => b.volume)), priceRange: max - min + pad * 2 };
  }, [visible]);

  const plotW = CHART_W - PADDING.left - PADDING.right;
  const plotH = BASE_H - PADDING.top - PADDING.bottom - VOLUME_H;
  // Use maxVisibleBars as denominator so candles stay a consistent narrow width
  // even when few bars are revealed (avoids fat candles at start)
  const layoutBars = maxVisibleBars ?? visible.length;
  const barW = layoutBars > 0 ? plotW / Math.max(layoutBars, 1) : 8;
  const candleW = Math.max(barW * 0.55, 1.5);
  const yScale = (price: number) => PADDING.top + plotH - ((price - minPrice) / priceRange) * plotH;
  const volY = BASE_H - PADDING.bottom;

  // ── Compute all indicators on full revealed data ──

  const hasSMA = activeIndicators.includes("sma20");
  const hasEMA = activeIndicators.includes("ema");
  const hasBB = activeIndicators.includes("bb");
  const hasVWAP = activeIndicators.includes("vwap");

  const sma20All = useMemo(() => (hasSMA ? computeSMA(allRevealed, Math.min(20, allRevealed.length)) : []), [allRevealed, hasSMA]);
  const ema9All = useMemo(() => (hasEMA ? computeEMA(allRevealed.map((b) => b.close), 9) : []), [allRevealed, hasEMA]);
  const ema21All = useMemo(() => (hasEMA ? computeEMA(allRevealed.map((b) => b.close), 21) : []), [allRevealed, hasEMA]);
  const bbAll = useMemo(() => (hasBB ? computeBollinger(allRevealed) : null), [allRevealed, hasBB]);
  const vwapAll = useMemo(() => (hasVWAP ? computeVWAP(allRevealed) : []), [allRevealed, hasVWAP]);
  const rsiAll = useMemo(() => (hasRSI ? computeRSI(allRevealed) : []), [allRevealed, hasRSI]);
  const macdAll = useMemo(() => (hasMACD ? computeMACD(allRevealed) : null), [allRevealed, hasMACD]);
  const stochAll = useMemo(() => (hasStoch ? computeStochastic(allRevealed) : null), [allRevealed, hasStoch]);

  // Slice visible window
  const sma20 = sma20All.slice(windowStart);
  const ema9 = ema9All.slice(windowStart);
  const ema21 = ema21All.slice(windowStart);
  const vwap = vwapAll.slice(windowStart);
  const rsiData = rsiAll.slice(windowStart);
  const macdData = macdAll ? { macdLine: macdAll.macdLine.slice(windowStart), signalLine: macdAll.signalLine.slice(windowStart), histogram: macdAll.histogram.slice(windowStart) } : null;
  const stochData = stochAll ? { k: stochAll.k.slice(windowStart), d: stochAll.d.slice(windowStart) } : null;

  // ── Build overlay paths ──
  const smaPath = useMemo(() => buildPath(sma20, barW, PADDING.left, yScale), [sma20, barW, yScale]);
  const ema9Path = useMemo(() => buildPath(ema9, barW, PADDING.left, yScale), [ema9, barW, yScale]);
  const ema21Path = useMemo(() => buildPath(ema21, barW, PADDING.left, yScale), [ema21, barW, yScale]);
  const vwapPath = useMemo(() => buildPath(vwap, barW, PADDING.left, yScale), [vwap, barW, yScale]);

  const bbPaths = useMemo(() => {
    if (!bbAll) return { upper: "", lower: "", fill: "" };
    const u = bbAll.upper.slice(windowStart);
    const l = bbAll.lower.slice(windowStart);
    const pts: Array<{ x: number; uy: number; ly: number }> = [];
    for (let i = 0; i < u.length; i++) {
      if (u[i] === null) continue;
      const x = PADDING.left + i * barW + barW / 2;
      pts.push({ x, uy: yScale(u[i]!), ly: yScale(l[i]!) });
    }
    if (pts.length === 0) return { upper: "", lower: "", fill: "" };
    const upper = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.uy.toFixed(1)}`).join(" ");
    const lower = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.ly.toFixed(1)}`).join(" ");
    const fwd = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.uy.toFixed(1)}`).join(" ");
    const bck = [...pts].reverse().map((p) => `L${p.x.toFixed(1)},${p.ly.toFixed(1)}`).join(" ");
    return { upper, lower, fill: `${fwd} ${bck} Z` };
  }, [bbAll, windowStart, barW, yScale]);

  // Sub-panel Y positions
  let nextY = BASE_H;
  const rsiPanelY = nextY; if (hasRSI) nextY += SUB_PANEL_H;
  const macdPanelY = nextY; if (hasMACD) nextY += SUB_PANEL_H;
  const stochPanelY = nextY;

  // Visible trades
  const visibleTrades = trades.filter((t) => t.barIndex >= windowStart && t.barIndex < windowStart + visible.length);

  return (
    <div className="glass rounded-md border border-border overflow-hidden">
      <svg width="100%" viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="xMidYMid meet" className="block">
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((f) => {
          const y = PADDING.top + plotH * (1 - f);
          const price = minPrice + priceRange * f;
          return (
            <g key={f}>
              <line x1={PADDING.left} y1={y} x2={CHART_W - PADDING.right} y2={y} stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />
              <text x={CHART_W - PADDING.right - 2} y={y - 3} fontSize="7" fill="currentColor" fillOpacity="0.3" textAnchor="end">${price.toFixed(0)}</text>
            </g>
          );
        })}

        {/* Volume bars */}
        {visible.map((bar, i) => {
          const x = PADDING.left + i * barW + (barW - candleW) / 2;
          const h = maxVol > 0 ? (bar.volume / maxVol) * VOLUME_H : 0;
          const isUp = bar.close >= bar.open;
          return <rect key={`v${i}`} x={x} y={volY - h} width={candleW} height={h} fill={isUp ? "#10b981" : "#ef4444"} fillOpacity={h > VOLUME_H * 0.5 ? "0.25" : "0.12"} rx="0.5" />;
        })}
        {/* Volume label */}
        <text x={PADDING.left + 2} y={volY - VOLUME_H + 8} fontSize="5.5" fill="currentColor" fillOpacity="0.2">VOL</text>

        {/* BB fill + lines */}
        {bbPaths.fill && <path d={bbPaths.fill} fill="#8b5cf6" fillOpacity="0.06" />}
        {bbPaths.upper && <><path d={bbPaths.upper} fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.5" /><path d={bbPaths.lower} fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.5" /></>}

        {/* Candles */}
        {visible.map((bar, i) => {
          const cx = PADDING.left + i * barW + barW / 2;
          const x = cx - candleW / 2;
          const isUp = bar.close >= bar.open;
          const bTop = yScale(Math.max(bar.open, bar.close));
          const bBot = yScale(Math.min(bar.open, bar.close));
          const bH = Math.max(bBot - bTop, 1);
          const col = isUp ? "#10b981" : "#ef4444";
          const isLast = i === visible.length - 1 && windowStart + i === revealedCount - 1;
          return (
            <motion.g key={`c${windowStart + i}`} initial={isLast ? { opacity: 0, x: 4 } : false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
              {/* Wick */}
              <line x1={cx} y1={yScale(bar.high)} x2={cx} y2={yScale(bar.low)} stroke={col} strokeWidth="1" strokeOpacity={isLast ? 1 : 0.8} />
              {/* Body: green = solid filled, red = semi-transparent with border */}
              <rect x={x} y={bTop} width={candleW} height={bH} fill={col} fillOpacity={isUp ? 0.85 : 0.3} stroke={isUp ? "none" : col} strokeWidth={isUp ? 0 : 0.8} strokeOpacity={0.8} rx="0.5" />
              {/* Last candle glow */}
              {isLast && <rect x={x - 1} y={bTop - 1} width={candleW + 2} height={bH + 2} fill="none" stroke={col} strokeWidth="1.5" strokeOpacity="0.4" rx="1" />}
            </motion.g>
          );
        })}

        {/* Overlays */}
        {smaPath && <path d={smaPath} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />}
        {ema9Path && <path d={ema9Path} fill="none" stroke="#06b6d4" strokeWidth="1.2" />}
        {ema21Path && <path d={ema21Path} fill="none" stroke="#f97316" strokeWidth="1.2" />}
        {vwapPath && <path d={vwapPath} fill="none" stroke="#a78bfa" strokeWidth="1.2" strokeDasharray="6 3" />}

        {/* Trade markers */}
        {visibleTrades.map((trade, i) => {
          const li = trade.barIndex - windowStart;
          const cx = PADDING.left + li * barW + barW / 2;
          const isBuyLike = trade.side === "buy" || trade.side === "cover";
          const y = isBuyLike ? yScale(trade.price) + 8 : yScale(trade.price) - 8;
          const col = trade.side === "buy" ? "#3b82f6" : trade.side === "sell" ? "#f59e0b" : trade.side === "short" ? "#ef4444" : "#10b981";
          return (
            <motion.g key={`t${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              {isBuyLike
                ? <polygon points={`${cx - 4},${y + 6} ${cx + 4},${y + 6} ${cx},${y}`} fill={col} />
                : <polygon points={`${cx - 4},${y - 6} ${cx + 4},${y - 6} ${cx},${y}`} fill={col} />
              }
            </motion.g>
          );
        })}

        {/* Current price line + right-edge label */}
        {visible.length > 0 && (() => {
          const py = yScale(currentPrice);
          const labelW = 46;
          const labelH = 14;
          const labelX = CHART_W - PADDING.right - labelW;
          const priceColor = visible.length >= 2 && visible[visible.length - 1].close >= visible[visible.length - 2].close ? "#10b981" : "#ef4444";
          return (
            <>
              <line x1={PADDING.left} y1={py} x2={labelX - 2} y2={py} stroke={priceColor} strokeWidth="0.8" strokeDasharray="4 3" strokeOpacity="0.4" />
              {/* Price label box */}
              <rect x={labelX} y={py - labelH / 2} width={labelW} height={labelH} fill={priceColor} fillOpacity="0.15" rx="2" stroke={priceColor} strokeWidth="0.5" strokeOpacity="0.3" />
              <text x={labelX + labelW / 2} y={py + 3} fontSize="7" fill={priceColor} fillOpacity="0.9" textAnchor="middle" fontWeight="bold">${currentPrice.toFixed(2)}</text>
            </>
          );
        })()}

        {/* ═══ RSI ═══ */}
        {hasRSI && (
          <g>
            <line x1={PADDING.left} y1={rsiPanelY} x2={CHART_W - PADDING.right} y2={rsiPanelY} stroke="currentColor" strokeOpacity="0.1" />
            <text x={PADDING.left + 2} y={rsiPanelY + 9} fontSize="6" fill="#8b5cf6" fillOpacity="0.6">RSI(14)</text>
            <line x1={PADDING.left} y1={rsiPanelY + SUB_PANEL_H * 0.3} x2={CHART_W - PADDING.right} y2={rsiPanelY + SUB_PANEL_H * 0.3} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.3" />
            <line x1={PADDING.left} y1={rsiPanelY + SUB_PANEL_H * 0.7} x2={CHART_W - PADDING.right} y2={rsiPanelY + SUB_PANEL_H * 0.7} stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.3" />
            <text x={CHART_W - PADDING.right - 2} y={rsiPanelY + SUB_PANEL_H * 0.3 - 2} fontSize="5" fill="#ef4444" fillOpacity="0.4" textAnchor="end">70</text>
            <text x={CHART_W - PADDING.right - 2} y={rsiPanelY + SUB_PANEL_H * 0.7 - 2} fontSize="5" fill="#10b981" fillOpacity="0.4" textAnchor="end">30</text>
            <path d={buildPath(rsiData, barW, PADDING.left, (v) => rsiPanelY + SUB_PANEL_H * (1 - v / 100))} fill="none" stroke="#8b5cf6" strokeWidth="1.2" />
          </g>
        )}

        {/* ═══ MACD ═══ */}
        {hasMACD && macdData && (
          <g>
            <line x1={PADDING.left} y1={macdPanelY} x2={CHART_W - PADDING.right} y2={macdPanelY} stroke="currentColor" strokeOpacity="0.1" />
            <text x={PADDING.left + 2} y={macdPanelY + 9} fontSize="6" fill="#06b6d4" fillOpacity="0.6">MACD</text>
            <line x1={PADDING.left} y1={macdPanelY + SUB_PANEL_H / 2} x2={CHART_W - PADDING.right} y2={macdPanelY + SUB_PANEL_H / 2} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
            {(() => {
              const vals = macdData.macdLine.filter((v): v is number => v !== null);
              const hVals = macdData.histogram.filter((v): v is number => v !== null);
              const all = [...vals, ...hVals];
              if (all.length === 0) return null;
              const absMax = Math.max(...all.map(Math.abs), 0.01);
              const mid = macdPanelY + SUB_PANEL_H / 2;
              const sc = (SUB_PANEL_H / 2 - 3) / absMax;
              return (
                <>
                  {macdData.histogram.map((v, i) => {
                    if (v === null) return null;
                    const x = PADDING.left + i * barW + (barW - candleW) / 2;
                    const h = Math.abs(v) * sc;
                    return <rect key={`mh${i}`} x={x} y={v >= 0 ? mid - h : mid} width={candleW} height={Math.max(h, 0.5)} fill={v >= 0 ? "#10b981" : "#ef4444"} fillOpacity="0.3" rx="0.3" />;
                  })}
                  <path d={buildPath(macdData.macdLine, barW, PADDING.left, (v) => mid - v * sc)} fill="none" stroke="#06b6d4" strokeWidth="1" />
                  <path d={buildPath(macdData.signalLine, barW, PADDING.left, (v) => mid - v * sc)} fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="2 2" />
                </>
              );
            })()}
          </g>
        )}

        {/* ═══ Stochastic ═══ */}
        {hasStoch && stochData && (
          <g>
            <line x1={PADDING.left} y1={stochPanelY} x2={CHART_W - PADDING.right} y2={stochPanelY} stroke="currentColor" strokeOpacity="0.1" />
            <text x={PADDING.left + 2} y={stochPanelY + 9} fontSize="6" fill="#f472b6" fillOpacity="0.6">Stoch(14,3,3)</text>
            <line x1={PADDING.left} y1={stochPanelY + SUB_PANEL_H * 0.2} x2={CHART_W - PADDING.right} y2={stochPanelY + SUB_PANEL_H * 0.2} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.25" />
            <line x1={PADDING.left} y1={stochPanelY + SUB_PANEL_H * 0.8} x2={CHART_W - PADDING.right} y2={stochPanelY + SUB_PANEL_H * 0.8} stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.25" />
            <text x={CHART_W - PADDING.right - 2} y={stochPanelY + SUB_PANEL_H * 0.2 - 2} fontSize="5" fill="#ef4444" fillOpacity="0.4" textAnchor="end">80</text>
            <text x={CHART_W - PADDING.right - 2} y={stochPanelY + SUB_PANEL_H * 0.8 - 2} fontSize="5" fill="#10b981" fillOpacity="0.4" textAnchor="end">20</text>
            <path d={buildPath(stochData.k, barW, PADDING.left, (v) => stochPanelY + SUB_PANEL_H * (1 - v / 100))} fill="none" stroke="#f472b6" strokeWidth="1.2" />
            <path d={buildPath(stochData.d, barW, PADDING.left, (v) => stochPanelY + SUB_PANEL_H * (1 - v / 100))} fill="none" stroke="#facc15" strokeWidth="1" strokeDasharray="2 2" />
          </g>
        )}
      </svg>
    </div>
  );
}
