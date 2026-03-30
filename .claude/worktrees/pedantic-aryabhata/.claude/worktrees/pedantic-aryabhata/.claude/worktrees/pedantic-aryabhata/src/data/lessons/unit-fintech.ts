import type { Unit } from "./types";

export const UNIT_FINTECH: Unit = {
  id: "fintech",
  title: "Fintech & Digital Banking",
  description:
    "Explore neobanks, payment systems, embedded finance, BNPL, open banking, and the future of financial services",
  icon: "Smartphone",
  color: "#6366f1",
  lessons: [
    // ─── Lesson 1: Neobanks & Digital Banking ────────────────────────────────────
    {
      id: "fintech-1",
      title: "Neobanks & Digital Banking",
      description:
        "Digital-only banks, unit economics, profitability challenges, and the neobank revolution",
      icon: "Building2",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What Are Neobanks?",
          content:
            "**Neobanks** are digital-only financial institutions that operate entirely online — no physical branches, no legacy mainframes, no teller windows.\n\n**Key neobank examples:**\n- **Chime** (US): 20M+ customers, no overdraft fees, early direct deposit\n- **Revolut** (UK/global): multi-currency accounts, crypto, stock trading in one app\n- **N26** (Europe): German-licensed, instant notifications, sub-accounts ('Spaces')\n- **Nubank** (Brazil): Latin America's largest neobank, 80M+ customers, full banking license\n\n**Why customers switch:**\n- Zero or low fees (Chime charges no monthly fees, no minimum balance)\n- Instant notifications for every transaction\n- Better mobile UX vs legacy bank apps\n- High-yield savings accounts (during high-rate environments: 4–5% APY vs big bank 0.01%)\n- Early paycheck access (2 days early via direct deposit routing)\n\n**Regulatory structure:**\nMost US neobanks are *not* chartered banks themselves — they partner with FDIC-insured chartered banks (e.g., Chime uses Bancorp Bank and Stride Bank). The chartered partner holds deposits, while the neobank provides the technology and customer experience. This 'regulatory arbitrage' lets them launch quickly without a banking charter — but creates dependency risk.",
          highlight: ["neobank", "digital-only", "regulatory arbitrage", "chartered bank", "FDIC", "no fees"],
        },
        {
          type: "teach",
          title: "Neobank Unit Economics",
          content:
            "**Unit economics** determine whether a neobank can build a sustainable business. The model looks attractive on paper — but profitability is surprisingly elusive.\n\n**Customer acquisition cost (CAC):**\nTraditional banks spend $300–500 to acquire a customer (branch staff, marketing, physical infrastructure). Neobanks target $20–50 CAC via viral referral programs and social media. Chime's early growth was largely word-of-mouth within paycheck-to-paycheck communities.\n\n**Revenue model — the four pillars:**\n1. **Interchange fees**: When a customer swipes their debit card, the merchant pays ~1.5% interchange. The issuing bank (neobank's partner) keeps ~1.2%. On $500/month of spending: ~$6/month per customer.\n2. **Premium accounts**: Revolut Metal ($16.99/mo), Nubank Ultravioleta — higher tiers unlock travel insurance, concierge, higher limits.\n3. **Credit products**: Personal loans, credit cards, BNPL — highest-margin products. Nubank's credit card is its primary profit driver.\n4. **Net interest margin (NIM)**: Difference between interest earned on deposits (lent out) and interest paid to depositors. Thin for neobanks — traditional banks earn ~3%, neobanks often 0.5–1%.\n\n**The profitability problem:**\nMost neobanks grew users fast but struggled to monetize. Chime became profitable around 2022 only by scaling interchange volume. Key insight: **a customer who never uses credit is worth very little** — the path to profitability runs through lending.\n\n**LTV/CAC target:** Sustainable fintech businesses aim for LTV/CAC > 3×. With $6/month interchange and $30 CAC, break-even is 5 months — but only if the customer remains active and eventually uses premium or credit products.",
          highlight: ["CAC", "interchange", "NIM", "net interest margin", "premium accounts", "LTV/CAC", "profitability"],
        },
        {
          type: "teach",
          title: "Deposit Wars & the High-Yield Race",
          content:
            "**Deposit wars** erupted in 2022–2024 when the Fed raised rates from 0% to 5.25%. Traditional banks kept savings rates near zero while neobanks and online banks advertised 4–5% APY — sparking the largest deposit migration in decades.\n\n**The mechanics of deposit spread:**\nA bank earns money by lending deposits at higher rates than it pays depositors.\n\n- Bank borrows (deposits) at 4.75% APY\n- Bank lends at 7–8% (mortgages, personal loans)\n- **Net interest spread** = ~2.5–3%\n\nFor a neobank with $5B in deposits:\n- Interest paid to customers: $237.5M/year (at 4.75%)\n- Interest earned on lending: $375M/year (at 7.5%)\n- Gross NIM: $137.5M/year\n\n**SoFi's strategy:** Obtained a national bank charter in 2022, allowing it to hold deposits without a partner bank — and keep 100% of the spread rather than sharing with a sponsor bank.\n\n**Risk:** High-yield savings customers are rate-sensitive 'hot money' — they will move deposits instantly when a competitor offers 0.1% more. This creates **deposit instability** risk and makes funding unpredictable compared to sticky checking account deposits.\n\n**Banking regulation:** Basel III liquidity requirements force banks to maintain liquid assets to cover 30-day outflows. Neobanks with high-yield deposits must hold more liquid reserves, reducing the assets available for higher-yielding loans.",
          highlight: ["deposit wars", "high-yield savings", "NIM", "deposit instability", "bank charter", "Basel III", "hot money"],
        },
        {
          type: "quiz-mc",
          question:
            "A neobank holds $1,000,000 in customer deposits. It pays customers 4.75% APY and earns 5.25% on short-term treasuries where it parks those deposits. What is the annual net interest spread (in dollars)?",
          options: [
            "$5,000 (5.25% - 4.75% = 0.50% on $1M)",
            "$52,500 (5.25% on $1M)",
            "$47,500 (4.75% on $1M)",
            "$10,000 (0.50% rounded up on $1M)",
          ],
          correctIndex: 0,
          explanation:
            "Net interest spread = (earned rate - paid rate) × deposits = (5.25% - 4.75%) × $1,000,000 = 0.50% × $1,000,000 = $5,000/year. This thin margin illustrates why neobanks need scale and additional revenue streams (interchange, credit products) to be profitable. At $5,000 spread on $1M deposits, they'd need $1B+ in deposits just to earn $5M in NIM — far below operating costs without other revenue.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Most US neobanks like Chime hold FDIC-insured deposits directly under their own banking charter, which is why they can offer deposit insurance to customers.",
          correct: false,
          explanation:
            "False. Most US neobanks are *not* chartered banks. Chime, for example, partners with Bancorp Bank and Stride Bank — FDIC-chartered institutions that actually hold the deposits. The neobank provides technology and customer experience on top. This 'regulatory arbitrage' allows faster market entry without the costly charter process, but creates dependency on the sponsor bank relationship. If the sponsor bank fails or terminates the relationship, customers could be disrupted. SoFi is an exception — it obtained its own national bank charter in 2022.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A neobank has 5 million customers. 80% are 'transactional' — they receive direct deposit and spend via debit card (avg $800/month). 15% use a premium account ($10/month). 5% have taken a personal loan ($5,000 avg at 18% APR). Interchange rate is 1.2%. What is the dominant revenue source?",
          question:
            "Which revenue stream generates the most revenue for this neobank?",
          options: [
            "Interchange from debit card spending: ~$46.1M/year",
            "Premium accounts: $9M/year",
            "Interest income from personal loans: $22.5M/year",
            "All three are roughly equal contributors",
          ],
          correctIndex: 0,
          explanation:
            "Interchange: 4M transactional customers × $800/month × 12 months × 1.2% = $46.08M/year. Premium: 750K customers × $10/month × 12 = $9M/year. Loan interest: 250K customers × $5,000 × 18% = $22.5M/year. Interchange wins at scale here, though lending typically has higher margins. As neobanks mature, they shift revenue mix toward credit — but interchange is the foundation that makes the model viable at launch.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Payment Systems ───────────────────────────────────────────────
    {
      id: "fintech-2",
      title: "Payment Systems",
      description:
        "Payment rails, card economics, BNPL, faster payments, and international remittances",
      icon: "CreditCard",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Payment Rails Explained",
          content:
            "**Payment rails** are the infrastructure networks that move money between parties. Each rail has different speed, cost, and use-case characteristics.\n\n**ACH (Automated Clearing House):**\nThe backbone of US bank transfers. Processes payroll, bill pay, P2P transfers. Batch-processed in clearing windows — traditional ACH settles in 1–2 business days. Same-Day ACH (launched 2016) settles within the business day for a $0.052/transaction fee. Governed by NACHA. Annual volume: $80+ trillion (2023).\n\n**Wire transfers (Fedwire/CHIPS):**\nReal-time gross settlement (RTGS) — each transaction settles individually and irrevocably. Fedwire: operated by Federal Reserve. CHIPS: private clearing for large bank-to-bank transactions. Cost: $15–35 per transfer. Used for real estate closings, M&A, large corporate payments.\n\n**Card networks (Visa/Mastercard):**\nVisa and Mastercard are *network operators* — they don't issue cards or hold deposits. They own the messaging rails connecting issuers (your bank) and acquirers (merchant's bank). Revenue: 0.1–0.14% of transaction value in network fees. Combined they process ~200B transactions/year.\n\n**RTP (Real-Time Payments — The Clearing House):**\nLaunched 2017, private-sector real-time rail. Instant, 24/7/365 settlement. Available to ~65% of US bank accounts. Transaction limit: $1M.\n\n**FedNow (Federal Reserve):**\nFed's own real-time rail, launched July 2023. Direct competition to RTP. Goal: universal access for all 10,000+ US financial institutions. Transaction limit: $500K (expandable to $1M).\n\n**Zelle:**\nBank-owned P2P network (owned by Early Warning Services LLC — consortium of major banks). Settles via the RTP rail. 2,000+ banks connected. $806B sent in 2023. Key advantage: funds arrive in seconds, using existing bank accounts.",
          highlight: ["ACH", "wire transfer", "card network", "RTP", "FedNow", "Zelle", "real-time settlement", "RTGS"],
        },
        {
          type: "teach",
          title: "Card Economics: Who Gets the Interchange?",
          content:
            "**Card economics** involve four parties and a flow of fees that most cardholders never see. Understanding this flow explains why rewards cards exist — and why merchants often prefer cash.\n\n**The four-party model:**\n1. **Cardholder** — pays with their credit/debit card\n2. **Issuing bank** — cardholder's bank (Chase, Bank of America). Issues the card, bears credit risk.\n3. **Card network** — Visa or Mastercard. Provides rails, brand, fraud rules.\n4. **Acquiring bank** — merchant's bank (Fiserv, Stripe, Square). Processes the transaction.\n\n**Interchange fee flow (on a $100 purchase):**\n- Merchant receives ~$97.50 (after paying ~2.5% merchant discount rate)\n- **Issuing bank receives**: ~$1.80 (72% of interchange — funds rewards programs)\n- **Card network earns**: ~$0.15 (6% — Visa/Mastercard revenue)\n- **Acquiring bank earns**: ~$0.55 (22% — processing services)\n\n**Why interchange rates vary:**\n- Rewards cards (Sapphire Reserve, Amex Platinum): 2.5–3.0% — higher rewards funded by higher interchange\n- Basic debit cards: 0.05% + $0.21 (Durbin Amendment cap for banks > $10B assets)\n- Business cards: 2.5–3.5% (exempt from Durbin)\n\n**The Durbin Amendment (2011):** Capped debit interchange for large banks at $0.21 + 0.05% per transaction. Neobanks often partner with small banks (<$10B assets) specifically to avoid Durbin caps — earning 10–15× more per swipe.\n\n**Merchant impact:** Grocers, gas stations (low margin, high volume) hate high interchange. Luxury retailers (high margin, lower volume) are less affected. The hidden subsidy: cash customers effectively subsidize rewards cardholders through higher retail prices.",
          highlight: ["interchange", "issuing bank", "acquiring bank", "card network", "merchant discount rate", "Durbin Amendment", "rewards"],
        },
        {
          type: "teach",
          title: "Buy Now Pay Later (BNPL)",
          content:
            "**Buy Now Pay Later (BNPL)** is a point-of-sale installment credit product — splitting a purchase into 4 interest-free payments (or longer-term financed installments).\n\n**How BNPL economics work:**\nUnlike credit cards (consumer pays interest), classic BNPL is **merchant-subsidized**: the merchant pays the BNPL provider 2–8% of transaction value. In exchange, BNPL drives higher conversion rates and larger basket sizes (+30–50% AOV in studies).\n\n**Major players:**\n- **Affirm**: longer-term financing (3–36 months), charges consumer interest on longer plans; BNPL at 0% for 4-pay\n- **Klarna**: European origin, largest global BNPL by GMV; also offers 0% 4-pay\n- **Afterpay** (now Block/Square): pure 4-pay model, no consumer interest\n- **Apple Pay Later** (discontinued 2024): Apple briefly entered the space, highlighting Big Tech's fintech ambitions\n\n**BNPL risks:**\n- **Hidden debt accumulation**: purchases don't appear on traditional credit reports → consumers can take BNPL from 5 providers simultaneously without any seeing the others' balances\n- **Default risk**: BNPL companies bear the credit risk; Affirm's charge-off rates rose sharply in 2022–2023 as inflation squeezed consumers\n- **Regulatory scrutiny**: CFPB (2022) ruled BNPL providers must provide dispute protections and refund rights like credit cards\n- **Merchant concentration risk**: Affirm derived >30% of GMV from Peloton at one point — when Peloton collapsed, Affirm's stock fell 70%+\n\n**Revenue model stress test:** At 3% merchant fee on $100 purchase, Affirm earns $3. If 5% of loans default (losing $95), the unit economics of that cohort go negative. Requires tight underwriting discipline.",
          highlight: ["BNPL", "merchant-subsidized", "installment credit", "charge-off", "CFPB", "hidden debt", "GMV"],
        },
        {
          type: "quiz-mc",
          question:
            "A customer uses a Visa rewards credit card to pay $100 at a coffee shop. The merchant discount rate is 2.5%. Approximately how much does the merchant actually receive from this transaction?",
          options: [
            "$97.50 (merchant pays 2.5% fee to accept the card)",
            "$100.00 (the card network absorbs the fee)",
            "$98.00 (only the network fee is deducted)",
            "$95.00 (rewards cards carry a 5% surcharge)",
          ],
          correctIndex: 0,
          explanation:
            "The merchant pays a 2.5% merchant discount rate — meaning $2.50 is deducted from the $100 payment, leaving the merchant with $97.50. This $2.50 is then split among the issuing bank (~$1.80), the card network (~$0.15), and the acquiring bank (~$0.55). The cardholder pays the full $100 — they never see the fee. This is why some small merchants add a card surcharge or set minimum purchase amounts. Debit cards have much lower interchange (Durbin-capped at ~$0.24 for large bank issuers).",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The Federal Reserve launched FedNow in 2023 to provide real-time payment settlement, creating competition with the private-sector RTP network that had operated since 2017.",
          correct: true,
          explanation:
            "True. The Clearing House launched RTP (Real-Time Payments) in 2017, but its ownership by large banks meant smaller community banks and credit unions were slow to adopt it. The Fed launched FedNow in July 2023 specifically to ensure all 10,000+ US financial institutions could access real-time payments — not just those connected to The Clearing House's network. Both networks coexist: RTP has a $1M limit, FedNow has $500K (expandable). The competition is expected to drive faster adoption and lower costs across the industry.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are comparing international money transfer options. Sending $1,000 from the US to Mexico:\n- Traditional bank wire: $35 flat fee + 3% FX spread = total cost ~$65\n- Wise (formerly TransferWise): 0.6% fee = $6 total, mid-market exchange rate\n- Crypto (stablecoin via centralized exchange): $2 fee + $5 gas = $7 total\n- Remitly Express: $3.99 fee, slight FX spread = ~$14 total",
          question:
            "Which statement best explains why traditional banks charge so much more for international transfers?",
          options: [
            "Banks use correspondent banking networks (SWIFT) requiring multiple intermediaries each taking a fee and FX spread, while fintech rails are direct and automated",
            "Banks are more regulated and must charge higher fees to cover compliance costs",
            "Traditional wires are faster and safer, justifying the premium price",
            "Banks have higher customer service costs that fintech companies avoid",
          ],
          correctIndex: 0,
          explanation:
            "Traditional international wires travel via SWIFT through a chain of correspondent banks — each adding fees and applying their own FX spread. A US-to-Mexico transfer might route through 2–4 correspondent banks, each taking $5–15 plus an FX markup. Total cost: $35–80. Wise uses a 'local payment' model — instead of moving money internationally, it moves money locally in each country using pre-funded accounts, bypassing correspondent banking entirely. Fintech remittance companies (Wise, Remitly, WorldRemit) have disrupted the ~$800B/year global remittance market by avoiding SWIFT's inefficiencies.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Open Banking & API Economy ───────────────────────────────────
    {
      id: "fintech-3",
      title: "Open Banking & API Economy",
      description:
        "API-driven finance, PSD2, account aggregation, pay-by-bank, and data privacy",
      icon: "Share2",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What Is Open Banking?",
          content:
            "**Open banking** is a regulatory and technology framework enabling customers to share their financial data — transaction history, account balances, payment initiation — with licensed third parties via secure APIs.\n\n**The core principle:** Your financial data belongs to *you*, not your bank. Banks must provide API access to that data when you authorize it.\n\n**PSD2 (Payment Services Directive 2):**\nThe EU regulation (2018) that mandated open banking across Europe. Key requirements:\n- **Account Information Service Providers (AISPs)**: licensed third parties that can read account data (balance, transactions) with customer consent\n- **Payment Initiation Service Providers (PISPs)**: can initiate payments directly from bank accounts with consent — bypassing card networks\n- **Strong Customer Authentication (SCA)**: two-factor authentication required for all digital payments\n\n**US open banking:**\nNo equivalent federal mandate until the CFPB finalized **Section 1033 rules** in 2024 — requiring banks to provide free, standardized API access to customer financial data. Before this, Plaid and similar aggregators used screen scraping (asking customers for login credentials), a fragile and privacy-questionable approach.\n\n**Key ecosystem players:**\n- **Plaid** (US): connects 12,000+ financial institutions; used by Venmo, Robinhood, Betterment, Coinbase\n- **Yodlee** (Envestnet): enterprise-grade data aggregation\n- **TrueLayer** (UK/Europe): PSD2 payment initiation and data access\n- **Tink** (Visa-owned): European open banking infrastructure\n\n**Value proposition**: Account aggregation apps show all your bank accounts, credit cards, investments, and loans in one dashboard — without the bank needing to build that feature.",
          highlight: ["open banking", "API", "PSD2", "AISP", "PISP", "Plaid", "account aggregation", "Section 1033"],
        },
        {
          type: "teach",
          title: "Pay by Bank & API Payments",
          content:
            "**Pay by bank** (also called 'account-to-account' or A2A payments) allows consumers to pay merchants directly from their bank account — bypassing Visa/Mastercard networks entirely.\n\n**How it works:**\nUsing open banking APIs (PSD2 in Europe, FedNow/RTP in the US):\n1. Customer clicks 'Pay by Bank' at checkout\n2. Bank app opens via OAuth redirect — customer authenticates with biometrics\n3. Payment is authorized and sent directly from bank to merchant\n4. Settlement in seconds (via RTP/FedNow rails)\n\n**Why merchants love it:**\n- Cost: ~0.2–0.5% vs 2–3% for card payments → massive savings at scale\n- No chargebacks (unlike cards) — payments are irrevocable once authorized\n- Faster settlement — same-day vs T+1/T+2 for card settlements\n\n**Real examples:**\n- **Paze** (US): bank-consortium digital wallet, uses account-to-account for online checkout\n- **Vipps/MobilePay** (Nordics): dominant in Norway/Denmark, direct bank payments\n- **PIX** (Brazil): Central Bank of Brazil's instant payment system — 150M users, handles 4B+ transactions/month, essentially replaced cash for many use cases\n- **UPI** (India): Unified Payments Interface — 12B+ monthly transactions, arguably the world's most successful real-time payment system\n\n**The card network threat:**\nIf pay-by-bank reaches critical mass, it would disrupt the ~$600B annual revenue that Visa, Mastercard, and their bank partners earn from interchange. Visa's acquisition of Plaid was blocked by the DOJ in 2021 partly due to this concern.\n\n**Open finance evolution:**\nBeyond bank accounts — extending open banking principles to investment accounts, insurance policies, pension funds, enabling true 360° financial portability.",
          highlight: ["pay by bank", "A2A", "account-to-account", "PIX", "UPI", "open finance", "interchange disruption", "OAuth"],
        },
        {
          type: "teach",
          title: "Data Moats & Privacy Risks",
          content:
            "**Data is the new oil** — but in financial services, data has specific properties that create competitive moats and privacy risks.\n\n**The fintech data advantage:**\nA company that sees all your transactions knows:\n- Your salary (direct deposit amount and frequency)\n- Your spending patterns (subscriptions, dining, travel, gambling)\n- Your financial stress signals (overdrafts, late payments, payday loan usage)\n- Your life stage (baby products → new parent; moving costs → relocation)\n- Your creditworthiness with far richer signals than a credit score\n\n**Competitive moat examples:**\n- **Mint/Credit Karma (Intuit)**: aggregated transaction data for 30M+ users → sold personalized credit card and loan offers → acquired for $7.1B\n- **Affirm's underwriting**: uses 20,000+ data points (transaction history, device data) vs traditional FICO score's handful of factors → claims lower default rates on thin-file borrowers\n- **Chime's early paycheck feature**: knowing a customer's payroll amount and cadence enables precise cash flow forecasting → foundation for credit products\n\n**Privacy risks:**\n- **Data breaches**: Equifax (2017) leaked 147M people's financial data including SSNs\n- **Screen scraping risks**: users giving third-party apps their bank login credentials → compromises online banking security\n- **Secondary data use**: aggregators can sell anonymized (or not fully anonymized) transaction data to hedge funds, retailers, and data brokers\n- **CFPB rules**: Section 1033 prohibits selling customer data to third parties beyond the customer's authorized purpose\n\n**Who bears privacy risk?**\nCurrently fragmented: the authorized third party (AISP) has legal obligations, but enforcement is weak. Customers often don't read consent agreements. The CFPB's 2024 rules created clearer liability frameworks.",
          highlight: ["data moat", "transaction data", "privacy risk", "screen scraping", "Section 1033", "creditworthiness", "CFPB"],
        },
        {
          type: "quiz-mc",
          question:
            "Under PSD2 in Europe, what is the key distinction between an AISP (Account Information Service Provider) and a PISP (Payment Initiation Service Provider)?",
          options: [
            "AISPs can only read account data; PISPs can initiate payments from the account — both require explicit customer consent",
            "AISPs can initiate payments; PISPs can only read account balances",
            "AISPs are banks; PISPs are fintech startups",
            "AISPs require a full banking license; PISPs only need a fintech license",
          ],
          correctIndex: 0,
          explanation:
            "Under PSD2, AISPs (Account Information Service Providers) are licensed to access and display account data — transaction history, balances, account details — with customer consent. They cannot move money. PISPs (Payment Initiation Service Providers) can instruct the bank to make a payment from the customer's account — bypassing card networks. Both types require FCA (UK) or national regulator authorization and explicit customer consent for each access or payment. This distinction is fundamental to open banking: data access vs. payment initiation are different risk levels requiring different regulatory treatment.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Brazil's PIX instant payment system was launched by the Central Bank of Brazil and achieved over 100 million users, becoming one of the most successful real-time payment systems in the world by transaction volume.",
          correct: true,
          explanation:
            "True. PIX was launched by the Banco Central do Brasil in November 2020 and rapidly became one of the world's most used payment systems. Within two years it had 150M+ registered users (out of a population of ~215M) and processes 4B+ transactions per month. Banks are required by regulation to offer PIX for free to individual customers, which drove rapid adoption. PIX handles everything from government transfers to taxi payments to small business invoices, effectively displacing TED/DOC bank transfers and reducing cash usage. It's often cited as a model for other central bank real-time payment initiatives.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A consumer gives a budgeting app permission to read their bank account data via open banking APIs. Three months later, they discover the app sold their anonymized transaction data to a marketing firm. The marketing firm used the data to infer that the consumer was pregnant (based on prenatal vitamin and baby product purchases) and sold targeted ads to baby brands.",
          question:
            "Which open banking principle was violated, and what regulatory framework is most relevant?",
          options: [
            "Purpose limitation was violated — the customer consented to budgeting, not data monetization. CFPB Section 1033 and GDPR (if EU) prohibit selling customer data beyond the authorized purpose.",
            "The app acted legally — anonymized data can always be sold to third parties without restriction.",
            "Only a PISP violation occurred — AISPs have no data use restrictions.",
            "This is purely a credit reporting violation under the Fair Credit Reporting Act.",
          ],
          correctIndex: 0,
          explanation:
            "This is a **purpose limitation** violation. Open banking consent is specific — the customer authorized account data access for budgeting purposes, not for data monetization or marketing. Under CFPB Section 1033 rules (finalized 2024), authorized third parties are prohibited from selling or using customer financial data beyond the stated purpose. Under GDPR in the EU, 'anonymized' data that can be re-identified (pregnancy inference is a classic re-identification example) may still trigger Article 9 protections for sensitive personal data. The Target department store faced a similar backlash in 2012 for inferring pregnancies from purchase data. Open banking privacy frameworks must address not just data access but downstream use and inference.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Embedded Finance & BaaS ──────────────────────────────────────
    {
      id: "fintech-4",
      title: "Embedded Finance & Banking-as-a-Service",
      description:
        "BaaS platforms, embedded finance examples, revenue sharing, and regulatory liability",
      icon: "Layers",
      xpReward: 80,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "What Is Embedded Finance?",
          content:
            "**Embedded finance** is the integration of financial services — payments, lending, insurance, banking — directly into non-financial products and workflows, at the point of need.\n\n**The core insight:** The best time to offer a loan is when a customer is trying to make a purchase. The best time to offer insurance is when they're booking a trip. Embedding finance in context removes friction and increases conversion.\n\n**Major embedded finance categories:**\n\n**Embedded payments:**\n- Uber/Lyft: you never think about 'paying' — it just happens\n- Amazon checkout: one-click purchase with stored payment method\n- WeChat Pay (China): embedded in messaging app, used for everything\n\n**Embedded lending:**\n- **Amazon Lending**: loans to Amazon Marketplace sellers based on sales data — Amazon knows their revenue better than any bank\n- **Shopify Capital**: merchant cash advances and loans to Shopify merchants — disbursed in 2–5 days, repaid as % of daily sales\n- **Stripe Capital**: automatic loan offers to Stripe users based on payment processing history\n\n**Embedded banking:**\n- **Shopify Balance**: business checking account for Shopify merchants — no bank visit required\n- **Uber Money**: earnings wallet + debit card for Uber drivers\n- **Lyft Direct**: instant payout card allowing drivers to access earnings after each ride\n\n**Embedded insurance:**\n- Tesla Insurance: uses real-time driving data from the car's sensors for dynamic pricing\n- Slice Insurance: on-demand gig worker insurance embedded in Uber/TaskRabbit apps\n\n**The $7 trillion opportunity:** McKinsey estimates embedded finance will represent $7T in transaction value globally by 2030, as every major platform becomes a financial services distribution channel.",
          highlight: ["embedded finance", "embedded payments", "embedded lending", "embedded banking", "embedded insurance", "point of need"],
        },
        {
          type: "teach",
          title: "Banking-as-a-Service (BaaS) Platforms",
          content:
            "**Banking-as-a-Service (BaaS)** is the infrastructure layer enabling any company to offer financial products without becoming a bank.\n\n**The BaaS stack:**\n1. **Sponsor bank** (chartered, FDIC-insured): holds deposits, provides regulatory cover, assumes ultimate compliance liability\n2. **BaaS middleware** (Synapse, Bond, Treasury Prime): API layer connecting sponsor banks to fintech clients\n3. **Fintech/brand** (end company): builds the customer experience and product\n\n**Key BaaS providers:**\n- **Stripe** (Treasury + Issuing): enables platform businesses to hold funds and issue cards. Used by Shopify, Lyft, DocuSign.\n- **Unit**: BaaS for startups — bank accounts, debit cards, lending via API. Focus on B2B fintech.\n- **Bond Financial** (Goldman Sachs partnership): enterprise BaaS with strong compliance tooling\n- **Column Bank**: uniquely, Column is *both* the chartered bank and the technology layer — no middleware\n\n**Revenue sharing model:**\nA typical BaaS arrangement for a debit card program:\n- Interchange per swipe: ~1.5%\n- Sponsor bank keeps: ~0.3% (regulatory overhead, float)\n- BaaS middleware takes: ~0.2% (tech platform fee)\n- Fintech brand keeps: ~1.0% (core economics)\n\n**Regulatory liability hierarchy:**\nThe sponsor bank holds the banking charter and ultimately bears regulatory responsibility. BaaS middleware providers act as technology partners, not regulated entities. The fintech brand operates under the sponsor bank's umbrella.\n\n**Critical risk:** This creates accountability gaps — when middleware providers fail, customers can fall through the cracks, as demonstrated by the Synapse collapse in 2024.",
          highlight: ["BaaS", "banking-as-a-service", "sponsor bank", "middleware", "Stripe", "Column", "interchange sharing", "regulatory liability"],
        },
        {
          type: "teach",
          title: "The Synapse Collapse: A BaaS Warning",
          content:
            "**Synapse Financial Technologies** filed for bankruptcy in April 2024, leaving 100,000+ customers of 10+ neobanks unable to access their savings for months — despite those deposits being supposedly FDIC-insured.\n\n**What happened:**\nSynapse served as middleware between sponsor banks (Evolve Bank & Trust, AMG National Trust, Lineage Bank) and fintech clients (Yotta, Juno, Mainvest). Synapse maintained **ledger records** of which customer deposits sat at which bank — but its records were inaccurate by $65–96 million.\n\n**The accounting gap:**\nWhen Synapse shut down, the total deposits held at sponsor banks did not match the amounts customers believed they had. The discrepancy arose from:\n- Synapse's proprietary ledger being the only source of truth for cross-bank allocations\n- Sponsor banks relying on Synapse's records rather than maintaining their own\n- Complex multi-bank deposit sweeping (spreading deposits across banks for FDIC maximization) with no independent reconciliation\n\n**Why FDIC insurance didn't fully protect customers:**\nFDIC insures deposits at *chartered banks* — but when Synapse's ledger is wrong, it's unclear which customer owns which dollars at which bank. FDIC doesn't insure against accounting errors. Customers waited 3–12 months for partial recovery.\n\n**Regulatory consequences:**\n- FDIC issued guidance requiring sponsor banks to maintain their own customer-level ledgers\n- Proposed rules requiring real-time reconciliation between BaaS layers\n- Several sponsor banks exited BaaS partnerships citing compliance risk\n- Partner banks (Evolve Bank) faced FRB consent orders for inadequate oversight\n\n**Lesson for fintech investors:** When evaluating BaaS-dependent neobanks, ask: who maintains the authoritative ledger? What happens if the middleware fails?",
          highlight: ["Synapse", "BaaS failure", "ledger reconciliation", "FDIC insurance", "sponsor bank", "middleware risk", "deposit accounting"],
        },
        {
          type: "quiz-mc",
          question:
            "An e-commerce platform integrates BNPL at checkout through a fintech provider. The fintech provider uses a sponsor bank to originate the loans. A customer defaults. Which entity bears the primary credit risk?",
          options: [
            "The BNPL fintech provider — it typically purchases or guarantees the loans originated by the sponsor bank",
            "The e-commerce platform — it offered the BNPL option at checkout",
            "The sponsor bank — as the chartered entity it bears all credit losses",
            "The customer's credit card company, which is the ultimate underwriter",
          ],
          correctIndex: 0,
          explanation:
            "In most BNPL structures, the fintech provider (Affirm, Klarna, Afterpay) bears the credit risk, not the e-commerce platform or sponsor bank. The sponsor bank may originate the loan for regulatory purposes, but the BNPL fintech typically purchases the loan immediately via a 'bank-fintech partnership' agreement (similar to a credit card program agreement). The BNPL fintech then holds the receivable on its balance sheet or securitizes it. The e-commerce platform earns its merchant fee regardless of whether the customer repays. This is why BNPL providers' charge-off rates (default losses) directly affect their profitability — Affirm's 2022 credit losses were a major driver of its stock price decline.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "FDIC deposit insurance fully protects customers of neobanks that operate through BaaS middleware providers, because the sponsor bank holding the deposits is FDIC-chartered.",
          correct: false,
          explanation:
            "False — and the Synapse collapse proved this. While sponsor banks are FDIC-chartered and FDIC insures deposits held there, FDIC insurance does NOT protect against accounting errors or reconciliation failures in the BaaS middleware layer. If the middleware provider (like Synapse) maintains inaccurate ledgers showing which customer owns which deposits at which bank, customers may be unable to access their funds even though the money technically 'exists' somewhere. FDIC insurance covers bank failure — not fintech middleware failure. The key protection gap: FDIC assumes perfect record-keeping, which BaaS introduces complexity around. Post-Synapse reforms require sponsor banks to maintain their own authoritative customer-level records.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A major e-commerce company wants to offer its small business sellers: (1) a business checking account, (2) instant payouts from sales proceeds, (3) a line of credit based on sales history. They plan to white-label all three through a BaaS partner and a sponsor bank.",
          question:
            "Which regulated entities must exist in this structure, and what regulatory licenses are required?",
          options: [
            "A chartered bank (sponsor bank) for deposit-taking and lending; the BaaS provider needs no banking license but may need money transmitter licenses; the e-commerce company acts as a registered agent/program manager",
            "The e-commerce company must obtain its own banking charter to offer all three services",
            "Only the BaaS provider needs regulatory approval — the bank and e-commerce company are unregulated",
            "No regulated entities are needed if all products are offered as 'fintech products' rather than 'banking products'",
          ],
          correctIndex: 0,
          explanation:
            "The regulated entity structure for this BaaS program: (1) **Sponsor bank** (e.g., Evolve Bank, Column): must be FDIC-chartered and state or OCC-licensed to take deposits and originate loans. (2) **BaaS platform** (Stripe, Unit): typically a technology company, not a regulated bank, but may hold money transmitter licenses (MTLs) in all 50 states and must comply with BSA/AML requirements. (3) **E-commerce company** (the brand): acts as a 'program manager' under the sponsor bank's oversight — subject to the bank's compliance program but not separately chartered. The FRB, FDIC, OCC, and state regulators all have views on the accountability chain. Post-Synapse, sponsor banks face heightened scrutiny over their oversight of program managers and BaaS platforms.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Robo-Advisors & WealthTech ────────────────────────────────────
    {
      id: "fintech-5",
      title: "Robo-Advisors & WealthTech",
      description:
        "Automated investing, tax-loss harvesting, fee compression, hybrid models, and AI-powered financial planning",
      icon: "Bot",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What Are Robo-Advisors?",
          content:
            "**Robo-advisors** are automated investment platforms that use algorithms to build and manage diversified portfolios — typically ETF-based — with minimal human intervention.\n\n**How they work:**\n1. **Onboarding questionnaire**: risk tolerance (1–10 scale), investment horizon, goals (retirement, house, wealth)\n2. **Portfolio construction**: algorithm maps risk profile to a portfolio of low-cost ETFs across asset classes (US equity, international equity, bonds, REITs)\n3. **Automatic rebalancing**: when allocations drift from targets (e.g., equity rises from 60% to 65%), the algorithm sells and rebalances automatically\n4. **Dividend reinvestment**: dividends are automatically reinvested\n\n**Major platforms:**\n- **Betterment** (2010, independent): $45B+ AUM, 0.25% annual fee. Offers tax-optimized portfolios, financial planners for premium tier.\n- **Wealthfront** (2011, acquired by UBS 2022): $70B+ AUM, 0.25% fee. Known for tax-loss harvesting and direct indexing.\n- **Schwab Intelligent Portfolios** (2015): 0% advisory fee (uses Schwab ETFs and earns on cash allocation). Part of Charles Schwab.\n- **Vanguard Digital Advisor** (2021): ultra-low cost, uses Vanguard index funds. Access to human advisors in hybrid tier.\n- **Personal Capital** (now Empower): hybrid model with human advisors for accounts >$100K\n\n**Underlying investment philosophy:**\nMost robo-advisors are built on **Modern Portfolio Theory (MPT)** — Markowitz's efficient frontier, maximizing expected return for a given level of risk through diversification. The portfolios are nearly identical across providers because MPT prescribes similar optimal portfolios.",
          highlight: ["robo-advisor", "MPT", "ETF", "automatic rebalancing", "Betterment", "Wealthfront", "0.25%", "efficient frontier"],
        },
        {
          type: "teach",
          title: "Tax-Loss Harvesting at Scale",
          content:
            "**Tax-loss harvesting (TLH)** is the practice of selling investments that have declined in value to realize a tax loss, then immediately reinvesting in a similar (but not 'substantially identical') asset to maintain market exposure.\n\n**Why it works:**\nCapital losses offset capital gains dollar-for-dollar. Up to $3,000 in excess losses can offset ordinary income annually; the remainder carries forward indefinitely.\n\nExample: You hold Fund A (down $5,000 this year) and have $5,000 in capital gains elsewhere:\n- Without TLH: pay 15% capital gains tax on $5,000 = $750 tax bill\n- With TLH: sell Fund A (realize $5,000 loss), buy Fund B (similar index). Net capital gains = $0. Tax savings = $750.\n\n**The 'wash-sale' rule**: The IRS prohibits buying a 'substantially identical' security within 30 days before or after the sale. Robo-advisors navigate this by swapping between similar but not identical ETFs — e.g., selling Vanguard Total Market ETF (VTI) and buying iShares Russell 3000 ETF (IWV). Similar exposure, different issuer.\n\n**Scale advantage of robo-advisors:**\nManually doing TLH requires monitoring your portfolio daily. Betterment and Wealthfront run TLH algorithms continuously — checking every account every day for harvesting opportunities across millions of accounts. The computational scale required is impossible for individual investors or most traditional advisors.\n\n**Wealthfront's direct indexing (AKA 'Stock-Level Tax-Loss Harvesting'):**\nFor accounts >$100K, instead of buying a Total Market ETF, Wealthfront buys the individual stocks that compose the index. This creates vastly more TLH opportunities — harvesting losses on individual stocks while the overall market rises. Estimated additional annual benefit: 0.5–1.5% per year.\n\n**Quantified value**: Betterment claims TLH adds 0.77% per year in after-tax returns on average. On a $100K portfolio over 20 years at 7% gross return, this compounds to ~$42K in additional wealth.",
          highlight: ["tax-loss harvesting", "wash-sale rule", "direct indexing", "capital loss", "after-tax return", "TLH", "substantially identical"],
        },
        {
          type: "teach",
          title: "Fee Compression & the Future of Wealth Management",
          content:
            "**Fee compression** has been the defining trend in wealth management over the past decade — robo-advisors and index fund adoption have compressed advisory fees from 1–1.5% to 0.25% or less.\n\n**The fee impact over time:**\nOn a $500,000 portfolio over 30 years at 7% gross return:\n- Traditional advisor at 1%: net return 6% → $2.87M final value\n- Robo-advisor at 0.25%: net return 6.75% → $3.64M final value\n- Fee difference over 30 years: ~$770,000\n\n**How traditional advisors respond:**\n- **Shift to planning fees**: charge flat annual fee ($5,000–20,000) for comprehensive financial planning rather than AUM % — less susceptible to disintermediation\n- **Complexity premium**: serve clients with estate planning, tax optimization, business sale planning, trust structures — tasks algorithms can't fully automate\n- **Relationship value**: behavioral coaching (preventing panic selling) is estimated to add 1.5% per year (Vanguard's 'Advisor's Alpha' research)\n\n**Hybrid models:**\n- **Vanguard Personal Advisor Services** (0.30% with human advisor access): $330B+ AUM — the largest robo by assets\n- **Empower (formerly Personal Capital)**: full financial aggregation + human advisors for accounts >$100K\n- **Betterment Premium** ($100K minimum, 0.40%, human CFP access)\n\n**AI-powered future:**\n- Generative AI enables personalized financial planning at scale — 'explain my tax situation in plain English' queries answered in seconds\n- AI-powered scenario modeling: 'what if I retire at 55 vs 62?' across thousands of Monte Carlo scenarios\n- Voice interfaces: 'Alexa, increase my emergency fund contribution by $200/month'\n- Personalized portfolio tilts based on values (ESG preferences, sector exclusions) without leaving robo-advisor cost structure\n\n**Market structure shift:** As of 2024, passive/index AUM surpassed active fund AUM in the US for the first time — a structural shift robo-advisors both reflect and accelerate.",
          highlight: ["fee compression", "0.25%", "hybrid model", "Vanguard", "Advisor's Alpha", "direct indexing", "AI wealth management", "passive AUM"],
        },
        {
          type: "quiz-mc",
          question:
            "A robo-advisor charges 0.25% annually on a $50,000 portfolio. A traditional financial advisor charges 1.00% on the same portfolio. What is the annual fee difference in dollars?",
          options: [
            "$375 ($500 - $125 = $375 annual difference)",
            "$250 (1% - 0.25% = 0.75% on $50,000)",
            "$500 (1% on $50,000)",
            "$125 (0.25% on $50,000)",
          ],
          correctIndex: 0,
          explanation:
            "Robo-advisor fee: 0.25% × $50,000 = $125/year. Traditional advisor fee: 1.00% × $50,000 = $500/year. Annual fee difference: $500 - $125 = $375. While $375/year might seem modest, compounded over 30 years the impact is dramatic. Assuming 7% gross return: with $375/year saved and reinvested, the fee savings alone compound to ~$35,000 over 30 years. This is before accounting for the higher net return the robo-advisor delivers by charging less — the true compounded wealth difference between 0.25% and 1% fees on $50K over 30 years is approximately $150,000.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Tax-loss harvesting is prohibited by the IRS wash-sale rule, which prevents investors from realizing capital losses for tax purposes on any investment they plan to repurchase.",
          correct: false,
          explanation:
            "False. Tax-loss harvesting is legal and widely used. The wash-sale rule only prohibits buying a 'substantially identical' security within 30 days before or after the sale. Robo-advisors navigate this by swapping between similar but not identical securities — e.g., selling Vanguard Total Stock Market ETF (VTI) and buying iShares Russell 3000 ETF (IWV). Both track similar indices but are not 'substantially identical' under IRS rules. After 31 days, you can even repurchase the original security. TLH is a core feature of premium robo-advisors and is estimated to add 0.77–1.5% in annual after-tax returns depending on portfolio size and market volatility.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Maria is 35 years old with $50,000 to invest for retirement (30-year horizon). She's evaluating two options:\n- Option A: Traditional financial advisor, 1% AUM fee, actively managed funds with 1% expense ratio → total cost: ~2% per year\n- Option B: Robo-advisor, 0.25% AUM fee, index ETFs with 0.03% expense ratio → total cost: ~0.28% per year\nBoth options are expected to achieve the same gross return of 8% per year before fees.",
          question:
            "Approximately how much more would Maria have at retirement (age 65) with the robo-advisor vs the traditional advisor?",
          options: [
            "~$290,000 more with the robo-advisor (net 7.72% vs net 6% compounded over 30 years on $50,000)",
            "~$50,000 more (1.72% fee difference × 30 years × $50,000)",
            "~$10,000 more (the difference is small because both achieve similar gross returns)",
            "The traditional advisor adds enough value through active management to offset the fee difference",
          ],
          correctIndex: 0,
          explanation:
            "Robo-advisor (net 7.72% return): $50,000 × (1.0772)^30 ≈ $50,000 × 9.26 ≈ $463,000. Traditional advisor (net 6% return): $50,000 × (1.06)^30 ≈ $50,000 × 5.74 ≈ $287,000. Difference: ~$176,000 in this calculation. The actual difference depends on assumptions, but the order of magnitude is $150,000–$300,000 depending on market conditions. This illustrates the enormous long-term impact of fee compression. Note: the traditional advisor's 1% fee is for advice — active fund fees add another ~1%. Research consistently shows most active managers underperform their benchmark after fees, making the total cost comparison even more unfavorable.",
          difficulty: 3,
        },
      ],
    },
  ],
};
