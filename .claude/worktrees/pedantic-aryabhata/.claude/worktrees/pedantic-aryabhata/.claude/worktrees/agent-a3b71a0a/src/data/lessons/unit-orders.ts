import type { Unit } from "./types";
import {
  PRACTICE_MARKET_ORDER,
  PRACTICE_LIMIT_DIP,
  PRACTICE_RISK_REWARD,
  PRACTICE_SUPPORT_RESISTANCE,
} from "./practice-data";

export const UNIT_ORDERS: Unit = {
  id: "orders",
  title: "Order Mastery",
  description: "Master every order type like a pro trader",
  icon: "ClipboardList",
  color: "#3b82f6",
  lessons: [
    /* ===================================================================
       LESSON 1 — Market Orders (14 steps)
       =================================================================== */
    {
      id: "orders-1",
      title: "Market Orders",
      description: "NBBO, order routing, market impact, and execution mechanics",
      icon: "Zap",
      xpReward: 60,
      steps: [
        {
          type: "teach",
          title: "What Is a Market Order?",
          content:
            "A **market order** instructs your broker to buy or sell immediately at the best available price. It guarantees **execution** but not **price**.\n\nThe price you receive is determined by the **National Best Bid and Offer (NBBO)** -- the highest bid and lowest ask aggregated across all U.S. exchanges. Under **Reg NMS** (Regulation National Market System), brokers must route your order to the venue displaying the NBBO.",
          visual: "order-flow",
          highlight: ["market order", "NBBO", "Reg NMS"],
        },
        {
          type: "teach",
          title: "The NBBO and Price Discovery",
          content:
            "The **NBBO** is a real-time composite quote. Suppose NYSE shows a best bid of $150.02 and Nasdaq shows $150.04. The NBBO bid is $150.04 (the highest). Your market sell order must be executed at $150.04 or better.\n\n**Price improvement** occurs when your fill beats the NBBO. Wholesalers (like Citadel Securities) sometimes offer sub-penny improvement -- e.g., filling your buy at $150.049 instead of $150.05 -- to attract **Payment for Order Flow (PFOF)** arrangements from retail brokers.",
          highlight: ["NBBO", "PFOF", "price improvement"],
        },
        {
          type: "quiz-mc",
          question:
            "Under Reg NMS, what must a broker do when handling your market order?",
          options: [
            "Route it to the exchange displaying the NBBO",
            "Always send it to the NYSE",
            "Hold it until the price improves",
            "Execute it at the previous day's closing price",
          ],
          correctIndex: 0,
          explanation:
            "Reg NMS requires brokers to route orders to the venue offering the best price -- the **NBBO**. This prevents brokers from executing at inferior prices when a better quote exists on another exchange. The rule applies to all NMS-listed securities.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Payment for Order Flow (PFOF)",
          content:
            "Many retail brokers (including commission-free platforms) route your market orders to **wholesale market makers** in exchange for a per-share rebate -- this is **Payment for Order Flow**.\n\nThe wholesaler profits from the **bid-ask spread** while typically providing slight price improvement over the NBBO. Critics argue PFOF creates a conflict of interest: your broker may prioritize rebate revenue over best execution. The SEC has proposed reforms requiring more transparent execution quality reporting.",
          highlight: ["PFOF", "wholesale market maker"],
        },
        {
          type: "quiz-tf",
          statement:
            "Payment for Order Flow means brokers always get worse execution for their clients.",
          correct: false,
          explanation:
            "PFOF is more nuanced. Wholesalers often provide **price improvement** over the NBBO, meaning retail investors sometimes get better fills. However, the debate centers on whether execution quality would be even better if orders went directly to lit exchanges. The net effect is empirically contested.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Market Impact and Slippage",
          content:
            "**Slippage** is the difference between the expected price and the actual fill price. It increases with:\n\n1. **Order size relative to liquidity** -- buying 50,000 shares when only 2,000 are at the best ask forces you to consume multiple price levels.\n2. **Volatility** -- fast-moving markets widen spreads and thin out the book.\n3. **Time of day** -- the open (9:30 AM ET) and close (4:00 PM ET) exhibit higher volatility.\n\n**Market impact** is the permanent price change your order causes. Institutional traders use **VWAP** and **TWAP** algorithms to minimize it.",
          visual: "order-flow",
          highlight: ["slippage", "market impact", "VWAP"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You place a market buy for 10,000 shares of a mid-cap stock. The order book shows 3,000 shares at $42.10, 4,000 at $42.15, and 5,000 at $42.22.",
          question: "What is your approximate average fill price?",
          options: [
            "$42.16 -- you walk up through three price levels",
            "$42.10 -- you always get the best ask",
            "$42.22 -- you pay the worst price",
            "$42.00 -- the bid price",
          ],
          correctIndex: 0,
          explanation:
            "You consume 3,000 at $42.10, 4,000 at $42.15, and 3,000 at $42.22. The weighted average is (3000*42.10 + 4000*42.15 + 3000*42.22) / 10000 = ~$42.16. This is **walking the book** -- large market orders eat through multiple levels of resting liquidity.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Queue Priority: Price-Time",
          content:
            "Most exchanges use **price-time priority** (also called FIFO). Orders are ranked first by price (best price first), then by timestamp (earliest first at the same price).\n\nThis means a limit buy at $50.01 always gets filled before a limit buy at $50.00, regardless of who placed it first. At the same price level, the order that arrived first gets priority.\n\nSome exchanges (like EDGX) use **price-size priority**, giving preference to larger orders at the same price. This rewards institutional participants who provide deeper liquidity.",
          highlight: ["price-time priority", "FIFO"],
        },
        {
          type: "quiz-mc",
          question:
            "On a price-time priority exchange, which buy order gets filled first?",
          options: [
            "The one with the highest bid price, regardless of arrival time",
            "The one that arrived first, regardless of price",
            "The largest order by share count",
            "Orders are matched randomly",
          ],
          correctIndex: 0,
          explanation:
            "**Price-time priority** ranks by price first -- the highest bid (most aggressive buyer) always gets priority. Only when two orders are at the identical price does arrival time break the tie. This incentivizes aggressive pricing and tighter spreads.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Dark Pools and Off-Exchange Execution",
          content:
            "**Dark pools** are private trading venues that do not display quotes publicly. They allow institutions to trade large blocks without revealing their intentions to the market.\n\nRoughly 40-45% of U.S. equity volume executes off-exchange (dark pools + wholesalers). Benefits include reduced market impact for large orders. Risks include less transparent pricing and potential **information leakage** if the dark pool operator is also a proprietary trader.\n\nNotable dark pools include Crossfinder (Credit Suisse), Sigma X (Goldman), and POSIT (Virtu).",
          highlight: ["dark pools", "off-exchange"],
        },
        {
          type: "quiz-tf",
          statement:
            "Dark pools display their order book publicly like the NYSE or Nasdaq.",
          correct: false,
          explanation:
            "Dark pools are specifically designed to be opaque -- they do **not** display quotes or order sizes publicly. This non-display characteristic is their primary value proposition, allowing institutional traders to execute large blocks without signaling intent to the broader market.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A hedge fund needs to buy 500,000 shares of a stock that trades 2 million shares/day. The current ask is $78.50.",
          question:
            "Why would the fund avoid placing a single market order?",
          options: [
            "The order is 25% of daily volume -- it would cause massive market impact and slippage",
            "Market orders are not available for hedge funds",
            "The exchange would reject orders over 100,000 shares",
            "Market orders cannot be placed during trading hours",
          ],
          correctIndex: 0,
          explanation:
            "At 25% of average daily volume, a single market order would consume enormous liquidity, walking the book up far above $78.50. The fund would instead use algorithmic strategies (VWAP, TWAP, or iceberg orders) to slice the order over hours or days, minimizing **market impact**.",
          difficulty: 3,
        },
        {
          type: "practice",
          instruction:
            "Execute a market buy order to experience instant fills and observe how the price responds to your order.",
          objective: "Buy shares using a market order",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_MARKET_ORDER.bars,
            initialReveal: PRACTICE_MARKET_ORDER.initialReveal,
            objectives: [{ kind: "buy", minQuantity: 5 }],
            hint: "Select a quantity and click Buy. Notice you get filled immediately at the current ask price.",
            startingCash: 10000,
          },
        },
        {
          type: "quiz-mc",
          question:
            "What is the primary advantage of a market order over a limit order?",
          options: [
            "Guaranteed execution -- your order will fill immediately",
            "Guaranteed price -- you always get the quoted price",
            "Lower commission fees",
            "Better price improvement on average",
          ],
          correctIndex: 0,
          explanation:
            "Market orders prioritize **certainty of execution** over price. You are guaranteed a fill (assuming the market is open and the security is liquid), but you accept whatever the current NBBO offers. This tradeoff is appropriate when speed matters more than the exact fill price.",
          difficulty: 1,
        },
      ],
    },

    /* ===================================================================
       LESSON 2 — Limit Orders (14 steps)
       =================================================================== */
    {
      id: "orders-2",
      title: "Limit Orders",
      description:
        "LOB mechanics, maker/taker fees, time-in-force, and advanced order types",
      icon: "Target",
      xpReward: 65,
      steps: [
        {
          type: "teach",
          title: "The Limit Order Book (LOB)",
          content:
            "The **Limit Order Book** is the central data structure of modern markets. It stores all resting limit orders organized by price level.\n\nThe **bid side** shows buy orders ranked from highest to lowest price. The **ask side** shows sell orders ranked from lowest to highest. The gap between the best bid and best ask is the **spread**.\n\nWhen you place a limit buy at $100, your order joins the queue at the $100 level. It will only execute if someone is willing to sell at $100 or less.",
          visual: "order-flow",
          highlight: ["limit order book", "bid", "ask", "spread"],
        },
        {
          type: "teach",
          title: "Maker vs Taker: Exchange Fee Structure",
          content:
            "Exchanges use a **maker-taker fee model** to incentivize liquidity provision:\n\n**Makers** add liquidity by placing limit orders that rest on the book. They receive a **rebate** (e.g., -$0.002/share on Nasdaq).\n**Takers** remove liquidity by placing marketable orders. They pay a **fee** (e.g., +$0.003/share).\n\nThis is why limit orders can be cheaper to execute than market orders -- you earn the rebate instead of paying the fee. Some venues like IEX use a flat-fee model to reduce speed advantages.",
          highlight: ["maker-taker", "rebate", "liquidity"],
        },
        {
          type: "quiz-mc",
          question:
            "In a maker-taker exchange model, who receives the rebate?",
          options: [
            "The trader whose limit order was resting on the book (maker)",
            "The trader who placed a market order (taker)",
            "The exchange itself",
            "The broker routing the order",
          ],
          correctIndex: 0,
          explanation:
            "**Makers** provide liquidity by placing non-marketable limit orders that rest on the book. Exchanges reward this with a per-share rebate. **Takers** who execute against resting orders pay a fee. This model incentivizes tighter spreads and deeper order books.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Time-in-Force: GTC, IOC, FOK",
          content:
            "**Time-in-force** instructions tell the exchange how long your order should remain active:\n\n**Day** -- expires at market close if unfilled (default).\n**GTC (Good-Til-Cancelled)** -- stays open across sessions until filled or cancelled. Most brokers cap GTC at 60-90 days.\n**IOC (Immediate or Cancel)** -- must fill immediately (partial fills accepted); any unfilled portion is cancelled.\n**FOK (Fill or Kill)** -- must fill the entire order immediately or cancel entirely. No partial fills. Used when partial execution would leave an undesirable position size.",
          highlight: ["GTC", "IOC", "FOK", "time-in-force"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You place a FOK buy order for 5,000 shares at $88.00. Only 3,200 shares are available at $88.00 or below.",
          question: "What happens to your order?",
          options: [
            "The entire order is cancelled -- FOK requires a complete fill",
            "You receive 3,200 shares and the rest is cancelled",
            "The order waits until 5,000 shares are available",
            "You receive 3,200 shares at $88 and 1,800 at $88.01",
          ],
          correctIndex: 0,
          explanation:
            "**Fill or Kill** is all-or-nothing. If the full 5,000 shares cannot be filled immediately at $88.00 or better, the entire order is cancelled with zero shares executed. This differs from IOC, which would accept the partial fill of 3,200 shares.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Crossing the Spread",
          content:
            "The **spread** is the cost of immediacy. If the NBBO is $49.95 bid / $50.00 ask, the spread is $0.05.\n\nA limit buy at $50.00 (at the ask) **crosses the spread** and becomes immediately marketable -- it acts like a market order. A limit buy at $49.95 (at the bid) rests passively and earns the maker rebate.\n\nActive traders distinguish between **passive** orders (priced inside the book, waiting) and **aggressive** orders (priced at or through the opposite side, executing immediately). The tighter the spread, the cheaper it is to cross.",
          highlight: ["spread", "crossing"],
        },
        {
          type: "quiz-tf",
          statement:
            "A limit buy order priced at the current ask will rest passively on the order book.",
          correct: false,
          explanation:
            "A limit buy at the ask price is **marketable** -- it will execute immediately against the resting ask orders. To rest passively, you must price your buy below the current ask (typically at or below the bid). Only non-marketable limit orders add liquidity to the book.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Iceberg and Reserve Orders",
          content:
            "An **iceberg order** (also called a reserve order) displays only a fraction of the total size to the market. For example, you might want to buy 50,000 shares but display only 500 at a time.\n\nWhen the displayed portion fills, the next 500-share tranche automatically replenishes from the hidden reserve. This prevents other participants from detecting your full order size and front-running you.\n\nIceberg orders still follow **price-time priority**, but each replenishment gets a new timestamp, so they lose time priority to orders that arrived earlier at the same price.",
          highlight: ["iceberg order", "reserve order"],
        },
        {
          type: "quiz-mc",
          question: "What is the main purpose of an iceberg order?",
          options: [
            "To hide the full order size and minimize information leakage",
            "To get a better price than regular limit orders",
            "To guarantee execution of the entire order",
            "To avoid paying exchange fees",
          ],
          correctIndex: 0,
          explanation:
            "Iceberg orders conceal the true order size to prevent other participants from detecting and **front-running** large institutional positions. Only a small displayed quantity is visible; the rest remains hidden and replenishes as the visible portion fills.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "The order book shows: Ask $25.10 (2,000 shares), Ask $25.12 (5,000 shares). You place a limit buy for 3,000 shares at $25.12.",
          question: "How does your order fill?",
          options: [
            "2,000 shares at $25.10 and 1,000 shares at $25.12",
            "All 3,000 shares at $25.12",
            "All 3,000 shares at $25.10",
            "The order is rejected because two price levels are involved",
          ],
          correctIndex: 0,
          explanation:
            "Your limit buy at $25.12 sweeps the book starting at the best price. You first consume all 2,000 shares at $25.10, then fill the remaining 1,000 from the $25.12 level. You receive **price improvement** on the first 2,000 shares since you were willing to pay up to $25.12.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Limit Order Risks",
          content:
            "Limit orders carry risks that market orders avoid:\n\n**Non-execution risk** -- the price may never reach your limit. You miss the trade entirely while the stock moves away from you.\n**Partial fill risk** -- only part of your order executes, leaving an unintended position size.\n**Adverse selection** -- your limit order fills precisely because informed traders are moving the price through your level. If your buy limit fills, it may indicate the stock is heading lower.\n\nProfessional traders call this the **winner's curse** of limit orders -- you get filled when you least want to be.",
          highlight: ["adverse selection", "non-execution risk"],
        },
        {
          type: "quiz-tf",
          statement:
            "Getting filled on a limit order is always good news because you got the price you wanted.",
          correct: false,
          explanation:
            "Limit order fills can suffer from **adverse selection** -- you get filled because informed traders pushed the price through your level, often indicating continued movement against you. This is why passive limit orders at obvious support/resistance levels frequently become losing trades.",
          difficulty: 3,
        },
        {
          type: "practice",
          instruction:
            "Advance time to watch for a price dip, then place a buy order at a favorable price. Observe how waiting for a better entry changes your cost basis.",
          objective: "Buy shares during a price dip",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_LIMIT_DIP.bars,
            initialReveal: PRACTICE_LIMIT_DIP.initialReveal,
            objectives: [
              { kind: "advance-time", bars: 5 },
              { kind: "buy", minQuantity: 1 },
            ],
            hint: "Advance time to watch the price dip, then buy at a lower price for a better entry.",
            startingCash: 10000,
          },
        },
        {
          type: "quiz-mc",
          question:
            "Which time-in-force instruction would a day trader use to avoid overnight exposure from an unfilled limit order?",
          options: [
            "Day order -- it expires at market close",
            "GTC -- it stays open until filled",
            "FOK -- it either fills completely or cancels",
            "MOC -- market on close",
          ],
          correctIndex: 0,
          explanation:
            "A **Day** order expires at 4:00 PM ET if unfilled, ensuring no unintended overnight exposure. GTC orders carry the risk of filling the next day at a stale price after overnight news. Day traders should always use day orders to maintain control of their positions.",
          difficulty: 1,
        },
      ],
    },

    /* ===================================================================
       LESSON 3 — Stop-Loss Orders (14 steps)
       =================================================================== */
    {
      id: "orders-3",
      title: "Stop-Loss Orders",
      description:
        "Stop market vs limit, trailing stops, gap risk, and volatility-based placement",
      icon: "Shield",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "Stop-Loss Fundamentals",
          content:
            "A **stop-loss order** becomes active only when the price reaches your specified **trigger price** (the stop). Once triggered:\n\n**Stop-market order** -- converts to a market order. Guarantees execution but not price.\n**Stop-limit order** -- converts to a limit order at your specified limit price. Guarantees price but not execution.\n\nThe critical distinction: stop-market orders protect against unlimited downside but may fill at worse prices during fast moves. Stop-limit orders risk **non-execution** if the price gaps past your limit.",
          visual: "risk-pyramid",
          highlight: ["stop-market", "stop-limit", "trigger price"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the key difference between a stop-market and a stop-limit order once triggered?",
          options: [
            "Stop-market guarantees execution; stop-limit guarantees price",
            "Stop-market guarantees price; stop-limit guarantees execution",
            "Stop-market only works during market hours",
            "Stop-limit orders cannot be used for selling",
          ],
          correctIndex: 0,
          explanation:
            "Once triggered, a **stop-market** becomes a market order (guaranteed fill, uncertain price), while a **stop-limit** becomes a limit order (guaranteed maximum price, but may not fill if the market moves past your limit). This tradeoff is fundamental to risk management design.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Gap Risk: The Silent Killer",
          content:
            "**Gap risk** occurs when a stock opens significantly above or below the previous close, skipping over your stop price. Common causes include:\n\n- Earnings announcements (after-hours or pre-market)\n- FDA drug decisions for biotech stocks\n- Geopolitical events or macro surprises\n- Analyst upgrades/downgrades before market open\n\nIf your stop is at $95 and the stock gaps down to $80, your stop-market fills at ~$80, not $95. A stop-limit at $95/$94 might **not fill at all**, leaving you fully exposed as the price continues to fall.",
          highlight: ["gap risk"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You own shares bought at $100 with a stop-limit order: trigger at $92, limit at $90. Overnight, the company reports terrible earnings and the stock opens at $85.",
          question: "What happens to your stop-limit order?",
          options: [
            "The stop triggers but the limit at $90 prevents execution -- you remain in the position at $85",
            "You sell at $92",
            "You sell at $90",
            "You sell at $85",
          ],
          correctIndex: 0,
          explanation:
            "The stop triggers at $85 (below $92), converting to a limit sell at $90. But the market is at $85 -- there are no buyers at $90 or above. The limit order rests unfilled. You are now holding a position at $85 with **no protection**. This is the critical flaw of stop-limit orders in gap scenarios.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Trailing Stop Orders",
          content:
            "A **trailing stop** automatically adjusts with favorable price movement. You set a **trail amount** (fixed dollar or percentage).\n\nExample: Buy at $100, trailing stop at $5. Initial stop = $95.\n- Stock rises to $110 -> stop moves to $105\n- Stock rises to $115 -> stop moves to $110\n- Stock falls to $110 -> stop triggers, you sell at ~$110\n\nTrailing stops lock in gains as the trend continues while giving the position room to breathe. They are especially useful in **momentum strategies** where the exit signal is a pullback from highs.",
          highlight: ["trailing stop", "trail amount"],
        },
        {
          type: "quiz-tf",
          statement:
            "A trailing stop moves both up and down with the stock price.",
          correct: false,
          explanation:
            "A trailing stop only moves in the **favorable direction**. For a long position, it ratchets upward as the price rises but never moves back down when the price falls. This one-directional mechanism is what creates the profit-protection effect. The stop only triggers when the price reverses by the trail amount from its highest point.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "ATR-Based Stop Placement",
          content:
            "The **Average True Range (ATR)** measures a stock's typical price movement over a period (usually 14 bars). Using ATR for stop placement adapts to the stock's actual volatility.\n\n**Formula**: Stop = Entry Price - (N x ATR)\n\nCommon multiples: 1.5x ATR (tight), 2x ATR (standard), 3x ATR (loose).\n\nExample: TSLA entry at $250, 14-day ATR = $12. A 2x ATR stop = $250 - $24 = $226. This gives TSLA enough room for its normal daily swings while protecting against abnormal moves. A low-volatility stock like KO (ATR $1.50) would have a stop at $250 - $3 = $247.",
          highlight: ["ATR", "volatility-based stop"],
        },
        {
          type: "quiz-mc",
          question:
            "Stock A has a 14-day ATR of $3.00 and Stock B has an ATR of $0.80. You enter both at $100 with a 2x ATR stop. Where are the stops?",
          options: [
            "Stock A: $94.00, Stock B: $98.40",
            "Stock A: $97.00, Stock B: $99.20",
            "Both at $94.00",
            "Stock A: $98.40, Stock B: $94.00",
          ],
          correctIndex: 0,
          explanation:
            "Stock A: $100 - (2 x $3.00) = $94.00. Stock B: $100 - (2 x $0.80) = $98.40. ATR-based stops give volatile stocks more room and tight stocks less. This prevents premature stop-outs on normally volatile names while keeping tight protection on stable ones.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The 1-2% Portfolio Risk Rule",
          content:
            "Professional risk management starts with **position sizing** based on your stop distance:\n\n**Max risk per trade** = Portfolio x Risk % (typically 1-2%)\n**Position size** = Max risk / (Entry - Stop)\n\nExample: $100,000 portfolio, 1% risk = $1,000 max loss.\nEntry: $50, Stop: $47 (ATR-based). Risk per share: $3.\nPosition size: $1,000 / $3 = **333 shares**.\n\nThis formula ensures a single losing trade never threatens your portfolio's survival. Even a string of 10 consecutive losses only draws down 10-20%.",
          visual: "risk-pyramid",
          highlight: ["position sizing", "1% rule"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Your portfolio is $50,000. You want to buy a stock at $120 with a stop at $114. You follow the 2% risk rule.",
          question: "What is the maximum number of shares you can buy?",
          options: [
            "166 shares -- $1,000 max risk / $6 per share",
            "416 shares -- $50,000 / $120",
            "83 shares -- $1,000 / $12",
            "250 shares -- $50,000 x 2% / $4",
          ],
          correctIndex: 0,
          explanation:
            "Max risk = $50,000 x 2% = $1,000. Risk per share = $120 - $114 = $6. Position size = $1,000 / $6 = 166 shares ($19,920 notional). This keeps your maximum loss at $1,000 (2% of portfolio) regardless of how volatile the stock is.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Stop Hunting and Volatility Spikes",
          content:
            "**Stop hunting** refers to price moves that trigger clusters of stop-loss orders before reversing. Round numbers ($50, $100) and obvious support levels attract stop clusters.\n\nHigh-frequency traders and algorithms can detect these levels from public order flow data. The price briefly dips to trigger stops, then reverses. To defend against stop hunting:\n\n- Place stops at non-obvious levels (not round numbers)\n- Use ATR-based stops instead of fixed percentages\n- Consider **mental stops** (closing manually) for volatile names\n- Avoid placing stops too tight in low-liquidity periods",
          highlight: ["stop hunting"],
        },
        {
          type: "quiz-tf",
          statement:
            "Placing a stop-loss at exactly $100.00 on a $105 stock is a strong risk management choice because round numbers are easy to remember.",
          correct: false,
          explanation:
            "Round numbers like $100 are the worst stop-loss levels. They attract massive clusters of stops, making them prime targets for **stop hunting**. Better placements would be $99.73 or use an ATR-based calculation. Professional traders actively avoid round-number stops.",
          difficulty: 2,
        },
        {
          type: "practice",
          instruction:
            "Observe the price action near support levels. Notice how the price sometimes dips below support before reversing -- this is where tight stops get triggered.",
          objective: "Watch price behavior around support levels",
          actionType: "observe",
          challenge: {
            priceData: PRACTICE_SUPPORT_RESISTANCE.bars,
            initialReveal: PRACTICE_SUPPORT_RESISTANCE.initialReveal,
            objectives: [{ kind: "advance-time", bars: 10 }],
            hint: "Advance time and watch how the price interacts with key levels. Notice the wicks below support.",
            startingCash: 10000,
          },
        },
        {
          type: "quiz-mc",
          question:
            "Which stop-loss type is most appropriate for a long position in a biotech stock the night before an FDA decision?",
          options: [
            "Stop-market -- guarantees exit even through a gap",
            "Stop-limit -- guarantees your exit price",
            "Trailing stop -- adapts to recent highs",
            "No stop is appropriate -- close the position entirely",
          ],
          correctIndex: 3,
          explanation:
            "Binary events like FDA decisions can cause 30-50% overnight gaps. No stop-loss order can protect you from this magnitude of gap. The only reliable protection is to **reduce or close the position** before the event. This is a fundamental risk management principle for binary catalysts.",
          difficulty: 3,
        },
      ],
    },

    /* ===================================================================
       LESSON 4 — Take-Profit Orders (14 steps)
       =================================================================== */
    {
      id: "orders-4",
      title: "Take-Profit Orders",
      description:
        "OCO brackets, scaling out, R:R framework, and expected value",
      icon: "CircleDollarSign",
      xpReward: 65,
      steps: [
        {
          type: "teach",
          title: "Take-Profit Order Mechanics",
          content:
            "A **take-profit order** is a limit sell placed above your entry price (for longs) that automatically closes your position at the target level.\n\nUnlike a manual sell, take-profit orders execute without your attention -- critical when you cannot monitor the market. The order rests on the book as a regular limit sell.\n\nKey consideration: your take-profit is visible on the order book. If you are trading a large position, other participants can see your exit level. Institutional traders often use **hidden** or **reserve** orders for take-profit levels to avoid revealing their hand.",
          highlight: ["take-profit", "limit sell"],
        },
        {
          type: "teach",
          title: "OCO: One-Cancels-Other",
          content:
            "An **OCO (One-Cancels-Other)** order links two orders: when one executes, the other is automatically cancelled.\n\nTypical use: pair a stop-loss with a take-profit.\n\nBuy at $100 -> OCO: Stop at $95, Take-Profit at $110.\n- If $110 hits first: take-profit fills, stop-loss auto-cancels.\n- If $95 hits first: stop-loss fills, take-profit auto-cancels.\n\nWithout OCO, you risk both orders becoming active. Imagine the price hits $110 (take-profit fills), then drops to $95 -- without OCO, the orphaned stop-loss would open an unintended **short position**.",
          highlight: ["OCO", "one-cancels-other"],
        },
        {
          type: "quiz-mc",
          question:
            "What problem does an OCO order solve?",
          options: [
            "It prevents orphaned orders from creating unintended positions",
            "It guarantees both orders will execute",
            "It gives you a better fill price",
            "It reduces exchange fees",
          ],
          correctIndex: 0,
          explanation:
            "Without OCO, if your take-profit fills, the stop-loss remains active. A subsequent price decline could trigger the stop, opening an unintended position in the opposite direction. OCO ensures that when one side fills, the other is **automatically cancelled**, maintaining your intended risk profile.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Bracket Orders",
          content:
            "A **bracket order** is an entry order with pre-attached stop-loss and take-profit (an OCO pair). All three orders are submitted simultaneously.\n\nStructure: Entry (market or limit) + Stop-Loss + Take-Profit.\n\nWhen the entry fills, the stop and take-profit activate as an OCO pair. If the entry never fills, neither the stop nor take-profit are submitted.\n\nBrackets enforce discipline by defining your complete trade plan **before entry**. You know your risk (stop distance), reward (target distance), and maximum loss before committing capital. Many professional trading firms **require** bracket orders for all discretionary trades.",
          highlight: ["bracket order"],
        },
        {
          type: "quiz-tf",
          statement:
            "In a bracket order, the stop-loss and take-profit activate immediately when the bracket is submitted.",
          correct: false,
          explanation:
            "The stop-loss and take-profit legs of a bracket order only activate **after the entry order fills**. If the entry is a limit order that never reaches its price, the attached stop and take-profit are never submitted to the exchange. This prevents orphaned protective orders from an unfilled entry.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Risk-Reward (R:R) Framework",
          content:
            "**Risk-to-Reward ratio** measures the potential loss versus potential gain of a trade setup:\n\n**R:R = (Entry - Stop) / (Target - Entry)**\n\nEntry $50, Stop $47, Target $59:\nRisk = $3, Reward = $9 -> R:R = 1:3\n\nThe breakeven win rate for common R:R ratios:\n- 1:1 -> need >50% win rate\n- 1:2 -> need >33% win rate\n- 1:3 -> need >25% win rate\n\nProfessional traders typically require a **minimum 1:2 R:R** before entering any trade. This ensures that even a modest win rate produces positive expectancy.",
          visual: "risk-pyramid",
          highlight: ["risk-reward ratio", "R:R"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Trade setup: Entry at $200, Stop at $190, Target at $230. Your historical win rate on similar setups is 45%.",
          question: "What is the R:R ratio and is this trade worth taking?",
          options: [
            "1:3 R:R -- yes, breakeven is 25% and your 45% win rate is well above that",
            "1:3 R:R -- no, you need at least 50% win rate",
            "3:1 R:R -- no, the risk is too high",
            "1:1 R:R -- it depends on the market conditions",
          ],
          correctIndex: 0,
          explanation:
            "Risk = $10, Reward = $30, R:R = 1:3. Breakeven win rate = 1/(1+3) = 25%. Your 45% win rate far exceeds this threshold. **Expected value** = (0.45 x $30) - (0.55 x $10) = $13.50 - $5.50 = **+$8.00 per trade**. This is a strongly positive expectancy setup.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Scaling Out: Partial Profit-Taking",
          content:
            "**Scaling out** means selling your position in portions at different price levels rather than all at once.\n\nExample: 300 shares, entry at $100.\n- Sell 100 shares at $110 (first target, +10%)\n- Sell 100 shares at $120 (second target, +20%)\n- Trail stop on final 100 shares\n\nBenefits: locks in partial profits, reduces psychological pressure, and lets the remaining position capture extended moves.\n\nDrawback: reduces the average exit price if the stock hits all targets. You capture less of the maximum move. Some studies show that **all-in, all-out** produces higher expectancy over time, but scaling out improves consistency and reduces drawdowns.",
          highlight: ["scaling out", "partial profits"],
        },
        {
          type: "quiz-mc",
          question:
            "You own 400 shares at $50. You sell 200 at $55, 100 at $60, and 100 at $65. What is your average sell price?",
          options: [
            "$58.75",
            "$60.00",
            "$55.00",
            "$56.25",
          ],
          correctIndex: 0,
          explanation:
            "Weighted average = (200 x $55 + 100 x $60 + 100 x $65) / 400 = ($11,000 + $6,000 + $6,500) / 400 = **$58.75**. Scaling out produced a blended exit below the maximum ($65) but locked in profits along the way. If the stock had reversed at $57, you would still have realized gains on half the position.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Expected Value: The Professional's Lens",
          content:
            "**Expected Value (EV)** is the average outcome of a trade over many repetitions:\n\n**EV = (Win Rate x Avg Win) - (Loss Rate x Avg Loss)**\n\nTrade system: 40% win rate, average win $500, average loss $200.\nEV = (0.40 x $500) - (0.60 x $200) = $200 - $120 = **+$80 per trade**.\n\nPositive EV means the system is profitable **over a large sample**. Individual trades can lose, but the math works in your favor over time. This is why casinos (and good traders) focus on edge and repetition, not individual outcomes.",
          highlight: ["expected value", "EV", "edge"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "System A: 60% win rate, average win $300, average loss $400.\nSystem B: 35% win rate, average win $1,200, average loss $300.",
          question: "Which system has higher expected value per trade?",
          options: [
            "System B: EV = +$225 vs System A: EV = +$20",
            "System A because it wins more often",
            "They are equal",
            "Neither -- both have negative EV",
          ],
          correctIndex: 0,
          explanation:
            "System A: (0.60 x $300) - (0.40 x $400) = $180 - $160 = **+$20**. System B: (0.35 x $1,200) - (0.65 x $300) = $420 - $195 = **+$225**. System B is dramatically more profitable despite winning only 35% of the time. This illustrates why **R:R matters more than win rate**.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A trading system with a 30% win rate is always unprofitable.",
          correct: false,
          explanation:
            "Profitability depends on the **ratio of average win to average loss**, not just win rate. A 30% win rate with 1:4 R:R yields positive EV: (0.30 x $4) - (0.70 x $1) = $1.20 - $0.70 = +$0.50 per dollar risked. Trend-following systems commonly have 30-40% win rates but remain highly profitable through large wins.",
          difficulty: 2,
        },
        {
          type: "practice",
          instruction:
            "Analyze this chart and identify a setup where the potential reward is at least 2x the risk. Think about where you would place your stop-loss and take-profit.",
          objective: "Identify a favorable risk-reward setup",
          actionType: "observe",
          challenge: {
            priceData: PRACTICE_RISK_REWARD.bars,
            initialReveal: PRACTICE_RISK_REWARD.initialReveal,
            objectives: [{ kind: "advance-time", bars: 8 }],
            hint: "Look for a pullback to support. Your stop goes below the support; your target is the previous high or higher. Aim for at least 1:2 R:R.",
            startingCash: 10000,
          },
        },
        {
          type: "quiz-mc",
          question:
            "Which combination of order types creates a complete bracket order for a long position?",
          options: [
            "Limit buy entry + OCO (stop-loss sell + take-profit limit sell)",
            "Market buy + two separate stop-loss orders",
            "Market buy + a single take-profit",
            "Two limit buys at different prices",
          ],
          correctIndex: 0,
          explanation:
            "A bracket order consists of three components: an **entry** (limit or market), a **stop-loss** for downside protection, and a **take-profit** for upside capture, with the stop and take-profit linked as an OCO pair. This structure defines the complete trade plan before any capital is risked.",
          difficulty: 1,
        },
      ],
    },
  ],
};
