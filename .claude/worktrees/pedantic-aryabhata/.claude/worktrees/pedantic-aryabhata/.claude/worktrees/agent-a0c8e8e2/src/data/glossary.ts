export interface GlossaryEntry {
  term: string;
  definition: string;
  category: "basics" | "orders" | "indicators" | "risk" | "fundamental" | "personal-finance";
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
  {
    term: "Forward P/E",
    definition:
      "Valuation using the next 12 months' estimated earnings instead of past earnings. A lower Forward P/E than trailing P/E means analysts expect earnings to grow — the company is getting cheaper relative to future profits.",
    category: "fundamental",
    example: "NVDA trailing P/E 55× vs Forward P/E 35× means analysts expect rapid earnings growth to shrink the multiple.",
  },
  {
    term: "EV/EBITDA",
    definition:
      "Enterprise Value divided by Earnings Before Interest, Taxes, Depreciation, and Amortization. Compares companies across different capital structures (debt levels). Often called the 'takeover multiple.'",
    category: "fundamental",
    example: "A 20× EV/EBITDA for a tech company is considered normal; above 40× suggests premium growth expectations.",
  },
  {
    term: "Gross Margin",
    definition:
      "Revenue minus cost of goods sold, expressed as a percentage of revenue. High gross margin (>50%) signals pricing power — the company can charge more than it costs to produce. Margin compression is a red flag.",
    category: "fundamental",
    example: "Apple's 46% gross margin vs a hardware competitor's 22% shows Apple's brand premium and product mix advantage.",
  },
  {
    term: "Operating Margin",
    definition:
      "Operating income divided by revenue. Shows how efficiently the company runs its core business after paying operating expenses (salaries, rent, R&D) but before interest and taxes.",
    category: "fundamental",
    example: "A company with 30% operating margin keeps $0.30 of every revenue dollar as operating profit — very healthy for tech.",
  },
  {
    term: "Net Margin",
    definition:
      "Net income divided by revenue. The true bottom line — what percentage of every sales dollar becomes profit after all expenses, interest, and taxes. Hard to manipulate like operating metrics.",
    category: "fundamental",
    example: "AAPL net margin ~25% means Apple keeps $0.25 of every dollar of revenue as pure profit.",
  },
  {
    term: "ROE",
    definition:
      "Return on Equity — net income divided by shareholders' equity. Measures how effectively management converts invested capital into profit. Above 15% is considered strong; above 30% is exceptional.",
    category: "fundamental",
    example: "ROE of 147% means AAPL generates $1.47 in profit for every $1 of equity — exceptional capital efficiency.",
  },
  {
    term: "Debt-to-Equity",
    definition:
      "Total debt divided by shareholders' equity. Measures financial leverage. High D/E means the company relies heavily on borrowed money — riskier in downturns but can amplify returns in good times.",
    category: "fundamental",
    example: "D/E of 2.0 means the company has $2 of debt for every $1 of equity — moderate leverage for established firms.",
  },
  {
    term: "Current Ratio",
    definition:
      "Current assets divided by current liabilities. Measures ability to pay short-term obligations. Above 1.5 is healthy; below 1.0 signals potential liquidity risk.",
    category: "fundamental",
    example: "Current ratio 1.8 means the company has $1.80 in liquid assets for every $1 of upcoming bills — comfortable buffer.",
  },
  {
    term: "Free Cash Flow",
    definition:
      "Cash generated from operations minus capital expenditures. Unlike earnings, FCF is hard to manipulate with accounting. Companies with strong FCF can fund growth, pay dividends, or buy back shares.",
    category: "fundamental",
    example: "AAPL FCF of $108B/year funds its massive buyback program — Warren Buffett calls FCF the real earnings number.",
  },
  {
    term: "Short Float",
    definition:
      "The percentage of a company's tradeable shares currently sold short by bearish traders. High short float (>15%) can trigger violent short squeezes if positive news forces covering.",
    category: "fundamental",
    example: "A stock with 35% short float that beats earnings expectations can surge 30%+ as shorts rush to cover losses.",
  },
  {
    term: "Short Squeeze",
    definition:
      "When a heavily-shorted stock rises rapidly, forcing short-sellers to buy shares to close positions, which pushes the price even higher in a self-reinforcing feedback loop.",
    category: "fundamental",
    example: "GameStop (GME) went from $20 to $480 in days during a famous 2021 short squeeze as retail traders piled in.",
  },
  {
    term: "Earnings Surprise",
    definition:
      "The difference between actual reported EPS and Wall Street analyst consensus estimate. Positive surprise (beat) often causes gap-ups; negative surprise (miss) causes gap-downs.",
    category: "fundamental",
    example: "Company estimates $1.50 EPS, reports $1.68 → +12% positive surprise. Stocks often move 5–10% on a 10%+ surprise.",
  },
  {
    term: "Analyst Rating",
    definition:
      "Consensus recommendation from Wall Street analysts: Strong Buy → Buy → Hold → Sell → Strong Sell. Most analysts cluster around 'Buy' — a 'Hold' is often their polite way of saying 'avoid.'",
    category: "fundamental",
    example: "42 analysts cover AAPL: 28 Buy, 10 Hold, 4 Sell → consensus rating is Buy with $245 price target.",
  },
  {
    term: "Price Target",
    definition:
      "An analyst's 12-month price forecast for a stock. The consensus price target is the average across all covering analysts. Upside to PT = (PT − current price) / current price × 100%.",
    category: "fundamental",
    example: "Stock at $188, consensus PT $245 → 30% upside to target. High PT range ($195–$300) shows analyst disagreement.",
  },
  {
    term: "P/B Ratio",
    definition:
      "Price-to-Book Ratio: share price divided by book value per share (assets minus liabilities). Value investors traditionally look for P/B below 1 (trading below asset value). Less useful for asset-light tech firms.",
    category: "fundamental",
    example: "Bank stock P/B 0.85 means you're buying $1 of bank assets for $0.85 — a potential value opportunity.",
  },
  {
    term: "P/S Ratio",
    definition:
      "Price-to-Sales Ratio: market cap divided by annual revenue. Useful for growth companies without earnings yet. High P/S requires strong revenue growth to justify the premium.",
    category: "fundamental",
    example: "SaaS startup P/S of 20× is expensive but may be justified if revenue is growing 50% annually.",
  },
  {
    term: "PEG Ratio",
    definition:
      "P/E Ratio divided by the annual earnings growth rate. Peter Lynch popularized this: PEG below 1.0 may indicate undervalued relative to growth; above 2.0 may be expensive even if growth is fast.",
    category: "fundamental",
    example: "Stock with P/E 40 and 40% earnings growth has PEG of 1.0 — fairly priced for its growth rate.",
  },
  {
    term: "Dividend Payout Ratio",
    definition:
      "Percentage of earnings paid as dividends. High payout (>80%) leaves little for reinvestment; low payout (<30%) signals reinvestment focus. A payout over 100% means dividends exceed earnings — unsustainable.",
    category: "fundamental",
    example: "Payout ratio 40%: for every $1 earned, $0.40 goes to dividends and $0.60 is reinvested into growth.",
  },
  {
    term: "Float",
    definition:
      "The total number of shares available for public trading, excluding locked-up shares held by insiders, institutions with restrictions, or the company itself. Smaller float = more volatile price moves.",
    category: "fundamental",
    example: "Company with 100M total shares outstanding but 40M insider shares has a float of only 60M — easier to move.",
  },
  {
    term: "Earnings Catalyst",
    definition:
      "A scheduled event that could significantly move a stock price: quarterly earnings report, product launch, FDA drug approval decision, analyst day, or major contract announcement.",
    category: "fundamental",
    example: "An FDA approval date 3 weeks away is a catalyst — biotech stocks often double or lose 60% on these events.",
  },
  {
    term: "Sector Rotation",
    definition:
      "The movement of investment capital from one industry sector to another as economic conditions change. Early cycle: Financials, Consumer Discretionary. Late cycle: Energy, Materials. Recession: Utilities, Healthcare.",
    category: "fundamental",
    example: "Rising interest rates → investors rotate from growth tech into banks and value stocks that benefit from higher rates.",
  },
  {
    term: "Valuation Premium",
    definition:
      "When a stock trades at a higher P/E or other multiple than its peers, justified by superior growth, competitive moat, management quality, or recurring revenue quality.",
    category: "fundamental",
    example: "NVDA trades at 2× its sector's average P/E — the premium reflects its AI dominance and pricing power in GPUs.",
  },
  {
    term: "Bull Case",
    definition:
      "The optimistic scenario for a stock — what needs to go right for the stock to hit the analyst's high price target. Usually assumes best-case revenue growth, margin expansion, and multiple expansion.",
    category: "fundamental",
    example: "AAPL bull case ($300 PT): iPhone supercycle + Services revenue grows 20%/year + Vision Pro hits mainstream adoption.",
  },
  {
    term: "Bear Case",
    definition:
      "The pessimistic scenario — what risks or negative events could send the stock to its low price target. Important for risk management: always know the bear case before buying.",
    category: "fundamental",
    example: "AAPL bear case ($195 PT): China revenue declines, antitrust forces App Store changes, consumer spending slows.",
  },
  {
    term: "Revenue Growth YoY",
    definition:
      "Year-over-year revenue increase expressed as a percentage. One of the most important growth metrics — consistently high revenue growth (>20%) usually justifies premium valuations.",
    category: "fundamental",
    example: "NVDA revenue grew +122% YoY in fiscal 2024 driven by AI/data center demand — unprecedented for a company its size.",
  },
  {
    term: "EPS Growth",
    definition:
      "Increase in earnings per share compared to the same period in the prior year. Drives stock valuations long-term — ultimately stock prices follow EPS trends. Negative EPS growth is a significant red flag.",
    category: "fundamental",
    example: "TSLA EPS growth of -52% YoY — earnings declining rapidly despite still-positive EPS. This drove significant multiple compression.",
  },
  {
    term: "Insider Ownership",
    definition:
      "Percentage of outstanding shares owned by company executives, directors, and major shareholders. High insider ownership (>10%) aligns management incentives with shareholders — they win only when you win.",
    category: "fundamental",
    example: "Founders who own 20%+ of their company have strong incentive to maximize long-term value — skin in the game.",
  },
  // --- Personal Finance ---
  {
    term: "Budget",
    definition:
      "A plan for how you allocate your income across needs, wants, savings, and investments. The 50/30/20 rule is a popular framework: 50% needs, 30% wants, 20% savings.",
    category: "personal-finance",
    example: "On a $5,000/month salary: $2,500 for rent/groceries, $1,500 for entertainment, $1,000 for savings and investing.",
  },
  {
    term: "Compound Interest",
    definition:
      "Interest earned on both the original principal and previously accumulated interest. Over long periods, compounding creates exponential growth — the 'eighth wonder of the world.'",
    category: "personal-finance",
    example: "$10,000 at 8% compounded annually becomes $46,610 in 20 years without adding a single dollar.",
  },
  {
    term: "Emergency Fund",
    definition:
      "3-6 months of living expenses held in a liquid, safe account (like a high-yield savings account). Protects you from selling investments at a loss when unexpected expenses arise.",
    category: "personal-finance",
  },
  {
    term: "Dollar-Cost Averaging",
    definition:
      "Investing a fixed dollar amount at regular intervals regardless of market conditions. Reduces the impact of volatility by buying more shares when prices are low and fewer when high.",
    category: "personal-finance",
    example: "Investing $500 on the 1st of every month into an S&P 500 index fund.",
  },
  {
    term: "401(k)",
    definition:
      "Employer-sponsored retirement account. Contributions are pre-tax (reducing your taxable income now), and investments grow tax-deferred until withdrawal in retirement. Many employers match contributions — that is free money.",
    category: "personal-finance",
  },
  {
    term: "Roth IRA",
    definition:
      "Individual retirement account funded with after-tax dollars. All growth and qualified withdrawals are completely tax-free. Best for young investors who expect to be in higher tax brackets later.",
    category: "personal-finance",
    example: "Contributing $7,000/year in your 20s at 8% returns could grow to $1M+ tax-free by retirement.",
  },
  {
    term: "Credit Score",
    definition:
      "A number (300-850) that represents your creditworthiness. Based on payment history (35%), utilization (30%), history length (15%), credit mix (10%), and new credit (10%). Affects loan rates, approvals, and sometimes job offers.",
    category: "personal-finance",
  },
  {
    term: "Index Fund",
    definition:
      "A mutual fund or ETF that tracks a market index (like the S&P 500). Provides instant diversification across hundreds of stocks with very low fees. Warren Buffett recommends them for most investors.",
    category: "personal-finance",
    example: "VTI (Vanguard Total Market) holds 3,600+ US stocks with a 0.03% expense ratio.",
  },
  {
    term: "Inflation",
    definition:
      "The rate at which prices increase over time, reducing your purchasing power. Historically averages ~3% per year. Cash in a 0.5% savings account loses real value — investing is the primary defense.",
    category: "personal-finance",
    example: "$100 in 2000 would need to be $180 in 2024 to buy the same goods, due to ~3% annual inflation.",
  },
  {
    term: "Rule of 72",
    definition:
      "Quick mental math to estimate how many years to double your money: divide 72 by the annual return rate. At 8% returns: 72/8 = 9 years to double.",
    category: "personal-finance",
  },
  {
    term: "Net Worth",
    definition:
      "Total assets (cash, investments, property) minus total liabilities (debts, loans). The single most important number for measuring financial health. Track it monthly.",
    category: "personal-finance",
  },
  {
    term: "Expense Ratio",
    definition:
      "The annual fee charged by a fund, expressed as a percentage of assets. A 0.03% expense ratio on $10,000 costs $3/year. Low-cost index funds typically charge 0.03-0.20%, while actively managed funds charge 0.50-1.50%.",
    category: "personal-finance",
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
