import type {
  OptionChainExpiry,
  StrategyLeg,
  StrategyPreset,
  ChainAnalytics,
  UnusualActivityItem,
  StrategyRecommendation,
  OptionSentiment,
} from "@/types/options";
import { CONTRACT_MULTIPLIER } from "@/types/options";
import { STRATEGY_PRESETS } from "@/data/options/strategy-presets";
import { normalCDF } from "./black-scholes";
import { calculateBreakevens, calculateMaxProfitLoss } from "./payoff";

// ── Seeded PRNG (same as chain-generator) ─────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Format helpers ─────────────────────────────────────────────────────────

export function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

// ── Chain Analytics ────────────────────────────────────────────────────────

export function computeChainAnalytics(
  chain: OptionChainExpiry[],
  spotPrice: number,
  hv: number,
): ChainAnalytics {
  if (chain.length === 0 || spotPrice <= 0) {
    return {
      totalCallVolume: 0, totalPutVolume: 0, putCallRatioVolume: 1,
      totalCallOI: 0, totalPutOI: 0, putCallRatioOI: 1,
      atmIV: hv, historicalVolatility: hv, ivRank: 50, ivPercentile: 50,
      ivVsHvSpread: 0, expectedMove1SD: 0, heatScore: 0,
    };
  }

  let totalCallVol = 0, totalPutVol = 0;
  let totalCallOI = 0, totalPutOI = 0;

  for (const expiry of chain) {
    for (const c of expiry.calls) { totalCallVol += c.volume; totalCallOI += c.openInterest; }
    for (const p of expiry.puts) { totalPutVol += p.volume; totalPutOI += p.openInterest; }
  }

  // ATM IV from front-month expiry
  const frontMonth = chain[0];
  const atmStrike = frontMonth.calls.reduce((best, c) =>
    Math.abs(c.strike - spotPrice) < Math.abs(best.strike - spotPrice) ? c : best,
  );
  const atmIV = atmStrike.iv;

  // Simulated 52-week IV range based on historical vol
  const ivLow = hv * 0.5;
  const ivHigh = hv * 2.0;
  const ivRange = ivHigh - ivLow;
  const ivRank = ivRange > 0 ? Math.min(100, Math.max(0, ((atmIV - ivLow) / ivRange) * 100)) : 50;
  const ivPercentile = ivRank; // simplified: assume uniform distribution

  // Expected move = spot * atmIV * sqrt(dte / 365)
  const dte = frontMonth.daysToExpiry;
  const expectedMove1SD = spotPrice * atmIV * Math.sqrt(dte / 365);

  // ── Heat Score (0-100) ────────────────────────────────────────────────────
  // Component 1: IV Rank contribution (already 0-100, weight 0.4)
  const ivRankComponent = ivRank * 0.4;

  // Component 2: P/C ratio deviation (weight 0.3)
  // >1.5 = extreme put buying (bearish) = high score, <0.5 = extreme call buying = high score
  const pcRatio = totalCallVol > 0 ? totalPutVol / totalCallVol : 1;
  const pcDeviation = Math.abs(pcRatio - 1.0); // deviation from neutral (1.0)
  // Map deviation 0→0, 0.5→50, ≥1.0→100
  const pcComponent = Math.min(100, pcDeviation * 100) * 0.3;

  // Component 3: Unusual activity score (weight 0.3)
  // Estimate count via seeded PRNG — use same seed as generateUnusualActivity calls
  const uaSeed = Math.floor(spotPrice * 100) ^ (totalCallVol + totalPutVol);
  const uaItems = generateUnusualActivity(chain, spotPrice, uaSeed);
  // Score: scale count 0-25 to 0-100
  const uaComponent = Math.min(100, (uaItems.length / 25) * 100) * 0.3;

  const heatScore = Math.min(100, Math.max(0, +(ivRankComponent + pcComponent + uaComponent).toFixed(1)));

  return {
    totalCallVolume: totalCallVol,
    totalPutVolume: totalPutVol,
    putCallRatioVolume: totalCallVol > 0 ? +(totalPutVol / totalCallVol).toFixed(2) : 1,
    totalCallOI,
    totalPutOI,
    putCallRatioOI: totalCallOI > 0 ? +(totalPutOI / totalCallOI).toFixed(2) : 1,
    atmIV,
    historicalVolatility: hv,
    ivRank: +ivRank.toFixed(1),
    ivPercentile: +ivPercentile.toFixed(1),
    ivVsHvSpread: +(atmIV - hv).toFixed(4),
    expectedMove1SD: +expectedMove1SD.toFixed(2),
    heatScore,
  };
}

// ── Volatility Smile ───────────────────────────────────────────────────────

export function computeVolSmile(
  expiry: OptionChainExpiry,
  _spotPrice: number,
): { strike: number; callIV: number; putIV: number }[] {
  return expiry.calls.map((call, i) => ({
    strike: call.strike,
    callIV: call.iv,
    putIV: expiry.puts[i]?.iv ?? call.iv,
  }));
}

// ── Vol Term Structure ─────────────────────────────────────────────────────

export function computeVolTermStructure(
  chain: OptionChainExpiry[],
): { dte: number; atmIV: number; expiry: string }[] {
  return chain.map((exp) => {
    const mid = Math.floor(exp.calls.length / 2);
    const atmIV = exp.calls[mid]?.iv ?? 0;
    return { dte: exp.daysToExpiry, atmIV, expiry: exp.expiry };
  });
}

// ── OI / Volume by Strike ──────────────────────────────────────────────────

export function computeOIVolByStrike(
  expiry: OptionChainExpiry,
): { strike: number; callOI: number; putOI: number; callVol: number; putVol: number }[] {
  return expiry.calls.map((call, i) => ({
    strike: call.strike,
    callOI: call.openInterest,
    putOI: expiry.puts[i]?.openInterest ?? 0,
    callVol: call.volume,
    putVol: expiry.puts[i]?.volume ?? 0,
  }));
}

// ── Unusual Activity ───────────────────────────────────────────────────────

export function generateUnusualActivity(
  chain: OptionChainExpiry[],
  spotPrice: number,
  seed: number,
): UnusualActivityItem[] {
  const rand = seededRandom(seed);
  const items: UnusualActivityItem[] = [];
  const now = Date.now();
  const twoHours = 2 * 60 * 60 * 1000;

  // Pick contracts with notable premiums across all expiries
  const candidates: { expiry: OptionChainExpiry; type: "call" | "put"; idx: number }[] = [];
  for (const exp of chain) {
    for (let i = 0; i < exp.calls.length; i++) {
      if (exp.calls[i].volume > 50) candidates.push({ expiry: exp, type: "call", idx: i });
      if (exp.puts[i].volume > 50) candidates.push({ expiry: exp, type: "put", idx: i });
    }
  }

  // Shuffle candidates using seeded rand
  const shuffled = [...candidates].sort(() => rand() - 0.5);
  const selected = shuffled.slice(0, 25);

  for (const { expiry, type, idx } of selected) {
    const contract = type === "call" ? expiry.calls[idx] : expiry.puts[idx];
    const r = rand();

    // Order type: 5% floor, 30% sweep, 65% normal
    const orderType: UnusualActivityItem["orderType"] =
      r < 0.05 ? "floor" : r < 0.35 ? "sweep" : "normal";

    // Side: ask = aggressive buy (bullish for calls/puts), bid = sell
    const sideR = rand();
    const side: "ask" | "bid" = sideR > 0.45 ? "ask" : "bid";

    // Sentiment: calls on ask = bullish, puts on ask = bearish, etc.
    let sentiment: UnusualActivityItem["sentiment"];
    if (type === "call" && side === "ask") sentiment = "bullish";
    else if (type === "put" && side === "ask") sentiment = "bearish";
    else if (type === "call" && side === "bid") sentiment = "bearish";
    else sentiment = "bullish";

    // Size: floor trades are larger
    const baseSize = Math.floor(contract.volume * (0.1 + rand() * 0.4));
    const size = Math.max(10, orderType === "floor" ? baseSize * 5 : baseSize);

    const price = type === "call" ? expiry.calls[idx].mid : expiry.puts[idx].mid;
    const premium = +(price * size * CONTRACT_MULTIPLIER).toFixed(0);

    items.push({
      id: `ua-${seed}-${idx}-${type}`,
      ticker: contract.ticker,
      expiry: expiry.expiry,
      dte: expiry.daysToExpiry,
      strike: contract.strike,
      type,
      side,
      sentiment,
      orderType,
      size,
      price: +price.toFixed(2),
      premium,
      bid: contract.bid,
      ask: contract.ask,
      timestamp: now - Math.floor(rand() * twoHours),
    });
  }

  // Sort by timestamp descending (most recent first)
  return items.sort((a, b) => b.timestamp - a.timestamp);
}

// ── Probability of Profit ─────────────────────────────────────────────────

export function computeProbabilityOfProfit(
  legs: StrategyLeg[],
  spotPrice: number,
  atmIV: number,
  dte: number,
): number {
  if (legs.length === 0 || spotPrice <= 0 || dte <= 0) return 50;

  const breakevens = calculateBreakevens(legs, spotPrice);
  if (breakevens.length === 0) return 50;

  const T = Math.max(dte, 1) / 365;
  const sigma = Math.max(atmIV, 0.01);

  // For each breakeven, calculate P(spot > BE) using lognormal model
  // P(S_T > K) = N(d2) where d2 = (ln(S/K) + (r - 0.5σ²)T) / (σ√T)
  const r = 0.05;
  const probs = breakevens.map((be) => {
    const d2 = (Math.log(spotPrice / be) + (r - 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    return normalCDF(d2) * 100;
  });

  // Single breakeven: P/P = P(spot > BE) for debit trades (net positive above BE)
  // For multi-breakeven spreads: average (simplified)
  const avgProb = probs.reduce((s, p) => s + p, 0) / probs.length;
  return Math.min(99, Math.max(1, +avgProb.toFixed(1)));
}

// ── Strategy Recommendations ───────────────────────────────────────────────

function buildLegsFromPreset(
  preset: StrategyPreset,
  chain: OptionChainExpiry,
  spotPrice: number,
): StrategyLeg[] {
  const strikes = chain.calls.map((c) => c.strike);
  const atmIdx = strikes.reduce(
    (best, s, i) =>
      Math.abs(s - spotPrice) < Math.abs(strikes[best] - spotPrice) ? i : best,
    0,
  );
  const spacing = strikes.length > 1 ? Math.abs(strikes[1] - strikes[0]) : 5;

  return preset.legs.map((legTemplate, i) => {
    const offset = preset.strikeOffsets[i] ?? 0;
    const targetStrike = strikes[atmIdx] + offset * spacing;
    const nearestStrike = strikes.reduce((best, s) =>
      Math.abs(s - targetStrike) < Math.abs(best - targetStrike) ? s : best,
    );
    const contracts = legTemplate.type === "call" ? chain.calls : chain.puts;
    const contract = contracts.find((c) => c.strike === nearestStrike);
    const price = legTemplate.side === "buy" ? (contract?.ask ?? 0) : (contract?.bid ?? 0);

    return {
      type: legTemplate.type,
      side: legTemplate.side,
      strike: nearestStrike,
      expiry: chain.expiry,
      quantity: legTemplate.quantity,
      price,
      greeks: contract?.greeks ?? {
        delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0,
        vanna: 0, charm: 0, vomma: 0, speed: 0,
      },
    };
  });
}

const SENTIMENT_PRESETS: Record<OptionSentiment, string[]> = {
  bullish: ["long_call", "bull_call_spread", "covered_call", "protective_put"],
  very_bullish: ["long_call", "bull_call_spread"],
  neutral: ["iron_condor", "iron_butterfly", "butterfly", "calendar_spread"],
  directional: ["straddle", "strangle"],
  very_bearish: ["long_put", "bear_put_spread"],
  bearish: ["long_put", "bear_put_spread", "covered_call"],
};

export function generateStrategyRecommendations(
  sentiment: OptionSentiment,
  chain: OptionChainExpiry[],
  spotPrice: number,
  selectedExpiry: string,
  atmIV: number,
  dte: number,
): StrategyRecommendation[] {
  if (chain.length === 0) return [];

  const targetExpiry = chain.find((c) => c.expiry === selectedExpiry) ?? chain[0];
  const allowedIds = SENTIMENT_PRESETS[sentiment];
  const presets = STRATEGY_PRESETS.filter((p) => allowedIds.includes(p.id));

  const recommendations: StrategyRecommendation[] = [];

  for (const preset of presets) {
    try {
      const legs = buildLegsFromPreset(preset, targetExpiry, spotPrice);
      if (legs.length === 0) continue;

      const { maxProfit, maxLoss } = calculateMaxProfitLoss(legs, spotPrice);
      const breakevens = calculateBreakevens(legs, spotPrice);
      const pop = computeProbabilityOfProfit(legs, spotPrice, atmIV, dte);

      // Return on risk (finite only)
      let returnOnRisk = 0;
      if (typeof maxProfit === "number" && typeof maxLoss === "number" && maxLoss !== 0) {
        returnOnRisk = +(maxProfit / Math.abs(maxLoss)).toFixed(2);
      }

      // Mini payoff: 20 normalized points
      const miniPayoff: { x: number; y: number }[] = [];
      const spotRange = Array.from({ length: 20 }, (_, i) => spotPrice * (0.7 + (i / 19) * 0.6));
      const netDebit = legs.reduce((sum, leg) => {
        const sign = leg.side === "buy" ? 1 : -1;
        return sum + sign * leg.price * leg.quantity * CONTRACT_MULTIPLIER;
      }, 0);

      for (const S of spotRange) {
        let pnl = -netDebit;
        for (const leg of legs) {
          const intrinsic = leg.type === "call"
            ? Math.max(S - leg.strike, 0)
            : Math.max(leg.strike - S, 0);
          const sign = leg.side === "buy" ? 1 : -1;
          pnl += sign * intrinsic * leg.quantity * CONTRACT_MULTIPLIER;
        }
        miniPayoff.push({ x: S / spotPrice, y: +pnl.toFixed(2) });
      }

      recommendations.push({
        preset,
        legs,
        probabilityOfProfit: pop,
        probabilityITM: pop, // simplified
        maxProfit,
        maxLoss,
        returnOnRisk,
        breakevens,
        miniPayoff,
      });
    } catch {
      // Skip presets that fail to compute
    }
  }

  return recommendations.sort((a, b) => b.probabilityOfProfit - a.probabilityOfProfit);
}
