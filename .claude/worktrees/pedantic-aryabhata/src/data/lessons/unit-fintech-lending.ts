import { Unit } from "./types";

export const UNIT_FINTECH_LENDING: Unit = {
 id: "fintech-lending",
 title: "Fintech Lending",
 description:
 "Explore how technology is reshaping credit: P2P marketplace platforms, alternative credit scoring, BNPL mechanics, and the embedded finance stack powering the next generation of financial services",
 icon: "CreditCard",
 color: "#F59E0B",
 lessons: [
 // Lesson 1: P2P & Marketplace Lending 
 {
 id: "fintech-lending-1",
 title: "P2P & Marketplace Lending",
 description:
 "Originate-to-distribute model, platform vs balance sheet lenders, institutional takeover of P2P, and bank partnership models",
 icon: "Network",
 xpReward: 75,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Originate-to-Distribute: The Platform Lending Model",
 content:
 "**Peer-to-peer (P2P) and marketplace lending** platforms sit between borrowers and investors, replacing the traditional bank balance sheet with a technology-driven matching engine.\n\n**Originate-to-distribute (OTD) model:**\n- The platform underwrites and originates loans, then immediately sells or distributes them to investors\n- Unlike banks that fund loans with deposits and hold credit risk (**originate-to-hold**), OTD platforms earn fee income while transferring risk\n- Platform revenue: **origination fees** from borrowers (1–6%) + **servicing fees** from investors (0.5–1% annually)\n- Because the platform does not hold loans, it can scale rapidly without capital constraints — but this creates an **incentive misalignment** if the originator has no skin in the game\n- Post-2008 **risk retention rules** address this by requiring originators to retain at least 5% of securitized loan pools\n\n**Platform vs balance sheet lenders:**\n- **Platform lenders** (marketplace model): match borrowers to external investors; asset-light, scalable, fee-dependent\n- **Balance sheet lenders**: fund loans with own capital or warehouse lines; carry credit risk; better aligned but capital-constrained\n- Many fintechs blend both: originate, hold briefly for quality signaling, then sell into ABS or forward-flow agreements\n\n**Credit risk transfer mechanics:**\n- Loans may be sold as whole loans (bilateral deals with banks/hedge funds), securitized into ABS tranches, or passed to investors via participation notes\n- Institutional buyers conduct **vintage analysis** — tracking cohort default curves — before committing capital",
 highlight: [
 "originate-to-distribute",
 "originate-to-hold",
 "origination fees",
 "servicing fees",
 "risk retention rules",
 "balance sheet lenders",
 "vintage analysis",
 ],
 },
 {
 type: "teach",
 title: "LendingClub, Prosper, and the Institutional Takeover of P2P",
 content:
 "Early P2P platforms promised to connect everyday savers directly with borrowers — but institutional capital quickly dominated the landscape.\n\n**Historical arc:**\n- **Prosper** (2005): First US P2P platform; allowed retail investors to bid on individual loan listings; faced SEC scrutiny, relaunched under securities registration in 2009\n- **LendingClub** (2006): Scaled rapidly by standardizing loan grades (A–G) and enabling fractional investment; IPO'd in December 2014 for $5.4B valuation — then largest US tech IPO that year\n- By 2015–2016, **institutional investors** (hedge funds, banks, insurance companies) funded 60–80% of originated loans on major platforms, crowding out retail\n- 2016 LendingClub scandal: CEO resignation over loan data falsification; investor confidence collapsed, volumes dropped 50%\n- LendingClub pivoted: acquired Radius Bank (2020) and became a full bank, shifting to originate-to-hold for prime loans\n\n**Why institutions took over:**\n- Retail investors face adverse selection — the worst loans are left unfunded, improving at scale only if automated\n- Institutions bring lower cost of capital, automated credit selection, and regulatory familiarity\n- **Regulatory arbitrage**: platforms initially operated outside bank regulations, offering faster approvals and fewer disclosure requirements — regulators have since tightened oversight\n\n**Bank partnership models (BaaS):**\n- Many fintechs partner with sponsor banks to originate loans under the bank's charter\n- The **rent-a-charter** model lets fintechs access bank infrastructure without a full banking license\n- Cross River Bank, WebBank, Blue Ridge Bank serve as primary lending partners for numerous fintech platforms",
 highlight: [
 "LendingClub",
 "Prosper",
 "institutional investors",
 "regulatory arbitrage",
 "bank partnership models",
 "rent-a-charter",
 "Cross River Bank",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Under the originate-to-distribute model, which party primarily bears the credit risk of marketplace loans after origination?",
 options: [
 "The lending platform, since it originates all loans",
 "Investors who purchase the loans or loan-backed securities",
 "The sponsor bank that provides the charter",
 "The federal government through deposit insurance",
 ],
 correctIndex: 1,
 explanation:
 "In the OTD model, the platform originates loans and then transfers them to investors (institutional buyers, ABS investors, or retail note holders). The platform retains servicing obligations and fee income but transfers credit risk. This is why risk retention rules requiring originators to keep 5% were enacted — to re-align incentives between originators and end investors.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "LendingClub's 2020 acquisition of Radius Bank represented a shift away from the originate-to-distribute marketplace model toward holding loans on its own balance sheet.",
 correct: true,
 explanation:
 "Correct. After the 2016 scandal and loss of institutional investor confidence, LendingClub pursued a bank charter strategy. Acquiring Radius Bank gave LendingClub access to deposits as a funding source, enabling it to hold prime loans on its balance sheet rather than relying entirely on third-party investors — a fundamental business model transformation.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A fintech lender originates $500M in personal loans per month but holds no banking license. It sells 100% of loans to a hedge fund on day 30, retaining only servicing rights. The hedge fund is now facing redemptions and cannot purchase next month's originations.",
 question:
 "What is the primary structural vulnerability this scenario illustrates?",
 options: [
 "The fintech is over-reliant on a single institutional funding partner, creating volume cliff risk when investor appetite withdraws",
 "The fintech should have retained more origination fee income to buffer against shortfalls",
 "The hedge fund violated risk retention rules by holding more than 95% of loans",
 "Servicers are required by law to hold at least 10% of originated loans on their balance sheet",
 ],
 correctIndex: 0,
 explanation:
 "This is the classic marketplace lending 'funding cliff' problem. Platforms that are 100% dependent on a single or small group of institutional buyers can see origination volumes collapse instantly when that capital source withdraws. Diversified funding — multiple institutional partners, ABS structures, and some balance sheet capacity — is the industry best practice to manage this concentration risk.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Alternative Credit Scoring 
 {
 id: "fintech-lending-2",
 title: "Alternative Credit Scoring",
 description:
 "FICO limitations, credit invisibles, alternative data sources, ML models, fair lending compliance, and UltraFICO/Experian Boost innovations",
 icon: "BarChart2",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The FICO Problem: 45 Million Credit Invisibles",
 content:
 "The **FICO score** has been the dominant US credit underwriting tool since 1989 — but it excludes a substantial portion of the population.\n\n**FICO limitations:**\n- Requires a minimum **6-month credit history** with at least one account reported in the past 6 months\n- **Credit invisibles**: ~45 million Americans have no FICO score — either **no-file** (never had a credit account) or **thin-file** (insufficient history)\n- Disproportionately affects: recent immigrants, young adults, low-income households, and communities of color\n- FICO is backward-looking — it captures repayment history but misses current cash flow health\n- Score ranges: 300–850; prime threshold typically 670+; super-prime 740+\n\n**Who gets excluded:**\n- New-to-country immigrants may have excellent credit histories abroad — FICO ignores them\n- Gig economy workers with irregular income look riskier under traditional models even if highly solvent\n- Individuals who use cash and debit exclusively build no credit file despite responsible financial behavior\n\n**VantageScore vs FICO:**\n- **VantageScore** (joint venture of Equifax, Experian, TransUnion) uses a minimum 1-month history and 1 account in 24 months\n- Scores an additional 30–35 million consumers compared to FICO\n- VantageScore 4.0 incorporates **trended data** — 24 months of credit behavior — vs FICO's snapshot approach\n- **Trended data advantage**: a borrower consistently paying down a balance scores better than one maintaining the same balance, even at identical current balances\n\n**Policy significance:**\n- FHFA mandated Fannie Mae and Freddie Mac transition from FICO 2/4/5 to FICO 10T and VantageScore 4.0 for mortgage lending (phased 2025–2026), expanding access for thin-file borrowers",
 highlight: [
 "FICO score",
 "credit invisibles",
 "45 million",
 "thin-file",
 "VantageScore",
 "trended data",
 "FHFA",
 ],
 },
 {
 type: "teach",
 title: "Alternative Data Sources and ML Underwriting",
 content:
 "Fintech lenders use **alternative data** — information outside the traditional credit bureau file — to underwrite borrowers who would otherwise be declined.\n\n**Categories of alternative data:**\n- **Cash flow / bank account data**: income regularity, expense patterns, average daily balance, NSF frequency — strongest predictor set for thin-file borrowers\n- **Rent and utility payments**: on-time payment history not typically reported to bureaus; programs like Experian RentBureau and Rental Kharma add this data\n- **Telecom / mobile payments**: phone bill payment history; used heavily in emerging markets (Kenya's M-Pesa ecosystem)\n- **Social and behavioral data**: device type, app usage patterns, browser metadata — controversial, fair lending concerns\n- **Education and employment verification**: degree attainment, employer, tenure; used by Upstart for student/young professional lending\n\n**ML models vs scorecards:**\n- Traditional scorecards: linear regression with hand-crafted features; transparent, auditable, but limited predictive power\n- **Gradient boosting (XGBoost/LightGBM)** and **neural networks** capture non-linear interactions between hundreds of variables\n- ML models demonstrably improve approval rates for thin-file borrowers at equivalent or lower default rates vs traditional models\n- **Explainability requirement**: CFPB guidance and adverse action notice rules (FCRA/ECOA) require lenders to provide specific reasons for credit denial — challenging for black-box ML models\n\n**UltraFICO and Experian Boost:**\n- **UltraFICO** (FICO + Experian + Finicity): opt-in program where consumers share bank account data to potentially boost FICO score; focuses on positive cash management behaviors\n- **Experian Boost**: consumer-permissioned addition of utility, telecom, and streaming service payment history to Experian credit file; average score increase of ~13 points for thin-file users\n\n**Fair lending compliance (ECOA / Fair Housing Act):**\n- Alternative data must not create **disparate impact** — disproportionate adverse effect on protected classes (race, gender, national origin, religion)\n- Zip code as a proxy for race is a classic redlining concern; ML models must be tested for disparate impact\n- CFPB expects lenders using AI/ML to demonstrate that models are tested for bias and that adverse action notices are meaningful",
 highlight: [
 "alternative data",
 "cash flow data",
 "ML models",
 "explainability requirement",
 "UltraFICO",
 "Experian Boost",
 "ECOA",
 "disparate impact",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A fintech lender uses a deep learning model that improves approval rates by 20% for thin-file borrowers at equivalent default rates. A regulator requests the denial reasons for a specific applicant. What is the primary compliance challenge?",
 options: [
 "Deep learning models cannot be deployed for consumer lending under any circumstances",
 "Adverse action notice rules require specific, intelligible denial reasons — which black-box models struggle to provide",
 "The 20% approval rate improvement proves the model is discriminatory under ECOA",
 "Default rate equivalence automatically satisfies disparate impact testing requirements",
 ],
 correctIndex: 1,
 explanation:
 "FCRA and ECOA adverse action notice requirements mandate that lenders tell applicants the specific reasons for denial in a way applicants can understand and potentially act on. Deep learning models are difficult to explain at the individual level, creating a tension between model performance and regulatory explainability. Lenders often use SHAP values or similar techniques to generate post-hoc explanations, but regulators are still developing standards for AI explainability in credit.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Trended credit data shows 24 months of payment behavior rather than just a current-period snapshot, which can benefit borrowers who are actively paying down balances.",
 correct: true,
 explanation:
 "Correct. VantageScore 4.0 and FICO 10T both incorporate trended data. A borrower steadily paying down credit card balances demonstrates improving financial discipline — behavior that a static snapshot would miss. Trended data distinguishes 'transactors' (who pay in full) from 'revolvers' (who carry balances) and 'increasing balance' borrowers, providing richer signals about creditworthiness trajectory.",
 difficulty: 1,
 },
 ],
 },

 // Lesson 3: Buy Now Pay Later 
 {
 id: "fintech-lending-3",
 title: "Buy Now Pay Later",
 description:
 "BNPL mechanics, merchant discount rates, Affirm/Klarna/Afterpay models, real-time decisioning, regulatory gaps, and B2B trade credit digitization",
 icon: "ShoppingCart",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "How BNPL Works: Mechanics and Business Models",
 content:
 "**Buy Now Pay Later (BNPL)** allows consumers to split a purchase into installments — typically 4 equal payments over 6 weeks — at 0% interest to the consumer.\n\n**Core mechanics:**\n- Consumer selects BNPL at checkout; platform makes an **instant credit decision** in seconds\n- Merchant receives full payment immediately (minus the platform fee)\n- Consumer repays in installments; late fees apply if payments are missed\n- **No interest to the consumer** on standard pay-in-4 products — the merchant, not the borrower, pays for the financing\n\n**Merchant discount rate (MDR):**\n- BNPL platforms charge merchants **3–6% of transaction value** (vs ~2–2.5% for credit cards)\n- Merchants accept the higher cost because BNPL increases **conversion rates** (fewer cart abandonments), raises **average order values** (AOV), and attracts younger consumers without credit cards\n- Platform revenue model: merchant fees (primary) + late fees from consumers + interest on longer-term installment products\n\n**Major players and model differences:**\n- **Afterpay** (acquired by Block/Square, 2022): pure pay-in-4, no interest ever, consumer-facing; revenue from merchant MDR and late fees only\n- **Klarna** (Sweden): broadest product range — pay-in-4, pay-in-30, 6–36 month financing with interest; also operates a bank in Sweden\n- **Affirm**: focuses on larger-ticket items ($100–$17,500); transparent interest rates (0–36% APR based on creditworthiness); no late fees; sells directly and via BNPL-as-a-service to merchants\n- **PayPal Pay Later**: embedded in existing PayPal checkout; leverages PayPal's 400M account base for instant underwriting\n\n**Real-time credit decisioning:**\n- BNPL platforms make underwriting decisions in <500ms at checkout\n- Use proprietary models combining limited credit bureau data, purchase history, device/behavioral signals, and merchant context\n- Many perform only a **soft credit pull** — does not affect the consumer's credit score — making BNPL less visible in traditional credit files",
 highlight: [
 "BNPL",
 "merchant discount rate",
 "3–6%",
 "pay-in-4",
 "Affirm",
 "Klarna",
 "Afterpay",
 "soft credit pull",
 "real-time credit decisioning",
 ],
 },
 {
 type: "teach",
 title: "Regulatory Gaps, Debt Accumulation Risk, and Bank Response",
 content:
 "BNPL's explosive growth — from ~$8B in US transaction volume in 2019 to over $75B by 2023 — has drawn regulatory scrutiny and competitive response.\n\n**Regulatory gaps vs credit cards:**\n- Credit cards are governed by the **Truth in Lending Act (TILA)**, requiring standardized APR disclosure, billing statements, and dispute rights\n- Traditional pay-in-4 BNPL products were structured as **charge accounts** paid in full within 4 billing cycles, technically exempt from TILA Regulation Z disclosure requirements\n- Consumers receive no standardized APR, no periodic billing statement, and limited dispute rights under existing regulation\n- **CFPB interpretive rule (2024)**: BNPL lenders must provide TILA-compliant disclosures, billing statements, and dispute rights for pay-in-4 products — closing the regulatory gap\n\n**Debt accumulation risk:**\n- Because BNPL is largely invisible to other lenders (soft pulls, no bureau reporting), consumers can stack multiple BNPL plans simultaneously\n- Studies show ~40% of BNPL users have used multiple plans concurrently; 20%+ have missed at least one payment\n- Younger consumers (18–34) are disproportionate BNPL users; risk of normalizing credit for discretionary spending without full understanding of cumulative debt\n\n**Bank competition response:**\n- Chase, Citibank, American Express all launched installment features on existing credit card balances (Pay It Plan It, Citi Flex Pay, AmEx Plan It)\n- Banks leverage existing cardholder relationships, bureau data, and lower cost of funds — structural advantages vs standalone BNPL fintechs\n- Several BNPL fintechs (Sezzle, Splitit) have struggled with profitability; Klarna raised capital at an 85% valuation markdown in 2022\n\n**BNPL in B2B context:**\n- **Trade credit digitization**: B2B equivalent of BNPL; companies like Billie (Germany), Balance, and Resolve enable net-30/60 payment terms at digital checkout for business buyers\n- Digitizes the historically paper-based accounts receivable/payable process\n- Merchant benefits: immediate payment; buyer benefits: working capital preservation",
 highlight: [
 "Truth in Lending Act",
 "TILA",
 "CFPB interpretive rule",
 "debt accumulation",
 "buy now pay later",
 "trade credit digitization",
 "B2B BNPL",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A consumer uses three separate BNPL apps to buy $800 in clothing, $400 in electronics, and $600 in furniture simultaneously, each on a pay-in-4 schedule. Their mortgage lender is unaware of this $1,800 in obligations. What risk does this scenario illustrate?",
 options: [
 "Credit invisibility risk — BNPL soft pulls and limited bureau reporting leave hidden debt obligations invisible to other lenders",
 "Regulatory risk — using multiple BNPL providers simultaneously is illegal under CFPB rules",
 "Fraud risk — the consumer has violated BNPL terms by using competing platforms",
 "Interest rate risk — 0% BNPL products carry hidden floating rate exposure",
 ],
 correctIndex: 0,
 explanation:
 "This is the debt stacking problem unique to BNPL. Because most pay-in-4 products use soft credit pulls and do not report to major bureaus, lenders extending new credit (mortgages, auto loans, credit cards) cannot see the consumer's BNPL obligations. The $1,800 in outstanding BNPL debt is completely invisible to the mortgage underwriter, understating the consumer's true debt load. The CFPB has flagged this as a systemic risk to credit underwriting accuracy.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "BNPL platforms typically charge the consumer an interest rate that is higher than traditional credit cards to compensate for the 0% promotional period.",
 correct: false,
 explanation:
 "False. On standard pay-in-4 BNPL products, the consumer pays zero interest — the merchant pays the financing cost through the merchant discount rate (3–6% of transaction value). The BNPL platform's primary revenue source is the merchant fee, not consumer interest. Some BNPL providers like Affirm do charge consumer interest on longer-term financing products, but the core pay-in-4 product is interest-free to the consumer.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A BNPL startup processes $2B in annual transaction volume. Revenue breakdown: merchant fees (4% average MDR) = $80M; late fees = $12M; total revenue = $92M. Funding cost for the loan book = $45M. Credit losses = $28M. Operating expenses = $35M.",
 question:
 "What is the startup's net income and what does this reveal about BNPL unit economics?",
 options: [
 "Net income of -$16M; BNPL businesses are fundamentally unprofitable at scale due to credit losses exceeding merchant fee income",
 "Net income of -$16M; BNPL is marginally unprofitable even at $2B volume, highlighting the challenge of achieving profitability without scale efficiencies",
 "Net income of +$12M; BNPL is highly profitable because merchant fees exceed all costs",
 "Net income cannot be calculated without knowing customer acquisition costs",
 ],
 correctIndex: 1,
 explanation:
 "Revenue $92M funding cost $45M credit losses $28M operating expenses $35M = -$16M net loss. This illustrates a key BNPL challenge: even at $2B volume, the business loses money. Credit losses (approximately 1.4% of GMV) combined with operating costs consume the merchant fee revenue. Most BNPL companies have struggled with profitability; achieving scale to spread fixed costs and improving credit models to reduce losses are critical to the path to profitability.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Embedded Finance & BaaS 
 {
 id: "fintech-lending-4",
 title: "Embedded Finance & BaaS",
 description:
 "Embedded finance definition, Banking-as-a-Service stack, unit economics, regulatory accountability, Stripe/Unit/Marqeta examples, and open banking",
 icon: "Layers",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "What Is Embedded Finance?",
 content:
 "**Embedded finance** is the integration of financial services — lending, payments, insurance, investments — directly into non-financial applications and platforms.\n\n**Core concept:**\n- Instead of redirecting a customer to a bank or insurance company, the financial product is natively available within the user experience of an e-commerce platform, SaaS tool, or marketplace\n- The distributing company is not a bank — it accesses financial infrastructure through APIs provided by regulated entities\n\n**Key examples by product category:**\n- **Embedded lending**: Shopify Capital offers merchant cash advances and loans directly in the Shopify dashboard; Amazon Lending offers inventory financing to marketplace sellers\n- **Embedded payments**: Uber, DoorDash, Airbnb handle payment processing natively without redirecting to PayPal or a bank\n- **Embedded insurance**: Tesla offers car insurance integrated into the vehicle app; Lemonade embeds renter's insurance into apartment rental platforms\n- **Embedded investments**: Acorns rounds up purchases and invests the spare change; Cash App offers stock and Bitcoin buying without a separate brokerage account\n\n**Why it matters:**\n- Financial services are increasingly moving to the **point of need** — capital when a merchant needs inventory, insurance when a user books a rental, lending when a buyer is at checkout\n- Distributing companies gain new revenue streams and deeper customer engagement\n- **Market sizing**: embedded finance expected to represent $7 trillion in transaction value by 2030 (Lightyear Capital)\n\n**Open banking as an enabler:**\n- **Open banking** regulations (PSD2 in Europe, Consumer Financial Protection Bureau rulemaking in US) require banks to share customer data via secure APIs with authorized third parties\n- Enables real-time account verification, income verification, and cash flow underwriting without manual document submission\n- Foundation for frictionless embedded lending decisioning",
 highlight: [
 "embedded finance",
 "Shopify Capital",
 "point of need",
 "open banking",
 "PSD2",
 "$7 trillion",
 "APIs",
 ],
 },
 {
 type: "teach",
 title: "Banking-as-a-Service: Stack, Economics, and Regulation",
 content:
 "**Banking-as-a-Service (BaaS)** is the infrastructure layer that powers embedded finance — a three-tier stack connecting regulated banks to non-bank distributors.\n\n**The BaaS stack:**\n1. **Sponsor bank** (bottom layer): FDIC-insured, holds deposits, issues regulated products (accounts, debit cards, loans) under its charter. Examples: Cross River Bank, Column Bank, Thread Bank, Blue Ridge Bank\n2. **Middleware / BaaS platform** (middle layer): APIs and developer tools that abstract away bank complexity; compliance, KYC, ledgering, card issuing infrastructure. Examples: **Stripe Treasury**, **Unit**, **Bond**, **Treasury Prime**\n3. **Distributor / fintech** (top layer): consumer-facing app or platform that embeds financial products. Examples: Robinhood (bank accounts via Coastal Bank), Lyft (driver debit cards via Stride Bank), Brex (business accounts)\n\n**Marqeta — card issuing infrastructure:**\n- **Marqeta** is the leading card issuing platform; enables real-time, programmable debit/credit/prepaid card issuance\n- Powers: Block/Cash App, DoorDash (driver payout cards), Klarna (virtual cards for purchases), Google Pay\n- Just-in-time provisioning: funds are loaded onto a virtual card at the exact moment of purchase from a separate float account, reducing fraud and float cost\n\n**Revenue sharing models:**\n- Sponsor bank earns: net interest income on deposits/loans, interchange split, compliance fees\n- Middleware earns: per-account fees, per-transaction fees, monthly platform fees from fintechs\n- Distributor earns: interchange revenue share (typically 60–80% of interchange to the fintech), premium feature fees from end users\n\n**Unit economics of BaaS:**\n- Interchange revenue: ~1.5% on debit, ~2.5% on credit transactions (fintech gets 60–80% of this)\n- Monthly account fee from distributor to middleware: $2–5 per active account\n- Sponsor bank compliance cost: 0.5–1% of assets; passed through to middleware as regulatory compliance fees\n\n**Regulatory accountability under BaaS:**\n- The sponsor bank is ultimately responsible for BSA/AML compliance, fair lending, and consumer protection — regardless of which layer commits a violation\n- 2023–2024 OCC and FDIC enforcement actions against Blue Ridge Bank and Evolve Bank highlighted that sponsor banks face direct regulatory liability for their fintech partners' compliance failures\n- Regulators expect sponsor banks to have robust oversight programs: real-time monitoring, regular audits of fintech partners, contractual right to suspend partnerships",
 highlight: [
 "Banking-as-a-Service",
 "sponsor bank",
 "middleware",
 "Stripe Treasury",
 "Unit",
 "Marqeta",
 "just-in-time provisioning",
 "interchange",
 "regulatory accountability",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A fintech neobank uses BaaS infrastructure: Evolve Bank as sponsor, Unit as middleware, and its own consumer app as distributor. Evolve Bank is fined by the FDIC for BSA/AML violations originating from the neobank's inadequate customer verification. Who bears primary regulatory liability?",
 options: [
 "The neobank (distributor) because it failed to implement proper KYC controls",
 "Unit (middleware) because it provided the compliance infrastructure",
 "Evolve Bank (sponsor) because as the chartered bank it is ultimately accountable to regulators for all activities conducted under its license",
 "The FDIC itself, because it failed to supervise the BaaS arrangement proactively",
 ],
 correctIndex: 2,
 explanation:
 "This mirrors actual 2023 enforcement actions against Evolve Bank. The sponsor bank holds the banking charter and is directly supervised by regulators — meaning it bears ultimate regulatory accountability for all activities conducted under its license, including those of its fintech partners. Regulators cannot directly sanction unlicensed fintechs; they act through the chartered institution. This is why sponsor banks must conduct rigorous due diligence and ongoing oversight of every fintech they partner with.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Under a BaaS arrangement, the fintech distributor (top layer) typically retains 100% of interchange revenue because it is the consumer-facing entity that drives card usage.",
 correct: false,
 explanation:
 "False. Interchange revenue is split across the BaaS stack. The sponsor bank retains a portion for regulatory overhead and capital costs. The middleware platform charges per-transaction or per-account fees. The fintech distributor typically receives 60–80% of the interchange, not 100%. The exact split depends on contractual negotiations, product type (debit vs credit), and the volume of transactions processed. The division of interchange economics is one of the most negotiated aspects of BaaS partnerships.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A ride-sharing company wants to offer its 500,000 drivers instant access to earned wages after each completed ride, a debit card for fuel purchases, and a small line of credit for vehicle maintenance. The company is not a bank and does not want to become one.",
 question:
 "Which architecture best describes how the company could implement this without obtaining a banking license?",
 options: [
 "Partner with a sponsor bank through a BaaS middleware platform to issue driver debit cards (Marqeta-style), provide instant earned wage access (via Stripe Treasury or Unit), and offer a credit line originated by the sponsor bank under a bank partnership model",
 "Apply for a national bank charter, which takes approximately 18–24 months, then build all infrastructure in-house",
 "Register as a money services business (MSB) with FinCEN, which grants full banking powers including deposit-taking and lending",
 "Partner only with a credit union, which is exempt from all BaaS regulatory requirements",
 ],
 correctIndex: 0,
 explanation:
 "This is precisely the embedded finance / BaaS use case. A sponsor bank provides the regulated infrastructure (FDIC insurance, charter, lending authority). Middleware like Unit or Marqeta provides card issuing APIs and ledgering. The ride-sharing company is the distributor — offering financial products natively to drivers through its app without holding a banking license. Earned wage access, debit cards, and credit lines are all standard BaaS product categories deployed by gig economy platforms including DoorDash, Lyft, and Instacart.",
 difficulty: 2,
 },
 ],
 },
 ],
};
