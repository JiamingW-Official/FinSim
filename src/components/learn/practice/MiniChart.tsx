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
const CHART_H = 200;
const PADDING = { top: 12, bottom: 36, left: 4, right: 4 };
const VOLUME_H = 28;

function computeSMA(bars: PracticeBar[], period: number): (number | null)[] {
  return bars.map((_, i) => {
    if (i < period - 1) return null;
    const slice = bars.slice(i - period + 1, i + 1);
    return slice.reduce((s, b) => s + b.close, 0) / period;
  });
}

export function MiniChart({
  bars,
  revealedCount,
  trades,
  activeIndicators,
  currentPrice,
}: MiniChartProps) {
  const visible = bars.slice(0, revealedCount);

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
  const plotH = CHART_H - PADDING.top - PADDING.bottom - VOLUME_H;
  const barW = visible.length > 0 ? plotW / Math.max(visible.length, 1) : 8;
  const candleW = Math.max(barW * 0.55, 2);

  const yScale = (price: number) =>
    PADDING.top + plotH - ((price - minPrice) / priceRange) * plotH;

  const volY = CHART_H - PADDING.bottom;

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
      </svg>
    </div>
  );
}
