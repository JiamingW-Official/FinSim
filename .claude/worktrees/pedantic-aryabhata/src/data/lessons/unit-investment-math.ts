import type { Unit } from "./types";

export const UNIT_INVESTMENT_MATH: Unit = {
 id: "investment-math",
 title: "Investment Mathematics & Quantitative Methods",
 description:
 "Master the mathematical foundations of investing: time value of money, return calculations, risk measures, performance attribution, statistics, and options pricing",
 icon: "",
 color: "#7c3aed",
 lessons: [
 // Lesson 1: Time Value of Money 
 {
 id: "inv-math-1",
 title: "Time Value of Money",
 description:
 "PV/FV, NPV, IRR, annuities, perpetuities, continuous compounding, and the Rule of 72",
 icon: "Clock",
 xpReward: 90,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Present Value and Future Value",
 content:
 "The **time value of money** is the most fundamental concept in finance: a dollar today is worth more than a dollar tomorrow because it can be invested to earn a return.\n\n**Future Value (FV)**:\nFV = PV × (1 + r)\n\nExample: $1,000 invested at 8% for 10 years:\nFV = 1,000 × (1.08)¹ = **$2,158.93**\n\n**Present Value (PV)**:\nPV = FV / (1 + r)\n\nExample: What is $10,000 received in 5 years worth today at 6% discount rate?\nPV = 10,000 / (1.06) = **$7,472.58**\n\n**Discount rate** is the opportunity cost — the return you could earn on an alternative investment of equivalent risk.\n\n**Compounding frequency** matters:\n- Annual: (1 + r)\n- Semi-annual: (1 + r/2)²\n- Monthly: (1 + r/12)¹²\n- Continuous: eʳ (where e 2.71828)\n\nExample: $1,000 at 12% for 1 year:\n- Annual: $1,120.00\n- Monthly: $1,126.83\n- Continuous: $1,127.50\n\nContinuous compounding gives the maximum possible FV for a given annual rate.",
 highlight: [
 "time value of money",
 "Future Value",
 "Present Value",
 "discount rate",
 "compounding",
 "continuous compounding",
 ],
 },
 {
 type: "teach",
 title: "NPV, IRR, Annuities & Perpetuities",
 content:
 "**Net Present Value (NPV)**:\nNPV = Σ [CF / (1 + r)ᵗ] Initial Investment\n\nIf NPV > 0: project creates value — accept it.\nIf NPV < 0: project destroys value — reject it.\n\nExample: Project requires $10,000 upfront and returns $3,000/year for 5 years at a 10% cost of capital.\nNPV = 3,000/1.1 + 3,000/1.1² + ... + 3,000/1.1 10,000\nNPV = 11,372.36 10,000 = **+$1,372.36** Accept.\n\n**Internal Rate of Return (IRR)**:\nThe discount rate that makes NPV = 0. Accept if IRR > cost of capital.\nCaution: IRR can give multiple solutions for non-conventional cash flows and can rank projects incorrectly when scales differ.\n\n**Annuity** — equal payments for a fixed period:\nPV = PMT × [1 (1 + r)] / r\n\nExample: $500/month for 30 years at 6%/year (0.5%/month):\nPV = 500 × [1 (1.005)³] / 0.005 = **$83,396**\n\n**Perpetuity** — equal payments forever:\nPV = PMT / r\n\nExample: $1,000/year forever at 5%: PV = 1,000 / 0.05 = **$20,000**\n\nGrowing perpetuity (dividends growing at g):\nPV = D / (r g) — the **Gordon Growth Model** for stock valuation.",
 highlight: [
 "Net Present Value",
 "NPV",
 "Internal Rate of Return",
 "IRR",
 "annuity",
 "perpetuity",
 "Gordon Growth Model",
 ],
 },
 {
 type: "teach",
 title: "Rule of 72 and Continuous Compounding",
 content:
 "**Rule of 72**:\nA quick mental shortcut: divide 72 by the annual return to estimate how many years it takes to double your money.\n\nYears to double 72 / r%\n\nExamples:\n- 6% return 72/6 = **12 years** to double\n- 8% return 72/8 = **9 years** to double\n- 12% return 72/12 = **6 years** to double\n- 1% inflation 72/1 = **72 years** to halve purchasing power\n\nThe rule works because ln(2) 0.693, and for small r, the doubling time is approximately 0.693/r 69.3/r%. 72 is used because it has more integer divisors, making mental math easier.\n\n**Continuous Compounding**:\neʳᵀ vs (1 + r)ᵀ\n\nEffective Annual Rate (EAR) with continuous compounding:\nEAR = eʳ 1\n\nFor r = 10%: EAR = e·¹ 1 = 10.517%\n\nLog returns (continuously compounded returns):\nrlog = ln(P/P) = ln(P) ln(P)\n\nLog returns are additive over time — the 2-year log return is simply the sum of two 1-year log returns. This property makes them essential in quantitative finance and option pricing.",
 highlight: [
 "Rule of 72",
 "doubling time",
 "continuous compounding",
 "Effective Annual Rate",
 "log returns",
 "additive",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "You invest $5,000 at a 9% annual return. Using the Rule of 72, approximately how many years will it take to grow to $10,000?",
 options: ["6 years", "8 years", "10 years", "12 years"],
 correctIndex: 1,
 explanation:
 "Rule of 72: years to double 72 / 9 = 8 years. Exact answer using FV formula: 5,000 × (1.09) = 10,000 (1.09) = 2 n = ln(2)/ln(1.09) = 8.04 years. The Rule of 72 gives a very close approximation.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A bond pays $80 per year in perpetuity. The required return on bonds of this risk level is 5%.",
 question: "What is the present value (price) of this perpetuity?",
 options: ["$800", "$1,000", "$1,600", "$4,000"],
 correctIndex: 2,
 explanation:
 "Perpetuity PV = PMT / r = 80 / 0.05 = $1,600. This is the Gordon Growth Model with zero growth. If the required return rose to 8%, the value would drop to 80/0.08 = $1,000 — illustrating the inverse relationship between discount rates and bond/stock prices.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Return Calculations 
 {
 id: "inv-math-2",
 title: "Return Calculations",
 description:
 "HPR, CAGR, geometric vs arithmetic mean, money-weighted vs time-weighted returns, and log returns",
 icon: "TrendingUp",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Holding Period Return and CAGR",
 content:
 "**Holding Period Return (HPR)**:\nThe total return over any investment period.\n\nHPR = (End Value Begin Value + Income) / Begin Value\n\nExample: Buy stock at $100, receive $3 dividend, sell at $115.\nHPR = (115 100 + 3) / 100 = **18%**\n\nMulti-period HPR is multiplicative:\nTotal HPR = (1 + r) × (1 + r) × ... × (1 + r) 1\n\nExample: +20% then 20% = 1.20 × 0.80 1 = **4%** (not 0%!)\nThis asymmetry is why losses are more damaging than equal gains — losing 50% requires a 100% gain to recover.\n\n**Compound Annual Growth Rate (CAGR)**:\nCAGR = (End Value / Begin Value)^(1/n) 1\n\nExample: Portfolio grows from $10,000 to $21,589 over 10 years.\nCAGR = (21,589 / 10,000)^(1/10) 1 = 2.1589^0.1 1 = **8.0%**\n\nCAGR is the single constant rate that produces the same total return. It is the geometric mean of annual returns and always arithmetic mean.",
 highlight: [
 "Holding Period Return",
 "HPR",
 "CAGR",
 "Compound Annual Growth Rate",
 "geometric mean",
 "multiplicative",
 ],
 },
 {
 type: "teach",
 title: "Geometric vs Arithmetic Mean",
 content:
 "**Arithmetic Mean**:\nSimple average of periodic returns.\nR̄a = (r + r + ... + r) / n\n\n**Geometric Mean**:\nGM = [(1 + r)(1 + r)...(1 + r)]^(1/n) 1\n\nKey relationship:\nGM R̄a σ²/2\n\nWhere σ² is the variance of returns. The **variance drag** means higher volatility reduces realized compound growth, even with the same average return.\n\nExample: Two funds over 2 years:\n- Fund A: +50%, 30% AM = +10%, GM = (1.5 × 0.7) 1 = **2.47%**\n- Fund B: +12%, +8% AM = +10%, GM = (1.12 × 1.08) 1 = **9.98%**\n\nSame arithmetic mean; Fund B's lower volatility produces far better actual wealth.\n\n**When to use each**:\n- Geometric mean: estimating future compound returns (the correct choice for long-term investing)\n- Arithmetic mean: estimating one-period expected returns, building portfolio models\n\nUsing arithmetic mean to project long-term wealth systematically **overstates** outcomes.",
 highlight: [
 "arithmetic mean",
 "geometric mean",
 "variance drag",
 "volatility drag",
 "compound growth",
 ],
 },
 {
 type: "teach",
 title: "Time-Weighted vs Money-Weighted Returns",
 content:
 "When a portfolio receives external cash flows (deposits/withdrawals), two different return measures arise:\n\n**Time-Weighted Return (TWR)**:\nEliminates the effect of cash flows — measures the portfolio manager's skill independently of investor timing decisions.\n\nTWR = [(1 + HPR) × (1 + HPR) × ... × (1 + HPR)]^(1/n) 1\n\nCalculation: Break the period at each cash flow. Compute HPR for each sub-period. Compound them together.\n\n**Money-Weighted Return (MWR)**:\nThe internal rate of return (IRR) of all cash flows. Reflects the actual investor experience — penalises managers who received large inflows just before bad performance.\n\nExample:\n- Day 1: Invest $1,000\n- Day 180: Market up 20% portfolio worth $1,200. Investor deposits $5,000 more.\n- Day 365: Market down 15% portfolio worth $5,270.\n\nTWR: +20% × 15% periods TWR = 1.20 × 0.85 1 = **+2%** (manager return)\nMWR (IRR): most money was in during the down period MWR **11%** (investor experience)\n\n**CFA standard**: Benchmark comparisons should use TWR. Client wealth reporting often uses MWR.",
 highlight: [
 "Time-Weighted Return",
 "TWR",
 "Money-Weighted Return",
 "MWR",
 "cash flows",
 "IRR",
 "CFA",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A stock returns +100% in year 1 and 50% in year 2. What is the arithmetic mean and geometric mean of annual returns?",
 options: [
 "AM = 25%, GM = 0%",
 "AM = 0%, GM = 0%",
 "AM = 25%, GM = 25%",
 "AM = 50%, GM = 0%",
 ],
 correctIndex: 0,
 explanation:
 "AM = (100% + (50%)) / 2 = 25%. GM = (1 + 1.00)(1 0.50) 1 = (2.0 × 0.5) 1 = 1.0 1 = 0%. You started with $100, doubled to $200, then halved back to $100 — zero real gain! The 25% arithmetic mean is misleading. This illustrates why variance drag matters: GM AM σ²/2 = 25% (75%²)/2 0%.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Time-weighted return is preferred over money-weighted return when evaluating a portfolio manager's investment skill because it removes the impact of the timing and size of client cash flows.",
 correct: true,
 explanation:
 "Correct. A manager cannot control when clients deposit or withdraw money. If a client deposits a large sum just before a market downturn, the money-weighted return (IRR) will be poor, even if the manager made sound decisions. Time-weighted return eliminates this effect by computing sub-period returns between each cash flow and compounding them, measuring only the manager's portfolio decisions.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Risk Measures 
 {
 id: "inv-math-3",
 title: "Risk Measures",
 description:
 "Standard deviation, variance, covariance, correlation, VaR, CVaR, maximum drawdown, and Calmar ratio",
 icon: "ShieldAlert",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Variance, Standard Deviation and Covariance",
 content:
 "**Variance (σ²)**:\nThe average squared deviation from the mean. Using population formula:\nσ² = Σ(rᵢ r̄)² / n\n\nFor a sample (historical data), divide by (n 1) — Bessel's correction.\n\n**Standard Deviation (σ)**:\nσ = σ² — same units as the return (%).\n\nExample: Annual returns: 10%, 5%, 20%, 5%, 10%\nMean = 4%. Deviations: 6, 9, 16, 1, 14. Squared: 36, 81, 256, 1, 196.\nσ² = 570 / 4 = 142.5. σ = **11.94%**\n\n**Covariance (σAB)**:\nMeasures how two assets move together:\nσAB = Σ(rA,i r̄A)(rB,i r̄B) / (n 1)\n\nPositive: assets move in the same direction.\nNegative: assets tend to move oppositely (diversification benefit).\n\n**Correlation (ρ)**:\nρAB = σAB / (σA × σB)\n\nCorrelation is bounded: 1 ρ +1\n- ρ = +1: perfect positive (no diversification benefit)\n- ρ = 0: uncorrelated (maximum diversification benefit per unit of risk)\n- ρ = 1: perfect negative (possible to eliminate risk entirely)\n\n**Portfolio Variance (2 assets)**:\nσ²p = wA²σA² + wB²σB² + 2wAwBσAσBρAB",
 highlight: [
 "variance",
 "standard deviation",
 "covariance",
 "correlation",
 "portfolio variance",
 "diversification",
 ],
 },
 {
 type: "teach",
 title: "Value at Risk (VaR) and CVaR",
 content:
 "**Value at Risk (VaR)**:\nThe maximum loss not exceeded with a given confidence level over a specified time period.\n\nExample: '1-day 95% VaR = $10,000' means: on 95% of days, losses will be $10,000. There is a 5% chance of losing more than $10,000 in one day.\n\nThree methods:\n1. **Historical VaR**: Sort past returns worst to best; 5th percentile is 95% VaR. No distributional assumptions.\n2. **Parametric VaR**: Assumes normality. VaR = μ z × σ (z = 1.645 for 95%, z = 2.326 for 99%)\n3. **Monte Carlo VaR**: Simulate thousands of return scenarios; take the 5th percentile.\n\nExample (parametric): Portfolio with daily mean = 0%, daily σ = 1.2%, portfolio = $1M.\n95% 1-day VaR = 0% 1.645 × 1.2% = 1.974% **$19,740**\n\n**Conditional VaR (CVaR / Expected Shortfall)**:\nThe expected loss *given* that the loss exceeds VaR. Asks: \"if we're in the bad 5%, how bad is it on average?\"\n\nCVaR is always worse than VaR and is considered a **coherent risk measure** — VaR is not, because it can be gamed by structuring positions to keep losses just inside the threshold while hiding tail risk beyond it.\n\nCVaR is preferred by regulators (Basel III) for internal capital allocation.",
 highlight: [
 "Value at Risk",
 "VaR",
 "CVaR",
 "Expected Shortfall",
 "confidence level",
 "coherent risk measure",
 "Basel III",
 ],
 },
 {
 type: "teach",
 title: "Maximum Drawdown and Calmar Ratio",
 content:
 "**Maximum Drawdown (MDD)**:\nThe largest peak-to-trough decline in portfolio value before a new peak is reached.\n\nMDD = (Trough Value Peak Value) / Peak Value\n\nExample: Portfolio peaks at $1,000,000, falls to $650,000 before recovering.\nMDD = (650,000 1,000,000) / 1,000,000 = **35%**\n\nMDD captures the worst investor experience and the **length** of the drawdown (how long you wait to recover) matters as much as the depth.\n\nCalmar Ratio = CAGR / |MDD|\n\n**Calmar Ratio**:\nCalmar = CAGR / |Max Drawdown|\n\nExample: Strategy earns 18% CAGR with 30% max drawdown.\nCalmar = 18% / 30% = **0.60**\n\nHigher is better. Calmar > 0.5 is acceptable; > 1.0 is strong.\nUnlike Sharpe, Calmar focuses on the worst loss event — better for strategies where tail events dominate.\n\n**Ulcer Index**: Alternative drawdown measure — RMS of all drawdown depths weighted by duration. Penalises both deep and long drawdowns.\n\n**Recovery time** (time to new high after MDD) is another critical metric. Some strategies have short, deep drawdowns; others have shallow but persistent ones. Neither is necessarily better — it depends on the investor's time horizon and psychology.",
 highlight: [
 "Maximum Drawdown",
 "MDD",
 "Calmar Ratio",
 "Ulcer Index",
 "recovery time",
 "peak-to-trough",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A portfolio has a 1-day 99% VaR of $50,000. Which statement correctly interprets this?",
 options: [
 "The portfolio will lose exactly $50,000 on 1% of trading days",
 "There is a 1% chance the portfolio loses more than $50,000 in one day",
 "The maximum possible loss in one day is $50,000",
 "The portfolio loses less than $50,000 on 1% of trading days",
 ],
 correctIndex: 1,
 explanation:
 "VaR at 99% confidence means there is a 1% probability that losses will EXCEED $50,000 in one day. It does NOT tell you the maximum possible loss (which is theoretically the entire portfolio). It does NOT say losses will be exactly $50,000. CVaR/Expected Shortfall tells you the average loss when that 1% event occurs — VaR only identifies the threshold.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Strategy A: CAGR = 20%, Max Drawdown = 40%. Strategy B: CAGR = 12%, Max Drawdown = 15%. The risk-free rate is 4% and both have annual Sharpe ratios of approximately 0.90.",
 question:
 "Which strategy likely has a higher Calmar ratio, and what does that tell you?",
 options: [
 "Strategy A; it generates more absolute return",
 "Strategy B; it experiences smaller drawdowns relative to its return",
 "Both have the same Calmar ratio",
 "Strategy A; higher CAGR always means higher Calmar",
 ],
 correctIndex: 1,
 explanation:
 "Calmar A = 20/40 = 0.50. Calmar B = 12/15 = 0.80. Strategy B has a higher Calmar ratio, meaning it generates more return per unit of worst-case drawdown. Despite lower absolute return, it is more capital-efficient from a drawdown perspective. This matters for leveraged investors or those with shorter time horizons who cannot tolerate a 40% drawdown psychologically or operationally.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Performance Attribution 
 {
 id: "inv-math-4",
 title: "Performance Attribution",
 description:
 "Brinson-Hood-Beebower model, allocation/selection/interaction effects, information ratio, and active share",
 icon: "PieChart",
 xpReward: 100,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Brinson-Hood-Beebower Attribution",
 content:
 "Performance attribution answers the question: *why* did a portfolio outperform or underperform its benchmark?\n\nThe **Brinson-Hood-Beebower (BHB) model** decomposes active return into three effects:\n\n**Notation**:\n- wP = portfolio weight in sector i; wB = benchmark weight\n- rP = portfolio sector return; rB = benchmark sector return\n\n**1. Allocation Effect**:\n= (wP wB) × (rB rB_total)\nRewards the manager for *overweighting* sectors that outperform the total benchmark and underweighting sectors that underperform.\n\n**2. Selection Effect**:\n= wB × (rP rB)\nRewards the manager for picking *better securities* within a sector versus the benchmark sector return.\n\n**3. Interaction Effect**:\n= (wP wB) × (rP rB)\nCaptures the combined effect of over/underweighting AND selecting better securities in that sector.\n\n**Total Active Return** = Allocation + Selection + Interaction\n\nExample: Technology sector\n- Benchmark weight 20%, portfolio weight 30% (overweight by 10%)\n- Benchmark tech return 15%, total benchmark return 8%\n- Portfolio tech return 18%\n\nAllocation = (3020)% × (158)% = 0.10 × 0.07 = **+0.70%**\nSelection = 20% × (1815)% = 0.20 × 0.03 = **+0.60%**\nInteraction = 10% × 3% = **+0.30%**",
 highlight: [
 "Brinson-Hood-Beebower",
 "BHB",
 "allocation effect",
 "selection effect",
 "interaction effect",
 "active return",
 "benchmark",
 ],
 },
 {
 type: "teach",
 title: "Information Ratio and Active Share",
 content:
 "**Information Ratio (IR)**:\nMeasures the consistency of alpha generation relative to tracking error.\n\nIR = Active Return / Tracking Error\nIR = (Portfolio Return Benchmark Return) / Std Dev of Active Return\n\nInterpretation:\n- IR > 0.50: strong alpha generator\n- IR > 0.75: exceptional\n- IR < 0.25: active management barely adds value after fees\n\nThe Fundamental Law of Active Management (Grinold):\nIR IC × BR\n- IC (Information Coefficient): correlation between forecasts and outcomes (0–1)\n- BR (Breadth): number of independent bets per year\n\nA manager making 100 independent trades/year with IC = 0.05:\nIR 0.05 × 100 = **0.50**\n\n**Active Share**:\nAS = (1/2) × Σ|wP,i wB,i|\n\nMeasures how different the portfolio is from the benchmark.\n- AS = 0%: portfolio IS the benchmark (closet index fund)\n- AS = 100%: no overlap with benchmark\n- AS > 60%: truly active management\n\nStudies (Cremers & Petajisto) show high Active Share funds, on average, outperform after fees. Low Active Share + high fees is the worst combination.\n\n**Tracking Error**:\nStd dev of (portfolio return benchmark return). Low TE = benchmark-hugging. High TE = concentrated/distinct bets.",
 highlight: [
 "Information Ratio",
 "tracking error",
 "active share",
 "Information Coefficient",
 "breadth",
 "Fundamental Law of Active Management",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A fund manager overweights the energy sector (portfolio 25%, benchmark 15%). Energy underperforms the overall benchmark by 4%. What is the allocation effect contribution from energy?",
 options: [
 "+0.40%",
 "0.40%",
 "+0.60%",
 "0.60%",
 ],
 correctIndex: 1,
 explanation:
 "Allocation Effect = (wP wB) × (rB_sector rB_total) = (25% 15%) × (4%) = 10% × 4% = 0.40%. The manager overweighted a sector that underperformed, which hurt performance. If energy had outperformed by 4% instead, the allocation effect would be +0.40%. This is the core insight of BHB: you are rewarded for overweighting sectors that beat the market.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A fund with Active Share of 20% that charges a 1.5% expense ratio is likely to outperform its benchmark after fees over the long term.",
 correct: false,
 explanation:
 "False. Active Share of 20% indicates this is essentially a 'closet index fund' — nearly identical to the benchmark. With a 1.5% fee (vs. ~0.03% for an index ETF), the fund would need to generate ~1.47% of consistent annual alpha just to break even with a passive alternative. Research consistently shows that low Active Share funds rarely generate enough genuine alpha to justify high fees. Only high Active Share funds (>60%) have historically shown evidence of average outperformance after fees.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 5: Statistical Concepts 
 {
 id: "inv-math-5",
 title: "Statistical Concepts in Finance",
 description:
 "Normal distribution, fat tails, skewness, kurtosis, OLS regression basics, and hypothesis testing for alpha",
 icon: "BarChart2",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Normal Distribution, Skewness and Kurtosis",
 content:
 "**Normal Distribution in Finance**:\nThe normal distribution (bell curve) is characterised by mean (μ) and standard deviation (σ).\n\nKey probabilities:\n- 68% of observations fall within ±1σ of mean\n- 95% within ±2σ\n- 99.7% within ±3σ\n\nIn finance, we assume returns are approximately normal for many calculations — but this is a simplification with dangerous edge cases.\n\n**Skewness**:\nMeasures asymmetry of a distribution.\n- Skewness = 0: symmetric (normal)\n- Negative skew: fat left tail — frequent small gains, rare large losses (equity index returns, option selling)\n- Positive skew: fat right tail — frequent small losses, rare large gains (long options, venture capital)\n\n**Kurtosis**:\nMeasures the weight of tails vs a normal distribution.\n- Normal distribution: kurtosis = 3 (excess kurtosis = 0)\n- Leptokurtic (fat tails): excess kurtosis > 0 — more extreme outcomes than normal\n- Platykurtic: excess kurtosis < 0 — fewer extremes\n\nDaily equity return kurtosis is typically 5–10. This means 3-sigma days occur roughly 10× more frequently than a normal model predicts.\n\n**Black Monday 1987**: The S&P 500 fell 22.6% in one day — approximately a 20+ sigma event under normality. Probability under normal model: 1 in 10^¹ (i.e., essentially impossible in the lifetime of the universe).",
 highlight: [
 "normal distribution",
 "skewness",
 "kurtosis",
 "fat tails",
 "leptokurtic",
 "excess kurtosis",
 "negative skew",
 ],
 },
 {
 type: "teach",
 title: "OLS Regression and Factor Models",
 content:
 "**Ordinary Least Squares (OLS) Regression**:\nFits a line (or hyperplane) to minimise the sum of squared residuals:\n\ny = α + βx + βx + ... + βx + ε\n\nIn finance, the most common form is the **Capital Asset Pricing Model (CAPM)**:\nrᵢ rƒ = α + β(rM rƒ) + ε\n\n- **β (Beta)**: sensitivity to market returns. β=1.5 means the stock moves 1.5× the market.\n- **α (Alpha)**: excess return not explained by market exposure — the manager's value-added.\n- **R²**: fraction of return variance explained by the model (0–100%). Low R² = idiosyncratic risk dominates.\n\n**Fama-French 3-Factor Model**:\nrᵢ rƒ = α + β_M(rMrƒ) + β_SMB(SMB) + β_HML(HML) + ε\n\n- SMB (Small Minus Big): size premium\n- HML (High Minus Low): value premium (high book-to-market)\n\n**OLS Assumptions** (must be satisfied for valid inference):\n1. Linearity\n2. Independence of residuals (no autocorrelation)\n3. Homoscedasticity (constant variance of residuals)\n4. Normality of residuals\n5. No multicollinearity between predictors\n\nViolations (especially autocorrelation and heteroscedasticity) are common in financial data.",
 highlight: [
 "OLS regression",
 "beta",
 "alpha",
 "CAPM",
 "R-squared",
 "Fama-French",
 "SMB",
 "HML",
 ],
 },
 {
 type: "teach",
 title: "Hypothesis Testing for Alpha",
 content:
 "**Hypothesis Testing Framework**:\n- H (null hypothesis): α = 0 (no genuine alpha)\n- H (alternative): α 0 (genuine alpha exists)\n\n**t-statistic for alpha**:\nt = α̂ / SE(α̂)\n\nWhere SE(α̂) is the standard error of the alpha estimate.\n\nRules of thumb:\n- |t| > 2.0: statistically significant at ~5% level\n- |t| > 1.65: significant at ~10% level\n\n**p-value**: probability of observing a t-statistic as extreme as this if H is true.\n- p < 0.05: reject H at 5% significance — alpha is not due to chance (95% confidence)\n- p < 0.01: 99% confidence\n\n**Multiple Comparisons Problem (p-hacking)**:\nIf you test 100 strategies, you expect ~5 to show α significantly 0 purely by chance at the 5% level. Backtested strategies are especially vulnerable — Harvey, Liu & Zhu (2016) argue you need |t| > 3.0 for a credible trading signal after accounting for the number of strategies ever tested.\n\n**Sharpe ratio significance**: To be 95% confident an observed Sharpe of S is genuinely > 0 (not noise), you need approximately: T > (S/SE)² where SE 1/T. Rule of thumb: even a Sharpe of 1.0 needs **~4 years** of data to be statistically significant at 95%.",
 highlight: [
 "hypothesis testing",
 "alpha",
 "t-statistic",
 "p-value",
 "null hypothesis",
 "multiple comparisons",
 "p-hacking",
 "statistical significance",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A quant analyst runs OLS regression of a stock against the market and finds β = 1.3, α = 0.005 (monthly), R² = 0.65. What does R² = 0.65 tell you?",
 options: [
 "65% of the stock's returns are explained by market movements; 35% is stock-specific risk",
 "The stock outperforms 65% of the time",
 "65% of the alpha is statistically significant",
 "The stock has a 65% correlation with the market",
 ],
 correctIndex: 0,
 explanation:
 "R² = 0.65 means 65% of the variance in the stock's excess returns is explained by the market factor (beta). The remaining 35% is idiosyncratic (stock-specific) risk. Note: the correlation ρ = R² = 0.65 0.81, not 0.65 — R² is the squared correlation. A low R² means diversifying with this stock provides more benefit (less market exposure), while a high R² means it mostly just captures market beta.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "If a backtested strategy shows a statistically significant alpha (p < 0.05, t-statistic = 2.2) after testing 50 different strategies, this is strong evidence of genuine alpha.",
 correct: false,
 explanation:
 "False. With 50 strategies tested, you would expect 50 × 5% = 2.5 strategies to appear significant at the 5% level purely by chance (multiple comparisons problem). A t-statistic of 2.2 is not sufficient when many strategies were tested. Harvey, Liu & Zhu (2016) suggest requiring |t| > 3.0 (roughly p < 0.003) for new factor discoveries to be credible, precisely because of this data-mining bias. Always adjust for the multiple comparisons problem when evaluating backtested strategies.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 6: Options Math 
 {
 id: "inv-math-6",
 title: "Options Mathematics",
 description:
 "Put-call parity, binomial pricing, Black-Scholes components, d1/d2 interpretation, and Greeks formulas",
 icon: "Calculator",
 xpReward: 110,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Put-Call Parity and Binomial Pricing",
 content:
 "**Put-Call Parity**:\nA fundamental no-arbitrage relationship between European call and put prices:\n\nC P = S Ke^(rT)\n\nWhere:\n- C = call price, P = put price\n- S = current stock price\n- K = strike price\n- r = risk-free rate\n- T = time to expiration (years)\n\nRewritten: C + Ke^(rT) = P + S\n(Fiduciary call = protective put)\n\nIf this equality breaks, you can construct a **risk-free arbitrage**. Example: if C P > S Ke^(rT), buy the put and stock, sell the call and bond, pocket a riskless profit.\n\n**Binomial Option Pricing (1-step)**:\nModel: stock goes up to Su = S×u or down to Sd = S×d.\n\nRisk-neutral probability of up move:\np = (e^(rΔt) d) / (u d)\n\nOption value today:\nC = e^(rΔt) × [p × Cu + (1p) × Cd]\n\nExample: S=$100, K=$105, u=1.1 ( to $110), d=0.9 ( to $90), r=5%, T=1yr\np = (e^0.05 0.9) / (1.1 0.9) = (1.0513 0.9) / 0.2 = **0.757**\nCu = max(110105, 0) = $5; Cd = max(90105, 0) = $0\nC = e^(0.05) × [0.757 × 5 + 0.243 × 0] = **$3.60**\n\nWith more steps, the binomial model converges to Black-Scholes.",
 highlight: [
 "put-call parity",
 "no-arbitrage",
 "binomial model",
 "risk-neutral probability",
 "European options",
 ],
 },
 {
 type: "teach",
 title: "Black-Scholes: d1, d2 and Formula Components",
 content:
 "**Black-Scholes Formula (European Call)**:\nC = S × N(d1) K × e^(rT) × N(d2)\n\n**d1 and d2**:\nd1 = [ln(S/K) + (r + σ²/2)T] / (σT)\nd2 = d1 σT\n\nWhere:\n- S = spot price, K = strike, r = risk-free rate\n- σ = implied volatility (annualised)\n- T = time to expiry (years)\n- N(x) = cumulative standard normal distribution\n\n**Interpretation of d1 and d2**:\n- **N(d2)** = risk-neutral probability that the option expires in-the-money. If d2 = 1.0, N(d2) = 84.1% — the option has an 84.1% chance of expiring ITM.\n- **N(d1)** = the option's delta. Also interpreted as the probability of expiry ITM adjusted for the present value of the stock's expected growth (the 'asset-or-nothing' probability).\n\nExample: S=$100, K=$100, r=5%, σ=20%, T=1yr (ATM option)\nd1 = [ln(1) + (0.05 + 0.02) × 1] / (0.20 × 1) = 0.07/0.20 = **0.35**\nd2 = 0.35 0.20 = **0.15**\nN(0.35) 0.637, N(0.15) 0.560\nC = 100 × 0.637 100 × e^(0.05) × 0.560\nC = 63.70 53.26 = **$10.44**\n\n**Put price** (via put-call parity):\nP = K × e^(rT) × N(d2) S × N(d1)\nP = $10.44 + 100×e^(0.05) 100 **$5.57**",
 highlight: [
 "Black-Scholes",
 "d1",
 "d2",
 "N(d2)",
 "N(d1)",
 "implied volatility",
 "delta",
 "risk-neutral probability",
 ],
 },
 {
 type: "teach",
 title: "Greeks Formulas and Intuition",
 content:
 "The Greeks measure sensitivities of option prices to changes in inputs:\n\n**Delta (Δ)**:\nΔ_call = N(d1) — ranges 0 to 1\nΔ_put = N(d1) 1 — ranges 1 to 0\nInterpretation: $Δ change in option value per $1 move in stock.\nATM call delta 0.50.\n\n**Gamma (Γ)**:\nΓ = N'(d1) / (S × σ × T)\nRate of change of delta per $1 stock move. Highest for ATM options near expiry. Long gamma benefits from large moves; short gamma is hurt by them.\n\n**Theta (Θ)**:\nTime decay — option value lost per day. Negative for option holders (you pay time decay). Positive for option sellers.\nATM option Θ (S × σ × N'(d1)) / (2T × 365)\n\n**Vega (ν)**:\nν = S × T × N'(d1)\nChange in option value per 1% increase in implied volatility. Always positive for long options. Long vega profits from rising IV.\n\n**Rho (ρ)**:\nρ_call = K × T × e^(rT) × N(d2)\nSensitivity to interest rate changes. Less important for short-dated options; matters for longer maturities and LEAPS.\n\n**Gamma-Theta trade-off**: Long options pay theta (time decay) to gain gamma (convexity). Short options collect theta but face gamma risk. This is the central tension in options trading.",
 highlight: [
 "delta",
 "gamma",
 "theta",
 "vega",
 "rho",
 "Greeks",
 "time decay",
 "implied volatility",
 "gamma-theta trade-off",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "In the Black-Scholes model, N(d2) represents which probability?",
 options: [
 "The option's delta — probability of expiring ITM adjusted for asset growth",
 "The risk-neutral probability that the option expires in-the-money",
 "The probability that the option buyer exercises early",
 "The probability the stock price falls below the strike",
 ],
 correctIndex: 1,
 explanation:
 "N(d2) is the risk-neutral probability that a European call option expires in-the-money (i.e., S_T > K at expiry). N(d1) is the option's delta — which can also be interpreted as the probability of ITM expiry adjusted upward for the asset's expected growth rate (the 'asset-or-nothing' probability). The difference between N(d1) and N(d2) arises because N(d1) is measured in the asset's probability measure, while N(d2) is in the risk-neutral measure.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are long a near-expiry ATM straddle (long call + long put, same strike). The stock is trading exactly at the strike with 2 days to expiry.",
 question:
 "Which Greeks are most critical to your P&L, and what outcome do you need?",
 options: [
 "High rho; you need interest rates to rise sharply",
 "High positive gamma and negative theta; you need a large stock move before expiry",
 "High vega; you need implied volatility to expand",
 "High delta; you need the stock to move in one direction",
 ],
 correctIndex: 1,
 explanation:
 "Near expiry ATM options have maximum gamma (highest convexity) and maximum theta (fastest time decay). You are long gamma (you benefit from large moves in either direction) but paying high daily theta. With only 2 days left, theta accelerates — you need a large underlying move FAST to offset the rapid time decay. Vega matters less near expiry. Delta for a straddle is near zero (the call delta +0.5 and put delta 0.5 cancel). This is the classic gamma-theta trade-off at its most acute.",
 difficulty: 3,
 },
 ],
 },
 ],
};
