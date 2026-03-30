import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "./sma";

export interface MACDHistogramPoint {
  time: number;
  value: number;
  color: string;
}

export interface MACDResult {
  macdLine: IndicatorPoint[];
  signalLine: IndicatorPoint[];
  histogram: MACDHistogramPoint[];
}

function emaFromCloses(
  closes: { time: number; value: number }[],
  period: number,
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (closes.length < period) return result;

  const multiplier = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < period; i++) sum += closes[i].value;
  let ema = sum / period;
  result.push({ time: closes[period - 1].time, value: ema });

  for (let i = period; i < closes.length; i++) {
    ema = (closes[i].value - ema) * multiplier + ema;
    result.push({ time: closes[i].time, value: ema });
  }
  return result;
}

export function calculateMACD(
  data: OHLCVBar[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): MACDResult {
  const empty: MACDResult = { macdLine: [], signalLine: [], histogram: [] };
  if (data.length < slowPeriod + signalPeriod) return empty;

  // Calculate fast and slow EMAs
  const multiplierFast = 2 / (fastPeriod + 1);
  const multiplierSlow = 2 / (slowPeriod + 1);

  let sumFast = 0;
  let sumSlow = 0;
  for (let i = 0; i < fastPeriod; i++) sumFast += data[i].close;
  for (let i = 0; i < slowPeriod; i++) sumSlow += data[i].close;

  let emaFast = sumFast / fastPeriod;
  let emaSlow = sumSlow / slowPeriod;

  // Build MACD line starting from slowPeriod-1
  const macdRaw: { time: number; value: number }[] = [];

  // Advance fast EMA up to slowPeriod-1
  for (let i = fastPeriod; i < slowPeriod; i++) {
    emaFast = (data[i].close - emaFast) * multiplierFast + emaFast;
  }

  macdRaw.push({
    time: data[slowPeriod - 1].timestamp / 1000,
    value: emaFast - emaSlow,
  });

  for (let i = slowPeriod; i < data.length; i++) {
    emaFast = (data[i].close - emaFast) * multiplierFast + emaFast;
    emaSlow = (data[i].close - emaSlow) * multiplierSlow + emaSlow;
    macdRaw.push({
      time: data[i].timestamp / 1000,
      value: emaFast - emaSlow,
    });
  }

  // Signal line = EMA of MACD line
  const signalData = emaFromCloses(macdRaw, signalPeriod);

  // Align MACD line with signal line
  const offset = macdRaw.length - signalData.length;
  const macdLine = macdRaw.slice(offset);

  // Histogram = MACD - Signal
  const histogram: MACDHistogramPoint[] = macdLine.map((m, i) => {
    const diff = m.value - signalData[i].value;
    return {
      time: m.time,
      value: diff,
      color:
        diff >= 0
          ? "rgba(16, 185, 129, 0.6)"
          : "rgba(239, 68, 68, 0.6)",
    };
  });

  return { macdLine, signalLine: signalData, histogram };
}
