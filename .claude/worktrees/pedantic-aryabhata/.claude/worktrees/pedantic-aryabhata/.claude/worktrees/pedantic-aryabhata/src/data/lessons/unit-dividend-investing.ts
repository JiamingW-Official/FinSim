import type { Unit } from "./types";

export const UNIT_DIVIDEND_INVESTING: Unit = {
  id: "dividend-investing",
  title: "Dividend Investing & Income Strategies",
  description:
    "Master dividend fundamentals, yield analysis, dividend quality, REIT and MLP structures, and how to build a resilient income portfolio that compounds over time",
  icon: "",
  color: "#15803d",
  lessons: [
    // ─── Lesson 1: Dividend Fundamentals ─────────────────────────────────────────
    {
      id: "dividend-1",
      title: "Dividend Fundamentals",
      description:
        "Dividend yield, payout ratio, the three key dates (ex-date, record date, payment date), and how dividend reinvestment (DRIP) compounds wealth",
      icon: "DollarSign",
      xpReward: 80,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "What Is a Dividend?",
          content:
            "A **dividend** is a cash payment a company makes to its shareholders, typically funded from profits or retained earnings. Dividends represent a direct return of capital to owners — separate from price appreciation.\n\n**Dividend Yield** measures the annual dividend as a percentage of the current stock price:\n- Formula: Annual Dividend Per Share / Current Stock Price × 100\n- Example: A stock at $50 paying $2.00/year has a yield of **4.0%**\n- Yield rises when the price falls (even if dividend stays constant) — an important nuance\n\n**Payout Ratio** measures how much of earnings is paid out as dividends:\n- Formula: Annual Dividends Per Share / Earnings Per Share × 100\n- A 40% payout ratio means the company retains 60% for growth, debt repayment, or buybacks\n- Below 60% is generally considered sustainable for most sectors\n- REITs and utilities commonly operate at 70–90% payout ratios by design\n\n**Why companies pay dividends:**\n- Signals financial maturity and stable earnings\n- Attracts income-focused institutional investors\n- Provides shareholder returns when reinvestment opportunities are limited\n- Creates pricing support — yield-hungry buyers step in when the stock falls\n\n**Dividend frequency:** Most US companies pay quarterly; many international companies pay semi-annually or annually.",
          highlight: ["dividend yield", "payout ratio", "quarterly", "retained earnings"],
        },
        {
          type: "teach",
          title: "The Three Key Dividend Dates",
          content:
            "To receive a dividend, you must understand three critical dates that govern who gets paid and when.\n\n**1. Declaration Date:**\n- The board of directors formally announces the dividend amount and schedule\n- Creates a legal obligation for the company to pay\n- Example: \"Board declares $0.50 quarterly dividend payable March 15 to holders of record February 28\"\n\n**2. Ex-Dividend Date (Ex-Date):**\n- The cutoff date: you must own the stock **before** this date to receive the dividend\n- On the ex-date itself, buyers do NOT receive the upcoming dividend\n- Stock price typically drops by roughly the dividend amount on the ex-date (all else equal)\n- Example: Ex-date is Feb 26 → you must buy on Feb 25 or earlier\n\n**3. Record Date:**\n- Usually 1–2 business days after the ex-date\n- The company checks its shareholder records to see who receives the dividend\n- Due to T+1 settlement in the US (as of 2024), the record date is typically 1 day after ex-date\n\n**4. Payment Date:**\n- When the dividend is actually deposited into shareholders' brokerage accounts\n- Typically 2–4 weeks after the record date\n\n**Practical example:** If ex-date is February 26 and payment date is March 15, buying on February 25 means you receive the March 15 payment. Buying on February 26 means you do not.",
          highlight: ["ex-dividend date", "record date", "payment date", "declaration date"],
        },
        {
          type: "teach",
          title: "Dividend Reinvestment (DRIP)",
          content:
            "A **Dividend Reinvestment Plan (DRIP)** automatically uses dividend payments to purchase additional shares instead of receiving cash. DRIP is one of the most powerful compounding mechanisms available to long-term investors.\n\n**How DRIP works:**\n- Dividend is paid → broker automatically buys fractional shares at current market price\n- No transaction fees at most brokers (or small discounts to market price via company DRIPs)\n- Compounds over time: more shares → more dividends → even more shares\n\n**The compounding math:**\n- $10,000 in a stock with 4% yield and 6% annual price appreciation\n- Without DRIP (taking cash): portfolio grows to ~$32,000 in 20 years\n- With DRIP: portfolio grows to ~$46,000 in 20 years — a 44% difference\n\n**DRIP tax consideration:**\n- Even reinvested dividends are taxable in the year received (in a taxable account)\n- Each reinvestment creates a new cost basis lot — important for tracking capital gains\n- In a tax-advantaged account (IRA, 401k), DRIP is most powerful since no annual tax drag\n\n**Two types of DRIP:**\n- **Broker DRIP**: Done automatically through your brokerage account; most common\n- **Company DRIP**: Registered directly with the company's transfer agent; sometimes offers a 1–5% discount on purchases\n\n**Key insight:** DRIP works best for stocks with rising dividends — each reinvestment buys shares that will pay even larger future dividends.",
          highlight: ["DRIP", "compounding", "fractional shares", "cost basis", "tax-advantaged"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock trades at $80 and pays a $3.20 annual dividend. The ex-dividend date is March 15. An investor buys 100 shares on March 16. What dividend does this investor receive for the March payment cycle?",
          options: [
            "$0 — the investor bought after the ex-date and does not receive the dividend",
            "$320 — the investor owns 100 shares paying $3.20 each",
            "$80 — the investor receives one quarterly payment of $0.80 per share",
            "$160 — the investor receives half the annual dividend since they bought mid-year",
          ],
          correctIndex: 0,
          explanation:
            "The investor bought on March 16, which is after the ex-dividend date of March 15. To receive a dividend, you must own the stock before the ex-date. Buying on or after the ex-date means the upcoming payment goes to the previous holder. The investor will start receiving dividends from the next quarterly cycle if they continue to hold the shares before that cycle's ex-date.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "If a company's stock price drops from $50 to $45 while its annual dividend stays at $2.00, the dividend yield increases from 4.0% to 4.4%.",
          correct: true,
          explanation:
            "Correct. Dividend yield = Annual Dividend / Stock Price. At $50: $2.00 / $50 = 4.0%. At $45: $2.00 / $45 = 4.44%. This is an important nuance — a rising yield on a falling stock can look attractive but may reflect market concerns about the company's fundamentals, not just a better bargain. Always investigate why the price dropped before chasing the higher yield.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 2: Dividend Quality ───────────────────────────────────────────────
    {
      id: "dividend-2",
      title: "Dividend Quality",
      description:
        "Evaluate payout ratio sustainability, free cash flow coverage, dividend growth history, and what separates Dividend Aristocrats from ordinary payers",
      icon: "ShieldCheck",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Payout Ratio Sustainability",
          content:
            "Not all dividends are equal — the **payout ratio** tells you how much breathing room a company has to maintain (or grow) its dividend when earnings fluctuate.\n\n**Earnings-based payout ratio:**\n- Formula: Dividends Per Share / Earnings Per Share\n- Below 40%: Very safe — lots of room to absorb earnings declines\n- 40–60%: Healthy and typical for established companies\n- 60–80%: Requires stable earnings; vulnerable in downturns\n- Above 80%: High risk unless the business model supports it (utilities, REITs)\n- Above 100%: Company is paying out more than it earns — unsustainable without asset sales or debt\n\n**Sector context matters:**\n- Technology (AAPL, MSFT): Payout ratios of 20–30% — plenty of cushion\n- Consumer staples (KO, PG): 50–65% — mature businesses, stable earnings\n- Utilities (SO, DUK): 65–80% — regulated earnings justify higher payout\n- REITs (O, SPG): 70–90% — legally required to distribute 90%+ of taxable income\n\n**The cyclicality test:**\n- A 50% payout ratio is safe only if earnings don't fall more than 50%\n- Cyclical businesses (energy, mining) should maintain much lower payout ratios\n- During the 2020 COVID recession, many \"safe\" 60% payout ratio companies cut dividends when earnings fell 40–60%\n\n**Key takeaway:** Match your payout ratio expectations to the earnings stability of the underlying business.",
          highlight: ["payout ratio", "earnings coverage", "cyclical", "utilities", "REITs"],
        },
        {
          type: "teach",
          title: "Free Cash Flow Coverage",
          content:
            "Earnings can be manipulated by accounting choices, but **free cash flow (FCF)** is much harder to fake — it is the actual cash generated after operating expenses and capital expenditures.\n\n**FCF Dividend Coverage Ratio:**\n- Formula: Free Cash Flow Per Share / Dividends Per Share\n- Also expressed as: Total FCF / Total Dividends Paid\n- A ratio above 1.5× means the company generates 50% more FCF than it pays out — comfortable buffer\n- A ratio below 1.0× means the company is funding dividends from debt or asset sales — a red flag\n\n**Why FCF > EPS for dividend analysis:**\n- Depreciation and amortization (D&A) are non-cash expenses that reduce earnings but not cash\n- Working capital changes and capex affect cash but not always reported earnings immediately\n- A company can show positive EPS but negative FCF if capex is very high\n\n**Example comparison:**\n| Metric | Company A | Company B |\n|---|---|---|\n| EPS | $3.00 | $3.00 |\n| Dividend | $1.80 | $1.80 |\n| EPS Payout Ratio | 60% | 60% |\n| FCF Per Share | $2.80 | $1.20 |\n| FCF Payout Ratio | 64% | 150% |\n\nCompany A appears sustainable; Company B is paying out 50% more than its actual cash generation. Company B is a dividend cut candidate despite the same EPS payout ratio.\n\n**Where to find FCF:** Cash Flow Statement → Operating Cash Flow minus Capital Expenditures.",
          highlight: ["free cash flow", "FCF coverage", "capital expenditures", "dividend cut", "cash flow statement"],
        },
        {
          type: "teach",
          title: "Dividend Aristocrats & Kings",
          content:
            "Some companies have raised their dividends consistently for decades, demonstrating the financial discipline and business durability that income investors prize most.\n\n**Dividend Aristocrats:**\n- S&P 500 companies that have increased their annual dividend for 25+ consecutive years\n- Currently ~65 companies as of 2026\n- Examples: Johnson & Johnson (60+ years), Procter & Gamble (67 years), Coca-Cola (62 years)\n- Automatically removed from the list if they fail to raise the dividend in any calendar year\n\n**Dividend Kings:**\n- An unofficial (but widely tracked) list of companies with 50+ consecutive years of dividend increases\n- Even more exclusive: ~55 companies qualify\n- Examples: 3M, Colgate-Palmolive, Stanley Black & Decker\n\n**Why streak matters:**\n- Companies must maintain these streaks through recessions, interest rate cycles, and industry disruptions\n- The commitment creates management discipline: they avoid projects that might jeopardize the dividend\n- Many Aristocrats raised dividends even through 2001, 2008–09, and 2020 recessions\n\n**What streak does NOT guarantee:**\n- Past increases don't ensure future increases — streaks end (GE was an Aristocrat before its 2009 cut)\n- A 25-year streak says nothing about the current valuation — Aristocrats can be overpriced\n- Slow dividend growth is still a streak: a 1% annual raise counts, even if inflation runs at 3%\n\n**Best use:** Use Aristocrat/King status as a quality filter, then evaluate current yield, growth rate, and valuation before investing.",
          highlight: ["Dividend Aristocrats", "Dividend Kings", "consecutive years", "quality filter"],
        },
        {
          type: "quiz-mc",
          question:
            "A company reports EPS of $4.00, pays a $2.40 annual dividend, and generates $2.80 in free cash flow per share. Which statement best describes its dividend safety?",
          options: [
            "Questionable — the FCF payout ratio of 86% leaves little cushion despite a modest EPS payout ratio",
            "Very safe — the EPS payout ratio of 60% indicates the dividend is well covered",
            "Unsafe — the dividend exceeds FCF so the company must be borrowing to pay it",
            "Cannot be determined without knowing the sector and dividend history",
          ],
          correctIndex: 0,
          explanation:
            "The EPS payout ratio is $2.40 / $4.00 = 60%, which looks comfortable. However, the FCF payout ratio is $2.40 / $2.80 = 85.7% — leaving only a 14% buffer before FCF would be insufficient to cover the dividend. If FCF drops by more than 14% (a common scenario in a mild recession), the company would need to cut the dividend or fund it with debt. FCF coverage is generally more telling than EPS coverage.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A company that has raised its dividend for 30 consecutive years (a Dividend Aristocrat) is guaranteed to continue raising its dividend in the future.",
          correct: false,
          explanation:
            "False. A 30-year streak is a strong quality signal but provides no guarantee. Business conditions change — technological disruption, competitive pressure, or a severe recession can break even the longest streaks. GE maintained Aristocrat status for decades before cutting its dividend 90% in 2009. Eastman Kodak, once a top dividend payer, eventually cut and went bankrupt. A long streak is a useful filter, not a guarantee.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 3: Yield Trap Avoidance ──────────────────────────────────────────
    {
      id: "dividend-3",
      title: "Yield Trap Avoidance",
      description:
        "Recognize high-yield warning signs: earnings coverage gaps, heavy debt loads, industry headwinds, and the anatomy of dividend cuts",
      icon: "AlertTriangle",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What Is a Yield Trap?",
          content:
            "A **yield trap** occurs when a stock appears to offer an attractively high dividend yield — but the dividend is unsustainable and likely to be cut, causing both income loss and capital loss simultaneously.\n\n**The mechanics of a yield trap:**\n1. Stock price falls (often for legitimate fundamental reasons)\n2. Yield rises automatically as price falls (yield = dividend / price)\n3. The high yield attracts income investors seeking bargains\n4. The dividend is subsequently cut → stock falls further\n5. Both yield and price reset lower, devastating investors who chased the yield\n\n**Classic yield trap profile:**\n- Yield significantly above sector peers (often 2× or more)\n- Payout ratio above 80% for a non-regulated business\n- FCF payout ratio above 90%\n- Revenue declining or earnings deteriorating\n- High and growing debt load\n- Frozen dividend (not growing) for multiple years\n\n**Historical examples:**\n- **AT&T (T)**: Yielded 7–8% for years before cutting its dividend 47% in 2022 as debt from acquisitions became unsustainable\n- **General Electric**: Cut dividend from $0.24 to $0.01/quarter in 2009 after years of financial engineering masked weakness\n- **Frontier Communications**: Repeatedly cut dividends as its telecom business lost subscribers to fiber competition\n\n**Rule of thumb:** If a stock's yield is more than twice the sector average, assume the market is pricing in a dividend cut. Start there and work to disprove it.",
          highlight: ["yield trap", "dividend cut", "payout ratio", "FCF", "debt"],
        },
        {
          type: "teach",
          title: "Earnings Coverage & Debt Load Red Flags",
          content:
            "Two of the most reliable yield trap indicators are **insufficient earnings coverage** and an **overleveraged balance sheet**.\n\n**Earnings coverage red flags:**\n- EPS payout ratio > 90% in a non-regulated business\n- Earnings have been declining for 2+ consecutive years\n- The company uses adjusted earnings (non-GAAP) to justify the dividend, but GAAP EPS is much lower\n- Analysts project further EPS declines — forward payout ratio may exceed 100%\n\n**Debt load red flags:**\n- Net Debt / EBITDA above 4× for most industrials and consumer companies (utilities/REITs can sustain more)\n- Interest coverage ratio (EBIT / Interest Expense) below 2× — barely covering debt costs\n- Debt maturities approaching with uncertain refinancing conditions\n- Credit rating downgrades — agencies often see trouble before equity analysts do\n\n**Industry headwind signals:**\n- Secular decline (physical retail, print media, traditional telecom landlines)\n- Regulatory risk (healthcare payers facing pricing reform)\n- Commodity price exposure with no hedging (energy producers)\n- Technology disruption eroding pricing power\n\n**The checklist before buying a high-yield stock:**\n1. FCF payout ratio < 80%\n2. Net Debt / EBITDA < 3×\n3. Interest coverage > 3×\n4. Revenue not in multi-year decline\n5. Management commentary on dividend commitment (earnings calls)\n6. Dividend has grown (not just been maintained) in recent years",
          highlight: ["earnings coverage", "debt-to-EBITDA", "interest coverage", "credit rating", "secular decline"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "MediaCorp is a traditional print media company offering an 11% dividend yield. Its EPS is $1.20, it pays $1.10/share annually (92% payout ratio), FCF per share is $0.90, Net Debt/EBITDA is 5.2×, and revenue has declined 8% annually for 3 years as digital advertising takes share. The CEO called the dividend 'a top priority' on the last earnings call.",
          question: "How should an income investor evaluate this opportunity?",
          options: [
            "Avoid — multiple yield trap signals: >90% payout, FCF insufficient, 5.2× leverage, and secular revenue decline despite management's reassurance",
            "Buy — the 11% yield provides immediate income and management explicitly committed to the dividend",
            "Buy half a position — the high yield compensates for the risks and you can sell before a cut",
            "Neutral — only buy if the CEO reduces the dividend voluntarily to signal conservatism",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook yield trap. The EPS payout ratio of 92%, FCF payout ratio of 122% ($1.10 / $0.90 — already insolvent on cash), 5.2× leverage, and 3 years of 8% revenue decline in a structurally declining industry are all severe red flags. Management assurances on dividend 'priority' are common right before cuts — companies rarely telegraph cuts in advance. The market is pricing the high yield as a risk premium for likely dividend reduction.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Company X yields 9.5% vs. its sector average of 3.5%. Its EPS payout ratio is 70%, but its FCF payout ratio is 115%. Which metric is more relevant for assessing dividend sustainability?",
          options: [
            "FCF payout ratio — the dividend exceeds actual cash generation, which is the truer measure of sustainability",
            "EPS payout ratio — earnings are the official measure of profitability and the standard coverage metric",
            "Both equally — neither metric alone is sufficient to draw a conclusion",
            "Neither — yield relative to sector is the only metric that matters for dividend safety",
          ],
          correctIndex: 0,
          explanation:
            "Free cash flow is the truer measure of dividend sustainability because it reflects actual cash generated after capital expenditures. A company paying 115% of its FCF as dividends is funding the shortfall with debt or asset sales — clearly unsustainable. EPS can be elevated by non-cash items or accounting choices that don't translate to cash. The 70% EPS payout ratio is misleading here; the FCF payout ratio tells the real story.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Dividend Growth Strategy ──────────────────────────────────────
    {
      id: "dividend-4",
      title: "Dividend Growth Strategy",
      description:
        "Growing dividends vs. high current yield, yield on cost, the compounding power of DGI, and how to balance growth against income today",
      icon: "TrendingUp",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "High Current Yield vs. Dividend Growth",
          content:
            "Income investors face a fundamental trade-off: **high yield now** vs. **lower yield now with faster growth**. Understanding this trade-off is central to building an effective income strategy.\n\n**High yield stock profile:**\n- Current yield: 5–8%\n- Dividend growth: 0–3% annually\n- Example: A utility or telecom company with stable but slow-growing earnings\n- Advantage: Maximum income from day one\n- Risk: Purchasing power erodes if dividend growth lags inflation; little capital appreciation\n\n**Dividend growth stock profile:**\n- Current yield: 1.5–3%\n- Dividend growth: 7–15% annually\n- Example: A consumer staples or technology company reinvesting in its franchise\n- Advantage: Rising income stream; typically paired with strong capital appreciation\n- Risk: Lower near-term income; requires patience for the compounding to materialize\n\n**The rule of 72 for dividends:**\n- At 7% annual dividend growth, the dividend doubles every ~10 years\n- At 10% annual dividend growth, the dividend doubles every ~7 years\n- A $100 investment today with 2% yield growing at 10%/yr pays:\n  - Year 1: $2.00\n  - Year 10: $5.19\n  - Year 20: $13.45\n  - Year 30: $34.90\n\n**When to prefer high yield:**\n- Retirees needing income today\n- Shorter investment horizons (under 10 years)\n- Low-volatility income mandates\n\n**When to prefer dividend growth:**\n- Long investment horizon (10+ years)\n- Younger investors building wealth\n- Inflation protection is a priority",
          highlight: ["dividend growth", "high yield", "compounding", "inflation protection", "yield on cost"],
        },
        {
          type: "teach",
          title: "Yield on Cost",
          content:
            "**Yield on Cost (YOC)** measures your actual dividend income relative to what you originally paid for the shares — not the current market price. It is a key metric for long-term dividend growth investors.\n\n**Formula:**\n- YOC = Current Annual Dividend Per Share / Your Original Cost Per Share × 100\n\n**Worked example:**\n- You buy Procter & Gamble at $100/share in 2010, with a $1.80 annual dividend (1.8% yield at cost)\n- PG grows its dividend ~6% per year for 15 years\n- By 2025: Annual dividend = $1.80 × (1.06)^15 = **$4.32**\n- Your YOC = $4.32 / $100 = **4.32%** — even if PG now trades at $180 (2.4% current yield)\n\n**Why YOC matters:**\n- Reinforces the value of holding dividend growers long-term\n- Investors who bought McDonald's at $15/share in the 1990s now have YOC above 30%\n- Every dividend increase raises your personal YOC without any additional investment\n\n**YOC limitations:**\n- YOC is a backward-looking personal metric — it doesn't tell you whether to hold or sell today\n- Don't confuse high YOC with high current value — an opportunity cost analysis using current yield is equally important\n- YOC should not prevent selling a position if the fundamentals deteriorate significantly\n\n**Dividend Compounding Insight:** The combination of DRIP (automatic reinvestment) + dividend growth creates a snowball effect where both the number of shares and the dividend per share grow simultaneously — making long-term holding periods dramatically more rewarding.",
          highlight: ["yield on cost", "YOC", "dividend growth", "DRIP", "compounding", "opportunity cost"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor bought a stock 12 years ago at $40/share. At the time, it paid a $0.80 annual dividend (2% yield). The dividend has grown at 8% annually. What is the investor's yield on cost today?",
          options: [
            "Approximately 5.0% — $0.80 compounded at 8% for 12 years is $2.01, divided by the $40 cost",
            "2.0% — yield on cost always equals the initial yield at purchase",
            "8.0% — the dividend growth rate equals the yield on cost after one full cycle",
            "Cannot be determined without knowing the current stock price",
          ],
          correctIndex: 0,
          explanation:
            "Yield on Cost uses original purchase price, not current price. Current dividend = $0.80 × (1.08)^12 = $0.80 × 2.518 = $2.01. YOC = $2.01 / $40 = 5.03%. The current stock price is irrelevant for YOC — it only uses your cost basis. This illustrates how even a 2% initial yield compounds into a much higher personal yield over time through consistent dividend growth.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A dividend growth investor should always choose a stock with 10% annual dividend growth over one yielding 6% with 2% growth, regardless of investment horizon.",
          correct: false,
          explanation:
            "False. The optimal choice depends heavily on time horizon. Over short periods (5 years or less), the 6% high-yield stock may generate more total income. The 10% growth stock becomes superior at longer horizons — typically 10+ years — once compounding has materially increased the dividend. A retiree needing income now may rationally prefer the high-yield option even if a younger investor should choose the growth stock.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: REITs & MLPs ───────────────────────────────────────────────────
    {
      id: "dividend-5",
      title: "REITs & MLPs",
      description:
        "REIT dividend taxation, FFO vs EPS for property companies, MLP K-1 complexities, and when qualified dividends apply",
      icon: "Building",
      xpReward: 100,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "REITs — Structure & Taxation",
          content:
            "**Real Estate Investment Trusts (REITs)** are companies that own income-producing real estate and must distribute at least 90% of taxable income to shareholders annually — in exchange for avoiding corporate-level income tax.\n\n**Why REITs pay high dividends:**\n- Legal requirement: 90%+ of taxable income must be distributed\n- Cannot retain much earnings for reinvestment — must access capital markets for growth\n- This structure means high payout ratios (often 70–95%) are by design, not a red flag\n\n**REIT dividend taxation (a critical investor distinction):**\n- Most REIT dividends are classified as **ordinary income**, not qualified dividends\n- Taxed at your marginal federal tax rate (up to 37%), not the preferred 15/20% qualified rate\n- Exception: The 20% pass-through deduction (Section 199A) reduces REIT dividend taxation by 20% for most investors\n- Example: $1,000 REIT dividend → deduct 20% → taxed on $800 at your marginal rate\n- **Best held in tax-advantaged accounts (IRA, 401k)** where ordinary income taxation is deferred or eliminated\n\n**REIT sub-types:**\n- **Equity REITs**: Own and operate properties (apartments, offices, warehouses, malls)\n- **Mortgage REITs (mREITs)**: Invest in mortgages/MBS rather than physical properties; higher yield but more interest rate sensitive\n- **Hybrid REITs**: Combination of both\n\n**Common examples:** Realty Income (O), Public Storage (PSA), Prologis (PLD) — equity REITs; Annaly Capital (NLY) — mortgage REIT.",
          highlight: ["REIT", "90% distribution", "ordinary income", "Section 199A", "tax-advantaged", "mREIT"],
        },
        {
          type: "teach",
          title: "FFO: The Right REIT Earnings Metric",
          content:
            "For REITs, **Funds From Operations (FFO)** is the standard earnings metric — not EPS. Using EPS for REITs produces misleading results because of how real estate depreciation works.\n\n**Why EPS understates REIT profitability:**\n- GAAP requires depreciating real estate over 27.5–39 years\n- A building worth $50M might depreciate $1.8M per year on the income statement\n- But real estate often **appreciates** in value — the depreciation is an accounting fiction\n- This makes EPS artificially low and payout ratios appear dangerously high\n\n**FFO Formula:**\n- FFO = Net Income + Depreciation & Amortization − Gains on Property Sales\n- Removes the non-cash D&A charge and excludes one-time property sale gains\n\n**Adjusted FFO (AFFO):**\n- AFFO = FFO − Maintenance Capex − Straight-line rent adjustments\n- Most conservative and most relevant for dividend coverage analysis\n- AFFO payout ratio (Dividend / AFFO) is the gold standard for REIT dividend safety\n\n**Practical example:**\n| Metric | Value |\n|---|---|\n| Net Income (EPS) | $0.80 |\n| + Depreciation | $2.40 |\n| − Property gains | $0.30 |\n| **FFO** | **$2.90** |\n| − Maintenance capex | $0.40 |\n| **AFFO** | **$2.50** |\n| Annual Dividend | $2.10 |\n| AFFO Payout Ratio | 84% — sustainable for a REIT |\n\nThe EPS payout ratio ($2.10 / $0.80 = 263%) looks catastrophic but is meaningless for REITs.",
          highlight: ["FFO", "AFFO", "depreciation", "EPS", "payout ratio", "maintenance capex"],
        },
        {
          type: "teach",
          title: "MLPs — Income, Complexity & K-1 Forms",
          content:
            "**Master Limited Partnerships (MLPs)** are publicly traded partnerships, primarily in energy infrastructure (pipelines, storage, processing). They combine the liquidity of a stock with partnership tax treatment.\n\n**Why MLPs pay high distributions:**\n- High depreciation and depletion allowances shelter income from tax at the entity level\n- Pass-through structure means income is taxed only at the investor level\n- Midstream MLPs (pipelines) generate stable fee-based income — well-suited for high distribution\n\n**MLP distribution tax treatment:**\n- MLP distributions are mostly **return of capital** — they reduce your cost basis, not taxed currently\n- Example: $1.00 distribution → $0.85 is return of capital (defers your tax), $0.15 is ordinary income\n- When you eventually sell, your lower cost basis creates a larger taxable capital gain\n- Depreciation recapture at ordinary income rates applies on a portion of the gain\n\n**K-1 Form complexity:**\n- MLPs issue **Schedule K-1** (not Form 1099) each year, often arriving late (March–April)\n- K-1s require additional tax forms and complicate returns — often trigger the need for a tax professional\n- MLPs held in IRAs can trigger **Unrelated Business Taxable Income (UBTI)** — taxable within the IRA above $1,000\n- For tax simplicity, many investors prefer MLP ETFs or C-corp-structured midstream companies (Kinder Morgan, Williams)\n\n**Major MLPs:** Enterprise Products Partners (EPD), Magellan Midstream (now merged), Energy Transfer (ET)\n\n**Key takeaway:** MLPs offer high yields (often 6–10%) but add meaningful tax complexity. Understand the K-1 implications before investing.",
          highlight: ["MLP", "K-1", "return of capital", "cost basis", "UBTI", "pipeline", "depreciation recapture"],
        },
        {
          type: "quiz-mc",
          question:
            "A REIT reports net income of $0.50 per share, depreciation of $2.20, and property sale gains of $0.40. Its annual dividend is $2.00. What is the FFO payout ratio, and is the dividend likely sustainable?",
          options: [
            "FFO = $2.30; payout ratio = 87% — within normal range for a REIT and likely sustainable",
            "FFO = $2.30; payout ratio = 400% — the dividend far exceeds earnings and must be cut",
            "FFO = $0.50; payout ratio = 400% — use net income for all companies including REITs",
            "FFO = $2.70; payout ratio = 74% — add back depreciation and gains to get FFO",
          ],
          correctIndex: 0,
          explanation:
            "FFO = Net Income + Depreciation − Property Sale Gains = $0.50 + $2.20 − $0.40 = $2.30. FFO payout ratio = $2.00 / $2.30 = 87%. For a REIT, an 87% FFO payout ratio is within the normal range given the 90% distribution requirement. The EPS payout ratio of 400% ($2.00 / $0.50) is misleading — depreciation is a non-cash charge that does not consume cash flow. FFO is the correct metric for REIT dividend analysis.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "MLP distributions are fully taxed as ordinary income in the year they are received, similar to regular stock dividends.",
          correct: false,
          explanation:
            "False. Most MLP distributions are classified as return of capital (ROC), which reduces your cost basis rather than being taxed in the current year. This defers taxation until you sell the units. Only a small portion (typically 10–20%) is ordinary income taxed currently. When you sell, the lower adjusted cost basis creates a larger capital gain, part of which is subject to depreciation recapture at ordinary income rates. This tax treatment is complex and differs significantly from regular dividends.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Building an Income Portfolio ───────────────────────────────────
    {
      id: "dividend-6",
      title: "Building an Income Portfolio",
      description:
        "Diversify by sector, yield, and growth; ladder dividend payment dates for steady monthly income; balance total return vs. income-first objectives",
      icon: "LayoutGrid",
      xpReward: 110,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Portfolio Diversification for Income",
          content:
            "A well-constructed income portfolio spreads risk across **sectors, yield tiers, and dividend growth rates** — avoiding concentration in any single source of income.\n\n**Sector diversification targets:**\n- Consumer Staples (15–20%): Steady payers — KO, PG, CL — low but reliable growth\n- Healthcare (10–15%): Recession-resistant — JNJ, ABT — solid dividend histories\n- Utilities (10–15%): High yield, regulated earnings — NEE, SO, DUK\n- REITs (10–15%): Real estate exposure and high distributions — O, PLD, PSA\n- Financials (10–15%): Banks and insurance dividend payers — JPM, AFL\n- Industrials (10–15%): Dividend Aristocrats — EMR, ITW, MMM\n- Energy/Midstream (5–10%): High yield but cyclical — XOM, EPD\n- Technology (5–10%): Growing dividend payers — AAPL, MSFT (lower yield, faster growth)\n\n**Yield tier diversification:**\n- Core: 3–5% yield, steady growth (40–50% of portfolio)\n- Growth: 1–3% yield, 8–15% annual growth (20–30% of portfolio)\n- High income: 5–8%+ yield, slower growth (20–30% of portfolio)\n\n**Growth rate diversification:**\n- Mix fast growers (7–15%/yr) with stable payers (2–5%/yr)\n- Ensures the portfolio's purchasing power keeps pace with inflation\n- Avoid portfolios where ALL positions are high yield with no growth — inflation will erode real income\n\n**Position sizing:** No single position should represent more than 5–7% of the income portfolio. A dividend cut in one position should not be catastrophic to overall income.",
          highlight: ["sector diversification", "yield tier", "dividend growth", "position sizing", "inflation"],
        },
        {
          type: "teach",
          title: "Laddering Dividend Dates for Monthly Income",
          content:
            "Most dividend stocks pay quarterly, but with careful selection you can structure a portfolio to generate income every single month — a technique called **dividend date laddering**.\n\n**How quarterly cycles work:**\n- Most companies fall into one of three payment cycles:\n  - Cycle 1: Pays in January, April, July, October\n  - Cycle 2: Pays in February, May, August, November\n  - Cycle 3: Pays in March, June, September, December\n\n**Building a monthly income ladder:**\n- Hold stocks from all three quarterly cycles\n- Result: Income arrives every month rather than in quarterly lumps\n- Example monthly income stream:\n  - January: Exxon, Johnson & Johnson (Cycle 1)\n  - February: Procter & Gamble, Realty Income (Cycle 2)\n  - March: Coca-Cola, McDonald's (Cycle 3)\n  - Repeat quarterly\n\n**Monthly dividend payers:**\n- Some stocks pay monthly dividends directly: Realty Income (O), STAG Industrial, Agree Realty\n- Monthly payers are especially popular for retirees matching dividend income to monthly expenses\n- Most monthly payers are REITs or closed-end funds\n\n**Building a simple income calendar:**\n- Map each position to its payment month(s)\n- Target roughly equal income per month to smooth cash flow\n- Adjust position sizes to even out payments if necessary\n\n**Practical note:** Dividend dates shift occasionally due to holidays and board decisions. Build a 10–20% buffer into monthly income projections to account for timing variability.",
          highlight: ["dividend laddering", "monthly income", "quarterly cycles", "Realty Income", "cash flow"],
        },
        {
          type: "teach",
          title: "Total Return vs. Income Focus",
          content:
            "Income investors often debate whether to optimize for **maximum current income** or for **total return** (income + capital appreciation). The right answer depends on your life stage and financial goals.\n\n**Income-first approach:**\n- Prioritizes current dividend income above capital growth\n- Accepts lower price appreciation in exchange for higher immediate yield\n- Best for retirees drawing on portfolio income to fund living expenses\n- Risk: Lower-growth holdings may lose real purchasing power to inflation over time\n- Portfolio tilt: Utilities, REITs, MLPs, consumer staples at higher yield\n\n**Total return approach:**\n- Balances capital appreciation with dividend income\n- Accepts a lower current yield for faster-growing companies\n- Over 20+ years, the total return approach typically outperforms income-only approaches\n- Best for younger investors still accumulating wealth\n- Portfolio tilt: Dividend growers with 7–15% annual growth rates\n\n**The 4% rule and income portfolios:**\n- Retirees often target a 4% withdrawal rate from their portfolio\n- A portfolio with a 3–4% dividend yield can fund withdrawals without selling shares\n- Dividend growth above inflation means real income grows over time — essential for a 20–30 year retirement\n\n**Hybrid approach (most practical):**\n- Core income positions (40–50%): 4–6% yield, 3–5% growth\n- Dividend growth sleeve (30–40%): 2–3% yield, 8–12% growth\n- Cash/short-term income (10–20%): Money market, short bonds for liquidity buffer\n- This balances near-term income needs with long-term purchasing power preservation\n\n**Key takeaway:** Income and growth are not mutually exclusive — the best income portfolios generate both.",
          highlight: ["total return", "income focus", "4% rule", "purchasing power", "inflation", "hybrid approach"],
        },
        {
          type: "quiz-mc",
          question:
            "An income portfolio has 80% of positions in high-yield stocks (6–9% yield) with 1–2% annual dividend growth and 20% in dividend growth stocks (2–3% yield) with 10% annual growth. Inflation runs at 3% per year. What is the primary long-term risk of this allocation?",
          options: [
            "Purchasing power erosion — dividend growth of 1–2% on 80% of the portfolio lags inflation, steadily reducing real income over time",
            "Insufficient current income — a 6–9% yield on 80% of the portfolio is too low for retirement needs",
            "Over-diversification — too many positions dilute the impact of the best dividend ideas",
            "Tax inefficiency — high-yield dividends are always taxed at ordinary income rates",
          ],
          correctIndex: 0,
          explanation:
            "With 80% of the portfolio growing dividends at 1–2% versus 3% inflation, real income on that portion is declining every year. Over 20 years, a dividend growing at 1% while inflation runs at 3% loses roughly 33% of its real purchasing power. The 10% growth on the 20% sleeve partially offsets this, but the portfolio is overall income-heavy in a way that creates real income erosion over time. A better balance would shift more to dividend growth holdings.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Maria is 62, planning to retire at 65, and wants her $500,000 investment portfolio to generate $20,000/year (4% yield) in dividend income to supplement Social Security. She currently holds 15 stocks — all in the utility and REIT sectors, with an average yield of 5.2% and 2% average annual dividend growth.",
          question:
            "Which adjustment would most improve the long-term sustainability of Maria's income strategy?",
          options: [
            "Shift 25–30% of the portfolio into dividend growth stocks (2–3% yield, 8–10% growth) to protect against inflation eroding real income over a 25-year retirement",
            "Increase concentration in the highest-yielding utilities to push average yield above 6% and build an income cushion",
            "Move entirely to monthly-paying REITs for smoother cash flow, accepting that yield may drop slightly",
            "Hold all positions as-is since the 5.2% yield already exceeds the 4% target with a comfortable buffer",
          ],
          correctIndex: 0,
          explanation:
            "Maria faces a 25-year retirement horizon. With 2% average dividend growth and 3% inflation, real income declines roughly 1% per year — over 25 years this meaningfully erodes purchasing power. Adding a 25–30% sleeve of dividend growth stocks (even at lower initial yield) creates a rising income stream that combats inflation. The current all-utility/REIT allocation is too income-concentrated for a long retirement horizon. Raising concentration further increases both income and sector risk without solving the inflation problem.",
          difficulty: 3,
        },
      ],
    },
  ],
};
