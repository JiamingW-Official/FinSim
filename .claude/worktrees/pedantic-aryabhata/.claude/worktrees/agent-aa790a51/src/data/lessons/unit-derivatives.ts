import type { Unit } from "./types";

export const UNIT_DERIVATIVES: Unit = {
  id: "derivatives",
  title: "Derivatives & Risk Management",
  description:
    "CFA/IB-level derivatives theory: futures, Black-Scholes, hedging, rate derivatives, credit instruments, and exotic options",
  icon: "Shield",
  color: "#0891b2",
  lessons: [
    /* ================================================================
       LESSON 1 — Futures vs Options
       ================================================================ */
    {
      id: "derivatives-1",
      title: "Futures vs Options",
      description:
        "Mechanics, margin, leverage comparison, and pricing between futures and options contracts",
      icon: "ArrowLeftRight",
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "Futures: Obligatory Forward Contracts",
          content:
            "A **futures contract** is a standardized, exchange-traded agreement to buy or sell a specified quantity of an underlying asset at a predetermined price (the **futures price**) on a specified future date. Unlike options, futures contracts create an **obligation** on both parties — the buyer must take delivery and the seller must deliver (or cash-settle).\n\n**Key mechanics:**\n- **Underlying assets**: Equity indices (E-mini S&P 500 /ES), commodities (crude oil /CL, gold /GC), currencies (EUR/USD), interest rates (10-year Treasury /ZN)\n- **Contract specifications**: Each contract has a fixed notional size. The E-mini S&P 500 (/ES) contract = $50 × index level. At S&P 500 = 5,000, one /ES contract controls $250,000 notional.\n- **Daily settlement (Mark-to-Market)**: Futures positions are marked to market daily. Gains and losses are credited/debited to your margin account every trading day — not at expiration. This is a critical distinction from options.\n- **Cash settlement vs. physical delivery**: Most financial futures (equity, rate) settle in cash. Most commodity futures allow physical delivery but are usually rolled or cash-settled before delivery.\n\n**Delivery months**: Futures trade in specific quarterly cycles. S&P 500 futures trade March (H), June (M), September (U), and December (Z) expiration months.",
          highlight: [
            "futures contract",
            "futures price",
            "mark-to-market",
            "notional size",
            "cash settlement",
          ],
        },
        {
          type: "teach",
          title: "Margin in Futures: Initial, Maintenance, and Variation",
          content:
            "Futures margin is fundamentally different from options margin — it is a **performance bond**, not a down payment.\n\n**Three types of futures margin:**\n\n1. **Initial Margin**: The deposit required to open a futures position. Set by the exchange (CME Group, ICE). For /ES: ~$12,000 per contract controlling $250,000 notional = approximately 4.8% of notional.\n\n2. **Maintenance Margin**: The minimum balance required to keep the position open. For /ES: ~$10,800. If your account falls below this, you receive a **margin call**.\n\n3. **Variation Margin**: The daily mark-to-market cash flow. If /ES falls 10 points ($500/contract/10 points × $50), $500 is immediately debited from your account and credited to the short position holder. This happens every day.\n\n**Leverage calculation:**\nE-mini S&P 500 at 5,000: $250,000 notional ÷ $12,000 initial margin = **20.8:1 leverage**\n\n**Comparison to stock on margin:**\nRegulation T allows 50% initial margin on stocks = 2:1 leverage. Futures offer 10-20×+ leverage — far more than stock margin accounts. This amplifies both gains and losses proportionally.",
          highlight: [
            "initial margin",
            "maintenance margin",
            "variation margin",
            "margin call",
            "leverage",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A trader buys 2 E-mini S&P 500 (/ES) contracts at 5,000. Each contract controls $50 × 5,000 = $250,000. Initial margin per contract = $12,000 (total $24,000 deposited). The next day, the S&P 500 falls to 4,940 (-60 points). What is the variation margin call, and what is the new account balance?",
          options: [
            "Variation margin = -$6,000 (60 pts × $50/pt × 2 contracts); account balance = $18,000",
            "Variation margin = -$600; account balance = $23,400",
            "No variation margin — futures only settle at expiration",
            "Variation margin = -$12,000; account falls to $12,000 requiring a full margin call",
          ],
          correctIndex: 0,
          explanation:
            "Each point in /ES is worth $50. A 60-point decline = $50 × 60 = $3,000 per contract × 2 contracts = $6,000 total loss, debited immediately from the account via daily mark-to-market. New balance = $24,000 - $6,000 = $18,000. Since $18,000 > $21,600 maintenance threshold (2 × $10,800), no margin call yet, but the trader is moving toward one. If the S&P dropped another 36 points, the balance would breach maintenance margin and a margin call would be issued.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Futures Pricing: Cost of Carry Model",
          content:
            "The fair value of a futures contract is derived from the **cost of carry model**:\n\n`F = S × e^(r−q)T`\n\nWhere:\n- F = Futures fair value\n- S = Current spot price\n- r = Risk-free interest rate (continuously compounded)\n- q = Dividend yield (for equity futures) or convenience yield (for commodities)\n- T = Time to expiration in years\n\n**Example — S&P 500 futures:**\nS&P 500 spot = 5,000, r = 5.25%, q = 1.35% (S&P 500 dividend yield), T = 0.25 years (quarterly):\n`F = 5,000 × e^(0.0525 − 0.0135) × 0.25`\n`F = 5,000 × e^(0.039 × 0.25) = 5,000 × 1.00975 = 5,048.75`\n\nThe futures price is above spot (contango) because the financing cost (5.25%) exceeds the dividend yield (1.35%). You effectively pay interest to carry the position and receive dividends — the net cost of carry is embedded in the futures price.\n\n**Basis**: The difference between spot and futures price: Basis = S - F = 5,000 - 5,048.75 = **-48.75 (negative basis in contango)**. Basis converges to zero at expiration as futures = spot on delivery day.",
          highlight: [
            "cost of carry",
            "contango",
            "backwardation",
            "basis",
            "dividend yield",
            "fair value",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Buying a call option and buying a futures contract on the same underlying are economically equivalent strategies because both profit from upside moves.",
          correct: false,
          explanation:
            "These are fundamentally different. A long call option: (1) requires paying a premium upfront, (2) has defined maximum loss equal to the premium, (3) has positive payoff above the breakeven, and (4) expires worthless if the underlying fails to move. A long futures contract: (1) requires only initial margin (a performance bond, not a cost), (2) has unlimited downside (you can lose far more than the margin), (3) profits from any move above entry price (dollar-for-dollar), and (4) has symmetric gains and losses. Options have limited downside by design; futures have unlimited downside. The option buyer also pays for optionality (extrinsic value) that the futures buyer does not.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A hedge fund manager holds a $10 million S&P 500 equity portfolio and wants to hedge all market risk before a 3-month period of uncertainty. S&P 500 = 5,000. E-mini contracts = $250,000 notional each. Portfolio beta = 1.15.",
          question: "How many /ES contracts should the manager short to fully hedge the portfolio?",
          options: [
            "Short 46 contracts: (Portfolio value × Beta) / Contract notional = ($10M × 1.15) / $250,000 = 46 contracts",
            "Short 40 contracts: Portfolio value / Contract notional = $10M / $250,000 = 40 contracts",
            "Short 100 contracts: Maximum hedge for a $10M portfolio",
            "Short 50 contracts: Round number approximating the $10M / $200,000 margin requirement",
          ],
          correctIndex: 0,
          explanation:
            "The beta-adjusted hedge ratio formula: Number of contracts = (Portfolio Value × Portfolio Beta) / (Futures Price × Contract Multiplier) = ($10,000,000 × 1.15) / (5,000 × $50) = $11,500,000 / $250,000 = 46 contracts. Without beta adjustment, you would under-hedge a high-beta portfolio. If SPY falls 10%, a beta-1.15 portfolio falls ~11.5%. Shorting only 40 contracts hedges only a beta-1.0 equivalent, leaving 1.5% of market exposure unhedged. The beta adjustment ensures the futures short offsets the portfolio's actual sensitivity to market moves.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Black-Scholes Deep Dive
       ================================================================ */
    {
      id: "derivatives-2",
      title: "Black-Scholes Deep Dive",
      description:
        "Model assumptions, inputs, limitations, and the volatility smile paradox",
      icon: "Calculator",
      xpReward: 130,
      steps: [
        {
          type: "teach",
          title: "The Black-Scholes-Merton Formula",
          content:
            "The **Black-Scholes-Merton (BSM) model** (1973) is the foundational framework for pricing European options. Fischer Black, Myron Scholes, and Robert Merton won the Nobel Prize in Economics in 1997 for this work.\n\n**BSM Call Price:**\n`C = S × N(d1) − K × e^(−rT) × N(d2)`\n\n**BSM Put Price:**\n`P = K × e^(−rT) × N(−d2) − S × N(−d1)`\n\nWhere:\n- `d1 = [ln(S/K) + (r + σ²/2) × T] / (σ × √T)`\n- `d2 = d1 − σ × √T`\n- S = Current stock price\n- K = Strike price\n- r = Risk-free rate (continuously compounded)\n- σ = Implied volatility (annualized)\n- T = Time to expiration (in years)\n- N(x) = Cumulative standard normal distribution function\n\n**Intuitive interpretation:**\n- `N(d2)` = Risk-neutral probability the option expires in-the-money\n- `N(d1)` = The 'delta' — the hedge ratio / probability weighted by payoff\n- The formula prices the call as: PV(expected intrinsic value) = probability × (expected payoff if ITM)",
          highlight: [
            "Black-Scholes",
            "BSM",
            "d1",
            "d2",
            "cumulative normal distribution",
            "delta",
          ],
        },
        {
          type: "teach",
          title: "BSM Assumptions and Why They Matter",
          content:
            "The BSM model rests on a set of assumptions, each of which is violated to varying degrees in real markets. Understanding these violations explains why Black-Scholes is a starting point, not the final answer.\n\n**The 7 BSM assumptions:**\n\n1. **Log-normal returns**: Stock prices follow geometric Brownian motion — returns are normally distributed with constant drift. Reality: Fat tails (kurtosis > 3), skewness, and jump processes violate this.\n\n2. **Constant volatility**: σ is constant over the option's life. Reality: Volatility is stochastic (the 'vol of vol'), mean-reverting, and cluster-prone. The entire field of stochastic volatility models (Heston, SABR, rough vol) exists to address this.\n\n3. **No dividends (or continuous dividends)**: Reality: Discrete dividends affect option pricing, particularly for calls near dividend dates.\n\n4. **No transaction costs or taxes**: Reality: Bid-ask spreads, commissions, and capital gains taxes all affect optimal hedging frequency.\n\n5. **Continuous trading**: Can hedge instantaneously and continuously. Reality: Discrete hedging introduces replication error (gamma P&L leakage).\n\n6. **Constant risk-free rate**: Reality: The yield curve is dynamic; long-dated options have significant rho exposure.\n\n7. **European exercise only**: The BSM formula applies to European options. American options require numerical methods (binomial trees, finite difference) due to early exercise optionality.",
          highlight: [
            "log-normal",
            "constant volatility",
            "stochastic volatility",
            "fat tails",
            "geometric Brownian motion",
            "European option",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "AAPL trades at $195. Using Black-Scholes with σ = 25%, r = 5.2%, T = 0.25 years, calculate d2 for the $195 strike call. d1 = 0.1862 (given). What does N(d2) represent?",
          options: [
            "The risk-neutral probability that AAPL finishes above $195 at expiration (approximately 54.7% given d2 = d1 − σ√T = 0.1862 − 0.125 = 0.0612)",
            "The probability that the call option will be exercised under the real-world measure",
            "The delta of the $195 call option",
            "The proportion of the call price attributable to time value",
          ],
          correctIndex: 0,
          explanation:
            "d2 = d1 - σ√T = 0.1862 - (0.25 × √0.25) = 0.1862 - 0.125 = 0.0612. N(d2) = N(0.0612) ≈ 0.5244 (from the standard normal table). This represents the risk-neutral probability that AAPL will close above $195 at expiration. N(d1) is the option's delta (approximately 0.574), which is distinct from N(d2). The call price = $195 × 0.574 - $195 × e^(-0.052×0.25) × 0.524 ≈ $195 × 0.574 - $192.47 × 0.524 ≈ $111.93 - $100.85 = $11.08.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "The Volatility Smile — BSM's Empirical Failure",
          content:
            "If BSM were perfect, options at all strikes would imply the same volatility (since actual volatility is a single number). In practice, options at different strikes imply **different volatilities** when BSM is reverse-engineered — a pattern called the **volatility smile** or **volatility smirk**.\n\n**Equity markets: Volatility smirk (negative skew)**\nOTM puts (low strikes) trade at significantly higher IV than OTM calls (high strikes). At the same distance from the money, a 5% OTM put might imply 32% vol while a 5% OTM call implies 22% vol. This 10-vol-point difference is the **skew**.\n\n**Why the smirk exists:**\n1. **Crash risk / jump risk**: Markets can crash overnight (2008, COVID) but cannot rally infinitely fast. Investors pay a premium for crash protection.\n2. **Leverage effect**: Falling prices → rising financial leverage → rising realized volatility (empirically documented by Black 1976)\n3. **Supply/demand imbalance**: Portfolio managers systematically buy puts; covered call writers sell calls — creating structural IV differences\n\n**Implied vol surface by asset class:**\n- Equities: Smirk (negative skew)\n- Currencies (FX): Symmetric smile (both tails priced higher)\n- Commodities: Positive skew in energy (upside jump risk from supply shocks)\n- Fixed income: Complex surface dependent on rate regime\n\n**Stochastic volatility models (Heston, SABR, rough vol)** are specifically designed to reproduce the observed volatility surface that BSM cannot explain.",
          highlight: [
            "volatility smile",
            "volatility smirk",
            "skew",
            "Heston model",
            "jump risk",
            "leverage effect",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "The Black-Scholes model implies that all options on the same underlying with the same expiration date should have the same implied volatility, regardless of their strike price.",
          correct: true,
          explanation:
            "Correct — this is what Black-Scholes assumes. Since the model uses a single constant volatility σ for all strikes and times, if BSM were a perfect model, backing out the implied volatility from any observed option price should yield the same number. The fact that we observe a volatility smile/smirk (different IVs for different strikes) is direct empirical evidence that BSM's constant-volatility assumption is violated in real markets. This is both the model's greatest limitation and the origin of an enormous industry: volatility surface modeling, exotic options trading, and volatility arbitrage.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A quant trader observes SPY at $450. The 30-DTE $420 put (10.7% OTM) has an implied volatility of 31%. The 30-DTE $480 call (6.7% OTM) has an implied volatility of 19%. The ATM $450 options have IV of 22%.",
          question: "What does this vol surface pattern indicate, and what trade could exploit the skew?",
          options: [
            "Negative skew (equity smirk): OTM puts priced richer than equidistant OTM calls. A risk reversal (short OTM put, long OTM call) sells the expensive downside skew and buys the relatively cheap upside call",
            "Positive skew: OTM calls are priced cheaper than OTM puts, indicating a bull market",
            "Flat surface: The 12-vol-point difference between strikes is within normal BSM assumptions",
            "Arbitrage opportunity: options at different strikes should never have different implied volatilities",
          ],
          correctIndex: 0,
          explanation:
            "The pattern shows classic equity negative skew: OTM puts (31% IV at $420) trade much richer than equidistant OTM calls (19% IV at $480). To exploit this by 'selling skew': a risk reversal (sell the $420 put, buy the $480 call) takes in the high put IV and pays the low call IV. The net position is short the skew — if skew normalizes (put IV falls toward call IV), the trade profits. Risk: skew can widen further in a market selloff, as demand for downside protection intensifies exactly when you are short it.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Hedging Strategies
       ================================================================ */
    {
      id: "derivatives-3",
      title: "Hedging Strategies",
      description:
        "Portfolio delta hedging, protective puts, collars, and hedge ratio calculations",
      icon: "Shield",
      xpReward: 110,
      steps: [
        {
          type: "teach",
          title: "Portfolio Delta Hedging with Index Futures",
          content:
            "Large institutional portfolios use **index futures** to rapidly adjust portfolio beta without selling individual positions — a technique that is faster, cheaper, and more tax-efficient than trading stocks.\n\n**Beta-adjusted hedge ratio:**\n`N = −(Portfolio Value × β_p) / (F × Multiplier)`\n\nWhere N = number of futures contracts (negative = short), β_p = portfolio beta.\n\n**Example:**\nA $50M portfolio with beta = 1.25 wants to reduce beta from 1.25 to 0.60 during a turbulent quarter:\n`ΔN = (β_target − β_current) × Portfolio Value / (F × Multiplier)`\n`ΔN = (0.60 − 1.25) × $50,000,000 / (5,000 × $50)`\n`ΔN = −0.65 × $50,000,000 / $250,000 = **−130 contracts**`\n\nShort 130 E-mini S&P 500 contracts to reduce beta to 0.60. If the market falls 10%, the portfolio (beta 1.25) would lose $6.25M. The 130 short futures gain approximately $650K × 10% × 130 ÷ ... let the math work: 130 × $250,000 × 10% = $3.25M gain, partially offsetting the equity portfolio loss.\n\n**Transaction cost advantage**: Selling futures to reduce beta costs 1-2 basis points round trip. Selling $50M of equities and rebuying later costs 5-15 bps in market impact alone, plus capital gains consequences.",
          highlight: [
            "beta-adjusted hedge",
            "portfolio beta",
            "hedge ratio",
            "index futures",
            "market impact",
          ],
        },
        {
          type: "teach",
          title: "The Collar: Protective Put + Covered Call",
          content:
            "A **collar** is a three-component strategy that bounds both the upside and downside of a stock position. It is the most common hedging structure used by corporate executives, family offices, and institutions managing concentrated positions.\n\n**Structure:**\n- Own shares of stock\n- **Buy** an OTM put (floor — defines maximum downside)\n- **Sell** an OTM call (cap — limits maximum upside)\n- The short call premium offsets (partially or fully) the cost of the protective put\n\n**Zero-cost collar example on NVDA at $520:**\n- Buy $480 put (8 weeks) @ $12.50\n- Sell $570 call (8 weeks) @ $12.50\n- Net cost = $0 (zero-cost collar)\n\n**Guaranteed P&L range:**\n- If NVDA falls to $450: Protected at $480 floor — loss capped at $520 - $480 = $40/share\n- If NVDA stays between $480 and $570: P&L reflects normal stock appreciation\n- If NVDA rallies to $620: Capped at $570 — gain limited to $570 - $520 = $50/share\n\n**Executive hedge use case**: Corporate executives with large unvested stock grants (RSUs) often cannot sell their shares (SEC Rule 144, trading windows). A zero-cost collar protects their wealth without triggering a sale or tax event — a powerful estate and risk planning tool.",
          highlight: [
            "collar",
            "zero-cost collar",
            "protective put",
            "covered call",
            "concentrated position",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An investor owns 10,000 shares of AMZN at $185. She buys 100 contracts of the $170 put at $4.20 and sells 100 contracts of the $205 call at $4.15, creating an approximately zero-cost collar (net cost $0.05 per share). If AMZN falls to $140 at expiration, what is the effective price she receives per share?",
          options: [
            "$170 per share — the put provides a floor regardless of how far AMZN falls below $170",
            "$140 per share — the collar does not fully protect below $170",
            "$185 per share — the original purchase price is fully protected",
            "$165.80 per share — $170 put minus the $4.20 premium paid",
          ],
          correctIndex: 0,
          explanation:
            "The $170 put gives the investor the right to sell at $170, regardless of where AMZN is trading. If AMZN falls to $140, the put is worth $30 (intrinsic value = $170 - $140). The investor effectively receives $170 per share (stock worth $140 + put worth $30 = $170 equivalent). The collar floor is $170. The put premium of $4.20 was mostly offset by the $4.15 call premium sold, so the net cost of this protection was only $0.05 per share — an extremely efficient hedge. The call at $205 would only limit upside above $205, which is irrelevant in a $140 crash scenario.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Minimum Variance Hedge Ratio",
          content:
            "The **minimum variance hedge ratio** (MVHR) is the optimal number of futures contracts to use in a cross-hedge — where the futures and spot do not match exactly (e.g., hedging a specific stock using S&P 500 futures).\n\n**Formula:**\n`h* = ρ × (σ_S / σ_F)`\n\nWhere:\n- h* = Optimal hedge ratio\n- ρ = Correlation between spot price changes and futures price changes\n- σ_S = Standard deviation of spot price changes\n- σ_F = Standard deviation of futures price changes\n\n**Example — hedging TSLA with S&P 500 futures:**\n- TSLA's daily standard deviation: 2.8%\n- S&P 500 futures daily standard deviation: 0.9%\n- Correlation (TSLA, SPY): 0.52\n- MVHR = 0.52 × (2.8% / 0.9%) = 0.52 × 3.11 = **1.62**\n\nFor every $250,000 in TSLA exposure, hedge with $405,000 in S&P 500 futures (1.62 × $250,000).\n\n**Effectiveness limitation**: This cross-hedge removes only 52%² = 27% of the variance (R² = ρ²). TSLA's idiosyncratic risk (earnings surprises, CEO tweets, EV market dynamics) cannot be hedged with a broad market index. Only 27% of TSLA's total variance comes from market-wide movements.",
          highlight: [
            "minimum variance hedge ratio",
            "cross-hedge",
            "correlation",
            "idiosyncratic risk",
            "R-squared",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "A perfect hedge (hedge ratio = 1.0 when the futures and spot are the same asset) completely eliminates all risk from a futures position.",
          correct: false,
          explanation:
            "Even a perfect hedge with the same asset eliminates almost all market risk but retains **basis risk** — the risk that the spot price and futures price do not converge perfectly at expiration. Basis can widen or narrow due to changes in the risk-free rate, dividend yield expectations, or market liquidity. Additionally, the daily mark-to-market of the futures position creates cash flow timing mismatches (the spot position only settles at delivery) — called **tailing the hedge** in practice. True perfect hedges are theoretical; basis risk is an irreducible component of all futures-based hedges.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A CFO of a publicly traded company must exercise 500,000 stock options at $40/share in 6 months (the company's stock currently trades at $80). She is worried about downside risk but cannot sell the shares after exercise for 6 months (SEC lockup). She asks her investment bank to structure a hedge.",
          question: "Which derivative strategy best hedges her position with minimal upfront cost and defined downside protection?",
          options: [
            "A costless (zero-cost) collar: buy $72 puts and sell $95 calls (both 6 months, same number of shares), defining her payoff between $72 and $95 at no net premium cost",
            "Buy $80 puts at fair value — the most straightforward and complete downside protection",
            "Short company stock — the most direct hedge but likely prohibited under SEC rules for insiders",
            "Buy a bull call spread to benefit from upside while partially funding downside protection",
          ],
          correctIndex: 0,
          explanation:
            "The zero-cost collar is the standard institutional solution for this exact problem. The CFO cannot short company stock (SEC insider trading rules), and buying puts costs premium she may not want to spend. The zero-cost collar (buy OTM put, sell OTM call) provides a floor with no upfront cash cost — the short call premium pays for the put. The collar also avoids triggering a constructive sale under IRS rules (unlike a perfect hedge via a short sale), preserving capital gains tax deferral. Investment banks structure these regularly for executives and early employees pre/post-IPO lockup.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Interest Rate Derivatives
       ================================================================ */
    {
      id: "derivatives-4",
      title: "Interest Rate Derivatives",
      description:
        "Rate swaps, bond futures, caps/floors, and duration management for fixed income portfolios",
      icon: "Percent",
      xpReward: 120,
      steps: [
        {
          type: "teach",
          title: "Interest Rate Swaps: The Basics",
          content:
            "An **interest rate swap (IRS)** is an OTC derivative contract where two parties agree to exchange interest payment streams — typically one **fixed** leg for one **floating** leg — on a notional principal amount.\n\n**Mechanics:**\n- **Fixed-rate payer** (long the swap): Pays a fixed rate (the swap rate) and receives a floating rate (SOFR-based, formerly LIBOR)\n- **Floating-rate payer** (short the swap): Pays floating and receives fixed\n- Notional principal: Not exchanged — only net interest cash flows are swapped\n- Settlement: Typically quarterly or semiannual\n\n**Example:**\n- Notional: $100 million, maturity: 5 years\n- Fixed leg: 4.25% per year (paid quarterly)\n- Floating leg: 3-month SOFR + 20 bps (received quarterly)\n- If SOFR rises to 5.0%, the fixed-rate payer receives: (5.0% + 0.20%) - 4.25% = 0.95% × $100M / 4 = **$237,500 net cash inflow per quarter**\n\n**Primary uses:**\n1. **Liability management**: A company with floating-rate debt (bank loan at SOFR + 150) swaps to fixed to eliminate rate uncertainty\n2. **Asset management**: A pension fund receiving fixed coupon bonds swaps to floating to match floating liabilities\n3. **Speculative positioning**: Expressing a view on rate direction without buying or selling bonds",
          highlight: [
            "interest rate swap",
            "fixed-rate payer",
            "floating-rate payer",
            "SOFR",
            "notional principal",
          ],
        },
        {
          type: "teach",
          title: "Duration and Bond Futures for Rate Risk Management",
          content:
            "**Duration** is the primary measure of a bond portfolio's sensitivity to interest rate changes. A portfolio with duration = 7.5 loses approximately 7.5% in value for every 1% rise in interest rates.\n\n**Dollar Duration (DV01):**\n`DV01 = Modified Duration × Portfolio Value / 10,000`\n\nA $50M portfolio with modified duration 7.5:\nDV01 = 7.5 × $50,000,000 / 10,000 = **$37,500 per basis point**\nFor every 1 basis point (0.01%) rise in rates, the portfolio loses $37,500.\n\n**10-year Treasury Note Futures (/ZN):**\n- Each contract controls approximately $100,000 notional of 10-year T-notes\n- DV01 per contract ≈ $85 per basis point at current rates\n- To hedge $37,500 DV01: need $37,500 / $85 = **441 contracts short**\n\n**Duration target adjustment:**\nTo reduce portfolio duration from 7.5 to 4.0:\n`ΔN = (D_target − D_current) × Portfolio Value / (D_futures × Futures Price × Multiplier)`\n\nThis is the bond market equivalent of the equity beta hedge — using futures to rapidly adjust portfolio duration without trading the underlying bonds (which may have wide bid-ask spreads and limited liquidity).",
          highlight: [
            "duration",
            "DV01",
            "dollar duration",
            "bond futures",
            "basis point sensitivity",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A fixed-income portfolio manager holds $200M in investment-grade corporate bonds with modified duration = 8.2. She expects the Fed to hike rates by 50 bps at the next meeting. What is the approximate dollar loss on her portfolio if rates rise 50 bps?",
          options: [
            "$8.2 million loss: 8.2 years duration × 0.50% rate change × $200M = 4.1% × $200M",
            "$1 million loss: based on DV01 of $5,000 per bp × 50 bps",
            "$16.4 million loss: duration squared × rate change × value",
            "$820,000 loss: duration times rate change in absolute terms",
          ],
          correctIndex: 0,
          explanation:
            "Approximate price change formula: ΔP ≈ -D_mod × Δy × P. For a 50 basis point (0.50%) rate increase: ΔP = -8.2 × 0.005 × $200,000,000 = -0.041 × $200,000,000 = -$8,200,000. A portfolio with duration 8.2 years loses approximately 4.1% of value for a 50 bps rate move. This is a first-order approximation (using duration) that ignores convexity — the actual loss is slightly less because bond price-yield relationships are convex (bonds fall less than duration predicts on large rate rises and gain more than duration predicts on rate falls).",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Interest Rate Caps, Floors, and Swaptions",
          content:
            "**Interest rate caps and floors** are option-like instruments on floating interest rates, providing one-sided protection.\n\n**Interest Rate Cap:**\n- A series of call options (caplets) on a reference rate (SOFR)\n- Buyer pays upfront premium; receives payments when SOFR exceeds the cap rate\n- **Use**: A company with floating-rate debt buys a cap to limit its maximum effective interest cost\n- Example: $100M floating loan at SOFR + 150. Buy a 5-year cap at 5.5% for $2.1M upfront\n  - If SOFR rises to 7%: cap pays (7% - 5.5%) × $100M / 4 = $375,000/quarter\n  - Maximum effective borrowing rate: 5.5% + 1.5% spread = 7.0%\n\n**Interest Rate Floor:**\n- A series of put options on a reference rate\n- Pays when rates fall below the floor rate\n- Used by floating-rate asset holders (banks, CLO managers) to protect interest income in low-rate environments\n\n**Swaption (Swap Option):**\n- An option to enter an interest rate swap at a predetermined swap rate\n- **Payer swaption**: Right to pay fixed / receive floating (benefits if rates rise)\n- **Receiver swaption**: Right to receive fixed / pay floating (benefits if rates fall)\n- Used extensively by mortgage servicers, pension funds, and corporate treasuries",
          highlight: [
            "interest rate cap",
            "interest rate floor",
            "caplet",
            "swaption",
            "payer swaption",
            "receiver swaption",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "In an interest rate swap, both parties exchange the full notional principal amount at the initiation and maturity of the contract.",
          correct: false,
          explanation:
            "In a standard (vanilla) interest rate swap, the notional principal is NEVER exchanged — only the net interest payment differentials are settled. This is a defining feature that distinguishes IRS from other exchange-of-payment instruments. If $100M were actually exchanged, there would be no point — you would simply be lending money. The entire value of a swap comes from the interest rate differential over the life of the contract, not from principal exchange. However, in **cross-currency swaps**, the notional principal IS typically exchanged at initiation and maturity (because the two principals are in different currencies with different values).",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A regional bank has a classic asset-liability mismatch: $500M of 30-year fixed-rate mortgages (earning 6.5% fixed) funded by short-term deposits (paying SOFR + 50 bps, currently SOFR = 4.8%, so 5.3%). The bank is worried rates will rise further, squeezing its net interest margin. The treasurer wants to convert some fixed-rate mortgage income to floating.",
          question: "Which swap position would the bank enter to hedge this rate risk?",
          options: [
            "Receive fixed, pay floating (floating-rate payer in a swap): bank receives the swap's fixed rate and pays SOFR, converting fixed mortgage income exposure to floating-rate liability matching",
            "Pay fixed, receive floating (fixed-rate payer): bank pays the swap rate and receives SOFR to offset rising deposit costs",
            "Buy Treasury bond futures to benefit from rate declines that would help fixed-rate assets",
            "The bank has no rate risk because fixed assets and floating liabilities always balance",
          ],
          correctIndex: 0,
          explanation:
            "The bank has asset-liability mismatch: earning fixed (6.5%), paying floating (SOFR+50). If SOFR rises to 6%, the bank earns 6.5% but pays 6.5% — zero margin. To hedge, the bank enters a receive-fixed, pay-floating swap: it receives a fixed swap rate (say 5.5%) and pays SOFR. Now: Mortgage income = 6.5% fixed. Swap payment = SOFR (floating). Swap receipt = 5.5% fixed. Net: 6.5% + 5.5% - SOFR - 5.3% (deposits) = 6.7% - SOFR. The bank has now converted its fixed-rate asset into a floating-rate-equivalent, matching the floating nature of its deposit liabilities. This is the quintessential bank liability management use case for interest rate swaps.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Credit Derivatives
       ================================================================ */
    {
      id: "derivatives-5",
      title: "Credit Derivatives",
      description:
        "CDS mechanics, CDX index, spread interpretation, and credit risk transfer",
      icon: "AlertTriangle",
      xpReward: 120,
      steps: [
        {
          type: "teach",
          title: "Credit Default Swap (CDS) Mechanics",
          content:
            "A **Credit Default Swap (CDS)** is an OTC derivative that functions as insurance against the default of a specific debt issuer (a **reference entity**). It is the foundational instrument of the credit derivatives market.\n\n**Parties:**\n- **Protection buyer** (short credit): Pays a periodic premium (the **CDS spread**) and receives compensation if a **credit event** occurs. Economically: short the credit quality of the reference entity.\n- **Protection seller** (long credit): Receives the spread and must pay the notional amount (minus recovery value) if a credit event occurs. Economically: long the credit quality of the reference entity.\n\n**Credit events** (as defined by ISDA):\n- Bankruptcy\n- Failure to pay\n- Restructuring (debt modification, maturity extension, coupon reduction)\n- Repudiation/moratorium (for sovereign CDS)\n\n**Example — HY Corporate CDS:**\n- Reference entity: Ford Motor Company\n- Notional: $10 million, maturity: 5 years\n- CDS spread: 320 basis points per year\n- Annual premium = 320 bps × $10M = $320,000 (paid quarterly: $80,000/quarter)\n- If Ford defaults with 40% recovery: protection buyer receives $10M × (1 − 0.40) = **$6,000,000**",
          highlight: [
            "credit default swap",
            "CDS spread",
            "credit event",
            "protection buyer",
            "protection seller",
            "recovery rate",
          ],
        },
        {
          type: "teach",
          title: "CDS Spread Interpretation and Implied Probability of Default",
          content:
            "The **CDS spread** encodes the market's assessment of default probability and recovery rates. Understanding this relationship allows you to extract implied default probabilities from market data.\n\n**Simplified default probability extraction:**\n`Annual Default Probability ≈ CDS Spread / (1 − Recovery Rate)`\n\n**Example calculations:**\n- Ford 5-year CDS = 320 bps, recovery rate = 40%\n- Implied annual default probability = 3.20% / (1 − 0.40) = 3.20% / 0.60 = **5.33% per year**\n- 5-year cumulative default probability ≈ 1 − (1 − 0.0533)^5 = 23.7%\n\n**CDS spread level interpretation:**\n- < 100 bps: Investment grade, low default risk (Walmart = ~40 bps, Apple = ~25 bps)\n- 100-300 bps: Crossover (BB-rated high yield), elevated risk\n- 300-600 bps: High yield, meaningful default risk\n- > 600 bps: Distressed, markets pricing significant default probability\n- > 1000 bps: Deeply distressed / expected default\n\n**CDS as credit market barometer**: CDS spreads often move before credit rating agency actions (which are lagging indicators). During the 2008 financial crisis, Lehman Brothers' CDS spread widened from ~150 bps to over 700 bps in the months before its September 2008 bankruptcy — a market-based early warning the ratings agencies missed.",
          highlight: [
            "CDS spread",
            "implied default probability",
            "recovery rate",
            "distressed debt",
            "investment grade",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Tesla's 5-year CDS is trading at 180 basis points with an assumed recovery rate of 40%. What is the market's implied annual probability of default?",
          options: [
            "3.0% per year: 180 bps / (1 − 0.40) = 1.80% / 0.60 = 3.0%",
            "1.8% per year: directly equal to the CDS spread in percentage terms",
            "4.5% per year: 180 bps × recovery rate of 40% / (something)",
            "7.5% per year: 180 bps combined with duration factor",
          ],
          correctIndex: 0,
          explanation:
            "Using the simplified formula: Annual default probability = CDS spread / (1 - recovery rate) = 0.0180 / (1 - 0.40) = 0.0180 / 0.60 = 0.030 = 3.0% per year. This means the market prices approximately a 3% chance of Tesla defaulting in any given year. The 5-year cumulative probability = 1 - (1-0.03)^5 ≈ 14.1%. At 180 bps, Tesla is priced as high-yield crossover territory — significantly riskier than investment-grade tech peers like Apple (~25 bps) but less risky than deeply distressed credits.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "CDX and Credit Index Products",
          content:
            "**CDX** (Credit Default Swap Index) is a family of standardized credit derivative indices that allow investors to take diversified exposure to credit risk without selecting individual names.\n\n**Key CDX series:**\n- **CDX.NA.IG**: 125 investment-grade North American corporate names. Trades in basis points of annual premium. Current level ~80 bps indicates modest IG default expectations.\n- **CDX.NA.HY**: 100 high-yield North American corporate names. Trades in price (like a bond). At $97, implies higher default expectations than at $101.\n- **iTraxx Europe**: European equivalent of CDX.NA.IG\n- **iTraxx Crossover**: 75 sub-investment-grade European names\n\n**Series rolling**: CDX indices roll every 6 months (March and September). The new series incorporates updated composition based on current ratings and liquidity. Traders with positions in old series (off-the-run) can roll to the new series (on-the-run) for better liquidity.\n\n**Tranching**: CDX indices can be tranched into equity (first-loss), mezzanine, senior, and super-senior tranches — exactly as collateralized debt obligations (CDOs) were structured pre-2008. The equity tranche absorbs the first 0-3% of losses; the super-senior tranche (15-100%) absorbs last. This was the core structure of the CDO market that collapsed in 2008.\n\n**Use cases**: hedge fund managers use CDX shorts to express macro bearish credit views. Banks buy CDX protection to hedge their loan book credit exposure.",
          highlight: [
            "CDX",
            "credit index",
            "iTraxx",
            "CDO",
            "tranching",
            "credit risk transfer",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Buying CDS protection (being the protection buyer) is equivalent to shorting the creditworthiness of the reference entity — you profit if the entity's credit quality deteriorates.",
          correct: true,
          explanation:
            "Correct. Buying CDS protection means you pay a premium and profit if a credit event (default, restructuring) occurs. More broadly, if the reference entity's credit spreads widen (deterioration in perceived credit quality), the market value of your CDS protection increases even without a formal credit event — because the protection is now worth more to other market participants who may want to buy it. Conversely, if the entity's credit improves (spreads tighten), your CDS protection declines in value. This is analogous to being short the entity's bonds — both positions profit from credit deterioration. Hedge funds extensively use CDS as a way to express short credit views when shorting bonds directly is impractical.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "It is March 2008. Bear Stearns' 5-year CDS spreads have widened from 80 bps in January to 420 bps. A credit analyst at a hedge fund notes this represents a jump in implied annual default probability from ~1.3% to ~7%.",
          question: "What does this CDS spread widening signal and what action should the fund consider?",
          options: [
            "The CDS market is pricing a dramatically increased risk of Bear Stearns failing; the fund should consider buying Bear Stearns CDS protection as the implied default probability is sharply elevated and may prove accurate",
            "CDS spreads are a lagging indicator; the fund should wait for the credit rating agencies to downgrade before acting",
            "A widening CDS spread always reverses; the fund should sell protection (go long credit) to capture the wide spread",
            "CDS cannot be used to predict bank failures — only deposit outflows matter for bank solvency",
          ],
          correctIndex: 0,
          explanation:
            "Bear Stearns collapsed in March 2008. The CDS market's widening spreads (80 to 420 bps in two months) were a real-time, market-driven early warning signal that the credit agencies failed to capture (Bear Stearns was rated A at the time). Buying CDS protection when spreads were already elevated was expensive but rational: a 7% annual default probability on a major investment bank is historically extreme and suggests systemic stress. The fund that bought CDS at 400 bps and held through Bear Stearns' collapse would have received their notional protected amount when JPMorgan acquired the firm in a Fed-brokered rescue. This episode is a canonical example of credit markets leading equity markets and rating agency actions.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 6 — Exotic Options
       ================================================================ */
    {
      id: "derivatives-6",
      title: "Exotic Options",
      description:
        "Barrier, Asian, binary, and digital options — and their connection to prediction markets",
      icon: "Zap",
      xpReward: 140,
      steps: [
        {
          type: "teach",
          title: "Barrier Options: Knock-In and Knock-Out",
          content:
            "**Barrier options** are path-dependent options whose existence or payoff depends on whether the underlying crosses a specified price level (the **barrier**) during the option's life. They are cheaper than vanilla options because they have an additional condition to satisfy.\n\n**Types:**\n\n**Knock-Out (KO) options**: Exist initially but cease to exist if the underlying touches the barrier.\n- **Down-and-out call**: Standard call that expires worthless if the underlying falls below the barrier at any point before expiration\n  - Example: AAPL at $195, buy 60-DTE $195 call with $170 knock-out barrier @ $5.80 (vs. vanilla call at $9.20). Savings = $3.40 (37% cheaper) in exchange for the risk of barrier breach.\n- **Up-and-out put**: Put that expires if the underlying rallies above the barrier\n\n**Knock-In (KI) options**: Do not exist initially; come to life if the underlying touches the barrier.\n- **Down-and-in put**: Starts worthless; becomes an active put only if the underlying falls to the barrier\n  - Example: Buy $195 put, $175 down-and-in barrier. Only becomes an active put if AAPL falls to $175 — provides disaster coverage at lower cost.\n\n**Key mathematical relationship:**\n`Knock-In + Knock-Out = Vanilla option` (same strike, same barrier, same expiration)\nThis is a powerful identity used for pricing and hedging barrier options.",
          highlight: [
            "barrier option",
            "knock-out",
            "knock-in",
            "down-and-out",
            "path-dependent",
            "barrier breach",
          ],
        },
        {
          type: "teach",
          title: "Asian Options: Average Price and Average Strike",
          content:
            "**Asian options** (also called **average options**) base their payoff on the average price of the underlying over a period, rather than the price at expiration. This averaging feature substantially reduces volatility and therefore premium cost.\n\n**Average price call:**\n`Payoff = max(A_T − K, 0)` where A_T = arithmetic or geometric average of daily prices\n\n**Average strike call:**\n`Payoff = max(S_T − A_T, 0)` where the 'strike' is the average price over the period\n\n**Why Asian options are cheaper:**\nThe average of a price series is far less volatile than the terminal price alone. By Jensen's inequality, the variance of the average is lower than the variance of the terminal value. Lower variance → lower option premium.\n\n**Primary users:**\n- **Commodity companies** (airlines, refiners, manufacturers): their underlying exposure is to the average price paid over a month or quarter, not a single day's price. An airline that buys jet fuel daily wants to hedge the monthly average cost, not a single day's price.\n- **Foreign exchange**: Multinational corporations with continuous FX exposure (daily cash flows) buy Asian FX options to hedge the average rate received over a quarter\n- **Equity compensation**: Some executive compensation plans use an average stock price to determine option value, aligning with average performance rather than end-of-period luck",
          highlight: [
            "Asian option",
            "average price",
            "average strike",
            "path-dependent",
            "commodity hedging",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An airline buys jet fuel daily throughout Q3. It wants to hedge its average Q3 jet fuel cost. Which option type is most appropriate?",
          options: [
            "Asian average-price option on jet fuel: payoff based on Q3 average daily fuel price, directly matching the airline's actual exposure",
            "European put option on jet fuel expiring on September 30: provides protection against price on the final day of Q3",
            "American call option that can be exercised daily when fuel prices spike",
            "Barrier knock-in option that provides protection only after prices pass a threshold",
          ],
          correctIndex: 0,
          explanation:
            "The airline's cost is the average of daily fuel purchases over Q3 — not the price on any single day. A European put expiring September 30 only hedges September 30's price, leaving the airline exposed to the July and August average. An Asian average-price option directly matches the airline's exposure: the payoff is based on the same averaging mechanism as the airline's actual fuel costs. This basis match eliminates the hedge slippage that would occur with a vanilla option. This is the canonical use case for Asian options — perfectly matching a continuous, average-based commercial exposure.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Binary and Digital Options: All-or-Nothing Payoffs",
          content:
            "**Binary options** (also called **digital options**) have fixed, discontinuous payoffs: they pay either a fixed amount or nothing, depending on whether a condition is met at expiration. They are fundamentally different from vanilla options whose payoff scales continuously with the intrinsic value.\n\n**Cash-or-Nothing Binary:**\n- Pays a fixed cash amount Q if S_T > K (call) or S_T < K (put), otherwise pays zero\n- Price ≈ Q × N(d2) × e^(-rT) (from BSM)\n- Example: 'Will SPY close above $450 in 30 days?' Binary pays $100 if yes, $0 if no. Current price ≈ $52 if N(d2) ≈ 55%.\n\n**Asset-or-Nothing Binary:**\n- Pays the value of the underlying if S_T > K, otherwise pays zero\n- Price = S × N(d1) (from BSM)\n\n**Connection to prediction markets:**\nBinary options are mathematically equivalent to prediction market contracts. A prediction market contract that pays $1 if 'Fed raises rates at next meeting' trades at the implied probability. A cash-or-nothing binary that pays $1 if SPY > $450 in 30 days trades at the same risk-neutral probability as N(d2) in BSM. This deep connection means:\n- Prediction market prices = binary option prices = risk-neutral probabilities\n- Options market skew reflects the same information as prediction market pricing differentials\n- Sophisticated traders arbitrage between these markets when prices diverge",
          highlight: [
            "binary option",
            "digital option",
            "all-or-nothing",
            "prediction market",
            "risk-neutral probability",
            "cash-or-nothing",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "A binary (cash-or-nothing) call option that pays $1 if the stock closes above the strike has a fair value equal to the Black-Scholes N(d2) term, discounted at the risk-free rate.",
          correct: true,
          explanation:
            "Correct. In the BSM framework, N(d2) represents the risk-neutral probability that the stock closes above the strike at expiration. The present value of receiving $1 conditional on that event = $1 × N(d2) × e^(-rT). This is precisely the BSM pricing formula for a cash-or-nothing binary call. This is not coincidental — the BSM formula was derived by decomposing a vanilla call into: (asset-or-nothing call) - (cash-or-nothing call × K) = S × N(d1) - K × e^(-rT) × N(d2). The binary option price is the fundamental building block of the BSM model.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A hedge fund manager is analyzing FinSim's prediction market. The contract 'S&P 500 above 5,100 by end of Q2' is trading at $0.38 (pays $1 if yes). Simultaneously, the fund observes that 90-day S&P 500 binary call options with $5,100 strike are trading at $0.42 in the OTC derivatives market.",
          question: "Is there an arbitrage opportunity and how would the fund exploit it?",
          options: [
            "Yes: buy the prediction market contract at $0.38 and sell the binary call at $0.42, locking in $0.04 risk-free profit if both pay $1 for the same event",
            "No: prediction markets and options markets use different probability frameworks, so prices can never be compared",
            "Yes: sell the prediction market at $0.38 and buy the binary call at $0.42 (buy low, sell high)",
            "The arbitrage exists only if realized volatility equals implied volatility at expiration",
          ],
          correctIndex: 0,
          explanation:
            "Both instruments pay exactly $1 if the S&P 500 is above 5,100 in 90 days and $0 otherwise — they are economically identical. The prediction market priced at $0.38 and the binary call at $0.42 represent a $0.04 pricing discrepancy for identical claims. Buy the cheaper instrument (prediction market at $0.38), sell the more expensive one (binary call at $0.42). This locks in $0.04 per unit regardless of outcome: if S&P > 5,100, prediction market pays $1 and binary call costs $1 → net $0. If S&P < 5,100, both pay $0 and you keep the $0.04 received upfront. This is pure arbitrage, subject to execution costs, counterparty risk, and regulatory constraints across market venues.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Volatility Derivatives: VIX and Variance Swaps",
          content:
            "Beyond price-based derivatives, the market has developed instruments that trade **volatility itself** as an asset class.\n\n**VIX (CBOE Volatility Index):**\nCalculated from the prices of S&P 500 options across many strikes, the VIX represents the expected 30-day annualized volatility. It is model-free (does not require BSM assumptions) and represents a portfolio of out-of-the-money SPX options.\n\n**VIX Futures and Options:**\n- VIX futures trade the expected future level of VIX, not current VIX\n- VIX options allow directional vol-of-vol trades\n- Key feature: VIX is **mean-reverting**. Unlike equity prices, VIX reliably returns to historical averages (15-20 for S&P 500). High VIX (>40) tends to fall; low VIX (<12) tends to rise. This makes VIX derivatives fundamentally different to trade than equity derivatives.\n\n**Variance Swap:**\nAn OTC contract that pays the difference between realized variance and implied variance (the strike):\n`Payoff = N_var × (σ²_realized − K_var)`\n\nVariance swaps allow pure volatility exposure without delta hedging. A long variance swap profits when realized volatility exceeds the implied variance strike — capturing the exact same bet as long gamma scalping but without the continuous delta-hedging requirement. Variance swaps were extensively used by hedge funds in the 2000s for pure volatility trading.",
          highlight: [
            "VIX",
            "variance swap",
            "vol of vol",
            "mean-reverting",
            "realized variance",
            "model-free volatility",
          ],
        },
      ],
    },
  ],
};
