import type { Unit } from "./types";

export const UNIT_OPTIONS_STRATEGIES_PRACTICE: Unit = {
 id: "options-strategies-practice",
 title: "Options Strategies in Practice",
 description:
 "Covered calls, cash-secured puts, iron condors, earnings plays, and portfolio hedging",
 icon: "Layers",
 color: "#8b5cf6",
 lessons: [
 // Lesson 1: Covered Call in Practice 
 {
 id: "osp-covered-call",
 title: "Covered Call in Practice",
 description:
 "Strike selection, premium targets, rolling mechanics, and real P&L math",
 icon: "TrendingUp",
 xpReward: 70,
 steps: [
 {
 type: "teach",
 title: "What a Covered Call Actually Does",
 content:
 "A **covered call** = owning 100 shares of stock + selling 1 call option against those shares.\n\nYou collect the option **premium** upfront. In exchange, you cap your upside at the strike price until expiration.\n\n**Real example**:\n- You own 100 shares of AAPL at $185/share ($18,500 position)\n- You sell the $190 call expiring in 30 days for $2.50/share collect **$250 premium**\n- If AAPL stays below $190: option expires worthless, you keep $250. Do it again next month.\n- If AAPL rises above $190: your shares are called away at $190. You gain ($190 $185) × 100 + $250 premium = **$750 total profit**. You miss any gains above $190.\n- If AAPL drops: premium cushions the loss by $250, but you still face the full downside of the stock.\n\nCovered calls generate **steady income on stagnant or slowly rising stocks**.",
 highlight: [
 "covered call",
 "premium",
 "call away",
 "cap upside",
 "income",
 ],
 },
 {
 type: "teach",
 title: "Strike Selection: The 0.20–0.30 Delta Sweet Spot",
 content:
 "Choosing the right strike is the core skill of covered call writing.\n\n**Delta as a probability proxy**: A call with 0.30 delta has roughly a 30% chance of expiring in-the-money (being exercised).\n\n**Practical framework**:\n- **Deep OTM (0.10 delta, far above current price)**: Tiny premium, almost never exercised, but you cap gains even on big moves. Low income.\n- **ATM (0.50 delta, right at current price)**: Maximum premium, 50% chance of exercise — often too aggressive.\n- **0.20–0.30 delta (moderate OTM)**: The practical sweet spot. Meaningful premium, ~70–80% probability option expires worthless. Balances income vs. capping gains.\n\nOn AAPL at $185, the 0.25-delta call might be the $192.50 strike at $1.80 annualized yield of ~11.7% (1.80 / 185 × 12 months). That's consistent income.",
 highlight: ["delta", "OTM", "ATM", "0.25 delta", "probability"],
 },
 {
 type: "teach",
 title: "Rolling the Covered Call",
 content:
 "**Rolling** means closing an existing covered call and opening a new one simultaneously, usually to extend duration or adjust the strike.\n\n**Rolling forward (out in time)**:\n- Your $190 call expires next week and AAPL is at $188 — option has $0.30 left in premium\n- Buy back the old $190 call (buy to close) + sell a new $190 call 30 days out for $1.80\n- Net credit: $1.80 $0.30 = **$1.50 collected** for another month\n\n**Rolling up and out** (when stock rallied near your strike):\n- AAPL at $189, your $190 call has $1.20 of intrinsic + extrinsic value\n- Close the $190 call (costs more than collected), open the $195 call 45 days out for $2.00\n- Gives stock more room to run while collecting net credit\n\n**Golden rule**: Only roll for a **net credit**. Never pay to roll — that means locking in a loss.",
 highlight: ["rolling", "buy to close", "net credit", "roll forward"],
 },
 {
 type: "quiz-mc",
 question:
 "You own 100 shares of XYZ at $100. You sell a $105 covered call for $1.50. At expiration, XYZ is at $108. What is your total profit/loss?",
 options: [
 "+$650 — shares called away at $105 ($500 gain) plus $150 premium",
 "+$950 — you gain the full move from $100 to $108 plus $150 premium",
 "+$150 — you only keep the premium, shares are called away at your cost basis",
 "-$150 — you lose the premium because the option was exercised",
 ],
 correctIndex: 0,
 explanation:
 "Shares are called away at $105 (not $108). Profit on shares: ($105 $100) × 100 = $500. Plus $150 premium collected = $650 total. You missed the $100–$108 move above $105 ($300 of 'lost' gains), but that was the trade-off for collecting premium upfront.",
 },
 {
 type: "quiz-tf",
 statement:
 "A covered call completely eliminates the downside risk of owning 100 shares of stock.",
 correct: false,
 explanation:
 "The premium collected provides a small cushion — $150 premium on a $10,000 position is only 1.5% protection. If the stock falls 20%, you lose ~$1,850 (after premium credit). The covered call reduces downside slightly but does NOT eliminate it. You still have full directional risk on the shares.",
 },
 {
 type: "quiz-scenario",
 scenario:
 "You own 100 shares of MSFT at $420. You sold the $430 call (30 DTE) for $3.00. With 7 days left, MSFT is at $428 and the call is worth $2.80. Earnings report in 3 days.",
 question: "What is the most prudent action?",
 options: [
 "Buy to close the $430 call now for $2.80 — avoid assignment risk through earnings",
 "Let it expire — you're still $2 out of the money with only 7 days left",
 "Roll up to the $440 call to give more room, even if it costs a debit",
 "Do nothing; covered calls should always be held to expiration",
 ],
 correctIndex: 0,
 explanation:
 "With earnings 3 days away and only $2 of remaining cushion (MSFT at $428 vs $430 strike), the option could rapidly move ITM on an earnings gap. Closing for $2.80 costs only $0.20 more than collected ($3.00 $2.80) — a tiny price to avoid being called away and missing a potential post-earnings spike. Never hold through earnings with only a 0.5% buffer.",
 },
 {
 type: "teach",
 title: "Annualized Yield and Monthly Income Targets",
 content:
 "Experienced covered-call writers think in **annualized yield** to compare opportunities:\n\n`Annualized yield = (Premium / Stock Price) × (365 / DTE)`\n\n**Example**: Sell a 30-DTE call for $2.00 on a $100 stock:\n`2.00 / 100 × (365 / 30) = 24.3% annualized yield`\n\n**Realistic targets**:\n- Stable large-caps (MSFT, AAPL): 8–15% annualized from covered calls\n- High-IV names (TSLA, NVDA): 25–50% possible, but higher assignment/whipsaw risk\n\n**The compounding math**: $50,000 in covered calls generating 12%/year = **$6,000/year** of income, equivalent to $500/month — before any stock appreciation. Over 10 years at 12%, the premium income alone (reinvested) grows to ~$95,000 additional wealth.",
 highlight: [
 "annualized yield",
 "DTE",
 "income target",
 "compounding",
 ],
 },
 ],
 },

 // Lesson 2: Cash-Secured Put Mastery 
 {
 id: "osp-cash-secured-put",
 title: "Cash-Secured Put Mastery",
 description:
 "Put-selling for income, assignment strategy, and the wheel strategy",
 icon: "ArrowDownLeft",
 xpReward: 70,
 steps: [
 {
 type: "teach",
 title: "Cash-Secured Put: Get Paid to Agree to Buy",
 content:
 "A **cash-secured put** = selling a put option on a stock you would actually want to own at a lower price, with enough cash in your account to buy the shares if assigned.\n\n**Real example**:\n- NVDA trades at $130. You'd love to own it at $120.\n- Sell the $120 put (30 DTE) for $2.50/share collect **$250 premium**\n- **If NVDA stays above $120**: Option expires worthless. You keep $250, repeat next month.\n- **If NVDA falls below $120**: You are assigned 100 shares at $120 (your 'purchase price'). But your effective cost basis is $120 $2.50 = **$117.50**.\n\n**Two winning outcomes**: Either collect premium on a stock that didn't fall enough, or get assigned at a better price than today's market price. Worst case: you own shares of a stock you already wanted to buy.",
 highlight: [
 "cash-secured put",
 "assigned",
 "effective cost basis",
 "income",
 ],
 },
 {
 type: "teach",
 title: "Strike and Expiry Selection",
 content:
 "**Strike selection** for cash-secured puts follows the same delta logic as covered calls:\n\n- **0.20–0.30 delta put**: ~70–80% probability of expiring worthless. Good balance of premium vs. assignment risk.\n- **ATM put (0.50 delta)**: Maximum premium, 50% assignment risk — use only if you're very comfortable owning shares at today's price.\n- **Deep OTM put (0.10 delta)**: Tiny premium, rare assignment — only worthwhile on high-IV stocks.\n\n**Expiry selection**:\n- **30–45 DTE**: The sweet spot — captures fast theta decay in the last 30 days while not being too short for meaningful premium\n- **Theta decay accelerates** as expiry approaches: an option loses more time value in its final 30 days than in the preceding 60\n\nOn NVDA at $130, selling the 30-DTE $120 put (0.20 delta, $2.50 premium) means you're paid $250 to potentially buy stock at $117.50 effective cost.",
 highlight: ["delta", "30–45 DTE", "theta decay", "assignment risk"],
 },
 {
 type: "teach",
 title: "The Wheel Strategy",
 content:
 "The **wheel** chains covered calls and cash-secured puts into a continuous income loop:\n\n**Phase 1 — Cash-Secured Put**: Sell puts until assigned.\n\n**Phase 2 — Covered Call**: Once assigned shares, sell covered calls until called away.\n\n**Phase 3 — Back to Puts**: Shares are called away; sell puts again to re-enter.\n\n**Concrete cycle on AAPL ($185)**:\n1. Sell $180 put for $2.00 assigned at $180 (basis $178)\n2. Sell $185 covered call for $2.50 shares called at $185 (profit: $7 + premiums = $9.50 total)\n3. Sell $180 put again for $2.00 cycle repeats\n\nThe wheel turns stock volatility into consistent income. Risk: if stock falls sharply, you own shares at a loss. The wheel only works well on stocks you are genuinely bullish on long-term.",
 highlight: [
 "wheel strategy",
 "covered call",
 "cash-secured put",
 "income loop",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "You sell a $50 cash-secured put on ABC for $1.80 with 30 days to expiration. ABC falls to $47 and you are assigned. What is your effective cost basis per share?",
 options: [
 "$48.20 ($50 strike minus $1.80 premium collected)",
 "$50.00 (the strike price is your cost)",
 "$47.00 (you receive shares at the current market price)",
 "$48.80 ($47 current price plus $1.80 premium)",
 ],
 correctIndex: 0,
 explanation:
 "Your cost basis is the strike price minus the premium collected: $50.00 $1.80 = $48.20. Even though the market is at $47, you have a built-in cushion from the premium. You're 'down' $1.20 from market price, but you also collected $1.80 in premium, so if ABC recovers to $48.20 you break even.",
 },
 {
 type: "quiz-tf",
 statement:
 "You should only sell cash-secured puts on stocks you actively want to own at the strike price.",
 correct: true,
 explanation:
 "This is the #1 rule. Assignment is always a possibility. If you wouldn't want to own 100 shares of a stock at the strike price, you should not be selling puts on it. Never sell puts just for the premium on a stock you're bearish on — you'll end up holding a loser.",
 },
 {
 type: "quiz-scenario",
 scenario:
 "It's February. META trades at $500. You sell the March $470 put (30 DTE, 0.22 delta) for $5.00. META reports earnings in 10 days, causing a 15% drop to $425. You are assigned 100 shares at $470.",
 question: "What is the best immediate response?",
 options: [
 "Sell the $470 covered call (or lower) to begin collecting premium and lowering cost basis further",
 "Immediately sell all shares at $425 to stop the loss from deepening",
 "Buy more put options to hedge the remaining downside",
 "Wait 12 months for long-term capital gains treatment before doing anything",
 ],
 correctIndex: 0,
 explanation:
 "You're now in the covered-call phase of the wheel. Your basis is $465 ($470 $5 premium). Selling the $470 covered call (or the $460 ATM call) for additional premium further lowers your effective cost basis. Panic-selling at $425 locks in a loss; the wheel strategy requires patience and systematic premium collection to work through a drawdown.",
 },
 {
 type: "teach",
 title: "Managing Assignment Risk Around Earnings",
 content:
 "**Implied volatility (IV)** spikes before earnings, inflating option premiums. This looks attractive — but earnings can gap the stock far beyond any strike.\n\n**Conservative approach**: Close puts 2–5 days before earnings (buy to close at a profit if IV has inflated the premium, or a small loss to avoid the binary event).\n\n**Aggressive approach**: Sell shorter DTE puts right AFTER earnings when IV crushes — you get reasonable premium on a stock that's already had its binary event.\n\n**Rule of thumb**: If you're selling 30-DTE puts on a stock with earnings in 15 days, you're taking earnings risk whether you want to or not. Know your expiry dates relative to earnings.",
 highlight: [
 "implied volatility",
 "IV crush",
 "earnings",
 "binary event",
 ],
 },
 ],
 },

 // Lesson 3: Iron Condor Setup and Management 
 {
 id: "osp-iron-condor",
 title: "Iron Condor Setup and Management",
 description:
 "Entry criteria, adjustment triggers, and closing rules for the iron condor",
 icon: "Columns",
 xpReward: 80,
 steps: [
 {
 type: "teach",
 title: "Iron Condor Structure",
 content:
 "An **iron condor** = bull put spread (below market) + bear call spread (above market). You profit when the underlying stays in a price range.\n\n**Structure on SPY at $500 (30 DTE)**:\n- Sell $490 put / Buy $485 put (bull put spread) collect $1.20 credit\n- Sell $510 call / Buy $515 call (bear call spread) collect $1.10 credit\n- **Total premium collected**: $1.20 + $1.10 = **$2.30**\n- **Max profit**: $2.30 per share ($230/contract) — if SPY closes between $490–$510\n- **Max loss**: ($5 spread width $2.30 premium) = $2.70 per share ($270/contract) — if SPY moves past $485 or $515\n- **Break-even**: $487.70 on the downside, $512.30 on the upside\n\nYou need SPY to stay within a $22.60 range (~4.5%) for 30 days.",
 highlight: [
 "iron condor",
 "bull put spread",
 "bear call spread",
 "max profit",
 "max loss",
 "break-even",
 ],
 },
 {
 type: "teach",
 title: "Entry Criteria: When to Open a Condor",
 content:
 "Iron condors thrive in specific market conditions:\n\n**Ideal entry conditions**:\n1. **High IV Rank (IVR > 30–50%)**: Sell premium when it's expensive. IVR measures current IV vs. 52-week range. High IVR = elevated premiums = more credit collected.\n2. **No major catalyst near expiry**: Avoid earnings, Fed meetings, or index rebalances within the trade's window.\n3. **Neutral bias**: You expect the market to stay rangebound — not trend strongly in either direction.\n4. **Credit 30% of spread width**: If spread width is $5, collect at least $1.50. Less than that and the risk/reward is poor.\n\n**Strike placement**: Use 0.15–0.20 delta for each short strike. That gives ~65–70% probability of the whole condor expiring worthless (both spreads worth $0).",
 highlight: [
 "IV Rank",
 "IVR",
 "neutral bias",
 "catalyst",
 "0.15–0.20 delta",
 ],
 },
 {
 type: "teach",
 title: "Management Rules: When to Adjust or Close",
 content:
 "Most traders manage iron condors actively rather than holding to expiration.\n\n**Take-profit rule**: Close the position at **50% of max profit**. If you collected $2.30 credit, close when the position has a gain of $1.15. Studies by tastytrade show closing at 50% profit dramatically improves win rate over time.\n\n**Adjustment trigger**: When the underlying breaches the short strike, your spread is in trouble.\n- Breaches short call: Roll the call spread up (buy back, sell higher strike) for a credit if possible\n- Breaches short put: Roll put spread down for a credit if possible\n\n**Stop loss**: Close the entire condor if unrealized loss reaches 2× the credit collected ($2.30 × 2 = $4.60 loss = close the trade). This prevents a max-loss scenario.\n\n**Time rule**: If 21 DTE remains and the position is still a loser, close it — gamma risk (speed of delta change) increases sharply in the final 3 weeks.",
 highlight: [
 "50% profit",
 "stop loss",
 "2× credit",
 "21 DTE",
 "gamma risk",
 "adjustment",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "You open an iron condor for $2.00 credit on a $5-wide spread. What is your maximum loss per contract?",
 options: [
 "$300 ($500 spread width minus $200 premium collected)",
 "$200 (you lose only the premium collected)",
 "$500 (the full spread width is the worst case)",
 "$700 ($500 spread width plus $200 premium)",
 ],
 correctIndex: 0,
 explanation:
 "Max loss = spread width premium collected = $5.00 $2.00 = $3.00 per share = $300 per contract. The premium collected cushions the loss. The full $500 spread width is the gross loss before accounting for the credit received.",
 },
 {
 type: "quiz-tf",
 statement:
 "It is always better to hold an iron condor to expiration to collect the maximum possible profit.",
 correct: false,
 explanation:
 "Research consistently shows that closing iron condors at 50% of max profit produces better risk-adjusted returns over many trades than holding to expiration. In the final 21 days, gamma risk increases sharply — a single big move can turn a winning trade into a max loss. Closing early is disciplined, not weak.",
 },
 {
 type: "quiz-mc",
 question:
 "Your SPY iron condor has 10 DTE and the short put at $490 is being tested (SPY is at $491). You collected $2.00 total. What is the best response?",
 options: [
 "Close the entire condor to limit losses — with 10 DTE, gamma risk is extreme",
 "Do nothing; there is still $1 of cushion before the short strike",
 "Roll the put spread down 5 strikes and collect a larger credit",
 "Buy the $490 put outright to protect only the put side",
 ],
 correctIndex: 0,
 explanation:
 "With only 10 DTE and SPY within $1 of the short put, delta and gamma are very high — a $2 drop puts the trade in serious trouble quickly. At this stage, the risk/reward of staying in is poor. Taking the loss now (likely $2.50–$3.50 per share) is better than risking the full $3.00 max loss. 'When in doubt, get out' applies especially with gamma risk this close to expiry.",
 },
 {
 type: "teach",
 title: "The Probability Math Behind Condors",
 content:
 "**Expected value math** for a 65% probability condor:\n\n- Premium collected: $2.00 (max profit)\n- Max loss: $3.00\n- Probability of max profit: 65%\n- Probability of max loss: 35% (simplified)\n\n`EV = 0.65 × $200 0.35 × $300 = $130 $105 = +$25`\n\nThe expected value is positive — which is why iron condors work over many trades. But the key is **consistency and position sizing**: trade small enough so a max-loss event doesn't derail your account.\n\n**Practical sizing**: Risk no more than 5% of account per condor. On a $50,000 account, that means max loss per trade $2,500. A $3.00 max loss condor allows 8–9 contracts ($2,700 risk). Size appropriately across multiple underlyings.",
 highlight: [
 "expected value",
 "probability",
 "position sizing",
 "5% rule",
 ],
 },
 ],
 },

 // Lesson 4: Earnings Plays 
 {
 id: "osp-earnings-plays",
 title: "Earnings Plays",
 description:
 "Pre/post earnings IV, straddles, and pricing the expected move",
 icon: "Zap",
 xpReward: 80,
 steps: [
 {
 type: "teach",
 title: "Why Earnings Are Special for Options",
 content:
 "Earnings reports are **binary events** — price can gap significantly in either direction overnight. Option market makers anticipate this by inflating implied volatility (IV) before earnings, making options expensive.\n\n**IV crush**: After earnings release, the uncertainty resolves and IV collapses — often 30–60% in a single session. An option that cost $10 yesterday might be worth $4 today at the same strike, even if the stock moved in your direction.\n\n**Two core earnings approaches**:\n1. **Directional play**: Buy calls or puts if you have a strong conviction about direction AND magnitude. Requires being right on direction AND right enough to overcome IV crush.\n2. **Volatility play**: Profit from the elevated IV itself (by selling premium before earnings) or from a larger-than-expected move (by buying straddles).",
 highlight: [
 "binary event",
 "IV crush",
 "implied volatility",
 "directional",
 "volatility play",
 ],
 },
 {
 type: "teach",
 title: "Calculating the Expected Move",
 content:
 "The **expected move** is the market's priced-in forecast for the earnings reaction. You can extract it from option prices:\n\n**Simple method (ATM straddle)**:\n`Expected move ATM call price + ATM put price`\n\nExample — META at $500 with earnings tomorrow:\n- ATM $500 call = $12.00\n- ATM $500 put = $11.50\n- Expected move = $12.00 + $11.50 = **$23.50 (~4.7%)**\n\nThe market is pricing a $23.50 move in either direction. If META actually moves $35, that beats the expected move — good for long straddle holders. If it moves $10, that's less than expected — bad for straddle holders, good for premium sellers.\n\nHistorically, stocks beat the expected move about 40–45% of the time — so the expected move is slightly overstated on average.",
 highlight: [
 "expected move",
 "ATM straddle",
 "straddle pricing",
 "implied move",
 ],
 },
 {
 type: "teach",
 title: "Long Straddle for Earnings",
 content:
 "A **long straddle** = buy ATM call + buy ATM put with same strike and expiry. You profit if the stock moves significantly in EITHER direction.\n\n**Example — GOOGL at $180, earnings in 1 day**:\n- Buy $180 call for $5.50\n- Buy $180 put for $5.20\n- Total cost: **$10.70** (this is your max loss)\n- Break-even: GOOGL must reach $190.70 or $169.30 at expiry\n- Max profit: Unlimited on upside; limited to $169.30 on downside (stock can't go below $0)\n\n**The catch**: IV crush means you need GOOGL to move MORE than the expected move ($10.70 in this case) to profit. If GOOGL moves exactly $10.70, you roughly break even. You need the actual move to EXCEED the priced-in move.\n\nSelling premium (iron condor or short straddle) is more consistently profitable than buying straddles, but buying straddles have capped loss and unlimited upside.",
 highlight: [
 "long straddle",
 "ATM",
 "break-even",
 "IV crush",
 "expected move",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "AMZN trades at $200 heading into earnings. The ATM $200 straddle costs $15.00 total. What is the break-even range for a long straddle holder?",
 options: [
 "AMZN must close below $185 or above $215 at expiration",
 "AMZN must stay between $185 and $215",
 "AMZN must move exactly $7.50 in either direction",
 "There is no break-even; straddles always expire worthless",
 ],
 correctIndex: 0,
 explanation:
 "Break-even for a long straddle: strike ± cost. $200 $15 = $185 on the downside; $200 + $15 = $215 on the upside. The straddle is profitable if AMZN closes outside this range. The $15.00 total cost represents the market's expected move — you profit if the actual move exceeds this.",
 },
 {
 type: "quiz-tf",
 statement:
 "Buying a call option right before earnings is a low-risk way to profit if the company reports a positive earnings surprise.",
 correct: false,
 explanation:
 "Even with a positive earnings surprise, IV crush can cause long calls to lose value. If you pay $8 for a call and the stock rises $5 but IV collapses from 80% to 35%, the option might be worth only $5–$6 after earnings. You were right about direction but lost money because the move didn't overcome IV crush. This is a common and costly mistake.",
 },
 {
 type: "teach",
 title: "Post-Earnings Strategies: Selling Premium After IV Crush",
 content:
 "A cleaner earnings play: **trade AFTER the report**, not before.\n\n**Setup**: Immediately after earnings (within 1–2 hours of market open), IV has already crashed. The stock has moved to its new equilibrium.\n\n**Post-earnings cash-secured put** (if bullish on the report):\n- NVDA reports strong earnings, gaps up from $130 to $148\n- Sell the $140 put (now 0.20 delta, with IV still elevated at 45%) for $2.50\n- You're selling at a strike 6% below the new price with high remaining IV\n- IV continues to decay, helping your put expire worthless\n\n**Post-earnings iron condor**:\n- Stock stabilizes after gap; sell strangle/condor around the new price\n- IV is elevated from earnings but will decay quickly — you're on the right side of vega\n\nPost-earnings trades avoid the binary event entirely while still capturing elevated IV.",
 highlight: [
 "post-earnings",
 "IV crush",
 "vega",
 "cash-secured put",
 "iron condor",
 ],
 },
 {
 type: "quiz-scenario",
 scenario:
 "NFLX is at $650 before earnings. The ATM straddle costs $30.00. You believe NFLX will beat estimates because of strong subscriber data. NFLX reports great numbers and gaps up $22 at the open.",
 question: "If you had bought the straddle before earnings, what happened?",
 options: [
 "You likely lost money — $22 move is less than the $30 break-even required",
 "You made $22 per share profit on the straddle",
 "You made $30 per share because you correctly predicted direction",
 "Break-even; a $22 move exactly covers the straddle cost",
 ],
 correctIndex: 0,
 explanation:
 "The straddle cost $30, meaning you need a $30+ move to profit. NFLX only moved $22. Even though you correctly predicted a positive move, the actual move was LESS than what the market had priced in. This is the danger of pre-earnings straddles — you pay for the expected move and lose if the actual reaction is smaller.",
 },
 ],
 },

 // Lesson 5: Hedging a Portfolio with Options 
 {
 id: "osp-portfolio-hedging",
 title: "Hedging a Portfolio with Options",
 description:
 "Protective puts, collars, and computing a portfolio beta hedge",
 icon: "ShieldAlert",
 xpReward: 80,
 steps: [
 {
 type: "teach",
 title: "Why Hedge? The Cost of Drawdowns",
 content:
 "Portfolio hedging uses options to reduce downside risk — like buying insurance for your investments.\n\n**The math of drawdowns**:\n- A 20% loss requires a 25% gain just to break even\n- A 40% loss requires a 67% gain to break even\n- A 50% loss requires a 100% gain to break even\n\n**Hedging isn't free**: You pay premium (just like insurance premiums). The goal is reducing catastrophic losses, not eliminating all risk.\n\n**When hedging makes sense**:\n- You have large concentrated positions you can't sell (restricted stock, large embedded gains)\n- You're near a major life event (retirement, home purchase) and can't afford volatility\n- Macro environment is deteriorating but you don't want to sell holdings (tax reasons)\n- Portfolio size is large enough that hedge cost is proportionally small",
 highlight: [
 "hedge",
 "drawdown",
 "insurance",
 "concentrated position",
 ],
 },
 {
 type: "teach",
 title: "Protective Put: Stock Insurance",
 content:
 "A **protective put** = own 100 shares + buy 1 put option on those shares. The put limits your downside to the strike price.\n\n**Example — 100 shares AAPL at $190**:\n- Buy the $180 put (90 DTE) for $3.50/share cost $350\n- **Worst case**: AAPL crashes to $120. Your shares are worth $12,000, but you exercise the put to sell at $180 your loss is capped at ($190 $180) × 100 + $350 premium = **$1,350 max loss** instead of $7,000\n- **Best case**: AAPL rises. The put expires worthless; you've paid $350 as 'insurance' — about 1.8% of position value for 90 days of protection.\n\n**Strike selection**: 5–10% OTM puts (the '$180 put on a $190 stock') balance protection vs. cost. At-the-money puts give full coverage but cost 3–4× more.",
 highlight: [
 "protective put",
 "downside cap",
 "insurance",
 "OTM",
 "strike",
 ],
 },
 {
 type: "teach",
 title: "The Collar: Free Hedge (Almost)",
 content:
 "A **collar** = own shares + buy protective put + sell covered call. The call premium offsets (fully or partially) the put cost.\n\n**Example — 100 shares MSFT at $420**:\n- Buy $400 put (90 DTE) for $5.00 costs $500\n- Sell $440 call (90 DTE) for $4.80 collects $480\n- **Net cost**: $500 $480 = **$20** (essentially free protection)\n- **Your range**: $400 downside floor, $440 upside cap\n- You've capped your gain at $20 ($440 $420), but also capped your loss at $20 + $20 hedge cost = $2,020 max loss vs. much larger loss in a crash\n\n**Zero-cost collar**: Adjust strikes until premium received exactly offsets premium paid. The trade-off: narrower profit window.\n\nCollars are widely used by executives holding concentrated stock positions — they get downside protection without triggering a taxable sale.",
 highlight: [
 "collar",
 "zero-cost collar",
 "covered call",
 "protective put",
 "concentrated stock",
 ],
 },
 {
 type: "teach",
 title: "Portfolio Beta Hedge with Index Puts",
 content:
 "Instead of hedging each stock individually, use **index options (SPY or SPX puts)** to hedge an entire portfolio.\n\n**Step 1 — Compute portfolio beta**: Beta measures how much your portfolio moves relative to the S&P 500. A portfolio beta of 1.2 means if SPY drops 10%, your portfolio drops ~12%.\n\n**Step 2 — Calculate hedge ratio**:\n`Number of puts needed = (Portfolio Value × Beta) / (SPY price × 100)`\n\nExample: $500,000 portfolio, beta = 1.2, SPY at $500:\n`= ($500,000 × 1.2) / ($500 × 100) = $600,000 / $50,000 = 12 puts`\n\n**Step 3 — Select strike**: Buy the 5% OTM SPY put (around $475) to protect against a broad market selloff.\n\n**Step 4 — Select expiry**: 3–6 months out balances protection duration vs. time decay cost.",
 highlight: [
 "beta hedge",
 "portfolio beta",
 "hedge ratio",
 "index puts",
 "SPY",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "You own 100 shares of GOOGL at $180 and buy a $170 protective put for $4.00. GOOGL falls to $140. What is your approximate maximum loss?",
 options: [
 "$1,400 — ($180 $170) × 100 shares + $400 put premium",
 "$4,000 — ($180 $140) × 100 shares",
 "$400 — you lose only the put premium",
 "$3,600 — ($180 $140) × 100 minus $400 put premium",
 ],
 correctIndex: 0,
 explanation:
 "The $170 put lets you sell at $170 even though the market is at $140. Loss on shares: ($180 $170) × 100 = $1,000. Plus $400 put premium = $1,400 total. Without the put, you'd have lost ($180 $140) × 100 = $4,000. The put saved you $2,600.",
 },
 {
 type: "quiz-tf",
 statement:
 "A collar strategy eliminates all risk and upside on a stock position.",
 correct: false,
 explanation:
 "A collar limits BOTH downside (via the put) AND upside (via the short call). It does not eliminate risk — you still lose money if the stock falls below the put strike (by the amount of net premium paid plus the capped loss). It defines a range. The stock can still move within that range — you just can't profit above the call strike or lose more than the put floor.",
 },
 {
 type: "quiz-scenario",
 scenario:
 "An investor has a $800,000 stock portfolio with a beta of 1.1 and is worried about a market correction in the next 90 days. SPY trades at $500. She wants to hedge using SPY puts.",
 question: "How many SPY put contracts does she need for a full beta hedge?",
 options: [
 "17–18 contracts — ($800,000 × 1.1) / ($500 × 100) = 17.6",
 "16 contracts — $800,000 / ($500 × 100) = 16, ignoring beta",
 "8 contracts — half the portfolio value divided by SPY price",
 "1 contract — index puts cover the entire portfolio by default",
 ],
 correctIndex: 0,
 explanation:
 "Hedge ratio = (Portfolio × Beta) / (Index price × 100 shares). ($800,000 × 1.1) / ($500 × 100) = $880,000 / $50,000 = 17.6 round to 18 contracts. Ignoring beta (answer B) would under-hedge because her portfolio is 10% more volatile than SPY. Beta is critical to sizing the hedge correctly.",
 },
 ],
 },
 ],
};
