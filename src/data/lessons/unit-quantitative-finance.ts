import type { Unit } from "./types";

export const UNIT_QUANTITATIVE_FINANCE: Unit = {
  id: "quantitative-finance",
  title: "Quantitative Finance",
  description:
    "Statistical foundations, time series analysis, factor models, risk measurement, and algorithmic strategy construction",
  icon: "BarChart2",
  color: "#0ea5e9",
  lessons: [
    /* ================================================================
       LESSON 1 — Statistical Foundations for Trading
       ================================================================ */
    {
      id: "quant-1",
      title: "Statistical Foundations for Trading",
      description:
        "Mean, std, skewness, kurtosis, fat tails, Sharpe ratio math, and information ratio",
      icon: "Activity",
      difficulty: "advanced",
      duration: 20,
      xpReward: 95,
      steps: [
        {
          type: "teach",
          title: "Descriptive Statistics of Return Distributions",
          content:
            "Every asset has a **return distribution** — the full picture of how its returns are spread over time. Four moments describe this distribution completely.\n\n**Mean (μ)**: The average daily/monthly/annual return. For a series r₁, r₂, …, rₙ:\nμ = (1/n) × Σrᵢ\n\n**Standard deviation (σ)**: Measures how spread out returns are around the mean — this is the standard proxy for risk.\nσ = √[(1/(n−1)) × Σ(rᵢ − μ)²]\n\n**Example**: A stock with daily μ = 0.05% and σ = 1.2% has an annualised return of ~12.6% (×252 trading days) and annualised volatility of ~19% (×√252).\n\n**Skewness**: Measures asymmetry of the distribution.\n- **Positive skew**: Long right tail — most returns cluster slightly below average, but occasional large positive outliers (lottery stocks, venture-style payoffs)\n- **Negative skew**: Long left tail — most returns are modestly positive, but occasional large crashes. **Most equity strategies have negative skew** — 'picking up pennies in front of a steamroller.'\n\n**Kurtosis**: Measures tail thickness. Normal distribution has kurtosis = 3. **Excess kurtosis = kurtosis − 3.**\n- Positive excess kurtosis ('fat tails'): More extreme observations than a normal distribution predicts. Daily equity returns typically have excess kurtosis of 5–10×.",
          highlight: [
            "mean",
            "standard deviation",
            "skewness",
            "kurtosis",
            "fat tails",
            "return distribution",
          ],
        },
        {
          type: "teach",
          title: "Fat Tails and the Limits of the Normal Distribution",
          content:
            "Finance theory often assumes returns are **normally distributed** (the 'bell curve'). This assumption is both mathematically convenient and dangerously wrong.\n\n**The normal distribution predicts**:\n- A 3-sigma daily move should happen once every ~3 years (0.3% probability)\n- A 5-sigma move should happen once every ~14,000 years\n- A 10-sigma move should be essentially impossible\n\n**Reality**: The S&P 500 has experienced multiple 5-sigma or greater daily moves in every decade. Black Monday 1987 (-22% in one day) was a ~25-sigma event under the normal distribution — theoretically impossible.\n\n**Fat-tailed distributions used in practice**:\n- **Student's t-distribution**: Heavier tails; parametrised by degrees of freedom ν (lower ν = fatter tails)\n- **Stable Paretian distributions**: Allow for infinite variance\n- **Historical simulation**: Use the actual empirical distribution rather than assuming a form\n\n**Why this matters for trading**: Risk models built on normality will systematically underestimate tail risk. Value-at-Risk (VaR) models assuming normality failed catastrophically in 2008. Fat tails mean you should always size positions as if the worst historical loss can be exceeded.",
          highlight: [
            "normal distribution",
            "fat tails",
            "sigma move",
            "Student's t-distribution",
            "tail risk",
            "historical simulation",
          ],
        },
        {
          type: "teach",
          title: "Sharpe Ratio and Information Ratio",
          content:
            "**The Sharpe Ratio** is the single most widely used risk-adjusted performance metric.\n\nSharpe = (Rₚ − Rƒ) / σₚ\n\nWhere Rₚ = portfolio return, Rƒ = risk-free rate, σₚ = portfolio standard deviation.\n\n**Interpretation**:\n- Sharpe < 0: Strategy loses money after the risk-free rate\n- Sharpe 0–0.5: Below average\n- Sharpe 0.5–1.0: Adequate\n- Sharpe > 1.0: Good — rare in live trading\n- Sharpe > 2.0: Exceptional — likely data-mined or short-term\n\n**Annualising**: If using daily returns, multiply numerator by 252 and denominator by √252.\n\n**Sharpe limitations**:\n1. Treats upside and downside volatility equally — penalises strategies with positive skew\n2. Assumes returns are normally distributed and i.i.d.\n3. Sensitive to the measurement period\n\n**Sortino Ratio**: Replaces σₚ with 'downside deviation' (only counts returns below the target/threshold). Better for strategies with positive skew.\nSortino = (Rₚ − Rƒ) / σ_downside\n\n**Information Ratio (IR)**: Measures consistent alpha generation relative to a benchmark.\nIR = (Rₚ − R_benchmark) / Tracking Error\nTracking Error = σ(Rₚ − R_benchmark)\n\nIR > 0.5 is good; > 1.0 is exceptional. Unlike Sharpe, IR is benchmark-relative — the right metric for active managers.",
          highlight: [
            "Sharpe ratio",
            "Sortino ratio",
            "information ratio",
            "tracking error",
            "risk-adjusted return",
            "downside deviation",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A strategy returns 18% annually with 15% annual volatility. The risk-free rate is 4%. What is its Sharpe ratio, and how would you classify this performance?",
          options: [
            "Sharpe = (18% − 4%) / 15% = 0.93 — adequate to good performance",
            "Sharpe = 18% / 15% = 1.20 — the risk-free rate is not subtracted in the Sharpe calculation",
            "Sharpe = (18% − 4%) / 15% = 1.40 — divide by half the volatility for annualised figures",
            "Sharpe = 18% / 4% = 4.50 — divide return by the risk-free rate",
          ],
          correctIndex: 0,
          explanation:
            "Sharpe = (Rₚ − Rƒ) / σₚ = (18% − 4%) / 15% = 14% / 15% = 0.93. This falls in the adequate-to-good range (0.5–1.0). The risk-free rate must be subtracted because it represents what you earn without taking any risk — the Sharpe measures the excess return per unit of risk taken.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Because daily equity returns exhibit excess kurtosis (fat tails), a Value-at-Risk model that assumes a normal distribution will systematically underestimate the probability and magnitude of extreme losses.",
          correct: true,
          explanation:
            "Normal distribution VaR underestimates tail risk because real return distributions have far more extreme events than the bell curve predicts. Under normality, a 5-sigma daily move should occur once in 14,000 years — yet markets experience them regularly. Risk models assuming normality gave false reassurance before the 2008 financial crisis and during the 1987 crash. Fat-tailed distributions (Student's t, historical simulation) produce materially larger VaR estimates for the same confidence levels.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are comparing two strategies. Strategy A: 20% return, 18% volatility, slight positive skew. Strategy B: 16% return, 10% volatility, strongly negative skew (frequent small gains, occasional large crashes). Both use a 4% risk-free rate.",
          question:
            "Which strategy has the higher Sharpe ratio, and what does the skewness consideration add to your analysis?",
          options: [
            "Strategy B has higher Sharpe (1.20 vs 0.89), but negative skew means those large crash events are undercounted in a Sharpe context — use Sortino or max drawdown analysis to get the full picture",
            "Strategy A has higher Sharpe (0.89) and is clearly superior because it also has positive skew",
            "Strategy A has higher Sharpe (1.11) due to its higher absolute return",
            "Both strategies have equal Sharpe ratios when skew is accounted for",
          ],
          correctIndex: 0,
          explanation:
            "Strategy A Sharpe: (20−4)/18 = 0.89. Strategy B Sharpe: (16−4)/10 = 1.20. Strategy B wins on Sharpe. However, Sharpe treats all volatility equally — it does not penalise negative skew. Strategy B's large crashes are just as 'bad' in Sharpe as the same-sized gains are 'good.' The Sortino ratio (which only counts downside deviation) or a max-drawdown analysis would better capture Strategy B's crash risk and might shift the comparison.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Time Series Analysis
       ================================================================ */
    {
      id: "quant-2",
      title: "Time Series Analysis",
      description:
        "Stationarity, autocorrelation, AR/MA models, random walk hypothesis, and mean reversion testing",
      icon: "TrendingUp",
      difficulty: "advanced",
      duration: 20,
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "Stationarity and Why It Matters",
          content:
            "A **time series** is stationary if its statistical properties — mean, variance, and autocorrelation structure — do not change over time.\n\n**Why stationarity matters**: Almost every statistical model (regression, ARIMA, ML models) assumes the data-generating process is stable. If the underlying distribution is shifting, parameters estimated on historical data are meaningless for future prediction.\n\n**Price levels are NOT stationary**: A stock price can wander to any positive level over time — no stable mean to revert to, and its variance grows without bound.\n\n**Returns ARE approximately stationary**: Daily log returns (ln(Pₜ/Pₜ₋₁)) are approximately mean-stationary (mean ~0 for most assets) with relatively stable variance over short to medium windows.\n\n**Log return**: r = ln(Pₜ/Pₜ₋₁) ≈ (Pₜ − Pₜ₋₁)/Pₜ₋₁ for small moves. Log returns compound additively — convenient mathematically.\n\n**Testing for stationarity**:\n- **Augmented Dickey-Fuller (ADF) test**: Tests the null hypothesis that the series has a unit root (non-stationary). Reject the null → the series is stationary.\n- **KPSS test**: Tests the null of stationarity. If both ADF rejects non-stationarity AND KPSS rejects stationarity, the series is ambiguous.\n\n**Making series stationary**: First-differencing (subtract the previous value) converts a random-walk price series to a returns series — this is standard practice.",
          highlight: [
            "stationarity",
            "log returns",
            "unit root",
            "Augmented Dickey-Fuller",
            "mean reversion",
            "first-differencing",
          ],
        },
        {
          type: "teach",
          title: "Autocorrelation and the Random Walk Hypothesis",
          content:
            "**Autocorrelation** (also called serial correlation) measures whether a time series is correlated with a lagged version of itself.\n\nAutocorrelation at lag k: ρ(k) = Corr(rₜ, rₜ₋ₖ)\n\n**What autocorrelation tells us**:\n- ρ(k) ≈ 0: Returns at time t are unrelated to returns k periods ago — consistent with market efficiency\n- ρ(k) > 0: Positive serial correlation — past up moves predict future up moves (momentum)\n- ρ(k) < 0: Negative serial correlation — past up moves predict future down moves (mean reversion)\n\n**The Random Walk Hypothesis**: In its weak form, asset prices follow a random walk — past price movements contain no information about future movements. Formally, autocorrelation at all lags is zero.\n\n**Empirical evidence**:\n- Daily stock returns: Near-zero autocorrelation (consistent with weak-form efficiency)\n- Weekly/monthly returns: Small but detectable momentum at 1–12 month horizon (positive ρ)\n- Intraday returns: Significant microstructure effects (bid-ask bounce creates negative autocorrelation at tick frequency)\n- Volatility: Strongly autocorrelated — high-volatility days cluster together (GARCH effects)\n\n**Ljung-Box Q-test**: Tests whether a group of autocorrelations at multiple lags are jointly zero. A significant result means the series has exploitable autocorrelation structure.",
          highlight: [
            "autocorrelation",
            "random walk",
            "momentum",
            "mean reversion",
            "weak-form efficiency",
            "Ljung-Box test",
          ],
        },
        {
          type: "teach",
          title: "AR/MA Models and Mean Reversion Testing",
          content:
            "**Autoregressive (AR) models** express the current value as a linear function of past values plus a noise term:\n\nAR(1): rₜ = φ·rₜ₋₁ + εₜ\n\n- If |φ| < 1: The series is stationary and mean-reverting (a shock decays geometrically)\n- If φ = 1: Random walk — shocks are permanent (non-stationary)\n- If |φ| > 1: Explosive — unrealistic for returns\n\n**Moving Average (MA) models** express the current value as a function of current and past error terms:\n\nMA(1): rₜ = εₜ + θ·εₜ₋₁\n\n**ARMA(p,q)**: Combines p autoregressive terms and q moving-average terms. Used for stationary series.\n\n**ARIMA(p,d,q)**: Applies d rounds of differencing before fitting ARMA(p,q) — used for non-stationary price data.\n\n**Half-life of mean reversion**: For AR(1), the expected time for a shock to decay by half:\nhalf-life = −ln(2) / ln(|φ|)\n\nExample: φ = 0.9, half-life = −ln(2)/ln(0.9) ≈ 6.6 periods. A slow mean-reversion process.\n\n**Pairs trading and cointegration**: Two non-stationary price series that share a common stochastic trend are **cointegrated** — their spread is stationary and mean-reverting. This is the statistical foundation of pairs trading. The Engle-Granger test and Johansen test check for cointegration.",
          highlight: [
            "AR model",
            "MA model",
            "ARIMA",
            "half-life",
            "cointegration",
            "pairs trading",
            "mean reversion",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An AR(1) model fitted to the spread between two ETFs gives φ = 0.85. What is the approximate half-life of mean reversion, and what does this imply for a pairs trading strategy?",
          options: [
            "Half-life ≈ 4.3 periods — the spread reverts to its mean relatively quickly, making it suitable for a medium-frequency pairs trade with holding periods measured in days",
            "Half-life ≈ 0.85 periods — since φ < 1 the series reverts within one day",
            "Half-life = infinite — φ < 1 means the spread never fully reverts",
            "Half-life ≈ 8.5 periods — calculated as 1/(1−φ) × ln(2)",
          ],
          correctIndex: 0,
          explanation:
            "Half-life = −ln(2) / ln(φ) = −ln(2) / ln(0.85) = −0.693 / (−0.163) ≈ 4.3 periods. If working with daily data, this means 4.3 days on average for a shock to the spread to decay by half. This is a reasonably fast mean reversion — slow enough to enter and exit positions, fast enough to generate frequent trading opportunities. A very slow half-life (e.g., 60+ days) would tie up capital too long and face more regime-change risk.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Because stock price levels are non-stationary (integrated of order 1), regression models that use price levels rather than returns as inputs will typically produce spurious results with artificially high R-squared values.",
          correct: true,
          explanation:
            "Regressing two non-stationary price series against each other produces 'spurious regression' — high R-squared and statistically significant coefficients even when the two series are entirely independent random walks. This is because both series trend over time, creating a mechanical correlation. The correct approach is to either use returns (which are approximately stationary) or test explicitly for cointegration if you believe the price levels share a genuine long-run relationship.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You compute autocorrelations for a stock's daily log returns. At lag-1 the autocorrelation is +0.02 (p-value 0.4). At lag-1 for the squared returns (volatility proxy), the autocorrelation is +0.35 (p-value < 0.001).",
          question:
            "What do these results tell you about predictability in this stock?",
          options: [
            "Return direction is not predictable from yesterday's return (ρ near 0, not significant), but volatility is highly persistent — today's large move predicts tomorrow's large move, a phenomenon called GARCH clustering",
            "The stock is perfectly efficient — neither returns nor volatility are predictable",
            "A momentum strategy should work because lag-1 autocorrelation is positive at +0.02",
            "The significant volatility autocorrelation means tomorrow's return direction can be predicted",
          ],
          correctIndex: 0,
          explanation:
            "The near-zero, insignificant autocorrelation in raw returns (+0.02, p=0.4) is consistent with weak-form efficiency — past return direction does not predict future direction. However, significant autocorrelation in squared returns (+0.35, p<0.001) reveals **volatility clustering** (GARCH effects) — large moves today are followed by large moves tomorrow, but the direction is random. This is exploitable for options pricing and risk management (volatility tends to remain elevated), but does not support a directional momentum strategy.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Factor Models
       ================================================================ */
    {
      id: "quant-3",
      title: "Factor Models",
      description:
        "CAPM derivation, Fama-French 3-factor model, momentum, quality, and factor portfolio construction",
      icon: "Layers",
      difficulty: "advanced",
      duration: 20,
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "CAPM: The Single-Factor Model",
          content:
            "The **Capital Asset Pricing Model (CAPM)** is the foundational single-factor model of asset pricing, derived by Sharpe, Lintner, and Mossin in the 1960s.\n\n**CAPM equation**:\nE(Rᵢ) = Rƒ + βᵢ × [E(Rₘ) − Rƒ]\n\nWhere:\n- E(Rᵢ) = expected return of asset i\n- Rƒ = risk-free rate\n- βᵢ = systematic risk of asset i relative to the market\n- [E(Rₘ) − Rƒ] = equity risk premium (ERP) — historically ~4–6% per year\n\n**Beta derivation**:\nβᵢ = Cov(Rᵢ, Rₘ) / Var(Rₘ)\n\n**Numerical example**: Stock has Cov(Rᵢ, Rₘ) = 0.018, market Var(Rₘ) = 0.020. β = 0.018/0.020 = 0.90. With Rƒ = 3%, ERP = 5%: E(Rᵢ) = 3% + 0.90 × 5% = 7.5%.\n\n**CAPM implications**:\n1. Only systematic (market) risk is compensated — idiosyncratic risk is diversified away\n2. All investors should hold the same portfolio of risky assets (the market portfolio)\n3. The only reason to expect excess return is having higher beta\n\n**CAPM failures**: Empirically, stocks with identical beta often have very different returns. Small caps beat large caps; value beats growth; momentum persists. These 'anomalies' motivated multi-factor models.",
          highlight: [
            "CAPM",
            "beta",
            "equity risk premium",
            "systematic risk",
            "idiosyncratic risk",
            "market portfolio",
          ],
        },
        {
          type: "teach",
          title: "Fama-French Three-Factor Model",
          content:
            "Eugene Fama and Kenneth French documented in 1992–1993 that two factors — size and value — explain much of the cross-sectional variation in stock returns that CAPM cannot.\n\n**Fama-French 3-factor model**:\nRᵢ − Rƒ = αᵢ + βₘ(Rₘ − Rƒ) + βₛ·SMB + βᵥ·HML + εᵢ\n\n**The three factors**:\n1. **Market factor (Rₘ − Rƒ)**: Equity risk premium — compensation for owning stocks vs. cash\n2. **SMB (Small Minus Big)**: Return of small-cap stocks minus large-cap stocks. Small-cap stocks have historically earned ~2–3% premium per year. Rationale: illiquidity and distress risk.\n3. **HML (High Minus Low)**: Return of high book-to-market (value) stocks minus low book-to-market (growth) stocks. Value has earned ~3–5% premium historically. Rationale: financial distress risk (value companies are often in poor financial health).\n\n**Fitting the model**: Regress each stock's excess returns against the three factors. The output: factor loadings (βₘ, βₛ, βᵥ) and alpha (αᵢ). Alpha here is the return unexplained by the three factors — true 'abnormal return.'\n\n**Fama-French 5-factor extension (2015)**: Added two more factors: RMW (Robust Minus Weak profitability) and CMA (Conservative Minus Aggressive investment). The 5-factor model explains >95% of cross-sectional return variation in large datasets.",
          highlight: [
            "Fama-French",
            "SMB",
            "HML",
            "size premium",
            "value premium",
            "factor loading",
            "alpha",
          ],
        },
        {
          type: "teach",
          title: "Momentum, Quality, and Building a Factor Portfolio",
          content:
            "**Momentum factor (WML — Winners Minus Losers)**: Stocks with the best 12-month (excluding the most recent month) return outperform stocks with the worst 12-month return. Carhart (1997) added momentum as the 4th factor. Premium: ~5–7% per year historically but with occasional severe crashes (momentum crashes of 40–60% in reversal months).\n\n**Quality factor**: High-quality companies — high ROE, stable earnings, low debt, strong free cash flow — outperform low-quality. Novy-Marx (2013) documented the 'gross profitability' anomaly. Rationale: investors underweight boring, profitable companies in favour of exciting growth stories.\n\n**Constructing a factor portfolio (long-short)**:\n1. **Universe**: Define investable universe (e.g., Russell 1000 or S&P 500)\n2. **Score**: Rank all stocks on the factor signal (e.g., book-to-market ratio for value)\n3. **Quintile split**: Long top quintile (best value stocks), short bottom quintile (most expensive)\n4. **Equal-weight or market-cap weight** within each leg\n5. **Rebalance**: Monthly or quarterly to maintain factor purity\n\n**Factor portfolio Sharpe ratios (historical, long-short, before costs)**:\n- Market: ~0.4\n- Value (HML): ~0.35\n- Momentum (WML): ~0.5\n- Quality: ~0.45\n\n**Transaction costs**: Long-short factor portfolios have high turnover and face significant trading costs — particularly for small caps and momentum. After realistic costs, premiums are halved or eliminated for capacity-constrained strategies.",
          highlight: [
            "momentum factor",
            "quality factor",
            "long-short portfolio",
            "quintile",
            "factor construction",
            "transaction costs",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A stock has a beta of 1.0 (market), a positive SMB loading of 0.6 (small-cap tilt), and a positive HML loading of 0.5 (value tilt). The market earns 8%, SMB earns 2%, HML earns 3%, and the risk-free rate is 3%. What return does the Fama-French model predict, and what would alpha represent if the actual return is 15%?",
          options: [
            "Predicted: 3% + 1.0×(8−3)% + 0.6×2% + 0.5×3% = 3 + 5 + 1.2 + 1.5 = 10.7%. Alpha = 15% − 10.7% = 4.3% — return unexplained by the three factors",
            "Predicted: 8% (market return alone). Alpha = 7%",
            "Predicted: 8% + 2% + 3% = 13%. Alpha = 2%",
            "Predicted: 3% + 1.0×8% + 0.6×8% + 0.5×8% = 17.2%. Alpha = −2.2%",
          ],
          correctIndex: 0,
          explanation:
            "Rᵢ = Rƒ + βₘ×(Rₘ−Rƒ) + βₛ×SMB + βᵥ×HML = 3% + 1.0×(8%−3%) + 0.6×2% + 0.5×3% = 3% + 5% + 1.2% + 1.5% = 10.7%. The stock's exposure to three risk factors explains 10.7% return. The remaining 4.3% (15% actual − 10.7% predicted) is alpha — genuine excess return not attributable to systematic factor exposure. A positive alpha after controlling for size and value would be remarkable and warrant investigation.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "According to CAPM, a stock with beta = 0.5 should earn a lower expected return than a stock with beta = 1.5, because it takes less systematic risk.",
          correct: true,
          explanation:
            "CAPM's core insight is that only systematic risk (beta) is compensated — idiosyncratic risk is diversified away and earns no premium. A low-beta stock (0.5) moves less with the market and contributes less systematic risk to a diversified portfolio, so it commands a smaller risk premium. E(R) = Rƒ + β×ERP: with ERP = 5%, beta 0.5 earns Rƒ + 2.5% while beta 1.5 earns Rƒ + 7.5%. This is the Security Market Line (SML).",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You have built a long-short value factor portfolio. It is 2010–2020. The portfolio consistently underperforms despite strong academic evidence that the value premium exists. Your factor loadings are correct — you are genuinely long cheap stocks and short expensive ones.",
          question:
            "Which explanation is most consistent with this underperformance, and what should you do?",
          options: [
            "Value experienced a decade-long drawdown driven by ultra-low rates favouring long-duration growth assets — this is factor cyclicality, not model failure; assess whether the underlying thesis is intact before abandoning the strategy",
            "The Fama-French model is definitively wrong — value premium does not exist; immediately close the portfolio",
            "Your short book (expensive growth stocks) must be incorrectly constructed; the long leg is fine",
            "Rebalance more frequently — the value premium only works when you rebalance daily",
          ],
          correctIndex: 0,
          explanation:
            "Value dramatically underperformed from 2010–2020, with the longest drawdown in its recorded history. The likely explanation: ultra-low interest rates made long-duration growth assets (tech companies with earnings far in the future) disproportionately attractive via discounted cash flow mechanics. This is a regime effect, not evidence that the factor is dead. Academic factors have multi-year drawdown periods — patience and conviction in the underlying thesis (value stocks are mispriced due to behavioural and risk factors) are required. The 2022 environment (rising rates) saw value's strongest comeback in decades.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Risk Models and VaR
       ================================================================ */
    {
      id: "quant-4",
      title: "Risk Models and VaR",
      description:
        "Parametric VaR, historical simulation, Monte Carlo VaR, CVaR/Expected Shortfall, and stress testing",
      icon: "Shield",
      difficulty: "advanced",
      duration: 20,
      xpReward: 95,
      steps: [
        {
          type: "teach",
          title: "Value at Risk: Three Approaches",
          content:
            "**Value at Risk (VaR)** answers: 'What is the maximum loss I should expect to incur over a given horizon at a given confidence level?'\n\nFormally: VaR(α, T) = the loss that will not be exceeded with probability (1−α) over horizon T.\n\nExample: 1-day 99% VaR of $1M means: there is a 1% chance of losing more than $1M in a single day.\n\n**Method 1 — Parametric VaR (variance-covariance)**:\nAssumes returns are normally distributed.\nVaR = μ − z_α × σ\nWhere z_α is the z-score for confidence level α.\nFor 95% VaR: z = 1.645; for 99% VaR: z = 2.326.\n\nExample: Portfolio daily μ = 0%, σ = $50,000. 99% 1-day VaR = 2.326 × $50,000 = $116,300.\n\nPros: Fast, analytical. Cons: Normality assumption — underestimates fat-tail losses.\n\n**Method 2 — Historical Simulation**:\nSort actual historical returns from worst to best. 1-day 99% VaR = the 1st percentile of the empirical distribution.\n\nExample: 500 days of P&L history. Sort ascending. 99% VaR = the 5th worst daily loss.\n\nPros: No distributional assumption; captures fat tails actually experienced. Cons: Depends heavily on which historical window is used; does not anticipate losses outside the sample.\n\n**Method 3 — Monte Carlo VaR**:\nSimulate thousands of scenarios from an assumed return model (e.g., correlated geometric Brownian motion). Compute the loss at the target percentile across simulations.\n\nPros: Handles complex non-linear portfolios (options), any distributional assumption. Cons: Computationally expensive; results depend on the model chosen.",
          highlight: [
            "Value at Risk",
            "VaR",
            "parametric VaR",
            "historical simulation",
            "Monte Carlo",
            "confidence level",
          ],
        },
        {
          type: "teach",
          title: "CVaR / Expected Shortfall and Why VaR Is Incomplete",
          content:
            "**The fundamental flaw of VaR**: VaR tells you where the tail begins, but nothing about what happens inside the tail.\n\nTwo portfolios can have identical 99% VaR = $1M, yet one might lose $1.1M 1% of the time while the other might lose $10M 1% of the time. VaR cannot distinguish them.\n\n**Conditional VaR (CVaR)**, also called **Expected Shortfall (ES)**:\nCVaR(α) = E[Loss | Loss > VaR(α)]\n\nThe expected loss given that you are already beyond the VaR threshold — the average of the tail.\n\n**Numerical example**:\nPortfolio has 1-day 99% VaR = $1M. The 20 worst days in 2,000 days of history (1% of 2,000) have losses: $1.1M, $1.3M, $1.5M, $2.0M, $2.2M, …, $5.0M (average = $2.4M).\n99% 1-day CVaR = $2.4M — much larger than the VaR.\n\n**Why regulators prefer CVaR**:\n- Basel III shifted banks from VaR to ES for market risk capital requirements\n- CVaR is a 'coherent risk measure' — it satisfies subadditivity (diversified portfolio risk ≤ sum of individual risks), which VaR does not always satisfy\n- CVaR penalises fat-tailed strategies that VaR misses\n\n**Backtesting VaR**: Count how often actual losses exceed the VaR threshold ('VaR exceedances'). For 99% VaR: expect 1% of days — about 2–3 per year. Too many exceedances suggests VaR is understated; too few suggests it is overly conservative.",
          highlight: [
            "CVaR",
            "Expected Shortfall",
            "tail risk",
            "coherent risk measure",
            "Basel III",
            "VaR backtesting",
            "VaR exceedances",
          ],
        },
        {
          type: "teach",
          title: "Stress Testing and Scenario Analysis",
          content:
            "**Stress testing** answers: 'How much would my portfolio lose in a specific extreme scenario?' Unlike VaR, which focuses on a single probability threshold, stress testing evaluates specific historical or hypothetical scenarios.\n\n**Historical stress scenarios**:\n- **1987 Black Monday**: Single-day equity drawdown of ~22%. Impact on portfolio if equivalent move occurred.\n- **2008 GFC peak-to-trough**: Equities −57%, credit spreads +1,500bps, VIX to 80.\n- **2020 COVID crash**: Equities −34% in 33 days, correlation breakdown, liquidity crises.\n- **2022 rate shock**: Rates +400bps, equities −20%, bonds −15%.\n\n**Hypothetical scenarios**:\nConstruct scenarios based on economic narrative: 'What if rates rise 300bps in 6 months?' or 'What if China-Taiwan conflict disrupts supply chains?'\n\n**Factor-based stress testing**: Shock factor exposures. Example: Stress HML by −30% (value crashes), WML by −50% (momentum crash), market by −40%.\n\n**Reverse stress testing**: Instead of asking 'what is the loss in scenario X?', ask 'what scenario would cause my portfolio to lose 30%?' This uncovers hidden concentrations and tail risks the portfolio manager may not have recognised.\n\n**Liquidity-adjusted VaR (LVaR)**: Adjusts VaR for the fact that in stress scenarios, bid-ask spreads widen dramatically and position size cannot be exited at the marked price. LVaR adds an illiquidity haircut: LVaR = VaR × √(1 + days_to_exit/2).",
          highlight: [
            "stress testing",
            "scenario analysis",
            "reverse stress testing",
            "liquidity-adjusted VaR",
            "historical scenarios",
            "factor stress",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A portfolio's 1-day 95% parametric VaR is $500,000 (daily σ = $304,000, μ ≈ 0, z₉₅ = 1.645). Historical simulation gives a 95% VaR of $620,000. What most likely explains the difference?",
          options: [
            "The actual return distribution has fatter tails than the normal distribution — historical simulation captures the actual tail, which is worse than the normal model predicts",
            "Historical simulation is always lower than parametric VaR due to sampling error",
            "Parametric VaR uses a higher z-score than historical simulation",
            "The difference arises because historical simulation uses a different confidence level",
          ],
          correctIndex: 0,
          explanation:
            "Parametric VaR assumes returns are normally distributed. Historical simulation uses the actual empirical distribution. When real returns have fat tails (as virtually all financial assets do), the actual 5th percentile loss exceeds what the normal distribution predicts. The $120,000 gap ($620K vs $500K) reflects the 'fat tail premium' — the extra loss in the real tail versus the Gaussian tail. This is why regulators and sophisticated risk managers prefer historical simulation or ES over parametric VaR for tail risk measurement.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "CVaR (Expected Shortfall) is considered a 'coherent risk measure' while VaR is not, because CVaR satisfies the subadditivity property — the risk of a combined portfolio is always less than or equal to the sum of individual risks.",
          correct: true,
          explanation:
            "Subadditivity is a crucial property: risk(A+B) ≤ risk(A) + risk(B). This embeds the principle that diversification cannot increase risk. VaR violates subadditivity for non-normal distributions — you can construct portfolios where the combined VaR exceeds the sum of individual VaRs, which is economically nonsensical. CVaR (ES) satisfies all four properties of a coherent risk measure (monotonicity, subadditivity, positive homogeneity, translation invariance), which is why Basel III adopted ES for regulatory market risk capital.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Your portfolio has a 1-day 99% VaR of $2M. You backtest over 500 trading days and find 12 days where losses exceeded $2M. Your risk model uses parametric (normal distribution) VaR.",
          question:
            "What does this backtest reveal, and what should you do to improve the model?",
          options: [
            "12 exceedances vs. 5 expected (1% of 500) indicates VaR is significantly understated — the normal distribution underestimates tail losses; switch to historical simulation or a fat-tailed distribution, and consider moving to CVaR/ES reporting",
            "12 exceedances is within normal statistical variation — no action required",
            "The VaR is overstated since 488 out of 500 days were below $2M, meaning the model is too conservative",
            "A higher VaR confidence level (99.5%) would fix the exceedance problem without changing the distribution assumption",
          ],
          correctIndex: 0,
          explanation:
            "At 99% confidence over 500 days, you expect 1% × 500 = 5 exceedances. Observing 12 is more than double the expected number — a statistically significant model failure (Kupiec's proportion-of-failures test would reject at the 5% level). The parametric normal-distribution model is systematically underestimating tail risk. The correct remediation is to use fat-tailed distributions (Student's t, historical simulation) and transition to CVaR/ES reporting which penalises the magnitude of tail events, not just their frequency.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Algorithmic Strategy Construction
       ================================================================ */
    {
      id: "quant-5",
      title: "Algorithmic Strategy Construction",
      description:
        "Signal generation, position sizing, execution rules, overfitting prevention, walk-forward validation, and performance targets",
      icon: "Cpu",
      difficulty: "advanced",
      duration: 22,
      xpReward: 110,
      steps: [
        {
          type: "teach",
          title: "Signal Generation and Position Sizing",
          content:
            "**An algorithmic strategy** transforms market data into trading decisions systematically and reproducibly. Building one requires four components: signal, sizing, execution, and risk management.\n\n**Signal generation**: A signal is a quantitative indicator that provides a directional view on an asset.\n\nTypes of signals:\n- **Momentum signals**: z-score of 12-1 month return cross-sectionally ranked; RSI divergence\n- **Mean reversion signals**: Bollinger band z-score; spread z-score in pairs trading\n- **Fundamental signals**: Earnings surprise; analyst revision momentum (ROE − COE)\n- **Macro signals**: Yield curve slope; PMI changes; credit spread widening\n\n**Signal quality metrics**:\n- **Information Coefficient (IC)**: Correlation between signal and subsequent return. IC > 0.05 is considered useful for equity signals; 0.10+ is strong.\n- **IC Information Ratio**: IC_mean / IC_std — measures consistency of the signal's predictive power.\n- **Hit rate**: Percentage of signal-triggered trades that are profitable (>50% required for flat risk/reward).\n\n**Position sizing approaches**:\n1. **Equal weight**: All positions identical size. Simple, anti-fragile to parameter error.\n2. **Volatility-scaled (vol target)**: Size inversely proportional to asset volatility. Target 1% daily VaR per position: size = (target_vol × account) / (asset_vol × price).\n3. **Kelly criterion**: Optimal size = (p × b − q) / b, where p = win probability, q = 1−p, b = win/loss ratio. Kelly maximises long-run geometric growth but produces very large drawdowns — most practitioners use half-Kelly.\n4. **Signal-scaled**: Size proportional to signal strength — larger positions when conviction is higher.",
          highlight: [
            "signal generation",
            "information coefficient",
            "position sizing",
            "Kelly criterion",
            "volatility scaling",
            "hit rate",
          ],
        },
        {
          type: "teach",
          title: "Execution Rules and Overfitting Prevention",
          content:
            "**Execution rules** define precisely when and how orders are placed — often overlooked but critical for real-world performance.\n\n**Entry/exit timing**:\n- Signal at close-of-day → enter at next open (standard for daily strategies)\n- Limit orders vs. market orders: Limit orders may get better fills but risk non-execution ('fill or miss' risk)\n- Slippage budget: For a daily mean-reversion strategy in mid-caps, budget 0.05–0.10% one-way slippage\n\n**Transaction cost model**:\nTotal cost = Commission + Bid-Ask Spread + Market Impact\nMarket Impact ≈ k × σ × √(trade_size / ADV) (Kyle's lambda)\nWhere ADV = average daily volume, k ≈ 0.1–0.5.\n\n**The overfitting problem**: Testing many parameter combinations on historical data will always find some combination that worked perfectly in the past — but this is fitting noise, not signal. A strategy with 10 free parameters fitted on 3 years of daily data (~750 observations) has roughly 75 data points per parameter — severely underdetermined.\n\n**Techniques to detect and prevent overfitting**:\n1. **Hold-out test set**: Reserve the most recent 20–30% of data exclusively for final testing — never touch it during development.\n2. **Walk-forward validation**: Train on a rolling window (e.g., 3 years), test on the next 6 months, slide forward. Produces a realistic out-of-sample equity curve.\n3. **Monte Carlo permutation tests**: Randomly shuffle returns and re-run the strategy — if the original Sharpe is not significantly better than shuffled results, the strategy has no edge.\n4. **Combinatorial Purged Cross-Validation (CPCV)**: Addresses leakage from time series overlapping between train and test folds.\n5. **Limit free parameters**: Each free parameter must be justified by economic intuition. Prefer simple, parsimonious models.",
          highlight: [
            "execution rules",
            "slippage",
            "transaction costs",
            "overfitting",
            "walk-forward validation",
            "hold-out test set",
            "Monte Carlo permutation",
          ],
        },
        {
          type: "teach",
          title: "Walk-Forward Validation and Performance Targets",
          content:
            "**Walk-forward validation (WFV)** is the gold standard for evaluating algorithmic strategies because it simulates the actual experience of a live trader: you train the model on past data, then trade forward in time, then re-train, then trade again.\n\n**WFV structure**:\n- Training window: 3 years rolling (anchored or rolling)\n- Test window: 6 months (out-of-sample, never seen during training)\n- Slide forward 6 months, repeat\n- Collect all out-of-sample periods into a single equity curve\n\n**Interpreting WFV results**:\n- Is the OOS Sharpe at least 60–70% of the in-sample Sharpe? (Higher decay suggests overfitting)\n- Is the OOS equity curve monotonically upward, or does it have structural breaks?\n- Do performance statistics (IC, hit rate) remain stable across OOS windows?\n\n**Realistic performance targets** for a well-constructed algorithmic equity strategy:\n- **Sharpe Ratio**: 0.6–1.0 after costs (live). Backtests showing > 2.0 are almost certainly overfit.\n- **Sortino Ratio**: > 0.8 after costs (penalises downside vol only)\n- **Maximum Drawdown**: < 20% peak-to-trough for long-only; < 30% for long-short\n- **Calmar Ratio** (annual return / max drawdown): > 0.5 is acceptable; > 1.0 is good\n- **Turnover**: Higher turnover requires higher IC to overcome transaction costs. Daily turnover strategy needs IC > 0.05; weekly strategy IC > 0.03.\n\n**The Deflated Sharpe Ratio**: Adjusts reported Sharpe for the number of trials conducted during research. A Sharpe of 1.0 from 1,000 backtests is worth far less than a Sharpe of 1.0 from 3 backtests. Use Bailey-Lopez de Prado's Probability of Backtest Overfitting (PBO) to quantify this.",
          highlight: [
            "walk-forward validation",
            "out-of-sample",
            "Sharpe target",
            "Calmar ratio",
            "Deflated Sharpe",
            "overfitting",
            "Sortino ratio",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A researcher builds 500 variations of a momentum strategy, each with different lookback periods and thresholds. The best-performing variation has an in-sample Sharpe of 2.4. Walk-forward validation shows an OOS Sharpe of 0.4. What does this pattern indicate?",
          options: [
            "Severe overfitting — the in-sample Sharpe of 2.4 resulted from selecting the best combination out of 500 trials; the true OOS Sharpe of 0.4 reveals the strategy has little genuine edge after accounting for multiple testing",
            "The strategy is excellent — a Sharpe of 2.4 in-sample confirms a real edge, and 0.4 OOS is sufficient for live trading",
            "OOS Sharpe is always lower due to transaction costs — the 2.4 to 0.4 decay is expected and acceptable",
            "The researcher should run more iterations to find a variation that achieves Sharpe > 2.0 out-of-sample",
          ],
          correctIndex: 0,
          explanation:
            "Testing 500 variations and selecting the best will inevitably find a combination that fitted historical noise. A 2.4 in-sample Sharpe decaying to 0.4 OOS — a 83% decay — is a strong signal of overfitting. Legitimate strategies typically show 30–40% Sharpe decay from IS to OOS, not 83%. The Probability of Backtest Overfitting framework by Bailey & Lopez de Prado formalises this: with 500 trials, even a random strategy will look great in-sample. Running more trials to find a '2.0 OOS Sharpe' would compound the multiple-testing problem.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Volatility-scaling position sizes (targeting a constant daily VaR per position) means that position sizes automatically decrease during high-volatility regimes and increase during low-volatility regimes, helping to smooth the equity curve.",
          correct: true,
          explanation:
            "Volatility-scaled sizing: position size = (target daily vol × account size) / (asset vol × price). When asset volatility spikes (as in a crisis), the denominator increases, automatically reducing the dollar position. When volatility is low (calm markets), position sizes grow. This creates countercyclical sizing — you de-risk during crises and add risk during calm periods, smoothing the equity curve and preventing a single volatility spike from producing a catastrophic loss. The key risk is that after volatility spikes (when sizes are small), if there is a sharp recovery, you capture less upside.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You have built a daily mean-reversion equity strategy. In-sample results (5 years, 2015–2020): Sharpe 1.4, max drawdown 12%, turnover 40% per day. Walk-forward OOS (2020–2024): Sharpe 0.65, max drawdown 22%. The strategy uses 3 parameters.",
          question:
            "How do you evaluate this strategy's viability for live trading?",
          options: [
            "The strategy shows acceptable characteristics: OOS Sharpe 0.65 is within the realistic range (0.6–1.0), 3 parameters limits overfitting risk, the IS-to-OOS Sharpe decay is ~54% which is elevated but not catastrophic; key concern is 40% daily turnover — compute transaction costs at 0.1% per trade (40% turnover = 0.04% per day or ~10% per year in costs) which would likely eliminate the edge",
            "OOS Sharpe of 0.65 confirms the strategy is ready for live trading immediately with no further analysis",
            "The drawdown increase from 12% to 22% OOS proves the strategy is fatally flawed and should be abandoned",
            "With only 3 parameters the strategy is too simple to be profitable; add more parameters to increase in-sample Sharpe back to 1.4",
          ],
          correctIndex: 0,
          explanation:
            "This is a nuanced evaluation. Positives: 3 parameters (low overfitting risk), OOS Sharpe 0.65 is in the realistic range, walk-forward structure was used correctly. Concerns: 54% Sharpe decay (IS 1.4 → OOS 0.65) is somewhat high; max drawdown grew from 12% to 22%. Critical issue: 40% daily turnover means approximately 80% of positions turn over each day. At 0.1% two-way transaction cost, the daily cost is ~0.08% or ~20% annualised — which would likely wipe out a 0.65 Sharpe strategy. A thorough transaction cost analysis is required before considering live deployment.",
          difficulty: 3,
        },
      ],
    },
  ],
};
