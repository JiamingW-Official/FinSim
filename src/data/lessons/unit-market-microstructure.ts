import type { Unit } from "./types";

export const UNIT_MARKET_MICROSTRUCTURE: Unit = {
 id: "market-microstructure",
 title: "Market Microstructure & Trading Mechanics",
 description:
 "Understand how markets actually work — order types, bid-ask spreads, price discovery, HFT, and market regulation",
 icon: "",
 color: "#f97316",
 lessons: [
 // Lesson 1: Order Types & Execution 
 {
 id: "mm-1",
 title: "Order Types & Execution",
 description:
 "Market orders, limit orders, stops, trailing stops, and iceberg orders — how each type executes",
 icon: "Zap",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Market Orders vs Limit Orders",
 content:
 "The two fundamental order types differ on what you guarantee — fill or price.\n\n**Market Order:**\n- Executes immediately at the best available price in the market\n- **Guaranteed fill** — you will get your shares\n- **Uncertain price** — in fast markets you may pay far more (or sell for far less) than expected\n- Best used for highly liquid assets (e.g., SPY, AAPL) when speed matters\n\n**Limit Order:**\n- Executes only at your specified price or better\n- **Known price** — you never pay more than your limit to buy, never receive less than your limit to sell\n- **Uncertain fill** — if the market never reaches your price, the order may expire unfilled\n- Best used when price is more important than certainty of execution\n\nExample: Stock is bid $99.90 / ask $100.10.\n- Market buy fills at $100.10 (or worse in thin markets)\n- Limit buy at $99.80 sits in the order book waiting for sellers",
 highlight: ["market order", "limit order", "fill", "bid", "ask"],
 },
 {
 type: "teach",
 title: "Stop Orders, Stop-Limits & Trailing Stops",
 content:
 "Advanced order types add conditional logic to your execution.\n\n**Stop (Stop-Market) Order:**\n- Inactive until price touches the stop level\n- Once triggered, becomes a **market order** — executes at whatever price is available\n- Risk: **slippage** — in gaps or fast markets the actual fill can be far from the stop price\n- Use case: cutting losses (stop-loss) or entering breakouts\n\n**Stop-Limit Order:**\n- Triggered at the stop level, but then placed as a **limit order** at the specified limit price\n- Avoids worst-case slippage, but **may not fill** if the price gaps through the limit\n- Risk: you wanted protection but the order never executed\n\n**Trailing Stop:**\n- Follows the price by a fixed amount ($ or %)\n- As price rises, the stop level rises automatically — locks in profits\n- If price falls by the trail amount from its high, order triggers\n- Example: Buy at $100, trailing stop 5%. Stop at $95. Price rises to $120 stop moves to $114. Price drops to $114 sell triggered.\n\n**Iceberg / Reserve Orders:**\n- Institutional-sized orders displayed as small visible quantity\n- The full (hidden) quantity refills automatically as visible portion executes\n- Purpose: avoid tipping off the market to large demand or supply",
 highlight: ["stop order", "stop-limit", "trailing stop", "slippage", "iceberg"],
 },
 {
 type: "quiz-mc",
 question:
 "What is the main risk of using a stop-market order to protect a long position?",
 options: [
 "Slippage — it becomes a market order after the stop is triggered, so execution price can be far worse than the stop level",
 "The order may never trigger, leaving the position unprotected",
 "It will always fill at exactly the stop price regardless of market conditions",
 "It can only be used on option contracts, not stocks",
 ],
 correctIndex: 0,
 explanation:
 "A stop-market order converts to a market order once the stop price is touched. In fast-moving or gapping markets, the actual fill can be significantly below (for a long) the stop level — this slippage is the primary risk. A stop-limit avoids this but introduces non-fill risk instead.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A limit buy order at $50 guarantees you will buy shares at exactly $50.",
 correct: false,
 explanation:
 "False. A limit buy order guarantees you will pay no MORE than $50 — you may actually fill at a better (lower) price if the market moves in your favor. There is also no guarantee of fill if the price never reaches $50.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You own 500 shares of a stock currently trading at $80. You want to protect profits without capping your upside. You set a 10% trailing stop.",
 question: "If the stock rises to $110 and then drops to $99, what happens?",
 options: [
 "The trailing stop triggers a sell at approximately $99 — the stop moved to $99 ($110 × 0.90) and was hit",
 "Nothing happens because $99 is still above your original purchase price",
 "The order cancels automatically once the stock reached $110",
 "The stock must fall back to $80 before the stop triggers",
 ],
 correctIndex: 0,
 explanation:
 "The trailing stop follows the high-water mark. At $110 the stop level reset to $110 × 0.90 = $99. When price falls to $99, the stop triggers and a market sell order executes at approximately $99, locking in a ~24% gain from $80.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Bid-Ask Spread & Market Making 
 {
 id: "mm-2",
 title: "Bid-Ask Spread & Market Making",
 description:
 "How spreads work, what market makers do, adverse selection, and spread determinants",
 icon: "BarChart2",
 xpReward: 90,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The Bid-Ask Spread",
 content:
 "Every traded asset has two prices simultaneously:\n\n**Bid price:** The highest price any buyer is willing to pay right now.\n**Ask price (Offer):** The lowest price any seller is willing to accept right now.\n\n**Spread = Ask Bid**\nThis gap is the market maker's gross profit per round-trip trade.\n\nExample: Apple is quoted at Bid $185.10 / Ask $185.12.\nSpread = $0.02 (2 cents, or about 1 basis point — very liquid stock).\n\nA retail investor who buys at $185.12 and immediately sells at $185.10 has lost $0.02 per share — the spread cost.\n\n**Effective Spread:**\nMeasures the true cost of execution:\nEffective spread = 2 × (execution price midpoint)\nMidpoint = (Bid + Ask) / 2 = $185.11\nIf you bought at $185.12: effective spread = 2 × ($185.12 $185.11) = $0.02\n\n**Spread as transaction cost:**\nOn a 1,000-share trade of a $50 stock with a $0.10 spread, the spread cost is $100 — before any commissions.",
 highlight: ["bid", "ask", "spread", "midpoint", "effective spread"],
 },
 {
 type: "teach",
 title: "Market Makers, Adverse Selection & Spread Determinants",
 content:
 "**Market makers** are firms (or HFT algorithms) that continuously post both bids and asks, providing liquidity so other participants can always transact.\n\n**How they profit:**\n- Buy at the bid, sell at the ask, earn the spread repeatedly\n- They are NOT taking directional bets — they aim to be flat at end of day\n- They manage inventory risk: if too long, they lower their bid; if too short, they raise their ask\n\n**Adverse selection — the market maker's enemy:**\nNot all traders are equal. An informed trader (who knows something the market maker doesn't) will always transact in the direction that hurts the market maker.\n- Informed buy stock will likely go up market maker sold too cheap\n- Informed sell stock will likely go down market maker bought too dear\nTo compensate for this risk, market makers **widen the spread** when uncertainty is high.\n\n**What determines spread width?**\n| Factor | Effect on Spread |\n|---|---|\n| High volatility | Wider — more adverse selection risk |\n| High volume / liquidity | Narrower — more competition, faster inventory turnover |\n| Earnings announcement | Wider — information asymmetry spikes |\n| After-hours trading | Wider — thin liquidity, higher risk |\n| Large-cap vs small-cap | Narrower for large-cap (more market makers competing) |",
 highlight: ["market maker", "adverse selection", "inventory risk", "liquidity", "information asymmetry"],
 },
 {
 type: "quiz-mc",
 question:
 "Why do market makers widen their bid-ask spreads during high-volatility events such as earnings announcements?",
 options: [
 "To compensate for increased adverse selection risk — informed traders are more likely to be active, trading against the market maker's positions",
 "Because exchanges require wider spreads during high-volatility periods by regulation",
 "Because volume drops during earnings, making spreads mechanically wider",
 "To signal to the market that they are no longer providing liquidity",
 ],
 correctIndex: 0,
 explanation:
 "During earnings announcements, informed traders (insiders, analysts with early models) are disproportionately active. Market makers know they are likely to be on the wrong side of these trades. They widen spreads to earn more per trade to offset the expected losses from adverse selection.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A market maker's primary goal is to profit from directional price movements in the stocks they trade.",
 correct: false,
 explanation:
 "False. Market makers aim to remain directionally neutral (flat), profiting from the spread rather than price direction. They hedge inventory risk when they accumulate a one-sided position. Taking large directional bets would expose them to the same market risk as any speculator.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A stock is quoted Bid $29.95 / Ask $30.05. You buy 1,000 shares at the ask. The midpoint is $30.00.",
 question: "What is your effective spread cost on this 1,000-share purchase?",
 options: [
 "$100 — effective spread = 2 × ($30.05 $30.00) × 1,000 shares",
 "$50 — effective spread = ($30.05 $29.95) / 2 × 1,000 shares",
 "$10 — the spread is just $0.01 per share",
 "$200 — the full spread × 1,000 shares both ways",
 ],
 correctIndex: 0,
 explanation:
 "Effective spread = 2 × (execution price midpoint) = 2 × ($30.05 $30.00) = $0.10 per share. On 1,000 shares that is $100. This represents the round-trip cost — buying at the ask and immediately selling at the bid would cost $0.10 per share ($30.05 buy, $29.95 sell).",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Order Flow & Price Discovery 
 {
 id: "mm-3",
 title: "Order Flow & Price Discovery",
 description:
 "How the order book works, VWAP, price impact of large trades, and dark pools",
 icon: "Search",
 xpReward: 90,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Price Discovery & the Order Book",
 content:
 "**Price discovery** is the process by which a market collectively finds the true equilibrium price for an asset through the aggregation of bids, asks, and completed trades.\n\n**The Limit Order Book (LOB):**\nThe order book shows all resting limit orders at every price level:\n\nASK side (sellers)\n$100.30 — 500 shares\n$100.20 — 1,200 shares\n$100.10 — 800 shares (best ask)\n SPREAD \n$100.00 — 1,000 shares (best bid)\n$99.90 — 2,000 shares\n$99.80 — 600 shares\nBID side (buyers)\n\nWhen a market buy order for 1,200 shares arrives:\n- Takes 800 shares at $100.10 (exhausts that level)\n- Takes 400 shares at $100.20 (partially fills next level)\n- New best ask: $100.20 — the price has moved up\n\nThis is **market impact**: large orders move the price against themselves.\n\n**Tick data** records every single trade with price, size, and timestamp — the raw DNA of microstructure research.",
 highlight: ["price discovery", "order book", "market impact", "tick data", "limit order"],
 },
 {
 type: "teach",
 title: "VWAP, Price Impact & Dark Pools",
 content:
 "**VWAP (Volume-Weighted Average Price):**\nVWAP = Sum of (Price × Volume) / Sum of Volume\n\nCalculated continuously throughout the trading day. It is the primary institutional execution benchmark — a trader who beats VWAP (bought below / sold above) has executed efficiently.\n\nExample: Three trades at $50 × 1,000 shares, $51 × 2,000 shares, $52 × 500 shares:\nVWAP = ($50×1,000 + $51×2,000 + $52×500) / 3,500 = $178,000 / 3,500 = **$50.86**\n\n**Price Impact:**\nLarge orders are expensive because they consume multiple price levels in the book.\nA rough rule of thumb: market impact is proportional to the square root of (order size / average daily volume)\n\nAn order representing 10% of daily volume may move the price 0.5–1.5% — a significant cost on a large position.\n\n**Dark Pools:**\nAlternative trading venues where orders are not displayed publicly before execution.\n- Used by institutions to minimize market impact\n- Trades reported post-execution to the consolidated tape\n- Common: block trades (>10,000 shares or >$200,000 notional)\n- Drawback: no pre-trade price transparency; may get worse prices than lit markets",
 highlight: ["VWAP", "price impact", "dark pool", "block trade", "institutional"],
 },
 {
 type: "quiz-mc",
 question: "What does VWAP measure?",
 options: [
 "The average price of all trades during the day, weighted by trading volume — giving more weight to prices where more shares changed hands",
 "The simple arithmetic average of the open, high, low, and close prices",
 "The price at which the highest volume of shares traded during the day",
 "The average spread between bid and ask prices throughout the trading session",
 ],
 correctIndex: 0,
 explanation:
 "VWAP (Volume-Weighted Average Price) = Sum of (price × volume) / Sum of volume. Trades at high volume receive more weight. It is the standard institutional benchmark — large orders try to execute as close to VWAP as possible to demonstrate efficient execution.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "Dark pools were created to help retail investors hide their small orders from market makers.",
 correct: false,
 explanation:
 "False. Dark pools were created primarily for institutional investors executing large block trades. By hiding order flow pre-execution, institutions avoid signaling their demand to the market and minimize price impact. Retail order flow is tiny relative to daily volume and does not meaningfully move prices.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An institution needs to buy 500,000 shares of a stock with average daily volume of 2,000,000 shares. The current price is $40.",
 question:
 "Why would the institution use a dark pool or algorithmic execution instead of a simple market order?",
 options: [
 "A single market order for 500,000 shares (25% of daily volume) would create massive price impact, driving the price up significantly before the full order filled",
 "Market orders can only handle up to 10,000 shares at a time by regulation",
 "Dark pools offer lower exchange fees that outweigh any execution price difference",
 "The institution wants to avoid paying the bid-ask spread, which dark pools eliminate entirely",
 ],
 correctIndex: 0,
 explanation:
 "At 25% of daily volume, a single market order would exhaust multiple price levels in the order book, pushing the price up by potentially 1–3% or more before completing. By using a dark pool or VWAP algorithm spread over hours, the institution minimizes market impact and gets a better average price.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: High-Frequency Trading & Latency 
 {
 id: "mm-4",
 title: "High-Frequency Trading & Latency",
 description:
 "HFT strategies, colocation, the latency arms race, and the 2010 Flash Crash",
 icon: "Cpu",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "HFT Strategies & the Latency Arms Race",
 content:
 "**High-Frequency Trading (HFT)** uses ultra-fast computers and low-latency connections to execute thousands of orders per second, holding positions for milliseconds to seconds.\n\n**Major HFT strategy types:**\n\n1. **Electronic market making** (most common): Post bids and asks simultaneously; earn spread; update quotes thousands of times per second based on incoming data. These firms now provide the majority of liquidity in US equities.\n\n2. **Statistical arbitrage**: Identify mispricings between correlated assets (e.g., ETF vs its underlying basket, same stock on two exchanges) and trade to close the gap in microseconds.\n\n3. **Latency arbitrage**: Receive market data fractions of a second earlier than slower participants (via faster connections) and trade ahead of stale quotes.\n\n4. **News-based trading**: Parse news feeds, earnings releases, or economic data releases in microseconds and trade before humans can read the headline.\n\n**The latency arms race:**\n- **Colocation**: Placing servers physically inside the exchange's data center cuts round-trip latency to <1 millisecond vs ~40ms across the internet\n- Infrastructure evolution: fiber optic microwave towers laser transmission across key routes (NY to Chicago)\n- Advantage is measured in **microseconds** (millionths of a second); firms spend tens of millions for a 10μs edge",
 highlight: ["HFT", "market making", "statistical arbitrage", "latency arbitrage", "colocation"],
 },
 {
 type: "teach",
 title: "The Flash Crash of 2010 & HFT's Market Impact",
 content:
 "**Flash Crash — May 6, 2010:**\n- The Dow Jones Industrial Average fell nearly **1,000 points** (about 9%) in minutes — the largest intraday point drop in history at the time\n- Recovered almost entirely within **20 minutes**\n- Triggered by a large algorithmic sell order (a mutual fund selling $4.1B in E-mini S&P futures) in a thin, already-stressed market\n- HFT market makers detected abnormal conditions, withdrew liquidity simultaneously\n- Without bids, sell orders cascaded: some stocks briefly traded at $0.01, others at $100,000\n- SEC investigation led to new circuit breaker rules\n\n**Positive effects of HFT on markets:**\n- Dramatically **narrowed bid-ask spreads** for retail investors (e.g., spreads on major stocks fell from ~$0.125 in 2000 to ~$0.01 today)\n- Increased market depth and continuous liquidity\n- Faster price discovery across venues\n\n**Negative concerns:**\n- **Latency arbitrage** may front-run institutional orders (controversial — studies are mixed)\n- Flash crash risk: correlated withdrawal of liquidity\n- Arms race costs (colocation fees, microwave networks) add no economic value — only redistribute profits between speed tiers",
 highlight: ["Flash Crash", "circuit breaker", "liquidity withdrawal", "spread narrowing", "front-running"],
 },
 {
 type: "quiz-mc",
 question:
 "What happened during the Flash Crash of May 6, 2010?",
 options: [
 "Algorithmic trading caused the Dow to fall nearly 1,000 points in minutes before recovering almost fully within 20 minutes, triggered by a large automated futures sell order in a thin market",
 "The NYSE suffered a technical outage that halted trading for 3 hours and caused an artificial 1,000-point gap down on resumption",
 "A rogue trader at a major bank accidentally submitted a trillion-dollar sell order, crashing global markets for two days",
 "The Federal Reserve unexpectedly raised rates by 1%, causing an immediate algorithmic sell-off that took weeks to recover",
 ],
 correctIndex: 0,
 explanation:
 "The Flash Crash was caused by a $4.1B algorithmic sell order in E-mini S&P futures interacting with a market where HFT market makers withdrew liquidity en masse. The Dow fell ~1,000 points in minutes and recovered within 20 minutes. The event led to circuit breaker reforms and regulatory scrutiny of algorithmic trading.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "High-frequency trading has had no positive effect on markets — it only benefits the HFT firms at the expense of other investors.",
 correct: false,
 explanation:
 "False. HFT electronic market makers have dramatically narrowed bid-ask spreads for retail and institutional investors alike. The spread on major US stocks fell from $0.125+ in 2000 (pre-decimalization) to ~$0.01 today, partly because of HFT competition. The net effect is debated, but spread narrowing is a concrete and measurable benefit.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An HFT firm pays $500,000 per year to colocate its servers inside the NYSE's data center. This reduces their round-trip latency from 40ms (over the internet) to 0.3ms.",
 question:
 "What is the primary competitive advantage this latency reduction provides?",
 options: [
 "They can detect and react to order flow, quote changes, or arbitrage opportunities before slower participants, allowing them to update quotes and capture spreads more effectively",
 "They receive earlier access to regulatory filings like 10-K reports before other market participants",
 "Lower latency means their orders are given priority in the exchange's matching engine regardless of price",
 "Colocation exempts them from SEC reporting requirements on their trading activity",
 ],
 correctIndex: 0,
 explanation:
 "Colocation provides a speed advantage in reacting to market events. At 40ms latency, thousands of price updates can occur before a remote firm's response arrives. With sub-millisecond latency, the firm can quote accurately, withdraw stale quotes before being picked off by faster traders, and exploit short-lived arbitrage across venues.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Market Structure & Regulation 
 {
 id: "mm-5",
 title: "Market Structure & Regulation",
 description:
 "Fragmentation, Reg NMS, PFOF, short selling mechanics, circuit breakers, and market manipulation",
 icon: "Landmark",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Market Fragmentation & Reg NMS",
 content:
 "**US equity market fragmentation:**\nUS stocks trade across **16+ registered exchanges** (NYSE, Nasdaq, CBOE, IEX, and many others) plus dozens of alternative trading systems (dark pools, internalizers).\n- No single exchange handles more than ~20% of overall volume\n- A single trade in Apple may route through 3 different venues before completing\n- Prices are consolidated across all venues via the **SIP (Securities Information Processor)**\n\n**Regulation NMS (National Market System) — 2005:**\nThe SEC's framework for equity market structure has four key rules:\n1. **Order Protection Rule (trade-through rule)**: Brokers must route to the venue offering the best displayed price — you cannot execute at an inferior price if a better one is displayed elsewhere\n2. **Access Rule**: Exchanges must provide fair access to their displayed quotes at reasonable fees\n3. **Sub-Penny Rule**: Bids and asks must be quoted in increments of at least $0.01 (for stocks >$1) to prevent queue-jumping with fractional pennies\n4. **Market Data Rule**: Ensures consolidated market data is broadly available\n\nReg NMS created the modern fragmented-but-linked market structure, enabling competition between venues while protecting investors from inferior execution.",
 highlight: ["Reg NMS", "fragmentation", "order protection", "SIP", "best execution"],
 },
 {
 type: "teach",
 title: "PFOF, Short Selling, Circuit Breakers & Manipulation",
 content:
 "**Payment for Order Flow (PFOF):**\nRetail brokers (Robinhood, TD Ameritrade) route customer orders to wholesale market makers (Citadel Securities, Virtu) who pay the broker a fraction of a cent per share.\n- Market makers profit by executing retail orders at prices slightly better than the quoted spread — but not as good as they could get on a lit exchange\n- Retail gets commission-free trading; broker earns PFOF revenue; market maker earns a thin spread\n- Controversy: is PFOF in the customer's best interest? SEC has considered banning it.\n\n**Short Selling Mechanics:**\n1. **Locate** a lender (broker or stock loan desk)\n2. **Borrow** shares, paying a stock borrow fee (easy: ~0.25%/yr; hard-to-borrow: 20–100%+/yr)\n3. **Sell** the borrowed shares at current market price\n4. **Buy back** (cover) to close; return shares to lender\n5. **Settlement**: T+1 since May 2024 (changed from T+2)\n\n**Circuit Breakers (Market-Wide Halt):**\n- S&P 500 drops **7%** 15-minute trading halt\n- S&P 500 drops **13%** 15-minute trading halt\n- S&P 500 drops **20%** market closes for the rest of the day\n\n**Market Manipulation (illegal):**\n- **Quote stuffing**: Flooding the market with thousands of orders then cancelling to slow down competitors' systems\n- **Layering / spoofing**: Placing large visible orders to create false price pressure, then cancelling before execution — a federal crime under the Dodd-Frank Act",
 highlight: ["PFOF", "short selling", "circuit breaker", "quote stuffing", "spoofing"],
 },
 {
 type: "quiz-mc",
 question:
 "What is 'payment for order flow' (PFOF)?",
 options: [
 "Market makers pay retail brokers to route customer orders to them, allowing market makers to profit from executing those orders at a small spread advantage",
 "Retail customers pay a fee to brokers for guaranteed order execution within one millisecond",
 "Exchanges pay brokers a rebate for each limit order that adds liquidity to the order book",
 "High-frequency traders pay the SEC for advance access to market data feeds",
 ],
 correctIndex: 0,
 explanation:
 "In PFOF, wholesale market makers (like Citadel Securities) pay retail brokers fractions of a cent per share to receive retail order flow. The market maker executes the order at a price slightly better than the quoted spread — giving the customer price improvement — while still profiting on the spread. Critics argue customers would get even better prices on lit exchanges.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "US equity market circuit breakers halt trading permanently for the day when the S&P 500 drops 7%.",
 correct: false,
 explanation:
 "False. A 7% S&P 500 drop triggers only a 15-minute trading halt — not a full-day closure. Trading resumes after the pause. A 13% drop triggers another 15-minute halt. Only a 20% intraday decline results in the market closing for the remainder of the trading day.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A trader places a large visible sell order at $50.10 (10,000 shares) on a stock currently at $50.00 bid. Other market participants see this large offer and lower their bids, thinking heavy selling is coming. The moment bids drop to $49.80, the trader cancels the 10,000-share sell order and instead buys at $49.80.",
 question: "What illegal practice does this describe?",
 options: [
 "Layering / spoofing — placing orders with no intent to execute, solely to manipulate other participants' perception of supply and demand",
 "Front-running — trading ahead of known customer orders",
 "Wash trading — buying and selling the same security simultaneously to generate false volume",
 "Short-and-distort — taking a short position and spreading false negative information",
 ],
 correctIndex: 0,
 explanation:
 "This is layering (also called spoofing) — a form of market manipulation made a federal crime under Dodd-Frank. The trader creates false supply signals with large orders they never intend to execute, moves the price to a desired level, then trades on the artificial dislocation. The CFTC and SEC have prosecuted multiple firms for this practice.",
 difficulty: 3,
 },
 ],
 },
 ],
};
