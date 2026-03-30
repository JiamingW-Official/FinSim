export interface OrderTypeGuide {
  name: string;
  category: "basic" | "conditional" | "algorithmic";
  description: string;
  howItWorks: string;
  whenToUse: string;
  risks: string;
  example: { scenario: string; setup: string; result: string };
  proTip: string;
}

export const ORDER_TYPES: OrderTypeGuide[] = [
  {
    name: "Market Order",
    category: "basic",
    description:
      "An order to buy or sell a security immediately at the best available current price. Guarantees execution but not the price.",
    howItWorks:
      "When you place a market order, it is routed to the exchange and matched against the best available limit order on the opposite side of the order book. For a market buy, you pay the lowest ask price; for a market sell, you receive the highest bid price. In liquid markets, execution is nearly instant.",
    whenToUse:
      "When you need immediate execution and the security is highly liquid with tight bid-ask spreads. Suitable for large-cap stocks during regular market hours. Use when speed matters more than price precision.",
    risks:
      "In fast-moving or illiquid markets, you may receive a much worse price than expected (slippage). During pre-market or after-hours trading, spreads widen significantly. During flash crashes, market orders can execute at extreme prices.",
    example: {
      scenario: "You want to buy 100 shares of AAPL immediately during normal trading hours.",
      setup: "Place a market buy order for 100 shares. AAPL is trading at $175.50 bid / $175.52 ask.",
      result: "You buy 100 shares at $175.52 (the ask price). Execution is instant.",
    },
    proTip:
      "Never use market orders on low-volume stocks, options, or during pre/post-market hours. The slippage can be enormous. Even for liquid stocks, a limit order at the ask price gives you the same speed with price protection.",
  },
  {
    name: "Limit Order",
    category: "basic",
    description:
      "An order to buy or sell at a specific price or better. A buy limit executes at the limit price or lower; a sell limit executes at the limit price or higher.",
    howItWorks:
      "A limit order is placed on the order book at your specified price. It sits there until either filled, cancelled, or expired. For a buy limit, you specify the maximum price you are willing to pay. For a sell limit, you specify the minimum price you are willing to accept. The order may be partially filled if there is not enough volume at your price.",
    whenToUse:
      "For almost all trades. Limit orders give you control over your execution price. Use them for entries, exits, and especially for illiquid securities or options where spreads are wide.",
    risks:
      "The primary risk is non-execution: the market may move away from your limit price and your order may never be filled. You may miss a trade entirely if you set the limit too aggressively. Partial fills can leave you with an unintended small position.",
    example: {
      scenario: "AAPL is trading at $175.50 and you want to buy on a pullback to $173.",
      setup: "Place a buy limit order at $173 for 100 shares, good-til-cancelled (GTC).",
      result: "If AAPL drops to $173, your order fills at $173 or better. If it never reaches $173, your order sits unfilled.",
    },
    proTip:
      "For immediate execution with price protection, place a limit order slightly above the ask (for buys) or slightly below the bid (for sells). This gives you market-order speed with a price ceiling/floor.",
  },
  {
    name: "Stop Order (Stop-Loss)",
    category: "basic",
    description:
      "An order that becomes a market order once a specified 'stop price' is reached. Used primarily to limit losses on existing positions.",
    howItWorks:
      "A stop order is dormant until the market price reaches or passes through the stop price. At that point, the stop order converts into a market order and executes at the next available price. For a sell stop, it triggers when the price drops to or below the stop price. For a buy stop, it triggers when price rises to or above the stop price.",
    whenToUse:
      "To protect profits or limit losses on existing positions. Place a sell stop below your entry price to define maximum loss. Use a buy stop above resistance to enter a breakout trade.",
    risks:
      "Once triggered, a stop order becomes a market order with no price guarantee. In fast-moving markets or at the open, your fill price may be significantly worse than your stop price (gap risk). Stop hunting by institutional traders can trigger your stop before the market reverses.",
    example: {
      scenario: "You bought AAPL at $175 and want to limit your loss to 5%.",
      setup: "Place a sell stop order at $166.25 (5% below $175) for 100 shares.",
      result: "If AAPL drops to $166.25, the stop triggers and sells at the next available price, which might be $166.20 or $166.00 in a fast market.",
    },
    proTip:
      "Avoid placing stops at obvious round numbers ($150, $200) or common technical levels where market makers know orders are clustered. Place stops slightly below these levels to reduce the chance of getting stopped out by a brief wick.",
  },
  {
    name: "Stop-Limit Order",
    category: "conditional",
    description:
      "A combination of a stop order and a limit order. When the stop price is reached, it creates a limit order (not a market order) at a specified limit price.",
    howItWorks:
      "You specify two prices: the stop price (trigger) and the limit price (maximum you will pay or minimum you will accept). When the market hits the stop price, a limit order is placed at the limit price. The limit price is usually set slightly below the stop price for sells (or above for buys) to give a small buffer for execution.",
    whenToUse:
      "When you want price protection on your stop orders, especially for less liquid stocks, options, or overnight holds where gap risk is a concern. Prevents execution at catastrophically bad prices during flash crashes.",
    risks:
      "If the market gaps through both your stop and limit prices, the order may not execute at all, leaving you fully exposed to further losses. This is the fundamental tradeoff: price protection vs. guaranteed execution.",
    example: {
      scenario: "You own TSLA at $250 and want to limit losses but avoid selling in a flash crash.",
      setup: "Place a sell stop-limit with stop price $237.50 and limit price $235. If TSLA drops to $237.50, a sell limit at $235 is placed.",
      result: "If TSLA drops gradually, you sell between $237.50 and $235. If it gaps down to $220 overnight, your order sits unfilled at $235 and you are still holding.",
    },
    proTip:
      "Set the limit price 1-2% below the stop price for sell stops to give enough room for execution in normal market conditions. Too tight a gap means the limit order may not fill even in orderly declines.",
  },
  {
    name: "Trailing Stop",
    category: "conditional",
    description:
      "A dynamic stop order that adjusts automatically as the market price moves in your favor. The stop 'trails' the market by a set amount or percentage.",
    howItWorks:
      "You set a trail amount (dollar or percentage). As the stock rises (for a long position), the stop price moves up with it, always staying the trail distance below the highest price reached. If the stock falls, the stop price stays fixed at its highest level. When price drops to the stop, it triggers a market order.",
    whenToUse:
      "To lock in profits on a winning trade while allowing it to continue running. Ideal for trend-following strategies where you want to capture as much of a move as possible without setting a fixed target.",
    risks:
      "During volatile markets, normal price fluctuations can trigger the trailing stop and take you out of a position that then reverses back in your favor. Wide trails protect against whipsaws but give back more profit. Becomes a market order when triggered, with all the associated gap risk.",
    example: {
      scenario: "You bought NVDA at $500 and it has risen to $600. You set a 10% trailing stop.",
      setup: "The trailing stop starts at $540 (10% below $600). If NVDA rises to $650, the stop moves to $585.",
      result: "If NVDA pulls back 10% from any new high, the stop triggers. You capture most of the upside while protecting against reversals.",
    },
    proTip:
      "Base the trail distance on the stock's average true range (ATR) rather than an arbitrary percentage. A 2x ATR trail allows for normal volatility while catching genuine trend reversals. Too tight a trail gets stopped out on noise.",
  },
  {
    name: "One-Cancels-Other (OCO)",
    category: "conditional",
    description:
      "Two linked orders where the execution of one automatically cancels the other. Allows you to set both a profit target and a stop-loss simultaneously.",
    howItWorks:
      "You place two orders on the same position: typically a limit sell (profit target) above the current price and a stop sell (stop-loss) below. When either order is filled, the other is immediately cancelled. This ensures you cannot accidentally exit the same position twice.",
    whenToUse:
      "When you have a defined profit target and stop-loss for a position and want both to be active simultaneously. Essential for managing positions when you cannot monitor the market in real time.",
    risks:
      "If the market moves extremely fast, there is a small possibility that both orders could execute before the cancellation processes (rare but possible). The individual orders carry the same risks as their respective order types.",
    example: {
      scenario: "You bought MSFT at $400. You want to take profit at $440 or stop out at $380.",
      setup: "Place an OCO: sell limit at $440 AND sell stop at $380. One fills, the other cancels.",
      result: "If MSFT rises to $440, you take profit and the stop is cancelled. If it drops to $380, you stop out and the limit is cancelled.",
    },
    proTip:
      "OCO orders are the foundation of professional trade management. Set them immediately after entering a position so your risk is defined from the start. This removes emotion from exit decisions.",
  },
  {
    name: "Bracket Order",
    category: "conditional",
    description:
      "A three-part order that combines an entry order with an OCO exit order. Fully automates the entry, profit target, and stop-loss for a trade.",
    howItWorks:
      "You place a primary entry order (market or limit), and simultaneously specify a profit target (limit) and a stop-loss (stop). Once the entry fills, the profit target and stop-loss become an active OCO pair. The entire trade lifecycle is automated from entry to exit.",
    whenToUse:
      "When you want to fully automate a trade from entry to exit. Ideal for systematic traders, busy professionals, or anyone who wants to define their complete trade plan before the market opens.",
    risks:
      "The same risks as the component order types. If your entry is a market order, you may get a worse entry price than expected, which shifts your profit target and stop-loss relative to cost. Some brokers do not support bracket orders on options.",
    example: {
      scenario: "You want to buy AMZN at $185 with a $200 profit target and a $175 stop-loss.",
      setup: "Place a bracket order: buy limit $185, sell limit $200, sell stop $175. Once the buy fills, the exits activate.",
      result: "Your entire trade is managed automatically. You either hit your 2:1 reward-to-risk target or get stopped out.",
    },
    proTip:
      "Bracket orders enforce discipline by preventing you from moving your stop-loss or second-guessing your profit target. Set them based on your analysis and let the market decide the outcome.",
  },
  {
    name: "Market-on-Open (MOO)",
    category: "basic",
    description:
      "An order to buy or sell at the opening price of the trading session. It is executed during the opening auction process.",
    howItWorks:
      "MOO orders participate in the opening auction, which determines the official opening price for each security. Orders are accumulated before the open and matched in a single price-discovery process. The opening price is set to maximize the volume of shares traded.",
    whenToUse:
      "When you want to trade at the official opening price, typically in response to overnight news or pre-market developments. Used by institutions that need to execute at benchmark prices.",
    risks:
      "The opening price can gap significantly from the prior close due to overnight news. You have no control over the execution price. The opening auction can be volatile with wide price swings in the first minutes.",
    example: {
      scenario: "A company you own reports strong earnings after hours. You want to sell at the open.",
      setup: "Place a MOO sell order before the market opens. The order joins the opening auction.",
      result: "Your order executes at the opening price, which reflects the post-earnings sentiment. The opening price may gap 5% higher than yesterday's close.",
    },
    proTip:
      "MOO orders must typically be submitted before a deadline (often 9:28 AM ET for NYSE). They cannot be cancelled during the opening auction once the deadline passes. Use with caution for volatile stocks.",
  },
  {
    name: "Market-on-Close (MOC)",
    category: "basic",
    description:
      "An order to buy or sell at the closing price of the trading session. It participates in the closing auction.",
    howItWorks:
      "MOC orders are accumulated and executed during the closing auction, which sets the official closing price. The closing auction is the most liquid period of the trading day, handling roughly 10-15% of daily volume. Index funds and institutions frequently use MOC orders.",
    whenToUse:
      "When you want the official closing price for benchmarking or portfolio rebalancing. Useful for reducing overnight risk by exiting positions before the close. Also used by ETFs that track closing prices.",
    risks:
      "You cannot cancel MOC orders after a deadline (typically 3:50 PM ET for NYSE). The closing price can be volatile, especially during index rebalancing days, options expiration, or when large institutional orders arrive. You have no control over the final price.",
    example: {
      scenario: "You want to exit a day trade at the closing price to avoid overnight risk.",
      setup: "Place a MOC sell order before 3:50 PM. The order joins the closing auction.",
      result: "Your order executes at the official closing price, ensuring no overnight exposure.",
    },
    proTip:
      "The closing auction is typically the best liquidity of the day. MOC orders are popular on options expiration Fridays and index rebalancing days, which can cause unusual closing price moves.",
  },
  {
    name: "Limit-on-Open (LOO)",
    category: "conditional",
    description:
      "A limit order that is only active during the opening auction. If not filled at or better than the limit price during the open, the order is cancelled.",
    howItWorks:
      "Like a MOO order, it participates in the opening auction, but with a price constraint. You specify a maximum price (for buys) or minimum price (for sells). If the opening price is within your limit, the order fills. If not, it is cancelled and not carried forward into the regular session.",
    whenToUse:
      "When you want to participate in the opening auction but only at a reasonable price. Useful when you expect a gap in your favor but want protection against an adverse gap.",
    risks:
      "The order may not fill if the opening price exceeds your limit. You miss the trade entirely rather than getting a bad fill. Must be submitted before the opening auction deadline.",
    example: {
      scenario: "A stock closed at $50 and reported good earnings. You want to buy at the open but only up to $55.",
      setup: "Place a LOO buy order at $55 limit. If the stock opens at $54, you fill at $54. If it opens at $57, the order is cancelled.",
      result: "Price protection on the opening auction. You only participate if the gap is not too extreme.",
    },
    proTip:
      "LOO orders are excellent for post-earnings plays where you have a price at which the risk/reward no longer makes sense. Set the limit at the maximum price where the trade still offers a favorable risk/reward ratio.",
  },
  {
    name: "Limit-on-Close (LOC)",
    category: "conditional",
    description:
      "A limit order active only during the closing auction. If the closing price does not meet your limit, the order is cancelled.",
    howItWorks:
      "Similar to MOC but with price constraints. You set a limit price, and the order only executes during the closing auction if the price is at or better than your limit. If the closing price exceeds your limit for a buy (or falls below for a sell), the order is cancelled.",
    whenToUse:
      "When you want to buy or sell at the close but only if the price is favorable. Useful for end-of-day portfolio rebalancing with price discipline.",
    risks:
      "The order may not fill, leaving you in (or out of) a position overnight. The closing auction deadline for LOC orders is typically earlier than MOC orders.",
    example: {
      scenario: "You want to buy a stock for a swing trade at the close, but only if it stays below $100.",
      setup: "Place a LOC buy order at $100 limit. If the stock closes at $99, you fill. If it closes at $101, the order is cancelled.",
      result: "You enter the swing trade only at a favorable price, or you wait for a better opportunity.",
    },
    proTip:
      "LOC orders are underutilized by retail traders. They are excellent for disciplined end-of-day entries that avoid chasing during the regular session.",
  },
  {
    name: "Iceberg Order",
    category: "algorithmic",
    description:
      "A large order that is split into smaller visible portions to hide the total order size. Only a fraction of the total order is displayed on the order book at any time.",
    howItWorks:
      "You specify a total quantity and a display quantity. Only the display quantity appears on the public order book. When that portion fills, the next display-quantity tranche is automatically placed. This repeats until the entire order is filled or cancelled. The hidden portions are not visible to other market participants.",
    whenToUse:
      "When executing large orders that could move the market if the full size were visible. Prevents other traders from front-running your order or using the information to trade against you.",
    risks:
      "Slower execution than a single large order since you are filling in increments. The market may move away from your price before the full order is complete. Smart algorithms can sometimes detect iceberg patterns by watching refill rates.",
    example: {
      scenario: "You want to buy 50,000 shares of a mid-cap stock without alerting the market.",
      setup: "Place an iceberg buy limit order: total quantity 50,000, display quantity 500. Only 500 shares show on the book at a time.",
      result: "The market sees a small 500-share order. Each time it fills, another 500 appears. The full order is concealed.",
    },
    proTip:
      "Vary the display quantity slightly between refills to make the iceberg less detectable. Some advanced algorithms can detect consistent refill patterns.",
  },
  {
    name: "TWAP (Time-Weighted Average Price)",
    category: "algorithmic",
    description:
      "An algorithmic order that spreads execution evenly over a specified time period to achieve the time-weighted average price. The order is sliced into equal-sized intervals.",
    howItWorks:
      "You specify the total quantity, start time, and end time. The algorithm divides the order into equal time slices and executes a proportional amount in each slice. For example, 10,000 shares over 2 hours would execute roughly 83 shares per minute. The execution is time-based, not volume-based.",
    whenToUse:
      "When you want a simple, predictable execution schedule and the benchmark is the time-weighted average price. Common for portfolio transitions, index rebalancing, and corporate buyback programs.",
    risks:
      "Does not adapt to real-time market conditions. If the market moves sharply during execution, the algorithm continues its fixed schedule, potentially buying more at higher prices or selling more at lower prices.",
    example: {
      scenario: "You need to sell 20,000 shares of XYZ between 10:00 AM and 2:00 PM.",
      setup: "Launch a TWAP algorithm: sell 20,000 shares over 4 hours. It will sell roughly 5,000 shares per hour.",
      result: "Your average execution price closely matches the time-weighted average market price over that period.",
    },
    proTip:
      "TWAP is best for low-urgency orders in liquid names. For more adaptive execution in volatile markets, VWAP is usually preferred.",
  },
  {
    name: "VWAP (Volume-Weighted Average Price)",
    category: "algorithmic",
    description:
      "An algorithmic order that matches execution to intraday volume patterns to achieve the volume-weighted average price. More shares are traded during high-volume periods.",
    howItWorks:
      "The algorithm uses historical intraday volume profiles to predict how volume will be distributed throughout the day. It front-loads execution during high-volume periods (open, close) and reduces activity during low-volume periods (midday). This mimics the natural trading rhythm.",
    whenToUse:
      "The most popular institutional benchmark. Used when you want to minimize market impact by trading in proportion to natural market volume. Standard for large institutional orders where the VWAP benchmark is used for performance evaluation.",
    risks:
      "Relies on historical volume patterns that may not match actual volume on a given day. News events can distort the volume profile. If the stock trends strongly in one direction, VWAP execution can result in a worse average price than aggressive early execution.",
    example: {
      scenario: "An institution needs to buy 100,000 shares of GOOG over the trading day.",
      setup: "Launch a VWAP algorithm targeting full-day execution. The algorithm will trade more heavily during the open and close when volume is naturally higher.",
      result: "The average execution price closely tracks the daily VWAP, which is the benchmark for institutional performance evaluation.",
    },
    proTip:
      "Most retail traders cannot directly use VWAP algorithms, but understanding that institutions trade this way helps explain why volume clusters at the open and close, and why VWAP is a significant intraday support/resistance level.",
  },
  {
    name: "Good-Til-Cancelled (GTC)",
    category: "basic",
    description:
      "Not an order type itself, but a time-in-force instruction that keeps an order active until it is filled or manually cancelled. Contrasts with day orders that expire at the session close.",
    howItWorks:
      "When you specify GTC as the time-in-force, your limit or stop order remains active across multiple trading sessions until filled or cancelled. Most brokers set a maximum duration (typically 60-180 days) after which GTC orders automatically expire.",
    whenToUse:
      "When you have a price target or stop level and are willing to wait indefinitely for the market to reach it. Useful for setting buy orders at support levels you have identified or sell targets at resistance.",
    risks:
      "You may forget about old GTC orders that suddenly fill weeks later when market conditions have changed. A GTC order placed during one market environment may not be appropriate if conditions shift dramatically.",
    example: {
      scenario: "You want to buy AAPL if it pulls back to $160, but it is currently at $175.",
      setup: "Place a GTC buy limit order at $160. The order stays active for up to 180 days.",
      result: "If AAPL drops to $160 at any point in the next 6 months, your order fills automatically. Otherwise, it expires.",
    },
    proTip:
      "Review all GTC orders weekly. Market conditions change, and an order that made sense a month ago may no longer be appropriate. Many experienced traders prefer to re-enter orders daily to force themselves to reassess each trade idea.",
  },
];
