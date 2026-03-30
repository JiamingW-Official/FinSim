import type { Unit } from "./types";

export const UNIT_QUANT_FINANCE_ML: Unit = {
  id: "quant-finance-ml",
  title: "Quant Finance & ML",
  description:
    "Apply machine learning, NLP, alternative data, and quantitative methods to financial markets",
  icon: "Brain",
  color: "#8b5cf6",
  lessons: [
    // ─── Lesson 1: ML Fundamentals for Finance ──────────────────────────────────
    {
      id: "quant-ml-1",
      title: "ML Fundamentals for Finance",
      description:
        "Supervised learning, cross-validation pitfalls, feature engineering, and ensemble methods for stock selection",
      icon: "BarChart2",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Supervised Learning: Regression and Classification",
          content:
            "Machine learning in finance falls into two main supervised learning paradigms:\n\n**Regression** predicts a continuous output — e.g., next-day return, fair value, or volatility. A linear regression model might predict tomorrow's SPY return from lagged macro variables. Non-linear models like gradient boosting can capture interactions between features that linear models miss.\n\n**Classification** predicts a discrete outcome — e.g., will the stock close up or down tomorrow? The target label is binary: 1 (up) or 0 (down). Models output a probability, and a threshold (often 0.5) converts it to a directional call.\n\n**Common models used in finance**:\n- **Linear/Logistic regression**: interpretable baseline; good for establishing that a signal exists\n- **Gradient Boosted Trees (XGBoost, LightGBM)**: industry workhorse for tabular data; handles non-linearities and interactions\n- **Random Forests**: bagging + feature randomness; excellent for feature importance ranking\n- **Neural networks (LSTM, Transformer)**: powerful for sequence data (price history, news); data-hungry\n\n**Key difference from non-financial ML**: in most ML problems, the test set is a random hold-out. In finance, the test set must always be in the future relative to the training set — otherwise you are cheating with look-ahead bias.",
          highlight: [
            "supervised learning",
            "regression",
            "classification",
            "gradient boosting",
            "random forests",
            "LSTM",
            "look-ahead bias",
            "binary",
            "logistic regression",
          ],
        },
        {
          type: "teach",
          title: "Cross-Validation Pitfalls in Finance",
          content:
            "Standard k-fold cross-validation is **invalid for financial time series** because it randomly shuffles data — training folds will contain future data relative to validation folds, creating severe look-ahead bias.\n\n**Correct approach: Time-Series Split**\nSplit data chronologically. If you have 10 years of data:\n- Train: years 1–7, Validate: year 8, Test: years 9–10\n- Never let validation or test data appear in training\n\n**Walk-forward (expanding window) validation**:\n- Train on years 1–3, validate on year 4\n- Train on years 1–4, validate on year 5\n- ... and so on, expanding the training window each time\nThis simulates live deployment and reveals how the model degrades as market regimes change.\n\n**Purged k-fold CV**:\nEven time-series split is insufficient when features use rolling windows (e.g., 20-day momentum). Bars near the train/validation boundary share overlapping feature windows — information from the validation set leaks into training features. **Purging** removes a buffer of bars around each boundary equal to the feature lookback period. This is the gold standard for financial ML cross-validation.\n\n**Data leakage** — other sources:\n- Using a fundamental ratio calculated at quarter-end but applying it to data before the filing date\n- Survivorship bias: only training on stocks that still exist (removes all that went bankrupt or were acquired)\n- Point-in-time data: always use data as it was available at time T, not as revised/restated later",
          highlight: [
            "k-fold cross-validation",
            "time-series split",
            "walk-forward",
            "purged k-fold",
            "look-ahead bias",
            "data leakage",
            "survivorship bias",
            "point-in-time",
            "purging",
          ],
        },
        {
          type: "teach",
          title: "Feature Engineering and Overfitting",
          content:
            "**Feature engineering** — transforming raw data into signals the model can learn from — is often the most important step in financial ML.\n\n**Technical features**: lagged returns (1-day, 5-day, 21-day momentum), RSI, MACD histogram, realized volatility, volume Z-score, distance from 52-week high.\n\n**Fundamental ratios**: P/E vs sector median, earnings surprise magnitude, revenue growth acceleration, ROE trend, short interest as % of float.\n\n**Macro variables**: yield curve slope, VIX level, credit spreads, dollar index, commodity price momentum.\n\n**Overfitting** is the primary risk in financial ML. With enough features, any model can perfectly fit historical data while having zero predictive power.\n\n**Out-of-sample testing**: always evaluate final model performance on a held-out period that was never used for any decision — not hyperparameter tuning, not feature selection, not model selection. If you look at the test set multiple times, it becomes another validation set.\n\n**Walk-forward validation** quantifies how model performance degrades over time. A model with Sharpe 2.0 in-sample and 0.3 out-of-sample is heavily overfit.\n\n**Ensemble methods — Random Forests**:\nRandom forests train many decision trees on bootstrapped data subsets, each using a random feature subset. This reduces overfitting and provides **feature importance** rankings — which inputs are most predictive. In stock selection, feature importance reveals that short-term momentum (5-day return) and earnings surprise are typically the most powerful predictors.",
          highlight: [
            "feature engineering",
            "technical features",
            "fundamental ratios",
            "macro variables",
            "overfitting",
            "out-of-sample testing",
            "walk-forward validation",
            "random forests",
            "feature importance",
            "bootstrapped",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "What is the correct way to split time-series financial data for cross-validation?",
          options: [
            "Random shuffle the data and split into k equal folds",
            "Split chronologically so validation always follows training in time, optionally purging the boundary",
            "Use the most recent 20% as validation and the rest as training, selected randomly",
            "Duplicate the data and use both halves as training and validation simultaneously",
          ],
          correctIndex: 1,
          explanation:
            "Financial time-series data must be split chronologically. Standard k-fold cross-validation randomly shuffles data, which allows future data to appear in training folds — a form of look-ahead bias that produces artificially inflated performance estimates. The correct approach is a time-series split (or walk-forward validation) where the training set always precedes the validation set in time. For features with rolling lookback windows, purged k-fold CV adds a buffer zone at each boundary to prevent overlapping windows from leaking information across the split.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Survivorship bias in financial ML occurs when you train a model only on stocks that are currently trading, excluding companies that went bankrupt or were acquired.",
          correct: true,
          explanation:
            "TRUE. Survivorship bias is a critical form of data leakage in financial ML. A dataset containing only currently-traded stocks implicitly excludes all companies that failed, went bankrupt, were acquired, or were delisted — which includes many of the worst performers. This biases training data toward success stories, making any signal trained on this data appear more powerful than it actually is. Models trained on survivor-biased data will systematically overestimate returns in live trading. Always use a point-in-time universe that includes all securities that existed at each historical date.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: NLP in Finance ────────────────────────────────────────────────
    {
      id: "quant-ml-2",
      title: "Natural Language Processing in Finance",
      description:
        "Sentiment analysis, named entity recognition, FinBERT, earnings call analysis, and SEC filing text mining",
      icon: "MessageSquare",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Sentiment Analysis and NER in Finance",
          content:
            "**Natural Language Processing (NLP)** converts unstructured text into quantitative signals that can drive trading strategies.\n\n**Sentiment analysis** assigns a polarity score (positive/negative/neutral) to text:\n- **Earnings call transcripts**: management tone, word choice, hedging language → forward-looking signal\n- **SEC filings (10-K, 10-Q)**: risk factor language, MD&A tone → fundamental signal\n- **News articles and press releases**: event-driven sentiment → short-term price reaction\n- **Social media (Reddit, Twitter/X)**: retail sentiment; noisy but occasionally predictive for small-caps\n\n**Bag-of-words approach**: simple word count using financial-specific lexicons like **Loughran-McDonald** (LM dictionary), which classifies ~80,000 words as positive, negative, uncertain, litigious, strong modal, or weak modal in a financial context. General-purpose sentiment dictionaries (VADER, AFINN) perform poorly on financial text — words like 'liability' or 'cost' are negative in common usage but neutral in financial reports.\n\n**Named Entity Recognition (NER)** extracts structured information from unstructured text:\n- Company names and ticker symbols from news articles\n- Financial metrics ('revenue grew 12%', 'EPS beat by $0.08')\n- Executive names and relationships\n- Geographic entities tied to macro events\n\nThis allows automated extraction of who, what, and how much from thousands of documents per day.",
          highlight: [
            "NLP",
            "sentiment analysis",
            "earnings call transcripts",
            "SEC filings",
            "Loughran-McDonald",
            "bag-of-words",
            "named entity recognition",
            "NER",
            "10-K",
            "10-Q",
          ],
        },
        {
          type: "teach",
          title: "BERT, FinBERT, and Earnings Call Analysis",
          content:
            "**BERT (Bidirectional Encoder Representations from Transformers)** revolutionized NLP by learning deep contextual word representations. Unlike bag-of-words, BERT understands that 'not bad' is positive and distinguishes 'bank' (financial) from 'bank' (riverbank) based on context.\n\n**FinBERT** is BERT fine-tuned specifically on financial text (Reuters news, earnings call transcripts, financial reports). It significantly outperforms general BERT on financial sentiment tasks because it learns domain-specific language patterns.\n\n**Earnings call NLP — management tone shift as a leading indicator**:\nResearch shows that a shift toward more uncertain or negative language in earnings calls predicts weaker future performance even when the reported numbers beat consensus:\n- Increase in hedging words ('may', 'might', 'could') → uncertainty about guidance\n- Increase in litigious language → potential legal/regulatory headwinds\n- Decline in specific quantitative guidance → management lacks visibility\n- Analyst Q&A sentiment: executives who deflect or give vague answers to analyst questions tend to underperform\n\n**Tone shift** (comparing current call to prior quarter) is often more predictive than absolute sentiment level — a subtle worsening in language can signal deteriorating fundamentals before they appear in reported numbers.\n\n**SEC EDGAR text analysis — 10-K risk factor changes year-over-year**:\nComparison of consecutive 10-K filings using cosine similarity detects when companies quietly add new risk factors or significantly modify existing ones — changes that often precede negative events.",
          highlight: [
            "BERT",
            "FinBERT",
            "contextual word representations",
            "earnings call",
            "tone shift",
            "hedging words",
            "litigious language",
            "SEC EDGAR",
            "10-K risk factors",
            "cosine similarity",
          ],
        },
        {
          type: "teach",
          title: "Limits of NLP Signals",
          content:
            "NLP signals are powerful but have well-documented limitations that practitioners must understand:\n\n**Sycophancy and scripted language**: Management teams hire investor relations consultants who coach them on positive framing. Experienced management can maintain optimistic tone even during downturns. NLP models trained on past tone-return relationships may be fooled by this.\n\n**Numeric vs. textual divergence**: Earnings call sentiment can be positive (management emphasizes exciting growth initiatives, new products) while the actual numbers signal deterioration (margins compressing, cash flow declining). Pure NLP ignores the numbers — always combine text signals with quantitative fundamental metrics.\n\n**The sentiment is often already priced**: Large sell-side banks run similar NLP models. By the time the earnings call ends, algorithmic traders have already processed the transcript. For liquid large-cap stocks, the text signal may be arbitraged away in milliseconds.\n\n**Small-cap edge**: NLP signals tend to be more persistent for smaller, less-covered companies where fewer participants are processing the text in real time. Analyst coverage is thin and institutional attention is limited.\n\n**Sarcasm and negation**: Even FinBERT sometimes misclassifies sarcastic statements or complex multi-clause negations. Financial text often uses double negatives and qualifications that require deep context to interpret correctly.",
          highlight: [
            "scripted language",
            "numeric vs. textual divergence",
            "already priced",
            "sycophancy",
            "small-cap",
            "sarcasm",
            "negation",
            "quantitative fundamental",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Earnings call sentiment is positive but the stock drops sharply after the call. What might NLP miss?",
          options: [
            "The NLP model failed to parse the language correctly due to a technical error",
            "The actual reported numbers (margins, cash flow, guidance) deteriorated even though management tone was positive",
            "The stock market was closed during the earnings call",
            "The model did not have enough training data to analyze this specific company",
          ],
          correctIndex: 1,
          explanation:
            "NLP sentiment models analyze tone and word choice but do not directly parse the underlying numerical data. Management teams are often coached to maintain positive framing even when results are disappointing. The classic 'beat on revenue, miss on margins' scenario can produce positive overall sentiment despite deteriorating fundamentals. A complete earnings analysis requires combining NLP sentiment with quantitative metrics: EPS vs. consensus, gross margin trend, free cash flow, and forward guidance numbers. Relying on text sentiment alone misses the numeric signal, which is often what the market is actually reacting to.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "General-purpose sentiment lexicons like VADER perform just as well as finance-specific dictionaries like Loughran-McDonald on financial text.",
          correct: false,
          explanation:
            "FALSE. General-purpose sentiment dictionaries are calibrated on everyday language, where words like 'liability', 'cost', 'default', 'leverage', and 'exposure' carry negative connotations. In financial text, these words are often neutral or contextual (e.g., 'managing leverage effectively' is not negative). The Loughran-McDonald (LM) dictionary was specifically developed on SEC filings and classifies financial vocabulary according to its meaning in a financial context. Studies consistently show LM and FinBERT significantly outperform general-purpose tools on financial sentiment classification tasks.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Alternative Data ──────────────────────────────────────────────
    {
      id: "quant-ml-3",
      title: "Alternative Data",
      description:
        "Satellite imagery, credit card transactions, web scraping, app usage, and shipping data as trading signals",
      icon: "Satellite",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Satellite Imagery and Credit Card Data",
          content:
            "**Alternative data** refers to non-traditional information sources that provide investment insight before conventional data (earnings, economic reports) is released. Hedge funds spend billions of dollars acquiring these datasets for informational edge.\n\n**Satellite imagery**:\nHigh-resolution satellite images of retail store parking lots can estimate foot traffic on a daily basis, weeks before the company reports sales figures. Analysts count cars in parking lots of Walmart, Home Depot, or Tesla showrooms. Image recognition AI automates this at scale across thousands of locations.\n\nApplications:\n- Retail chains: parking lot occupancy → same-store sales estimates\n- Oil storage tanks: floating roof shadow analysis measures crude oil inventory (visible from satellite)\n- Agricultural fields: crop health from NDVI (Normalized Difference Vegetation Index) → commodity supply estimates\n- Construction sites: progress tracking → economic activity indicators\n\n**Credit card transaction data**:\nData aggregators (Earnest Research, Second Measure, Bloomberg Second Measure) purchase anonymized credit/debit card transaction data from banks or card networks. This provides real-time consumer spending at the merchant level.\n\nAdvantages: true leading indicator of revenue, available weekly (vs. quarterly earnings), granular by merchant category.\n\nEdge example: seeing a 30% spending decline at a restaurant chain three months before their earnings call provides substantial lead time to establish a short position.",
          highlight: [
            "alternative data",
            "satellite imagery",
            "parking lot",
            "foot traffic",
            "credit card transaction data",
            "leading indicator",
            "anonymized",
            "same-store sales",
            "oil storage tanks",
            "NDVI",
          ],
        },
        {
          type: "teach",
          title: "Web Scraping, App Usage, and Shipping Data",
          content:
            "**Web scraping as a leading indicator**:\nJob postings scraped from LinkedIn, Indeed, and company career pages reveal forward-looking business plans before they become public. A company aggressively hiring ML engineers suggests a product pivot toward AI. A sudden halt in hiring across all departments signals potential cost-cutting ahead of an earnings miss.\n\nKey signals:\n- **Job posting volume**: growth vs. contraction by department\n- **Skill requirements**: new technology adoption (cloud, ML, specific frameworks)\n- **Geographic expansion**: new office locations before press release\n- **Leadership hiring**: C-suite or VP searches indicate strategic shifts\n\n**App usage data**:\nMobile analytics providers (Sensor Tower, data.ai formerly App Annie) measure app download rank, active user estimates, session frequency, and engagement time. For consumer tech companies, app engagement trends are a direct proxy for product health:\n- Rising daily active users → revenue growth ahead\n- Declining retention rate → competitive pressure, user churn\n- App store rating decline → product quality issues\n\n**Shipping and logistics data**:\nAutomatic Identification System (AIS) transponders on commercial vessels broadcast location in real time. AIS data aggregators track global shipping flows:\n- Container ship congestion at major ports → supply chain disruptions\n- Bulk carrier movements → commodity demand by country\n- Tanker routes → real-time crude oil/LNG trade flows\n- Destination changes mid-voyage → sanctions enforcement or trade policy shifts",
          highlight: [
            "web scraping",
            "job postings",
            "leading indicator",
            "app usage data",
            "daily active users",
            "AIS",
            "shipping data",
            "container ships",
            "alternative data",
            "Sensor Tower",
          ],
        },
        {
          type: "teach",
          title: "Alternative Data: Edge, Costs, and Risks",
          content:
            "Alternative data can provide genuine informational edge but comes with significant costs and risks:\n\n**Costs**:\n- Premium datasets cost $500K–$5M+ per year. Satellite imagery providers, credit card data aggregators, and app analytics firms price based on exclusivity and coverage breadth.\n- Data cleaning and integration is expensive — raw alternative datasets are messy, inconsistently formatted, and require significant engineering to normalize and align with financial data.\n\n**Regulatory risk**:\n- Credit card data must be properly anonymized or it violates consumer privacy laws (GDPR, CCPA). Using material non-public information (MNPI) — even inadvertently — violates insider trading laws. Data sourced from company employees or supply chain partners with non-disclosure agreements is illegal.\n- SEC scrutiny of alternative data has increased significantly since 2020.\n\n**Signal decay**:\nAs more hedge funds adopt the same data source, the alpha erodes rapidly. Satellite parking lot data was highly alpha-generative in 2015; by 2022 it is widely used and the edge has compressed significantly.\n\n**Crowding risk**:\nWhen the same signal is used by dozens of funds and the signal reverses (e.g., unexpected weather delays or a viral event distorts foot traffic data), all funds unwind simultaneously, amplifying losses.\n\n**Best practice**: combine multiple alternative data sources with traditional fundamental analysis. No single dataset provides sustainable edge alone.",
          highlight: [
            "alternative data costs",
            "regulatory risk",
            "MNPI",
            "insider trading",
            "signal decay",
            "crowding risk",
            "GDPR",
            "CCPA",
            "alpha erosion",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Which alternative data source would best predict consumer discretionary spending in the near term?",
          options: [
            "Satellite images of corporate headquarters occupancy",
            "Anonymized credit card transaction data aggregated by merchant category",
            "AIS shipping data tracking bulk carrier routes",
            "10-K filings from consumer goods companies",
          ],
          correctIndex: 1,
          explanation:
            "Anonymized credit card transaction data provides a direct, real-time measure of consumer spending at the merchant category level (e.g., apparel, restaurants, electronics). It is a genuine leading indicator because it reflects actual purchases as they occur — weeks or months before companies report revenue in quarterly earnings. Satellite imagery is better suited to physical foot traffic at specific locations. AIS shipping data tracks trade flows and commodity demand rather than consumer spending. 10-K filings are historical documents released quarterly, providing no forward-looking edge for near-term spending prediction.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Purchasing alternative data that includes material non-public information (MNPI) sourced directly from company employees is a legal and acceptable investment research practice.",
          correct: false,
          explanation:
            "FALSE. Using material non-public information (MNPI) — regardless of how it is obtained — violates securities laws in the United States (Section 10b of the Securities Exchange Act) and similar regulations in other jurisdictions. If alternative data is sourced from company employees, supply chain partners, or any party with a fiduciary or confidentiality duty to the company, and that information has not been publicly disclosed, trading on it constitutes insider trading. Legitimate alternative data must be derived from publicly accessible sources (publicly visible satellite imagery, properly anonymized consumer data, public job listings) with legal data collection and usage rights established in the vendor contract.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Statistical Models in Finance ─────────────────────────────────
    {
      id: "quant-ml-4",
      title: "Statistical Models in Finance",
      description:
        "ARIMA, GARCH, cointegration, PCA, and Hidden Markov Models for regime detection",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "ARIMA and GARCH: Time Series Models",
          content:
            "**ARIMA (AutoRegressive Integrated Moving Average)** is the foundational time series forecasting model.\n\nThree components:\n- **AR(p) — AutoRegressive**: today's value is a linear combination of the last p values. Captures momentum and mean-reversion in levels.\n- **I(d) — Integrated**: the number of times the series must be differenced to become stationary. Most financial return series are already I(0) — stationary. Price levels are typically I(1) — need one difference (returns = first difference of log prices).\n- **MA(q) — Moving Average**: today's value depends on the last q forecast errors. Captures how shocks persist over time.\n\nARIMA notation: ARIMA(p, d, q). For daily stock returns, ARIMA(1, 0, 1) is a common starting point. **ACF and PACF** plots guide parameter selection.\n\n**GARCH (Generalized AutoRegressive Conditional Heteroskedasticity)** models time-varying volatility.\n\nKey observation: financial return volatility is not constant. It **clusters** — periods of high volatility tend to be followed by more high volatility (and vice versa). The classic GARCH(1,1) model:\nσ²_t = ω + α·ε²_(t-1) + β·σ²_(t-1)\n\nwhere σ²_t is today's variance, ε²_(t-1) is yesterday's squared return (news), and σ²_(t-1) is yesterday's variance (persistence). The **persistence parameter** (α + β) close to 1 means shocks are long-lived. GARCH is essential for options pricing, VaR calculation, and risk management.",
          highlight: [
            "ARIMA",
            "AutoRegressive",
            "Integrated",
            "Moving Average",
            "stationary",
            "GARCH",
            "volatility clustering",
            "GARCH(1,1)",
            "persistence parameter",
            "ACF",
            "PACF",
          ],
        },
        {
          type: "teach",
          title: "Cointegration and PCA",
          content:
            "**Cointegration** is the statistical foundation for pairs trading (covered in the Quant Strategies unit). Key tools:\n\n**Augmented Dickey-Fuller (ADF) test**: tests whether the spread between two securities is stationary. Null hypothesis: the spread has a unit root (non-stationary). Rejecting H₀ (p < 0.05) implies stationarity — the pair is cointegrated.\n\n**Error Correction Model (ECM)**: once cointegration is established, the ECM describes how each security adjusts toward the long-run equilibrium when the spread diverges. The speed of adjustment coefficient (−0 to −1) determines how quickly prices converge.\n\n**Johansen test**: extends cointegration testing to multiple securities simultaneously, useful for basket trades involving 3+ assets.\n\n**PCA (Principal Component Analysis)** for factor extraction:\nGiven a returns matrix of N stocks × T time periods, PCA extracts orthogonal factors that explain the maximum variance:\n- **PC1** typically explains 30–50% of variance in equity returns — this is the market (beta) factor\n- **PC2, PC3** often correspond to sector or style factors (growth vs. value, large vs. small cap)\n- **Residuals** after removing the first 3–5 PCs represent idiosyncratic return — what stat arb strategies seek to exploit\n\nPCA is used to **neutralize factor exposure** in long-short portfolios: by constraining the portfolio to have zero loading on the first K PCs, the portfolio is market- and factor-neutral, isolating pure alpha.",
          highlight: [
            "cointegration",
            "ADF test",
            "Augmented Dickey-Fuller",
            "stationarity",
            "error correction model",
            "Johansen test",
            "PCA",
            "principal component analysis",
            "factor extraction",
            "factor-neutral",
          ],
        },
        {
          type: "teach",
          title: "Hidden Markov Models for Regime Detection",
          content:
            "**Hidden Markov Models (HMMs)** are probabilistic models that assume a system transitions between a finite number of unobserved (hidden) states, each generating observable data with different statistical properties.\n\nIn finance, the hidden states represent **market regimes**:\n- **Bull regime**: positive drift, low volatility (e.g., μ = +0.05%/day, σ = 0.8%)\n- **Bear regime**: negative drift, high volatility (e.g., μ = −0.12%/day, σ = 2.1%)\n- **Sideways/transition regime**: near-zero drift, moderate volatility\n\n**How HMMs work**:\n1. The model is trained on historical return data using the **Baum-Welch algorithm** (EM algorithm for HMMs)\n2. Given current observed returns, the **Viterbi algorithm** decodes the most likely sequence of hidden states\n3. The **forward algorithm** computes the probability of currently being in each regime\n\n**Trading application**:\n- In a bull regime: apply trend-following strategies, reduce hedges, increase position sizing\n- In a bear regime: shift to defensive positions, increase cash allocation, tighten stops\n- Regime probability as a weighting factor for model blending: e.g., blend a momentum model (high weight in bull) with a mean-reversion model (high weight in sideways)\n\n**Limitation**: HMMs are prone to regime detection lag — they identify regime shifts retrospectively. A Kalman filter or online learning variant can reduce this lag for real-time applications.",
          highlight: [
            "Hidden Markov Models",
            "HMM",
            "market regimes",
            "bull regime",
            "bear regime",
            "Baum-Welch algorithm",
            "Viterbi algorithm",
            "regime detection",
            "Kalman filter",
            "transition probability",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Two stocks have a correlation of 0.85 but are NOT cointegrated as confirmed by the ADF test. Can you profitably pairs trade them?",
          options: [
            "Yes, high correlation is sufficient for pairs trading — cointegration testing is optional",
            "No, without cointegration there is no statistical guarantee the spread will revert, making long-term convergence unreliable",
            "Yes, but only during high-volatility regimes when spreads are wide",
            "No, pairs trading requires a correlation above 0.95 to work",
          ],
          correctIndex: 1,
          explanation:
            "Cointegration, not correlation, is the statistical requirement for pairs trading. Correlation measures short-term co-movement but does not guarantee that the spread between two securities will revert to a long-run mean. Non-cointegrated pairs can have high correlation due to both trending upward simultaneously (a spurious correlation). Without cointegration, the spread can diverge permanently — you may go short an expensive stock and long a cheap one only to see the divergence widen indefinitely. The ADF test on the spread is the correct tool for determining whether pairs trading is statistically justified.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "GARCH models are primarily used to forecast the direction (up or down) of future stock returns.",
          correct: false,
          explanation:
            "FALSE. GARCH models forecast volatility (the magnitude of future price fluctuations), not the direction of returns. The GARCH model captures volatility clustering — the empirical observation that high-volatility periods tend to be followed by more high-volatility periods. Its output is a conditional variance forecast σ²_t. This is used in options pricing (dynamic hedging and implied volatility modeling), Value-at-Risk calculations, and risk-adjusted position sizing. Return direction forecasting is a separate task addressed by models like ARIMA, machine learning classifiers, or factor models.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 5: Algorithmic Execution & Market Impact ─────────────────────────
    {
      id: "quant-ml-5",
      title: "Algorithmic Execution & Market Impact",
      description:
        "Alpha decay, optimal execution models, VWAP, reinforcement learning for execution, and HFT strategies",
      icon: "Zap",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Alpha Decay and the Execution Problem",
          content:
            "**Alpha decay** describes how the predictive power of a trading signal diminishes over time. A signal identified at time T is worth less at T+1, T+2, and so on as the market incorporates the information through other participants' trades and public data.\n\n**The fundamental tradeoff in execution**:\n- **Urgency**: trade quickly before the signal decays\n- **Market impact**: trading fast moves the price against you — buying aggressively pushes the price up\n\nThis creates the core execution optimization problem: **how should you spread a large order over time to minimize total execution cost?**\n\n**Market impact components**:\n1. **Temporary impact**: price reverts after your trade — caused by absorbing liquidity from the limit order book\n2. **Permanent impact**: price does not revert — the market has learned information from your trade (price discovery)\n\n**Execution shortfall (Implementation Shortfall / IS)**:\nThe difference between the decision price (price when you decided to trade) and the average execution price. IS = Market Impact + Timing Risk + Opportunity Cost.\n\n**Urgency spectrum**:\n- **High-urgency signal** (short alpha half-life, e.g., 30 minutes): trade aggressively now, accept high market impact\n- **Low-urgency signal** (long alpha half-life, e.g., 5 days): spread execution over hours or days to minimize impact",
          highlight: [
            "alpha decay",
            "market impact",
            "temporary impact",
            "permanent impact",
            "execution shortfall",
            "implementation shortfall",
            "urgency",
            "timing risk",
            "opportunity cost",
            "alpha half-life",
          ],
        },
        {
          type: "teach",
          title: "Optimal Execution: Almgren-Chriss and VWAP",
          content:
            "**Almgren-Chriss (AC) model** (2000) is the foundational framework for optimal execution. It frames execution as a mean-variance optimization problem:\n\nMinimize: E[Cost] + λ × Var[Cost]\n\nwhere λ is the risk aversion parameter (how much the trader weighs variance of execution cost vs. expected cost).\n\n**Key result**: the optimal trading trajectory is deterministic and front-loaded. Trade faster early when the remaining position is large (to avoid timing risk) and slow down as the position shrinks. The exact shape depends on the ratio of temporary to permanent impact and the alpha decay rate.\n\n**Practical outputs of AC**:\n- Optimal shares to trade in each time slice\n- Expected total cost (in basis points vs. decision price)\n- 95th percentile worst-case cost\n\n**VWAP (Volume-Weighted Average Price) execution**:\nA simpler, widely-used approach: participate in proportion to the historical volume curve throughout the day. If 15% of daily volume typically trades in the 10–10:30 AM window, execute 15% of the order in that window.\n\nAdvantages: easy to measure performance (benchmark against published VWAP), predictable schedule, low information leakage.\n\nDisadvantages: ignores alpha decay (treats all minutes equally), vulnerable to volume pattern changes (earnings days, macro data releases), does not adapt to real-time order book conditions.\n\n**Implementation Shortfall (IS) execution**: explicitly tries to minimize the gap between decision price and final average fill. IS algorithms are more aggressive early and adapt to real-time market conditions — preferred when alpha decays quickly.",
          highlight: [
            "Almgren-Chriss",
            "optimal execution",
            "mean-variance optimization",
            "risk aversion",
            "trading trajectory",
            "VWAP",
            "volume-weighted average price",
            "implementation shortfall",
            "volume curve",
            "alpha decay rate",
          ],
        },
        {
          type: "teach",
          title: "Reinforcement Learning for Execution and HFT",
          content:
            "**Reinforcement Learning (RL) for execution**:\nRL frames execution as a sequential decision problem. An RL **agent** observes market state (order book depth, spread, time remaining, shares remaining, intraday volatility) and takes actions (how many shares to submit, order type: limit vs. market). It receives a reward signal (negative of execution cost) after each action.\n\nAfter training on historical or simulated market data, the RL agent learns a **policy** that adapts to real-time market microstructure conditions — something static algorithms like VWAP cannot do.\n\nRL-based execution agents outperform VWAP and IS benchmarks in academic studies by 5–15 bps on average for large orders, particularly in volatile or illiquid conditions.\n\n**High-Frequency Trading (HFT)**:\nHFT firms (Virtu, Citadel Securities, Jane Street) operate at microsecond timescales. Their strategies include:\n\n- **Market making**: post bid and ask quotes continuously, earn the bid-ask spread. Manage inventory risk through dynamic hedging. Virtu famously had only one losing trading day in 1,238 consecutive days.\n- **Statistical arbitrage**: exploit tiny price discrepancies between correlated instruments across exchanges (e.g., same ETF trading on NYSE vs. CBOE)\n- **Latency arbitrage**: using co-location (servers physically located next to exchange matching engines) to react to market events microseconds before slower participants\n\n**Co-location and the latency arms race**: firms pay exchange fees to house servers in the same data center as the exchange's matching engine, reducing round-trip latency from milliseconds to microseconds. At the extreme, the distance (and thus the speed of light travel time) between a co-location server and the matching engine is measured in meters.",
          highlight: [
            "reinforcement learning",
            "RL agent",
            "policy",
            "high-frequency trading",
            "HFT",
            "market making",
            "bid-ask spread",
            "latency arbitrage",
            "co-location",
            "statistical arbitrage",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "You need to buy a position equal to 5% of a stock's average daily volume. Should you use VWAP execution or Implementation Shortfall (IS) execution?",
          options: [
            "VWAP — it always minimizes execution cost for large orders",
            "IS — because it explicitly accounts for alpha decay and front-loads execution when the signal is freshest",
            "VWAP — it has lower information leakage than IS execution",
            "Neither — a 5% ADV order is too small to require algorithmic execution",
          ],
          correctIndex: 1,
          explanation:
            "For a large order of 5% of ADV, Implementation Shortfall (IS) execution is generally preferred over VWAP when the underlying alpha signal has a meaningful decay rate. IS algorithms explicitly minimize the gap between the decision price and the final average execution price, which accounts for the cost of waiting to execute. VWAP spreads execution uniformly across the day according to historical volume patterns, ignoring the fact that signal value may decay significantly over the trading day. For a 5% ADV order, this is a material decision: front-loading execution with IS can save several basis points in alpha decay cost compared to passively following the VWAP schedule.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "In the Almgren-Chriss optimal execution framework, the optimal strategy is to execute all shares immediately at the start to avoid any timing risk.",
          correct: false,
          explanation:
            "FALSE. The Almgren-Chriss model finds a balance between trading quickly (to minimize timing risk — the risk that prices move adversely while you are still holding the position) and trading slowly (to minimize market impact — the price impact of submitting large orders). Executing everything immediately eliminates timing risk but maximizes market impact, which can be extremely costly for a 5% ADV order. The optimal trajectory is typically front-loaded but spread over time, trading more aggressively early (when the remaining position is large and timing risk is high) and slowing down toward the end. The exact schedule depends on the trader's risk aversion (λ) and the ratio of temporary to permanent market impact coefficients.",
          difficulty: 2,
        },
      ],
    },
  ],
};
