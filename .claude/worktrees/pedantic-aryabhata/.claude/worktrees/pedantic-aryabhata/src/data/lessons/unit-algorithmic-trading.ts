import type { Unit } from "./types";

export const UNIT_ALGORITHMIC_TRADING: Unit = {
 id: "algorithmic-trading",
 title: "Algorithmic Trading",
 description:
 "Build and backtest algorithmic trading strategies: momentum, mean reversion, pairs trading, machine learning signals",
 icon: "Code2",
 color: "#0ea5e9",
 lessons: [
 // Lesson 1: Momentum Strategies 
 {
 id: "algorithmic-trading-1",
 title: "Momentum Strategies",
 description:
 "Cross-sectional and time-series momentum, momentum decay, crash risk, and risk management",
 icon: "TrendingUp",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Cross-Sectional Momentum",
 content:
 "**Cross-sectional momentum** exploits the finding that assets which have outperformed their peers over the past 12 months tend to continue outperforming over the next 1–12 months.\n\n**How it works**:\n- Each month, rank all assets (e.g., 500 stocks in an index) by their **12-1 month return** — the cumulative return from 12 months ago to 1 month ago, skipping the most recent month to avoid short-term reversal\n- **Buy the top decile** (the 50 best-performing stocks) — this is the long book\n- **Short the bottom decile** (the 50 worst-performing stocks) — this is the short book\n- Hold the portfolio for one month, then rebalance\n\n**Why skip the last month?**: The most recent month (t-1 to t) exhibits short-term reversal — winners become losers briefly due to bid-ask bounce and short-term mean reversion. Skipping it removes this noise.\n\n**Academic foundation**: Jegadeesh and Titman (1993) first documented momentum in US equities — top-decile stocks outperformed bottom-decile stocks by approximately **1% per month** over 1965–1989. The effect has been replicated across 40+ countries and most asset classes.\n\n**Portfolio construction details**:\n- **Equal weighting vs volatility weighting**: vol-weighting each stock by 1/σ normalizes contribution and generally improves Sharpe ratio\n- **Sector neutrality**: requiring equal sector weights in long and short books removes sector momentum — a purer bet on stock-specific momentum\n- **Transaction costs**: monthly rebalancing generates high turnover (30–50% per month); net returns after costs are significantly lower than gross",
 highlight: [
 "cross-sectional momentum",
 "12-1 month return",
 "top decile",
 "bottom decile",
 "short-term reversal",
 "Jegadeesh and Titman",
 "1% per month",
 "vol-weighting",
 "sector neutrality",
 ],
 },
 {
 type: "teach",
 title: "Time-Series Momentum and Trend Following",
 content:
 "**Time-series momentum** (TSMOM) determines whether to be long or short an asset based solely on its own past return — not relative to other assets.\n\n**Signal rules**:\n- **Long signal**: price is above its n-month high (or 12-month return is positive) — the asset is in an uptrend\n- **Short signal**: price is below its n-month low (or 12-month return is negative) — the asset is in a downtrend\n- **Common lookback periods**: 1 month, 3 months, 6 months, 12 months; many practitioners use a combination\n\n**Key differences from cross-sectional momentum**:\n- TSMOM can be long ALL assets simultaneously if all are trending up, or short all if all are trending down\n- Cross-sectional momentum is always market-neutral (equal long and short notional)\n- TSMOM provides **trend-following diversification** across asset classes: equities, commodities, FX, fixed income\n\n**Moskowtiz, Ooi & Pedersen (2012)** studied TSMOM across 58 liquid futures contracts from 1985–2009 and found consistent positive returns: **average annual return of 1.58% per month** with a Sharpe ratio above 1.0.\n\n**Position sizing with TSMOM**:\nPractitioners typically size positions as:\n**Position = Signal × (Target Vol / Asset Vol)**\nwhere target vol is a constant (e.g., 40% annualized) and asset vol is the recent realized volatility. This means volatile assets get smaller positions — a natural risk parity approach.\n\n**Combining both approaches**: Many quant funds combine cross-sectional and time-series signals to get both relative-performance and directional-trend information.",
 highlight: [
 "time-series momentum",
 "TSMOM",
 "long signal",
 "short signal",
 "trend following",
 "market-neutral",
 "Moskowtiz, Ooi & Pedersen",
 "58 liquid futures",
 "risk parity",
 ],
 },
 {
 type: "teach",
 title: "Momentum Decay, Crash Risk, and Risk Management",
 content:
 "**Momentum decay** describes how momentum profits vary systematically over time horizons — the effect is not permanent and has a characteristic lifecycle.\n\n**Horizon profile**:\n- **1 month**: short-term reversal — past winners underperform slightly due to bid-ask bounce\n- **3–12 months**: peak momentum window — past winners strongly outperform (the classic Jegadeesh-Titman finding)\n- **3–5 years**: long-term reversal — past winners underperform as the fundamental reasons for their success fade or reverse\n\n**Momentum crashes**:\nMomentum is one of the few well-documented factors with **left-tail crash risk** — occasional catastrophic drawdowns that cannot be explained by slow mean reversion.\n\n**Famous momentum crashes**:\n- **March–May 1932**: momentum strategy lost 91% as markets reversed violently off Depression lows\n- **2009 momentum crash**: momentum lost 73% in March–May 2009 as beaten-down financial stocks rallied sharply while recent winners (defensive stocks) fell\n\n**Why crashes happen**: During market recoveries after sharp declines, the short book (recent losers = beaten-down stocks) surges the most. The long book (recent winners = defensive stocks) underperforms. This creates a double hit for momentum.\n\n**Risk management techniques**:\n- **Stop-loss rule**: close momentum positions when the portfolio drawdown exceeds 20% from its recent high — reduces crash exposure by exiting before the worst losses\n- **Bear market filter**: pause the strategy when the market is more than 10% below its 200-day moving average — avoids the reversal environment where crashes occur\n- **Volatility scaling**: reduce position sizes when market volatility spikes above historical averages — dynamically de-risks in turbulent environments",
 highlight: [
 "momentum decay",
 "short-term reversal",
 "3–12 months",
 "long-term reversal",
 "momentum crashes",
 "1932",
 "2009 momentum crash",
 "stop-loss rule",
 "bear market filter",
 "volatility scaling",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Cross-sectional momentum ranks 500 stocks monthly. The portfolio holds the top and bottom 10% (50 stocks each). What is the primary rebalancing frequency risk for this strategy?",
 options: [
 "Rebalancing monthly is too infrequent — momentum signals decay within days and the strategy misses the best entry points",
 "Monthly rebalancing generates high turnover (30–50% of the portfolio each month), creating significant transaction costs that can erode most of the gross alpha",
 "Monthly rebalancing is too frequent — 12-month momentum signals are only valid when held for the full 12-month lookback period",
 "The 500-stock universe is too small — ranking fewer stocks reduces the dispersion between winners and losers and eliminates momentum profits",
 ],
 correctIndex: 1,
 explanation:
 "Monthly rebalancing of a cross-sectional momentum portfolio generates very high turnover — typically 30–50% of the portfolio changes each month as rankings shift. Each trade incurs commissions, bid-ask spread costs, and market impact. Research shows that gross momentum returns of 1% per month can be reduced by half or more after realistic transaction costs, particularly for small-cap stocks where spreads are wider. Institutional momentum funds manage this by using larger-cap universes (lower spread costs), trading more patiently around rebalance dates, and using transaction cost models to filter low-conviction position changes.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The most recent month's return (t-1 to t) is typically included in the momentum signal formation period because it captures the strongest part of the momentum effect.",
 correct: false,
 explanation:
 "FALSE. The most recent month is typically EXCLUDED from the momentum signal formation period. Using the 12-1 month return (12 months ago to 1 month ago, skipping the last month) is standard practice. The reason: the last month exhibits short-term reversal, not continuation. Recent winners tend to underperform slightly over the very next few days to weeks due to bid-ask bounce, short-term mean reversion, and market microstructure effects. Including the last month introduces this reversal noise and reduces the Sharpe ratio of momentum strategies.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Mean Reversion Strategies 
 {
 id: "algorithmic-trading-2",
 title: "Mean Reversion Strategies",
 description:
 "Statistical arbitrage, pairs trading, cointegration tests, and structural break risk",
 icon: "ArrowLeftRight",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Cointegration and Statistical Arbitrage",
 content:
 "**Statistical arbitrage (stat arb)** exploits temporary mispricings between related securities — the relationship is expected to revert, generating profit when it normalizes.\n\n**Cointegration** is the statistical foundation:\nTwo price series X and Y are cointegrated if a linear combination (X β×Y) is stationary (mean-reverting) even though each series individually follows a random walk.\n\n**Why cointegration instead of correlation?**\nCorrelation measures whether returns move together. Cointegration measures whether price LEVELS have a long-run equilibrium. Two stocks can be highly correlated in returns (move together day-to-day) but not cointegrated (their spread drifts away permanently). For pairs trading, cointegration is what matters — it implies the spread will always come back.\n\n**Testing for cointegration**:\n- **Engle-Granger two-step test**: (1) regress X on Y to find β; (2) test the residuals (X βY) for stationarity using an Augmented Dickey-Fuller (ADF) test. If the residuals are stationary (p-value < 0.05), the pair is cointegrated.\n- **Johansen test**: more powerful multivariate test; handles multiple cointegrated vectors; preferred for pairs with non-trivial hedge ratios or multi-asset baskets\n\n**Half-life of mean reversion**:\nFit an Ornstein-Uhlenbeck (OU) model to the spread: **dS = -λ(S - μ)dt + σdW**\nThe half-life is **ln(2)/λ** — how long on average it takes the spread to revert halfway to its mean. A half-life of 5 days is tradable; 60 days is too slow for practical stat arb.",
 highlight: [
 "statistical arbitrage",
 "cointegration",
 "stationary",
 "random walk",
 "Engle-Granger",
 "Augmented Dickey-Fuller",
 "Johansen test",
 "Ornstein-Uhlenbeck",
 "half-life",
 "mean reversion",
 ],
 },
 {
 type: "teach",
 title: "Pairs Trading — Entry, Exit, and Pair Selection",
 content:
 "**Pairs trading** is the most widely implemented form of stat arb — trade the spread between two cointegrated securities based on z-score signals.\n\n**Spread construction**:\n**Spread = Price_A β × Price_B**\nwhere β (the hedge ratio) is estimated by regressing Price_A on Price_B. The spread should be stationary if the pair is cointegrated.\n\n**Entry and exit rules** (the classic Gatev, Goetzmann, Rouwenhorst approach):\n- **Compute z-score**: z = (Spread mean) / std_dev, using a rolling lookback window (typically 60 days)\n- **Enter long spread at z = -2.0**: buy A, short B — betting the spread will widen back to mean\n- **Enter short spread at z = +2.0**: sell A, buy B — betting the spread will narrow back to mean\n- **Exit at z = 0**: close both legs when spread returns to mean\n- **Stop-loss at |z| = 3.5**: if spread moves further against you, the cointegration may have broken — cut losses\n\n**Classic pair examples**:\n- **Sector pairs**: Coca-Cola (KO) / PepsiCo (PEP) — same industry, similar business models, similar macro exposures\n- **Index pairs**: SPY / QQQ — both broad market ETFs but with different sector weights (SPY more value, QQQ more tech)\n- **Cross-market pairs**: Gold futures / Gold ETF (GLD), S&P 500 futures / SPY\n\n**Risks**:\n- **Structural break**: the cointegration relationship breaks permanently — merger announcement, bankruptcy, major business model change; the pair may never revert\n- **Convergence time risk**: spread widens further before reverting — requires sufficient capital buffer to survive mark-to-market losses",
 highlight: [
 "pairs trading",
 "spread construction",
 "hedge ratio",
 "z-score",
 "enter long spread",
 "enter short spread",
 "exit at z = 0",
 "stop-loss",
 "structural break",
 "KO/PEP",
 "SPY/QQQ",
 ],
 },
 {
 type: "teach",
 title: "Capacity Constraints and Strategy Lifecycle",
 content:
 "**Capacity constraints** are one of the most important practical limitations of statistical arbitrage strategies — unlike trend following, stat arb does not scale.\n\n**Why capacity is limited**:\nStat arb works by identifying small pricing inefficiencies between related securities. When a fund places a large trade to exploit the mispricing, it moves the price toward fair value — eliminating the opportunity for itself and others. The more capital deployed, the greater the market impact, and the faster the inefficiency disappears.\n\n**Typical capacity estimates**:\n- Single-name equity pairs trading: $50M–$500M before significant alpha decay\n- ETF arbitrage strategies: $1B–$5B (more liquid underlying)\n- Futures basis strategies: $5B–$20B (very liquid markets)\n\n**Crowding risk — the August 2007 quant quake**:\nIn August 2007, quantitative equity funds simultaneously experienced large losses. The likely cause: one large fund began liquidating a major stat arb book. This pushed spreads wider, triggering stop-losses at other funds, causing cascading forced selling. Within days, a broad swathe of quant strategies lost 10–30% despite being theoretically market-neutral. The event highlighted that:\n- Many quant funds hold similar positions (correlated alpha sources)\n- Forced deleveraging can create self-reinforcing price moves\n- Strategy diversification within a fund is critical\n\n**Strategy lifecycle**: most stat arb edges last 3–7 years before they are either arbitraged away by competitors or structural changes eliminate the cointegration. Continuous research and signal replenishment are essential.",
 highlight: [
 "capacity constraints",
 "market impact",
 "alpha decay",
 "crowding risk",
 "August 2007",
 "quant quake",
 "forced deleveraging",
 "cascading",
 "market-neutral",
 "strategy lifecycle",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "KO and PEP have a cointegration test p-value of 0.02. What does this mean for pairs trading?",
 options: [
 "The pair is strongly cointegrated — there is only a 2% chance the two stocks' price spread is stationary, which means the relationship is too unstable to trade",
 "The pair is strongly cointegrated — there is only a 2% chance the spread is a random walk, meaning deviations from the mean are likely to revert",
 "The pair has a 98% correlation in daily returns, making it an ideal candidate for delta-neutral stat arb based on short-term price divergences",
 "The p-value of 0.02 indicates the pair recently experienced a structural break and the cointegration has broken down",
 ],
 correctIndex: 1,
 explanation:
 "A cointegration p-value of 0.02 means that under the null hypothesis (no cointegration — the spread is a random walk), there is only a 2% probability of observing the data. We reject the null at the 5% significance level, concluding the pair IS cointegrated. This means the price spread between KO and PEP is stationary — it has a stable long-run mean and temporary deviations are expected to revert. This is exactly the property needed for pairs trading. The conventional threshold for 'tradable' cointegration is p < 0.05, so a p-value of 0.02 is strong evidence of a meaningful and exploitable relationship.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A stat arb trader identifies a cointegrated pair of retail stocks. The spread is currently at z = +2.3 (2.3 standard deviations above its 60-day mean). The trader enters short the spread (sells the expensive stock, buys the cheap one). Over the next 2 weeks, the spread widens to z = +3.8 rather than reverting. The trader's stop-loss is at |z| = 3.5.",
 question:
 "The stop-loss was triggered at z = 3.5. What is the most likely correct interpretation of this outcome?",
 options: [
 "The stop-loss was premature — cointegration always reasserts within 30 days and waiting longer would have resulted in profit",
 "The stop-loss correctly limited losses — a z-score of 3.8 likely indicates a structural break in the cointegration, not a temporary widening",
 "The stop-loss level was set too tight — stat arb stop-losses should be at z = 10 to allow for extreme spread deviations before closing",
 "The pair was incorrectly identified — cointegrated pairs never move beyond z = 2.5, so any trade that exceeds this level is evidence of a model error",
 ],
 correctIndex: 1,
 explanation:
 "When a cointegrated spread reaches z = 3.5–4.0, it is a warning sign that the relationship may have experienced a structural break rather than a temporary widening. Common causes in retail stocks include: M&A announcement (one company being acquired), major earnings miss, guidance withdrawal, or sector-specific regulatory shock. Stop-losses in stat arb exist precisely for this scenario — to limit losses when cointegration may have permanently broken down. Waiting for reversion when cointegration has broken means holding a position that could keep moving against you indefinitely. The stop-loss at z = 3.5 was appropriate; waiting longer would likely have produced even larger losses.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Market Impact & Execution Algorithms 
 {
 id: "algorithmic-trading-3",
 title: "Market Impact & Execution Algorithms",
 description:
 "VWAP, TWAP, implementation shortfall, adaptive algorithms, and dark pool routing",
 icon: "Activity",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "VWAP and TWAP Execution Algorithms",
 content:
 "**Execution algorithms** break up large orders into smaller pieces to minimize market impact — buying or selling the full position at once would move prices adversely.\n\n**VWAP (Volume-Weighted Average Price) algorithm**:\nThe algo distributes the order proportionally to the **historical volume distribution** throughout the day.\n- Equities typically show a **U-shaped volume profile**: heavy volume at the open (price discovery after overnight news) and close (end-of-day portfolio rebalancing), light volume in the midday\n- VWAP algo buys more shares during 9:30–10:30 AM and 3:00–4:00 PM, fewer during 11:00 AM–2:00 PM\n- **Goal**: execute at or below the day's volume-weighted average price\n- **Best for**: patient, non-urgent orders where minimizing market impact versus daily average price is the primary objective\n- **Limitation**: if news breaks during the day, the scheduled pacing ignores the new information\n\n**TWAP (Time-Weighted Average Price) algorithm**:\nThe algo divides the order equally into fixed time intervals (e.g., every 5 minutes) regardless of volume.\n- Simpler and more predictable than VWAP\n- Produces a uniform execution schedule that is easy to monitor and audit\n- **Best for**: illiquid securities where historical volume patterns are unreliable or for compliance-mandated scheduled execution\n- **Limitation**: executes the same quantity in quiet midday periods and active opening/closing periods — potentially more market impact in low-volume windows",
 highlight: [
 "VWAP",
 "volume-weighted average price",
 "historical volume distribution",
 "U-shaped volume profile",
 "market impact",
 "TWAP",
 "time-weighted average price",
 "fixed time intervals",
 "illiquid",
 ],
 },
 {
 type: "teach",
 title: "Implementation Shortfall and Adaptive Algorithms",
 content:
 "**Implementation shortfall (IS)** measures the total cost of executing a trading decision — the gap between the theoretical portfolio (trading immediately at decision price) and the actual portfolio (executing over time with real costs).\n\n**Components of implementation shortfall**:\n- **Explicit costs**: commissions, taxes, exchange fees — directly measurable\n- **Market impact**: price moves against you as you execute — larger orders cause larger impact\n- **Timing risk**: adverse price drift while you are still executing — if buying, stock may rally before the order is complete\n- **Opportunity cost**: unfilled shares — if the stock moves away before the order completes, the missed shares represent a cost\n\n**IS-minimizing algorithms** (Arrival Price algorithms):\n- Trade **aggressively early** to minimize timing risk at the expense of higher market impact\n- Dynamic: adjust pacing based on real-time price movement versus the arrival price\n- If price moves favorably (stock falling when you're buying), slow down and capture more benefit\n- If price moves adversely (stock rising when you're buying), accelerate to limit further drift\n- **Best for**: alpha-decaying signals — when the signal is time-sensitive and delayed execution erodes expected alpha\n\n**Adaptive algorithms**:\n- Learn from intraday volume patterns in real time — if today's volume is running 50% above normal at 11 AM, accelerate the remaining schedule\n- Respond to bid-ask spread widening or narrowing — execute more aggressively when liquidity is abundant\n- Detect and avoid toxic order flow — pull back if tape reading suggests adverse selection\n\n**Dark pool routing**:\nLarge orders are routed to **dark pools** (private trading venues) before hitting lit exchanges:\n- Dark pools hide order size and direction — reduce information leakage\n- No pre-trade transparency: traders cannot see the dark pool order book\n- Execution at mid-price (no bid-ask spread) if a match is found — price improvement vs exchange\n- Downside: execution is not guaranteed; if no match found, order must go to lit market",
 highlight: [
 "implementation shortfall",
 "explicit costs",
 "market impact",
 "timing risk",
 "opportunity cost",
 "arrival price",
 "alpha-decaying signals",
 "adaptive algorithms",
 "dark pools",
 "information leakage",
 "mid-price",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Why does a large order executing all at once result in a worse average price than a VWAP algorithm that spreads the same order over the full trading day?",
 options: [
 "A single large order triggers exchange circuit breakers that temporarily halt trading and impose penalties, raising the effective execution price",
 "A single large order creates sudden excess demand (or supply) that moves prices against the trader — market impact — whereas VWAP spreads the demand over many transactions, each too small to materially move the market",
 "VWAP algorithms access after-hours liquidity unavailable to single market orders, allowing execution at better overnight prices",
 "Single large orders are prohibited by SEC Regulation NMS for retail-sized accounts — only algorithmic execution is permitted above 10,000 shares",
 ],
 correctIndex: 1,
 explanation:
 "Market impact is the core reason large orders execute at worse prices than algorithmically spread orders. When a buy order for 500,000 shares hits the market at once, it exhausts available sell orders at the current price, forcing the algorithm to buy at progressively higher prices as it moves up the order book. The Almgren-Chriss model shows that market impact grows roughly with the square root of order size relative to daily volume — a very large order can move the price by dozens of basis points. VWAP algorithms avoid this by breaking the order into hundreds of small child orders, each representing a tiny fraction of market volume — too small to materially affect prices. The total cost is dramatically lower even after accounting for the risk of adverse price drift during execution.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Dark pools provide price improvement over exchange execution because they guarantee execution at the midpoint of the bid-ask spread with zero market impact.",
 correct: false,
 explanation:
 "FALSE. Dark pools offer the POTENTIAL for midpoint execution (no bid-ask spread cost) and reduced information leakage, but they do NOT guarantee execution. Dark pools match buyers and sellers anonymously — if no counterparty is available, the order is not filled and must be routed to a lit exchange. Additionally, dark pools are not entirely free of market impact for very large orders; when a large buyer repeatedly hits the same dark pool, sophisticated participants may detect the pattern and trade ahead. Regulators have also raised concerns about predatory practices in certain dark pools. The correct characterization: dark pools potentially improve execution for large patient orders, but provide no guarantees.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Machine Learning Trading Signals 
 {
 id: "algorithmic-trading-4",
 title: "Machine Learning Trading Signals",
 description:
 "Feature engineering, prediction targets, train/test splits, SHAP values, and ensemble methods",
 icon: "BrainCircuit",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Feature Engineering for ML Trading Models",
 content:
 "**Feature engineering** — constructing informative input variables for machine learning models — is the most important and difficult part of building ML trading signals.\n\n**Return-based features**:\n- **Lagged returns**: returns at multiple lookback windows (1-day, 5-day, 21-day, 63-day, 252-day) — capture momentum at different horizons\n- **Return autocorrelation**: correlation of today's return with returns at various lags — tests whether short-term reversal or continuation is present\n- **Rolling volatility**: realized volatility over 20 or 60 days — high-vol environments behave differently from low-vol environments\n\n**Volume-based features**:\n- **Volume ratio**: today's volume divided by 20-day average volume — unusually high volume often precedes directional moves\n- **Amihud illiquidity ratio**: |return| / dollar volume — measures price impact per dollar traded; high ratio = illiquid, potential for larger moves\n- **OBV slope**: trend in on-balance volume — divergence from price trend is a predictive signal\n\n**Fundamental ratios**:\n- **Earnings yield** (inverse P/E), **book-to-market**, **free cash flow yield** — classic value signals\n- **Earnings revision**: analyst estimate changes over 30/60 days — strong predictor of near-term price direction\n- **Revenue surprise**: actual vs consensus at earnings — how much did the company beat/miss\n\n**Sentiment features**:\n- **Short interest ratio** (days to cover): rising short interest often precedes price declines\n- **Options skew**: implied vol of puts vs calls — high skew suggests institutional hedging or bearish positioning\n- **News sentiment scores**: NLP-derived sentiment from SEC filings, earnings calls, news articles\n\n**Feature normalization**: standardize all features to z-scores within rolling windows to ensure stationarity and comparability across securities with different price levels.",
 highlight: [
 "feature engineering",
 "lagged returns",
 "rolling volatility",
 "volume ratio",
 "Amihud illiquidity",
 "OBV slope",
 "earnings revision",
 "revenue surprise",
 "short interest ratio",
 "options skew",
 "news sentiment",
 "z-scores",
 ],
 },
 {
 type: "teach",
 title: "Prediction Targets, Time-Series Splits, and Overfitting",
 content:
 "**Prediction target selection** determines what the model tries to predict — the choice has profound implications for strategy viability.\n\n**Common prediction targets**:\n- **1-day forward return**: highest signal-to-noise challenge; returns are noisy at daily frequency; requires very large datasets to find reliable patterns; transaction costs eat most or all of gross returns for most models\n- **5-day forward return**: better balance of signal quality vs turnover; predictable patterns from earnings revision cycles and institutional order flows are visible at this horizon\n- **21-day forward return**: stronger signal-to-noise; slower strategies with lower turnover; more capacity; more competition from fundamental investors\n\n**The look-ahead bias trap**:\nThe most common (and fatal) ML backtesting mistake: using future information in the feature construction or training. Examples of look-ahead bias:\n- Using end-of-day accounting data that was only published 45 days later\n- Training on data from the future test period (data leakage)\n- Normalizing features using the full-sample mean instead of rolling mean\n\n**Proper time-series cross-validation**:\n- Never use random train/test splits — future data must never appear in the training set\n- **Walk-forward validation**: train on years 1–5, test on year 6; then train on years 1–6, test on year 7; repeat\n- Maintain a **gap** between train and test periods equal to the holding period to prevent label overlap\n- Keep a completely held-out final test set that is never used for model selection or hyperparameter tuning\n\n**Overfitting detection**:\n- Compare in-sample vs out-of-sample Sharpe ratio — significant degradation (> 50%) suggests overfitting\n- Fewer features tend to generalize better — the curse of dimensionality is severe in financial data\n- Regularization (L1/L2 penalties, max tree depth) reduces overfitting in non-linear models",
 highlight: [
 "prediction target",
 "1-day forward return",
 "21-day forward return",
 "look-ahead bias",
 "data leakage",
 "walk-forward validation",
 "gap",
 "overfitting",
 "out-of-sample Sharpe",
 "regularization",
 ],
 },
 {
 type: "teach",
 title: "SHAP Values, XGBoost, and Ensemble Methods",
 content:
 "**Ensemble methods** — combining predictions from multiple models — generally outperform any single model in financial prediction tasks due to their robustness.\n\n**XGBoost (Extreme Gradient Boosting)**:\n- Builds an ensemble of decision trees sequentially, each correcting the errors of the previous\n- Handles non-linear relationships, feature interactions, and missing data natively\n- Built-in regularization prevents overfitting\n- **Practical advantage**: works well with tabular financial data without extensive preprocessing\n- **Weakness**: still needs large sample sizes; works best with 10,000+ training samples\n\n**Random Forest**:\n- Builds many decision trees independently, each trained on a bootstrap sample with random feature subsets\n- Averages predictions — reduces variance without significantly increasing bias\n- More robust to outliers than gradient boosting\n- Provides built-in feature importance estimates\n\n**SHAP (SHapley Additive exPlanations) values**:\nSHAP values decompose each model prediction into the contribution of each feature:\n**Prediction = base value + SHAP(feature_1) + SHAP(feature_2) + ...**\n- For any single trade, SHAP shows WHY the model predicted a positive or negative return — which features were most influential\n- **Global feature importance**: average |SHAP| values across all predictions shows which features drive the model overall\n- **Practical use**: if earnings revision consistently has the highest SHAP magnitude, the model is essentially an earnings revision strategy with adjustments — helps validate or challenge model logic\n- **Interaction effects**: SHAP interaction plots reveal when feature A is only predictive given a certain level of feature B\n\n**Why ensembles outperform single models in finance**: financial data is noisy, non-stationary, and has low signal-to-noise ratios. Ensembles reduce variance without much bias increase, making them more stable across different market regimes.",
 highlight: [
 "ensemble methods",
 "XGBoost",
 "gradient boosting",
 "random forest",
 "bootstrap sample",
 "SHAP values",
 "SHapley Additive exPlanations",
 "feature importance",
 "interaction effects",
 "non-stationary",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "An ML model predicts 1-day forward stock returns. On the held-out test set, it achieves 53% accuracy (correctly predicts the direction of next-day returns 53% of the time). Is this performance good for trading?",
 options: [
 "No — 53% accuracy is barely above random chance (50%) and is statistically indistinguishable from noise; no trading edge exists",
 "Yes — 53% accuracy is highly significant; a 3-percentage-point edge over random would compound to 10× returns within a year of daily trading",
 "It depends on the size of average wins vs losses, transaction costs, and whether the edge persists over time — raw accuracy alone is insufficient to evaluate a trading signal",
 "No — ML models are not suitable for daily return prediction; only weekly or monthly models with accuracy above 60% can be profitably traded",
 ],
 correctIndex: 2,
 explanation:
 "53% accuracy sounds modest but the real question is whether it generates profit after costs. Key considerations: (1) Accuracy alone is incomplete — if the 53% correct calls are on small moves and the 47% wrong calls are on large moves, the strategy loses money. Precision × average win vs recall × average loss matters. (2) Transaction costs: a 3% edge in directional accuracy on $100 stocks translates to ~$0.03 per share expected value, but a round-trip commission plus bid-ask spread could be $0.10–$0.20 on a liquid stock — eliminating the edge entirely. (3) Statistical significance: over 252 trading days, a 53% accuracy rate requires a z-test to confirm it is not due to sampling variability. (4) Out-of-sample stability: does accuracy remain 53% in subsequent periods, or does it degrade? A 53% model CAN be highly profitable if the wins are large, costs are controlled, and the edge is stable — but raw accuracy alone tells us very little.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Using a random 80/20 train/test split is an acceptable approach for evaluating a machine learning model that predicts future stock returns.",
 correct: false,
 explanation:
 "FALSE. Random splits are fundamentally inappropriate for time-series financial data. A random split mixes past and future data — the test set may contain data from years before some of the training data, meaning the model has effectively 'seen the future' during training. This creates severe look-ahead bias and produces wildly optimistic out-of-sample performance that will completely collapse in live trading. The correct approach is strict temporal splitting: all training data must precede all test data chronologically. Walk-forward validation (train on years 1–N, test on year N+1, advance the window, repeat) is the gold standard for financial ML evaluation. Additionally, a gap equal to the prediction horizon should separate train and test periods to prevent label leakage.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 5: High-Frequency Trading Strategies 
 {
 id: "algorithmic-trading-5",
 title: "High-Frequency Trading Strategies",
 description:
 "HFT market making, statistical arbitrage, latency arbitrage, colocation, and regulation",
 icon: "Zap",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "HFT Market Making and Statistical Arbitrage",
 content:
 "**High-frequency trading (HFT)** refers to automated trading strategies that execute thousands to millions of orders per day, holding positions for milliseconds to seconds.\n\n**Legitimate HFT: electronic market making**\nThe most common and economically beneficial form of HFT:\n- Post both a **bid** (buy price) and an **ask** (sell price) simultaneously, earning the bid-ask spread on each round trip\n- Example: post bid at $100.00, ask at $100.01 for 1,000 shares. If both sides fill, gross profit = $0.01 × 1,000 = $10\n- HFT market makers provide **continuous liquidity** — without them, investors would pay wider spreads\n- **Profit source**: bid-ask spread × volume. At $0.01 spread and 10 million shares/day, daily gross = $100,000 — but costs (adverse selection, technology, risk) are substantial\n- **Adverse selection risk**: when a large informed trader hits the HFT's quote, the HFT sells to someone with better information — inventory accumulates on the wrong side\n- HFT market makers manage adverse selection using **inventory management** (skew quotes when long too much) and **toxicity detection** (widen spreads when order flow appears informed)\n\n**HFT statistical arbitrage**:\n- Exploit micro-level pricing discrepancies between related instruments at microsecond speed\n- **ETF vs components**: if an ETF trades at a slight premium to its net asset value, buy the component basket and short the ETF (or vice versa) — this is the primary mechanism that keeps ETF prices aligned with NAV\n- **Futures vs spot**: S&P 500 futures should trade at fair value relative to the index spot price; any deviation is arbitraged instantly by HFT firms\n- **Exchange arbitrage**: same stock trades on NYSE and NASDAQ — tiny price differences exist briefly; HFT arbitrageurs eliminate them within microseconds",
 highlight: [
 "high-frequency trading",
 "HFT",
 "market making",
 "bid-ask spread",
 "continuous liquidity",
 "adverse selection",
 "inventory management",
 "toxicity detection",
 "ETF vs components",
 "net asset value",
 "futures vs spot",
 "exchange arbitrage",
 ],
 },
 {
 type: "teach",
 title: "Latency Arbitrage, Colocation, and Manipulative Practices",
 content:
 "**Latency arbitrage** exploits the speed advantage of faster traders over slower traders — not a pricing inefficiency between instruments, but a race to react to new information first.\n\n**How latency arbitrage works**:\n1. Exchange A publishes a price update (e.g., SPY quote changes)\n2. The fast HFT firm's signal reaches Exchange B in 1 microsecond\n3. The slow institutional trader's signal reaches Exchange B in 10 microseconds\n4. In the 9-microsecond window, the HFT firm transacts against the institutional trader's stale limit orders at Exchange B\n5. The institutional trader is **picked off** — trading at a price that no longer reflects current market conditions\n\n**Colocation**:\nHFT firms pay exchanges to physically place their servers in the exchange's data center — minimizing the distance (and therefore time) for signals to travel. A server 1 meter from the matching engine communicates faster than one 1 kilometer away. Colocation fees can reach **$500,000–$2M per year** per exchange. This creates a tiered market where better-funded participants can pay for speed advantages.\n\n**Manipulative HFT practices (illegal)**:\n- **Quote stuffing**: flooding an exchange with massive volumes of orders and cancellations to slow down competitors' systems and gain a latency advantage\n- **Layering**: placing large visible orders on one side to create a false impression of supply/demand, then canceling them once other traders react — manipulates price to benefit existing positions\n- Both practices are violations of SEC Rule 10b-5 and CFTC anti-manipulation rules; firms have been fined hundreds of millions of dollars\n\n**Controversy**: Critics (e.g., Michael Lewis in *Flash Boys*) argue latency arbitrage is a form of front-running that systematically disadvantages institutional investors. Defenders argue HFT market makers dramatically reduced bid-ask spreads for retail investors — average spreads fell 80% after HFT proliferation.",
 highlight: [
 "latency arbitrage",
 "picked off",
 "stale limit orders",
 "colocation",
 "matching engine",
 "quote stuffing",
 "layering",
 "SEC Rule 10b-5",
 "Flash Boys",
 "Michael Lewis",
 "bid-ask spreads",
 ],
 },
 {
 type: "teach",
 title: "HFT Regulation and Industry Structure",
 content:
 "**HFT regulation** has evolved significantly since the 2010 Flash Crash and subsequent market structure debates.\n\n**Key US regulations**:\n- **SEC Rule 15c3-5 (Market Access Rule, 2011)**: requires broker-dealers to have pre-trade risk controls before orders reach exchanges — prevents runaway algorithms from submitting unlimited orders; requires credit and capital limits at the order level\n- **FINRA supervision requirements**: firms running HFT strategies must have robust risk management, supervisory systems, and documented controls over algorithmic trading\n- **SEC Reg SCI (Systems Compliance and Integrity, 2014)**: large market participants must test their trading systems for vulnerabilities, maintain business continuity plans, and report technology failures\n\n**European regulation — MiFID II (2018)**:\n- Requires HFT firms to register specifically as HFT traders with national regulators\n- Mandates robust risk controls and annual review of algorithmic strategies\n- Requires firms to have the ability to cancel all outstanding orders instantly (**kill switch** requirement)\n- Restricts payment for order flow (PFOF) — affects how retail brokers route orders\n\n**Industry structure**:\nTop HFT firms by estimated volume share:\n- **Citadel Securities**: largest US equity market maker; accounts for 20–25% of all US equity volume\n- **Virtu Financial**: publicly traded HFT firm; disclosed it lost money on only 1 trading day in 6 years (2008–2013)\n- **Jane Street**: dominant in ETF market making globally\n- **IMC Trading**, **Flow Traders**: European-based HFT market makers\n\n**Flash Crash (May 6, 2010)**: Dow Jones fell 1,000 points in minutes before recovering; caused partly by a large institutional sell algorithm triggering HFT liquidity withdrawal. Led to creation of **limit-up/limit-down circuit breakers** now applied to individual stocks.",
 highlight: [
 "SEC Rule 15c3-5",
 "Market Access Rule",
 "FINRA",
 "Reg SCI",
 "MiFID II",
 "kill switch",
 "Citadel Securities",
 "Virtu Financial",
 "Jane Street",
 "Flash Crash",
 "2010",
 "circuit breakers",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "An HFT firm has a 1-microsecond latency advantage over competitors and makes 10,000 trades per day, earning an average profit of $0.10 per trade. What is the estimated daily profit?",
 options: [
 "$100 — the 1-microsecond advantage only enables a handful of profitable arbitrage opportunities per day, not 10,000",
 "$1,000 — the 1-microsecond advantage generates 10 profitable opportunities per trade on average",
 "$1,000 per day — 10,000 trades × $0.10 profit per trade = $1,000",
 "$1,000,000 — each microsecond of latency advantage is worth approximately $100 in daily profit at institutional scale",
 ],
 correctIndex: 2,
 explanation:
 "10,000 trades per day × $0.10 profit per trade = $1,000 per day. This is straightforward arithmetic: $0.10 × 10,000 = $1,000. Annually, this equals approximately $252,000 (252 trading days). This example illustrates how HFT profitability comes from tiny per-trade profits multiplied by extremely high trade volume. In practice, leading HFT firms execute millions (not thousands) of trades per day with per-trade profits measured in fractions of a cent — Virtu Financial's disclosed financials show annual revenues of $1–3 billion from this approach. The key insight is that the 1-microsecond latency advantage enables the firm to capture these small but consistent per-trade edges repeatedly across thousands of opportunities.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A new HFT firm wants to start a latency arbitrage strategy between NYSE and NASDAQ. They calculate that without colocation, their latency is 8 milliseconds. Competitors using colocation have 0.5 millisecond latency. Colocation at both exchanges costs $1.5M per year. The firm estimates the strategy generates $3M gross annually without colocation (based on identified price discrepancies), but latency-faster competitors currently capture 90% of the opportunity.",
 question:
 "Should the firm pay for colocation to compete in latency arbitrage?",
 options: [
 "Yes — paying $1.5M to capture most of the $3M opportunity (net $1.5M gain) is clearly profitable, assuming the analysis is correct",
 "No — colocation is only legally permitted for exchanges, not for trading firms; regulators prohibit private firms from colocating servers",
 "Yes, but only if competitors do not also upgrade their infrastructure, which would compress the profit opportunity further",
 "No — the math shows that even with colocation, capturing 90% of $3M gross minus $1.5M colocation costs yields only $1.2M, which is insufficient for a new firm's overhead",
 ],
 correctIndex: 0,
 explanation:
 "Without colocation, the firm captures only 10% of $3M = $300K gross. After paying $1.5M for colocation and moving to competitive latency, it might capture 50–70% of the $3M opportunity = $1.5M–$2.1M gross. Net of the $1.5M colocation cost: $0–$600K net — a marginal or positive outcome. However, the analysis in option A is directionally correct: IF colocation allows capturing the majority of the opportunity, the $1.5M cost is well worth it. Option C raises a valid secondary concern — competitors may also upgrade, compressing profits — but this doesn't change the fundamental math shown in option A. In practice, latency arbitrage has become highly competitive and margins have compressed dramatically; most of the easy profits were captured by 2010–2015.",
 difficulty: 3,
 },
 ],
 },
 ],
};
