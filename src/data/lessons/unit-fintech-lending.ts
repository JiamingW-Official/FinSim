import type { Unit } from "./types";

export const UNIT_FINTECH_LENDING: Unit = {
  id: "fintech-lending",
  title: "Fintech Lending, Credit Innovation & Alternative Credit",
  description:
    "Explore how technology is reshaping credit: P2P marketplace platforms, BNPL mechanics, embedded finance, alternative credit data, ABS securitization, and investment opportunities across the fintech lending stack",
  icon: "💳",
  color: "#0891b2",
  lessons: [
    // ─── Lesson 1: P2P & Marketplace Lending ─────────────────────────────────
    {
      id: "fintech-lending-1",
      title: "P2P & Marketplace Lending",
      description:
        "Platform mechanics (LendingClub, Prosper, Funding Circle), risk assessment, vintage analysis, and the originate-to-distribute model",
      icon: "Network",
      xpReward: 110,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "How Marketplace Lending Platforms Work",
          content:
            "**Peer-to-peer (P2P) and marketplace lending** platforms sit between borrowers and investors, replacing the traditional bank balance sheet with a technology-driven matching engine.\n\n**Platform mechanics:**\n- Borrowers apply online; automated underwriting assesses creditworthiness in minutes\n- Approved loans are listed on the platform; investors (retail or institutional) fund them\n- Platform earns an **origination fee** from borrowers (1–6% of loan amount) and a **servicing fee** from investors (0.5–1% annually on outstanding principal)\n- Unlike banks, the platform does **not** hold loans on its own balance sheet — it earns fee income while transferring credit risk\n\n**Major platforms:**\n- **LendingClub** (US): personal loans, auto, small business; IPO in 2020, acquired Radius Bank to become a bank itself\n- **Prosper** (US): consumer unsecured loans; pioneered retail investor note participation\n- **Funding Circle** (UK/US): SME loans; institutional-focused, listed on LSE\n- **Kabbage / OnDeck**: small business; relied on bank data APIs for underwriting\n\n**Originate-to-distribute model:**\n- Platform underwrites and originates loans, then immediately sells or distributes them to investors\n- Contrast with banks' **originate-to-hold**: the bank funds loans with deposits and retains credit risk\n- O-T-D removes balance sheet constraints, allowing rapid scaling — but misaligns incentives if the originator does not retain skin in the game\n- Post-2008 regulation (risk retention rules) often requires originators to retain 5% of securitized pools",
          highlight: [
            "origination fee",
            "servicing fee",
            "originate-to-distribute",
            "LendingClub",
            "Funding Circle",
            "risk retention",
          ],
        },
        {
          type: "teach",
          title: "Risk Assessment & Vintage Analysis",
          content:
            "Marketplace platforms use proprietary credit models that go beyond the FICO score to assign loan grades that drive pricing.\n\n**Credit grading:**\n- Loans are bucketed into letter grades (A–G on LendingClub) based on predicted default probability\n- Higher-grade loans carry lower interest rates (e.g., Grade A: 7–10%) and lower default risk\n- Lower-grade loans offer higher yields (Grade E–G: 20–30%) but materially higher defaults\n- Platforms publish historical grade-level default and prepayment rates for investor analysis\n\n**Vintage analysis — the core tool for marketplace loan investors:**\n- A **vintage** is a cohort of loans originated in a specific time period (e.g., Q2 2021)\n- Analysts track cumulative net charge-off rates over each vintage's life (usually 24–60 months)\n- Healthy vintages show an S-curve: charge-offs accelerate in months 6–18, then plateau\n- Comparing vintages reveals underwriting quality changes and macro cycle effects\n\n**Key performance metrics:**\n- **Net charge-off rate (NCO)**: (defaults − recoveries) / average outstanding balance\n- **Prepayment speed (CPR)**: annualized percentage of outstanding loans paid off early — reduces investor yield\n- **Default-adjusted yield**: coupon rate minus expected annual NCO rate gives realized investor return\n- Example: 15% coupon, 5% annual NCO → ~10% default-adjusted yield before platform fees\n\n**Macro sensitivity:**\n- Consumer loan charge-offs correlate with unemployment; SME loans with GDP growth\n- 2020 COVID shock caused 30–50% spike in short-term delinquencies across vintage cohorts",
          highlight: [
            "vintage analysis",
            "net charge-off rate",
            "prepayment speed",
            "credit grading",
            "default-adjusted yield",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A marketplace lending platform originates $100M in personal loans and immediately sells them to institutional investors. The platform charges a 3% origination fee and a 0.75% annual servicing fee. What is the primary business model risk for investors (not the platform)?",
          options: [
            "Credit risk — investors bear all default losses since the platform does not hold loans on its balance sheet",
            "Interest rate risk — the platform controls repricing and can reduce coupons",
            "Liquidity risk for the platform — selling loans locks up capital",
            "Regulatory risk — platforms cannot legally charge origination fees",
          ],
          correctIndex: 0,
          explanation:
            "In the originate-to-distribute model, the platform transfers credit risk entirely to investors. The platform earns fee income (origination + servicing) regardless of loan performance. Investors bear all default and prepayment risk. This creates a potential incentive misalignment: the platform profits from volume, which can encourage looser underwriting. Risk retention rules (requiring the platform to retain 5%+ of the pool) are designed to partially address this.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Vintage analysis tracks a cohort of loans originated in the same period over time and is the primary tool for assessing whether a platform's underwriting quality is improving or deteriorating.",
          correct: true,
          explanation:
            "True. Vintage analysis groups loans by origination cohort and tracks cumulative loss rates (net charge-offs) over their life. By overlaying multiple vintage curves, an analyst can see whether newer vintages are performing better or worse than older ones at the same loan age — the strongest signal of underwriting drift. If a 2023 vintage reaches 4% cumulative losses by month 12 while the 2021 vintage was at 2% at the same point, underwriting standards have likely loosened.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are analyzing two marketplace lending platforms. Platform A shows Grade B loans with a 12% coupon and a 2-year vintage NCO rate of 3.5%. Platform B shows Grade B loans with a 13% coupon and a 2-year NCO rate of 6.0%. Both charge a 0.75% annual servicing fee.",
          question:
            "Which platform offers a better risk-adjusted return for Grade B investors, and approximately what is the default-adjusted net yield for each?",
          options: [
            "Platform A: ~7.75% net yield; Platform B: ~6.25% net yield — Platform A is superior",
            "Platform B: ~6.25% net yield; higher coupon makes it better regardless of NCO",
            "Platform A: ~8.5% net yield; Platform B: ~6.25% net yield — Platform A clearly wins",
            "Both are equivalent because higher-grade loans always outperform lower coupons",
          ],
          correctIndex: 0,
          explanation:
            "Default-adjusted net yield = coupon − annual NCO − servicing fee. Platform A: 12% − 1.75% (half of 3.5% 2-yr NCO annualized) − 0.75% ≈ 9.5%. Platform B: 13% − 3.0% − 0.75% ≈ 9.25%. However, annualizing the 2-year NCO: A = ~1.75%/yr, B = ~3.0%/yr gives A: 12−1.75−0.75 = 9.5% vs B: 13−3.0−0.75 = 9.25%. Platform A has superior risk-adjusted return. The correct answer (A) approximates this directional conclusion — Platform A's lower loss rate more than offsets the 1% coupon differential.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: BNPL (Buy Now Pay Later) ──────────────────────────────────
    {
      id: "fintech-lending-2",
      title: "BNPL: Buy Now Pay Later",
      description:
        "Affirm/Klarna/Afterpay mechanics, unit economics, merchant discount rate, credit risk in BNPL, and regulation challenges",
      icon: "ShoppingCart",
      xpReward: 105,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "How BNPL Works: Mechanics & Players",
          content:
            "**Buy Now Pay Later (BNPL)** is a short-term point-of-sale financing product that lets consumers split purchases into installments — typically 4 payments over 6 weeks (pay-in-4) or longer-term monthly plans.\n\n**Core mechanics:**\n- Consumer checks out, selects BNPL at payment; soft credit check takes seconds\n- BNPL provider pays the merchant the full purchase amount upfront (minus a fee)\n- Consumer repays BNPL provider in installments; no interest on pay-in-4 (penalties for late payments)\n- Longer-term plans (3–36 months) may carry APRs of 0–30% depending on merchant subsidy and credit profile\n\n**Major providers:**\n- **Afterpay** (Australia, now Block): pure pay-in-4; late fees as primary revenue\n- **Klarna** (Sweden): broadest product range — pay-in-4, pay-in-30, monthly financing; bank in Sweden\n- **Affirm** (US): longer-term financing (1–48 months); emphasizes transparency (0% if merchant subsidizes)\n- **PayPal Pay Later**: massive distribution advantage through existing checkout integration\n- **Apple Pay Later**: launched 2023 using Goldman Sachs as bank partner\n\n**Merchant discount rate (MDR) — primary revenue driver:**\n- Merchants pay 2–8% of transaction value to the BNPL provider\n- Higher than Visa/Mastercard interchange (1.5–2.5%) but justified by:\n  - Higher average order value (AOV) — BNPL shoppers spend 20–45% more per transaction\n  - Reduced cart abandonment — consumers who face sticker shock are more likely to complete purchase\n  - Access to younger, credit-card-averse demographics\n- Affirm's 2024 MDR averaged ~5.5%; gross profit per transaction is MDR minus funding cost and credit losses",
          highlight: [
            "Buy Now Pay Later",
            "merchant discount rate",
            "pay-in-4",
            "Affirm",
            "Klarna",
            "Afterpay",
            "average order value",
          ],
        },
        {
          type: "teach",
          title: "BNPL Unit Economics & Credit Risk",
          content:
            "BNPL companies live or die on **unit economics**: whether each incremental loan is profitable after funding costs, credit losses, and operating expenses.\n\n**Revenue per transaction:**\n- MDR from merchant (e.g., 5% on $200 purchase = $10.00)\n- Interest income for longer-term plans (0–30% APR)\n- Late fees from missed installments (capped at $8 in US post-CFPB guidance)\n\n**Cost per transaction:**\n- **Funding cost**: BNPL providers borrow in capital markets or use warehouse facilities to fund receivables; cost rises sharply in a rate hike cycle (2022–2024 badly hurt unit economics)\n- **Credit losses**: net charge-offs on defaulted installments\n- **Processing / interchange**: payment network fees\n- **Acquisition cost**: per-transaction marketing expense\n\n**Credit risk specifics in BNPL:**\n- **Stacking risk**: consumers using multiple BNPL providers simultaneously, creating invisible leverage — no central BNPL bureau until recently\n- **Thin-file borrowers**: BNPL targets consumers who lack credit cards; limited underwriting data\n- **Short seasoning**: loans are 6-week to 3-month duration, so loss signals emerge quickly but portfolio turnover is high\n- **Charge-off rates**: pay-in-4 NCOs typically 1–3%; longer-term plans 3–8% depending on credit quality\n- BNPL losses surged in 2022–2023 as inflation eroded consumer cash flows\n\n**Regulation challenges:**\n- US CFPB (2024): BNPL classified as 'credit cards' under Truth in Lending Act; requires billing statement disclosures, refund rights, dispute resolution\n- UK FCA: BNPL to require affordability checks and FCA authorization\n- Australia: mandatory credit checks proposed\n- EU Consumer Credit Directive: BNPL included, requiring standardized APR disclosure",
          highlight: [
            "unit economics",
            "funding cost",
            "stacking risk",
            "CFPB",
            "charge-off rates",
            "merchant discount rate",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Klarna charges merchants a 5.5% MDR on a $180 transaction. Funding cost is 2.0% of receivable, credit losses are 1.5%, and processing costs are 0.5%. What is the approximate contribution margin per transaction?",
          options: [
            "$2.70 — ($180 × 5.5%) − ($180 × 4.0%) = $9.90 − $7.20",
            "$9.90 — the full MDR revenue with no cost deductions",
            "$5.40 — MDR minus only credit losses",
            "$1.80 — contribution margin is capped at 1% for pay-in-4",
          ],
          correctIndex: 0,
          explanation:
            "Revenue = $180 × 5.5% = $9.90. Total variable costs = (2.0% + 1.5% + 0.5%) × $180 = 4.0% × $180 = $7.20. Contribution margin = $9.90 − $7.20 = $2.70 per transaction, a ~1.5% net margin on transaction value before fixed overhead. This illustrates why BNPL profitability is sensitive to funding rate changes — a 100bps rise in funding cost on a $180 loan reduces margin by $1.80 (a 67% margin hit).",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "BNPL 'stacking risk' refers to the danger that multiple BNPL providers approve the same consumer simultaneously without knowing the consumer's total BNPL exposure, creating invisible leverage.",
          correct: true,
          explanation:
            "True. Because traditional credit bureau reporting did not capture BNPL obligations (most BNPL providers historically did not report to Equifax/Experian/TransUnion), a consumer could have active pay-in-4 plans across Afterpay, Klarna, and Affirm simultaneously. Each provider sees only its own loan, underestimating total debt burden. This 'stacking' dramatically increases effective default risk, particularly for thin-file borrowers. Credit bureaus began accepting BNPL trade-line data in 2022–2024 to address this gap.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Embedded Finance ──────────────────────────────────────────
    {
      id: "fintech-lending-3",
      title: "Embedded Finance",
      description:
        "Banking-as-a-service, embedded lending (Shopify Capital), embedded insurance, revenue share vs interest income models",
      icon: "Layers",
      xpReward: 100,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Banking-as-a-Service & the Embedded Finance Stack",
          content:
            "**Embedded finance** integrates financial services (lending, payments, insurance, investments) directly into non-financial platforms — so merchants, gig-economy apps, or SaaS companies can offer credit without a banking license.\n\n**The three-layer stack:**\n\n1. **Licensed bank / charter layer** (the balance sheet)\n   - Holds deposits, issues credit, bears regulatory risk\n   - Examples: Cross River Bank, Blue Ridge Bank, Celtic Bank, Sutton Bank\n   - Often small community banks that turned their charter into a fintech-enabling platform\n\n2. **Banking-as-a-Service (BaaS) middleware** (the API layer)\n   - Abstracts the charter into developer-friendly APIs: account creation, card issuance, ACH, lending\n   - Examples: Unit, Treasury Prime, Synctera, Marqeta (cards), Galileo\n   - Charges per API call, per account, or per card issued; no credit risk exposure\n\n3. **Embedded brand** (the distribution layer)\n   - Non-bank platform (Shopify, Uber, Lyft, Toast, DoorDash) uses BaaS APIs to offer financial products under its own brand\n   - Leverages deep customer relationships and proprietary data for underwriting\n   - Revenue model: revenue share on interest income, interchange from debit/credit cards, or flat fee per product\n\n**Why it works:**\n- Distribution is the hard part of finance; platforms already have captive customer bases\n- Platforms have behavioral data (transaction history, platform engagement) that traditional banks lack\n- Lower customer acquisition cost (CAC) versus standalone fintech: customers are already on the platform",
          highlight: [
            "Banking-as-a-Service",
            "BaaS",
            "embedded finance",
            "charter layer",
            "Cross River Bank",
            "Marqeta",
            "Shopify",
          ],
        },
        {
          type: "teach",
          title: "Embedded Lending: Shopify Capital & Revenue Share Models",
          content:
            "**Embedded lending** is the most profitable form of embedded finance. Platforms with rich merchant or consumer data can underwrite loans with dramatically lower default rates than banks using traditional bureau data.\n\n**Shopify Capital — the archetype:**\n- Shopify offers merchant cash advances (MCAs) and loans to Shopify merchants\n- Underwriting uses real-time GMV (gross merchandise value) data, payment history, refund rates, and inventory velocity\n- Repayment is automated: a fixed percentage of daily Shopify sales is withheld until the advance is repaid\n- Merchants with volatile revenue prefer MCAs (payments flex with sales) over fixed bank loan repayments\n- Shopify Capital deployed $5.2B in 2023; loss rates are well below the SME industry average\n\n**Revenue models in embedded lending:**\n\n| Model | Description | Risk Bearing |\n|---|---|---|\n| **Revenue share** | Platform takes % of interest income; bank holds loan | Bank |\n| **Referral fee** | Platform earns flat fee per approved application | Bank |\n| **Synthetic balance sheet** | Platform bears first-loss tranche via credit-linked note | Platform |\n| **Full stack** | Platform is the lender (needs bank charter or partner) | Platform |\n\n**Embedded insurance:**\n- Platforms distribute insurance at point of need: renters insurance on Airbnb, device insurance on Amazon, cargo insurance on Flexport\n- Revenue = distribution commission (15–30% of premium) with no underwriting risk\n- Full-stack: platform takes underwriting risk, uses reinsurance to cap exposure\n- Examples: Lemonade (renters/pet), Root (auto), Slice (gig worker)\n\n**Key risk for platforms:**\n- **Regulatory creep**: CFPB and state regulators increasingly view embedded lenders as 'true lenders' regardless of the bank partner structure — can impose lending laws directly on the platform",
          highlight: [
            "Shopify Capital",
            "merchant cash advance",
            "revenue share",
            "embedded lending",
            "embedded insurance",
            "true lender",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Shopify Capital underwrites merchant cash advances primarily using which data advantage over traditional banks?",
          options: [
            "Real-time GMV, transaction history, and inventory data on the Shopify platform — enabling more accurate underwriting than bureau-based models",
            "FICO scores from all three credit bureaus updated daily",
            "Interest rate forecasts from the Federal Reserve to time credit expansion",
            "Merchant social media sentiment analysis and public review scores",
          ],
          correctIndex: 0,
          explanation:
            "Shopify's structural advantage is access to live operational data — daily sales (GMV), refund rates, payment processing history, and inventory — that traditional banks cannot see. This behavioral data allows Shopify Capital to predict repayment capacity far more accurately than a quarterly bank statement review. The automated daily repayment mechanism (percentage of sales withheld) also eliminates collections friction, further reducing loss rates.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "In the BaaS stack, the middleware API layer (e.g., Unit, Treasury Prime) typically bears credit risk on loans issued through its platform.",
          correct: false,
          explanation:
            "False. The BaaS middleware layer is a technology/API orchestration layer — it does not bear credit risk. Credit risk sits on the licensed bank (charter layer) or, in full-stack models, on the embedded brand platform. Middleware providers earn per-account or per-transaction fees regardless of loan performance. This is why BaaS middleware can scale quickly — it is a SaaS business model grafted onto financial infrastructure.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Alternative Credit Data ──────────────────────────────────
    {
      id: "fintech-lending-4",
      title: "Alternative Credit Data",
      description:
        "Rental payment history, utility bills, bank cash flow data, employment data, privacy concerns, and fair lending under ECOA",
      icon: "Database",
      xpReward: 110,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "What Is Alternative Credit Data?",
          content:
            "**Alternative credit data** refers to non-traditional information sources used to assess creditworthiness — going beyond the standard FICO model which relies on credit card, mortgage, and installment loan payment history.\n\n**Why it matters: the thin-file problem**\n- 45 million Americans are 'credit invisible' (no bureau file) or have insufficient data for a FICO score\n- Disproportionately affects young adults, recent immigrants, and lower-income consumers\n- Traditional models exclude these borrowers even if they reliably pay rent and utility bills\n\n**Major alternative data categories:**\n\n| Data Type | Source | Predictive Value |\n|---|---|---|\n| **Rental payments** | Experian RentBureau, CLEAR, Rental Kharma | High — monthly obligation, consistent payment behavior |\n| **Utility / telecom bills** | Experian Boost, Equifax utility reporting | Moderate — smaller amounts, partial coverage |\n| **Bank cash flow data** | Plaid, MX, Finicity — open banking APIs | Very high — income stability, spending patterns, NSF frequency |\n| **Employment & income** | Argyle, Truework, The Work Number (Equifax) | Very high — income level and stability are primary repayment drivers |\n| **Subscription payments** | Netflix, Spotify payment history | Low-moderate — small amounts, behavioral signal |\n| **Gig platform earnings** | Uber/Lyft/DoorDash income data | High for gig workers — smooths income volatility assessment |\n\n**Cash flow underwriting — the frontier:**\n- Lenders use open banking APIs (Plaid) to pull 12–24 months of bank transaction history\n- ML models analyze income regularity, average daily balance, overdraft frequency, spending ratios\n- Upstart's model uses 1,500+ variables; claims 75% lower default rates at same approval rate vs. FICO-only\n- Nova Credit translates international credit histories for recent immigrants",
          highlight: [
            "alternative credit data",
            "thin-file",
            "cash flow underwriting",
            "Plaid",
            "Upstart",
            "Experian Boost",
            "rental payments",
          ],
        },
        {
          type: "teach",
          title: "Fair Lending Law & Privacy Concerns",
          content:
            "Using alternative data expands credit access but introduces significant **fair lending** and **privacy** risks that lenders must navigate carefully.\n\n**Equal Credit Opportunity Act (ECOA) & Regulation B:**\n- Prohibits credit discrimination based on race, color, religion, national origin, sex, marital status, or age\n- 'Disparate impact' doctrine: even neutral-seeming variables violate ECOA if they disproportionately exclude protected classes without business necessity\n- Rent payment history may correlate with zip code, which correlates with race — creating potential disparate impact\n- Lenders must conduct **disparate impact testing** on any new model variable\n\n**CFPB guidance on alternative data (key tensions):**\n- CFPB supports expanding credit access via alternative data but warns against proxy discrimination\n- 2023 CFPB circular: using data that serves as a proxy for race/national origin violates ECOA even if unintentional\n- Automated model decisions must be explainable — adverse action notices must specify the top reasons for denial\n\n**Privacy concerns:**\n- Bank cash flow data requires explicit consumer consent via open banking APIs\n- Data aggregators (Plaid, MX) hold sensitive transaction data — breach risk\n- CCPA (California), GDPR (EU): consumers have the right to know what data is used and to opt out\n- Biometric and location data increasingly used in fraud detection — raises higher consent bars\n\n**Model explainability:**\n- ECOA requires adverse action notices with specific denial reasons (e.g., 'insufficient income,' not 'low ML score')\n- Black-box ML models create regulatory risk — regulators expect model documentation and fairness testing\n- SHAP values (SHapley Additive exPlanations) are increasingly used to generate feature-level explanations from complex models",
          highlight: [
            "ECOA",
            "disparate impact",
            "Regulation B",
            "CFPB",
            "adverse action notice",
            "SHAP",
            "open banking",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A fintech lender uses zip code as a variable in its credit scoring model. Even though zip code is not a protected class, regulators may challenge this practice under which legal doctrine?",
          options: [
            "Disparate impact — the variable may disproportionately exclude protected classes (racial minorities) without sufficient business justification",
            "Disparate treatment — the lender is intentionally discriminating by using geography",
            "Predatory lending — zip codes are inherently predatory underwriting tools",
            "The practice is fully legal; ECOA only prohibits explicit use of protected class characteristics",
          ],
          correctIndex: 0,
          explanation:
            "The 'disparate impact' doctrine under ECOA and the Fair Housing Act means that even facially neutral variables (zip code, educational attainment, employment type) can violate fair lending law if they disproportionately exclude protected classes and the lender cannot demonstrate sufficient business necessity. Zip codes correlate strongly with race due to historical residential segregation, making them a classic proxy variable. Lenders must conduct disparate impact analysis across any model variable.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Under ECOA's adverse action requirements, a lender that denies credit based on an ML model must provide the applicant with the specific reasons for denial, not just a generic statement that the algorithm rejected their application.",
          correct: true,
          explanation:
            "True. Regulation B (implementing ECOA) requires that applicants who are denied credit receive specific, principal reasons — such as 'insufficient income relative to obligations' or 'delinquent past or present credit obligations.' A denial notice that cites only a proprietary algorithm score or 'automated underwriting system' without specifics violates ECOA. This creates significant explainability requirements for ML-based lenders, driving adoption of SHAP values and similar feature attribution methods to generate compliant adverse action notices.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A fintech startup wants to use the following variables in its credit model: (1) rental payment history via Experian RentBureau, (2) checking account cash flow data from Plaid, (3) neighborhood homeownership rate from census data, (4) employment income from Argyle. The compliance team flags one of these as highest fair lending risk.",
          question: "Which variable presents the greatest fair lending risk and why?",
          options: [
            "Neighborhood homeownership rate — census-derived geographic data is a strong proxy for race and national origin, creating disparate impact exposure",
            "Rental payment history — renters are a protected class under ECOA",
            "Cash flow data from Plaid — open banking APIs violate ECOA privacy provisions",
            "Employment income from Argyle — employment type discriminates against protected classes",
          ],
          correctIndex: 0,
          explanation:
            "Neighborhood homeownership rate is a census-level geographic variable that closely correlates with racial and ethnic composition due to historical housing discrimination. Using it in a credit model could produce substantial disparate impact against minority applicants, particularly Black and Hispanic communities with historically lower homeownership rates. The other variables (rental history, income, cash flow) are strong, legally defensible predictors with clear business necessity. Geographic/neighborhood variables require the most careful disparate impact testing.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Credit Securitization ─────────────────────────────────────
    {
      id: "fintech-lending-5",
      title: "Credit Securitization for Fintech Loans",
      description:
        "ABS structure for fintech loans, eligibility criteria, overcollateralization, reserve funds, and rating agency methodology",
      icon: "Layers",
      xpReward: 120,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "ABS Structure: How Fintech Loans Get Securitized",
          content:
            "**Asset-backed securitization (ABS)** transforms pools of fintech loans into rated bonds — allowing platforms to recycle capital and institutional investors to access structured credit risk.\n\n**Basic ABS structure for marketplace loans:**\n\n1. **Sponsor/Originator** (e.g., LendingClub, Prosper, Upstart)\n   - Originates loans and selects a pool meeting eligibility criteria\n   - Sells the pool to a **Special Purpose Vehicle (SPV)** — a bankruptcy-remote entity\n\n2. **Special Purpose Vehicle (SPV)**\n   - Legally owns the loan pool; issues multiple tranches of notes to investors\n   - Bankruptcy-remote: if the originator fails, the SPV and its assets are protected\n   - Typically a Delaware statutory trust or LLC\n\n3. **Tranches** (waterfall of risk/return):\n   - **Class A notes** (senior): rated AAA/AA; receive interest first; lowest yield; first out in principal repayment\n   - **Class B notes** (mezzanine): rated A/BBB; absorb losses after subordinate tranches\n   - **Class C notes** (subordinate/junior): rated BB or unrated; absorb first losses; highest yield\n   - **Residual / equity tranche**: retained by originator (often required for risk retention rules); earns excess spread after all note payments\n\n4. **Credit enhancements** protect senior noteholders:\n   - **Overcollateralization (OC)**: pool face value exceeds notes issued (e.g., $110M pool backing $100M of notes)\n   - **Reserve fund**: cash account (1–3% of pool) to cover initial shortfalls\n   - **Excess spread**: difference between pool coupon rate and note coupon rate; first line of loss absorption\n   - **Subordination**: junior tranches absorb losses before senior",
          highlight: [
            "ABS",
            "Special Purpose Vehicle",
            "tranches",
            "overcollateralization",
            "reserve fund",
            "excess spread",
            "bankruptcy-remote",
          ],
        },
        {
          type: "teach",
          title: "Eligibility Criteria & Rating Agency Methodology",
          content:
            "For a loan to be included in an ABS pool, it must meet strict **eligibility criteria** — contractual rules that define what the pool can and cannot contain.\n\n**Typical eligibility criteria for consumer fintech ABS:**\n- Minimum credit score (e.g., FICO ≥ 640)\n- Maximum loan-to-income ratio (e.g., monthly payment < 35% of gross income)\n- Loan must be current (no delinquency at cut-off date)\n- Maximum individual loan size (e.g., ≤ $40,000)\n- Geographic concentration limits (e.g., no single state > 25% of pool)\n- No loans originated via certain channels flagged for higher fraud risk\n- Loan term constraints (e.g., 24–60 months only)\n\n**Rating agency methodology (Moody's/S&P/Fitch for consumer ABS):**\n\n1. **Base case loss rate**: estimated from vintage analysis, comparable pools, and economic overlays\n   - Example: base case NCO = 6.0% over deal life\n\n2. **Stress multiples by rating level**: agencies apply stress multiples to the base case\n   - AAA tranche: must survive base case × 4–5x stress (e.g., 24–30% cumulative losses)\n   - BBB tranche: must survive base case × 2–2.5x stress\n\n3. **Credit enhancement sizing**: subordination levels are set so senior tranches survive the stress scenario\n   - If AAA stress = 25%, Class A notes need 25%+ credit enhancement below them\n\n4. **Cash flow modeling**: agencies model timing of prepayments, defaults, and recoveries to ensure interest coverage under stress\n\n5. **Operational risk assessment**: rating agencies evaluate the originator's underwriting, servicing capabilities, and servicing continuity (backup servicer arrangements)\n\n**Post-2020 evolution:**\n- Rating agencies added 'COVID sensitivity' scenarios after 2020 dislocation\n- ESG overlays: some ABS pools marketed as 'financial inclusion' bonds for credit access to thin-file borrowers",
          highlight: [
            "eligibility criteria",
            "base case loss rate",
            "stress multiple",
            "credit enhancement",
            "overcollateralization",
            "backup servicer",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A fintech ABS deal has a $120M loan pool backing $100M of notes (Class A: $70M AAA-rated, Class B: $20M BBB-rated, Class C: $10M unrated). The excess spread is 4% annually. Cumulative losses of 8% hit the pool. Which tranches absorb the loss first?",
          options: [
            "Class C first (equity/junior), then Class B — senior AAA notes are protected by subordination",
            "Class A absorbs losses first as the largest tranche by dollar amount",
            "Losses are distributed pro-rata across all tranches simultaneously",
            "The reserve fund absorbs all losses before any tranche is impacted",
          ],
          correctIndex: 0,
          explanation:
            "ABS tranches follow a sequential (waterfall) loss absorption structure. Class C (junior/unrated) absorbs the first losses up to their principal amount. If Class C is exhausted, Class B (mezzanine) begins absorbing losses. Class A (senior AAA) is only impaired if losses exceed the combined Class B + Class C subordination. In this example, 8% of $120M = $9.6M in losses. Class C = $10M, so Class C absorbs the full $9.6M, protecting both Class B and Class A entirely.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An ABS Special Purpose Vehicle (SPV) is described as 'bankruptcy-remote' because even if the loan originator (sponsor) files for bankruptcy, the SPV's loan pool assets cannot be claimed by the originator's creditors.",
          correct: true,
          explanation:
            "True. The SPV's bankruptcy-remote status is a foundational feature of ABS structures. When the originator sells loans to the SPV via a 'true sale,' those assets legally belong to the SPV and are insulated from the originator's insolvency estate. This is why rating agencies can assign AAA ratings to senior ABS tranches even when the originator has a much lower corporate rating — the credit support comes from the collateral pool and credit enhancements, not the originator's balance sheet.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Investment Opportunities in Fintech Lending ───────────────
    {
      id: "fintech-lending-6",
      title: "Investment Opportunities in Fintech Lending",
      description:
        "Fintech lending equity (SoFi/LC/UPST), marketplace lending funds, rated notes, whole loan portfolios; risk/return comparison",
      icon: "TrendingUp",
      xpReward: 115,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Investing in Fintech Lending Equity",
          content:
            "Publicly traded fintech lenders offer equity exposure to the sector, but their business models and risk profiles differ significantly.\n\n**Key public equities:**\n\n| Company | Ticker | Model | Revenue Mix |\n|---|---|---|---|\n| **SoFi Technologies** | SOFI | Full-stack bank (acquired Golden Pacific) | Student refi, personal loans, home loans, banking, brokerage |\n| **LendingClub** | LC | Bank charter (acquired Radius Bank, 2021) | Personal loans; now retains some loans on balance sheet |\n| **Upstart Holdings** | UPST | Technology marketplace; does not hold loans | Fees from bank partners; ML underwriting as-a-service |\n| **Funding Circle** | FCH LN | SME lending platform, UK-listed | Business loans, UK + US |\n| **Pagaya Technologies** | PGY | AI-driven credit network for bank/fintech partners | Fee income from network partners |\n\n**Valuation frameworks:**\n- **Asset-light models** (Upstart, Pagaya): valued on revenue multiples (EV/Revenue 2–6x) or fee-income streams; no credit risk but highly cyclical fee volumes\n- **Balance sheet lenders** (SoFi, LendingClub as bank): valued on price-to-tangible-book (P/TBV 1–3x) and NIM (net interest margin) trends\n- **Key risk**: funding cost sensitivity — rising rates compress NIM and reduce demand for personal loans\n\n**Equity risk/return drivers:**\n- Loan volume growth (originations) drives near-term revenue\n- Credit quality of originated loans affects long-term loss rates and repeat business\n- Regulatory risk: CFPB actions, bank partner pressure, state licensing\n- Competition: JPMorgan Chase, Goldman Marcus, Apple Card compete directly for prime borrowers",
          highlight: [
            "SoFi",
            "LendingClub",
            "Upstart",
            "net interest margin",
            "price-to-tangible-book",
            "asset-light",
          ],
        },
        {
          type: "teach",
          title: "Debt Investment Vehicles: Funds, Notes & Whole Loans",
          content:
            "Beyond equity, investors can access fintech lending credit risk through structured debt vehicles — each with distinct risk/return profiles.\n\n**1. Marketplace lending funds:**\n- Closed-end or interval funds that invest in diversified pools of marketplace loans\n- Examples: Ares Capital Management, Owl Rock, various specialty finance funds\n- Typical target returns: 8–14% net IRR depending on credit quality tilt\n- Liquidity: quarterly redemption windows (interval funds); illiquid for closed-end\n- Management fees: 1–2% AUM; carried interest on gains above hurdle\n\n**2. Rated ABS notes:**\n- Institutional investors buy investment-grade tranches (AAA–BBB) of marketplace loan ABS\n- Spreads (2024 context): AAA consumer loan ABS +80–120bps over SOFR; BBB +200–350bps\n- Advantages: rating agency validation, structural protections (OC, reserve), defined maturity\n- Risks: servicer disruption, prepayment variability, macro credit cycle exposure\n\n**3. Whole loan portfolios:**\n- Institutional buyers purchase raw loan pools directly from originators — no SPV\n- Highest yield potential (no structuring cost, no fee to intermediary)\n- Requires own servicing capability or servicing agreement with originator\n- Due diligence: vintage analysis, model validation, eligibility audit\n- Minimum ticket: typically $10M–$100M; not accessible to retail investors\n\n**Risk/return comparison:**\n\n| Vehicle | Target Yield | Liquidity | Credit Risk | Min Investment |\n|---|---|---|---|---|\n| Fintech equity (UPST/SOFI) | Variable (equity) | Daily | High (equity) | $1 (public market) |\n| Marketplace lending fund | 8–14% | Quarterly | Medium | $250K–$1M |\n| Rated ABS notes (AAA) | SOFR + 80–120bps | Secondary market | Low | $1M |\n| Rated ABS notes (BBB) | SOFR + 200–350bps | Limited | Medium | $1M |\n| Whole loan portfolios | 12–20% gross | Illiquid | Full credit | $10M+ |",
          highlight: [
            "marketplace lending fund",
            "rated ABS notes",
            "whole loan portfolio",
            "interval fund",
            "spread",
            "SOFR",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Upstart Holdings uses a pure asset-light marketplace model, earning fees from bank partners for AI-driven underwriting. Compared to LendingClub (which now holds some loans as a bank), how does Upstart's revenue respond in a credit cycle downturn?",
          options: [
            "Upstart's fee revenue is more volatile — as bank partners pull back origination volume in downturns, Upstart's revenue drops sharply; LendingClub's NIM on held loans provides more stability",
            "Upstart is more stable — it has no credit risk exposure whatsoever",
            "Both models are equally sensitive; NIM and fees move identically through credit cycles",
            "Upstart benefits from downturns because defaults increase demand for better underwriting",
          ],
          correctIndex: 0,
          explanation:
            "Upstart's asset-light model means it earns fees only when loans are originated. In credit downturns, Upstart's bank and credit union partners dramatically reduce origination volumes — causing Upstart's fee revenue to collapse. This happened sharply in 2022: Upstart's revenue fell >60% as partners paused programs. LendingClub's bank model earns NIM on its held loan portfolio, providing steadier (though still cyclical) revenue even as new originations slow. Asset-light models have higher peak-cycle multiples but more severe trough-cycle revenue declines.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "An institutional investor is comparing two fintech lending investments: (A) a AAA-rated ABS tranche yielding SOFR + 95bps, and (B) a whole loan portfolio targeting 16% gross yield. Which statement best characterizes the key tradeoff?",
          options: [
            "Option A offers lower yield but higher structural protection and liquidity; Option B offers higher yield but requires credit expertise, servicing infrastructure, and accepts full credit risk with illiquidity",
            "Option A is always superior because rated securities are inherently safer than whole loans",
            "Option B offers the same risk as A since whole loans can be quickly sold in secondary markets",
            "Option A has higher credit risk than Option B because ABS structures use leverage",
          ],
          correctIndex: 0,
          explanation:
            "This is a classic risk/return tradeoff in structured credit. The AAA ABS tranche (Option A) has rating agency-validated structural protections (overcollateralization, subordination, reserve funds), some secondary market liquidity, and defined credit enhancement. The whole loan portfolio (Option B) offers higher gross yield but requires the investor to source loans, model credit risk independently, arrange servicing, and accept illiquidity. Whole loan investors also bear full credit risk without structural protections. Sophisticated institutional investors (pension funds, insurance companies) often hold both — ABS for liquidity and regulatory capital efficiency, whole loans for yield.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An interval fund investing in marketplace loans typically allows daily redemptions, providing investors the same liquidity as a publicly traded ETF.",
          correct: false,
          explanation:
            "False. Interval funds — commonly used to hold illiquid marketplace loans — offer limited periodic redemption windows (typically quarterly) and restrict the percentage of shares that can be redeemed in any window (often 5% of outstanding shares per quarter). This liquidity mismatch is by design: the underlying marketplace loans are not daily-liquid, so daily fund redemptions would force harmful asset sales. The SEC regulates interval funds under the Investment Company Act to ensure investors understand the redemption restrictions before investing.",
          difficulty: 1,
        },
      ],
    },
  ],
};
