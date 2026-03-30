import type { Unit } from "./types";

export const UNIT_CREDIT_RISK: Unit = {
  id: "credit-risk",
  title: "Credit Risk, Default Modeling & Distressed Debt",
  description:
    "Master credit risk analysis: PD/LGD/EAD framework, Altman Z-score, CDS mechanics, high yield markets, distressed debt investing, and corporate restructuring",
  icon: "🔎",
  color: "#b91c1c",
  lessons: [
    // ─── Lesson 1: Credit Risk Fundamentals ──────────────────────────────────────
    {
      id: "credit-risk-1",
      title: "Credit Risk Fundamentals",
      description:
        "PD/LGD/EAD framework, expected loss calculation, credit ratings methodology, and credit migration matrices",
      icon: "ShieldAlert",
      xpReward: 110,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The PD/LGD/EAD Framework",
          content:
            "Credit risk is the risk that a borrower fails to meet its obligations. Banks and credit investors quantify it through three core variables:\n\n**Probability of Default (PD):**\n- The likelihood a borrower will default within a given horizon (usually 1 year)\n- Estimated via credit ratings, historical default rates, structural models (Merton), or logistic regression on financial ratios\n- Investment-grade issuers (BBB and above): PD typically < 0.5% per year\n- High-yield issuers (BB and below): PD ranges from 1% to 15%+ per year\n- In stress periods (2008–2009), HY annual default rates exceeded 12%\n\n**Loss Given Default (LGD):**\n- The fraction of exposure the lender actually loses if default occurs\n- LGD = 1 − Recovery Rate\n- Recovery rates vary by seniority and asset backing:\n  - Senior secured bank loans: 60–80% recovery → LGD ≈ 20–40%\n  - Senior unsecured bonds: 35–50% recovery → LGD ≈ 50–65%\n  - Subordinated / junior debt: 5–25% recovery → LGD ≈ 75–95%\n\n**Exposure at Default (EAD):**\n- The total outstanding amount at risk when default occurs\n- For bonds: face value + accrued interest\n- For revolving credit: current drawn balance + expected drawdown under stress\n\n**Expected Loss (EL):**\n- EL = PD × LGD × EAD\n- Example: $10M bond, PD = 3%, LGD = 60%\n- EL = 0.03 × 0.60 × $10M = **$180,000 per year**\n- EL is priced into the credit spread; **unexpected loss** (volatility of loss) drives capital requirements",
          highlight: ["PD", "LGD", "EAD", "Expected Loss", "Recovery Rate"],
        },
        {
          type: "teach",
          title: "Credit Ratings Methodology",
          content:
            "The three major rating agencies — **Moody's**, **S&P**, and **Fitch** — assign ratings that communicate creditworthiness using slightly different scales but similar methodologies.\n\n**Rating scales (investment grade → speculative grade):**\n\n| S&P / Fitch | Moody's | Category |\n|---|---|---|\n| AAA | Aaa | Prime / Highest quality |\n| AA+/AA/AA− | Aa1/Aa2/Aa3 | High grade |\n| A+/A/A− | A1/A2/A3 | Upper medium grade |\n| BBB+/BBB/BBB− | Baa1/Baa2/Baa3 | Lower medium grade |\n| BB+/BB/BB− | Ba1/Ba2/Ba3 | Non-investment grade (speculative) |\n| B+/B/B− | B1/B2/B3 | Highly speculative |\n| CCC and below | Caa and below | Substantial risk / near default |\n| D | C/D | In default |\n\n**What agencies analyze:**\n- **Business risk**: competitive position, industry cyclicality, diversification, management quality\n- **Financial risk**: leverage (Debt/EBITDA), coverage (EBITDA/Interest), FCF generation, liquidity\n- **Structural factors**: covenant protections, collateral, seniority, subsidiary guarantees\n- **Country risk**: sovereign ceiling, regulatory environment\n\n**Rating stability vs. accuracy trade-off:**\n- Agencies aim for 'through-the-cycle' ratings — they lag market signals deliberately\n- Market-implied ratings (from CDS spreads) are more timely but more volatile\n- CDS-implied ratings diverged sharply from agency ratings ahead of the 2008 crisis",
          highlight: ["Moody's", "S&P", "Fitch", "investment grade", "speculative grade", "BBB", "through-the-cycle"],
        },
        {
          type: "teach",
          title: "Credit Migration Matrices",
          content:
            "A **credit migration matrix** (or transition matrix) shows the probability that a borrower rated at one grade migrates to any other grade over a one-year horizon.\n\n**Simplified annual transition matrix (%):**\n\n| From \\ To | AAA | AA | A | BBB | BB | B | CCC | Default |\n|---|---|---|---|---|---|---|---|---|\n| AAA | 91.2 | 7.1 | 0.9 | 0.2 | 0.1 | — | — | — |\n| AA | 0.7 | 90.3 | 7.5 | 1.0 | 0.2 | 0.1 | — | 0.02 |\n| A | 0.1 | 2.4 | 90.1 | 6.4 | 0.7 | 0.2 | 0.05 | 0.06 |\n| BBB | — | 0.3 | 5.5 | 86.5 | 5.5 | 1.4 | 0.3 | 0.18 |\n| BB | — | 0.1 | 0.6 | 7.3 | 80.2 | 8.1 | 1.5 | 1.21 |\n| B | — | — | 0.1 | 0.4 | 6.8 | 76.3 | 8.1 | 5.63 |\n| CCC | — | — | — | 0.3 | 1.4 | 12.4 | 58.6 | 26.7 |\n\n**Key insights from migration matrices:**\n- Diagonal dominance: most issuers remain at the same rating (rating 'stickiness')\n- Upgrades and downgrades are asymmetric: downgrades cluster and accelerate in recessions\n- A BBB issuer has a ~6% annual chance of becoming high-yield ('fallen angel') — market-moving event\n- CCC issuers face a 27% annual default rate — near-junk risk\n\n**Uses in portfolio management:**\n- Mark-to-market CVA (credit value adjustment) modeling\n- Bond fund stress testing under rating migration scenarios\n- Regulatory capital calculations (Basel IRB approach)",
          highlight: ["migration matrix", "transition matrix", "fallen angel", "BBB", "stickiness"],
        },
        {
          type: "quiz-mc",
          question:
            "A bank holds a $50M revolving credit facility to a BB-rated company. PD = 2%, LGD = 55%, current drawn balance = $30M, expected stress drawdown = $10M (EAD = $40M). What is the Expected Loss?",
          options: [
            "$440,000 — PD × LGD × EAD = 0.02 × 0.55 × $40M",
            "$330,000 — PD × LGD × drawn balance only",
            "$550,000 — using 100% LGD on full EAD",
            "$1.1M — using PD × EAD without LGD adjustment",
          ],
          correctIndex: 0,
          explanation:
            "EL = PD × LGD × EAD = 0.02 × 0.55 × $40M = $440,000. EAD = $40M (current draw $30M + expected stress drawdown $10M). LGD = 55% because senior bank facilities recover roughly 45%. Using only the drawn balance of $30M understates risk by ignoring the undrawn portion that will likely be drawn in distress.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Credit rating agencies use 'point-in-time' ratings that rapidly adjust as a company's financial condition changes quarter to quarter.",
          correct: false,
          explanation:
            "False. The major rating agencies (Moody's, S&P, Fitch) use 'through-the-cycle' ratings designed to reflect creditworthiness across a full economic cycle — not just current conditions. This deliberate lag reduces rating volatility but means agency ratings often trail market signals. Market-implied ratings derived from CDS spreads are point-in-time and far more responsive to news.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 2: Financial Distress Signals ─────────────────────────────────────
    {
      id: "credit-risk-2",
      title: "Financial Distress Signals",
      description:
        "Altman Z-score formula and interpretation, interest coverage ratio, Debt/EBITDA leverage analysis, and FCF sufficiency tests",
      icon: "TrendingDown",
      xpReward: 105,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Altman Z-Score",
          content:
            "Developed by Edward Altman in 1968, the **Z-score** is a multi-factor model that predicts corporate bankruptcy using five financial ratios.\n\n**Z-score formula (public manufacturing companies):**\n\nZ = 1.2×X₁ + 1.4×X₂ + 3.3×X₃ + 0.6×X₄ + 1.0×X₅\n\n| Variable | Definition | Weight | What it measures |\n|---|---|---|---|\n| X₁ | Working Capital / Total Assets | 1.2 | Short-term liquidity |\n| X₂ | Retained Earnings / Total Assets | 1.4 | Cumulative profitability / leverage |\n| X₃ | EBIT / Total Assets | 3.3 | Operating efficiency |\n| X₄ | Market Cap / Total Liabilities | 0.6 | Equity buffer |\n| X₅ | Sales / Total Assets | 1.0 | Asset utilization / turnover |\n\n**Interpretation zones:**\n- **Z > 2.99**: Safe zone — low distress probability\n- **1.81 < Z < 2.99**: Grey zone — caution warranted, monitor closely\n- **Z < 1.81**: Distress zone — elevated bankruptcy probability within 2 years\n\n**Example:** A company with X₁=0.10, X₂=0.15, X₃=0.08, X₄=0.50, X₅=0.80:\nZ = 1.2(0.10) + 1.4(0.15) + 3.3(0.08) + 0.6(0.50) + 1.0(0.80)\nZ = 0.12 + 0.21 + 0.264 + 0.30 + 0.80 = **1.69** → Distress zone\n\n**Limitations:** Works best for public manufacturing companies; Altman created separate Z''-score models for private firms and non-manufacturers",
          highlight: ["Altman Z-score", "distress zone", "grey zone", "safe zone", "EBIT", "working capital"],
        },
        {
          type: "teach",
          title: "Leverage and Coverage Ratios",
          content:
            "Beyond the Z-score, credit analysts rely on specific leverage and coverage metrics to assess debt sustainability.\n\n**Debt / EBITDA (Leverage Ratio):**\n- Most widely used leverage metric; denominates total debt in units of operating earnings\n- Thresholds by credit quality:\n  - Investment grade: < 3.0× (BBB) to < 1.5× (A/AA)\n  - High yield: 4–6×\n  - Distressed: > 7×\n- Covenant typical: 'Debt/EBITDA shall not exceed 5.5×' — breach triggers default\n\n**EBITDA / Interest Expense (Interest Coverage Ratio):**\n- Measures how many times operating earnings cover interest payments\n- ICR > 3× = comfortable; ICR 1.5–2× = stressed; ICR < 1.0× = cash interest not covered from operations\n- LTM (Last Twelve Months) vs. forward estimates matter greatly in turnarounds\n\n**Net Debt / EBITDA vs. Gross Debt / EBITDA:**\n- Net Debt = Total Debt − Cash\n- A company with $1B gross debt and $900M cash is virtually unlevered on a net basis\n- Credit analysis often focuses on gross debt (contractual obligations) but net leverage shows true risk\n\n**FCF Sufficiency:**\n- FCF = EBITDA − Taxes − Capex − Change in Working Capital\n- Key question: Can FCF cover all mandatory debt service (principal + interest)?\n- Debt service coverage ratio (DSCR) = FCF / Annual Debt Service\n- DSCR < 1.0 means borrower must draw on reserves or refinance to avoid default\n\n**Red flags:** Negative FCF for 3+ consecutive years, growing revolver draws, payment-in-kind toggles activated",
          highlight: ["Debt/EBITDA", "interest coverage ratio", "DSCR", "FCF", "covenant", "net leverage"],
        },
        {
          type: "quiz-mc",
          question:
            "A company has EBITDA of $80M, interest expense of $40M, cash taxes of $8M, capex of $15M, and working capital increased by $5M. Total debt is $520M. Which statement is most accurate?",
          options: [
            "Interest coverage is 2.0×, leverage is 6.5× — stressed but borderline investment grade metrics",
            "Interest coverage is 2.0×, leverage is 6.5× — deep distress territory by credit standards",
            "Interest coverage is 1.3× because FCF must cover interest, not EBITDA",
            "Leverage is fine at 2.0× because interest/EBITDA = 40/80 = 50%",
          ],
          correctIndex: 1,
          explanation:
            "EBITDA/Interest = $80M/$40M = 2.0× coverage. Debt/EBITDA = $520M/$80M = 6.5× leverage. Both metrics indicate distressed territory. Investment-grade BBB issuers typically carry Debt/EBITDA < 3.0×; 6.5× is solidly high-yield / distressed. FCF = $80M − $8M − $15M − $5M = $52M vs. $40M interest = DSCR of 1.3× (adequate but thin). The leverage ratio is the dominant concern here.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A company with a Debt/EBITDA ratio of 7.5× and interest coverage of 1.2× is almost certainly headed for bankruptcy within 12 months.",
          correct: false,
          explanation:
            "False. High leverage and thin coverage indicate distress, but bankruptcy is not inevitable. Companies can avoid default by refinancing, selling assets, raising equity, obtaining covenant waivers, or improving operating performance. Many distressed companies operate for years at these levels with supportive creditors. The Altman Z-score and other models provide probability estimates, not certainties — a 1.2× ICR is deeply stressed but not a guaranteed default.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Credit Default Swaps ──────────────────────────────────────────
    {
      id: "credit-risk-3",
      title: "Credit Default Swaps",
      description:
        "CDS mechanics (protection buyer/seller), CDS spread vs bond spread, basis trading, and credit events that trigger settlement",
      icon: "ArrowLeftRight",
      xpReward: 115,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "How CDS Work",
          content:
            "A **Credit Default Swap (CDS)** is a bilateral contract in which the protection buyer pays a periodic premium (the CDS spread) to the protection seller in exchange for a payment if a specified credit event occurs on the reference entity.\n\n**Mechanics:**\n- **Reference entity**: The corporate or sovereign whose credit risk is transferred (e.g., Ford Motor Company)\n- **Notional**: The face value of exposure protected (e.g., $10M)\n- **CDS spread**: Annual premium as % of notional (e.g., 200 bps = 2%/year)\n- **Tenor**: Standard maturities are 1, 3, 5, 7, and 10 years; 5-year is most liquid\n- **Premium payment**: Quarterly in arrears (3 months × 200 bps / 4 = 0.5% per quarter)\n\n**Credit Events (ISDA 2014 definitions):**\n1. **Bankruptcy**: Filing for insolvency protection\n2. **Failure to pay**: Missing a scheduled interest or principal payment (with grace period)\n3. **Restructuring**: Reduction of principal, interest, or extension of maturity without consent\n4. **Repudiation/moratorium**: Denial of obligations (primarily sovereign CDS)\n5. **Obligation acceleration**: Debt becomes due early due to covenant breach\n\n**Settlement methods:**\n- **Physical settlement**: Protection buyer delivers defaulted bonds; seller pays par value\n- **Cash settlement**: Auction-determined recovery price used; seller pays (1 − recovery) × notional\n- ISDA CDS auctions (e.g., Lehman Brothers, 2008) are the standard for cash settlement",
          highlight: ["CDS", "protection buyer", "protection seller", "credit event", "CDS spread", "notional", "ISDA"],
        },
        {
          type: "teach",
          title: "CDS Spread vs Bond Spread and Basis Trading",
          content:
            "The CDS spread and the bond's credit spread (over risk-free rate) should theoretically be equal — both price the same credit risk. The **CDS-bond basis** is the difference between the two.\n\n**No-arbitrage relationship:**\n- In theory: CDS spread ≈ Bond Z-spread (spread over swap rate)\n- If CDS spread > Bond spread: CDS is 'expensive' relative to cash bonds\n- If CDS spread < Bond spread: Bonds are expensive relative to CDS\n\n**Basis trading strategies:**\n\n**Negative basis trade** (CDS spread < Bond spread):\n- Buy the bond (earn the bond spread)\n- Buy CDS protection (pay the CDS spread)\n- Net carry = Bond spread − CDS spread (positive if negative basis)\n- Riskless in theory: if the company defaults, bond loss is covered by CDS; if no default, you pocket the spread differential\n\n**Positive basis trade** (CDS spread > Bond spread):\n- Sell CDS protection (receive CDS premium)\n- Short the bond (hedge the credit exposure)\n- Profit from the convergence of basis toward zero\n\n**Why basis diverges:**\n- Funding costs (carrying the bond requires repo financing)\n- Cheapest-to-deliver option in CDS (buyer can deliver any eligible bond after default)\n- Different restructuring definitions between CDS contract and bond indenture\n- Supply/demand imbalances in either market (e.g., forced selling in bonds)\n\n**CDS indices:** CDX (North America) and iTraxx (Europe) allow basket credit risk trading; CDX IG = 125 investment-grade names, CDX HY = 100 high-yield names",
          highlight: ["CDS-bond basis", "negative basis", "Z-spread", "CDX", "iTraxx", "basis trading"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor buys $10M notional of 5-year CDS protection on a BBB-rated company at a spread of 150 bps. Eighteen months later the company defaults; the CDS auction sets recovery at 40%. What does the protection buyer receive (net, ignoring accrued premium)?",
          options: [
            "$6,000,000 — (1 − 0.40) × $10M notional",
            "$1,500,000 — 150 bps × 5 years × $10M",
            "$4,000,000 — the recovery value of the bonds",
            "$225,000 — 150 bps × 1.5 years of premiums paid",
          ],
          correctIndex: 0,
          explanation:
            "On a credit event, the protection seller pays (1 − Recovery Rate) × Notional = (1 − 0.40) × $10M = $6,000,000. The protection buyer has paid premiums of 150 bps × 1.5 years × $10M = $225,000 into the swap, so the net economic gain is $6,000,000 − $225,000 = $5,775,000. The $4,000,000 recovery value goes to whoever holds the defaulted bonds — in cash settlement, it is factored into the auction price and reflected in the 40% recovery rate.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Buying CDS protection on a company whose bonds you already own eliminates all credit risk from your position.",
          correct: false,
          explanation:
            "False. CDS hedges reduce but do not eliminate all credit risk. Residual risks include: (1) counterparty risk — if the CDS seller itself defaults, the protection may be worthless (this materialized with AIG in 2008); (2) basis risk — the CDS may not settle at the expected recovery if cheapest-to-deliver bonds differ from what you hold; (3) restructuring definitions — some restructuring events triggering bond losses may not constitute a credit event under the CDS contract; (4) maturity mismatch if the CDS tenor differs from the bond's remaining life.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: High Yield Market ──────────────────────────────────────────────
    {
      id: "credit-risk-4",
      title: "High Yield Market",
      description:
        "HY bond covenants, fallen angels, rising stars, yield-to-worst vs yield-to-maturity, and recovery rates by capital structure seniority",
      icon: "Percent",
      xpReward: 105,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "High Yield Bond Structure and Covenants",
          content:
            "High-yield (HY) bonds — also called 'junk bonds' — are rated below BBB−/Baa3. They offer higher yields to compensate investors for elevated credit risk, with yields typically 300–600+ bps above Treasuries.\n\n**Typical HY bond features:**\n- Fixed coupon (e.g., 8.5%) paid semi-annually\n- 7–10 year maturity with bullet repayment at maturity\n- Callable after a non-call period (usually 3 years on a 7-year bond) at a call premium that steps down annually\n- Issued under Rule 144A (institutional private placement), often later registered\n\n**Covenants — two types:**\n\n**Incurrence covenants** (event-triggered — most common in HY):\n- Restrict the issuer from *incurring* new debt if leverage would exceed a threshold (e.g., 'no new debt if pro forma Debt/EBITDA > 5.0×')\n- Only triggered when the company takes action — not by passive metric deterioration\n- More flexible for issuers than maintenance covenants\n\n**Maintenance covenants** (tested periodically — common in leveraged loans):\n- Must maintain leverage below a ratio at each quarterly test date (e.g., Debt/EBITDA ≤ 5.5× every quarter)\n- A breach triggers an immediate default event (or cure period)\n- Provides creditors early warning and leverage to renegotiate terms\n\n**Key HY-specific provisions:**\n- **Restricted payments basket**: Limits dividends and share buybacks until earnings threshold met\n- **Asset sale sweeps**: Requires proceeds from asset sales to repay debt\n- **Change of control put**: Bond holders can put bonds back at 101% on a control change\n- **EBITDA addbacks**: Issuers negotiate broad 'Adjusted EBITDA' definitions that inflate covenant cushion",
          highlight: ["high yield", "junk bond", "incurrence covenant", "maintenance covenant", "change of control", "addbacks"],
        },
        {
          type: "teach",
          title: "Fallen Angels, Rising Stars, and Yield Metrics",
          content:
            "The boundary between investment grade and high yield creates significant market dynamics as issuers cross the BBB−/BB+ threshold.\n\n**Fallen Angels:**\n- Investment-grade issuers downgraded below BBB− into high-yield territory\n- Forced selling occurs because many IG-only funds (insurance companies, pension funds) are prohibited from holding HY securities\n- This technical selling pressure creates price dislocations — fallen angels often trade at discounts that recover over 12–18 months\n- Notable fallen angels: Ford (2020, $36B bonds), Kraft Heinz (2020), Boeing (downgraded to BBB−, nearly fell)\n\n**Rising Stars:**\n- HY issuers upgraded to investment grade\n- Demand spike from IG mandates forces bond prices up; yield compresses rapidly\n- Investors who buy near the upgrade catalyst earn spread tightening returns\n\n**Yield Metrics:**\n\n**Yield-to-Maturity (YTM):**\n- The IRR of holding a bond to its stated maturity, assuming all coupons reinvested at YTM\n- For callable bonds, YTM can be misleading if the bond is called early at a premium\n\n**Yield-to-Worst (YTW):**\n- The lowest possible yield assuming the issuer calls the bond at the *earliest possible* date that benefits them\n- Industry standard for HY analysis: 'What is the worst yield I can earn if the issuer acts optimally against me?'\n- YTW = min(YTM, YTC1, YTC2, ...) where YTC = yield-to-call at each call date\n\n**Recovery rates by seniority (historical averages):**\n- Senior secured bank loans: ~65%\n- Senior secured bonds: ~50%\n- Senior unsecured bonds: ~40%\n- Senior subordinated bonds: ~25%\n- Junior subordinated / PIK: ~15%\n- Equity: ~0%",
          highlight: ["fallen angel", "rising star", "yield-to-worst", "YTW", "yield-to-maturity", "recovery rate", "seniority"],
        },
        {
          type: "quiz-mc",
          question:
            "A 7-year HY bond has a coupon of 9%, trading at 95 cents on the dollar. It has a call option exercisable at year 3 at 104.5 and at year 5 at 102. Which yield metric should a credit investor use as the primary valuation benchmark?",
          options: [
            "Yield-to-Worst (YTW) — the lowest yield assuming optimal early call by the issuer",
            "Yield-to-Maturity (YTM) — always the most accurate measure of total return",
            "Current yield — annual coupon / current price, 9% / 95 = 9.47%",
            "Yield-to-Call at year 3 — issuers always call as early as possible",
          ],
          correctIndex: 0,
          explanation:
            "YTW is the industry standard for callable high-yield bonds. It calculates the yield assuming the issuer calls the bond at the earliest date that minimizes the investor's return (i.e., whenever the issuer benefits from refinancing at lower rates). The issuer will not necessarily call at year 3 — they call only if rates have declined enough. YTW protects investors by assuming worst-case from their perspective. Current yield ignores capital appreciation from the $95 price to par or call price.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "When a large investment-grade company is downgraded to high yield (becomes a 'fallen angel'), its bonds typically immediately rise in price because HY investors see attractive yields.",
          correct: false,
          explanation:
            "False. Fallen angel downgrades typically cause immediate price drops, not increases. Investment-grade mandated funds (insurance companies, pension funds) are forced sellers — they cannot hold sub-BBB bonds by charter. This forced selling can exceed natural HY buyer demand in the short term, pushing prices down. Over the subsequent 12–18 months, HY dedicated funds and distressed investors absorb the supply and prices often recover, but the initial reaction is almost always price negative.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Distressed Debt Investing ─────────────────────────────────────
    {
      id: "credit-risk-5",
      title: "Distressed Debt Investing",
      description:
        "Fulcrum security analysis, capital structure waterfall, loan-to-own strategy, and the distressed debt cycle",
      icon: "Layers",
      xpReward: 120,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Capital Structure Waterfall and Fulcrum Security",
          content:
            "Distressed debt investors analyze where value breaks in the capital structure — identifying the **fulcrum security** that will receive equity in a restructuring.\n\n**Capital structure waterfall — order of priority in bankruptcy:**\n1. **DIP (Debtor-in-Possession) financing**: New money lent to the company during bankruptcy — super-priority status, paid first\n2. **Secured claims (first lien)**: Senior secured bank loans, secured bonds — paid in full up to collateral value\n3. **Secured claims (second lien)**: Paid from residual collateral value after first lien is made whole\n4. **Senior unsecured bonds**: Paid from unencumbered asset value\n5. **Subordinated / junior bonds**: Residual after senior unsecured\n6. **Trade creditors / general unsecured**: Shared pro-rata with senior unsecured in many cases\n7. **Equity holders**: Receive nothing unless all creditors are paid in full (rarely happens in distress)\n\n**The Fulcrum Security:**\n- The debt tranche where enterprise value 'runs out' — creditors at this level are partly in-the-money\n- The fulcrum class typically converts to equity in a restructuring plan\n- Example: Company EV = $400M, First lien = $300M, Senior unsecured = $200M\n  - First lien is fully covered ($300M < $400M) → out-of-the-money on equity conversion\n  - Senior unsecured has $100M of value remaining → fulcrum (receives 50 cents on dollar in cash or equity)\n  - Subordinated bonds get nothing\n\n**Why the fulcrum is attractive:**\n- Purchased at a discount (e.g., 40 cents on the dollar)\n- Converts to equity at a much lower basis than pre-bankruptcy equity\n- If company value recovers post-restructuring, fulcrum holders earn outsized returns",
          highlight: ["fulcrum security", "capital waterfall", "DIP financing", "first lien", "subordinated", "distressed"],
        },
        {
          type: "teach",
          title: "Loan-to-Own and the Distressed Cycle",
          content:
            "Distressed debt investing is not passive — sophisticated investors actively acquire claims to gain control of the reorganized company.\n\n**Loan-to-Own Strategy:**\n- Buy fulcrum or senior secured debt at distressed prices\n- Drive or support the restructuring to convert debt to equity\n- Emerge as the controlling equity holder of the reorganized company\n- Profit from the difference between distressed purchase price and post-restructuring equity value\n- Example: Buy $100M senior secured bonds at 60 cents = $60M invested; convert at par to equity worth $100M+ if company recovers\n\n**Key loan-to-own tactics:**\n- Build a blocking position (>33% of a class to block unwanted reorganization plans)\n- Form creditor committees to influence plan of reorganization\n- Propose alternative plans that maximize creditor (now equity) value\n- Negotiate governance rights: board seats, management incentive plans, new capital raises\n\n**The Distressed Debt Cycle:**\n1. **Early distress**: Credit deterioration begins; rating agencies downgrade; CDS widens first\n2. **Stress**: Covenants breached; company hires restructuring advisors; creditor committees form\n3. **Distressed exchange**: Out-of-court exchange offer — company offers new bonds (lower principal, extended maturity) for old bonds; avoids formal bankruptcy\n4. **Bankruptcy (Chapter 11)**: If exchange fails; automatic stay on all debt service; company operates as debtor-in-possession\n5. **Plan of reorganization**: Negotiated or contested; fulcrum class votes; approved by court\n6. **Emergence**: New equity distributed; old equity extinguished; reorganized company begins new capital structure\n7. **Recovery / exit**: New equity holders (former distressed creditors) seek exit via IPO, M&A, or dividend recapitalization\n\n**Return drivers:** Purchase discount + operational value creation + multiple expansion post-emergence",
          highlight: ["loan-to-own", "blocking position", "distressed exchange", "Chapter 11", "plan of reorganization", "DIP"],
        },
        {
          type: "quiz-mc",
          question:
            "A distressed company has an estimated enterprise value of $600M. Its capital structure is: First lien debt $350M, Second lien debt $300M, Senior unsecured bonds $200M, Equity $0. A distressed investor is considering buying second lien debt at 45 cents on the dollar. Which statement best describes the risk/reward?",
          options: [
            "Second lien is the fulcrum: first lien is covered ($350M < $600M), second lien has $250M of $300M covered (83 cents recovery vs 45 cents paid) — attractive upside",
            "Second lien is fully covered because EV of $600M exceeds the first two tranches of $650M combined",
            "The senior unsecured bonds are the fulcrum because they are the most junior debt receiving any recovery",
            "First lien holders are the fulcrum and will convert to equity, leaving second lien holders with nothing",
          ],
          correctIndex: 0,
          explanation:
            "Waterfall: First lien ($350M) is fully covered by $600M EV — they receive 100 cents. Remaining value for second lien = $600M − $350M = $250M. Second lien is owed $300M but only $250M of value remains → recovery ≈ 83 cents. Buying at 45 cents implies ~84% upside to estimated recovery. This makes second lien the approximate fulcrum (partially in-the-money). Senior unsecured receives nothing ($250M fills second lien). Option B incorrectly adds $350M + $300M = $650M > $600M, showing second lien is impaired.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "In a distressed debt restructuring, a creditor holding more than 33% of a single class of debt can prevent an unwanted plan of reorganization from being imposed on that class.",
          correct: true,
          explanation:
            "True. Under Chapter 11, a plan of reorganization must be approved by at least two-thirds in amount and one-half in number of each impaired class that votes. A holder of more than 33.3% (one-third) of a class's claims can block the two-thirds threshold, preventing 'cramdown' of that class. This 'blocking position' is a crucial tool for distressed investors who accumulate sufficient claims to influence or veto restructuring plans, giving them significant negotiating leverage over terms.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Corporate Restructuring ───────────────────────────────────────
    {
      id: "credit-risk-6",
      title: "Corporate Restructuring",
      description:
        "Chapter 11 process, plan of reorganization, pre-packaged bankruptcy, creditor classes and absolute priority rule",
      icon: "Scale",
      xpReward: 125,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Chapter 11 Bankruptcy Process",
          content:
            "Chapter 11 of the U.S. Bankruptcy Code allows a company to reorganize while continuing operations under court protection, rather than liquidating under Chapter 7.\n\n**Automatic Stay:**\n- Upon filing, an automatic stay immediately halts all creditor collection actions, lawsuits, and debt service payments\n- Provides breathing room for the debtor to negotiate without piecemeal dismemberment\n- Applies to secured and unsecured creditors alike (with limited exceptions)\n\n**Key milestones and timeline (typical 12–18 month Chapter 11):**\n1. **Day 1 motions**: Emergency relief — wages, critical vendors, DIP financing approval, cash management\n2. **First 45 days**: DIP financing negotiated/approved; management retains or is replaced; restructuring advisors engaged\n3. **Exclusivity period**: Debtor has exclusive right to file a plan for 120 days (extendable to 18 months); creditors cannot propose competing plans initially\n4. **Disclosure statement**: Filed alongside the plan; must provide 'adequate information' for creditors to vote — similar to a prospectus\n5. **Voting**: Each impaired class votes; acceptance requires 2/3 in amount and 1/2 in number\n6. **Confirmation hearing**: Court reviews plan for feasibility and compliance with code\n7. **Effective date**: Plan becomes effective; new equity distributed, old equity cancelled\n\n**Debtor-in-Possession (DIP) financing:**\n- New loans extended during bankruptcy, secured by super-priority liens\n- Essential for companies that need liquidity during Chapter 11\n- Lenders charge DIP spreads of 4–8% (higher risk, shorter tenor)\n- Often provided by pre-petition secured lenders to maintain control",
          highlight: ["Chapter 11", "automatic stay", "DIP financing", "exclusivity period", "plan of reorganization", "confirmation"],
        },
        {
          type: "teach",
          title: "Creditor Classes, Absolute Priority Rule, and Pre-Packs",
          content:
            "The **Absolute Priority Rule (APR)** governs how value is distributed in bankruptcy: senior claims must be paid in full before junior claims receive anything.\n\n**Creditor class structure:**\n- Claims are grouped into classes with similar legal nature and priority\n- Each class votes separately; a class is 'impaired' if its legal rights are altered by the plan\n- Unimpaired classes (paid in full) are deemed to accept; wiped-out classes are deemed to reject\n\n**APR and cramdown:**\n- APR: Each senior class must receive full recovery before junior classes receive anything\n- **Cramdown**: Court can confirm a plan over a dissenting class if the plan is 'fair and equitable' (APR respected) and not 'unfairly discriminatory'\n- In practice, APR is sometimes violated through negotiated 'gifting' — senior creditors voluntarily share recoveries with equity to obtain cooperation\n\n**Pre-packaged bankruptcy ('pre-pack'):**\n- Debtor negotiates the entire reorganization plan with major creditors *before* filing\n- Votes are solicited pre-filing; plan is pre-agreed before the court process begins\n- Chapter 11 lasts only 30–90 days (vs. 12–18 months for a contested case)\n- Maintains business relationships, reduces professional fees ($50–200M savings vs. traditional Chapter 11)\n- Requires support of major creditor classes before filing — works when creditor base is concentrated\n\n**Prepackaged vs. Pre-arranged:**\n- **Pre-packed**: Full plan voted on before filing\n- **Pre-arranged**: Plan terms agreed but formal vote occurs during Chapter 11\n- Both are faster than 'free fall' Chapter 11 with no prior agreement\n\n**Recovery scenarios:**\n- **Going concern reorganization**: Business continues with new capital structure → higher recoveries\n- **Liquidation (363 sale)**: Assets sold in court-supervised auction → recoveries depend on asset quality",
          highlight: ["Absolute Priority Rule", "cramdown", "pre-packaged bankruptcy", "impaired", "gifting", "363 sale", "going concern"],
        },
        {
          type: "quiz-mc",
          question:
            "In a Chapter 11 reorganization with EV of $500M, the capital structure is: $200M first lien (proposed recovery: 100%), $400M senior unsecured (proposed recovery: 75%), $150M junior bonds (proposed recovery: 0%), existing equity (proposed recovery: 0%). A dissident junior bondholder claims the plan violates the Absolute Priority Rule. Is the claim valid?",
          options: [
            "No — the plan is APR-compliant: first lien paid in full, senior unsecured impaired but paid before junior, junior and equity receive nothing",
            "Yes — senior unsecured should receive 100% before any junior class receives anything",
            "Yes — because the total claims ($750M) exceed EV ($500M), all creditors must be paid pro-rata",
            "No — APR only applies if the plan is contested; if it is pre-packaged, APR can be waived",
          ],
          correctIndex: 0,
          explanation:
            "The plan respects APR. First lien ($200M) is paid in full from $500M EV. Remaining $300M covers 75% of senior unsecured ($400M × 75% = $300M). Junior bonds and equity receive nothing because the EV is exhausted at the senior unsecured level. APR requires senior classes be fully satisfied before junior classes receive anything — here junior bonds receive less than senior unsecured (zero vs. 75 cents), which is correct. APR would be violated if junior bonds or equity received value while senior unsecured was impaired below 100 cents.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A pre-packaged Chapter 11 bankruptcy typically takes longer than a traditional Chapter 11 because the debtor must negotiate with all creditor classes both before and after filing.",
          correct: false,
          explanation:
            "False. A pre-packaged bankruptcy is far faster — typically 30–90 days in court versus 12–18 months for a traditional (free-fall) Chapter 11. In a pre-pack, the debtor negotiates the plan and solicits votes from creditors before filing. When the company enters court, the plan is already agreed upon and voted on, so the court simply confirms the pre-negotiated deal. This dramatically reduces professional fees, minimizes business disruption, and preserves customer and supplier relationships. The trade-off is that pre-packs require sufficient creditor concentration to achieve agreement pre-filing.",
          difficulty: 1,
        },
      ],
    },
  ],
};
