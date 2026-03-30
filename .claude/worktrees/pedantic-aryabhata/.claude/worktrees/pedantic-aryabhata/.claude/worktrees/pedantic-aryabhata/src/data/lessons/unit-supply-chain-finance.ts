import type { Unit } from "./types";

export const UNIT_SUPPLY_CHAIN_FINANCE: Unit = {
  id: "supply-chain-finance",
  title: "Supply Chain Finance",
  description:
    "Explore how modern supply chain finance programs unlock working capital, accelerate supplier payments, and create value across global trade networks — from reverse factoring and dynamic discounting to securitization and sustainability-linked financing",
  icon: "",
  color: "#0f766e",
  lessons: [
    // ─── Lesson 1: What is Supply Chain Finance? ────────────────────────────────
    {
      id: "supply-chain-finance-1",
      title: " What is Supply Chain Finance?",
      description:
        "Working capital optimization, buyer/supplier dynamics, reverse factoring, and why SCF programs benefit the entire supply chain ecosystem",
      icon: "BookOpen",
      xpReward: 80,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "The Working Capital Gap",
          content:
            "Every trade transaction creates a **working capital tension**: buyers want to pay later, suppliers need to get paid sooner. This gap is the engine behind supply chain finance.\n\n**The basic dynamics:**\n- A large retailer orders $5 million of goods from a supplier\n- The retailer's payment terms are Net 90 — they will pay in 90 days\n- The supplier must fund raw materials, labor, and production today\n- The supplier borrows at 8% per year to bridge that 90-day gap — costing $100,000\n\n**The structural imbalance:**\nLarge buyers have significant bargaining power and routinely extend payment terms to conserve their own cash. In industries like retail and automotive, 60–120 day payment terms are standard. For small and mid-sized suppliers, waiting 90 days is expensive and sometimes dangerous.\n\n**Working capital optimization:**\nSupply chain finance (SCF) programs aim to optimize the working capital position of ALL parties simultaneously:\n- **Buyers** preserve or extend their Days Payable Outstanding (DPO) — keeping cash longer\n- **Suppliers** receive early payment and reduce their Days Sales Outstanding (DSO)\n- **Financiers** (banks, fintechs) earn a spread for providing the bridging capital\n\n**Why this is possible:**\nThe buyer's credit rating is typically far stronger than the supplier's. A supplier borrowing on its own credit might pay 8%. But an SCF program backed by the buyer's credit quality might offer that same supplier 3–4% — saving everyone money and reducing systemic supply chain risk.",
          highlight: ["working capital", "Days Payable Outstanding", "Days Sales Outstanding", "payment terms", "credit rating"],
        },
        {
          type: "teach",
          title: "Reverse Factoring — The Anchor Buyer Model",
          content:
            "**Reverse factoring** (also called approved payables financing) is the most common SCF structure. Unlike traditional factoring where the supplier initiates financing, reverse factoring is driven by the buyer.\n\n**How reverse factoring works:**\n1. Buyer places an order and receives goods/services from a supplier\n2. Buyer approves the invoice — confirming the amount is correct and will be paid\n3. Buyer notifies the SCF platform and financing bank of the approved invoice\n4. Supplier logs into the platform and can request early payment at a discount\n5. Bank pays the supplier immediately (e.g., 99.5% of invoice value on Day 5)\n6. Buyer pays the bank the full invoice amount on the original due date (Day 90)\n\n**The key insight — buyer-driven credit:**\nThe financing is priced off the **buyer's** credit quality, not the supplier's. A Fortune 500 buyer (AA-rated) can get financing at 2.5%. That rate is passed to the supplier as an alternative to waiting.\n\n**Who benefits and how:**\n- **Supplier**: Gets paid in 5 days instead of 90, improving cash flow dramatically. Accesses credit much cheaper than their own borrowing rate.\n- **Buyer**: Can extend payment terms from 60 to 90+ days without harming supplier relationships. Sometimes earns a platform fee or rebate.\n- **Bank**: Earns a spread (0.5–1.5% annualized) on high-quality, short-duration assets with minimal credit risk.\n\n**Program scale:** Global reverse factoring volumes exceed $500 billion annually and are growing 15–20% per year as more large corporations launch SCF programs.",
          highlight: ["reverse factoring", "approved payables", "buyer's credit", "early payment", "discount rate"],
        },
        {
          type: "teach",
          title: "Buyer-Supplier Dynamics and Program Design",
          content:
            "Successful SCF programs require careful attention to relationship dynamics, incentive alignment, and program structure.\n\n**Voluntary vs mandated participation:**\nMost SCF programs are voluntary for suppliers — they can choose to take early payment when they need liquidity, or wait for the original payment date when they don't. This flexibility is a key selling point.\n\n**Supplier segmentation:**\nNot all suppliers benefit equally:\n- **Large Tier 1 suppliers**: May have strong balance sheets and prefer standard terms. SCF offers marginal benefit.\n- **Mid-size suppliers**: Often the sweet spot — meaningful cash flow needs but not at crisis level. Most active users.\n- **Small suppliers**: Highest need but sometimes lack the technical sophistication to onboard platforms.\n\n**Onboarding and platform technology:**\nModern SCF runs on digital platforms (C2FO, Taulia, Greensill, HSBC ConnectedMoney). Suppliers access a dashboard showing approved invoices, current early payment rates, and cash advance options. Integration with buyer ERP systems (SAP, Oracle) enables automated invoice approval.\n\n**Pricing mechanics:**\nEarly payment discount = Invoice Amount x Annual Rate x (Days Remaining / 365)\n\nExample: $1,000,000 invoice with 80 days remaining, 3% annual rate:\n= $1,000,000 x 0.03 x (80/365) = $6,575 discount\nSupplier receives $993,425 immediately instead of $1,000,000 in 80 days.\n\n**Accounting treatment for buyers:**\nSupply chain payables are generally classified as trade payables (not financial debt), which helps buyers preserve their debt capacity and credit ratios — a significant structural incentive.",
          highlight: ["voluntary participation", "supplier segmentation", "pricing mechanics", "ERP integration", "trade payables"],
        },
        {
          type: "quiz-mc",
          question:
            "A supplier has an approved invoice for $500,000 with 60 days remaining. The SCF platform offers early payment at a 2.4% annual discount rate. How much will the supplier receive if they take early payment today?",
          options: [
            "$498,027",
            "$488,000",
            "$496,000",
            "$495,000",
          ],
          correctIndex: 0,
          explanation:
            "Discount = $500,000 x 0.024 x (60/365) = $500,000 x 0.024 x 0.1644 = $1,973. Supplier receives $500,000 - $1,973 = $498,027. The formula is: Discount = Invoice x Annual Rate x (Days / 365). This small discount gives the supplier immediate cash at a rate far below typical small-business borrowing costs.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In a reverse factoring program, the financing rate offered to suppliers is based primarily on the supplier's own credit rating.",
          correct: false,
          explanation:
            "In reverse factoring, financing is priced off the BUYER's credit rating, not the supplier's. This is the defining feature of the structure. Because the buyer has approved the invoice and committed to pay, the credit risk is effectively the buyer's. A small supplier with a weak balance sheet can access financing at near-investment-grade rates simply because their large buyer has excellent credit. This is why SCF programs are so valuable to small and mid-sized suppliers.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 2: Invoice Financing & Factoring ──────────────────────────────
    {
      id: "supply-chain-finance-2",
      title: "🧾 Invoice Financing & Factoring",
      description:
        "Accounts receivable mechanics, advance rates, the factoring lifecycle, recourse vs non-recourse structures, and how forfaiting differs from factoring",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Accounts Receivable as a Financial Asset",
          content:
            "When a business delivers goods or services on credit, it creates an **account receivable** — a legally enforceable right to collect payment. This asset has economic value that can be monetized immediately rather than waiting for the payment date.\n\n**The receivables lifecycle:**\n1. Seller ships goods, invoice issued for $200,000, Net 60\n2. Buyer receives goods and confirms they are acceptable\n3. Invoice sits on seller's balance sheet as accounts receivable\n4. On Day 60, buyer pays — receivable is extinguished\n\n**Why sellers want early cash:**\n- Growth requires inventory and payroll funding today\n- Seasonal businesses face mismatch between when they sell and when customers pay\n- Credit constraints make bank borrowing difficult or expensive\n- Cash is worth more today than 60 days from now (time value of money)\n\n**The receivable as collateral:**\nReceivables have several properties that make them attractive to financiers:\n- **Self-liquidating**: They mature into cash on a predictable schedule\n- **Diversifiable**: A pool of many receivables has lower risk than any single one\n- **Observable**: Invoice amounts and due dates are documented\n- **Separable**: Receivables can be legally assigned or sold to third parties\n\n**Advance rate:**\nFinanciers do not advance 100% of face value. The **advance rate** is typically 70-95%, reflecting:\n- Potential buyer disputes or returns\n- Dilution from credit notes and discounts\n- Time value over the collection period\n- Credit risk of the underlying buyer population",
          highlight: ["accounts receivable", "advance rate", "self-liquidating", "invoice", "time value"],
        },
        {
          type: "teach",
          title: "Factoring — Structure and Mechanics",
          content:
            "**Factoring** is the sale of accounts receivable to a third-party financier (the factor) at a discount. It is one of the oldest forms of trade finance, dating back to ancient Mesopotamia.\n\n**The factoring transaction:**\n1. Seller (client) delivers goods and issues invoices\n2. Seller sells (assigns) invoices to the factor\n3. Factor advances 80–90% of invoice face value immediately\n4. Factor takes over collection — contacts buyers directly\n5. When buyer pays, factor remits the reserve (10–20%) minus fees to the seller\n\n**Recourse vs non-recourse factoring:**\n- **Recourse factoring**: If the buyer does not pay, the seller must buy back the invoice. The factor only covers credit risk up to the advance. Lower cost — factor does not bear buyer default risk.\n- **Non-recourse factoring**: If the buyer defaults (not disputes), the factor absorbs the loss. Higher cost — the factor's fee includes credit risk insurance. Seller gets genuine balance sheet relief.\n\n**Key costs in factoring:**\n- **Discount fee**: 1–5% of invoice value, covering time cost and profit\n- **Service fee**: 0.5–2% for collection services, credit checks, administration\n- **Reserve**: 10–20% held back until buyer pays\n\n**Who uses factoring:**\nFactoring is most common among small and mid-sized businesses that:\n- Lack access to bank credit lines\n- Need immediate cash rather than waiting 30–90 days\n- Want to outsource collections to a specialist\n- Are growing faster than their balance sheet can support\n\n**The notification question:**\nIn **disclosed factoring**, buyers know their invoices have been sold to a factor. In **undisclosed (confidential) factoring**, buyers pay the seller as normal — the seller remits to the factor behind the scenes.",
          highlight: ["factoring", "advance rate", "recourse", "non-recourse", "discount fee", "reserve"],
        },
        {
          type: "teach",
          title: "Forfaiting — Long-Tenor Trade Finance",
          content:
            "**Forfaiting** is a specialized form of trade receivable financing for medium-to-long-term export transactions, typically involving capital goods (machinery, infrastructure, technology).\n\n**How forfaiting differs from factoring:**\nFactoring is typically short-term (30–180 days), for domestic or export transactions, often with recourse, and covers many small invoices. Forfaiting is medium-to-long term (1–7 years), primarily for exports, always without recourse, and covers individual large transactions backed by bank guarantees or letters of credit.\n\n**The forfaiting mechanics:**\nIn a typical forfaiting deal:\n1. Exporter in Germany sells $10 million of equipment to a buyer in Brazil\n2. Brazilian buyer's bank issues a **letter of credit** (LC) or **avalised bill** guaranteeing payment in installments over 5 years\n3. German exporter sells these guaranteed payment obligations to a forfaiter (bank or specialist firm) at a discount\n4. Forfaiter pays the exporter cash immediately — without recourse\n5. Forfaiter holds the instruments until maturity (or sells them in the forfaiting secondary market)\n\n**The discount rate in forfaiting:**\nDiscount = Face Value x [r x T / (1 + r x T)]\nWhere r = discount rate (based on SOFR + country risk premium) and T = time to maturity in years\n\n**Why forfaiting matters:**\nFor exporters entering emerging markets, forfaiting eliminates political risk, transfer risk, and buyer credit risk in a single transaction. It converts a multi-year receivable into immediate cash, enabling the exporter to pursue the next deal.",
          highlight: ["forfaiting", "letter of credit", "without recourse", "export", "avalised bill", "secondary market"],
        },
        {
          type: "quiz-mc",
          question:
            "A company sells $300,000 of invoices to a factor with an 85% advance rate, a 2% discount fee, and a 1% service fee. How much does the company receive immediately at funding?",
          options: [
            "$255,000",
            "$291,000",
            "$246,000",
            "$285,000",
          ],
          correctIndex: 0,
          explanation:
            "The advance rate determines the initial payment: $300,000 x 85% = $255,000 advanced immediately. The fees (2% discount + 1% service = $9,000 total) are typically deducted from the reserve when the buyer pays, not from the initial advance. So the company receives $255,000 now. When buyers pay the full $300,000, the factor remits the $45,000 reserve minus $9,000 in fees = $36,000 back to the company. Total received: $291,000 out of $300,000 invoiced.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In non-recourse factoring, if the buyer goes bankrupt and cannot pay, the seller (original invoice owner) must repurchase the invoice from the factor.",
          correct: false,
          explanation:
            "This describes recourse factoring, not non-recourse. In non-recourse factoring, the factor absorbs the loss if the buyer defaults due to insolvency. The seller has no obligation to buy back the invoice. This is the key distinction and the main reason non-recourse factoring is more expensive — the factor is taking on genuine credit risk and charges a premium for it. Note: non-recourse typically only covers buyer DEFAULT (bankruptcy), not buyer DISPUTES (claims the goods were defective), which usually remain the seller's responsibility.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Dynamic Discounting ────────────────────────────────────────
    {
      id: "supply-chain-finance-3",
      title: " Dynamic Discounting",
      description:
        "Early payment programs, how buyers deploy excess cash, supplier cost of capital arbitrage, and the key differences between dynamic discounting and reverse factoring",
      icon: "Zap",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Early Payment Opportunity",
          content:
            "**Dynamic discounting** is an early payment program where the BUYER funds early payments from its own cash — rather than using a third-party bank. The earlier the supplier requests payment, the larger the discount they offer.\n\n**The core concept — sliding scale pricing:**\nUnlike static early payment terms (e.g., 2/10 Net 30 — 2% discount if paid in 10 days), dynamic discounting allows the discount rate to vary based on when payment is requested:\n\n- Day 5: Supplier offers 3.0% annualized discount — 5-day advance\n- Day 20: Supplier offers 2.8% annualized discount — 20-day advance\n- Day 45: Supplier offers 2.5% annualized discount — 45-day advance\n- Day 75 (original due date): No discount needed\n\n**The buyer's perspective:**\nFor a cash-rich buyer, dynamic discounting is a deployment mechanism for idle cash:\n- Money sitting in a corporate treasury account earns near-zero (or negative real) returns\n- Deploying that cash through dynamic discounting earns 2–4% annualized — risk-free, because the obligation to pay already exists\n- The buyer is simply accelerating a payment they were going to make anyway\n- Return on cash = spread between cash yield and early payment discount rate\n\n**Why this is not a loan:**\nFrom an accounting perspective, dynamic discounting is simply an early payment of a trade payable — not a financing transaction. The buyer's Days Payable Outstanding (DPO) decreases, but no debt appears on the balance sheet.",
          highlight: ["dynamic discounting", "sliding scale", "early payment", "Days Payable Outstanding", "idle cash"],
        },
        {
          type: "teach",
          title: "How Buyers Benefit — The Cash Deployment Calculus",
          content:
            "A cash-rich corporate treasury can earn attractive risk-adjusted returns through dynamic discounting programs. Understanding the math helps explain why Fortune 500 companies invest millions in platform technology to run these programs.\n\n**The opportunity cost calculation:**\nBuyer has $200 million in cash earning 0.5% in a money market fund.\nUsing $50 million for dynamic discounting at an average 3% annualized rate:\n\n- Opportunity cost of cash: 0.5% on $50M = $250,000 per year\n- Dynamic discounting return: 3.0% on $50M = $1,500,000 per year\n- Net benefit: $1,250,000 per year — essentially risk-free\n\n**Strategic benefits beyond return:**\n1. **Supply chain resilience**: Financially healthy suppliers are less likely to fail, cut quality, or seek other customers. Early payment programs literally fund supplier stability.\n2. **Negotiating leverage**: Offering a well-designed program can justify requesting longer standard payment terms (e.g., extending from Net 60 to Net 90), improving the buyer's own working capital.\n3. **Supplier loyalty**: Suppliers who participate in a buyer's SCF program are more deeply integrated and less likely to defect to competitors.\n4. **ESG metrics**: Many sustainability frameworks track supply chain financial health. Programs that help small suppliers can improve ESG scores.\n\n**Dynamic discounting vs reverse factoring:**\n- **Dynamic discounting**: Buyer funds payments. No bank involved. Buyer earns discount.\n- **Reverse factoring**: Bank funds payments. Buyer pays bank at original terms. Bank earns spread.\n\nBuyers choose dynamic discounting when they have excess cash and want to earn a return. They choose reverse factoring when they want to extend payment terms without disrupting supplier cash flow.",
          highlight: ["cash deployment", "risk-adjusted return", "supply chain resilience", "dynamic discounting", "reverse factoring"],
        },
        {
          type: "teach",
          title: "Supplier Cost of Capital Arbitrage",
          content:
            "The economic engine behind supply chain finance programs is a **cost of capital arbitrage**: large buyers can access capital cheaply, while their suppliers often cannot.\n\n**The arbitrage in numbers:**\nAssume:\n- Buyer's cost of capital: 3% (AA-rated investment grade)\n- Small supplier's cost of capital: 9% (small business borrowing rate)\n- Invoice: $1,000,000, due in 90 days\n\nFor the SUPPLIER:\n- Without SCF: Wait 90 days, or borrow $1M at 9% for 90 days = $22,192 in interest cost\n- With SCF at 3% annualized: Pay $7,397 discount to receive cash 90 days early\n- Supplier saves $14,795 — a 67% reduction in financing cost\n\nFor the BUYER (reverse factoring model):\n- Bank advances $1M to supplier at 3%\n- Bank earns $7,397 over 90 days\n- Buyer keeps $1M in its treasury for 90 days — earns return on that cash\n- Buyer's DPO extends, improving working capital metrics\n\n**The value creation is REAL:**\nThis is not a zero-sum transaction. The cost of capital arbitrage generates genuine economic value:\n- The financial system intermediates between cheap and expensive credit\n- Suppliers grow more efficiently by reducing borrowing costs\n- Supply chains become more resilient\n- Banks earn a spread on high-quality, short-duration assets\n\n**Platform technology as enabler:**\nWithout digital platforms, the transaction costs of matching individual buyer invoices to supplier funding requests would make small transactions uneconomical. Platforms like Taulia, C2FO, and SAP Ariba automate invoice approval, rate setting, and settlement — making millions of micro-transactions commercially viable.",
          highlight: ["cost of capital arbitrage", "borrowing rate", "DPO", "platform technology", "value creation"],
        },
        {
          type: "quiz-mc",
          question:
            "A buyer has $100 million in cash earning 0.8% in a money market fund. They deploy $30 million in a dynamic discounting program, earning an average discount of 3.6% annualized. What is the net annual benefit of the program on the deployed cash?",
          options: [
            "$840,000",
            "$1,080,000",
            "$240,000",
            "$360,000",
          ],
          correctIndex: 0,
          explanation:
            "Return from dynamic discounting: $30M x 3.6% = $1,080,000. Opportunity cost of that cash (what it would have earned in money market): $30M x 0.8% = $240,000. Net benefit = $1,080,000 - $240,000 = $840,000 per year. This is essentially risk-free incremental return because the buyer was already going to pay these invoices — they are simply paying earlier in exchange for a discount.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Dynamic discounting increases a buyer's debt obligations because the buyer is effectively lending money to its suppliers.",
          correct: false,
          explanation:
            "Dynamic discounting does NOT create debt for the buyer. It is simply an early payment of a trade payable — an obligation that already existed. The buyer's balance sheet shows a reduction in cash and a corresponding reduction in accounts payable (both decrease). No new liability is created. This accounting treatment is one reason dynamic discounting is attractive versus other financing structures: it keeps the buyer's balance sheet clean and preserves debt capacity.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Trade Receivables Securitization ───────────────────────────
    {
      id: "supply-chain-finance-4",
      title: "📦 Trade Receivables Securitization",
      description:
        "Pooling receivables into ABS structures, credit enhancement techniques, off-balance sheet treatment, rating agency considerations, and how large corporates access capital markets through their receivables",
      icon: "Database",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "From Individual Receivables to a Securitized Pool",
          content:
            "**Trade receivables securitization** transforms a portfolio of individual invoices into a capital markets instrument — allowing corporations to access institutional investor capital at scale.\n\n**Why securitize instead of factoring?**\nFor a small business, individual invoice factoring is adequate. But a large corporation with $2 billion in annual receivables needs a more efficient structure:\n- Factoring a single $2B pool to one bank creates concentration risk\n- Capital markets securitization allows selling to hundreds of investors\n- Securitization typically offers lower financing costs than bank credit facilities\n- The structure can be self-replenishing (revolving) — as old invoices are collected, new ones are added\n\n**The basic securitization structure:**\n1. **Originator** (the company) generates trade receivables from selling goods/services\n2. A **Special Purpose Vehicle (SPV)** is created — a legally separate entity\n3. The Originator sells receivables to the SPV (true sale analysis)\n4. The SPV issues **Asset-Backed Commercial Paper (ABCP)** or notes to capital markets investors\n5. Investors receive principal + interest from collections on the receivables\n6. The SPV replenishes by buying new receivables as old ones are collected\n\n**The revolving feature:**\nMost trade receivables ABS structures are revolving — the proceeds from maturing receivables are used to purchase new receivables, maintaining the pool size. This continues until the revolving period ends and the structure moves into amortization.\n\n**Eligible receivables criteria:**\nNot all receivables qualify for securitization pools. Common eligibility filters:\n- Aged within 90–180 days\n- No buyer disputes or credit notes outstanding\n- Diversified by buyer, geography, and industry\n- Buyer meets minimum credit quality thresholds",
          highlight: ["securitization", "Special Purpose Vehicle", "ABCP", "revolving", "eligible receivables"],
        },
        {
          type: "teach",
          title: "Credit Enhancement and Tranching",
          content:
            "**Credit enhancement** is the set of structural features that protect investors from losses and enable the securitization to achieve a high credit rating despite the mixed quality of underlying receivables.\n\n**Types of credit enhancement:**\n\n**1. Overcollateralization:**\nThe SPV holds more receivables than the value of notes issued. If $100M in notes is outstanding, the SPV might hold $115M in receivables. The extra $15M (the haircut) absorbs the first losses from defaults or dilution.\n\n**2. Reserve accounts:**\nCash reserves funded by the originator or retained from collections. Acts as a liquid buffer against short-term shortfalls in collections.\n\n**3. Excess spread:**\nThe receivables earn a higher yield (from buyer payment obligations) than the interest owed to investors. This positive spread provides ongoing loss absorption.\n\n**4. Subordination / tranching:**\nThe pool is divided into senior and subordinate tranches:\n- **Senior tranche (AAA)**: Paid first from collections. Extremely low risk. 70–85% of the pool.\n- **Mezzanine tranche (A/BBB)**: Paid after senior. Moderate risk. 5–15%.\n- **First-loss tranche / equity**: Absorbs first losses. Highest risk, highest return. 10–20%. Often retained by the originator.\n\n**5. Originator representations and warranties:**\nThe originator warrants that receivables are genuine, properly documented, and meet eligibility criteria. Breaches require originator to repurchase ineligible assets.\n\n**Rating agency analysis:**\nMoody's, S&P, and Fitch analyze historical default rates and dilution in the receivables pool, obligor (buyer) concentration risk, originator operational risk (servicing capabilities), and structural features and legal isolation of the SPV.",
          highlight: ["credit enhancement", "overcollateralization", "tranching", "senior tranche", "rating agency", "excess spread"],
        },
        {
          type: "teach",
          title: "Off-Balance Sheet Treatment and IFRS/GAAP Considerations",
          content:
            "One of the most valued features of receivables securitization is the potential to move assets **off the originator's balance sheet**, reducing leverage ratios and improving financial metrics.\n\n**Why off-balance sheet treatment matters:**\n- Reduces reported debt and leverage ratios\n- Improves Return on Assets (ROA) — fewer assets for the same earnings\n- May reduce bond covenant pressure\n- Can improve credit ratings and reduce borrowing costs across ALL debt\n\n**The true sale requirement:**\nFor off-balance sheet treatment, the transfer of receivables to the SPV must constitute a **true sale** — not merely a pledge of collateral:\n- Legal title must transfer from originator to SPV\n- SPV must have sufficient insulation from originator bankruptcy\n- Originator cannot maintain effective control over the assets\n- The SPV must be structured as a bankruptcy remote entity\n\n**IFRS 9 derecognition criteria:**\nUnder IFRS 9, an originator can derecognize (remove from balance sheet) transferred receivables when:\n1. The contractual rights to cash flows expire or are transferred, AND\n2. Substantially all the risks and rewards of ownership are transferred\n\n**The retained interest problem:**\nWhen originators retain first-loss tranches, service the receivables, or provide significant credit support, they may fail the derecognition test — keeping assets on-balance sheet despite the securitization. Accounting firms scrutinize these structures carefully.\n\n**GAAP (ASC 860) approach:**\nUS GAAP uses a control-based approach rather than risks and rewards. An entity surrenders control when:\n- Transferred assets are legally isolated\n- Transferee has the right to pledge or exchange assets\n- Transferor does not maintain effective control through repurchase agreements or call options\n\n**Practical takeaway:** Sophisticated securitization counsel, auditors, and rating agencies collaborate to ensure the structure achieves its intended accounting and legal objectives.",
          highlight: ["off-balance sheet", "true sale", "derecognition", "IFRS 9", "ASC 860", "bankruptcy remote"],
        },
        {
          type: "quiz-mc",
          question:
            "A company securitizes $500M of trade receivables into a SPV. The SPV issues $400M of notes to investors and the company retains a $100M first-loss tranche. What type of credit enhancement is the $100M first-loss tranche providing?",
          options: [
            "Subordination and overcollateralization",
            "Excess spread",
            "Reserve account",
            "Originator warranty",
          ],
          correctIndex: 0,
          explanation:
            "The $100M first-loss tranche retained by the originator provides credit enhancement through SUBORDINATION (also called overcollateralization). The SPV holds $500M in receivables but only issues $400M in notes — the extra $100M (20% of pool) is the equity/first-loss piece that absorbs the first $100M of any defaults or losses. This protects the AAA-rated senior noteholders. Subordination/first-loss retention is the most powerful form of credit enhancement and is required in most securitization structures.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Under IFRS 9, a company can always remove securitized receivables from its balance sheet as long as it has legally transferred ownership to a Special Purpose Vehicle.",
          correct: false,
          explanation:
            "Legal transfer alone is NOT sufficient for balance sheet derecognition under IFRS 9. The company must also transfer substantially all the risks and rewards of ownership. If the company retains significant exposure — for example by holding a large first-loss tranche, providing credit guarantees, or having rights to repurchase assets — it has not transferred the risks and rewards, so the assets must remain on the balance sheet. This is why many securitization structures that appear to move assets off-balance sheet are challenged by auditors under IFRS 9's derecognition criteria.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: ESG & Supply Chain Finance ─────────────────────────────────
    {
      id: "supply-chain-finance-5",
      title: "🌱 ESG & Supply Chain Finance",
      description:
        "Green supply chain programs, sustainability-linked pricing incentives, social impact through supplier financial inclusion, and how ESG integration is reshaping global trade finance",
      icon: "Leaf",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Sustainability-Linked Supply Chain Finance",
          content:
            "**Sustainability-linked supply chain finance (SL-SCF)** integrates environmental, social, and governance (ESG) performance into the pricing of trade finance programs — rewarding suppliers for improving their sustainability metrics.\n\n**How it works — the pricing mechanism:**\nInstead of a fixed discount rate, suppliers receive pricing tiers based on their ESG score or specific sustainability KPIs:\n\n- Tier 1 (High ESG score, 80 and above): Early payment at 2.2% annualized\n- Tier 2 (Mid ESG score, 60-79): Early payment at 2.8% annualized\n- Tier 3 (Low ESG score, below 60): Early payment at 3.5% annualized\n\nSuppliers who improve their ESG performance unlock better pricing — a direct financial incentive for sustainability improvement.\n\n**ESG KPIs commonly used:**\n- **Environmental**: Carbon emissions intensity (Scope 1 and 2), renewable energy share, water intensity, waste recycling rate\n- **Social**: Worker safety record, living wage compliance, gender diversity in management, no child/forced labor certifications\n- **Governance**: Ethics certifications, anti-corruption programs, board diversity, transparent reporting\n\n**Third-party verification:**\nESG scores must be independently verified to prevent greenwashing. Common certifiers:\n- EcoVadis (most widely used in procurement ESG ratings)\n- CDP (Carbon Disclosure Project) scores\n- B Corp certification\n- ISO 14001 (environmental management) certification\n- Sedex/SMETA social audit\n\n**Scale and growth:**\nSL-SCF programs are growing rapidly. Major banks (HSBC, BNP Paribas, Citi, JPMorgan) and large buyers (Unilever, Walmart, BMW, Inditex/Zara) have launched programs linking supplier financing costs to sustainability performance.",
          highlight: ["sustainability-linked", "ESG score", "pricing tiers", "EcoVadis", "greenwashing", "KPIs"],
        },
        {
          type: "teach",
          title: "Green Supply Chain Programs",
          content:
            "**Green supply chain finance** specifically targets environmental improvements — using the financial incentive of cheaper credit to drive decarbonization and resource efficiency throughout the supply chain.\n\n**Why supply chains matter for ESG:**\nFor most large companies, supply chain emissions (Scope 3) account for 70–90% of total carbon footprint. A manufacturer's own factory may be clean, but its suppliers' operations may be highly polluting. Green SCF programs give buyers a financial lever to influence supplier environmental behavior.\n\n**Green SCF program structures:**\n\n**1. Carbon-reduction SCF:**\nSuppliers who commit to and demonstrate carbon reduction targets receive improved financing rates. Measurements typically use established frameworks (SBTi — Science Based Targets initiative).\n\n**2. Green procurement incentives:**\nBuyers offer better payment terms specifically for invoices related to green products or sustainable raw materials (recycled content, organic materials, renewable energy equipment).\n\n**3. Transition finance:**\nSuppliers transitioning to more sustainable operations (switching from coal to renewable energy, upgrading to energy-efficient equipment) receive preferential financing terms during the transition period.\n\n**Case study — Walmart's Project Gigaton:**\nWalmart launched a program to avoid 1 billion metric tons of GHG emissions from its global supply chain by 2030. Supply chain financing incentives are a key tool — suppliers with verified emissions reductions qualify for better payment terms.\n\n**Case study — BMW's Green Finance:**\nBMW uses EcoVadis scores to tier its supplier financing rates. Suppliers with top EcoVadis sustainability ratings (top 5%) access financing at prime rates; others pay progressively higher rates. BMW also gives lower-rated suppliers free access to EcoVadis improvement tools.\n\n**The flywheel effect:**\nLower-cost financing leads to supplier investment in sustainability improvements, which generates a better ESG score, which qualifies the supplier for even lower financing costs, which enables further sustainability investment. The financial incentive creates a self-reinforcing cycle.",
          highlight: ["Scope 3", "carbon reduction", "Science Based Targets", "EcoVadis", "greenwashing", "flywheel effect"],
        },
        {
          type: "teach",
          title: "Social Impact — Financial Inclusion for Suppliers",
          content:
            "Beyond environmental goals, supply chain finance plays a crucial role in **financial inclusion** — providing access to affordable credit for small businesses in developing economies that are systematically excluded from traditional banking.\n\n**The financial exclusion problem:**\nIn many emerging markets:\n- Small suppliers cannot access bank credit at all\n- When credit is available, interest rates of 20–40% are common in markets like Sub-Saharan Africa, Southeast Asia, and Latin America\n- Invoice financing requires collateral — which small businesses often lack\n- Cultural barriers, language, and bureaucracy exclude many micro-enterprises\n\n**How SCF programs address financial inclusion:**\nBy attaching small supplier financing to a large anchor buyer's credit quality:\n- Suppliers in India, Kenya, or Indonesia can access finance at rates resembling developed market rates\n- No collateral required — the approved invoice is the credit support\n- Digital platforms remove geography barriers — financing via mobile phone\n- First formal credit access often helps suppliers build a credit history\n\n**Impact measurement:**\nSocial impact in SCF is measured through:\n- Number of small/medium suppliers accessing financing for the first time\n- Average reduction in financing cost compared to alternative sources\n- Jobs supported through improved supplier financial health\n- Women-owned business participation rates\n- Rural and agricultural supplier inclusion\n\n**UN SDG alignment:**\nSCF financial inclusion programs directly support:\n- **SDG 8**: Decent work and economic growth\n- **SDG 10**: Reduced inequalities\n- **SDG 17**: Partnerships for the goals\n\n**The business case:**\nBuyers who help their small suppliers survive and grow benefit from more resilient supply chains, supplier loyalty and relationship depth, emerging market growth opportunity (as suppliers grow they can supply more), and enhanced brand reputation and ESG reporting metrics.",
          highlight: ["financial inclusion", "emerging markets", "anchor buyer", "SDG", "mobile finance", "credit history"],
        },
        {
          type: "quiz-mc",
          question:
            "A large buyer implements a sustainability-linked SCF program with two tiers: scores 80+ earn 2.2% annualized; scores 60–79 earn 2.8%. Supplier A improves from a score of 72 to 84. On a $2,000,000 invoice portfolio per year, what is the annual financing cost saving from moving to Tier 1?",
          options: [
            "$12,000",
            "$6,000",
            "$18,000",
            "$24,000",
          ],
          correctIndex: 0,
          explanation:
            "The annual rate improvement is 2.8% - 2.2% = 0.6% per year. On a $2,000,000 invoice portfolio, the annual saving is $2,000,000 x 0.006 = $12,000 per year. This financial incentive directly rewards suppliers for investing in sustainability improvements — moving from Tier 2 to Tier 1 puts $12,000 back in the supplier's pocket each year, which can be reinvested in further ESG initiatives.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Supply chain sustainability-linked finance programs primarily benefit large, well-resourced suppliers in developed markets, as smaller suppliers lack the infrastructure to track and report ESG metrics.",
          correct: false,
          explanation:
            "While there are valid concerns about ESG reporting burdens on small suppliers, the premise is incorrect. Many SL-SCF programs specifically TARGET small and medium suppliers in emerging markets, and major buyers like Walmart, Unilever, and BMW provide free access to sustainability assessment tools (like EcoVadis) to help smaller suppliers participate. Additionally, digital platforms enable ESG metric tracking via mobile devices, reducing infrastructure barriers. Financial inclusion for small suppliers is explicitly one of the social impact goals of SCF programs, aligned with UN Sustainable Development Goals SDG 8, SDG 10, and SDG 17.",
          difficulty: 2,
        },
      ],
    },
  ],
};
