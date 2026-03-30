import type { Unit } from "./types";

export const UNIT_OPTIONS_BASICS: Unit = {
 id: "options-basics",
 title: "Options Basics for Beginners",
 description:
 "Learn calls, puts, covered calls, and protective puts with real examples",
 icon: "TrendingUp",
 color: "#8B5CF6",
 lessons: [
 /* ================================================================
 LESSON 1 — What Are Options?
 ================================================================ */
 {
 id: "options-basics-1-intro",
 title: "What Are Options?",
 description:
 "Understand option contracts, key terminology, moneyness, and how to read an option chain",
 icon: "BookOpen",
 xpReward: 80,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "Options Are Contracts, Not Stocks",
 content:
 "An **option** is a contract that gives the buyer the **right — but not the obligation** — to buy or sell 100 shares of an underlying stock at a fixed price before a set date.\n\n**Two types:**\n- **Call option** right to *buy* 100 shares at the strike price\n- **Put option** right to *sell* 100 shares at the strike price\n\n**Key terms:**\n- **Strike price (K):** The fixed price at which you can buy or sell\n- **Expiration date:** The date the contract expires; after this, it is worthless\n- **Premium:** The price you pay for the option contract (per share, so multiply by 100 for total cost)\n\n**Real example:**\nYou buy 1 AAPL call with:\n- Strike: $175\n- Expiration: 30 days out\n- Premium: $3.50 per share Total cost: $3.50 × 100 = **$350**\n\nThis gives you the right to buy 100 shares of AAPL at $175 any time before expiration.",
 highlight: [
 "call option",
 "put option",
 "strike price",
 "expiration date",
 "premium",
 ],
 },
 {
 type: "teach",
 title: "American vs European Options",
 content:
 "Not all options work the same way — the exercise style matters.\n\n**American-style options:**\n- Can be exercised at **any time** before and including the expiration date\n- Most equity (stock) options in the US are American-style\n- Example: You bought a call on TSLA expiring in 60 days. If the stock surges in week 2, you can exercise immediately\n\n**European-style options:**\n- Can **only** be exercised **on the expiration date itself**\n- Most index options (SPX, NDX) are European-style\n- Generally cheaper because the exercise flexibility is lower\n\n**Practical note for beginners:**\nMost retail traders never actually *exercise* their options. Instead, they **sell the contract** back into the market to capture the profit — no need to buy/sell the underlying shares.",
 highlight: [
 "American-style",
 "European-style",
 "exercise",
 "expiration",
 ],
 },
 {
 type: "teach",
 title: "In-the-Money, At-the-Money, Out-of-the-Money",
 content:
 '**Moneyness** describes the relationship between the current stock price (S) and the strike price (K).\n\n**For calls (right to buy):**\n| Moneyness | Condition | Example (S = $100) |\n|-----------|-----------|--------------------|\n| In-the-money (ITM) | S > K | K = $95 call ITM |\n| At-the-money (ATM) | S K | K = $100 call ATM |\n| Out-of-the-money (OTM) | S < K | K = $110 call OTM |\n\n**For puts (right to sell):**\n| Moneyness | Condition | Example (S = $100) |\n|-----------|-----------|--------------------|\n| ITM | S < K | K = $110 put ITM |\n| ATM | S K | K = $100 put ATM |\n| OTM | S > K | K = $90 put OTM |\n\n**Intrinsic value:**\n- ITM options have **intrinsic value** = the immediate profit if exercised now\n- ATM and OTM options have **zero intrinsic value** — their premium is entirely **time value** (extrinsic value)\n\nExample: AAPL at $180, call with K = $175 Intrinsic value = $180 $175 = **$5 per share**',
 highlight: [
 "in-the-money",
 "at-the-money",
 "out-of-the-money",
 "intrinsic value",
 "time value",
 ],
 },
 {
 type: "teach",
 title: "Reading an Option Chain",
 content:
 "An **option chain** lists all available contracts for a stock, organized by expiration date and strike price.\n\n**Typical option chain columns:**\n- **Bid / Ask:** What market makers will pay (bid) vs. what they charge (ask); buy at the ask, sell at the bid\n- **Last:** Most recent trade price\n- **Volume:** Number of contracts traded today\n- **Open Interest (OI):** Total open contracts — high OI = more liquidity\n- **IV (Implied Volatility):** Market's expectation of future price movement; high IV = expensive options\n- **Delta:** How much the option price moves per $1 stock move (0–1 for calls, 1–0 for puts)\n\n**How to read it:**\n- Calls are typically on the left side; puts on the right\n- Strikes in the middle, sorted from low (top) to high (bottom) or vice versa\n- ATM strike is highlighted or near the current stock price\n\n**Tip:** Start with strikes close to ATM and expirations 30–45 days out — these tend to have the best balance of premium received and time to be right.",
 highlight: [
 "option chain",
 "bid",
 "ask",
 "open interest",
 "implied volatility",
 "delta",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "NVDA stock is trading at $850. You are looking at an NVDA call option with a strike price of $900 expiring in 30 days. What is the moneyness of this call?",
 options: [
 "In-the-money, because the stock is above $900",
 "At-the-money, because the strike is close to the current price",
 "Out-of-the-money, because the stock price is below the strike",
 "In-the-money, because calls are always in-the-money",
 ],
 correctIndex: 2,
 explanation:
 "A call option is out-of-the-money (OTM) when the current stock price is BELOW the strike price. Here, NVDA trades at $850, which is below the $900 strike. For this call to have intrinsic value, NVDA would need to rise above $900. The entire $premium paid is time value — the bet that NVDA will surpass $900 before expiration.",
 difficulty: 1,
 },
 ],
 },

 /* ================================================================
 LESSON 2 — Calls Deep Dive
 ================================================================ */
 {
 id: "options-basics-2-calls",
 title: "Calls Deep Dive",
 description:
 "Long calls, short calls, covered calls, breakeven math, and real income generation examples",
 icon: "TrendingUp",
 xpReward: 90,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "Long Call: Bullish with Defined Risk",
 content:
 "Buying a call gives you the right to purchase 100 shares at the strike price. This is a **bullish** bet.\n\n**Profit & Loss profile:**\n- **Max loss:** The premium paid — this is ALL you can lose\n- **Max gain:** Theoretically unlimited (stock can rise to any price)\n- **Breakeven at expiration:** Strike price + Premium paid\n\n**Example:**\n- Buy 1 MSFT $400 call, expiring in 30 days, premium = $5.00\n- Total cost: $5 × 100 = **$500**\n- Breakeven: $400 + $5 = **$405**\n- If MSFT expires at $420: Profit = ($420 $400 $5) × 100 = **$1,500**\n- If MSFT expires at $395: Loss = **$500** (the full premium, nothing more)\n\n**Why use a call instead of buying stock?**\n- 1 call controls 100 shares but costs far less than buying 100 shares outright\n- Leverage: $500 controls the same upside as $40,000 worth of stock\n- Defined risk: worst case is losing the $500 premium",
 highlight: [
 "long call",
 "bullish",
 "max loss",
 "unlimited upside",
 "breakeven",
 "leverage",
 ],
 },
 {
 type: "teach",
 title: "Short Call: Capped Gain, Unlimited Risk",
 content:
 "**Selling (writing) a call** means you collect the premium upfront but take on the obligation to sell 100 shares at the strike price if the buyer exercises.\n\n**Profit & Loss profile:**\n- **Max gain:** Premium collected (fixed)\n- **Max loss:** Theoretically unlimited — stock can rise without limit, forcing you to sell cheap\n- **Breakeven:** Strike price + Premium received\n\n**Example:**\n- Sell 1 MSFT $420 call, premium = $3.00\n- Premium collected: $3 × 100 = **$300**\n- If MSFT expires at $415: Keep entire $300 — the call expires worthless\n- If MSFT shoots to $450: Loss = ($450 $420 $3) × 100 = **$2,700**\n\n**Who sells naked calls?**\nSelling uncovered (\"naked\") calls is high-risk and requires significant margin. Most retail brokers restrict it. A safer approach is the **covered call** — selling a call while owning the underlying shares.",
 highlight: [
 "short call",
 "naked call",
 "premium collected",
 "unlimited risk",
 "margin",
 ],
 },
 {
 type: "teach",
 title: "Covered Call: Income on Stocks You Own",
 content:
 "A **covered call** = owning 100 shares + selling 1 call against them. The shares you own \"cover\" the obligation to deliver.\n\n**Why use it?**\n- Generate income from stocks sitting in your portfolio\n- The call premium reduces your effective cost basis\n- Slightly bearish/neutral strategy — you're OK if the stock stays flat or rises a little\n\n**Example:**\n- You own 100 shares of AMD at $160\n- Sell 1 AMD $170 call expiring in 30 days, premium = $4.00\n- Premium received: $4 × 100 = **$400**\n- **Scenarios at expiration:**\n - AMD at $155: Keep $400 premium; shares worth $155. Net cost basis reduced to $160 $4 = $156\n - AMD at $168: Keep $400 premium; shares worth $168. Profit: ($168 $160) × 100 + $400 = **$1,200**\n - AMD at $185: Call exercised. You sell 100 shares at $170. Profit capped: ($170 $160) × 100 + $400 = **$1,400** (missed the extra $15 gain)\n\n**Trade-off:** You give up upside above $170 in exchange for the guaranteed $400 income.",
 highlight: [
 "covered call",
 "income",
 "cost basis",
 "assignment",
 "upside cap",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "You own 100 shares of a stock at $50 per share. You sell 1 covered call with a $55 strike and collect a $2 premium. At expiration, the stock is at $60. What is your total profit per share?",
 options: [
 "$10 — you captured the full $10 move",
 "$7 — strike gain ($5) plus premium ($2)",
 "$8 — premium ($2) plus stock gain up to $60",
 "$2 — only the premium, since the stock went up",
 ],
 correctIndex: 1,
 explanation:
 "With a covered call, your upside is capped at the strike price. You bought at $50 and must sell at $55 (the strike), locking in a $5 gain per share. You also keep the $2 premium collected. Total profit = $5 + $2 = $7 per share. You missed the additional $5 move from $55 to $60, but the covered call still produced a solid 14% return in the period.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The maximum loss when buying a call option is limited to the premium paid, regardless of how far the underlying stock falls.",
 correct: true,
 explanation:
 "This is one of the primary advantages of buying options. No matter how far the stock drops — even to zero — the call buyer can simply let the contract expire worthless. The maximum loss is always the premium paid (total cost = premium × 100 shares per contract). This defined-risk feature makes long calls attractive for speculative bets.",
 difficulty: 1,
 },
 ],
 },

 /* ================================================================
 LESSON 3 — Puts Deep Dive
 ================================================================ */
 {
 id: "options-basics-3-puts",
 title: "Puts Deep Dive",
 description:
 "Long puts, short puts, protective puts, put/call parity, and breakeven calculations",
 icon: "TrendingDown",
 xpReward: 90,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "Long Put: Bearish Bet or Portfolio Insurance",
 content:
 "Buying a put gives you the right to **sell** 100 shares at the strike price. It profits when the stock falls.\n\n**Profit & Loss profile:**\n- **Max loss:** Premium paid\n- **Max gain:** Substantial (stock can fall toward zero; max gain = (Strike 0 Premium) × 100)\n- **Breakeven at expiration:** Strike price Premium paid\n\n**Example — Bearish speculation:**\n- Buy 1 SPY $500 put, premium = $6.00\n- Breakeven: $500 $6 = **$494**\n- If SPY falls to $480: Profit = ($500 $480 $6) × 100 = **$1,400**\n- If SPY stays at $505: Loss = **$600** (full premium)\n\n**Example — Portfolio insurance:**\n- You hold $50,000 of SPY (100 shares at $500)\n- Buy 1 SPY $490 put for $4 = $400 total\n- If SPY crashes to $450, your shares lose $5,000 but the put gains ($490 $450 $4) × 100 = **$3,600**, limiting your net loss to just $1,400 instead of $5,000\n\nThis insurance analogy is key: the put premium is like a car insurance payment — you hope you never need it.",
 highlight: [
 "long put",
 "bearish",
 "portfolio insurance",
 "breakeven",
 "max loss",
 ],
 },
 {
 type: "teach",
 title: "Short Put: Collecting Premium While Bullish",
 content:
 "**Selling a put** means you collect the premium but accept the obligation to **buy** 100 shares at the strike if exercised.\n\n**Profit & Loss profile:**\n- **Max gain:** Premium collected\n- **Max loss:** (Strike 0) × 100 Premium (large, but not unlimited — stock can only fall to zero)\n- **Breakeven:** Strike Premium received\n\n**Cash-secured put:**\nIf you set aside enough cash to buy the shares at the strike price, the position is \"cash-secured.\"This is far safer than naked put selling.\n\n**Example:**\n- Sell 1 GOOGL $170 put, premium = $3.50\n- Cash set aside: $170 × 100 = $17,000\n- Premium collected: $350\n- If GOOGL stays above $170: Keep $350 — put expires worthless\n- If GOOGL falls to $155: Assigned at $170 — now own 100 shares at effective cost of $170 $3.50 = **$166.50/share**\n\n**When to use it:**\nSell a cash-secured put on a stock you *want to own* at a lower price. If assigned, you bought the stock at a discount; if not, you keep the premium.",
 highlight: [
 "short put",
 "cash-secured put",
 "premium collected",
 "assignment",
 "breakeven",
 ],
 },
 {
 type: "teach",
 title: "Protective Put and Put/Call Parity",
 content:
 "**Protective put** = owning shares + buying a put as insurance. It's the opposite of a covered call.\n\n**Cost and tradeoff:**\n- You pay the put premium for downside protection\n- Your upside is unlimited — unlike a covered call\n- Effective floor on your stock position = Strike Premium\n\n**Put/Call Parity:**\nFor European-style options with the same strike and expiration:\n`C P = S PV(K)`\nwhere C = call price, P = put price, S = stock price, PV(K) = present value of the strike.\n\n**Intuition:** A call and a risk-free bond that pays K at expiration equals a put plus the stock. If this relationship breaks down, arbitrageurs will immediately exploit it.\n\n**Practical implication:**\n- If you know the call price, you can calculate the fair put price\n- If call (K=$100, 30 days) = $4 and put = $3 while S = $101 and PV(K) = $99.80:\n - Parity: C P = 101 99.80 = 1.20; actual C P = 4 3 = 1.00 slight deviation, possible arbitrage\n\n**Takeaway for beginners:** Calls and puts are mathematically linked. Learning one helps you understand the other.",
 highlight: [
 "protective put",
 "put/call parity",
 "downside protection",
 "floor",
 "arbitrage",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A stock is trading at $120. You buy a put with a $115 strike price and pay a $4 premium. What is your breakeven price at expiration?",
 options: ["$115", "$119", "$111", "$124"],
 correctIndex: 2,
 explanation:
 "For a long put, the breakeven price = Strike Premium = $115 $4 = $111. At expiration, if the stock is at $111, you can exercise the right to sell at $115, gaining $4 per share ($400 total), which exactly offsets the $4 premium paid. Below $111, the put is profitable; above $115, the put expires worthless and you lose the $400 premium.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "Selling a cash-secured put is a bullish or neutral strategy — the seller profits most when the stock stays flat or rises.",
 correct: true,
 explanation:
 "Correct. A short put seller collects premium upfront and keeps it if the stock stays above the strike price at expiration. The position profits in a bullish or flat market. If the stock falls significantly below the strike, the seller is assigned and must buy shares at an above-market price. Cash-securing the put (holding enough cash to buy the shares) makes this manageable — the effective purchase price is strike minus premium received.",
 difficulty: 2,
 },
 ],
 },

 /* ================================================================
 LESSON 4 — Simple Strategies
 ================================================================ */
 {
 id: "options-basics-4-strategies",
 title: "Simple Strategies",
 description:
 "Covered call walkthrough, protective put example, the Wheel strategy, LEAPS, and common beginner mistakes",
 icon: "BarChart2",
 xpReward: 100,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "Covered Call Walkthrough",
 content:
 "Let's walk through a full covered call trade from entry to exit.\n\n**Setup:**\n- You own 100 shares of INTC at $35\n- INTC has been trading sideways for months\n- You sell 1 INTC $37 call expiring in ~45 days for $1.20 premium\n- Premium collected: $120\n\n**Three possible outcomes at expiration:**\n\n**Scenario A — Stock stays at $35 (sideways):**\n- Call expires worthless. You keep $120.\n- New effective cost basis: $35 $1.20 = $33.80\n- Annualized yield: ($1.20 / $35) × (365/45) **28% annualized**\n\n**Scenario B — Stock rises to $36.50 (slight move up):**\n- Call still expires worthless ($36.50 < $37 strike)\n- You keep $120 + unrealized gain of $1.50/share on stock = **$270 total profit**\n\n**Scenario C — Stock rises to $40 (big move):**\n- Call is exercised (assigned). You sell 100 shares at $37.\n- Profit: ($37 $35) × 100 + $120 = **$320** — but you miss the extra $300 from the $37 $40 move\n- This capped gain is the trade-off for the premium income\n\n**Best use case:** Covered calls work best on stocks you're willing to sell at the strike price.",
 highlight: [
 "covered call",
 "assignment",
 "sideways market",
 "annualized yield",
 "cost basis reduction",
 ],
 },
 {
 type: "teach",
 title: "Protective Put Example & The Wheel Strategy",
 content:
 "**Protective Put Example:**\n- You bought 100 shares of AMZN at $190\n- Concerned about an upcoming earnings report\n- Buy 1 AMZN $185 put for $3 total insurance cost: $300\n- If AMZN drops to $165: Put profit = ($185 $165 $3) × 100 = $1,700; Stock loss = $2,500; **Net loss = $800** instead of $2,500\n- If AMZN jumps to $210: Let the put expire, lose $300 premium but gain $2,000 on shares = **+$1,700 net**\n\n**The Wheel Strategy (beginner-friendly income loop):**\n\n**Step 1:** Sell a cash-secured put on a stock you want to own at a lower price Collect premium\n\n**Step 2 (if assigned):** You now own the shares at the strike. Immediately sell a covered call at or above your purchase price Collect more premium\n\n**Step 3:** If the covered call is exercised, shares are sold. Return to Step 1.\n\n**Example with XYZ at $50:**\n- Sell $48 put for $1.50 Assigned at $48 Effective cost $46.50\n- Sell $50 covered call for $1.20 Assigned at $50 Net gain: ($50 $46.50) = **$3.50/share** in a month or two\n- Repeat the cycle\n\nThe wheel generates income in flat or mild bull/bear markets. It struggles in strong downtrends.",
 highlight: [
 "protective put",
 "wheel strategy",
 "cash-secured put",
 "covered call",
 "income loop",
 ],
 },
 {
 type: "teach",
 title: "Poor Man's Covered Call (LEAPS) and Common Mistakes",
 content:
 "**Poor Man's Covered Call (PMCC):**\nA PMCC replaces the stock with a deep ITM long-dated call (LEAPS) to reduce capital requirements.\n\n**Setup:**\n- Buy 1 LEAPS call (1–2 year expiry) deep ITM Delta 0.80; acts like owning the stock\n- Sell 1 short-term OTM call against it Collect premium each month\n- Capital required: $2,000–5,000 instead of $15,000+ for 100 shares\n\n**Trade-off:** The LEAPS decays slowly (low theta), but the short call you sell decays fast — this difference is your profit.\n\n**5 Common Beginner Mistakes:**\n\n1. **Ignoring theta decay:** OTM options lose value every day, even if the stock moves in your favor. Don't hold OTM options to expiration hoping for a miracle.\n\n2. **Over-leveraging:** Buying 10 cheap OTM calls instead of 1 ITM call multiplies risk. One bad week wipes you out.\n\n3. **Forgetting earnings/events:** IV spikes before earnings, then **IV crush** happens after — you can be right on direction and still lose.\n\n4. **Not having an exit plan:** Set a profit target (e.g., close at 50% of max gain) and a stop-loss before entering.\n\n5. **Misunderstanding assignment:** If you sell a covered call or cash-secured put, you may be assigned. Always have the shares or cash to cover the obligation.",
 highlight: [
 "LEAPS",
 "poor man's covered call",
 "theta decay",
 "IV crush",
 "assignment",
 "exit plan",
 ],
 },
 {
 type: "quiz-scenario",
 scenario:
 "Sarah owns 100 shares of TSLA at $220. She sells a $230 covered call for $5 premium (total: $500). On expiration day, TSLA closes at $245.",
 question:
 "What happens to Sarah's position, and what is her total profit per share?",
 options: [
 "The call expires worthless; profit = $5 premium only",
 "Sarah is assigned and sells at $230; total profit = $10 stock gain + $5 premium = $15/share",
 "Sarah keeps her shares and the $5 premium since she never exercised the call",
 "Sarah must buy back the call at $245, suffering a large loss",
 ],
 correctIndex: 1,
 explanation:
 "Since TSLA closed above the $230 strike, Sarah's covered call will be exercised (she is assigned). She sells 100 shares at $230. Her stock gain = $230 $220 = $10 per share, plus the $5 premium collected = $15 total profit per share ($1,500 total). She misses the extra $15 gain from $230 to $245 — that's the cost of the income strategy. But $15/share on a $220 investment is a strong ~6.8% return for the period.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "In the Wheel strategy, after being assigned on a short put, the next step is to sell a covered call on the shares received — creating an ongoing cycle of premium income.",
 correct: true,
 explanation:
 "Exactly right. The Wheel strategy is a systematic income cycle: (1) Sell a cash-secured put (2) If assigned, own the shares (3) Sell a covered call (4) If assigned, shares are sold repeat from step 1. Each step collects premium. The strategy works best on stocks with moderately high implied volatility that you are comfortable holding long-term, since assignment at any step means you'll own the shares.",
 difficulty: 1,
 },
 ],
 },
 ],
};
