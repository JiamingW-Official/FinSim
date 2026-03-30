import type { Unit } from "./types";

export const UNIT_VOLATILITY_SURFACE: Unit = {
  id: "volatility-surface",
  title: "Options Volatility Surface",
  description:
    "Master one of the most powerful concepts in professional options trading — the volatility surface. Understand how implied volatility is derived, why the smile and skew exist, how term structure shapes opportunity, and how regime changes in volatility create and destroy strategies",
  icon: "",
  color: "#7c3aed",
  lessons: [
    // ─── Lesson 1: Implied vs Realized Volatility ────────────────────────────────
    {
      id: "volatility-surface-1",
      title: "📐 Implied vs Realized Volatility",
      description:
        "How IV is backed out from market option prices, the VIX methodology, the persistent IV premium over realized vol, and what it means for option sellers",
      icon: "BookOpen",
      xpReward: 100,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What Is Implied Volatility?",
          content:
            "**Implied volatility (IV)** is the market's collective forecast of how much an underlying asset will move over the life of an option. Unlike historical volatility, which looks backward at what already happened, IV is forward-looking — it is extracted from current option prices.\n\n**How IV is calculated — the inversion problem:**\nThe Black-Scholes model takes five inputs (spot price, strike, time to expiry, risk-free rate, and volatility) and outputs a theoretical option price. The real world flips this: we observe the market price of the option and solve backward for the volatility that would produce that price. Since there is no closed-form solution for this inversion, traders use iterative numerical methods (Newton-Raphson is most common).\n\n**Reading IV in practice:**\n- If an at-the-money 30-day call is priced at $3.50 and the model implies σ = 22%, that 22% is the IV\n- IV is always annualized: a 22% IV means the market expects a ±22% price range over one year at roughly one standard deviation\n- For 30-day options, scale to daily: 22% ÷ √252 ≈ 1.39% daily expected move\n- For 7-day options: 22% ÷ √52 ≈ 3.05% weekly expected move\n\n**Why IV matters beyond pricing:**\n- IV embeds risk premiums: fear, uncertainty, tail risk demand\n- IV can compress or expand independently of the underlying price moving\n- A position can lose money on a correct directional bet if IV collapses after entry (the \"long gamma trap\")\n- Professional options traders often focus more on IV levels than on direction",
          highlight: ["implied volatility", "Black-Scholes", "inversion", "annualized", "risk premium"],
        },
        {
          type: "teach",
          title: "The VIX — Fear Gauge Mechanics",
          content:
            "The **CBOE Volatility Index (VIX)** is the most widely followed measure of expected volatility in global markets. Understanding its methodology reveals important nuances that most investors miss.\n\n**VIX methodology (post-2003 model-free approach):**\nThe modern VIX does NOT use Black-Scholes or a single ATM option. Instead, it aggregates implied volatilities across the entire strip of S&P 500 options expiring near 30 days:\n- Uses both calls and puts across a wide range of strikes\n- Weights each option's contribution by its distance from the current price\n- Interpolates between the two nearest monthly expirations to achieve exactly a 30-day horizon\n- The result is a model-free variance swap rate, expressed as annualized volatility\n\n**Reading VIX levels historically:**\n- Below 12: Extreme complacency — historically associated with late-stage bull markets\n- 12–20: Normal, low-anxiety market environment\n- 20–30: Elevated concern; markets are uncertain\n- Above 30: Fear and panic; major dislocations often underway\n- Above 50: Extreme crisis (COVID March 2020 hit 85; 2008–2009 peaked at 89)\n\n**Key VIX properties:**\n- **Mean-reverting**: VIX spikes violently but always reverts toward the 15–20 long-run average\n- **Negatively correlated with SPX**: VIX typically rises as markets fall (−0.7 to −0.8 correlation)\n- **Asymmetric spikes**: VIX can double in days but rarely falls as fast — fear arrives faster than calm\n- **VIX futures are NOT the VIX**: VIX ETPs (VXX, UVXY) track VIX futures, which have decay costs — a critical distinction",
          highlight: ["VIX", "model-free", "variance swap", "mean-reverting", "VIX futures"],
        },
        {
          type: "teach",
          title: "The IV Premium — Why Option Sellers Have an Edge",
          content:
            "One of the most empirically robust phenomena in options markets is the **IV premium**: implied volatility systematically overestimates future realized volatility over long periods. This is the structural edge that option sellers exploit.\n\n**The data:**\n- Since 1990, SPX 1-month ATM IV has averaged roughly 19–20%\n- Over the same period, realized 1-month volatility has averaged roughly 15–16%\n- The spread — known as the **volatility risk premium (VRP)** — has averaged ~4 percentage points\n- Option sellers have collected this premium in approximately 70–75% of monthly cycles\n\n**Why does the VRP exist?**\n1. **Demand imbalance**: Large institutional investors persistently buy puts to hedge equity portfolios, creating excess demand that pushes put premiums above fair value\n2. **Crash insurance cost**: Options are like insurance — buyers accept a negative expected value in exchange for tail risk protection\n3. **Uncertainty premium**: Forecasting volatility is genuinely hard; sellers charge a premium for accepting that uncertainty\n4. **Liquidity premium**: Option sellers provide liquidity; they are compensated for being on the \"wrong side\" of hedging flows\n\n**The catch — left-tail risk:**\nThe VRP is not free money. Option sellers face catastrophic, non-linear losses during crash events. VIX spikes of 50–100% happen in days; a short volatility position can lose years of premium collection in one week. The edge is real but the risk is asymmetric and tail-heavy.",
          highlight: ["IV premium", "volatility risk premium", "VRP", "realized volatility", "tail risk"],
        },
        {
          type: "quiz-mc",
          question:
            "A 30-day at-the-money option has an implied volatility of 24%. Approximately what daily move does the market expect at one standard deviation?",
          options: [
            "1.51%",
            "0.96%",
            "2.40%",
            "0.24%",
          ],
          correctIndex: 0,
          explanation:
            "To convert annual IV to daily: divide by √252 (trading days per year). 24% ÷ √252 = 24% ÷ 15.87 ≈ 1.51%. This means the market expects roughly a ±1.51% daily move about 68% of the time. Understanding this scaling is essential for sizing option positions and assessing whether premium is cheap or expensive relative to likely actual moves.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The VIX index is calculated using only at-the-money S&P 500 options and the Black-Scholes model to extract a single implied volatility estimate.",
          correct: false,
          explanation:
            "The modern VIX (post-2003) uses a model-free methodology that aggregates implied volatilities across a wide range of strikes — both calls and puts — for S&P 500 options near 30 days to expiration. It does NOT rely on Black-Scholes or a single strike. This model-free approach measures expected variance directly from the full strip of option prices, making it more robust and directly interpretable as the price of a variance swap.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 2: Volatility Smile & Skew ──────────────────────────────────────
    {
      id: "volatility-surface-2",
      title: "😊 The Volatility Smile & Skew",
      description:
        "Why low-strike puts command higher IV than calls, how crash risk is priced into the skew, and how traders use skew as a market sentiment indicator",
      icon: "TrendingUp",
      xpReward: 105,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Breakdown of Black-Scholes Flatness",
          content:
            "The original Black-Scholes model assumes volatility is constant across all strikes and expirations. If this were true, all options on the same underlying expiring on the same date would have the same implied volatility regardless of strike price. Markets proved this assumption spectacularly wrong.\n\n**What markets actually show:**\nWhen you plot implied volatility against strike price (or moneyness), you do not get a flat line. Instead:\n- **Pre-1987**: IV was roughly flat across strikes — consistent with Black-Scholes\n- **Post-1987 crash**: A persistent \"smile\" or \"skew\" emerged and has never gone away\n- **Equity markets specifically**: Show a pronounced downward skew — low-strike puts have significantly higher IV than high-strike calls\n\n**Why 1987 was the inflection point:**\nThe Black Monday crash (October 19, 1987) saw the Dow drop 22.6% in a single day — an event that Black-Scholes probability assigned essentially zero likelihood. After experiencing this impossibility made real, market participants permanently repriced tail risk. Cheap out-of-the-money puts — the insurance nobody thought they needed — are now perpetually expensive.\n\n**Three shapes you encounter:**\n1. **Skew (\"smirk\")**: IV rises steeply as strike decreases — dominant in equity indices\n2. **Smile**: IV rises symmetrically on both OTM calls and puts — common in FX and commodities\n3. **Flat**: Rare in practice; suggests no directional crash risk pricing",
          highlight: ["Black-Scholes", "constant volatility", "1987 crash", "skew", "smile"],
        },
        {
          type: "teach",
          title: "Equity Skew — Crash Insurance Pricing",
          content:
            "**Equity skew** is the systematic pattern where out-of-the-money puts on equity indices trade at higher implied volatility than at-the-money or out-of-the-money calls. It is one of the most persistent and economically important phenomena in all of derivatives markets.\n\n**Measuring skew:**\n- **25-delta skew**: IV(25Δ put) − IV(25Δ call) — a positive number means puts are more expensive\n- **Risk reversal**: Long the call, short the put at equal delta — the risk reversal price reflects the skew cost\n- **Typical SPX skew**: 25-delta puts might trade 4–8 IV points higher than equivalent calls\n\n**Why equity skew exists — three forces:**\n1. **Portfolio hedging demand**: Pension funds, endowments, and institutional investors persistently buy downside puts to protect equity portfolios. This constant demand inflates put IV above its actuarially fair level\n2. **Leverage effect**: Equity volatility tends to rise as stocks fall. Declining prices increase financial leverage for levered companies, which mechanically increases volatility — creating a real asymmetry in the distribution\n3. **Jump-diffusion reality**: Stock markets experience sudden, large downward gaps (crashes) far more frequently than upward gaps. Markets now correctly price this by demanding higher premiums for left-tail options\n\n**Reading skew as a sentiment indicator:**\n- Steep skew → strong demand for downside protection → elevated fear\n- Flat or inverted skew → call demand exceeds put demand → possible speculative fever\n- Skew often steepens BEFORE major market declines as smart money buys protection\n- In meme-stock episodes (GameStop 2021), calls became more expensive than puts — skew inverted",
          highlight: ["equity skew", "25-delta skew", "risk reversal", "portfolio hedging", "jump-diffusion"],
        },
        {
          type: "teach",
          title: "FX Smile vs Equity Skew — Why Shapes Differ",
          content:
            "Not all underlying assets show the same volatility structure. Understanding why different markets develop different smile shapes deepens your intuition about what the market is actually pricing.\n\n**FX markets — the symmetric smile:**\nCurrency pairs typically show IV rising for both OTM puts and OTM calls relative to ATM, creating a U-shaped smile. For EUR/USD:\n- Both a 10% EUR rally AND a 10% EUR decline are plausible tail events\n- There is no persistent one-directional crash risk — currencies can gap in either direction (a currency crisis can be a collapse OR a sudden appreciation)\n- Both importers and exporters buy options for hedging, creating symmetric demand across put and call strikes\n\n**Commodity markets — context-dependent:**\n- **Crude oil**: Typically right-skewed (calls more expensive than puts) because supply shocks can spike prices violently upward — geopolitical events, OPEC cuts\n- **Natural gas**: Very steep smile due to extreme bilateral jump risk in both directions\n- **Agricultural commodities**: Right-skewed in drought years, otherwise mixed\n\n**Key skew metrics traders watch:**\n- **SKEW Index (CBOE)**: Measures the price of tail risk in S&P 500 options on a standardized scale; values above 130 indicate significant tail-risk demand\n- **Put/Call ratio**: High ratios signal heavy put-buying — a contrarian indicator of excessive fear\n- **Skew term structure**: Whether near-term or longer-dated puts carry more premium — indicates urgency of fear",
          highlight: ["FX smile", "symmetric smile", "right-skewed", "SKEW Index", "put/call ratio"],
        },
        {
          type: "quiz-mc",
          question:
            "In a typical S&P 500 options market, which of the following best describes the volatility skew?",
          options: [
            "Out-of-the-money puts trade at higher IV than out-of-the-money calls",
            "All strikes have approximately equal implied volatility",
            "Out-of-the-money calls trade at higher IV than out-of-the-money puts",
            "At-the-money options have the highest IV of any strike",
          ],
          correctIndex: 0,
          explanation:
            "S&P 500 options exhibit a pronounced downward skew (sometimes called a 'smirk'): OTM puts trade at significantly higher IV than OTM calls. This reflects persistent institutional demand for downside protection, the leverage effect (volatility rises as markets fall), and the post-1987 memory of sudden large crashes. This skew is one of the most persistent and well-documented phenomena in derivatives markets.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The volatility smile in FX markets and the volatility skew in equity index markets are caused by the same economic forces — both reflect fear of downside crashes.",
          correct: false,
          explanation:
            "The FX smile and equity skew have different economic origins. The FX smile is symmetric because currency markets have bilateral crash risk — a currency can gap strongly in either direction, and both importers and exporters demand protection creating symmetric demand. The equity skew is asymmetric (tilted toward expensive puts) because equity portfolios face one-directional crash risk, institutional hedgers persistently buy puts, and the leverage effect causes vol to rise as prices fall. The same shape can arise from very different economic pressures.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Volatility Term Structure ─────────────────────────────────────
    {
      id: "volatility-surface-3",
      title: "📅 Volatility Term Structure",
      description:
        "How implied volatility varies across expiration dates, the mechanics of vol contango vs backwardation, and what term structure signals about market expectations",
      icon: "BarChart2",
      xpReward: 105,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Vol Term Structure — What It Measures",
          content:
            "**Volatility term structure** is the relationship between implied volatility and time to expiration for options at the same moneyness (typically at-the-money). It answers a simple but powerful question: does the market expect more uncertainty over the next 30 days or the next 12 months?\n\n**Normal (contango) term structure:**\nIn calm markets, IV typically rises with expiration — short-dated options have lower IV than long-dated options. This makes intuitive sense: over longer horizons, more uncertain events can occur (earnings, elections, economic cycles, geopolitical shocks). Long-dated volatility is structurally higher because there is more unknown.\n\n**Inverted (backwardation) term structure:**\nDuring periods of acute stress, near-term IV spikes sharply above longer-dated IV. This inversion signals that the market perceives immediate, specific risk — an upcoming event, a crisis already underway — more severe than any risk over the next year. Classic inversions occur:\n- During earnings announcements (3-day IV can be enormous)\n- At the start of a market crash (near-term panic dominates)\n- Around central bank decisions when uncertainty is maximal\n\n**Practical implications:**\n- In contango: short-dated option sellers collect less premium per day but the term structure provides a tailwind (theta accelerates near expiration)\n- In backwardation: near-term options are expensive relative to longer-dated; calendar spreads become attractive",
          highlight: ["term structure", "contango", "backwardation", "near-term IV", "long-dated IV"],
        },
        {
          type: "teach",
          title: "VIX Futures Contango and Its Consequences",
          content:
            "The VIX futures market provides one of the clearest real-world manifestations of volatility term structure — and one of the most exploited structural phenomena in modern markets.\n\n**How VIX futures contango works:**\n- Spot VIX is the 30-day expected volatility for the S&P 500\n- VIX futures expire monthly and price in expected VIX at that future date\n- In normal markets (VIX below historical averages), the futures curve slopes upward: VIX spot might be 14, 1-month future 15, 2-month 16, 3-month 17\n- This contango exists because: (a) volatility is mean-reverting — low vol is expected to rise back to average; (b) uncertainty compounds over time\n\n**The mechanical decay in VIX products:**\nExchange-traded products like VXX (iPath S&P 500 VIX ST Futures ETN) must constantly roll expiring front-month futures into the next month's futures. In contango:\n- They sell the cheaper expiring contract and buy the more expensive next contract\n- This systematic buy-high/sell-low rolling creates persistent negative roll yield\n- VXX lost approximately 99%+ of its value from inception in 2009 to its delisting, almost entirely from roll decay\n\n**Backwardation provides the opposite:**\n- When VIX is elevated (crisis), the futures curve inverts — front-month futures trade above back-month\n- Rolling in backwardation is profitable: sell expensive near-term, buy cheaper far-term\n- This is why volatility ETPs can spike dramatically during stress but rapidly decay in normalization\n\n**The short-vol trade:**\nMany hedge funds systematically short VIX futures or sell S&P straddles to harvest the contango carry. This trade generates consistent small profits but faces catastrophic risk during vol spikes — exemplified by the February 2018 \"Volmageddon\" when XIV (inverse VIX ETP) lost 96% in a single day.",
          highlight: ["VIX futures", "contango", "roll yield", "VXX", "backwardation", "Volmageddon"],
        },
        {
          type: "teach",
          title: "Using Term Structure in Trading Decisions",
          content:
            "Understanding term structure gives traders actionable edges across multiple strategies.\n\n**Identifying cheap vs expensive vol across expiries:**\n- If near-term IV is 28% and 3-month IV is 22%, the market prices near-term risk as more severe — either a specific event is priced in, or panic is elevated\n- If near-term IV is 18% and 3-month IV is 28%, normal contango prevails — nothing imminent, just long-run uncertainty\n\n**Calendar spread mechanics:**\nA calendar spread (time spread) buys a long-dated option and sells a short-dated option at the same strike:\n- **Long calendar in contango**: Benefits if the short-dated option decays faster than the long-dated one (theta positive overall); profits if vol remains stable\n- **Short calendar in backwardation**: Collects premium from the inverted term structure; profits if vol normalizes\n- Calendar spreads have positive vega for the long leg and negative vega for the short leg — they are a bet on term structure normalization\n\n**Term structure as a regime indicator:**\n- Steep upward slope → complacency, near-term calm, possible late-cycle signal\n- Flat → transition state, uncertainty about near vs long-term\n- Inverted → acute near-term fear; historically a mean-reverting buying opportunity for equities\n\n**The 3-month/1-month spread as a tactical tool:**\nMany volatility traders watch the spread between 3-month ATM IV and 1-month ATM IV:\n- When this spread is very wide (>5 IV points), near-term vol is cheap relative to long-term — favor short-dated strategies\n- When the spread is narrow or inverted, near-term vol is expensive — favor long-dated or diagonal spreads",
          highlight: ["calendar spread", "theta", "vega", "term structure normalization", "cheap vol"],
        },
        {
          type: "quiz-mc",
          question:
            "The VIX spot is at 13 and VIX futures for the next three months are priced at 14, 15.5, and 16.5 respectively. What term structure is this and what does it imply for investors in VXX?",
          options: [
            "Contango; VXX will suffer negative roll yield as it buys more expensive futures each month",
            "Backwardation; VXX will benefit from rolling down the futures curve",
            "Contango; VXX will benefit because higher futures prices mean higher returns",
            "Backwardation; VXX will suffer losses because volatility is declining",
          ],
          correctIndex: 0,
          explanation:
            "This is a classic contango structure — futures prices rise with expiration. VXX must continuously sell expiring front-month futures (cheapest) and buy the next month's futures (more expensive). This buy-high/sell-low rolling creates persistent negative roll yield. Historically, VXX has lost value in roughly 75–80% of months due to this structural drag, which is why it functions better as a short-term hedge than a buy-and-hold investment.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An inverted (backwardated) VIX futures curve typically indicates that markets expect volatility to remain elevated indefinitely, so it is a bearish long-term signal for equities.",
          correct: false,
          explanation:
            "VIX term structure inversion actually signals that near-term fear is acute but the market expects volatility to normalize over time — which is the opposite of expecting indefinitely elevated vol. Because VIX is mean-reverting, extreme backwardation historically has been a contrarian bullish signal for equities: the worst of the fear is typically priced into the near-term. Famous examples include the COVID crash bottom (March 2020) and the 2018 and 2011 corrections — all accompanied by sharp backwardation, followed by strong recoveries.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Trading the Volatility Surface ────────────────────────────────
    {
      id: "volatility-surface-4",
      title: " Trading the Volatility Surface",
      description:
        "Surface arbitrage constraints, calendar spreads, risk reversals, variance swaps, and practical vol trading strategies used by professional desks",
      icon: "Zap",
      xpReward: 115,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Surface Arbitrage — No-Free-Lunch Constraints",
          content:
            "The volatility surface must satisfy certain **no-arbitrage constraints**. If these constraints are violated, risk-free profits become available. Understanding these constraints is essential before attempting any surface trading.\n\n**Constraint 1 — Calendar spread no-arbitrage:**\nTotal variance (IV² × T) must be non-decreasing with time to expiration at the same strike. If a 1-month option has higher total variance than a 3-month option at the same strike, a static calendar spread generates a free profit. This enforces the practical rule: IV can decrease with term, but it must not decrease fast enough to reduce total variance.\n\n**Constraint 2 — Butterfly no-arbitrage:**\nThe volatility smile must be convex at every expiration (the middle of a butterfly cannot be worth more than the wings). Violations create tradeable arbitrages via butterfly spreads.\n\n**Constraint 3 — Put-Call parity:**\nBy no-arbitrage, puts and calls at the same strike and expiration must have the same implied volatility. Apparent violations are due to dividends, borrow costs, or American exercise features — not real IV discrepancies.\n\n**Constraint 4 — Positive density:**\nThe probability density function implied by the surface must be non-negative at every point. Negative densities arise when the smile is too steep in certain regions and indicate butterfly arbitrage opportunities.\n\n**Practical takeaway:** Real market surfaces sometimes temporarily violate these constraints due to illiquidity, stale quotes, or model interpolation. Sophisticated players run constant arbitrage-scanning algorithms. For individual traders, violations are usually closed too quickly to trade — but identifying the direction of constraint-bound moves helps predict surface evolution.",
          highlight: ["no-arbitrage", "calendar spread constraint", "butterfly constraint", "put-call parity", "probability density"],
        },
        {
          type: "teach",
          title: "Risk Reversals — Trading the Skew",
          content:
            "A **risk reversal** is the purest way to express a view on volatility skew. It directly isolates the price of directional vol asymmetry.\n\n**Structure:**\n- **Long risk reversal**: Buy an OTM call + sell an OTM put at equal delta (typically 25Δ)\n- **Short risk reversal**: Sell the call + buy the put\n- Both legs have the same premium initially if the skew is zero; in equity markets, the put is more expensive\n\n**Interpreting the risk reversal price:**\n- In SPX, a \"−5 vol-point risk reversal\" means 25Δ puts have IV 5 points higher than 25Δ calls\n- Paying for a risk reversal (buying the expensive put) is buying crash insurance\n- Receiving a risk reversal (selling the put) is selling crash insurance — profiting from the IV premium\n\n**Strategies using risk reversals:**\n1. **Skew normalization trade**: When skew is historically extreme (>90th percentile), buy the risk reversal expecting compression. Skew mean-reverts over 2–8 week horizons\n2. **Collar hedge**: Long stock + long put + short call (synthetic short risk reversal). Reduces cost of downside protection by selling call premium — standard institutional hedging\n3. **FX carry with RR hedge**: Collect interest rate differential while buying a risk reversal to cap downside — popular in emerging market carry trades\n\n**Risk of shorting the skew:**\nRisk reversals that short puts (collect the skew premium) appear attractive statistically but carry left-tail convexity risk. During a crash, short puts move against you with accelerating speed due to negative gamma — losses compound rapidly.",
          highlight: ["risk reversal", "skew", "25-delta", "skew normalization", "collar hedge"],
        },
        {
          type: "teach",
          title: "Variance Swaps and Vol Trading Instruments",
          content:
            "Beyond standard options, professional volatility desks use instruments that provide pure exposure to variance without the complications of delta hedging.\n\n**Variance swaps:**\nA variance swap is an OTC agreement to exchange:\n- **Fixed leg**: Strike variance K² (agreed at inception)\n- **Floating leg**: Realized variance over the period (sum of daily log-returns squared, annualized)\n- Settlement: Notional × (Realized Variance − Strike Variance) at expiry\n\nVariance swaps are popular because they provide clean, path-independent volatility exposure. Long variance = profits if realized vol exceeds strike; short variance = profits from collecting the vol risk premium.\n\n**Volatility swaps:** Similar but settled on realized vol (not variance). Less common — payoff is not replicable by a static options portfolio, making them harder to hedge.\n\n**Practical instruments for retail/institutional traders:**\n- **VIX options**: Options on the VIX index itself — provide levered exposure to volatility level changes; heavily used for portfolio hedging\n- **SVXY/UVXY**: Leveraged long/short VIX futures ETPs — highly path-dependent, decay-prone\n- **Long straddle**: Buy ATM call + put — profitable if realized vol exceeds implied vol (long gamma/long vega position)\n- **Iron condor**: Short OTM call + put, long further OTM call + put — profitable if vol remains below implied (short gamma/short vega)\n\n**The gamma vs vega distinction:**\n- Vega risk: exposure to changes in IV level (buy straddle = long vega)\n- Gamma risk: exposure to how much the underlying actually moves (long straddle = long gamma)\n- In a delta-hedged straddle, the P&L = ½ × Gamma × (Realized move² − Implied move²) per day — this is the pure volatility P&L formula",
          highlight: ["variance swap", "variance strike", "realized variance", "long gamma", "vega vs gamma"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader buys a 30-day at-the-money straddle on a stock with IV of 30%. At expiration, the stock has moved 25% (annualized realized vol was 25%). Ignoring transaction costs, what happened to the trader?",
          options: [
            "Lost money — realized vol was below implied vol, so the straddle buyer lost the vol premium",
            "Made money — any large move benefits a long straddle",
            "Broke even — ATM straddles always converge to zero at expiration",
            "Made money — the 25% move was still large in absolute terms",
          ],
          correctIndex: 0,
          explanation:
            "A long straddle profits when realized volatility exceeds implied volatility. Here, IV was 30% but realized vol was only 25%. The straddle buyer paid a premium that assumed 30% realized vol; the underlying moved less, leaving the straddle worth less than the premium paid. This is the fundamental P&L equation for a delta-hedged straddle: proportional to (Realized Vol² − Implied Vol²). Since 25² < 30², the long vol position lost money.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A risk reversal that sells the OTM put and buys the OTM call at equal delta is a low-risk strategy because statistically the skew premium means the put seller has a positive expected value.",
          correct: false,
          explanation:
            "While the historical expected value of short put risk reversals is positive due to the IV premium in skew, calling it 'low-risk' is deeply misleading. Short put risk reversals have severe left-tail risk — during market crashes, short OTM puts accelerate against the seller due to negative gamma (the position gets larger deltas as the underlying falls). The February 2018 Volmageddon and the 2020 COVID crash both destroyed funds running seemingly statistical 'low-risk' short-skew strategies. Positive expected value does not imply low risk when the distribution has fat left tails.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Regime Changes in Volatility ──────────────────────────────────
    {
      id: "volatility-surface-5",
      title: " Regime Changes in Volatility",
      description:
        "Volatility clustering and GARCH dynamics, long-run mean reversion, vol-of-vol and the VVIX, and how regime changes destroy and create option trading strategies",
      icon: "Activity",
      xpReward: 120,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Volatility Clustering — The ARCH/GARCH Framework",
          content:
            "One of the most robust empirical facts in financial markets is **volatility clustering**: high-volatility periods tend to follow high-volatility periods, and low-volatility periods tend to follow low-volatility periods. This directly contradicts the Black-Scholes assumption of constant volatility.\n\n**Robert Engle's ARCH model (1982):**\nEngle's AutoRegressive Conditional Heteroskedasticity model formalized volatility clustering. The key insight: today's variance is a function of recent squared returns, not a constant:\n- σ²_t = ω + α₁ε²_{t-1} + ... + αₚε²_{t-p}\n- Yesterday's large return increases today's expected variance\n- This persistence explains why markets appear \"calm\" then suddenly \"turbulent\"\n\n**Bollerslev's GARCH(1,1) (1986):**\nAdded lagged variance terms for greater persistence:\n- σ²_t = ω + α·ε²_{t-1} + β·σ²_{t-1}\n- Typical equity parameters: α ≈ 0.09, β ≈ 0.90, α+β ≈ 0.99\n- The near-unit-root (α+β close to 1) explains the very slow mean reversion of volatility\n\n**Trading implications of clustering:**\n- After a large move, expect elevated vol for days or weeks — GARCH says so\n- Option sellers should be cautious immediately after spikes; IV often stays elevated longer than expected\n- The clustering effect also means VIX has momentum: a rising VIX tends to keep rising in the short run before reverting",
          highlight: ["volatility clustering", "ARCH", "GARCH", "persistence", "mean reversion"],
        },
        {
          type: "teach",
          title: "Long-Run Mean Reversion — How Vol Regimes End",
          content:
            "Despite clustering in the short run, volatility is strongly **mean-reverting** over longer horizons. This dual nature — short-run momentum, long-run reversion — is central to understanding when vol strategies work and when they fail.\n\n**Historical mean reversion speeds:**\n- VIX half-life to long-run mean (≈18%): approximately 20–40 trading days\n- In practice, this means a VIX spike to 40 should be 50% closed (back toward 18) within roughly 30 trading days on average\n- However, tail events (2008 financial crisis, COVID) can delay reversion for months\n\n**Vol regime identification:**\nProfessional desks categorize markets into regimes:\n- **Low-vol regime** (VIX 10–15): Risk-on, carry strategies dominant, vol sellers win\n- **Normal regime** (VIX 15–25): Balanced, standard delta-hedged strategies perform\n- **Elevated vol regime** (VIX 25–40): Risk-off, long vol or hedged strategies outperform\n- **Crisis regime** (VIX >40): Extreme, tail-risk strategies pay off, short-vol is catastrophic\n\n**Regime shifts are non-linear:**\nTransitions between regimes are not gradual. A market can spend 18 months in a low-vol regime and transition to a crisis regime in 3 days. This asymmetry — slow accretion, fast destruction — is why systematic short-vol strategies require hard stop-loss rules or structural portfolio caps.\n\n**Using vol regime in strategy selection:**\n- Low-vol regimes favor: iron condors, covered calls, short straddles — collect premium during calm\n- Elevated vol favors: long gamma, protective puts, long vol positions — benefit from further spikes\n- Crisis regimes favor: long vol or no net vol exposure — avoid short gamma at all costs",
          highlight: ["mean reversion", "half-life", "vol regime", "regime shift", "non-linear"],
        },
        {
          type: "teach",
          title: "VVIX — The Volatility of Volatility",
          content:
            "If VIX measures expected volatility of the S&P 500, **VVIX** measures the expected volatility of the VIX itself — the second-order uncertainty about how uncertain uncertainty will be. It is one of the most sophisticated signals available to options traders.\n\n**What VVIX measures:**\nThe CBOE VVIX Index applies the same model-free methodology as VIX but uses VIX options as inputs instead of S&P 500 options. It represents the 30-day expected volatility of VIX, expressed as an annualized percentage.\n\n**Typical VVIX ranges:**\n- Below 80: Very calm vol-of-vol; VIX expected to stay range-bound\n- 80–100: Normal vol-of-vol; moderate uncertainty about future vol\n- Above 100: Elevated vol-of-vol; significant uncertainty about whether VIX spikes or collapses\n- Above 120: Extreme; major regime transitions possible\n\n**VVIX as a leading indicator:**\nResearch has found that VVIX can lead VIX by days to weeks:\n- VVIX rising while VIX is still low → market is buying volatility insurance at low levels → possible vol spike ahead\n- VVIX falling while VIX is still elevated → market is selling expensive vol protection → VIX normalization likely\n\n**Trading VVIX signals:**\n- High VVIX makes VIX options expensive — gamma scalping VIX options becomes attractive\n- High VVIX indicates wide bid-ask spreads in VIX options — reduces strategy profitability for retail traders\n- During Volmageddon (Feb 2018), VVIX rose above 200 — an extraordinary signal that vol-of-vol had become the dominant risk\n\n**Vol-of-vol in pricing:**\nHigh VVIX expands the surface — options on the tails of the VIX distribution become more expensive. This affects the pricing of exotic derivatives, gap risk protection, and any strategy with convex exposure to volatility regimes.",
          highlight: ["VVIX", "volatility of volatility", "VIX options", "leading indicator", "vol-of-vol"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader has been running a short iron condor strategy (collecting premium by selling OTM calls and puts) profitably for 18 months during a low-vol regime. VIX just spiked from 12 to 35 over three trading days. Which action is most consistent with sophisticated volatility regime analysis?",
          options: [
            "Close or significantly reduce the short iron condor as the low-vol regime assumption has broken down, and avoid adding short vol in the new elevated-vol environment",
            "Add to the iron condor position since the premium collected is now much higher in the elevated-vol environment",
            "Hold the position because GARCH predicts vol will cluster at the high level, keeping condor spreads wide",
            "Switch to a long straddle but maintain the short condor as a hedge",
          ],
          correctIndex: 0,
          explanation:
            "A VIX spike from 12 to 35 signals a likely regime transition from low-vol to elevated-vol. The iron condor was profitable in the low-vol regime because realized vol stayed within the condor range. In an elevated-vol regime: (1) realized vol may exceed the condor strikes, causing losses; (2) gamma risk accelerates; (3) further vol spikes could push the underlying far outside the profitable range. While premium is higher, the risk of catastrophic loss also multiplies. Sophisticated regime analysis says to reduce or eliminate short-vol positions when regimes shift against the strategy — the iron law of short-vol is that one bad month can wipe out years of gains.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Because volatility is mean-reverting in the long run, a trader who sells options when VIX is above 30 will always profit as VIX eventually returns to its long-run mean, making short vol positions in high-VIX environments essentially risk-free.",
          correct: false,
          explanation:
            "Mean reversion is a long-run statistical tendency, not a guarantee of short-term profitability or safety. Several critical problems arise: (1) 'Eventually' can mean weeks or months — a short-vol position can face margin calls and forced liquidation before reversion occurs; (2) VIX can spike from 35 to 80 before reverting — during the 2008 crisis and COVID crash, short vol at 'elevated' VIX levels still suffered catastrophic losses; (3) Mean reversion does not specify the path — vol can stay elevated far longer than a leveraged short-vol position can survive. The risk is not whether vol eventually reverts, but whether the trader can survive the path to reversion.",
          difficulty: 3,
        },
      ],
    },
  ],
};
