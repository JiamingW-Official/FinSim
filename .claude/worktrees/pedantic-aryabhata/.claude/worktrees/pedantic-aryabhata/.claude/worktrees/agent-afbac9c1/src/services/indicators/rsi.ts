import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "./sma";

export function calculateRSI(
  data: OHLCVBar[],
  period: number = 14,
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (data.length < period + 1) return result;

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push({
    time: data[period].timestamp / 1000,
    value: 100 - 100 / (1 + rs),
  });

  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rsVal = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push({
      time: data[i].timestamp / 1000,
      value: 100 - 100 / (1 + rsVal),
    });
  }
  return result;
}
