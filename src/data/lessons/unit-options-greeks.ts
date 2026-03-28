import type { Unit } from "./types";

export const UNIT_OPTIONS_GREEKS: Unit = {
  id: "options-greeks",
  title: "Options Greeks Mastery",
  description:
    "Delta hedging, gamma scalping, theta decay curves, vega and IV dynamics, higher-order Greeks, volatility surface, and real-world Greeks-based risk management",
  icon: "Sigma",
  color: "#8b5cf6",
  lessons: [
    /* ================================================================
       LESSON 1 — Delta & Gamma
       ================================================================ */
    {
      id: "greeks-1-delta-gamma",
      title: "Delta & Gamma",
      description:
        "Delta as probability proxy and hedge ratio, gamma as the accelerator, delta hedging mechanics, gamma scalping, and pin risk",
      icon: "TrendingUp",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Delta: The First-Order Price Sensitivity",
          content:
            "**Delta (Δ)** measures how much an option's price changes per $1 move in the underlying asset.\n\n**Range:** Calls: 0 to +1  |  Puts: −1 to 0\n\n**Numerical Example:**\n- Stock: $100, ATM call delta = 0.50\n- Stock rises $2 → call gains ~$1.00 in value\n- Stock falls $2 → call loses ~$1.00\n\n**Delta as Probability Proxy:**\nDelta approximates the risk-neutral probability that the option expires in-the-money:\n- Deep ITM call (S = $120, K = $100): delta ≈ 0.90 → ~90% chance to expire ITM\n- ATM call (S = $100, K = $100): delta ≈ 0.50 → ~50% chance\n- Far OTM call (S = $80, K = $100): delta ≈ 0.10 → ~10% chance\n\n**Delta as Hedge Ratio:**\nTo hedge 100 short call contracts (each representing 100 shares), a market maker buys:\n`100 × 100 × 0.50 = 5,000 shares`\nThis creates a **delta-neutral** position — small stock moves create near-zero P&L.\n\n**Put-Call Parity Check:**\nFor the same strike and expiry: `Δ_call − Δ_put = 1`\nIf call delta = 0.55, put delta = −0.45 (checks: 0.55 − (−0.45) = 1.00 ✓)\n\n**Delta Decay Toward Expiry:**\n- ITM options: delta approaches 1.0 as T → 0\n- OTM options: delta approaches 0.0 as T → 0\n- ATM options: delta remains near 0.50 until the final day, then collapses to binary 0 or 1",
          highlight: [
            "delta",
            "delta-neutral",
            "probability ITM",
            "hedge ratio",
            "put-call parity",
          ],
        },
        {
          type: "teach",
          title: "Gamma: The Accelerator",
          content:
            "**Gamma (Γ)** is the rate of change of delta with respect to a $1 move in the stock — the second derivative of option price with respect to price.\n\n**Formula:**\n`Γ = N'(d1) / (S · σ · √T)`\nwhere N'(d1) is the standard normal PDF evaluated at d1.\n\n**Numerical Example:**\n- ATM call: gamma = 0.05, delta = 0.50\n- Stock moves from $100 → $101:\n  - New delta ≈ 0.50 + 0.05 = 0.55\n  - P&L from delta: +$0.50; P&L from gamma: +½ × 0.05 × 1² = +$0.025\n  - Total call gain ≈ $0.525\n- Stock moves from $100 → $99:\n  - New delta ≈ 0.50 − 0.05 = 0.45\n  - But call loses only $0.475 (less than $0.525 gained on the upside)\n  - This asymmetry is the **positive gamma convexity benefit**\n\n**Where Gamma Is Largest:**\n- Peaks at the ATM strike\n- Increases dramatically as expiration approaches (ATM gamma can spike 10× in the last week)\n- Decreases for deep ITM or OTM options\n\n**Gamma and P&L:**\nThe gamma P&L over a small move ΔS is:\n`Gamma P&L = ½ × Γ × (ΔS)²`\n\nFor Γ = 0.05 and a $3 move: ½ × 0.05 × 9 = **$0.225 per share**\n\n**Long vs Short Gamma:**\n- Long gamma (bought options): profits from large moves in either direction\n- Short gamma (sold options): profits from small, quiet moves; bleeds when market moves sharply",
          highlight: [
            "gamma",
            "delta change",
            "convexity",
            "long gamma",
            "short gamma",
            "ATM",
          ],
        },
        {
          type: "teach",
          title: "Gamma Scalping and Pin Risk",
          content:
            "**Gamma Scalping** is a strategy where a long-gamma position is delta-hedged repeatedly to capture realized volatility.\n\n**Mechanics:**\n1. Buy 100 ATM calls, initial delta = +50 delta-equivalent shares\n2. Sell 50 shares short to be delta-neutral\n3. Stock rises $2: new delta = +60 → sell 10 more shares to re-neutralize\n4. Stock falls $4: new delta = +40 → buy 20 shares back\n5. Each hedge trade locks in a small profit from the gamma convexity\n\n**Profitability Condition:**\nGamma scalping profits when **realized volatility > implied volatility** (the theta paid).\n- Daily theta cost: if θ = −$50/day, the scalper needs $50 of gamma P&L from re-hedging\n- The breakeven daily move: `ΔS_breakeven = √(2|θ|/Γ)`\n- Example: θ = −$50, Γ = 0.05 → breakeven = √(100/0.05) = √2000 ≈ $44.7 daily move on a 10,000-share position? Simplify: per contract (100 shares): ΔS_be = √(2 × 0.50 / 0.05) = √20 ≈ $4.47\n\n**Pin Risk:**\nAs expiration approaches, if the stock price hovers near a large open-interest strike:\n- Market makers short that strike are caught: if stock finishes just above strike → assigned on calls; just below → not assigned\n- An OTM option becomes ATM within hours, delta flips violently from 0 to 1\n- Real example: On expiry Friday, a stock pinned at $200 as dealers constantly bought/sold to stay neutral, trapping the price at that strike\n\n**Managing Gamma Near Expiry:**\n- Rolling positions to next month 1–2 weeks out eliminates near-expiry gamma spikes\n- Reducing position size as expiry nears lowers tail risk from pin assignment",
          highlight: [
            "gamma scalping",
            "realized volatility",
            "implied volatility",
            "delta-neutral",
            "pin risk",
            "assignment",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A market maker is short 200 ATM call contracts (each = 100 shares) with delta = 0.50 and gamma = 0.06. The stock rises $3. After the move, approximately how many shares must the market maker trade to return to delta-neutral?",
          options: [
            "Buy 3,600 shares",
            "Sell 3,600 shares",
            "Sell 1,800 shares",
            "Buy 1,800 shares",
          ],
          correctIndex: 1,
          explanation:
            "The market maker is short 200 contracts = short 20,000 shares of delta-equivalent. Gamma × ΔS = 0.06 × $3 = 0.18 delta increase per contract. Total delta change: 200 × 100 × 0.18 = 3,600 delta-equivalent shares. Since short the calls, the position is now more short delta. To re-hedge, the market maker must sell 3,600 more shares (going more short in the hedge to offset the increased call delta).",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A long call position always has positive gamma, meaning large moves in either direction increase the position's value relative to a linear (delta-only) approximation.",
          correct: true,
          explanation:
            "Long options — both calls and puts — always have positive gamma. The gamma P&L = ½ × Γ × (ΔS)² is always positive regardless of the direction of ΔS. This convexity means a long option outperforms its delta approximation for large moves in both directions. Short option sellers have negative gamma and therefore lose from large moves.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Theta & Time Decay
       ================================================================ */
    {
      id: "greeks-2-theta-time-decay",
      title: "Theta & Time Decay",
      description:
        "The non-linear theta decay curve, calendar spreads, long vs short theta strategies, and trading theta around events",
      icon: "Clock",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Theta: The Time Value Eroder",
          content:
            "**Theta (Θ)** measures the daily loss in option value due to the passage of time, all else equal. It is almost always negative for option buyers.\n\n**Formula (call, simplified):**\n`Θ = −[S·N'(d1)·σ / (2√T)] − r·K·e^(−rT)·N(d2)`\n\n**Numerical Example:**\n- ATM 30-day call on $100 stock, σ = 25%, r = 5%\n- Option price = $2.98, theta ≈ −$0.063/day\n- In 1 week: option loses ~$0.44, now worth ~$2.54 (with stock unchanged)\n\n**The Non-Linear Decay Curve:**\nTheta is NOT constant — it accelerates exponentially near expiration:\n- 90 days to expiry: θ ≈ −$0.030/day\n- 30 days to expiry: θ ≈ −$0.063/day (2.1× faster)\n- 7 days to expiry: θ ≈ −$0.140/day (4.7× faster)\n- 1 day to expiry: θ ≈ −$0.350/day (11.7× faster)\n\nThis follows the rule: `time value ∝ √T`, so decay rate ∝ `1/(2√T)` — doubling in speed as T halves.\n\n**Weekend/Holiday Effect:**\nOn Fridays, options carry 3 days of theta because markets are closed Saturday/Sunday. This creates a systematic pattern: options are cheapest on Monday morning (after weekend decay is priced out).\n\n**ATM vs OTM Theta:**\n- ATM options have the highest absolute theta (most time value to lose)\n- Deep OTM options have low absolute theta but high theta as a percentage of option premium\n- Deep ITM options have low theta (mostly intrinsic value, little time value)",
          highlight: [
            "theta",
            "time decay",
            "non-linear",
            "ATM",
            "time value",
            "expiration",
          ],
        },
        {
          type: "teach",
          title: "Short Theta vs Long Theta Strategies",
          content:
            "Trading options involves choosing a side of the theta equation. The two fundamental orientations:\n\n**Short Theta (Time Decay Sellers):**\n- Sell options to collect premium; profit if stock stays calm and options expire worthless\n- Strategies: covered calls, cash-secured puts, credit spreads, iron condors, short straddles\n- Example: Sell a 30-day ATM straddle for $5.80 combined. If stock stays within ±$5.80 at expiry, profitable.\n- Risk: unlimited loss on naked short calls; sharp market moves destroy premium sellers\n- Typical edge: IV > RV (implied vol overstates realized moves), so premium collected exceeds gamma losses\n\n**Long Theta (Wait — this doesn't exist!):**\nNo option strategy is simultaneously long theta AND long options. The Theta-Gamma relationship is fundamental:\n`Daily P&L ≈ Θ·Δt + ½·Γ·(ΔS)²`\nLong gamma always comes with negative theta. Short gamma always earns positive theta.\n\n**Calendar Spreads — Trading the Theta Curve:**\nBuy the front-month option (faster theta decay) and sell the back-month option (slower decay):\n- Sell 30-day ATM call for $2.98, Buy 60-day ATM call for $4.12\n- Net debit: $1.14 per share\n- Front-month decays faster → at 30 days, if stock unchanged, you still hold the 30-day call\n- Maximum profit when stock is at the strike at front-month expiration\n- The trade is long vega: a volatility increase benefits the back-month call more\n\n**Theta and Earnings:**\nIV spikes before earnings (uncertainty premium). Post-earnings IV crush means:\n- Short straddle into earnings collects inflated premium; if move is smaller than priced-in, profit\n- Long straddle into earnings needs the move to exceed the total premium paid",
          highlight: [
            "short theta",
            "calendar spread",
            "iron condor",
            "theta-gamma",
            "IV crush",
            "earnings",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An ATM 30-day call has theta = −$0.065/day. An ATM 7-day call on the same stock has theta = −$0.140/day. Why does the 7-day option decay faster in dollar terms per day?",
          options: [
            "The 7-day option has a higher implied volatility, increasing its decay rate",
            "Time value decays proportional to √T, so shorter-dated options lose their remaining time value much faster per calendar day",
            "The 7-day option has a higher delta, which amplifies theta",
            "Theta is always higher for options with less than 14 days remaining due to regulatory requirements",
          ],
          correctIndex: 1,
          explanation:
            "Time value scales with √T (square root of time). The decay rate is the derivative: d(√T)/dT = 1/(2√T). As T decreases, 1/(2√T) increases — so near-expiry options decay much faster per day. With 7 days left vs 30 days, the decay rate ratio is approximately √(30/7) ≈ 2.07, roughly matching the $0.065 vs $0.140 ratio.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "It is Monday morning. A stock has earnings after-market on Thursday. Current ATM straddle (30-day) costs $6.20 with IV = 42%. Historical 30-day realized volatility is 28%. Last four earnings moves averaged ±4.5% on a $100 stock (implying ~$4.50 move). The straddle breakeven requires a ±$6.20 move to profit at expiry.",
          question:
            "Based on this data, which conclusion best describes the straddle's pricing relative to expected outcomes?",
          options: [
            "The straddle is attractively priced because IV is above HV",
            "The straddle appears overpriced: the implied breakeven ($6.20) exceeds the historical average earnings move ($4.50), suggesting the short straddle has a statistical edge",
            "The straddle is underpriced because the stock could move more than $6.20",
            "The straddle cannot be evaluated without knowing the stock's beta",
          ],
          correctIndex: 1,
          explanation:
            "The key comparison is: straddle breakeven ($6.20) vs average realized move ($4.50). If the stock historically moves $4.50 on earnings but the straddle requires $6.20 to profit, the option buyer pays for $6.20 but gets $4.50 on average — a negative expected value. Short straddle sellers have edge here. Note: IV > HV (42% vs 28%) also signals overpricing. That said, past moves don't guarantee future moves — there is always tail risk.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Vega & Implied Volatility
       ================================================================ */
    {
      id: "greeks-3-vega-iv",
      title: "Vega & Implied Volatility",
      description:
        "Vega mechanics, IV vs realized volatility, vol crush around events, long and short vega strategies, and IV percentile/rank",
      icon: "BarChart2",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Vega: Sensitivity to Volatility",
          content:
            "**Vega (ν)** measures how much an option's price changes for a 1 percentage-point change in implied volatility.\n\n**Formula:**\n`ν = S · N'(d1) · √T`\n\n**Numerical Example:**\n- ATM 30-day call on $100 stock, σ = 25%\n- Vega ≈ $0.113 per 1% IV change (per share)\n- Per 100-share contract: vega ≈ $11.30\n- If IV rises from 25% to 30% (+5 points): call gains 5 × $11.30 = **$56.50** in value\n- If IV falls from 25% to 20% (−5 points): call loses $56.50\n\n**Vega Characteristics:**\n- Peaks at ATM options (like gamma)\n- Increases with time to expiration — longer-dated options have much higher vega\n  - 30-day ATM call: vega ≈ $0.11\n  - 90-day ATM call: vega ≈ $0.20 (nearly 2× higher, despite only 3× the time)\n  - LEAPS (2-year): vega ≈ $0.50\n- Both calls and puts have positive vega (higher IV → more valuable regardless of direction)\n\n**IV vs Historical Volatility (HV):**\n- HV (realized vol): what the stock actually moved over the past N days, annualized\n- IV (implied vol): what options buyers/sellers believe will happen; derived from market prices\n- When IV > HV: options are \"expensive\" relative to recent history → favor selling\n- When IV < HV: options are \"cheap\" → favor buying\n- **VIX** is the market's 30-day forward IV on the S&P 500, often called the \"fear gauge\"",
          highlight: [
            "vega",
            "implied volatility",
            "historical volatility",
            "IV vs HV",
            "VIX",
            "ATM",
          ],
        },
        {
          type: "teach",
          title: "Vol Crush and Event Volatility",
          content:
            "**Volatility Crush** is the sharp IV drop that occurs immediately after a scheduled binary event (earnings, FDA decision, FOMC meeting) resolves.\n\n**Why IV Spikes Before Events:**\nOptions sellers demand a premium for bearing binary uncertainty. An earnings surprise can move a stock ±20% in seconds — no amount of delta hedging can protect against this.\n\n**The Vol Crush Sequence:**\n1. Stock trading at $100. IV = 28% normally\n2. One week before earnings: IV climbs to 55%\n3. Day before earnings: IV = 72%\n4. Earnings release (strong results): stock gaps up $8 (+8%)\n5. Next morning: IV collapses back to 30%\n6. The 30-day ATM straddle that cost $9.20 (at 72% IV) is now worth ~$5.40 — despite the stock moving $8!\n\n**Why Buyers Can Lose Despite Being Right:**\nThe straddle buyer paid for ~$9.20 of move. Stock moved $8.00. Net loss = $1.20 even though the direction was correct. The IV premium embedded in the pre-earnings options made them too expensive.\n\n**IV Percentile and IV Rank:**\n- **IV Percentile**: % of days in the past year with IV below current level. IV Pct = 85 means IV is higher than 85% of past year's readings — options are expensive.\n- **IV Rank (IVR)**: `(Current IV − 52W Low) / (52W High − 52W Low) × 100`\n  - IVR = 80: current IV is 80% of the way from annual low to annual high\n  - IVR > 50: generally favor selling; IVR < 30: generally favor buying\n\n**Long vs Short Vega Strategies:**\n- Long vega (buy options, buy straddles/strangles, buy calendars): profit when IV rises\n- Short vega (sell options, sell straddles/condors): profit when IV falls or stays low",
          highlight: [
            "vol crush",
            "IV spike",
            "earnings",
            "IV percentile",
            "IV rank",
            "long vega",
            "short vega",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A stock has current IV = 45%, 52-week IV low = 20%, 52-week IV high = 65%. What is the IV Rank (IVR), and what does it suggest?",
          options: [
            "IVR = 45; current IV is in the 45th percentile, options are fairly priced",
            "IVR = 55.6; IV is well above the midpoint of its annual range, suggesting options are relatively expensive — favor selling strategies",
            "IVR = 77.8; the stock is about to experience a vol crush",
            "IVR = 22.2; IV is near annual lows, favor buying strategies",
          ],
          correctIndex: 1,
          explanation:
            "IVR = (Current IV − 52W Low) / (52W High − 52W Low) × 100 = (45 − 20) / (65 − 20) × 100 = 25/45 × 100 = 55.6. An IVR above 50 indicates current IV is in the upper half of its annual range, suggesting options are relatively expensive compared to historical norms — this generally favors premium-selling strategies. IVR does NOT predict when vol crush happens — it only measures relative IV level.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A long straddle (long call + long put, same strike and expiry) has positive vega, meaning the position benefits when implied volatility increases even if the stock price does not move.",
          correct: true,
          explanation:
            "Both calls and puts have positive vega. A long straddle owns both, so total vega is the sum of call vega plus put vega — both positive. If IV rises from 25% to 35% while the stock price is unchanged, both options increase in value, so the straddle profits. This is why traders buy straddles before expected volatility events even when unsure of direction.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Rho, Vanna & Volga
       ================================================================ */
    {
      id: "greeks-4-rho-vanna-volga",
      title: "Rho, Vanna & Volga",
      description:
        "Interest rate sensitivity with rho, the cross-Greek vanna (delta/vega interaction), volga (vega convexity), and practical applications",
      icon: "GitBranch",
      xpReward: 110,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Rho: Interest Rate Sensitivity",
          content:
            "**Rho (ρ)** measures the change in option price for a 1 percentage-point change in the risk-free interest rate.\n\n**Formula (call):**\n`ρ_call = K · T · e^(−rT) · N(d2)`\n\n**Formulas (put):**\n`ρ_put = −K · T · e^(−rT) · N(−d2)`\n\n**Key Properties:**\n- Call options have positive rho (higher rates → more expensive calls)\n  - Rationale: higher rates reduce the present value of the strike payment K·e^(−rT); you need to pay less today to exercise later, so calls are worth more\n- Put options have negative rho (higher rates → less expensive puts)\n  - Rationale: higher rates reduce the PV of receiving K at expiration; puts benefit less from being long the strike\n\n**Numerical Example:**\n- LEAPS call, 2-year expiry, K = $100, S = $100, σ = 25%, r = 4%\n- Rho ≈ $12.30 per 1% rate change\n- If Fed raises rates 0.25%: call gains ≈ $3.08\n- Same 30-day call: rho ≈ $0.52 per 1% (much smaller — time amplifies rho)\n\n**When Rho Matters Most:**\n- Long-dated options (LEAPS): rho can be the largest Greek\n- Rate-sensitive sectors: utilities, REITs (where rate changes shift stock prices AND rho simultaneously)\n- Interest rate derivatives: caps, floors, swaptions — rho is the primary hedge risk\n- Rising rate environments (2022–2023): LEAPS call holders suffered from both stock declines and negative rho on puts offsetting gains\n\n**Practical Note:**\nFor short-dated equity options (< 60 days), rho is negligible. Most retail traders can safely ignore it unless trading LEAPS or rate-sensitive instruments.",
          highlight: [
            "rho",
            "interest rate",
            "LEAPS",
            "call rho",
            "put rho",
            "risk-free rate",
          ],
        },
        {
          type: "teach",
          title: "Vanna: The Delta-Volatility Cross Greek",
          content:
            "**Vanna** is a second-order (cross) Greek measuring how delta changes when implied volatility changes, and equivalently how vega changes when the stock price moves.\n\n`Vanna = ∂Δ/∂σ = ∂ν/∂S = −N'(d1) · d2 / σ`\n\n**Why Vanna Matters:**\nWhen a stock moves sharply, delta and vega both shift. Vanna quantifies this coupling.\n\n**Numerical Intuition:**\n- OTM call: delta = 0.20, vanna = +0.08\n- IV rises from 25% to 35% (+10 points): delta increases by 0.08 × 10 = +0.80 → new delta ≈ 1.00? No — note vanna is per unit IV, not per point; precise: delta rises to ≈ 0.20 + 0.08 × 0.10 = 0.208. (Small effect in normal conditions.)\n- However, in a large vol spike (e.g., stock crashes, VIX doubles), vanna effects become material\n\n**Vanna in Practice — The Vanna-Volga Market:**\nExotic options pricing (FX barriers, digital options) uses vanna-volga corrections to the Black-Scholes model to account for the vol surface curvature.\n\n**Dealer Vanna Hedging (2020 Context):**\nDuring COVID crash, dealers who were short OTM puts had large positive vanna exposure. As IV spiked and stock prices fell, their delta hedges required massive additional stock selling — this amplified the market decline in a self-reinforcing feedback loop.\n\n**Sign Convention:**\n- OTM calls/puts: positive vanna (higher IV → delta moves toward 0.50)\n- ITM calls: negative vanna above the strike center (higher IV → delta falls toward 0.50)\n- ATM options: vanna = 0 by symmetry",
          highlight: [
            "vanna",
            "delta change",
            "volatility change",
            "second-order greek",
            "exotic options",
            "feedback loop",
          ],
        },
        {
          type: "teach",
          title: "Volga: Vega Convexity",
          content:
            "**Volga** (also called Vomma or DvegaDvol) measures how vega changes when IV changes — the second derivative of option price with respect to volatility.\n\n`Volga = ∂²V/∂σ² = ν · d1 · d2 / σ`\n\nwhere ν is the option's vega.\n\n**Key Property:**\nLong options always have positive volga. Just as long gamma means you profit from large price moves, positive volga means you profit from large volatility moves.\n\n**Intuition:**\n- If IV moves from 25% to 35% (+10 pts), your vega changes. Positive volga means vega itself grew during that move — you collect more vega benefit for large IV moves than a flat-vega approximation would suggest.\n\n**Numerical Example:**\n- Far OTM call (S = $100, K = $120, 60 days, σ = 30%)\n- Vega = $0.045, Volga = $0.012\n- If IV rises 5 pts: first-order vega gain = 5 × $0.045 = $0.225\n- But volga shows vega grew by $0.012 × 5 = $0.06 during the move\n- Better estimate: $0.225 + ½ × 0.012 × 25 = $0.225 + $0.15 = $0.375 (67% larger!)\n\n**Volga in the Vol Surface:**\nVolga explains why OTM wings (far OTM options) are systematically more expensive than BS predicts:\n- Traders pay extra for OTM options because their positive volga means they benefit disproportionately from vol-of-vol (volatility of volatility)\n- This is the structural reason behind the volatility smile — OTM puts and calls trade at higher IV than ATM\n\n**Hierarchy of Greeks:**\n`Price` → delta → gamma (convexity in price)\n`Price` → vega → volga (convexity in vol)\n`Delta` → vanna (delta × vol cross-sensitivity)",
          highlight: [
            "volga",
            "vomma",
            "vega convexity",
            "vol-of-vol",
            "volatility smile",
            "OTM wings",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A trader holds a 2-year LEAPS call option (K = $150, S = $150, σ = 30%). The Federal Reserve unexpectedly cuts rates by 0.50%. Which statement correctly describes the impact?",
          options: [
            "The call gains value because lower rates reduce borrowing costs for the company",
            "The call loses value because rho for calls is positive, meaning lower rates reduce call value",
            "The call is unaffected; rho only matters for bond options",
            "The call gains value because lower rates increase the present value of the strike",
          ],
          correctIndex: 1,
          explanation:
            "Calls have positive rho: when rates rise, calls gain value; when rates fall, calls lose value. The intuition: the call gives you the right to pay K in the future. Higher rates make future payments cheaper in PV terms (you earn more on the cash you hold instead of exercising). A 0.50% rate cut on a 2-year LEAPS call with rho ≈ +$12 per 1% means the call loses approximately $6.00 per share from the rate change alone.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Volatility Surface
       ================================================================ */
    {
      id: "greeks-5-vol-surface",
      title: "Volatility Surface",
      description:
        "The IV smile, volatility skew, term structure of volatility, sticky-strike vs sticky-delta regimes, and practical trading implications",
      icon: "Layers",
      xpReward: 110,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "The Volatility Smile and Skew",
          content:
            "If Black-Scholes were perfectly correct, IV would be constant across all strikes for the same expiry — a flat line. In reality, the IV surface shows systematic patterns:\n\n**The Volatility Smile (FX Markets):**\nIn currency options, IV forms a U-shape: both far OTM calls and far OTM puts trade at higher IV than ATM options. This reflects:\n- Demand for downside protection (OTM puts) and upside speculation (OTM calls)\n- Fat tails in currency return distributions (jump risk)\n\n**The Volatility Skew (Equity Markets):**\nIn equity options, the IV curve is NOT symmetric — it's a downward slope:\n- Far OTM puts (K << S): IV = 35–40%\n- ATM (K ≈ S): IV = 25%\n- Far OTM calls (K >> S): IV = 18–20%\n\n**Reasons for Negative Equity Skew:**\n1. **Crash risk premium**: Investors buy portfolio insurance (OTM puts) → extra demand inflates put IV\n2. **Leverage effect**: When stock prices fall, leverage increases → volatility rises. This negative correlation between price and vol makes downside moves inherently more volatile\n3. **Supply/demand**: Market makers hedge by buying OTM puts, structurally inflating their price\n\n**Practical Skew Metrics:**\n- **25-delta risk reversal**: IV(25Δ call) − IV(25Δ put). Negative in equities (−3% to −8% typical)\n- **Skew slope**: change in IV per 10% move in strike (often −1% to −2% per strike level)\n\n**Example Trade — Skew Fade:**\n- Sell OTM put at IV = 38%, buy OTM call at IV = 20%, delta-neutral → net short skew\n- Profits if IV skew normalizes (crisis premium unwinds)",
          highlight: [
            "volatility smile",
            "volatility skew",
            "OTM puts",
            "crash risk",
            "negative skew",
            "risk reversal",
          ],
        },
        {
          type: "teach",
          title: "Term Structure of Volatility",
          content:
            "The **term structure of volatility** describes how IV varies across different expiration dates for the same strike.\n\n**Normal (Contango) Term Structure:**\nTypically, longer-dated options have higher IV than shorter-dated ones:\n- 1-week IV = 18%\n- 1-month IV = 22%\n- 3-month IV = 26%\n- 1-year IV = 30%\n\nLonger horizons carry more uncertainty accumulation → higher IV.\n\n**Inverted Term Structure (Backwardation):**\nDuring crises or ahead of major events, short-term IV spikes above long-term:\n- 1-week IV = 65% (earnings tomorrow!)\n- 1-month IV = 40%\n- 3-month IV = 35%\n\nThe market prices imminent risk higher than distant risk — a mean-reversion assumption.\n\n**Calendar Spread P&L Decomposition:**\nA long calendar spread (sell 30-day, buy 60-day) profits from:\n1. Theta: front-month decays faster\n2. Volatility term structure: if front-month IV falls more than back-month (vol structure steepens)\n\n**VIX Term Structure Trading:**\nVIX futures curve reflects the market's expectation of future volatility:\n- Contango (VIX futures > spot VIX): VIX expected to rise — buying back-month VIX futures has positive carry cost\n- Backwardation (VIX futures < spot VIX): vol expected to fall — shorting VIX futures profitable if curve normalizes\n\n**The Volatility Surface Combined:**\nThe full 3D surface has:\n- X-axis: Strike (or delta/moneyness)\n- Y-axis: Expiration\n- Z-axis: Implied volatility\nA vol surface model (SVI, SABR, local-vol) must be arbitrage-free: no calendar spreads or butterfly spreads should have negative value.",
          highlight: [
            "term structure",
            "contango",
            "backwardation",
            "calendar spread",
            "VIX futures",
            "vol surface",
            "SABR",
          ],
        },
        {
          type: "teach",
          title: "Sticky Strike vs Sticky Delta",
          content:
            "When the stock price moves, how does the IV surface shift? Two fundamental models describe this:\n\n**Sticky Strike Model:**\nEach strike K retains its fixed IV as the spot price moves.\n- If stock moves from $100 → $105, the $100 strike still has IV = 28%, the $105 strike still has IV = 26%\n- But NOW the ATM strike is $105 (IV = 26%), not $100 (IV = 28%)\n- ATM IV has effectively fallen as the stock rose\n- Implication: delta in a sticky-strike world = Black-Scholes delta (standard delta)\n\n**Sticky Delta Model:**\nIV is anchored to the option's delta (moneyness level), not the absolute strike.\n- If stock moves from $100 → $105, the ATM strike becomes $105 with the SAME IV as the old ATM ($100)\n- IV \"travels\" with the stock price — the shape of the smile stays fixed relative to spot\n- Implication: effective delta in sticky-delta world is higher than BS delta for calls (because as stock rises, you move up the skew toward higher-IV territory)\n\n**Which Model is More Accurate?**\n- Empirically: equities exhibit behavior closer to **sticky delta** (IV skew is anchored to moneyness levels that move with the stock)\n- FX markets: roughly sticky delta (vol smile is nearly symmetric)\n- Post-crash scenarios: neither model is perfect; actual vol often overshoots both predictions\n\n**Practical Impact — Delta Hedging:**\nUnder sticky delta, the correct hedge ratio is:\n`Effective Δ = BS Δ + ν × (dσ/dS)`\nwhere dσ/dS is the slope of the IV surface at the current spot. For negative skew equities:\n- OTM puts have dσ/dS < 0 (IV rises as stock falls)\n- Effective put delta = BS put delta + vega × (negative slope)\n- This makes OTM puts act \"heavier\" than BS delta alone — a critical dealer hedging insight",
          highlight: [
            "sticky strike",
            "sticky delta",
            "skew",
            "effective delta",
            "moneyness",
            "delta hedging",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "The S&P 500 is at 4,000. A 30-day put at strike 3,800 (5% OTM) has IV = 28%. The ATM (4,000 strike) put has IV = 22%. The S&P falls to 3,800, making the 3,800 put now ATM. Under a STICKY DELTA model, what happens to the 3,800 put's IV?",
          options: [
            "It stays at 28% because the strike is fixed and sticky strike applies",
            "It drops to approximately 22%, because ATM options trade at ATM IV regardless of which strike becomes ATM",
            "It rises to approximately 35% because the market crash increases all IVs",
            "It becomes undefined because BS cannot price after a 5% decline",
          ],
          correctIndex: 1,
          explanation:
            "Under sticky delta, the IV assigned to an option depends on its moneyness (delta level), not its absolute strike. When S&P falls from 4,000 to 3,800, the 3,800 strike is now ATM (50-delta). In sticky delta, ATM options always trade at 'ATM IV' (22% in this case). The 3,800 strike effectively inherits the ATM IV of 22% — its IV fell from 28% to 22% as it moved from being an OTM put to an ATM put. This is the vol crush that happens to OTM puts when the stock falls to the strike.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 6 — Greeks in Practice
       ================================================================ */
    {
      id: "greeks-6-in-practice",
      title: "Greeks in Practice",
      description:
        "Aggregating position Greeks, P&L attribution with Greeks, risk management thresholds, and real-world dealer hedging workflows",
      icon: "Activity",
      xpReward: 115,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Aggregating Position Greeks",
          content:
            "A real options book contains dozens of positions. Greeks are **additive** — the portfolio Greek is the sum of individual position Greeks (scaled by contracts and shares per contract).\n\n**Example Portfolio:**\n\n| Position | Qty | Delta | Gamma | Theta | Vega |\n|---|---|---|---|---|---|\n| Long 50 AAPL 170 calls | +50 | +0.55 | +0.040 | −$18 | +$9.20 |\n| Short 30 AAPL 180 calls | −30 | −0.35 | −0.030 | +$12 | −$6.00 |\n| Long 20 AAPL 160 puts | +20 | −0.40 | +0.035 | −$14 | +$7.80 |\n\n**Position Aggregation (per share × 100 shares/contract):**\n- Total Delta = (50×0.55 − 30×0.35 − 20×0.40) × 100 = (27.5 − 10.5 − 8.0) × 100 = **+900 delta**\n- Total Gamma = (50×0.040 − 30×0.030 + 20×0.035) × 100 = (2.0 − 0.9 + 0.70) × 100 = **+180 gamma**\n- Total Theta = 50×(−18) − 30×(−12) + 20×(−14) wait — correct per contract: **= −$900 + $360 − $280 = −$820/day**\n- Total Vega = 50×$9.20 − 30×$6.00 + 20×$7.80 = $460 − $180 + $156 = **+$436 per 1% IV move**\n\n**Interpreting the Portfolio:**\n- Delta +900: exposed to upside (equiv. to owning 900 shares of AAPL)\n- Gamma +180: positive convexity — large AAPL moves benefit the book\n- Theta −$820: costs $820/day in time decay\n- Vega +$436: benefits if AAPL IV rises 1 point\n\n**Delta Hedge:** To neutralize the +900 delta, short 900 shares of AAPL.",
          highlight: [
            "position greeks",
            "additive",
            "portfolio delta",
            "portfolio gamma",
            "portfolio vega",
            "delta hedge",
          ],
        },
        {
          type: "teach",
          title: "Greeks P&L Attribution",
          content:
            "**P&L Attribution** decomposes the day's option book P&L into each Greek's contribution. This is how trading desks understand what drove profits or losses.\n\n**Daily P&L Decomposition Formula:**\n`ΔV ≈ Δ·ΔS + ½·Γ·(ΔS)² + Θ·Δt + ν·Δσ + ρ·Δr`\n\n**Worked Example:**\n- Portfolio: Δ = +900, Γ = +180, Θ = −$820/day, ν = +$436/1%\n- Day's events: AAPL fell $3, IV rose 0.5%, 1 calendar day passed\n\n**Attribution:**\n1. Delta P&L: 900 × (−$3) = **−$2,700**\n2. Gamma P&L: ½ × 180 × (−$3)² = ½ × 180 × 9 = **+$810**\n3. Theta P&L: −$820 × 1 = **−$820**\n4. Vega P&L: 436 × 0.5 = **+$218**\n5. Total estimated P&L: −$2,700 + $810 − $820 + $218 = **−$2,492**\n\n**Unexplained P&L (\"Greeks P&L vs Actual\"):**\nActual P&L might be −$2,600. The gap of −$108 is due to:\n- Higher-order Greeks (speed, vanna, volga) not captured\n- Bid-ask spread changes\n- Slippage and transaction costs\n- Model errors (actual IV surface shift was nonlinear)\n\n**Risk Limits by Greek:**\nProfessional desks set hard limits:\n- Max daily delta: ±50,000 shares equivalent\n- Max overnight gamma: ±5,000\n- Max daily theta burn: −$50,000\n- Max vega: ±$100,000 per 1% IV move\nBreaching limits triggers automatic alerts and required hedging.",
          highlight: [
            "P&L attribution",
            "delta P&L",
            "gamma P&L",
            "theta P&L",
            "vega P&L",
            "risk limits",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A market maker's book has: Delta = −2,000, Gamma = +500, Theta = +$1,200/day, Vega = −$800 per 1% IV. The stock moves +$5 in one day and IV rises 2%. What is the estimated daily P&L from these four Greeks?",
          options: [
            "Delta: −$10,000 | Gamma: +$6,250 | Theta: +$1,200 | Vega: −$1,600 | Total: −$4,150",
            "Delta: +$10,000 | Gamma: +$6,250 | Theta: +$1,200 | Vega: +$1,600 | Total: +$19,050",
            "Delta: −$10,000 | Gamma: −$6,250 | Theta: +$1,200 | Vega: −$1,600 | Total: −$16,650",
            "Delta: −$10,000 | Gamma: +$6,250 | Theta: −$1,200 | Vega: +$1,600 | Total: −$3,350",
          ],
          correctIndex: 0,
          explanation:
            "Delta P&L = −2,000 × $5 = −$10,000 (negative delta means you lose when stock rises). Gamma P&L = ½ × 500 × ($5)² = ½ × 500 × 25 = +$6,250 (positive gamma always profits from large moves). Theta P&L = +$1,200 (positive theta earns each day — this is a short-options book). Vega P&L = −$800 × 2 = −$1,600 (negative vega loses when IV rises). Total = −$10,000 + $6,250 + $1,200 − $1,600 = −$4,150.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are a volatility trader managing a short gamma, short vega iron condor book. The portfolio has: Delta ≈ 0 (hedged), Gamma = −800, Theta = +$2,400/day, Vega = −$1,200 per 1% IV. Earnings season begins and VIX jumps from 18 to 28 overnight (+10 points). The underlying barely moves (ΔS = $0.50).",
          question:
            "What is the estimated overnight P&L and what does this tell you about the main risk of short vol strategies?",
          options: [
            "P&L ≈ −$12,000 from vega alone; short vol strategies have uncapped vega risk when IV spikes without a corresponding stock move",
            "P&L ≈ +$2,400 from theta; since the stock barely moved, the iron condor profits as expected",
            "P&L ≈ +$2,300 overall; gamma loss on $0.50 move is negligible, theta compensates",
            "P&L ≈ −$800 from gamma; the main risk is stock movement, not IV",
          ],
          correctIndex: 0,
          explanation:
            "Vega P&L = −$1,200 × 10 = −$12,000. Gamma P&L = ½ × (−800) × (0.50)² = −$100. Theta P&L = +$2,400. Total ≈ −$12,000 − $100 + $2,400 = −$9,700. The dominant driver is the vega loss from the IV spike. This illustrates the core risk of short vol strategies: IV can spike even without large stock moves (e.g., during macro uncertainty or broad fear spikes). One night of +10 IV points wiped out 4 days of theta. Professional short-vol traders manage vega exposure carefully with long-dated hedges or VIX call spreads.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A portfolio with zero net delta cannot lose money from a large instantaneous stock price move, because delta is the primary driver of directional P&L.",
          correct: false,
          explanation:
            "Even with zero delta, a large stock move creates P&L through gamma: Gamma P&L = ½ × Γ × (ΔS)². If gamma is negative (short gamma position), a large move — in either direction — generates a loss. A $10 move on a portfolio with Γ = −200 produces ½ × (−200) × 100 = −$10,000. Delta-neutral only protects against small, infinitesimal moves. For large moves, gamma (and even higher-order speed) dominate the P&L.",
          difficulty: 3,
        },
      ],
    },
  ],
};
