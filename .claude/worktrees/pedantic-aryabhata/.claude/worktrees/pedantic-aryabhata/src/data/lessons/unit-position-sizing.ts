import { Unit } from "./types";

export const UNIT_POSITION_SIZING: Unit = {
 id: "position-sizing",
 title: "Position Sizing & Risk Management",
 description:
 "Master Kelly criterion, volatility targeting, and portfolio risk controls to protect your capital",
 icon: "Shield",
 color: "#EF4444",
 lessons: [
 {
 id: "position-sizing-why-it-matters",
 title: "Why Position Sizing Matters",
 description:
 "Understand ruin risk math, the gambler's ruin formula, and how the Kelly criterion maximizes long-run growth",
 icon: "AlertTriangle",
 xpReward: 40,
 difficulty: "intermediate",
 duration: 7,
 steps: [
 {
 type: "teach",
 title: "Ruin Risk: Even Winners Can Go Broke",
 content:
 "A strategy with a 60% win rate sounds great — but bet 100% of your capital every trade and a single loss wipes you out. This is ruin risk: the probability of losing everything despite a positive expected value. The size of each bet, not just the win rate, determines survival. Over 100 trades at 60% win / 40% loss: if you risk 50% per trade, the odds of ruin exceed 99%. Protect capital first; grow second.",
 visual: "risk-pyramid",
 highlight: ["ruin risk", "expected value", "position sizing"],
 },
 {
 type: "teach",
 title: "Gambler's Ruin Formula",
 content:
 "The gambler's ruin formula quantifies survival odds. With a win probability p, loss probability q = 1 - p, and current capital k out of a goal N, the ruin probability is: P(ruin) = (q/p)^k when p > 0.5. The key insight: doubling your starting capital k cuts ruin probability dramatically. Starting with $1,000 vs $500 against the same odds can reduce ruin probability from 25% to 6%. More starting capital buys you survival through variance.",
 highlight: ["gambler's ruin", "win probability", "ruin probability"],
 },
 {
 type: "teach",
 title: "Kelly Criterion Derivation",
 content:
 "John Kelly (1956) solved for the fraction f* that maximizes the long-run geometric growth rate. For a simple win/loss bet: f* = (bp - q) / b, where b = net odds paid (e.g. b=1 for even money), p = win probability, q = 1 - p. Example: 55% win rate, even odds f* = (1×0.55 - 0.45)/1 = 0.10 or 10% of capital per trade. Full Kelly maximizes compounding but produces large drawdowns, often 50%+ in volatile runs.",
 highlight: ["Kelly criterion", "geometric growth", "f* formula"],
 },
 {
 type: "quiz-mc",
 question:
 "A trader has a strategy with 60% win rate and even money payoff (win $1, lose $1). What is the full Kelly fraction?",
 options: [
 "5% of capital",
 "10% of capital",
 "20% of capital",
 "60% of capital",
 ],
 correctIndex: 2,
 explanation:
 "f* = (b×p - q)/b = (1×0.60 - 0.40)/1 = 0.20 or 20%. With b=1 (even odds), p=0.60, q=0.40: Kelly says bet 20% of capital each trade to maximize long-run growth.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Half-Kelly in Practice",
 content:
 "Professional traders almost universally use Half-Kelly (f*/2) rather than full Kelly. Why? Kelly calculations assume you know the exact win probability, but in real markets that estimate is uncertain. Using half-Kelly cuts the maximum drawdown roughly in half while retaining about 75% of the growth rate. Some quant funds use quarter-Kelly (f*/4) for even greater stability. The lesson: Kelly is a ceiling, not a target.",
 highlight: ["Half-Kelly", "quarter-Kelly", "estimation error"],
 },
 {
 type: "quiz-tf",
 statement:
 "A positive expected value strategy guarantees you will not go broke if you bet a large enough fraction of your capital each trade.",
 correct: false,
 explanation:
 "False. Overbetting a positive EV strategy causes ruin through volatility drag. Betting 100% of capital on a 60% win-rate strategy will result in eventual ruin because any loss (40% of trades) wipes you out completely. Kelly proves there is an optimal fraction beyond which expected log-wealth declines.",
 difficulty: 2,
 },
 ],
 },
 {
 id: "position-sizing-fixed-fractional",
 title: "Fixed Fractional & Percent Risk",
 description:
 "Apply the 1-2% rule, use stop-loss placement to determine size, and understand R-multiples",
 icon: "Percent",
 xpReward: 40,
 difficulty: "intermediate",
 duration: 8,
 steps: [
 {
 type: "teach",
 title: "The 1-2% Rule",
 content:
 "The fixed fractional method risks a fixed percentage of account equity on each trade. Professional traders typically risk 1-2% of total capital per trade. On a $50,000 account at 1% risk: maximum loss per trade = $500. This keeps any single losing trade small relative to the total. After 10 consecutive losses at 2% risk, you have lost only 18% of capital (compound effect: 0.98^10 = 0.817). Sustainable losses let you recover and continue trading.",
 highlight: ["1-2% rule", "fixed fractional", "maximum loss"],
 },
 {
 type: "teach",
 title: "Stop-Loss Placement Determines Position Size",
 content:
 "The critical insight: your stop-loss level dictates position size, not the other way around. Process: 1) Identify the logical stop-loss price (below support, beyond ATR, etc.). 2) Calculate the dollar risk per share = Entry Price - Stop Price. 3) Position size = Dollar Risk Budget / Dollar Risk Per Share. Example: $500 risk budget, entry $100, stop $95 (risk $5/share) buy 100 shares. Never set stops based on how many shares you want to own.",
 highlight: [
 "stop-loss first",
 "position size formula",
 "logical stop",
 ],
 },
 {
 type: "quiz-scenario",
 scenario:
 "Sarah has a $40,000 account and uses a 1.5% risk rule. She wants to buy a stock at $80 with a stop-loss at $74.",
 question: "How many shares should Sarah buy?",
 options: ["50 shares", "100 shares", "200 shares", "600 shares"],
 correctIndex: 1,
 explanation:
 "Risk budget = $40,000 × 1.5% = $600. Dollar risk per share = $80 - $74 = $6. Shares = $600 / $6 = 100 shares. Sarah should buy exactly 100 shares, making her total position $8,000 with a maximum loss of $600.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "R-Multiples: A Universal Risk Language",
 content:
 "Van Tharp's R-multiple framework measures all trades in units of initial risk (1R). If you risk $500 on a trade and make $1,500, that is a 3R win. If you lose $300 of your $500 risk, that is a -0.6R loss. R-multiples enable comparison across different position sizes and assets. A system with average R = 0.5 across all trades is profitable even with a 45% win rate. Target trades with R-multiple potential of at least 2:1 before entry.",
 highlight: ["R-multiple", "risk unit", "reward-to-risk ratio"],
 },
 {
 type: "teach",
 title: "Scaling In/Out and Averaging Down Dangers",
 content:
 "Scaling in means buying partial positions as a trade proves itself (adds only to winners). Example: buy 50% of target at breakout, add 25% on first pullback retest, add remaining 25% at new high. Scaling out locks in profits while letting runners run. Averaging down (buying more as price falls) is the opposite — it increases exposure to a losing idea, can turn a manageable loss into catastrophic one, and is the primary cause of blowups. Never average down without a strict additional risk budget.",
 highlight: ["scaling in", "scaling out", "averaging down danger"],
 },
 {
 type: "quiz-tf",
 statement:
 "Averaging down into a losing position is generally a sound risk management strategy because it lowers your average entry price.",
 correct: false,
 explanation:
 "False. While averaging down does lower average cost, it compounds exposure to a losing idea and violates the core principle that the market is signaling you are wrong. Many professional blowups (Nick Leeson, LTCM) began with averaging down. Only add to positions that are moving in your favor.",
 difficulty: 1,
 },
 ],
 },
 {
 id: "position-sizing-volatility-based",
 title: "Volatility-Based Sizing",
 description:
 "Size positions using ATR, equal volatility contribution, and target portfolio volatility",
 icon: "Activity",
 xpReward: 50,
 difficulty: "advanced",
 duration: 9,
 steps: [
 {
 type: "teach",
 title: "ATR-Based Position Sizing",
 content:
 "Average True Range (ATR) measures a security's typical daily price movement. ATR-based sizing normalizes risk across assets with different volatilities. Formula: Position Size = Dollar Risk Budget / (ATR × ATR Multiplier). Example: $500 risk budget, stock with ATR = $2.50, multiplier = 2 Position Size = $500 / ($2.50 × 2) = 100 shares. A volatile stock gets a smaller position than a quiet one, so each trade contributes the same dollar risk. This prevents high-volatility positions from dominating your P&L.",
 highlight: ["ATR sizing", "ATR multiplier", "dollar risk normalization"],
 },
 {
 type: "quiz-mc",
 question:
 "A trader has a $1,000 risk budget per trade. Stock A has ATR = $5, Stock B has ATR = $2. Using ATR multiplier of 2, which position is larger?",
 options: [
 "Stock A: 100 shares vs Stock B: 250 shares — Stock B is larger",
 "Stock A: 250 shares vs Stock B: 100 shares — Stock A is larger",
 "Both positions are equal at 200 shares each",
 "Stock A: 200 shares vs Stock B: 500 shares — Stock B is larger",
 ],
 correctIndex: 3,
 explanation:
 "Stock A: $1,000 / ($5×2) = 100 shares. Stock B: $1,000 / ($2×2) = 250 shares. Stock B is larger because it is less volatile. ATR sizing gives you MORE shares in quieter stocks and FEWER shares in volatile ones, keeping dollar risk constant at $1,000.",
 difficulty: 3,
 },
 {
 type: "teach",
 title: "Equal Volatility Contribution",
 content:
 "Equal volatility contribution (EVC) ensures every position in a portfolio contributes the same volatility in dollar terms. Steps: 1) Calculate each asset's annualized volatility (std dev of returns × sqrt(252)). 2) Set a target dollar volatility per position (e.g., $2,000/year). 3) Shares = Target Dollar Vol / (Price × Annual Vol). This approach is used by risk-parity funds. A 5% vol stock gets 4× more shares than a 20% vol stock. Bonds and equities can be held in meaningful proportion.",
 highlight: [
 "equal volatility contribution",
 "risk parity",
 "annualized volatility",
 ],
 },
 {
 type: "teach",
 title: "Target Portfolio Volatility",
 content:
 "Many institutional managers target a specific annualized portfolio volatility: conservative (10%), moderate (12-15%), aggressive (18-20%). When realized volatility rises above target, reduce all position sizes proportionally. When volatility falls, sizes increase. This dynamic sizing means you naturally de-risk during market stress (when correlations spike) and add risk in calm periods. Formula: Scaling Factor = Target Vol / Realized Vol. If target is 12% and realized jumps to 20%, scale all positions to 60% of normal size.",
 highlight: [
 "target portfolio volatility",
 "dynamic sizing",
 "scaling factor",
 ],
 },
 {
 type: "quiz-tf",
 statement:
 "In a volatility-targeting framework, a trader should increase position sizes when market volatility spikes significantly above the target level.",
 correct: false,
 explanation:
 "False. When realized volatility exceeds the target, the correct response is to reduce position sizes (scaling factor < 1) to bring portfolio volatility back to target. Increasing size during a volatility spike would amplify risk beyond the intended level and could cause drawdowns far exceeding the risk budget.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Dollar Volatility Normalization Across Assets",
 content:
 "Comparing a $10 stock to a $500 stock by share count is meaningless for risk management. Dollar volatility normalization converts all assets to a common risk unit. Dollar Daily Vol = Price × Daily Return Std Dev × sqrt(1). Example: Stock A at $20 with 2% daily vol has $0.40 daily vol per share. Stock B at $200 with 1% daily vol has $2.00 daily vol per share. To hold equal risk, you need 5× as many shares of Stock A as Stock B. Always size in dollar volatility terms, not share count.",
 highlight: [
 "dollar volatility",
 "normalization",
 "cross-asset comparison",
 ],
 },
 ],
 },
 {
 id: "position-sizing-portfolio-controls",
 title: "Portfolio-Level Risk Controls",
 description:
 "Implement sector limits, max drawdown rules, correlation controls, and VaR-based position limits",
 icon: "ShieldCheck",
 xpReward: 60,
 difficulty: "advanced",
 duration: 10,
 steps: [
 {
 type: "teach",
 title: "Sector & Correlation Concentration Limits",
 content:
 "Holding 8 tech stocks is not 8 independent bets — they are highly correlated and behave like one large bet. Portfolio-level rules: 1) No single sector > 25-30% of portfolio. 2) No single stock > 5-10% of portfolio. 3) Limit correlated clusters (e.g., all energy stocks) to a combined allocation. In 2022, portfolios concentrated in growth tech declined 50-70% while diversified portfolios dropped 20%. Treat correlated positions as a single risk unit when calculating total exposure.",
 visual: "portfolio-pie",
 highlight: [
 "sector concentration",
 "correlation clustering",
 "diversification limits",
 ],
 },
 {
 type: "teach",
 title: "Max Drawdown Rules and Circuit Breakers",
 content:
 "Professional risk managers implement hard drawdown rules that trigger mandatory position reduction. Common framework: At 10% portfolio drawdown reduce all positions by 25%. At 15% drawdown reduce by 50% (half-size mode). At 20-25% drawdown go to near-flat, reassess strategy. These circuit breakers prevent small losing streaks from becoming catastrophic. The math: recovering from a 50% drawdown requires a 100% gain. Recovering from a 25% drawdown only requires a 33% gain. Protect capital aggressively.",
 highlight: [
 "max drawdown",
 "circuit breakers",
 "recovery mathematics",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A portfolio is down 20%. What percentage gain is needed just to break even?",
 options: ["20%", "25%", "33%", "50%"],
 correctIndex: 1,
 explanation:
 "If $100,000 drops to $80,000 (down 20%), you need to gain $20,000 on the $80,000 base: $20,000/$80,000 = 25%. This asymmetry — losses require larger percentage gains to recover — is why limiting drawdowns is critical. A 50% loss requires a 100% gain to recover.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Correlation Spike Behavior: 2008 and 2020",
 content:
 "In normal markets, asset correlations allow genuine diversification. But during crashes, correlations spike toward 1.0 — all assets fall together. In 2008, equities, commodities, real estate, and even some bonds all declined simultaneously. In March 2020, even gold briefly fell as investors sold everything for cash. The lesson: diversification protects against normal variance but provides little protection in a true liquidity crisis. Maintain cash reserves (5-10%) and uncorrelated assets (e.g., short volatility strategies) specifically for crash periods.",
 highlight: [
 "correlation spike",
 "crisis correlation",
 "true diversification",
 ],
 },
 {
 type: "teach",
 title: "VaR-Based Limits and The Sleep Test",
 content:
 "Value at Risk (VaR) estimates the maximum loss at a given confidence level over a time horizon. '95% 1-day VaR = $10,000' means there is a 5% chance of losing more than $10,000 in one day. Institutions set position limits as multiples of daily VaR. But VaR has limits: it underestimates tail risk and failed spectacularly in 2008. The practical complement is the sleep test: if you lie awake worried about a position, it is too large. Reduce size until you can sleep comfortably. Psychological capital is as important as financial capital.",
 highlight: ["Value at Risk", "VaR limits", "sleep test"],
 },
 {
 type: "quiz-scenario",
 scenario:
 "Marcus runs a $200,000 portfolio. He has 30% in tech stocks (all highly correlated with each other), 20% in a single biotech position, and his portfolio is down 18% from its peak. His risk rules say: max sector = 25%, max single stock = 10%, 15% drawdown triggers 50% size reduction.",
 question:
 "Which risk rule violation is most urgent for Marcus to address first?",
 options: [
 "Reduce the biotech position from 20% to 10% — single stock limit breach",
 "Reduce tech exposure from 30% to 25% — sector limit breach",
 "Cut all positions by 50% because he has breached the 15% drawdown rule",
 "Add more positions to improve diversification before addressing drawdown",
 ],
 correctIndex: 2,
 explanation:
 "The 15% drawdown circuit breaker is the most urgent rule — Marcus is down 18%, past the threshold that mandates cutting all positions by 50%. This takes precedence because it protects remaining capital from further decay. After cutting to half-size, he should then address the sector and single-stock concentration limits.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Value at Risk (VaR) at the 95% confidence level accurately captures the true worst-case loss a portfolio can suffer during a financial crisis.",
 correct: false,
 explanation:
 "False. VaR measures the loss threshold at the 95th percentile — it explicitly ignores the worst 5% of outcomes (tail risk). During crises like 2008, actual losses vastly exceeded 95% VaR estimates because tail events are far more extreme than normal distributions assume. VaR is useful for normal conditions but must be supplemented with stress tests, CVaR (conditional VaR), and scenario analysis for true tail risk management.",
 difficulty: 2,
 },
 ],
 },
 ],
};
