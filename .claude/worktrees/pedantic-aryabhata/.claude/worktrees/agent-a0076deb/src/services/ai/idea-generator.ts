/**
 * idea-generator.ts
 *
 * Generates ranked trade ideas across multiple tickers using the same
 * signal/level/regime pipeline that powers the AI Coach.
 */

import type { OHLCVBar } from "@/types/market";
import type { IndicatorType } from "@/stores/chart-store";
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
} from "@/services/indicators";
import { detectSignals, type IndicatorSnapshot } from "./signals";
import { detectLevels } from "./levels";
import { detectMarketRegime } from "./regime";
import { detectDivergences } from "./divergence";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface TradeIdea {
  ticker: string;
  direction: "long" | "short";
  entry: number;
  stop: number;
  target1: number;
  target2: number;
  rrRatio: number;
  conviction: "high" | "medium" | "low";
  catalysts: string[]; // top 3 signal shortLabels driving the idea
  timeframe: "intraday" | "swing" | "position";
  setupName: string;
}

// ─── All indicator types used for full analysis ───────────────────────────────

const ALL_INDICATORS: IndicatorType[] = [
  "sma20",
  "sma50",
  "ema12",
  "ema26",
  "bollinger",
  "rsi",
  "macd",
  "stochastic",
  "atr",
  "vwap",
  "adx",
  "obv",
  "cci",
  "williams_r",
  "psar",
];

// ─── Snapshot extraction (mirrors engine.ts extractSnapshot) ─────────────────

function buildSnapshot(
  bars: OHLCVBar[],
): { current: IndicatorSnapshot; prev: IndicatorSnapshot | null } {
  const last = bars[bars.length - 1];
  const secondLast = bars.length >= 2 ? bars[bars.length - 2] : null;

  if (!last) {
    return {
      current: { close: 0, open: 0, high: 0, low: 0, volume: 0 },
      prev: null,
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

  const prev: IndicatorSnapshot | null = secondLast
    ? {
        close: secondLast.close,
        open: secondLast.open,
        high: secondLast.high,
        low: secondLast.low,
        volume: secondLast.volume,
      }
    : null;

  if (bars.length >= 15) {
    const d = calculateRSI(bars, 14);
    if (d.length >= 1) current.rsi = d[d.length - 1].value;
    if (d.length >= 2 && prev) prev.rsi = d[d.length - 2].value;
  }

  if (bars.length >= 35) {
    const d = calculateMACD(bars);
    if (d.macdLine.length >= 1) current.macdLine = d.macdLine[d.macdLine.length - 1].value;
    if (d.signalLine.length >= 1) current.macdSignal = d.signalLine[d.signalLine.length - 1].value;
    if (d.histogram.length >= 1) current.macdHistogram = d.histogram[d.histogram.length - 1].value;
    if (d.histogram.length >= 2 && prev) {
      prev.macdHistogram = d.histogram[d.histogram.length - 2].value;
    }
  }

  if (bars.length >= 20) {
    const d = calculateBollingerBands(bars, 20, 2);
    if (d.upper.length >= 1) {
      current.bbUpper = d.upper[d.upper.length - 1].value;
      current.bbMiddle = d.middle[d.middle.length - 1].value;
      current.bbLower = d.lower[d.lower.length - 1].value;
      if (current.bbUpper && current.bbLower)
        current.bbWidth = current.bbUpper - current.bbLower;
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

    const sma20 = calculateSMA(bars, 20);
    if (sma20.length >= 1) current.sma20 = sma20[sma20.length - 1].value;
    if (sma20.length >= 2 && prev) prev.sma20 = sma20[sma20.length - 2].value;

    const cci = calculateCCI(bars, 20);
    if (cci.length >= 1) current.cci = cci[cci.length - 1].value;
    if (cci.length >= 2 && prev) prev.cci = cci[cci.length - 2].value;
  }

  if (bars.length >= 50) {
    const sma50 = calculateSMA(bars, 50);
    if (sma50.length >= 1) current.sma50 = sma50[sma50.length - 1].value;
    if (sma50.length >= 2 && prev) prev.sma50 = sma50[sma50.length - 2].value;
  }

  if (bars.length >= 12) {
    const ema12 = calculateEMA(bars, 12);
    if (ema12.length >= 1) current.ema12 = ema12[ema12.length - 1].value;
  }

  if (bars.length >= 26) {
    const ema26 = calculateEMA(bars, 26);
    if (ema26.length >= 1) current.ema26 = ema26[ema26.length - 1].value;
  }

  if (bars.length >= 28) {
    const adx = calculateADX(bars, 14);
    if (adx.length >= 1) current.adx = adx[adx.length - 1].value;
  }

  if (bars.length >= 2) {
    const obv = calculateOBV(bars);
    if (obv.length >= 1) current.obvCurrent = obv[obv.length - 1].value;
    if (obv.length >= 2) current.obvPrev = obv[obv.length - 2].value;
  }

  if (bars.length >= 14) {
    const wr = calculateWilliamsR(bars, 14);
    if (wr.length >= 1) current.williamsR = wr[wr.length - 1].value;
    if (wr.length >= 2 && prev) prev.williamsR = wr[wr.length - 2].value;
  }

  if (bars.length >= 10) {
    const psar = calculateParabolicSAR(bars, 0.02, 0.2);
    if (psar.length >= 1) current.psarValue = psar[psar.length - 1].value;
    if (psar.length >= 2 && prev) prev.psarValue = psar[psar.length - 2].value;
  }

  if (bars.length >= 1) {
    const vwap = calculateVWAP(bars);
    if (vwap.length >= 1) current.vwap = vwap[vwap.length - 1].value;
    if (vwap.length >= 2 && prev) prev.vwap = vwap[vwap.length - 2].value;
  }

  if (bars.length >= 20) {
    const atr = calculateATR(bars, 14);
    if (atr.length >= 1) current.atr = atr[atr.length - 1].value;
    if (atr.length >= 10) {
      current.atrAvg = atr.slice(-10).reduce((s, p) => s + p.value, 0) / 10;
    }
  }

  if (bars.length >= 17) {
    const stoch = calculateStochastic(bars, 14, 3);
    if (stoch.kLine.length >= 1) current.stochK = stoch.kLine[stoch.kLine.length - 1].value;
    if (stoch.dLine.length >= 1) current.stochD = stoch.dLine[stoch.dLine.length - 1].value;
    if (stoch.kLine.length >= 2 && prev) prev.stochK = stoch.kLine[stoch.kLine.length - 2].value;
    if (stoch.dLine.length >= 2 && prev) prev.stochD = stoch.dLine[stoch.dLine.length - 2].value;
  }

  return { current, prev };
}

// ─── Score → conviction ───────────────────────────────────────────────────────

function toConviction(
  signals: ReturnType<typeof detectSignals>["signals"],
  score: number,
): "high" | "medium" | "low" {
  const directional = signals.filter((s) => s.direction !== "neutral").length;
  const abs = Math.abs(score);
  if (directional >= 7 && abs >= 40) return "high";
  if (directional >= 4 && abs >= 20) return "medium";
  return "low";
}

// ─── Timeframe classification from bar count ──────────────────────────────────

function classifyTimeframe(barCount: number): "intraday" | "swing" | "position" {
  // < 130 bars ≈ intraday (15m bars × 26/day × ~5 days)
  if (barCount <= 130) return "intraday";
  // < 600 bars ≈ swing (≈ 3–4 weeks of 15m data or ~1–2 months daily)
  if (barCount <= 600) return "swing";
  return "position";
}

// ─── Setup name derivation (compact version of engine.ts detectSetup) ────────

function deriveSetupName(
  signals: ReturnType<typeof detectSignals>["signals"],
  direction: "long" | "short",
  conviction: "high" | "medium" | "low",
  snap: IndicatorSnapshot,
): string {
  const has = (id: string) => signals.some((s) => s.id === id);
  const rsi = snap.rsi ?? 50;

  if (direction === "long") {
    if (conviction === "high") {
      if (has("rsi_extreme_os") && has("bb_lower_touch")) return "Double Oversold Bounce";
      if (has("macd_cross_bull") && rsi < 35) return "MACD + Oversold Combo";
      if (has("golden_cross")) return "Golden Cross Breakout";
      if (has("psar_flip_bull")) return "PSAR Trend Flip";
      if (has("obv_divergence_bull")) return "OBV Accumulation";
      return "Bull Confluence Setup";
    }
    if (conviction === "medium") {
      if (rsi < 35) return "Oversold Bounce Watch";
      if (has("macd_cross_bull")) return "MACD Entry Signal";
      if (has("vwap_cross_up")) return "VWAP Reclaim";
      return "Bullish Developing";
    }
    return "Weak Bull Signal";
  }

  // short
  if (conviction === "high") {
    if (has("rsi_extreme_ob") && has("bb_upper_touch")) return "Double Overbought Fade";
    if (has("macd_cross_bear") && rsi > 65) return "MACD + Overbought Combo";
    if (has("death_cross")) return "Death Cross Breakdown";
    if (has("psar_flip_bear")) return "PSAR Trend Reversal";
    if (has("obv_divergence_bear")) return "Distribution Warning";
    return "Bear Confluence Setup";
  }
  if (conviction === "medium") {
    if (rsi > 65) return "Overbought Fade Watch";
    if (has("macd_cross_bear")) return "MACD Sell Signal";
    if (has("vwap_cross_dn")) return "VWAP Breakdown";
    return "Bearish Developing";
  }
  return "Weak Bear Signal";
}

// ─── Price targets ────────────────────────────────────────────────────────────

function buildTargets(
  direction: "long" | "short",
  price: number,
  levels: ReturnType<typeof detectLevels>,
  atr: number | undefined,
): { stop: number; target1: number; target2: number; rrRatio: number } {
  const { supports, resistances } = levels;
  const atrFallback = price * 0.02; // 2% if no ATR
  const atrVal = atr ?? atrFallback;

  let stop: number;
  let target1: number;
  let target2: number;

  if (direction === "long") {
    const nearSup = supports[0];
    const atrStop = price - atrVal * 1.5;
    stop = nearSup ? Math.min(nearSup.price, atrStop) : atrStop;
    target1 = resistances[0]?.price ?? price * 1.06;
    target2 = resistances[1]?.price ?? price * 1.12;
  } else {
    const nearRes = resistances[0];
    const atrStop = price + atrVal * 1.5;
    stop = nearRes ? Math.max(nearRes.price, atrStop) : atrStop;
    target1 = supports[0]?.price ?? price * 0.94;
    target2 = supports[1]?.price ?? price * 0.88;
  }

  const risk = Math.abs(price - stop);
  const reward = Math.abs(target1 - price);
  const rrRatio = risk > 0 ? Math.round((reward / risk) * 10) / 10 : 0;

  return { stop, target1, target2, rrRatio };
}

// ─── Core function ────────────────────────────────────────────────────────────

/**
 * Analyse every ticker in `marketData` and return the top 5 trade ideas
 * sorted by absolute conviction score.
 */
export function generateTradeIdeas(
  tickers: string[],
  marketData: Record<string, OHLCVBar[]>,
): TradeIdea[] {
  const ideas: (TradeIdea & { _score: number })[] = [];

  for (const ticker of tickers) {
    const bars = marketData[ticker];
    if (!bars || bars.length < 20) continue;

    const { current, prev } = buildSnapshot(bars);
    const { signals, score } = detectSignals(current, prev, ALL_INDICATORS);

    // Skip neutral tickers (|score| < 15)
    const bias = score >= 15 ? "long" : score <= -15 ? "short" : null;
    if (!bias) continue;

    const conviction = toConviction(signals, score);
    const levels = detectLevels({ bars, currentPrice: current.close });

    // Divergence bonus check for regime
    const regime = detectMarketRegime({
      close: current.close,
      adx: current.adx,
      sma20: current.sma20,
      sma50: current.sma50,
    });

    // Score multiplier from regime
    const adjustedScore = Math.round(score * regime.scoreMultiplier);

    // Top 3 directional signal labels
    const topSignals = [...signals]
      .filter((s) => s.direction !== "neutral" && s.direction === (bias === "long" ? "bullish" : "bearish"))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 3)
      .map((s) => s.shortLabel);

    const { stop, target1, target2, rrRatio } = buildTargets(
      bias,
      current.close,
      levels,
      current.atr,
    );

    const setupName = deriveSetupName(signals, bias, conviction, current);
    const timeframe = classifyTimeframe(bars.length);

    ideas.push({
      ticker,
      direction: bias,
      entry: Math.round(current.close * 100) / 100,
      stop: Math.round(stop * 100) / 100,
      target1: Math.round(target1 * 100) / 100,
      target2: Math.round(target2 * 100) / 100,
      rrRatio,
      conviction,
      catalysts: topSignals.length > 0 ? topSignals : ["Trend alignment"],
      timeframe,
      setupName,
      _score: Math.abs(adjustedScore),
    });
  }

  // Sort descending by conviction tier first, then by |score|
  const convOrder = { high: 3, medium: 2, low: 1 };
  ideas.sort(
    (a, b) =>
      convOrder[b.conviction] - convOrder[a.conviction] ||
      b._score - a._score,
  );

  // Return top 5 without internal _score field
  return ideas.slice(0, 5).map(({ _score: _, ...idea }) => idea);
}

// ─── Per-ticker scanner helper ────────────────────────────────────────────────

export interface TickerScanResult {
  ticker: string;
  score: number; // -100 to +100
  direction: "bullish" | "bearish" | "neutral";
  topSignals: string[];
}

export function scanAllTickers(
  tickers: string[],
  marketData: Record<string, OHLCVBar[]>,
): TickerScanResult[] {
  return tickers
    .map((ticker) => {
      const bars = marketData[ticker];
      if (!bars || bars.length < 20) {
        return { ticker, score: 0, direction: "neutral" as const, topSignals: [] };
      }
      const { current, prev } = buildSnapshot(bars);
      const { signals, score } = detectSignals(current, prev, ALL_INDICATORS);
      const direction: "bullish" | "bearish" | "neutral" =
        score >= 15 ? "bullish" : score <= -15 ? "bearish" : "neutral";
      const topSignals = [...signals]
        .filter((s) => s.direction !== "neutral")
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 3)
        .map((s) => s.shortLabel);
      return { ticker, score, direction, topSignals };
    })
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
}
