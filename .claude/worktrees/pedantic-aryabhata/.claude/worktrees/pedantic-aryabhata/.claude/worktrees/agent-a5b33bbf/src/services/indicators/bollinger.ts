import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "./sma";

export interface BollingerResult {
  upper: IndicatorPoint[];
  middle: IndicatorPoint[];
  lower: IndicatorPoint[];
}

export function calculateBollingerBands(
  data: OHLCVBar[],
  period: number = 20,
  stdDevMultiplier: number = 2,
): BollingerResult {
  const upper: IndicatorPoint[] = [];
  const middle: IndicatorPoint[] = [];
  const lower: IndicatorPoint[] = [];

  if (data.length < period) return { upper, middle, lower };

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((s, b) => s + b.close, 0) / period;
    const variance =
      slice.reduce((s, b) => s + Math.pow(b.close - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    const time = data[i].timestamp / 1000;

    middle.push({ time, value: mean });
    upper.push({ time, value: mean + stdDevMultiplier * stdDev });
    lower.push({ time, value: mean - stdDevMultiplier * stdDev });
  }

  return { upper, middle, lower };
}
