import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "./sma";

export function calculateCCI(
  data: OHLCVBar[],
  period = 20,
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (data.length < period) return result;

  const typicalPrices = data.map((d) => (d.high + d.low + d.close) / 3);

  for (let i = period - 1; i < data.length; i++) {
    const window = typicalPrices.slice(i - period + 1, i + 1);
    const mean = window.reduce((a, b) => a + b, 0) / period;
    const meanDev = window.reduce((sum, tp) => sum + Math.abs(tp - mean), 0) / period;

    const cci = meanDev === 0 ? 0 : (typicalPrices[i] - mean) / (0.015 * meanDev);
    result.push({ time: data[i].timestamp / 1000, value: cci });
  }

  return result;
}
