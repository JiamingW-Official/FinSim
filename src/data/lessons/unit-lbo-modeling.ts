import type { Unit } from "./types";

export const UNIT_LBO_MODELING: Unit = {
  id: "lbo-modeling",
  title: "LBO Modeling & PE Financial Engineering",
  description:
    "Master leveraged buyout modeling: deal structure, debt schedules, operating models, returns analysis, and exit strategies used by top PE firms",
  icon: "🏗️",
  color: "#b45309",
  lessons: [
    // ─── Lesson 1: LBO Fundamentals ──────────────────────────────────────────────
    {
      id: "lbo-1",
      title: "LBO Fundamentals",
      description:
        "What is an LBO, sponsor economics, ideal target characteristics, and how the deal structure creates equity returns",
      icon: "Building2",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "What Is a Leveraged Buyout?",
          content:
            "A **Leveraged Buyout (LBO)** is the acquisition of a company using a significant proportion of borrowed money — typically 60–70% debt — alongside a smaller equity contribution from a private equity sponsor.\n\n**Core mechanics:**\n- The target company's own assets and cash flows serve as collateral for the debt\n- The PE sponsor contributes 30–40% equity\n- Over the hold period (4–7 years), the company's cash flows repay the debt\n- At exit, the reduced debt load means higher equity value — even if enterprise value grows modestly\n\n**Why leverage amplifies returns:**\n- Purchase: $1B EV = $700M debt + $300M equity\n- Exit: $1.2B EV with $400M debt remaining\n- Equity value at exit = $1.2B − $400M = **$800M**\n- MOIC = $800M / $300M = **2.67×** on just 20% EV growth\n\n**Sponsor economics:**\n- The PE firm (GP) charges a 1.5–2% management fee on committed capital\n- Earns 20% carried interest on profits above the hurdle rate (typically 8% IRR)\n- Associates and analysts build models; partners source deals and manage boards\n- A successful deal can generate $50–200M+ in carry for the GP team alone",
          highlight: ["LBO", "leverage", "sponsor", "carried interest", "MOIC"],
        },
        {
          type: "teach",
          title: "Ideal LBO Target Characteristics",
          content:
            "Not every company makes a good LBO candidate. PE firms look for specific characteristics that enable high leverage and predictable returns.\n\n**1. Stable, recurring free cash flow:**\n- The company must generate enough FCF to service debt annually\n- Rule of thumb: EBITDA / Total Debt > 15–20% (5–7× leverage coverage)\n- Cyclical businesses (steel, shipping) are poor candidates; software subscriptions are excellent\n\n**2. Defensible competitive moat:**\n- Pricing power prevents margin compression during debt service\n- High switching costs, proprietary IP, network effects, or regulatory barriers\n- Example: A healthcare services company with long-term government contracts\n\n**3. Asset-light business model:**\n- Low capex requirements mean more FCF available for debt repayment\n- EBITDA − capex = EBITDA margin of free cash flow\n- Software: capex < 5% revenue; manufacturing: capex 8–15% revenue (less ideal)\n\n**4. Fragmented market with consolidation opportunity:**\n- Allows bolt-on acquisitions at lower multiples → multiple arbitrage\n\n**5. Underperforming management or operations:**\n- PE adds value by professionalizing processes, cutting costs, expanding geographically\n- Turnaround opportunities are higher risk but higher reward\n\n**Red flags:** Customer concentration >30%, high capex, cyclical revenue, regulatory overhang, rapid technology change",
          highlight: ["FCF", "EBITDA", "asset-light", "moat", "bolt-on", "fragmented market"],
        },
        {
          type: "teach",
          title: "LBO Deal Structure Overview",
          content:
            "An LBO uses a layered **capital structure** (the 'capital stack') — each layer carries different risk, cost, and seniority.\n\n**Typical capital stack for a $1B LBO:**\n\n| Layer | Amount | % | Cost | Seniority |\n|---|---|---|---|---|\n| Senior secured (TLB) | $450M | 45% | SOFR + 3–4% | First lien |\n| Senior notes (HY bonds) | $200M | 20% | 7–9% fixed | Second lien |\n| Mezzanine / PIK | $50M | 5% | 12–14% | Subordinated |\n| Sponsor equity | $300M | 30% | Target 20%+ IRR | Residual |\n\n**Key structural terms:**\n- **Term Loan B (TLB)**: Institutional loan, amortizes 1% per year, remainder at maturity (7 years). Most common senior debt in LBOs.\n- **Revolving credit facility (RCF)**: $50–100M undrawn backup for working capital — drawn as needed\n- **PIK (Payment in Kind)**: Interest accrues as additional debt rather than cash payment — preserves FCF but compounds leverage\n- **Equity cushion**: Typically 30–40% of total capitalization; below 25% triggers lender concern\n\n**NewCo structure**: PE firm creates a new holding company (NewCo) which acquires the target using the debt. Debt sits at NewCo, separated from the target's other obligations.",
          highlight: ["capital stack", "Term Loan B", "PIK", "senior secured", "NewCo", "revolving credit"],
        },
        {
          type: "quiz-mc",
          question:
            "A PE firm acquires a company for $800M using $560M of debt and $240M of equity. After 5 years, the enterprise value is $1.1B and debt has been paid down to $360M. What is the equity MOIC?",
          options: [
            "3.1× — exit equity of $740M divided by $240M invested",
            "1.4× — based on enterprise value growth from $800M to $1.1B",
            "2.3× — based on the $300M EV increase divided by $240M equity",
            "4.6× — based on the debt paydown of $200M as a return",
          ],
          correctIndex: 0,
          explanation:
            "Exit equity value = Exit EV − Remaining debt = $1.1B − $360M = $740M. MOIC = $740M / $240M = 3.08×. This illustrates the power of leverage: enterprise value grew 37.5% ($800M to $1.1B), but equity value grew over 200% ($240M to $740M). Debt paydown of $200M + EV growth of $300M both flow entirely to equity holders.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "An asset-heavy company with high annual capex requirements makes an ideal LBO target because its tangible assets can serve as collateral for debt.",
          correct: false,
          explanation:
            "False. While tangible assets do provide collateral, high capex requirements consume the free cash flow needed to service LBO debt. The ideal LBO target is asset-light with low reinvestment requirements, so the majority of EBITDA converts to free cash flow that can be used for debt repayment. Asset-heavy businesses (manufacturing, mining) have limited FCF after capex, making leverage harder to sustain.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Sources & Uses ─────────────────────────────────────────────────
    {
      id: "lbo-2",
      title: "Sources & Uses of Funds",
      description:
        "Debt tranches, equity contribution, financing fees, and how leverage ratios vary by sector and credit quality",
      icon: "Layers",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "The Sources & Uses Table",
          content:
            "Every LBO model starts with a **Sources & Uses** table — the fundamental accounting of where money comes from and where it goes. Sources must equal Uses.\n\n**Example: $1B LBO**\n\n**USES (where money goes):**\n- Purchase price (equity value of target): $920M\n- Refinance existing target debt: $50M\n- Financing fees: $20M\n- Transaction fees (M&A advisory): $10M\n- **Total Uses: $1,000M**\n\n**SOURCES (where money comes from):**\n- Term Loan B: $450M (4.5× EBITDA)\n- Senior notes (high yield): $200M (2.0× EBITDA)\n- Revolving credit facility: $0M (undrawn)\n- PE sponsor equity: $300M (3.0× EBITDA)\n- Management rollover equity: $50M (0.5× EBITDA)\n- **Total Sources: $1,000M**\n\n**Financing fees** are capitalized and amortized over the loan life — they increase the effective cost of debt above the stated coupon.\n\n**Purchase price breakdown:**\n- Enterprise Value = Equity Value + Net Debt\n- If target has $50M existing debt and $5M cash: EV = $875M + $50M − $5M = $920M equity purchase",
          highlight: ["sources", "uses", "Term Loan B", "management rollover", "financing fees"],
        },
        {
          type: "teach",
          title: "Debt Tranches: Senior, Mezzanine, PIK",
          content:
            "LBO debt is structured in tranches with different risk profiles, costs, and repayment priorities.\n\n**Senior Secured Debt (First Lien):**\n- Term Loan A (TLA): Amortizing, sold to banks, 5-year maturity\n- Term Loan B (TLB): Institutional investors (CLOs, hedge funds), 1% annual amortization, 7-year bullet\n- Cost: SOFR + 300–500 bps (floating rate)\n- Covenants: Typically covenant-lite for large LBOs\n\n**Second Lien / Senior Notes:**\n- Subordinated to first lien but senior to mezz\n- High-yield bonds: fixed rate, semi-annual cash coupon, 8-year maturity\n- Cost: 7–10% fixed\n- Public market instrument — more liquid than loans\n\n**Mezzanine Debt:**\n- Privately placed, subordinated to all debt\n- Often includes equity warrants (kickers) to compensate lenders\n- Cost: 12–16% (cash + PIK combination)\n- Less common post-2010 as institutional TLB market expanded\n\n**PIK (Payment in Kind) Toggle Notes:**\n- Issuer can elect to pay interest as additional debt (PIK) instead of cash\n- Useful when FCF is tight in early years\n- PIK interest compounds — $100M at 12% PIK = $112M after year 1, $125M after year 2\n- Lenders demand higher rates to compensate for PIK optionality",
          highlight: ["Term Loan B", "TLB", "high yield", "mezzanine", "PIK", "covenant-lite"],
        },
        {
          type: "teach",
          title: "Leverage Ratios by Sector",
          content:
            "The amount of debt an LBO can support depends on the industry's cash flow predictability, growth profile, and asset base.\n\n**Leverage ratio = Total Debt / EBITDA**\n\n| Sector | Typical Leverage | Why |\n|---|---|---|\n| Software / SaaS | 6–8× EBITDA | Recurring ARR, low churn, high margins |\n| Healthcare services | 5–7× | Predictable reimbursements, essential services |\n| Business services | 4–6× | Recurring contracts, low capex |\n| Consumer staples | 4–5× | Stable demand, pricing power |\n| Industrials / manufacturing | 3–4.5× | Cyclical, capex-intensive |\n| Retail | 3–4× | Volatile consumer demand |\n| Energy / commodities | 2–3× | High price volatility, capex heavy |\n\n**Why sector matters:**\n- A software company with 80% gross margins and $100M ARR can service far more debt than a retailer with 30% margins and same EBITDA\n- Lenders look at **interest coverage ratio**: EBITDA / Cash Interest Expense > 2.0× minimum, prefer >3.0×\n- **Debt / EBITDA** must decline to <4.0× within 5 years for most investment mandates\n\n**Post-GFC vs. current trends:**\n- Pre-2008: 8–10× leverage on large deals was common\n- Post-2008: 5–6× became standard for broad market\n- 2022–2024 rate hike environment: leverage compressed to 4–5×",
          highlight: ["leverage ratio", "interest coverage", "EBITDA", "SaaS", "covenant"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A PE firm is evaluating two LBO targets, both with $100M EBITDA. Target A is a healthcare IT software company with 85% gross margins and 95% revenue retention. Target B is a specialty chemicals manufacturer with 35% gross margins and significant annual capex of $30M.",
          question: "Which target can support higher leverage and why?",
          options: [
            "Target A — higher margins and recurring revenue create more predictable FCF for debt service",
            "Target B — tangible assets from manufacturing provide better collateral for lenders",
            "Both equally — EBITDA is identical so debt capacity is the same",
            "Target B — lower margins mean management has more room to cut costs under PE ownership",
          ],
          correctIndex: 0,
          explanation:
            "Target A can support 6–8× EBITDA leverage vs. 3–4× for Target B. FCF conversion matters: Target A's $100M EBITDA converts to ~$85M FCF (minimal capex), while Target B's FCF = $100M − $30M capex = $70M before working capital. Recurring SaaS-like revenue also reduces cash flow volatility, allowing lenders to underwrite more debt. Collateral matters less than debt serviceability in modern LBO underwriting.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "What is a PIK toggle note in an LBO capital structure?",
          options: [
            "A debt instrument where the issuer can elect to pay interest as additional debt instead of cash",
            "A convertible note that automatically converts to equity at a specified IRR hurdle",
            "A revolving credit facility that can be toggled on and off based on borrower needs",
            "A senior secured loan with a payment-in-kind equity kicker for the lender",
          ],
          correctIndex: 0,
          explanation:
            "PIK toggle notes give the borrower the option to pay interest either in cash or in kind (as additional debt principal). When cash is tight — especially in early LBO years — the company elects PIK to preserve liquidity. The downside: PIK interest compounds, so $100M at 12% PIK becomes $125.4M after 2 years without any cash outflow. Lenders demand premium rates (typically 1.5–2% above cash rate) for this flexibility.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Operating Model ────────────────────────────────────────────────
    {
      id: "lbo-3",
      title: "Operating Model & FCF Waterfall",
      description:
        "Revenue build, EBITDA bridge, capex and working capital treatment, and the free cash flow waterfall from EBITDA to equity",
      icon: "BarChart2",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Revenue Build & EBITDA Bridge",
          content:
            "The operating model forecasts how the business will perform during the PE hold period. It drives every downstream calculation — debt service, returns, and exit value.\n\n**Revenue build — bottom-up approach:**\n- Segment revenues by product line, geography, or customer cohort\n- Apply growth assumptions: organic volume + pricing + new customers\n- Example for a B2B software company:\n  - Existing ARR: $200M × 105% retention = $210M\n  - New bookings: $40M at 80% close rate = $32M\n  - **Year 1 revenue: $242M** (9% growth)\n\n**EBITDA bridge from Year 0 to Year 5:**\n\n| Item | Amount |\n|---|---|\n| Base EBITDA (Year 0) | $80M |\n| Revenue growth at 35% margin | +$22M |\n| Pricing improvement | +$5M |\n| Cost reduction program | +$8M |\n| Add-on acquisition EBITDA | +$15M |\n| Dis-synergies / integration costs | −$5M |\n| **Year 5 EBITDA** | **$125M** |\n\n**EBITDA margin analysis:**\n- Year 0: $80M / $220M revenue = 36.4%\n- Year 5: $125M / $345M revenue = 36.2% (roughly stable — realistic)\n- Red flag: models showing >500bps margin expansion without specific initiatives\n\n**Sensitivity drivers:** Revenue growth ±2%, EBITDA margin ±1% — run these systematically",
          highlight: ["EBITDA bridge", "revenue build", "ARR", "margin", "sensitivity"],
        },
        {
          type: "teach",
          title: "Capex, Working Capital & D&A",
          content:
            "Below EBITDA, four items convert earnings to free cash flow. Getting these right separates a professional LBO model from a back-of-envelope calculation.\n\n**1. Depreciation & Amortization (D&A):**\n- Added back to get EBITDA; actual cash cost is the capex line\n- PPA (purchase price allocation) creates additional amortization of intangibles — large in software LBOs\n- D&A shields taxable income\n\n**2. Capital Expenditure (Capex):**\n- **Maintenance capex**: Required to sustain current revenue — unavoidable\n- **Growth capex**: Discretionary investment for expansion — can be deferred\n- Model separately: maintenance capex as % revenue (stable), growth capex project-by-project\n- Software LBO: total capex 2–4% of revenue; industrial LBO: 6–12%\n\n**3. Changes in Working Capital:**\n- Working capital = Accounts Receivable + Inventory − Accounts Payable\n- Growing businesses typically consume working capital (use of cash)\n- PE firms target: reduce Days Sales Outstanding (DSO), extend Days Payable Outstanding (DPO)\n- Example: Reducing DSO from 60 to 45 days on $300M revenue = **$12.4M one-time cash release**\n\n**4. Taxes:**\n- Cash taxes on EBIT (after D&A, before amortization of deal fees)\n- Interest deductibility is critical — shields significant taxable income\n- US: interest deductibility limited to 30% of EBITDA (TCJA 2017 / EBIT after 2022)",
          highlight: ["capex", "working capital", "DSO", "D&A", "PPA", "interest deductibility"],
        },
        {
          type: "teach",
          title: "Free Cash Flow Waterfall",
          content:
            "The **FCF waterfall** shows exactly how EBITDA converts to cash available for debt repayment — the core mechanic of an LBO.\n\n**FCF waterfall calculation:**\n\n```\nEBITDA                           $100M\n− Cash Interest Expense           (35M)   ← debt × avg rate\n− Cash Taxes                      (12M)   ← EBIT × tax rate\n− Maintenance Capex                (8M)\n− Working Capital Change            (3M)\n= Levered Free Cash Flow          $42M\n```\n\n**Uses of Levered FCF:**\n1. Mandatory debt amortization (TLA, TLB scheduled payments)\n2. Optional cash sweep (accelerated debt paydown)\n3. Add-on acquisitions\n4. Dividends to equity holders (rare, sometimes via recapitalization)\n\n**Cash conversion rate = LFCF / EBITDA**\n- Healthy LBO: 35–50% conversion (pay interest, taxes, some capex)\n- Low conversion (<25%): stress signal — may breach covenants\n- High conversion (>55%): often implies under-investment in growth\n\n**Interest coverage ratio:**\n- EBITDA / Cash Interest Expense\n- Minimum lender requirement: typically 2.0–2.5×\n- Example: $100M EBITDA / $35M interest = 2.86× ← acceptable\n- At 1.5× or below: covenant breach risk, potential default",
          highlight: ["FCF waterfall", "levered FCF", "cash conversion", "interest coverage", "cash sweep"],
        },
        {
          type: "quiz-mc",
          question:
            "An LBO target has $90M EBITDA, $32M cash interest expense, $10M cash taxes, $7M maintenance capex, and $4M working capital build. What is the levered free cash flow?",
          options: [
            "$37M — EBITDA minus interest, taxes, capex and working capital",
            "$58M — EBITDA minus interest and taxes only",
            "$53M — EBITDA minus interest expense and capex",
            "$80M — EBITDA minus maintenance capex only",
          ],
          correctIndex: 0,
          explanation:
            "Levered FCF = $90M − $32M − $10M − $7M − $4M = $37M. This is the cash available for debt repayment (mandatory amortization + voluntary sweep) or equity distributions. Cash conversion = $37M / $90M = 41%, which is reasonable. Note: growth capex and discretionary items are excluded from the mandatory waterfall — they represent management decisions about capital allocation.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In an LBO operating model, EBITDA and levered free cash flow are interchangeable metrics for evaluating debt serviceability.",
          correct: false,
          explanation:
            "False. EBITDA and levered FCF diverge materially. EBITDA ignores cash interest, taxes, capex, and working capital changes — all real cash obligations. A company with $100M EBITDA but $80M cash interest + $20M capex has essentially no FCF, making it highly stressed despite the EBITDA figure. Lenders analyze FCF and coverage ratios, not just EBITDA, to assess debt serviceability.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Returns Analysis ───────────────────────────────────────────────
    {
      id: "lbo-4",
      title: "Returns Analysis: IRR, MOIC & Value Bridge",
      description:
        "IRR calculation mechanics, MOIC vs IRR trade-offs, and the value creation bridge decomposing returns into EBITDA growth, multiple expansion, and leverage paydown",
      icon: "TrendingUp",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "IRR Calculation Mechanics",
          content:
            "**IRR (Internal Rate of Return)** is the discount rate that makes the NPV of all cash flows equal to zero. In LBO models, it is the annualized equity return.\n\n**IRR formula (conceptual):**\n0 = −Equity_Invested + Σ [Cash_Flow_t / (1+IRR)^t] + Exit_Equity / (1+IRR)^T\n\n**Simple approximation for single-entry, single-exit:**\nIRR ≈ (Exit_Equity / Entry_Equity)^(1/T) − 1\n\n**Numerical example:**\n- Entry equity: $300M (Year 0)\n- Interim dividends: $0 (no distributions during hold)\n- Exit equity: $750M (Year 5)\n- IRR = ($750M / $300M)^(1/5) − 1 = 2.5^0.2 − 1 = **20.1%**\n\n**With interim dividends (dividend recap):**\n- Entry equity: $300M\n- Year 3 dividend recap: $100M returned\n- Exit equity: $600M\n- IRR is higher (~22%) because $100M received earlier compounds at higher effective rate\n\n**IRR sensitivity to hold period:**\n| Exit Year | Exit Equity | IRR |\n|---|---|---|\n| Year 3 | $600M | 26.0% |\n| Year 5 | $750M | 20.1% |\n| Year 7 | $850M | 16.1% |\n\n**Key insight**: Getting to $750M in Year 3 beats getting to $850M in Year 7 on an IRR basis. Speed of exit is as important as magnitude.",
          highlight: ["IRR", "NPV", "exit equity", "hold period", "dividend recap"],
        },
        {
          type: "teach",
          title: "MOIC vs IRR: Complementary Metrics",
          content:
            "PE funds report both MOIC and IRR because each tells a different story about investment performance.\n\n**MOIC (Multiple of Invested Capital):**\n- MOIC = Total Value Returned / Equity Invested\n- Simple, intuitive — investors know exactly how many times their money was returned\n- Blind to time: 3× over 2 years vs. 3× over 10 years have the same MOIC but vastly different IRRs\n\n**IRR captures time value:**\n| MOIC | Hold Period | IRR |\n|---|---|---|\n| 2.0× | 2 years | 41.4% |\n| 2.0× | 5 years | 14.9% |\n| 2.0× | 10 years | 7.2% |\n| 3.0× | 3 years | 44.2% |\n| 3.0× | 5 years | 24.6% |\n| 3.0× | 7 years | 17.0% |\n\n**Industry benchmarks:**\n- Top quartile PE: >20% net IRR, >2.5× MOIC\n- Median PE: ~13% net IRR, ~2.0× MOIC\n- Hurdle rate (preferred return to LPs): 8% IRR\n\n**DPI vs TVPI:**\n- **DPI (Distributed to Paid-In)**: Realized cash returned — what LPs have actually received\n- **TVPI (Total Value to Paid-In)**: DPI + unrealized NAV of remaining portfolio\n- Mature funds should have DPI → TVPI; paper gains (high TVPI, low DPI) can erode if exit markets deteriorate\n\n**IRR manipulation warning**: Dividend recapitalizations and quick flips artificially boost IRR without creating operational value. LPs now scrutinize DPI alongside IRR.",
          highlight: ["MOIC", "IRR", "DPI", "TVPI", "top quartile", "hurdle rate"],
        },
        {
          type: "teach",
          title: "Value Creation Bridge",
          content:
            "The **value creation bridge** (or returns attribution bridge) decomposes total equity returns into three distinct drivers — helping PE firms and LPs understand how returns were generated.\n\n**Three drivers of LBO equity returns:**\n\n**1. EBITDA Growth (Operational Value Creation)**\n- Revenue growth × margin = EBITDA improvement\n- Example: EBITDA grows from $80M to $125M\n- EV impact at constant 10× multiple: ($125M − $80M) × 10 = **+$450M EV**\n\n**2. Multiple Expansion**\n- Buy at 10× EBITDA, sell at 12× EBITDA\n- Example: Exit EBITDA $125M × 12× = $1.5B vs. $125M × 10× = $1.25B\n- Multiple expansion adds: **+$250M EV** with no operational improvement\n- Driven by: improved sector sentiment, company de-risking, strategic premium from buyer\n\n**3. Leverage Paydown (Debt Reduction)**\n- Every dollar of debt repaid flows directly to equity holders\n- Example: Debt reduced from $700M to $400M = **+$300M equity value**\n\n**Full bridge example:**\n```\nEntry equity              $300M\n+ EBITDA growth            +$450M EV → equity\n+ Multiple expansion       +$250M EV → equity\n+ Leverage paydown         +$300M directly\n= Exit equity              ~$800M\nMOIC ≈ 2.7×\n```\n\n**Interpreting the bridge:**\n- Pure multiple expansion returns = financial engineering, not operational skill\n- EBITDA-driven returns = sustainable, repeatable value creation\n- LPs increasingly prefer EBITDA-driven returns; multiple expansion is a bonus",
          highlight: ["EBITDA growth", "multiple expansion", "leverage paydown", "value bridge", "returns attribution"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A PE firm buys a company for $1B (10× $100M EBITDA) using $650M debt and $350M equity. After 5 years: EBITDA has grown to $140M, exit multiple is 11×, and debt is paid down to $500M.",
          question: "What is the approximate equity MOIC and the dominant value creation driver?",
          options: [
            "MOIC ~2.1× driven primarily by EBITDA growth and leverage paydown; multiple expansion is secondary",
            "MOIC ~1.4× because the enterprise value grew less than the initial debt load",
            "MOIC ~3.5× driven entirely by the multiple expansion from 10× to 11×",
            "MOIC ~2.1× driven primarily by the multiple expansion from 10× to 11×",
          ],
          correctIndex: 0,
          explanation:
            "Exit EV = $140M × 11 = $1.54B. Exit equity = $1.54B − $500M = $1.04B. MOIC = $1.04B / $350M = 2.97×. Attribution: EBITDA growth adds $400M EV ($140M−$100M × 10), multiple expansion adds $140M ($140M × 1×), leverage paydown adds $150M in equity ($650M−$500M). EBITDA growth is the dominant driver at ~$400M of EV creation vs $140M from multiple expansion.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "A PE firm exits an LBO with a 3.5× MOIC after a 7-year hold. Another firm exits a different deal with a 2.5× MOIC after a 3-year hold. Which investment had the higher IRR?",
          options: [
            "The 2.5× / 3-year deal with approximately 36% IRR vs. the 3.5× / 7-year deal at approximately 19% IRR",
            "The 3.5× / 7-year deal because the absolute multiple is higher",
            "Both deals have similar IRRs since MOIC differences offset the hold period differences",
            "The 3.5× / 7-year deal at approximately 28% IRR vs. 2.5× / 3-year at approximately 23% IRR",
          ],
          correctIndex: 0,
          explanation:
            "IRR = (MOIC)^(1/T) − 1. Deal 1: 2.5^(1/3) − 1 = 1.357 − 1 = 35.7%. Deal 2: 3.5^(1/7) − 1 = 1.196 − 1 = 19.6%. Despite a much higher MOIC, the 7-year hold destroys IRR. A 3.5× over 7 years barely outperforms the 8% hurdle rate sufficiently to justify the illiquidity premium. This is why PE firms target fast exits and why time-weighted returns matter enormously in PE.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Debt Schedules ─────────────────────────────────────────────────
    {
      id: "lbo-5",
      title: "Debt Schedules & Covenant Compliance",
      description:
        "Amortization schedules, cash sweep mechanics, revolver draws, PIK toggle modeling, and financial covenant testing",
      icon: "Calendar",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Amortization & Cash Sweep Mechanics",
          content:
            "The **debt schedule** is the backbone of an LBO model — it tracks debt balances, interest payments, and repayments over the entire hold period.\n\n**Mandatory amortization:**\n- Term Loan A: Amortizes 15–20% per year (bank investors require repayment)\n- Term Loan B: 1% per year (minimal) — bullet repayment at maturity\n- High yield bonds: Zero amortization — full bullet at maturity\n- Revolver: Repaid whenever drawn; no scheduled amortization\n\n**Cash sweep (excess cash flow sweep):**\n- Most senior credit agreements require 50–75% of excess FCF to be applied to debt\n- Excess FCF = LFCF − mandatory amortization − capex − taxes paid\n- Lenders structure sweeps to accelerate deleveraging\n- Sweep percentage often steps down as leverage improves:\n  - >4.0× leverage: 75% sweep\n  - 3.0–4.0× leverage: 50% sweep\n  - <3.0× leverage: 25% sweep or none\n\n**Debt schedule structure (Year 1 example):**\n```\nBeginning balance:       $650M\n+ PIK interest accrued:    $0M  (assuming cash pay)\n− Mandatory amortization:  (7M) ← TLB 1%\n− Cash sweep:             (20M) ← 50% of $40M excess FCF\nEnding balance:          $623M\n```\n\n**Interest expense calculation:**\n- Floating rate debt: Principal × (SOFR + Spread)\n- SOFR floor: Often 0.50% minimum — protects lenders in zero-rate environments\n- Model monthly or quarterly compounding; present annually in outputs",
          highlight: ["mandatory amortization", "cash sweep", "excess FCF", "Term Loan B", "PIK", "SOFR"],
        },
        {
          type: "teach",
          title: "Revolver Mechanics",
          content:
            "A **revolving credit facility (RCF)** is a backup liquidity tool — unlike term loans, it can be repeatedly drawn and repaid.\n\n**Revolver basics:**\n- Typical size: $50–150M for mid-market LBOs; $500M+ for large-cap\n- Drawn as needed for working capital, acquisitions, or liquidity needs\n- Undrawn commitments incur a commitment fee (25–50 bps annually)\n- Drawn amounts incur the full loan rate (SOFR + spread)\n\n**Revolver modeling logic:**\n```\nIf beginning cash < minimum cash balance:\n  Draw revolver = shortfall\nElse if ending cash > target maximum:\n  Repay revolver up to drawn balance\n```\n\n**Minimum cash balance:**\n- Companies maintain $10–30M minimum cash for operational needs\n- Model must ensure cash never drops below this floor\n- If revolver is fully drawn and company still needs cash: **distress signal**\n\n**Springing financial covenants:**\n- The revolver often has a 'springing' covenant: only tested when >35% drawn\n- Senior secured leverage ratio: Total Debt / EBITDA < 6.5×\n- If covenant breached: lenders can accelerate repayment or freeze the facility\n\n**Revolver in LBO context:**\n- Often undrawn at close — used as insurance\n- PE firms resist drawing it because it signals cash stress to lenders\n- Strategic use: draw briefly for bolt-on acquisition, repay within 90 days",
          highlight: ["revolver", "RCF", "commitment fee", "minimum cash", "springing covenant"],
        },
        {
          type: "teach",
          title: "Financial Covenants: Leverage & Coverage Tests",
          content:
            "**Financial covenants** are contractual tests that borrowers must pass quarterly or annually. Breaching them gives lenders the right to accelerate debt or demand amendments (for a fee).\n\n**Common LBO covenants:**\n\n**1. Maximum Total Leverage Ratio (Debt / EBITDA):**\n- Most common covenant in leveraged loans\n- Typical threshold: 6.5× at close, stepping down 0.25× per year\n- Year 1: 6.5×, Year 2: 6.25×, Year 3: 6.0×, Year 4: 5.75×, Year 5: 5.5×\n- If EBITDA misses by $10M at 6× leverage: breach threshold immediately\n\n**2. Minimum Interest Coverage Ratio (EBITDA / Interest):**\n- Ensures company can pay interest from operations\n- Typical threshold: 2.0–2.5× EBITDA / Cash Interest\n- Below 1.5×: technical distress; lenders may declare default\n\n**3. Minimum Fixed Charge Coverage Ratio (FCCR):**\n- FCCR = (EBITDA − Capex − Taxes) / (Interest + Mandatory Amortization)\n- Tests whether ALL fixed obligations are covered by operating cash flow\n- Threshold typically 1.0–1.25×\n\n**Covenant headroom analysis (critical modeling step):**\n- Model base, downside, and stress scenarios\n- Measure: (Actual EBITDA − Covenant-break EBITDA) / Actual EBITDA\n- Target: >20% headroom in base case, >5% in downside\n- Red flag: <10% headroom in base case — one bad quarter triggers breach\n\n**Covenant-lite (cov-lite) loans:**\n- Only incurrence covenants (tested when borrower takes action), not maintenance\n- Became dominant in large LBO market post-2012\n- Gives borrowers more flexibility but reduces lender protection",
          highlight: ["leverage ratio", "interest coverage", "FCCR", "covenant headroom", "cov-lite"],
        },
        {
          type: "quiz-mc",
          question:
            "An LBO has $600M total debt, $90M EBITDA, and $30M annual cash interest. The senior credit agreement requires a maximum leverage ratio of 6.0× and minimum interest coverage of 2.0×. Which covenant is closer to being breached?",
          options: [
            "Leverage ratio — actual 6.67× vs. 6.0× limit, already in breach",
            "Interest coverage — actual 2.0× exactly at the 2.0× limit, on the edge",
            "Both covenants are comfortable with significant headroom",
            "Interest coverage — actual 3.0× which barely exceeds the 2.0× threshold",
          ],
          correctIndex: 0,
          explanation:
            "Leverage ratio = $600M / $90M = 6.67×, which exceeds the 6.0× covenant limit — the borrower is already in breach. Interest coverage = $90M / $30M = 3.0×, which comfortably exceeds the 2.0× minimum. In this scenario the company needs to either repay debt, grow EBITDA, or negotiate a covenant amendment (waiver) from lenders — usually at significant cost (50–100 bps amendment fee).",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A cash sweep provision in an LBO credit agreement benefits equity holders by allowing them to retain excess free cash flow for dividends rather than repaying debt.",
          correct: false,
          explanation:
            "False. A cash sweep provision benefits lenders, not equity holders — it requires a percentage of excess FCF (often 50–75%) to be applied to mandatory debt repayment ahead of any equity distributions. While deleveraging ultimately increases equity value by reducing debt, the sweep restricts near-term cash available for dividends or acquisitions. Cash sweep percentages typically step down as leverage improves, giving equity holders more flexibility later in the hold.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Exit Strategies ────────────────────────────────────────────────
    {
      id: "lbo-6",
      title: "Exit Strategies & Sensitivity Analysis",
      description:
        "Strategic sale, sponsor-to-sponsor, IPO, recapitalization routes; holding period analysis; exit multiple sensitivity tables",
      icon: "LogOut",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Four Exit Routes for PE Sponsors",
          content:
            "A PE firm's returns are only realized at exit — the strategy chosen determines the achievable multiple, timeline, and exit certainty.\n\n**1. Strategic Sale (Trade Sale) — most common, ~40% of exits:**\n- Corporate acquirer buys the company for strategic rationale (synergies)\n- Typically pays the highest price: strategic synergies justify 20–30% premium over financial buyers\n- Clean, certain exit — PE receives all cash upfront\n- Best for: market leaders with clear strategic value to large corporates\n\n**2. Sponsor-to-Sponsor (Secondary Buyout / SBO) — ~25% of exits:**\n- One PE firm sells to another PE firm\n- Common when company needs more time to reach IPO scale\n- Seller gets liquidity; buyer underwrites remaining growth\n- Criticism: no new strategic value created — just reflective pricing\n- Pricing: often at lower multiple than strategic sale\n\n**3. IPO (Initial Public Offering) — ~15% of exits:**\n- Company lists on public stock exchange\n- PE firm receives shares, not cash — must sell over lockup period (6–12 months)\n- Best for: large, high-growth, story-driven companies that command premium public market multiples\n- Risk: equity market conditions can deteriorate; underwriting fees 3–7%\n- Example: Hilton Hotels PE exit via IPO (Blackstone 2.6× in hotel sector)\n\n**4. Dividend Recapitalization — partial exit:**\n- Company takes on additional debt to pay a one-time dividend to equity holders\n- PE firm receives partial return without exiting — retains upside\n- Boosts IRR by returning cash early\n- Risk: increases leverage back toward initial LBO levels; can breach covenants\n- Controversial: critics say it extracts value without operational improvement",
          highlight: ["strategic sale", "secondary buyout", "IPO", "dividend recapitalization", "lockup"],
        },
        {
          type: "teach",
          title: "Holding Period Analysis & Optimal Exit Timing",
          content:
            "PE firms do not hold indefinitely — fund lifecycle constraints force exits within 7–10 years. But within that window, timing optimization is critical.\n\n**Factors pushing toward earlier exit:**\n- IRR erosion: each additional year with no value growth reduces IRR\n- Fund lifecycle: capital must be returned for LP reinvestment\n- Opportunity cost: reinvesting proceeds in new deals may generate higher returns\n- Credit market conditions: low rates allow buyers to lever up more → higher prices\n\n**Factors pushing toward later exit:**\n- EBITDA trajectory: selling mid-growth destroys value if growth continues\n- Multiple expansion timing: sector re-rating may be 1–2 years away\n- Strategic M&A calendar: target acquirer may be in acquisition mode next year\n- Integration of bolt-ons: add-on EBITDA takes 2 years to fully materialize in financials\n\n**Optimal holding period model:**\n- Build hold period sensitivity: Year 3 exit vs. Year 5 vs. Year 7\n- Model exit EBITDA growing at base case growth rate\n- Assume exit multiple mean-reverts to entry multiple in base case\n- IRR typically peaks at Year 3–5 for most LBOs; MOIC grows monotonically\n\n**Fund lifecycle pressure:**\n- PE funds have 10-year lives with optional 1-year extensions\n- Year 8–10 investments face 'fire sale' discount if markets are poor\n- Best vintage exits: 2010–2014 (post-GFC recovery, expanding multiples)\n- Worst vintage exits: 2006–2008 (GFC caught many holds at peak leverage)",
          highlight: ["holding period", "IRR erosion", "exit timing", "fund lifecycle", "vintage year"],
        },
        {
          type: "teach",
          title: "Exit Multiple Sensitivity & Returns Matrix",
          content:
            "The most important output of any LBO model is the **returns sensitivity table** — showing IRR and MOIC across a range of exit multiples and EBITDA outcomes.\n\n**Building the sensitivity table:**\n1. Fix exit year (e.g., Year 5)\n2. Vary exit EBITDA: base −20%, −10%, base, +10%, +20%\n3. Vary exit multiple: entry −2×, −1×, entry, +1×, +2×\n4. Calculate exit equity, then IRR and MOIC for each combination\n\n**Example sensitivity (Entry: $100M EBITDA, 10× = $1B EV, $300M equity, $700M debt):**\n\n**MOIC table (Year 5 exit, debt paid to $500M):**\n| Exit EBITDA \\ Multiple | 8× | 10× | 12× | 14× |\n|---|---|---|---|---|\n| $80M | 0.5× | 1.3× | 2.1× | 2.9× |\n| $100M | 1.3× | 2.0× | 2.7× | 3.3× |\n| $120M | 2.1× | 2.7× | 3.3× | 3.9× |\n| $140M | 2.8× | 3.5× | 4.2× | 4.8× |\n\n**Key observations:**\n- Multiple compression to 8× with $80M EBITDA = 0.5× MOIC (loss of capital)\n- EBITDA growth of 40% at entry multiple = 3.5× (strong return)\n- Multiple expansion from 10× to 14× at flat EBITDA = 3.3× (financial engineering)\n- The best returns combine EBITDA growth AND multiple expansion\n\n**IRR threshold analysis:**\n- Find the minimum EBITDA/multiple combination that delivers 20% IRR\n- This defines the 'margin of safety' — how wrong can you be and still hit hurdle?\n- Robust LBOs achieve 20% IRR under multiple compression scenarios",
          highlight: ["sensitivity table", "exit multiple", "MOIC matrix", "margin of safety", "multiple compression"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A PE firm exits an LBO via strategic sale. The entry was $500M EV (8× $62.5M EBITDA) with $350M debt and $150M equity. At exit after 4 years: EBITDA is $90M, the strategic buyer pays a 12× multiple, and debt has been paid down to $250M.",
          question: "What is the exit equity MOIC and the primary value creation driver?",
          options: [
            "MOIC ≈ 4.5× driven by EBITDA growth plus significant multiple expansion (8× to 12×)",
            "MOIC ≈ 2.8× driven primarily by leverage paydown from $350M to $250M",
            "MOIC ≈ 3.2× driven entirely by the strategic premium paid by the acquirer",
            "MOIC ≈ 1.6× because the EV only grew from $500M to $1,080M",
          ],
          correctIndex: 0,
          explanation:
            "Exit EV = $90M × 12 = $1,080M. Exit equity = $1,080M − $250M = $830M. MOIC = $830M / $150M = 5.53×. Attribution: EBITDA growth from $62.5M to $90M at 8× adds $220M EV. Multiple expansion (8× to 12×) on $90M adds $360M EV. Leverage paydown adds $100M equity. The combination of EBITDA growth and strategic multiple premium created exceptional returns — highlighting why strategic sales typically outperform financial buyer exits.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "Why do PE firms sometimes prefer a strategic trade sale over an IPO even when public market valuations are higher?",
          options: [
            "IPOs provide shares not cash, require lockup periods, and introduce market risk during the distribution process",
            "Strategic buyers always pay higher prices than public markets regardless of market conditions",
            "IPOs are prohibited for PE-backed companies under SEC regulations",
            "Trade sales allow PE firms to retain the carried interest for longer periods",
          ],
          correctIndex: 0,
          explanation:
            "In an IPO, PE firms receive shares in the public company — not cash — and must sell over a 6–12 month lockup period. If public markets decline during this window, the realized proceeds can fall significantly below the IPO price. A strategic trade sale delivers certain, immediate cash. Strategic buyers also pay for synergies (cost savings, revenue uplift) that financial buyers cannot underwrite — often resulting in 15–25% higher prices than a secondary buyout or comparable financial buyer process.",
          difficulty: 2,
        },
      ],
    },
  ],
};
