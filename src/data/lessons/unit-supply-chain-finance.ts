import type { Unit } from "./types";

export const UNIT_SUPPLY_CHAIN_FINANCE: Unit = {
  id: "supply-chain-finance",
  title: "Supply Chain & Operations Finance",
  description:
    "Understand working capital, inventory management, procurement finance, trade finance, and supply chain risk",
  icon: "Truck",
  color: "#f97316",
  lessons: [
    // ─── Lesson 1: Working Capital Management ────────────────────────────────────
    {
      id: "scf-1",
      title: "💰 Working Capital Management",
      description:
        "Master cash conversion cycles, EOQ, JIT inventory, and supply chain financing techniques",
      icon: "RefreshCw",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🔄 The Cash Conversion Cycle",
          content:
            "The **Cash Conversion Cycle (CCC)** measures how long cash is tied up in day-to-day operations before it is converted back into cash.\n\n**Formula:**\nCCC = DIO + DSO – DPO\n\n- **DIO (Days Inventory Outstanding)** = (Inventory / COGS) × 365. How long goods sit in the warehouse.\n- **DSO (Days Sales Outstanding)** = (Receivables / Revenue) × 365. How long before customers pay.\n- **DPO (Days Payable Outstanding)** = (Payables / COGS) × 365. How long before the company pays its own suppliers.\n\n**Interpretation:**\n- A **shorter CCC** means cash is recycled faster — the company needs less working capital financing.\n- A **negative CCC** (e.g., Amazon, Walmart) means the company collects cash from customers before it pays its suppliers — a powerful competitive advantage.\n- A **long CCC** is a cash trap: the business must fund the gap with credit lines or equity.\n\n**Example:**\n- DIO = 30 days, DSO = 45 days, DPO = 50 days\n- CCC = 30 + 45 – 50 = **25 days** of cash tied up in operations",
          highlight: ["cash conversion cycle", "DIO", "DSO", "DPO", "CCC", "negative CCC"],
        },
        {
          type: "teach",
          title: "📦 Economic Order Quantity & Just-in-Time",
          content:
            "**Economic Order Quantity (EOQ)** is the optimal reorder quantity that minimizes total inventory costs (ordering costs + holding costs).\n\n**EOQ formula:**\nEOQ = √(2DS / H)\n\n- **D** = Annual demand (units)\n- **S** = Cost per order (setup/shipping cost)\n- **H** = Annual holding cost per unit (storage, insurance, spoilage)\n\nExample: D = 10,000 units, S = $200/order, H = $4/unit\nEOQ = √(2 × 10,000 × 200 / 4) = √1,000,000 = **1,000 units per order**\n\n**Just-in-Time (JIT)** takes a different philosophy — order only when needed, keeping near-zero inventory.\n\n**JIT benefits:**\n- Eliminates holding costs (warehouse, spoilage, obsolescence)\n- Reduces cash tied up in inventory\n- Forces supplier quality improvement\n\n**JIT risks:**\n- Zero buffer for supply disruptions (COVID-19 exposed this catastrophically)\n- Highly dependent on supplier reliability and geographic proximity\n- Any disruption halts production immediately\n\n**Post-pandemic shift:** Many manufacturers moved from 'just-in-time' to **'just-in-case'** — holding strategic buffer stock for critical components despite the cost.",
          highlight: ["EOQ", "just-in-time", "holding costs", "ordering costs", "just-in-case"],
        },
        {
          type: "teach",
          title: "🏦 Supply Chain Financing & Dynamic Discounting",
          content:
            "**Supply Chain Finance (SCF)** is a set of technology-based financing solutions that lower financing costs for buyers and sellers.\n\n**Reverse factoring (most common SCF structure):**\n1. Buyer approves invoice from supplier\n2. Buyer's bank pays supplier early (at a small discount)\n3. Buyer pays the bank on the original due date (often 60–90 days)\n\n**Benefits:**\n- Supplier gets cash quickly at the buyer's (lower) credit rate — not at the smaller supplier's rate\n- Buyer extends DPO without harming the supplier relationship\n- Bank earns a spread on the financing\n\n**Dynamic discounting** is a buyer-funded variation:\n- The buyer offers the supplier a sliding scale: pay early and get a discount\n- Example: pay 10 days early → 0.5% discount; pay 30 days early → 1.5% discount\n- The buyer earns a return on excess cash; the supplier gets liquidity\n\n**Key distinction:**\n- **Reverse factoring**: bank-funded; buyer extends DPO\n- **Dynamic discounting**: buyer-funded; buyer reduces DPO but earns a return\n\n**Accounting controversy:** Regulators debate whether reverse factoring should be reclassified as debt — Carillion's collapse revealed £500M of hidden reverse factoring obligations.",
          highlight: ["supply chain finance", "reverse factoring", "dynamic discounting", "DPO extension", "early payment"],
        },
        {
          type: "quiz-mc",
          question:
            "Company A has CCC = 35 days. Company B has CCC = 8 days, in the same industry. What does this imply?",
          options: [
            "Company B has far superior working capital efficiency — it recycles cash much faster and needs less operating capital to support the same revenue",
            "Company A is more conservative and has a safer balance sheet due to higher inventory buffers",
            "Company B's shorter CCC suggests it has weaker supplier relationships because it pays too quickly",
            "The CCC difference is irrelevant — only the absolute levels of receivables and payables matter",
          ],
          correctIndex: 0,
          explanation:
            "A CCC of 8 days vs 35 days means Company B recycles cash ~4× faster. For every $1M of revenue, Company B needs dramatically less working capital financing. Over time, Company B can grow faster with less external funding, pay higher dividends, or invest more. CCC is a core efficiency metric — Amazon runs a negative CCC, collecting from customers before paying suppliers, which is a massive structural advantage.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Just-in-time inventory management always reduces total costs and is universally optimal for manufacturers.",
          correct: false,
          explanation:
            "False. JIT minimizes holding costs but eliminates safety buffers. The COVID-19 pandemic exposed the fragility of JIT: auto manufacturers with zero semiconductor inventory had to idle factories for months while waiting for chips, costing billions. The optimal strategy depends on supply chain reliability, component criticality, and cost of disruption. Many companies now deliberately hold strategic inventory for critical inputs despite the holding cost, a shift called 'just-in-case' inventory management.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A manufacturer has: DIO = 40 days, DSO = 50 days, DPO = 30 days. A competitor in the same industry has: DIO = 20 days, DSO = 35 days, DPO = 55 days. Both have the same revenue.",
          question: "Which company needs more external working capital financing, and by approximately how many days?",
          options: [
            "The first company — its CCC is 60 days vs the competitor's 0 days, meaning it needs to finance 60 extra days of operating costs",
            "The competitor — lower DIO means it runs out of stock and needs emergency financing",
            "Both need the same financing — they have equal revenue",
            "The first company — by exactly 30 days (the DPO difference only)",
          ],
          correctIndex: 0,
          explanation:
            "First company CCC = 40 + 50 – 30 = 60 days. Competitor CCC = 20 + 35 – 55 = 0 days. The competitor has perfectly self-financing operations — it collects from customers and delays payments to suppliers such that no external financing gap exists. The first company must fund 60 days of COGS through credit lines or equity, which is a real financing cost. Reducing CCC from 60 to 0 on $100M of COGS would free roughly $16.4M of working capital.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Trade Finance ──────────────────────────────────────────────────
    {
      id: "scf-2",
      title: "🌍 Trade Finance",
      description:
        "Letters of credit, documentary collections, bank guarantees, export credit agencies, and international payment instruments",
      icon: "Globe",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📜 Letters of Credit",
          content:
            "A **Letter of Credit (LC)** is the gold standard of international trade finance. It is a bank's irrevocable promise to pay the exporter, provided the exporter presents compliant shipping documents.\n\n**How it works:**\n1. Buyer and seller agree on an LC as payment method\n2. Buyer's bank (issuing bank) issues the LC\n3. Seller's bank (advising/confirming bank) authenticates it\n4. Exporter ships goods and presents documents (bill of lading, invoice, packing list, certificate of origin)\n5. If documents comply exactly with LC terms, the issuing bank pays — regardless of buyer's financial condition\n\n**Types of LC:**\n- **Irrevocable LC**: cannot be amended without all parties' consent — standard today\n- **Confirmed LC**: seller's bank adds its own guarantee (double protection — useful in politically risky countries)\n- **Standby LC**: used as a guarantee/fallback if buyer defaults, not as the primary payment mechanism\n- **Transferable LC**: exporter can transfer rights to a sub-supplier (useful for trading companies)\n\n**Key risk mitigation:**\nAn LC protects the exporter from **buyer credit risk** and **country risk** — the bank pays even if the buyer goes bankrupt, as long as documents comply.\n\n**Cost:** typically 0.5–1.5% of transaction value as LC issuance fees.",
          highlight: ["letter of credit", "irrevocable LC", "confirmed LC", "standby LC", "issuing bank", "compliant documents"],
        },
        {
          type: "teach",
          title: "📋 Documentary Collections & Bank Guarantees",
          content:
            "**Documentary Collection** is cheaper than an LC but offers less protection. The bank acts as an intermediary for documents only — it does not guarantee payment.\n\n**Two types:**\n- **D/P (Documents Against Payment)**: bank releases shipping documents to buyer only when buyer pays immediately. Exporter retains control of goods until payment.\n- **D/A (Documents Against Acceptance)**: bank releases documents when buyer signs a draft (promise to pay at a future date). Exporter loses control of goods before receiving payment — higher risk.\n\n**Documentary collection risks:**\n- Buyer can refuse documents and abandon the goods (less risk with D/P)\n- No bank payment guarantee — if buyer defaults, exporter must sue\n- Goods stranded at port, incurring demurrage charges\n\n**Bank Guarantee vs Standby LC:**\n| Feature | Bank Guarantee | Standby LC |\n|---|---|---|\n| Governed by | Local law | UCP 600 / ISP98 |\n| Payment trigger | On demand (sometimes conditional) | Documentary — needs compliant claim |\n| Common use | Construction, contracts | Trade credit, financial obligations |\n| Recovery for seller | Often unconditional | Documentary evidence required |\n\n**On-demand guarantees** (common in construction) allow the beneficiary to call payment without proving default — highly controversial in some jurisdictions.",
          highlight: ["documentary collection", "D/P", "D/A", "bank guarantee", "standby LC", "on-demand guarantee"],
        },
        {
          type: "teach",
          title: "🏛️ Export Credit Agencies & Reverse Factoring",
          content:
            "**Export Credit Agencies (ECAs)** are government-backed institutions that support exporters by providing financing, guarantees, and insurance for international transactions.\n\n**Examples:** US Ex-Im Bank, UK Export Finance (UKEF), Germany's Euler Hermes, China's Sinosure.\n\n**ECA instruments:**\n- **Export credit loans**: ECA funds or guarantees a loan to the foreign buyer so they can purchase the exporter's goods — common for large infrastructure projects\n- **Export credit insurance**: covers the exporter against buyer default or country/political risk\n- **Supplier credit**: ECA guarantees payment to exporter if buyer defaults\n\n**Why ECAs matter:**\n- Enable large-scale trade (aircraft, power plants, defence equipment) that private banks won't finance alone\n- Create competitive financing terms — Airbus customers often get ECA-backed loans at sovereign-like rates\n- Geopolitical tool: China's Sinosure heavily subsidised Belt & Road project financing\n\n**Supply Chain Finance (Reverse Factoring) recap:**\n- Anchor buyer's bank pays approved invoices early\n- Supplier gets liquidity at buyer's credit rating (usually investment grade)\n- Buyer pays bank on extended terms — a hidden source of leverage\n- Major players: Citi, JPMorgan, HSBC, Greensill (collapsed 2021 — warning: SCF programs can obscure true debt levels)",
          highlight: ["export credit agency", "ECA", "export credit insurance", "reverse factoring", "supply chain finance", "Greensill"],
        },
        {
          type: "quiz-mc",
          question:
            "An exporter is selling goods to a buyer in a country with political instability. The exporter is worried about not receiving payment. Which instrument gives the strongest protection?",
          options: [
            "A confirmed irrevocable LC — the seller's own bank guarantees payment if documents comply, regardless of the foreign bank or buyer's condition",
            "A D/P documentary collection — the bank controls the documents until payment",
            "An open account with 30-day terms — standard international practice and cheapest",
            "A D/A documentary collection — buyer acceptance creates a legal obligation to pay",
          ],
          correctIndex: 0,
          explanation:
            "A confirmed irrevocable LC provides double protection: the issuing bank (in the buyer's country) AND the seller's confirming bank both guarantee payment upon compliant document presentation. Even if the issuing bank or the buyer's country defaults, the seller's own bank pays. This is the strongest payment mechanism available in international trade, particularly valuable when country risk is high. D/P offers document control but no payment guarantee; D/A provides the weakest protection as goods are released before payment.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An Export Credit Agency (ECA) loan is primarily a subsidy for the importing country's buyer, with no strategic benefit to the exporting country.",
          correct: false,
          explanation:
            "False. ECA financing primarily benefits the exporting country by making its exporters more competitive. By offering the buyer cheaper financing (backed by government guarantees), the exporter wins contracts that might otherwise go to competitors. The US Ex-Im Bank supports American exporters like Boeing; UKEF supports British defence and infrastructure exports. ECAs are as much tools of industrial policy and geopolitical influence as they are trade finance instruments.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A UK machinery exporter has won a contract to sell £50M of equipment to a government agency in an emerging market. Payment is due 18 months after delivery. The buyer's credit rating is BB-. The exporter's cost of capital is 8% and the buyer's local borrowing rate is 14%.",
          question: "Which approach best structures this transaction to manage risk and improve competitiveness?",
          options: [
            "ECA-backed supplier credit: UK Export Finance guarantees 85% of the loan, allowing the exporter to offer financing at near-sovereign rates while eliminating most credit and country risk",
            "Open account with credit insurance: cheapest option, insures against default at low premium cost",
            "Confirmed LC: standard instrument that eliminates all credit risk at minimal cost",
            "Forfaiting: sell the receivable at a discount to a forfaiter, accepting a large haircut on face value",
          ],
          correctIndex: 0,
          explanation:
            "An ECA-backed structure is optimal here. UKEF guarantee allows the buyer to access capital markets at near-UK-sovereign rates (far below 14%), making the exporter's financing offer a competitive advantage over rivals. The 85% ECA guarantee eliminates most of the credit and political risk for any participating bank. A confirmed LC is impractical for an 18-month deferred payment of this size. Forfaiting works but the discount on a BB- 18-month receivable would be punitive. Credit insurance on open account leaves the exporter exposed to the full receivable for 18 months.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Inventory Valuation & COGS ────────────────────────────────────
    {
      id: "scf-3",
      title: "📊 Inventory Valuation & COGS",
      description:
        "FIFO, LIFO, weighted average cost methods — and their impact on profits, taxes, and comparability",
      icon: "BarChart2",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📈 FIFO vs LIFO: The Inflation Impact",
          content:
            "How a company values its inventory directly affects reported COGS, profits, and taxes. The choice matters enormously in inflationary environments.\n\n**FIFO (First In, First Out):**\n- Assumes oldest inventory is sold first\n- In **inflation**: oldest (cheaper) units are expensed as COGS first\n- Result: **lower COGS → higher gross profit → higher taxable income → higher taxes**\n- Inventory on balance sheet reflects more recent (higher) costs\n- Used globally under IFRS and US GAAP\n\n**LIFO (Last In, First Out):**\n- Assumes newest inventory is sold first\n- In **inflation**: newest (more expensive) units are expensed as COGS first\n- Result: **higher COGS → lower gross profit → lower taxable income → lower taxes**\n- Inventory on balance sheet reflects older (lower) costs — often severely understated\n- **Allowed only under US GAAP** — prohibited under IFRS\n- Many US companies use LIFO specifically for the tax deferral benefit\n\n**Numerical example (cost of widgets rising from $10 → $12):**\n\n| Method | COGS per unit | Gross Profit (sell at $15) | Tax (25%) |\n|---|---|---|---|\n| FIFO | $10 | $5 | $1.25 |\n| LIFO | $12 | $3 | $0.75 |\n\nLIFO saves $0.50 per unit in taxes — significant at scale.",
          highlight: ["FIFO", "LIFO", "COGS", "inflation", "tax deferral", "gross profit"],
        },
        {
          type: "teach",
          title: "📐 Weighted Average Cost & LIFO Reserve",
          content:
            "**Weighted Average Cost (WAC)** method blends all inventory costs into a single average, providing results between FIFO and LIFO extremes.\n\nFormula: WAC = Total Cost of Available Inventory / Total Units Available\n\nWAC is common in industries with homogeneous, interchangeable goods (grain, chemicals, petroleum).\n\n**LIFO Reserve:** Companies using LIFO must disclose the **LIFO reserve** — the cumulative difference between LIFO inventory value and FIFO inventory value on the balance sheet.\n\nConversion formula:\n- FIFO Inventory = LIFO Inventory + LIFO Reserve\n- FIFO COGS = LIFO COGS – Increase in LIFO Reserve during the period\n\n**Why analysts adjust for LIFO reserve:**\n- Comparing a LIFO company to a FIFO company without adjustment is misleading\n- Analysts add the LIFO reserve to equity to get economic book value\n- Adding the LIFO reserve × (1 – tax rate) to net income restates to FIFO profit\n\n**Inventory write-downs:** When the **Net Realizable Value (NRV)** of inventory falls below cost, companies must write down inventory to NRV.\n- NRV = Estimated selling price – Estimated completion costs – Selling costs\n- Write-downs are permanent under IFRS (cannot be reversed if NRV recovers under US GAAP once written down)\n- Sudden large write-downs signal obsolete products or a deteriorating business",
          highlight: ["weighted average cost", "LIFO reserve", "NRV", "inventory write-down", "FIFO conversion", "net realizable value"],
        },
        {
          type: "teach",
          title: "🔍 Inventory Quality Analysis",
          content:
            "Analysts scrutinize inventory for signs of deteriorating business health.\n\n**Key ratios:**\n- **Inventory Turnover** = COGS / Average Inventory. Higher = faster selling. Industry benchmarks vary widely (grocery: 20×+; aerospace: 2–4×).\n- **Days Inventory Outstanding (DIO)** = 365 / Inventory Turnover\n\n**Red flags:**\n- Inventory growing faster than revenue (potential demand weakness or obsolescence)\n- Sudden shift in inventory mix (raw materials spiking while WIP falls = production stoppage)\n- Rising finished goods as % of total (goods piling up unsold)\n\n**Channel stuffing:** Companies sometimes ship excess product to distributors near quarter-end to boost revenue recognition. Symptoms: receivables and inventory at distributors spike; subsequent quarter shows returns or revenue reversals.\n\n**Commodity inventory and hedging:**\nManufacturers holding commodity inputs (copper, steel, aluminum) face inventory value risk from price swings. They often hedge via futures contracts to lock in the cost of raw materials, converting variable raw material costs into more predictable COGS. However, if the hedge is not designated as an accounting hedge (under IFRS 9 / ASC 815), mark-to-market gains/losses flow through P&L, creating earnings volatility.",
          highlight: ["inventory turnover", "DIO", "channel stuffing", "inventory write-down", "commodity hedging", "inventory quality"],
        },
        {
          type: "quiz-mc",
          question:
            "In an inflationary environment, which inventory accounting method maximizes reported net income?",
          options: [
            "FIFO — it expenses the oldest (cheapest) units first, leaving lower COGS and higher reported profit",
            "LIFO — it expenses the newest (most expensive) units, maximizing cost recognition",
            "Weighted average cost — it blends costs, always producing the highest profit",
            "Specific identification — always produces the highest income by choosing low-cost units to sell",
          ],
          correctIndex: 0,
          explanation:
            "Under FIFO during inflation, the oldest (cheapest) inventory units are expensed as COGS first. This results in lower COGS, higher gross profit, and higher reported net income — but also higher tax liability. LIFO does the opposite: higher COGS, lower profit, lower taxes. This is why US companies with large inventories (ExxonMobil, Caterpillar) historically used LIFO for tax savings. IFRS prohibits LIFO, so European companies all use FIFO or WAC, making cross-border comparisons tricky.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Under LIFO, the inventory figure on the balance sheet reflects current market replacement costs more accurately than under FIFO.",
          correct: false,
          explanation:
            "False. Under LIFO, the most recent (higher-cost) purchases are expensed immediately as COGS, leaving only the oldest (cheapest) layers of inventory on the balance sheet. In a company that has used LIFO for decades during inflationary periods, the balance sheet inventory can be drastically understated relative to current replacement costs. The LIFO reserve disclosure exists precisely to allow analysts to convert these stale carrying values back to current-cost equivalents. FIFO actually leaves more recent (closer to current) cost layers on the balance sheet.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An analyst is comparing two US retailers: RetailA uses FIFO with inventory of $500M; RetailB uses LIFO with inventory of $400M and a disclosed LIFO reserve of $120M. Both have similar revenues and COGS. The corporate tax rate is 25%.",
          question: "To make the balance sheets comparable, what is RetailB's FIFO-equivalent inventory, and how should the analyst adjust equity?",
          options: [
            "FIFO inventory = $520M; add $90M (LIFO reserve × 75% after-tax) to equity to reflect the understated asset value",
            "FIFO inventory = $400M; no adjustment needed since LIFO and FIFO give the same total assets",
            "FIFO inventory = $520M; add the full $120M to equity without tax adjustment",
            "FIFO inventory = $280M; subtract the LIFO reserve to conservatively understate assets",
          ],
          correctIndex: 0,
          explanation:
            "FIFO Inventory = LIFO Inventory + LIFO Reserve = $400M + $120M = $520M. The $120M LIFO reserve represents cumulative cost that was expensed under LIFO but would still be in inventory under FIFO. To adjust equity: add LIFO Reserve × (1 – tax rate) = $120M × 0.75 = $90M — because if those costs hadn't been expensed, after-tax retained earnings would have been $90M higher. This is a standard analyst adjustment when comparing LIFO and FIFO companies in the same industry.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Supply Chain Risk & Resilience ─────────────────────────────────
    {
      id: "scf-4",
      title: "⚠️ Supply Chain Risk & Resilience",
      description:
        "Concentration risk, bullwhip effect, safety stock, nearshoring, and building resilient supply chains",
      icon: "Shield",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🌐 Concentration Risk & Geographic Risk",
          content:
            "**Concentration risk** in supply chains arises when a company sources critical components from a single supplier or region.\n\n**Single-source supplier risk:**\n- Any disruption — fire, bankruptcy, strike, quality failure — halts production entirely\n- Counterparty has pricing power at contract renewal\n- COVID-19 semiconductor shortage: Apple, Ford, Toyota all relied heavily on TSMC (Taiwan) for advanced chips; factory closures and shipping delays caused billions in lost production\n\n**Geographic concentration risk:**\n- **Natural disasters**: Tohoku earthquake (2011) disrupted global auto production for months; Thailand floods (2011) destroyed hard drive supply for 2 years\n- **Geopolitical risk**: US-China trade war (2018–) forced companies to evaluate alternatives to Chinese manufacturing\n- **Country risk factors**: political instability, sanctions, export controls, currency inconvertibility\n\n**Resilience strategies:**\n- **Dual/multi-sourcing**: qualify at least two suppliers for critical components, even if the second is more expensive\n- **Geographic diversification**: spread production across regions (China + Vietnam + Mexico)\n- **Strategic stockpiling**: maintain 3–6 months of inventory for sole-sourced critical parts\n- **Supplier financial monitoring**: watch for deteriorating supplier credit ratings — a bankrupt supplier is worse than no supplier at all\n\n**Risk quantification:** Scenario analysis: 'If our primary chip supplier goes offline for 90 days, what is the revenue at risk?' — leading companies model this explicitly.",
          highlight: ["concentration risk", "single-source supplier", "geographic risk", "dual-sourcing", "strategic stockpiling", "geopolitical risk"],
        },
        {
          type: "teach",
          title: "📊 The Bullwhip Effect",
          content:
            "The **Bullwhip Effect** describes how small fluctuations in consumer demand create increasingly large swings in orders as you move upstream in the supply chain.\n\n**How it works:**\n- Consumer demand increases by 5% → retailer orders 10% more (buffer stock)\n- Distributor sees 10% increase → orders 20% from manufacturer\n- Manufacturer sees 20% → orders 40% more raw materials\n- Raw material supplier faces 40% demand spike from a 5% consumer move\n\n**Root causes:**\n- **Demand signal distortion**: each tier forecasts independently without sharing POS data\n- **Batch ordering**: companies place orders weekly/monthly rather than continuously\n- **Price fluctuations**: promotions trigger panic buying then demand drought\n- **Shortage gaming**: buyers over-order during scarcity (everyone orders 2× knowing they'll get half)\n\n**Bullwhip amplification** is most extreme in industries with long lead times (semiconductors: 12–52 week lead times create massive order swings)\n\n**Mitigation strategies:**\n- **Vendor-managed inventory (VMI)**: supplier monitors buyer's inventory levels and replenishes automatically\n- **POS data sharing**: real-time point-of-sale data passed upstream\n- **Collaborative planning (CPFR)**: buyers and suppliers jointly forecast\n- **Everyday low pricing (EDLP)**: Walmart's strategy — eliminate promotional spikes\n- **Order smoothing**: smaller, more frequent orders rather than large batches",
          highlight: ["bullwhip effect", "demand amplification", "vendor-managed inventory", "POS data sharing", "batch ordering", "shortage gaming"],
        },
        {
          type: "teach",
          title: "🛡️ Safety Stock & Nearshoring",
          content:
            "**Safety stock** is inventory held to buffer against demand uncertainty and supply variability.\n\n**Safety stock formula:**\nSafety Stock = z × σ_d × √L\n\n- **z** = service level factor (e.g., z = 1.65 for 95% service level; z = 2.33 for 99%)\n- **σ_d** = standard deviation of daily demand\n- **L** = lead time in days\n\nExample: z = 1.65, σ_d = 20 units/day, L = 9 days\nSafety Stock = 1.65 × 20 × √9 = 1.65 × 20 × 3 = **99 units**\n\n**Reorder point** = (Average Daily Demand × Lead Time) + Safety Stock\n\n**Nearshoring and friendshoring:**\n\n**Nearshoring**: moving production to geographically close countries (US companies moving from China to Mexico; European companies to Poland/Morocco)\n- Reduces lead times dramatically (Mexico to US: days vs China: weeks)\n- Lower transportation costs and tariff risk\n- Cultural/time-zone proximity aids coordination\n\n**Friendshoring**: sourcing from geopolitically aligned countries (US allies), reducing exposure to adversarial nation supply chains\n- Accelerated by CHIPS Act (semiconductors), Inflation Reduction Act (EVs/batteries)\n- Creates new supply chain clusters: India electronics, Vietnam textiles, Mexico auto parts\n\n**Total cost of reshoring** is often underestimated: labor cost savings disappear, but resilience, speed, and tariff avoidance have quantifiable value.",
          highlight: ["safety stock", "service level", "lead time", "nearshoring", "friendshoring", "reshoring", "reorder point"],
        },
        {
          type: "quiz-mc",
          question:
            "A company sources 100% of a critical electronic component from a single manufacturer in one country. What is the most cost-effective risk mitigation strategy?",
          options: [
            "Qualify a second supplier in a different region and place at least 20–30% of orders with them regularly to maintain the relationship and production capability",
            "Hold 24 months of safety stock to buffer against any possible disruption",
            "Vertically integrate by acquiring the supplier to control production directly",
            "Take out supply disruption insurance and rely on the policy to compensate for losses",
          ],
          correctIndex: 0,
          explanation:
            "Dual-sourcing with regular split orders is the most practical risk mitigation. Holding 24 months of safety stock ties up enormous capital, creates obsolescence risk, and doesn't address the root single-source problem. Vertical integration (acquisition) is expensive, operationally complex, and diverts management focus. Insurance compensates financially but doesn't prevent production stoppages or customer losses. Qualifying and regularly using a second supplier ensures the backup supplier maintains production capability — a supplier rarely used is a supplier who cannot reliably ramp up in a crisis.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The bullwhip effect is only observed in consumer goods industries and does not affect industrial or B2B supply chains.",
          correct: false,
          explanation:
            "False. The bullwhip effect is actually most severe in B2B and industrial supply chains where lead times are longest. The 2021–2023 semiconductor shortage is the definitive example: a modest increase in consumer electronics demand led to massive over-ordering by automakers and industrial companies (everyone ordered 2× fearing shortages), which led chipmakers to massively expand capacity, which then flooded the market in 2023 leading to a severe oversupply correction. Consumer goods supply chains often benefit from POS data sharing that partially mitigates the bullwhip effect.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An electronics manufacturer has daily demand with σ = 50 units. Lead time from their sole supplier is 16 days. They want 99% service level (z = 2.33). Average daily demand is 200 units.",
          question: "What is the safety stock required and the reorder point?",
          options: [
            "Safety stock = 466 units; reorder point = 3,666 units",
            "Safety stock = 200 units; reorder point = 3,400 units",
            "Safety stock = 800 units; reorder point = 4,000 units",
            "Safety stock = 233 units; reorder point = 3,433 units",
          ],
          correctIndex: 0,
          explanation:
            "Safety Stock = z × σ × √L = 2.33 × 50 × √16 = 2.33 × 50 × 4 = 466 units. Reorder Point = (Average Daily Demand × Lead Time) + Safety Stock = (200 × 16) + 466 = 3,200 + 466 = 3,666 units. When inventory drops to 3,666 units, place a new order — the 466 units of safety stock buffer handles demand spikes during the 16-day lead time. Higher service levels (99% vs 95%) require more safety stock (466 vs 330 units), representing a direct cost vs service trade-off.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Procurement & Cost Management ─────────────────────────────────
    {
      id: "scf-5",
      title: "🎯 Procurement & Cost Management",
      description:
        "Strategic sourcing, Kraljic matrix, total cost of ownership, should-cost analysis, and commodity hedging",
      icon: "Target",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📋 Strategic Sourcing & Total Cost of Ownership",
          content:
            "**Strategic sourcing** is a disciplined approach to procurement that focuses on **Total Cost of Ownership (TCO)** rather than just purchase price.\n\n**TCO components:**\n- **Acquisition cost**: purchase price, shipping, customs/duties, insurance\n- **Operating cost**: installation, training, energy consumption, consumables\n- **Maintenance cost**: repairs, spare parts, scheduled maintenance\n- **End-of-life cost**: disposal, decommissioning, environmental remediation\n\nExample: Supplier A offers a machine at $100,000. Supplier B offers $80,000 but maintenance costs are $8,000/year vs $3,000/year.\nOver 10 years: A = $100,000 + $30,000 = **$130,000**; B = $80,000 + $80,000 = **$160,000**.\nSupplier A is actually cheaper by $30,000 despite the higher sticker price.\n\n**Should-cost analysis** is a bottom-up cost model estimating what something *should* cost based on:\n- Raw material prices (commodity spot prices)\n- Labor rates (country-specific)\n- Manufacturing overhead (equipment, energy)\n- Tooling amortization\n- Logistics costs\n- Target supplier margin\n\nShould-cost gives the buyer a negotiating target grounded in economics — not just market price. Used extensively in aerospace, automotive, and defense procurement.\n\n**Cost transparency** tools (commodity cost trackers, labor rate databases) let procurement teams update should-cost models in real time as input costs change.",
          highlight: ["total cost of ownership", "TCO", "strategic sourcing", "should-cost analysis", "cost modeling", "procurement"],
        },
        {
          type: "teach",
          title: "🔲 The Kraljic Matrix",
          content:
            "The **Kraljic Matrix** (Peter Kraljic, 1983 — still the dominant framework) segments suppliers into four categories based on two dimensions:\n\n**Axes:**\n- **Supply risk** (horizontal): How hard is this item to source? (concentration, lead time, substitutability)\n- **Profit impact** (vertical): How much does this item affect profitability? (spend level, quality impact, production criticality)\n\n**Four quadrants:**\n\n**Strategic (high impact, high risk):**\n- Critical components from sole-source suppliers\n- Strategy: deep partnerships, long-term contracts, co-development, risk-sharing\n- Example: TSMC advanced chips for Apple\n\n**Leverage (high impact, low risk):**\n- High-spend but many alternatives available\n- Strategy: competitive bidding, volume consolidation, push for maximum cost reduction\n- Example: office supplies for a large corporation\n\n**Bottleneck (low impact, high risk):**\n- Small spend but sole-source or long lead time\n- Strategy: maintain safety stock, qualify backup suppliers, lock in supply\n- Example: obscure sensor chip in critical medical equipment\n\n**Non-critical (low impact, low risk):**\n- Standard commodity items, many suppliers\n- Strategy: automate purchasing, reduce transaction costs, use purchasing cards\n- Example: stationery, janitorial supplies\n\n**Key insight:** Many companies over-invest in non-critical sourcing and under-invest in strategic and bottleneck categories — misallocating procurement resources.",
          highlight: ["Kraljic matrix", "strategic suppliers", "leverage suppliers", "bottleneck suppliers", "supply risk", "profit impact"],
        },
        {
          type: "teach",
          title: "📈 Commodity Hedging Strategies",
          content:
            "Manufacturers with significant commodity input costs (airlines: jet fuel; automakers: steel/aluminum; food producers: wheat/corn) use derivatives to hedge price risk.\n\n**Common hedging instruments:**\n\n**Futures contracts:**\n- Exchange-traded, standardized contracts to buy/sell a commodity at a fixed price on a future date\n- Airline buys jet fuel futures: locks in price today for fuel needed in 6 months\n- Highly liquid, easy to enter/exit; but may require cash margin calls if prices move against you\n\n**Options (call options):**\n- Airline buys a call option on jet fuel: caps the price paid but retains benefit if prices fall\n- Cost: option premium (insurance premium analogy)\n- More flexible than futures — hedges the downside without sacrificing upside\n\n**Swaps:**\n- OTC agreement to exchange fixed vs. floating commodity prices over a period\n- Airline enters fuel swap: pays fixed price monthly, receives market price — net payment is fixed regardless of spot moves\n- Less exchange-traded flexibility but can be highly customized\n\n**Zero-cost collar:**\n- Buy a call option (cap upside cost) + Sell a put option (give up some downside benefit)\n- Net premium ≈ zero — popular when option premiums are expensive\n\n**Hedging accounting:**\n- Under IFRS 9 / ASC 815, designated hedges get **hedge accounting**: gains/losses deferred in OCI, recognized when hedged item affects P&L — eliminates accounting mismatch\n- Without hedge designation: mark-to-market through P&L every quarter — creates earnings volatility even for economically sound hedges",
          highlight: ["commodity hedging", "futures", "call options", "swap", "zero-cost collar", "hedge accounting", "OCI"],
        },
        {
          type: "quiz-mc",
          question:
            "An airline wants to hedge jet fuel costs for the next 12 months. Which combination of instruments best protects against fuel price spikes while retaining some upside if prices fall?",
          options: [
            "Buy call options on jet fuel — caps the maximum price paid but profits if fuel prices fall below the strike",
            "Short futures on jet fuel — receives profit when prices fall, exactly offsetting the cost reduction",
            "Enter a fixed-price swap — pays fixed rate every month regardless of spot prices, eliminating all price uncertainty",
            "Use a zero-cost collar — buy a call to cap upside costs, sell a put to offset premium cost, but give up the benefit if prices fall significantly",
          ],
          correctIndex: 0,
          explanation:
            "Call options give the airline the right (not obligation) to buy fuel at the strike price. If fuel prices spike, the option pays off, limiting the airline's cost. If fuel prices fall, the airline simply lets the option expire and buys at the lower spot price — benefiting fully from the decline (minus the premium paid). Short futures lock in a price but forgo any benefit from falling prices. Fixed swaps eliminate all uncertainty (good for budget planning but no upside). The zero-cost collar is a reasonable compromise but gives away downside benefit — the question asks for retaining upside, so calls are optimal.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Volume discounts from a single supplier are always preferable to maintaining multiple suppliers at higher unit costs.",
          correct: false,
          explanation:
            "False. Volume discounts reduce unit costs but concentrate supply risk — the Kraljic matrix would classify such a sole-source critical supplier as 'strategic,' requiring a partnership approach and risk mitigation, not pure cost optimization. The COVID-19 pandemic demonstrated that production stoppages from sole-source disruptions can cost far more than any volume discount saves. For strategic and bottleneck items, supply continuity and risk diversification often outweigh the cost savings from concentration. Leverage-category items (multiple suppliers, low supply risk) are where aggressive volume consolidation and discounting is appropriate.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A global automaker spends $2B annually on steel (many suppliers globally), $500M on proprietary battery management chips (single supplier), $50M on custom seals (two suppliers, 18-week lead time), and $10M on office supplies (hundreds of suppliers).",
          question: "Using the Kraljic matrix, how should the automaker prioritize procurement strategy?",
          options: [
            "Steel = Leverage (competitive bidding for cost); Chips = Strategic (deep partnership, dual-source program); Seals = Bottleneck (safety stock, qualify second supplier urgently); Office = Non-critical (automate/delegate)",
            "Steel = Strategic (highest spend, critical); Chips = Leverage (electronics commodity); Seals = Non-critical (small spend); Office = Bottleneck (many suppliers needed)",
            "All four categories should use competitive bidding to minimize costs across the board",
            "Chips = Non-critical (small spend relative to steel); Steel = Strategic (largest spend drives most profit impact)",
          ],
          correctIndex: 0,
          explanation:
            "The Kraljic classification: Steel ($2B, many suppliers) = Leverage — high profit impact, low supply risk → compete aggressively for savings. Chips ($500M, sole-source) = Strategic — high impact AND high risk → long-term partnership, co-development, urgently qualify a second source. Seals ($50M, two suppliers, 18-week lead time) = Bottleneck — low spend but high supply risk → build safety stock, qualify a third supplier. Office supplies = Non-critical — automate with purchasing cards. The automaker's most urgent action is the Bottleneck seals: a $50M spend could stop $2B+ of production if a supplier fails.",
          difficulty: 3,
        },
      ],
    },
  ],
};
