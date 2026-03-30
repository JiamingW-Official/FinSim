// Technical Signals: Ichimoku Cloud, Fibonacci, Pivot Points, VWAP

export interface IchimokuPoint {
  tenkanSen: number;
  kijunSen: number;
  senkouSpanA: number;
  senkouSpanB: number;
  chikouSpan: number;
}

export function calculateIchimoku(
  data: { high: number; low: number; close: number }[],
  tenkan = 9,
  kijun = 26,
  senkouB = 52
): IchimokuPoint[] {
  const len = data.length;
  if (len < senkouB) return [];

  const midpoint = (arr: { high: number; low: number }[], start: number, period: number) => {
    let high = -Infinity;
    let low = Infinity;
    for (let i = start; i < start + period && i < arr.length; i++) {
      if (arr[i].high > high) high = arr[i].high;
      if (arr[i].low < low) low = arr[i].low;
    }
    return (high + low) / 2;
  };

  const results: IchimokuPoint[] = [];

  for (let i = senkouB - 1; i < len; i++) {
    const tenkanSen = midpoint(data, i - tenkan + 1, tenkan);
    const kijunSen = midpoint(data, i - kijun + 1, kijun);
    const senkouSpanA = (tenkanSen + kijunSen) / 2;
    const senkouSpanB = midpoint(data, i - senkouB + 1, senkouB);
    const chikouSpan = data[i].close;

    results.push({ tenkanSen, kijunSen, senkouSpanA, senkouSpanB, chikouSpan });
  }

  return results;
}

export interface FibonacciResult {
  retracements: {
    "0%": number;
    "23.6%": number;
    "38.2%": number;
    "50%": number;
    "61.8%": number;
    "78.6%": number;
    "100%": number;
  };
  extensions: {
    "127.2%": number;
    "161.8%": number;
    "200%": number;
    "261.8%": number;
  };
}

export function fibonacciLevels(high: number, low: number): FibonacciResult {
  const range = high - low;
  return {
    retracements: {
      "0%": high,
      "23.6%": high - range * 0.236,
      "38.2%": high - range * 0.382,
      "50%": high - range * 0.5,
      "61.8%": high - range * 0.618,
      "78.6%": high - range * 0.786,
      "100%": low,
    },
    extensions: {
      "127.2%": high + range * 0.272,
      "161.8%": high + range * 0.618,
      "200%": high + range * 1.0,
      "261.8%": high + range * 1.618,
    },
  };
}

export interface PivotResult {
  pivot: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
}

export function pivotPoints(
  high: number,
  low: number,
  close: number,
  method: "standard" | "fibonacci" | "camarilla" | "woodie" = "standard"
): PivotResult {
  switch (method) {
    case "fibonacci": {
      const p = (high + low + close) / 3;
      const r = high - low;
      return {
        pivot: p,
        r1: p + 0.382 * r,
        r2: p + 0.618 * r,
        r3: p + 1.0 * r,
        s1: p - 0.382 * r,
        s2: p - 0.618 * r,
        s3: p - 1.0 * r,
      };
    }
    case "camarilla": {
      const p = (high + low + close) / 3;
      const r = high - low;
      return {
        pivot: p,
        r1: close + r * 1.1 / 12,
        r2: close + r * 1.1 / 6,
        r3: close + r * 1.1 / 4,
        s1: close - r * 1.1 / 12,
        s2: close - r * 1.1 / 6,
        s3: close - r * 1.1 / 4,
      };
    }
    case "woodie": {
      const p = (high + low + 2 * close) / 4;
      return {
        pivot: p,
        r1: 2 * p - low,
        r2: p + (high - low),
        r3: high + 2 * (p - low),
        s1: 2 * p - high,
        s2: p - (high - low),
        s3: low - 2 * (high - p),
      };
    }
    default: {
      const p = (high + low + close) / 3;
      return {
        pivot: p,
        r1: 2 * p - low,
        r2: p + (high - low),
        r3: high + 2 * (p - low),
        s1: 2 * p - high,
        s2: p - (high - low),
        s3: low - 2 * (high - p),
      };
    }
  }
}

export interface VWAPPoint {
  vwap: number;
  upperBand: number;
  lowerBand: number;
}

export function calculateVWAP(
  data: { high: number; low: number; close: number; volume: number }[]
): VWAPPoint[] {
  const results: VWAPPoint[] = [];
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  let cumulativeTPV2 = 0;

  for (let i = 0; i < data.length; i++) {
    const tp = (data[i].high + data[i].low + data[i].close) / 3;
    cumulativeTPV += tp * data[i].volume;
    cumulativeVolume += data[i].volume;
    cumulativeTPV2 += tp * tp * data[i].volume;

    const vwap = cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : tp;
    const variance =
      cumulativeVolume > 0
        ? cumulativeTPV2 / cumulativeVolume - vwap * vwap
        : 0;
    const stdDev = Math.sqrt(Math.max(0, variance));

    results.push({
      vwap,
      upperBand: vwap + 2 * stdDev,
      lowerBand: vwap - 2 * stdDev,
    });
  }

  return results;
}
