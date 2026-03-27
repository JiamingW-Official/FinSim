import type { Unit } from "./types";

export const UNIT_DERIVATIVES_BASICS: Unit = {
  id: "derivatives-basics",
  title: "Derivatives Basics",
  description:
    "Forwards, futures, options, swaps, and volatility trading — the full derivatives toolkit",
  icon: "Layers",
  color: "#8b5cf6",
  lessons: [
    /* ================================================================
       LESSON 1 — Introduction to Derivatives
       ================================================================ */
    {
      id: "deriv-1",
      title: "Introduction to Derivatives",
      description:
        "What are derivatives, forwards vs futures vs options vs swaps; notional value vs market value",
      icon: "Package",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What Is a Derivative?",
          content:
            "A **derivative** is a financial contract whose value is derived from the performance of an underlying asset, index, or rate. The underlying can be:\n- A stock or equity index (S&P 500)\n- A commodity (crude oil, gold, wheat)\n- A currency (EUR/USD)\n- An interest rate (SOFR, Fed Funds)\n- A bond or credit instrument\n\n**Why derivatives exist:**\n1. **Hedging** — reduce unwanted risk (an airline hedging jet fuel costs with oil futures)\n2. **Speculation** — take leveraged directional views without owning the underlying\n3. **Arbitrage** — exploit price discrepancies between related instruments\n4. **Income generation** — selling derivatives to collect premium (e.g., covered calls)\n\n**Scale of the derivatives market:**\n- The notional value of global derivatives exceeds $600 trillion\n- This dwarfs the entire global stock market (~$100 trillion)\n- Most derivatives contracts are between institutions (OTC) or traded on exchanges (ETD)\n\n**Key insight**: Derivatives don't create wealth — they redistribute risk from those who want to reduce it (hedgers) to those willing to bear it (speculators).",
          highlight: [
            "derivative",
            "underlying",
            "hedging",
            "speculation",
            "notional value",
          ],
        },
        {
          type: "teach",
          title: "The Four Main Types of Derivatives",
          content:
            "The derivatives universe consists of four core instrument types:\n\n**1. Forwards:**\n- Private, customizable contracts between two parties\n- Agree today on a price to buy/sell an asset at a future date\n- No daily settlement — profit/loss realized at expiration\n- Over-the-counter (OTC) — no exchange; counterparty risk exists\n- Example: A wheat farmer agrees to sell 10,000 bushels in 6 months at $5.50/bushel\n\n**2. Futures:**\n- Standardized forwards traded on exchanges (CME, ICE)\n- Daily mark-to-market settlement (gains/losses credited daily)\n- Margined instruments — put up a fraction of the total value\n- No counterparty risk — the exchange clears all trades\n- Example: S&P 500 E-mini futures (ES), WTI Crude Oil futures (CL)\n\n**3. Options:**\n- Give the buyer the *right, but not the obligation*, to buy (call) or sell (put) the underlying\n- The seller (writer) receives premium but assumes the obligation\n- Maximum loss for buyers = premium paid; unlimited loss potential for unhedged sellers\n\n**4. Swaps:**\n- Two parties exchange cash flows based on different instruments\n- Interest rate swap: exchange fixed for floating interest payments\n- Currency swap: exchange interest payments in different currencies\n- Primarily OTC; used by corporations and institutions to manage multi-year exposures",
          highlight: [
            "forward",
            "futures",
            "options",
            "swaps",
            "OTC",
            "exchange-traded",
          ],
        },
        {
          type: "teach",
          title: "Notional Value vs Market Value",
          content:
            "One of the most important — and most misunderstood — concepts in derivatives is the difference between notional value and market value.\n\n**Notional Value:**\n- The face value of the underlying controlled by the contract\n- Determines the economic exposure but is NOT the amount at risk\n- Example: One S&P 500 futures contract controls $50 × index level\n  - If S&P 500 = 5,000, notional value = $250,000 per contract\n  - But you only post ~$15,000 margin to control it (6% of notional)\n\n**Market Value:**\n- The current market price of the derivative itself\n- For futures: the mark-to-market gain or loss since entry\n- For options: the premium paid or received\n- This is the actual capital at risk for buyers\n\n**Why the distinction matters:**\n- Derivatives provide **leverage** — small market value controls large notional exposure\n- A 1% move in the S&P 500 = $2,500 gain/loss per E-mini futures contract\n- On $15,000 margin, that's a 16.7% return or loss on a single 1% market move\n\n**Leverage magnifies both gains and losses.** This is why risk management is even more critical when trading derivatives than when trading stocks.",
          highlight: [
            "notional value",
            "market value",
            "leverage",
            "margin",
            "mark-to-market",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A corporate treasurer wants to lock in the price of jet fuel for the next 6 months but needs a customized contract size and delivery date that doesn't match any exchange-listed futures. Which derivative is most appropriate?",
          options: [
            "A forward contract — customizable OTC agreement with a bank or broker",
            "An exchange-traded futures contract — it is standardized for this exact purpose",
            "A call option — gives the right to buy fuel at a fixed price",
            "An interest rate swap — converts fixed payments to floating for fuel costs",
          ],
          correctIndex: 0,
          explanation:
            "Forward contracts are privately negotiated OTC agreements that can be tailored to any size, maturity, or delivery specification. When the standardized terms of exchange-listed futures don't match a company's specific needs (unique delivery dates, non-standard quantities), a forward with a bank is the standard solution. This comes at the cost of counterparty risk and less liquidity than exchange-traded futures.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The notional value of a derivatives contract represents the actual amount of money the buyer must pay upfront to enter the position.",
          correct: false,
          explanation:
            "Notional value is the face value of the underlying asset controlled by the contract — it is NOT what the buyer pays. For futures, the buyer posts a fraction as margin (typically 3-15% of notional). For options, the buyer pays only the premium (often 1-5% of the underlying's value). Notional value represents exposure, not cost. This distinction is fundamental — ignoring it can lead to severe underestimation of risk.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You buy 2 S&P 500 E-mini futures contracts at 5,000. Each contract has a multiplier of $50 (notional = $50 × 5,000 = $250,000 per contract). Your broker requires $12,000 initial margin per contract. The S&P 500 rises 2% to 5,100.",
          question: "What is your profit, and what is your return on margin?",
          options: [
            "Profit = $10,000; Return on margin = 41.7% — leverage amplifies the 2% market move",
            "Profit = $2,000 (2% × $100,000 invested); Return = 2%",
            "Profit = $5,000 (2% × $250,000 notional × 1 contract); Return = 20.8%",
            "Profit = $10,000; Return on margin = 2% — same as the underlying",
          ],
          correctIndex: 0,
          explanation:
            "Each contract: 100 index points × $50 = $5,000 gain. Two contracts = $10,000 profit. Total margin posted = 2 × $12,000 = $24,000. Return on margin = $10,000 / $24,000 = 41.7%. This demonstrates leverage: a 2% move in the index produced a 41.7% return on capital deployed. The same leverage works against you — a 2% decline would lose $10,000 (41.7% of your margin).",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Futures Contracts
       ================================================================ */
    {
      id: "deriv-2",
      title: "Futures Contracts",
      description:
        "Standardized specs, margin requirements, roll-over, contango vs backwardation, basis",
      icon: "Clock",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Anatomy of a Futures Contract",
          content:
            "Every futures contract has standardized specifications set by the exchange. Understanding these specs is essential before trading.\n\n**Key contract specifications:**\n- **Underlying**: What is being bought/sold (crude oil, gold, S&P 500, corn)\n- **Contract size**: The quantity per contract (e.g., 1,000 barrels of oil, 100 oz of gold)\n- **Tick size**: The minimum price movement (e.g., $0.01/barrel = $10/contract for crude)\n- **Expiration month**: Contracts expire on specific dates (March, June, September, December are common)\n- **Settlement**: Physical delivery (commodities) or cash settlement (equity indices)\n- **Exchange**: CME Group (most US futures), ICE, Eurex\n\n**Popular futures markets:**\n- **ES** (E-mini S&P 500): $50 × index, cash settled\n- **NQ** (E-mini Nasdaq 100): $20 × index, cash settled\n- **CL** (WTI Crude Oil): 1,000 barrels, physical delivery\n- **GC** (Gold): 100 troy oz, physical delivery\n- **ZB** (30-Year Treasury Bond): $100,000 face value, physical delivery\n\n**Physical vs Cash Settlement:**\nMost retail traders never take physical delivery — they close or roll their positions before expiration. Equity index futures are cash settled (no one delivers 500 stocks).",
          highlight: [
            "contract specifications",
            "tick size",
            "expiration",
            "physical delivery",
            "cash settlement",
          ],
        },
        {
          type: "teach",
          title: "Margin Requirements and Mark-to-Market",
          content:
            "Futures use a **margining system** that differs fundamentally from stock purchases:\n\n**Initial Margin:**\n- The minimum deposit required to open a position\n- Set by the exchange (SPAN margin) and may be increased by brokers\n- Typically 3–15% of the contract's notional value\n- Example: Crude oil futures require ~$5,000 initial margin on a $60,000 contract (8.3%)\n\n**Maintenance Margin:**\n- The minimum account balance required to maintain the position\n- Usually 70-80% of initial margin\n- If your balance falls below this, you receive a **margin call**\n\n**Mark-to-Market (Daily Settlement):**\n- Every day at market close, all futures positions are marked to their settlement price\n- Gains are credited; losses are debited from your account in cash — daily\n- This differs from stocks where unrealized P&L doesn't affect your cash until you sell\n- Daily settlement prevents large unrealized losses from accumulating unchecked\n\n**Margin Call:**\n- If daily losses reduce your balance below maintenance margin, your broker demands more funds\n- Failure to meet the margin call = positions liquidated at market price\n- In volatile markets, margin calls can cascade and force unwanted exits at the worst times",
          highlight: [
            "initial margin",
            "maintenance margin",
            "margin call",
            "mark-to-market",
            "daily settlement",
          ],
        },
        {
          type: "teach",
          title: "Contango, Backwardation, and the Roll",
          content:
            "**The term structure of futures** describes how prices vary across different expiration months. This structure has major implications for traders and ETF investors.\n\n**Contango:**\n- Futures prices for later months are *higher* than the spot price\n- Normal for commodities with storage costs (oil, grain) — you pay more for future delivery\n- **Example**: Spot oil = $70, 3-month futures = $73, 6-month = $76\n- ETFs that roll futures forward in contango continuously buy high and sell low — creating a **negative roll yield** that erodes returns over time\n\n**Backwardation:**\n- Futures prices for later months are *lower* than the spot price\n- Occurs when immediate demand is high (supply squeeze) or when dividends exceed financing costs\n- **Example**: Spot oil = $90, 3-month futures = $87, 6-month = $84\n- ETFs benefit from positive roll yield in backwardation\n\n**The Roll:**\n- Futures expire; a continuous trader must 'roll' — close the expiring contract and open the next month\n- Roll dates matter: the transition between months can cause price slippage\n- Most index futures roll quarterly (March, June, September, December)\n\n**Basis:**\n- Basis = Spot Price − Futures Price\n- Narrows to zero at expiration (convergence)\n- Basis risk: the risk that the spot-futures relationship changes unexpectedly",
          highlight: [
            "contango",
            "backwardation",
            "roll yield",
            "basis",
            "term structure",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An oil ETF tracks crude oil by continuously buying the front-month futures contract and rolling it to the next month. The oil market is in contango (each successive month is higher priced). What happens to the ETF's performance compared to the spot price of oil over time?",
          options: [
            "The ETF underperforms spot oil — rolling from cheaper expiring contracts to more expensive new ones creates a drag (negative roll yield)",
            "The ETF outperforms spot oil — buying cheaper contracts and selling them at higher prices creates profit",
            "The ETF perfectly tracks spot oil — the rolling process is cost-neutral",
            "The ETF outperforms because contango signals strong future demand",
          ],
          correctIndex: 0,
          explanation:
            "In contango, each roll involves selling the cheaper near-term contract and buying the more expensive far-term contract. You're continuously selling low and buying high. This 'negative roll yield' creates persistent drag. Over time, even if spot oil stays flat, the ETF loses value. This is why long-term holders of oil ETFs like USO have historically underperformed the spot crude price during periods of persistent contango.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In a futures contract, unrealized losses only affect your account when you close the position — similar to holding stocks at a loss.",
          correct: false,
          explanation:
            "This is a key difference between futures and stocks. Futures use daily mark-to-market (daily settlement): every trading day, your account is credited or debited with the day's profit or loss in cash. Unrealized losses immediately reduce your cash balance and can trigger a margin call if you fall below maintenance margin. With stocks, unrealized losses don't affect your cash until you sell — your account shows a paper loss but you don't face a cash call.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You bought 1 crude oil futures contract (1,000 barrels) at $75/barrel. Initial margin: $6,000. Maintenance margin: $4,500. Over the next 3 days: Day 1: price falls to $73.50 ($1.50 × 1,000 = -$1,500). Day 2: price falls to $72.80 ($0.70 × 1,000 = -$700). Day 3: price falls to $72.20 ($0.60 × 1,000 = -$600).",
          question:
            "After Day 3, what has happened to your account and what action is required?",
          options: [
            "Account balance = $3,200 ($6,000 - $2,800 total losses); below maintenance margin of $4,500 — you face a margin call to restore to initial margin",
            "Account balance = $6,000 — losses are only realized when you close the position",
            "Account balance = $3,200; below maintenance but no action required until you choose to close",
            "Account balance = $4,200 (Day 1 loss only); still above maintenance margin",
          ],
          correctIndex: 0,
          explanation:
            "Daily mark-to-market means each day's loss is immediately debited. Total loss over 3 days: $1,500 + $700 + $600 = $2,800. Account balance = $6,000 - $2,800 = $3,200. This is below the maintenance margin of $4,500, triggering a margin call. You must deposit additional funds to restore the account to the initial margin level ($6,000), or your broker will liquidate the position. Failure to meet the margin call by market open could result in forced liquidation.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Options Basics Deep Dive
       ================================================================ */
    {
      id: "deriv-3",
      title: "Options Basics Deep Dive",
      description:
        "Intrinsic vs extrinsic value, moneyness, put-call parity, synthetic positions",
      icon: "GitBranch",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Intrinsic Value and Extrinsic Value",
          content:
            "An option's premium (price) has two components:\n\n**Intrinsic Value:**\n- The immediate exercise value — the profit if you exercised right now\n- For a Call: max(Stock Price − Strike Price, 0)\n- For a Put: max(Strike Price − Stock Price, 0)\n- Can never be negative\n\n**Example:**\n- Stock at $50, Call with $45 strike: Intrinsic = $50 - $45 = $5\n- Stock at $50, Put with $55 strike: Intrinsic = $55 - $50 = $5\n\n**Extrinsic Value (Time Value + Volatility Premium):**\n- Everything in the option's price above intrinsic value\n- Extrinsic = Option Premium − Intrinsic Value\n- Reflects: time to expiration, implied volatility, interest rates, dividends\n- Decays over time (theta decay) — accelerates as expiration approaches\n- At expiration, all extrinsic value is zero; premium = intrinsic value only\n\n**Why this matters:**\n- Buyers of options are paying intrinsic + extrinsic\n- Sellers of options are harvesting the extrinsic value decay\n- A deep in-the-money option is mostly intrinsic; behaves like the stock\n- An at-the-money option is mostly extrinsic; highly sensitive to time and volatility changes",
          highlight: [
            "intrinsic value",
            "extrinsic value",
            "time value",
            "theta decay",
            "implied volatility",
          ],
        },
        {
          type: "teach",
          title: "Moneyness: ITM, ATM, OTM",
          content:
            "**Moneyness** describes the relationship between an option's strike price and the current underlying price.\n\n**For a Call Option:**\n- **In-the-Money (ITM)**: Strike < Current Price (has intrinsic value; would profit if exercised now)\n  - Example: $45 strike call when stock is at $50 → $5 intrinsic\n- **At-the-Money (ATM)**: Strike ≈ Current Price (maximum extrinsic value; highest gamma)\n  - Example: $50 strike call when stock is at $50 → $0 intrinsic, all extrinsic\n- **Out-of-the-Money (OTM)**: Strike > Current Price (no intrinsic value; all extrinsic/time premium)\n  - Example: $55 strike call when stock is at $50 → $0 intrinsic\n\n**For a Put Option (reversed):**\n- ITM: Strike > Current Price\n- ATM: Strike ≈ Current Price\n- OTM: Strike < Current Price\n\n**Delta as a moneyness proxy:**\n- Deep ITM options have delta near 1.0 (call) or -1.0 (put)\n- ATM options have delta near 0.50 (call) or -0.50 (put)\n- Deep OTM options have delta near 0.0\n- Delta ≈ approximate probability the option expires in-the-money\n\n**Practical note**: OTM options are cheaper but have a lower probability of profit. ITM options cost more but have higher probability of profit and behave more like the underlying.",
          highlight: [
            "in-the-money",
            "at-the-money",
            "out-of-the-money",
            "delta",
            "moneyness",
          ],
        },
        {
          type: "teach",
          title: "Put-Call Parity and Synthetic Positions",
          content:
            "**Put-Call Parity** is one of the most elegant relationships in finance. It states that for European options on the same underlying, same strike, and same expiration:\n\n**C - P = S - PV(K)**\n\nWhere:\n- C = Call price, P = Put price\n- S = Current stock price\n- PV(K) = Present value of the strike price (K / (1 + r)^T)\n\n**Intuition**: A call minus a put equals the stock minus the present value of cash. If this relationship breaks, arbitrageurs immediately exploit it, restoring equilibrium.\n\n**Synthetic Positions** — replicating any position using combinations of calls, puts, and stock:\n\n| Synthetic | Construction |\n|-----------|-------------|\n| Synthetic Long Stock | Long Call + Short Put (same strike) |\n| Synthetic Short Stock | Short Call + Long Put (same strike) |\n| Synthetic Long Call | Long Stock + Long Put |\n| Synthetic Long Put | Short Stock + Long Call |\n\n**Why synthetics matter:**\n- Sometimes creating a synthetic is cheaper due to margin, fees, or liquidity\n- Market makers use synthetics to hedge their books perfectly\n- Understanding put-call parity lets you spot and avoid mispriced options",
          highlight: [
            "put-call parity",
            "synthetic position",
            "arbitrage",
            "European option",
            "synthetic long",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A stock trades at $100. A $100 strike call costs $6.00. A $100 strike put costs $4.50. Risk-free rate is approximately 0% (ignore for simplicity). What does put-call parity imply about the pricing?",
          options: [
            "The options are mispriced — put-call parity requires C - P = S - K = 0, so both should be equal at $5.25 each",
            "The pricing is correct — calls always cost more than puts",
            "The put is mispriced and should be $6.00 to match the call",
            "Put-call parity only applies to exotic options, not standard equity options",
          ],
          correctIndex: 0,
          explanation:
            "At a 0% risk-free rate, put-call parity states C - P = S - K. For an ATM option (S = K = $100): C - P = 0, meaning calls and puts should have the same price. With C = $6.00 and P = $4.50, C - P = $1.50 ≠ 0. There is a mispricing that arbitrageurs would exploit (buy the put, sell the call, buy the stock). In practice, small discrepancies exist due to early exercise premium (American options), dividends, and borrowing costs.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "An at-the-money (ATM) call option has more extrinsic value (time value) than a deeply in-the-money call option with the same expiration.",
          correct: true,
          explanation:
            "ATM options have maximum extrinsic value because uncertainty about the final outcome is highest — the stock could easily end above or below the strike by expiration. Deep ITM options have high intrinsic value and minimal extrinsic value because the outcome is more certain (the call is very likely to expire in-the-money). Deep OTM options also have little extrinsic value because they are unlikely to ever gain intrinsic value. ATM is the 'sweet spot' of maximum uncertainty, and therefore maximum time/volatility premium.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are bullish on stock XYZ trading at $80. You can either: (A) Buy 100 shares at $80 each for $8,000. (B) Buy one $80 strike call option expiring in 60 days for $4.50 premium ($450 total for one contract = 100 shares). Both positions profit if the stock rises.",
          question:
            "What is the key advantage AND disadvantage of the option position compared to buying the shares?",
          options: [
            "Advantage: Maximum loss is $450 (premium paid) vs $8,000 for shares; Disadvantage: Option decays (loses extrinsic value) over time even if the stock stays flat",
            "Advantage: The option profits more in dollar terms for any given price rise; Disadvantage: Options expire worthless if not exercised",
            "Advantage: Options never lose value; Disadvantage: They cost more than the shares",
            "Advantage and disadvantage are equal — options and shares are equivalent investments",
          ],
          correctIndex: 0,
          explanation:
            "The call option limits maximum loss to the $450 premium (defined risk) versus the $8,000 at risk owning shares. However, the option suffers theta (time) decay — even if XYZ stays at $80 for 60 days, the option loses all its extrinsic value and expires worthless. The stock owner suffers no time decay; they still own $8,000 of stock. This trade-off — defined risk vs time decay — is the central tension in options buying.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Options Strategies
       ================================================================ */
    {
      id: "deriv-4",
      title: "Options Strategies",
      description:
        "Covered call, protective put, vertical spreads (debit/credit), straddle, strangle",
      icon: "Layers",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Income Strategies: Covered Call and Cash-Secured Put",
          content:
            "The most popular options strategies for income generation use the time decay (theta) of options premiums.\n\n**Covered Call:**\n- Own 100 shares of stock + sell 1 call option against them\n- You collect the call premium immediately\n- If stock stays below the strike: keep premium as income, retain shares\n- If stock rises above strike: shares are 'called away' at the strike price\n- Best for: neutral-to-slightly-bullish view; generating income on existing holdings\n- Maximum profit = premium + (strike − purchase price) if called away\n- Risk: Stock falls sharply; premium partially offsets the loss but doesn't fully protect\n\n**Cash-Secured Put:**\n- Sell a put option while keeping enough cash to buy the shares if assigned\n- Collect premium; obligated to buy shares at the strike price if stock falls below\n- Best for: You'd be happy owning the stock at the strike price anyway\n- Example: Stock at $50; sell $47 strike put for $1.50 → you buy shares at $47, but effective cost is $45.50 ($47 - $1.50)\n\n**Both strategies:** They are mathematically equivalent via put-call parity. A covered call on 100 shares = a cash-secured put at the same strike. Both are 'short volatility' positions — you profit when the stock stays calm.",
          highlight: [
            "covered call",
            "cash-secured put",
            "theta decay",
            "premium",
            "assignment",
          ],
        },
        {
          type: "teach",
          title: "Protective Put and Vertical Spreads",
          content:
            "**Protective Put (Portfolio Insurance):**\n- Own 100 shares + buy 1 put option\n- The put gives you the right to sell at the strike price, capping downside\n- Cost: the put premium (ongoing 'insurance cost')\n- The combination (stock + put) acts like a call option — unlimited upside, capped downside\n- Best for: protecting profits on a position while staying long\n\n**Vertical Spreads:**\nBuy one option and sell another at a different strike in the same expiration. Limits both profit and risk.\n\n**Bull Call Spread (Debit):**\n- Buy lower strike call + Sell higher strike call\n- Pay net debit; profit if stock rises to/above higher strike\n- Maximum profit = difference between strikes − debit paid\n- Example: Buy $50 call at $4, sell $55 call at $1.50 → Net debit $2.50; Max profit $2.50; Max loss $2.50\n\n**Bear Put Spread (Debit):**\n- Buy higher strike put + Sell lower strike put\n- Pay net debit; profit if stock falls\n\n**Bull Put Spread (Credit):**\n- Sell higher strike put + Buy lower strike put\n- Receive net credit; profit if stock stays above the higher strike\n- Maximum loss = spread width − credit received\n\n**Key trade-off of spreads:** Lower cost and defined risk vs capped maximum profit.",
          highlight: [
            "protective put",
            "vertical spread",
            "debit spread",
            "credit spread",
            "bull call spread",
          ],
        },
        {
          type: "teach",
          title: "Volatility Plays: Straddle and Strangle",
          content:
            "Straddles and strangles are **non-directional** strategies — they profit from a large move in either direction, not from a specific price target.\n\n**Long Straddle:**\n- Buy 1 ATM call + Buy 1 ATM put (same strike, same expiration)\n- Profits if the stock moves significantly in either direction\n- Maximum loss = total premium paid (if stock doesn't move at all)\n- Best for: Trading around earnings, FDA decisions, FOMC meetings — when you expect a big move but don't know which way\n\n**Long Strangle:**\n- Buy 1 OTM call + Buy 1 OTM put (different strikes)\n- Cheaper than a straddle (OTM options cost less)\n- Requires an even larger move to be profitable\n- Trade-off: Lower cost, higher breakeven points\n\n**Short Straddle / Short Strangle:**\n- Selling volatility — profit if the stock stays in a range\n- Maximum profit = premium collected\n- Maximum loss = unlimited (for short straddle); very large for short strangle\n- Best for: After a high-volatility event, when implied vol is elevated and you expect it to fall\n\n**Breakeven for a long straddle:**\n- Upper breakeven = Strike + Total Premium\n- Lower breakeven = Strike − Total Premium\n- The stock must move beyond one of these points to profit",
          highlight: [
            "straddle",
            "strangle",
            "non-directional",
            "implied volatility",
            "breakeven",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A company reports earnings in 3 days. Implied volatility on its options has surged to 80% (from a normal 30%). You believe the stock will move sharply but don't know which direction. Which strategy best fits this view?",
          options: [
            "Long straddle — buy ATM call and put to profit from a large move in either direction",
            "Short straddle — sell ATM call and put to profit from elevated premium",
            "Covered call — sell a call to earn income while holding shares",
            "Bull call spread — defined-risk bullish bet on the stock rising",
          ],
          correctIndex: 0,
          explanation:
            "A long straddle profits from a large move in either direction — perfect when you expect high volatility but are uncertain about direction. The short straddle is the opposite: it profits if the stock stays near the strike after earnings (which is risky if the move is large). The covered call and bull call spread both require a directional view, which you don't have here.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A bull call spread has unlimited upside profit potential, just like buying a naked call option.",
          correct: false,
          explanation:
            "A bull call spread has capped maximum profit. When you sell the higher-strike call (to reduce cost), you also give up the right to profit above that strike. Maximum profit = (high strike − low strike) − net debit. This is the trade-off of spreads: lower cost and defined risk on both sides, but capped upside. A naked long call has unlimited profit potential but costs more premium.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You own 100 shares of XYZ at $95/share (current price $95). You are modestly bullish but worried about a potential 15% correction. You could: (A) Do nothing. (B) Buy a $90 strike put for $2.50 (protective put). (C) Sell a $100 strike call for $2.00 (covered call). (D) Do both B and C — a collar strategy.",
          question:
            "Which strategy provides the most downside protection while costing the least net premium?",
          options: [
            "Option D (Collar) — the covered call premium partially offsets the protective put cost; net cost is only $0.50 per share",
            "Option B (Protective Put only) — provides pure downside protection at $2.50",
            "Option C (Covered Call) — collects $2.00 but offers no real downside protection",
            "Option A (Do nothing) — you avoid all option costs",
          ],
          correctIndex: 0,
          explanation:
            "A collar = long protective put + short covered call. Net cost = $2.50 (put) - $2.00 (call collected) = $0.50 per share. This provides protection below $90 while costing only $0.50 — much less than the $2.50 for the protective put alone. The trade-off: your upside is capped at $100. This is one of the most widely used strategies by institutional investors to protect large stock positions at low cost.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Volatility Trading
       ================================================================ */
    {
      id: "deriv-5",
      title: "Volatility Trading",
      description:
        "Implied vs realized vol, VIX, vol crush around earnings, long vs short gamma",
      icon: "Activity",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Implied Volatility vs Realized Volatility",
          content:
            "**Volatility** is the most important input in options pricing — and it is directly tradeable.\n\n**Realized Volatility (Historical Vol):**\n- What the stock actually did — measured from past price data\n- Calculated as the annualized standard deviation of daily returns\n- A stock that moves ±2% per day has a realized vol of ~32% (2% × √252 trading days)\n- Backward-looking: it tells you what happened, not what will happen\n\n**Implied Volatility (IV):**\n- The market's expectation of future volatility, implied by current options prices\n- Derived by solving the Black-Scholes equation backwards for volatility given the market price\n- Forward-looking: it tells you what the market expects\n- IV is the key variable that options traders watch, buy, and sell\n\n**The Vol Risk Premium:**\n- Empirically, implied volatility is almost always *higher* than subsequent realized volatility\n- This 'vol risk premium' is systematically earned by options sellers over time\n- Buyers pay more for protection than the actual risk warrants on average\n- This is why mechanical options selling strategies (e.g., selling SPX puts) have historically been profitable\n\n**Comparing IV to HV:**\n- IV > HV: Options are 'expensive' — potential edge for sellers\n- IV < HV: Options are 'cheap' — potential edge for buyers",
          highlight: [
            "implied volatility",
            "realized volatility",
            "vol risk premium",
            "Black-Scholes",
            "IV rank",
          ],
        },
        {
          type: "teach",
          title: "The VIX and Market Fear",
          content:
            "The **VIX** (CBOE Volatility Index) is the most widely watched volatility measure in the world.\n\n**What it measures:**\n- 30-day implied volatility of the S&P 500 index\n- Derived from prices of S&P 500 options across all strikes\n- Often called the 'fear gauge' — rises when markets are fearful, falls in calm periods\n\n**VIX levels and their meaning:**\n- Below 15: Complacent/calm market conditions\n- 15–20: Normal market environment\n- 20–30: Elevated uncertainty; some stress\n- 30–40: High fear; major market concern\n- Above 40: Panic/crisis (COVID March 2020 hit 82; 2008 crisis hit 89)\n\n**VIX as a contrarian indicator:**\n- VIX spikes often mark near-term market bottoms (fear peaks when selling climaxes)\n- VIX below 12 for extended periods often precedes corrections (complacency)\n- The phrase: 'When the VIX is high, it's time to buy; when the VIX is low, it's time to go'\n\n**Trading the VIX:**\n- VIX itself is not directly tradeable\n- Instruments: VIX futures, VIX options, volatility ETFs (VXX, UVXY, SVXY)\n- VIX ETFs suffer severe roll yield erosion in normal contango markets — poor long-term holds",
          highlight: ["VIX", "fear gauge", "fear index", "volatility ETF", "contango"],
        },
        {
          type: "teach",
          title: "Vol Crush Around Earnings and Long vs Short Gamma",
          content:
            "**Earnings Vol Crush:**\n- Before earnings, implied volatility rises as uncertainty builds\n- After earnings, uncertainty resolves — IV collapses regardless of which direction the stock moves\n- This 'vol crush' destroys the value of long options even if the stock moves significantly\n- Example: Stock moves +5% on earnings but IV falls from 80% to 30% → long call buyer may still lose money\n- Short vol traders deliberately sell options before earnings to collect the premium crash\n\n**Long Gamma (Long options):**\n- Gamma measures how fast delta changes with the stock price\n- Long options (calls or puts) have positive gamma: as the stock moves your way, your position accelerates\n- Long gamma benefits from large moves; hurts from time passing without movement (negative theta)\n- Metaphor: You're buying a lottery ticket — small cost, big payout if you're right\n\n**Short Gamma (Short options):**\n- Selling options gives you negative gamma: delta works against you as the stock moves\n- Short gamma positions are hurt by large moves but benefit from time passing (positive theta)\n- Short gamma = collecting rent — steady income until a big move wipes it out\n- Risk: Short gamma losses can be sudden and severe (selling strangles before a crash)\n\n**The gamma-theta trade-off:**\n- Buying options: Pay theta (time decay daily) to own gamma (lottery ticket)\n- Selling options: Collect theta (daily income) but risk gamma (explosive loss on big moves)",
          highlight: [
            "vol crush",
            "gamma",
            "theta",
            "long gamma",
            "short gamma",
            "earnings",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Stock ABC has implied volatility of 65% heading into earnings. After the earnings report (stock moves +8%), implied volatility immediately drops to 28%. You had bought an at-the-money call the day before earnings for $5.00. What happened to the value of your call?",
          options: [
            "The call likely lost significant value or broke even — the 8% stock gain was offset or exceeded by the vol crush from 65% to 28%",
            "The call is worth significantly more — the stock moved in your direction by 8%",
            "The call is worth exactly $5.00 — vol crush and stock move cancel out perfectly",
            "The call expires worthless — any earnings move over 5% triggers automatic expiration",
          ],
          correctIndex: 0,
          explanation:
            "Vol crush is one of the most common traps for options beginners. The drop in IV from 65% to 28% destroys extrinsic value — often more than the gain from the stock's 8% move. ATM options are almost entirely extrinsic value, so they get hit hardest by vol crush. Many traders have bought calls before earnings, seen the stock rise, and still lost money. This is why experienced options traders often sell options before earnings (to collect the premium) rather than buy them.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A trader with a long gamma position benefits from large moves in the underlying stock in either direction, even though they pay time decay (theta) daily.",
          correct: true,
          explanation:
            "Long gamma (e.g., long straddle) means your position accelerates as the stock moves — in either direction. If the stock moves up, your call gains faster; if it moves down, your put gains faster. The cost is theta: you pay daily time decay while waiting for the move. Long gamma positions are therefore suitable when you expect a large move soon (e.g., before an earnings announcement) but lose money slowly in quiet, sideways markets.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "It is 2 weeks after a major market crash. The VIX has spiked to 45 (from a pre-crash level of 14). Implied volatility on individual stocks is 60-90%. Historical realized volatility over the past month is 55%. Most of the selling pressure appears to be subsiding. You have $10,000 to deploy.",
          question:
            "Which volatility strategy is best positioned for the current environment?",
          options: [
            "Sell options (e.g., cash-secured puts or credit spreads) — IV at 45-90% is far above normal; vol crush likely as fear subsides and VIX normalizes",
            "Buy straddles on multiple stocks — VIX at 45 means big moves will continue",
            "Buy long-dated calls — stocks always recover after crashes so directional upside is clear",
            "Avoid all options — high IV makes all options too expensive to trade profitably",
          ],
          correctIndex: 0,
          explanation:
            "When VIX is at 45 (historically elevated) and implied vol far exceeds its long-term average, the vol risk premium is unusually wide. As fear subsides, IV mean-reverts lower — options sellers profit from both the passage of time (theta) and the collapse in implied volatility. Selling cash-secured puts or credit spreads collects high premiums with defined risk. Long straddles would suffer if the market stabilizes (vol crush). High IV is exactly when options are most attractively priced for sellers.",
          difficulty: 3,
        },
      ],
    },
  ],
};
