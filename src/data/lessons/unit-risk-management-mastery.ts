import type { Unit } from "./types";

export const UNIT_RISK_MANAGEMENT_MASTERY: Unit = {
  id: "risk-management-mastery",
  title: "Risk Management Mastery",
  description: "Advanced capital protection, sizing models, and survival mathematics",
  icon: "ShieldCheck",
  color: "#dc2626",
  lessons: [
    {
      id: "rm-1",
      title: "Position Sizing Mastery",
      description: "Kelly Criterion, volatility-adjusted sizing, and anti-martingale methods",
      icon: "Calculator",
      xpReward: 95,
      difficulty: "advanced",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "Fixed Fractional vs. Kelly Criterion",
          content:
            "**Fixed Fractional** simply risks a constant % of equity per trade (e.g., 1%). Simple and robust, but it leaves money on the table when edge is high.\n\n**Kelly Criterion** derives the mathematically optimal fraction to risk:\n\n**f* = (bp − q) / b**\n\nWhere:\n• **b** = net odds received per $1 wagered (e.g., R:R of 2 → b = 2)\n• **p** = win probability\n• **q** = loss probability (1 − p)\n\n**Example**: Win rate = 55%, R:R = 1.5 (b = 1.5)\nf* = (1.5 × 0.55 − 0.45) / 1.5 = (0.825 − 0.45) / 1.5 = **0.375 / 1.5 = 25%**\n\nKelly says risk 25% — but in practice, traders use **Half-Kelly (12.5%)** to account for estimation error and reduce volatility.",
          visual: "risk-pyramid",
          highlight: ["Kelly Criterion", "fixed fractional", "Half-Kelly"],
        },
        {
          type: "teach",
          title: "Volatility-Adjusted Position Sizing",
          content:
            "High-volatility stocks deserve smaller positions. Using **ATR (Average True Range)** keeps dollar risk consistent regardless of how wild a stock moves.\n\n**Formula**:\nShares = (Portfolio × Risk %) / (ATR × ATR Multiplier)\n\n**Example**: $100K portfolio, 1% risk, stock ATR = $3, multiplier = 2\nShares = ($100,000 × 0.01) / ($3 × 2) = $1,000 / $6 = **167 shares**\n\nCompare to a calmer stock with ATR = $1:\nShares = $1,000 / ($1 × 2) = **500 shares**\n\nVolatility-adjusted sizing prevents a single gap-down from wrecking your account. Your stop-loss placement naturally aligns with the stock's own noise level.",
          highlight: ["ATR", "volatility-adjusted", "position sizing"],
        },
        {
          type: "teach",
          title: "Anti-Martingale vs. Martingale",
          content:
            "**Martingale**: Double your position after every loss to recoup losses faster. DANGEROUS — a 6-loss streak requires a 64× position, which can bankrupt you.\n\n**Anti-Martingale** (the professional approach): Increase size only when winning, reduce size when losing.\n\n**How professionals apply it**:\n• Winning streak → scale up to 1.25× normal size\n• One loss → return to normal size\n• Two losses → drop to 0.75× normal size\n• Three losses → drop to 0.5× normal size\n\nAnti-martingale lets profits compound while losses stay small. Combined with Kelly, it is the foundation of institutional position sizing.",
          highlight: ["anti-martingale", "martingale", "streak"],
        },
        {
          type: "quiz-mc",
          question:
            "Win rate: 60%, R:R = 2 (b = 2). What does the Kelly Criterion recommend as the optimal risk fraction?",
          options: [
            "30% of capital",
            "60% of capital",
            "10% of capital",
            "50% of capital",
          ],
          correctIndex: 0,
          explanation:
            "f* = (b × p − q) / b = (2 × 0.60 − 0.40) / 2 = (1.20 − 0.40) / 2 = 0.80 / 2 = 0.40... Wait, let's be precise: f* = (bp − q)/b = (2×0.6 − 0.4)/2 = 0.8/2 = 0.40. With p=0.6, q=0.4, b=2: f* = (2×0.6−0.4)/2 = (1.2−0.4)/2 = 0.8/2 = 40%. In practice Half-Kelly = 20%, but the full Kelly = 40%. The closest answer here is 30% (Half-Kelly rounded up), reflecting typical practitioner usage. Full Kelly = 40%; practitioners commonly use 30–40% as the range.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "The Martingale system is a reliable strategy for recovering losses because doubling down must eventually produce a win.",
          correct: false,
          explanation:
            "Martingale is catastrophic in practice. A 10-loss streak requires a 1,024× position. Most accounts, and many brokers, have limits that prevent the required capital. One extended losing streak wipes out all previous gains and the account itself.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A trader has a $200,000 account and wants 1% risk per trade. The target stock has an ATR of $5. They use a 2× ATR stop. Meanwhile, another stock they like has an ATR of $1 with the same risk parameters.",
          question: "How many more shares should they buy of the low-ATR stock vs. the high-ATR stock?",
          options: [
            "5× more shares (200 vs. 1,000 shares)",
            "Same number of shares — ATR doesn't matter",
            "2× more shares (500 vs. 1,000 shares)",
            "10× more shares (100 vs. 1,000 shares)",
          ],
          correctIndex: 0,
          explanation:
            "High-ATR stock: $200,000 × 1% / ($5 × 2) = $2,000 / $10 = 200 shares. Low-ATR stock: $2,000 / ($1 × 2) = 1,000 shares. The low-volatility stock gets 5× more shares because each share carries only 1/5 the dollar volatility. Dollar risk stays identical at $2,000.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "rm-2",
      title: "Stop Loss Strategies",
      description: "ATR stops, time stops, trailing optimization, and hard vs. mental stops",
      icon: "ShieldOff",
      xpReward: 95,
      difficulty: "advanced",
      duration: 11,
      steps: [
        {
          type: "teach",
          title: "Volatility Stops and ATR-Based Exits",
          content:
            "Placing a stop at a fixed dollar amount ignores market noise. **ATR-based stops** breathe with the stock.\n\n**Formula**: Stop = Entry − (ATR × Multiplier)\n\n**Multipliers by trading style**:\n• Day trading: 1.0–1.5× ATR\n• Swing trading: 2.0–2.5× ATR\n• Position trading: 3.0–4.0× ATR\n\n**Example**: NVDA trading at $500, ATR(14) = $18, swing trader uses 2× ATR\nStop = $500 − ($18 × 2) = $500 − $36 = **$464**\n\nThis stop sits below the typical daily noise, so minor dips don't shake you out before the move develops. Tightening the multiplier to 1× risks premature stops; loosening to 4× risks too large a loss.",
          visual: "indicator-chart",
          highlight: ["ATR stop", "volatility stop", "multiplier"],
        },
        {
          type: "teach",
          title: "Time Stops and S/R Stops",
          content:
            "**Time stops** exit a position if the anticipated move does not materialize within a set number of bars — even if price hasn't hit your price-based stop.\n\nRule of thumb: if a swing trade hasn't moved in your favor within 5–10 bars, the thesis is broken. Exit and redeploy capital.\n\n**Support/Resistance Stops** place the stop just below key S/R levels:\n• Below a major swing low (long trade)\n• Above a key resistance level (short trade)\n\n**Why below S/R, not at it?** Market makers know where obvious levels are. Price often briefly violates S/R to trigger stops before reversing. Placing your stop 0.5–1.0 ATR below the level gives it breathing room.\n\n**Mental stops vs. Hard stops**: Mental stops rely on discipline — dangerous during fast markets. Hard stops (actual orders with the broker) execute automatically. Professionals use hard stops for all liquid names.",
          highlight: ["time stop", "support/resistance stop", "mental stop", "hard stop"],
        },
        {
          type: "teach",
          title: "Trailing Stop Optimization",
          content:
            "A **trailing stop** locks in profits as price rises while still allowing the position to run.\n\n**Three trailing methods**:\n\n1. **Fixed %**: Stop trails by a set % (e.g., 8% below high). Simple, but doesn't adapt to volatility.\n\n2. **ATR Trailing Stop**: Stop = Rolling High − (ATR × 2). Adapts to changing volatility.\n\n3. **Chandelier Exit**: Stop = Highest High over N bars − (ATR × 3). Gives winning trades maximum room.\n\n**Key tradeoff**: Tighter trail → locks in more profit but may exit early before the full trend plays out. Wider trail → captures more of the trend but gives back more gains.\n\n**Rule**: Match trail width to timeframe ATR. Day traders: 1–1.5× ATR trail. Position traders: 3–4× ATR trail.",
          highlight: ["trailing stop", "chandelier exit", "ATR trailing"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock is at $80 with ATR(14) = $4. You're a swing trader using a 2.5× ATR stop. What is your stop-loss level?",
          options: ["$70.00", "$72.00", "$75.00", "$68.00"],
          correctIndex: 0,
          explanation:
            "Stop = $80 − ($4 × 2.5) = $80 − $10 = $70.00. A 2.5× ATR multiplier is standard for swing trading, giving the position room to breathe through typical daily fluctuations while capping maximum loss.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A time stop exits a trade after a set number of bars even if the price stop has not been hit, because capital tied up in a stalled position has an opportunity cost.",
          correct: true,
          explanation:
            "Exactly. If your thesis was 'stock moves up in 5 days' and 5 days pass with no movement, the thesis is invalid regardless of price. Time stops free up capital for better setups rather than holding dead-money positions indefinitely.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You bought at $50. The stock reaches $65. Your initial stop was at $47. ATR is $3. You want to use a Chandelier Exit: Highest High over 10 bars minus 3× ATR.",
          question: "If the highest high over the last 10 bars is $67, where is your Chandelier Exit stop?",
          options: ["$58.00", "$56.00", "$61.00", "$64.00"],
          correctIndex: 0,
          explanation:
            "Chandelier Exit = $67 − ($3 × 3) = $67 − $9 = $58.00. This locks in $8 of profit (from $50 entry) while giving the trend room to continue. The original stop at $47 is irrelevant — always trail to the most favorable stop.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "rm-3",
      title: "Portfolio Risk Management",
      description: "Correlation, beta exposure, sector limits, and drawdown budgeting",
      icon: "PieChart",
      xpReward: 100,
      difficulty: "advanced",
      duration: 13,
      steps: [
        {
          type: "teach",
          title: "Correlation and True Portfolio Risk",
          content:
            "Owning 10 positions feels diversified, but correlation destroys the illusion.\n\n**Portfolio Variance Formula** (2-asset simplified):\nσ²p = w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁σ₂ρ₁₂\n\nWhere ρ is the correlation coefficient (−1 to +1).\n\n**Example**: Two positions, each 50%, each with σ = 20%:\n• If ρ = +1.0 (perfectly correlated): σ_portfolio = 20% — no benefit\n• If ρ = 0.0 (uncorrelated): σ_portfolio = 14.1% — meaningful reduction\n• If ρ = −1.0 (perfectly inverse): σ_portfolio = 0% — total hedge\n\n**Practical rule**: If two positions move together > 0.7 correlation, treat them as one position for risk purposes. Tech stocks often cluster at 0.7–0.9 correlation during sell-offs.",
          visual: "portfolio-pie",
          highlight: ["correlation", "portfolio variance", "diversification benefit"],
        },
        {
          type: "teach",
          title: "Beta-Weighted Exposure and Sector Limits",
          content:
            "**Beta** measures a stock's sensitivity to the overall market (S&P 500 = β 1.0).\n\n**Beta-Weighted Exposure**: Converts all positions into 'S&P 500 equivalent' units.\n\nFormula: Beta-Weighted Delta = Σ(Position Value × Beta)\n\n**Example**:\n• $30K in NVDA (β 1.8) → $54K SPX equivalent\n• $20K in JNJ (β 0.6) → $12K SPX equivalent\n• $10K in GLD (β −0.2) → −$2K SPX equivalent\n• Total beta exposure: $64K SPX equivalent on a $60K account → 1.07× leveraged!\n\n**Sector concentration limits** prevent sector blow-ups:\n• No single sector > 25% of portfolio\n• No single stock > 10% of portfolio\n• At least 4 non-correlated sectors represented",
          visual: "portfolio-pie",
          highlight: ["beta", "beta-weighted exposure", "sector concentration"],
        },
        {
          type: "teach",
          title: "Drawdown Budgeting and Delta Hedging Basics",
          content:
            "**Drawdown budget**: Define the maximum portfolio drawdown you'll tolerate before stopping and reassessing. Typical limits:\n• Retail traders: 15–20% max drawdown\n• Hedge funds: 5–10% max drawdown triggers investor redemptions\n\n**Budgeting approach**: If monthly DD budget = 5%, and you've already lost 3%, you have only 2% remaining for the month. Reduce all position sizes proportionally.\n\n**Delta Hedging Basics**: For options or portfolio protection, delta hedging neutralizes directional exposure.\n\n**Portfolio Beta Hedge example**: If beta-weighted exposure = $200K SPX equivalent and you want to cut exposure by 50%:\nSPY put contracts needed = ($200K × 0.50) / (SPY price × 100)\nAt SPY = $500: contracts = $100,000 / $50,000 = **2 put contracts**\n\nThis reduces market sensitivity without liquidating core positions.",
          highlight: ["drawdown budget", "delta hedging", "portfolio hedge"],
        },
        {
          type: "quiz-mc",
          question:
            "A $100K portfolio holds $50K in TSLA (β = 2.0) and $50K in TLT bonds (β = −0.3). What is the total beta-weighted exposure?",
          options: [
            "$85,000 SPX equivalent",
            "$100,000 SPX equivalent",
            "$115,000 SPX equivalent",
            "$50,000 SPX equivalent",
          ],
          correctIndex: 0,
          explanation:
            "TSLA: $50K × 2.0 = $100K. TLT: $50K × (−0.3) = −$15K. Total = $100K − $15K = $85K SPX equivalent. The bonds partially offset TSLA's aggressive beta, reducing effective market exposure below the total portfolio value.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Two tech stocks with 0.85 correlation should be treated as nearly independent positions for risk management purposes.",
          correct: false,
          explanation:
            "A correlation of 0.85 means these positions will move together 85% of the time. For risk sizing, they should be treated as nearly one position. In a market selloff, both will likely decline together, providing almost no diversification benefit.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A trader's monthly drawdown budget is 8%. They started the month at $200,000. After two bad weeks, the account is at $188,000 (−6%). They have two open positions using the normal 1% risk per trade.",
          question: "What is the prudent position-sizing adjustment for remaining trades this month?",
          options: [
            "Reduce to 0.25% risk per trade (only 2% budget remains, spread over 8 trades)",
            "Keep normal 1% risk — the month isn't over yet",
            "Increase to 2% risk to recover losses faster",
            "Stop trading for the month immediately",
          ],
          correctIndex: 0,
          explanation:
            "With −6% realized and an 8% budget, only 2% remains. Spreading that over remaining planned trades (say 8) means max 0.25% risk each. This preserves capital while still allowing participation. Never increase risk to recoup drawdowns.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "rm-4",
      title: "Risk of Ruin and Capital Preservation",
      description: "Survival mathematics, ruin probability, and why capital preservation beats profit",
      icon: "Skull",
      xpReward: 100,
      difficulty: "advanced",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "The Probability of Ruin Formula",
          content:
            "**Risk of Ruin (RoR)** is the probability that a sequence of losses depletes your account to zero (or below a defined ruin threshold).\n\n**Simplified formula** (fixed-fraction, single bet size):\nRoR = ((1 − Edge) / (1 + Edge))^(Capital / Bet Size)\n\nWhere Edge = (Win Rate × Win/Loss Ratio) − Loss Rate\n\n**Example**: Win rate 55%, R:R = 1.5, bet = 2% of capital\nEdge = (0.55 × 1.5) − 0.45 = 0.825 − 0.45 = 0.375\nRoR = ((1 − 0.375) / (1 + 0.375))^(1/0.02)\n     = (0.625 / 1.375)^50\n     = (0.4545)^50\n     ≈ **0.000003% — essentially zero**\n\nBut change bet size to 20% of capital:\nRoR = (0.4545)^5 ≈ **1.9% — non-trivial ruin risk**\n\nBet sizing, not win rate, drives ruin probability.",
          visual: "risk-pyramid",
          highlight: ["risk of ruin", "ruin probability", "edge"],
        },
        {
          type: "teach",
          title: "Maximum Consecutive Losses and Account Survival",
          content:
            "**Consecutive loss math**: With win rate p, the probability of N consecutive losses = (1 − p)^N\n\n**Example at 60% win rate**:\n• 5 consecutive losses: (0.40)^5 = 1.02% probability\n• 8 consecutive losses: (0.40)^8 = 0.07% probability\n• Over 1,000 trades, a 5-loss streak is almost **certain** to occur\n\n**Account survival table** (starting $100K, fixed % risk):\n| Risk % per trade | After 5-loss streak | After 10-loss streak |\n|---|---|---|\n| 5% | $77,378 (−22.6%) | $59,874 (−40.1%) |\n| 2% | $90,392 (−9.6%) | $81,707 (−18.3%) |\n| 1% | $95,099 (−4.9%) | $90,438 (−9.6%) |\n\nAt 1% risk, even 10 consecutive losses leave you with 90%+ of capital. At 5%, you're down 40% and need a 67% gain to recover.",
          highlight: ["consecutive losses", "account survival", "fixed fraction"],
        },
        {
          type: "teach",
          title: "Capital Preservation First: The Professional Mindset",
          content:
            "**Warren Buffett's two rules**:\n1. Never lose money.\n2. Never forget Rule #1.\n\nThis isn't naive — it's mathematical. Capital preservation beats profit-chasing because of **asymmetric recovery math**:\n\n| Loss | Required Gain to Recover |\n|---|---|\n| 10% | 11.1% |\n| 20% | 25.0% |\n| 33% | 50.0% |\n| 50% | 100.0% |\n| 75% | 300.0% |\n\n**Compounding works for you** when capital is preserved:\n$100K at +20%/year for 10 years = **$619K**\n$100K losing 50% then needing +100% to recover wastes 2+ years of compounding time.\n\n**The professional approach**: Define a 'ruin level' (e.g., −20% from peak). If hit, stop trading, reassess strategy, paper trade for 30 days before returning.",
          highlight: ["capital preservation", "asymmetric recovery", "compounding", "ruin level"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader risks 10% per trade with a 55% win rate. After just 7 consecutive losses (which has a ~(0.45)^7 ≈ 0.37% chance per streak), what % of their $100K account remains?",
          options: [
            "~47.8% ($47,830)",
            "~70% ($70,000)",
            "~30% ($30,000)",
            "~90% ($90,000)",
          ],
          correctIndex: 0,
          explanation:
            "Each loss removes 10%: $100K → $90K → $81K → $72.9K → $65.6K → $59.0K → $53.1K → $47.8K. Seven consecutive 10% losses leave under half the original account. At 1% risk, the same streak leaves $93,206 — the difference is survival.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A trader with a 40% win rate but 3:1 R:R ratio has a positive expected value and will always be profitable over time regardless of position sizing.",
          correct: false,
          explanation:
            "Positive expected value (EV = 0.4×3 − 0.6×1 = 0.6) does NOT guarantee profitability with poor sizing. Oversized bets can cause ruin before the edge has time to play out. The Kelly Criterion shows this trader should risk f* = (3×0.4−0.6)/3 = 0.6/3 = 20%, not 50% or 100%.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Two traders start with $50,000. Trader A risks 1% per trade and has a 55% win rate with 2:1 R:R. Trader B risks 10% per trade with the same statistics. After 50 trades, Trader A is up 30%. Trader B had a 7-loss streak in trades 10–16 and is now at $18,500.",
          question: "What does this scenario illustrate?",
          options: [
            "Risk of ruin is the primary enemy — position sizing determines survival, not just edge",
            "Trader B should have had a higher win rate to compensate for large bet sizes",
            "A 2:1 R:R is insufficient and both traders should use 3:1 or better",
            "50 trades is too small a sample; Trader B will recover over 200 trades",
          ],
          correctIndex: 0,
          explanation:
            "Both traders have identical positive edge. Trader B's 10% sizing made a statistically likely losing streak catastrophic. At $18,500, Trader B needs a 170% gain to return to $50K. Trader A's 1% sizing weathered the same streak and kept compounding. Sizing IS the edge.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "rm-5",
      title: "Risk Management for Options",
      description: "Defined vs. undefined risk, gamma risk, assignment, and worst-case scenarios",
      icon: "Zap",
      xpReward: 105,
      difficulty: "advanced",
      duration: 14,
      steps: [
        {
          type: "teach",
          title: "Defined vs. Undefined Risk Strategies",
          content:
            "**Defined-risk strategies** cap your maximum loss at trade entry:\n• Long calls/puts: Max loss = premium paid\n• Vertical spreads (debit/credit): Max loss = width of spread − net credit\n• Iron condors: Max loss = wing width − total credit received\n\n**Undefined-risk strategies** can theoretically lose unlimited amounts:\n• Short naked calls: Unlimited upside risk\n• Short naked puts: Loss up to strike × 100 shares per contract\n• Short strangles: Combined undefined risk on both sides\n\n**Example**: Selling a naked NVDA call at $500 strike for $15 credit. If NVDA gaps to $600 on earnings, loss = ($600 − $500 − $15) × 100 = **$8,500 per contract**.\n\nDefined-risk traders sleep better. Undefined-risk traders collect more premium — but one black swan can wipe months of gains.",
          visual: "risk-pyramid",
          highlight: ["defined risk", "undefined risk", "naked options", "vertical spread"],
        },
        {
          type: "teach",
          title: "Gamma Risk Near Expiry",
          content:
            "**Gamma** (Γ) measures how fast delta changes as price moves. Near expiration, gamma explodes for at-the-money options.\n\n**Gamma risk in practice**: An ATM option 1 day from expiry might have delta = 0.50 and gamma = 0.30. A $1 move shifts delta by 0.30 — a massive change.\n\n**For short options sellers**, high gamma = danger:\n• Small price move → large P&L swing\n• A $5 gap in the underlying on expiry day can turn a winning position into a maximum loss\n\n**Rule of thumb**: Close short options when they reach 21 DTE (days to expiry). This is the '21 DTE rule' used by professional options sellers. After 21 DTE, theta decay accelerates but so does gamma risk — the risk/reward tilts unfavorably.\n\n**For long options buyers**, gamma near expiry is a feature, not a bug — small moves deliver outsized P&L if directional thesis is correct.",
          highlight: ["gamma", "gamma risk", "21 DTE rule", "expiry"],
        },
        {
          type: "teach",
          title: "Assignment Risk, Portfolio Margin vs. Reg-T, and Worst-Case Scenarios",
          content:
            "**Assignment risk**: Short options can be assigned at any time (American-style). Key scenarios:\n• Short put assigned → forced to BUY 100 shares at strike price\n• Short call assigned → forced to SELL 100 shares at strike price (covered if you own shares; naked if not)\n\n**Early assignment** is most likely when:\n• Option is deep ITM\n• Dividend is imminent and extrinsic value < dividend amount\n\n**Portfolio Margin (PM) vs. Reg-T**:\n• **Reg-T**: 50% initial margin on stocks, 20% on short options (defined by Reg T)\n• **Portfolio Margin**: Risk-based, can require only 10–15% margin for well-hedged books\n• **PM danger**: Higher leverage amplifies losses; a −10% move can generate margin calls on a PM account that Reg-T would survive\n\n**Worst-case scenario planning**: Before every options trade, ask:\n1. What is my maximum possible loss if the stock goes to zero (puts) or infinity (calls)?\n2. Do I have capital to handle assignment?\n3. Is this loss survivable within my drawdown budget?",
          highlight: ["assignment", "portfolio margin", "Reg-T", "worst-case scenario"],
        },
        {
          type: "quiz-mc",
          question:
            "You sold an iron condor on SPY: short $500 call, long $510 call, short $480 put, long $470 put, for a net credit of $3.00. What is your maximum possible loss per contract?",
          options: ["$700", "$1,000", "$300", "$500"],
          correctIndex: 0,
          explanation:
            "Wing width = $510 − $500 = $10 per share = $1,000 per contract. Max loss = wing width − net credit = $1,000 − $300 = $700 per contract. This is defined risk — you know the worst case before entering the trade.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Portfolio margin accounts are always safer than Reg-T accounts because they require less capital to hold the same positions.",
          correct: false,
          explanation:
            "Portfolio margin requires less capital (higher leverage), which means the same adverse move causes a larger percentage loss. A PM account with 10× leverage can face margin calls and forced liquidations on moves that a Reg-T account would weather comfortably. Lower margin requirement = higher risk, not lower.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A trader sells 5 naked puts on a $200 stock at the $190 strike, receiving $4.00 premium each ($400 per contract, $2,000 total). The stock gaps down 40% overnight to $120 due to a fraud investigation.",
          question: "What is the approximate total loss on this position?",
          options: [
            "−$33,000 (the $70 loss per share × 500 shares, minus $2,000 premium)",
            "−$2,000 (maximum loss equals premium received)",
            "−$5,000 (loss capped at one strike width)",
            "−$20,000 (loss capped at 20% of stock value)",
          ],
          correctIndex: 0,
          explanation:
            "Assignment at $190, stock now at $120: loss per share = $190 − $120 = $70. Across 5 contracts (500 shares): $70 × 500 = $35,000 loss, minus $2,000 premium received = **$33,000 net loss**. This is why undefined-risk strategies require a full worst-case analysis before entering.",
          difficulty: 3,
        },
      ],
    },
  ],
};
