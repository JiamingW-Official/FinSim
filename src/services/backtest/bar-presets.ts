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
  },
  trending_down: {
    startPrice: 100,
    drift: -0.003,
    volatility: 0.015,
    meanReversion: 0.03,
    target: 70,
    momentumBias: 0.6,
  },
  sideways: {
    startPrice: 100,
    drift: 0.0005,
    volatility: 0.012,
    meanReversion: 0.08,
    target: 100,
    momentumBias: 0.4,
  },
  volatile: {
    startPrice: 100,
    drift: 0.001,
    volatility: 0.028,
    meanReversion: 0.02,
    target: 105,
    momentumBias: 0.5,
  },
  random: {
    startPrice: 100,
    drift: 0.0,
    volatility: 0.018,
    meanReversion: 0.04,
    target: 100,
    momentumBias: 0.5,
  },
};

export const PRESET_LABELS: Record<BarGenPreset, { label: string; description: string }> = {
  trending_up: { label: "Trending Up", description: "Steady uptrend with moderate volatility" },
  trending_down: { label: "Trending Down", description: "Steady downtrend with moderate volatility" },
  sideways: { label: "Sideways", description: "Range-bound with mean reversion" },
  volatile: { label: "Volatile", description: "High volatility with unpredictable swings" },
  random: { label: "Random Walk", description: "No clear trend, random movement" },
};
