import type { Unit } from "./types";

export const UNIT_QUANT_FINANCE: Unit = {
  id: "quant-finance",
  title: "Quantitative Finance Basics",
  description:
    "Statistical edge, expected value, Kelly sizing, Monte Carlo simulation, backtesting, and factor models",
  icon: "TrendingUp",
  color: "#0ea5e9",
  lessons: [
    /* ================================================================
       LESSON 1 — Statistical Edge
       ================================================================ */
    {
      id: "quant-1",
      title: "Statistical Edge",
      description:
        "Mean, standard deviation, z-scores, and what 'edge' truly means in trading",
      icon: "BarChart2",
      xpReward: 110,
      steps: [
        {
          type: "teach",
          title: "Mean and Standard Deviation in Trading",
          content:
            "**Mean (μ)** is the average outcome across many trades or observations. If a strategy produced daily returns of +1%, -0.5%, +0.8%, -0.3%, +0.6%, the mean daily return = (1 - 0.5 + 0.8 - 0.3 + 0.6) / 5 = **+0.32%/day**.\n\n**Standard deviation (σ)** measures how much outcomes vary around the mean. Low σ = consistent results. High σ = wild swings.\n\n**Example returns (annualized):** Strategy A: mean +18%, σ = 10%. Strategy B: mean +22%, σ = 35%.\n\nA might be preferable despite lower returns — its **Sharpe Ratio** (return / risk) is 1.8 vs B's 0.63. In the short run, B has wide outcome variance (could be -13% to +57% in any given year). A is far more predictable.\n\n**In trading, σ represents:**\n- Volatility of returns (strategy consistency)\n- Risk of a given position (daily stock σ × √252 = annualized volatility)\n- Confidence intervals around a forecast",
          highlight: [
            "mean",
            "standard deviation",
            "Sharpe Ratio",
            "annualized volatility",
          ],
        },
        {
          type: "teach",
          title: "Z-Scores: How Far from Normal?",
          content:
            "A **z-score** expresses how many standard deviations a data point is from the mean:\n\n**z = (x - μ) / σ**\n\n**Example**: A stock's 20-day average daily return is +0.05% with σ = 1.2%. Today it returned +3.0%.\nz = (3.0 - 0.05) / 1.2 = **+2.46 standard deviations** above average.\n\n**Standard normal distribution interpretation:**\n- |z| < 1.0: Happens ~68% of the time — normal variation\n- |z| < 2.0: Happens ~95% of the time\n- |z| < 3.0: Happens ~99.7% of the time — very unusual\n- |z| > 3.0: Less than 0.3% probability under normal distribution — potential outlier or signal\n\n**Trading uses of z-scores:**\n- **Mean reversion**: If a pair's spread has z-score > 2.5, it's statistically extreme and may revert. Buy the cheap leg, sell the expensive leg.\n- **Breakout filter**: A breakout with z-score > 3.0 in volume or price change is more likely 'real' than normal noise.\n- **Risk flags**: A position losing 3σ in one day warrants immediate review.",
          highlight: [
            "z-score",
            "standard deviations",
            "mean reversion",
            "normal distribution",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A trading strategy has a mean daily P&L of +$120 and a standard deviation of $400. Today's P&L is -$940. What is the z-score, and how should a risk manager interpret it?",
          options: [
            "z = -2.65; unusual but within the 99% confidence band — review the position but not a crisis",
            "z = -2.65; this is a 3-sigma event indicating the strategy has stopped working",
            "z = +2.65; positive z-scores only apply to gains",
            "z = -0.27; perfectly normal daily variation",
          ],
          correctIndex: 0,
          explanation:
            "z = (-940 - 120) / 400 = -1060 / 400 = **-2.65**. This is a 2.65-sigma down day — unusual (occurs about 0.8% of the time under a normal distribution) but not a 3-sigma event. A risk manager should investigate whether a specific position or unusual market condition caused this, but it is within the expected range of outcomes. A 3-sigma event (z < -3) would warrant more urgent action.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "What 'Edge' Actually Means",
          content:
            "**Statistical edge** in trading means your strategy's expected value per trade is positive — over a large enough sample, you make more than you lose.\n\nEdge has three components:\n1. **Win rate (W)**: Fraction of trades that are profitable. W = 55% means you win more than half the time.\n2. **Payoff ratio (R)**: Average win / average loss. R = 1.8 means your average winner is 1.8× your average loser.\n3. **Expected value (EV)**: EV = W × avg_win - (1-W) × avg_loss. Positive EV = edge.\n\n**Example**: W = 45%, avg win = $600, avg loss = $300.\nEV = 0.45 × $600 - 0.55 × $300 = $270 - $165 = **+$105 per trade**.\n\nWith a $105/trade edge and 200 trades/year: **expected annual profit = $21,000**. But σ of outcomes could be $40,000+ — meaning any single year could be a loss despite positive edge.\n\n**Edge requires large sample sizes to express itself.** This is why professional traders never judge a strategy on fewer than 100 trades. Variance hides edge in small samples.",
          highlight: [
            "edge",
            "expected value",
            "win rate",
            "payoff ratio",
            "sample size",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Strategy X: 65% win rate, average win $200, average loss $500. Strategy Y: 40% win rate, average win $800, average loss $300. Which has higher expected value per trade?",
          options: [
            "Strategy Y: EV = +$140/trade vs Strategy X: EV = -$45/trade",
            "Strategy X: higher win rate always produces better EV",
            "Both have the same EV — win rate and payoff are mirror images",
            "Strategy Y has lower EV but better risk/reward ratio",
          ],
          correctIndex: 0,
          explanation:
            "Strategy X EV = 0.65 × $200 - 0.35 × $500 = $130 - $175 = **-$45/trade** (negative edge). Strategy Y EV = 0.40 × $800 - 0.60 × $300 = $320 - $180 = **+$140/trade** (positive edge). Despite X winning 65% of the time, its losses are 2.5× its wins, creating a losing system. Strategy Y loses 60% of its trades but its wins are 2.67× its losses — a profitable edge. Win rate alone is meaningless without the payoff ratio.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A trading strategy that is profitable 70% of the time is guaranteed to have a positive expected value.",
          correct: false,
          explanation:
            "Win rate alone does not determine expected value. A strategy that wins 70% of the time but averages a $100 win and a $400 loss has EV = 0.70 × $100 - 0.30 × $400 = $70 - $120 = **-$50/trade** — a losing strategy despite a 70% win rate. EV depends on both win rate AND the average win/loss ratio. This is why many trend-following strategies win less than 40% of the time but are highly profitable due to large average winners.",
          difficulty: 1,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Expected Value and Kelly Criterion
       ================================================================ */
    {
      id: "quant-2",
      title: "Expected Value and Kelly",
      description:
        "EV formula, the Kelly criterion, fractional Kelly, and practical sizing",
      icon: "Calculator",
      xpReward: 115,
      steps: [
        {
          type: "teach",
          title: "Expected Value: The Foundation of Every Bet",
          content:
            "**Expected Value (EV)** = the probability-weighted average outcome of a random event. For any trade or bet:\n\n**EV = Σ (probability × outcome)**\n\n**Example — Pre-earnings options trade:**\n- 40% chance: AAPL beats estimates, stock +8%, call gains +$450\n- 35% chance: AAPL meets estimates, stock flat, call loses -$200\n- 25% chance: AAPL misses estimates, stock -6%, call loses -$300\n\n**EV** = (0.40 × $450) + (0.35 × -$200) + (0.25 × -$300)\n= $180 - $70 - $75 = **+$35 per contract**\n\nA +$35 EV on a $200 cost = **+17.5% EV per dollar risked**. This is an attractive trade if your probability estimates are accurate.\n\n**Key insight**: EV is only as good as your probability estimates. Overestimating the 'beat' scenario from 40% to 55% would dramatically inflate EV. The skill is in accurate probability assessment — not just knowing the formula.",
          highlight: [
            "expected value",
            "probability",
            "probability-weighted",
            "outcome",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "You have a $1,000 trading opportunity with three scenarios: 50% chance of +$800, 30% chance of -$400, 20% chance of -$1,000. What is the expected value?",
          options: [
            "+$80",
            "+$400",
            "-$200",
            "+$200",
          ],
          correctIndex: 0,
          explanation:
            "EV = (0.50 × $800) + (0.30 × -$400) + (0.20 × -$1,000) = $400 - $120 - $200 = **+$80**. Despite a 50% loss rate (50% chance of losing) and a 20% chance of total loss, the trade has positive EV because the winning scenario pays more. Over many such trades, you'd expect to average $80 profit per trade. However, the 20% chance of -$1,000 is significant variance — Kelly sizing would tell you to risk a small fraction of your capital.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Kelly Criterion",
          content:
            "The **Kelly Criterion**, developed by John L. Kelly Jr. at Bell Labs (1956), identifies the fraction of capital to bet on each opportunity to maximize the long-run geometric growth rate of wealth.\n\n**Kelly % = W - (1 - W) / R**\n\nWhere:\n- **W** = win probability (as a decimal)\n- **R** = win/loss ratio (average win ÷ average loss)\n\n**Example**: System with 55% win rate, average win $600, average loss $300 (R = 2.0):\nKelly % = 0.55 - (0.45 / 2.0) = 0.55 - 0.225 = **32.5%**\n\nThe math says: bet 32.5% of your capital on this trade to maximize long-run wealth growth.\n\n**Why Kelly maximizes growth**: It balances two competing forces:\n1. Bet too little → leave compounding growth on the table\n2. Bet too large → drawdowns are severe enough to prevent recovery (ruin risk)\n\n**Derivation insight**: At exactly Kelly%, the expected log of wealth is maximized. Betting more than Kelly is mathematically proven to result in *lower* long-run wealth than a smaller bet.",
          highlight: [
            "Kelly Criterion",
            "geometric growth",
            "win probability",
            "win/loss ratio",
            "log wealth",
          ],
        },
        {
          type: "teach",
          title: "Fractional Kelly: The Practical Standard",
          content:
            "**Full Kelly is rarely used in practice** because:\n1. Win rates and payoff ratios are estimated, not known exactly. Overestimating W by 5% leads to overbetting.\n2. Full Kelly produces volatility of equity that is psychologically difficult to sustain — 30–50% drawdowns are common.\n3. Losing streaks at full Kelly can cut capital by 60–80% before recovery.\n\n**Fractional Kelly** scales down the full Kelly bet by a factor:\n- **Half-Kelly (f/2)**: Bet half the Kelly fraction. Gets ~75% of Kelly growth at ~50% of the drawdown.\n- **Quarter-Kelly (f/4)**: Very conservative. ~56% of growth, ~25% of drawdown.\n\n**Example**: Full Kelly = 32.5%. Half-Kelly = 16.25%. Quarter-Kelly = 8.1%.\n\n**The Kelly math on drawdowns:**\n- Full Kelly: expected max drawdown ~30% before doubling capital\n- Half-Kelly: expected max drawdown ~15%\n\n**Rule of thumb used by professionals**: For strategies with parameter estimation uncertainty (i.e., all real strategies), use quarter-Kelly as a starting point. Increase toward half-Kelly only after 200+ live trades validate the edge.",
          highlight: [
            "fractional Kelly",
            "half-Kelly",
            "drawdown",
            "geometric growth",
            "parameter uncertainty",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A systematic trader has a strategy with 48% win rate, average win $1,200, average loss $500 (R = 2.4). What is the full Kelly fraction, and what would half-Kelly suggest risking on a $100,000 account?",
          options: [
            "Full Kelly ≈ 27%; half-Kelly ≈ 13.5% → $13,500 per trade",
            "Full Kelly ≈ 48%; half-Kelly ≈ 24% → $24,000 per trade",
            "Full Kelly ≈ 0% — below 50% win rate means no Kelly edge",
            "Full Kelly ≈ 14%; half-Kelly ≈ 7% → $7,000 per trade",
          ],
          correctIndex: 0,
          explanation:
            "Kelly % = W - (1-W)/R = 0.48 - (0.52/2.4) = 0.48 - 0.217 = **0.263 ≈ 26.3%** (round to ~27%). Despite a sub-50% win rate, positive EV (EV = 0.48×$1,200 - 0.52×$500 = $576 - $260 = +$316/trade) supports a meaningful Kelly fraction. Half-Kelly = 13.5%, so on a $100,000 account, risking $13,500 per trade. Note: this is the fraction risked, not the position size — if your stop is 3%, the position size would be $13,500 / 3% = $450,000 notional.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Betting more than the full Kelly fraction on every trade increases your long-run wealth compared to betting the exact Kelly fraction.",
          correct: false,
          explanation:
            "This is mathematically proven false. Betting more than full Kelly (overbetting) reduces long-run geometric growth despite increasing the arithmetic mean of bets. The expected log of wealth is maximized exactly at the Kelly fraction — overbetting creates larger drawdowns from which recovery is slower, ultimately reducing the compound growth rate. In extreme over-betting (2× Kelly or more), the expected outcome is ruin. This counterintuitive result is a core insight from information theory applied to gambling and investing.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Monte Carlo Methods
       ================================================================ */
    {
      id: "quant-3",
      title: "Monte Carlo Methods",
      description:
        "Random walks, simulation, confidence intervals, and practical applications",
      icon: "Shuffle",
      xpReward: 120,
      steps: [
        {
          type: "teach",
          title: "What Is a Monte Carlo Simulation?",
          content:
            "**Monte Carlo simulation** uses random number generation to model the probability distribution of complex outcomes. Instead of solving an equation analytically, you run thousands of random 'paths' and observe how often each outcome occurs.\n\n**Core idea — Random Walk for stock prices:**\nEach day's return is drawn randomly from a distribution with:\n- Mean μ (expected daily return, e.g., 0.04% for SPY)\n- Standard deviation σ (daily volatility, e.g., 0.85%)\n\n**Price path formula**: S(t+1) = S(t) × e^(μ + σ × Z)\nWhere Z is a standard normal random variable (draw from N(0,1))\n\n**Example — SPY @ $450, 252-day simulation, 10,000 paths:**\n- Run 10,000 independent daily-step simulations for one year\n- Each path produces a final price\n- Distribution of final prices: median ≈ $463, 5th percentile ≈ $327, 95th percentile ≈ $634\n- Probability of SPY being below $400 in one year ≈ 8.3%\n\nThis is far more informative than a single point estimate.",
          highlight: [
            "Monte Carlo",
            "random walk",
            "simulation",
            "distribution",
            "paths",
          ],
        },
        {
          type: "teach",
          title: "Confidence Intervals from Simulation",
          content:
            "After running 10,000 simulation paths, you sort all outcomes and read off percentiles to construct **confidence intervals**.\n\n**Portfolio Monte Carlo — $500,000 portfolio, 60/40 stocks/bonds:**\nAssumptions: stocks μ=7%/yr σ=15%, bonds μ=3%/yr σ=5%, correlation=−0.20.\nRun 10,000 10-year paths. Final portfolio value percentiles:\n- **5th percentile (worst 5% of outcomes)**: $412,000 — you could end up here\n- **25th percentile**: $671,000\n- **50th percentile (median)**: $921,000\n- **75th percentile**: $1,281,000\n- **95th percentile (best 5%)**: $1,893,000\n\n**Practical uses in trading:**\n1. **Strategy stress testing**: What is the probability of a 20% drawdown in my strategy over the next 6 months?\n2. **Options pricing**: Black-Scholes is an analytical solution; Monte Carlo can price exotic options (barriers, Asians) that have no closed-form solution\n3. **Retirement planning**: What annual withdrawal rate has a 95% survival probability over 30 years?\n\n**Accuracy improves with more simulations**: 1,000 paths → rough estimate. 10,000 paths → good. 100,000 paths → high precision.",
          highlight: [
            "confidence interval",
            "percentile",
            "simulation paths",
            "stress testing",
            "drawdown probability",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A Monte Carlo simulation of a trading strategy (1,000 paths, 1-year horizon) shows: median final equity = $125,000, 5th percentile = $68,000, 95th percentile = $198,000 (starting equity $100,000). Which statement is MOST accurate?",
          options: [
            "There is a 90% probability the strategy finishes between $68,000 and $198,000 based on the simulation's assumptions",
            "The strategy is guaranteed to produce at least $68,000 after one year",
            "The median outcome of $125,000 is the most likely exact outcome",
            "Running 10,000 paths instead of 1,000 would change the median from $125,000 to $100,000",
          ],
          correctIndex: 0,
          explanation:
            "The 5th and 95th percentile form a 90% confidence interval — in 90% of simulated paths, outcomes fell between $68,000 and $198,000. This is not a guarantee (10% of paths fell outside this range, 5% below $68K). The median is the midpoint of the distribution, not the 'most likely exact value.' More simulation paths improve precision of the percentile estimates but don't change the underlying model's median (the true median stays near $125K with both 1K and 10K paths).",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Monte Carlo for Backtesting: Shuffled Returns",
          content:
            "A powerful use of Monte Carlo is **bootstrapping historical returns**: instead of running the strategy on the one historical sequence, you randomly shuffle the order of daily returns and run the strategy on thousands of shuffled sequences.\n\n**Why this matters**: Your backtest produced a Sharpe of 1.4 on one path through history. Was that sequence unusually lucky? Bootstrapping answers this.\n\n**Process:**\n1. Extract 252 daily returns from your backtest period\n2. Randomly shuffle them to create a new 252-day sequence\n3. Run the strategy on this shuffled sequence → record Sharpe, max drawdown\n4. Repeat 10,000 times\n5. Examine the distribution: if 30% of shuffled paths produce Sharpe > 1.4, your result may not be as special as it seems\n\n**Key insight from bootstrapped backtests:**\n- If the actual backtest Sharpe is above the 90th percentile of shuffled results → strong evidence of real edge\n- If the actual backtest is near the median of shuffled results → the 'edge' may be mostly luck from the sequence of trades\n\n**Limitation**: Bootstrapping assumes returns are independent (ignores autocorrelation, regime changes). Use as a complement to other validation, not as the sole test.",
          highlight: [
            "bootstrapping",
            "shuffled returns",
            "Sharpe ratio",
            "sequence of returns",
            "validation",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "A Monte Carlo simulation that uses a normal distribution for daily returns will accurately capture the frequency of extreme market crashes (like -20% days) seen in real markets.",
          correct: false,
          explanation:
            "Real market returns have **fat tails** (leptokurtosis) — extreme events (±3σ, ±4σ moves) occur far more frequently than a normal distribution predicts. The normal distribution assigns a probability of ~0.003% to a -4σ day; real markets have such days multiple times per decade. Monte Carlo models using normal distributions systematically **underestimate crash risk**. More realistic simulations use fat-tailed distributions (Student's t, GEV) or historical bootstrapping to better capture tail risk.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "You run 5,000 Monte Carlo paths for your strategy over 6 months. Results: 5th pct drawdown = -38%, 50th pct drawdown = -14%, 95th pct = -4%. What does the 5th percentile tell you?",
          options: [
            "In 5% of simulated scenarios, the strategy would experience a drawdown of 38% or worse",
            "The strategy has a 5% chance of losing money over 6 months",
            "The worst possible drawdown is -38%",
            "95% of scenarios produce drawdowns less than -14%",
          ],
          correctIndex: 0,
          explanation:
            "The 5th percentile means that in 5% of the 5,000 simulated paths (250 paths), the maximum drawdown reached -38% or worse at some point during the 6 months. It is NOT the absolute worst (some paths had worse drawdowns — the true worst was below -38%). It is NOT about whether the strategy loses money overall (that's a different metric — ending P&L vs drawdown). The 95th percentile (-4%) means 95% of paths had max drawdown of 4% or worse, NOT better.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Backtesting Principles
       ================================================================ */
    {
      id: "quant-4",
      title: "Backtesting Principles",
      description:
        "In-sample vs out-of-sample testing, overfitting, walk-forward validation",
      icon: "RefreshCw",
      xpReward: 125,
      steps: [
        {
          type: "teach",
          title: "In-Sample vs Out-of-Sample Testing",
          content:
            "**In-sample (IS) data**: The historical data you use to develop and optimize your strategy. Your strategy parameters are fit to this data.\n\n**Out-of-sample (OOS) data**: Data your strategy has never 'seen' — held aside during development and tested only after the strategy is finalized.\n\n**Why the distinction matters**: Any strategy can be optimized to look perfect on historical data. The key question is: does it work on data it wasn't optimized on?\n\n**Standard split:**\n- IS period: First 70% of data (e.g., 2010–2019 for a 10-year dataset)\n- OOS period: Final 30% (2020–2022)\n- Never touch OOS data until the strategy is fully defined\n\n**The OOS degradation rule of thumb**: Expect OOS performance to be 50–70% of IS performance. A Sharpe of 1.4 in-sample that drops to 0.7–1.0 out-of-sample is normal and acceptable. A Sharpe of 1.4 in-sample dropping to 0.1 OOS signals overfitting.\n\n**Fatal mistake**: Using OOS data to tune parameters ('I tested on 2020–2022 and the strategy underperformed, so I added a filter to fix it'). Once you modify based on OOS, that data is now contaminated — it's effectively in-sample.",
          highlight: [
            "in-sample",
            "out-of-sample",
            "overfitting",
            "OOS degradation",
            "data contamination",
          ],
        },
        {
          type: "teach",
          title: "Overfitting: The Curse of Backtesting",
          content:
            "**Overfitting** occurs when a model captures noise in historical data rather than genuine patterns. An overfit strategy looks excellent in backtests but fails in live trading.\n\n**Signs of overfitting:**\n1. **Too many parameters**: A 5-parameter strategy on 3 years of daily data (750 bars) has 1 parameter per 150 bars — borderline acceptable. A 20-parameter strategy on the same data is almost certainly overfit.\n2. **Excessive optimization**: Testing 10,000 parameter combinations and picking the best one will always find a 'winning' combination by chance alone.\n3. **Suspiciously smooth equity curve**: Real strategies have losing months. A backtest with 11/12 months profitable for 5 years straight is almost certainly overfit.\n4. **Large IS → OOS performance drop**: Sharpe drops from 2.0 → 0.2.\n\n**The number of trades rule**: A strategy needs **at least 100 independent trades** to have statistical significance. Fewer trades means the backtest result could easily be noise.\n\n**Deflated Sharpe Ratio (DSR)**: Adjusts reported Sharpe for multiple testing. If you tested 1,000 parameter combinations, a Sharpe of 1.5 is expected purely from chance. DSR accounts for this inflation.",
          highlight: [
            "overfitting",
            "parameters",
            "multiple testing",
            "statistical significance",
            "Deflated Sharpe Ratio",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A quant tests 500 different moving average crossover combinations on 5 years of SPY data and finds the combination with the highest Sharpe ratio (1.82). Why should this result be treated skeptically?",
          options: [
            "With 500 combinations tested, a Sharpe of 1.82 could easily be due to chance — the best of 500 random strategies will always look good",
            "Moving average strategies are banned by the SEC on major ETFs",
            "A Sharpe of 1.82 is too low to be considered significant",
            "5 years of data is always sufficient to validate any strategy",
          ],
          correctIndex: 0,
          explanation:
            "Testing 500 combinations means you've essentially run 500 random experiments and picked the winner. Under the null hypothesis (no edge), if each test has a 2% chance of producing Sharpe > 1.5 by random chance alone, testing 500 combinations produces an expected ~10 'significant' results purely by luck. The reported Sharpe of 1.82 needs to be deflated by the multiple testing correction. The true, adjusted Sharpe is likely close to zero for most of these combinations.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Walk-Forward Optimization",
          content:
            "**Walk-forward testing** is the gold standard for strategy validation. It simulates real trading by repeatedly re-optimizing on fresh IS data and trading on small rolling OOS windows.\n\n**Walk-forward process:**\n1. Use data months 1–24 as IS window → optimize parameters → record best parameters\n2. Trade (simulate) months 25–27 OOS using those parameters → record OOS P&L\n3. Slide forward: use months 4–27 as IS → optimize → trade months 28–30 OOS\n4. Repeat across the full dataset\n5. Concatenate all OOS trading periods → this is your walk-forward equity curve\n\n**Key metrics:**\n- **Walk-forward efficiency (WFE)** = OOS Sharpe / IS Sharpe. WFE > 0.7 is a good sign. WFE < 0.3 signals instability.\n- **Parameter stability**: If the optimal parameters jump wildly each window (fast MA from 5 to 50 to 12), the strategy is fragile. Stable parameters across windows suggest robust edge.\n\n**Practical window sizes:**\n- IS window: 6–24 months (must have ≥ 100 trades)\n- OOS window: 1–3 months\n- Walk forward: 10–20 windows minimum for statistical validity",
          highlight: [
            "walk-forward",
            "WFE",
            "rolling optimization",
            "parameter stability",
            "OOS window",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A quant develops a mean-reversion strategy on individual stocks. In-sample Sharpe (2015–2020): 1.65. Walk-forward efficiency = 0.82 (consistent OOS Sharpe ~1.35 across 8 forward windows). The strategy was tested on only 2 parameter combinations (entry z-score threshold of 2.0 or 2.5). Total trades in 5-year IS period: 340.",
          question:
            "Based on sound backtesting principles, how should this strategy be characterized?",
          options: [
            "Promising: high WFE, limited parameter testing reduces overfitting concern, and 340 trades provide statistical validity",
            "Overfit: any Sharpe above 1.5 on stocks is impossible without data snooping",
            "Invalid: walk-forward testing is only appropriate for futures strategies, not stocks",
            "Inconclusive: the strategy needs at least 10,000 trades before any conclusion can be drawn",
          ],
          correctIndex: 0,
          explanation:
            "This strategy has several encouraging signs: (1) Walk-forward efficiency of 0.82 (OOS Sharpe ≈ 82% of IS) is well above the 0.7 threshold; (2) Only 2 parameter combinations tested — minimal multiple testing inflation; (3) 340 trades far exceeds the 100-trade minimum for statistical significance; (4) Consistent results across 8 independent walk-forward windows. This is a methodologically sound backtest. It's not a guarantee of future performance, but the validation approach is rigorous.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A strategy backtested over 15 years with a Sharpe ratio of 2.5 and only 40 total trades provides very strong evidence of a real trading edge.",
          correct: false,
          explanation:
            "40 trades over 15 years is far too few for statistical significance. With only 40 trades, the standard error of the Sharpe ratio estimate is approximately 1/√40 ≈ 0.16 — meaning the true Sharpe could plausibly range from 2.5 ± 2×0.16 = 2.2 to 2.8, but even a single lucky year of 5–10 trades could produce a Sharpe of 2.5+ purely by chance. The minimum is approximately 100 trades, and ideally 200+ for robust inference. Strategies that trade rarely are very hard to validate statistically.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Factor Models
       ================================================================ */
    {
      id: "quant-5",
      title: "Factor Models",
      description:
        "Momentum, value, quality, and size factors — how they work and how to use them",
      icon: "Layers",
      xpReward: 130,
      steps: [
        {
          type: "teach",
          title: "What Are Factor Models?",
          content:
            "**Factor models** decompose asset returns into exposures to systematic risk factors. Instead of picking individual stocks, you target persistent characteristics that drive excess returns across thousands of stocks.\n\n**The CAPM** (Capital Asset Pricing Model) was the first factor model: returns explained by one factor — **market beta**.\n\n**Fama-French Three-Factor Model** (1992) added:\n- **Market (MKT)**: Excess market return\n- **SMB** (Small Minus Big): Small-cap stocks outperform large-cap over long horizons\n- **HML** (High Minus Low): Value stocks (high book/price) outperform growth stocks\n\n**Modern five-factor models** add:\n- **RMW** (Robust Minus Weak): Profitable firms outperform unprofitable ones\n- **CMA** (Conservative Minus Aggressive): Low-investment firms outperform high-investment firms\n\n**Factor return equation**: r_i = α + β₁(MKT) + β₂(SMB) + β₃(HML) + β₄(MOM) + ε\n\nA portfolio manager with α = 2% annually after controlling for factor exposures is genuinely generating alpha — beating the market beyond what factor tilts explain.",
          highlight: [
            "factor model",
            "CAPM",
            "Fama-French",
            "alpha",
            "beta",
            "factor exposure",
          ],
        },
        {
          type: "teach",
          title: "Momentum Factor: Trend Continuation at Scale",
          content:
            "**Momentum** is one of the most robust factors in finance: stocks that performed best over the past 12 months (excluding the most recent month) tend to continue outperforming for the next 1–6 months.\n\n**Jegadeesh & Titman (1993)** documented 12-1 momentum (12-month return, skip last month): top-decile stocks outperformed bottom-decile by **1.0–1.5% per month** on average, with a Sharpe near 0.5 over 50+ years.\n\n**Why it persists:**\n1. **Underreaction**: Investors slowly incorporate news into prices; early buyers create a drift\n2. **Herding**: Institutional flows chase recent winners, creating trend continuation\n3. **Anchoring**: Investors anchor to old prices, causing gradual adjustment\n\n**Momentum crashes**: In sharp market reversals (2009, 2020 March-April), momentum strategies experience catastrophic losses as recent winners (defensive stocks) get sold and recent losers (cyclicals) recover. Momentum exposure requires crash risk management — often via a volatility-scaling rule.\n\n**Implementation**: Long top quintile 12-1 momentum stocks, short bottom quintile. Rebalance monthly.",
          highlight: [
            "momentum",
            "12-1 momentum",
            "underreaction",
            "momentum crash",
            "trend continuation",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "You build a momentum portfolio: rank the S&P 500 by 12-month return (excluding last month), buy the top 20%, short the bottom 20%. Which scenario would most likely cause a large short-term loss in this portfolio?",
          options: [
            "A sharp market reversal where beaten-down stocks recover strongly and recent winners are sold off in a flight to safety",
            "A gradual market rally where most stocks rise 1–2% per week for several months",
            "High inflation data causing the Fed to raise interest rates by 0.25%",
            "A new entrant to the S&P 500 index with strong recent performance",
          ],
          correctIndex: 0,
          explanation:
            "Momentum crashes occur during sharp reversals. In a momentum portfolio, the long book holds recent winners (often richly valued, 'crowded' longs) and the short book holds recent losers (often deeply distressed stocks). When the market reverses sharply, losers recover explosively (short squeeze + mean reversion), while winners get sold first in risk-off environments. This 'double pain' — long book falls + short book rises — creates momentum crashes. The 2009 recovery (March–May) saw momentum strategies lose 30–40% in weeks.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Value, Quality, and Size Factors",
          content:
            "**Value factor**: Cheap stocks (high book/price, low P/E, high earnings yield) outperform expensive stocks over long horizons. The HML factor (Fama-French) long-shorts this spread. **Edge comes from**: investor overreaction to bad news (oversell cheap stocks), career risk aversion of fund managers (avoiding distressed names).\n\nValue underperformed dramatically 2010–2020 (growth dominance) and rebounded sharply in 2021–2022 (rate rises hurt growth stocks). Long-term Sharpe ≈ 0.3–0.5, with very long dry spells.\n\n**Quality factor**: High-quality firms (high ROE, stable earnings, low debt) outperform low-quality. The RMW factor captures this. Quality is sometimes called the 'defensive' factor — it holds up better in downturns.\n\n**Size factor (SMB)**: Small-cap stocks earn higher long-run returns than large caps, attributed to illiquidity premium and analyst neglect. The premium has been weaker post-2000 as large passive flows favor mega-caps.\n\n**Factor correlation matrix matters**: Momentum and value are negatively correlated (value buys past losers, momentum buys past winners). Combining them in a portfolio reduces volatility while preserving combined return. Quality is mildly positively correlated with value.",
          highlight: [
            "value factor",
            "quality factor",
            "size factor",
            "HML",
            "RMW",
            "SMB",
            "factor correlation",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An ETF manager runs a 'multi-factor' portfolio: equal-weight exposure to momentum, value, and quality factors. Why is combining these three factors potentially better than running any single factor alone?",
          options: [
            "Momentum and value have low or negative correlation — when one underperforms the other often outperforms, smoothing the combined equity curve",
            "More factors always improve returns because each adds independent return generation",
            "Multi-factor portfolios are legally required to outperform single-factor strategies",
            "The quality factor eliminates all drawdowns from the momentum and value factors",
          ],
          correctIndex: 0,
          explanation:
            "The key benefit is diversification across factors with low correlation. Momentum (12-1 return ranking) and value (low P/E) are structurally negatively correlated — momentum buys recent winners (which are often expensive growth stocks) while value buys cheap stocks (often recent losers). When momentum underperforms during a reversal, value often outperforms (cheap stocks recover). Combining them smooths the combined P&L. Quality adds a defensive overlay. No factor eliminates all drawdowns — they all have cycles of underperformance.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A stock with high factor exposure to momentum (top decile 12-month return) will always outperform the market over the next 6 months, as documented by academic research.",
          correct: false,
          explanation:
            "Factor models describe **average** tendencies across many stocks over many time periods — not certainties for individual stocks. A single high-momentum stock can (and often does) underperform in any given 6-month period. The momentum effect is a statistical regularity that shows up in the average of hundreds of stocks across many years. For any single stock, idiosyncratic risks (earnings miss, product failure, fraud) can easily overwhelm the factor signal. Factors are portfolio-level, not stock-level, predictors.",
          difficulty: 1,
        },
      ],
    },
  ],
};
