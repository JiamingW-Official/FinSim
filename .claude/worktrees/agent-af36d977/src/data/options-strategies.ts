// Legacy interface used by StrategyBuilder (kept for compatibility)
export interface OptionStrategy {
  name: string;
  legs: { type: "call" | "put"; position: "long" | "short"; strikeOffset: number }[];
  maxProfit: string;
  maxLoss: string;
  breakeven: string;
  bestFor: string;
  marketOutlook: string;
  greeksProfile: { delta: string; gamma: string; theta: string; vega: string };
  riskLevel: number;
  complexity: number;
  educationalNote: string;
}

export const LEGACY_OPTIONS_STRATEGIES: OptionStrategy[] = [
  {
    name: "Long Call",
    legs: [{ type: "call", position: "long", strikeOffset: 0 }],
    maxProfit: "Unlimited. Increases dollar-for-dollar with the stock above the breakeven price at expiration.",
    maxLoss: "Limited to the premium paid for the call option.",
    breakeven: "Strike price + premium paid.",
    bestFor: "Bullish conviction with defined risk. Useful when you expect a significant upward move before expiration.",
    marketOutlook: "Bullish. The more bullish you are, the further out-of-the-money you can buy for greater leverage.",
    greeksProfile: {
      delta: "Positive (0.3 to 0.8 depending on moneyness). Increases as stock rises.",
      gamma: "Positive. Highest when ATM. Delta accelerates as stock moves in your favor.",
      theta: "Negative. Time decay works against you, accelerating near expiration.",
      vega: "Positive. Rising implied volatility increases the option's value.",
    },
    riskLevel: 2,
    complexity: 1,
    educationalNote:
      "Long calls are the most basic bullish options strategy. The key mistake beginners make is buying short-dated, far OTM calls for their cheap price. These have extremely low probability of profit. Prefer ATM or slightly OTM calls with at least 45 days to expiration to give the trade time to work.",
  },
  {
    name: "Long Put",
    legs: [{ type: "put", position: "long", strikeOffset: 0 }],
    maxProfit: "Substantial. Increases as the stock falls toward zero, minus the premium paid.",
    maxLoss: "Limited to the premium paid for the put option.",
    breakeven: "Strike price - premium paid.",
    bestFor: "Bearish conviction or portfolio hedging. Defined risk alternative to shorting stock.",
    marketOutlook: "Bearish. Expect the stock to decline significantly before expiration.",
    greeksProfile: {
      delta: "Negative (-0.3 to -0.8). Becomes more negative as stock falls.",
      gamma: "Positive. Delta accelerates in your favor as stock drops.",
      theta: "Negative. Time decay erodes the option's value daily.",
      vega: "Positive. Rising IV benefits the position, which often occurs during sell-offs.",
    },
    riskLevel: 2,
    complexity: 1,
    educationalNote:
      "Long puts are often cheaper than expected during calm markets because implied volatility is low. However, puts tend to become more expensive precisely when fear rises and you most want protection. Consider buying puts as insurance before you need them, not after a sell-off has already begun.",
  },
  {
    name: "Covered Call",
    legs: [{ type: "call", position: "short", strikeOffset: 2 }],
    maxProfit: "Premium received + (strike price - stock purchase price). Capped at the short strike.",
    maxLoss: "Stock price - premium received. Significant if the stock drops substantially.",
    breakeven: "Stock purchase price - premium received.",
    bestFor: "Generating income on existing long stock positions. Mildly bullish to neutral outlook.",
    marketOutlook: "Neutral to mildly bullish. You expect the stock to trade sideways or rise modestly.",
    greeksProfile: {
      delta: "Positive but reduced (stock delta 1.0 minus call delta). Net delta around 0.3-0.7.",
      gamma: "Negative. The position's delta decreases as the stock rises toward the strike.",
      theta: "Positive. Time decay works in your favor as the short call loses value.",
      vega: "Negative. A rise in IV hurts the position because your short call gains value.",
    },
    riskLevel: 2,
    complexity: 1,
    educationalNote:
      "Covered calls are often called a 'beginner-friendly' income strategy, but understand the tradeoff: you cap your upside in exchange for premium income. If you sell calls too aggressively (close to ATM), you risk having your shares called away during a rally. Sell 30-45 DTE calls at a strike above your cost basis.",
  },
  {
    name: "Protective Put",
    legs: [{ type: "put", position: "long", strikeOffset: -2 }],
    maxProfit: "Unlimited upside on the stock minus the cost of the put.",
    maxLoss: "Limited to (stock price - put strike) + premium paid. The put acts as a floor.",
    breakeven: "Stock purchase price + premium paid.",
    bestFor: "Protecting unrealized gains on a stock position. Insurance against a crash.",
    marketOutlook: "Long-term bullish but concerned about a short-term pullback.",
    greeksProfile: {
      delta: "Positive (stock delta 1.0 plus negative put delta). Net around 0.3-0.7.",
      gamma: "Positive. Protection improves if the stock drops sharply.",
      theta: "Negative. The insurance cost increases over time as the put decays.",
      vega: "Positive. A spike in volatility increases the put's value, offsetting stock losses.",
    },
    riskLevel: 1,
    complexity: 1,
    educationalNote:
      "Protective puts are like buying car insurance: you hope you never need them, but they protect you from catastrophe. The main challenge is cost. Buying puts continuously can significantly reduce returns over time. Use them selectively around earnings, elections, or other high-risk events.",
  },
  {
    name: "Bull Call Spread",
    legs: [
      { type: "call", position: "long", strikeOffset: 0 },
      { type: "call", position: "short", strikeOffset: 2 },
    ],
    maxProfit: "Difference between strikes minus net premium paid.",
    maxLoss: "Limited to the net premium paid (debit).",
    breakeven: "Lower strike + net premium paid.",
    bestFor: "Moderately bullish outlook with a defined risk/reward. Reduces cost versus a naked long call.",
    marketOutlook: "Moderately bullish. You expect the stock to rise to or above the upper strike by expiration.",
    greeksProfile: {
      delta: "Positive but moderate. Less delta than a single long call due to the short leg.",
      gamma: "Low to moderate. The two legs partially offset each other's gamma.",
      theta: "Near neutral initially, becomes slightly positive as the trade moves in the money.",
      vega: "Low. The long and short legs offset most vega exposure.",
    },
    riskLevel: 2,
    complexity: 2,
    educationalNote:
      "Bull call spreads are one of the most capital-efficient ways to express a bullish view. By selling the upper strike call, you reduce cost but cap your gain. Choose strike widths based on your conviction: narrow spreads ($1-2 wide) have lower cost but need precise moves; wide spreads ($5-10) are more forgiving.",
  },
  {
    name: "Bear Put Spread",
    legs: [
      { type: "put", position: "long", strikeOffset: 0 },
      { type: "put", position: "short", strikeOffset: -2 },
    ],
    maxProfit: "Difference between strikes minus net premium paid.",
    maxLoss: "Limited to the net premium paid (debit).",
    breakeven: "Upper strike - net premium paid.",
    bestFor: "Moderately bearish outlook with defined risk. Cheaper than buying a naked put.",
    marketOutlook: "Moderately bearish. Expect the stock to fall to or below the lower strike.",
    greeksProfile: {
      delta: "Negative but moderate. Less negative delta than a single long put.",
      gamma: "Low to moderate. Partially offsetting from the two legs.",
      theta: "Near neutral. The short leg offsets much of the long leg's time decay.",
      vega: "Low. Mostly vega-neutral due to offsetting legs.",
    },
    riskLevel: 2,
    complexity: 2,
    educationalNote:
      "Bear put spreads are the mirror image of bull call spreads. They work best when you have a specific downside target in mind. Place the short put at or near your target price. If the stock stays above your long put strike, you lose the entire premium. Always know your max loss before entering.",
  },
  {
    name: "Iron Condor",
    legs: [
      { type: "put", position: "short", strikeOffset: -2 },
      { type: "put", position: "long", strikeOffset: -4 },
      { type: "call", position: "short", strikeOffset: 2 },
      { type: "call", position: "long", strikeOffset: 4 },
    ],
    maxProfit: "Limited to the net premium received when entering the trade.",
    maxLoss: "Width of one spread minus the net premium received.",
    breakeven: "Lower short strike - premium received AND upper short strike + premium received. Two breakeven points.",
    bestFor: "Range-bound markets with elevated implied volatility. Income generation.",
    marketOutlook: "Neutral. You expect the stock to stay within a defined range through expiration.",
    greeksProfile: {
      delta: "Near zero. The position is roughly delta-neutral at inception.",
      gamma: "Negative. Rapid stock movement in either direction hurts the position.",
      theta: "Positive. Time decay benefits the position as all options lose value.",
      vega: "Negative. A drop in IV benefits the position as the short options lose value.",
    },
    riskLevel: 3,
    complexity: 3,
    educationalNote:
      "Iron condors are the bread and butter of income-oriented options traders. The key is strike selection: wider short strikes give higher probability of profit but less premium. Target 30-45 DTE and 1 standard deviation for the short strikes. Always manage early if the position reaches 50% of max profit.",
  },
  {
    name: "Iron Butterfly",
    legs: [
      { type: "put", position: "short", strikeOffset: 0 },
      { type: "put", position: "long", strikeOffset: -3 },
      { type: "call", position: "short", strikeOffset: 0 },
      { type: "call", position: "long", strikeOffset: 3 },
    ],
    maxProfit: "Net premium received. Achieved if the stock closes exactly at the short strikes at expiration.",
    maxLoss: "Width of one spread minus net premium received.",
    breakeven: "Short strike - premium received AND short strike + premium received.",
    bestFor: "Pinning action expected. High IV with an expectation the stock will not move much.",
    marketOutlook: "Very neutral. You expect the stock to stay very close to the current price.",
    greeksProfile: {
      delta: "Near zero at inception. Becomes directional as the stock moves away from the short strike.",
      gamma: "Highly negative. This is the biggest risk. Fast moves are very costly.",
      theta: "Strongly positive. Maximum time decay benefit of any common spread.",
      vega: "Strongly negative. Wants IV to drop. Best entered when IV is elevated.",
    },
    riskLevel: 3,
    complexity: 3,
    educationalNote:
      "Iron butterflies collect more premium than iron condors but have a much narrower profit zone. They are best used when you expect a stock to pin at a specific level, such as a round number or max pain level near expiration. Manage aggressively if the stock moves away from center.",
  },
  {
    name: "Long Straddle",
    legs: [
      { type: "call", position: "long", strikeOffset: 0 },
      { type: "put", position: "long", strikeOffset: 0 },
    ],
    maxProfit: "Unlimited to the upside. Substantial to the downside (stock can go to zero).",
    maxLoss: "Limited to the total premium paid for both options.",
    breakeven: "Strike + total premium AND strike - total premium. Two breakeven points.",
    bestFor: "Expecting a large move in either direction. Earnings plays, binary events, FDA decisions.",
    marketOutlook: "Neutral on direction but expecting high volatility. The bigger the move, the better.",
    greeksProfile: {
      delta: "Near zero initially. Becomes positive or negative depending on stock direction.",
      gamma: "Highly positive. You benefit from acceleration as the stock moves in either direction.",
      theta: "Highly negative. Time decay is your worst enemy. Both options bleed value daily.",
      vega: "Highly positive. A rise in IV benefits both legs significantly.",
    },
    riskLevel: 3,
    complexity: 2,
    educationalNote:
      "Straddles are often used around earnings, but beware: the market prices expected moves into options before events. If the stock moves less than expected (even if it moves a lot in absolute terms), you can lose money. Check the implied move versus historical moves before entering. Buying straddles when IV is already elevated is usually a losing proposition.",
  },
  {
    name: "Long Strangle",
    legs: [
      { type: "call", position: "long", strikeOffset: 2 },
      { type: "put", position: "long", strikeOffset: -2 },
    ],
    maxProfit: "Unlimited to the upside. Substantial to the downside.",
    maxLoss: "Limited to the total premium paid. Cheaper than a straddle.",
    breakeven: "Upper strike + total premium AND lower strike - total premium.",
    bestFor: "Expecting a very large move in either direction. Cheaper alternative to a straddle.",
    marketOutlook: "Neutral on direction but expecting a very significant price swing.",
    greeksProfile: {
      delta: "Near zero. Both legs are OTM so neither has high delta initially.",
      gamma: "Positive but lower than a straddle since both legs are OTM.",
      theta: "Negative. Both OTM options decay, though less dollar amount than a straddle.",
      vega: "Positive. Benefits from rising IV.",
    },
    riskLevel: 3,
    complexity: 2,
    educationalNote:
      "Strangles require an even bigger move than straddles to be profitable because both options start out-of-the-money. However, they cost less. A common mistake is buying strangles too far OTM to save money, which dramatically reduces the probability of profit. Keep strikes within 1 standard deviation.",
  },
  {
    name: "Calendar Spread",
    legs: [
      { type: "call", position: "short", strikeOffset: 0 },
      { type: "call", position: "long", strikeOffset: 0 },
    ],
    maxProfit: "Occurs when the stock is at the strike price at the near-term expiration. The near-term option decays faster than the long-term option.",
    maxLoss: "Limited to the net debit paid. Lost if the stock moves far from the strike.",
    breakeven: "Depends on the IV of the back-month option at the front-month's expiration. Approximately strike price plus or minus the net debit.",
    bestFor: "Neutral outlook with an expectation that the stock will trade near a specific price. Exploiting time decay differential.",
    marketOutlook: "Neutral. You want the stock to stay near the strike price.",
    greeksProfile: {
      delta: "Near zero at inception. Becomes directional as the stock moves.",
      gamma: "Slightly negative. Front-month short gamma slightly exceeds back-month long gamma.",
      theta: "Positive. The front-month option decays faster than the back-month.",
      vega: "Positive. Rising IV benefits the trade because the back-month option has more vega.",
    },
    riskLevel: 2,
    complexity: 3,
    educationalNote:
      "Calendar spreads profit from the differential time decay between a near-term and far-term option at the same strike. They also benefit from rising IV. Ideal entry is when front-month IV is relatively high compared to back-month IV. Close the trade when the front month expires or at 25-50% profit.",
  },
  {
    name: "Diagonal Spread",
    legs: [
      { type: "call", position: "short", strikeOffset: 2 },
      { type: "call", position: "long", strikeOffset: 0 },
    ],
    maxProfit: "Occurs when the stock is at the short strike at the near-term expiration. Combines directional bias with time decay.",
    maxLoss: "Limited to the net debit paid if the stock drops significantly.",
    breakeven: "Depends on the remaining value of the back-month option. Roughly lower strike plus net debit.",
    bestFor: "Mildly bullish outlook with an income component. Combines calendar spread with a directional bias.",
    marketOutlook: "Mildly bullish. You want the stock to rise gradually to the short strike.",
    greeksProfile: {
      delta: "Slightly positive. The ITM/ATM long call has more delta than the OTM short call.",
      gamma: "Low. The different expirations smooth out gamma exposure.",
      theta: "Positive. Benefits from differential time decay.",
      vega: "Positive. The longer-dated option has more vega sensitivity.",
    },
    riskLevel: 2,
    complexity: 3,
    educationalNote:
      "Diagonal spreads are sometimes called 'poor man's covered calls' because they mimic covered call behavior using a LEAPS call instead of stock. The LEAPS call costs a fraction of the stock price. Buy a deep ITM call (70+ delta) with 6-12 months to expiry, and sell near-term OTM calls against it monthly.",
  },
  {
    name: "Ratio Call Spread",
    legs: [
      { type: "call", position: "long", strikeOffset: 0 },
      { type: "call", position: "short", strikeOffset: 2 },
      { type: "call", position: "short", strikeOffset: 2 },
    ],
    maxProfit: "Difference between strikes plus net credit (or minus net debit). Achieved at the short strike at expiration.",
    maxLoss: "Unlimited above the short strikes because you are net short one call.",
    breakeven: "Lower strike + net debit (if any) AND upper short strike + max profit amount.",
    bestFor: "Moderately bullish outlook with a specific target. Can be entered for zero cost or a credit.",
    marketOutlook: "Moderately bullish with a ceiling. You expect the stock to rise to but not far beyond the short strike.",
    greeksProfile: {
      delta: "Positive initially but decreases and can turn negative if the stock rises too far.",
      gamma: "Turns negative as the stock approaches the short strikes.",
      theta: "Positive once the stock is between the strikes. Benefits from time decay on the extra short leg.",
      vega: "Can be negative, especially as the stock rises. Rising IV hurts the extra short leg.",
    },
    riskLevel: 4,
    complexity: 4,
    educationalNote:
      "Ratio spreads have naked option risk because you sell more options than you buy. The extra short call creates unlimited upside risk. Only use this strategy if you have strong conviction the stock will not rally far above your short strike. Always have a plan to manage the position if the stock surges.",
  },
  {
    name: "Collar",
    legs: [
      { type: "put", position: "long", strikeOffset: -2 },
      { type: "call", position: "short", strikeOffset: 2 },
    ],
    maxProfit: "Capped at the short call strike - stock price + net premium (or minus net cost).",
    maxLoss: "Limited to stock price - long put strike + net cost of collar.",
    breakeven: "Stock purchase price adjusted by the net credit or debit of the options.",
    bestFor: "Protecting a stock position while reducing the cost of protection. Conservative hedging.",
    marketOutlook: "Neutral to mildly bullish. Willing to cap upside in exchange for downside protection.",
    greeksProfile: {
      delta: "Positive but reduced. Net delta of stock + put + short call is typically 0.3-0.6.",
      gamma: "Low. The long put and short call partially offset each other's gamma.",
      theta: "Near neutral. The short call's positive theta offsets the long put's negative theta.",
      vega: "Near neutral. The legs offset each other's vega exposure.",
    },
    riskLevel: 1,
    complexity: 2,
    educationalNote:
      "Collars are popular among executives and concentrated stockholders because they provide defined risk in both directions. A zero-cost collar means the put premium equals the call premium. The trade-off is clear: you sacrifice upside potential for downside protection. Think of it as portfolio insurance with a deductible.",
  },
  {
    name: "Jade Lizard",
    legs: [
      { type: "put", position: "short", strikeOffset: -3 },
      { type: "call", position: "short", strikeOffset: 2 },
      { type: "call", position: "long", strikeOffset: 4 },
    ],
    maxProfit: "Net premium received. Achieved if the stock stays between the short put and short call strikes.",
    maxLoss: "To the downside: short put strike - premium received. No upside risk if structured correctly (premium > call spread width).",
    breakeven: "Short put strike - net premium received.",
    bestFor: "Neutral to mildly bullish outlook. Eliminates upside risk that exists in a short strangle.",
    marketOutlook: "Neutral to slightly bullish. Comfortable selling downside risk but want upside protection.",
    greeksProfile: {
      delta: "Slightly positive. The short put has more delta impact than the call spread.",
      gamma: "Negative. Short gamma from the put and call spread.",
      theta: "Positive. Benefits from time decay on all short premium.",
      vega: "Negative. Wants IV to decrease.",
    },
    riskLevel: 3,
    complexity: 4,
    educationalNote:
      "The jade lizard is a creative strategy that combines a short put with a call credit spread. When structured so the total premium exceeds the call spread width, there is zero risk to the upside. The only risk is the stock falling below the short put. This makes it an improved version of a short strangle.",
  },
  {
    name: "Short Straddle",
    legs: [
      { type: "call", position: "short", strikeOffset: 0 },
      { type: "put", position: "short", strikeOffset: 0 },
    ],
    maxProfit: "Limited to the total premium received. Achieved if the stock closes exactly at the strike at expiration.",
    maxLoss: "Unlimited to the upside. Substantial to the downside (stock to zero minus premium).",
    breakeven: "Strike + total premium AND strike - total premium.",
    bestFor: "High IV environments where you expect the stock to stay near its current price. Premium collection.",
    marketOutlook: "Very neutral. You are betting the stock will not move significantly.",
    greeksProfile: {
      delta: "Near zero. Roughly delta-neutral at inception.",
      gamma: "Highly negative. The greatest risk factor. Large moves are very painful.",
      theta: "Highly positive. Maximum time decay income of any basic strategy.",
      vega: "Highly negative. Wants IV to collapse. Ideal after an IV spike.",
    },
    riskLevel: 5,
    complexity: 2,
    educationalNote:
      "Short straddles have unlimited risk and are only appropriate for experienced traders with strict risk management. The high premium collected can be psychologically appealing but one large move can wipe out months of gains. Always have a defined exit plan and never let a losing straddle run unchecked.",
  },
  {
    name: "Short Strangle",
    legs: [
      { type: "call", position: "short", strikeOffset: 2 },
      { type: "put", position: "short", strikeOffset: -2 },
    ],
    maxProfit: "Limited to the total premium received.",
    maxLoss: "Unlimited to the upside. Substantial to the downside.",
    breakeven: "Upper strike + total premium AND lower strike - total premium.",
    bestFor: "High IV environments. Wider profit zone than a straddle but less premium collected.",
    marketOutlook: "Neutral. You expect the stock to stay within the range of the short strikes.",
    greeksProfile: {
      delta: "Near zero. Both OTM options contribute minimal delta.",
      gamma: "Negative. Large moves in either direction hurt the position.",
      theta: "Positive. Both options decay, providing daily income.",
      vega: "Negative. Benefits from a decrease in implied volatility.",
    },
    riskLevel: 5,
    complexity: 2,
    educationalNote:
      "Short strangles offer a wider profit zone than straddles in exchange for less premium. The 1 standard deviation strangle (roughly 16 delta on each side) is a popular setup with about a 68% theoretical probability of profit. Despite this high probability, the unlimited risk means that position sizing and active management are essential.",
  },
  {
    name: "Put Credit Spread",
    legs: [
      { type: "put", position: "short", strikeOffset: -1 },
      { type: "put", position: "long", strikeOffset: -3 },
    ],
    maxProfit: "Limited to the net premium received.",
    maxLoss: "Width of the spread minus the net premium received.",
    breakeven: "Short put strike - net premium received.",
    bestFor: "Mildly bullish to neutral outlook. Income generation with defined risk.",
    marketOutlook: "Neutral to bullish. You expect the stock to stay above the short put strike.",
    greeksProfile: {
      delta: "Positive. You benefit from the stock rising or staying flat.",
      gamma: "Negative. Accelerating downside movement hurts more as the stock drops.",
      theta: "Positive. Time decay works in your favor.",
      vega: "Negative. Decreasing IV benefits the position.",
    },
    riskLevel: 2,
    complexity: 2,
    educationalNote:
      "Put credit spreads (also called bull put spreads) are one of the most popular income strategies. They profit from time decay, the stock moving up, or IV decreasing. Key tip: choose the short strike below a strong support level. Close at 50% of max profit or 21 DTE, whichever comes first, to manage risk efficiently.",
  },
  {
    name: "Call Credit Spread",
    legs: [
      { type: "call", position: "short", strikeOffset: 1 },
      { type: "call", position: "long", strikeOffset: 3 },
    ],
    maxProfit: "Limited to the net premium received.",
    maxLoss: "Width of the spread minus the net premium received.",
    breakeven: "Short call strike + net premium received.",
    bestFor: "Mildly bearish to neutral outlook. Income generation with defined risk.",
    marketOutlook: "Neutral to bearish. You expect the stock to stay below the short call strike.",
    greeksProfile: {
      delta: "Negative. You benefit from the stock falling or staying flat.",
      gamma: "Negative. Accelerating upside movement hurts as the stock rises.",
      theta: "Positive. Time decay benefits you.",
      vega: "Negative. Decreasing IV is favorable.",
    },
    riskLevel: 2,
    complexity: 2,
    educationalNote:
      "Call credit spreads (bear call spreads) are the bearish counterpart to put credit spreads. Place the short strike above a strong resistance level. These work especially well after a stock has rallied sharply and you expect it to consolidate or pull back. Manage at 50% profit or 21 DTE.",
  },
  {
    name: "Long Call Butterfly",
    legs: [
      { type: "call", position: "long", strikeOffset: -2 },
      { type: "call", position: "short", strikeOffset: 0 },
      { type: "call", position: "short", strikeOffset: 0 },
      { type: "call", position: "long", strikeOffset: 2 },
    ],
    maxProfit: "Width of one wing minus net debit paid. Achieved if stock closes exactly at the middle strike.",
    maxLoss: "Limited to the net debit paid.",
    breakeven: "Lower strike + net debit AND upper strike - net debit.",
    bestFor: "Pinning trades near expiration. Low-cost speculation on a specific target price.",
    marketOutlook: "Very neutral. You expect the stock to close at or very near a specific price.",
    greeksProfile: {
      delta: "Near zero at inception. Becomes directional as stock moves away from center.",
      gamma: "Negative near expiration (short gamma from the two center options).",
      theta: "Positive near expiration if the stock is near the center strike.",
      vega: "Slightly negative. Benefits from decreasing IV.",
    },
    riskLevel: 2,
    complexity: 3,
    educationalNote:
      "Butterflies offer an excellent risk-to-reward ratio because your max loss is the small debit paid. However, the profit zone is narrow. They work best as expiration trades when you have a specific price target. Consider entering 7-14 DTE at max pain or a round number. The cheap cost allows you to speculate without significant risk.",
  },
  {
    name: "Broken Wing Butterfly",
    legs: [
      { type: "put", position: "long", strikeOffset: -4 },
      { type: "put", position: "short", strikeOffset: -1 },
      { type: "put", position: "short", strikeOffset: -1 },
      { type: "put", position: "long", strikeOffset: 0 },
    ],
    maxProfit: "Width of the narrow wing minus net debit (or plus net credit if entered for a credit).",
    maxLoss: "Width of the wide wing minus the max profit, on the broken wing side. No risk (or profit) on the other side.",
    breakeven: "Depends on the specific strike placement and whether entered for credit or debit.",
    bestFor: "Directional butterfly with reduced or zero risk on one side. Advanced income strategy.",
    marketOutlook: "Mildly directional. You eliminate risk on one side in exchange for wider risk on the other.",
    greeksProfile: {
      delta: "Slightly directional depending on the skew of the wings.",
      gamma: "Negative near the short strikes.",
      theta: "Positive if the stock stays between the short strikes.",
      vega: "Slightly negative.",
    },
    riskLevel: 3,
    complexity: 4,
    educationalNote:
      "Broken wing butterflies are a favorite among professional traders because they can be structured for zero risk on one side. By making one wing wider than the other, you shift risk to one direction. This is useful when you have a directional lean but want the characteristics of a butterfly.",
  },
  {
    name: "Short Put (Cash Secured)",
    legs: [{ type: "put", position: "short", strikeOffset: -2 }],
    maxProfit: "Limited to the premium received.",
    maxLoss: "Put strike price minus premium received (the stock could go to zero). Substantial.",
    breakeven: "Strike price - premium received.",
    bestFor: "Acquiring stock at a lower price while earning premium. Bullish on the underlying.",
    marketOutlook: "Bullish to neutral. You would be happy to own the stock at the strike price.",
    greeksProfile: {
      delta: "Positive. You benefit from the stock staying flat or rising.",
      gamma: "Negative. Accelerating downside movement increases your delta exposure.",
      theta: "Positive. Time decay works in your favor.",
      vega: "Negative. Decreasing IV benefits you.",
    },
    riskLevel: 3,
    complexity: 1,
    educationalNote:
      "Cash-secured puts are a systematic way to buy stocks at a discount. Sell puts at a strike price where you would happily own the stock. If assigned, your effective purchase price is the strike minus the premium. If not assigned, you keep the premium as income. Warren Buffett has used this approach with large positions.",
  },
  {
    name: "Long Put Butterfly",
    legs: [
      { type: "put", position: "long", strikeOffset: -2 },
      { type: "put", position: "short", strikeOffset: 0 },
      { type: "put", position: "short", strikeOffset: 0 },
      { type: "put", position: "long", strikeOffset: 2 },
    ],
    maxProfit: "Width of one wing minus net debit. Achieved if stock closes at the middle strike at expiration.",
    maxLoss: "Limited to the net debit paid.",
    breakeven: "Lower strike + net debit AND upper strike - net debit.",
    bestFor: "Bearish pinning trades. Low-cost bearish speculation on a specific target.",
    marketOutlook: "Neutral to slightly bearish. Targeting a specific price near the center strike.",
    greeksProfile: {
      delta: "Near zero at inception.",
      gamma: "Negative near the short strikes as expiration approaches.",
      theta: "Positive if the stock is near the center strike.",
      vega: "Slightly negative.",
    },
    riskLevel: 2,
    complexity: 3,
    educationalNote:
      "Put butterflies function identically to call butterflies in terms of profit profile. The choice between call and put butterflies often comes down to pricing efficiency and bid-ask spreads. In practice, use whichever type offers tighter spreads and better fills for your target price.",
  },
  {
    name: "Double Diagonal",
    legs: [
      { type: "put", position: "short", strikeOffset: -2 },
      { type: "put", position: "long", strikeOffset: -2 },
      { type: "call", position: "short", strikeOffset: 2 },
      { type: "call", position: "long", strikeOffset: 2 },
    ],
    maxProfit: "Depends on the IV of the back-month options at front-month expiration. Typically limited but can be significant with favorable IV movement.",
    maxLoss: "Limited to the net debit paid.",
    breakeven: "Complex. Depends on the back-month option values at front-month expiration.",
    bestFor: "Neutral outlook with rising IV expectations. Combines two diagonal spreads.",
    marketOutlook: "Neutral. You expect the stock to stay within a range and IV to remain stable or rise.",
    greeksProfile: {
      delta: "Near zero. The position is roughly delta-neutral.",
      gamma: "Slightly negative from the front-month short options.",
      theta: "Positive. Front-month options decay faster than back-month.",
      vega: "Positive. Rising IV benefits the back-month options more than the front-month.",
    },
    riskLevel: 3,
    complexity: 5,
    educationalNote:
      "Double diagonals combine two calendar-like trades. They benefit from time decay and rising IV simultaneously. The complexity of managing four legs across two expirations means this strategy is best for experienced traders with options analytics tools. Close the front month and re-sell or close the entire position at 25-50% profit.",
  },
];

// ─── New comprehensive strategy encyclopedia ─────────────────────────────────

export type MarketSentiment = "bullish" | "bearish" | "neutral" | "volatile" | "calm";

export interface OptionsStrategy {
  id: string;
  name: string;
  category: "basic" | "spread" | "income" | "complex" | "synthetic";
  sentiment: MarketSentiment[];
  description: string;
  construction: string;
  maxProfit: string;
  maxLoss: string;
  breakeven: string;
  idealConditions: string;
  risks: string;
  greeksProfile: {
    delta: "positive" | "negative" | "neutral" | "varies";
    gamma: "positive" | "negative" | "neutral";
    theta: "positive" | "negative" | "neutral";
    vega: "positive" | "negative" | "neutral";
  };
  difficulty: 1 | 2 | 3 | 4 | 5;
  realWorldExample: string;
  // ─── Enhanced fields ────────────────────────────────────────────────────────
  setup: string;                // ideal market conditions (concise)
  whenToUse: string;            // trigger conditions for entering the trade
  riskLevel: 1 | 2 | 3 | 4 | 5; // 1 = lowest risk, 5 = highest
  capitalRequired: "low" | "medium" | "high";
  experienceLevel: "beginner" | "intermediate" | "advanced";
  commonMistakes: string;
  examplePnL: string;           // concrete $ P&L scenario
}

export const OPTIONS_STRATEGIES: OptionsStrategy[] = [
  // ─── BASIC ──────────────────────────────────────────────────────────────────
  {
    id: "long-call",
    name: "Long Call",
    category: "basic",
    sentiment: ["bullish", "volatile"],
    description:
      "Purchase the right to buy 100 shares at the strike price before expiration. Profits when the stock rises significantly above the strike.",
    construction: "Buy 1 call at chosen strike",
    maxProfit: "Unlimited (as stock rises)",
    maxLoss: "Premium paid",
    breakeven: "Strike + Premium paid",
    idealConditions:
      "Strong directional conviction to the upside. IV relatively low (cheap premium). Catalyst event expected — earnings beat, product launch, FDA approval.",
    risks:
      "Theta decay erodes value daily. IV crush post-earnings can wipe gains even if stock moves up. Wrong timing = full loss of premium.",
    greeksProfile: {
      delta: "positive",
      gamma: "positive",
      theta: "negative",
      vega: "positive",
    },
    difficulty: 1,
    realWorldExample:
      "Buy NVDA $500 call (30 DTE) for $12 premium ahead of an AI chip demand report. If NVDA reaches $530, the call is worth ~$30, a 150% return on premium.",
    setup: "Low IV, upcoming catalyst, strong uptrend momentum",
    whenToUse: "IV Rank below 30%, clear bullish catalyst within 30–45 days, stock above key moving averages",
    riskLevel: 2,
    capitalRequired: "low",
    experienceLevel: "beginner",
    commonMistakes: "Buying too far OTM for cheapness (low delta = low probability). Buying with less than 21 DTE, leaving no time for the move. Holding through IV crush after earnings.",
    examplePnL: "Buy 1 NVDA $500 call for $12 ($1,200 total). Stock rises to $530: call worth ~$30 → gain $1,800 (+150%). Stock stays flat at $500: call worth ~$4 at 7 DTE → loss $800 (-67%).",
  },
  {
    id: "long-put",
    name: "Long Put",
    category: "basic",
    sentiment: ["bearish", "volatile"],
    description:
      "Purchase the right to sell 100 shares at the strike price before expiration. Profits when the stock falls below the strike.",
    construction: "Buy 1 put at chosen strike",
    maxProfit: "Strike - Premium (stock goes to zero)",
    maxLoss: "Premium paid",
    breakeven: "Strike - Premium paid",
    idealConditions:
      "Bearish conviction or portfolio hedge. IV is low relative to historical norms. Macro deterioration, earnings miss anticipated, sector rotation out.",
    risks:
      "Full premium loss if stock stays flat or rises. Theta decay is relentless — wrong timing is expensive. IV spike can help even before big move.",
    greeksProfile: {
      delta: "negative",
      gamma: "positive",
      theta: "negative",
      vega: "positive",
    },
    difficulty: 1,
    realWorldExample:
      "Buy META $400 put (21 DTE) for $8 before a regulatory hearing. If META drops to $375, the put is worth ~$25+, a 3x return on premium.",
    setup: "Low IV, stock near resistance or breaking down, bearish macro backdrop",
    whenToUse: "Stock rolling over from a key level, IV Rank below 35%, downside catalyst approaching, or as a hedge on an existing long portfolio",
    riskLevel: 2,
    capitalRequired: "low",
    experienceLevel: "beginner",
    commonMistakes: "Buying puts after a big drop when IV has already spiked (paying up for fear). Choosing expirations under 14 DTE. Not accounting for the 'insurance premium' cost over time.",
    examplePnL: "Buy 1 META $400 put for $8 ($800 total). Stock falls to $375: put worth ~$25 → gain $1,700 (+212%). Stock rebounds to $410: put expires worthless → loss $800 (-100%).",
  },
  {
    id: "short-call",
    name: "Short (Naked) Call",
    category: "basic",
    sentiment: ["bearish", "calm"],
    description:
      "Sell the right for someone else to buy shares from you at the strike. Collects premium upfront; profits when stock stays below strike.",
    construction: "Sell 1 call at chosen strike (uncovered)",
    maxProfit: "Premium collected",
    maxLoss: "Unlimited (as stock rises)",
    breakeven: "Strike + Premium collected",
    idealConditions:
      "Bearish or neutral outlook with high IV (premium rich). Stock near resistance level. Use only in margin accounts with strong risk management.",
    risks:
      "Theoretically unlimited loss if stock gaps up. Assignment risk increases as contract goes deep ITM. Requires margin collateral.",
    greeksProfile: {
      delta: "negative",
      gamma: "negative",
      theta: "positive",
      vega: "negative",
    },
    difficulty: 4,
    realWorldExample:
      "Sell TSLA $280 call when IV rank is 80+ and stock is range-bound near $260. Collect $6 premium; keep it if TSLA stays below $280 at expiry.",
    setup: "High IV, stock at or below resistance, bearish or neutral directional bias",
    whenToUse: "IV Rank above 60%, stock has failed to break resistance multiple times, no upcoming bullish catalysts",
    riskLevel: 5,
    capitalRequired: "medium",
    experienceLevel: "advanced",
    commonMistakes: "No defined exit plan when stock gaps above strike. Selling calls without margin cushion. Underestimating gap risk on catalysts.",
    examplePnL: "Sell 1 TSLA $280 call for $6 ($600 credit). TSLA stays at $262: keep full $600 profit (+100%). TSLA gaps to $300 at earnings: loss ~$1,400 net (bought back at $20).",
  },
  {
    id: "short-put",
    name: "Short (Naked) Put",
    category: "basic",
    sentiment: ["bullish", "calm"],
    description:
      "Sell the right for someone else to sell shares to you at the strike. Collects premium; profits when stock stays above strike.",
    construction: "Sell 1 put at chosen strike (uncovered)",
    maxProfit: "Premium collected",
    maxLoss: "Strike - Premium (stock goes to zero)",
    breakeven: "Strike - Premium collected",
    idealConditions:
      "Bullish or neutral outlook. High IV environment — collect rich premium. Would be comfortable owning shares at the strike (value level).",
    risks:
      "Obligated to buy 100 shares at strike if assigned. Large loss potential if stock crashes. Requires substantial margin.",
    greeksProfile: {
      delta: "positive",
      gamma: "negative",
      theta: "positive",
      vega: "negative",
    },
    difficulty: 3,
    realWorldExample:
      "Sell AAPL $170 put for $4 when stock trades at $185 and IV is elevated. If AAPL stays above $170 at expiry, keep $400. If assigned, effective cost basis is $166.",
    setup: "High IV, stock above a support level, neutral-to-bullish directional view",
    whenToUse: "IV Rank above 50%, stock is pulling back to a known support, comfortable buying stock at the strike if assigned",
    riskLevel: 4,
    capitalRequired: "high",
    experienceLevel: "advanced",
    commonMistakes: "Selling puts too close to ATM in a downtrending market. Ignoring assignment risk on ex-dividend dates. Sizing too large — being forced to take assignment on a position you can't hold.",
    examplePnL: "Sell 1 AAPL $170 put for $4 ($400 credit). AAPL stays at $185: keep $400 (+100% on premium). AAPL drops to $155: loss ~$1,100 net after buyback (stop triggered at 2× premium).",
  },
  {
    id: "cash-secured-put",
    name: "Cash-Secured Put",
    category: "basic",
    sentiment: ["bullish", "calm"],
    description:
      "Sell an OTM put while holding enough cash to buy 100 shares if assigned. A conservative way to generate income or acquire shares at a discount.",
    construction: "Sell 1 OTM put + hold cash equal to (Strike × 100) in account",
    maxProfit: "Premium collected",
    maxLoss: "Strike × 100 - Premium (stock goes to zero, offset by cash)",
    breakeven: "Strike - Premium collected",
    idealConditions:
      "Willing to own the stock at the strike price. Stock is near a support level. IV is elevated, inflating premium collected.",
    risks:
      "Assignment during sharp selloff means buying a falling stock. Opportunity cost of tying up cash. Better premium available with short put in margin account.",
    greeksProfile: {
      delta: "positive",
      gamma: "negative",
      theta: "positive",
      vega: "negative",
    },
    difficulty: 2,
    realWorldExample:
      "Sell MSFT $380 put (30 DTE) for $5 when stock is at $400. Set aside $38,000 cash. If assigned, effective cost basis is $375 — a 6% discount to current price.",
    setup: "Elevated IV, stock near a strong support level, bullish long-term thesis",
    whenToUse: "IV Rank above 40%, stock you genuinely want to own at a lower price, cash available to cover assignment without margin stress",
    riskLevel: 3,
    capitalRequired: "high",
    experienceLevel: "beginner",
    commonMistakes: "Selling puts in stocks you don't actually want to own. Ignoring the large capital tie-up (strike × 100). Not rolling the short put when the stock approaches the strike.",
    examplePnL: "Sell 1 MSFT $380 put for $5 ($500 credit, $38,000 cash secured). MSFT stays at $400: keep $500 → 1.3% cash return in 30 days. MSFT falls to $360: assigned at $380, effective cost $375, paper loss $1,500 on position.",
  },

  // ─── SPREADS ─────────────────────────────────────────────────────────────────
  {
    id: "bull-call-spread",
    name: "Bull Call Spread",
    category: "spread",
    sentiment: ["bullish"],
    description:
      "Buy a lower-strike call and sell a higher-strike call at the same expiry. Reduces cost vs. naked long call but caps upside.",
    construction: "Buy 1 lower-strike call, Sell 1 higher-strike call (same expiry)",
    maxProfit: "Width of spread - Net debit paid",
    maxLoss: "Net debit paid",
    breakeven: "Lower strike + Net debit",
    idealConditions:
      "Moderately bullish — expect stock to rise to but not far beyond the short strike. Reduces premium outlay when IV is high.",
    risks:
      "Profit capped at short strike. Requires two commissions. Loses full debit if stock stays below lower strike at expiry.",
    greeksProfile: {
      delta: "positive",
      gamma: "positive",
      theta: "negative",
      vega: "neutral",
    },
    difficulty: 2,
    realWorldExample:
      "With AAPL at $190, buy the $190/$200 call spread (30 DTE) for $3.50 debit. Max profit $6.50 if AAPL closes at or above $200. Max loss $3.50 if below $190.",
    setup: "Moderately bullish trend, IV not too low (reducing short leg value), defined upside target",
    whenToUse: "You have a specific price target for the stock within 30–45 days. IV is moderate-to-high, making outright calls expensive. Risk tolerance is conservative.",
    riskLevel: 2,
    capitalRequired: "low",
    experienceLevel: "beginner",
    commonMistakes: "Choosing a strike spread too narrow (under $3) — very hard to profit. Not giving the trade enough time (under 21 DTE). Forgetting that max profit requires stock to reach the upper strike.",
    examplePnL: "Buy AAPL $190/$200 call spread for $3.50 ($350 debit). AAPL closes at $202: spread worth $10 → gain $650 (+186%). AAPL closes at $188: spread worth $0 → loss $350 (-100%).",
  },
  {
    id: "bear-put-spread",
    name: "Bear Put Spread",
    category: "spread",
    sentiment: ["bearish"],
    description:
      "Buy a higher-strike put and sell a lower-strike put at the same expiry. Reduces put purchase cost while capping downside profit.",
    construction: "Buy 1 higher-strike put, Sell 1 lower-strike put (same expiry)",
    maxProfit: "Width of spread - Net debit paid",
    maxLoss: "Net debit paid",
    breakeven: "Higher strike - Net debit",
    idealConditions:
      "Moderately bearish — expect stock to fall toward the short strike. High IV environment where outright puts are expensive.",
    risks:
      "Profit is capped; a catastrophic drop earns no more than max profit. Full debit lost if stock stays above higher strike.",
    greeksProfile: {
      delta: "negative",
      gamma: "positive",
      theta: "negative",
      vega: "neutral",
    },
    difficulty: 2,
    realWorldExample:
      "With SPY at $510, buy the $510/$495 put spread (14 DTE) for $4 debit ahead of a Fed decision. Max profit $11 if SPY falls to $495; max loss $4.",
    setup: "Moderately bearish trend, stock near resistance, catalyst for downside move",
    whenToUse: "You have a specific downside target. High IV makes outright put buying expensive. You want defined risk on a bearish position.",
    riskLevel: 2,
    capitalRequired: "low",
    experienceLevel: "beginner",
    commonMistakes: "Placing the short put too far OTM (little profit even if right). Selling too close to support where the stock might bounce. Exiting too early before the thesis plays out.",
    examplePnL: "Buy SPY $510/$495 put spread for $4 ($400 debit). SPY falls to $493: spread worth $15 → gain $1,100 (+275%). SPY holds at $512: spread expires worthless → loss $400 (-100%).",
  },
  {
    id: "bull-put-spread",
    name: "Bull Put Spread",
    category: "spread",
    sentiment: ["bullish", "calm"],
    description:
      "Sell a higher-strike put and buy a lower-strike put as protection. Collects net credit; profits when stock stays above short strike.",
    construction: "Sell 1 higher-strike put, Buy 1 lower-strike put (same expiry)",
    maxProfit: "Net credit received",
    maxLoss: "Width of spread - Net credit",
    breakeven: "Short strike - Net credit",
    idealConditions:
      "Neutral-to-bullish. Stock expected to hold a support level. High IV to collect larger credit. Defined-risk alternative to naked short put.",
    risks:
      "Full loss if stock falls below long strike. Assignment risk on short leg if stock trades below short strike near expiry.",
    greeksProfile: {
      delta: "positive",
      gamma: "negative",
      theta: "positive",
      vega: "negative",
    },
    difficulty: 2,
    realWorldExample:
      "With GOOGL at $175, sell the $165/$155 put spread for $2.50 credit (30 DTE). Keep $250 if GOOGL stays above $165. Max loss $750 if below $155.",
    setup: "Neutral-to-bullish market, stock above a key support, IV elevated enough for meaningful credit",
    whenToUse: "IV Rank above 40%, stock is above a support level you expect to hold, defined-risk alternative to the naked short put",
    riskLevel: 2,
    capitalRequired: "low",
    experienceLevel: "beginner",
    commonMistakes: "Placing the short strike too close to spot (high chance of breach). Collecting too little credit relative to spread width (poor risk/reward). Not closing at 50% profit — holding for max premium increases risk.",
    examplePnL: "Sell GOOGL $165/$155 put spread for $2.50 credit ($250). GOOGL stays at $175: keep $250 (+100% on credit, 33% on max risk). GOOGL crashes to $150: lose $750 net (max loss on spread).",
  },
  {
    id: "bear-call-spread",
    name: "Bear Call Spread",
    category: "spread",
    sentiment: ["bearish", "calm"],
    description:
      "Sell a lower-strike call and buy a higher-strike call. Collects net credit; profits when stock stays below short strike.",
    construction: "Sell 1 lower-strike call, Buy 1 higher-strike call (same expiry)",
    maxProfit: "Net credit received",
    maxLoss: "Width of spread - Net credit",
    breakeven: "Short strike + Net credit",
    idealConditions:
      "Neutral-to-bearish. Stock facing strong resistance. High IV environment. Defined-risk way to express bearish view.",
    risks:
      "Full loss if stock rallies above long strike. Capped profit means large moves against you aren't fully hedged.",
    greeksProfile: {
      delta: "negative",
      gamma: "negative",
      theta: "positive",
      vega: "negative",
    },
    difficulty: 2,
    realWorldExample:
      "With AMZN at $185 near major resistance, sell the $190/$200 call spread for $3 credit (21 DTE). Keep $300 if AMZN stays below $190; max loss $700.",
    setup: "Neutral-to-bearish market, stock near resistance, elevated IV for premium collection",
    whenToUse: "Stock has failed at a resistance level multiple times, IV Rank above 40%, no strong bullish catalyst expected before expiry",
    riskLevel: 2,
    capitalRequired: "low",
    experienceLevel: "beginner",
    commonMistakes: "Placing the short strike too close to current price for extra credit — much higher breach probability. Not managing the trade when short strike is tested. Rolling for a debit without improving the position.",
    examplePnL: "Sell AMZN $190/$200 call spread for $3 ($300 credit). AMZN stays at $186: keep $300 (+100% on credit, 43% on max risk). AMZN breaks to $203: lose $700 net (max loss on spread).",
  },
  {
    id: "calendar-spread",
    name: "Calendar Spread",
    category: "spread",
    sentiment: ["calm", "neutral"],
    description:
      "Sell a near-term option and buy a longer-dated option at the same strike. Profits from time decay differential and potential IV expansion in the long leg.",
    construction: "Sell 1 near-term ATM call (or put), Buy 1 longer-dated ATM call (or put) at same strike",
    maxProfit: "Realized when stock near strike at front-month expiry (varies by IV)",
    maxLoss: "Net debit paid",
    breakeven: "Varies with IV — approximately Strike ± debit",
    idealConditions:
      "Stock expected to be range-bound near current price. IV term structure is flat or inverted (back month cheaper than front). Earnings in back month but not front.",
    risks:
      "IV collapse in back-month leg destroys value. Dramatic stock move in either direction causes large loss. Complex theta dynamics.",
    greeksProfile: {
      delta: "neutral",
      gamma: "negative",
      theta: "positive",
      vega: "positive",
    },
    difficulty: 3,
    realWorldExample:
      "With AAPL at $195, sell the 30-DTE $195 call and buy the 60-DTE $195 call for a $2 net debit. Profit if AAPL stays near $195 into the front-month expiry.",
    setup: "Range-bound market, stock near ATM strike, stable or rising back-month IV relative to front",
    whenToUse: "Stock has been consolidating for 2–3 weeks near a round number. Front-month IV is elevated relative to back-month (inverted term structure). No major catalyst in the front-month window.",
    riskLevel: 2,
    capitalRequired: "low",
    experienceLevel: "intermediate",
    commonMistakes: "Entering when front-month IV is lower than back-month (vol term structure working against you). Not closing the position after front-month expiry. Ignoring that a big move in either direction kills the trade.",
    examplePnL: "Buy AAPL calendar spread at $195 strike for $2 debit ($200). Front month expires with AAPL at $194: back-month call now worth ~$5 → sell to close for $3 gain (+150%). AAPL moves to $210: both legs decline similarly → lose $100-150.",
  },
  {
    id: "diagonal-spread",
    name: "Diagonal Spread",
    category: "spread",
    sentiment: ["bullish", "calm"],
    description:
      "Sell a near-term OTM option and buy a longer-dated option at a different (usually lower for calls) strike. Combines elements of calendar and vertical spreads.",
    construction: "Buy 1 longer-dated lower-strike call, Sell 1 near-term higher-strike call",
    maxProfit: "Difference in strikes - Net debit (if stock at short strike at expiry)",
    maxLoss: "Net debit paid",
    breakeven: "Long strike + Net debit",
    idealConditions:
      "Mildly bullish. Selling near-term premium to reduce cost basis of longer-dated long option. Acts like a 'poor man's covered call'.",
    risks:
      "Assignment on short leg before long leg expires. Complex P&L profile — harder to manage. Back-month IV drop reduces long leg value.",
    greeksProfile: {
      delta: "positive",
      gamma: "positive",
      theta: "positive",
      vega: "positive",
    },
    difficulty: 3,
    realWorldExample:
      "Buy MSFT 90-DTE $390 call for $15; sell 30-DTE $400 call for $5 net credit each cycle. Repeat rolling to reduce the long call's cost basis over time.",
    setup: "Mildly bullish trend, moderate IV, willing to cap upside beyond the short strike each cycle",
    whenToUse: "Stock is in a gradual uptrend. You want leveraged bullish exposure without full stock cost. Short-term IV is elevated enough to sell near-term premium meaningfully.",
    riskLevel: 2,
    capitalRequired: "medium",
    experienceLevel: "intermediate",
    commonMistakes: "Buying the LEAPS call too far OTM (low delta reduces effectiveness as a stock substitute). Selling the short call too close to the LEAPS strike (assignment risk). Forgetting to roll the short leg before expiry.",
    examplePnL: "Buy 90-DTE MSFT $390 call for $15 ($1,500). Sell monthly $400 call for $5 ($500). After 3 monthly rolls: collected $1,500 total in short premium, effectively reducing LEAPS cost to $0. MSFT at $405 at LEAPS expiry: call worth $15 → break even; at $420: call worth $30 → gain $1,500.",
  },

  // ─── INCOME ──────────────────────────────────────────────────────────────────
  {
    id: "covered-call",
    name: "Covered Call",
    category: "income",
    sentiment: ["neutral", "calm"],
    description:
      "Own 100 shares and sell a call against them. Generates income from premium; caps upside at the short strike. The most common income strategy.",
    construction: "Own 100 shares + Sell 1 OTM call",
    maxProfit: "Premium + (Short strike - Entry price) per share",
    maxLoss: "Entry price - Premium (stock falls to zero)",
    breakeven: "Entry price - Premium collected",
    idealConditions:
      "Already holding stock long-term. Willing to sell shares at the strike. IV elevated — richer premium. Stock in a slow uptrend or consolidation.",
    risks:
      "Capped upside — if stock gaps above strike, you miss the rally beyond. Still exposed to full downside of holding shares.",
    greeksProfile: {
      delta: "positive",
      gamma: "negative",
      theta: "positive",
      vega: "negative",
    },
    difficulty: 2,
    realWorldExample:
      "Own 100 AAPL shares at $185. Sell the $195 call (30 DTE) for $3 premium. If AAPL stays below $195, collect $300. If assigned, sell shares at $195 + keep premium.",
    setup: "Neutral-to-mildly bullish, already long the stock, IV elevated enough to collect meaningful premium",
    whenToUse: "You own the stock and it has been consolidating. IV is elevated (post-earnings or high VIX period). You are willing to sell the shares at the short strike price.",
    riskLevel: 2,
    capitalRequired: "high",
    experienceLevel: "beginner",
    commonMistakes: "Selling calls too close to ATM — getting called away during a rally. Selling calls in a strongly trending stock and missing big gains. Not selecting a strike above your cost basis.",
    examplePnL: "Own 100 AAPL at $185; sell $195 call for $3 ($300 credit). AAPL stays at $192: keep $300 → +$300 income. AAPL rallies to $210: called away at $195 + $300 = $1,300 gain (miss $1,500 upside beyond $195). AAPL falls to $170: paper loss $1,500 on stock, offset by $300 premium → net loss $1,200.",
  },
  {
    id: "covered-put",
    name: "Covered Put",
    category: "income",
    sentiment: ["bearish", "calm"],
    description:
      "Short 100 shares and sell a put against the short position. Generates premium income while holding a bearish position.",
    construction: "Short 100 shares + Sell 1 OTM put",
    maxProfit: "Premium + (Entry price - Short strike) per share",
    maxLoss: "Unlimited (short stock position if stock rockets higher)",
    breakeven: "Entry price + Premium collected",
    idealConditions:
      "Already short the stock. Mild-to-moderate bearish outlook. IV elevated for rich put premium. Stock in a downtrend with brief consolidation.",
    risks:
      "Unlimited loss potential from the short stock if stock reverses sharply upward. Complex margin requirements.",
    greeksProfile: {
      delta: "negative",
      gamma: "negative",
      theta: "positive",
      vega: "negative",
    },
    difficulty: 4,
    realWorldExample:
      "Short 100 TSLA shares at $260. Sell the $245 put (30 DTE) for $5. If TSLA falls to $245, put is assigned — you buy back shares + keep premium for a net gain.",
    setup: "Already short stock, mildly-to-moderately bearish, IV elevated for good put premium",
    whenToUse: "You have an existing short stock position and want to generate additional income while reducing upside risk slightly. IV is elevated.",
    riskLevel: 5,
    capitalRequired: "high",
    experienceLevel: "advanced",
    commonMistakes: "Treating this as a simple income strategy — the short stock position carries unlimited upside risk. Selling puts with a strike too close to current price, risking early assignment and covering the short at a loss.",
    examplePnL: "Short 100 TSLA at $260; sell $245 put for $5 ($500 credit). TSLA falls to $240: short stock gains $2,000, put is assigned (buy back at $245) → net gain $2,500. TSLA surges to $290: short stock loses $3,000, keep $500 premium → net loss $2,500.",
  },
  {
    id: "iron-condor",
    name: "Iron Condor",
    category: "income",
    sentiment: ["neutral", "calm"],
    description:
      "Sell an OTM call spread and an OTM put spread simultaneously. Four legs creating a wide range where maximum profit is earned. The classic range-bound income play.",
    construction:
      "Sell 1 OTM call, Buy 1 further OTM call, Sell 1 OTM put, Buy 1 further OTM put (same expiry)",
    maxProfit: "Total net credit received",
    maxLoss: "Width of widest spread - Net credit",
    breakeven: "Put short strike - Credit (lower) / Call short strike + Credit (upper)",
    idealConditions:
      "Low-volatility, range-bound market. IV Rank above 50% — collecting elevated premium. No major catalysts (earnings, FOMC) within expiry window.",
    risks:
      "Loss if stock breaks outside either wing. Adjustment required if stock trends strongly in one direction. 4 commissions per trade.",
    greeksProfile: {
      delta: "neutral",
      gamma: "negative",
      theta: "positive",
      vega: "negative",
    },
    difficulty: 3,
    realWorldExample:
      "With SPY at $510 and IVR at 65%, sell the $525/$530 call spread + $495/$490 put spread for $2.50 total credit (21 DTE). Keep credit if SPY stays between $495-$525.",
    setup: "Low realized volatility, range-bound market, IV Rank above 50%, no catalysts in window",
    whenToUse: "IV Rank is above 50% (collecting elevated premium). Stock has been range-bound for 4+ weeks. No earnings or major macro events before expiry.",
    riskLevel: 3,
    capitalRequired: "low",
    experienceLevel: "intermediate",
    commonMistakes: "Setting short strikes too close to spot (narrow range = lower win probability). Not closing early at 50% profit — holding to expiry increases gamma risk. Entering before earnings and getting crushed by a big directional move.",
    examplePnL: "Sell SPY $525/$530 call spread + $495/$490 put spread for $2.50 ($250 credit, $250 max risk per spread side). SPY stays at $510: close at $0.50 → gain $200 (+80% of max credit). SPY breaks to $530: call spread hits max loss ($500), put spread expires worthless → net loss $250.",
  },
  {
    id: "iron-butterfly",
    name: "Iron Butterfly",
    category: "income",
    sentiment: ["neutral", "calm"],
    description:
      "Sell ATM call and put (same strike), buy OTM call and OTM put wings for protection. Higher credit than iron condor but narrower profit zone centered at current price.",
    construction:
      "Sell 1 ATM call, Sell 1 ATM put (same strike), Buy 1 OTM call, Buy 1 OTM put (same expiry)",
    maxProfit: "Net credit collected (stock pins ATM strike at expiry)",
    maxLoss: "Wing width - Net credit",
    breakeven: "Short strike ± Net credit",
    idealConditions:
      "Very low volatility expected. Stock likely to close very near current price. High IV to collect larger ATM premium. Pinning action around a major strike.",
    risks:
      "Narrow profit zone — any significant move erodes profit. Hard to manage because ATM options have high gamma near expiry.",
    greeksProfile: {
      delta: "neutral",
      gamma: "negative",
      theta: "positive",
      vega: "negative",
    },
    difficulty: 3,
    realWorldExample:
      "With AAPL at $190 on Monday expiry week, sell the $190 straddle for $8 and buy the $180/$200 wings for $2 total. Net credit $6. Max profit $600 if AAPL pins $190 at close.",
    setup: "Very low expected move, stock near a round number or max pain level, elevated IV near expiry",
    whenToUse: "Stock has been pinning near a key level for several days. IV is very high (post-earnings with no gap). Weekly expiry approaching. You expect near-zero move.",
    riskLevel: 3,
    capitalRequired: "low",
    experienceLevel: "intermediate",
    commonMistakes: "Entering too far before expiry — too much time for stock to move away from center. Not managing aggressively when stock drifts 2+ strikes from center. Confusing this with an iron condor — profit zone is much narrower.",
    examplePnL: "Sell AAPL $190 iron butterfly for $6 credit ($600). AAPL closes at $190: keep full $600 (max profit). AAPL closes at $195: keep ~$100. AAPL closes at $200: lose $400 (approaching max loss). Wings cap loss at $600 - $200 premium = max loss $400.",
  },

  // ─── COMPLEX ─────────────────────────────────────────────────────────────────
  {
    id: "ratio-spread",
    name: "Ratio Spread",
    category: "complex",
    sentiment: ["bullish", "neutral"],
    description:
      "Buy one option and sell more options at a higher strike. Creates a position that profits from a moderate move with a credit or small debit upfront, but carries uncapped risk beyond the short strikes.",
    construction: "Buy 1 lower-strike call, Sell 2 higher-strike calls (same expiry)",
    maxProfit: "Difference between strikes - Net debit (if stock at short strike)",
    maxLoss: "Unlimited above short strikes (uncovered portion)",
    breakeven: "Lower strike + Net debit (lower) / Upper: Short strike × 2 - Lower strike - Debit",
    idealConditions:
      "Mildly bullish — expect stock to rise moderately but not explosively. Aim to enter at small credit so position has no downside risk below long strike.",
    risks:
      "Naked short calls above the short strike carry unlimited risk. Requires active management or stop-loss if stock makes a large unexpected move.",
    greeksProfile: {
      delta: "positive",
      gamma: "negative",
      theta: "positive",
      vega: "negative",
    },
    difficulty: 4,
    realWorldExample:
      "With AMZN at $185, buy 1 $185 call and sell 2 $195 calls for a $0.50 credit (30 DTE). Max profit $1,050 at $195; loss accrues above $205 without a hedge.",
    setup: "Mildly bullish with a specific target, high IV (makes the extra short call premium-rich), stock below your target",
    whenToUse: "You have a price target and want to enter for near-zero or credit. IV is elevated making the short legs valuable. You have a plan to manage the uncovered leg.",
    riskLevel: 4,
    capitalRequired: "medium",
    experienceLevel: "advanced",
    commonMistakes: "Not hedging the naked short leg above the breakeven — turns the trade into an unhedged short. Entering in low IV where the credit received doesn't compensate the added risk. Forgetting the two separate upper breakeven points.",
    examplePnL: "Buy 1 AMZN $185 call, sell 2 $195 calls for $0.50 credit ($50). AMZN pins $195 at expiry: gain $1,050 (spread width $10 + $50 credit). AMZN gaps to $210: lose $950 (beyond upper breakeven). AMZN stays at $185: keep $50 credit (small win).",
  },
  {
    id: "backspread",
    name: "Call Backspread",
    category: "complex",
    sentiment: ["bullish", "volatile"],
    description:
      "Sell fewer lower-strike calls and buy more higher-strike calls. Net debit (or small credit) position that profits explosively on big upside moves or benefits from IV expansion.",
    construction: "Sell 1 lower-strike call, Buy 2 higher-strike calls (same expiry)",
    maxProfit: "Unlimited (explosive upside move above long strikes)",
    maxLoss: "Difference between strikes - Net credit (or + Net debit) at lower strike",
    breakeven: "Higher strike + Loss-at-lower-strike / Number of extra long contracts",
    idealConditions:
      "Expecting a large move higher. IV relatively low — long options are cheap. Binary catalyst event (earnings, FDA, M&A) where big move is likely.",
    risks:
      "Maximum loss occurs if stock sits near short strike at expiry. Needs a large move to profit; time decay hurts if stock is stagnant.",
    greeksProfile: {
      delta: "positive",
      gamma: "positive",
      theta: "negative",
      vega: "positive",
    },
    difficulty: 4,
    realWorldExample:
      "Ahead of NVDA earnings, sell 1 $500 call for $15, buy 2 $520 calls for $8 each. Net debit $1. If NVDA surges to $560, gain ~$80+; if it pins $500, lose the spread width.",
    setup: "Low IV, expectation of explosive move, binary catalyst imminent",
    whenToUse: "IV is low (cheap to buy extra long options). A binary catalyst (earnings, FDA, M&A) could produce a massive directional move. You want unlimited upside with defined downside.",
    riskLevel: 3,
    capitalRequired: "low",
    experienceLevel: "advanced",
    commonMistakes: "Using this in high IV — the extra long options are expensive and you need a massive move to profit. Not sizing properly — a large debit version can still lose significantly at the short strike. Confusing with regular spread — this has a loss zone near the short strike.",
    examplePnL: "Sell 1 NVDA $500 call for $15, buy 2 $520 calls for $8 each ($1 net debit, $100 total). NVDA surges to $560: gain ~$3,900 (2×$40 on long calls, minus $15 on short = $65 net gain × 100). NVDA pins $500: max loss $2,000 (spread width minus credit).",
  },
  {
    id: "butterfly",
    name: "Butterfly Spread",
    category: "complex",
    sentiment: ["neutral", "calm"],
    description:
      "Buy one lower-strike option, sell two middle-strike options, buy one higher-strike option. All at same expiry. Low-cost, high-reward pinning play.",
    construction:
      "Buy 1 lower-strike call, Sell 2 middle-strike calls, Buy 1 higher-strike call (same expiry, equal width between strikes)",
    maxProfit: "Width of spread - Net debit (stock pins middle strike at expiry)",
    maxLoss: "Net debit paid",
    breakeven: "Lower strike + Net debit (lower) / Upper strike - Net debit",
    idealConditions:
      "Expect stock to close near a specific price (the short strike) at expiry. Low cost defined-risk play. Good for pinning plays on weekly options.",
    risks:
      "Very narrow profit zone — stock must close near the middle strike. Full debit lost if stock moves significantly in either direction.",
    greeksProfile: {
      delta: "neutral",
      gamma: "negative",
      theta: "positive",
      vega: "negative",
    },
    difficulty: 3,
    realWorldExample:
      "With GOOGL at $170, buy the $165/$170/$175 call butterfly for $1.50 debit (7 DTE). Max profit $3.50 if GOOGL closes exactly at $170; max loss $1.50.",
    setup: "Very low expected move, stock near a specific price target, IV moderate-to-high (more premium in short legs)",
    whenToUse: "You have a precise price target for expiry. Very cheap entry (low debit). Near-expiry pinning play — works best 7–14 DTE.",
    riskLevel: 2,
    capitalRequired: "low",
    experienceLevel: "intermediate",
    commonMistakes: "Entering too far from the center strike — reduces probability dramatically. Expecting a big payday with wide wings — risk/reward is most favorable with $5-wide strikes. Not closing the position at 50–75% of max profit before last 2 days (gamma risk spikes).",
    examplePnL: "Buy GOOGL $165/$170/$175 call butterfly for $1.50 ($150 total debit). GOOGL closes at $170: spread worth $5 → gain $350 (+233%). GOOGL closes at $167: spread worth ~$2 → gain $50 (+33%). GOOGL closes at $175 or below $165: lose $150 (-100%).",
  },

  // ─── SYNTHETIC ───────────────────────────────────────────────────────────────
  {
    id: "synthetic-long",
    name: "Synthetic Long Stock",
    category: "synthetic",
    sentiment: ["bullish"],
    description:
      "Buy a call and sell a put at the same strike and expiry. Replicates the payoff of owning 100 shares for a fraction of the capital, using put-call parity.",
    construction: "Buy 1 ATM call + Sell 1 ATM put (same strike, same expiry)",
    maxProfit: "Unlimited (as stock rises above strike)",
    maxLoss: "Substantial (as stock falls below strike, similar to owning stock)",
    breakeven: "Strike + Net debit (or - Net credit)",
    idealConditions:
      "Strongly bullish conviction. Capital-efficient alternative to buying shares. When ATM put is expensive (high skew), may enter for net credit.",
    risks:
      "Combines unlimited upside with significant downside — behaves like owning stock. Short put creates obligation to buy shares if assigned. Not capital-neutral.",
    greeksProfile: {
      delta: "positive",
      gamma: "neutral",
      theta: "neutral",
      vega: "neutral",
    },
    difficulty: 3,
    realWorldExample:
      "With TSLA at $260, buy the $260 call and sell the $260 put (same 30-DTE expiry) for near-zero net debit due to put-call parity. Gains/losses mirror owning 100 TSLA shares.",
    setup: "Strong bullish conviction, stock you want long exposure to, sufficient margin available",
    whenToUse: "You want stock-like exposure with less capital outlay. The put is expensive relative to the call (high skew), so you can enter for a net credit. You cannot short sell but want leveraged bullish exposure.",
    riskLevel: 4,
    capitalRequired: "medium",
    experienceLevel: "advanced",
    commonMistakes: "Not accounting for the full stock-equivalent risk — this is not a defined-risk trade. Getting assigned on the short put and not wanting to hold the stock. Ignoring dividend risk on the short put if the underlying pays dividends.",
    examplePnL: "Buy TSLA $260 call, sell $260 put for $0.20 net credit ($20 received). TSLA rises to $290: gain ~$3,000 (mirrors 100 shares). TSLA falls to $230: lose ~$3,000 (mirrors 100 shares loss). Net debit/credit is negligible — P&L tracks the stock closely.",
  },
  {
    id: "synthetic-short",
    name: "Synthetic Short Stock",
    category: "synthetic",
    sentiment: ["bearish"],
    description:
      "Buy a put and sell a call at the same strike and expiry. Replicates shorting 100 shares without needing to locate a borrow. Profits from stock decline.",
    construction: "Buy 1 ATM put + Sell 1 ATM call (same strike, same expiry)",
    maxProfit: "Strike - Net debit (stock falls to zero)",
    maxLoss: "Unlimited (as stock rises above strike)",
    breakeven: "Strike - Net debit (or + Net credit)",
    idealConditions:
      "Strongly bearish. Stock hard-to-borrow or borrow cost too high. Capital-efficient way to establish a large notional short without actually shorting shares.",
    risks:
      "Unlimited upside exposure from the short call. No dividends received (unlike traditional short selling, you pay them). Margin requirement can be substantial.",
    greeksProfile: {
      delta: "negative",
      gamma: "neutral",
      theta: "neutral",
      vega: "neutral",
    },
    difficulty: 3,
    realWorldExample:
      "With GME at $25 (hard to borrow), buy the $25 put and sell the $25 call (30 DTE) for a $0.30 net debit. Synthetic short mirrors short stock P&L without the 50%+ borrow cost.",
    setup: "Strong bearish conviction, stock that is hard-to-borrow or has very high borrow costs, sufficient margin",
    whenToUse: "Stock has high borrow cost (>20% annualized) making traditional short selling uneconomical. You want full bearish exposure without locate issues. Put-call parity makes the synthetic cheap.",
    riskLevel: 5,
    capitalRequired: "medium",
    experienceLevel: "advanced",
    commonMistakes: "Not monitoring the short call for assignment risk — a dividend or early exercise can create a forced assignment. Underestimating margin requirements which can spike in volatile markets. Failing to close before major bullish catalysts.",
    examplePnL: "Buy GME $25 put, sell $25 call for $0.30 debit ($30). GME falls to $15: gain ~$1,000 (mirrors short stock). GME surges to $40: lose ~$1,500 (mirrors short stock loss). The $30 debit/credit is immaterial — full stock-equivalent risk.",
  },
];

export const STRATEGY_CATEGORIES = [
  { id: "basic", label: "Basic" },
  { id: "spread", label: "Spreads" },
  { id: "income", label: "Income" },
  { id: "complex", label: "Complex" },
  { id: "synthetic", label: "Synthetic" },
] as const;

export const SENTIMENT_OPTIONS: { value: MarketSentiment | "all"; label: string }[] = [
  { value: "all", label: "All Sentiments" },
  { value: "bullish", label: "Bullish" },
  { value: "bearish", label: "Bearish" },
  { value: "neutral", label: "Neutral" },
  { value: "volatile", label: "Volatile" },
  { value: "calm", label: "Calm" },
];
