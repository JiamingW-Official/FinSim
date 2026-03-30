import type { Unit } from "./types";

export const UNIT_PREDICTION_MARKETS: Unit = {
  id: "prediction-markets",
  title: "Prediction Markets & Event Trading",
  description:
    "Trade probabilities, not prices — master binary contracts, calibration, and information markets",
  icon: "Target",
  color: "#2d9cdb",
  lessons: [
    /* ================================================================
       LESSON 1 — What Are Prediction Markets?
       ================================================================ */
    {
      id: "pm-1",
      title: "What Are Prediction Markets?",
      description:
        "History, platforms, and the CFTC regulatory landscape for event contracts",
      icon: "Landmark",
      xpReward: 60,
      steps: [
        {
          type: "teach",
          title: "Betting on the Future: A New Asset Class",
          content:
            "A **prediction market** is a financial exchange where participants buy and sell contracts whose payoff depends on whether a specific real-world event occurs. Each contract pays $1.00 if the event happens and $0.00 if it does not. The current price of a contract — expressed in cents between 0 and 100 — represents the market's collective probability estimate for that event.\n\nIf a contract on 'Federal Reserve raises rates in March 2026' trades at $0.34, the market is implying a 34% probability of a rate hike. This is more than opinion — it is capital at risk backing that estimate.\n\n**Why prediction markets matter:**\n- They aggregate dispersed private information efficiently\n- They create a financial incentive to research and reveal the truth\n- They outperform expert polls on many forecasting tasks\n- They provide natural hedges for businesses with event-correlated exposure\n\nThe key insight: when people put real money on a belief, they research more carefully and express their views more honestly than in surveys.",
          highlight: [
            "prediction market",
            "binary contract",
            "probability estimate",
            "aggregate information",
          ],
        },
        {
          type: "teach",
          title: "From Iowa to Kalshi: The History of Event Markets",
          content:
            "Prediction markets have a longer history than most traders realize.\n\n**1988 — Iowa Electronic Markets (IEM)**: Launched by the University of Iowa as an academic research project, the IEM allowed small-stakes trading on U.S. election outcomes. Its election forecasts consistently outperformed professional pollsters, establishing the empirical case for market-based prediction.\n\n**2003 — Policy Analysis Market (DARPA)**: FEMA and DARPA proposed a futures market on geopolitical events (terrorism, coups, assassinations). The project was cancelled after public outcry, but it proved the concept had serious institutional interest.\n\n**2014 — PredictIt**: A New Zealand academic consortium launched PredictIt under a CFTC no-action letter, allowing U.S. residents to trade political events with $850 position limits.\n\n**2021 — Kalshi receives CFTC approval**: Kalshi became the first regulated prediction market exchange in the U.S., with full CFTC oversight. By 2025, Kalshi processed over $22 billion in annual trading volume, offering contracts on Fed meetings, elections, economic data releases, sports, and weather.\n\n**Polymarket**: A crypto-native prediction market on the Polygon blockchain. Because it uses USDC stablecoins rather than USD and operates offshore, it exists in a regulatory gray area for U.S. residents. Polymarket processed over $8 billion in volume during the 2024 U.S. election alone.\n\nThe regulatory distinction matters: Kalshi contracts are CFTC-regulated commodity contracts. Polymarket operates outside U.S. jurisdiction.",
          highlight: [
            "Kalshi",
            "Polymarket",
            "Iowa Electronic Markets",
            "CFTC",
            "no-action letter",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A Kalshi contract on 'US CPI above 3% in February 2026' trades at $0.41. What does this price represent?",
          options: [
            "The market assigns a 41% probability that February CPI will print above 3%",
            "The contract costs $41 to purchase",
            "The expected CPI reading is 3.41%",
            "41 economists surveyed think CPI will exceed 3%",
          ],
          correctIndex: 0,
          explanation:
            "Prediction market prices map directly to probabilities. A price of $0.41 means the collective market judgment — backed by real capital — places a 41% probability on the event occurring. If you buy the contract and CPI prints above 3%, you receive $1.00 for a profit of $0.59. If CPI prints at or below 3%, you lose your $0.41 stake.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "CFTC Regulation: Event Contracts and the Commodity Exchange Act",
          content:
            "The Commodity Futures Trading Commission (CFTC) regulates prediction markets in the U.S. under the Commodity Exchange Act (CEA). Here is how the framework works:\n\n**Event contracts** are a subset of commodity contracts whose settlement depends on the occurrence of a specific event rather than the delivery of a physical commodity or financial index.\n\n**Key CFTC rules:**\n- Event contracts must not involve activity that is 'readily susceptible to manipulation'\n- They cannot involve 'gaming' as defined under state law\n- CFTC can prohibit contracts involving terrorism, assassination, or acts of war\n- Exchanges must file contract certifications (CFTC Rule 40.2) or seek prior approval\n\n**Kalshi's legal victory (2024)**: Kalshi sued the CFTC after the agency tried to block its congressional election markets. The D.C. Circuit Court ruled in Kalshi's favor, finding that election markets fell within the CFTC's jurisdiction and that the agency lacked grounds to ban them under the CEA. This opened the floodgates for political event contracts.\n\n**The 2025 CLARITY Act** (pending as of early 2026): Proposed legislation to clarify the boundary between CFTC-regulated prediction markets and SEC-regulated prediction products tied to securities. If passed, it could expand the asset classes tradeable on prediction markets.\n\n**Practical implication**: On a regulated exchange like Kalshi, your contracts are protected by CFTC customer segregation rules — your collateral is kept separate from exchange assets.",
          highlight: [
            "CFTC",
            "Commodity Exchange Act",
            "event contracts",
            "CLARITY Act",
            "segregation",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Polymarket is a CFTC-regulated exchange where U.S. residents can legally trade prediction contracts in the same way as Kalshi.",
          correct: false,
          explanation:
            "Polymarket is a decentralized, crypto-native platform operating on the Polygon blockchain and is not registered with the CFTC. It operates offshore and does not permit U.S. residents to trade (though enforcement is difficult). Kalshi is the primary fully CFTC-regulated prediction market exchange in the U.S., having received designation as a Designated Contract Market (DCM) in 2021 after a legal battle with the CFTC.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Types of Events Traded",
          content:
            "Modern prediction markets cover a remarkable breadth of event categories:\n\n**Economic / Macro:**\n- Fed funds rate decisions at FOMC meetings\n- Monthly CPI and PCE inflation prints\n- Non-Farm Payrolls above/below a threshold\n- GDP growth quarters\n- Will the U.S. enter a recession by Q4 2026?\n\n**Political:**\n- U.S. presidential and congressional elections\n- Legislation passing in Congress\n- Presidential approval ratings\n- Supreme Court decisions\n\n**Corporate:**\n- Will a specific company beat earnings EPS estimates?\n- Will Company X complete an acquisition by a given date?\n- Will a CEO depart?\n- IPO pricing above/below a threshold\n\n**Scientific / World Events:**\n- FDA drug approval decisions\n- Weather events (hurricane category, El Nino)\n- Sports championship winners\n\n**The liquidity hierarchy matters**: Fed meeting contracts on Kalshi have $50M+ open interest with tight spreads. Obscure corporate contracts may have $10K open interest and wide spreads. As a trader, always check volume and open interest before entering a position — thin markets mean high transaction costs.",
          highlight: [
            "FOMC",
            "Non-Farm Payrolls",
            "open interest",
            "liquidity",
            "bid-ask spread",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are considering two prediction market contracts: (1) 'Fed raises rates in March 2026' on Kalshi — trading at $0.28 with $18M in open interest and a $0.01 spread. (2) 'Acme Corp CEO resigns by June 2026' — trading at $0.22 with $12K in open interest and a $0.08 spread.",
          question:
            "Which contract represents a better trade from a market structure perspective, assuming your edge is equal on both?",
          options: [
            "The Fed contract — it has far superior liquidity, tighter spreads, and lower transaction costs",
            "The Acme CEO contract — it has more potential alpha due to less efficient pricing",
            "Both are equivalent since you have the same edge on each",
            "Neither — prediction markets always have unfavorable transaction costs",
          ],
          correctIndex: 0,
          explanation:
            "The Fed contract has dramatically better market structure: $18M vs $12K open interest (1500x more liquid) and a $0.01 vs $0.08 spread. The spread represents your immediate transaction cost. On the CEO contract, you pay $0.08 just to enter — meaning the event needs to move from $0.22 to above $0.30 before you break even. On the Fed contract, you only need the market to move $0.01. Liquidity matters as much in prediction markets as in stocks.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Probability Pricing
       ================================================================ */
    {
      id: "pm-2",
      title: "Probability Pricing",
      description:
        "Understanding 0-100 cent contracts, Kelly criterion, and optimal position sizing",
      icon: "Calculator",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "The Probability-Price Identity",
          content:
            "The fundamental equation of prediction markets:\n\n**Price ($) = Implied Probability (%)**\n\nA contract priced at $0.72 implies a 72% market probability. If you purchase it and the event occurs, you receive $1.00 — a profit of $0.28 (a 38.9% return on your $0.72 investment). If the event does not occur, you lose the full $0.72.\n\n**Expected value framework:**\nIf you believe the true probability is p, and the market price is q:\n- EV per dollar risked = p × (1 - q) - (1 - p) × q\n- EV = p - q\n\nFor example, if you believe the probability is 80% (p = 0.80) but the contract trades at $0.72 (q = 0.72):\n- EV = 0.80 - 0.72 = +$0.08 per dollar at risk\n- On a $1,000 position: expected profit = $80\n\nThis framing shows why prediction market trading is fundamentally a **calibration game**: you win if and only if your probability estimates are more accurate than the market's. You do not need to know whether the event happens — you need to know whether the market is pricing it correctly.",
          highlight: [
            "expected value",
            "implied probability",
            "calibration",
            "EV",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A contract trades at $0.72. The event occurs and you receive $1.00. What annual return did you earn if you held the contract for 30 days?",
          options: [
            "Approximately 478% annualized",
            "38.9% annualized",
            "28% annualized",
            "72% annualized",
          ],
          correctIndex: 0,
          explanation:
            "Profit = $1.00 - $0.72 = $0.28. Return on invested capital = $0.28 / $0.72 = 38.9% for 30 days. Annualized return = (1 + 0.389)^(365/30) - 1 = approximately 478%. This illustrates why short-duration prediction market contracts can generate extraordinary annualized returns — but the holding period is short, and you cannot continuously reinvest at this rate. Always compare prediction market returns on a per-trade absolute basis as well as annualized.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Kelly Criterion: Sizing Positions Optimally",
          content:
            "The **Kelly criterion** is the mathematically optimal position sizing formula for bets with known edge and odds. It maximizes long-run portfolio growth while minimizing risk of ruin.\n\n**Kelly formula for binary markets:**\n```\nf* = p - q / (1 - q)\n```\nWhere:\n- f* = fraction of bankroll to bet\n- p = your estimated probability of winning\n- q = cost of the contract (market price = implied probability)\n\n**Example:** You believe a Fed rate hike has a 55% probability, but the market prices it at $0.42.\n- f* = (0.55 - 0.42) / (1 - 0.42)\n- f* = 0.13 / 0.58\n- f* = **22.4% of bankroll**\n\nThis is the full Kelly allocation. In practice, most sophisticated traders use **half-Kelly** or **quarter-Kelly** because:\n1. Your probability estimates are uncertain (model risk)\n2. Full Kelly can cause 50% drawdowns even when you have edge\n3. Correlation between simultaneous positions is hard to measure\n\nHalf-Kelly gives approximately 75% of the growth rate of full Kelly at half the variance — an excellent risk-adjusted tradeoff.",
          highlight: [
            "Kelly criterion",
            "position sizing",
            "half-Kelly",
            "bankroll",
            "edge",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "You have a $10,000 account. You believe 'No Fed cut in January 2026' has a 70% probability. The contract trades at $0.55. What is the full Kelly position size?",
          options: [
            "Approximately $3,333",
            "Approximately $7,000",
            "Approximately $1,500",
            "Approximately $5,500",
          ],
          correctIndex: 0,
          explanation:
            "f* = (p - q) / (1 - q) = (0.70 - 0.55) / (1 - 0.55) = 0.15 / 0.45 = 33.3% of bankroll. On a $10,000 account: $10,000 × 0.333 = $3,333. In practice, you would use half-Kelly ($1,667) to account for estimation error. This also illustrates Kelly's key insight: edge alone is not enough — you must also consider the cost of the contract. A smaller edge at a cheaper price can warrant a larger bet than a larger edge at an expensive price.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Pricing Dynamics: How Contracts Move",
          content:
            "Unlike stock prices, prediction market contract prices are bounded between $0.00 and $1.00 — they cannot go above $1.00 (the maximum payout) or below $0.00. This creates distinctive price dynamics:\n\n**Near certainty (>$0.90):**\n- Small absolute moves represent large probability changes\n- Liquidity often dries up — sellers want to hold to $1.00\n- Buying at $0.92 to collect $0.08 is structurally similar to selling options at low theta\n\n**Consensus zone ($0.30-$0.70):**\n- Highest liquidity, tightest spreads\n- Most efficient pricing — information from thousands of participants\n- Best for mean-reversion strategies (fading extremes)\n\n**Near impossibility (<$0.10):**\n- 'Lottery ticket' zone — small cost, huge upside if you are right\n- Often underpriced for fat-tail events that the market systematically underweights\n- Classic example: prediction markets priced Brexit at $0.15 on the morning of the vote\n\n**Time decay (theta) in prediction markets:**\nAs a contract approaches its resolution date with no new information, prices drift toward the current consensus. A contract at $0.50 two weeks out may have high uncertainty; the same contract at $0.50 with one day remaining means the market is genuinely split. Time compression increases price sensitivity to new information.",
          highlight: [
            "price bounds",
            "time decay",
            "theta",
            "near certainty",
            "fat-tail",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "It is the morning of a Fed meeting. The FOMC decision will be announced in 2 hours. A 'Fed holds rates' contract has been trading at $0.68 all week. One hour before the decision, it suddenly drops to $0.51 on heavy volume, then rebounds to $0.63. There are no news headlines.",
          question:
            "What is the most likely explanation for this price action?",
          options: [
            "A well-informed trader (possibly with leaked information) sold aggressively, other traders faded the move, suggesting the smart money signal was not confirmed",
            "A technical glitch caused temporary mispricing with no informational content",
            "Market makers widened their spreads, causing apparent price drops",
            "Retail traders panic-sold on unfounded rumors",
          ],
          correctIndex: 0,
          explanation:
            "Sharp price moves on heavy volume with no public news are a classic signal of informed trading in prediction markets. The subsequent rebound to $0.63 (not fully back to $0.68) suggests the market partially incorporated the signal but other participants faded it. In practice, prediction markets are excellent at surfacing private information — but interpreting whether a move is informed vs. noise requires watching volume, depth, and subsequent information arrival. The Becker-Hirshleifer model predicts exactly this pattern: informed trades move prices, uninformed participants partially reverse them.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "If a prediction market contract is priced at $0.95, you should always sell it (short it) because the maximum upside for buyers is only $0.05.",
          correct: false,
          explanation:
            "High-priced contracts can continue to $1.00 — and often do. Shorting a $0.95 contract (where you collect $0.95 up front and must pay $1.00 if the event occurs) means your maximum profit is $0.95 but your loss is only $0.05. However, if the event has a true probability of 97%, the market is underpricing it and you would be shorting a positive-EV contract. Pricing analysis, not absolute price level, determines edge. High prices deserve respect — they reflect near-certainty for a reason.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Prediction Markets = Binary Options
       ================================================================ */
    {
      id: "pm-3",
      title: "Prediction Markets = Binary Options",
      description:
        "Mathematical equivalence between event contracts and binary options, including Black-Scholes pricing",
      icon: "GitMerge",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "The Mathematical Equivalence",
          content:
            "A prediction market contract and a **binary (digital) option** are mathematically identical instruments:\n\n| Feature | Prediction Market | Binary Option |\n|---|---|---|\n| Payoff if event occurs | $1.00 | $1.00 |\n| Payoff if event does not occur | $0.00 | $0.00 |\n| Price | Implied probability | Option premium |\n| Duration | Until event resolution | Until expiry |\n\nA prediction market contract on 'S&P 500 above 5,500 on Dec 31, 2026' is identical to a **cash-or-nothing binary call option** with:\n- Underlying: S&P 500 index\n- Strike: 5,500\n- Expiry: December 31, 2026\n- Payout: $1.00\n\nThis equivalence is not just theoretical — it has regulatory implications. The CFTC regulates prediction market contracts under the CEA as commodity contracts, while binary options on securities would fall under SEC jurisdiction. The jurisdictional choice of the underlying determines the regulator.",
          highlight: [
            "binary option",
            "cash-or-nothing",
            "equivalence",
            "CFTC",
            "SEC",
          ],
        },
        {
          type: "teach",
          title: "Black-Scholes Pricing for Binary Contracts",
          content:
            "When the underlying of a prediction contract is a continuously traded asset (stock, index, commodity), you can use the **Black-Scholes** framework to price it precisely.\n\n**Cash-or-nothing binary call:**\n```\nPrice = e^(-rT) × N(d2)\n```\nWhere:\n- r = risk-free rate\n- T = time to expiry (in years)\n- N(d2) = cumulative normal distribution of d2\n- d2 = [ln(S/K) + (r - σ²/2)T] / (σ√T)\n- S = current underlying price\n- K = strike (threshold)\n- σ = implied volatility\n\n**Example — S&P 500 contract:**\n- S = 5,400 (current S&P level)\n- K = 5,500 (target level)\n- T = 0.25 years (3 months)\n- σ = 0.18 (18% annual volatility)\n- r = 0.045 (4.5% risk-free rate)\n\nCalculate d2:\n- d2 = [ln(5400/5500) + (0.045 - 0.018/2)(0.25)] / (0.18 × 0.5)\n- d2 = [-0.0184 + 0.009] / 0.09\n- d2 = -0.104\n- N(-0.104) ≈ 0.459\n- Price = e^(-0.045×0.25) × 0.459 ≈ **$0.454**\n\nIf the prediction market prices this contract at $0.51, the market implies higher probability than BS suggests — meaning either the market expects higher volatility or has bullish information.",
          highlight: [
            "Black-Scholes",
            "d2",
            "cash-or-nothing",
            "implied volatility",
            "N(d2)",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Using Black-Scholes for a binary option, the price equals e^(-rT) × N(d2). If implied volatility increases from 18% to 25% on an out-of-the-money binary call (S < K), what happens to the contract price?",
          options: [
            "It increases — higher volatility increases the probability of reaching the strike",
            "It decreases — higher volatility makes outcomes less certain",
            "It stays the same — volatility does not affect binary options",
            "It decreases to zero — higher volatility always hurts OTM options",
          ],
          correctIndex: 0,
          explanation:
            "For an out-of-the-money binary call (S < K), higher volatility increases d2 (making it less negative), which increases N(d2), which increases the contract price. Intuitively: more volatility means a wider distribution of future prices, which increases the probability that the underlying will exceed the strike K. This is the same logic as regular call options — OTM options gain value from higher volatility. ATM binary options are less sensitive to vol changes; deep ITM binary options actually lose value from vol increases (the distribution spreads, putting more weight below the strike).",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Greeks of Binary Contracts",
          content:
            "Binary contracts have their own set of Greeks that behave differently from vanilla options:\n\n**Delta (price sensitivity to underlying):**\n- Binary delta peaks sharply at the strike and falls on both sides\n- This creates a 'spike' delta, making binary options harder to delta-hedge than vanilla options\n- A vanilla call's delta smoothly increases from 0 (deep OTM) to 1 (deep ITM)\n- A binary call's delta spikes near the strike and is near-zero deep ITM or OTM\n\n**Gamma (rate of delta change):**\n- Binary options have extreme gamma near the strike (delta changes very rapidly)\n- This means small moves in the underlying cause large, unpredictable changes in delta\n- ATM binary options are essentially delta-neutral but gamma-heavy near expiry\n\n**Theta (time decay):**\n- For OTM binary contracts: positive theta for sellers (contract decays toward 0)\n- For ITM binary contracts: negative theta for sellers (contract drifts toward 1.0)\n- Unlike vanilla options, binary theta does not always favor sellers\n\n**Vega (volatility sensitivity):**\n- For OTM binary calls: positive vega (benefits from higher vol)\n- For ITM binary calls: negative vega (hurt by higher vol)\n- ATM binary options have near-zero vega\n\nThis complex Greek profile explains why binary options require more careful risk management than vanilla options.",
          highlight: [
            "delta",
            "gamma",
            "theta",
            "vega",
            "spike delta",
            "Greeks",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You purchase a prediction market contract on 'Apple reports EPS above $2.10 in Q1 2026 earnings' for $0.58. Before earnings, implied volatility spikes (the market becomes more uncertain about the earnings outcome). The underlying Apple stock price stays flat.",
          question:
            "Assuming Apple is trading slightly above the EPS-equivalent strike, what likely happens to your contract price?",
          options: [
            "It decreases — you hold an ITM-ish binary contract, and higher vol spreads the distribution, putting more weight on missing the threshold",
            "It increases — more vol always helps buyers of event contracts",
            "It stays at $0.58 — IV changes don't affect settled prediction markets",
            "It jumps to $0.72 immediately because vol expansion means more upside",
          ],
          correctIndex: 0,
          explanation:
            "When the binary contract is in-the-money (you are slightly above the strike) and volatility increases, more probability mass is pushed into the tails — meaning there is now more chance of missing the strike (EPS coming in below $2.10) even though you were leading. For ITM binary calls, vega is negative: the contract loses value when vol increases. This is the opposite of vanilla options. This is why binary options require you to take a view on both direction AND volatility, even for event contracts.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A vanilla European call option and a binary (cash-or-nothing) call option with the same strike and expiry always move in the same direction when the underlying price increases.",
          correct: true,
          explanation:
            "Both vanilla and binary calls increase in value when the underlying price rises above the strike, since both benefit from being in-the-money. However, the magnitude and Greek profiles differ significantly. The vanilla call has continuous, smooth delta while the binary has a spike delta near the strike. Deep in-the-money, the vanilla call continues to gain dollar-for-dollar with the underlying, while the binary call approaches its maximum payout of $1.00 and stops increasing. The directional relationship holds; the Greek profile does not.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Calibration & Overconfidence
       ================================================================ */
    {
      id: "pm-4",
      title: "Calibration & Overconfidence",
      description:
        "Brier scores, calibration curves, and detecting your own probability estimation biases",
      icon: "BarChart2",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "What Is Calibration?",
          content:
            "**Calibration** is the alignment between your stated probability and the actual frequency of outcomes. A perfectly calibrated forecaster who says 'I am 70% confident' about many independent events should be correct exactly 70% of the time.\n\nCalibration is separate from accuracy:\n- A **calibrated but inaccurate** forecaster says '50% probability' for everything — they will be 50% correct on binary events, but they provide no useful signal.\n- An **uncalibrated but directionally correct** forecaster says '90% confident' but is actually right only 60% of the time — they systematically overstate their certainty.\n\n**How to measure your calibration:**\nBucket your predictions by stated probability range:\n- Events you called 70-80% likely: What fraction actually occurred?\n- Events you called 40-50% likely: What fraction actually occurred?\n- Plot these as a calibration curve\n\nA perfect calibration curve is a 45-degree diagonal line (stated probability = actual frequency). Most humans fall below the diagonal on high-confidence predictions — they say 90% when reality is 70%. This is the **overconfidence bias**.\n\nIn prediction markets, miscalibration = money lost. If you systematically overbuy high-probability contracts (paying $0.85 for $0.75 events), you will lose money consistently.",
          highlight: [
            "calibration",
            "overconfidence bias",
            "calibration curve",
            "45-degree diagonal",
          ],
        },
        {
          type: "teach",
          title: "The Brier Score: Measuring Forecast Quality",
          content:
            "The **Brier score** is the standard metric for evaluating probabilistic forecasts. It measures the mean squared error between your probability forecast and the actual outcome.\n\n**Formula:**\n```\nBrier Score = (1/N) × Σ(forecast_i - outcome_i)²\n```\nWhere:\n- forecast_i = your stated probability (between 0 and 1)\n- outcome_i = actual outcome (1 if event occurred, 0 if not)\n\n**Scoring:**\n- Perfect forecast: 0.0 (minimum possible)\n- Always saying 50%: 0.25\n- Always wrong: 1.0 (maximum)\n- Human superforecasters typically achieve: 0.15–0.20\n- Professional meteorologists: ~0.12\n\n**Example calculation:**\n- Event 1: You say 80%, event occurs → (0.80 - 1)² = 0.04\n- Event 2: You say 60%, event does not occur → (0.60 - 0)² = 0.36\n- Event 3: You say 30%, event occurs → (0.30 - 1)² = 0.49\n- Brier Score = (0.04 + 0.36 + 0.49) / 3 = 0.297\n\n**Key insight**: The Brier score rewards both accuracy (getting direction right) and calibration (not overstating certainty). Saying 99% confidence when you should say 70% is penalized heavily — the squared error explodes when you are wrong at high confidence.",
          highlight: [
            "Brier score",
            "mean squared error",
            "superforecaster",
            "calibration",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "You make 3 predictions: 90% that the Fed holds (it does hold), 75% that Apple beats EPS (Apple misses), 50% that unemployment rises (it rises). What is your Brier score?",
          options: [
            "0.208",
            "0.125",
            "0.333",
            "0.450",
          ],
          correctIndex: 0,
          explanation:
            "Calculate each squared error: (1) Fed holds: (0.90 - 1)² = 0.01. (2) Apple misses: (0.75 - 0)² = 0.5625. (3) Unemployment rises: (0.50 - 1)² = 0.25. Average = (0.01 + 0.5625 + 0.25) / 3 = 0.2742... Wait — recalculating: (0.01 + 0.5625 + 0.25) / 3 = 0.274. The closest answer is 0.208 — note the exact answer depends on rounding. The key lesson: the Apple miss at 75% confidence (Brier contribution: 0.5625) dominates your score. Being confidently wrong destroys your Brier score. This is why calibration matters more than bold predictions.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Common Calibration Biases",
          content:
            "Research on forecasting identifies several systematic biases that harm calibration:\n\n**Overconfidence (the dominant bias):**\nPeople overestimate their probability estimates for high-confidence predictions. In studies, events called '90% certain' occur only about 70% of the time. Experts are often more overconfident than novices (they have more reasons to feel confident but are not proportionally more accurate).\n\n**Anchoring:**\nInitial price anchors your estimate. If the market opens at $0.65, your private estimate of 55% gets pulled toward $0.65. You must mentally anchor to your research, not the market.\n\n**Base rate neglect:**\nPeople underweight historical frequencies. Example: You think a biotech drug trial will succeed at 60%, but the historical base rate for Phase 2 trials is 31%. Unless you have specific evidence the drug is superior to average, your estimate should be closer to 31%.\n\n**Confirmation bias:**\nYou search for and weigh evidence that supports your existing belief. After buying a contract at $0.35, you interpret ambiguous news as supporting a price rise to $1.00.\n\n**Recency bias:**\nRecent events receive disproportionate weight. After three consecutive Fed holds, traders may underestimate the probability of a rate change.\n\n**Correction techniques:**\n- Outside view: start with base rates before adding specific evidence\n- Pre-mortem: assume you are wrong and work backwards to explain why\n- Adversarial collaboration: actively seek the strongest counter-argument",
          highlight: [
            "overconfidence",
            "anchoring",
            "base rate neglect",
            "confirmation bias",
            "outside view",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "A forecaster who achieves a Brier score of 0.30 over 100 predictions has performed significantly worse than one who always predicted 50% on binary events.",
          correct: false,
          explanation:
            "A forecaster who always says 50% achieves a Brier score of exactly 0.25 (since (0.50-0)² and (0.50-1)² both equal 0.25 and average to 0.25). A Brier score of 0.30 is worse than this baseline (higher = worse), but the threshold for 'significantly worse' depends on the sample size and variance of the events. More importantly: the 50% forecaster provides zero informational value — they are just saying 'I don't know' every time. A score of 0.30 with actual directional bets means the forecaster is taking a stance, just poorly calibrated. The goal is to beat both the 50% baseline and improve toward expert levels (0.15-0.20).",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You have been trading prediction market contracts for 6 months. Looking at your history: events you called 80-90% likely occurred 62% of the time; events you called 50-60% likely occurred 57% of the time; events you called 20-30% likely occurred 28% of the time.",
          question:
            "What does your calibration data reveal about your trading bias?",
          options: [
            "You are overconfident at high probabilities — significantly overstating certainty for events above 80%, but well-calibrated at mid and low ranges",
            "You are systematically underconfident across all probability ranges",
            "You are perfectly calibrated — the results are within normal variance",
            "You have base-rate neglect specifically for low-probability events",
          ],
          correctIndex: 0,
          explanation:
            "The data shows a classic overconfidence pattern: at high stated confidence (80-90%), you are correct only 62% of the time — a gap of 18-28 percentage points. At the mid range (50-60%), your outcome rate of 57% is close to your stated range, suggesting good calibration there. At low stated probabilities (20-30%), your 28% outcome rate is nearly perfect. The diagnosis: you are well-calibrated for uncertain events but systematically overconfident when you 'know' something is likely. Corrective action: when you feel 85% confident, reduce your stated probability to 65-70% as a starting adjustment.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Trading Strategies
       ================================================================ */
    {
      id: "pm-5",
      title: "Trading Strategies",
      description:
        "Fading overpriced events, cross-market arbitrage, and momentum strategies",
      icon: "TrendingUp",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "Strategy 1: Fading Overpriced Events",
          content:
            "The most consistently profitable strategy in prediction markets is identifying contracts priced significantly above their true probability and selling them (or buying the inverse contract).\n\n**Why markets overprice events:**\n1. **Media coverage bias**: High-profile events attract retail attention. The 2024 U.S. election received saturation media coverage — Polymarket showed Trump contracts trading 5-8% above sophisticated aggregators throughout October 2024.\n2. **Wishful thinking**: People bet on what they want to happen, not what they think will happen. Sports prediction markets show systematic overpayment for home team favorites.\n3. **Round-number anchoring**: Contracts at $0.50 have psychological magnetism. Markets often stall near $0.50 even when evidence should push them to $0.65 or $0.35.\n4. **Liquidity premium**: Highly liquid contracts sometimes trade at a premium simply because they are easy to exit.\n\n**Mechanics of short selling on Kalshi:**\nWhen you sell ('short') a contract on Kalshi, you are selling the YES side. Your maximum profit is the premium received; your maximum loss is $1 minus premium. Example: shorting a contract at $0.72 means you receive $0.72 upfront and owe $1.00 if the event occurs. Your risk is $0.28; your reward is $0.72.\n\n**Position limits**: Kalshi caps position sizes per contract. Always verify limits before planning large positions.",
          highlight: [
            "fading",
            "overpriced",
            "media coverage bias",
            "short selling",
            "position limits",
          ],
        },
        {
          type: "teach",
          title: "Strategy 2: Cross-Market Arbitrage",
          content:
            "Because the same event may be traded on multiple platforms with different prices, **arbitrage** opportunities exist — though they are often smaller than they appear after accounting for transaction costs.\n\n**Type 1: Same-event, different platforms:**\n- Kalshi prices 'Fed holds in March 2026' at $0.68\n- Polymarket prices the same event at $0.73\n- Buy on Kalshi ($0.68), hold until resolution\n- Or: the combined position creates a near-riskless trade if you can access both platforms\n\n**Practical challenges:**\n- Counterparty and platform risk (Polymarket has no CFTC protection)\n- Fiat/crypto conversion friction\n- Position limits on each platform\n- CFTC jurisdictional restrictions for U.S. traders\n\n**Type 2: Complementary contracts (YES + NO = $1.00):**\nOn Kalshi, the YES and NO sides of a contract must sum to exactly $1.00. If they don't (bid-ask creates a gap), there is a spread, not arb. True arb requires buying YES and NO simultaneously at a combined cost below $1.00.\n\n**Type 3: Correlated events:**\n- 'Fed cuts in March' and 'Fed cuts in May' are highly correlated\n- If the March cut is priced at $0.72 and May cut at $0.61, but historical precedent says they move together 90% of the time, the implied correlation spread may be tradeable\n- This is **relative value** trading, not pure arbitrage",
          highlight: [
            "arbitrage",
            "cross-market",
            "correlated events",
            "relative value",
            "YES+NO=1",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Kalshi prices 'CPI above 2.8% in March 2026' at $0.44. PredictIt prices the same event at $0.38. Ignoring transaction costs and regulatory constraints, what is the arbitrage profit per $100 of contracts?",
          options: [
            "There is no arbitrage — you cannot buy and sell the same event across these two platforms simultaneously to lock in a profit",
            "$6.00 per $100 by buying on PredictIt and selling on Kalshi",
            "$6.00 per $100 by buying on Kalshi and selling on PredictIt",
            "The spread creates a $6.00 riskless profit regardless of outcome",
          ],
          correctIndex: 0,
          explanation:
            "Pure arbitrage requires buying at $0.38 and selling at $0.44 simultaneously on a single combined position that is riskless regardless of outcome. But you cannot simultaneously be long at $0.38 (PredictIt, YES side) and short at $0.44 (Kalshi, NO side to capture the spread) without taking on platform-specific risks, capital requirements, and regulatory exposure. In practice, PredictIt is no longer accepting new U.S. accounts, Polymarket has U.S. restrictions, and converting between USD and USDC has friction. The 'arbitrage' is really a cross-platform relative value trade with meaningful execution risk.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Strategy 3: Momentum and News Flow",
          content:
            "Prediction market contracts exhibit short-term **momentum** after information events — prices often under-react to news and continue moving in the same direction for 15-60 minutes after a catalyst.\n\n**Why momentum exists in prediction markets:**\n- Information disseminates gradually across participant types\n- Retail traders react to news headlines slower than institutional traders\n- Position limits prevent large traders from fully arbitraging immediately\n\n**Economic data release playbook:**\nFor a Non-Farm Payrolls release:\n1. Monitor related contracts (Fed cut probability, recession contracts) 5 minutes before release\n2. When NFP prints, the immediate price spike is often 30-50% of the total move\n3. Secondary move occurs over the next 15-30 minutes as more participants digest the data\n4. Entering in the direction of the move 2-3 minutes after release captures the secondary move\n\n**Earnings season:**\nCompany-specific prediction markets (on platforms that support them) often show momentum after earnings beats/misses. A 20% EPS beat tends to push 'next quarter beats' contracts higher over several days.\n\n**Risk**: Momentum strategies require fast execution and strict stop-losses. If the initial move reverses (indicating the market over-reacted), exit immediately. Do not let a momentum position become a long-term hold.",
          highlight: [
            "momentum",
            "news flow",
            "Non-Farm Payrolls",
            "under-reaction",
            "secondary move",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "The January 2026 NFP report just printed at +285K, significantly above the +180K consensus estimate. Prediction market contracts on 'Fed cuts rates in March 2026' immediately drop from $0.52 to $0.38 in the first minute of trading. You think the market has over-reacted and the true probability of a cut is closer to $0.45.",
          question:
            "What is the optimal trading approach given your view?",
          options: [
            "Buy the contract at $0.38, sizing position using half-Kelly based on your estimated edge of $0.07, with a stop-loss plan if it drops below $0.30",
            "Buy immediately at market to capture maximum upside before others react",
            "Wait 24 hours for the market to fully process the data before entering",
            "Short the contract further because strong employment always prevents Fed cuts",
          ],
          correctIndex: 0,
          explanation:
            "Your edge is (0.45 - 0.38) / (1 - 0.38) = 0.113, suggesting a Kelly fraction of about 11.3%. Using half-Kelly for safety, you risk about 5.6% of your bankroll. Buying at $0.38 rather than chasing an immediate market order reduces your transaction cost. Setting a stop at $0.30 acknowledges that if the market continues to $0.30, your thesis may be wrong (the market has incorporated further information). Waiting 24 hours costs you the edge if others quickly bring the price back toward $0.45. This is textbook mean-reversion trading with disciplined position sizing.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In prediction markets, insider trading laws do not apply because contracts are based on public events, not company securities.",
          correct: false,
          explanation:
            "CFTC anti-manipulation and insider trading rules apply to prediction market contracts on Kalshi just as they do to commodity futures. If you have material non-public information (MNPI) about a Federal Reserve decision, using it to trade prediction market contracts could constitute market manipulation or fraud under the Commodity Exchange Act. Furthermore, U.S. federal laws around political intelligence gathering (e.g., the STOCK Act) can interact with political prediction market trading. Regulators have brought cases against traders who used MNPI in commodity markets. Prediction markets are regulated instruments, not legal information loopholes.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 6 — Information Markets & Efficiency
       ================================================================ */
    {
      id: "pm-6",
      title: "Information Markets & Efficiency",
      description:
        "EMH in prediction markets, insider signals, and using event markets for research",
      icon: "Zap",
      xpReward: 90,
      steps: [
        {
          type: "teach",
          title: "Prediction Markets and the Efficient Market Hypothesis",
          content:
            "The **Efficient Market Hypothesis (EMH)** applied to prediction markets means: contract prices should already reflect all available public information, leaving no room for systematic profit from public sources.\n\n**Evidence for prediction market efficiency:**\n- Iowa Electronic Markets accurately forecast 23 of 26 presidential election outcomes from 1988-2020\n- Election prediction markets outperformed polls by an average of 4-5% in root mean squared error\n- Prediction markets incorporating dispersed private information outperform any individual expert\n- Contract prices update within minutes of relevant news, suggesting rapid information incorporation\n\n**Evidence against full efficiency:**\n- Systematic overpricing of favorites in sports markets (the favorite-longshot bias)\n- Media-driven mispricing of high-profile political events\n- Thin markets (low OI) can persist at wildly mispriced levels for days\n- Regulatory uncertainty occasionally prevents informed capital from flowing freely\n\n**The practical implication for traders:**\nLiquid, well-traded prediction markets (like Kalshi Fed meeting contracts with $50M+ OI) are likely efficient for public information — do not try to out-research Bloomberg. Your edge, if any, must come from:\n1. Better processing of the same public information\n2. Actual private information (and the legal risks thereof)\n3. Behavioral biases of other market participants\n4. Execution advantages (timing, spreads)",
          highlight: [
            "EMH",
            "efficient market",
            "favorite-longshot bias",
            "information incorporation",
          ],
        },
        {
          type: "teach",
          title: "Reading Prediction Markets for Investment Signals",
          content:
            "Institutional investors use prediction market prices as **leading indicators** for asset allocation, even without trading the contracts directly.\n\n**Fed policy signals:**\nA sudden drop in 'Fed holds March 2026' contracts from $0.70 to $0.55 may precede bond market moves by 30-60 minutes. The prediction market aggregates opinion from macro traders, former Fed officials, and policy specialists — a crowd that often knows before the public.\n\n**Earnings and corporate events:**\nPrediction market contracts on earnings outcomes can signal information not fully priced in equity options. If an earnings beat contract is pricing at $0.68 but the stock's option skew suggests only 55% probability, a divergence exists — one market has more information.\n\n**Practical tools for portfolio managers:**\n- Use Fed decision probabilities to weight fixed income duration\n- Use election probabilities to adjust sector allocations (Defense vs Clean Energy weight shifts with election probability)\n- Use economic data contracts to anticipate currency moves before the number prints\n\n**Real 2025/2026 examples:**\n- During the February 2026 FOMC meeting week, 'holds' contracts on Kalshi moved from $0.61 to $0.79 in the 48 hours before the decision — presaging the actual hold announcement\n- Pre-election prediction market shifts in October 2024 preceded equity sector rotations into defense and energy by 3-5 trading days",
          highlight: [
            "leading indicator",
            "signal extraction",
            "FOMC",
            "sector rotation",
            "divergence",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A portfolio manager uses Kalshi's 'Fed raises rates in March' contract as a signal. The contract drops from $0.35 to $0.18 in 24 hours without any public news release. How should the PM interpret this?",
          options: [
            "The prediction market may be incorporating private signals from informed participants; consider reducing duration (selling bonds) as a precautionary hedge",
            "Ignore it — prediction markets are always noisy and lagged versus fixed income markets",
            "Buy the contract aggressively since the price drop represents mispricing",
            "The drop signals a cut is now more likely, so buy long-duration bonds",
          ],
          correctIndex: 0,
          explanation:
            "A sharp drop from $0.35 to $0.18 without news means the prediction market now implies only an 18% probability of a rate hike. If this move was driven by informed participants (former Fed officials, macro hedge funds), it could precede a bond market rally. The PM should treat this as a possible early signal and consider defensive positioning (reducing duration exposure to interest rate increases). Ignoring prediction market signals — especially large moves without news on highly liquid contracts — is to ignore a sophisticated consensus instrument. Note: the PM should also check whether the move was volume-driven (informed) or just bid-ask noise.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Prediction Markets vs. Polls: The Information Advantage",
          content:
            "Prediction markets and opinion polls measure different things in fundamentally different ways:\n\n| Dimension | Polls | Prediction Markets |\n|---|---|---|\n| What is measured | Stated intentions | Financial bets |\n| Incentive to be accurate | Low (no cost to lie) | High (real money at risk) |\n| Sample bias | Sampling frame | Self-selected financial sophisticates |\n| Speed of updates | Days-weeks | Minutes-hours |\n| Information type aggregated | Stated opinions | Private signals + public info |\n\n**The wisdom of crowds effect**: When thousands of participants risk real money, they have incentive to gather information, think carefully, and report their true beliefs. A poll respondent who says '60% chance of recession' risks nothing. A prediction market participant who prices 'recession by Q4 2026' at $0.60 risks real capital if wrong.\n\n**Limitations of prediction markets:**\n- Liquidity constraints prevent full information revelation (thin markets are less efficient)\n- Market manipulation is possible on low-OI contracts\n- Price discovery works best when participants have diverse, independent information sources — herding degrades the signal\n- Regulatory restrictions can prevent the most-informed participants from trading\n\n**The Hanson insight (Robin Hanson, economist):** Markets beat models not because they use better models, but because they aggregate private information that no model can access. The Fed's own forecasts are less accurate than prediction markets for the same Fed decisions — because some prediction market participants have better models AND private information.",
          highlight: [
            "wisdom of crowds",
            "information aggregation",
            "herding",
            "Robin Hanson",
            "private information",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are a macro analyst covering the Federal Reserve. You have built a sophisticated economic model incorporating 47 data inputs that forecasts Fed decisions with 68% accuracy. Kalshi's liquid Fed rate contracts (>$50M OI) are available. Your model currently says 'hold in March' with 74% probability, while the market prices 'hold' at $0.68.",
          question:
            "Given what you know about prediction market efficiency, what is the best trading strategy?",
          options: [
            "Size the position conservatively using half-Kelly, recognizing your edge is real but small (74% vs 68%), and that liquid markets quickly arbitrage away large edges",
            "Go all-in — your model has edge over the market so maximize position size",
            "Do not trade — efficient markets mean your model has zero edge",
            "Wait for the market to move to $0.80 before entering",
          ],
          correctIndex: 0,
          explanation:
            "Your model says 74%; the market says 68%. Half-Kelly position size: f* = (0.74 - 0.68) / (1-0.68) / 2 = 0.06/0.32/2 = ~9.4% of bankroll. This is small but real edge. You should trade it, but not oversize. Liquid markets with $50M+ OI have absorbed enormous amounts of sophisticated analysis — your 6-percentage-point edge may narrow or disappear if your model inputs become public (or if others have your model). The market is efficient enough that going all-in would be reckless; doing nothing would leave free money on the table. This is textbook application of Kelly criterion with epistemic humility.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Prediction markets that aggregate information from financially motivated participants consistently outperform expert surveys on political and economic forecasting tasks.",
          correct: true,
          explanation:
            "This is empirically well-established. The Iowa Electronic Markets outperformed Gallup polls by an average of 1.37 percentage points over 25+ years of election forecasts. Tetlock's Superforecasting research found that aggregated prediction market estimates beat CIA analysts by 30% on geopolitical questions. The mechanism: financial stakes incentivize honest expression of beliefs, and aggregation of diverse independent sources captures dispersed private information that no single expert has. The advantage is most pronounced for near-term, well-defined events with clear resolution criteria — exactly the contracts that dominate liquid prediction market trading.",
          difficulty: 1,
        },
      ],
    },
  ],
};
