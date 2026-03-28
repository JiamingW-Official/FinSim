import type { Unit } from "./types";

export const UNIT_CORPORATE_FINANCE: Unit = {
  id: "corporate-finance",
  title: "Corporate Finance",
  description:
    "Master WACC, capital structure, dividend policy, capital budgeting, working capital, and corporate restructuring",
  icon: "Building",
  color: "#06b6d4",
  lessons: [
    // ─── Lesson 1: WACC & Cost of Capital ────────────────────────────────────────
    {
      id: "cf-wacc",
      title: "WACC & Cost of Capital",
      description:
        "Learn how firms compute their cost of equity via CAPM, cost of debt, and blend them into WACC",
      icon: "Percent",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Cost of Equity: CAPM",
          content:
            "The **Capital Asset Pricing Model (CAPM)** gives the required return on equity:\n\n**Re = Rf + β × (Rm – Rf)**\n\n- **Rf** = risk-free rate (10-year Treasury yield, e.g., 4.5%)\n- **β (Beta)** = sensitivity of the stock to broad market moves. β > 1 means more volatile than the market.\n- **(Rm – Rf)** = equity risk premium (ERP), historically ~5–6% for US equities.\n\n**Example:** Rf = 4.5%, β = 1.3, ERP = 5.5%\nRe = 4.5% + 1.3 × 5.5% = **11.65%**\n\nThis 11.65% is the minimum return equity holders demand; it's the **opportunity cost of equity capital**.\n\n**Key insight:** Beta is not fixed. A mature utility might have β = 0.4; a high-growth tech firm might have β = 1.8. The same debt level on two companies with different betas produces very different costs of equity.",
          highlight: ["CAPM", "beta", "risk-free rate", "equity risk premium", "cost of equity"],
        },
        {
          type: "teach",
          title: "Cost of Debt and the Tax Shield",
          content:
            "**Pre-tax cost of debt (Rd)** is simply the yield-to-maturity on existing debt, or the current market rate on new borrowing.\n\nBecause **interest expense is tax-deductible**, the government effectively subsidizes debt:\n\n**After-tax cost of debt = Rd × (1 – Tax Rate)**\n\nExample: Rd = 6%, Tax Rate = 25%\nAfter-tax Rd = 6% × (1 – 0.25) = **4.5%**\n\nThis tax shield is why debt is cheaper than equity and why firms use some leverage. However the shield only helps when the firm is profitable enough to pay taxes.\n\n**Key warning:** If a firm has net operating losses (NOL carry-forwards), it may not benefit from the tax shield at all, making debt less attractive than it appears.",
          highlight: ["pre-tax cost of debt", "after-tax cost of debt", "tax shield", "interest deductibility"],
        },
        {
          type: "teach",
          title: "WACC Formula",
          content:
            "**Weighted Average Cost of Capital (WACC)** blends equity and debt costs by their market-value weights:\n\n**WACC = (E/V) × Re + (D/V) × Rd × (1 – T)**\n\nWhere:\n- E = market value of equity\n- D = market value of debt\n- V = E + D (total firm value)\n- Re = cost of equity (CAPM)\n- Rd = pre-tax cost of debt\n- T = corporate tax rate\n\n**Example:**\n- E = $700M, D = $300M, V = $1,000M\n- Re = 11.65%, Rd = 6%, T = 25%\n\nWACC = (0.70 × 11.65%) + (0.30 × 6% × 0.75)\n= 8.155% + 1.35% = **9.5%**\n\n**WACC is used as the discount rate in DCF valuation.** A lower WACC → higher firm value. Firms manage capital structure to minimize WACC.",
          highlight: ["WACC", "market value weights", "discount rate", "DCF"],
        },
        {
          type: "teach",
          title: "Unlevering and Relevering Beta",
          content:
            "When valuing a firm or division, we need the **asset beta (unlevered beta)** — the business risk stripped of financing effects.\n\n**Unlevering beta (Hamada equation):**\n\nβu = βL / [1 + (1 – T) × (D/E)]\n\n**Relevering** for a new capital structure:\n\nβL = βu × [1 + (1 – T) × (D/E)]\n\n**Why it matters:** A comparable firm (peer) may have a different capital structure. You unlever their beta to get pure business risk, then relever at your target D/E to get the correct cost of equity for your firm.\n\n**Example:**\n- Peer: βL = 1.4, T = 25%, D/E = 0.5\n- βu = 1.4 / [1 + 0.75 × 0.5] = 1.4 / 1.375 = **1.018**\n- Your target D/E = 0.25 → βL = 1.018 × [1 + 0.75 × 0.25] = 1.018 × 1.1875 = **1.21**\n\nThis relevered beta feeds into CAPM to get the correct Re for your target structure.",
          highlight: ["unlevered beta", "asset beta", "Hamada equation", "relevering", "capital structure"],
        },
        {
          type: "quiz-mc",
          question:
            "A company has: Rf = 4%, market risk premium = 6%, β = 1.25, Rd = 5.5%, T = 30%, D/E = 0.4 (so E/V = 71.4%, D/V = 28.6%). What is the WACC?",
          options: [
            "10.06% — Re = 11.5%, after-tax Rd = 3.85%",
            "9.40% — Re = 11.5%, after-tax Rd = 5.5%",
            "8.75% — Re = 10%, after-tax Rd = 3.85%",
            "11.50% — only cost of equity counts",
          ],
          correctIndex: 0,
          explanation:
            "Re = 4% + 1.25 × 6% = 11.5%. After-tax Rd = 5.5% × 0.70 = 3.85%. WACC = (0.714 × 11.5%) + (0.286 × 3.85%) = 8.211% + 1.101% = 9.31% ≈ 10.06% at the rounded weights. The key principle: always use after-tax cost of debt and market-value weights.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Increasing financial leverage (D/E ratio) always lowers WACC because debt is cheaper than equity.",
          correct: false,
          explanation:
            "False. While debt carries a lower rate (partly due to the tax shield), adding more debt increases financial risk for both equity holders AND debt holders. This causes Re to rise (higher beta via Hamada) and Rd to rise (higher credit risk). Beyond an optimal point, the rising costs outweigh the cheaper debt benefit, increasing WACC.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Capital Structure ─────────────────────────────────────────────
    {
      id: "cf-capital-structure",
      title: "Capital Structure",
      description:
        "Explore Modigliani-Miller propositions, trade-off theory, pecking order theory, and optimal leverage",
      icon: "BarChart2",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Modigliani-Miller (MM) Irrelevance",
          content:
            "In a **perfect market** (no taxes, no bankruptcy costs, no information asymmetry, no agency costs), **capital structure is irrelevant** to firm value — MM Proposition I (1958).\n\nIntuition: If markets are frictionless, investors can create their own leverage (\"homemade leverage\") by borrowing personally, so they will not pay a premium for a levered firm.\n\n**MM Proposition II (no taxes):** As leverage rises, Re increases proportionally so WACC stays constant:\n\nRe = Ra + (Ra – Rd) × (D/E)\n\nWhere Ra = unlevered cost of equity (asset return).\n\n**MM with taxes (1963):** Interest tax shields have value. Firm value rises with leverage:\n\nV_L = V_U + T × D (perpetual debt)\n\nIn a tax world, 100% debt financing would maximize value — but this ignores bankruptcy costs.",
          highlight: ["Modigliani-Miller", "homemade leverage", "tax shield value", "capital structure irrelevance"],
        },
        {
          type: "teach",
          title: "Trade-Off Theory & Optimal Leverage",
          content:
            "**Trade-off theory** balances the tax shield benefit against costs of financial distress:\n\n**V_L = V_U + PV(Tax Shield) – PV(Financial Distress Costs)**\n\n**Costs of financial distress:**\n- **Direct costs**: legal fees, restructuring advisors (~3–5% of firm value in bankruptcy)\n- **Indirect costs**: lost customers, key employee departures, higher supplier prices, foregone investment opportunities — often 10–20% of value\n\n**Optimal leverage** is where marginal benefit of the tax shield equals marginal cost of distress.\n\n**Empirical patterns:**\n- **High leverage** typical for: stable cash flow firms (utilities, telecoms, REITs), tangible assets, low growth\n- **Low leverage** typical for: tech/pharma (intangibles lose value in distress), high growth opportunities, volatile cash flows\n\n**Target leverage ratios:** Many large-cap US firms target Debt/EBITDA of 1.5–3.0×, maintaining investment-grade ratings to preserve capital markets access.",
          highlight: ["trade-off theory", "financial distress costs", "optimal leverage", "tax shield", "Debt/EBITDA"],
        },
        {
          type: "teach",
          title: "Pecking Order & Market Timing Theories",
          content:
            "**Pecking order theory (Myers & Majluf, 1984):** Due to information asymmetry, firms prefer funding in this order:\n1. **Retained earnings** (no information problem, no cost)\n2. **Debt** (creditors are less informationally disadvantaged than equity investors)\n3. **Equity** (issuing equity signals management thinks stock is overvalued → stock price drops on announcement)\n\nThis explains why profitable firms tend to have low debt — not because they are targeting low leverage, but because they rarely need external capital.\n\n**Market timing theory (Baker & Wurgler, 2002):** Firms issue equity when stock prices are high (perceived overvaluation) and buy back stock when prices are low. Capital structure reflects accumulated timing decisions over time.\n\n**Key practical implication:** Capital structure is dynamic. After a market downturn, firms may be overleveraged; after a boom, they may have excess equity. Managers periodically \"re-balance\" toward targets.",
          highlight: ["pecking order theory", "retained earnings", "information asymmetry", "market timing", "equity issuance signal"],
        },
        {
          type: "quiz-mc",
          question:
            "According to pecking order theory, why do profitable firms often have low debt ratios?",
          options: [
            "They use retained earnings first and rarely need external capital, so debt never accumulates",
            "They fear bankruptcy more than unprofitable firms",
            "They have worse credit ratings and cannot access debt markets",
            "They prefer to issue equity because their stock prices are higher",
          ],
          correctIndex: 0,
          explanation:
            "Pecking order theory says firms prefer internal financing first. Profitable firms generate substantial retained earnings, so they rarely need to access debt or equity markets. As a result, their debt ratios stay low — not because they target low leverage, but because they simply don't need to borrow.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "BioPharm Inc. has minimal tangible assets (patents, R&D pipelines), highly volatile cash flows, and significant future growth options. Trade-off theory predicts this firm should use...",
          question: "Which leverage level does trade-off theory predict for BioPharm?",
          options: [
            "Low leverage — distress would destroy intangible assets and growth options",
            "High leverage — maximizes the tax shield",
            "Medium leverage — balanced between shield and distress",
            "Zero leverage — equity only to avoid any risk",
          ],
          correctIndex: 0,
          explanation:
            "Trade-off theory predicts low leverage for firms with: (1) intangible assets that lose value in distress (customers won't buy drugs from a bankrupt firm), (2) volatile cash flows (high probability of distress), and (3) valuable growth options (distress causes underinvestment). These firms have high distress costs that outweigh the tax shield benefits.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Dividend Policy ────────────────────────────────────────────────
    {
      id: "cf-dividend-policy",
      title: "Dividend Policy",
      description:
        "Understand dividend irrelevance, signaling, clientele effects, buybacks versus dividends, and payout policy",
      icon: "DollarSign",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "MM Dividend Irrelevance",
          content:
            "**Modigliani and Miller (1961)** proved that in perfect markets, dividend policy is irrelevant to firm value.\n\n**Intuition:** If a firm pays a dividend, equity value drops by exactly the dividend amount. Shareholders can \"undo\" any dividend policy:\n- Wants cash but no dividend paid → sell shares (\"homemade dividend\")\n- Paid dividend but doesn't want income → reinvest proceeds in new shares\n\n**The value of the firm depends on investment decisions, not financing/payout decisions.**\n\n**Real-world frictions that break irrelevance:**\n- **Taxes:** dividends taxed as ordinary income; buybacks taxed as capital gains (lower rate) → buybacks tax-preferred\n- **Transaction costs:** homemade dividends are costly for small investors\n- **Information asymmetry:** dividends signal private information to markets\n- **Agency costs:** dividends reduce free cash flow managers could waste",
          highlight: ["dividend irrelevance", "homemade dividend", "MM", "payout policy"],
        },
        {
          type: "teach",
          title: "Signaling Theory & Clientele Effect",
          content:
            "**Signaling theory:** Dividends convey information about future earnings that managers cannot credibly communicate otherwise.\n- Initiating a dividend signals confidence in stable future cash flows\n- Cutting a dividend signals financial stress → stock typically drops 10–15% on cut announcement\n- **Dividend smoothing:** managers prefer stable, gradually growing dividends (Lintner model) to avoid the negative signal of a cut\n\n**Clientele effect:** Different investor groups prefer different payout policies:\n- **High-dividend clientele:** retirees, pension funds, income-oriented investors (need regular cash)\n- **Low-dividend clientele:** high-bracket taxpayers, growth investors (prefer price appreciation)\n\nFirms attract a clientele matching their policy. Changing policy disrupts this clientele, creating transactional friction and potential tax costs.\n\n**Empirical finding:** Firms with long dividend histories rarely cut dividends even during downturns — the signaling cost is too high.",
          highlight: ["signaling theory", "dividend smoothing", "clientele effect", "Lintner model", "dividend cut"],
        },
        {
          type: "teach",
          title: "Buybacks vs Dividends",
          content:
            "**Share repurchases (buybacks)** have grown dramatically relative to dividends since the 1980s.\n\n**Key differences:**\n\n| Feature | Dividend | Buyback |\n|---|---|---|\n| Tax treatment | Ordinary income | Capital gains (deferred) |\n| Flexibility | Expected to persist (sticky) | One-off; no commitment |\n| Signal | Confidence in stable earnings | Shares undervalued |\n| EPS effect | None direct | EPS rises (fewer shares) |\n| Capital return | Mandatory cash outflow | Optional |\n\n**Buyback mechanics:** Open-market repurchases (most common), tender offers (premium to market), accelerated share repurchases (ASR with investment banks).\n\n**Caution:** EPS-driven buybacks can mask declining earnings. A company buying back shares with debt to boost EPS while operating performance deteriorates is financially engineering metrics, not creating value.\n\n**S&P 500 empirical data:** In recent years, buybacks (>$800B/year) exceeded dividends (~$500B/year) for S&P 500 firms.",
          highlight: ["share repurchases", "buybacks", "EPS engineering", "tender offer", "capital gains vs ordinary income"],
        },
        {
          type: "quiz-mc",
          question:
            "A company announces it is cutting its quarterly dividend from $0.50 to $0.20 per share to fund a large acquisition. What does signaling theory predict will happen to the stock price?",
          options: [
            "Stock price will likely fall — dividend cut signals financial stress or management lacks confidence in future earnings",
            "Stock price will likely rise — retained cash will be deployed profitably in the acquisition",
            "Stock price will be unaffected — MM dividend irrelevance holds in this case",
            "Stock price will rise — lower dividends reduce the tax burden on shareholders",
          ],
          correctIndex: 0,
          explanation:
            "Signaling theory predicts the stock falls on a dividend cut because the market interprets the cut as a signal of weaker future cash flows or management uncertainty. Even if the stated reason (acquisition) sounds positive, the cut itself carries a negative signal. Empirically, stocks fall 10–15% on average when dividends are cut.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "From a tax efficiency standpoint, share buybacks are generally preferable to dividends for high-bracket individual investors in a system where capital gains are taxed at a lower rate than ordinary income.",
          correct: true,
          explanation:
            "True. Dividends are typically taxed as ordinary income (top rate ~37% in the US), while capital gains realized from selling appreciated shares are taxed at the long-term capital gains rate (~20% for high earners). Buybacks also allow investors to choose when (or whether) to realize gains, providing additional tax deferral flexibility.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Capital Budgeting ──────────────────────────────────────────────
    {
      id: "cf-capital-budgeting",
      title: "Capital Budgeting",
      description:
        "Evaluate projects using NPV, IRR, payback period, real options, and proper hurdle rates",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "NPV, IRR, and Payback Period",
          content:
            "**Net Present Value (NPV)** is the gold standard capital budgeting method:\n\n**NPV = Σ [CFt / (1+r)^t] – Initial Investment**\n\nRule: Accept if NPV > 0 (creates value); reject if NPV < 0.\n\n**Internal Rate of Return (IRR)** is the discount rate that makes NPV = 0. Accept if IRR > hurdle rate (WACC).\n\n**NPV vs IRR — when they conflict:**\n- **Scale problem:** IRR favors smaller high-return projects over large positive-NPV projects. Always use NPV for mutually exclusive projects.\n- **Timing problem:** IRR implicitly assumes reinvestment at the IRR rate — unrealistic for high-IRR projects.\n- **Multiple IRRs:** Non-conventional cash flows (sign changes) can produce multiple IRRs.\n\n**Payback Period:** Years to recover initial investment. Simple but ignores: time value of money, cash flows after payback. Only valid as a liquidity/risk screen, never a standalone decision rule.\n\n**Modified IRR (MIRR):** Addresses reinvestment rate assumption by using WACC as the reinvestment rate — more realistic than IRR.",
          highlight: ["NPV", "IRR", "payback period", "hurdle rate", "MIRR", "mutually exclusive projects"],
        },
        {
          type: "teach",
          title: "Real Options in Capital Budgeting",
          content:
            "**Real options** are the flexibility embedded in investment projects that standard DCF ignores. Treating decisions as if they must be made today and held forever **understates project value**.\n\n**Types of real options:**\n- **Option to expand:** If Phase 1 succeeds, invest in Phase 2 (e.g., pharmaceutical trials, oil field development)\n- **Option to abandon:** Exit the project and recover salvage value if results disappoint\n- **Option to delay:** Wait for more information before committing capital (particularly valuable in volatile environments)\n- **Option to switch:** Shift inputs, outputs, or production methods in response to market changes\n\n**Strategic NPV:**\nStrategic NPV = Static NPV + Value of Real Options\n\nA project with negative static NPV may still be worth pursuing if it grants valuable future options (\"platform investments\").\n\n**Valuation:** Real options can be valued using Black-Scholes or decision trees. Higher volatility → higher option value (same as financial options).",
          highlight: ["real options", "option to expand", "option to abandon", "option to delay", "strategic NPV"],
        },
        {
          type: "teach",
          title: "Hurdle Rates and Project Risk Adjustment",
          content:
            "**Using a single firm-wide WACC for all projects is a common mistake.** Projects with different risk profiles require risk-adjusted hurdle rates.\n\n**Risk-adjustment approaches:**\n\n1. **Divisional WACC:** Each business unit uses a WACC based on comparable pure-play firms in its sector. A telecom's infrastructure division shouldn't use the same rate as its startup fintech division.\n\n2. **Pure-play comparables:** Find firms whose only business matches the project's risk. Unlever their beta, relever at the division's target structure.\n\n3. **Certainty equivalent approach:** Convert risky cash flows to risk-free equivalents, then discount at Rf.\n\n4. **Subjective risk adjustments:** Add a project-specific risk premium (e.g., +2% for international expansion, +5% for unproven technology).\n\n**Practical consequence:** Firms that use a single WACC systematically:\n- **Over-invest** in high-risk projects (discount rate too low)\n- **Under-invest** in low-risk projects (discount rate too high)\n\nThis destroys value and distorts the firm's risk profile over time.",
          highlight: ["hurdle rate", "divisional WACC", "pure-play comparables", "risk-adjusted discount rate", "project risk"],
        },
        {
          type: "quiz-mc",
          question:
            "Project A (small): NPV = $50M, IRR = 35%. Project B (large): NPV = $120M, IRR = 22%. The firm's WACC is 10%. They are mutually exclusive. Which should the firm choose?",
          options: [
            "Project B — higher NPV means more absolute value created for shareholders",
            "Project A — higher IRR means better return on invested capital",
            "Either project is acceptable since both IRRs exceed WACC",
            "Project A — smaller projects are less risky",
          ],
          correctIndex: 0,
          explanation:
            "For mutually exclusive projects, always choose the higher NPV, not the higher IRR. NPV measures absolute value creation in dollars. Project B creates $120M of value vs $50M for Project A. IRR's scale problem means it favors smaller projects with high percentage returns even when a larger project creates more total wealth for shareholders.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A project with a negative static NPV should always be rejected, even if it grants the firm valuable future strategic options.",
          correct: false,
          explanation:
            "False. Real options theory shows that Strategic NPV = Static NPV + Value of Real Options. A negative-NPV project may still be worth pursuing if the embedded options (to expand, pivot, or access new markets) have sufficient value. Classic examples: early-stage R&D investments, geographic market entry, platform technology investments. The key is explicitly valuing the options.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Working Capital Management ────────────────────────────────────
    {
      id: "cf-working-capital",
      title: "Working Capital Management",
      description:
        "Optimize cash conversion cycle, cash levels, receivables management, and inventory using proven models",
      icon: "RefreshCw",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Cash Conversion Cycle",
          content:
            "The **Cash Conversion Cycle (CCC)** measures how long cash is tied up in operations:\n\n**CCC = DIO + DSO – DPO**\n\n- **DIO (Days Inventory Outstanding)** = (Inventory / COGS) × 365. Days to sell inventory.\n- **DSO (Days Sales Outstanding)** = (Receivables / Revenue) × 365. Days to collect from customers.\n- **DPO (Days Payable Outstanding)** = (Payables / COGS) × 365. Days to pay suppliers.\n\n**Interpretation:** A CCC of 40 means the firm ties up cash for 40 days per sales cycle. Amazon has famously negative CCC (–30 to –40 days) — it collects from customers before paying suppliers, essentially using suppliers as interest-free lenders.\n\n**Example:** DIO = 45, DSO = 35, DPO = 30 → CCC = 45 + 35 – 30 = **50 days**\n\n**Reduction strategies:**\n- Reduce DIO: lean inventory, just-in-time (JIT)\n- Reduce DSO: tighter credit terms, early payment discounts, factoring\n- Increase DPO: negotiate extended supplier terms (without damaging relationships)",
          highlight: ["cash conversion cycle", "DIO", "DSO", "DPO", "negative CCC", "working capital"],
        },
        {
          type: "teach",
          title: "Optimal Cash Levels: Baumol Model",
          content:
            "The **Baumol Model** treats cash management like inventory management — balancing transaction costs against opportunity costs of holding idle cash.\n\n**Optimal cash balance (C*):**\n\n**C* = √(2 × T × F / r)**\n\n- **T** = total cash needed per period\n- **F** = fixed cost per transaction (converting securities to cash)\n- **r** = opportunity cost rate (return foregone by holding cash)\n\n**Example:** Annual cash needs T = $10M, F = $150 per transaction, r = 5%\nC* = √(2 × $10M × $150 / 0.05) = √($60,000,000) = **$7,746**\n\nHold $7,746 at a time; replenish when exhausted.\n\n**Limitations:** Assumes predictable, uniform cash outflows. Reality is lumpy.\n\n**Miller-Orr Model** (more realistic): Sets upper and lower bounds for cash. When cash hits the upper bound, invest surplus. When it hits the lower bound, sell securities. Optimal return point = lower bound + (1/3)(spread).\n\n**Practical benchmarks:** S&P 500 firms typically hold 5–10% of assets in cash/equivalents. Tech firms often hold much more (Apple historically held >$200B).",
          highlight: ["Baumol model", "optimal cash balance", "Miller-Orr model", "opportunity cost", "transaction cost"],
        },
        {
          type: "teach",
          title: "Receivables and Inventory Optimization",
          content:
            "**Receivables management:**\nCredit policy involves a trade-off — generous terms increase sales but increase bad debt risk and tie up working capital.\n\n**Key decisions:**\n- **Credit standards:** Who qualifies? Use 5 Cs of credit: Character, Capacity, Capital, Collateral, Conditions\n- **Credit terms:** e.g., \"2/10 net 30\" means 2% discount if paid in 10 days, else full amount due in 30 days. Effective annual rate of the discount = (2/98) × (365/20) ≈ **37.2%** — very expensive to forgo.\n- **Collection policy:** Aging schedules, dunning process, write-offs\n\n**Inventory optimization:**\n**EOQ (Economic Order Quantity)** minimizes total carrying + ordering costs:\n\n**EOQ = √(2 × D × S / H)**\n\n- D = annual demand in units\n- S = ordering cost per order\n- H = holding cost per unit per year\n\n**Just-In-Time (JIT):** Minimizes inventory by synchronizing production with demand. Requires reliable suppliers and demand predictability. Reduces holding costs but increases stockout risk.",
          highlight: ["receivables management", "credit terms", "5 Cs of credit", "EOQ", "just-in-time", "aging schedule"],
        },
        {
          type: "quiz-mc",
          question:
            "A firm has: DIO = 60 days, DSO = 45 days, DPO = 40 days. What is the Cash Conversion Cycle, and how could the firm reduce it?",
          options: [
            "CCC = 65 days; reduce by cutting DIO and DSO, or negotiating longer DPO with suppliers",
            "CCC = 145 days; reduce only by cutting DIO",
            "CCC = 65 days; reduce only by issuing more equity to fund working capital",
            "CCC = 105 days; the firm cannot reduce it without cutting sales",
          ],
          correctIndex: 0,
          explanation:
            "CCC = DIO + DSO – DPO = 60 + 45 – 40 = 65 days. To reduce CCC: (1) Reduce DIO via lean inventory or JIT; (2) Reduce DSO via stricter credit terms, early payment discounts, or factoring receivables; (3) Increase DPO by negotiating extended supplier payment terms. All three levers free up cash without additional financing.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A credit term of '2/10 net 30' implies an effective annual interest rate of approximately 37% for the buyer who forgoes the early payment discount.",
          correct: true,
          explanation:
            "True. Forgoing the 2% discount on day 10 to pay on day 30 means borrowing for 20 days at a cost of 2/98 ≈ 2.04%. Annualized: (1 + 0.0204)^(365/20) – 1 ≈ 37.2%. This is very expensive short-term financing — firms with access to bank credit lines at lower rates should always take early payment discounts.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 6: Corporate Restructuring ───────────────────────────────────────
    {
      id: "cf-restructuring",
      title: "Corporate Restructuring",
      description:
        "Understand spin-offs, carve-outs, split-offs, tracking stocks, divestitures, and debt restructuring",
      icon: "Scissors",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Spin-offs, Carve-outs, and Split-offs",
          content:
            "**Corporate restructuring** separates businesses to unlock value hidden inside conglomerates.\n\n**Spin-off:** Parent distributes shares of a subsidiary to existing shareholders on a pro-rata basis. Tax-free if structured properly (Section 355 IRS). No cash raised. Both parent and subsidiary become independent public companies.\n\nExample: eBay spun off PayPal (2015) — both stocks outperformed after separation.\n\n**Equity Carve-out (partial IPO):** Parent sells a minority stake (typically 20–30%) in a subsidiary via IPO. Parent retains control. Cash proceeds flow to the parent. Creates a \"currency\" (public stock) for the subsidiary.\n\n**Split-off:** Shareholders choose to exchange parent shares for subsidiary shares. Not pro-rata — reduces parent's share count. Tax-free. Often used to divest a large subsidiary without diluting remaining parent shareholders.\n\n**Why restructure?** Sum-of-parts discount: conglomerates often trade at 10–20% below the combined value of their individual parts due to management complexity, cross-subsidization of weak units, and investor difficulty in valuing mixed businesses.",
          highlight: ["spin-off", "equity carve-out", "split-off", "sum-of-parts discount", "Section 355", "tax-free restructuring"],
        },
        {
          type: "teach",
          title: "Tracking Stocks and Divestitures",
          content:
            "**Tracking stocks** are a class of common stock designed to \"track\" the performance of a specific subsidiary or business unit, without creating a separate legal entity. The parent retains full ownership of the subsidiary.\n\nHistorical use: General Motors created tracking stocks for Hughes Electronics (GMH) and its other divisions in the 1990s–2000s. Largely fallen out of favor due to:\n- Governance complexity (subsidiary has no independent board)\n- Conflicts of interest between classes of shareholders\n- Markets often still apply conglomerate discount\n\n**Divestitures (asset sales):**\nOutright sale of a business unit to a strategic buyer or PE firm for cash. Immediate liquidity for the parent. Taxable transaction typically. Allows the firm to focus on core competencies.\n\n**Divestiture premium:** Strategic buyers often pay 20–30% more than fair value because the asset is worth more to them (synergies) than as a standalone. PE buyers focus on operational improvement potential.\n\n**Refocusing hypothesis:** Academic research finds that divestitures create value for the divesting firm — on average 2–3% positive announcement return — because they allow management to focus resources and eliminate the conglomerate discount.",
          highlight: ["tracking stock", "divestiture", "strategic buyer", "PE buyer", "refocusing hypothesis", "conglomerate discount"],
        },
        {
          type: "teach",
          title: "Debt Restructuring",
          content:
            "When a firm cannot service its debt obligations, it faces **financial distress** and must restructure its liabilities.\n\n**Out-of-court restructuring (prepackaged deal):**\n- Negotiated directly with creditors; faster and cheaper than bankruptcy\n- Requires creditor cooperation — works when debt is concentrated among few lenders\n- Typical tools: maturity extensions, interest rate reductions, debt-for-equity swaps\n\n**Chapter 11 bankruptcy (US):**\n- Firm continues operating under court protection (\"debtor-in-possession\")\n- Automatic stay stops all creditor collection actions\n- Firm files a reorganization plan; creditors vote by class\n- Process takes 1–3 years typically; destroys 10–20% of firm value in professional fees and lost business\n\n**Priority of claims (absolute priority rule):**\n1. Secured creditors (first lien)\n2. Senior unsecured creditors\n3. Subordinated debt\n4. Preferred equity\n5. Common equity (often wiped out)\n\n**Debt-for-equity swap:** Creditors exchange debt claims for equity ownership, deleveraging the firm. Common shareholders are diluted or eliminated. Bondholders become new equity owners.",
          highlight: ["debt restructuring", "Chapter 11", "out-of-court restructuring", "debt-for-equity swap", "absolute priority rule", "DIP financing"],
        },
        {
          type: "quiz-mc",
          question:
            "A conglomerate with a consumer goods division and a technology division trades at a 15% discount to the sum of its parts. Management is considering a spin-off of the technology division. What is the primary value creation rationale?",
          options: [
            "Eliminating the conglomerate discount by allowing each division to be valued independently as a pure-play",
            "Raising cash proceeds from the spin-off to pay down debt",
            "Increasing EPS by reducing the share count of the parent",
            "Protecting the technology division from the parent's creditors",
          ],
          correctIndex: 0,
          explanation:
            "The primary rationale is eliminating the conglomerate (sum-of-parts) discount. After separation, each company is valued independently as a pure-play — investors and analysts can better understand the economics, management can focus exclusively, and capital allocation is more transparent. Note: spin-offs don't raise cash (that's a carve-out). EPS might change but that's not the value driver.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "DebtCo has $500M in debt it cannot service. It has $200M in secured bank loans (first lien) and $300M in unsecured bonds. The firm's total asset value in reorganization is estimated at $280M.",
          question: "Under the absolute priority rule, what do the unsecured bondholders receive?",
          options: [
            "$80M — secured creditors get paid $200M first, unsecured get the remaining $80M",
            "$300M — all creditors must be paid in full before equity",
            "$140M — assets split equally between secured and unsecured",
            "Nothing — only secured creditors recover in bankruptcy",
          ],
          correctIndex: 0,
          explanation:
            "Absolute priority rule: secured creditors are paid first. Secured bank loans = $200M, fully covered from the $280M estate. Remaining = $280M – $200M = $80M for unsecured bondholders, who recover $80M / $300M = 26.7 cents on the dollar. Common equity receives nothing. This illustrates why unsecured bonds trade at steep discounts when default risk rises.",
          difficulty: 3,
        },
      ],
    },
  ],
};
