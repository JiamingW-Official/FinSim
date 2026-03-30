import type { Unit } from "./types";

export const UNIT_SYSTEMATIC_TRADING: Unit = {
 id: "systematic-trading",
 title: "Systematic Trading",
 description:
 "Master rule-based trading systems, algorithmic execution, quantitative risk management, and the full pipeline from strategy idea to live deployment",
 icon: "Bot",
 color: "#6366f1",
 lessons: [
 // Lesson 1: Systematic vs Discretionary 
 {
 id: "systematic-trading-1",
 title: "Systematic vs Discretionary Trading",
 description:
 "Rule-based trading, backtesting methodology, overfitting pitfalls, out-of-sample testing, and walk-forward analysis",
 icon: "SlidersHorizontal",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Rule-Based vs Discretionary Decision Making",
 content:
 "Trading approaches fall on a spectrum from fully **discretionary** to fully **systematic**.\n\n**Discretionary trading**: A human makes every decision — when to enter, what size, when to exit — based on judgment, experience, and qualitative assessment. Skilled discretionary traders adapt quickly to unusual market conditions but are subject to cognitive biases, inconsistency, and emotional interference.\n\n**Systematic trading**: A computer executes predefined rules without human intervention. Every entry, exit, and sizing decision follows an algorithm. Examples: trend-following CTAs, statistical arbitrage desks, high-frequency market makers.\n\n**Key advantages of systematic approaches**:\n- **Consistency**: the same rule is applied every time, removing emotional override\n- **Speed**: computers react in microseconds; humans take seconds\n- **Scalability**: one model can trade hundreds of instruments simultaneously\n- **Testability**: rules can be backtested on historical data before risking capital\n\n**Key disadvantages**:\n- **Brittleness**: rules that worked in one regime may fail in another\n- **Overfitting risk**: models can be optimized to historical noise rather than signal\n- **Black-box risk**: complex systems can fail in unexpected, hard-to-diagnose ways\n\n**Hybrid approaches** are common: systematic signal generation with discretionary position sizing or risk override. Many top hedge funds (Bridgewater, Two Sigma, D.E. Shaw) blend both.",
 highlight: [
 "discretionary trading",
 "systematic trading",
 "cognitive biases",
 "consistency",
 "scalability",
 "testability",
 "overfitting risk",
 "black-box risk",
 ],
 },
 {
 type: "teach",
 title: "Backtesting Methodology",
 content:
 "**Backtesting** simulates how a strategy would have performed on historical data. Done correctly, it is the most powerful tool in strategy development. Done poorly, it produces dangerously misleading results.\n\n**Core backtesting steps**:\n1. **Define rules precisely** — entry conditions, exit conditions, position sizing, universe of instruments\n2. **Collect clean data** — adjusted prices (for splits and dividends), survivor-bias-free universes\n3. **Simulate execution** — model realistic fills, commissions, slippage\n4. **Evaluate metrics** — annualized return, Sharpe ratio, max drawdown, Calmar ratio\n\n**Critical data hygiene rules**:\n- **Survivorship bias**: using only currently-listed stocks excludes delisted and bankrupt companies, inflating backtest returns. Always use a point-in-time database.\n- **Look-ahead bias**: never use information that was not available at the time of the signal. Common mistake: using adjusted closing prices to generate signals from raw prices.\n- **Adjusted prices**: when backtesting on total return, use split- and dividend-adjusted price series.\n\n**Key performance metrics**:\n- **Sharpe ratio** = (mean return risk-free rate) / σ; target 1.0 out-of-sample\n- **Calmar ratio** = annualized return / max drawdown; measures return per unit of drawdown risk\n- **Win rate × Payoff ratio > 1** for positive expectancy",
 highlight: [
 "backtesting",
 "survivorship bias",
 "look-ahead bias",
 "adjusted prices",
 "Sharpe ratio",
 "Calmar ratio",
 "max drawdown",
 "point-in-time database",
 ],
 },
 {
 type: "teach",
 title: "Overfitting, Out-of-Sample Testing, and Walk-Forward Analysis",
 content:
 "The single biggest danger in systematic strategy development is **overfitting**: a model that fits historical noise perfectly but has zero predictive power going forward.\n\n**Signs of overfitting**:\n- Strategy needs many parameters to work\n- Performance degrades sharply when any parameter is changed slightly\n- Sharpe ratio above 3.0 in-sample (real strategies rarely exceed 2.0 live)\n- Strategy trades very infrequently — high Sharpe on few trades is statistically unreliable\n\n**Train/Test split**:\nDivide your data into in-sample (training) and out-of-sample (test) periods. Develop and optimize the strategy on training data only. Then run the strategy on the test period without any further changes. If performance collapses out-of-sample, the strategy was overfit.\n\n**Walk-forward analysis (WFA)** is more robust:\n1. Optimize parameters on the first N months (training window)\n2. Trade the strategy out-of-sample for the next M months (test window)\n3. Slide the window forward by M months, re-optimize, trade the next M months\n4. Stitch together all out-of-sample periods to form the 'true' backtest\n\nWFA tests whether the optimization process itself is robust, not just the parameters.\n\n**Rule of thumb**: a strategy needs at least 100 independent trades out-of-sample to draw statistically meaningful conclusions. Fewer than 30 trades is anecdotal.",
 highlight: [
 "overfitting",
 "out-of-sample",
 "walk-forward analysis",
 "in-sample",
 "train/test split",
 "Sharpe ratio",
 "100 independent trades",
 "statistically meaningful",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A backtest shows a Sharpe ratio of 4.2 in-sample with 15 trades over 3 years. What is the most likely explanation?",
 options: [
 "The strategy is genuinely exceptional and should be deployed immediately",
 "The high Sharpe is likely due to overfitting — too few trades to be statistically reliable",
 "The strategy uses too many instruments and needs to be simplified",
 "The data quality is too high, introducing look-ahead bias",
 ],
 correctIndex: 1,
 explanation:
 "15 trades over 3 years is far too few to validate a 4.2 Sharpe. With such a small sample, a few lucky trades can produce any Sharpe ratio. Robust strategies require 100+ out-of-sample trades. A live Sharpe above 2.0 is exceptional for any strategy.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Using a database of currently-listed S&P 500 stocks to backtest a stock-picking strategy going back 10 years produces an accurate estimate of live performance.",
 correct: false,
 explanation:
 "This introduces survivorship bias. Stocks that were delisted, went bankrupt, or were removed from the index during those 10 years are excluded, which inflates backtest returns. A point-in-time database that includes all stocks that existed at each historical date is required for valid backtesting.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Trend Following Systems 
 {
 id: "systematic-trading-2",
 title: "Trend Following Systems",
 description:
 "Moving average crossovers, Donchian channels, ATR-based position sizing, and diversification across markets",
 icon: "TrendingUp",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The Philosophy and Evidence for Trend Following",
 content:
 "**Trend following** is the oldest and most empirically validated systematic strategy. The core idea: assets that have been moving in one direction tend to continue moving in that direction for a period of time.\n\n**Why trends exist**:\n- **Behavioral anchoring**: investors are slow to update beliefs when fundamentals change\n- **Gradual information diffusion**: not all market participants receive and process information simultaneously\n- **Momentum in capital flows**: institutional investors deploy large positions over months, sustaining price movement\n- **Under-reaction then over-reaction**: price adjusts slowly at first, then overshoots — creating exploitable trends\n\n**Historical evidence**: Trend following has delivered positive risk-adjusted returns across equities, fixed income, commodities, and currencies over multi-decade periods. The strategy underperforms in choppy, mean-reverting regimes but has historically delivered strong crisis alpha during large dislocations (2008, 2020).\n\n**Asset class diversification is critical**: no single market trends reliably at all times. Managed futures CTAs (commodity trading advisors) trade 50–200 liquid futures markets simultaneously — when equity trend signals fail, commodity or FX trends may be working. Diversification across uncorrelated trend signals greatly improves consistency.",
 highlight: [
 "trend following",
 "behavioral anchoring",
 "momentum",
 "crisis alpha",
 "managed futures",
 "CTAs",
 "diversification",
 "uncorrelated",
 ],
 },
 {
 type: "teach",
 title: "Moving Average Crossovers and Donchian Channels",
 content:
 "Two classic systematic trend entry signals:\n\n**Moving Average Crossover**:\nBuy when a fast MA crosses above a slow MA; sell/short when it crosses below.\n- Common parameters: 10/50-day, 20/100-day, 50/200-day (the 'golden cross / death cross')\n- Simple MA (SMA) vs Exponential MA (EMA): EMA weights recent data more, reacts faster but generates more noise\n- **MACD** (Moving Average Convergence Divergence) formalizes this: 12-26 day EMA difference with a 9-day signal line\n\n**Donchian Channel Breakout** (Richard Donchian, 1960s):\nBuy when price breaks above the **N-day high**; sell when price breaks below the **N-day low**.\n- Classic Turtle Traders used 20-day and 55-day Donchian channels\n- Entry at breakout; exit if price retreats to opposite channel\n- Captures the beginning of a trend without requiring a lagging average\n\n**Comparing the two**:\n| Feature | MA Crossover | Donchian Breakout |\n|---|---|---|\n| Entry timing | Lagged (waits for averages to cross) | Immediate (price hits new extreme) |\n| False signals in range | Many crossovers | Fewer breakouts |\n| Trend capture | Misses first portion | Enters closer to start |\n\nBoth work best in **trending markets** and should be combined with a **trend filter** (e.g., only trade long if 200-day MA is rising) to reduce losses in choppy conditions.",
 highlight: [
 "moving average crossover",
 "Donchian channel",
 "golden cross",
 "death cross",
 "MACD",
 "Turtle Traders",
 "N-day high",
 "trend filter",
 ],
 },
 {
 type: "teach",
 title: "ATR-Based Position Sizing and Market Diversification",
 content:
 "Even a perfect entry signal is worthless without correct **position sizing**. In systematic trend following, position size is almost always based on **volatility normalization** using the **Average True Range (ATR)**.\n\n**ATR position sizing**:\nTarget risk per trade = fixed dollar amount (e.g., 1% of equity)\nPosition size = Target risk / (ATR × multiplier)\n\nExample: $100,000 account, 1% risk = $1,000. ATR = $2.50, multiplier = 2 (stop placed 2×ATR away). Position size = $1,000 / ($2.50 × 2) = 200 shares.\n\n**Why ATR sizing works**:\n- Each position contributes roughly equal risk to the portfolio regardless of the asset's nominal price\n- Automatically reduces position size in volatile environments and increases it in calm ones\n- Used by virtually all professional CTAs (Winton, AHL, Millburn, Campbell)\n\n**Diversification across markets**:\nThe key principle: **volatility-adjusted position correlations**. Even if two futures markets are 0.5 correlated, if they both contribute equal volatility to the portfolio, their combined risk contribution is manageable.\n\nDiversify across:\n- **Asset classes**: equities, bonds, commodities, currencies, rates\n- **Geography**: US, Europe, Asia, EM\n- **Signal timescales**: 20-day, 60-day, 120-day lookbacks\n\nA well-diversified systematic trend portfolio holds 30–100 positions simultaneously, targeting similar risk contribution from each.",
 highlight: [
 "position sizing",
 "ATR",
 "volatility normalization",
 "1% risk",
 "equal risk contribution",
 "CTAs",
 "diversification",
 "volatility-adjusted",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A systematic trend follower uses ATR-based position sizing. If a stock's ATR doubles due to an earnings surprise, what happens to the next position size?",
 options: [
 "The position size doubles to capture the larger move",
 "The position size is cut in half to maintain the same dollar risk",
 "The position size stays the same because ATR is a lagging indicator",
 "The strategy exits the position entirely until volatility normalizes",
 ],
 correctIndex: 1,
 explanation:
 "ATR-based sizing keeps dollar risk per trade constant. If ATR doubles, the stop distance also doubles, so the position size is halved to maintain the same risk (e.g., 1% of equity). This automatically de-risks in volatile conditions, a key advantage of volatility-normalized sizing.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A trend-following system that only trades one market (e.g., only S&P 500 futures) is as robust as a diversified system trading 50 markets.",
 correct: false,
 explanation:
 "Single-market trend systems have much higher drawdowns and lower Sharpe ratios because there are long periods when that market is range-bound and the trend signal produces only losses. Diversifying across many uncorrelated markets means that when some trend signals fail, others succeed, smoothing the equity curve and improving risk-adjusted returns.",
 difficulty: 1,
 },
 ],
 },

 // Lesson 3: Mean Reversion Strategies 
 {
 id: "systematic-trading-3",
 title: "Mean Reversion Strategies",
 description:
 "RSI-based systems, Bollinger Band squeeze, pairs trading cointegration, and measuring the half-life of mean reversion",
 icon: "ArrowLeftRight",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "RSI-Based and Bollinger Band Mean Reversion",
 content:
 "**Mean reversion** exploits the tendency of prices to return to their historical average after an extreme move. It is the philosophical opposite of trend following.\n\n**RSI-based mean reversion**:\nThe classic entry: buy when RSI(2) or RSI(4) drops below 10 (extreme oversold); sell when it rises above 90 (extreme overbought). Larry Connors popularized short-term RSI reversion on equities.\n\nKey rules for RSI reversion systems:\n- **Trend filter**: only buy oversold signals when price is above its 200-day MA (mean revert within an uptrend, not a downtrend)\n- **Quick exits**: these systems hold 2–5 days on average; do not overstay\n- **Works best**: in low-volatility, range-bound markets on large-cap equities\n\n**Bollinger Band squeeze mean reversion**:\n- **Bollinger Bands**: ±2σ bands around a 20-day moving average\n- A **band squeeze** (bands narrowing) signals low volatility — often precedes a breakout or reversion\n- **Reversion trade**: when price touches the upper band with RSI > 70, fade (short) the move; target the middle band\n- **Breakout trade**: when price closes outside the bands after a squeeze, trade in the direction of the breakout\n\n**Regime dependency**: Mean reversion works well in equity index ETFs, interest rate instruments, and commodity spreads. It fails badly in trending individual stocks, especially small caps where single catalysts drive sustained directional moves.",
 highlight: [
 "mean reversion",
 "RSI",
 "extreme oversold",
 "Bollinger Bands",
 "band squeeze",
 "trend filter",
 "200-day MA",
 "regime dependency",
 ],
 },
 {
 type: "teach",
 title: "Pairs Trading and Cointegration",
 content:
 "**Pairs trading** is a market-neutral mean reversion strategy that trades the spread between two cointegrated securities.\n\n**Cointegration** (not just correlation): two price series are cointegrated if a linear combination of them is stationary — they share a long-run equilibrium that they revert to over time.\n\n**Testing for cointegration**:\n1. **Engle-Granger test**: regress log(P1) on log(P2) to find the hedge ratio β. Then test the residuals with an Augmented Dickey-Fuller (ADF) test for stationarity. ADF p-value < 0.05 suggests cointegration.\n2. **Johansen test**: preferred for multiple instruments simultaneously.\n\n**Constructing and trading the spread**:\nSpread = log(P1) β × log(P2)\n\n- Entry: when spread > +2σ, sell P1 / buy P2 (spread expected to fall)\n- Entry: when spread < 2σ, buy P1 / sell P2 (spread expected to rise)\n- Exit: when spread returns to 0 (the mean)\n- Stop loss: spread exceeds ±3.5σ (pair may have broken down)\n\n**Classic pairs**: Coca-Cola/PepsiCo, Goldman Sachs/Morgan Stanley, ExxonMobil/Chevron, GLD/SLV.\n\n**Practical risks**: pairs can break down if one company is acquired, changes its business, or faces asymmetric regulatory events. Always monitor both statistics and fundamentals.",
 highlight: [
 "pairs trading",
 "cointegration",
 "Engle-Granger test",
 "ADF",
 "hedge ratio",
 "stationary",
 "spread",
 "market-neutral",
 ],
 },
 {
 type: "teach",
 title: "Half-Life of Mean Reversion",
 content:
 "Not all mean-reverting processes are equally tradable. The **half-life of mean reversion** tells you how long it typically takes for a spread or price deviation to decay back to 50% of its original size — this determines whether a strategy is actually executable.\n\n**Ornstein-Uhlenbeck (OU) process** models mean reversion:\ndX = θ(μ X)dt + σdW\n\nwhere θ is the **mean-reversion speed**. Half-life = ln(2) / θ.\n\n**Estimating θ empirically**:\nRegress ΔX(t) on X(t1):\nΔX(t) = a + b × X(t1) + ε\n\nθ = b (slope coefficient). Half-life = ln(2) / b.\n\n**Practical interpretation**:\n- **Half-life < 2 days**: excellent for mean reversion, but requires fast execution (market impact may be severe)\n- **Half-life 5–20 days**: the sweet spot for most institutional mean reversion strategies\n- **Half-life 30–90 days**: requires patient capital; larger drawdowns\n- **Half-life > 90 days**: not practically mean-reverting; process may be a random walk or trending\n\n**Position sizing vs half-life**: shorter half-life smaller positions (less time for losses to compound), quicker exit triggers. Longer half-life larger positions acceptable, but wider stops needed to avoid premature stop-outs before reversion occurs.\n\n**Practical rule**: trade mean reversion only when the spread half-life is shorter than your strategy's maximum holding period.",
 highlight: [
 "half-life",
 "mean-reversion speed",
 "Ornstein-Uhlenbeck",
 "θ",
 "random walk",
 "holding period",
 "empirically",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A pairs spread has an estimated half-life of 4 days. Your strategy's maximum holding period is 10 days. What is the most appropriate conclusion?",
 options: [
 "The spread is not mean-reverting and should not be traded",
 "The half-life is within the holding period, making this a tradable mean reversion opportunity",
 "The half-life is too short; transaction costs will eliminate all edge",
 "The strategy needs to be extended to a 90-day holding period to allow full reversion",
 ],
 correctIndex: 1,
 explanation:
 "A 4-day half-life is well within a 10-day holding period, meaning the spread will typically revert most of the way back to its mean before the position must be closed. This is the sweet spot for mean reversion trading — long enough to be tradable but short enough to be practically profitable.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Two stocks with 90% price correlation over the past year are guaranteed to be cointegrated and therefore suitable for pairs trading.",
 correct: false,
 explanation:
 "High correlation does not imply cointegration. Two trending stocks can be highly correlated while their prices diverge permanently — this is spurious correlation. Cointegration requires a formal statistical test (Engle-Granger or Johansen) confirming that the spread between them is stationary, meaning it reliably reverts to a long-run mean.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Execution Algorithms 
 {
 id: "systematic-trading-4",
 title: "Execution Algorithms",
 description:
 "TWAP, VWAP, implementation shortfall, arrival price, adaptive algorithms, and market impact models",
 icon: "Zap",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Why Execution Algorithms Matter",
 content:
 "Generating an alpha signal is only half the problem in systematic trading. **Execution** — how you actually get into and out of positions — can consume a large fraction of your theoretical alpha through **market impact** and **slippage**.\n\n**Market impact**: when you trade, you move the price against yourself. Buying demand pushes prices up; selling pressure pushes them down. A $10M buy order in a stock with $5M average daily volume will move the price significantly.\n\n**Implementation shortfall** = the gap between the theoretical paper portfolio return and the actual live return, primarily caused by:\n- **Delay cost**: price moves between signal generation and order submission\n- **Impact cost**: price moves caused by your own order execution\n- **Opportunity cost**: trades not executed because limits were not hit\n- **Commissions and fees**\n\n**Why algorithms beat manual execution**:\n- Break large orders into small child orders to minimize market impact\n- Time executions to align with natural market liquidity\n- Adapt to intraday liquidity patterns\n- Execute across multiple venues simultaneously (dark pools, lit exchanges)\n\nFor large institutions, a 0.1% improvement in average execution quality on $10B of annual turnover = $10M in extra returns. Execution is serious competitive infrastructure.",
 highlight: [
 "market impact",
 "implementation shortfall",
 "slippage",
 "delay cost",
 "impact cost",
 "opportunity cost",
 "child orders",
 "dark pools",
 ],
 },
 {
 type: "teach",
 title: "TWAP, VWAP, and Arrival Price Algorithms",
 content:
 "The most widely used execution algorithms:\n\n**TWAP (Time-Weighted Average Price)**:\nSplit the order evenly across N equal time intervals throughout the trading window (e.g., 100 slices over 100 minutes).\n- Simple and predictable\n- Benchmark: the average price over the execution window\n- Best for: illiquid stocks where you do not want to reveal yourself by following volume patterns\n- Weakness: ignores actual market volume — you may execute large slices at low-volume times\n\n**VWAP (Volume-Weighted Average Price)**:\nExecute at the same rate as market volume throughout the day. More volume in the morning and before close larger order slices then.\n- Benchmark: the market's VWAP for the day\n- Best for: liquid stocks where you want to blend into natural volume flow\n- Uses historical intraday volume profiles to predict when volume will be highest\n- Most common benchmark for institutional equity execution\n\n**Arrival Price (Implementation Shortfall) algorithm**:\nMinimize the gap between the **arrival price** (price at signal time) and the average execution price. It front-loads execution — trades faster at first when the price is close to the signal, then slows down.\n- Best when: signal is time-sensitive and you want to minimize delay cost\n- Higher market impact than VWAP/TWAP due to front-loading\n- Preferred by: stat arb and high-frequency strategies where signals decay quickly\n\n**Rule of thumb**: for slow, low-turnover strategies VWAP or TWAP. For high-alpha, fast-decaying signals Arrival Price.",
 highlight: [
 "TWAP",
 "VWAP",
 "arrival price",
 "implementation shortfall",
 "volume profile",
 "front-loads",
 "signal decay",
 "benchmark",
 ],
 },
 {
 type: "teach",
 title: "Adaptive Algorithms and Market Impact Models",
 content:
 "Modern execution algorithms are **adaptive** — they adjust in real time based on market conditions rather than following a fixed schedule.\n\n**Adaptive VWAP**: monitors real-time volume and adjusts the execution pace dynamically. If the market is unusually active, it accelerates; if volume dries up, it slows down to avoid excessive impact.\n\n**Liquidity-seeking algorithms**: scan multiple venues (exchanges, ECNs, dark pools) for available liquidity and execute where spreads are tightest and depth is greatest. Some algorithms time execution to coincide with large institutional orders in dark pools ('information leakage risk').\n\n**Market impact models**:\nThe **square-root model** is widely used:\nImpact σ × (Q / V)\n\nwhere σ = daily volatility, Q = order size, V = average daily volume (ADV).\n\nExample: if σ = 1%, ADV = $1M, and order = $250K (25% ADV), impact 1% × 0.25 = 0.5%.\n\n**Practical trading guidelines from impact models**:\n- Keep order size below **10–15% of ADV** to limit impact to a few basis points\n- Spread large orders over **multiple days** if order > 20% ADV\n- Use **limit orders** and passive execution when the signal has a long shelf life\n- **Aggressive (market orders)** only when signal decay justifies the higher impact cost\n\n**Algorithmic trading systems** combine signal strength, remaining signal shelf life, current market liquidity, and real-time spread/depth data to continuously optimize the execution schedule.",
 highlight: [
 "adaptive algorithms",
 "square-root model",
 "dark pools",
 "ADV",
 "market impact",
 "passive execution",
 "limit orders",
 "signal shelf life",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A systematic fund generates a short-lived alpha signal that decays within 30 minutes. Which execution algorithm is most appropriate?",
 options: [
 "TWAP spread over the full trading day to minimize market impact",
 "VWAP following the natural volume profile throughout the day",
 "Arrival Price algorithm that front-loads execution near the signal time",
 "Passive limit orders posted at the bid to minimize execution costs",
 ],
 correctIndex: 2,
 explanation:
 "For fast-decaying signals, implementation shortfall (arrival price) algorithms are best. They front-load execution to capture the alpha before the signal decays, accepting higher market impact in exchange for minimizing delay cost. TWAP/VWAP spread over hours would execute most of the order long after the alpha signal is gone.",
 difficulty: 3,
 },
 {
 type: "quiz-mc",
 question:
 "Using the square-root market impact model (Impact = σ × (Q/V)), what is the estimated impact for a $500K order in a stock with $2M ADV and 2% daily volatility?",
 options: ["0.25%", "0.50%", "1.00%", "2.00%"],
 correctIndex: 2,
 explanation:
 "Q/V = $500K / $2M = 0.25. 0.25 = 0.5. Impact = 2% × 0.5 = 1.0%. This order is 25% of ADV, which is quite large and generates significant impact. Spreading it over 2–3 days would reduce daily Q/V and lower impact substantially.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Risk Management in Systematic Trading 
 {
 id: "systematic-trading-5",
 title: "Risk Management in Systematic Trading",
 description:
 "Kelly criterion, fixed fractional sizing, volatility targeting, drawdown controls, and portfolio heat management",
 icon: "ShieldCheck",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Kelly Criterion and Fixed Fractional Sizing",
 content:
 "The two most important position sizing frameworks in systematic trading:\n\n**Kelly Criterion**:\nOptimal fraction to bet = Edge / Odds = (bp q) / b\nwhere b = net odds, p = win probability, q = loss probability (1 p).\n\nFor continuous returns: Kelly fraction = μ / σ² (mean return divided by variance).\n\n**Kelly maximizes long-run geometric growth** but is aggressive. A Kelly bet produces the maximum drawdown tolerable — roughly equal to the Kelly fraction squared as a fraction of capital.\n\n**Why traders use fractional Kelly**:\n- Full Kelly implies 100% positions when edge is high, which is psychologically intolerable and practically risky if edge estimates are wrong\n- **Half-Kelly** (50% of full Kelly) achieves ~75% of the growth rate with ~50% of the variance — much smoother equity curve\n- Most professionals use 25–50% of Kelly\n\n**Fixed fractional sizing**:\nRisk a fixed percentage of equity on every trade (e.g., 1% or 2%). Position size = (account equity × risk %) / (entry stop price).\n\nAdvantages: simple, automatically compounds as account grows, prevents catastrophic ruin.\nDisadvantages: uses a flat risk percentage regardless of signal quality or market conditions.\n\n**Combining Kelly + fixed fractional**: size positions proportionally to signal conviction (Kelly-inspired) but cap position at a maximum fraction of equity (fixed fractional ceiling). This captures Kelly's growth optimization while preventing oversizing.",
 highlight: [
 "Kelly criterion",
 "fixed fractional",
 "half-Kelly",
 "geometric growth",
 "edge",
 "position sizing",
 "signal conviction",
 "maximum drawdown",
 ],
 },
 {
 type: "teach",
 title: "Volatility Targeting",
 content:
 "**Volatility targeting** is the dominant risk management approach among professional systematic funds. The goal: maintain a constant target volatility for the portfolio regardless of market conditions.\n\n**Mechanism**:\n- Target annualized portfolio volatility = T% (e.g., 10% or 15%)\n- Measure realized portfolio volatility continuously (e.g., 20-day or 60-day rolling window)\n- Scale total position sizes up or down to hit the target\n\nScale factor = Target volatility / Realized volatility\n\n**Example**: target 10% annualized vol. Current realized vol = 15%. Scale factor = 10/15 = 0.67. Reduce all positions to 67% of their normal size.\n\n**Why volatility targeting works**:\n- Prevents over-leveraging during periods of low measured volatility (when actual risk is often rising)\n- Automatically deleverages during crises when volatility spikes — reduces drawdowns\n- Produces more consistent Sharpe ratios across market regimes\n- Allows investors to plan around predictable risk levels\n\n**Volatility targeting + leverage**:\nMost systematic funds use leverage to reach their target volatility. A diversified futures portfolio may have 5% natural volatility; a 10% target requires 2× leverage. Risk budgeting allocates this leverage across strategy types and asset classes.\n\n**Risk parity** (used by Bridgewater, AQR) extends this: allocate to asset classes such that each contributes equal risk to the portfolio, not equal dollar weight.",
 highlight: [
 "volatility targeting",
 "target volatility",
 "scale factor",
 "realized volatility",
 "leverage",
 "risk parity",
 "deleverages",
 "risk budgeting",
 ],
 },
 {
 type: "teach",
 title: "Drawdown Controls and Portfolio Heat",
 content:
 "Even the best systematic strategies experience significant drawdowns. Robust risk management systems have multiple layers of drawdown control.\n\n**Maximum drawdown (MDD)** = largest peak-to-trough decline in portfolio value. A 30% MDD requires a 43% recovery just to get back to even. MDD compounds psychologically — investors redeem at the worst time.\n\n**Drawdown circuit breakers**:\n- **Hard stop**: if portfolio drops X% from peak (e.g., 15%), reduce all positions by 50% or go to cash\n- **Soft stop**: if portfolio drops Y% (e.g., 10%), reduce leverage by 25% and re-evaluate\n- **Recovery rule**: do not return to full leverage until portfolio recovers to a specified level\n\nThe rationale: a strategy in drawdown may be experiencing a normal bad run, or it may have broken down permanently. Reducing exposure limits losses while you determine which is the case.\n\n**Portfolio heat** = total risk currently deployed = sum of all open position risks as a fraction of equity.\n\nExample: 10 positions each risking 1% = 10% portfolio heat. Most systematic traders cap heat at 15–25%.\n\n**Correlation-adjusted heat**:\nIf positions are correlated, their combined risk is higher than the sum of individual risks. During market stress, correlations spike to 1 — all uncorrelated positions suddenly move together. Adjust heat calculation: heat_adjusted = Σ(position risks) × average_correlation.\n\n**Volatility budget**: allocate risk budget across strategy types (trend, mean reversion, carry) so no single strategy type can dominate losses.",
 highlight: [
 "maximum drawdown",
 "circuit breakers",
 "portfolio heat",
 "correlation-adjusted",
 "soft stop",
 "hard stop",
 "volatility budget",
 "recover",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A volatility-targeting portfolio has a 12% realized volatility against a 10% target. What is the correct adjustment?",
 options: [
 "Increase all position sizes by 20% to generate higher returns",
 "Scale all positions to 83% of their current size (10/12 scale factor)",
 "Add more uncorrelated strategies to dilute volatility passively",
 "Switch from trend following to mean reversion to reduce portfolio volatility",
 ],
 correctIndex: 1,
 explanation:
 "The scale factor = Target vol / Realized vol = 10% / 12% 0.83. All positions should be reduced to 83% of their current size to bring realized volatility back to the 10% target. This is the mechanical application of volatility targeting — automatic deleveraging when vol exceeds target.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Full Kelly position sizing is recommended for professional systematic traders because it maximizes long-run wealth growth.",
 correct: false,
 explanation:
 "While Kelly maximizes geometric growth in theory, full Kelly produces enormous drawdowns and requires perfect edge estimation. In practice, professional traders use 25–50% of Kelly (fractional Kelly), which achieves most of the growth benefit with much lower volatility and drawdown. Overestimating edge with full Kelly can lead to ruin.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 6: Building a Trading System 
 {
 id: "systematic-trading-6",
 title: "Building a Trading System",
 description:
 "Idea generation, strategy development, backtesting framework, live deployment, and ongoing monitoring",
 icon: "Wrench",
 xpReward: 100,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Idea Generation and Strategy Development",
 content:
 "Successful systematic trading starts with a **structural edge** — a reason, grounded in market microstructure or behavioral finance, why the strategy should work prospectively.\n\n**Sources of legitimate edge**:\n- **Risk premium**: earning compensation for bearing risk others want to avoid (e.g., selling volatility, providing liquidity)\n- **Behavioral mispricing**: exploiting systematic cognitive biases (anchoring, loss aversion, herding)\n- **Information processing advantage**: combining public data in non-obvious ways faster than other participants\n- **Structural market features**: roll yield in commodity futures, index rebalancing flows, options expiry effects\n\n**Idea generation best practices**:\n1. Start with the economics — why should this work? Write it down.\n2. Keep the strategy simple. Complex rules usually indicate overfitting.\n3. Prefer **parametrically robust** ideas: the strategy should work across a range of parameter values, not just one specific setting\n4. Look for strategies with **crisis alpha** or low correlation to traditional factors\n5. Read academic literature (Journal of Finance, Review of Financial Studies) for documented anomalies\n\n**Idea screening criteria** before spending weeks coding:\n- Is the market liquid enough? (can I actually trade the size I need?)\n- Are there natural opposing participants? (who is on the other side of this trade, and why are they doing it?)\n- Is the holding period consistent with my transaction cost structure?\n- Has the anomaly been documented in academic literature? (publication crowding risk)",
 highlight: [
 "structural edge",
 "risk premium",
 "behavioral mispricing",
 "parametrically robust",
 "crisis alpha",
 "crowding risk",
 "transaction cost",
 "liquidity",
 ],
 },
 {
 type: "teach",
 title: "Backtesting Framework and Validation",
 content:
 "A rigorous backtesting framework is the foundation of any systematic strategy. Key components:\n\n**Data infrastructure**:\n- Point-in-time (survivor-bias-free) price and fundamental data\n- Corporate action adjustments (splits, dividends, mergers)\n- Clean handling of delistings and bankruptcies\n- Accurate transaction cost modeling (commissions, spread, market impact, borrow costs for shorts)\n\n**Backtest validation pipeline**:\n1. **In-sample development**: optimize strategy parameters on 50–60% of data\n2. **Out-of-sample test**: evaluate on next 20–25% of data without further adjustment\n3. **Walk-forward test**: re-run WFA to validate parameter stability\n4. **Stress test**: evaluate on major crisis periods (2000–02, 2008–09, 2020 COVID) separately\n5. **Sensitivity analysis**: test how performance changes as parameters vary ±20%\n\n**Statistical significance tests**:\n- **t-test on returns**: is mean return significantly different from zero?\n- **Deflated Sharpe Ratio** (Lopez de Prado): adjusts for the number of strategies tried. If you test 50 strategies and keep the best one, the Sharpe needs to be much higher to be statistically meaningful.\n- **Bootstrap permutation test**: randomly shuffle signal labels to estimate the probability of achieving the observed backtest performance by chance\n\n**Red flags that indicate overfitting**:\n- Performance heavily concentrated in a few exceptional years\n- Strategy only works with very specific parameter values\n- Out-of-sample Sharpe drops by more than 50% vs in-sample",
 highlight: [
 "point-in-time data",
 "walk-forward",
 "stress test",
 "sensitivity analysis",
 "deflated Sharpe ratio",
 "bootstrap permutation",
 "overfitting",
 "out-of-sample",
 ],
 },
 {
 type: "teach",
 title: "Live Deployment and Ongoing Monitoring",
 content:
 "Transitioning from backtest to live trading is where most strategies encounter unexpected friction.\n\n**Paper trading / forward testing**:\nRun the strategy in simulation mode on live market data for 1–3 months before committing capital. This catches implementation bugs, data feed issues, and order routing problems. Compare paper performance to backtest expectations — divergence reveals problems.\n\n**Staged capital deployment**:\n- Start at 10–25% of target capital\n- Scale up only after 2–3 months of consistent live performance matching expectations\n- Never go directly from backtest to full capital\n\n**Live monitoring metrics** (check daily):\n- Signal generation: is the strategy producing signals at the expected frequency?\n- Execution quality: is realized execution matching VWAP benchmarks?\n- P&L vs expectation: is daily/weekly P&L within 2σ of backtest expectations?\n- Drawdown tracking: how far from peak? Compare to historical max drawdown.\n\n**Strategy decay monitoring**:\nSystematic strategies decay as more capital finds the edge and competition increases. Monitor rolling 3-month and 12-month Sharpe ratios. If Sharpe declines steadily for 6+ months:\n1. Reduce position size / leverage\n2. Investigate whether market regime has changed\n3. Research whether academic publication or crowding has eliminated the edge\n\n**Shutdown criteria** (defined in advance):\n- Drawdown exceeds 2× historical max drawdown\n- Rolling 6-month Sharpe falls below 0\n- Signal frequency drops by 50% (regime change)\n- Live returns are < 3σ of backtest expectations for 2 consecutive months",
 highlight: [
 "paper trading",
 "forward testing",
 "staged deployment",
 "live monitoring",
 "strategy decay",
 "Sharpe ratio",
 "shutdown criteria",
 "drawdown",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A newly backtested strategy has a 2.1 in-sample Sharpe ratio but only a 0.4 out-of-sample Sharpe ratio. What is the most appropriate next step?",
 options: [
 "Deploy the strategy at full capital — a 0.4 Sharpe is still positive",
 "Investigate for overfitting; the 80% Sharpe collapse suggests the strategy was fit to noise",
 "Extend the in-sample period to improve parameter optimization",
 "Reduce position sizes by 50% and deploy — lower risk will improve the live Sharpe",
 ],
 correctIndex: 1,
 explanation:
 "An 80% collapse in Sharpe from in-sample to out-of-sample is a strong sign of overfitting. A robust strategy should retain 60–80% of its in-sample Sharpe out-of-sample. Deploying with a 0.4 Sharpe after this collapse is not advisable — after transaction costs and typical live slippage, returns would likely be negative. Rethink the strategy structure.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A systematic trend-following fund has been running live for 8 months. Its historical max drawdown in backtesting was 12%. It is now in a 22% drawdown — nearly double the historical max — and the rolling 6-month Sharpe has turned negative.",
 question:
 "Based on the pre-defined shutdown criteria, what is the appropriate response?",
 options: [
 "Hold current positions; trend following always recovers eventually",
 "Double position sizes to accelerate recovery when the trend returns",
 "Reduce leverage immediately and begin the shutdown evaluation process — drawdown exceeds 2× historical max",
 "Wait another 3 months before acting to confirm the drawdown is real",
 ],
 correctIndex: 2,
 explanation:
 "A 22% drawdown on a strategy with a 12% historical max (nearly 2× the historical max) combined with a negative rolling Sharpe triggers the shutdown criteria. The responsible action is immediate leverage reduction and systematic investigation — this level of drawdown suggests either a permanent regime change or a strategy breakdown, not a recoverable normal drawdown.",
 difficulty: 3,
 },
 ],
 },
 ],
};
