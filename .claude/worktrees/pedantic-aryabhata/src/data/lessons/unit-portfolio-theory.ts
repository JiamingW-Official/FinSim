import type { Unit } from "./types";

export const UNIT_PORTFOLIO_THEORY: Unit = {
 id: "portfolio-theory",
 title: "Portfolio Theory",
 description:
 "Master MPT, CAPM, factor models, risk parity, Black-Litterman, and practical portfolio construction",
 icon: "PieChart",
 color: "#3b82f6",
 lessons: [
 // Lesson 1: Modern Portfolio Theory 
 {
 id: "portfolio-theory-1",
 title: "Modern Portfolio Theory",
 description:
 "Markowitz mean-variance optimization, the efficient frontier, the two-fund separation theorem, and MPT's assumptions and limitations",
 icon: "PieChart",
 xpReward: 85,
 difficulty: "advanced",
 duration: 20,
 steps: [
 {
 type: "teach",
 title: "Markowitz Mean-Variance Optimization",
 content:
 "Harry Markowitz's 1952 paper revolutionized investing by showing that risk and return cannot be evaluated in isolation — only in the context of the whole portfolio.\n\n**Portfolio return** is the weighted average of individual asset returns:\n\nRp = Σ wi × Ri\n\nwhere wi is the weight of asset i and Ri is its expected return.\n\n**Portfolio variance** is where diversification gets interesting. It depends on the full covariance matrix:\n\nσp² = Σi Σj wi × wj × Cov(Ri, Rj)\n\nWhen assets are not perfectly correlated (correlation < 1), combining them produces a portfolio whose variance is less than the weighted average variance of its components. This is the mathematical foundation of diversification.\n\n**Covariance matrix**: For N assets, the matrix has N² entries. With 500 assets that is 250,000 parameters to estimate — estimation error is a fundamental challenge in practice.\n\n**Minimum variance portfolio**: The portfolio on the efficient frontier with the lowest possible standard deviation regardless of return. A useful anchor point.\n\n**Types of risk**:\n- Idiosyncratic (specific) risk: company- or sector-level risk, fully diversifiable\n- Systematic (market) risk: economy-wide risk, cannot be diversified away\n\nWith roughly 20-30 randomly selected stocks, idiosyncratic risk averages out to near zero. Systematic risk persists regardless of how many assets are held.",
 highlight: [
 "mean-variance optimization",
 "covariance matrix",
 "efficient frontier",
 "idiosyncratic risk",
 "systematic risk",
 "minimum variance portfolio",
 "diversification",
 ],
 },
 {
 type: "teach",
 title: "The Efficient Frontier and Two-Fund Separation Theorem",
 content:
 "**Efficient frontier**: By varying portfolio weights across all possible combinations, you trace a curve of portfolios that maximize expected return for each level of risk. Only portfolios on this curve are mean-variance efficient.\n\n**Key insight**: Any portfolio not on the efficient frontier is dominated — there exists another portfolio with the same return and lower risk, or the same risk and higher return. Rational mean-variance investors should hold only efficient portfolios.\n\n**Adding the risk-free asset**: When you introduce a risk-free asset (T-bills), the efficient frontier transforms. Investors can now combine any risky portfolio with the risk-free rate. The optimal combination is a straight line from the risk-free rate through the risky portfolio that maximizes the Sharpe ratio:\n\nSharpe Ratio = (Rp - Rf) / σp\n\nThis tangent portfolio is the market portfolio under CAPM assumptions.\n\n**Two-fund separation theorem**: Every investor, regardless of risk tolerance, should hold the same two funds:\n1. The risk-free asset\n2. The tangency (market) portfolio\n\nThey differ only in the proportions held. A conservative investor holds mostly the risk-free asset; an aggressive investor holds mostly (or leveraged) the market portfolio. This is the theoretical basis for passive index investing.",
 highlight: [
 "efficient frontier",
 "dominated portfolio",
 "risk-free asset",
 "tangency portfolio",
 "Sharpe ratio",
 "two-fund separation theorem",
 "market portfolio",
 ],
 },
 {
 type: "teach",
 title: "MPT Assumptions and Limitations",
 content:
 "MPT is mathematically elegant but rests on assumptions that frequently fail in practice.\n\n**Key assumptions of MPT**:\n1. Investors are rational and maximize expected utility\n2. Returns are normally distributed\n3. Correlations and expected returns are stable and known\n4. Markets are frictionless (no taxes, transaction costs, or short-sale constraints)\n5. All investors share the same information and return estimates\n\n**Where assumptions break down**:\n\n**Non-normal returns**: Real asset returns have fat tails and negative skewness. Extreme losses occur far more often than a normal distribution predicts. The 2008 crisis was a supposed 25-sigma event — essentially impossible under normality.\n\n**Estimation error**: Expected returns are notoriously difficult to estimate. Small changes in return assumptions produce wildly different optimal portfolios. The model is hypersensitive to inputs — garbage in, garbage out.\n\n**Changing correlations**: Correlations are not stable. In crises they spike toward 1 across all risk assets — precisely when low correlation is needed most. Diversification benefits disappear when they matter most.\n\n**Behavioral violations**: Real investors are not rational mean-variance optimizers. Loss aversion, overconfidence, and herding systematically violate MPT's behavioral assumptions.\n\n**Practical responses**: Black-Litterman (input stabilization), robust optimization (uncertainty sets), resampled efficiency (Monte Carlo averaging), and factor models all attempt to address MPT's fragility.",
 highlight: [
 "estimation error",
 "fat tails",
 "non-normal returns",
 "changing correlations",
 "robust optimization",
 "Black-Litterman",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "In Markowitz mean-variance optimization, what mathematical relationship between asset returns allows combining two assets to produce a portfolio with lower variance than either individual asset?",
 options: [
 "A correlation coefficient strictly less than +1.0 between the two asset returns",
 "Both assets must have returns higher than the risk-free rate",
 "The assets must have equal volatility so they cancel each other out",
 "One asset must have negative expected return for diversification to work",
 ],
 correctIndex: 0,
 explanation:
 "Portfolio variance = w1²σ1² + w2²σ2² + 2·w1·w2·σ1·σ2·ρ12. When correlation ρ < 1, the cross-term is less than its maximum possible value, making total portfolio variance lower than the weighted average of individual variances. When ρ = +1 (perfect positive correlation), there is no diversification benefit. When ρ = -1, it is theoretically possible to construct a zero-variance portfolio. Any real-world correlation below +1 provides some diversification benefit.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The two-fund separation theorem implies that all rational mean-variance investors should hold the exact same portfolio of risky assets, differing only in how much of that portfolio they hold versus the risk-free asset.",
 correct: true,
 explanation:
 "TRUE. The two-fund separation theorem states that the optimal risky portfolio (the tangency portfolio) is the same for all investors regardless of risk tolerance, assuming the same expectations about returns and covariances. A risk-averse investor places a larger fraction in the risk-free asset and a smaller fraction in the tangency portfolio. An aggressive investor might use leverage (borrowing at the risk-free rate) to hold more than 100% in the tangency portfolio. This theoretical result underpins passive investing: if everyone holds the same risky portfolio, it must be the capitalization-weighted market portfolio.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A portfolio manager constructs the efficient frontier for a universe of global equities. She then finds the tangency portfolio (maximum Sharpe ratio portfolio). A conservative client wants a 5% annualized volatility target, while an aggressive client wants 20% volatility. The tangency portfolio has 12% volatility.",
 question:
 "According to the two-fund separation theorem, what should each client hold?",
 options: [
 "Both clients hold the tangency portfolio mixed with either the risk-free asset (conservative) or leveraged tangency portfolio (aggressive), not different risky portfolios",
 "Conservative: bonds only. Aggressive: equities only",
 "Each client should hold a different point on the efficient frontier matched to their volatility tolerance",
 "Conservative: 50% tangency + 50% cash. Aggressive: 100% tangency, accepting 12% volatility",
 ],
 correctIndex: 0,
 explanation:
 "The two-fund theorem says both clients hold the same tangency portfolio, varying only the leverage/cash mix. Conservative (5% vol target): holds 5/12 = ~42% in tangency portfolio, 58% in risk-free asset. Aggressive (20% vol target): holds 20/12 = ~167% in tangency portfolio, borrowing 67% at the risk-free rate. This is more efficient than moving to a different point on the risky efficient frontier, because the Sharpe ratio of any combination of the risk-free asset and tangency portfolio equals the Sharpe of the tangency portfolio itself.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: CAPM 
 {
 id: "portfolio-theory-2",
 title: "CAPM",
 description:
 "Capital market line, security market line, beta, systematic vs idiosyncratic risk, and CAPM empirical tests",
 icon: "TrendingUp",
 xpReward: 85,
 difficulty: "advanced",
 duration: 20,
 steps: [
 {
 type: "teach",
 title: "Capital Market Line and the Market Portfolio",
 content:
 "The **Capital Asset Pricing Model (CAPM)** was developed independently by Sharpe, Lintner, and Mossin in the 1960s, building directly on Markowitz's work.\n\n**Capital Market Line (CML)**: The set of all efficient portfolios formed by combining the risk-free asset with the tangency (market) portfolio. Points on the CML have:\n\nE(Rp) = Rf + [(E(Rm) - Rf) / σm] × σp\n\nThe slope of the CML equals the market Sharpe ratio — the maximum return per unit of risk achievable in the entire economy.\n\n**The market portfolio**: Under CAPM, in equilibrium the tangency portfolio is the market portfolio — a capitalization-weighted portfolio of all risky assets in the economy. Every investor holds it; supply equals demand.\n\n**Market risk premium**: E(Rm) - Rf. Historically ~5-7% annualized for US equities above T-bills. Compensation for bearing systematic (undiversifiable) risk across the full business cycle.\n\n**CML applies only to efficient portfolios**: The CML describes the risk-return tradeoff for fully diversified portfolios. Individual stocks and inefficient portfolios lie below the CML — they have idiosyncratic risk that is not compensated. For individual assets, the relevant measure is the Security Market Line (SML), not the CML.",
 highlight: [
 "CAPM",
 "Capital Market Line",
 "market portfolio",
 "market risk premium",
 "systematic risk",
 "security market line",
 ],
 },
 {
 type: "teach",
 title: "Security Market Line, Beta, and Alpha",
 content:
 "The **Security Market Line (SML)** prices individual assets based on their contribution to systematic risk:\n\n**CAPM equation**: E(Ri) = Rf + βi × (E(Rm) - Rf)\n\n**Beta (β)**: The sensitivity of an asset's return to the market's return:\n\nβi = Cov(Ri, Rm) / Var(Rm)\n\n- β = 1.0: moves exactly with the market (e.g., broad index)\n- β > 1.0: amplifies market moves (e.g., tech growth stocks, leveraged ETFs)\n- β < 1.0: dampens market moves (e.g., utilities, consumer staples)\n- β < 0: moves opposite to the market (e.g., some bonds, inverse ETFs)\n\n**Systematic vs idiosyncratic risk**: Under CAPM, only systematic risk is priced — investors are not compensated for idiosyncratic risk because it can be diversified away for free. Beta measures exactly the systematic portion.\n\n**Alpha (Jensen's alpha)**: Actual Return - CAPM Expected Return\n- Positive alpha: outperformed relative to beta exposure (asset plots above SML)\n- Negative alpha: underperformed (asset plots below SML)\n- In equilibrium, all assets lie on the SML and alpha = 0\n\n**Practical interpretation**: A manager with beta = 0.8 and 12% return vs a market that returned 10% with risk-free at 3%: CAPM predicts 3% + 0.8 × (10%-3%) = 8.6%. Alpha = 12% - 8.6% = 3.4%. That 3.4% is the genuine value added beyond market exposure.",
 highlight: [
 "Security Market Line",
 "beta",
 "alpha",
 "Jensen's alpha",
 "systematic risk",
 "idiosyncratic risk",
 "CAPM equation",
 ],
 },
 {
 type: "teach",
 title: "CAPM Empirical Tests and the Flat SML Puzzle",
 content:
 "CAPM makes clear predictions that empirical research has tested extensively — and often found wanting.\n\n**Predictions of CAPM**:\n1. Expected return is linear in beta\n2. The market portfolio is mean-variance efficient\n3. No other factor should explain returns beyond beta\n\n**Empirical failures**:\n\n**The flat SML**: Black, Jensen, and Scholes (1972) found the SML is much flatter in data than CAPM predicts. High-beta stocks underperform their CAPM prediction; low-beta stocks outperform. This gave rise to the low-volatility/low-beta anomaly.\n\n**Size effect**: Banz (1981) showed small-cap stocks earn higher returns than CAPM predicts. Beta alone doesn't explain it.\n\n**Value effect**: Fama and French (1992) showed book-to-market ratio predicts returns beyond beta, directly motivating the Fama-French 3-factor model.\n\n**Roll's critique (1977)**: The true market portfolio includes all assets (private businesses, human capital, real estate) and is unobservable. Empirical tests using a stock index as a proxy for the market portfolio are therefore fundamentally flawed.\n\n**Conditional CAPM**: Beta varies over time with economic conditions. Recession betas differ from expansion betas. This time-varying nature partly reconciles CAPM with empirical anomalies.\n\n**CAPM's legacy despite failures**: Beta remains a foundational risk decomposition tool. Even if CAPM is imprecise, the principle that undiversifiable systematic risk deserves compensation while diversifiable risk does not remains central to modern finance.",
 highlight: [
 "flat SML",
 "low-beta anomaly",
 "size effect",
 "value effect",
 "Roll's critique",
 "conditional CAPM",
 "empirical tests",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A stock has a beta of 1.5, the risk-free rate is 4%, and the expected market return is 10%. According to CAPM, what is the stock's expected return, and what does it mean if the stock actually returns 15% on average?",
 options: [
 "CAPM expected return = 13%. Actual 15% implies alpha = +2%, suggesting mispricing or an unmodeled risk factor",
 "CAPM expected return = 19%. Actual 15% implies negative alpha of -4%",
 "CAPM expected return = 10%. Any return above 10% is pure alpha",
 "CAPM expected return = 15%. The stock is exactly fairly priced",
 ],
 correctIndex: 0,
 explanation:
 "CAPM: E(R) = 4% + 1.5 × (10%-4%) = 4% + 9% = 13%. If the stock actually earns 15%, Jensen's alpha = 15% - 13% = +2%. This means the stock plots above the Security Market Line and earns 2% more than its beta justifies. Under strict CAPM this should be arbitraged away. In practice, persistent positive alpha suggests either genuine manager skill, additional unpriced risk factors (which factor models attempt to capture), or data-mining bias in the backtest.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "According to CAPM, a diversified portfolio with very high idiosyncratic risk should earn higher expected returns than a portfolio with the same beta but lower idiosyncratic risk.",
 correct: false,
 explanation:
 "FALSE. CAPM explicitly states that only systematic risk (beta) is compensated with higher expected returns. Idiosyncratic risk can be eliminated through diversification at zero cost, so rational investors would not pay a premium for bearing it. Under CAPM, E(Ri) depends solely on Rf + β × (E(Rm) - Rf). Two portfolios with identical betas have identical CAPM expected returns regardless of their idiosyncratic risk levels. This is one of CAPM's core and most controversial predictions — in practice, high idiosyncratic volatility stocks often underperform, not outperform.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Empirical tests consistently find that portfolios of low-beta stocks earn higher risk-adjusted returns than CAPM predicts, while portfolios of high-beta stocks earn lower risk-adjusted returns than CAPM predicts. This is known as the 'flat SML' finding.",
 question:
 "Which explanation best accounts for why the SML is empirically flatter than CAPM predicts?",
 options: [
 "Institutional investors constrained against using leverage bid up high-beta stocks to reach return targets, compressing their future returns and creating the low-beta anomaly",
 "Arbitrageurs immediately correct any mispricing, so the flat SML cannot persist",
 "CAPM's predictions are perfectly accurate — the flat SML results from statistical noise",
 "High-beta stocks are riskier and therefore should always underperform on a risk-adjusted basis",
 ],
 correctIndex: 0,
 explanation:
 "The leading explanation for the flat SML is the leverage constraint / benchmarking story: many institutional investors (mutual funds, pension funds) cannot use explicit leverage. To boost returns they tilt toward high-beta stocks as a 'natural leverage' substitute. This excess demand for high-beta stocks drives up their prices and compresses forward returns below CAPM predictions. Simultaneously, low-beta stocks are undervalued and earn returns above CAPM predictions. This generates the low-volatility anomaly and is the basis for low-beta / minimum variance smart beta strategies.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Factor Models 
 {
 id: "portfolio-theory-3",
 title: "Factor Models",
 description:
 "APT, Fama-French 3-factor and 5-factor models, Carhart 4-factor, and the nature of factor risk premia",
 icon: "BarChart2",
 xpReward: 90,
 difficulty: "advanced",
 duration: 22,
 steps: [
 {
 type: "teach",
 title: "Arbitrage Pricing Theory",
 content:
 "Stephen Ross developed **Arbitrage Pricing Theory (APT)** in 1976 as an alternative to CAPM that requires far weaker assumptions.\n\n**APT model**:\nRi = E(Ri) + β1F1 + β2F2 + ... + βkFk + εi\n\nwhere Fk are unexpected changes in macroeconomic factors and εi is idiosyncratic noise.\n\n**Key assumptions of APT**:\n1. Returns are driven by a linear factor model\n2. There are many assets relative to factors (so idiosyncratic risk diversifies away)\n3. There are no arbitrage opportunities\n\nNotably, APT does NOT require a mean-variance efficient market portfolio or quadratic utility — it is based purely on no-arbitrage.\n\n**APT pricing equation**: In equilibrium, risk premia equal the factor betas times the factor risk premium:\n\nE(Ri) = Rf + βi1 × λ1 + βi2 × λ2 + ... + βik × λk\n\nwhere λk is the risk premium for factor k.\n\n**APT's limitation**: APT does not specify which factors matter. It is a theoretical framework — empirical researchers must identify the relevant factors. This gave rise to the empirical factor model literature.\n\n**APT vs CAPM**: CAPM is a special case of APT with a single factor (the market). APT is more general but less specific — it provides no guidance on what λk should be without additional assumptions.",
 highlight: [
 "Arbitrage Pricing Theory",
 "APT",
 "factor model",
 "no-arbitrage",
 "factor risk premium",
 "factor betas",
 ],
 },
 {
 type: "teach",
 title: "Fama-French Factor Models",
 content:
 "Eugene Fama and Kenneth French translated APT from theory into empirical practice by identifying specific factors that explain cross-sectional stock returns.\n\n**Fama-French 3-Factor Model (1993)**:\n\nRi - Rf = αi + βMKT(Rm-Rf) + βSMB × SMB + βHML × HML + εi\n\n1. **Market factor (MKT)**: Excess market return — systematic risk\n2. **SMB (Small Minus Big)**: Long small-cap, short large-cap — size premium (historically +3% per year)\n3. **HML (High Minus Low)**: Long high book-to-market (value), short low (growth) — value premium (historically +4% per year)\n\nAdded ~15% more cross-sectional return variation explained vs CAPM alone.\n\n**Carhart 4-Factor Model (1997)**: Added momentum:\n4. **MOM**: Long 12-1 month winners, short 12-1 month losers — momentum premium (historically +8% per year, but crash-prone)\n\n**Fama-French 5-Factor Model (2015)**: Added two quality factors:\n4. **RMW (Robust Minus Weak)**: Long high operating profit, short low operating profit — profitability factor\n5. **CMA (Conservative Minus Aggressive)**: Long low asset growth, short high asset growth — investment factor\n\nThe 5-factor model explains approximately 80-90% of cross-sectional return variation. The remaining unexplained alpha is true manager skill — increasingly rare to find consistently.",
 highlight: [
 "Fama-French",
 "SMB",
 "HML",
 "MOM",
 "RMW",
 "CMA",
 "size premium",
 "value premium",
 "momentum",
 "profitability factor",
 ],
 },
 {
 type: "teach",
 title: "Why Do Factor Risk Premia Exist?",
 content:
 "Factor premia are the excess returns earned by systematic exposure to certain characteristics. Understanding their source determines whether they will persist.\n\n**Value premium (HML)**:\n- Risk-based: Value stocks are distressed companies trading at low multiples. They have higher default risk, greater earnings volatility, and perform worst in recessions — justifying higher expected returns as compensation.\n- Behavioral: Investors extrapolate recent earnings trends, overpaying for glamour/growth and abandoning value stocks. Reversion to the mean generates value alpha.\n- Post-publication: Value underperformed growth significantly from 2007 to 2020 as risk-based justification weakened and interest rates fell.\n\n**Size premium (SMB)**:\n- Compensation for illiquidity, lower analyst coverage, higher transaction costs, and greater default risk for small firms.\n- Has weakened substantially since publication in the 1980s.\n\n**Momentum (MOM)**:\n- Primarily behavioral: herding, slow information diffusion, anchoring, and underreaction to earnings news.\n- Subject to sharp crashes (momentum unwind): when market sentiment reverses, momentum portfolios suffer severe drawdowns (2009: momentum factor lost ~80%).\n\n**Low volatility anomaly**:\n- Low-beta/low-volatility stocks earn higher Sharpe ratios than high-beta stocks — directly contradicting CAPM.\n- Explained by leverage constraints, lottery-seeking behavior among individual investors, and benchmarking pressure on institutions.\n\n**Factor crowding risk**: When too much capital chases the same factor, valuations stretch and subsequent returns disappoint. Monitoring factor valuation (e.g., value spread, momentum concentration) is essential for institutional factor investors.",
 highlight: [
 "value premium",
 "size premium",
 "momentum",
 "low volatility anomaly",
 "factor crowding",
 "risk-based",
 "behavioral",
 "momentum crash",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A portfolio manager regresses her fund's monthly excess returns against Fama-French 5 factors and finds: MKT beta = 0.90, SMB = +0.50, HML = -0.40, RMW = +0.30, CMA = -0.20, alpha = +0.10%/month. How should this be interpreted?",
 options: [
 "The fund has near-market equity exposure, tilts toward small-cap and growth stocks, holds high-quality profitable companies, invests aggressively, and generates about 1.2% per year in alpha beyond these five factor exposures",
 "The fund is market-neutral and all returns derive from unique stock selection skill",
 "Negative HML means the fund loses money on value stocks, making it a net loser on the value factor",
 "CMA = -0.20 means the fund shorts 20% of its portfolio in conservative companies",
 ],
 correctIndex: 0,
 explanation:
 "MKT = 0.90 means near-full equity market exposure. SMB = +0.50 means a positive tilt toward small-cap stocks. HML = -0.40 means a growth tilt (negative value loading). RMW = +0.30 means the fund holds higher-quality, more profitable companies. CMA = -0.20 means the fund tilts toward more aggressively investing companies (high asset growth). Alpha of +0.10%/month = ~1.2% annualized above all five factors — this is a good signal of skill, though statistical significance (t-stat > 2) is needed before claiming genuine edge.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Arbitrage Pricing Theory (APT) is more restrictive than CAPM because it requires identifying a specific list of macroeconomic risk factors.",
 correct: false,
 explanation:
 "FALSE. APT is actually less restrictive than CAPM. CAPM requires: (1) all investors have mean-variance preferences, (2) homogeneous expectations, and (3) the market portfolio is mean-variance efficient. APT only requires: (1) returns follow a linear factor structure, (2) many assets exist relative to factors (so idiosyncratic risk diversifies away), and (3) no arbitrage opportunities persist. APT is silent on which specific factors matter — this is both a strength (greater generality) and a weakness (less empirical guidance). CAPM is a special single-factor case of APT.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Risk Parity 
 {
 id: "portfolio-theory-4",
 title: "Risk Parity",
 description:
 "Equal risk contribution, volatility targeting, the Bridgewater All-Weather concept, and critiques of risk parity",
 icon: "Scale",
 xpReward: 85,
 difficulty: "advanced",
 duration: 18,
 steps: [
 {
 type: "teach",
 title: "Equal Risk Contribution",
 content:
 "Risk parity is a portfolio construction approach where each asset contributes equally to the portfolio's total risk — rather than allocating equal capital.\n\n**The problem with capital-equal allocations**: A 60/40 stock-bond portfolio allocates capital 60/40 but allocates RISK roughly 90/10 because equities are ~3-4x more volatile than bonds. The portfolio is effectively 90% an equity bet.\n\n**Risk contribution of asset i**:\n\nRC_i = wi × (σp / wi) = wi × [Σ_j wj × Cov(Ri, Rj)] / σp\n\nIn a risk parity portfolio: RC_1 = RC_2 = ... = RC_N = σp / N\n\n**Practical result**: Because bonds have lower volatility than stocks, bonds get higher capital allocations. A simple two-asset example with 15% equity vol and 5% bond vol and zero correlation yields approximately 75% bond weight and 25% equity weight to achieve equal risk contribution.\n\n**Volatility targeting**: Risk parity funds typically also apply a volatility target (e.g., 10% annualized portfolio volatility). Leverage is applied uniformly when the target cannot be reached with unlevered positions — which is common because low-risk assets like bonds are heavily weighted.\n\n**Diversification benefit**: By equalizing risk contributions across diverse asset classes (equities, bonds, commodities, inflation-linked bonds), risk parity maximizes the Sharpe ratio under the assumption that all assets have equal Sharpe ratios — an assumption that is controversial but not unreasonable as a starting point.",
 highlight: [
 "risk parity",
 "equal risk contribution",
 "risk contribution",
 "volatility targeting",
 "leverage",
 "diversification",
 ],
 },
 {
 type: "teach",
 title: "Bridgewater All-Weather and Four Quadrants",
 content:
 "Ray Dalio of Bridgewater Associates developed the All-Weather concept as an application of risk parity designed to perform in any economic environment.\n\n**The four economic quadrants**:\n1. Growth rising / Inflation rising: commodities, TIPS, equities outperform\n2. Growth rising / Inflation falling: equities, corporate bonds outperform\n3. Growth falling / Inflation rising: gold, commodities, TIPS outperform (stagflation scenario)\n4. Growth falling / Inflation falling: long-term nominal government bonds outperform\n\n**All-Weather allocation** (approximate):\n- 30% equities (growth quadrants)\n- 40% long-term bonds (deflation/falling growth)\n- 15% intermediate-term bonds\n- 7.5% gold (inflation rising)\n- 7.5% commodities\n\nThis is risk parity across four economic regimes, not equal capital parity.\n\n**Key features**:\n- Low equity concentration: equities are a smaller capital weight but their higher risk brings them to roughly equal risk contribution\n- Inflation protection: gold and commodities explicitly hedge inflation scenarios that destroy nominal bonds\n- Crisis performance: All-Weather lost only ~4% in 2008 vs -38% for the S&P 500\n\n**Leverage application**: Because bonds are heavily weighted and have low volatility, All-Weather strategies often employ leverage (bonds are borrowed) to hit a target overall volatility. This leverage is a key source of risk when interest rates rise rapidly — as seen in 2022 when All-Weather strategies lost ~25% as rates spiked globally.",
 highlight: [
 "All-Weather",
 "four quadrants",
 "economic regimes",
 "Bridgewater",
 "inflation protection",
 "stagflation",
 "crisis performance",
 ],
 },
 {
 type: "teach",
 title: "Risk Parity Critiques and Practical Considerations",
 content:
 "Risk parity has attracted both institutional adoption and significant criticism.\n\n**The leverage critique**: Risk parity requires substantial leverage on bonds to equalize risk contributions. This leverage is: \n- Costly: borrowing costs (repo rates) reduce net returns \n- Procyclical: when volatility rises, many risk parity funds delever simultaneously, amplifying market moves (August 2015, March 2020) \n- Dangerous in rising rate environments: long-duration bonds suffer large capital losses when rates rise sharply (2022)\n\n**The equal Sharpe ratio assumption**: Risk parity implicitly assumes all asset classes have similar long-run Sharpe ratios. If equities have structurally higher Sharpe ratios than bonds (which some evidence suggests), underweighting equities on a capital basis generates long-run return drag.\n\n**Crowded deleveraging**: Large amounts of capital following similar risk parity models creates a systemic coordination risk — when one fund delevels, others are forced to do the same, creating flash crashes in normally liquid markets.\n\n**Performance across regimes**:\n- Works well: Disinflationary environment with falling rates (1982-2021 mostly)\n- Works poorly: Rising inflation + rising rates simultaneously (1970s, 2022) — both bonds and equities lose simultaneously, eliminating the diversification benefit\n\n**Practical implementations**: Bridgewater Pure Alpha, AQR Risk Parity, Invesco All-Weather Strategy. Fees range from high (hedge fund structure) to low (ETFs like RPAR). Accessible versions for retail investors exist but often without full leverage.",
 highlight: [
 "leverage critique",
 "equal Sharpe assumption",
 "crowded deleveraging",
 "procyclical",
 "rising rates",
 "risk parity critique",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "In a simple two-asset risk parity portfolio (equities and bonds), equities have 16% annualized volatility and bonds have 4% annualized volatility. Assuming zero correlation, approximately what weight should bonds receive to achieve equal risk contribution?",
 options: [
 "80% bonds, 20% equities",
 "50% bonds, 50% equities",
 "40% bonds, 60% equities",
 "25% bonds, 75% equities",
 ],
 correctIndex: 0,
 explanation:
 "For equal risk contribution with zero correlation, weights are inversely proportional to volatility. Bond weight = 1/σ_bonds / (1/σ_bonds + 1/σ_equities) = (1/4) / (1/4 + 1/16) = 0.25 / (0.25 + 0.0625) = 0.25 / 0.3125 = 80%. Equity weight = 20%. Intuition: since bonds are 4× less volatile than equities, bonds need 4× more capital to contribute the same dollar of risk. This dramatic overweight to bonds is why risk parity strategies often require leverage to achieve a meaningful total portfolio return.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Risk parity portfolios performed poorly in 2022 primarily because the normally negative correlation between stocks and bonds broke down as inflation surged, eliminating the diversification benefit that risk parity depends on.",
 correct: true,
 explanation:
 "TRUE. Risk parity's core assumption is that bonds provide diversification against equity drawdowns — this held throughout the 2000-2021 period. In 2022, the Fed's aggressive rate hikes in response to 40-year-high inflation caused both stocks and bonds to fall sharply simultaneously. The stock-bond correlation turned decisively positive (as it historically was in high-inflation regimes like the 1970s). Long-duration bonds suffered their worst calendar year returns in over a century. Risk parity strategies, which hold large bond positions often with leverage, experienced drawdowns of 20-30% — among their worst performances on record.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 5: Black-Litterman 
 {
 id: "portfolio-theory-5",
 title: "Black-Litterman Model",
 description:
 "Overcoming estimation error in MPT, incorporating views, the tau parameter, and posterior expected returns",
 icon: "Brain",
 xpReward: 90,
 difficulty: "advanced",
 duration: 20,
 steps: [
 {
 type: "teach",
 title: "The Problem Black-Litterman Solves",
 content:
 "The Black-Litterman (BL) model, developed by Fischer Black and Robert Litterman at Goldman Sachs in 1990, solves the most vexing practical problem in MPT: **extreme sensitivity to input estimates**.\n\n**The core problem with standard mean-variance optimization**:\n\n1. Small changes in expected return estimates produce wildly different optimal portfolios\n2. The optimizer produces extreme, concentrated positions that no practitioner would trust\n3. Expected returns are nearly impossible to estimate accurately from historical data\n4. The result: mean-variance optimization is rarely used as-is in practice\n\n**The Black-Litterman insight**: Instead of trying to estimate expected returns directly from historical data, start from a **neutral baseline** derived from market equilibrium — what returns must be to justify current market prices — then adjust for investor views.\n\n**Implied equilibrium returns**: Working backward from the current market capitalization weights using reverse optimization:\n\nπ = δ × Σ × w_mkt\n\nwhere δ is the risk aversion coefficient, Σ is the covariance matrix, and w_mkt are the market capitalization weights.\n\nThis gives the set of expected returns that would make the current market portfolio mean-variance optimal. These are the **equilibrium implied returns** — a neutral starting point that incorporates all information embedded in current prices.",
 highlight: [
 "Black-Litterman",
 "estimation error",
 "implied equilibrium returns",
 "reverse optimization",
 "market equilibrium",
 "neutral baseline",
 ],
 },
 {
 type: "teach",
 title: "Incorporating Views and Bayesian Updating",
 content:
 "Black-Litterman uses Bayesian statistics to blend equilibrium returns with investor views, producing a posterior expected return vector.\n\n**Views in BL**: An investor can express views on absolute or relative returns:\n- Absolute view: 'I expect Apple to return 15% per year'\n- Relative view: 'I expect US equities to outperform European equities by 3%'\n\nViews are expressed as:\n- P: a matrix mapping views to assets\n- Q: the vector of expected returns implied by each view\n- Ω: the uncertainty (variance) around each view\n\n**BL posterior expected returns**:\n\nE(R)_BL = [(τΣ)¹ + P'Ω¹P]¹ × [(τΣ)¹π + P'Ω¹Q]\n\nThis blends equilibrium returns (π) with investor views (P, Q) weighted by their respective confidence (τΣ and Ω).\n\n**Tau (τ) parameter**: Controls the weight given to equilibrium returns vs views. τ = 0: pure equilibrium, no views incorporated. τ : pure view, ignore equilibrium. In practice, τ is often set to 1/T where T is the number of observations, reflecting the uncertainty in equilibrium return estimates.\n\n**Intuitive result**: If you have high confidence in a view, BL tilts portfolios significantly toward it. If confidence is low, BL stays close to market-cap weights. This produces **sensible, balanced portfolios** unlike standard MVO.",
 highlight: [
 "Bayesian updating",
 "posterior expected returns",
 "views",
 "tau parameter",
 "confidence",
 "absolute view",
 "relative view",
 ],
 },
 {
 type: "teach",
 title: "BL in Practice and Portfolio Construction Benefits",
 content:
 "Understanding BL theoretically is one thing — seeing how it transforms portfolio construction in practice is another.\n\n**Before BL (standard MVO)**: A typical MVO portfolio with 10 assets might show:\n- 40% in one emerging market stock (tiny return advantage, large position)\n- Negative weights in half the assets (short selling)\n- Wildly unstable weights across small input changes\n- Portfolios unrecognizable to the portfolio manager\n\n**After BL**: Starting from market-cap weights and incorporating 2-3 views:\n- The portfolio looks like a reasonable tilt away from market weights\n- Views are expressed proportionally to their confidence\n- The optimizer no longer overwhelms the signal with noise\n- The portfolio manager recognizes and can explain every position\n\n**Practical BL workflow**:\n1. Compute implied equilibrium returns from market-cap weights and covariance matrix\n2. Express views with explicit confidence levels\n3. Run BL posterior return computation\n4. Feed posterior returns and covariance matrix into standard MVO\n5. Apply constraints (long-only, sector limits, turnover budget)\n\n**Key advantage**: BL separates the estimation problem from the optimization problem. The equilibrium prior handles assets about which you have no view — they stay near market weight. Views are expressed only where you have genuine conviction, keeping the portfolio from being dominated by statistical noise.\n\n**Limitations**: BL still requires a covariance matrix (which has its own estimation error), and τ and Ω are subjective parameters that significantly influence results.",
 highlight: [
 "market-cap weights",
 "portfolio tilt",
 "equilibrium prior",
 "conviction",
 "estimation error reduction",
 "constraints",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "What is the primary purpose of starting from 'implied equilibrium returns' in the Black-Litterman model, rather than using historical average returns as inputs to mean-variance optimization?",
 options: [
 "Implied equilibrium returns represent what expected returns must be to justify current market prices, providing a neutral baseline that produces diversified portfolios without extreme positions",
 "Historical returns always have downward bias and need to be corrected upward to reflect future expected returns",
 "Implied equilibrium returns are easier to compute than historical averages, reducing computational cost",
 "The equilibrium approach ensures all assets in the portfolio will have positive expected returns",
 ],
 correctIndex: 0,
 explanation:
 "The key insight is that market prices already reflect the collective wisdom of all investors. By reverse-engineering what expected returns must be to justify current market-cap weights (the implied equilibrium returns), Black-Litterman obtains a neutral starting point that produces sensible, diversified portfolios. Historical returns are noisy, heavily influenced by specific sample periods, and cause MVO to generate extreme, unstable portfolios. The equilibrium prior anchors the optimization, preventing individual views from generating positions that overwhelm the rest of the portfolio.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "In the Black-Litterman model, if an investor expresses zero views (provides no P, Q, or Ω inputs), the optimal portfolio will equal the market-capitalization weighted portfolio.",
 correct: true,
 explanation:
 "TRUE. This is an elegant property of Black-Litterman. When no views are expressed, the posterior expected returns equal the equilibrium implied returns (π), and optimizing on these implied returns with the same covariance matrix from which they were derived produces exactly the market-capitalization weighted portfolio. This makes intuitive sense: with no private information or views, the best portfolio is the market portfolio. This property ensures BL degrades gracefully — the less conviction you have, the closer your portfolio is to the market, avoiding overconfident bets.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A portfolio manager uses Black-Litterman and expresses one view: 'I believe US technology stocks will outperform US financials by 4% annually.' She sets her confidence in this view (Ω) to a moderate level. The market-cap weight in tech is 28% and in financials is 13%.",
 question:
 "What portfolio adjustment would the BL model most likely produce relative to market-cap weights?",
 options: [
 "An overweight in tech stocks and underweight in financials, with the magnitude proportional to confidence in the view — not an extreme concentrated bet",
 "A 100% allocation to tech stocks to maximize the expected return from the view",
 "No change from market-cap weights because BL only uses historical data",
 "Selling all financials and buying an equivalent weight in government bonds as a defensive hedge",
 ],
 correctIndex: 0,
 explanation:
 "BL blends the view (tech outperforms financials by 4%) with the equilibrium prior (market weights) in proportion to the confidence level. At moderate confidence, the result is a modest overweight in tech and underweight in financials relative to market-cap weights — a sensible tilt, not an extreme concentrated bet. The higher the confidence (smaller Ω), the larger the deviation from market weights. This is the core benefit of BL: it translates views into portfolio tilts that are proportional to conviction, preventing the optimizer from amplifying uncertainty into extreme positions.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 6: Practical Portfolio Construction 
 {
 id: "portfolio-theory-6",
 title: "Practical Portfolio Construction",
 description:
 "Goal-based portfolios, liability matching, ESG/regulatory/tax constraints, and rebalancing rules",
 icon: "Briefcase",
 xpReward: 85,
 difficulty: "advanced",
 duration: 20,
 steps: [
 {
 type: "teach",
 title: "Goal-Based Portfolio Construction",
 content:
 "Goal-based investing rejects the single mean-variance framework in favor of multiple sub-portfolios, each matched to a specific financial goal.\n\n**The mental accounting insight**: Behavioral finance shows investors naturally bucket money by purpose. Goal-based portfolios formalize this intuition into a coherent framework.\n\n**Typical goal hierarchy**:\n1. **Safety bucket (floor)**: Capital preservation, emergency fund, near-term liabilities. Invested in cash, short-duration bonds, CDs. Cannot afford volatility.\n2. **Market bucket**: Core growth, retirement savings, medium-to-long horizon. Standard diversified portfolio (60/40 or all-equity depending on horizon).\n3. **Aspirational bucket**: Discretionary wealth, legacy goals, high-risk/reward opportunities. Can tolerate total loss.\n\n**Liability-relative optimization**: Rather than maximizing Sharpe ratio in absolute terms, measure portfolio risk relative to liabilities. A pension fund's risk is not absolute volatility but volatility relative to its liability stream — falling interest rates raise both bond values and pension liabilities simultaneously.\n\n**Horizon matching**: Match investment horizon to goal horizon. 10-year retirement savings can tolerate equity volatility and ride out bear markets. 3-year home down payment cannot — short-term volatility is permanent capital impairment relative to the goal.\n\n**Funded ratio**: For pension and endowment contexts, monitor funded ratio = Assets / PV(Liabilities). Funded ratio falling below 100% means the portfolio cannot meet obligations — a critical risk threshold.",
 highlight: [
 "goal-based investing",
 "safety bucket",
 "mental accounting",
 "liability-relative optimization",
 "horizon matching",
 "funded ratio",
 ],
 },
 {
 type: "teach",
 title: "Liability Matching and Duration Management",
 content:
 "Liability matching is the cornerstone of institutional portfolio management for pension funds, insurance companies, and endowments.\n\n**Immunization**: The technique of structuring a bond portfolio so that its value and cash flows match specific liability payments, regardless of interest rate movements.\n\n**Duration matching**: Match the Macaulay duration of assets to the duration of liabilities. When rates change, both asset and liability values move proportionally — the portfolio is immunized against small parallel rate shifts.\n\n**Cash flow matching (dedication)**: Match each liability payment with a specific bond coupon or principal payment. More precise than duration matching but requires more capital.\n\n**Liability-driven investing (LDI)**: A framework widely used by UK and European pension funds:\n- Hedge interest rate risk: Use long-duration bonds (or interest rate swaps/swaptions) to match liability duration\n- Hedge inflation risk: Use inflation-linked bonds (TIPS, UK linkers) to match real liability growth\n- Growth portfolio: With liabilities hedged, deploy residual risk budget in return-seeking assets\n\n**LDI in practice**: A pension fund with £1 billion in liabilities, 15-year duration, and 60% funded ratio might:\n- Hold £400M in long-dated gilts and TIPS (liability hedge)\n- Hold £600M in diversified growth assets\n- Use interest rate swaps to achieve full duration match on the liability side\n\n**Convexity matching**: Duration match only works for small rate changes. For larger shifts, assets and liabilities diverge unless convexity is also matched — bonds with higher convexity rise more (and fall less) for the same duration as rates change.",
 highlight: [
 "immunization",
 "duration matching",
 "cash flow matching",
 "liability-driven investing",
 "LDI",
 "inflation-linked bonds",
 "convexity matching",
 ],
 },
 {
 type: "teach",
 title: "Constraints and Rebalancing Rules",
 content:
 "Real-world portfolio construction operates under constraints that theory ignores — managing them efficiently is where implementation skill separates good from great portfolio managers.\n\n**ESG/SRI constraints**:\n- Exclusion screens: Remove sectors (tobacco, weapons, fossil fuels) — reduces opportunity set, potential tracking error vs benchmark\n- Best-in-class: Hold the least bad companies in each sector rather than excluding entirely\n- Active ownership/engagement: Retain holdings to use shareholder voting rights\n- Impact on factor exposure: ESG screens can inadvertently tilt toward growth (tech tends to score high ESG) or away from value (energy, financials often score low)\n\n**Regulatory constraints**: Pension funds (ERISA), insurance companies (Solvency II), and bank trading books (Basel III) operate under regulatory capital requirements that constrain allocation to risky or illiquid assets.\n\n**Tax constraints**:\n- Minimize turnover in taxable accounts to avoid realizing short-term gains (taxed at ordinary income rates)\n- Tax-loss harvesting: Sell losers to realize losses that offset gains elsewhere\n- Asset location: Hold tax-inefficient assets (bonds, REITs, alternatives) in tax-deferred accounts; hold tax-efficient assets (index funds, ETFs) in taxable accounts\n- Wash sale rule: Cannot immediately repurchase a substantially identical security after harvesting a loss\n\n**Rebalancing rules**:\n- Bandwidth-based: Rebalance when an asset drifts ±5% from target (e.g., equity target 60% rebalance if above 65% or below 55%)\n- Calendar-based: Rebalance annually or semi-annually — simple, predictable\n- Hybrid: Calendar check + bandwidth trigger — rebalance at scheduled review only if drift exceeds threshold\n- Cost consideration: Rebalancing has transaction costs, market impact, and potential tax consequences — over-rebalancing is a real risk",
 highlight: [
 "ESG constraints",
 "exclusion screens",
 "regulatory constraints",
 "tax-loss harvesting",
 "asset location",
 "bandwidth-based rebalancing",
 "wash sale rule",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A corporate pension fund has liabilities with an average duration of 18 years. Its current bond portfolio has duration of 7 years and is 80% funded. The finance team is concerned about rising rates. What is the immediate risk if rates rise by 1%?",
 options: [
 "Liabilities fall more than assets — the duration mismatch means a 1% rate rise shrinks liabilities by roughly 18% but only assets by roughly 7%, improving the funding ratio",
 "Assets fall more than liabilities — the 11-year duration gap means the fund loses money on the mismatch as rates rise",
 "Both assets and liabilities fall by exactly the same amount because duration matching is automatic",
 "Rising rates only affect the bond portfolio; pension liabilities are unaffected by interest rates",
 ],
 correctIndex: 0,
 explanation:
 "When interest rates rise, the present value of fixed future liability cash flows falls — and since liabilities have longer duration (18 years) than assets (7 years), they fall more. A 1% rate rise decreases liability PV by approximately 18% but asset value by approximately 7%. Net effect: the funding ratio improves when rates rise with this mismatch. However, if rates fall, the fund becomes worse funded (liabilities rise more than assets). Most pension funds actually want to close this duration gap (LDI approach) to eliminate the interest rate sensitivity on the funded ratio and focus purely on generating returns in the growth portfolio.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "In a taxable account, holding an asset that has declined significantly in value and selling it to realize a capital loss — even if you still believe in the long-term investment thesis — can be a rational portfolio management decision.",
 correct: true,
 explanation:
 "TRUE. Tax-loss harvesting — selling securities at a loss to realize tax losses — is a rational strategy even when you maintain conviction in the position. The realized loss creates a tax asset (offsets capital gains or, with limits, ordinary income), generating real economic value. After selling, you can immediately repurchase a similar but not 'substantially identical' security to maintain economic exposure (e.g., sell one S&P 500 ETF and immediately buy a different S&P 500 ETF). The 30-day wash sale rule prohibits repurchasing the exact same security, but does not prevent maintaining similar market exposure. Properly executed, tax-loss harvesting can add 0.5-1.5% per year in after-tax returns.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A $10 million family office portfolio has three goals: (1) $2M set aside for a house purchase in 2 years, (2) $5M for retirement in 20 years, (3) $3M for philanthropy with no specific timeline, willing to accept high risk. The family has no pension income and has a 37% marginal tax rate.",
 question:
 "Which portfolio construction approach best serves this family?",
 options: [
 "Segment into three goal-based sub-portfolios: near-zero-risk for the house goal, diversified equity-led portfolio for retirement, and high-risk growth assets for philanthropy — with tax-efficient placement of bonds and REITs in tax-deferred accounts",
 "Invest all $10M in a single 60/40 portfolio with annual rebalancing to simplify management",
 "Keep all $10M in cash equivalents to protect the 2-year house purchase goal, since any equity exposure is too risky",
 "Invest 100% in equities for maximum long-run return since the philanthropic and retirement goals have long horizons",
 ],
 correctIndex: 0,
 explanation:
 "Goal-based construction is clearly superior here. The 2-year house goal demands capital preservation — short-duration bonds or CDs are appropriate; equity volatility over 2 years creates real risk of missing the goal. The 20-year retirement goal can accommodate equity risk — time allows recovery. The philanthropic bucket has the highest risk tolerance and longest horizon. Segmenting prevents the house goal from being jeopardized by equity volatility while allowing growth in the longer-horizon buckets. Tax efficiency (asset location) matters at a 37% rate — placing tax-inefficient assets (bonds) in IRAs and tax-efficient assets (index ETFs) in taxable accounts improves after-tax returns meaningfully.",
 difficulty: 3,
 },
 ],
 },
 ],
};
