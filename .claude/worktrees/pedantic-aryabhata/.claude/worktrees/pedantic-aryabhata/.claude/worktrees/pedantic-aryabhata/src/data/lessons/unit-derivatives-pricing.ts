import type { Unit } from "./types";

export const UNIT_DERIVATIVES_PRICING: Unit = {
  id: "derivatives-pricing",
  title: "Derivatives Pricing",
  description:
    "Master Black-Scholes, Monte Carlo pricing, Greeks, volatility models, and exotic derivatives",
  icon: "Calculator",
  color: "#7c3aed",
  lessons: [
    // ─── Lesson 1: Black-Scholes Model ───────────────────────────────────────────
    {
      id: "deriv-pricing-1",
      title: "Black-Scholes Model",
      description:
        "The mathematics and intuition behind the foundational options pricing framework — and where it breaks down",
      icon: "FunctionSquare",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Black-Scholes Assumptions & Geometric Brownian Motion",
          content:
            "The **Black-Scholes-Merton (BSM)** model, published in 1973, provides a closed-form formula for pricing European options. It rests on six key assumptions:\n\n1. **Geometric Brownian Motion (GBM):** The underlying asset price follows dS = μS dt + σS dW, where μ is drift, σ is constant volatility, and dW is a Wiener process increment.\n2. **Constant volatility:** σ does not change over time or with price level.\n3. **No dividends:** The underlying pays no cash distributions during the option's life.\n4. **Frictionless markets:** No transaction costs, taxes, or restrictions on short-selling.\n5. **Continuous trading:** You can rebalance the hedge continuously.\n6. **Log-normal returns:** Since ln(S_T/S_0) is normally distributed, prices can never go negative.\n\n**Why GBM?** The percentage change in price (not the dollar change) is normally distributed. This means returns are symmetric and the future price distribution is log-normal — right-skewed, with a positive minimum at zero.",
          highlight: [
            "Black-Scholes-Merton",
            "geometric Brownian motion",
            "GBM",
            "constant volatility",
            "log-normal",
            "frictionless markets",
            "continuous trading",
          ],
        },
        {
          type: "teach",
          title: "The BSM Formula: Structure and Intuition",
          content:
            "**Call Option Price:**\nC = S·N(d1) – K·e^(–rT)·N(d2)\n\nWhere:\n- **d1** = [ln(S/K) + (r + σ²/2)·T] / (σ√T)\n- **d2** = d1 – σ√T\n- N(·) = cumulative standard normal distribution\n- S = current stock price, K = strike, r = risk-free rate, T = time to expiry\n\n**Put Option Price (via put-call parity):**\nP = K·e^(–rT)·N(–d2) – S·N(–d1)\n\n**Intuition behind d1 and d2:**\n- **N(d2)** is the **risk-neutral probability** that the call expires in-the-money (i.e., S_T > K under the risk-neutral measure). It answers: how likely is the option to finish ITM?\n- **N(d1)** is the option's **delta** — the hedge ratio telling you how many shares to hold to replicate the option's payoff. It is N(d2) adjusted for the expected growth of the stock.\n- **K·e^(–rT)·N(d2):** present value of the strike payment made if the option expires ITM.\n- **S·N(d1):** the risk-neutral expected value of receiving the stock conditional on expiring ITM.\n\nAt the moment of valuation, BSM gives the unique price that allows no-arbitrage replication.",
          highlight: [
            "d1",
            "d2",
            "N(d2)",
            "risk-neutral probability",
            "delta",
            "hedge ratio",
            "put-call parity",
            "no-arbitrage",
          ],
        },
        {
          type: "teach",
          title: "BSM Limitations & Risk-Neutral Pricing",
          content:
            "**Where BSM fails in practice:**\n\n1. **Volatility smile/skew:** Markets imply higher IV for OTM puts than ATM options, forming a smile. BSM assumes flat IV — it cannot explain this empirically observed pattern.\n2. **Fat tails (leptokurtosis):** Real returns have more extreme moves than the normal distribution predicts — crashes like 1987 or 2020 are assigned near-zero probability under GBM.\n3. **Jump risk:** Stocks can gap on earnings, M&A news, or macro shocks — continuous-path GBM excludes these jumps.\n4. **Stochastic volatility:** Volatility itself is random and mean-reverting — BSM's constant-σ assumption is systematically violated.\n\n**Risk-Neutral Pricing Principle:**\nIn a complete, frictionless market, there exists a unique **risk-neutral measure Q** under which all assets earn the risk-free rate. By pricing options as the discounted Q-expectation of their payoff — C = e^(–rT) × E^Q[max(S_T – K, 0)] — we ensure no-arbitrage without needing to know investors' actual risk preferences. This is the bedrock of modern derivatives pricing.",
          highlight: [
            "volatility smile",
            "volatility skew",
            "fat tails",
            "leptokurtosis",
            "jump risk",
            "stochastic volatility",
            "risk-neutral measure",
            "complete market",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "BSM consistently underestimates the price of deep out-of-the-money put options in equity markets. What is the primary reason?",
          options: [
            "Equity markets exhibit a negative volatility skew — OTM puts trade at higher implied volatility than ATM options due to crash risk and demand for downside protection",
            "BSM overestimates the time value of OTM options because it ignores dividends",
            "The risk-free rate used in BSM is always too high, making put values too low",
            "OTM puts have near-zero delta, so BSM's hedge ratio becomes unreliable for pricing",
          ],
          correctIndex: 0,
          explanation:
            "Real equity markets display a volatility skew (negative skew): OTM puts carry higher implied volatility than ATM options because investors pay a premium for crash protection (negative tail hedging demand). BSM assumes flat, constant volatility — so it uses a single σ that underestimates the true market price of OTM puts. This is the core empirical failure of BSM and the motivation for stochastic volatility models.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Under Black-Scholes, N(d2) represents the delta of the call option — the number of shares needed to delta-hedge one short call.",
          correct: false,
          explanation:
            "False. N(d1) is the call option's delta — the hedge ratio indicating how many shares to hold to replicate the option. N(d2) is the risk-neutral probability that the call expires in-the-money (S_T > K under the Q-measure). The two quantities differ because d1 incorporates the expected growth of the stock conditional on expiring ITM, while d2 does not.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Greeks — Sensitivities & Hedging ──────────────────────────────
    {
      id: "deriv-pricing-2",
      title: "Greeks: Sensitivities & Hedging",
      description:
        "Delta, gamma, theta, vega, and rho — the risk dimensions of every option position",
      icon: "Activity",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Delta & Gamma: Price Sensitivity and Convexity",
          content:
            "**Delta (Δ):**\nDelta measures the change in option price per $1 change in the underlying. For a call, Δ = N(d1) ∈ [0, 1]; for a put, Δ = N(d1) – 1 ∈ [–1, 0].\n\n- ATM call: Δ ≈ 0.50\n- Deep ITM call: Δ → 1 (behaves like the stock)\n- Deep OTM call: Δ → 0 (nearly worthless)\n\n**Delta-neutral hedging:** A market maker short 100 calls with Δ = 0.60 buys 60 shares to offset directional risk. This hedge must be continuously rebalanced as price moves.\n\n**Gamma (Γ):**\nGamma is the rate of change of delta — the second-order sensitivity to price: Γ = ∂²C/∂S². It is highest for ATM options near expiry and falls for deep ITM/OTM options.\n\n- **Long gamma (long options):** Your delta increases when the stock rises and decreases when it falls — you automatically become more long into rallies and more short into declines. This is the convexity benefit of owning options.\n- **Short gamma (short options):** Delta moves against you. You must buy high and sell low to remain hedged — gamma scalping is costly.\n- A portfolio with positive gamma profits from large moves in either direction, regardless of direction.",
          highlight: [
            "delta",
            "gamma",
            "delta-neutral",
            "hedge ratio",
            "long gamma",
            "short gamma",
            "convexity",
            "gamma scalping",
          ],
        },
        {
          type: "teach",
          title: "Theta, Vega & Rho: Time, Volatility & Rate Sensitivities",
          content:
            "**Theta (Θ) — Time Decay:**\nTheta is the daily erosion in option value as time passes, all else equal. It is always negative for long options.\n\n- ATM options lose the most value per day (highest theta in absolute terms)\n- Theta accelerates as expiry approaches — the final week of life sees the fastest decay\n- **Theta-gamma trade-off:** Long options pay theta (you lose a little each day) but profit from large moves via gamma. Short options earn theta (daily carry) but suffer from large moves. The fair value of an option equates these two forces.\n\n**Vega (ν) — Volatility Sensitivity:**\nVega measures the change in option price for a 1% increase in implied volatility. All long options have positive vega — buying options means buying volatility.\n\n- At-the-money, long-dated options have the highest vega\n- A long straddle is a pure vega play: profits if realized vol exceeds the implied vol you paid\n- **IV expansion:** In a crisis, IV spikes — long option holders benefit even without directional move\n\n**Rho (ρ) — Interest Rate Sensitivity:**\nRho measures sensitivity to the risk-free rate. Calls have positive rho (higher rates → higher call value), puts have negative rho.\n\n- Rho is small for short-dated options (less than 3 months) and grows with tenor\n- For most retail traders, rho is the least critical Greek — but it matters for LEAPS and institutional rate books",
          highlight: [
            "theta",
            "time decay",
            "theta-gamma trade-off",
            "vega",
            "implied volatility",
            "long vega",
            "rho",
            "LEAPS",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "You are long 10 call options on a stock. The stock drops 5% in one session. What happens to your delta, gamma, and theta all else equal?",
          options: [
            "Delta falls (calls move further OTM), gamma falls (peak gamma is at ATM and you moved away from it), theta magnitude falls (OTM options decay slower than ATM)",
            "Delta rises (put-call parity forces delta up), gamma stays constant, theta falls",
            "Delta falls, gamma rises (OTM options have higher gamma than ATM), theta is unchanged",
            "Delta and gamma are unchanged because you did not rebalance; only theta changes",
          ],
          correctIndex: 0,
          explanation:
            "When the stock falls, the calls move toward OTM territory. Delta decreases toward zero as the strike becomes less likely to be breached. Gamma is highest for ATM options — moving away from ATM (toward OTM) causes gamma to fall. Theta magnitude also falls: deeply OTM options have little time value left to decay. All three Greeks shrink in absolute terms as the option drifts further out-of-the-money.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A derivatives desk sold 500 contracts of a 1-month ATM call (Δ = 0.52, Γ = 0.08, Θ = –$120/day per contract, ν = $180/1% IV per contract). The desk delta-hedged by buying shares. The next morning, implied volatility jumps 4% on a macro shock, but the stock price is unchanged.",
          question: "What is the desk's approximate P&L for the day?",
          options: [
            "Loss of approximately $300,000 — the short vega position loses $180 × 4 × 500 = $360,000 from IV expansion, partially offset by $60,000 theta earned",
            "Gain of $60,000 — only theta matters since price and delta did not change",
            "Loss of $60,000 — theta is negative for short options",
            "Gain of $360,000 — selling options profits when IV spikes because premium received is now worth more",
          ],
          correctIndex: 0,
          explanation:
            "The desk is short options, so it is short vega. A 4% IV jump hurts: vega loss = $180 × 4 × 500 = $360,000. Theta earned = $120 × 500 = $60,000 (positive for short options — they collect time decay). Net P&L ≈ –$360,000 + $60,000 = –$300,000. The delta hedge neutralizes directional P&L since the stock was unchanged, leaving vega and theta as the dominant drivers.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Volatility Surface & Smile ────────────────────────────────────
    {
      id: "deriv-pricing-3",
      title: "Volatility Surface & Smile",
      description:
        "Implied volatility, the volatility smile, term structure, and stochastic volatility models",
      icon: "BarChart2",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Implied Volatility: BSM in Reverse",
          content:
            "**Implied volatility (IV)** is the value of σ that, when plugged into the BSM formula, produces the option's market-observed price. It is solved numerically by inverting BSM — typically with Newton-Raphson iteration:\n\nσ_new = σ_old – (BSM(σ_old) – Market Price) / Vega\n\n**IV as a market consensus:** IV encodes what market participants collectively expect about future realized volatility. It is a forward-looking, demand-driven quantity — not a statistical forecast.\n\n**IV vs. Realized Volatility (HV):**\n- **IV > HV:** Options are expensive relative to what actually occurs — historically, selling options at high IV generates positive carry\n- **IV < HV:** Options are cheap — buying underpriced vol can be profitable\n- The spread (IV – HV) is the **volatility risk premium** — the reward for selling insurance\n\n**VIX — The Fear Index:**\nThe CBOE VIX measures the 30-day implied volatility of the S&P 500 using a model-free replication approach across all listed strikes. VIX = 20 implies the market expects annualized S&P moves of ~20%, or roughly ±1.15% per day. VIX > 30 signals elevated fear; VIX < 15 signals complacency.",
          highlight: [
            "implied volatility",
            "IV",
            "Newton-Raphson",
            "realized volatility",
            "historical volatility",
            "volatility risk premium",
            "VIX",
          ],
        },
        {
          type: "teach",
          title: "The Volatility Smile, Skew & Term Structure",
          content:
            "**Volatility Smile:**\nIn a pure BSM world, IV would be flat across all strikes — but empirically it is not. Plotting IV against strike (or moneyness) reveals a curve:\n\n- **Equity skew (negative skew):** OTM puts have significantly higher IV than ATM or OTM calls. Investors pay a premium for downside protection (portfolio insurance demand), pushing put prices — and implied vols — up.\n- **FX smile:** Currency options often show a symmetric smile — both OTM calls and puts are expensive, reflecting two-sided jump risk.\n- **Commodity smirk:** Upside calls can be expensive relative to puts (supply disruptions spike prices).\n\n**Why the skew exists in equities:**\n1. Leverage effect: stock prices and volatility are negatively correlated — crashes coincide with vol spikes\n2. Supply/demand: index fund managers structurally buy OTM puts as tail hedges\n3. Fat tails: the market assigns higher probability to extreme down-moves than a normal distribution implies\n\n**Volatility Term Structure:**\n- Short-dated IV reacts sharply to near-term events (earnings, Fed meetings); long-dated IV is more stable\n- **Contango in vol:** Long-dated IV > short-dated IV — normal state; the market expects uncertainty to revert gradually\n- **Backwardation in vol:** Short-dated IV > long-dated IV — occurs during active crises (March 2020, 2008); near-term fear dominates\n- The **VIX futures curve** shows this structure in real time",
          highlight: [
            "volatility smile",
            "volatility skew",
            "negative skew",
            "moneyness",
            "leverage effect",
            "term structure",
            "contango",
            "backwardation",
          ],
        },
        {
          type: "teach",
          title: "Stochastic Volatility & Local Volatility Models",
          content:
            "**Heston Model (1993):**\nThe most widely used stochastic volatility model adds a second stochastic process for variance:\n\ndS = μS dt + √v · S dW_S\ndv = κ(θ – v) dt + ξ√v dW_v\nCorrelation: dW_S · dW_v = ρ dt\n\n- **v** = instantaneous variance (√v = volatility)\n- **κ** = speed of mean reversion (how fast vol returns to long-run average θ)\n- **θ** = long-run mean variance\n- **ξ** = volatility of volatility (vol-of-vol)\n- **ρ** = correlation between spot and vol — negative for equities (leverage effect)\n\nHeston generates a skew naturally via negative ρ and can produce smiles via vol-of-vol ξ. It has a semi-closed-form solution via Fourier methods.\n\n**Local Volatility (Dupire, 1994):**\nDupire's formula derives a deterministic function σ(S, t) such that BSM with this time- and price-dependent volatility exactly reproduces the observed market surface:\n\nσ²(K, T) = [∂C/∂T + rK·∂C/∂K] / [½K²·∂²C/∂K²]\n\nLocal vol perfectly fits the current surface but produces unrealistic forward vol dynamics — the smile tends to flatten over time, which disagrees with empirical observation. Stochastic vol models (Heston, SABR) are preferred when forward vol dynamics matter.",
          highlight: [
            "Heston model",
            "stochastic volatility",
            "mean reversion",
            "vol-of-vol",
            "leverage effect",
            "local volatility",
            "Dupire",
            "volatility surface",
            "SABR",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "The VIX is currently at 20, and an individual stock's 30-day IV is at 40. What does this tell us about the stock relative to the broad market?",
          options: [
            "The stock is expected to be roughly twice as volatile as the S&P 500 over the next 30 days — reflecting higher idiosyncratic risk (earnings, litigation, sector volatility)",
            "The stock is undervalued because high IV implies the market underestimates its true price appreciation potential",
            "The stock's beta must be greater than 2.0, because IV scales directly with beta",
            "The stock has recently experienced a 40% price decline, and IV is measuring realized historical volatility",
          ],
          correctIndex: 0,
          explanation:
            "Implied volatility of 40 on the individual stock vs. VIX at 20 means the market prices roughly 2× the annualized price swing for that stock compared to the index. Single stocks carry idiosyncratic risk (earnings surprises, company-specific events) that diversifies away in the index — so higher individual stock IV relative to VIX is normal and expected. IV is a forward-looking implied measure, not a realized or historical one, and it does not map directly to beta (diversifiable risk is separate from market beta).",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In the Heston model, a more negative correlation ρ between the spot price process and the variance process produces a steeper negative volatility skew in equity options.",
          correct: true,
          explanation:
            "True. In the Heston model, the correlation ρ between spot returns (dW_S) and variance innovations (dW_v) is the primary driver of the volatility skew. When ρ is negative (as it empirically is for equities — the leverage effect), large negative price moves tend to coincide with volatility spikes. This makes OTM puts more expensive in implied vol terms relative to ATM options, generating the characteristic negative skew observed in equity option markets. The more negative ρ is, the steeper the skew.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Exotic Options & Structured Products ─────────────────────────
    {
      id: "deriv-pricing-4",
      title: "Exotic Options & Structured Products",
      description:
        "Barrier options, Asian options, digitals, compound options, lookbacks, and quanto structures",
      icon: "Puzzle",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Barrier Options: Conditional Protection at Lower Cost",
          content:
            "**Barrier options** are path-dependent options that are activated (knock-in) or terminated (knock-out) when the underlying price crosses a pre-specified barrier level.\n\n**Knock-In (KI):** The option comes into existence only if the barrier is reached.\n- **Up-and-In Call:** Standard call that activates if the stock rises above the barrier. Cheaper than a vanilla call — you only get the option if the stock moves significantly.\n- **Down-and-In Put:** Protective put that activates if the stock falls below the barrier — used for tail risk hedging at a fraction of vanilla put cost.\n\n**Knock-Out (KO):** The option is cancelled if the barrier is breached.\n- **Down-and-Out Call:** Bull position that is extinguished if the stock drops below the barrier. Dramatically cheaper than a vanilla call — you sacrifice protection in a deep decline.\n- **Up-and-Out Put:** Bear position terminated if the stock rallies through the barrier.\n\n**Key pricing insight:**\nKnock-In + Knock-Out (same strike, same barrier) = Vanilla option\nSo: KI Price + KO Price = Vanilla Price\n\nBarriers are quoted in OTC markets and widely used in structured retail products, FX hedging programs, and equity-linked notes. The proximity of the current spot to the barrier dramatically affects delta — barrier options can have explosive gamma near the barrier level.",
          highlight: [
            "barrier options",
            "knock-in",
            "knock-out",
            "up-and-in",
            "down-and-in",
            "down-and-out",
            "path-dependent",
            "OTC",
          ],
        },
        {
          type: "teach",
          title: "Asian, Digital, Compound & Lookback Options",
          content:
            "**Asian Options (Average Price Options):**\nPayoff is based on the average price of the underlying over the option's life, not the final spot price.\n- Call payoff: max(Average(S) – K, 0)\n- **Why average?** Averaging reduces the impact of price manipulation near expiry and smooths out single-day spikes — making them popular in oil markets, commodity hedging, and FX programs for multinational companies.\n- Cheaper than vanilla options: the average is less volatile than the spot, so IV is effectively lower.\n\n**Digital (Binary) Options:**\nPay a fixed amount ($1 or $100) if expiry condition is met, zero otherwise.\n- **Cash-or-nothing call:** Pays $1 if S_T > K, zero otherwise. Price = e^(–rT) × N(d2).\n- Deep ITM binary ≈ e^(–rT) (certain payout, discounted). Deep OTM binary ≈ 0.\n- Used in structured notes, FX conditional forwards, and as building blocks for more complex structures.\n\n**Compound Options (Options on Options):**\nA call on a call gives the right to buy a call option at a pre-agreed premium on a future date.\n- 4 varieties: call on call, call on put, put on call, put on put\n- Used in M&A financing: a company in takeover negotiations buys a call on a call — the option to later acquire the right to buy target shares. Minimizes upfront capital commitment.\n\n**Lookback Options:**\n- **Floating lookback call:** Payoff = S_T – min(S over life) — you always buy at the lowest price\n- **Fixed lookback call:** Payoff = max(max(S) – K, 0) — you strike at the highest price\n- Extremely expensive (you cannot be worse off than optimal); used as benchmarks and in certain wealth-management wraps.\n\n**Quanto Options:**\nA quanto adjusts the payoff from one currency to another at a fixed exchange rate. E.g., a USD investor buys a quanto call on Nikkei 225 in USD terms — they get the Nikkei return in dollars without FX exposure. Widely used by institutions for cross-border equity exposure without FX risk.",
          highlight: [
            "Asian option",
            "average price",
            "digital option",
            "binary option",
            "cash-or-nothing",
            "compound option",
            "lookback option",
            "quanto",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A commodity producer wants downside protection on oil prices for the next 6 months but believes oil prices will not drop more than 20% — and wants to pay significantly less than a vanilla put. Which exotic option is most appropriate?",
          options: [
            "Down-and-in put with a barrier at –20% of current spot — activates only if the large drop occurs, providing cheap tail protection exactly when needed",
            "Asian put option — uses the average price over 6 months, reducing the cost of the hedge",
            "Lookback put option — guarantees the strike will be set at the highest price over the period",
            "Digital put option — pays a fixed amount if oil falls at all below the strike",
          ],
          correctIndex: 0,
          explanation:
            "A down-and-in (knock-in) put with the barrier at –20% of current spot is ideal: it is much cheaper than a vanilla put because it only activates if oil actually crosses the barrier. The producer gets cheap protection precisely for the tail scenario they are concerned about. An Asian put uses the average price and is cheaper, but it pays on average — not on the actual spot — which may not provide full protection in a sharp drop. Lookback puts are extremely expensive. Digital puts pay a fixed amount rather than covering actual losses.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "The sum of a down-and-in call price and a down-and-out call price (same strike, same barrier, same expiry) must equal the vanilla call price.",
          correct: true,
          explanation:
            "True. This is the barrier option parity relationship. In every price scenario, exactly one of the two options is active at expiry: either the barrier was breached (knock-in activates, knock-out terminates) or it was not (knock-in never activates, knock-out survives). Since they partition all possible paths, their combined payoff at every node equals the vanilla call payoff. By no-arbitrage, KI + KO = Vanilla.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Monte Carlo & Binomial Pricing ────────────────────────────────
    {
      id: "deriv-pricing-5",
      title: "Monte Carlo & Binomial Pricing",
      description:
        "Numerical methods for pricing options when closed-form solutions do not exist",
      icon: "GitBranch",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Binomial Tree: Building the Price Lattice",
          content:
            "The **binomial tree model** (Cox, Ross, Rubinstein, 1979) discretizes time into N equal steps and models each step as either an up-move or down-move.\n\n**Risk-Neutral Parameters:**\n- Up factor: u = e^(σ√Δt)\n- Down factor: d = 1/u (ensures recombining tree)\n- Risk-neutral probability of up: p = (e^(rΔt) – d) / (u – d)\n- Risk-neutral probability of down: 1 – p\n\n**Pricing algorithm (backward induction):**\n1. Build the stock price tree forward: at node (i, j), S = S₀ · u^j · d^(i–j)\n2. At the final nodes, compute option payoff: max(S – K, 0) for calls\n3. Work backward: at each node, option value = e^(–rΔt) × [p × V_up + (1–p) × V_down]\n\n**European vs. American options:**\nFor European options, backward induction is applied directly. For American options, at each node you compare the continuation value (from discounting) with the intrinsic value (immediate exercise). The option value = max(continuation value, intrinsic value).\n\nAs N → ∞, the binomial tree converges to the BSM formula for European options. For American options, it is one of the primary numerical methods since no closed-form solution exists for American puts.",
          highlight: [
            "binomial tree",
            "up factor",
            "down factor",
            "risk-neutral probability",
            "backward induction",
            "early exercise",
            "American option",
            "recombining tree",
          ],
        },
        {
          type: "teach",
          title: "Monte Carlo Simulation: Pricing by Path",
          content:
            "**Monte Carlo (MC)** pricing simulates thousands of asset price paths under the risk-neutral measure, computes the option payoff on each path, and discounts the average.\n\n**Algorithm for a European call:**\n1. Draw N standard normal variates Z_i ~ N(0,1)\n2. Simulate terminal price: S_T^(i) = S₀ · exp[(r – σ²/2)T + σ√T · Z_i]\n3. Compute payoff: V_i = max(S_T^(i) – K, 0)\n4. Option price ≈ e^(–rT) × (1/N) × ΣV_i\n\nWith N = 10,000 paths, MC converges to the true price with a standard error of σ_payoff / √N.\n\n**Variance Reduction Techniques:**\n- **Antithetic variates:** For each Z, also simulate –Z. The paired paths are negatively correlated, reducing variance by ~50% at no extra computation cost.\n- **Control variates:** Use a related instrument with known analytical price (e.g., a European vanilla option) to correct the MC estimate using the known-vs-simulated error.\n- **Importance sampling:** Shift the simulation distribution to concentrate paths in the most important region (e.g., near the barrier for barrier options).\n\n**Path-dependent options require full path simulation:**\nFor Asian options, you need the average of S at each step — not just S_T. For barrier options, you need to check the barrier at each step along the path. For lookback options, you need the running min/max. This is where MC becomes indispensable: no closed-form solution exists for most path-dependent payoffs with stochastic volatility.\n\n**Longstaff-Schwartz (LSM) for American options:**\nLS solves the early-exercise problem in MC by regressing continuation values on basis functions of the current state variables at each exercise date — providing an approximation of the optimal stopping boundary.",
          highlight: [
            "Monte Carlo",
            "path simulation",
            "variance reduction",
            "antithetic variates",
            "control variates",
            "importance sampling",
            "path-dependent",
            "Longstaff-Schwartz",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Why can you NOT use the closed-form Black-Scholes formula to price an American put option?",
          options: [
            "The American put has an early exercise premium — the holder may optimally exercise before expiry when the put is sufficiently deep in-the-money, creating a free boundary problem that has no closed-form solution",
            "BSM only works for calls, not puts — the formula has no put equivalent",
            "American options have dividends by definition, and BSM assumes no dividends",
            "BSM requires a single expiry date, but American options have multiple exercise dates that must all be priced simultaneously",
          ],
          correctIndex: 0,
          explanation:
            "The American put's early exercise feature creates a free boundary problem: at each point in time, there exists an optimal stock price below which it is better to exercise immediately (collecting intrinsic value) than to hold the option. The location of this boundary is itself an unknown that must be solved simultaneously with the option price — yielding a partial differential equation with a moving boundary. No closed-form solution exists. Numerical methods (binomial trees, finite difference, or Longstaff-Schwartz Monte Carlo) are required. Note: a closed-form BSM put formula exists for European puts via put-call parity.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Antithetic variates in Monte Carlo simulation reduce variance by pairing each simulated path with its mirror image (using –Z instead of +Z), which introduces negative correlation between paired estimates and reduces the overall standard error.",
          correct: true,
          explanation:
            "True. Antithetic variates exploit the negative correlation between a path simulated with Z and one simulated with –Z. Since the payoffs for these paired paths are negatively correlated, their average has lower variance than two independent draws. The variance of (V(Z) + V(–Z))/2 = (Var[V(Z)] + Var[V(–Z)] + 2Cov[V(Z),V(–Z)])/4. The negative covariance term reduces the total variance, typically by 30–60% depending on the payoff structure — delivering faster convergence at no extra computational cost.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A quantitative analyst needs to price a 6-month Asian call option on crude oil futures, where the payoff is max(Average_Monthly_Price – $85, 0). The oil price exhibits stochastic volatility (Heston dynamics) and the option is American-style (early exercise allowed at any month-end).",
          question:
            "Which combination of pricing methods is most appropriate?",
          options: [
            "Monte Carlo simulation with Heston variance paths and Longstaff-Schwartz regression for early exercise, averaging prices at each month-end step",
            "Black-Scholes formula with historical volatility as the input and an early exercise correction factor",
            "Binomial tree with 6 steps only (one per month), using a single constant volatility",
            "Binomial tree with 1,000 steps using constant volatility — sufficient for any exotic payoff",
          ],
          correctIndex: 0,
          explanation:
            "This option has three layers of complexity: (1) path-dependency — the payoff depends on average price, requiring the full price path; (2) stochastic volatility — Heston dynamics cannot be ignored when vol itself is stochastic; (3) American early exercise — requires the Longstaff-Schwartz regression approach within MC. Black-Scholes cannot handle stochastic vol or path-dependency. A binomial tree with constant vol misses the Heston dynamics and handles Asian averaging poorly. Monte Carlo with Heston vol simulation and LS regression is the standard industry approach for this type of instrument.",
          difficulty: 3,
        },
      ],
    },
  ],
};
