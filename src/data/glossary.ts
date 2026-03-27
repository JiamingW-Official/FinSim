export interface GlossaryEntry {
  term: string;
  definition: string;
  category:
    | "basics"
    | "orders"
    | "indicators"
    | "risk"
    | "fundamental"
    | "personal-finance"
    | "crypto"
    | "macro"
    | "options-advanced"
    | "technical";
  example?: string;
  formula?: string;
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

  // --- Crypto / DeFi ---
  {
    term: "Layer 2",
    definition:
      "A secondary network built on top of a blockchain (Layer 1) to process transactions faster and cheaper, then settle batches back to the main chain. Examples include Arbitrum and Optimism on Ethereum.",
    category: "crypto",
    example:
      "Ethereum mainnet charges $20 in gas fees; Arbitrum (Layer 2) processes the same transaction for $0.10 by batching thousands of transactions together.",
  },
  {
    term: "Gas Fees",
    definition:
      "The transaction costs paid to network validators to process operations on a blockchain. Fees spike during high network congestion and fall during quiet periods. Paid in the chain's native token (ETH on Ethereum).",
    category: "crypto",
    example:
      "Swapping $100 of tokens on Ethereum during peak congestion could cost $40 in gas — making small trades uneconomical.",
  },
  {
    term: "Smart Contract",
    definition:
      "Self-executing code stored on a blockchain that automatically enforces the terms of an agreement when predetermined conditions are met — no intermediary needed. The foundation of DeFi, NFTs, and DAOs.",
    category: "crypto",
    example:
      "A smart contract automatically releases payment to a freelancer when their code passes pre-defined tests — no escrow service required.",
  },
  {
    term: "NFT",
    definition:
      "Non-Fungible Token — a unique digital asset on the blockchain representing ownership of a specific item (art, collectible, in-game item). Unlike fungible tokens (1 BTC = 1 BTC), each NFT is one-of-a-kind and cannot be replicated.",
    category: "crypto",
    example:
      "A digital artwork NFT sold for $69M at Christie's auction in 2021 — the buyer owns a unique blockchain-verified token proving ownership.",
  },
  {
    term: "Tokenomics",
    definition:
      "The economic model governing a cryptocurrency: total supply, emission schedule, distribution (team, investors, public), utility, and burn mechanisms. Good tokenomics align long-term incentives for all participants.",
    category: "crypto",
    example:
      "Bitcoin's tokenomics: fixed 21M supply, halvings every 4 years reduce new supply — programmatic scarcity drives the deflationary thesis.",
  },
  {
    term: "Stablecoin",
    definition:
      "A cryptocurrency pegged to a stable asset (usually the US dollar) to minimize price volatility. Types: fiat-backed (USDC), crypto-backed (DAI), or algorithmic. Used as a safe haven during crypto market downturns.",
    category: "crypto",
    example:
      "Traders sell volatile crypto into USDC during a bear market to preserve dollar value without exiting to traditional banking.",
  },
  {
    term: "DEX",
    definition:
      "Decentralized Exchange — a peer-to-peer trading platform that lets users swap tokens directly from their wallets using smart contracts and liquidity pools. No company holds your funds. Examples: Uniswap, Curve.",
    category: "crypto",
    example:
      "On Uniswap (DEX), you swap ETH for USDC directly from your MetaMask wallet — no account, no KYC, no company custody.",
  },
  {
    term: "CEX",
    definition:
      "Centralized Exchange — a traditional crypto exchange run by a company that holds custody of user funds (like a bank). Examples: Coinbase, Binance, Kraken. Easier to use but carries counterparty risk.",
    category: "crypto",
    example:
      "Coinbase (CEX) holds your Bitcoin in their custody. When FTX (another CEX) collapsed in 2022, customers lost $8B in funds they thought they owned.",
  },
  {
    term: "Bridge",
    definition:
      "A protocol that transfers tokens between different blockchains — for example, moving ETH from Ethereum mainnet to Arbitrum. Bridges lock assets on the source chain and mint wrapped equivalents on the destination chain.",
    category: "crypto",
    example:
      "Bridging 1 ETH from Ethereum to Polygon takes about 7 minutes and costs a small fee — enabling cheaper transactions on the L2.",
  },
  {
    term: "Cold Wallet",
    definition:
      "A hardware device or offline method for storing cryptocurrency private keys completely disconnected from the internet. Maximum security for long-term holdings. Examples: Ledger, Trezor. Contrast with hot wallets (online).",
    category: "crypto",
    example:
      "Keeping $100K+ in crypto on a Ledger cold wallet means a hacker compromising your computer cannot steal your funds.",
  },

  // --- Macro ---
  {
    term: "Yield Curve Inversion",
    definition:
      "When short-term Treasury yields rise above long-term yields (e.g., 2-year rate > 10-year rate) — the opposite of the normal relationship. Has preceded every US recession in the last 50 years, typically by 12–18 months.",
    category: "macro",
    example:
      "When the 2-year yield hit 5.1% vs the 10-year at 4.3% in 2023, the inverted curve signaled recession risk — investors in bonds expected rate cuts ahead.",
  },
  {
    term: "Stagflation",
    definition:
      "A toxic economic combination of stagnant growth (or recession), high inflation, and high unemployment simultaneously. Stagflation is the central bank's nightmare — raising rates fights inflation but worsens unemployment.",
    category: "macro",
    example:
      "1970s stagflation: US inflation at 13%, unemployment at 9%, GDP stagnating — the Fed eventually raised rates to 20% to break it.",
  },
  {
    term: "Velocity of Money",
    definition:
      "How frequently each dollar changes hands in the economy over a given period. High velocity = a dollar is spent quickly, stimulating growth. Low velocity = money sits idle in savings, reducing economic activity.",
    category: "macro",
    example:
      "During COVID-19, velocity collapsed as stimulus checks went into savings accounts rather than consumer spending — blunting inflation initially.",
  },
  {
    term: "M2 Money Supply",
    definition:
      "A broad measure of money in circulation: cash, checking deposits, savings accounts, money market funds, and small CDs. Rapid M2 expansion often precedes inflation. The Fed monitors M2 to calibrate monetary policy.",
    category: "macro",
    example:
      "The Fed expanded M2 by $6 trillion (40%) during 2020–2021 COVID stimulus, which many economists cite as a leading cause of the subsequent 9% inflation peak.",
  },
  {
    term: "Repo Market",
    definition:
      "The overnight lending market where banks and financial institutions borrow cash short-term using securities as collateral (repurchase agreements). Stress in repo markets can signal broader financial system liquidity problems.",
    category: "macro",
    example:
      "In September 2019, repo rates spiked to 10% overnight (from ~2%) — the Fed injected $75B to calm the market and prevent a broader liquidity crisis.",
  },

  // --- Options Advanced ---
  {
    term: "Pin Risk",
    definition:
      "The uncertainty for options traders when a stock closes exactly at or very near a strike price on expiration day. Sellers don't know whether the option will be exercised, creating overnight risk from an unexpected stock position.",
    category: "options-advanced",
    example:
      "You sold a $150 call. Stock closes at $150.02 on expiration Friday. The buyer might or might not exercise — you could wake up Monday short 100 shares of stock.",
  },
  {
    term: "Gamma Squeeze",
    definition:
      "A rapid price surge caused by market makers buying shares to hedge the gamma exposure of options they sold. As a stock rises, market makers must buy more shares to stay delta-neutral, which drives the price even higher in a feedback loop.",
    category: "options-advanced",
    example:
      "Heavy call buying in GME forced market makers to buy millions of shares as hedges, accelerating the stock's rise from $20 to $480 — the gamma squeeze amplified the move dramatically.",
  },
  {
    term: "Theta Gang",
    definition:
      "A community of options traders who primarily sell options (covered calls, cash-secured puts, iron condors) to systematically collect theta (time decay) premium. Their edge: options expire worthless about 70% of the time.",
    category: "options-advanced",
    example:
      "Selling a monthly cash-secured put on AAPL at the 30-delta strike collects $3 in premium. If AAPL stays above strike, full $300/contract profit. Theta gang collects premium 'like an insurance company.'",
  },
  {
    term: "Vol Crush",
    definition:
      "The rapid collapse in implied volatility (IV) immediately after a highly anticipated event like earnings, FDA approval, or Fed announcement. Options buyers lose money even if they correctly predicted the direction, because IV collapses faster than the move gains.",
    category: "options-advanced",
    example:
      "AAPL options had IV of 45% into earnings. Stock moved up 4% (as expected) but IV crashed to 22% after — options buyers who were correct still lost 30% on their calls due to vol crush.",
  },
  {
    term: "LEAPS",
    definition:
      "Long-Term Equity Anticipation Securities — options contracts with expiration dates more than one year away. Used as a low-cost substitute for stock ownership, providing leveraged exposure with capped downside.",
    category: "options-advanced",
    example:
      "Buy a 2-year $150 call on a $175 stock for $35 (delta 0.70). If stock rises to $225, call worth ~$75 — a 2× return vs the stock's 29% gain, with only $35 at risk.",
  },
  {
    term: "Synthetic Position",
    definition:
      "A combination of options (and sometimes stock) that replicates the payoff of another instrument. A synthetic long = long call + short put at the same strike. Allows traders to gain exposure without direct ownership.",
    category: "options-advanced",
    example:
      "Synthetic long stock: buy $200 call + sell $200 put at same expiration. Same payoff as owning 100 shares, but requires only margin rather than full capital.",
  },
  {
    term: "Delta Neutral",
    definition:
      "A portfolio or position with a total delta of approximately zero — meaning small price moves in the underlying asset have minimal impact on total P&L. Used by traders who want to profit from volatility or time decay while hedging directional risk.",
    category: "options-advanced",
    example:
      "Sell an at-the-money straddle (delta ~0 overall) and profit from theta decay as long as the stock stays in a narrow range — the position makes money from time, not direction.",
  },

  // --- Technical Analysis ---
  {
    term: "Anchored VWAP",
    definition:
      "VWAP calculated from a specific starting point chosen by the trader (e.g., a major low, earnings date, or breakout date) rather than the daily open. Shows the average price paid by all participants since that key event.",
    category: "technical",
    example:
      "Anchoring VWAP to an earnings gap date shows whether buyers who chased the gap-up are now sitting at a profit or loss — key context for support/resistance levels.",
  },
  {
    term: "Market Profile",
    definition:
      "A charting method that displays price distribution over time as a bell curve rotated 90 degrees. Shows where the most trading occurred (Point of Control), and the Value Area — the price range containing 70% of volume.",
    category: "technical",
    example:
      "Market Profile shows $183–$189 as the Value Area High and Low for a session. A return to $185 (POC) is likely to find support from traders anchored to that fair-value zone.",
  },
  {
    term: "Volume Profile",
    definition:
      "A histogram displayed on the price axis showing how much volume traded at each price level over a selected period. Identifies high-volume nodes (strong support/resistance) and low-volume nodes (price moves quickly through these).",
    category: "technical",
    example:
      "A large high-volume node at $185 means millions of shares changed hands there — price tends to return to high-volume nodes as participants defend their cost basis.",
  },
  {
    term: "Point of Control",
    definition:
      "The single price level with the highest traded volume in a Volume Profile or Market Profile. Acts as a strong magnet for price — gaps away from the POC often close as price mean-reverts back to where most volume occurred.",
    category: "technical",
    example:
      "Stock rallies to $205 but the Volume Profile POC is at $188. Traders watch for a pullback toward $188 as participants who bought at the POC defend their positions.",
  },
  {
    term: "Value Area",
    definition:
      "The price range in a Volume or Market Profile where approximately 70% of the day's volume was traded. The Value Area High (VAH) and Value Area Low (VAL) act as key support and resistance levels for the following session.",
    category: "technical",
    example:
      "Yesterday's VAH was $192. Price opens above $192 and holds — bullish sign as buyers control yesterday's high-volume zone. Failure to hold VAH often leads to a 'value area fill' back to the POC.",
  },

  // --- Risk ---
  {
    term: "Tail Risk",
    definition:
      "The probability of rare, extreme market events (beyond 3 standard deviations from the mean) that traditional models underestimate. Tail events cause outsized losses and occur far more frequently than bell-curve models predict.",
    category: "risk",
    example:
      "A portfolio with 'normal' risk metrics can still lose 40% in a tail event like the 2020 COVID crash (34% in 33 days) — standard deviation models assign near-zero probability to such moves.",
  },
  {
    term: "Fat Tails",
    definition:
      "The statistical phenomenon where extreme outcomes (large gains or losses) occur more frequently than a normal distribution predicts. Financial returns have fatter tails than bell curves — catastrophic crashes are more common than models suggest.",
    category: "risk",
    example:
      "A normal distribution says a 5-standard-deviation daily move should happen once in 3.5 million trading days. In reality, markets see such moves several times per decade.",
  },
  {
    term: "Black Swan",
    definition:
      "A term coined by Nassim Taleb for high-impact, nearly unpredictable events that are rationalized in hindsight as 'obvious.' Financial black swans: the 2008 financial crisis, COVID market crash, dot-com collapse. Risk managers try to ensure portfolios survive them.",
    category: "risk",
    example:
      "No quantitative model predicted Lehman Brothers collapsing in 2008. After the fact, analysts said the signs were obvious — classic black swan rationalization bias.",
  },
  {
    term: "Correlation Breakdown",
    definition:
      "When assets that historically moved independently suddenly move together during a crisis, eliminating diversification benefits precisely when you need them most. In a panic, 'all correlations go to 1.'",
    category: "risk",
    example:
      "During the 2008 crisis, stocks, real estate, corporate bonds, and commodities all fell simultaneously — investors who thought they were diversified discovered their assets were all correlated to credit risk.",
  },
  {
    term: "Liquidity Risk",
    definition:
      "The risk of being unable to sell a position quickly at a fair price. In a crisis, bid/ask spreads widen dramatically and buyers disappear. Illiquid positions can cause forced selling at catastrophic prices.",
    category: "risk",
    example:
      "A hedge fund holding illiquid mortgage securities in 2008 couldn't sell even at 50 cents on the dollar — the market simply had no buyers, forcing the fund to liquidate at a fraction of book value.",
  },
  {
    term: "Basis Risk",
    definition:
      "The risk that a hedge doesn't perfectly offset the underlying exposure because the hedge instrument moves differently than expected. Arises when the hedging asset and the position being hedged aren't perfectly correlated.",
    category: "risk",
    example:
      "An airline hedges fuel costs by buying oil futures, but jet fuel prices (the actual cost) and crude oil futures don't move in lockstep — basis risk means the hedge is imperfect and residual exposure remains.",
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
