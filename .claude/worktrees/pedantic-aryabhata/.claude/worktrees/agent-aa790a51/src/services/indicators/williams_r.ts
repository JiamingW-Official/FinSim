import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "./sma";

export function calculateWilliamsR(
  data: OHLCVBar[],
  period = 14,
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (data.length < period) return result;

  for (let i = period - 1; i < data.length; i++) {
    const window = data.slice(i - period + 1, i + 1);
    const highestHigh = Math.max(...window.map((d) => d.high));
    const lowestLow = Math.min(...window.map((d) => d.low));
    const close = data[i].close;

    const range = highestHigh - lowestLow;
    const wr = range === 0 ? -50 : -100 * ((highestHigh - close) / range);
    result.push({ time: data[i].timestamp / 1000, value: wr });
  }

  return result;
}
