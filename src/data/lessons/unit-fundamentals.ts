import type { Unit } from "./types";

export const UNIT_FUNDAMENTALS: Unit = {
  id: "fundamentals",
  title: "Fundamentals",
  description: "Evaluate companies like a Wall Street analyst",
  icon: "BookOpen",
  color: "#ec4899",
  lessons: [
    {
      id: "fundamentals-1",
      title: "P/E & Valuation",
      description: "Determine if a stock is cheap or expensive",
      icon: "DollarSign",
      xpReward: 55,
      steps: [
        {
          type: "teach",
          title: "The Price-to-Earnings Ratio",
          content:
            "The **P/E Ratio** is the most popular valuation metric. It tells you how much investors pay for each dollar of a company's earnings.\n\n**P/E = Stock Price / Earnings Per Share (EPS)**\n\nAAPL at $185 with EPS of $6.50 → P/E = 28.5×\n\nThis means investors pay $28.50 for every $1 of Apple's annual profit.",
          visual: "portfolio-pie",
          highlight: ["P/E ratio", "EPS", "valuation"],
        },
        {
          type: "teach",
          title: "Interpreting P/E",
          content:
            "**High P/E (>30)**: Investors expect high growth (tech stocks). Or the stock is overvalued.\n**Low P/E (<15)**: Could be undervalued, or the company has slow/no growth.\n**Negative P/E**: Company is losing money (no earnings).\n\n**Compare within sectors**: A P/E of 25 is cheap for tech but expensive for utilities.\n\nP/E alone doesn't tell the whole story — always look at growth rate (PEG ratio).",
        },
        {
          type: "quiz-mc",
          question:
            "Company A has P/E of 15, Company B has P/E of 45. Both are in the tech sector. Which statement is most accurate?",
          options: [
            "Company B's higher P/E suggests investors expect more growth",
            "Company A is always the better investment",
            "Company B is guaranteed to outperform",
            "P/E ratio is irrelevant for tech companies",
          ],
          correctIndex: 0,
          explanation:
            "A higher P/E generally reflects higher growth expectations. Company B's investors are willing to pay more per dollar of current earnings because they expect significant future growth. Neither is automatically 'better' — it depends on whether growth materializes.",
        },
        {
          type: "quiz-scenario",
          scenario:
            "TSLA has a P/E of 60. The S&P 500 average P/E is 22. A traditional automaker has a P/E of 8.",
          question: "Why might TSLA's high P/E be justified?",
          options: [
            "Investors price in high future growth (EVs, AI, energy)",
            "TSLA has the most cars on the road",
            "High P/E always means overvalued",
            "The auto sector always has high P/E ratios",
          ],
          correctIndex: 0,
          explanation:
            "TSLA's premium P/E reflects expectations of rapid growth in EVs, autonomous driving, and energy storage. Whether this growth materializes determines if the valuation is justified. Traditional automakers have lower P/E because they grow slowly.",
        },
        {
          type: "quiz-tf",
          statement: "A stock with a low P/E ratio is always a good buy.",
          correct: false,
          explanation:
            "A low P/E could mean the stock is undervalued (opportunity) OR that the company is declining (value trap). Always investigate WHY the P/E is low — weak earnings, declining industry, or temporary issues?",
        },
      ],
    },
    {
      id: "fundamentals-2",
      title: "Market Cap & EPS",
      description: "Measure company size and profitability",
      icon: "Building2",
      xpReward: 50,
      steps: [
        {
          type: "teach",
          title: "Market Capitalization",
          content:
            "**Market Cap** = Share Price × Total Shares Outstanding\n\nIt represents the total value of a company as determined by the stock market.\n\n**Categories**:\n• **Mega-cap**: >$200B (AAPL, MSFT, GOOG)\n• **Large-cap**: $10B-$200B (mature, stable companies)\n• **Mid-cap**: $2B-$10B (growth potential + some stability)\n• **Small-cap**: <$2B (high growth potential, more risky)",
          visual: "portfolio-pie",
          highlight: ["market cap", "large-cap", "small-cap"],
        },
        {
          type: "teach",
          title: "Earnings Per Share (EPS)",
          content:
            "**EPS** = Net Income / Shares Outstanding\n\nIt tells you how much profit a company makes per share.\n\nAAPL Net Income: $97B, Shares: 15.3B → EPS ≈ $6.34\n\n**EPS Growth** is key — companies growing EPS 15-25% annually tend to see stock price appreciation.\n\nWatch **quarterly earnings reports** — if EPS beats expectations, stock often jumps. If it misses, stock often drops.",
        },
        {
          type: "quiz-mc",
          question: "A company has net income of $500M and 100M shares outstanding. What is the EPS?",
          options: ["$5.00", "$0.50", "$50.00", "$500"],
          correctIndex: 0,
          explanation:
            "EPS = Net Income / Shares Outstanding = $500M / 100M = $5.00 per share. Each share earned $5.00 in profit.",
        },
        {
          type: "quiz-tf",
          statement:
            "Market cap represents how much cash a company has in the bank.",
          correct: false,
          explanation:
            "Market cap is the total market value of a company's outstanding shares (price × shares). It represents how much the market values the company, NOT its cash reserves. A company could have a $1T market cap but only $50B in cash.",
        },
        {
          type: "quiz-scenario",
          scenario:
            "Company X reports EPS of $2.50, beating analyst expectations of $2.30. The stock jumps 8% after hours.",
          question: "Why did the stock surge despite only a $0.20 earnings beat?",
          options: [
            "Markets are forward-looking — beating estimates signals business is stronger than expected",
            "The $0.20 difference is a large amount of money",
            "After-hours trading is always volatile",
            "Analysts are always wrong",
          ],
          correctIndex: 0,
          explanation:
            "Beating estimates suggests the company is performing better than the market expected. This often leads to upward revisions of future earnings estimates, which drives the stock price higher. The signal matters more than the absolute dollar amount.",
        },
      ],
    },
    {
      id: "fundamentals-3",
      title: "Dividends & Beta",
      description: "Income investing and measuring stock volatility",
      icon: "Coins",
      xpReward: 50,
      steps: [
        {
          type: "teach",
          title: "Dividends: Getting Paid to Hold",
          content:
            "A **dividend** is a regular cash payment from a company to shareholders. It's like earning interest on your investment.\n\n**Dividend Yield** = Annual Dividend / Stock Price\nIf a stock at $100 pays $3/year → Yield = 3%\n\n**Types**:\n• **Growth stocks**: Little/no dividend (reinvest profits for growth). E.g., AMZN, TSLA\n• **Value/Income stocks**: Regular dividends (mature companies). E.g., JPM, JNJ\n• **Dividend Aristocrats**: Companies that raised dividends for 25+ consecutive years",
          highlight: ["dividend", "dividend yield", "income"],
        },
        {
          type: "teach",
          title: "Beta: Measuring Volatility",
          content:
            "**Beta** measures a stock's volatility relative to the overall market (S&P 500 = Beta 1.0).\n\n• **Beta > 1**: More volatile than the market (TSLA β=2.0 moves ~2× the market)\n• **Beta = 1**: Moves with the market (SPY)\n• **Beta < 1**: Less volatile (JPM β=0.9, utility stocks β=0.5)\n• **Beta < 0**: Moves opposite to the market (rare, some gold stocks)\n\nHigher beta = higher potential returns AND higher risk.",
          visual: "risk-pyramid",
          highlight: ["beta", "volatility"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock has a beta of 1.5. If the market drops 10%, approximately how much might this stock drop?",
          options: ["15%", "10%", "5%", "50%"],
          correctIndex: 0,
          explanation:
            "Beta of 1.5 means the stock is 50% more volatile than the market. A 10% market drop × 1.5 = approximately 15% drop for this stock. Beta works both ways — it also amplifies gains.",
        },
        {
          type: "quiz-tf",
          statement:
            "A high dividend yield always means a stock is a good investment.",
          correct: false,
          explanation:
            "A very high dividend yield can be a warning sign — it might mean the stock price has crashed (yield goes up when price drops). Companies may also cut dividends if business deteriorates. Check if the dividend is sustainable.",
        },
        {
          type: "quiz-scenario",
          scenario:
            "You're building a retirement portfolio. You want steady income with low volatility. You're choosing between:\nStock A: 4% dividend yield, Beta 0.6\nStock B: 0% dividend, Beta 2.1",
          question: "Which stock fits your retirement goal better?",
          options: [
            "Stock A — steady dividends + low volatility suits retirement",
            "Stock B — higher beta means more growth",
            "Neither — bonds only for retirement",
            "Both equally — buy 50/50",
          ],
          correctIndex: 0,
          explanation:
            "For retirement income, Stock A's 4% yield provides regular income, and beta 0.6 means less volatility (less stressful during market downturns). Stock B is better suited for aggressive growth portfolios.",
        },
      ],
    },
  ],
};
