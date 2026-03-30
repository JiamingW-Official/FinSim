import { Unit } from "./types";

export const UNIT_DERIVATIVES_MARKETS: Unit = {
 id: "derivatives-markets",
 title: "Derivatives Markets",
 description:
 "Master futures mechanics, swaps, options Greeks, and exotic derivatives across the full spectrum of derivative instruments",
 icon: "TrendingUp",
 color: "#7C3AED",
 lessons: [
 // Lesson 1: Futures Mechanics 
 {
 id: "derivatives-markets-1",
 title: "Futures Mechanics",
 description:
 "Futures vs forwards, margin mechanics, contango/backwardation, cost of carry pricing, rolling, basis risk, and hedging",
 icon: "TrendingUp",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Futures vs Forward Contracts",
 content:
 "**Futures contracts** and **forward contracts** both lock in a price for a transaction at a future date, but they differ in critical structural ways.\n\n**Futures contracts**:\n- **Standardized**: Fixed contract sizes, delivery dates, and specifications set by the exchange\n- **Exchange-traded**: Traded on regulated exchanges (CME, ICE, Eurex)\n- **Daily mark-to-market**: Gains and losses are settled in cash every day — your margin account is credited or debited daily\n- **Counterparty risk eliminated**: The exchange clearinghouse (e.g., CME Clearing) stands between buyer and seller\n- **Highly liquid**: Easily bought and sold before expiry\n\n**Forward contracts**:\n- **Customized**: Any size, date, and specifications negotiated bilaterally\n- **OTC (over-the-counter)**: Private agreements between two counterparties\n- **Settlement at maturity**: No daily cash flows — gains/losses settle at the contract end date\n- **Counterparty risk**: If your counterparty defaults before expiry, you may not receive your profit\n- **Less liquid**: Difficult to exit before maturity without counterparty agreement\n\n**When to use each**:\n- Corporations hedging specific cash flows (e.g., a UK company receiving $10M USD in 6 months) typically use forwards for the precise customization\n- Traders, funds, and commodity producers typically use futures for liquidity and low transaction costs\n- The **daily mark-to-market** feature of futures creates 'tailing the hedge' complexity for corporations — the timing of cash flows differs from a forward",
 highlight: [
 "futures contracts",
 "forward contracts",
 "mark-to-market",
 "exchange-traded",
 "OTC",
 "clearinghouse",
 "standardized",
 ],
 },
 {
 type: "teach",
 title: "Margin: Initial & Variation",
 content:
 "Margin is the financial safeguard that makes the futures system work. There are two types:\n\n**Initial margin**:\n- The deposit required to open a futures position\n- Set by the exchange based on contract volatility (typically 3–12% of contract value)\n- Example: E-mini S&P 500 futures contract value $250,000; initial margin $12,000 (~5%)\n- This is NOT a down payment — it is a **performance bond** (collateral against potential losses)\n- Can be posted in cash or T-bills\n\n**Variation margin (maintenance margin)**:\n- As your position moves against you, losses are deducted from your margin account daily (mark-to-market)\n- If your account balance falls below the **maintenance margin level** (typically 75–80% of initial margin), you receive a **margin call**\n- You must top up your account back to the **initial margin level** — not just the maintenance margin\n- Failure to meet a margin call broker liquidates your position\n\n**Leverage implications**:\n- Futures provide enormous leverage: controlling $250,000 of S&P 500 exposure with $12,000\n- A 5% adverse move in the S&P 500 = $12,500 loss on one contract exceeds your entire initial margin\n- This is why disciplined position sizing and stop-loss management are essential in futures trading\n\n**Example**: You buy 1 crude oil futures contract (1,000 barrels at $80 = $80,000 notional). Initial margin = $5,000. Oil falls $2/barrel daily loss = $2,000 your margin account drops from $5,000 to $3,000. If maintenance margin is $4,000, you receive a margin call for $2,000.",
 highlight: [
 "initial margin",
 "variation margin",
 "maintenance margin",
 "margin call",
 "mark-to-market",
 "performance bond",
 "leverage",
 ],
 },
 {
 type: "teach",
 title: "Cost of Carry, Contango, Backwardation & Basis Risk",
 content:
 "**Futures pricing — cost of carry model**:\n\n**F = S × e^((r y) × T)**\n\nWhere:\n- **F** = fair futures price\n- **S** = current spot price\n- **r** = cost of carry (risk-free rate + storage costs)\n- **y** = convenience yield (value of holding the physical asset)\n- **T** = time to expiry in years\n\nFor financial futures (equity index, currency): storage cost = 0, and convenience yield reflects dividends or foreign interest rates.\n\n**Contango**: Futures price > Spot price\n- Normal state when r > y (financing + storage exceeds the benefit of having the physical asset)\n- Forward curve slopes upward with time\n- Rolling a long futures position in contango generates **negative roll yield** (selling low, buying high)\n\n**Normal backwardation**: Futures price < Spot price\n- Occurs when y > r (high convenience yield from scarce physical supply)\n- Forward curve slopes downward\n- Rolling in backwardation generates **positive roll yield** (selling high, buying low)\n\n**Basis risk**:\n- Basis = Spot price Futures price\n- At expiry, basis converges to zero (futures price = spot price)\n- Before expiry, basis can fluctuate unpredictably\n- A hedger who uses futures to offset physical commodity exposure faces **basis risk**: the futures hedge may not perfectly offset spot price changes\n- Example: A corn farmer in Iowa hedges using CBOT corn futures. Local Iowa corn prices may deviate from the CBOT benchmark — this difference is the basis, and its variability is basis risk",
 highlight: [
 "cost of carry",
 "contango",
 "normal backwardation",
 "basis risk",
 "roll yield",
 "convenience yield",
 "fair futures price",
 ],
 },
 {
 type: "teach",
 title: "Rolling Futures & Hedging with Futures",
 content:
 "**Rolling futures positions**:\nFutures contracts have fixed expiry dates. Investors and hedgers who want long-term exposure must **roll** — close the expiring contract and reopen the next one.\n\n**Roll mechanics**:\n- The 'roll period' for major contracts is typically 5–10 days before expiry\n- Volume and open interest shift from the near-month to the next-month contract\n- **Roll cost in contango**: Buy next-month at a higher price than you sold the expiring contract\n- **Roll benefit in backwardation**: Buy next-month at a lower price than you sold the expiring contract\n- Commodity ETFs (USO, UNG) suffer from roll cost — this is why they consistently underperform spot commodity prices in contango markets\n\n**Hedging with futures — the hedge ratio**:\nThe **optimal hedge ratio** minimizes the variance of the hedged portfolio:\n\n**Hedge ratio = β × (Portfolio Value ÷ Futures Contract Value)**\n\nWhere β is the portfolio's sensitivity to the futures contract (for equity index futures, β = portfolio beta vs the index).\n\n**Example**: A $10M equity portfolio with β = 1.2 vs S&P 500. One E-mini S&P 500 futures = $250 × 4,500 index level = $1,125,000.\n- Contracts needed = 1.2 × ($10,000,000 ÷ $1,125,000) 10.67 sell 11 contracts to hedge\n\n**Cross-hedge**: Hedging one asset with futures on a related but different asset (e.g., hedging jet fuel with crude oil futures). Cross-hedging introduces additional basis risk beyond normal futures basis.",
 highlight: [
 "rolling futures",
 "roll cost",
 "hedge ratio",
 "cross-hedge",
 "portfolio beta",
 "optimal hedge ratio",
 "roll period",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A portfolio manager holds a $5M equity portfolio with a beta of 0.8 relative to the S&P 500 index. S&P 500 futures contracts have a notional value of $500,000 each. How many futures contracts should the manager SHORT to fully hedge the portfolio?",
 options: [
 "8 contracts — (0.8 × $5,000,000) ÷ $500,000",
 "10 contracts — $5,000,000 ÷ $500,000",
 "6.25 contracts, rounded to 6 — beta-adjusted portfolio value divided by one contract value",
 "4 contracts — half the unhedged number, since beta is less than 1",
 ],
 correctIndex: 0,
 explanation:
 "The optimal hedge ratio formula is: Contracts = β × (Portfolio Value ÷ Futures Contract Value). Here: 0.8 × ($5,000,000 ÷ $500,000) = 0.8 × 10 = 8 contracts short. The beta adjustment is critical — a portfolio with β = 0.8 moves only 80% as much as the index, so you need fewer contracts than if β = 1.0. Shorting 10 contracts would over-hedge, creating a net short exposure to market movements.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A futures contract and a forward contract on the same underlying asset with the same expiry date will always have the same fair value, because both obligate the holder to buy or sell the asset at a fixed price on the future date.",
 correct: false,
 explanation:
 "False. Futures and forwards on the same underlying can have slightly different fair values due to the daily mark-to-market feature of futures. When futures price changes are positively correlated with interest rates, futures will be priced slightly higher than equivalent forwards (because gains can be reinvested at higher rates; losses are funded at lower rates). This is the 'convexity adjustment' or 'futures-forward price difference.' In practice the difference is small for short-dated contracts but becomes meaningful for long-dated interest rate contracts (Eurodollar vs FRA pricing). Additionally, counterparty risk in forwards creates a credit spread absent in exchange-traded futures.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Swaps Deep Dive 
 {
 id: "derivatives-markets-2",
 title: "Swaps Deep Dive",
 description:
 "Interest rate swaps, swap curve construction, currency swaps, CDS mechanics, total return swaps, valuation, and central clearing",
 icon: "ArrowLeftRight",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Interest Rate Swap Mechanics",
 content:
 "An **interest rate swap (IRS)** is an agreement between two parties to exchange interest rate cash flows on a notional principal amount over a defined period. The principal is **never exchanged** — only the interest payments.\n\n**The classic fixed-for-floating swap**:\n- **Fixed-rate payer** (short the swap): Pays a fixed rate (e.g., 4.5%) to the counterparty; receives a floating rate (e.g., SOFR + spread)\n- **Fixed-rate receiver** (long the swap): Receives the fixed rate; pays the floating rate\n- Notional principal: e.g., $100 million\n- Payment frequency: Semi-annual for fixed, quarterly for floating (common convention)\n\n**Why companies use IRS**:\n- A company with floating-rate debt (e.g., bank loan at SOFR + 2%) can **swap to fixed** by entering a swap where they pay fixed and receive floating — their net cost becomes fixed\n- A company with fixed-rate bonds can **swap to floating** if they believe rates will fall\n- Insurance companies and pension funds often receive fixed (long duration) to match long-dated liabilities\n\n**Net settlement**:\n- Cash flows are netted at each payment date\n- Only the difference is paid, not both legs separately\n- Example: Fixed leg = $2.25M; floating leg = $1.75M fixed payer pays net $500,000\n\n**Swap terminology**:\n- **Par swap rate**: The fixed rate that makes the swap's initial NPV equal to zero\n- **DV01 (Dollar Value of 01)**: The change in swap value for a 1 basis point (0.01%) change in the swap rate — the key risk measure for swap portfolios",
 highlight: [
 "interest rate swap",
 "fixed-for-floating",
 "notional principal",
 "SOFR",
 "par swap rate",
 "DV01",
 "net settlement",
 ],
 },
 {
 type: "teach",
 title: "Swap Curve Construction & SOFR/OIS Rates",
 content:
 "The **swap curve** plots par swap rates against maturity (1Y, 2Y, 5Y, 10Y, 30Y). It is one of the most important interest rate benchmarks in global finance.\n\n**SOFR (Secured Overnight Financing Rate)**:\n- Replaced LIBOR as the primary USD reference rate after LIBOR's 2023 cessation\n- Based on actual Treasury repo transactions — more transaction-anchored than LIBOR\n- Published daily by the New York Fed\n- SOFR is an overnight rate; **SOFR Term** rates (1M, 3M, 6M) are derived from SOFR futures\n\n**OIS (Overnight Index Swap)**:\n- Swaps that exchange a fixed rate for the compounded overnight rate (SOFR in USD, STR in EUR, SONIA in GBP)\n- **OIS rates are considered risk-free benchmark rates** — very close to central bank policy rate expectations\n- The OIS curve represents market expectations of future central bank rates over each maturity\n\n**Building the swap curve**:\n1. **Short end (0–2Y)**: Bootstrap from SOFR futures and FRA (forward rate agreement) prices\n2. **Medium term (2–10Y)**: Par swap rates from liquid benchmark swap maturities\n3. **Long end (10–30Y+)**: Par swap rates from institutional swap market\n\n**Swap spread**:\n- Swap rate Treasury yield of the same maturity\n- Historically positive (reflecting bank credit risk above risk-free Treasuries)\n- Swap spreads turned **negative** in some maturities post-2010 due to regulatory-driven demand for swaps as hedge instruments\n- Negative swap spreads mean investors prefer fixed swap receipts over equivalent Treasury coupons — an unusual dislocation",
 highlight: [
 "swap curve",
 "SOFR",
 "OIS",
 "bootstrapping",
 "swap spread",
 "par swap rate",
 "term structure",
 ],
 },
 {
 type: "teach",
 title: "Currency Swaps, CDS & Total Return Swaps",
 content:
 "**Currency swap**:\n- Two parties exchange principal and interest payments **in two different currencies**\n- Unlike IRS, the **principal IS exchanged** — at inception and at maturity (at the same FX rate)\n- Used by corporations to access cheaper funding in foreign markets and then swap back to home currency\n- Example: A US company issues bonds in EUR (because European investors offer better terms), then enters a currency swap to pay USD fixed and receive EUR fixed — net result: USD fixed-rate funding\n\n**Credit Default Swap (CDS)**:\n- A form of insurance against bond default\n- **Protection buyer** pays a periodic premium (the CDS spread, in basis points per year)\n- **Protection seller** receives the premium and pays the buyer if a **credit event** occurs\n- **Credit events**: Failure to pay, restructuring, bankruptcy, repudiation\n- **Settlement**: Either physical (buyer delivers defaulted bonds, receives par) or cash (pays difference between par and recovery value)\n- CDS spreads widen when credit quality deteriorates\n- CDS can be used to hedge bond portfolios or to speculate on credit quality (without owning the bond — 'naked CDS')\n\n**Total Return Swap (TRS)**:\n- The TRS payer transfers the **total return** (price appreciation + income) of a reference asset to the TRS receiver\n- TRS receiver pays a floating rate (SOFR + spread) plus absorbs any depreciation\n- Used for **synthetic exposure**: A fund can gain exposure to an asset without owning it (off-balance-sheet, lower capital requirements)\n- Used in **prime brokerage**: Hedge funds access leverage through TRS on equity baskets\n- The Archegos Capital collapse (2021) involved massive, opaque TRS positions across multiple prime brokers — when stocks fell, $20B+ in losses crystallized",
 highlight: [
 "currency swap",
 "credit default swap",
 "CDS spread",
 "credit event",
 "total return swap",
 "synthetic exposure",
 "protection buyer",
 ],
 },
 {
 type: "teach",
 title: "Swap Valuation & Central Clearing Mandate",
 content:
 "**Swap valuation — NPV of cash flow difference**:\nThe value of a fixed-for-floating swap to the fixed-rate payer at any point in time is:\n\n**Value = PV(Floating leg) PV(Fixed leg)**\n\nAt inception (par swap): Value = 0 (both legs are equal NPV)\n\nAs rates change:\n- If market rates **rise above** the fixed rate: Fixed payer gains (they're paying below-market fixed; the floating received increases)\n- If market rates **fall below** the fixed rate: Fixed payer loses (paying above-market fixed; floating received decreases)\n\n**Discount curve**: Cash flows are discounted using the OIS curve (SOFR discounting became standard after 2012)\n\n**The central clearing mandate (Dodd-Frank/EMIR)**:\nAfter the 2008 financial crisis, regulators determined that opaque bilateral OTC derivatives (especially IRS and CDS) contributed to systemic risk. The solution:\n\n- **Dodd-Frank Act (US, 2010)** and **EMIR (EU, 2012)**: Mandated that standardized OTC derivatives must be cleared through central counterparties (CCPs)\n- **LCH (LCH SwapClear)**: Clears ~$1 quadrillion+ in notional IRS annually — the world's largest CCP for interest rate swaps\n- **CME Clearing**: Major US CCP for IRS and CDS\n\n**How central clearing reduces systemic risk**:\n- CCP becomes the buyer to every seller and seller to every buyer (**novation**)\n- Multilateral netting: Reduces gross exposures dramatically\n- Margin requirements: Both initial and variation margin collected from all participants\n- **Portability**: If a clearing member defaults, client positions can be transferred to another member",
 highlight: [
 "swap valuation",
 "NPV",
 "OIS discounting",
 "central clearing",
 "Dodd-Frank",
 "EMIR",
 "LCH",
 "novation",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A company has a $50M bank loan at a floating rate of SOFR + 150bps. Concerned about rising interest rates, the treasurer enters an interest rate swap where the company pays 4.0% fixed and receives SOFR. What is the company's effective all-in borrowing cost after the swap?",
 options: [
 "5.50% — pays 4.0% fixed + 1.50% spread on the loan (SOFR cancels out)",
 "4.0% — only the fixed swap rate matters after the swap",
 "SOFR + 1.50% — the swap has no effect since SOFR is received and paid",
 "SOFR + 5.50% — all rates are additive",
 ],
 correctIndex: 0,
 explanation:
 "After entering the swap: the company pays SOFR + 1.50% on the loan AND pays 4.0% fixed on the swap, while RECEIVING SOFR on the swap. The SOFR payments net to zero (pay SOFR on loan, receive SOFR on swap). The net cost = 4.0% (fixed swap payment) + 1.50% (loan credit spread) = 5.50% fixed. This is the core mechanic of using IRS for liability management — converting floating-rate exposure to fixed. The SOFR legs cancel and the company locks in a fixed all-in cost regardless of future rate movements.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "In a credit default swap, the protection buyer must own the underlying bonds to benefit from the contract — purchasing CDS without bond ownership (a 'naked CDS') is not permitted under global regulatory frameworks.",
 correct: false,
 explanation:
 "False. While naked CDS (purchasing credit protection without owning the underlying bonds) is heavily debated and was banned for sovereign CDS in the EU under the EU Short Selling Regulation, it is NOT universally banned. In the US and most other jurisdictions, naked CDS on corporate credit is still permitted. Naked CDS allows speculators to express negative credit views and contributes to price discovery. Critics argued naked sovereign CDS (e.g., on Greek debt during the European debt crisis) amplified sovereign stress. The EU banned naked sovereign CDS in 2012, but corporate naked CDS remains legal in most markets globally.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Options Greeks 
 {
 id: "derivatives-markets-3",
 title: "Options Greeks",
 description:
 "Delta, gamma, theta, vega, rho — mechanics and hedging applications including delta hedging and gamma scalping",
 icon: "Activity",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Delta & Gamma — Price Sensitivity",
 content:
 "**Delta (Δ)**:\nDelta measures how much an option's price changes for a $1 move in the underlying asset.\n\n- **Call options**: Delta ranges from **0 to +1**\n - Deep out-of-the-money call: Δ 0 (price barely moves with underlying)\n - At-the-money call: Δ 0.50 (50% chance of expiring ITM)\n - Deep in-the-money call: Δ 1.0 (moves almost dollar-for-dollar with stock)\n- **Put options**: Delta ranges from **1 to 0**\n - ATM put: Δ 0.50\n - Deep ITM put: Δ 1.0\n\n**Delta as probability**: For European options, delta N(d), the risk-neutral probability of the option expiring in-the-money.\n\n**Delta hedging**: A market maker who sells a call option (Δ = +0.50) must buy 50 shares per 100-contract position to be delta-neutral. As the stock moves, delta changes, requiring continuous rebalancing.\n\n**Gamma (Γ)**:\nGamma measures the rate of change of delta — how much delta itself changes per $1 move in the underlying.\n\n- **Gamma is always positive for both calls and puts** (for long positions)\n- **Maximum at-the-money**: Gamma peaks when the option is exactly ATM, especially near expiration\n- Near expiry, ATM gamma becomes explosive — small price moves cause large delta swings\n- **Long gamma = long convexity**: As stock rises, your delta increases (you become more long); as stock falls, your delta decreases (you become less long). You profit from large moves in either direction.\n- **Short gamma = short convexity**: Market makers who sell options are short gamma — they lose from large underlying moves",
 highlight: [
 "delta",
 "gamma",
 "delta hedging",
 "at-the-money",
 "long gamma",
 "short gamma",
 "convexity",
 ],
 },
 {
 type: "teach",
 title: "Theta, Vega & Rho",
 content:
 "**Theta (Θ) — Time Decay**:\nTheta measures the rate at which an option loses value as time passes, assuming all else equal.\n\n- **Always negative for long option positions** (buyers lose value from time decay)\n- **Accelerates near expiration**: An ATM option with 30 days left decays faster per day than one with 90 days left\n- Theta decay accelerates in the final 30 days — the so-called 'theta burn' period\n- **Example**: A $5 ATM call with 30 days to expiry might have Θ = $0.08/day. After one week (5 trading days), the option loses approximately $0.40 to time decay alone, all else equal.\n- **Theta-vega tradeoff**: Selling options earns theta (time decay income) but creates short vega exposure (hurt by rising implied vol)\n\n**Vega (ν) — Implied Volatility Sensitivity**:\nVega measures how much an option's price changes for a 1% change in implied volatility.\n\n- **Always positive for long option positions**\n- **Largest for ATM options and longer-dated options**\n- A long straddle is a pure long-vega position — profits when implied vol expands\n- **Vega trading**: Options traders often separate directional views (delta) from volatility views (vega)\n- Buying options when IV is low (cheap vol) and selling when IV is high (expensive vol) is the core of vega trading\n\n**Rho (ρ) — Interest Rate Sensitivity**:\nRho measures how much an option's price changes for a 1% change in interest rates.\n\n- **Calls**: Positive rho (higher rates increase call value — cost of carry effect)\n- **Puts**: Negative rho (higher rates decrease put value)\n- Rho is the least significant Greek for short-dated options but becomes material for long-dated LEAPS (1–3 year options)",
 highlight: [
 "theta",
 "vega",
 "rho",
 "time decay",
 "implied volatility",
 "theta burn",
 "LEAPS",
 ],
 },
 {
 type: "teach",
 title: "Delta Hedging Mechanics & Gamma Scalping",
 content:
 "**Delta hedging in practice**:\nA market maker sells 100 call contracts (10,000 options) with Δ = 0.45. To be delta-neutral:\n- Must buy 0.45 × 10,000 = **4,500 shares** of the underlying stock\n- As stock rises and delta increases to 0.55, must buy more shares: additional 1,000 shares\n- As stock falls and delta decreases to 0.35, must sell shares: sell 1,000 shares\n\nThis continuous rebalancing is called **dynamic delta hedging**. The market maker is always buying on the way up and selling on the way down — the opposite of a trend-following strategy.\n\n**Gamma scalping (long gamma strategy)**:\nA trader who is **long gamma** (long options, short underlying as a delta hedge) profits from large oscillations in the underlying price:\n\n1. Buy an ATM straddle (long calls and puts) long gamma, short theta\n2. Delta-hedge: Continuously buy/sell shares to stay delta-neutral\n3. Each time the stock moves and you rebalance, you lock in a small profit (buy low after drops, sell high after rallies)\n4. Theta works against you — you pay time decay every day\n5. **P&L = Gamma profits Theta costs**\n\n**Gamma scalping is profitable when**: Realized volatility > Implied volatility (options were bought cheaply)\n**Gamma scalping loses money when**: Realized volatility < Implied volatility (options were overpriced)\n\n**Vega trading**:\n- **Long options in low-vol environments**: Buy options when IV rank is low (cheap vol), profit when IV expands\n- **Short options in high-vol environments**: Sell options when IV is elevated (expensive vol), collect premium as IV reverts\n- IV tends to mean-revert — extreme readings in VIX (above 40 or below 12) often reverse",
 highlight: [
 "delta hedging",
 "gamma scalping",
 "long gamma",
 "realized volatility",
 "implied volatility",
 "dynamic hedging",
 "vega trading",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A market maker sells 200 at-the-money call contracts (20,000 options) with a delta of 0.52 each. To establish a delta-neutral hedge, what position must the market maker take in the underlying stock?",
 options: [
 "Buy 10,400 shares — 0.52 delta × 20,000 options",
 "Sell 10,400 shares — short delta to offset short calls",
 "Buy 5,200 shares — using only 50% of the delta",
 "Sell 10,000 shares — using round-number delta of 0.50",
 ],
 correctIndex: 0,
 explanation:
 "When a market maker SELLS calls, they are short the calls, which creates a negative delta exposure (short calls have negative position delta from the seller's perspective: 0.52 per option × 20,000 = 10,400 delta). To hedge this, they must BUY shares to neutralize the delta. Shares have delta of 1.0 each, so buying 10,400 shares creates +10,400 delta, bringing the net portfolio delta to zero. The market maker is now delta-neutral but still has significant gamma, vega, and theta exposure. They will need to rebalance dynamically as the stock price moves.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A gamma scalping strategy (long options, dynamically delta-hedged) is guaranteed to be profitable as long as the underlying stock price moves significantly in either direction, regardless of the level of implied volatility paid.",
 correct: false,
 explanation:
 "False. Gamma scalping profitability depends on the relationship between REALIZED volatility and IMPLIED volatility — not just on whether the stock moves. If you buy options at very high implied volatility (expensive vol) and the stock subsequently realizes less volatility than priced in, you will lose money despite the stock moving. The daily theta decay you pay erodes the option premium faster than gamma scalping profits accumulate. Gamma scalping is only systematically profitable when realized volatility exceeds the implied volatility at which you purchased the options. This is the fundamental insight of volatility trading: you are always trading the spread between realized and implied vol.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Exotic Options 
 {
 id: "derivatives-markets-4",
 title: "Exotic Options",
 description:
 "Barrier, Asian, lookback, digital, compound, rainbow, quanto options, and real options in corporate finance",
 icon: "Layers",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Barrier Options & Asian Options",
 content:
 "**Exotic options** are derivatives with more complex payoff structures than standard European/American calls and puts. They exist because clients have specific hedging needs that vanilla options cannot meet cost-effectively.\n\n**Barrier options — path-dependent pricing**:\nBarrier options have payoffs that depend not just on the final asset price, but on whether the asset price crosses a predefined **barrier level** during the option's life.\n\n- **Knock-out (KO)**: The option ceases to exist if the barrier is hit\n - *Down-and-out call*: Standard call that expires worthless if stock falls below barrier B\n - *Up-and-out put*: Standard put that expires worthless if stock rises above barrier B\n- **Knock-in (KI)**: The option only becomes active if the barrier is hit\n - *Down-and-in put*: Becomes a standard put only if stock falls to barrier level\n - *Up-and-in call*: Becomes a standard call only if stock rises to barrier level\n\n**Why barriers are cheaper than vanilla**: A knock-out call is cheaper than a vanilla call because there is a probability the option gets knocked out (worthless). This makes barriers popular for cost-effective hedging.\n\n**Rebate**: Many barrier options pay a small rebate if the barrier is hit, to partially compensate the buyer.\n\n**Asian options — average price options**:\n- Payoff based on the **average price** of the underlying over a period (daily averaging, for example), rather than the final price\n- **Average price call**: Max(Average(S) K, 0)\n- **Average rate call**: Max(Average(S/K) 1, 0)\n- **Key benefit**: Less sensitive to price manipulation at expiry (no incentive to ramp the stock on the last day)\n- **Used extensively**: Energy companies hedging average commodity prices, FX hedges for monthly cash flows\n- **Cheaper than vanilla**: Averaging smooths out volatility lower effective vol lower option price",
 highlight: [
 "barrier options",
 "knock-out",
 "knock-in",
 "Asian options",
 "average price",
 "path-dependent",
 "rebate",
 ],
 },
 {
 type: "teach",
 title: "Lookback, Digital & Compound Options",
 content:
 "**Lookback options — the most expensive vanilla alternative**:\nLookback options give the holder the best possible payoff — the right to buy at the lowest price observed or sell at the highest price observed over the option's life.\n\n- **Lookback call**: Pays Max(S_final S_min, 0) — buy at the lowest price during the period\n- **Lookback put**: Pays Max(S_max S_final, 0) — sell at the highest price during the period\n- **Most expensive category of options** because you always get the optimal exercise decision in hindsight\n- Used in structured products where the issuer wants to guarantee the best entry/exit for marketing purposes\n- Practically: Expensive and rarely used in vanilla hedging; more common in structured retail products\n\n**Digital (binary) options — all-or-nothing payoffs**:\n- **Cash-or-nothing call**: Pays fixed amount $Q if S_T > K at expiry, zero otherwise\n- **Asset-or-nothing call**: Delivers the asset (worth S_T) if S_T > K, zero otherwise\n- **One-touch**: Pays if the underlying touches a target level at any point before expiry\n- **No-touch**: Pays if the underlying NEVER touches a barrier before expiry\n- **Key challenge**: Delta explodes near the barrier at expiry extreme hedging difficulty; small moves cause large P&L swings for the seller\n- Used in structured products, FX hedging, and by speculators for binary event bets (e.g., will EUR/USD be above 1.10 at month-end?)\n\n**Compound options — option on an option**:\n- A call on a call: The right to buy a call option at a fixed price on a future date\n- Useful when uncertain whether you will need the underlying option (e.g., bidding for a contract — buy a compound option; if you win the bid, exercise the compound to get the hedge option)\n- Requires two strike prices and two expiry dates\n- More complex to price but provides flexibility when the need for the hedge is itself uncertain",
 highlight: [
 "lookback options",
 "digital options",
 "binary options",
 "one-touch",
 "compound options",
 "cash-or-nothing",
 "all-or-nothing",
 ],
 },
 {
 type: "teach",
 title: "Rainbow, Quanto Options & Real Options",
 content:
 "**Rainbow options — multi-asset options**:\nRainbow options have payoffs that depend on multiple underlying assets simultaneously.\n\n- **Best-of call**: Pays Max(Max(S, S, S) K, 0) — the best performing asset among a basket\n- **Worst-of put**: Pays Max(K Min(S, S, S), 0) — if the worst performer falls below strike\n- **Exchange option**: The right to exchange one asset for another — Max(S S, 0)\n- Popular in structured products: e.g., 'Best of Equity, Gold, and Bonds' capital-protected notes\n- Correlation is the key pricing input: Low correlation between assets higher best-of value (more dispersion = better chance one does well)\n\n**Quanto options — currency-protected foreign exposure**:\n- A quanto option pays a foreign-currency-denominated return in domestic currency at a fixed exchange rate\n- Example: A USD investor buys a quanto call on the Nikkei 225 that pays in USD — the USD/JPY exchange rate is fixed at the contract's FX rate\n- Eliminates FX risk while maintaining exposure to the foreign asset price\n- The quanto adjustment modifies the drift of the foreign asset: drift = r_domestic ρ × σ_FX × σ_asset\n- Used by international investors who want pure equity exposure without FX basis\n\n**Real options in corporate finance**:\nReal options apply options theory to **capital investment decisions** — management has flexibility that has optionality value:\n\n- **Option to expand**: If a project is successful, invest more capital to scale up (like a call option)\n- **Option to delay (defer)**: Waiting for uncertainty to resolve before committing capital (like an American call)\n- **Option to abandon**: If a project fails, shut it down and recover salvage value (like a put option)\n- **Option to switch**: Flexibility to switch inputs, outputs, or production processes\n- **Real option value = DCF value + Option premium** — standard DCF undervalues projects with embedded flexibility\n- Mining companies use real options extensively: a mine is a call option on the commodity price",
 highlight: [
 "rainbow options",
 "quanto options",
 "real options",
 "option to expand",
 "option to abandon",
 "best-of",
 "correlation",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A corporate treasurer needs to hedge the company's monthly oil purchases over the next year. The key concern is the average price paid over the year, not the price on any specific date. Which exotic option structure best addresses this need at the lowest cost?",
 options: [
 "An Asian (average price) call option — payoff based on the average of monthly oil prices, exactly matching the hedge need and typically cheaper than vanilla",
 "A lookback call option — ensures the company always purchases at the lowest oil price observed during the year",
 "A barrier knock-in call — cheaper than vanilla, activates only if oil rises above a trigger level",
 "A digital (cash-or-nothing) call — pays a fixed sum if oil ends above the strike, providing budget certainty",
 ],
 correctIndex: 0,
 explanation:
 "An Asian (average price) option perfectly matches the treasurer's exposure: the company's effective oil cost IS an average of monthly prices, so an option on that average provides a direct hedge with no basis risk. Asian options are also cheaper than vanilla equivalents because averaging reduces effective volatility. A lookback option would be ideal in hindsight but is far more expensive (the most expensive option category). A barrier option introduces basis risk (it may knock in only after oil has already spiked). A digital option provides budget certainty only on a binary outcome, not a continuous average exposure.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "BioTech Inc. is evaluating a Phase 2 clinical trial for a new drug. Traditional DCF analysis values the project at $50M (negative NPV — too risky). However, if Phase 2 succeeds (40% probability), the company can invest an additional $200M to launch the drug, which would generate $500M in expected revenues. The drug can also be abandoned after Phase 2 results with no additional cost.",
 question:
 "How should the finance team incorporate real options thinking into the investment analysis, and what does this suggest about the project's true value?",
 options: [
 "Model the Phase 2 investment as an option to expand: the right (not obligation) to invest $200M only if Phase 2 succeeds — the option value of this flexibility may make the total project NPV positive",
 "The negative DCF result is definitive — real options are theoretical constructs that cannot override standard financial analysis",
 "Simply multiply the $500M revenue by 40% probability = $200M, subtract the $200M launch cost = $0 NPV, confirming the project is marginal",
 "The abandonment option has no value since there are no recovery costs after Phase 2 ends",
 ],
 correctIndex: 0,
 explanation:
 "This is a classic real options scenario. The company is NOT obligated to invest the $200M for launch — they only do so if Phase 2 succeeds. This is an **option to expand**: they pay the Phase 2 cost now for the right to invest in a much larger project later. Real option value: 40% × Max($500M $200M, 0) = 40% × $300M = $120M expected value from the launch option, minus Phase 2 cost. This may flip the project to positive NPV. Standard DCF misses this because it either assumes you always invest (overcommits) or never invest (undervalues). The **option to abandon** is also valuable: if Phase 2 fails, you don't spend the $200M. Real options are extensively used in pharma, mining, oil exploration, and any capital-intensive project with staged investment decision gates.",
 difficulty: 3,
 },
 ],
 },
 ],
};
