import type { Unit } from "./types";

export const UNIT_RISK_ANALYTICS: Unit = {
  id: "risk-analytics",
  title: "Risk Analytics & Simulation",
  description:
    "Master VaR, CVaR, Monte Carlo simulation, scenario analysis, stress testing, and risk-adjusted performance measurement",
  icon: "Activity",
  color: "#ef4444",
  lessons: [
    // ─── Lesson 1: Value at Risk (VaR) ──────────────────────────────────────────
    {
      id: "risk-analytics-1",
      title: "Value at Risk (VaR)",
      description:
        "Three VaR methodologies, CVaR, backtesting, and the critical limitations of standard risk measures",
      icon: "ShieldAlert",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "What Is Value at Risk?",
          content:
            "**Value at Risk (VaR)** answers a simple question: *How bad can losses get?*\n\nFormal definition: **VaR is the maximum loss not exceeded with confidence X% over a holding period of T days**.\n\nExample: a 1-day 95% VaR of $15,000 on a $1M portfolio means — in any given day, there is a 95% chance losses will be less than $15,000. Equivalently, we expect losses to exceed $15,000 on roughly 5% of trading days (~12 days per year).\n\n**Three methods** to calculate VaR:\n\n**1. Historical Simulation**: rank the last 252 daily returns from worst to best. The 5th percentile return is the 95% VaR. No distributional assumptions — but fully dependent on the historical window chosen.\n\n**2. Parametric (Variance-Covariance)**:\nVaR = μ − z × σ × √T\n- μ = mean portfolio daily return\n- σ = portfolio daily volatility\n- z = 1.645 (95% confidence), 2.326 (99%)\n- T = holding period in days\n\nFast and analytical, but assumes returns are normally distributed — underestimates tail risk.\n\n**3. Monte Carlo**: simulate thousands of scenarios using a returns model; take the Xth percentile of the loss distribution. Most flexible but computationally intensive.\n\nRegulatory uses: banks report 99% 10-day VaR under Basel III. Internal risk limits are often set using 95% 1-day VaR.",
          highlight: [
            "Value at Risk",
            "VaR",
            "confidence",
            "holding period",
            "historical simulation",
            "parametric",
            "variance-covariance",
            "Monte Carlo",
            "z = 1.645",
            "Basel III",
            "normally distributed",
          ],
        },
        {
          type: "teach",
          title: "CVaR and VaR Limitations",
          content:
            "VaR has well-documented weaknesses that every risk manager must understand:\n\n**Limitation 1 — Ignores the tail beyond the confidence level**:\nVaR says nothing about *how bad* losses can be when they exceed the threshold. A 95% VaR of $15K could be accompanied by losses of $16K or $500K on those 5% of bad days — VaR treats both identically.\n\n**Limitation 2 — Not subadditive**:\nIn theory, combining two portfolios should not increase risk. VaR can violate this: VaR(A + B) > VaR(A) + VaR(B) under certain distributions — it fails as a **coherent risk measure**.\n\n**Limitation 3 — Normality assumption (parametric)**:\nFinancial returns have **fat tails** (excess kurtosis) and negative skewness. Parametric VaR systematically underestimates tail risk during crises.\n\n**Conditional VaR (CVaR) — also called Expected Shortfall (ES)**:\nCVaR = expected loss *given* that loss exceeds VaR\n\nIf 95% VaR = $15K and the 5% worst-case average loss is $40K, then CVaR = $40K.\n\nCVaR is **subadditive** — it is a coherent risk measure. Basel IV/FRTB mandates CVaR (Expected Shortfall) replacing VaR in market risk capital requirements.\n\n**Backtesting VaR**:\nThe **traffic light test** (Basel): compare actual daily exceptions (losses > VaR) to expected number. Over 250 trading days at 99% confidence, expect ~2.5 exceptions.\n- Green zone (0–4 exceptions): model acceptable\n- Yellow zone (5–9): investigate\n- Red zone (10+): model failure — increase capital charge",
          highlight: [
            "Conditional VaR",
            "CVaR",
            "Expected Shortfall",
            "ES",
            "coherent risk measure",
            "subadditive",
            "fat tails",
            "excess kurtosis",
            "traffic light test",
            "Basel IV",
            "FRTB",
            "backtesting",
            "exceptions",
          ],
        },
        {
          type: "teach",
          title: "Practical VaR Implementation",
          content:
            "**Portfolio VaR** requires combining individual asset risks accounting for correlations:\n\nFor a two-asset portfolio:\nσ²_p = w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁σ₂ρ₁₂\n\nwhere ρ₁₂ is the correlation between assets. When ρ < 1, portfolio VaR < sum of individual VaRs — this is the **diversification benefit**.\n\n**VaR decomposition**:\n- **Component VaR**: contribution of each position to portfolio VaR (can be negative — position is a natural hedge)\n- **Marginal VaR**: change in portfolio VaR per unit increase in a position\n- **Incremental VaR**: change in portfolio VaR from adding/removing an entire position\n\n**Common VaR mistakes**:\n- Treating VaR as the *worst* loss (it is not — losses can far exceed VaR)\n- Using too short a window (ignores structural regime changes)\n- Assuming correlations are stable (they spike in crises)\n- Not stress-testing the model itself\n\n**Practical example — 95% parametric VaR**:\n$1M portfolio, μ = 0.05%/day, σ = 1.2%/day:\nVaR = 0.05% − 1.645 × 1.2% = 0.05% − 1.974% = −1.924% → $19,240\n\nThis means on a typical bad day (1-in-20), the portfolio loses about $19,240.",
          highlight: [
            "portfolio VaR",
            "diversification benefit",
            "Component VaR",
            "Marginal VaR",
            "Incremental VaR",
            "correlations",
            "correlation",
            "natural hedge",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A $1M portfolio has a 1-day 95% VaR of $15,000. What does this statement mean?",
          options: [
            "There is a 95% chance the portfolio will not lose more than $15,000 in a single day",
            "The portfolio will lose exactly $15,000 on 5% of trading days",
            "The maximum possible loss on any day is $15,000",
            "The expected daily loss is $15,000",
          ],
          correctIndex: 0,
          explanation:
            "A 1-day 95% VaR of $15,000 means that with 95% confidence, the portfolio will not lose more than $15,000 on any given day. Equivalently, there is a 5% probability that losses will exceed $15,000. This does NOT mean losses are capped at $15,000 — losses can be far larger on those 5% of days. VaR says nothing about the magnitude of losses beyond the threshold, which is one of its key criticisms. The CVaR (Expected Shortfall) addresses this by measuring the average loss in the worst 5% of scenarios.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Conditional VaR (CVaR) is considered a more complete risk measure than VaR because it accounts for the severity of losses beyond the VaR threshold.",
          correct: true,
          explanation:
            "TRUE. CVaR (Expected Shortfall) measures the expected loss given that the loss exceeds the VaR threshold — it captures the tail of the distribution, not just its cutoff point. For example, if 95% VaR = $15K but the worst 5% of scenarios average a $60K loss, CVaR = $60K. This makes CVaR a 'coherent risk measure' (it satisfies subadditivity), while VaR is not coherent. Basel IV / FRTB has adopted Expected Shortfall as the primary market risk metric for this reason.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are backtesting a 99% 1-day VaR model using 250 trading days of data. Over those 250 days, you observe 12 days where actual losses exceeded the model's VaR estimate.",
          question:
            "According to the Basel traffic light test, what does this indicate?",
          options: [
            "Green zone — the model is performing well within acceptable bounds",
            "Yellow zone — results are suspicious and warrant investigation",
            "Red zone — the model has failed and requires a capital charge increase",
            "The model is too conservative — it is generating excessive false alarms",
          ],
          correctIndex: 2,
          explanation:
            "At 99% confidence over 250 days, we expect approximately 2.5 exceptions (1% × 250). The Basel traffic light test classifies results as: Green (0–4 exceptions, model acceptable), Yellow (5–9, investigate), Red (10+, model failure with mandatory capital charge increase). With 12 exceptions, this is solidly in the red zone — the model is significantly underestimating tail risk. Possible causes include fat-tailed returns not captured by the model, correlation instability during stress periods, or an insufficient lookback window that missed historical shocks.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Monte Carlo Simulation ───────────────────────────────────────
    {
      id: "risk-analytics-2",
      title: "Monte Carlo Simulation",
      description:
        "Geometric Brownian Motion, variance reduction techniques, and convergence properties for financial simulation",
      icon: "Shuffle",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Monte Carlo in Finance",
          content:
            "**Monte Carlo simulation** estimates uncertain outcomes by running thousands of randomized scenarios and observing the distribution of results. It is the most flexible quantitative tool in finance.\n\n**Core idea**: instead of solving a pricing or risk equation analytically, we simulate the random process that drives asset prices thousands of times and take empirical statistics from the results.\n\n**Key applications**:\n- **Option pricing**: especially path-dependent options (Asian, barrier, lookback) with no closed-form solution\n- **Portfolio risk**: simulate correlated multi-asset paths to estimate VaR, CVaR, and drawdown distributions\n- **Retirement planning**: simulate 30-year portfolio outcomes with varying contribution rates and market returns\n- **Credit risk**: simulate default correlations and loss distributions in CDO pricing\n\n**The fundamental model — Geometric Brownian Motion (GBM)**:\ndS = μS dt + σS dz\n\nwhere:\n- S = asset price\n- μ = drift (expected return)\n- σ = volatility\n- dz = Wiener process increment = ε√dt, ε ~ N(0,1)\n\nIn discrete form (Euler-Maruyama scheme):\nS(t+Δt) = S(t) × exp[(μ − σ²/2)Δt + σε√Δt]\n\nThe term (μ − σ²/2) is the **Itô correction** — it accounts for Jensen's inequality when converting from arithmetic to geometric returns.",
          highlight: [
            "Monte Carlo simulation",
            "Geometric Brownian Motion",
            "GBM",
            "path-dependent",
            "Wiener process",
            "drift",
            "volatility",
            "Itô correction",
            "Euler-Maruyama",
          ],
        },
        {
          type: "teach",
          title: "Simulating Price Paths",
          content:
            "**Step-by-step Monte Carlo price path simulation**:\n\n**Step 1 — Set parameters**:\n- S₀ = current stock price (e.g., $100)\n- μ = expected annual return (e.g., 8%)\n- σ = annual volatility (e.g., 20%)\n- T = time horizon (e.g., 1 year = 252 days)\n- N = number of simulations (e.g., 10,000)\n\n**Step 2 — Generate random shocks**:\nFor each simulation i and each time step t:\nεᵢ,ₜ ~ N(0,1) — standard normal random variable\n\n**Step 3 — Compute log returns**:\nrᵢ,ₜ = (μ − σ²/2)/252 + σ × εᵢ,ₜ / √252\n\n**Step 4 — Build price path**:\nSᵢ,ₜ = Sᵢ,ₜ₋₁ × exp(rᵢ,ₜ)\n\n**Step 5 — Extract risk metrics**:\n- Sort final prices → derive loss distribution\n- 5th percentile final price → 95% VaR\n- Average of worst 5% → CVaR\n- Count paths breaching a threshold → probability of loss\n\n**Correlated assets**: use Cholesky decomposition to introduce correlations. If Σ is the covariance matrix: L = chol(Σ), then ε_corr = L × ε_indep generates correlated shocks while preserving marginal distributions.\n\n**Monte Carlo for option pricing**: for a European call, simulate N paths to S_T; payoff = max(S_T − K, 0); price = e^(−rT) × mean(payoff).",
          highlight: [
            "price path",
            "log returns",
            "standard normal",
            "Cholesky decomposition",
            "covariance matrix",
            "correlated shocks",
            "loss distribution",
            "percentile",
          ],
        },
        {
          type: "teach",
          title: "Variance Reduction and Convergence",
          content:
            "Raw Monte Carlo is accurate but slow to converge. **Variance reduction techniques** improve accuracy per simulation:\n\n**1. Antithetic Variates**:\nFor every random path with shocks ε, also simulate the mirrored path with −ε. Average the two payoffs. The two paths are negatively correlated, so averaging them dramatically reduces variance. Roughly halves the required number of simulations for the same accuracy.\n\n**2. Control Variates**:\nUse a known analytical solution as a control. For example, when pricing an Asian option via Monte Carlo, also price a European option (with known Black-Scholes price) using the *same* random draws. Adjust the Monte Carlo estimate by the known error on the European option. Reduces variance by exploiting correlation between the target and control payoffs.\n\n**3. Quasi-Random (Low-Discrepancy) Sequences**:\nReplace pseudo-random numbers with **Sobol or Halton sequences** that fill the sample space more uniformly. Better coverage → faster convergence. Most widely used in practice for high-dimensional problems.\n\n**Convergence rate**:\nStandard Monte Carlo: error ∝ 1/√N\n- N = 100 → error ≈ 10%\n- N = 10,000 → error ≈ 1%\n- N = 1,000,000 → error ≈ 0.1%\n\nTo halve the error, you need 4× more simulations. This is the fundamental trade-off. In practice, 10,000–100,000 simulations are standard for risk calculations; option pricing desks may run millions for complex path-dependent exotics.",
          highlight: [
            "variance reduction",
            "antithetic variates",
            "control variates",
            "quasi-random",
            "Sobol",
            "Halton",
            "low-discrepancy",
            "convergence",
            "1/√N",
            "path-dependent exotics",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In a Monte Carlo simulation of 10,000 paths, 500 scenarios show a loss greater than $50,000. What is the 95% VaR implied by this simulation?",
          options: [
            "$50,000 — the threshold that 5% of paths exceeded",
            "$25,000 — the average of all 500 bad scenarios",
            "$100,000 — the worst single scenario observed",
            "$50,000 is the CVaR, not the VaR",
          ],
          correctIndex: 0,
          explanation:
            "If 500 out of 10,000 paths (exactly 5%) show losses greater than $50,000, then $50,000 is the 95th percentile loss — this is the 95% VaR. VaR is defined as the loss threshold not exceeded with 95% confidence. The 5% worst-case scenarios average loss would be the CVaR (Conditional VaR / Expected Shortfall), which would be higher than $50,000. The worst single scenario is the maximum loss — a useful metric but not the VaR. This illustrates why Monte Carlo with 10,000+ paths is needed: at N=100, the 5th percentile is only 5 data points, making the estimate very noisy.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In Monte Carlo simulation using Geometric Brownian Motion, doubling the number of simulations from 10,000 to 20,000 will halve the estimation error.",
          correct: false,
          explanation:
            "FALSE. Monte Carlo error scales as 1/√N, not 1/N. Doubling N from 10,000 to 20,000 reduces the error by a factor of √2 ≈ 1.41, not 2. To halve the error, you need to quadruple the number of simulations (e.g., from 10,000 to 40,000). This slow convergence is a key limitation of standard Monte Carlo — variance reduction techniques (antithetic variates, control variates, quasi-random sequences) are used to achieve the equivalent accuracy with fewer simulations.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are pricing an Asian option (payoff depends on the average price over 252 daily time steps) using Monte Carlo. A colleague suggests using antithetic variates to speed up convergence. You currently run 50,000 simulations and take about 30 seconds.",
          question:
            "If antithetic variates roughly halve the variance, what is the most accurate description of the efficiency gain?",
          options: [
            "You can achieve the same accuracy with ~25,000 simulation pairs (50,000 paths total) instead of 50,000 independent paths",
            "You can achieve the same accuracy with 25,000 total paths (12,500 antithetic pairs)",
            "The method only works for European options, not path-dependent Asian options",
            "Antithetic variates reduce the number of time steps required, not the number of simulations",
          ],
          correctIndex: 0,
          explanation:
            "Antithetic variates work by running paired simulations: for each set of random shocks ε, you also run −ε. One simulation 'pair' = 2 paths. If the variance of the paired estimator is half the variance of independent simulations, you need half as many pairs to achieve the same standard error — but each pair still involves 2 paths, so you run 25,000 pairs × 2 = 50,000 total paths in roughly the same computation time. The gain is equivalent to needing only 25,000 independent paths to achieve the same accuracy you previously needed 50,000 for — effectively doubling efficiency. Antithetic variates work for any payoff including path-dependent options like Asian options.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Stress Testing & Scenario Analysis ────────────────────────────
    {
      id: "risk-analytics-3",
      title: "Stress Testing & Scenario Analysis",
      description:
        "Historical stress tests, hypothetical scenarios, reverse stress testing, and regulatory frameworks",
      icon: "Zap",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Types of Stress Tests",
          content:
            "**Stress testing** is the practice of evaluating a portfolio's behavior under extreme but plausible conditions that fall outside the range captured by normal VaR models.\n\nRegulatory stress tests (DFAST, CCAR in the US; EBA in Europe) mandate banks to demonstrate survival under **severely adverse scenarios** involving deep recession, equity crashes, and rate spikes simultaneously.\n\n**Three main stress test approaches**:\n\n**1. Historical Stress Tests**:\nApply factor shocks extracted directly from historical crisis episodes:\n- **2008 Global Financial Crisis**: equity indices −50%, credit spreads +600bps, rates −200bps, volatility (VIX) to 80\n- **2000–02 Dot-com bust**: Nasdaq −78%, tech stocks −90%, flight-to-quality rate rally\n- **1987 Black Monday**: single-day equity drop −22%, implied volatility explosion\n- **COVID March 2020**: equities −35% in 23 trading days, credit widening, oil −60%\n\nAdvantage: based on real events. Disadvantage: future crises may not resemble past ones; historical window may not cover your specific risk factors.\n\n**2. Hypothetical Stress Tests**:\nDesign forward-looking scenarios based on plausible macro narratives:\n- Pandemic resurgence causing supply chain disruption\n- China-Taiwan conflict disrupting semiconductor supply\n- Rapid Fed rate hikes (+300bps in 6 months)\n- Sovereign debt crisis in a major eurozone country\n\n**3. Sensitivity Analysis**:\nChange one factor at a time while holding others constant. Quantifies first-order exposure to individual risk drivers: a 1% move in rates, a 10% currency depreciation, a 5-point VIX spike.",
          highlight: [
            "stress testing",
            "historical stress tests",
            "hypothetical stress tests",
            "sensitivity analysis",
            "DFAST",
            "CCAR",
            "EBA",
            "severely adverse",
            "2008",
            "Black Monday",
            "COVID",
          ],
        },
        {
          type: "teach",
          title: "Reverse Stress Testing",
          content:
            "**Reverse stress testing** is the most intellectually demanding form of stress analysis — instead of asking 'what happens to my portfolio if X occurs?', you ask: **'What combination of events would cause my portfolio to fail (reach an unacceptable loss threshold)?'**\n\nProcess:\n1. Define the failure condition: e.g., portfolio loses 25% of NAV, or a bank's tier-1 capital ratio falls below 6%\n2. Work backward: what joint movements in risk factors could cause this?\n3. Identify the *minimum* shock required to breach the threshold\n4. Assess plausibility: could this scenario actually occur?\n\n**Why reverse stress testing is powerful**:\n- It reveals **hidden tail risks** and concentration exposures that forward tests miss\n- It forces risk managers to think about scenarios beyond historical precedent\n- Regulators (PRA, FSB) mandate it for systemic financial institutions\n\n**Correlation stress**:\nA critical insight: during crises, **correlations spike toward 1**. Assets that normally move independently become highly correlated — diversification fails exactly when you need it most.\n\nLehman Brothers (2008): mortgage securities, corporate bonds, and equities — historically uncorrelated — all plummeted simultaneously as liquidity evaporated.\n\nCorrelation stress scenario: model all risky assets with correlation = 0.9 instead of their normal correlations. The resulting VaR is often 2–4× the normal estimate.\n\n**Hedging after reverse stress test**:\nIf reverse stress analysis reveals that a 40% equity drop + 300bps rate spike causes a 25% loss:\n- Buy equity put spreads (tail hedge)\n- Add interest rate duration shorts (e.g., short Treasury futures)\n- Increase cash allocation to reduce gross exposure",
          highlight: [
            "reverse stress testing",
            "failure condition",
            "hidden tail risks",
            "concentration exposures",
            "correlation stress",
            "correlations spike",
            "diversification fails",
            "Lehman Brothers",
            "PRA",
            "FSB",
            "tail hedge",
          ],
        },
        {
          type: "teach",
          title: "Regulatory Stress Frameworks",
          content:
            "Modern financial regulation imposes structured stress testing requirements on large institutions:\n\n**DFAST (Dodd-Frank Act Stress Test)**:\n- Applies to US banks with assets > $100B\n- Annual stress test with three scenarios: baseline, adverse, severely adverse\n- Severely adverse: unemployment rises 5–6pp, equities fall 40%, real estate falls 25%, credit spreads widen significantly\n- Results publicly disclosed — failure has reputational and regulatory consequences\n\n**CCAR (Comprehensive Capital Analysis and Review)**:\n- Fed-run process for the largest US bank holding companies\n- Tests whether banks have sufficient capital to continue lending under stress\n- Banks must submit capital plans; Fed can object if plans are inadequate\n- Led to hundreds of billions in capital raises post-2008\n\n**EBA Stress Test (European Banking Authority)**:\n- Biannual; covers major EU banks\n- Adverse scenario typically includes severe EU GDP contraction, property price falls, rate shocks\n\n**FRTB (Fundamental Review of the Trading Book)**:\n- Basel Committee reform requiring banks to use Expected Shortfall (99% ES) instead of VaR\n- Requires stressed calibration: use a 12-month period of market stress to calibrate ES\n- Reduces pro-cyclicality of capital requirements\n\n**Internal stress tests**:\nBeyond regulatory requirements, sophisticated risk managers run **weekly or monthly** internal stress tests covering all major portfolios, calibrated to the firm's specific exposures.",
          highlight: [
            "DFAST",
            "CCAR",
            "EBA",
            "FRTB",
            "severely adverse",
            "capital plan",
            "Expected Shortfall",
            "stressed calibration",
            "pro-cyclicality",
            "Basel Committee",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A reverse stress test finds that a 40% equity market drop combined with a 300bps rate spike causes a 25% loss on a multi-asset fund. What is the most appropriate hedging response?",
          options: [
            "Buy equity put spreads and add short duration positions to reduce rate sensitivity",
            "Increase equity allocation to recover losses faster when markets rebound",
            "Switch entirely to cash — all other assets are too risky",
            "Nothing — since the scenario is hypothetical, no hedging is needed",
          ],
          correctIndex: 0,
          explanation:
            "The reverse stress test reveals two specific vulnerabilities: equity downside and interest rate duration risk. The appropriate response addresses both: (1) buying equity put spreads (or long index puts) provides convex payoff protection in severe equity drawdowns; (2) shorting Treasury futures or interest rate swaps reduces duration, so the portfolio gains when rates rise 300bps. Switching entirely to cash is excessively conservative and would destroy long-run returns. Increasing equity allocation during a stress scenario amplifies the identified risk. The value of reverse stress testing is precisely to guide targeted hedging rather than blanket de-risking.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "During financial crises, asset correlations tend to remain stable at their long-run historical averages, which is why diversification reliably reduces portfolio risk even in extreme markets.",
          correct: false,
          explanation:
            "FALSE. This is one of the most dangerous misconceptions in risk management. During crises, correlations spike dramatically — often approaching 1 across asset classes that normally move independently. The Lehman Brothers collapse in 2008 demonstrated this vividly: equities, corporate bonds, real estate, and commodity assets all fell simultaneously as risk aversion and liquidity demands overwhelmed normal diversification benefits. Correlation stress testing — modeling all risky assets with near-unity correlations — is a standard scenario run by sophisticated risk teams to capture this 'diversification failure' effect.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A risk manager runs a historical stress test using 2008 GFC shocks on a $500M multi-asset portfolio: equities −50%, credit spreads +600bps, rates −200bps. The portfolio has 40% equities, 40% investment-grade bonds, and 20% cash. Equity losses = $100M. Bond gains from rate rally = +$40M (duration 5, rate down 2%). Credit spread widening costs = $12M.",
          question: "What is the approximate net P&L under this stress scenario?",
          options: [
            "−$72M (−$100M equities + $40M rate gain − $12M credit widening)",
            "−$100M (only equities matter in a stress test)",
            "+$28M (rate rally saves the portfolio)",
            "−$140M (bonds and equities both fall due to correlation spike)",
          ],
          correctIndex: 0,
          explanation:
            "Net P&L = equity loss + bond rate gain − credit spread cost = −$100M + $40M − $12M = −$72M, or −14.4% of the $500M portfolio. The 40% bond allocation ($200M) with 5-year duration gains roughly 5 × 2% = 10% from the 200bps rate rally = +$40M. Credit spread widening of 600bps on $200M investment-grade bonds at ~1% DV01 (rough estimate) ≈ −$12M. This illustrates how stress tests combine multiple factor shocks simultaneously and shows the partial hedge benefit of investment-grade bonds (rate rally partially offsets equity losses), while also revealing the credit spread cost that dampens bond gains.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Factor Risk Models ───────────────────────────────────────────
    {
      id: "risk-analytics-4",
      title: "Factor Risk Models",
      description:
        "Multi-factor decomposition, covariance matrices, tracking error, and marginal risk contribution",
      icon: "Layers",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Multi-Factor Risk Decomposition",
          content:
            "**Factor risk models** decompose portfolio returns into systematic components (driven by common market factors) and idiosyncratic components (specific to individual securities).\n\n**General form**:\nrᵢ = αᵢ + β₁ᵢF₁ + β₂ᵢF₂ + ... + βₖᵢFₖ + εᵢ\n\nwhere:\n- rᵢ = return of asset i\n- βⱼᵢ = factor loading (sensitivity to factor j)\n- Fⱼ = factor return\n- εᵢ = idiosyncratic return (asset-specific noise)\n\n**Common factors used in equity models**:\n- **Market (beta)**: sensitivity to broad market moves — the dominant factor for most stocks\n- **Size (SMB)**: small-cap vs. large-cap spread (Fama-French)\n- **Value (HML)**: high book/market vs. low book/market\n- **Momentum (WML)**: 12-month winner vs. loser stocks\n- **Sector factors**: GICS sector membership\n- **Country factors**: for global portfolios\n- **Macro factors**: inflation sensitivity, interest rate duration, currency exposure\n\n**Risk decomposition**:\nTotal risk² = Systematic risk² + Idiosyncratic risk²\nσ²_portfolio = β'Fβ + Ω\n\nwhere F is the factor covariance matrix and Ω is the diagonal idiosyncratic variance matrix.\n\n**Commercial factor models**: Barra (MSCI), Axioma, Northfield. These maintain hundreds of factors and are updated with daily returns data. Used by virtually every large asset manager.",
          highlight: [
            "factor risk models",
            "systematic",
            "idiosyncratic",
            "factor loading",
            "beta",
            "size",
            "value",
            "momentum",
            "Fama-French",
            "Barra",
            "factor covariance matrix",
          ],
        },
        {
          type: "teach",
          title: "Covariance Matrix and Portfolio Risk",
          content:
            "The **covariance matrix** (Σ) is the mathematical engine of portfolio risk. Its diagonal entries are individual asset variances; off-diagonal entries are pairwise covariances (= ρᵢⱼ × σᵢ × σⱼ).\n\n**Portfolio variance**:\nσ²_p = w' Σ w\n\nwhere w is the vector of portfolio weights. This single formula captures diversification across all N assets simultaneously.\n\n**Challenges with the covariance matrix**:\n- For 500 stocks, Σ has 500 × 501 / 2 = 125,250 unique parameters to estimate\n- With limited historical data, the sample covariance matrix is **poorly estimated** and may not be positive definite\n- Factor models help by constraining Σ = B F B' + Ω (far fewer parameters to estimate)\n\n**Shrinkage estimators** (Ledoit-Wolf): blend sample covariance toward a structured target (e.g., equal correlations) to reduce estimation error.\n\n**Tracking error**:\nTE = σ(r_portfolio − r_benchmark) = √[(w − w_b)' Σ (w − w_b)]\n\nwhere w_b is the benchmark weight vector. Active managers are monitored against tracking error targets (typically 1–5% annualized for active equity managers).\n\n**Information ratio** relates active return to tracking error:\nIR = α / TE\n\nA skilled manager generates positive α (alpha) per unit of tracking error taken. IR > 0.5 is considered strong.",
          highlight: [
            "covariance matrix",
            "portfolio variance",
            "diversification",
            "factor models",
            "shrinkage estimators",
            "Ledoit-Wolf",
            "tracking error",
            "benchmark",
            "active managers",
            "information ratio",
            "alpha",
          ],
        },
        {
          type: "teach",
          title: "Marginal Contribution to Risk",
          content:
            "Understanding *which positions* drive portfolio risk is as important as measuring total risk.\n\n**Marginal Contribution to Risk (MCR)**:\nMCR_i = (∂σ_p / ∂w_i) = (Σw)_i / σ_p\n\nMCR is the rate of change of portfolio volatility as the weight of asset i increases by 1 unit. A high MCR position is a risk concentrator.\n\n**Component Contribution to Risk (CCR)**:\nCCR_i = w_i × MCR_i\n\nThis is the dollar-weighted contribution. Summing all CCRs gives total portfolio risk:\nΣ CCR_i = σ_p\n\n**Risk budgeting**: rather than targeting equal dollar weights, allocate so each asset contributes an equal *risk* budget. A risk-parity approach sets CCR_i = σ_p / N for all i.\n\n**Practical implications**:\n- A large position in a low-volatility, low-correlation asset may contribute less risk than a small position in a high-beta stock\n- Negative CCR means the position *reduces* portfolio risk — it acts as a natural hedge\n- Risk attribution reports (showing CCR by sector, factor, country) are standard output from factor risk systems\n\n**Example**:\nPortfolio has 70% systematic risk and 30% idiosyncratic risk.\n- Systematic risk is driven by factor exposures — reduced by lowering beta or sector concentration\n- Idiosyncratic risk is unique to specific stocks — reduced by diversification (holding more names)\n- Only idiosyncratic risk is **diversifiable**; systematic risk requires hedging (e.g., short futures) to reduce",
          highlight: [
            "Marginal Contribution to Risk",
            "MCR",
            "Component Contribution",
            "CCR",
            "risk budgeting",
            "risk-parity",
            "natural hedge",
            "diversifiable",
            "systematic risk",
            "idiosyncratic risk",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A portfolio has 70% systematic risk and 30% idiosyncratic risk. Which component is diversifiable, and how can the other be reduced?",
          options: [
            "Idiosyncratic risk is diversifiable by holding more stocks; systematic risk requires hedging instruments like futures",
            "Systematic risk is diversifiable by holding more stocks; idiosyncratic risk requires hedging",
            "Both types are diversifiable by increasing portfolio size",
            "Neither type is diversifiable — all risk requires explicit hedging instruments",
          ],
          correctIndex: 0,
          explanation:
            "Idiosyncratic (company-specific) risk is diversifiable — by holding more stocks, individual company shocks average out. A well-diversified portfolio of 30–50 stocks eliminates most idiosyncratic risk. Systematic risk is driven by common factor exposures (market beta, sector, macro) and cannot be diversified away by adding more securities with similar factor exposures. To reduce systematic risk, a manager must either reduce factor exposure (lower portfolio beta) or hedge with instruments like index futures, sector ETFs, or factor swaps. This is the core insight of portfolio theory: diversification is free, but beta reduction has a cost.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A position with negative Component Contribution to Risk (CCR) increases overall portfolio risk and should always be eliminated.",
          correct: false,
          explanation:
            "FALSE. A negative CCR means the position *reduces* total portfolio risk — it acts as a natural hedge. This happens when the asset is negatively correlated with the rest of the portfolio. Classic examples: long volatility positions (VIX exposure), gold, long-dated government bonds in an equity-heavy portfolio, or a short equity futures overlay. These positions may have a negative expected return in isolation yet improve the portfolio's risk-adjusted return by reducing overall volatility. Eliminating them would *increase* portfolio risk, not reduce it. Risk decomposition tools help identify these valuable hedging positions.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You run a factor risk model on your equity portfolio. Results show: Market beta contribution = 65% of total risk, Sector factor contribution = 15%, Size/Value factors = 10%, Idiosyncratic = 10%. Your client complains the portfolio is too volatile relative to the benchmark.",
          question: "Which action would most efficiently reduce portfolio risk?",
          options: [
            "Reduce market beta by selling high-beta stocks or adding short index futures",
            "Diversify into more stocks to reduce idiosyncratic risk",
            "Switch to smaller-cap stocks to reduce size factor exposure",
            "Eliminate all sector tilts to reduce sector factor risk",
          ],
          correctIndex: 0,
          explanation:
            "With market beta contributing 65% of total risk — by far the largest component — reducing beta is the most efficient risk reduction lever. This can be accomplished by selling high-beta stocks and replacing with lower-beta names, or by overlaying short index futures (a common approach as it is cost-effective and doesn't require selling stock positions). Diversifying to reduce idiosyncratic risk (only 10% of total) would have minimal impact. Addressing sector (15%) or size/value factors (10%) would have smaller effects. Always target the largest risk contributors first — this is the core use case of factor risk decomposition.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Risk-Adjusted Performance ────────────────────────────────────
    {
      id: "risk-analytics-5",
      title: "Risk-Adjusted Performance",
      description:
        "Sharpe, Sortino, Calmar, Omega, Information Ratio, and M² — measuring skill beyond raw returns",
      icon: "TrendingUp",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Sharpe and Sortino Ratios",
          content:
            "Raw returns are meaningless without context. A 20% annual return from a portfolio with 50% volatility is far less impressive than 15% from a portfolio with 8% volatility. **Risk-adjusted metrics** normalize returns by the risk taken.\n\n**Sharpe Ratio** (William Sharpe, Nobel 1990):\nSharpe = (R_p − R_f) / σ_p\n\nwhere R_p = portfolio return, R_f = risk-free rate, σ_p = total portfolio volatility (standard deviation of all returns).\n\nInterpretation:\n- Sharpe < 0: return below risk-free rate — taking risk with no reward\n- Sharpe 0–1: acceptable\n- Sharpe 1–2: good (top quartile equity funds)\n- Sharpe > 2: excellent (institutional hedge funds rarely sustain > 2 long-term)\n- Sharpe > 3: exceptional / possibly luck or short look-back period\n\n**Limitation**: Sharpe penalizes upside volatility equally with downside volatility. A strategy that occasionally has large *gains* (positive skew) is penalized — which is backwards for investors who only care about losses.\n\n**Sortino Ratio**:\nSortino = (R_p − R_f) / σ_downside\n\nwhere σ_downside = standard deviation of *negative* returns only (returns below minimum acceptable return, typically 0 or risk-free rate).\n\nThe Sortino ratio rewards upside volatility and penalizes downside volatility. It is preferred for strategies with asymmetric return distributions — options sellers, trend-following CTAs, and event-driven funds.",
          highlight: [
            "Sharpe Ratio",
            "Sortino Ratio",
            "risk-free rate",
            "total volatility",
            "downside deviation",
            "asymmetric",
            "upside volatility",
            "downside volatility",
            "positive skew",
          ],
        },
        {
          type: "teach",
          title: "Calmar, Omega, and Information Ratio",
          content:
            "Different strategies call for different risk-adjusted metrics:\n\n**Calmar Ratio** (drawn from CTA / managed futures usage):\nCalmar = Annualized Return / |Maximum Drawdown|\n\nMaximum drawdown = peak-to-trough decline. A fund with 12% annual return and a 20% max drawdown has Calmar = 0.6. Higher is better.\n\nCalmar is preferred for evaluating **trend-following CTAs** and strategies where drawdown — not volatility — is the relevant risk concept for the investor.\n\n**Omega Ratio**:\nOmega(τ) = [∫_{τ}^{∞} (1 − F(r)) dr] / [∫_{-∞}^{τ} F(r) dr]\n\nIn plain terms: ratio of probability-weighted gains above a threshold τ to probability-weighted losses below τ. Omega = 1 always when τ = mean return. Omega > 1 at τ = 0 means the strategy has more probability-weighted gains than losses above zero — a positive feature.\n\nUnlike Sharpe, Omega captures the full return distribution including higher moments (skewness, kurtosis) without assuming normality.\n\n**Information Ratio (IR)**:\nIR = α / TE (Active Return / Tracking Error)\n\nα = R_portfolio − R_benchmark (alpha)\nTE = σ(R_portfolio − R_benchmark) (tracking error)\n\nIR measures skill: how much alpha does the manager generate per unit of active risk taken?\n- IR > 0.5: strong active manager\n- IR > 1.0: exceptional (consistent top decile)\n\n**Key insight**: an IR of 0.5 with 3% tracking error = 1.5% alpha — very valuable at institutional scale.",
          highlight: [
            "Calmar Ratio",
            "maximum drawdown",
            "CTAs",
            "trend-following",
            "Omega Ratio",
            "probability-weighted",
            "Information Ratio",
            "alpha",
            "tracking error",
            "active risk",
          ],
        },
        {
          type: "teach",
          title: "M² and Performance Attribution",
          content:
            "**M² (Modigliani-Modigliani measure)** solves a key comparison problem: how do you compare two funds with different volatility levels?\n\nMethod:\n1. Lever or de-lever the fund to match the *benchmark's* volatility\n2. Compare the volatility-adjusted return to the benchmark return\n\nM² = R_f + Sharpe_p × σ_benchmark\n\nExample: Fund has Sharpe = 1.1, risk-free rate = 5%, benchmark volatility = 15%:\nM² = 5% + 1.1 × 15% = 21.5%\n\nIf benchmark returned 18%, M² = 21.5% > 18% → fund outperformed after adjusting for volatility differences.\n\n**Performance Attribution** (Brinson-Hood-Beebower model):\nDecomposes active return into:\n- **Allocation effect**: did the manager overweight sectors that outperformed?\n- **Selection effect**: did the manager pick better stocks within each sector?\n- **Interaction effect**: combined impact of allocation and selection\n\nThis allows investors to determine whether alpha comes from genuine stock-picking skill or sector timing.\n\n**Practical ranking exercise** (fund evaluation):\n1. Sharpe: measures overall risk efficiency\n2. Sortino: preferred when return distribution is asymmetric\n3. Calmar: preferred for drawdown-sensitive allocations\n4. IR: preferred when evaluating active managers vs a benchmark\n5. M²: preferred when comparing funds of different volatility\n\n**No single metric suffices** — sophisticated investors use a dashboard of metrics to evaluate performance comprehensively.",
          highlight: [
            "M²",
            "Modigliani-Modigliani",
            "lever",
            "de-lever",
            "benchmark volatility",
            "Brinson-Hood-Beebower",
            "allocation effect",
            "selection effect",
            "interaction effect",
            "performance attribution",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Fund A has Sharpe 1.2 and Sortino 2.1. Fund B has Sharpe 0.9 and Sortino 1.8. Which fund has a better downside risk profile, and what does the divergence between the two funds' Sharpe and Sortino ratios suggest?",
          options: [
            "Fund A has better downside profile; both funds have positively skewed returns (more upside volatility than downside), and Fund A benefits more from this asymmetry",
            "Fund B has better downside profile; the higher Sortino ratios indicate Fund A has more total volatility",
            "Fund A is better on both measures and is strictly superior in all respects",
            "The two metrics cannot be compared across different funds",
          ],
          correctIndex: 0,
          explanation:
            "Fund A has both a higher Sharpe (1.2 vs 0.9) and a higher Sortino (2.1 vs 1.8), making it superior on both risk-adjusted metrics. The key insight from the Sortino > Sharpe ratio pattern (both funds' Sortino substantially exceeds their Sharpe) is that both funds have positively skewed return distributions — they have upside volatility that inflates total sigma used in Sharpe, but less downside volatility. The Sortino ratio strips out upside volatility, revealing a better risk-return picture than Sharpe alone suggests. Fund A benefits more from this asymmetry (its Sortino/Sharpe ratio = 1.75 vs Fund B's 2.0), meaning Fund B's skew is relatively larger — but Fund A is still superior on absolute levels of both ratios.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "The Sharpe ratio is always the best metric for comparing two investment strategies, regardless of their return distribution or investor objectives.",
          correct: false,
          explanation:
            "FALSE. The Sharpe ratio has important limitations: (1) it penalizes upside volatility equally with downside volatility, making it inappropriate for asymmetric return strategies like options writing or trend-following; (2) it assumes normally distributed returns — it undervalues strategies with positive skewness and overstates the quality of strategies with fat negative tails; (3) it does not account for serial correlation in returns, which can make hedge fund Sharpe ratios appear artificially high; (4) for drawdown-sensitive investors (retirees, endowments with fixed spending needs), the Calmar ratio may be more relevant. Sophisticated performance evaluation uses multiple metrics tailored to the strategy type and investor objectives.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are evaluating two hedge funds for a pension fund allocation. Fund X: 14% annual return, 12% volatility, 8% max drawdown, 4% tracking error vs benchmark, 2% alpha. Fund Y: 18% annual return, 22% volatility, 30% max drawdown, 9% tracking error vs benchmark, 5% alpha. Risk-free rate = 4%.",
          question:
            "Calculate Sharpe and Calmar for both funds. Which fund is more suitable for a pension fund with strict drawdown constraints?",
          options: [
            "Fund X: Sharpe 0.83, Calmar 1.75. Fund Y: Sharpe 0.64, Calmar 0.60. Fund X is more suitable for the pension fund",
            "Fund Y is better: higher alpha (5% vs 2%) means more value added for the pension",
            "Fund X: Sharpe 1.17, Calmar 1.75. Fund Y: Sharpe 0.64, Calmar 0.60. Both are equally suitable",
            "Fund Y is better because its higher absolute return (18%) will compound faster over the pension's long horizon",
          ],
          correctIndex: 0,
          explanation:
            "Fund X Sharpe = (14% − 4%) / 12% = 0.83. Fund X Calmar = 14% / 8% = 1.75. Fund Y Sharpe = (18% − 4%) / 22% = 0.64. Fund Y Calmar = 18% / 30% = 0.60. Fund X is superior on both risk-adjusted measures. For a pension fund with strict drawdown constraints (cannot afford a 30% drawdown that would force asset sales to meet benefit payments), Fund X's 8% max drawdown is far more appropriate than Fund Y's 30%. The pension fund's liability structure makes drawdown a critical constraint — even if Fund Y has higher raw returns and more alpha, the tail risk is unacceptable. This illustrates why metric selection must match investor objectives.",
          difficulty: 3,
        },
      ],
    },
  ],
};
