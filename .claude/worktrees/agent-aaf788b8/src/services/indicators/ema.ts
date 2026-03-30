import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "./sma";

export function calculateEMA(
  data: OHLCVBar[],
  period: number,
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (data.length < period) return result;

  const multiplier = 2 / (period + 1);

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;
  result.push({ time: data[period - 1].timestamp / 1000, value: ema });

  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({ time: data[i].timestamp / 1000, value: ema });
  }
  return result;
}
