import { Unit } from "./types";

export const unitCorporateFinance: Unit = {
  id: "corporate-finance",
  title: "Corporate Finance & Capital Allocation",
  description:
    "Master the frameworks that CFOs and investment bankers use every day: capital budgeting decisions, optimal capital structure, dividend and buyback policy, and the mechanics of M&A transactions and leveraged buyouts",
  icon: "Briefcase",
  color: "#3B82F6",
  lessons: [
    // ─── Lesson 1: Capital Budgeting ─────────────────────────────────────────
    {
      id: "corporate-finance-1",
      title: " Capital Budgeting",
      description:
        "NPV vs IRR vs payback period, WACC as the hurdle rate, capital rationing, and real options in project evaluation",
      icon: "Calculator",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "NPV: The Gold Standard of Capital Budgeting",
          content:
            "**Net Present Value (NPV)** is the cornerstone of capital budgeting — it measures whether an investment creates or destroys shareholder value.\n\n**NPV formula:**\nNPV = −Initial Investment + Σ [Cash Flow_t / (1 + r)^t]\n\nWhere **r** is the **discount rate** (typically WACC) and **t** is each time period.\n\n**Decision rule:**\n- **NPV > 0**: Accept the project — it creates value above the cost of capital\n- **NPV < 0**: Reject — destroys value even accounting for the time value of money\n- **NPV = 0**: Indifferent — earns exactly the required return\n\n**Why NPV wins:** It directly measures dollar value added, accounts for the time value of money, and is additive (NPV of a portfolio = sum of individual NPVs). Unlike other metrics, NPV never misleads.\n\n**Practical example:**\nA factory upgrade costs $10M today and generates $3M/year for 5 years. At WACC = 10%:\nNPV = −$10M + $3M × [1 − 1/(1.10)^5] / 0.10\nNPV = −$10M + $3M × 3.791 = −$10M + $11.37M = **+$1.37M** → Accept\n\n**Common mistakes:**\n- Using nominal cash flows with a real discount rate (or vice versa)\n- Omitting terminal value in long-lived projects\n- Including sunk costs (money already spent is irrelevant to forward decisions)",
          highlight: [
            "Net Present Value",
            "NPV",
            "discount rate",
            "WACC",
            "time value of money",
            "sunk costs",
            "terminal value",
          ],
        },
        {
          type: "teach",
          title: "IRR, Payback Period & Their Pitfalls",
          content:
            "**Internal Rate of Return (IRR)** is the discount rate that makes NPV = 0. It represents the project's annualized return on invested capital.\n\n**IRR decision rule:** Accept if IRR > Hurdle Rate (WACC)\n\n**IRR pitfalls — why NPV is superior:**\n- **Multiple IRRs**: A project with alternating cash flow signs (e.g., mining with cleanup costs at end) can have two or more IRRs, making the rule ambiguous\n- **Scale problem**: IRR ignores project size. A $1M project with 50% IRR creates less value than a $100M project with 15% IRR (if WACC = 10%)\n- **Reinvestment assumption**: IRR implicitly assumes interim cash flows are reinvested at the IRR itself — often unrealistic. **Modified IRR (MIRR)** corrects this by using WACC as the reinvestment rate\n- **Mutually exclusive projects**: IRR can rank projects incorrectly when they have different scales or timing\n\n**Payback Period:** The time it takes to recover the initial investment from cash flows.\n- Simple payback ignores the time value of money\n- **Discounted payback** fixes this but still ignores cash flows after the cutoff\n- Useful as a **liquidity screen** (management wants payback < 3 years) but should never be the primary decision tool\n\n**Modified Payback / Discounted Payback**: Discounts each cash flow before accumulating — more rigorous but still truncates value beyond the cutoff date.",
          highlight: [
            "Internal Rate of Return",
            "IRR",
            "hurdle rate",
            "multiple IRRs",
            "scale problem",
            "Modified IRR",
            "MIRR",
            "payback period",
            "discounted payback",
          ],
        },
        {
          type: "teach",
          title: "WACC, Capital Rationing & Real Options",
          content:
            "**Weighted Average Cost of Capital (WACC)** blends the required returns of all capital providers:\n\n**WACC = (E/V) × Re + (D/V) × Rd × (1 − Tax Rate)**\n\nWhere:\n- **E/V** = equity weight, **D/V** = debt weight (at market values)\n- **Re** = cost of equity (CAPM: Rf + β × ERP)\n- **Rd** = pre-tax cost of debt\n- **(1 − Tax Rate)**: tax shield on interest reduces effective cost of debt\n\n**Capital rationing** occurs when a firm cannot fund all positive-NPV projects due to budget constraints:\n- **Hard rationing**: external capital markets are inaccessible (small firms, financial distress)\n- **Soft rationing**: internal budget limits set by management\n- Solution: rank projects by **Profitability Index (PI) = NPV / Initial Investment** and select highest-PI projects until budget is exhausted\n\n**Real options** are managerial flexibilities embedded in projects — NPV analysis ignores them:\n- **Option to expand**: If Phase 1 succeeds, invest more (like a call option)\n- **Option to abandon**: If conditions worsen, sell assets or exit (like a put option)\n- **Option to defer**: Wait for more information before committing capital\n- **Option to switch**: Change inputs/outputs in response to market conditions\n\nReal options are valued using decision trees or Black-Scholes-adapted models. A project with NPV = −$2M but a valuable expansion option may still be worth pursuing.",
          highlight: [
            "WACC",
            "cost of equity",
            "CAPM",
            "capital rationing",
            "Profitability Index",
            "real options",
            "option to expand",
            "option to abandon",
            "option to defer",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A project has cash flows of −$500K, +$200K, +$200K, +$200K over three years. Using WACC = 12%, what is the approximate NPV, and should the firm accept it?",
          options: [
            "NPV ≈ +$80K; accept since NPV > 0",
            "NPV ≈ −$20K; reject since NPV < 0",
            "NPV ≈ +$100K; accept but only if IRR > 20%",
            "NPV cannot be calculated without the exact IRR",
          ],
          correctIndex: 1,
          explanation:
            "PV of annuity = $200K × [1 − 1/(1.12)^3] / 0.12 = $200K × 2.402 = $480.4K. NPV = −$500K + $480.4K ≈ −$19.6K. The project destroys about $20K of value at WACC = 12%, so it should be rejected. Note: IRR is not needed to make the accept/reject decision — that is exactly NPV's advantage.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A project with a higher IRR than an alternative project should always be preferred, regardless of project size or the reinvestment rate assumption.",
          correct: false,
          explanation:
            "False. IRR ignores project scale — a smaller project can have a higher IRR but a lower NPV than a larger project. IRR also implicitly assumes reinvestment at the IRR itself, which is often unrealistic. For mutually exclusive decisions, NPV is the correct criterion. A $1M project with 40% IRR creates less value than a $50M project with 15% IRR when WACC = 10%, because the dollar NPV of the larger project is far greater.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Which of the following best describes the 'option to defer' as a real option in capital budgeting?",
          options: [
            "The firm can sell off project assets if revenues disappoint",
            "The firm can wait for uncertainty to resolve before making the irreversible investment",
            "The firm can increase project scale if Phase 1 succeeds",
            "The firm can switch from one raw material input to another as prices change",
          ],
          correctIndex: 1,
          explanation:
            "The option to defer (or wait) gives management the right — but not the obligation — to delay committing capital until more information is available. This is valuable when uncertainty is high because investing now forfeits this flexibility. Like a financial call option, the firm pays a premium (foregone near-term cash flows) to preserve the right to invest later at a known cost. The other options describe abandonment, expansion, and switching options respectively.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Capital Structure & WACC ──────────────────────────────────
    {
      id: "corporate-finance-2",
      title: "⚖️ Capital Structure & WACC",
      description:
        "Modigliani-Miller theorems, the tax shield, financial distress costs, optimal leverage, and pecking order theory",
      icon: "Scale",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Modigliani-Miller: The Irrelevance Theorems",
          content:
            "In 1958, Franco Modigliani and Merton Miller (both Nobel laureates) proved two landmark theorems that form the bedrock of capital structure theory.\n\n**MM Proposition I (No Taxes):** In a perfect capital market, the total value of a firm is independent of its capital structure. A firm cannot create value simply by issuing debt vs. equity — what matters is the cash flows from assets, not how they are financed.\n\n**MM Proposition II (No Taxes):** As a firm takes on more debt, the required return on equity rises proportionally to maintain a constant WACC. Leverage increases equity holders' risk (financial risk on top of business risk), so they demand a higher return — exactly offsetting the apparent benefit of cheaper debt.\n\n**The perfect market assumptions** that make irrelevance hold:\n- No taxes\n- No bankruptcy costs\n- No information asymmetry\n- No transaction costs\n- Investors can borrow/lend at the same rate as firms\n\n**Why this matters:** The theorems are powerful because they tell us exactly *which market imperfections* drive real-world capital structure decisions. Remove any assumption and you get a reason to prefer debt or equity.",
          highlight: [
            "Modigliani-Miller",
            "MM Proposition I",
            "MM Proposition II",
            "capital structure",
            "WACC",
            "financial risk",
            "business risk",
            "perfect capital market",
          ],
        },
        {
          type: "teach",
          title: "Tax Shield, Financial Distress & The Trade-Off Theory",
          content:
            "**MM with Corporate Taxes (1963):** When interest is tax-deductible, debt creates a **tax shield** equal to the tax rate multiplied by debt outstanding.\n\n**Value of levered firm = Value of unlevered firm + PV(Tax Shield)**\nVL = VU + T × D\n\nWhere **T** = corporate tax rate, **D** = value of debt. In the extreme, 100% debt maximizes firm value — but this ignores real-world costs.\n\n**Financial distress costs** erode the tax shield benefit at high leverage:\n- **Direct costs**: Legal and administrative fees in bankruptcy (typically 3–5% of firm value)\n- **Indirect costs**: Lost customers, supplier credit tightening, key employee departures, foregone investment opportunities — often 10–20% of pre-distress firm value\n- Firms in distress may underinvest (**debt overhang**) or take excessive risk (**risk shifting / asset substitution**)\n\n**Trade-off theory:** Optimal capital structure balances the tax shield benefit of debt against financial distress costs:\n\nV* = VU + PV(Tax Shield) − PV(Financial Distress Costs)\n\nThe optimal debt ratio is where the marginal tax shield benefit equals the marginal expected distress cost — typically lower for volatile, intangible-asset-heavy firms (tech, pharma) and higher for stable, asset-rich firms (utilities, real estate).",
          highlight: [
            "tax shield",
            "financial distress",
            "trade-off theory",
            "debt overhang",
            "risk shifting",
            "asset substitution",
            "optimal capital structure",
            "direct costs",
            "indirect costs",
          ],
        },
        {
          type: "teach",
          title: "Pecking Order Theory & Agency Costs",
          content:
            "**Pecking order theory** (Myers & Majluf, 1984) argues that firms have a preference hierarchy for financing sources, driven by **information asymmetry** between managers and investors.\n\n**The pecking order:**\n1. **Internal funds (retained earnings)** — cheapest, no signaling cost, no dilution\n2. **Debt** — signals confidence (managers would not borrow if they expected trouble)\n3. **Equity** — last resort; issuing equity signals management believes the stock is overvalued, causing the price to drop on announcement\n\n**Key prediction:** Firms do not have a static target leverage ratio. Instead, leverage fluctuates based on financing needs — profitable firms accumulate cash and have low debt (the opposite of trade-off theory's prediction for high-value firms).\n\n**Agency costs of debt:**\n- **Debt overhang**: Shareholders of a distressed firm may reject positive-NPV projects because gains accrue to bondholders\n- **Asset substitution**: Shareholders may shift to riskier projects — upside goes to them, downside to bondholders\n- **Free cash flow problem** (Jensen, 1986): Excess free cash flow may be wasted on empire-building acquisitions; debt disciplines management by committing cash flows to interest payments\n\n**Agency benefit of debt:** Forces managers to be disciplined, reducing empire-building. Leveraged buyouts exploit this — imposing debt reduces management's discretionary cash.",
          highlight: [
            "pecking order theory",
            "information asymmetry",
            "retained earnings",
            "debt overhang",
            "asset substitution",
            "free cash flow problem",
            "agency costs",
            "empire-building",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "According to Modigliani-Miller Proposition II (with no taxes), what happens to the required return on equity as a firm increases its financial leverage?",
          options: [
            "It decreases, because cheaper debt lowers the blended cost of capital",
            "It remains constant, since overall firm value is unchanged",
            "It increases proportionally, keeping WACC constant",
            "It becomes equal to the cost of debt as leverage approaches 100%",
          ],
          correctIndex: 2,
          explanation:
            "MM Proposition II states that as a firm substitutes debt for equity, the cost of equity rises linearly with the debt-to-equity ratio. This is because equity holders face increasing financial risk on top of the firm's underlying business risk — they demand a higher return to compensate. The rise in the cost of equity exactly offsets the benefit of using cheaper debt, so WACC remains constant. This is the core insight: capital structure is irrelevant in perfect markets.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Under pecking order theory, a highly profitable firm with consistent earnings would be expected to have high financial leverage, as it has the capacity to service large amounts of debt.",
          correct: false,
          explanation:
            "False. Pecking order theory predicts the opposite: profitable firms generate substantial retained earnings (the cheapest financing source) and therefore have little need to access external capital. Over time, they accumulate internal cash and tend to have low leverage. This is a key empirical prediction that differs from trade-off theory, which would predict profitable firms use more debt to exploit the tax shield. Empirically, many profitable tech and pharmaceutical companies carry minimal debt.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "A firm is considering increasing its leverage from 20% to 60% debt-to-assets. Which factor would most justify maintaining low leverage despite the tax shield benefit?",
          options: [
            "The firm has very stable, predictable cash flows from long-term contracts",
            "The firm's assets consist primarily of intangible IP and human capital with limited liquidation value",
            "The firm operates in a low-growth mature industry with minimal investment opportunities",
            "The corporate tax rate is currently very high, maximizing the interest tax shield",
          ],
          correctIndex: 1,
          explanation:
            "Financial distress costs are especially severe for firms whose assets are primarily intangible (IP, brand, talent). These assets have low collateral value and are easily destroyed by distress — customers flee, key employees leave, and the assets cannot be sold to repay creditors. The expected cost of distress is therefore high, arguing for low leverage. Stable cash flows (A) and mature industries (C) actually support more leverage. A high tax rate (D) increases the tax shield benefit, arguing for more debt.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Dividends & Buybacks ──────────────────────────────────────
    {
      id: "corporate-finance-3",
      title: " Dividends & Buybacks",
      description:
        "Dividend policy irrelevance, signaling theory, share repurchases vs dividends, payout ratio analysis, and special dividends",
      icon: "DollarSign",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Dividend Policy Irrelevance (MM Again)",
          content:
            "**Miller and Modigliani (1961)** extended their irrelevance theorem to dividend policy: in a perfect capital market (no taxes, no transaction costs, no information asymmetry), **dividend policy does not affect firm value**.\n\n**The logic:** If a firm pays a dividend, the share price drops by the dividend amount on the ex-dividend date. Shareholders receive cash but have less valuable shares — no net change in wealth. A firm that retains earnings reinvests them at the required return, keeping shareholder wealth unchanged.\n\n**Home-made dividends:** Shareholders who want income from a no-dividend firm can sell shares to create their own cash flows. Those who do not want dividends can reinvest them. Firms need not pay dividends to attract investors.\n\n**In reality, dividend policy does matter because of:**\n- **Taxes**: In many jurisdictions, dividends are taxed at ordinary income rates while capital gains enjoy lower rates and deferral — investors prefer retention\n- **Signaling**: Dividends convey information about future earnings expectations\n- **Agency costs**: Dividends reduce free cash flow and management's discretionary spending\n- **Clientele effect**: Different investors (retirees vs. growth investors) prefer different payout policies — firms attract their preferred investor clientele over time",
          highlight: [
            "dividend policy irrelevance",
            "ex-dividend",
            "home-made dividends",
            "clientele effect",
            "signaling",
            "agency costs",
            "tax preference",
          ],
        },
        {
          type: "teach",
          title: "Signaling Theory & Dividend Smoothing",
          content:
            "In practice, **dividend changes are powerful signals** about management's expectations for future earnings.\n\n**Dividend signaling:**\n- **Dividend increase**: Management signals confidence that higher earnings are sustainable — stock price rises on announcement (average ~+3%)\n- **Dividend cut**: A powerful negative signal, even if intended to conserve cash for investment — stock typically falls 10–20% on announcement\n- **Dividend initiation**: Strong positive signal; firms do not initiate dividends unless management is confident earnings support them indefinitely\n\n**Lintner's smoothing model (1956):** One of finance's best-supported empirical findings — managers smooth dividends:\n- Firms have a long-run **target payout ratio** (typically 30–50% of earnings)\n- They adjust dividends gradually toward the target (partial adjustment speed ~30%)\n- They strongly resist cutting dividends, even in bad years\n\n**Special dividends** are one-time cash distributions that avoid the commitment implied by regular dividends:\n- Signal a windfall (asset sale, lawsuit settlement, excess cash) without creating expectations of recurring payments\n- Microsoft's $3/share special dividend in 2004 ($32B total) is a famous example\n\n**Dividend yield** = Annual dividend per share / Share price. High-yield stocks often trade in the income-investor clientele.",
          highlight: [
            "signaling theory",
            "dividend increase",
            "dividend cut",
            "dividend initiation",
            "Lintner",
            "target payout ratio",
            "dividend smoothing",
            "special dividends",
            "dividend yield",
          ],
        },
        {
          type: "teach",
          title: "Share Repurchases: Mechanics & Comparison to Dividends",
          content:
            "**Share buybacks** have become the dominant form of cash return for large US corporations, surpassing dividends in total value since the early 2000s.\n\n**Buyback mechanics:**\n- **Open market repurchases**: Firm buys shares gradually in the open market over time (most common, 90%+ of buybacks). SEC Rule 10b-18 provides a safe harbor\n- **Tender offer**: Firm offers to buy a fixed number of shares at a premium (typically 15–20%) within a set window — signals high conviction\n- **Dutch auction**: Firm sets a price range; shareholders submit the price at which they would sell; firm buys at the lowest clearing price that fills the target quantity\n- **Accelerated share repurchase (ASR)**: Firm pays an investment bank upfront; bank borrows and delivers shares immediately, then buys in the market over time\n\n**Buybacks vs Dividends — key differences:**\n- Dividends are taxed as income; buybacks often trigger capital gains treatment\n- Dividends are sticky (hard to cut); buybacks are fully discretionary\n- Dividends signal sustainable earnings; buybacks signal stock may be undervalued\n- Buybacks raise EPS mechanically by reducing share count; dividends do not directly affect EPS\n- All shareholders receive dividends; only sellers participate in buybacks\n\n**EPS accretion from buybacks:** Reducing share count raises EPS even with no change in earnings. Critics note this is purely mechanical — it does not create value unless the buyback price is below intrinsic value.",
          highlight: [
            "share repurchases",
            "buybacks",
            "open market repurchases",
            "tender offer",
            "Dutch auction",
            "accelerated share repurchase",
            "EPS accretion",
            "intrinsic value",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A firm has $500M in excess cash and is deciding between a one-time special dividend and a permanent increase in its regular quarterly dividend. Which statement best captures the key strategic difference?",
          options: [
            "The special dividend is always tax-preferred because it qualifies as a capital gain in all jurisdictions",
            "The regular dividend increase creates an implicit long-run commitment, while the special dividend signals a non-recurring windfall without raising ongoing payout expectations",
            "The regular dividend increase is preferred because it immediately attracts a broader income-investor clientele",
            "Both options are equivalent under dividend irrelevance, so the choice is purely cosmetic",
          ],
          correctIndex: 1,
          explanation:
            "The critical distinction is commitment. Lintner's smoothing model shows managers strongly resist cutting dividends, so raising the regular dividend creates a long-run obligation. If next year's cash flow is insufficient, a dividend cut would signal distress. A special dividend avoids this — it signals that the current windfall is non-recurring (asset sale, lawsuit win, excess cash accumulation) without raising shareholders' baseline expectations. Dividend irrelevance (D) only holds in perfect markets; taxes, signaling, and clientele effects make the choice matter in practice.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A share repurchase program always creates shareholder value because it reduces share count, mechanically increasing earnings per share.",
          correct: false,
          explanation:
            "False. EPS accretion from buybacks is purely mechanical and does not create value if shares are repurchased above intrinsic value. If a firm buys back shares at $100 when fair value is $80, it destroys value for remaining shareholders — the EPS increase is more than offset by the overpayment. Buybacks create value only when executed at prices below intrinsic value, or when they reduce agency costs by distributing excess cash that would otherwise be squandered. The market has become increasingly sophisticated in distinguishing value-creating from EPS-management buybacks.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "According to the clientele effect in dividend theory, which investor group would most likely prefer a firm with a low payout ratio and high earnings retention?",
          options: [
            "Retired individuals relying on investment income to fund living expenses",
            "Tax-exempt pension funds seeking predictable current income",
            "Growth-oriented investors in high tax brackets who prefer capital appreciation",
            "Income-focused mutual funds required to distribute dividends to their shareholders",
          ],
          correctIndex: 2,
          explanation:
            "High-tax-bracket growth investors prefer low (or zero) dividend payout because: (1) retained earnings invested at the required return compound tax-deferred, (2) capital gains taxes are typically lower than ordinary income rates, and (3) investors control when to realize gains. Retired individuals (A) and income funds (D) need current cash flow and prefer high dividends. Tax-exempt pensions (B) are indifferent to the tax distinction. MM's clientele effect suggests firms naturally attract investors who match their payout policy over time.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: M&A & Corporate Control ───────────────────────────────────
    {
      id: "corporate-finance-4",
      title: " M&A & Corporate Control",
      description:
        "Synergies, accretion/dilution analysis, deal structures, LBO mechanics, hostile takeovers, and defense strategies",
      icon: "Handshake",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Synergies: The Rationale for M&A",
          content:
            "The fundamental justification for paying a premium to acquire a company is that the combined entity creates **synergies** — value that exceeds the sum of the parts.\n\n**Revenue synergies:**\n- Cross-selling products to the combined customer base\n- Geographic expansion using the target's distribution network\n- Enhanced pricing power from reduced competition\n- Revenue synergies are harder to achieve and take longer to materialize — many deals miss revenue synergy targets\n\n**Cost synergies:**\n- Elimination of duplicate functions (finance, HR, IT, legal)\n- Procurement savings from greater purchasing scale\n- Facility consolidation and overhead reduction\n- Cost synergies are more reliable and faster — typically 70–80% realized within 2 years\n\n**Financial synergies:**\n- Lower cost of debt from increased scale and diversification\n- Tax benefits (net operating loss carryforwards, step-up in asset basis)\n- Improved debt capacity from more stable combined cash flows\n\n**Valuation framework:**\nMaximum Acquisition Price = Standalone Value of Target + PV(Synergies)\n\n**Synergy premium** = (Acquisition Price − Pre-Announcement Target Price) / Pre-Announcement Target Price. Typical M&A premiums range from **20–40%** for public companies. If the acquirer pays more than the synergy value, it destroys value for its own shareholders.",
          highlight: [
            "synergies",
            "revenue synergies",
            "cost synergies",
            "financial synergies",
            "synergy premium",
            "acquisition premium",
            "cross-selling",
          ],
        },
        {
          type: "teach",
          title: "Accretion/Dilution Analysis & Deal Structure",
          content:
            "**Accretion/dilution analysis** evaluates how a deal affects the acquirer's **earnings per share (EPS)** in the first year post-closing.\n\n**Accretive deal**: Combined EPS > Acquirer's standalone EPS — seen as a positive signal\n**Dilutive deal**: Combined EPS < Acquirer's standalone EPS — requires justification via future synergies or strategic rationale\n\n**Key drivers:**\n- **Price paid**: Higher purchase price means more goodwill, more interest expense (cash deal), or more share dilution (stock deal)\n- **Target's P/E vs acquirer's P/E**: If the acquirer has a higher P/E than the target, a stock deal tends to be accretive — the acquirer's higher-valued currency buys cheaper earnings\n- **Synergies**: Sufficient synergies can turn a dilutive deal accretive within 1–2 years\n- **Financing mix**: Cheap debt can fund a cash deal accretively if the target's earnings yield exceeds the after-tax cost of debt\n\n**Deal structures:**\n- **All-cash**: Acquirer pays cash; target shareholders get certainty; acquirer assumes all integration risk; funded by cash on hand, debt, or asset sales\n- **All-stock**: Acquirer issues new shares; target shareholders receive acquirer stock; risk-sharing if deal underperforms; dilutive to acquirer's existing shareholders\n- **Mixed (cash + stock)**: Common in large transactions; balances certainty for sellers and equity upside sharing\n\n**Purchase price allocation (PPA):** Under GAAP, the excess of purchase price over fair value of net assets is booked as **goodwill**. If synergies do not materialize, goodwill is impaired — triggering a major non-cash write-down.",
          highlight: [
            "accretion",
            "dilution",
            "EPS",
            "goodwill",
            "all-cash",
            "all-stock",
            "purchase price allocation",
            "goodwill impairment",
          ],
        },
        {
          type: "teach",
          title: "LBO Mechanics & Hostile Takeovers",
          content:
            "**Leveraged Buyout (LBO)** — a private equity firm acquires a target using mostly debt (~60–80% of purchase price), with a small equity check (~20–40%). The target's own assets and cash flows service the debt.\n\n**LBO value creation levers:**\n- **Financial leverage**: Amplifies equity returns (same mechanics as a leveraged investment)\n- **Operational improvements**: Management incentives, cost cuts, revenue growth initiatives\n- **Multiple expansion**: Buy at 8× EBITDA, sell at 10× EBITDA after improving the business\n- **Debt paydown**: Free cash flows reduce debt over the holding period, increasing equity value at exit\n\n**LBO candidate characteristics:** Strong predictable free cash flows; low existing debt; hard assets as collateral; non-cyclical revenues; clear operational improvement potential.\n\n**Typical PE targets:** >20% IRR, >2× money-on-money over a 5-year hold.\n\n**Hostile takeovers** occur when a bidder makes an offer directly to shareholders without board approval:\n- **Tender offer**: Bidder offers to buy shares directly from shareholders at a premium above market price\n- **Proxy fight**: Bidder solicits shareholder votes to replace the target's board with friendly directors\n\n**Defense strategies:**\n- **Poison pill (shareholder rights plan)**: Allows existing shareholders — except the hostile bidder — to buy new shares at a steep discount, massively diluting the attacker\n- **Staggered board**: Only 1/3 of directors elected each year — takes 2+ years to gain board control\n- **White knight**: Target seeks a friendly alternative acquirer at a better price or terms\n- **Pac-Man defense**: Target launches a counterbid for the hostile acquirer",
          highlight: [
            "leveraged buyout",
            "LBO",
            "private equity",
            "multiple expansion",
            "EBITDA",
            "tender offer",
            "proxy fight",
            "poison pill",
            "staggered board",
            "white knight",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Acquirer Corp (P/E = 20×) is buying Target Inc (P/E = 12×) in an all-stock deal at no premium and with no synergies. Which outcome is most likely for Acquirer's EPS immediately post-closing?",
          options: [
            "Dilutive, because Acquirer must issue new shares to fund the transaction",
            "Accretive, because Acquirer's higher-valued shares are buying proportionally cheaper Target earnings",
            "Neutral, since a stock-for-stock exchange does not change the total pool of earnings",
            "Indeterminate without knowing the absolute price of both shares",
          ],
          correctIndex: 1,
          explanation:
            "When an acquirer has a higher P/E than its target, an all-stock deal tends to be accretive (absent a large premium or synergies). The acquirer issues fewer shares to acquire a given dollar of earnings because its shares are priced at a higher earnings multiple. Each Acquirer share issued 'costs' 20× earnings but buys Target earnings valued at only 12× — the acquirer is exchanging expensive currency for cheaper earnings. This is the fundamental arithmetic of P/E-driven accretion/dilution analysis.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In a leveraged buyout, the acquisition debt is typically placed on the acquired company's balance sheet rather than on the private equity firm's own balance sheet.",
          correct: true,
          explanation:
            "Correct. This is the defining structural feature of an LBO. The PE firm creates a special purpose acquisition vehicle that merges with the target upon closing. The acquisition debt is then on the target or the merged entity's balance sheet, serviced by the target's operating cash flows. This structure limits the PE fund's liability to the equity invested and keeps the leverage off the fund's own balance sheet — enabling the use of borrowed capital without encumbering the fund. It also means LBO targets must have strong, predictable free cash flows to service the heavy debt load.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "A company adopts a poison pill with a 15% trigger. What is the primary economic mechanism that deters a hostile bidder from crossing the threshold?",
          options: [
            "The target's board gains the right to force the bidder to sell its accumulated shares back at cost",
            "All existing shareholders except the hostile bidder can purchase new shares at a steep discount, drastically diluting the bidder's stake and voting power",
            "The bidder is legally required to launch a full tender offer for all remaining shares at the highest price paid",
            "The target's outstanding debt automatically accelerates and becomes immediately due, making the acquisition prohibitively expensive",
          ],
          correctIndex: 1,
          explanation:
            "A poison pill (shareholder rights plan) grants all shareholders — except the triggering hostile bidder — the right to purchase additional shares at a large discount (typically 50% below market) once the bidder crosses the trigger threshold (commonly 15–20%). This floods the market with new shares the bidder cannot purchase, drastically diluting the bidder's economic interest and voting power. The economic cost of dilution makes proceeding with a hostile acquisition without board approval prohibitively expensive. Poison pills have become nearly universal among large US public companies.",
          difficulty: 3,
        },
      ],
    },
  ],
};
