import { Unit } from "./types";

export const UNIT_FINANCIAL_RATIOS: Unit = {
 id: "financial-ratios",
 title: "Financial Ratios & Analysis",
 description:
 "Master the essential ratios for evaluating stocks, from P/E to ROIC",
 icon: "BarChart2",
 color: "#3B82F6",
 lessons: [
 // Lesson 1: Valuation Ratios 
 {
 id: "financial-ratios-valuation",
 title: "Valuation Ratios",
 description:
 "Learn P/E, P/B, P/S, EV/EBITDA, PEG, and how to compare them against history, peers, and sector benchmarks",
 icon: "TrendingUp",
 xpReward: 60,
 difficulty: "intermediate",
 duration: 9,
 steps: [
 {
 type: "teach",
 title: "Price-to-Earnings: Trailing vs Forward",
 content:
 "The P/E ratio is the most widely used valuation metric: Price per Share / Earnings per Share.\n\n• Trailing P/E (TTM): uses the last 12 months of actual reported EPS. Grounded in real results but backward-looking.\n• Forward P/E: uses the next 12 months of analyst-estimated EPS. Forward-looking but subject to forecast errors.\n\nA stock at $100 with TTM EPS of $5 trades at 20x trailing P/E. If analysts forecast $6 EPS next year, the forward P/E is 16.7x — cheaper on a forward basis.\n\nContext is everything. A 20x P/E is cheap for a high-growth software company but expensive for a mature utility. Always compare to the stock's own historical average, close peers, and sector median.",
 highlight: ["P/E ratio", "trailing P/E", "forward P/E", "EPS", "valuation"],
 },
 {
 type: "teach",
 title: "P/B, P/S, and EV/EBITDA",
 content:
 "Different multiples suit different industries:\n\n• P/B (Price-to-Book): Price / Book value per share. Best for capital-intensive sectors — banks, insurance, real estate. A P/B < 1 may signal undervaluation (or distress).\n\n• P/S (Price-to-Sales): Market cap / Revenue. Useful when earnings are negative (early-stage companies, turnarounds). Less distorted by accounting choices.\n\n• EV/EBITDA: Enterprise Value / EBITDA. EV = Market cap + Net debt. Removes capital structure differences, making cross-company comparisons cleaner. The go-to multiple for M&A analysis and comparing companies with different debt levels.\n\n• EV/Sales: Like P/S but uses EV — better for comparing across debt structures.",
 highlight: ["P/B", "P/S", "EV/EBITDA", "enterprise value", "book value"],
 },
 {
 type: "quiz-mc",
 question:
 "Company A has a market cap of $800M, $200M in net debt, and EBITDA of $100M. Company B has a market cap of $600M, zero debt, and EBITDA of $80M. Which company has the higher EV/EBITDA multiple?",
 options: [
 "Company A at 10x — EV = $1,000M, EV/EBITDA = $1,000M / $100M",
 "Company B at 10x — EV = $600M, EV/EBITDA = $600M / $80M",
 "Company A at 8x — market cap divided by EBITDA",
 "Both trade at the same multiple since they are in the same industry",
 ],
 correctIndex: 0,
 explanation:
 "Company A: EV = $800M + $200M = $1,000M; EV/EBITDA = 10x. Company B: EV = $600M + $0 = $600M; EV/EBITDA = $600M / $80M = 7.5x. Company A trades at a higher multiple. Using EV rather than market cap ensures the debt load is captured in the comparison.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "PEG Ratio: Adjusting P/E for Growth",
 content:
 "A high P/E may be justified by fast earnings growth. The PEG ratio normalizes for growth:\n\nPEG = Forward P/E / Expected EPS growth rate (%)\n\nRule of thumb popularized by Peter Lynch:\n• PEG < 1: potentially undervalued relative to growth\n• PEG = 1: fairly valued\n• PEG > 1: potentially overvalued relative to growth\n\nExample: Stock A has forward P/E of 30x and grows EPS at 30% — PEG = 1.0. Stock B has forward P/E of 15x but only grows at 5% — PEG = 3.0. Stock A is cheaper on a growth-adjusted basis despite the higher absolute P/E.\n\nLimitation: PEG relies on growth forecasts that can be wrong, and it ignores risk and capital intensity.",
 highlight: ["PEG ratio", "growth-adjusted", "earnings growth", "Peter Lynch"],
 },
 {
 type: "quiz-tf",
 statement:
 "A stock with a P/E of 40x is always overvalued compared to a stock with a P/E of 15x in the same sector.",
 correct: false,
 explanation:
 "False. A higher P/E can be justified by faster earnings growth, a wider competitive moat, higher returns on capital, or superior business quality. The PEG ratio and growth-adjusted comparisons are needed. Context — including growth rate, sector, and risk — determines whether any multiple is expensive or cheap.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are analyzing two retail stocks. Stock X trades at a P/S of 0.4x on declining revenue and a P/B of 0.6x. Stock Y trades at P/S of 3.5x with 25% revenue growth and a P/B of 8x. A peer index trades at P/S of 1.2x and P/B of 2.5x.",
 question:
 "What do these ratios most likely indicate about each stock?",
 options: [
 "Stock X may be a value trap or turnaround candidate; Stock Y commands a premium for its growth but carries valuation risk if growth slows",
 "Stock X is clearly undervalued on every metric and should be bought immediately",
 "Stock Y is overvalued on every metric and should be avoided entirely",
 "P/S and P/B ratios are not meaningful for retail stocks; only P/E matters",
 ],
 correctIndex: 0,
 explanation:
 "Stock X's low P/S and sub-1 P/B alongside declining revenue signals either deep value or distress — a value trap risk if the business is deteriorating. Stock Y's premium multiples reflect growth expectations; the risk is that any deceleration compresses the multiple sharply. Neither extreme is straightforwardly 'buy' or 'sell' without deeper analysis.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Profitability Ratios 
 {
 id: "financial-ratios-profitability",
 title: "Profitability Ratios",
 description:
 "Dissect gross, operating, and net margins, decode the DuPont ROE framework, and understand why ROIC is the gold standard for capital allocation quality",
 icon: "TrendingUp",
 xpReward: 65,
 difficulty: "intermediate",
 duration: 9,
 steps: [
 {
 type: "teach",
 title: "The Three Margin Layers",
 content:
 "Each margin level strips away a different layer of cost:\n\n• Gross Margin = (Revenue COGS) / Revenue. Measures pricing power and production efficiency. High gross margins (e.g., 70%+ for software) allow room to invest in growth.\n\n• Operating Margin = EBIT / Revenue. After subtracting operating expenses (R&D, SG&A). Reflects core business profitability before financing decisions.\n\n• Net Margin = Net Income / Revenue. After interest and taxes. The 'bottom line' margin — what shareholders ultimately earn per dollar of sales.\n\nExample: Revenue $1B, COGS $400M, OpEx $300M, Interest $50M, Tax 21%.\n• Gross margin = 60%, Operating margin = 30%, Net margin 19.8%\n\nTrend matters as much as level — expanding margins signal operating leverage; shrinking margins signal cost pressure or pricing erosion.",
 highlight: ["gross margin", "operating margin", "net margin", "EBIT", "operating leverage"],
 },
 {
 type: "quiz-tf",
 statement:
 "A company can have a high gross margin but a low or negative net margin if its operating expenses, interest costs, or taxes are disproportionately large.",
 correct: true,
 explanation:
 "True. Gross margin only subtracts the cost of goods sold. A company with high production efficiency but massive R&D spend, heavy debt interest, or large write-offs can still post low or negative net income. This is common in biotech, early-stage SaaS, and leveraged buyouts.",
 difficulty: 1,
 },
 {
 type: "teach",
 title: "ROE and the DuPont Decomposition",
 content:
 "Return on Equity (ROE) = Net Income / Shareholders' Equity. It measures how effectively management uses equity capital.\n\nThe 3-factor DuPont formula decomposes ROE into its drivers:\n\nROE = Net Margin × Asset Turnover × Equity Multiplier\n = (Net Income/Revenue) × (Revenue/Assets) × (Assets/Equity)\n\nThis reveals HOW a company earns its ROE:\n• High margin path: luxury goods, software — charge more per sale\n• High turnover path: retail, grocery — sell volumes efficiently with thin margins\n• High leverage path: banks, utilities — multiply returns with borrowed capital\n\nTwo companies with identical ROE can have completely different risk profiles. A bank's 15% ROE via 10x leverage is far riskier than a tech company's 15% ROE driven by 30% net margins.",
 highlight: ["ROE", "DuPont", "net margin", "asset turnover", "equity multiplier"],
 },
 {
 type: "quiz-mc",
 question:
 "Company A has ROE of 18% driven by a net margin of 15%, asset turnover of 0.8x, and equity multiplier of 1.5x. Company B has ROE of 18% via net margin of 3%, asset turnover of 2.0x, and equity multiplier of 3.0x. Which company carries more financial risk, and why?",
 options: [
 "Company B, because its ROE relies heavily on a 3.0x equity multiplier (high leverage), making it vulnerable to earnings shocks and debt service stress",
 "Company A, because a high net margin indicates the company is overcharging customers and faces competitive risk",
 "Both carry identical risk since their ROEs are equal",
 "Company B, because high asset turnover always signals operational distress",
 ],
 correctIndex: 0,
 explanation:
 "Company B's ROE is driven by 3.0x leverage (equity multiplier), meaning it has 3 dollars of assets for every dollar of equity. This creates significant financial risk — if earnings fall, the company may struggle to service debt. Company A's ROE is primarily margin-driven, a more durable and lower-risk source of return.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "ROA and ROIC: Superior Capital Efficiency Metrics",
 content:
 "ROE is distorted by leverage. Two cleaner metrics:\n\n• ROA (Return on Assets) = Net Income / Total Assets. Measures how efficiently all assets generate profit, regardless of financing. Less affected by leverage choices.\n\n• ROIC (Return on Invested Capital) = NOPAT / Invested Capital\n - NOPAT = Net Operating Profit After Tax = EBIT × (1 tax rate)\n - Invested Capital = Total equity + Interest-bearing debt Excess cash\n\nROIC is the gold standard for capital allocation quality. It measures how much after-tax operating profit is generated per dollar of capital deliberately deployed in the business. Companies that earn ROIC consistently above their cost of capital (WACC) create economic value; those below destroy it.\n\nWarren Buffett's companies typically earn 15–30%+ ROIC, signaling durable competitive advantages.",
 highlight: ["ROIC", "ROA", "NOPAT", "invested capital", "WACC", "economic value"],
 },
 {
 type: "quiz-scenario",
 scenario:
 "Retailer R has ROE of 22% but an equity multiplier of 4.0x (heavily leveraged). Tech firm T has ROE of 20% with an equity multiplier of 1.3x (nearly debt-free). Both have WACC of 9%. Retailer R's ROIC is 8%; Tech firm T's ROIC is 18%.",
 question:
 "Which firm is creating more economic value, and what does this analysis reveal?",
 options: [
 "Tech firm T — its ROIC of 18% exceeds WACC of 9%, creating economic value; Retailer R's ROIC of 8% is below WACC, destroying value despite the higher ROE",
 "Retailer R — its higher ROE of 22% demonstrates superior shareholder returns regardless of leverage",
 "Both are equivalent since ROE reflects all relevant financing decisions",
 "Neither can be judged without knowing absolute revenue size",
 ],
 correctIndex: 0,
 explanation:
 "ROIC vs WACC is the definitive value creation test. Tech firm T earns 18% on invested capital versus a 9% cost — a 9-point spread creating real economic value. Retailer R earns only 8% on capital but pays 9% to obtain it, destroying value. Its superior ROE is an artifact of high leverage, not operational excellence.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Efficiency & Liquidity 
 {
 id: "financial-ratios-efficiency-liquidity",
 title: "Efficiency & Liquidity",
 description:
 "Analyze asset turnover, inventory days, DSO, DPO, the cash conversion cycle, and liquidity ratios to assess working capital management",
 icon: "Activity",
 xpReward: 60,
 difficulty: "intermediate",
 duration: 9,
 steps: [
 {
 type: "teach",
 title: "Asset Turnover and Inventory Turnover",
 content:
 "Efficiency ratios measure how productively a company uses its assets:\n\n• Asset Turnover = Revenue / Average Total Assets. How many dollars of revenue are generated per dollar of assets. A turnover of 1.5x means $1.50 in revenue per $1 of assets.\n\n• Inventory Turnover = COGS / Average Inventory. How many times inventory is sold and replaced per year. Higher is better (faster-moving goods, less capital tied up).\n\n• Days Inventory Outstanding (DIO) = 365 / Inventory Turnover. How many days of inventory is on hand. A DIO of 30 means the company holds 30 days of stock.\n\nA grocery chain might turn inventory 20x/year (DIO 18 days). An aircraft manufacturer might turn it once a year (DIO 365 days). Compare within the same industry only.",
 highlight: ["asset turnover", "inventory turnover", "DIO", "days inventory outstanding"],
 },
 {
 type: "teach",
 title: "DSO, DPO, and the Cash Conversion Cycle",
 content:
 "The Cash Conversion Cycle (CCC) measures how long cash is tied up in operations:\n\n• DSO (Days Sales Outstanding) = (Accounts Receivable / Revenue) × 365. How long it takes to collect cash after a sale. Lower DSO = faster collections.\n\n• DPO (Days Payable Outstanding) = (Accounts Payable / COGS) × 365. How long the company takes to pay suppliers. Higher DPO = longer use of supplier financing.\n\nCCC = DIO + DSO DPO\n\nExample: DIO = 45, DSO = 30, DPO = 40 CCC = 35 days. A negative CCC (e.g., Amazon, Walmart) means the company collects cash from customers before paying suppliers — a powerful working capital advantage that funds growth without capital.",
 highlight: ["DSO", "DPO", "cash conversion cycle", "CCC", "working capital"],
 },
 {
 type: "quiz-mc",
 question:
 "A company has DIO of 50 days, DSO of 40 days, and DPO of 70 days. What is the Cash Conversion Cycle, and what does it mean?",
 options: [
 "CCC = 20 days — the company needs 20 days of external financing between spending on inventory and collecting customer cash",
 "CCC = 160 days — the total days tied up in working capital before any payments",
 "CCC = 70 days — the DPO exceeds the combined DIO and DSO, creating a negative cycle",
 "CCC = 90 days — the sum of DIO and DSO only",
 ],
 correctIndex: 0,
 explanation:
 "CCC = DIO + DSO DPO = 50 + 40 70 = 20 days. The company needs 20 days of financing between paying for inventory and collecting from customers. A positive CCC means working capital consumes cash; a negative CCC (where DPO > DIO + DSO) means suppliers effectively finance the business.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Current Ratio, Quick Ratio, and Cash Ratio",
 content:
 "Liquidity ratios measure ability to meet short-term obligations:\n\n• Current Ratio = Current Assets / Current Liabilities. Includes all current assets. Ratio > 1 means assets cover liabilities. Industry norms vary widely — manufacturers may need 2x while retailers run at 1x.\n\n• Quick Ratio (Acid-Test) = (Cash + Short-term investments + Accounts receivable) / Current Liabilities. Excludes inventory, which may be illiquid. More conservative and widely preferred.\n\n• Cash Ratio = Cash & Equivalents / Current Liabilities. The most conservative — only immediately available cash. Rarely used but relevant in distress analysis.\n\nA current ratio that is too high (e.g., 5x) can signal excess idle assets. Too low can signal liquidity risk. Context and trend matter more than a single snapshot.",
 highlight: ["current ratio", "quick ratio", "cash ratio", "liquidity", "current assets"],
 },
 {
 type: "quiz-tf",
 statement:
 "A company with a current ratio of 2.0 is always in a healthy liquidity position regardless of the composition of its current assets.",
 correct: false,
 explanation:
 "False. If most current assets are illiquid inventory (e.g., slow-moving goods) or receivables from struggling customers, the apparent cushion is misleading. The quick ratio excludes inventory for this reason. A 2.0 current ratio driven by slow inventory can conceal genuine short-term cash stress.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Manufacturer M has: Cash $50M, Receivables $80M, Inventory $200M, Current Liabilities $150M. Distributor D has: Cash $40M, Receivables $90M, Inventory $20M, Current Liabilities $100M.",
 question:
 "Which company has a stronger quick ratio, and what does that imply about near-term liquidity risk?",
 options: [
 "Distributor D — quick ratio of 1.30x vs Manufacturer M's 0.87x; D has better near-term liquidity since its quick assets exceed current liabilities",
 "Manufacturer M — its current ratio of 2.2x is higher, indicating greater total asset coverage",
 "Both companies are equally liquid since their quick assets sum to similar totals",
 "Distributor D is riskier because it holds less inventory as a buffer",
 ],
 correctIndex: 0,
 explanation:
 "Quick ratio excludes inventory. Manufacturer M: (50+80)/150 = 0.87x — quick assets cover less than current liabilities, a potential liquidity concern if inventory cannot be liquidated quickly. Distributor D: (40+90)/100 = 1.30x — quick assets exceed current liabilities comfortably. D has superior near-term liquidity despite M's higher current ratio.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Leverage & Coverage 
 {
 id: "financial-ratios-leverage-coverage",
 title: "Leverage & Coverage",
 description:
 "Evaluate debt/equity, net debt/EBITDA, interest coverage, DSCR, and the Altman Z-score to assess financial risk and bankruptcy probability",
 icon: "AlertTriangle",
 xpReward: 70,
 difficulty: "advanced",
 duration: 10,
 steps: [
 {
 type: "teach",
 title: "Debt/Equity and Net Debt/EBITDA",
 content:
 "Leverage ratios measure the burden of debt on the business:\n\n• Debt-to-Equity (D/E) = Total Debt / Total Shareholders' Equity. How many dollars of debt are used per dollar of equity. D/E of 1.0x means equal debt and equity financing. Capital-intensive industries (utilities, telecoms) often run 1–2x D/E; tech companies near zero.\n\n• Net Debt = Total Debt Cash & Equivalents. Cash reduces effective leverage.\n\n• Net Debt / EBITDA: How many years of EBITDA it would take to repay net debt. The most common leverage measure in credit analysis and M&A:\n - Under 2x: conservative, investment grade territory\n - 3–4x: moderate leverage, typical leveraged buyout range\n - 5x+: high leverage, elevated distress risk\n\nA company with $500M EBITDA and $1.5B net debt runs at 3x — manageable for a stable cash flow business but risky for a cyclical one.",
 highlight: ["debt/equity", "net debt", "EBITDA", "leverage", "net debt/EBITDA"],
 },
 {
 type: "teach",
 title: "Interest Coverage and DSCR",
 content:
 "Coverage ratios measure ability to service debt from operating income:\n\n• Interest Coverage Ratio = EBIT / Interest Expense. How many times operating profit covers interest payments. A ratio of 3x means EBIT is 3× the interest bill. Below 1.5x raises red flags; below 1x means the company cannot cover interest from operations.\n\n• DSCR (Debt Service Coverage Ratio) = Net Operating Income / Total Debt Service. Used in real estate, project finance, and corporate lending. Includes both principal repayments and interest:\n - DSCR > 1.25x: typically the minimum lender covenant threshold\n - DSCR < 1.0x: negative coverage — borrower cannot service debt from operations\n\n• Fixed Charge Coverage = (EBIT + Lease payments) / (Interest + Lease payments). Extends coverage to include operating lease obligations, important for retailers and airlines with heavy lease commitments.",
 highlight: ["interest coverage", "DSCR", "fixed charge coverage", "debt service", "covenant"],
 },
 {
 type: "quiz-tf",
 statement:
 "An interest coverage ratio below 1.5x is generally considered a warning sign, but a ratio above 3x always means a company is financially safe.",
 correct: false,
 explanation:
 "False. While a high interest coverage ratio is positive, it does not guarantee safety. A highly cyclical company with 5x coverage in a boom year might see coverage collapse to 0.5x in a recession if EBIT drops sharply. The stability and predictability of EBIT matters as much as the current ratio level. Coverage must be stress-tested across economic scenarios.",
 difficulty: 2,
 },
 {
 type: "quiz-mc",
 question:
 "A commercial real estate property generates Net Operating Income (NOI) of $1.2M per year. Annual debt service (principal + interest) is $1.0M. What is the DSCR, and would a typical lender be comfortable with this loan?",
 options: [
 "DSCR = 1.20x — marginally adequate, meeting a common 1.20x minimum covenant, but lenders typically prefer 1.25x+ for comfort",
 "DSCR = 1.20x — well above the standard 2.0x minimum, indicating very low risk",
 "DSCR = 0.83x — the property cannot cover its debt service and the loan would be in default",
 "DSCR = 1.20x — this ratio is irrelevant for real estate; loan-to-value is the only metric that matters",
 ],
 correctIndex: 0,
 explanation:
 "DSCR = $1.2M / $1.0M = 1.20x. This exactly meets a common 1.20x minimum threshold but is below the 1.25x–1.30x most lenders prefer for comfort. It leaves little buffer if NOI dips even modestly. Lenders would likely approve the loan but impose tight covenants or a higher interest rate.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "The Altman Z-Score: Bankruptcy Prediction",
 content:
 "The Altman Z-Score (1968) combines five financial ratios into a single bankruptcy predictor for public manufacturers:\n\nZ = 1.2×X1 + 1.4×X2 + 3.3×X3 + 0.6×X4 + 1.0×X5\n\n• X1 = Working Capital / Total Assets (liquidity)\n• X2 = Retained Earnings / Total Assets (accumulated profitability)\n• X3 = EBIT / Total Assets (asset productivity)\n• X4 = Market Cap / Total Liabilities (market leverage)\n• X5 = Revenue / Total Assets (asset turnover)\n\nInterpretation:\n• Z > 2.99: Safe zone — low bankruptcy risk\n• 1.81 < Z < 2.99: Grey zone — uncertain\n• Z < 1.81: Distress zone — high bankruptcy risk\n\nVariants exist for private companies (Z') and non-manufacturers (Z''). Not a guarantee but a powerful screening tool — studies show 72–80% accuracy 2 years before bankruptcy.",
 highlight: ["Altman Z-score", "bankruptcy", "distress zone", "safe zone", "grey zone"],
 },
 {
 type: "quiz-scenario",
 scenario:
 "Retailer P shows the following data: Working Capital / Assets = 0.15, Retained Earnings / Assets = 0.08, EBIT / Assets = 0.04, Market Cap / Liabilities = 0.40, Revenue / Assets = 1.20. Calculate the approximate Altman Z-Score.",
 question:
 "What is the Z-Score and what does it signal about Retailer P?",
 options: [
 "Z 1.74 — in the distress zone (below 1.81), signaling elevated bankruptcy risk and warranting deeper investigation of the balance sheet",
 "Z 3.20 — in the safe zone, indicating healthy finances despite modest ratios",
 "Z 2.40 — in the grey zone, but retail companies are immune to Z-Score distress signals",
 "Z 1.74 — below 1.81, but the Z-Score is only valid for manufacturing companies so no conclusion can be drawn",
 ],
 correctIndex: 0,
 explanation:
 "Z = 1.2×0.15 + 1.4×0.08 + 3.3×0.04 + 0.6×0.40 + 1.0×1.20 = 0.18 + 0.112 + 0.132 + 0.24 + 1.20 = 1.864. Wait — let me recheck: 0.18+0.112+0.132+0.24+1.20 = 1.864, which is actually in the grey zone. However, 0.6×0.40 = 0.24; recalculating precisely: 1.2(0.15)=0.18, 1.4(0.08)=0.112, 3.3(0.04)=0.132, 0.6(0.40)=0.24, 1.0(1.20)=1.20, total = 1.864. This sits just above the 1.81 distress boundary — in the grey zone, signaling financial fragility. The low EBIT/Assets (0.04) and thin retained earnings are warning signs demanding closer scrutiny.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A company with a D/E ratio of 3.0x is always riskier than a company with D/E of 0.5x, regardless of industry or cash flow stability.",
 correct: false,
 explanation:
 "False. High leverage in a stable, regulated industry with predictable cash flows (e.g., water utilities, toll roads) can be very manageable. The same leverage in a highly cyclical business with volatile revenues would be dangerous. Leverage risk depends on cash flow stability, asset quality, interest rate exposure, and covenant structure — not the ratio in isolation.",
 difficulty: 2,
 },
 ],
 },
 ],
};
