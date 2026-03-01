import type { BarGenPreset } from "@/types/backtest";
import type { BarGenConfig } from "@/data/lessons/practice-data";

type PresetParams = Omit<BarGenConfig, "count" | "seed">;

export const BAR_PRESETS: Record<BarGenPreset, PresetParams> = {
  trending_up: {
    startPrice: 100,
    drift: 0.003,
    volatility: 0.015,
    meanReversion: 0.03,
    target: 130,
    momentumBias: 0.6,
    patterns: [
      { bar: 15, type: "hammer" },
      { bar: 30, type: "doji" },
      { bar: 32, type: "bullish-engulfing" },
      { bar: 50, type: "shooting-star" },
      { bar: 65, type: "hammer" },
      { bar: 80, type: "bullish-engulfing" },
    ],
    consolidation: [
      { start: 28, end: 36, tightness: 0.4 },
      { start: 60, end: 68, tightness: 0.45 },
    ],
    support: [98, 110],
    resistance: [125, 132],
  },
  trending_down: {
    startPrice: 100,
    drift: -0.003,
    volatility: 0.015,
    meanReversion: 0.03,
    target: 70,
    momentumBias: 0.6,
    patterns: [
      { bar: 10, type: "shooting-star" },
      { bar: 12, type: "bearish-engulfing" },
      { bar: 30, type: "hammer" },
      { bar: 32, type: "doji" },
      { bar: 50, type: "bearish-engulfing" },
      { bar: 70, type: "hammer" },
      { bar: 85, type: "bullish-engulfing" },
    ],
    consolidation: [
      { start: 25, end: 35, tightness: 0.45 },
      { start: 65, end: 72, tightness: 0.5 },
    ],
    support: [72, 82],
    resistance: [95, 100],
  },
  sideways: {
    startPrice: 100,
    drift: 0.0005,
    volatility: 0.012,
    meanReversion: 0.08,
    target: 100,
    momentumBias: 0.4,
    patterns: [
      { bar: 10, type: "doji" },
      { bar: 20, type: "hammer" },
      { bar: 30, type: "shooting-star" },
      { bar: 40, type: "doji" },
      { bar: 55, type: "hammer" },
      { bar: 70, type: "shooting-star" },
      { bar: 85, type: "doji" },
    ],
    consolidation: [
      { start: 15, end: 30, tightness: 0.35 },
      { start: 50, end: 62, tightness: 0.4 },
      { start: 78, end: 88, tightness: 0.38 },
    ],
    support: [96, 98],
    resistance: [102, 104],
  },
  volatile: {
    startPrice: 100,
    drift: 0.001,
    volatility: 0.028,
    meanReversion: 0.02,
    target: 105,
    momentumBias: 0.5,
    patterns: [
      { bar: 8, type: "bearish-engulfing" },
      { bar: 15, type: "hammer" },
      { bar: 25, type: "shooting-star" },
      { bar: 35, type: "bullish-engulfing" },
      { bar: 50, type: "doji" },
      { bar: 60, type: "bearish-engulfing" },
      { bar: 75, type: "hammer" },
    ],
    consolidation: [
      { start: 40, end: 48, tightness: 0.5 },
    ],
    support: [90, 95],
    resistance: [110, 115],
  },
  random: {
    startPrice: 100,
    drift: 0.0,
    volatility: 0.018,
    meanReversion: 0.04,
    target: 100,
    momentumBias: 0.5,
    patterns: [
      { bar: 12, type: "doji" },
      { bar: 28, type: "hammer" },
      { bar: 42, type: "shooting-star" },
      { bar: 55, type: "bullish-engulfing" },
      { bar: 68, type: "doji" },
      { bar: 80, type: "bearish-engulfing" },
    ],
    consolidation: [
      { start: 20, end: 30, tightness: 0.4 },
      { start: 55, end: 65, tightness: 0.45 },
    ],
    support: [94, 97],
    resistance: [103, 106],
  },
};

export const PRESET_LABELS: Record<BarGenPreset, { label: string; description: string }> = {
  trending_up: { label: "Trending Up", description: "Steady uptrend with moderate volatility" },
  trending_down: { label: "Trending Down", description: "Steady downtrend with moderate volatility" },
  sideways: { label: "Sideways", description: "Range-bound with mean reversion" },
  volatile: { label: "Volatile", description: "High volatility with unpredictable swings" },
  random: { label: "Random Walk", description: "No clear trend, random movement" },
};
