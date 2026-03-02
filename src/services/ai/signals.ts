import type { IndicatorType } from "@/stores/chart-store";

export type SignalDirection = "bullish" | "bearish" | "neutral";

export interface Signal {
  id: string;
  category: "momentum" | "trend" | "volume" | "volatility" | "pattern";
  direction: SignalDirection;
  strength: 1 | 2 | 3;
  description: string;
  shortLabel: string;   // ≤16 chars for chip display
}

export interface IndicatorSnapshot {
  // Price data (always present)
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  prevClose?: number;
  // Momentum
  rsi?: number;
  prevRsi?: number;
  macdLine?: number;
  macdSignal?: number;
  macdHistogram?: number;
  prevMacdHistogram?: number;
  stochK?: number;
  stochD?: number;
  prevStochK?: number;
  cci?: number;
  prevCci?: number;
  williamsR?: number;
  prevWilliamsR?: number;
  // Trend
  sma20?: number;
  sma50?: number;
  prevSma20?: number;
  prevSma50?: number;
  ema12?: number;
  ema26?: number;
  adx?: number;
  psarValue?: number;
  prevPsarValue?: number;
  prevClose2?: number; // needed for PSAR flip detection
  // Bands
  bbUpper?: number;
  bbMiddle?: number;
  bbLower?: number;
  bbWidth?: number;
  prevBbWidth?: number;
  // Volume
  obvCurrent?: number;
  obvPrev?: number;
  vwap?: number;
  prevVwap?: number;
  // Volatility
  atr?: number;
  atrAvg?: number;
}

function fmt(v: number, decimals = 1): string {
  return v.toFixed(decimals);
}

function fmtCurrency(v: number): string {
  return "$" + v.toFixed(2);
}

export function detectSignals(
  snap: IndicatorSnapshot,
  prevSnap: IndicatorSnapshot | null,
  activeIndicators: IndicatorType[],
): { signals: Signal[]; score: number } {
  const signals: Signal[] = [];
  const has = (ind: IndicatorType) => activeIndicators.includes(ind);

  // ─── RSI ──────────────────────────────────────────────────────────────────
  if (has("rsi") && snap.rsi !== undefined) {
    const rsi = snap.rsi;
    const prevRsi = prevSnap?.rsi;

    if (rsi >= 80) {
      signals.push({
        id: "rsi_extreme_ob",
        category: "momentum",
        direction: "bearish",
        strength: 3,
        shortLabel: `RSI ${fmt(rsi)}`,
        description: `RSI at ${fmt(rsi)} — severely overbought. Momentum is exhausted. A hard fade could be coming.`,
      });
    } else if (rsi >= 70) {
      signals.push({
        id: "rsi_ob",
        category: "momentum",
        direction: "bearish",
        strength: 2,
        shortLabel: `RSI ${fmt(rsi)}`,
        description: `RSI at ${fmt(rsi)} — overbought. Bulls are getting stretched. Watch for the first rejection candle.`,
      });
    } else if (rsi <= 20) {
      signals.push({
        id: "rsi_extreme_os",
        category: "momentum",
        direction: "bullish",
        strength: 3,
        shortLabel: `RSI ${fmt(rsi)}`,
        description: `RSI at ${fmt(rsi)} — capitulation-level oversold. These readings historically precede sharp bounces.`,
      });
    } else if (rsi <= 30) {
      signals.push({
        id: "rsi_os",
        category: "momentum",
        direction: "bullish",
        strength: 2,
        shortLabel: `RSI ${fmt(rsi)}`,
        description: `RSI at ${fmt(rsi)} — oversold territory. Buyers tend to step in here, especially with trend support.`,
      });
    }

    if (prevRsi !== undefined) {
      if (prevRsi < 50 && rsi >= 50) {
        signals.push({
          id: "rsi_cross_50_up",
          category: "momentum",
          direction: "bullish",
          strength: 1,
          shortLabel: "RSI > 50",
          description: `RSI crossed above 50 — momentum shifting to bulls. This is an early trend confirmation signal.`,
        });
      } else if (prevRsi > 50 && rsi <= 50) {
        signals.push({
          id: "rsi_cross_50_dn",
          category: "momentum",
          direction: "bearish",
          strength: 1,
          shortLabel: "RSI < 50",
          description: `RSI crossed below 50 — momentum weakening. Bears may be taking control.`,
        });
      }
    }
  }

  // ─── MACD ─────────────────────────────────────────────────────────────────
  if (has("macd") && snap.macdLine !== undefined && snap.macdHistogram !== undefined) {
    const hist = snap.macdHistogram;
    const prevHist = prevSnap?.macdHistogram;
    const line = snap.macdLine;

    if (prevHist !== undefined) {
      if (prevHist <= 0 && hist > 0) {
        signals.push({
          id: "macd_cross_bull",
          category: "momentum",
          direction: "bullish",
          strength: 2,
          shortLabel: "MACD Cross ↑",
          description: `MACD just flipped green — histogram crossed zero for the first time. Momentum is shifting to bulls.`,
        });
      } else if (prevHist >= 0 && hist < 0) {
        signals.push({
          id: "macd_cross_bear",
          category: "momentum",
          direction: "bearish",
          strength: 2,
          shortLabel: "MACD Cross ↓",
          description: `MACD flipped red — histogram turned negative. Bears are taking over the momentum.`,
        });
      } else if (hist > 0 && hist > prevHist) {
        signals.push({
          id: "macd_accel_pos",
          category: "momentum",
          direction: "bullish",
          strength: 1,
          shortLabel: "MACD Accel ↑",
          description: `MACD histogram expanding in positive territory — bullish momentum is building.`,
        });
      } else if (hist < 0 && hist < prevHist) {
        signals.push({
          id: "macd_accel_neg",
          category: "momentum",
          direction: "bearish",
          strength: 1,
          shortLabel: "MACD Accel ↓",
          description: `MACD histogram expanding in negative territory — bearish momentum is increasing.`,
        });
      }
    }

    if (line > 0) {
      signals.push({
        id: "macd_above_zero",
        category: "momentum",
        direction: "bullish",
        strength: 1,
        shortLabel: "MACD +Zone",
        description: `MACD line above zero — broad bullish bias. Medium-term trend favors buyers.`,
      });
    } else if (line < 0) {
      signals.push({
        id: "macd_below_zero",
        category: "momentum",
        direction: "bearish",
        strength: 1,
        shortLabel: "MACD −Zone",
        description: `MACD line below zero — broad bearish bias. Medium-term trend favors sellers.`,
      });
    }
  }

  // ─── Bollinger Bands ──────────────────────────────────────────────────────
  if (
    has("bollinger") &&
    snap.bbUpper !== undefined &&
    snap.bbLower !== undefined &&
    snap.bbMiddle !== undefined
  ) {
    const { close, bbUpper, bbLower, bbMiddle, bbWidth, prevBbWidth } = snap;

    if (close >= bbUpper) {
      signals.push({
        id: "bb_upper_touch",
        category: "volatility",
        direction: "bearish",
        strength: 2,
        shortLabel: "BB Upper",
        description: `Price tagging upper Bollinger band at ${fmtCurrency(bbUpper)} — extended. Mean reversion risk is elevated.`,
      });
    } else if (close <= bbLower) {
      signals.push({
        id: "bb_lower_touch",
        category: "volatility",
        direction: "bullish",
        strength: 2,
        shortLabel: "BB Lower",
        description: `Price touching lower Bollinger band at ${fmtCurrency(bbLower)} — oversold extreme. Snap-back potential is high.`,
      });
    } else if (prevSnap?.bbMiddle !== undefined) {
      const prevClose = prevSnap.close;
      if (prevClose < prevSnap.bbMiddle && close > bbMiddle) {
        signals.push({
          id: "bb_middle_recapture",
          category: "volatility",
          direction: "bullish",
          strength: 1,
          shortLabel: "BB Mid Recap",
          description: `Price recaptured Bollinger midband at ${fmtCurrency(bbMiddle)} — bulls regaining control.`,
        });
      } else if (prevClose > prevSnap.bbMiddle && close < bbMiddle) {
        signals.push({
          id: "bb_middle_loss",
          category: "volatility",
          direction: "bearish",
          strength: 1,
          shortLabel: "BB Mid Lost",
          description: `Price dropped below Bollinger midband at ${fmtCurrency(bbMiddle)} — bearish shift in trend.`,
        });
      }
    }

    if (bbWidth !== undefined && prevBbWidth !== undefined && prevBbWidth > 0) {
      const widthRatio = bbWidth / prevBbWidth;
      if (widthRatio < 0.85) {
        signals.push({
          id: "bb_squeeze",
          category: "volatility",
          direction: "neutral",
          strength: 1,
          shortLabel: "BB Squeeze",
          description: `Bollinger bands squeezing — volatility is compressing. A big move is loading. Direction TBD.`,
        });
      }
    }
  }

  // ─── SMA ──────────────────────────────────────────────────────────────────
  const hasSma20 = has("sma20");
  const hasSma50 = has("sma50");

  if (hasSma20 && snap.sma20 !== undefined) {
    if (snap.close > snap.sma20) {
      signals.push({
        id: "price_above_sma20",
        category: "trend",
        direction: "bullish",
        strength: 1,
        shortLabel: `> SMA20`,
        description: `Price above 20-day SMA at ${fmtCurrency(snap.sma20)} — short-term trend is bullish.`,
      });
    } else {
      signals.push({
        id: "price_below_sma20",
        category: "trend",
        direction: "bearish",
        strength: 1,
        shortLabel: `< SMA20`,
        description: `Price below 20-day SMA at ${fmtCurrency(snap.sma20)} — short-term trend is bearish.`,
      });
    }
  }

  if (hasSma50 && snap.sma50 !== undefined) {
    if (snap.close > snap.sma50) {
      signals.push({
        id: "price_above_sma50",
        category: "trend",
        direction: "bullish",
        strength: 1,
        shortLabel: `> SMA50`,
        description: `Price above 50-day SMA at ${fmtCurrency(snap.sma50)} — medium-term bulls in control.`,
      });
    } else {
      signals.push({
        id: "price_below_sma50",
        category: "trend",
        direction: "bearish",
        strength: 1,
        shortLabel: `< SMA50`,
        description: `Price below 50-day SMA at ${fmtCurrency(snap.sma50)} — medium-term bearish pressure.`,
      });
    }
  }

  // Golden / Death Cross
  if (
    hasSma20 &&
    hasSma50 &&
    snap.sma20 !== undefined &&
    snap.sma50 !== undefined &&
    prevSnap?.sma20 !== undefined &&
    prevSnap?.sma50 !== undefined
  ) {
    const nowAbove = snap.sma20 > snap.sma50;
    const prevAbove = prevSnap.sma20 > prevSnap.sma50;
    if (!prevAbove && nowAbove) {
      signals.push({
        id: "golden_cross",
        category: "trend",
        direction: "bullish",
        strength: 3,
        shortLabel: "Golden Cross",
        description: `Golden Cross — 20-day crossed above 50-day. Classic long-term bullish shift. Institutions pay attention to this.`,
      });
    } else if (prevAbove && !nowAbove) {
      signals.push({
        id: "death_cross",
        category: "trend",
        direction: "bearish",
        strength: 3,
        shortLabel: "Death Cross",
        description: `Death Cross — 20-day crossed below 50-day. Classic long-term bearish warning. Distribution phase may be starting.`,
      });
    }
  }

  // ─── EMA ──────────────────────────────────────────────────────────────────
  if (has("ema12") && snap.ema12 !== undefined) {
    if (snap.close > snap.ema12) {
      signals.push({
        id: "price_above_ema12",
        category: "trend",
        direction: "bullish",
        strength: 1,
        shortLabel: `> EMA12`,
        description: `Price above EMA12 at ${fmtCurrency(snap.ema12)} — short-term momentum is bullish.`,
      });
    } else {
      signals.push({
        id: "price_below_ema12",
        category: "trend",
        direction: "bearish",
        strength: 1,
        shortLabel: `< EMA12`,
        description: `Price below EMA12 at ${fmtCurrency(snap.ema12)} — short-term momentum is bearish.`,
      });
    }
  }

  if (has("ema26") && snap.ema26 !== undefined) {
    if (snap.close > snap.ema26) {
      signals.push({
        id: "price_above_ema26",
        category: "trend",
        direction: "bullish",
        strength: 1,
        shortLabel: `> EMA26`,
        description: `Price above EMA26 at ${fmtCurrency(snap.ema26)} — medium-term bullish bias.`,
      });
    } else {
      signals.push({
        id: "price_below_ema26",
        category: "trend",
        direction: "bearish",
        strength: 1,
        shortLabel: `< EMA26`,
        description: `Price below EMA26 at ${fmtCurrency(snap.ema26)} — medium-term bearish bias.`,
      });
    }
  }

  if (has("ema12") && has("ema26") && snap.ema12 !== undefined && snap.ema26 !== undefined) {
    if (snap.ema12 > snap.ema26) {
      signals.push({
        id: "ema_bull_alignment",
        category: "trend",
        direction: "bullish",
        strength: 1,
        shortLabel: "EMA Aligned ↑",
        description: `EMA12 above EMA26 — short-term EMA stack is bullish. Momentum favors longs.`,
      });
    } else {
      signals.push({
        id: "ema_bear_alignment",
        category: "trend",
        direction: "bearish",
        strength: 1,
        shortLabel: "EMA Aligned ↓",
        description: `EMA12 below EMA26 — short-term EMA stack is bearish. Momentum favors shorts.`,
      });
    }
  }

  // ─── ADX ──────────────────────────────────────────────────────────────────
  if (has("adx") && snap.adx !== undefined) {
    const adx = snap.adx;
    if (adx >= 40) {
      signals.push({
        id: "adx_very_strong",
        category: "trend",
        direction: "neutral",
        strength: 1,
        shortLabel: `ADX ${fmt(adx, 0)}`,
        description: `ADX at ${fmt(adx)} — extremely strong trend. Ride the momentum and avoid counter-trend trades.`,
      });
    } else if (adx >= 25) {
      signals.push({
        id: "adx_trending",
        category: "trend",
        direction: "neutral",
        strength: 1,
        shortLabel: `ADX ${fmt(adx, 0)}`,
        description: `ADX at ${fmt(adx)} — trending market confirmed. Trend-following signals are more reliable now.`,
      });
    } else {
      signals.push({
        id: "adx_ranging",
        category: "trend",
        direction: "neutral",
        strength: 1,
        shortLabel: `ADX ${fmt(adx, 0)}`,
        description: `ADX at ${fmt(adx)} — ranging market. Oscillators are your best tools here. Trend signals are noisy.`,
      });
    }
  }

  // ─── OBV ──────────────────────────────────────────────────────────────────
  if (has("obv") && snap.obvCurrent !== undefined && snap.obvPrev !== undefined) {
    const obvRising = snap.obvCurrent > snap.obvPrev;
    const priceRising = snap.close > (prevSnap?.close ?? snap.close);
    const priceFalling = snap.close < (prevSnap?.close ?? snap.close);

    if (obvRising && priceRising) {
      signals.push({
        id: "obv_confirms_bull",
        category: "volume",
        direction: "bullish",
        strength: 2,
        shortLabel: "OBV Confirms ↑",
        description: `OBV rising with price — smart money is participating in this rally. Volume confirms the move.`,
      });
    } else if (!obvRising && priceRising) {
      signals.push({
        id: "obv_divergence_bear",
        category: "volume",
        direction: "bearish",
        strength: 2,
        shortLabel: "OBV Div ↓",
        description: `OBV falling while price rises — volume doesn't confirm the rally. This is a distribution warning.`,
      });
    } else if (!obvRising && priceFalling) {
      signals.push({
        id: "obv_confirms_bear",
        category: "volume",
        direction: "bearish",
        strength: 1,
        shortLabel: "OBV Confirms ↓",
        description: `OBV confirms the downtrend — sellers are active with volume. No sign of absorption yet.`,
      });
    } else if (obvRising && priceFalling) {
      signals.push({
        id: "obv_divergence_bull",
        category: "volume",
        direction: "bullish",
        strength: 2,
        shortLabel: "OBV Div ↑",
        description: `OBV rising despite price dropping — smart money is accumulating on weakness. Bullish divergence.`,
      });
    }
  }

  // ─── CCI ──────────────────────────────────────────────────────────────────
  if (has("cci") && snap.cci !== undefined) {
    const cci = snap.cci;
    const prevCci = prevSnap?.cci;

    if (cci >= 200) {
      signals.push({
        id: "cci_extreme_ob",
        category: "momentum",
        direction: "bearish",
        strength: 3,
        shortLabel: `CCI ${fmt(cci, 0)}`,
        description: `CCI at ${fmt(cci)} — extreme overbought. This level rarely sustains. Mean reversion is overdue.`,
      });
    } else if (cci >= 100) {
      signals.push({
        id: "cci_ob",
        category: "momentum",
        direction: "bearish",
        strength: 2,
        shortLabel: `CCI ${fmt(cci, 0)}`,
        description: `CCI at ${fmt(cci)} — overbought zone. Sellers often appear at these levels.`,
      });
    } else if (cci <= -200) {
      signals.push({
        id: "cci_extreme_os",
        category: "momentum",
        direction: "bullish",
        strength: 3,
        shortLabel: `CCI ${fmt(cci, 0)}`,
        description: `CCI at ${fmt(cci)} — extreme oversold. Buyers historically step in hard at these readings.`,
      });
    } else if (cci <= -100) {
      signals.push({
        id: "cci_os",
        category: "momentum",
        direction: "bullish",
        strength: 2,
        shortLabel: `CCI ${fmt(cci, 0)}`,
        description: `CCI at ${fmt(cci)} — oversold zone. Price is statistically stretched to the downside.`,
      });
    }

    if (prevCci !== undefined && prevCci < 0 && cci >= 0) {
      signals.push({
        id: "cci_cross_zero_up",
        category: "momentum",
        direction: "bullish",
        strength: 1,
        shortLabel: "CCI Cross +",
        description: `CCI crossed above zero — momentum just turned positive. Early bullish shift signal.`,
      });
    } else if (prevCci !== undefined && prevCci > 0 && cci <= 0) {
      signals.push({
        id: "cci_cross_zero_dn",
        category: "momentum",
        direction: "bearish",
        strength: 1,
        shortLabel: "CCI Cross −",
        description: `CCI crossed below zero — momentum just turned negative. Early bearish shift signal.`,
      });
    }
  }

  // ─── Williams %R ─────────────────────────────────────────────────────────
  if (has("williams_r") && snap.williamsR !== undefined) {
    const wr = snap.williamsR;
    const prevWr = prevSnap?.williamsR;

    if (wr >= -20) {
      signals.push({
        id: "wr_ob",
        category: "momentum",
        direction: "bearish",
        strength: 2,
        shortLabel: `%R ${fmt(wr, 0)}`,
        description: `Williams %R at ${fmt(wr)} — overbought zone. Bulls are running out of steam.`,
      });
    } else if (wr <= -80) {
      signals.push({
        id: "wr_os",
        category: "momentum",
        direction: "bullish",
        strength: 2,
        shortLabel: `%R ${fmt(wr, 0)}`,
        description: `Williams %R at ${fmt(wr)} — oversold zone. Price is at a relative low. Watch for reversal.`,
      });
    }

    if (prevWr !== undefined && prevWr < -50 && wr >= -50) {
      signals.push({
        id: "wr_cross_mid_up",
        category: "momentum",
        direction: "bullish",
        strength: 1,
        shortLabel: "%R Cross +50",
        description: `Williams %R crossed midline upward — momentum improving. Bulls gaining the edge.`,
      });
    } else if (prevWr !== undefined && prevWr > -50 && wr <= -50) {
      signals.push({
        id: "wr_cross_mid_dn",
        category: "momentum",
        direction: "bearish",
        strength: 1,
        shortLabel: "%R Cross −50",
        description: `Williams %R dropped below midline — momentum deteriorating. Bears gaining the edge.`,
      });
    }
  }

  // ─── Parabolic SAR ────────────────────────────────────────────────────────
  if (has("psar") && snap.psarValue !== undefined) {
    const sarBullish = snap.psarValue < snap.close;
    const prevSarBullish =
      prevSnap?.psarValue !== undefined && prevSnap?.close !== undefined
        ? prevSnap.psarValue < prevSnap.close
        : null;

    // Flip detection (highest priority)
    if (prevSarBullish !== null && !prevSarBullish && sarBullish) {
      signals.push({
        id: "psar_flip_bull",
        category: "trend",
        direction: "bullish",
        strength: 3,
        shortLabel: "PSAR Flip ↑",
        description: `PSAR flipped bullish at ${fmtCurrency(snap.psarValue)} — trend just reversed. Strong entry signal; stops trail below.`,
      });
    } else if (prevSarBullish !== null && prevSarBullish && !sarBullish) {
      signals.push({
        id: "psar_flip_bear",
        category: "trend",
        direction: "bearish",
        strength: 3,
        shortLabel: "PSAR Flip ↓",
        description: `PSAR flipped bearish at ${fmtCurrency(snap.psarValue)} — sellers just took control. Trend reversal confirmed.`,
      });
    } else if (sarBullish) {
      signals.push({
        id: "psar_bull",
        category: "trend",
        direction: "bullish",
        strength: 2,
        shortLabel: "PSAR Below",
        description: `Parabolic SAR below price at ${fmtCurrency(snap.psarValue)} — bullish trend intact. Dots are your dynamic stop.`,
      });
    } else {
      signals.push({
        id: "psar_bear",
        category: "trend",
        direction: "bearish",
        strength: 2,
        shortLabel: "PSAR Above",
        description: `Parabolic SAR above price at ${fmtCurrency(snap.psarValue)} — bearish trend dominant. Price is under the SAR ceiling.`,
      });
    }
  }

  // ─── VWAP ─────────────────────────────────────────────────────────────────
  if (has("vwap") && snap.vwap !== undefined) {
    const prevClose = prevSnap?.close;
    const prevVwap = prevSnap?.vwap;

    if (prevClose !== undefined && prevVwap !== undefined) {
      const wasBelow = prevClose < prevVwap;
      const nowAbove = snap.close > snap.vwap;
      if (wasBelow && nowAbove) {
        signals.push({
          id: "vwap_cross_up",
          category: "volume",
          direction: "bullish",
          strength: 2,
          shortLabel: "VWAP Cross ↑",
          description: `Price crossed above VWAP at ${fmtCurrency(snap.vwap)} — institutions are now net buyers at this level.`,
        });
      } else if (!wasBelow && !nowAbove) {
        signals.push({
          id: "vwap_cross_dn",
          category: "volume",
          direction: "bearish",
          strength: 2,
          shortLabel: "VWAP Cross ↓",
          description: `Price crossed below VWAP at ${fmtCurrency(snap.vwap)} — institutional sellers are stepping in.`,
        });
      }
    }

    if (snap.close > snap.vwap) {
      signals.push({
        id: "price_above_vwap",
        category: "volume",
        direction: "bullish",
        strength: 1,
        shortLabel: "> VWAP",
        description: `Price above VWAP at ${fmtCurrency(snap.vwap)} — buyers are in control at the volume-weighted average.`,
      });
    } else {
      signals.push({
        id: "price_below_vwap",
        category: "volume",
        direction: "bearish",
        strength: 1,
        shortLabel: "< VWAP",
        description: `Price below VWAP at ${fmtCurrency(snap.vwap)} — sellers dominating. VWAP is acting as overhead resistance.`,
      });
    }
  }

  // ─── ATR ──────────────────────────────────────────────────────────────────
  if (has("atr") && snap.atr !== undefined && snap.atrAvg !== undefined && snap.atrAvg > 0) {
    const ratio = snap.atr / snap.atrAvg;
    if (ratio > 1.5) {
      signals.push({
        id: "atr_high",
        category: "volatility",
        direction: "neutral",
        strength: 1,
        shortLabel: `ATR High`,
        description: `ATR at ${fmtCurrency(snap.atr)} — ${((ratio - 1) * 100).toFixed(0)}% above average. High volatility: widen your stops or reduce size.`,
      });
    } else if (ratio < 0.7) {
      signals.push({
        id: "atr_low",
        category: "volatility",
        direction: "neutral",
        strength: 1,
        shortLabel: `ATR Squeeze`,
        description: `ATR at ${fmtCurrency(snap.atr)} — ${((1 - ratio) * 100).toFixed(0)}% below average. Quiet before the storm. Big move may be loading.`,
      });
    }
  }

  // ─── Stochastic ──────────────────────────────────────────────────────────
  if (has("stochastic") && snap.stochK !== undefined && snap.stochD !== undefined) {
    const k = snap.stochK;
    const prevK = prevSnap?.stochK;
    const prevD = prevSnap?.stochD;

    if (k >= 80) {
      signals.push({
        id: "stoch_ob",
        category: "momentum",
        direction: "bearish",
        strength: 2,
        shortLabel: `Stoch ${fmt(k, 0)}`,
        description: `Stochastic %K at ${fmt(k)} — overbought. Expect a pullback or consolidation soon.`,
      });
    } else if (k <= 20) {
      signals.push({
        id: "stoch_os",
        category: "momentum",
        direction: "bullish",
        strength: 2,
        shortLabel: `Stoch ${fmt(k, 0)}`,
        description: `Stochastic %K at ${fmt(k)} — oversold. Buyers historically emerge at these levels.`,
      });
    }

    if (prevK !== undefined && prevD !== undefined && snap.stochD !== undefined) {
      const prevD2 = prevD;
      if (prevK <= prevD2 && k > snap.stochD && k < 30) {
        signals.push({
          id: "stoch_bull_cross",
          category: "momentum",
          direction: "bullish",
          strength: 2,
          shortLabel: "Stoch Bull X",
          description: `Stochastic bullish crossover from oversold — %K crossed above %D below 30. High-quality buy signal.`,
        });
      } else if (prevK >= prevD2 && k < snap.stochD && k > 70) {
        signals.push({
          id: "stoch_bear_cross",
          category: "momentum",
          direction: "bearish",
          strength: 2,
          shortLabel: "Stoch Bear X",
          description: `Stochastic bearish crossover from overbought — %K crossed below %D above 70. High-quality sell signal.`,
        });
      }
    }
  }

  // ─── Compute confluence score ─────────────────────────────────────────────
  const dirMap: Record<SignalDirection, number> = {
    bullish: 1,
    bearish: -1,
    neutral: 0,
  };

  let rawScore = 0;
  let weightedMax = 0;
  for (const s of signals) {
    rawScore += dirMap[s.direction] * s.strength;
    weightedMax += s.strength;
  }

  const score =
    weightedMax > 0 ? Math.round((rawScore / weightedMax) * 100) : 0;

  return { signals, score };
}
