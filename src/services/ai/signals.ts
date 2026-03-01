import type { IndicatorType } from "@/stores/chart-store";

export type SignalDirection = "bullish" | "bearish" | "neutral";

export interface Signal {
  id: string;
  category: "momentum" | "trend" | "volume" | "volatility" | "pattern";
  direction: SignalDirection;
  strength: 1 | 2 | 3;
  description: string;
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

function fmt(v: number, decimals = 2): string {
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
        description: `RSI at ${fmt(rsi)} — severely overbought`,
      });
    } else if (rsi >= 70) {
      signals.push({
        id: "rsi_ob",
        category: "momentum",
        direction: "bearish",
        strength: 2,
        description: `RSI at ${fmt(rsi)} — overbought`,
      });
    } else if (rsi <= 20) {
      signals.push({
        id: "rsi_extreme_os",
        category: "momentum",
        direction: "bullish",
        strength: 3,
        description: `RSI at ${fmt(rsi)} — severely oversold`,
      });
    } else if (rsi <= 30) {
      signals.push({
        id: "rsi_os",
        category: "momentum",
        direction: "bullish",
        strength: 2,
        description: `RSI at ${fmt(rsi)} — oversold`,
      });
    }

    if (prevRsi !== undefined) {
      if (prevRsi < 50 && rsi >= 50) {
        signals.push({
          id: "rsi_cross_50_up",
          category: "momentum",
          direction: "bullish",
          strength: 1,
          description: `RSI crossed above 50 — momentum building`,
        });
      } else if (prevRsi > 50 && rsi <= 50) {
        signals.push({
          id: "rsi_cross_50_dn",
          category: "momentum",
          direction: "bearish",
          strength: 1,
          description: `RSI crossed below 50 — momentum weakening`,
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
          description: `MACD bullish crossover — histogram turned positive`,
        });
      } else if (prevHist >= 0 && hist < 0) {
        signals.push({
          id: "macd_cross_bear",
          category: "momentum",
          direction: "bearish",
          strength: 2,
          description: `MACD bearish crossover — histogram turned negative`,
        });
      } else if (hist > 0 && hist > prevHist) {
        signals.push({
          id: "macd_accel_pos",
          category: "momentum",
          direction: "bullish",
          strength: 1,
          description: `MACD momentum accelerating upward`,
        });
      } else if (hist < 0 && hist < prevHist) {
        signals.push({
          id: "macd_accel_neg",
          category: "momentum",
          direction: "bearish",
          strength: 1,
          description: `MACD momentum accelerating downward`,
        });
      }
    }

    if (line > 0) {
      signals.push({
        id: "macd_above_zero",
        category: "momentum",
        direction: "bullish",
        strength: 1,
        description: `MACD line above zero — bullish bias`,
      });
    } else if (line < 0) {
      signals.push({
        id: "macd_below_zero",
        category: "momentum",
        direction: "bearish",
        strength: 1,
        description: `MACD line below zero — bearish bias`,
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
        description: `Price at upper Bollinger band (${fmtCurrency(bbUpper)}) — overbought`,
      });
    } else if (close <= bbLower) {
      signals.push({
        id: "bb_lower_touch",
        category: "volatility",
        direction: "bullish",
        strength: 2,
        description: `Price at lower Bollinger band (${fmtCurrency(bbLower)}) — oversold`,
      });
    } else if (prevSnap?.bbMiddle !== undefined) {
      const prevClose = prevSnap.close;
      if (prevClose < prevSnap.bbMiddle && close > bbMiddle) {
        signals.push({
          id: "bb_middle_recapture",
          category: "volatility",
          direction: "bullish",
          strength: 1,
          description: `Price recaptured Bollinger midband (${fmtCurrency(bbMiddle)})`,
        });
      } else if (prevClose > prevSnap.bbMiddle && close < bbMiddle) {
        signals.push({
          id: "bb_middle_loss",
          category: "volatility",
          direction: "bearish",
          strength: 1,
          description: `Price dropped below Bollinger midband (${fmtCurrency(bbMiddle)})`,
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
          description: `Bollinger squeeze detected — breakout imminent`,
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
        description: `Price above 20-day SMA (${fmtCurrency(snap.sma20)})`,
      });
    } else {
      signals.push({
        id: "price_below_sma20",
        category: "trend",
        direction: "bearish",
        strength: 1,
        description: `Price below 20-day SMA (${fmtCurrency(snap.sma20)})`,
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
        description: `Price above 50-day SMA (${fmtCurrency(snap.sma50)})`,
      });
    } else {
      signals.push({
        id: "price_below_sma50",
        category: "trend",
        direction: "bearish",
        strength: 1,
        description: `Price below 50-day SMA (${fmtCurrency(snap.sma50)})`,
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
        description: `Golden cross — SMA20 crossed above SMA50`,
      });
    } else if (prevAbove && !nowAbove) {
      signals.push({
        id: "death_cross",
        category: "trend",
        direction: "bearish",
        strength: 3,
        description: `Death cross — SMA20 crossed below SMA50`,
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
        description: `Price above EMA12 (${fmtCurrency(snap.ema12)})`,
      });
    } else {
      signals.push({
        id: "price_below_ema12",
        category: "trend",
        direction: "bearish",
        strength: 1,
        description: `Price below EMA12 (${fmtCurrency(snap.ema12)})`,
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
        description: `Price above EMA26 (${fmtCurrency(snap.ema26)})`,
      });
    } else {
      signals.push({
        id: "price_below_ema26",
        category: "trend",
        direction: "bearish",
        strength: 1,
        description: `Price below EMA26 (${fmtCurrency(snap.ema26)})`,
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
        description: `EMA12 above EMA26 — short-term bullish alignment`,
      });
    } else {
      signals.push({
        id: "ema_bear_alignment",
        category: "trend",
        direction: "bearish",
        strength: 1,
        description: `EMA12 below EMA26 — short-term bearish alignment`,
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
        description: `ADX at ${fmt(adx)} — very strong trend, ride the momentum`,
      });
    } else if (adx >= 25) {
      signals.push({
        id: "adx_trending",
        category: "trend",
        direction: "neutral",
        strength: 1,
        description: `ADX at ${fmt(adx)} — trending market, follow the trend`,
      });
    } else {
      signals.push({
        id: "adx_ranging",
        category: "trend",
        direction: "neutral",
        strength: 1,
        description: `ADX at ${fmt(adx)} — ranging market, oscillators more reliable`,
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
        description: `OBV confirms uptrend — volume supports price advance`,
      });
    } else if (!obvRising && priceRising) {
      signals.push({
        id: "obv_divergence_bear",
        category: "volume",
        direction: "bearish",
        strength: 2,
        description: `OBV divergence — volume not confirming price rally`,
      });
    } else if (!obvRising && priceFalling) {
      signals.push({
        id: "obv_confirms_bear",
        category: "volume",
        direction: "bearish",
        strength: 1,
        description: `OBV confirms downtrend — volume supports selling`,
      });
    } else if (obvRising && priceFalling) {
      signals.push({
        id: "obv_divergence_bull",
        category: "volume",
        direction: "bullish",
        strength: 2,
        description: `OBV bullish divergence — volume accumulating despite price drop`,
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
        description: `CCI at ${fmt(cci)} — extremely overbought`,
      });
    } else if (cci >= 100) {
      signals.push({
        id: "cci_ob",
        category: "momentum",
        direction: "bearish",
        strength: 2,
        description: `CCI at ${fmt(cci)} — overbought`,
      });
    } else if (cci <= -200) {
      signals.push({
        id: "cci_extreme_os",
        category: "momentum",
        direction: "bullish",
        strength: 3,
        description: `CCI at ${fmt(cci)} — extremely oversold`,
      });
    } else if (cci <= -100) {
      signals.push({
        id: "cci_os",
        category: "momentum",
        direction: "bullish",
        strength: 2,
        description: `CCI at ${fmt(cci)} — oversold`,
      });
    }

    if (prevCci !== undefined && prevCci < 0 && cci >= 0) {
      signals.push({
        id: "cci_cross_zero_up",
        category: "momentum",
        direction: "bullish",
        strength: 1,
        description: `CCI crossed zero — momentum turning positive`,
      });
    } else if (prevCci !== undefined && prevCci > 0 && cci <= 0) {
      signals.push({
        id: "cci_cross_zero_dn",
        category: "momentum",
        direction: "bearish",
        strength: 1,
        description: `CCI crossed zero — momentum turning negative`,
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
        description: `Williams %R at ${fmt(wr)} — overbought zone`,
      });
    } else if (wr <= -80) {
      signals.push({
        id: "wr_os",
        category: "momentum",
        direction: "bullish",
        strength: 2,
        description: `Williams %R at ${fmt(wr)} — oversold zone`,
      });
    }

    if (prevWr !== undefined && prevWr < -50 && wr >= -50) {
      signals.push({
        id: "wr_cross_mid_up",
        category: "momentum",
        direction: "bullish",
        strength: 1,
        description: `Williams %R crossing midline — momentum improving`,
      });
    } else if (prevWr !== undefined && prevWr > -50 && wr <= -50) {
      signals.push({
        id: "wr_cross_mid_dn",
        category: "momentum",
        direction: "bearish",
        strength: 1,
        description: `Williams %R dropping below midline — momentum weakening`,
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
        description: `PSAR flipped bullish at ${fmtCurrency(snap.psarValue)} — trend reversal`,
      });
    } else if (prevSarBullish !== null && prevSarBullish && !sarBullish) {
      signals.push({
        id: "psar_flip_bear",
        category: "trend",
        direction: "bearish",
        strength: 3,
        description: `PSAR flipped bearish at ${fmtCurrency(snap.psarValue)} — trend reversal`,
      });
    } else if (sarBullish) {
      signals.push({
        id: "psar_bull",
        category: "trend",
        direction: "bullish",
        strength: 2,
        description: `PSAR below price at ${fmtCurrency(snap.psarValue)} — bullish trend intact`,
      });
    } else {
      signals.push({
        id: "psar_bear",
        category: "trend",
        direction: "bearish",
        strength: 2,
        description: `PSAR above price at ${fmtCurrency(snap.psarValue)} — bearish trend intact`,
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
          description: `Price crossed above VWAP (${fmtCurrency(snap.vwap)}) — institutional buy signal`,
        });
      } else if (!wasBelow && !nowAbove) {
        signals.push({
          id: "vwap_cross_dn",
          category: "volume",
          direction: "bearish",
          strength: 2,
          description: `Price crossed below VWAP (${fmtCurrency(snap.vwap)}) — bearish signal`,
        });
      }
    }

    if (snap.close > snap.vwap) {
      signals.push({
        id: "price_above_vwap",
        category: "volume",
        direction: "bullish",
        strength: 1,
        description: `Price above VWAP (${fmtCurrency(snap.vwap)}) — institutional buy zone`,
      });
    } else {
      signals.push({
        id: "price_below_vwap",
        category: "volume",
        direction: "bearish",
        strength: 1,
        description: `Price below VWAP (${fmtCurrency(snap.vwap)}) — selling pressure`,
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
        description: `High volatility (ATR ${fmtCurrency(snap.atr)}) — widen stops accordingly`,
      });
    } else if (ratio < 0.7) {
      signals.push({
        id: "atr_low",
        category: "volatility",
        direction: "neutral",
        strength: 1,
        description: `Low volatility (ATR ${fmtCurrency(snap.atr)}) — potential squeeze ahead`,
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
        description: `Stochastic %K at ${fmt(k)} — overbought`,
      });
    } else if (k <= 20) {
      signals.push({
        id: "stoch_os",
        category: "momentum",
        direction: "bullish",
        strength: 2,
        description: `Stochastic %K at ${fmt(k)} — oversold`,
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
          description: `Stochastic bullish crossover from oversold — strong buy signal`,
        });
      } else if (prevK >= prevD2 && k < snap.stochD && k > 70) {
        signals.push({
          id: "stoch_bear_cross",
          category: "momentum",
          direction: "bearish",
          strength: 2,
          description: `Stochastic bearish crossover from overbought — strong sell signal`,
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
