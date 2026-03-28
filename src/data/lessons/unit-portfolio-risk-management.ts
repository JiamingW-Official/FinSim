import { Unit } from "./types";

export const UNIT_PORTFOLIO_RISK_MANAGEMENT: Unit = {
  id: "portfolio-risk-management",
  title: "Portfolio Risk Management",
  description:
    "Master professional risk measurement, factor decomposition, hedging strategies, and institutional risk governance frameworks.",
  icon: "Shield",
  color: "#8B5CF6",
  lessons: [
    {
      id: "prm-risk-measurement",
      title: "Risk Measurement",
      description:
        "Learn VaR, CVaR, maximum drawdown, and stress testing techniques used by professional risk managers.",
      icon: "BarChart2",
      xpReward: 75,
      difficulty: "advanced",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "Value at Risk (VaR) — Three Methodologies",
          content:
            "VaR answers: 'What is the maximum loss at a given confidence level over a given horizon?' Three methods exist:\n\n• Parametric VaR — assumes returns are normally distributed. VaR = μ − z·σ. For 95% confidence, z = 1.645. Fast to compute but misses fat tails.\n\n• Historical VaR — sorts actual past returns and reads the 5th percentile. No distributional assumption; captures real tail events but limited by history window.\n\n• Monte Carlo VaR — simulates thousands of return paths using modeled distributions. Most flexible; captures non-linearities (e.g., options) but computationally expensive.\n\nAll three methods require choosing a confidence level (95% or 99%) and a time horizon (1-day, 10-day). Basel III mandates 10-day 99% VaR for regulatory capital.",
          visual: "risk-pyramid",
          highlight: ["Parametric VaR", "Historical VaR", "Monte Carlo VaR"],
        },
        {
          type: "teach",
          title: "CVaR / Expected Shortfall",
          content:
            "VaR's key limitation: it tells you the loss threshold but nothing about losses beyond it. Conditional VaR (CVaR), also called Expected Shortfall (ES), fills that gap.\n\nCVaR = Expected loss given that the loss exceeds VaR.\n\nFormula (discrete): CVaR = average of all returns worse than the VaR cutoff.\n\nExample: If 1-day 95% VaR = $1M, CVaR might be $1.8M — meaning when you breach VaR, you expect to lose $1.8M on average.\n\nCVaR is sub-additive (diversification always reduces risk), making it mathematically superior to VaR for portfolio optimization. FRTB (Basel's Fundamental Review of the Trading Book) replaced VaR with ES as the primary risk measure in 2019.\n\nInformation Ratio vs. Absolute Risk: IR = (Portfolio return − Benchmark) / Tracking Error measures skill per unit of active risk, while absolute VaR measures total loss potential.",
          highlight: ["CVaR", "Expected Shortfall", "sub-additive"],
        },
        {
          type: "quiz-mc",
          question:
            "A portfolio has a 1-day 99% VaR of $2M and a CVaR of $3.5M. What does the CVaR figure mean?",
          options: [
            "The portfolio will lose exactly $3.5M tomorrow with 99% probability",
            "On days when losses exceed $2M, the average loss is $3.5M",
            "The maximum possible loss under any scenario is $3.5M",
            "The portfolio needs $3.5M in regulatory capital",
          ],
          correctIndex: 1,
          explanation:
            "CVaR (Expected Shortfall) is the average loss conditional on exceeding the VaR threshold. It quantifies the severity of tail losses, not just the threshold. The $3.5M means that on the 1% of worst days, losses average $3.5M.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Maximum Drawdown, Calmar Ratio & Ulcer Index",
          content:
            "Drawdown metrics measure peak-to-trough declines — crucial for investors who cannot tolerate large interim losses.\n\nMaximum Drawdown (MDD): The largest percentage decline from a peak to a subsequent trough before a new high is reached. MDD = (Trough − Peak) / Peak.\n\nCalmar Ratio = Annualized Return / |Maximum Drawdown|. Higher is better; ratio > 1 is respectable for liquid strategies.\n\nUlcer Index: Measures depth and duration of drawdowns. UI = √(mean of squared % drawdowns). Unlike MDD which captures only the worst single event, Ulcer Index penalizes extended underwater periods.\n\nStress Testing vs. Scenario Analysis:\n• Stress Testing: applies extreme but plausible shocks (e.g., equity −30%, spreads +200bps) to current portfolio positions.\n• Scenario Analysis: re-prices the portfolio under full historical episodes (2008 GFC, 2020 COVID crash, 1994 bond massacre) to see total P&L impact.",
          highlight: ["Maximum Drawdown", "Calmar Ratio", "Ulcer Index"],
        },
        {
          type: "quiz-tf",
          statement:
            "VaR is sub-additive, meaning the combined VaR of two portfolios is always less than or equal to the sum of their individual VaRs.",
          correct: false,
          explanation:
            "VaR is NOT sub-additive — this is one of its major criticisms. In some cases, the combined VaR of two portfolios can exceed the sum of their individual VaRs. CVaR (Expected Shortfall) is sub-additive, which is why regulators prefer it for capital requirements.",
          difficulty: 2,
        },
      ],
    },
    {
      id: "prm-factor-risk-decomposition",
      title: "Factor Risk Decomposition",
      description:
        "Understand how factor models dissect portfolio risk into systematic and idiosyncratic components for precise risk budgeting.",
      icon: "Layers",
      xpReward: 80,
      difficulty: "advanced",
      duration: 14,
      steps: [
        {
          type: "teach",
          title: "Systematic vs. Idiosyncratic Risk",
          content:
            "Total portfolio risk has two components:\n\n• Systematic Risk (market/factor risk): Driven by broad market forces — equity beta, interest rate sensitivity, credit spreads, currency moves. Cannot be diversified away within an asset class.\n\n• Idiosyncratic Risk (specific/residual risk): Company- or security-specific events — earnings surprises, management changes, lawsuits. Diversifies away as portfolio holdings increase.\n\nKey formula: Total Variance = Factor Variance + Residual Variance\n\nFor a well-diversified 50-stock portfolio, idiosyncratic risk typically falls below 15% of total risk. Concentrated single-stock positions can have idiosyncratic risk exceeding 60% of total variance.",
          highlight: ["Systematic Risk", "Idiosyncratic Risk", "Total Variance"],
        },
        {
          type: "teach",
          title: "Barra Factor Model",
          content:
            "MSCI Barra's multi-factor model decomposes equity risk into:\n\n• Style Factors: Value (B/P), Growth (EPS growth), Momentum (12-1 month return), Size (log market cap), Quality (ROE stability), Volatility (realized vol)\n\n• Industry/Sector Factors: GICS sector exposures explaining co-movement within sectors\n\n• Country Factors: For global portfolios, local market beta and currency effects\n\nFactor Contribution to Risk: Each factor's risk contribution = Factor Exposure × Factor Volatility × Correlation. Barra reports Marginal Contribution to Risk (MCTR) — the change in portfolio volatility from a 1-unit increase in a given exposure.\n\nRisk parity weighting equalizes each factor's (or asset class's) contribution to total portfolio risk rather than equalizing dollar weights.",
          highlight: ["Barra", "Style Factors", "MCTR", "Risk Parity"],
        },
        {
          type: "quiz-mc",
          question:
            "A portfolio manager runs a factor risk decomposition and finds that 80% of active risk comes from a single momentum factor. What is the most appropriate response?",
          options: [
            "Increase momentum exposure further since it is the dominant driver of returns",
            "Reduce or diversify the momentum factor exposure to avoid concentrated factor risk",
            "Switch to a historical VaR model to better capture momentum-driven losses",
            "Eliminate all idiosyncratic positions since they add residual risk",
          ],
          correctIndex: 1,
          explanation:
            "When one factor dominates active risk, the portfolio is highly vulnerable to factor crowding and momentum unwinds — like August 2007 quant crisis. Active risk budgeting aims to spread risk across multiple independent factors. 80% concentration in momentum is a red flag for risk managers.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Factor Crowding, Correlation Breakdown & Risk Parity",
          content:
            "Factor Crowding: When many managers hold similar factor exposures (e.g., everyone long momentum), unwinding becomes self-reinforcing. Crowding metrics include: factor flow imbalance, ownership concentration, and correlation of returns across supposedly independent strategies.\n\nCorrelation Breakdown in Stress: In calm markets, asset class correlations are low (diversification works). During crises, correlations spike toward 1.0 as forced selling creates uniform liquidation. The 2008 GFC showed equity-credit-commodity correlations all surging simultaneously.\n\nRisk Parity Approach: Instead of allocating 60/40 by capital, allocate so each asset class contributes equally to total portfolio volatility. Bonds (low vol) get larger capital allocations. This creates more balanced drawdowns across regimes but requires leverage to achieve return targets.",
          highlight: [
            "Factor Crowding",
            "Correlation Breakdown",
            "Risk Parity",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Your equity fund has the following factor risk breakdown: Market Beta 35%, Momentum 40%, Quality 15%, Residual/Specific 10%. It is late 2021 and momentum factors have had a multi-year run of strong performance.",
          question:
            "What risk management concern should be most prominent in your next risk committee meeting?",
          options: [
            "The residual risk at 10% is dangerously high and all specific positions should be closed",
            "The market beta of 35% should be increased to capture the rising market",
            "Momentum crowding risk — a sharp reversal could cause correlated losses across all momentum longs",
            "Quality factor at 15% is too low; quality stocks always outperform in late cycle",
          ],
          correctIndex: 2,
          explanation:
            "With 40% of active risk in momentum and a prolonged momentum bull run, crowding risk is extreme. When momentum unwinds (as happened dramatically in early 2022), all holders sell simultaneously, amplifying losses. Risk managers would flag this concentration and consider reducing momentum exposure or hedging via momentum short baskets.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "prm-hedging-strategies",
      title: "Hedging Strategies",
      description:
        "Master delta hedging, tail risk instruments, currency overlays, and duration management for institutional portfolios.",
      icon: "Umbrella",
      xpReward: 85,
      difficulty: "advanced",
      duration: 15,
      steps: [
        {
          type: "teach",
          title: "Delta Hedging Equity Portfolios",
          content:
            "Portfolio managers hedge equity exposure using two main instruments:\n\n• Put Options Overlay: Buying index puts (e.g., SPX puts) reduces portfolio delta directly. A portfolio with $100M equity and beta = 1.0 might buy $100M notional of 3-month 5% OTM puts. Cost: ~1-2% of portfolio annually in normal markets.\n\n• Equity Futures Overlay: Shorting S&P 500 futures reduces beta without disturbing underlying holdings. Contracts needed = (Target Beta − Current Beta) × Portfolio Value / (Futures Price × Contract Multiplier).\n\nBeta Reduction Mechanics: If a $500M portfolio has beta = 1.2 and the manager wants beta = 0.8, they must short futures worth: (0.8 − 1.2) × $500M = −$200M notional. This is capital-efficient since futures require only margin (~5-10% of notional).",
          highlight: ["Put Options Overlay", "Futures Overlay", "Beta"],
        },
        {
          type: "teach",
          title: "Tail Risk Hedging",
          content:
            "Standard put options are expensive in normal markets. Tail risk hedging seeks cost-efficient crash protection:\n\n• Put Spreads: Buy 5% OTM put + sell 20% OTM put. Reduces cost by ~40-60% but caps payout at 20% drawdown.\n\n• VIX Calls: Since VIX spikes sharply in crashes, buying VIX calls (e.g., 30-strike calls) provides convex payoffs exactly when equity portfolios suffer. Correlation to equity losses is high during crises.\n\n• TAIL ETF / Cambria TAIL: A fund that systematically buys out-of-the-money put options on U.S. equities. Provides ongoing tail hedge exposure in managed form.\n\n• Crisis Alpha Instruments: Assets that generate positive returns specifically during crisis periods — long VIX futures, managed futures trend strategies, long USD, long U.S. Treasuries (pre-2022), deep OTM puts. Their correlation to equity is negative only in left-tail scenarios.",
          highlight: ["Put Spreads", "VIX Calls", "Crisis Alpha"],
        },
        {
          type: "quiz-mc",
          question:
            "A portfolio manager buys a 5% OTM put and simultaneously sells a 20% OTM put on the same index, same expiry. What does this strategy achieve?",
          options: [
            "Unlimited downside protection at zero cost",
            "Partial downside protection at reduced premium cost, capped at 20% decline",
            "Full upside participation with no downside hedge",
            "A short volatility position that profits from low realized vol",
          ],
          correctIndex: 1,
          explanation:
            "A put spread (long 5% OTM put, short 20% OTM put) creates a defined-range hedge. The long put activates after a 5% decline; the short put caps the payout at 20% decline. Selling the deeper OTM put reduces net premium cost significantly compared to buying the put alone. Maximum loss protection is 15 points (from 5% to 20%).",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Currency Hedging & Duration Management",
          content:
            "Currency Hedging for International Portfolios: Foreign asset returns in domestic currency = Local Return + Currency Return. A U.S. investor in Japanese equities gains/loses from JPY/USD moves.\n\nStandard approach: 3-month rolling currency forwards. Sell forward the expected foreign currency proceeds at today's forward rate (which incorporates interest rate differential via covered interest parity). Hedge ratio typically 50-100% for fixed income, 0-50% for equities (currency acts as partial diversifier).\n\nDuration Management with Interest Rate Futures: A bond portfolio's interest rate risk = Modified Duration × Portfolio Value. To reduce duration from 7 to 4 years on a $1B portfolio: need to short Treasury futures worth 3 × $1B / futures DV01 contracts.\n\nDiversification Limits: Correlation-based diversification works until it doesn't. In 2022, bonds and equities both fell 15-20% simultaneously (both driven by inflation/rate shock). Risk managers must stress test cross-asset correlations, not rely on historical averages.",
          highlight: [
            "Currency Forwards",
            "Duration",
            "Interest Rate Futures",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Currency hedging always improves the risk-adjusted returns of an international equity portfolio.",
          correct: false,
          explanation:
            "Currency hedging reduces volatility from FX moves but has a cost (forward points reflecting interest rate differentials) and eliminates potential currency gains. For some combinations (e.g., investing in high-yielding EM currencies), hedging may actually reduce returns significantly. Whether to hedge depends on the investor's base currency, investment horizon, and whether the currency exposure is seen as an uncompensated risk.",
          difficulty: 2,
        },
      ],
    },
    {
      id: "prm-risk-governance",
      title: "Risk Governance",
      description:
        "Understand institutional risk governance, regulatory capital frameworks, and liquidity risk management.",
      icon: "Building2",
      xpReward: 90,
      difficulty: "advanced",
      duration: 16,
      steps: [
        {
          type: "teach",
          title: "Three Lines of Defense & Risk Limits Framework",
          content:
            "The Three Lines of Defense is the standard governance model for financial institutions:\n\n• 1st Line: Business units (trading desks, portfolio managers) — own and manage risk day-to-day. Set and monitor position limits.\n\n• 2nd Line: Risk Management & Compliance — independent oversight, sets limits, monitors compliance, escalates breaches. Does NOT make trading decisions.\n\n• 3rd Line: Internal Audit — independent assurance that the first two lines function effectively.\n\nRisk Limits Framework:\n• VaR Limits: Maximum 1-day VaR per desk and aggregate.\n• Concentration Limits: Max % in single issuer, sector, or country.\n• Leverage Limits: Gross and net leverage caps.\n• Stop-Loss Limits: Trigger forced reduction of positions after cumulative monthly losses.\n\nRisk Committee Structure: Senior Risk Committee (CRO + senior management) reviews enterprise risk monthly. Trading Risk Committee meets daily for market risk. Model Risk Committee reviews new quantitative models.",
          highlight: [
            "Three Lines of Defense",
            "VaR Limits",
            "Risk Committee",
          ],
        },
        {
          type: "teach",
          title: "Basel III/IV, FRTB & Regulatory Capital",
          content:
            "Regulatory capital requirements ensure banks hold sufficient capital against risk-weighted assets (RWA).\n\nBasel III Key Pillars:\n• Minimum Capital: CET1 ≥ 4.5% + capital conservation buffer 2.5% = 7% minimum.\n• Leverage Ratio: Tier 1 Capital / Total Exposure ≥ 3%.\n• Liquidity: LCR (30-day stress survival) and NSFR (1-year stable funding ratio).\n\nBasel IV / FRTB (Fundamental Review of the Trading Book):\n• Replaces VaR with Expected Shortfall (ES) at 97.5% confidence.\n• Trading book / banking book boundary becomes stricter.\n• Requires desk-level P&L attribution tests and backtesting.\n\nRWA Calculation: Risk-Weighted Assets = Σ(Asset × Risk Weight). Example: sovereign bonds = 0% risk weight, corporate loans = 100%, equity = 250-400%.\n\nModel Risk Management (MRM): Banks must validate, document, and stress test quantitative models. Model risk = financial loss from incorrect model assumptions or implementation errors.",
          highlight: ["Basel III", "FRTB", "Expected Shortfall", "RWA"],
        },
        {
          type: "quiz-mc",
          question:
            "Under the FRTB framework, which risk measure replaced VaR as the primary metric for regulatory market risk capital?",
          options: [
            "Maximum Drawdown at 99% confidence",
            "Expected Shortfall (CVaR) at 97.5% confidence",
            "Parametric VaR at 99.9% confidence",
            "Tracking Error vs. a regulatory benchmark",
          ],
          correctIndex: 1,
          explanation:
            "FRTB replaced 10-day 99% VaR with Expected Shortfall (CVaR) at 97.5% confidence. ES better captures tail risk and is sub-additive, making it more appropriate for capital adequacy purposes. The 97.5% ES is roughly comparable in capital generation to 99% VaR under normal conditions but captures more severe tail scenarios.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Liquidity Risk & Counterparty Risk (CVA/DVA/FVA)",
          content:
            "Liquidity Risk Stress Testing:\n• LCR (Liquidity Coverage Ratio): HQLA (High Quality Liquid Assets) / Net Cash Outflows over 30-day stress ≥ 100%. Banks must hold enough liquid assets to survive a 30-day stress scenario.\n• NSFR (Net Stable Funding Ratio): Available Stable Funding / Required Stable Funding ≥ 100%. Addresses 1-year structural funding risk.\n• ORSA (Own Risk and Solvency Assessment): Required for insurance companies — forward-looking self-assessment of capital adequacy under stress scenarios.\n\nCounterparty Risk Adjustments (XVA):\n• CVA (Credit Valuation Adjustment): Present value of expected loss from counterparty default. Reduces derivative asset value.\n• DVA (Debit Valuation Adjustment): PV of own default risk — benefits the reporting entity but controversial. Gains when own credit worsens.\n• FVA (Funding Valuation Adjustment): Cost of funding uncollateralized derivatives positions — reflects actual funding costs not captured in risk-free discounting.",
          highlight: ["LCR", "NSFR", "CVA", "DVA", "FVA"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A bank's trading desk has a large uncollateralized interest rate swap portfolio with a mid-tier corporate client. The client's credit spread has recently widened from 80bps to 200bps. The swap has positive mark-to-market to the bank of $50M.",
          question:
            "What risk adjustment should the bank's risk team apply to the $50M MTM value?",
          options: [
            "Add an FVA charge to increase the value since higher spreads mean better funding",
            "Apply a CVA deduction — the expected loss from counterparty default has increased",
            "Apply a DVA benefit — the bank's own credit worsening improves reported P&L",
            "No adjustment needed since the swap is positive MTM to the bank",
          ],
          correctIndex: 1,
          explanation:
            "When a counterparty's credit spread widens, the CVA (Credit Valuation Adjustment) increases — meaning a larger deduction from the MTM value. CVA = Probability of Default × Loss Given Default × Expected Positive Exposure. With the corporate's spread jumping from 80 to 200bps, the implied default probability roughly doubled, significantly increasing CVA and reducing the reported $50M to a lower risk-adjusted value.",
          difficulty: 3,
        },
      ],
    },
  ],
};
