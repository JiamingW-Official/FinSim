import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "./sma";

export function calculateParabolicSAR(
  data: OHLCVBar[],
  step = 0.02,
  maxAF = 0.2,
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (data.length < 2) return result;

  let isBull = data[1].close > data[0].close;
  let af = step;
  let ep = isBull ? data[0].high : data[0].low;
  let sar = isBull ? data[0].low : data[0].high;

  for (let i = 1; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevHigh = data[i - 1].high;
    const prevLow = data[i - 1].low;

    // Advance SAR
    sar = sar + af * (ep - sar);

    // Enforce SAR is beyond prior two bars
    if (isBull) {
      sar = Math.min(sar, prevLow, i >= 2 ? data[i - 2].low : prevLow);
    } else {
      sar = Math.max(sar, prevHigh, i >= 2 ? data[i - 2].high : prevHigh);
    }

    // Check for reversal
    if (isBull && low < sar) {
      isBull = false;
      sar = ep;
      ep = low;
      af = step;
    } else if (!isBull && high > sar) {
      isBull = true;
      sar = ep;
      ep = high;
      af = step;
    } else {
      // Update EP and AF
      if (isBull && high > ep) {
        ep = high;
        af = Math.min(af + step, maxAF);
      } else if (!isBull && low < ep) {
        ep = low;
        af = Math.min(af + step, maxAF);
      }
    }

    result.push({ time: data[i].timestamp / 1000, value: sar });
  }

  return result;
}
