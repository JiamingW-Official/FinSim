import type { Unit } from "./types";

export const UNIT_OPTIONS_ADVANCED: Unit = {
  id: "options-advanced",
  title: "Advanced Options Strategies",
  description:
    "CFA/IB-level options theory: spreads, synthetics, volatility trading, Greeks management, and earnings plays",
  icon: "TrendingUp",
  color: "#7c3aed",
  lessons: [
    /* ================================================================
       LESSON 1 — Iron Condor Mechanics
       ================================================================ */
    {
      id: "options-advanced-1",
      title: "Iron Condor Mechanics",
      description:
        "Construction, max profit, breakevens, and ideal market conditions for the iron condor",
      icon: "Layers",
      xpReward: 120,
      steps: [
        {
          type: "teach",
          title: "What is an Iron Condor?",
          content:
            "An **iron condor** is a four-leg, market-neutral, defined-risk options strategy that profits when the underlying stays within a bounded range. It combines a **bull put spread** (below the market) and a **bear call spread** (above the market) on the same underlying and expiration.\n\nConstruction — sell SPY at spot $450:\n- **Sell** 1x $440 put @ $3.20\n- **Buy** 1x $430 put @ $1.50 (protects the downside)\n- **Sell** 1x $460 call @ $2.80\n- **Buy** 1x $470 call @ $1.10 (caps the upside)\n\n**Net credit collected**: ($3.20 + $2.80) - ($1.50 + $1.10) = **$3.40 per share = $340 per contract**\n\nThe iron condor is a **short volatility** strategy: you are selling two vertical spreads and collecting premium in exchange for the obligation to pay out if the underlying moves violently beyond either wing.",
          highlight: [
            "iron condor",
            "bull put spread",
            "bear call spread",
            "net credit",
            "short volatility",
          ],
        },
        {
          type: "teach",
          title: "Max Profit, Max Loss, and Breakeven Points",
          content:
            "Using the SPY iron condor above (short $440/$430 put spread + short $460/$470 call spread, $3.40 net credit):\n\n**Maximum Profit = Net credit received = $340 per contract**\nAchieved when SPY closes between $440 and $460 at expiration. All four options expire worthless and you keep the entire premium.\n\n**Maximum Loss = Spread width - Net credit = $10.00 - $3.40 = $6.60 = $660 per contract**\nOccurs if SPY closes below $430 (put spread fully in-the-money) or above $470 (call spread fully in-the-money). The maximum loss is bounded — you cannot lose more than the spread width minus the credit.\n\n**Breakeven Points:**\n- Lower breakeven = Short put strike - Net credit = $440 - $3.40 = **$436.60**\n- Upper breakeven = Short call strike + Net credit = $460 + $3.40 = **$463.40**\n\n**Risk/Reward Ratio**: $340 max profit vs. $660 max loss = approximately 1:2. This is the inherent trade-off: most of the time (statistically) the condor wins, but the losses when it does occur are larger than the gains.",
          highlight: [
            "maximum profit",
            "maximum loss",
            "breakeven",
            "spread width",
            "risk/reward",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A trader sells an iron condor on AMZN (spot $180): short $170 put, long $160 put, short $190 call, long $200 call. Net credit = $2.50. What are the two breakeven prices at expiration?",
          options: [
            "$167.50 on the downside and $192.50 on the upside",
            "$160.00 on the downside and $200.00 on the upside",
            "$170.00 on the downside and $190.00 on the upside",
            "$172.50 on the downside and $187.50 on the upside",
          ],
          correctIndex: 0,
          explanation:
            "Lower breakeven = Short put strike - net credit = $170 - $2.50 = $167.50. Upper breakeven = Short call strike + net credit = $190 + $2.50 = $192.50. The net credit expands the range of profitability beyond just the short strikes. Between $167.50 and $192.50, this condor is profitable at expiration.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Ideal Conditions and IV Timing",
          content:
            "The iron condor thrives in specific market regimes. Selling premium blindly is a recipe for disaster — the professional options trader times their entries carefully.\n\n**Ideal conditions for selling an iron condor:**\n- **High implied volatility (IV) environment**: Sell condors when IV Rank > 50 (current IV is elevated relative to its 52-week range). You collect fatter premiums and benefit from IV mean reversion (vega decay).\n- **Range-bound underlying**: Choppy, non-trending markets. Identify the absence of strong catalysts or macro regime shifts.\n- **Post-earnings entries**: After an earnings announcement, IV typically collapses sharply (IV crush). Entering a condor after earnings removes the binary event risk.\n- **Time to expiration (DTE)**: Most practitioners sell 30-45 DTE condors. Theta accelerates meaningfully in the final 30 days while the position still has enough premium to be worthwhile.\n\n**Conditions to AVOID:**\n- Selling condors into earnings, FOMC announcements, or CPI data\n- Trending markets (strong directional momentum will blow through one of the wings)\n- Low IV environments — the risk/reward becomes unfavorable when premiums are thin",
          highlight: [
            "IV Rank",
            "IV crush",
            "theta",
            "DTE",
            "vega decay",
            "range-bound",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "TSLA has IV Rank of 78 (meaning current IV is near the top of its 52-week range). Earnings are in 3 weeks. A trader wants to sell a TSLA iron condor expiring in 35 days (which covers earnings). He plans to sell the $220/$210 put spread and $260/$270 call spread for a $4.80 net credit.",
          question:
            "Which is the primary risk this trader is taking by entering this position now?",
          options: [
            "IV crush from earnings will help, but a large post-earnings directional gap could blow through one wing before IV collapses",
            "High IV Rank means premiums are too cheap to make the trade worthwhile",
            "The maximum loss on an iron condor is unlimited, so the trade is inherently too risky",
            "Time decay (theta) will work against the short condor position",
          ],
          correctIndex: 0,
          explanation:
            "High IV means fat premiums, which is good. But selling a condor through an earnings event exposes the position to a binary gap risk — if TSLA jumps $40 post-earnings, the call spread ($260/$270) goes fully in-the-money regardless of subsequent IV collapse. The IV crush helps, but only if the stock stays within the wings. Many professionals wait until the day after earnings to sell the condor and capture the post-crush premium environment without the gap risk.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "On an iron condor, the maximum possible loss per contract is equal to the width of one spread leg multiplied by 100, minus the net credit received.",
          correct: true,
          explanation:
            "Correct. Both spread legs have the same width (by construction). The maximum loss occurs on either side when the underlying breaches the long strike of either spread. Max loss = (spread width × 100) - (net credit × 100). For example, $10 wide spreads with $3.40 credit: max loss = $1,000 - $340 = $660 per contract. You can never lose on both sides simultaneously — the underlying cannot be both above $470 and below $430 at the same time.",
          difficulty: 2,
        },
        {
          type: "practice",
          instruction:
            "Observe the price chart. Notice how range-bound markets (consolidation phases) are ideal environments for short premium strategies like iron condors.",
          objective: "Advance the chart by 15 bars and observe price consolidation",
          actionType: "observe",
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Calendar Spreads
       ================================================================ */
    {
      id: "options-advanced-2",
      title: "Calendar Spreads",
      description:
        "Theta harvesting and volatility term structure plays using time-based spreads",
      icon: "Calendar",
      xpReward: 110,
      steps: [
        {
          type: "teach",
          title: "Calendar Spread Construction and Theta Mechanics",
          content:
            "A **calendar spread** (also called a **time spread** or **horizontal spread**) involves buying and selling the same option type (call or call, put or put) at the same strike but different expiration dates.\n\n**Long calendar spread (net debit):**\n- **Sell** 1x SPY $450 call expiring in 30 days @ $4.20\n- **Buy** 1x SPY $450 call expiring in 60 days @ $6.80\n- **Net debit**: $6.80 - $4.20 = **$2.60 per share = $260 per contract**\n\n**Why this works — theta differential:**\nTheta (time decay) is not linear — it accelerates exponentially as expiration approaches. The short 30-day option decays faster per day than the long 60-day option. Each day that passes, the short front-month leg loses more value than the long back-month leg, creating a daily profit from the theta differential.\n\nThe calendar spread is a **long vega** strategy in aggregate. You benefit if implied volatility increases, because the back-month option has higher vega sensitivity than the front-month option.",
          highlight: [
            "calendar spread",
            "time spread",
            "theta differential",
            "long vega",
            "front-month",
            "back-month",
          ],
        },
        {
          type: "teach",
          title: "Volatility Term Structure and Calendar Spread Selection",
          content:
            "The **volatility term structure** (or vol term structure) plots implied volatility across different expiration dates for the same underlying. This curve is central to calendar spread analysis.\n\n**Normal (upward-sloping) term structure:**\nNear-term expirations trade at lower IV than longer-dated ones. This is the typical regime — uncertainty compounds over time. Calendar spreads are less attractive here because you are buying expensive long-dated vol.\n\n**Inverted (downward-sloping) term structure:**\nNear-term IV > long-term IV. This occurs before major events (earnings, FOMC, FDA announcements) when short-term uncertainty spikes. This is the ideal calendar spread entry:\n- The front-month option (which you SELL) is overpriced due to event premium\n- The back-month option (which you BUY) is relatively cheaper\n- After the event, front-month IV collapses while back-month IV remains stable\n- This **term structure normalization** profits the long calendar position\n\n**Key metric to monitor**: VIX futures term structure. When VIX spot > VIX 3-month future (backwardation), near-term event risk is elevated — calendar spreads thrive in this environment.",
          highlight: [
            "vol term structure",
            "inverted term structure",
            "IV collapse",
            "VIX backwardation",
            "term structure normalization",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "AAPL is trading at $195. You sell the 30-DTE $195 call for $4.50 and buy the 60-DTE $195 call for $7.20 (net debit = $2.70). At 30-DTE expiration, AAPL closes at exactly $195. The short call expires worthless ($0) and the long 30-DTE-remaining call is worth $3.80. What is your P&L?",
          options: [
            "+$1.10 per share profit ($3.80 remaining value - $2.70 initial cost)",
            "-$2.70 loss because both options decayed",
            "+$4.50 because the short call expired worthless",
            "+$0.80 per share, but you must close both legs",
          ],
          correctIndex: 0,
          explanation:
            "The short call expired worthless (worth $0 at expiration), so you keep the $4.50 credit from that leg. The long call has 30 days remaining and is worth $3.80. Net position value = $3.80 (long call) - $0 (short call expired) = $3.80. Profit = $3.80 - $2.70 (initial debit) = $1.10 per share = $110 per contract. The theta differential worked in your favor — the front-month decayed faster than the back-month.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Double Calendar and Risk Management",
          content:
            "A **double calendar spread** places calendar spreads at two different strikes (one above and one below the current price), creating a wider profit zone similar to an iron condor but with different volatility exposure.\n\n**Example on QQQ at $380:**\n- Put calendar: sell 30-DTE $370 put / buy 60-DTE $370 put\n- Call calendar: sell 30-DTE $390 call / buy 60-DTE $390 call\n\nThis creates a tent-shaped profit profile centered between $370 and $390, with the peak profit at either short strike.\n\n**Key risk — gamma at expiration:**\nAs the short front-month approaches expiration, delta and gamma of that option increase dramatically. If the underlying pins at the short strike, the position becomes highly sensitive to small moves. Most practitioners close calendar spreads at 50-70% of max profit or when 7-10 days remain on the short leg, rather than holding to expiration.\n\n**Adjustment strategy:** If the underlying drifts toward one short strike, roll the short leg to a closer-to-money strike to re-center the profit zone. This costs additional debit but repairs the position.",
          highlight: [
            "double calendar",
            "tent-shaped",
            "gamma risk",
            "roll",
            "50% profit target",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "A long calendar spread benefits when implied volatility increases after entry because the long back-month option has greater vega than the short front-month option.",
          correct: true,
          explanation:
            "Correct. Vega (sensitivity to IV changes) is proportional to time remaining — longer-dated options have higher vega. In a long calendar, you own the back-month (high vega) and are short the front-month (lower vega). When IV rises, the back-month gains more value than the front-month loses, resulting in a net profit from the vega differential. This is why calendar spreads are classified as long-vega strategies even though they involve both long and short options.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "META reports earnings in 5 days. The 7-DTE implied volatility (covering earnings) is 62%. The 35-DTE implied volatility (post-earnings) is 28%. A trader buys a calendar spread: short 7-DTE $480 call, long 35-DTE $480 call for a net debit of $1.90. META earnings come and the stock moves only $8, closing at $484. The 7-DTE call expires ITM and is worth $4.00.",
          question: "What happened to this calendar spread?",
          options: [
            "The trade lost money because the stock moved through the short strike, making the short call expensive to cover",
            "The trade profited because IV crush in the front month exceeded the $8 move",
            "The trade broke even because IV crush and ITM value offset each other",
            "The trade cannot be evaluated without knowing the 35-DTE IV after earnings",
          ],
          correctIndex: 0,
          explanation:
            "The short 7-DTE $480 call expired with $4 of intrinsic value (META at $484). The trader must buy it back for $4 (or be assigned). Net loss on short leg = $4.00 paid - $0 credit received ≈ a large cost. Even with IV crush reducing the 7-DTE premium's extrinsic value, the $4 of intrinsic value remains. The calendar spread was hurt by the directional move through the short strike. Calendar spreads are not directionally neutral near expiration — the short gamma exposure from the front-month becomes the dominant risk when the underlying approaches or exceeds the strike.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Ratio Spreads
       ================================================================ */
    {
      id: "options-advanced-3",
      title: "Ratio Spreads",
      description:
        "Directional bias combined with premium collection through unequal leg sizing",
      icon: "BarChart2",
      xpReward: 110,
      steps: [
        {
          type: "teach",
          title: "Ratio Spread Mechanics",
          content:
            "A **ratio spread** involves buying a quantity of options and selling a larger quantity of options at a different strike, creating an unequal (or 'ratioed') position. Unlike vertical spreads, ratio spreads have an uncapped risk profile on the short side.\n\n**Call ratio spread example (1x2) — bullish with premium collection:**\n- **Buy** 1x NVDA $520 call @ $18.00\n- **Sell** 2x NVDA $550 calls @ $8.00 each\n- Net credit: (2 × $8.00) - $18.00 = **$2.00 credit per share = $200 per spread set**\n\n**P&L profile:**\n- Below $520: All options expire worthless. Profit = $2.00 credit (small but real)\n- At $550: Maximum profit zone. The long call is worth $30.00; the two short calls expire at $0. Total = $30.00 + $2.00 credit = $32.00 per share = $3,200\n- Above $550: One short call is covered by the long call (creating a vertical spread). The second short call is naked and loses $1 for every $1 NVDA rises above $550. The breakeven above $550 = $550 + $32 = **$582**\n\nBelow $582, the position makes money. Above $582, losses accelerate. This is the fundamental asymmetry of ratio spreads.",
          highlight: [
            "ratio spread",
            "1x2",
            "uncapped risk",
            "maximum profit",
            "naked short",
          ],
        },
        {
          type: "teach",
          title: "Put Ratio Back Spreads — Bearish Volatility Play",
          content:
            "The **ratio back spread** reverses the ratio logic — you sell fewer options and buy more, resulting in a net debit (usually) but with unlimited profit potential in one direction.\n\n**Put ratio back spread (1x2) — bearish/long vol:**\n- **Sell** 1x SPY $440 put @ $5.50\n- **Buy** 2x SPY $430 puts @ $3.00 each\n- Net debit: (2 × $3.00) - $5.50 = **$0.50 debit**\n\n**P&L profile:**\n- Above $440: All options expire worthless. Loss = $0.50 debit\n- At $430: The short $440 put loses $10. The two long $430 puts expire worthless. Net loss = -$10.00 + $5.50 - $0.50 = -$5.00 (maximum loss)\n- Below $430: The two long puts gain $2 for every $1 SPY drops, offset by the short put's $1 loss. Net delta = +1 per dollar move down. Maximum profit = unlimited as SPY → 0\n\n**Strategic use:** Put ratio back spreads are excellent disaster insurance. For minimal debit (or even a small credit), you gain massively leveraged exposure to a significant down move. Hedge funds use these before macro risk events when they expect either a small move (they lose very little) or a catastrophic move (they profit enormously).",
          highlight: [
            "back spread",
            "ratio back spread",
            "long volatility",
            "disaster insurance",
            "convex payoff",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A trader establishes a call ratio spread on TSLA (spot $260): buy 1x $260 call at $14, sell 2x $285 calls at $6 each. Net credit = $2. What is the maximum profit and where does it occur?",
          options: [
            "Maximum profit = $2,700 per set, achieved when TSLA closes exactly at $285 at expiration",
            "Maximum profit = $200, achieved when all calls expire worthless below $260",
            "Maximum profit = unlimited as TSLA rises above $285",
            "Maximum profit = $1,400, achieved when TSLA is above $285",
          ],
          correctIndex: 0,
          explanation:
            "At expiration with TSLA at $285: Long $260 call is worth $285 - $260 = $25. Two short $285 calls expire at exactly zero (worthless, not ITM). P&L = $25 (long call gain) + $2 (net credit collected) = $27 per share = $2,700 per set of contracts. Maximum profit occurs precisely at the short strike ($285). Above $285, the second naked short call begins to lose, eroding profits. Below $260, all options expire worthless, yielding only the $2 credit.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A 1x2 call ratio spread always has unlimited upside potential for the trader because the long call provides unlimited profit.",
          correct: false,
          explanation:
            "False. In a 1x2 call ratio spread (long 1 call, short 2 calls), the long call covers one of the two short calls. The second short call is naked above the short strike — it loses $1 per dollar the underlying rises, with no cap. Maximum profit occurs at the short strike, and above the upper breakeven, the position incurs unlimited losses. The ratio spread is a defined-maximum-profit, unlimited-loss-above-breakeven strategy on the upside.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A portfolio manager holds 10,000 shares of AAPL at $195 and fears a 15-20% correction but thinks a crash below $150 is unlikely. She wants to generate income while hedging. She considers a 1x2 put ratio spread: buy 100 lots of $185 puts at $6.00, sell 200 lots of $165 puts at $2.80. Net credit = $0.40 × 100 × 100 = $4,000 credit.",
          question:
            "What is the effective hedge protection and where does the hedge break down?",
          options: [
            "Fully hedged from $185 to $165 (the $20 wide long put vertical), but below $165 the 200 short puts increase the effective loss beyond being unhedged",
            "Fully hedged below $185 with no risk — the credit makes it better than owning puts outright",
            "The hedge is uncapped below $165 only if AAPL gaps below $145",
            "The ratio spread provides no real hedge because the net premium is only $4,000",
          ],
          correctIndex: 0,
          explanation:
            "The long 100 $185 puts protect against decline from $185 to $165 (the 1x1 vertical component). Below $165, the 100 extra short $165 puts kick in — the position transitions from protected to having 200 short puts that INCREASE losses as AAPL falls further. This 'negative convexity' below $165 is exactly the wrong exposure in a crash scenario. This structure works if the manager is confident AAPL won't fall below $165 — if wrong, the hedge turns into a liability.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Greeks Profile of Ratio Spreads",
          content:
            "Understanding the Greeks of a ratio spread is essential for position management.\n\n**Call ratio spread (long 1x, short 2x) Greeks:**\n- **Delta**: Initially slightly positive (bullish bias) near current price. As underlying rises toward short strike, delta approaches zero and then goes negative above it.\n- **Gamma**: Net SHORT gamma. As you approach the short strike, the second short call's gamma dominates — the position becomes increasingly sensitive to price moves (and hurt by large moves).\n- **Theta**: Net POSITIVE. Two short options decay faster than one long option. Time is working for you.\n- **Vega**: Net NEGATIVE. Two short options have more total vega than one long option. Rising IV hurts the position (short vega).\n\n**The gamma/theta trade-off:**\nThe ratio spread profits from theta (time passing quietly) but is hurt by large moves (short gamma). This makes it inherently a **short volatility** strategy in spite of having a bullish directional component. Professional traders who run ratio spreads must actively manage delta by buying or selling underlying shares as the stock moves toward the danger zone.",
          highlight: [
            "short gamma",
            "positive theta",
            "short vega",
            "delta management",
            "gamma/theta trade-off",
          ],
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Butterfly Spreads
       ================================================================ */
    {
      id: "options-advanced-4",
      title: "Butterfly Spreads",
      description:
        "Low-cost directional and neutral plays, pinning mechanics, and broken-wing variations",
      icon: "GitMerge",
      xpReward: 110,
      steps: [
        {
          type: "teach",
          title: "Standard Long Butterfly Construction",
          content:
            "A **long butterfly spread** is a three-strike, five-leg (in notional) strategy that profits maximally when the underlying closes exactly at the middle strike at expiration. It has a characteristic 'tent' profit shape.\n\n**Long call butterfly on SPY at $450:**\n- **Buy** 1x $440 call @ $14.00\n- **Sell** 2x $450 calls @ $7.50 each\n- **Buy** 1x $460 call @ $3.20\n- Net debit: $14.00 - (2 × $7.50) + $3.20 = **$2.20 per share = $220 per spread**\n\n**P&L at expiration:**\n- Below $440: All calls expire worthless. Loss = $2.20 (the premium paid)\n- At $450: Long $440 call worth $10, two short $450 calls worth $0, long $460 call worth $0. Profit = $10.00 - $2.20 = **$7.80 = $780 max profit**\n- Above $460: Both outer calls fully offset each other. Loss = $2.20 (the premium paid)\n- Breakevens: $440 + $2.20 = $442.20 (lower) and $460 - $2.20 = $457.80 (upper)\n\n**Key attribute**: Butterflies offer exceptional risk/reward — $220 at risk for a potential $780 profit (3.55:1 reward/risk). The catch is precision: the underlying must close near the exact center strike.",
          highlight: [
            "butterfly spread",
            "tent profit",
            "center strike",
            "breakeven",
            "risk/reward",
          ],
        },
        {
          type: "teach",
          title: "Broken-Wing Butterfly and Pinning Theory",
          content:
            "A **broken-wing butterfly (BWB)** is an asymmetric variation where the wing widths are unequal, creating a skewed risk profile often structured for zero or positive net credit.\n\n**Broken-wing call butterfly on AMZN at $180:**\n- Buy 1x $175 call, sell 2x $185 calls, buy 1x $200 call (instead of the symmetric $195)\n- The wider upper wing costs less — the structure can be built for a $0.30 credit\n- Max profit: still near $185 ($1,000 minus credit adjustments)\n- Risk below: $0 (you received a credit!)\n- Risk above $200: limited additional downside vs. symmetric version\n\n**Pinning theory**: In options-heavy stocks near major option expiration dates, the stock price often gravitates toward the strike with the highest open interest — a phenomenon called **max pain** or **pin risk**. Market makers who are short large quantities of options at a particular strike have incentive to keep the stock near that level to allow their options to expire worthless.\n\n**Practical application**: Traders place butterflies centered on the strike with the highest put/call open interest in weekly options, anticipating that dealer hedging flows will 'pin' the stock there.",
          highlight: [
            "broken-wing butterfly",
            "zero-cost butterfly",
            "pinning",
            "max pain",
            "open interest",
            "dealer hedging",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A trader buys a long call butterfly on MSFT (spot $410): buy $400 call at $15, sell 2x $410 calls at $8 each, buy $420 call at $3.50. What is the maximum possible profit and loss?",
          options: [
            "Max profit = $750 per spread, max loss = $250 per spread",
            "Max profit = $1,000 per spread, max loss = $500 per spread",
            "Max profit = $800 per spread, max loss = $350 per spread",
            "Max profit = unlimited, max loss = $250 per spread",
          ],
          correctIndex: 0,
          explanation:
            "Net debit = $15.00 - (2 × $8.00) + $3.50 = $2.50 per share = $250 per contract (max loss). Maximum profit occurs at $410 (center strike): Long $400 call worth $10, short $410 calls worthless, long $420 call worthless. Profit = $10.00 - $2.50 cost = $7.50 per share = $750 per contract. Breakevens: $400 + $2.50 = $402.50 and $420 - $2.50 = $417.50.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An iron condor and an iron butterfly are equivalent strategies with the same risk profile.",
          correct: false,
          explanation:
            "An iron butterfly has all four legs at or near the same strike (sell ATM straddle, buy OTM strangle to cap risk). An iron condor has the short strikes separated (sell OTM call and OTM put, buy further OTM wings). The iron butterfly collects more premium and has a higher max profit but a narrower profit zone (the underlying must stay very close to the center strike). The iron condor has a wider profit zone but lower max premium. They serve different purposes — iron butterfly targets the exact current price, condor targets a range.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "SPY is at $455 with 7 days until monthly expiration. The $455 strike has 2.3 million open interest in puts and 1.9 million in calls — the highest of any strike. A trader believes SPY will be 'pinned' near $455 at Friday's expiration due to dealer hedging flows.",
          question: "Which strategy is best suited to this 'pinning' thesis?",
          options: [
            "Long butterfly centered at $455 (buy $445/$455/$465 butterfly) — profits maximally if SPY closes at $455",
            "Long straddle at $455 — profits from large move in either direction away from $455",
            "Long $455 call — benefits from SPY breaking above the pin and rallying",
            "Short iron condor with short strikes far from $455 — benefits from SPY moving away from current level",
          ],
          correctIndex: 0,
          explanation:
            "The long butterfly centered at $455 is the textbook pinning play. It profits maximally when SPY closes at the center strike ($455) at expiration — exactly the pin thesis. The maximum profit zone typically spans about ±5 points from the center strike with 7 days remaining. The straddle benefits from a large move (the opposite of a pin thesis). The directional call bet ignores the pin thesis entirely. The iron condor would benefit from general range-bound trading but does not specifically target the $455 pin.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Greeks Profile and Timing Butterflies",
          content:
            "**Long butterfly Greeks at initiation (center = ATM):**\n- **Delta**: Near zero — directionally neutral when centered at current price\n- **Gamma**: Near zero at initiation; becomes highly positive (near center) and negative (near outer strikes) near expiration\n- **Theta**: Near zero at initiation; turns increasingly positive as expiration approaches (the strategy profits from time passing if the underlying stays near center)\n- **Vega**: Net short — lower IV generally helps long butterflies (cheaper to initiate, and OTM options decay relative to ATM)\n\n**Timing principle**: Butterflies are typically initiated 14-21 DTE to balance premium cost against time for the thesis to play out. Entering too early means paying more extrinsic value. Entering with < 7 DTE means the tent shape has fully formed — large profits are available but only a narrow band of stock prices qualifies.\n\n**Exit discipline**: Most practitioners take 25-50% of max profit early rather than trying to maximize the tent top. The final few days introduce extreme gamma risk — a 1% unexpected move can wipe out accumulated profits instantly.",
          highlight: [
            "long butterfly",
            "theta positive",
            "short vega",
            "14-21 DTE",
            "exit discipline",
          ],
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Synthetic Positions
       ================================================================ */
    {
      id: "options-advanced-5",
      title: "Synthetic Positions",
      description:
        "Synthetic longs, protective puts, covered calls, and put-call parity arbitrage",
      icon: "Repeat",
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "Put-Call Parity: The Foundation of Synthetics",
          content:
            "**Put-call parity** is a no-arbitrage relationship that links European call prices, put prices, the spot price, and the present value of the strike. It is the cornerstone of synthetic position construction.\n\n**Formula:**\n`C - P = S - PV(K)`\n\nWhere:\n- C = Call price (same strike and expiration)\n- P = Put price (same strike and expiration)\n- S = Current spot price\n- PV(K) = Present value of strike K = K × e^(-rT)\n\n**Rearranged to find synthetics:**\n- `C = P + S - PV(K)` → A call equals a long put + long stock + borrowing\n- `P = C - S + PV(K)` → A put equals a long call + short stock + lending\n- `S = C - P + PV(K)` → Stock equals long call + short put + lending\n\n**Example:** AAPL at $195. 90-day $195 call = $10.50, $195 put = $9.80, risk-free rate = 5.2%.\nPV(K) = $195 × e^(-0.052 × 0.25) = $195 × 0.9870 = $192.47\nC - P = $10.50 - $9.80 = $0.70\nS - PV(K) = $195 - $192.47 = $2.53\n\nA discrepancy signals arbitrage. In practice, transaction costs, bid-ask spreads, and borrow costs prevent pure arbitrage, but large deviations are exploited by market makers.",
          highlight: [
            "put-call parity",
            "synthetic",
            "no-arbitrage",
            "PV of strike",
            "risk-free rate",
          ],
        },
        {
          type: "teach",
          title: "Synthetic Long and Short Stock",
          content:
            "A **synthetic long** replicates the payoff of owning 100 shares using only options.\n\n**Synthetic long stock:**\n- **Buy** ATM call + **Sell** ATM put (same strike, same expiration)\n- Net premium ≈ $0 (small debit or credit depending on rates and dividends)\n- P&L: identical to long 100 shares from the strike price down to zero\n\n**Why use a synthetic instead of buying shares?**\n1. **Leverage**: Requires far less capital (just the net premium or margin requirement)\n2. **No borrow cost**: Avoids the stock's actual cost of carry\n3. **Tax treatment**: Potential differences in capital gains classification\n4. **Limited downside definition**: The short put defines your max loss at zero (same as stock anyway)\n\n**Synthetic short stock:**\n- **Sell** ATM call + **Buy** ATM put (same strike, same expiration)\n- Replicates shorting 100 shares\n- Avoids the daily stock borrow cost (particularly valuable for hard-to-borrow stocks with high borrow rates, sometimes 50-100%+ annualized)\n\n**Critical insight**: Market makers use synthetics constantly to arbitrage the relationship between the options market and the stock market — keeping prices aligned across venues.",
          highlight: [
            "synthetic long",
            "synthetic short",
            "leverage",
            "borrow cost",
            "capital efficiency",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "TSLA is at $260. You buy the 60-DTE $260 call for $18.50 and sell the 60-DTE $260 put for $17.80. This creates a synthetic long. What is your effective break-even price on the position?",
          options: [
            "$260.70 (the $260 strike plus the $0.70 net debit)",
            "$241.50 (the $260 strike minus the call premium)",
            "$260.00 (synthetic long always breaks even at the strike)",
            "$278.50 (the $260 strike plus the call premium)",
          ],
          correctIndex: 0,
          explanation:
            "Net debit = $18.50 - $17.80 = $0.70 per share. Breakeven = $260.00 + $0.70 = $260.70. The $0.70 net debit paid represents the cost of carry (interest embedded in the option pricing via put-call parity). If rates were zero and there were no dividends, the synthetic long would be a zero-cost structure and the breakeven would be exactly $260. In the real world, the small debit reflects financing the position through the options market.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Protective Put = Long Stock + Long Put",
          content:
            "A **protective put** is the options equivalent of portfolio insurance — you own the stock and buy a put to define your maximum downside.\n\n**Structure:**\n- Own 100 shares of GOOGL at $170\n- Buy 1x GOOGL $160 put (90 days) for $4.50\n- Total cost basis: $170 + $4.50 = $174.50\n\n**P&L profile:**\n- Above $170: Profits from stock appreciation minus the $4.50 put premium cost\n- Between $160 and $170: Stock loss offset partially; total loss capped\n- Below $160: Total loss capped at $174.50 - $160 = $14.50 regardless of how far GOOGL falls\n\n**Key equivalence (from put-call parity):**\nLong stock + long put = Long call (same strike)\nThis is a profound insight: owning stock with a protective put is economically equivalent to owning a call option. The put transforms the asymmetric downside of stock ownership into a purely call-like payoff structure.\n\n**Cost consideration**: The annualized cost of continuous protection can be expensive. A $4.50 put on a $170 stock = 2.6% for 90 days = ~10.5% annualized. Many institutions use collars (protective put + short call) to reduce the net cost of hedging.",
          highlight: [
            "protective put",
            "portfolio insurance",
            "cost of protection",
            "collar",
            "call equivalence",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A covered call strategy: a portfolio manager owns 1,000 shares of MSFT at $410. She sells 10 contracts of the 30-DTE $430 call at $3.20 each, collecting $3,200. MSFT rallies to $445 at expiration.",
          question: "What is the covered call writer's P&L and what did she give up?",
          options: [
            "Gains $20/share from $410 to $430 cap plus $3.20 premium = $23,200 profit, but gives up $15/share gain from $430 to $445 = $15,000 in opportunity cost",
            "Gains $3,200 premium only because the stock position is called away at breakeven",
            "Loses $15,000 because the calls are assigned and she must sell at $430 below market",
            "Gains the full $35/share move from $410 to $445 plus the $3.20 premium",
          ],
          correctIndex: 0,
          explanation:
            "Covered call P&L: stock appreciated from $410 to $430 (capped by the short call) = $20,000 profit on shares. Short calls expire ITM — she is assigned and sells shares at $430 (or equivalently buys back the calls for $15 each, paying $15,000 to close). Net P&L = $20,000 (stock gain capped at $430) + $3,200 (premium collected) - $15,000 (short call loss above $430) = $8,200. Or equivalently: profit = (cap price - purchase price + premium) × 1000 shares = ($430 - $410 + $3.20) × 1000 = $23,200. The opportunity cost is the $15/share gain from $430 to $445 ($15,000) that was surrendered.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A covered call (long stock + short call) has identical risk to a short put at the same strike, as implied by put-call parity.",
          correct: true,
          explanation:
            "By put-call parity: C - P = S - PV(K). Rearranging: -C + S = -P + PV(K), meaning long stock + short call = short put + lending PV(K). The payoff profiles are equivalent: both strategies profit below the strike up to the premium received (or stock appreciation), and both face the same loss profile if the stock falls dramatically. The covered call feels 'safer' to retail investors because they already own the shares, but the actual P&L profile is economically identical to selling a naked put at the same strike.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 6 — Volatility Trading
       ================================================================ */
    {
      id: "options-advanced-6",
      title: "Volatility Trading",
      description:
        "Long and short vega strategies, vol regime identification, and vol surface arbitrage",
      icon: "Activity",
      xpReward: 130,
      steps: [
        {
          type: "teach",
          title: "Realized vs. Implied Volatility",
          content:
            "**Volatility trading** is fundamentally about the relationship between two quantities:\n\n1. **Implied Volatility (IV)**: The market's forward-looking expectation of how much the underlying will move, extracted from current option prices. It is the market consensus estimate embedded in the Black-Scholes formula.\n\n2. **Realized Volatility (HV/RV)**: How much the underlying actually moved historically, calculated as the annualized standard deviation of daily log returns.\n\n**The volatility risk premium (VRP):**\nHistorically, implied volatility exceeds realized volatility by an average of 2-5 volatility points. This 'fear premium' exists because investors systematically overpay for protection (put options). Selling volatility (short vega strategies) captures this premium over time.\n\n**Calculating IV vs. HV:** If AAPL's 30-day ATM implied volatility is 28% but its realized volatility over the past 30 days was 22%, there is a 6-point VRP. Selling options when IV >> HV is statistically favorable — you are selling an asset priced above its fair value.\n\n**Caution**: The VRP can invert catastrophically during tail events (March 2020 COVID crash: VIX spiked from 15 to 85 in weeks). Short volatility strategies must have defined risk or strict position sizing.",
          highlight: [
            "implied volatility",
            "realized volatility",
            "volatility risk premium",
            "VRP",
            "short vega",
          ],
        },
        {
          type: "teach",
          title: "Long Vega Strategies — Straddles and Strangles",
          content:
            "**Long straddle**: Buy ATM call + Buy ATM put (same strike, same expiration). You profit from large moves in either direction.\n\n**SPY long straddle at $450:**\n- Buy $450 call @ $8.20\n- Buy $450 put @ $7.60\n- Total debit: $15.80 per share = $1,580 per set\n- **Breakevens**: $450 ± $15.80 = **$434.20 (lower) and $465.80 (upper)**\n- Profit if SPY moves more than ±3.5% in either direction\n\n**Long strangle**: Buy OTM call + Buy OTM put. Cheaper than straddle but requires larger move to profit.\n- Buy $440 put @ $4.80 + Buy $460 call @ $4.20 = $9.00 debit\n- Breakevens: $431 (lower) and $469 (upper)\n- Requires ±4.2% move but costs 43% less than the straddle\n\n**When to go long volatility:**\n- IV is low (IV Rank < 20) — options are cheap\n- A major known catalyst is approaching (earnings, FOMC, clinical trial)\n- Historical volatility has been suppressed and you expect mean reversion\n- Positioning for a tail event or black swan",
          highlight: [
            "straddle",
            "strangle",
            "long vega",
            "breakeven",
            "IV Rank",
            "tail event",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "META's 30-DTE ATM IV is 24% and its 30-day realized volatility is 38%. What does this relationship suggest, and which strategy is most appropriate?",
          options: [
            "IV < HV suggests options are cheap; long volatility (straddle/strangle) is appropriate to capture underpriced optionality",
            "IV < HV suggests the market is calm; sell options to collect the volatility risk premium",
            "IV < HV means volatility is overpriced; use an iron condor to profit from elevated premiums",
            "The 14-point gap is too large to be real; IV and HV should never diverge this much",
          ],
          correctIndex: 0,
          explanation:
            "When realized volatility (38%) significantly exceeds implied volatility (24%), options are underpriced relative to the market's actual movement. The market is, paradoxically, underestimating volatility. This is relatively rare (the VRP usually means IV > HV) but occurs after periods of unusual stock-specific activity that hasn't been priced into options. Buying straddles when IV << HV gives you positive expected value — you are buying an asset below its 'fair value' based on recent realized moves. This is the inverse of the typical short-volatility VRP harvest.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "The Volatility Surface and Skew",
          content:
            "The **volatility surface** is a three-dimensional plot of implied volatility as a function of both strike price and expiration. Understanding its shape is essential for professional volatility trading.\n\n**Equity skew (volatility skew):**\nIn equity markets, downside puts (low strikes) trade at higher IV than upside calls (high strikes). This creates a downward-sloping smile when plotted as IV vs. strike — called the **skew** or **smirk**.\n\n**Why does skew exist?**\n1. **Demand imbalance**: Investors systematically buy downside puts for protection, creating excess demand\n2. **Leverage effect**: Falling stock prices increase financial leverage, increasing actual future volatility\n3. **Jump risk**: Stocks can crash overnight (earnings, regulatory, macro); put options price in crash scenarios\n\n**Skew trading strategies:**\n- **Risk reversal (short skew)**: Sell downside put, buy upside call. Profits when skew flattens or reverses.\n- **Put spread**: Buy ATM put, sell OTM put. Benefits from high skew by selling overpriced downside vol.\n- **Skew steepener**: Long OTM puts, short ATM calls — benefits from skew increasing (crisis protection).\n\n**VIX and VIX derivatives**: VIX itself measures the implied volatility of S&P 500 30-day options. VIX futures and options allow direct volatility trading without the underlying equity exposure.",
          highlight: [
            "volatility surface",
            "skew",
            "smirk",
            "risk reversal",
            "VIX",
            "leverage effect",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "In equity markets, OTM put options typically trade at a higher implied volatility than OTM call options at the same distance from the current price.",
          correct: true,
          explanation:
            "This is equity volatility skew. Structural demand for downside protection (portfolio insurance via puts) creates excess demand for OTM puts, pushing their prices and implied volatilities higher than equidistant OTM calls. A put with 5% downside and a call with 5% upside on the same stock will have different IVs — the put consistently trades at 2-8+ vol points higher. This skew is one of the most reliable structural features of equity options markets.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "SPY is at $450. A volatility trader observes: VIX is at 32 (historically elevated, above 90th percentile). The term structure is inverted: 30-day IV = 34%, 90-day IV = 27%. The trader expects the market to calm down over the next month as macro uncertainty fades.",
          question: "Which strategy best captures this 'vol compression' view?",
          options: [
            "Short near-term volatility via an iron condor on SPY expiring in 30 days, collecting fat premiums with the expectation of IV normalization",
            "Long straddle on SPY to profit from continued high realized volatility",
            "Buy VIX calls to benefit from further spike in near-term vol",
            "Sell 90-day SPY straddle to capture the lower but still elevated back-month IV",
          ],
          correctIndex: 0,
          explanation:
            "High VIX (32, 90th percentile) with inverted term structure screams 'sell front-month volatility.' The iron condor on the 30-day expiration collects premium when IV is elevated, benefits from theta decay, and profits from IV mean reversion (IV crush from 34% toward the 90-day 27% level). The term structure inversion means the front month has the most overpriced volatility to sell. The long straddle is the opposite trade — it requires high realized volatility, not just high IV. The VIX call would profit from further spike, not compression.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 7 — Greeks Management
       ================================================================ */
    {
      id: "options-advanced-7",
      title: "Greeks Management",
      description:
        "Delta hedging, gamma scalping, vega neutralization, and portfolio Greeks",
      icon: "Sliders",
      xpReward: 130,
      steps: [
        {
          type: "teach",
          title: "Delta Hedging: The Core of Market Making",
          content:
            "**Delta hedging** is the process of eliminating (or managing) the directional risk of an options position by buying or selling the underlying asset to achieve a delta-neutral portfolio.\n\n**Example:** A market maker sells 100 AAPL call contracts (10,000 options) on the $190 call with delta = 0.42.\n- Portfolio delta = -100 × 100 × 0.42 = **-4,200 delta** (short 4,200 effective shares)\n- To delta-hedge: **Buy 4,200 shares of AAPL** at current price\n- Net portfolio delta = 0\n\n**Why this matters:**\nDelta is not constant — it changes as AAPL moves (that sensitivity is gamma). When AAPL rises from $190 to $192, the $190 call delta increases from 0.42 to ~0.49 (using a gamma of 0.035 per dollar). The portfolio is now:\n- New option delta: -100 × 100 × 0.49 = -4,900\n- Stock hedge: still +4,200 shares\n- Net delta: -700 (short 700 effective shares) — the portfolio is no longer neutral!\n\n**Re-hedging frequency (delta hedge ratio):**\nDynamic delta hedging requires continuous re-balancing as the underlying moves. In practice, large dealers re-hedge every few minutes or when delta drift exceeds a threshold (e.g., ±200 delta). Transaction costs force a trade-off between hedge precision and cost.",
          highlight: [
            "delta hedging",
            "delta-neutral",
            "gamma",
            "re-balancing",
            "market maker",
            "hedge ratio",
          ],
        },
        {
          type: "teach",
          title: "Gamma Scalping: Profiting from Delta Rebalancing",
          content:
            "**Gamma scalping** is the technique of profiting from the continuous re-hedging of a long gamma position. A trader who is long gamma (via long straddles or strangles) collects small profits each time they re-delta-hedge as the underlying moves.\n\n**Mechanics:**\nLong straddle on SPY at $450: delta = 0, gamma = 0.012.\n- SPY rises to $455: new delta = +0.012 × 5 = +0.060 per option, × 100 = +6 delta\n- Sell 600 shares at $455 to re-hedge to delta-zero\n- SPY falls back to $450: delta returns to 0\n- Buy 600 shares back at $450 — profit = 600 × $5 = **$3,000**\n\nThis is the essence of gamma scalping: each oscillation of the underlying generates a small buy-low-sell-high profit from the re-hedging.\n\n**The gamma vs. theta trade-off:**\nLong gamma generates scalping income but is offset by theta decay. If the underlying does not move enough, theta costs exceed gamma profits.\n\n**Break-even volatility formula:**\nFor a long gamma position to be self-financing, realized volatility must exceed the implied volatility paid at entry. This is the fundamental equation of options trading: you are always betting on RV > IV (long gamma) or IV > RV (short gamma).",
          highlight: [
            "gamma scalping",
            "long gamma",
            "delta rebalancing",
            "realized volatility",
            "theta cost",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A market maker is short 500 contracts of the SPY $455 call (delta = 0.50, gamma = 0.018). How many SPY shares does she need to buy to be delta-neutral, and what happens to her delta if SPY rises $3?",
          options: [
            "Buy 25,000 shares; after $3 rise her delta becomes +2,700 (short 2,700 effective shares) requiring purchase of 2,700 more shares",
            "Buy 50,000 shares; after $3 rise her delta becomes neutral automatically",
            "Buy 25,000 shares; after $3 rise her delta becomes -2,700 requiring selling 2,700 shares",
            "Buy 9,000 shares based on gamma; delta is already neutral from the contracts",
          ],
          correctIndex: 0,
          explanation:
            "Short 500 contracts = short 50,000 options. Delta of short position = -50,000 × 0.50 = -25,000 delta (equivalent to being short 25,000 shares). Buy 25,000 SPY shares to hedge. After $3 move: new delta per option = 0.50 + (0.018 × 3) = 0.50 + 0.054 = 0.554. New short option delta = -50,000 × 0.554 = -27,700. Stock hedge still = +25,000. Net delta = +25,000 - 27,700 = -2,700 (she is now short 2,700 effective shares). She needs to buy 2,700 more shares to re-hedge. This continuous buying as the market rises (and selling as it falls) stabilizes prices — a key market-making function.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Vega and Rho Management in Portfolio Context",
          content:
            "Professional options desks manage portfolios of positions, not individual trades. The portfolio-level Greeks determine overall risk.\n\n**Vega neutralization:**\nIf a portfolio is long +5,000 vega (gains $5,000 per 1-point IV increase), a risk manager might:\n- Sell ATM options (high vega) to reduce portfolio vega\n- Sell VIX futures to hedge the vega exposure without touching equity options\n- Use variance swaps (OTC derivatives that pay the difference between realized and implied variance)\n\n**Vanna (delta-vega cross-Greek):**\n`Vanna = ∂delta/∂IV = ∂vega/∂S`\nWhen IV rises, the delta of options changes (ITM options become more/less sensitive). In an equity crash, IV spikes and deep OTM put deltas jump from -0.05 to -0.40 — creating enormous re-hedging demand. This feedback loop amplifies volatility. Understanding vanna helps portfolio managers anticipate dealer re-hedging flows.\n\n**Rho (interest rate sensitivity):**\n`Rho = ∂option price/∂r`\nLong-dated calls are positively affected by rising rates (the forward price is higher); long-dated puts are negatively affected. LEAPS (options 1-2 years out) can have significant rho exposure. In rate-hiking cycles, long calls/short puts benefit, long puts/short calls suffer.",
          highlight: ["vega neutral", "vanna", "rho", "variance swap", "LEAPS", "feedback loop"],
        },
        {
          type: "quiz-tf",
          statement:
            "A long gamma position always profits from large moves in the underlying because gamma scalping profits outweigh all other losses.",
          correct: false,
          explanation:
            "Long gamma is not a free lunch. The profits from gamma scalping are continuously offset by theta decay — the daily erosion in the value of the long options. If realized volatility is equal to the implied volatility paid at entry, the gamma scalping profits exactly equal the theta costs over the life of the position (this is the break-even condition). The position only generates net profit if RV > IV (realized volatility exceeds the implied volatility baked into the purchase price). In low-volatility environments, even large moves may not cover theta costs.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A portfolio manager runs a multi-leg options book with aggregate Greeks: delta = +350, gamma = -12,000, theta = +$4,200/day, vega = -$18,000/point. The VIX rises 4 points overnight due to geopolitical news.",
          question: "What is the estimated P&L impact from the vega exposure, and what action does the portfolio likely need?",
          options: [
            "Vega loss of $72,000 (−$18,000 × 4); manager should buy options (straddles) to reduce the short vega exposure and avoid further losses if IV continues rising",
            "Vega gain of $72,000 because the theta income offsets the vega loss",
            "Vega is irrelevant overnight because the market is closed",
            "Vega loss of $18,000 (only the daily theta offsets the full impact)",
          ],
          correctIndex: 0,
          explanation:
            "Portfolio vega = -$18,000 per vol point. VIX +4 points means estimated vega P&L = -$18,000 × 4 = -$72,000. The theta of +$4,200/day does not offset this — theta accrues slowly over time while vega loss is instantaneous with IV changes. With a large short vega book, the manager should consider buying options (particularly near-dated straddles or back-month calls) to reduce the vega exposure. VIX moves of 4+ points in a single session are a warning sign; in March 2020, VIX moved 10-15 points per day, turning manageable short-vega books into catastrophic losses.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 8 — Earnings Plays
       ================================================================ */
    {
      id: "options-advanced-8",
      title: "Earnings Plays",
      description:
        "Straddles, strangles, implied move calculation, and IV crush management",
      icon: "DollarSign",
      xpReward: 140,
      steps: [
        {
          type: "teach",
          title: "The Implied Move Calculation",
          content:
            "Before any earnings play, calculate the **implied move** — the market's consensus estimate of how far the stock will move post-earnings. This is derived directly from option prices.\n\n**Method 1 — ATM Straddle:**\nThe price of the ATM straddle (call + put at the nearest strike) approximates the expected absolute move:\n`Implied Move % ≈ (ATM Straddle Price) / Stock Price`\n\n**Example — AMZN at $180, earnings in 3 days:**\n- $180 call (weekly) = $6.20\n- $180 put (weekly) = $5.90\n- Straddle = $12.10\n- Implied move = $12.10 / $180 = **6.7%**\nThe market expects AMZN to move approximately ±$12 around earnings.\n\n**Method 2 — Strangle method (for skew):**\nAverage the 1-standard-deviation OTM call and put implied moves, adjusted for skew.\n\n**Historical move vs. implied move:**\nCompare the current implied move against the average post-earnings move over the last 8 quarters. If AMZN's median historical move is 8.5% and the implied move is 6.7%, the straddle is 'cheap' relative to history — potentially favoring buying volatility.",
          highlight: [
            "implied move",
            "ATM straddle",
            "IV crush",
            "historical move",
            "earnings volatility",
          ],
        },
        {
          type: "teach",
          title: "Long Straddle Earnings Play — Buying the Move",
          content:
            "If the implied move underestimates the historical typical earnings move, buying a straddle before earnings is a long volatility play.\n\n**NVDA earnings play (spot $520, 5 days to earnings):**\n- ATM straddle: buy $520 call @ $22.50 + buy $520 put @ $21.00 = $43.50 debit\n- Implied move: $43.50 / $520 = 8.4%\n- NVDA historical median post-earnings move: 11.2%\n\n**The thesis**: NVDA historically moves more than the implied move on earnings, making the straddle 'cheap' by statistical comparison.\n\n**P&L scenarios:**\n- NVDA +12% to $582.40: Call ITM by $62.40, put expires worthless. Net P&L = $62.40 - $43.50 = **+$18.90** (+43%)\n- NVDA -11% to $462.80: Put ITM by $57.20, call expires worthless. Net P&L = $57.20 - $43.50 = **+$13.70** (+31%)\n- NVDA +3%: Call worth $15.60, put worth $0. Net P&L = $15.60 - $43.50 = **-$27.90** (-64%)\n\n**Key risk**: IV crush. After earnings, 30-day IV drops from ~60% to ~28%. Even if the straddle is in-the-money, the collapse in extrinsic value can significantly erode profits on moderate moves.",
          highlight: [
            "long straddle",
            "IV crush",
            "historical vs implied move",
            "extrinsic value",
            "earnings play",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "GOOGL is at $170. The earnings-week ATM straddle ($170 call + $170 put) costs $11.60 total. What is the implied move percentage, and where are the breakeven points?",
          options: [
            "Implied move = 6.8%; breakevens at $158.40 and $181.60",
            "Implied move = 11.6%; breakevens at $155 and $185",
            "Implied move = 3.4%; breakevens at $166.60 and $173.40",
            "Implied move cannot be calculated from the straddle price alone",
          ],
          correctIndex: 0,
          explanation:
            "Implied move = straddle price / stock price = $11.60 / $170 = 6.82% ≈ 6.8%. This means the market expects GOOGL to move approximately ±$11.60 around earnings. Breakevens = $170 ± $11.60 = $158.40 (lower) and $181.60 (upper). The long straddle profits if GOOGL moves more than ±$11.60 in either direction by expiration. The quality of the trade depends on whether the implied 6.8% move is cheap or expensive relative to GOOGL's historical earnings moves.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Short Straddle Earnings Play — Selling IV Crush",
          content:
            "When the implied move significantly exceeds the expected actual move, selling a straddle (or strangle) before earnings monetizes the volatility risk premium.\n\n**AMD earnings play (spot $140, earnings tomorrow):**\n- Historical median post-earnings move: 6.1%\n- ATM straddle price: $12.50 = 8.9% implied move\n- The options are overpriced relative to history → sell the straddle\n\n**Risk management** (critical — naked short straddle has unlimited risk):\n1. **Convert to iron butterfly**: Sell $140 straddle, buy $125 put + $155 call for protection\n   - Net credit reduced but risk fully defined\n2. **Position sizing**: Never risk more than 1-2% of portfolio on a single earnings play\n3. **IV post-earnings typical collapse**: AMD IV drops from ~85% to ~35% post-earnings on average\n\n**P&L if AMD moves only 4%:**\n- Straddle initial value: $12.50\n- Post-earnings straddle value (AMD at $145, IV crushed to 35%): ~$4.80\n- Profit per straddle: $12.50 - $4.80 = **$7.70 per share = $770 per contract** (+62%)\n\nIV crush alone can make short straddles profitable even when the stock moves modestly — the collapse in extrinsic value is often more valuable than the intrinsic gained.",
          highlight: [
            "short straddle",
            "iron butterfly",
            "IV crush",
            "volatility risk premium",
            "earnings premium",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "NFLX reports earnings after the bell. Spot = $620. An options trader buys the weekly $620 straddle for $38.50 (implied move = 6.2%). Historically, NFLX has moved an average of 9.8% post-earnings over the last 8 quarters. NFLX beats earnings and rises 7.2% to $664.64.",
          question: "The trader's long straddle is ITM by $44.64 on the call side. Why might the actual P&L be less than the $6.14 theoretical profit?",
          options: [
            "IV crush: post-earnings IV collapses sharply, destroying the extrinsic value of both options, meaning the $44.64 intrinsic gain on the call is partially offset by the loss of extrinsic value across the full straddle",
            "The put option gained value because NFLX rose above the strike",
            "The straddle automatically converts to a vertical spread post-earnings",
            "Theta decay accumulated over the 5 days before earnings overwhelms the intrinsic gain",
          ],
          correctIndex: 0,
          explanation:
            "The $44.64 move gives $44.64 of intrinsic value on the $620 call. But the original $38.50 straddle included significant extrinsic value in both legs. Post-earnings, IV collapses from ~65% to ~28%. The call has $44.64 intrinsic + ~$3.50 remaining extrinsic (diminished by IV crush) = ~$48.14. The put, once worth $19.25, is now worth near zero (far OTM, IV crushed). Net straddle value ≈ $48.14. P&L = $48.14 - $38.50 = $9.64 per share, better than the simple intrinsic-minus-cost comparison suggests only after accounting for the full IV crush impact. The point is that IV crush reduces but doesn't eliminate profits on a 7.2% move when the implied was 6.2%.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A long straddle purchased immediately before earnings is a pure directional bet — it does not matter what happens to implied volatility after the announcement.",
          correct: false,
          explanation:
            "This is false. A long straddle is primarily a long-volatility position. After earnings, implied volatility typically collapses by 40-60% (IV crush). This destruction of extrinsic value means even a large directional move may not generate the expected profit. A trader who buys a straddle at 70% IV and sees the stock move 8% but IV drop to 25% will find that much of the premium has evaporated. This is why experienced earnings traders explicitly model the expected IV post-crush when pricing the straddle's expected value, not just comparing the move to the straddle price.",
          difficulty: 2,
        },
      ],
    },
  ],
};
