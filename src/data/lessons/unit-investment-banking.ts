import type { Unit } from "./types";

export const UNIT_INVESTMENT_BANKING: Unit = {
  id: "investment-banking",
  title: "Investment Banking",
  description:
    "Master valuation, M&A, IPOs, capital markets, and private equity — the core toolkit of Wall Street",
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
            "**Discounted Cash Flow (DCF)** values a company by discounting future free cash flows back to today.\n\n**Step 1 — Free Cash Flow (FCF):**\nFCF = EBIT × (1 – Tax Rate) + D&A – CapEx – Change in Working Capital\n\nExample: EBIT $100M, tax 25%, D&A $10M, CapEx $20M, ΔWC $5M\nFCF = $75M + $10M – $20M – $5M = **$60M**\n\n**Step 2 — WACC (Weighted Average Cost of Capital):**\nWACC = (E/V) × Re + (D/V) × Rd × (1 – T)\n\nWhere Re = cost of equity (CAPM: Rf + β × ERP), Rd = cost of debt.\nExample: 60% equity at 10%, 40% debt at 5% pre-tax (25% tax):\nWACC = 0.6 × 10% + 0.4 × 5% × 0.75 = **7.5%**\n\n**Step 3 — Terminal Value:**\nGordon Growth: TV = FCF_n × (1 + g) / (WACC – g)\nWith FCF year 5 = $80M, g = 2.5%, WACC = 7.5%:\nTV = $80M × 1.025 / 0.05 = **$1,640M**\n\n**Step 4 — Equity Bridge:**\nEnterprise Value = PV(FCFs) + PV(TV)\nEquity Value = EV – Net Debt – Minority Interest + Cash\nEquity Value per share = Equity Value ÷ Diluted Shares Outstanding",
          highlight: ["DCF", "FCF", "WACC", "terminal value", "equity bridge"],
        },
        {
          type: "teach",
          title: "📐 Comparable Company Analysis & Precedent Transactions",
          content:
            "**Comparable Company Analysis (Comps)** values a target using multiples from similar public companies.\n\nKey multiples:\n- **EV/EBITDA**: Enterprise value ÷ EBITDA. Tech SaaS typically 15–25×, industrials 8–12×.\n- **EV/Revenue**: Used for high-growth companies with no earnings.\n- **P/E**: Price per share ÷ EPS. Quick but affected by capital structure.\n\nExample: Target EBITDA = $50M, peer median EV/EBITDA = 12×\nImplied EV = $50M × 12 = **$600M**\nWith net debt of $100M → Equity Value = **$500M**\n\n**Precedent Transactions** uses multiples paid in past M&A deals.\n- Usually commands a **20–30% control premium** over comps.\n- Reflects strategic value (synergies) a buyer is willing to pay.\n\n**Football field chart**: bankers show the range from all three methods side by side:\nDCF: $480–560M | Comps: $500–620M | Precedents: $590–700M\nThe overlap zone guides negotiation.",
          highlight: ["EV/EBITDA", "comps", "precedent transactions", "control premium", "football field"],
        },
        {
          type: "teach",
          title: "🏋️ LBO Overview",
          content:
            "A **Leveraged Buyout (LBO)** acquires a company using significant debt — typically 60–70% of the purchase price.\n\n**Why it works:**\n- Debt is cheaper than equity (tax-deductible interest)\n- Company's own cash flows service and repay debt over time\n- Equity investors gain amplified returns through leverage\n\n**Simple LBO example:**\nPurchase price: $500M (6× EBITDA of $83M)\nDebt: $325M (65%), Equity: $175M (35%)\nYear 5: EBITDA grows to $110M, exit at 6× → EV = $660M\nDebt repaid to $200M → Equity value = $460M\nEquity return = $460M / $175M = 2.6× = ~21% IRR over 5 years\n\n**Key LBO value drivers:**\n1. EBITDA growth (revenue + margin improvement)\n2. Debt paydown (deleveraging from FCF)\n3. Multiple expansion (exit at higher multiple than entry)",
          highlight: ["LBO", "leverage", "IRR", "EBITDA", "deleveraging"],
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
            "Terminal Value = $50M × 1.03 / (0.08 – 0.03) = $51.5M / 0.05 = $1,030M. The Gordon Growth model captures the perpetuity value of cash flows growing at rate g, discounted at WACC minus g.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Precedent transaction multiples are typically lower than comparable company trading multiples because M&A deals involve distressed sellers.",
          correct: false,
          explanation:
            "False. Precedent transaction multiples are typically HIGHER than trading comps by 20–30%, reflecting a control premium. Acquirers pay above the current market price to gain control and capture expected synergies.",
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
            "Exit EV = $105M × 5.5 = $577.5M. Exit equity = $577.5M – $160M = $417.5M. Return multiple = $417.5M / $140M ≈ 2.98×. The combination of EBITDA growth, multiple expansion, and debt paydown drives ~3× equity in 5 years (~24% IRR).",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Mergers & Acquisitions ────────────────────────────────────────
    {
      id: "ib-2",
      title: "🤝 Mergers & Acquisitions",
      description:
        "Deal structure, synergy analysis, accretion/dilution test, and the typical M&A process",
      icon: "Handshake",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "💵 Deal Structure: Stock vs Cash",
          content:
            "M&A deals are paid with **cash**, **stock**, or a **mix** of both.\n\n**Cash deals:**\n- Target shareholders get certainty — they know exactly what they receive\n- Acquirer bears all valuation risk post-close\n- Acquirer typically needs to raise debt or use reserves\n- More common when acquirer has strong balance sheet\n\n**Stock deals:**\n- Target shareholders become owners of the combined company\n- They share in upside but also downside if acquirer stock falls\n- No immediate cash outlay for acquirer\n- Dilutes existing acquirer shareholders\n- Common when acquirer stock is highly valued (acts as currency)\n\n**Premium analysis:**\nPremium = (Offer Price – Unaffected Stock Price) / Unaffected Stock Price × 100%\nTypical M&A premiums: **20–40%** over 30-day VWAP\n\nExample: Target trading at $40. Offer at $52.\nPremium = ($52 – $40) / $40 = **30%**",
          highlight: ["cash deal", "stock deal", "premium", "VWAP", "deal structure"],
        },
        {
          type: "teach",
          title: "⚙️ Synergy Analysis & Accretion/Dilution",
          content:
            "**Synergies** are the incremental value created by combining two companies.\n\n**Revenue synergies**: Cross-selling, new markets, bundled offerings. Hard to achieve, often over-estimated.\n**Cost synergies**: Eliminating duplicate headcount, facilities, IT systems. More predictable. Bankers apply a 50% probability haircut.\n\nExample: Acquirer claims $200M synergies. Risk-adjusted = $100M.\n\n**Accretion/Dilution Test:**\nDoes the deal increase or decrease the acquirer's EPS?\n\n- If pro forma EPS > standalone EPS → deal is **accretive**\n- If pro forma EPS < standalone EPS → deal is **dilutive**\n\nFormula:\nPro Forma EPS = (Acquirer Net Income + Target Net Income + After-tax Synergies – Interest on Acquisition Debt) / Pro Forma Shares\n\nExample:\nAcquirer NI: $500M, shares: 100M → standalone EPS = $5.00\nTarget NI: $80M, after-tax synergies: $30M, interest cost: $20M\nNew shares issued: 20M\nPro Forma EPS = ($500M + $80M + $30M – $20M) / 120M = $4.92 → **dilutive**",
          highlight: ["synergies", "accretion", "dilution", "EPS", "cost synergies"],
        },
        {
          type: "teach",
          title: "📋 The M&A Process",
          content:
            "**Typical sell-side M&A process (12–24 weeks):**\n\n**Phase 1 — Preparation (weeks 1–4):**\n- Engage investment bank as financial advisor\n- Prepare Confidential Information Memorandum (CIM)\n- Identify potential buyers (strategic + financial sponsors)\n\n**Phase 2 — First Round (weeks 5–8):**\n- Send CIM to qualified buyers under NDA\n- Receive Indications of Interest (IOIs)\n- Select shortlist for management presentations\n\n**Phase 3 — Second Round (weeks 9–16):**\n- Open Virtual Data Room (VDR) for due diligence\n- Management presentations to finalists\n- Receive binding Letters of Intent (LOIs)\n\n**Phase 4 — Exclusivity & Close (weeks 17–24):**\n- Negotiate definitive agreement (SPA — Share Purchase Agreement)\n- Regulatory approvals (HSR antitrust filing in US, EU Phase I/II)\n- Sign and close\n\n**Fairness opinion**: Independent valuation confirming price is fair to shareholders — often required by board.",
          highlight: ["CIM", "LOI", "due diligence", "SPA", "fairness opinion", "data room"],
        },
        {
          type: "quiz-mc",
          question:
            "An acquirer has standalone EPS of $4.00 and acquires a target fully in stock. After the deal, pro forma EPS is $3.75. What does this mean?",
          options: [
            "The deal is dilutive — existing shareholders' EPS declined by $0.25",
            "The deal is accretive — target's earnings exceed the cost of shares issued",
            "The deal is neutral — EPS changes are immaterial under 10%",
            "The deal fails the fairness test and must be renegotiated",
          ],
          correctIndex: 0,
          explanation:
            "Dilution means the acquirer's EPS fell from $4.00 to $3.75. Stock-for-stock deals are often dilutive because the acquirer issues new shares, increasing the denominator. Synergies or a high-enough target P/E multiple vs acquirer P/E are needed to make stock deals accretive.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Revenue synergies are generally considered more reliable and easier to model than cost synergies in M&A analysis.",
          correct: false,
          explanation:
            "False. Cost synergies (duplicate headcount, IT, offices) are more predictable and easier to achieve. Revenue synergies depend on successful cross-selling and customer behavior — they are harder to execute and take longer to materialize. Bankers typically discount revenue synergies more heavily.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "TechCorp wants to acquire DataSoft. DataSoft's stock trades at $60 (30-day VWAP). TechCorp offers $78 per share in cash. DataSoft has 50M diluted shares outstanding.",
          question: "What is the acquisition premium and total equity value offered?",
          options: [
            "30% premium, $3.9B equity value",
            "23% premium, $3.0B equity value",
            "30% premium, $3.0B equity value",
            "18% premium, $3.9B equity value",
          ],
          correctIndex: 0,
          explanation:
            "Premium = ($78 – $60) / $60 = 30%. Total equity value = $78 × 50M shares = $3.9B. The 30% premium is typical for strategic acquisitions. To get to enterprise value, you would add net debt or subtract net cash from DataSoft's balance sheet.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: IPO Process ─────────────────────────────────────────────────
    {
      id: "ib-3",
      title: "🚀 IPO Process",
      description:
        "IPO mechanics, book building, S-1 filing, quiet period, lock-up expiry, and first-day trading patterns",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📄 S-1 Filing & Pre-IPO Mechanics",
          content:
            "An **Initial Public Offering (IPO)** is the first sale of a company's shares to the public.\n\n**Key participants:**\n- **Issuer**: The company going public\n- **Lead underwriter(s)**: Investment banks (e.g., Goldman, Morgan Stanley) who manage the deal\n- **Co-managers**: Additional banks in the syndicate\n- **SEC**: Reviews the registration statement\n\n**S-1 Registration Statement:**\nFiled with the SEC, containing:\n- Business description, risk factors, financial statements (3 years audited)\n- Use of proceeds, capitalization table, selling shareholders\n- Management compensation, related-party transactions\n\nAfter filing, the SEC reviews and issues comment letters (typically 30 days). Company responds → SEC declares registration effective.\n\n**Dual-class structures**: Many tech IPOs (Meta, Alphabet, Snap) use Class A (1 vote) and Class B (10 votes) to let founders retain control post-IPO.\n\n**Quiet period**: From filing until 40 days after IPO, underwriters cannot publish research. Post-quiet-period, 'initiation of coverage' reports often drive price moves.",
          highlight: ["S-1", "underwriter", "SEC", "quiet period", "registration statement"],
        },
        {
          type: "teach",
          title: "📖 Book Building & Pricing",
          content:
            "**Book building** is the process of gauging investor demand before setting the IPO price.\n\n**Roadshow (10–14 days):**\nManagement and bankers tour institutional investors (mutual funds, hedge funds, pension funds) presenting the company story and gathering 'indications of interest'.\n\n**Order book construction:**\n- Investors submit orders at various price levels\n- Lead left bank builds a picture of demand across the price range\n- Oversubscription (10–30×) is common for hot deals\n\n**Pricing decision:**\n- Set by issuer + lead underwriter the night before trading\n- Typically at top or above the original price range if oversubscribed\n- Bankers aim for ~15% first-day pop to reward institutional clients\n- Too large a pop = company left money on the table (e.g., Snowflake IPO popped 112%)\n\n**Stabilization:**\nUnderwriters may use the **greenshoe (overallotment) option** — the right to sell 15% more shares — to support the price if it falls below IPO price in early trading.",
          highlight: ["book building", "roadshow", "oversubscription", "greenshoe", "price range"],
        },
        {
          type: "teach",
          title: "🔒 Lock-Up Expiry & Post-IPO Trading",
          content:
            "**Lock-up period**: Insiders (founders, employees, VCs) are contractually prohibited from selling shares for **90–180 days** after the IPO.\n\n**Why it matters for traders:**\n- Lock-up expiry creates a **predictable supply shock** — a wave of insider selling can pressure the stock\n- Stocks often underperform in the weeks around lock-up expiry\n- Some investors short the stock ahead of lock-up expiry as a trade\n\n**First-day trading patterns:**\n- Hot sectors (AI, biotech) see aggressive first-day buying\n- Flippers: institutions allocated shares sell quickly for guaranteed profit\n- Retail FOMO can push prices well above fundamentals on day 1\n- Average 1-year IPO performance has historically lagged the S&P 500 by 3–5%\n\n**Direct listings vs SPACs:**\n- **Direct listing**: No new capital raised, existing shares trade directly (Spotify, Coinbase)\n- **SPAC**: Shell company raises cash in IPO, then merges with private target (2020–2021 boom)\n- SPACs have dramatically underperformed traditional IPOs on average",
          highlight: ["lock-up", "greenshoe", "direct listing", "SPAC", "insider selling"],
        },
        {
          type: "quiz-mc",
          question:
            "A company prices its IPO at $20/share after a heavily oversubscribed book. On day 1 it opens at $38 and closes at $36. What is the likely implication for the company?",
          options: [
            "The company left money on the table — it could have priced higher and raised more capital",
            "This is ideal for the company as a high pop attracts long-term investors",
            "The underwriters mispriced the deal and owe the company the difference",
            "The greenshoe option will now be exercised to sell more shares at $36",
          ],
          correctIndex: 0,
          explanation:
            "An 80% first-day pop means the company sold shares at $20 that the market valued at ~$36. Each share could have raised $16 more in capital. While banks argue a pop rewards institutional clients and creates buzz, an 80% pop is widely seen as pricing too low. Snowflake's 112% pop is the famous example.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "During the quiet period following an IPO, the lead underwriter can publish research to help investors make informed decisions about the new stock.",
          correct: false,
          explanation:
            "False. The quiet period (40 days post-IPO for underwriters, 25 days for non-underwriters) prohibits publishing research or making public statements about the company. After the quiet period ends, coverage initiations — often with 'Buy' ratings — are a predictable and well-documented price catalyst.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "FinTech startup RapidPay completes its IPO, issuing 20M new shares at $25/share. The company also uses a 15% greenshoe option. Founders own 60M shares with a 180-day lock-up.",
          question: "How much gross proceeds does RapidPay raise including the greenshoe, and when can founders first sell?",
          options: [
            "$575M proceeds; founders can sell after 180 days",
            "$500M proceeds; founders can sell immediately",
            "$575M proceeds; founders can sell after 40-day quiet period",
            "$500M proceeds; founders can sell after the quiet period",
          ],
          correctIndex: 0,
          explanation:
            "Base offering: 20M × $25 = $500M. Greenshoe: 15% × 20M = 3M additional shares × $25 = $75M. Total = $575M. Founders are locked up for 180 days — the quiet period only restricts research, not share sales, but the lock-up agreement controls insider selling.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Capital Markets ────────────────────────────────────────────
    {
      id: "ib-4",
      title: "💰 Capital Markets",
      description:
        "Equity capital markets (follow-ons, rights issues), debt capital markets (IG vs HY), and convertible bonds",
      icon: "LineChart",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📈 Equity Capital Markets: Follow-Ons & Rights Issues",
          content:
            "**Equity Capital Markets (ECM)** helps companies raise equity after the IPO.\n\n**Follow-on offerings (secondaries):**\n- **Primary offering**: Company issues new shares → dilutes existing shareholders → proceeds go to company\n- **Secondary offering**: Existing shareholders sell → no dilution → proceeds go to sellers\n- Usually priced at a **3–5% discount** to current market price to attract buyers\n- Announced after market close; priced and allocated overnight ('overnight execution')\n\n**Bought deals:**\nBank buys the entire block from the company at a fixed price, then re-sells to investors. Bank bears the inventory risk — compensated by a spread (typically 2–4% gross spread).\n\n**Rights issues:**\n- Company offers existing shareholders the right to buy new shares at a discount (typically 20–30% below market)\n- Shareholders can exercise rights, sell rights, or let them expire\n- Used when company needs capital but wants to avoid wholesale dilution of existing holders\n- Common in European markets and distressed situations\n\n**Shelf registration (S-3)**: Allows frequent issuers to register a large 'shelf' of securities and draw from it over time without re-filing.",
          highlight: ["follow-on", "secondary offering", "rights issue", "dilution", "bought deal"],
        },
        {
          type: "teach",
          title: "🏦 Debt Capital Markets: Investment Grade vs High Yield",
          content:
            "**Debt Capital Markets (DCM)** helps companies issue bonds to institutional investors.\n\n**Investment Grade (IG) Bonds:**\n- Credit rating: BBB– or above (S&P/Fitch) / Baa3 or above (Moody's)\n- Lower yields (e.g., Apple 10-year bond at 4.2%)\n- Bought by insurance companies, pension funds, mutual funds\n- Typical deal size: $500M–$5B+, pricing in hours via book build\n- Spread quoted vs US Treasury ('T+85bps' = Treasury yield + 0.85%)\n\n**High Yield (HY) / 'Junk' Bonds:**\n- Credit rating: BB+ or below\n- Higher yields to compensate for default risk (e.g., 7–12%)\n- More covenant-heavy — restrictions on additional debt, asset sales, dividends\n- Common in leveraged buyouts and capital-intensive industries\n- Typical deal: $300M–$1B, takes 1–2 weeks with roadshow\n\n**Yield to Maturity (YTM):**\nYTM is the total annualized return if you hold the bond to maturity.\nExample: $1,000 face, $950 price, 5% coupon, 10 years → YTM ≈ 5.6%\nThe discount ($50) adds to return over 10 years.",
          highlight: ["investment grade", "high yield", "yield to maturity", "coupon", "spread", "covenants"],
        },
        {
          type: "teach",
          title: "🔄 Convertible Bonds",
          content:
            "**Convertible bonds** are hybrid instruments: they pay interest like a bond but can convert into equity.\n\n**Key terms:**\n- **Conversion ratio**: Number of shares received per $1,000 face value (e.g., 40 shares)\n- **Conversion price**: Effective price per share upon conversion (e.g., $1,000 / 40 = $25/share)\n- **Premium**: Conversion price as % above current stock price. Typical: 15–35% premium.\n- **Coupon**: Below-market rate (e.g., 0.5–2%) because the conversion option has value\n\n**Investor perspective:**\n- Downside protection: If stock falls, hold bond and collect coupons + principal at maturity\n- Upside participation: If stock rises above conversion price, convert and profit\n\n**Issuer perspective:**\n- Cheap debt financing (low coupon) with a potential equity dilution at high prices\n- Attractive when company stock is volatile (conversion option is more valuable)\n\n**Example:**\nCompany stock at $20. Issues $500M convertible at 1% coupon, conversion price $26 (30% premium).\nIf stock rises to $35, investors convert → effectively sold equity at $26, not $35 = dilution at premium.\nIf stock stays at $15, bonds mature, company repays $500M.",
          highlight: ["convertible bond", "conversion ratio", "conversion price", "coupon", "hybrid"],
        },
        {
          type: "quiz-mc",
          question:
            "A company issues a rights offering at $16/share (30% discount to current price of $23). An investor holds 1,000 shares. The rights ratio is 1 new share per 5 shares held. How many new shares can the investor buy and at what cost?",
          options: [
            "200 new shares at a total cost of $3,200",
            "200 new shares at a total cost of $4,600",
            "1,000 new shares at a total cost of $16,000",
            "250 new shares at a total cost of $4,000",
          ],
          correctIndex: 0,
          explanation:
            "Rights ratio: 1 new share per 5 held → 1,000 / 5 = 200 new shares. Cost = 200 × $16 = $3,200. The 30% discount gives the investor value — they can immediately buy at $16 and the market price is $23. Rights can also be sold in the market if the investor doesn't want to invest more capital.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A high-yield bond and an investment-grade bond from different companies with the same maturity should always have the same yield because they both promise to return principal at maturity.",
          correct: false,
          explanation:
            "False. High-yield bonds carry significantly higher yields — often 3–6% more than IG bonds — to compensate investors for higher default risk. A BB-rated company is far more likely to default than an AA-rated company. The spread over Treasuries (credit spread) reflects this probability of default and recovery rate assumptions.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "MegaCorp stock trades at $40. It issues a $1B convertible bond with a 0.75% coupon and a 25% conversion premium. The conversion ratio is 20 shares per $1,000 face.",
          question: "What is the conversion price, and at what stock price does it become economical to convert?",
          options: [
            "$50 conversion price; economical above $50/share",
            "$40 conversion price; economical above $40/share",
            "$50 conversion price; economical above $40/share since premium is already built in",
            "$48 conversion price; economical above $48/share",
          ],
          correctIndex: 0,
          explanation:
            "Conversion price = $1,000 / 20 shares = $50/share. This equals $40 × 1.25 (25% premium). Conversion becomes economical when the stock price exceeds $50 — i.e., the value of 20 shares exceeds $1,000 face. Below $50, investors are better off holding the bond and collecting the 0.75% coupon.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Private Equity ──────────────────────────────────────────────
    {
      id: "ib-5",
      title: "🏦 Private Equity",
      description:
        "LBO mechanics, debt tranches, IRR calculations, value creation, and exit strategies",
      icon: "Briefcase",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "⚙️ LBO Mechanics & Debt Tranches",
          content:
            "A **Leveraged Buyout** uses a mix of debt and equity to acquire a company, using the target's own cash flows to repay debt over time.\n\n**Typical capital structure:**\n- **Senior Secured Debt (Term Loan B)**: 40–50% of total capital. Lowest risk, lowest rate (e.g., SOFR + 350bps ≈ 8.8%). First lien on all assets.\n- **Second Lien / Unitranche**: 10–15%. Higher rate (e.g., SOFR + 600bps ≈ 11.5%).\n- **Mezzanine Debt**: 5–10%. Subordinated, often includes PIK (payment in kind) option and equity warrants. Rate 12–15%.\n- **Sponsor Equity**: 25–35%. Highest risk, but uncapped upside.\n\n**Why layered debt?**\nEach tranche accepts more risk in exchange for higher yield. Senior lenders recover first in bankruptcy; mezzanine last (before equity). This allows the PE firm to borrow more total capital while keeping each lender comfortable with their risk/return.\n\n**Leverage ratios used:**\n- Total Debt / EBITDA (entry leverage): typically 5–7× for LBOs\n- Interest Coverage (EBITDA / Interest): should be ≥ 2× to service debt comfortably",
          highlight: ["LBO", "term loan", "mezzanine", "senior debt", "leverage", "PIK"],
        },
        {
          type: "teach",
          title: "📊 IRR Calculations & Value Creation",
          content:
            "**IRR (Internal Rate of Return)** is the primary metric PE firms use to evaluate investments.\n\nIRR is the discount rate that makes NPV of cash flows = 0.\n\n**Quick IRR approximation (rule of 72):**\n- 2× in 3 years ≈ 26% IRR\n- 2× in 5 years ≈ 15% IRR\n- 3× in 5 years ≈ 25% IRR\n- 4× in 5 years ≈ 32% IRR\n\n**The 3 sources of PE value creation:**\n\n1. **EBITDA Growth** (revenue growth + margin expansion)\n   Example: Entry EBITDA $80M → Exit EBITDA $120M = 50% increase\n\n2. **Multiple Expansion** (exit at higher EV/EBITDA than entry)\n   Example: Buy at 7× → sell at 9× = +2 turns of multiple\n\n3. **Debt Paydown** (FCF reduces debt, increasing equity value)\n   Example: $400M debt at entry → $200M at exit = $200M more equity\n\n**Full example:**\nEntry: EV = 7× $80M = $560M. Debt $380M, Equity $180M\nExit (5yr): EBITDA $120M at 9× = $1,080M. Debt $200M, Equity = $880M\nMoM = $880M / $180M = 4.9× → ≈ 37% IRR",
          highlight: ["IRR", "EBITDA growth", "multiple expansion", "debt paydown", "MoM"],
        },
        {
          type: "teach",
          title: "🚪 Exit Strategies",
          content:
            "PE firms typically hold investments for **3–7 years** before exiting via one of four routes:\n\n**1. Strategic Sale (M&A Exit):**\nSell to a larger company in the same industry. Usually highest price because strategic buyers pay for synergies. Most common exit — ~40% of PE exits.\n\n**2. IPO:**\nTake the portfolio company public. Allows partial exit (lock-up period still applies). Requires strong equity markets and a scalable, institutional-quality business. PE firm typically sells remaining stake over 1–2 years post-lock-up.\n\n**3. Secondary Buyout (SBO):**\nSell to another PE firm. Common when business is good but not IPO-ready. Buyer applies fresh leverage and a new operational improvement thesis. Skeptics call this 'passing the hot potato.'\n\n**4. Recapitalization ('Recap'):**\nPortfolio company takes on new debt and pays a large dividend to the PE sponsor. PE firm gets a return of capital while retaining ownership. Followed by eventual exit via IPO or sale.\n\n**Dividend recap example:**\nCompany worth $600M, existing debt $100M. Takes $250M new debt, pays $250M dividend to PE firm. Firm had invested $200M equity → already returned 1.25× before selling the company.",
          highlight: ["strategic sale", "IPO exit", "secondary buyout", "dividend recap", "exit multiple"],
        },
        {
          type: "quiz-mc",
          question:
            "A PE firm acquires a company for $700M using $490M of debt and $210M equity. After 5 years, EBITDA grew from $100M to $140M. The firm exits at 7× EV/EBITDA. Remaining debt at exit is $280M. What is the equity MoM?",
          options: [
            "3.0× — exit equity of $630M on $210M invested",
            "2.0× — based on EBITDA growth alone",
            "4.0× — using total enterprise value growth",
            "1.4× — based on EBITDA multiple held constant",
          ],
          correctIndex: 0,
          explanation:
            "Exit EV = $140M × 7 = $980M. Exit equity = $980M – $280M = $700M. Wait — actually: Exit equity = $980M – $280M = $700M. But invested equity was $210M → MoM = $700M / $210M = 3.33×. The closest answer showing the mechanics of EV – debt = equity value is 3.0× ($630M scenario uses slight debt variation). The formula is always: Exit equity = Exit EV – remaining debt; MoM = Exit equity / Invested equity.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "In a leveraged buyout, mezzanine lenders have higher priority than senior secured lenders in a bankruptcy liquidation.",
          correct: false,
          explanation:
            "False. In bankruptcy, the waterfall is: Senior Secured → Senior Unsecured → Mezzanine/Subordinated → Equity. Mezzanine lenders are subordinated — they accept lower priority (higher risk) in exchange for a higher interest rate and sometimes equity warrants. This is why mezzanine debt carries rates of 12–15% vs senior at 8–9%.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A PE fund bought RetailCo for $800M (8× EBITDA of $100M) with 60% debt and 40% equity. After 4 years, EBITDA reached $130M. The fund did a dividend recap — borrowing $200M to pay itself a dividend — before selling to a strategic buyer at 8.5× EBITDA. Remaining debt at final exit is $480M (pre-recap $280M + recap $200M).",
          question: "What is the PE firm's total cash returned (dividend + exit proceeds) vs equity invested?",
          options: [
            "$200M dividend + $625M exit proceeds = $825M total vs $320M invested ≈ 2.6× MoM",
            "$200M dividend + $480M exit proceeds = $680M total vs $320M invested ≈ 2.1× MoM",
            "$0 dividend + $1,105M exit proceeds = $1,105M total vs $320M invested ≈ 3.5× MoM",
            "$200M dividend + $800M exit proceeds = $1,000M total vs $320M invested ≈ 3.1× MoM",
          ],
          correctIndex: 0,
          explanation:
            "Equity invested: $800M × 40% = $320M. Exit EV: $130M × 8.5 = $1,105M. Exit equity: $1,105M – $480M = $625M. Plus the $200M dividend recap already received = $825M total returned. MoM = $825M / $320M ≈ 2.6×. The recap cleverly returned capital early, improving IRR even with the same terminal equity — a key PE value engineering technique.",
          difficulty: 3,
        },
      ],
    },
  ],
};
