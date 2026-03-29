import { Unit } from "./types";

export const unitFixedIncomeMath: Unit = {
  id: "fixed-income-math",
  title: "Fixed Income Mathematics & Analytics",
  description:
    "Master the quantitative foundations of bond markets: pricing cash flows, measuring interest rate sensitivity with duration and convexity, decoding yield curves, and analyzing credit spreads",
  icon: "Calculator",
  color: "#6366F1",
  lessons: [
    // ─── Lesson 1: Bond Pricing Fundamentals ──────────────────────────────────
    {
      id: "fixed-income-math-1",
      title: "📐 Bond Pricing Fundamentals",
      description:
        "Present value of cash flows, price/yield relationship, clean vs dirty price, accrued interest, and day count conventions",
      icon: "DollarSign",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Bond Pricing as Present Value of Cash Flows",
          content:
            "A bond is simply a **promise to pay cash flows** — periodic coupon payments and a par value at maturity. Its price equals the present value of all those cash flows, discounted at the market yield.\n\n**Core pricing formula:**\n- Price = Σ [C / (1 + y/m)^t] + [Par / (1 + y/m)^n]\n- **C** = periodic coupon payment (annual coupon × par / m)\n- **y** = annual yield (YTM)\n- **m** = coupon frequency (1 = annual, 2 = semi-annual)\n- **n** = total number of periods\n\n**Key relationships:**\n- When market yield equals coupon rate, the bond prices **at par** (100)\n- When yield > coupon rate, the bond prices **at a discount** (below 100)\n- When yield < coupon rate, the bond prices **at a premium** (above 100)\n\n**Example — 5% coupon, 10-year bond, yield = 6%, semi-annual:**\n- Semi-annual coupon = 2.50\n- Number of periods = 20\n- Price ≈ 92.56 (discount, since yield > coupon)\n\nThis inverse price-yield relationship is one of the most fundamental concepts in fixed income — rising rates mean falling bond prices.",
          highlight: [
            "present value",
            "coupon payments",
            "par value",
            "yield to maturity",
            "at par",
            "at a discount",
            "at a premium",
            "inverse price-yield relationship",
          ],
        },
        {
          type: "teach",
          title: "Clean Price vs Dirty Price & Accrued Interest",
          content:
            "Bonds trade between coupon payment dates, which means the buyer receives the next full coupon even though the seller held the bond for part of the period. **Accrued interest** compensates the seller for coupon income earned but not yet received.\n\n**Dirty price (full price):** The actual cash amount exchanged — includes accrued interest\n- Dirty Price = Clean Price + Accrued Interest\n\n**Clean price (flat price):** The quoted market price — strips out accrued interest\n- This is the price you see on Bloomberg or in financial data feeds\n- Clean prices make cross-bond comparisons meaningful by removing the accrual noise\n\n**Accrued Interest formula:**\n- AI = Coupon × (Days Since Last Coupon / Days in Coupon Period)\n\n**Day count conventions** determine how coupon periods are measured:\n- **30/360**: Assumes each month has 30 days, year has 360 days — common for US corporate and municipal bonds\n- **Actual/Actual (ICMA)**: Uses actual calendar days — standard for US Treasuries\n- **Actual/360**: Uses actual days but 360-day year — used in money markets and many floating rate notes\n- **Actual/365**: Used in UK gilts and some other sovereign markets\n\nConvention mismatches can create meaningful price differences, especially for long-dated bonds — always confirm the convention before pricing.",
          highlight: [
            "accrued interest",
            "dirty price",
            "clean price",
            "30/360",
            "Actual/Actual",
            "Actual/360",
            "day count conventions",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A 4% annual coupon bond with $1,000 par value has a market yield of 5%. Where does this bond trade relative to par?",
          options: [
            "At a premium — above $1,000",
            "At par — exactly $1,000",
            "At a discount — below $1,000",
            "Cannot be determined without knowing maturity",
          ],
          correctIndex: 2,
          explanation:
            "When the market yield (5%) exceeds the coupon rate (4%), investors demand a lower price to compensate — so the bond trades at a discount below par. The extra yield comes from the price appreciation as the bond approaches maturity at par.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The dirty price of a bond is always higher than its clean price on any day other than a coupon payment date.",
          correct: true,
          explanation:
            "Between coupon dates, accrued interest accumulates and is added to the clean price to get the dirty (full) price. On a coupon payment date, accrued interest resets to zero, so clean price equals dirty price. On every other day, dirty price = clean price + positive accrued interest.",
          difficulty: 1,
        },
        {
          type: "quiz-mc",
          question:
            "Under the 30/360 day count convention, how many days are assumed between March 1 and June 1?",
          options: [
            "90 days (actual calendar days)",
            "92 days (actual calendar days)",
            "90 days (3 months × 30 days)",
            "180 days",
          ],
          correctIndex: 2,
          explanation:
            "Under 30/360, every month is treated as having exactly 30 days, so March 1 to June 1 spans exactly 3 full months = 3 × 30 = 90 days. The actual calendar count (92 days) differs, which is why day count convention selection matters for pricing accuracy.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A zero-coupon bond always trades below par prior to maturity, regardless of interest rate changes.",
          correct: true,
          explanation:
            "Zero-coupon bonds pay no interim coupons — all return comes from the discount to par at maturity. At any point before maturity with positive interest rates, the present value of that future par payment is less than par, so zero-coupon bonds always trade below par prior to maturity.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Which day count convention is standard for US Treasury bonds?",
          options: [
            "30/360",
            "Actual/Actual (ICMA)",
            "Actual/360",
            "Actual/365",
          ],
          correctIndex: 1,
          explanation:
            "US Treasury bonds use Actual/Actual (ICMA), which counts actual calendar days in both the numerator and denominator. Corporate bonds typically use 30/360, while money market instruments often use Actual/360.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Duration & Convexity ───────────────────────────────────────
    {
      id: "fixed-income-math-2",
      title: "📏 Duration & Convexity",
      description:
        "Macaulay duration, modified duration, dollar duration (DV01), convexity, and the price change approximation formula",
      icon: "TrendingDown",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Macaulay Duration: The Weighted Average Life of Cash Flows",
          content:
            "**Macaulay duration** measures the weighted average time to receive a bond's cash flows, where each weight equals the present value of that cash flow as a fraction of the bond's total price.\n\n**Formula:**\n- D_mac = Σ [t × PV(CF_t)] / Price\n- **t** = time to each cash flow (in years)\n- **PV(CF_t)** = present value of cash flow at time t\n\n**Key intuitions:**\n- A zero-coupon bond's Macaulay duration equals its maturity — all cash flow arrives at maturity\n- A coupon bond's duration is **less than its maturity** — earlier coupon payments pull the weighted average earlier\n- Higher coupons → shorter duration (more weight on near-term cash flows)\n- Higher yield → shorter duration (discounting reduces weight of distant cash flows faster)\n- Longer maturity → longer duration (more distant cash flows)\n\n**Duration as a risk measure:** Duration approximates the bond's price sensitivity to yield changes. A duration of 7 years means the bond behaves like a 7-year zero-coupon bond in terms of interest rate risk.\n\n**Annuity vs bullet comparison:**\n- A 10-year annual-pay 10% coupon bond has duration ~6.8 years\n- A 10-year zero-coupon bond has duration exactly 10 years\n- The zero has significantly more interest rate risk",
          highlight: [
            "Macaulay duration",
            "weighted average time",
            "zero-coupon bond",
            "shorter duration",
            "longer duration",
            "interest rate risk",
          ],
        },
        {
          type: "teach",
          title: "Modified Duration, Dollar Duration, and DV01",
          content:
            "**Modified duration** converts Macaulay duration into a direct measure of price sensitivity to yield changes.\n\n**Modified Duration formula:**\n- D_mod = D_mac / (1 + y/m)\n- Where y = yield and m = coupon frequency\n\n**Price change approximation:**\n- ΔP/P ≈ −D_mod × Δy\n- A bond with modified duration of 6 loses approximately 6% in price for each 1% (100 bps) rise in yield\n\n**Dollar Duration:**\n- Dollar Duration = D_mod × Price\n- Measures the dollar change in price for a 100 bps change in yield\n- Useful for comparing bonds of different sizes\n\n**DV01 (Dollar Value of 01):** Also called PVBP (price value of a basis point)\n- DV01 = D_mod × Price × 0.0001\n- Dollar price change per 1 basis point (0.01%) move in yield\n- A $10M position in a bond with D_mod = 5 and price = 98:\n  - DV01 = 5 × 0.98 × 10,000,000 × 0.0001 = $4,900 per basis point\n\n**Portfolio DV01:** Simply sum individual DV01s — a $50,000 total DV01 means a 1 bps rate rise costs $50,000 in mark-to-market value. Traders use DV01 to **hedge positions** using Treasury futures or interest rate swaps.",
          highlight: [
            "modified duration",
            "price sensitivity",
            "DV01",
            "PVBP",
            "Dollar Duration",
            "hedge positions",
            "basis point",
          ],
        },
        {
          type: "teach",
          title: "Convexity: The Second-Order Effect",
          content:
            "Duration gives a **linear approximation** of price changes, but the true price-yield relationship is curved (convex). **Convexity** captures this curvature — the second derivative of price with respect to yield.\n\n**Full price change formula (with convexity):**\n- ΔP/P ≈ −D_mod × Δy + ½ × Convexity × (Δy)²\n\n**Why convexity matters:**\n- For large yield moves, the linear duration approximation understates price gains and overstates price losses\n- Convexity is always positive for standard (option-free) bonds — it adds value\n- Bonds with higher convexity outperform lower-convexity bonds of the same duration when yields move significantly in either direction\n\n**Convexity characteristics:**\n- Zero-coupon bonds have the highest convexity for a given duration\n- Callable bonds can have **negative convexity** at low yields (when the call option goes in-the-money)\n- Mortgage-backed securities exhibit negative convexity due to prepayment risk\n\n**Practical example:**\n- Bond A: D_mod = 7, Convexity = 60\n- Bond B: D_mod = 7, Convexity = 40\n- For a 200 bps yield drop, Bond A gains more than Bond B by: ½ × (60 − 40) × (0.02)² = 0.4% extra\n\nInvestors **pay a premium** for convexity in the form of lower yields — high-convexity bonds are priced richer.",
          highlight: [
            "convexity",
            "curvature",
            "second derivative",
            "negative convexity",
            "callable bonds",
            "mortgage-backed securities",
            "positive for standard bonds",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A bond has a modified duration of 8 and a price of $950. If yields rise by 50 basis points, what is the approximate percentage change in price?",
          options: ["-4.0%", "+4.0%", "-0.4%", "-8.0%"],
          correctIndex: 0,
          explanation:
            "Using ΔP/P ≈ −D_mod × Δy: −8 × 0.0050 = −0.04 = −4.0%. A 50 bps rise in yield causes approximately a 4% price decline for a bond with modified duration of 8. The dollar loss would be approximately 0.04 × $950 = $38 per bond.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Callable bonds can exhibit negative convexity because the issuer's call option limits price appreciation when yields fall.",
          correct: true,
          explanation:
            "When yields fall, callable bond prices are capped by the call price — investors know the issuer may redeem early at par or call price, so the bond's price doesn't rise as much as a comparable non-callable bond. This price compression creates negative convexity in the low-yield zone.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Which bond has the longest Macaulay duration?",
          options: [
            "10-year, 8% annual coupon bond",
            "10-year, 4% annual coupon bond",
            "10-year zero-coupon bond",
            "15-year, 8% annual coupon bond",
          ],
          correctIndex: 2,
          explanation:
            "The 10-year zero-coupon bond has a Macaulay duration exactly equal to its maturity — 10 years — since all cash flow is received at maturity. While the 15-year bond has longer maturity, its 8% coupons shorten its duration to well below 15 years, typically around 9–10 years depending on yield.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "DV01 (dollar value of a basis point) is calculated as modified duration multiplied by price multiplied by 0.0001.",
          correct: true,
          explanation:
            "DV01 = D_mod × Price × 0.0001, where 0.0001 represents one basis point (1/100th of 1%). It measures the dollar change in bond price for a 1 basis point move in yield. Traders use DV01 extensively for hedging and risk management, since it translates duration risk into concrete dollar terms.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 3: Yield Curve Analysis ──────────────────────────────────────
    {
      id: "fixed-income-math-3",
      title: "📈 Yield Curve Analysis",
      description:
        "Spot rates, forward rates, par yields, bootstrapping, riding the yield curve, and roll-down return",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Spot Rates, Forward Rates, and Par Yields",
          content:
            "The yield curve can be expressed in three equivalent but conceptually distinct forms — spot rates, forward rates, and par yields.\n\n**Spot rates (zero rates):**\n- The yield on a zero-coupon bond maturing at a specific date\n- Denoted s(t) for maturity t\n- Represent the **pure time value** of money to that horizon without reinvestment risk\n- All other yield curve measures can be derived from spot rates\n\n**Forward rates:**\n- The interest rate implied by spot rates for a future period\n- The 1-year forward rate 2 years from now (notation: 2f1) satisfies:\n  - (1 + s2)² = (1 + s1) × (1 + 2f1)\n- **Expectations hypothesis**: forward rates represent the market's expectation of future spot rates\n- In practice, forward rates contain a **term premium** beyond pure rate expectations\n\n**Par yields:**\n- The coupon rate that makes a bond price exactly at par (100)\n- Par yields are what you observe in on-the-run Treasury markets\n- Most familiar representation, but mixes coupons across different maturities\n\n**Relationship:** Given any one curve, you can derive the other two. The spot curve is the most fundamental — it prices every fixed cash flow without ambiguity.",
          highlight: [
            "spot rates",
            "zero rates",
            "forward rates",
            "par yields",
            "reinvestment risk",
            "expectations hypothesis",
            "term premium",
          ],
        },
        {
          type: "teach",
          title: "Bootstrapping the Spot Curve",
          content:
            "**Bootstrapping** is the process of extracting zero-coupon (spot) rates from observed coupon bond prices, working sequentially from shorter to longer maturities.\n\n**Step-by-step logic:**\n- **Step 1**: The 6-month spot rate equals the 6-month T-bill yield directly (no coupon)\n- **Step 2**: The 1-year T-note pays coupons at 6 months and 1 year. Use the known 6-month spot rate to discount the 6-month coupon, then solve for the 1-year spot rate\n- **Step 3**: Continue forward — each new maturity's spot rate is solved using all previously extracted spot rates\n\n**Example:**\n- 6-month spot = 4.00% (from T-bill)\n- 1-year par bond with 4.2% coupon prices at 100\n- 100 = 2.10 / (1 + 0.04/2) + 102.10 / (1 + s1/2)²\n- Solving: s1 = 4.21%\n\n**Why bootstrapping matters:**\n- Removes the reinvestment rate assumption embedded in YTM\n- Produces the **theoretical spot curve** used to price any fixed cash flow stream\n- Required input for Z-spread, option-adjusted spread (OAS), and interest rate derivative pricing\n- In practice, bootstrapping uses interpolation and curve-fitting (Nelson-Siegel model) to handle gaps in maturities",
          highlight: [
            "bootstrapping",
            "zero-coupon rates",
            "sequential extraction",
            "theoretical spot curve",
            "Nelson-Siegel model",
            "reinvestment rate",
          ],
        },
        {
          type: "teach",
          title: "Riding the Yield Curve & Roll-Down Return",
          content:
            "**Riding the yield curve** is a fixed income strategy that profits from the shape of an upward-sloping yield curve without necessarily predicting rate moves.\n\n**Mechanism:**\n- Buy a bond with maturity longer than your investment horizon\n- As time passes, the bond 'rolls down' the yield curve to shorter maturities\n- If the yield curve remains stable, the bond's yield falls (shorter maturity = lower yield on an upward curve)\n- A falling yield means a rising price — generating capital gains on top of coupon income\n\n**Roll-down return:**\n- The price appreciation from the yield curve roll, assuming a static (unchanged) yield curve\n- Roll-down return = Price at shorter maturity (in 1 year) − Current price\n- Added to the coupon income, total return can significantly exceed the initial yield\n\n**Example:**\n- Buy 5-year bond at yield 3.5%; 4-year spot is 3.0%\n- In 1 year, the bond becomes a 4-year bond; if curve stays static, it now yields 3.0%\n- The 50 bps yield decline generates ~2% price appreciation (× duration ≈ 4)\n\n**Risks of the strategy:**\n- Parallel yield curve shifts eliminate roll-down gains\n- Curve steepening (long yields rise faster) can produce losses\n- Most effective in stable to modestly declining rate environments\n- **Carry vs roll-down**: carry = coupon minus funding cost; roll-down = price appreciation from yield curve shape",
          highlight: [
            "riding the yield curve",
            "roll-down return",
            "upward-sloping yield curve",
            "static yield curve",
            "capital gains",
            "carry",
            "curve steepening",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "If the 1-year spot rate is 3% and the 2-year spot rate is 4%, what is the implied 1-year forward rate one year from now?",
          options: [
            "Approximately 3.5% (simple average)",
            "Approximately 5.01%",
            "Exactly 4%",
            "Approximately 1%",
          ],
          correctIndex: 1,
          explanation:
            "Using (1 + s2)² = (1 + s1)(1 + 1f1): (1.04)² = (1.03)(1 + 1f1). So 1.0816 = 1.03 × (1 + 1f1), giving 1 + 1f1 = 1.0501, or 1f1 ≈ 5.01%. This forward rate is higher than both spot rates because the 2-year spot already embeds rate expectations rising sharply in year two.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Bootstrapping requires bond prices or yields across multiple maturities and works by solving for each successive spot rate using previously derived spot rates.",
          correct: true,
          explanation:
            "Bootstrapping is an iterative, sequential procedure. Starting from the shortest maturity (where the bond's single cash flow directly gives the spot rate), each subsequent spot rate is extracted by discounting the known earlier cash flows at previously bootstrapped rates and solving for the unknown. It requires market prices at each maturity along the curve.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Under a static (unchanged) upward-sloping yield curve, which investor benefits most from 'riding the yield curve'?",
          options: [
            "An investor who buys a bond matching their exact investment horizon",
            "An investor who buys a longer-dated bond and sells before maturity",
            "An investor who holds a money market fund",
            "An investor who short-sells long-duration bonds",
          ],
          correctIndex: 1,
          explanation:
            "Riding the yield curve works by buying a bond longer than your investment horizon. As time passes, the bond's maturity decreases; on an upward-sloping curve, shorter maturities have lower yields, meaning the bond's price rises. The investor captures both coupon income and price appreciation — more than simply buying a bond matching the holding period.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Forward rates always accurately predict future spot rates because they embed the market's unbiased expectations.",
          correct: false,
          explanation:
            "Forward rates do not perfectly predict future spot rates. While the pure expectations hypothesis claims they do, in reality forward rates also include a term premium — compensation for bearing interest rate risk over longer horizons. Empirical evidence consistently shows forward rates are biased predictors of future short rates, systematically overpredicting future rate levels.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Spread Measures ────────────────────────────────────────────
    {
      id: "fixed-income-math-4",
      title: "💹 Spread Measures",
      description:
        "Nominal spread, Z-spread, OAS (option-adjusted), CDS vs bond basis, and spread duration",
      icon: "BarChart2",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Nominal Spread and Z-Spread",
          content:
            "Spread measures quantify how much additional yield a bond offers relative to a risk-free benchmark — they isolate credit risk, liquidity risk, and other factors beyond interest rate risk.\n\n**Nominal (G-spread) spread:**\n- The simple yield difference between a bond and an interpolated Treasury of the same maturity\n- Nominal spread = Bond YTM − Treasury YTM (matched maturity)\n- Easy to compute but **imprecise**: compares different maturity instruments and uses a single discount rate for all cash flows\n- Does not adjust for the shape of the yield curve\n\n**Z-spread (zero-volatility spread):**\n- A constant spread added to each **spot rate** on the Treasury curve to make the present value of a bond's cash flows equal its market price\n- Solves: Price = Σ [CF_t / (1 + s_t + Z)^t]\n- More rigorous than nominal spread: accounts for the full shape of the yield curve\n- Assumes **zero interest rate volatility** — no allowance for embedded options\n- Widely used for non-callable corporate bonds, ABS, and CMBS\n\n**Interpretation:**\n- Z-spread > Nominal spread when the yield curve is steeply upward-sloping (longer-dated cash flows face higher rates)\n- Z-spread ≈ Nominal spread for short-dated bonds or flat yield curves\n- Z-spread of 150 bps means the bond yields 150 bps above each Treasury spot rate across the entire cash flow schedule",
          highlight: [
            "nominal spread",
            "G-spread",
            "Z-spread",
            "zero-volatility spread",
            "spot rates",
            "Treasury curve",
            "zero interest rate volatility",
          ],
        },
        {
          type: "teach",
          title: "Option-Adjusted Spread (OAS)",
          content:
            "**Option-adjusted spread (OAS)** extends the Z-spread framework to account for the value of embedded options in a bond — such as call options, put options, or prepayment options in MBS.\n\n**Core concept:**\n- OAS = Z-spread − Option Cost\n- A callable bond's Z-spread is wide partly because the investor has sold a call option to the issuer\n- OAS removes this option component to reveal the **pure credit/liquidity spread**\n\n**Computation:**\n- OAS is estimated using an interest rate model (e.g., Hull-White, Black-Karasinski) that simulates many possible rate paths\n- For each path, the bond's cash flows are determined (accounting for exercise of options)\n- OAS is the constant spread that equates the average PV of these path-dependent cash flows to the market price\n\n**Interpreting OAS across bond types:**\n- **Non-callable corporate**: OAS ≈ Z-spread (minimal option value)\n- **Callable corporate**: OAS < Z-spread (call option costs the investor spread)\n- **Agency MBS**: OAS accounts for prepayment optionality; negative OAS can signal rich pricing\n- **Putable bond**: OAS > Z-spread (put option benefits the investor)\n\n**OAS in relative value:**\n- Comparing OAS across bonds of similar credit quality identifies which bonds are cheap or expensive after adjusting for embedded options\n- OAS widening = bond cheapening; OAS tightening = bond richening",
          highlight: [
            "option-adjusted spread",
            "OAS",
            "embedded options",
            "callable bond",
            "interest rate model",
            "prepayment optionality",
            "relative value",
            "negative OAS",
          ],
        },
        {
          type: "teach",
          title: "CDS vs Bond Basis & Spread Duration",
          content:
            "**CDS-bond basis** compares credit default swap spreads to bond spreads for the same issuer — revealing arbitrage-like opportunities and market dislocations.\n\n**Credit Default Swap (CDS):**\n- A derivative that transfers credit risk: the protection buyer pays a periodic spread; the protection seller pays par upon a credit event\n- CDS spread reflects the market's pure credit risk view, isolated from interest rate risk and funding costs\n\n**Bond spread to CDS basis:**\n- Basis = CDS spread − Bond spread (Z-spread or ASW spread)\n- **Positive basis**: CDS is more expensive than bonds — bonds appear cheap to CDS\n- **Negative basis**: Bonds yield more than CDS protection cost — suggests bonds are cheap or CDS is tight\n\n**Why the basis exists:**\n- Cheapest-to-deliver (CTD) option in CDS: seller can deliver any qualifying obligation\n- **Funding costs**: Buying bonds requires balance sheet; CDS is unfunded\n- **Repo specialness**: If bonds are on special repo, their yield is artificially lower\n- **Negative basis trades**: Buy cheap bond + buy CDS protection — locks in near-riskless spread\n\n**Spread Duration:**\n- Measures sensitivity of a bond's price to changes in its **credit spread** (not interest rates)\n- For a non-callable bond, spread duration ≈ modified duration\n- For callable bonds, spread duration < modified duration (call option dampens spread sensitivity)\n- Portfolio spread duration = Σ (weight_i × spread_duration_i × notional_i)\n- Used by credit portfolio managers to size and hedge credit risk",
          highlight: [
            "CDS-bond basis",
            "credit default swap",
            "positive basis",
            "negative basis",
            "cheapest-to-deliver",
            "funding costs",
            "spread duration",
            "credit spread",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "For a callable corporate bond, how does its OAS typically compare to its Z-spread?",
          options: [
            "OAS > Z-spread, because the call option adds value for the investor",
            "OAS < Z-spread, because OAS strips out the call option cost borne by the investor",
            "OAS = Z-spread for callable bonds",
            "OAS is not applicable to callable bonds",
          ],
          correctIndex: 1,
          explanation:
            "For a callable bond, OAS = Z-spread − Option Cost. The investor has effectively sold a call option to the issuer, which represents a cost — the Z-spread is inflated by the option premium. OAS removes this, leaving the pure credit/liquidity spread. A callable bond with Z-spread of 200 bps and option cost of 50 bps has an OAS of 150 bps.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The Z-spread is computed by adding a constant spread to each par yield on the government yield curve and finding the spread that equates a bond's PV to its price.",
          correct: false,
          explanation:
            "The Z-spread is added to each **spot rate** (zero-coupon rate) on the Treasury curve, not par yields. This distinction matters because spot rates reflect the true time value for each individual cash flow. The formula is: Price = Σ [CF_t / (1 + s_t + Z)^t], where s_t is the t-year spot rate and Z is the constant Z-spread.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "A trader observes that a corporate bond's CDS spread is 120 bps while the bond's Z-spread (over Treasuries) is 160 bps — a basis of −40 bps. Which trade exploits this negative basis?",
          options: [
            "Sell the bond and sell CDS protection",
            "Buy the bond and buy CDS protection (negative basis trade)",
            "Buy CDS protection only",
            "Short the bond and buy CDS protection",
          ],
          correctIndex: 1,
          explanation:
            "A negative basis (bond spread > CDS spread) means the bond is cheap relative to CDS. The negative basis trade: buy the bond (earn 160 bps over Treasuries) and buy CDS protection (pay 120 bps). Net carry = 40 bps, and credit risk is fully hedged by the CDS. The position profits from the basis converging — typically as the bond spread tightens or CDS widens.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Spread duration for a non-callable investment-grade corporate bond is approximately equal to its modified duration.",
          correct: true,
          explanation:
            "For option-free bonds, spread duration and modified duration are essentially the same — both measure the percentage price change per unit change in yield (or spread). The distinction matters for callable bonds or MBS, where the embedded option creates a wedge: the call option means the bond's price doesn't rise as much when spreads tighten, making spread duration less than modified duration.",
          difficulty: 2,
        },
      ],
    },
  ],
};
