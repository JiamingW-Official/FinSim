import { Unit } from "./types";

export const unitOptionsStrategiesAdvanced: Unit = {
  id: "options-strategies-advanced",
  title: "Advanced Options Strategies",
  description:
    "Master professional-grade options tactics: vertical spreads, neutral income strategies, volatility plays, and portfolio hedging techniques used by institutional traders",
  icon: "TrendingUp",
  color: "#8B5CF6",
  lessons: [
    // ─── Lesson 1: Vertical Spreads ──────────────────────────────────────────
    {
      id: "options-strategies-advanced-1",
      title: "📐 Vertical Spreads",
      description:
        "Bull call spreads, bear put spreads, credit spreads — defined risk directional plays with capped profit and loss",
      icon: "ArrowUpDown",
      xpReward: 100,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What Is a Vertical Spread?",
          content:
            "A **vertical spread** is an options position that buys one option and sells another option of the same type and expiration but at a different strike price. Both legs share the same underlying asset and expiry — only the strike changes, which is why it's called 'vertical' (strikes are arranged vertically on an options chain).\n\n**Why use a spread instead of a naked option?**\n- **Defined risk**: The short leg caps your maximum loss and reduces net premium paid\n- **Lower cost basis**: Selling the second option offsets the premium of the bought option\n- **Trade-off**: You also cap your maximum profit at the difference between strikes minus net premium\n\n**Two fundamental types:**\n- **Debit spreads**: You pay net premium (buy the more expensive option, sell the cheaper one). Profit when the market moves in your direction.\n- **Credit spreads**: You collect net premium (sell the more expensive option, buy the cheaper one for protection). Profit when the market stays flat or moves away from the short strike.\n\n**Key metrics for any vertical spread:**\n- **Max profit** = (strike width − net debit) for debit spreads, or (net credit received) for credit spreads\n- **Max loss** = net debit paid for debit spreads, or (strike width − net credit) for credit spreads\n- **Breakeven** = lower strike + net debit (bull call) or higher strike − net credit (bull put credit spread)",
          highlight: [
            "vertical spread",
            "debit spreads",
            "credit spreads",
            "defined risk",
            "max profit",
            "max loss",
            "breakeven",
          ],
        },
        {
          type: "teach",
          title: "Bull Call Spread — Bullish Debit Strategy",
          content:
            "A **bull call spread** (also called a long call vertical) expresses a moderately bullish view at a lower cost than buying a naked call.\n\n**Construction**: Buy a call at strike K1, sell a call at strike K2 (K2 > K1), same expiry.\n\n**Example** — Stock at $100:\n- Buy 100-strike call @ $5.00\n- Sell 110-strike call @ $2.00\n- **Net debit**: $3.00 ($300 per contract)\n- **Max profit**: $10 − $3 = **$7.00** ($700) — achieved if stock closes at or above $110 at expiry\n- **Max loss**: $3.00 ($300) — entire premium paid if stock closes below $100\n- **Breakeven**: $100 + $3 = **$103**\n\n**When to use a bull call spread:**\n- You're moderately bullish — you expect a move up but not an explosive rally\n- Implied volatility is high, making outright calls expensive — the short leg offsets some of that cost\n- You want to risk a defined, smaller premium rather than buying an uncovered call\n- You have a specific price target near K2 — the spread maximizes return if the stock closes right at that target\n\n**Key insight**: The delta of a bull call spread is always between 0 and 1. Near-the-money spreads have deltas around 0.3–0.5. Deep in-the-money spreads approach 1.0 delta but have little upside left.",
          highlight: [
            "bull call spread",
            "long call vertical",
            "net debit",
            "breakeven",
            "implied volatility",
            "delta",
          ],
        },
        {
          type: "teach",
          title: "Bear Put Spread & Credit Spread Mechanics",
          content:
            "**Bear put spread** — moderately bearish debit strategy:\n- Buy a put at strike K2 (higher), sell a put at strike K1 (lower), same expiry\n- Net debit paid; max profit = (K2 − K1) − net debit if stock falls below K1\n- Example: Stock at $100, buy 100-put @ $4.50, sell 90-put @ $1.50 → net debit $3.00, max profit $7.00 if stock ≤ $90\n\n**Bull put spread (credit spread)** — neutral-to-bullish credit strategy:\n- Sell a put at the higher strike, buy a put at a lower strike for protection\n- You collect net credit upfront; max profit = net credit if stock stays above the short strike at expiry\n- Example: Sell 95-put @ $2.50, buy 90-put @ $1.00 → collect $1.50 credit, max loss = $5.00 − $1.50 = $3.50\n\n**Bear call spread (credit spread)** — neutral-to-bearish credit strategy:\n- Sell a call at the lower strike, buy a call at a higher strike for protection\n- Profit if stock stays below the short call strike at expiry\n\n**Choosing between debit and credit spreads:**\n- In low-IV environments, debit spreads are cheaper — buy directionality at a discount\n- In high-IV environments, credit spreads let you sell inflated premium while defining risk\n- Credit spreads benefit from **theta decay** (time value erodes daily, helping the short leg)\n- Debit spreads require the move to materialize before expiry — theta works against you",
          highlight: [
            "bear put spread",
            "bull put spread",
            "bear call spread",
            "net credit",
            "theta decay",
            "short strike",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A trader buys a 50/55 bull call spread for a $2.00 net debit. What is the breakeven price at expiration?",
          options: [
            "$50.00 — the lower strike where the long call becomes valuable",
            "$52.00 — lower strike plus the net debit paid",
            "$55.00 — the upper strike where max profit is reached",
            "$53.00 — midpoint between the two strikes",
          ],
          correctIndex: 1,
          explanation:
            "For a bull call spread, the breakeven at expiration is the lower strike (K1) plus the net debit paid. Here: $50 + $2.00 = $52.00. Below $52, the position loses money (up to the full $2.00 debit if below $50). Above $55, the maximum profit of $3.00 ($5 spread width minus $2 debit) is achieved. Between $52 and $55, the trade is profitable but has not yet reached max profit.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A bull put credit spread achieves maximum profit when the underlying stock price rises above the short put strike at expiration.",
          correct: true,
          explanation:
            "Correct. In a bull put spread, you sell the higher-strike put and buy the lower-strike put for protection, collecting a net credit. Both puts expire worthless if the stock is above the short (higher) strike at expiration — you keep the entire credit collected. Maximum loss occurs if the stock falls below the long (lower) strike, where the full spread width minus the credit received is lost.",
          difficulty: 1,
        },
        {
          type: "quiz-mc",
          question:
            "Implied volatility spikes before an earnings announcement. Which vertical spread construction is most advantaged by this environment?",
          options: [
            "A bull call debit spread — you benefit from rising IV on your long call",
            "A bear call credit spread — you sell inflated premium and profit from IV crush after the announcement",
            "A bull call debit spread — low IV means cheaper options to buy",
            "Neither spread type is affected by implied volatility levels",
          ],
          correctIndex: 1,
          explanation:
            "In a high-IV environment (like pre-earnings), credit spreads are advantaged. You sell the more expensive short-leg option at inflated implied volatility and buy the cheaper long-leg protection. When IV 'crushes' after the announcement, the short leg's value collapses faster than the long leg, locking in profit. Debit spreads also see the long leg appreciate with high IV, but the net debit is higher, and an IV crush after entry hurts the position.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The maximum loss on a bear call credit spread is limited to the net credit received, since the short call gains unlimited value if the stock rallies.",
          correct: false,
          explanation:
            "False. In a bear call spread, the long call at the higher strike caps the maximum loss. If the stock rallies above both strikes, the short call loses money, but the long call gains dollar-for-dollar above its strike, capping the net loss at: (spread width − net credit received). For example, a $5-wide spread that collected $1.50 credit has a max loss of $3.50, not unlimited. This is the defining feature of spreads versus naked short options.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Neutral Strategies ────────────────────────────────────────
    {
      id: "options-strategies-advanced-2",
      title: "⚖️ Neutral Strategies",
      description:
        "Iron condors, iron butterflies, calendar spreads — collect premium while the market trades sideways",
      icon: "Minus",
      xpReward: 110,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Iron Condor — The Range-Bound Income Machine",
          content:
            "An **iron condor** combines a bull put spread below the market with a bear call spread above it. You collect premium from both credit spreads and profit if the underlying stays between the two short strikes at expiration.\n\n**Construction** — Stock at $100:\n- Sell 90-put / Buy 85-put (bull put spread, collect $1.20)\n- Sell 110-call / Buy 115-call (bear call spread, collect $1.30)\n- **Total credit collected**: $2.50 ($250 per contract)\n- **Max profit**: $2.50 — if stock is between $90 and $110 at expiry\n- **Max loss**: $5.00 − $2.50 = **$2.50** — if stock breaks out above $115 or below $85\n- **Upper breakeven**: $110 + $2.50 = $112.50\n- **Lower breakeven**: $90 − $2.50 = $87.50\n\n**Probability of profit**: Iron condors typically have a 60–75% probability of profit because both short strikes are out-of-the-money. The trade-off is a poor risk/reward — you risk roughly $1 to make $1.\n\n**Ideal conditions:**\n- Low to moderate realized volatility; stock expected to range-trade\n- High implied volatility (sell expensive premium) that is expected to decrease\n- No binary events (earnings, FDA decisions) within the expiry window\n- 30–45 DTE (days to expiration) is the sweet spot for theta decay acceleration",
          highlight: [
            "iron condor",
            "bull put spread",
            "bear call spread",
            "short strikes",
            "probability of profit",
            "DTE",
            "theta decay",
          ],
        },
        {
          type: "teach",
          title: "Iron Butterfly — Maximum Precision, Maximum Reward",
          content:
            "An **iron butterfly** is like a compressed iron condor where both short strikes are at the same price — typically at-the-money. You sell an ATM straddle (ATM call + ATM put) and buy wings for protection.\n\n**Construction** — Stock at $100:\n- Sell 100-put + Sell 100-call (short straddle)\n- Buy 90-put + Buy 110-call (wings)\n- **Total credit**: Higher than a same-width iron condor because you're selling ATM options\n- **Max profit**: At expiry with stock exactly at $100 (both short options expire worthless)\n- **Max loss**: (wing width − total credit) at either wing\n\n**Iron butterfly vs iron condor trade-offs:**\n- Iron butterfly collects **more premium** (ATM options have the most extrinsic value)\n- But the **profit zone is narrower** — requires stock to barely move\n- Iron butterfly has higher **negative gamma** near expiry — small moves away from center become costly\n- Condors offer a wider profit tent at the cost of lower credit\n\n**Managing iron condors and butterflies:**\n- **Take profit at 50% of max credit** — don't hold to expiry (gamma risk accelerates)\n- **Roll the untested side**: If the stock moves toward one wing, roll that side closer to collect more credit and narrow risk\n- **Stop loss at 2× credit received** — e.g., if you collected $2.50, exit the entire position if it reaches a $5.00 loss",
          highlight: [
            "iron butterfly",
            "ATM straddle",
            "short straddle",
            "wings",
            "negative gamma",
            "roll the untested side",
            "stop loss",
          ],
        },
        {
          type: "teach",
          title: "Calendar & Diagonal Spreads — Trading the Term Structure",
          content:
            "**Calendar spread** (time spread / horizontal spread): Buy a longer-dated option and sell a nearer-dated option at the same strike.\n\n**Long calendar spread example** — Stock at $100, sell 30-DTE 100-call @ $2.50, buy 60-DTE 100-call @ $3.80, net debit $1.30:\n- Profit if stock stays near $100 while the front-month option decays faster\n- The near-term sold option loses time value faster than the far-term long option (**theta advantage**)\n- **Vega positive**: Rising IV benefits the trade because the longer-dated option has higher vega\n\n**Why calendars work — term structure dynamics:**\n- Near-term options decay faster (theta is highest for 0–30 DTE options)\n- If the front month expires worthless, you're left long the back-month option at a discount\n- Calendars profit from **IV expansion** in the back month (which has higher vega)\n\n**Diagonal spread**: Like a calendar, but different strikes. Buy a longer-dated, lower-strike call and sell a shorter-dated, higher-strike call. Creates a cost-reduced LEAPS position.\n\n**Example**: Buy 12-month 95-call @ $10.00, sell 30-DTE 105-call @ $2.00 each month → effectively reduces the long call cost over time (the 'poor man's covered call').\n\n**Key risk**: If the stock gaps significantly past the short strike before expiry, the short leg can create losses that exceed the calendar's net debit.",
          highlight: [
            "calendar spread",
            "diagonal spread",
            "theta advantage",
            "vega positive",
            "term structure",
            "LEAPS",
            "poor man's covered call",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An iron condor is placed on a $200 stock: sell 180-put / buy 170-put, sell 220-call / buy 230-call, collecting $3.00 total credit. What is the maximum loss?",
          options: [
            "$3.00 — the credit collected is also the max risk",
            "$7.00 — the spread width minus the credit received",
            "$10.00 — the full width of one spread leg",
            "$17.00 — the distance between the two short strikes",
          ],
          correctIndex: 1,
          explanation:
            "For an iron condor, each spread leg is $10 wide (180/170 and 220/230). The maximum loss on either leg is (spread width − total credit) = $10.00 − $3.00 = $7.00. This maximum loss is realized if the stock breaks decisively through either wing at expiry (below $170 or above $230). The max profit of $3.00 is achieved if the stock closes between $180 and $220.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A long calendar spread benefits from a rapid increase in implied volatility because the long back-month option has greater vega sensitivity than the short front-month option.",
          correct: true,
          explanation:
            "Correct. In a long calendar spread, you are net long vega — the back-month long option has significantly higher vega than the front-month short option (vega increases with time to expiry). When implied volatility rises across the term structure, the back-month option appreciates in value more than the front-month option depreciates, resulting in a net gain. This makes calendars popular as a way to position for expected IV expansion.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "A trader holds a profitable iron condor at 60% of max profit with 15 DTE remaining. What is the standard professional management approach?",
          options: [
            "Hold to expiration — the closer to expiry, the more theta decay you capture",
            "Close the position now at 60% profit — gamma risk accelerates near expiry and can eliminate gains rapidly",
            "Add another iron condor on top to collect more premium while IV is elevated",
            "Convert to a long straddle to profit from any final move at expiry",
          ],
          correctIndex: 1,
          explanation:
            "Professional iron condor management typically targets closing at 50% of max credit collected, not holding to expiry. With 15 DTE, gamma risk becomes acute — small moves in the underlying can create outsized losses quickly as options approach expiration. The risk/reward of holding those final days is poor: you risk giving back gains for diminishing theta benefits. Closing at 50-60% of max profit is a proven approach to improving long-term expectancy.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "An iron butterfly always collects more premium than an iron condor constructed with the same wing strikes, making it strictly superior for income generation.",
          correct: false,
          explanation:
            "False. While an iron butterfly does collect more premium (ATM options have maximum extrinsic value), it is not strictly superior. The profit range of an iron butterfly is extremely narrow — the stock must stay very close to the center strike. The iron condor, despite collecting less premium, has a much wider profit zone between the two short strikes, creating a more forgiving structure. The choice depends on your market forecast: use butterfly for a very stable market, condor for a moderately ranging market.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Volatility Plays ───────────────────────────────────────────
    {
      id: "options-strategies-advanced-3",
      title: "💥 Volatility Plays",
      description:
        "Long straddles, strangles, backspreads, ratio spreads — profit from big moves or volatility expansion regardless of direction",
      icon: "Zap",
      xpReward: 120,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Long Straddle — Pure Volatility Bet",
          content:
            "A **long straddle** buys both an ATM call and an ATM put at the same strike and expiry. It profits if the stock makes a large move in either direction — the strategy is direction-neutral but volatility-dependent.\n\n**Construction** — Stock at $100, expiry 30 DTE:\n- Buy 100-call @ $3.50\n- Buy 100-put @ $3.20\n- **Total debit**: $6.70 ($670 per contract)\n- **Upper breakeven**: $100 + $6.70 = **$106.70**\n- **Lower breakeven**: $100 − $6.70 = **$93.30**\n- **Max loss**: $6.70 — if stock is exactly at $100 at expiry\n- **Max profit**: Unlimited to the upside; limited to (strike − debit) on the downside\n\n**The volatility challenge**: You are paying for optionality — the market has priced in an expected move through the straddle price. The stock must move **more than the implied move** for the straddle to profit at expiry.\n\n**Implied move calculation**: ATM straddle price ≈ 0.68 × IV × S × √T (where T is in years). A $6.70 straddle on a $100 stock implies roughly 6.7% expected move.\n\n**When straddles work:**\n- Pre-earnings plays where you believe the stock will move more than the implied move\n- During regime changes (rising uncertainty not yet priced in)\n- When **realized volatility** is running significantly above **implied volatility** (cheap options relative to actual moves)\n- Entering before a catalyst when IV hasn't yet fully expanded",
          highlight: [
            "long straddle",
            "ATM call",
            "ATM put",
            "breakeven",
            "implied move",
            "realized volatility",
            "implied volatility",
          ],
        },
        {
          type: "teach",
          title: "Long Strangle — Cheaper Volatility with Wider Breakevens",
          content:
            "A **long strangle** is similar to a straddle but uses out-of-the-money options at different strikes — typically equidistant from the current price. It's cheaper than a straddle but requires a larger move to profit.\n\n**Construction** — Stock at $100:\n- Buy 105-call @ $2.00\n- Buy 95-put @ $1.80\n- **Total debit**: $3.80 (vs $6.70 for the straddle)\n- **Upper breakeven**: $105 + $3.80 = **$108.80**\n- **Lower breakeven**: $95 − $3.80 = **$91.20**\n\n**Straddle vs strangle trade-offs:**\n- Strangle costs less — lower absolute risk\n- Strangle needs a bigger move to profit — wider breakevens\n- Straddle profits from smaller moves and benefits more from IV expansion (higher combined vega)\n- Strangles are better when you're unsure of timing but want cheap exposure to a large eventual move\n\n**Backspread (ratio spread for volatility):**\n- Buy 2 OTM calls, sell 1 ATM call — creates a net long volatility position with upside skew\n- Example: Sell 1 × 100-call @ $4.00, buy 2 × 105-calls @ $2.00 each → net even (zero cost)\n- Profits from large upside moves; small loss in a narrow range; gains unlimited leverage if stock rallies sharply\n- Ideal when you're bullish on vol AND direction simultaneously",
          highlight: [
            "long strangle",
            "OTM options",
            "breakeven",
            "backspread",
            "vega",
            "net long volatility",
          ],
        },
        {
          type: "teach",
          title: "The Volatility Surface — IV Skew & Term Structure",
          content:
            "Professional options traders don't just look at a single IV number — they analyze the entire **volatility surface**: how implied volatility varies by strike (the **skew**) and by expiration (the **term structure**).\n\n**Put skew (negative skew)** — the most common pattern in equities:\n- OTM puts trade at higher IV than OTM calls\n- Reflects demand for downside protection (portfolio insurance)\n- Expressed as the **skew ratio**: 25-delta put IV / 25-delta call IV\n- On SPX, put skew is persistent — OTM puts regularly trade 5–10 vol points above ATM\n\n**Term structure:**\n- Front-month IV is usually lower than long-dated IV (normal contango)\n- Can invert (backwardation): near-term IV spikes above long-dated IV during crises or before earnings\n- The **VIX** measures 30-day SPX implied volatility; the **VIX term structure** (VIX3M, VIX6M) shows the forward vol curve\n\n**Volatility surface positioning strategies:**\n- **Buy OTM calls vs sell OTM puts**: Exploits the skew if you believe puts are overpriced relative to calls\n- **Calendar spread on skew**: Buy back-month ATM options when term structure is inverted (front-month vol is cheap relative to history)\n- **IV rank**: A relative measure of current IV vs its 52-week range. IV rank of 80 means current IV is in the top 20% of its range — historically attractive for selling premium\n- When **IV rank > 50**: Favor selling premium (iron condors, covered calls)\n- When **IV rank < 30**: Favor buying premium (straddles, calendars)",
          highlight: [
            "volatility surface",
            "skew",
            "term structure",
            "put skew",
            "VIX",
            "IV rank",
            "selling premium",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A stock trades at $50. A 30-DTE straddle (buy 50-call @ $2.80, buy 50-put @ $2.60) costs $5.40. Approximately what move does the market imply the stock will make by expiration?",
          options: [
            "About $2.80 — the cost of just the call option",
            "About $5.40 upside or downside — the straddle price defines the implied move",
            "About $10.80 — double the straddle price to account for both directions",
            "About $1.08 — the implied daily move based on trading days",
          ],
          correctIndex: 1,
          explanation:
            "The ATM straddle price is the market's consensus estimate of the expected magnitude of the move by expiration. A $5.40 straddle on a $50 stock implies roughly a 10.8% expected move ($5.40 / $50). The stock needs to close above $55.40 or below $44.60 at expiration for the straddle to be profitable. This is why straddle buyers need the realized move to exceed the implied move — if the stock moves exactly as implied, the straddle breaks even (approximately).",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In equity options markets, out-of-the-money puts typically have higher implied volatility than out-of-the-money calls at the same distance from the current price, reflecting persistent demand for downside protection.",
          correct: true,
          explanation:
            "Correct. The 'volatility skew' or 'put skew' is one of the most well-documented empirical patterns in options markets. Portfolio managers, institutions, and individual investors systematically buy OTM puts to hedge long equity positions. This persistent demand bids up OTM put premiums, causing their implied volatility to exceed that of equidistant OTM calls. On the S&P 500 index, this skew is especially pronounced and has been present consistently since the 1987 crash.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Implied volatility rank (IV rank) is at 15 on a particular stock, meaning current IV is near a 52-week low. Which strategy is most aligned with this environment?",
          options: [
            "Iron condor — sell premium while IV is low and likely to stay low",
            "Long straddle — buy cheap options expecting IV to expand and/or a large price move",
            "Covered call — sell calls at inflated premiums for income",
            "Bull put credit spread — collect the elevated put skew premium",
          ],
          correctIndex: 1,
          explanation:
            "When IV rank is very low (near 15), implied volatility is cheap relative to its recent history. This favors buying options (long premium strategies) because you're purchasing volatility at a discount. A long straddle benefits from two potential catalysts: (1) a large price move that exceeds the cheap straddle cost, or (2) IV expansion back toward its historical mean, which increases the value of both options even without a price move. Selling premium (iron condors, covered calls) is disadvantaged here — you'd be selling cheap options.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A 1×2 call backspread (sell 1 ATM call, buy 2 OTM calls) has theoretically unlimited profit potential if the stock makes a large upside move.",
          correct: true,
          explanation:
            "Correct. In a call backspread (1×2), you sell one lower-strike call and buy two higher-strike calls. If the stock rallies sharply above the OTM strikes, the two long calls appreciate together, more than offsetting the loss on the single short call. Because you own more calls than you are short, the position becomes net long deltas above the upper strike, with unlimited theoretical upside. The risk zone is a moderate move just above the short strike at expiry — both long calls expire nearly worthless while the short call is in the money.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Hedging with Options ──────────────────────────────────────
    {
      id: "options-strategies-advanced-4",
      title: "🛡️ Hedging with Options",
      description:
        "Protective puts, collars, zero-cost collars, covered calls, and institutional portfolio insurance strategies",
      icon: "Shield",
      xpReward: 130,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Protective Put — Portfolio Insurance",
          content:
            "A **protective put** (married put) combines a long stock position with a long put option on the same shares. It functions as portfolio insurance — limiting downside while preserving unlimited upside participation.\n\n**Mechanics** — Own 100 shares of stock at $100, buy a 90-put @ $2.50:\n- **Net cost**: $100/share stock + $2.50 put = $102.50 effective cost basis\n- **Downside protection**: Below $90, losses stop — the put compensates for further stock decline\n- **Maximum loss**: $100 − $90 + $2.50 = **$12.50/share** (the deductible before insurance kicks in)\n- **Upside**: Unlimited minus the $2.50 premium cost\n- **Breakeven**: $102.50 (stock must rise $2.50 to cover the put premium)\n\n**Choosing the right strike for protection:**\n- **Deep OTM put (5–10% below market)**: Cheap but provides a large deductible; good for catastrophic tail risk\n- **ATM put**: Expensive but near-perfect downside hedge from the current price\n- **ITM put**: Very expensive; acts more like a complete hedge than insurance\n\n**Real-world usage:**\n- Concentrated stock positions (executives, founders, early employees)\n- Long equity portfolios heading into macro uncertainty or earnings\n- Holding appreciated stock where selling would trigger capital gains taxes — a put provides protection without a taxable sale\n- Institutional portfolio managers use **index puts** (SPX or SPY puts) to hedge broad market exposure rather than individual stock puts",
          highlight: [
            "protective put",
            "portfolio insurance",
            "married put",
            "downside protection",
            "breakeven",
            "index puts",
            "tail risk",
          ],
        },
        {
          type: "teach",
          title: "Covered Call Writing — Income on Long Positions",
          content:
            "A **covered call** sells an OTM call against shares you already own, collecting premium income while capping upside potential.\n\n**Mechanics** — Own 100 shares at $100, sell a 110-call @ $2.50:\n- **Premium collected**: $2.50/share ($250 per contract)\n- **Effective sell price** if assigned: $110 + $2.50 = **$112.50**\n- **Downside risk**: Reduced by $2.50 (to $97.50 breakeven), but the position still loses below $97.50\n- **Max profit**: $112.50 − $100 = $12.50/share (if stock is at or above $110 at expiry)\n- **Cap on upside**: If stock rallies to $130, you're called away at $110 — you miss $20 of gains\n\n**When covered calls make sense:**\n- Neutral-to-moderately bullish on the stock; you'd be willing to sell at the strike price\n- High IV environment — sell expensive premium\n- Generating income on a stagnant holding while waiting for a move\n- Reducing cost basis systematically over time (the 'wheel strategy')\n\n**Covered call risks:**\n- **Opportunity cost**: The biggest risk is missing a sharp rally if the stock blows through your short call\n- **Assignment**: If stock is above the strike near expiry, you may be called away — especially with dividends approaching (early exercise risk)\n- **Downside remains**: A covered call does not protect against a severe decline — it only offsets losses by the premium received",
          highlight: [
            "covered call",
            "premium income",
            "assignment",
            "opportunity cost",
            "wheel strategy",
            "effective sell price",
          ],
        },
        {
          type: "teach",
          title: "Collar & Zero-Cost Collar — Hedge with No Net Premium",
          content:
            "A **collar** combines a protective put with a covered call — you buy downside protection and fund it by selling upside. The net cost depends on the strikes chosen.\n\n**Standard collar** — Own 100 shares at $100:\n- Buy 90-put @ $2.50 (downside hedge)\n- Sell 110-call @ $2.50 (funds the put)\n- **Net cost**: $0 — this is a **zero-cost collar**\n- **Floor**: $90 (protected below this level)\n- **Cap**: $110 (stock called away above this level)\n- **Range**: The stock is 'collared' between $90 and $110 for the duration\n\n**Zero-cost collar mechanics:**\n- Select the put strike and call strike such that put premium = call premium\n- No upfront cash outlay, but you give up upside above the short call\n- Very popular with concentrated stock positions, executive compensation plans, and locked-up shares\n\n**Collar variations:**\n- **Wide collar** (e.g., 80/120): Cheap call, cheap put; large range of participation; only catastrophic protection\n- **Tight collar** (e.g., 95/105): More expensive (or requires skewed strikes); near-complete lock on range\n- **3-way collar**: Add a ratio on the put (sell 2 lower-strike puts against 1 higher-strike put) to reduce put cost further, but creates downside risk below the short put\n\n**Institutional portfolio insurance:**\n- Large funds buy **SPX put spreads** (instead of expensive ATM puts) to cost-effectively hedge tail risk\n- Combine with selling near-term covered calls against the portfolio to fund the put spreads\n- **Risk reversal**: Sell an OTM put, buy an OTM call (or vice versa) — expresses a directional skew view while keeping net premium near zero",
          highlight: [
            "collar",
            "zero-cost collar",
            "floor",
            "cap",
            "protective put",
            "covered call",
            "SPX put spreads",
            "risk reversal",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An investor owns 500 shares of a stock at $80 and buys 5 protective put contracts (each covering 100 shares) at the 75-strike for $1.50. If the stock falls to $60 at expiration, what is the investor's loss per share?",
          options: [
            "$20.00 — the full drop from $80 to $60",
            "$6.50 — the difference between put strike and stock price plus premium",
            "$6.50 — ($80 − $75) + $1.50 = the deductible plus insurance cost",
            "$1.50 — only the put premium paid",
          ],
          correctIndex: 2,
          explanation:
            "With the 75-strike protective put, the investor is protected below $75. The loss is: (stock price paid − put strike) + put premium paid = ($80 − $75) + $1.50 = $6.50 per share. Below $75, the put compensates for every dollar of additional decline. Without the put, the loss would be $20/share ($80 − $60). The put limited the loss to $6.50 — the $5 deductible (the gap between purchase price and put strike) plus the $1.50 insurance premium.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A zero-cost collar perfectly eliminates all downside risk while allowing unlimited upside participation, making it the optimal hedging strategy for a long stock position.",
          correct: false,
          explanation:
            "False. A zero-cost collar eliminates downside risk only below the put floor — there is still a loss between the purchase price and the put strike. More importantly, the collar caps the upside at the short call strike, eliminating all gains above that level. It is not 'costless' in the economic sense — the cost is foregone upside. It's best described as a range-bound position: the investor accepts a limited loss zone in exchange for giving up unlimited appreciation. Whether it's 'optimal' depends entirely on the investor's objectives and view.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "A portfolio manager owns a $10M equity portfolio and wants to hedge against a market decline greater than 10% over the next 3 months. Which approach most efficiently achieves this goal?",
          options: [
            "Buy protective puts on each individual stock in the portfolio",
            "Sell the entire portfolio and buy it back after 3 months",
            "Buy SPX put spreads (e.g., 5% OTM / 20% OTM) to cover the tail risk at lower cost than ATM puts",
            "Write covered calls on all positions to collect premium as a hedge",
          ],
          correctIndex: 2,
          explanation:
            "SPX put spreads (buying an OTM put and selling a deeper OTM put) are the institutional standard for cost-efficient portfolio hedging. A 5%-OTM / 20%-OTM put spread provides protection precisely in the -10% to -20% loss range — where it's most needed — at a fraction of the cost of ATM index puts. Buying individual stock puts is expensive and introduces basis risk. Selling the portfolio creates transaction costs and tax events. Covered calls only offset losses by a small premium and offer no downside protection beyond that amount.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Early assignment risk on a covered call position increases significantly when the stock is trading deep in-the-money and an ex-dividend date approaches, because call holders may exercise early to capture the dividend.",
          correct: true,
          explanation:
            "Correct. Early exercise of American-style call options is most rational when the time value remaining in the option is less than the dividend about to be paid. If the stock is deep ITM (the call has little extrinsic value), a call holder can exercise early, receive the shares, and collect the dividend — capturing more value than selling the option. As a covered call writer, early assignment means your shares are called away before the dividend date. Covered call sellers typically avoid holding through ex-dividend dates when the short call is deep ITM or roll the position beforehand.",
          difficulty: 3,
        },
      ],
    },
  ],
};
