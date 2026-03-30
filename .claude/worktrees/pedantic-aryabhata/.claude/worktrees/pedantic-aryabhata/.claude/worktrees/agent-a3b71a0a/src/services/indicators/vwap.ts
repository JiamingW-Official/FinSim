import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "./sma";

export function calculateVWAP(data: OHLCVBar[]): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (data.length === 0) return result;

  let cumulativeTPV = 0; // cumulative (typical price * volume)
  let cumulativeVol = 0;

  for (const bar of data) {
    // Use existing vwap if available, otherwise compute typical price
    const typicalPrice = (bar.high + bar.low + bar.close) / 3;
    cumulativeTPV += typicalPrice * bar.volume;
    cumulativeVol += bar.volume;

    const vwap = cumulativeVol > 0 ? cumulativeTPV / cumulativeVol : typicalPrice;
    result.push({ time: bar.timestamp / 1000, value: vwap });
  }

  return result;
}
