import type { Unit } from "./types";

export const UNIT_FIXED_INCOME_ADVANCED: Unit = {
  id: "fixed-income-advanced",
  title: "Advanced Fixed Income",
  description:
    "Master duration, convexity, MBS, credit derivatives, and fixed income portfolio management",
  icon: "🏦",
  color: "from-blue-500 to-indigo-600",
  lessons: [
    // ─── Lesson 1: Duration & Convexity Mastery ───────────────────────────────
    {
      id: "fia-1",
      title: "📐 Duration & Convexity Mastery",
      description:
        "Modified duration, dollar duration (DV01), convexity, and the second-order price approximation",
      icon: "Ruler",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Macaulay & Modified Duration",
          content:
            "**Duration** measures a bond's price sensitivity to interest rate changes. Two versions matter most in practice.\n\n**Macaulay Duration (D_mac):**\nThe weighted-average time to receive a bond's cash flows, where weights are the present value of each cash flow as a fraction of total bond price.\n- A 5-year zero-coupon bond has D_mac = 5 years exactly.\n- A 5-year coupon bond has D_mac < 5 years — earlier coupons pull the weighted average forward.\n- Coupon bonds always have Macaulay duration less than their maturity.\n\n**Modified Duration (D_mod):**\nConverts Macaulay duration into a direct price-sensitivity measure:\n\n`D_mod = D_mac / (1 + y/m)`\n\nwhere **y** = yield to maturity and **m** = compounding periods per year (1 for annual, 2 for semi-annual).\n\n**Interpretation:** A modified duration of 7.5 means a **1% (100bps) increase in yield reduces bond price by approximately 7.5%**.\n\n**Example:**\n- 10-year Treasury, semi-annual coupons, yield = 4%, D_mac = 8.1\n- D_mod = 8.1 / (1 + 0.04/2) = 8.1 / 1.02 = **7.94**\n- If yield rises 50bps: ΔP/P ≈ −7.94 × 0.005 = −3.97%\n\n**Key drivers of duration:**\n- Longer maturity → higher duration\n- Lower coupon → higher duration (more weight on distant par payment)\n- Lower yield → higher duration (distant cash flows are discounted less heavily)",
          highlight: ["Macaulay Duration", "Modified Duration", "D_mod", "D_mac", "price sensitivity", "yield"],
        },
        {
          type: "teach",
          title: "Dollar Duration (DV01) & Duration Hedging",
          content:
            "**Dollar Duration** (also called DV01 or PVBP) translates percentage duration into dollar terms — essential for position sizing and hedging.\n\n**DV01 Formula:**\n`DV01 = Price × D_mod × 0.0001`\n\nDV01 = dollar change in bond value for a **1 basis point (0.01%) move in yield**.\n\n**Example:**\n- Bond: $1,000,000 face, price = 98 → market value = $980,000\n- Modified duration = 7.5\n- DV01 = $980,000 × 7.5 × 0.0001 = **$735**\n- Every 1bp yield change = $735 gain or loss in portfolio value.\n\n**Practical uses:**\n- **Position sizing**: if max loss tolerance is $50,000 on a 100bp move, max DV01 = $500.\n- **Hedging**: to hedge a bond portfolio with DV01 = $50,000, short Treasury futures with matching DV01.\n- **Relative value**: compare DV01-weighted returns to equalize duration exposure across bonds.\n\n**Duration Hedging via Futures:**\n`Number of contracts = (Target DV01 − Current DV01) / DV01 per futures contract`\n\nExample: Portfolio DV01 = $200,000, Treasury futures DV01 = $80 per contract. To reduce DV01 to $100,000: short (200,000 − 100,000) / 80 = **1,250 contracts**.",
          highlight: ["DV01", "dollar duration", "PVBP", "hedging", "basis point", "futures", "position sizing"],
        },
        {
          type: "teach",
          title: "Convexity: The Second-Order Effect",
          content:
            "Duration is a linear approximation. **Convexity** captures the curvature in the price-yield relationship — the second-order correction.\n\n**Price Approximation (including convexity):**\n`ΔP/P ≈ −D_mod × Δy + 0.5 × Convexity × (Δy)²`\n\nConvexity is always **positive** for plain vanilla (option-free) bonds. Positive convexity benefits the holder:\n- When yields fall, price rises **more** than duration alone predicts.\n- When yields rise, price falls **less** than duration alone predicts.\n- The bond outperforms its duration estimate in both directions — this is the convexity advantage.\n\n**Example — 10-year bond, D_mod = 7.5, Convexity = 80:**\nFor a 100bp (1%) yield increase:\n- Duration contribution: −7.5 × 0.01 = −7.50%\n- Convexity contribution: +0.5 × 80 × (0.01)² = +0.40%\n- **Net price change: −7.10%** (better than −7.50% from duration alone)\n\n**Convexity increases with:**\n- Longer maturity (more curvature over time)\n- Lower coupon (zero-coupon bonds have the highest convexity per unit of duration)\n- Lower yield level\n\n**Negative convexity** occurs in callable bonds and MBS:\n- When yields fall, the issuer calls the bond (or prepayments accelerate in MBS).\n- The bondholder's upside is capped → price-yield curve bends inward.\n- Negative convexity means the bond underperforms its duration estimate on the downside of rates.",
          highlight: ["convexity", "positive convexity", "negative convexity", "price approximation", "curvature", "callable bond", "duration"],
        },
        {
          type: "quiz-mc",
          question:
            "A bond has modified duration of 6.0 and convexity of 60. If yields rise by 150bps (1.5%), what is the approximate price change?",
          options: [
            "−9.00% duration effect + 0.68% convexity effect = −8.32%",
            "−9.00% with no convexity adjustment since convexity only helps when yields fall",
            "−6.00% because duration is always the exact price change for any yield move",
            "+0.68% because positive convexity always generates positive returns",
          ],
          correctIndex: 0,
          explanation:
            "Duration contribution: −6.0 × 0.015 = −9.00%. Convexity contribution: +0.5 × 60 × (0.015)² = +0.5 × 60 × 0.000225 = +0.68%. Net: −9.00% + 0.68% = −8.32%. Positive convexity benefits holders in both yield directions — it reduces losses when yields rise and amplifies gains when yields fall. The convexity effect becomes larger for larger yield moves (it grows with (Δy)²).",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A 30-year mortgage (MBS) typically has negative convexity, while a 30-year Treasury has positive convexity, even though both have similar maturities.",
          correct: true,
          explanation:
            "True. The 30-year Treasury is an option-free bond — it exhibits standard positive convexity. A 30-year mortgage is prepayable, meaning homeowners can refinance when rates fall. When rates decline, prepayments accelerate and the MBS 'shortens' in duration, capping price appreciation. This creates negative convexity: the MBS underperforms its duration estimate when rates fall, unlike the Treasury which benefits from positive curvature in both directions.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A portfolio manager holds $10M face value of a 10-year corporate bond (price = 105, D_mod = 7.8, convexity = 75). The Fed signals a potential 50bp rate hike. The manager wants to quantify the total expected price impact.",
          question:
            "Using the full price approximation, what is the expected change in portfolio market value?",
          options: [
            "Duration effect: −$409,500; Convexity adjustment: +$9,844; Net loss: ~$399,656",
            "Duration effect: −$780,000; Convexity has no impact on corporate bonds",
            "Duration effect: −$390,000; Convexity doubles the loss to −$780,000",
            "No calculation needed — DV01 is sufficient for all yield move sizes",
          ],
          correctIndex: 0,
          explanation:
            "Market value = $10M × 1.05 = $10,500,000. Duration effect: −7.8 × 0.005 × $10,500,000 = −$409,500. Convexity effect: +0.5 × 75 × (0.005)² × $10,500,000 = +0.5 × 75 × 0.000025 × $10,500,000 = +$9,844. Net expected loss: ~$399,656. Positive convexity reduces the loss by ~$9,844 — a meaningful benefit that grows larger for bigger rate moves.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Mortgage-Backed Securities & Prepayment ───────────────────
    {
      id: "fia-2",
      title: "🏠 MBS & Prepayment Risk",
      description:
        "Pass-throughs, CMO tranches, PSA prepayment model, OAS, negative convexity, and IO/PO strips",
      icon: "Home",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "MBS Structure: Pass-Throughs and CMOs",
          content:
            "**Mortgage-Backed Securities (MBS)** pool thousands of individual mortgage loans and sell claims on the cash flows to investors.\n\n**Agency Pass-Through Securities:**\n- Issued by Fannie Mae (FNMA), Freddie Mac (FHLMC), or Ginnie Mae (GNMA).\n- All principal and interest payments from the pool \"pass through\" to investors, minus a servicing fee (~25bps).\n- Investors receive their pro-rata share of prepayments when homeowners sell, refinance, or prepay.\n- Credit risk is backstopped by agency guarantees — the dominant risk is **prepayment risk**.\n\n**Collateralized Mortgage Obligations (CMOs):**\nCMOs repackage pass-through cash flows into **tranches** with different prepayment and maturity profiles:\n\n**Sequential Pay (plain CMO):**\n- Tranche A receives all principal first until paid off; then Tranche B; then C.\n- A tranche is short average life; Z tranche (accrual) is long average life.\n\n**PAC (Planned Amortization Class):**\n- PAC tranches have stable, predictable cash flows within a prepayment band (e.g., 100–300% PSA).\n- Companion/support tranches absorb prepayment variability above or below the band.\n- PACs are prized by liability-sensitive investors (insurance companies, pensions).\n\n**TAC (Targeted Amortization Class):**\n- Protects against prepayment extension only (unlike PAC which protects both ways).\n- Less expensive than PACs; single-sided protection.\n\n**IO and PO Strips:**\n- **IO (Interest Only)**: Receives only the interest portion. If prepayments accelerate, the outstanding balance shrinks faster → IO value falls sharply.\n- **PO (Principal Only)**: Receives only principal. Discounted to par at purchase; benefits from faster prepayments (principal returned sooner).",
          highlight: ["pass-through", "CMO", "PAC", "TAC", "companion tranche", "sequential pay", "IO strip", "PO strip", "prepayment risk"],
        },
        {
          type: "teach",
          title: "PSA Prepayment Model & WAL",
          content:
            "**The PSA (Public Securities Association) Prepayment Model** is the industry benchmark for expressing and comparing mortgage prepayment speeds.\n\n**PSA Convention:**\n- At **100% PSA**: CPR (Conditional Prepayment Rate) ramps from 0.2%/month in month 1, increasing by 0.2%/month until month 30, then holds at 6% CPR annually (0.5%/month).\n- **150% PSA**: All speeds at 1.5× the 100% PSA schedule.\n- **50% PSA**: Prepayments are slower — only 0.5× the standard speeds.\n- **300% PSA**: Very fast prepayments — common in a sharp refinancing wave.\n\n**What drives prepayments?**\n- **Refinancing incentive**: When current rates fall significantly below the mortgage coupon rate, homeowners refinance — the S-curve shape of refinancing vs. rate incentive.\n- **Housing turnover**: Home sales generate prepayments (portability provisions typically require loan payoff).\n- **Defaults/liquidations**: Delinquent loans that go to foreclosure and sale.\n- **Burnout**: After a sustained refi wave, remaining borrowers are \"burned out\" — they didn't refi and are less likely to do so even if rates stay low.\n\n**Weighted Average Life (WAL):**\nWAL measures when principal is expected to be returned on average:\n`WAL = Σ(t × Principal Payment_t) / Total Principal`\n\n- At 100% PSA, a 30-year FNMA pass-through has WAL ≈ 7–10 years.\n- At 300% PSA (fast refi), WAL may shorten to 3–5 years.\n- WAL is more useful than stated maturity for comparing MBS with different prepayment profiles.",
          highlight: ["PSA model", "100% PSA", "CPR", "WAL", "weighted average life", "refinancing", "burnout", "prepayment speed"],
        },
        {
          type: "teach",
          title: "OAS, Negative Convexity, and IO/PO Dynamics",
          content:
            "**Option-Adjusted Spread (OAS) in MBS:**\nMBS contain an embedded prepayment option held by homeowners. Standard yield/spread measures do not account for this.\n\n`OAS = Z-spread − option cost`\n\n- The option cost represents the value the homeowner's prepayment option takes from the investor.\n- OAS allows apples-to-apples comparison between callable bonds, MBS, and non-callable bonds.\n- **Higher option cost = lower OAS** for the same nominal yield.\n\n**OAS analysis requires Monte Carlo simulation** over hundreds of interest rate paths to model prepayments under each scenario, then find the single spread that prices the security correctly.\n\n**Negative Convexity in MBS:**\nWhen interest rates fall:\n1. Homeowners rush to refinance → prepayments accelerate.\n2. The MBS shortens in duration unexpectedly — the investor receives principal back when rates are lowest (worst time for reinvestment).\n3. Price appreciation is capped relative to a comparable Treasury → the MBS exhibits negative convexity.\n\nThis is why MBS typically trade at wider OAS than corporate bonds of comparable credit quality — the negative convexity requires additional compensation.\n\n**IO/PO Strip Dynamics:**\n- **IO strip**: Receives only interest cash flows. Principal balance drives interest payments; faster prepayments destroy the IO's income stream. IO gains value when rates rise (slower prepays preserve the cash flow). IO has **negative duration** — it appreciates when rates rise.\n- **PO strip**: Receives only principal, purchased at a discount. Faster prepayments = quicker return of a discounted security to par → PO benefits from falling rates. PO has very high positive duration.\n- Together, IO + PO = the full pass-through. Separately, they are powerful hedging instruments.",
          highlight: ["OAS", "option-adjusted spread", "negative convexity", "IO strip", "PO strip", "negative duration", "Monte Carlo", "prepayment option"],
        },
        {
          type: "quiz-mc",
          question:
            "A portfolio manager owns $5M of a FNMA pass-through MBS. Interest rates drop sharply by 200bps. What is the most likely outcome?",
          options: [
            "Prepayments accelerate, WAL shortens, duration contracts unexpectedly, and price appreciation is less than a comparable Treasury (negative convexity)",
            "Prepayments slow down as homeowners lock in their existing low-rate mortgages, extending duration",
            "The MBS behaves identically to a Treasury because Fannie Mae guarantees all cash flows",
            "The IO strip component gains value because lower rates generate larger interest payments",
          ],
          correctIndex: 0,
          explanation:
            "When rates drop sharply, homeowners have strong incentive to refinance their mortgages at the new lower rates, accelerating prepayments. This shortens the MBS's WAL and duration precisely when the investor would prefer longer duration (to benefit from the rate decline). The price appreciation is capped relative to a duration-equivalent Treasury — this is the negative convexity penalty. IO strips lose value in this scenario (not gain) because faster prepayments reduce the outstanding balance and therefore the interest cash flows.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An insurance company's ALM desk is building a fixed income portfolio. They need stable, predictable cash flows for liability matching and are concerned about reinvestment risk from volatile prepayments. They are evaluating: (A) a 30-year FNMA pass-through at 100% PSA, (B) a PAC CMO tranche with 100–250% PSA band, (C) an IO strip from an agency pool, (D) a 10-year Treasury.",
          question:
            "Which security best meets the insurance company's need for predictable cash flows with minimal prepayment variability?",
          options: [
            "PAC CMO tranche — designed to provide stable cash flows within its prepayment band, absorbing variability into companion tranches",
            "IO strip — negative duration makes it the best hedge against unexpected rate changes",
            "30-year pass-through — agency guarantee eliminates all investment risk",
            "10-year Treasury — zero prepayment risk but mismatches long-duration insurance liabilities",
          ],
          correctIndex: 0,
          explanation:
            "PAC (Planned Amortization Class) tranches are specifically designed for investors requiring cash flow stability. Within the 100–250% PSA band, the PAC tranche receives its scheduled principal regardless of actual prepayment speeds — the companion tranches absorb the variability. This predictability is ideal for liability matching. The plain pass-through exposes the investor to the full range of prepayment volatility. The IO strip has unusual (negative duration) behavior. The Treasury, while predictable, may not match liability duration profiles.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Credit Derivatives & CDS ──────────────────────────────────
    {
      id: "fia-3",
      title: "⚡ Credit Derivatives & CDS",
      description:
        "CDS mechanics, basis trading, CDX indexes, total return swaps, and CLO structures",
      icon: "Zap",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Credit Default Swap (CDS) Mechanics",
          content:
            "A **Credit Default Swap (CDS)** is an insurance-like derivative contract on the credit risk of a reference entity (company, sovereign, or structured product).\n\n**CDS Structure:**\n- **Protection Buyer**: Pays a periodic premium (the \"spread\" in basis points per annum) to the seller.\n- **Protection Seller**: Receives the spread; pays a large lump sum upon a credit event.\n- **Reference Entity**: The company or sovereign whose default triggers settlement.\n- **Notional**: The face value of debt being \"insured\" — typically $10M standard contracts.\n- **Tenor**: Most liquid CDS trade at 5-year maturity.\n\n**Credit Events (ISDA definition):**\n- Bankruptcy\n- Failure to pay (missed coupon or principal)\n- Restructuring (in some contracts — CDS can be \"restructuring-included\" or \"ex-restructuring\")\n- Obligation acceleration\n\n**Settlement:**\n- **Physical settlement**: Buyer delivers defaulted bonds; seller pays par value.\n- **Cash settlement**: Seller pays par minus post-default market price (recovery rate).\n- Example: Bond trades at 35 cents post-default → CDS pays 65 cents per dollar of notional.\n\n**CDS spread vs. bond spread:**\n`Basis = CDS spread − (bond yield spread over risk-free rate)`\n\n- **Positive basis**: CDS spread > bond spread → CDS is \"expensive\" vs. cash bonds.\n- **Negative basis**: CDS spread < bond spread → cash bonds appear cheap; negative basis trades buy the bond and buy CDS protection, locking in a risk-free spread.\n- Basis can diverge due to funding costs, repo, liquidity differences, and structural factors.",
          highlight: ["CDS", "credit default swap", "protection buyer", "protection seller", "credit event", "basis", "CDS spread", "recovery rate", "settlement"],
        },
        {
          type: "teach",
          title: "CDX Indexes, Total Return Swaps & CLOs",
          content:
            "**CDX Credit Indexes:**\nCDX indexes allow trading credit risk on a basket of reference entities, providing liquid market access to broad credit exposure.\n\n- **CDX.NA.IG**: 125 North American investment-grade names. Most liquid IG credit derivative.\n- **CDX.NA.HY**: 100 North American high-yield names. Trades on price (not spread) convention.\n- **CDX.EM**: Emerging market sovereigns and corporates.\n- New series launched every 6 months (Series 40, 41...) with updated constituents.\n- CDX allows single-trade expression of macro credit views without trading 100+ individual bonds.\n\n**Total Return Swap (TRS):**\n- **TRS receiver**: Receives all economic returns of a bond (coupons + price appreciation) without owning it.\n- **TRS payer**: Pays the bond's total return; receives a floating rate (SOFR + spread).\n- Used by hedge funds for leveraged long credit exposure with minimal capital outlay.\n- Also used for short selling bonds (TRS payer) that are difficult to borrow in the repo market.\n\n**CLO (Collateralized Loan Obligation) Structure:**\nCLOs pool leveraged loans (typically 100–250 loans) and issue tranches with different risk/return profiles:\n\n- **Senior AAA tranche** (~65% of capital): lowest risk, lowest spread, first payment priority.\n- **AA, A, BBB, BB tranches**: progressively higher risk and spread.\n- **Equity/first-loss tranche** (~10%): absorbs first losses; receives residual cash flows; potentially high returns in benign credit environments.\n\n**CLO Structural Tests:**\n- **OC (Overcollateralization) test**: Asset pool value / tranche par value must exceed threshold; failing triggers diversion of cash flows to pay down senior notes.\n- **IC (Interest Coverage) test**: Interest income / interest owed to rated tranches must exceed threshold.\n- These tests protect senior tranche holders if the loan pool deteriorates.",
          highlight: ["CDX", "CDX.NA.IG", "CDX.NA.HY", "total return swap", "TRS", "CLO", "AAA tranche", "equity tranche", "OC test", "IC test"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor fears a specific high-yield company will default but cannot short the bonds in the cash market. What is the most direct way to express this bearish credit view?",
          options: [
            "Buy CDS protection — pay the spread and receive par minus recovery upon default",
            "Sell CDS protection — receive the spread income as compensation for taking default risk",
            "Buy CDX.NA.IG protection — the index covers the HY company through its IG subsidiary",
            "Enter a total return swap as the TRS receiver to gain long credit exposure",
          ],
          correctIndex: 0,
          explanation:
            "Buying CDS protection is a synthetic short on the reference entity's credit. The protection buyer pays the CDS spread and profits if the company defaults (receiving par minus recovery). This is analogous to buying insurance on the debt. Selling protection would be a bullish credit bet (receiving spread, losing on default). The TRS receiver gains long exposure — the opposite of a bearish view.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In a CLO, the equity tranche (first-loss piece) has the highest expected return but also absorbs the first credit losses from the underlying loan pool before any other tranche is impaired.",
          correct: true,
          explanation:
            "True. The CLO equity tranche sits at the bottom of the capital structure and absorbs losses before any rated tranche is affected — this is the first-loss position. In return for bearing this concentrated risk, equity holders receive the residual cash flows after all senior obligations are paid, which can be very high in a benign credit environment. CLO equity managers often target 15–20%+ IRRs when structures perform well, compensating for the risk of being wiped out if loan defaults exceed expected levels.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A credit hedge fund manager observes that a large retailer's 5-year CDS spread is 350bps, while its 5-year senior unsecured bonds trade at a spread of 280bps over Treasuries. The manager sees an opportunity in the basis relationship.",
          question:
            "The basis is +70bps (CDS − bond spread). What trade would exploit this dislocation if the manager expects the basis to converge?",
          options: [
            "Sell CDS protection (receive 350bps) and buy the cash bond (pay 280bps spread), locking in a +70bp riskless spread as the basis converges",
            "Buy CDS protection (pay 350bps) and short the bond (receive 280bps spread), expressing a bearish credit view",
            "Buy the CDX.HY index because individual name basis trades require sovereign approval",
            "Enter a total return swap as receiver on the cash bond only, ignoring the CDS market",
          ],
          correctIndex: 0,
          explanation:
            "A positive basis (CDS spread > bond spread) means CDS protection is expensive relative to the cash bond. The convergence trade sells the expensive CDS protection (receive 350bps) while buying the cheap cash bond (effectively paying 280bps of credit risk). If the basis narrows from +70bps toward zero, the trade profits. The combination is a form of capital structure arbitrage — the two instruments reference the same credit risk but are mispriced relative to each other.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Fixed Income Portfolio Management ──────────────────────────
    {
      id: "fia-4",
      title: "📊 Fixed Income Portfolio Management",
      description:
        "LDI, key rate durations, barbell vs. bullet, carry and roll-down, and factor models",
      icon: "BarChart2",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Liability-Driven Investing (LDI) & Duration Matching",
          content:
            "**Liability-Driven Investing (LDI)** is a framework where the fixed income portfolio is constructed to match or hedge specific future cash flow obligations — primarily used by pension funds and insurance companies.\n\n**The Core Problem:**\nA defined-benefit pension fund has a stream of future benefit payments (liabilities). If interest rates fall, the present value of those liabilities **rises**. If the asset portfolio does not also rise in value, the fund's funded status deteriorates.\n\n**Duration Matching:**\n- Match the **duration of assets to the duration of liabilities**.\n- A pension fund with 15-year liability duration should hold bonds with average duration ≈ 15 years.\n- Result: When rates move, asset and liability values change by similar amounts → funded status is protected.\n\n**LDI Implementation:**\n- **Physical bonds**: Long-duration corporate and Treasury bonds (20–30 year maturities).\n- **Overlay strategies**: Interest rate swaps and Treasury futures to adjust duration without changing physical holdings.\n- **Liability benchmark**: Custom index tracking the firm's specific liability cash flow profile.\n\n**Immunization:**\nThe classical academic approach — match both duration and convexity of assets to liabilities to achieve near-perfect hedging of parallel yield curve shifts.\n\n**Key Risk in LDI:** Spread duration — if assets are primarily corporate bonds and liabilities are discounted at a Treasury rate, credit spread widening hurts assets but not liabilities, creating funded status deterioration.",
          highlight: ["LDI", "liability-driven investing", "duration matching", "pension fund", "immunization", "overlay strategy", "interest rate swap", "funded status"],
        },
        {
          type: "teach",
          title: "Key Rate Durations & Yield Curve Positioning",
          content:
            "**Modified duration** captures parallel yield curve shift risk. **Key rate durations (KRDs)** decompose interest rate exposure across specific points on the yield curve.\n\n**Key Rate Duration:**\nThe price sensitivity to a 1% change at a specific maturity point while all other rates are held constant.\n- KRD 2yr, 5yr, 10yr, 20yr, 30yr — common key rate tenors.\n- Sum of all KRDs ≈ total modified duration.\n\n**Why KRDs Matter:**\n- Yield curves do not only shift in parallel — they twist, steepen, flatten, and butterfly.\n- A portfolio can have the same total duration as its benchmark but different KRD exposures.\n- A **steepening curve** (long rates rising relative to short) hurts a portfolio overweight long KRDs.\n- A **flattening curve** benefits long-duration overweights if driven by long-end yield declines.\n\n**Portfolio Strategies by Curve Positioning:**\n\n**Bullet Strategy:**\n- Concentrate holdings around one maturity segment (e.g., all 7–10 year bonds).\n- Maximizes sensitivity to a single point; benefits from parallel shifts, vulnerable to twists.\n\n**Barbell Strategy:**\n- Concentrate at two extremes (e.g., 2-year and 30-year bonds) while avoiding the middle.\n- Matching duration to a bullet but with higher convexity — benefits if the curve steepens or flattens.\n- Outperforms bullet if curve steepens; underperforms if curve flattens.\n\n**Ladder Strategy:**\n- Equal allocation across many maturities (e.g., 1yr through 10yr, 10% each).\n- Smooth reinvestment risk, steady maturity rolldown, balanced exposure across the curve.\n- Conservative, predictable — popular with retail investors and bank treasuries.",
          highlight: ["key rate duration", "KRD", "parallel shift", "steepening", "flattening", "barbell", "bullet", "ladder", "yield curve", "twist"],
        },
        {
          type: "teach",
          title: "Carry, Roll-Down, and Fixed Income Factor Models",
          content:
            "**Carry** is the income earned by holding a bond position, net of financing costs:\n`Carry = Coupon Income − Financing Cost (repo rate)`\n\nA bond financed in the repo market generates positive carry if its coupon exceeds the repo rate.\n\n**Roll-Down Return:**\nIn a normal (upward-sloping) yield curve, a bond's yield decreases as it \"rolls down\" the curve with the passage of time.\n- A 5-year bond today will be a 4-year bond in one year.\n- If the yield curve is steep, the 4-year yield is lower than the 5-year yield → capital appreciation.\n- **Roll-down** = price appreciation from moving to a lower-yield point on a static curve.\n\n**Total Horizon Return:**\n`Total Return = Coupon + Roll-Down + Duration Effect (from yield change) + Convexity`\n\nRoll-down is most valuable on the steep portion of the yield curve (typically 2–5 year range in a normal curve).\n\n**Fixed Income Factor Model:**\nSystematic factor exposure explains most fixed income returns:\n\n- **Duration (Level)**: Sensitivity to parallel shifts in the yield curve. The dominant risk factor.\n- **Curve (Slope/Twist)**: Exposure to steepening/flattening. Long barbell vs. bullet; 2s10s spread.\n- **Convexity**: Second-order rate sensitivity; long convexity positions benefit from rate volatility.\n- **Credit Spread**: Compensation for default and liquidity risk; the main driver in corporate bonds.\n- **Liquidity Premium**: Compensation for holding less-liquid bonds (off-the-run Treasuries, small issues).\n- **Currency**: For unhedged international holdings — FX return adds/subtracts from bond returns.",
          highlight: ["carry", "roll-down", "repo rate", "total return", "factor model", "duration factor", "curve factor", "credit spread factor", "liquidity premium"],
        },
        {
          type: "quiz-mc",
          question:
            "An asset manager runs a fixed income fund with a 10-year modified duration benchmark. She believes the yield curve will steepen significantly (2yr rates fall, 30yr rates rise). Which portfolio structure best positions for this view?",
          options: [
            "Barbell — concentrate in 2yr and 30yr bonds to profit from the 2yr rally while managing the 30yr exposure via short futures",
            "Bullet — concentrate all holdings in 10yr bonds to maintain exactly benchmark duration",
            "Ladder — equal weight across all maturities to neutralize curve exposure entirely",
            "Extend duration to 20yr — steepening always benefits longer-duration portfolios",
          ],
          correctIndex: 0,
          explanation:
            "A barbell strategy (2yr + 30yr) is the classic curve steepener position. The 2yr bonds benefit from falling short rates (price appreciation), while the 30yr exposure can be hedged with short Treasury futures if desired. A pure bullet at 10yr provides no differentiated curve exposure. A ladder neutralizes the curve view. Extending duration to 20yr would actually hurt if long-end rates rise in a steepening scenario.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Roll-down return is greatest in a flat yield curve environment because bonds at all maturities have similar yields.",
          correct: false,
          explanation:
            "False. Roll-down return is greatest when the yield curve is steep. In a steep curve, a bond that rolls from a higher-yield maturity to a lower-yield maturity gains significant capital appreciation as its yield falls with time. In a flat curve, there is minimal yield difference between maturities, so rolling down the curve generates little price appreciation. Practitioners often seek the steepest portion of the curve (frequently 2–5 years) to maximize roll-down returns.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: International Fixed Income & Rates ─────────────────────────
    {
      id: "fia-5",
      title: "🌍 International Fixed Income",
      description:
        "Currency hedging, covered interest parity, emerging market debt, negative yields, and global rate cycles",
      icon: "Globe",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Currency Hedging & Covered Interest Parity",
          content:
            "Investing in foreign bonds introduces **currency risk** — gains in the bond can be wiped out by FX moves. Hedging this risk is central to international fixed income management.\n\n**Covered Interest Rate Parity (CIP):**\nThe fundamental no-arbitrage relationship between spot exchange rates, forward exchange rates, and interest rate differentials:\n\n`F/S = (1 + r_d) / (1 + r_f)`\n\nWhere **F** = forward rate, **S** = spot rate, **r_d** = domestic rate, **r_f** = foreign rate.\n\n**Intuition:** If German Bunds yield 2% and US Treasuries yield 5%, the USD should depreciate relative to EUR in the forward market by approximately 3% per year — otherwise arbitrage would exist.\n\n**Hedged Return Formula:**\nFor a US investor buying a foreign bond (e.g., German Bund):\n`Hedged return ≈ Foreign bond yield + (USD SOFR − EUR EURIBOR)`\n\nThis is the **currency hedge return**: the foreign yield plus the cross-currency basis and rate differential.\n\n**Hedging Mechanics — FX Forward:**\n1. Buy EUR/USD spot to purchase German bonds.\n2. Simultaneously sell EUR forward (at known exchange rate) to lock in USD proceeds.\n3. Net result: Earn German Bund yield plus/minus the forward premium/discount (≈ rate differential).\n\n**Cross-Currency Basis:**\nIn practice, CIP deviates from theory due to supply/demand imbalances in FX swap markets. A negative USD basis means hedging into USD is cheaper than theory predicts — post-2008 phenomenon driven by dollar funding scarcity.",
          highlight: ["currency hedging", "covered interest parity", "CIP", "FX forward", "cross-currency basis", "hedged return", "SOFR", "EURIBOR"],
        },
        {
          type: "teach",
          title: "Emerging Market Debt: Local vs. Hard Currency",
          content:
            "Emerging market debt (EMD) offers higher yields than developed market bonds but with distinct risk profiles depending on currency denomination.\n\n**Hard Currency EMD (USD or EUR denominated):**\n- Bonds issued by EM sovereigns or corporates in USD or EUR.\n- No currency risk for USD investors — principal and interest in dollars.\n- Risk: credit/default risk of the EM sovereign or corporate.\n- Key index: **JP Morgan EMBI Global** (sovereign) and **CEMBI** (corporate).\n- Spread over US Treasuries compensates for default risk; historically ~300–500bps for IG EM.\n\n**Local Currency EMD:**\n- Bonds issued in the domestic currency (Brazilian Real, Indian Rupee, Turkish Lira, etc.).\n- Higher nominal yields — but investors bear full **FX risk**.\n- Key index: **JP Morgan GBI-EM Global Diversified**.\n- FX volatility can easily overwhelm bond returns — Turkish Lira bonds yielded 15% but the Lira fell 30% in some years, producing a USD-denominated loss.\n\n**Brady Bonds (Historical):**\n- Created in 1989–1994 Brady Plan to restructure Latin American sovereign debt.\n- Collateralized by US Treasury zero-coupon bonds, providing partial principal protection.\n- Pioneered the modern EM debt market. Most Brady bonds were exchanged for standard sovereign bonds by 2000s.\n\n**Key EM-Specific Risks:**\n- Political risk and policy uncertainty (capital controls, debt moratoriums)\n- Dollarization mismatch: government revenues in local currency, debt in USD\n- IMF program conditionality — restructuring may be required before IMF assistance",
          highlight: ["EMD", "hard currency", "local currency", "EMBI", "GBI-EM", "Brady bonds", "political risk", "FX risk", "currency mismatch"],
        },
        {
          type: "teach",
          title: "Negative Yielding Debt & Global Rate Cycles",
          content:
            "**Negative Yielding Bonds — The 2020 Phenomenon:**\nAt peak in August 2020, over **$18 trillion** of global bonds traded with negative yields — primarily Japanese government bonds (JGBs) and European sovereigns (German Bunds, Swiss bonds).\n\n**Why would anyone buy a bond with a negative yield?**\n1. **Monetary policy**: The ECB and Bank of Japan set policy rates below zero (-0.5% ECB, -0.1% BOJ). Negative-yielding bonds can still offer positive carry relative to the central bank deposit rate.\n2. **Capital appreciation expectation**: Investors expected yields to fall further negative — price appreciation would compensate.\n3. **Currency appreciation**: International investors who expect the EUR or JPY to appreciate can earn a positive USD-equivalent return on negative-yield bonds.\n4. **Regulatory requirements**: European banks, insurers, and pension funds must hold certain amounts of high-quality liquid assets — even at negative yields.\n5. **Safe haven**: During financial stress, investors accept negative yields for capital safety.\n\n**Global Rate Cycle Leadership:**\n- **Federal Reserve** is typically the global cycle leader — US rate moves propagate to other central banks via capital flows and currency effects.\n- **ECB**: More conservative; tends to lag the Fed by 12–24 months in rate cycle turns. Structural mandate for price stability over employment.\n- **Bank of Japan (BOJ)**: Uniquely accommodative; maintained yield curve control (YCC) through 2024, pegging 10-year JGB yields near zero while other central banks hiked aggressively.\n- **EM central banks**: Often preemptively hike before the Fed (Brazil, Chile, South Korea) to defend currencies and control inflation.",
          highlight: ["negative yield", "JGB", "Bund", "yield curve control", "YCC", "ECB", "Bank of Japan", "Fed", "global rate cycle", "capital flows"],
        },
        {
          type: "quiz-mc",
          question:
            "A US investor buys a German Bund yielding 2.8% and fully hedges the EUR/USD currency risk back to USD. The 1-year USD SOFR rate is 5.2% and EUR EURIBOR is 3.7%. What is the approximate USD-hedged return on the Bund position?",
          options: [
            "2.8% + (5.2% − 3.7%) = 2.8% + 1.5% = ~4.3%",
            "2.8% only — currency hedging eliminates all FX-related return enhancement",
            "2.8% − 5.2% = −2.4% — the investor loses the US rate differential by hedging",
            "3.7% — the hedged return equals the foreign rate, not the bond yield",
          ],
          correctIndex: 0,
          explanation:
            "The hedged return formula is: Foreign bond yield + (Domestic rate − Foreign rate). The currency hedge converts the German Bund's EUR return into USD, adding the interest rate differential. Here: 2.8% + (5.2% − 3.7%) = 2.8% + 1.5% = approximately 4.3%. This is significantly more attractive than buying the Bund unhedged (2.8%) and competitive with comparable US corporate bonds. This cross-market dynamic explains why foreign investors buy US Treasuries and why covered interest parity drives international capital flows.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An EM sovereign fund manager is evaluating two bonds from Brazil: (A) a 10-year USD-denominated Brazil bond yielding 7.5% (spread of 280bps over Treasuries), and (B) a 10-year BRL local currency bond yielding 12.8%. The manager's base case is for BRL to depreciate 4% per year vs. USD. Annual USD inflation is 2.5%.",
          question:
            "Which bond likely offers better risk-adjusted USD returns under the manager's base case?",
          options: [
            "USD hard currency bond — 7.5% yield with no currency risk; local bond's 12.8% minus 4% annual BRL depreciation ≈ 8.8% but with high FX volatility",
            "Local currency bond — 12.8% is always superior to 7.5% regardless of currency assumptions",
            "Neither — EM bonds are unsuitable for institutional portfolios due to political risk",
            "Local currency bond — a 4% annual depreciation is too small to matter for a 10-year horizon",
          ],
          correctIndex: 0,
          explanation:
            "Under the base case of 4% annual BRL depreciation, the local bond's USD-equivalent return is approximately 12.8% − 4% = 8.8% (simplified). This appears higher than the 7.5% hard currency bond, but comes with significant currency volatility risk — BRL can move 20–30% in a single year. The USD bond provides a known, predictable 7.5% return with no FX risk. For risk-adjusted comparison, the Sharpe ratio of the USD bond is typically higher given the volatility differential. Institutional managers often blend both instruments: hard currency for risk-managed core exposure, local currency for higher-return satellite positions.",
          difficulty: 3,
        },
      ],
    },
  ],
};
