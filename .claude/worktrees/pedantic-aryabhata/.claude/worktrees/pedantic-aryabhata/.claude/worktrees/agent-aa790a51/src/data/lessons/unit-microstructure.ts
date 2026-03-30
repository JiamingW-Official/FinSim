import type { Unit } from "./types";

export const UNIT_MICROSTRUCTURE: Unit = {
  id: "microstructure",
  title: "Market Microstructure",
  description:
    "How markets actually work under the hood — from bid-ask spreads to dark pools and institutional execution",
  icon: "Network",
  color: "#0ea5e9",
  lessons: [
    /* ================================================================
       LESSON 1 — How Markets Work
       ================================================================ */
    {
      id: "micro-1",
      title: "How Markets Work",
      description:
        "Bid-ask spreads, market makers, the NBBO, and exchange mechanics explained",
      icon: "Landmark",
      xpReward: 65,
      steps: [
        {
          type: "teach",
          title: "The Bid-Ask Spread",
          content:
            "Every listed security has two prices at any moment: the **bid** and the **ask**.\n\n- **Bid**: the highest price a buyer is currently willing to pay\n- **Ask** (or offer): the lowest price a seller is currently willing to accept\n- **Spread**: ask minus bid — this is the market maker's gross profit per share\n\n**Example — Apple (AAPL):**\nBid $182.45 / Ask $182.46 → spread of $0.01 (1 cent)\n\nFor a thinly traded small-cap:\nBid $4.20 / Ask $4.35 → spread of $0.15 (15 cents, or 3.6% of price)\n\nThe spread is a **transaction cost** you pay every time you trade. If you buy at the ask and immediately sell at the bid, you've already lost the spread. On a liquid stock like AAPL this costs you 0.005%; on an illiquid stock it can cost 3-5%.\n\n**Why spreads vary:**\n- **Liquidity**: Stocks with millions of daily shares trade narrow spreads; thinly traded names trade wide\n- **Volatility**: During high-uncertainty events (earnings, Fed announcements), spreads widen as market makers hedge uncertainty\n- **Time of day**: Spreads are widest at the open (9:30–9:45 ET) and close (3:45–4:00 ET), narrowest midday\n- **Price level**: Penny stocks under $1 often have spreads of 20-50% of share price",
          highlight: ["bid", "ask", "spread", "market maker", "liquidity"],
        },
        {
          type: "teach",
          title: "Market Makers and the NBBO",
          content:
            "**Market makers** (also called dealers) are firms that continuously post bid and ask quotes, providing liquidity to the market. They profit from the spread — buying at the bid, selling at the ask — while hedging their inventory risk.\n\nMajor U.S. market makers include:\n- **Citadel Securities** — handles roughly 25% of all U.S. equity volume\n- **Virtu Financial** — one of the most prolific HFT market makers\n- **Susquehanna International Group (SIG)**\n- **Jane Street** — dominant in ETFs and options\n\n**The National Best Bid and Offer (NBBO):**\nThe U.S. equity market is fragmented — stocks trade on over 16 venues including NYSE, NASDAQ, CBOE, Bats, and many more. The NBBO is the composite of the **best bid across all venues** and the **best ask across all venues**.\n\nSEC Regulation NMS (2005) requires brokers to route orders to the exchange posting the NBBO price — you cannot legally execute at an inferior price when a better one exists elsewhere. This is called **best execution**.\n\n**Example:**\n- NYSE posts: bid $50.00, ask $50.03\n- NASDAQ posts: bid $50.01, ask $50.02\n- CBOE posts: bid $49.99, ask $50.04\n\nNBBO = bid $50.01 (from NASDAQ) / ask $50.02 (from NASDAQ)\n\nYour broker must route your order to get $50.02 or better on a buy.",
          highlight: [
            "market maker",
            "NBBO",
            "Citadel Securities",
            "Regulation NMS",
            "best execution",
            "fragmented",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Stock XYZ has a bid of $25.40 and an ask of $25.45. You place a market order to buy 500 shares. How much do you pay and what is the total transaction cost attributable to the spread?",
          options: [
            "You pay $25.45 per share ($12,725 total); the spread cost is $25 (500 × $0.05)",
            "You pay $25.40 per share ($12,700 total); the spread cost is $0",
            "You pay the midpoint $25.425 per share; spread cost is $12.50",
            "You pay $25.45 but the broker rebates the spread to you",
          ],
          correctIndex: 0,
          explanation:
            "A market buy order executes at the ask — the lowest price sellers will accept — which is $25.45. Total cost = 500 × $25.45 = $12,725. The spread is $0.05 per share, so the spread cost = 500 × $0.05 = $25. If you immediately sold using a market order at the bid of $25.40, you would receive $12,700 — a $25 loss purely from the bid-ask spread, before any commissions.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Exchange Mechanics: How Your Order Gets Filled",
          content:
            "Understanding the journey of a single order reveals why execution quality matters:\n\n**Step 1 — Order placement:**\nYou click 'buy 100 shares of TSLA at market' in your broker app.\n\n**Step 2 — Smart Order Router (SOR):**\nYour broker's system checks the NBBO across all 16+ exchanges in microseconds, looking for the best available price and sufficient displayed liquidity.\n\n**Step 3 — Routing decision:**\nFor retail orders, many brokers route to a **wholesaler** (a large market maker like Citadel or Virtu) via **Payment for Order Flow (PFOF)**. The wholesaler guarantees price improvement over the NBBO in exchange for the order flow. This is controversial — critics argue retail traders could get even better prices on lit exchanges.\n\n**Step 4 — Matching engine:**\nOn a lit exchange, the order enters the **Central Limit Order Book (CLOB)**. Orders are matched by price-time priority: best price first, then earliest arrival time at that price.\n\n**Step 5 — Confirmation:**\nOnce matched, both sides receive execution reports. **Settlement** — the actual transfer of shares and cash — occurs on **T+1** (one business day later) in the U.S. since May 2024.\n\n**Key metric: Fill rate and price improvement**\nA market order for a liquid stock should fill instantly (sub-millisecond). Price improvement means the execution price was better than the NBBO at the time of routing.",
          highlight: [
            "Smart Order Router",
            "Payment for Order Flow",
            "PFOF",
            "CLOB",
            "price-time priority",
            "T+1",
            "price improvement",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Regulation NMS guarantees that your market order will always execute at the exact NBBO price you see on your screen.",
          correct: false,
          explanation:
            "Regulation NMS requires brokers to seek best execution and route to the NBBO venue, but the NBBO is a constantly moving target. Between the moment you click 'buy' and when your order reaches the exchange (typically 1-5 milliseconds for retail), prices can change. This is called **latency arbitrage** — the NBBO you saw may already be stale. Additionally, if the displayed size at the best ask is smaller than your order, you may receive partial fills at multiple price levels above the original ask. Reg NMS guarantees best-effort routing, not a frozen price.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are researching a small-cap biotech stock priced at $8.50 with daily volume of 50,000 shares. The bid is $8.20 and the ask is $8.80. You want to buy 5,000 shares (10% of average daily volume).",
          question:
            "What is the primary execution risk you face, and what order type would best mitigate it?",
          options: [
            "The wide $0.60 spread (7.1% of price) combined with your order size exceeding displayed liquidity means a market order could cause severe slippage — a limit order near the ask would cap your price while risking non-execution",
            "The stock is too cheap to be worth trading; you should wait until it reaches $20",
            "A market order is always safer than a limit order in volatile stocks because it guarantees execution",
            "You should route to the NYSE only because it has the tightest spreads for all stocks",
          ],
          correctIndex: 0,
          explanation:
            "This scenario illustrates three compounding problems. First, the spread alone ($0.60 / $8.50 = 7.1%) is an enormous implicit cost. Second, your 5,000-share order is 10% of daily volume — far larger than what's displayed at the best ask. A market order would 'walk the book,' filling first at $8.80, then at $8.85, $8.90, etc. as you exhaust each price level, causing significant slippage. Third, large orders in thin markets telegraph your intent to other participants who may front-run. A limit order at or near the ask caps your price but risks non-execution if the stock moves away.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Order Types Deep Dive
       ================================================================ */
    {
      id: "micro-2",
      title: "Order Types Deep Dive",
      description:
        "Market, limit, stop, stop-limit, trailing stop, FOK, and GTC orders explained with real trade scenarios",
      icon: "ListOrdered",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "The Four Foundational Order Types",
          content:
            "Every advanced order type is a variation of four foundational types:\n\n**1. Market Order**\nExecutes immediately at the best available price. Guarantees execution, not price.\n- Use when: speed matters more than price (urgent entry/exit, highly liquid stocks)\n- Risk: slippage in fast markets or thin stocks\n- Rule of thumb: only use market orders on stocks trading >1M shares/day\n\n**2. Limit Order**\nExecutes only at your specified price or better. Guarantees price, not execution.\n- Buy limit: executes at the limit price or lower\n- Sell limit: executes at the limit price or higher\n- Use when: you have a specific price in mind and can wait\n- Risk: may not fill if price never reaches your limit\n\n**3. Stop Order (Stop-Market)**\nInactive until price reaches the stop trigger price, then converts to a market order.\n- Buy stop: triggers above current price (used for breakout entries)\n- Sell stop: triggers below current price (most common use: stop-loss)\n- Risk: in a fast-moving market, execution price may be far below trigger (gap risk)\n\n**4. Stop-Limit Order**\nConverts to a limit order (not market) when the stop is triggered.\n- More control than a stop-market, but introduces non-execution risk\n- During flash crashes or overnight gaps, the stock may blow through your limit without filling",
          highlight: [
            "market order",
            "limit order",
            "stop order",
            "stop-limit",
            "slippage",
            "gap risk",
          ],
        },
        {
          type: "teach",
          title: "Advanced Order Types: Trailing Stop, FOK, GTC",
          content:
            "**Trailing Stop:**\nA dynamic stop-loss that moves with the price in your favor but locks in when the price reverses.\n\nExample: You buy at $50, set a trailing stop of $3. As stock rises to $60, your stop auto-adjusts to $57 (never lower). If stock drops to $57, you're automatically stopped out with a $7 gain per share.\n\nTrailing stops can be set as a fixed dollar amount or a percentage. A 10% trailing stop on a $100 stock triggers at $90, and if the stock rises to $120, the stop adjusts to $108.\n\n**Fill-or-Kill (FOK):**\nThe entire order must fill immediately and completely — if the exchange cannot fill all shares at once, the entire order is cancelled. Used by institutions that cannot afford partial fills in strategy-sensitive situations.\n\n**Good Till Cancelled (GTC):**\nOrder remains active across trading sessions until it fills or you cancel it. Most brokers automatically cancel GTC orders after 30-90 days. Important: a GTC order placed before earnings could execute during a post-announcement gap at a very different price than intended.\n\n**Immediate or Cancel (IOC):**\nFill whatever quantity is available immediately; cancel any remainder. A softer version of FOK.\n\n**Day Order:**\nDefault for most brokers — cancelled automatically at market close if unfilled.",
          highlight: [
            "trailing stop",
            "fill-or-kill",
            "FOK",
            "good till cancelled",
            "GTC",
            "immediate or cancel",
            "IOC",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "You own 200 shares of a stock currently at $80. You want to protect gains if the stock drops 8%, but you want to continue participating in upside. Which order best achieves this?",
          options: [
            "A trailing stop set at 8% below the current market price, which will auto-adjust upward as the stock rises",
            "A sell limit at $80 × 1.08 = $86.40",
            "A sell stop-limit with stop at $73.60 and limit at $70",
            "A fill-or-kill order at $80",
          ],
          correctIndex: 0,
          explanation:
            "A trailing stop of 8% placed when the stock is at $80 sets an initial trigger at $73.60 ($80 × 0.92). If the stock rises to $100, the trailing stop adjusts to $92 ($100 × 0.92), locking in gains while allowing continued upside participation. A sell limit at $86.40 would exit your position if the stock rises above $86.40 — opposite of what you want. A stop-limit introduces non-execution risk during a fast drop. FOK is for immediate execution only and has no protective function here.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A stop-loss set as a stop-market order guarantees you will exit a position at exactly the stop price.",
          correct: false,
          explanation:
            "A stop-market order guarantees execution but not the execution price. When the stop triggers, the order converts to a market order and executes at the best available price at that moment. If a stock is at $50 and you have a stop at $48, but the stock gaps down overnight to $42 on bad news, your stop triggers at $48 but you execute at $42 — an $8 difference from your intended exit. This is called **gap risk** and is why professionals use small position sizes rather than relying solely on stops for risk management.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are planning to enter a breakout trade. Stock ABC has been consolidating at $95-$97 for three weeks. You believe a break above $97.50 confirms a bullish breakout and want to enter if and only if the breakout happens, with a stop at $95.",
          question:
            "Which order combination correctly implements this strategy?",
          options: [
            "A buy stop at $97.50 (triggers entry on breakout) combined with a sell stop at $95 (triggers exit if the trade fails)",
            "A buy limit at $97.50 (buys if stock drops to $97.50) and a sell limit at $95",
            "A market order now at $96 so you are positioned before the breakout",
            "A sell stop at $97.50 to short the stock and profit if the breakout fails",
          ],
          correctIndex: 0,
          explanation:
            "A buy stop placed above the current price triggers when the stock trades at or above $97.50, confirming the breakout and entering you into the position — this is a classic breakout entry technique. Once filled, the sell stop at $95 acts as your stop-loss; if the breakout reverses back below $95, you exit automatically. A buy limit at $97.50 would only execute if the stock drops to $97.50 or lower — the opposite behavior. Buying now at $96 means you pay the spread cost without confirmation and face the full consolidation range as downside. A sell stop at $97.50 would initiate a short position, betting against the breakout.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "An institution needs to buy exactly 50,000 shares of a stock for a strategy that requires the full position to be established simultaneously. Which order type is specifically designed for this requirement?",
          options: [
            "Fill-or-Kill (FOK) — the entire 50,000 shares must fill immediately or the order is cancelled entirely",
            "Good-Till-Cancelled (GTC) — the order stays open until all 50,000 shares are accumulated over days",
            "A trailing stop buy order set 2% above the current market price",
            "A day order market buy — it will fill all 50,000 shares at once automatically",
          ],
          correctIndex: 0,
          explanation:
            "Fill-or-Kill requires complete and immediate execution — if the exchange cannot fill all 50,000 shares simultaneously, the entire order is cancelled. This matters for strategies like pair trades or arbitrage where partial fills would leave unhedged exposure. GTC would accumulate shares over time, creating a half-built position with risk. A market day order for 50,000 shares might fill in multiple tranches across seconds or minutes at different prices, not 'simultaneously.' The key is that FOK treats the order as all-or-nothing.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Price Discovery
       ================================================================ */
    {
      id: "micro-3",
      title: "Price Discovery",
      description:
        "How news moves prices, order book dynamics, information asymmetry, and HFT basics",
      icon: "Search",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "The Order Book and Price Formation",
          content:
            "The **Central Limit Order Book (CLOB)** is the live ledger of all resting limit orders on an exchange. Understanding it reveals how prices form:\n\n**Order book structure:**\n```\nAsk side (sellers, ascending price)\n  Ask $50.05 — 2,400 shares\n  Ask $50.04 — 1,200 shares\n  Ask $50.03 — 800 shares  ← best ask\n  ──── SPREAD ────\n  Bid $50.02 — 600 shares  ← best bid\n  Bid $50.01 — 3,100 shares\n  Bid $50.00 — 8,500 shares\nBid side (buyers, descending price)\n```\n\n**How price moves:**\n1. A large market buy arrives — it sweeps all 800 shares at $50.03, then fills at $50.04\n2. New best ask is $50.04; price has risen by $0.01\n3. The 'last trade price' is now $50.04\n\n**Order book imbalance:**\nThe ratio of bid depth to ask depth signals near-term price pressure.\n- Bid depth >> ask depth: buyers dominate, price likely to rise\n- Ask depth >> bid depth: sellers dominate, price likely to fall\n\nProfessional traders monitor **Level 2 data** (the full order book) rather than just Level 1 (best bid/ask) to gauge imbalance. The bid/ask ratio across 5 price levels is a real-time sentiment indicator.",
          highlight: [
            "CLOB",
            "order book",
            "Level 2",
            "order book imbalance",
            "bid depth",
            "ask depth",
          ],
        },
        {
          type: "teach",
          title: "How News Moves Prices: Information Cascade",
          content:
            "Prices change because new information changes the consensus fair value estimate. The process follows a predictable pattern:\n\n**Phase 1 — Pre-announcement (minutes to hours before):**\nOptions implied volatility rises as informed traders position. Unusual call or put activity can signal information leakage. Block trades appear in dark pools.\n\n**Phase 2 — Information release:**\nEarnings beat / Fed rate change / FDA approval is published. HFT systems parse the release in microseconds via natural language processing.\n\n**Phase 3 — Price jump (0-500 milliseconds):**\nHFT market makers immediately widen spreads (self-protection) and cancel stale quotes. Algorithmic traders execute directional orders. Price moves 2-15% in the first second.\n\n**Phase 4 — Human interpretation (1-60 seconds):**\nHuman traders and slower algorithms read the news and place orders. This wave continues the move or partially reverses Phase 3.\n\n**Phase 5 — Absorption and mean reversion (minutes to hours):**\nInitial overreaction (common with news) partially reverses as the market debates magnitude. Studies show approximately 40% of post-earnings moves reverse within 48 hours.\n\n**Key insight**: By the time you read news on CNBC or Twitter, HFT systems processed it 500 milliseconds earlier. Retail traders are never first — the edge comes from interpreting second-order effects, not reacting to the initial move.",
          highlight: [
            "information cascade",
            "implied volatility",
            "HFT",
            "overreaction",
            "mean reversion",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A company reports earnings that beat estimates by 15%. The stock initially spikes 8% in the first minute of trading, then gives back 4% over the next 20 minutes before settling at +4%. This behavior is best described as:",
          options: [
            "Initial overreaction driven by algorithmic buying, followed by partial mean reversion as human traders assess the quality of the beat",
            "Market manipulation — the stock should trade at exactly +15% to match the earnings beat",
            "Evidence that the market is perfectly efficient because the final +4% reflects the true fair value",
            "A bear trap — the stock will fall to its pre-announcement price within a week",
          ],
          correctIndex: 0,
          explanation:
            "Post-announcement price discovery is rarely immediate or smooth. The initial 8% spike reflects fast algorithmic reaction to the headline beat — systems buy first, analyze later. As human traders read the full earnings release, they often find nuances (narrowing margins, guidance below expectations, one-time items boosting the beat) that moderate enthusiasm. Academic research (Chan 2003, Jegadeesh 2009) consistently shows that roughly 40-50% of initial post-earnings moves are partially reversed within 48-72 hours. The +4% final settlement reflects the market's more considered consensus after the information cascade completes.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Front-Running and Information Asymmetry",
          content:
            "**Information asymmetry** — when some market participants know more than others — is the fundamental driver of price discovery, but it also creates ethical and legal minefields.\n\n**Legal information advantages:**\n- Superior analysis of public information (quantitative models, better financial models)\n- Speed advantage (co-location servers near exchange matching engines)\n- Real-time satellite data (parking lot counts at retailers, shipping traffic)\n- Alternative data (credit card transaction data, app download metrics)\n\n**Illegal front-running:**\n- A broker who sees a large client order coming and trades ahead of it to profit from the price impact\n- The SAC Capital case (2013): paid $1.8 billion for trading on material non-public information\n- The Galleon Group case (2011): Raj Rajaratnam convicted for a $63.8M insider trading scheme using tips from corporate insiders\n\n**Legal latency arbitrage (controversial):**\n- HFT firms co-locate servers within 100 feet of exchange matching engines\n- They use microwave towers instead of fiber optic cables to shave microseconds off data transmission\n- They detect large buy orders beginning to execute and buy ahead of the remaining portions\n- Michael Lewis's 'Flash Boys' (2014) brought this practice to mainstream attention\n- The SEC has generally not ruled pure latency arbitrage illegal",
          highlight: [
            "information asymmetry",
            "front-running",
            "co-location",
            "latency arbitrage",
            "insider trading",
            "alternative data",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "High-frequency trading firms that use co-location and microwave networks to trade ahead of slower market participants are engaging in illegal front-running.",
          correct: false,
          explanation:
            "The SEC has consistently distinguished between illegal front-running and legal latency arbitrage. Illegal front-running involves a broker acting on knowledge of a specific pending client order — a fiduciary violation. HFT latency arbitrage, while controversial, involves firms using technology to detect patterns in publicly available market data (order flow signals, bid-ask changes) that statistically predict short-term price movements. They do not know about specific orders — they infer from public signals. The SEC has stated that speed advantages derived from technology investments are legal. Michael Lewis's 'Flash Boys' (2014) popularized the controversy, and the IEX exchange was created specifically to neutralize this advantage with a 350-microsecond speed bump.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You notice that every time a specific stock's Level 2 order book shows more than 50,000 shares stacked at a price level just below the current bid, the stock tends to bounce. Today you see 80,000 shares stacked at $30.00 and the current price is $30.15.",
          question:
            "What does this order book feature represent, and what should you be cautious about?",
          options: [
            "This is a 'support wall' indicating significant buy interest at $30.00, but it may be a spoofing tactic — large orders placed to create the illusion of support and then cancelled before execution",
            "This proves the stock will definitely bounce from $30.00; you should buy immediately with maximum position size",
            "Order book data is too complex for retail traders and should be ignored entirely",
            "The stacked orders represent insider buying and guarantee a price increase",
          ],
          correctIndex: 0,
          explanation:
            "Large order stacks in the order book can represent genuine support (real buyers willing to buy at $30.00), but they can also be **spoofing** — placing large orders with no intention of executing them, purely to influence other traders' behavior. Spoofing was declared illegal under the Dodd-Frank Act (2010), and several HFT firms have been prosecuted. The key risk: if the large orders are fake, the moment price approaches $30.00, they disappear — and the selling pressure that caused the drop continues unimpeded. Smart traders watch whether large orders actually absorb selling or vanish on approach.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Market Impact
       ================================================================ */
    {
      id: "micro-4",
      title: "Market Impact",
      description:
        "Slippage, market impact models, optimal execution algorithms, and VWAP/TWAP strategies",
      icon: "TrendingDown",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "Slippage and Market Impact",
          content:
            "**Slippage** is the difference between the expected price of a trade and the actual execution price. It has two components:\n\n**1. Bid-ask spread slippage:**\nThe cost of crossing the spread. Every market order pays half the spread (or the full spread on a round trip). On a $100 stock with a $0.05 spread, you lose $0.025 per share on entry.\n\n**2. Market impact slippage:**\nYour own order moves the price against you. As you buy, you exhaust sell orders and push the ask higher. The larger your order relative to available liquidity, the worse your average fill price.\n\n**The square-root market impact model:**\nEstimated impact (%) ≈ σ × √(Q / V)\nWhere:\n- σ = daily volatility of the stock\n- Q = quantity you are trading\n- V = average daily volume\n\n**Example:**\nStock: daily vol 2%, average daily volume 1,000,000 shares\nYour order: 50,000 shares (5% of ADV)\nImpact ≈ 2% × √(50,000 / 1,000,000) = 2% × 0.224 = **0.45%**\n\nOn a $100 stock with 50,000 shares, that is $22,500 in market impact cost — before commissions.\n\n**Implementation shortfall:**\nThe total cost of trading = market impact + timing risk + explicit costs (commissions, fees). Professional desks measure every trade against this benchmark.",
          highlight: [
            "slippage",
            "market impact",
            "implementation shortfall",
            "average daily volume",
            "square-root model",
          ],
        },
        {
          type: "teach",
          title: "VWAP and TWAP Execution Algorithms",
          content:
            "Large institutions use algorithmic execution strategies to minimize market impact by spreading orders over time:\n\n**VWAP — Volume-Weighted Average Price:**\nThe VWAP algorithm slices a large order into small child orders and executes them proportional to the market's volume pattern throughout the day.\n\n- Volume is typically highest at open (9:30-10:00 ET) and close (3:30-4:00 ET), lowest midday\n- A VWAP algo participates more heavily when volume is high (spread is narrower, impact is diluted)\n- The benchmark: if your average fill equals the day's VWAP, you executed perfectly\n- Used as a performance benchmark in institutional trading agreements\n\n**TWAP — Time-Weighted Average Price:**\nSplits the order into equal-sized slices executed at regular time intervals throughout the day.\n\n- Simpler than VWAP but ignores volume patterns\n- Preferred when stealth matters more than cost optimization — the predictable pace makes it harder to detect\n- A 9-hour trading day with a 100,000-share order might execute 11,111 shares per hour\n\n**POV — Percentage of Volume:**\nParticipates at a fixed % of market volume (e.g., 10% of every trade). This keeps market impact constant throughout the day but results in unpredictable total execution time.\n\n**Choosing the right algo:**\n- Urgent: increase participation rate (accept higher impact for faster execution)\n- Patient: lower participation rate or TWAP (minimize impact, accept timing risk)",
          highlight: [
            "VWAP",
            "TWAP",
            "POV",
            "child orders",
            "participation rate",
            "timing risk",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A mutual fund needs to buy $50 million worth of a mid-cap stock over the course of one trading day. The stock's average daily volume is $80 million. Which execution approach minimizes market impact?",
          options: [
            "A VWAP algorithm that participates proportionally to volume — executing more shares during the high-volume open and close, less during quiet midday periods",
            "One large market order at 9:30 AM when volume is highest to get all shares at once",
            "A single limit order at the current ask price left open all day as a GTC order",
            "Wait until 3:59 PM and buy all $50M in the last minute using a market order",
          ],
          correctIndex: 0,
          explanation:
            "The VWAP algorithm is the institutional standard for large executions precisely because it minimizes market impact by spreading the order over the full day and participating proportionally during natural volume surges. A single $50M market order at the open would move a $80M/day stock dramatically — likely 3-8% of slippage on a single fill. A GTC limit order at the ask might not fill at all if the stock drifts up. Concentrating $50M in the last minute at 3:59 is even worse — close-auction volume can be high but the gap between $50M buy pressure and available sellers would be enormous. The fund is already buying 62.5% of daily volume ($50M/$80M) — minimizing impact requires the entire day.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A hedge fund that consistently executes trades at prices better than the day's VWAP has a superior execution desk that is adding alpha to the fund's performance.",
          correct: true,
          explanation:
            "Executing consistently better than VWAP is genuinely valuable alpha in institutional trading. A fund managing $5 billion that shaves 5 basis points off execution costs annually generates $2.5 million in saved costs — pure performance improvement without any additional market risk. Top execution desks at firms like Goldman Sachs, Morgan Stanley, and Renaissance Technologies treat execution as a profit center, not just an overhead cost. Studies by Kissell & Malamut (2005) estimated that systematic VWAP outperformance by 10 basis points across a $10B fund could add $10M in annual returns — comparable to a successful long/short position.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You manage a $2 million trading account and want to buy 10,000 shares of a stock trading at $50 (position value: $500,000 = 25% of your account). The stock has an average daily volume of 200,000 shares and a daily volatility of 2.5%. Using the square-root market impact model: impact ≈ σ × √(Q/V).",
          question:
            "What is the estimated market impact cost, and what does this imply about your execution strategy?",
          options: [
            "Impact ≈ 2.5% × √(10,000/200,000) = 2.5% × 0.224 ≈ 0.56%; on 10,000 shares at $50 that is ~$2,800 — suggesting you should use a VWAP algo or spread execution over 2-3 days",
            "Impact is zero because you are using a limit order",
            "Impact ≈ 25% because your order is 25% of your account size",
            "The model does not apply to orders under 1 million shares",
          ],
          correctIndex: 0,
          explanation:
            "Plugging into the model: σ = 2.5%, Q = 10,000, V = 200,000. Impact = 2.5% × √(10,000/200,000) = 2.5% × √0.05 = 2.5% × 0.224 = 0.56%. On 10,000 shares at $50 = $500,000 position, that is $2,800 in market impact — before commissions. Your order represents 5% of average daily volume, which is significant. A smart approach: use a VWAP algorithm, or split execution across 2-3 days (reducing Q to 3,333-5,000 shares per day), lowering impact to 0.18-0.35% per day. This is standard institutional thinking — the cost of execution must be weighed against the expected edge from the trade.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Dark Pools and Institutional Trading
       ================================================================ */
    {
      id: "micro-5",
      title: "Dark Pools and Institutional Trading",
      description:
        "What dark pools are, how ATS venues work, block trades, and why institutions avoid lit markets",
      icon: "EyeOff",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "What Are Dark Pools?",
          content:
            "**Dark pools** are private trading venues — officially called Alternative Trading Systems (ATS) — where trades occur without pre-trade transparency. Orders are not displayed in the public order book; they execute invisibly.\n\n**Why they exist:**\nThe fundamental problem for large institutions: if Goldman Sachs needs to buy 2 million shares of Amazon, placing that order on a lit exchange broadcasts their intention to every HFT firm on the planet. HFT algos would immediately front-run — buying ahead of Goldman and selling back to them at higher prices. The dark pool solves this by hiding order intent until after execution.\n\n**Scale:**\nApproximately 35-40% of all U.S. equity volume trades in dark pools, according to FINRA reports. Over 40 dark pools operate in the U.S., run by major banks, broker-dealers, and independent operators.\n\n**Major dark pools:**\n- **Goldman Sachs Sigma X** — largest bank-operated dark pool\n- **Morgan Stanley MS POOL**\n- **Liquidnet** — specialist in institutional block trades, matches large buy and sell interests directly\n- **IEX** — designed as a 'fair' exchange with a 350-microsecond speed bump to neutralize HFT advantage (technically a lit exchange but with dark-pool-like protections)\n- **BATS BZX** — operates both lit and dark order types\n\n**Price reference:**\nDark pools typically price trades at the midpoint of the NBBO, splitting the spread equally between buyer and seller. Neither party pays the full spread — a significant cost saving on large trades.",
          highlight: [
            "dark pool",
            "ATS",
            "pre-trade transparency",
            "front-running",
            "Sigma X",
            "Liquidnet",
            "NBBO midpoint",
          ],
        },
        {
          type: "teach",
          title: "Block Trades and Crossing Networks",
          content:
            "**Block trades** are large transactions — traditionally defined as 10,000+ shares or $200,000+ in value — that require special handling to avoid market impact.\n\n**Three mechanisms for block execution:**\n\n**1. Upstairs market (dark pool negotiation):**\nThe broker's block desk finds a counterparty willing to take the other side of the entire block at a negotiated price. Transaction reported to tape after completion. No market impact during negotiation.\n\n**2. Crossing networks (Liquidnet model):**\nInstitutional buy-side orders are entered into an electronic matching network. When two opposing orders overlap in size and price, they are crossed at the NBBO midpoint. Completely anonymous until match.\n\n**3. Agency algorithmic execution:**\nIf no counterparty exists for the full block, the algo breaks it into smaller pieces executed on dark pools and lit markets over time. This is the VWAP/TWAP approach described in the previous lesson.\n\n**What retail traders can learn from block flow:**\n- **Dark pool print data** (available from services like Unusual Whales or FINRA ATS data) shows where large trades occurred\n- Repeated dark pool prints at the same price level suggest institutional accumulation or distribution\n- A stock trading 3× its average volume with 70% in dark pools suggests a major institution is quietly building or unwinding a position\n- This does not tell you the direction (accumulation vs. distribution), but price trend + dark pool activity can be powerful confluence signals",
          highlight: [
            "block trade",
            "crossing network",
            "upstairs market",
            "dark pool print",
            "accumulation",
            "distribution",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A pension fund wants to sell 1.5 million shares of a stock that trades an average of 800,000 shares per day. They use a dark pool crossing network. What is the primary benefit compared to using a lit exchange?",
          options: [
            "Their order is not visible to other market participants before execution, preventing HFT front-running that would push the price down as they sell 1.87 days of average volume",
            "Dark pools guarantee a higher price than the lit exchange because they are regulated differently",
            "They can trade outside of NYSE market hours, even on weekends",
            "Their trade will not count toward the reported volume, keeping the transaction completely secret permanently",
          ],
          correctIndex: 0,
          explanation:
            "The pension fund's problem is size: selling 1.5M shares = 1.87 days of average volume. On a lit exchange, their sell order would be visible in real time to HFT systems that would immediately begin shorting the stock ahead of them, driving the price down before the pension fund's own sells execute — a self-fulfilling impact. In a dark pool, the order is invisible until matched or executed. The price is typically the NBBO midpoint at time of crossing, not guaranteed to be higher. Dark pools do not allow weekend trading — they operate only during market hours. And post-trade reporting to FINRA is still required, typically within 10 seconds of execution, so the trade does become public record.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Retail investors can use dark pool data to gain insight into potential institutional accumulation or distribution in a stock.",
          correct: true,
          explanation:
            "FINRA requires dark pool trades to be reported to the FINRA Trade Reporting Facility (TRF) within 10 seconds. This data is aggregated and published daily by FINRA's ATS Transparency Data portal, showing volume by venue for each ticker. Third-party services like Unusual Whales, Quant Data, and Cheddar Flow parse this data into actionable formats. Patterns like: (1) sustained dark pool volume 2-3× normal over 10+ days, (2) dark pool prints clustering at a specific price level, or (3) dark pool activity increasing while price is flat (accumulation before a move), are all signals that institutional traders monitor. This does not guarantee directional insight — institutions distribute too — but combined with price action it adds meaningful context.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A data service shows that a stock has traded the following pattern over 5 days: total volume 3× normal average, dark pool percentage rising from 30% to 65% of total volume, while the stock price barely moved (range: $48.50 to $49.20). On day 6, the stock gaps up 7% on an analyst upgrade.",
          question:
            "How would a market microstructure analyst interpret the 5-day dark pool pattern before the gap?",
          options: [
            "The rising dark pool percentage combined with elevated volume and price stability suggests institutional accumulation — a large buyer was absorbing selling pressure invisibly, suppressing price until their position was complete",
            "The data proves that the analyst who upgraded the stock had inside information and front-ran the upgrade",
            "Dark pool volume means the stock is being manipulated and should be avoided by retail traders",
            "The pattern is random; dark pool percentages have no predictive value for future price moves",
          ],
          correctIndex: 0,
          explanation:
            "This pattern is a textbook institutional accumulation signature: (1) volume 3× normal shows unusual interest; (2) dark pool % rising to 65% means a large participant is deliberately concealing their activity; (3) price barely moving despite heavy volume suggests a buyer is absorbing all selling ('pinning' the price), preventing a markup that would attract front-runners or raise their own average cost. Day 6's gap on the analyst upgrade could reflect genuine coincidence (the analyst's model reached conviction independently) or that the institution had non-public information about the pending upgrade — the latter would be illegal. From a microstructure perspective, the pre-gap dark pool pattern suggested informed buying, even if the trading was legal.",
          difficulty: 3,
        },
      ],
    },
  ],
};
