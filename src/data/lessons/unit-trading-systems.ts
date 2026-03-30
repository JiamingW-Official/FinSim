import type { Unit } from "./types";

export const UNIT_TRADING_SYSTEMS: Unit = {
 id: "trading-systems",
 title: "Trading Systems",
 description:
 "Master systematic vs discretionary trading, order execution algorithms, backtesting best practices, and adaptive systems",
 icon: "Settings",
 color: "#f97316",
 lessons: [
 // Lesson 1: Systematic vs Discretionary Trading 
 {
 id: "trading-systems-1",
 title: "Systematic vs Discretionary Trading",
 description:
 "Advantages of systematic approaches, trend-following legends, and mean-reversion strategies",
 icon: "Cpu",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Systematic Trading Advantages and Disadvantages",
 content:
 "**Systematic trading** executes predefined rules mechanically — no human judgment at the point of trade.\n\n**Advantages**:\n- **Removes emotion**: no panic selling during drawdowns, no overconfidence after wins; rules execute identically in every market condition\n- **Consistent position sizing**: every trade is sized according to the same formula, preventing the human tendency to over-bet on high-conviction ideas\n- **Backtestable**: historical performance can be measured precisely, giving a statistical foundation before risking capital\n- **Scalable**: one system can monitor and trade hundreds of instruments simultaneously — impossible for a discretionary trader\n\n**Disadvantages**:\n- **No judgment for unprecedented events**: a system trained on 30 years of data has never seen a global pandemic or a central bank pegging rates at zero for a decade; it may behave catastrophically in truly novel environments\n- **Overfitting risk**: complex models may fit historical noise rather than genuine signal — the strategy looks brilliant in backtest and fails in live trading\n- **Execution vs backtested assumptions**: backtests assume fills at close or mid-price; live trading faces slippage, partial fills, and market impact that can erode 30–50% of gross alpha\n\n**Key insight**: systematic does not mean mechanical and dumb. The best quant funds (Renaissance, Two Sigma, D.E. Shaw) combine rigorous statistical models with deep human insight in the research phase.",
 highlight: [
 "systematic trading",
 "removes emotion",
 "consistent position sizing",
 "backtestable",
 "scalable",
 "overfitting risk",
 "execution vs backtested assumptions",
 "Renaissance",
 "Two Sigma",
 "D.E. Shaw",
 ],
 },
 {
 type: "teach",
 title: "Trend-Following Systems",
 content:
 "**Trend following** is the oldest and most studied systematic strategy — buy what is going up, sell what is going down, and hold until the trend ends.\n\n**Famous trend-following funds**:\n- **AHL Diversified** (Man Group): one of the largest managed futures funds; pure price signals across 200+ markets\n- **Winton Group**: founded by David Harding; runs statistical trend-following at $20B+ AUM\n- **Millburn Ridgefield**: 50+ year track record of systematic trend following across commodities and financials\n\n**Key characteristics**:\n- Uses only **price-based signals** — no fundamental data, no earnings estimates, no analyst opinions\n- Works across **multiple asset classes**: equities, FX, commodities, fixed income — diversification across uncorrelated trends\n- Research shows trend-following strategies experience **~30% drawdown periods** on average, sometimes lasting 2–3 years\n- Despite drawdowns, long-run **Sharpe ratios of 0.5–1.0** are achievable after fees\n\n**Crisis alpha**:\nTrend followers famously profit during market crises because assets trend hard in one direction. In **2008**, managed futures indices gained +18% while global equities lost 40%. In **2022**, trend followers gained 20–40% while bonds and equities both fell — one of the few strategies with positive returns that year.\n\n**Why it works**: markets trend because of behavioral anchoring (investors slow to update beliefs), momentum in fundamental data (earnings revisions), and forced institutional repositioning.",
 highlight: [
 "trend following",
 "AHL Diversified",
 "Man Group",
 "Winton",
 "Millburn",
 "price-based signals",
 "multiple asset classes",
 "30% drawdown",
 "crisis alpha",
 "2008",
 "2022",
 ],
 },
 {
 type: "teach",
 title: "Mean-Reversion Systems",
 content:
 "**Mean-reversion** strategies bet that prices will return to a long-run average after deviating — the opposite of trend following.\n\n**Key mean-reversion strategies**:\n- **Statistical arbitrage (stat arb)**: pairs trading — exploit temporary divergence between cointegrated securities; holding period hours to days\n- **ETF arbitrage**: ETF prices briefly deviate from their net asset value (NAV); authorized participants arbitrage the gap, typically within minutes\n- **Fixed income relative value**: trade the spread between related bonds (on-the-run vs off-the-run Treasuries, swap spreads); LTCM's core strategy until 1998\n\n**Operational characteristics**:\n- **Shorter holding periods**: hours to days, versus weeks to months for trend following\n- **More capacity constrained**: larger position sizes move the market, eliminating the mispricing — most stat arb funds cap AUM at $1–5B\n- **Crowding risk**: popular mean-reversion strategies face simultaneous unwinding; the **August 2007 quant quake** saw correlated stat arb books all unwind together\n\n**Renaissance Medallion as benchmark**:\nThe Medallion Fund (Renaissance Technologies, founded by Jim Simons) is the gold standard of systematic trading — **~66% CAGR pre-fee** from 1988 to 2018. It employs a vast range of signals including mean reversion, but the exact strategy remains proprietary. After fees of 5% management / 44% performance, investors still earned ~39% annually.",
 highlight: [
 "mean-reversion",
 "statistical arbitrage",
 "ETF arbitrage",
 "fixed income relative value",
 "LTCM",
 "capacity constrained",
 "crowding risk",
 "August 2007",
 "quant quake",
 "Renaissance Medallion",
 "66% CAGR",
 "Jim Simons",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "What was the approximate pre-fee CAGR of the Renaissance Medallion Fund from 1988 to 2018, making it the benchmark for systematic trading performance?",
 options: [
 "~25% CAGR — strong but achievable by top hedge funds",
 "~40% CAGR — excellent but explained by leverage alone",
 "~66% CAGR — extraordinary performance using complex quantitative models",
 "~15% CAGR — modest but consistent Sharpe ratio above 2.0",
 ],
 correctIndex: 2,
 explanation:
 "Renaissance Medallion achieved approximately 66% CAGR pre-fee from 1988 to 2018 — a level of performance unmatched by any other investment fund over a sustained period. This is widely regarded as proof that systematic quantitative models can extract consistent alpha from financial markets. Even after the fund's unusually high fees (5% management + 44% performance), investors earned approximately 39% annually. The strategy employs many signals across thousands of instruments but remains entirely proprietary.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Trend-following strategies tend to perform well during market crises, a property known as 'crisis alpha'.",
 correct: true,
 explanation:
 "TRUE. Trend-following strategies exhibit crisis alpha — they tend to generate positive returns during severe market dislocations. During the 2008 financial crisis, managed futures indices gained approximately +18% while global equities lost 40%. In 2022, trend followers gained 20–40% while both equities and bonds declined. This occurs because crises cause strong directional trends: assets fall hard and persistently, and trend followers short these falling markets. This negative correlation with equity crises makes trend following a valuable portfolio diversifier.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A fund manager runs a systematic trend-following strategy across 200 markets. In the backtest (2000–2020), the strategy shows a Sharpe ratio of 1.2 and maximum drawdown of 28%. In the first year of live trading (2021), the strategy shows a Sharpe of 0.4 and a drawdown of 22%. The manager is considering switching to a discretionary approach.",
 question:
 "Which explanation best accounts for the performance gap between backtest and live trading?",
 options: [
 "The strategy is clearly overfitted — backtests always overstate future performance due to look-ahead bias and transaction cost underestimation",
 "Trend following stopped working in 2021 — a discretionary trader would have outperformed by reading macro news",
 "A 2021 drawdown is expected because trend following underperforms in range-bound low-volatility markets; the backtest Sharpe overstates live Sharpe due to optimistic cost assumptions",
 "The manager made errors in implementation — systematic strategies should replicate backtest performance exactly in live trading",
 ],
 correctIndex: 2,
 explanation:
 "The performance gap has multiple legitimate explanations. Backtests often underestimate transaction costs (slippage, commissions, borrowing costs) and may show inflated Sharpe ratios due to optimization. 2021 was a year of range-bound equity markets with low volatility — exactly the environment where trend following underperforms. A Sharpe of 0.4 vs 1.2 in backtest is a common and expected degradation, not evidence of failure. Switching to discretionary trading based on one year of underperformance is a classic behavioral error — abandoning a proven strategy at precisely the wrong time.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Order Execution & Algorithms 
 {
 id: "trading-systems-2",
 title: "Order Execution & Algorithms",
 description:
 "Smart order routing, algorithmic execution strategies, and transaction cost analysis",
 icon: "Zap",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Order Types and Smart Routing",
 content:
 "Professional execution begins with selecting the right order type and routing strategy.\n\n**Core order types**:\n- **Market order**: immediate fill at best available price; guarantees execution, not price — dangerous in illiquid markets\n- **Limit order**: fill only at specified price or better; price certain but fill uncertain — can miss the trade entirely\n- **IOC (Immediate or Cancel)**: fill whatever quantity is available right now, cancel the rest — useful for accessing liquidity without leaving footprint\n- **FOK (Fill or Kill)**: fill the entire order immediately or cancel entirely — used when partial fills are unacceptable\n- **Pegged order**: price automatically adjusts to follow the NBBO (National Best Bid and Offer) — stays competitive without manual updates\n- **Hidden/Iceberg orders**: display only a fraction of total order size (e.g., show 100 shares, have 10,000 total); prevents information leakage about large order intent\n\n**Smart order routing (SOR)**:\nAutomatically routes order fragments across multiple venues (NYSE, NASDAQ, BATS, dark pools) to find the best available liquidity. SOR systems update routing decisions in microseconds as quotes change across venues.\n\n**VWAP scheduling**: pre-trade tool that calculates volume distribution throughout the day to pace order execution in proportion to historical volume patterns.\n\n**TWAP scheduling**: simpler time-based pacing — divide total order equally across time intervals regardless of volume distribution.",
 highlight: [
 "market order",
 "limit order",
 "IOC",
 "FOK",
 "pegged order",
 "iceberg orders",
 "smart order routing",
 "NBBO",
 "VWAP scheduling",
 "TWAP scheduling",
 ],
 },
 {
 type: "teach",
 title: "Algorithmic Execution Strategies",
 content:
 "**Execution algorithms** automate the process of working large orders to minimize market impact and cost.\n\n**VWAP (Volume-Weighted Average Price)**:\nThe algo slices the order proportionally to historical volume distribution — more shares during high-volume periods (open and close), fewer during quiet midday. Goal: execute at or below the day's VWAP. Best for: patient orders with low urgency where minimizing market impact is the priority.\n\n**TWAP (Time-Weighted Average Price)**:\nSimply divides the order equally across time intervals (e.g., every 5 minutes). Less sophisticated than VWAP but predictable. Best for: illiquid securities where volume patterns are unreliable.\n\n**Arrival Price (Implementation Shortfall)**:\nMinimizes the gap between execution price and the price at the moment the trading decision was made. Trades aggressively early (accepts more market impact) to avoid adverse price drift while the order is being worked. Best for: alpha-decaying signals where speed of execution matters.\n\n**POV (Percentage of Volume)**:\nThe algo participates at a fixed percentage of market volume (e.g., 10% of all trades). If market volume surges, the algo executes faster; if volume dries up, it slows down. Best for: large orders where moving the market would alert competitors.\n\n**IS (Implementation Shortfall)**:\nMinimizes total cost by explicitly trading off market impact (cost of trading fast) against timing risk (cost of price moving adversely while trading slowly). Uses real-time market conditions to dynamically adjust the execution schedule.",
 highlight: [
 "VWAP",
 "TWAP",
 "Arrival Price",
 "Implementation Shortfall",
 "POV",
 "market impact",
 "alpha-decaying signals",
 "timing risk",
 ],
 },
 {
 type: "teach",
 title: "Transaction Cost Analysis (TCA)",
 content:
 "**Transaction Cost Analysis (TCA)** measures the true cost of execution and identifies opportunities to improve.\n\n**Key TCA metrics**:\n- **VWAP slippage**: execution price vs the day's VWAP — positive means you paid more than average, negative means you outperformed\n- **Implementation shortfall (IS)**: execution price vs the price at the moment of the trading decision — captures both explicit costs (commissions) and implicit costs (market impact, timing risk, opportunity cost of unfilled shares)\n\n**Market impact model — Almgren-Chriss**:\nThe most widely used model for estimating market impact:\n**Impact σ × (Q / ADV)**\nwhere σ = daily volatility, Q = order size, ADV = average daily volume.\n\nAn order of 5% of ADV in a stock with 2% daily vol creates roughly 0.45% of market impact. Doubling order size increases impact by 2 = 41%, not 100% — a sublinear relationship that justifies breaking large orders into smaller pieces.\n\n**Pre-trade vs post-trade**:\n- **Pre-trade analytics**: estimate expected market impact before trading; decide between urgency vs patience\n- **Post-trade reporting**: measure actual execution quality vs benchmark; identify systematic biases (e.g., always overpaying in the first hour)\n\n**Practical benchmark**: institutional traders target slippage < 10 bps on liquid large-caps; 20–50 bps on mid-caps is typical.",
 highlight: [
 "transaction cost analysis",
 "TCA",
 "VWAP slippage",
 "implementation shortfall",
 "Almgren-Chriss",
 "market impact",
 "ADV",
 "pre-trade analytics",
 "post-trade reporting",
 "10 bps",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "What is the primary objective of the Arrival Price (Implementation Shortfall) execution algorithm?",
 options: [
 "Execute the entire order at the opening auction price to establish a clean benchmark",
 "Minimize implementation shortfall by trading close to the decision price, accepting more early market impact",
 "Spread the order evenly throughout the trading day to reduce timing risk",
 "Participate at a fixed percentage of market volume to avoid detection by other algorithms",
 ],
 correctIndex: 1,
 explanation:
 "The Arrival Price algorithm minimizes implementation shortfall — the difference between the execution price and the price at the moment the trading decision was made. It trades more aggressively early in the execution period to avoid adverse price drift while the order is being worked. This accepts higher early market impact in exchange for lower timing risk (the risk that prices move unfavorably while the order sits unexecuted). It is preferred when the underlying signal is alpha-decaying — the longer you wait to execute, the weaker the edge becomes.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "VWAP execution algorithms reduce market impact by spreading the order throughout the day in proportion to historical trading volume.",
 correct: true,
 explanation:
 "TRUE. VWAP algorithms slice the order across the trading day, executing more shares during high-volume periods (typically the open and close) and fewer shares during quiet midday periods. By participating proportionally to natural market volume, the algorithm minimizes market impact — the price distortion caused by the order itself. This approach means the execution price closely tracks the day's volume-weighted average price, which is also a common benchmark for measuring execution quality. The tradeoff is that VWAP sacrifices urgency for impact reduction.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A portfolio manager wants to buy $50M of a mid-cap stock with average daily volume of $30M (order = 167% of ADV). The manager has a strong alpha signal that she believes will decay within 4 hours. Two algorithm options are available: (A) VWAP over the full day, (B) Arrival Price algo targeting 60% completion in first 2 hours.",
 question:
 "Which algorithm is most appropriate, and why?",
 options: [
 "VWAP — spreading the order reduces market impact and the lower cost outweighs the signal decay",
 "Arrival Price — the alpha-decaying signal means speed of execution outweighs the higher early market impact",
 "Neither — an order of 167% ADV should never be executed in a single day regardless of signal strength",
 "VWAP — institutional best practice always prioritizes VWAP compliance over signal urgency",
 ],
 correctIndex: 1,
 explanation:
 "With an alpha-decaying signal expected to weaken within 4 hours, speed of execution outweighs minimizing market impact costs. The Arrival Price algorithm is designed for exactly this scenario: it trades aggressively early, accepting higher market impact in exchange for executing close to the current decision price before alpha erodes. A VWAP approach would spread the order over the full day, by which time the signal has already decayed and the expected alpha may not justify the execution cost. The 167% ADV size is large and requires careful execution, but urgency changes the calculus in favor of Arrival Price.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Backtesting Best Practices 
 {
 id: "trading-systems-3",
 title: "Backtesting Best Practices",
 description:
 "Avoiding common backtesting pitfalls, walk-forward validation, and robustness testing",
 icon: "FlaskConical",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Backtesting Pitfalls",
 content:
 "Backtesting is the foundation of systematic strategy development — and also the most dangerous source of self-deception.\n\n**Look-ahead bias**:\nUsing information that was not available at the time of the trade. Examples: using today's closing price to generate yesterday's signal; including earnings that were announced after market close in the prior day's data; using adjusted prices without accounting for when the adjustment was known. Look-ahead bias is insidious — it can be introduced through a single line of incorrect code and create apparently spectacular strategies.\n\n**Survivorship bias**:\nTesting on only the securities that survived the entire test period. The S&P 500 today has ~500 members — but over 20 years, hundreds of companies were added, removed, went bankrupt, or were acquired. Testing only on current members ignores all the failures, creating a sample biased toward success.\n\n**Overfitting (curve-fitting)**:\nAdding parameters until the strategy fits historical data perfectly. A 10-parameter model on 5 years of data will find patterns that are purely random. The rule of thumb: you need at least 10 trades per parameter to have statistical confidence in the parameters.\n\n**Data snooping (p-hacking)**:\nTesting hundreds of strategy variants and publishing only the best. Even with genuinely random data, testing 100 variants at 5% significance level will find ~5 false positives. The multiple comparisons problem demands much stricter significance thresholds — target p < 0.005 when testing many strategies.\n\n**Transaction cost underestimation**:\nUsing zero or nominal costs. Real costs include commission, bid-ask spread, market impact, and short-borrowing fees. Underestimating costs inflates alpha, particularly for high-frequency strategies.",
 highlight: [
 "look-ahead bias",
 "survivorship bias",
 "overfitting",
 "curve-fitting",
 "data snooping",
 "p-hacking",
 "multiple comparisons",
 "transaction cost underestimation",
 ],
 },
 {
 type: "teach",
 title: "Walk-Forward Validation",
 content:
 "**Walk-forward analysis** is the gold standard for testing whether a strategy is genuinely predictive or merely fitted to historical noise.\n\n**Out-of-sample testing**:\nDivide data into training set (70%) and test set (30%). Optimize parameters on training data only, then evaluate performance on the held-out test set — data the strategy has never seen. If the strategy degrades severely out-of-sample, overfitting is likely.\n\n**Walk-forward optimization**:\nInstead of a single train/test split, use rolling windows: optimize on a 2-year window, test on next 6 months; roll forward 6 months and repeat. This produces a sequence of out-of-sample results that mimic live trading conditions and reveal how parameter stability evolves over time.\n\n**Combinatorial Purged Cross-Validation (CPCV)**:\nDeveloped by Marcos Lopez de Prado (author of *Advances in Financial Machine Learning*). More sophisticated than standard cross-validation for financial time series: purges overlapping observations to prevent leakage between training and validation sets, handles autocorrelated returns, and uses combinatorial splits for better statistical power.\n\n**Minimum backtest length**:\nFor statistical significance, a strategy needs sufficient trades and time. A minimum of 30–50 independent trades in the out-of-sample period is required. Strategies with holding periods of days need years of data; daily-bar strategies need at least 5 years; intraday strategies need at least 1–2 years at their specific timeframe.\n\n**Key principle**: if out-of-sample performance is not at least 50% of in-sample Sharpe, the strategy is likely overfitted.",
 highlight: [
 "walk-forward analysis",
 "out-of-sample testing",
 "walk-forward optimization",
 "combinatorial purged cross-validation",
 "CPCV",
 "Marcos Lopez de Prado",
 "minimum backtest length",
 "50% of in-sample Sharpe",
 ],
 },
 {
 type: "teach",
 title: "Strategy Robustness Tests",
 content:
 "A robust strategy is one that works not just with specific parameters but across a range of reasonable assumptions.\n\n**Parameter sensitivity analysis**:\nVary each parameter ±20–30% and observe the impact on Sharpe ratio and drawdown. A robust strategy shows a smooth performance surface — small parameter changes cause small performance changes. A fragile strategy shows a sharp spike around one parameter value and collapses on either side — classic overfitting.\n\n**Monte Carlo simulation**:\nRandomly shuffle the sequence of trade returns (bootstrapping) and generate thousands of possible equity curves from the same trade distribution. This reveals:\n- **Distribution of expected drawdowns** — the realized backtest drawdown may not be the worst case\n- **Probability of ruin** — what fraction of simulations end in catastrophic loss?\n- **Range of possible returns** — the backtest Sharpe is a single point estimate, not the expected value\n\n**Sub-sample testing**:\nTest the strategy separately on different sectors, market regimes (bull/bear), and time periods (pre/post-2008, low/high volatility environments). If the strategy only works in one era, it may be a historical artifact rather than a persistent edge.\n\n**Live paper trading period**:\nBefore committing real capital, paper trade the strategy in live market conditions for at least 3–6 months. This surfaces execution assumptions, data feed latency, corporate action handling, and other live-trading frictions that backtests miss.\n\n**Final principle**: a strategy that cannot pass all four robustness tests should not receive real capital, regardless of backtest performance.",
 highlight: [
 "parameter sensitivity analysis",
 "performance surface",
 "Monte Carlo simulation",
 "bootstrapping",
 "probability of ruin",
 "sub-sample testing",
 "paper trading",
 "robustness tests",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "What is the primary purpose of walk-forward validation in strategy development?",
 options: [
 "To optimize strategy parameters using the maximum available historical data for best performance",
 "To prevent overfitting by evaluating strategy performance on truly out-of-sample data not used in optimization",
 "To calculate the exact transaction costs that will occur during live trading",
 "To identify the best entry and exit signals across all possible parameter combinations",
 ],
 correctIndex: 1,
 explanation:
 "Walk-forward validation prevents overfitting by evaluating strategy performance on data that was never used during parameter optimization. By rolling through history — optimizing on one window, testing on the next — the method produces a sequence of genuinely out-of-sample results that simulate live trading conditions. Any strategy that performs well in backtest but poorly in walk-forward testing is almost certainly overfitted to historical patterns rather than capturing a genuine edge. Walk-forward testing is the primary defense against the single greatest failure mode in systematic strategy development.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Testing a strategy only on the current members of the S&P 500 introduces survivorship bias because it excludes companies that failed, were acquired, or were removed from the index during the test period.",
 correct: true,
 explanation:
 "TRUE. This is a classic survivorship bias example. The current S&P 500 consists only of companies that survived and remained large enough to stay in the index. Over any 20-year period, hundreds of companies were added, removed (for performance or size reasons), went bankrupt, or were acquired. A strategy tested only on current members encounters a sample systematically biased toward success — the failures have been silently excluded. To conduct unbiased backtests, use point-in-time constituent data that reflects exactly what companies were in the index on any given date.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A quant researcher develops a momentum strategy on 10 years of S&P 500 data using current index members. The strategy has 15 parameters and achieves a Sharpe ratio of 2.1 in-sample. In walk-forward testing, the out-of-sample Sharpe is 0.6. The researcher argues the strategy is still viable because 0.6 is positive.",
 question:
 "Which backtesting pitfalls are most clearly present in this methodology?",
 options: [
 "Only look-ahead bias — the researcher should have used adjusted prices",
 "Survivorship bias (current S&P 500 members only) and overfitting (15 parameters, Sharpe drops from 2.1 to 0.6 out-of-sample)",
 "Transaction cost underestimation only — realistic costs would explain the Sharpe decline",
 "Data snooping bias only — the researcher should have used a different significance threshold",
 ],
 correctIndex: 1,
 explanation:
 "Two clear pitfalls are present. First, survivorship bias: testing on current S&P 500 members excludes all companies that failed or were removed over the 10-year period, inflating in-sample performance. Second, severe overfitting: 15 parameters is excessive, and the out-of-sample Sharpe of 0.6 is only 29% of the in-sample Sharpe of 2.1 — well below the 50% threshold that suggests robust strategies. A 72% Sharpe degradation from in-sample to out-of-sample is a hallmark of a strategy fitted to historical noise. The strategy should not receive capital in its current form.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Risk Management Systems 
 {
 id: "trading-systems-4",
 title: "Risk Management Systems",
 description:
 "Position sizing frameworks, portfolio-level controls, and monitoring infrastructure",
 icon: "ShieldCheck",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Position Sizing Systems",
 content:
 "**Position sizing** determines how much capital to allocate to each trade — arguably more important than entry signals for long-run survival.\n\n**Fixed dollar risk**:\nRisk a fixed dollar amount per trade (e.g., $5,000). Simple but does not scale with portfolio growth — as the portfolio compounds, fixed dollar risk becomes an increasingly tiny fraction of capital.\n\n**Fixed % risk (most common)**:\nRisk a fixed percentage of current portfolio value per trade (e.g., 1–2%). Position size = (Portfolio × risk%) / (entry stop loss). Naturally compounds: as portfolio grows, position sizes grow proportionally. As portfolio shrinks, sizes automatically reduce — a built-in drawdown protection.\n\n**Kelly criterion**:\nMathematically optimal bet size: **f* = (edge) / (odds)** or equivalently **f* = p (1p)/b** where p = win rate, b = reward/risk ratio. Kelly maximizes long-run geometric growth rate. In practice, **half-Kelly** is used because full Kelly produces severe volatility, and estimated edge is always uncertain.\n\n**Volatility targeting**:\nSize positions inversely proportional to their realized volatility — hold more of low-vol assets, less of high-vol assets — so each position contributes equal volatility to the portfolio. Risk parity funds (Bridgewater All Weather) use this approach.\n\n**Mean-variance optimization**:\nMarkowitz portfolio weights that maximize Sharpe ratio given a covariance matrix. Theoretically optimal but extremely sensitive to input assumptions — small errors in expected returns produce very different weights.",
 highlight: [
 "position sizing",
 "fixed dollar risk",
 "fixed % risk",
 "Kelly criterion",
 "half-Kelly",
 "volatility targeting",
 "risk parity",
 "mean-variance optimization",
 "Bridgewater",
 ],
 },
 {
 type: "teach",
 title: "Portfolio-Level Risk Controls",
 content:
 "Individual position sizing is necessary but not sufficient — portfolio-level controls prevent systemic failures.\n\n**Maximum drawdown stop**:\nHalt all trading if portfolio drawdown from peak exceeds a threshold (e.g., -15%). This forces a review before losses compound further. Many funds have tiered halts: reduce risk at -10%, halt at -15%, board review required to resume trading.\n\n**Correlation limits**:\nNo more than 2–3 correlated positions in the portfolio simultaneously. If you hold 5 tech stocks that all have 0.8 correlation to each other, you have 1 effective position — not 5. Modern risk systems calculate effective N using correlation-adjusted diversification ratios.\n\n**Sector concentration limits**:\nMaximum allocation to any single sector (e.g., 30%), preventing concentration in cyclical downturns. Long/short funds also monitor gross and net sector exposures separately.\n\n**VAR limit**:\nDaily portfolio **Value at Risk (VAR)** < 1% of capital at 95% confidence. VAR answers: \"What is the maximum 1-day loss we expect to incur on 95% of trading days?\"Useful for day-to-day limits but fails in tail events (by design, VAR ignores the worst 5% of outcomes).\n\n**Liquidity-Adjusted VAR (LVAR)**:\nExtends VAR by incorporating the market impact of unwinding positions under stress. A $500M position in a stock with $10M ADV takes 50 days to exit — the unwind cost is a hidden risk that standard VAR misses. LVAR adjusts the risk estimate by modeling the liquidation schedule.",
 highlight: [
 "maximum drawdown stop",
 "correlation limits",
 "sector concentration limits",
 "VAR",
 "Value at Risk",
 "LVAR",
 "liquidity-adjusted VAR",
 "diversification ratio",
 ],
 },
 {
 type: "teach",
 title: "Monitoring and Circuit Breakers",
 content:
 "Systematic trading requires systematic oversight infrastructure to catch failures before they become catastrophic.\n\n**Real-time P&L dashboards**:\nLive monitoring of all positions, Greeks (for options books), realized and unrealized P&L by strategy, sector, and instrument. Alerts when any metric crosses predefined thresholds. Goldman Sachs's legendary risk management culture is partly attributed to its obsession with real-time risk visibility.\n\n**Kill switch**:\nAuto-halts all new orders if the system detects anomalous behavior — e.g., P&L drops more than 2× the expected daily range, order flow exceeds 10× normal rate, or position size exceeds limits. The 2012 Knight Capital incident ($440M loss in 45 minutes) was caused by a missing kill switch for a rogue algorithm that was accidentally activated in production.\n\n**Fat-finger checks**:\nOrder validation rules: reject any order where quantity > X% of ADV, price deviates > Y% from last trade, or notional value exceeds the strategy's maximum position limit. These simple checks prevent typos and code bugs from becoming market-moving disasters.\n\n**Strategy drift detection**:\nPeriodically compare current portfolio positions vs what the model intends — if they diverge materially, halt and investigate. Drift can be caused by execution failures, corporate actions, or system bugs.\n\n**Manual override procedures**:\nDefine clear escalation paths: who can override the kill switch and under what circumstances, documented and rehearsed before a crisis occurs.",
 highlight: [
 "real-time P&L dashboards",
 "kill switch",
 "Knight Capital",
 "fat-finger checks",
 "strategy drift detection",
 "manual override",
 "anomalous behavior",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Why does the fixed percentage risk method naturally scale better than fixed dollar risk as a portfolio grows?",
 options: [
 "Fixed % risk uses the Kelly formula to optimize position sizes, unlike fixed dollar risk",
 "Fixed % risk automatically increases position sizes as the portfolio compounds, and reduces them during drawdowns — naturally adapting to portfolio size",
 "Fixed dollar risk violates regulatory requirements for professional fund management",
 "Fixed % risk eliminates correlation risk between positions, while fixed dollar risk does not",
 ],
 correctIndex: 1,
 explanation:
 "The fixed percentage risk method sizes each trade as a percentage of current portfolio value (e.g., 1–2%). As the portfolio grows through compounding, position sizes grow proportionally — capturing the benefits of compound growth. Conversely, during drawdowns, position sizes automatically shrink, providing a built-in risk reduction mechanism. Fixed dollar risk (e.g., always risking $5,000 per trade) does not scale: on a $100,000 portfolio it risks 5%, but on a $1,000,000 portfolio it risks only 0.5% — the strategy can no longer move the needle. Fixed % risk is the standard approach used by most professional systematic traders.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Setting a daily portfolio VAR limit prevents catastrophic tail event losses because VAR captures all potential outcomes including extreme market moves.",
 correct: false,
 explanation:
 "FALSE. VAR (Value at Risk) is defined as the maximum expected loss over a time period at a given confidence level (e.g., 95%). By construction, it explicitly ignores the worst 5% of outcomes — exactly the tail events where catastrophic losses occur. The 2008 financial crisis exposed this: banks with 'safe' VAR limits suffered catastrophic losses because the crisis was a 5-sigma event outside the VAR model's scope. VAR is a useful day-to-day risk limit tool, but it must be supplemented with stress testing, CVaR (Conditional VAR / Expected Shortfall), and scenario analysis to capture tail risk.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A trader has a $200,000 portfolio and uses fixed 1% risk per trade. She wants to buy Stock XYZ at $50.00 with a stop loss at $47.50 (a $2.50 risk per share). How many shares should she buy to risk exactly 1% of her portfolio?",
 options: [
 "400 shares ($20,000 total position)",
 "800 shares ($40,000 total position)",
 "200 shares ($10,000 total position)",
 "80 shares ($4,000 total position)",
 ],
 correctIndex: 1,
 explanation:
 "Fixed % risk calculation: Portfolio × risk% = $200,000 × 1% = $2,000 maximum risk. Risk per share = entry stop = $50.00 $47.50 = $2.50. Shares = $2,000 / $2.50 = 800 shares. Total position value = 800 × $50 = $40,000 (20% of portfolio). If the stock hits the stop at $47.50, the loss is 800 × $2.50 = $2,000, exactly 1% of the $200,000 portfolio. This calculation framework is the core of professional position sizing: working backwards from acceptable risk to determine position size, rather than starting with a target dollar amount.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 5: Market Regimes & Adaptive Systems 
 {
 id: "trading-systems-5",
 title: "Market Regimes & Adaptive Systems",
 description:
 "Regime identification, adaptive strategy selection, and machine learning for market states",
 icon: "Layers",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Market Regime Identification",
 content:
 "**Market regimes** are distinct states of market behavior — different dynamics require different strategies. Identifying the current regime is the first step in adaptive trading.\n\n**Hidden Markov Models (HMM)**:\nThe most rigorous approach: a latent variable model where the market can be in one of K unobserved states (e.g., bull, bear, sideways). The model estimates transition probabilities between states and the emission distribution of returns in each state. Unlike rule-based approaches, HMMs quantify regime uncertainty — the market may be 70% likely to be in a bull regime and 30% in a bear regime.\n\n**VIX-based regime**:\nSimple and effective: VIX < 15 low-vol/bull regime; VIX 15–25 transitional; VIX > 25 high-vol/bear regime. Mean-reversion strategies tend to work in low-VIX environments; trend following performs better in high-VIX environments when assets trend hard.\n\n**Yield curve regime**:\nInverted yield curve (2yr > 10yr) historically precedes recessions by 12–18 months. Positive and steep curve signals expansion. Flat curve signals late-cycle caution.\n\n**Breadth regime**:\n% of stocks above their 200-day moving average. > 70% = broad bull market; 40–70% = mixed/transitional; < 40% = broad bear market. Breadth divergence (index at highs but breadth falling) often precedes index tops.\n\n**Trend strength (ADX)**:\nADX > 25 signals a trending market (suitable for trend following); ADX < 20 signals a ranging market (suitable for mean reversion).",
 highlight: [
 "market regimes",
 "Hidden Markov Models",
 "HMM",
 "VIX",
 "bull regime",
 "bear regime",
 "yield curve",
 "inverted yield curve",
 "breadth regime",
 "ADX",
 ],
 },
 {
 type: "teach",
 title: "Adaptive Strategy Selection",
 content:
 "**Regime-switching models** dynamically allocate between strategies based on the detected current market state.\n\n**Strategy rotation by regime**:\n- **Trending regime** (high ADX, high VIX, directional breadth): run trend-following systems; reduce mean-reversion exposure\n- **Ranging regime** (low ADX, low VIX, mixed breadth): run mean-reversion and stat arb systems; reduce trend following\n- **Transition regime**: reduce overall risk; wait for clearer signal\n\n**Parameter adaptation**:\nDo not just switch strategies — adapt parameters within a strategy to current conditions. In high-volatility regimes, use shorter lookback periods (markets change faster); in low-volatility regimes, use longer lookback periods (trends are more persistent). RSI overbought/oversold thresholds should be wider in trending markets.\n\n**Dynamic risk allocation**:\nReduce portfolio leverage as volatility rises. If target portfolio vol is 10%, and market vol doubles, cut position sizes in half to maintain the vol target. This is equivalent to deleveraging before forced margin calls — a proactive risk management approach.\n\n**Correlation regime**:\n- **Low correlation** between assets: diversify broadly — the diversification benefit is real\n- **High correlation** (crisis period): diversification collapses; hedge instead with direct short positions, put options, or volatility instruments\n\nThe key insight: **no single strategy works in all regimes**. The best systematic traders run regime-aware portfolios that dynamically weight strategies based on current market conditions.",
 highlight: [
 "regime-switching models",
 "trending regime",
 "ranging regime",
 "parameter adaptation",
 "dynamic risk allocation",
 "vol target",
 "correlation regime",
 "diversification",
 ],
 },
 {
 type: "teach",
 title: "Machine Learning for Regime Detection",
 content:
 "**Machine learning** offers powerful tools for identifying market regimes, though with important caveats.\n\n**Unsupervised learning — k-means clustering**:\nCluster historical market states (defined by features like returns, volatility, correlations, macro indicators) into K groups. Each cluster represents a market 'state'. New observations are classified into the nearest cluster, determining the current regime. Advantage: no need to define regimes in advance — the data reveals natural groupings.\n\n**Supervised learning — regime classification**:\nLabel historical periods as bull/bear/sideways using hindsight, then train a classifier (Random Forest, Gradient Boosting, LSTM) to predict regime from real-time features. Risk: labels created with hindsight may not reflect what was predictable in real time.\n\n**Online learning**:\nModels that update parameters continuously as new data arrives, adapting to gradual regime shifts without requiring a full retraining cycle. Particularly useful in non-stationary financial markets.\n\n**Critical risks**:\n- **Overfitting to historical regimes**: regimes from 1990–2010 may not recur — the model may be fitting idiosyncratic history\n- **Regime shift detection time lag**: any model requires sufficient data to confirm a new regime has started; by the time a regime is confirmed, the easy money has been made (or lost)\n- **Feature engineering**: regime models are only as good as their input features — garbage in, garbage out\n\n**Practical implementation**: combine ML regime signals with simpler rule-based confirmations (VIX, ADX, breadth) to reduce false regime signals.",
 highlight: [
 "machine learning",
 "k-means clustering",
 "supervised learning",
 "online learning",
 "overfitting to historical regimes",
 "regime shift detection lag",
 "feature engineering",
 "Random Forest",
 "LSTM",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "What is the primary application of Hidden Markov Models (HMM) in finance?",
 options: [
 "Predicting exact future asset prices using Markov chain price transitions",
 "Identifying latent market regimes that are not directly observable but inferred from market returns and volatility",
 "Calculating optimal portfolio weights using hidden covariance factors",
 "Generating synthetic price data for Monte Carlo simulations",
 ],
 correctIndex: 1,
 explanation:
 "Hidden Markov Models identify latent (hidden) market states — regimes that are not directly observable but can be inferred from observable data like returns, volatility, and correlations. The 'hidden' part refers to the fact that market regimes (bull, bear, sideways) are not directly labeled in the data; the model estimates which unobserved state best explains the observed return sequence. Unlike rule-based regime classifiers (e.g., VIX > 25 = bear), HMMs also provide a probability distribution over possible states, reflecting the inherent uncertainty about which regime the market is in at any given moment.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Adaptive trading systems should adjust strategy parameters and allocations based on the current market regime to maintain their statistical edge across different market environments.",
 correct: true,
 explanation:
 "TRUE. No single strategy works optimally across all market regimes. Trend-following strategies perform well in high-volatility trending environments but suffer in low-volatility range-bound markets. Mean-reversion strategies thrive when volatility is low and prices oscillate, but fail during strong trending periods. Adaptive systems that identify the current regime and adjust their strategy mix, parameters, and risk allocation accordingly can maintain a more consistent edge. Dynamic risk allocation (reducing leverage as volatility rises) and parameter adaptation (shorter lookbacks in high-vol regimes) are two key adaptive mechanisms used by professional systematic funds.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A systematic fund runs three sub-strategies: (A) trend following, (B) stat arb mean reversion, (C) short volatility. Current market conditions: VIX has spiked from 14 to 38 over 2 weeks, the yield curve has inverted, % stocks above 200MA has dropped from 72% to 31%, and ADX across most markets is above 35.",
 question:
 "Based on regime detection signals, which strategy allocation adjustment is most appropriate?",
 options: [
 "Increase all three strategies equally — high volatility creates opportunities for all systematic approaches",
 "Increase trend following, reduce or halt stat arb and short volatility — all signals point to a high-vol trending bear regime",
 "Increase stat arb and short volatility, reduce trend following — mean reversion profits from the VIX spike",
 "Exit all strategies until VIX returns to 14 — regime uncertainty makes any allocation inadvisable",
 ],
 correctIndex: 1,
 explanation:
 "All four regime signals point to a high-volatility trending bear market: VIX surge (high vol/bear), inverted yield curve (recession risk), broad market breadth collapse (< 40%), and high ADX across markets (strong trending). This regime strongly favors trend following — which generates crisis alpha by shorting falling markets — and penalizes both stat arb (crowded mean-reversion books unwind simultaneously in crises) and short volatility (catastrophic losses when VIX spikes from 14 to 38). The correct adaptive response is to increase trend following exposure, reduce or halt stat arb, and exit short volatility positions before they suffer further.",
 difficulty: 3,
 },
 ],
 },
 ],
};
