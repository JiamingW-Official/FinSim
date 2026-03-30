import type { Unit } from "./types";

export const UNIT_FINANCIAL_DERIVATIVES: Unit = {
 id: "financial-derivatives",
 title: "Financial Derivatives",
 description:
 "Master forwards, futures, options, and swaps for hedging and speculation",
 icon: "TrendingUp",
 color: "#F59E0B",
 lessons: [
 // Lesson 1: Forwards & Futures 
 {
 id: "fin-deriv-1",
 title: "Forwards & Futures",
 description:
 "No-arbitrage pricing, basis, convergence, and the mechanics of margin calls",
 icon: "TrendingUp",
 xpReward: 90,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "No-Arbitrage Pricing of Forwards",
 content:
 "A **forward contract** is a private agreement to buy or sell an asset at a specified price (**forward price**) on a future date. No money changes hands upfront — the contract value is zero at inception.\n\n**Cost-of-carry model:**\nFor a non-dividend-paying stock with spot price S, risk-free rate r, and time to maturity T:\n\n**F = S × e^(rT)**\n\nIn discrete compounding: F = S × (1 + r)^T\n\n**Why does this hold?**\nIf F > S × e^(rT), an arbitrageur borrows money, buys the stock today, and sells the forward — locking in a riskless profit. Competition drives F back to equilibrium.\n\nFor assets with a convenience yield (y) or storage cost (u):\nF = S × e^((r + u – y)T)\n\n**Dividend-paying stocks:**\nF = (S – PV(dividends)) × e^(rT)\nThe forward price is lower than the non-dividend formula because dividends belong to the current owner, not the forward buyer.\n\n**Key insight:** The forward price is not a forecast of the future spot price — it is a mathematically enforced no-arbitrage relationship.",
 highlight: [
 "forward contract",
 "forward price",
 "cost-of-carry",
 "no-arbitrage",
 "convenience yield",
 ],
 },
 {
 type: "teach",
 title: "Futures, Basis, Convergence & Margin Calls",
 content:
 "**Futures vs. Forwards:**\nFutures are standardized, exchange-traded forwards. Key differences:\n- Futures are **marked to market daily** — gains/losses settle each day\n- An initial margin deposit is required; a maintenance margin must be maintained\n- Exchange clearinghouse eliminates counterparty credit risk\n\n**Basis:**\nBasis = Spot price – Futures price\n\nIn normal (contango) markets, futures trade above spot (basis < 0). In backwardation, futures trade below spot (basis > 0 for commodity holders who value immediate delivery).\n\n**Convergence:**\nAt expiry, the futures price must equal the spot price (basis 0). Any gap would allow immediate arbitrage at delivery.\n\n**Margin Calls:**\nIf daily losses erode the margin account below the maintenance margin level, the broker issues a **margin call** — the holder must deposit additional funds to restore the initial margin.\n\nExample: S&P 500 futures, initial margin = $12,500 per contract, maintenance = $10,000.\nIf a $5,000 loss occurs in one day, account = $7,500 < $10,000 margin call to deposit $5,000 (restore to $12,500).\n\n**Mark-to-market risk:** Investors with correct long-term views can be forced to close positions due to short-term margin calls — a key risk in leveraged futures trading.",
 highlight: [
 "futures",
 "marked to market",
 "initial margin",
 "maintenance margin",
 "margin call",
 "basis",
 "convergence",
 "backwardation",
 "contango",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A stock trades at $100. The annual risk-free rate is 5% and the stock pays no dividends. What is the 1-year forward price under the no-arbitrage cost-of-carry model?",
 options: [
 "$105.00 — forward price equals spot compounded at the risk-free rate",
 "$100.00 — forward price equals spot because no dividends are paid",
 "$95.24 — forward price is discounted by the risk-free rate",
 "$110.00 — forward price includes an equity risk premium above the risk-free rate",
 ],
 correctIndex: 0,
 explanation:
 "F = S × (1 + r)^T = $100 × 1.05 = $105. The forward price equals the spot price compounded at the risk-free rate. Any other price creates an arbitrage opportunity. For example, if F < $105, buy the forward and short the stock today to lock in a riskless gain.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "At the expiry of a futures contract, the futures price must converge to the current spot price of the underlying asset.",
 correct: true,
 explanation:
 "True. At delivery, a futures contract requires the same asset that is available in the spot market. If the futures price differed from spot at expiry, arbitrageurs would simultaneously trade futures and the underlying to capture a riskless profit, forcing prices back into equality. This convergence is a fundamental property of futures markets.",
 difficulty: 1,
 },
 {
 type: "quiz-mc",
 question:
 "An investor holds a long futures position. After a sharp adverse move, the margin account falls below the maintenance margin level. What must the investor do?",
 options: [
 "Deposit additional funds to restore the account to the initial margin level",
 "Pay interest on the shortfall until the position turns profitable",
 "Close the position immediately at the current market price",
 "Nothing — the clearinghouse absorbs losses below the maintenance margin",
 ],
 correctIndex: 0,
 explanation:
 "When losses reduce the margin account below the maintenance margin, the broker issues a margin call requiring the investor to deposit enough cash to bring the account back to the initial margin level — not just the maintenance level. Failure to meet a margin call results in the broker forcibly closing the position.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Options Fundamentals 
 {
 id: "fin-deriv-2",
 title: "Options Fundamentals",
 description:
 "Calls, puts, intrinsic and time value, moneyness, and put-call parity",
 icon: "BarChart2",
 xpReward: 95,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Calls, Puts, and the Right to Choose",
 content:
 "An **option** gives the buyer the *right but not the obligation* to buy (call) or sell (put) an underlying asset at a predetermined **strike price (K)** on or before an **expiration date**.\n\n**Call option:**\n- Buyer profits when S > K at expiry: payoff = max(S – K, 0)\n- Maximum loss for buyer = premium paid\n- Maximum gain = theoretically unlimited\n\n**Put option:**\n- Buyer profits when S < K at expiry: payoff = max(K – S, 0)\n- Maximum loss for buyer = premium paid\n- Maximum gain = K (if stock falls to zero)\n\n**American vs. European:**\n- American options can be exercised at any time before expiry\n- European options can only be exercised at expiry\n- American options are worth at least as much as European options (early exercise privilege has value)\n\n**Option premium components:**\nPremium = Intrinsic Value + Time Value\n- **Intrinsic value:** the payoff if exercised immediately — max(S–K, 0) for calls\n- **Time value:** the remaining optionality — always positive before expiry, decays to zero at expiry (theta decay)",
 highlight: [
 "call option",
 "put option",
 "strike price",
 "premium",
 "intrinsic value",
 "time value",
 "theta decay",
 "American",
 "European",
 ],
 },
 {
 type: "teach",
 title: "Moneyness and Put-Call Parity",
 content:
 "**Moneyness** describes where the strike price stands relative to the current spot price:\n\n| Moneyness | Call | Put |\n|-----------|------|-----|\n| In-the-money (ITM) | S > K | S < K |\n| At-the-money (ATM) | S K | S K |\n| Out-of-the-money (OTM) | S < K | S > K |\n\nITM options have intrinsic value; OTM options consist entirely of time value. Deep OTM options are cheap but require large moves to become profitable.\n\n**Put-Call Parity (European options, no dividends):**\n\n**C – P = S – K × e^(–rT)**\n\nOr equivalently: C + K × e^(–rT) = P + S\n\nThis relationship must hold or arbitrage is possible. It links call and put prices to the spot price, strike, and risk-free rate.\n\n**Practical implication:** If you know the call price, you can derive the fair put price (and vice versa) for the same strike and expiry. Violations are instantly arbed away in liquid markets.\n\n**Synthetic positions via put-call parity:**\n- Synthetic long stock = long call + short put (same strike/expiry)\n- Synthetic long call = long put + long stock\n- Covered call = long stock – long call (sells the upside)\n\nThese synthetic relationships underpin options market-making and institutional hedging strategies.",
 highlight: [
 "moneyness",
 "in-the-money",
 "at-the-money",
 "out-of-the-money",
 "put-call parity",
 "synthetic",
 "intrinsic value",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A call option has a strike of $50, the stock trades at $55, and the option premium is $6.50. What is the time value of this option?",
 options: [
 "$1.50 — time value equals premium minus intrinsic value ($6.50 – $5.00)",
 "$6.50 — since the option can still expire worthless, all premium is time value",
 "$5.00 — time value equals the intrinsic value (S – K)",
 "$0 — the option is in-the-money, so there is no time value remaining",
 ],
 correctIndex: 0,
 explanation:
 "Intrinsic value = max(S – K, 0) = max(55 – 50, 0) = $5.00. Time value = Premium – Intrinsic value = $6.50 – $5.00 = $1.50. Time value represents the remaining optionality before expiry — it is always positive for options that have not yet expired, regardless of moneyness.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "Put-call parity implies that for European options with the same strike and expiry, a higher call price must be accompanied by a higher put price (all else equal).",
 correct: true,
 explanation:
 "True. Put-call parity states C – P = S – K × e^(–rT). If C increases while S, K, r, and T remain fixed, P must also increase by the same amount to maintain the equality. Any deviation would allow an arbitrage trade (e.g., buy the cheap side and sell the expensive side for a riskless profit).",
 difficulty: 2,
 },
 {
 type: "quiz-mc",
 question:
 "An investor buys an at-the-money put option on a stock trading at $80, paying a $4 premium. What is the investor's maximum profit and maximum loss?",
 options: [
 "Max profit = $76 (stock falls to zero); Max loss = $4 (premium paid)",
 "Max profit = unlimited; Max loss = $4 (put buyer has limited downside)",
 "Max profit = $80; Max loss = $80 (full stock price)",
 "Max profit = $4; Max loss = $80 (symmetrical to the put seller)",
 ],
 correctIndex: 0,
 explanation:
 "A put buyer profits when the stock falls below the strike. Maximum profit is realized if the stock falls to zero: payoff = K – 0 = $80, minus the $4 premium = $76 net profit. Maximum loss is capped at the premium paid ($4) if the stock stays at or above the $80 strike at expiry, since the put expires worthless.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Swaps & Exotics 
 {
 id: "fin-deriv-3",
 title: "Swaps & Exotic Derivatives",
 description:
 "Interest rate swaps, currency swaps, credit default swaps, and barrier options",
 icon: "Repeat",
 xpReward: 100,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Interest Rate Swaps and Currency Swaps",
 content:
 "**Interest Rate Swap (IRS):**\nTwo parties exchange interest payments on a notional principal that is never itself exchanged. One pays a **fixed rate**; the other pays a **floating rate** (typically SOFR).\n\nExample: A company with floating-rate debt at SOFR + 1% fears rising rates. It enters a swap to pay 4% fixed and receive SOFR. Net borrowing cost = 4% + 1% spread = 5% fixed — rate exposure eliminated.\n\n**Valuation:** An IRS equals a portfolio of forward rate agreements. At initiation it has zero value; as rates move, one party holds an asset and the other holds a liability.\n\n**Currency Swap:**\nIn a currency swap, **both notional principal and interest payments** are exchanged in different currencies.\n\nStructure:\n1. At inception: parties exchange principal (e.g., $100M for 90M at current FX rate)\n2. During the swap: party A pays EUR fixed interest; party B pays USD fixed (or floating) interest\n3. At maturity: principal is re-exchanged at the original rate — eliminating FX settlement risk\n\n**Use case:** A US company issuing EUR bonds can use a currency swap to convert EUR bond proceeds and obligations into USD cash flows, eliminating currency exposure.\n\n**Comparative advantage:** Currency swaps exploit differing credit spreads across markets — a US firm may borrow cheaply in USD and a German firm cheaply in EUR, then swap to each get their preferred currency exposure at below-market cost.",
 highlight: [
 "interest rate swap",
 "currency swap",
 "fixed rate",
 "floating rate",
 "SOFR",
 "notional principal",
 "comparative advantage",
 ],
 },
 {
 type: "teach",
 title: "Credit Default Swaps and Barrier Options",
 content:
 "**Credit Default Swap (CDS):**\nA CDS is insurance against a bond issuer defaulting. The protection buyer pays a periodic premium (CDS spread in basis points); the protection seller pays face value minus recovery if a credit event occurs.\n\nCDS Spread as default probability:\nP(default) Spread / (1 – Recovery Rate)\nExample: 250bp spread, 40% recovery P(default/year) 2.5% / 0.6 **4.2%/year**\n\n**Naked CDS:** Buying protection without holding the underlying bond — equivalent to a short position on the issuer's credit quality. Provides price discovery and liquidity but also enables purely speculative bets on defaults.\n\n**Barrier Options:**\nA **barrier option** is activated or deactivated when the underlying touches a predetermined barrier level — making it **path-dependent**.\n\n- **Knock-in:** starts inactive; becomes a vanilla option *only if* the barrier is hit\n - Down-and-in call: activated if price falls to barrier\n- **Knock-out:** starts as a vanilla option; is *cancelled* if the barrier is hit\n - Down-and-out call: cancelled if price drops to barrier\n\n**Why barriers are cheaper than vanillas:**\nKnock-out options have a conditional payoff — there is always a probability the option vanishes before expiry. This lower expected payoff translates to a lower premium, often 20–40% cheaper than the equivalent vanilla.\n\n**Use cases:** FX hedging, structured products, yield enhancement.",
 highlight: [
 "CDS",
 "credit default swap",
 "protection buyer",
 "CDS spread",
 "recovery rate",
 "knock-in",
 "knock-out",
 "barrier option",
 "path-dependent",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Company A has floating-rate debt at SOFR + 2% and wants fixed-rate exposure. It enters an interest rate swap, paying 4.5% fixed and receiving SOFR. What is the company's all-in cost of borrowing after the swap?",
 options: [
 "6.5% fixed — the 4.5% swap fixed rate plus the 2% credit spread on its floating debt",
 "4.5% fixed — the swap fixed rate replaces the floating debt entirely",
 "SOFR + 2% — the swap does not change the underlying debt",
 "2% fixed — only the credit spread remains after netting the SOFR legs",
 ],
 correctIndex: 0,
 explanation:
 "The company still pays SOFR + 2% on its bonds. The swap adds: pay 4.5% fixed, receive SOFR. The SOFR received from the swap offsets the SOFR paid on the bond, leaving a net fixed payment of 4.5% + 2% spread = 6.5% fixed. The swap converts floating to fixed but does not eliminate the credit spread on the underlying debt.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A down-and-out call option is always more expensive than a standard vanilla call option with the same strike and expiry, because the barrier feature provides additional protection to the buyer.",
 correct: false,
 explanation:
 "False. A down-and-out call is *cheaper* than a vanilla call, not more expensive. The barrier feature hurts the buyer — if the stock drops to the barrier before expiry, the option is cancelled and becomes worthless, even if the stock subsequently recovers above the strike. This risk of early termination reduces the option's expected value and therefore its premium.",
 difficulty: 2,
 },
 {
 type: "quiz-mc",
 question:
 "A CDS on Company X trades at a spread of 300 basis points with an assumed 40% recovery rate. What is the approximate implied annual probability of default?",
 options: [
 "5.0% — derived from spread / (1 – recovery rate) = 3% / 0.6",
 "3.0% — the spread itself equals the annual default probability",
 "7.5% — spread plus the recovery rate divided by 2",
 "1.8% — the spread multiplied by the recovery rate (3% × 0.6)",
 ],
 correctIndex: 0,
 explanation:
 "Using the simplified formula P(default) Spread / (1 – Recovery Rate) = 300bp / (1 – 0.40) = 0.03 / 0.60 = 5% per year. A 300bp CDS spread implies the market prices approximately a 5% annual default probability. The spread alone (3%) underestimates this because it ignores that the seller only pays the loss given default, not the full face value.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Derivatives in Practice 
 {
 id: "fin-deriv-4",
 title: "Derivatives in Practice",
 description:
 "Hedging a stock portfolio, airline fuel hedging, and carry trades with forwards",
 icon: "Shield",
 xpReward: 100,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Hedging a Stock Portfolio with Index Futures",
 content:
 "**Portfolio hedge ratio:**\nTo hedge a portfolio using index futures, determine how many contracts are needed:\n\n**N* = (Portfolio Value / Futures Contract Value) × Beta**\n\nExample:\n- Portfolio value = $10,000,000, beta = 1.2\n- S&P 500 futures price = 5,000, contract multiplier = $50 contract value = $250,000\n- N* = ($10M / $250K) × 1.2 = 40 × 1.2 = **48 contracts short**\n\nSelling 48 futures contracts neutralizes market (beta) risk — the portfolio becomes market-neutral. The remaining return should reflect alpha only.\n\n**Cost of hedging:** The futures-based hedge captures the cost of carry — in a normally sloped market, selling futures locks in today's forward price (slightly above spot). If the market rallies, the hedge creates losses on the short futures position that offset portfolio gains.\n\n**Partial hedges:** Selling fewer contracts reduces beta but does not eliminate it. A partial hedge is useful when an investor wants to reduce — not eliminate — market exposure.\n\n**Limitations:**\n- Basis risk: portfolio may not track the index perfectly\n- Hedge must be dynamically rebalanced as beta and portfolio value change\n- Short futures positions require margin maintenance",
 highlight: [
 "hedge ratio",
 "beta",
 "index futures",
 "market-neutral",
 "basis risk",
 "partial hedge",
 ],
 },
 {
 type: "teach",
 title: "Airline Fuel Hedging and FX Carry Trades",
 content:
 "**Airline Fuel Hedging:**\nJet fuel represents 20–30% of an airline's operating costs. Airlines use futures and options to lock in fuel costs:\n\n- **Long crude oil or heating oil futures:** locks in purchase price for future delivery — eliminates upside price risk but also upside benefit if prices fall\n- **Call options on crude:** cap the maximum price paid while retaining benefit if prices fall — more expensive but asymmetric protection\n- **Zero-cost collar:** buy a call (cap upside cost) and sell a put (give up some downside benefit) for zero net premium\n\nDelta Air Lines famously bought an oil refinery (Trainer) in 2012 to vertically integrate and reduce fuel cost volatility.\n\n**Carry Trade with Forwards:**\nThe **carry trade** exploits interest rate differentials across currencies using FX forwards:\n\n1. Borrow in a low-interest-rate currency (e.g., JPY at 0.1%)\n2. Convert to a high-interest-rate currency (e.g., AUD at 4.5%)\n3. Invest at the higher rate; lock in the forward rate to manage FX risk\n\nInterest rate parity says the forward rate should fully offset the rate differential (covered interest rate parity). In practice, violations are quickly arbed away.\n\n**Uncovered carry trade risk:** If the high-yield currency depreciates more than the rate differential, the trade loses money. Carry trades can unwind violently — as in 2008 when JPY carry trades collapsed — causing sharp currency moves.",
 highlight: [
 "fuel hedging",
 "collar",
 "carry trade",
 "interest rate parity",
 "covered interest parity",
 "FX forward",
 "cross-currency",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A fund manager holds a $50M equity portfolio with a beta of 0.8. S&P 500 futures contracts have a notional value of $250,000 each. How many contracts must be sold short to fully hedge the market risk?",
 options: [
 "160 contracts — ($50M / $250K) × 0.8 = 200 × 0.8",
 "200 contracts — ($50M / $250K) without adjusting for beta",
 "250 contracts — ($50M / $250K) × 1.25 to over-hedge",
 "100 contracts — only half the portfolio needs hedging because beta < 1",
 ],
 correctIndex: 0,
 explanation:
 "N* = (Portfolio Value / Contract Value) × Beta = ($50M / $250K) × 0.8 = 200 × 0.8 = 160 contracts. Beta measures the portfolio's sensitivity relative to the index — a beta of 0.8 means the portfolio moves 80% as much as the index. Selling 160 contracts removes the systemic market exposure while leaving any idiosyncratic (alpha) returns intact.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "An airline that buys crude oil futures to hedge fuel costs gives up the benefit of falling oil prices but eliminates the risk of rising prices.",
 correct: true,
 explanation:
 "True. Buying futures locks in a purchase price for future delivery. If oil prices rise, the long futures position gains, offsetting higher fuel costs — risk eliminated. If oil prices fall, the futures position loses, cancelling out the savings on actual fuel purchases. This is the classic two-sided hedge: certainty on both the upside and downside, at the cost of giving up potential windfalls from favorable price moves.",
 difficulty: 1,
 },
 {
 type: "quiz-mc",
 question:
 "An airline wants to cap the maximum price it pays for jet fuel over the next year while still benefiting if prices fall sharply. The airline also wants to reduce the upfront premium cost to near zero. Which derivative structure best meets all three requirements?",
 options: [
 "A zero-cost collar — buy a call option to cap the maximum price, and sell a put option to fund the call premium",
 "Buy call options outright — caps the maximum price and retains full downside benefit",
 "Buy futures contracts — locks in a fixed purchase price with no premium required",
 "Sell put options — generates premium income to offset rising fuel costs",
 ],
 correctIndex: 0,
 explanation:
 "A zero-cost collar meets all three criteria: (1) the long call caps the maximum fuel price, (2) the short put retains the benefit if prices fall moderately (below the put strike, the airline gives up further savings, but retains benefit between current price and put strike), and (3) the premium from selling the put offsets the call premium, resulting in zero upfront cost. Buying futures has no premium cost but eliminates all downside benefit — failing requirement (2).",
 difficulty: 3,
 },
 ],
 },
 ],
};
