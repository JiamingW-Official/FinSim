import type { Unit } from "./types";

export const UNIT_ACCOUNTING_EARNINGS: Unit = {
 id: "accounting-earnings",
 title: "Accounting, Earnings Quality & Forensic Analysis",
 description:
 "Master financial statement analysis, earnings quality detection, and forensic accounting techniques used by short sellers, auditors, and professional analysts to uncover manipulation and assess true business performance",
 icon: "BookOpen",
 color: "#0f766e",
 lessons: [
 // Lesson 1: Income Statement Deep Dive 
 {
 id: "accounting-earnings-1",
 title: "Income Statement Deep Dive",
 description:
 "Revenue recognition under ASC 606, non-recurring item classification, adjusted vs GAAP EPS, and building an earnings quality score",
 icon: "BarChart2",
 xpReward: 110,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Revenue Recognition — ASC 606",
 content:
 "**ASC 606** (adopted 2018) established a single five-step model for recognizing revenue across all industries:\n\n**Step 1: Identify the contract** — A valid agreement with enforceable rights and obligations. Channel stuffing often fails here — pushing inventory to distributors with right-of-return means no valid contract exists.\n\n**Step 2: Identify performance obligations** — Distinct promises to deliver goods or services. A software bundle (license + support + training) has three separate obligations that must be priced individually.\n\n**Step 3: Determine the transaction price** — Total consideration expected, including variable components like royalties, rebates, and milestone payments.\n\n**Step 4: Allocate price to obligations** — Use standalone selling prices. If a $1,200 software subscription includes $900 of software and $300 of support, revenue is split accordingly.\n\n**Step 5: Recognize when (or as) obligations are satisfied** — Point-in-time (product delivery) vs. over-time (SaaS, long-term contracts).\n\n**Why it matters for investors:**\n- Companies can legitimately accelerate or defer revenue by changing how they bundle/unbundle performance obligations\n- Long-term contract modifications create judgment calls that can shift quarters of revenue forward or backward\n- Watch the deferred revenue balance: rising deferred revenue is a bullish quality signal (cash received before recognition); falling deferred revenue signals pull-forward that will create future headwinds\n\n**Red flag:** If revenue grows faster than deferred revenue + backlog, the company may be recognizing future revenues too aggressively.",
 highlight: ["ASC 606", "performance obligations", "deferred revenue", "revenue recognition"],
 },
 {
 type: "teach",
 title: "Non-Recurring Items & Adjusted EPS",
 content:
 "Companies routinely report both GAAP and non-GAAP (adjusted) earnings. Understanding the difference — and when adjustments are legitimate vs. misleading — is critical.\n\n**Legitimate non-recurring adjustments:**\n- Restructuring charges (one-time workforce reduction)\n- Impairment write-downs of specific acquired assets\n- Acquisition-related transaction costs (legal, advisory fees)\n- Natural disaster insurance charges\n\n**Questionable or abusive adjustments:**\n- **Recurring restructuring charges**: If a company has \"one-time\" charges every single year, they are recurring operating costs by definition. IBM had restructuring charges in 24 of 26 consecutive years.\n- **Stock-based compensation (SBC) exclusion**: SBC is a real economic cost — employees work partly for equity. Excluding it overstates true earnings. For high-growth tech, SBC can represent 10–25% of revenue.\n- **Adjusted EBITDA abuse**: Some companies add back so many items that Adjusted EBITDA bears little resemblance to true cash generation. Watch for additions of \"strategic initiative costs,\" \"integration expenses,\" and \"COVID-related costs\" years after the pandemic.\n\n**Building an earnings quality score (simplified):**\n| Factor | Quality Signal | Warning Signal |\n|---|---|---|\n| GAAP vs Adjusted gap | Narrow, stable | Widening over time |\n| SBC % of revenue | Declining | Rising or >15% |\n| Non-recurring frequency | Truly irregular | Every quarter/year |\n| OCF / Net Income | > 1.0x | < 0.8x |\n| Revenue growth vs. AR growth | AR grows slower | AR grows much faster |\n\n**Rule of thumb:** High-quality earnings show GAAP EPS Adjusted EPS, with operating cash flow consistently exceeding net income.",
 highlight: ["adjusted EPS", "GAAP", "stock-based compensation", "earnings quality", "non-recurring"],
 },
 {
 type: "quiz-mc",
 question:
 "A SaaS company reports $50M in GAAP revenue for Q3. Its deferred revenue balance fell from $30M to $18M during the quarter. What does this indicate about revenue quality?",
 options: [
 "The company consumed $12M of previously collected cash by delivering services — a positive quality signal showing prior bookings converting to revenue",
 "The company recognized $12M of future revenue early, a bearish signal suggesting weaker future quarters",
 "Deferred revenue decline always signals fraud or accounting manipulation",
 "The deferred revenue change has no impact on revenue quality assessment",
 ],
 correctIndex: 1,
 explanation:
 "A falling deferred revenue balance means the company recognized revenue that was previously collected as cash — in essence pulling future revenue into the current period. For a SaaS company, this can indicate declining new bookings (fewer new contracts = less cash being collected in advance) or aggressive recognition of existing contracts. Rising deferred revenue is the bullish signal (more cash collected ahead of delivery). Falling deferred revenue over multiple quarters is a key warning sign that future revenue growth may disappoint.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Excluding stock-based compensation from adjusted earnings is always an appropriate adjustment because SBC is a non-cash expense that does not affect a company's underlying business performance.",
 correct: false,
 explanation:
 "False. Stock-based compensation is a real economic cost — employees accept lower cash salaries in exchange for equity, which dilutes existing shareholders. While SBC is non-cash, it represents value transferred from existing shareholders to employees. Excluding it systematically overstates profitability. Warren Buffett has called the exclusion of SBC from adjusted earnings 'deceptive.' Berkshire Hathaway uses GAAP earnings as its primary measure precisely because it includes all real costs including SBC.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Acme Industrial reports $200M in revenue growing 25% YoY, with adjusted EPS of $3.00 vs GAAP EPS of $0.80. The company has taken 'restructuring charges' in each of the last seven years averaging $45M annually. Management excludes these from adjusted EPS as 'non-recurring.'",
 question: "How should an analyst interpret this situation?",
 options: [
 "The adjusted EPS of $3.00 is the appropriate measure since management is in the best position to define one-time costs",
 "The restructuring charges are effectively recurring operating costs; the $2.20 gap between adjusted and GAAP EPS is a major red flag signaling low earnings quality",
 "The $0.80 GAAP EPS understates performance since accounting rules are overly conservative",
 "Restructuring charges are always legitimate adjustments under GAAP rules",
 ],
 correctIndex: 1,
 explanation:
 "Seven consecutive years of 'one-time' restructuring charges are not one-time — they are part of normal operating costs. The $2.20/share gap between adjusted ($3.00) and GAAP ($0.80) EPS represents 73% of the adjusted figure being excluded costs that the company deems 'non-recurring.' This is a classic earnings quality red flag. A disciplined analyst would treat these charges as recurring, adjust the true earnings power down toward GAAP, and apply a valuation discount for low earnings quality.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Balance Sheet Analysis 
 {
 id: "accounting-earnings-2",
 title: "Balance Sheet Analysis",
 description:
 "Asset quality assessment, goodwill impairment risk, off-balance-sheet liabilities from operating leases, and book value manipulation techniques",
 icon: "Scale",
 xpReward: 105,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Asset Quality & Goodwill Risk",
 content:
 "The balance sheet tells you what a company owns and owes — but the quality and recoverability of those assets varies enormously.\n\n**Hard assets vs. soft assets:**\n- **High-quality assets**: Cash, short-term Treasury securities, accounts receivable from creditworthy customers, inventory in fast-moving consumer goods, real property with liquid markets\n- **Low-quality assets**: Goodwill, intangibles from acquisitions, deferred tax assets (require future profitability to realize), related-party receivables, long-dated receivables with no clear collection history\n\n**Goodwill — the acquisition premium time bomb:**\nGoodwill arises when a company pays more than book value for an acquisition. It represents the premium paid for brand, talent, customer relationships, and synergies. Under GAAP, goodwill is not amortized but must be tested annually for impairment.\n\n**Goodwill impairment triggers:**\n- Industry or macroeconomic deterioration\n- Reporting unit falls below book value\n- Sustained operating losses\n- Stock price trading below book value per share for extended periods\n\n**Key ratio: Goodwill / Total Assets**\n- < 10%: Minimal acquisition risk\n- 10–30%: Moderate; monitor acquisition integration\n- > 30%: High risk; one bad acquisition can wipe out equity\n\n**Notable impairments:** AOL Time Warner wrote off $54B of goodwill in 2002 after the dot-com bubble. Kraft Heinz took a $15B goodwill impairment in 2019 after overpaying for consumer brands.\n\n**Investor signal:** When a company's stock trades below book value, the market is effectively saying that book value is overstated — often because of goodwill that will eventually be written down.",
 highlight: ["goodwill", "impairment", "asset quality", "goodwill / total assets", "book value"],
 },
 {
 type: "teach",
 title: "Off-Balance-Sheet Liabilities & Operating Leases",
 content:
 "Before 2019 (ASC 842 adoption), operating leases were the most common off-balance-sheet liability. Companies leasing stores, aircraft, or equipment kept these obligations entirely off the balance sheet, dramatically understating true leverage.\n\n**Post-ASC 842 (current rules):**\nAll leases > 12 months must now be recognized on the balance sheet as:\n- **Right-of-use (ROU) asset**: Present value of lease payments (asset side)\n- **Lease liability**: Same present value (liability side)\n\nThis can dramatically inflate debt ratios for capital-light businesses. Retail, airline, and restaurant companies went from appearing nearly debt-free to showing massive lease liabilities overnight.\n\n**Remaining off-balance-sheet risks:**\n- **Variable interest entities (VIEs)**: Special purpose vehicles where a company controls economic outcome but may not consolidate — Enron's entire fraud structure\n- **Operating lease residual value guarantees**: If leased equipment depreciates faster than assumed, the company owes the difference\n- **Take-or-pay contracts**: Commitments to purchase minimum volumes regardless of business conditions (common in energy, chemicals)\n- **Contingent liabilities**: Legal settlements, environmental cleanup, product warranties — disclosed in footnotes but not on the face of the balance sheet\n- **Pension and OPEB obligations**: Defined benefit pension underfunding can represent billions in hidden liabilities (GM's pension liability nearly drove it bankrupt)\n\n**Analysis tip:** Always read the footnotes. Commitments and contingencies (often note 12–15 in a 10-K) can reveal liabilities that equal or exceed reported long-term debt.",
 highlight: ["operating leases", "ASC 842", "VIE", "off-balance-sheet", "contingent liabilities"],
 },
 {
 type: "quiz-mc",
 question:
 "Company X has total assets of $500M including $220M of goodwill from three acquisitions made in 2019-2021. Its stock now trades at $18/share vs. book value of $28/share. What is the most likely concern?",
 options: [
 "The stock is simply undervalued and represents a strong buying opportunity at a 35% discount to book",
 "The 44% goodwill-to-assets ratio and the stock trading below book value signal probable goodwill impairment; true equity value may be far below stated book value",
 "Goodwill is always worth full book value because it was paid to acquire real businesses",
 "The stock price below book value is irrelevant; only earnings matter for valuation",
 ],
 correctIndex: 1,
 explanation:
 "A goodwill-to-assets ratio of 44% ($220M/$500M) is extremely high. When a stock trades below book value per share, the market is signaling it does not believe book value is real — in this case, the market is likely pricing in goodwill impairment. If even a portion of the $220M goodwill is written down, equity is reduced dollar-for-dollar. An analyst should stress test: if goodwill is written down by 50% ($110M), equity falls by $110M, potentially making the stock expensive rather than cheap on an adjusted book value basis.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Under ASC 842 (effective 2019), companies must now include all operating leases longer than 12 months on their balance sheets as right-of-use assets and corresponding lease liabilities.",
 correct: true,
 explanation:
 "True. ASC 842 eliminated the old operating lease treatment that kept these obligations entirely off-balance-sheet. Now, any lease with a term greater than 12 months must be recognized as a right-of-use (ROU) asset and a corresponding lease liability measured at the present value of future lease payments. This dramatically increased reported leverage for companies in capital-light, lease-heavy industries like retail (Walmart, Target), airlines (Delta, United), and restaurants (McDonald's, Starbucks). Analysts comparing pre-2019 and post-2019 leverage ratios must adjust for this structural change.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Cash Flow Analysis 
 {
 id: "accounting-earnings-3",
 title: "Cash Flow Analysis",
 description:
 "OCF vs net income divergence signals, capex intensity and its effect on FCF, FCF yield valuation, and operating cash flow quality checks",
 icon: "TrendingUp",
 xpReward: 105,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Operating Cash Flow vs. Net Income",
 content:
 "The cash flow statement is the hardest financial statement to manipulate because cash is a fact — it either exists or it does not. The relationship between operating cash flow (OCF) and net income is one of the most powerful quality signals in all of accounting.\n\n**The OCF / Net Income ratio:**\n- **> 1.2x**: Strong quality — company is generating more cash than reported profits (conservative revenue recognition, strong working capital management)\n- **0.8–1.2x**: Normal — minor timing differences between accrual and cash\n- **< 0.8x**: Warning — accruals may be inflating reported earnings\n- **< 0.5x for multiple years**: Major red flag — systematic earnings inflation through accruals\n\n**Why OCF exceeds net income in healthy companies:**\n- Depreciation & amortization (non-cash charge that reduces net income but not cash)\n- Working capital discipline (fast collections, slow payments)\n- Deferred revenue conversion\n\n**Why net income can exceed OCF (warning signs):**\n- **Rising accounts receivable**: Revenue recognized before cash collected — possible channel stuffing or liberal credit terms\n- **Rising inventory**: Building more than selling — demand weakness or overproduction\n- **Falling accounts payable**: Paying suppliers faster than necessary — can temporarily inflate OCF in one period\n\n**Cash flow quality checklist:**\n1. Is OCF/Net Income consistently > 1.0x over 3-5 years?\n2. Is the gap widening or narrowing?\n3. Are accruals growing as a % of assets?\n4. Are there significant changes in working capital that cannot be explained by business growth?\n\n**Classic tell:** Sunbeam Corp (1997-1998) reported strong earnings growth while OCF turned deeply negative — a clear signal of earnings manipulation that preceded its fraud revelation.",
 highlight: ["OCF / Net Income", "operating cash flow", "accruals", "working capital", "cash flow quality"],
 },
 {
 type: "teach",
 title: "Free Cash Flow, Capex Intensity & FCF Yield",
 content:
 "**Free Cash Flow (FCF)** is the true measure of what a business generates after maintaining and growing its asset base:\n\n**FCF = Operating Cash Flow Capital Expenditures**\n\nFor capital-intensive businesses, capex is a crucial deduction. A company with $500M OCF and $450M capex has only $50M true FCF — far less impressive than the $500M headline figure.\n\n**Capex intensity ratio = Capex / Revenue:**\n- < 3%: Very capital-light (software, services, asset-light business models)\n- 3–8%: Moderate (consumer goods, healthcare)\n- 8–15%: Capital-intensive (industrials, auto, chemicals)\n- > 15%: Extremely capital-intensive (semiconductors, utilities, telecom)\n\n**Maintenance vs. Growth Capex (critical distinction):**\nCompanies only disclose total capex; maintenance vs. growth split is not required. Methods to estimate:\n- Compare capex to depreciation: capex depreciation = maintenance; capex >> depreciation = growth\n- Management guidance on \"maintenance capex\" (some companies disclose this)\n- Industry benchmarks for asset replacement cycles\n\n**FCF Yield = FCF per share / Stock price**\nFCF yield is the inverse of a Price/FCF multiple and shows cash return to shareholders:\n- > 8%: Potentially undervalued or value trap\n- 4–8%: Fair to attractive for quality businesses\n- < 2%: Expensive; requires strong growth expectations to justify\n- Negative: Company is burning cash; monitor carefully\n\n**Capex fraud technique:** WorldCom reclassified $3.8B of operating expenses (line costs) as capital expenditures, reducing reported expenses and boosting operating income while inflating the asset base. This inflated earnings and understated the true capex burden.",
 highlight: ["free cash flow", "FCF yield", "capex intensity", "maintenance capex", "WorldCom"],
 },
 {
 type: "quiz-mc",
 question:
 "TechCorp reports net income of $200M and operating cash flow of $85M for the year. Accounts receivable increased by $95M and inventory rose by $40M. What does this pattern suggest?",
 options: [
 "TechCorp has strong earnings quality because high net income drives future cash generation",
 "The large divergence (OCF only 42.5% of net income) combined with surging AR and inventory strongly suggests earnings are being inflated through aggressive revenue recognition or channel stuffing",
 "High AR growth always reflects healthy demand and customer confidence in TechCorp's products",
 "The data is insufficient to draw any conclusions about earnings quality",
 ],
 correctIndex: 1,
 explanation:
 "This is a textbook earnings quality red flag. OCF ($85M) is only 42.5% of net income ($200M) — well below the healthy 0.8–1.2x threshold. The $95M AR increase suggests revenue is being recognized before cash is collected (either through extended payment terms, liberal credit policies, or outright channel stuffing). The $40M inventory increase adds another concern. Together these working capital buildups explain almost the entire gap between net income and OCF. This pattern mirrors early warning signs seen before major accounting frauds.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A company's capital expenditures exceeding depreciation for multiple years is always a warning sign of accounting manipulation.",
 correct: false,
 explanation:
 "False. Capex routinely and legitimately exceeds depreciation during periods of growth investment. A company building new factories, expanding its store network, or upgrading equipment will naturally spend more on new assets than the depreciation running off old ones. This is healthy growth capex. It becomes a concern only if: (1) the company is capitalizing what should be operating expenses (the WorldCom method), (2) growth investments consistently fail to generate returns (value destruction), or (3) management claims low maintenance capex needs while assets visibly deteriorate.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Earnings Quality Signals 
 {
 id: "accounting-earnings-4",
 title: "Earnings Quality Signals",
 description:
 "Accruals ratio using balance sheet and cash flow methods, days sales in receivables index, and systematic channel stuffing detection",
 icon: "AlertTriangle",
 xpReward: 115,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Accruals Ratio — Two Methods",
 content:
 "The **accruals ratio** quantifies the gap between accounting earnings and cash flows. Large accruals indicate earnings that are not backed by cash — a core warning sign.\n\n**Balance Sheet Method (Sloan 1996):**\nAccruals (BS) = (ΔNet Operating Assets) / Average Total Assets\n\nWhere: ΔNet Operating Assets = (Total Assets Cash Securities) (Total Liabilities Debt)\n\nInterpretation:\n- High positive accruals: Earnings outpacing cash generation — quality deteriorating\n- Near zero: Earnings well supported by cash\n- Negative accruals: Cash generation exceeds reported earnings — very conservative, high quality\n\n**Cash Flow Method (Hribar & Collins 2002 — more accurate):**\nAccruals (CF) = (Net Income OCF CFI) / Average Total Assets\n\nWhere CFI = cash flow from investing (ex-acquisitions)\n\nThis method is harder to manipulate because it uses actual cash statement data.\n\n**Richard Sloan's landmark finding (1996):** Stocks in the top quintile of accruals (most accrual-heavy) underperformed by ~10% annually over subsequent years, while stocks in the bottom quintile (most cash-backed) outperformed. This \"accrual anomaly\" persists today.\n\n**Practical thresholds:**\n| Accruals Ratio | Signal |\n|---|---|\n| > 0.10 | High — significant earnings quality risk |\n| 0.05 to 0.10 | Moderate — monitor closely |\n| -0.05 to 0.05 | Low — earnings well backed by cash |\n| < -0.05 | Very low — earnings highly conservative |\n\n**Portfolio application:** Many quantitative funds run long/short strategies based on accruals — long low-accrual stocks, short high-accrual stocks.",
 highlight: ["accruals ratio", "Sloan", "balance sheet method", "cash flow method", "accrual anomaly"],
 },
 {
 type: "teach",
 title: "DSRI, Channel Stuffing & Revenue Manipulation Detection",
 content:
 "Beyond the accruals ratio, forensic analysts use specific ratios to detect particular manipulation techniques.\n\n**Days Sales in Receivables Index (DSRI):**\nDSRI = (AR_t / Revenue_t) / (AR_{t-1} / Revenue_{t-1})\n\nThis tracks whether receivables are growing faster than revenue — the signature of premature or fictitious revenue recognition.\n\n- DSRI = 1.0: No change in receivables quality\n- DSRI > 1.05: Receivables growing faster than sales — yellow flag\n- DSRI > 1.20: Major red flag — critical component in the Beneish M-Score\n- DSRI > 1.50: Extreme — likely fabricated revenue or aggressive channel stuffing\n\n**Channel Stuffing — How It Works:**\nA company pressures distributors to accept excess inventory with implicit agreements that returns are allowed. Revenue is recognized at shipment, inflating the current quarter. Red flags:\n1. Accounts receivable growing much faster than revenue\n2. Rising allowance for doubtful accounts relative to AR\n3. Distributor inventory piling up (visible through distributor earnings reports)\n4. Product returns spiking in subsequent quarters\n5. Revenue falls sharply the following quarter (pull-forward reversal)\n\n**Gross Margin Index (GMI):**\nGMI = Gross Margin_{t-1} / Gross Margin_t\n\nGMI > 1.0 signals margin compression — companies with deteriorating margins face pressure to manage earnings aggressively.\n\n**Days Inventory Outstanding (DIO) trend:**\nRising DIO (inventory sitting longer) can indicate demand weakness masked by revenue recognition tricks. Compare to industry peers — DIO 30% above the sector median deserves investigation.",
 highlight: ["DSRI", "channel stuffing", "accounts receivable", "days sales in receivables", "gross margin index"],
 },
 {
 type: "quiz-mc",
 question:
 "RetailCo's Days Sales in Receivables Index (DSRI) is 1.38 this year, and its accounts receivable balance grew 45% while revenue grew only 12%. Which conclusion is most appropriate?",
 options: [
 "RetailCo likely extended credit terms or is recognizing revenue prematurely; the 1.38 DSRI is a major red flag requiring deeper investigation",
 "The AR growth simply reflects strong future demand signals and is a bullish indicator",
 "A DSRI of 1.38 is within normal parameters and poses no concern",
 "AR growth always tracks revenue growth exactly, so the 33% gap is a data error",
 ],
 correctIndex: 0,
 explanation:
 "A DSRI of 1.38 significantly exceeds the 1.20 major red flag threshold. AR growing 45% vs. 12% revenue growth means RetailCo is either (a) extending payment terms to book questionable sales, (b) channel stuffing — pushing product to customers with implicit return rights, or (c) recording fictitious revenue. In the Beneish M-Score model, a high DSRI is one of the strongest individual predictors of earnings manipulation. A short seller would prioritize investigating the quality of these receivables — who owes them, what the aging schedule looks like, and what the historical bad debt rate has been.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A company whose net income is persistently higher than its operating cash flow over multiple years has low earnings quality, as high accruals signal earnings not backed by cash.",
 correct: true,
 explanation:
 "True. The Sloan accruals finding (1996) demonstrated that high-accrual companies — where earnings consistently exceed cash generation — significantly underperform low-accrual companies in subsequent years. When net income exceeds OCF repeatedly, the gap must be explained by increasing working capital (AR, inventory) or other non-cash items. This pattern indicates aggressive accounting assumptions that eventually reverse, causing earnings to 'catch down' to cash reality. The reversal often happens abruptly when auditors tighten standards or external audits flag the discrepancy.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 5: Forensic Accounting 
 {
 id: "accounting-earnings-5",
 title: "Forensic Accounting",
 description:
 "Beneish M-Score for manipulation detection, Piotroski F-Score for financial strength, and a comprehensive red flag checklist covering related party transactions, auditor changes, and restatements",
 icon: "Search",
 xpReward: 120,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Beneish M-Score — Manipulation Probability",
 content:
 "The **Beneish M-Score** (1999) is a statistical model that uses eight financial ratios to estimate the probability that a company has manipulated its earnings. It was developed by Professor Messod Beneish at Indiana University.\n\n**M-Score = 4.84 + 0.920(DSRI) + 0.528(GMI) + 0.404(AQI) + 0.892(SGI) + 0.115(DEPI) 0.172(SGAI) + 4.679(TATA) 0.327(LVGI)**\n\n**The 8 components:**\n| Variable | Formula | High Value Signals |\n|---|---|---|\n| DSRI | (AR/Revenue) ratio change | Receivables growing faster than sales |\n| GMI | Gross margin deterioration | Margin pressure manipulation incentive |\n| AQI | Asset quality index | Rising non-current, non-physical assets |\n| SGI | Sales growth index | Very high growth (harder to sustain legitimately) |\n| DEPI | Depreciation index | Slowing depreciation (may be understating asset aging) |\n| SGAI | SG&A index | Rising selling costs relative to sales |\n| TATA | Total accruals to assets | High accruals (non-cash earnings) |\n| LVGI | Leverage index | Rising debt levels |\n\n**Interpretation:**\n- **M-Score > 1.78**: High probability of manipulation (top of manipulation range)\n- **M-Score > 2.22**: Possible manipulation — warrants investigation\n- **M-Score < 2.22**: Non-manipulator zone\n\n**Validated accuracy:** Beneish's model correctly identified Enron as a manipulator years before its 2001 collapse when run on 1999 data. Students famously ran the model on Enron in a classroom exercise and got an M-Score of 0.76 (far above the 1.78 threshold) while Wall Street analysts still had buy ratings.",
 highlight: ["Beneish M-Score", "DSRI", "TATA", "manipulation detection", "Enron"],
 },
 {
 type: "teach",
 title: "Piotroski F-Score & Forensic Red Flags",
 content:
 "**Piotroski F-Score** (2000) is the opposite of Beneish — instead of detecting fraud, it scores financial health and improvement. It uses 9 binary signals (0 or 1 each) across three categories:\n\n**Profitability (0-4 points):**\n- ROA > 0 this year (+1)\n- OCF > 0 this year (+1)\n- ROA higher than last year (+1)\n- OCF > Net Income (cash quality signal) (+1)\n\n**Leverage, Liquidity & Source of Funds (0-3 points):**\n- Long-term debt ratio decreased (+1)\n- Current ratio improved (+1)\n- No new shares issued (+1) — dilution is negative signal\n\n**Operating Efficiency (0-2 points):**\n- Gross margin improved (+1)\n- Asset turnover ratio improved (+1)\n\n**Scoring:**\n- **8-9**: Strong financial health — historically significant outperformance\n- **5-7**: Average quality\n- **0-2**: Financial distress — historically significant underperformance\n\n**Forensic Red Flag Checklist:**\n1. **Auditor changes**: Replacing Big Four with smaller firm, especially mid-year\n2. **Restated financials**: Any restatement is serious; multiple restatements are disqualifying\n3. **Related party transactions**: Sales or loans to executives, family members, or affiliated entities\n4. **Insider selling**: Sustained heavy selling by multiple insiders simultaneously\n5. **Auditor material weakness findings**: Internal control deficiencies increase fraud risk\n6. **CFO/Controller turnover**: Especially if departing executives cite \"personal reasons\"\n7. **Rapid geographic expansion into low-transparency jurisdictions**: China VIE structures, offshore subsidiaries\n8. **Complex corporate structures**: Excessive subsidiaries, SPVs, VIEs without clear business purpose",
 highlight: ["Piotroski F-Score", "red flags", "auditor change", "restatement", "related party", "material weakness"],
 },
 {
 type: "quiz-mc",
 question:
 "A company receives a Beneish M-Score of 1.15, which is above the 1.78 manipulation threshold. The same company also recently replaced its Big Four auditor with a smaller regional firm while its CFO resigned citing 'family reasons.' How should an investor interpret this situation?",
 options: [
 "The M-Score alone is sufficient evidence of fraud and the stock should be immediately sold short",
 "Multiple red flags converging — M-Score signaling manipulation risk combined with auditor change and CFO departure — warranting immediate deep-dive due diligence before any position",
 "Auditor changes and CFO turnover are normal business events unrelated to accounting quality",
 "The M-Score of 1.15 is not statistically significant; only scores above 0 are meaningful",
 ],
 correctIndex: 1,
 explanation:
 "No single red flag definitively proves fraud, but the convergence of multiple warning signs dramatically raises the probability of a problem. An M-Score of 1.15 significantly exceeds the 1.78 threshold — this company is in the highest-risk manipulation zone. Combined with an auditor change (Big Four replaced by smaller firm often means the Big Four resigned after identifying issues) and CFO departure (the executive most responsible for financial controls leaving), this situation demands serious due diligence. A professional short seller would now dig into the 10-K footnotes, call distributor references, and search court records for legal proceedings.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A high Piotroski F-Score (8-9) indicates that a company's financials are improving across profitability, leverage, and efficiency dimensions — and historically such stocks have significantly outperformed the market.",
 correct: true,
 explanation:
 "True. Piotroski's original 2000 study found that buying high F-Score (8-9) value stocks and shorting low F-Score (0-2) value stocks generated roughly 7.5% annual abnormal returns. The F-Score works because it captures fundamental improvement — profitable, cash-generative companies with declining debt, improving margins, and stable share counts are genuine value opportunities, not value traps. The strategy is particularly effective in the small- and micro-cap universe where analyst coverage is sparse and these quality signals are less efficiently priced in.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 6: Accounting Manipulation History 
 {
 id: "accounting-earnings-6",
 title: "Accounting Manipulation History",
 description:
 "Case studies of Enron, WorldCom, and Wirecard — how mark-to-market abuse, capex fraud, and fabricated cash destroyed billions in shareholder value and what investors can learn",
 icon: "BookOpen",
 xpReward: 100,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Enron — Mark-to-Market Abuse & SPE Fraud",
 content:
 "**Enron Corporation** (1985–2001) was the most complex accounting fraud in American history to that point, destroying $74 billion in shareholder value.\n\n**The core mechanisms:**\n\n**1. Mark-to-Market (MTM) Accounting Abuse:**\nEnron successfully lobbied the SEC in 1991 to apply MTM accounting to long-term energy contracts — a method intended for liquid, exchange-traded instruments. Enron then signed multi-decade energy delivery contracts and immediately recognized the entire net present value of projected future profits as current-year revenue. When profitability deteriorated, they simply revised upward their forecasts for existing contracts without market validation.\n\nResult: Revenue was vastly overstated; losses were hidden in future years; traders could book unlimited phantom profits.\n\n**2. Special Purpose Entities (SPEs) / Variable Interest Entities:**\nEnron created hundreds of off-balance-sheet entities (LJM Cayman, Chewco, JEDI) to:\n- Transfer losing assets off Enron's balance sheet\n- Fabricate sales and profit by \"selling\" assets to related entities at inflated prices\n- Secure loans that looked like revenue or equity\n\nMany SPEs were technically controlled by Enron executives (CFO Andrew Fastow earned $30M in \"management fees\" from them) but structured to avoid consolidation.\n\n**3. The Beneish Signal:**\nEnron's M-Score using 1999 financial data was 0.76 — far above the manipulation threshold. The manipulation was detectable. Wall Street did not look.\n\n**Lessons for investors:**\n- Understand HOW a company recognizes revenue — the accounting method is as important as the number\n- Complex corporate structures (hundreds of subsidiaries) without clear business rationale are a red flag\n- When a company's cash flow consistently lags reported earnings, trust the cash\n- Never ignore short sellers making specific, documented accounting claims",
 highlight: ["Enron", "mark-to-market", "SPE", "off-balance-sheet", "Andrew Fastow", "VIE"],
 },
 {
 type: "teach",
 title: "WorldCom & Wirecard — Capex Fraud and Fabricated Cash",
 content:
 "**WorldCom (2002)** — The $11B Capex Reclassification Fraud:\n\nWorldCom, then America's second-largest long-distance telephone company, executed a deceptively simple fraud: it reclassified $3.8B of ordinary operating expenses (primarily line costs paid to other carriers for network access) as capital expenditures.\n\n**The mechanics:**\n- Line costs are operating expenses reduce current earnings\n- Capitalized as property/plant/equipment spread over 3-5 years via depreciation\n- Net effect: $3.8B operating expense becomes $600-800M annual depreciation immediate earnings inflation\n- Asset base inflated equity appears stronger\n\nInternal auditor Cynthia Cooper discovered the fraud by reconciling capital expenditure approvals to actual asset additions — no paperwork existed for $3.8B of \"assets.\"She is now a corporate governance hero.\n\n**Wirecard (2020)** — The 1.9B That Never Existed:\n\nWirecard AG, a German payment processor worth 24B at its peak, fabricated cash balances. The fraud involved:\n- Claiming 1.9B of cash was held in escrow accounts in the Philippines\n- Creating false bank statements and audit confirmations from fictitious trustee accounts\n- The cash never existed — the Philippines central bank confirmed the escrow accounts were fabricated\n\n**Why auditors (EY) missed it for years:**\n- EY relied on bank confirmations faxed or emailed from third-party trustees — which were fabricated\n- Modern audit standards require direct confirmation from banks; EY did not obtain direct confirmation\n- The fraud exploited auditor trust in document authenticity\n\n**Universal lessons:**\n1. If profits cannot be explained by cash generation — find the cash\n2. Off-shore cash held by third parties is harder to verify and a known fraud vector\n3. Auditor quality and auditor independence matter\n4. Short sellers (Zatarra Research, FT journalists) documented the fraud years before collapse — listen to them",
 highlight: ["WorldCom", "Wirecard", "capex fraud", "fabricated cash", "auditor", "Cynthia Cooper"],
 },
 {
 type: "quiz-mc",
 question:
 "WorldCom's fraud reclassified $3.8B of operating expenses as capital expenditures. What was the primary effect on reported earnings in the fraud period?",
 options: [
 "No effect — capex and operating expenses both reduce net income equally in accounting",
 "Reported earnings were artificially inflated because operating expenses reduce current-period income immediately, while capitalized expenses are spread over years as depreciation",
 "Reported earnings decreased because capital expenditures appear on the balance sheet and reduce equity",
 "The fraud only affected the balance sheet with no impact on the income statement",
 ],
 correctIndex: 1,
 explanation:
 "This is the core mechanism of WorldCom's fraud. Operating expenses (like line costs) flow directly to the income statement in the current period, reducing net income dollar-for-dollar. Capital expenditures, however, are capitalized on the balance sheet and depreciated over their useful life — for network infrastructure, typically 3-5 years. By converting $3.8B of operating expenses to capex, WorldCom converted $3.8B of current-year losses into only ~$700-800M of annual depreciation, boosting reported earnings by roughly $3B+ in the fraud period. This is why capex patterns deserve scrutiny — unusually high capex with weak business justification can signal expense reclassification.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An analyst is reviewing a fintech company's annual report. The company reports $2.1B in cash, of which $1.8B is held by 'third-party trust accounts' in Singapore managed by an affiliated subsidiary. The independent auditor confirmed these balances via email confirmation from the trustee — not through direct bank statement verification. The company's operating cash flow has been negative for three consecutive years despite reporting strong net income.",
 question: "What should the analyst conclude?",
 options: [
 "The cash is fully real since an independent auditor confirmed it and the auditor's professional reputation is on the line",
 "Multiple Wirecard-pattern red flags are present — third-party held cash, affiliate relationships, email-only confirmation without direct bank verification, and OCF/net income divergence — warranting immediate forensic-level scrutiny",
 "Negative operating cash flow combined with positive net income is normal for growth-stage fintech companies",
 "Third-party cash custodians are standard practice and carry no additional verification burden",
 ],
 correctIndex: 1,
 explanation:
 "This scenario is nearly a blueprint of the Wirecard fraud. The Wirecard red flags are all present: (1) large cash balances held offshore by affiliated third parties rather than directly at banks, (2) auditor reliance on email/document confirmation rather than direct bank verification, (3) chronic operating cash flow negative despite reported net income (the primary signal that earnings are not real). A forensic analyst would demand direct bank confirmation from the Singapore banks themselves, reconcile the cash to actual bank statements, and investigate the ownership structure of the trustee entities. The OCF/net income gap alone would trigger the Beneish M-Score analysis and accruals ratio calculation.",
 difficulty: 3,
 },
 ],
 },
 ],
};
