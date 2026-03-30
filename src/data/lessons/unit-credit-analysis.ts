import type { Unit } from "./types";

export const UNIT_CREDIT_ANALYSIS: Unit = {
 id: "credit-analysis",
 title: "Credit Analysis",
 description:
 "Master corporate credit analysis, bond markets, default analysis, securitization, and credit portfolio management",
 icon: "CreditCard",
 color: "#dc2626",
 lessons: [
 // Lesson 1: Credit Analysis Fundamentals 
 {
 id: "ca-1",
 title: "Credit Analysis Fundamentals",
 description:
 "The 5 Cs of credit, financial ratio analysis, and qualitative factors in assessing default risk",
 icon: "Search",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The 5 Cs of Credit",
 content:
 "Credit analysts ask one primary question: **Will this borrower pay?** The **5 Cs of Credit** provide a systematic framework for answering it.\n\n**1. Character** — Management track record and willingness to repay.\n- Have executives honored obligations through prior downturns?\n- Insider ownership (skin in the game) signals alignment with creditors.\n- History of accounting restatements or governance failures is a red flag.\n\n**2. Capacity** — Cash flow generation to service debt.\n- The single most important C. Can EBITDA cover interest payments?\n- Assess through EBITDA leverage (Debt/EBITDA) and interest coverage (EBITDA/Interest).\n\n**3. Capital** — Equity cushion absorbing losses before creditors are impaired.\n- Higher equity/assets ratio = greater buffer for creditors.\n- Companies with thin equity are closer to insolvency under stress.\n\n**4. Conditions** — Industry and macroeconomic environment.\n- Cyclical industries (airlines, energy) have volatile cash flows; add credit risk.\n- Rising rates increase interest burden on floating-rate debt.\n- Recession reduces revenues and compresses margins simultaneously.\n\n**5. Collateral** — Assets available to secure and backstop debt.\n- Tangible assets (property, equipment, receivables) provide recovery in default.\n- Unsecured lenders to asset-light companies (software, services) rely entirely on cash flow.",
 highlight: ["5 Cs of Credit", "Character", "Capacity", "Capital", "Conditions", "Collateral", "EBITDA"],
 },
 {
 type: "teach",
 title: "Financial Ratio Analysis for Credit",
 content:
 "Credit analysts rely on a core set of ratios to quantify default risk across the 5 Cs:\n\n**Leverage (Debt/EBITDA):**\n- The most widely cited credit metric.\n- Investment Grade (IG): typically < 2–3×\n- High Yield (HY): typically 3–5×\n- Distressed territory: > 6×\n- Example: $500M debt / $100M EBITDA = 5.0× — solidly HY.\n\n**Interest Coverage (EBITDA / Interest Expense):**\n- How many times can operating earnings cover interest?\n- IG floor: generally > 3×\n- Below 1.5× signals potential distress; below 1× is negative carry.\n\n**Free Cash Flow Yield (FCF / Total Debt):**\n- Measures ability to reduce debt organically over time.\n- > 10% is healthy for HY issuers; < 5% raises refinancing risk.\n\n**Liquidity Metrics:**\n- Current ratio (current assets / current liabilities): > 1× minimum.\n- Quick ratio ((cash + receivables) / current liabilities): stress-tests short-term coverage.\n\n**Debt Maturity Profile:**\n- Cluster of maturities in 1–2 years creates refinancing cliff risk.\n- Smooth maturity schedule reduces rollover vulnerability.\n- Analysts build a \"debt maturity wall\" chart to identify near-term stress points.",
 highlight: ["Debt/EBITDA", "interest coverage", "FCF yield", "current ratio", "quick ratio", "maturity wall", "leverage"],
 },
 {
 type: "teach",
 title: "Qualitative Factors in Credit Assessment",
 content:
 "Numbers tell part of the story — qualitative factors explain **why** the numbers look the way they do and whether they'll persist.\n\n**Business Model Durability:**\n- **Subscription/recurring revenue** (SaaS, utilities): highly predictable cash flows favorable for credit.\n- **Cyclical industries** (steel, shipping, mining): boom-bust revenue cycles higher leverage tolerance needed in downturns.\n- **Commodity exposure**: raw material cost volatility compresses margins unpredictably.\n\n**Competitive Moat:**\n- Pricing power protects margins under cost pressure.\n- High switching costs, network effects, or regulatory barriers reduce competitive threat.\n- Commodity-like businesses with no pricing power face margin compression when revenues decline.\n\n**Management Quality:**\n- Track record through prior credit cycles: did management prioritize debt reduction or pursue acquisitions at cycle peaks?\n- Skin in the game: significant insider equity ownership aligns management with creditor interests.\n- Capital allocation discipline: excessive dividends or buybacks while leveraged is a warning sign.\n\n**Accounting Aggressiveness:**\n- Frequent non-GAAP adjustments inflating \"adjusted EBITDA\" obscure true cash earnings.\n- Revenue recognition acceleration, capitalized costs that peers expense, or one-time charges that recur every year are red flags.\n\n**Covenant Quality:**\n- Maintenance covenants (tested quarterly) provide early-warning triggers and negotiating leverage.\n- Covenant-lite (cov-lite) loans offer fewer protections — borrowers can deteriorate significantly before creditors have rights.",
 highlight: ["business model durability", "competitive moat", "management quality", "accounting aggressiveness", "covenant", "covenant-lite", "recurring revenue"],
 },
 {
 type: "quiz-mc",
 question:
 "A company has $800M in total debt and generates $200M in EBITDA. Which best describes its credit profile?",
 options: [
 "4.0× leverage — consistent with high-yield territory (typically 3–6× for HY issuers)",
 "4.0× leverage — solidly investment grade (IG is typically below 1×)",
 "0.25× leverage — indicating very low debt relative to earnings",
 "Cannot be determined without knowing the interest rate",
 ],
 correctIndex: 0,
 explanation:
 "Debt/EBITDA = $800M / $200M = 4.0×. Investment-grade issuers typically maintain leverage below 2–3×, while high-yield issuers commonly range from 3–6×. At 4.0×, this issuer falls comfortably in HY territory. IG benchmarks require meaningfully lower leverage ratios to demonstrate strong debt serviceability.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A higher interest coverage ratio (EBITDA divided by interest expense) indicates lower credit risk.",
 correct: true,
 explanation:
 "True. Interest coverage measures how many times operating earnings can cover interest payments. A ratio of 5× means the company earns five times what it owes in interest — providing a substantial buffer before distress. Investment-grade issuers typically maintain coverage above 3×. Coverage below 1.5× signals that even modest earnings deterioration could threaten debt serviceability.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A credit analyst is evaluating a mid-size restaurant chain. Key metrics: Debt/EBITDA = 3.8×, Interest Coverage = 2.5×, FCF/Debt = 7%, Current Ratio = 0.9×. The business operates 400 corporate-owned locations with long-term leases and no tangible collateral. Revenues are economically sensitive.",
 question:
 "What credit rating category best fits this issuer?",
 options: [
 "High Yield (BB range) — leverage and coverage are in HY territory, limited collateral, cyclical exposure",
 "Investment Grade (A range) — coverage above 2× and positive FCF qualify it",
 "AAA — strong franchise and FCF yield above 5% signal minimal default risk",
 "Investment Grade (BBB) — leverage below 5× is automatically BBB-qualifying",
 ],
 correctIndex: 0,
 explanation:
 "Multiple factors point to high-yield status: 3.8× Debt/EBITDA exceeds typical IG thresholds (< 2–3×), interest coverage of 2.5× is below the IG floor of ~3×, current ratio below 1× signals liquidity tightness, and the cyclical restaurant sector with lease-heavy balance sheets (no hard collateral) further pressures the rating. BB-range is consistent with these metrics.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Corporate Bond Markets 
 {
 id: "ca-2",
 title: "Corporate Bond Markets",
 description:
 "Investment grade vs high yield, OTC mechanics, new issuance, and credit spread measures",
 icon: "Building2",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Investment Grade vs High Yield: The Rating Cliff",
 content:
 "Corporate bonds are divided into two universes by credit rating — a divide with massive practical consequences for pricing, investor base, and liquidity.\n\n**Investment Grade (IG): BBB–/Baa3 and above**\n- S&P/Fitch: AAA, AA, A, BBB (with +/– modifiers)\n- Moody's: Aaa, Aa, A, Baa\n- Annual default rates: < 0.1% for AAA, ~0.3% for BBB\n- Investors: pension funds, insurance companies, central banks, investment-grade bond funds\n- Typical spreads: 50–250 basis points over Treasuries\n\n**High Yield (HY): BB+/Ba1 and below**\n- S&P/Fitch: BB, B, CCC, CC, C, D\n- Moody's: Ba, B, Caa, Ca, C\n- Annual default rates: 1–2% for BB, 4–6% for B, 12%+ for CCC\n- Investors: hedge funds, HY mutual funds, CLOs, distressed funds\n- Typical spreads: 300–800+ basis points over Treasuries\n\n**Fallen Angels** (IG downgraded to HY):\n- IG-only mandated funds are **forced sellers** when a bond crosses below BBB–.\n- Forced selling creates temporary price dislocations — HY funds often buy opportunistically.\n- Historical fact: fallen angels have outperformed broad HY on average post-downgrade.\n\n**Rising Stars** (HY upgraded to IG):\n- New IG-mandate buying demand flows into the bond price appreciation.\n- HY holders benefit from spread compression as upgrade approaches.\n- Identifying rising stars before the upgrade is a high-return credit strategy.",
 highlight: ["investment grade", "high yield", "BBB", "BB", "fallen angel", "rising star", "IG-only mandate", "forced selling"],
 },
 {
 type: "teach",
 title: "Bond Market Mechanics",
 content:
 "Unlike equities, corporate bonds trade in the **over-the-counter (OTC)** market — a dealer-intermediated, quote-driven market with unique mechanics.\n\n**OTC Dealer Market:**\n- No central exchange. Trades execute between buyers, sellers, and dealer banks (Goldman, JPMorgan, Citi, etc.).\n- Dealers provide liquidity by holding inventory (taking bonds onto their balance sheet).\n- Post-2008 Basel III rules reduced dealer inventory capacity HY liquidity is structurally thinner.\n\n**TRACE Reporting:**\n- FINRA's Trade Reporting and Compliance Engine requires same-day public reporting of corporate bond trades.\n- Provides post-trade price transparency. Institutional investors can see recent transaction prices.\n\n**Bid-Ask Spreads:**\n- IG bonds: 0.10–0.50 pts ($1–$5 per $1,000 par) in normal markets.\n- HY bonds: 0.50–2.0+ pts ($5–$20 per $1,000) — wider due to lower liquidity and higher volatility.\n- CCC/distressed: spreads can exceed 5 pts — trading at a substantial transaction cost.\n\n**New Issue Process:**\n1. **Roadshow**: Issuer and banks meet institutional investors to gauge demand and refine pricing.\n2. **Book-building**: Orders collected at various spread levels. Books can be 3–10× oversubscribed for quality IG issuers.\n3. **Pricing**: Final spread set based on demand. New Issue Premium (NIP) of 5–25bp is standard — compensation for switching out of existing bonds.\n4. **Settlement**: T+3 for most corporate bonds.\n5. **Secondary trading**: Bonds move from primary allocation to secondary market immediately.",
 highlight: ["OTC market", "dealer", "TRACE", "bid-ask spread", "roadshow", "book-building", "new issue premium", "settlement"],
 },
 {
 type: "teach",
 title: "Credit Spreads: OAS, Z-Spread, and Spread Drivers",
 content:
 "Credit spreads measure the excess yield a corporate bond offers above a risk-free benchmark. Different spread measures serve different analytical purposes.\n\n**G-Spread (Government Spread):**\nYield difference vs. the nearest on-the-run Treasury of similar maturity.\nSimple and commonly quoted, but uses only a single point on the Treasury curve.\n\n**Z-Spread (Zero-Volatility Spread):**\nConstant spread added to every point on the Treasury spot rate curve that equates PV of all cash flows to market price.\nMore rigorous than G-spread — accounts for the full shape of the yield curve.\n\n**OAS (Option-Adjusted Spread):**\nZ-spread minus the value of embedded options (calls, puts, make-whole provisions).\n**OAS is the purest measure of credit compensation** — isolates the true credit/liquidity premium.\n- For a callable bond: OAS < Z-spread (call option benefits the issuer, hurts the bondholder)\n- For a non-callable bond: OAS Z-spread\n\n**What drives credit spreads?**\n- **Default risk**: Higher leverage, lower coverage wider spreads.\n- **Liquidity risk**: Smaller issue sizes, less traded wider spreads.\n- **Market risk appetite**: In risk-off environments (VIX spikes, recessions), spreads widen sharply as investors demand more compensation.\n- **Spread compression in risk-on**: Credit rallies when the economy improves — investors stretch for yield tighter spreads.\n\n**Historical context:** IG spreads averaged ~100bp over 2010–2019, HY averaged ~450bp. During COVID-19 (March 2020), IG briefly hit 370bp and HY hit 1,100bp before Fed intervention.",
 highlight: ["OAS", "Z-spread", "G-spread", "option-adjusted spread", "credit spread", "risk-off", "spread compression", "liquidity premium"],
 },
 {
 type: "quiz-mc",
 question:
 "What is the primary difference between OAS (Option-Adjusted Spread) and Z-spread?",
 options: [
 "OAS removes the value of embedded options (like call provisions), giving a purer credit spread; Z-spread does not adjust for options",
 "Z-spread uses the Treasury spot rate curve while OAS uses only a single Treasury yield",
 "OAS applies only to investment-grade bonds; Z-spread applies to all bonds",
 "Z-spread adjusts for liquidity; OAS adjusts for duration",
 ],
 correctIndex: 0,
 explanation:
 "OAS (Option-Adjusted Spread) starts with the Z-spread and subtracts the value of embedded options — most commonly call options that allow the issuer to redeem the bond early. This strips out the option component and reveals the pure credit/liquidity compensation. Z-spread makes no such adjustment, so for callable bonds it overstates the credit spread because part of the spread compensates the investor for the call risk.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Fallen angels — bonds downgraded from investment grade to high yield — often represent attractive buying opportunities for high-yield investors in the period shortly after the downgrade.",
 correct: true,
 explanation:
 "True. When a bond falls from BBB– to BB+, investment-grade mandated funds are forced sellers regardless of valuation. This technical selling pressure drives prices below fundamental value. High-yield funds, which can hold these bonds, often find the resulting spread levels exceed compensation warranted by the credit fundamentals. Historically, fallen angels have outperformed the broader high-yield index on average following their downgrade.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A BB-rated issuer prices a new 7-year bond at T+325bp (325 basis points over the 7-year Treasury). The comparable existing bond of the same issuer trades in the secondary market at T+305bp. The deal is 4× oversubscribed.",
 question:
 "What does the 20bp difference between the new issue price and the secondary spread represent, and what does the oversubscription indicate?",
 options: [
 "The 20bp is the new issue premium (NIP) — incentive for investors to switch; 4× oversubscription signals strong demand and the NIP may have been generous",
 "The 20bp is a penalty for the issuer's weak credit — 4× oversubscription means investors are worried about default",
 "The 20bp reflects the bid-ask spread in OTC trading; oversubscription means the bond was overpriced",
 "The 20bp is the OAS adjustment for the embedded call option; 4× oversubscription means the call is in-the-money",
 ],
 correctIndex: 0,
 explanation:
 "New issues typically price at a premium to secondary market levels to incentivize investors to sell existing holdings and buy the new bond — this concession is the New Issue Premium (NIP), here 20bp. A 4× oversubscription signals demand far exceeded supply, meaning the NIP may have been generous (the deal could have priced tighter). In a hot market, strong oversubscription often leads to spread tightening in secondary trading shortly after pricing.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Default & Recovery 
 {
 id: "ca-3",
 title: "Default & Recovery Analysis",
 description:
 "Default probability cycles, capital structure waterfall, recovery rates, and distressed investing",
 icon: "AlertTriangle",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Default Probability and Credit Cycles",
 content:
 "Default rates are not static — they are highly cyclical and track the broader economic environment.\n\n**Historical Annual Default Rates by Rating:**\n| Rating | Annual Default Rate |\n|---|---|\n| AAA | 0.00–0.04% |\n| AA | 0.02–0.06% |\n| A | 0.05–0.10% |\n| BBB | 0.15–0.30% |\n| BB | 0.50–1.5% |\n| B | 2.0–5.0% |\n| CCC/C | 8.0–15%+ |\n\n**The Credit Cycle:**\nDefault rates compress in expansion phases as easy credit extends maturities and refinancing options abound. They spike in recessions:\n- 2001 (Dot-com bust): HY default rate reached ~10%\n- 2009 (GFC): HY default rate peaked at ~14%\n- 2020 (COVID): Brief spike to ~8% before Fed intervention\n\n**The Distressed Ratio as Leading Indicator:**\nThe distressed ratio = % of HY bonds trading at spreads > 1,000bp over Treasuries.\n- Rising distressed ratio signals deteriorating credit conditions before rating agencies act.\n- Typically leads actual defaults by 6–12 months.\n- Peaked at ~25% in early 2009 before the default wave crested.\n\n**Point-in-Cycle Positioning:**\nCredit investors adjust quality tilt based on cycle phase:\n- **Late cycle**: Reduce CCC/B exposure, increase BB/BBB quality\n- **Recession/trough**: Add distressed exposure; defaults peak but recovery prices are lowest\n- **Early recovery**: Aggressively add HY as defaults decline and spreads tighten",
 highlight: ["default rate", "credit cycle", "distressed ratio", "high yield", "CCC", "recession", "late cycle"],
 },
 {
 type: "teach",
 title: "Recovery Rates and Capital Structure Waterfall",
 content:
 "When a company defaults, creditors receive a recovery — a fraction of face value determined by asset values and their position in the capital structure.\n\n**Capital Structure Priority (Waterfall):**\n1. **Secured First Lien** (bank loans, first lien bonds): First claim on specific collateral.\n Typical recovery: 65–80%\n2. **Secured Second Lien**: Second claim on same collateral.\n Typical recovery: 30–55%\n3. **Senior Unsecured Bonds**: General creditor claim on unencumbered assets.\n Typical recovery: 35–45%\n4. **Subordinated/Junior Bonds**: Paid only after senior unsecured are made whole.\n Typical recovery: 15–25%\n5. **Preferred Equity**: Above common equity, below all debt.\n Typical recovery: 0–20%\n6. **Common Equity**: Residual claim — typically receives zero in default.\n\n**Loss Given Default (LGD):**\nLGD = 1 – Recovery Rate\n\nIf senior unsecured recovery = 40%:\nLGD = 1 – 0.40 = **60%**\n\n**Expected Loss:**\nExpected Loss = Probability of Default (PD) × LGD\n\nExample: BB bond, PD = 2%, Recovery = 50%:\nExpected Loss = 2% × 50% = **1.0% per year**\n\n**Recovery varies by:**\n- Asset intensity: Hard assets higher recovery; intangible-heavy businesses lower.\n- Industry: Utilities and energy (tangible assets) recover well; retail and services recover poorly.\n- Capital structure complexity: More layers of debt dilutes recoveries for each layer.",
 highlight: ["capital structure waterfall", "recovery rate", "secured first lien", "senior unsecured", "subordinated", "LGD", "loss given default", "expected loss"],
 },
 {
 type: "teach",
 title: "Bankruptcy Processes and Distressed Investing",
 content:
 "When a company cannot service its debt, it faces a formal or informal restructuring. Understanding the process is essential for distressed investors.\n\n**Chapter 11 (Reorganization) — U.S. Bankruptcy Code:**\n- Company continues operating as a **debtor-in-possession (DIP)**.\n- **Automatic stay**: All creditor collection actions are halted upon filing.\n- **DIP financing**: New senior secured credit extended to fund operations during restructuring — paid first ahead of pre-petition creditors.\n- **Plan of Reorganization (POR)**: Negotiated agreement on how to distribute value to creditors; requires approval by classes of creditors and the court.\n- Typical timeline: 6–24 months.\n- Outcome: Company emerges with a cleaner balance sheet; equity holders usually wiped out.\n\n**Chapter 7 (Liquidation):**\n- Company ceases operations and all assets are sold.\n- Proceeds distributed strictly per waterfall priority.\n- Typically recovers less than Chapter 11 (going-concern value lost).\n\n**Pre-Packaged Bankruptcy:**\n- Company negotiates the POR with major creditors **before** filing.\n- Much faster (1–3 months) and less disruptive to operations.\n- Requires pre-negotiated agreement from required majority of creditors.\n\n**Out-of-Court Restructuring:**\n- Avoid bankruptcy entirely via consent solicitation (amend bond covenants) or exchange offer (swap old bonds for new terms).\n- Faster, cheaper, preserves brand value.\n- Requires near-unanimous agreement — a single holdout can block and sue.\n\n**Distressed Investing:**\n- Buying bonds of stressed/defaulted companies at deep discounts.\n- Loan-to-own: Acquire debt with the intent to convert to equity in restructuring.\n- Event-driven alpha: Catalyst is court approval of POR, emergence from bankruptcy, or asset sale.",
 highlight: ["Chapter 11", "Chapter 7", "debtor-in-possession", "DIP financing", "automatic stay", "plan of reorganization", "pre-packaged", "distressed investing", "loan-to-own"],
 },
 {
 type: "quiz-mc",
 question:
 "A company with $200M in debt defaults. The probability of default was 5% and the recovery rate is 40%. What is the expected loss on this debt position?",
 options: [
 "3% — Expected Loss = PD (5%) × LGD (60%) = 3%",
 "5% — Expected Loss equals the probability of default",
 "2% — Expected Loss = PD (5%) × Recovery Rate (40%) = 2%",
 "60% — Expected Loss equals the LGD directly",
 ],
 correctIndex: 0,
 explanation:
 "Expected Loss = Probability of Default × Loss Given Default. LGD = 1 – Recovery Rate = 1 – 0.40 = 60%. Therefore: EL = 5% × 60% = 3%. This 3% annual expected loss should be compared to the credit spread the bond offers — if the spread exceeds 3%, the investor is compensated for expected credit losses. The 40% recovery rate reduces (but does not eliminate) the loss when default occurs.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "In a corporate bankruptcy liquidation, secured creditors are paid before senior unsecured bondholders, who are paid before equity holders.",
 correct: true,
 explanation:
 "True. The absolute priority rule governs the capital structure waterfall: secured creditors (first lien, then second lien) receive proceeds first, up to the value of their collateral. Senior unsecured creditors are next, followed by subordinated creditors, preferred equity, and finally common equity holders. In practice, common equity holders almost always receive zero in liquidations, and even senior unsecured creditors may receive less than 100 cents on the dollar depending on asset values.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An analyst is evaluating a distressed bond: a senior unsecured bond of a retailer trading at 45 cents on the dollar ($450 per $1,000 par). The company has $2B in total debt: $800M first lien term loan, $500M second lien bonds, $700M senior unsecured bonds (including this one). The analyst estimates enterprise value in reorganization at $1.2B.",
 question:
 "Based on the capital structure waterfall, what is the estimated recovery value for the senior unsecured bonds?",
 options: [
 "~$0 — after paying $800M first lien and $500M second lien ($1.3B total), the $1.2B enterprise value is fully consumed",
 "~$100/bond — the unsecured bonds receive the residual after senior claims",
 "~$450/bond — the market price reflects fair value given the reorganization",
 "~$1,000/bond — unsecured bonds always recover par in Chapter 11",
 ],
 correctIndex: 0,
 explanation:
 "Applying the waterfall: First lien ($800M) is paid in full from the $1.2B enterprise value, leaving $400M. Second lien ($500M) is paid next — but only $400M remains, so second lien recovers 80 cents ($400M / $500M). Senior unsecured bonds receive nothing because the $1.2B enterprise value was fully consumed by the $1.3B of secured claims. The bond trading at 45 cents suggests the market expects either a higher enterprise value, litigation, or a negotiated settlement above pure waterfall outcomes.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Securitization & Structured Credit 
 {
 id: "ca-4",
 title: "Securitization & Structured Credit",
 description:
 "ABS, MBS, CMOs, and CLOs — how pooled assets are tranched into structured securities",
 icon: "Layers",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Asset-Backed Securities (ABS): Turning Loans into Bonds",
 content:
 "**Securitization** converts illiquid loans into tradeable bonds by pooling them and issuing multiple classes of securities backed by the pool's cash flows.\n\n**Common ABS collateral types:**\n- Auto loans (largest ABS sector)\n- Credit card receivables\n- Student loans\n- Equipment leases\n- Personal loans\n\n**The Basic Securitization Structure:**\n1. **Originator** (bank, auto finance company) makes loans to borrowers.\n2. Loans are sold to a **Special Purpose Vehicle (SPV)** — a legally separate entity that isolates assets from the originator's balance sheet and any future bankruptcy.\n3. SPV issues multiple **tranches** of bonds to investors, backed by the loan pool cash flows.\n4. Tranches are structured senior (AAA) to junior (BB/equity) — senior gets paid first, junior absorbs losses first.\n\n**Key Risk Concepts:**\n- **Prepayment risk**: Borrowers pay off loans early when rates fall, truncating expected cash flows.\n- **Extension risk**: When rates rise, prepayments slow — investors hold the bond longer than expected.\n- **WAL (Weighted Average Life)**: Expected average time until each dollar of principal is returned; shorter than stated maturity due to prepayments.\n\n**Credit enhancement:**\n- Overcollateralization (pool value > bond face value)\n- Reserve accounts (cash buffer)\n- Senior/subordinate structure (junior absorbs first losses)\n- Excess spread (interest income above bond coupon payments)",
 highlight: ["ABS", "securitization", "SPV", "tranches", "prepayment risk", "extension risk", "WAL", "credit enhancement", "special purpose vehicle"],
 },
 {
 type: "teach",
 title: "MBS, CMOs, and Mortgage Convexity",
 content:
 "**Mortgage-Backed Securities (MBS)** are the largest securitization market, backed by residential or commercial mortgages.\n\n**Agency MBS (Fannie Mae, Freddie Mac, Ginnie Mae):**\n- Guaranteed against default by government-sponsored enterprises or the U.S. government.\n- No credit risk — only prepayment/interest rate risk.\n- Most liquid fixed income market after Treasuries; daily trading volume > $200B.\n\n**Non-Agency MBS:**\n- No government guarantee — full credit risk exposure.\n- Includes jumbo mortgages (above conforming loan limits), subprime, Alt-A.\n- 2008 financial crisis: non-agency subprime MBS suffered catastrophic losses.\n\n**CMBS (Commercial MBS):**\n- Backed by commercial real estate loans (office, retail, hotel, multifamily).\n- No prepayment risk (commercial loans have lockout/defeasance provisions).\n- Major risk: tenant default property income shortfall CMBS losses.\n\n**CMOs (Collateralized Mortgage Obligations):**\nRe-securitize MBS pools into more complex tranches addressing investor preferences:\n- **PAC (Planned Amortization Class)**: Stable cash flows within a prepayment band — most predictable.\n- **TAC (Targeted Amortization Class)**: Stable only in one direction (against fast prepayments).\n- **Sequential-pay**: Each tranche repaid fully before the next receives principal.\n- **IO (Interest-Only)**: Receives only interest — loses value when prepayments accelerate (less principal outstanding).\n- **PO (Principal-Only)**: Receives only principal — gains value when prepayments accelerate.\n\n**Negative Convexity in MBS:**\nUnlike standard bonds (positive convexity), MBS exhibit **negative convexity**:\n- When rates **fall**: Homeowners refinance rapidly prepayments accelerate MBS duration shortens investor gets principal back at the worst time (must reinvest at lower rates).\n- When rates **rise**: Prepayments slow MBS duration extends investor holds the bond longer as its value falls.\nThis asymmetry — giving up the upside while amplifying the downside — is why MBS investors demand a prepayment/convexity premium.",
 highlight: ["MBS", "agency MBS", "non-agency MBS", "CMBS", "CMO", "PAC", "TAC", "IO", "PO", "negative convexity", "prepayment"],
 },
 {
 type: "teach",
 title: "CLOs: Collateralized Loan Obligations",
 content:
 "**CLOs (Collateralized Loan Obligations)** are securitizations of pools of corporate leveraged loans — and arguably the most important buyers of leveraged finance today.\n\n**Structure:**\n- **Collateral pool**: 150–250 broadly syndicated leveraged loans (floating rate, typically SOFR + 300–500bp).\n- **Capital structure**: Multiple tranches from AAA (70–75% of capital) down to equity (8–12%).\n- **CLO Manager**: Active manager selects and trades loans within eligibility constraints (diversity score, weighted average rating, OC tests).\n\n**Tranche Economics:**\n| Tranche | % of Pool | Typical Rating | Spread |\n|---|---|---|---|\n| AAA | ~65% | AAA | SOFR+140bp |\n| AA | ~10% | AA | SOFR+200bp |\n| A | ~7% | A | SOFR+250bp |\n| BBB | ~5% | BBB | SOFR+375bp |\n| BB | ~5% | BB | SOFR+700bp |\n| Equity | ~8% | Unrated | Residual |\n\n**Structural Protections (OC/IC Tests):**\n- **Overcollateralization (OC) test**: Pool par value / senior tranche par value must exceed threshold. If breached, cash is redirected from junior tranches to pay down senior.\n- **Interest Coverage (IC) test**: Pool interest income / tranche interest cost must exceed threshold.\n\n**Why CLOs Survived 2008:**\n- CLOs held diversified pools of senior secured loans — not subprime mortgages.\n- No mark-to-market covenant triggers (unlike CDO-squared structures).\n- OC/IC triggers diverted cash to senior tranches early.\n- CDO-squared (ABS backed by ABS tranches): highly correlated assets catastrophic losses in 2008. CLOs CDO-squared.\n\n**CLO Equity:**\nThe residual tranche captures all excess spread after paying debt tranches and manager fees. Returns of 12–20% IRR in good vintages — but first-loss exposure amplifies downside.",
 highlight: ["CLO", "leveraged loans", "CLO manager", "OC test", "IC test", "equity tranche", "AAA tranche", "CDO", "structural protections"],
 },
 {
 type: "quiz-mc",
 question:
 "Why do mortgage-backed securities (MBS) exhibit negative convexity?",
 options: [
 "When rates fall, homeowners prepay mortgages MBS duration shortens and investors must reinvest at lower rates; when rates rise, prepayments slow MBS extends and loses more value",
 "MBS have embedded put options that the investor can exercise when rates fall, creating a negative price impact",
 "Negative convexity means MBS prices fall when rates fall — the opposite of standard bonds",
 "CLO tranches within MBS create correlation risk that removes the normal positive convexity benefit",
 ],
 correctIndex: 0,
 explanation:
 "Negative convexity in MBS arises from prepayment behavior. When interest rates fall, homeowners refinance, accelerating principal repayment to the MBS investor — truncating the high-rate cash flows and forcing reinvestment at lower rates. When rates rise, prepayments slow, extending MBS duration precisely when you would rather hold a shorter bond. This asymmetric duration extension (hurts when rates rise) combined with prepayment when rates fall (loses the benefit) is the opposite of positive convexity seen in standard non-callable bonds.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "CLO equity tranche investors benefit when loan spreads are wide and default rates remain low, as the equity captures the residual spread income after paying all senior tranches.",
 correct: true,
 explanation:
 "True. CLO equity is the first-loss, residual-income tranche. Its return equals: pool interest income (SOFR + loan spreads) minus interest paid to all debt tranches (AAA through BB) minus CLO manager fees. When loan spreads are wide, the pool generates more interest income, increasing the residual flowing to equity. When default rates are low, the loan pool maintains its par value and OC tests remain satisfied, allowing full distributions to equity. Wide spreads + low defaults = maximum CLO equity returns.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An insurance company's fixed income team is considering three structured credit investments for their portfolio: (A) AAA-rated agency MBS, (B) BBB-rated ABS backed by prime auto loans, (C) BB-rated CLO tranche backed by leveraged loans. The team has strict capital requirements and a mandate to prioritize capital preservation.",
 question:
 "Which investment is most appropriate for the capital preservation mandate, and what is its primary remaining risk?",
 options: [
 "Option A (AAA agency MBS) — no credit risk due to government backing; primary risk is prepayment/extension risk from interest rate moves",
 "Option B (BBB ABS) — investment-grade rating ensures capital preservation; primary risk is equity market correlation",
 "Option C (BB CLO) — floating rate eliminates interest rate risk, making it the safest option",
 "Option B (BBB ABS) — auto loans are the safest collateral because cars are physical assets that can be repossessed",
 ],
 correctIndex: 0,
 explanation:
 "For capital preservation, the AAA agency MBS (Option A) is the most appropriate. Agency MBS carry no credit risk — principal and interest are guaranteed by Fannie Mae, Freddie Mac, or Ginnie Mae (backed by the U.S. government). However, capital preservation does not mean risk-free: the primary risk is prepayment/extension risk from interest rate changes, which can alter the duration and reinvestment returns. BBB ABS carries credit risk (auto loan defaults) and a BB CLO tranche has meaningful credit risk with first-loss exposure above the equity layer.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Credit Portfolio Management 
 {
 id: "ca-5",
 title: "Credit Portfolio Management",
 description:
 "Portfolio construction, credit beta, DTS risk metric, and total return credit investing",
 icon: "PieChart",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Credit Portfolio Construction",
 content:
 "Building a credit portfolio requires balancing yield maximization against concentration risk, duration exposure, and rating constraints.\n\n**Diversification Principles:**\n- **Issuer concentration**: IG portfolios typically cap individual issuers at 2–5% of portfolio; HY at 1–3%.\n- **Sector diversification**: Over-concentration in one sector (e.g., energy, retail) creates correlated default risk. Sectors tend to default together in downturns.\n- **Rating diversification**: Pure CCC portfolios maximize yield but experience severe NAV drawdowns in recessions. Blending BB/B/CCC smooths returns.\n- **Duration diversification**: Mixing short, medium, and long maturities reduces interest rate risk and reinvestment risk simultaneously.\n\n**Benchmark-Aware vs Unconstrained:**\n- **Benchmark-aware** (most institutional managers): Track a benchmark (Bloomberg U.S. HY Index, ICE BofA IG Index) within tight duration/spread duration bands.\n - Risk is measured as **tracking error** vs benchmark.\n - Underweight/overweight sectors vs benchmark — not absolute exposures.\n- **Unconstrained** (hedge funds, total return funds): No benchmark. Maximize absolute return across the full credit spectrum.\n - Can go to cash, short via CDS, buy distressed, or lever up IG.\n - Higher alpha potential; also higher volatility and drawdown risk.\n\n**Concentration Limits in Practice:**\n- Single issuer: max 3–5% of portfolio for HY\n- Single sector: typically max 15–20%\n- Single rating bucket: CCC typically capped at 5–10% in blended HY funds\n- Liquidity bucket: Minimum 10–15% in liquid securities (large issue size, frequently traded)",
 highlight: ["diversification", "issuer concentration", "sector diversification", "benchmark-aware", "unconstrained", "tracking error", "concentration limits"],
 },
 {
 type: "teach",
 title: "Credit Beta and Factor Tilts",
 content:
 "Credit portfolios have exposure to systematic risk factors that drive returns across the credit cycle.\n\n**Spread Beta (Credit Beta):**\nMeasures how much a bond's spread moves relative to the overall market spread change.\n- **HY spread beta 1.0–1.3**: HY spreads move roughly in line with or wider than the index.\n- **IG spread beta 0.7–0.9**: IG spreads move less than HY in risk-off events.\n- **CCC spread beta 1.5–2.0**: CCC bonds are extremely volatile — spreads widen sharply in risk-off.\n\nIn a market risk-off move (spreads widen 100bp overall), a CCC-heavy portfolio might see spreads widen 150–200bp while a BB-focused portfolio widens only 80bp.\n\n**Key Credit Factor Tilts:**\n\n**Quality factor**: Tilt toward higher-quality bonds (BB over CCC) — underperforms in tight-spread environments but outperforms when spreads widen.\n\n**Carry**: Overweight higher-coupon, wider-spread bonds to maximize income; accepts more credit risk.\n\n**Momentum**: Overweight bonds whose spreads have been tightening (improving credit quality); underweight bonds with widening spreads. Captures upgrading/improving credit trends.\n\n**Roll-down**: Overweight the part of the credit curve with the steepest slope, benefiting from spread tightening as time passes and the bond \"rolls\" to a shorter maturity with a tighter spread.\n\n**Liquidity premium**: Deliberately overweight less-liquid bonds (smaller issue sizes, less frequently traded) to capture the liquidity premium — requires ability to hold through illiquid periods.",
 highlight: ["spread beta", "credit beta", "quality factor", "carry", "momentum", "roll-down", "liquidity premium", "factor tilts"],
 },
 {
 type: "teach",
 title: "Total Return Credit Investing",
 content:
 "Credit bonds generate returns from three sources — understanding their relative contribution guides portfolio decisions.\n\n**Total Return Components:**\n\n**1. Carry (Income Return):**\nCoupon income minus funding cost (if leveraged). The dominant return source for buy-and-hold credit investing.\nExample: 6% coupon bond financed at 0% (unleveraged) 6% annual carry.\n\n**2. Price Return:**\nCapital gain or loss from spread movements and interest rate changes.\n- Spread tightening 50bp on a 5-year bond (spread duration 4.5): Price gain +2.25%\n- Spread widening 100bp: Price loss –4.5%\n\n**3. Roll-Down Return:**\nAs a bond ages from 7Y to 6Y (in a normal credit curve), it moves to the shorter-maturity, tighter-spread part of the curve price appreciation even with no market movement.\n\n**Excess Return over Treasuries:**\nThe credit component of total return, stripping out the duration-matched Treasury return.\nExcess return = Total return – Duration-matched Treasury return\nThe goal of active credit management is to generate positive excess returns.\n\n**Credit as Equity Substitute:**\n- HY total returns have historically correlated 0.60–0.70 with equities (vs ~0.10 for IG).\n- HY investors accept equity-like volatility in exchange for income priority over equity.\n- In a balanced portfolio, HY can substitute for a portion of equity allocation with lower volatility.\n\n**Risk Parity with Credit:**\nAllocate equal risk (not capital) across credit, equity, and duration exposures.\nCredit's lower volatility vs equity means higher capital allocation to credit to equalize risk contribution.",
 highlight: ["total return", "carry", "price return", "roll-down", "excess return", "credit as equity substitute", "risk parity", "spread duration"],
 },
 {
 type: "quiz-mc",
 question:
 "What does DTS (Duration Times Spread) measure in a credit portfolio?",
 options: [
 "The key spread risk metric — DTS = Modified Spread Duration × Current Spread; approximates the dollar price sensitivity to a 1% proportional spread move",
 "The total duration of a bond portfolio including both rate and spread components",
 "The daily trading sensitivity, measuring how many times a bond's spread changes in a day",
 "The ratio of default timing to spread levels — used to predict when defaults will occur",
 ],
 correctIndex: 0,
 explanation:
 "DTS (Duration Times Spread) is the primary risk metric for measuring credit spread sensitivity. DTS = Spread Duration × Current Spread. A bond with 5 years of spread duration and a 300bp spread has DTS = 1,500bp·yr. DTS captures the fact that a 10% proportional spread move (300bp 330bp) causes greater price impact on a wider-spread bond than an equivalent proportional move on a tight IG bond. Portfolio managers compare DTS across holdings to normalize credit risk, making it more useful than spread duration alone.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "High-yield bond total returns are more equity-like than investment-grade total returns, with historically higher correlation to the stock market.",
 correct: true,
 explanation:
 "True. High-yield bonds sit lower in the capital structure than investment-grade debt — they are closer to equity in both risk and return profile. Historical correlation of HY total returns to equities (S&P 500) is approximately 0.60–0.75, reflecting that both asset classes are driven by economic growth expectations and corporate health. IG bonds typically show much lower equity correlation (~0.10–0.25) because their returns are dominated by interest rate movements rather than credit/growth factors. This is why HY is sometimes used as a partial equity substitute in balanced portfolios.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A credit portfolio manager runs a $500M HY fund. Current positioning: 45% B-rated bonds, 35% BB-rated bonds, 20% CCC-rated bonds. The credit cycle indicators are turning negative: the distressed ratio is rising, leveraged loan issuance is declining, and the Fed is beginning to tighten policy. The manager expects spread widening of 150–200bp over the next 12 months.",
 question:
 "Which rebalancing action best positions the portfolio for credit cycle deterioration?",
 options: [
 "Reduce CCC from 20% to 5–8% and rotate into BB bonds — higher-quality credits will outperform on spread widening; CCC spread beta of ~1.5–2× amplifies drawdowns",
 "Increase CCC to 35% — wider spreads mean higher yields, maximizing carry income during the widening period",
 "Sell all bonds and hold cash — credit always goes to zero during credit deterioration",
 "Add leverage to the BB tranche — higher leverage amplifies returns when spreads tighten after the cycle turns",
 ],
 correctIndex: 0,
 explanation:
 "Late-cycle credit deterioration calls for a quality upgrade. CCC bonds have spread beta of 1.5–2×, meaning a 200bp market-wide widening could result in 300–400bp of CCC spread widening — causing significant NAV drawdowns. Rotating from CCC to BB reduces the portfolio's spread beta and credit risk while maintaining credit exposure. BB bonds typically widen less than CCC in risk-off moves and recover faster. Adding leverage or increasing CCC (Option B) would amplify drawdowns. Going to cash entirely (Option C) is overly defensive and misses carry income from resilient credits.",
 difficulty: 3,
 },
 ],
 },
 ],
};
