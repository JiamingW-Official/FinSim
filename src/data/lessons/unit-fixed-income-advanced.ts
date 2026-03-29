import { Unit } from "./types";

export const UNIT_FIXED_INCOME_ADVANCED: Unit = {
  id: "fixed-income-advanced",
  title: "Fixed Income Advanced",
  description:
    "Master yield curve dynamics, duration and convexity, credit spread analysis, and fixed income derivatives for professional bond portfolio management",
  icon: "BarChart3",
  color: "#B45309",
  lessons: [
    // ─── Lesson 1: Yield Curve Analysis ───────────────────────────────────────────
    {
      id: "fixed-income-advanced-1",
      title: "Yield Curve Analysis",
      description:
        "Yield curve shapes, economic signals, theories of the term structure, butterfly trades, yield curve control, and inflation breakeven frameworks",
      icon: "BarChart3",
      xpReward: 80,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Yield Curve Shapes & Economic Signals",
          content:
            "The yield curve plots interest rates (yields) across different maturities for the same issuer (typically government bonds). Its shape encodes market expectations about growth, inflation, and monetary policy.\n\n**Four primary shapes**:\n\n**Normal (upward-sloping)**: Short-term yields < long-term yields. The baseline state — reflects expectations of economic growth and modest inflation. Investors demand a term premium for lending longer.\n\n**Inverted (downward-sloping)**: Short-term yields > long-term yields. The recession predictor — reflects expectations that the central bank will cut rates in the future (because of an anticipated downturn). The **2s10s spread** (10-year minus 2-year Treasury yield) is the most-watched inversion metric.\n\n**Flat**: Short and long-term yields are similar. A transition state, often seen as the economy approaches a turning point — either a peak before inversion or a trough before re-steepening.\n\n**Humped (bell-shaped)**: Medium-term yields are highest; short and long yields are lower. Relatively rare, often seen when the market expects rates to rise then fall.\n\n**The 2s10s inversion as a recession predictor**:\n- Every US recession since 1955 has been preceded by a 2s10s inversion\n- The inversion typically leads the recession by **6–24 months** (variable lead time)\n- The 2022–2023 inversion was the deepest since the 1980s\n- False positives exist (mid-1960s) — it is a probabilistic signal, not a guarantee",
          highlight: [
            "yield curve",
            "2s10s spread",
            "inverted",
            "normal",
            "flat",
            "humped",
            "recession predictor",
          ],
        },
        {
          type: "teach",
          title: "Term Structure Theories",
          content:
            "Three main theories explain why the yield curve takes different shapes:\n\n**Expectations Theory (Pure)**:\n- Long-term yields are simply the geometric average of expected future short-term rates\n- A 2-year yield = average of today's 1-year rate + expected 1-year rate one year from now\n- Implication: an upward-sloping curve means the market expects rates to rise; inverted curve means expected rate cuts\n- Weakness: does not explain why long-term yields are almost always above short-term yields — the 'term premium' is missing\n\n**Liquidity Premium Theory**:\n- Extends expectations theory by adding a term premium that rises with maturity\n- Investors demand extra compensation for price risk, liquidity risk, and uncertainty over future rates\n- Explains why normal curves slope upward even when rates are not expected to rise\n- The term premium is not directly observable; the NY Fed estimates it via models (ACM model)\n\n**Market Segmentation Theory**:\n- Different maturity segments are governed by distinct supply and demand from different investor types\n- Banks and money market funds prefer short maturities; pension funds and insurers prefer long maturities\n- Yields in each segment are determined independently by their respective buyers and sellers\n- Explains 'humped' curves where specific maturity segments face excess supply\n\n**Preferred Habitat (hybrid)**:\n- Investors have preferred maturities but will venture out for sufficient yield premium\n- Combines segmentation with the ability of yield differentials to attract cross-segment flows",
          highlight: [
            "expectations theory",
            "liquidity premium",
            "market segmentation",
            "term premium",
            "preferred habitat",
          ],
        },
        {
          type: "teach",
          title: "Butterfly Trades, Yield Curve Control & Spread Measures",
          content:
            "**Butterfly trade — a non-directional yield curve bet**:\nA butterfly trade expresses a view on the curve's shape: the 'wings' (short and long ends) vs the 'belly' (medium term).\n\n- **Long butterfly** (long wings / short belly): Buy 2s and 10s, sell 5s. Profits if 5-year yields rise relative to the wings — the curve humps up in the middle.\n- **Short butterfly** (short wings / long belly): Sell 2s and 10s, buy 5s. Profits if the belly richens relative to the wings.\n- Butterfly trades are duration-neutral: a parallel rate shift generates zero P&L.\n\n**Yield Curve Control (YCC) — Bank of Japan case study**:\n- The BOJ introduced YCC in September 2016, pegging the 10-year JGB yield near 0%\n- The central bank commits to buying unlimited bonds to defend the target level\n- Effect: compresses term premium, flattens curve, forces investors offshore to seek yield\n- In 2022–2023, defending the cap required massive bond purchases — the BOJ owned 50%+ of the JGB market\n- YCC was eventually abandoned in 2024 as inflation returned to Japan\n\n**Key spread measures**:\n- **Swap spread** = Swap rate (fixed leg of interest rate swap) − Treasury yield (same maturity). Reflects bank credit risk and supply/demand for swaps. Negative swap spreads (swap rate < Treasury) occurred in the US post-2010.\n- **OIS spread** (Overnight Indexed Swap spread) = interbank rate − OIS rate. Tracks interbank credit and liquidity stress. The OIS spread spiked to 365bps in October 2008 — a real-time measure of the financial crisis.\n- **Breakeven inflation rate** = Nominal Treasury yield − TIPS real yield. Represents market-implied expected inflation over the maturity horizon.\n- **Real yield framework**: The 10-year TIPS yield is the 'real yield' — the return above inflation. Negative real yields have historically been very stimulative and bullish for risk assets and gold.",
          highlight: [
            "butterfly trade",
            "long wings short belly",
            "yield curve control",
            "BOJ",
            "swap spread",
            "OIS spread",
            "breakeven inflation",
            "real yield",
            "TIPS",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "The 2-year Treasury yield is 5.2% and the 10-year Treasury yield is 4.4%. A strategist says the 2s10s inversion suggests elevated recession probability with a 6–24 month lead time. Which term structure theory BEST explains why an inverted curve predicts recession?",
          options: [
            "Expectations theory — an inverted curve implies the market expects the Fed to cut rates sharply in the future due to anticipated economic weakness",
            "Liquidity premium theory — shorter maturity bonds command a larger term premium than longer bonds during a crisis",
            "Market segmentation theory — pension funds are selling long-duration bonds and buying short-duration Treasuries",
            "Preferred habitat theory — banks are shifting from short to long maturities, mechanically pushing short yields above long yields",
          ],
          correctIndex: 0,
          explanation:
            "Expectations theory provides the most direct explanation: if short-term yields exceed long-term yields, the market is implying that future short-term rates will be lower than current short-term rates. Investors will only lend short-term at 5.2% if they expect rates will fall (to an average below 4.4% over 10 years). Future rate cuts happen when the Fed responds to economic weakness or recession. This chain of logic — inverted curve → expected rate cuts → expected recession — is the core of the expectations-theory-based recession forecast. Liquidity premium theory actually predicts an upward-sloping curve by adding term premium, making it less suited to explain inversions.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The breakeven inflation rate derived from TIPS is calculated as the nominal Treasury yield minus the TIPS real yield, and a higher breakeven rate indicates that bond markets expect higher future inflation.",
          correct: true,
          explanation:
            "True. The breakeven inflation rate = Nominal Treasury yield − TIPS real yield. For example, if the 10-year nominal Treasury yields 4.5% and the 10-year TIPS yields 2.0%, the breakeven inflation rate is 2.5% — meaning bond markets expect average annual inflation of 2.5% over the next 10 years. If actual inflation exceeds the breakeven, TIPS investors outperform nominal bond investors; if actual inflation falls short, nominal bond investors outperform. The breakeven is a real-time market-based measure of inflation expectations closely watched by the Federal Reserve.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 2: Duration & Convexity ───────────────────────────────────────────
    {
      id: "fixed-income-advanced-2",
      title: "Duration & Convexity",
      description:
        "Modified duration, convexity adjustments, callable bond negative convexity, DV01, portfolio duration management, key rate durations, and immunization",
      icon: "BarChart3",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Modified Duration & Price Approximation",
          content:
            "**Duration** measures a bond's price sensitivity to interest rate changes. It is the most fundamental risk metric in fixed income.\n\n**Modified Duration (MD) formula**:\nMD = Macaulay Duration / (1 + y/m)\n\nWhere:\n- **Macaulay Duration** = weighted average time to receive cash flows (in years)\n- **y** = yield to maturity\n- **m** = coupon payment frequency per year\n\n**Price approximation using Modified Duration**:\n\n**ΔP/P ≈ −MD × Δy**\n\nOr equivalently: ΔP ≈ −MD × P × Δy\n\n**Example**: A bond with price $100, modified duration of 7 years, and yields rise 50bps (0.005):\nΔP ≈ −7 × $100 × 0.005 = −$3.50\nThe bond falls approximately $3.50 to ~$96.50\n\n**Key intuitions**:\n- A zero-coupon bond's duration equals its maturity (all cash flow at the end)\n- A coupon-paying bond's duration is less than its maturity (earlier coupons pull duration in)\n- Higher coupon → lower duration (more weight on near-term cash flows)\n- Higher yield → lower duration (cash flows discounted more heavily)\n- Duration is additive for portfolios: Portfolio Duration = Σ(wi × MDi)",
          highlight: [
            "modified duration",
            "Macaulay duration",
            "price approximation",
            "yield sensitivity",
          ],
        },
        {
          type: "teach",
          title: "Convexity, Callable Bonds & Dollar Duration",
          content:
            "**Convexity — the second-order correction**:\nThe duration approximation is linear, but bond price/yield relationships are curved (convex). Convexity captures this curvature:\n\n**ΔP/P ≈ −MD × Δy + ½ × Convexity × (Δy)²**\n\nFor a standard bullet bond:\n- Price/yield curve bows outward — **positive convexity**\n- Positive convexity means the bond gains more than the linear approximation when yields fall, and loses less when yields rise\n- Higher convexity is always better (all else equal) — investors pay a premium for it\n\n**Callable bonds — negative convexity**:\n- An issuer who can call (redeem) a bond when rates fall introduces an embedded short option\n- When rates fall below the coupon rate, the issuer will call and refinance cheaper → the bond's price appreciation is **capped** near the call price\n- This creates **negative convexity** — as yields fall, duration shortens, capping upside\n- MBS (Mortgage-Backed Securities) exhibit extreme negative convexity due to homeowner prepayment — prepayments accelerate when rates fall, shortening the bond's effective life\n\n**Dollar Duration and DV01**:\n- **Dollar Duration** = MD × Price × 0.01 — the dollar change in bond price for a 1% (100bps) parallel shift in yields\n- **DV01** (Dollar Value of a Basis Point) = MD × Price × 0.0001 — dollar change for a 1bp shift\n- DV01 is the primary risk measure used by bond traders and risk managers\n- Example: DV01 of $10,000 means a 1bp rate rise costs the position $10,000",
          highlight: [
            "convexity",
            "positive convexity",
            "negative convexity",
            "callable bond",
            "MBS",
            "prepayment",
            "dollar duration",
            "DV01",
          ],
        },
        {
          type: "teach",
          title: "Portfolio Duration Management, Key Rate Durations & Immunization",
          content:
            "**Portfolio duration management with futures overlay**:\nPortfolio managers use Treasury futures to adjust portfolio duration without buying/selling bonds:\n- **Target Duration higher**: Buy Treasury futures (positive DV01 exposure)\n- **Target Duration lower**: Sell Treasury futures (negative DV01 exposure)\n- Number of contracts = (Target DV01 − Current DV01) / (DV01 per futures contract)\n- Futures overlay is fast, liquid, and doesn't require liquidating existing holdings\n\n**Key Rate Durations (KRDs) — for non-parallel shifts**:\n- Standard duration assumes a **parallel shift** (all maturities move equally)\n- In reality, curves twist, steepen, and flatten (non-parallel shifts)\n- **Key rate durations** measure sensitivity to a 1bp move at each maturity node (2y, 5y, 10y, 30y) while keeping others constant\n- Example: A barbell portfolio (long 2s and 30s) has high KRDs at both ends but low KRD in the belly\n- KRDs sum to the total modified duration\n\n**Effective Duration for MBS**:\n- For bonds with embedded options: effective duration = (P− − P+) / (2 × P0 × Δy)\n- This measures actual price change in a rate shock scenario (not just cash flow weighted)\n- Also called **option-adjusted duration**\n\n**Duration Matching for Liability-Driven Investing (LDI)**:\n- Pension funds and insurers have long-term liabilities (promises to pay future benefits)\n- **Immunization condition**: Assets duration = Liabilities duration AND Assets PV = Liabilities PV\n- When both conditions are met, small parallel rate changes do not affect the surplus\n- Full immunization also requires assets convexity ≥ liabilities convexity\n- Pension funds use long-duration Treasury strips and corporate bonds for LDI strategies",
          highlight: [
            "futures overlay",
            "key rate durations",
            "parallel shift",
            "non-parallel shift",
            "effective duration",
            "liability-driven investing",
            "immunization",
            "LDI",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A bond portfolio has a modified duration of 8 and a total market value of $50 million. The portfolio manager wants to reduce modified duration to 5 using Treasury futures. Each Treasury futures contract has a DV01 of $900. How many futures contracts must be SOLD to achieve the target duration?",
          options: [
            "Sell approximately 167 contracts — (8−5) × $50M × 0.0001 / $900",
            "Buy approximately 167 contracts — duration reduction requires buying futures",
            "Sell approximately 444 contracts — based on the full duration of 8",
            "Sell approximately 56 contracts — using only the target duration of 5",
          ],
          correctIndex: 0,
          explanation:
            "To reduce duration via a futures overlay: DV01 of portfolio = 8 × $50,000,000 × 0.0001 = $40,000. Target DV01 = 5 × $50,000,000 × 0.0001 = $25,000. Reduction needed = $15,000. Contracts to sell = $15,000 / $900 ≈ 16.7, so sell approximately 17 contracts. Scaling to the formula in Answer A: (8−5) × $50M × 0.0001 / $900 = 3 × 5,000 / 900 ≈ 16.7 → ~17 contracts. The direction must be SELL (short) futures to reduce portfolio duration — selling futures creates a short rate position that offsets the portfolio's long rate exposure. Buying futures would increase duration, not reduce it.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Mortgage-backed securities (MBS) exhibit negative convexity because when interest rates fall, homeowners refinance their mortgages at lower rates, which accelerates principal repayment and shortens the effective duration of the MBS just when investors would prefer it to lengthen.",
          correct: true,
          explanation:
            "True. This is the defining characteristic of MBS and callable bonds — negative convexity caused by embedded prepayment/call options. When rates fall, homeowners rationally refinance (the borrower exercises their implicit call option), returning principal to MBS investors early. Shorter effective duration means the MBS doesn't appreciate as much as a comparable non-callable bond would. Conversely, when rates rise, prepayments slow and the MBS extends in duration (extension risk), meaning it falls in price more than a non-callable bond. This asymmetry — capped upside, extended downside — is negative convexity, and investors demand a spread premium (OAS) to hold it.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Credit Spread Analysis ────────────────────────────────────────
    {
      id: "fixed-income-advanced-3",
      title: "Credit Spread Analysis",
      description:
        "Spread components, OAS vs Z-spread, spread duration, high yield dynamics, fallen angels, rising stars, CDS-bond basis, and credit carry strategies",
      icon: "BarChart3",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Spread Components & Spread Hierarchy",
          content:
            "A corporate bond yield = risk-free rate + credit spread. Breaking down that credit spread reveals its components:\n\n**Investment Grade (IG) spread components**:\n1. **Benchmark risk-free rate**: Government bond yield of equivalent maturity (on-the-run Treasury)\n2. **Liquidity premium**: Compensation for bid-ask spread, market depth, and time to sell. IG corporate bonds are less liquid than Treasuries — investors demand ~10–30bps extra\n3. **Credit premium**: Compensation for the risk of issuer default and expected loss (probability of default × loss given default)\n\nTotal Spread = Liquidity Premium + Credit Premium\n\n**Spread measure hierarchy** — from least to most option-adjusted:\n\n**I-spread** (Interpolated spread): Bond yield minus the interpolated swap rate. Simple but ignores the bond's cash flow timing.\n\n**G-spread** (Government spread): Bond yield minus the government benchmark yield at a matching maturity. Most intuitive; used for cross-market comparisons.\n\n**Z-spread** (Zero-volatility spread): The constant spread added to the entire zero-coupon Treasury curve that makes the PV of cash flows equal to the bond's market price. More accurate than G-spread for non-bullet bonds.\n\n**OAS** (Option-Adjusted Spread): Z-spread after removing the value of any embedded options (call, put, conversion). This is the 'pure' credit spread — the compensation for credit risk alone. For a bullet bond, OAS = Z-spread. For a callable bond, OAS < Z-spread (the call option has positive value to the issuer, reducing the investor's effective compensation).",
          highlight: [
            "credit spread",
            "liquidity premium",
            "credit premium",
            "G-spread",
            "Z-spread",
            "OAS",
            "I-spread",
            "option-adjusted spread",
          ],
        },
        {
          type: "teach",
          title: "Spread Duration, High Yield Dynamics & The BBB Cliff",
          content:
            "**Spread duration vs Interest Rate (IR) duration**:\n- **IR Duration**: Sensitivity to a parallel shift in the risk-free rate curve\n- **Spread Duration**: Sensitivity to a change in the credit spread (risk-free rate unchanged)\n- For IG bonds: spread duration ≈ IR duration (both move together for small spread moves)\n- For floating rate bonds: IR duration ≈ 0, but spread duration can be large (the coupon resets with rates, but spread risk remains)\n- Portfolio managers separate these two risk buckets: rate risk (managed with Treasuries/swaps) and credit risk (managed with credit exposure or CDS)\n\n**High yield spread vs equity volatility**:\n- High yield (HY) bond spreads and the VIX (equity volatility index) are highly correlated — both reflect risk-off sentiment\n- In crises: HY spreads widen dramatically (>1000bps in 2008, >900bps in 2020), mirroring equity selloffs\n- This correlation makes HY bonds behave more like equity — **HY beta to equities ≈ 0.5–0.7**\n\n**Credit spread compression in low-rate environments**:\n- When risk-free rates are near zero, investors 'reach for yield' by moving into lower-quality bonds\n- This demand compresses spreads — HY spreads fell below 400bps in 2021, near historical tights\n- Tight spreads = rich valuations = poor forward returns\n\n**The BBB cliff — fallen angel dynamics**:\n- **BBB** is the lowest investment grade rating (Moody's: Baa); a downgrade to **BB** means the bond becomes high yield ('junk')\n- Institutional mandates (pension funds, IG-only funds) force selling of fallen angels immediately upon downgrade\n- This creates a mechanical forced-sell event that can overshoot intrinsic value\n- **Rising stars** (opposite): HY bonds upgraded to IG — forced buying by IG funds creates a price tailwind\n- Credit investors hunt rising stars before the upgrade to capture the spread compression",
          highlight: [
            "spread duration",
            "IR duration",
            "high yield",
            "VIX correlation",
            "BBB cliff",
            "fallen angel",
            "rising star",
            "spread compression",
          ],
        },
        {
          type: "teach",
          title: "CDS-Bond Basis & Credit Carry Strategies",
          content:
            "**CDS (Credit Default Swap) basics**:\n- A CDS is an insurance contract on a bond issuer's default: the protection buyer pays a periodic spread (in bps per year), the protection seller pays face value if default occurs\n- **CDS spread** for a given issuer reflects the market's assessment of default risk for that credit\n\n**CDS-Bond Basis**:\n- Theoretically: CDS spread ≈ Z-spread (bond spread)\n- In practice, the **basis = CDS spread − bond Z-spread** deviates due to:\n  - Cheapest-to-deliver (CTD) option in CDS: seller can deliver cheapest bond on default\n  - Repo/funding costs: holding a physical bond requires financing\n  - Bond liquidity premium embedded in Z-spread\n- **Negative basis trade**: When CDS spread < bond spread (basis is negative), buy the bond AND buy CDS protection. You earn the net spread with minimal credit risk — a classic arbitrage-like relative value trade.\n- The CDS-bond basis blew out massively in 2008 as funding markets froze and bond spreads spiked far above CDS spreads\n\n**Credit Carry Strategy — Roll-down + Carry**:\n- **Carry**: Earn the bond's spread above risk-free rate (the credit premium) over time\n- **Roll-down**: As time passes, a 5-year bond becomes a 4-year bond. If the credit spread curve is upward-sloping, rolling down the curve generates additional return as the bond's yield compresses\n- Combined: Total return ≈ Risk-free yield + Carry (spread) + Roll-down return\n- Credit carry strategies work well in stable or tightening spread environments; lose money in spread widening (risk-off) events\n- Sharpe ratios are often high in calm periods but exhibit sudden drawdowns — 'picking up nickels in front of a steamroller'",
          highlight: [
            "CDS",
            "CDS-bond basis",
            "negative basis trade",
            "protection buyer",
            "protection seller",
            "carry",
            "roll-down",
            "credit carry strategy",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An investment grade corporate bond has a Z-spread of 180bps and an OAS of 120bps. What does the 60bps difference between Z-spread and OAS most likely represent?",
          options: [
            "The value of the embedded call option — the bond is callable and the issuer's option has a 60bps cost to the investor",
            "The liquidity premium — 60bps of the spread compensates for the bond's illiquidity relative to Treasuries",
            "The credit premium — 120bps goes to default risk and 60bps goes to duration risk",
            "A pricing error — Z-spread and OAS should always be identical for investment grade bonds",
          ],
          correctIndex: 0,
          explanation:
            "OAS = Z-spread minus the value of any embedded options. If the OAS (60bps less than Z-spread) is the 'option-free' credit spread, then the 60bps difference represents the cost of the embedded call option that the investor is effectively shorting. The issuer holds the right to call the bond at par when rates fall — this option has value to the issuer (and is a liability to the investor). The Z-spread includes this option cost; the OAS strips it out to give the pure credit compensation. For bullet (non-callable) IG bonds, Z-spread and OAS are indeed nearly identical. For IG callable bonds (common in corporate debt), this wedge is material.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A hedge fund manager notices that Ford Motor Company bonds (rated BB+, high yield) are trading at a Z-spread of 350bps, while CDS protection on Ford costs only 290bps per year. The fund has access to repo financing for the bonds at a cost of 50bps above the risk-free rate.",
          question:
            "This scenario describes which credit strategy, and what is the approximate net locked-in spread if the trade is executed?",
          options: [
            "A negative basis trade — buy Ford bonds, buy CDS protection; approximate net spread ≈ 10bps (350bps bond spread minus 290bps CDS cost minus ~50bps funding cost)",
            "A long-short credit trade — buy Ford bonds, short Ford equity; capturing the credit-equity convergence premium",
            "A rising star trade — Ford is likely to be upgraded to investment grade, generating spread compression profit",
            "A carry trade — simply hold Ford bonds and earn the 350bps spread as income without hedging",
          ],
          correctIndex: 0,
          explanation:
            "This is a classic negative basis trade: CDS spread (290bps) < Bond Z-spread (350bps), so the basis is −60bps. By buying the bond and simultaneously buying CDS protection, the investor earns the bond spread (350bps) and pays the CDS premium (290bps), netting 60bps. However, subtract funding cost (repo at 50bps above risk-free rate). Net spread ≈ 60bps − 50bps = ~10bps. While slim, this is nearly credit-risk-free exposure — the CDS eliminates default risk while the investor earns the residual basis. In practice, traders also face CTD option risk and mark-to-market volatility in the basis. The negative basis blew out to favorable levels during the 2008 crisis, creating large opportunities for well-funded arbitrageurs.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Fixed Income Derivatives ──────────────────────────────────────
    {
      id: "fixed-income-advanced-4",
      title: "Fixed Income Derivatives",
      description:
        "Interest rate swap pricing, swaptions, caps/floors/collars, bond futures CTD, CMS swaps, asset swaps, inflation swaps, credit index options, and total return swaps",
      icon: "BarChart3",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Interest Rate Swaps, Swaptions & Cap/Floor/Collar",
          content:
            "**Interest Rate Swap (IRS) fundamentals**:\nAn IRS is a bilateral agreement to exchange fixed cash flows for floating cash flows (typically SOFR or EURIBOR) on a notional amount.\n\n**Par swap rate pricing**:\nThe fixed rate is set so that the NPV of both legs is equal at inception — i.e., the swap is 'fair value' with zero upfront cost.\n\nPar Swap Rate = the fixed rate that sets NPV to zero\n\nCalculation: The fixed leg PV equals the floating leg PV when:\nc = (1 − DFn) / Σ(τi × DFi)\n\nWhere c = par swap rate, DFi = discount factor, τi = accrual period fraction.\n\nUses: Corporates convert fixed-rate debt to floating (receive fixed, pay floating); investors add duration (pay fixed, receive floating)\n\n**Swaptions (options on swaps)**:\n- **Payer swaption**: Right to enter a swap paying fixed (long rate volatility, benefits from rate rises)\n- **Receiver swaption**: Right to enter a swap receiving fixed (benefits from rate declines)\n- Payoff: Payer swaption payoff = max(market swap rate − strike swap rate, 0) × annuity\n- Used by mortgage servicers (to hedge prepayment risk), corporates (to cap future borrowing costs), and rates traders\n\n**Interest Rate Cap, Floor & Collar**:\n- **Cap**: Series of call options on SOFR (each called a 'caplet') — pays out when floating rates exceed the cap strike. Protects floating rate borrowers against rate rises.\n- **Floor**: Series of put options on SOFR — pays out when floating rates fall below floor strike. Guarantees minimum return for floating rate investors.\n- **Collar**: Simultaneously buy a cap and sell a floor (or vice versa) — limits rate exposure in both directions. A zero-cost collar is structured so the floor premium received equals the cap premium paid.",
          highlight: [
            "interest rate swap",
            "par swap rate",
            "fixed leg",
            "floating leg",
            "payer swaption",
            "receiver swaption",
            "cap",
            "floor",
            "collar",
          ],
        },
        {
          type: "teach",
          title: "Bond Futures: CTD, Conversion Factor & CMS Swaps",
          content:
            "**Bond Futures & Cheapest-to-Deliver (CTD)**:\nA Treasury bond futures contract does not specify a single deliverable bond — sellers can deliver any qualifying bond from a 'delivery basket' of eligible Treasuries.\n\n**Conversion Factor (CF)**:\n- Each deliverable bond has a conversion factor that adjusts for its different coupon and maturity relative to the theoretical 6% coupon standard\n- Invoice price received by the short = Futures price × CF + Accrued interest\n- A higher-coupon bond has a CF > 1; a lower-coupon bond has CF < 1\n\n**Cheapest-to-Deliver (CTD)**:\n- The short position (seller) selects the bond that is cheapest to deliver — maximizing their profit\n- CTD = the bond with the lowest net cost: (Market price − Futures price × CF)\n- The futures price is primarily determined by the CTD bond's yield\n- When CTD switches between bonds (due to yield curve moves), the futures price can gap — 'CTD switch risk'\n\n**CMS (Constant Maturity Swap)**:\n- In a standard swap, the floating leg resets to a short-term rate (SOFR, typically overnight)\n- In a CMS, the floating leg resets to a longer-term swap rate (e.g., the 10-year swap rate, 'CMS10')\n- Used by investors who want exposure to long-term rate movements without the duration of a long-term bond\n- CMS spread trade: Pay CMS2 (2-year swap rate), receive CMS10 (10-year swap rate) — a yield curve steepener with minimal duration\n- Asset swaps convert a fixed-coupon bond into a synthetic floating rate instrument; the investor pays the bond's fixed coupon in a swap and receives SOFR + asset swap spread",
          highlight: [
            "bond futures",
            "cheapest-to-deliver",
            "conversion factor",
            "CTD",
            "CMS",
            "constant maturity swap",
            "delivery basket",
            "asset swap",
          ],
        },
        {
          type: "teach",
          title: "Inflation Swaps, Credit Index Options & Total Return Swaps",
          content:
            "**Inflation Swaps**:\n- Exchange of fixed payments for payments linked to a price index (CPI)\n- **Zero-coupon inflation swap**: One payment at maturity. Fixed leg pays (1 + fixed rate)^T × notional; floating leg pays notional × CPI_T/CPI_0. The fixed rate struck equals the market's breakeven inflation expectation.\n- **Year-on-year inflation swap**: Annual payments based on annual CPI change — more complex, more liquid in Europe\n- Used by pension funds (who have CPI-linked liabilities) to hedge inflation risk without buying TIPS\n\n**Credit Index Options (CDX Swaptions)**:\n- **CDX** (North American Credit Default Swap Index) and **iTraxx** (European equivalent) are indices of CDS on a basket of corporate names\n- **CDX swaption**: The right to enter into a CDX position at a specified spread level\n- Payer CDX swaption: Right to buy CDS protection (pay the spread) on the index — profits from credit widening\n- Used for macro credit hedges and to position on tail credit events with defined risk\n\n**Total Return Swap (TRS) on bond indices**:\n- The TRS payer transfers total return of the underlying bond or index (coupon + price change) to the receiver\n- The receiver pays a floating rate (SOFR + spread) to the payer\n- **Synthetic bond index exposure**: An investor gains broad bond market exposure without owning bonds — useful for accessing illiquid markets or achieving leverage\n- Banks use TRS to fund bond positions off-balance sheet; hedge funds use TRS to gain leveraged bond exposure\n- TRS on bond indices allows rapid rebalancing and tactical allocation without trading the underlying securities",
          highlight: [
            "inflation swap",
            "zero-coupon inflation swap",
            "year-on-year inflation swap",
            "CDX",
            "iTraxx",
            "CDX swaption",
            "total return swap",
            "TRS",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A corporate treasurer wants to issue a floating rate bond but is concerned that interest rates will rise, increasing future coupon payments. Which fixed income derivative structure BEST caps the company's interest rate exposure while still allowing it to benefit if rates fall?",
          options: [
            "Buy an interest rate cap — pay an upfront premium for a series of caplets that pay out if SOFR exceeds the cap strike, limiting the maximum coupon rate",
            "Enter a receiver swaption — receive a fixed rate if exercised, converting floating exposure to fixed",
            "Sell an interest rate floor — receive premium but give up the benefit if rates fall below the floor strike",
            "Enter a pay-fixed interest rate swap — immediately convert all floating exposure to fixed at current swap rates",
          ],
          correctIndex: 0,
          explanation:
            "An interest rate cap is exactly designed for this situation: the company pays an upfront premium for protection against rates rising above the cap strike, while retaining full benefit if rates remain below the strike (lower coupon payments). The cap effectively creates a ceiling on the company's floating rate coupon. A pay-fixed swap (option D) would fully convert to fixed — protecting against rate rises but losing all upside if rates fall. A receiver swaption (option B) gives the right to receive fixed — which is the opposite of what the company needs (they're paying floating, not receiving it). Selling a floor (option C) earns premium but creates liability if rates fall — the company would be penalized when rates are low, which is the wrong direction.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In a bond futures contract, the 'cheapest-to-deliver' (CTD) bond is the bond in the delivery basket that minimizes the short position's (seller's) net delivery cost, calculated as the bond's market price minus the futures price multiplied by the bond's conversion factor.",
          correct: true,
          explanation:
            "True. The CTD is determined by finding the bond with the lowest net delivery cost: Market Price − (Futures Price × Conversion Factor). The short futures position has a quality option — they choose which bond to deliver. Rational sellers will always deliver the cheapest bond, maximizing their economic gain or minimizing their cost. When the yield curve changes, the CTD can switch from one bond to another, which creates 'CTD switch risk' for futures pricers. The futures price is anchored to the CTD bond's implied repo rate and fair value, so changes in CTD status affect futures pricing. Understanding CTD is essential for any fixed income derivatives desk managing Treasury futures positions.",
          difficulty: 2,
        },
      ],
    },
  ],
};
