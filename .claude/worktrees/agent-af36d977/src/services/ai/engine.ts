import type { OHLCVBar } from "@/types/market";
import type { IndicatorType } from "@/stores/chart-store";
import type { Position, TradeRecord } from "@/types/trading";
import {
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateSMA,
  calculateEMA,
  calculateADX,
  calculateOBV,
  calculateCCI,
  calculateWilliamsR,
  calculateParabolicSAR,
  calculateVWAP,
  calculateATR,
  calculateStochastic,
  type IndicatorPoint,
  type MACDHistogramPoint,
} from "@/services/indicators";
import {
  detectSignals,
  type Signal,
  type IndicatorSnapshot,
  type SignalDirection,
} from "./signals";
import { detectCandlePatterns, type CandlePattern } from "./patterns";
import { detectMarketRegime, type RegimeAnalysis } from "./regime";
import { detectDivergences, type Divergence } from "./divergence";
import { detectLevels, type PriceLevel, type PivotPoints } from "./levels";
import {
  analyzeTraderPersonality,
  type TraderProfile,
} from "./personality";
import { FUNDAMENTALS } from "@/data/fundamentals";

export type { RegimeAnalysis, Divergence, PriceLevel, PivotPoints, TraderProfile };

export interface TradePlan {
  entryZone: [number, number];   // [lower, upper] price band
  stopLoss: number;              // price
  target1: number;               // first take-profit
  target2: number;               // second take-profit
  positionSize: number;          // shares (2% account risk rule, $100k default)
  riskRewardRatio: number;       // |target1 - entry| / |entry - stopLoss|
  rationale: string;             // e.g. "Stop below Swing Low $185.20; T1 at R1 Pivot $192.40"
}

export interface HabitObservation {
  observation: string;   // e.g. "You typically win when holding > 3 bars"
  positive: boolean;     // true = strength, false = area to improve
}

export interface AnalysisResult {
  score: number;
  rawScore: number;
  bias: "bullish" | "bearish" | "neutral";
  conviction: "low" | "medium" | "high";
  regime: RegimeAnalysis;
  signals: Signal[];
  patterns: CandlePattern[];
  divergences: Divergence[];
  levels: { supports: PriceLevel[]; resistances: PriceLevel[]; pivots: PivotPoints };
  traderProfile: TraderProfile | null;
  habits: HabitObservation[];  // top behavioral observations from trade history
  sectorRotation: string | null;  // sector rotation narrative
  text: string;
  summary: string;      // 1–2 sentence punchy coach comment
  setupName: string | null;  // named setup: "Bull Confluence Setup", "Divergence Reversal", etc.
  insights: string[];   // 2–4 specific, engaging coach observations
  grade?: string;       // "A"|"B"|"C"|"D"|"F" — review mode only
  wentWell?: string;    // review mode: what went well (short)
  improve?: string;     // review mode: what to improve (short)
  tradePlan: TradePlan | null;  // concrete entry/stop/target plan (null if neutral/low conviction)
}

// ─── Snapshot Extraction ────────────────────────────────────────────────────

function extractSnapshot(
  bars: OHLCVBar[],
  activeIndicators: IndicatorType[],
): {
  current: IndicatorSnapshot;
  prev: IndicatorSnapshot | null;
  rsiValues: IndicatorPoint[];
  macdHistValues: MACDHistogramPoint[];
} {
  const has = (ind: IndicatorType) => activeIndicators.includes(ind);
  const last = bars[bars.length - 1];
  const secondLast = bars.length >= 2 ? bars[bars.length - 2] : null;

  if (!last) {
    return {
      current: { close: 0, open: 0, high: 0, low: 0, volume: 0 },
      prev: null,
      rsiValues: [],
      macdHistValues: [],
    };
  }

  const current: IndicatorSnapshot = {
    close: last.close,
    open: last.open,
    high: last.high,
    low: last.low,
    volume: last.volume,
    prevClose: secondLast?.close,
  };
  const prev: IndicatorSnapshot = secondLast
    ? {
        close: secondLast.close,
        open: secondLast.open,
        high: secondLast.high,
        low: secondLast.low,
        volume: secondLast.volume,
      }
    : null!;

  // Compute RSI once — used for both snapshot values and divergence detection
  let rsiValues: IndicatorPoint[] = [];
  if (has("rsi") && bars.length >= 15) {
    rsiValues = calculateRSI(bars, 14);
    const d = rsiValues;
    if (d.length >= 1) current.rsi = d[d.length - 1].value;
    if (d.length >= 2 && prev) prev.rsi = d[d.length - 2].value;
  }

  // Compute MACD once — used for both snapshot values and divergence detection
  let macdHistValues: MACDHistogramPoint[] = [];
  if (has("macd") && bars.length >= 35) {
    const d = calculateMACD(bars);
    macdHistValues = d.histogram;
    if (d.macdLine.length >= 1) current.macdLine = d.macdLine[d.macdLine.length - 1].value;
    if (d.signalLine.length >= 1) current.macdSignal = d.signalLine[d.signalLine.length - 1].value;
    if (d.histogram.length >= 1) current.macdHistogram = d.histogram[d.histogram.length - 1].value;
    if (d.histogram.length >= 2 && prev) {
      prev.macdHistogram = d.histogram[d.histogram.length - 2].value;
      prev.macdLine = d.macdLine.length >= 2 ? d.macdLine[d.macdLine.length - 2].value : undefined;
    }
  }

  if (has("bollinger") && bars.length >= 20) {
    const d = calculateBollingerBands(bars, 20, 2);
    if (d.upper.length >= 1) {
      current.bbUpper = d.upper[d.upper.length - 1].value;
      current.bbMiddle = d.middle[d.middle.length - 1].value;
      current.bbLower = d.lower[d.lower.length - 1].value;
      if (current.bbUpper && current.bbLower) current.bbWidth = current.bbUpper - current.bbLower;
    }
    if (d.upper.length >= 2 && prev) {
      prev.bbUpper = d.upper[d.upper.length - 2].value;
      prev.bbMiddle = d.middle[d.middle.length - 2].value;
      prev.bbLower = d.lower[d.lower.length - 2].value;
      if (prev.bbUpper && prev.bbLower) {
        prev.bbWidth = prev.bbUpper - prev.bbLower;
        current.prevBbWidth = prev.bbWidth;
      }
    }
  }

  if (has("sma20") && bars.length >= 20) {
    const d = calculateSMA(bars, 20);
    if (d.length >= 1) current.sma20 = d[d.length - 1].value;
    if (d.length >= 2 && prev) prev.sma20 = d[d.length - 2].value;
  }

  if (has("sma50") && bars.length >= 50) {
    const d = calculateSMA(bars, 50);
    if (d.length >= 1) current.sma50 = d[d.length - 1].value;
    if (d.length >= 2 && prev) prev.sma50 = d[d.length - 2].value;
  }

  if (has("ema12") && bars.length >= 12) {
    const d = calculateEMA(bars, 12);
    if (d.length >= 1) current.ema12 = d[d.length - 1].value;
  }

  if (has("ema26") && bars.length >= 26) {
    const d = calculateEMA(bars, 26);
    if (d.length >= 1) current.ema26 = d[d.length - 1].value;
  }

  if (has("adx") && bars.length >= 28) {
    const d = calculateADX(bars, 14);
    if (d.length >= 1) current.adx = d[d.length - 1].value;
  }

  if (has("obv") && bars.length >= 2) {
    const d = calculateOBV(bars);
    if (d.length >= 1) current.obvCurrent = d[d.length - 1].value;
    if (d.length >= 2) current.obvPrev = d[d.length - 2].value;
  }

  if (has("cci") && bars.length >= 20) {
    const d = calculateCCI(bars, 20);
    if (d.length >= 1) current.cci = d[d.length - 1].value;
    if (d.length >= 2 && prev) prev.cci = d[d.length - 2].value;
  }

  if (has("williams_r") && bars.length >= 14) {
    const d = calculateWilliamsR(bars, 14);
    if (d.length >= 1) current.williamsR = d[d.length - 1].value;
    if (d.length >= 2 && prev) prev.williamsR = d[d.length - 2].value;
  }

  if (has("psar") && bars.length >= 10) {
    const d = calculateParabolicSAR(bars, 0.02, 0.2);
    if (d.length >= 1) current.psarValue = d[d.length - 1].value;
    if (d.length >= 2 && prev) prev.psarValue = d[d.length - 2].value;
  }

  if (has("vwap") && bars.length >= 1) {
    const d = calculateVWAP(bars);
    if (d.length >= 1) current.vwap = d[d.length - 1].value;
    if (d.length >= 2 && prev) prev.vwap = d[d.length - 2].value;
  }

  if (has("atr") && bars.length >= 20) {
    const d = calculateATR(bars, 14);
    if (d.length >= 1) current.atr = d[d.length - 1].value;
    if (d.length >= 10) {
      current.atrAvg = d.slice(-10).reduce((s, p) => s + p.value, 0) / 10;
    }
  }

  if (has("stochastic") && bars.length >= 17) {
    const d = calculateStochastic(bars, 14, 3);
    if (d.kLine.length >= 1) current.stochK = d.kLine[d.kLine.length - 1].value;
    if (d.dLine.length >= 1) current.stochD = d.dLine[d.dLine.length - 1].value;
    if (d.kLine.length >= 2 && prev) prev.stochK = d.kLine[d.kLine.length - 2].value;
    if (d.dLine.length >= 2 && prev) prev.stochD = d.dLine[d.dLine.length - 2].value;
  }

  return { current, prev: secondLast ? prev : null, rsiValues, macdHistValues };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function clampScore(v: number): number {
  return Math.max(-100, Math.min(100, Math.round(v)));
}

function scoreBias(score: number): "bullish" | "bearish" | "neutral" {
  if (score >= 15) return "bullish";
  if (score <= -15) return "bearish";
  return "neutral";
}

function computeConviction(
  signals: Signal[],
  score: number,
): "low" | "medium" | "high" {
  const directional = signals.filter((s) => s.direction !== "neutral").length;
  const absScore = Math.abs(score);
  if (directional >= 7 && absScore >= 40) return "high";
  if (directional >= 4 && absScore >= 20) return "medium";
  return "low";
}

function calcRiskReward(
  close: number,
  nearestRes: PriceLevel | undefined,
  nearestSup: PriceLevel | undefined,
): string {
  if (!nearestRes || !nearestSup) return "N/A";
  const reward = nearestRes.price - close;
  const risk = close - nearestSup.price;
  if (risk <= 0 || reward <= 0) return "N/A";
  const ratio = reward / risk;
  if (ratio > 10) return "1:10+";
  return `1:${ratio.toFixed(1)}`;
}

function levelStr(level: PriceLevel): string {
  return `$${level.price.toFixed(2)} (${level.label})`;
}

function topSignals(signals: Signal[], count: number): Signal[] {
  return [...signals]
    .filter((s) => s.direction !== "neutral")
    .sort((a, b) => b.strength - a.strength)
    .slice(0, count);
}

function volatilityLevel(snap: IndicatorSnapshot): string {
  if (snap.atr !== undefined && snap.atrAvg !== undefined && snap.atrAvg > 0) {
    const ratio = snap.atr / snap.atrAvg;
    if (ratio > 1.5) return "elevated";
    if (ratio < 0.7) return "compressed";
  }
  return "normal";
}

// Default regime for when we don't have enough data
function defaultRegime(): RegimeAnalysis {
  return {
    regime: "ranging",
    label: "Ranging",
    color: "amber",
    adxLevel: "weak",
    trendDirection: "sideways",
    scoreMultiplier: 0.85,
  };
}

function defaultLevels(): AnalysisResult["levels"] {
  return {
    supports: [],
    resistances: [],
    pivots: { pp: 0, r1: 0, r2: 0, r3: 0, s1: 0, s2: 0, s3: 0 },
  };
}

// ─── Sector Rotation Model ──────────────────────────────────────────────────

const SECTOR_MAP: Record<string, string> = {
  AAPL: "Technology",
  MSFT: "Technology",
  GOOG: "Technology",
  META: "Technology",
  AMZN: "Consumer/Cloud",
  NVDA: "Semiconductors",
  TSLA: "EV/Automotive",
  JPM: "Financial",
  SPY: "Broad Market",
  QQQ: "Tech Index",
};

// Seeded PRNG: same formula used elsewhere in the codebase
function seededRand(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function detectSectorRotation(ticker: string, barTimestamp: number): string {
  const sector = SECTOR_MAP[ticker] ?? "Equity";

  // Derive a slowly-changing seed from date (changes daily)
  const daySeed = Math.floor(barTimestamp / 86400) * 17 + 0x1a2b;
  const rand = seededRand(daySeed);
  const r1 = rand();
  const r2 = rand();
  const r3 = rand();

  // Determine macro rotation theme
  const themes = [
    {
      name: "risk-off",
      leading: ["Utilities", "Healthcare", "Consumer Staples"],
      lagging: ["Technology", "Semiconductors", "EV/Automotive"],
      narrative: "risk-off positioning: defensives outperforming, growth lagging",
    },
    {
      name: "risk-on",
      leading: ["Technology", "Semiconductors", "Consumer/Cloud"],
      lagging: ["Utilities", "Financial", "Broad Market"],
      narrative: "risk-on rotation: growth sectors leading, defensives underperforming",
    },
    {
      name: "value",
      leading: ["Financial", "Broad Market", "Consumer/Cloud"],
      lagging: ["Tech Index", "Semiconductors", "Technology"],
      narrative: "value rotation: cyclicals and financials gaining, tech multiples compressing",
    },
    {
      name: "reflation",
      leading: ["Financial", "EV/Automotive", "Consumer/Cloud"],
      lagging: ["Tech Index", "Technology"],
      narrative: "reflation trade: rate-sensitive and cyclical sectors moving higher",
    },
  ];

  const theme = themes[Math.floor(r1 * themes.length)];

  // Assess current ticker's sector position in this rotation
  const isLeading = theme.leading.includes(sector);
  const isLagging = theme.lagging.includes(sector);

  const leadingStr = theme.leading.slice(0, 2).join(", ");
  const laggingStr = theme.lagging.slice(0, 2).join(", ");

  let sectorComment = "";
  if (isLeading) {
    sectorComment = ` ${ticker} (${sector}) is in a leading sector — rotation tailwind present.`;
  } else if (isLagging) {
    sectorComment = ` ${ticker} (${sector}) is in a lagging sector — rotation headwind to watch.`;
  } else {
    sectorComment = ` ${ticker} (${sector}) is in a neutral sector for this rotation.`;
  }

  // Momentum fade comment
  const fadeComment =
    r2 > 0.6
      ? ` ${theme.leading[0]} momentum ${r3 > 0.5 ? "accelerating" : "fading"}.`
      : "";

  return `Sector rotation signals suggest ${theme.narrative}. Leading: ${leadingStr}. Lagging: ${laggingStr}.${sectorComment}${fadeComment}`;
}

// ─── Behavioral Habit Analysis ───────────────────────────────────────────────

export function buildHabitObservations(
  tradeHistory: TradeRecord[],
): HabitObservation[] {
  const sells = tradeHistory.filter(
    (t) => t.side === "sell" && t.realizedPnL !== undefined,
  );
  if (sells.length < 4) return [];

  const observations: HabitObservation[] = [];

  // 1. Hold duration analysis — inferred from simulationDate ordering
  // Buys immediately preceding each sell in history order
  const buyRecords = tradeHistory.filter((t) => t.side === "buy");
  const holdDurations: number[] = [];
  for (const sell of sells) {
    const matchBuy = buyRecords.find(
      (b) => b.ticker === sell.ticker && b.simulationDate < sell.simulationDate,
    );
    if (matchBuy) {
      // Duration in "bars" approximated as day difference (each simulation day ~ 1 bar)
      holdDurations.push(sell.simulationDate - matchBuy.simulationDate);
    }
  }

  if (holdDurations.length >= 3) {
    const avgHold = holdDurations.reduce((s, v) => s + v, 0) / holdDurations.length;
    const shortHolds = sells.filter((_, i) => holdDurations[i] !== undefined && holdDurations[i] <= 1);
    const longHolds = sells.filter((_, i) => holdDurations[i] !== undefined && holdDurations[i] >= 3);

    const shortWinRate = shortHolds.length > 0
      ? shortHolds.filter((t) => (t.realizedPnL ?? 0) > 0).length / shortHolds.length
      : null;
    const longWinRate = longHolds.length > 0
      ? longHolds.filter((t) => (t.realizedPnL ?? 0) > 0).length / longHolds.length
      : null;

    if (longWinRate !== null && shortWinRate !== null) {
      if (longWinRate > shortWinRate + 0.15) {
        observations.push({
          observation: `Holding longer than 3 bars improves your win rate (${(longWinRate * 100).toFixed(0)}% vs ${(shortWinRate * 100).toFixed(0)}% for quick exits).`,
          positive: true,
        });
      } else if (shortWinRate > longWinRate + 0.15) {
        observations.push({
          observation: `Quick exits work better for you — your short holds win ${(shortWinRate * 100).toFixed(0)}% vs ${(longWinRate * 100).toFixed(0)}% for long holds.`,
          positive: true,
        });
      }
    } else if (avgHold < 1.5) {
      observations.push({
        observation: `You exit trades quickly on average. Consider holding winners longer with a trailing stop.`,
        positive: false,
      });
    }
  }

  // 2. Win/loss streak patterns
  const pnls = sells.map((t) => t.realizedPnL ?? 0);
  let maxLossStreak = 0;
  let cur = 0;
  for (const p of pnls) {
    if (p < 0) { cur++; maxLossStreak = Math.max(maxLossStreak, cur); } else { cur = 0; }
  }
  if (maxLossStreak >= 3) {
    observations.push({
      observation: `You've had losing streaks of ${maxLossStreak}+ in a row. Taking a break after 2 consecutive losses can protect capital.`,
      positive: false,
    });
  }

  // 3. Average loss vs average win size
  const wins = sells.filter((t) => (t.realizedPnL ?? 0) > 0);
  const losses = sells.filter((t) => (t.realizedPnL ?? 0) < 0);
  if (wins.length > 1 && losses.length > 1) {
    const avgWin = wins.reduce((s, t) => s + (t.realizedPnL ?? 0), 0) / wins.length;
    const avgLoss = Math.abs(losses.reduce((s, t) => s + (t.realizedPnL ?? 0), 0) / losses.length);
    if (avgLoss > avgWin * 1.4) {
      observations.push({
        observation: `Your average loss ($${avgLoss.toFixed(0)}) exceeds your average win ($${avgWin.toFixed(0)}). Cutting losses faster improves overall profitability.`,
        positive: false,
      });
    } else if (avgWin > avgLoss * 1.8) {
      observations.push({
        observation: `Strong asymmetry — average win ($${avgWin.toFixed(0)}) is ${(avgWin / avgLoss).toFixed(1)}× your average loss. Keep letting winners run.`,
        positive: true,
      });
    }
  }

  // 4. Side preference (long vs short implied from P&L sign and context)
  const winRate = wins.length / sells.length;
  if (winRate >= 0.6) {
    observations.push({
      observation: `${(winRate * 100).toFixed(0)}% win rate across ${sells.length} closed trades — strong setup selection.`,
      positive: true,
    });
  } else if (winRate < 0.4 && sells.length >= 6) {
    observations.push({
      observation: `${(winRate * 100).toFixed(0)}% win rate — entries may be too early. Wait for more indicator confluence before committing.`,
      positive: false,
    });
  }

  // 5. Consistency across tickers
  const byTicker: Record<string, { wins: number; total: number }> = {};
  for (const t of sells) {
    if (!byTicker[t.ticker]) byTicker[t.ticker] = { wins: 0, total: 0 };
    byTicker[t.ticker].total++;
    if ((t.realizedPnL ?? 0) > 0) byTicker[t.ticker].wins++;
  }
  const tickerEntries = Object.entries(byTicker).filter(([, v]) => v.total >= 2);
  if (tickerEntries.length >= 2) {
    const best = tickerEntries.sort((a, b) => b[1].wins / b[1].total - a[1].wins / a[1].total)[0];
    const bestWR = best[1].wins / best[1].total;
    if (bestWR >= 0.7) {
      observations.push({
        observation: `You perform best on ${best[0]} with a ${(bestWR * 100).toFixed(0)}% win rate — consider focusing on your strongest ticker.`,
        positive: true,
      });
    }
  }

  return observations.slice(0, 3);
}

// ─── Named Setup Detection ───────────────────────────────────────────────────

function detectSetup(
  signals: Signal[],
  divergences: Divergence[],
  bias: "bullish" | "bearish" | "neutral",
  conviction: "low" | "medium" | "high",
  snap: IndicatorSnapshot,
  levels: AnalysisResult["levels"],
  currentPrice: number,
): string | null {
  const hasSignal = (id: string) => signals.some((s) => s.id === id);
  const hasDiv = divergences.length > 0;
  const rsi = snap.rsi ?? 50;
  const atSupport = levels.supports.some(
    (l) => Math.abs(l.price - currentPrice) / currentPrice < 0.012,
  );
  const atResistance = levels.resistances.some(
    (l) => Math.abs(l.price - currentPrice) / currentPrice < 0.012,
  );

  if (bias === "bullish") {
    if (conviction === "high") {
      if (hasDiv && rsi < 35) return "Divergence Reversal";
      if (hasSignal("macd_cross_bull") && rsi < 35) return "Double Confirmation Bounce";
      if (hasSignal("golden_cross")) return "Golden Cross Breakout";
      if (hasSignal("psar_flip_bull")) return "Trend Flip Entry";
      if (atSupport) return "Support Defense Play";
      return "Bull Confluence Setup";
    }
    if (conviction === "medium") {
      if (rsi < 35) return "Oversold Bounce Watch";
      if (hasSignal("macd_cross_bull")) return "MACD Entry Signal";
      return "Bullish Developing";
    }
  }

  if (bias === "bearish") {
    if (conviction === "high") {
      if (hasDiv && rsi > 65) return "Bearish Divergence Top";
      if (atResistance) return "Resistance Rejection";
      return "Bear Pressure Confirmed";
    }
    if (conviction === "medium") {
      if (rsi > 65) return "Overbought Fade Setup";
      return "Bearish Developing";
    }
  }

  return null;
}

// ─── Fundamental Insight ─────────────────────────────────────────────────────

function getFundamentalInsight(ticker: string, currentPrice: number): string | null {
  const f = FUNDAMENTALS[ticker];
  if (!f || f.sector === "ETF") return null;

  const pePremium =
    f.sectorAvgPE > 0
      ? Math.round(((f.peRatio - f.sectorAvgPE) / f.sectorAvgPE) * 100)
      : 0;
  const valuation =
    pePremium > 25
      ? "expensive vs peers"
      : pePremium < -15
      ? "undervalued vs peers"
      : "fairly valued";
  const growth =
    f.epsGrowthYoY > 20
      ? "high-growth"
      : f.epsGrowthYoY < 0
      ? "declining earnings"
      : "moderate growth";
  const earningsStr =
    f.lastEarningsResult === "beat"
      ? `beat estimates by ${f.earningsSurprisePct}%`
      : f.lastEarningsResult === "miss"
      ? `missed estimates by ${Math.abs(f.earningsSurprisePct)}%`
      : "met estimates";
  const targetUpside =
    currentPrice > 0 && f.priceTarget > 0
      ? Math.round((f.priceTarget / currentPrice - 1) * 100)
      : null;

  return `${ticker} fundamentals: ${valuation} at ${f.peRatio}× P/E (sector avg ${f.sectorAvgPE}×); ${growth} (EPS ${f.epsGrowthYoY > 0 ? "+" : ""}${f.epsGrowthYoY}% YoY); ${f.analystRating} consensus (${f.analystCount} analysts${targetUpside != null ? `, PT $${f.priceTarget} = ${targetUpside > 0 ? "+" : ""}${targetUpside}% upside` : ""}); last quarter ${earningsStr}.`;
}

// ─── Insights Builder ────────────────────────────────────────────────────────

function buildInsights(
  signals: Signal[],
  divergences: Divergence[],
  levels: AnalysisResult["levels"],
  snap: IndicatorSnapshot,
  traderProfile: TraderProfile | null,
  bias: string,
  regime: RegimeAnalysis,
  currentPrice: number,
  ticker?: string,
): string[] {
  const insights: string[] = [];
  const rsi = snap.rsi;
  const nearestSup = levels.supports[0];
  const nearestRes = levels.resistances[0];

  // 1. RSI insight
  if (rsi !== undefined) {
    if (rsi < 25) {
      insights.push(
        `RSI at ${rsi.toFixed(1)} — capitulation-level oversold. These readings historically precede sharp bounces, especially with MACD confirmation.`,
      );
    } else if (rsi < 35) {
      insights.push(
        `RSI at ${rsi.toFixed(1)} — hitting oversold territory. Buyers tend to step in here, especially when price is near a support level.`,
      );
    } else if (rsi > 75) {
      insights.push(
        `RSI at ${rsi.toFixed(1)} — momentum is stretched. The first strong red candle here is often the fade trigger that stops the run.`,
      );
    } else if (rsi > 65) {
      insights.push(
        `RSI at ${rsi.toFixed(1)} — approaching overbought. Bulls are still in control but the crowd is getting crowded. Watch for exhaustion.`,
      );
    }
  }

  // 2. Divergence insight
  if (divergences.length > 0) {
    const d = divergences[0];
    if (d.type === "bullish") {
      insights.push(
        `Bullish divergence confirmed — price hit a lower low but ${d.indicator.toUpperCase()} held higher lows. This disconnect often precedes reversals. Don't ignore it.`,
      );
    } else {
      insights.push(
        `Bearish divergence active — price pushed to a higher high but ${d.indicator.toUpperCase()} is declining. Momentum doesn't confirm the breakout. Stay cautious.`,
      );
    }
  }

  // 3. Level proximity insight
  if (nearestSup && Math.abs(nearestSup.price - currentPrice) / currentPrice < 0.015) {
    insights.push(
      `Price is sitting right on ${nearestSup.label} at $${nearestSup.price.toFixed(2)} — a live test of support. A close above keeps bulls in the driver's seat.`,
    );
  } else if (nearestRes && Math.abs(nearestRes.price - currentPrice) / currentPrice < 0.015) {
    insights.push(
      `Price is pressing against ${nearestRes.label} at $${nearestRes.price.toFixed(2)} — the make-or-break level. Volume will tell you if this is a breakout or a bull trap.`,
    );
  }

  // 4. Regime insight
  if (regime.regime === "strong_bull" || regime.regime === "strong_bear") {
    const dir = regime.trendDirection === "up" ? "uptrend" : "downtrend";
    insights.push(
      `ADX confirms a strong ${dir} in ${regime.label} regime. Don't fight the tape — trend-following setups outperform counter-trend here.`,
    );
  } else if (regime.regime === "ranging") {
    insights.push(
      `Market is coiling in a range — oscillator signals are your best tools. Avoid chasing breakouts until volume confirms direction.`,
    );
  }

  // 5. Profile insight
  if (traderProfile && traderProfile.totalTrades >= 5) {
    const wr = (traderProfile.winRate * 100).toFixed(0);
    const styleMatch =
      (traderProfile.style === "momentum" && bias === "bullish") ||
      (traderProfile.style === "mean_reversion" && rsi !== undefined && rsi < 35);
    if (styleMatch) {
      insights.push(
        `This matches your ${traderProfile.style} profile — you've posted ${wr}% WR on similar setups. Trust the process and your edge.`,
      );
    } else if (insights.length < 3) {
      insights.push(
        `Your ${traderProfile.style} profile (${wr}% WR) is best in setups that match your style. Size appropriately if this deviates from your playbook.`,
      );
    }
  }

  // 6. Fundamental insight (injected when fewer than 3 technical insights available)
  if (insights.length < 3 && ticker) {
    const fundInsight = getFundamentalInsight(ticker, currentPrice);
    if (fundInsight) insights.push(fundInsight);
  }

  return insights.slice(0, 4);
}

// ─── Trade Plan Builder ──────────────────────────────────────────────────────

function buildTradePlan(
  bias: "bullish" | "bearish" | "neutral",
  conviction: "low" | "medium" | "high",
  currentPrice: number,
  levels: AnalysisResult["levels"],
  snap: IndicatorSnapshot,
  accountSize = 100_000,
  riskPct = 0.02,
): TradePlan | null {
  if (bias === "neutral" || conviction === "low") return null;

  const nearestSup = levels.supports[0];
  const secondSup = levels.supports[1];
  const nearestRes = levels.resistances[0];
  const secondRes = levels.resistances[1];

  let stopLoss: number;
  let target1: number;
  let target2: number;
  let rationale: string;

  if (bias === "bullish") {
    // Stop: below nearest support or 3% hard stop; ATR-tightened if available
    const atrStop = snap.atr ? currentPrice - snap.atr * 1.5 : null;
    const baseStop = nearestSup?.price ?? currentPrice * 0.97;
    stopLoss = atrStop ? Math.min(baseStop, atrStop) : baseStop;

    target1 = nearestRes?.price ?? currentPrice * 1.06;
    target2 = secondRes?.price ?? currentPrice * 1.12;

    const stopLabel = nearestSup ? nearestSup.label : "3% stop";
    const t1Label = nearestRes ? nearestRes.label : "+6% target";
    rationale = `Stop below ${stopLabel} $${stopLoss.toFixed(2)}; T1 at ${t1Label} $${target1.toFixed(2)}`;
  } else {
    // bearish
    const atrStop = snap.atr ? currentPrice + snap.atr * 1.5 : null;
    const baseStop = nearestRes?.price ?? currentPrice * 1.03;
    stopLoss = atrStop ? Math.max(baseStop, atrStop) : baseStop;

    target1 = nearestSup?.price ?? currentPrice * 0.94;
    target2 = secondSup?.price ?? currentPrice * 0.88;

    const stopLabel = nearestRes ? nearestRes.label : "3% stop";
    const t1Label = nearestSup ? nearestSup.label : "-6% target";
    rationale = `Stop above ${stopLabel} $${stopLoss.toFixed(2)}; T1 at ${t1Label} $${target1.toFixed(2)}`;
  }

  const riskPerShare = Math.abs(currentPrice - stopLoss);
  const rawSize = riskPerShare > 0
    ? Math.floor((accountSize * riskPct) / riskPerShare)
    : 1;
  const positionSize = Math.max(1, Math.min(100, rawSize));
  const riskRewardRatio = riskPerShare > 0
    ? Math.abs(target1 - currentPrice) / riskPerShare
    : 0;

  return {
    entryZone: [currentPrice * 0.997, currentPrice * 1.003],
    stopLoss,
    target1,
    target2,
    positionSize,
    riskRewardRatio,
    rationale,
  };
}

// ─── analyzeTradeSetup ───────────────────────────────────────────────────────

export function analyzeTradeSetup(params: {
  visibleData: OHLCVBar[];
  activeIndicators: IndicatorType[];
  positions: Position[];
  currentTicker: string;
  tradeHistory?: TradeRecord[];
}): AnalysisResult {
  const { visibleData, activeIndicators, positions, currentTicker, tradeHistory = [] } = params;

  if (visibleData.length < 5) {
    return {
      score: 0,
      rawScore: 0,
      bias: "neutral",
      conviction: "low",
      regime: defaultRegime(),
      signals: [],
      patterns: [],
      divergences: [],
      levels: defaultLevels(),
      traderProfile: null,
      habits: [],
      sectorRotation: null,
      text: "• Insufficient data — advance the time travel slider to load more bars.\n• Enable indicators from the toolbar to get signal analysis.\n• Try toggling RSI or MACD for momentum readings.\n• Add SMA20/SMA50 for trend context and regime detection.",
      summary: "Advance the time slider to load more bars, then enable RSI or MACD for signal analysis.",
      setupName: null,
      insights: [],
      tradePlan: null,
    };
  }

  // 1. Extract snapshot for signals (also returns pre-computed indicator arrays)
  const { current, prev, rsiValues, macdHistValues } = extractSnapshot(visibleData, activeIndicators);

  // 2. Market regime
  const regime = detectMarketRegime({
    close: current.close,
    adx: current.adx,
    sma20: current.sma20,
    sma50: current.sma50,
  });

  // 3. (rsiValues, macdHistValues already computed by extractSnapshot above)

  // 4. Divergences
  const divergences = detectDivergences({
    bars: visibleData,
    rsiValues,
    macdHistValues,
  });

  // 5. Support/Resistance levels
  const levels = detectLevels({ bars: visibleData, currentPrice: current.close });

  // 6. Trader personality
  const traderProfile = analyzeTraderPersonality(tradeHistory);

  // 7. Signals
  const { signals, score: rawScore } = detectSignals(current, prev, activeIndicators);

  // 8. Candlestick patterns
  const patterns = detectCandlePatterns(visibleData, 10);

  // 9. Convert divergences + patterns to signals
  const dirMap: Record<SignalDirection, number> = { bullish: 1, bearish: -1, neutral: 0 };

  const divergenceSignals: Signal[] = divergences.map((d) => ({
    id: `div_${d.indicator}_${d.type}`,
    category: "momentum" as const,
    direction: d.type,
    strength: d.strength,
    description: d.description,
    shortLabel: `${d.indicator.toUpperCase()} Div`,
  }));

  const patternSignals: Signal[] = patterns.map((p) => ({
    id: `pattern_${p.name.replace(/\s/g, "_").toLowerCase()}`,
    category: "pattern" as const,
    direction: p.direction,
    strength: p.strength,
    description: p.description,
    shortLabel: p.name.length > 14 ? p.name.slice(0, 14) : p.name,
  }));

  const allSignals = [...signals, ...divergenceSignals, ...patternSignals];

  // 10. Re-score with all signals
  let rawCombined = 0;
  let weightedMax = 0;
  for (const s of allSignals) {
    rawCombined += dirMap[s.direction] * s.strength;
    weightedMax += s.strength;
  }
  const baseScore = weightedMax > 0 ? Math.round((rawCombined / weightedMax) * 100) : rawScore;

  // 11. Apply regime multiplier + confluence bonus
  const dominantCount = allSignals.filter((s) =>
    baseScore >= 0 ? s.direction === "bullish" : s.direction === "bearish",
  ).length;
  const confluenceBonus = dominantCount >= 7 ? 1.2 : dominantCount >= 5 ? 1.1 : 1.0;
  const finalScore = clampScore(baseScore * regime.scoreMultiplier * confluenceBonus);
  const bias = scoreBias(finalScore);
  const conviction = computeConviction(allSignals, finalScore);

  // ─── 4-Bullet NLG ────────────────────────────────────────────────────────

  const dirLabel =
    bias === "bullish" ? "bullish" : bias === "bearish" ? "bearish" : "mixed";
  const signalCount = allSignals.filter((s) => s.direction !== "neutral").length;
  const convLabel = conviction.toUpperCase();

  // Bullet 1: Regime + conviction
  const bullet1 = `• ${regime.label} regime | ${convLabel} conviction (${finalScore > 0 ? "+" : ""}${finalScore}/100) — ${signalCount} ${dirLabel} signals detected.`;

  // Bullet 2: Setup details — divergences first, then top signals, then pattern
  const setupParts: string[] = [];
  if (divergences.length > 0) {
    setupParts.push(divergences[0].description);
  }
  const topSigs = topSignals(allSignals.filter((s) => s.category !== "pattern"), 2);
  if (topSigs.length > 0) setupParts.push(...topSigs.map((s) => s.description));
  if (patterns.length > 0) setupParts.push(patterns[0].description);
  if (setupParts.length === 0) {
    setupParts.push("Enable indicators for signal detail — RSI, MACD, or Bollinger recommended.");
  }
  const bullet2 = `• Setup: ${setupParts.join(". ")}.`;

  // Bullet 3: Key levels + R/R
  const nearestRes = levels.resistances[0];
  const nearestSup = levels.supports[0];
  const secondRes = levels.resistances[1];
  const secondSup = levels.supports[1];
  const rr = calcRiskReward(current.close, nearestRes, nearestSup);

  let levelsText: string;
  if (nearestRes || nearestSup) {
    const resPart = nearestRes
      ? `Resistance: ${levelStr(nearestRes)}${secondRes ? ` | ${levelStr(secondRes)}` : ""}`
      : "";
    const supPart = nearestSup
      ? `Support: ${levelStr(nearestSup)}${secondSup ? ` | ${levelStr(secondSup)}` : ""}`
      : "";
    const parts = [resPart, supPart].filter(Boolean);
    levelsText = parts.join(". ") + `. R/R from here: ${rr}.`;
  } else {
    levelsText = `Enable SMA or Bollinger Bands to compute key levels. Pivot PP: $${levels.pivots.pp}.`;
  }
  const bullet3 = `• Levels: ${levelsText}`;

  // Bullet 4: Personalized edge OR position context OR generic tip
  let bullet4: string;
  const currentPos = positions.find((p) => p.ticker === currentTicker);

  if (traderProfile && traderProfile.totalTrades >= 5) {
    const styleLabel =
      traderProfile.style.charAt(0).toUpperCase() + traderProfile.style.slice(1);
    const aligned =
      (bias === "bullish" && currentPos?.side === "long") ||
      (bias === "bearish" && currentPos?.side === "short");
    bullet4 = `• Your edge: ${styleLabel} trader • ${(traderProfile.winRate * 100).toFixed(0)}% WR • ${traderProfile.riskRewardRatio.toFixed(1)}:1 R/R${currentPos ? ` — position ${aligned ? "aligned ✓" : "conflicted ⚠"}` : ""}. ${traderProfile.strengthMessage}`;
  } else if (currentPos) {
    const pnl = currentPos.unrealizedPnL;
    const pnlStr = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
    const aligned =
      (bias === "bullish" && currentPos.side === "long") ||
      (bias === "bearish" && currentPos.side === "short");
    bullet4 = `• Position: Holding ${currentPos.quantity} shares ${currentPos.side} (${pnlStr} unrealized). ${aligned ? "Trend confirms — hold with trailing stop." : "Trend conflicts — consider tightening stop-loss."}`;
  } else if (bias === "bullish") {
    const volStr = volatilityLevel(current);
    bullet4 = `• Watch: ${volStr === "compressed" ? "Bollinger squeeze — await volume breakout before entering." : `Wait for price to hold above ${nearestSup ? levelStr(nearestSup) : "nearest support"} on a pullback — then enter with defined stop below it.`}`;
  } else if (bias === "bearish") {
    bullet4 = `• Watch: Monitor ${nearestRes ? levelStr(nearestRes) : "nearest resistance"} — a failed retest confirms the bear case. Set stop above that level if shorting.`;
  } else {
    bullet4 = `• Watch: No directional edge yet. Look for breakout above ${nearestRes ? levelStr(nearestRes) : "resistance"} or breakdown below ${nearestSup ? levelStr(nearestSup) : "support"} for entry signal.`;
  }

  const text = [bullet1, bullet2, bullet3, bullet4].join("\n");

  // ─── Short summary for visual display ────────────────────────────────────
  let summary: string;
  if (conviction === "high" && bias === "bullish") {
    summary = `Strong bull setup — ${signalCount} signals aligned.${nearestSup ? ` Consider entry near support $${nearestSup.price} with stop below.` : " Watch for pullback entry near nearest support."}`;
  } else if (conviction === "high" && bias === "bearish") {
    summary = `Bear pressure confirmed — ${signalCount} signals.${nearestRes ? ` Watch resistance $${nearestRes.price} for failed retest entry.` : " Resistance zone is key — failed retest confirms bear case."}`;
  } else if (divergences.length > 0 && bias !== "bearish") {
    summary = `Divergence detected — momentum shift forming.${nearestRes ? ` Wait for breakout above $${nearestRes.price}.` : " Wait for follow-through confirmation before entry."}`;
  } else if (divergences.length > 0 && bias === "bearish") {
    summary = `Bearish divergence — rally may be running out of steam.${nearestRes ? ` Monitor $${nearestRes.price} for resistance rejection.` : " Volume confirmation needed before shorting."}`;
  } else if (conviction === "medium") {
    const keyLevel = nearestSup ?? nearestRes;
    summary = `Mixed signals in ${regime.label} market. Best edge: wait for confluence${keyLevel ? ` at $${keyLevel.price}` : " at a key level"}.`;
  } else {
    summary = `${regime.label} regime — no clear directional edge yet. ${regime.regime === "ranging" ? "Oscillator signals more reliable in this range." : "Watch for trend confirmation before entering."}`;
  }

  const setupName = detectSetup(allSignals, divergences, bias, conviction, current, levels, current.close);
  const insights = buildInsights(allSignals, divergences, levels, current, traderProfile, bias, regime, current.close, currentTicker);
  const tradePlan = buildTradePlan(bias, conviction, current.close, levels, current);
  const habits = buildHabitObservations(tradeHistory);
  const lastBar = visibleData[visibleData.length - 1];
  const barTs = lastBar ? Math.floor(lastBar.timestamp / 1000) : Math.floor(Date.now() / 1000);
  const sectorRotation = detectSectorRotation(currentTicker, barTs);

  return {
    score: finalScore,
    rawScore: baseScore,
    bias,
    conviction,
    regime,
    signals: allSignals,
    patterns,
    divergences,
    levels,
    traderProfile,
    habits,
    sectorRotation,
    text,
    summary,
    setupName,
    insights,
    tradePlan,
  };
}

// ─── reviewLastTrade ─────────────────────────────────────────────────────────

export function reviewLastTrade(params: {
  lastSell: TradeRecord;
  entryPrice: number;
  tradeHistory?: TradeRecord[];
}): AnalysisResult {
  const { lastSell, entryPrice, tradeHistory = [] } = params;

  const exit = lastSell.price;
  const pnlDollar = lastSell.realizedPnL ?? 0;
  const pnlPct = entryPrice > 0 ? ((exit - entryPrice) / entryPrice) * 100 : 0;
  const pnlSign = pnlDollar >= 0 ? "+" : "";

  const traderProfile = analyzeTraderPersonality(tradeHistory);

  let grade: string;
  let gradeDesc: string;
  if (pnlPct > 15) { grade = "A"; gradeDesc = "Excellent trade execution"; }
  else if (pnlPct > 5) { grade = "B"; gradeDesc = "Strong trade with good timing"; }
  else if (pnlPct > 0) { grade = "C"; gradeDesc = "Profitable but room to optimize"; }
  else if (pnlPct > -5) { grade = "D"; gradeDesc = "Small loss — acceptable risk management"; }
  else { grade = "F"; gradeDesc = "Stop-loss discipline needed"; }

  const bullet1 = `• Grade ${grade}: ${gradeDesc}. P&L: ${pnlSign}$${Math.abs(pnlDollar).toFixed(2)} (${pnlSign}${pnlPct.toFixed(1)}%) | Entry $${entryPrice.toFixed(2)} → Exit $${exit.toFixed(2)}`;

  let wentWell: string;
  if (pnlDollar >= 0) {
    wentWell =
      pnlPct > 10
        ? `Excellent patience — held through a ${pnlPct.toFixed(1)}% move. Entry at $${entryPrice.toFixed(2)} was well-timed.`
        : `Profitable exit. Entry $${entryPrice.toFixed(2)}, exit $${exit.toFixed(2)} — positive discipline.`;
  } else {
    wentWell =
      Math.abs(pnlPct) < 5
        ? `Loss contained at ${pnlSign}${pnlPct.toFixed(1)}% — you avoided a larger drawdown.`
        : `Recognized the losing position and closed it rather than holding and hoping.`;
  }

  let improve: string;
  if (pnlDollar >= 0 && pnlPct < 5) {
    improve = `Consider a trailing stop to capture more of the move. A 5-7% profit target with trailing exit often outperforms fixed exits.`;
  } else if (pnlDollar < 0 && Math.abs(pnlPct) > 10) {
    improve = `A predefined stop-loss at 5-7% would have saved ${(Math.abs(pnlPct) - 6).toFixed(1)}% of this loss. Always set stops before entry.`;
  } else if (pnlDollar < 0) {
    improve = `Review entry conditions — were RSI and MACD aligned? Waiting for multi-indicator confluence before entry reduces false signals.`;
  } else {
    improve = `Solid trade. Next step: increase position sizing when multiple indicators agree (ADX > 25 + RSI oversold + MACD cross).`;
  }

  const bullet2 = `• Worked: ${wentWell}`;
  const bullet3 = `• Improve: ${improve}`;

  let bullet4: string;
  if (traderProfile && traderProfile.totalTrades >= 5) {
    const styleLabel = traderProfile.style.charAt(0).toUpperCase() + traderProfile.style.slice(1);
    bullet4 = `• Profile: ${styleLabel} trader — ${(traderProfile.winRate * 100).toFixed(0)}% WR, ${traderProfile.riskRewardRatio.toFixed(1)}:1 R/R, profit factor ${traderProfile.profitFactor.toFixed(1)}. ${traderProfile.improvementMessage}`;
  } else {
    bullet4 = `• Keep trading — pattern recognition improves with repetition. Log your entry/exit rationale as notes for each trade.`;
  }

  const summary = `Grade ${grade} — ${gradeDesc}. ${wentWell.split(".")[0]}. ${improve.split(".")[0]}.`;

  const habits = buildHabitObservations(tradeHistory);

  return {
    score: clampScore(pnlPct * 5),
    rawScore: clampScore(pnlPct * 5),
    bias: pnlDollar >= 0 ? "bullish" : "bearish",
    conviction: Math.abs(pnlPct) > 10 ? "high" : Math.abs(pnlPct) > 3 ? "medium" : "low",
    regime: defaultRegime(),
    signals: [],
    patterns: [],
    divergences: [],
    levels: defaultLevels(),
    traderProfile,
    habits,
    sectorRotation: null,
    text: [bullet1, bullet2, bullet3, bullet4].join("\n"),
    summary,
    setupName: null,
    insights: [wentWell, improve],
    grade,
    wentWell,
    improve,
    tradePlan: null,
  };
}

// ─── generateMarketBrief ─────────────────────────────────────────────────────

const TICKER_CONTEXT: Record<string, { sector: string; context: string }> = {
  AAPL: { sector: "Technology", context: "Apple is a mega-cap consumer technology company — iPhone cycles, services growth, and margin expansion drive sentiment." },
  MSFT: { sector: "Technology", context: "Microsoft leads enterprise cloud (Azure) and AI integration — revenue is resilient and predictable." },
  GOOG: { sector: "Technology", context: "Alphabet dominates digital advertising and cloud — AI-driven search evolution is the key volatility theme." },
  AMZN: { sector: "Consumer/Cloud", context: "Amazon: e-commerce + AWS cloud + advertising. High-margin AWS and ad revenue drive profitability." },
  NVDA: { sector: "Semiconductors", context: "NVIDIA dominates AI accelerator GPUs. Data center demand cycles create large momentum moves." },
  TSLA: { sector: "EV/Automotive", context: "Tesla leads EVs — high volatility around production, margin, and autonomous driving milestones." },
  JPM: { sector: "Financial", context: "JPMorgan Chase — diversified financial giant. Trades on Fed rate expectations and credit cycle dynamics." },
  SPY: { sector: "ETF", context: "S&P 500 ETF — broad market proxy. Watch macro data (Fed, CPI, earnings seasons) as primary drivers." },
  QQQ: { sector: "ETF", context: "Nasdaq 100 ETF — tech-heavy. Highly sensitive to rate changes and large-cap tech earnings." },
  META: { sector: "Technology", context: "Meta Platforms — social media monetization at scale via AI-driven ad targeting and Reels growth." },
};

export function generateMarketBrief(params: {
  ticker: string;
  visibleData: OHLCVBar[];
  activeIndicators: IndicatorType[];
  tradeHistory?: TradeRecord[];
}): AnalysisResult {
  const { ticker, visibleData, activeIndicators, tradeHistory = [] } = params;

  const info = TICKER_CONTEXT[ticker] ?? {
    sector: "Equity",
    context: `${ticker} is a traded equity. Review recent fundamentals before trading.`,
  };

  const { current, prev, rsiValues: briefRsiValues, macdHistValues: briefMacdHistValues } = extractSnapshot(visibleData, activeIndicators);
  const regime = detectMarketRegime({
    close: current.close,
    adx: current.adx,
    sma20: current.sma20,
    sma50: current.sma50,
  });
  const divergences = detectDivergences({ bars: visibleData, rsiValues: briefRsiValues, macdHistValues: briefMacdHistValues });
  const levels = detectLevels({ bars: visibleData, currentPrice: current.close });
  const traderProfile = analyzeTraderPersonality(tradeHistory);
  const { signals } = detectSignals(current, prev, activeIndicators);

  const priceStr = `$${current.close.toFixed(2)}`;
  const lastBar = visibleData[visibleData.length - 1];
  const barTs = lastBar ? Math.floor(lastBar.timestamp / 1000) : Math.floor(Date.now() / 1000);
  const sectorRotationStr = detectSectorRotation(ticker, barTs);

  const nearestRes = levels.resistances[0];
  const nearestSup = levels.supports[0];

  // Opening sentence: regime + key level
  const regimeOpeningMap: Record<string, string> = {
    strong_bull: "Market is in a strong uptrend — trend-following setups carry the highest edge right now.",
    bull: "Market is in a bullish trending regime — momentum trades preferred over counter-trend fades.",
    ranging: "Market is ranging — oscillator-based entries at S/R extremes outperform breakout chasing.",
    bear: "Bearish regime in effect — selling rallies into resistance tends to outperform buying dips.",
    strong_bear: "Strong downtrend confirmed — counter-trend long trades carry significantly elevated risk.",
  };
  const regimeOpening = regimeOpeningMap[regime.regime] ?? `${regime.label} regime detected.`;

  // Synthetic options expected move (seeded ~1–5% of price)
  const optSeed = Math.floor(barTs / 3600) * 31 + 0xfeed;
  const optRand = seededRand(optSeed);
  const expMovePct = (1.2 + optRand() * 3.8).toFixed(1);
  const nextEventLabel = optRand() > 0.5 ? "next earnings" : "upcoming Fed meeting";
  const optionsSentiment = `Options market pricing a ${expMovePct}% expected move into ${nextEventLabel}. Implied volatility ${optRand() > 0.5 ? "elevated" : "subdued"} relative to recent averages.`;

  const bullet1 = `• Context: ${regimeOpening} ${ticker} currently at ${priceStr}.${nearestSup ? ` Watching $${nearestSup.price.toFixed(2)} (${nearestSup.label}) as key floor.` : ""}`;

  // Key signals
  const bullSigs = signals.filter((s) => s.direction === "bullish");
  const bearSigs = signals.filter((s) => s.direction === "bearish");
  let bullet2: string;
  if (divergences.length > 0) {
    bullet2 = `• Watch 1: ${divergences[0].description}. This is a high-quality reversal signal — confirm with volume.`;
  } else if (bullSigs.length > 0 && bearSigs.length === 0) {
    bullet2 = `• Watch 1: ${bullSigs[0].description}. ${bullSigs.length > 1 ? bullSigs[1].description + "." : ""}`;
  } else if (bearSigs.length > 0 && bullSigs.length === 0) {
    bullet2 = `• Watch 1: ${bearSigs[0].description}. ${bearSigs.length > 1 ? bearSigs[1].description + "." : ""}`;
  } else {
    bullet2 = `• Watch 1: Mixed signals (${bullSigs.length} bullish, ${bearSigs.length} bearish). Wait for ${regime.regime === "ranging" ? "range breakout" : "trend confirmation"} before entering.`;
  }

  const bullet3 = nearestRes || nearestSup
    ? `• Watch 2: Key levels — ${nearestRes ? `Resistance ${levelStr(nearestRes)}` : ""}${nearestRes && nearestSup ? " | " : ""}${nearestSup ? `Support ${levelStr(nearestSup)}` : ""}. Enter only on confirmed breakout or bounce.`
    : `• Watch 2: Enable Bollinger Bands or SMA20 for key level detection. Pivot PP: $${levels.pivots.pp}.`;

  let bullet4: string;
  if (traderProfile && traderProfile.totalTrades >= 5) {
    const styleLabel = traderProfile.style.charAt(0).toUpperCase() + traderProfile.style.slice(1);
    bullet4 = `• Watch 3: Your ${styleLabel} profile (${(traderProfile.winRate * 100).toFixed(0)}% WR) favors ${traderProfile.style === "momentum" ? "strong trending setups — wait for ADX > 25" : traderProfile.style === "mean_reversion" ? "oversold bounces — watch RSI < 30" : "clear S/R setups with volume confirmation"}.`;
  } else {
    bullet4 = `• Watch 3: Volume and pattern confirmation — look for Engulfing or Pin Bar candles at key S/R levels to time entries precisely.`;
  }

  const topSig = [...signals].filter((s) => s.direction !== "neutral").sort((a, b) => b.strength - a.strength)[0];
  const briefSummary = `${ticker} in ${regime.label} regime at ${priceStr}.${divergences.length > 0 ? ` Divergence detected — watch for momentum shift.` : topSig ? ` ${topSig.description.split(".")[0]}.` : " Enable indicators for signal analysis."}${nearestRes ? ` Key resistance: $${nearestRes.price}.` : ""}`;

  // Build contextual insights for brief mode
  const briefInsights: string[] = [];
  const fundInsight = getFundamentalInsight(ticker, current.close);
  if (fundInsight) briefInsights.push(fundInsight);
  briefInsights.push(sectorRotationStr);
  briefInsights.push(optionsSentiment);
  if (divergences.length > 0) {
    const d = divergences[0];
    briefInsights.push(`${d.type === "bullish" ? "Bullish" : "Bearish"} divergence detected — ${d.indicator.toUpperCase()} momentum is disconnecting from price. Watch for a reversal.`);
  } else if (topSig) {
    briefInsights.push(topSig.description);
  }
  if (nearestRes || nearestSup) {
    const r = nearestRes;
    const s = nearestSup;
    briefInsights.push(`Key levels to watch: ${r ? `Resistance $${r.price.toFixed(2)} (${r.label})` : ""}${r && s ? " | " : ""}${s ? `Support $${s.price.toFixed(2)} (${s.label})` : ""}. Enter only on confirmed breakout or bounce.`);
  }

  const habits = buildHabitObservations(tradeHistory);

  return {
    score: 0,
    rawScore: 0,
    bias: "neutral",
    conviction: "low",
    regime,
    signals,
    patterns: [],
    divergences,
    levels,
    traderProfile,
    habits,
    sectorRotation: sectorRotationStr,
    text: [bullet1, bullet2, bullet3, bullet4].join("\n"),
    summary: briefSummary,
    setupName: null,
    insights: briefInsights.slice(0, 4),
    tradePlan: null,
  };
}
