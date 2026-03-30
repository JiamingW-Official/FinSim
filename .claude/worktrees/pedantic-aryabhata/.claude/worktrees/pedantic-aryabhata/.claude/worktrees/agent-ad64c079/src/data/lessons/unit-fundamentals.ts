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
      title: "Valuation Metrics & DCF",
      description: "P/E, PEG, EV/EBITDA, and discounted cash flow analysis",
      icon: "DollarSign",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "The Price-to-Earnings Ratio",
          content:
            "The **P/E Ratio** is the most widely used valuation metric on Wall Street. It measures how much investors pay per dollar of earnings.\n\n**P/E = Stock Price / Earnings Per Share (EPS)**\n\nAAPL at $185 with EPS of $6.50 -> Trailing P/E = 28.5x\n\n**Trailing P/E** uses the last 12 months of actual earnings. **Forward P/E** uses analyst estimates of next year's earnings. Forward P/E is more useful because markets are forward-looking -- prices reflect expectations, not history.\n\nA P/E of 28.5x means investors pay $28.50 today for $1 of current annual profit, implying they expect significant future growth.",
          visual: "portfolio-pie",
          highlight: ["P/E ratio", "trailing P/E", "forward P/E"],
        },
        {
          type: "teach",
          title: "P/E Context: Sector and Growth Rate",
          content:
            "P/E ratios are meaningless in isolation. Always compare within context:\n\n**By sector** (approximate medians):\n- Technology: 25-35x (high growth expectations)\n- Healthcare: 18-25x (innovation premium)\n- Financials: 10-15x (cyclical, regulated)\n- Utilities: 15-20x (stable, low growth)\n- Energy: 8-12x (commodity-driven, volatile)\n\n**Value traps**: A stock with P/E of 5x looks cheap, but it may be cheap for a reason -- declining revenue, structural disruption, or accounting issues. Kodak traded at a low P/E for years before going bankrupt.\n\n**Rule**: Low P/E + declining earnings = **value trap**. Low P/E + stable/growing earnings = potential opportunity.",
          highlight: ["value trap", "sector comparison"],
        },
        {
          type: "quiz-mc",
          question:
            "Company A (tech) has P/E of 20. Company B (utility) has P/E of 20. Which statement is most accurate?",
          options: [
            "Company A may be undervalued for its sector; Company B may be overvalued for its sector",
            "Both are equally valued since they have the same P/E",
            "Company B is the better investment because utilities are safer",
            "P/E comparisons across sectors are always valid",
          ],
          correctIndex: 0,
          explanation:
            "Tech stocks typically trade at 25-35x P/E, so 20x suggests Company A might be **undervalued relative to its sector**. Utilities typically trade at 15-20x, so 20x puts Company B at the high end. P/E must always be compared within the same sector and growth profile.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The PEG Ratio: Growth-Adjusted Valuation",
          content:
            "The **PEG Ratio** normalizes P/E by the earnings growth rate, revealing whether you're overpaying for growth.\n\n**PEG = P/E Ratio / Annual EPS Growth Rate (%)**\n\nExample: Stock with P/E of 30 and 30% EPS growth -> PEG = 1.0\n\nInterpretation:\n- **PEG < 1.0**: Potentially undervalued relative to growth (Peter Lynch's favorite)\n- **PEG = 1.0-1.5**: Fairly valued\n- **PEG > 2.0**: Expensive even considering growth\n\n**Limitations**: PEG assumes growth is linear and sustainable. A company growing 50%/year today won't maintain that rate forever. Use PEG alongside other metrics, not as a standalone.",
          highlight: ["PEG ratio", "Peter Lynch"],
        },
        {
          type: "quiz-mc",
          question:
            "Stock X: P/E of 50, EPS growth of 60%. Stock Y: P/E of 15, EPS growth of 5%. Which has the better PEG?",
          options: [
            "Stock X (PEG = 0.83 vs Y's PEG = 3.0)",
            "Stock Y (lower P/E is always better)",
            "They are equal",
            "PEG cannot be calculated without market cap",
          ],
          correctIndex: 0,
          explanation:
            "Stock X: PEG = 50/60 = **0.83**. Stock Y: PEG = 15/5 = **3.0**. Despite Stock X's much higher P/E, its growth rate justifies the premium. Stock Y is actually the more expensive stock on a growth-adjusted basis. This is why PEG is often more useful than raw P/E.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "EV/EBITDA: The Enterprise Metric",
          content:
            "**Enterprise Value / EBITDA** is the preferred valuation metric for M&A analysts and private equity because it is capital-structure neutral.\n\n**Enterprise Value (EV)** = Market Cap + Total Debt - Cash\nEV represents the total price to acquire a company (you buy the equity AND assume the debt, but you get the cash).\n\n**EBITDA** = Earnings Before Interest, Taxes, Depreciation, and Amortization\nEBITDA approximates operating cash flow, stripping out financing and accounting decisions.\n\n**EV/EBITDA** = Enterprise Value / EBITDA\n- **< 10x**: Potentially cheap (especially for mature businesses)\n- **10-15x**: Fair value for most sectors\n- **> 20x**: Premium valuation (high-growth or asset-light businesses)\n\n**Why use it over P/E?** P/E is distorted by debt levels, tax strategies, and depreciation methods. EV/EBITDA allows apples-to-apples comparison regardless of how a company is financed.",
          highlight: ["EV/EBITDA", "enterprise value", "EBITDA"],
        },
        {
          type: "quiz-tf",
          statement:
            "A company with zero debt and $5 billion in cash will have an Enterprise Value lower than its Market Cap.",
          correct: true,
          explanation:
            "EV = Market Cap + Debt - Cash. With zero debt: EV = Market Cap - $5B. The enterprise value is **lower** than market cap because an acquirer effectively gets $5B in cash as part of the deal, reducing the net cost of the acquisition. Companies sitting on large cash piles often have EV significantly below their market cap.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Discounted Cash Flow (DCF) Concept",
          content:
            "**DCF analysis** is the gold standard of intrinsic valuation. The premise: a company is worth the sum of all future cash flows, discounted back to today's dollars.\n\n**Core formula**: Value = Sum of [FCF_t / (1 + r)^t] for t = 1 to infinity\n\nWhere FCF = Free Cash Flow, r = discount rate (usually WACC, 8-12%).\n\nIn practice, analysts:\n1. Project free cash flows for 5-10 years\n2. Estimate a **terminal value** (value of all cash flows beyond the projection period)\n3. Discount everything back to present value\n4. Subtract debt, add cash -> **equity value**\n5. Divide by shares outstanding -> **fair value per share**\n\nDCF is highly sensitive to assumptions -- small changes in growth rate or discount rate swing the output dramatically. This is both its strength (forces rigorous thinking) and weakness (garbage in, garbage out).",
          highlight: ["DCF", "free cash flow", "discount rate", "terminal value"],
        },
        {
          type: "quiz-mc",
          question:
            "In a DCF model, increasing the discount rate from 8% to 12% will:",
          options: [
            "Decrease the fair value (future cash flows are worth less today)",
            "Increase the fair value",
            "Have no effect on fair value",
            "Only affect the terminal value",
          ],
          correctIndex: 0,
          explanation:
            "A higher discount rate means future cash flows are worth **less** in today's dollars. This is why growth stocks (whose value depends heavily on distant future cash flows) are particularly sensitive to interest rate increases. When the Fed raises rates, the effective discount rate rises and high-growth stock valuations compress.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A retail company trades at P/E of 6x, well below the sector average of 14x. Revenue has declined 15% year-over-year, foot traffic is falling, and online competitors are gaining share. The company has $2B in debt.",
          question: "Is this stock a value opportunity or a value trap?",
          options: [
            "Likely a value trap -- declining fundamentals explain the low P/E",
            "Definite value opportunity -- P/E of 6 is extremely cheap",
            "Cannot determine without knowing the stock price",
            "Low P/E always indicates a buying opportunity",
          ],
          correctIndex: 0,
          explanation:
            "Classic **value trap** characteristics: low P/E driven by a declining business, not market mispricing. Revenue is shrinking, the industry is being disrupted, and debt adds financial risk. The market is not 'missing' something -- it is correctly pricing deteriorating fundamentals. A cheap P/E on falling earnings means next year's P/E will be even higher as earnings drop.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "EV/EBITDA is generally more reliable than P/E when comparing companies with very different levels of debt.",
          correct: true,
          explanation:
            "P/E is calculated after interest payments, so a highly leveraged company appears to have lower earnings (and thus higher P/E) than an identical unleveraged company. **EV/EBITDA** strips out the impact of capital structure (debt vs equity financing) and is therefore the standard for comparing companies with different balance sheets, especially in M&A analysis.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are analyzing two SaaS companies:\n- Company A: Market Cap $10B, Debt $2B, Cash $1B, EBITDA $800M\n- Company B: Market Cap $8B, Debt $0, Cash $3B, EBITDA $700M",
          question: "Which company has the lower (cheaper) EV/EBITDA?",
          options: [
            "Company B (EV/EBITDA = 7.1x vs A's 13.75x)",
            "Company A (smaller EV)",
            "They are approximately equal",
            "Cannot calculate without P/E ratio",
          ],
          correctIndex: 0,
          explanation:
            "Company A: EV = $10B + $2B - $1B = **$11B**. EV/EBITDA = $11B / $0.8B = **13.75x**. Company B: EV = $8B + $0 - $3B = **$5B**. EV/EBITDA = $5B / $0.7B = **7.1x**. Company B is nearly half the valuation on EV/EBITDA despite similar market caps. The large cash hoard and zero debt dramatically reduce B's enterprise value.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Putting It All Together: Valuation Toolkit",
          content:
            "No single metric tells the full story. Professional analysts use a **multi-metric approach**:\n\n1. **P/E Ratio**: Quick screening. Compare within sector.\n2. **Forward P/E**: Better than trailing -- uses expected earnings.\n3. **PEG**: Growth-adjusted P/E. Best for growth stocks.\n4. **EV/EBITDA**: Capital-structure neutral. Best for comparing leveraged vs unleveraged firms.\n5. **DCF**: Intrinsic value from fundamentals. Best for deep-dive analysis.\n\n**Red flags** that warrant deeper investigation:\n- P/E significantly below sector with declining revenue\n- PEG below 0.5 (too good to be true -- check accounting)\n- EV/EBITDA below 5x outside of cyclical troughs\n- Management aggressively using non-GAAP metrics to inflate earnings",
          highlight: ["multi-metric approach", "red flags"],
        },
      ],
    },
    {
      id: "fundamentals-2",
      title: "Market Cap, EPS & Corporate Actions",
      description: "Diluted EPS, buybacks, GAAP vs non-GAAP earnings",
      icon: "Building2",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "Market Capitalization Tiers",
          content:
            "**Market Cap = Share Price x Shares Outstanding**\n\nMarket cap tiers reflect different risk/return profiles:\n\n**Mega-cap (>$200B)**: AAPL, MSFT, GOOG. Dominant market positions, deep liquidity, lower volatility. Institutional core holdings.\n\n**Large-cap ($10B-$200B)**: Mature businesses with proven models. Lower growth but stable earnings. Standard benchmarked against S&P 500.\n\n**Mid-cap ($2B-$10B)**: Sweet spot of growth and stability. Often acquisition targets for mega-caps. Russell Midcap Index.\n\n**Small-cap ($300M-$2B)**: Higher growth potential, higher volatility, less analyst coverage (potential for mispricing). Russell 2000.\n\n**Micro-cap (<$300M)**: Highest risk. Wide bid-ask spreads, low liquidity, minimal institutional ownership. Where frauds and multi-baggers both live.",
          visual: "portfolio-pie",
          highlight: ["market cap", "mega-cap", "small-cap", "micro-cap"],
        },
        {
          type: "quiz-mc",
          question:
            "A portfolio manager benchmarked to the S&P 500 would most likely hold primarily:",
          options: [
            "Large-cap and mega-cap stocks (>$10B market cap)",
            "Small-cap stocks for higher returns",
            "Micro-cap stocks for maximum alpha",
            "Equal amounts of all cap tiers",
          ],
          correctIndex: 0,
          explanation:
            "The S&P 500 is a **large-cap index** -- it contains 500 of the largest US companies by market cap. A manager benchmarked to it would primarily hold large and mega-cap stocks to minimize tracking error against the benchmark. Small and micro-cap holdings would cause deviation from the index.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Basic vs Diluted EPS",
          content:
            "**Basic EPS** = Net Income / Shares Outstanding\n\n**Diluted EPS** = Net Income / (Shares Outstanding + All Potential Shares)\n\nPotential shares come from:\n- **Stock options** held by employees and executives\n- **Convertible bonds** that can be swapped for shares\n- **Warrants** and **RSUs** (Restricted Stock Units)\n\nExample: Net income $500M, 100M shares outstanding, 10M stock options.\nBasic EPS = $500M / 100M = **$5.00**\nDiluted EPS = $500M / 110M = **$4.55**\n\n**Always use diluted EPS** for valuation. Basic EPS overstates per-share earnings by ignoring future dilution. Companies like tech firms with aggressive stock-based compensation can have 5-10% dilution annually.",
          highlight: ["diluted EPS", "stock options", "dilution"],
        },
        {
          type: "quiz-tf",
          statement:
            "Basic EPS is always equal to or higher than diluted EPS for the same company.",
          correct: true,
          explanation:
            "Basic EPS divides earnings by a smaller number (current shares only), while diluted EPS divides by a larger number (current shares + all potential shares from options, convertibles, etc.). Since the numerator is the same but the denominator is larger for diluted EPS, **basic EPS >= diluted EPS** always. The gap between them reveals the magnitude of potential dilution.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Share Buybacks: Financial Engineering",
          content:
            "A **share buyback** (repurchase) is when a company buys its own shares on the open market, reducing shares outstanding.\n\n**Effect on EPS**: Fewer shares -> higher EPS, even with flat earnings.\nExample: $1B earnings / 200M shares = $5.00 EPS.\nAfter buying back 20M shares: $1B / 180M = **$5.56 EPS** (+11% growth from engineering alone).\n\n**Why companies do it**: Tax-efficient capital return (vs dividends), boosts EPS and P/E metrics, signals management confidence.\n\n**The dark side**: Companies sometimes borrow money to fund buybacks, increasing leverage. If earnings are actually declining, buybacks create the illusion of growth. Always check if EPS growth is coming from revenue growth or share count reduction.\n\n**Rule**: Revenue-driven EPS growth is sustainable. Buyback-driven EPS growth is financial engineering.",
          highlight: ["share buyback", "financial engineering"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Company Q reported EPS growth of 12% year-over-year. Revenue was flat. They spent $3B on share buybacks, reducing share count by 10%.",
          question: "What is driving the EPS growth?",
          options: [
            "Almost entirely buybacks -- revenue-adjusted growth is near zero",
            "Genuine business improvement of 12%",
            "A combination of revenue growth and buybacks equally",
            "Cannot determine without knowing the stock price",
          ],
          correctIndex: 0,
          explanation:
            "With flat revenue, the ~12% EPS growth is almost entirely explained by the ~10% reduction in share count from buybacks. This is **financial engineering**, not operational improvement. An investor looking only at EPS growth would incorrectly conclude the business is growing. Always decompose EPS growth into revenue growth, margin expansion, and share count reduction.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "GAAP vs Non-GAAP Earnings",
          content:
            "**GAAP** (Generally Accepted Accounting Principles) is the standardized reporting framework required by the SEC.\n\n**Non-GAAP** (or 'adjusted') earnings exclude items management deems non-recurring or non-cash:\n- Stock-based compensation (SBC)\n- Restructuring charges\n- Acquisition-related costs\n- Asset impairments\n\n**The controversy**: Companies increasingly report non-GAAP earnings that are 20-50% higher than GAAP. Stock-based compensation is the biggest adjustment -- tech companies exclude billions in SBC, even though it is a real cost that dilutes shareholders.\n\n**Rule of thumb**: If non-GAAP EPS is consistently 30%+ above GAAP EPS, the company may be obscuring true profitability. Always read the reconciliation table in earnings reports.",
          highlight: ["GAAP", "non-GAAP", "stock-based compensation"],
        },
        {
          type: "quiz-mc",
          question:
            "A tech company reports GAAP EPS of $2.00 and 'adjusted' (non-GAAP) EPS of $3.50. The largest adjustment is $1.2B in stock-based compensation. Which EPS should you use for valuation?",
          options: [
            "GAAP EPS ($2.00) -- SBC is a real cost that dilutes shareholders",
            "Non-GAAP EPS ($3.50) -- it better reflects operating performance",
            "Average of both ($2.75)",
            "Whichever makes the stock look cheaper",
          ],
          correctIndex: 0,
          explanation:
            "Stock-based compensation is a **real economic cost** -- it dilutes existing shareholders. Excluding it inflates earnings by 75% in this case. While non-GAAP can be useful for understanding recurring operating performance, using it for valuation systematically overpays for the stock. Warren Buffett has called SBC exclusion 'financial chicanery.'",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Share buybacks always benefit shareholders because they increase EPS.",
          correct: false,
          explanation:
            "Buybacks only benefit shareholders if the stock is purchased below intrinsic value. If a company buys back overvalued shares, it destroys value -- the same capital could have been invested in R&D, acquisitions, or returned as dividends. Additionally, buybacks funded by debt increase financial risk. Many companies execute buybacks at market peaks (worst time) and halt them during crashes (best time).",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Earnings Quality Checklist",
          content:
            "Before trusting reported earnings, professional analysts check:\n\n1. **Cash flow vs earnings**: Is the company generating actual cash? Earnings can be manipulated; cash flow is harder to fake. FCF should track near net income over time.\n\n2. **Revenue recognition**: Is revenue growing? If EPS grows but revenue is flat, suspect buybacks or cost-cutting (both have limits).\n\n3. **GAAP vs non-GAAP gap**: A widening gap over time is a red flag. If 'one-time charges' happen every quarter, they are not one-time.\n\n4. **Accruals ratio**: High accruals (earnings far exceeding cash flow) predict future earnings declines. Sloan (1996) found that firms with high accruals underperform by 5-10% annually.\n\n5. **Accounts receivable growth vs revenue growth**: If AR grows faster than revenue, the company may be booking sales that haven't been collected -- a classic warning sign.",
          highlight: ["earnings quality", "accruals", "free cash flow"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Company Z reports: Revenue +3%, GAAP EPS +15%, Non-GAAP EPS +22%, FCF -8%, Accounts Receivable +25%. Management highlights the 22% non-GAAP EPS growth.",
          question: "What does this earnings report likely indicate?",
          options: [
            "Deteriorating earnings quality -- FCF declining and AR surging despite modest revenue growth",
            "A strong quarter since non-GAAP EPS grew 22%",
            "Normal business fluctuations",
            "The company is undervalued based on EPS growth",
          ],
          correctIndex: 0,
          explanation:
            "Multiple red flags: Revenue grew only 3% but EPS jumped 15-22% (likely buybacks/cost cuts). **Free cash flow declined 8%** while earnings grew -- earnings are not backed by cash. **AR surging +25%** vs revenue +3% suggests the company is booking sales that haven't been collected, potentially stuffing the channel. This is a classic deteriorating-quality earnings report despite headline EPS growth.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "A company's share count decreased from 500M to 450M over two years while net income stayed flat at $2B. What happened to EPS?",
          options: [
            "EPS rose from $4.00 to $4.44 (+11%) purely from buybacks",
            "EPS stayed at $4.00 since income was flat",
            "EPS decreased because fewer shares means less value",
            "Cannot calculate without knowing the stock price",
          ],
          correctIndex: 0,
          explanation:
            "Year 1: EPS = $2B / 500M = **$4.00**. Year 2: EPS = $2B / 450M = **$4.44**. That is an 11% EPS increase with zero earnings growth. An investor screening for 'EPS growth > 10%' would flag this stock as a grower when it is actually stagnant. Always decompose EPS changes into revenue growth, margin expansion, and **share count reduction**.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Synthesizing Company Analysis",
          content:
            "A complete fundamental analysis combines:\n\n**Quantitative**: P/E, PEG, EV/EBITDA, diluted EPS trend, FCF yield, GAAP vs non-GAAP reconciliation, buyback impact, balance sheet strength.\n\n**Qualitative**: Competitive moat (brand, network effects, switching costs), management quality (insider ownership, capital allocation track record), industry tailwinds/headwinds, regulatory environment.\n\nThe best investments sit at the intersection: strong quantitative metrics PLUS a qualitative edge that the market hasn't fully priced. As Warren Buffett says, you want to buy 'wonderful companies at fair prices,' not 'fair companies at wonderful prices.'",
          highlight: ["competitive moat", "qualitative analysis"],
        },
      ],
    },
    {
      id: "fundamentals-3",
      title: "Dividends, Beta & CAPM",
      description: "Income investing, volatility measurement, and the capital asset pricing model",
      icon: "Coins",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "Dividend Yield and Payout Ratio",
          content:
            "**Dividend Yield** = Annual Dividend per Share / Stock Price\nA stock at $100 paying $4/year -> 4% yield.\n\n**Payout Ratio** = Dividends / Net Income\nThis reveals sustainability. A 30% payout means the company retains 70% of earnings for growth. A 90%+ payout leaves little room for dividend increases or reinvestment.\n\n**Danger zone**: Yield above 6-8% is often a signal, not a feature. High yield can mean:\n- Stock price has crashed (yield = dividend / falling price)\n- Dividend is likely to be cut\n- The company is paying out more than it earns (payout > 100%)\n\n**Dividend Aristocrats**: S&P 500 companies that have raised dividends for 25+ consecutive years (e.g., JNJ, KO, PG). These are the gold standard of dividend reliability.",
          highlight: ["dividend yield", "payout ratio", "Dividend Aristocrats"],
        },
        {
          type: "quiz-mc",
          question:
            "Company A: $50 stock, $2 dividend, net income $5/share. Company B: $30 stock, $3 dividend, net income $2.50/share. Which dividend is more sustainable?",
          options: [
            "Company A (payout ratio 40% vs B's 120%)",
            "Company B (higher yield of 10%)",
            "Both are equally sustainable",
            "Neither -- dividends are never guaranteed",
          ],
          correctIndex: 0,
          explanation:
            "Company A: Payout = $2/$5 = **40%** (healthy, room for growth). Company B: Payout = $3/$2.50 = **120%** (paying more than it earns -- unsustainable). Company B's 10% yield is a **red flag**, not an opportunity. The dividend will almost certainly be cut because the company is funding it from reserves or debt, not earnings.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "DRIP: Dividend Reinvestment Plans",
          content:
            "A **DRIP** (Dividend Reinvestment Plan) automatically uses dividend payments to purchase additional shares instead of receiving cash.\n\n**The power of DRIP over 30 years**:\n$10,000 invested in a stock yielding 3%, no DRIP: You collect $300/year in cash.\n$10,000 invested with DRIP at 3% yield + 7% price appreciation: approximately **$149,000** vs **$76,000** without DRIP.\n\nDRIP creates a compounding machine: dividends buy shares, new shares pay dividends, those dividends buy more shares. Over decades, reinvested dividends account for roughly 40-50% of total stock market returns historically.\n\n**Most brokers offer commission-free DRIP** -- enable it on all dividend-paying holdings unless you need the income.",
          highlight: ["DRIP", "dividend reinvestment", "compounding"],
        },
        {
          type: "quiz-tf",
          statement:
            "A stock with a 10% dividend yield is always a better income investment than one with a 3% yield.",
          correct: false,
          explanation:
            "A 10% yield is a major red flag. It often means the stock price has crashed or the dividend exceeds earnings (payout ratio > 100%). Such dividends are frequently cut, leaving investors with both a lower yield AND capital losses. A 3% yield from a Dividend Aristocrat with a 40% payout ratio is far safer. **Yield traps** destroy more income-investor capital than any other mistake.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Beta: Measuring Systematic Risk",
          content:
            "**Beta** quantifies a stock's sensitivity to market movements using regression analysis against a benchmark (typically the S&P 500).\n\n**Beta = Covariance(stock, market) / Variance(market)**\n\nInterpretation:\n- **Beta = 1.0**: Moves 1:1 with the market (SPY, by definition)\n- **Beta = 1.5**: 50% more volatile. Market +10% -> stock +15%. Market -10% -> stock -15%.\n- **Beta = 0.5**: Half as volatile (utilities, consumer staples)\n- **Beta = 0**: Uncorrelated (T-bills)\n- **Beta < 0**: Moves inversely (rare; some gold miners, inverse ETFs)\n\n**Sector betas** (approximate):\nTech: 1.2-1.5 | Financials: 1.0-1.3 | Healthcare: 0.7-1.0 | Utilities: 0.3-0.6 | Consumer Staples: 0.5-0.8\n\nBeta is calculated from historical data (typically 60 monthly returns) and can change over time.",
          visual: "risk-pyramid",
          highlight: ["beta", "systematic risk", "covariance"],
        },
        {
          type: "quiz-mc",
          question:
            "A portfolio contains: 50% Stock A (beta 1.4), 30% Stock B (beta 0.8), 20% Stock C (beta 0.5). What is the portfolio beta?",
          options: [
            "1.04",
            "0.90",
            "1.40",
            "0.80",
          ],
          correctIndex: 0,
          explanation:
            "Portfolio beta = weighted average of component betas. (0.50 x 1.4) + (0.30 x 0.8) + (0.20 x 0.5) = 0.70 + 0.24 + 0.10 = **1.04**. This portfolio is roughly market-neutral in terms of systematic risk exposure. Adding more low-beta assets would make it defensive.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Capital Asset Pricing Model (CAPM)",
          content:
            "The **CAPM** (Sharpe, 1964) defines the expected return of any asset based on its systematic risk:\n\n**E(R) = Rf + Beta x (Rm - Rf)**\n\nWhere:\n- E(R) = Expected return of the asset\n- Rf = Risk-free rate (10-year Treasury, ~4.5%)\n- Rm = Expected market return (~10% historical)\n- (Rm - Rf) = **Equity risk premium** (~5.5%)\n\nExample: Stock with beta 1.3:\nE(R) = 4.5% + 1.3 x (10% - 4.5%) = 4.5% + 7.15% = **11.65%**\n\nIf this stock actually returns 15%, it has **positive alpha** of 3.35% (outperforming its risk-adjusted expectation). Alpha is the holy grail of active management -- return above what beta alone would predict.",
          highlight: ["CAPM", "equity risk premium", "alpha"],
        },
        {
          type: "quiz-mc",
          question:
            "Risk-free rate is 4%. Expected market return is 10%. A stock has beta of 2.0. What return does CAPM predict?",
          options: [
            "16%",
            "20%",
            "10%",
            "14%",
          ],
          correctIndex: 0,
          explanation:
            "E(R) = Rf + Beta x (Rm - Rf) = 4% + 2.0 x (10% - 4%) = 4% + 12% = **16%**. A beta-2 stock must return 16% to justify its risk. If it only returns 10% (same as the market), it has negative alpha of -6% -- you took double the risk for the same return.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "According to CAPM, a stock with a beta of 0 should return exactly the risk-free rate.",
          correct: true,
          explanation:
            "E(R) = Rf + 0 x (Rm - Rf) = Rf. With zero beta, the stock has no systematic risk exposure, so CAPM says it should return only the risk-free rate. In practice, a beta-zero asset is essentially uncorrelated with the market and provides no risk premium. This is why T-bills (beta ~ 0) return roughly the risk-free rate.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Alpha: The Measure of Skill",
          content:
            "**Alpha** = Actual Return - CAPM Expected Return\n\nA fund returning 14% with beta 1.0 when the market returns 10%:\nExpected = Rf + 1.0 x (Rm - Rf) = 10%\nAlpha = 14% - 10% = **+4% alpha**\n\nThe uncomfortable truth: after fees, ~85-90% of active managers fail to generate positive alpha over 15+ years (SPIVA research). This is why passive indexing has grown to dominate asset management.\n\nFor traders, alpha comes from information edge, speed edge, or behavioral edge (exploiting others' systematic mistakes). It is the return you earn through skill, not through market exposure.",
          highlight: ["alpha", "passive indexing", "SPIVA"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Fund A returned 18% last year with a beta of 1.5. Fund B returned 12% with a beta of 0.7. Risk-free rate was 4%, market returned 11%.",
          question: "Which fund generated more alpha (skill-based return)?",
          options: [
            "Fund B generated +3.1% alpha vs Fund A's +3.5% -- Fund A edges out slightly",
            "Fund A -- 18% is higher than 12%",
            "Fund B -- lower beta means better risk management",
            "They generated equal alpha",
          ],
          correctIndex: 0,
          explanation:
            "Fund A expected: 4% + 1.5(11% - 4%) = 4% + 10.5% = **14.5%**. Alpha = 18% - 14.5% = **+3.5%**. Fund B expected: 4% + 0.7(11% - 4%) = 4% + 4.9% = **8.9%**. Alpha = 12% - 8.9% = **+3.1%**. Fund A generated slightly more alpha (3.5% vs 3.1%). However, Fund B achieved impressive risk-adjusted returns with far less market exposure -- both demonstrate genuine skill.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Building a Dividend Growth Portfolio",
          content:
            "The **dividend growth strategy** targets companies that consistently increase dividends, combining income with capital appreciation.\n\n**Selection criteria**:\n1. **Dividend growth streak**: 10+ years of consecutive increases\n2. **Payout ratio**: 30-60% (sustainable with room to grow)\n3. **Earnings growth**: 5%+ annually (funds future dividend increases)\n4. **Debt-to-equity**: Below sector average (financial flexibility)\n5. **Yield**: 2-4% starting yield (too high = yield trap, too low = slow income)\n\n**The Chowder Rule**: Yield + 5-year dividend growth rate should exceed 12%. Example: 3% yield + 10% growth rate = 13% (passes). This ensures total return potential from both income and appreciation.\n\n**Tax efficiency**: Qualified dividends are taxed at long-term capital gains rates (0-20%), lower than ordinary income rates.",
          highlight: ["dividend growth", "Chowder Rule", "qualified dividends"],
        },
        {
          type: "quiz-mc",
          question:
            "Stock A: 2.5% yield, 15% dividend growth rate, payout ratio 35%. Stock B: 5% yield, 2% dividend growth rate, payout ratio 85%. Using the Chowder Rule, which is the better dividend growth investment?",
          options: [
            "Stock A (Chowder number 17.5% vs B's 7% -- and lower payout ratio is safer)",
            "Stock B (higher current yield generates more income now)",
            "They are equal since total yield + growth is similar",
            "Cannot determine without knowing P/E ratios",
          ],
          correctIndex: 0,
          explanation:
            "Stock A Chowder = 2.5% + 15% = **17.5%** (excellent). Stock B Chowder = 5% + 2% = **7%** (poor). Stock A's lower yield is deceptive -- at 15% growth, its yield-on-cost will surpass Stock B's current yield within 5-6 years. Plus, the 35% payout ratio vs 85% means Stock A has far more room for future increases. Dividend growth investing is a long game.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "CAPM assumes that investors are only compensated for bearing systematic (market) risk, not for company-specific risk.",
          correct: true,
          explanation:
            "CAPM's foundational assumption is that **unsystematic (company-specific) risk can be diversified away** at no cost by holding a diversified portfolio. Therefore, the market does not compensate investors for bearing it. Only **systematic risk** (measured by beta) earns a risk premium. This is why CAPM's expected return formula uses only beta and the market risk premium, with no term for idiosyncratic risk.",
          difficulty: 3,
        },
      ],
    },
  ],
};
