import type {
  OptionContract,
  OptionChainExpiry,
  Greeks,
} from "@/types/options";
import { RISK_FREE_RATE } from "@/types/options";
import { blackScholes } from "./black-scholes";
import { calculateGreeks } from "./greeks";

export interface ChainGeneratorInput {
  ticker: string;
  spotPrice: number;
  historicalVolatility: number;
  simulationDate: number; // timestamp
}

// Simple seeded PRNG for consistent synthetic data
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/**
 * Generate strike prices centered around spot price
 */
export function generateStrikeRange(spotPrice: number): number[] {
  let spacing: number;
  if (spotPrice < 100) spacing = 2.5;
  else if (spotPrice < 500) spacing = 5;
  else spacing = 10;

  // Round spot to nearest spacing for ATM
  const atm = Math.round(spotPrice / spacing) * spacing;

  const strikes: number[] = [];
  for (let i = -10; i <= 10; i++) {
    const strike = atm + i * spacing;
    if (strike > 0) strikes.push(strike);
  }
  return strikes;
}

/**
 * Generate standard expiry dates from a simulation date
 */
export function generateExpiryDates(
  simulationDate: number,
): { expiry: string; daysToExpiry: number }[] {
  const base = new Date(simulationDate);
  const targets = [7, 30, 60, 90]; // ~1wk, 1mo, 2mo, 3mo

  return targets.map((days) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    // Snap to nearest Friday (options typically expire on Fridays)
    const dayOfWeek = d.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    d.setDate(d.getDate() + daysUntilFriday);

    const expiry = d.toISOString().slice(0, 10);
    const actualDays = Math.max(
      1,
      Math.round((d.getTime() - base.getTime()) / (1000 * 60 * 60 * 24)),
    );
    return { expiry, daysToExpiry: actualDays };
  });
}

/**
 * Apply IV skew — volatility smile effect
 * OTM options have slightly higher IV than ATM
 */
function getSkewedIV(
  baseIV: number,
  strike: number,
  spotPrice: number,
): number {
  const moneyness = strike / spotPrice;
  // Smile: IV increases as moneyness deviates from 1.0
  const skewFactor = 1 + 0.1 * (moneyness - 1) ** 2;
  // Put skew: slightly higher IV for lower strikes
  const putSkew = moneyness < 1 ? 0.02 * (1 - moneyness) : 0;
  return baseIV * skewFactor + putSkew;
}

/**
 * Generate a complete option chain with synthetic but realistic data
 */
export function generateOptionChain(
  input: ChainGeneratorInput,
): OptionChainExpiry[] {
  const { ticker, spotPrice, historicalVolatility, simulationDate } = input;
  const strikes = generateStrikeRange(spotPrice);
  const expiries = generateExpiryDates(simulationDate);
  const r = RISK_FREE_RATE;

  // Seed random for consistent volume/OI per ticker+date
  const rand = seededRandom(
    Math.floor(simulationDate / 86400000) * 31 +
      ticker.charCodeAt(0) * 7 +
      ticker.length,
  );

  return expiries.map(({ expiry, daysToExpiry }) => {
    const T = daysToExpiry / 365;

    const calls: OptionContract[] = [];
    const puts: OptionContract[] = [];

    strikes.forEach((strike) => {
      const iv = getSkewedIV(historicalVolatility, strike, spotPrice);
      const moneyness = Math.abs(strike - spotPrice) / spotPrice;

      // ATM options have higher volume
      const atmFactor = Math.exp(-moneyness * moneyness * 50);
      const baseVolume = Math.floor(500 * atmFactor * (1 + rand() * 0.5));
      const baseOI = Math.floor(2000 * atmFactor * (1 + rand() * 0.8));

      // Generate call
      const callMid = blackScholes(spotPrice, strike, T, r, iv, "call");
      const callGreeks = calculateGreeks(spotPrice, strike, T, r, iv, "call");
      const callSpreadPct = 0.02 + moneyness * 0.03; // 2-5% spread
      const callSpread = Math.max(0.01, callMid * callSpreadPct);

      calls.push({
        ticker,
        type: "call",
        strike,
        expiry,
        daysToExpiry,
        style: "american",
        bid: Math.max(0.01, +(callMid - callSpread / 2).toFixed(2)),
        ask: Math.max(0.02, +(callMid + callSpread / 2).toFixed(2)),
        mid: +callMid.toFixed(2),
        last: +Math.max(0.01, callMid + (rand() - 0.5) * callSpread).toFixed(
          2,
        ),
        iv: +iv.toFixed(4),
        volume: baseVolume + Math.floor(rand() * 100),
        openInterest: baseOI + Math.floor(rand() * 500),
        greeks: roundGreeks(callGreeks),
        inTheMoney: spotPrice > strike,
      });

      // Generate put
      const putMid = blackScholes(spotPrice, strike, T, r, iv, "put");
      const putGreeks = calculateGreeks(spotPrice, strike, T, r, iv, "put");
      const putSpreadPct = 0.02 + moneyness * 0.03;
      const putSpread = Math.max(0.01, putMid * putSpreadPct);

      puts.push({
        ticker,
        type: "put",
        strike,
        expiry,
        daysToExpiry,
        style: "american",
        bid: Math.max(0.01, +(putMid - putSpread / 2).toFixed(2)),
        ask: Math.max(0.02, +(putMid + putSpread / 2).toFixed(2)),
        mid: +putMid.toFixed(2),
        last: +Math.max(0.01, putMid + (rand() - 0.5) * putSpread).toFixed(2),
        iv: +iv.toFixed(4),
        volume: baseVolume + Math.floor(rand() * 80),
        openInterest: baseOI + Math.floor(rand() * 400),
        greeks: roundGreeks(putGreeks),
        inTheMoney: spotPrice < strike,
      });
    });

    return { expiry, daysToExpiry, calls, puts };
  });
}

function roundGreeks(g: Greeks): Greeks {
  return {
    delta: +g.delta.toFixed(4),
    gamma: +g.gamma.toFixed(6),
    theta: +g.theta.toFixed(4),
    vega: +g.vega.toFixed(4),
    rho: +g.rho.toFixed(4),
    vanna: +g.vanna.toFixed(6),
    charm: +g.charm.toFixed(6),
    vomma: +g.vomma.toFixed(6),
    speed: +g.speed.toFixed(8),
  };
}
