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
} from "@/services/indicators";
import {
  detectSignals,
  type Signal,
  type IndicatorSnapshot,
  type SignalDirection,
} from "./signals";
import { detectCandlePatterns, type CandlePattern } from "./patterns";

export interface AnalysisResult {
  score: number;
  bias: "bullish" | "bearish" | "neutral";
  signals: Signal[];
  patterns: CandlePattern[];
  text: string;
}

// ─── Snapshot Extraction ────────────────────────────────────────────────────

function extractSnapshot(
  bars: OHLCVBar[],
  activeIndicators: IndicatorType[],
): { current: IndicatorSnapshot; prev: IndicatorSnapshot | null } {
  const has = (ind: IndicatorType) => activeIndicators.includes(ind);
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
  const prev: IndicatorSnapshot = secondLast
    ? {
        close: secondLast.close,
        open: secondLast.open,
        high: secondLast.high,
        low: secondLast.low,
        volume: secondLast.volume,
      }
    : null!;

  // RSI
  if (has("rsi") && bars.length >= 15) {
    const rsiData = calculateRSI(bars, 14);
    if (rsiData.length >= 1) current.rsi = rsiData[rsiData.length - 1].value;
    if (rsiData.length >= 2 && prev) prev.rsi = rsiData[rsiData.length - 2].value;
  }

  // MACD
  if (has("macd") && bars.length >= 35) {
    const macdData = calculateMACD(bars);
    const ml = macdData.macdLine;
    const sl = macdData.signalLine;
    const hist = macdData.histogram;
    if (ml.length >= 1) current.macdLine = ml[ml.length - 1].value;
    if (sl.length >= 1) current.macdSignal = sl[sl.length - 1].value;
    if (hist.length >= 1) current.macdHistogram = hist[hist.length - 1].value;
    if (hist.length >= 2 && prev) {
      prev.macdHistogram = hist[hist.length - 2].value;
      prev.macdLine = ml.length >= 2 ? ml[ml.length - 2].value : undefined;
    }
  }

  // Bollinger
  if (has("bollinger") && bars.length >= 20) {
    const bb = calculateBollingerBands(bars, 20, 2);
    if (bb.upper.length >= 1) {
      current.bbUpper = bb.upper[bb.upper.length - 1].value;
      current.bbMiddle = bb.middle[bb.middle.length - 1].value;
      current.bbLower = bb.lower[bb.lower.length - 1].value;
      if (current.bbUpper && current.bbLower) {
        current.bbWidth = current.bbUpper - current.bbLower;
      }
    }
    if (bb.upper.length >= 2 && prev) {
      prev.bbUpper = bb.upper[bb.upper.length - 2].value;
      prev.bbMiddle = bb.middle[bb.middle.length - 2].value;
      prev.bbLower = bb.lower[bb.lower.length - 2].value;
      if (prev.bbUpper && prev.bbLower) {
        prev.bbWidth = prev.bbUpper - prev.bbLower;
        current.prevBbWidth = prev.bbWidth;
      }
    }
  }

  // SMA20
  if (has("sma20") && bars.length >= 20) {
    const sma = calculateSMA(bars, 20);
    if (sma.length >= 1) current.sma20 = sma[sma.length - 1].value;
    if (sma.length >= 2 && prev) prev.sma20 = sma[sma.length - 2].value;
  }

  // SMA50
  if (has("sma50") && bars.length >= 50) {
    const sma = calculateSMA(bars, 50);
    if (sma.length >= 1) current.sma50 = sma[sma.length - 1].value;
    if (sma.length >= 2 && prev) prev.sma50 = sma[sma.length - 2].value;
  }

  // EMA12
  if (has("ema12") && bars.length >= 12) {
    const ema = calculateEMA(bars, 12);
    if (ema.length >= 1) current.ema12 = ema[ema.length - 1].value;
  }

  // EMA26
  if (has("ema26") && bars.length >= 26) {
    const ema = calculateEMA(bars, 26);
    if (ema.length >= 1) current.ema26 = ema[ema.length - 1].value;
  }

  // ADX
  if (has("adx") && bars.length >= 28) {
    const adxData = calculateADX(bars, 14);
    if (adxData.length >= 1) current.adx = adxData[adxData.length - 1].value;
  }

  // OBV
  if (has("obv") && bars.length >= 2) {
    const obvData = calculateOBV(bars);
    if (obvData.length >= 1) current.obvCurrent = obvData[obvData.length - 1].value;
    if (obvData.length >= 2) current.obvPrev = obvData[obvData.length - 2].value;
  }

  // CCI
  if (has("cci") && bars.length >= 20) {
    const cciData = calculateCCI(bars, 20);
    if (cciData.length >= 1) current.cci = cciData[cciData.length - 1].value;
    if (cciData.length >= 2 && prev) prev.cci = cciData[cciData.length - 2].value;
  }

  // Williams %R
  if (has("williams_r") && bars.length >= 14) {
    const wrData = calculateWilliamsR(bars, 14);
    if (wrData.length >= 1) current.williamsR = wrData[wrData.length - 1].value;
    if (wrData.length >= 2 && prev) prev.williamsR = wrData[wrData.length - 2].value;
  }

  // PSAR
  if (has("psar") && bars.length >= 10) {
    const psarData = calculateParabolicSAR(bars, 0.02, 0.2);
    if (psarData.length >= 1) current.psarValue = psarData[psarData.length - 1].value;
    if (psarData.length >= 2 && prev) prev.psarValue = psarData[psarData.length - 2].value;
  }

  // VWAP
  if (has("vwap") && bars.length >= 1) {
    const vwapData = calculateVWAP(bars);
    if (vwapData.length >= 1) current.vwap = vwapData[vwapData.length - 1].value;
    if (vwapData.length >= 2 && prev) prev.vwap = vwapData[vwapData.length - 2].value;
  }

  // ATR
  if (has("atr") && bars.length >= 20) {
    const atrData = calculateATR(bars, 14);
    if (atrData.length >= 1) current.atr = atrData[atrData.length - 1].value;
    // Average ATR over last 10 periods
    if (atrData.length >= 10) {
      const last10 = atrData.slice(-10);
      current.atrAvg = last10.reduce((s, p) => s + p.value, 0) / 10;
    }
  }

  // Stochastic
  if (has("stochastic") && bars.length >= 17) {
    const stochData = calculateStochastic(bars, 14, 3);
    if (stochData.kLine.length >= 1) {
      current.stochK = stochData.kLine[stochData.kLine.length - 1].value;
    }
    if (stochData.dLine.length >= 1) {
      current.stochD = stochData.dLine[stochData.dLine.length - 1].value;
    }
    if (stochData.kLine.length >= 2 && prev) {
      prev.stochK = stochData.kLine[stochData.kLine.length - 2].value;
    }
    if (stochData.dLine.length >= 2 && prev) {
      prev.stochD = stochData.dLine[stochData.dLine.length - 2].value;
    }
  }

  return { current, prev: secondLast ? prev : null };
}

// ─── NLG Helpers ────────────────────────────────────────────────────────────

function scoreBias(score: number): "bullish" | "bearish" | "neutral" {
  if (score >= 15) return "bullish";
  if (score <= -15) return "bearish";
  return "neutral";
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

function keyResistance(snap: IndicatorSnapshot): string {
  if (snap.bbUpper !== undefined) {
    return `Bollinger upper band at $${snap.bbUpper.toFixed(2)}`;
  }
  if (snap.sma50 !== undefined) {
    return `50-day SMA at $${snap.sma50.toFixed(2)}`;
  }
  if (snap.sma20 !== undefined) {
    return `20-day SMA at $${snap.sma20.toFixed(2)}`;
  }
  if (snap.vwap !== undefined) {
    return `VWAP at $${snap.vwap.toFixed(2)}`;
  }
  return "recent price highs";
}

function keySupport(snap: IndicatorSnapshot): string {
  if (snap.bbLower !== undefined) {
    return `Bollinger lower band at $${snap.bbLower.toFixed(2)}`;
  }
  if (snap.sma20 !== undefined) {
    return `20-day SMA at $${snap.sma20.toFixed(2)}`;
  }
  if (snap.vwap !== undefined) {
    return `VWAP at $${snap.vwap.toFixed(2)}`;
  }
  return "recent price lows";
}

// ─── analyzeTradeSetup ───────────────────────────────────────────────────────

export function analyzeTradeSetup(params: {
  visibleData: OHLCVBar[];
  activeIndicators: IndicatorType[];
  positions: Position[];
  currentTicker: string;
}): AnalysisResult {
  const { visibleData, activeIndicators, positions, currentTicker } = params;

  if (visibleData.length < 5) {
    return {
      score: 0,
      bias: "neutral",
      signals: [],
      patterns: [],
      text: "• Insufficient data — advance the time travel slider to load more bars.\n• Enable indicators from the toolbar to get signal analysis.\n• Try toggling RSI or MACD for momentum readings.",
    };
  }

  const { current, prev } = extractSnapshot(visibleData, activeIndicators);
  const { signals, score } = detectSignals(current, prev, activeIndicators);
  const patterns = detectCandlePatterns(visibleData, 10);

  // Convert patterns to signals for scoring
  const patternSignals: Signal[] = patterns.map((p) => ({
    id: `pattern_${p.name.replace(/\s/g, "_").toLowerCase()}`,
    category: "pattern" as const,
    direction: p.direction,
    strength: p.strength,
    description: p.description,
  }));

  const allSignals = [...signals, ...patternSignals];

  // Re-score with patterns included
  const dirMap: Record<SignalDirection, number> = { bullish: 1, bearish: -1, neutral: 0 };
  let rawScore = 0;
  let weightedMax = 0;
  for (const s of allSignals) {
    rawScore += dirMap[s.direction] * s.strength;
    weightedMax += s.strength;
  }
  const finalScore = weightedMax > 0 ? Math.round((rawScore / weightedMax) * 100) : score;
  const bias = scoreBias(finalScore);

  // Build NLG text
  const top = topSignals(allSignals, 3);
  const volLevel = volatilityLevel(current);
  const currentPos = positions.find((p) => p.ticker === currentTicker);

  let bullet1: string;
  if (top.length === 0) {
    bullet1 = `• Signal: Neutral setup (score ${finalScore}/100). Enable more indicators for deeper analysis.`;
  } else {
    const biasLabel =
      bias === "bullish" ? "Bullish" : bias === "bearish" ? "Bearish" : "Mixed";
    const topDesc = top
      .slice(0, 2)
      .map((s) => s.description)
      .join(". ");
    bullet1 = `• Signal: ${biasLabel} setup (score ${finalScore}/100). ${topDesc}.`;
  }

  let bullet2: string;
  if (bias === "bullish") {
    bullet2 = `• Risk: Watch ${keyResistance(current)} as overhead resistance — ${volLevel} volatility environment.`;
  } else if (bias === "bearish") {
    bullet2 = `• Risk: Watch ${keySupport(current)} as downside support — ${volLevel} volatility environment.`;
  } else {
    bullet2 = `• Risk: Conflicting signals — wait for clearer direction. ${volLevel.charAt(0).toUpperCase() + volLevel.slice(1)} volatility environment.`;
  }

  let bullet3: string;
  if (currentPos) {
    const pnl = currentPos.unrealizedPnL;
    const pnlStr = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
    const aligned =
      (bias === "bullish" && currentPos.side === "long") ||
      (bias === "bearish" && currentPos.side === "short");
    bullet3 = `• Position: Holding ${currentPos.quantity} shares ${currentPos.side} (unrealized ${pnlStr}). ${
      aligned ? "Trend aligns with position." : "Consider tightening stop-loss."
    }`;
  } else if (bias === "bullish") {
    const trigger = current.rsi !== undefined
      ? `RSI pulling back from overbought`
      : current.macdHistogram !== undefined && current.macdHistogram < 0
      ? `MACD recrossing signal line`
      : `price retesting nearest SMA`;
    bullet3 = `• Watch: Wait for ${trigger} before entering long — confirm with volume.`;
  } else if (bias === "bearish") {
    bullet3 = `• Watch: Monitor ${keyResistance(current)} — a rejection there strengthens the bear case.`;
  } else {
    bullet3 = `• Watch: Look for a breakout above ${keyResistance(current)} or breakdown below ${keySupport(current)} for directional clarity.`;
  }

  const text = [bullet1, bullet2, bullet3].join("\n");

  return { score: finalScore, bias, signals: allSignals, patterns, text };
}

// ─── reviewLastTrade ─────────────────────────────────────────────────────────

export function reviewLastTrade(params: {
  lastSell: TradeRecord;
  entryPrice: number;
}): AnalysisResult {
  const { lastSell, entryPrice } = params;

  const exit = lastSell.price;
  const pnlDollar = lastSell.realizedPnL ?? 0;
  const pnlPct = entryPrice > 0 ? ((exit - entryPrice) / entryPrice) * 100 : 0;
  const pnlSign = pnlDollar >= 0 ? "+" : "";

  let grade: string;
  let gradeDesc: string;
  if (pnlPct > 15) {
    grade = "A";
    gradeDesc = "Excellent trade execution";
  } else if (pnlPct > 5) {
    grade = "B";
    gradeDesc = "Strong trade with good timing";
  } else if (pnlPct > 0) {
    grade = "C";
    gradeDesc = "Profitable but room to optimize";
  } else if (pnlPct > -5) {
    grade = "D";
    gradeDesc = "Small loss — acceptable risk management";
  } else {
    grade = "F";
    gradeDesc = "Stop-loss discipline needed";
  }

  let wentWell: string;
  let improve: string;

  if (pnlDollar >= 0) {
    const holdReturn = ((exit - entryPrice) / entryPrice) * 100;
    wentWell =
      holdReturn > 10
        ? `Excellent patience — held through ${holdReturn.toFixed(1)}% move from entry $${entryPrice.toFixed(2)}.`
        : `Profitable exit at $${exit.toFixed(2)} from entry $${entryPrice.toFixed(2)}. Positive risk management.`;
    improve =
      pnlPct < 5
        ? `Consider using a trailing stop to lock in gains on larger moves. Small profit of ${pnlSign}${pnlPct.toFixed(1)}% may have been exited too early.`
        : `Look for high ADX (>25) environments to ride winners longer. Current momentum indicators could improve entry precision.`;
  } else {
    wentWell =
      Math.abs(pnlPct) < 5
        ? `Loss was contained at ${pnlSign}${pnlPct.toFixed(1)}% — good risk control limiting the damage.`
        : `You recognized the losing position and closed it rather than holding through a larger drawdown.`;
    improve =
      Math.abs(pnlPct) > 10
        ? `A predefined stop-loss at 5-7% would have reduced this loss from ${Math.abs(pnlPct).toFixed(1)}%. Always set stops before entry.`
        : `Review entry signals — check if MACD and RSI were aligned at entry. Mixed signals suggest waiting for confluence.`;
  }

  const text = [
    `• Grade ${grade}: ${gradeDesc}. P&L: ${pnlSign}$${Math.abs(pnlDollar).toFixed(2)} (${pnlSign}${pnlPct.toFixed(1)}%) | Entry $${entryPrice.toFixed(2)} → Exit $${exit.toFixed(2)}`,
    `• What worked: ${wentWell}`,
    `• Improve: ${improve}`,
  ].join("\n");

  return {
    score: Math.round(Math.max(-100, Math.min(100, pnlPct * 5))),
    bias: pnlDollar >= 0 ? "bullish" : "bearish",
    signals: [],
    patterns: [],
    text,
  };
}

// ─── generateMarketBrief ─────────────────────────────────────────────────────

const TICKER_CONTEXT: Record<string, { sector: string; context: string }> = {
  AAPL: { sector: "Technology", context: "Apple is a mega-cap consumer technology company known for iPhone cycles, services growth, and margin expansion." },
  MSFT: { sector: "Technology", context: "Microsoft is a cloud-first enterprise giant with Azure, Office 365, and AI integration via OpenAI partnership." },
  GOOG: { sector: "Technology", context: "Alphabet dominates digital advertising and cloud computing, with AI-driven search evolution as a key theme." },
  AMZN: { sector: "Consumer/Cloud", context: "Amazon leads e-commerce and cloud infrastructure (AWS), with profitability driven by high-margin AWS and advertising." },
  NVDA: { sector: "Semiconductors", context: "NVIDIA dominates AI accelerator GPUs, with explosive data center demand driving revenue growth cycles." },
  TSLA: { sector: "EV/Automotive", context: "Tesla leads the EV market with high volatility around production, margin, and autonomous driving milestones." },
  JPM: { sector: "Financial", context: "JPMorgan Chase is a diversified financial giant; trades on interest rate expectations and credit cycle dynamics." },
  SPY: { sector: "ETF", context: "The S&P 500 ETF tracks broad market sentiment — watch macro data (Fed, inflation, earnings) as primary drivers." },
  QQQ: { sector: "ETF", context: "The Nasdaq 100 ETF is tech-heavy; highly sensitive to rate changes and large-cap tech earnings." },
  META: { sector: "Technology", context: "Meta Platforms monetizes social media at scale, with AI-driven ad targeting and metaverse investments." },
};

export function generateMarketBrief(params: {
  ticker: string;
  visibleData: OHLCVBar[];
  activeIndicators: IndicatorType[];
}): AnalysisResult {
  const { ticker, visibleData, activeIndicators } = params;

  const info = TICKER_CONTEXT[ticker] ?? {
    sector: "Equity",
    context: `${ticker} is a traded equity. Review fundamentals and recent news before trading.`,
  };

  const { current, prev } = extractSnapshot(visibleData, activeIndicators);
  const { signals } = detectSignals(current, prev, activeIndicators);

  const bullSignals = signals.filter((s) => s.direction === "bullish");
  const bearSignals = signals.filter((s) => s.direction === "bearish");

  const activeCount = activeIndicators.length;
  const priceStr = `$${current.close.toFixed(2)}`;

  // Build 3 watch bullets from available signals
  const watches: string[] = [];

  if (bullSignals.length > 0 && bearSignals.length > 0) {
    watches.push(
      `Mixed signals detected — ${bullSignals.length} bullish vs ${bearSignals.length} bearish signals. Wait for confluence before entering.`,
    );
  } else if (bullSignals.length > bearSignals.length) {
    const top = bullSignals.sort((a, b) => b.strength - a.strength)[0];
    watches.push(`Bullish lean: ${top.description}.`);
  } else if (bearSignals.length > bullSignals.length) {
    const top = bearSignals.sort((a, b) => b.strength - a.strength)[0];
    watches.push(`Bearish lean: ${top.description}.`);
  } else {
    watches.push(`No active indicators toggled — enable RSI or MACD for signal analysis.`);
  }

  if (activeCount > 0) {
    watches.push(
      `Key level: ${keyResistance(current)} is overhead resistance; ${keySupport(current)} is downside support.`,
    );
  } else {
    watches.push(`Enable Bollinger Bands or SMA to identify key support and resistance levels.`);
  }

  watches.push(
    `Volume and momentum confirmation: look for candle patterns (Engulfing, Pin Bars) at key levels to time entries precisely.`,
  );

  const context = `${info.context} Current price: ${priceStr}.`;

  const text = [
    `• Context: ${context}`,
    `• Watch 1: ${watches[0]}`,
    `• Watch 2: ${watches[1]}`,
    `• Watch 3: ${watches[2]}`,
  ].join("\n");

  return { score: 0, bias: "neutral", signals, patterns: [], text };
}
