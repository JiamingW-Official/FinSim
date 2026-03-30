import type { Unit } from "./types";
import {
  PRACTICE_POSITION_SIZE,
  PRACTICE_RISK_REWARD,
  PRACTICE_DRAWDOWN,
  PRACTICE_BB_SQUEEZE,
} from "./practice-data";

export const UNIT_RISK: Unit = {
  id: "risk",
  title: "Risk Management",
  description: "Protect your capital and survive the market",
  icon: "Shield",
  color: "#f59e0b",
  lessons: [
    {
      id: "risk-1",
      title: "Position Sizing & The Kelly Criterion",
      description: "Size every trade with mathematical precision",
      icon: "Calculator",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "Why Position Sizing Is Everything",
          content:
            "Two traders can use the exact same strategy with opposite results. The difference? **Position sizing** -- how much capital you allocate to each trade.\n\nA study of 160+ hedge funds found that position sizing explained more variance in returns than stock selection. Professional traders treat it as their single most important decision.\n\n**Fixed fractional sizing** is the foundation: risk a constant percentage of your current equity on every trade. As your account grows, position sizes grow. As it shrinks, sizes shrink -- an automatic stabilizer.",
          visual: "risk-pyramid",
          highlight: ["position sizing", "fixed fractional"],
        },
        {
          type: "teach",
          title: "The Fixed Fractional Formula",
          content:
            "**Position Size = (Account Equity x Risk %) / (Entry Price - Stop Price)**\n\nThis formula answers: 'How many shares can I buy so that if my stop-loss triggers, I lose exactly my risk budget?'\n\nExample: $100,000 account, 1% risk, buy at $50, stop at $47.\nShares = ($100,000 x 0.01) / ($50 - $47) = $1,000 / $3 = **333 shares**\n\nThe **R-multiple** is the unit of risk. If your risk per trade is $3/share, a $9 profit = +3R. A $6 loss = -2R. Thinking in R-multiples normalizes results across different price stocks.",
          highlight: ["R-multiple", "risk budget"],
        },
        {
          type: "quiz-mc",
          question:
            "Account: $80,000. Risk: 1.5%. Entry: $120. Stop: $114. How many shares should you buy?",
          options: [
            "200 shares",
            "100 shares",
            "667 shares",
            "150 shares",
          ],
          correctIndex: 0,
          explanation:
            "Risk budget = $80,000 x 1.5% = $1,200. Risk per share = $120 - $114 = $6. Shares = $1,200 / $6 = **200 shares**. Total position value is $24,000 (30% of account), but the actual capital at risk is only $1,200.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Kelly Criterion",
          content:
            "The **Kelly Criterion**, developed by John L. Kelly Jr. at Bell Labs in 1956, calculates the mathematically optimal bet size to maximize long-run geometric growth.\n\n**Kelly % = W - (1 - W) / R**\n\nWhere W = win rate (decimal), R = ratio of average win to average loss.\n\nExample: 55% win rate, average win $600, average loss $400 (R = 1.5).\nKelly % = 0.55 - (0.45 / 1.5) = 0.55 - 0.30 = **25%**\n\nFull Kelly is extremely aggressive. Most professionals use **half-Kelly or quarter-Kelly** to reduce volatility while capturing most of the growth.",
          highlight: ["Kelly Criterion", "half-Kelly"],
        },
        {
          type: "quiz-mc",
          question:
            "Your system has a 60% win rate with average win of $500 and average loss of $250 (R = 2.0). What is the full Kelly percentage?",
          options: [
            "40%",
            "60%",
            "20%",
            "30%",
          ],
          correctIndex: 0,
          explanation:
            "Kelly % = W - (1-W)/R = 0.60 - (0.40/2.0) = 0.60 - 0.20 = **0.40 or 40%**. Full Kelly suggests risking 40% of capital per trade. In practice, this is dangerously aggressive -- half-Kelly (20%) or quarter-Kelly (10%) dramatically reduces drawdowns while retaining roughly 75% of the growth rate.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Using the full Kelly Criterion percentage on every trade maximizes your long-term wealth in practice.",
          correct: false,
          explanation:
            "While full Kelly maximizes theoretical geometric growth, it assumes perfectly known probabilities and produces extreme drawdowns. Real-world edge estimates are imprecise. **Half-Kelly** achieves 75% of the growth rate with significantly lower variance. Most institutional traders use quarter-Kelly or less.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "R-Multiples and Trade Journaling",
          content:
            "**R-multiples** transform raw P&L into a universal language of risk.\n\nIf your initial risk (1R) = $3/share:\n- A $9/share profit = +3R\n- A $3/share loss = -1R\n- A $6/share loss (stop slippage) = -2R\n\n**Why this matters**: A +3R trade on a $20 stock and a +3R trade on a $500 stock represent equal skill. R-multiples let you compare trades across different instruments and time periods.\n\nYour **expectancy** = average R-multiple across all trades. Positive expectancy = profitable system. Track it religiously in your journal.",
          highlight: ["expectancy", "trade journal"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Over 100 trades, your results are: 35 trades at +3R, 10 trades at +5R, 40 trades at -1R, 15 trades at -2R.",
          question: "What is your system's expectancy per trade?",
          options: [
            "+0.85R per trade",
            "+1.50R per trade",
            "-0.20R per trade",
            "+2.00R per trade",
          ],
          correctIndex: 0,
          explanation:
            "Total R = (35 x 3) + (10 x 5) + (40 x -1) + (15 x -2) = 105 + 50 - 40 - 30 = +85R. Expectancy = 85R / 100 trades = **+0.85R per trade**. This is a healthy positive expectancy -- each trade is expected to return 0.85 times your initial risk.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Scaling In and Scaling Out",
          content:
            "Advanced position sizing uses **pyramiding** (adding to winners) and **scaling out** (partial exits).\n\n**Pyramiding**: Enter 1/3 position at signal, add 1/3 on confirmation, add final 1/3 on breakout. Each add uses a tighter stop, so total risk stays controlled.\n\n**Scaling out**: Sell 1/3 at +2R (locks profit), move stop to breakeven. Sell 1/3 at +4R. Let final 1/3 run with a trailing stop.\n\nThis lets you take smaller initial risk while still capturing large moves. The key: never add to losing positions (averaging down is not pyramiding).",
          highlight: ["pyramiding", "scaling out"],
        },
        {
          type: "quiz-tf",
          statement:
            "Adding to a losing position ('averaging down') is the same strategy as pyramiding into a winning trade.",
          correct: false,
          explanation:
            "They are opposite strategies. **Pyramiding** adds to winners, confirming the market is moving in your favor -- risk is managed with trailing stops. **Averaging down** adds to losers, hoping for a reversal -- it increases exposure to a trade that is going against you. Averaging down has destroyed more trading accounts than any other mistake.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You have a $200,000 account using 1% risk per trade. You find two setups: Stock A (entry $50, stop $48) and Stock B (entry $200, stop $190).",
          question: "How many shares of each can you buy simultaneously?",
          options: [
            "A: 1,000 shares, B: 200 shares (each risking $2,000)",
            "A: 4,000 shares, B: 1,000 shares",
            "A: 200 shares, B: 200 shares",
            "You cannot take both trades at the same time",
          ],
          correctIndex: 0,
          explanation:
            "Risk per trade = $200,000 x 1% = $2,000. Stock A: risk/share = $2, shares = $2,000/$2 = **1,000**. Stock B: risk/share = $10, shares = $2,000/$10 = **200**. Both trades risk exactly $2,000. Note: total capital deployed ($50K + $40K = $90K) is only 45% of the account, but risk-at-stop is precisely controlled.",
          difficulty: 2,
        },
        {
          type: "practice",
          instruction:
            "Apply position sizing: buy a carefully sized position and manage the risk.",
          objective: "Buy shares with proper position sizing",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_POSITION_SIZE.bars,
            initialReveal: PRACTICE_POSITION_SIZE.initialReveal,
            objectives: [{ kind: "buy", minQuantity: 5 }],
            hint: "Calculate how many shares you can afford while keeping risk under control relative to your $5,000 cash.",
            startingCash: 5000,
          },
        },
        {
          type: "quiz-mc",
          question:
            "Why do most professional traders use half-Kelly or less rather than full Kelly?",
          options: [
            "Edge estimates are uncertain, and over-betting on inaccurate estimates causes catastrophic drawdowns",
            "Full Kelly is illegal for institutional traders",
            "Half-Kelly doubles the number of trades you can take",
            "Full Kelly only works in casinos, not financial markets",
          ],
          correctIndex: 0,
          explanation:
            "The Kelly Criterion assumes you know your exact edge. In practice, win rates and reward-to-risk ratios are estimates with error. Over-betting relative to your true (unknown) edge leads to severe drawdowns. **Fractional Kelly** is insurance against estimation error -- it sacrifices a small amount of growth for dramatically smoother equity curves.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "risk-2",
      title: "Portfolio Theory & Diversification",
      description: "Build portfolios on the efficient frontier",
      icon: "Layers",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "Modern Portfolio Theory (MPT)",
          content:
            "In 1952, Harry Markowitz published 'Portfolio Selection,' founding **Modern Portfolio Theory**. His key insight: a portfolio's risk is NOT the average risk of its components -- it depends on how they move relative to each other.\n\nA portfolio of two volatile assets that move in opposite directions can have LOWER volatility than either asset alone. This is the free lunch of diversification.\n\nMPT earned Markowitz a Nobel Prize and remains the foundation of institutional asset allocation.",
          visual: "portfolio-pie",
          highlight: ["Modern Portfolio Theory", "Markowitz", "diversification"],
        },
        {
          type: "teach",
          title: "Correlation: The Key to Diversification",
          content:
            "**Correlation** (denoted r or rho) ranges from -1 to +1 and measures how two assets co-move.\n\n**r = +1.0**: Perfect positive correlation (move in lockstep, zero diversification benefit)\n**r = 0.0**: No correlation (independent movements, good diversification)\n**r = -1.0**: Perfect negative correlation (move opposite, maximum diversification)\n\nHistorical examples:\n- AAPL vs MSFT: r ~ 0.75 (both big tech -- limited benefit)\n- Stocks vs Bonds: r ~ -0.20 (traditional diversifier)\n- Stocks vs Gold: r ~ 0.05 (near-zero, good diversifier)\n\nThe portfolio variance formula for two assets:\n**sigma_p^2 = w1^2 * sigma1^2 + w2^2 * sigma2^2 + 2 * w1 * w2 * sigma1 * sigma2 * rho**",
          highlight: ["correlation", "rho"],
        },
        {
          type: "quiz-mc",
          question:
            "Two assets each have 20% annual volatility. If their correlation is 0.0, what is the volatility of a 50/50 portfolio?",
          options: [
            "~14.1% (lower than either asset alone)",
            "20% (same as each asset)",
            "40% (sum of both)",
            "10% (half of each)",
          ],
          correctIndex: 0,
          explanation:
            "Portfolio variance = (0.5)^2(0.20)^2 + (0.5)^2(0.20)^2 + 2(0.5)(0.5)(0.20)(0.20)(0) = 0.01 + 0.01 + 0 = 0.02. Volatility = sqrt(0.02) = **14.14%**. Zero correlation cuts portfolio volatility by ~29% -- this is the diversification benefit.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "The Efficient Frontier",
          content:
            "The **efficient frontier** is the set of portfolios offering the highest expected return for each level of risk. Any portfolio below the frontier is suboptimal -- you can get more return for the same risk or less risk for the same return.\n\n**Key points on the frontier**:\n- **Minimum variance portfolio**: lowest possible risk from combining all assets\n- **Tangency portfolio**: the portfolio with the highest Sharpe Ratio when a risk-free asset is available\n- **Capital Market Line (CML)**: the line from the risk-free rate through the tangency portfolio; any point on this line is an optimal mix of the risk-free asset and the tangency portfolio\n\nIndex funds like a total market fund approximate the tangency portfolio for most investors.",
          highlight: ["efficient frontier", "Sharpe Ratio", "tangency portfolio"],
        },
        {
          type: "quiz-tf",
          statement:
            "Owning 20 stocks in the same sector provides the same diversification benefit as owning 20 stocks across different sectors.",
          correct: false,
          explanation:
            "Stocks within the same sector have high correlation (r ~ 0.6-0.8). Twenty tech stocks may all drop together during a sector rotation. Cross-sector diversification exploits **lower correlations** between industries, reducing portfolio variance far more effectively. True diversification requires low-correlated assets, not just many assets.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Systematic vs Unsystematic Risk",
          content:
            "**Unsystematic (idiosyncratic) risk** is specific to a single company: CEO scandal, product recall, lawsuit. This risk can be **diversified away** by holding many stocks. Research shows ~30 uncorrelated stocks eliminate most unsystematic risk.\n\n**Systematic (market) risk** affects the entire market: recessions, interest rate changes, geopolitical events. This risk CANNOT be diversified away -- it is the risk you get compensated for holding.\n\n**Beta** measures a stock's sensitivity to systematic risk. The market has beta = 1.0. A stock with beta 1.5 carries 50% more systematic risk and should offer 50% more expected return above the risk-free rate (per CAPM).",
          highlight: ["systematic risk", "unsystematic risk", "beta"],
        },
        {
          type: "quiz-mc",
          question:
            "Which type of risk can be eliminated through diversification?",
          options: [
            "Unsystematic (company-specific) risk",
            "Systematic (market-wide) risk",
            "Both types equally",
            "Neither type -- risk cannot be reduced",
          ],
          correctIndex: 0,
          explanation:
            "**Unsystematic risk** (a single company's problems) is diluted by holding many uncorrelated assets. **Systematic risk** (market-wide factors like recessions) cannot be diversified away because it affects all assets. This is why investors are only compensated for bearing systematic risk.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You hold a concentrated portfolio: 40% NVDA, 35% AMD, 25% INTC. All three are semiconductor companies. The US government announces new export restrictions on chip sales to China.",
          question: "Why did your entire portfolio drop 15% in one day?",
          options: [
            "High correlation among semiconductor stocks amplified the sector-specific policy risk",
            "The overall stock market crashed 15%",
            "You held too many stocks",
            "Export restrictions only affect small companies",
          ],
          correctIndex: 0,
          explanation:
            "All three holdings are semiconductors with high correlation (r ~ 0.7-0.8). A sector-specific event hit all positions simultaneously. This is **concentration risk** -- the portfolio had zero diversification benefit because the assets move together. Cross-sector allocation would have limited the damage.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Sharpe Ratio",
          content:
            "The **Sharpe Ratio** measures risk-adjusted return -- how much excess return you earn per unit of risk.\n\n**Sharpe = (Portfolio Return - Risk-Free Rate) / Portfolio Standard Deviation**\n\nInterpretation:\n- **< 0.5**: Poor risk-adjusted returns\n- **0.5-1.0**: Acceptable\n- **1.0-2.0**: Good (most top hedge funds)\n- **> 2.0**: Excellent (rare and often unsustainable)\n\nThe S&P 500's long-term Sharpe is ~0.4-0.5. Renaissance Technologies' Medallion fund reportedly achieved a Sharpe above 2.0 -- the gold standard.",
          highlight: ["Sharpe Ratio", "risk-adjusted return"],
        },
        {
          type: "quiz-mc",
          question:
            "Portfolio A returns 15% with 20% volatility. Portfolio B returns 10% with 8% volatility. Risk-free rate is 5%. Which has the better Sharpe Ratio?",
          options: [
            "Portfolio B (Sharpe = 0.625 vs A's 0.50)",
            "Portfolio A (higher absolute return)",
            "They are equal",
            "Cannot be determined without correlation data",
          ],
          correctIndex: 0,
          explanation:
            "Sharpe A = (15% - 5%) / 20% = **0.50**. Sharpe B = (10% - 5%) / 8% = **0.625**. Portfolio B delivers more return per unit of risk, despite lower absolute returns. You could leverage Portfolio B to match A's return at lower risk.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Adding a volatile asset with low correlation to your existing portfolio will always increase portfolio risk.",
          correct: false,
          explanation:
            "Counter-intuitive but true: adding a volatile but lowly-correlated asset can actually **reduce** portfolio risk. This is the core insight of MPT. For example, adding gold (volatile, near-zero correlation with stocks) to a stock portfolio has historically reduced overall portfolio volatility while maintaining returns.",
          difficulty: 3,
        },
        {
          type: "practice",
          instruction:
            "Observe how a concentrated single-stock position amplifies portfolio swings over time.",
          objective: "Watch the volatility play out over 10 bars",
          actionType: "observe",
          challenge: {
            priceData: PRACTICE_BB_SQUEEZE.bars,
            initialReveal: PRACTICE_BB_SQUEEZE.initialReveal,
            objectives: [{ kind: "advance-time", bars: 10 }],
            hint: "Advance bars and notice the magnitude of swings. In a diversified portfolio, these moves would be dampened by low-correlation holdings.",
          },
        },
        {
          type: "teach",
          title: "Practical Diversification Rules",
          content:
            "**Rules for building a diversified portfolio:**\n\n1. **No single position > 5%** of portfolio (10% maximum for high-conviction trades)\n2. **No single sector > 25%** of portfolio\n3. **Hold 20-30 positions** across 8+ sectors for equity portfolios\n4. **Include non-correlated assets**: bonds, REITs, commodities, international equities\n5. **Rebalance quarterly** back to target weights (sells winners, buys laggards -- forced contrarian behavior)\n6. **Stress-test**: Ask 'what happens if my top 3 holdings all drop 40%?'\n\nDiversification does not guarantee profits, but it guarantees you survive to invest another day.",
          highlight: ["rebalance", "stress-test"],
        },
      ],
    },
    {
      id: "risk-3",
      title: "Expected Value & The Trader's Equation",
      description: "Only take trades that make mathematical sense",
      icon: "Scale",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "Thinking in Expected Value",
          content:
            "Every trading decision is a probability-weighted bet. **Expected Value (EV)** is the average outcome if you repeated the trade thousands of times.\n\n**EV = (P(win) x Avg Win) - (P(loss) x Avg Loss)**\n\nA trader with 40% win rate and 3:1 reward-to-risk:\nEV = (0.40 x $300) - (0.60 x $100) = $120 - $60 = **+$60 per trade**\n\nPositive EV is the only edge that matters. Without it, you are gambling. With it, you are running a business.",
          visual: "risk-pyramid",
          highlight: ["expected value", "positive EV"],
        },
        {
          type: "teach",
          title: "The Trader's Equation",
          content:
            "The **Trader's Equation** breaks profitability into four variables:\n\n**Profit = (Win Rate x Avg Win) - (Loss Rate x Avg Loss) x Number of Trades**\n\nYou can be profitable by adjusting any component:\n- **Trend followers**: Low win rate (30-40%), large R:R (3-5:1), many trades\n- **Mean-reversion traders**: High win rate (60-70%), small R:R (1-1.5:1), many trades\n- **Swing traders**: Moderate win rate (45-55%), moderate R:R (2-3:1), fewer trades\n\nNo single style is 'best' -- each adjusts the equation differently. The key: your specific combination must yield positive EV.",
          highlight: ["Trader's Equation", "win rate", "R:R"],
        },
        {
          type: "quiz-mc",
          question:
            "System A: 70% win rate, 1:1 R:R. System B: 35% win rate, 4:1 R:R. Which has higher expectancy per trade?",
          options: [
            "System B (+1.05R vs A's +0.40R per trade)",
            "System A (higher win rate always wins)",
            "They are equal",
            "Cannot be determined",
          ],
          correctIndex: 0,
          explanation:
            "System A: EV = 0.70(1R) - 0.30(1R) = **+0.40R**. System B: EV = 0.35(4R) - 0.65(1R) = 1.40 - 0.65 = **+1.05R**. System B has 2.6x the expectancy despite winning only 1 in 3 trades. High win rate is psychologically easier but not necessarily more profitable.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Risk-Reward Ratios and Breakeven Win Rates",
          content:
            "For any **R:R ratio**, there is a minimum win rate needed to break even:\n\n- 1:1 R:R -> need 50% win rate\n- 1:2 R:R -> need 33% win rate\n- 1:3 R:R -> need 25% win rate\n- 1:4 R:R -> need 20% win rate\n- 1:5 R:R -> need 17% win rate\n\n**Breakeven Win Rate = 1 / (1 + R:R)**\n\nBefore entering any trade, ask: 'Given my R:R, can I realistically win often enough?' If your setup gives 2:1 R:R but your backtest shows 30% accuracy, you are not profitable (need 33%).",
          highlight: ["breakeven win rate", "R:R ratio"],
        },
        {
          type: "quiz-mc",
          question:
            "You trade a 1:3 risk-reward setup. What is the minimum win rate for profitability?",
          options: [
            "25%",
            "33%",
            "50%",
            "75%",
          ],
          correctIndex: 0,
          explanation:
            "Breakeven win rate = 1 / (1 + R:R) = 1 / (1 + 3) = 1/4 = **25%**. You only need to win 1 in 4 trades. This is why trend followers can be profitable with win rates of 30-35% -- their winners are multiples of their losers.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Risk of Ruin",
          content:
            "**Risk of ruin** is the probability that a series of losses will deplete your account to the point where recovery is impossible.\n\n**Key factors**:\n- **Bet size**: Risking 2% per trade vs 10% per trade dramatically changes ruin probability\n- **Win rate and R:R**: Your edge (expectancy)\n- **Number of trades**: More trades = more chances for ruin if edge is negative\n\nAt 1% risk per trade with +0.5R expectancy, risk of ruin is virtually zero.\nAt 10% risk per trade with +0.5R expectancy, risk of ruin exceeds 20%.\nAt 25% risk per trade, even positive-EV systems can go bust.\n\nThis is why position sizing discipline matters more than trade selection.",
          highlight: ["risk of ruin", "bet size"],
        },
        {
          type: "quiz-tf",
          statement:
            "A trading system with positive expected value cannot go bankrupt.",
          correct: false,
          explanation:
            "False! A positive-EV system CAN go bankrupt if position sizes are too large relative to the edge. This is the fundamental lesson of **risk of ruin** analysis. A +0.5R expectancy system risking 25% per trade has a significant probability of hitting zero before the edge plays out. The Kelly Criterion exists precisely to prevent over-betting a positive edge.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You backtest a strategy: 45% win rate, average win +2.5R, average loss -1R. You plan to risk 2% of equity per trade and take ~200 trades per year.",
          question: "What is this system's annual expectancy in R-terms and approximate dollar return on a $100,000 account?",
          options: [
            "+0.575R per trade, ~$23,000/year",
            "+1.125R per trade, ~$45,000/year",
            "-0.125R per trade, losing system",
            "+0.575R per trade, ~$115,000/year",
          ],
          correctIndex: 0,
          explanation:
            "EV = (0.45 x 2.5R) - (0.55 x 1R) = 1.125 - 0.55 = **+0.575R per trade**. Annual: 0.575R x 200 trades = 115R. At 2% risk on $100K, 1R = $2,000. Annual return = 115 x $2,000 = **$230,000**... but that assumes no compounding friction. Realistically, with drawdowns and compounding, expect roughly $23,000 (10-12% of the theoretical max in early years). The compounding benefit kicks in as the account grows.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Why Most Traders Lose",
          content:
            "Studies show 70-90% of retail traders lose money. The math reveals why:\n\n1. **Negative expectancy**: No tested edge, trading on tips and feelings\n2. **Over-sizing**: Risking 5-10% per trade instead of 1-2%\n3. **Cutting winners, holding losers**: Prospect theory -- humans feel losses 2x as strongly as gains, leading to premature profit-taking and loss-holding\n4. **Overtrading**: Commissions and slippage destroy marginal edges\n5. **Ignoring the equation**: Focus on win rate alone (chasing 80% accuracy) instead of total expectancy\n\nThe fix: Define your edge, size properly, and let the math work over hundreds of trades.",
          highlight: ["prospect theory", "overtrading"],
        },
        {
          type: "quiz-tf",
          statement:
            "A trader with a 30% win rate is necessarily losing money.",
          correct: false,
          explanation:
            "A 30% win rate is profitable if the average win is large enough relative to the average loss. With a 4:1 reward-to-risk, a 30% win rate yields: EV = (0.30 x 4R) - (0.70 x 1R) = 1.2 - 0.7 = **+0.5R per trade**. Many successful trend-following systems operate at 25-35% win rates with large R:R multiples.",
          difficulty: 2,
        },
        {
          type: "practice",
          instruction:
            "Find a trade with at least 2:1 reward-to-risk. Buy the dip and target at least $20 profit.",
          objective: "Execute a positive-EV trade targeting 2:1+ R:R",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_RISK_REWARD.bars,
            initialReveal: PRACTICE_RISK_REWARD.initialReveal,
            objectives: [
              { kind: "buy", minQuantity: 5 },
              { kind: "profit-target", minProfit: 20 },
            ],
            startingCash: 5000,
            hint: "Identify a dip for entry, set a mental stop below the low, and target a profit at least 2x your risk distance.",
          },
        },
        {
          type: "quiz-scenario",
          scenario:
            "Two traders start with $50,000 each. Trader A risks 1% per trade with +0.5R expectancy. Trader B risks 10% per trade with +0.8R expectancy (a better system).",
          question: "After 100 trades, who is more likely to still be solvent?",
          options: [
            "Trader A -- smaller bet size virtually eliminates risk of ruin despite lower edge",
            "Trader B -- higher expectancy always wins long-term",
            "Both are equally likely to survive",
            "Neither -- 100 trades is too few to matter",
          ],
          correctIndex: 0,
          explanation:
            "Trader B has a superior edge (+0.8R vs +0.5R) but risks 10% per trade. A sequence of 5-7 consecutive losses (statistically inevitable over 100 trades) would reduce Trader B's account by 40-50%, potentially triggering margin calls or emotional blowups. Trader A's 1% risk means even 10 consecutive losses only costs 10%. **Survival trumps edge.**",
          difficulty: 3,
        },
      ],
    },
    {
      id: "risk-4",
      title: "Drawdowns, Recovery & Loss Aversion",
      description: "Master the asymmetric math of losses and the psychology of ruin",
      icon: "TrendingDown",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "The Asymmetry of Losses",
          content:
            "The single most important table in all of trading:\n\n| Loss | Gain to Recover |\n|------|----------------|\n| -10% | +11.1% |\n| -20% | +25.0% |\n| -30% | +42.9% |\n| -40% | +66.7% |\n| -50% | +100.0% |\n| -60% | +150.0% |\n| -75% | +300.0% |\n| -90% | +900.0% |\n\n**Formula**: Recovery % = Loss / (1 - Loss)\n\nBeyond -50%, recovery becomes nearly impossible. This is why **capital preservation** is the prime directive.",
          visual: "risk-pyramid",
          highlight: ["recovery asymmetry", "capital preservation"],
        },
        {
          type: "quiz-mc",
          question:
            "Your $200,000 portfolio drops to $130,000 (a 35% drawdown). What return do you need to get back to $200,000?",
          options: [
            "53.8%",
            "35%",
            "70%",
            "65%",
          ],
          correctIndex: 0,
          explanation:
            "Recovery % = 0.35 / (1 - 0.35) = 0.35 / 0.65 = **53.8%**. You need to grow $130,000 by 53.8% to reach $200,000. Notice you lost 35% but need 54% gain -- the asymmetry is already severe. At the S&P 500's average 10% annual return, this recovery takes over 4 years.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Drawdown Math in Practice",
          content:
            "**Maximum drawdown (MDD)** is the largest peak-to-trough decline in a portfolio's history. It is the most important risk metric for evaluating any strategy.\n\n**Key relationships**:\n- Max drawdown is roughly 2-3x the standard deviation of returns\n- A strategy with 15% annual volatility should expect ~30-45% MDD over a 20-year period\n- The S&P 500 has experienced -34% (2020), -51% (2008), and -49% (2000-02)\n\n**Time to recover** matters as much as depth. A -50% drawdown at 10%/year returns takes **7.3 years** to recover. During those years, your capital is locked in recovery instead of compounding.",
          highlight: ["maximum drawdown", "MDD", "time to recover"],
        },
        {
          type: "quiz-tf",
          statement:
            "If two strategies have the same annual return, the one with the smaller maximum drawdown is always preferable.",
          correct: true,
          explanation:
            "All else equal, a smaller drawdown means less time spent in recovery, lower psychological stress, and more consistent compounding. The **Calmar Ratio** (annualized return / max drawdown) captures this: a strategy returning 15% with -15% MDD (Calmar = 1.0) is far superior to one returning 15% with -45% MDD (Calmar = 0.33).",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Monte Carlo Simulation",
          content:
            "**Monte Carlo simulation** uses random sampling to model the range of possible outcomes for a trading system.\n\nHow it works:\n1. Take your actual trade results (e.g., 500 historical trades)\n2. Randomly reshuffle the order thousands of times\n3. Each shuffle produces a different equity curve\n4. Analyze the distribution of outcomes: median return, worst-case drawdown, probability of ruin\n\n**Why it matters**: Your actual trade sequence is just ONE possible path. Monte Carlo shows the full distribution. A system might show +40% return in backtesting but have a 15% chance of -30% drawdown depending on trade ordering.\n\nProfessionals use Monte Carlo to set realistic expectations and stress-test position sizing.",
          highlight: ["Monte Carlo simulation", "equity curve"],
        },
        {
          type: "quiz-mc",
          question:
            "What does Monte Carlo simulation reveal that a single backtest cannot?",
          options: [
            "The range and probability distribution of possible outcomes from the same edge",
            "The exact future return of the strategy",
            "Which specific stocks will perform best",
            "The optimal entry and exit prices",
          ],
          correctIndex: 0,
          explanation:
            "A single backtest shows one path through history. Monte Carlo reshuffles trade sequences to reveal the **distribution of possible outcomes** -- best case, worst case, median, and the probability of specific drawdowns. It answers: 'How bad could it get if I'm unlucky?' rather than 'How did it do this one time?'",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Loss Aversion & Prospect Theory",
          content:
            "Daniel Kahneman and Amos Tversky demonstrated that humans feel **losses approximately 2-2.5x as intensely as equivalent gains**. This is **loss aversion**, the cornerstone of prospect theory.\n\nTrading consequences:\n- **Holding losers too long**: The pain of realizing a loss makes traders hold, hoping for recovery (disposition effect)\n- **Cutting winners too short**: The fear of losing an unrealized gain triggers premature selling\n- **Revenge trading**: After a loss, the emotional urge to 'win it back' leads to over-sized, impulsive trades\n- **Risk aversion after wins**: Becoming conservative with profits instead of following the system\n\nThe solution: pre-define all exits BEFORE entering a trade, then execute mechanically.",
          highlight: ["loss aversion", "prospect theory", "disposition effect"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You bought AAPL at $180. It drops to $160 (-11%). You have no stop-loss. You 'feel' it will recover. Meanwhile, your position in MSFT is up 15% and you want to lock in the profit. Your system says hold MSFT and cut AAPL.",
          question: "What is the psychologically difficult but correct action?",
          options: [
            "Sell AAPL (cut the loser) and hold MSFT (let the winner run)",
            "Hold both -- patience is key",
            "Sell MSFT (lock in profits) and hold AAPL (it will recover)",
            "Double down on AAPL to average down your cost basis",
          ],
          correctIndex: 0,
          explanation:
            "This is the **disposition effect** in action. Loss aversion makes you want to hold the loser (avoiding the pain of realizing the loss) and sell the winner (capturing the pleasure of the gain). The correct action is the opposite: **cut losers, let winners run**. Stocks that are falling tend to keep falling (momentum), and holding losers has an enormous opportunity cost.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Drawdown Management Rules",
          content:
            "Professional drawdown management protocol:\n\n**Level 1 (-5% from peak)**: Review all open positions. Tighten stops. No new risk.\n**Level 2 (-10% from peak)**: Cut position sizes in half. Close weakest holdings.\n**Level 3 (-15% from peak)**: Go to cash. Stop trading. Full strategy review.\n**Level 4 (-20% from peak)**: Complete halt. Paper-trade only until confidence returns.\n\nThis progressive response prevents catastrophic drawdowns. The key insight: **reducing size during drawdowns is mathematically superior** because it takes smaller subsequent wins to recover.",
          highlight: ["drawdown management", "progressive response"],
        },
        {
          type: "quiz-mc",
          question:
            "A fund manager has a strict -20% max drawdown policy. The fund is currently at -18%. What should happen next?",
          options: [
            "Dramatically reduce exposure and prepare for potential full halt at -20%",
            "Take larger positions to recover the remaining 2% quickly",
            "Ignore the policy since markets will recover",
            "Close the fund permanently",
          ],
          correctIndex: 0,
          explanation:
            "At -18% with a -20% limit, the manager is two percentage points from a full halt. The correct response is to aggressively reduce exposure, moving toward cash. Increasing risk near the stop-out level is the worst possible action -- it could breach the -20% limit in a single bad day and destroy investor confidence.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "After a 50% drawdown, doubling your position size is a rational way to recover faster.",
          correct: false,
          explanation:
            "After a 50% drawdown, you need a 100% gain just to break even. Doubling position size in this situation is **textbook revenge trading**. If the next trade also loses, you lose another 50% of your already halved capital (now at 25% of peak). The correct response is to reduce size, protect remaining capital, and let the positive expectancy recover your account gradually.",
          difficulty: 1,
        },
        {
          type: "practice",
          instruction:
            "Buy shares and practice cutting losses. Sell before your loss exceeds $50 to demonstrate drawdown discipline.",
          objective: "Practice stop-loss discipline",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_DRAWDOWN.bars,
            initialReveal: PRACTICE_DRAWDOWN.initialReveal,
            objectives: [
              { kind: "buy", minQuantity: 5 },
              { kind: "stop-loss", maxLoss: -50 },
            ],
            startingCash: 5000,
            hint: "Buy shares, advance time, and sell QUICKLY if the price drops. Cutting losses early preserves capital for the next opportunity.",
          },
        },
        {
          type: "quiz-scenario",
          scenario:
            "You run a Monte Carlo simulation on your 500-trade backtest. The median outcome is +35% annual return, but the 5th percentile shows a -42% max drawdown.",
          question: "How should you interpret this result?",
          options: [
            "There is a 1-in-20 chance of experiencing a -42% drawdown -- consider reducing position sizes",
            "The -42% scenario is impossible since median return is positive",
            "Monte Carlo results are random and meaningless",
            "The 5th percentile only applies to other traders, not you",
          ],
          correctIndex: 0,
          explanation:
            "The 5th percentile means that in 5% of simulations, your system experienced a -42% drawdown. Over a 20-year career, you are virtually guaranteed to encounter a scenario at or beyond the 5th percentile. If a -42% drawdown would cause you to quit trading or face a margin call, you should **reduce position sizes** until the 5th percentile drawdown is within your psychological and financial tolerance.",
          difficulty: 3,
        },
      ],
    },
  ],
};
