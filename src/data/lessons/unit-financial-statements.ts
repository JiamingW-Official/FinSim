import type { Unit } from "./types";

export const UNIT_FINANCIAL_STATEMENTS: Unit = {
  id: "financial-statements",
  title: "Financial Statements",
  description: "Read and analyze income statements, balance sheets, and cash flows like a pro",
  icon: "FileText",
  color: "#0ea5e9",
  lessons: [
    {
      id: "financial-statements-1",
      title: "Income Statement",
      description: "Revenue, costs, and how companies report profit",
      icon: "TrendingUp",
      xpReward: 60,
      difficulty: "intermediate",
      duration: 10,
      steps: [
        {
          type: "teach",
          title: "The Income Statement Explained",
          content:
            "The **income statement** (also called the P&L — Profit & Loss) shows how much a company earned and spent over a period (quarter or year).\n\n**Key line items from top to bottom**:\n• **Revenue** (net sales) — what the company charged customers\n• **COGS** (Cost of Goods Sold) — direct costs to produce those sales\n• **Gross Profit** = Revenue − COGS\n• **Operating Expenses** (SG&A, R&D) — overhead and administration\n• **Operating Income (EBIT)** = Gross Profit − Operating Expenses\n• **Net Income** = EBIT − Interest − Taxes\n\nThink of it as a waterfall: revenue flows down and expenses drain it at each level.",
          highlight: ["revenue", "gross profit", "operating income", "net income"],
        },
        {
          type: "teach",
          title: "EBITDA and Common-Size Analysis",
          content:
            "**EBITDA** = Earnings Before Interest, Taxes, Depreciation & Amortization.\n\nIt strips out non-cash charges (D&A) and financing decisions, making it a popular proxy for operating cash flow. Analysts use it to compare companies across different capital structures.\n\n**Common-size analysis** expresses every line item as a percentage of revenue:\n• Gross margin = Gross Profit / Revenue\n• Operating margin = Operating Income / Revenue\n• Net margin = Net Income / Revenue\n\nExample: Revenue $100M, COGS $60M → Gross margin = 40%\n\nTrack margins over time — shrinking margins often signal pricing pressure or rising costs before the stock reacts.",
          highlight: ["EBITDA", "gross margin", "operating margin", "net margin"],
        },
        {
          type: "teach",
          title: "Income Statement Red Flags",
          content:
            "Watch for these warning signs:\n• **Revenue recognition games** — booking revenue before delivery (channel stuffing)\n• **Gross margin compression** — revenue grows but profit shrinks\n• **One-time gains boosting net income** — restructuring charges, asset sales; strip these out\n• **Rising SG&A as % of revenue** — cost structure ballooning\n• **Divergence between revenue and cash** — revenue soaring but operating cash flow flat (see Lesson 3)\n\nAlways compare 3–5 years of income statements side by side to spot trends, not just a single quarter.",
          highlight: ["red flags", "revenue recognition", "margin compression"],
        },
        {
          type: "quiz-mc",
          question:
            "A company reports Revenue of $500M, COGS of $300M, and Operating Expenses of $80M. What is the Operating Income?",
          options: [
            "$120M — Gross Profit $200M minus OpEx $80M",
            "$200M — Revenue minus COGS only",
            "$420M — Revenue minus OpEx only",
            "$80M — Operating Expenses alone",
          ],
          correctIndex: 0,
          explanation:
            "Gross Profit = $500M − $300M = $200M. Operating Income = $200M − $80M = $120M. Remember: operating income subtracts both COGS and operating expenses from revenue.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "EBITDA is a GAAP measure that appears directly on the face of the income statement.",
          correct: false,
          explanation:
            "EBITDA is a non-GAAP metric calculated by analysts — it does not appear as a line item on the GAAP income statement. Companies often report it in earnings releases as a supplemental metric, but you must calculate it yourself from the reported financials.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "TechCo's revenue grew 25% YoY to $1B. Gross margin fell from 65% to 55%. Net income was flat at $80M.",
          question: "What is the most likely concern for investors?",
          options: [
            "Gross margin compression — costs are rising faster than revenue, eroding profitability",
            "Revenue growth of 25% is too slow for a tech company",
            "Net income is too high relative to revenue",
            "The company should increase COGS to improve margins",
          ],
          correctIndex: 0,
          explanation:
            "When revenue grows strongly but gross margin compresses, it often signals pricing pressure, higher input costs, or a shift toward lower-margin products. Flat net income despite 25% revenue growth confirms profitability is being diluted — a classic red flag.",
          difficulty: 2,
        },
      ],
    },
    {
      id: "financial-statements-2",
      title: "Balance Sheet",
      description: "Assets, liabilities, and the financial structure of a company",
      icon: "Scale",
      xpReward: 60,
      difficulty: "intermediate",
      duration: 10,
      steps: [
        {
          type: "teach",
          title: "Balance Sheet Basics",
          content:
            "The **balance sheet** shows what a company owns (assets), what it owes (liabilities), and the residual value belonging to shareholders (equity) at a point in time.\n\n**The fundamental equation**: Assets = Liabilities + Shareholders' Equity\n\n**Current assets** (converted to cash within 1 year): cash, accounts receivable, inventory\n**Non-current assets** (long-term): property/plant/equipment (PP&E), intangibles, goodwill\n\n**Current liabilities** (due within 1 year): accounts payable, short-term debt, accruals\n**Non-current liabilities**: long-term debt, deferred taxes, pension obligations\n\n**Working Capital** = Current Assets − Current Liabilities. Positive working capital means the company can pay near-term bills.",
          highlight: ["assets", "liabilities", "shareholders equity", "working capital"],
        },
        {
          type: "teach",
          title: "Goodwill, Intangibles, and Deferred Taxes",
          content:
            "**Goodwill** arises when a company acquires another for more than the fair value of its net assets. It sits on the balance sheet until an impairment charge is taken.\n• Large goodwill relative to total assets = heavy acquisition history. Watch for impairment write-downs.\n\n**Intangible assets**: patents, trademarks, customer relationships — often the most valuable yet hardest to value assets in tech/pharma.\n\n**Deferred tax liabilities**: taxes owed in the future (e.g., accelerated depreciation). A large DTL can signal future cash outflows.\n\n**Deferred tax assets**: tax benefits to be realized in the future. If a company repeatedly generates DTAs from losses, profitability is questionable.",
          highlight: ["goodwill", "intangibles", "deferred taxes", "impairment"],
        },
        {
          type: "teach",
          title: "Leverage Ratios and Off-Balance-Sheet Items",
          content:
            "**Key leverage ratios from the balance sheet**:\n• **Debt-to-Equity (D/E)** = Total Debt / Shareholders' Equity — measures financial leverage\n• **Debt-to-Assets** = Total Debt / Total Assets — how much assets are debt-financed\n• **Current Ratio** = Current Assets / Current Liabilities — short-term liquidity (>1 is generally safe)\n\n**Off-balance-sheet items** are obligations not shown as liabilities:\n• Operating leases (partially brought on-sheet by ASC 842)\n• Special purpose vehicles (SPVs) — infamously used by Enron\n• Contingent liabilities from lawsuits\n\nAlways read footnotes — major obligations may be buried there.",
          highlight: ["debt-to-equity", "current ratio", "off-balance-sheet", "leverage"],
        },
        {
          type: "quiz-mc",
          question:
            "Company A has Current Assets of $400M and Current Liabilities of $250M. What is its working capital and current ratio?",
          options: [
            "Working capital $150M, Current ratio 1.6×",
            "Working capital $650M, Current ratio 0.6×",
            "Working capital $250M, Current ratio 1.0×",
            "Working capital $400M, Current ratio 1.6×",
          ],
          correctIndex: 0,
          explanation:
            "Working Capital = $400M − $250M = $150M. Current Ratio = $400M / $250M = 1.6×. A ratio above 1.0 means the company can cover its short-term obligations with current assets.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Goodwill on the balance sheet represents cash the company has available to spend.",
          correct: false,
          explanation:
            "Goodwill is an intangible asset representing the premium paid in acquisitions — it is NOT cash. It cannot be spent and can be impaired to zero if the acquired business underperforms, resulting in a large non-cash write-down charge on the income statement.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "RetailCo has total debt of $800M and shareholders' equity of $200M. The industry average D/E ratio is 1.5×.",
          question: "What does RetailCo's leverage position indicate?",
          options: [
            "D/E of 4.0× — significantly over-leveraged vs the 1.5× industry average, raising default risk",
            "D/E of 0.25× — conservatively financed with minimal risk",
            "D/E of 1.6× — roughly in line with the industry average",
            "D/E cannot be calculated without knowing total assets",
          ],
          correctIndex: 0,
          explanation:
            "D/E = $800M / $200M = 4.0×, far above the 1.5× industry average. High leverage amplifies returns in good times but increases bankruptcy risk during downturns — especially dangerous in cyclical industries like retail.",
          difficulty: 2,
        },
      ],
    },
    {
      id: "financial-statements-3",
      title: "Cash Flow Statement",
      description: "Where the cash actually comes from and goes",
      icon: "Banknote",
      xpReward: 65,
      difficulty: "intermediate",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "Three Sections of the Cash Flow Statement",
          content:
            "The **cash flow statement** shows actual cash moving in and out — unlike the income statement which uses accrual accounting.\n\n**1. Operating Cash Flow (OCF)** — cash generated from core business operations\n**2. Investing Activities (CFI)** — capital expenditures, acquisitions, asset sales\n**3. Financing Activities (CFF)** — debt issuance/repayment, dividends, share buybacks\n\n**Free Cash Flow (FCF)** = OCF − Capital Expenditures\n\nFCF is often considered the purest measure of a company's financial health — it's the cash left over after maintaining/growing the business.",
          highlight: ["operating cash flow", "free cash flow", "investing", "financing"],
        },
        {
          type: "teach",
          title: "Reconciling OCF to Net Income",
          content:
            "OCF starts with net income and adjusts for non-cash items and working capital changes:\n\n**Net Income**\n+ Depreciation & Amortization (non-cash charge added back)\n+ Stock-based compensation (non-cash)\n− Increase in Accounts Receivable (cash not yet received)\n− Increase in Inventory (cash spent building inventory)\n+ Increase in Accounts Payable (cash not yet paid to suppliers)\n= **Operating Cash Flow**\n\nKey insight: **A profitable company can still be cash-negative** if it's building receivables or inventory faster than collecting cash. This is the core of 'quality of earnings' analysis.",
          highlight: ["depreciation", "working capital", "quality of earnings", "accounts receivable"],
        },
        {
          type: "teach",
          title: "Quality of Earnings and FCF Red Flags",
          content:
            "**High-quality earnings**: Net income closely tracks OCF. Cash conversion is strong.\n**Low-quality earnings**: Large gap between net income and OCF — earnings may be inflated through aggressive accruals.\n\n**Red flags in cash flows**:\n• Net income rising but OCF declining (accrual manipulation)\n• Persistent negative FCF in a mature business (unsustainable model)\n• Heavy reliance on asset sales to generate operating-looking cash\n• CFI consistently positive for a growth company (could mean underinvesting)\n• Financing activities hiding operational weakness (borrowing to pay dividends)\n\nRule of thumb: **OCF / Net Income > 0.9** over time = high earnings quality.",
          highlight: ["earnings quality", "accruals", "FCF red flags"],
        },
        {
          type: "quiz-mc",
          question:
            "A company has Operating Cash Flow of $200M and Capital Expenditures of $75M. What is its Free Cash Flow?",
          options: [
            "$125M — OCF minus CapEx",
            "$275M — OCF plus CapEx",
            "$200M — OCF alone equals FCF",
            "$75M — CapEx alone",
          ],
          correctIndex: 0,
          explanation:
            "FCF = OCF − CapEx = $200M − $75M = $125M. This $125M represents cash the company can use to pay dividends, repurchase shares, pay down debt, or invest in acquisitions after maintaining its asset base.",
          difficulty: 1,
        },
        {
          type: "quiz-mc",
          question:
            "A company reports Net Income of $50M but Operating Cash Flow of −$20M. What is the most likely explanation?",
          options: [
            "Aggressive revenue recognition or rapid working capital buildup consuming cash",
            "Depreciation charges are too high",
            "The company is paying too much in dividends",
            "Capital expenditures exceeded net income",
          ],
          correctIndex: 0,
          explanation:
            "When net income is positive but OCF is negative, it often means accounts receivable or inventory are swelling (cash not yet collected) or aggressive accrual accounting is boosting reported profits without actual cash inflows — a classic earnings quality red flag.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A company paying dividends consistently must have strong free cash flow to sustain them.",
          correct: true,
          explanation:
            "Dividends are paid from cash, not accounting earnings. A company with negative or thin FCF that continues paying dividends is likely borrowing to do so — which is unsustainable and often precedes a dividend cut. Always check if FCF covers dividend payments (payout ratio on FCF basis).",
          difficulty: 2,
        },
      ],
    },
    {
      id: "financial-statements-4",
      title: "Ratio Analysis",
      description: "Liquidity, profitability, efficiency, and solvency ratios",
      icon: "BarChart2",
      xpReward: 65,
      difficulty: "intermediate",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "Liquidity Ratios",
          content:
            "Liquidity ratios measure a company's ability to meet short-term obligations.\n\n**Current Ratio** = Current Assets / Current Liabilities\n• >2: Very liquid (but may be holding too much idle cash)\n• 1–2: Generally healthy\n• <1: May struggle to pay near-term bills\n\n**Quick Ratio (Acid Test)** = (Current Assets − Inventory) / Current Liabilities\n• Stricter than current ratio — excludes inventory which may be hard to sell quickly\n• >1 is generally comfortable\n\n**Cash Ratio** = Cash & Equivalents / Current Liabilities\n• Most conservative; rarely expected to be >1 in healthy businesses",
          highlight: ["current ratio", "quick ratio", "liquidity"],
        },
        {
          type: "teach",
          title: "Profitability Ratios",
          content:
            "Profitability ratios show how efficiently a company generates returns.\n\n**ROE (Return on Equity)** = Net Income / Shareholders' Equity\n• Measures how well management uses shareholders' capital\n• S&P 500 average ~15–20%; consistently >20% is excellent\n\n**ROA (Return on Assets)** = Net Income / Total Assets\n• How efficiently assets generate profit; banks typically 1–2%\n\n**ROIC (Return on Invested Capital)** = NOPAT / Invested Capital\n• The gold standard — measures returns on ALL capital deployed (debt + equity)\n• ROIC > WACC (cost of capital) = value creation\n• ROIC < WACC = value destruction, even if profits are positive",
          highlight: ["ROE", "ROA", "ROIC", "WACC"],
        },
        {
          type: "teach",
          title: "Efficiency and Solvency Ratios",
          content:
            "**Efficiency ratios** measure how well a company manages its assets:\n• **Asset Turnover** = Revenue / Total Assets — higher means assets generate more sales\n• **Inventory Days** = (Inventory / COGS) × 365 — how many days to sell inventory; lower is better for most businesses\n• **Days Sales Outstanding (DSO)** = (AR / Revenue) × 365 — how long to collect receivables\n\n**Solvency ratios** measure long-term financial health:\n• **Debt-to-Equity** = Total Debt / Equity — higher = more leveraged\n• **Interest Coverage** = EBIT / Interest Expense — how many times interest is covered by earnings; <3× is concerning\n• **Net Debt / EBITDA** — popular with credit analysts; <2× is generally safe",
          highlight: ["asset turnover", "inventory days", "interest coverage", "net debt/EBITDA"],
        },
        {
          type: "quiz-mc",
          question:
            "A company has EBIT of $90M and Interest Expense of $45M. What is the interest coverage ratio, and how should an analyst interpret it?",
          options: [
            "2.0× — marginal; any earnings decline could threaten debt servicing",
            "0.5× — excellent; interest is well covered",
            "45× — dangerous; interest exceeds EBIT",
            "2.0× — excellent; the company is conservatively financed",
          ],
          correctIndex: 0,
          explanation:
            "Interest Coverage = $90M / $45M = 2.0×. This means earnings cover interest only twice — considered marginal. A business downturn reducing EBIT by 50% would make the company unable to service its debt. Most analysts prefer >3× as a safety buffer.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A company with a high ROIC but a low ROE is necessarily destroying shareholder value.",
          correct: false,
          explanation:
            "ROIC measures returns on all capital deployed (debt + equity). A company can have high ROIC (efficiently deploying capital) but low ROE if it has minimal leverage. ROE can be artificially boosted by adding debt. ROIC is generally considered a better indicator of economic value creation than ROE alone.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "RetailerX has Inventory Days of 120 vs. an industry average of 45. Current Ratio is 0.8.",
          question: "What risks does this combination signal?",
          options: [
            "Slow-moving inventory tying up cash and a current ratio below 1 — liquidity squeeze risk",
            "Efficient inventory management and strong liquidity",
            "High demand for products causing inventory to build up",
            "Conservative balance sheet with excess cash reserves",
          ],
          correctIndex: 0,
          explanation:
            "120-day inventory vs. 45-day average means inventory is selling 2.7× slower than peers — possibly outdated stock or weak demand. Combined with a current ratio below 1.0, the company may struggle to meet near-term obligations, especially if it cannot liquidate inventory quickly.",
          difficulty: 2,
        },
      ],
    },
    {
      id: "financial-statements-5",
      title: "DuPont Analysis",
      description: "Decompose ROE to understand what truly drives returns",
      icon: "Layers",
      xpReward: 70,
      difficulty: "advanced",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "The 3-Factor DuPont Model",
          content:
            "**DuPont analysis** decomposes ROE into three multiplicative drivers:\n\n**ROE = Net Profit Margin × Asset Turnover × Equity Multiplier**\n\n• **Net Profit Margin** = Net Income / Revenue — profitability per dollar of sales\n• **Asset Turnover** = Revenue / Total Assets — efficiency of asset utilization\n• **Equity Multiplier** = Total Assets / Shareholders' Equity — financial leverage\n\nExample: ROE = 5% margin × 1.5× turnover × 2× leverage = 15%\n\nTwo companies with identical 15% ROE can get there very differently — a luxury brand via high margins, a grocery chain via high turnover, a bank via high leverage.",
          highlight: ["DuPont", "ROE decomposition", "profit margin", "asset turnover", "leverage"],
        },
        {
          type: "teach",
          title: "Extended 5-Factor DuPont",
          content:
            "The extended model splits net margin into operating efficiency and tax/interest burden:\n\n**ROE = Tax Burden × Interest Burden × EBIT Margin × Asset Turnover × Equity Multiplier**\n\n• **Tax Burden** = Net Income / Pretax Income — fraction kept after taxes\n• **Interest Burden** = Pretax Income / EBIT — fraction kept after interest\n• **EBIT Margin** = EBIT / Revenue — core operating profitability\n\nThis tells you *exactly* where ROE is coming from and whether it is sustainable:\n• ROE driven by EBIT margin improvement = high quality (better pricing power or cost control)\n• ROE driven by rising leverage = riskier (works until interest costs overwhelm earnings)\n• ROE driven by tax burden falling = potentially temporary (tax rates can rise)",
          highlight: ["5-factor DuPont", "tax burden", "interest burden", "EBIT margin"],
        },
        {
          type: "teach",
          title: "Improving ROE Sustainably",
          content:
            "Not all ROE improvement is equal:\n\n**Sustainable ROE drivers** (increase intrinsic value):\n• Expanding operating margins through pricing power or cost efficiency\n• Growing asset turnover through better inventory/receivables management\n• Increasing revenue per asset without proportional cost increases\n\n**Unsustainable / risky ROE drivers**:\n• Piling on debt to boost the equity multiplier\n• Share buybacks financed by borrowing (reduces equity → raises ROE mechanically)\n• One-time tax benefits\n\nBerkshire Hathaway's Warren Buffett looks for companies with >20% ROE sustained **without** heavy leverage — a sign of genuine competitive advantage.",
          highlight: ["sustainable ROE", "competitive advantage", "share buybacks", "leverage risk"],
        },
        {
          type: "quiz-mc",
          question:
            "Company A achieves 18% ROE with a 9% net margin, 1.0× asset turnover, and 2.0× equity multiplier. Company B achieves 18% ROE with a 3% net margin, 1.0× asset turnover, and 6.0× equity multiplier. Which company's ROE is higher quality?",
          options: [
            "Company A — its ROE is driven by superior profit margins, not extreme leverage",
            "Company B — higher leverage means more efficient use of equity",
            "Both are equivalent — ROE is 18% either way",
            "Company B — lower margins mean more room to improve",
          ],
          correctIndex: 0,
          explanation:
            "Both achieve 18% ROE, but Company A uses 2× leverage while Company B uses 6× leverage to compensate for its thin 3% margins. Company A's ROE quality is higher — it can sustain returns even if leverage decreases or credit conditions tighten. Company B's ROE is fragile.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "A company's ROE improved from 12% to 18% in one year. The equity multiplier rose from 2.5× to 4.0×, while net margin and asset turnover were unchanged. What drove the improvement?",
          options: [
            "Increased financial leverage — the company took on more debt, not improved operations",
            "Better operating efficiency reducing costs",
            "Expansion into higher-margin product lines",
            "Improved tax management cutting the effective tax rate",
          ],
          correctIndex: 0,
          explanation:
            "Since net margin and asset turnover were unchanged, the only DuPont driver that changed was the equity multiplier (leverage). The company increased debt to boost ROE mechanically — this is the least sustainable path because it also increases financial risk and interest obligations.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A company that repurchases shares with excess cash necessarily reduces the quality of its ROE.",
          correct: false,
          explanation:
            "Buybacks funded by genuine free cash flow reduce the equity base and mechanically increase ROE — but this is a legitimate capital return to shareholders, not a financial manipulation. The quality concern arises when buybacks are funded by debt. Cash-funded buybacks at below-intrinsic-value prices are generally value-accretive.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "financial-statements-6",
      title: "Cross-Statement Analysis",
      description: "Connect the three statements and catch inconsistencies",
      icon: "GitMerge",
      xpReward: 70,
      difficulty: "advanced",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "How the Three Statements Link",
          content:
            "The three financial statements form an interconnected system:\n\n**Income Statement → Cash Flow Statement**\n• Net income is the starting point for the indirect OCF calculation\n• D&A (income statement expense) is added back in OCF\n\n**Cash Flow Statement → Balance Sheet**\n• Ending cash on CFS = cash line on balance sheet\n• Net cash change reconciles balance sheet cash between periods\n\n**Balance Sheet → Income Statement**\n• Opening PP&E + CapEx − Depreciation = Closing PP&E\n• Changes in working capital (AR, inventory, AP) flow through both balance sheet and CFS\n\nA simple internal consistency check: take last year's cash + net change in cash from CFS = this year's cash on balance sheet.",
          highlight: ["statement linkage", "working capital", "PP&E reconciliation"],
        },
        {
          type: "teach",
          title: "Segment Reporting and Footnote Red Flags",
          content:
            "Large companies break results into **business segments** — this is where the real story often hides.\n\nWhy segment reporting matters:\n• A struggling core business can be masked by a growing segment\n• Management can shift costs between segments to make the 'highlighted' segment look better\n• Segment margins reveal which businesses actually earn returns\n\n**Critical footnotes to read**:\n• Revenue recognition policy (Note 1 / Summary of Significant Accounting Policies)\n• Related-party transactions (loans to executives, sales to affiliated entities)\n• Off-balance-sheet commitments and contingencies\n• Pension and OPEB obligations (can be larger than reported debt)\n• Stock-based compensation details (diluted share count growth)\n• Going concern language — a serious red flag if auditors flag it",
          highlight: ["segment reporting", "footnotes", "related-party", "going concern"],
        },
        {
          type: "teach",
          title: "Checking Consistency Across Statements",
          content:
            "Professional analysts run cross-statement consistency checks to detect accounting irregularities:\n\n**Revenue-to-receivables check**: If revenue grows 20% but AR grows 40%, customers aren't paying — or revenue is being pulled forward.\n\n**CapEx-to-depreciation ratio**: CapEx << depreciation for years signals underinvestment (balance sheet looks good short-term, but future capacity suffers).\n\n**Inventory-to-COGS check**: Rapid inventory build without matching COGS growth may signal writedown risk.\n\n**Cash-to-net-income check**: Persistent large divergence (net income >> OCF) over multiple years is an Enron/WorldCom-style red flag.\n\nThe Beneish M-Score and Altman Z-Score formalize these checks into quantitative fraud and bankruptcy risk models.",
          highlight: ["consistency check", "receivables", "Beneish M-Score", "Altman Z-Score"],
        },
        {
          type: "quiz-mc",
          question:
            "A company's Net Income was $80M. The Cash Flow Statement starts with $80M, adds back $20M D&A, and shows a $30M increase in Accounts Receivable. What is the Operating Cash Flow?",
          options: [
            "$70M — $80M + $20M D&A − $30M AR increase",
            "$130M — $80M + $20M + $30M",
            "$80M — same as net income",
            "$50M — net income minus D&A",
          ],
          correctIndex: 0,
          explanation:
            "OCF = Net Income + D&A − Increase in AR = $80M + $20M − $30M = $70M. The $30M rise in accounts receivable represents revenue recognized but not yet collected — it reduces cash flow. D&A is a non-cash expense so it is added back.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "FraudCo reports 30% revenue growth for 3 consecutive years. Accounts receivable grew 80% each year. Operating cash flow was negative all three years despite positive net income. Auditors issued an unqualified opinion each year.",
          question: "What cross-statement signals most strongly suggest accounting irregularities?",
          options: [
            "Revenue growing at 30% while AR surges 80% YoY and OCF is persistently negative — classic revenue recognition manipulation",
            "Rapid revenue growth is a positive signal; negative OCF is normal for high-growth companies",
            "The unqualified audit opinion confirms the financials are reliable",
            "Negative OCF is expected when a company makes large capital expenditures",
          ],
          correctIndex: 0,
          explanation:
            "When AR grows 2.7× faster than revenue for three years and OCF is persistently negative while net income is positive, it strongly suggests revenue is being booked before cash is collected — potentially channel stuffing or outright fabrication. Unqualified audit opinions do not guarantee accuracy (Enron also received clean opinions). This pattern resembles classic frauds detected via Beneish M-Score analysis.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "If a company's CapEx is consistently less than its depreciation expense for many years, it is likely investing heavily in future growth.",
          correct: false,
          explanation:
            "CapEx < Depreciation means the company is replacing assets more slowly than they wear out — a sign of underinvestment, not growth investment. While it improves near-term FCF and looks good on the cash flow statement, it degrades the asset base over time and may impair future earnings capacity. It is the opposite of growth investment.",
          difficulty: 3,
        },
      ],
    },
  ],
};
