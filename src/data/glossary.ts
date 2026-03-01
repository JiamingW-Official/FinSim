export interface GlossaryEntry {
  term: string;
  definition: string;
  category: "basics" | "orders" | "indicators" | "risk" | "fundamental";
  example?: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  // --- Basics ---
  {
    term: "Stock",
    definition:
      "A share of ownership in a company. When you buy a stock, you own a small piece of that company.",
    category: "basics",
    example: "Buying 1 share of AAPL means you own a tiny fraction of Apple Inc.",
  },
  {
    term: "Portfolio",
    definition:
      "The collection of all your investments. It includes stocks, cash, and any other assets you hold.",
    category: "basics",
  },
  {
    term: "Volume",
    definition:
      "The number of shares traded during a given time period. High volume means lots of buying and selling activity.",
    category: "basics",
    example: "If AAPL has 50M volume, 50 million shares changed hands that day.",
  },
  {
    term: "OHLC",
    definition:
      "Open, High, Low, Close — the four key prices for each trading period. Open is the first trade, High/Low are the extremes, Close is the last trade.",
    category: "basics",
  },
  {
    term: "Candlestick",
    definition:
      "A chart element showing OHLC prices. The body shows open-to-close range; wicks show high and low. Green = close > open (price went up), Red = close < open (price went down).",
    category: "basics",
  },
  {
    term: "Bull Market",
    definition:
      "A market where prices are rising or expected to rise. Named after a bull thrusting its horns upward.",
    category: "basics",
  },
  {
    term: "Bear Market",
    definition:
      "A market where prices are falling or expected to fall (typically 20%+ decline). Named after a bear swiping its paws downward.",
    category: "basics",
  },
  {
    term: "Long",
    definition:
      "Buying a stock expecting its price to go up. You profit when you sell at a higher price than you bought.",
    category: "basics",
    example: "Buy AAPL at $150, sell at $170 = $20 profit per share.",
  },
  {
    term: "Short",
    definition:
      "Selling a stock you don't own, expecting the price to drop. You borrow shares, sell them, then buy them back cheaper to profit.",
    category: "basics",
    example: "Short TSLA at $300, buy back at $250 = $50 profit per share.",
  },
  {
    term: "Bid/Ask",
    definition:
      "Bid is the highest price a buyer will pay; Ask is the lowest price a seller will accept. The difference is the spread.",
    category: "basics",
  },
  {
    term: "Spread",
    definition:
      "The difference between the bid and ask price. Tighter spreads mean more liquid markets with lower trading costs.",
    category: "basics",
  },
  {
    term: "Volatility",
    definition:
      "How much a stock's price fluctuates. High volatility means big price swings (higher risk and potential reward).",
    category: "basics",
  },
  {
    term: "Liquidity",
    definition:
      "How easily you can buy or sell a stock without affecting its price. High-volume stocks like AAPL are very liquid.",
    category: "basics",
  },

  // --- Orders ---
  {
    term: "Market Order",
    definition:
      "An order to buy or sell immediately at the current market price. Fast execution but you may get a slightly different price than expected.",
    category: "orders",
    example: "Market buy 10 AAPL → you get 10 shares right away at whatever the current price is.",
  },
  {
    term: "Limit Order",
    definition:
      "An order to buy or sell at a specific price or better. It only executes when the market reaches your price.",
    category: "orders",
    example:
      "Limit buy AAPL at $145 → your order only fills if the price drops to $145 or below.",
  },
  {
    term: "Stop-Loss",
    definition:
      "An order that automatically sells your position when the price drops to a set level, limiting your losses.",
    category: "orders",
    example: "You own AAPL at $150. Set stop-loss at $140 → auto-sells if price hits $140.",
  },
  {
    term: "Take-Profit",
    definition:
      "An order that automatically sells your position when the price rises to a set level, locking in your gains.",
    category: "orders",
    example: "You own AAPL at $150. Set take-profit at $170 → auto-sells if price hits $170.",
  },
  {
    term: "Commission",
    definition:
      "A fee charged by the broker for executing a trade. In this simulator, it's $0.01 per share (min $1).",
    category: "orders",
  },
  {
    term: "Slippage",
    definition:
      "The difference between the expected price and the actual execution price. Happens because prices move between when you place and execute an order.",
    category: "orders",
  },

  // --- Indicators ---
  {
    term: "SMA",
    definition:
      "Simple Moving Average — the average closing price over N periods. Smooths out price data to show the trend direction.",
    category: "indicators",
    example: "SMA 20 = average of the last 20 closing prices.",
  },
  {
    term: "EMA",
    definition:
      "Exponential Moving Average — like SMA but gives more weight to recent prices, making it react faster to price changes.",
    category: "indicators",
  },
  {
    term: "RSI",
    definition:
      "Relative Strength Index — measures momentum on a 0-100 scale. Above 70 = overbought (may drop), below 30 = oversold (may rise).",
    category: "indicators",
  },
  {
    term: "MACD",
    definition:
      "Moving Average Convergence Divergence — shows the relationship between two EMAs. When the MACD line crosses above the signal line, it's a bullish signal.",
    category: "indicators",
  },
  {
    term: "Bollinger Bands",
    definition:
      "Three lines around price: a middle SMA and upper/lower bands at 2 standard deviations. Price touching the bands may signal reversals.",
    category: "indicators",
  },
  {
    term: "VWAP",
    definition:
      "Volume Weighted Average Price — the average price weighted by volume. Institutional traders use it as a benchmark for fair value.",
    category: "indicators",
  },
  {
    term: "ATR",
    definition:
      "Average True Range — measures price volatility by averaging the range of each period. Higher ATR = more volatile stock.",
    category: "indicators",
  },
  {
    term: "Stochastic",
    definition:
      "Stochastic Oscillator — compares closing price to the price range over N periods (0-100). Above 80 = overbought, below 20 = oversold.",
    category: "indicators",
  },
  {
    term: "Support",
    definition:
      "A price level where buying pressure is strong enough to prevent the price from falling further. Think of it as a floor.",
    category: "indicators",
  },
  {
    term: "Resistance",
    definition:
      "A price level where selling pressure prevents the price from rising further. Think of it as a ceiling.",
    category: "indicators",
  },

  // --- Risk ---
  {
    term: "Position Sizing",
    definition:
      "Deciding how many shares to buy based on your risk tolerance. A common rule is to never risk more than 1-2% of your portfolio on a single trade.",
    category: "risk",
  },
  {
    term: "Diversification",
    definition:
      "Spreading investments across different stocks and sectors to reduce risk. If one stock drops, others may hold steady or rise.",
    category: "risk",
  },
  {
    term: "Risk/Reward Ratio",
    definition:
      "Compares potential loss to potential gain. A 1:3 ratio means you risk $1 to potentially gain $3. Look for trades with at least 1:2.",
    category: "risk",
  },
  {
    term: "Drawdown",
    definition:
      "The decline from a portfolio's peak value to its lowest point. A 10% drawdown means you lost 10% from your highest balance.",
    category: "risk",
  },
  {
    term: "ROI",
    definition:
      "Return on Investment — the percentage gain or loss on your investment. Calculated as (profit / cost) x 100.",
    category: "risk",
    example: "Buy $1000 worth of stock, sell for $1150 → ROI = 15%.",
  },
  {
    term: "Unrealized P&L",
    definition:
      "Profit or loss on positions you still hold. It only becomes 'realized' when you close the position by selling.",
    category: "risk",
  },
  {
    term: "Day Trading",
    definition:
      "Buying and selling stocks within the same trading day. Aims to profit from small intraday price movements.",
    category: "risk",
  },
  {
    term: "Swing Trading",
    definition:
      "Holding stocks for days to weeks to capture medium-term price moves. Less hectic than day trading.",
    category: "risk",
  },

  // --- Fundamental ---
  {
    term: "P/E Ratio",
    definition:
      "Price-to-Earnings Ratio — stock price divided by earnings per share. Shows how much investors pay per dollar of earnings. Lower P/E may indicate a cheaper stock.",
    category: "fundamental",
    example: "Stock price $150, EPS $6 → P/E = 25. You pay $25 for every $1 of earnings.",
  },
  {
    term: "EPS",
    definition:
      "Earnings Per Share — company's net profit divided by outstanding shares. Higher EPS means the company is more profitable.",
    category: "fundamental",
    example: "Company earns $1B with 100M shares → EPS = $10.",
  },
  {
    term: "Market Cap",
    definition:
      "Market Capitalization — the total value of all a company's shares. Calculated as share price x total shares outstanding.",
    category: "fundamental",
    example: "AAPL at $200/share x 15B shares = $3T market cap.",
  },
  {
    term: "Dividend",
    definition:
      "A payment made by a company to its shareholders from its profits, usually quarterly. Dividend yield shows the annual return from dividends alone.",
    category: "fundamental",
  },
  {
    term: "Beta",
    definition:
      "Measures a stock's volatility relative to the overall market. Beta > 1 = more volatile than the market, Beta < 1 = less volatile.",
    category: "fundamental",
    example: "Beta 1.5 → stock moves 50% more than the market. If S&P rises 10%, this stock may rise ~15%.",
  },
];

const glossaryMap = new Map<string, GlossaryEntry>();
for (const entry of GLOSSARY) {
  glossaryMap.set(entry.term.toLowerCase(), entry);
}

export function getGlossaryTerm(term: string): GlossaryEntry | undefined {
  return glossaryMap.get(term.toLowerCase());
}

export function getGlossaryByCategory(
  category: GlossaryEntry["category"],
): GlossaryEntry[] {
  return GLOSSARY.filter((e) => e.category === category);
}
