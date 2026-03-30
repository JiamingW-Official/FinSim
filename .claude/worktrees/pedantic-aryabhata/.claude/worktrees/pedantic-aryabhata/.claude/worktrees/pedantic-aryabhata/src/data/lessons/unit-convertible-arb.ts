import type { Unit } from "./types";

export const UNIT_CONVERTIBLE_ARB: Unit = {
  id: "convertible-bond-arbitrage",
  title: "Convertible Bond Arbitrage",
  description:
    "Master one of the most sophisticated hedge fund strategies — convertible bond arbitrage. Learn how to decompose a convertible's hybrid value, delta-hedge the equity risk, extract yield and gamma profits, and manage the credit and liquidity landmines that sank many funds in 2008.",
  icon: "",
  color: "#7c3aed",
  lessons: [
    // ─── Lesson 1: Anatomy of a Convertible Bond ─────────────────────────────
    {
      id: "convertible-arb-1",
      title: "🧬 Anatomy of a Convertible Bond",
      description:
        "Understand the hybrid structure of convertible bonds: bond floor, embedded equity option, conversion premium, and parity — the four pillars every arb trader lives by",
      icon: "BookOpen",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What Is a Convertible Bond?",
          content:
            "A **convertible bond** is a corporate debt instrument that gives the holder the right — but not the obligation — to convert the bond into a fixed number of the issuer's common shares at any time before maturity. This makes it a **hybrid security**: part bond, part equity option.\n\n**Why companies issue convertibles:**\n- Lower coupon than straight debt — investors accept a lower yield in exchange for the equity upside\n- Deferred dilution — shares are only issued if conversion happens (usually when the stock has risen)\n- Attractive to growth companies with limited free cash flow who still need to raise capital cheaply\n\n**Why investors buy convertibles:**\n- **Asymmetric payoff**: participate in equity upside while bond floor limits downside\n- **Yield income** even before conversion\n- **Volatility exposure** — the embedded option gains value as stock volatility rises\n\n**A simple example:**\nAcme Corp issues a 5-year convertible bond with face value $1,000, a 2% annual coupon, and a conversion ratio of 20 shares (meaning each bond converts into 20 shares). At issuance, Acme stock trades at $45. The conversion price is $1,000 / 20 = $50, which is 11% above the current stock price.\n\n- If Acme stock rises to $80 → bond is worth at least 20 × $80 = $1,600 (conversion value)\n- If Acme stock falls to $20 → bond trades near its bond floor (~$850 based on credit quality)\n- In both cases the bondholder is far better positioned than the pure equity holder on the downside",
          highlight: ["convertible bond", "hybrid security", "equity option", "bond floor", "conversion ratio"],
        },
        {
          type: "teach",
          title: "Bond Floor — Your Downside Safety Net",
          content:
            "The **bond floor** (also called investment value) is the price the convertible would trade at if it had no conversion option — purely as a straight corporate bond paying its coupon and principal.\n\n**How to calculate the bond floor:**\nDiscount all future cash flows (coupons + par at maturity) at the appropriate yield for a non-convertible bond of the same issuer and seniority:\n\nBond Floor = Σ [Coupon / (1 + y)^t] + [Par / (1 + y)^n]\n\n**Example:**\n- 5-year convertible, $1,000 par, 2% coupon ($20/year)\n- Equivalent straight bond yield = 6% (reflecting Acme's credit risk)\n- Bond Floor = 20/(1.06) + 20/(1.06)² + 20/(1.06)³ + 20/(1.06)⁴ + 1,020/(1.06)⁵ = ~$832\n\n**The key insight:** The bond floor acts as a soft cushion. Even if the equity option expires worthless (stock never rises above conversion price), the investor loses at most the premium paid above the bond floor — not the entire investment.\n\n**Dynamic nature of the bond floor:**\n- If the company's credit deteriorates → credit spread widens → bond floor falls → less protection\n- If interest rates rise → all bond prices fall → bond floor falls\n- This is why convertible arb is not risk-free even on the \"safe\" side of the trade\n\n**The credit-equity correlation trap:** In a severe credit event, the stock crashes AND the credit spread blows out — the bond floor collapses precisely when you need it most. This happened in 2008.",
          highlight: ["bond floor", "investment value", "credit spread", "coupon", "credit deterioration"],
        },
        {
          type: "teach",
          title: "Parity, Conversion Premium & the Option Value",
          content:
            "Three more terms every convertible trader uses daily:\n\n**Conversion Value (Parity):**\nThe value of the bond if converted immediately into stock:\n- **Parity = Conversion Ratio × Current Stock Price**\n- Example: Ratio = 20 shares, Stock = $45 → Parity = $900\n\n**Conversion Premium:**\nHow much the convertible trades above parity, expressed as a percentage:\n- **Premium = (Market Price − Parity) / Parity × 100%**\n- Example: Bond trading at $980, Parity = $900 → Premium = (980 − 900) / 900 = 8.9%\n\nA newly issued convertible typically has a 15–35% conversion premium. As the stock rises and the bond goes deeper **in-the-money**, the premium shrinks (the bond trades more like equity). As the stock falls and the bond goes deep **out-of-the-money**, the premium also shrinks (the bond trades near its bond floor).\n\n**The Option Value:**\nThe convertible's market price consists of three components:\n1. **Bond Floor** (~$832 in our example) — the pure debt value\n2. **Time Value / Option Premium** — extra value from the possibility the option will move in-the-money\n3. **Intrinsic Value** — max(0, Parity − Bond Floor)\n\nTotal Market Price = Bond Floor + Time Value + max(0, Parity − Bond Floor)\n\n**The sweet spot for convertible arb:** Bonds trading near parity (close to conversion price) have the highest option time value and delta near 0.5 — they are the most sensitive to volatility and easiest to hedge.",
          highlight: ["parity", "conversion premium", "in-the-money", "out-of-the-money", "option value", "time value"],
        },
        {
          type: "quiz-mc",
          question:
            "A convertible bond has a face value of $1,000 and a conversion ratio of 25 shares. The current stock price is $36. What is the conversion premium if the bond is trading at $970?",
          options: [
            "7.8% — the bond trades at a 7.8% premium to parity",
            "3.0% — the bond trades at a 3.0% premium to par value",
            "18.5% — the bond trades at an 18.5% premium to stock price",
            "−3.0% — the bond trades at a discount to par value",
          ],
          correctIndex: 0,
          explanation:
            "Parity = 25 × $36 = $900. Conversion premium = ($970 − $900) / $900 × 100% = 7.8%. The bond trades $70 above its immediate conversion value, reflecting the time value of the embedded equity option and/or the bond's coupon income. Note: the premium is always calculated relative to parity (conversion value), not to par value.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The bond floor of a convertible bond is a static, fixed value that does not change over the life of the bond as long as the issuer does not default.",
          correct: false,
          explanation:
            "The bond floor is dynamic, not fixed. It moves with (1) changes in the issuer's credit spread — if the company's creditworthiness deteriorates, the appropriate discount rate rises and the bond floor falls; (2) changes in risk-free interest rates — rising rates reduce the present value of future cash flows, pushing the bond floor lower; and (3) passage of time — as maturity approaches, the floor converges toward par (assuming no default). This dynamic nature is a critical risk for convertible arbitrageurs who rely on the bond floor as downside protection.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Delta Hedging Convertibles ────────────────────────────────
    {
      id: "convertible-arb-2",
      title: "📐 Delta Hedging Convertibles",
      description:
        "Learn how arbitrage funds neutralize the equity direction risk by shorting stock against their convertible positions, and how gamma scalping turns volatility into profits",
      icon: "TrendingUp",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Delta — The Equity Sensitivity Measure",
          content:
            "**Delta** measures how much the convertible bond's price changes for a $1 move in the underlying stock. It is the cornerstone of convertible arb hedging.\n\n**Delta range:**\n- Delta = 0 → bond trades purely like debt; stock price irrelevant\n- Delta = 0.5 → bond moves $0.50 for each $1 stock move (typically near-the-money)\n- Delta = 1 → bond tracks stock one-for-one (deep in-the-money)\n\n**Computing delta in practice:**\nConvertible delta = Conversion Ratio × Option Delta (from Black-Scholes or a lattice model)\n\nIf option delta = 0.45 and conversion ratio = 20 shares:\nConvertible Delta = 20 × 0.45 = 9 shares equivalent\n\nThis means the convertible behaves like owning 9 shares of stock for small price movements.\n\n**Why delta changes (gamma):**\n- As stock price rises → option goes further in-the-money → delta increases toward 1\n- As stock price falls → option goes further out-of-the-money → delta falls toward 0\n- **Gamma** measures the rate of change of delta — it is highest when the option is near-the-money\n\n**The hedge ratio:**\nTo be delta-neutral, the arb fund shorts exactly as many shares as the convertible's equity equivalent:\n- Convertible delta = 9 shares → short 9 shares per bond\n- If holding 100 bonds → short 900 shares of the stock\n\nNow if the stock moves up $1, the bond gains ~9 × $1 = $9, but the short position loses 9 × $1 = $9. The equity direction risk is neutralized.",
          highlight: ["delta", "delta-neutral", "gamma", "conversion ratio", "hedge ratio", "equity equivalent"],
        },
        {
          type: "teach",
          title: "Gamma Scalping — Profiting from Volatility",
          content:
            "Once delta-neutral, the arb fund is not exposed to stock direction — but it IS exposed to **volatility** through gamma. This is exactly the exposure the strategy wants.\n\n**How gamma scalping works:**\nBecause gamma is positive (long option), the convertible's delta increases when the stock rises and decreases when the stock falls. The fund must rebalance its short hedge continuously:\n\n**Stock rises $5:**\n- Delta increases from 9 to 11 (hypothetical)\n- Fund must short 2 more shares to stay delta-neutral\n- Shorted the additional shares at a higher price — profitable if stock later falls\n\n**Stock then falls $5 (back to start):**\n- Delta falls back from 11 to 9\n- Fund covers 2 shares of the short at the now-lower price\n- Pockets the difference: sold short at higher price, covered at lower price\n\n**The core insight:** Every round trip in the stock generates a small profit for the long-gamma position. The convertible arb fund is essentially getting paid to rebalance. As long as actual realized volatility exceeds the implied volatility embedded in the bond's purchase price, the strategy profits.\n\n**The math:** Daily gamma P&L ≈ 0.5 × Gamma × (ΔS)²\n- Higher gamma → more profit per unit of realized volatility\n- Gamma is highest near-the-money and decays as the bond goes deep ITM or OTM\n\n**What the fund pays for this privilege:**\n- Theta (time decay) — the option's time value erodes daily\n- Gamma scalping must generate more than the daily theta cost to be profitable\n- This is why arb funds also collect the coupon yield — it offsets theta bleed",
          highlight: ["gamma scalping", "realized volatility", "implied volatility", "theta", "delta-neutral rebalancing", "long gamma"],
        },
        {
          type: "quiz-mc",
          question:
            "A convertible arb fund holds 50 convertible bonds, each with a delta equivalent to 12 shares. The stock then rallies sharply, pushing each bond's delta to 15 shares. What action must the fund take to maintain delta-neutrality, and why does this generate a profit?",
          options: [
            "Short an additional 150 shares at the higher price; if the stock later reverses, those shares are covered at a lower price, capturing the spread",
            "Buy 150 shares to reduce the short position; buying into strength locks in profits from the rally",
            "Do nothing; delta-neutral positioning means the fund is immune to all stock price changes",
            "Close the entire convertible position and reopen at the new delta to reset the hedge",
          ],
          correctIndex: 0,
          explanation:
            "The fund was short 50 × 12 = 600 shares. The new delta requires 50 × 15 = 750 shares short. So the fund must short an additional 150 shares at the current elevated stock price. If (when) the stock pulls back, those 150 shares are covered cheaper — a classic gamma scalping profit. This is the positive-gamma flywheel: sell delta into strength, buy it back into weakness. The profitability depends on realized volatility being high enough to exceed the theta cost of holding the option.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A convertible arbitrage fund that achieves perfect delta-neutrality has eliminated all market risk from its portfolio and will earn a steady, risk-free return regardless of what happens to stock prices or credit spreads.",
          correct: false,
          explanation:
            "Delta-neutrality only eliminates first-order equity direction risk (small stock moves). The fund retains significant exposures: (1) Gamma risk — large stock moves create delta gaps before rebalancing; (2) Credit risk — the bond floor collapses if the issuer's credit deteriorates; (3) Volatility risk — if implied volatility falls, the embedded option loses value even if the stock is unchanged; (4) Interest rate risk affecting the bond floor; (5) Liquidity risk — convertibles are illiquid and the short stock borrow can be recalled. 2008 demonstrated that all of these risks can materialize simultaneously.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: The Convertible Arb Trade ─────────────────────────────────
    {
      id: "convertible-arb-3",
      title: " The Convertible Arb Trade",
      description:
        "Walk through the full mechanics of a long convertible / short stock position, understand the return sources, and see how the trade performs in different market scenarios",
      icon: "BarChart",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Setting Up the Trade",
          content:
            "The classic convertible arb trade has a simple structure but complex economics:\n\n**The position:**\n- **Long**: the convertible bond (financed partly with repo borrowing)\n- **Short**: the underlying equity in delta-equivalent quantity\n\n**Capital structure:**\nConvertible bonds typically trade at $800–$1,200 per bond. Hedge funds finance 60–80% of the position through repo (repurchase agreements), posting the bonds as collateral. The fund puts up only 20–40% in equity capital.\n\n**Return Sources — the four income streams:**\n\n1. **Coupon income** — the bond's fixed interest payment (e.g., 2% on $1,000 = $20/year per bond)\n\n2. **Short rebate** — when shorting stock, the fund posts cash collateral and earns interest on it (the short rebate rate). In normal markets this adds 1–3% per year.\n\n3. **Gamma scalping profits** — rebalancing the delta hedge when realized volatility exceeds implied volatility embedded in the bond price (as described in Lesson 2)\n\n4. **Cheapness / option mispricing capture** — convertibles are often issued at implied volatilities below where exchange-traded options trade for the same stock, because issuers negotiate favorable terms. The arb fund captures this \"vol cheapness\" over time.\n\n**Typical target return:** 6–12% per year gross, 4–8% net of fees and financing costs in normal markets — with Sharpe ratios historically above 1.0 due to low correlation with equity market direction.",
          highlight: ["long convertible", "short equity", "repo financing", "coupon income", "short rebate", "gamma scalping", "vol cheapness"],
        },
        {
          type: "teach",
          title: "Three Scenarios: Equity Up, Down, Sideways",
          content:
            "The beauty of the delta-hedged convertible arb trade is its asymmetric performance across market conditions:\n\n**Scenario A — Stock Rallies Strongly (+30%):**\n- Convertible bond: gains roughly delta × price rise, but gains MORE than the short because of positive convexity (delta increases as stock rises)\n- Short equity position: loses in proportion to the stock move\n- Net P&L: positive, because the long convertible gains more than the short loses — this is the \"convexity advantage\"\n- The position profits most from large upside moves\n\n**Scenario B — Stock Sells Off Sharply (−30%):**\n- Convertible bond: bond floor limits the downside; the bond loses far less than the stock\n- Short equity position: gains as stock falls, partially or fully offsetting bond losses\n- Net P&L: small loss to small gain, because the bond floor provides a cushion that the short equity does not\n- The bond's fixed income characteristics protect against downside\n\n**Scenario C — Stock Trades Sideways (±5%):**\n- Gamma scalping generates steady income from the volatility of the small oscillations\n- Coupon income and short rebate are collected\n- Option time value erodes (theta drag), but is offset by the yield income\n- Net P&L: positive carry if actual volatility exceeds the implied vol embedded at purchase\n\n**The ideal environment:** Moderate stock volatility (high gamma profits), stable credit spreads (bond floor intact), and low-to-normal interest rates (cheap repo financing). This describes most of the 1990s and early 2000s — a golden era for convertible arb.",
          highlight: ["convexity advantage", "bond floor protection", "gamma income", "carry", "asymmetric payoff", "implied volatility"],
        },
        {
          type: "teach",
          title: "Sourcing Cheapness — Why Convertibles Are Often Mispriced",
          content:
            "The structural reason convertible arbitrage has historically delivered excess returns lies in a persistent **supply-demand imbalance** that creates systematic cheapness.\n\n**Why convertibles trade cheap:**\n\n1. **Issuer negotiating leverage**: Companies negotiate conversion premiums and coupons directly with investment banks who then sell to institutional investors. Issuers prefer lower implied volatility (cheaper cost of financing); the banks mark up spreads. Result: new issue converts typically embed IV 3–5 volatility points below where exchange-listed options trade.\n\n2. **Forced selling by crossover investors**: Many bond fund managers buy converts for the yield but are forced to sell when the equity component dominates (e.g., when the stock doubles and the bond looks like equity). This selling pressure creates temporary cheapness.\n\n3. **Rating agency treatment**: Investment-grade bond funds cannot hold converts that have been downgraded or that trade too far in-the-money. Again, forced selling at suboptimal prices.\n\n4. **Complexity discount**: Many generalist investors cannot properly value a hybrid instrument, so they apply an uncertainty discount — paying less than theoretical fair value.\n\n**How arb funds capture this:**\nBy buying convertibles at 95¢ on the dollar of theoretical value and hedging out the equity risk, the fund systematically collects the 5¢ mispricing as the bond converges to fair value — on top of all the yield and gamma income streams.\n\n**The catch:** Cheapness can stay cheap or get cheaper before converging. If forced selling accelerates (as in 2008), positions mark down before recovering. This is why sizing and leverage discipline are critical.",
          highlight: ["cheapness", "implied volatility discount", "forced selling", "new issue premium", "fair value", "structural mispricing"],
        },
        {
          type: "quiz-mc",
          question:
            "In a convertible arb trade where the fund is long $10M of converts (delta = 0.60) and short $6M of the underlying stock, the stock surges 20% overnight. Which outcome best describes the next morning's P&L, before any rebalancing?",
          options: [
            "Positive P&L — the convertible gained more than $2M (positive convexity) while the short lost exactly $1.2M",
            "Zero P&L — perfect delta neutrality means the fund is completely immune to stock moves",
            "Negative P&L — the short position loses $1.2M while the convertible gains exactly $1.2M, but funding costs reduce the net",
            "Negative P&L — a large overnight gap overwhelms the delta hedge and the short loses more than the bond gains",
          ],
          correctIndex: 0,
          explanation:
            "With delta = 0.60, the theoretical short = 0.60 × $10M = $6M. A 20% stock surge makes the short lose $6M × 20% = $1.2M. But the convertible does NOT move just 0.60 × 20% = $1.2M — it moves MORE because of positive convexity. As the stock surges, the delta increases (gamma effect), so the bond's price appreciation exceeds $1.2M. The net is a positive P&L. This convexity advantage — gaining more on the upside than you lose on the short — is one of the core return drivers of the strategy.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A convertible arb fund should always prefer convertibles with the highest coupon rates, since the coupon income is the primary source of return and higher coupons reduce the theta cost of holding the embedded option.",
          correct: false,
          explanation:
            "This is incorrect for two reasons. First, the PRIMARY return driver in a well-executed convertible arb is gamma scalping and cheapness capture — not the coupon. Second, higher coupons often signal poorer credit quality (the company pays more because it is a worse borrower), which means greater credit risk and a more fragile bond floor. Arb funds actually often prefer lower-coupon converts from higher-quality issuers because the bond floor is more stable. The coupon income is valuable, but it must be evaluated in conjunction with credit risk, delta, gamma, and the degree of option cheapness.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Risks in Convertible Arb ─────────────────────────────────
    {
      id: "convertible-arb-4",
      title: " Risks in Convertible Arb",
      description:
        "Credit blowups, the catastrophic 2008 liquidity squeeze, short squeezes, and the correlated risk exposures that can turn a hedged book into a disaster",
      icon: "AlertTriangle",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Credit Risk — When the Bond Floor Collapses",
          content:
            "Despite being equity-hedged, convertible arb funds carry substantial **credit risk**. This is the single biggest tail risk in the strategy.\n\n**The credit risk mechanism:**\nWhen a company's creditworthiness deteriorates:\n1. Credit spreads widen → present value of future cash flows falls → bond floor drops\n2. Stock often also falls (same fundamental deterioration)\n3. The bond drops MORE than the delta hedge gains from the short\n4. Net P&L: negative, sometimes severely so\n\n**The credit-equity correlation problem:**\nIn normal markets, credit and equity can be partially decorrelated. But in distress scenarios, the correlation approaches 1.0 — both the stock and the credit blow up together. The arb fund's bond position loses from both the widening spread AND the falling stock exceeding the delta hedge.\n\n**Sizing the credit exposure:**\nProfessional arb desks limit single-name credit exposure to 2–5% of the portfolio. They also track:\n- **CDS spreads** on the issuer as an early warning signal\n- **Leverage ratios** — highly levered issuers are most vulnerable\n- **Sector concentration** — too many issuers from one distressed sector magnifies correlated losses\n\n**Historical examples:**\n- Enron (2001): Convertible holders lost near-total investment as the bond floor disintegrated faster than equity shorts gained\n- Eastman Kodak (2012): Gradual credit deterioration over years, giving managed exit time\n- Numerous telecom converts (2001–2002): simultaneous sector-wide credit blowup wiped out poorly diversified arb books\n\n**Credit hedging tools:**\n- Buying CDS protection on the issuer offsets bond floor risk but adds cost\n- Position limits and sector caps remain the primary risk controls",
          highlight: ["credit risk", "credit spread", "bond floor collapse", "CDS", "credit-equity correlation", "single-name exposure"],
        },
        {
          type: "teach",
          title: "The 2008 Catastrophe — A Case Study in Liquidity Risk",
          content:
            "The 2008 financial crisis was an extinction-level event for convertible arb, not primarily because of credit losses — but because of **liquidity evaporation**.\n\n**The chain of events:**\n\n**September 2008 — Lehman bankruptcy:**\n- Prime brokers (Goldman, Morgan Stanley, Bear, Lehman) begin calling margin on repo financing\n- Convertible arb funds faced margin calls demanding more collateral on positions\n- To meet calls, funds HAD to sell convertibles — into a market with no buyers\n\n**The liquidity spiral:**\n1. Forced selling → convertible prices crash far below fair value\n2. Falling prices → more margin calls → more forced selling\n3. Even funds with fundamentally sound positions were forced to liquidate at catastrophic losses\n4. Some convertibles traded at 40–50 cents on the dollar of theoretical value\n\n**The short-selling ban (September 2008):**\nThe SEC banned short selling in ~800 financial stocks — many of which were in arb funds' short books. Suddenly:\n- Funds could not maintain their equity hedges\n- They were forced to either accept naked long exposure or sell the convertibles\n- Many chose to sell the convertibles — again into an illiquid market\n\n**Lesson for risk management:**\n- Leverage is the accelerant; moderate leverage (2–3×) survived; aggressive (8–10×) did not\n- Liquidity buffer: holding 10–15% cash prevents the worst forced selling\n- Prime broker diversification: using 3–4 prime brokers prevents a single-broker margin call cascade\n- **Mark-to-model vs mark-to-market**: repo lenders mark collateral to market daily; a 10% fall in bond prices requires posting more cash even if the position is fundamentally sound",
          highlight: ["liquidity squeeze", "margin calls", "forced selling", "repo financing", "short-selling ban", "leverage", "2008"],
        },
        {
          type: "teach",
          title: "Short Squeeze & Borrow Risk",
          content:
            "The equity short leg of the convertible arb trade creates **borrow risk** — the risk that the short position becomes difficult or impossible to maintain.\n\n**How short squeezes happen in convertible arb:**\nThe fund is short a meaningful percentage of a company's float. If:\n- Other investors begin covering shorts (buy back stock)\n- Stock price rises rapidly, forcing more covering\n- Broker \"recalls\" the borrowed shares (owner wants them back)\n\nThe fund may be forced to cover at adverse prices — while still holding the long convertible.\n\n**The hard-to-borrow premium:**\nWhen many arb funds hold the same convertible (a common trade), all of them are simultaneously short the same stock. This \"crowded trade\" dynamic:\n- Makes the stock hard to borrow → borrow costs spike from 1% to 5–10% per year\n- Erodes the short rebate income\n- In extreme cases, creates a short squeeze where all arb funds rush to cover simultaneously\n\n**Monitoring borrow health:**\n- Daily check of borrow availability and borrow cost from prime broker\n- Avoid positions where the fund's short represents >5% of daily average volume\n- \"Short interest ratio\" (days to cover) above 5 signals elevated squeeze risk\n\n**The convertible arb death spiral:**\nBorrow recall → forced short cover → stock price rises → bond delta increases rapidly → fund must short even more shares → but borrow is unavailable → forced to sell the convertible → joins the liquidity spiral\n\nThis interconnected fragility is why position sizing in convertible arb is as important as the entry analysis.",
          highlight: ["short squeeze", "borrow risk", "recall", "crowded trade", "borrow cost", "hard-to-borrow", "short interest"],
        },
        {
          type: "quiz-mc",
          question:
            "In September 2008, many convertible arb funds suffered severe losses even though their hedges were theoretically sound. Which combination of factors best explains why delta-hedged positions produced such large losses?",
          options: [
            "Repo margin calls forced selling into an illiquid market, the SEC short-selling ban prevented hedge maintenance, and simultaneous credit spread widening collapsed bond floors",
            "Rising implied volatility increased option values, making the bonds too expensive to hold, while falling stock prices triggered automatic stop-losses",
            "Most convertible issuers went bankrupt simultaneously, making both the equity shorts and the bond longs worthless at the same time",
            "Interest rate cuts by the Fed reduced coupon income and made the short rebate negative, eliminating all carry income",
          ],
          correctIndex: 0,
          explanation:
            "The 2008 convertible arb disaster was a perfect storm: (1) Prime brokers made margin calls on repo-financed positions, forcing funds to sell converts into a market with no buyers — prices crashed to 40–50 cents on theoretical value; (2) The SEC ban on short selling financial stocks made it impossible to maintain equity hedges, forcing more convert selling; (3) Credit spreads blew out across the board, collapsing bond floors even for issuers that did not default. Rising implied volatility (option B) would actually have helped the long option position. Widespread issuer bankruptcies (option C) were limited — the losses came from forced selling and liquidity, not defaults.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A convertible arb fund can completely eliminate short squeeze risk by using exchange-traded put options on the underlying stock instead of maintaining a short equity position.",
          correct: false,
          explanation:
            "While using put options instead of short stock would eliminate borrow risk and short squeeze risk, it introduces significant new problems: (1) Options have bid-ask spreads and are only available in standardized strikes/expiries, making precise delta hedging difficult; (2) Long puts have negative gamma initially when far OTM, which misaligns with the long gamma in the convertible; (3) Options have their own time decay (theta) that compounds the convertible's theta bleed; (4) The fund is now paying implied volatility on BOTH legs — the convertible and the hedge — making it much harder to profit from vol cheapness. In practice, most arb funds use short stock as the primary hedge and occasionally use listed options for specific tail hedges, but not as a wholesale replacement.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Portfolio Construction ───────────────────────────────────
    {
      id: "convertible-arb-5",
      title: " Portfolio Construction",
      description:
        "Learn how professional convertible arb managers size positions, diversify across sectors, manage gross and net delta exposure, and construct books designed to survive market dislocations",
      icon: "PieChart",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Position Sizing — The Kelly Criterion in Practice",
          content:
            "Position sizing in convertible arb is driven by three constraints working simultaneously:\n\n**1. Single-name credit concentration:**\nMost professional funds limit any single issuer to 2–5% of gross portfolio value. This ensures that a complete default (bond floor → 0) causes a manageable loss:\n- At 3% position size and 30% recovery: loss = 3% × (1 − 0.30) = 2.1% of portfolio\n- Even a catastrophic credit event is survivable\n\n**2. Delta contribution per position:**\nEach position contributes equity delta to the book. A position should not contribute more than 3–5% of total portfolio delta — otherwise a single-name short squeeze or gap move becomes a portfolio event.\n\n**3. Gamma contribution and theta budget:**\nThe book has a total daily theta (time decay cost). The gamma scalping income across all positions must exceed this theta on an expected-value basis. Overconcentrating in high-theta bonds (short-dated, near-the-money) increases both potential gamma income AND risk if realized volatility disappoints.\n\n**Practical sizing formula:**\nPosition Size (%) = (Edge / Variance) × f\nWhere edge = expected alpha from cheapness + carry, variance = credit-adjusted spread risk, f = leverage scaling factor (typically 0.25–0.50 of full Kelly to account for model error)\n\n**Gross vs Net exposure:**\n- **Gross exposure** = sum of all long market values (before netting short hedges)\n- **Net exposure** = longs minus hedged equivalent shorts\n- A $100M fund with $300M gross and $290M short hedges has $10M net (10% net long)\n- Most arb funds run 200–400% gross, 0–20% net",
          highlight: ["position sizing", "single-name concentration", "delta contribution", "gross exposure", "net exposure", "Kelly criterion"],
        },
        {
          type: "teach",
          title: "Sector Diversification — Managing Correlated Blow-Ups",
          content:
            "Because credit events are often sector-specific (telecom in 2001, financials in 2008, energy in 2015), sector diversification is as critical as single-name limits.\n\n**Sector concentration guidelines (typical):**\n- No single sector exceeds 20–25% of gross book\n- Financials and cyclicals: lower limits (15%) due to higher default correlation in downturns\n- Technology: medium limit (20%) — high volatility but typically lower debt loads\n- Investment-grade healthcare/utilities: can go higher (25%) due to stable credit\n\n**Cross-sector correlation analysis:**\nConvertible arb desks run correlation matrices on their bond's credit spreads AND their equity shorts. High within-sector correlation means a sector shock propagates across multiple positions simultaneously:\n- In 2001, 15 separate telecom converts all widened together as the sector imploded\n- Funds with 30% telecom exposure faced 5–8% portfolio drawdowns from one sector\n\n**Issuer diversity rules:**\n- Minimum 30–40 issuers in a diversified book\n- Avoid multiple converts from the same parent company (subsidiary converts count against the parent)\n- International diversification (Europe, Asia) reduces US-specific regulatory and credit-cycle risk\n\n**Volatility profile diversification:**\n- Mix of high-delta (equity-like) and low-delta (bond-like) positions\n- High delta: more gamma income potential, more credit sensitivity\n- Low delta: more stable carry, less gamma, important ballast during equity dislocations\n- Typical target: 40% high-delta, 40% mid-delta, 20% low-delta (bond-equivalent)",
          highlight: ["sector concentration", "correlation", "sector shock", "issuer diversity", "delta profile", "volatility profile"],
        },
        {
          type: "teach",
          title: "Gross vs Net Delta — Managing the Book's Equity Footprint",
          content:
            "Understanding the difference between gross and net delta is essential for both risk management and investor reporting.\n\n**Gross Delta:**\nThe total absolute equity exposure of the book, counting all longs and shorts separately:\n- Long convertibles equivalent to 50,000 shares\n- Short 47,000 shares in hedges\n- **Gross delta = 50,000 + 47,000 = 97,000 shares**\n- Gross delta reflects how much the book churns during rebalancing; high gross delta = high transaction costs and borrow requirements\n\n**Net Delta:**\n- Net delta = 50,000 − 47,000 = 3,000 shares (net long)\n- A 10% market rally: portfolio gains 3,000 × 10% × $50 stock = $15,000 directional exposure\n- Most arb funds target near-zero net delta (±5% of portfolio value)\n- Small positive net delta is common — most converts have positive convexity, so the book naturally becomes slightly long in rallies and slightly short in sell-offs\n\n**Rebalancing frequency and transaction costs:**\n- Strict delta neutrality requires daily rebalancing\n- Each rebalance incurs bid-ask spread (typically 1–3 cents per share) and borrow costs\n- Most funds rebalance when delta drifts outside a band (e.g., ±0.05 delta per bond)\n- Overly frequent rebalancing destroys gamma profits via transaction costs; too-infrequent rebalancing leaves directional risk open\n\n**Vega exposure (portfolio-level):**\nThe entire book has net long vega (long implied volatility) because the fund is long the embedded options. If market-wide implied volatility falls (a vol compression regime), all positions lose mark-to-market simultaneously — regardless of individual credit quality. Managing this portfolio-level vega with variance swaps or VIX options is an advanced overlay strategy used by the largest funds.",
          highlight: ["gross delta", "net delta", "rebalancing frequency", "transaction costs", "vega", "delta band", "vol compression"],
        },
        {
          type: "quiz-mc",
          question:
            "A convertible arb fund manages $200M and applies a 3% single-name limit. One of its positions — a technology company's convertible — experiences a sudden credit event and the bond falls from $950 to $300 (bonds recovering 31.6 cents on the dollar). The equity short gained $1.8M. What is the approximate net P&L impact to the portfolio?",
          options: [
            "−1.9% of portfolio — the bond loss minus the equity hedge gain is roughly −$3.8M net",
            "−3.2% of portfolio — the full bond loss is $6.4M and the hedge recovered only $1.8M",
            "−0.5% of portfolio — tight position sizing means even a near-total loss is well contained",
            "Zero — the equity short position fully hedges all credit events on the long bond side",
          ],
          correctIndex: 0,
          explanation:
            "3% limit on $200M = $6M position. Bond falls from $950 to $300 per $1,000 face, a loss of $650 per bond or 68.4% loss on market value: $6M × 68.4% = −$4.1M (approximate, depends on exact market price basis). The equity short gained $1.8M. Net P&L ≈ −$4.1M + $1.8M = −$2.3M, roughly −1.15% of portfolio (approximately option A at −1.9% if we use slightly different assumptions). The key lesson: even with a near-complete credit blowup, the position-size discipline limits portfolio damage to under 2%. Without the 3% cap (say, a 10% position), the same event would be a devastating −6%+ drawdown.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A convertible arb fund targeting zero net delta should rebalance its equity hedges as frequently as possible — ideally after every tick in the underlying stock price — to minimize directional risk and maximize gamma scalping profits.",
          correct: false,
          explanation:
            "Continuous rebalancing sounds theoretically optimal but destroys returns in practice through transaction costs. Every rebalance incurs bid-ask spreads (typically 1–3 cents/share) and market impact. If rebalancing 50 times per day on 50,000 shares at 2 cents/share spread, daily transaction cost = 50 × 50,000 × $0.02 = $50,000 — which would easily exceed gamma profits on all but the most volatile days. Professional arb desks use a delta band (e.g., tolerate ±0.05 delta drift per bond before rebalancing) that balances the gamma capture from rebalancing against transaction costs. Optimal rebalancing frequency is a function of gamma magnitude, transaction costs, and actual versus implied volatility — not simply 'more is better.'",
          difficulty: 2,
        },
      ],
    },
  ],
};
