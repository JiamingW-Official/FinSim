import type { Unit } from "./types";

export const UNIT_TECHNICAL_ANALYSIS_MASTERY: Unit = {
  id: "technical-analysis-mastery",
  title: "Technical Analysis Mastery",
  description:
    "Advanced price action, volume analysis, trend systems, reversal patterns, and building a complete trading system",
  icon: "TrendingUp",
  color: "#10b981",
  lessons: [
    // ─── Lesson 1: Reading Price Action Like a Pro ────────────────────────────
    {
      id: "tam-1",
      title: "Reading Price Action Like a Pro",
      description:
        "Naked chart reading, support/resistance clusters, price memory zones, dynamic vs static levels",
      icon: "BarChart2",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Naked Chart Reading",
          content:
            "**Naked chart reading** means analyzing a price chart without any indicators — just candles, volume, and levels. It is the foundation skill of discretionary trading.\n\nWhat naked charts reveal:\n- **Who is in control**: Bullish candles with large bodies = buyers dominating. Bearish candles with long upper wicks = sellers rejecting highs.\n- **Conviction vs indecision**: Long bodies = conviction. Doji candles = equilibrium between buyers and sellers.\n- **Momentum changes**: When a strong trend produces progressively smaller candles, momentum is fading before price reverses.\n\nExercise: Take any stock chart, remove all indicators, and spend 5 minutes describing what you see purely in terms of who is winning (buyers or sellers) at each price level. This skill — reading the battle — is more durable than any indicator formula.",
          highlight: ["naked chart", "price action", "candle body", "momentum", "conviction"],
        },
        {
          type: "teach",
          title: "Support/Resistance Clusters and Price Memory",
          content:
            "Not all support and resistance levels are equal. **Clusters** — areas where multiple historical levels align — are far more significant than isolated single touches.\n\n**Price memory zones** form where:\n- A previous major high or low was set\n- Price consolidated for multiple sessions\n- A significant gap opened (gap edges act as S/R)\n- Round numbers ($100, $250, $1,000) — psychological anchors for large orders\n\nHow to identify clusters:\n1. Mark all significant highs and lows on a longer timeframe (daily or weekly)\n2. Look for price areas that have been tested 3+ times from both directions\n3. The more times an area has been tested and respected, the stronger the memory\n\n**Role reversal**: When a support level breaks, it often becomes resistance — and vice versa. This is one of the most reliable patterns in technical analysis.",
          highlight: ["support", "resistance", "cluster", "price memory", "role reversal", "round numbers"],
        },
        {
          type: "teach",
          title: "Dynamic vs Static Levels",
          content:
            "**Static levels** are fixed price points: previous highs/lows, round numbers, gap fills.\n\n**Dynamic levels** move with price over time:\n- **Moving averages** (50-day, 200-day): Act as floating support/resistance. Price tends to bounce or break at these levels.\n- **Trend lines**: Connect a series of higher lows (uptrend) or lower highs (downtrend). The slope itself is information — steeper trends are more volatile and less sustainable.\n- **VWAP** (Volume Weighted Average Price): Institutional benchmark; acts as an intraday magnet.\n\n**Combining both types**:\nThe most powerful setups occur when a dynamic level (e.g., 50-day MA) aligns with a static level (previous support zone). Confluence of two independent methods at the same price increases the probability that price will react there.\n\nRule of thumb: The more reasons price has to react at a level, the more significant that level is.",
          highlight: ["dynamic levels", "static levels", "moving average", "trend line", "VWAP", "confluence"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock previously consolidated between $48 and $52 for three weeks, then broke above $52. After rising to $65, it pulls back. Where is the highest-probability support zone?",
          options: [
            "$48–$52 — the prior consolidation zone is a strong price memory area",
            "$65 — the recent high acts as support",
            "$56 — the halfway point of the move",
            "There is no reliable support — the stock could fall anywhere",
          ],
          correctIndex: 0,
          explanation:
            "The $48–$52 consolidation zone represents a price memory area where significant volume traded and supply/demand were balanced. This creates a strong support cluster on any pullback. The $65 high is resistance, not support. Price memory zones from prior consolidation are among the most reliable levels in technical analysis.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "When a significant support level breaks, it typically becomes resistance on the next rally attempt.",
          correct: true,
          explanation:
            "This is role reversal — one of the most consistent patterns in markets. When support breaks, traders who bought there are now trapped in losing positions. When price rallies back to that level, many of them sell to break even, creating selling pressure that turns the old support into resistance.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are analyzing a chart with no indicators. A stock has been in an uptrend making higher highs. The last five candles show progressively smaller bodies and increasing wicks on both sides. There is no volume expansion.",
          question: "What does the naked price action tell you?",
          options: [
            "Momentum is fading — indecision candles suggest the trend may pause or reverse",
            "The uptrend is accelerating — smaller candles mean lower volatility",
            "Strong buying pressure — smaller candles show consolidation before continuation",
            "Volume is irrelevant — price is still making higher highs",
          ],
          correctIndex: 0,
          explanation:
            "Progressively smaller candle bodies in an uptrend signal fading momentum — buyers are becoming less enthusiastic. Wicks on both sides indicate indecision. Without volume expansion confirming continuation, this pattern warns of a potential stall or reversal. A breakout setup needs expanding candles and volume, not shrinking candles.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Volume Analysis Mastery ───────────────────────────────────
    {
      id: "tam-2",
      title: "Volume Analysis Mastery",
      description:
        "Volume spread analysis, accumulation/distribution, institutional footprint, volume at price",
      icon: "BarChart",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Volume Spread Analysis (VSA)",
          content:
            "**Volume Spread Analysis (VSA)** reads the relationship between volume and price spread (candle body size) to determine the balance of supply and demand.\n\nCore VSA concepts:\n\n**Wide spread + high volume + close near high**: Strong buying demand. Bullish signal.\n**Wide spread + high volume + close near low**: Strong selling supply. Bearish signal.\n**Narrow spread + high volume**: Hidden supply or demand — price cannot move despite heavy activity. Often signals a turning point.\n**Wide spread + low volume on a move up**: Weak rally — no institutional support. Beware.\n\n**No demand bar**: Narrow spread up candle on very low volume. Shows no buying interest — price likely to fall.\n**No supply bar**: Narrow spread down candle on very low volume. Shows no selling pressure — price likely to rise.\n\nVSA was developed by Richard Wyckoff and refined by Tom Williams. It reads what smart money is doing.",
          highlight: ["VSA", "volume spread analysis", "wide spread", "narrow spread", "no demand", "no supply"],
        },
        {
          type: "teach",
          title: "Accumulation, Distribution, and the Institutional Footprint",
          content:
            "Large institutions (hedge funds, mutual funds) cannot buy or sell their entire position at once — they would move the market against themselves. Instead, they **accumulate** over weeks or months.\n\n**Accumulation** (institutions quietly buying):\n- Price moves sideways in a range — not trending\n- Volume is above average but price does not rise much\n- Dips are bought quickly — lower wicks appear on selling days\n- The range gradually tightens near the top\n\n**Distribution** (institutions quietly selling):\n- Price moves sideways near a high\n- Volume spikes but price fails to advance\n- Rallies are sold into — upper wicks appear on buying days\n- Eventually breaks down with high volume\n\n**The institutional footprint**: Large orders leave traces in volume. A single high-volume day at a key level with a reversal close is the footprint of institutional activity. Identifying these zones gives you the same information professionals use.",
          highlight: ["accumulation", "distribution", "institutional", "range", "footprint", "Wyckoff"],
        },
        {
          type: "teach",
          title: "Volume at Price and Volume Profile",
          content:
            "**Volume at Price** (also called Volume Profile) shows how much trading volume occurred at each price level over a period — rather than over time.\n\nKey concepts:\n- **High Volume Nodes (HVN)**: Price levels where enormous volume was traded. These act as strong support/resistance and price tends to consolidate around them.\n- **Low Volume Nodes (LVN)**: Price levels with almost no volume. Price moves through these quickly — they are gaps in the market structure.\n- **Point of Control (POC)**: The single price level with the highest volume. This is the market's 'fair value' for the period.\n- **Value Area**: The range containing approximately 70% of the volume. Price frequently returns to this zone.\n\nPractical use:\n- A breakout through an LVN (thin area) tends to travel fast with little resistance\n- Price approaching an HVN tends to slow down and consolidate\n- The POC is a high-probability intraday pivot target",
          highlight: ["volume profile", "high volume node", "low volume node", "point of control", "value area"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock rallies strongly for three days on expanding volume, then on day 4 shows a wide-spread up candle that closes near its low on the highest volume of the sequence. What does VSA suggest?",
          options: [
            "Bearish — high volume with close near low signals supply overwhelmed demand; potential reversal",
            "Bullish — highest volume confirms the strongest buying day",
            "Neutral — the close near the low is irrelevant if volume is high",
            "Continuation — high volume always confirms the existing trend",
          ],
          correctIndex: 0,
          explanation:
            "Wide spread up + highest volume + close near low is a VSA 'upthrust' or 'selling climax' signal. The high volume means massive activity occurred, but the close near the low shows sellers won the day. Smart money was distributing into the retail buying frenzy. This combination at the top of a rally is a significant reversal warning.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A Low Volume Node (LVN) on a Volume Profile chart is a strong support/resistance zone that price is likely to stall at.",
          correct: false,
          explanation:
            "LVNs are the opposite — they are thin areas with almost no historical volume, meaning price moves through them quickly with little resistance. It is High Volume Nodes (HVNs) that act as strong support/resistance because they represent price levels where large amounts of money changed hands and traders are committed to defending those levels.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A stock has been moving sideways between $80 and $88 for 6 weeks. Volume analysis shows above-average volume on down days that is absorbed quickly, and the lows are rising slightly within the range. Price is approaching the upper boundary at $88.",
          question: "What does this volume pattern indicate?",
          options: [
            "Accumulation — institutions are quietly buying dips, building a position for a breakout",
            "Distribution — selling is overwhelming buying at the high end",
            "Indecision — the range shows neither buyers nor sellers in control",
            "A topping pattern — price has been unable to break $88 for 6 weeks",
          ],
          correctIndex: 0,
          explanation:
            "Rising lows within a range, high volume on dips that is quickly absorbed, and price holding near the upper boundary are classic Wyckoff accumulation signs. Institutions are absorbing supply on weakness. The break above $88 on expanded volume would confirm the accumulation and trigger a new uptrend.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Trend Following Systems ───────────────────────────────────
    {
      id: "tam-3",
      title: "Trend Following Systems",
      description:
        "Trend definition across timeframes, trend strength measurement, trailing stops, when trends end",
      icon: "TrendingUp",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Trend Definition Across Multiple Timeframes",
          content:
            "A **trend** is a series of higher highs and higher lows (uptrend) or lower highs and lower lows (downtrend). This sounds simple but requires precision.\n\n**Multi-timeframe analysis (MTFA)**: The same stock can be in a different trend depending on the timeframe.\n\nExample:\n- Weekly chart: uptrend (macro direction)\n- Daily chart: short-term downtrend (pullback within macro uptrend)\n- 1-hour chart: uptrend (bounce from support)\n\n**Timeframe hierarchy rule**:\n1. Identify the primary trend on a higher timeframe (weekly/daily)\n2. Trade in the direction of the primary trend on a lower timeframe\n3. Use the lowest timeframe only for entry timing — not direction\n\nTrading a counter-trend bounce is risky because you are fighting the primary direction. Trend alignment across at least two timeframes significantly improves win rate.",
          highlight: ["trend", "higher highs", "higher lows", "multi-timeframe", "primary trend", "timeframe hierarchy"],
        },
        {
          type: "teach",
          title: "Measuring Trend Strength",
          content:
            "Not all trends are equal in strength. Entering a weakening trend is as dangerous as counter-trend trading.\n\n**Methods to measure trend strength**:\n\n1. **ADX (Average Directional Index)**: Measures trend strength regardless of direction. ADX > 25 = trending. ADX > 40 = strong trend. ADX < 20 = ranging/no trend.\n\n2. **Candle quality**: In a strong uptrend, most candles close near their highs. When you see increasing closes near the midpoint or low, trend strength is waning.\n\n3. **Swing progression**: In a strong uptrend, each swing high is meaningfully higher than the last. When swing highs start making only marginal new highs, the trend is losing steam.\n\n4. **Moving average slope and separation**: Price well above a rising 20 MA which is above a rising 50 MA = strong trend. Price converging back to the MA = weakening trend.\n\nOnly trade the trend during ADX > 25 conditions with consistent candle quality.",
          highlight: ["trend strength", "ADX", "swing progression", "candle quality", "moving average slope"],
        },
        {
          type: "teach",
          title: "Riding Trends with Trailing Stops and When Trends End",
          content:
            "The hardest part of trend following is **staying in a winning trend** long enough to capture the full move.\n\n**Trailing stop techniques**:\n- **Swing low trailing stop**: Move stop to just below each new higher swing low as the trend progresses\n- **ATR trailing stop**: Stop = current price minus (2 × ATR). Adjusts for volatility automatically.\n- **Moving average trailing stop**: Use 20-day MA as stop in strong trends; 50-day MA for longer-term positions\n\n**When trends end — warning signs**:\n1. Price makes a new high but RSI/momentum indicator does not (bearish divergence)\n2. A significant swing low is broken — the trend structure itself is violated\n3. ADX begins declining from a high reading (trend losing momentum)\n4. Volume spikes on a reversal candle at a new high (smart money distributing)\n5. The trend line connecting lows is broken with a close below it\n\nNo single signal is sufficient — require at least 2–3 for a reliable trend-end signal.",
          highlight: ["trailing stop", "swing low stop", "ATR trailing stop", "trend end", "divergence", "trend line break"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader on a daily chart sees an uptrend. The weekly chart shows a downtrend. What does multi-timeframe analysis suggest?",
          options: [
            "The daily uptrend is a counter-trend bounce — trade cautiously or avoid long positions",
            "The daily trend overrides the weekly — trade the most recent timeframe",
            "Both trends are equally valid — flip a coin for direction",
            "Use the 1-hour chart as the tiebreaker",
          ],
          correctIndex: 0,
          explanation:
            "The weekly trend is the primary direction. A daily uptrend within a weekly downtrend is a counter-trend bounce — it may last days but the larger force is against it. Trend alignment means trading with the weekly direction on daily pullbacks. Counter-trend bounces have lower win rates and require tighter stops.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An ADX reading of 15 indicates a strong trending market where trend-following strategies work well.",
          correct: false,
          explanation:
            "ADX of 15 indicates a ranging, non-trending market. Trend-following strategies underperform in ranging conditions — they generate many false signals. ADX > 25 is the threshold for a trend being present, and ADX > 40 signals a strong trend worth trading. Below 20, consider mean-reversion strategies instead.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A stock has been in a strong uptrend for 4 months. In the last two weeks: swing highs are only marginally higher than previous highs, ADX has dropped from 42 to 28, volume on up days has decreased, and a bearish divergence appeared on RSI. Price is still above all moving averages.",
          question: "What action is most appropriate for a trend follower?",
          options: [
            "Tighten the trailing stop significantly — multiple trend weakness signals warrant caution",
            "Add to the position — it is still above all moving averages",
            "Exit immediately — the trend is clearly over",
            "Ignore the signals — ADX is still above 25 so the trend is intact",
          ],
          correctIndex: 0,
          explanation:
            "Multiple confluence signals of trend weakness (marginal new highs, ADX declining, volume drying up, RSI divergence) warrant tightening the trailing stop aggressively. The trend is not confirmed over — price is above MAs — but the risk of reversal is elevated. Tightening the stop locks in more profit while keeping you in if the trend resumes.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Reversal Patterns and Setups ───────────────────────────────
    {
      id: "tam-4",
      title: "Reversal Patterns and Setups",
      description:
        "Climactic reversals, exhaustion gaps, key reversal bars, double top/bottom confirmation rules",
      icon: "RefreshCw",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Climactic Reversals and Exhaustion",
          content:
            "A **climactic reversal** occurs when a trend ends with a dramatic, high-volume final push that exhausts all remaining buyers or sellers.\n\n**Buying climax** (end of uptrend):\n- Price accelerates sharply upward — largest bars of the entire trend\n- Volume explodes to the highest levels in months\n- Wide-spread up bars that close near their lows (sellers entering)\n- News is extremely positive (maximum bullish sentiment)\n- This is when professionals distribute to the last retail buyers\n\n**Selling climax** (end of downtrend):\n- Panic selling — large red candles, screaming headlines\n- Volume reaches extreme levels\n- Price overshoots significantly below fundamental value\n- Market sentiment is at maximum fear\n- Smart money absorbs all supply — this creates the reversal\n\nBoth climaxes share the same structure: extreme price + extreme volume + close against the trend direction. The bigger and more extreme the climax, the more significant the reversal.",
          highlight: ["climactic reversal", "buying climax", "selling climax", "exhaustion", "volume climax"],
        },
        {
          type: "teach",
          title: "Exhaustion Gaps and Key Reversal Bars",
          content:
            "**Exhaustion gaps** occur when a trend has been running for a while and gaps in the direction of the trend — but then immediately reverses and closes the gap.\n\nDifference from continuation gaps:\n- Continuation gaps occur early in a trend and hold\n- Exhaustion gaps occur late in a trend, often on news, and are quickly filled\n- An exhaustion gap that is closed within 1–3 days is a reversal signal\n\n**Key reversal bars** (also called outside reversal days):\n- A bar that trades below the previous bar's low AND closes above the previous bar's high (bullish)\n- Or trades above the previous bar's high AND closes below the previous bar's low (bearish)\n- The key is the close: price tested in one direction and violently rejected\n- Best when occurring at a major support/resistance level with above-average volume\n\n**Pin bars**: Long wicks with small bodies. The wick shows rejection — buyers or sellers pushed hard but were overwhelmed. Highly effective at key levels.",
          highlight: ["exhaustion gap", "key reversal bar", "outside reversal", "pin bar", "gap fill"],
        },
        {
          type: "teach",
          title: "Double Top/Bottom Confirmation Rules",
          content:
            "**Double top** and **double bottom** are among the most traded reversal patterns — and also among the most frequently failed when traded incorrectly.\n\n**Double Top**:\n1. Price reaches a high, pulls back\n2. Price rallies again to approximately the same high level\n3. Second peak fails to exceed the first (or barely exceeds it then reverses)\n4. **Confirmation**: Price breaks below the neckline (the low between the two peaks) on above-average volume\n\n**Double Bottom** (mirror image):\n1. Two lows at approximately the same level\n2. **Confirmation**: Break above the neckline high between the two lows on volume\n\n**Critical rules**:\n- Do NOT enter on the second peak/trough — the pattern is not confirmed\n- Entry is AFTER the neckline break with a close, not just a touch\n- Volume must expand on the neckline break — low-volume breaks fail frequently\n- Stop goes above the second peak (for double top) or below the second trough (for double bottom)\n- Target = height of the pattern measured from the neckline",
          highlight: ["double top", "double bottom", "neckline", "confirmation", "neckline break", "volume confirmation"],
        },
        {
          type: "quiz-mc",
          question:
            "After a 6-month uptrend, a stock gaps up 8% on blowout earnings, reaching a new all-time high. The same day it closes below the previous day's high and fills most of the gap. Volume is the highest in the past year. What does this signal?",
          options: [
            "Exhaustion gap + potential climactic top — reversal signal with high-volume rejection",
            "Breakout confirmation — new all-time high on volume is strongly bullish",
            "Normal earnings volatility — wait for the next day for more information",
            "Continuation setup — buying the gap-fill is a high-probability trade",
          ],
          correctIndex: 0,
          explanation:
            "A gap-up on good news that fills within the same session after a long uptrend is a textbook exhaustion gap. Combined with record volume and rejection from the high, this is a warning sign that the last buyers entered on the news and sellers overwhelmed them. This pattern has historically high accuracy as a trend-end signal.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "The correct entry for a double top pattern is to short sell when the price reaches the second peak, before it breaks the neckline.",
          correct: false,
          explanation:
            "Entering at the second peak is premature and has a low success rate. The double top is not confirmed until price breaks the neckline on volume. Many double tops fail at the neckline and continue higher. Entering after a confirmed neckline break has far higher accuracy. The extra wait costs a slightly worse entry price but dramatically reduces false signal trades.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "After a sharp downtrend, a stock hits $42 on extremely high volume with a wide bearish candle that closes near its low. Two weeks later it retraces to $42 again, on much lower volume, with a narrow-spread candle that closes near its high — a 'no supply' bar.",
          question: "What do these two price events together indicate?",
          options: [
            "Selling climax at $42 followed by a no-supply test — classic double bottom accumulation setup",
            "Distribution — the second test shows sellers are still in control",
            "The $42 level is a resistance zone — expect further downside",
            "Indecision — neither event is conclusive without more data",
          ],
          correctIndex: 0,
          explanation:
            "The first touch: high volume + wide spread + close near low = selling climax — maximum fear, smart money absorbing supply. The second test: low volume + narrow spread + close near high = no supply — sellers have been exhausted, no new supply entering. Together, this Wyckoff pattern (climax + spring/test) at the same price is a high-probability long setup.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Building a Complete Trading System ─────────────────────────
    {
      id: "tam-5",
      title: "Building a Complete Trading System",
      description:
        "Combining trend, momentum, volume, pattern, and risk management into one unified approach",
      icon: "Settings",
      xpReward: 110,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "The Five Pillars of a Complete System",
          content:
            "A **complete trading system** integrates multiple independent elements that must all align before a trade is taken. Each pillar adds confirmation.\n\n**Pillar 1 — Trend**: Is the primary trend in my favor? (MTFA check)\n**Pillar 2 — Momentum**: Is momentum aligned? (RSI, MACD, price action quality)\n**Pillar 3 — Volume**: Does volume support the move? (VSA, institutional footprint)\n**Pillar 4 — Pattern**: Is there a recognizable high-probability setup? (Breakout, pullback, reversal)\n**Pillar 5 — Risk Management**: Is the R:R at least 2:1? Is position size within 1–2% account risk?\n\nAll five pillars must be checked before every trade. A trade that satisfies only 3 pillars is lower probability — take it at reduced size or skip it entirely.\n\n**Why confluence works**: Each indicator has a certain error rate. Requiring 5 independent confirmations dramatically reduces false signals because independent errors are multiplicative, not additive.",
          highlight: ["complete system", "five pillars", "trend", "momentum", "volume", "pattern", "risk management", "confluence"],
        },
        {
          type: "teach",
          title: "Integrating the Elements — The Trade Checklist",
          content:
            "Turn the five pillars into an actionable **trade checklist** that runs before every entry:\n\n**Step 1 — Trend alignment** (2 min):\n□ Weekly chart: trending up/down/sideways?\n□ Daily chart: same direction as weekly?\n□ Trade direction matches primary trend?\n\n**Step 2 — Momentum** (1 min):\n□ ADX > 25 (trending) or mean-reversion setup?\n□ Momentum indicator aligned (RSI not overbought in uptrend entry)?\n\n**Step 3 — Volume** (1 min):\n□ Volume on signal candle above average?\n□ No distribution signals visible?\n\n**Step 4 — Pattern** (2 min):\n□ Identifiable setup? (Breakout / Pullback to S/R / Reversal pattern confirmed?)\n□ Where is the trigger (exact entry condition)?\n\n**Step 5 — Risk** (1 min):\n□ Stop-loss level defined (technical placement)\n□ Position size calculated (risk ÷ stop distance)\n□ R:R ≥ 2:1?\n\nTotal: 7 minutes. Every time. No exceptions.",
          highlight: ["trade checklist", "step-by-step", "entry condition", "trigger", "stop-loss placement", "position size calculation"],
        },
        {
          type: "teach",
          title: "Testing, Refinement, and Long-Term Edge",
          content:
            "A complete system is never 'finished' — it evolves as you collect data.\n\n**Forward testing protocol**:\n1. Paper trade the system for 30 trades minimum before live capital\n2. Log every trade with all five pillar grades\n3. After 30 trades, calculate: Win rate, avg R:R, expectancy (win rate × avg win − loss rate × avg loss)\n4. Positive expectancy = system has edge; negative = adjust a pillar\n\n**Identifying your edge specifically**:\n- Break results by setup type: Which pattern performs best?\n- Break results by market condition: Trending or ranging?\n- Break results by time of day: Do afternoon trades underperform?\n\n**Continuous refinement loop**:\nData → Insight → Adjustment → Testing → Data\n\n**Expectancy formula**:\nE = (Win rate × Avg win) − (Loss rate × Avg loss)\n\nExample: 45% win rate, $300 avg win, 55% loss rate, $120 avg loss:\nE = (0.45 × $300) − (0.55 × $120) = $135 − $66 = $69 per trade.\n\nA positive expectancy system run consistently produces profits regardless of any single trade's outcome.",
          highlight: ["expectancy", "forward testing", "paper trading", "edge", "continuous refinement", "expectancy formula"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader checks all five pillars. Trend: aligned. Momentum: aligned. Pattern: valid breakout. Risk: R:R = 2.5:1. Volume: average, not above average. What should the trader do?",
          options: [
            "Take the trade at reduced size — 4 of 5 pillars pass; volume weakness means reduced conviction",
            "Skip the trade entirely — all five must always pass perfectly",
            "Take full size — 4 of 5 is excellent and the setup is valid",
            "Wait for volume to expand, even if the breakout moves away",
          ],
          correctIndex: 0,
          explanation:
            "Four of five pillars is a good setup but not an A+ setup. Reduced position size is the correct response — you participate in the potential reward while acknowledging the missing confirmation. Many successful traders scale their size to the number of confirming factors: 3/5 = quarter size, 4/5 = half size, 5/5 = full size.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A trading system with a 40% win rate cannot be profitable regardless of the average win-to-loss ratio.",
          correct: false,
          explanation:
            "Profitability depends on expectancy, not win rate alone. A 40% win rate with a 3:1 average win-to-loss ratio has expectancy: (0.40 × 3) − (0.60 × 1) = 1.2 − 0.6 = +0.6 per unit risked — strongly profitable. Many professional trend-following systems have win rates below 50% but generate strong returns through large wins relative to small losses.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "After 60 live trades, a trader's log shows: overall expectancy = +$45/trade. But when she filters by setup type, pullback-to-MA trades show +$92/trade expectancy (22 trades), while breakout trades show -$18/trade expectancy (38 trades).",
          question: "What is the most logical refinement to this system?",
          options: [
            "Eliminate breakout trades and focus exclusively on pullback-to-MA setups with the proven edge",
            "Continue both setups equally — 60 trades is not enough to conclude",
            "Refine the breakout setup by adding more filters until it matches pullback performance",
            "Increase size on breakout trades to offset the lower performance",
          ],
          correctIndex: 0,
          explanation:
            "The data is clear: pullback-to-MA setups have strong positive expectancy; breakout setups are actively losing money. The rational response is to stop trading the losing setup and concentrate on the profitable one. 22 trades of +$92 is a meaningful signal. Refining the breakout setup later (after more analysis) is possible — but continuing it while it loses is not justified.",
          difficulty: 3,
        },
      ],
    },
  ],
};
