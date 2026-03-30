import type { Unit } from "./types";

export const UNIT_ADVANCED_OPTIONS: Unit = {
 id: "advanced-options",
 title: "Advanced Options Strategies",
 description:
 "Ratio spreads, calendar trades, volatility arbitrage, dynamic hedging, and options on futures — professional-grade techniques used by market makers and hedge funds",
 icon: "Layers",
 color: "#8b5cf6",
 lessons: [
 /* ================================================================
 LESSON 1 — Ratio Spreads and Back Spreads
 ================================================================ */
 {
 id: "adv-opt-1",
 title: "Ratio Spreads and Back Spreads",
 description:
 "1×2 ratio spread construction, back spread mechanics, when to use each, undefined vs defined risk, and real-world adjustments",
 icon: "ArrowLeftRight",
 xpReward: 105,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "The 1×2 Ratio Spread",
 content:
 "A **ratio spread** involves buying fewer options than you sell, creating a position where you collect net credit in exchange for taking on additional directional risk beyond a certain point.\n\n**Standard 1×2 Call Ratio Spread — Construction:**\n- **Buy** 1 ATM call (e.g., $100 strike, premium = $3.50)\n- **Sell** 2 OTM calls (e.g., $110 strike, premium = $1.40 each)\n- **Net credit collected:** 2 × $1.40 $3.50 = **$0.70** (actually a net debit of $0.70 in this example; adjust strikes for a credit)\n\nWith strikes closer: Buy 1 × $100 call at $4.00, sell 2 × $108 calls at $2.20 each:\n- Net credit = 2 × $2.20 $4.00 = **$0.40 credit**\n\n**Payoff at Expiration:**\n| Stock Price | P&L |\n|---|---|\n| Below $100 | Keep $0.40 credit |\n| $100–$108 | Credit + intrinsic on long call |\n| $108 (max profit) | +$8.40 = $8 intrinsic + $0.40 credit |\n| Above $108 | Profit erodes; short extra call kicks in |\n| Above $116.40 | Net loss begins (break-even = $108 + $8.40) |\n| $130 | Loss = $13.60 (unlimited if not managed) |\n\n**Put Ratio Spread** mirrors this on the downside: buy 1 ATM put, sell 2 OTM puts. Ideal when you expect a moderate decline but not a crash.",
 highlight: [
 "ratio spread",
 "1×2",
 "net credit",
 "ATM",
 "OTM",
 "unlimited risk",
 "break-even",
 ],
 },
 {
 type: "teach",
 title: "Back Spreads — Unlimited Upside, Limited Downside",
 content:
 "A **back spread** (or reverse ratio spread) is the mirror-image trade: you sell fewer options than you buy. This creates a position that profits from large directional moves and benefits from rising volatility.\n\n**Call Back Spread — Construction:**\n- **Sell** 1 ITM or ATM call (e.g., $95 strike, premium = $7.00)\n- **Buy** 2 OTM calls (e.g., $105 strike, premium = $2.50 each)\n- **Net debit:** 2 × $2.50 $7.00 = **$2.00** (net debit of $2.00)\n\n**Payoff at Expiration (stock at $100):**\n| Stock Price | P&L |\n|---|---|\n| Below $95 | $2.00 (lose the net debit) |\n| $95–$105 | Loss zone; max loss at $105 = $12 (short $95 call in full, longs worth $0) |\n| $105 (max loss) | $12.00 |\n| $117 | Break-even: $12 intrinsic on 2× long $22 intrinsic on short = 0 |\n| Above $117 | Unlimited profit (2 long calls outpace 1 short) |\n\n**When to use Back Spreads:**\n- Low IV environment — you want to buy cheap vol\n- Expecting a large move but unsure of direction (use both call and put back spreads)\n- Earnings plays when IV is historically suppressed\n- Avoid when IV is elevated — you pay too much for the long legs\n\n**Vega profile:** Back spreads are **long vega** (profit from IV increases). Ratio spreads are **short vega** (profit from IV decreases or stable markets).",
 highlight: [
 "back spread",
 "reverse ratio spread",
 "long vega",
 "short vega",
 "unlimited profit",
 "max loss",
 "break-even",
 ],
 },
 {
 type: "teach",
 title: "Adjustments and Risk Management",
 content:
 "Managing ratio spreads in live markets requires active monitoring because the risk profile changes dramatically as the stock approaches the short strikes.\n\n**Ratio Spread Adjustment Rules:**\n1. **Rolling up the shorts:** If the stock rallies toward $108 (short strike), buy back the 2 short $108 calls and sell 2 × $115 calls. This moves the danger zone higher and collects additional premium.\n2. **Converting to a condor:** Buy a far OTM call (e.g., $120 strike for $0.50) to cap unlimited upside risk, converting the naked short call to a defined-risk spread.\n3. **Delta hedge:** Sell stock shares against the ratio to neutralize the excess delta from the extra short call.\n4. **Close early:** If stock moves beyond the short strike by more than 1 ATR, close the position — do not let undefined risk run.\n\n**Ratio Spread vs Back Spread — Quick Decision Matrix:**\n| View | IV Environment | Choose |\n|---|---|---|\n| Modest rally or sideways | High IV | Ratio spread (sell vol) |\n| Big breakout expected | Low IV | Back spread (buy vol) |\n| Range-bound | High IV | Put + call ratio spreads |\n| Earnings gap expected | Low IV | Back spread both sides |\n\n**Margin considerations:** Ratio spreads with naked short legs require significant margin — typically 20% of the underlying value per uncovered short option, far exceeding covered spread margin requirements.",
 highlight: [
 "rolling",
 "converting to condor",
 "delta hedge",
 "margin",
 "defined risk",
 "undefined risk",
 "adjustment",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A trader buys 1 × $100 call at $4.00 and sells 2 × $108 calls at $2.20 each for a net credit of $0.40. Where does the position begin to lose money above $108?",
 options: [
 "Above $116.40 (short strike + max profit)",
 "Above $112.00 (short strike + net credit only)",
 "Above $108.40 (short strike + credit)",
 "The position has unlimited profit above $108",
 ],
 correctIndex: 0,
 explanation:
 "Max profit occurs at $108 and equals $8 (intrinsic on the $100 long call) + $0.40 credit = $8.40. Above $108 the extra short call loses $1 for every $1 gain, so the position breaks even again at $108 + $8.40 = $116.40. Beyond that losses are theoretically unlimited.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A call back spread (sell 1 ATM call, buy 2 OTM calls) is a short vega position that profits most when implied volatility falls.",
 correct: false,
 explanation:
 "A call back spread is long vega because you hold more long options than short ones. Long options gain value as IV rises. Back spreads benefit from rising IV and large directional moves. Ratio spreads (opposite construction) are short vega and profit when IV falls or stays stable.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You hold a 1×2 put ratio spread on a $150 stock: long 1 × $150 put at $5.00, short 2 × $140 puts at $2.60 each. Net credit = $0.20. The stock suddenly drops 15% to $127 due to a surprise earnings miss.",
 question:
 "What is the approximate P&L on this position and what is the most appropriate immediate action?",
 options: [
 "Large loss on the extra short put; buy back the extra short $140 put immediately to cap further losses",
 "Profit because the long $150 put is deep in the money; hold the position",
 "Small profit equal to the net credit collected; no action needed",
 "Loss only on the short $140 puts; roll both short puts down to $130",
 ],
 correctIndex: 0,
 explanation:
 "At $127 the long $150 put is worth ~$23 but the two short $140 puts are worth ~$13 each (×2 = $26). Net position value $23 $26 = $3, plus the $0.20 credit, resulting in roughly $2.80 loss per spread. The undefined risk from the extra short put is now dangerous — the correct action is to buy back the extra short put immediately to convert to a simple long put spread and cap further losses.",
 difficulty: 3,
 },
 ],
 },

 /* ================================================================
 LESSON 2 — Calendar and Diagonal Spreads
 ================================================================ */
 {
 id: "adv-opt-2",
 title: "Calendar and Diagonal Spreads",
 description:
 "Time spread mechanics, front vs back month IV, adding directional bias with diagonals, rolling calendars, and earnings calendar plays",
 icon: "CalendarDays",
 xpReward: 105,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Calendar Spread Mechanics",
 content:
 "A **calendar spread** (also called a time spread or horizontal spread) involves buying and selling options with the same strike but different expiration dates. The trade exploits differences in time decay rates between near-term and longer-term options.\n\n**Construction Example — SPY at $450:**\n- **Sell** 1 × $450 call expiring in 30 days (front month), premium = $4.50\n- **Buy** 1 × $450 call expiring in 60 days (back month), premium = $7.20\n- **Net debit:** $7.20 $4.50 = **$2.70**\n\n**Why the trade works:**\n- Theta (time decay) is highest for short-dated options. The 30-day short call loses value faster than the 60-day long call.\n- At 30-day expiration, if SPY is still near $450:\n - Short $450 call expires worthless (collect $4.50)\n - Long 60-day call becomes a 30-day call, now worth ~$4.50–$5.00\n - Profit $1.80–$2.30 on a $2.70 debit\n\n**P&L Shape:** Calendar spreads have a **tent-shaped payoff** — maximum profit when the stock is exactly at the strike at front-month expiration, losses when the stock moves far away in either direction.\n\n**IV Interaction:** Calendars are **long vega** in aggregate because the longer-dated back month has more vega than the short front month. Rising IV after entry expands the value of the spread; falling IV compresses it.",
 highlight: [
 "calendar spread",
 "time spread",
 "front month",
 "back month",
 "theta",
 "tent-shaped",
 "long vega",
 ],
 },
 {
 type: "teach",
 title: "Diagonal Spreads — Adding Directional Bias",
 content:
 "A **diagonal spread** modifies the calendar by using different strikes as well as different expirations, adding a directional component to the time-decay trade.\n\n**Bullish Diagonal — SPY at $450:**\n- **Sell** 1 × $452 call expiring 30 days out, premium = $3.80 (slightly OTM short call)\n- **Buy** 1 × $445 call expiring 60 days out, premium = $8.20 (slightly ITM long call)\n- **Net debit:** $8.20 $3.80 = **$4.40**\n\nCompared to a pure calendar:\n- The ITM long call has higher delta (0.65 vs 0.50) — bullish exposure\n- If SPY rises to $455, the ITM back-month call profits more than the neutral ATM calendar\n- Trade also profits from passage of time and/or IV expansion\n\n**Bearish Diagonal:**\n- Sell OTM put (short expiry, higher strike, e.g. $448 put)\n- Buy ITM put (long expiry, lower strike, e.g. $445 put)\n\n**Key Differences Between Calendar and Diagonal:**\n| Feature | Calendar | Diagonal |\n|---|---|---|\n| Strikes | Same | Different |\n| Directional bias | Neutral | Moderate bull/bear |\n| Net debit | Lower | Higher (ITM long) |\n| Max profit location | At short strike | Above (bull) or below (bear) short strike |\n\n**Diagonal as a Covered Call substitute:** A popular trade is the **poor man's covered call** — buy a deep ITM LEAPS (e.g., 0.80 delta 1-year call) and sell monthly OTM calls against it. This mimics owning 100 shares but at a fraction of the capital.",
 highlight: [
 "diagonal spread",
 "directional",
 "ITM",
 "LEAPS",
 "poor man's covered call",
 "delta",
 "bullish diagonal",
 ],
 },
 {
 type: "teach",
 title: "Rolling Calendars and Earnings Plays",
 content:
 "**Rolling a Calendar** is the process of closing the expiring short option and opening a new short option further out in time, keeping the long back-month option as the anchor.\n\n**Roll mechanics on SPY calendar:**\n1. Day 30: short $450 call expires worthless; collect $4.50\n2. Immediately sell the next 30-day $450 call for $4.20\n3. Repeat until the back-month call has < 20 days remaining\n4. Total premium collected across 3 rolls: $4.50 + $4.20 + $3.90 = $12.60 against a $7.20 cost of the back-month call\n\n**Earnings Calendar Play:**\nBefore earnings, IV in the front month (near-term) often spikes disproportionately versus the back month. Traders exploit this:\n- **Entry:** 1–2 weeks before earnings, sell front-month call/put at the expected move strike, buy back-month same strike\n- **Thesis:** Front-month IV (earnings IV) will be much higher than back-month IV\n- **Exit:** Day before earnings, close the spread (the front-month IV has expanded the spread value without waiting for expiration)\n\n**Example — AAPL at $175 with earnings in 10 days:**\n- Front-month $175 call (10 DTE): IV = 65%, premium = $3.80\n- Back-month $175 call (40 DTE): IV = 42%, premium = $5.40\n- Calendar debit: $1.60\n- Day before earnings: front-month IV spikes to 85%, back-month stays at 44%\n- Front-month call now $5.10, back-month $5.80\n- Spread value: $0.70 loss? No — on the right side the spread can widen: back-month $5.80 front $4.90 = $0.90 (small profit vs $1.60 debit)\n- The real target: the spread widens when realized IV differential is favorable; exit before the earnings crush collapses front-month IV.",
 highlight: [
 "rolling",
 "earnings calendar",
 "IV crush",
 "front-month IV",
 "back-month IV",
 "10 DTE",
 "expected move",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A trader enters a calendar spread by selling a 30-day $200 call for $3.50 and buying a 60-day $200 call for $6.00 (net debit $2.50). At 30-day expiration the stock is at $205 (above the strike). What is the most likely outcome?",
 options: [
 "The short call expires with intrinsic value of $5.00; the position is likely at a loss",
 "Maximum profit because the stock moved above the strike",
 "The position expires worthless on both legs since the stock passed the strike",
 "The long 60-day call doubled in value, generating a large profit",
 ],
 correctIndex: 0,
 explanation:
 "Calendar spreads suffer when the stock moves significantly away from the strike at front-month expiration. The short call is now $5 in-the-money (a $5 loss on the short leg), while the long 60-day call — now a 30-day call — gains less than $5 in value because it still has time value and a delta below 1. The tent-shaped payoff of a calendar means maximum profit is at the strike, and losses mount as the stock moves away.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A diagonal spread using a deep ITM LEAPS as the long leg and a shorter-dated OTM call as the short leg is sometimes called a 'poor man's covered call' because it replicates stock ownership at a lower capital outlay.",
 correct: true,
 explanation:
 "Correct. The deep ITM LEAPS (e.g., delta 0.80) behaves similarly to owning 100 shares but costs a fraction of the stock price. Selling monthly OTM calls against it generates income just like a traditional covered call. The key risk versus a true covered call is that the LEAPS has finite life and loses value if IV collapses.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "NVDA is trading at $600, two weeks before earnings. The 14-DTE $600 straddle is priced at $28 (IV 72%). The 45-DTE $600 straddle is priced at $42 (IV 48%). You enter a calendar spread: sell the 14-DTE $600 call at $14, buy the 45-DTE $600 call at $21. Net debit = $7.",
 question:
 "What is the primary risk of this earnings calendar trade and when should you exit?",
 options: [
 "IV crush post-earnings collapses the front-month IV differential; exit the day before earnings announcement",
 "The stock rallying above $600 is the only risk; hold through earnings",
 "Theta decay will destroy the back-month call; exit within 3 days of entry",
 "There is no risk — the front-month decay always exceeds the back-month decay",
 ],
 correctIndex: 0,
 explanation:
 "Post-earnings IV crush is the primary risk. After earnings, front-month IV collapses from ~72% toward the back-month baseline of ~48%. If the calendar is held through earnings, the spread may compress dramatically as the front-month premium evaporates and the back-month barely moves. The standard approach is to exit the day before earnings to capture the IV differential while it is at maximum — you profit from the elevated front-month IV without experiencing the post-earnings crush.",
 difficulty: 3,
 },
 ],
 },

 /* ================================================================
 LESSON 3 — Volatility Arbitrage in Practice
 ================================================================ */
 {
 id: "adv-opt-3",
 title: "Volatility Arbitrage in Practice",
 description:
 "Realized vs implied volatility edge, dispersion trading, vol surface arbitrage, and calendar volatility arbitrage used by hedge funds",
 icon: "TrendingUp",
 xpReward: 110,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Realized vs Implied Volatility — Finding the Edge",
 content:
 "**Volatility arbitrage** exploits the persistent difference between **implied volatility (IV)** — the market's forecast of future price movement embedded in option prices — and **realized volatility (RV)** — the actual historical volatility that the stock delivers.\n\n**The Historical Edge:**\nAcademically documented research shows that equity index IV has exceeded subsequent RV roughly 80% of the time over 30-year periods. This is the theoretical basis for systematic volatility selling.\n\n**Example — SPY:**\n- 30-day IV (VIX / 12) = 18%\n- Subsequent 30-day realized vol = 14%\n- IV premium = 4 vol points\n- A delta-hedged short straddle on this IV premium captures approximately: `0.5 × vega × Δvol² × T`\n\n**Practical delta-hedged vol trade:**\n1. Sell 1-month ATM straddle on SPY at IV = 18%\n2. Buy/sell underlying shares to neutralize delta daily\n3. Lock in the difference between IV paid (18%) and RV earned (14%)\n4. P&L vega × (IV RV) per day, accumulated over the month\n\n**Risks to the edge:**\n- IV can be correct during market stress (RV spikes above IV)\n- Transaction costs (commissions + bid-ask on hedges) erode the edge\n- Gamma losses: when RV > IV, daily hedging costs exceed time decay collected\n- **Regime changes**: the IV-RV premium narrows or reverses in crisis periods (2008, March 2020)",
 highlight: [
 "realized volatility",
 "implied volatility",
 "IV premium",
 "delta-hedged",
 "straddle",
 "gamma losses",
 "regime change",
 ],
 },
 {
 type: "teach",
 title: "Dispersion Trading — Index vs Single-Stock IV",
 content:
 "**Dispersion trading** exploits the relationship between **index implied volatility** and the **component stock implied volatilities**. It is one of the most common professional vol arbitrage strategies.\n\n**Core Insight:**\nIndex IV should roughly equal a weighted average of component IVs, adjusted for correlations:\n`IV_index [ Σ(w_i² × σ_i²) + 2 × Σ(w_i × w_j × ρ_ij × σ_i × σ_j) ]`\n\nIn practice, index IV trades at a **correlation premium** — it is usually higher than the weighted average of single-stock IV because the index benefits from diversification only when stocks are uncorrelated. When correlations spike (crisis), index vol spikes more than individual stocks.\n\n**Dispersion Trade — Construction:**\n- **Sell** index variance / straddles (e.g., sell SPX 1-month ATM straddle)\n- **Buy** single-stock straddles on major components (AAPL, MSFT, AMZN, NVDA at weights)\n\n**Profit conditions:**\n- Stock-specific moves (earnings, news) are large but do not correlate stocks move a lot individually but the index stays calm\n- The index IV premium collapses while individual stock RV is high\n\n**Example:**\n- Sell SPX straddle at 18% IV, hedge with equal vega in component straddles at 22% average IV\n- If stocks scatter (low correlation), individual straddles profit on RV while index straddle decays\n- Net profit = correlation risk premium harvested\n\n**Risk:** A risk-off market event raises correlations sharply. All stocks fall together, the index moves more than the single-stock short straddles can offset — a classic dispersion unwind.",
 highlight: [
 "dispersion trading",
 "index IV",
 "single-stock IV",
 "correlation premium",
 "SPX",
 "variance",
 "correlation risk",
 ],
 },
 {
 type: "teach",
 title: "Vol Surface Arbitrage and Calendar Vol Arbitrage",
 content:
 "**The Volatility Surface** is a 3D plot of implied volatility across all strikes (x-axis) and expirations (y-axis). Arbitrage opportunities appear when the surface contains inconsistencies.\n\n**Strike-Based Arbitrage (Vol Skew):**\n- If the $90 put has IV = 35% and the $110 call has IV = 20% on the same expiration, a risk-reversal (sell the $90 put, buy the $110 call) exploits the skew.\n- A simpler example: if a butterfly spread is priced below zero, an outright arbitrage exists.\n- **Butterfly arbitrage condition:** `C(KΔ) 2C(K) + C(K+Δ) 0` must hold; if negative, buy the butterfly for free profit.\n\n**Calendar Vol Arbitrage:**\nIV across time should be consistent with forward volatility:\n`σ_forward² = (σ_T2² × T2 σ_T1² × T1) / (T2 T1)`\n\n- If 30-day IV = 20% and 60-day IV = 22%, forward vol (30–60d) = 24%.\n- If the 30-day IV rises to 25% while 60-day stays at 22%, forward vol becomes negative (impossible!) — a calendar arbitrage exists.\n- Trade: sell the overpriced 30-day straddle, buy the underpriced 60-day straddle (a calendar spread).\n\n**Practical Constraints:**\n- Pure arbitrage is rarely available to retail traders — market makers close gaps in milliseconds.\n- Useful for **relative value**: identify when front-month IV is unusually expensive vs back-month and structure favorable calendar trades.\n- **VIX term structure**: when VIX futures curve is in steep backwardation (front > back), calendar vol arbitrage signals mean reversion of near-term vol.",
 highlight: [
 "volatility surface",
 "skew",
 "butterfly arbitrage",
 "forward volatility",
 "calendar arbitrage",
 "VIX term structure",
 "backwardation",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A delta-hedged short straddle profits when implied volatility is 20% but the stock subsequently delivers a realized volatility of only 13%. What is the primary source of profit in this trade?",
 options: [
 "The implied-realized volatility spread: collecting 20% IV while only paying 13% in hedging costs",
 "The stock staying exactly at the strike price at expiration",
 "Rising implied volatility after the trade is entered",
 "The bid-ask spread captured from market making",
 ],
 correctIndex: 0,
 explanation:
 "A delta-hedged straddle isolates the volatility component of the trade. By continuously delta-hedging, directional P&L is neutralized. The trader profits from the difference between the IV sold (20%) and the RV paid through daily hedge rebalancing (13%). This is the core of volatility arbitrage — sell expensive implied vol, buy back cheaper realized vol through dynamic hedging.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "In dispersion trading, if all stocks in an index crash simultaneously with high correlation, the short index straddle profits because the index moves match the individual stock moves exactly.",
 correct: false,
 explanation:
 "High correlation is the main risk in dispersion trading, not a profit condition. When stocks are highly correlated (all falling together), the index moves MORE than individual stocks would suggest because diversification disappears. The short index straddle loses as the index experiences a large directional move. The individual long straddles do profit, but often not enough to offset the index loss during correlation spikes in a crisis.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You observe that SPY 30-day ATM IV is 28% while 60-day ATM IV is 21%. Using the forward vol formula: forward vol (30–60d) = [(21%² × 60/365 28%² × 30/365) / (30/365)] a number that becomes problematic.",
 question:
 "What does this data imply and what is the appropriate trade?",
 options: [
 "The 30-day IV is anomalously high relative to the 60-day; sell the front-month straddle and buy the back-month straddle (a calendar spread)",
 "The 60-day IV is too cheap; buy both front and back month straddles",
 "The vol surface is normal; no trade is indicated",
 "Sell both the 30-day and 60-day straddles to capture maximum theta",
 ],
 correctIndex: 0,
 explanation:
 "When 30-day IV (28%) significantly exceeds 60-day IV (21%), the implied forward volatility from day 30–60 becomes mathematically suspicious or even negative. This signals that front-month IV is expensive relative to the term structure. The calendar spread (sell expensive front-month IV, buy cheaper back-month IV) is the correct relative-value trade. The trade profits as the front-month IV reverts toward the back-month level.",
 difficulty: 3,
 },
 ],
 },

 /* ================================================================
 LESSON 4 — Dynamic Hedging and Adjustments
 ================================================================ */
 {
 id: "adv-opt-4",
 title: "Dynamic Hedging and Adjustments",
 description:
 "When to adjust vs close, delta adjustments, gamma scaling, rolling strangles down, and legging into iron condors",
 icon: "Settings2",
 xpReward: 110,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "When to Adjust vs Close a Position",
 content:
 "One of the most critical decisions in active options management is knowing **when to adjust** a losing position versus **when to simply close** and take the loss.\n\n**The Adjust vs Close Decision Framework:**\n\n**Favor Closing (taking the loss) when:**\n- The original thesis is broken (e.g., you sold a strangle expecting range-bound but a catalyst drove a trend)\n- Loss has reached 2× the premium received (a widely-used rule for short premium strategies)\n- Days to expiration (DTE) < 14 — gamma risk accelerates sharply and adjustments become ineffective\n- Volatility has expanded dramatically, suggesting a new, adverse regime\n\n**Favor Adjusting when:**\n- The trend is slow and orderly; the original thesis is still plausible\n- DTE > 21 — enough time for the position to recover\n- The adjustment keeps the position within your risk parameters\n- You can collect additional credit to offset the unrealized loss\n\n**The 50% of Max Profit Rule:**\nMany professional traders close profitable short premium trades at 50% of max profit (i.e., buy back a $2.00 credit spread when it is worth $1.00). This locks in half the profit while eliminating the remaining risk period, which statistically improves risk-adjusted returns by reducing exposure to tail events near expiration.\n\n**2× Loss Rule:**\nIf a short strangle collected $3.00 credit, close it if the position reaches $6.00 (2× the credit received). This prevents catastrophic losses from a continued adverse move.",
 highlight: [
 "adjust vs close",
 "2× loss rule",
 "50% profit rule",
 "DTE",
 "gamma risk",
 "theta",
 "short premium",
 ],
 },
 {
 type: "teach",
 title: "Delta Adjustments and Gamma Scaling",
 content:
 "**Delta-neutral management** is the art of keeping a position close to delta-zero while managing the gamma, theta, and vega exposures.\n\n**Continuous Delta Adjustment (delta-hedging):**\n- Sell a 1-month ATM straddle on a $100 stock: initial delta 0 (put delta 0.50 + call delta +0.50)\n- Stock rallies to $103: call delta 0.60, put delta 0.40; net delta = +0.20\n- To re-hedge: **sell 20 shares** (20 × $1 = delta unit neutralized)\n- Stock falls back to $100: re-buy those 20 shares\n- Each buy-low/sell-high hedge rebalancing generates small P&L = **gamma scalping**\n\n**Gamma Scalping vs Theta Decay:**\n- Gamma scalping (dynamic re-hedging) generates profit proportional to (RV)²\n- Theta decay costs the straddle holder proportional to (IV)²\n- Net P&L 0.5 × gamma × (RV² IV²) per time period\n- If RV > IV: gamma scalpng profit > theta loss **long gamma is profitable**\n- If RV < IV: theta loss > gamma scalping profit **short gamma/theta collection is profitable**\n\n**Gamma Scaling Across Expirations:**\n- Near-term options have **high gamma** (large delta change per $1 move) but **high theta**\n- Long-dated options have **low gamma** but **low theta**\n- A gamma-neutral, theta-positive portfolio mixes short near-term with long long-dated options: sell high-gamma, buy low-gamma to collect theta while limiting binary event risk\n\n**Practical Delta Bands:** Most traders do not re-hedge on every tick. Common rules: re-hedge when delta breaches ±25–50% of the position's max delta (e.g., re-hedge when net delta exceeds ±0.10 per contract).",
 highlight: [
 "delta-hedging",
 "gamma scalping",
 "theta decay",
 "gamma neutral",
 "RV vs IV",
 "re-hedge",
 "delta bands",
 ],
 },
 {
 type: "teach",
 title: "Rolling Strangles and Legging into Condors",
 content:
 "**Rolling a Short Strangle** is the most common adjustment technique for a position tested by a directional move.\n\n**Scenario — Short Strangle Tested:**\n- Original trade: sell $95 put / sell $115 call on $105 stock; collect $3.20 total\n- Stock rallies to $112 (approaching the $115 short call)\n\n**Adjustment Options:**\n1. **Roll the tested side out in time:** Buy back the $115 call, sell the next-month $115 call for more premium. You collect additional credit while pushing expiration further.\n2. **Roll the tested side up:** Buy back the $115 call, sell the $120 call in the same expiration. Reduces credit but moves the strike away from the current price.\n3. **Roll the untested side in:** Buy back the $95 put (cheap, far OTM), sell the $105 put to collect credit. This improves overall premium but brings the put strike closer to current price.\n4. **Add the opposite wing (convert to condor):** Buy a $120 call to define risk on the short call. You pay a debit but cap losses above $120.\n\n**Legging into an Iron Condor:**\nInstead of selling the full condor at once, traders often \"leg in\":\n1. When stock is at $105, sell the put spread first (put credit spread with strikes $95/$90)\n2. Wait for the stock to rally toward $112\n3. Now sell the call spread at higher strikes (e.g., $115/$120 call credit spread) at better premium because IV often rises during the rally\n4. Result: better overall credit than entering the condor simultaneously\n\n**Risk of legging:** The stock reverses before you complete the second leg, leaving you with a half-finished position.",
 highlight: [
 "rolling",
 "strangle",
 "tested side",
 "legging in",
 "iron condor",
 "credit spread",
 "untested side",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "You sold a 45-DTE strangle collecting $4.00 in premium. The stock moves adversely and the position is now showing a loss of $8.50 (more than 2× the credit). You still have 32 DTE. What is the most appropriate action?",
 options: [
 "Close the position immediately — the 2× loss rule has been triggered regardless of remaining DTE",
 "Hold until expiration since there are still 32 days left for the position to recover",
 "Roll the tested side to collect more credit and reduce the loss",
 "Convert to a ratio spread to collect additional premium",
 ],
 correctIndex: 0,
 explanation:
 "The 2× loss rule (close when the position reaches 2× the original premium collected) is a hard stop designed to prevent catastrophic losses. At $8.50 loss against a $4.00 credit, the rule has been exceeded. Even with 32 DTE, holding or adjusting a position that has violated the loss threshold statistically leads to worse outcomes because the original thesis was wrong and the position's risk profile may have changed fundamentally.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Gamma scalping is the process of dynamically re-hedging a long gamma position as the underlying moves, which generates profits proportional to realized volatility squared.",
 correct: true,
 explanation:
 "Correct. Gamma scalping profits when realized volatility exceeds the implied volatility paid to own the gamma. The daily P&L from delta re-hedging is approximately 0.5 × gamma × (ΔS)², where ΔS is the actual price move. Summed over time, this scales with RV². The theta decay cost scales with IV². Net P&L is positive when RV > IV, making gamma scalping the practical implementation of being long the RV vs IV differential.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You have a short strangle on TSLA: short $240 put / short $280 call with 35 DTE, collected $6.50 total. TSLA rallies from $260 to $275 (approaching the $280 short call). The $280 call is now worth $4.20 (vs. $2.10 when sold) and the $240 put is worth $0.45 (vs. $4.40 when sold).",
 question:
 "Which adjustment best reduces call risk while improving the overall position's premium profile?",
 options: [
 "Roll the untested put side in: buy back the $240 put at $0.45 and sell a $255 put to collect ~$2.50, generating net credit and improving the put strike",
 "Immediately close the entire strangle to lock in profits on the put side",
 "Buy 100 shares of TSLA to delta-hedge and hold the strangle unchanged",
 "Roll the $280 call to the $290 call in the same expiration for a credit",
 ],
 correctIndex: 0,
 explanation:
 "Rolling the untested (put) side in is the classic strangle adjustment. The $240 put is far OTM and nearly worthless ($0.45). Buying it back is cheap, and selling a closer-to-the-money $255 put collects significant credit (~$2.00–$2.50). This net credit offsets the mark-to-market loss on the short call and keeps the position profitable at more price points. The new strangle ($255 put / $280 call) is now better positioned for the current market level around $275.",
 difficulty: 3,
 },
 ],
 },

 /* ================================================================
 LESSON 5 — Options on Futures and Index Options
 ================================================================ */
 {
 id: "adv-opt-5",
 title: "Options on Futures and Index Options",
 description:
 "European vs American exercise, cash-settled vs physically delivered, SPX vs SPY, VIX options, and futures options margin",
 icon: "BarChart3",
 xpReward: 115,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "European vs American Exercise and Cash Settlement",
 content:
 "Most retail traders are familiar with **American-style** options (can be exercised any time before expiration), but professional traders frequently use **European-style** options that can only be exercised at expiration.\n\n**American vs European Exercise:**\n| Feature | American | European |\n|---|---|---|\n| Exercise timing | Any day before expiry | Expiration only |\n| Early exercise premium | Yes (especially puts) | None |\n| Pricing complexity | Binomial tree / numerical | Black-Scholes exact |\n| Common instruments | Equity options (AAPL, SPY) | Index options (SPX, NDX, RUT) |\n\n**Why European Matters — The Early Exercise Premium:**\nAmerican puts can have early exercise value when deep ITM because interest on the strike proceeds exceeds remaining time value. A $100 put on a $60 stock with 6 months remaining and high interest rates: the $40 intrinsic might be better collected now (and invested at 5%) than held to expiration.\n\n**Cash Settlement vs Physical Delivery:**\n- **Cash-settled:** At expiration, no stock changes hands. The option holder receives the intrinsic value in cash. SPX, NDX, VIX, and futures options typically cash-settle.\n- **Physically delivered:** The option holder receives (or delivers) the actual underlying. Standard equity options (AAPL, TSLA) are physically delivered.\n\n**Cash settlement advantage:** Eliminates pin risk (the stock pinned to a short strike at expiration) and removes the complexity of receiving unwanted stock positions. Index options always cash-settle because you cannot receive \"the S&P 500\" as shares.",
 highlight: [
 "European exercise",
 "American exercise",
 "early exercise",
 "cash settlement",
 "physical delivery",
 "SPX",
 "pin risk",
 ],
 },
 {
 type: "teach",
 title: "SPX vs SPY — Key Differences for Traders",
 content:
 "**SPX** (S&P 500 Index options, traded on CBOE) and **SPY** (S&P 500 ETF options) track the same underlying but have crucial structural differences that impact strategy choice.\n\n**Multiplier and Size:**\n- SPX: multiplier = $100 per index point; index 5,500 1 contract = **$550,000 notional**\n- SPY: multiplier = $100 per share; ETF $550 1 contract = **$55,000 notional**\n- SPX is exactly 10× the notional of SPY\n\n**Exercise Style:**\n- SPX: **European** (cash-settled, no early exercise risk)\n- SPY: **American** (physically settled, can be assigned early)\n\n**Tax Treatment (US):**\n- SPX options qualify as **Section 1256 contracts** 60% long-term / 40% short-term capital gains regardless of holding period. This gives a blended rate advantage (~23% effective vs ordinary income rate).\n- SPY options are taxed as ordinary short-term gains if held < 1 year.\n\n**Bid-Ask Spreads:**\n- SPX options typically have wider absolute spreads but tighter percentage spreads due to higher liquidity in the index derivative market\n- SPY options have tighter absolute spreads, better for smaller traders\n\n**Weekly vs Monthly:**\n- Both have weekly and monthly expiration cycles\n- SPX has AM-settled (opens using Friday morning prints) and PM-settled (uses Friday close) options — a critical distinction for hedgers\n- SPY is always PM-settled\n\n**Choosing between them:** Large institutions and hedgers use SPX for tax efficiency and size. Retail traders use SPY for smaller notional and tighter absolute spreads.",
 highlight: [
 "SPX",
 "SPY",
 "Section 1256",
 "European",
 "American",
 "multiplier",
 "AM-settled",
 "PM-settled",
 "tax treatment",
 ],
 },
 {
 type: "teach",
 title: "VIX Options and Futures Options Margin",
 content:
 "**VIX Options** are among the most unique and misunderstood instruments in the options market.\n\n**Key VIX Option Facts:**\n- The underlying of VIX options is NOT the spot VIX index — it is the **VIX futures** of the corresponding expiration\n- VIX options are European-style, cash-settled\n- When you buy a VIX call, you are betting the VIX futures level will be above the strike at expiration, not the spot VIX\n- Spot VIX and VIX futures can differ significantly (often 2–5 points in contango)\n\n**Practical Example:**\n- Spot VIX = 16.5, March VIX futures = 19.2\n- A March $18 VIX call is priced based on the $19.2 futures, not the $16.5 spot\n- Buying the $18 call when spot VIX is 16.5 does NOT mean you need VIX to rally above 18 from 16.5 — you need the March futures to be above $18 at expiration\n\n**Futures Options Margin — SPAN Margin:**\nOptions on futures (e.g., options on ES, crude oil, gold futures) use the **SPAN (Standard Portfolio Analysis of Risk)** margining system:\n- Margin is based on the portfolio's worst-case 1-day loss across 16 risk scenarios\n- Long options: capped at premium paid (no additional margin)\n- Short options: margin is portfolio-risk based (often lower than equity equivalent because futures options margin accounts for the full portfolio)\n- Example: A short 1 × ES put spread ($5,000 max risk) may require only $500–$800 in SPAN margin versus $5,000 in a standard equity margin account\n\n**Key advantage:** SPAN margin offsets positions across correlated futures, so a trader short oil calls and long gold calls benefits from the negative correlation — total margin can be less than the sum of individual margins.",
 highlight: [
 "VIX options",
 "VIX futures",
 "SPAN margin",
 "contango",
 "European",
 "cash-settled",
 "futures options",
 "portfolio margin",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A US trader sells SPX puts as a recurring income strategy and holds each position for 2–3 weeks. Which tax advantage do SPX options offer over equivalent SPY puts?",
 options: [
 "SPX options are Section 1256 contracts with a 60/40 long-term/short-term split, providing a blended tax rate advantage over short-term gains on SPY options",
 "SPX options are exempt from all capital gains taxes for retail traders",
 "SPX options are marked to market at year-end, allowing unlimited loss harvesting",
 "SPY options qualify for Section 1256 treatment if held for more than 30 days",
 ],
 correctIndex: 0,
 explanation:
 "Section 1256 contracts (which include SPX, VIX, and broad-based index options) receive a 60% long-term / 40% short-term capital gains treatment regardless of holding period. For a trader in a 37% bracket, this blended rate is approximately 26.8% (60% × 20% LT + 40% × 37% ST) versus 37% for short-term SPY option gains. Over many trades, this tax advantage is substantial.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "When you buy a VIX call option with a $20 strike and spot VIX is at $17, the option will profit if spot VIX rises above $20 at expiration.",
 correct: false,
 explanation:
 "VIX call options are priced off VIX futures, not spot VIX. If the relevant VIX futures contract is trading at $22 and the $20 call is priced at $2.50, the option is already in-the-money relative to the futures. At expiration, the settlement value is determined by the Special Opening Quotation (SOQ) of the VIX calculated from SPX options — which tracks the relevant futures contract price, not the spot VIX. Spot VIX can be at $17 while VIX futures and the option's effective underlying are at $22 due to the typical contango in the VIX term structure.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You want to hedge a $500,000 equity portfolio against a market decline using SPX put options. The SPX is at 5,000. One SPX put contract covers $500,000 notional (5,000 × $100). You buy 1 × 4,750 put (5% OTM, 60 DTE) for $28.50 (cost = $2,850 per contract). The market drops 10% to 4,500 at expiration.",
 question:
 "What is the approximate profit on the SPX put hedge and what type of settlement occurs?",
 options: [
 "Cash settlement of $25,000 intrinsic ($4,750 $4,500 = $250 × $100) minus $2,850 premium = ~$22,150 net profit per contract",
 "Physical delivery of S&P 500 shares worth $250,000",
 "The option expires worthless because SPX fell below the strike",
 "Cash settlement of $4,500 (the spot price at expiration)",
 ],
 correctIndex: 0,
 explanation:
 "SPX options are cash-settled and European-style. At expiration with SPX at 4,500, the $4,750 put has $250 intrinsic value ($4,750 $4,500 = $250). Cash settlement = $250 × $100 multiplier = $25,000. After subtracting the $2,850 premium paid, the net profit is $22,150. This partially offsets the ~$50,000 loss on the $500,000 portfolio (10% decline). No stock changes hands — the broker simply credits $25,000 in cash to the account.",
 difficulty: 3,
 },
 ],
 },
 ],
};
