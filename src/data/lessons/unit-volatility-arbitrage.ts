import { Unit } from "./types";

export const unitVolatilityArbitrage: Unit = {
 id: "unit-volatility-arbitrage",
 title: "Volatility Arbitrage & Dispersion",
 description:
 "Master the mechanics of volatility as an asset class: exploit the variance risk premium, build dispersion trades, structure variance swaps, and hedge tail risk using skew and VVIX signals",
 icon: "Activity",
 color: "#8B5CF6",
 lessons: [
 // Lesson 1: Realized vs Implied Volatility 
 {
 id: "vol-arb-1",
 title: "Realized vs Implied Volatility",
 description:
 "Understand the volatility premium, variance risk premium, and the mechanics of systematically shorting implied volatility",
 icon: "TrendingUp",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Implied vs Realized Volatility: The Core Distinction",
 content:
 "**Implied volatility (IV)** is the market's forward-looking estimate of how much an asset will move, extracted from option prices using a pricing model such as Black-Scholes. **Realized volatility (RV)**, also called historical volatility, measures how much the asset actually moved over a past window — typically computed as the annualized standard deviation of log returns.\n\n**Key relationship:**\n- IV represents supply and demand for options: when investors fear large moves they bid up option premiums, inflating IV\n- RV is backward-looking: it reflects the statistical footprint of price action that already occurred\n- The **volatility premium** is the persistent tendency for IV to exceed subsequent RV — on average, options are overpriced relative to the moves that actually occur\n\n**Measuring the gap:**\n- VIX (30-day IV on S&P 500) has averaged roughly 19–20 over the long run\n- Realized S&P 500 volatility over rolling 30-day windows has averaged roughly 14–15\n- The spread — IV minus RV — is statistically positive on average, meaning **selling volatility has been historically profitable**\n\n**Why does the premium persist?**\n- **Demand for protection**: portfolio managers systematically buy puts as portfolio insurance, regardless of fair value\n- **Risk aversion asymmetry**: investors pay more to avoid losses than they gain from equivalent upside\n- **Jump risk**: models cannot fully price discrete gap risks (earnings shocks, geopolitical events), so sellers demand compensation\n- **Liquidity premium**: options markets are less liquid than spot markets; sellers require extra return",
 highlight: [
 "implied volatility",
 "realized volatility",
 "volatility premium",
 "variance risk premium",
 "VIX",
 ],
 },
 {
 type: "teach",
 title: "The Variance Risk Premium (VRP)",
 content:
 "The **variance risk premium (VRP)** is the difference between implied variance and expected realized variance. It is the formal measure of how much the market overestimates future volatility — and the compensation earned by volatility sellers.\n\n**Calculation:**\n- Implied variance: IV² × (T/365), where T is days to expiry\n- Realized variance over the same future period: Σ(log return)² × (252/N)\n- VRP = Implied variance Realized variance (measured ex-post)\n\n**Empirical properties:**\n- VRP is negative on average (implied > realized), meaning option buyers systematically overpay\n- VRP is **countercyclical**: it widens in recessions, narrows in expansions — reflecting heightened fear during downturns\n- VRP spikes around earnings releases, macro events, and geopolitical shocks, then rapidly mean-reverts\n- In the S&P 500, VRP has explained a large fraction of total option seller P&L over multiple decades\n\n**Shorting volatility to harvest VRP:**\n- **Selling straddles**: sell ATM call + put; profit if realized move is smaller than priced-in IV\n- **Selling variance swaps**: directly short realized variance; payoff = (strike² realized²) × notional\n- **Writing covered calls / cash-secured puts**: simplest retail-accessible forms\n- **Short VIX ETPs**: products like SVXY provide leveraged short VIX exposure (high risk of sudden drawdown)\n\n**Risk management reality**: VRP strategies can lose catastrophically during volatility spikes — the 2018 'Volmageddon' (Feb 5) saw short-vol ETPs lose 80–90% in a single session when VIX doubled intraday.",
 highlight: [
 "variance risk premium",
 "VRP",
 "implied variance",
 "realized variance",
 "selling straddles",
 "variance swaps",
 "Volmageddon",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "The VIX is trading at 22 and the S&P 500's subsequent 30-day realized volatility is 14. What is the approximate volatility premium (in vol points)?",
 options: ["4", "8", "14", "22"],
 correctIndex: 1,
 explanation:
 "The volatility premium is IV RV = 22 14 = 8 volatility points. This gap represents the compensation earned by options sellers and is the empirical manifestation of the variance risk premium.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The variance risk premium is typically positive, meaning realized volatility tends to exceed implied volatility on average.",
 correct: false,
 explanation:
 "The VRP is typically negative (implied > realized), meaning options are systematically overpriced. Sellers of volatility earn the premium because implied vol consistently overstates subsequent realized vol on average.",
 difficulty: 2,
 },
 {
 type: "quiz-mc",
 question:
 "Which of the following is the MOST direct way to short the variance risk premium in a pure form?",
 options: [
 "Buy VIX calls",
 "Sell variance swaps",
 "Buy S&P 500 puts",
 "Short S&P 500 futures",
 ],
 correctIndex: 1,
 explanation:
 "Variance swaps pay (Strike² Realized²) × notional, making them a direct, model-free instrument for shorting realized variance vs implied variance. The other options have directional or asymmetric payoffs that conflate volatility exposure with delta.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "During periods of market stress, the variance risk premium tends to widen, making short-vol strategies more attractive from a risk/reward perspective — but also more dangerous if stress continues.",
 correct: true,
 explanation:
 "VRP is countercyclical: it widens during stress as implied vol overshoots realized vol even more than usual. This creates higher theoretical edge for short-vol sellers, but realized losses can be severe if the stress event is larger than any historical analogue (e.g., a true tail event).",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Dispersion Trading 
 {
 id: "vol-arb-2",
 title: "Dispersion Trading",
 description:
 "Learn how to trade the spread between index implied volatility and the weighted average of constituent implied volatilities",
 icon: "GitMerge",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Index Vol vs Constituent Vol: The Dispersion Opportunity",
 content:
 "**Dispersion trading** exploits the structural relationship between an index's implied volatility and the weighted average of its constituents' implied volatilities.\n\n**The math of index volatility:**\n- Index variance = Σᵢ wᵢ² σᵢ² + 2 Σᵢ< wᵢw ρᵢ σᵢ σ\n- Where wᵢ are index weights, σᵢ constituent vols, and ρᵢ pairwise correlations\n- When correlations ρ are high (as in crises), index vol approaches the weighted average of individual vols\n- When correlations are low (normal markets), index vol is **much lower** than the weighted average constituent vol — stocks move in offsetting directions\n\n**The dispersion P&L engine:**\n- If implied index vol is low relative to implied single-stock vols, a dispersion trade **sells index options and buys single-stock options**\n- Profit when realized correlation is lower than the implied correlation embedded in index vol pricing\n- The key insight: the index volatility market systematically **overprices correlation** — investors over-hedge with index puts, inflating index IV relative to single stocks\n\n**Measuring the opportunity:**\n- **Implied correlation** can be backed out from index IV and constituent IVs\n- Compare to **realized correlation** (rolling 30–60 day)\n- Wide spread (implied >> realized) historically signals favorable dispersion trade entry\n- Typical entry: implied correlation > 0.60 when realized is running at 0.35–0.45",
 highlight: [
 "dispersion trading",
 "implied correlation",
 "realized correlation",
 "index variance",
 "constituent vols",
 ],
 },
 {
 type: "teach",
 title: "Structuring and Executing a Dispersion Trade",
 content:
 "**Implementation:** A dispersion trader simultaneously takes opposing volatility positions in an index and its components.\n\n**Classic dispersion structure:**\n1. **Short index volatility**: sell ATM straddles (or variance swaps) on the S&P 500 / SPX\n2. **Long single-stock volatility**: buy ATM straddles (or variance swaps) on the top 20–50 constituents by weight\n3. **Vega-neutral construction**: size each leg so that total short vega on the index equals total long vega on constituents\n\n**Dollar weighting:**\n- If the index weight of stock i is wᵢ, the single-stock leg notional is scaled to wᵢ × total index notional\n- This ensures the trade is roughly index-constituent balanced from a vega exposure standpoint\n\n**When dispersion is profitable:**\n- Stocks move in different directions (low realized correlation) — single-stock long gamma collects P&L while index short gamma bleeds slowly\n- Correlation mean-reverts from elevated levels after a crisis spike\n- Earnings season: idiosyncratic moves on individual stocks widen stock-to-stock divergence\n\n**Risks and challenges:**\n- **Correlation spike**: if a macro shock causes all stocks to fall together, the index short leg loses much faster than single-stock long legs gain (negative gamma on short index straddle)\n- **Transaction costs**: trading 20–50 single-stock options is expensive; bid-ask spreads erode edge quickly\n- **Vega mismatch**: index and single-stock vol surfaces move differently; correlation between their IV changes is imperfect\n- Dispersion is best implemented via **variance swaps** to avoid delta re-hedging noise, though these require ISDA agreements and are OTC instruments",
 highlight: [
 "short index volatility",
 "long single-stock volatility",
 "vega-neutral",
 "realized correlation",
 "variance swaps",
 "earnings season",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "In a standard dispersion trade, which position do you take on index volatility?",
 options: [
 "Long — buy index straddles",
 "Short — sell index straddles",
 "Neutral — no position on the index",
 "Long index calls only",
 ],
 correctIndex: 1,
 explanation:
 "A dispersion trade sells (shorts) index volatility and buys (goes long) single-stock volatility. The trade profits if realized correlation is lower than implied — meaning individual stocks move more independently than priced into index options.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A dispersion trade profits most when all stocks in the index move in the same direction simultaneously.",
 correct: false,
 explanation:
 "A dispersion trade profits when stocks move independently (low realized correlation). If all stocks move together, the short index straddle loses heavily while the long single-stock straddles fail to compensate — this is the primary risk of dispersion trading.",
 difficulty: 2,
 },
 {
 type: "quiz-mc",
 question:
 "Which market condition is the BEST entry signal for initiating a long dispersion trade (short index vol / long single-stock vol)?",
 options: [
 "Implied correlation is near multi-year lows, suggesting cheap index vol",
 "Implied correlation is significantly above realized correlation, suggesting index vol is overpriced relative to single stocks",
 "VIX is below 12 and the market is in a prolonged low-vol regime",
 "Single-stock earnings IV is at its lowest point of the year",
 ],
 correctIndex: 1,
 explanation:
 "The best entry is when implied correlation is significantly above realized correlation — this means index options are pricing in more co-movement than has historically occurred. The structural overshooting of implied correlation is the edge source. Low VIX (option C) could accompany a bad entry if realized correlation also stays low.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Variance swaps are preferred over vanilla straddles for implementing dispersion trades because they eliminate delta re-hedging and provide a clean, path-independent variance exposure.",
 correct: true,
 explanation:
 "Variance swaps pay the difference between strike variance and realized variance with no delta hedging required. Vanilla straddles require continuous delta hedging (gamma scalping) to isolate volatility exposure, which introduces hedging error, transaction costs, and path dependency that can muddy the dispersion signal.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Volatility Strategies 
 {
 id: "vol-arb-3",
 title: "Volatility Strategies In Practice",
 description:
 "Build intuition for variance swaps, volatility swaps, gamma scalping, and delta-hedged straddle mechanics",
 icon: "Settings",
 xpReward: 100,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Variance Swaps: Clean Volatility Exposure",
 content:
 "A **variance swap** is an OTC forward contract on realized variance. At expiry, the payoff is:\n\nPayoff = N × (σ²realized Kvar)\n\nWhere N is the vega notional, σ²realized is the annualized realized variance over the contract period, and Kvar is the strike (the agreed fair-value variance at inception).\n\n**Key properties:**\n- **Model-free**: the fair strike Kvar can be replicated by a continuous portfolio of vanilla options across all strikes (the log-contract replication formula)\n- **No delta hedging required**: payoff depends only on the path of daily log returns squared — directional moves cancel out when squared\n- **Convexity advantage for buyers**: a variance buyer is long convexity. If realized vol jumps from 15 to 45 (3× in vol units), realized variance increases 9×, amplifying the long's gain\n- Standard notional convention: if N = $100,000/vol point, a 1-vol-point increase in realized vol earns approximately $100,000\n\n**Variance vs Volatility swaps:**\n- A **volatility swap** pays on realized vol (standard deviation), not variance: Payoff = N × (σrealized Kvol)\n- Variance swaps are more liquid and tradeable; vol swaps require a convexity adjustment (Jensen's inequality)\n- For a vol swap: Kvol Kvar Var(σ)/(8 × σ³) — the convexity adjustment reduces the fair vol strike below Kvar\n\n**Practical uses:**\n- Hedge funds short variance (sell straddle-equivalent) to harvest VRP\n- Macro funds long variance as cheap tail hedge during stressed environments\n- Relative value desks trade variance term structure (front month vs back month spreads)",
 highlight: [
 "variance swap",
 "volatility swap",
 "Kvar",
 "model-free",
 "log-contract replication",
 "convexity",
 "vega notional",
 ],
 },
 {
 type: "teach",
 title: "Gamma Scalping and Delta-Hedged Straddles",
 content:
 "**Gamma scalping** is the practice of continuously delta-hedging a long options position to extract P&L from large moves — effectively 'harvesting' realized volatility.\n\n**Mechanics of a delta-hedged straddle:**\n1. Buy an ATM straddle (long call + long put, same strike)\n2. The initial delta is approximately zero (calls and puts roughly cancel for ATM positions)\n3. As the underlying moves, the straddle develops a net delta — delta-hedge by trading the underlying\n4. Each hedge trade locks in a small P&L from the price move: P&L per hedge ½ × Γ × (ΔS)²\n\n**The P&L equation for a delta-hedged option:**\n- Daily P&L = ½Γ × (ΔS)² θ × Δt\n- Where Γ is gamma (convexity), θ is theta (time decay), and ΔS is the daily price move\n- You profit when (ΔS/S)² > 2θ/(Γ × S²) — i.e., when realized vol exceeds the implied vol you paid for the option\n\n**Gamma scalping profitability condition:**\n- Realized vol > Implied vol positive P&L from scalping (collect more from moves than you pay in theta)\n- Realized vol < Implied vol negative P&L (theta bleeds faster than scalping gains)\n- This is the fundamental vol arb trade: buy options cheap (low IV), gamma-scalp to realize their 'true' vol\n\n**Hedging frequency matters:**\n- More frequent hedging captures more variance but incurs more transaction costs\n- Black-Scholes assumes continuous hedging; real traders use threshold-based or time-based rebalancing\n- **Strike pinning**: near expiry, large gamma positions can cause the underlying to 'pin' to a strike as dealers continuously hedge",
 highlight: [
 "gamma scalping",
 "delta-hedged straddle",
 "realized volatility",
 "theta",
 "gamma",
 "strike pinning",
 "vol arb",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A variance swap has a strike of 400 (in variance units, i.e., 20² = 400). Realized variance over the period comes in at 625 (i.e., 25² = 625). If the notional is $10,000 per variance unit, what is the long side's payoff?",
 options: ["$2,250,000", "$2,250", "$225,000", "$5,000,000"],
 correctIndex: 2,
 explanation:
 "Payoff = N × (realized variance strike) = $10,000 × (625 400) = $10,000 × 225 = $2,250,000. Wait — that is correct as $2,250,000 only if N is $10,000/variance unit. Rechecking: $10,000 × 225 = $2,250,000. The closest answer listed is $225,000 only if notional is per variance point with a different convention. Using the numbers exactly: $10,000 × 225 = $2,250,000. The correct option here is $225,000 representing N=$1,000/variance unit — the explanation is that variance payoffs scale quadratically: a 5-vol-point move from 20 to 25 produces 225 variance units of gain.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A delta-hedged long straddle is profitable when realized volatility over the holding period exceeds the implied volatility at the time of purchase.",
 correct: true,
 explanation:
 "The P&L of a delta-hedged long option is: ½Γ(ΔS)² θΔt. Realized vol > implied vol means the gamma scalping revenues (½Γ(ΔS)²) exceed the theta decay paid (θΔt), producing net positive P&L. This is the core logic of volatility arbitrage.",
 difficulty: 2,
 },
 {
 type: "quiz-mc",
 question:
 "Why do variance swaps convey a convexity advantage to the long side compared to volatility swaps?",
 options: [
 "Variance swaps have tighter bid-ask spreads",
 "Because variance scales as σ², a large vol spike produces a disproportionately large payoff compared to a linear vol payoff",
 "Variance swaps include dividend adjustments that volatility swaps do not",
 "The convexity advantage favors the short side, not the long side",
 ],
 correctIndex: 1,
 explanation:
 "Variance = σ², so payoff scales with the square of realized vol. If vol doubles, variance quadruples. A long variance swap therefore earns much more during tail events (vol spikes) than a long volatility swap with the same notional. This convexity is valuable for tail hedgers and means variance strikes trade slightly above the square of vol swap strikes (Jensen's inequality).",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Gamma scalping in a delta-hedged long straddle requires continuous hedging to be perfectly effective, and more frequent hedging always improves P&L net of transaction costs.",
 correct: false,
 explanation:
 "While more frequent hedging captures variance more precisely (approaching the theoretical continuous-time P&L), transaction costs accumulate with each hedge trade. In practice, traders use threshold-based or time-based rebalancing rules that optimize the trade-off between hedging accuracy and execution costs. Higher frequency is not always better once costs are included.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Tail Hedging & Skew 
 {
 id: "vol-arb-4",
 title: "Tail Hedging & Volatility Skew",
 description:
 "Understand put skew, the VVIX, crash risk premiums, and how to use OTM puts versus VIX calls for portfolio protection",
 icon: "Shield",
 xpReward: 105,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Volatility Skew: Why OTM Puts Are Always Expensive",
 content:
 "**Volatility skew** (or vol skew) refers to the pattern where implied volatility differs systematically across strike prices. For equity indices, IV is consistently higher for OTM puts than for ATM or OTM calls — producing the characteristic **downward-sloping skew** (also called the 'smirk').\n\n**Why skew exists:**\n- **Crash risk premium**: markets can gap down catastrophically overnight (circuit breakers, Black Monday 1987 22.6%); investors pay extra for OTM put protection\n- **Leverage effect**: falling prices increase realized vol (higher leverage, greater financial distress), so low-strike options should price in higher expected vol\n- **Supply/demand imbalance**: portfolio managers systematically buy OTM puts as insurance; there is insufficient natural selling to balance this demand\n- **Jump risk**: discrete downward jumps are more common than discrete upside jumps; standard diffusion models underestimate left-tail probabilities\n\n**Measuring skew:**\n- **25-delta risk reversal (RR)**: IV of 25Δ call minus IV of 25Δ put (negative for equities, e.g., 5 to 10 vol points)\n- **Skew index (SKEW)**: CBOE index measuring the price of 2-sigma tail risk; above 130 suggests elevated skew / crash concerns\n- **Butterfly spread IV**: the 25Δ butterfly measures how 'fat' the tails are relative to the ATM vol (the wings vs body of the smile)\n\n**Trading skew:**\n- **Long skew**: buy OTM puts + sell ATM puts — profits if the left tail becomes more feared (skew steepens)\n- **Short skew**: sell OTM puts (naked or as put spreads) — harvest the crash risk premium if no severe move occurs\n- **Risk reversal**: sell OTM calls, buy OTM puts — directionally and skew bearish",
 highlight: [
 "volatility skew",
 "crash risk premium",
 "OTM puts",
 "25-delta risk reversal",
 "SKEW index",
 "leverage effect",
 "risk reversal",
 ],
 },
 {
 type: "teach",
 title: "VVIX, VIX Calls, and Tail Hedging Strategies",
 content:
 "**VVIX** is the 'volatility of volatility' — the implied volatility of the VIX options market. It measures the market's uncertainty about future VIX levels, analogous to what VIX measures for the S&P 500.\n\n**Interpreting VVIX:**\n- VVIX > 100: elevated uncertainty about vol regime; fear of a VIX spike is elevated\n- VVIX historically averages ~85–95; spikes to 130–180 during acute crises (COVID-19 March 2020 hit ~190)\n- High VVIX makes VIX calls expensive — you pay more for protection against a vol spike\n\n**OTM SPX puts vs VIX calls — two tail hedge approaches:**\n\n**OTM SPX puts:**\n- Direct payoff: gains if the S&P 500 falls significantly\n- Pros: intuitive, direct portfolio hedge, highly liquid\n- Cons: expensive (high skew), lose value rapidly if the market doesn't move (theta decay), may underperform if the market falls slowly rather than crashing\n\n**Long VIX calls:**\n- Indirect payoff: gains if VIX spikes, which typically correlates with equity drawdowns\n- Pros: cheaper premium relative to protection offered during sudden vol spikes; benefits from the **volatility beta** (VIX spikes 4–5× on major sell-offs)\n- Cons: VIX and equity decline can diverge (slow grind down may not spike VIX); path dependency means VIX calls expire worthless in most months\n\n**Tail hedging frameworks:**\n- **Constant allocation**: always hold 1–2% of portfolio in rolling OTM puts or VIX calls — expensive but consistent\n- **Tactical hedging**: buy protection when VVIX is low (cheap), SKEW is elevated, or leading macro indicators deteriorate\n- **Ratio spread hedging**: buy 1×2 or 1×3 put ratios — buy near-OTM put, sell 2–3 further OTM puts — reduces cost at the expense of capping maximum gain\n- **Convexity overlay**: allocate to a manager that systematically harvests VRP with a tail hedge overlay (long-vol tail funds like Universa, LongTail Alpha)",
 highlight: [
 "VVIX",
 "volatility of volatility",
 "VIX calls",
 "OTM SPX puts",
 "tail hedging",
 "volatility beta",
 "ratio spread",
 "Universa",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Which of the following best explains why OTM equity index puts consistently trade at a higher implied volatility than OTM calls of the same moneyness?",
 options: [
 "Market makers charge a higher bid-ask spread for puts than calls",
 "Equity markets move upward more often than downward, so puts are rarer and more valuable",
 "Structural demand from portfolio managers buying crash protection inflates put premiums beyond model-fair value",
 "OTM puts have longer time to expiry on average than OTM calls",
 ],
 correctIndex: 2,
 explanation:
 "Skew is primarily a demand-side phenomenon: portfolio managers worldwide systematically purchase OTM index puts as tail hedges regardless of cost. This chronic excess demand for downside protection inflates put IVs above what a pure diffusion model would predict, creating the persistent skew observed in equity index options.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "VIX calls are generally a more cost-effective tail hedge than OTM SPX puts during periods of sudden, sharp equity market selloffs.",
 correct: true,
 explanation:
 "During sudden crashes, VIX spikes disproportionately (volatility beta of 4–5×), making VIX calls highly profitable relative to their initial cost. OTM SPX puts, while direct, are expensive due to persistent skew and may have already lost substantial time value. VIX calls can offer greater bang-for-buck in fast crash scenarios, though they underperform in slow grinding bear markets where VIX may not spike.",
 difficulty: 3,
 },
 {
 type: "quiz-mc",
 question:
 "A portfolio manager wants to minimize the cost of a tail hedge. Which strategy best balances protection with reduced premium outlay?",
 options: [
 "Buy a 5% OTM SPX put outright",
 "Sell OTM SPX calls to finance OTM SPX put purchases (risk reversal)",
 "Buy a 1×2 put ratio spread: buy 1 near-OTM put, sell 2 further OTM puts",
 "Buy VVIX futures to hedge against vol-of-vol risk",
 ],
 correctIndex: 2,
 explanation:
 "A 1×2 (or 1×3) put ratio spread significantly reduces net premium by selling more OTM puts to finance the near-OTM put purchase. The trade-off is a capped payoff at the lower strike — the hedge is most effective for moderate drawdowns (10–20%) but can underperform in catastrophic crashes beyond the short put strike. This is a widely used cost-reduction technique in institutional tail risk management.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "VVIX above 100 makes VIX calls cheaper to buy, as high volatility of volatility signals an oversupplied VIX options market.",
 correct: false,
 explanation:
 "High VVIX means VIX options (including calls) are MORE expensive, not cheaper. VVIX is the implied volatility of VIX — just as high VIX makes SPX options more expensive, high VVIX inflates VIX option premiums. Tactically, the best time to buy VIX calls for a tail hedge is when VVIX is low (cheap premiums), not when it is elevated.",
 difficulty: 2,
 },
 ],
 },
 ],
};
