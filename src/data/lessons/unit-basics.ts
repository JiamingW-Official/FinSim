import type { Unit } from "./types";
import {
  PRACTICE_BASIC,
  PRACTICE_CANDLES,
  PRACTICE_VOLUME,
  PRACTICE_UPTREND,
  PRACTICE_UP_DOWN,
} from "./practice-data";

export const UNIT_BASICS: Unit = {
  id: "basics",
  title: "Trading Basics",
  description: "Learn the fundamentals of the stock market",
  icon: "GraduationCap",
  color: "#10b981",
  lessons: [
    {
      id: "basics-1",
      title: "What is a Stock?",
      description: "Understand ownership, shares, and why stocks move",
      icon: "Building2",
      xpReward: 50,
      steps: [
        {
          type: "teach",
          title: "Owning a Piece of the Pie",
          content:
            "A **stock** represents partial ownership in a company. When you buy shares of Apple (AAPL), you literally own a tiny fraction of the company.\n\nCompanies sell shares to raise money for growth. In return, shareholders benefit when the company's value increases.",
          visual: "portfolio-pie",
          highlight: ["stock", "shares", "ownership"],
        },
        {
          type: "teach",
          title: "Why Do Prices Move?",
          content:
            "Stock prices change based on **supply and demand**. If more people want to buy a stock (demand), the price goes up. If more want to sell (supply), the price drops.\n\nFactors that influence demand: company earnings, news, economic conditions, and investor sentiment.",
        },
        {
          type: "quiz-tf",
          statement: "Buying a stock means you own a small part of the company.",
          correct: true,
          explanation:
            "Correct! Each share of stock represents fractional ownership. If a company has 1 million shares and you own 100, you own 0.01% of the company.",
        },
        {
          type: "quiz-mc",
          question: "What primarily drives stock price changes?",
          options: [
            "Supply and demand from buyers and sellers",
            "The CEO's personal decisions",
            "The number of employees",
            "The company's office location",
          ],
          correctIndex: 0,
          explanation:
            "Stock prices are driven by supply and demand. When more people want to buy than sell, prices rise. Company fundamentals, news, and sentiment influence this balance.",
        },
        {
          type: "teach",
          title: "Key Terms to Know",
          content:
            "**Ticker Symbol**: A short code for a stock (e.g., AAPL = Apple, MSFT = Microsoft).\n\n**Market Cap**: Total value of all shares. A $3T market cap means all shares combined are worth $3 trillion.\n\n**P/E Ratio**: Price divided by earnings per share. It tells you how much investors pay for each dollar of profit.",
          highlight: ["ticker", "market cap", "P/E ratio"],
        },
        {
          type: "practice",
          instruction: "Advance the chart forward to watch prices unfold in real time.",
          objective: "Step through the price bars using the controls below",
          actionType: "navigate",
          challenge: {
            priceData: PRACTICE_BASIC.bars,
            initialReveal: PRACTICE_BASIC.initialReveal,
            objectives: [{ kind: "advance-time", bars: 5 }],
            hint: "Use the step-forward button or press Play to advance bars.",
          },
        },
      ],
    },
    {
      id: "basics-2",
      title: "Reading Candlesticks",
      description: "Decode the visual language of price charts",
      icon: "CandlestickChart",
      xpReward: 60,
      steps: [
        {
          type: "teach",
          title: "Anatomy of a Candlestick",
          content:
            "Each candlestick shows 4 data points for a time period:\n\n• **Open**: The price when the period started\n• **Close**: The price when the period ended\n• **High**: The highest price reached\n• **Low**: The lowest price reached\n\nThe **body** (thick part) shows the open-to-close range. The **wicks** (thin lines) show the high and low.",
          visual: "candlestick",
          highlight: ["open", "close", "high", "low", "body", "wick"],
        },
        {
          type: "teach",
          title: "Green vs Red Candles",
          content:
            "**Green candle**: Close > Open (price went UP). The body bottom is the open, top is the close.\n\n**Red candle**: Close < Open (price went DOWN). The body top is the open, bottom is the close.\n\nLong bodies = strong movement. Short bodies = indecision. Long wicks = the price was rejected at that level.",
        },
        {
          type: "quiz-mc",
          question: "In a green candlestick, where is the opening price?",
          options: [
            "Bottom of the body",
            "Top of the body",
            "Top of the upper wick",
            "Bottom of the lower wick",
          ],
          correctIndex: 0,
          explanation:
            "In a green (bullish) candle, the open is at the bottom of the body and the close is at the top, showing the price moved up during that period.",
        },
        {
          type: "quiz-tf",
          statement:
            "A candlestick with a very long upper wick and small body suggests the price was rejected at higher levels.",
          correct: true,
          explanation:
            "A long upper wick means buyers pushed the price up but sellers drove it back down. This 'rejection' pattern often signals potential resistance.",
        },
        {
          type: "quiz-scenario",
          scenario:
            "You see a candlestick with a tiny body near the bottom and a very long upper wick. The candle is red.",
          question: "What does this pattern suggest?",
          options: [
            "Strong buying pressure pushed prices up but sellers took over",
            "The stock is about to split",
            "Trading volume was very low",
            "The market is closed",
          ],
          correctIndex: 0,
          explanation:
            "This is called a 'shooting star' pattern. The long upper wick shows buyers tried to push the price up but were overwhelmed by sellers, pushing the close back near the open.",
        },
        {
          type: "practice",
          instruction:
            "Watch the candlestick chart unfold. Observe the green and red candles forming.",
          objective:
            "Advance time to see candlesticks appear — green means price went up, red means down",
          actionType: "observe",
          challenge: {
            priceData: PRACTICE_CANDLES.bars,
            initialReveal: PRACTICE_CANDLES.initialReveal,
            objectives: [{ kind: "advance-time", bars: 8 }],
            hint: "Watch how the body color changes based on open vs close.",
          },
        },
      ],
    },
    {
      id: "basics-3",
      title: "Price & Volume",
      description: "Learn how trading volume confirms price moves",
      icon: "BarChart3",
      xpReward: 50,
      steps: [
        {
          type: "teach",
          title: "What is Volume?",
          content:
            "**Volume** is the number of shares traded during a time period. It's shown as bars at the bottom of the chart.\n\nVolume tells you the **conviction** behind a price move:\n• High volume + price up = strong buying interest\n• High volume + price down = strong selling pressure\n• Low volume = lack of conviction, move may reverse",
          visual: "indicator-chart",
          highlight: ["volume", "conviction"],
        },
        {
          type: "quiz-mc",
          question: "A stock price jumps 5% on very low volume. What does this suggest?",
          options: [
            "The move may lack conviction and could reverse",
            "The stock will definitely keep going up",
            "Volume doesn't matter for price moves",
            "The stock will be halted",
          ],
          correctIndex: 0,
          explanation:
            "Low volume during a price spike suggests fewer participants are driving the move. Without broad conviction, the price is more likely to retrace.",
        },
        {
          type: "quiz-tf",
          statement: "High trading volume always means the stock price is going up.",
          correct: false,
          explanation:
            "High volume can occur during both upward and downward moves. It indicates strong interest and conviction — in either direction.",
        },
        {
          type: "teach",
          title: "Volume Patterns",
          content:
            "**Breakout volume**: When price breaks above resistance on high volume, the breakout is more likely to sustain.\n\n**Climax volume**: An extremely high-volume spike after a long trend can signal exhaustion — the trend may reverse.\n\n**Average volume** varies by stock. AAPL trades ~50M shares/day while a small stock might trade 500K.",
        },
        {
          type: "practice",
          instruction:
            "Watch the volume bars at the bottom of the chart while advancing time.",
          objective: "Advance bars and observe how volume relates to price movement",
          actionType: "observe",
          challenge: {
            priceData: PRACTICE_VOLUME.bars,
            initialReveal: PRACTICE_VOLUME.initialReveal,
            objectives: [{ kind: "advance-time", bars: 8 }],
            hint: "Look at the height of volume bars below the candles — taller bars mean more trading activity.",
          },
        },
      ],
    },
    {
      id: "basics-4",
      title: "Your First Trade",
      description: "Place your very first buy and sell orders",
      icon: "Zap",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "How Trading Works",
          content:
            "In the simulator, you start with **$100,000** in virtual cash. To trade:\n\n1. Select a stock from the Watchlist\n2. Choose an order type (Market or Limit)\n3. Enter the quantity (number of shares)\n4. Click Buy or Sell\n\nA **Market order** executes immediately at the current price. A **Limit order** only executes at your specified price or better.",
          visual: "order-flow",
        },
        {
          type: "teach",
          title: "Buying: Going Long",
          content:
            "When you **buy** (go long), you profit when the price goes UP.\n\n**Example**: Buy 10 shares at $150 = $1,500 invested\nIf price rises to $160: profit = 10 × $10 = **$100**\nIf price falls to $140: loss = 10 × $10 = **-$100**\n\nYour **P&L** (Profit & Loss) updates in real-time in the Positions tab.",
        },
        {
          type: "quiz-mc",
          question: "You buy 50 shares at $100. The price rises to $105. What is your profit?",
          options: ["$250", "$500", "$105", "$50"],
          correctIndex: 0,
          explanation:
            "Profit = Quantity × (Current Price - Buy Price) = 50 × ($105 - $100) = 50 × $5 = $250",
        },
        {
          type: "practice",
          instruction:
            "Buy shares using the Buy button below the chart. Try buying 10 shares!",
          objective: "Place a buy order for at least 1 share",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_UPTREND.bars,
            initialReveal: PRACTICE_UPTREND.initialReveal,
            objectives: [{ kind: "buy", minQuantity: 1 }],
            hint: "Select a quantity and click the Buy button.",
            startingCash: 10000,
          },
        },
        {
          type: "teach",
          title: "Selling: Closing Your Position",
          content:
            "To take profit or cut losses, you **sell** your shares. In the Positions tab, you'll see your open positions with current P&L.\n\nYou can also **sell short** — this means betting a stock will go DOWN. You borrow shares, sell them, then buy back later at (hopefully) a lower price.",
        },
        {
          type: "practice",
          instruction:
            "Buy shares, advance time, then sell to close your position. Watch your P&L!",
          objective: "Complete a full buy-then-sell cycle",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_UP_DOWN.bars,
            initialReveal: PRACTICE_UP_DOWN.initialReveal,
            objectives: [
              { kind: "buy", minQuantity: 1 },
              { kind: "sell", minQuantity: 1 },
            ],
            hint: "Buy first, advance a few bars to see price change, then sell.",
            startingCash: 10000,
          },
        },
      ],
    },
    {
      id: "basics-5",
      title: "Understanding P&L",
      description: "Calculate profits, losses, and returns like a pro",
      icon: "Calculator",
      xpReward: 55,
      steps: [
        {
          type: "teach",
          title: "Calculating Profit & Loss",
          content:
            "**P&L** (Profit and Loss) is the difference between your selling price and buying price, multiplied by the number of shares.\n\nFormula: **P&L = Quantity × (Sell Price - Buy Price)**\n\n**Return %** = (P&L / Cost Basis) × 100\nCost Basis = Quantity × Buy Price",
        },
        {
          type: "quiz-mc",
          question:
            "You bought 20 shares at $50 and sold at $55. What is your return percentage?",
          options: ["10%", "5%", "$100", "20%"],
          correctIndex: 0,
          explanation:
            "P&L = 20 × ($55 - $50) = $100. Cost Basis = 20 × $50 = $1,000. Return = ($100 / $1,000) × 100 = 10%.",
        },
        {
          type: "quiz-scenario",
          scenario:
            "You bought 100 shares of NVDA at $800. The price dropped to $750. You're feeling nervous.",
          question: "What is your current unrealized loss?",
          options: ["-$5,000", "-$50", "-$500", "-$7,500"],
          correctIndex: 0,
          explanation:
            "Unrealized Loss = 100 × ($750 - $800) = 100 × (-$50) = -$5,000. It's 'unrealized' because you haven't sold yet — the loss isn't locked in.",
        },
        {
          type: "quiz-tf",
          statement:
            "An unrealized loss becomes a realized loss only when you sell the position.",
          correct: true,
          explanation:
            "Unrealized P&L is your paper gain or loss on an open position. It becomes 'realized' when you close (sell) the position. Until then, the price could recover.",
        },
        {
          type: "teach",
          title: "Key P&L Concepts",
          content:
            "**Unrealized P&L**: Paper profit/loss on positions you still hold.\n**Realized P&L**: Locked-in profit/loss from closed trades.\n**Average Cost**: If you buy at different prices, your avg cost = total spent ÷ total shares.\n\nTip: Don't let emotions drive decisions. A small loss taken early is better than hoping a losing trade will recover.",
        },
      ],
    },
  ],
};
