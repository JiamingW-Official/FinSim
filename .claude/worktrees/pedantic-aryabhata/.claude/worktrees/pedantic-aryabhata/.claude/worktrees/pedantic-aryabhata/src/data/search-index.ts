// Static search index — pre-built array of all searchable content.
// No external libraries. Fuzzy match: normalize to lowercase, match
// if any keyword includes the query string as a substring.

export type SearchResultType =
  | "page"
  | "glossary"
  | "indicator"
  | "strategy"
  | "lesson";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  href: string;
  keywords: string[];
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
const PAGE_RESULTS: SearchResult[] = [
  {
    id: "page-home",
    type: "page",
    title: "Home",
    description: "Dashboard overview with market summary and recent activity",
    href: "/home",
    keywords: ["home", "dashboard", "overview", "summary", "start"],
  },
  {
    id: "page-trade",
    type: "page",
    title: "Trade",
    description: "Buy and sell stocks with real-time charts and order entry",
    href: "/trade",
    keywords: ["trade", "buy", "sell", "order", "chart", "stock", "candlestick", "position"],
  },
  {
    id: "page-options",
    type: "page",
    title: "Options",
    description: "Options chain, strategy builder, Greeks and payoff diagrams",
    href: "/options",
    keywords: [
      "options", "chain", "calls", "puts", "greeks", "delta", "gamma", "theta", "vega",
      "payoff", "strategy", "iron condor", "straddle", "covered call", "spread",
    ],
  },
  {
    id: "page-portfolio",
    type: "page",
    title: "Portfolio",
    description: "View your positions, P&L, equity curve and trade journal",
    href: "/portfolio",
    keywords: [
      "portfolio", "positions", "pnl", "profit", "loss", "equity", "curve",
      "journal", "trade history", "returns", "performance",
    ],
  },
  {
    id: "page-backtest",
    type: "page",
    title: "Backtest",
    description: "Test trading strategies against historical data with analytics",
    href: "/backtest",
    keywords: [
      "backtest", "strategy", "historical", "simulate", "test", "analytics",
      "monte carlo", "sharpe", "drawdown", "returns",
    ],
  },
  {
    id: "page-market",
    type: "page",
    title: "Market Intel",
    description: "Sector rotation, breadth indicators, macro dashboard and screener",
    href: "/market",
    keywords: [
      "market", "intel", "sector", "rotation", "breadth", "macro", "screener",
      "sentiment", "volume", "dark pool", "options flow", "earnings",
    ],
  },
  {
    id: "page-predictions",
    type: "page",
    title: "Predictions",
    description: "Prediction markets — forecast price moves and earn XP",
    href: "/predictions",
    keywords: [
      "predictions", "forecast", "predict", "market", "price target",
      "probability", "bet", "contest",
    ],
  },
  {
    id: "page-learn",
    type: "page",
    title: "Learn",
    description: "Structured lessons on trading, indicators, risk and personal finance",
    href: "/learn",
    keywords: [
      "learn", "lessons", "education", "course", "tutorial", "quiz",
      "practice", "skill", "basics", "indicators", "risk", "fundamentals",
    ],
  },
  {
    id: "page-challenges",
    type: "page",
    title: "Challenges",
    description: "Daily trading challenges and scenario simulations",
    href: "/challenges",
    keywords: ["challenges", "daily", "scenario", "mission", "challenge", "xp"],
  },
  {
    id: "page-quests",
    type: "page",
    title: "Quests",
    description: "Weekly and milestone quests for XP and rewards",
    href: "/quests",
    keywords: ["quests", "mission", "weekly", "milestone", "rewards", "xp"],
  },
  {
    id: "page-arena",
    type: "page",
    title: "Arena",
    description: "Compete against other traders in real-time matchmaking",
    href: "/arena",
    keywords: ["arena", "pvp", "compete", "match", "vs", "multiplayer", "battle"],
  },
  {
    id: "page-leaderboard",
    type: "page",
    title: "Leaderboard",
    description: "Global rankings by portfolio performance and XP",
    href: "/leaderboard",
    keywords: ["leaderboard", "ranking", "top", "best", "score", "global"],
  },
  {
    id: "page-profile",
    type: "page",
    title: "Profile",
    description: "Your stats, achievements, PnL histogram and career overview",
    href: "/profile",
    keywords: ["profile", "stats", "achievements", "career", "badge", "avatar"],
  },
  {
    id: "page-settings",
    type: "page",
    title: "Settings",
    description: "App preferences, sound, colorblind mode, and display options",
    href: "/settings",
    keywords: ["settings", "preferences", "sound", "theme", "colorblind", "display", "config"],
  },
];

// ---------------------------------------------------------------------------
// Glossary terms (basics, orders, indicators, risk, fundamental, personal-finance)
// ---------------------------------------------------------------------------
const GLOSSARY_RESULTS: SearchResult[] = [
  // Basics
  {
    id: "gloss-stock",
    type: "glossary",
    title: "Stock",
    description: "A share of ownership in a company — you own a small piece of that company.",
    href: "/learn",
    keywords: ["stock", "equity", "share", "ownership", "company"],
  },
  {
    id: "gloss-portfolio",
    type: "glossary",
    title: "Portfolio",
    description: "The collection of all your investments — stocks, cash, and other assets.",
    href: "/portfolio",
    keywords: ["portfolio", "investments", "holdings", "assets"],
  },
  {
    id: "gloss-volume",
    type: "glossary",
    title: "Volume",
    description: "Number of shares traded in a given period. High volume = lots of activity.",
    href: "/trade",
    keywords: ["volume", "shares traded", "activity", "liquidity"],
  },
  {
    id: "gloss-ohlc",
    type: "glossary",
    title: "OHLC",
    description: "Open, High, Low, Close — the four key prices for each trading period.",
    href: "/trade",
    keywords: ["ohlc", "open", "high", "low", "close", "prices"],
  },
  {
    id: "gloss-candlestick",
    type: "glossary",
    title: "Candlestick",
    description: "Chart element showing OHLC. Green body = price went up, red = price went down.",
    href: "/learn",
    keywords: ["candlestick", "candle", "chart", "ohlc", "green", "red", "wick"],
  },
  {
    id: "gloss-bull-market",
    type: "glossary",
    title: "Bull Market",
    description: "A market where prices are rising or expected to rise.",
    href: "/learn",
    keywords: ["bull", "bull market", "bullish", "rising", "uptrend"],
  },
  {
    id: "gloss-bear-market",
    type: "glossary",
    title: "Bear Market",
    description: "A market where prices are falling (typically 20%+ decline).",
    href: "/learn",
    keywords: ["bear", "bear market", "bearish", "falling", "downtrend", "decline"],
  },
  {
    id: "gloss-long",
    type: "glossary",
    title: "Long",
    description: "Buying a stock expecting the price to go up. Profit when you sell higher.",
    href: "/trade",
    keywords: ["long", "buy", "bullish", "upside", "long position"],
  },
  {
    id: "gloss-short",
    type: "glossary",
    title: "Short",
    description: "Selling borrowed shares expecting the price to drop, buying back cheaper.",
    href: "/trade",
    keywords: ["short", "short sell", "bearish", "borrow", "short position"],
  },
  {
    id: "gloss-bid-ask",
    type: "glossary",
    title: "Bid/Ask",
    description: "Bid = highest price a buyer will pay; Ask = lowest a seller will accept.",
    href: "/trade",
    keywords: ["bid", "ask", "spread", "bid ask", "market price"],
  },
  {
    id: "gloss-spread",
    type: "glossary",
    title: "Spread",
    description: "Difference between bid and ask price. Tighter = more liquid market.",
    href: "/trade",
    keywords: ["spread", "bid ask spread", "liquidity", "cost"],
  },
  {
    id: "gloss-volatility",
    type: "glossary",
    title: "Volatility",
    description: "How much a stock's price fluctuates — high volatility = big price swings.",
    href: "/learn",
    keywords: ["volatility", "vol", "vix", "price swings", "risk", "iv"],
  },
  {
    id: "gloss-liquidity",
    type: "glossary",
    title: "Liquidity",
    description: "How easily you can buy/sell without affecting price. High volume = liquid.",
    href: "/learn",
    keywords: ["liquidity", "liquid", "volume", "buy sell", "market depth"],
  },
  // Orders
  {
    id: "gloss-market-order",
    type: "glossary",
    title: "Market Order",
    description: "Buy or sell immediately at current market price. Fast but price may vary.",
    href: "/trade",
    keywords: ["market order", "order", "buy", "sell", "immediate", "execution"],
  },
  {
    id: "gloss-limit-order",
    type: "glossary",
    title: "Limit Order",
    description: "Order to buy/sell at a specific price or better. Waits for your price.",
    href: "/trade",
    keywords: ["limit order", "limit", "price", "order", "conditional"],
  },
  {
    id: "gloss-stop-loss",
    type: "glossary",
    title: "Stop-Loss",
    description: "Auto-sells your position when price hits a set level to cap losses.",
    href: "/trade",
    keywords: ["stop loss", "stop", "risk management", "auto sell", "loss limit"],
  },
  {
    id: "gloss-take-profit",
    type: "glossary",
    title: "Take-Profit",
    description: "Auto-sells when price hits a target, locking in gains.",
    href: "/trade",
    keywords: ["take profit", "target", "tp", "auto sell", "lock in gains"],
  },
  {
    id: "gloss-slippage",
    type: "glossary",
    title: "Slippage",
    description: "Difference between expected and actual execution price due to market movement.",
    href: "/learn",
    keywords: ["slippage", "execution price", "fill", "market impact"],
  },
  // Indicators
  {
    id: "gloss-sma",
    type: "glossary",
    title: "SMA",
    description: "Simple Moving Average — average closing price over N periods. Shows trend direction.",
    href: "/trade",
    keywords: ["sma", "simple moving average", "average", "trend", "ma", "moving average"],
  },
  {
    id: "gloss-ema",
    type: "glossary",
    title: "EMA",
    description: "Exponential Moving Average — like SMA but reacts faster to recent prices.",
    href: "/trade",
    keywords: ["ema", "exponential moving average", "average", "trend", "moving average"],
  },
  {
    id: "gloss-rsi",
    type: "glossary",
    title: "RSI",
    description: "Relative Strength Index — momentum 0–100. >70 overbought, <30 oversold.",
    href: "/trade",
    keywords: ["rsi", "relative strength index", "momentum", "overbought", "oversold"],
  },
  {
    id: "gloss-macd",
    type: "glossary",
    title: "MACD",
    description: "Moving Average Convergence Divergence — shows relationship between two EMAs.",
    href: "/trade",
    keywords: ["macd", "moving average convergence divergence", "signal", "crossover", "momentum"],
  },
  {
    id: "gloss-bollinger",
    type: "glossary",
    title: "Bollinger Bands",
    description: "Three lines around price: middle SMA + upper/lower bands at 2 std deviations.",
    href: "/trade",
    keywords: ["bollinger", "bollinger bands", "bands", "standard deviation", "squeeze", "breakout"],
  },
  {
    id: "gloss-vwap",
    type: "glossary",
    title: "VWAP",
    description: "Volume Weighted Average Price — institutional fair value benchmark.",
    href: "/trade",
    keywords: ["vwap", "volume weighted average price", "institutional", "fair value", "intraday"],
  },
  {
    id: "gloss-atr",
    type: "glossary",
    title: "ATR",
    description: "Average True Range — measures price volatility per period.",
    href: "/trade",
    keywords: ["atr", "average true range", "volatility", "range", "stop loss sizing"],
  },
  {
    id: "gloss-stochastic",
    type: "glossary",
    title: "Stochastic",
    description: "Compares close to price range (0–100). >80 overbought, <20 oversold.",
    href: "/trade",
    keywords: ["stochastic", "stoch", "oscillator", "overbought", "oversold", "momentum"],
  },
  {
    id: "gloss-support",
    type: "glossary",
    title: "Support",
    description: "Price level where buying pressure prevents further decline — acts as a floor.",
    href: "/learn",
    keywords: ["support", "support level", "floor", "bounce", "demand zone"],
  },
  {
    id: "gloss-resistance",
    type: "glossary",
    title: "Resistance",
    description: "Price level where selling pressure prevents further rise — acts as a ceiling.",
    href: "/learn",
    keywords: ["resistance", "resistance level", "ceiling", "supply zone", "rejection"],
  },
  // Risk
  {
    id: "gloss-position-sizing",
    type: "glossary",
    title: "Position Sizing",
    description: "How many shares to buy based on risk tolerance. Never risk more than 1–2% per trade.",
    href: "/learn",
    keywords: ["position sizing", "size", "risk management", "lot size", "shares"],
  },
  {
    id: "gloss-diversification",
    type: "glossary",
    title: "Diversification",
    description: "Spreading investments across stocks/sectors to reduce risk.",
    href: "/portfolio",
    keywords: ["diversification", "diversify", "spread", "sectors", "risk reduction"],
  },
  {
    id: "gloss-risk-reward",
    type: "glossary",
    title: "Risk/Reward Ratio",
    description: "Compares potential loss to potential gain. Aim for at least 1:2.",
    href: "/learn",
    keywords: ["risk reward", "risk/reward", "rr ratio", "reward", "trade planning"],
  },
  {
    id: "gloss-drawdown",
    type: "glossary",
    title: "Drawdown",
    description: "Decline from a portfolio's peak value to its lowest point.",
    href: "/portfolio",
    keywords: ["drawdown", "max drawdown", "peak", "decline", "loss from peak"],
  },
  {
    id: "gloss-roi",
    type: "glossary",
    title: "ROI",
    description: "Return on Investment — percentage gain or loss on your investment.",
    href: "/portfolio",
    keywords: ["roi", "return", "return on investment", "profit", "gain", "pnl"],
  },
  {
    id: "gloss-unrealized-pnl",
    type: "glossary",
    title: "Unrealized P&L",
    description: "Profit or loss on positions you still hold (not yet locked in).",
    href: "/portfolio",
    keywords: ["unrealized", "pnl", "open position", "paper profit", "floating pnl"],
  },
  // Fundamentals
  {
    id: "gloss-pe-ratio",
    type: "glossary",
    title: "P/E Ratio",
    description: "Price-to-Earnings Ratio — how much investors pay per dollar of earnings.",
    href: "/trade",
    keywords: ["pe ratio", "p/e", "price earnings", "valuation", "multiple"],
  },
  {
    id: "gloss-eps",
    type: "glossary",
    title: "EPS",
    description: "Earnings Per Share — company's net profit divided by outstanding shares.",
    href: "/trade",
    keywords: ["eps", "earnings per share", "earnings", "profit", "fundamental"],
  },
  {
    id: "gloss-market-cap",
    type: "glossary",
    title: "Market Cap",
    description: "Total value of all a company's shares: share price × total shares.",
    href: "/market",
    keywords: ["market cap", "capitalization", "large cap", "small cap", "size"],
  },
  {
    id: "gloss-dividend",
    type: "glossary",
    title: "Dividend",
    description: "Payment from company profits to shareholders, usually quarterly.",
    href: "/learn",
    keywords: ["dividend", "yield", "income", "payout", "quarterly"],
  },
  {
    id: "gloss-beta",
    type: "glossary",
    title: "Beta",
    description: "Stock volatility relative to the market. >1 = more volatile than market.",
    href: "/trade",
    keywords: ["beta", "volatility", "market", "correlation", "risk"],
  },
  {
    id: "gloss-forward-pe",
    type: "glossary",
    title: "Forward P/E",
    description: "Valuation using next 12-month estimated earnings rather than past.",
    href: "/trade",
    keywords: ["forward pe", "forward p/e", "estimated earnings", "valuation", "multiple"],
  },
  {
    id: "gloss-ev-ebitda",
    type: "glossary",
    title: "EV/EBITDA",
    description: "Enterprise value divided by EBITDA — the 'takeover multiple'.",
    href: "/trade",
    keywords: ["ev/ebitda", "ebitda", "enterprise value", "valuation", "multiple"],
  },
  {
    id: "gloss-gross-margin",
    type: "glossary",
    title: "Gross Margin",
    description: "Revenue minus cost of goods sold as % of revenue. High = pricing power.",
    href: "/trade",
    keywords: ["gross margin", "margin", "profit margin", "pricing power"],
  },
  {
    id: "gloss-operating-margin",
    type: "glossary",
    title: "Operating Margin",
    description: "Operating income / revenue — efficiency of core business operations.",
    href: "/trade",
    keywords: ["operating margin", "margin", "operating income", "efficiency"],
  },
  {
    id: "gloss-net-margin",
    type: "glossary",
    title: "Net Margin",
    description: "Net income / revenue — what percentage of every dollar becomes pure profit.",
    href: "/trade",
    keywords: ["net margin", "margin", "profitability", "net income", "bottom line"],
  },
  {
    id: "gloss-roe",
    type: "glossary",
    title: "ROE",
    description: "Return on Equity — how effectively management converts capital into profit.",
    href: "/trade",
    keywords: ["roe", "return on equity", "efficiency", "management", "profitability"],
  },
  {
    id: "gloss-debt-equity",
    type: "glossary",
    title: "Debt-to-Equity",
    description: "Total debt / equity. High D/E = more financial leverage and risk.",
    href: "/trade",
    keywords: ["debt to equity", "d/e", "leverage", "debt", "balance sheet"],
  },
  {
    id: "gloss-current-ratio",
    type: "glossary",
    title: "Current Ratio",
    description: "Current assets / current liabilities. >1.5 healthy, <1 signals liquidity risk.",
    href: "/trade",
    keywords: ["current ratio", "liquidity ratio", "balance sheet", "short term", "solvency"],
  },
  {
    id: "gloss-fcf",
    type: "glossary",
    title: "Free Cash Flow",
    description: "Cash from operations minus capex. Hard to manipulate, the true earnings number.",
    href: "/trade",
    keywords: ["free cash flow", "fcf", "cash flow", "capex", "operations"],
  },
  {
    id: "gloss-short-float",
    type: "glossary",
    title: "Short Float",
    description: "% of tradeable shares sold short. High short float can trigger a short squeeze.",
    href: "/market",
    keywords: ["short float", "short interest", "float", "squeeze", "bearish"],
  },
  {
    id: "gloss-short-squeeze",
    type: "glossary",
    title: "Short Squeeze",
    description: "Heavily shorted stock surges, forcing shorts to cover — price rockets higher.",
    href: "/learn",
    keywords: ["short squeeze", "squeeze", "covering", "short interest", "gamestop"],
  },
  {
    id: "gloss-earnings-surprise",
    type: "glossary",
    title: "Earnings Surprise",
    description: "Actual EPS vs analyst estimate. Beat = gap-up; miss = gap-down.",
    href: "/market",
    keywords: ["earnings surprise", "earnings", "beat", "miss", "eps estimate"],
  },
  {
    id: "gloss-analyst-rating",
    type: "glossary",
    title: "Analyst Rating",
    description: "Consensus recommendation: Strong Buy → Buy → Hold → Sell → Strong Sell.",
    href: "/trade",
    keywords: ["analyst rating", "analyst", "buy rating", "hold", "sell", "consensus"],
  },
  {
    id: "gloss-price-target",
    type: "glossary",
    title: "Price Target",
    description: "Analyst's 12-month price forecast. Consensus PT = average of all analysts.",
    href: "/trade",
    keywords: ["price target", "pt", "analyst", "forecast", "12 month"],
  },
  {
    id: "gloss-pb-ratio",
    type: "glossary",
    title: "P/B Ratio",
    description: "Price-to-Book: share price / book value per share. <1 = trading below asset value.",
    href: "/trade",
    keywords: ["pb ratio", "p/b", "price to book", "book value", "value investing"],
  },
  {
    id: "gloss-ps-ratio",
    type: "glossary",
    title: "P/S Ratio",
    description: "Price-to-Sales: market cap / annual revenue. Used for early-stage growth companies.",
    href: "/trade",
    keywords: ["ps ratio", "p/s", "price to sales", "revenue", "growth"],
  },
  {
    id: "gloss-peg-ratio",
    type: "glossary",
    title: "PEG Ratio",
    description: "P/E divided by earnings growth rate. PEG < 1 may indicate undervalued growth.",
    href: "/trade",
    keywords: ["peg ratio", "peg", "growth", "valuation", "pe ratio"],
  },
];

// ---------------------------------------------------------------------------
// Indicators (15 types from the chart store)
// ---------------------------------------------------------------------------
const INDICATOR_RESULTS: SearchResult[] = [
  {
    id: "ind-sma20",
    type: "indicator",
    title: "SMA 20 — Simple Moving Average (20)",
    description: "Smooths price over 20 bars. Price above SMA = short-term uptrend.",
    href: "/trade",
    keywords: ["sma20", "sma 20", "simple moving average", "20 period", "ma", "trend"],
  },
  {
    id: "ind-sma50",
    type: "indicator",
    title: "SMA 50 — Simple Moving Average (50)",
    description: "Medium-term trend. Golden Cross / Death Cross signals.",
    href: "/trade",
    keywords: ["sma50", "sma 50", "golden cross", "death cross", "medium term", "ma50"],
  },
  {
    id: "ind-ema12",
    type: "indicator",
    title: "EMA 12 — Exponential Moving Average (12)",
    description: "Fast-reacting moving average. Component of MACD.",
    href: "/trade",
    keywords: ["ema12", "ema 12", "exponential moving average", "fast ma", "macd"],
  },
  {
    id: "ind-ema26",
    type: "indicator",
    title: "EMA 26 — Exponential Moving Average (26)",
    description: "Slower exponential moving average. Component of MACD signal line.",
    href: "/trade",
    keywords: ["ema26", "ema 26", "exponential moving average", "slow ma", "macd"],
  },
  {
    id: "ind-bollinger",
    type: "indicator",
    title: "Bollinger Bands",
    description: "Volatility envelope: SMA ± 2 standard deviations. Squeeze signals breakouts.",
    href: "/trade",
    keywords: ["bollinger", "bollinger bands", "bands", "squeeze", "breakout", "standard deviation", "volatility"],
  },
  {
    id: "ind-rsi",
    type: "indicator",
    title: "RSI — Relative Strength Index",
    description: "Momentum oscillator 0–100. Above 70 = overbought, below 30 = oversold.",
    href: "/trade",
    keywords: ["rsi", "relative strength index", "momentum", "overbought", "oversold", "70", "30"],
  },
  {
    id: "ind-macd",
    type: "indicator",
    title: "MACD — Moving Average Convergence Divergence",
    description: "Trend + momentum: MACD line, signal line, and histogram.",
    href: "/trade",
    keywords: ["macd", "moving average convergence divergence", "crossover", "signal", "histogram", "momentum"],
  },
  {
    id: "ind-stochastic",
    type: "indicator",
    title: "Stochastic Oscillator",
    description: "Compares close to N-period range (0–100). >80 overbought, <20 oversold.",
    href: "/trade",
    keywords: ["stochastic", "stoch", "oscillator", "overbought", "oversold", "k line"],
  },
  {
    id: "ind-atr",
    type: "indicator",
    title: "ATR — Average True Range",
    description: "Volatility measure: average price range per bar. Used for stop-loss sizing.",
    href: "/trade",
    keywords: ["atr", "average true range", "volatility", "stop loss", "range", "position sizing"],
  },
  {
    id: "ind-vwap",
    type: "indicator",
    title: "VWAP — Volume Weighted Average Price",
    description: "Volume-weighted price benchmark used by institutional traders.",
    href: "/trade",
    keywords: ["vwap", "volume weighted", "institutional", "intraday", "fair value", "benchmark"],
  },
  {
    id: "ind-adx",
    type: "indicator",
    title: "ADX — Average Directional Index",
    description: "Trend strength 0–100. Above 25 = strong trend; below 20 = weak/ranging.",
    href: "/trade",
    keywords: ["adx", "average directional index", "trend strength", "trending", "ranging", "dmi"],
  },
  {
    id: "ind-obv",
    type: "indicator",
    title: "OBV — On-Balance Volume",
    description: "Cumulative volume that adds on up-days and subtracts on down-days.",
    href: "/trade",
    keywords: ["obv", "on balance volume", "volume", "accumulation", "distribution", "money flow"],
  },
  {
    id: "ind-cci",
    type: "indicator",
    title: "CCI — Commodity Channel Index",
    description: "Measures price deviation from average. ±100 levels are key thresholds.",
    href: "/trade",
    keywords: ["cci", "commodity channel index", "deviation", "overbought", "oversold", "oscillator"],
  },
  {
    id: "ind-williams-r",
    type: "indicator",
    title: "Williams %R",
    description: "Momentum oscillator −100 to 0. Above −20 = overbought, below −80 = oversold.",
    href: "/trade",
    keywords: ["williams r", "williams %r", "percent r", "oscillator", "overbought", "oversold"],
  },
  {
    id: "ind-psar",
    type: "indicator",
    title: "Parabolic SAR",
    description: "Trend-following dots above/below price. Dot flip = potential trend reversal.",
    href: "/trade",
    keywords: ["psar", "parabolic sar", "stop and reverse", "trend", "trailing stop", "reversal"],
  },
];

// ---------------------------------------------------------------------------
// Options strategies (20 from the options-strategies data file)
// ---------------------------------------------------------------------------
const STRATEGY_RESULTS: SearchResult[] = [
  {
    id: "strat-long-call",
    type: "strategy",
    title: "Long Call",
    description: "Buy a call option. Unlimited upside, limited loss to premium. Bullish.",
    href: "/options",
    keywords: ["long call", "call option", "bullish", "unlimited upside", "premium", "options"],
  },
  {
    id: "strat-long-put",
    type: "strategy",
    title: "Long Put",
    description: "Buy a put option. Profits when stock falls. Bearish with defined risk.",
    href: "/options",
    keywords: ["long put", "put option", "bearish", "hedge", "protection", "options"],
  },
  {
    id: "strat-covered-call",
    type: "strategy",
    title: "Covered Call",
    description: "Own stock + sell a call. Income generation, mildly bullish to neutral.",
    href: "/options",
    keywords: ["covered call", "income", "stock", "neutral", "sell call", "options"],
  },
  {
    id: "strat-protective-put",
    type: "strategy",
    title: "Protective Put",
    description: "Own stock + buy a put. Insurance against a sharp decline.",
    href: "/options",
    keywords: ["protective put", "insurance", "hedge", "downside protection", "put", "options"],
  },
  {
    id: "strat-bull-call-spread",
    type: "strategy",
    title: "Bull Call Spread",
    description: "Buy lower call, sell upper call. Moderately bullish, defined risk and reward.",
    href: "/options",
    keywords: ["bull call spread", "debit spread", "bullish", "spread", "defined risk", "options"],
  },
  {
    id: "strat-bear-put-spread",
    type: "strategy",
    title: "Bear Put Spread",
    description: "Buy higher put, sell lower put. Moderately bearish with defined risk.",
    href: "/options",
    keywords: ["bear put spread", "debit spread", "bearish", "spread", "defined risk", "options"],
  },
  {
    id: "strat-iron-condor",
    type: "strategy",
    title: "Iron Condor",
    description: "Sell OTM put spread + sell OTM call spread. Neutral, income generation.",
    href: "/options",
    keywords: [
      "iron condor", "condor", "neutral", "range bound", "income", "theta",
      "credit spread", "options", "sell premium",
    ],
  },
  {
    id: "strat-iron-butterfly",
    type: "strategy",
    title: "Iron Butterfly",
    description: "Sell ATM put + ATM call + buy wings. Very neutral, high premium collected.",
    href: "/options",
    keywords: ["iron butterfly", "butterfly", "neutral", "atm", "premium", "income", "options"],
  },
  {
    id: "strat-long-straddle",
    type: "strategy",
    title: "Long Straddle",
    description: "Buy ATM call + ATM put. Profits from a large move in either direction.",
    href: "/options",
    keywords: ["long straddle", "straddle", "volatility", "earnings play", "big move", "options"],
  },
  {
    id: "strat-long-strangle",
    type: "strategy",
    title: "Long Strangle",
    description: "Buy OTM call + OTM put. Cheaper than straddle, needs even bigger move.",
    href: "/options",
    keywords: ["long strangle", "strangle", "volatility", "otm", "cheaper", "big move", "options"],
  },
  {
    id: "strat-calendar-spread",
    type: "strategy",
    title: "Calendar Spread",
    description: "Sell near-term option, buy longer-dated same strike. Exploits time decay differential.",
    href: "/options",
    keywords: ["calendar spread", "time spread", "time decay", "theta", "horizontal spread", "options"],
  },
  {
    id: "strat-diagonal-spread",
    type: "strategy",
    title: "Diagonal Spread",
    description: "Poor man's covered call. Buy LEAPS, sell near-term OTM calls monthly.",
    href: "/options",
    keywords: ["diagonal spread", "poor mans covered call", "leaps", "income", "options"],
  },
  {
    id: "strat-ratio-call-spread",
    type: "strategy",
    title: "Ratio Call Spread",
    description: "Buy 1 call, sell 2 calls at higher strike. Moderately bullish, can be entered for credit.",
    href: "/options",
    keywords: ["ratio spread", "ratio call spread", "back spread", "options", "credit"],
  },
  {
    id: "strat-collar",
    type: "strategy",
    title: "Collar",
    description: "Own stock + buy put + sell call. Limits both upside and downside.",
    href: "/options",
    keywords: ["collar", "risk collar", "protection", "income", "options", "hedge"],
  },
  {
    id: "strat-cash-secured-put",
    type: "strategy",
    title: "Cash-Secured Put",
    description: "Sell a put with cash to buy shares if assigned. Income + willingness to own stock.",
    href: "/options",
    keywords: ["cash secured put", "csp", "sell put", "income", "assignment", "options"],
  },
  {
    id: "strat-short-straddle",
    type: "strategy",
    title: "Short Straddle",
    description: "Sell ATM call + ATM put. Maximum premium, profits in a very tight range.",
    href: "/options",
    keywords: ["short straddle", "sell straddle", "premium", "neutral", "high risk", "options"],
  },
  {
    id: "strat-short-strangle",
    type: "strategy",
    title: "Short Strangle",
    description: "Sell OTM call + OTM put. Wider profit zone than short straddle, lower premium.",
    href: "/options",
    keywords: ["short strangle", "sell strangle", "credit", "neutral", "otm", "options"],
  },
  {
    id: "strat-vertical-spread",
    type: "strategy",
    title: "Vertical Spread",
    description: "Buy and sell options at different strikes, same expiry. Defined risk and reward.",
    href: "/options",
    keywords: ["vertical spread", "spread", "debit", "credit", "defined risk", "options"],
  },
];

// ---------------------------------------------------------------------------
// Lessons (one entry per lesson from each unit)
// ---------------------------------------------------------------------------
const LESSON_RESULTS: SearchResult[] = [
  // Basics unit
  {
    id: "lesson-basics-1",
    type: "lesson",
    title: "What is a Stock?",
    description: "Equity ownership, share structure, float and why stocks move.",
    href: "/learn",
    keywords: ["stock", "equity", "share", "float", "ownership", "basics"],
  },
  {
    id: "lesson-basics-candlestick",
    type: "lesson",
    title: "Reading Candlestick Charts",
    description: "Understand OHLC, candle bodies, wicks and how to read a chart.",
    href: "/learn",
    keywords: ["candlestick", "chart", "ohlc", "open high low close", "wick", "body", "read chart"],
  },
  {
    id: "lesson-basics-volume",
    type: "lesson",
    title: "Volume & Market Depth",
    description: "Why volume confirms moves and how to use order book depth.",
    href: "/learn",
    keywords: ["volume", "market depth", "order book", "liquidity", "confirm"],
  },
  {
    id: "lesson-basics-support-resistance",
    type: "lesson",
    title: "Support & Resistance",
    description: "Identify key price levels where buyers and sellers repeatedly engage.",
    href: "/learn",
    keywords: ["support", "resistance", "levels", "floor", "ceiling", "price level"],
  },
  // Indicators unit
  {
    id: "lesson-indicators-ma",
    type: "lesson",
    title: "Moving Averages",
    description: "Master SMA, EMA, crossover signals and dynamic support/resistance.",
    href: "/learn",
    keywords: ["moving average", "sma", "ema", "crossover", "golden cross", "death cross"],
  },
  {
    id: "lesson-indicators-rsi",
    type: "lesson",
    title: "RSI & Momentum",
    description: "Use the Relative Strength Index to spot overbought/oversold conditions.",
    href: "/learn",
    keywords: ["rsi", "momentum", "overbought", "oversold", "relative strength"],
  },
  {
    id: "lesson-indicators-macd",
    type: "lesson",
    title: "MACD Deep Dive",
    description: "MACD line, signal line, histogram and divergence patterns.",
    href: "/learn",
    keywords: ["macd", "signal line", "histogram", "divergence", "crossover"],
  },
  {
    id: "lesson-indicators-bollinger",
    type: "lesson",
    title: "Bollinger Bands",
    description: "Volatility bands, squeezes and breakout setups.",
    href: "/learn",
    keywords: ["bollinger bands", "bands", "squeeze", "breakout", "volatility"],
  },
  // Orders unit
  {
    id: "lesson-orders-types",
    type: "lesson",
    title: "Order Types",
    description: "Market, limit, stop-loss, take-profit and when to use each.",
    href: "/learn",
    keywords: ["order types", "market order", "limit order", "stop loss", "take profit"],
  },
  // Risk unit
  {
    id: "lesson-risk-management",
    type: "lesson",
    title: "Risk Management",
    description: "Position sizing, the 1–2% rule, diversification and drawdown control.",
    href: "/learn",
    keywords: ["risk management", "position sizing", "1% rule", "drawdown", "stop loss"],
  },
  {
    id: "lesson-risk-reward",
    type: "lesson",
    title: "Risk/Reward Ratio",
    description: "How to plan trades with favorable risk-to-reward setups.",
    href: "/learn",
    keywords: ["risk reward", "rr ratio", "trade planning", "reward", "setup"],
  },
  // Fundamentals unit
  {
    id: "lesson-fundamentals-pe",
    type: "lesson",
    title: "P/E Ratio & Valuation",
    description: "Understanding P/E, Forward P/E, EV/EBITDA and how to value a stock.",
    href: "/learn",
    keywords: ["pe ratio", "valuation", "forward pe", "ev/ebitda", "cheap", "expensive"],
  },
  {
    id: "lesson-fundamentals-earnings",
    type: "lesson",
    title: "Earnings & Surprises",
    description: "Reading earnings reports, EPS beats/misses and market reactions.",
    href: "/learn",
    keywords: ["earnings", "eps", "earnings surprise", "beat", "miss", "report"],
  },
  // Personal finance unit
  {
    id: "lesson-pf-compound",
    type: "lesson",
    title: "Compound Interest",
    description: "How compounding grows wealth exponentially over time.",
    href: "/learn",
    keywords: ["compound interest", "compounding", "growth", "wealth", "time value"],
  },
  {
    id: "lesson-pf-budgeting",
    type: "lesson",
    title: "Budgeting & Saving",
    description: "Building a budget, emergency fund and saving rate strategies.",
    href: "/learn",
    keywords: ["budgeting", "budget", "saving", "emergency fund", "personal finance"],
  },
  {
    id: "lesson-pf-etf",
    type: "lesson",
    title: "ETFs & Index Investing",
    description: "Passive investing, index funds, ETFs and portfolio construction.",
    href: "/learn",
    keywords: ["etf", "index fund", "passive investing", "vanguard", "sp500", "diversification"],
  },
];

// ---------------------------------------------------------------------------
// Combined index
// ---------------------------------------------------------------------------
export const SEARCH_INDEX: SearchResult[] = [
  ...PAGE_RESULTS,
  ...GLOSSARY_RESULTS,
  ...INDICATOR_RESULTS,
  ...STRATEGY_RESULTS,
  ...LESSON_RESULTS,
];

// ---------------------------------------------------------------------------
// Search function — simple substring match on lowercased keywords + title
// ---------------------------------------------------------------------------
export function searchIndex(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored: Array<{ result: SearchResult; score: number }> = [];

  for (const result of SEARCH_INDEX) {
    const titleLower = result.title.toLowerCase();
    const descLower = result.description.toLowerCase();

    // Exact title match scores highest
    let score = 0;
    if (titleLower === q) score = 100;
    else if (titleLower.startsWith(q)) score = 80;
    else if (titleLower.includes(q)) score = 60;
    else if (descLower.includes(q)) score = 30;

    // Keyword matches
    for (const kw of result.keywords) {
      if (kw === q) { score = Math.max(score, 90); break; }
      if (kw.startsWith(q)) { score = Math.max(score, 70); break; }
      if (kw.includes(q)) { score = Math.max(score, 40); break; }
    }

    if (score > 0) scored.push({ result, score });
  }

  // Sort by score desc, then by type priority: page > indicator > strategy > glossary > lesson
  const TYPE_PRIORITY: Record<SearchResultType, number> = {
    page: 5,
    indicator: 4,
    strategy: 3,
    glossary: 2,
    lesson: 1,
  };

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return TYPE_PRIORITY[b.result.type] - TYPE_PRIORITY[a.result.type];
  });

  return scored.map((s) => s.result).slice(0, 20);
}
