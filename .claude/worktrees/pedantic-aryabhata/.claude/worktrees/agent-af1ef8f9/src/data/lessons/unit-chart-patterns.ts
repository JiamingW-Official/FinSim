import type { Unit } from "./types";

export const UNIT_CHART_PATTERNS: Unit = {
  id: "chart-patterns",
  title: "Chart Patterns Complete Guide",
  description: "Master every major chart pattern used by professional traders",
  icon: "GitBranch",
  color: "#f59e0b",
  lessons: [
    /* ================================================================
       LESSON 1 — Trend Continuation Patterns (chart-patterns-1)
       ================================================================ */
    {
      id: "chart-patterns-1",
      title: "Trend Continuation Patterns",
      description:
        "Flags, Pennants, Wedges, Triangles -- setup, volume confirmation, measured targets",
      icon: "Flag",
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "Bull Flags and Bear Flags",
          content:
            "**Flags** are short-term consolidation patterns that form after a sharp, near-vertical price move (the flagpole). They represent a brief pause in a strong trend before continuation.\n\n**Bull Flag Construction**:\n1. Flagpole: A sharp rally on heavy volume, typically 10-20% in 5-10 sessions\n2. Flag body: A shallow, orderly pullback in a parallel channel angled slightly downward. Volume contracts markedly during the consolidation -- ideally declining each session\n3. Breakout: Price breaks above the upper trendline of the flag channel on volume that is at least 150% of the 20-day average\n\n**Measured Move Target**: Add the length of the flagpole to the breakout point. If the flagpole rose $20 and the breakout occurs at $115, the minimum target is $135.\n\n**Bear Flag**: Mirror image -- sharp decline (flagpole), then a shallow counter-rally in a parallel channel angled slightly upward on declining volume, followed by breakdown on expanding volume.\n\n**Key statistics**: Research on flag patterns in the S&P 500 universe (1990-2015) found:\n- Bull flags that break out on 2x average volume succeed (reach the measured move target) approximately 67% of the time\n- Bull flags that break out on below-average volume succeed only 38% of the time\n- Average time to reach the measured target: 15-25 trading sessions\n\n**Common mistake**: Entering the flag before the breakout. Flags can fail and turn into range reversals. The breakout confirmation and volume surge are essential -- they confirm that the prior trend's buyers have returned.",
          visual: "candlestick",
          highlight: ["flagpole", "breakout", "measured move"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock rallied from $80 to $100 in 8 sessions on heavy volume (the flagpole). It then consolidated for 12 sessions in a downward-sloping channel between $96 and $92 on declining volume. Today it closes above $96 on 2.3x average volume. What is the measured move target?",
          options: [
            "$116 -- the flagpole height ($20) added to the breakout point ($96)",
            "$120 -- the flagpole height added to the flagpole high ($100)",
            "$112 -- halfway measure from flagpole",
            "$104 -- the prior high plus the flag range ($96-$92 = $4 x 2)",
          ],
          correctIndex: 0,
          explanation:
            "The flagpole height is $100 - $80 = $20. The breakout occurs at $96 (the upper boundary of the flag channel). The measured move target = breakout price + flagpole height = $96 + $20 = $116. Note: some practitioners use the original flagpole high ($100) as the addition base, giving $120, but the more conservative and commonly used method is the breakout level + flagpole height.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Pennants and Symmetrical Triangles",
          content:
            "**Pennants** are similar to flags but with converging trendlines (forming a small symmetrical triangle) rather than parallel channel trendlines.\n\n**Pennant construction**:\n1. Flagpole: Same sharp, high-volume move as a flag\n2. Pennant body: Price consolidates in a symmetrical triangle with lower highs and higher lows, converging toward an apex. Volume contracts in a wedge pattern\n3. Breakout: Price breaks out of the triangle (in the direction of the prior trend) on volume\n\n**Symmetrical Triangle (without a flagpole)**: Same converging trendline structure but forms over a longer period (weeks or months) without a prior sharp move. These are more ambiguous -- can be either continuation or reversal patterns. The prevailing trend before the triangle forms biases the expected resolution.\n\n**Ascending Triangle**: Horizontal resistance with higher lows. Inherently bullish -- buyers are becoming increasingly aggressive while sellers maintain a fixed offer. The flat resistance defines the breakout price; the measured target is the triangle height added to the resistance level.\n\n**Descending Triangle**: Horizontal support with lower highs. Inherently bearish -- sellers are becoming increasingly aggressive while buyers maintain a fixed bid.\n\n**Statistical performance (Thomas Bulkowski's Encyclopedia of Chart Patterns)**:\n- Ascending triangles: break upward 75% of the time; reach measured target 75% of breakouts\n- Descending triangles: break downward 72% of the time; reach measured target 72% of breakouts\n- Symmetrical triangles: break in the prior trend direction 54% of the time; reach measured target 66% of breakouts\n\n**Volume within the triangle**: Volume should decline from left to right as the triangle forms. A spike in volume within the triangle before the breakout is often a false signal.",
          highlight: ["pennant", "ascending triangle", "descending triangle"],
        },
        {
          type: "quiz-tf",
          statement:
            "A descending triangle pattern (flat support, declining highs) breaks upward more frequently than it breaks downward.",
          correct: false,
          explanation:
            "Descending triangles break to the downside approximately 72% of the time. The pattern structure -- sellers consistently pressing lower while buyers hold a fixed support level -- creates a bias toward bearish resolution. The sellers are gradually overpowering the buyers by accepting lower prices. When the support finally gives way, the resolution is most often a downside breakdown.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Rising and Falling Wedges",
          content:
            "**Wedges** have converging trendlines like pennants but slope in the same direction (both angled up or both angled down). This shared slope is what distinguishes them from pennants and makes them more complex.\n\n**Rising Wedge (Bearish)**:\n- Both the upper and lower trendlines slope upward, but they converge\n- Price makes higher highs and higher lows, but the highs are rising slower than the lows\n- This pattern signals that buyers are losing control -- despite the upward bias, the market is narrowing\n- Resolution: approximately 81% break downward when the rising wedge forms in an uptrend (Bulkowski data)\n- When the lower trendline breaks, the initial measured target is the height of the wedge at its widest point, subtracted from the breakdown price\n\n**Falling Wedge (Bullish)**:\n- Both trendlines slope downward and converge\n- Price makes lower lows and lower highs, but the lows are declining faster than the highs\n- Sellers are losing control of the downtrend -- the market is compressing despite the bearish bias\n- Resolution: approximately 74% break upward when the falling wedge forms in a downtrend\n- The most powerful falling wedge entries occur when a falling wedge forms as a pullback within a larger uptrend\n\n**Volume confirmation is essential for wedges**: Volume should contract steadily from left to right within the wedge. The breakout must occur on a noticeable volume expansion. Wedge breakouts on flat or declining volume are frequently false moves that reverse within 3-5 sessions.\n\n**False breakout risk**: Wedges are prone to false breakouts because the converging structure naturally squeezes price. Waiting for a close (not just an intraday move) outside the wedge significantly reduces false-breakout entries.",
          highlight: ["rising wedge", "falling wedge", "false breakout"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A stock has been in an uptrend since January, rising from $40 to $90 over six months. Starting in July, it begins forming a pattern where the highs are $90, $86, $83 and the lows are $78, $82, $84. Both the upper and lower trendlines slope downward and are converging toward an apex projected in late August.",
          question: "What pattern has formed and what is the expected resolution?",
          options: [
            "Falling wedge -- a bullish continuation/reversal pattern where downward-converging trendlines signal seller exhaustion; breakout upward is expected approximately 74% of the time",
            "Descending triangle -- flat support means the sellers are in control; break lower is expected",
            "Bearish flag -- the downward drift on declining momentum signals continuation of a downtrend",
            "Symmetrical triangle -- direction of breakout is random and cannot be predicted",
          ],
          correctIndex: 0,
          explanation:
            "A pattern with both trendlines declining and converging, after a major uptrend, is a falling wedge -- and in this context it is a pullback/continuation falling wedge within the larger uptrend. The lows are declining faster than the highs (78, 82, 84 vs 90, 86, 83), which means sellers are losing momentum with each successive low. The expected resolution is an upward breakout with a target near the prior high of $90, and potentially higher if the uptrend continues.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "According to Thomas Bulkowski's research, which continuation pattern has the highest rate of reaching its measured target after a valid breakout?",
          options: [
            "Ascending triangle (approximately 75% reach target)",
            "Symmetrical triangle (approximately 66% reach target)",
            "Bull flag on below-average volume (approximately 38% reach target)",
            "Rising wedge breaking upward (approximately 29% reach target)",
          ],
          correctIndex: 0,
          explanation:
            "Ascending triangles have one of the highest target-completion rates of all chart patterns -- approximately 75% of valid upward breakouts reach the measured move target (triangle height added to the resistance line). The pattern's geometry (higher lows compressing toward a defined resistance) creates a coiled setup where the eventual breakout tends to be decisive and sustained.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Reversal Patterns (chart-patterns-2)
       ================================================================ */
    {
      id: "chart-patterns-2",
      title: "Reversal Patterns",
      description:
        "Head and Shoulders, Double Top/Bottom, Triple patterns, failure rates",
      icon: "ArrowLeftRight",
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "Head and Shoulders: The Classic Reversal",
          content:
            "The **Head and Shoulders (H&S)** pattern is the most studied chart reversal formation in technical analysis. It consists of three peaks with the middle peak (head) rising higher than the two outer peaks (shoulders).\n\n**Construction**:\n1. Left shoulder: Price rallies to a high on strong volume, then pulls back to a trough\n2. Head: Price rallies to a higher high (often on slightly lower volume -- the first warning), then pulls back to a similar trough level\n3. Right shoulder: Price rallies to a lower high than the head (confirming weakening momentum) on lower volume\n4. Neckline: A line connecting the two troughs. The breakdown below the neckline is the sell signal\n5. Volume at the breakdown should expand -- high-volume confirmation is critical\n\n**Measured target**: The vertical distance from the head to the neckline is subtracted from the neckline breakdown price.\n- Example: Head at $80, neckline at $65, height = $15. Breakdown at $65 gives a target of $50.\n\n**Statistical data (Bulkowski, 1500+ patterns)**:\n- H&S patterns that break the neckline on above-average volume reach the measured target 74% of the time\n- Average decline after neckline break: 23% from the neckline level\n- Pattern failure rate (price fails to reach target): approximately 26%\n- The neckline is sometimes not perfectly horizontal -- a rising neckline (bullish sign during the pattern) often signals a weaker pattern; a declining neckline is more bearish\n\n**Neckline retest**: Approximately 45% of H&S patterns see a neckline retest after the initial break. In these cases, the neckline acts as resistance. A failed retest (price cannot reclaim the neckline) confirms the pattern. This retest gives late entrants a second opportunity to establish short positions.",
          visual: "candlestick",
          highlight: ["head and shoulders", "neckline", "measured target"],
        },
        {
          type: "quiz-mc",
          question:
            "A Head and Shoulders top forms with the head at $95, left shoulder at $88, right shoulder at $87, and neckline at $78. The pattern breaks down through $78. What is the measured target?",
          options: [
            "$61 -- neckline ($78) minus head-to-neckline distance ($95 - $78 = $17)",
            "$69 -- halfway between neckline and target",
            "$55 -- the right shoulder ($87) minus neckline ($78 = $9) x 2, subtracted from neckline",
            "$71 -- one standard deviation below the neckline",
          ],
          correctIndex: 0,
          explanation:
            "The head-to-neckline vertical distance = $95 (head) - $78 (neckline) = $17. This $17 is subtracted from the neckline breakdown price of $78: $78 - $17 = $61. This is the minimum expected target for a successful Head and Shoulders breakdown. Some practitioners also measure from the right shoulder ($87) for a more conservative near-term target ($87 - $17 = $70).",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Double Top and Double Bottom: The Most Common Reversals",
          content:
            "**Double Top** and **Double Bottom** patterns are the most frequently observed and traded reversal formations. Their simplicity makes them both accessible and reliable when properly qualified.\n\n**Double Top Formation**:\n1. Price makes a high (first top), retreats at least 10-15% to a trough (the confirmation level)\n2. Price rallies back to approximately the same level (within 3% of the first top) -- second top. Volume should be notably lower on the second top.\n3. Price breaks below the trough (confirmation level) -- this is the sell signal\n4. Measured target: depth of the pattern (top to trough) subtracted from the trough breakdown\n\n**Double Top quality rules**:\n- The two tops should be within 3% of each other in price. Wider deviation weakens the pattern.\n- Minimum time between tops: 4 weeks. Patterns formed in less than 4 weeks are considered short-term noise.\n- Volume at the second top should be less than volume at the first top (reduced buying conviction)\n\n**Double Bottom Formation**: Mirror image -- two lows within 3% of each other, a minimum 10% trough between them, confirmation on a close above the interim high, and higher volume on the second bottom or the breakout.\n\n**Statistical reliability (Bulkowski)**:\n- Double Tops with volume confirmation: 76% reach the measured target after breakdown\n- Double Bottoms with volume confirmation: 78% reach the measured target after breakout\n- Failure rate without volume confirmation: approximately 40-45% (significantly higher)\n- Average move after breakdown: Double Tops -18%; Double Bottoms +38% (asymmetric due to market tendency to rally more slowly than it falls)\n\n**Critical distinction from a range**: A double top is distinct from a simple trading range only when confirmed by a break of the trough. Never assume a double top exists before the trough is broken.",
          highlight: ["double top", "double bottom", "trough", "confirmation"],
        },
        {
          type: "quiz-tf",
          statement:
            "A double top pattern is confirmed and the sell signal triggered when price makes a second top at approximately the same level as the first top.",
          correct: false,
          explanation:
            "The second top forms the pattern structure, but the confirmation (and actual sell signal) occurs when price breaks below the trough (the interim low between the two tops). The second top alone is only a setup -- it could simply be a range. Many traders erroneously sell at the second top without confirmation, then get stopped out if price continues to rally, creating a situation that invalidates the entire pattern.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Triple Tops and Triple Bottoms",
          content:
            "**Triple Top** and **Triple Bottom** patterns are extensions of the double pattern concept. They are rarer but statistically more reliable once confirmed, because price has tested and failed three times at the same level.\n\n**Triple Top**:\n- Three peaks at approximately the same level (within 3-5%)\n- Volume typically declines progressively: highest on the first peak, moderate on the second, lightest on the third\n- The pattern duration is longer than a double top (often 3-6 months)\n- Confirmation: breakdown below the lowest trough between the three peaks\n- Measured target: three-peak height minus the trough depth, subtracted from the breakdown\n\n**Triple Bottom**: Mirror image with the same rules applied to lows instead of highs.\n\n**Statistical data**:\n- Triple Tops: 87% reach the measured target after confirmation (Bulkowski, 129 patterns analyzed). This is one of the highest target-completion rates of any chart pattern.\n- Triple Bottoms: 86% reach the measured target.\n- Average decline after Triple Top breakdown: 25%\n- Average advance after Triple Bottom breakout: 37%\n- Average pattern duration: Triple Tops 104 days; Triple Bottoms 85 days\n\n**Why triple patterns are more reliable**: Each failed test of the resistance (for tops) sends a clearer message -- three independent rallies tried and failed to produce a new high. This multiple-failure structure builds a stronger case for trend reversal than two failures. The progressive volume decline on each peak is also a cleaner divergence signal.\n\n**Trading the triple**: Some traders enter partial positions after the second peak fails, adding to the position on the third peak failure, with the full target being the triple-pattern measured move.",
          highlight: ["triple top", "triple bottom", "87%", "reliability"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Stock PQR tested $72 resistance three times: at $71.80, $72.10, and $71.95. Volume on the three peaks was 3.2M, 2.1M, and 0.9M shares respectively. The lows between the peaks were both at $62. Today, price closes at $61.50, below the trough support at $62.",
          question: "How should a technical analyst interpret this breakdown?",
          options: [
            "Triple top confirmed -- the three-peak resistance with progressively declining volume and the trough breakdown is a high-conviction bearish reversal. Measured target is $52 ($72 - $62 = $10 subtracted from $62).",
            "Not a valid pattern -- the peaks vary by $0.30 which is too much deviation",
            "Bullish -- three tests of resistance shows strong buying interest that will eventually break through",
            "Neutral -- need to wait for 50-day SMA to confirm",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook triple top with all confirming characteristics: three peaks within 0.5% of each other ($71.80, $72.10, $71.95), progressive volume decline (3.2M, 2.1M, 0.9M -- demonstrating seller exhaustion of the bulls with each attempt), and a trough breakdown below $62. The measured target: ($72 - $62 = $10) subtracted from $62 = $52. With an 87% historical target-completion rate, this is a high-conviction trade.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Pattern Failure Rates and Risk Management",
          content:
            "Understanding failure rates is as important as knowing success rates. Even the best patterns fail 13-26% of the time.\n\n**Common failure scenarios**:\n1. **Neckline failure retest with recapture**: Price breaks the neckline of an H&S, retests it from below, and then breaks back above. The pattern has failed -- the original trend has resumed. Stop loss triggered.\n2. **Low-volume breakdown**: A Double Top breakdown on below-average volume often reverses within 5-7 sessions. This is the most common failure mode.\n3. **Bear trap in a Double Bottom**: Price breaks below the second low briefly, stopping out bulls, then rapidly reverses upward. The false break is actually a stronger signal for the reversal.\n\n**Managing pattern trades**:\n- Place stop loss 1-2% above the pattern's failure point (above the neckline for H&S shorts, above the second top for double top shorts)\n- Reduce position size when trading during high-market-volatility periods (VIX > 25) -- pattern failure rates increase\n- Set initial profit target at the measured move; trail stop if momentum continues beyond the target\n\n**The failure as a signal**: When a well-qualified pattern fails, the resulting move in the opposite direction is often sharp and substantial. If a Head and Shoulders fails and price recaptures the neckline on strong volume, the move higher can be significant as all the short sellers are forced to cover simultaneously.\n\n**Position sizing rule**: Limit any single chart pattern trade to a maximum of 2-3% account risk (distance to stop x shares). Even a 74% win-rate pattern will generate losing streaks of 3-5 trades, and position sizing prevents any single failure from being catastrophic.",
          highlight: ["failure rate", "stop loss", "position sizing"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader shorts a stock after a Double Top breakdown at $50, placing a stop at $52 (above the pattern). The stock immediately reverses, closes at $52.50 on massive volume (5x average), and the original double top highs of $55 are exceeded within three days. What signal has been generated?",
          options: [
            "A pattern failure -- the Double Top has been invalidated and the rapid breakout above prior highs on massive volume is a bullish momentum signal",
            "A standard retest of the neckline -- wait for price to re-break $50 before covering the short",
            "Confirmation of the Double Top -- the price spike is a dead-cat bounce",
            "The pattern is still valid -- continue holding the short until the $40 measured target is reached",
          ],
          correctIndex: 0,
          explanation:
            "Once price recaptures and exceeds the double top highs ($55) on extreme volume (5x average), the pattern has definitively failed. The stop at $52 should have been triggered when the pattern failed. The real signal now is a bullish breakout above prior resistance -- a former pattern failure often generates aggressive follow-through as short sellers cover and breakout buyers enter simultaneously. The trader must exit the short (at or before the stop) and reassess with fresh eyes.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Candlestick Patterns (chart-patterns-3)
       ================================================================ */
    {
      id: "chart-patterns-3",
      title: "Candlestick Patterns",
      description:
        "8 key patterns with statistics, combining with support/resistance levels",
      icon: "CandlestickChart",
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "Reading Candlestick Anatomy",
          content:
            "Every candlestick encodes four data points -- open, high, low, and close -- into a visual format that reveals the battle between buyers and sellers within a single session.\n\n**Candlestick anatomy**:\n- **Body**: The rectangle between open and close. Filled (red/black) = close below open (bearish session); Hollow (green/white) = close above open (bullish session).\n- **Upper shadow (wick)**: Extends from the top of the body to the session high. A long upper shadow means sellers rejected higher prices during the session.\n- **Lower shadow (tail)**: Extends from the bottom of the body to the session low. A long lower tail means buyers rejected lower prices during the session.\n\n**Shadow-to-body ratios** are the key to interpretation:\n- **No shadows**: Directional conviction. A full green body with no shadows (Marubozu) means buyers dominated every tick from open to close.\n- **Long shadow, small body**: Indecision or rejection. The market tested an extreme price but closed back near the open.\n- **Long lower tail, small body near the top**: Buyers overcame sellers -- bullish rejection candle\n- **Long upper wick, small body near the bottom**: Sellers overcame buyers -- bearish rejection candle\n\n**Location matters more than the pattern itself**: A hammer candlestick at a key support level after a downtrend has 3-5x the statistical significance of the same candle in the middle of a range or in an uptrend. Context is paramount in candlestick analysis.\n\n**Japanese origins**: Candlestick charting was developed in Japan in the 18th century by rice trader Munehisa Homma. Steve Nison introduced the methodology to Western traders in 1991.",
          visual: "candlestick",
          highlight: ["body", "shadow", "rejection", "context"],
        },
        {
          type: "teach",
          title: "8 Key Candlestick Patterns with Statistics",
          content:
            "The following eight patterns have documented statistical follow-through rates when they appear at significant technical levels.\n\n**Bullish Patterns**:\n\n1. **Hammer**: Small body at the top of the range, lower tail at least 2x the body length, little or no upper shadow. After a downtrend at support: 60-65% bullish follow-through within 3 days (Bulkowski, 700+ patterns). The name comes from 'hammering out a bottom.'\n\n2. **Bullish Engulfing**: A bearish day followed by a bullish day whose body completely engulfs the prior body (opens below prior close, closes above prior open). At support after downtrend: 63% bullish follow-through. Volume expansion on the engulfing day elevates reliability to 70%+.\n\n3. **Morning Star (3-bar)**: Tall bearish bar, small indecision bar (gap down), tall bullish bar closing above the midpoint of bar 1. 68% bullish follow-through when at major support levels.\n\n4. **Bullish Harami**: Small bullish body contained within the prior large bearish body. More conservative reversal signal: 55% bullish follow-through. Best used as a first warning rather than a primary entry trigger.\n\n**Bearish Patterns**:\n\n5. **Shooting Star**: Small body at the bottom of the range, upper tail at least 2x the body length, little or no lower shadow. After an uptrend at resistance: 59-63% bearish follow-through.\n\n6. **Bearish Engulfing**: Bullish day followed by bearish day whose body engulfs the prior. At resistance after uptrend: 62% bearish follow-through. Volume confirmation raises reliability to 68%+.\n\n7. **Evening Star (3-bar)**: Mirror image of Morning Star. 67% bearish follow-through at major resistance.\n\n8. **Doji**: Open and close are nearly equal (body is a line), creating a + or T shape. Represents pure indecision. At trend extremes: 54% reversal rate. The Doji is weakest of the eight patterns -- must be combined with other signals to be tradeable.",
          highlight: ["hammer", "engulfing", "morning star", "evening star"],
        },
        {
          type: "quiz-mc",
          question:
            "A Hammer candlestick appears after a 3-week downtrend, exactly at the 200-day SMA support level, on volume 2.5x the 20-day average. How does this compare to a Hammer appearing in the middle of a sideways range on average volume?",
          options: [
            "The Hammer at the 200-day SMA on high volume is significantly more reliable -- location at a key support and volume confirmation elevate it from a 60-65% pattern to potentially 70-75%",
            "Both Hammers are equally reliable -- candlestick statistics apply regardless of location",
            "The range Hammer is more reliable -- less risk from prior trend pressure",
            "Neither is reliable -- Hammer patterns only work at 52-week lows",
          ],
          correctIndex: 0,
          explanation:
            "A Hammer at a major technical level (200-day SMA) in a clear trend context (downtrend = sellers exhausted after 3 weeks of pressure) with above-average volume is a significantly higher-quality signal than the same candlestick in a neutral context. The 200-day SMA brings institutional buyers who watch that level; the high volume confirms they stepped in. Context and confluence transform a 60-65% standalone pattern into a 70-75%+ probability setup.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Combining Candlestick Patterns with Support and Resistance",
          content:
            "The most profitable candlestick trading strategy is to trade patterns only at pre-identified, significant support or resistance levels. This approach combines price structure (S/R) with session-level psychology (candlestick pattern) for a two-layer confluence.\n\n**Framework for candlestick + S/R trades**:\n\n**Step 1 -- Identify the level first**: Mark significant horizontal support/resistance, MA levels, prior swing highs/lows, or Fibonacci retracement levels before looking at candlesticks.\n\n**Step 2 -- Wait for the test**: Let price move to the level. Do not anticipate -- wait for actual contact.\n\n**Step 3 -- Require a qualifying candlestick**: Look for a reversal candlestick (Hammer/Morning Star at support; Shooting Star/Evening Star at resistance). A qualifying pattern must close in the expected direction with at least a 3:2 body-to-shadow ratio showing rejection.\n\n**Step 4 -- Volume confirmation**: The reversal candlestick should have above-average volume (at least 120% of the 20-day average).\n\n**Step 5 -- Entry and stop**: Enter on the next bar's open (or at a limit near the candlestick's close). Stop loss goes below the candlestick's low (for bullish reversal) or above its high (for bearish). This gives a defined risk.\n\n**Example of what to avoid**: Taking a Doji signal in the middle of a range with no identifiable level, no volume expansion, and no trend context. The same candle that is a mediocre 54% signal in isolation becomes a sub-50% noise event in the wrong context.\n\n**Backtesting note**: When researchers test candlestick patterns in isolation (without location context), the majority of patterns show only marginally better than random performance (52-55% accuracy). When filtered to patterns at major S/R levels, accuracy increases to 62-72%.",
          highlight: ["support", "resistance", "confluence", "confirmation"],
        },
        {
          type: "quiz-tf",
          statement:
            "Research shows that candlestick patterns tested in isolation, without filtering for location at key support or resistance levels, typically show accuracy rates that are only marginally better than random (52-55%).",
          correct: true,
          explanation:
            "Multiple academic and practitioner studies confirm that candlestick patterns applied randomly across all price locations show only marginal edge (52-55% accuracy). The real edge comes from filtering for patterns at significant technical levels where there is an independent structural reason for price to reverse. The candlestick then serves as the timing trigger within a structurally advantaged location.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "At the daily close, a stock has formed a Bearish Engulfing candlestick. The pattern appears after a 12% rally over 10 days. The second (bearish) bar's close is at $78.50, exactly at the prior swing high from three months ago ($78.60) and the upper Bollinger Band ($78.40). Volume on the engulfing bar is 3.1x the 20-day average.",
          question: "How many layers of confluence does this setup contain, and what trade does it support?",
          options: [
            "Three layers of confluence (pattern + prior resistance + Bollinger upper band) on extreme volume -- supports a short entry with stop above $80",
            "No confluence -- each indicator must be analyzed separately",
            "Bullish -- Engulfing candles only work in downtrends",
            "Insufficient data -- need to see the open of the next session first",
          ],
          correctIndex: 0,
          explanation:
            "This setup has three independent layers of confluence: (1) Bearish Engulfing candlestick after a 12% rally -- pattern timing and context, (2) prior swing high resistance at $78.60 -- price memory from institutional sellers three months ago, (3) Bollinger Band upper boundary at $78.40 -- statistical overextension. With 3.1x volume confirming aggressive selling, this is a high-probability short setup. Entry at or near the close of the engulfing bar, stop above $80 (above all three resistance levels), target the 20-period SMA for initial profit.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "According to documented statistics, which of the following bullish candlestick patterns has the highest follow-through rate when it appears at major support after a downtrend?",
          options: [
            "Morning Star (3-bar pattern) at approximately 68% bullish follow-through",
            "Doji at approximately 54% bullish follow-through",
            "Bullish Harami at approximately 55% bullish follow-through",
            "All patterns have identical statistics regardless of their structure",
          ],
          correctIndex: 0,
          explanation:
            "The Morning Star is a 3-bar pattern (large bearish bar, small indecision/gap bar, large bullish bar closing above the midpoint of bar 1) and carries more information than single or dual-bar patterns. Its multi-session construction requires sustained buyer commitment, which is reflected in the higher statistical accuracy (approximately 68% at major support). The Doji (54%) and Harami (55%) are weaker standalone signals precisely because they capture less information in their single-bar or dual-bar structure.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Harmonic Patterns (chart-patterns-4)
       ================================================================ */
    {
      id: "chart-patterns-4",
      title: "Harmonic Patterns",
      description:
        "Gartley, Bat, Crab -- Fibonacci ratios, PRZ zones, scanning for setups",
      icon: "Hexagon",
      xpReward: 125,
      steps: [
        {
          type: "teach",
          title: "Introduction to Harmonic Patterns and Fibonacci Ratios",
          content:
            "**Harmonic patterns** are geometric price structures defined by precise Fibonacci retracement and extension ratios between swing points. The theory, pioneered by Harold Gartley (1935) and extended by Scott Carney in the 1990s-2000s, holds that markets move in regular, proportional waves that repeat based on the mathematical relationships found in the Fibonacci sequence.\n\n**Core Fibonacci ratios used in harmonics**:\n- 0.382 (38.2% retracement)\n- 0.500 (50% retracement)\n- 0.618 (61.8% -- the 'golden ratio')\n- 0.786 (square root of 0.618)\n- 0.886 (fourth root of 0.618) -- used by Carney\n- 1.272 (square root of 1.618)\n- 1.618 (the golden ratio extension)\n- 2.618 (1.618 squared)\n\n**The five swing points**: Every harmonic pattern uses five labeled points: X, A, B, C, D.\n- X: The pattern origin (major swing high or low)\n- A: The first reversal\n- B: The second reversal (retracement of XA)\n- C: The third reversal (retracement of AB)\n- D: The Potential Reversal Zone (PRZ) -- where the trade is taken\n\n**The Potential Reversal Zone (PRZ)**: The D point is where multiple Fibonacci measurements from different legs (XA, AB, BC) converge within a small price zone. This convergence of independent Fibonacci measurements is the foundation of harmonic theory -- no single ratio defines the D point; the trade is taken when 2-3 ratios cluster within a defined price range.\n\n**Important caveat**: Harmonic patterns are subjective. Multiple traders analyzing the same chart may identify different valid patterns based on which swing points they select. Strict adherence to published ratio tolerances (typically within ±5% of the ideal ratio) is essential to avoid cherry-picking.",
          highlight: ["harmonic", "Fibonacci", "PRZ", "X-A-B-C-D"],
        },
        {
          type: "quiz-mc",
          question:
            "In harmonic pattern analysis, what is the Potential Reversal Zone (PRZ)?",
          options: [
            "A price zone where multiple Fibonacci measurements from different pattern legs converge, indicating a high-probability reversal area",
            "The exact price at which a trade must be entered to be valid",
            "The area between the 200-day and 50-day SMAs where reversals commonly occur",
            "A fixed percentage range (e.g., 1%) around any Fibonacci retracement level",
          ],
          correctIndex: 0,
          explanation:
            "The PRZ is defined by the convergence of independent Fibonacci measurements calculated from different legs of the pattern. For example, in a Gartley, the D point is defined by the 0.786 retracement of XA AND the BC projection landing near the same price. When two or three independent measurements point to the same price zone, that cluster is called the PRZ and is where the trade is taken. A single Fibonacci level alone does not constitute a PRZ.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Gartley Pattern",
          content:
            "The **Gartley** is the oldest and most conservative harmonic pattern. Harold Gartley described it in his 1935 book 'Profits in the Stock Market' as one of the best trading opportunities he had observed.\n\n**Bullish Gartley Ratios**:\n- AB retraces 61.8% of XA (the first pullback should be exactly 61.8% of the initial move)\n- BC retraces 38.2% to 88.6% of AB (the bounce off B should retrace part of AB)\n- CD extends 127.2% to 161.8% of BC (or alternatively, CD = 78.6% of XA)\n- The D point falls at the 78.6% retracement of XA -- this is the defining ratio\n\n**The 78.6% retracement** is the signature of the Gartley. Carney chose 78.6% (square root of 0.618) because it represents a deep retracement that still holds within the prior trend structure. A stock that retraces 78.6% of a prior move and reverses is showing that the long-term trend still has control.\n\n**Trade execution at D**:\n- Enter a long position (for bullish Gartley) at or near the D point (PRZ)\n- Stop loss: 1-2% below D (a move below D invalidates the pattern -- the XA leg has been fully retraced)\n- Initial target T1: 38.2-50% retracement of AD\n- Final target T2: C point level (the prior swing high within the pattern)\n\n**Historical performance**: Carney's research (200+ patterns) found that Gartley patterns with all ratios within ±5% of ideal reached T1 approximately 72% of the time and T2 approximately 54% of the time. Patterns with ratios outside ±5% performed at only 44-48%.\n\n**Bearish Gartley**: The same ratio structure but inverted -- D is a 78.6% retracement from a swing low, and the trade is a short entry at D.",
          highlight: ["Gartley", "78.6%", "AB retracement", "D point"],
        },
        {
          type: "quiz-tf",
          statement:
            "In a valid Gartley pattern, the AB leg must retrace exactly 61.8% of the XA leg with zero tolerance for deviation.",
          correct: false,
          explanation:
            "Harmonic pattern ratios allow a tolerance of approximately ±5% of the ideal ratio. For the Gartley's AB retracement of 61.8%, this means a valid range of approximately 58.8% to 64.8%. Requiring exact ratios with zero tolerance would make the pattern extremely rare and effectively untradeable. However, the tolerance should be applied consistently and not stretched arbitrarily to make any pattern 'fit.'",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Bat and Crab Patterns",
          content:
            "**The Bat Pattern** (developed by Scott Carney, 2001):\n- Characterized by a shallower B point retracement (38.2% to 50% of XA, versus Gartley's 61.8%)\n- AB retraces 38.2-50% of XA\n- BC retraces 38.2-88.6% of AB\n- CD extends 161.8-261.8% of BC\n- The defining D point: **88.6% retracement of XA** (deeper than the Gartley's 78.6%)\n\n**Bat vs Gartley**: The Bat's deeper 88.6% D point means price has retraced further than the Gartley -- a deeper test that gives a tighter stop (only 1-2% below D) with a larger potential reward because the reversal point is closer to the X origin. Carney considers the Bat to have better risk/reward than the Gartley due to the precise 88.6% ratio.\n\n**The Crab Pattern** (developed by Scott Carney, 2000):\n- The most extreme harmonic pattern in terms of extension\n- AB retraces 38.2-61.8% of XA\n- BC retraces 38.2-88.6% of AB\n- CD extends 224-361.8% of BC\n- The defining D point: **161.8% extension of XA** (the D point exceeds the X origin -- it extends beyond the starting point of the pattern)\n\n**Crab pattern significance**: The 1.618 extension of XA places D at an extreme exhaustion point. This is the most mathematically derived of all harmonic patterns and has produced some of the most precise major market turning points. Carney's research on 50+ Crab patterns showed 78% accuracy when all ratios were within tolerance.\n\n**Pattern comparison**:\n- Gartley D: 78.6% retracement of XA (conservative, common)\n- Bat D: 88.6% retracement of XA (moderate depth, tight stop)\n- Crab D: 161.8% extension of XA (extreme, rare, high precision)",
          highlight: ["Bat", "Crab", "88.6%", "161.8%"],
        },
        {
          type: "teach",
          title: "Scanning for Harmonic Setups and PRZ Trading",
          content:
            "Finding and trading harmonic patterns requires a systematic approach.\n\n**Manual scanning process**:\n1. Identify a significant swing point (X) -- a major high or low on the chart\n2. Measure the XA leg (size of the initial move)\n3. Calculate the Fibonacci retracements and projections for each expected swing point\n4. Check if the current B and C points are within ±5% of their ideal ratios\n5. Project the D point (PRZ) based on the pattern type -- place limit orders in advance\n\n**PRZ trading rules**:\n1. Calculate all converging Fibonacci measurements and identify the cluster zone\n2. Place a limit order in the center of the PRZ (do not chase price to the exact level)\n3. Set stop loss just beyond the PRZ (1-2% beyond -- a violation of the full PRZ invalidates the pattern)\n4. Target 1: the C level. Target 2: the A level. Target 3 (if momentum continues): the B level\n\n**Pattern invalidation**: A close beyond the X origin (for bullish Crab) or a close that violates the hard stop invalidates the pattern. Once invalidated, there is no pattern to trade -- take the loss at the stop, do not average down.\n\n**The 'shark' and 'cypher' patterns** (Carney additions, post-2010):\n- Shark: Uses a 113% extension of XC, completing a unique 5-0 pattern type\n- Cypher: B retraces 38.2-61.8% of XA; C extends 127.2-141.4% of XA; D is 78.6% of XC\n\n**Risk management for harmonics**: Because harmonics rely on price reaching precise levels, position sizing should account for the fact that approximately 22-28% of patterns fail at the PRZ. A failed PRZ stop triggers quickly (1-2% loss), while successful trades often yield 5-10% or more to Target 1. This asymmetric profile (small, defined loss vs larger gain) is why harmonics attract risk-management-focused traders.",
          highlight: ["PRZ", "limit order", "scanning", "pattern invalidation"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A trader identifies a potential bullish Bat pattern. X = $100, A = $75 (25-point XA decline). B = $84.50 (38% retracement of XA -- valid for Bat). C = $78 (BC = 66.7% retracement of AB -- within Bat range). The trader calculates D: 88.6% retracement of XA = $100 - (0.886 x $25) = $77.85. Current price is approaching $78.",
          question: "How should the trader execute this setup?",
          options: [
            "Place a limit buy order at $77.85 (the 88.6% PRZ), with a stop at $76.50 (below the full XA retracement at $75), targeting $84.50 (C level) for T1",
            "Buy immediately at the current market price of $78 to ensure execution",
            "Wait for price to break below the $77.85 level and then buy on the reversal",
            "The Bat requires D to be at 78.6%, so this pattern is invalid",
          ],
          correctIndex: 0,
          explanation:
            "The correct PRZ execution for a bullish Bat: place a limit order at the D point (88.6% retracement = $77.85). The stop goes just below the X origin (A point was $75; the hard stop is typically 1-2% below D, so around $76.50, which is also below the near-X level). T1 target is the C level ($78) -- wait, C is at $78 which is above D, so T1 would be the C bounce level already passed. In this case, T1 = the 38.2-50% retracement of the AD move, T2 = the C level ($78), and T3 = the A level ($75 -- note this is actually the pattern origin, so T3 would be the level between C and A). The PRZ limit entry approach is preferred over market orders to get the best entry price.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "Which harmonic pattern has the D point at a 161.8% extension of the XA leg, meaning price moves beyond the starting point of the pattern?",
          options: [
            "The Crab pattern -- the most extreme harmonic, with D at 1.618 x XA extension",
            "The Bat pattern -- characterized by the 88.6% D retracement",
            "The Gartley pattern -- uses the 78.6% D retracement",
            "The Butterfly pattern -- D is at 127.2% of XA",
          ],
          correctIndex: 0,
          explanation:
            "The Crab pattern is defined by its D point at the 161.8% (1.618) extension of the XA leg. This means price moves 61.8% beyond the X origin in the CD leg, making the Crab the most extreme of the major harmonics. The Butterfly (127.2%), Bat (88.6% retracement), and Gartley (78.6% retracement) all have D points that do not extend as far as the Crab's. The Crab's extreme D point creates a tight, well-defined stop and is often associated with major market turning points.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Support & Resistance Mastery (chart-patterns-5)
       ================================================================ */
    {
      id: "chart-patterns-5",
      title: "Support and Resistance Mastery",
      description:
        "Confluence zones, retests, role reversal, and psychological levels",
      icon: "Layers",
      xpReward: 125,
      steps: [
        {
          type: "teach",
          title: "The Foundation of Support and Resistance",
          content:
            "**Support** is a price level where buying interest is strong enough to prevent further decline. **Resistance** is a level where selling pressure is strong enough to prevent further advance. These levels exist because of collective market memory -- traders remember where price previously reversed and anticipate similar reactions.\n\n**Why price memory exists**:\n1. **Anchoring bias**: Traders who bought at $50 in January remember that price. When it returns to $50, they buy again (defending their cost basis) or sell to break even.\n2. **Institutional orders**: Large funds place limit orders at round numbers and prior significant levels. These orders aggregate into substantial support/resistance.\n3. **Self-fulfilling prophecy**: Widely watched levels attract more orders, making the reaction more reliable, which attracts more attention, completing the cycle.\n\n**What creates significant levels**:\n- Prior swing highs and swing lows (the most important)\n- Round numbers: $100, $50, $25, $10 -- psychologically anchored prices\n- 52-week highs/lows -- portfolio benchmarking anchors\n- Moving averages (dynamic S/R)\n- Fibonacci retracements of major moves\n- Prior gap levels (price tends to fill gaps)\n- VWAP and anchored VWAP levels\n\n**Strength assessment**: Not all support/resistance levels are equal. A level is stronger when:\n- It has been tested multiple times (more tests = more participants defending it)\n- Prior reactions at the level were sharp and decisive (institutional orders)\n- It aligns with multiple independent technical factors (confluence)\n- It is a major round number or widely-published level",
          visual: "candlestick",
          highlight: ["support", "resistance", "price memory", "round numbers"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock has tested the $150 level four times over 18 months and bounced each time. The fifth test is occurring now. Which statement best describes the significance of this level?",
          options: [
            "The $150 level has been validated by four separate tests -- it is a strong support with institutional memory, though four tests may also be weakening it (the more it is tested, the more likely it eventually breaks)",
            "Four tests prove the support is permanently unbreakable",
            "The fourth test invalidates the level -- support can only be tested three times",
            "The level is irrelevant because stocks do not trade at round numbers",
          ],
          correctIndex: 0,
          explanation:
            "Multiple tests of a support level create institutional memory and validation, but they also consume the available buying power at that level. The first test typically has the most fresh buyers; by the fourth test, many of the original buyers have already established positions. A well-watched level like this one is both stronger (more participants aware of it) and potentially more fragile (available demand decreasing with each test). Professional technicians treat highly-tested levels as high-conviction but also watch for signs that demand is thinning (declining volume at each successive test).",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Confluence Zones: Where Multiple Levels Overlap",
          content:
            "A **confluence zone** is a price area where multiple independent types of support or resistance overlap within a small price band (typically 0.5-2% of price). Confluence dramatically increases the probability that price will react at that zone.\n\n**Building a confluence zone**:\n1. Mark the prior swing high/low (structural S/R)\n2. Mark the relevant moving averages (dynamic S/R)\n3. Calculate Fibonacci retracements of the most recent significant move\n4. Mark round number psychological levels nearby\n5. If using VWAP, mark the anchored VWAP from a key event\n\n**Confluence in practice**: Suppose you are looking for support in a pullback. You identify:\n- Prior swing low at $92.40\n- 200-day SMA at $91.80\n- 61.8% Fibonacci retracement of the last major rally at $92.20\n- Round number psychological level at $92.00\n\nAll four factors cluster between $91.80 and $92.40 -- a $0.60 (0.65%) zone. This is a high-confluence support zone. The probability of a reaction here is substantially higher than at any single factor alone.\n\n**Zone width**: Tight confluence (all factors within 0.5% of each other) is stronger than wide confluence (factors spread over 3%). Traders who strictly require tight confluence take fewer trades but see higher win rates.\n\n**Using confluence for position sizing**: When a confluence zone is particularly tight and well-defined, traders may use larger position sizes (within their risk tolerance) because the level's precision allows a tighter stop (just beyond the zone boundary), creating a more favorable risk/reward.\n\n**Three-factor minimum rule**: Experienced technicians typically require at least three independent factors to define a high-conviction confluence zone. Two-factor confluence is noted but not sufficient for full position sizing.",
          highlight: ["confluence zone", "multiple factors", "tight cluster"],
        },
        {
          type: "quiz-tf",
          statement:
            "A confluence zone where four independent technical factors (prior swing low, 200-day SMA, 61.8% Fibonacci retracement, and a round number) all cluster within 1% of each other is generally considered higher probability than any single factor alone.",
          correct: true,
          explanation:
            "Independent technical factors, when they cluster, represent the overlapping of multiple independent technical communities (Fibonacci traders, MA traders, fundamental investors anchored to round numbers, swing traders) all placing orders at approximately the same price. This aggregation of demand from unrelated strategies is what gives confluence zones their elevated probability. The narrower the cluster, the stronger the zone.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Role Reversal: Support Becomes Resistance",
          content:
            "One of the most reliably profitable technical phenomena is **role reversal** (also called polarity change): when price breaks decisively through a support level, that former support becomes resistance (and vice versa).\n\n**The mechanism behind role reversal**:\n1. Price holds at support at $50 multiple times; buyers accumulate at this level\n2. Price breaks below $50 on high volume -- the support fails\n3. Buyers who bought at $50 are now underwater. Their break-even exit price is $50.\n4. When price rallies back toward $50, these trapped buyers sell to break even (adding supply)\n5. Additionally, new short sellers who shorted the breakdown also defend the $50 level as resistance\n6. The combination of trapped longs selling and shorts defending creates resistance at the former support\n\n**Role reversal quality assessment**:\n- Stronger role reversal: The original level was tested multiple times (more trapped buyers/sellers)\n- Cleaner break: The break through the level was decisive (high volume, full candle body close beyond)\n- Time distance: A retest 2-8 weeks after the break is most reliable; retests after 6+ months lose some of their role-reversal validity as market memory fades\n\n**The retest trade**: Professional traders often wait for a retest of the broken level (from the other side) rather than entering on the initial break. The retest confirms the role reversal and provides a low-risk entry:\n- Break below $50 support: Do not short immediately. Wait for price to rally back toward $50, fail to close above it, and then short on the failed retest with a stop just above $50.\n- Break above $80 resistance: Wait for price to pull back to $80, hold above it, and go long with a stop just below $80.\n\n**Retest probability**: Approximately 45-55% of significant breakdowns include a retest of the broken support level within 4-6 weeks.",
          highlight: ["role reversal", "polarity change", "retest", "trapped buyers"],
        },
        {
          type: "teach",
          title: "Psychological Levels and Their Market Impact",
          content:
            "**Psychological levels** are prices that attract disproportionate market attention due to human cognitive anchoring: round numbers (10, 50, 100, 500, 1000, 10000 for indices), significant milestones (52-week high, all-time high), and widely-reported analyst price targets.\n\n**Round number effect (academic research)**:\n- A study of S&P 500 option strikes (Donaldson and Kim, 1993) found that price clustering around round numbers is 3x more frequent than would occur randomly\n- An analysis of NYSE daily closes (Colwell, 2001) found that the closing price landed within $0.05 of a round dollar amount 34% more frequently than expected by chance\n- Round numbers serve as natural stop-loss and limit-order placement points for retail traders, creating concentrated order flow\n\n**First test of an all-time high**: When a stock or index approaches its all-time high for the first time after a major decline:\n- Many long-term holders who bought near the prior high finally reach break-even -- they sell\n- Short sellers who have been waiting for the 'ultimate resistance' add to shorts\n- The first test of a prior ATH is resisted by approximately 65% of the time (Minervini research)\n- However, when price does break through an ATH on high volume, there is no overhead supply -- all prior buyers are profitable and have no reason to sell. This is why ATH breakouts can be among the most powerful trending moves.\n\n**Analyst price targets as S/R**: When a widely followed analyst raises or lowers a price target, this creates a temporary institutional focus on that level. Price targets of $50, $75, $100 influence order placement because portfolio managers track their holdings relative to consensus price targets.\n\n**Key insight**: Psychological levels are strongest when they coincide with structural technical levels. A prior swing high that is also a round number ($50, $100) is more powerful than a swing high at $47.83.",
          highlight: ["psychological level", "round number", "all-time high", "ATH"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Stock MNO had major support at $100 for 14 months (four separate bounces). In February, it broke below $100 on the highest volume of the prior year (5x average). Over the next three weeks, it declined to $85. Now, in March, price has rallied from $85 back to $99.20. Today's candlestick is a Shooting Star touching $100.10 before closing at $98.50. Volume is 2.8x average.",
          question: "What technical situation is occurring and what action does it suggest?",
          options: [
            "Role reversal confirmed -- the former $100 support is now acting as resistance. The Shooting Star touching $100 and closing below on heavy volume confirms the failed retest. Supports a short entry near $98.50 with a stop above $101.",
            "The stock is returning to support -- buy the $100 level as it has been support for 14 months",
            "The Shooting Star is irrelevant at former support levels",
            "Wait for price to close above $100 before taking any action",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook role reversal setup. The $100 level served as support for 14 months, meaning significant institutional buying occurred there. The breakdown on 5x average volume was decisive, trapping all those buyers underwater. When price rallied back to $99.20-$100.10, the trapped buyers and new short sellers all treated $100 as resistance. The Shooting Star (touched $100.10 but closed at $98.50 -- bearish rejection) on 2.8x volume confirms that sellers dominated the retest. This is a high-conviction short entry: stop above $101 (clear role-reversal invalidation), target the prior low at $85.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "A stock has been trading below $200 for two years. Today it closes at $201.50, above $200 for the first time in two years, on 4x average volume. What does technical analysis predict about the $200 level going forward?",
          options: [
            "Role reversal -- $200 should now act as support on any pullback, with the prior two-year resistance becoming a floor for future buyers",
            "The breakout is a false move -- $200 will immediately reassert as resistance",
            "The level is no longer relevant after it has been broken",
            "Psychological levels like $200 only apply to indices, not individual stocks",
          ],
          correctIndex: 0,
          explanation:
            "A decisive two-year resistance breakout on 4x average volume is a major role reversal event. The $200 level, which held as resistance for two years, is now expected to serve as support on any subsequent pullbacks -- for several reasons: (1) Buyers who missed the initial breakout will wait for a pullback to $200 to buy, (2) New holders who bought above $200 will defend their cost basis, (3) Institutional memory of the breakout level remains strong. This is why successful ATH breakouts often see the prior high become strong support in subsequent corrections.",
          difficulty: 2,
        },
      ],
    },
  ],
};
