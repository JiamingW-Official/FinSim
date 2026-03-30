import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "./sma";

export function calculateOBV(data: OHLCVBar[]): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (data.length < 2) return result;

  let obv = 0;
  result.push({ time: data[0].timestamp / 1000, value: obv });

  for (let i = 1; i < data.length; i++) {
    const close = data[i].close;
    const prevClose = data[i - 1].close;
    const volume = data[i].volume;

    if (close > prevClose) {
      obv += volume;
    } else if (close < prevClose) {
      obv -= volume;
    }

    result.push({ time: data[i].timestamp / 1000, value: obv });
  }

  return result;
}
