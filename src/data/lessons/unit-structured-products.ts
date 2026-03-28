import type { Unit } from "./types";

export const UNIT_STRUCTURED_PRODUCTS: Unit = {
  id: "structured-products",
  title: "Structured Products",
  description:
    "Master interest rate swaps, credit derivatives, equity-linked products, commodity/FX exotics, and volatility instruments",
  icon: "Layers",
  color: "#7c3aed",
  lessons: [
    // ─── Lesson 1: Interest Rate Derivatives ──────────────────────────────────────
    {
      id: "struct-prod-1",
      title: "Interest Rate Derivatives",
      description:
        "Swaps, caps, floors, swaptions, and FRAs — the instruments that govern global borrowing costs",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Interest Rate Swaps: Fixed-for-Floating Mechanics",
          content:
            "An **interest rate swap (IRS)** is a bilateral agreement to exchange interest payments on a **notional principal** — one leg pays a fixed rate, the other pays a floating rate referenced to a benchmark such as **SOFR** (Secured Overnight Financing Rate), which replaced LIBOR after the 2012 rate-manipulation scandal.\n\n**Critical rule: the notional principal is NEVER exchanged.** Only the net interest difference is settled on each payment date — this dramatically reduces counterparty credit risk.\n\n**Net Settlement Example:**\nCompany A pays fixed 4.5%; Bank pays SOFR = 3.8%. Net: Company A pays 0.7% on notional.\n\n**LIBOR → SOFR Transition:**\nLIBOR was a forward-looking term rate set by panel banks. SOFR is an overnight rate derived from actual Treasury repo transactions — more robust but requires different conventions (compounding in arrears vs. simple interest for LIBOR).\n\n**Swap Curve Bootstrapping:**\nThe swap curve is constructed from short-term instruments (Eurodollar/SOFR futures) and longer-term par swap rates. From overlapping market quotes, bootstrap extracts zero-coupon discount factors step by step — each maturity's zero rate is solved so that the par swap's NPV = 0.\n\nSwap valuation: PV(fixed leg) – PV(floating leg). At inception NPV = 0 by construction. As rates move, the swap gains or loses mark-to-market value.",
          highlight: [
            "interest rate swap",
            "notional",
            "SOFR",
            "LIBOR",
            "net settlement",
            "swap curve",
            "bootstrapping",
          ],
        },
        {
          type: "teach",
          title: "Interest Rate Options: Caps, Floors & Swaptions",
          content:
            "**Interest Rate Cap:**\nA cap is a portfolio of **caplets** — each caplet is a call option on a reference rate (SOFR) for one reset period. If SOFR exceeds the cap strike on a reset date, the caplet pays: (SOFR – Cap Strike) × Notional × Day Count.\n\nCorporate use case: A company borrowed at SOFR + 150bp and fears rising rates. Buying a 5% cap guarantees its all-in rate never exceeds 5% + 150bp = 6.50%, regardless of how high SOFR goes.\n\n**Interest Rate Floor:**\nA floor is a series of **floorlets** paying when the reference rate falls below the floor strike. Lenders with floating-rate loan books buy floors to guarantee minimum interest income.\n\n**Cap – Floor Parity:**\nBuying a cap and selling a floor at the same strike = paying fixed in an interest rate swap. This is the put-call parity equivalent for rates.\n\n**Swaptions:**\nA swaption is an option to enter an interest rate swap at a pre-agreed fixed rate on a future date.\n\n- **Payer swaption:** right to pay fixed (receive floating) — profits if rates rise\n- **Receiver swaption:** right to receive fixed (pay floating) — profits if rates fall\n\nReceiver swaptions are widely used by insurance companies and pension funds to hedge against declining yields on their fixed-income liabilities. Banks use payer swaptions to hedge mortgage pipeline commitments.\n\n**Interest Rate Collar:**\nCombining a purchased cap with a sold floor creates a collar — caps the maximum rate while providing a floor on the minimum, with the floor premium partially offsetting the cap cost.",
          highlight: [
            "cap",
            "floor",
            "caplet",
            "floorlet",
            "swaption",
            "payer swaption",
            "receiver swaption",
            "collar",
            "cap-floor parity",
          ],
        },
        {
          type: "teach",
          title: "Forward Rate Agreements (FRAs): Locking In Future Rates",
          content:
            "A **Forward Rate Agreement (FRA)** is an OTC contract that locks in a borrowing or lending rate for a future period. It is the simplest interest rate derivative — essentially a single caplet or floorlet.\n\n**Mechanics:**\n- Buyer of FRA: agrees to pay fixed rate R on notional N for period D/360\n- Seller: agrees to pay floating rate L (SOFR/reference rate)\n- Settlement occurs at the start of the reference period (in advance), not at the end\n\n**FRA Settlement Formula:**\n\nPayment = (L – R) × N × D/360 ÷ (1 + L × D/360)\n\nThe denominator discounts the payment back to the settlement date (since the interest would normally be paid at the end of the period, but FRAs settle in advance).\n\n**Example:**\nA bank locked in a 3×6 FRA (3 months from now, for a 3-month period) at 5.2%. If 3-month SOFR at settlement is 5.8%:\nPayment = (0.058 – 0.052) × $10M × 90/360 ÷ (1 + 0.058 × 90/360)\n= $15,000 ÷ 1.0145 ≈ **$14,786** received by FRA buyer\n\n**Primary users:** Banks hedging short-term rate risk on their loan books and funding gaps; corporations locking in future funding costs on rolling commercial paper programs.",
          highlight: [
            "FRA",
            "forward rate agreement",
            "settlement formula",
            "SOFR",
            "in advance",
            "3×6",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A bank enters a swap as the fixed-rate payer at 5.0%, receiving SOFR. SOFR on the next payment date is 4.5%. What is the bank's net payment on $100M notional (quarterly, 90/360 day count)?",
          options: [
            "Bank pays $125,000 net (pay 5% – receive 4.5% = net 0.5% × $100M × 90/360)",
            "Bank receives $125,000 net because it receives the higher fixed rate",
            "No payment — the swap only settles at maturity",
            "Bank pays $1,125,000 (the full 4.5% floating leg, fixed leg nets to zero)",
          ],
          correctIndex: 0,
          explanation:
            "As fixed-rate payer, the bank pays 5% and receives 4.5% SOFR. Net outflow = (5.0% – 4.5%) × $100M × 90/360 = 0.5% × $100M × 0.25 = $125,000. Only the net difference is exchanged — the notional is never transferred.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A receiver swaption gives its holder the right to receive the fixed rate in an interest rate swap.",
          correct: true,
          explanation:
            "True. A receiver swaption grants the right (but not the obligation) to enter a swap as the fixed-rate receiver — meaning you pay floating and receive fixed. This is valuable when you expect rates to fall, as the fixed rate you locked in will be above market rates at expiry, making the swap immediately in-the-money.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A mid-size manufacturing firm has $50M of floating-rate bank debt priced at SOFR + 200bp. The CFO is forecasting strong revenues but is worried that a 2% rate rise over the next 3 years could add $1M/year to interest costs. The firm wants a ceiling on its borrowing cost but does not want to eliminate the benefit if rates fall.",
          question:
            "Which interest rate derivative best addresses this need?",
          options: [
            "Buy a 3-year interest rate cap — limits the maximum SOFR component while preserving benefit if rates stay low or fall",
            "Enter a pay-fixed interest rate swap — converts all floating exposure to a fixed rate",
            "Sell a 3-year interest rate floor — generates premium income to offset potential rate rises",
            "Buy a payer swaption — gives the right to pay fixed if rates rise above a threshold",
          ],
          correctIndex: 0,
          explanation:
            "An interest rate cap provides exactly what the CFO wants: a guaranteed maximum rate (cap strike + 200bp spread) while retaining the benefit of lower rates if SOFR stays flat or falls. A pay-fixed swap would eliminate downside rate risk but also eliminate the upside from falling rates. Selling a floor generates premium but actually increases exposure to falling rates (opposite of the concern). A payer swaption provides protection only if exercised — but once exercised it becomes a full swap with no downside benefit.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Credit Derivatives ────────────────────────────────────────────
    {
      id: "struct-prod-2",
      title: "Credit Derivatives",
      description:
        "CDS mechanics, CDO tranching, credit indices, and the instruments that defined the 2008 crisis",
      icon: "Shield",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Credit Default Swaps: The Credit Insurance Market",
          content:
            "A **Credit Default Swap (CDS)** transfers the credit risk of a **reference entity** from one party to another.\n\n**Mechanics:**\n- **Protection buyer** pays a periodic premium — the **CDS spread** — quoted in basis points per annum on the notional\n- **Protection seller** receives the spread and, upon a **credit event**, pays the buyer (par – recovery value) × notional\n- Credit events: bankruptcy, failure to pay, restructuring, obligation acceleration\n- **Deliverable obligations:** the protection buyer delivers defaulted bonds; the seller pays par in exchange (physical settlement) — or cash settled at (1 – recovery rate)\n\n**Example:**\nYou buy 5-year CDS protection on Company X at 150bp on $10M notional.\nAnnual premium = $10M × 1.50% = **$150,000/year**\nIf X defaults with 40% recovery rate:\nCDS pays $10M × (1 – 0.40) = **$6,000,000**\n\n**CDS Spread as Credit Risk Indicator:**\nThe CDS market provides a real-time, transparent signal of market-perceived default risk — much faster than credit rating changes. Widening CDS spreads signal deteriorating creditworthiness.\n\nApproximate default probability: P(default/year) ≈ CDS Spread ÷ (1 – Recovery Rate)\nAt 300bp spread, 40% recovery: P ≈ 0.03 ÷ 0.60 = **5% per year**\n\n**Naked CDS:** Buying CDS without owning the underlying bond is equivalent to a short position on the reference entity's credit — providing price discovery but also speculative leverage.",
          highlight: [
            "CDS",
            "credit default swap",
            "protection buyer",
            "CDS spread",
            "credit event",
            "recovery rate",
            "reference entity",
            "deliverable obligations",
          ],
        },
        {
          type: "teach",
          title: "CDO & CLO Structures: Tranching Credit Risk",
          content:
            "**Collateralized Debt Obligation (CDO):**\nA CDO pools hundreds of bonds or loans and issues **tranched** securities that absorb losses in a waterfall structure.\n\n| Tranche | Rating | First loss? | Yield |\n|---------|--------|-------------|-------|\n| Equity (0–3%) | NR | Yes — absorbs first losses | Highest (~20%+) |\n| Mezzanine (3–10%) | BBB–BB | After equity exhausted | Medium |\n| Senior (10–100%) | AAA | Last — requires 10%+ losses | Lowest |\n\n**Correlation risk:** The tranching model assumes defaults are *independent*. When correlations spike (2008: all mortgages defaulted together), even AAA tranches face losses. This is the critical flaw that brought down the CDO market.\n\n**Synthetic CDO:** Instead of owning actual bonds, a synthetic CDO uses CDS contracts as the reference portfolio. This allows unlimited notional exposure — the same mortgage risk could be sold and resold through multiple synthetic CDOs, amplifying systemic risk.\n\n**CLO (Collateralized Loan Obligation):**\nA modern CLO securitizes **leveraged loans** (floating-rate, below-investment-grade corporate loans). The CLO manager actively manages the loan pool within defined guidelines. CLOs today are the primary buyers of leveraged loans — funding the private equity buyout market. Unlike 2008 CDOs, CLOs have performed well through defaults because leveraged loans have higher recovery rates and the structures are more robust.",
          highlight: [
            "CDO",
            "CLO",
            "tranche",
            "senior",
            "mezzanine",
            "equity tranche",
            "correlation risk",
            "synthetic CDO",
            "leveraged loans",
          ],
        },
        {
          type: "teach",
          title: "Credit Indices: CDX, iTraxx & Index Options",
          content:
            "**Credit Indices** allow investors to trade a diversified basket of CDS in a single transaction — providing efficient credit market access and hedging.\n\n**CDX (North America):**\n- CDX.NA.IG: 125 investment-grade North American corporate names, 5-year standard maturity\n- CDX.NA.HY: 100 high-yield names — more volatile, wider spreads\n- New series rolls every 6 months (March and September) with updated constituent lists\n\n**iTraxx (Europe):**\n- iTraxx Europe: 125 European IG names\n- iTraxx Crossover: 75 European HY and sub-IG names — the most actively traded HY credit index in Europe\n\n**On-the-run vs. Off-the-run:**\nThe most recent series is \"on-the-run\" — most liquid, tightest bid/ask. Prior series become \"off-the-run\" after the next roll, with lower liquidity.\n\n**Credit Index Options:**\nOptions on CDX/iTraxx indices (index swaptions) allow hedging or expressing views on direction and volatility of credit spreads.\n- **Credit skew:** OTM put options on credit indices (protection against spread widening) typically trade at a premium vs. OTM calls — similar to equity put skew, reflecting asymmetric tail risk perception\n- Index options are used by hedge funds for macro credit bets and by banks to hedge structured credit book volatility",
          highlight: [
            "CDX",
            "iTraxx",
            "credit index",
            "on-the-run",
            "off-the-run",
            "series roll",
            "credit skew",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An investor buys $10M notional of CDS protection on Company ABC at 100bp per annum. What is the annual premium payment?",
          options: [
            "$100,000 per year (100bp = 1.00% × $10M)",
            "$1,000,000 per year (100bp × $10M, no conversion needed)",
            "$10,000 per year (100bp = 0.10% × $10M)",
            "$500,000 per year (premium paid semi-annually × 2)",
          ],
          correctIndex: 0,
          explanation:
            "100 basis points = 1.00% per annum. Annual CDS premium = 1.00% × $10,000,000 = $100,000 per year. CDS spreads are quoted in basis points per annum; 1bp = 0.01%. So 100bp = 1%, giving a $100,000 annual premium on a $10M notional.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The buyer of CDS protection is effectively short the reference credit — benefiting if the reference entity's creditworthiness deteriorates.",
          correct: true,
          explanation:
            "True. A CDS protection buyer profits if the reference entity's credit quality worsens (spreads widen) or if it defaults (the seller pays out). This is economically equivalent to being short the credit — similar to shorting a bond. The protection seller is long credit risk, profiting from stability and tightening spreads.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A structured finance deal issues a $500M CDO backed by corporate bonds. The deal is tranched: $350M senior (AAA, absorbs losses only after 30% of the pool defaults), $100M mezzanine (BBB, absorbs losses after equity is exhausted), and $50M equity (first-loss tranche). The underlying loan pool experiences 8% defaults with 40% recovery rate, meaning 4.8% net losses on the pool ($24M).",
          question:
            "Which tranches absorb losses and how much does each absorb?",
          options: [
            "Equity tranche absorbs all $24M — senior and mezzanine are unaffected since losses are below the 10% mezzanine attachment point",
            "Losses are distributed pro-rata: senior absorbs $16.8M, mezzanine $4.8M, equity $2.4M",
            "Mezzanine absorbs all $24M because the equity tranche was over-collateralized",
            "Senior absorbs $24M first since it has the largest face value",
          ],
          correctIndex: 0,
          explanation:
            "In a CDO waterfall, the equity tranche absorbs all first losses. The equity tranche is $50M (10% of $500M pool). Net losses are $500M × 4.8% = $24M, which is less than the $50M equity cushion. Therefore, the equity tranche absorbs the full $24M, while the mezzanine and senior tranches suffer zero losses. Senior is protected until total losses exceed 30% — far above the 4.8% actual losses.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Equity-Linked Structured Products ──────────────────────────────
    {
      id: "struct-prod-3",
      title: "Equity-Linked Structured Products",
      description:
        "Principal protected notes, autocallables, reverse convertibles, and leveraged certificates",
      icon: "BarChart2",
      xpReward: 80,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Principal Protected Notes: Zero Coupon + Call Option",
          content:
            "A **Principal Protected Note (PPN)** guarantees the return of invested capital at maturity while offering participation in equity upside — constructed by splitting the investment into two components.\n\n**Construction example (5-year PPN, 5% interest rate environment):**\n1. Invest **$952** today in a zero-coupon bond — it grows to $1,000 at maturity (5% discount)\n2. Use the remaining **$48** to buy a 5-year at-the-money call option on the S&P 500\n3. If S&P 500 rises 60%: investor receives $1,000 + participation in the gain\n4. If S&P 500 falls 50%: investor receives $1,000 — option expires worthless, bond redeems\n\n**Participation Rate:**\nDetermined by how much call option the remaining capital can buy.\nIf the call costs 8% of notional: $48 / $80 = **60% participation rate**\n(Only 60% of the S&P gain is passed through, not 100%)\n\n**Why banks create PPNs:**\n- Banks issue the note cheaply (below their funding cost)\n- They hedge the call option by delta-hedging their own position\n- The spread between note yield and actual borrowing cost is the bank's profit\n\n**Key risks for investors:**\n- **Issuer credit risk:** If the bank fails, principal protection is lost\n- **Illiquidity:** PPNs trade in thin secondary markets — selling early means haircuts\n- **Participation rate below 100%:** In low-rate environments, zero-coupon bonds are cheap but call options are expensive, squeezing participation\n- **Opportunity cost:** Money locked for 5+ years with capped upside",
          highlight: [
            "PPN",
            "zero-coupon bond",
            "call option",
            "participation rate",
            "principal protection",
            "issuer credit risk",
          ],
        },
        {
          type: "teach",
          title: "Autocallables: Conditional Coupons & Barrier Knock-In",
          content:
            "An **autocallable** structured note is automatically redeemed early (\"called\") if the underlying index is at or above a trigger level on periodic observation dates — paying a coupon premium for the early redemption.\n\n**Typical autocallable structure (3-year, quarterly observations):**\n- Initial level: 100% (e.g., EURO STOXX 50 at 4,000)\n- Autocall barrier: 100% (index must be ≥ starting level)\n- Coupon if called: 8% per year (paid pro-rata to call date)\n- Barrier knock-in: 70% (if index falls below 2,800 at maturity, investor suffers losses)\n\n**Observation outcomes:**\n- Quarter 4 (1 year): Index at 102% → **Called** at par + 8% coupon\n- If not called all 12 quarters: If index above 70% at maturity → principal returned; if below 70% → investor participates in full loss from 100% down\n\n**Step-up coupons:** More sophisticated structures offer increasing coupons for each observation date the note survives without being called — compensating for longer exposure time.\n\n**Why issuers create autocallables:**\n- The embedded barrier structure lets the issuer sell a knock-in put option — collecting substantial premium to fund the attractive coupon\n- The autocall feature limits the issuer's coupon liability when markets perform well\n\n**Investor risks:** The barrier knock-in creates **asymmetric risk** — limited upside (capped at coupon) but potentially full downside below barrier. Autocallables perform poorly in bear markets with high volatility.",
          highlight: [
            "autocallable",
            "observation date",
            "autocall barrier",
            "barrier knock-in",
            "conditional coupon",
            "step-up coupon",
          ],
        },
        {
          type: "teach",
          title: "Certificates, Warrants & Reverse Convertibles",
          content:
            "**Leveraged Certificates (Mini Futures):**\nProvide leveraged long or short exposure to an underlying asset without an expiry date — using a stop-loss level instead of a knockout barrier on a specific date. If the underlying hits the stop-loss, the certificate terminates and returns residual value.\n\n**Discount Certificates:**\nEquivalent to a **bull put spread** — the investor buys the underlying at a discount to spot in exchange for capping the maximum gain at a pre-set level.\nPayoff: min(S_T, Cap Level) — maximum gain is the cap; maximum loss is discounted purchase price.\nUsed in sideways or mildly bullish markets to enhance yield.\n\n**Reverse Convertibles:**\nThe investor receives an above-market coupon (e.g., 12%/year) and effectively **sells a put option** on the underlying stock.\n- At maturity: if stock above barrier → receive principal + coupon (ideal outcome)\n- At maturity: if stock below barrier → receive depreciated **shares** instead of cash, plus the coupon\n- The high coupon compensates for writing the put, but rarely covers a severe stock decline\n\n**Key risks for all structured products:**\n1. **Counterparty risk:** If the issuing bank defaults, investors may lose everything regardless of barrier protection\n2. **Barrier breach:** A single intraday print below the barrier (continuous monitoring) can trigger the worst outcome\n3. **Early redemption:** Autocall shortens duration unpredictably — reinvestment risk at lower yields\n4. **Complexity:** Retail investors frequently misunderstand the downside scenarios",
          highlight: [
            "leveraged certificate",
            "discount certificate",
            "reverse convertible",
            "bull put spread",
            "counterparty risk",
            "continuous barrier",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A 5-year PPN is constructed with a zero-coupon bond using 75% of the $1,000 investment ($750 grows to $1,000 at maturity). The remaining $250 is used to buy call options priced at 5% of notional ($50 each). What is the effective participation rate?",
          options: [
            "500% — $250 buys 5 call options, each covering 100% of notional",
            "25% — only $250 of the $1,000 is in calls, so only 25% participates",
            "125% — $250 buys 5 call options × 25% coverage = 125% participation",
            "100% — the standard participation rate for all PPNs",
          ],
          correctIndex: 2,
          explanation:
            "With $250 remaining after the zero-coupon bond and call options costing $50 each (5% of $1,000 notional), the investor buys $250 ÷ $50 = 5 call options. Each call option covers 100% of the $1,000 notional. Effective participation = 5 calls × (notional/$1,000) = 500%... but these calls are on 5× the notional relative to the investment amount. Net participation = $250/$1,000 × (100%/5%) = 25% × 5 = 125%. The investor captures 125% of the S&P upside.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "In an autocallable structured note with a 70% knock-in barrier, the investor faces full downside participation below 70% only if the underlying is at or below 70% on any observation date during the product's life.",
          correct: false,
          explanation:
            "False. For most autocallable structures, the knock-in barrier is typically observed at maturity only (European barrier), not on each quarterly observation date (which tests only the autocall trigger). If the barrier is breached intraday during the product's life on a continuous monitoring basis, that is a different (stricter) structure — but the standard autocallable uses a maturity-only barrier for the knock-in, while observation dates test only whether to call the note early.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A retail investor with moderate risk tolerance is considering two products linked to a single blue-chip stock: (A) a 1-year reverse convertible paying 14% coupon with a 75% barrier, and (B) a 2-year principal protected note with 70% participation in the stock's upside. The investor's primary goal is capital preservation, but they would like some equity upside.",
          question:
            "Which product better matches the investor's stated goal and why?",
          options: [
            "Product B (PPN) — principal is fully protected at maturity; reverse convertible can result in partial principal loss if stock falls below the 75% barrier",
            "Product A (reverse convertible) — the 14% coupon provides a larger buffer against losses than the PPN's 70% participation rate",
            "Product A (reverse convertible) — shorter duration means less risk exposure, better for a conservative investor",
            "Both are equally suitable — the barrier in the reverse convertible is equivalent to the PPN's capital protection",
          ],
          correctIndex: 0,
          explanation:
            "For a capital preservation-focused investor, the PPN is clearly superior: it guarantees return of the $1,000 principal at maturity regardless of stock performance. The reverse convertible is far riskier for capital preservation — if the stock falls 30% (below the 75% barrier), the investor receives depreciated shares worth perhaps $700 plus the $140 coupon = $840 total, a net loss of $160. A 14% coupon sounds attractive but does not fully compensate for severe stock declines.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Commodity & FX Derivatives ─────────────────────────────────────
    {
      id: "struct-prod-4",
      title: "Commodity & FX Derivatives",
      description:
        "Asian options, FX risk reversals, barrier options, accumulators, and weather derivatives",
      icon: "Globe",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Commodity Options: Asian, Barrier & Spread Options",
          content:
            "**Asian Options (Average Price Options):**\nThe payoff references the **average price** of the commodity over the option's life, not the final spot price.\n\n- Asian call payoff: max(Avg_Price – K, 0)\n- Asian put payoff: max(K – Avg_Price, 0)\n\n**Why Asian options dominate commodity markets:**\n1. **Manipulation resistance:** No single settlement price can be artificially pushed on expiry day — averaging over months makes it prohibitively expensive to manipulate\n2. **Lower premium:** Averaging reduces effective volatility, making Asian options 20–40% cheaper than vanilla options\n3. **Matches corporate cash flows:** A refinery that continuously buys oil throughout a month wants protection against the *average* monthly price, not a single day's price\n\n**Barrier Options in Commodities:**\nKnock-out calls are popular in commodity hedging — a copper producer might buy a down-and-out put that provides downside protection but is cancelled if copper prices rise (above the knock-out) — they no longer need the put if prices are already high.\n\n**Spread Options:**\n- **Crack spread option:** Call on the spread between refined products (gasoline, heating oil) and crude oil — critical for refineries. Payoff = max(Gasoline_price – Crude_price – K, 0)\n- **Spark spread option:** Call on the spread between power prices and natural gas (fuel cost) — used by power generators. If spark spread is negative (gas cost exceeds power revenue), the generator's margin is squeezed.",
          highlight: [
            "Asian option",
            "average price",
            "manipulation resistance",
            "knock-out",
            "crack spread",
            "spark spread",
            "barrier option",
          ],
        },
        {
          type: "teach",
          title: "FX Options: Vanilla, Barriers & Risk Reversals",
          content:
            "**FX Option Equivalences:**\nA **USD call / EUR put** (right to buy USD by paying EUR) is *identical* to a **EUR put / USD call** — they are two names for the same instrument, viewed from each currency's perspective.\n\n**Vanilla FX Options:**\n- American-style FX options (early exercise possible) are common in retail and corporate markets\n- European-style preferred for institutional use (easier to price and hedge)\n- FX options quoted in implied volatility — the vol directly prices in the forward and discount curve\n\n**FX Risk Reversals (25-delta):**\nThe risk reversal (RR) measures the difference in implied volatility between 25-delta calls and 25-delta puts:\n\nRR = IV(25Δ call) – IV(25Δ put)\n\n- RR > 0: calls are more expensive (market prices in more upside risk than downside)\n- RR < 0: puts are more expensive (market prices in downside tail risk — common in USDJPY, where JPY tends to strengthen in crises)\n\nRisk reversals reveal **implied skew** — the directional bet embedded in the vol surface.\n\n**FX Barrier Options:**\nExtremely common in institutional FX:\n- **EURUSD knock-out call:** European exporter buys a EURUSD call (right to sell USD at 1.10) that expires worthless if EURUSD ever trades below 1.05 — cheaper than vanilla since the protection is automatically removed in favorable territory for the exporter\n- **Double no-touch:** Pays a fixed amount if EURUSD stays within a corridor (e.g., 1.05–1.15) for 3 months — used by range-expecting traders to collect premium",
          highlight: [
            "USD call",
            "EUR put",
            "risk reversal",
            "25-delta",
            "implied skew",
            "knock-out",
            "double no-touch",
            "vol surface",
          ],
        },
        {
          type: "teach",
          title: "Accumulators, Commodity Bonds & Weather Derivatives",
          content:
            "**FX/Equity Accumulators:**\nAn accumulator forces the buyer to purchase a fixed amount of an asset at a discounted forward price on each fixing date — regardless of where the spot price is.\n\n- The buyer receives the asset at a 5–10% discount to today's spot each week\n- If the asset drops sharply, the buyer is **forced to accumulate** losses week after week with no exit\n- Popular in Asia pre-2008 for FX hedging; nicknamed \"I'll kill you later\" by traders\n- A knock-out feature terminates the accumulator if the asset rises above an upper barrier (limiting the seller's risk)\n\n**Commodity-Linked Bonds:**\nBonds where the coupon or principal redemption is tied to a commodity price:\n- Oil-linked bonds: principal is repaid at par × (oil price at maturity / oil price at issuance)\n- Used by commodity-producing countries (Venezuela, Gulf states) to align debt service with their natural resource revenues\n\n**Weather Derivatives:**\nContracts whose payoffs are based on weather measurements, not financial prices.\n- **HDD (Heating Degree Days):** measures cold weather — each day where average temperature is below 65°F adds HDDs\n- **CDD (Cooling Degree Days):** measures hot weather demand for cooling\n- A utility company that loses revenue when winter is warm buys an HDD swap — if total winter HDDs fall below 2,000, the counterparty pays the utility for lost heating demand\n- Weather derivatives are actively traded by energy companies, agricultural firms, and insurers",
          highlight: [
            "accumulator",
            "commodity-linked bond",
            "weather derivative",
            "HDD",
            "CDD",
            "knock-out",
            "unlimited downside",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Why are Asian (average price) options typically used in commodity markets rather than vanilla options?",
          options: [
            "Averaging reduces the effective volatility and prevents settlement price manipulation, making them cheaper and more suitable for continuous commodity hedgers",
            "Asian options can only be exercised early, which matches commodity delivery schedules better than European options",
            "Asian options are more expensive than vanilla options, providing better protection for commodity producers",
            "Averaging removes the need for a strike price, simplifying the hedging process",
          ],
          correctIndex: 0,
          explanation:
            "Asian options are preferred in commodity markets for two reasons: (1) averaging over the period reduces the effective volatility input, making the premium 20–40% cheaper than a vanilla with the same strike, and (2) the settlement price cannot be manipulated on a single day since it represents the average of many fixing dates. Commodity companies that buy or sell continuously throughout the month also find that average-price protection better matches their actual economic exposure.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A USD/EUR call option and an EUR/USD put option are different instruments representing opposite market views.",
          correct: false,
          explanation:
            "False. A USD call / EUR put (right to buy USD by paying EUR) and an EUR put / USD call are the exact same instrument — simply described from each currency's perspective. Both give the holder the right to buy USD and sell EUR at the agreed strike rate. In FX, every option is simultaneously a call on one currency and a put on the other because currencies trade in pairs.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An international airline has significant USD revenues (ticket sales) but incurs costs in EUR (European operations) and pays for jet fuel priced in USD. The finance team wants to hedge two risks for the next 12 months: (1) EUR strengthening against USD eroding the USD value of EUR costs, and (2) jet fuel prices spiking above $90/barrel.",
          question:
            "Which combination of derivatives best addresses both hedging needs?",
          options: [
            "Buy EUR/USD call options (protecting against EUR strength) + Buy crude oil Asian call options (capping average fuel cost) — both targeted and cost-efficient",
            "Enter EUR/USD forward contracts (fixing the exchange rate completely) + Buy crude oil vanilla put options (protecting against oil falling)",
            "Sell EUR/USD put options (collect premium since EUR weakening helps the airline) + Buy crack spread options on jet fuel",
            "Buy USD/EUR puts (equivalent to EUR calls) for the FX risk, and enter crude oil futures for full price fixation on fuel",
          ],
          correctIndex: 0,
          explanation:
            "The airline needs call options on EUR (EUR/USD calls protect against EUR strengthening, which increases the USD cost of EUR expenses) and needs call options on crude oil (capping the average purchase price of jet fuel over the year). Asian oil calls are ideal — the airline buys fuel continuously, so average-price protection is most economical. Forward contracts would eliminate all FX flexibility; vanilla oil puts would protect against falling prices (not the airline's concern). Selling EUR puts would add risk, not hedge it.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Volatility Products ───────────────────────────────────────────
    {
      id: "struct-prod-5",
      title: "Volatility Products",
      description:
        "VIX mechanics, variance swaps, dispersion trading, and the full spectrum of volatility instruments",
      icon: "Activity",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "VIX & Volatility Indices: Measuring Market Fear",
          content:
            "The **VIX** (CBOE Volatility Index) is a real-time measure of the market's expectation for **30-day implied volatility** on the S&P 500, derived from a model-free formula using the entire option chain.\n\n**VIX Calculation (simplified):**\nVIX² = (2/T) × Σ [ΔK/K²] × e^(rT) × Q(K) — integrated over all strikes K with non-zero open interest, where Q(K) is the mid-price of the call (above F) or put (below F) at strike K.\n\nThis is **model-free implied volatility** — it makes no assumption about the return distribution and captures the full vol surface, including skew and kurtosis.\n\n**VIX Futures Term Structure:**\n- In calm markets: **contango** (front-month VIX futures < back-month) — market prices in mean-reversion from calm today to higher future vol\n- In crises: **backwardation** (spot VIX spikes far above futures) — market expects current panic to subside\n\n**VIX ETPs (Exchange-Traded Products):**\n\n| Product | Strategy | Contango Impact |\n|---------|----------|-----------------|\n| VXX | Long 1st+2nd month VIX futures (30-day constant maturity) | Loses 5–10%/month in normal contango |\n| UVXY | 1.5× leveraged VXX | Magnified losses + vol decay |\n| SVXY | Short VIX futures (0.5× inverse) | Profits steadily in contango; catastrophic in vol spikes |\n| VIXM | Mid-term VIX futures (4–7 months) | Lower contango drag than VXX |\n\n**Roll Yield Drag:** Long VIX ETP holders continuously buy high (next month) and sell low (expiring front month) in contango — a structural headwind that erodes value even when spot VIX is stable.",
          highlight: [
            "VIX",
            "model-free implied volatility",
            "contango",
            "backwardation",
            "VXX",
            "UVXY",
            "SVXY",
            "roll yield",
            "VIX futures",
          ],
        },
        {
          type: "teach",
          title: "Variance Swaps: Pure Volatility Exposure",
          content:
            "A **variance swap** exchanges **realized variance** over a period for a fixed variance strike — providing clean volatility exposure without delta hedging.\n\n**Payoff:**\nVariance Swap Payoff = N_var × (σ²_realized – K²_var)\n\nWhere:\n- N_var = variance notional (in dollars per variance point)\n- σ²_realized = annualized realized variance = (252/T) × Σ ln²(S_t/S_{t-1})\n- K²_var = strike variance (agreed at inception, typically ≈ ATM implied vol²)\n\n**Vega notional conversion:**\nVega notional = Variance notional × 2 × K_var\n(Since a $100K vega notional variance swap has variance notional = $100K / (2 × K_var))\n\n**Variance vs Volatility Swaps:**\n- Variance swaps: payoff in variance points — convex in volatility (buyer benefits from vol-of-vol)\n- Volatility swaps: payoff linear in realized vol — require additional convexity adjustment to price\n- Variance swaps are more liquid and easier to replicate via a log contract (static strip of options)\n\n**Variance Risk Premium (VRP):**\nImplied volatility consistently exceeds realized volatility on average — the VRP is the compensation earned by variance sellers for bearing tail risk. Empirically 1–3 vol points on average for S&P 500, but can reverse dramatically in crises. Short variance strategies (selling realized vol through variance swaps) generate steady carry but face catastrophic loss in vol spikes.",
          highlight: [
            "variance swap",
            "realized variance",
            "variance strike",
            "vega notional",
            "log contract",
            "variance risk premium",
            "volatility swap",
          ],
        },
        {
          type: "teach",
          title: "Volatility Arbitrage: Dispersion, Correlation & Vol Surface Trading",
          content:
            "**Dispersion Trading:**\nSells index volatility and buys single-stock volatility simultaneously.\n\nRationale: Index implied vol includes a **correlation premium** — the market systematically overestimates how correlated stocks will be during stress. Single-stock vols are often underpriced relative to index vol after adjusting for correlation.\n\nP&L = Long single-stock realized vol – Short index realized vol\nProfits when stocks move a lot independently but not together (low realized correlation).\n\n**Correlation Trading:**\nDirectly trade the difference between implied and realized correlation.\n- Buy correlation: profits in crises when all stocks crash together (realized corr spikes)\n- Sell correlation: profits in calm markets when stocks diverge on fundamentals\n\n**Vol Surface Arbitrage:**\n- **Calendar spread:** Buy near-term vol, sell far-term vol (or vice versa) — exploits mispricing in the term structure\n- **Butterfly:** Buy ATM vol, sell wings — profits from non-linear pricing in the vol surface\n- **Skew trade:** If 25Δ put vol is too expensive relative to ATM vol, sell skew (risk reversal)\n\n**Realized vs Implied Vol Trading:**\nThe classic options P&L formula:\nDaily P&L ≈ (1/2) × Γ × S² × (σ²_realized – σ²_implied)\n\nIf you continuously delta-hedge a long option position and realized vol exceeds implied vol, you profit — this is the fundamental basis of volatility trading.",
          highlight: [
            "dispersion trading",
            "correlation premium",
            "realized correlation",
            "vol surface arbitrage",
            "calendar spread",
            "butterfly",
            "skew trade",
            "delta hedge",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A trader holds a long position in VXX (a long VIX futures ETP) for 6 months during which the VIX index remains steady at 15. Why does the trader likely lose money despite VIX not falling?",
          options: [
            "VIX futures are in contango — rolling the position each month means buying the next-month contract at a higher price, creating a persistent drag",
            "VXX pays monthly dividends to short sellers that reduce the NAV proportionally",
            "The CBOE adjusts the VIX index downward monthly to normalize for seasonal patterns",
            "Long VXX positions decay exponentially at the risk-free rate like any leveraged product",
          ],
          correctIndex: 0,
          explanation:
            "When VIX futures are in contango (a normal market condition), the front-month futures price is below the next month's price. Rolling a long VIX futures position requires selling the cheaper expiring contract and buying the more expensive next-month contract. Even if spot VIX stays at 15, the roll creates a consistent monthly loss — typically 5–10% of position value per month in calm markets. This contango drag is the primary structural headwind for all long-VIX ETPs.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The payoff of a variance swap is calculated as: Notional × (realized variance – variance strike), where a positive payoff goes to the variance buyer.",
          correct: true,
          explanation:
            "True. The variance buyer (long variance) profits when realized variance exceeds the variance strike — i.e., when actual market volatility is higher than expected. The payoff is: N_var × (σ²_realized – K²_var). If σ²_realized = 0.04 (20% vol) and K²_var = 0.0225 (15% vol strike), the buyer receives N_var × (0.04 – 0.0225) = N_var × 0.0175. The buyer effectively bought realized volatility cheaply.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A volatility hedge fund manager observes that S&P 500 3-month implied volatility is at 22%, while single-stock implied vols for the S&P 500 constituents average 28%. The fund's models suggest that the implied correlation priced into the index vol (≈50%) is significantly higher than the average realized correlation over the past year (≈32%). The manager wants to exploit this discrepancy.",
          question:
            "Which volatility strategy is most directly designed to profit from this observation?",
          options: [
            "Dispersion trade: sell S&P 500 variance swaps (short index vol) and buy variance swaps on the largest individual constituents (long single-stock vol) — profits when realized correlation stays low",
            "Buy S&P 500 VIX futures to profit from the elevated 22% implied vol",
            "Buy long-dated S&P 500 calls and sell short-dated calls (calendar spread) to exploit the term structure",
            "Sell 25-delta S&P 500 put options to collect the high implied vol premium above realized vol",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook dispersion trade setup. The key observation is that index implied vol (22%) embeds a correlation assumption (~50%) that is significantly higher than historical realized correlation (~32%). By selling index variance (short index vol) and buying single-stock variance on constituents (long single-stock vol), the fund profits when stocks move a lot individually but not in lockstep — i.e., when realized correlation stays low. The P&L is driven by the correlation premium returning to reality. Simply buying VIX futures would be long volatility — the opposite direction for most of the position.",
          difficulty: 3,
        },
      ],
    },
  ],
};
