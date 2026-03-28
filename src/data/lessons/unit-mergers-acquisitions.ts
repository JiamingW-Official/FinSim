import type { Unit } from "./types";

export const UNIT_MERGERS_ACQUISITIONS: Unit = {
  id: "mergers-acquisitions",
  title: "Mergers & Acquisitions",
  description:
    "Master M&A strategy, deal structures, valuation methods, due diligence, post-merger integration, and shareholder value creation",
  icon: "Merge",
  color: "#d946ef",
  lessons: [
    // ─── Lesson 1: M&A Rationale & Strategy ─────────────────────────────────────
    {
      id: "ma-1",
      title: "🤝 M&A Rationale & Strategy",
      description:
        "Strategic vs financial buyers, synergy types, merger classifications, and accretion/dilution analysis",
      icon: "Target",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🏢 Strategic vs Financial Buyers",
          content:
            "**Who buys companies — and why?**\n\nIn any M&A deal, the acquirer falls into one of two camps, and the difference shapes deal structure, pricing, and post-deal plans.\n\n**Strategic Buyers** (corporations):\n- Buy to create **synergies** — combined value > sum of parts\n- Willing to pay more because synergies justify a higher price\n- Example: Google buying YouTube to extend into video advertising\n- Motivated by market share, capabilities, geographic expansion, or eliminating a competitor\n\n**Financial Buyers** (private equity firms):\n- Buy for **financial engineering** — use leverage to amplify equity returns\n- Focus on cash flow, operational improvement, and eventual re-sale\n- Typically pay lower prices (no synergy premium) but use 60–70% debt\n- Hold for 3–7 years, then exit via IPO or sale to a strategic buyer\n- Example: KKR buying a mature industrial company, cutting costs, paying down debt\n\n**Key implication:** Strategic buyers can outbid PE firms because they can justify a higher price by capturing synergies. PE firms set the **floor** for what a company is worth as a standalone business.",
          highlight: ["strategic buyers", "financial buyers", "synergies", "financial engineering", "private equity"],
        },
        {
          type: "teach",
          title: "💡 Types of Synergies",
          content:
            "**Synergies are the core rationale for paying a premium.** Bankers classify synergies into three buckets:\n\n**1. Revenue Synergies** (hardest to achieve):\n- **Cross-selling**: sell each company's products to the other's customers\n- **Pricing power**: combined entity has more market share, can raise prices\n- **New markets**: acquirer's distribution network accelerates target's geographic expansion\n- Typical realization: 30–40% in years 1–3 (uncertain, lumpy)\n\n**2. Cost Synergies** (most reliable):\n- **SG&A elimination**: remove duplicate corporate functions (HR, finance, legal, IT)\n- **Procurement savings**: combined purchasing volume yields better supplier terms\n- **Manufacturing**: consolidate plants, reduce overhead\n- Typical realization: 70–80% in years 1–2 (near-certain after restructuring)\n\n**3. Financial Synergies** (structural):\n- **Tax benefits**: use target's net operating loss (NOL) carryforwards to offset profits\n- **Lower cost of capital**: larger combined entity may achieve better credit rating, reducing borrowing costs\n- **Balance sheet optimization**: target's excess cash can fund acquirer's growth\n\n**Rule of thumb:** Deals capture 50–70% of projected synergies within 3 years. Acquirers often overpay by assuming 100% realization.",
          highlight: ["revenue synergies", "cost synergies", "financial synergies", "cross-selling", "SG&A", "NOL"],
        },
        {
          type: "teach",
          title: "🔀 Merger Types & Antitrust Considerations",
          content:
            "**Not all mergers are created equal.** Regulators assess each type differently.\n\n**Horizontal Merger**: Two competitors in the same industry combine.\n- Example: Sprint + T-Mobile (telecom), Exxon + Mobil (oil majors)\n- Creates market power — **highest antitrust scrutiny**\n- FTC/DOJ analyze market concentration using the **Herfindahl-Hirschman Index (HHI)**\n- Deals increasing HHI above 2,500 by 200+ points face likely challenge\n\n**Vertical Merger**: Company acquires a supplier or distributor.\n- Example: Amazon buying Whole Foods (retailer buying grocery chain)\n- Concerns: foreclosure of competitors from key inputs or distribution\n- Generally less scrutinized than horizontal, but rising enforcement in tech\n\n**Conglomerate Merger**: Companies in unrelated industries combine.\n- Example: Berkshire Hathaway's diversified holdings (insurance, rail, consumer)\n- Rationale: diversification, capital allocation across cycles\n- Fell out of favor in 1980s–90s as \"conglomerate discount\" was identified\n- Markets prefer focused businesses — conglomerates often trade at 10–20% discount to sum-of-parts\n\n**Merger of Equals (MoE)**: Both companies roughly the same size, both contribute to combined entity.\n- Political challenges: leadership roles, headquarters location, culture\n- Examples often struggle post-merger due to divided authority",
          highlight: ["horizontal merger", "vertical merger", "conglomerate", "antitrust", "HHI", "merger of equals", "conglomerate discount"],
        },
        {
          type: "teach",
          title: "📈 Accretion/Dilution Analysis",
          content:
            "**The first question every acquirer's board asks: does this deal increase our EPS?**\n\nA deal is **accretive** if the combined company's EPS is higher than the acquirer's standalone EPS. It is **dilutive** if combined EPS is lower.\n\n**Key mechanics:**\n- In a cash deal: acquirer foregoes interest income (opportunity cost) or pays interest on acquisition debt — both reduce net income\n- In a stock deal: acquirer issues new shares, increasing the share count (denominator)\n- The deal is accretive if the **earnings yield of the target** (E/P ratio) exceeds the **after-tax cost of financing**\n\n**Shortcut rule for stock deals:**\nA stock deal is accretive if Target P/E < Acquirer P/E\n- Acquirer trades at 20× P/E, target at 15× P/E → accretive (buying cheaper earnings)\n- Acquirer trades at 15×, target at 20× → dilutive (paying up for earnings)\n\n**Synergy offset:** Even a dilutive deal at close may become accretive in year 2–3 as synergies flow through.\n\n**Example:** Acquirer EPS = $2.00, issues 50M new shares (was 100M). Net income added from target (post-financing) = $80M.\nNew EPS = ($200M + $80M) / 150M shares = **$1.87 — dilutive by 6.5%**\n\nBoards typically accept modest dilution if synergies provide a clear path to accretion within 3 years.",
          highlight: ["accretion", "dilution", "EPS", "earnings yield", "P/E", "synergy offset"],
        },
        {
          type: "quiz-mc",
          question:
            "Company A trades at P/E 20× and acquires Company B at P/E 15× in an all-stock deal with no synergies. What happens to Company A's EPS?",
          options: [
            "EPS increases — the deal is accretive because A is buying cheaper earnings",
            "EPS decreases — the deal is dilutive because A issues expensive stock",
            "EPS is unchanged — stock deals always preserve EPS",
            "EPS decreases — lower P/E target always causes dilution",
          ],
          correctIndex: 0,
          explanation:
            "In an all-stock deal, accretion/dilution depends on relative P/E ratios. When the acquirer's P/E (20×) is higher than the target's P/E (15×), the acquirer is exchanging high-valued shares for cheaper earnings — the deal is accretive. Each share issued by A has less earnings backing per share than the earnings being acquired from B. The deal increases combined EPS for A's shareholders.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Cost synergies are generally harder to achieve and less certain than revenue synergies in a post-merger integration.",
          correct: false,
          explanation:
            "False. Cost synergies are typically more certain and faster to realize than revenue synergies. Eliminating duplicate corporate functions (SG&A, IT, HR) is operationally straightforward with 70–80% realization in years 1–2. Revenue synergies — cross-selling, pricing power, new markets — depend on customer behavior and commercial execution, with only 30–40% typically realized in the same period. Boards and analysts apply higher discount rates to projected revenue synergies.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Deal Structures & Consideration ──────────────────────────────
    {
      id: "ma-2",
      title: "💰 Deal Structures & Consideration",
      description:
        "Cash, stock, mixed consideration, collar structures, and earnouts — how deals are priced and paid",
      icon: "Banknote",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "💵 Cash Acquisition",
          content:
            "**All-cash deals are simple for sellers but complex for acquirers.**\n\n**From the seller's perspective:**\n- Receives immediate, certain value — no stock price risk after signing\n- **Capital gains tax triggered**: selling shareholders recognize gain in the year of closing\n- No participation in the combined company's future upside\n\n**From the acquirer's perspective:**\n- Uses cash on hand or borrows (leveraged acquisition)\n- No execution risk: deal value is fixed, seller doesn't care about acquirer's stock price\n- Interest expense on acquisition debt reduces net income\n- **Signals confidence**: paying cash signals the acquirer believes the target is worth the price and their own stock may be undervalued\n\n**Where does the cash come from?**\n1. **Balance sheet cash**: acquirer uses accumulated cash (Apple, Berkshire Hathaway)\n2. **Bridge loan + term loan**: investment banks provide committed financing, refinanced into permanent debt post-close\n3. **Revolving credit facility**: drawn down to fund the purchase\n\n**Tax treatment matters:** In a cash deal, the seller's tax basis is stepped up to the purchase price (Section 338 election in the US), giving the acquirer higher depreciation/amortization on acquired assets.",
          highlight: ["cash acquisition", "capital gains", "bridge loan", "tax basis step-up", "execution risk"],
        },
        {
          type: "teach",
          title: "📄 Stock-for-Stock Exchange",
          content:
            "**In a stock deal, the acquirer pays with newly issued shares rather than cash.**\n\n**Exchange ratio**: The number of acquirer shares each target share receives.\nExample: Acquirer at $40/share acquires target at $20/share → exchange ratio of 0.5× (each target share gets 0.5 acquirer shares)\n\n**Seller benefits:**\n- **Tax deferral**: no capital gains until sellers eventually sell acquirer stock\n- **Upside participation**: sellers keep exposure to combined company's future performance\n- Particularly attractive if acquirer stock is high-quality and expected to appreciate\n\n**Seller risks:**\n- **Market risk between signing and closing** (typically 3–6 months): if acquirer stock falls, effective deal value declines\n- Sellers become minority shareholders in an entity they don't control\n\n**Acquirer benefits:**\n- Preserves cash, no acquisition debt\n- Signals shared belief in combined company's future\n\n**Acquirer risks:**\n- **Dilution**: new shares reduce EPS and existing shareholders' percentage ownership\n- Signals acquirer may believe its own stock is overvalued (informational signal)\n- If acquirer stock falls before close, target shareholders may push for renegotiation or walk away\n\n**Historical insight**: Studies show acquirers underperform more in stock deals than cash deals in the 3 years post-announcement — consistent with the overvalued-stock signal theory.",
          highlight: ["exchange ratio", "stock-for-stock", "tax deferral", "dilution", "market risk", "overvalued stock signal"],
        },
        {
          type: "teach",
          title: "🔀 Mixed Consideration & Collar Structures",
          content:
            "**Most large deals use a mix of cash and stock — sharing risk and aligning incentives.**\n\n**Mixed consideration** (cash + stock):\n- Example: $15 cash + 0.2 acquirer shares per target share\n- Seller gets certainty on the cash portion while retaining upside via stock\n- Acquirer conserves some cash while limiting dilution\n- Common in mega-deals where no single financing source is sufficient\n\n**Fixed Price vs Fixed Exchange Ratio:**\n- **Fixed exchange ratio**: target gets a set number of acquirer shares regardless of price movement. Sellers bear market risk; if acquirer stock falls, effective deal value falls.\n- **Fixed price (cash equivalent)**: number of shares adjusts so sellers receive a fixed dollar value. Acquirer bears market risk (must issue more shares if stock falls).\n\n**Collar Structure** — protects both parties:\n- Sets a **band** around the acquirer share price\n- Within the collar: fixed exchange ratio applies (both sides share risk)\n- Below floor: acquirer issues more shares to preserve deal value (protects seller)\n- Above ceiling: acquirer issues fewer shares (protects acquirer from over-paying in stock)\n- Example: AT&T/Time Warner collar — fixed exchange ratio if AT&T stock $33–$43; outside that range, cash true-ups applied\n\n**Election rights**: Sellers often can choose cash or stock (subject to proration), letting them optimize for tax and portfolio objectives.",
          highlight: ["mixed consideration", "collar structure", "fixed exchange ratio", "fixed price", "election rights", "proration"],
        },
        {
          type: "teach",
          title: "🎯 Earnouts: Contingent Consideration",
          content:
            "**An earnout bridges the valuation gap when buyer and seller disagree on the future.**\n\n**How it works:**\nSeller receives additional payment if the acquired business hits agreed-upon performance milestones post-close.\n\nExample: Buyer pays $200M upfront + up to $50M earnout if EBITDA exceeds $30M in year 2.\n\n**When earnouts are used:**\n- High-growth companies with uncertain future cash flows (biotech, SaaS startups)\n- Private company acquisitions with information asymmetry\n- Founder-led businesses where the founder's continued effort drives value\n- Post-COVID deals where near-term forecasts were highly uncertain\n\n**Earnout structure details:**\n- **Metrics**: revenue, EBITDA, new customer count, clinical trial milestones (pharma)\n- **Period**: typically 1–3 years post-close\n- **Payout curve**: cliff (all or nothing), linear (pro-rata), or tiered\n\n**Tensions and disputes:**\nEarnouts are the most litigated part of M&A contracts. Common issues:\n- Buyer changes business strategy, preventing seller from hitting targets\n- Accounting policies affect whether milestones are met\n- Buyer allocates shared costs to acquired business unfairly\n\n**Key drafting principle**: Define measurement metric, accounting methodology, and buyer's obligations to support the business — with precision.",
          highlight: ["earnout", "contingent consideration", "milestones", "valuation gap", "information asymmetry"],
        },
        {
          type: "quiz-mc",
          question:
            "A seller prefers all-cash consideration while the buyer prefers all-stock. What best explains this divergence in interests?",
          options: [
            "Seller wants certainty and immediate liquidity; buyer wants to preserve cash and avoid diluting existing shareholders",
            "Seller wants upside in the combined company; buyer wants to avoid capital gains taxes",
            "Seller prefers tax deferral; buyer wants to use overvalued stock as currency",
            "Sellers always prefer cash; buyers always prefer stock — there is no strategic logic",
          ],
          correctIndex: 0,
          explanation:
            "The seller prefers cash because it delivers immediate, certain value — no exposure to the acquirer's post-deal stock performance. The buyer prefers stock to preserve its cash balance, avoid acquisition debt, and limit the dilution impact vs issuing a large amount of stock. Stock deals also share deal risk with the seller (if the deal underperforms, both sides lose). This tension is resolved through mixed consideration, collar structures, or earnouts that balance the competing interests.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Acquirer stock is at $50. Target shareholders are to receive 0.4 acquirer shares per target share (fixed exchange ratio). Between signing and close (4 months), acquirer stock falls to $40.",
          question: "What is the effective change in deal value for target shareholders, and what mechanism could have protected them?",
          options: [
            "Deal value fell from $20 to $16 per target share (-20%); a collar with a floor could have protected them",
            "Deal value is unchanged because the exchange ratio is fixed",
            "Deal value fell; an earnout would have protected them from price movement",
            "Deal value increased because fewer shares are needed to close the deal",
          ],
          correctIndex: 0,
          explanation:
            "With a fixed exchange ratio of 0.4×, each target share was worth 0.4 × $50 = $20 at signing. After the stock drop, each target share is worth 0.4 × $40 = $16 — a $4 or 20% drop in value. A collar with a floor (e.g., deal value guaranteed at $18 minimum) would have required the acquirer to issue additional shares below the floor price, protecting sellers from excessive acquirer stock price risk between signing and close.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: M&A Valuation ─────────────────────────────────────────────────
    {
      id: "ma-3",
      title: "📊 M&A Valuation",
      description:
        "Stand-alone DCF, synergy valuation, comparable transactions, contribution analysis, and LBO floor analysis",
      icon: "Calculator",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🔢 Stand-Alone Value: DCF & Trading Multiples",
          content:
            "**The starting point for any M&A valuation is the target's stand-alone value — what it's worth with no deal.**\n\n**1. DCF (Discounted Cash Flow):**\n- Project unlevered free cash flows (FCF) for 5–10 years\n- Apply WACC as the discount rate (using target's own capital structure / industry beta)\n- Add terminal value (Gordon Growth or exit multiple)\n- Subtract net debt to get equity value\n\n**Why stand-alone matters:** The board's fairness opinion must show the deal price is above what the company could achieve independently. A deal at a discount to DCF would fail the board's fiduciary duty to shareholders.\n\n**2. Trading Comparables (\"Comps\"):**\n- Find public peers with similar business model, size, growth profile, margins\n- Calculate EV/EBITDA, EV/Revenue, P/E for trailing and forward periods\n- Apply median multiple to target's financials\n\n**Example:**\nTarget EBITDA = $40M, peer median EV/EBITDA = 10×\nImplied stand-alone EV = $400M\nWith $50M net debt → Stand-alone equity value = $350M\n\n**DCF vs comps cross-check**: If DCF yields $380M and comps yield $350M, the mid-point guidance is ~$365M stand-alone value. The acquirer must offer a premium above this range to win shareholder approval.",
          highlight: ["stand-alone value", "DCF", "trading comparables", "WACC", "EV/EBITDA", "fairness opinion"],
        },
        {
          type: "teach",
          title: "💡 Synergy Valuation",
          content:
            "**Synergies are what separate an acquirer's maximum bid from the stand-alone value.**\n\n**How to value synergies:**\nSynergy Value = PV of (incremental after-tax cash flows) discounted at WACC\n\n**Cost synergy example:**\n- Eliminate $20M/year in duplicate SG&A\n- Tax rate 25% → after-tax savings = $15M/year\n- Assume 80% realized by year 2, fully by year 3\n- Terminal growth 2.5%, WACC 8% → PV of cost savings ≈ $15M / (0.08 – 0.025) × (1 – tax integration costs) ≈ **$200–250M**\n\n**Revenue synergy example:**\n- Cross-sell target product into acquirer's 10,000 accounts\n- Penetration rate 20%, avg deal size $50K → $100M additional revenue\n- At 30% EBITDA margin → $30M EBITDA, valued at 10× = **$300M**\n- But apply 40% probability adjustment → risk-adjusted value = **$120M**\n\n**Synergy sharing:**\nThe **control premium** (typically 20–40%) represents the portion of synergies the acquirer is willing to share with target shareholders.\n- Full synergy value: $350M\n- Acquirer keeps $200M, shares $150M with target shareholders\n- Premium paid = $150M / stand-alone equity value\n\n**Key rule:** Acquirers should not pay more than stand-alone value + 100% of synergies. Anything above that is value destruction.",
          highlight: ["synergy valuation", "control premium", "cost synergies", "revenue synergies", "risk-adjusted", "value destruction"],
        },
        {
          type: "teach",
          title: "📐 Comparable Transactions & Contribution Analysis",
          content:
            "**Precedent transactions tell us what strategic buyers have paid for similar assets.**\n\n**Comparable Transactions (\"Precedents\"):**\n- Screen for deals in the same sector over the past 3–5 years\n- Calculate EV/EBITDA, EV/Revenue, P/E paid in each deal\n- Adjust for size, strategic rationale, market conditions\n- These multiples include a **control premium** (20–40% above trading value)\n\nExample: 8 comparable deals average 12× EV/EBITDA\nTarget EBITDA = $40M → Implied deal EV = **$480M**\nvs. trading comps at 10× = $400M → implied premium = 20%\n\n**Contribution Analysis:**\nAsks: what % of the combined company's revenue, EBITDA, and FCF does each company contribute — and does the proposed ownership split (from exchange ratio) reflect those contributions?\n\nExample:\n- Acquirer contributes 75% of revenue, 70% of EBITDA → expects ~75% of combined company\n- But acquirer issues shares such that target gets 30% ownership → target is getting more than contribution\n- This flags potential overpayment by the acquirer\n\n**When contribution analysis matters:**\nMergers of equals rely heavily on this: neither party controls the narrative, so contribution analysis is the anchor for negotiating the exchange ratio.\n\n**LBO floor analysis:**\nWhat would a PE firm pay? Models entry price where PE achieves minimum 20% IRR (2× equity in 4 years). This sets the **floor** — any credible strategic buyer should offer above LBO value.",
          highlight: ["comparable transactions", "control premium", "contribution analysis", "exchange ratio", "LBO floor", "precedents"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Target company trades at 10× EV/EBITDA (stand-alone). Comparable M&A transactions average 12× EV/EBITDA. The acquirer projects $50M in annual synergies (EBITDA-level). Target's current EBITDA is $80M. WACC is 8%, long-term growth 2.5%.",
          question: "What is the acquirer's maximum justifiable offer price (EV), incorporating synergies at full value?",
          options: [
            "$960M — combining $640M for target EBITDA at 8× synergy-adjusted + $320M PV of synergies",
            "$800M — target EBITDA of $80M × 10× stand-alone + all synergies",
            "$1,709M — target EBITDA of $80M × 12× comps + full PV of $50M synergies at WACC",
            "$960M — $80M × 12× (comparable deal multiple) = $960M, synergies are already in the multiple",
          ],
          correctIndex: 2,
          explanation:
            "Step 1: Comparable transaction value = $80M × 12× = $960M (reflects control premium, no synergies). Step 2: Synergy PV = $50M after-tax / (WACC – g) = $50M × 0.75 / (0.08 – 0.025) = $37.5M / 0.055 ≈ $682M (using terminal value approach). Total maximum bid = $960M + $682M ≈ $1,642M — but practically, acquirers apply a 50% synergy realization discount, arriving at ~$1,300M. The $1,709M option reflects full 100% synergy capture applied at face multiple. The acquirer should not pay more than stand-alone + 100% of synergies.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Contribution analysis compares how much revenue and EBITDA each company contributes to the combined entity versus the ownership percentage each side receives — and can flag whether an acquirer is overpaying.",
          correct: true,
          explanation:
            "True. Contribution analysis is a cross-check tool used especially in mergers of equals. If Company A contributes 70% of combined EBITDA but the exchange ratio gives it only 60% of the combined company's shares, A is effectively overpaying — transferring value to B's shareholders. Bankers present this analysis alongside DCF and comps to give the board a full picture of deal fairness.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Due Diligence & Process ──────────────────────────────────────
    {
      id: "ma-4",
      title: "🔍 Due Diligence & Process",
      description:
        "Workstreams, MAC clauses, virtual data rooms, exclusivity periods, and R&W insurance",
      icon: "Search",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🗂️ Due Diligence Workstreams",
          content:
            "**Due diligence is the structured process by which a buyer verifies everything they think they know about a target.**\n\nTypically runs 4–8 weeks for a private company, 2–4 months for large public deals. Organized into parallel workstreams:\n\n**Financial DD** (accounting firm):\n- Quality of earnings (QoE): normalize EBITDA, identify one-time items, confirm recurring revenue\n- Working capital peg: determine normal working capital for price adjustment at close\n- Off-balance-sheet liabilities, contingent liabilities, pension obligations\n\n**Tax DD** (tax advisors):\n- Unresolved tax disputes, transfer pricing exposure, NOL limitations\n- Optimal deal structure for step-up in tax basis\n\n**Legal DD** (outside counsel):\n- Material contracts (change-of-control provisions — counterparties can terminate on acquisition)\n- Litigation exposure, IP ownership, regulatory licenses\n- Employment agreements, non-compete enforceability\n\n**Commercial DD** (strategy consultants or buyer team):\n- Validate market size and competitive position\n- Customer concentration risk, churn rates, pipeline quality\n\n**Operational DD**: Supply chain, manufacturing, IT systems, integration readiness\n\n**HR & Culture DD**: Key talent retention, compensation, pension liabilities, union contracts\n\n**ESG DD** (increasingly standard): Environmental liabilities, governance gaps, social controversies\n\n**Findings translate into:** Price adjustments, representation & warranty claims, escrow holdbacks, or deal termination.",
          highlight: ["due diligence", "quality of earnings", "working capital peg", "change-of-control", "commercial due diligence", "ESG"],
        },
        {
          type: "teach",
          title: "⚠️ MAC Clauses & Walkaway Rights",
          content:
            "**A Material Adverse Change (MAC) clause is the buyer's right to walk away if the target's business fundamentally deteriorates between signing and closing.**\n\n**What triggers a MAC?**\nTypically defined as changes that have or would reasonably be expected to have a materially adverse effect on the target's business, financial condition, or results of operations.\n\n**MAC carve-outs** (things that do NOT trigger MAC):\n- General economic conditions or financial market downturns\n- Industry-wide effects (COVID-19 pandemic was broadly carved out)\n- Changes in law or regulation affecting the industry generally\n- Acts of war or terrorism\n\n**MAC inclusions** (can trigger MAC):\n- Loss of a key customer or contract representing >10% of revenue\n- Material regulatory action specific to the company\n- Discovery of fraud or accounting irregularities\n\n**Legal standard (Delaware courts):**\nMAC clauses are very hard to invoke — courts require the adverse change to be **durationally significant** (not just a temporary blip). Only a handful of MAC terminations have been upheld in Delaware courts.\n\n**Practical use:**\nBuyers primarily use MAC threats as **renegotiation leverage** rather than actual termination. If the target's business deteriorates, buyer renegotiates price using MAC as leverage, avoiding litigation.\n\n**Reverse termination fee:** If the buyer walks away without valid MAC, they owe a reverse break fee (typically 3–5% of deal value).",
          highlight: ["MAC clause", "material adverse change", "carve-outs", "reverse termination fee", "Delaware courts", "renegotiation leverage"],
        },
        {
          type: "teach",
          title: "🔐 Virtual Data Rooms & Process Management",
          content:
            "**The virtual data room (VDR) is the secure digital repository where sellers share confidential information with potential buyers.**\n\n**VDR structure:**\n- Organized by workstream: financials, legal, HR, IT, commercial\n- Tiered access: Phase 1 (limited, to all bidders) → Phase 2 (full access, to shortlisted bidders)\n- Activity tracking: seller can see which pages each bidder views — revealing interest areas and concerns\n\n**M&A process timeline (sell-side auction):**\n\n**Phase 1 — Preparation (4–8 weeks):**\n- Prepare Confidential Information Memorandum (CIM): 50–100 page marketing document\n- Financial model with 5-year projections\n- Management presentation deck\n\n**Phase 2 — First round (4–6 weeks):**\n- Distribute teaser (1–2 pages) and CIM to potential buyers\n- Collect Indications of Interest (IOIs) — non-binding price ranges\n- Seller selects 3–6 buyers for Phase 2\n\n**Phase 3 — Second round (6–8 weeks):**\n- Full VDR access, management presentations, site visits\n- Buyers submit Final Binding Bids\n- Seller selects preferred bidder, negotiates Purchase Agreement\n\n**Exclusivity period:**\nOnce preferred bidder is selected, seller grants **30–60 days of exclusivity** — no shopping the deal to other buyers while the purchase agreement is finalized.\n\n**Go-shop provision:** Some deals allow the buyer's target to solicit competing bids for 30–45 days post-signing — common in PE-backed deals to satisfy the board's fiduciary duty.",
          highlight: ["virtual data room", "CIM", "indications of interest", "exclusivity period", "go-shop", "phase 1 bid", "phase 2 bid"],
        },
        {
          type: "teach",
          title: "📋 Representations, Warranties & R&W Insurance",
          content:
            "**The purchase agreement's representations and warranties (R&W) are the seller's promises about the accuracy of disclosed information.**\n\n**What reps and warranties cover:**\n- Financial statements are accurate and GAAP-compliant\n- No undisclosed material litigation\n- All material contracts are disclosed and valid\n- IP is owned by the company, not infringed\n- No material customer or supplier relationships at risk\n- Tax returns are accurate, no material disputes\n- Employees are properly classified, no unpaid benefits\n\n**Indemnification**: If a rep is breached (seller lied or made a material mistake), seller indemnifies buyer for damages.\n\n**Indemnification caps & baskets:**\n- **Basket (deductible)**: seller only pays if aggregate claims exceed 0.5–1% of deal value\n- **Cap**: seller's total liability typically 10–20% of deal value (or 100% for fraud)\n- **Survival period**: reps survive for 18–24 months post-close (longer for tax and fundamental reps)\n\n**R&W Insurance (increasingly standard):**\n- Buyer or seller purchases an insurance policy that pays claims if reps are breached\n- Allows seller to walk away clean (distribute proceeds to investors without holdback)\n- Typical premium: 2–4% of coverage amount; deductible: 1% of deal value\n- Common in PE-backed transactions where seller wants clean exit\n\n**Escrow holdback:** Without R&W insurance, 10–15% of deal proceeds held in escrow for 12–24 months to fund potential indemnification claims.",
          highlight: ["representations and warranties", "indemnification", "R&W insurance", "basket", "cap", "escrow holdback", "survival period"],
        },
        {
          type: "quiz-mc",
          question:
            "During due diligence, the buyer discovers that 20% of the target's revenue comes from a single customer whose contract expires in 12 months with no renewal committed. How does this most likely affect the deal?",
          options: [
            "Buyer reduces the offer price or demands an escrow holdback contingent on customer renewal; may add an earnout tied to retention",
            "Buyer walks away immediately — single customer concentration always terminates deals",
            "Buyer increases the offer price to compensate for the higher risk they are taking on",
            "No impact — customer concentration is a standard carve-out in MAC clauses",
          ],
          correctIndex: 0,
          explanation:
            "Customer concentration is a significant finding that affects valuation and deal structure, not typically an outright deal-killer. The buyer will adjust the offer price downward to reflect the risk (discounting the 20% revenue stream at a higher rate or applying probability of loss). They may also negotiate an escrow holdback released only if the customer renews, or an earnout tied to retention. The MAC clause protects the buyer if the customer leaves between signing and close — but won't automatically terminate the deal pre-signing.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "The exclusivity period in an M&A process gives the seller the right to shop the deal to other bidders for 30–60 days after signing.",
          correct: false,
          explanation:
            "False. It is the opposite. The exclusivity period (or 'no-shop' provision) is granted to the BUYER — it prohibits the seller from soliciting or negotiating with other potential acquirers for 30–60 days while the purchase agreement is finalized. This protects the buyer's investment of time and due diligence resources. A 'go-shop' provision, by contrast, does allow the seller to seek competing bids for a defined window post-signing — but this is the exception, not the standard.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Post-Merger Integration & Value Creation ─────────────────────
    {
      id: "ma-5",
      title: "🔧 Post-Merger Integration & Value Creation",
      description:
        "Integration planning, culture clash, synergy tracking, divestitures, and M&A track record research",
      icon: "GitMerge",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📅 Integration Planning: Day 1 to Year 3",
          content:
            "**The deal closes on Day 1. The real work begins immediately.**\n\nIntegration planning starts during due diligence — not after close. Best-in-class acquirers have a detailed Day 1 readiness plan before the ink is dry.\n\n**Day 1 Readiness:**\n- Employee communications: who reports to whom, what changes immediately vs. what doesn't\n- Customer and supplier communications: continuity assurance\n- IT access and system continuity: payroll, email, ERP must function on Day 1\n- Legal entity consolidation plan\n- Branding decisions (maintain target brand or migrate to acquirer's?)\n\n**100-Day Plan:**\n- Quick wins: capture cost synergies with immediate headcount reductions or procurement renegotiations\n- Organizational design finalized: reporting structures, leadership team\n- Product roadmap alignment\n- Integration Management Office (IMO) established: tracks synergy milestones\n\n**1–3 Year Plan:**\n- Systems integration (ERP, CRM consolidation) — often the longest and most expensive component\n- Full supply chain integration\n- Culture unification programs\n- Full synergy capture and verification vs. deal model\n\n**Integration costs are real:** Acquirers typically spend 2–5% of deal value on integration, including severance, IT migration, rebranding, and facility consolidation. These costs must be modeled alongside synergy benefits.",
          highlight: ["Day 1 readiness", "100-day plan", "Integration Management Office", "synergy tracking", "integration costs", "ERP migration"],
        },
        {
          type: "teach",
          title: "🧩 Culture Clash: The #1 Reason Deals Fail",
          content:
            "**Hard assets merge in months. Culture takes years — and often breaks deals.**\n\n**Research finding:** McKinsey, Bain, and academic studies consistently show that **cultural incompatibility is cited as the #1 reason for M&A value destruction**.\n\n**Famous cultural failures:**\n- **Daimler + Chrysler (1998)**: German engineering culture vs. American manufacturing culture — described as a \"merger of unequals\" by Chrysler executives. Sold off after $36B write-down.\n- **AOL + Time Warner (2000)**: Internet startup culture vs. traditional media — $99B write-down, one of the largest in history.\n- **HP + Compaq (2002)**: Contentious shareholder vote, competing engineering cultures, market share losses post-merger.\n\n**Cultural dimensions that clash:**\n- Decision-making speed (startup vs. large corporate)\n- Risk tolerance and innovation appetite\n- Compensation philosophy (high variable vs. salary-heavy)\n- Management hierarchy (flat vs. hierarchical)\n- Geographic/national cultures in cross-border deals\n\n**Best practices:**\n- Conduct **culture due diligence** alongside financial DD — employee surveys, leadership interviews\n- Designate a **Chief Integration Officer** (often ex-McKinsey) with authority across both organizations\n- **Retain key talent** with stay bonuses (typically 1–2× annual comp, vest over 18–24 months)\n- Communicate early and often — uncertainty drives voluntary attrition of top performers",
          highlight: ["culture clash", "Daimler Chrysler", "AOL Time Warner", "culture due diligence", "Chief Integration Officer", "stay bonuses", "value destruction"],
        },
        {
          type: "teach",
          title: "📊 Synergy Tracking & Integration Management Office",
          content:
            "**Synergies don't happen automatically — they must be managed with the rigor of a P&L.**\n\n**Integration Management Office (IMO):**\n- Centralized team (typically 10–20 people for large deals) reporting to CEO/CFO\n- Tracks every synergy initiative with owner, timeline, dollar value, and status\n- Weekly IMO meetings: review red/yellow/green status; escalate blockers\n- Reports synergy realization to board and investors quarterly\n\n**Synergy tracking framework:**\n- **Identified**: management has identified the opportunity\n- **Committed**: functional owner has committed to delivering by date X\n- **In-flight**: actions taken, costs incurred, partial benefit being realized\n- **Captured**: fully in the run-rate P&L, auditable by finance\n\n**Why synergies slip:**\n1. Optimistic assumptions in the deal model (revenue synergies especially)\n2. Integration costs exceed plan (IT more expensive than modeled)\n3. Voluntary attrition of key talent (revenue leaves with the people)\n4. Regulatory constraints (competitor synergies blocked by antitrust conditions)\n5. Customer defections (customers leave because of uncertainty or relationship disruption)\n\n**Investor communications:**\nAcquirer management provides synergy guidance at deal announcement and updates quarterly. Missing synergy targets is a major stock price risk. Research shows acquirer stocks underperform by an average of 3–5% in the 3 years following deal announcement.",
          highlight: ["Integration Management Office", "synergy tracking", "synergy realization", "IMO", "run-rate", "investor communications"],
        },
        {
          type: "teach",
          title: "🔄 Divestitures & Portfolio Optimization",
          content:
            "**Selling assets is as important as buying them — especially after acquisitions create sprawling portfolios.**\n\n**Why divest?**\n1. **Focus**: post-merger portfolio may include non-core businesses acquired alongside the target\n2. **Debt reduction**: proceeds from divestitures pay down acquisition debt, strengthening the balance sheet\n3. **Value unlock**: a business may be worth more to a strategic buyer than as a standalone division\n4. **Regulatory requirement**: antitrust regulators often require divestitures in horizontal mergers (\"fix-it-first\" remedies)\n\n**Divestiture structures:**\n- **Trade sale**: sell to another company (fastest, usually highest value)\n- **Carve-out / IPO**: create a standalone public company (retains partial ownership, market sets price)\n- **Spin-off**: distribute shares in the subsidiary to existing shareholders pro-rata (tax-free under Section 355)\n- **Split-off**: shareholders choose between parent and subsidiary shares (reduces parent share count)\n\n**Value creation from divestitures:**\nStudies show that divesting non-core assets creates more shareholder value than retaining them. The \"conglomerate discount\" (10–20%) is eliminated when companies focus on their core business.\n\n**\"Portfolio refreshment\" as strategy:**\nCompanies like Honeywell, Danaher, and GE Capital have built reputations as disciplined portfolio managers — buying assets, improving them, then divesting at a profit. This capital recycling model is a form of value creation at the holding company level.",
          highlight: ["divestiture", "spin-off", "carve-out", "split-off", "conglomerate discount", "portfolio optimization", "antitrust remedy"],
        },
        {
          type: "quiz-mc",
          question:
            "An acquirer's stock drops 5% on the day their M&A deal is announced. What does this signal about the market's view of the deal?",
          options: [
            "The market believes the acquirer is overpaying or that integration risks outweigh the synergy benefits",
            "The market always punishes acquirers on announcement day regardless of deal quality",
            "The market believes the deal will be blocked by regulators",
            "The stock drop reflects general market decline unrelated to the deal",
          ],
          correctIndex: 0,
          explanation:
            "A 5% acquirer stock decline on announcement day is a clear signal that the market views the deal skeptically — the acquirer is paying too much (overpaying relative to synergies) or the market doesn't believe the synergies will be achieved. Academic research (Andrade et al., Moeller et al.) consistently shows acquirers earn negative abnormal returns around deal announcements, especially in stock deals and large deals where the premium is high. Target shareholders typically gain 20–40% while acquirer shareholders lose 1–5%. This asymmetry reflects the winner's curse: the buyer with the most optimistic synergy estimates wins the auction but overpays.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A large consumer goods acquirer buys a direct-to-consumer startup. The startup's culture is flat, fast-moving, and equity-focused. The acquirer has 14 layers of management, annual planning cycles, and salary-heavy compensation. Integration is led by an internal team without dedicated IMO resources. Within 6 months, 40% of the startup's engineering and product team has left.",
          question: "Which integration failure does this scenario most clearly illustrate, and what should have been done?",
          options: [
            "Culture clash causing talent attrition — a dedicated IMO with stay bonuses and culture integration plan should have been established pre-close",
            "Financial synergy failure — the acquirer should have paid more to retain employees",
            "Regulatory failure — the deal should have been structured as a minority investment",
            "Due diligence failure — the acquirer should have discovered the talent risk and walked away",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook culture clash and talent retention failure — the most common post-merger value destructor. The startup's flat, equity-driven culture is incompatible with a hierarchical, bureaucratic acquirer. To prevent this, the acquirer should have: (1) conducted culture due diligence during the deal process, (2) established a dedicated IMO with authority to buffer the startup from bureaucracy, (3) implemented generous stay bonuses (1–2× comp vesting over 18–24 months) for key engineers and product leaders, and (4) created an operating model that preserved startup autonomy while integrating back-office functions. The talent attrition means the intangible assets (people, IP, institutional knowledge) that justified the premium are being destroyed.",
          difficulty: 3,
        },
      ],
    },
  ],
};
