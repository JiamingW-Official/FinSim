import type { Unit } from "./types";

export const UNIT_PORTFOLIO_THEORY: Unit = {
  id: "portfolio-theory",
  title: "Portfolio Theory",
  description:
    "Master MPT, CAPM, factor models, asset allocation frameworks, and advanced portfolio risk management",
  icon: "PieChart",
  color: "#3b82f6",
  lessons: [
    // ─── Lesson 1: Modern Portfolio Theory ──────────────────────────────────────
    {
      id: "portfolio-theory-1",
      title: "Modern Portfolio Theory",
      description:
        "Efficient frontier, CAPM, Sharpe ratio, and the mathematics of diversification",
      icon: "PieChart",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Markowitz Mean-Variance Optimization",
          content:
            "Harry Markowitz's 1952 paper revolutionized investing by showing that risk and return cannot be evaluated in isolation — only in the context of the whole portfolio.\n\n**Portfolio return** is simply the weighted average of individual asset returns:\n\nRp = Σ wi × Ri\n\nwhere wi is the weight of asset i and Ri is its expected return.\n\n**Portfolio variance** is where diversification gets interesting. It depends on the full **covariance matrix**:\n\nσp² = Σi Σj wi × wj × Cov(Ri, Rj)\n\nWhen assets are not perfectly correlated (correlation < 1), combining them produces a portfolio whose variance is **less than the weighted average variance** of its components. This is the mathematical foundation of diversification.\n\n**Efficient Frontier**: By varying portfolio weights, you trace a curve of portfolios that maximize expected return for each level of risk. Portfolios on this frontier are called **mean-variance efficient**.\n\n**Types of risk**:\n- **Idiosyncratic (specific) risk**: company- or sector-level risk, fully diversifiable\n- **Systematic (market) risk**: economy-wide risk, cannot be diversified away\n\nAs you add more assets, idiosyncratic risk averages out. With ~20–30 uncorrelated assets, most idiosyncratic risk is eliminated. But systematic risk persists no matter how many assets you hold.",
          highlight: [
            "efficient frontier",
            "covariance matrix",
            "diversification",
            "idiosyncratic risk",
            "systematic risk",
            "mean-variance",
            "portfolio variance",
          ],
        },
        {
          type: "teach",
          title: "Capital Market Line and the Tangency Portfolio",
          content:
            "When you introduce a **risk-free asset** (e.g., T-bills) into the universe, the efficient frontier transforms into the **Capital Market Line (CML)**.\n\nThe CML is a straight line from the risk-free rate through the **tangency portfolio** — the single risky portfolio that maximizes the Sharpe ratio:\n\n**Sharpe Ratio** = (Rp − Rf) / σp\n\nwhere Rp = portfolio return, Rf = risk-free rate, σp = portfolio standard deviation.\n\nThe tangency portfolio is also called the **market portfolio** in theory — under CAPM assumptions, it represents all risky assets weighted by their market capitalization.\n\n**Key insight**: Any combination of the risk-free asset and the tangency portfolio lies on the CML and **dominates** every other portfolio on the efficient frontier (same return, lower risk — or higher return, same risk).\n\nInvestors with different risk tolerances don't need different risky portfolios — they just vary their allocation between the risk-free asset and the same tangency portfolio. This is the **separation theorem**.\n\nThe slope of the CML equals the maximum attainable Sharpe ratio.",
          highlight: [
            "Capital Market Line",
            "risk-free asset",
            "tangency portfolio",
            "Sharpe ratio",
            "market portfolio",
            "separation theorem",
          ],
        },
        {
          type: "teach",
          title: "CAPM: Pricing Risk with Beta",
          content:
            "The **Capital Asset Pricing Model (CAPM)** extends MPT to price individual securities:\n\n**E(Ri) = Rf + βi × (Rm − Rf)**\n\nwhere:\n- E(Ri) = expected return of asset i\n- Rf = risk-free rate\n- βi = asset's beta (sensitivity to market)\n- (Rm − Rf) = market risk premium (historically ~5–6% for US equities)\n\n**Beta** measures systematic risk:\n\nβi = Cov(Ri, Rm) / Var(Rm)\n\n- β = 1: moves with the market\n- β > 1: amplifies market moves (e.g., tech growth stocks)\n- β < 1: dampens market moves (e.g., utilities)\n- β < 0: moves opposite to market (e.g., gold in some periods)\n\n**Security Market Line (SML)** plots expected return vs beta for all assets. Assets above the SML are undervalued (positive alpha), below are overvalued.\n\n**Jensen's alpha** = Actual Return − CAPM Expected Return\n\nPositive alpha implies a manager added value beyond what beta exposure would predict.\n\n**CAPM assumptions and violations**: single period, no taxes or transaction costs, all investors hold the same mean-variance efficient portfolio, normally distributed returns. Real markets violate every assumption — yet beta remains a useful risk decomposition tool.",
          highlight: [
            "CAPM",
            "beta",
            "Security Market Line",
            "alpha",
            "Jensen's alpha",
            "market risk premium",
            "systematic risk",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A portfolio has an annual return of 12%, a risk-free rate of 5%, and a standard deviation of 8%. What is its Sharpe ratio?",
          options: [
            "0.875",
            "1.50",
            "0.625",
            "1.20",
          ],
          correctIndex: 0,
          explanation:
            "Sharpe ratio = (Rp − Rf) / σp = (12% − 5%) / 8% = 7% / 8% = 0.875. This represents the excess return earned per unit of total volatility. A Sharpe above 1.0 is considered good in live investing — 0.875 is solid but not exceptional.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Diversification eliminates all portfolio risk if you hold enough assets.",
          correct: false,
          explanation:
            "FALSE. Diversification only eliminates idiosyncratic (company-specific) risk. Systematic risk — caused by broad economic forces (recessions, rate changes, panics) — affects all assets and cannot be diversified away. Even a perfectly diversified global portfolio still has systematic risk exposure. This is a fundamental insight of CAPM: investors are only compensated for bearing systematic risk, not idiosyncratic risk.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are analyzing two stocks. Stock A has a beta of 1.8 and Stock B has a beta of 0.4. The risk-free rate is 4% and the market risk premium is 6%.",
          question:
            "According to CAPM, what are the expected returns for Stock A and Stock B respectively?",
          options: [
            "Stock A: 14.8%, Stock B: 6.4%",
            "Stock A: 10.8%, Stock B: 2.4%",
            "Stock A: 12.4%, Stock B: 8.2%",
            "Stock A: 18.8%, Stock B: 4.4%",
          ],
          correctIndex: 0,
          explanation:
            "Using E(Ri) = Rf + βi × market risk premium: Stock A = 4% + 1.8 × 6% = 4% + 10.8% = 14.8%. Stock B = 4% + 0.4 × 6% = 4% + 2.4% = 6.4%. High-beta assets demand higher expected returns as compensation for greater systematic risk. Stock A's high beta makes it a poor defensive holding — it will amplify both market rallies and crashes.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Factor Models ─────────────────────────────────────────────────
    {
      id: "portfolio-theory-2",
      title: "Factor Models",
      description:
        "From CAPM to Fama-French 5-factor, factor premia, and smart beta implementation",
      icon: "BarChart2",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "From Single-Factor to Multi-Factor Models",
          content:
            "CAPM explains returns with a single factor: the market. But empirical tests showed systematic anomalies CAPM couldn't explain — small stocks outperformed large stocks, and cheap stocks outperformed expensive ones.\n\n**Arbitrage Pricing Theory (APT)**: Stephen Ross proposed that returns are driven by multiple risk factors, not just the market:\n\nRi = Rf + β1F1 + β2F2 + ... + βkFk + εi\n\n**Fama-French 3-Factor Model (1993)**:\n1. **Market factor (Rm − Rf)**: excess market return\n2. **SMB (Small Minus Big)**: long small-cap, short large-cap — size premium\n3. **HML (High Minus Low)**: long high book-to-market (value), short low (growth) — value premium\n\nAdded ~15% more return variance explained vs CAPM alone.\n\n**Carhart 4-Factor Model**: adds **MOM (Momentum)** — long 12-month winners, short 12-month losers.\n\n**Fama-French 5-Factor Model (2015)**: adds two more:\n4. **RMW (Robust Minus Weak)**: profitability factor — high operating profit vs low\n5. **CMA (Conservative Minus Aggressive)**: investment factor — low asset growth (conservative) vs high (aggressive)\n\nToday's best factor models explain 80–90% of cross-sectional return variation. The remaining unexplained return is true alpha — increasingly rare.",
          highlight: [
            "APT",
            "Fama-French",
            "SMB",
            "HML",
            "momentum",
            "RMW",
            "CMA",
            "multi-factor",
          ],
        },
        {
          type: "teach",
          title: "Factor Premia: Why Do They Persist?",
          content:
            "Factor premia are the excess returns earned by systematic exposure to certain characteristics. Understanding their source helps predict whether they will persist.\n\n**Value premium**: Cheap stocks (high book/price) outperform on average. Explanations: (1) risk-based — distressed companies are riskier in bad times, requiring higher compensation; (2) behavioral — investors extrapolate past earnings trends, overpaying for growth and abandoning value stocks.\n\n**Size premium**: Small-caps outperform large-caps on average. Possibly compensation for illiquidity, higher uncertainty, and lower analyst coverage. Has weakened significantly since the 1980s publication of the research.\n\n**Momentum**: Past 12-month winners outperform 3–12 months forward. Behavioral explanation dominates: herding, slow information diffusion, anchoring. No strong risk-based story.\n\n**Quality/Profitability**: High-profit companies earn higher returns than CAPM predicts. Fama-French RMW captures this. Theoretically puzzling — high-quality, less risky firms should earn lower returns under standard theory.\n\n**Low Volatility Anomaly**: Low-volatility stocks outperform high-volatility stocks on a risk-adjusted basis — directly contradicting CAPM. Explained by institutional leverage constraints, lottery-seeking behavior, and benchmarking pressure.\n\n**Factor crowding risk**: When too much capital chases the same factor, valuations stretch and subsequent returns disappoint. Momentum is especially prone to sudden crowding unwinds.",
          highlight: [
            "value premium",
            "size premium",
            "momentum",
            "quality",
            "low volatility anomaly",
            "factor crowding",
          ],
        },
        {
          type: "teach",
          title: "Factor Investing in Practice",
          content:
            "Understanding factors academically is one thing — implementing them in a portfolio is another.\n\n**Pure factor ETFs** provide low-cost, systematic factor exposure:\n- **VLUE** (iShares Edge MSCI Value): HML-style value factor\n- **MTUM** (iShares Edge MSCI Momentum): 12-month momentum\n- **QUAL** (iShares Edge MSCI Quality): profitability and balance sheet strength\n- **SIZE** (iShares Edge MSCI Size): small-cap tilt\n\n**Factor timing** — trying to predict which factor will outperform — is notoriously difficult. Factors can underperform for years (value underperformed growth 2007–2020). Most evidence suggests strategic (passive) factor allocation beats tactical timing.\n\n**Factor cyclicality**: Value tends to outperform in early economic recoveries. Momentum tends to work in trending markets and crash in reversals. Low volatility shines in late-cycle defensive periods.\n\n**Smart beta vs active factor investing**:\n- Smart beta: rules-based, transparent, low-cost factor exposure\n- Active factor: discretionary tilts, timing, proprietary signals — higher fees, potentially higher alpha\n\n**Key risks**: factor crowding (too many investors in the same trade), factor decay (premia disappear after publication), and look-ahead bias in backtesting (inflate paper returns).",
          highlight: [
            "VLUE",
            "MTUM",
            "QUAL",
            "smart beta",
            "factor timing",
            "factor cyclicality",
            "look-ahead bias",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In the Fama-French 3-factor model, what does the SMB factor represent?",
          options: [
            "A long small-cap, short large-cap portfolio capturing the size premium",
            "A measure of stock momentum over the past 6 months",
            "The spread between sovereign bond yields and corporate yields",
            "A factor measuring short interest versus market breadth",
          ],
          correctIndex: 0,
          explanation:
            "SMB stands for 'Small Minus Big' — it is constructed by going long a diversified portfolio of small-cap stocks and short a portfolio of large-cap stocks. The positive return to this factor historically has been interpreted as a size premium: compensation for the additional risks of investing in smaller, less liquid companies. SMB is one of the three original Fama-French factors alongside the market factor and HML (value).",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Stocks that have performed well over the past 12 months tend, on average, to continue outperforming over the next 3 to 12 months.",
          correct: true,
          explanation:
            "TRUE. This is the momentum factor, documented by Jegadeesh and Titman (1993) and added to Fama-French as the Carhart 4th factor. Stocks in the top decile of 12-month returns (excluding the most recent month to avoid short-term reversal) tend to outperform the bottom decile over subsequent 3–12 months. The effect is strongest in mid-cap stocks and weakest in micro-caps. Momentum is primarily explained by behavioral factors: herding, slow information diffusion, and investor anchoring.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A portfolio manager runs a regression of her fund's monthly returns against the Fama-French 3 factors. The results show: market beta = 0.95, SMB loading = 0.45, HML loading = −0.30, alpha = 0.12% per month.",
          question:
            "How should you interpret the factor loadings and alpha of this fund?",
          options: [
            "The fund has near-market equity risk, tilts toward small-cap and growth stocks, and generates 1.44% excess annual return beyond factor compensation",
            "The fund is market-neutral, avoids small-caps, and loses money net of fees",
            "The SMB and HML loadings indicate the fund uses derivatives to hedge equity risk",
            "Positive alpha of 0.12% per month always means the manager has genuine skill",
          ],
          correctIndex: 0,
          explanation:
            "Market beta of 0.95 means near-full equity market exposure. SMB = +0.45 means a positive size tilt (small-cap overweight). HML = −0.30 means a negative value loading — the fund tilts toward growth stocks (low book-to-market). Alpha of 0.12%/month = ~1.44% annualized above what the three factors would predict. However, alpha should be interpreted cautiously: it may reflect omitted factors (e.g., momentum), survivorship bias, or genuine skill. Statistical significance (t-stat > 2) is required before concluding real skill.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Asset Allocation ──────────────────────────────────────────────
    {
      id: "portfolio-theory-3",
      title: "Asset Allocation",
      description:
        "Strategic vs tactical allocation, classic portfolio frameworks, and rebalancing strategies",
      icon: "Layers",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Strategic, Tactical, and Dynamic Allocation",
          content:
            "Asset allocation — how you divide capital across asset classes — explains more than 90% of portfolio return variation over time. Getting it right matters far more than individual security selection.\n\n**Strategic Asset Allocation (SAA)**: The long-term anchor. Based on investor goals, time horizon, and risk tolerance. Reviewed and **rebalanced annually**. Example: 60% global equities, 30% bonds, 10% alternatives. SAA ignores short-term market conditions and stays consistent through cycles.\n\n**Tactical Asset Allocation (TAA)**: Active tilts away from SAA based on medium-term market views. Typically operates within a **10–20% band** around SAA targets. Example: Underweighting equities to 45% during elevated valuations while keeping SAA at 60%. TAA requires skill — evidence that it consistently adds value is mixed.\n\n**Dynamic Asset Allocation (DAA)**: More aggressive regime switching. Moves from 'risk-on' (high equities, commodities, credit) to 'risk-off' (government bonds, cash, gold) based on macro signals or quantitative triggers. Used by risk parity and managed futures strategies.\n\n**Key trade-off**: SAA → lowest cost, highest predictability. DAA → highest potential upside, highest risk of being wrong at the wrong time. Most individual investors are best served by SAA with disciplined rebalancing.",
          highlight: [
            "Strategic Asset Allocation",
            "Tactical Asset Allocation",
            "Dynamic Asset Allocation",
            "rebalancing",
            "risk-on",
            "risk-off",
          ],
        },
        {
          type: "teach",
          title: "Classic Portfolio Frameworks",
          content:
            "Decades of institutional practice have produced several canonical portfolio blueprints:\n\n**60/40 Portfolio** (stocks/bonds):\nThe default institutional framework. Historically generated ~8–10% annual returns with moderate volatility. Works because stocks and bonds are negatively correlated in most inflationary environments — but this breaks down when inflation and growth both fall simultaneously (2022: both assets lost money).\n\n**Ray Dalio's All-Weather Portfolio**:\nDesigned to perform in any economic regime (growth up/down × inflation up/down):\n- 30% stocks (growth rising)\n- 40% long-term bonds (growth falling)\n- 15% intermediate bonds\n- 7.5% gold (inflation rising)\n- 7.5% commodities\nLower volatility than 60/40, better crisis performance, but lower long-run returns.\n\n**Permanent Portfolio** (Harry Browne):\n25% each: stocks, long-term bonds, gold, cash\nEach asset thrives in one of four economic seasons: prosperity (stocks), deflation/recession (bonds), inflation (gold), tight money/crisis (cash). Ultra-simple, well-diversified.\n\n**Risk Parity**:\nInstead of equal capital allocation, each asset contributes **equal risk** to the portfolio. Because bonds have much lower volatility than stocks, they get higher capital weight (often using leverage). Bridgewater's All-Weather is a risk parity strategy.",
          highlight: [
            "60/40",
            "All-Weather",
            "Permanent Portfolio",
            "risk parity",
            "equal risk contribution",
          ],
        },
        {
          type: "teach",
          title: "Rebalancing Strategies",
          content:
            "Rebalancing — returning the portfolio to target weights after drift — is where long-term discipline translates to actual returns.\n\n**Calendar rebalancing**: Rebalance at fixed intervals (annual, quarterly). Simple and low-cost. Annual rebalancing is often sufficient — more frequent rebalancing increases transaction costs with marginal benefit.\n\n**Threshold rebalancing**: Rebalance when any asset drifts beyond a set band (e.g., ±5% from target). Responds to large market moves without unnecessary activity in calm periods. More efficient than calendar rebalancing in turbulent markets.\n\n**Volatility-targeted rebalancing**: Scale positions down automatically when volatility spikes (e.g., VIX > 30). Acts as a systematic de-risking mechanism and reduces drawdowns.\n\n**Tax-efficient rebalancing**:\n- Use **new contributions** to buy underweighted assets (no tax event)\n- **Harvest losses** in taxable accounts to offset gains\n- Rebalance in tax-deferred accounts (IRA, 401k) where possible\n- Avoid rebalancing frequently in taxable accounts — short-term gains are taxed at ordinary rates\n\n**Rebalancing premium**: Systematic rebalancing can earn a small return premium by forcing 'buy low, sell high' behavior — buying assets after they fall and trimming after they rise. The premium is real but modest (0.3–0.5% annually in simulations).",
          highlight: [
            "calendar rebalancing",
            "threshold rebalancing",
            "volatility targeting",
            "tax-loss harvesting",
            "rebalancing premium",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A risk parity portfolio differs from a traditional 60/40 portfolio primarily because it:",
          options: [
            "Allocates capital so that each asset class contributes equally to total portfolio risk",
            "Invests 50% in equities and 50% in bonds regardless of market conditions",
            "Only invests in assets with positive momentum",
            "Concentrates in a single asset class during favourable regimes",
          ],
          correctIndex: 0,
          explanation:
            "Risk parity targets equal risk contribution from each asset class, not equal capital allocation. Because bonds are much less volatile than equities (typically 3–4× less), bonds receive a much larger capital weight (often leveraged) to match equity's risk contribution. This produces a more balanced exposure to different economic scenarios compared to 60/40, which is dominated by equity risk despite appearing balanced by capital weight.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The 60/40 stock-bond portfolio is considered a safe all-weather strategy because stocks and bonds are always negatively correlated.",
          correct: false,
          explanation:
            "FALSE. While stocks and bonds have been negatively correlated during most of the post-2000 period (a disinflationary environment), this is not guaranteed. In 2022, both US equities and bonds posted significant losses simultaneously as inflation surged and the Fed hiked aggressively. The stock-bond correlation turned positive — a regime historically seen in high-inflation periods (like the 1970s). The 60/40 portfolio works well in many environments but is NOT a guaranteed all-weather strategy.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Your portfolio target is 60% equities and 40% bonds. After a strong equity rally, your portfolio has drifted to 72% equities and 28% bonds. Your rebalancing policy has a ±5% threshold. You are in a taxable account.",
          question:
            "What is the most tax-efficient way to rebalance back toward target?",
          options: [
            "Redirect all new contributions and dividends to bond purchases before selling equities",
            "Immediately sell equities to trigger gains and use proceeds to buy bonds",
            "Do nothing — wait for equities to fall naturally back to 60%",
            "Switch to a 70/30 target permanently to reflect the new market reality",
          ],
          correctIndex: 0,
          explanation:
            "The most tax-efficient rebalancing approach is to use new cash flows (contributions, dividends, coupons) to buy the underweighted asset (bonds) before selling any equities. Selling equities that have appreciated would trigger a capital gains tax event. Only if contributions are insufficient to close the gap should you sell equities — and if you must sell, prefer tax-lots with losses or long-term gains (lower rate) over short-term gains.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Alternative Investments ──────────────────────────────────────
    {
      id: "portfolio-theory-4",
      title: "Alternative Investments",
      description:
        "Private equity, hedge funds, and real assets in a portfolio context",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Private Equity in a Portfolio",
          content:
            "Private equity (PE) offers access to returns unavailable in public markets — at the cost of locking up capital for years.\n\n**Illiquidity premium**: PE historically outperforms public equities by 3–5% annually (on a PME basis). Part of this is genuine illiquidity compensation; part reflects leverage, selection, and reporting lag.\n\n**J-curve**: PE funds draw capital slowly over 3–5 years (investment period), generate negative returns early (management fees + no exits), and then deliver returns in years 5–10 as portfolio companies are sold. The early negative period shaped like the letter 'J' is expected behavior, not failure.\n\n**Vintage year diversification**: Committing to PE funds across multiple years smooths out the J-curve and reduces dependence on a single economic cycle at exit time. Institutional investors typically commit to 3–5 vintage years concurrently.\n\n**Over-commitment strategy**: Because PE draws capital slowly, institutions can commit more than their target allocation knowing not all commitments will be called simultaneously. Typical over-commitment ratio: 1.2–1.5×.\n\n**NAV reporting lag**: PE net asset values are reported quarterly with a 90-day lag and use appraisal-based (not mark-to-market) valuations. This artificially smooths returns and understates true volatility — creating an illusion of lower correlation with public markets.\n\n**PME (Public Market Equivalent)**: Benchmarks PE returns against what a hypothetical investment in a public index (e.g., S&P 500) would have returned with the same cash flow timing.",
          highlight: [
            "illiquidity premium",
            "J-curve",
            "vintage year diversification",
            "over-commitment",
            "NAV",
            "PME",
          ],
        },
        {
          type: "teach",
          title: "Hedge Funds in a Portfolio",
          content:
            "Hedge funds pursue **absolute return** — positive returns regardless of market direction. In theory, they offer diversification benefits unavailable from long-only assets.\n\n**Correlation potential**: Market-neutral strategies (long/short equity with zero net exposure) have low theoretical correlation to equities. However, during crises, correlations spike across all risk assets — hedge funds often disappoint precisely when diversification is most needed.\n\n**Fee drag**: The traditional '2 and 20' (2% management fee, 20% performance fee) is a severe headwind. Even a skilled manager generating 10% gross returns leaves investors with only 6–7% net in a good year. Industry average fees have compressed to roughly 1.5% management + 17% performance, but remain high relative to passive alternatives.\n\n**Strategies that add genuine diversification**:\n- **Market neutral**: long/short with near-zero beta — low equity correlation\n- **Global macro**: trade currencies, rates, commodities on macro views — different risk factor set\n- **Managed futures (CTAs)**: trend-following across futures markets; historically provides **crisis alpha** — positive returns during equity drawdowns when momentum works across asset classes\n\n**Due diligence considerations**: Lock-up periods, redemption gates, side pockets (illiquid holdings segregated), and operational risk (Madoff) are unique to hedge funds. Audited financials and independent fund administrators are minimum standards.",
          highlight: [
            "absolute return",
            "market neutral",
            "global macro",
            "managed futures",
            "crisis alpha",
            "fee drag",
            "2 and 20",
          ],
        },
        {
          type: "teach",
          title: "Real Assets: Commodities, REITs, and Infrastructure",
          content:
            "Real assets — physical or claims on physical assets — provide inflation protection and diversification beyond financial assets.\n\n**Commodities**:\n- **Inflation hedge**: commodity prices tend to rise with inflation, unlike nominal bonds\n- **Positive skew during crises**: oil and agricultural commodities spike during supply shocks, providing portfolio insurance\n- **Negative carry**: futures-based commodity investing suffers from contango (futures above spot) — a constant roll cost. Direct commodity ownership avoids this but is impractical.\n- Diversified commodity indices (Bloomberg Commodity, S&P GSCI) reduce single-commodity concentration risk\n\n**REITs (Real Estate Investment Trusts)**:\n- Listed REITs provide liquid real estate exposure with mandatory 90% dividend distribution\n- Long-run return profile similar to equities but with higher income yield\n- Inflation sensitivity: property values and rents tend to adjust with inflation over time\n- Correlation with equities is high in short-term (listed markets), lower over longer horizons\n\n**Infrastructure**:\n- Regulated utilities, toll roads, airports, pipelines — characterized by **long-duration, stable cash flows**\n- Often **inflation-linked** (regulated returns tied to CPI)\n- Low correlation to equity cycle\n- Primarily accessed via unlisted funds or listed infrastructure ETFs (IFRA, PAVE)\n\n**Timberland and Farmland**: Institutional alternatives with genuine low correlation to financial assets, inflation protection, and biological growth returns — accessible only at institutional scale.",
          highlight: [
            "inflation hedge",
            "commodities",
            "REITs",
            "infrastructure",
            "contango",
            "crisis alpha",
            "inflation-linked",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "What is the 'illiquidity premium' in the context of private equity investments?",
          options: [
            "The additional return investors earn as compensation for tying up capital in illiquid investments for years",
            "A fee charged by private equity managers for early redemptions",
            "The discount applied to PE valuations to reflect their lack of daily pricing",
            "The spread between PE fund returns and venture capital fund returns",
          ],
          correctIndex: 0,
          explanation:
            "The illiquidity premium is the additional return investors expect to earn for accepting that they cannot easily sell their investment. PE investors cannot exit for 7–12 years and must commit capital for the fund's full life. Historically this has translated to 3–5% annualized outperformance vs equivalent public equity exposure (measured by PME). However, part of apparent PE outperformance reflects leverage, survivorship bias, and smoothed NAV reporting — not purely the illiquidity premium.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Adding alternative investments to a portfolio always reduces overall portfolio risk.",
          correct: false,
          explanation:
            "FALSE. Whether alternatives reduce portfolio risk depends entirely on their strategy, fees, and actual realized correlation. High-fee hedge funds with opaque strategies can add idiosyncratic risk or even blow up (Long-Term Capital Management, Archegos). Some alternatives are highly leveraged and can amplify losses. Managed futures genuinely tend to provide diversification; long-short equity hedge funds often end up highly correlated to equities after leverage is stripped out. Alternatives are tools — their risk impact must be assessed individually, not assumed to be beneficial.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A university endowment with a 30-year investment horizon is considering adding a 15% allocation to private equity. They currently have 60% equities and 40% fixed income. The PE allocation would come from equities.",
          question:
            "Which consideration is MOST important for this specific investor when evaluating this allocation?",
          options: [
            "Whether the endowment can manage the J-curve and illiquidity across its annual spending needs",
            "Whether PE has ever underperformed the S&P 500 in any single year",
            "Whether the PE manager charges exactly 2% management fee and 20% performance fee",
            "Whether short-term NAV reporting shows negative returns in year one",
          ],
          correctIndex: 0,
          explanation:
            "For an endowment with a long horizon, the most critical PE consideration is liquidity management: the J-curve means negative returns and no capital distributions for 3–5 years. The endowment must ensure its annual spending (typically 4–5% of assets) can be met from liquid assets even as PE draws down capital and before distributions begin. Vintage year diversification and sizing the PE allocation against the liquid portfolio are the core structural issues. Fee structures and year-one NAV are less critical than liquidity matching.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Portfolio Risk Management ────────────────────────────────────
    {
      id: "portfolio-theory-5",
      title: "Portfolio Risk Management",
      description:
        "Tail risk hedging, drawdown control, CPPI, and practical portfolio construction",
      icon: "Shield",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Tail Risk Hedging",
          content:
            "Standard diversification fails precisely when it is needed most — during market crises, correlations converge toward 1. Tail risk hedging explicitly addresses this by paying for insurance against extreme outcomes.\n\n**Long put options on the portfolio**: Buying put options on an equity index provides direct insurance — profits rise as the market falls. The challenge is cost: out-of-the-money puts in normal markets carry negative carry (theta decay). A 1% OTM S&P put expiring in 3 months costs roughly 1–2% of notional per year in calm conditions.\n\n**Variance swaps**: Pay fixed volatility, receive realized volatility. Profit when realized volatility exceeds implied — which happens sharply during crises. More efficient than options for pure volatility exposure but accessible only to institutional investors.\n\n**VIX call options**: Buy calls on the CBOE Volatility Index. VIX spikes during equity crashes (2020: VIX hit 85; 2008: 80+). VIX calls can produce large payoffs during crashes. Negative carry in normal times.\n\n**Safe haven allocation**: Instead of derivatives, allocate 5–15% to assets that appreciate or hold value during crises: gold, US Treasuries, Swiss franc (CHF), Japanese yen. Lower crisis alpha than derivatives but no explicit cost structure.\n\n**Cost-benefit analysis**: A tail hedge that costs 1% per year but prevents a −30% drawdown once per decade produces a net benefit. Calculate break-even frequency: if the hedge costs C% annually and prevents a loss of L%, the hedge pays if crises occur more often than C/L per year.",
          highlight: [
            "tail risk",
            "put options",
            "variance swaps",
            "VIX",
            "safe haven",
            "gold",
            "crisis alpha",
            "negative carry",
          ],
        },
        {
          type: "teach",
          title: "Drawdown Control: CPPI and Volatility Targeting",
          content:
            "Beyond tail hedging, systematic drawdown control strategies provide ongoing portfolio protection.\n\n**CPPI (Constant Proportion Portfolio Insurance)**:\nThe most widely used floor-based protection mechanism:\n1. Set a **floor** = minimum acceptable portfolio value (e.g., 80% of initial capital)\n2. **Cushion** = Current Portfolio Value − Floor\n3. **Risky asset investment** = m × Cushion (where m is the multiplier, typically 3–5)\n\nAs markets fall, cushion shrinks → reduce risky exposure. As markets rise, cushion grows → increase exposure. The floor is never breached (in theory) as long as the risky asset doesn't gap below the floor in a single period.\n\nLimitation: CPPI can get 'trapped in cash' after sharp market falls when cushion → 0, missing subsequent recoveries.\n\n**Volatility Targeting**:\nMaintain a constant target volatility (e.g., 10% annualized) by scaling position sizes:\n- When realized volatility rises (VIX spikes) → reduce position sizes\n- When realized volatility falls → increase position sizes\n\nUsed by risk parity funds and systematic CTAs. Reduces drawdowns by deleveraging during turbulent periods.\n\n**Crisis alpha via managed futures**: Trend-following CTA funds have historically generated positive returns during sustained equity bear markets (2000–2002: +24%, 2008: +18%) by shorting equities and riding falling trends. They diversify in a way traditional bonds cannot during inflationary environments.",
          highlight: [
            "CPPI",
            "floor",
            "cushion",
            "volatility targeting",
            "managed futures",
            "crisis alpha",
            "deleveraging",
          ],
        },
        {
          type: "teach",
          title: "Portfolio Construction in Practice",
          content:
            "Real-world portfolio construction involves constraints, costs, and evaluation that theory ignores.\n\n**Portfolio constraints**:\n- **Concentration limits**: maximum weight per stock (e.g., 5%), sector (20%), or country\n- **ESG/SRI screens**: exclusion lists, best-in-class selection, engagement — can affect factor exposure\n- **Tracking error budget**: active managers operate within a permitted deviation from benchmark (e.g., ±3% annual TE)\n\n**Transaction costs** erode returns significantly at scale: brokerage, market impact (large orders move prices), spread, and taxes. A strategy with 1% theoretical alpha and 0.8% annual transaction costs has marginal value.\n\n**Investment Policy Statement (IPS)**: The governing document for institutional portfolios. Specifies return objective, risk tolerance, liquidity needs, time horizon, tax status, legal constraints, and unique considerations. Every allocation decision should trace back to the IPS.\n\n**Performance evaluation metrics**:\n- **Sharpe ratio**: return per unit of total risk\n- **Sortino ratio**: return per unit of downside risk\n- **Calmar ratio**: annualized return / maximum drawdown — relevant for investors with drawdown constraints\n- **Maximum Drawdown**: peak-to-trough decline — intuitive measure of worst-case experience\n- **Information Ratio**: active return / tracking error — measures skill of an active manager relative to benchmark\n\nNo single metric tells the full story. Evaluate performance across multiple regimes and market environments before drawing conclusions about manager skill.",
          highlight: [
            "concentration limits",
            "ESG",
            "tracking error",
            "Investment Policy Statement",
            "Sharpe ratio",
            "Sortino ratio",
            "Calmar ratio",
            "maximum drawdown",
            "Information Ratio",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In a CPPI strategy, the 'cushion' is defined as:",
          options: [
            "The current portfolio value minus the floor (minimum acceptable value)",
            "The amount held in cash reserves outside the main portfolio",
            "The difference between the Sharpe ratio and the risk-free rate",
            "The maximum permitted drawdown before the strategy is terminated",
          ],
          correctIndex: 0,
          explanation:
            "In CPPI, the cushion = Current Portfolio Value − Floor. The floor represents the minimum acceptable value the investor never wants to breach. The risky asset allocation is then m × Cushion, where m is the multiplier (commonly 3–5). As the portfolio value falls toward the floor, the cushion shrinks and the strategy automatically reduces risky exposure. If markets move continuously, the floor is theoretically protected — but gap risk (e.g., an overnight -20% move) can breach the floor before the portfolio can be rebalanced.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A volatility targeting strategy — which reduces position size when market volatility is high — always improves risk-adjusted returns compared to a static buy-and-hold allocation.",
          correct: false,
          explanation:
            "FALSE. While volatility targeting can reduce drawdowns and improve the Sharpe ratio over many historical periods, it does not always improve risk-adjusted returns. Key limitations: (1) Transaction costs from frequent rebalancing can erode gains; (2) Volatility targeting often cuts exposure after a sharp initial drop — missing the recovery rally and 'selling low'; (3) The benefit depends heavily on serial correlation in volatility (volatility clustering must persist predictably); (4) In whipsaw markets with alternating high/low volatility regimes, the strategy suffers from timing lag. Evidence is empirically mixed and path-dependent.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A 45-year-old investor with $500,000 in savings, 20 years to retirement, moderate risk tolerance, and no pension is building a long-term portfolio. She wants to grow capital but cannot tolerate a permanent loss of more than 30% of her portfolio.",
          question:
            "Which portfolio construction approach best fits her situation?",
          options: [
            "A diversified SAA of roughly 65% global equities, 25% bonds, 10% real assets with annual threshold rebalancing and a maximum drawdown constraint",
            "100% managed futures for maximum crisis alpha and absolute return",
            "100% equities with a full CPPI floor set at 70% of peak value",
            "60% gold and 40% cash for capital preservation given the drawdown constraint",
          ],
          correctIndex: 0,
          explanation:
            "With a 20-year horizon and moderate risk tolerance, a diversified SAA centered on equities is appropriate — time allows recovery from drawdowns. The 65/25/10 split with real assets provides inflation protection while bonds provide stability. Annual threshold rebalancing maintains the target allocation without excessive trading. A drawdown rule (e.g., reduce equity if the portfolio falls 25% from peak) can implement a soft floor. Full CPPI would require leverage in bonds, 100% equities ignores the drawdown constraint, managed futures alone are too concentrated, and a gold/cash portfolio is likely to underperform over 20 years with high inflation risk.",
          difficulty: 3,
        },
      ],
    },
  ],
};
