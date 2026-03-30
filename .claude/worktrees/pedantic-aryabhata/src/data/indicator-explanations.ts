import type { IndicatorType } from "@/stores/chart-store";

export interface IndicatorExplanation {
 name: string;
 shortDesc: string;
 howToRead: string;
 bullSignal: string;
 bearSignal: string;
 bestFor: string;
 commonMistakes: string;
 proTip: string;
 exampleScenario: string;
}

export const INDICATOR_EXPLANATIONS: Record<
 IndicatorType,
 IndicatorExplanation
> = {
 sma20: {
 name: "SMA 20",
 shortDesc: "20-period Simple Moving Average",
 howToRead:
 "The SMA 20 smooths price over the last 20 bars. When price is above the SMA, the short-term trend is up. When below, the trend is down.",
 bullSignal: "Price crosses above SMA 20 (short-term uptrend starting)",
 bearSignal: "Price crosses below SMA 20 (short-term downtrend starting)",
 bestFor: "Identifying short-term trend direction",
 commonMistakes:
 "Buying the golden cross after a 30% rally — the move is often already priced in. Many traders enter too late chasing SMA crossovers instead of buying pullbacks.",
 proTip:
 "Use SMA 20 as dynamic support in an uptrend. The best entry is a pullback TO the SMA, not a cross ABOVE it. Price touching SMA 20 with a bullish candle = quality risk/reward entry.",
 exampleScenario:
 "Price in uptrend pulls back from $195 to touch SMA 20 at $188, forms a hammer candle with above-average volume — price bounces back to $196. Classic 'buy the dip to the 20' setup used by momentum traders.",
 },
 sma50: {
 name: "SMA 50",
 shortDesc: "50-period Simple Moving Average",
 howToRead:
 "The SMA 50 shows the medium-term trend. A 'Golden Cross' (SMA 20 crosses above SMA 50) is a strong bullish signal. A 'Death Cross' (SMA 20 below SMA 50) is bearish.",
 bullSignal: "Price above SMA 50 or Golden Cross forming",
 bearSignal: "Price below SMA 50 or Death Cross forming",
 bestFor: "Confirming medium-term trends and crossover signals",
 commonMistakes:
 "Exiting positions immediately when price dips below SMA 50 — brief wicks below are common in normal volatility. Acting on every SMA 50 cross generates too many false exits.",
 proTip:
 "SMA 50 is the 'institutional buy zone' in bull markets — many large funds use it as a re-entry level on pullbacks. A bounce from SMA 50 with rising volume and RSI above 40 is a high-conviction entry.",
 exampleScenario:
 "Price in strong bull trend (ADX 35) pulls back to SMA 50 at $182, holds with 2× average volume buying, RSI touches 42 — triple confluence entry with natural stop just below SMA 50.",
 },
 ema12: {
 name: "EMA 12",
 shortDesc: "12-period Exponential Moving Average",
 howToRead:
 "The EMA 12 reacts faster than SMA because it weights recent prices more. It's one of the two lines used to calculate MACD.",
 bullSignal: "Price bouncing off EMA 12 as support",
 bearSignal: "Price rejected at EMA 12 as resistance",
 bestFor: "Fast-reacting trend following and MACD analysis",
 commonMistakes:
 "Using EMA 12 as a standalone signal — it's too fast and generates too many false signals in choppy markets. It whipsaws constantly in sideways price action.",
 proTip:
 "EMA 12 above EMA 26 confirms momentum is positive. In a strong uptrend, use EMA 12 as a dynamic trailing stop — close long position if price closes a full candle below EMA 12 on above-average volume.",
 exampleScenario:
 "EMA 12 crosses above EMA 26 while RSI is at 52 (not yet overbought) and price is above VWAP — three signals align for a clean trend-following entry with room to run before overbought territory.",
 },
 ema26: {
 name: "EMA 26",
 shortDesc: "26-period Exponential Moving Average",
 howToRead:
 "The EMA 26 is the slower component of MACD. When EMA 12 crosses above EMA 26, momentum is shifting bullish.",
 bullSignal: "EMA 12 crossing above EMA 26",
 bearSignal: "EMA 12 crossing below EMA 26",
 bestFor: "Medium-term momentum analysis with EMA 12",
 commonMistakes:
 "Confusing EMA 26 with SMA 26 — the exponential weighting means EMA reacts significantly faster to recent moves. Also, isolating EMA 26 from EMA 12 misses the full MACD context.",
 proTip:
 "EMA 26 acts as medium-term support/resistance. Price holding above EMA 26 while EMA 12 is also above signals a healthy, sustained uptrend. Institutions often re-enter positions at EMA 26 on pullbacks.",
 exampleScenario:
 "Stock in uptrend pulls back from highs and finds support exactly at EMA 26 at $182.50 — EMA 12 stays above EMA 26 (no cross), indicating the pullback is normal. Enter at EMA 26 touch with stop below the recent swing low.",
 },
 bollinger: {
 name: "Bollinger Bands",
 shortDesc: "SMA 20 with upper/lower bands at 2 standard deviations",
 howToRead:
 "Price tends to stay within the bands ~95% of the time. When price touches the upper band, it may be overbought. When it touches the lower band, it may be oversold. Narrow bands (squeeze) often precede big moves.",
 bullSignal:
 "Price bounces off lower band or breaks above upper band with high volume",
 bearSignal:
 "Price rejected at upper band or breaks below lower band with high volume",
 bestFor: "Spotting overbought/oversold conditions and volatility squeezes",
 commonMistakes:
 "Shorting every touch of the upper band in a strong uptrend — in a trending market, price can 'walk the bands' for days or weeks. Upper band touches are NOT automatic sell signals in a bull market.",
 proTip:
 "The Bollinger Squeeze (bands narrowing to a multi-month low in width) signals that a big directional move is coming — volatility contracts before it expands. The first strong directional candle after a squeeze determines the breakout direction.",
 exampleScenario:
 "BB width compresses to a 6-week low (squeeze alert), then price breaks above upper band on 3× normal volume — confirmed breakout. Professional traders buy the first pullback to the upper band after the initial breakout candle.",
 },
 rsi: {
 name: "RSI",
 shortDesc: "Measures overbought/oversold momentum (0-100)",
 howToRead:
 "RSI above 70 = overbought (price may pull back). RSI below 30 = oversold (price may bounce). RSI around 50 = neutral. Look for divergences where price makes new highs but RSI doesn't.",
 bullSignal: "RSI crosses above 30 from oversold territory",
 bearSignal: "RSI crosses above 70 into overbought territory",
 bestFor: "Spotting potential reversals and momentum shifts",
 commonMistakes:
 "Buying the moment RSI hits 30 in a downtrend — RSI can stay below 30 for weeks in a bear market. In strong downtrends, RSI 30 is just a brief pause before the next leg lower.",
 proTip:
 "Wait for RSI to turn back ABOVE 35 (not just touch 30) for confirmation. The most reliable setup: RSI divergence (price makes lower low, RSI makes higher low) + price at support + RSI crossing back above 35.",
 exampleScenario:
 "Price makes lower low at $178, but RSI makes higher low at 32 (vs 24 previously) — bullish divergence forming. RSI then crosses above 35 with a strong green candle. Three-part confirmation: divergence + support hold + momentum shift.",
 },
 macd: {
 name: "MACD",
 shortDesc: "Trend momentum via EMA convergence/divergence",
 howToRead:
 "MACD Line = EMA 12 - EMA 26. Signal Line = 9-period EMA of MACD. Histogram = difference between MACD and Signal. Green histogram bars growing = strengthening uptrend. Red bars growing = strengthening downtrend.",
 bullSignal:
 "MACD Line crosses above Signal Line (bullish crossover)",
 bearSignal:
 "MACD Line crosses below Signal Line (bearish crossover)",
 bestFor: "Confirming trend direction and timing entries/exits",
 commonMistakes:
 "Trading every MACD crossover in a ranging market — in sideways price action, MACD generates constant false signals. Only trade MACD crossovers in the direction of the larger trend (check ADX > 20 first).",
 proTip:
 "Watch the histogram BEFORE the crossover: when positive bars start shrinking in size, a bearish cross is approaching (and vice versa). Front-running by 1-2 bars as histogram momentum slows = better entry price.",
 exampleScenario:
 "ADX at 32 (confirmed strong trend), price in uptrend, MACD histogram turns from red to green (bullish cross) while RSI is at 48 (not overbought) — high-quality trend continuation entry with two confirmations.",
 },
 stochastic: {
 name: "Stochastic Oscillator",
 shortDesc: "Compares close to price range over 14 periods (0-100)",
 howToRead:
 "%K is the fast line, %D is the smoothed signal. Above 80 = overbought, below 20 = oversold. Best used in ranging markets, not strong trends.",
 bullSignal: "%K crosses above %D below the 20 level",
 bearSignal: "%K crosses below %D above the 80 level",
 bestFor: "Trading ranges and catching oversold bounces",
 commonMistakes:
 "Using Stochastic in a strong trending market — it stays overbought (above 80) for weeks in bull markets and oversold (below 20) for weeks in bear markets. Stochastic alone in a trend will cause you to fade winning positions.",
 proTip:
 "Stochastic works best when ADX < 20 (ranging market). Combine %K/%D crossovers with price being at a clear S/R level for confluence. When Stochastic AND RSI are both oversold simultaneously, the reversal signal has double confirmation.",
 exampleScenario:
 "Price oscillating between $180–$195 (ranging market, ADX 14). Stoch %K crosses above %D at the 18 level (oversold) while price touches $181 support — textbook range-trade buy with stop below $179 and target at $193.",
 },
 atr: {
 name: "ATR",
 shortDesc: "Measures average price volatility over 14 periods",
 howToRead:
 "ATR doesn't predict direction — it measures how much price moves. High ATR = volatile, bigger stop-losses needed. Low ATR = calm, tighter stops possible. Use ATR to set stop-loss distance (e.g., 2x ATR below entry).",
 bullSignal: "Rising ATR with rising price (strong uptrend)",
 bearSignal: "Rising ATR with falling price (strong downtrend)",
 bestFor: "Setting stop-loss distances and assessing volatility",
 commonMistakes:
 "Setting a fixed dollar stop-loss regardless of current market volatility. A $3 stop on a stock with ATR of $8 will be stopped out constantly by normal daily fluctuations — not by the trade thesis being wrong.",
 proTip:
 "Use ATR × 2 as your stop-loss distance for swing trades. When ATR expands to 1.5× its recent average (volatility spike), reduce position size proportionally — the same dollar stop now needs to be wider, increasing your risk.",
 exampleScenario:
 "ATR is $4.20 on AAPL. Buy at $188, set stop at $188 − (2 × $4.20) = $179.60. This stop is below normal daily noise but within your 2% account risk rule. ATR keeps the stop rational, not arbitrary.",
 },
 vwap: {
 name: "VWAP",
 shortDesc: "Volume-weighted average price (institutional benchmark)",
 howToRead:
 "VWAP shows the average price weighted by volume. Institutional traders consider buying below VWAP a 'good deal' and selling above VWAP a 'good exit'. Price tends to revert toward VWAP.",
 bullSignal: "Price crosses above VWAP (buyers in control)",
 bearSignal: "Price crosses below VWAP (sellers in control)",
 bestFor: "Finding fair value and institutional price levels",
 commonMistakes:
 "Using VWAP as a multi-day signal — it resets every session. VWAP is a single-day intraday tool; using it as a static support/resistance across multiple days misinterprets its purpose.",
 proTip:
 "The most powerful VWAP pattern: stock gaps up, sells off back to VWAP by mid-morning, then reclaims VWAP with strong volume ('VWAP reclaim'). This tells you institutional buyers stepped in at fair value.",
 exampleScenario:
 "Stock gaps up 2% at open, sellers push it back down to VWAP by 10am. A strong green candle with 3× volume reclaims VWAP — this 'VWAP reclaim' signals institutions absorbed the selling and are now in control.",
 },
 adx: {
 name: "ADX",
 shortDesc: "Average Directional Index — measures trend strength 0–100",
 howToRead:
 "ADX measures how strong a trend is, not its direction. Above 25 = strong trend (trade with it). Below 20 = weak/ranging market (avoid trend strategies). Above 40 = very strong trend.",
 bullSignal: "ADX rising above 25 while price is in uptrend",
 bearSignal: "ADX rising above 25 while price is in downtrend",
 bestFor: "Knowing whether to use trend-following or range strategies",
 commonMistakes:
 "Shorting a stock just because ADX is high — ADX measures TREND STRENGTH only, not direction. A high ADX with price rising means a strong uptrend, not a reversal signal.",
 proTip:
 "Use ADX as a strategy selector: ADX > 25 = switch to trend tools (MACD, moving averages). ADX < 20 = switch to oscillators (RSI, Stochastic, BB). This regime filter prevents you from using the wrong tool in the wrong market environment.",
 exampleScenario:
 "ADX rises from 18 to 30 as price breaks out of a 3-month trading range. The rising ADX confirms the breakout is real and gaining momentum — this is the signal to switch from range-trading mode to trend-following mode.",
 },
 obv: {
 name: "OBV",
 shortDesc: "On-Balance Volume — cumulative volume momentum",
 howToRead:
 "OBV adds volume on up days and subtracts on down days. When OBV rises with price, the trend is confirmed by volume. Divergence (OBV falling while price rises) is a warning sign.",
 bullSignal: "OBV rising alongside rising price (confirmed uptrend)",
 bearSignal: "OBV falling while price rises (bearish divergence)",
 bestFor: "Confirming trends with volume and spotting divergences",
 commonMistakes:
 "Treating the raw OBV number as meaningful — the absolute value is irrelevant. Only the DIRECTION of OBV and its divergence from price matters. OBV at 50 million is not inherently bullish.",
 proTip:
 "OBV often LEADS price — it can make new highs before price breaks out of a range ('OBV breakout before price breakout'). If OBV is making new highs while price is still consolidating, smart money is quietly accumulating.",
 exampleScenario:
 "Price stuck at $195 resistance for 2 weeks, but OBV quietly makes new all-time highs — institutional accumulation signal. When price finally breaks $195, OBV already confirmed the breakout was legitimate before it happened.",
 },
 cci: {
 name: "CCI",
 shortDesc: "Commodity Channel Index — overbought/oversold oscillator",
 howToRead:
 "CCI measures how far price is from its average. Above +100 = overbought (consider selling). Below -100 = oversold (consider buying). Zero line = price at its average.",
 bullSignal: "CCI crosses above -100 from oversold territory",
 bearSignal: "CCI crosses below +100 from overbought territory",
 bestFor: "Spotting overbought/oversold extremes and trend reversals",
 commonMistakes:
 "Treating CCI ±100 as rigid overbought/oversold thresholds — in a strong trend, CCI can stay above +100 for extended periods. The +100 level alone is not a sell signal in a strong bull market.",
 proTip:
 "Extreme CCI readings are the most reliable signals: CCI crossing back BELOW +200 from an extreme spike = powerful short signal. CCI crossing back ABOVE -200 from extreme oversold = powerful buy signal. These extreme reversals are rare but highly reliable.",
 exampleScenario:
 "CCI spikes to +240 on earnings day, then reverses below +100 two days later as traders take profits — this crossing back below +100 from extreme territory is more reliable than the initial +100 breach. The extreme reading signals the move is exhausted.",
 },
 williams_r: {
 name: "Williams %R",
 shortDesc: "Williams %R — inverse stochastic oscillator (0 to -100)",
 howToRead:
 "Williams %R measures where price sits within its recent high-low range. Above -20 = overbought. Below -80 = oversold. Scale is inverted: -100 is the low, 0 is the high.",
 bullSignal: "Williams %R rises above -80 from oversold levels",
 bearSignal: "Williams %R falls below -20 from overbought levels",
 bestFor: "Short-term reversals and overbought/oversold timing",
 commonMistakes:
 "Confusing the inverted scale — %R near 0 means OVERBOUGHT (price near its high), not oversold. Many beginners make the opposite trade because the logic is reversed compared to RSI.",
 proTip:
 "Williams %R is most powerful when combined with Stochastic — when BOTH read below -80 simultaneously, the oversold signal has double confirmation and is significantly more reliable than either alone.",
 exampleScenario:
 "Williams %R drops to -88 while price tests major support at $175. The next day, %R rises back above -80 and a strong green candle forms — entry trigger confirmed. The quick recovery from -88 shows buyers stepped in aggressively at support.",
 },
 psar: {
 name: "Parabolic SAR",
 shortDesc: "Parabolic SAR — trailing stop and reversal dots",
 howToRead:
 "Dots below price = bullish trend (SAR acts as trailing stop below). Dots above price = bearish trend (SAR acts as trailing stop above). When price crosses the SAR dots, the trend may be reversing.",
 bullSignal: "SAR dots flip from above to below price (bullish reversal)",
 bearSignal: "SAR dots flip from below to above price (bearish reversal)",
 bestFor: "Trailing stop placement and trend reversal detection",
 commonMistakes:
 "Acting on every dot flip — in low-ADX ranging markets, PSAR flips constantly generating false signals. PSAR was designed for trending markets; using it in sideways chop leads to constant whipsaws.",
 proTip:
 "PSAR is most reliable when ADX > 25 (confirmed trend). Combine with MACD direction: a PSAR bullish flip that aligns with MACD histogram going green = high-confidence trend reversal with two confirmations. Use the PSAR dot as your dynamic trailing stop price.",
 exampleScenario:
 "ADX at 32 (strong trend confirmed), PSAR flips from above to below price at $183.40, MACD histogram simultaneously turns green — triple confluence reversal signal. Trail your stop up to each new PSAR dot level as the uptrend develops.",
 },
};
