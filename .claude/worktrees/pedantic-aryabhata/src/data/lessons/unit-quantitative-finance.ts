import type { Unit } from "./types";

export const UNIT_QUANTITATIVE_FINANCE: Unit = {
 id: "quantitative-finance",
 title: "Quantitative Finance & Systematic Trading",
 description:
 "Statistical foundations, factor models, backtesting rigor, signal generation, and portfolio construction for systematic traders",
 icon: "",
 color: "#0ea5e9",
 lessons: [
 // Lesson 1: Statistics for Trading 
 {
 id: "quant-1",
 title: "Statistics for Trading",
 description:
 "Normal distribution, fat tails, stationarity, cointegration, Sharpe and Sortino ratios",
 icon: "BarChart2",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Normal Distribution & Fat Tails",
 content:
 "Most statistics courses assume financial returns follow a **normal distribution** — the classic bell curve. In practice, this assumption is dangerously wrong.\n\n**The normal distribution predicts**:\n- A 3-sigma daily move: once every ~3 years\n- A 5-sigma move: once every ~14,000 years\n- A 10-sigma move: essentially impossible\n\n**Reality**: Black Monday 1987 (-22% in one day) was a ~25-sigma event under the normal model. The S&P 500 has experienced multiple 5-sigma moves in every decade.\n\nFinancial returns have **excess kurtosis** — heavier tails than the normal distribution predicts. This means extreme events ('black swans') are far more frequent than normal-distribution models suggest.\n\n**Excess kurtosis = kurtosis 3**. Normal distribution has excess kurtosis = 0. Daily equity returns typically show excess kurtosis of 5–10.\n\n**Negative skew**: Most equity strategies also exhibit negative skew — frequent small gains but occasional catastrophic losses. Think of it as 'picking up pennies in front of a steamroller.'\n\nRisk models built on normality will systematically underestimate tail risk. Always size positions as if the worst historical loss can be exceeded.",
 highlight: [
 "normal distribution",
 "fat tails",
 "excess kurtosis",
 "black swans",
 "negative skew",
 "tail risk",
 ],
 },
 {
 type: "teach",
 title: "Correlation vs Causation & Stationarity",
 content:
 "Two of the most important concepts for any quant trader:\n\n**Correlation vs Causation**:\nTwo series moving together does not mean one causes the other. Classic spurious example: US cheese consumption correlates with deaths by bedsheet tangling (r 0.95). Both are driven by time trends, not causal relationships.\n\nIn finance, many factor relationships that look causal are simply correlated through a common driver (e.g., both influenced by the economic cycle). Always ask: what is the economic mechanism?\n\n**Stationarity**:\nA time series is **stationary** if its mean, variance, and autocorrelation structure are constant over time.\n\nWhy it matters: almost every statistical model assumes the data-generating process is stable. If the distribution is shifting, parameters estimated on historical data are meaningless for future prediction.\n\n**Price levels are NOT stationary**: a stock price can drift to any positive level, with growing variance.\n**Returns ARE approximately stationary**: daily log returns have roughly stable mean (~0) and variance over medium windows.\n\nMost quant models work on returns, not price levels, for this reason.\n\nTest for stationarity with the **Augmented Dickey-Fuller (ADF) test**: reject the null (unit root) to confirm stationarity.",
 highlight: [
 "correlation",
 "causation",
 "spurious correlation",
 "stationarity",
 "mean",
 "variance",
 "autocorrelation",
 "Augmented Dickey-Fuller",
 ],
 },
 {
 type: "teach",
 title: "Cointegration, Sharpe & Sortino",
 content:
 "**Cointegration**:\nTwo non-stationary series (like stock prices) can have a stationary *relationship* — meaning they tend to move together over time. This is cointegration.\n\nExample: Coca-Cola and Pepsi prices individually wander (non-stationary), but their spread (KO c × PEP) may be stationary. **Pairs trading** exploits this: when the spread widens unusually, bet on convergence.\n\nCointegration is stronger than simple correlation — it implies a long-run equilibrium relationship, not just short-term co-movement.\n\n**Sharpe Ratio**:\nThe most widely used risk-adjusted performance metric:\n\nSharpe = (Return Rƒ) / Standard Deviation\n\nWhere Rƒ = risk-free rate. Interpretation:\n- Sharpe < 0: Loses money vs risk-free\n- 0–0.5: Below average\n- 0.5–1.0: Adequate\n- > 1.0: Good (rare in live trading)\n- > 2.0: Exceptional (possibly data-mined)\n\n**Sortino Ratio**:\nAddresses the Sharpe limitation of penalising upside volatility equally:\n\nSortino = (Return Rƒ) / Downside Deviation\n\nDownside deviation only counts returns below the target (usually 0 or Rƒ). Better for strategies with positive skew.",
 highlight: [
 "cointegration",
 "pairs trading",
 "Sharpe ratio",
 "Sortino ratio",
 "downside deviation",
 "risk-adjusted return",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "What does it mean when a financial time series is 'stationary'?",
 options: [
 "Its mean, variance, and autocorrelation are constant over time",
 "The price does not change over time",
 "It follows a normal distribution",
 "It has zero correlation with all other series",
 ],
 correctIndex: 0,
 explanation:
 "A stationary time series has statistical properties — mean, variance, and autocorrelation structure — that do not change over time. This is required for most statistical models. Stock price levels are NOT stationary (they drift), but returns are approximately stationary. Testing for stationarity (e.g., ADF test) is a critical first step in any quantitative analysis.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Because financial returns exhibit fat tails (excess kurtosis), a risk model assuming a normal distribution will systematically overestimate the probability of extreme losses.",
 correct: false,
 explanation:
 "False — a normal distribution model will systematically UNDERESTIMATE the probability of extreme losses, not overestimate them. Fat tails mean there are more extreme observations than the bell curve predicts. Models assuming normality gave false reassurance before the 2008 crisis. Risk managers should use fat-tailed distributions (Student's t, historical simulation) for more realistic tail-risk estimates.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Strategy A: 20% annual return, 16% volatility, risk-free rate 4%. Strategy B: 16% annual return, 10% volatility, risk-free rate 4%. Strategy B has strongly negative skew (frequent small gains, rare large crashes).",
 question:
 "Which strategy has a higher Sharpe ratio, and what does the skewness analysis add?",
 options: [
 "Strategy B has higher Sharpe (1.20 vs 1.00), but its negative skew means tail losses are understated — use Sortino or max drawdown analysis",
 "Strategy A has higher Sharpe because it has higher absolute return",
 "Both have the same Sharpe because skew is already accounted for",
 "Strategy B's negative skew makes its Sharpe calculation invalid",
 ],
 correctIndex: 0,
 explanation:
 "Strategy A Sharpe: (204)/16 = 1.00. Strategy B Sharpe: (164)/10 = 1.20. Strategy B wins on Sharpe. However, Sharpe treats upside and downside volatility equally. Strategy B's negative skew — large, infrequent crashes — is not captured by Sharpe. The Sortino ratio (using only downside deviation) or max drawdown analysis would better reveal Strategy B's true tail risk.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Factor Models 
 {
 id: "quant-2",
 title: "Factor Models",
 description:
 "CAPM, Fama-French multi-factor models, alpha, information ratio, and factor investing",
 icon: "Layers",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "CAPM: The Single-Factor Model",
 content:
 "The **Capital Asset Pricing Model (CAPM)** is the foundational factor model. It asserts that the expected return of any asset is determined entirely by its sensitivity to the market:\n\nE(R) = Rƒ + β × (Rm Rƒ)\n\nWhere:\n- **Rƒ** = risk-free rate (e.g., 3-month T-bill)\n- **β (beta)** = sensitivity to the market portfolio\n- **(Rm Rƒ)** = equity risk premium (historically ~5–7% per year)\n\n**Interpreting beta**:\n- β = 1.0: Stock moves in line with the market\n- β = 1.5: Stock is 1.5× more sensitive — rises 15% when market rises 10%, falls 15% when market falls 10%\n- β = 0.5: Defensive stock, half the market movement\n- β < 0: Moves opposite to the market (rare; gold sometimes exhibits this)\n\n**CAPM limitations**:\n1. Only one risk factor (the market) explains returns — empirically inadequate\n2. Assumes investors are rational and markets are perfectly efficient\n3. Beta is estimated from historical data and is unstable over time\n4. Cross-sectional evidence shows low-beta stocks outperform predictions (the low-volatility anomaly)\n\nDespite its limitations, CAPM remains the starting point for understanding risk premia and is used everywhere in corporate finance (cost of equity estimation).",
 highlight: [
 "CAPM",
 "beta",
 "equity risk premium",
 "risk-free rate",
 "systematic risk",
 ],
 },
 {
 type: "teach",
 title: "Fama-French & Multi-Factor Models",
 content:
 "Eugene Fama and Kenneth French demonstrated that CAPM's single factor leaves significant return variation unexplained. Their **3-Factor Model** adds:\n\n1. **Market (Rm Rƒ)**: Market risk premium (same as CAPM)\n2. **SMB (Small Minus Big)**: Small-cap stocks have historically outperformed large-cap stocks — the size premium\n3. **HML (High Minus Low)**: Value stocks (high book-to-market) have historically outperformed growth stocks — the value premium\n\nFama-French **5-Factor Model** (2015) adds:\n4. **RMW (Robust Minus Weak)**: Profitability premium — profitable firms outperform unprofitable\n5. **CMA (Conservative Minus Aggressive)**: Investment premium — firms investing conservatively outperform aggressive investors\n\nOther documented factors include:\n- **Momentum** (Carhart): Past 12-month winners continue to outperform\n- **Low Volatility**: Low-risk stocks outperform (anomaly vs CAPM)\n- **Quality**: High ROE, stable earnings premium\n\n**Factor investing** (smart beta) systematically harvests these known risk premia through rules-based portfolios — a middle ground between passive indexing and active stock picking.",
 highlight: [
 "Fama-French",
 "SMB",
 "HML",
 "momentum",
 "factor investing",
 "smart beta",
 "size premium",
 "value premium",
 ],
 },
 {
 type: "teach",
 title: "Alpha & Information Ratio",
 content:
 "**Alpha (α)**: The return unexplained by a factor model. True alpha represents genuine skill — generating returns beyond what is explained by known risk exposures.\n\nα = Actual Return (Rƒ + βF + βF + … + βF)\n\nA manager who earns 15% when CAPM predicts 12% has α = 3%. But if that manager also has hidden exposure to the value factor which itself returned 4%, the 'alpha' might be entirely explained by systematic factor exposure — not skill.\n\n**Information Ratio (IR)**:\nMeasures the consistency of alpha generation relative to a benchmark:\n\nIR = α / Tracking Error\n\nTracking Error = σ(Portfolio Returns Benchmark Returns)\n\nInterpretation:\n- IR > 0.5: Good active management\n- IR > 1.0: Exceptional\n- Most active managers have IR < 0.3 net of fees\n\n**The key insight**: most fund manager 'alpha' disappears when properly controlling for factor exposures. A manager running a small-cap value portfolio should not be benchmarked to the S&P 500 — their 'excess return' over the S&P 500 may simply be the size and value premia.",
 highlight: [
 "alpha",
 "information ratio",
 "tracking error",
 "factor exposure",
 "skill",
 "benchmark",
 ],
 },
 {
 type: "quiz-mc",
 question: "In CAPM, what does a beta of 1.5 mean?",
 options: [
 "The stock is expected to move 1.5× the market's move",
 "The stock has 1.5% higher expected return than the market",
 "The stock has 50% more total risk than the average stock",
 "The stock will outperform the market by 50% over time",
 ],
 correctIndex: 0,
 explanation:
 "Beta measures a stock's sensitivity to the market. A beta of 1.5 means the stock is expected to move 1.5 times as much as the market — up 15% when the market rises 10%, down 15% when the market falls 10%. This is systematic (market) risk that cannot be diversified away. A beta of 1.5 does NOT guarantee outperformance; it means higher expected return AND higher expected risk relative to the market.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "A fund manager who consistently outperforms the S&P 500 by 4% annually necessarily possesses genuine stock-picking skill (positive alpha) that cannot be explained by factor exposures.",
 correct: false,
 explanation:
 "False. Outperformance vs a benchmark can be entirely explained by factor exposures rather than skill. If the manager runs a small-cap value portfolio, the Fama-French SMB and HML factors alone might explain a 4% annual premium over the S&P 500. True alpha is the return *unexplained* after controlling for all relevant factor exposures. Most active manager 'alpha' disappears in multi-factor attribution analysis.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A portfolio manager earned 18% last year. The market returned 12%, the risk-free rate was 4%, and the manager's portfolio beta is 1.2. The Fama-French SMB factor returned 3% and the manager's SMB loading is 0.8.",
 question:
 "What is the manager's CAPM alpha, and does the picture change with the Fama-French factor?",
 options: [
 "CAPM alpha = 18% [4% + 1.2 × (12%4%)] = 4.4%; adding the size factor (0.8 × 3% = 2.4%) further reduces the true alpha to ~2%",
 "CAPM alpha = 18% 12% = 6%; factor models are not relevant for the alpha calculation",
 "CAPM alpha = 18% / 12% = 1.5; the ratio of returns measures alpha",
 "CAPM alpha = 0 because the manager has beta = 1.2 which means no skill premium",
 ],
 correctIndex: 0,
 explanation:
 "CAPM expected return = 4% + 1.2 × (12%4%) = 4% + 9.6% = 13.6%. CAPM alpha = 18% 13.6% = 4.4%. However, adding the SMB factor contribution: 0.8 × 3% = 2.4% — this was just exposure to the small-cap premium, not skill. Adjusted alpha 4.4% 2.4% = 2%. Each additional factor strips out systematic premia until we isolate genuine stock-picking skill.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Backtesting & Research 
 {
 id: "quant-3",
 title: "Backtesting & Research",
 description:
 "Survivorship bias, look-ahead bias, overfitting, walk-forward testing, and the multiple testing problem",
 icon: "FlaskConical",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Backtest Bias 1: Survivorship Bias",
 content:
 "**Survivorship bias** is one of the most pervasive errors in quantitative research. It occurs when a study only includes assets (stocks, funds, strategies) that exist today, ignoring those that failed, went bankrupt, or were delisted.\n\n**Example**: Testing a strategy on today's S&P 500 constituents looks back at 500 successful companies. But in 2000, the index contained many companies that no longer exist. Your backtest is implicitly selecting winners with hindsight.\n\n**Magnitude of the bias**: Studies show survivorship bias inflates mutual fund performance by ~1–3% per year. For stock-picking strategies, the bias can be 5%+ per year — enough to make a losing strategy look profitable.\n\n**How to fix it**:\n- Use **point-in-time databases**: only include stocks that were in the index *at that time*, not today\n- Include **delisted stocks** and their returns up to delisting (usually very negative)\n- Use databases like CRSP (Center for Research in Security Prices) which correctly handle this\n\n**Beyond stocks**: Survivorship bias affects hedge fund databases (failed funds stop reporting), backtested factors (factors look better because bad implementations aren't studied), and strategy selection (only strategies that worked are published).",
 highlight: [
 "survivorship bias",
 "point-in-time database",
 "delisted stocks",
 "backtest",
 "CRSP",
 ],
 },
 {
 type: "teach",
 title: "Backtest Bias 2: Look-Ahead Bias & Overfitting",
 content:
 "**Look-ahead bias** occurs when a backtest uses data that would not have been available at the time of the trading decision.\n\nCommon examples:\n- Using **quarterly earnings** announced on March 15 to make a trade on March 1\n- Using **end-of-day prices** to fill an order that would have been placed at the open\n- Using **analyst consensus estimates** that were revised after the period under study\n- Using **index membership** as it stands today (stocks join/leave over time)\n\nA properly implemented backtest uses only data that existed at each decision point — a surprisingly hard engineering problem.\n\n**Overfitting (data snooping)**:\nWhen a strategy is tuned to fit historical data too precisely, it captures the noise of that specific sample rather than genuine market structure. Signs of overfitting:\n- Too many parameters relative to data points\n- Optimal parameters are very specific (e.g., RSI(14) works but RSI(13) or RSI(15) doesn't)\n- Dramatically different performance across sub-periods\n- Backtest Sharpe >> 2.0 for a simple strategy\n\nKoch's rule of thumb: for every parameter in a strategy, you need at least 100 independent observations. A strategy with 10 parameters needs 1,000+ independent trades to be trustworthy.",
 highlight: [
 "look-ahead bias",
 "overfitting",
 "data snooping",
 "parameters",
 "out-of-sample",
 ],
 },
 {
 type: "teach",
 title: "Walk-Forward Testing & Multiple Testing Problem",
 content:
 "**Walk-forward testing** is the gold standard for validating systematic strategies:\n\n1. Divide data into **in-sample** (IS) and **out-of-sample** (OOS) periods\n2. Optimize strategy parameters on the IS period\n3. Evaluate performance on the OOS period (the 'test')\n4. Roll the window forward and repeat\n5. Assess the aggregate OOS performance\n\nA strategy that performs well OOS is far less likely to be the result of curve-fitting. The ratio of IS Sharpe to OOS Sharpe is revealing — a ratio > 2× suggests significant overfitting.\n\n**The Multiple Testing Problem**:\nIf you test 100 different strategy variants with a p < 0.05 significance threshold, you expect ~5 to appear 'significant' by pure random chance — even if none of them have real predictive power.\n\nIn quantitative finance, researchers test thousands of parameter combinations and factor definitions. The probability of finding a spurious 'working' strategy by chance approaches 100%.\n\n**Corrections**:\n- **Bonferroni correction**: Divide the significance threshold by the number of tests\n- **False Discovery Rate (FDR)**: Controls the expected fraction of discoveries that are false\n- **Harvey-Liu-Zhu (2016)**: A paper specifically addressing multiple testing in factor research — argues t-statistic threshold should be ~3.0, not 2.0, for new factors\n\n**Practical rule**: A strategy's backtest Sharpe must exceed 1.0 + 0.2 × log(number of parameter combinations tested) to be credible.",
 highlight: [
 "walk-forward testing",
 "in-sample",
 "out-of-sample",
 "multiple testing",
 "Bonferroni",
 "false discovery rate",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "What is 'survivorship bias' in backtesting?",
 options: [
 "Only including stocks that survived to present, excluding failed companies",
 "Only testing strategies that survived the research process",
 "Using only the most recent data that has survived market crashes",
 "Selecting the time periods where the strategy performed best",
 ],
 correctIndex: 0,
 explanation:
 "Survivorship bias occurs when a backtest only includes stocks, funds, or other assets that exist today, ignoring those that went bankrupt, were delisted, or otherwise ceased to exist. Since failed companies typically had very negative returns before their demise, excluding them makes any strategy look significantly better than it actually would have been. The fix is to use point-in-time databases that include all historical constituents.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "If you test 100 different trading strategies using a 5% significance level and find 6 that appear statistically profitable, this is strong evidence that those 6 strategies have genuine predictive power.",
 correct: false,
 explanation:
 "False. With 100 strategies tested at the 5% significance level, you expect approximately 5 to appear significant purely by chance — even if none have any real predictive power. Finding 6 'significant' strategies is barely above the random expectation. This is the multiple testing problem. Proper corrections (Bonferroni, FDR) would require a much higher significance threshold across the 100 tests, or ideally, out-of-sample validation of each candidate.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A researcher tests a momentum strategy with 50 different parameter combinations on 20 years of S&P 500 data. The best combination has a backtest Sharpe of 1.8 in-sample. When tested on 5 years of held-out out-of-sample data, the Sharpe drops to 0.4.",
 question:
 "What does this result most likely indicate, and what should the researcher do?",
 options: [
 "Significant overfitting to the in-sample period — the 4.5× Sharpe ratio degradation suggests the strategy captured noise; the researcher should use robust parameter ranges and walk-forward validation",
 "The strategy is valid; some Sharpe degradation OOS is always expected and 0.4 is still positive",
 "The out-of-sample period was simply a bad market environment; test on a different OOS period",
 "The strategy needs more parameters to better capture the market dynamics",
 ],
 correctIndex: 0,
 explanation:
 "A 4.5× degradation from IS Sharpe 1.8 to OOS Sharpe 0.4 is a major red flag indicating severe overfitting. The strategy has been tuned to the specific noise of the in-sample period. With 50 parameter combinations tested, the multiple testing problem applies — the best IS performer is almost certainly over-optimized. The researcher should: (1) use walk-forward testing across multiple periods, (2) check robustness to parameter changes, and (3) require the OOS Sharpe to be at least 50% of the IS Sharpe for credibility.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Signal Generation 
 {
 id: "quant-4",
 title: "Signal Generation",
 description:
 "Price-based, volume-based, and fundamental signals; alternative data; signal decay",
 icon: "Radio",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Price-Based Signals",
 content:
 "**Price-based signals** are derived purely from the history of asset prices and are the oldest class of systematic signals.\n\n**Momentum (12-1 month)**:\nThe most robust factor in academic finance. Buy stocks that were top performers over the past 12 months, excluding the most recent month (which shows short-term reversal). Documented in 40+ countries and 200+ years of data.\n\nFormula: Momentum_t = Price_{t-1} / Price_{t-12} 1\n\n**Mean reversion**:\n- **RSI**: When RSI < 30 (oversold), expect a bounce. Works better in range-bound markets.\n- **Bollinger Bands**: When price > 2σ above the 20-day mean, bet on reversion to the mean.\n- Short-term (1–5 day) mean reversion is well-documented in equities, especially for liquid large-caps.\n\n**Breakout signals**:\n- Price breaking above a 52-week high: historically bullish in the following months\n- Turtle traders famously used 20-day and 55-day breakout channels\n- Requires careful handling of false breakouts (use volume confirmation)\n\n**Key caveat**: Price signals work when they represent real economic effects (e.g., momentum reflects information diffusion) but can break down when overcrowded — if everyone trades the same signal, the edge disappears.",
 highlight: [
 "momentum",
 "mean reversion",
 "RSI",
 "Bollinger Bands",
 "breakout",
 "52-week high",
 ],
 },
 {
 type: "teach",
 title: "Volume-Based & Fundamental Signals",
 content:
 "**Volume-based signals**:\nVolume provides information about the conviction behind price moves.\n\n- **Volume-price divergence**: Price rising on declining volume suggests weakening conviction — potential reversal signal\n- **On-Balance Volume (OBV)**: Cumulative volume measure — adds volume on up days, subtracts on down days. Rising OBV with flat price = accumulation (bullish)\n- **VWAP deviation**: Price significantly below VWAP may attract institutional buying (value signal intraday)\n- **Volume spikes**: Unusual volume often precedes a trend change or confirms a breakout\n\n**Fundamental signals**:\nDerived from financial statement data — slower to change, but more persistent.\n\n- **Value**: Low P/E, P/B, EV/EBITDA relative to sector history excess returns documented since Graham (1934)\n- **Quality**: High and stable ROE, low accruals (balance sheet health) Piotrowski F-Score\n- **Growth**: Revenue and earnings surprise (actual > consensus estimates) positive drift for weeks post-announcement\n- **Earnings momentum**: Consecutive EPS beats predict continued outperformance (analyst anchoring)\n\nFundamental signals require careful data sourcing — using reported numbers rather than point-in-time restated figures introduces look-ahead bias.",
 highlight: [
 "OBV",
 "volume-price divergence",
 "VWAP",
 "value factor",
 "quality factor",
 "earnings surprise",
 "F-Score",
 ],
 },
 {
 type: "teach",
 title: "Alternative Data & Signal Decay",
 content:
 "**Alternative data** refers to non-traditional data sources that can provide a trading edge before public disclosure:\n\n- **Satellite imagery**: Counting cars in retail parking lots, oil inventory levels from tank shadows, crop health from spectral analysis\n- **Credit card transactions**: Real-time consumer spending by company, geofenced by store location\n- **Web traffic**: Website visits, app downloads — predictive of revenue before quarterly reports\n- **NLP on filings & transcripts**: Sentiment analysis on 10-K risk factors, earnings call transcripts (tone change predicts guidance revision)\n- **Job postings**: Hiring patterns signal expansion or contraction by product line\n- **Social media sentiment**: Retail-driven signals (r/WallStreetBets flows, Twitter sentiment) — noisy but real in some contexts\n\nAlternative data is expensive ($50K–$5M+ per dataset) and requires significant infrastructure. Edge diminishes rapidly as more firms access the same dataset.\n\n**Signal Decay**:\nHow quickly does a signal's predictive power fade over time?\n\n- Intraday signals: Decay within hours — constant recalibration needed\n- Short-term technical signals (RSI, momentum): Decay over days to weeks\n- Fundamental signals (value, quality): Persist for months to years\n- Alternative data: Varies widely; many dataset edges last 1–3 years before arbitraged away\n\nTurnover implications: fast-decaying signals require more frequent trading higher transaction costs.",
 highlight: [
 "alternative data",
 "satellite imagery",
 "credit card data",
 "NLP",
 "signal decay",
 "web traffic",
 ],
 },
 {
 type: "quiz-mc",
 question: "What is 'alternative data' in quantitative investing?",
 options: [
 "Non-traditional data sources like satellite imagery or credit card transactions",
 "Data from alternative investment vehicles like hedge funds and private equity",
 "Historical data used as an alternative to real-time feeds",
 "Simulated or synthetic data used to augment small datasets",
 ],
 correctIndex: 0,
 explanation:
 "Alternative data refers to non-traditional information sources that go beyond standard financial data (prices, fundamentals) — such as satellite imagery (counting retail parking lot cars), credit card transaction data, web traffic, job postings, and NLP analysis of regulatory filings. These sources can provide insights into company performance before quarterly reports are published. Such data is typically expensive and its edge diminishes as more market participants gain access.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "The 12-1 month momentum signal (buying past 12-month winners, excluding the last month) has been documented in numerous countries and asset classes, making it one of the most robust factors in quantitative finance.",
 correct: true,
 explanation:
 "True. The momentum factor is among the most extensively documented in academic finance, found in over 40 countries and across 200+ years of data. The exclusion of the most recent month (t-1) is intentional — it avoids the short-term reversal effect seen at the 1-month horizon. Despite its robustness, momentum is prone to sudden crashes (especially in volatile market regimes) and requires careful risk management.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A quant fund identifies a signal based on satellite imagery of shopping mall parking lots. During testing on 3 years of data, it generates a Sharpe of 1.6 with 1-week signal decay. They purchase exclusive access to the dataset for 2 years.",
 question:
 "What are the key risks and considerations the fund should evaluate before deploying capital?",
 options: [
 "Signal decay speed requires high turnover (high transaction costs); exclusivity period limits the edge lifetime; the dataset needs look-ahead-free validation; crowding risk when exclusivity expires",
 "Satellite data is illegal to use in trading — the fund should switch to traditional fundamental signals",
 "The 1-week decay means the fund should only trade monthly to reduce costs",
 "A Sharpe of 1.6 guarantees profitability regardless of signal decay or transaction costs",
 ],
 correctIndex: 0,
 explanation:
 "Key considerations: (1) 1-week signal decay implies frequent trading — transaction costs must be modeled carefully, as they can easily consume most of the edge. (2) The 2-year exclusivity window is the likely edge lifetime — once competitors access the data, alpha will compress quickly. (3) The 3-year backtest must be validated for look-ahead bias (was satellite data truly not available before they say it was?). (4) Sharpe of 1.6 in backtest may degrade OOS — walk-forward validation is essential before full deployment.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Portfolio Construction & Execution 
 {
 id: "quant-5",
 title: "Portfolio Construction & Execution",
 description:
 "Mean-variance optimization, risk parity, transaction costs, turnover, and execution algorithms",
 icon: "PieChart",
 xpReward: 100,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Mean-Variance Optimization",
 content:
 "**Modern Portfolio Theory (Markowitz, 1952)** formalizes the intuition that diversification reduces risk. The core idea: for a given expected return, we can find the portfolio with minimum variance.\n\n**The Efficient Frontier**:\nThe set of portfolios that maximize return for each level of risk (or minimize risk for each level of return). Portfolios on the frontier are called 'mean-variance efficient.'\n\n**Inputs required**:\n1. **Expected returns** vector (μ) — each asset's expected return\n2. **Covariance matrix** (Σ) — how assets move together\n\n**The optimization problem**:\nMinimize: w᷊Σw (portfolio variance)\nSubject to: w᷊μ = target return, Σwᵢ = 1\n\n**Critical limitations**:\n- **Garbage in, garbage out**: Small errors in expected return estimates cause large changes in optimal weights. The optimizer treats your return estimates as if they were perfectly accurate.\n- **Concentrated portfolios**: Without constraints, MVO often allocates most weight to 2–3 assets.\n- **Covariance instability**: Correlations spike during market crises, exactly when diversification is most needed.\n\n**Practical fixes**: Black-Litterman model (Bayesian shrinkage of return estimates toward a prior), resampled efficiency, robust optimization, adding weight constraints.",
 highlight: [
 "efficient frontier",
 "mean-variance optimization",
 "covariance matrix",
 "Modern Portfolio Theory",
 "diversification",
 "Black-Litterman",
 ],
 },
 {
 type: "teach",
 title: "Risk Parity",
 content:
 "**Risk Parity** is an alternative portfolio construction approach that explicitly focuses on risk allocation rather than capital allocation.\n\n**The core idea**: In a traditional 60/40 portfolio, ~90% of the portfolio's risk comes from the 60% equity allocation (because equities are far more volatile than bonds). Risk parity allocates equal risk to each asset, not equal capital.\n\n**Equal Risk Contribution (ERC)**:\nWeights are chosen such that each asset contributes equally to total portfolio variance:\n\nRisk Contribution_i = wᵢ × (σ/wᵢ) = Total Portfolio Risk / N\n\n**Example**: A simple risk parity portfolio between stocks (σ = 15%) and bonds (σ = 5%):\n- Stocks get weight proportional to 1/15% 6.7%\n- Bonds get weight proportional to 1/5% = 20%\n- Normalized: Stocks 25%, Bonds 75%\n\n**Leverage**: Risk parity portfolios often use leverage on bonds to bring total portfolio risk to target levels (e.g., 10% annualized volatility). This makes them sensitive to rising interest rates.\n\n**Bridgewater's All Weather**: Famous risk parity implementation — designed to perform across all economic regimes (growth/inflation combinations).\n\n**Advantage over MVO**: Less sensitive to expected return estimates; focuses on the more stable covariance structure.",
 highlight: [
 "risk parity",
 "equal risk contribution",
 "capital allocation",
 "leverage",
 "All Weather",
 "60/40 portfolio",
 ],
 },
 {
 type: "teach",
 title: "Transaction Costs & Execution Algorithms",
 content:
 "Transaction costs are the silent killer of systematic strategies. Even a strategy with a Sharpe of 1.5 gross can become unprofitable after costs at high turnover.\n\n**Components of transaction costs**:\n1. **Explicit costs**: Commissions (~$0 for retail, $0.001–0.005/share for institutions)\n2. **Bid-ask spread**: Half the spread paid on each trade. 10bp spread = 20bp round-trip.\n3. **Market impact**: For large orders, buying pushes price up, selling pushes price down. Impact σ × (Order Size / ADV) where ADV = average daily volume.\n\n**Turnover and tax drag**: High-frequency signals require frequent rebalancing higher transaction costs. For taxable accounts, short-term gains (< 1 year) are taxed at ordinary income rates. Annual turnover > 100% often becomes unprofitable after taxes.\n\n**Execution Algorithms**:\n- **VWAP (Volume-Weighted Average Price)**: Distribute order throughout the day in proportion to historical volume patterns. Goal: execute at or better than the daily VWAP.\n- **TWAP (Time-Weighted Average Price)**: Distribute order equally over time. Simpler, used when volume patterns are unknown.\n- **Implementation Shortfall**: Minimize the difference between the theoretical trade price at decision time and the actual executed price. Balances urgency vs. market impact.\n- **Arrival Price / POV**: Execute as a percentage of market volume to minimize footprint.\n\nInstitutional traders never send a 100,000-share order as a single market order — the market impact would be enormous.",
 highlight: [
 "transaction costs",
 "market impact",
 "bid-ask spread",
 "VWAP",
 "TWAP",
 "Implementation Shortfall",
 "turnover",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "What is the goal of 'risk parity' portfolio construction?",
 options: [
 "Allocate equal risk (not capital) to each asset in the portfolio",
 "Allocate equal capital to each asset, regardless of volatility",
 "Maximize the Sharpe ratio by concentrating in the highest-return assets",
 "Minimize total portfolio volatility by holding only low-risk assets",
 ],
 correctIndex: 0,
 explanation:
 "Risk parity allocates portfolio weights so that each asset contributes equally to the total portfolio risk, rather than allocating equal capital. In a traditional 60/40 portfolio, equities dominate risk (~90% of variance) despite being only 60% of capital, because equities are far more volatile than bonds. Risk parity corrects this by overweighting lower-volatility assets (bonds) and underweighting higher-volatility assets (equities), often requiring leverage to meet return targets.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "In mean-variance optimization, larger estimation errors in expected returns have a much greater impact on the resulting portfolio weights than equal-sized errors in the covariance matrix.",
 correct: true,
 explanation:
 "True. Mean-variance optimization is notoriously sensitive to expected return estimates — small changes in return assumptions can completely reshape the optimal portfolio. The covariance matrix, while also uncertain, has a more stable structure and affects portfolio weights less dramatically. This sensitivity is why the Black-Litterman model was developed: it blends investor views with an implied market equilibrium prior, preventing extreme portfolio concentrations that arise from point estimates of expected returns.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A systematic equity fund runs a monthly-rebalanced value strategy with annual turnover of 150%. The strategy has a gross Sharpe of 1.2 and average gross return of 14% per year. Estimated round-trip transaction costs are 0.25% per trade (bid-ask spread + market impact).",
 question:
 "Approximately how much do transaction costs drag on annual returns, and what does this imply about the strategy's viability?",
 options: [
 "Cost drag 1.5 × 0.25% × 2 = 0.75% per year — material but strategy remains viable; net return ~13.25% and Sharpe still healthy",
 "Cost drag 150% × 0.25% = 37.5% per year — the strategy is completely unprofitable after costs",
 "Cost drag 0.25% per year — costs are negligible relative to the 14% gross return",
 "Cost drag cannot be estimated without knowing the number of individual positions in the portfolio",
 ],
 correctIndex: 0,
 explanation:
 "With 150% annual turnover, approximately 150% of the portfolio is traded each year. At 0.25% per round-trip, cost drag 150% × 0.25% = 0.375%. Wait — turnover of 150% means 1.5 full portfolio rotations per year. Each rotation involves buying and selling, so: 1.5 × 0.25% = 0.375% roughly 0.375% drag. The strategy remains viable with net returns ~13.6% and net Sharpe slightly below 1.2. (Note: if turnover were 1,500% for a daily-rebalanced strategy, costs would be devastating at 3.75% drag.)",
 difficulty: 3,
 },
 ],
 },
 ],
};
