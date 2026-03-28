import type { Unit } from "./types";

export const UNIT_TA_PATTERNS: Unit = {
  id: "ta-patterns",
  title: "Chart Patterns & Technical Setups",
  description:
    "Master the visual language of markets — trend reversal patterns, continuation setups, candlestick signals, gap analysis, volume dynamics, and evidence-based pattern reliability.",
  icon: "BarChart2",
  color: "#0ea5e9",
  lessons: [
    /* ================================================================
       LESSON 1 — Trend Patterns
       ================================================================ */
    {
      id: "ta-patterns-1-trend",
      title: "Trend Reversal Patterns",
      description:
        "Head & shoulders, inverse H&S, double top/bottom — measured move targets and volume confirmation rules",
      icon: "TrendingDown",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Head & Shoulders: The Classic Top",
          content:
            "The **Head & Shoulders (H&S)** pattern is one of the most reliable reversal signals, signaling the end of an uptrend.\n\n**Structure:**\n- **Left Shoulder:** price rallies to a high, then pulls back on average volume\n- **Head:** price rallies to a higher high (the 'head') on strong volume, then retreats\n- **Right Shoulder:** a weaker rally — lower than the head, often on declining volume\n- **Neckline:** the support line connecting the two troughs between the shoulders\n\n**Entry Signal:**\nThe pattern is confirmed when price **closes below the neckline** after forming the right shoulder.\n\n**Measured Move Target:**\nMeasure the vertical distance from the head's peak to the neckline. Project that distance **downward** from the neckline breakout point.\n\nExample:\n- Head peak = $120, Neckline = $100 → distance = $20\n- Neckline breakout at $100 → target = $80\n\n**Volume Signature:**\n- Highest volume: left shoulder or head rally\n- Right shoulder rally: notably lower volume (sellers are in control)\n- Breakout candle: volume should surge — lack of breakout volume is a yellow flag\n\n**Failure Mode:**\nIf price breaks the neckline then reverses back above it, the pattern has 'failed.' This failure often leads to a sharp rally — the trapped shorts provide fuel.",
          visual: "candlestick",
          highlight: [
            "head & shoulders",
            "neckline",
            "measured move",
            "breakout volume",
            "pattern failure",
          ],
        },
        {
          type: "teach",
          title: "Inverse H&S & Double Top/Bottom",
          content:
            "**Inverse Head & Shoulders** is the bullish mirror image — a bottom reversal pattern.\n\n**Structure:**\n- Left trough → deeper trough (head) → right trough (shallower)\n- Neckline: resistance connecting the two rally peaks between troughs\n- Confirmation: close **above the neckline** on expanding volume\n- Target: neckline + distance from neckline down to the head's trough\n\n**Double Top:**\nTwo peaks at approximately the same price level, separated by a pullback.\n- The 'M' shape signals exhaustion of an uptrend\n- Confirmation: close below the trough between the two peaks\n- Target: trough − (peak − trough)\n- Volume ideally lower on the second peak — buyers losing conviction\n\n**Double Bottom:**\nThe 'W' pattern — two lows at a similar support level.\n- Second low may be slightly higher (higher low = building strength)\n- Confirmation: close above the peak between the two lows\n- Target: peak + (peak − trough)\n\n**Key Differences:**\n| Pattern | Trend reversed | Min bars to form | Typical target accuracy |\n|---------|---------------|------------------|------------------------|\n| H&S Top | Uptrend | 20–40 bars | ~65–70% |\n| Inv H&S | Downtrend | 20–40 bars | ~65–70% |\n| Double Top | Uptrend | 15–30 bars | ~60–65% |\n| Double Bottom | Downtrend | 15–30 bars | ~60–65% |\n\n**Pro tip:** Wait for the neckline/confirmation break rather than anticipating — pre-breakout entries fail roughly 40% of the time.",
          highlight: [
            "inverse head & shoulders",
            "double top",
            "double bottom",
            "neckline break",
            "confirmation",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A stock forms a Head & Shoulders top. The head peaks at $150, and the neckline sits at $130. Where is the measured move price target after the neckline breaks?",
          options: ["$110", "$120", "$140", "$160"],
          correctIndex: 0,
          explanation:
            "The measured move rule: distance from head to neckline = $150 − $130 = $20. Project that distance below the neckline: $130 − $20 = $110. This is the minimum expected move once the pattern is confirmed with a neckline close.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In a valid Head & Shoulders pattern, the volume on the right shoulder's rally should ideally be higher than the volume on the left shoulder's rally, confirming buying interest.",
          correct: false,
          explanation:
            "The opposite is true. The right shoulder rally should show notably lower volume than the left shoulder, signaling that buyers are losing conviction. Declining volume on the right shoulder rally is a key confirmation of the pattern's bearish character. High volume on the right shoulder would actually weaken the H&S thesis.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are watching NVDA on a daily chart. The stock makes a low at $400, rallies to $440 (neckline), then dips to another low at $405 (slightly higher than the first), then rallies back through $440 with a strong closing candle on 3× average volume.",
          question: "What pattern has formed and what should you do?",
          options: [
            "Double bottom confirmed — consider a long entry with target near $480",
            "Head & shoulders forming — wait for the right shoulder then short",
            "Symmetrical triangle — wait for direction of breakout",
            "Double top confirmed — short with target near $360",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook Double Bottom (W pattern). Two lows at approximately the same level ($400 and $405), with the second low slightly higher (a bullish sign). The breakout above the $440 neckline on 3× average volume is a strong confirmation. Target: $440 + ($440 − $400) = $480. The higher second low and surge in breakout volume both add confidence.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Continuation Patterns
       ================================================================ */
    {
      id: "ta-patterns-2-continuation",
      title: "Continuation Patterns",
      description:
        "Flags, pennants, wedges, and triangles — how to time breakouts and set targets in trending moves",
      icon: "Flag",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Flags & Pennants: The Pause That Refreshes",
          content:
            "Flags and pennants form after a sharp, near-vertical move (the **flagpole**). They represent a brief consolidation before the trend resumes.\n\n**Bull Flag:**\n- Flagpole: strong surge upward on high volume\n- Flag: 3–7 bars of gentle downward drift in a parallel channel\n- Volume: ideally drops off during the flag — this is healthy 'digestion'\n- Breakout: above the upper flag boundary on rising volume → entry signal\n- Target: add the flagpole length to the breakout point\n\nExample: Flagpole = $10 move. Stock breaks out at $55 → target $65.\n\n**Bear Flag:**\nMirror image during a downtrend — flagpole is a sharp drop, flag is a gentle upward drift, target is the flagpole subtracted from the breakdown level.\n\n**Pennant:**\nSimilar to a flag but the consolidation forms a **symmetrical triangle** (converging trendlines) rather than a parallel channel. Slightly shorter consolidation, often only 4–5 bars.\n\n**The 3-F Rule for Flags:**\n1. **Flagpole** must be steep (near-vertical, at least 10–15% move)\n2. **Flag** consolidation must drift against the trend (not sideways)\n3. **Failure** risk rises if the flag retraces more than 50% of the flagpole\n\n**Volume Pattern:**\n- Heavy volume on flagpole\n- Drying volume during flag (sellers/buyers taking a break)\n- Volume surge on breakout = high-probability continuation",
          visual: "candlestick",
          highlight: [
            "flag",
            "pennant",
            "flagpole",
            "consolidation",
            "breakout volume",
            "measured move",
          ],
        },
        {
          type: "teach",
          title: "Triangles & Wedges: Coiling Energy",
          content:
            "Triangles compress price action between converging trendlines, building energy for a directional move.\n\n**Ascending Triangle (Bullish Bias):**\n- Flat upper resistance + rising lower trendline\n- Each pullback finds support at a higher level — buyers stepping in sooner\n- Breakout: above the flat resistance line with volume\n- Target: height of the triangle added to the breakout level\n\n**Descending Triangle (Bearish Bias):**\n- Flat lower support + declining upper trendline\n- Each rally fails at a lower high — sellers getting more aggressive\n- Breakdown: below the flat support on volume\n- Target: triangle height subtracted from breakdown\n\n**Symmetrical Triangle (Neutral — direction-dependent):**\n- Both trendlines slope toward each other at roughly equal angles\n- Breakout direction is uncertain until the breakout occurs\n- Common in choppy, transitional markets\n- False breakouts are more frequent — wait for a **closing** break, not intrabar\n\n**Rising Wedge (Bearish):**\n- Both upper and lower trendlines slope upward, but converging\n- Price making higher highs and higher lows, but momentum waning\n- Volume declining as price rises = distribution\n- Breaks to the downside despite the upward slant\n\n**Falling Wedge (Bullish):**\n- Both trendlines slope downward, converging\n- Lower highs and lower lows with declining volume\n- Breaks upward — compressed springs release\n\n**Timing Rule:** Most triangles break out 60–75% of the way to the apex. If price reaches the apex without breaking, the setup degenerates into a choppy range.",
          highlight: [
            "ascending triangle",
            "descending triangle",
            "symmetrical triangle",
            "rising wedge",
            "falling wedge",
            "apex",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A stock surges $15 from $80 to $95 on heavy volume, then consolidates in a tight parallel channel drifting down to $91 over 5 days on falling volume. It then breaks above $93 on double average volume. What is the measured move target?",
          options: ["$106", "$110", "$100", "$103"],
          correctIndex: 0,
          explanation:
            "The flagpole is $15 ($80 to $95). The breakout point is $91 (bottom of flag) + consolidation, but we apply the flagpole to the breakout level. Breakout at $93 — but the standard method uses the start of the flag top: $95 + $15 flagpole = $110 is one method, or breakout point $93 + $15 = $108. The most common convention: add the flagpole ($15) to the breakout price ($91): $91 + $15 = $106. This is the minimum measured move target.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A rising wedge is considered a bullish continuation pattern because both the highs and lows are increasing over time.",
          correct: false,
          explanation:
            "A rising wedge is actually a bearish pattern, despite showing rising highs and lows. The converging trendlines reveal that each successive move up is weaker — price is struggling to make meaningful new highs. Volume typically declines as the wedge progresses (bearish divergence). When the rising wedge finally breaks, it usually breaks downward, catching many bulls off guard.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Reversal Candles
       ================================================================ */
    {
      id: "ta-patterns-3-reversal-candles",
      title: "Reversal Candlestick Patterns",
      description:
        "Hammer, shooting star, engulfing, doji, morning/evening star — reading candle context for high-probability reversals",
      icon: "CandlestickChart",
      xpReward: 85,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "Single-Candle Reversal Signals",
          content:
            "Candlestick patterns encode buyer/seller battle outcomes within each bar. Single-candle reversal signals are most powerful at extremes — key support/resistance levels, trend exhaustion points.\n\n**Hammer (Bullish Reversal at Lows):**\n- Small real body at the top, long lower wick (at least 2× the body)\n- Upper wick minimal or absent\n- Meaning: sellers pushed price sharply lower, but buyers reclaimed nearly all losses\n- Context required: must appear after a downtrend or at support\n- Confirmation: next candle closes above the hammer's high\n\n**Shooting Star (Bearish Reversal at Highs):**\n- Small real body at the bottom, long upper wick (at least 2× the body)\n- Lower wick minimal or absent\n- Meaning: buyers drove price sharply higher, but sellers crushed it back down\n- Context required: must appear after an uptrend or at resistance\n- Mirror of hammer — equally powerful at the right location\n\n**Inverted Hammer & Hanging Man:**\n- Inverted Hammer: hammer shape appearing at the bottom — potential bullish reversal but weaker; requires strong confirmation candle\n- Hanging Man: hammer shape appearing at the top — bearish warning; needs confirmation close below the body\n\n**The Context Rule:**\nA hammer at flat support after a 3-week downtrend is a high-probability signal. A hammer in the middle of a range is noise. Never trade these patterns without asking: 'Where in the trend/range are we?'",
          visual: "candlestick",
          highlight: [
            "hammer",
            "shooting star",
            "lower wick",
            "upper wick",
            "context",
            "confirmation candle",
          ],
        },
        {
          type: "teach",
          title: "Two & Three-Candle Reversal Patterns",
          content:
            "Multi-candle patterns encode a complete shift in market psychology over 2–3 sessions, making them more reliable than single-candle signals.\n\n**Bullish Engulfing:**\n- Day 1: bearish candle (red/black)\n- Day 2: bullish candle whose body completely **engulfs** the prior day's body\n- The larger the engulfing candle relative to the previous, the stronger the signal\n- Volume should surge on the engulfing day\n\n**Bearish Engulfing:**\n- Day 1: bullish candle\n- Day 2: bearish candle that engulfs the prior body entirely\n- Most potent when forming at resistance, after an extended rally\n\n**Doji Candles:**\nWhen open ≈ close, a doji forms — a cross shape representing indecision.\n- **Standard Doji:** equal upper and lower wicks — uncertainty\n- **Long-Legged Doji:** very long wicks both ways — volatile indecision\n- **Dragonfly Doji:** open=close at high, long lower wick — bullish when at lows\n- **Gravestone Doji:** open=close at low, long upper wick — bearish when at highs\n\n**Morning Star (3-candle Bullish):**\n1. Large bearish candle continuing the downtrend\n2. Small body candle (star) — gaps down from prior close; can be any color\n3. Large bullish candle closing well into the first candle's body\n- Best when the star gaps away from both adjacent candles\n\n**Evening Star (3-candle Bearish):**\nMirror of morning star — large bullish candle, small star gapping up, then large bearish candle closing into the first.\n\n**Win Rates (approximate, at key levels):**\n- Engulfing patterns: 63–68%\n- Morning/Evening Star: 66–72%\n- Single doji: 52–55% (weaker alone)",
          highlight: [
            "bullish engulfing",
            "bearish engulfing",
            "doji",
            "morning star",
            "evening star",
            "win rate",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A stock has been falling for 12 days. On day 13, a large red candle continues the decline. Day 14 is a tiny-bodied candle that gaps below day 13's close. Day 15 is a large green candle closing above the midpoint of day 13's body, on 2× average volume. What pattern has formed?",
          options: [
            "Morning Star — bullish reversal signal",
            "Evening Star — bearish continuation signal",
            "Bearish Engulfing — more downside expected",
            "Doji followed by indecision — no actionable signal",
          ],
          correctIndex: 0,
          explanation:
            "This is a classic Morning Star: (1) large bearish candle continuing the downtrend, (2) a small-bodied star candle gapping lower — indecision at the lows, (3) a large bullish candle closing well into the first candle's range, confirmed by high volume. This three-candle pattern signals a potential reversal from the downtrend. The volume surge on day 15 adds conviction.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A Hammer candlestick is a valid bullish reversal signal regardless of where it appears on the chart — whether in an uptrend, downtrend, or sideways range.",
          correct: false,
          explanation:
            "Context is everything. A Hammer is only a meaningful bullish reversal signal when it appears after a downtrend or at a significant support level. A hammer in an uptrend is called a Hanging Man and may actually be bearish. A hammer in a sideways range is simply noise. The same candle shape carries completely different implications depending on where it appears in the trend structure.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are reviewing META at key support ($450). The last 5 days showed declining closes. On day 6, META opens at $453, drops to $441 during the day (touching the 200-day MA), but rallies to close at $451 — forming a candle with a tiny body near the top and a long lower wick. Volume was 40% above average.",
          question: "How should you interpret this candle?",
          options: [
            "Bullish Hammer at support with above-average volume — consider a long entry with a stop below $441",
            "Shooting Star — bearish signal; price likely to continue lower",
            "Doji — pure indecision, no actionable signal",
            "Bearish Engulfing setup beginning — wait for tomorrow's candle",
          ],
          correctIndex: 0,
          explanation:
            "This is a Hammer: small body near the top, long lower wick representing rejection of lower prices at the 200-day MA support. Volume 40% above average shows buyers aggressively stepped in during the dip — strong conviction. The context (at key support after a 5-day decline) makes this a high-quality signal. Placing a stop below $441 (the wick low and 200-day MA) gives a logical invalidation level.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Gap Analysis
       ================================================================ */
    {
      id: "ta-patterns-4-gaps",
      title: "Gap Analysis",
      description:
        "Common, breakaway, runaway, and exhaustion gaps — fill statistics and gap trading strategies",
      icon: "ArrowUpDown",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Four Types of Price Gaps",
          content:
            "A **gap** occurs when today's opening price is higher or lower than yesterday's closing price, leaving a visible empty space on the chart. Not all gaps are equal — their type determines how to trade them.\n\n**1. Common Gap (Area Gap):**\n- Occurs within a trading range, often for no particular reason\n- Typically fills within 1–3 days as price returns to 'normal'\n- Low-significance event — not useful for directional trading\n- Example: random gap in a sideways consolidation\n\n**2. Breakaway Gap:**\n- Occurs when price gaps **out of a consolidation** or reversal pattern\n- Signals the start of a new trend — this is the gap you want to trade\n- Volume should be significantly above average (often 2–4× normal)\n- Often does NOT fill for weeks or months; the gap itself becomes support/resistance\n- Example: stock breaks out of a 3-month rectangle on an earnings beat\n\n**3. Runaway Gap (Continuation Gap / Measuring Gap):**\n- Occurs mid-trend, roughly halfway through the total move\n- Confirms the existing trend and provides a price target\n- Measuring technique: distance from trend start to gap ≈ distance from gap to trend end\n- Volume: moderate to high; less dramatic than breakaway\n- Often holds as support (uptrend) or resistance (downtrend) on any re-test\n\n**4. Exhaustion Gap:**\n- Final gap near the end of a trend — a last burst of buying/selling energy\n- Appears similar to a runaway gap but comes after an already extended move\n- Clue: often accompanied by very high volume AND the gap fails to hold\n- Reversal signal: 1–3 days after an exhaustion gap, price typically closes back inside the gap\n- The day price fills back into an exhaustion gap = high-probability reversal signal\n\n**Island Reversal:**\nWhen an exhaustion gap is followed by a gap in the opposite direction, the price 'island' between the two gaps is an extremely bearish/bullish reversal signal.",
          highlight: [
            "common gap",
            "breakaway gap",
            "runaway gap",
            "exhaustion gap",
            "island reversal",
            "gap fill",
          ],
        },
        {
          type: "teach",
          title: "Gap Fill Statistics & Trading Strategies",
          content:
            "**Gap Fill Statistics (empirical research across equities):**\n\n| Gap Type | Fill Rate | Avg time to fill |\n|----------|-----------|------------------|\n| Common gap | ~90% | 1–3 trading days |\n| Breakaway gap | ~45% | Weeks to months |\n| Runaway gap | ~50% | Weeks |\n| Exhaustion gap | ~80% | 1–5 trading days |\n\n**Gap Trading Strategies:**\n\n**Strategy 1: Fade the Common Gap**\nIf a stock gaps up on no news within a sideways range:\n- Sell short near the open\n- Target: fill the gap (previous close)\n- Stop: above the gap high + small buffer\n- Risk/Reward: typically 1:2 or better if the gap is large\n\n**Strategy 2: Buy the Breakaway Gap**\nAfter earnings/news catalyst that gaps a stock above multi-week resistance:\n- Buy on the first pullback to the gap top (which now acts as support)\n- Target: measured move from the prior pattern\n- Stop: close below the gap — a close inside the breakaway gap invalidates it\n\n**Strategy 3: Runaway Gap as Midpoint Estimate**\n- If a stock ran $20 before a runaway gap, expect a total of ~$40 move\n- Position size up at the gap-back test, adding to existing trend positions\n\n**Strategy 4: Fade the Exhaustion Gap**\n- Wait for the close-back-inside signal (price fills back into the gap on a closing basis)\n- Short the close into the gap, targeting prior consolidation\n- Use a tight stop above the gap high\n\n**Earnings Gap Rules:**\n- Earnings breakaway gaps on strong beats rarely fill within 30 days\n- Earnings gaps on weak beats/misses fill faster (~65% fill within 10 days)\n- 'Gap and go' vs 'gap and crap' is most predictable using pre-market volume relative to 30-day average daily volume",
          highlight: [
            "gap fill rate",
            "fade",
            "breakaway support",
            "runaway midpoint",
            "exhaustion fade",
            "earnings gap",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "AAPL has been trending up for 8 weeks, gaining 35%. This morning it gaps up 4% at the open on no specific news. By midday, the gap fails to hold and price closes back inside the gap. What type of gap is this most likely, and what does it signal?",
          options: [
            "Exhaustion gap — potential reversal; the close-back-inside is a bearish signal",
            "Breakaway gap — strong continuation; buy the gap fill as support",
            "Common gap — ignore it; will likely fill within 3 days with no directional implications",
            "Runaway gap — buy aggressively; the trend is accelerating",
          ],
          correctIndex: 0,
          explanation:
            "Key clues: (1) occurs after an already extended 8-week, 35% trend, (2) no news catalyst — odd for a large gap, (3) gap fails to hold and price closes back inside. These are the hallmarks of an exhaustion gap. The close-back-inside on the same day is a high-probability reversal signal. Approximately 80% of exhaustion gaps fill within 1–5 days.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A breakaway gap that occurs with 3× normal volume on a strong earnings beat is likely to fill quickly, providing a good buy-the-dip opportunity at the prior resistance level.",
          correct: false,
          explanation:
            "Breakaway gaps on strong fundamental catalysts (like earnings beats) with high volume are among the least likely gaps to fill quickly — only about 45% fill at all, and those that do take weeks to months. Traders who 'fade' breakaway gaps on strong catalysts are fighting the trend. The correct strategy is to buy on a pullback to the top of the breakaway gap (which now acts as support), not to bet on the gap filling immediately.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Volume & Price
       ================================================================ */
    {
      id: "ta-patterns-5-volume-price",
      title: "Volume & Price Analysis",
      description:
        "Volume price analysis, Wyckoff accumulation/distribution, OBV divergence, and climax volume signals",
      icon: "BarChart",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Volume Price Analysis: The Effort vs Result Principle",
          content:
            "**Volume** is the fuel of price movement. The relationship between volume (effort) and price change (result) reveals whether a move has conviction.\n\n**Core Principle: Effort vs Result**\n- High volume + large price move = effort matches result → trend continues\n- High volume + small price move = effort absorbed → potential reversal signal\n- Low volume + large price move = suspicious move, weak conviction, likely to reverse\n- Low volume + small price move = disinterest, wait for a catalyst\n\n**Volume Confirming Breakouts:**\nA breakout above resistance is only confirmed when volume expands significantly. A breakout on below-average volume ('stealth' breakout) has a high false-breakout rate (~55–60%).\n\nRule of thumb: breakout volume should be at least 1.5× the 20-day average. 2×+ is ideal.\n\n**Volume Confirming Trend:**\n- Healthy uptrend: up-days have higher volume than down-days\n- Healthy downtrend: down-days have higher volume than up-days\n- Warning: if an uptrend's up-days start showing lower volume than down-days → distribution beginning\n\n**On-Balance Volume (OBV):**\n- Cumulative: add volume on up-days, subtract on down-days\n- OBV rising with price = healthy, confirming trend\n- **OBV Divergence:** price makes new high, OBV does not → smart money distributing while retail buys\n- **OBV Divergence (bullish):** price makes new low, OBV holds higher → smart money accumulating\n\n**Climax Volume (Buying/Selling Climax):**\nAn extreme volume spike (often 3–5× normal) near the end of a trend signals exhaustion:\n- Buying climax: euphoric buying spike — often marks a short-term or major top\n- Selling climax: panic selling spike — often marks a bottom (everyone who wanted to sell, sold)\n- After a selling climax, even modest buying can recover price sharply",
          highlight: [
            "effort vs result",
            "breakout volume",
            "OBV divergence",
            "buying climax",
            "selling climax",
            "distribution",
          ],
        },
        {
          type: "teach",
          title: "Wyckoff Method: Accumulation & Distribution",
          content:
            "Richard Wyckoff's framework identifies the phases through which 'Composite Operators' (large institutional players) accumulate or distribute large positions without moving price too much.\n\n**Wyckoff Accumulation Phases (bottom → new uptrend):**\n\n1. **Phase A — Stopping the Downtrend:**\n   - Preliminary Support (PS): first large-volume bounce attempting to stop the fall\n   - Selling Climax (SC): panic-volume capitulation at lows\n   - Automatic Rally (AR): sharp bounce from the SC\n   - Secondary Test (ST): price revisits the SC area on lower volume\n\n2. **Phase B — Building a Cause:**\n   - Price oscillates within the range; institutions quietly accumulate on dips\n   - Springs (false breakdowns below SC): wash out weak longs, institutions buy the panic\n\n3. **Phase C — The Spring (Last Point of Support):**\n   - One final shakeout below support on declining volume\n   - Price snaps back immediately — the smart money test is passed\n\n4. **Phase D — Signs of Strength:**\n   - Price breaks above the range midpoint on expanding volume (Sign of Strength — SOS)\n   - Last Point of Support (LPS): pullback on low volume finding support above old resistance\n\n5. **Phase E — Markup:**\n   - Price leaves the range; trend is established\n\n**Wyckoff Distribution (inverse — top → new downtrend):**\nUPT (Upthrust After Distribution), LPSY (Last Point of Supply), Sign of Weakness (SOW).\n\n**Practical Application:**\nLook for:\n- Very high volume at lows not followed by lower prices (absorption)\n- Tests of the lows on dramatically lower volume (no more sellers)\n- Range-wide spreads on the upside after quiet accumulation = markup beginning",
          highlight: [
            "Wyckoff",
            "accumulation",
            "distribution",
            "spring",
            "selling climax",
            "sign of strength",
            "markup",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A stock has been declining for 3 months. Last week, it dropped 8% on 5× normal volume in a single day, then immediately bounced 5% over the next 3 days on gradually declining volume. Which Wyckoff event does this most likely represent?",
          options: [
            "Selling Climax followed by an Automatic Rally — potential accumulation beginning",
            "Sign of Weakness — expect further decline ahead",
            "Upthrust After Distribution — bearish continuation signal",
            "Last Point of Supply — institutions selling the bounce",
          ],
          correctIndex: 0,
          explanation:
            "The 5× volume panic sell-off is a classic Selling Climax (SC) — the point where the last wave of sellers capitulates at maximum fear. The subsequent 3-day bounce on declining volume is the Automatic Rally (AR), as buying pressure briefly overwhelms the depleted sellers. Together, SC + AR = Phase A of Wyckoff Accumulation. This doesn't guarantee a reversal, but it marks the beginning of a potential base-building process worth monitoring.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "If a stock makes new price highs but OBV fails to confirm with a new OBV high, this bearish divergence means the stock must reverse immediately.",
          correct: false,
          explanation:
            "OBV divergence is a warning signal, not a timing trigger. Bearish OBV divergence (price new high, OBV lagging) indicates that institutional distribution may be occurring — large players selling into retail buying. However, divergences can persist for weeks or months before price corrects. OBV divergence is most useful when combined with other bearish signals (overbought readings, key resistance, pattern completion) rather than used alone as an entry signal.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 6 — Pattern Reliability
       ================================================================ */
    {
      id: "ta-patterns-6-reliability",
      title: "Pattern Reliability & Edge",
      description:
        "Success rates by pattern and timeframe, combining patterns with indicators, and trading pattern failures profitably",
      icon: "Target",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Pattern Success Rates & What Affects Them",
          content:
            "Not all chart patterns are created equal. Academic and practitioner research reveals significant variation in pattern reliability.\n\n**Empirical Success Rates (reaching the measured move target):**\n\n| Pattern | Bullish version | Bearish version |\n|---------|----------------|----------------|\n| Head & Shoulders | 63% (inv. H&S) | 60% (H&S top) |\n| Double Bottom/Top | 64% | 61% |\n| Bull/Bear Flag | 67% | 65% |\n| Ascending/Descending Triangle | 72% | 68% |\n| Symmetrical Triangle | 54% | 54% |\n| Rising Wedge | N/A | 74% |\n| Falling Wedge | 70% | N/A |\n| Bullish/Bearish Engulfing | 63% | 63% |\n\n**Factors That Improve Success Rates:**\n1. **Volume confirmation:** patterns with volume expansion on breakout perform 15–20% better\n2. **Timeframe:** daily and weekly patterns outperform intraday by 10–15%; less noise\n3. **Trend alignment:** trading patterns with the higher-timeframe trend improves odds\n4. **Key level confluence:** pattern at major S/R, moving average, or Fibonacci level = higher probability\n5. **Multiple pattern agreement:** when 2–3 patterns align simultaneously, success rates compound\n\n**Factors That Reduce Success Rates:**\n- Trading in low-volume, thinly-traded stocks (manipulation risk)\n- Entering on intrabar breaks rather than waiting for closing confirmation\n- Entering after a pattern is 'too well known' (crowded trade)\n- Ignoring the broader market context (pattern fighting the index trend)\n\n**Best Timeframes by Pattern Type:**\n- Candlestick reversal patterns: 4h, Daily\n- Triangle/Flag continuation: 1h, 4h, Daily\n- H&S, Double top/bottom: Daily, Weekly\n- Gap patterns: Daily",
          highlight: [
            "success rates",
            "volume confirmation",
            "timeframe",
            "trend alignment",
            "confluence",
            "closing confirmation",
          ],
        },
        {
          type: "teach",
          title: "Combining Patterns with Indicators & Trading Failures",
          content:
            "**The Confluence Framework:**\nCombining chart patterns with technical indicators creates a multi-layer confirmation system that filters out lower-quality setups.\n\n**Pattern + RSI:**\n- H&S top forming while RSI is overbought (>70) and showing bearish divergence: very high-probability\n- Double bottom at support + RSI oversold (<30) with bullish divergence: excellent entry setup\n- Avoid: trading reversal patterns when RSI is in the 40–60 neutral zone (no momentum extreme)\n\n**Pattern + Moving Averages:**\n- Breakaway gap above 200-day MA: fundamentally changes the trend picture\n- Flag pattern occurring near the 20-day MA (the trend ribbon): adds dynamic support to the setup\n- H&S neckline coinciding with the 50-day MA: doubles the significance of the support level\n\n**Pattern + MACD:**\n- MACD histogram showing declining momentum as the H&S right shoulder forms: bearish confirmation\n- Bullish flag with MACD crossing above signal line at the breakout: adds momentum confirmation\n\n**Trading Pattern Failures (Failure Trades):**\nPattern failures — when a well-formed pattern breaks down and reverses — often produce the sharpest, most reliable moves because trapped traders must exit quickly.\n\n**The Failure Trade Setup:**\n1. Identify a well-formed pattern (e.g., clear H&S top)\n2. The neckline breaks as expected on volume\n3. But price reverses and closes **back above the neckline** within 1–2 bars\n4. Entry: buy the close back above the neckline\n5. The target: the measured move in the opposite direction (up, because the shorts are now trapped)\n6. Stop: just below the failed neckline break\n\n**Why Failures Work:**\n- All the shorts who entered on the valid-looking breakdown are now offside\n- They must cover as price rises → forced buying = sharp squeeze\n- The pattern's failure completely reverses sentiment\n\n**Rule:** The bigger and more 'textbook-perfect' the pattern that fails, the more violent the failure rally/selloff.",
          highlight: [
            "confluence",
            "RSI divergence",
            "200-day MA",
            "pattern failure",
            "failure trade",
            "short squeeze",
            "trapped traders",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A trader spots a Head & Shoulders top on the daily chart with volume declining on the right shoulder. RSI shows bearish divergence. The neckline sits at the 50-day moving average. What best describes the quality of this setup?",
          options: [
            "High-quality setup — pattern, volume, RSI divergence, and moving average all confirm bearish bias",
            "Low-quality setup — too many confirming factors make this a 'crowded' and dangerous trade",
            "Medium-quality setup — only the H&S pattern matters; indicators are lagging and unreliable",
            "Invalid setup — H&S patterns should not be traded when the neckline aligns with a moving average",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook high-probability setup demonstrating the Confluence Framework: (1) H&S pattern forming — structural signal, (2) declining right shoulder volume — bearish momentum, (3) RSI bearish divergence — momentum not confirming the price structure, (4) neckline = 50-day MA — breaks the 50-day MA simultaneously, a major technical event. Multiple independent indicators pointing to the same conclusion raises conviction significantly. The 'crowded trade' concern only becomes valid when the pattern is widely discussed in media; a setup found through your own analysis with technical confluence is a genuine edge.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You identified a textbook Double Top in SPY at $520 resistance. Both tops were on declining volume. Price broke the $500 neckline with a large red candle. You shorted SPY at $499. The next day, SPY opens at $498, then reverses powerfully, closing at $505 — back above the $500 neckline. Your position is at a loss.",
          question: "What is the correct response to this pattern failure?",
          options: [
            "Cover the short and consider going long — the pattern has failed and trapped shorts will be squeezed higher",
            "Add to the short position — this is just a dead-cat bounce before the double top target is reached",
            "Hold the short with the original stop — one reversal day does not invalidate the pattern",
            "Cover the short and stay flat — pattern failures are too unpredictable to trade in either direction",
          ],
          correctIndex: 0,
          explanation:
            "A close back above the neckline ($500) on a strong candle is the classic 'pattern failure' signal. The correct response is to: (1) cover the losing short immediately — the original thesis (double top breakdown) is invalidated, (2) consider going long — the trapped shorts (like yourself and others) must now cover, creating forced buying that can drive a sharp move higher. Pattern failures of well-known setups often produce some of the fastest, most reliable moves in the market. The stop for the long would be a close back below $500.",
          difficulty: 3,
        },
      ],
    },
  ],
};
