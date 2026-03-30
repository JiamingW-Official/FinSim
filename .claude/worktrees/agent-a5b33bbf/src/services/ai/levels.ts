import type { OHLCVBar } from "@/types/market";

export interface PriceLevel {
  price: number;
  type: "support" | "resistance";
  strength: 1 | 2 | 3;
  source: "swing" | "pivot" | "round";
  label: string;
}

export interface PivotPoints {
  pp: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
}

function clusterLevels(
  prices: number[],
  type: "support" | "resistance",
  source: PriceLevel["source"],
  clusterPct = 0.004,
): PriceLevel[] {
  if (prices.length === 0) return [];

  const sorted = [...prices].sort((a, b) => a - b);
  const clusters: { price: number; count: number }[] = [];

  for (const p of sorted) {
    const existing = clusters.find(
      (c) => Math.abs(c.price - p) / c.price < clusterPct,
    );
    if (existing) {
      // Merge: use weighted average
      existing.price = (existing.price * existing.count + p) / (existing.count + 1);
      existing.count++;
    } else {
      clusters.push({ price: p, count: 1 });
    }
  }

  return clusters.map((c) => ({
    price: parseFloat(c.price.toFixed(2)),
    type,
    strength: (Math.min(c.count, 3) as 1 | 2 | 3),
    source,
    label:
      source === "swing"
        ? type === "resistance"
          ? "Swing High"
          : "Swing Low"
        : source === "pivot"
        ? type === "resistance"
          ? "Pivot R"
          : "Pivot S"
        : "Round Level",
  }));
}

export function detectLevels(params: {
  bars: OHLCVBar[];
  currentPrice: number;
  lookback?: number;
}): { supports: PriceLevel[]; resistances: PriceLevel[]; pivots: PivotPoints } {
  const { bars, currentPrice, lookback = 40 } = params;

  // ─── Pivot Points (from prev bar's OHLC) ──────────────────────────────────
  const prevBar = bars.length >= 2 ? bars[bars.length - 2] : bars[bars.length - 1];
  const pp = (prevBar.high + prevBar.low + prevBar.close) / 3;
  const pivots: PivotPoints = {
    pp: parseFloat(pp.toFixed(2)),
    r1: parseFloat((2 * pp - prevBar.low).toFixed(2)),
    r2: parseFloat((pp + (prevBar.high - prevBar.low)).toFixed(2)),
    r3: parseFloat((prevBar.high + 2 * (pp - prevBar.low)).toFixed(2)),
    s1: parseFloat((2 * pp - prevBar.high).toFixed(2)),
    s2: parseFloat((pp - (prevBar.high - prevBar.low)).toFixed(2)),
    s3: parseFloat((prevBar.low - 2 * (prevBar.high - pp)).toFixed(2)),
  };

  // ─── Swing High/Low S/R ──────────────────────────────────────────────────
  const sliceStart = Math.max(0, bars.length - lookback);
  const slice = bars.slice(sliceStart, bars.length - 1); // exclude current bar

  const swingHighPrices: number[] = [];
  const swingLowPrices: number[] = [];

  for (let i = 1; i < slice.length - 1; i++) {
    if (slice[i].high > slice[i - 1].high && slice[i].high > slice[i + 1].high) {
      swingHighPrices.push(slice[i].high);
    }
    if (slice[i].low < slice[i - 1].low && slice[i].low < slice[i + 1].low) {
      swingLowPrices.push(slice[i].low);
    }
  }

  const swingResistances = clusterLevels(swingHighPrices, "resistance", "swing");
  const swingSupports = clusterLevels(swingLowPrices, "support", "swing");

  // ─── Round Number Levels ──────────────────────────────────────────────────
  const step = currentPrice >= 100 ? 10 : 5;
  const rangeStart = currentPrice * 0.92;
  const rangeEnd = currentPrice * 1.08;
  const roundLevels: PriceLevel[] = [];

  let roundLevel = Math.floor(rangeStart / step) * step;
  while (roundLevel <= rangeEnd) {
    if (Math.abs(roundLevel - currentPrice) / currentPrice > 0.001) {
      roundLevels.push({
        price: roundLevel,
        type: roundLevel > currentPrice ? "resistance" : "support",
        strength: 1,
        source: "round",
        label: `Round $${roundLevel}`,
      });
    }
    roundLevel += step;
  }

  // ─── Pivot levels above/below price ─────────────────────────────────────
  const pivotAbove: PriceLevel[] = (
    [
      { price: pivots.r1, type: "resistance" as const, strength: 2 as const, source: "pivot" as const, label: "R1 Pivot" },
      { price: pivots.r2, type: "resistance" as const, strength: 2 as const, source: "pivot" as const, label: "R2 Pivot" },
      { price: pivots.r3, type: "resistance" as const, strength: 1 as const, source: "pivot" as const, label: "R3 Pivot" },
    ] as PriceLevel[]
  ).filter((l) => l.price > currentPrice * 1.001);

  const pivotBelow: PriceLevel[] = (
    [
      { price: pivots.s1, type: "support" as const, strength: 2 as const, source: "pivot" as const, label: "S1 Pivot" },
      { price: pivots.s2, type: "support" as const, strength: 2 as const, source: "pivot" as const, label: "S2 Pivot" },
      { price: pivots.s3, type: "support" as const, strength: 1 as const, source: "pivot" as const, label: "S3 Pivot" },
    ] as PriceLevel[]
  ).filter((l) => l.price < currentPrice * 0.999);

  // ─── Combine + sort ──────────────────────────────────────────────────────
  const allResistances: PriceLevel[] = [
    ...swingResistances.filter((l) => l.price > currentPrice * 1.001),
    ...pivotAbove,
    ...roundLevels.filter((l) => l.type === "resistance"),
  ].sort((a, b) => a.price - b.price); // ascending: nearest first

  const allSupports: PriceLevel[] = [
    ...swingSupports.filter((l) => l.price < currentPrice * 0.999),
    ...pivotBelow,
    ...roundLevels.filter((l) => l.type === "support"),
  ].sort((a, b) => b.price - a.price); // descending: nearest first

  // Deduplicate by clustering nearby levels (0.5%)
  function dedup(levels: PriceLevel[]): PriceLevel[] {
    const result: PriceLevel[] = [];
    for (const l of levels) {
      const existing = result.find(
        (r) => Math.abs(r.price - l.price) / r.price < 0.005,
      );
      if (!existing) {
        result.push(l);
      } else if (l.strength > existing.strength) {
        // Keep the stronger one
        existing.price = l.price;
        existing.strength = l.strength;
        existing.label = l.label;
        existing.source = l.source;
      }
    }
    return result;
  }

  return {
    supports: dedup(allSupports).slice(0, 3),
    resistances: dedup(allResistances).slice(0, 3),
    pivots,
  };
}
