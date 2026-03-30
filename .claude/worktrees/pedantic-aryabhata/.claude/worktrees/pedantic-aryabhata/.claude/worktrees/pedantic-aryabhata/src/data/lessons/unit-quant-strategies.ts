import type { Unit } from "./types";

export const UNIT_QUANT_STRATEGIES: Unit = {
  id: "quant-strategies",
  title: "Quantitative Strategies",
  description:
    "Master statistical arbitrage, mean reversion, momentum, machine learning in finance, and HFT market making",
  icon: "Cpu",
  color: "#22c55e",
  lessons: [
    // ─── Lesson 1: Statistical Arbitrage ────────────────────────────────────────
    {
      id: "quant-strat-1",
      title: "Statistical Arbitrage",
      description:
        "Pairs trading mechanics, cointegration testing, and real-world execution challenges",
      icon: "GitCompareArrows",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Pairs Trading Mechanics",
          content:
            "**Statistical arbitrage** exploits pricing inefficiencies between related securities using quantitative models.\n\n**Pairs trading** is the classic implementation: find two stocks whose prices move together (cointegrated) and trade the divergence.\n\n**Step 1 — Find cointegrated pairs**:\nRun the **Engle-Granger test**: regress log(P1) on log(P2) to get hedge ratio β, then test the residuals with an **Augmented Dickey-Fuller (ADF) test** for stationarity. If residuals are stationary, the pair is cointegrated.\n\n**Step 2 — Construct the spread**:\nSpread = log(P1) − β × log(P2)\n\nThis spread is stationary — it fluctuates around a long-run mean.\n\n**Step 3 — Trade on divergence**:\n- Entry: when spread deviates more than **2σ** from its rolling mean (e.g., 30-day lookback)\n- Exit: when spread reverts to mean (0σ)\n- Stop loss: if spread exceeds 3–4σ (pair may have broken down)\n\n**Classic liquid pairs**: KO/PEP (both cola), GS/MS (both investment banks), XOM/CVX (both oil majors). Pairs within the same industry tend to share fundamental drivers.\n\n**Market-neutral**: Long the cheap leg, short the expensive leg. Net dollar exposure hedged → returns uncorrelated with market direction.",
          highlight: [
            "statistical arbitrage",
            "pairs trading",
            "Engle-Granger test",
            "ADF test",
            "hedge ratio",
            "cointegrated",
            "spread",
            "2σ",
            "market-neutral",
          ],
        },
        {
          type: "teach",
          title: "Cointegration vs Correlation",
          content:
            "A critical distinction that trips up many traders: **correlation ≠ cointegration**.\n\n**Correlation** measures short-term co-movement. Two stocks may be 90% correlated over a year, yet their prices diverge permanently — this is **spurious regression** (a statistical artifact when both series trend independently).\n\n**Cointegration** implies a long-run equilibrium. Even if the pair temporarily diverges, an economic force pulls it back. Example: airlines and jet fuel — they may diverge for months but eventually align because fuel is a key cost driver.\n\n**Testing for cointegration**:\n- **Engle-Granger (2-step)**: suitable for pairs\n- **Johansen test**: handles multiple cointegrated series simultaneously — useful for basket trades (e.g., a 3-stock portfolio)\n\n**Half-life of mean reversion**:\nThe **Ornstein-Uhlenbeck (OU) process** models the spread's dynamics:\ndX = θ(μ − X)dt + σdW\n\nwhere θ is the mean-reversion speed. Half-life = ln(2)/θ.\n\nA half-life of 5–30 days is practical for most trading. Too short (< 2 days): execution costs kill you. Too long (> 90 days): capital tied up too long, convergence may not happen in time.\n\n**Rule of thumb**: pairs with half-life 10–20 days and ADF p-value < 0.05 are most tradable.",
          highlight: [
            "correlation",
            "cointegration",
            "spurious regression",
            "Johansen test",
            "Ornstein-Uhlenbeck",
            "half-life",
            "mean-reversion speed",
            "ADF p-value",
          ],
        },
        {
          type: "teach",
          title: "Real-World Execution Challenges",
          content:
            "Pairs trading looks elegant in backtests. In live markets, several forces can erode or eliminate edge:\n\n**Look-ahead bias**:\nIn backtesting, you must never use future data to form the hedge ratio β or the spread mean/σ. Always use only data available at the time of the signal — use expanding or rolling windows, never the full sample.\n\n**Transaction costs**:\nEach pairs trade involves four legs (open long, open short, close long, close short) plus potential short-borrowing fees. On small spreads, costs can consume 30–80% of gross P&L. Always model realistic costs.\n\n**Crowding**:\nWhen a pairs trade becomes well-known, many funds implement it simultaneously. This creates **crowding risk**: when one fund unwinds in a crisis, all correlated pairs trades unwind simultaneously — correlations spike to 1 exactly when diversification is needed. August 2007 'quant quake' is the canonical example.\n\n**Capacity constraints**:\nStat arb strategies are capacity-limited. Larger position sizes move the market, eliminating the mispricing you are trying to exploit. Most stat arb funds cap AUM at $1–5B.\n\n**Regime changes**:\nA pair can break down fundamentally — e.g., if one company is acquired, pivots its business model, or faces regulatory changes that do not affect its pair. Always monitor fundamentals alongside the statistical signal and have a hard stop rule.",
          highlight: [
            "look-ahead bias",
            "transaction costs",
            "crowding risk",
            "August 2007",
            "quant quake",
            "capacity constraints",
            "regime changes",
            "fundamental breakdown",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In pairs trading, what is the standard signal for entering a trade?",
          options: [
            "The spread between the two stocks exceeds 2σ from its rolling mean",
            "Both stocks hit new 52-week lows simultaneously",
            "The correlation between the two stocks drops below 0.5",
            "One stock's price exceeds the other by more than 10%",
          ],
          correctIndex: 0,
          explanation:
            "The entry signal in pairs trading is when the spread (log(P1) − β×log(P2)) deviates more than 2 standard deviations from its rolling mean (typically 20–30 day lookback). This indicates an unusual divergence from the long-run equilibrium. The trader goes long the relatively cheap leg and short the relatively expensive leg, expecting the spread to revert. Exit occurs when the spread returns to its mean (0σ). A stop loss is placed at 3–4σ in case the pair fundamentally breaks down.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Stocks that are highly correlated over a short period are necessarily cointegrated and therefore suitable for pairs trading.",
          correct: false,
          explanation:
            "FALSE. High correlation does not imply cointegration. Correlation measures short-term co-movement, while cointegration implies a stable long-run equilibrium relationship. Two stocks can be 95% correlated over a year yet diverge permanently (spurious regression). Cointegration requires the spread to be stationary, tested using methods like the Engle-Granger two-step procedure or the Johansen test. Always test for cointegration explicitly — never assume it from correlation alone.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You enter a pairs trade: long 100 shares of Stock A at $50 and short 100 shares of Stock B at $60 (hedge ratio β = 1.0). Three weeks later, Stock A is at $54 and Stock B is at $61 — the spread has narrowed and reverted to its mean. You close both positions.",
          question: "What is the total P&L on this pairs trade (ignoring costs)?",
          options: [
            "+$300 (long A gained $400, short B lost $100)",
            "+$500 (long A gained $400, short B gained $100... wait, let me recalculate)",
            "+$300 total: $400 gain on long A, $100 loss on short B",
            "+$500 total: $400 gain on long A, $100 gain on short B",
          ],
          correctIndex: 2,
          explanation:
            "Long A: bought at $50, sold at $54 → gain of $4 × 100 = $400. Short B: shorted at $60, covered at $61 → loss of $1 × 100 = $100. Total P&L = $400 − $100 = +$300. The spread narrowed from $10 (60−50) to $7 (61−54), generating profit as the divergence reverted to its long-run mean. Notice that even though B rose (which normally hurts a short), the larger gain on A more than offset it — this is the paired, market-neutral nature of the trade.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Mean Reversion Strategies ────────────────────────────────────
    {
      id: "quant-strat-2",
      title: "Mean Reversion Strategies",
      description:
        "Cross-sectional mean reversion, volatility mean reversion, and risk management for contrarian trades",
      icon: "RefreshCw",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Cross-Sectional Mean Reversion",
          content:
            "**Cross-sectional mean reversion** sorts all stocks in a universe each period and bets that extreme performers will revert toward the average.\n\n**Contrarian strategy** (DeBondt & Thaler 1985):\n- Monthly rebalance: buy the worst-performing quintile of the past 1 month, short the best-performing quintile\n- Hold 1 month, then rebalance\n- This is the opposite of 12-month momentum (which works over longer horizons)\n\n**Why does short-term mean reversion work?**\n- **Market microstructure**: bid-ask bounce, temporary price pressure from large orders\n- **Overreaction**: investors overreact to short-term news; prices overshoot intrinsic value\n- **Liquidity provision**: the strategy essentially acts as a liquidity provider — buying when others sell aggressively\n\n**Horizons matter**:\n- Daily mean reversion: strongest (0–5 day horizon) — driven by microstructure\n- Weekly: moderate\n- Monthly: contrarian somewhat works at 1-month horizon\n- 3–12 months: **momentum dominates** (short-term mean reversion reverses to momentum)\n\n**Factor level**: Cross-sectional mean reversion also applies at the factor level — if value stocks dramatically underperform, they tend to bounce in subsequent weeks. This is different from stock-level mean reversion.",
          highlight: [
            "cross-sectional mean reversion",
            "contrarian strategy",
            "monthly rebalance",
            "overreaction",
            "liquidity provider",
            "momentum",
            "factor level",
          ],
        },
        {
          type: "teach",
          title: "Volatility Mean Reversion",
          content:
            "Volatility is one of the most reliably mean-reverting series in finance.\n\n**VIX mean reversion**:\nThe VIX (CBOE Volatility Index) measures implied vol of the S&P 500. It spikes during crises and reverts to long-run average (~20%). Strategies that **sell vol during VIX spikes** (e.g., selling puts or VIX futures) capture the mean reversion premium — but beware: the downside when reversion is delayed is catastrophic (XIV blowup 2018).\n\n**RSI-based mean reversion**:\nOversold stocks (RSI < 20–30) statistically bounce more often than not in the next 5–10 trading days. This is a pure mean reversion signal. **Backtested rule**: buy when RSI(2) < 5, sell when RSI(2) > 95. (Larry Connors popularized this.)\n\n**Bollinger Bands**:\n- **Reversion signal**: price touches lower BB (2σ below 20-day MA) → mean reversion bet back to MA\n- **Breakout signal**: BB squeeze (bands contract) → volatility expansion follows\nChoose based on regime: trending markets favor breakout; range-bound markets favor reversion.\n\n**Fixed income mean reversion**:\nYield curve steepeners bet on mean reversion of an abnormally flat/inverted yield curve. Historical average 10Y−2Y spread is ~150bps — extreme inversions (−50bps or lower) tend to revert, though the timing is uncertain.",
          highlight: [
            "volatility mean reversion",
            "VIX",
            "sell vol",
            "RSI",
            "oversold",
            "Bollinger Bands",
            "BB squeeze",
            "yield curve steepener",
          ],
        },
        {
          type: "teach",
          title: "Risk Management for Mean Reversion",
          content:
            "Mean reversion strategies carry distinctive risks that differ from trend-following approaches.\n\n**Stop loss dilemma**:\nMean reversion logic says: if a stock dropped 10%, it is now cheaper — should be a better buy. This conflicts with conventional stop-loss discipline ('cut losers'). Some mean reversion traders use no hard stop (relying on position sizing instead), but this exposes them to catastrophic losses if a stock is fundamentally broken.\n\n**Practical compromise**: use a 'regime filter' — if a stock is down 10% AND its fundamentals have deteriorated (earnings miss, analyst downgrades), exit. If the drop seems technical/liquidity-driven, hold or add.\n\n**Position sizing via inverse volatility**:\nSize each position as 1/σ_i so that each position contributes equal risk regardless of its individual volatility. Higher-vol stocks get smaller positions.\n\n**Maximum Adverse Excursion (MAE)**:\nMAE analysis plots the worst intra-trade drawdown against final P&L. Good mean reversion setups should not require large adverse moves before profiting. If your profitable trades all had large MAEs, the strategy may be getting lucky — not capturing a real edge.\n\n**Value trap risk**:\nThe hardest judgment call in mean reversion: is this stock cheap because of temporary overreaction (genuine mean reversion), or cheap because the business is deteriorating (value trap)? Incorporate a fundamental filter — avoid stocks with declining revenue, rising leverage, or sector headwinds.",
          highlight: [
            "stop loss dilemma",
            "regime filter",
            "inverse volatility",
            "Maximum Adverse Excursion",
            "MAE",
            "value trap",
            "fundamental filter",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Over which horizon is cross-sectional mean reversion (contrarian strategy) strongest?",
          options: [
            "1–5 trading days",
            "1 month",
            "3–6 months",
            "12 months",
          ],
          correctIndex: 0,
          explanation:
            "Cross-sectional mean reversion is strongest over very short horizons of 1–5 trading days, driven primarily by market microstructure effects (bid-ask bounce, temporary liquidity imbalances, overnight order flow). At the 1-month horizon, a contrarian effect still exists but is weaker. At 3–12 months, momentum dominates — past winners continue to outperform past losers (the Jegadeesh-Titman finding). So short-term mean reversion and medium-term momentum coexist in the same market, just at different time scales.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In a mean reversion strategy, continuously adding to a losing position is always the correct response because the price will eventually revert to the mean.",
          correct: false,
          explanation:
            "FALSE. Adding to losing mean-reversion positions is often called 'catching a falling knife' and carries significant risk of catastrophic loss. While mean reversion is a real statistical phenomenon, it is not guaranteed — stocks can be in a permanent fundamental decline (a 'value trap') rather than a temporary overreaction. Risk management in mean reversion requires position sizing limits, fundamental filters to distinguish real mean reversion from deteriorating fundamentals, and often a maximum adverse excursion (MAE) threshold beyond which the thesis is invalidated.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You run a mean reversion strategy with $100,000 in capital. Your universe has 20 stocks. You want to size positions using inverse volatility weighting. Stock A has daily volatility of 2%, Stock B has daily volatility of 4%. You allocate equal risk budget to both.",
          question:
            "If Stock A gets a $5,000 position, approximately how large should Stock B's position be?",
          options: [
            "$5,000 — same as Stock A",
            "$2,500 — half of Stock A since B is twice as volatile",
            "$10,000 — double Stock A since B needs more shares",
            "$1,250 — a quarter of Stock A",
          ],
          correctIndex: 1,
          explanation:
            "Inverse volatility weighting sets position size proportional to 1/σ. Stock A has σ = 2%, Stock B has σ = 4% (twice as volatile). To achieve equal dollar risk contribution: position_B = position_A × (σ_A / σ_B) = $5,000 × (2%/4%) = $2,500. This way both positions contribute the same expected dollar volatility to the portfolio. Inverse volatility weighting is a simple but effective approach to risk-parity position sizing that doesn't require a full covariance matrix.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Momentum & Trend Following ───────────────────────────────────
    {
      id: "quant-strat-3",
      title: "Momentum & Trend Following",
      description:
        "Cross-sectional momentum, time-series trend following, and combining momentum with quality/value",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Cross-Sectional Momentum",
          content:
            "**Cross-sectional momentum** (Jegadeesh & Titman, 1993) is one of the most robust anomalies in finance, replicated across markets and time periods.\n\n**The strategy**:\n- Each month, rank all stocks by their past **12-month return, skipping the most recent 1 month** (i.e., 12-1 momentum, from month t-12 to t-2)\n- Buy the top quintile (winners), short the bottom quintile (losers)\n- Hold for 3–12 months, then rebalance\n\n**Why skip the last month?** The most recent month exhibits short-term reversal (microstructure noise). Skipping it improves the signal.\n\n**Why does momentum work?**\n- **Underreaction**: investors are slow to incorporate news; prices drift toward fundamental value over months\n- **Trend extrapolation**: behavioral investors extrapolate recent trends, pushing prices further\n- **Analyst coverage lag**: analysts revise estimates slowly after earnings surprises\n\n**Momentum crash risk**:\nMomentum strategies suffer severe crashes after market turnarounds — e.g., January 2001 and March 2009. When beaten-down stocks rebound sharply, the short leg of the momentum portfolio loses severely. These crashes are infrequent but very deep (−40 to −80% in a few weeks).\n\n**Implementation**: MTUM (iShares MSCI USA Momentum Factor ETF) and PDP (Invesco DWA Momentum ETF) provide liquid exposure.",
          highlight: [
            "cross-sectional momentum",
            "Jegadeesh & Titman",
            "12-1 momentum",
            "winners",
            "losers",
            "underreaction",
            "momentum crash",
            "MTUM",
          ],
        },
        {
          type: "teach",
          title: "Time-Series (Trend Following) Momentum",
          content:
            "**Time-series momentum** (TSMOM) differs from cross-sectional: instead of ranking assets against each other, each asset is judged on its own past return.\n\n**Core rule**: \n- If an asset's 12-month return is positive → go long\n- If negative → go short (or exit to cash)\n\nApplied independently across multiple asset classes: equities, bonds, commodities, FX. This is the foundation of **managed futures** / **CTA (Commodity Trading Advisor)** strategies.\n\n**Crisis alpha**:\nTrend following has historically performed well during equity bear markets — it is **long put-like** in its payoff profile. Notable examples:\n- 2008 financial crisis: Managed futures indices +10–20% while equities −40%\n- 2022 inflation shock: Trend followers +20–30% while equities −20%\nThis makes TSMOM a natural hedge for equity-heavy portfolios.\n\n**Leading practitioners**:\n- **AHL** (Man Group) — one of the first systematic trend followers, founded 1987\n- **Winton Group** — founded by David Harding; statistical trend following\n- **Millburn Ridgefield** — multi-strategy trend\n\n**Benchmark indices**: BTOP50, SG Trend Index track managed futures performance.\n\n**Lookback sensitivity**: 12-month lookback is most common, but optimal lookback varies by asset class and regime. Many managers blend multiple lookback periods (1-month, 3-month, 12-month) for robustness.",
          highlight: [
            "time-series momentum",
            "TSMOM",
            "managed futures",
            "CTA",
            "crisis alpha",
            "2008",
            "2022",
            "AHL",
            "Winton",
            "BTOP50",
          ],
        },
        {
          type: "teach",
          title: "Combining Momentum with Quality and Value",
          content:
            "Pure momentum has high turnover and crash risk. Combining it with other factors improves risk-adjusted returns.\n\n**Quality + Momentum (QMOM)**:\nFilter momentum winners for quality: high ROE, low debt, stable earnings. This avoids 'low-quality momentum' — junk stocks that are rising only because of speculation, and which crash hard when sentiment turns. O'Shaughnessy Asset Management's QMOM strategy popularized this.\n\n**Avoiding value traps with momentum**:\nValue investors screen for cheap stocks (low P/E). But cheap stocks can stay cheap forever ('value trap'). Applying a momentum filter — only buy cheap stocks that are starting to show positive momentum — helps identify when the catalyst has arrived.\n\n**Momentum crash hedging**:\nShort-term reversal signal (last month's return) inversely predicts next-month returns. When the momentum portfolio is in distress (losers recently bounced), the reversal signal turns positive — use it to reduce momentum exposure dynamically.\n\n**Turnover implications**:\nMonthly momentum rebalancing generates ~100–200% annual turnover. After transaction costs, net alpha is substantially lower than gross. Implementation must account for: bid-ask spreads, market impact, short borrowing costs. Many practitioners use quarterly rebalancing as a compromise.",
          highlight: [
            "quality + momentum",
            "QMOM",
            "value trap",
            "momentum crash hedge",
            "short-term reversal",
            "turnover",
            "transaction costs",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In the standard cross-sectional momentum strategy, what look-back period is used, and why is the most recent month excluded?",
          options: [
            "12 months look-back, skipping the last 1 month to avoid the short-term reversal effect",
            "6 months look-back, skipping the last 1 month due to earnings seasonality",
            "3 months look-back, skipping the last week for data quality reasons",
            "12 months look-back including the most recent month for timeliness",
          ],
          correctIndex: 0,
          explanation:
            "The Jegadeesh-Titman momentum factor uses 12-1 momentum: returns from month t-12 to t-2, explicitly skipping the most recent month (t-1 to t). This is because the last month exhibits a short-term reversal effect (microstructure noise, bid-ask bounce) that would contaminate the momentum signal. Including it would hurt performance. The 12-month window captures the underreaction / slow drift effect. Skipping the last month is a consistent finding across markets and decades.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Managed futures (trend-following) strategies have historically generated positive returns during major equity bear markets, providing crisis alpha to a diversified portfolio.",
          correct: true,
          explanation:
            "TRUE. Trend-following managed futures have demonstrated 'crisis alpha' — positive performance during significant equity bear markets. In 2008, major managed futures indices gained 10–20% while equities fell ~40%. In 2022, trend followers gained 20–30% as they went short equities and bonds (both falling) and long commodities/USD (both rising). The strategy's time-series momentum signal naturally positions it long assets in uptrends and short assets in downtrends — creating a put-like convexity that is valuable during sustained market dislocations.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are constructing a momentum portfolio from a universe of 100 stocks. At month-end you rank all stocks by their 12-1 month return. The top 20% (20 stocks) average return was +45%, while the bottom 20% (20 stocks) averaged −35%. You go long the top quintile and short the bottom quintile with equal capital ($50,000 long, $50,000 short).",
          question:
            "If next month the momentum factor earns its historical average return of about +0.8% per month, approximately how much do you profit on a $100,000 gross exposure portfolio?",
          options: [
            "Approximately $800 (0.8% on $100,000 gross)",
            "Approximately $1,600 (0.8% on $50,000 long + 0.8% on $50,000 short = doubled)",
            "Approximately $400 (0.8% on $50,000 net invested)",
            "Approximately $3,200 (0.8% × 4 for leverage effect)",
          ],
          correctIndex: 0,
          explanation:
            "The 0.8% per month momentum premium is typically reported on a dollar-neutral long-short portfolio. On a $50,000 long / $50,000 short portfolio ($100,000 gross), the expected profit is approximately 0.8% × $100,000 = $800. The gross notional represents the total risk taken. Note that this is before transaction costs, which can consume a significant portion of the gross alpha — with 100–200% annual turnover, realistic net returns are lower. The momentum premium is real but implementation friction is substantial.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Machine Learning in Finance ───────────────────────────────────
    {
      id: "quant-strat-4",
      title: "Machine Learning in Finance",
      description:
        "Feature engineering, tree-based models, neural networks, and avoiding pitfalls in financial ML",
      icon: "BrainCircuit",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Feature Engineering for Financial ML",
          content:
            "The quality of a financial ML model is almost entirely determined by the quality of its features (inputs), not the sophistication of the algorithm.\n\n**Price-derived features**:\n- Returns at multiple lags: r(t-1), r(t-5), r(t-21) — capture different horizons\n- Realized volatility over 5, 21, 63 days\n- RSI, MACD, Bollinger Band position — technical signals as features\n- Volume ratios (today vs 20-day average)\n\n**Fundamental features**:\n- Earnings surprise magnitude and direction\n- Revenue growth, margin trends\n- Analyst revision momentum (estimates rising vs falling)\n\n**Alternative data**: satellite imagery (retail parking lot traffic), credit card transactions, web search trends, social media sentiment, job postings.\n\n**Data cleaning**:\n- Handle NaNs carefully — use forward-fill for fundamental data (last known value), but never forward-fill price data across long gaps\n- Winsorize extreme outliers (cap at 99th/1st percentile) to prevent single observations dominating model fitting\n\n**Cross-validation for time series**:\nStandard k-fold CV is wrong for financial data — it allows future data to train models that predict the past (information leakage).\n- **Walk-forward validation**: train on [t0, t1], test on [t1, t2], then expand/roll\n- **Purged CV**: remove observations near the train/test boundary (the 'embargo period') to prevent label overlap\n- **Combinatorial purged CV** (Lopez de Prado): tests on multiple non-overlapping test sets for more robust out-of-sample evaluation",
          highlight: [
            "feature engineering",
            "returns at multiple lags",
            "alternative data",
            "forward-fill",
            "winsorize",
            "walk-forward validation",
            "purged CV",
            "information leakage",
          ],
        },
        {
          type: "teach",
          title: "Random Forest and Gradient Boosting",
          content:
            "**Ensemble methods** combine many weak learners into a strong predictor and tend to outperform single models in noisy financial data.\n\n**Random Forest**:\n- Build hundreds of decision trees, each trained on a random bootstrap sample of data and a random subset of features\n- Final prediction = average (regression) or majority vote (classification)\n- Key hyperparameters: `n_estimators` (more = better, diminishing returns), `max_depth` (controls overfitting), `max_features` (controls diversity)\n- **Feature importance**: mean decrease in impurity across all trees — reveals which features drive predictions. Useful for understanding model logic and debugging.\n\n**Gradient Boosting (XGBoost, LightGBM)**:\n- Builds trees sequentially, each correcting the residuals of the previous\n- Generally outperforms Random Forest on tabular data\n- Hyperparameters: `learning_rate` (smaller = better regularization, needs more trees), `max_depth` (3–5 typical), `n_estimators` (500–5000)\n- Very prone to overfitting in finance — regularize aggressively\n\n**Overfitting in high-noise finance**:\nFinancial data has low signal-to-noise ratio. A model may achieve 55% accuracy in-sample and 50.1% out-of-sample — the in-sample accuracy is almost entirely noise. **Walk-forward out-of-sample testing is non-negotiable**. Treat any in-sample Sharpe > 2.0 with suspicion unless replicated out-of-sample.",
          highlight: [
            "Random Forest",
            "ensemble methods",
            "bootstrap",
            "feature importance",
            "Gradient Boosting",
            "XGBoost",
            "LightGBM",
            "overfitting",
            "signal-to-noise",
          ],
        },
        {
          type: "teach",
          title: "Neural Networks and Deep Learning",
          content:
            "Deep learning has transformed many fields, but its track record in finance is more mixed than popular press suggests.\n\n**LSTM (Long Short-Term Memory)**:\nDesigned for sequential data. Can theoretically capture long-range dependencies in price series. In practice, LSTMs do not consistently outperform simpler models (linear regression, gradient boosting) on financial return prediction. The signal is too weak relative to the noise for complex architectures to add value.\n\n**Transformer/Attention mechanisms**:\nThe architecture behind GPT and BERT. Some research shows promise for regime detection and event-driven predictions (earnings calls text analysis). Still largely experimental in return forecasting.\n\n**Overfitting risk is even worse with deep learning**:\nA neural network with millions of parameters applied to 10 years of daily data (~2,500 observations per asset) will memorize the training set completely. Regularization (dropout, L2, early stopping) and extensive out-of-sample testing are essential.\n\n**Marcos Lopez de Prado's triple barrier method**:\nA better labeling scheme for financial ML. Instead of labeling a return as positive/negative after fixed N days, labels are assigned based on which of three barriers is hit first: upper profit target, lower stop-loss, or time barrier. This captures the actual trade lifecycle and creates more realistic labels.\n\n**Combinatorial purged cross-validation (CPCV)**:\nLopes de Prado's rigorous framework — generates many non-overlapping train/test splits while purging the embargo zone. Provides a more reliable distribution of out-of-sample Sharpe ratios than a single train/test split.",
          highlight: [
            "LSTM",
            "Transformer",
            "attention mechanisms",
            "overfitting",
            "dropout",
            "triple barrier method",
            "Marcos Lopez de Prado",
            "combinatorial purged cross-validation",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "What is the primary purpose of using 'purged cross-validation' instead of standard k-fold cross-validation in financial ML?",
          options: [
            "To prevent information from future periods leaking into the training set through overlapping labels",
            "To reduce computational cost by using fewer training samples",
            "To ensure class balance between positive and negative return labels",
            "To handle missing data and NaN values in financial time series",
          ],
          correctIndex: 0,
          explanation:
            "Purged cross-validation removes (purges) observations near the train/test boundary to prevent information leakage. In financial ML, labels often overlap in time — for example, a label for 'return over next 21 days' at time t overlaps with the label at time t+1 through t+21. If overlapping observations end up in both training and testing folds, the model indirectly 'sees' future data during training, inflating apparent accuracy. The embargo period additionally blocks a gap after each test fold. Standard k-fold ignores time structure entirely and produces wildly optimistic in-sample metrics.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Ensemble methods like Random Forest generally outperform single decision trees in finance, largely because averaging across many diverse models reduces the impact of noise in high-noise financial data.",
          correct: true,
          explanation:
            "TRUE. Ensemble methods (Random Forest, gradient boosting) consistently outperform single models in financial applications. By training many models on different bootstrap samples and random feature subsets (Random Forest) or sequentially correcting residuals (boosting), ensembles reduce both variance and bias. Financial data has very low signal-to-noise ratio — a single decision tree will overfit idiosyncratic noise in the training sample. Averaging hundreds of trees smooths out this noise, extracting the weak but real underlying signal more reliably. This is one of the most replicated findings in financial ML research.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are building an ML model to predict 1-month stock returns. You have 15 years of daily data for 500 stocks. A colleague suggests using raw price levels, 1-day returns, 21-day realized volatility, trailing P/E ratio, analyst consensus estimate revision, and last month's trading volume as features.",
          question: "Which of the following feature choices is MOST problematic and why?",
          options: [
            "Raw price levels — they are non-stationary and will cause the model to learn spurious price-level patterns",
            "1-day returns — too noisy to be predictive at the 1-month horizon",
            "21-day realized volatility — changes too slowly to be useful",
            "Trailing P/E ratio — fundamental data is too slow-moving to help ML models",
          ],
          correctIndex: 0,
          explanation:
            "Raw price levels are non-stationary — they trend upward over time. An ML model trained on price levels will learn patterns like 'higher prices predict higher returns' purely because both correlate with time (spurious regression). When this regime shifts, the model fails catastrophically. All price-derived features should be transformed to stationary forms: returns, volatility, ratios, or z-scores. Returns, volatility, P/E ratios, analyst revisions, and volume ratios are all approximately stationary. Non-stationarity is the most common source of catastrophic out-of-sample failure in financial ML models.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: High-Frequency & Market Making ───────────────────────────────
    {
      id: "quant-strat-5",
      title: "High-Frequency & Market Making",
      description:
        "Market making economics, HFT strategies, and transaction cost analysis for optimal execution",
      icon: "Zap",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Market Making Economics",
          content:
            "A **market maker** continuously posts bid and ask quotes, profiting from the spread while providing liquidity to other market participants.\n\n**Revenue model**:\nProfit = Spread × Volume − Adverse Selection Losses\n\nEvery time an informed trader (who knows the stock is about to move) takes liquidity from a market maker, the market maker loses. The market maker's edge comes from trading with uninformed (liquidity-driven) flow many times, collecting the spread, while managing inventory risk.\n\n**Adverse selection risk**:\nIf a large order arrives, the market maker doesn't know if it's informed or uninformed. The **Glosten-Milgrom model** (1985) formalizes this: the spread widens to compensate for the probability of trading against an informed party. Wider spreads in illiquid stocks reflect higher adverse selection risk.\n\n**Inventory management**:\nMarket makers accumulate unwanted inventory (e.g., too many shares long). They must adjust quotes to attract offsetting flow — lower bid/ask to attract sellers when long, raise them to attract buyers when short. Unhedged inventory is a major risk.\n\n**Rebate economics (maker-taker)**:\nMost US exchanges pay liquidity providers (makers) a rebate (~$0.0020/share) and charge liquidity takers (~$0.0030/share). Market makers capture this rebate plus the spread. High-volume market makers like Virtu Financial, Citadel Securities, and Jane Street profit primarily from this model across millions of trades daily.",
          highlight: [
            "market maker",
            "bid and ask",
            "adverse selection",
            "Glosten-Milgrom model",
            "inventory management",
            "maker-taker",
            "rebate",
            "Virtu Financial",
            "Citadel Securities",
            "Jane Street",
          ],
        },
        {
          type: "teach",
          title: "HFT Strategies",
          content:
            "**High-frequency trading (HFT)** encompasses strategies that exploit speed advantages measured in microseconds to milliseconds.\n\n**Latency arbitrage**:\nWhen the S&P 500 futures price moves on CME (Chicago), the ETF SPY listed on NYSE lags by milliseconds. An HFT firm that receives the CME signal first (via co-location and direct fiber/microwave) can trade SPY before slower participants update their quotes.\n\n**The London-Frankfurt microwave link**:\nIn 2011, a microwave tower network was built across the English Channel to connect the LSE and Deutsche Börse. Microwave signals travel at ~97% of the speed of light (vs ~60% for fiber), shaving 2.7ms off round-trip latency. This latency edge is worth tens of millions annually.\n\n**Electronic market making at HFT scale**:\nFirms like Virtu quote millions of symbols across thousands of venues simultaneously, adjusting quotes ~1,000× per second. Their edge: better information (order flow data) and faster execution than slower market makers.\n\n**Co-location**:\nHFT firms pay exchanges to physically house their servers in the same data center as the exchange's matching engine. This reduces one-way latency to ~10–100 microseconds vs ~10ms for a typical trader.\n\n**Illegal strategies (avoid)**:\n- **Spoofing**: placing large orders with no intent to fill, to mislead other participants about supply/demand. Federal crime in the US since 2010 (Dodd-Frank).\n- **Layering**: placing multiple orders at different price levels to create false book depth, then canceling.",
          highlight: [
            "high-frequency trading",
            "latency arbitrage",
            "co-location",
            "microwave link",
            "2.7ms",
            "electronic market making",
            "spoofing",
            "layering",
            "Dodd-Frank",
          ],
        },
        {
          type: "teach",
          title: "Transaction Cost Analysis (TCA)",
          content:
            "For large institutional orders, **implementation shortfall** — the difference between the decision price and the final execution price — can dwarf the alpha signal.\n\n**Components of transaction costs**:\n1. **Spread cost**: paying the bid-ask spread (half-spread per leg)\n2. **Market impact**: the price moves against you as you buy/sell large quantities\n3. **Timing risk**: price moves while you are executing a multi-day order\n4. **Opportunity cost**: if you take too long, the opportunity may expire\n\n**Implementation shortfall** = (Average execution price − Decision price) / Decision price\nTypically expressed in basis points (bps). A 10bps shortfall on a $100M order = $100,000 in hidden costs.\n\n**Square root market impact model**:\nImpact ∝ σ × √(Q / ADV)\nwhere Q = order size, ADV = average daily volume, σ = daily volatility. An order of 10% of ADV has roughly 3× the impact of an order of 1% of ADV.\n\n**Optimal execution frameworks**:\n- **TWAP (Time-Weighted Average Price)**: spread order evenly over time — minimizes timing risk\n- **VWAP (Volume-Weighted Average Price)**: concentrate execution when volume is high (open/close) — reduces market impact\n- **Almgren-Chriss model** (1999): mathematically optimal trade schedule that balances market impact vs timing risk, parameterized by risk aversion. The most cited academic framework for optimal execution.",
          highlight: [
            "implementation shortfall",
            "market impact",
            "square root model",
            "ADV",
            "TWAP",
            "VWAP",
            "Almgren-Chriss model",
            "transaction cost analysis",
            "TCA",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In market making, 'adverse selection' refers to which of the following risks?",
          options: [
            "Informed traders taking liquidity from the market maker, resulting in losses when the price moves against the market maker's inventory",
            "The risk that the market maker selects the wrong bid-ask spread width",
            "Regulatory risk from adverse regulators selecting the market maker for investigation",
            "The risk that adverse weather disrupts the data center's network connection",
          ],
          correctIndex: 0,
          explanation:
            "Adverse selection in market making refers to the risk of trading against informed counterparties. When a trader who knows a stock is about to move significantly takes liquidity from a market maker, the market maker is immediately on the wrong side of an informed trade. The Glosten-Milgrom (1985) model formalizes this: the bid-ask spread must be wide enough to compensate for the probability that any given counterparty is informed. This is why illiquid stocks have wider spreads — there is greater uncertainty about whether the counterparty has superior information.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Co-location services, where HFT firms place their servers physically inside exchange data centers, give those firms a latency advantage over participants whose servers are located elsewhere.",
          correct: true,
          explanation:
            "TRUE. Co-location reduces round-trip latency from milliseconds (remote connection) to microseconds (direct data center connection). Exchanges like NYSE, NASDAQ, and CME all offer co-location services — often at significant cost ($10,000–$100,000+ per month per rack. This latency advantage is core to many HFT strategies including latency arbitrage and electronic market making. The SEC has studied co-location extensively and concluded it is legal (it is equally available to all firms willing to pay). However, critics argue it creates a two-tiered market structure.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A portfolio manager wants to buy 500,000 shares of a stock with an Average Daily Volume (ADV) of 2,000,000 shares. The stock's daily volatility is 1.5%. Using the square root market impact model (impact = σ × √(Q/ADV)), estimate the expected market impact.",
          question:
            "Approximately what is the expected market impact of this order?",
          options: [
            "Approximately 0.75% (1.5% × √(500,000/2,000,000) = 1.5% × 0.5)",
            "Approximately 1.5% — market impact equals the stock's daily volatility",
            "Approximately 3.0% — market impact doubles for large orders",
            "Approximately 0.19% — the order is only 25% of ADV so impact is minimal",
          ],
          correctIndex: 0,
          explanation:
            "Using the square root model: impact = σ × √(Q/ADV) = 1.5% × √(500,000 / 2,000,000) = 1.5% × √0.25 = 1.5% × 0.5 = 0.75%. This means buying 500,000 shares (25% of ADV in a single day) will move the price approximately 0.75% against you on average. On a $30 stock with 500,000 shares, that is $30 × 0.0075 × 500,000 = $112,500 in market impact costs. The optimal response is to spread the execution over 2–3 days using VWAP scheduling, reducing daily participation to 8–12% of ADV and cutting impact substantially.",
          difficulty: 3,
        },
      ],
    },
  ],
};
