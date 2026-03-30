import type { Unit } from "./types";

export const UNIT_OPTIONS_PRICING_THEORY: Unit = {
 id: "options-pricing-theory",
 title: "Options Pricing Theory",
 description:
 "Black-Scholes model, implied vs historical volatility, Greeks in depth, volatility strategies, and advanced pricing methods",
 icon: "Calculator",
 color: "#0ea5e9",
 lessons: [
 /* ================================================================
 LESSON 1 — Black-Scholes Model
 ================================================================ */
 {
 id: "opt-price-1",
 title: "Black-Scholes Model",
 description:
 "Model assumptions, N(d1)/N(d2) interpretation, sensitivity to inputs, and model limitations",
 icon: "Function",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "The Black-Scholes Formula",
 content:
 "The **Black-Scholes model** (1973) revolutionized options trading by providing a closed-form equation to price European options. It won the Nobel Prize in Economics in 1997.\n\n**The Call Price Formula:**\n`C = S·N(d1) K·e^(rT)·N(d2)`\n\nWhere:\n- **S** = current stock price\n- **K** = strike price\n- **r** = risk-free interest rate\n- **T** = time to expiration (in years)\n- **σ** = implied volatility (annualized)\n- **N(x)** = cumulative standard normal distribution\n\n**d1 and d2:**\n- `d1 = [ln(S/K) + (r + σ²/2)·T] / (σ·T)`\n- `d2 = d1 σ·T`\n\n**Numerical Example:**\n- Stock price S = $100, Strike K = $100 (ATM)\n- T = 30 days = 0.0822 years, σ = 25%, r = 5%\n- d1 0.158, d2 0.086\n- N(d1) 0.563, N(d2) 0.534\n- Call price $100 × 0.563 $100 × 0.996 × 0.534 $2.98\n\nA 30-day ATM call on a $100 stock with 25% IV costs roughly **$2.98** (~3% of stock price).",
 highlight: [
 "Black-Scholes",
 "N(d1)",
 "N(d2)",
 "implied volatility",
 "European options",
 "closed-form",
 ],
 },
 {
 type: "teach",
 title: "Interpreting N(d1) and N(d2)",
 content:
 "The terms N(d1) and N(d2) carry distinct economic meanings that are essential for intuition:\n\n**N(d2) — Probability of Finishing In-the-Money:**\n- Under the risk-neutral measure, N(d2) is the probability that the option expires in-the-money\n- Example: N(d2) = 0.534 means the market assigns ~53% probability the call finishes above the $100 strike\n- For deep ITM calls (S >> K), N(d2) 1.0 (near certain to expire ITM)\n- For deep OTM calls (S << K), N(d2) 0.0\n\n**N(d1) — Delta (Hedge Ratio):**\n- N(d1) is the option's **delta** — how much the call price moves per $1 move in the stock\n- More precisely, it is the risk-neutral expected value of receiving the stock conditional on the option expiring ITM\n- ATM options have delta ~0.50 (N(d1) 0.5)\n- Deep ITM delta 1.0; deep OTM delta 0.0\n\n**Why N(d1) > N(d2):**\n- d1 is always larger than d2 by exactly σ·T\n- This gap arises because receiving the stock (N(d1)) is worth more than receiving a fixed cash amount (N(d2)) when stock prices are lognormally distributed — volatility creates upside asymmetry\n\n**Practical use:** A trader pricing a 30-day ATM call sees delta = 0.56, meaning they need to be long 56 shares per 100 contracts to be delta-neutral.",
 highlight: [
 "N(d2)",
 "probability ITM",
 "delta",
 "N(d1)",
 "hedge ratio",
 "delta-neutral",
 ],
 },
 {
 type: "teach",
 title: "Model Assumptions and Limitations",
 content:
 "Black-Scholes is built on assumptions that are violated in real markets. Understanding these is critical:\n\n**Core Assumptions:**\n1. **Constant volatility** — σ does not change over time or across strikes\n2. **Lognormal returns** — stock prices follow geometric Brownian motion; no jumps\n3. **No dividends** — the underlying pays no cash distributions\n4. **Continuous trading** — can rebalance the hedge at any instant with no costs\n5. **European exercise only** — cannot be exercised early\n6. **Risk-free rate is constant** — flat yield curve\n\n**Real-World Violations:**\n- **Volatility smile/skew**: IV varies by strike — BSM predicts flat IV surface, markets show a skew (puts more expensive than calls)\n- **Fat tails**: Equity returns have kurtosis > 3 (lognormal underestimates crash probability); October 1987 crash was a 25-sigma event under BSM\n- **Jumps**: Earnings announcements, crises cause discontinuous price gaps BSM cannot model\n- **Dividends**: Standard BSM does not account for dividend payments (Merton's extension handles this)\n- **American options**: Early exercise premium for puts is ignored\n\n**Despite limitations, BSM is the industry standard** because:\n- It gives consistent, model-free implied volatility quotes\n- It provides a clean framework for hedging with Greeks\n- Extensions (local vol, stochastic vol, SABR) address the gaps",
 highlight: [
 "constant volatility",
 "lognormal",
 "volatility smile",
 "fat tails",
 "jumps",
 "American options",
 "implied volatility",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A 30-day ATM call option on a $100 stock has a delta of 0.54 and N(d2) = 0.51. What is the best interpretation of N(d2) = 0.51?",
 options: [
 "The option has a 51% risk-neutral probability of expiring in-the-money",
 "The call price will move $0.51 for every $1 move in the stock",
 "The option's time value is 51% of its total premium",
 "The annualized volatility is 51%",
 ],
 correctIndex: 0,
 explanation:
 "N(d2) is the risk-neutral probability that the option expires in-the-money (S > K at expiration). N(d1) is delta — the hedge ratio showing how much the option price moves per $1 stock move. Note that N(d1) > N(d2) because delta accounts for the upside asymmetry of receiving the stock itself.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "According to the Black-Scholes model, options with the same expiry date on the same stock should have identical implied volatilities regardless of their strike price.",
 correct: true,
 explanation:
 "This is true as a theoretical assumption of Black-Scholes — the model assumes constant volatility across all strikes, implying a flat implied volatility surface. However, real markets consistently show a volatility skew/smile, with OTM puts trading at higher IV than ATM or OTM calls. This is one of the most well-known violations of BSM assumptions.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A quantitative trader runs Black-Scholes on SPY options and finds that 5% OTM put options have an implied volatility of 22% while ATM options have an IV of 16%. The 5% OTM call options show an IV of 13%.",
 question:
 "What market phenomenon does this pattern illustrate, and what is the most likely explanation?",
 options: [
 "Volatility skew — investors pay up for downside put protection, reflecting asymmetric crash fear and portfolio insurance demand",
 "Volatility smile — market makers are charging a risk premium for deep ITM contracts",
 "A Black-Scholes model error — implied volatilities should always be equal across strikes",
 "Theta decay — short-dated options lose value faster causing the IV differential",
 ],
 correctIndex: 0,
 explanation:
 "This asymmetric pattern (higher IV for OTM puts, lower for OTM calls) is called volatility skew or the 'volatility smirk.' It reflects: (1) institutional demand for downside put protection as portfolio insurance, (2) empirical fat-tailed distributions with crash risk, and (3) supply/demand imbalances. Black-Scholes cannot explain this — it is a direct consequence of real markets deviating from lognormal assumptions.",
 difficulty: 3,
 },
 ],
 },

 /* ================================================================
 LESSON 2 — Implied vs Historical Volatility
 ================================================================ */
 {
 id: "opt-price-2",
 title: "Implied vs Historical Volatility",
 description:
 "IV definition, IV rank/percentile, IV crush, vol surface, and mean reversion",
 icon: "Activity",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Defining Implied and Historical Volatility",
 content:
 "Volatility is the central variable in options pricing. Understanding the difference between implied and historical vol is essential for every options trade.\n\n**Historical Volatility (HV) / Realized Volatility:**\n- Measures how much the stock actually moved in the past\n- Calculated as the annualized standard deviation of daily log returns\n- Example: If a stock moved ±1% per day for 20 days, HV20 1% × 252 **15.9% annualized**\n- HV is backward-looking — it tells you what happened, not what will happen\n\n**Implied Volatility (IV):**\n- The volatility level implied by the current option market price\n- Derived by solving Black-Scholes in reverse: given C, S, K, r, T find σ that makes BSM price = market price\n- IV is forward-looking — it represents the market's consensus expectation of future realized vol\n- Example: If the same stock's 30-day ATM call costs $3.50 and BSM with σ=25% gives $2.98, then IV > 25% to explain the higher price\n\n**The IV Premium:**\n- Historically, IV tends to overstate subsequent realized vol by 2–5 percentage points on average\n- This 'volatility risk premium' is why selling options has historically been profitable on average\n- Example: S&P 500 IV (VIX) averages ~20% but realized vol averages ~15%; the 5-point spread is the premium sellers collect\n\n**Key relationship to memorize:**\n`IV = Market's forecast of future realized vol + Volatility risk premium`",
 highlight: [
 "historical volatility",
 "realized volatility",
 "implied volatility",
 "volatility risk premium",
 "VIX",
 "forward-looking",
 ],
 },
 {
 type: "teach",
 title: "IV Rank, IV Percentile, and IV Crush",
 content:
 "Raw IV numbers are hard to interpret without context. **IV Rank** and **IV Percentile** provide that context.\n\n**IV Rank (IVR):**\n- Compares current IV to its 52-week high and low\n- Formula: `IVR = (Current IV 52W Low IV) / (52W High IV 52W Low IV) × 100`\n- Example: Stock with 52W IV range 15%–60%, current IV = 45%\n - IVR = (4515)/(6015) × 100 = **66.7**\n - Interpretation: IV is at the 67th percentile of its annual range — elevated, good for selling\n\n**IV Percentile:**\n- Percentage of trading days in the past year where IV was lower than today\n- More robust than IVR when IV spiked briefly (IVR can be skewed by a single spike)\n\n**IV Crush:**\n- A sharp, rapid decline in IV that occurs immediately after a binary event resolves\n- Most common: earnings announcements, FDA approvals, merger votes\n- Example: A biotech stock has IV = 120% before an FDA decision. After approval, IV drops to 40%.\n - An option holder who correctly predicted the direction may still lose money if the stock moved less than the IV implied\n - A 30-day ATM straddle priced for 120% IV might cost $25; if the stock only moves $8, the straddle loses value despite the move\n\n**Trading Rule:** Buy options when IV is low (IVR < 25); sell options/structures when IV is high (IVR > 50). Never buy options purely on direction into earnings without accounting for IV crush.",
 highlight: [
 "IV Rank",
 "IV Percentile",
 "IV Crush",
 "earnings",
 "binary event",
 "52-week range",
 ],
 },
 {
 type: "teach",
 title: "The Volatility Surface and Mean Reversion",
 content:
 "Advanced traders don't just look at a single IV number — they analyze the entire **volatility surface**.\n\n**What is the Vol Surface?**\n- A 3-dimensional grid of IV plotted across strikes (x-axis) and expirations (y-axis)\n- Each point represents the IV of one specific option contract\n- The surface reveals two key structures: the **term structure** and the **volatility skew/smile**\n\n**Term Structure of Volatility:**\n- Normally upward sloping: near-term options have lower IV than longer-dated ones\n- In market stress: curve inverts (near-term IV spikes above long-term IV)\n- Example: VIX (30-day) = 35, VIX9M = 25 during a panic inverted term structure\n- Traders can trade the term structure by going long near-term vol / short long-term vol (calendar spreads)\n\n**Volatility Skew:**\n- Equity options always have a downward skew: OTM puts trade at higher IV than OTM calls\n- This reflects crash fear and portfolio insurance demand\n- Foreign exchange options often show a symmetric smile\n\n**Mean Reversion of Volatility:**\n- Volatility is strongly mean-reverting: high IV tends to fall back to long-run averages, and low IV tends to rise\n- Long-run average VIX 19–20%\n- A VIX of 50 historically reverts to 20 within 60–90 days\n- This mean-reversion property is the core thesis behind short-vol strategies: sell premium when IV is high, collect decay as vol reverts\n- Risk: short-vol strategies suffer catastrophic losses if vol spikes further before reverting (February 2018, March 2020)",
 highlight: [
 "volatility surface",
 "term structure",
 "volatility skew",
 "mean reversion",
 "VIX",
 "calendar spreads",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "AAPL has had IV ranging from 18% to 55% over the past 52 weeks. Current IV is 50%. What is the IV Rank (IVR), and what trading bias does it suggest?",
 options: [
 "IVR = 86; suggests selling premium (short vol strategies like iron condors)",
 "IVR = 50; neutral; no directional volatility bias",
 "IVR = 91; suggests buying premium (long vol strategies like straddles)",
 "IVR = 86; suggests buying calls because IV will compress after earnings",
 ],
 correctIndex: 0,
 explanation:
 "IVR = (5018)/(5518) × 100 = 32/37 × 100 86.5. An IVR above 50 (and especially above 75) indicates elevated implied volatility relative to its annual range. This favors short-vol strategies that profit from IV declining back toward its mean: iron condors, credit spreads, short strangles. The goal is to sell expensive options and profit from IV crush and time decay.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "IV Crush can cause an options buyer to lose money even when the stock moves in the direction they predicted.",
 correct: true,
 explanation:
 "Correct — this is one of the most important concepts in options trading. If you buy a call before earnings and IV is 80%, the option prices in a large move. If the stock only rises 5% when the market expected a 12% move, IV drops from 80% to 30% after earnings (IV crush). The option's vega loss from the IV collapse can exceed the delta gain from the price move, resulting in a net loss even though you correctly called the direction.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are analyzing two options strategies before a Fed rate decision: (A) Buy a 1-week ATM straddle with IV = 48% (IVR = 82); (B) Sell a 45-day iron condor with IV = 38% (IVR = 78).",
 question:
 "Which strategy better aligns with volatility principles, and why?",
 options: [
 "Strategy B — high IVR favors selling premium; iron condor benefits from IV crush and time decay after the event resolves",
 "Strategy A — a Fed decision guarantees large moves, making straddle profits certain",
 "Strategy A — buying vol when IVR is high maximizes profit from IV expansion",
 "Both strategies are equivalent since both have IVR above 75",
 ],
 correctIndex: 0,
 explanation:
 "When IVR is elevated (above 75), options are expensive — IV is near its annual highs. The statistically sound play is to SELL premium, not buy it. Strategy A (buying a straddle at IVR=82) means paying inflated premiums that will suffer IV crush the moment the Fed announcement resolves. Strategy B (selling an iron condor) benefits from both IV decline and theta decay over 45 days. The key rule: high IVR sell vol; low IVR buy vol.",
 difficulty: 3,
 },
 ],
 },

 /* ================================================================
 LESSON 3 — Greeks in Depth
 ================================================================ */
 {
 id: "opt-price-3",
 title: "Greeks in Depth",
 description:
 "Delta as probability proxy, gamma risk near expiry, theta decay curves, vega vs time, rho in rate environments",
 icon: "BarChart2",
 xpReward: 100,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Delta and Gamma — The Price Sensitivity Greeks",
 content:
 "**Delta (Δ):**\n- Measures how much an option's price changes per $1 move in the underlying\n- Calls: delta ranges from 0 to +1; Puts: delta ranges from 1 to 0\n- ATM options have delta ±0.50; deep ITM ±1.0; deep OTM 0\n- **Delta as probability proxy**: Delta N(d2), the risk-neutral probability of expiring ITM\n - A call with delta = 0.30 has approximately a 30% chance of expiring in-the-money\n- Example: You own 1 call contract (100 shares) with delta = 0.55. Stock moves +$2 option gains ~$0.55 × 2 = $1.10 per share, or $110 per contract\n\n**Gamma (Γ):**\n- Measures the rate of change of delta per $1 move in the underlying\n- It is the second-order price sensitivity (the 'acceleration' of delta)\n- Gamma is highest for ATM options near expiration — small moves create large delta shifts\n- Example: ATM call at expiry with 1 day left, gamma = 0.15\n - Stock at $100, delta = 0.50; stock moves to $101 delta jumps to 0.65 (a 0.15 change)\n - Another $1 move: delta 0.80; another: delta 0.95 — the option becomes almost fully stock-like\n\n**Gamma Risk at Expiry:**\n- 'Gamma squeeze' — a stock pinned near a large open-interest strike sees rapid delta hedging by market makers\n- If dealers are short gamma (sold options), they must buy the stock as it rises and sell as it falls, amplifying moves\n- The January 2021 GME squeeze was partly driven by gamma squeezes from massive short-dated call buying",
 highlight: [
 "delta",
 "probability proxy",
 "gamma",
 "acceleration",
 "gamma squeeze",
 "market makers",
 ],
 },
 {
 type: "teach",
 title: "Theta and Vega — Time and Volatility Greeks",
 content:
 "**Theta (Θ) — Time Decay:**\n- Measures how much an option loses in value per day (all else equal)\n- Theta is always negative for long options (you own a wasting asset)\n- Theta is positive for short options (you collect time decay daily)\n- Decay is non-linear: options decay slowly at first, then accelerate in the final 30 days\n- **The theta curve**: A 90-day ATM call might decay $0.03/day; the same option with 5 days left decays $0.15/day\n- Example: You sell a 30-day ATM put with theta = $0.08/share (you collect +$0.08/day)\n - Over 30 days with no stock move: you earn +$0.08 × 30 = $2.40 per share from pure time decay\n\n**Vega (ν) — Volatility Sensitivity:**\n- Measures how much an option's price changes per 1% change in implied volatility\n- A call with vega = 0.20 gains $0.20 in value if IV rises from 25% to 26%\n- Longer-dated options have much higher vega than short-dated ones\n - 180-day option vega 3× the vega of a 30-day option\n- **Vega vs time trade-off**: Near expiry, theta is highest but vega is lowest; long-dated options have maximum vega exposure\n\n**Rho (ρ) — Interest Rate Sensitivity:**\n- Measures sensitivity to a 1% change in the risk-free interest rate\n- Calls have positive rho (higher rates increase call value)\n- Puts have negative rho (higher rates decrease put value)\n- Example: LEAP call (2-year) with rho = 0.15; if rates rise 1% call gains +$0.15\n- Rho is normally the least important Greek — but during rapid Fed hiking cycles (2022–2023), rho became material for long-dated options and LEAPS",
 highlight: [
 "theta",
 "time decay",
 "non-linear decay",
 "vega",
 "implied volatility",
 "rho",
 "interest rate",
 "LEAPS",
 ],
 },
 {
 type: "teach",
 title: "Greek Relationships and Position Management",
 content:
 "Greeks do not operate in isolation — they interact in ways that define your position's complete risk profile.\n\n**The Long Option Profile:**\n- Long call: positive delta, positive gamma, negative theta, positive vega\n- You profit from: stock rising (delta), large moves (gamma), IV rising (vega)\n- You pay for: time passing (theta erosion daily)\n- The core tension: gamma (you want moves) vs theta (time works against you)\n\n**The Short Premium Profile:**\n- Short strangle: negative delta/gamma (initially flat delta), positive theta, negative vega\n- You profit from: stock staying still (theta), IV falling (vega collapse)\n- Your risk: large moves in either direction (negative gamma), IV spike (negative vega)\n\n**Dollar Greeks — Scaling to Position Size:**\n- Delta dollars = delta × position size × stock price\n- A 0.50 delta call on 100 contracts of TSLA at $200 = 0.50 × 10,000 × $200 = $1,000,000 in notional delta exposure\n- Gamma dollars per 1% move = gamma × (stock price/100)² × contracts × 100\n\n**Practical position sizing rule:** Limit vega exposure to no more than 2–3% of portfolio value. Limit gamma dollars such that a 5% one-day gap move does not cause delta to spike beyond your hedge capacity.\n\n**Charm and Vanna:**\n- Charm (delta decay) = rate of change of delta with respect to time — critical for managing delta hedges at expiry\n- Vanna = rate of change of delta with respect to IV — causes vol moves to shift your hedge ratio",
 highlight: [
 "long option profile",
 "short premium",
 "dollar Greeks",
 "vega exposure",
 "gamma dollars",
 "charm",
 "vanna",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "You sold a cash-secured put with delta = 0.35, theta = +$0.12/day, and vega = 0.18. Three weeks later, IV jumps from 20% to 35%. What happens to your position value, all else equal?",
 options: [
 "Position loses approximately $2.70 per share (vega loss: 0.18 × 15 = $2.70)",
 "Position gains $2.52 from theta and $2.70 from vega, netting a gain",
 "Position is unaffected since vega only applies to long options",
 "Position gains because higher IV increases put premium, and you are short the put",
 ],
 correctIndex: 0,
 explanation:
 "You are SHORT the put, which means you have negative vega (vega = 0.18). When IV rises 15 percentage points (from 20% to 35%), the put you sold becomes more expensive. Your short position loses: 0.18 × 15 = $2.70 per share. Theta would have added back +$0.12 × 21 days = +$2.52 over three weeks, but the IV spike significantly offsets this. Net P&L $2.70 + $2.52 = $0.18. This illustrates why short-vol trades fear sudden IV spikes.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A long 1-day-to-expiry ATM option has higher gamma but lower vega than a long 90-day ATM option with the same strike and notional value.",
 correct: true,
 explanation:
 "True on both counts. Gamma peaks for ATM options near expiration — a tiny move in the stock causes delta to swing dramatically from near 0 to near 1 (or vice versa). Vega, however, is proportional to T: longer-dated options have much higher sensitivity to IV changes because there are more days for volatility to affect the outcome. The 90-day option might have vega = 0.25 while the 1-day option has vega = 0.01, but the 1-day option's gamma could be 10× higher.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A market maker is delta-neutral on a large book of short-dated ATM options heading into a 3-day weekend. They are short 500 contracts of a 5-day ATM call (theta = +$0.15/day per contract, gamma = 0.12).",
 question:
 "What is the market maker's biggest risk over the weekend?",
 options: [
 "A large gap move when markets reopen — negative gamma means the position's delta shifts rapidly against them on a big move",
 "Theta decay over the weekend, since short options lose time value they already collected",
 "IV crush after the weekend, which would benefit a short position",
 "Rho risk from potential Fed rate changes announced over the weekend",
 ],
 correctIndex: 0,
 explanation:
 "Short gamma positions profit from stability and collect theta — but they are acutely exposed to large moves. With 3 days of weekend theta +$0.15 × 3 × 500 = +$225 collected, the real danger is a gap open Monday from unexpected news. Negative gamma means delta moves against the position as the stock moves: if the stock gaps up $5, the short call's delta shifts from 0.50 to 0.80, creating a large unhedged loss. The market maker cannot rebalance hedges over the weekend.",
 difficulty: 3,
 },
 ],
 },

 /* ================================================================
 LESSON 4 — Volatility Strategies
 ================================================================ */
 {
 id: "opt-price-4",
 title: "Volatility Strategies",
 description:
 "Long vol (straddle/strangle), short vol (iron condor), vol arbitrage, realized vs implied, VIX relationship",
 icon: "TrendingUp",
 xpReward: 100,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Long Volatility — Trading Upside and Downside Moves",
 content:
 "**Long volatility** strategies profit from large moves in either direction. You are buying the expectation of future realized volatility exceeding current implied volatility.\n\n**Long Straddle:**\n- Buy ATM call + Buy ATM put, same strike, same expiry\n- Max loss = total premium paid; profit if stock moves > breakeven in either direction\n- Breakeven = strike ± total premium\n- Example: Stock at $100, 30-day ATM straddle costs $5.50 total\n - Upper breakeven: $105.50; Lower breakeven: $94.50\n - If stock gaps to $112 (+12%), position profits: $12 $5.50 = **+$6.50 per share**\n - If stock stays at $100 until expiry, you lose the full $5.50 premium\n\n**Long Strangle:**\n- Buy OTM call + Buy OTM put (cheaper than straddle, but requires bigger move)\n- Example: Buy $105 call + $95 put for $2.80 total\n - Breakevens: $107.80 and $92.20 — needs a 7.8%+ move to profit\n - Lower cost means lower theta drag; suitable for high-conviction event plays\n\n**When to use long vol:**\n- IVR is low (IVR < 25) — vol is cheap relative to history\n- A known catalyst exists (earnings, FDA, merger vote) where realized vol will likely exceed current IV\n- Realized vol has been running above IV (rare but occurs in trending markets)\n\n**The enemy of long vol is time:** Every day theta erodes value. A straddle bought 60 days out loses money if the stock does not move enough to offset daily theta decay (~$0.15–0.20/day for a $100 stock with 25% IV).",
 highlight: [
 "long straddle",
 "long strangle",
 "breakeven",
 "realized vol",
 "implied vol",
 "theta drag",
 "IVR",
 ],
 },
 {
 type: "teach",
 title: "Short Volatility — Collecting Premium When Conditions Are Right",
 content:
 "**Short volatility** strategies profit from IV being higher than subsequent realized vol — collecting the volatility risk premium.\n\n**Iron Condor:**\n- Sell OTM call spread + Sell OTM put spread\n- Define risk: max loss = spread width net credit received\n- Example on SPY at $450, 30-day expiry:\n - Sell $460/$470 call spread for $1.20 credit\n - Sell $440/$430 put spread for $1.40 credit\n - Total credit: $2.60; Max loss: $10 $2.60 = **$7.40**\n - Profit zone: SPY stays between $437.40 and $462.60 at expiry\n\n**Short Strangle:**\n- Sell OTM call + Sell OTM put (no defined risk)\n- Higher premium collected but unlimited loss on the call side\n- Suitable only for sophisticated traders with strict delta hedging\n\n**Iron Butterfly:**\n- Sell ATM straddle + Buy wings further OTM for protection\n- Higher maximum credit than iron condor but narrower profit zone\n- Requires the stock to stay very close to the short strike\n\n**When to use short vol:**\n- IVR > 50 (IV elevated, likely to revert toward mean)\n- No known binary events in the expiry window\n- Stock is in a low-volatility, range-bound environment\n- Realized vol has been running well below implied vol\n\n**The risk of short vol strategies:** Tail events (market crashes, unexpected crises) cause massive losses. February 2018 (VIX spiked from 11 to 37 in one day) wiped out several short-vol ETF products. Position sizing with defined-risk structures (iron condors vs naked strangles) is essential.",
 highlight: [
 "iron condor",
 "short strangle",
 "iron butterfly",
 "volatility risk premium",
 "defined risk",
 "tail events",
 ],
 },
 {
 type: "teach",
 title: "Realized vs Implied Vol and the VIX",
 content:
 "**The Volatility Arbitrage Framework:**\nThe core alpha thesis in volatility trading is: implied volatility systematically exceeds realized volatility over time. This spread is the volatility risk premium.\n\n**Measuring the edge:**\n- Compare IV of near-term options to subsequent realized vol\n- Historical avg (SPY): IV 20%, realized 15% a 5% structural edge for vol sellers\n- But this edge disappears (or reverses) in market stress: March 2020 saw SPY realize >100% annualized vol\n\n**Calendar (Time Spread) Strategies:**\n- Buy long-dated option + Sell near-dated option at same strike\n- Profits if near-term realized vol stays low while long-term IV stays elevated\n- Example: Buy 90-day ATM call (vega=0.30, theta=$0.05) + Sell 30-day ATM call (vega=0.18, theta=+$0.08)\n - Net daily theta: +$0.03; net vega: +$0.12\n - Profits if the stock stays near the strike for 30 days, then short leg expires worthless\n\n**The VIX — Fear Index:**\n- VIX = 30-day constant-maturity IV of SPX options (weighted average of puts and calls)\n- Calculated by CBOE from actual market option prices — no model assumptions\n- VIX interpretation scale:\n - VIX < 15: complacency/low fear, expensive time to buy insurance\n - VIX 15–25: normal market conditions\n - VIX 25–35: elevated worry, early-stage stress\n - VIX > 35: crisis/panic, historically good time to buy the dip and sell vol (mean reversion)\n- VIX has a strong negative correlation with the S&P 500 (0.75 historically)",
 highlight: [
 "volatility arbitrage",
 "realized vs implied",
 "VIX",
 "calendar spread",
 "volatility risk premium",
 "mean reversion",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A stock has IV = 28% (IVR = 72) with no earnings for 8 weeks. You sell a 45-day iron condor: sell $110 call / buy $120 call, sell $90 put / buy $80 put for a net credit of $2.50. What is your maximum loss per contract?",
 options: [
 "$750 (spread width $10 $2.50 credit = $7.50 × 100 shares)",
 "$250 (the credit collected is the max loss)",
 "$1,000 (full spread width of $10 × 100 shares)",
 "$500 (average of max loss and credit)",
 ],
 correctIndex: 0,
 explanation:
 "For an iron condor, max loss = (spread width net credit) × 100 shares per contract. Each spread is $10 wide ($110/$120 and $90/$80). Max loss = ($10 $2.50) × 100 = $750 per contract. This occurs if the stock breaks through either short strike ($110 on upside, $90 on downside) and continues to the long strike at expiry. The defined maximum loss is the key advantage of iron condors over naked short strangles.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The VIX measures the implied volatility of individual S&P 500 stocks, averaged across the index constituents.",
 correct: false,
 explanation:
 "False. The VIX measures the implied volatility of SPX index options (options on the S&P 500 index itself), not individual stocks. It is calculated by CBOE using a model-free methodology that weights real option prices across multiple strikes and expirations to produce a 30-day constant-maturity IV reading. Individual stock implied volatilities are tracked separately and are always higher than the index IV due to diversification (single-stock idiosyncratic risk).",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "The VIX spikes from 18 to 42 during a market sell-off. You are short a 45-day SPY strangle (short the $400 put, short the $460 call) with a net credit of $4.50. SPY drops from $430 to $390.",
 question:
 "Which two Greeks explain the majority of your mark-to-market loss?",
 options: [
 "Negative delta (stock dropped through your short put strike) and negative vega (IV expansion from 18 to 42% crushes short vol positions)",
 "Negative theta (time decay reversed by the crisis) and positive rho (rates fell during risk-off)",
 "Positive gamma (the position gained convexity from the move) and negative theta",
 "Negative vega only — delta is neutral in a strangle",
 ],
 correctIndex: 0,
 explanation:
 "Two forces drive losses here. (1) Negative delta: SPY fell from $430 to $390, passing through the $400 short put strike. The short put is now ITM and you are effectively long delta in a falling market — delta loss. (2) Negative vega: IV exploded from 18% to 42% (a 24-point jump). With short vega on both legs, each point of IV increase costs you money. A strangle with vega = 0.30 loses $0.30 × 24 = $7.20 per share from vega alone — far exceeding the $4.50 credit collected.",
 difficulty: 3,
 },
 ],
 },

 /* ================================================================
 LESSON 5 — Advanced Options Pricing
 ================================================================ */
 {
 id: "opt-price-5",
 title: "Advanced Options Pricing",
 description:
 "Binomial trees, American vs European, dividend adjustments, barrier options, and exotic payoffs",
 icon: "GitBranch",
 xpReward: 110,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Binomial Trees — Discrete-Time Pricing",
 content:
 "The **binomial tree model** (Cox-Ross-Rubinstein, 1979) is a discrete-time alternative to Black-Scholes that can handle American-style early exercise.\n\n**How a one-step tree works:**\nAt each node, the stock can either go up by factor u or down by factor d:\n- `u = e^(σΔt)`, `d = 1/u`\n- Risk-neutral up-probability: `p = (e^(rΔt) d) / (u d)`\n\n**Numerical Example (1-step):**\n- Stock S = $100, K = $100, T = 1 year, σ = 20%, r = 5%\n- u = e^(0.20×1) = 1.2214; d = 0.8187\n- Su = $122.14, Sd = $81.87\n- p = (e^(0.05) 0.8187) / (1.2214 0.8187) = 0.6368\n- Call payoffs: Cu = max(122.14100, 0) = $22.14; Cd = max(81.87100, 0) = $0\n- Call price = e^(0.05) × (0.6368 × $22.14 + 0.3632 × $0) = **$13.43**\n\n**Multi-step trees:** Using 50–200 steps converges to the Black-Scholes price for European options. With 500 steps, the difference is typically < $0.01.\n\n**The key advantage:** At every node you can check if early exercise is optimal:\n- Compare `intrinsic value` vs `continuation value`\n- If intrinsic value > continuation value exercise early\n- This makes binomial trees the standard method for pricing **American puts** and **dividend-paying stocks**",
 highlight: [
 "binomial tree",
 "Cox-Ross-Rubinstein",
 "risk-neutral probability",
 "American option",
 "early exercise",
 "discrete-time",
 ],
 },
 {
 type: "teach",
 title: "American vs European Options and Dividend Adjustments",
 content:
 "**European Options:**\n- Can only be exercised at expiration\n- Black-Scholes provides the exact closed-form price\n- Most index options (SPX, NDX) are European — this avoids early-exercise complications\n\n**American Options:**\n- Can be exercised at any time before expiration\n- American calls on non-dividend stocks: **never optimal to exercise early**\n - Reason: The option has time value in addition to intrinsic value; exercising forfeits the remaining time value\n - Example: An ITM call worth $8 intrinsic + $2 time value = $10 total; early exercise gives only $8 — always sell instead\n- American puts: **early exercise can be optimal** when deep ITM\n - The put's time value can be negative (the riskless rate on the strike exceeds vega+theta benefits)\n - Example: A put with $50 intrinsic value on a stock near zero; interest on $50 × r > remaining option value\n\n**The American premium** = American option price European option price\n- For calls on non-dividend stocks: American premium = $0 (never exercise early)\n- For puts: American premium can be $0.10–$2.00+ depending on depth of ITM and interest rates\n\n**Dividend Adjustments:**\n- A known dividend payment reduces the stock's value on the ex-div date\n- **Merton's extension** (continuous dividends): replace r with rq, where q = dividend yield\n- **Discrete dividend adjustment**: subtract the present value of all dividends from the stock price before applying BSM\n - Example: AAPL pays $0.96/year; with S=$175, K=$170, 90-day call: reduce S by PV($0.24) $0.239 effective S = $174.76\n- American calls on dividend-paying stocks: **may be optimal to exercise just before the ex-div date** to capture the dividend",
 highlight: [
 "European options",
 "American options",
 "early exercise",
 "American premium",
 "dividend adjustment",
 "Merton extension",
 "ex-dividend",
 ],
 },
 {
 type: "teach",
 title: "Barrier Options and Exotic Payoffs",
 content:
 "Beyond vanilla calls and puts, a range of **exotic options** solve specific hedging and trading needs at lower premiums.\n\n**Barrier Options:**\n- The option activates (knock-in) or deactivates (knock-out) if the stock hits a barrier level\n- **Knock-out call**: a standard call that ceases to exist if the stock touches a barrier\n - Example: Buy a 90-day $100 call, knock-out at $85. If stock falls to $85 at any point, the option disappears — cheaper than a vanilla call because there is downside termination risk\n- **Knock-in put**: a put that only activates if the stock falls to a barrier (useful as cheap crash insurance)\n - Example: 90-day $95 knock-in put activated at $90 might cost $0.85 vs $3.20 for a vanilla put\n- Barrier options are path-dependent: the same terminal price can have completely different payoffs depending on the path taken\n\n**Asian Options:**\n- Payoff based on the average price over the option's life, not just the terminal price\n- Reduces the impact of price manipulation near expiry\n- Common in commodity markets (oil, natural gas): hedging average input costs\n\n**Binary/Digital Options:**\n- Pay a fixed amount ($1 or $100) if the stock is above/below the strike at expiry; $0 otherwise\n- Binary call price e^(rT) × N(d2) — the risk-neutral probability × payout\n- Example: A binary call paying $100 if SPY > $460 at expiry, with N(d2) = 0.38 price $38\n\n**Lookback Options:**\n- Payoff based on the maximum (for calls) or minimum (for puts) price during the option's life\n- \"Perfect timing\" option — as if you bought at the low and sold at the high\n- Very expensive due to optionality; mainly used in structured products\n\n**Real-world use:** Barrier options are widely used in FX and commodity markets, structured notes, and as cheap directional hedges where the termination condition matches the investor's risk scenario.",
 highlight: [
 "barrier options",
 "knock-out",
 "knock-in",
 "path-dependent",
 "Asian options",
 "binary options",
 "lookback options",
 "exotic options",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Using a 1-step binomial tree with u = 1.20, d = 0.85, risk-neutral probability p = 0.60, and r = 5%: a stock is at $50, strike = $50. What is the value of a European call?",
 options: [
 "Approximately $5.71 — call payoffs: up = $10, down = $0; PV = e^(0.05) × (0.60 × $10 + 0.40 × $0)",
 "Approximately $6.00 — simply 0.60 × $10",
 "Approximately $4.80 — the option is worth 12% of the stock price divided by u",
 "Approximately $3.00 — average of up and down payoffs",
 ],
 correctIndex: 0,
 explanation:
 "In the risk-neutral world: Su = $50 × 1.20 = $60, Sd = $50 × 0.85 = $42.50. Call payoffs: Cu = max($60$50, 0) = $10; Cd = max($42.50$50, 0) = $0. Risk-neutral expected value = 0.60 × $10 + 0.40 × $0 = $6.00. Discounting at 5%: C = e^(0.05) × $6.00 0.9512 × $6.00 $5.71. The e^(rT) discounting is essential — forgetting it is a common error.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "It is never optimal to exercise an American call option early on a stock that does not pay dividends.",
 correct: true,
 explanation:
 "True — this is a fundamental result in options theory. An American call on a non-dividend paying stock has the same price as a European call (the American premium = $0). The reason: early exercise gives you only intrinsic value (SK), while holding the option gives you intrinsic value PLUS time value plus the insurance value of the put (via put-call parity). You can always do better by selling the option in the market rather than exercising it. This changes for dividend-paying stocks, where exercising just before an ex-dividend date can be optimal to capture the dividend.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An energy company needs to hedge jet fuel costs for the next 6 months but wants downside protection (cap on fuel costs) while also limiting the premium paid. A vanilla cap (call option on jet fuel) costs $4.20 per barrel. A bank offers a knock-out cap at $1.80 per barrel — the option disappears if jet fuel prices fall below $55/barrel (currently at $80/barrel).",
 question:
 "What is the primary trade-off the company accepts by choosing the knock-out cap?",
 options: [
 "If fuel prices crash below $55 before expiry, the hedge disappears — the company loses protection exactly when they no longer need it (because fuel became cheap), but saves $2.40/barrel in premium",
 "The company gives up all upside profit potential on fuel prices rising above the cap strike",
 "The knock-out cap provides worse payoff at expiry than the vanilla cap at all price levels",
 "The company is exposed to counterparty default risk that does not exist in vanilla caps",
 ],
 correctIndex: 0,
 explanation:
 "The knock-out feature is structured so the option expires worthless if fuel prices fall below $55 — but that is exactly the scenario where the hedge is least needed (cheap fuel). The company saves $2.40/barrel in premium by accepting the termination risk in the favorable scenario. This is the genius of barrier option design: the knock-out eliminates the option in states of the world where its value is zero anyway, making it substantially cheaper while preserving protection for the actual risk scenario (fuel prices staying high or rising).",
 difficulty: 3,
 },
 ],
 },
 ],
};
