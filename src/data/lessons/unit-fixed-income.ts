import type { Unit } from "./types";

export const UNIT_FIXED_INCOME: Unit = {
  id: "fixed-income",
  title: "Fixed Income & Bond Markets",
  description:
    "Master bond fundamentals, duration, yield curve analysis, credit risk, and portfolio strategies used by professional fixed income investors",
  icon: "📊",
  color: "#3b82f6",
  lessons: [
    // ─── Lesson 1: Bond Fundamentals ────────────────────────────────────────────
    {
      id: "fi-1",
      title: "📊 Bond Fundamentals",
      description:
        "Par value, coupon, maturity, issuers, and the inverse price-yield relationship",
      icon: "FileText",
      xpReward: 75,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "What Is a Bond?",
          content:
            "A **bond** is a loan made by an investor to a borrower (the issuer). The issuer promises to pay periodic interest and return the principal at maturity.\n\n**Key terms:**\n- **Par value (face value)**: The amount repaid at maturity — typically $1,000 per bond.\n- **Coupon rate**: Annual interest rate expressed as % of par. A 5% coupon on $1,000 par = $50/year.\n- **Maturity**: The date when the issuer repays the principal.\n- **Issuer types:**\n  - **Government bonds** (Treasuries): Backed by the full faith of the U.S. government. Lowest default risk. Examples: T-Bills (< 1yr), T-Notes (2–10yr), T-Bonds (20–30yr).\n  - **Corporate bonds**: Issued by companies. Higher yield than Treasuries to compensate for credit risk.\n  - **Municipal bonds (munis)**: Issued by states/cities. Interest is often tax-exempt at the federal level — advantageous for high-income investors.\n\n**Example:**\nApple issues a 10-year corporate bond with $1,000 par and a 4% coupon.\nYou receive $40/year for 10 years, then $1,000 back at maturity.",
          highlight: ["par value", "coupon rate", "maturity", "government bonds", "corporate bonds", "municipal bonds"],
        },
        {
          type: "teach",
          title: "Bond Price vs Yield: The Inverse Relationship",
          content:
            "**The most fundamental rule in fixed income:** When interest rates rise, existing bond prices fall — and vice versa.\n\n**Why?** A bond paying a 5% coupon becomes less attractive when new bonds offer 6%. To compete, the old bond's price must drop so its effective yield matches the market rate.\n\n**Intuition:**\n- You hold a bond paying $50/year (5% on $1,000 par).\n- New bonds now offer $60/year (6% coupon).\n- To sell your bond, you must accept a lower price — say $950 — so the buyer earns an equivalent return.\n- At $950, your $50 annual payment represents a higher yield on the purchase price.\n\n**Summary table:**\n| Interest Rates | Bond Prices |\n|---|---|\n| Rise ↑ | Fall ↓ |\n| Fall ↓ | Rise ↑ |\n\nThis inverse relationship is why existing bondholders face **interest rate risk** — the risk that rates rise and erode the market value of their holdings.",
          highlight: ["inverse relationship", "interest rate risk", "yield", "coupon"],
        },
        {
          type: "teach",
          title: "Yield to Maturity (YTM) — The True Return",
          content:
            "**Yield to Maturity (YTM)** is the total annualized return if you buy a bond today and hold it until maturity, assuming all coupon payments are reinvested at the same rate.\n\nYTM is the **Internal Rate of Return (IRR)** of all future bond cash flows at the current market price.\n\n**Numerical example:**\n- Par value: $1,000\n- Coupon rate: 5% → $50/year\n- Maturity: 3 years\n- Current market price: $950 (bond trading at a discount)\n\nCash flows: $50 at year 1, $50 at year 2, $1,050 at year 3\n\nSolve for r in: $950 = $50/(1+r) + $50/(1+r)² + $1,050/(1+r)³\n\nYTM ≈ **6.7%** — higher than the 5% coupon because you paid less than par.\n\n**Three yield measures compared:**\n| Measure | Formula | Value in example |\n|---|---|---|\n| Coupon rate | Coupon / Par | 5.0% |\n| Current yield | Coupon / Market price | $50 / $950 = 5.26% |\n| YTM | IRR of all cash flows | ~6.7% |\n\nYTM is the most complete measure — it accounts for the discount/premium and time value of money.",
          highlight: ["YTM", "yield to maturity", "IRR", "current yield", "coupon rate", "discount", "premium"],
        },
        {
          type: "quiz-mc",
          question:
            "If interest rates in the market rise from 4% to 6%, what happens to the price of an existing bond paying a 4% coupon?",
          options: [
            "It falls — the bond must be cheaper to offer a competitive yield",
            "It rises — higher rates make bonds more attractive",
            "It stays the same — coupon payments are fixed",
            "It doubles — investors demand more compensation",
          ],
          correctIndex: 0,
          explanation:
            "The inverse relationship is foundational: when market rates rise, existing bonds with lower coupons become less attractive. Their prices fall until the effective yield (coupon / price) matches the new market rate. A 4% coupon bond priced below par will yield more than 4%, compensating buyers for the rate difference.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A bond's current yield is always equal to its yield to maturity (YTM).",
          correct: false,
          explanation:
            "False. Current yield = Annual coupon / Current price. YTM also accounts for the gain or loss from buying at a discount or premium to par, plus the time value of reinvested coupons. They are equal only when the bond is priced exactly at par. When a bond trades at a discount, YTM > current yield > coupon rate.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Duration & Convexity ─────────────────────────────────────────
    {
      id: "fi-2",
      title: "⏱ Duration & Convexity",
      description:
        "Measure and manage interest rate sensitivity using Macaulay duration, modified duration, convexity, and DV01",
      icon: "Activity",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Macaulay Duration: Weighted Time to Cash Flows",
          content:
            "**Macaulay Duration** measures the weighted-average time (in years) to receive all of a bond's cash flows, where each cash flow is weighted by its present value.\n\n**Formula:**\nMacaulay Duration = Σ [t × PV(CFt)] / Bond Price\n\nWhere t = time of each cash flow and PV(CFt) = present value of that cash flow.\n\n**Intuition:**\n- A zero-coupon bond's duration equals its maturity — all cash flows come at the end.\n- A coupon bond's duration is shorter than its maturity — intermediate coupon payments pull the average earlier.\n- Higher coupon rate → lower duration (more weight on early coupon payments).\n- Longer maturity → higher duration.\n- Lower yield → higher duration (future cash flows discounted less heavily).\n\n**Example:** A 5-year bond with a 6% coupon and 6% YTM has a Macaulay duration of approximately **4.4 years** — reflecting that you effectively \"get your money back\" in 4.4 years on a time-weighted basis.",
          highlight: ["Macaulay duration", "zero-coupon bond", "weighted average", "present value"],
        },
        {
          type: "teach",
          title: "Modified Duration: Price Sensitivity to Rate Changes",
          content:
            "**Modified Duration** converts Macaulay Duration into a direct measure of a bond's price sensitivity to interest rate changes.\n\n**Formula:**\nModified Duration = Macaulay Duration / (1 + y)\n\nWhere y = YTM per period.\n\n**Price change approximation:**\n% Price Change ≈ –Modified Duration × Δy\n\n**Example — 7-year modified duration bond:**\nIf interest rates rise by 1% (+100 basis points):\n% Price Change ≈ –7 × 0.01 = **–7%**\n\nIf you hold $1,000,000 in this bond:\nDollar loss ≈ –$70,000\n\n**Key insight:** Modified duration is the single most important number for managing interest rate risk in a bond portfolio. A portfolio manager who expects rates to rise will reduce portfolio duration; one who expects rates to fall will increase it.\n\n**Rule of thumb:** Each year of modified duration adds ~1% of price risk per 1% rate move.",
          highlight: ["modified duration", "price sensitivity", "basis points", "rate risk", "portfolio duration"],
        },
        {
          type: "teach",
          title: "Convexity & DV01",
          content:
            "**Duration** is a linear approximation — it works well for small rate moves but becomes less accurate for larger moves. **Convexity** corrects for this curvature.\n\n**Convexity effect:**\n- Duration underestimates the price gain when rates fall.\n- Duration overestimates the price loss when rates rise.\n- For standard (non-callable) bonds, convexity is always **positive** — it's always beneficial.\n\n**Full price change formula:**\n% ΔPrice ≈ –ModDur × Δy + ½ × Convexity × (Δy)²\n\nExample: Bond with ModDur = 7, Convexity = 60, rates rise 2%:\nDuration term: –7 × 0.02 = –14.0%\nConvexity correction: +½ × 60 × (0.02)² = +1.2%\nTotal ≈ **–12.8%** (less negative than duration alone predicted)\n\n**DV01 (Dollar Value of 01):**\nDV01 = Modified Duration × Price × 0.0001\n\nDV01 is the dollar price change for a **1 basis point (0.01%)** rate move.\n\nExample: $1M bond with ModDur = 5:\nDV01 = 5 × $1,000,000 × 0.0001 = **$500 per bp**\n\nTraders use DV01 to hedge: if your portfolio has DV01 of +$10,000, you need to short $10,000 DV01 worth of Treasuries to be rate-neutral.",
          highlight: ["convexity", "DV01", "dollar value of 01", "hedging", "curvature", "non-callable"],
        },
        {
          type: "quiz-mc",
          question:
            "A bond has a modified duration of 8. If interest rates rise by 1%, what is the approximate percentage change in the bond's price?",
          options: [
            "–8% — modified duration directly approximates % price change per 1% rate move",
            "+8% — the bond benefits from higher rates",
            "–0.08% — you divide by 100 for basis points",
            "–4% — you divide by 2 because duration is semi-annual",
          ],
          correctIndex: 0,
          explanation:
            "% Price Change ≈ –Modified Duration × Δy = –8 × 0.01 = –8%. Modified duration is defined as the percentage price change for a 1% (100bp) parallel shift in yields. A bond with ModDur of 8 loses approximately 8% of its value when rates rise 1%.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Convexity always hurts bondholders because it increases price volatility.",
          correct: false,
          explanation:
            "False. For standard non-callable bonds, convexity is always positive and always benefits the bondholder. It means the bond gains more in price when rates fall than it loses when rates rise by the same amount (relative to what duration alone would predict). This asymmetric benefit makes higher convexity desirable, all else equal.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Yield Curve Analysis ──────────────────────────────────────────
    {
      id: "fi-3",
      title: "📈 Yield Curve Analysis",
      description:
        "Normal, inverted, and flat curves — theories, spread measures, and the curve as a recession predictor",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Yield Curve Shapes and What They Signal",
          content:
            "The **yield curve** plots bond yields against their maturities (e.g., 3-month to 30-year Treasuries). Its shape sends powerful economic signals.\n\n**Normal (upward-sloping):**\nLong-term yields > short-term yields. Investors demand more compensation for the uncertainty of tying up capital longer. Signals a healthy, growing economy.\nExample: 2Y = 3.5%, 10Y = 4.5%\n\n**Inverted (downward-sloping):**\nShort-term yields > long-term yields. Usually means markets expect the Fed to cut rates in the future — which happens when the economy weakens.\n2Y = 5.0%, 10Y = 4.2% → Inversion of –80 basis points\n**Historically the most reliable recession predictor** — has preceded every U.S. recession since the 1970s.\n\n**Flat:**\nShort and long yields are similar. Transition phase — often seen between normal and inverted curves. Signals economic uncertainty.\n\n**Historical inversions and recessions:**\n- 2006–07: Inverted → 2008 Global Financial Crisis\n- 2019: Inverted → 2020 COVID-related recession\n- 2022–23: Deepest inversion in 40 years (–100bp+) → Recession concerns ongoing\n\n**The 2Y/10Y spread** (10Y minus 2Y yield) is the most watched recession indicator.",
          highlight: ["yield curve", "normal curve", "inverted curve", "flat curve", "recession", "2Y/10Y spread"],
        },
        {
          type: "teach",
          title: "Yield Curve Theories",
          content:
            "Three major theories explain why the yield curve has the shape it does:\n\n**1. Expectations Theory:**\nLong-term rates = geometric average of expected future short-term rates.\nIf markets expect the Fed to cut rates from 5% to 3% over 2 years, 2-year yields will be below current short rates.\nPure expectations theory implies no risk premium — just rate forecasts.\n\n**2. Liquidity Preference Theory:**\nInvestors demand a **liquidity premium** for holding longer-term bonds, because they bear more price risk if they need to sell before maturity.\nThis is why yield curves are normally upward-sloping even when rate expectations are flat.\n\n**3. Market Segmentation Theory:**\nDifferent investors have specific maturity preferences (e.g., pension funds prefer long bonds to match liabilities; money-market funds prefer short paper).\nSupply and demand within each maturity segment independently determines yields.\n\n**In practice:** A combination of all three drives the yield curve's shape at any given time.",
          highlight: ["expectations theory", "liquidity preference", "market segmentation", "liquidity premium", "maturity preference"],
        },
        {
          type: "teach",
          title: "Spread Analysis & the Riding-the-Curve Strategy",
          content:
            "**Spread measures** quantify a bond's yield premium over a benchmark:\n\n**G-spread (Government spread):**\nYield difference vs the nearest on-the-run Treasury.\nSimple, but ignores the Treasury's own curve shape.\n\n**Z-spread (Zero-volatility spread):**\nConstant spread added to the entire Treasury spot rate curve that makes PV of cash flows equal to market price.\nMore precise than G-spread — accounts for the full curve.\n\n**OAS (Option-Adjusted Spread):**\nZ-spread adjusted to remove the value of embedded options (e.g., call options in callable bonds).\nBest measure for bonds with optionality — strips out the option's contribution to yield.\n\n**Riding the yield curve strategy:**\nIn a normal, stable yield curve environment:\n1. Buy a bond with more years to maturity than your holding period.\n2. As time passes, the bond \"rolls down\" to a lower-yield part of the curve.\n3. Lower yield = higher price → capital gain on top of coupon income.\n\nExample: You plan to hold for 3 years. Instead of buying a 3Y note at 3.5%, you buy a 7Y note at 4.5%. After 3 years it becomes a 4Y note — and if the curve is unchanged, it's now priced at the 4Y yield of ~4.0%. You earn both the higher coupon and a capital gain.",
          highlight: ["G-spread", "Z-spread", "OAS", "option-adjusted spread", "riding the yield curve", "roll-down"],
        },
        {
          type: "quiz-mc",
          question:
            "What does an inverted yield curve (short-term rates above long-term rates) typically signal?",
          options: [
            "An upcoming recession — markets expect the Fed to cut rates as the economy weakens",
            "A stock market rally — bonds become less attractive than equities",
            "Inflation is falling — central banks are tightening policy successfully",
            "Strong economic growth — companies are borrowing heavily at short maturities",
          ],
          correctIndex: 0,
          explanation:
            "An inverted yield curve — where short rates exceed long rates — has preceded every U.S. recession since the 1970s. When short rates are high and long rates are low, it signals markets expect the central bank to cut rates in the future, which typically happens when economic growth slows and the Fed tries to stimulate the economy.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "The 2-year Treasury yields 5.2% and the 10-year Treasury yields 4.4%. A fund manager believes the yield curve will normalize (steepen) over the next 12 months as the Fed begins cutting rates.",
          question:
            "Which trade would most directly profit from this view?",
          options: [
            "Buy 10Y Treasuries and short 2Y Treasuries — long 10Y gains as long yields fall relative to short yields",
            "Sell all Treasuries and hold cash — avoid the yield curve entirely",
            "Buy 2Y Treasuries only — short rates will fall first when the Fed cuts",
            "Short 10Y Treasuries — long rates always rise when short rates fall",
          ],
          correctIndex: 0,
          explanation:
            "A steepener trade profits when the yield curve becomes less inverted or steepens (long rates fall relative to short rates). Going long 10Y bonds profits as their prices rise when long yields decline. Shorting 2Y bonds profits as short yields remain elevated or fall less. This long-10Y/short-2Y position is a classic steepener trade.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Credit Risk & Spreads ─────────────────────────────────────────
    {
      id: "fi-4",
      title: "🏦 Credit Risk & Spreads",
      description:
        "Credit ratings, default probability, CDS, fallen angels, and how to price credit risk",
      icon: "Shield",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Credit Ratings: From AAA to D",
          content:
            "**Credit rating agencies** (Moody's, S&P, Fitch) assign ratings that signal a bond issuer's ability to repay debt.\n\n**S&P rating scale:**\n| Category | Ratings | Annual Default Rate |\n|---|---|---|\n| Investment Grade (IG) | AAA, AA, A, BBB | < 0.1% – 0.3% |\n| High Yield (HY / Junk) | BB, B, CCC, CC, C | 1% – 15%+ |\n| Default | D | — |\n\n**AAA** (e.g., U.S. Treasuries, select corporates): Virtually zero default risk.\n**BBB**: Lowest investment grade rung — large universe, includes solid companies.\n**BB**: Highest-quality junk. Companies like large retailers or leveraged buyouts.\n**CCC**: Distressed territory — significant default risk within 1–3 years.\n\n**Why ratings matter:**\n- Investment grade bonds are required holdings for many pension funds, insurers, and money market funds (mandated by regulation).\n- A downgrade from BBB to BB (\"fallen angel\") forces institutional sellers, causing sharp price drops.\n- IG bonds typically yield 0.5–2% above Treasuries. HY bonds yield 3–8%+ above Treasuries depending on the cycle.",
          highlight: ["investment grade", "high yield", "junk bond", "AAA", "BBB", "default rate", "rating agencies"],
        },
        {
          type: "teach",
          title: "Credit Spread, Recovery Rate & Default Probability",
          content:
            "**Credit spread** = a bond's yield minus the yield of a risk-free Treasury of the same maturity.\n\nCredit spread compensates investors for:\n1. **Default risk** — probability the issuer fails to pay\n2. **Recovery uncertainty** — how much is recouped if default occurs\n3. **Liquidity premium** — corporate bonds are less liquid than Treasuries\n\n**Recovery rate:**\nIn a default, bondholders typically recover 30–50% of face value (average ~40% for senior unsecured bonds).\nSecured bondholders (backed by assets) recover more (~70%).\nEquity holders are last in line — usually receive zero.\n\n**Approximating default probability from spread:**\nCredit Spread ≈ Default Probability × (1 – Recovery Rate)\n\nExample: 5-year corporate bond spreads at 300bp (3%), recovery rate = 40%:\nDefault probability ≈ 3% / (1 – 0.40) = **5% per year**\n\n**Fallen angels vs rising stars:**\n- **Fallen angel**: An investment-grade bond downgraded to high yield. Forced selling from IG-only funds creates buying opportunities for HY investors.\n- **Rising star**: A high-yield bond upgraded to investment grade. New demand from IG funds boosts prices — a favorable catalyst for HY holders.",
          highlight: ["credit spread", "recovery rate", "default probability", "fallen angel", "rising star", "senior unsecured"],
        },
        {
          type: "teach",
          title: "Credit Default Swaps (CDS)",
          content:
            "A **Credit Default Swap (CDS)** is an insurance contract on bond default.\n\n**How it works:**\n- **Protection buyer** pays a periodic premium (the CDS spread, in basis points per year) to the protection seller.\n- If the reference bond defaults, the protection seller pays the buyer the loss (par minus recovery).\n- If no default occurs, the protection seller keeps all premiums.\n\n**CDS spread as market-implied default probability:**\nCDS Spread ≈ Default Probability × (1 – Recovery Rate)\n\nExample: Ford 5Y CDS at 250bp, recovery = 40%:\nMarket-implied annual default probability ≈ 250bp / 60% ≈ **4.2%**\n\n**Uses of CDS:**\n1. **Hedging**: A bondholder buys CDS protection to offset default risk while keeping the bond.\n2. **Speculation**: Traders can go \"short credit\" (buy CDS) without holding the underlying bond.\n3. **Arbitrage**: CDS-bond basis trades exploit mispricing between CDS spreads and bond spreads.\n\n**Historical context:** CDS on mortgage bonds played a central role in the 2008 financial crisis — concentrated positions amplified systemic losses when defaults surged.",
          highlight: ["CDS", "credit default swap", "protection buyer", "protection seller", "CDS spread", "default probability", "hedging"],
        },
        {
          type: "quiz-mc",
          question:
            "In bond markets, what is a \"fallen angel\"?",
          options: [
            "An investment-grade bond that has been downgraded to high yield (junk) status",
            "A high-yield bond whose issuer went bankrupt and was liquidated",
            "A Treasury bond that lost its safe-haven status during a crisis",
            "A convertible bond whose equity conversion option expired worthless",
          ],
          correctIndex: 0,
          explanation:
            "A fallen angel is a bond that was originally issued with an investment-grade credit rating (BBB– or higher) but was subsequently downgraded to high-yield (junk) status (BB+ or lower). This forces institutional investors with IG-only mandates to sell the bond, often causing sharp short-term price dislocations that high-yield investors seek to exploit.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "When a bond issuer defaults, equity holders are paid before bondholders in the liquidation process.",
          correct: false,
          explanation:
            "False. In a liquidation, the priority (\"capital structure waterfall\") is: secured creditors first, then senior unsecured bondholders, then subordinated bondholders, then preferred equity, and finally common equity. Bondholders rank well above equity holders. In practice, common equity holders typically receive nothing in a liquidation scenario.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 5: Bond Portfolio Strategies ─────────────────────────────────────
    {
      id: "fi-5",
      title: "🎯 Bond Portfolio Strategies",
      description:
        "Laddering, barbell, bullet, duration targeting, and bond ETFs vs individual bonds",
      icon: "BarChart2",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Laddering, Barbell & Bullet Strategies",
          content:
            "Fixed income portfolio managers use three classic maturity structures:\n\n**Bond Ladder:**\nBonds maturing each year (or every 1–2 years) across a range of maturities.\nExample: $100K split into: 1Y, 2Y, 3Y, 4Y, 5Y bonds — $20K each.\nAs each bond matures, reinvest proceeds into a new 5-year bond at the back of the ladder.\n- Manages **reinvestment risk** — you're never forced to reinvest everything at once\n- Provides regular liquidity (a bond matures every year)\n- Smooths out interest rate fluctuations over time\n\n**Barbell Strategy:**\nConcentrate holdings in short-term AND long-term maturities — nothing in the middle.\nExample: 50% in 1–2Y bonds, 50% in 20–30Y bonds.\n- Benefits if the yield curve flattens (short rates rise more than long)\n- Higher convexity than a bullet at the same average duration\n- Greater reinvestment risk from short-term maturities\n\n**Bullet Strategy:**\nAll bonds mature at approximately the same target date.\nUsed for **liability matching** — e.g., a pension fund knows it needs $10M in 10 years and constructs a bullet maturing in year 10.\n- Eliminates reinvestment risk for that specific liability\n- Higher interest rate risk than a ladder\n- Used in pension/insurance asset-liability management (ALM)",
          highlight: ["bond ladder", "barbell", "bullet strategy", "reinvestment risk", "liability matching", "asset-liability management"],
        },
        {
          type: "teach",
          title: "Duration Targeting & Active Management",
          content:
            "**Duration targeting** is the primary lever for managing interest rate exposure in a bond portfolio.\n\n**Match duration to investment horizon:**\nIf your investment goal is 7 years away, maintaining a portfolio duration of ~7 eliminates price risk at the target date — gains/losses from rate moves are offset by reinvestment effects.\n\n**Active duration management:**\n- Expect rates to rise → **Shorten duration** (sell long bonds, buy short bonds or cash). Reduces sensitivity to rising rates.\n- Expect rates to fall → **Lengthen duration** (buy long bonds). Amplifies gains from falling rates.\n\n**Duration measurement:**\nPortfolio duration = Weighted average of individual bond durations\n\nExample: $500K in 2Y bonds (dur 1.9), $500K in 10Y bonds (dur 8.2):\nPortfolio duration = 0.5 × 1.9 + 0.5 × 8.2 = **5.05 years**\n\n**Benchmark-relative management:**\nMost bond fund managers target a duration within ±2 years of their benchmark (e.g., Bloomberg U.S. Aggregate Index, duration ~6.5 years). Significant deviations are active duration bets.",
          highlight: ["duration targeting", "investment horizon", "active duration", "shorten duration", "lengthen duration", "benchmark"],
        },
        {
          type: "teach",
          title: "Bond ETF vs Individual Bonds",
          content:
            "Investors can access fixed income through **individual bonds** or **bond ETFs** — each with distinct trade-offs:\n\n**Individual bonds:**\n- Defined maturity date: you know exactly when you get your principal back\n- No perpetual interest rate risk — if held to maturity, price fluctuations don't affect final return\n- Requires larger capital for diversification (bonds typically trade in $1,000+ lots)\n- Less liquid — harder to sell quickly without significant bid-ask spread cost\n\n**Bond ETFs:**\n- Trade on exchanges like stocks — instant liquidity at market price\n- Low cost and broad diversification (e.g., AGG holds 10,000+ bonds)\n- **No defined maturity** — as bonds mature, proceeds are reinvested in new bonds, maintaining a target duration in perpetuity\n- Perpetual interest rate risk: if rates stay high forever, the ETF never \"matures\" to return par\n- Price can trade at premium or discount to NAV, especially in stressed markets\n\n**Bottom line:**\n- Use **individual bond ladders** when you have a specific cash flow need at a defined date\n- Use **bond ETFs** for low-cost, diversified core exposure with easy rebalancing\n- Sophisticated investors often combine both: ETFs for core allocation, individual bonds for liability matching",
          highlight: ["bond ETF", "individual bonds", "defined maturity", "perpetual duration", "NAV", "liquidity", "interest rate risk"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the primary advantage of a bond ladder over a bond mutual fund or ETF?",
          options: [
            "Defined maturity dates — each bond returns principal at a known date, eliminating perpetual interest rate risk",
            "Higher yields — individual bonds always yield more than ETFs",
            "Lower transaction costs — bond ladders avoid fund management fees entirely",
            "Greater diversification — a ladder holds more bonds than any single ETF",
          ],
          correctIndex: 0,
          explanation:
            "The key advantage of a bond ladder over a bond fund is defined maturity dates. Each bond in the ladder matures at a known future date, returning the full principal regardless of where interest rates are at that time. Bond ETFs have perpetual duration — they constantly reinvest maturing bonds, so investors face ongoing interest rate risk with no certain return-of-principal date.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A pension fund needs to pay $50M in exactly 8 years to meet a defined benefit obligation. The fund manager wants to eliminate interest rate risk on this specific liability. The current 8-year Treasury yield is 4.2%.",
          question:
            "Which bond portfolio strategy is most appropriate for this objective?",
          options: [
            "Bullet strategy — buy 8-year bonds totaling the PV of $50M, matching cash flows to the liability",
            "Barbell strategy — split between 1-year and 15-year bonds for maximum convexity",
            "Bond ETF — buy a broad bond ETF for diversification and daily liquidity",
            "Bond ladder — spread maturities from 1 to 8 years to manage reinvestment risk",
          ],
          correctIndex: 0,
          explanation:
            "A bullet strategy is ideal for liability matching: purchase bonds all maturing in year 8, where PV of the bond portfolio equals the PV of the $50M liability at 4.2%. This immunizes the portfolio against interest rate risk — rate changes affect asset and liability values equally. Bond ladders and barbells create reinvestment risk and don't precisely match the single future payment date.",
          difficulty: 3,
        },
      ],
    },
  ],
};
