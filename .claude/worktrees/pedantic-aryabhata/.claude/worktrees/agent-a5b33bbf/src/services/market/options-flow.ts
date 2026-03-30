// ---------------------------------------------------------------------------
// Options Flow / Unusual Activity Detector — Synthetic Flow Generator
// ---------------------------------------------------------------------------

export interface OptionsFlowItem {
  ticker: string;
  timestamp: number;
  type: "call" | "put";
  strike: number;
  expiry: string;
  side: "buy" | "sell";
  size: number;
  premium: number;
  spotPrice: number;
  iv: number;
  sentiment: "bullish" | "bearish" | "neutral";
  significance: "sweep" | "block" | "split" | "routine";
  educationalNote: string;
}

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickStrike(
  currentPrice: number,
  rand: () => number,
  type: "call" | "put",
): number {
  // Strikes in $1 or $5 increments depending on price level
  const increment = currentPrice > 100 ? 5 : 1;
  // OTM bias: calls above spot, puts below spot
  const direction = type === "call" ? 1 : -1;
  const offset = Math.floor(rand() * 8) * increment * direction;
  // Some ITM trades too (30% chance)
  const itm = rand() < 0.3 ? -direction * Math.floor(rand() * 3) * increment : 0;
  const raw = currentPrice + offset + itm;
  return Math.round(raw / increment) * increment;
}

function pickExpiry(rand: () => number): string {
  // Generate expiry 1-60 days out
  const daysOut = Math.floor(rand() * 60) + 1;
  const now = Date.now();
  const expiryDate = new Date(now + daysOut * 86400000);
  // Snap to Friday
  const dayOfWeek = expiryDate.getDay();
  const daysToFri = (5 - dayOfWeek + 7) % 7;
  expiryDate.setDate(expiryDate.getDate() + daysToFri);
  const yyyy = expiryDate.getFullYear();
  const mm = String(expiryDate.getMonth() + 1).padStart(2, "0");
  const dd = String(expiryDate.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function classifySentiment(
  type: "call" | "put",
  side: "buy" | "sell",
): "bullish" | "bearish" | "neutral" {
  if (type === "call" && side === "buy") return "bullish";
  if (type === "call" && side === "sell") return "bearish";
  if (type === "put" && side === "buy") return "bearish";
  if (type === "put" && side === "sell") return "bullish";
  return "neutral";
}

function classifySignificance(
  size: number,
  rand: () => number,
): "sweep" | "block" | "split" | "routine" {
  if (size >= 500) return rand() < 0.6 ? "sweep" : "block";
  if (size >= 200) return rand() < 0.4 ? "block" : "split";
  if (size >= 100) return rand() < 0.3 ? "split" : "routine";
  return "routine";
}

const EDUCATIONAL_NOTES: Record<string, string> = {
  sweep_buy_call:
    "A call sweep hitting multiple exchanges aggressively suggests urgency to get long exposure quickly. This is often institutional activity betting on upside.",
  sweep_buy_put:
    "A put sweep across exchanges indicates aggressive bearish positioning. Large traders are paying up to get protection or speculate on downside.",
  block_buy_call:
    "A large block call purchase negotiated off-exchange suggests institutional conviction in upside. The size indicates this is not retail activity.",
  block_buy_put:
    "A block put trade often represents hedging by a large portfolio. However, it can also be a directional bearish bet by a fund.",
  sweep_sell_call:
    "Selling calls in a sweep often means covered call writing or bearish speculation. The urgency suggests the seller wants to lock in premium quickly.",
  sweep_sell_put:
    "Selling puts in a sweep is a bullish strategy (willing to buy shares at the strike). Urgency may indicate conviction that the stock will stay above the strike.",
  split_buy_call:
    "A split order breaks a large call buy into smaller pieces to minimize market impact. This is a common institutional execution technique.",
  routine:
    "Routine-sized options trades represent normal market activity. Individual trades of this size are not typically significant.",
};

// ─── Main ────────────────────────────────────────────────────────────────────

/**
 * Generate 15-25 synthetic options flow trades for a ticker.
 * Uses seeded PRNG for deterministic output per ticker/price combination.
 */
export function generateOptionsFlow(
  ticker: string,
  currentPrice: number,
  iv: number,
): OptionsFlowItem[] {
  // Seed from ticker + price
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed = (seed * 31 + ticker.charCodeAt(i)) | 0;
  }
  seed = (seed * 17 + Math.round(currentPrice * 100)) | 0;
  const rand = mulberry32(seed);

  const count = Math.floor(rand() * 11) + 15; // 15-25 trades
  const flows: OptionsFlowItem[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const type: "call" | "put" = rand() < 0.55 ? "call" : "put";
    const side: "buy" | "sell" = rand() < 0.65 ? "buy" : "sell";
    const strike = pickStrike(currentPrice, rand, type);
    const expiry = pickExpiry(rand);

    // Size: log-normal distribution for realistic heavy tail
    const baseSize = Math.exp(rand() * 3 + 2); // ~7 to ~148
    const size = Math.round(baseSize + rand() * 400);

    // Premium: based on moneyness and IV
    const moneyness = Math.abs(strike - currentPrice) / currentPrice;
    const basePremium = currentPrice * iv * 0.1 * Math.max(0.05, 1 - moneyness * 5);
    const premium = Math.round(basePremium * (0.5 + rand()) * 100) / 100;

    // Timestamp: within last 2 hours
    const timestamp = now - Math.floor(rand() * 7200000);

    const tradeIV = Math.round((iv + (rand() - 0.5) * 0.1) * 1000) / 1000;
    const sentiment = classifySentiment(type, side);
    const significance = classifySignificance(size, rand);

    // Educational note
    const noteKey =
      significance === "routine"
        ? "routine"
        : `${significance}_${side}_${type}`;
    const educationalNote =
      EDUCATIONAL_NOTES[noteKey] ?? EDUCATIONAL_NOTES.routine;

    flows.push({
      ticker,
      timestamp,
      type,
      strike,
      expiry,
      side,
      size,
      premium,
      spotPrice: currentPrice,
      iv: tradeIV,
      sentiment,
      significance,
      educationalNote,
    });
  }

  // Sort by timestamp descending (most recent first)
  flows.sort((a, b) => b.timestamp - a.timestamp);

  return flows;
}
