import type { Unit } from "./types";

export const UNIT_INVESTMENT_BANKING: Unit = {
  id: "investment-banking",
  title: "Investment Banking",
  description:
    "Master valuation, M&A, IPOs, capital markets, and financial modeling — the core toolkit of Wall Street",
  icon: "Building2",
  color: "#0ea5e9",
  lessons: [
    // ─── Lesson 1: Valuation Methods ────────────────────────────────────────────
    {
      id: "ib-1",
      title: "📊 Valuation Methods",
      description:
        "DCF step-by-step, comparable company analysis, precedent transactions, and LBO overview",
      icon: "Calculator",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🔢 DCF: Free Cash Flow, WACC & Terminal Value",
          content:
            "**Discounted Cash Flow (DCF)** values a company by discounting future free cash flows back to today.\n\n**Step 1 — Free Cash Flow (FCF):**\nFCF = EBIT × (1 – Tax Rate) + D&A – CapEx – Change in Working Capital\n\nExample: EBIT $100M, tax 25%, D&A $10M, CapEx $20M, ΔWC $5M\nFCF = $75M + $10M – $20M – $5M = **$60M**\n\n**Step 2 — WACC (Weighted Average Cost of Capital):**\nWACC = (E/V) × Re + (D/V) × Rd × (1 – T)\n\nWhere Re = cost of equity (CAPM: Rf + β × ERP), Rd = cost of debt.\nExample: 60% equity at 10%, 40% debt at 5% pre-tax (25% tax):\nWACC = 0.6 × 10% + 0.4 × 5% × 0.75 = **7.5%**\n\n**Step 3 — Terminal Value (Gordon Growth Model):**\nTV = FCF_n × (1 + g) / (WACC – g)\n\nWith FCF year 5 = $80M, g = 2.5%, WACC = 7.5%:\nTV = $80M × 1.025 / 0.05 = **$1,640M**\n\nTerminal value typically represents 60–80% of total DCF value — making g and WACC assumptions the most sensitive inputs.\n\n**Step 4 — Equity Bridge:**\nEnterprise Value = PV(FCFs) + PV(TV)\nEquity Value = EV – Net Debt – Minority Interest + Cash\nEquity Value per share = Equity Value ÷ Diluted Shares Outstanding",
          highlight: ["DCF", "FCF", "WACC", "terminal value", "Gordon Growth", "equity bridge"],
        },
        {
          type: "teach",
          title: "📐 Comparable Company Analysis & Football Field Chart",
          content:
            "**Comparable Company Analysis (Comps)** values a target using multiples from similar public companies.\n\n**Key multiples:**\n- **EV/EBITDA**: Enterprise value ÷ EBITDA. Tech SaaS typically 15–25×, industrials 8–12×. Best multiple for capital-structure-neutral comparisons.\n- **EV/Revenue**: Used for high-growth companies with no earnings (early-stage SaaS, biotech).\n- **P/E**: Price per share ÷ EPS. Quick but affected by capital structure differences.\n\n**Steps:**\n1. Screen for comparable companies (same industry, similar size/growth/margins)\n2. Calculate trailing and forward multiples for each comp\n3. Apply median or mean multiple to target's metrics\n\nExample: Target EBITDA = $50M, peer median EV/EBITDA = 12×\nImplied EV = $50M × 12 = **$600M**\nWith net debt of $100M → Equity Value = **$500M**\n\n**Precedent Transactions** uses multiples paid in past M&A deals:\n- Usually commands a **20–30% control premium** over trading comps\n- Reflects strategic value (synergies) a buyer is willing to pay\n\n**Football field chart**: Bankers display the valuation range from all methods side by side:\nDCF: $480–560M | Comps: $500–620M | Precedents: $590–700M\nThe overlap zone guides negotiation on a fair price.",
          highlight: ["EV/EBITDA", "comps", "precedent transactions", "control premium", "football field"],
        },
        {
          type: "teach",
          title: "🏋️ LBO Overview: Leverage, IRR & Equity Waterfall",
          content:
            "A **Leveraged Buyout (LBO)** acquires a company using significant debt — typically 60–70% of the purchase price — with the target's own cash flows servicing the debt.\n\n**Why it works:**\n- Debt is cheaper than equity (tax-deductible interest = interest tax shield)\n- Company's FCF repays debt over time, increasing equity value\n- Leverage amplifies equity returns — both up and down\n\n**Simple LBO example:**\nPurchase price: $500M (6× EBITDA of $83M)\nDebt: $325M (65%), Equity: $175M (35%)\nYear 5: EBITDA grows to $110M, exit at 6× → EV = $660M\nDebt repaid to $200M → Equity value = $460M\nEquity return = $460M / $175M = **2.6× = ~21% IRR** over 5 years\n\n**IRR drivers (equity waterfall):**\n1. **EBITDA growth** — revenue growth + margin improvement\n2. **Debt paydown** — deleveraging from FCF increases equity value\n3. **Multiple expansion** — exiting at a higher EV/EBITDA than entry\n\n**LBO candidates:** stable cash flows, low CapEx, strong market position, management buyout potential, and identifiable operational improvement opportunities.",
          highlight: ["LBO", "leverage", "IRR", "EBITDA", "deleveraging", "equity waterfall"],
        },
        {
          type: "quiz-mc",
          question:
            "A company has FCF of $50M in year 5, WACC of 8%, and a long-term growth rate of 3%. What is the Gordon Growth terminal value?",
          options: [
            "$1,030M — using FCF × (1+g) / (WACC – g)",
            "$625M — using FCF / WACC alone",
            "$500M — using FCF × 10 as a rule of thumb",
            "$1,667M — using FCF / g only",
          ],
          correctIndex: 0,
          explanation:
            "Terminal Value = FCF × (1+g) / (WACC – g) = $50M × 1.03 / (0.08 – 0.03) = $51.5M / 0.05 = $1,030M. The Gordon Growth model captures the perpetuity value of cash flows growing at rate g, discounted at WACC minus g. The spread (WACC – g) is the most sensitive driver.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Precedent transaction multiples are typically lower than comparable company trading multiples because M&A deals involve distressed sellers.",
          correct: false,
          explanation:
            "False. Precedent transaction multiples are typically HIGHER than trading comps by 20–30%, reflecting a control premium. Acquirers pay above the current market price to gain control and capture expected synergies. Comps show what the market will pay for minority stakes; precedents show what buyers pay for full control.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A PE firm buys a company for $400M (5× EBITDA of $80M) using $260M debt and $140M equity. After 5 years EBITDA reaches $105M and the firm exits at 5.5× EV/EBITDA. Remaining debt at exit is $160M.",
          question: "What is the approximate equity return multiple (MoM)?",
          options: [
            "2.9× — exit equity of ~$418M divided by $140M invested",
            "1.45× — calculated on total enterprise value",
            "4.1× — based purely on EBITDA growth",
            "1.0× — because the multiple didn't change significantly",
          ],
          correctIndex: 0,
          explanation:
            "Exit EV = $105M × 5.5 = $577.5M. Exit equity = $577.5M – $160M = $417.5M. Return multiple = $417.5M / $140M ≈ 2.98×. The combination of EBITDA growth (+31%), multiple expansion (+0.5×), and debt paydown ($100M) drives ~3× equity in 5 years (~24% IRR).",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Mergers & Acquisitions ────────────────────────────────────────
    {
      id: "ib-2",
      title: "🤝 Mergers & Acquisitions",
      description:
        "Deal structure, synergy modeling, accretion/dilution analysis, and the full M&A process",
      icon: "Handshake",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "💵 Deal Structure: Cash vs Stock Considerations",
          content:
            "M&A deals are paid with **cash**, **stock**, or a **mix** of both — each has distinct implications.\n\n**Cash deals:**\n- Target shareholders receive certainty — they know exactly what they receive\n- No dilution of acquirer's existing shareholders\n- Acquirer bears all post-close valuation risk\n- Requires financing: debt (leveraged buyout style) or cash reserves\n- Most common in smaller deals and PE acquisitions\n\n**Stock deals:**\n- Target shareholders become owners of the combined company\n- They share in upside but also downside if acquirer stock declines\n- No immediate cash outlay for acquirer — shares are the 'currency'\n- Dilutes existing acquirer shareholders\n- Common when acquirer stock trades at a premium (stock = cheap currency)\n\n**Premium analysis:**\nPremium = (Offer Price – Unaffected Stock Price) / Unaffected Stock Price × 100%\n- Typical M&A premiums: **20–40%** over 30-day VWAP\n- Higher premiums in competitive auction processes\n\nExample: Target unaffected price $40, offer at $52.\nPremium = ($52 – $40) / $40 = **30%**",
          highlight: ["cash deal", "stock deal", "premium", "VWAP", "dilution", "deal structure"],
        },
        {
          type: "teach",
          title: "⚙️ Synergies: Revenue vs Cost, and How to Model Them",
          content:
            "**Synergies** are incremental value created by combining two companies — they justify the acquisition premium.\n\n**Revenue synergies:**\n- Cross-selling products to each other's customer base\n- Entering new geographies or markets\n- Bundling complementary offerings to improve win rates\n- Hard to achieve and slow to materialize — bankers apply 30–50% probability haircut\n\n**Cost synergies:**\n- Eliminating duplicate headcount (G&A, overlapping sales teams)\n- Consolidating facilities, data centers, IT systems\n- Better purchasing power for raw materials\n- More predictable — typically 70–90% probability haircut\n\n**Modeling synergies:**\n- Identify synergy types line by line with an implementation timeline\n- Apply probability weights\n- Net of one-time restructuring costs (severance, systems integration)\n\nExample: Acquirer claims $200M of synergies ($120M cost + $80M revenue).\nRisk-adjusted: $120M × 85% + $80M × 40% = **$102M + $32M = $134M**\n\nSynergy NPV = risk-adjusted synergies discounted at WACC over 5-year ramp.",
          highlight: ["revenue synergies", "cost synergies", "probability haircut", "restructuring costs"],
        },
        {
          type: "teach",
          title: "📊 Accretion/Dilution Analysis: EPS Impact of a Deal",
          content:
            "**Accretion/Dilution (A/D) analysis** answers the key question: does this deal increase or decrease the acquirer's earnings per share?\n\n**Terminology:**\n- **Accretive**: Pro forma EPS > standalone EPS (positive for acquirer)\n- **Dilutive**: Pro forma EPS < standalone EPS (negative for acquirer)\n\n**Pro Forma EPS formula:**\nPro Forma EPS = (Acquirer NI + Target NI + After-tax Synergies – After-tax Cost of Financing) / Pro Forma Diluted Shares\n\n**A/D drivers in stock deals:**\n- **Acquirer P/E vs Target P/E**: If acquirer P/E > target P/E, deal is accretive (acquirer buys cheaper earnings)\n- **Synergies**: Add to numerator, can flip dilutive → accretive\n- **New shares issued**: Increase denominator, always dilutive all else equal\n\n**Example:**\nAcquirer NI: $500M, shares: 100M → standalone EPS = $5.00\nTarget NI: $80M; after-tax synergies: $30M; after-tax financing cost: $20M\nNew shares issued in stock deal: 20M\n\nPro Forma EPS = ($500M + $80M + $30M – $20M) / 120M = **$4.92 → dilutive** ($5.00 → $4.92)",
          highlight: ["accretion", "dilution", "EPS", "pro forma", "P/E ratio", "deal financing"],
        },
        {
          type: "quiz-mc",
          question:
            "An acquirer has standalone EPS of $4.00 and acquires a target fully in stock. After the deal, pro forma EPS is $3.75. What does this mean?",
          options: [
            "The deal is dilutive — existing shareholders' EPS declined by $0.25",
            "The deal is accretive — target's earnings exceed the cost of shares issued",
            "The deal is neutral — EPS changes under 10% are immaterial",
            "The deal fails the fairness test and must be renegotiated",
          ],
          correctIndex: 0,
          explanation:
            "Dilution means the acquirer's EPS fell from $4.00 to $3.75 — a 6.25% decline. Stock-for-stock deals are often dilutive because the acquirer issues new shares, increasing the denominator. Synergies or a sufficiently low acquisition price (target P/E below acquirer P/E) are needed to make stock deals accretive.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In M&A analysis, cash deals are always preferable to stock deals because they avoid share dilution for the acquirer.",
          correct: false,
          explanation:
            "False. Cash deals avoid share dilution but require the acquirer to raise debt or use cash reserves, adding interest expense and financial risk. Stock deals preserve balance sheet flexibility and allow target shareholders to participate in upside — which can align incentives. The optimal structure depends on the acquirer's valuation, balance sheet, and tax considerations.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "TechCorp (EPS $5.00, 80M shares) acquires DataSoft for $1.2B in cash at 4% after-tax financing cost. DataSoft contributes $60M net income annually. Expected cost synergies worth $30M after-tax phase in over 2 years. In Year 1, only 50% of synergies are realized.",
          question: "What is TechCorp's approximate Year 1 pro forma EPS?",
          options: [
            "$5.34 — accretive deal driven by target earnings and partial synergies",
            "$4.85 — dilutive due to heavy financing cost",
            "$5.00 — neutral because synergies offset financing costs",
            "$5.75 — fully synergized from day one",
          ],
          correctIndex: 0,
          explanation:
            "Financing cost = 4% × $1.2B = $48M. Year 1 synergies = 50% × $30M = $15M. Pro Forma NI = $400M (base) + $60M (target) + $15M (synergies) – $48M (financing) = $427M. Pro Forma EPS = $427M / 80M shares = $5.34. The deal is accretive in Year 1, and more so in Year 2 when synergies are fully phased in.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: IPO Process ─────────────────────────────────────────────────
    {
      id: "ib-3",
      title: "🚀 IPO Process",
      description:
        "IPO lifecycle, S-1 filing, roadshow, bookbuilding, greenshoe option, and aftermarket performance",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📋 IPO Lifecycle: S-1 Filing, Roadshow & Bookbuilding",
          content:
            "An **Initial Public Offering (IPO)** takes a private company public through a structured process lasting 3–6 months.\n\n**Phase 1 — Preparation:**\n- Select lead underwriters (bulge bracket or top-tier banks)\n- Draft S-1 registration statement for SEC review\n- Appoint auditors, legal counsel; prepare 3 years audited financials\n- Obtain credit rating if debt will be issued alongside equity\n\n**Phase 2 — SEC Review:**\n- File S-1 with SEC; SEC issues comment letters within 30 days\n- Company responds, files amendments (S-1/A)\n- Once SEC declares registration effective, IPO can proceed\n\n**Phase 3 — Roadshow (10–14 days):**\n- Management + bankers present to institutional investors (mutual funds, hedge funds, pensions)\n- One-on-one meetings + group presentations in major financial centers (NY, Boston, London, SF)\n- Investors submit 'indications of interest' at various price levels\n\n**Phase 4 — Bookbuilding & Pricing:**\n- Lead left bank constructs the 'book' of demand\n- Price set the night before trading opens\n- Shares allocated to institutional investors based on quality of demand and long-term orientation",
          highlight: ["S-1", "SEC", "roadshow", "bookbuilding", "registration", "indications of interest"],
        },
        {
          type: "teach",
          title: "🏦 Underwriting: Bulge Bracket Banks, Greenshoe & Lockup",
          content:
            "**Underwriters** are investment banks that manage and guarantee the IPO process.\n\n**Bulge bracket banks** (Goldman Sachs, Morgan Stanley, JPMorgan, BofA) compete for lead-left mandates on large IPOs. The lead-left bank runs the book and gets the largest fee allocation.\n\n**Underwriting fee structure:**\n- Gross spread: typically 3.5–7% of deal size\n- Split: 20% management fee, 20% underwriting fee, 60% selling concession\n- Distributed among lead, co-managers, and selling group\n\n**Greenshoe (Overallotment) Option:**\n- Lead underwriter can sell up to 15% MORE shares than originally planned\n- If stock rises: underwriter exercises the option, buying shares from issuer at IPO price → keeps proceeds\n- If stock falls below IPO price: underwriter buys shares in open market to support price, returns to issuer\n- Result: greenshoe acts as a price stabilization mechanism for 30 days post-IPO\n\n**Lockup period:**\n- Insiders (founders, employees, VCs, pre-IPO investors) contractually prohibited from selling shares for 90–180 days post-IPO\n- Creates a predictable supply shock when lockup expires — stocks often underperform ahead of expiry\n- PE-backed companies often see heavy selling at lockup expiry as sponsors exit",
          highlight: ["bulge bracket", "greenshoe", "overallotment", "lockup period", "gross spread", "price stabilization"],
        },
        {
          type: "teach",
          title: "📈 Aftermarket Performance: First-Day Pop & Leaving Money on the Table",
          content:
            "**First-day performance** is closely watched by companies, bankers, and investors.\n\n**The first-day pop:**\n- IPOs historically open 10–20% above the offering price on average\n- Hot sector IPOs (AI, biotech) can pop 50–100%+\n- Famous pops: Snowflake (112%), Unity (38%), DoorDash (86%)\n- Pop is driven by: institutional buying, retail FOMO, media attention, short covering\n\n**Why companies 'leave money on the table':**\n- A large pop means shares were priced below what investors were willing to pay\n- Each $1 of underpricing = $1 × shares sold in cash left uncollected by the company\n- Bankers argue a moderate pop (10–15%) is good: creates buzz, rewards institutional clients who provide long-term support\n- A flat or negative first day ('broken IPO') signals weak demand and damages reputation\n\n**Long-term IPO performance:**\n- Average 1-year IPO performance has historically lagged the S&P 500 by 3–5%\n- Lock-up expiry often creates a second leg down as insiders sell\n- Companies should focus on setting a fair price, not maximizing first-day pop\n\n**Alternative structures:**\n- **Direct listing**: No new shares, existing holders trade directly (Spotify, Coinbase, Palantir)\n- **SPAC merger**: Shell company merges with private target — largely fell out of favor post-2021",
          highlight: ["first-day pop", "leaving money on the table", "direct listing", "SPAC", "broken IPO", "lock-up expiry"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the primary function of the greenshoe (overallotment) option in an IPO?",
          options: [
            "To stabilize the stock price in the 30 days following the IPO by allowing the underwriter to buy shares if the price falls",
            "To allow company insiders to sell additional shares at a premium after the IPO",
            "To give institutional investors the right to buy more shares at the IPO price for 6 months",
            "To compensate the underwriter with additional shares if the deal is oversubscribed",
          ],
          correctIndex: 0,
          explanation:
            "The greenshoe allows the lead underwriter to oversell 15% more shares than planned. If the stock falls below IPO price, the underwriter buys shares in the open market (supporting the price) and covers its short position — no profit, but price is stabilized. If the stock rises, the underwriter exercises the greenshoe option at the offering price and profits. It's primarily a price stabilization tool.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "IPO lockup periods are enforced by the SEC and apply to all shareholders who owned stock before the IPO.",
          correct: false,
          explanation:
            "False. Lockup periods are contractual agreements between insiders and the underwriting bank — not SEC regulations. They apply to pre-IPO shareholders (founders, employees, VCs, angels) but can sometimes be waived with the lead underwriter's consent. The SEC does not mandate lockup periods, though they are standard practice negotiated as part of the underwriting agreement.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "BioGrowth Inc. prices its IPO at $18/share, selling 15M new shares. The deal includes a full 15% greenshoe. On day 1, the stock opens at $14 — below the IPO price. The lead underwriter intervenes to stabilize the price.",
          question: "What action does the underwriter take, and what is its maximum stabilization buying power?",
          options: [
            "Buys shares in the open market up to 2.25M shares ($40.5M) to support the price",
            "Sells 2.25M additional shares into the market to offset supply",
            "Exercises the greenshoe to force the company to repurchase shares",
            "Cancels the greenshoe option and refunds institutional investors",
          ],
          correctIndex: 0,
          explanation:
            "When the IPO broke below offer price, the underwriter uses the 2.25M greenshoe shares (15% × 15M) it oversold as its 'short' position. It buys up to 2.25M shares in the market at around $14, covering its short and supporting the stock price. Maximum buying power = 2.25M × $18 (IPO price cap) = $40.5M. This stabilization mechanism is specifically why greenshoe options exist.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Capital Raising ─────────────────────────────────────────────
    {
      id: "ib-4",
      title: "💰 Capital Raising",
      description:
        "Debt capital markets (IG bonds, high yield, leveraged loans), equity capital markets, and convertible bonds",
      icon: "LineChart",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🏦 Debt Capital Markets: IG Bonds, High Yield & Leveraged Loans",
          content:
            "**Debt Capital Markets (DCM)** helps companies raise debt from institutional investors.\n\n**Investment Grade (IG) Bonds:**\n- Credit rating: BBB– or above (S&P/Fitch) / Baa3+ (Moody's)\n- Lower yields (e.g., Apple 10-year bond at 4.2%)\n- Bought by insurance companies, pension funds, index funds\n- Typical deal: $500M–$5B+, priced within hours via accelerated book build\n- Spread quoted vs US Treasury ('T+85bps' = Treasury yield + 0.85%)\n\n**High Yield (HY) / 'Junk' Bonds:**\n- Credit rating: BB+ or below\n- Higher yields (7–12%) to compensate for default risk\n- More covenant-heavy: restrictions on additional debt, asset sales, dividends\n- Common in leveraged buyouts and capital-intensive businesses\n- Typical deal: $300M–$1B, takes 1–2 weeks with roadshow\n\n**Leveraged Loans:**\n- Senior secured floating-rate debt (SOFR + spread, e.g., SOFR + 350bps)\n- Syndicated to institutional loan investors (CLOs, credit funds)\n- Term Loan A: amortizing, held by banks\n- Term Loan B: bullet maturity, traded in secondary market\n- No registration required — faster execution than bonds\n\n**Covenant types:**\n- **Maintenance covenants**: financial ratios tested quarterly (e.g., Leverage < 4.5×)\n- **Incurrence covenants**: only tested if the company takes a specific action (HY bonds)",
          highlight: ["investment grade", "high yield", "leveraged loans", "covenants", "spread", "CLO"],
        },
        {
          type: "teach",
          title: "📈 Equity Capital Markets: Follow-Ons, Rights Issues & ATM Programs",
          content:
            "**Equity Capital Markets (ECM)** helps companies raise equity after the IPO.\n\n**Follow-on offerings:**\n- **Primary offering**: Company issues new shares → dilutes existing shareholders → proceeds go to company\n- **Secondary offering**: Existing shareholders sell their shares → no dilution → proceeds go to sellers\n- Priced at a **3–7% discount** to current market to attract buyers\n- Executed overnight: announced after market close, priced and allocated by morning\n\n**Bought deals:**\n- Bank buys the entire block from company at a fixed price, absorbs inventory risk\n- Fastest execution — company gets certainty of proceeds\n- Bank earns a 2–4% gross spread for taking the risk\n\n**Rights issues:**\n- Company offers existing shareholders the right to buy new shares at a discount (typically 20–30% below market)\n- Shareholders can exercise rights, sell rights in the market, or let them lapse\n- Common in European markets, distressed situations, and heavily regulated industries\n- Advantages: no dilution of shareholders who participate; democratic capital structure\n\n**At-the-Market (ATM) Programs:**\n- Company registers a large shelf of shares and drips them into the open market over time\n- Executed at prevailing market prices — no deal discount\n- Popular with REITs, utilities, and companies needing steady capital\n- Minimal market impact vs a concentrated offering",
          highlight: ["follow-on", "secondary offering", "rights issue", "bought deal", "ATM", "dilution"],
        },
        {
          type: "teach",
          title: "🔄 Convertible Bonds: Hybrid Instrument & Delta Hedging",
          content:
            "**Convertible bonds** are hybrid securities: debt with an embedded equity call option.\n\n**Key terms:**\n- **Conversion ratio**: Number of shares received per $1,000 face value (e.g., 40 shares)\n- **Conversion price**: Effective price per share = $1,000 / conversion ratio (e.g., $25)\n- **Premium**: Conversion price as % above current stock price. Typical: 15–35% premium\n- **Coupon**: Below-market rate (e.g., 0.5–2%) because the conversion option has value\n\n**Investor perspective:**\n- Downside protection: if stock falls, hold bond and collect coupons + principal at maturity\n- Upside participation: if stock rises above conversion price, convert to equity and profit\n- Lower yield in exchange for equity upside — 'best of both worlds'\n\n**Issuer perspective:**\n- Cheap debt financing (low coupon) with potential equity issuance at a premium to current price\n- Attractive when company is volatile (options have more value) or growth-stage\n\n**Delta hedging by investors:**\n- Sophisticated convertible buyers (hedge funds) isolate the equity option by shorting the underlying stock\n- 'Delta' = sensitivity of convertible to stock price changes\n- As stock rises, delta rises → hedge fund buys more stock to stay delta-neutral\n- Creates systematic buying pressure on the underlying when it rises — a flow dynamic IB desks exploit\n\n**Example:** Stock at $20. Issues $500M convertible: 1% coupon, conversion price $26 (30% premium).\nIf stock rises to $35 → convert to equity at $26 effective price.\nIf stock stays at $15 → bond matures, company repays $500M.",
          highlight: ["convertible bond", "conversion ratio", "conversion price", "delta hedging", "premium", "hybrid"],
        },
        {
          type: "quiz-mc",
          question:
            "A company issues a convertible bond with a face value of $1,000 and a conversion ratio of 25 shares. The stock currently trades at $32. What is the conversion premium?",
          options: [
            "25% — conversion price is $40 vs $32 stock price",
            "32% — conversion price is $32 vs $25 implied",
            "0% — conversion bonds are always priced at parity",
            "15% — standard market convention for tech converts",
          ],
          correctIndex: 0,
          explanation:
            "Conversion price = $1,000 / 25 shares = $40. Conversion premium = ($40 – $32) / $32 = 25%. The investor is effectively agreeing to 'pay' $40 per share to convert, vs the current market price of $32. In exchange, they get a below-market coupon. The premium compensates the issuer for the cheap debt funding.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A rights issue always dilutes the economic value of existing shareholders who do not participate, because new shares are issued at a discount.",
          correct: true,
          explanation:
            "True. When new shares are issued below market price, non-participating shareholders suffer dilution — their percentage ownership declines and the stock price adjusts downward toward the theoretical ex-rights price (TERP). The rights themselves have value (market price minus exercise price), but shareholders who don't exercise or sell their rights lose that value. Participating shareholders maintain their economic position.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "ManufactureCo needs $500M in new capital. It currently has $300M debt (3.5% IG bonds). Its credit rating is BBB. Options: (A) Issue new IG bonds at T+120bps (10-year Treasury = 4.2%), (B) Issue equity via a 5% discounted follow-on, (C) Issue a convertible bond at 1.5% coupon with 25% premium.",
          question: "Which option minimizes annual cash interest/dividend cost while preserving the most balance sheet flexibility?",
          options: [
            "The convertible bond (C) — 1.5% coupon is cheapest cash cost; premium delays equity dilution",
            "New IG bonds (A) — same credit quality, no dilution risk",
            "Equity follow-on (B) — no interest payments at all",
            "All three have identical effective cost when properly risk-adjusted",
          ],
          correctIndex: 0,
          explanation:
            "Cash cost comparison: (A) IG bonds = 4.2% + 1.20% = 5.4% annual interest on $500M = $27M/year. (B) Equity: no cash dividend if discretionary, but immediate EPS dilution. (C) Convertible: 1.5% = $7.5M/year cash cost. The convertible wins on lowest cash outflow. It also avoids immediate dilution (conversion only if stock rises 25%) and preserves optionality — a key reason growth companies favor converts.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Financial Modeling ─────────────────────────────────────────
    {
      id: "ib-5",
      title: "🖥️ Financial Modeling",
      description:
        "Three-statement model linkages, sensitivity analysis, scenario analysis, and pitchbook structure",
      icon: "BarChart2",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🔗 Three-Statement Model: Income Statement → Cash Flow → Balance Sheet Linkages",
          content:
            "A **three-statement model** is the foundation of all financial modeling — it links the income statement, cash flow statement, and balance sheet into a dynamic, self-balancing system.\n\n**Income Statement → Cash Flow Statement:**\n- **Net income** is the starting point of the indirect cash flow statement\n- Add back non-cash charges: D&A, stock-based compensation, amortization of intangibles\n- Adjust for working capital changes: ↑AR/inventory = cash outflow; ↑AP = cash inflow\n\n**Cash Flow Statement → Balance Sheet:**\n- **Cash from operations** accumulates into the cash balance on the balance sheet\n- **CapEx** reduces the cash balance and increases PP&E (net of depreciation)\n- **Debt issuance** increases cash and increases long-term debt\n- **Dividends/buybacks** reduce cash and reduce retained earnings / equity\n\n**Balance Sheet → Income Statement:**\n- **Beginning debt balance × interest rate** = interest expense on the income statement\n- **Beginning cash balance × cash interest rate** = interest income\n- **PP&E balance / useful life** = depreciation expense\n- **Deferred revenue** on balance sheet drives revenue recognition timing\n\n**The closing check:**\nAssets = Liabilities + Equity must balance every period. A model that doesn't balance has a structural error. Modelers use a 'check' row (Assets – Liabilities – Equity = 0) to verify integrity.",
          highlight: ["three-statement model", "net income", "working capital", "D&A", "CapEx", "balance sheet linkage"],
        },
        {
          type: "teach",
          title: "📊 Sensitivity Analysis: Data Tables, Tornado Charts & Scenario Analysis",
          content:
            "**Sensitivity analysis** tests how model outputs change when key assumptions vary.\n\n**Data tables (two-variable sensitivity):**\n- Most common in banking: show DCF equity value across WACC × terminal growth rate grid\n- Example: WACC from 7–9%, growth from 2–4% → 3×3 grid of 9 implied equity values\n- Immediately visible to management which assumptions drive value most\n\n**Tornado charts:**\n- Bar chart showing each variable's impact on the output (e.g., IRR)\n- Longest bars = most sensitive assumptions (ordered top-to-bottom by impact)\n- Quickly identifies which assumptions deserve the most scrutiny in due diligence\n- Common variables: EBITDA margin, revenue growth rate, exit multiple, WACC\n\n**Scenario analysis (base / bull / bear):**\n- **Base case**: Most likely outcome based on management guidance + analyst consensus\n- **Bull case**: Upside scenario — better-than-expected growth, margin expansion, favorable market\n- **Bear case**: Downside risk — macro recession, competitor disruption, cost inflation\n- Each scenario is a consistent set of assumptions — not just one variable changing\n\n**Monte Carlo simulation:**\n- Advanced: run thousands of random trials drawing from distributions of key inputs\n- Output: probability distribution of the DCF value or IRR\n- Used in PE firms and risk management contexts\n- Excel: requires add-ins (@RISK, Crystal Ball) or Python implementation",
          highlight: ["sensitivity analysis", "data table", "tornado chart", "scenario analysis", "Monte Carlo", "WACC sensitivity"],
        },
        {
          type: "teach",
          title: "📋 Pitchbook Structure: From Situation Analysis to Recommendation",
          content:
            "A **pitchbook** is an investment bank's presentation to a client — covering strategic alternatives, valuation, and a recommended transaction.\n\n**Standard pitchbook sections:**\n\n**1. Executive Summary (1–2 pages):**\n- Key message: strategic situation, recommended action, expected value\n- Designed for busy CEOs who may only read this section\n\n**2. Situation Analysis:**\n- Current business performance vs. peers\n- Stock performance analysis (absolute and relative)\n- Shareholder base analysis (index vs. active, long/short)\n- Board and management objectives\n\n**3. Strategic Alternatives:**\n- Status quo: what happens if company does nothing?\n- M&A sell-side: sale process options (broad auction vs. targeted process)\n- M&A buy-side: acquisition targets and synergy potential\n- Capital return: buyback vs. dividend vs. debt paydown\n- Restructuring/spin-off if conglomerate discount is identified\n\n**4. Valuation:**\n- Football field chart covering all valuation methodologies\n- Transaction comparables and precedent premiums\n- LBO analysis: floor value based on what a PE buyer could pay\n\n**5. Recommendation:**\n- Bank's preferred strategic path with supporting rationale\n- Indicative timeline and key milestones\n- Potential acquirers or targets with preliminary outreach strategy\n\n**Pitchbook quality**: Excel modeling accuracy + PowerPoint polish + logical storytelling = the three pillars of good IB work.",
          highlight: ["pitchbook", "executive summary", "situation analysis", "strategic alternatives", "football field", "recommendation"],
        },
        {
          type: "quiz-mc",
          question:
            "In a three-statement financial model, how does net income from the income statement flow to the balance sheet?",
          options: [
            "Net income increases retained earnings on the equity section of the balance sheet",
            "Net income directly increases the cash balance on the balance sheet",
            "Net income reduces the long-term debt balance as the company pays down loans",
            "Net income is not directly linked to the balance sheet — only cash flow matters",
          ],
          correctIndex: 0,
          explanation:
            "Net income flows to the balance sheet by increasing retained earnings (a component of shareholders' equity). This is the direct linkage between the P&L and equity. Cash is affected separately — via the cash flow statement, which starts with net income but adjusts for non-cash items and working capital changes. The three-statement model's beauty is that net income, cash, and equity all remain in sync through these linkages.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "WACC should always be lower than the cost of equity because debt is cheaper than equity, making the blended cost lower.",
          correct: true,
          explanation:
            "True. WACC is a weighted average of the cost of equity and after-tax cost of debt. Since debt is almost always cheaper than equity (interest is contractual and tax-deductible; equity requires a risk premium), adding debt to the capital structure lowers WACC — up to a point. Excessive leverage increases financial distress risk, raising both the cost of debt and equity, ultimately causing WACC to rise. The optimal capital structure minimizes WACC.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A DCF model for RetailCo shows a base case equity value of $45/share. A two-variable sensitivity table varies WACC (7.5%, 8.0%, 8.5%) and terminal growth rate (2%, 2.5%, 3%). The range of equity values in the table spans $35–$58/share.",
          question: "What does this wide sensitivity range ($35–$58/share) tell an investment banker about the reliability of the valuation?",
          options: [
            "The valuation is highly sensitive to WACC and growth assumptions — the DCF alone should not anchor the deal price without corroboration from comps and precedents",
            "The model has errors — a well-built DCF should produce a narrow range",
            "The $45 base case is unreliable and the company is worth no more than $35",
            "The company should be valued at the midpoint of $46.50 and negotiations should anchor to that",
          ],
          correctIndex: 0,
          explanation:
            "A $23/share range (66% spread around midpoint) is common in DCF analysis and reflects the inherent sensitivity to terminal growth and WACC. This is why bankers never rely solely on DCF — they use the football field to triangulate with trading comps and precedent transactions. The sensitivity table also tells you which assumptions most need rigorous justification in due diligence. Anchoring a negotiation to a single DCF point estimate would be a mistake.",
          difficulty: 3,
        },
      ],
    },
  ],
};
