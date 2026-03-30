import type { OHLCVBar } from "@/types/market";

export interface IndicatorPoint {
  time: number;
  value: number;
}

export function calculateSMA(
  data: OHLCVBar[],
  period: number,
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (data.length < period) return result;

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  result.push({
    time: data[period - 1].timestamp / 1000,
    value: sum / period,
  });

  for (let i = period; i < data.length; i++) {
    sum += data[i].close - data[i - period].close;
    result.push({ time: data[i].timestamp / 1000, value: sum / period });
  }
  return result;
}
