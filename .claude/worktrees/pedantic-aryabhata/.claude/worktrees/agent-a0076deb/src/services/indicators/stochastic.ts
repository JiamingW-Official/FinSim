import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "./sma";

export interface StochasticResult {
  kLine: IndicatorPoint[];
  dLine: IndicatorPoint[];
}

export function calculateStochastic(
  data: OHLCVBar[],
  kPeriod = 14,
  dPeriod = 3,
): StochasticResult {
  const empty: StochasticResult = { kLine: [], dLine: [] };
  if (data.length < kPeriod) return empty;

  const kLine: IndicatorPoint[] = [];

  for (let i = kPeriod - 1; i < data.length; i++) {
    let highest = -Infinity;
    let lowest = Infinity;
    for (let j = i - kPeriod + 1; j <= i; j++) {
      highest = Math.max(highest, data[j].high);
      lowest = Math.min(lowest, data[j].low);
    }
    const range = highest - lowest;
    const k = range === 0 ? 50 : ((data[i].close - lowest) / range) * 100;
    kLine.push({ time: data[i].timestamp / 1000, value: k });
  }

  // %D = SMA of %K
  const dLine: IndicatorPoint[] = [];
  if (kLine.length >= dPeriod) {
    let sum = 0;
    for (let i = 0; i < dPeriod; i++) sum += kLine[i].value;
    dLine.push({ time: kLine[dPeriod - 1].time, value: sum / dPeriod });

    for (let i = dPeriod; i < kLine.length; i++) {
      sum += kLine[i].value - kLine[i - dPeriod].value;
      dLine.push({ time: kLine[i].time, value: sum / dPeriod });
    }
  }

  return { kLine, dLine };
}
