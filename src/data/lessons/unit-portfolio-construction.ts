import type { Unit } from "./types";

export const UNIT_PORTFOLIO_CONSTRUCTION: Unit = {
  id: "portfolio-construction",
  title: "Portfolio Construction",
  description:
    "Modern portfolio theory, factor investing, asset allocation, rebalancing, and performance attribution",
  icon: "PieChart",
  color: "#8b5cf6",
  lessons: [
    /* ================================================================
       LESSON 1 — Modern Portfolio Theory
       ================================================================ */
    {
      id: "pc-1",
      title: "Modern Portfolio Theory",
      description:
        "Efficient frontier, correlation, and the math of diversification",
      icon: "TrendingUp",
      difficulty: "advanced",
      duration: 20,
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "The Efficient Frontier",
          content:
            "**Modern Portfolio Theory (MPT)**, developed by Harry Markowitz in 1952, mathematically formalises the intuition that diversification reduces risk without proportionally reducing return.\n\n**The efficient frontier** is the set of portfolios that offer the maximum expected return for a given level of risk (standard deviation), or equivalently, the minimum risk for a given expected return.\n\n**Portfolio space**: Plot every possible combination of assets on a risk/return chart. Most portfolios cluster inside a curved region. The upper-left boundary of this region is the efficient frontier.\n\n**Key insight**: Any portfolio not on the efficient frontier is 'dominated' — there exists another portfolio with either:\n- The same return but lower risk, or\n- The same risk but higher return\n\nRational investors should hold only portfolios on the efficient frontier. The specific point chosen depends on the investor's risk tolerance.",
          highlight: [
            "Modern Portfolio Theory",
            "efficient frontier",
            "Markowitz",
            "standard deviation",
            "dominated portfolio",
          ],
        },
        {
          type: "teach",
          title: "Correlation and Diversification",
          content:
            "**Correlation** (ρ) measures how two assets move relative to each other. It ranges from -1 to +1.\n\n**Correlation values**:\n- **+1.0**: Perfect positive correlation — assets move identically. No diversification benefit.\n- **0**: No correlation — assets move independently. Diversification reduces risk significantly.\n- **-1.0**: Perfect negative correlation — assets move in exactly opposite directions. Maximum diversification benefit — combining 50/50 can theoretically eliminate risk.\n\n**Portfolio variance formula**:\nσ²(portfolio) = w₁²σ₁² + w₂²σ₂² + 2·w₁·w₂·σ₁·σ₂·ρ₁₂\n\n**The diversification benefit**: When ρ < 1, the portfolio standard deviation is LESS than the weighted average of individual asset standard deviations. The lower the correlation, the greater the benefit.\n\n**Real-world correlations**: Most stocks are positively correlated (0.3–0.7). Adding uncorrelated assets (international equities, real estate, commodities, bonds) provides meaningful diversification.",
          highlight: [
            "correlation",
            "diversification",
            "portfolio variance",
            "uncorrelated",
            "negative correlation",
          ],
        },
        {
          type: "teach",
          title: "The Capital Market Line and Risk-Free Rate",
          content:
            "**Adding a risk-free asset** (Treasury bills, money market) to the efficient frontier creates a powerful new concept: the **Capital Market Line (CML)**.\n\n**The Sharpe Ratio**: Return above the risk-free rate per unit of risk.\nSharpe Ratio = (Portfolio Return − Risk-Free Rate) / Portfolio Standard Deviation\n\n**The tangency portfolio**: The single risky portfolio on the efficient frontier with the highest Sharpe Ratio. It is the optimal portfolio to hold — investors should combine it with the risk-free asset rather than holding other frontier portfolios.\n\n**Practical implication**:\n- Conservative investor: 30% tangency portfolio + 70% cash → lower risk, lower return\n- Aggressive investor: 150% tangency portfolio (borrowing 50% at risk-free rate) → higher risk, higher return\n- In practice, the tangency portfolio approximates a broad market index — this is the theoretical basis for **passive index investing**.\n\n**MPT limitations**: Assumes returns are normally distributed, correlations are stable, and all investors have the same return/risk estimates. All three assumptions break down during crises.",
          highlight: [
            "capital market line",
            "Sharpe ratio",
            "tangency portfolio",
            "risk-free rate",
            "passive investing",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Two assets have individual standard deviations of 20% and 30%, and a correlation of -0.5. Compared to a portfolio with the same weighted-average return but correlation of +1.0, how does the -0.5 correlation portfolio's risk compare?",
          options: [
            "Lower risk — negative correlation reduces the combined portfolio variance below the weighted average of individual variances",
            "Higher risk — negative correlation means the assets fight each other, increasing volatility",
            "Identical risk — correlation does not affect portfolio variance",
            "Lower risk only if both assets are expected to generate positive returns",
          ],
          correctIndex: 0,
          explanation:
            "The portfolio variance formula includes the term 2·w₁·w₂·σ₁·σ₂·ρ₁₂. When correlation (ρ) is negative, this cross-term is negative, reducing total portfolio variance below the simple weighted average of individual variances. This is the mathematical proof of why diversification with low or negatively correlated assets reduces portfolio risk.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "According to Modern Portfolio Theory, the optimal portfolio for any investor is one on the efficient frontier — the specific point is determined by the investor's risk tolerance.",
          correct: true,
          explanation:
            "The efficient frontier defines the set of optimal portfolios. Portfolios below the frontier are suboptimal (they could achieve better risk/return characteristics). The investor's risk tolerance determines which specific frontier portfolio to hold — a risk-averse investor holds the minimum variance portfolio, while a risk-tolerant investor holds further along the frontier with higher expected return and higher risk.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Your portfolio consists of 100% US tech stocks (high return, high risk, average correlation 0.8 among holdings). A financial advisor suggests adding 20% international bonds (lower return, lower risk, correlation with your portfolio = 0.1).",
          question: "What is the likely effect on the portfolio according to MPT?",
          options: [
            "The portfolio moves closer to the efficient frontier — overall risk decreases more than expected return due to the low correlation, improving the Sharpe ratio",
            "The portfolio gets worse — adding bonds always reduces returns without meaningful risk reduction",
            "No change — the bonds are too small a position to matter",
            "The portfolio risk doubles because you are now exposed to two different markets",
          ],
          correctIndex: 0,
          explanation:
            "Adding an asset with low correlation (0.1) to your existing portfolio provides significant diversification benefit. Even though bonds have lower individual returns, the near-zero correlation with your tech-heavy portfolio means the blended portfolio variance falls substantially. The expected return decreases slightly (20% of bonds), but risk decreases more — resulting in a better Sharpe ratio and a portfolio closer to the efficient frontier.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Factor Investing
       ================================================================ */
    {
      id: "pc-2",
      title: "Factor Investing",
      description:
        "Value, momentum, quality, and low-volatility factors",
      icon: "Filter",
      difficulty: "advanced",
      duration: 18,
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "What Is a Factor?",
          content:
            "**Factor investing** (also called 'smart beta') identifies specific characteristics of stocks that have historically produced excess returns above the broad market over long periods.\n\n**Why factors exist**: Each factor premium has an explanation rooted in either risk compensation (investors demand higher returns for taking a specific risk) or behavioural bias (investors systematically misprize certain stocks, creating an exploitable inefficiency).\n\n**The Fama-French factor framework**: Eugene Fama and Kenneth French extended the capital asset pricing model (CAPM) to include:\n- **Market factor (beta)**: Expected return from taking equity risk\n- **Size factor (SMB — Small Minus Big)**: Small-cap stocks outperform large-cap over time\n- **Value factor (HML — High Minus Low)**: High book-to-market (cheap) stocks outperform growth (expensive) stocks\n\nSubsequent research added momentum, quality, profitability, and low-volatility as additional factors.",
          highlight: [
            "factor investing",
            "smart beta",
            "Fama-French",
            "market factor",
            "size factor",
            "value factor",
          ],
        },
        {
          type: "teach",
          title: "The Four Main Factors",
          content:
            "**Value Factor**: Cheap stocks (low P/E, P/B, EV/EBITDA) outperform expensive ones over long periods. Explanation: investors overpay for glamour/growth stocks and underpay for boring/distressed stocks. Value underperformed significantly 2010–2020 but has long-term historical backing.\n\n**Momentum Factor**: Stocks that have performed well over the past 3–12 months (excluding the most recent month) tend to continue outperforming. Explanation: behavioural underreaction — investors are slow to revise their views. Momentum works in the short-to-medium term but crashes violently during sudden reversals.\n\n**Quality Factor**: Companies with high return on equity, stable earnings, low debt, and strong cash flow outperform. Explanation: risk-averse investors systematically undervalue financial stability. Quality tends to hold up well in downturns.\n\n**Low Volatility Factor**: Lower-volatility stocks outperform higher-volatility stocks on a risk-adjusted basis — the opposite of what standard finance theory predicts. Explanation: investors seeking lottery-like payoffs overprice high-volatility stocks and underprice boring, stable ones.",
          highlight: [
            "value factor",
            "momentum factor",
            "quality factor",
            "low volatility factor",
            "factor premium",
          ],
        },
        {
          type: "teach",
          title: "Factor Timing and Combination",
          content:
            "**Factor cyclicality**: Factors go through extended periods of outperformance and underperformance. No single factor works in all environments.\n\n**Factor-environment relationships**:\n- **Value**: Outperforms in early recovery and rising rate environments. Struggles when growth stocks lead.\n- **Momentum**: Outperforms in trending markets. Crashes violently in sharp reversals ('momentum crashes').\n- **Quality**: Outperforms in late cycle and recessions. Defensive by nature.\n- **Low vol**: Outperforms in bear markets and volatile periods. Underperforms in aggressive bull markets.\n\n**Multi-factor portfolios**: Combining factors reduces drawdowns because they are not highly correlated. A value-momentum combination particularly benefits — they tend to be negatively correlated (value does well when momentum does poorly).\n\n**Factor decay risk**: As factors become widely known, the premium may erode due to crowding. This is an ongoing debate in academic finance — some factors have weakened post-publication.",
          highlight: [
            "factor cyclicality",
            "momentum crash",
            "multi-factor",
            "factor combination",
            "factor crowding",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Which factor tends to outperform during economic recessions and market downturns, and why?",
          options: [
            "Quality factor — companies with strong balance sheets, stable earnings, and low debt hold up better when economic conditions deteriorate",
            "Momentum factor — stocks that were going up before the recession continue to go up through it",
            "Value factor — cheap stocks become even cheaper during recessions, generating the highest returns",
            "Low volatility factor is the worst performer in recessions because defensive stocks have no upside",
          ],
          correctIndex: 0,
          explanation:
            "The quality factor — characterised by high profitability, strong balance sheets, and stable cash flows — tends to outperform during economic stress. Quality companies can service their debt, maintain dividends, and survive downturns while weaker companies face existential risk. This is why quality is considered a 'defensive factor.' The momentum factor is particularly vulnerable to crashes during sudden reversals.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Combining value and momentum factors in a single portfolio can reduce volatility compared to holding either factor alone, because they tend to be negatively correlated with each other.",
          correct: true,
          explanation:
            "Value and momentum factors have a historically negative correlation. When value stocks are underperforming (typically in strong growth/momentum environments), momentum is outperforming. When momentum crashes (usually during sharp reversals when growth leadership ends), value tends to recover. This negative correlation means combining them reduces the overall portfolio volatility, a real-world application of MPT correlation benefits.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are building a factor portfolio. You notice that a particular momentum ETF has grown enormously in assets under management, and many institutional investors are now implementing the same momentum strategy.",
          question: "What risk does this situation describe, and how should you respond?",
          options: [
            "Factor crowding risk — too many investors chasing the same momentum stocks inflates their prices and increases crash risk when momentum reverses; consider reducing exposure or adding uncorrelated factors",
            "This is a positive signal — high AUM means the strategy is proven and you should increase your allocation",
            "No risk — momentum is a permanent anomaly and crowding cannot affect it",
            "This suggests momentum is about to start underperforming value, so switch entirely to value",
          ],
          correctIndex: 0,
          explanation:
            "Factor crowding occurs when too many investors implement the same factor strategy simultaneously. This inflates the prices of factor-favoured stocks, compresses future expected returns, and creates concentrated fragility — if participants begin exiting, the unwind can be severe. Momentum is particularly susceptible because momentum investors tend to exit at the same time (when momentum reverses). The correct response is to be aware of crowding, size the factor appropriately, and maintain diversification across multiple factors.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Asset Allocation Strategies
       ================================================================ */
    {
      id: "pc-3",
      title: "Asset Allocation Strategies",
      description:
        "60/40, risk parity, and the All Weather portfolio",
      icon: "PieChart",
      difficulty: "advanced",
      duration: 17,
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "The 60/40 Portfolio",
          content:
            "The **60/40 portfolio** (60% stocks, 40% bonds) is the traditional balanced portfolio used as a baseline for institutional and retail investors for decades.\n\n**Rationale**:\n- Stocks provide long-term growth and inflation protection\n- Bonds provide income, lower volatility, and historically negative correlation with stocks during equity selloffs\n- The 40% bond allocation cushions stock market crashes\n\n**Historical performance**: From 1980–2020, the 60/40 delivered roughly 9–10% annualised returns with significantly lower drawdowns than 100% equities, due to bonds rallying during the 40-year bull market in bonds.\n\n**Limitations exposed (2022)**: When inflation rose sharply, both stocks AND bonds fell simultaneously (correlation went positive). The 60/40 had its worst year since the 1930s. This highlighted the key vulnerability: the negative stock-bond correlation is not guaranteed — it broke down in inflationary regimes.\n\n**When 60/40 works best**: Low-inflation, growth-led environments where bonds serve as a hedge.",
          highlight: [
            "60/40 portfolio",
            "stock-bond correlation",
            "balanced portfolio",
            "inflation risk",
          ],
        },
        {
          type: "teach",
          title: "Risk Parity",
          content:
            "**Risk parity** allocates capital such that each asset class contributes equally to total portfolio risk (measured by volatility), rather than allocating equal capital.\n\n**The 60/40 problem**: 60% stocks + 40% bonds sounds balanced, but stocks are roughly 3–4× more volatile than bonds. In a 60/40, ~85–90% of the portfolio's total risk comes from equities alone — it's not actually balanced in risk terms.\n\n**Risk parity solution**: Equalise risk contributions by:\n- Reducing allocation to high-volatility assets (stocks)\n- Increasing allocation to low-volatility assets (bonds, commodities)\n- Using leverage on the bond portion to bring its return potential up\n\n**Bridgewater's All Weather (simplified)**:\n- 30% Stocks\n- 40% Long-term bonds\n- 15% Intermediate bonds\n- 7.5% Gold\n- 7.5% Commodities\n\n**Goal**: Perform adequately in any of the four economic environments: rising/falling growth and rising/falling inflation.\n\n**Risk parity limitation**: Performs poorly when both equities and bonds fall simultaneously (rising rates). The leverage embedded in the bond portion amplifies losses during bond market selloffs.",
          highlight: [
            "risk parity",
            "risk contribution",
            "All Weather portfolio",
            "leverage",
            "four economic environments",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Why does a traditional 60/40 portfolio have approximately 85-90% of its total risk concentrated in equities, even though equities represent only 60% of the capital allocation?",
          options: [
            "Because equities are significantly more volatile than bonds — their higher standard deviation means they contribute far more to total portfolio variance despite a smaller capital weighting",
            "Because the 40% bond allocation is leveraged, which reduces its risk contribution",
            "Because bonds have zero volatility and therefore contribute no risk",
            "Because the 60/40 uses market capitalisation weighting which favours stocks",
          ],
          correctIndex: 0,
          explanation:
            "Risk contribution depends on both the capital weight AND the asset's volatility. Stocks historically have 3–4× the annual volatility of investment-grade bonds (roughly 15–20% vs. 4–6%). When you calculate the variance contribution using the portfolio variance formula, the equity portion — being far more volatile — dominates total portfolio risk. This is why risk parity advocates argue for reducing equity allocation and using leverage to equalise contributions.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "The All Weather portfolio is designed to perform adequately across four economic environments: rising growth, falling growth, rising inflation, and falling inflation.",
          correct: true,
          explanation:
            "Ray Dalio's All Weather framework identifies these four quadrants as the environments markets must navigate. Each asset class tends to do well in specific quadrants: stocks in rising growth/falling inflation, bonds in falling growth/falling inflation, gold and commodities in rising inflation. By holding all four in appropriate risk-adjusted proportions, the portfolio maintains stability across cycles rather than being optimised for one regime.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "It is 2022. Inflation is running at 8%. The Federal Reserve is raising rates aggressively. A classic risk parity fund that uses leverage in its bond allocation is experiencing heavy losses despite bonds and stocks both declining.",
          question: "Why is the risk parity strategy underperforming, and what does this expose about its assumptions?",
          options: [
            "Risk parity assumes that bonds diversify equity risk — when inflation drives both stocks and bonds lower simultaneously, the strategy's core assumption breaks down, and leverage amplifies losses on the bond side",
            "Risk parity always outperforms 60/40 — its losses must be due to manager error",
            "Stocks fell but bonds always rise during equity selloffs, so the portfolio should be up",
            "Risk parity underperforms only when interest rates are falling",
          ],
          correctIndex: 0,
          explanation:
            "Risk parity's central bet is that bonds and stocks are negatively correlated, providing diversification. In inflationary environments where the central bank raises rates, both stocks and bonds can fall simultaneously (as in 2022). The leverage applied to bonds to equalise risk contributions then amplifies the bond losses. This exposed risk parity's hidden assumption: it is implicitly a bet on a low-inflation, growth-driven environment where the stock-bond diversification relationship holds.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Rebalancing and Drift
       ================================================================ */
    {
      id: "pc-4",
      title: "Rebalancing and Drift",
      description:
        "Drift thresholds, rebalancing methods, and tax-efficient rebalancing",
      icon: "RefreshCw",
      difficulty: "advanced",
      duration: 15,
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "Portfolio Drift and Why It Matters",
          content:
            "**Portfolio drift** occurs when asset prices move and the actual allocation deviates from the target allocation. A 60/40 portfolio in a bull market naturally drifts toward 70/30 or 80/20 — significantly increasing equity risk without any deliberate decision.\n\n**Dangers of uncontrolled drift**:\n- Risk profile changes without the investor's knowledge or consent\n- Portfolios become dangerously concentrated in recent winners\n- Investors end up most exposed to equities right before downturns (after long bull markets)\n\n**Example**: A 60/40 portfolio in January 2000 drifted to approximately 75/25 by the market peak (March 2000) without any rebalancing. The subsequent 50% equity drawdown was far more damaging to the drifted portfolio than to a properly maintained 60/40.\n\n**Historical drift rates**: A 10% annual return differential between stocks and bonds (not uncommon in bull markets) causes the portfolio to drift from 60/40 to approximately 65/35 in one year — a meaningful change in risk profile.",
          highlight: [
            "portfolio drift",
            "rebalancing",
            "target allocation",
            "risk profile",
            "concentration risk",
          ],
        },
        {
          type: "teach",
          title: "Rebalancing Methods and Thresholds",
          content:
            "**Calendar rebalancing**: Restore target weights at fixed intervals (monthly, quarterly, annually). Simple to implement. Risk: portfolio can drift significantly between rebalancing dates.\n\n**Threshold-based rebalancing** (bands): Rebalance when any asset class deviates more than X% from target. Common thresholds: 5% absolute or 25% relative.\n- Example: 60% equity target with a 5% band → rebalance when equities exceed 65% or fall below 55%.\n- Advantage: More responsive to large moves. Trades are triggered by market moves, not arbitrary dates.\n\n**Hybrid approach**: Combine calendar checks with threshold bands — review monthly, rebalance only if a band is breached. Most commonly recommended approach.\n\n**Tax-efficient rebalancing techniques**:\n1. **Direct new cash**: Invest new contributions into underweight assets instead of selling overweight assets — avoids triggering capital gains.\n2. **Dividend/income reinvestment**: Direct income from overweight assets to underweight assets.\n3. **Tax-loss harvesting**: Sell underperforming positions at a loss to offset gains from rebalancing sales.\n4. **Asset location**: Hold high-turnover assets (factors, REITs) in tax-advantaged accounts where rebalancing doesn't trigger taxes.",
          highlight: [
            "calendar rebalancing",
            "threshold rebalancing",
            "rebalancing bands",
            "tax-loss harvesting",
            "asset location",
          ],
        },
        {
          type: "teach",
          title: "Rebalancing Return Premium",
          content:
            "**Rebalancing bonus**: Counter-intuitively, disciplined rebalancing can add 0.1–0.5% in annual returns over time in volatile markets — a free lunch from volatility.\n\n**How it works**: Rebalancing forces you to systematically 'buy low, sell high.' When stocks rally and exceed target weight, you sell some (trim the winner). When bonds rally and stocks fall, you buy stocks (buy the loser). Over time, this systematic mean-reversion adds value.\n\n**When rebalancing hurts**: In strongly trending markets, rebalancing reduces returns by cutting winners too early. The bonus is most pronounced in sideways/volatile markets and when assets are negatively correlated.\n\n**Rebalancing frequency trade-offs**:\n- More frequent rebalancing: Tighter risk control, higher transaction costs and taxes, more effort\n- Less frequent: Lower costs, but allows more drift and can undermine the rebalancing bonus\n\n**Recommended frequency for most investors**: Annual rebalancing at minimum; threshold-based (5% bands) is more optimal for volatile portfolios.",
          highlight: [
            "rebalancing bonus",
            "buy low sell high",
            "mean reversion",
            "rebalancing frequency",
            "transaction costs",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A 60/40 portfolio experienced a strong equity bull market. Stocks rose 30% and bonds stayed flat. Approximately what is the new equity weight, and should the investor rebalance?",
          options: [
            "Equities are now approximately 68%, exceeding a typical 5% rebalancing band — the investor should rebalance back to 60% to restore the target risk profile",
            "Equities are still at 60% — price appreciation does not change portfolio weights",
            "Equities are at 90% — a 30% rally triples the equity allocation",
            "Rebalancing is never necessary when stocks are performing well",
          ],
          correctIndex: 0,
          explanation:
            "Starting with $60 equities + $40 bonds = $100. After a 30% equity rally: equities = $78, bonds = $40, total = $118. New equity weight = $78/$118 = 66.1%. This exceeds the 5% band (target 60% + 5% = 65%). A threshold-based rebalancer would sell approximately $7 of equities and buy $7 of bonds to restore the 60/40 target, reducing equity risk before the next potential downturn.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Directing new cash contributions into underweight asset classes is a tax-efficient rebalancing technique because it avoids selling overweight assets and triggering capital gains taxes.",
          correct: true,
          explanation:
            "Selling appreciated assets to rebalance triggers capital gains taxes in taxable accounts. Instead, directing new contributions (salary additions, dividends, income) to underweight asset classes achieves the same rebalancing effect without selling anything. This is particularly valuable in taxable accounts where gains from rebalancing can cost 15–23.8% in federal capital gains taxes (long-term) in the US.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You have a $500,000 taxable brokerage account with a 60/40 target. After a strong equity rally, your allocation is 72% stocks ($360,000) and 28% bonds ($140,000). Your stock positions have significant unrealised gains. You receive $20,000 in new annual contributions.",
          question: "What is the most tax-efficient rebalancing approach?",
          options: [
            "Invest the $20,000 entirely into bonds (the underweight asset), and if still out of balance, use dividend/income distributions from stocks to buy more bonds — minimising capital gains realisation",
            "Sell $60,000 of stocks immediately and buy bonds to reach the target 60/40 allocation",
            "Do nothing — tax costs from rebalancing outweigh any benefit",
            "Move the entire account to a target-date fund that rebalances automatically",
          ],
          correctIndex: 0,
          explanation:
            "Investing new contributions entirely into the underweight asset (bonds) is the first, most tax-efficient step. $20,000 into bonds brings allocation to 69/31 — still above target but progress without tax. Using dividend/income from stocks to buy bonds continues the process without selling. Only as a last resort — when these methods are insufficient — would you sell stocks and trigger taxable gains, prioritising positions with the smallest embedded gains or offsetting with harvested losses.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Performance Attribution
       ================================================================ */
    {
      id: "pc-5",
      title: "Performance Attribution",
      description:
        "Alpha, beta decomposition, and benchmark selection",
      icon: "Award",
      difficulty: "advanced",
      duration: 16,
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "Alpha and Beta: Decomposing Returns",
          content:
            "**Performance attribution** answers the question: where did my portfolio returns actually come from? This is essential for understanding whether outperformance reflects skill or luck.\n\n**Beta (systematic return)**: The portion of your portfolio's return explained by its exposure to the broad market. Beta = 1.0 means the portfolio moves exactly with the market. Beta = 1.5 means it is 50% more volatile than the market.\n\nBeta-adjusted expected return = Beta × Market Return\n\nExample: Portfolio has beta of 1.2. Market returns 10%. Beta-expected return = 12%.\n\n**Alpha**: The return above what beta alone explains.\nAlpha = Actual Return − (Beta × Market Return + Risk-Free Rate)\n\nExample: Portfolio returns 15%. Beta = 1.2, market up 10%, risk-free rate 3%. Alpha = 15% − (1.2 × 10% + 3%) = 15% − 15% = 0%. Zero alpha — the manager generated exactly what the market exposure predicted.",
          highlight: [
            "alpha",
            "beta",
            "performance attribution",
            "systematic return",
            "risk-free rate",
          ],
        },
        {
          type: "teach",
          title: "Brinson Attribution Model",
          content:
            "The **Brinson-Hood-Beebower attribution model** decomposes active portfolio returns into three effects:\n\n**1. Allocation Effect**: Did you overweight sectors/asset classes that outperformed the benchmark?\nAllocation = (Portfolio Weight − Benchmark Weight) × (Benchmark Sector Return − Total Benchmark Return)\n\n**2. Selection Effect**: Within each sector, did you pick stocks that outperformed the sector average?\nSelection = Benchmark Weight × (Portfolio Sector Return − Benchmark Sector Return)\n\n**3. Interaction Effect**: The combined impact of allocation and selection decisions (can be positive or negative).\n\n**Why this matters**: A manager may show positive total alpha, but Brinson attribution reveals whether it came from smart sector allocation (a top-down skill) or better stock selection within sectors (a bottom-up skill). Understanding the source of alpha helps determine if it is repeatable.",
          highlight: [
            "Brinson attribution",
            "allocation effect",
            "selection effect",
            "interaction effect",
            "active return",
          ],
        },
        {
          type: "teach",
          title: "Benchmark Selection and the Importance of a Fair Comparison",
          content:
            "**Benchmark selection** is one of the most overlooked and most important aspects of performance evaluation.\n\n**Requirements for a valid benchmark**:\n- **Investable**: The benchmark can be replicated by the investor in practice\n- **Specified in advance**: Agreed before the performance period begins\n- **Appropriate**: Matches the portfolio's investment universe and style\n\n**Common benchmark mismatches**:\n- A small-cap value manager compared to the S&P 500 (large-cap blend) — the style mismatch will dominate performance attribution\n- A global bond manager compared to a US-only bond index — currency effects contaminate analysis\n\n**Benchmark manipulation**: Managers can use a too-easy benchmark to appear to generate alpha. Example: A manager running a 70% equity / 30% bond portfolio using an all-bond benchmark will always look exceptional during bull markets.\n\n**Information Ratio**: Alpha divided by tracking error (standard deviation of active returns). The most useful single metric for evaluating consistent alpha generation. Information Ratio > 0.5 is considered good; > 1.0 is exceptional.",
          highlight: [
            "benchmark selection",
            "investable benchmark",
            "style mismatch",
            "information ratio",
            "tracking error",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A fund returns 18% in a year when the market returns 15%. The fund has a beta of 1.4 and the risk-free rate is 3%. What is the fund's alpha?",
          options: [
            "-6%: alpha = 18% − (1.4 × 15% + 3%) = 18% − 24% = -6% — the fund underperformed on a risk-adjusted basis",
            "+3%: the fund outperformed the market by 18% − 15% = 3%",
            "+18%: alpha equals total return when the benchmark returns nothing risk-free",
            "+9%: alpha = 18% − the risk-free rate of 3% × beta of 1.4 = 9%",
          ],
          correctIndex: 0,
          explanation:
            "Alpha = Actual Return − (Beta × Market Return + Risk-Free Rate) = 18% − (1.4 × 15% + 3%) = 18% − (21% + 3%) = 18% − 24% = -6%. Despite outperforming the raw market by 3%, the fund's high beta (1.4) means investors should have expected 24% return for that level of risk. The fund actually destroyed value on a risk-adjusted basis — a common finding for leveraged funds in bull markets.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A portfolio manager who consistently selects stocks within their sector that beat the sector average is demonstrating positive 'selection effect' in the Brinson attribution framework.",
          correct: true,
          explanation:
            "The Brinson selection effect measures exactly this: the ability to pick individual securities within a sector that outperform the sector benchmark. It is calculated as the benchmark sector weight multiplied by the difference between the portfolio's sector return and the benchmark sector return. Consistent positive selection effect — sustained over multiple periods — is evidence of genuine stock-picking skill separate from sector allocation decisions.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A fund manager shows 12% annual return vs. a 10% benchmark return over 5 years. You examine the attribution: 100% of the active return came from overweighting technology (allocation effect) while the manager's individual stock selection within each sector was negative (selection effect). The technology sector happened to be the strongest-performing sector over this period.",
          question: "What conclusion should you draw about this manager's skill?",
          options: [
            "The outperformance appears to be mostly from a sector bet on technology rather than stock-picking skill — if technology reverts, the manager's edge disappears; the negative selection effect is concerning",
            "The manager is highly skilled — generating 2% alpha over 5 years is exceptional regardless of source",
            "The manager has proven stock-picking ability because their allocation calls were correct",
            "The benchmark is unfair — you should switch to a technology-heavy benchmark",
          ],
          correctIndex: 0,
          explanation:
            "Attribution analysis reveals the source of alpha. When all outperformance comes from a single sector bet (allocation effect) and stock selection is actually negative, the manager got lucky with one concentrated bet rather than demonstrating broad skill. If technology underperforms in the next 5 years, this manager would likely significantly underperform. The negative selection effect suggests they cannot even pick better-than-average stocks within sectors — their core supposed skill. A manager with repeatable alpha should show consistent positive selection effect across multiple sectors.",
          difficulty: 3,
        },
      ],
    },
  ],
};
