import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "./sma";

export function calculateADX(
  data: OHLCVBar[],
  period = 14,
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (data.length < period * 2 + 1) return result;

  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const trValues: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevHigh = data[i - 1].high;
    const prevLow = data[i - 1].low;
    const prevClose = data[i - 1].close;

    const upMove = high - prevHigh;
    const downMove = prevLow - low;

    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose),
    );
    trValues.push(tr);
  }

  // Initial Wilder sums (first period)
  let smoothTR = trValues.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothPlusDM = plusDM.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothMinusDM = minusDM.slice(0, period).reduce((a, b) => a + b, 0);

  const dxValues: number[] = [];

  const computeDX = (tr: number, pDM: number, mDM: number): number => {
    if (tr === 0) return 0;
    const plusDI = (pDM / tr) * 100;
    const minusDI = (mDM / tr) * 100;
    const diSum = plusDI + minusDI;
    if (diSum === 0) return 0;
    return (Math.abs(plusDI - minusDI) / diSum) * 100;
  };

  dxValues.push(computeDX(smoothTR, smoothPlusDM, smoothMinusDM));

  for (let i = period; i < trValues.length; i++) {
    smoothTR = smoothTR - smoothTR / period + trValues[i];
    smoothPlusDM = smoothPlusDM - smoothPlusDM / period + plusDM[i];
    smoothMinusDM = smoothMinusDM - smoothMinusDM / period + minusDM[i];
    dxValues.push(computeDX(smoothTR, smoothPlusDM, smoothMinusDM));
  }

  // ADX = Wilder smooth of DX over period
  let adx = dxValues.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const startIdx = period * 2; // index in original data array
  result.push({ time: data[startIdx].timestamp / 1000, value: adx });

  for (let i = period; i < dxValues.length; i++) {
    adx = (adx * (period - 1) + dxValues[i]) / period;
    result.push({ time: data[period + i + 1].timestamp / 1000, value: adx });
  }

  return result;
}
