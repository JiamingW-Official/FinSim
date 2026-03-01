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
}

const CHART_W = 440;
const BASE_H = 200;
const PADDING = { top: 12, bottom: 36, left: 4, right: 4 };
const VOLUME_H = 28;
const SUB_PANEL_H = 36;

// ---------- Indicator computations ----------

function computeSMA(bars: PracticeBar[], period: number): (number | null)[] {
  return bars.map((_, i) => {
    if (i < period - 1) return null;
    const slice = bars.slice(i - period + 1, i + 1);
    return slice.reduce((s, b) => s + b.close, 0) / period;
  });
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

  const signalLine = computeEMA(
    macdLine.map((v) => v ?? 0),
    signal,
    slow - 1, // start computing after slow period
  );

  const histogram = macdLine.map((m, i) => {
    if (m === null || signalLine[i] === null) return null;
    return m - signalLine[i]!;
  });

  return { macdLine, signalLine, histogram };
}

function computeEMA(values: number[], period: number, skipBefore = 0): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);
  let ema: number | null = null;

  for (let i = 0; i < values.length; i++) {
    if (i < skipBefore) {
      result.push(null);
      continue;
    }
    if (ema === null) {
      // Initialize with SMA of first `period` values
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

function computeBollinger(bars: PracticeBar[], period = 20, mult = 2) {
  const upper: (number | null)[] = [];
  const middle: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < bars.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      middle.push(null);
      lower.push(null);
      continue;
    }
    const slice = bars.slice(i - period + 1, i + 1);
    const avg = slice.reduce((s, b) => s + b.close, 0) / period;
    const variance = slice.reduce((s, b) => s + (b.close - avg) ** 2, 0) / period;
    const stdDev = Math.sqrt(variance);
    middle.push(avg);
    upper.push(avg + stdDev * mult);
    lower.push(avg - stdDev * mult);
  }
  return { upper, middle, lower };
}

// ---------- Main Component ----------

export function MiniChart({
  bars,
  revealedCount,
  trades,
  activeIndicators,
  currentPrice,
}: MiniChartProps) {
  const visible = bars.slice(0, revealedCount);

  const hasRSI = activeIndicators.includes("rsi");
  const hasMACD = activeIndicators.includes("macd");
  const subPanels = (hasRSI ? 1 : 0) + (hasMACD ? 1 : 0);
  const CHART_H = BASE_H + subPanels * SUB_PANEL_H;

  const { minPrice, maxPrice, maxVol, priceRange } = useMemo(() => {
    if (visible.length === 0)
      return { minPrice: 0, maxPrice: 1, maxVol: 1, priceRange: 1 };
    const lows = visible.map((b) => b.low);
    const highs = visible.map((b) => b.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const padding = (max - min) * 0.08;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVol: Math.max(...visible.map((b) => b.volume)),
      priceRange: max - min + padding * 2,
    };
  }, [visible]);

  const plotW = CHART_W - PADDING.left - PADDING.right;
  const plotH = BASE_H - PADDING.top - PADDING.bottom - VOLUME_H;
  const barW = visible.length > 0 ? plotW / Math.max(visible.length, 1) : 8;
  const candleW = Math.max(barW * 0.55, 2);

  const yScale = (price: number) =>
    PADDING.top + plotH - ((price - minPrice) / priceRange) * plotH;

  const volY = BASE_H - PADDING.bottom;

  // SMA data
  const sma20 = useMemo(
    () => (activeIndicators.includes("sma20") ? computeSMA(visible, Math.min(20, visible.length)) : []),
    [visible, activeIndicators],
  );

  const smaPath = useMemo(() => {
    if (sma20.length === 0) return "";
    return sma20
      .map((val, i) => {
        if (val === null) return null;
        const x = PADDING.left + i * barW + barW / 2;
        const y = yScale(val);
        return `${i === sma20.findIndex((v) => v !== null) ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .filter(Boolean)
      .join(" ");
  }, [sma20, barW, yScale]);

  // Bollinger Bands
  const bb = useMemo(
    () => (activeIndicators.includes("bb") ? computeBollinger(visible) : null),
    [visible, activeIndicators],
  );

  const bbPaths = useMemo(() => {
    if (!bb) return { upper: "", lower: "", fill: "" };
    const pts: Array<{ x: number; upper: number; lower: number }> = [];
    for (let i = 0; i < bb.upper.length; i++) {
      if (bb.upper[i] === null) continue;
      const x = PADDING.left + i * barW + barW / 2;
      pts.push({ x, upper: yScale(bb.upper[i]!), lower: yScale(bb.lower[i]!) });
    }
    if (pts.length === 0) return { upper: "", lower: "", fill: "" };
    const upper = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.upper.toFixed(1)}`).join(" ");
    const lower = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.lower.toFixed(1)}`).join(" ");
    const fillForward = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.upper.toFixed(1)}`).join(" ");
    const fillBack = [...pts].reverse().map((p) => `L${p.x.toFixed(1)},${p.lower.toFixed(1)}`).join(" ");
    return { upper, lower, fill: `${fillForward} ${fillBack} Z` };
  }, [bb, barW, yScale]);

  // RSI
  const rsiData = useMemo(
    () => (hasRSI ? computeRSI(visible) : []),
    [visible, hasRSI],
  );

  // MACD
  const macdData = useMemo(
    () => (hasMACD ? computeMACD(visible) : null),
    [visible, hasMACD],
  );

  // Sub-panel Y offsets
  const rsiPanelY = BASE_H;
  const macdPanelY = BASE_H + (hasRSI ? SUB_PANEL_H : 0);

  return (
    <div className="glass rounded-xl border border-border overflow-hidden">
      <svg
        width="100%"
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((f) => {
          const y = PADDING.top + plotH * (1 - f);
          const price = minPrice + priceRange * f;
          return (
            <g key={f}>
              <line
                x1={PADDING.left} y1={y} x2={CHART_W - PADDING.right} y2={y}
                stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3"
              />
              <text x={CHART_W - PADDING.right - 2} y={y - 3} fontSize="7" fill="currentColor" fillOpacity="0.3" textAnchor="end">
                ${price.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Volume bars */}
        {visible.map((bar, i) => {
          const x = PADDING.left + i * barW + (barW - candleW) / 2;
          const h = maxVol > 0 ? (bar.volume / maxVol) * VOLUME_H : 0;
          const isUp = bar.close >= bar.open;
          return (
            <rect
              key={`vol-${i}`}
              x={x} y={volY - h} width={candleW} height={h}
              fill={isUp ? "#10b981" : "#ef4444"}
              fillOpacity="0.15"
              rx="0.5"
            />
          );
        })}

        {/* Bollinger Bands fill */}
        {bbPaths.fill && (
          <path d={bbPaths.fill} fill="#8b5cf6" fillOpacity="0.06" />
        )}

        {/* Bollinger Bands lines */}
        {bbPaths.upper && (
          <>
            <path d={bbPaths.upper} fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.5" />
            <path d={bbPaths.lower} fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.5" />
          </>
        )}

        {/* Candlesticks */}
        {visible.map((bar, i) => {
          const cx = PADDING.left + i * barW + barW / 2;
          const x = cx - candleW / 2;
          const isUp = bar.close >= bar.open;
          const bodyTop = yScale(Math.max(bar.open, bar.close));
          const bodyBottom = yScale(Math.min(bar.open, bar.close));
          const bodyH = Math.max(bodyBottom - bodyTop, 1);
          const color = isUp ? "#10b981" : "#ef4444";
          const isLast = i === revealedCount - 1;

          return (
            <motion.g
              key={`candle-${i}`}
              initial={isLast ? { opacity: 0, x: 4 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Wick */}
              <line
                x1={cx} y1={yScale(bar.high)}
                x2={cx} y2={yScale(bar.low)}
                stroke={color} strokeWidth="1"
              />
              {/* Body */}
              <rect
                x={x} y={bodyTop} width={candleW} height={bodyH}
                fill={color} fillOpacity={isUp ? 0.7 : 0.8}
                rx="0.5"
              />
            </motion.g>
          );
        })}

        {/* SMA overlay */}
        {smaPath && (
          <motion.path
            d={smaPath}
            fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
          />
        )}

        {/* Trade markers */}
        {trades.map((trade, i) => {
          if (trade.barIndex >= revealedCount) return null;
          const cx = PADDING.left + trade.barIndex * barW + barW / 2;
          const y = trade.side === "buy" ? yScale(trade.price) + 8 : yScale(trade.price) - 8;
          const color = trade.side === "buy" ? "#3b82f6" : "#f59e0b";
          return (
            <motion.g
              key={`trade-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {trade.side === "buy" ? (
                <polygon
                  points={`${cx - 4},${y + 6} ${cx + 4},${y + 6} ${cx},${y}`}
                  fill={color}
                />
              ) : (
                <polygon
                  points={`${cx - 4},${y - 6} ${cx + 4},${y - 6} ${cx},${y}`}
                  fill={color}
                />
              )}
            </motion.g>
          );
        })}

        {/* Current price line */}
        {revealedCount > 0 && (
          <line
            x1={PADDING.left}
            y1={yScale(currentPrice)}
            x2={CHART_W - PADDING.right}
            y2={yScale(currentPrice)}
            stroke="#6366f1"
            strokeWidth="0.8"
            strokeDasharray="4 3"
            strokeOpacity="0.5"
          />
        )}

        {/* ===== RSI Sub-Panel ===== */}
        {hasRSI && (
          <g>
            {/* Separator */}
            <line x1={PADDING.left} y1={rsiPanelY} x2={CHART_W - PADDING.right} y2={rsiPanelY}
              stroke="currentColor" strokeOpacity="0.1" />
            {/* Labels */}
            <text x={PADDING.left + 2} y={rsiPanelY + 9} fontSize="6" fill="#8b5cf6" fillOpacity="0.6">RSI</text>
            {/* 30/70 threshold lines */}
            <line x1={PADDING.left} y1={rsiPanelY + SUB_PANEL_H * (1 - 70 / 100)} x2={CHART_W - PADDING.right} y2={rsiPanelY + SUB_PANEL_H * (1 - 70 / 100)}
              stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.3" />
            <line x1={PADDING.left} y1={rsiPanelY + SUB_PANEL_H * (1 - 30 / 100)} x2={CHART_W - PADDING.right} y2={rsiPanelY + SUB_PANEL_H * (1 - 30 / 100)}
              stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.3" />
            {/* RSI line */}
            <path
              d={rsiData
                .map((v, i) => {
                  if (v === null) return null;
                  const x = PADDING.left + i * barW + barW / 2;
                  const y = rsiPanelY + SUB_PANEL_H * (1 - v / 100);
                  return `${i === rsiData.findIndex((r) => r !== null) ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .filter(Boolean)
                .join(" ")}
              fill="none" stroke="#8b5cf6" strokeWidth="1.2"
            />
          </g>
        )}

        {/* ===== MACD Sub-Panel ===== */}
        {hasMACD && macdData && (
          <g>
            {/* Separator */}
            <line x1={PADDING.left} y1={macdPanelY} x2={CHART_W - PADDING.right} y2={macdPanelY}
              stroke="currentColor" strokeOpacity="0.1" />
            {/* Label */}
            <text x={PADDING.left + 2} y={macdPanelY + 9} fontSize="6" fill="#06b6d4" fillOpacity="0.6">MACD</text>
            {/* Zero line */}
            <line x1={PADDING.left} y1={macdPanelY + SUB_PANEL_H / 2} x2={CHART_W - PADDING.right} y2={macdPanelY + SUB_PANEL_H / 2}
              stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
            {(() => {
              // Scale MACD data to fit sub-panel
              const vals = macdData.macdLine.filter((v): v is number => v !== null);
              const histVals = macdData.histogram.filter((v): v is number => v !== null);
              const all = [...vals, ...histVals];
              if (all.length === 0) return null;
              const absMax = Math.max(...all.map(Math.abs), 0.01);
              const mid = macdPanelY + SUB_PANEL_H / 2;
              const scale = (SUB_PANEL_H / 2 - 3) / absMax;

              return (
                <>
                  {/* Histogram bars */}
                  {macdData.histogram.map((v, i) => {
                    if (v === null) return null;
                    const x = PADDING.left + i * barW + (barW - candleW) / 2;
                    const h = Math.abs(v) * scale;
                    const y = v >= 0 ? mid - h : mid;
                    return (
                      <rect key={`hist-${i}`} x={x} y={y} width={candleW} height={Math.max(h, 0.5)}
                        fill={v >= 0 ? "#10b981" : "#ef4444"} fillOpacity="0.3" rx="0.3" />
                    );
                  })}
                  {/* MACD line */}
                  <path
                    d={macdData.macdLine
                      .map((v, i) => {
                        if (v === null) return null;
                        const x = PADDING.left + i * barW + barW / 2;
                        const y = mid - v * scale;
                        return `${i === macdData.macdLine.findIndex((r) => r !== null) ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .filter(Boolean)
                      .join(" ")}
                    fill="none" stroke="#06b6d4" strokeWidth="1"
                  />
                  {/* Signal line */}
                  <path
                    d={macdData.signalLine
                      .map((v, i) => {
                        if (v === null) return null;
                        const x = PADDING.left + i * barW + barW / 2;
                        const y = mid - v * scale;
                        return `${i === macdData.signalLine.findIndex((r) => r !== null) ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .filter(Boolean)
                      .join(" ")}
                    fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="2 2"
                  />
                </>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
}
