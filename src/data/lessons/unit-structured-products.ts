import type { Unit } from "./types";

export const UNIT_STRUCTURED_PRODUCTS: Unit = {
  id: "structured-products",
  title: "Structured Products & Exotic Derivatives",
  description:
    "Principal protection, barrier options, autocallables, variance swaps, and credit-linked notes — the complex instruments sold to institutional and retail investors",
  icon: "Layers",
  color: "#7c3aed",
  lessons: [
    // ─── Lesson 1: Structured Product Basics ─────────────────────────────────
    {
      id: "struct-prod-basics",
      title: "Structured Product Basics",
      description:
        "Principal protection, participation rates, barrier features, autocall structures, and issuer credit risk",
      icon: "Package",
      xpReward: 85,
      difficulty: "intermediate",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "What Is a Structured Product?",
          content:
            "A **structured product** is a pre-packaged investment that combines a **fixed-income instrument** (usually a bond or deposit) with one or more **derivative contracts** to create a customised risk/return profile.\n\nThey are typically issued as **medium-term notes (MTNs)** or certificates by a bank and sold to retail or institutional investors. The bank is both manufacturer and distributor.\n\n**Core design variables:**\n- **Principal protection level** — what percentage of the investor's capital is returned at maturity regardless of market performance? Common levels: 90%, 95%, or 100%.\n- **Participation rate** — what fraction of the underlying's upside does the investor capture? A 70% participation in the S&P 500 means: if the index rises 30%, the investor earns 21%.\n- **Barrier features** — conditions that alter the payoff (e.g., if the index falls below 60% of its initial level, principal protection is lost).\n- **Tenor** — typical range is 3–7 years; illiquid before maturity.\n- **Underlying** — equity index, single stock, basket, FX rate, commodity, or inflation index.\n\n**Why are participation rates less than 100%?**\nThe issuer uses part of the capital to buy a zero-coupon bond (guaranteeing principal) and spends the remainder on call options. Longer tenors, lower rates, and higher volatility all reduce how much option can be purchased per dollar invested.",
          highlight: [
            "structured product",
            "medium-term notes",
            "principal protection",
            "participation rate",
            "barrier",
            "zero-coupon bond",
          ],
        },
        {
          type: "teach",
          title: "Autocall & Phoenix Structures",
          content:
            "**Autocallable notes** are among the most popular structured products sold in Europe and Asia. They automatically redeem early if the underlying asset closes above a pre-set **observation level** (typically 100% of initial price) on a periodic observation date.\n\n**Standard autocall payoff:**\n1. On each annual observation date, if the index ≥ call trigger (e.g., 100%), the note redeems at 100% + coupon (e.g., 10% per year elapsed × number of years held).\n2. If the note survives all observation dates without calling, the investor faces the **barrier outcome** at maturity:\n   - If the index is above the **barrier level** (e.g., 60% of initial) → return 100% of principal.\n   - If the index is **below the barrier** → investor suffers 1-for-1 loss on the downside (same as holding the index from 60% level downward).\n\n**Phoenix structure** adds a **conditional coupon**: the coupon is only paid on an observation date if the index is above a (lower) coupon barrier (e.g., 70%), even if the autocall trigger (100%) hasn't been breached. This creates income even in moderate downturns.\n\n**Memory feature**: In some phoenix notes, unpaid coupons accumulate — if the index eventually rises above the coupon barrier, all previously missed coupons are paid in a lump sum.\n\n**Investor perspective:** Attractive yield in sideways markets; risk is a sharp sustained drawdown piercing the capital barrier.",
          highlight: [
            "autocallable",
            "observation level",
            "call trigger",
            "barrier level",
            "phoenix",
            "conditional coupon",
            "memory feature",
          ],
        },
        {
          type: "teach",
          title: "Issuer Credit Risk — The Hidden Risk",
          content:
            "A **structured note is an unsecured obligation of the issuing bank**. If the issuer defaults before maturity, the investor loses both the derivative gain AND the principal, even if the product was 100% capital-protected.\n\n**Lehman Brothers example (2008):**\nLehman issued ~$7 billion in structured notes sold to retail investors as 'protected' products. When Lehman filed for bankruptcy in September 2008, note holders received cents on the dollar in the bankruptcy estate — the protection was worthless.\n\n**Measuring issuer credit risk:**\n- **Credit Default Swap (CDS) spread** on the issuer — the market's real-time price for insuring against default. A CDS spread of 200bp means 2% annual premium to insure against default.\n- **Credit rating** — investment-grade issuers (BBB– and above) are standard for structured products.\n\n**Mitigants:**\n- **Collateralised structured products** — assets placed in a Special Purpose Vehicle (SPV), ring-fenced from issuer insolvency.\n- **Exchange-traded structures** — some markets (Germany, Switzerland) have exchange-traded certificates with tighter custody rules.\n- **Third-party guarantees** — a parent bank or government entity guarantees repayment.\n\n**Key takeaway:** Always read the issuer's credit rating and CDS spread. A 100%-protected note from a BBB-rated bank with a 300bp CDS spread carries meaningful credit risk that should be priced into the return.",
          highlight: [
            "unsecured obligation",
            "Lehman Brothers",
            "CDS spread",
            "credit rating",
            "SPV",
            "collateralised",
            "issuer credit risk",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A 5-year structured note offers 100% principal protection and 80% participation in the S&P 500. At maturity the S&P 500 has risen 40% from the initial level. What does the investor receive on a $100,000 investment?",
          options: [
            "$132,000 (100% principal + 80% × 40% gain = $100,000 + $32,000)",
            "$140,000 (100% principal + 40% full gain)",
            "$100,000 (principal protection means no upside participation)",
            "$120,000 (50% participation in 40% gain = $20,000)",
          ],
          correctIndex: 0,
          explanation:
            "The participation rate of 80% is applied to the underlying's gain of 40%. Investor gain = 80% × 40% × $100,000 = $32,000. Total return = $100,000 principal + $32,000 = $132,000. The 100% protection means the floor is $100,000; the 80% participation determines the upside capture.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A 100% principal-protected structured note issued by a bank guarantees that investors will receive their full principal back regardless of what happens to the issuer.",
          correct: false,
          explanation:
            "False. 'Principal protection' only refers to the payoff formula — it assumes the issuer remains solvent. The note is an unsecured liability of the issuing bank. If the issuer defaults (as Lehman Brothers did in 2008), investors can lose their principal even on 'protected' products.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Capital Protected Notes ───────────────────────────────────
    {
      id: "struct-prod-capital-protected",
      title: "Capital Protected Notes",
      description:
        "Zero-coupon bond + call option decomposition, participation calculation, and break-even analysis",
      icon: "Shield",
      xpReward: 90,
      difficulty: "advanced",
      duration: 14,
      steps: [
        {
          type: "teach",
          title: "The Zero-Coupon + Call Option Framework",
          content:
            "Every capital-protected note can be decomposed into two building blocks:\n\n**1. Zero-coupon bond (ZCB)**\nBuys certainty that a known amount is returned at maturity. Cost today:\n\nZCB Price = Protection Level ÷ (1 + r)^T\n\nFor 100% protection, a 5-year note with a 4% risk-free rate:\nZCB cost = $100 ÷ (1.04)^5 = **$82.19** per $100 face\n\n**2. Call option on the underlying**\nThe remaining $17.81 is used to purchase an at-the-money call option on the chosen index.\n\n**Participation rate calculation:**\nParticipation = Option Budget ÷ ATM Call Option Price\n\nIf the S&P 500 5-year ATM call costs $25 per $100 of notional (due to 20% implied volatility), then:\nParticipation = $17.81 ÷ $25 = **71.2%**\n\n**Key levers:**\n- Lower interest rates → ZCB costs more → less budget for options → lower participation\n- Higher implied volatility → options cost more → lower participation\n- Longer tenor → ZCB costs less → more option budget (but higher vega too)\n- Lower protection level (e.g., 90%) → more budget → higher participation\n\n**Bank's margin:** In practice the bank uses its internal funding rate (typically higher than the risk-free rate) and marks up the option premium — the participation offered to investors is always below what a direct replication would provide.",
          highlight: [
            "zero-coupon bond",
            "ZCB",
            "call option",
            "participation rate",
            "option budget",
            "implied volatility",
            "ATM",
          ],
        },
        {
          type: "teach",
          title: "Break-Even Analysis and Opportunity Cost",
          content:
            "**Break-even return** is the underlying return at which the structured note equals what the investor would have earned in a risk-free investment (e.g., a government bond).\n\n**Example setup:**\n- 5-year note, 100% protection, 75% participation in S&P 500\n- Risk-free alternative: 5-year government bond at 4% p.a.\n- Compound return of risk-free alternative over 5 years: (1.04)^5 – 1 = **21.67%**\n\n**Break-even calculation:**\nTo match the government bond, the structured note must return 21.67%. Since participation is 75%:\n\nRequired S&P return = 21.67% ÷ 75% = **28.89%**\n\nThe S&P 500 must rise at least 28.89% over 5 years (≈ 5.2% per year) just to match a plain government bond.\n\n**Dividend drag:**\nStructured notes typically reference the **price return** index (not total return). The S&P 500 has paid ~1.5–2% in annual dividends. Over 5 years this is ~8–10% of foregone income. The true break-even including dividends is therefore roughly 38–39% gross return on the index.\n\n**When do capital-protected notes make sense?**\n- Investors who would otherwise hold cash (no opportunity cost vs. bonds)\n- Markets where deposit rates are near zero (ZCB is cheap → high participation)\n- Tax environments where capital gains are taxed more favourably than interest income\n- Investors needing a defined outcome for liability-matching purposes\n\n**When do they destroy value?**\n- When the bank's margin is large (opaque pricing)\n- In rising-rate environments (ZCB costs surge mid-product life)\n- When the investor gives up dividends on a high-yield underlying",
          highlight: [
            "break-even",
            "opportunity cost",
            "price return index",
            "dividend drag",
            "total return",
            "risk-free alternative",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Risk-free rates rise from 3% to 6% while the bank is structuring a new 5-year, 100%-protected note linked to an equity index. Holding all other factors equal, what happens to the participation rate offered to investors?",
          options: [
            "Participation rate increases because the ZCB costs less at higher rates, leaving more budget for options",
            "Participation rate decreases because options become more expensive when rates rise",
            "Participation rate is unchanged; it only depends on implied volatility",
            "Participation rate decreases because the ZCB now requires a higher coupon",
          ],
          correctIndex: 0,
          explanation:
            "At 3% the ZCB costs $100/(1.03)^5 ≈ $86.26; at 6% it costs $100/(1.06)^5 ≈ $74.73. The higher rate frees up $86.26 – $74.73 = $11.53 more per $100 for purchasing options, directly increasing the participation rate. Higher rates benefit capital-protected note buyers through a bigger option budget.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor buys a 3-year capital-protected note for $100,000 with 100% principal protection and 60% participation in a gold index. At maturity, gold has risen 50% from the initial level. An alternative 3-year government bond would have returned 3.5% per year compounded.",
          question:
            "How much does the investor receive, and did the structured note outperform the bond alternative?",
          options: [
            "Receives $130,000 (60% × 50% = 30% gain). Bond alternative: $110,872. Structured note outperforms by ~$19,128.",
            "Receives $150,000 (50% full gain + 100% protection). Bond underperforms.",
            "Receives $130,000 but underperforms bond because dividends were foregone.",
            "Receives $100,000 because principal protection means no upside participation.",
          ],
          correctIndex: 0,
          explanation:
            "Payoff = $100,000 × (1 + 60% × 50%) = $100,000 × 1.30 = $130,000. Bond alternative: $100,000 × (1.035)^3 = $110,872. The note outperforms by approximately $19,128. In this scenario, a strong gold move combined with reasonable participation makes the note compelling. Note that if the question included dividend foregone on gold (gold pays no dividend), the comparison remains the same.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Barrier Options ────────────────────────────────────────────
    {
      id: "struct-prod-barrier-options",
      title: "Barrier Options",
      description:
        "Knock-in/knock-out mechanics, up-and-out calls, down-and-in puts, delta discontinuity, and pricing intuition",
      icon: "AlertTriangle",
      xpReward: 95,
      difficulty: "advanced",
      duration: 15,
      steps: [
        {
          type: "teach",
          title: "Barrier Option Taxonomy",
          content:
            "A **barrier option** is a path-dependent option that either activates or extinguishes if the underlying price touches a pre-defined barrier level during the option's life.\n\n**Four basic types:**\n\n| Type | Description |\n|------|-------------|\n| **Up-and-Out** | Standard option that ceases to exist if price rises above the barrier |\n| **Up-and-In** | Dormant until price rises above the barrier, then becomes a standard option |\n| **Down-and-Out** | Standard option that ceases to exist if price falls below the barrier |\n| **Down-and-In** | Dormant until price falls below the barrier, then becomes a standard option |\n\n**In-Out parity:**\nKnock-In option + Knock-Out option = Standard (vanilla) option (same strike, same expiry, same barrier). This is the fundamental no-arbitrage relationship.\n\n**Rebates:**\nSome barrier options pay a small cash **rebate** if the barrier is touched and the option knocks out. This partially compensates the holder for losing the option.\n\n**Common real-world uses:**\n- **Up-and-out call:** Cheaper than vanilla call; used when investor believes the stock will rise but not too far. A bank sells it to reduce hedge cost.\n- **Down-and-in put (DIP):** Cornerstone of autocallable notes — the investor implicitly sells a DIP to fund the enhanced coupon. The DIP activates only if the index falls sharply (e.g., below 60%), creating downside exposure at maturity.\n- **Turbo certificates:** Leveraged products in European retail markets that knock out if the underlying touches the barrier.",
          highlight: [
            "barrier option",
            "knock-in",
            "knock-out",
            "up-and-out",
            "down-and-in",
            "in-out parity",
            "rebate",
            "DIP",
          ],
        },
        {
          type: "teach",
          title: "Up-and-Out Call: Pricing and Hedge Mechanics",
          content:
            "**Example:**\nS&P 500 spot = 4,000. Vanilla 1-year call, strike 4,000, value = $300.\nUp-and-out call, strike 4,000, barrier 4,800 (20% above spot), value = ~$210.\n\nThe knock-out is cheaper because the barrier eliminates payoff scenarios where the index rises above 4,800 — but those are also the most profitable scenarios for the holder! This makes up-and-out calls **counterintuitively risky** for buyers.\n\n**Delta behaviour near the barrier:**\nFor a standard call, delta (sensitivity to spot price) rises smoothly from 0 to 1. For an up-and-out call near the barrier:\n- **Delta becomes NEGATIVE near the barrier**: every $1 rise in the underlying brings the option closer to extinguishing, reducing its value.\n- This **delta discontinuity** (sometimes called **gamma explosion**) makes hedging extremely difficult for dealers.\n- At the barrier itself, delta jumps discontinuously — a tiny price move either knocks the option out (value = 0) or leaves it active (value > 0).\n\n**Dealer hedging problem:**\nA dealer who sold the barrier option must dynamically hedge. Near the barrier they must sell the underlying aggressively as price rises (negative delta), then reverse if price retreats. This whipsaw is costly and explains the higher bid-ask spreads on barrier options.\n\n**Barrier monitoring conventions:**\n- **Continuous barrier**: knocked out if price touches barrier even intraday.\n- **Daily close barrier**: only the closing price counts — less exposure to intraday spikes, cheaper.",
          highlight: [
            "up-and-out call",
            "delta",
            "delta discontinuity",
            "gamma explosion",
            "negative delta",
            "continuous barrier",
            "daily close barrier",
          ],
        },
        {
          type: "teach",
          title: "Down-and-In Put: The Autocall's Hidden Risk",
          content:
            "A **down-and-in put (DIP)** starts worthless and becomes a standard put option only once the underlying falls through the barrier level.\n\n**Example:**\nEuro Stoxx 50 at 4,000, barrier at 60% = 2,400. DIP strike = 4,000. Premium = $80 vs. vanilla put at $300.\n\nThe DIP is cheap because it only activates after a 40% crash — but once it activates, the put is deep in-the-money, giving the holder (or more precisely, the investor who sold it embedded in a structured note) significant exposure.\n\n**Role in autocallables:**\nThe investor in an autocallable note has implicitly:\n1. Lent money to the bank (receives bond coupon)\n2. Sold a series of autocall options (enables early redemption with enhanced coupon)\n3. **Sold a down-and-in put** (provides the downside tail risk that funds the attractive coupon)\n\nAt maturity, if the barrier has been breached at any point, the investor receives:\nRedemption = Principal × (Final Index Level ÷ Initial Index Level)\n\nThis is equivalent to holding the index from the point of the original investment — a potentially severe loss.\n\n**Barrier breach dynamics:**\nOnce the barrier is breached (even briefly), the note switches from 'capital protected at maturity' to 'fully equity-linked.' Investors who hold European-style notes may not know the note's capital protection is gone mid-life.",
          highlight: [
            "down-and-in put",
            "DIP",
            "barrier breach",
            "autocallable",
            "capital protection lost",
            "tail risk",
            "deep in-the-money",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An investor holds an up-and-out call option on a stock with strike $100 and knock-out barrier $130. The stock is currently trading at $128 — just below the barrier. What happens to the option's delta compared to a standard vanilla call at the same price?",
          options: [
            "The delta is negative or near zero: the option loses value as the stock rises toward $130 because it will knock out",
            "The delta equals 1.0 because the option is very near the barrier and will expire with maximum intrinsic value",
            "The delta is identical to the vanilla call — barriers do not affect delta",
            "The delta spikes to 5 or higher due to gamma acceleration near the barrier",
          ],
          correctIndex: 0,
          explanation:
            "Near the up barrier, an up-and-out call exhibits negative delta. As the stock rises toward $130, the option approaches extinguishment (value → 0), so each additional dollar of stock price DECREASES the option's value. This is the opposite of a vanilla call and creates the delta discontinuity that makes barrier options difficult to hedge.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Autocallable Notes ─────────────────────────────────────────
    {
      id: "struct-prod-autocallables",
      title: "Autocallable Notes",
      description:
        "Step-up coupons, early redemption triggers, memory feature, worst-of payoffs, and return scenarios",
      icon: "RefreshCw",
      xpReward: 95,
      difficulty: "advanced",
      duration: 15,
      steps: [
        {
          type: "teach",
          title: "Autocall Mechanics: Step-Up Coupon and Memory",
          content:
            "An **autocallable note** combines a bond-like coupon stream with embedded optionality. Its defining feature is automatic early redemption if a trigger condition is met.\n\n**Step-up coupon structure:**\n| Observation Year | Call Trigger | Coupon if Called |\n|-----------------|-------------|------------------|\n| Year 1          | Index ≥ 100%| 10%              |\n| Year 2          | Index ≥ 100%| 20%              |\n| Year 3          | Index ≥ 100%| 30%              |\n| Maturity (Y3)   | Below barrier| Capital at risk  |\n\nThe coupon grows by 10% per year — this is the **step-up**: investors who wait longer are compensated for the additional time at risk.\n\n**Memory (Accumulator) Feature:**\nIn standard autocalls, coupon is only paid when the note is called. The memory feature changes this: even if no call occurs in Year 1 (index below trigger), the Year 1 coupon is stored. In Year 2, if the note is called, the investor receives BOTH Year 1 and Year 2 coupons simultaneously.\n\n**Why the memory feature matters:**\nWithout memory, if the index falls to 95% in Year 1 and then recovers to 102% in Year 2, the investor receives only the Year 2 coupon (20%). With memory, they receive 10% + 20% = 30%.\n\n**Issuer perspective on memory:**\nMemory increases the note's value to investors but also increases the issuer's hedging cost. It requires more complex exotic option hedges (compound options, cliquets).",
          highlight: [
            "step-up coupon",
            "autocall trigger",
            "memory feature",
            "accumulator",
            "observation date",
            "early redemption",
          ],
        },
        {
          type: "teach",
          title: "Worst-of Payoff: Multi-Asset Autocallables",
          content:
            "**Worst-of autocallables** reference a basket of 2–5 underlying assets, but the payoff at maturity (or the barrier test) is determined by the **worst-performing** asset in the basket.\n\n**Why worst-of?**\nUsing the worst-performing asset dramatically increases the probability of barrier breach and reduces the autocall probability — this makes the product cheaper to structure, allowing the bank to offer a much higher coupon.\n\n**Example:**\nA worst-of autocall on [MSFT, AMZN, NVDA] with 70% barrier and 25% annual coupon.\n- If ALL three stocks are above 100% on an observation date → note called, coupon paid\n- At maturity: if the WORST performer is above the 70% barrier → full principal returned\n- At maturity: if the worst performer is below 70% → investor loses capital equal to worst-of decline\n\n**Correlation impact:**\nThe value of the embedded down-and-in put increases as **correlation between underlyings decreases**. With low correlation, there's a higher probability that at least one stock suffers a large decline, making the worst-of outcome worse.\n\n**Three key return scenarios:**\n1. **Bull scenario** (all stocks rise): Called in Year 1, investor earns 25% in one year (25% IRR).\n2. **Sideways scenario** (stocks oscillate near 100%): Note survives all dates, called at maturity if above trigger, higher cumulative coupon.\n3. **Bear scenario** (one stock crashes through barrier): At maturity, investor holds the fallen stock at its depressed level — worst-of delivers a severe loss.",
          highlight: [
            "worst-of",
            "basket",
            "worst-performing",
            "correlation",
            "barrier breach",
            "multi-asset autocallable",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A worst-of autocall references three stocks: Stock A (+15%), Stock B (+5%), Stock C (–45% from initial, breaching the 60% barrier). At maturity, what does the investor receive on a $100,000 investment?",
          options: [
            "$55,000 — the investor receives principal × worst-of performance = $100,000 × 55% because Stock C fell to 55% of initial",
            "$115,000 — the best performer determines the payoff in a worst-of structure",
            "$100,000 — the 60% barrier was designed to protect principal even if one stock falls",
            "$105,000 — coupons accumulated over the life offset Stock C's loss",
          ],
          correctIndex: 0,
          explanation:
            "In a worst-of structure at maturity with barrier breached, the investor receives capital × worst-of final performance. Stock C is at 55% of initial (fell 45%), which is below the 60% barrier. The investor receives $100,000 × 55% = $55,000 — a $45,000 loss. The 60% barrier determines whether protection is triggered, but once breached, the investor bears full downside of the worst performer.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "In a worst-of autocallable, lower correlation between the basket components is beneficial for investors because it increases the chance that at least one stock will perform well enough to trigger the autocall.",
          correct: false,
          explanation:
            "False. Lower correlation increases the dispersion of returns in the basket. While it may improve the chance that one stock does well, it simultaneously increases the risk that one stock suffers a large decline — and in a worst-of structure, the worst performer determines the payoff. Lower correlation is actually HARMFUL for worst-of investors because it raises the tail risk of the worst-of outcome being very bad. That is exactly why issuers can offer higher coupons on low-correlation worst-of notes.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Variance & Volatility Swaps ────────────────────────────────
    {
      id: "struct-prod-variance-swaps",
      title: "Variance & Volatility Swaps",
      description:
        "Realized vs implied variance, variance notional vs vega notional, convexity, and mark-to-market",
      icon: "Activity",
      xpReward: 100,
      difficulty: "advanced",
      duration: 16,
      steps: [
        {
          type: "teach",
          title: "Variance Swap Mechanics",
          content:
            "A **variance swap** is an OTC contract that pays the difference between **realized variance** and a pre-agreed **variance strike** (the price of the swap).\n\n**Payoff formula:**\nPayoff = Variance Notional × (σ²_realized – K_var)\n\nWhere:\n- σ²_realized = annualised realized variance over the life of the swap\n- K_var = variance strike agreed at inception (quoted in vol² units, e.g., 20² = 400)\n- Variance Notional is in dollar terms per variance unit\n\n**Variance vs Vega Notional:**\nTraders more intuitively think in terms of **vega** (sensitivity to a 1-vol-point change). The conversion:\n\nVega Notional = Variance Notional × 2 × K_vol\n\nWhere K_vol = √K_var (the vol strike). So a $100,000 vega notional on a 20-vol swap has:\nVariance Notional = $100,000 ÷ (2 × 20) = **$2,500 per variance point**\n\nIf realized vol comes in at 25 (not 20):\nRealized variance = 625, Strike variance = 400\nProfit = $2,500 × (625 – 400) = **$562,500**\n\n**Realized variance calculation:**\nσ²_daily = (252/n) × Σ[ln(S_i / S_{i-1})]²\n\nVariance is the sum of squared daily log returns, annualised. Note: mean daily return is assumed to be zero (standard market convention) since over short intervals the drift term is negligible.\n\n**Who trades variance swaps?**\n- Volatility hedge funds (long variance when implied vol is cheap)\n- Dealers (short variance to hedge structured product vega books)\n- Event-driven traders (long variance around earnings or macro events)",
          highlight: [
            "variance swap",
            "realized variance",
            "variance strike",
            "variance notional",
            "vega notional",
            "K_var",
            "log returns",
            "annualised",
          ],
        },
        {
          type: "teach",
          title: "Volatility Swaps, Convexity, and Mark-to-Market",
          content:
            "A **volatility swap** pays the difference between realized volatility (the standard deviation, not variance) and a vol strike:\n\nPayoff = Vega Notional × (σ_realized – K_vol)\n\n**Convexity difference — variance vs volatility swaps:**\nVariance is the square of volatility. Because variance is a convex function of vol, a variance swap is worth MORE than a vol swap to a long-vol buyer when large vol moves occur.\n\n- If you're long a variance swap and vol jumps from 20 to 40 (doubles), realized variance quadruples (400 → 1600).\n- If you're long a vol swap and vol doubles, your payoff only doubles.\n\nThis convexity makes variance swaps more attractive than vol swaps in tail risk scenarios — and explains why variance swap strikes trade at a **convexity adjustment** above vol swap strikes on the same underlying.\n\n**Mark-to-Market (MTM) of a variance swap mid-life:**\nAt time t during a T-day swap life:\n\nMTM = Variance Notional × [t/T × σ²_realized_so_far + (T-t)/T × K_var_implied_new – K_var_original]\n\nIn words: the MTM blends the already-realized variance (for t elapsed days) with the new fair market variance for the remaining (T–t) days, then subtracts the original strike.\n\n**Volatility surface and skew impact:**\nVariance swap fair value equals the **integral of weighted implied variances across all strikes** (a key result from the Carr-Madan replication). This means variance swap pricing incorporates the entire volatility surface — not just ATM vol. Higher skew (puts more expensive than calls) lifts the fair variance above the ATM implied variance.",
          highlight: [
            "volatility swap",
            "convexity",
            "convexity adjustment",
            "mark-to-market",
            "variance convexity",
            "vol surface",
            "Carr-Madan",
            "skew",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A hedge fund enters a 3-month variance swap on the S&P 500 as the long side. The variance strike is K_var = 400 (vol strike = 20). Variance notional is $5,000 per point. Realized variance over the period turns out to be 625 (realized vol = 25). What is the fund's profit/loss?",
          options: [
            "Profit of $1,125,000 — realized variance (625) minus strike (400) = 225 variance points × $5,000",
            "Loss of $1,125,000 — the fund is short variance so gains when variance is below strike",
            "Profit of $25,000 — 5 vol points difference × vega notional",
            "Profit of $625,000 — realized variance of 625 × $1,000 per unit",
          ],
          correctIndex: 0,
          explanation:
            "Long variance swap profit = Variance Notional × (Realized Variance – Strike Variance) = $5,000 × (625 – 400) = $5,000 × 225 = $1,125,000. The fund is long variance, so it profits when realized variance exceeds the strike. Realized vol of 25 vs strike of 20 means realized variance of 625 vs strike of 400 — a difference of 225 variance points.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A variance swap buyer receives more profit than a volatility swap buyer (same vega notional, same initial vol strike) when realized volatility turns out to be significantly higher than the strike, due to variance convexity.",
          correct: true,
          explanation:
            "True. Variance is a convex function of volatility (σ² grows faster than σ). For a long position, this convexity benefits the variance swap buyer: if vol jumps from 20 to 40, realized variance goes from 400 to 1600 (an increase of 1200), while a vol swap buyer only gains 20 vol points. This convexity premium is why variance swap strikes trade slightly above equivalent vol swap strikes — the buyer pays for the convexity benefit.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 6: CLN & Credit Structures ────────────────────────────────────
    {
      id: "struct-prod-credit-structures",
      title: "CLN & Credit Structures",
      description:
        "Credit-linked notes, total return swaps, synthetic CDO basics, and counterparty risk",
      icon: "Link",
      xpReward: 100,
      difficulty: "advanced",
      duration: 17,
      steps: [
        {
          type: "teach",
          title: "Credit-Linked Notes (CLN) Mechanics",
          content:
            "A **Credit-Linked Note (CLN)** is a funded credit derivative — the issuing bank packages a bond with an embedded Credit Default Swap (CDS) to transfer credit risk of a **reference entity** to the note investor.\n\n**How it works:**\n1. Investor pays $100 to bank (funds the position)\n2. Bank invests proceeds in risk-free collateral (T-bills)\n3. Bank pays investor: LIBOR/SOFR + CDS spread (e.g., SOFR + 150bp for a BBB reference entity)\n4. If the reference entity suffers a **credit event** (default, restructuring, failure to pay), the note redeems early at recovery value (e.g., 40 cents on the dollar)\n5. If no credit event, investor receives 100% principal at maturity\n\n**CLN vs direct bond investment:**\n- CLN investor bears BOTH the reference entity credit risk AND the issuing bank's credit risk\n- If the bank defaults, the investor loses even if the reference entity is fine\n- CLN allows exposure to entities where bonds are illiquid or unavailable (e.g., private companies, foreign sovereigns)\n\n**Credit events (ISDA definitions):**\n- Bankruptcy\n- Failure to pay (grace period expiry)\n- Obligation acceleration\n- Restructuring (controversial — often excluded in North American CDS)\n- Repudiation/moratorium (sovereign-specific)\n\n**First-to-default baskets:**\nA CLN referencing a basket of 5 companies that triggers on the first default — offering higher spread than any individual CDS because the investor bears the default risk of whichever is the weakest link.",
          highlight: [
            "credit-linked note",
            "CLN",
            "CDS",
            "credit default swap",
            "reference entity",
            "credit event",
            "recovery value",
            "ISDA",
            "first-to-default",
          ],
        },
        {
          type: "teach",
          title: "Total Return Swap (TRS) and Counterparty Risk",
          content:
            "A **Total Return Swap (TRS)** transfers the total economic exposure of a reference asset from one party to another without the asset changing hands.\n\n**Structure:**\n- **Total Return Receiver (TRR):** Receives all coupons/dividends + capital gains of the reference asset; pays SOFR + spread\n- **Total Return Payer (TRP):** Pays coupons + gains; receives SOFR + spread (protected against falls and receives funding)\n\n**Why use a TRS?**\n- Hedge funds gain leveraged exposure without owning the asset (balance sheet efficiency)\n- Banks finance their bond inventory off balance sheet\n- Investors access restricted markets (e.g., emerging market loans)\n\n**Archegos Capital (2021) — TRS disaster:**\nBill Hwang's family office used TRS with multiple prime brokers simultaneously to build massive concentrated positions in media stocks. Because TRS do not require position reporting (only the bank owns the shares), regulators and other counterparties could not see the full exposure. When the positions soured, losses exceeded $100 billion across prime brokers.\n\n**Counterparty risk in credit structures:**\n- **Bilateral OTC risk**: If the counterparty defaults mid-contract, replacement cost can be substantial\n- **CVA (Credit Valuation Adjustment)**: The market value adjustment to account for counterparty default risk; banks must hold capital against CVA\n- **Central clearing (CCPs)**: Post-2008, regulators mandated clearing of standardised CDS/IRS through Central Counterparties (CCPs) like LCH and ICE, introducing daily margining to mitigate bilateral risk",
          highlight: [
            "total return swap",
            "TRS",
            "total return receiver",
            "counterparty risk",
            "CVA",
            "Archegos",
            "central clearing",
            "CCP",
            "off balance sheet",
          ],
        },
        {
          type: "teach",
          title: "Synthetic CDO: Tranching Credit Risk",
          content:
            "A **Collateralised Debt Obligation (CDO)** repackages a pool of credit exposures into tranches with different risk/return profiles. A **synthetic CDO** achieves this using CDS rather than physical bonds.\n\n**Tranche structure (example $1 billion notional):**\n| Tranche       | Attachment | Detachment | Absorbs Losses | Coupon     |\n|---------------|-----------|-----------|----------------|------------|\n| Super Senior  | 12%       | 100%      | 12th–100th     | SOFR+5bp   |\n| Senior        | 7%        | 12%       | 7th–12th       | SOFR+25bp  |\n| Mezzanine     | 3%        | 7%        | 3rd–7th        | SOFR+200bp |\n| Equity        | 0%        | 3%        | First 3%       | SOFR+1000bp|\n\nThe equity tranche absorbs the first 3% of portfolio losses (first loss position). Only after losses exceed 12% does the super senior tranche suffer.\n\n**Correlation risk — the CDO Achilles heel:**\nTraditional CDO models used the **Gaussian copula** (Li model, 2000) to model joint defaults. When default correlation was low, equity tranches were risky but senior tranches were safe. In 2007–2008, the model's correlation assumptions proved disastrously wrong: subprime mortgage defaults were highly correlated because they shared the same underlying cause (falling house prices).\n\n**Delta of a CDO tranche:**\nThe sensitivity of a mezzanine tranche to the overall credit spread level is non-linear — similar to gamma effects in options. Near the attachment point, a small increase in portfolio spread causes disproportionate tranche losses.\n\n**Post-GFC landscape:**\nSynthetic CDOs are now rarely sold to retail investors. The Basel III framework imposes higher capital charges on re-securitisations. However, CLOs (Collateralised Loan Obligations) backed by leveraged loans remain a large and active market.",
          highlight: [
            "CDO",
            "synthetic CDO",
            "tranche",
            "attachment point",
            "detachment point",
            "equity tranche",
            "super senior",
            "Gaussian copula",
            "correlation risk",
            "CLO",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An investor buys a 5-year Credit-Linked Note referencing Company X's debt at SOFR + 200bp. Eighteen months later, Company X files for bankruptcy. Recovery on Company X's bonds is assessed at 35 cents on the dollar. The issuing bank remains solvent. What does the investor receive?",
          options: [
            "35% of principal — the CLN redeems at recovery value when the credit event occurs",
            "100% of principal — principal protection is embedded in all CLNs",
            "0% — a credit event means total loss for CLN investors",
            "100% principal plus 18 months of coupon accrued, then 35% recovery on top",
          ],
          correctIndex: 0,
          explanation:
            "When a credit event occurs, a CLN redeems early at the recovery rate on the reference entity's obligations — in this case 35%. The investor receives $35 per $100 of face value (35% recovery). There is no additional principal protection. The 18 months of accrued coupon that has already been paid is retained, but no additional payments are made after the credit event. The key risk the investor accepted was the reference entity's default risk in exchange for the higher SOFR + 200bp coupon.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A synthetic CDO has a $500 million reference portfolio. The equity tranche covers the first 3% of losses ($15M), the mezzanine tranche covers 3%–8% ($25M), and the senior tranche covers 8%–100% ($460M). Portfolio defaults accumulate to $22 million in total losses.",
          question:
            "How much of the losses are absorbed by each tranche?",
          options: [
            "Equity tranche absorbs $15M (wiped out); mezzanine absorbs $7M of its $25M; senior tranche absorbs $0",
            "Each tranche absorbs $7.3M pro-rata (losses split equally across three tranches)",
            "Senior tranche absorbs all $22M because it is the largest tranche",
            "Mezzanine absorbs all $22M because it is the middle tranche designed to buffer both extremes",
          ],
          correctIndex: 0,
          explanation:
            "Losses are absorbed sequentially from the bottom up. First, the equity tranche (0%–3%) absorbs the first $15M of losses — it is completely wiped out. The remaining $7M ($22M – $15M) flows to the mezzanine tranche (3%–8%), which had $25M of capacity. So mezzanine absorbs $7M and retains $18M. The senior tranche (8%–100%) is unaffected because total losses ($22M = 4.4% of $500M) never reached its attachment point of 8%.",
          difficulty: 3,
        },
      ],
    },
  ],
};
