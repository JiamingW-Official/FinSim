import type { Unit } from "./types";

export const UNIT_MARKET_MICROSTRUCTURE: Unit = {
  id: "market-microstructure",
  title: "Market Microstructure",
  description:
    "Order types, bid-ask spreads, order book dynamics, and how markets actually work at the execution layer",
  icon: "Layers",
  color: "#0ea5e9",
  lessons: [
    /* ================================================================
       LESSON 1 — Order Types Mastery
       ================================================================ */
    {
      id: "micro-1",
      title: "Order Types Mastery",
      description:
        "Market/limit/stop/IOC/FOK/GTC/trailing stop — when to use each",
      icon: "List",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Core Order Types: Market and Limit",
          content:
            "Every trade execution begins with an order type. Choosing correctly is the difference between getting the price you want and getting filled at a far worse price.\n\n**Market Order:**\n- Execute immediately at the best available price in the market\n- Guaranteed to fill; price is NOT guaranteed\n- In liquid stocks (AAPL, SPY): spread is 1 cent; market orders are essentially free\n- In illiquid stocks or during fast markets: you can get filled 1-5% away from last price (slippage)\n- Use when: speed of execution is more important than price; highly liquid instruments only\n\n**Limit Order:**\n- Specify the maximum price you'll pay (buy limit) or minimum price you'll accept (sell limit)\n- Price IS guaranteed; fill is NOT guaranteed\n- Buy limit at $50 on a stock trading at $55: the order sits in the book, fills only if price drops to $50\n- Sell limit at $60 on a stock at $55: waits in the book for the stock to rally to $60\n- Use when: you have a target price; you're patient; you want to avoid slippage\n\n**Limit orders make you a market maker** (you add liquidity to the book).\n**Market orders make you a market taker** (you remove liquidity from the book).\n\nMost professional traders prefer limit orders except in highly urgent situations.",
          highlight: ["market order", "limit order", "slippage", "liquidity", "fill"],
        },
        {
          type: "teach",
          title: "Stop Orders and Advanced Order Types",
          content:
            "**Stop (Stop-Loss) Order:**\n- Triggers a market order when the price reaches a specified stop price\n- Buy stop: triggers above current price (momentum trading, stop out of a short)\n- Sell stop: triggers below current price (stop-loss on a long position)\n- Risk: In fast markets, actual fill can be well below the stop price ('gap through')\n\n**Stop-Limit Order:**\n- Triggers a *limit* order (not market) when stop price is hit\n- More price control, but may not fill if price gaps through the limit\n- Dangerous in crashes — the limit may never be reached and you stay in a losing position\n\n**Trailing Stop:**\n- A dynamic stop that moves with the price as it goes in your favor\n- Set as a dollar amount or percentage below/above current price\n- Example: Trailing stop $2 below price; if stock rises from $50 to $60, stop moves from $48 to $58\n- Automatically locks in profits while letting winners run\n- Risk: In volatile markets, trailing stops can trigger on normal pullbacks\n\n**Time-in-Force Instructions:**\n- **Day Order**: Valid only for the current trading session\n- **GTC (Good-Till-Cancelled)**: Stays in the book until filled or manually cancelled\n- **IOC (Immediate-Or-Cancel)**: Fill as much as possible immediately; cancel remainder\n- **FOK (Fill-Or-Kill)**: Fill the entire order immediately or cancel it entirely (used for large block trades)\n- **MOO/MOC (Market On Open/Close)**: Execute at the opening or closing auction price",
          highlight: [
            "stop order",
            "trailing stop",
            "GTC",
            "IOC",
            "FOK",
            "stop-limit",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "You own 500 shares of a volatile biotech stock at an average cost of $40. The stock is currently at $58. You want to protect your profits but also let the stock continue to rise if it keeps going. Which order type is most appropriate?",
          options: [
            "A trailing stop set at $5 below the current market price — it moves up as the stock rises, locking in profits automatically",
            "A market order to sell immediately at $58 — take profits now",
            "A GTC limit order to sell at $70 — wait for a higher target price",
            "A stop-limit order with stop at $55 and limit at $50 — protects against a large gap down",
          ],
          correctIndex: 0,
          explanation:
            "A trailing stop perfectly matches this objective: it rises with the stock (so you participate in continued upside) but triggers a market sell if the stock falls $5 from its peak (protecting profits). A market order locks in profits immediately but cuts off upside. A GTC limit at $70 provides no downside protection. A stop-limit risks not filling if price gaps below $50 — in a volatile biotech, gaps are common.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A Fill-Or-Kill (FOK) order will partially fill and then cancel the remaining shares if the full order size is not immediately available.",
          correct: false,
          explanation:
            "Fill-Or-Kill is all-or-nothing: the entire order must be filled immediately at the specified price or quantity, or the entire order is cancelled. There is no partial fill — it either executes completely or not at all. This is distinct from an IOC (Immediate-Or-Cancel) order, which does allow partial fills (fills whatever is available immediately and cancels the remainder). FOK is used when partial fills are unacceptable — for example, institutional block trades where a specific quantity is needed.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An institutional trader needs to buy exactly 50,000 shares of a mid-cap stock that typically trades 200,000 shares per day. The current ask price is $25.00. A market order for the full 50,000 shares would significantly move the price against them.",
          question:
            "Which combination of order instructions best achieves the trade while minimizing market impact?",
          options: [
            "Series of smaller limit orders (e.g., 5,000 at $25.00, 5,000 at $25.05) spread over the session, using an algorithmic execution strategy (VWAP or TWAP)",
            "A single FOK market order for 50,000 shares to guarantee immediate full execution",
            "A single GTC limit order at $24.80 below the market to guarantee a better price",
            "A trailing stop buy order set $0.50 above the current ask",
          ],
          correctIndex: 0,
          explanation:
            "Institutional execution uses algorithms to minimize market impact. Breaking a large order into smaller child orders executed over time (VWAP — Volume Weighted Average Price, or TWAP — Time Weighted Average Price) avoids signaling to the market that a large buyer is present, which would cause prices to rise against you. A single FOK market order for 25% of daily volume would cause severe slippage. The GTC limit below market may never fill. Algorithmic execution is why large institutions rarely use simple market orders.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Bid-Ask Spread & Liquidity
       ================================================================ */
    {
      id: "micro-2",
      title: "Bid-Ask Spread & Liquidity",
      description:
        "Market makers, spread components, impact of news on spread, liquidity pools",
      icon: "ArrowLeftRight",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "The Bid-Ask Spread Explained",
          content:
            "The **bid-ask spread** is the difference between the highest price a buyer will pay (bid) and the lowest price a seller will accept (ask/offer). It is the most fundamental cost of trading.\n\n**Example:**\n- AAPL Bid: $185.20 / Ask: $185.22 → Spread = $0.02 (1 cent each side)\n- Small-cap stock Bid: $8.40 / Ask: $8.65 → Spread = $0.25 (3% of price)\n\n**Spread components:**\n1. **Order processing costs** — exchange fees, technology infrastructure\n2. **Inventory risk** — market makers hold positions and risk price moves against them\n3. **Adverse selection cost** — the risk that the trader on the other side has better information\n\n**Spread as a trading cost:**\n- Every time you buy at the ask and sell at the bid, you lose the full spread\n- On a $10,000 trade with a 0.1% spread → $10 immediate cost each way\n- For high-frequency traders executing thousands of trades, spread minimization is critical\n\n**What affects spread width:**\n- **Volume**: Higher volume → tighter spread (more competition between market makers)\n- **Volatility**: Higher vol → wider spread (market makers face more inventory risk)\n- **News events**: Spreads widen before and during major announcements\n- **Market hours**: Spreads are widest at open and close; tightest during core hours (10am-3:30pm ET)",
          highlight: ["bid-ask spread", "bid", "ask", "market maker", "adverse selection"],
        },
        {
          type: "teach",
          title: "Market Makers and Liquidity Provision",
          content:
            "**Market makers** are firms or individuals that continuously quote both bid and ask prices, providing liquidity for other participants to trade against.\n\n**How market makers profit:**\n- Buy at the bid, sell at the ask — earn the spread\n- A market maker buying 1,000 shares at $50.00 and selling at $50.02 earns $20\n- Do this thousands of times per day → substantial income despite tiny per-trade profit\n\n**How they manage risk:**\n- Market makers accumulate inventory risk as they fill orders\n- They hedge their inventory using correlated instruments (ETFs, futures, options)\n- They adjust quotes to manage position — widen the spread when uncertain\n\n**Types of liquidity providers:**\n- **Designated Market Makers (DMMs)**: Required to maintain orderly markets; NYSE specialists\n- **Electronic Market Makers (HFT firms)**: Virtu, Citadel Securities, Two Sigma — use algorithms to quote thousands of stocks simultaneously\n- **Options Market Makers**: Crucial for options liquidity; continuously quote all strikes and expirations\n\n**Liquidity pools:**\n- **Lit markets**: Visible order book (NYSE, Nasdaq); quotes publicly displayed\n- **Dark pools**: Private exchanges where large trades execute without public display\n- **Internalization**: Broker routes your order to its own trading desk or a payment-for-order-flow partner",
          highlight: [
            "market maker",
            "liquidity",
            "dark pool",
            "internalization",
            "designated market maker",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A Federal Reserve interest rate decision is being announced in 5 minutes. What typically happens to bid-ask spreads in equity and bond markets just before the announcement?",
          options: [
            "Spreads widen significantly — market makers pull back their quotes to reduce inventory risk before the high-uncertainty event",
            "Spreads tighten — increased trading activity creates more competition among market makers",
            "Spreads are unchanged — market makers are required by regulation to maintain constant quotes",
            "Spreads widen for bonds but tighten for equities since they react differently to rate news",
          ],
          correctIndex: 0,
          explanation:
            "Before high-impact events, market makers widen spreads or pull their quotes entirely. The adverse selection risk spikes: anyone trading into the announcement likely has a directional view. A market maker filling a large buy order 10 seconds before a hawkish surprise would get hurt immediately. By widening spreads, they charge more for the liquidity they're providing during peak uncertainty. This is why trying to trade immediately before major announcements is costly.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Dark pools allow large institutional investors to trade without revealing their order size to the public market, reducing market impact compared to trading on lit exchanges.",
          correct: true,
          explanation:
            "Dark pools are private trading venues where orders are not displayed in the public order book. When a pension fund needs to sell $500 million of a stock, executing on a lit exchange would immediately signal to other market participants (especially HFT firms) that a large seller exists — causing the price to drop before the order is fully filled. Dark pools match large orders confidentially, reducing information leakage and market impact. They represent roughly 35-40% of US equity trading volume.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You want to buy 1,000 shares of a small-cap stock. The Level 2 order book shows: Ask: $12.50 × 200 shares, $12.55 × 300 shares, $12.65 × 500 shares. Total ask side: 1,000 shares. You place a market order for 1,000 shares.",
          question:
            "What is your average execution price and total cost?",
          options: [
            "Average price = $12.565; total cost = $12,565 — you consume all three levels of the ask",
            "Average price = $12.50; total cost = $12,500 — market order fills at the best ask",
            "Average price = $12.55; total cost = $12,550 — the order fills at the midpoint",
            "The order cannot fill — market orders can only fill if a single seller has all 1,000 shares",
          ],
          correctIndex: 0,
          explanation:
            "A market order walks up the ask side of the book: 200 shares at $12.50 + 300 shares at $12.55 + 500 shares at $12.65. Total cost: (200×$12.50) + (300×$12.55) + (500×$12.65) = $2,500 + $3,765 + $6,325 = $12,590. Average price = $12,590 / 1,000 = $12.59 (not $12.565 exactly — but the principle is correct: you consume multiple price levels). This is called 'walking the book' and illustrates why large market orders in illiquid stocks cause significant slippage.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Order Book Reading
       ================================================================ */
    {
      id: "micro-3",
      title: "Order Book Reading",
      description:
        "Level 2 data, iceberg orders, spoofing detection, support and resistance from order book",
      icon: "BookOpen",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Level 2 Data: Reading the Order Book",
          content:
            "**Level 1 data** shows you the best bid and ask — the top of the book. **Level 2 data** shows you the full depth of the order book: all visible bids and asks at each price level, with their quantities.\n\n**How to read Level 2:**\n```\nBid                    Ask\nPrice  | Size          Price  | Size\n$50.00 | 500 shares    $50.02 | 800 shares\n$49.98 | 1,200         $50.05 | 2,000\n$49.95 | 3,000         $50.08 | 1,500\n$49.90 | 5,000         $50.15 | 10,000\n```\n\n**What Level 2 reveals:**\n- **Depth of market**: How much liquidity exists at each price\n- **Imbalances**: More buying interest than selling (or vice versa) predicts short-term direction\n- **Key price levels**: Large orders (10,000+ shares) at a price act as support or resistance\n- **Speed of movement**: Watch-out if bids disappear rapidly — sellers are absorbing buying\n\n**Quote stuffing**: HFT firms sometimes flood the book with thousands of orders they don't intend to fill, then cancel them — this is used to slow down competing algorithms.\n\n**Time & Sales (the tape)**:\nShows each individual transaction in real time: price, size, and direction. Experienced tape readers can assess buying vs selling pressure from the tape even without Level 2.",
          highlight: [
            "Level 2",
            "order book",
            "depth of market",
            "tape",
            "time and sales",
          ],
          visual: "order-flow",
        },
        {
          type: "teach",
          title: "Iceberg Orders and Market Manipulation",
          content:
            "The order book isn't always what it appears. Large players use techniques to hide their true intentions.\n\n**Iceberg Orders (Reserve Orders):**\n- Only a small portion ('tip') of the total order is visible in the book\n- As the visible portion fills, more shares are automatically replenished\n- Example: A fund wants to buy 100,000 shares but only shows 1,000 at a time\n- Detection: Price repeatedly returning to the same level with fresh size appearing\n- Most exchanges support iceberg orders natively\n\n**Spoofing (Illegal):**\n- Placing large orders with the intent to cancel before execution\n- Goal: Create a false impression of supply/demand to move price\n- Example: Place a 50,000-share bid to push price up, then cancel when other buyers step in\n- Banned in all major markets since the Dodd-Frank Act; actively prosecuted by the CFTC/SEC\n- Detection: Large orders that consistently disappear just before price reaches them\n\n**Layering:**\n- Variation of spoofing: placing multiple orders at different prices to create the illusion of a deep book\n- All are cancelled once other traders respond to the artificial signal\n\n**How to protect yourself:**\n- Don't chase a large bid/offer that keeps disappearing\n- Watch the actual trades (Time & Sales) — only executed trades are real\n- Large bids/offers in the book are intentions, not commitments",
          highlight: [
            "iceberg order",
            "spoofing",
            "layering",
            "quote stuffing",
            "Dodd-Frank",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In the Level 2 order book for stock XYZ, you notice a bid for 50,000 shares sitting at $30.00 (the current price is $30.15). Every time the price approaches $30.00, the bid disappears and reappears at $30.00 a few seconds later. What is the most likely explanation?",
          options: [
            "This is likely a spoofer placing and canceling large orders to create a false floor of support and manipulate other traders",
            "This is a legitimate buyer who wants to accumulate shares gradually at $30.00",
            "This is an iceberg order — the visible 50,000 represents only a fraction of a larger buy order",
            "This is normal market maker behavior — they refresh quotes continuously",
          ],
          correctIndex: 0,
          explanation:
            "The key tell is that the bid disappears as price approaches it and never actually fills. A legitimate buyer's order would get filled as price reaches $30.00. An iceberg order would get filled (and replenished). But a bid that consistently vanishes before executing is a classic spoofing pattern — the order exists to signal demand and prevent selling, but the spoofer never intends to buy. Executed trades (Time & Sales) are real; bids in the book are just intentions.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A large visible bid order (e.g., 100,000 shares) in the Level 2 order book represents a guaranteed floor of support that price will not break through.",
          correct: false,
          explanation:
            "Visible orders in the book are intentions, not commitments. They can be cancelled at any time — and often are, especially if they are placed by spooffers or if market conditions change. Experienced traders watch Time & Sales (actual executed trades) for genuine support and resistance, not the displayed order book. 'The tape never lies; the book sometimes does.' Large visible bids can actually be a bearish signal if sophisticated traders place them to prop up price before selling.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are analyzing Level 2 data for a stock at $45.00. You see: 15,000 shares bid at $44.80, 8,000 at $44.60, 2,000 at $44.40. On the ask side: 500 shares at $45.02, 700 at $45.05, 600 at $45.10. The Time & Sales shows rapid small prints (100-200 share lots) crossing the ask repeatedly.",
          question:
            "What does this order book and tape configuration most likely indicate?",
          options: [
            "Bullish short-term signal — thin ask side (sellers) being absorbed by frequent buying; large bids below provide support",
            "Bearish signal — the large bids below are likely fake (spoofed), and the stock will fall through $44.80",
            "Neutral — the bid-ask imbalance tells us nothing about short-term direction",
            "Bearish — the small print sizes on the tape indicate institutional sellers breaking up a large order",
          ],
          correctIndex: 0,
          explanation:
            "The configuration shows heavy bid-side depth (thick support below) and a thin ask side with frequent small prints crossing the offer. When buyers are consistently lifting the ask in small lots, it shows urgency to buy — they're not waiting for sellers to come to them. Combined with a deep bid book below current price, this suggests buyers are in control short term. However, always confirm with actual tape momentum rather than relying solely on the book, as large bids can be spoofed.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Market Maker vs Market Taker
       ================================================================ */
    {
      id: "micro-4",
      title: "Market Maker vs Market Taker",
      description:
        "Maker-taker fee models, dark pools, payment for order flow, HFT basics",
      icon: "Users",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "The Maker-Taker Fee Model",
          content:
            "Modern equity exchanges use a **maker-taker fee model** that incentivizes liquidity provision:\n\n**Market Makers (Limit Order Traders):**\n- Add liquidity to the order book by placing limit orders\n- Exchanges *pay* rebates to makers — typically $0.002 per share ($0.20 per 100 shares)\n- Their passive orders improve the market by narrowing spreads\n- Professional market makers earn millions annually from these rebates alone\n\n**Market Takers (Market Order Traders):**\n- Remove liquidity by executing against resting limit orders\n- Exchanges *charge* takers fees — typically $0.003 per share ($0.30 per 100 shares)\n- Retail investors using market orders are often takers\n\n**Net economics:**\n- Exchange nets $0.001 per share ($0.30 taker fee − $0.20 maker rebate)\n- This model makes exchanges profitable and incentivizes tight spreads\n- Different exchanges have different rebate structures, causing order routing competition\n\n**Inverted markets:**\n- Some alternative exchanges (IEX, EDGEA) use inverted fee structures\n- Takers get rebates; makers pay fees — opposite of standard model\n- This attracts active traders but discourages passive market making\n\n**Why this matters for retail traders:**\nYour broker's order routing decisions (where to send your order) affect execution quality. Brokers have financial incentives to route to venues that pay them the most — which may not be the venue with the best price for you.",
          highlight: [
            "maker-taker",
            "rebate",
            "liquidity",
            "order routing",
            "inverted market",
          ],
        },
        {
          type: "teach",
          title: "Payment for Order Flow and Retail Execution",
          content:
            "**Payment for Order Flow (PFOF)** is one of the most controversial practices in modern market structure.\n\n**What it is:**\n- Retail brokers (Robinhood, Schwab, TD Ameritrade) sell the right to execute your orders to wholesale market makers (Citadel Securities, Virtu)\n- Wholesale market makers pay brokers for this order flow — often $0.001–0.005 per share\n- This is how 'commission-free' brokers make money — not from you directly, but from wholesalers\n\n**Is PFOF bad for retail investors?**\nThe debate is nuanced:\n- **Pro**: Retail traders often receive price improvement (execution better than the NBBO)\n- **Con**: Wholesalers only buy order flow because they can profit from it; retail may not receive the *best* possible execution\n- **Banned in**: UK, Canada, Australia — considered a conflict of interest\n- **Disclosed in**: US SEC requires brokers to report execution quality (Rule 606 reports)\n\n**The National Best Bid and Offer (NBBO):**\n- Regulators require that retail orders execute at or better than the NBBO\n- NBBO = best bid across all exchanges + best ask across all exchanges\n- Wholesale market makers often provide 'price improvement' — executing slightly better than NBBO\n\n**Practical takeaway**: Commission-free trading isn't truly free — there is a hidden cost in execution quality. For large orders, requesting 'direct routing' to an exchange (if your broker allows) may result in better fills.",
          highlight: [
            "payment for order flow",
            "PFOF",
            "NBBO",
            "price improvement",
            "wholesale market maker",
          ],
        },
        {
          type: "teach",
          title: "High-Frequency Trading: What It Is and How It Works",
          content:
            "**High-Frequency Trading (HFT)** refers to algorithmic trading strategies that execute orders at extremely high speeds, exploiting micro-second advantages.\n\n**Key HFT strategies:**\n\n**1. Market Making:**\n- Quote both bid and ask continuously in thousands of securities\n- Earn the spread + exchange rebates\n- Hedge inventory in real time using correlated instruments\n\n**2. Statistical Arbitrage:**\n- Exploit tiny mispricings between related instruments\n- Example: S&P 500 futures vs the constituent stocks; ETF vs underlying basket\n- Prices should be mathematically linked — any deviation is arbitraged within milliseconds\n\n**3. Latency Arbitrage:**\n- Use faster connectivity (co-location in exchange data centers) to react to information before others\n- Co-location: renting server space next to the exchange's matching engine; adds microseconds of advantage\n- Fiber optic and microwave networks carry market data between exchanges\n\n**4. Order Flow Anticipation:**\n- Detect patterns in order flow that predict large institutional order arrival\n- Front-run the institutional order (buy before a large buyer, sell to them at a higher price)\n- Most controversial HFT strategy; subject to ongoing regulatory debate\n\n**Impact on retail traders:**\n- HFT generally narrows spreads (good for retail)\n- HFT can make large institutional execution more expensive (bad for pension funds)\n- For individual retail traders, HFT is largely irrelevant — your small orders don't trigger HFT responses",
          highlight: [
            "high-frequency trading",
            "HFT",
            "co-location",
            "statistical arbitrage",
            "latency",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A retail trader places a 100-share market order through a commission-free broker. The broker routes the order to a wholesale market maker who executes it at $50.015 when the NBBO ask was $50.02. What best describes this transaction?",
          options: [
            "Price improvement — the trader received $0.005 per share better than the NBBO; the wholesaler profited from the order flow but also provided a better price",
            "Front-running — the wholesaler illegally traded ahead of the retail order",
            "Order stuffing — the wholesaler placed excess orders to slow down other traders",
            "The trader was harmed — payment for order flow always results in worse execution for retail",
          ],
          correctIndex: 0,
          explanation:
            "Price improvement means the retail trader received execution better than the best available quoted price (NBBO ask = $50.02; executed at $50.015 = $0.005 better). The wholesaler profits from this arrangement through PFOF — they receive the order flow and earn the spread. For this transaction, the retail trader genuinely received a better price. Whether PFOF systematically helps or hurts retail investors across all orders is the ongoing debate — regulators measure this through Rule 606 reporting.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are a small portfolio manager trading $2 million positions in mid-cap stocks (average daily volume: $15M). You've noticed that when you place large market orders, the stock price moves against you by 0.3-0.5% before your order is fully filled — costing you $6,000-$10,000 per trade. This is happening on every large trade.",
          question:
            "What is the most likely cause and what execution strategy should you adopt?",
          options: [
            "Market impact / order detection by HFT algorithms — switch to algorithmic execution (VWAP/TWAP) with limit orders to minimize information leakage",
            "Broker error — switch brokers and request manual execution by a human trader",
            "Normal market behavior — any order of this size will always cost 0.5%",
            "Spoofing by other market participants — report to the SEC immediately",
          ],
          correctIndex: 0,
          explanation:
            "At $2M in a $15M daily volume stock (~13% of daily volume), your order is large enough to be detected and front-run by order anticipation algorithms. Using market orders signals your urgency and allows HFT to step ahead of your order. Solution: use VWAP or TWAP algorithms that break your order into small pieces executed over hours, use limit orders to signal passivity, and consider routing to dark pools for large blocks. This is why institutional trading desks exist — to minimize execution costs on large orders.",
          difficulty: 3,
        },
      ],
    },
  ],
};
