import type { Unit } from "./types";

export const UNIT_CORPORATE_FINANCE: Unit = {
  id: "corporate-finance",
  title: "Corporate Finance",
  description:
    "Master financial statement analysis, DCF valuation, capital structure, working capital, and corporate governance",
  icon: "Building",
  color: "#06b6d4",
  lessons: [
    // ─── Lesson 1: Financial Statement Analysis ──────────────────────────────────
    {
      id: "cf-1",
      title: "📑 Financial Statement Analysis",
      description:
        "Read income statements, balance sheets, and cash flow statements like a professional analyst",
      icon: "FileText",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📈 Reading the Income Statement",
          content:
            "The **income statement** records a company's revenues, costs, and profits over a period.\n\n**Revenue recognition** matters enormously — revenue is booked when earned, not when cash is received. Aggressive recognition (booking revenue too early) is a red flag.\n\n**Key profit metrics, from top to bottom:**\n- **Gross Profit** = Revenue – COGS. Measures production efficiency.\n- **EBIT** (Earnings Before Interest & Tax) = Operating Income. Strips out financing choices.\n- **EBITDA** = EBIT + Depreciation & Amortization. Strips out non-cash charges — often used as a cash flow proxy, though imperfect.\n- **Net Income** = Bottom line after interest and taxes.\n\n**EPS (Earnings Per Share):**\n- **Basic EPS** = Net Income / Basic Shares Outstanding\n- **Diluted EPS** = Net Income / Diluted Shares (includes options, warrants, convertibles)\n- Diluted EPS is always ≤ Basic EPS — always use diluted for valuation\n\n**Non-recurring items:** one-time charges (restructuring, impairments, legal settlements) inflate or deflate stated earnings. Analysts **adjust** (normalize) earnings by removing them to see underlying profitability.\n\nExample: Net income $80M including a $20M one-time charge → Adjusted Net Income = **$100M**",
          highlight: ["revenue recognition", "EBITDA", "EBIT", "net income", "diluted EPS", "non-recurring items"],
        },
        {
          type: "teach",
          title: "⚖️ Balance Sheet Deep Dive",
          content:
            "The **balance sheet** is a snapshot of assets, liabilities, and equity at a point in time. Assets = Liabilities + Equity — always.\n\n**Working capital cycle:**\nCash → Inventory → Receivables → Cash again. The faster this cycle, the less capital is trapped.\nWorking Capital = Current Assets – Current Liabilities\n\n**Asset efficiency:**\n- **Asset Turnover** = Revenue / Total Assets. Higher is better — more revenue per dollar of assets.\n- Low asset turnover suggests overcapitalization or poor utilization.\n\n**Capital structure metrics:**\n- **Debt-to-Equity (D/E) ratio** = Total Debt / Shareholders' Equity. High D/E amplifies returns but raises bankruptcy risk.\n- **Interest Coverage ratio** = EBIT / Interest Expense. Coverage < 2× is a distress signal.\n\n**Off-balance-sheet liabilities** are hidden risks that don't appear as debt:\n- Operating leases (pre-IFRS 16 / ASC 842 — now capitalized)\n- Pension deficits (underfunded benefit obligations)\n- Contingent liabilities (pending lawsuits, guarantees)\n\nAnalysts **add these back** to get economic net debt, often 20–30% higher than reported debt for capital-intensive industries.",
          highlight: ["working capital", "asset turnover", "D/E ratio", "interest coverage", "off-balance-sheet liabilities"],
        },
        {
          type: "teach",
          title: "💵 Cash Flow Statement",
          content:
            "The **cash flow statement** reveals true economic reality — earnings can be managed, but cash is hard to fake.\n\n**Three sections:**\n1. **Operating Cash Flow (OCF)**: starts with net income, adds back non-cash items (D&A), adjusts for working capital changes. OCF = Net Income + D&A ± ΔWorking Capital\n2. **Investing**: capital expenditures (CapEx), acquisitions, asset sales.\n3. **Financing**: debt issuance/repayment, equity raises, dividends, buybacks.\n\n**FCF (Free Cash Flow):**\nFCF = OCF – CapEx\n\n**Maintenance vs growth CapEx:**\n- **Maintenance CapEx**: keeps existing assets running (replace worn equipment)\n- **Growth CapEx**: adds new capacity (builds new factory)\nSeparating them is critical — only maintenance CapEx is required, growth CapEx is discretionary.\n\n**Working capital changes impact OCF:**\n- Receivables ↑ → OCF ↓ (cash not yet collected)\n- Payables ↑ → OCF ↑ (cash not yet paid)\n\n**Cash Conversion Cycle (CCC)** = DSO + DIO – DPO\nMeasures how many days cash is tied up in operations. Shorter = better capital efficiency.\n\nExample: Net Income $100M + D&A $20M – CapEx $30M – ΔWC $10M = **FCF $80M**",
          highlight: ["OCF", "FCF", "CapEx", "maintenance CapEx", "growth CapEx", "cash conversion cycle"],
        },
        {
          type: "quiz-mc",
          question:
            "A company reports: Net Income $100M, D&A $20M, CapEx $30M, increase in working capital $10M. What is Free Cash Flow?",
          options: [
            "$80M — Net Income + D&A – CapEx – ΔWC",
            "$90M — Net Income – CapEx only",
            "$120M — Net Income + D&A + CapEx – ΔWC",
            "$70M — Net Income – CapEx – ΔWC without adding D&A",
          ],
          correctIndex: 0,
          explanation:
            "FCF = Net Income + D&A – CapEx – ΔWorking Capital = $100M + $20M – $30M – $10M = $80M. D&A is added back because it's a non-cash charge deducted from net income. The working capital increase of $10M represents cash consumed by operations (e.g., building inventory), so it is subtracted.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "EBITDA is a reliable proxy for operating cash flow because it strips out interest, taxes, and non-cash charges.",
          correct: false,
          explanation:
            "False. EBITDA is a useful approximation but ignores three critical cash items: (1) changes in working capital — a company can have high EBITDA but terrible cash flow if receivables are ballooning; (2) maintenance CapEx — real cash needed to sustain the business; (3) actual cash taxes paid. Analysts call EBITDA a 'faketastic' metric when used carelessly. Always examine the full cash flow statement.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are analyzing two companies in the same industry. Company A shows 15% revenue growth but receivables have grown 35% year-over-year. Company B shows 12% revenue growth with receivables up 11%.",
          question: "What accounting red flag does Company A display, and what does it suggest?",
          options: [
            "Aggressive revenue recognition — booking sales before cash is collected, inflating reported revenue",
            "Underinvestment in sales infrastructure — slow collection due to poor billing systems",
            "Conservative accounting — deferring revenue to smooth earnings",
            "Healthy growth — receivables naturally grow faster than revenue during expansion phases",
          ],
          correctIndex: 0,
          explanation:
            "Receivables growing significantly faster than revenue (35% vs 15%) is a classic red flag for aggressive revenue recognition. It may indicate that Company A is booking revenue on shipments not yet accepted by customers, or extending overly generous payment terms to hit targets. Analysts verify by checking DSO trend: if DSO rises materially year-over-year, it's a serious quality-of-earnings concern.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Valuation Deep Dive ───────────────────────────────────────────
    {
      id: "cf-2",
      title: "🔬 Valuation Deep Dive",
      description:
        "DCF sensitivity, EV-to-equity bridge, and sum-of-the-parts valuation for complex companies",
      icon: "Calculator",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📉 DCF Sensitivity: Why Small Assumptions Swing Value Massively",
          content:
            "DCF is powerful but dangerous — tiny assumption changes produce enormous valuation swings.\n\n**The two most sensitive inputs are WACC and the terminal growth rate (g).**\n\n**WACC sensitivity:**\nIf WACC rises from 8% to 9% (just 1%), the terminal value falls roughly 15–20%. For a company where terminal value is 75% of total DCF value, this alone reduces equity value by ~12–15%.\n\nFormula: TV = FCF × (1+g) / (WACC – g)\n\nWith WACC = 8%, g = 2.5%: TV spread = 5.5% → TV per $1 of FCF = $18.18\nWith WACC = 9%, g = 2.5%: TV spread = 6.5% → TV per $1 of FCF = $15.77\nThat is a **13% drop** in terminal value from a 1% WACC increase.\n\n**Growth rate (g) sensitivity:**\nIf g rises from 2% to 2.5% (0.5% change), TV moves from $16.67 to $18.18 per $1 FCF at 8% WACC — a **9% jump**.\n\n**Best practice — build a sensitivity table:**\nRows: WACC (7%, 7.5%, 8%, 8.5%, 9%)\nColumns: g (1.5%, 2%, 2.5%, 3%, 3.5%)\nRead the range of implied equity values — this is how bankers generate football field charts.\n\nRule of thumb: **1% change in WACC ≈ 20–30% change in valuation; 0.5% change in g ≈ 10–15% change.**",
          highlight: ["WACC", "terminal growth rate", "sensitivity", "terminal value", "football field"],
        },
        {
          type: "teach",
          title: "🌉 EV Bridge: Walking from Enterprise Value to Equity Value",
          content:
            "**Enterprise Value (EV)** is the total value of a business regardless of capital structure. To get **Equity Value** (what shareholders actually own), you must walk the bridge.\n\n**EV → Equity Value walk:**\n\nStart: **Enterprise Value** (e.g., $500M)\n\n**Subtract debt-like items (reduce equity value):**\n- Financial debt (bonds, bank loans): –$100M\n- Pension deficit (underfunded pension liabilities): –$30M\n- Minority interest (value of subsidiaries owned by others): –$15M\n- Off-balance-sheet leases (if not already capitalised): –$10M\n\n**Add cash-like items (increase equity value):**\n- Cash and equivalents (excess cash, not operating cash): +$20M\n- Value of associates / equity investments: +$25M\n\n**Equity Value** = $500M – $155M + $45M = **$390M**\n\n**Diluted Equity Value per share** = Equity Value / Diluted Shares Outstanding\n\n**Common mistakes:**\n- Forgetting pension deficits (often material for industrials/airlines)\n- Using gross debt instead of net debt (always subtract cash)\n- Ignoring minority interests — they belong to third parties, not shareholders",
          highlight: ["enterprise value", "equity value", "net debt", "pension liabilities", "minority interest", "EV bridge"],
        },
        {
          type: "teach",
          title: "🧩 Sum-of-the-Parts (SOTP) Valuation",
          content:
            "**Sum-of-the-Parts (SOTP)** values each business segment separately using the most appropriate multiple for that segment, then adds them together.\n\n**When to use SOTP:**\n- Conglomerates with unrelated divisions (e.g., tech + industrial + finance)\n- Companies where a single multiple would be misleading\n- Identifying 'hidden value' in subsidiaries or non-core assets\n\n**SOTP example — Diversified Conglomerate:**\n\n| Segment | EBIT | Multiple | Value |\n|---|---|---|---|\n| Tech Software | $40M | 15× | $600M |\n| Industrial Mfg | $30M | 8× | $240M |\n| Financial Services | $20M | 10× | $200M |\n| Corporate Overhead | –$10M | 8× | –$80M |\n| **Total EV** | | | **$960M** |\n\nNet Debt: –$150M → **Equity Value = $810M**\n\n**Conglomerate discount:** In practice, conglomerates often trade at 10–20% below their SOTP value because:\n- Complexity and management distraction\n- Cross-subsidisation of underperforming units\n- Investors prefer 'pure play' companies\n\n**Activist insight:** Activists often argue for breaking up conglomerates to 'unlock' SOTP value — the sum is worth more than the whole.",
          highlight: ["SOTP", "sum-of-the-parts", "conglomerate discount", "pure play", "segment valuation"],
        },
        {
          type: "quiz-mc",
          question:
            "A company has an Enterprise Value of $500M, financial debt of $100M, pension deficit of $30M, minority interest of $20M, cash of $20M, and equity stakes in associates worth $20M. What is the equity value?",
          options: [
            "$390M — EV minus debt-like items plus cash-like items",
            "$400M — EV minus net debt of $100M",
            "$470M — EV minus debt only, ignoring pension and minority interest",
            "$350M — EV minus all liabilities including pension, minority, and debt",
          ],
          correctIndex: 0,
          explanation:
            "Equity Value = EV – Financial Debt – Pension Deficit – Minority Interest + Cash + Associate Value = $500M – $100M – $30M – $20M + $20M + $20M = $390M. Pension deficits and minority interests are debt-like obligations that reduce what equity holders receive. Associates and excess cash are assets that add to equity value.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A higher WACC leads to a higher DCF valuation because it reflects a higher required rate of return on capital.",
          correct: false,
          explanation:
            "False. A higher WACC reduces DCF valuation. WACC is the discount rate applied to future cash flows — a higher rate makes distant cash flows worth less in today's money. More importantly, the terminal value (TV = FCF / (WACC – g)) falls sharply as WACC rises. Since terminal value often accounts for 60–80% of total DCF value, even a 1% WACC increase can cut total valuation by 15–25%.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A conglomerate has two divisions: a tech software division generating $50M EBIT and an industrial division generating $40M EBIT. Peers for tech software trade at 15× EBIT and industrial peers trade at 8× EBIT. The company has net debt of $100M.",
          question: "What is the SOTP-implied equity value?",
          options: [
            "$1,070M — tech ($750M) + industrial ($320M) minus net debt ($100M) minus overhead at 8× = approx $970M–$1,070M depending on overhead assumption",
            "$1,170M — adding both EBIT at an average 13× multiple to the combined $90M EBIT",
            "$620M — applying the lower 8× industrial multiple to the combined EBIT of $90M minus debt",
            "$1,350M — applying the higher 15× tech multiple to all EBIT and subtracting debt",
          ],
          correctIndex: 0,
          explanation:
            "Tech Division: $50M × 15 = $750M EV. Industrial Division: $40M × 8 = $320M EV. Total EV = $1,070M. Subtract net debt $100M → Equity Value ≈ $970M. Option A best reflects the SOTP logic of segment-specific multiples minus debt. Using a blended average (Option B) would overvalue the industrial segment, while applying only the lower industrial multiple (Option C) would dramatically undervalue the tech business.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Capital Structure ─────────────────────────────────────────────
    {
      id: "cf-3",
      title: "🏗️ Capital Structure",
      description:
        "Modigliani-Miller theorem, optimal leverage, trade-off theory, and credit ratings",
      icon: "Layers",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🧪 Modigliani-Miller: When Capital Structure Is (and Isn't) Irrelevant",
          content:
            "**Modigliani-Miller (M&M)** is the foundational theorem of corporate finance, developed in 1958.\n\n**M&M Proposition I (no taxes):**\nIn a perfect market (no taxes, no bankruptcy costs, no information asymmetry), the **total value of a firm is independent of its capital structure**. Whether you fund with 100% equity or 50% debt, firm value is the same.\n\nWhy? Because investors can replicate any capital structure themselves ('home-made leverage') — so they won't pay a premium for something they can do themselves.\n\n**M&M with corporate taxes (1963 revision):**\nThe real world has taxes, and **interest is tax-deductible**. Debt creates an **interest tax shield**:\n\nTax Shield = Debt × Interest Rate × Tax Rate\n\nExample: $200M debt at 5%, tax rate 25%:\nAnnual tax shield = $200M × 5% × 25% = **$2.5M per year**\nPV of tax shield (perpetuity) = $2.5M / 5% = **$50M** of value added by debt\n\n**M&M with taxes implication:** Maximum debt maximises value due to tax shield. This is why real firms use some debt — but not unlimited amounts.",
          highlight: ["Modigliani-Miller", "capital structure", "interest tax shield", "perfect market", "irrelevance proposition"],
        },
        {
          type: "teach",
          title: "⚖️ Optimal Capital Structure: Trade-Off vs Pecking Order",
          content:
            "**Why don't companies borrow as much as possible?** Two competing theories explain actual behaviour:\n\n**Trade-Off Theory:**\nFirms balance the **tax shield benefit** of debt against **financial distress costs**.\n- As debt rises, tax shield grows — positive\n- But probability of financial distress also rises — negative (lawyers, management distraction, lost customers, supplier credit tightening)\n- Optimal D/E is where marginal tax shield = marginal distress cost\n- Prediction: firms target a specific leverage ratio and revert to it over time\n\n**Pecking Order Theory (Myers-Majluf, 1984):**\nManagers have more information than investors (asymmetric information). They prefer financing in this order:\n1. **Internal funds** (retained earnings) — cheapest, no signalling\n2. **Debt** — signals confidence (taking on debt commitment)\n3. **Equity** — last resort; markets interpret equity issuance as a signal the stock is overvalued\n\nPecking order predicts: profitable firms use little debt (self-fund); debt rises only when investment needs exceed internal cash.\n\n**Evidence:** Both theories have empirical support. Trade-off explains cross-industry differences (utilities = high debt; tech = low debt). Pecking order explains time-series decisions within firms.",
          highlight: ["trade-off theory", "pecking order theory", "financial distress", "tax shield", "asymmetric information"],
        },
        {
          type: "teach",
          title: "📊 Credit Ratings: Investment Grade vs High Yield",
          content:
            "**Credit ratings** assess the probability of default, directly affecting borrowing costs and access to capital markets.\n\n**Rating agencies:** S&P, Moody's, Fitch — each assigns ratings independently.\n\n**Rating scale:**\n- **Investment Grade (IG):** AAA to BBB– (S&P). Low default risk. Pension funds and insurance companies are required to hold IG.\n- **High Yield (HY) / 'Junk':** BB+ and below. Higher coupon demanded to compensate for risk.\n- **Fallen Angels:** IG issuers downgraded to HY — forced selling by institutional funds.\n\n**Rating agency methodology — key metrics:**\n- **Leverage:** Net Debt / EBITDA (IG typically < 3×; > 5× is HY territory)\n- **Coverage:** EBIT / Interest Expense (IG typically > 3×)\n- **FCF generation:** Consistency of free cash flow through cycles\n- **Business risk:** Industry stability, market position, revenue diversification\n\n**Rating migration risk:** A downgrade from BBB– to BB+ ('cliff edge') triggers forced selling by IG-mandated funds — spreads can widen dramatically, making refinancing expensive or impossible.\n\nExample: Company with Net Debt/EBITDA of 2.5× and EBIT coverage of 4× → solid BBB territory. Rising to 4.5× leverage with 2× coverage → high BB risk.",
          highlight: ["credit rating", "investment grade", "high yield", "fallen angel", "leverage ratio", "interest coverage"],
        },
        {
          type: "quiz-mc",
          question:
            "A company has $200M in debt at a 5% interest rate and a corporate tax rate of 25%. What is the annual interest tax shield, and what is the present value of the tax shield as a perpetuity?",
          options: [
            "$2.5M annual shield; $50M PV — Debt × Rate × Tax Rate; PV = annual shield / Rate",
            "$10M annual shield; $200M PV — based on gross interest expense only",
            "$2.5M annual shield; $10M PV — discounting by tax rate instead of interest rate",
            "$5M annual shield; $100M PV — ignoring the tax rate in the shield calculation",
          ],
          correctIndex: 0,
          explanation:
            "Annual interest tax shield = Debt × Interest Rate × Tax Rate = $200M × 5% × 25% = $2.5M. To find the perpetuity value, divide by the interest rate (the appropriate discount rate for a perpetual debt-related cash flow): PV = $2.5M / 5% = $50M. This $50M represents value added purely by using debt instead of equity to finance the same assets — the Modigliani-Miller tax shield benefit.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "According to Modigliani-Miller in a world without taxes, the total value of a firm is unaffected by whether it uses debt or equity financing.",
          correct: true,
          explanation:
            "True. This is M&M Proposition I: in a perfect capital market (no taxes, no bankruptcy costs, symmetric information), capital structure is irrelevant to firm value. Investors can create their own leverage (or de-leverage) by buying or selling securities on personal account, so the firm cannot create value merely by changing the debt-equity mix. Value is determined by real investment decisions and earnings power, not financing choices.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A manufacturing company currently has Net Debt/EBITDA of 2.8× and EBIT interest coverage of 3.5×. It is rated BBB by S&P (lower investment grade). Management is considering a leveraged acquisition that would raise Net Debt/EBITDA to 4.6× and reduce coverage to 1.8×.",
          question: "What is the most likely consequence of this leveraged acquisition from a capital structure perspective?",
          options: [
            "A credit downgrade to high yield ('junk'), triggering forced selling by IG funds and sharply higher borrowing costs",
            "An upgrade to A-rated as lenders reward the company's growth ambitions",
            "No material change — rating agencies only assess cash flow, not leverage ratios",
            "Immediate default — leverage above 4× is prohibited by bond covenants universally",
          ],
          correctIndex: 0,
          explanation:
            "Net Debt/EBITDA jumping from 2.8× to 4.6× and coverage falling to 1.8× (below the ~3× IG threshold) would almost certainly trigger a downgrade from BBB to BB or below — crossing the investment grade cliff. This forces pension funds and insurance companies that are mandated to hold only IG securities to sell the bonds, causing spreads to widen sharply. The company's refinancing costs rise materially, potentially creating a self-reinforcing distress cycle.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Working Capital & Cash Management ─────────────────────────────
    {
      id: "cf-4",
      title: "🔄 Working Capital & Cash Management",
      description:
        "Cash conversion cycle, working capital optimization, and 13-week cash forecasting",
      icon: "RefreshCw",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "⏱️ Cash Conversion Cycle: The Operational Heartbeat",
          content:
            "The **Cash Conversion Cycle (CCC)** measures how many days it takes to convert a dollar spent on operations back into cash received from customers.\n\n**CCC = DSO + DIO – DPO**\n\n- **DSO (Days Sales Outstanding)** = Accounts Receivable / (Revenue / 365). How long customers take to pay.\n- **DIO (Days Inventory Outstanding)** = Inventory / (COGS / 365). How long inventory sits before being sold.\n- **DPO (Days Payable Outstanding)** = Accounts Payable / (COGS / 365). How long the company takes to pay suppliers.\n\n**Interpretation:**\n- Shorter CCC = cash is tied up in operations for fewer days = more efficient\n- **Negative CCC** means customers pay before the company pays suppliers — the business is self-funding with supplier money. Example: **Amazon** (CCC ≈ –30 days) and **Walmart** (CCC ≈ –10 days)\n- Long CCC is common in manufacturing and construction — months of inventory + slow-paying customers\n\n**Example:**\nDSO 45 + DIO 30 – DPO 60 = **CCC 15 days**\nA company with $1B annual COGS: 15 days of CCC = 15/365 × $1B = **$41M of working capital trapped**\n\nReducing CCC by just 10 days frees up ~$27M in cash — a significant source of 'organic' financing.",
          highlight: ["cash conversion cycle", "DSO", "DIO", "DPO", "negative CCC", "working capital"],
        },
        {
          type: "teach",
          title: "🛠️ Working Capital Optimization Techniques",
          content:
            "Treasurers and CFOs use several tools to compress the CCC and free up trapped cash:\n\n**Reducing DSO (collect faster):**\n- **Factoring**: sell receivables to a bank at a discount (e.g., sell $100M receivables for $98M — pay 2% to get cash now)\n- **Dynamic discounting**: offer customers early payment discounts (e.g., 2/10 net 30 = 2% discount if paid in 10 days)\n- Invoice financing / asset-based lending using receivables as collateral\n\n**Reducing DIO (turn inventory faster):**\n- Just-In-Time (JIT) manufacturing — minimise raw material and WIP inventory\n- Demand-driven replenishment — use sales data to reduce safety stock\n- Drop-shipping — sell product before taking ownership (Amazon FBA model)\n\n**Extending DPO (pay suppliers slower):**\n- **Supply chain finance (reverse factoring)**: bank pays suppliers early at the buyer's credit rating; buyer repays bank later — suppliers get fast cash, buyer extends payment terms from 30 to 90+ days\n- Negotiate longer payment terms — larger companies leverage size to push out DPO\n\n**Treasury management:**\n- Centralise cash pooling across subsidiaries to reduce idle balances\n- Use notional pooling to offset subsidiary deficits against surpluses without physical transfers\n- Invest excess cash in money market funds or short-term government securities",
          highlight: ["factoring", "dynamic discounting", "supply chain finance", "JIT", "cash pooling", "DPO extension"],
        },
        {
          type: "teach",
          title: "📋 Cash Forecasting & Liquidity Stress Testing",
          content:
            "Knowing future cash needs prevents the #1 corporate killer: **running out of liquidity**.\n\n**13-week cash flow model:**\nThe standard corporate liquidity tool — a rolling 13-week (3-month) weekly cash forecast.\n- Line-by-line cash receipts (customer payments) and disbursements (payroll, rent, debt service, capex)\n- Identifies minimum cash balance weeks and peak borrowing needs\n- Updated weekly as actuals roll in and forecast is refreshed\n\n**Why 13 weeks?** Long enough to anticipate problems; short enough to be accurate. Beyond 13 weeks, uncertainty grows rapidly.\n\n**Liquidity stress testing:**\nApply adverse scenarios to the base forecast:\n- Revenue drops 20% (recession scenario)\n- Largest customer pays 30 days late\n- Bank line of credit is fully drawn\n- Seasonal working capital peak hits simultaneously\n\n**Revolving Credit Facility (RCF):** A committed borrowing facility that acts as a liquidity buffer. The company draws and repays as needed, paying only commitment fees when undrawn.\n\n**Rule of thumb:** Maintain minimum 12–24 months of liquidity runway. Distressed companies are those with < 6 months of liquidity with no credible plan to extend it.",
          highlight: ["13-week cash flow", "liquidity", "stress testing", "revolving credit facility", "cash runway"],
        },
        {
          type: "quiz-mc",
          question:
            "A company has DSO of 45 days, DIO of 30 days, and DPO of 60 days. What is the Cash Conversion Cycle?",
          options: [
            "15 days — DSO + DIO – DPO = 45 + 30 – 60",
            "75 days — DSO + DIO only, without subtracting DPO",
            "–15 days — subtracting all three components",
            "135 days — adding all three components",
          ],
          correctIndex: 0,
          explanation:
            "CCC = DSO + DIO – DPO = 45 + 30 – 60 = 15 days. DSO (collecting from customers) and DIO (holding inventory) both trap cash — so they're added. DPO (paying suppliers slowly) frees up cash — so it's subtracted. A 15-day CCC means the company has 15 days of cash tied up between paying for goods/services and collecting payment from customers.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A shorter Cash Conversion Cycle is always better, so companies should pay their suppliers as quickly as possible to build strong supplier relationships.",
          correct: false,
          explanation:
            "False. Paying suppliers very quickly reduces DPO, which actually LENGTHENS the CCC — the opposite of optimal. Extending DPO (paying suppliers more slowly) shortens the CCC and improves cash position. While strong supplier relationships matter, savvy finance teams negotiate longer payment terms or use supply chain finance so suppliers still get paid quickly (funded by a bank) while the company extends its own payment timeline. The goal is to maximise DPO while maintaining healthy supplier relationships.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A manufacturing company with $730M in annual revenue has a DSO of 55 days. The CFO wants to reduce DSO to 45 days through tighter credit terms and dynamic discounting. Annual revenue stays constant at $730M.",
          question: "How much cash does reducing DSO by 10 days release?",
          options: [
            "~$20M — 10 days × ($730M / 365 days)",
            "~$73M — 10% of annual revenue",
            "~$7.3M — 1 day of revenue only",
            "~$110M — 15% of annual revenue as a rule of thumb",
          ],
          correctIndex: 0,
          explanation:
            "Daily revenue = $730M / 365 = $2M per day. Reducing DSO by 10 days releases 10 × $2M = $20M of cash from accounts receivable. This cash can be used to reduce debt, fund capex, or pay dividends — all at zero financing cost. Working capital improvement is often the fastest source of 'free' cash for companies looking to strengthen their balance sheet without raising capital.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Corporate Governance & ESG ────────────────────────────────────
    {
      id: "cf-5",
      title: "🏛️ Corporate Governance & ESG",
      description:
        "Board structure, executive compensation design, ESG integration, and activist investor dynamics",
      icon: "Shield",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🏛️ Board Structure: Independence, Committees & Control",
          content:
            "The **board of directors** is supposed to represent shareholders and oversee management. Structure matters enormously.\n\n**Independent directors:** Directors with no material relationship with the company (not management, not a major supplier, not a founder relative). Most governance codes require a majority of independent directors. They are supposed to provide objective oversight.\n\n**Key board committees:**\n- **Audit Committee**: Reviews financial statements, oversees external auditors, manages internal controls. Must be fully independent in the US.\n- **Compensation Committee**: Sets executive pay — critical for aligning incentives.\n- **Nominating & Governance Committee**: Recruits new directors, sets governance policies.\n\n**Dual-class share structures:**\nSome companies (Alphabet, Meta, Snap, Berkshire) have two classes of shares:\n- **Class A**: 1 vote per share (public investors)\n- **Class B**: 10 votes per share (founders/insiders)\nFounders can retain voting control with < 50% economic ownership. Critics argue this entrenches management and insulates them from shareholder accountability.\n\n**Activist investors:**\nHedge funds that acquire a stake (often 5–15%) and publicly demand changes: board seats, cost cuts, spinoffs, share buybacks, or M&A. Examples: Elliott Management, Starboard Value, Trian Partners. Their campaigns can force significant strategic changes.",
          highlight: ["independent directors", "audit committee", "dual-class shares", "activist investors", "board governance"],
        },
        {
          type: "teach",
          title: "💰 Executive Compensation: Aligning Pay with Performance",
          content:
            "**Executive compensation** is one of the most contested areas of corporate governance — designed to align CEO incentives with shareholders.\n\n**Components of a typical CEO package:**\n1. **Base Salary**: Fixed cash, typically 10–20% of total package for large-cap CEOs\n2. **Annual Bonus**: Cash based on short-term targets (EPS, revenue, ROIC). Can be 50–200% of base.\n3. **Long-Term Incentives (LTI)**: The largest component — paid in equity:\n   - **RSUs (Restricted Stock Units)**: shares vest over 3–4 years; value tied to stock price\n   - **Stock Options**: right to buy at exercise price; only valuable if stock price rises above strike\n   - **Performance Shares**: RSUs that vest only if specific metrics are hit (TSR, EPS growth)\n\n**Say-on-Pay votes:** Non-binding shareholder votes on executive pay packages. ISS and Glass Lewis provide voting recommendations to institutional investors — a 'no' recommendation triggers scrutiny.\n\n**Clawback provisions:** Allow boards to recover executive compensation if financials are later restated or misconduct is discovered. Mandated by the Dodd-Frank Act for US public companies.\n\n**Agency problem:** Even with performance pay, executives may focus on short-term stock price (affects options value) over long-term value creation. This is the fundamental tension in corporate governance.",
          highlight: ["RSUs", "stock options", "performance shares", "say-on-pay", "clawback", "agency problem"],
        },
        {
          type: "teach",
          title: "🌱 ESG Integration: From Reporting to Investment Flows",
          content:
            "**ESG (Environmental, Social, Governance)** has evolved from a niche concept to a mainstream corporate and investment framework.\n\n**Materiality assessment:** Not all ESG issues matter equally for every company. A semiconductor company's water usage is highly material (chips require enormous water); a software company's is not. The Sustainability Accounting Standards Board (SASB) provides industry-specific materiality maps.\n\n**TCFD (Task Force on Climate-related Financial Disclosures):**\nThe global standard for climate risk disclosure. Companies must report:\n- Physical risks (flooding, heat stress affecting assets)\n- Transition risks (carbon taxes, stranded assets, regulatory change)\n- Scenario analysis (1.5°C vs 3°C warming pathways)\n\n**ESG rating agencies:**\n- **MSCI ESG Ratings**: AAA to CCC scale; used by many institutional investors\n- **Sustainalytics**: Unmanaged ESG risk scores; used by Morningstar\n- **CDP**: Climate disclosure and scoring (A to D)\nRatings often diverge significantly — different methodologies lead to different conclusions for the same company.\n\n**ESG investing flows and the performance debate:**\n- ESG AUM exceeded $35 trillion globally by 2024\n- Academic evidence is mixed: some studies show ESG outperformance (lower tail risk, better governance); others show underperformance (excluding fossil fuels during commodity bull markets)\n- 'Greenwashing' is a major concern — companies exaggerating sustainability credentials",
          highlight: ["ESG", "materiality", "TCFD", "MSCI ESG", "Sustainalytics", "greenwashing", "climate risk"],
        },
        {
          type: "quiz-mc",
          question:
            "A tech company has two share classes: Class A (1 vote) and Class B (10 votes). The founders own 8% of total shares, all Class B. Public investors own 92%, all Class A. Who controls the company's votes?",
          options: [
            "The founders — 10 votes per share on 8% of shares gives them majority voting control despite minority economic ownership",
            "Public investors — they own 92% of shares, which is always a majority of votes",
            "Neither — voting control requires at least 50% economic ownership in all jurisdictions",
            "The board — they hold the casting vote in a dual-class structure",
          ],
          correctIndex: 0,
          explanation:
            "With 10× voting rights, founders holding 8% of total shares control: 8 × 10 = 80 votes per 100 economic shares. Public investors with 92 shares × 1 vote = 92 votes. Actually total votes = 8×10 + 92×1 = 80 + 92 = 172. Founder votes = 80/172 ≈ 46.5%. But if Class B is only among founders and there are enough Class B shares, founders can easily exceed 50% voting power with far less than 50% economic ownership. This is exactly how Google, Meta, and Snap founders retain control after IPOs.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "ESG-focused investment funds consistently outperform their non-ESG benchmarks over all time periods because companies with strong sustainability practices always generate superior financial returns.",
          correct: false,
          explanation:
            "False. Academic and empirical evidence on ESG fund performance is mixed. ESG funds may outperform in certain periods (e.g., 2020 when tech outperformed energy) but underperform in others (e.g., 2022 when energy stocks surged and ESG funds excluding fossil fuels lagged sharply). ESG factors can reduce tail risk (avoiding governance scandals, regulatory fines), but they do not guarantee outperformance in all environments. The relationship between ESG scores and financial returns depends heavily on time period, sector, and the specific ESG metrics used.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An activist hedge fund acquires a 7% stake in a diversified conglomerate that has underperformed its sector index by 35% over three years. The fund sends a public letter demanding: (1) two board seats, (2) a spinoff of the underperforming industrial division, (3) a $500M share buyback program funded by the spinoff proceeds.",
          question: "Which of the following best describes the activist's investment thesis?",
          options: [
            "The conglomerate trades at a discount to SOTP value; splitting it into pure plays plus returning capital to shareholders unlocks hidden value",
            "The company is overleveraged and needs to raise equity by spinning off assets to reduce debt",
            "The industrial division is undervalued and should be retained with increased capex investment",
            "The activist believes the CEO should be replaced as the primary source of underperformance",
          ],
          correctIndex: 0,
          explanation:
            "The activist thesis is a classic SOTP / conglomerate discount play. By spinning off the industrial division (which may trade at 8× EBIT as a standalone vs 6× within the conglomerate), the remaining pure-play business gets re-rated to a higher multiple. The proceeds from the spinoff or sale are returned via buyback, reducing share count and boosting EPS. This combination — multiple re-rating + capital return + focused management — is the standard activist playbook for underperforming conglomerates. Board seats give the activist influence to ensure management executes the plan.",
          difficulty: 3,
        },
      ],
    },
  ],
};
