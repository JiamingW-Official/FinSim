import type { Unit } from "./types";

export const UNIT_FIXED_INCOME_CREDIT: Unit = {
  id: "fixed-income-credit",
  title: "Fixed Income: Duration, Credit & Portfolio Management",
  description:
    "Master advanced fixed income concepts — duration and convexity, credit analysis, yield curve strategies, corporate bonds, securitization, and professional bond portfolio management",
  icon: "TrendingUp",
  color: "#0ea5e9",
  lessons: [
    // ─── Lesson 1: Duration & Convexity ───────────────────────────────────────
    {
      id: "fic-1",
      title: "Duration & Convexity",
      description:
        "Macaulay/modified/effective duration, convexity adjustment, DV01, and key rate durations",
      icon: "Activity",
      xpReward: 100,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Macaulay Duration — Weighted Average Time",
          content:
            "**Duration** measures a bond's sensitivity to interest rate changes. The most foundational form is **Macaulay duration**, which is the present-value-weighted average time until all cash flows are received.\n\n**Formula:**\nMacaulay Duration = Σ [ (t × PV(CFt)) / Bond Price ]\n\nwhere t = time of each cash flow, PV(CFt) = present value of cash flow at time t.\n\n**Example — 3-year bond, 6% coupon, YTM = 6%, par = $1,000:**\n| Year | Cash Flow | PV at 6% | Weight | t × Weight |\n|---|---|---|---|---|\n| 1 | $60 | $56.60 | 5.66% | 0.0566 |\n| 2 | $60 | $53.40 | 5.34% | 0.1068 |\n| 3 | $1,060 | $890.00 | 89.00% | 2.6700 |\n| **Total** | | **$1,000** | **100%** | **2.833 years** |\n\nMacaulay Duration = **2.833 years** — this bond behaves, on average, like a 2.833-year zero-coupon bond in terms of interest rate sensitivity.\n\n**Key insight:** Zero-coupon bonds have Macaulay duration equal to their maturity (all cash flow at maturity). Coupon bonds always have duration less than maturity because coupon payments arrive earlier.",
          highlight: ["Macaulay duration", "weighted average time", "present value", "zero-coupon bonds"],
        },
        {
          type: "teach",
          title: "Modified Duration, DV01, and Key Rate Duration",
          content:
            "**Modified Duration** converts Macaulay duration into a direct price sensitivity measure:\n\nModified Duration = Macaulay Duration / (1 + YTM/n)\n\nwhere n = coupon periods per year. For semi-annual bonds, divide by (1 + YTM/2).\n\n**Interpretation:** For every 1% (100 bps) change in yield, the bond price changes by approximately ModDur%.\n\n**Example:** Modified Duration = 4.5. If yields rise 100 bps, price falls ≈ 4.5%.\n\n**DV01 (Dollar Value of 01):** The dollar price change for a 1 basis point (0.01%) move in yield:\n\nDV01 = Modified Duration × Bond Price × 0.0001\n\nFor a $1M position with ModDur = 5.0:\nDV01 = 5.0 × $1,000,000 × 0.0001 = **$500 per bp**\n\nDV01 is the primary risk measure for bond traders — it lets them express exposure in dollar terms and hedge precisely.\n\n**Key Rate Durations (KRDs):** Instead of a single parallel shift, KRDs measure sensitivity to specific points on the yield curve (2yr, 5yr, 10yr, 30yr). Sum of all KRDs ≈ Total Duration. Essential for portfolio managers hedging non-parallel curve moves.",
          highlight: ["modified duration", "DV01", "key rate duration", "basis point", "parallel shift"],
        },
        {
          type: "teach",
          title: "Convexity — The Second-Order Correction",
          content:
            "**Modified duration** gives a linear approximation of price changes. For large yield moves, this approximation understates how much prices actually move due to **convexity** — the curvature in the price-yield relationship.\n\n**Full price change formula:**\nΔP/P ≈ −ModDur × Δy + ½ × Convexity × (Δy)²\n\nConvexity always adds a positive term — meaning bonds always do slightly better than duration alone predicts:\n- Yields fall by 2%: price rises *more* than duration predicts\n- Yields rise by 2%: price falls *less* than duration predicts\n\n**Example — 10yr bond, ModDur = 7.5, Convexity = 75:**\nIf yields rise 200 bps:\n- Duration-only estimate: −7.5 × 0.02 = −15.0%\n- Convexity correction: +½ × 75 × (0.02)² = +1.5%\n- Full estimate: **−13.5%** (better than −15%)\n\n**Practical implications:**\n- Higher convexity bonds (callable bonds, longer maturities) outperform lower convexity bonds in volatile rate environments\n- **Effective duration** is used for bonds with embedded options (callables, MBS), accounting for how the option changes cash flows as rates move\n- Portfolio managers pay a premium for convexity when volatility is elevated",
          highlight: ["convexity", "effective duration", "price-yield relationship", "callable bonds", "curvature"],
        },
        {
          type: "quiz-mc",
          question:
            "A bond has a Modified Duration of 6.0 and yields rise by 50 basis points. What is the approximate price change?",
          options: [
            "−3.0% (Modified Duration × yield change)",
            "+3.0% (prices rise when duration is positive)",
            "−6.0% (duration equals the full percentage drop)",
            "−0.3% (only 1/10 of the yield move matters)",
          ],
          correctIndex: 0,
          explanation:
            "Modified Duration approximates price sensitivity: ΔP/P ≈ −ModDur × Δy. With ModDur = 6.0 and Δy = +0.005 (50 bps), price change ≈ −6.0 × 0.005 = −0.03 = −3.0%. The negative sign reflects the inverse price-yield relationship. Convexity would slightly reduce the actual loss, but −3.0% is the standard first-order estimate.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Convexity always hurts bond investors — it amplifies price losses when yields rise.",
          correct: false,
          explanation:
            "False. Convexity is always beneficial (for plain vanilla bonds). The convexity adjustment is +½ × Convexity × (Δy)², which is always positive regardless of whether yields rise or fall. When yields rise, convexity means prices fall *less* than duration alone predicts. When yields fall, prices rise *more* than duration alone predicts. This asymmetry is why investors pay a premium for high-convexity bonds.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Credit Analysis ────────────────────────────────────────────
    {
      id: "fic-2",
      title: "Credit Analysis",
      description:
        "Credit ratings, spread decomposition, CDS pricing, default probability, and recovery rates",
      icon: "Shield",
      xpReward: 100,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Credit Ratings and Spread Decomposition",
          content:
            "**Credit ratings** assigned by Moody's, S&P, and Fitch summarize the probability that a borrower will default on its obligations.\n\n**Rating categories:**\n| Category | Moody's | S&P/Fitch | 10yr Default Rate |\n|---|---|---|---|\n| Investment grade (IG) | Aaa–Baa3 | AAA–BBB− | <2% |\n| High yield (HY) | Ba1–C | BB+–D | 5–30%+ |\n| Investment grade cutoff | Baa3 | BBB− | — |\n\n**Credit spread** = Bond YTM − Risk-free (Treasury) rate\n\nThe credit spread compensates investors for three components:\n1. **Expected loss** = Probability of Default (PD) × Loss Given Default (LGD)\n   - LGD = 1 − Recovery Rate. Senior secured bonds recover ~60–70%; subordinated bonds ~20–30%.\n2. **Spread risk premium** — compensation for the risk of spread *widening* (mark-to-market losses)\n3. **Liquidity premium** — compensation for lower trading volume vs. Treasuries\n\n**Example:** Ford 10yr bond trading at T+250 bps:\n- Expected loss component: ~80 bps (PD ~5%, LGD ~60%)\n- Spread risk premium: ~100 bps\n- Liquidity premium: ~70 bps\n\nCredit analysts focus on identifying when *market-implied* expected loss diverges from their *fundamental* view of the issuer's creditworthiness.",
          highlight: ["credit ratings", "credit spread", "probability of default", "loss given default", "recovery rate", "investment grade", "high yield"],
        },
        {
          type: "teach",
          title: "Credit Default Swaps (CDS) and Default Probability",
          content:
            "A **Credit Default Swap (CDS)** is a derivative that transfers credit risk. The protection buyer pays a periodic premium (the CDS spread) to the protection seller; in exchange, the seller compensates the buyer if a credit event (default, restructuring) occurs.\n\n**Structure:**\n- Protection buyer pays: CDS spread × notional per year\n- If default: seller pays par − recovery rate (the loss)\n- CDS spread ≈ credit spread for liquid names\n\n**CDS-implied default probability:**\nFor a simplified single-period model:\nPD ≈ CDS Spread / (1 − Recovery Rate)\n\n**Example:** Ford 5yr CDS trades at 300 bps, Recovery Rate = 40%:\nPD ≈ 0.03 / (1 − 0.40) = **5.0% annualized default probability**\n\n**Uses in practice:**\n- **Hedging**: Bondholders buy CDS protection to reduce credit exposure without selling the bond\n- **Speculation**: Investors buy CDS without owning the bond to express a negative credit view (\"naked CDS\")\n- **Price discovery**: CDS market often reacts to credit deterioration faster than the cash bond market\n- **CDS indices**: CDX (North America IG/HY), iTraxx (Europe) — baskets of 100–125 CDS used for broad credit exposure\n\n**Basis trade:** When CDS spread ≠ cash bond spread, traders exploit the difference (buy bond + buy CDS protection if CDS cheap).",
          highlight: ["CDS", "credit default swap", "protection buyer", "protection seller", "CDS spread", "CDX", "iTraxx", "basis trade"],
        },
        {
          type: "quiz-mc",
          question:
            "A company has a 5-year CDS spread of 400 bps and an assumed recovery rate of 40%. What is the approximate annualized probability of default implied by the CDS market?",
          options: [
            "6.67% (= 400 bps / (1 − 40%))",
            "4.00% (= 400 bps directly)",
            "2.40% (= 400 bps × 60%)",
            "10.0% (= 400 bps / 40%)",
          ],
          correctIndex: 0,
          explanation:
            "The simplified CDS-implied PD formula is: PD ≈ CDS Spread / (1 − Recovery Rate). With a 400 bps (0.04) spread and 40% recovery: PD = 0.04 / 0.60 = 0.0667 = 6.67%. Intuitively, if default occurs the seller pays 60 cents per dollar (LGD = 60%), so the premium must cover 6.67% annual probability of losing 60% to equal a 400 bps expected annual payment.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You manage a $100M investment-grade bond portfolio. A major holding — a BBB− rated retailer with $10M notional — reports a surprise earnings miss and its CDS spread widens from 150 bps to 450 bps overnight. The company's bonds are down 4 points. You believe the weakness is temporary but want to reduce credit risk without triggering a large tax event from selling the bonds.",
          question: "What is the most efficient tool to hedge the credit risk on this position?",
          options: [
            "Buy $10M CDS protection on the retailer — pays out if default occurs while preserving the bond position",
            "Sell all $10M of the bonds immediately to eliminate the risk",
            "Buy Treasury futures to hedge the interest rate component only",
            "Increase the position by buying more bonds at the depressed price",
          ],
          correctIndex: 0,
          explanation:
            "Buying CDS protection is the classic solution: you pay the CDS spread (now ~450 bps) to a protection seller who will compensate you in a default. You keep the bonds (avoiding a taxable event and locking in the depressed price), but your net credit exposure is hedged. Selling the bonds outright is cleaner but triggers capital gains/losses and bid-ask costs. Treasury futures only hedge duration/rate risk, not credit risk. Adding more at the dip is a directional bet, not a hedge.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Yield Curve Strategies ─────────────────────────────────────
    {
      id: "fic-3",
      title: "Yield Curve Strategies",
      description:
        "Bullet, barbell, and ladder portfolios; curve steepener/flattener trades; riding the curve",
      icon: "TrendingUp",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Portfolio Structures — Bullet, Barbell, and Ladder",
          content:
            "**Three foundational portfolio structures** organize maturity exposure differently, each with distinct risk/return profiles assuming the same total duration.\n\n**Bullet portfolio:**\nConcentrates all maturities in one maturity band (e.g., 9–11 year bonds). Duration is easy to control and reinvestment risk is limited. Performs best when the yield curve is stable or when the target maturity outperforms.\n\n**Barbell portfolio:**\nSplits exposure between short maturities (1–2yr) and long maturities (20–30yr), with nothing in the middle. The average duration equals a bullet at ~10yr. Barbells have *higher convexity* than bullets at the same duration — they outperform bullets when yields move sharply in either direction (twist or parallel shift).\n\n**Ladder portfolio:**\nEvenly spaces maturities across the curve (e.g., 1yr, 2yr, 3yr … 10yr in equal amounts). Provides natural reinvestment at prevailing rates as bonds mature annually. Lowest volatility structure — used by insurance companies and pension funds needing predictable cash flows.\n\n**Duration equivalence example (5yr total duration):**\n| Structure | Maturities | Convexity | Best Environment |\n|---|---|---|---|\n| Bullet | 4–6yr bonds | Low | Stable curve |\n| Barbell | 1yr + 20yr | High | High volatility |\n| Ladder | 1–10yr equal | Medium | Gradual rate rises |",
          highlight: ["bullet portfolio", "barbell portfolio", "ladder portfolio", "convexity", "duration"],
        },
        {
          type: "teach",
          title: "Curve Trades — Steepeners, Flatteners, and Riding the Curve",
          content:
            "**Yield curve shape trades** bet on the *spread* between two maturities, not on outright rate levels.\n\n**Steepener trade:** Profits when the curve steepens (long-end yields rise more than short-end, or short-end falls more).\n- Implementation: Short 2yr Treasuries + Long 30yr Treasuries (duration-neutral)\n- Typical driver: Reflationary environment, Fed holds rates while inflation expectations rise\n\n**Flattener trade:** Profits when the curve flattens (spread narrows).\n- Implementation: Long 2yr + Short 30yr (duration-neutral)\n- Typical driver: Fed tightening cycle, recession fears driving flight to long-end\n\n**2s10s spread** (10yr minus 2yr yield) is the most widely followed curve metric:\n- Positive (normal): Lenders earn more for longer commitments; healthy economy\n- Negative (inverted): Historically precedes recessions — 2yr > 10yr signals tight monetary policy\n\n**Riding the curve (rolling down the curve):**\nIn a positively-sloped yield curve, a 5-year bond bought today will become a 4-year bond next year. If the curve is unchanged, it \"rolls down\" to a lower yield point — generating price appreciation on top of coupon income. This strategy is popular in steep curve environments.\n\n**Example:** Buy a 5yr bond at 4.5% yield. In 12 months it becomes a 4yr bond. If 4yr yield = 4.0%, the bond has rallied. Roll return = (4.5% − 4.0%) × ModDur ≈ 0.5% × 3.7 = **+1.85% extra return.**",
          highlight: ["steepener", "flattener", "2s10s spread", "riding the curve", "roll return", "duration-neutral", "yield curve shape"],
        },
        {
          type: "quiz-mc",
          question:
            "A portfolio manager expects the Federal Reserve to begin an aggressive rate-hiking cycle. Which yield curve strategy is most likely to outperform?",
          options: [
            "Curve flattener — Fed hikes raise short-term rates faster than long-term rates, flattening the curve",
            "Curve steepener — Fed hikes widen the 2s10s spread by lifting long yields",
            "Barbell — concentrating in short and long maturities maximizes income during hikes",
            "Buy 30yr bonds — long duration benefits most from rising short-term rates",
          ],
          correctIndex: 0,
          explanation:
            "Fed tightening cycles typically flatten the yield curve: the Fed directly controls the short end (Fed Funds Rate) which rises quickly, while long-term yields are anchored by inflation expectations and growth outlook, which may not rise as fast. A flattener (long 2yr / short 30yr, duration-neutral) profits as the 2s10s spread narrows. The 2000–2006 and 2015–2018 hiking cycles both produced significant curve flattening.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A barbell portfolio always has higher convexity than a bullet portfolio with the same duration.",
          correct: true,
          explanation:
            "True. Convexity is a non-linear function of maturity — longer maturities contribute disproportionately more convexity than their duration contribution. A barbell splits exposure between very short bonds (low convexity) and very long bonds (very high convexity). The high convexity of the long bonds more than offsets the low convexity of the short bonds, giving the barbell higher total convexity than a bullet at the same average duration. This is why barbells outperform bullets when yields move sharply.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Corporate Bonds ────────────────────────────────────────────
    {
      id: "fic-4",
      title: "Corporate Bonds",
      description:
        "Investment grade vs high yield, covenants, callable bonds, fallen angels, and capital structure",
      icon: "Building2",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Investment Grade vs High Yield — The Rating Divide",
          content:
            "The **BBB−/Baa3 boundary** is the most consequential line in fixed income markets. Bonds above it are **investment grade (IG)**; bonds below are **high yield (HY)**, also called \"junk bonds.\"\n\n**Investment Grade bonds:**\n- Ratings: AAA, AA, A, BBB (and +/− notches)\n- Buyers: Insurance companies, pension funds, bank balance sheets, money market funds (short IG)\n- Spreads: Typically 50–300 bps over Treasuries\n- Default risk: Very low — historical 10yr cumulative default rate ~2% for BBB\n- Primary driver: Interest rate sensitivity (duration dominates return)\n\n**High Yield bonds:**\n- Ratings: BB, B, CCC, CC, C, D\n- Buyers: Hedge funds, dedicated HY mutual funds, CLOs\n- Spreads: Typically 300–1,000+ bps over Treasuries (widens sharply in recessions)\n- Default risk: Significant — CCC-rated bonds default at 25%+ rates in downturns\n- Primary driver: Credit quality / economic cycle (spreads dominate return)\n\n**Capital structure priority in default:**\n1. Senior Secured (first-lien loans) — highest recovery\n2. Senior Unsecured bonds — middle tier\n3. Subordinated / Mezzanine debt\n4. Preferred equity\n5. Common equity — residual claim, often wiped out\n\nHigher seniority = lower yield but better downside protection.",
          highlight: ["investment grade", "high yield", "BBB−", "capital structure", "recovery", "spreads", "rating"],
        },
        {
          type: "teach",
          title: "Covenants, Callable Bonds, and Fallen Angels",
          content:
            "**Covenants** are contractual restrictions embedded in bond indentures that protect bondholders:\n\n- **Affirmative covenants**: Issuer must maintain insurance, provide audited financials, maintain debt service coverage ratio (DSCR) above a threshold.\n- **Negative covenants**: Issuer cannot incur additional debt above a leverage cap, pay dividends if coverage falls below a threshold, or sell major assets without consent. Common in HY bonds; rare in IG.\n- **Covenant-lite (cov-lite)**: Bonds (and loans) with minimal maintenance covenants — became common post-2010. Protects issuers but reduces early warning signals for creditors.\n\n**Callable bonds:**\nIssuers can redeem the bond before maturity at a pre-specified call price (usually par + call premium). This gives the issuer the option to refinance if rates fall.\n- Investors demand a **call premium** (higher yield) to compensate for reinvestment risk\n- **Yield to call (YTC)** vs. **Yield to worst (YTW)**: YTW = minimum of YTM and all YTCs; it's the worst-case yield the investor can receive. Bond investors always quote YTW.\n- **Negative convexity**: Callable bonds exhibit negative convexity near the call price — as yields fall, the bond price is capped at the call price rather than rising freely.\n\n**Fallen angels:**\nBonds that were originally rated IG but are downgraded below BBB−. They are often forced sellers: IG-constrained funds must liquidate, driving prices down sharply — often overshooting fundamental value. Fallen angel ETFs and dedicated funds buy these distressed IG bonds opportunistically.\n\n**Rising stars:** The opposite — originally HY bonds upgraded to IG, often rallying 10–20 points on the upgrade.",
          highlight: ["covenants", "callable bonds", "yield to worst", "negative convexity", "fallen angels", "rising stars", "covenant-lite"],
        },
        {
          type: "quiz-mc",
          question:
            "A company's long-term credit rating is downgraded from BBB− to BB+. What is the most immediate market impact on its outstanding bonds?",
          options: [
            "Forced selling by investment-grade-constrained funds causes the bonds to drop sharply in price",
            "The bonds are immediately recalled by the issuer under the call provision",
            "Credit spreads tighten because the company now pays more coupon income",
            "The bonds are reclassified as government-backed and eligible for central bank purchases",
          ],
          correctIndex: 0,
          explanation:
            "A downgrade from BBB− to BB+ crosses the IG/HY boundary, creating a 'fallen angel.' Investment-grade-mandated institutional investors (insurance companies, pension funds, many mutual funds) are prohibited by their investment policy statements from holding sub-IG bonds and must sell. This forced, price-insensitive selling typically pushes bond prices down 5–15 points. The overshooting often creates buying opportunities for unconstrained HY investors.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Yield to Worst (YTW) on a callable bond is always less than or equal to Yield to Maturity (YTM).",
          correct: true,
          explanation:
            "True. YTW is defined as the minimum yield an investor can receive across all call scenarios and the final maturity. If the bond is called early, the investor loses the remaining coupon stream and must reinvest at current (potentially lower) rates. The issuer will only call the bond when it benefits them — i.e., when rates have fallen and they can refinance cheaper — which is precisely when reinvestment rates are lower for the investor. Thus YTW ≤ YTM for callable bonds. Bond professionals always use YTW as the standard yield quote.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Securitization ──────────────────────────────────────────────
    {
      id: "fic-5",
      title: "Securitization",
      description:
        "ABS, MBS, CMO tranches, CDO/CLO structures, and waterfall cash flow mechanics",
      icon: "Layers",
      xpReward: 105,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Securitization Fundamentals — ABS and MBS",
          content:
            "**Securitization** pools illiquid loans, converts them into tradeable bonds, and transfers credit risk to capital markets — expanding credit availability and freeing bank balance sheets.\n\n**Process:**\n1. Originator (bank) creates loans (mortgages, auto loans, credit cards)\n2. Loans are sold to a Special Purpose Vehicle (SPV/trust) — bankruptcy-remote from the bank\n3. SPV issues securities backed by loan cash flows\n4. Rating agencies rate tranches; credit enhancement (over-collateralization, reserve accounts) supports ratings\n\n**Asset-Backed Securities (ABS):**\n- Backed by non-mortgage consumer debt: auto loans, credit card receivables, student loans, equipment leases\n- Short to medium duration (1–5yr typical)\n- Auto ABS: Very stable — people prioritize car payments; low default volatility\n- Credit card ABS: Revolving structure — as cardholders repay, originator adds new receivables\n\n**Mortgage-Backed Securities (MBS):**\n- **Agency MBS** (FNMA, FHLMC, GNMA): Government-sponsored, carry no credit risk. Primary risk = **prepayment risk** (homeowners refinancing when rates fall, returning principal early)\n- **Non-agency MBS** (private label): Carry credit risk; rated by tranches; collapsed in 2008 housing crisis\n- **Prepayment speed** measured in PSA (Public Securities Association model). 100 PSA = standard speed; 200 PSA = double-speed refinancing environment.",
          highlight: ["securitization", "SPV", "ABS", "MBS", "agency MBS", "prepayment risk", "PSA", "credit enhancement"],
        },
        {
          type: "teach",
          title: "CMO Tranches, CDO, and CLO — Waterfall Structures",
          content:
            "**Collateralized Mortgage Obligations (CMOs)** restructure MBS cash flows into sequential tranches with different prepayment exposures:\n\n**PAC (Planned Amortization Class)**: Stable prepayment profile within a band — most predictable cash flows, lowest spread\n**TAC (Targeted Amortization Class)**: Protected against prepayment acceleration, not slowdown\n**Z-tranche (Accrual bond)**: Last to receive any principal; accrues interest until earlier tranches are paid off — longest average life, most volatile\n**IO (Interest Only) / PO (Principal Only)**: Strip CMOs. IO benefits when prepayments slow; PO benefits when prepayments accelerate.\n\n**Collateralized Debt Obligations (CDOs):**\nPool of bonds or loans repackaged into tranches. CDOs of corporate bonds (CBO) or loans (CLO) were distinct from CDOs of MBS (which caused the 2008 crisis).\n\n**Collateralized Loan Obligations (CLOs) — today's dominant structure:**\n- Pool of 150–200 leveraged loans\n- Tranches: AAA (60%), AA (10%), A (7%), BBB (6%), BB (4%), B (2%), Equity (11%)\n- **Waterfall**: Senior tranches paid first; equity absorbs first losses but captures excess spread\n- CLO equity typically targets 12–18% IRR if defaults stay low\n- The CLO manager actively manages the portfolio within reinvestment period (4–5yr)\n\n**Credit enhancement mechanisms:**\n- Over-collateralization: $110 of loans backing $100 of notes\n- Excess spread: Loan yield > note coupon; surplus trapped in reserve\n- Subordination: Lower tranches absorb losses before seniors",
          highlight: ["CMO", "PAC", "CLO", "CDO", "waterfall", "tranches", "over-collateralization", "excess spread", "IO", "PO"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor holds an Interest-Only (IO) strip from a CMO. Mortgage prepayments accelerate dramatically as interest rates fall sharply. What happens to the IO value?",
          options: [
            "IO value falls sharply — prepayments reduce the outstanding principal base generating interest",
            "IO value rises — faster prepayments return cash sooner, increasing present value",
            "IO value is unaffected — it receives interest regardless of principal changes",
            "IO value rises proportionally with the drop in rates",
          ],
          correctIndex: 0,
          explanation:
            "An IO strip receives only the interest portion of mortgage payments, based on the remaining principal balance. When homeowners prepay (refinance), the principal balance declines rapidly — reducing or eliminating the interest cash flows. In an extreme prepayment scenario, the IO can lose most of its value. This is why IO strips exhibit 'negative duration' — they actually rise in value when rates rise (slowing prepayments preserves the interest stream) and fall when rates drop. They are the opposite of standard bonds.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "In a CLO waterfall structure, equity tranche holders receive distributions before AAA noteholders.",
          correct: false,
          explanation:
            "False. The waterfall flows from senior to junior: AAA note interest is paid first, then AA, A, BBB, BB, B note interest, then principal repayment in the same order. Equity (the first-loss piece) receives only the residual cash flows after all senior obligations are met. In exchange for absorbing first losses, equity investors have potential for the highest returns — but only if portfolio default rates stay low and excess spread accumulates in their favor.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Bond Portfolio Management ──────────────────────────────────
    {
      id: "fic-6",
      title: "Bond Portfolio Management",
      description:
        "Benchmark tracking, active duration bets, credit rotation, and risk attribution in fixed income",
      icon: "BarChart2",
      xpReward: 110,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Benchmark Tracking and Active vs Passive Management",
          content:
            "Most institutional fixed income portfolios are managed relative to a **benchmark index** such as the Bloomberg U.S. Aggregate Bond Index (\"the Agg\") or the Bloomberg U.S. Credit Index.\n\n**Benchmark characteristics (Bloomberg Agg ~2025):**\n- ~13,000 bonds, ~$27 trillion market value\n- Duration: ~6.0 years\n- Composition: Treasuries (~43%), Agency MBS (~27%), IG corporate (~24%), agency debt (~6%)\n\n**Passive indexing** (tracking):  Replicate benchmark duration, sector weights, and credit quality within tight tolerances. Tracking error target: <10 bps/year.\n\n**Active management** — the manager deliberately deviates from the benchmark:\n1. **Duration bet**: If manager believes rates will fall, go long duration (increase to e.g. 7.5yr vs benchmark 6.0yr). Each 1% rate move generates ~1.5yr × price impact relative to benchmark.\n2. **Sector allocation**: Overweight IG credit (underweight Treasuries) when credit spreads look attractive\n3. **Curve positioning**: Overweight 10yr sector, underweight 2yr and 30yr (bullet) if expecting curve flattening\n4. **Credit selection**: Overweight specific issuers where the manager has a more positive view than the market\n\n**Information ratio (IR):** Active return / Tracking error. A good active fixed income manager targets IR ≥ 0.5 consistently.",
          highlight: ["Bloomberg Aggregate", "benchmark", "tracking error", "duration bet", "active management", "information ratio", "sector allocation"],
        },
        {
          type: "teach",
          title: "Credit Rotation, Risk Attribution, and Total Return Framework",
          content:
            "**Credit rotation** is the process of dynamically shifting between sectors (IG vs HY, sectors within IG) based on economic cycle positioning:\n\n**Economic cycle and spread behavior:**\n| Cycle Phase | Spread Trend | Strategy |\n|---|---|---|\n| Early recovery | Tightening rapidly | Overweight HY, CCC |\n| Mid-cycle expansion | Stable / tight | Overweight IG financials, cyclicals |\n| Late cycle | Beginning to widen | Rotate to defensives (utilities, consumer staples) |\n| Recession | Sharply wider | Overweight Treasuries, short duration, HY underweight |\n\n**Total return decomposition for a bond portfolio:**\n1. **Carry**: Coupon income earned (the \"free\" return)\n2. **Roll-down**: Roll return from moving down a steep curve\n3. **Duration P&L**: Price change from yield level moves (−ModDur × Δy)\n4. **Spread P&L**: Price change from credit spread moves (−SpreadDur × ΔSpread)\n5. **Currency P&L**: For global portfolios, FX impact\n\n**Risk attribution framework:**\nPortfolio managers decompose active return vs benchmark into:\n- **Duration contribution**: Active duration × yield move\n- **Curve contribution**: Key rate duration differences × curve reshaping\n- **Spread contribution**: Spread duration mismatch × sector spread moves\n- **Selection contribution**: Individual bond outperformance/underperformance\n\n**Tracking error decomposition:** Tools like BARRA or Axioma decompose TE into systematic (factor) and specific components — systematic TE comes from duration/spread mismatches; specific TE from individual issuer tilts.",
          highlight: ["credit rotation", "total return", "carry", "roll-down", "spread duration", "risk attribution", "tracking error decomposition"],
        },
        {
          type: "quiz-mc",
          question:
            "A bond portfolio manager has a benchmark duration of 6.0 years. She believes interest rates will fall 75 basis points over the next 6 months. She increases portfolio duration to 8.5 years. What is the approximate active return contribution from this duration bet if rates fall exactly 75 bps?",
          options: [
            "+1.875% (active duration of 2.5yr × 75 bps rate fall)",
            "+6.375% (total portfolio duration of 8.5yr × 75 bps)",
            "+0.1875% (2.5yr active duration × 75 bps, divided by 10)",
            "−1.875% (rates falling hurts longer duration portfolios)",
          ],
          correctIndex: 0,
          explanation:
            "Active return from a duration bet = Active Duration × Δyield. Active Duration = 8.5 − 6.0 = 2.5 years. Rate change = −0.0075 (rates fall). Active return ≈ −(−2.5 × 0.0075) = +1.875%. The full portfolio return would include benchmark duration return plus this active contribution, but the *active* (vs benchmark) return is attributable only to the 2.5yr overweight. This is how portfolio managers isolate the value added by each decision.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You manage a $500M investment-grade bond fund benchmarked to the Bloomberg U.S. Corporate IG Index (duration ~7.0yr, average spread ~120 bps). You expect: (1) The Fed will pivot to cutting rates in 3 months, (2) Economic growth will remain resilient. Your portfolio currently matches the benchmark exactly.",
          question: "Which combination of active positions best expresses this outlook?",
          options: [
            "Extend duration to 8.5yr AND overweight BBB cyclical credits — benefits from both falling rates (long duration) and tightening spreads (credit overweight)",
            "Shorten duration to 5.0yr AND overweight Treasuries — defensive positioning reduces risk ahead of the cut",
            "Maintain benchmark duration AND overweight CCC-rated high yield — maximizes spread income",
            "Extend duration to 8.5yr AND underweight all credit, buy only Treasuries — rate play without credit risk",
          ],
          correctIndex: 0,
          explanation:
            "A Fed pivot (rate cuts) favors longer duration (prices rise as yields fall), and resilient economic growth supports credit spread tightening (cyclical BBB credits outperform). Combining these two views — long duration AND overweight cyclical IG credit — captures both alpha sources. Option B (shorten duration) fights the rate cut view. Option C violates the IG mandate (CCC is HY). Option D captures the rate move but leaves credit return on the table despite a constructive economic view.",
          difficulty: 3,
        },
      ],
    },
  ],
};
