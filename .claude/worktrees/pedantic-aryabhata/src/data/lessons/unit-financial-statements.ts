import type { Unit } from "./types";

export const UNIT_FINANCIAL_STATEMENTS: Unit = {
 id: "financial-statements",
 title: "Reading Financial Statements",
 description:
 "Decode income statements, balance sheets, and cash flow statements like a pro",
 icon: "FileText",
 color: "#3B82F6",
 lessons: [
 {
 id: "financial-statements-1",
 title: "Income Statement",
 description:
 "Revenue recognition, profit layers, EBITDA, EPS, and non-recurring items",
 icon: "TrendingUp",
 xpReward: 60,
 difficulty: "intermediate",
 duration: 10,
 steps: [
 {
 type: "teach",
 title: "The Income Statement Waterfall",
 content:
 "The **income statement** (P&L) shows how much a company earned and spent over a period. Think of it as a waterfall — revenue flows in at the top, and expenses drain it at each level.\n\n**Key line items**:\n• **Revenue** — what customers paid\n• **Cost of Goods Sold (COGS)** — direct production costs\n• **Gross Profit** = Revenue COGS\n• **Operating Expenses** (SG&A, R&D) — overhead and administration\n• **Operating Income (EBIT)** = Gross Profit OpEx\n• **Net Income** = EBIT Interest Taxes\n\n**Gross margin** = Gross Profit / Revenue. **Operating margin** = EBIT / Revenue. **Net margin** = Net Income / Revenue. Tracking these over time reveals pricing power and cost discipline.",
 bullets: [
 "Revenue is recognized when earned, not necessarily when cash is received",
 "Gross margin is the first health check — shrinking margins signal cost or pricing trouble",
 "EBIT isolates operating performance, stripping out financing and tax decisions",
 ],
 },
 {
 type: "teach",
 title: "EBITDA, EPS, and Non-Recurring Items",
 content:
 "**EBITDA** = EBIT + Depreciation & Amortization. It strips non-cash charges to approximate operating cash flow, making it popular for cross-company comparisons regardless of capital structure.\n\n**EPS (Earnings Per Share)**:\n• **Basic EPS** = Net Income / Basic Shares Outstanding\n• **Diluted EPS** = Net Income / (Basic + Dilutive Securities) — includes stock options, convertible notes; always lower than or equal to basic EPS\n\n**Non-recurring items** distort the trend:\n• Restructuring charges, asset impairments, litigation settlements\n• One-time gains from asset sales can inflate net income\n• Analysts strip these out to compute **adjusted (core) EPS**\n\n**Segment reporting** breaks revenue and operating income by business unit — critical for spotting when a struggling division is hidden by a strong one.",
 bullets: [
 "EBITDA is non-GAAP — calculate it yourself from the reported financials",
 "Always compare diluted EPS, not basic, to account for potential share dilution",
 "Read the notes for non-recurring charges before trusting reported net income",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A company reports Revenue of $500M, COGS of $300M, and Operating Expenses of $80M. What is its Operating Income (EBIT)?",
 options: [
 "$120M — Gross Profit $200M minus OpEx $80M",
 "$200M — Revenue minus COGS only",
 "$420M — Revenue minus OpEx only",
 "$80M — Operating Expenses alone",
 ],
 correctIndex: 0,
 explanation:
 "Gross Profit = $500M $300M = $200M. EBIT = $200M $80M = $120M. Both COGS and operating expenses must be subtracted from revenue to reach operating income.",
 },
 {
 type: "quiz-tf",
 statement:
 "EBITDA is a GAAP measure that appears directly as a line item on the face of the income statement.",
 correct: false,
 explanation:
 "EBITDA is a non-GAAP metric that analysts calculate by adding back depreciation and amortization to EBIT. It does not appear on the GAAP income statement. Companies often disclose it in earnings releases as a supplemental measure, but it is not audited as a standalone line item.",
 },
 {
 type: "quiz-mc",
 question:
 "TechCo's revenue grew 30% to $1B, but gross margin compressed from 65% to 52% and net income was flat. What is the most likely concern?",
 options: [
 "Costs are rising faster than revenue, eroding profitability despite strong top-line growth",
 "Revenue growth of 30% is too slow for a technology company",
 "Net income being flat is excellent when revenue is growing quickly",
 "Gross margin above 50% is always considered exceptional",
 ],
 correctIndex: 0,
 explanation:
 "When revenue grows strongly but gross margin compresses significantly, it signals that pricing pressure or rising input costs are outpacing revenue gains. Flat net income despite 30% revenue growth means each additional dollar of revenue is generating less profit — a classic income-statement red flag.",
 },
 ],
 },
 {
 id: "financial-statements-2",
 title: "Balance Sheet",
 description:
 "Assets, liabilities, equity, leverage ratios, goodwill, and book value",
 icon: "Scale",
 xpReward: 60,
 difficulty: "intermediate",
 duration: 10,
 steps: [
 {
 type: "teach",
 title: "The Balance Sheet Equation",
 content:
 "The **balance sheet** shows what a company owns, owes, and the residual belonging to shareholders at a specific point in time.\n\n**Assets = Liabilities + Shareholders' Equity** — this equation must always balance.\n\n**Current assets** (convertible to cash within 1 year): cash, accounts receivable, inventory\n**Non-current assets** (long-term): property/plant/equipment (PP&E), goodwill, intangible assets\n\n**Current liabilities** (due within 1 year): accounts payable, short-term debt, accrued expenses\n**Non-current liabilities**: long-term debt, deferred taxes, pension obligations\n\n**Working Capital** = Current Assets Current Liabilities. Positive working capital means the company can cover near-term obligations.\n\n**Book Value** (shareholders' equity) rarely equals market value — markets price future earnings, not historical cost.",
 bullets: [
 "Working capital is the short-term liquidity cushion; negative working capital is a warning sign",
 "Book value per share = Total Equity / Shares Outstanding — the floor in asset-heavy businesses",
 "Market-to-book ratio > 1 means the market values the company above its accounting net worth",
 ],
 },
 {
 type: "teach",
 title: "Goodwill, Intangibles, Leverage Ratios, and Treasury Stock",
 content:
 "**Goodwill** arises when a company acquires another for more than the fair value of its net assets. It sits on the balance sheet until an impairment charge is taken. Large goodwill = heavy acquisition history; watch for impairment write-downs.\n\n**Intangible assets**: patents, trademarks, customer relationships — often the most valuable yet hardest to value assets, especially in tech and pharma.\n\n**Key leverage ratios**:\n• **Debt-to-Equity (D/E)** = Total Debt / Equity — financial risk level\n• **Current Ratio** = Current Assets / Current Liabilities — short-term liquidity (>1 is generally safe)\n• **Net Debt / EBITDA** — popular with credit analysts; <2× is generally comfortable\n\n**Treasury stock** is shares repurchased by the company — recorded as a negative equity component. Large treasury stock reduces book equity and mechanically raises ROE, but does not represent economic value created.",
 bullets: [
 "Goodwill impairments are non-cash but signal overpaid acquisitions — management red flag",
 "D/E varies by industry: utilities tolerate 2–3×, tech companies typically run lean",
 "Treasury stock reduces shares outstanding and raises EPS, which can flatter earnings metrics",
 ],
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
 "Working Capital = $400M $250M = $150M. Current Ratio = $400M / $250M = 1.6×. A ratio above 1.0 confirms the company can cover its short-term obligations with liquid assets.",
 },
 {
 type: "quiz-tf",
 statement:
 "Goodwill on the balance sheet represents cash available for the company to spend on operations.",
 correct: false,
 explanation:
 "Goodwill is an intangible asset representing the premium paid in acquisitions over fair net asset value — it is not cash and cannot be spent. If the acquired business underperforms, goodwill can be impaired to zero, triggering a large non-cash write-down on the income statement.",
 },
 {
 type: "quiz-mc",
 question:
 "RetailCo has total debt of $800M and shareholders' equity of $200M against an industry average D/E of 1.5×. How should an analyst assess this?",
 options: [
 "D/E of 4.0× is significantly above the 1.5× industry average, indicating elevated default risk",
 "D/E of 0.25× means the company is conservatively financed",
 "D/E of 1.6× is roughly in line with the industry average",
 "D/E cannot be assessed without knowing total assets",
 ],
 correctIndex: 0,
 explanation:
 "D/E = $800M / $200M = 4.0×, nearly three times the 1.5× industry norm. High leverage amplifies gains in good times but accelerates losses in downturns — particularly dangerous in cyclical industries where earnings can fall sharply.",
 },
 ],
 },
 {
 id: "financial-statements-3",
 title: "Cash Flow Statement",
 description:
 "OCF vs net income, FCF calculation, indirect method, and why profitable companies fail",
 icon: "Banknote",
 xpReward: 65,
 difficulty: "intermediate",
 duration: 12,
 steps: [
 {
 type: "teach",
 title: "Three Sections and Free Cash Flow",
 content:
 "The **cash flow statement** tracks actual cash movements — unlike the income statement which uses accrual accounting. It has three sections:\n\n**1. Operating Activities (OCF)** — cash generated from core business\n**2. Investing Activities (CFI)** — capital expenditures, acquisitions, asset sales\n**3. Financing Activities (CFF)** — debt issuance/repayment, dividends, share buybacks\n\n**Free Cash Flow (FCF) = OCF Capital Expenditures**\n\nFCF is the cash left after maintaining and growing the business. It funds dividends, buybacks, debt paydown, and acquisitions.\n\n**Cash Conversion Cycle (CCC)** = Days Inventory Outstanding + Days Sales Outstanding Days Payable Outstanding. A shorter CCC means cash is recycled through the business faster, requiring less working capital financing.",
 bullets: [
 "Net positive OCF is the primary sign of a self-funding business",
 "FCF yield = FCF / Market Cap — a valuation metric comparable to earnings yield",
 "CCC < 0 (like Amazon or Costco) means suppliers fund the business — a structural advantage",
 ],
 },
 {
 type: "teach",
 title: "Indirect Method: Reconciling Net Income to OCF",
 content:
 "The **indirect method** starts with net income and reconciles to operating cash flow by adjusting for non-cash items and working capital changes:\n\n**Net Income**\n+ Depreciation & Amortization (non-cash charge, added back)\n+ Stock-based compensation (non-cash)\n Increase in Accounts Receivable (revenue earned but not collected)\n Increase in Inventory (cash spent stocking shelves)\n+ Increase in Accounts Payable (bills owed but not yet paid)\n= **Operating Cash Flow**\n\n**Why profitable companies run out of cash**: A fast-growing company may recognize revenue from credit sales (boosting net income) while cash remains uncollected in accounts receivable. If inventory and receivables grow faster than payables, OCF can turn negative even with soaring net income — a cash trap that has killed many high-growth businesses.",
 bullets: [
 "D&A is added back because it reduces net income but requires no cash outflow",
 "Rising AR is a use of cash — customers owe money but haven't paid yet",
 "Rising AP is a source of cash — you owe suppliers but haven't paid yet",
 ],
 },
 {
 type: "teach",
 title: "Quality of Earnings Analysis",
 content:
 "**High-quality earnings**: Net income tracks OCF closely. Cash conversion is strong and consistent.\n**Low-quality earnings**: A persistent, growing gap between net income and OCF suggests aggressive accrual accounting or working capital deterioration.\n\n**Red flags in cash flows**:\n• Net income rising but OCF declining year after year\n• Negative FCF in a mature, supposedly stable business\n• Heavy reliance on asset sales to generate cash in investing activities\n• CFI consistently positive for a growth company (may signal underinvestment)\n• Financing activities masking operational weakness (borrowing to pay dividends)\n\n**Rule of thumb**: OCF / Net Income consistently > 0.9 over a business cycle = high earnings quality. Ratios well below 1.0 warrant investigation.",
 bullets: [
 "The Beneish M-Score formalizes accrual-based fraud detection into a quantitative model",
 "Persistent CapEx < Depreciation signals underinvestment — asset base is being consumed",
 "Growing companies with negative FCF are not automatically bad, but the path to FCF must be clear",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A company reports Operating Cash Flow of $200M and Capital Expenditures of $75M. What is its Free Cash Flow?",
 options: [
 "$125M — OCF minus CapEx",
 "$275M — OCF plus CapEx",
 "$200M — OCF alone equals FCF",
 "$75M — CapEx alone",
 ],
 correctIndex: 0,
 explanation:
 "FCF = OCF CapEx = $200M $75M = $125M. This is the cash available after the company maintains its asset base, available for dividends, buybacks, debt repayment, or acquisitions.",
 },
 {
 type: "quiz-tf",
 statement:
 "A company reporting positive net income and negative operating cash flow for three consecutive years is a high-quality earnings situation.",
 correct: false,
 explanation:
 "Persistently positive net income alongside negative OCF is a major red flag. It suggests earnings are being inflated through aggressive accrual accounting — recognizing revenue before cash is collected or understating liabilities. This pattern, where paper profits exist but cash never arrives, is associated with many accounting frauds.",
 },
 ],
 },
 {
 id: "financial-statements-4",
 title: "Connecting the Three Statements",
 description:
 "How the statements link together, red flags, and quality of earnings analysis",
 icon: "GitMerge",
 xpReward: 70,
 difficulty: "advanced",
 duration: 12,
 steps: [
 {
 type: "teach",
 title: "The Mechanical Links Between Statements",
 content:
 "The three financial statements form an interconnected system — a change in one ripples through the others:\n\n**Net income Retained Earnings**: Net income flows into the equity section of the balance sheet as retained earnings (less any dividends paid).\n\n**CapEx PP&E**: Capital expenditures in the investing section of the cash flow statement increase PP&E on the balance sheet. Depreciation then reduces PP&E and flows back to the income statement as an expense.\n\n**Debt issuance Cash + Liabilities**: Borrowing increases cash (asset) and long-term debt (liability) on the balance sheet simultaneously, while appearing in financing activities on the CFS.\n\n**Quick consistency check**: Opening cash + Net change in cash from CFS = Closing cash on the balance sheet. If these don't reconcile, something is wrong.",
 bullets: [
 "Retained earnings = prior retained earnings + net income dividends paid",
 "Opening PP&E + CapEx Depreciation Disposals = Closing PP&E",
 "Share buybacks reduce cash (balance sheet) and appear as negative financing cash flow",
 ],
 },
 {
 type: "teach",
 title: "Cross-Statement Red Flags and Quality of Earnings",
 content:
 "Professional analysts run cross-statement checks to detect manipulation:\n\n**Revenue-to-Receivables divergence**: Revenue grows 20% but AR grows 50% — customers aren't paying, or revenue is being pulled forward artificially (channel stuffing).\n\n**CapEx-to-Depreciation gap**: Multi-year CapEx far below depreciation signals underinvestment. Near-term FCF looks great; long-term asset base is eroding.\n\n**Inventory buildup without matching COGS growth**: Could signal future impairment (inventory written down to market value hits the income statement as a loss).\n\n**Net income vs. OCF divergence**: Sustained net income >> OCF is the classic Enron/WorldCom pattern — earnings exist on paper but cash never arrives.\n\n**Quality of earnings** summary: High quality = cash-backed, repeatable, sourced from core operations. Low quality = accrual-heavy, one-time gains, non-cash items propping up net income.",
 bullets: [
 "AR growing faster than revenue for multiple years is a top fraud signal",
 "The Beneish M-Score quantifies accrual-based earnings manipulation risk",
 "Altman Z-Score uses balance sheet and income ratios to predict bankruptcy probability",
 ],
 },
 {
 type: "teach",
 title: "Footnotes and Segment Reporting",
 content:
 "The notes to financial statements contain critical information that does not appear in the main body:\n\n**Revenue recognition policy** (Note 1): When and how revenue is booked. Aggressive policies front-load revenue; conservative ones defer it.\n\n**Segment reporting**: Large companies break results by division. A struggling core business can be masked by a growing segment. Always compare segment-level margins, not just consolidated figures.\n\n**Off-balance-sheet commitments**: Operating leases, take-or-pay contracts, contingent liabilities from lawsuits, pension obligations. These can dwarf reported debt.\n\n**Related-party transactions**: Loans to executives, sales to affiliated entities — conflicts of interest that can distort reported performance.\n\n**Going concern language**: If auditors flag doubt about a company's ability to continue as a going concern, this is a serious warning — often a precursor to bankruptcy.",
 bullets: [
 "Pension obligations can be larger than all reported long-term debt — always check",
 "Stock-based compensation details reveal dilution risk from option grants",
 "Channel stuffing often appears first as anomalous AR growth in the footnotes",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A company's Net Income is $80M. The indirect method cash flow shows: add back D&A $20M, subtract increase in Accounts Receivable $30M. What is Operating Cash Flow?",
 options: [
 "$70M — $80M + $20M D&A $30M AR increase",
 "$130M — $80M + $20M + $30M",
 "$80M — same as net income since D&A offsets AR",
 "$50M — net income minus D&A",
 ],
 correctIndex: 0,
 explanation:
 "OCF = Net Income + D&A Increase in AR = $80M + $20M $30M = $70M. D&A is added back because it is a non-cash expense. The $30M rise in AR is subtracted because cash has not yet been received for that revenue.",
 },
 {
 type: "quiz-tf",
 statement:
 "If a company's capital expenditures are consistently lower than its depreciation expense over many years, it is likely investing heavily in future growth.",
 correct: false,
 explanation:
 "CapEx below depreciation means assets are being replaced more slowly than they are wearing out — this is underinvestment, not growth. Near-term free cash flow appears inflated, but the asset base deteriorates over time, ultimately impairing future revenue-generating capacity. It is the opposite of a growth investment posture.",
 },
 {
 type: "quiz-mc",
 question:
 "FraudCo reports 30% revenue growth for three consecutive years. Accounts receivable grew 80% each year. Operating cash flow was negative every year despite positive net income. What is the most likely conclusion?",
 options: [
 "Revenue may be recognized before cash is collected — classic channel stuffing or accrual manipulation",
 "Rapid growth always causes negative OCF; this is normal and healthy",
 "An unqualified audit opinion confirms the financials are reliable",
 "Negative OCF is only concerning for mature companies, not growth companies",
 ],
 correctIndex: 0,
 explanation:
 "AR growing 80% annually while revenue grows only 30% means receivables are ballooning — a sign revenue may be booked before customers pay or even before delivery. Combined with persistently negative OCF despite positive net income over three years, this matches the pattern of aggressive or fraudulent revenue recognition. Clean audit opinions do not guarantee accurate financials — Enron received them.",
 },
 ],
 },
 ],
};
