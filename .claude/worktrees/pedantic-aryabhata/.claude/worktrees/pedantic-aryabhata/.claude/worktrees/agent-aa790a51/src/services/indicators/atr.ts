import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "./sma";

export function calculateATR(
  data: OHLCVBar[],
  period = 14,
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (data.length < period + 1) return result;

  // Calculate true ranges
  const trueRanges: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevClose = data[i - 1].close;
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose),
    );
    trueRanges.push(tr);
  }

  // First ATR = SMA of first `period` true ranges
  let sum = 0;
  for (let i = 0; i < period; i++) sum += trueRanges[i];
  let atr = sum / period;
  result.push({ time: data[period].timestamp / 1000, value: atr });

  // Wilder's smoothing: ATR = (prevATR * (period-1) + TR) / period
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
    result.push({ time: data[i + 1].timestamp / 1000, value: atr });
  }

  return result;
}
