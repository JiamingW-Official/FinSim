import type { Unit } from "./types";

export const UNIT_DERIVATIVES_ADVANCED: Unit = {
  id: "derivatives-advanced",
  title: "Advanced Derivatives & Structured Products",
  description:
    "Go beyond basic options — exotic payoffs, rate swaps, credit derivatives, volatility trading, and structured notes",
  icon: "",
  color: "#f43f5e",
  lessons: [
    // ─── Lesson 1: Exotic Options ────────────────────────────────────────────────
    {
      id: "deriv-adv-1",
      title: "🌀 Exotic Options",
      description:
        "Barrier, Asian, digital, lookback, and quanto options — path-dependent payoffs beyond vanilla calls and puts",
      icon: "Layers",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🚧 Barrier Options: Knock-In & Knock-Out",
          content:
            "**Barrier options** are activated or deactivated when the underlying price touches a predetermined barrier level — making them **path-dependent**.\n\n**Knock-In Options:**\nA knock-in option starts with *no* payoff and only becomes a live vanilla option **if** the asset price hits the barrier at any point before expiry.\n- Down-and-in call: activated when price drops to barrier\n- Up-and-in put: activated when price rises to barrier\n\n**Knock-Out Options:**\nA knock-out starts as a live vanilla option but is **immediately cancelled** if price touches the barrier.\n- Down-and-out call: cancelled if price falls to barrier\n- Up-and-out call: cancelled if price rises too far\n\n**Why they are cheaper than vanilla options:**\nKnock-out options have a *conditional* payoff — there is always a probability the option vanishes before expiry. This reduced probability of payoff translates to a lower premium.\n\nExample: A 3-month at-the-money vanilla call costs $5.00. An equivalent down-and-out call with a barrier 10% below spot might cost only **$3.20** — a 36% discount — because any large downswing kills the option.\n\n**Use cases:** FX hedging (importers/exporters want cheap protection), yield enhancement, structured products.",
          highlight: ["knock-in", "knock-out", "barrier", "path-dependent", "vanilla"],
        },
        {
          type: "teach",
          title: " Asian, Digital, Lookback & Quanto Options",
          content:
            "**Asian Options (Average Price Options):**\nPayoff is based on the **average price** of the underlying over the option's life, not just the final spot price.\n- Call payoff: max(Avg – K, 0)\n- Cheaper than vanilla because averaging reduces volatility\n- Widely used in **commodity hedging** (oil, metals) — reduces manipulation risk on expiry day\n\n**Digital / Binary Options:**\nPay a **fixed cash amount** if in-the-money at expiry — nothing otherwise.\n- Cash-or-nothing call: pays $100 if S > K at expiry, $0 otherwise\n- All-or-nothing payoff profile creates a discontinuous delta near expiry\n- Used in structured notes and FX markets\n\n**Lookback Options:**\nPayoff based on the **maximum or minimum** price reached over the option's life.\n- Lookback call: S_max – K (you buy at the lowest price)\n- Called \"no regret\" options — you always get the best possible entry/exit\n- Most expensive exotic: typically 150–300% the price of a vanilla equivalent\n\n**Quanto Options:**\nProvide **currency-protected** exposure — you gain in your home currency even when the underlying is priced in a foreign currency.\n- A USD investor buys a quanto on a Nikkei stock; gains are in USD regardless of JPY/USD moves\n- Used to isolate equity risk from FX risk",
          highlight: ["Asian option", "digital option", "lookback", "quanto", "averaging"],
        },
        {
          type: "quiz-mc",
          question:
            "Why are knock-out options cheaper than equivalent vanilla options?",
          options: [
            "They have a chance of expiring worthless before expiry if the barrier is hit",
            "They always require a higher strike price to compensate the seller",
            "They use daily averaging which reduces the volatility input",
            "Regulators cap their premium to protect retail investors",
          ],
          correctIndex: 0,
          explanation:
            "A knock-out option is cancelled the moment the underlying touches the barrier, removing all remaining value instantaneously. Because there is always a non-zero probability of hitting the barrier before expiry, the option has a lower expected payoff than a vanilla, so it trades at a discount.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Asian options are typically more expensive than vanilla options with the same strike and expiry because they reference the average price over the period.",
          correct: false,
          explanation:
            "False. Asian options are cheaper than vanillas. Averaging prices over time reduces realized volatility — extreme spikes and crashes are smoothed out — so the expected payoff is lower. Lower effective volatility means lower option premium.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An oil producer wants to hedge against falling crude prices over the next 6 months. The CFO is concerned that a single settlement price on expiry day could be manipulated. The producer also wants to reduce hedging cost versus a standard put.",
          question:
            "Which exotic option best addresses both concerns?",
          options: [
            "An Asian put option — cheaper than vanilla and pays based on average price, reducing manipulation risk",
            "A lookback put — cheapest option available with the best possible entry",
            "A knock-in put — becomes active only if prices fall sharply, maximizing protection",
            "A digital put — pays a fixed amount if oil falls below the strike",
          ],
          correctIndex: 0,
          explanation:
            "An Asian put solves both problems: averaging over the 6-month period means no single day's price can be manipulated, and the averaging effect reduces the option's effective volatility input, making it cheaper than a vanilla put. Lookback options are actually the most expensive exotic — the opposite of what's needed.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Interest Rate Derivatives ──────────────────────────────────────
    {
      id: "deriv-adv-2",
      title: " Interest Rate Derivatives",
      description:
        "Swaps, caps, floors, and swaptions — the $500 trillion market that drives global borrowing costs",
      icon: "TrendingUp",
      xpReward: 105,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: " Interest Rate Swaps: The World's Biggest Derivatives Market",
          content:
            "An **Interest Rate Swap (IRS)** is an agreement between two parties to exchange interest payments on a notional principal amount — one party pays a **fixed rate**, the other pays a **floating rate**.\n\n**Key mechanics:**\n- The **notional principal is never exchanged** — only the net interest difference changes hands\n- Floating leg is typically referenced to **SOFR** (Secured Overnight Financing Rate), which replaced LIBOR after the rate-manipulation scandal\n- Settlement is typically quarterly or semi-annual\n\n**Example:**\nCompany A has floating-rate debt at SOFR + 1% and fears rising rates.\nCompany B has fixed-rate debt at 5% and wants floating exposure.\nThey enter a swap: A pays 4% fixed to B; B pays SOFR + 1% to A.\nResult: A is now effectively fixed at 4% + 1% spread = 5% all-in. B is floating.\n\n**Market size:** Notional outstanding exceeds **$500 trillion** — the most liquid derivatives market on earth. Banks, corporations, pension funds, and governments all use IRS to manage interest rate exposure.\n\n**Duration of a swap:**\nFixed leg has positive duration (like a bond); floating leg resets to par each period (duration ≈ 0).\nNet duration ≈ fixed leg duration — valuable for duration matching in liability-driven investing (LDI).",
          highlight: ["interest rate swap", "fixed", "floating", "SOFR", "LIBOR", "notional", "duration"],
        },
        {
          type: "teach",
          title: "🧢 Caps, Floors & Swaptions",
          content:
            "**Interest Rate Cap:**\nA cap is a series of interest rate call options called **caplets** — each caplet pays out if the reference rate (SOFR) exceeds the cap strike on a reset date.\n\nUse case: A floating-rate borrower buys a cap at 5%. If SOFR rises to 6%, the cap pays 1% on the notional, offsetting the extra borrowing cost. Effective maximum rate = cap strike.\n\n**Interest Rate Floor:**\nA floor is a series of **floorlets** that pay out if the reference rate falls below the floor strike.\n\nUse case: A lender with floating-rate assets buys a floor at 2% to guarantee minimum interest income.\n\n**Cap – Floor = Swap** (interest rate parity — known as a collar when both are combined)\n\n**Swaptions:**\nA swaption is an option to *enter into* an interest rate swap at a pre-agreed fixed rate on a future date.\n\n- **Payer swaption:** right to pay fixed (and receive floating) — useful if you expect rates to rise\n- **Receiver swaption:** right to receive fixed (and pay floating) — useful if you expect rates to fall\n\nSwaptions are priced using variants of the Black model and are used extensively by banks to hedge mortgage pipeline risk and by insurers for liability hedging.",
          highlight: ["cap", "floor", "caplet", "floorlet", "swaption", "payer", "receiver"],
        },
        {
          type: "quiz-mc",
          question:
            "In a vanilla interest rate swap, what is actually exchanged between counterparties?",
          options: [
            "Net interest payments only (not the notional principal)",
            "The full notional principal plus accrued interest at maturity",
            "The notional principal at inception; interest payments throughout",
            "Nothing — swaps are settled only at maturity via a single net payment",
          ],
          correctIndex: 0,
          explanation:
            "In a standard IRS, the notional principal is purely a reference amount used to calculate interest payments — it is never physically exchanged. Only the net difference between fixed and floating interest payments is settled, which dramatically reduces counterparty credit risk.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A corporation that has issued fixed-rate bonds and wants to convert to floating-rate exposure should enter a swap where it pays floating and receives fixed.",
          correct: false,
          explanation:
            "False. To convert fixed-rate debt to floating, the corporation should pay *floating* and receive *fixed* in the swap. The received fixed payment offsets the fixed coupon on its bonds, and the company ends up with a net floating-rate obligation.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A pension fund holds a portfolio of floating-rate bonds (SOFR + 150bp) worth $500M. The fund's liabilities are long-duration fixed obligations. The investment committee wants to increase the portfolio's duration and protect against falling rates without selling bonds.",
          question: "Which derivative strategy best achieves this goal?",
          options: [
            "Enter a receiver swaption — paying floating and receiving fixed — to add duration and lock in income if rates fall",
            "Buy an interest rate cap at current SOFR levels to protect against rising rates",
            "Sell interest rate floor contracts to generate premium income",
            "Enter a payer swap — paying fixed and receiving floating — to reduce duration",
          ],
          correctIndex: 0,
          explanation:
            "A receiver swap (pay floating, receive fixed) converts floating-rate assets into synthetic fixed-rate assets, increasing duration to match long-dated liabilities. This is the classic liability-driven investment (LDI) strategy used by pension funds. A payer swap would do the opposite — reducing duration further.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Credit Derivatives ────────────────────────────────────────────
    {
      id: "deriv-adv-3",
      title: " Credit Derivatives",
      description:
        "CDS mechanics, default probability, total return swaps, CDOs, and the lessons of 2008",
      icon: "Shield",
      xpReward: 110,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: " Credit Default Swaps: Buying & Selling Default Risk",
          content:
            "A **Credit Default Swap (CDS)** is insurance against a borrower defaulting on its debt obligations.\n\n**How it works:**\n- **Protection buyer** pays a periodic premium (the CDS spread, in basis points per year)\n- **Protection seller** pays the buyer the **face value** of the bond if a credit event occurs\n- Credit events include: default, bankruptcy, failure to pay, restructuring\n\n**Example:**\nYou hold $10M of Company X bonds. You buy 5-year CDS at 200bp/year.\nAnnual premium = $10M × 2% = **$200,000/year**\nIf X defaults with 40% recovery: CDS pays $10M × (1 – 0.40) = **$6M**\n\n**CDS Spread as a Probability Estimator:**\nP(default) ≈ CDS Spread / (1 – Recovery Rate)\n\nExample: CDS at 300bp, recovery rate 40%:\nP(default per year) ≈ 300bp / (1 – 0.40) = 0.03 / 0.60 = **5% per year**\n\n**Naked CDS:** Buying CDS without owning the underlying bond — essentially a short position on credit quality. Controversial but provides price discovery and liquidity.\n\n**CDS indices:** CDX (North America), iTraxx (Europe) — track baskets of reference entities and allow portfolio-level credit hedging.",
          highlight: ["CDS", "credit default swap", "protection buyer", "CDS spread", "recovery rate", "default"],
        },
        {
          type: "teach",
          title: " Total Return Swaps & CDOs",
          content:
            "**Total Return Swap (TRS):**\nThe TRS payer (asset owner) transfers the *total return* — coupons plus price appreciation/depreciation — to the receiver in exchange for LIBOR/SOFR + spread.\n\n- TRS payer: gets stable floating income, transfers market risk and credit risk\n- TRS receiver: gets full economic exposure to the asset without owning it (leverage, off-balance-sheet)\n\nUse case: Hedge funds use TRS to gain leveraged exposure to credit without purchasing bonds. Banks use TRS to remove assets from their balance sheet.\n\n**CDO (Collateralized Debt Obligation):**\nA CDO pools hundreds of bonds or loans and issues **tranched** securities:\n\n| Tranche | Rating | Loss Absorption | Yield |\n|---------|--------|-----------------|-------|\n| Senior | AAA | Last — absorbs losses after others | Lowest |\n| Mezzanine | BBB | Middle | Medium |\n| Equity | NR | First — absorbs all initial losses | Highest |\n\n**Synthetic CDO:** Instead of actual bonds, a synthetic CDO uses CDS contracts as the underlying. Allows unlimited notional exposure without bond ownership — amplified both protection and systemic risk in 2008.\n\n**Key insight:** CDO tranching works only if defaults are *independent*. If correlations spike (as in 2008), even AAA tranches can fail because all assets default simultaneously.",
          highlight: ["TRS", "total return swap", "CDO", "tranche", "senior", "equity tranche", "synthetic CDO", "correlation"],
        },
        {
          type: "quiz-mc",
          question:
            "What caused AAA-rated CDO tranches to fail during the 2008 financial crisis?",
          options: [
            "Correlation assumptions were wrong — mortgages defaulted together, not independently",
            "Rating agencies were prohibited from rating CDOs above AA",
            "Interest rate rises made floating-rate mortgages unaffordable for all tranches equally",
            "The CDOs were backed by corporate bonds rather than mortgage-backed securities",
          ],
          correctIndex: 0,
          explanation:
            "CDO tranching relies on diversification — the model assumed mortgage defaults were largely independent events. When the housing market collapsed nationwide in 2008, default correlations spiked toward 1.0 (everyone defaulted together), devastating even the senior tranches that models said were safe. The correlation risk was catastrophically underestimated.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A wider CDS spread on a company's debt implies that market participants believe the company's creditworthiness has improved.",
          correct: false,
          explanation:
            "False. A wider (higher) CDS spread means protection buyers are paying more for insurance against default — this reflects a higher perceived probability of default, i.e., deteriorating creditworthiness. Tight CDS spreads indicate strong credit quality; wide spreads signal distress.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A bank holds $500M of investment-grade corporate bonds and wants to reduce credit exposure without selling the bonds (to avoid market impact and maintain client relationships). The CDS market for these names is liquid.",
          question: "Which credit derivative strategy best achieves this goal?",
          options: [
            "Buy CDS protection on the bonds — the bank pays a premium but is compensated if any issuer defaults",
            "Sell CDS on the same bonds to collect premium income and offset unrealized losses",
            "Enter a total return swap as the TRS receiver to gain more exposure",
            "Buy an interest rate cap on the portfolio to protect against yield widening",
          ],
          correctIndex: 0,
          explanation:
            "Buying CDS protection converts the bonds' credit risk into a known annual premium cost while retaining the positions (no market impact). If defaults occur, the CDS pays out, offsetting losses on the bonds. Selling CDS would increase — not reduce — credit exposure.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Variance & Volatility Derivatives ──────────────────────────────
    {
      id: "deriv-adv-4",
      title: " Variance & Volatility Derivatives",
      description:
        "VIX mechanics, variance swaps, contango decay, and how to trade pure volatility",
      icon: "Activity",
      xpReward: 105,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: " VIX: The Fear Index",
          content:
            "The **VIX** (CBOE Volatility Index) measures the market's expectation of **30-day implied volatility** on the S&P 500 index, derived from the prices of a wide strip of S&P 500 options.\n\n**Key facts:**\n- VIX is quoted in annualized percentage points: VIX = 20 means ~20% annualized volatility expected\n- Daily S&P 500 move implied by VIX: VIX / √252 ≈ VIX / 15.87\n  - VIX 20 → daily move ≈ 1.26%\n- VIX is **not directly tradeable** — it is a calculated index, not an asset\n\n**VIX Futures:**\nFutures contracts on VIX allow trading forward volatility expectations.\n- VIX futures typically trade in **contango** (futures price > spot VIX) during calm markets — the market prices in a higher future volatility than today's realized calm\n- During crises (2008, 2020 COVID), the term structure inverts to **backwardation** (spot VIX spikes above futures)\n\n**Why contango hurts long VIX holders:**\nEach month, a long VIX futures position must be **rolled** from the expiring front-month contract to the next month at a higher price (in contango). This rolling cost creates a persistent drag — even if VIX stays flat at 15, a long VIX ETF loses money every roll.",
          highlight: ["VIX", "implied volatility", "contango", "backwardation", "VIX futures", "roll cost"],
        },
        {
          type: "teach",
          title: "⚖️ Variance Swaps & Volatility ETPs",
          content:
            "**Variance Swap:**\nA variance swap exchanges **realized variance** for a fixed strike — providing pure, clean volatility exposure without delta risk.\n\n- Payoff = Notional × (Realized Variance – Strike Variance)\n- Realized Variance = annualized sum of daily squared log-returns\n- Variance buyer profits if actual volatility exceeds the agreed strike\n- Unlike options, no delta hedging required — pure vol exposure\n\n**Vega sensitivity:** A variance swap's vega is proportional to the volatility level — at high vol environments, the convexity of the payoff creates outsized gains for variance buyers.\n\n**Volatility ETPs:**\n\n| Product | Strategy | Contango Impact |\n|---------|----------|-----------------|\n| VXX | Long front-month VIX futures | Loses ~5–10% per month in contango |\n| SVXY | Short VIX futures (inverse) | Profits in calm markets; catastrophic in vol spikes |\n| VIXM | Mid-term VIX futures (4–7 month) | Less contango drag than VXX |\n\n**The February 2018 \"Volmageddon\":** A sudden VIX spike from 15 to 37 in one session caused inverse volatility ETPs like XIV to lose over 90% of value overnight — demonstrating the tail risk of short-vol strategies.",
          highlight: ["variance swap", "realized variance", "variance strike", "VXX", "SVXY", "Volmageddon", "contango"],
        },
        {
          type: "quiz-mc",
          question:
            "Why do long VIX ETF holders typically lose money over time even when VIX stays flat?",
          options: [
            "VIX futures are in contango — rolling futures costs premium each month",
            "The VIX index declines naturally toward zero as options expire",
            "Long VIX positions must pay a dividend to short sellers each month",
            "VIX ETFs hold physical options that decay through time value loss",
          ],
          correctIndex: 0,
          explanation:
            "In contango, each front-month VIX futures contract is priced below the next month's contract. Rolling a long position means selling the cheaper expiring contract and buying the more expensive next-month contract at a loss — this roll cost occurs monthly and erodes returns even if spot VIX remains unchanged.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A variance swap requires constant delta hedging by the buyer to maintain pure volatility exposure.",
          correct: false,
          explanation:
            "False. One of the main advantages of variance swaps over options is that they provide *pure* volatility exposure without requiring delta hedging. The payoff depends only on realized variance over the period — the buyer does not need to trade the underlying to maintain exposure.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A volatility trader believes that the market is underpricing near-term turbulence ahead of a central bank meeting. Current VIX is at 14 (near 12-month lows). The trader wants pure volatility exposure without managing delta or gamma daily.",
          question: "Which instrument best fits the trader's strategy?",
          options: [
            "Enter a variance swap as the variance buyer — profit if realized vol exceeds the fixed strike with no delta hedge needed",
            "Buy VXX shares — simplest way to get long VIX exposure through an ETF",
            "Buy a straddle at-the-money — equal call and put to profit from any large move",
            "Sell an out-of-the-money put — collect premium if volatility stays low",
          ],
          correctIndex: 0,
          explanation:
            "A variance swap provides the cleanest long-volatility exposure: the trader profits directly if realized volatility exceeds the swap strike, with no delta hedging required. VXX suffers from contango drag. A straddle requires active delta hedging (gamma scalping) to isolate volatility exposure. Selling a put is short volatility — the opposite of the stated view.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Structured Products ───────────────────────────────────────────
    {
      id: "deriv-adv-5",
      title: " Structured Products",
      description:
        "Principal protection notes, reverse convertibles, autocallables, leveraged ETFs, and volatility decay",
      icon: "Layers",
      xpReward: 110,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: " Principal Protected Notes & Reverse Convertibles",
          content:
            "**Principal Protected Notes (PPN):**\nA PPN combines a **zero-coupon bond** + a **call option** to give investors capital protection plus upside participation.\n\nConstruction:\n1. Invest $950 in a zero-coupon bond maturing at $1,000 in 5 years (5% rate)\n2. Use the remaining $50 to buy a 5-year call option on the S&P 500\n3. At maturity: if S&P falls, investor gets $1,000 (bond redeems, option worthless)\n   If S&P rises 60%, investor gets $1,000 + participation in the gain\n\nParticipation rate depends on how much option premium $50 can buy. Low rates → expensive options → lower participation. PPNs become less attractive when interest rates are low.\n\n**Reverse Convertible:**\nThe *opposite* risk profile — the investor receives an above-market coupon (e.g., 12% per year) but may receive **shares instead of cash** at maturity if the stock falls below a barrier.\n\n- The high coupon compensates for writing a put option on the underlying stock\n- If stock stays above barrier: investor receives principal + coupon (great outcome)\n- If stock falls 40%: investor receives depreciated shares worth $600 per $1,000 invested + coupon ($120) = **net loss of $280**\n- Risk: the coupon rarely fully compensates for a severe drawdown",
          highlight: ["PPN", "zero-coupon bond", "call option", "principal protection", "reverse convertible", "barrier", "coupon"],
        },
        {
          type: "teach",
          title: "📅 Autocallables & Leveraged Note Decay",
          content:
            "**Autocallable Structured Notes:**\nAutocallables are automatically redeemed early (\"called\") at a premium if the underlying is above an observation barrier on periodic observation dates.\n\nTypical structure:\n- Observation dates: quarterly for 3 years\n- If underlying ≥ 100% of initial level on any observation date: note redeems at 110% (10% gain)\n- If underlying is between 70–100% at all observation dates: investor receives principal at maturity\n- If underlying falls below 70% barrier at maturity: investor suffers proportional loss\n\nAppeal: High probability of early redemption with a gain in sideways/mildly bullish markets. The seller profits from the volatility premium embedded in the structure.\n\n**Leveraged Notes & ETFs — Volatility Decay:**\nA 3× leveraged ETF rebalances **daily** to maintain 3× exposure to its index.\n\nExample — a volatile flat market:\n- Day 1: Index +10%, ETF: +30% → $130\n- Day 2: Index –9.09%, ETF: –27.27% → $94.55\n- Net index return: +10% – 9.09% = **0%**\n- Net ETF return: **–5.45%** — despite the index being flat!\n\nThis **volatility decay** (also called beta-slippage) arises because percentage gains and losses are asymmetric. The higher the volatility, the greater the daily rebalancing drag. 3× ETFs are designed for *short-term tactical trades*, not buy-and-hold investing.",
          highlight: ["autocallable", "observation date", "leveraged ETF", "3× ETF", "volatility decay", "beta-slippage", "daily rebalancing"],
        },
        {
          type: "quiz-mc",
          question:
            "Why do 3× leveraged ETFs decay over time?",
          options: [
            "Daily rebalancing in a volatile market creates a path-dependent drag (volatility decay)",
            "Management fees on leveraged ETFs are charged at 3× the normal rate",
            "Leverage magnifies dividend payments which are paid out reducing NAV",
            "Regulatory rules require leveraged ETFs to reduce exposure after drawdowns",
          ],
          correctIndex: 0,
          explanation:
            "Volatility decay (beta-slippage) occurs because of the mathematical asymmetry between gains and losses when rebalancing daily. A +10% followed by a –9.09% return leaves the index flat, but the 3× ETF loses 5.45%. In choppy markets this drag compounds relentlessly — a 3× ETF on a volatile but flat asset can lose significant value over months.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A Principal Protected Note guarantees the investor will profit on their investment regardless of market conditions.",
          correct: false,
          explanation:
            "False. A PPN protects the *principal* (you get your money back), but you do not necessarily profit. If the underlying market falls and the call option expires worthless, the investor receives exactly $1,000 back — but has lost the time value of money (inflation, opportunity cost) over the note's 5-year life. The guarantee is return *of* capital, not return *on* capital.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor holds a $1,000 reverse convertible linked to a tech stock, paying 15% annual coupon with a 60% barrier (triggers if stock closes below $60 on the final observation date; stock starts at $100). After one year, the stock has fallen to $55 — below the $60 barrier.",
          question:
            "What does the investor receive at maturity?",
          options: [
            "$150 coupon + shares worth $550 (stock at $55 × 10 shares = $550 total = $700 received, net loss $300 vs. $1,000 invested)",
            "$1,000 principal fully returned plus the $150 coupon regardless of the barrier breach",
            "$0 — the barrier breach triggers total loss of principal and all coupons",
            "$600 cash (60% of principal, the barrier level) plus the $150 coupon",
          ],
          correctIndex: 0,
          explanation:
            "When the barrier is breached, the investor receives shares instead of cash. With initial stock at $100 and $1,000 invested, the note represents 10 shares. At maturity the stock is $55, so the investor receives 10 shares worth $550. Adding the $150 annual coupon gives $700 total received vs. $1,000 invested — a net loss of $300 (–30%), partially cushioned by the coupon.",
          difficulty: 3,
        },
      ],
    },
  ],
};
