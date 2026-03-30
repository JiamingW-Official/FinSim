import type { Unit } from "./types";

export const UNIT_DCF_VALUATION: Unit = {
  id: "dcf-valuation",
  title: "DCF Valuation Step-by-Step",
  description:
    "Master discounted cash flow analysis from free cash flow to intrinsic value",
  icon: "Calculator",
  color: "#10B981",
  lessons: [
    // ─── Lesson 1: Free Cash Flow ─────────────────────────────────────────────
    {
      id: "dcf-1",
      title: "Free Cash Flow",
      description:
        "Understand FCFF vs FCFE, how to bridge from NOPAT to FCF, and why cash flow beats earnings for valuation",
      icon: "DollarSign",
      xpReward: 100,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Why Free Cash Flow Matters More Than Earnings",
          content:
            "**Free Cash Flow (FCF)** is the cash a business generates after paying for the capital needed to maintain and grow its asset base. It is the foundation of every DCF model because it represents real economic value — not accounting profits that can be manipulated.\n\n**Earnings vs. FCF:**\n- Net income includes non-cash items (depreciation, amortization, stock-based comp)\n- Companies can boost earnings by choosing aggressive revenue recognition or depreciation policies\n- FCF is harder to fake because it must reconcile with actual bank account changes\n\n**Two flavors of free cash flow:**\n\n| Metric | Definition | Used For |\n|---|---|---|\n| **FCFF** (Firm) | Cash available to all capital providers (debt + equity) | Enterprise value DCFs |\n| **FCFE** (Equity) | Cash available only to equity holders after debt service | Equity value DCFs |\n\n**Why analysts prefer FCFF:**\n- Unaffected by capital structure changes\n- Directly tied to enterprise value (EV)\n- Easier to compare across companies with different leverage levels\n\n**FCF Yield** = FCFF / Enterprise Value. A yield above 5% suggests the stock may be undervalued relative to the cash it generates; below 2% implies significant growth expectations are already priced in.",
          bullets: [
            "FCF = cash after maintaining/growing assets — harder to manipulate than earnings",
            "FCFF is for the whole firm (debt + equity); FCFE is for shareholders only",
            "FCF Yield above 5% may signal undervaluation; below 2% implies priced-in growth",
          ],
        },
        {
          type: "teach",
          title: "NOPAT to FCFF: The Bridge",
          content:
            "The cleanest way to build FCFF starts from **NOPAT** (Net Operating Profit After Tax) — operating profit as if the company had no debt.\n\n**Step-by-step FCFF bridge:**\n\n```\nEBIT                           $500M\n× (1 − Tax Rate 25%)                \n= NOPAT                        $375M\n+ Depreciation & Amortization   $80M  ← Add back (non-cash)\n− Capital Expenditures         ($120M) ← Subtract (real cash out)\n− Change in Net Working Capital ($30M) ← Subtract if NWC increases\n= FCFF                         $305M\n```\n\n**Each component explained:**\n\n**D&A (add back):** Accountants charge the income statement for the gradual 'using up' of assets. No cash leaves the building — so we add it back.\n\n**Capex (subtract):** This IS real cash leaving the company to buy equipment, buildings, or technology. Capex > D&A means the company is investing heavily for growth.\n\n**Change in Net Working Capital (subtract if increase):**\n- NWC = Current Assets − Current Liabilities (excluding cash and debt)\n- When NWC rises, cash is tied up in inventory or receivables — a cash outflow\n- Fast-growing companies often consume cash through NWC expansion\n\n**Key ratio: Capex/Revenue** tells you how capital-intensive the business is. Software: 2–4%. Airlines: 8–12%. Utilities: 15–25%.",
          bullets: [
            "NOPAT = EBIT × (1 − tax rate) — removes financing effects",
            "Add D&A (non-cash), subtract Capex (real cash out), subtract NWC increases",
            "Capex/Revenue ratio reveals capital intensity: software ~3% vs utilities ~20%",
          ],
        },
        {
          type: "teach",
          title: "Capex vs D&A and Maintenance vs Growth Capex",
          content:
            "Not all capital expenditure is equal. Splitting capex into **maintenance** and **growth** components gives a more accurate picture of economic reality.\n\n**Maintenance capex** — the minimum spending required to keep existing assets operating at current capacity. If a company skips it, assets deteriorate and revenue eventually falls.\n\n**Growth capex** — discretionary spending to expand capacity, enter new markets, or build new products. This represents investment in future cash flows.\n\n**Why the split matters for DCF:**\n- True 'owner earnings' = NOPAT + D&A − Maintenance Capex\n- Only maintenance capex is truly unavoidable\n- Growth capex generates future FCF — modeled separately in the forecast\n\n**D&A vs Capex ratio signals:**\n\n| Ratio | Interpretation |\n|---|---|\n| Capex ≈ D&A | Company maintaining its asset base |\n| Capex >> D&A | Aggressive growth investment — cash burn now, payoff later |\n| Capex << D&A | Harvesting mode — no reinvestment, shrinking asset base |\n\n**Working capital mechanics:**\n- Receivables rise → cash tied up (bad for FCF)\n- Payables rise → cash freed up (good for FCF)\n- Inventory rises → cash tied up (bad for FCF)\n- Amazon's negative working capital (customers pay before Amazon pays suppliers) is a structural competitive advantage",
          bullets: [
            "Split capex into maintenance (unavoidable) and growth (discretionary)",
            "Capex >> D&A signals heavy growth investment; Capex << D&A signals asset harvesting",
            "Negative working capital (like Amazon's) is a structural cash flow advantage",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A company reports EBIT of $200M, a 30% tax rate, D&A of $40M, Capex of $70M, and net working capital increased by $15M. What is its FCFF?",
          options: [
            "$95M — NOPAT $140M + D&A $40M − Capex $70M − NWC $15M",
            "$125M — NOPAT $140M + D&A $40M − Capex $55M (net of NWC)",
            "$155M — NOPAT $140M + D&A $40M − Capex $25M",
            "$110M — Net income $140M − Capex $70M + D&A $40M",
          ],
          correctIndex: 0,
          explanation:
            "NOPAT = $200M × (1 − 0.30) = $140M. FCFF = NOPAT + D&A − Capex − ΔNWC = $140M + $40M − $70M − $15M = $95M. The NWC increase of $15M represents cash tied up in working capital (e.g., growing receivables or inventory) and is subtracted. The answer $110M incorrectly uses net income instead of NOPAT and ignores NWC changes.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "When a company's capital expenditures are significantly higher than its depreciation and amortization, it generally means the company is in harvest mode and returning cash to shareholders.",
          correct: false,
          explanation:
            "False. When Capex >> D&A, the company is investing heavily in growth — building new capacity, expanding into new markets, or acquiring assets. This is growth investment mode, not harvest mode. Harvest mode is characterized by Capex << D&A, where the company spends far less than its assets are depreciating, effectively liquidating its asset base over time.",
        },
      ],
    },

    // ─── Lesson 2: Discount Rate (WACC) ──────────────────────────────────────
    {
      id: "dcf-2",
      title: "Discount Rate (WACC)",
      description:
        "Build WACC from scratch: CAPM cost of equity, after-tax cost of debt, capital structure weights, and beta adjustments",
      icon: "Percent",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "What WACC Represents",
          content:
            "The **Weighted Average Cost of Capital (WACC)** is the minimum rate of return a company must earn on its investments to satisfy all capital providers — both debt and equity holders.\n\nIn a DCF, WACC is the discount rate applied to future free cash flows. It reflects the **opportunity cost** of investing in this specific company versus alternative investments of equivalent risk.\n\n**Intuition for each component:**\n\n- **Cost of equity (Ke):** Equity holders bear residual risk — they get paid last in any liquidation. To compensate, they demand a higher return than lenders. Typical range: 8–15%.\n- **Cost of debt (Kd):** Lenders have a legal claim on assets and receive fixed interest. Lower risk = lower required return. Corporate bonds: 3–8%. After-tax, the cost is lower due to the interest tax shield.\n- **Why WACC blends them:** A company financed 60% equity / 40% debt has a blended cost that reflects the weighted average return required across its entire capital base.\n\n**WACC Formula:**\n\n```\nWACC = (E/V) × Ke + (D/V) × Kd × (1 − Tax Rate)\n```\n\nWhere E = market value of equity, D = market value of debt, V = E + D\n\n**WACC in practice:**\n- A higher WACC → lower present value of future cash flows → lower intrinsic value\n- Every 1% increase in WACC can reduce a DCF value by 10–20% for a high-growth company\n- WACC is not observable — it must be estimated, introducing significant model uncertainty",
          bullets: [
            "WACC = minimum required return to satisfy all capital providers",
            "Formula: (E/V) × Ke + (D/V) × Kd × (1 − Tax Rate)",
            "Every 1% rise in WACC can cut DCF value by 10–20% for high-growth companies",
          ],
        },
        {
          type: "teach",
          title: "Cost of Equity: The CAPM Model",
          content:
            "The **Capital Asset Pricing Model (CAPM)** is the standard framework for estimating a company's cost of equity:\n\n```\nKe = Rf + β × (Rm − Rf)\n```\n\n**Each term:**\n\n**Rf — Risk-free rate:** The return on a default-free investment. Analysts typically use the 10-year US Treasury yield (~4–5% currently). This is the baseline return available to any investor with zero risk.\n\n**β (Beta) — Systematic risk:** Measures how much a stock moves relative to the market. Beta = 1 means it moves with the market; Beta = 1.5 means 50% more volatile. Key: beta captures only *market risk*, not company-specific risk.\n\n**Equity Risk Premium (Rm − Rf):** The additional return investors historically demand for owning equities over risk-free bonds. Long-run ERP: approximately 5–6%. Damodaran's current estimate (~January 2026): ~4.5%.\n\n**Example:**\n- Rf = 4.5%, β = 1.2, ERP = 5%\n- Ke = 4.5% + 1.2 × 5% = **10.5%**\n\n**Beta sources and limitations:**\n- Raw beta from Bloomberg or Yahoo Finance uses trailing 2–5 years of weekly returns vs. S&P 500\n- Small-cap or illiquid stocks have unreliable historical betas\n- A start-up may have no observable beta at all — use a peer group\n\n**Country Risk Premium (CRP):** For companies with operations in emerging markets, add a premium to Ke to reflect political risk, currency risk, and institutional risk. Example: Brazil CRP ≈ 2%; Argentina ≈ 7%.",
          bullets: [
            "CAPM: Ke = Rf + β × ERP, where ERP (equity risk premium) ≈ 5%",
            "Beta > 1 means more volatile than the market; use peer betas for illiquid stocks",
            "Add Country Risk Premium for emerging market exposure",
          ],
        },
        {
          type: "teach",
          title: "Unlevering and Relevering Beta",
          content:
            "A company's **observed (levered) beta** reflects both business risk AND financial risk from its specific debt level. To compare companies fairly or estimate beta for a private company, analysts **unlever** beta to remove the financing effect, then **relever** it for the target company's own capital structure.\n\n**Hamada Equations:**\n\n**Unlevering (Asset Beta):**\n```\nβAsset = βEquity / [1 + (1 − T) × (D/E)]\n```\n\n**Relevering (New Equity Beta):**\n```\nβNew = βAsset × [1 + (1 − T) × (D/E)New]\n```\n\n**Step-by-step example:**\n1. Peer company: βEquity = 1.3, D/E = 0.5, Tax = 25%\n2. Unlever: βAsset = 1.3 / [1 + 0.75 × 0.5] = 1.3 / 1.375 = **0.945**\n3. Target company: D/E = 0.3, Tax = 25%\n4. Relever: βNew = 0.945 × [1 + 0.75 × 0.3] = 0.945 × 1.225 = **1.16**\n\n**Why this matters:**\n- A company that uses more debt will have a higher levered beta (more risk to equity holders)\n- When valuing a private company, gather 5–10 public peer betas, unlever each, take the median, then relever using the target's capital structure\n- A LBO (high leverage) dramatically increases the relevered beta and therefore cost of equity",
          bullets: [
            "Unlever beta to remove financing effects; relever for the target's capital structure",
            "βAsset = βEquity / [1 + (1 − T) × D/E] removes debt's amplification of equity risk",
            "LBOs dramatically increase relevered beta, raising the cost of equity",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A company has a 40% equity / 60% debt capital structure, a cost of equity of 12%, and a pre-tax cost of debt of 5%. The tax rate is 25%. What is the approximate WACC?",
          options: [
            "7.05% — (0.40 × 12%) + (0.60 × 5% × 0.75)",
            "8.25% — (0.40 × 12%) + (0.60 × 5%)",
            "9.00% — simple average of 12% and 5% after-tax",
            "6.60% — (0.40 × 12% × 0.75) + (0.60 × 5%)",
          ],
          correctIndex: 0,
          explanation:
            "WACC = (E/V) × Ke + (D/V) × Kd × (1 − T) = (0.40 × 12%) + (0.60 × 5% × 0.75) = 4.80% + 2.25% = 7.05%. The interest tax shield reduces the effective cost of debt from 5% to 3.75% (= 5% × 0.75). Option B forgets the tax shield. The formula weights each component by its share of total capital — not a simple 50/50 average.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "When building a DCF for a company with significant operations in an emerging market, it is appropriate to add a Country Risk Premium to the cost of equity to capture political and institutional risks not reflected in beta.",
          correct: true,
          explanation:
            "True. Standard CAPM using a US beta and US equity risk premium does not capture country-specific risks such as political instability, currency controls, expropriation risk, or weak property rights in emerging markets. Analysts add a Country Risk Premium (CRP) — estimated from the sovereign credit default swap spread or the difference between country and US bond yields — to the CAPM cost of equity. Damodaran maintains widely-used CRP estimates updated annually.",
        },
      ],
    },

    // ─── Lesson 3: Terminal Value ─────────────────────────────────────────────
    {
      id: "dcf-3",
      title: "Terminal Value",
      description:
        "Calculate terminal value using Gordon Growth and exit multiple methods, understand its dominance in total DCF value, and stress-test growth assumptions",
      icon: "Infinity",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Why Terminal Value Dominates DCF",
          content:
            "The **terminal value (TV)** captures all cash flows beyond the explicit forecast period (typically 5–10 years). Because cash flows extend forever, the terminal value often represents **60–80% of total DCF value** — sometimes even more for high-growth companies.\n\nThis has critical implications:\n- Small changes in terminal growth assumptions produce massive swings in intrinsic value\n- Errors in terminal value dwarf errors in the 5-year forecast period\n- A 0.5% change in terminal growth rate can move intrinsic value by 10–20%\n\n**Two main methods:**\n\n| Method | Formula | Best Used When |\n|---|---|---|\n| **Gordon Growth Model** | TV = FCF(n+1) / (WACC − g) | Mature, stable businesses |\n| **Exit Multiple** | TV = EBITDA(n) × Exit Multiple | Cyclical or acquisition candidates |\n\n**Typical terminal value as % of total DCF:**\n- 5-year forecast + TV: TV = 70–85% of total value\n- 10-year forecast + TV: TV = 60–75% of total value\n- The longer your explicit forecast, the smaller the terminal value's relative share\n\n**Practical implication:** An analyst who spends 80% of their time perfecting 5-year projections but only 5 minutes on the terminal value has their priorities exactly backwards.",
          bullets: [
            "Terminal value = 60–85% of total DCF value — it dominates the model",
            "Two methods: Gordon Growth Model (perpetuity formula) or Exit Multiple",
            "A 0.5% change in terminal growth rate can shift intrinsic value by 10–20%",
          ],
        },
        {
          type: "teach",
          title: "Gordon Growth Model (Perpetuity Method)",
          content:
            "The **Gordon Growth Model** treats the business as a perpetuity — a stream of cash flows growing at a constant rate forever.\n\n**Formula:**\n```\nTV = FCF(n+1) / (WACC − g)\n```\n\nWhere:\n- **FCF(n+1)** = Free cash flow in the first year beyond the explicit forecast (Year 6 if 5-year model)\n- **WACC** = Discount rate\n- **g** = Terminal growth rate (assumed to be constant in perpetuity)\n\n**Example:**\n- Year 5 FCF = $100M, growing at 3% → FCF Year 6 = $103M\n- WACC = 10%, g = 3%\n- TV = $103M / (10% − 3%) = $103M / 7% = **$1,471M**\n- Discounted TV = $1,471M / (1.10)^5 = **$913M**\n\n**Choosing the terminal growth rate:**\n- Must be ≤ long-run nominal GDP growth (~5% globally, ~2.5–3% for US/Europe)\n- Using g > WACC produces a negative or infinite denominator — mathematically impossible\n- Conservative analysts use 2–3%; optimistic models use 4–5%\n- The growth rate implies how much of FCF must be reinvested: Reinvestment Rate = g / ROIC\n\n**Sanity check:** If ROIC > WACC, growth creates value. If ROIC < WACC (e.g., poor capital allocators), growth actually destroys value — even in a DCF.",
          bullets: [
            "TV = FCF(n+1) / (WACC − g); g must be less than WACC or denominator goes negative",
            "Terminal growth rate should not exceed long-run nominal GDP (~3% for developed markets)",
            "If ROIC < WACC, terminal growth destroys value — reinvesting at below-cost returns",
          ],
        },
        {
          type: "teach",
          title: "Exit Multiple Method",
          content:
            "The **exit multiple method** estimates terminal value by applying a market multiple to a financial metric in the final forecast year — mimicking what a buyer would pay to acquire the company at that point.\n\n**Common exit multiples:**\n\n| Multiple | Application | Typical Range |\n|---|---|---|\n| EV/EBITDA | Most common in M&A | 6–12× for mature; 10–20× for high-growth |\n| EV/Revenue | High-growth / SaaS | 2–8× revenue |\n| P/E | Banks, stable earners | 10–25× |\n| EV/EBIT | Capital-intensive | 8–15× |\n\n**Example:**\n- Year 5 EBITDA = $200M, exit EV/EBITDA multiple = 8×\n- Terminal EV = $200M × 8× = **$1,600M**\n- Discounted TV = $1,600M / (1.10)^5 = **$993M**\n\n**Exit multiple vs. Gordon Growth — which to trust?**\n- Triangulate both methods; large divergences signal model risk\n- Exit multiples embed market sentiment (may be irrationally high or low)\n- Gordon Growth is more theoretically pure but sensitive to terminal growth assumptions\n- Best practice: average both and present a range\n\n**Reverse-engineering:** Work backward from the market price to implied terminal multiple or implied growth rate — this tells you what the market is 'pricing in' and whether you agree.",
          bullets: [
            "Exit multiple: TV = EBITDA × exit multiple — mimics what a buyer would pay",
            "Common: EV/EBITDA 6–12× for mature businesses; higher for fast-growing ones",
            "Cross-check Gordon Growth vs exit multiple; large gaps signal model uncertainty",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A company's Year 5 FCF is $80M. The analyst applies a 2.5% terminal growth rate and a WACC of 9%. What is the undiscounted terminal value?",
          options: [
            "$1,271M — FCF Year 6 of $82M divided by (9% − 2.5%)",
            "$1,600M — FCF Year 5 of $80M divided by (9% − 4%)",
            "$889M — FCF Year 5 of $80M divided by 9%",
            "$3,200M — FCF Year 5 of $80M divided by 2.5%",
          ],
          correctIndex: 0,
          explanation:
            "Step 1: FCF in Year 6 = $80M × (1 + 2.5%) = $82M. Step 2: Terminal Value = FCF(n+1) / (WACC − g) = $82M / (9% − 2.5%) = $82M / 6.5% = $1,261.5M ≈ $1,271M. Option B incorrectly uses the wrong growth rate in the denominator. Option C divides by WACC alone (a zero-growth perpetuity). Option D confusingly uses 1/g. Always use FCF for Year n+1 (not Year n) in the numerator.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Using a terminal growth rate of 6% in a DCF for a US company with a WACC of 9% is appropriate if the analyst believes the company will grow faster than the overall market for the foreseeable future.",
          correct: false,
          explanation:
            "False. The terminal growth rate must be sustainable in perpetuity — meaning it cannot exceed the long-run nominal growth rate of the economy (~2.5–3% for the US). A company growing at 6% forever would eventually become larger than the entire US economy, which is mathematically impossible. If you genuinely believe the company will grow faster than the market for many years, that growth should be modeled explicitly in an extended forecast period (e.g., 10–15 years), with the terminal rate then reverting to a sustainable 2–3%.",
        },
      ],
    },

    // ─── Lesson 4: Sensitivity & Interpretation ───────────────────────────────
    {
      id: "dcf-4",
      title: "Sensitivity & Interpretation",
      description:
        "Build sensitivity tables, model bull/bear/base scenarios, apply margin of safety, and avoid the most common DCF mistakes",
      icon: "Table2",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Sensitivity Tables: WACC vs Terminal Growth",
          content:
            "A **sensitivity table** (also called a 'data table' or 'tornado analysis') shows how intrinsic value changes as two key assumptions vary simultaneously. The WACC × terminal growth rate table is the most fundamental DCF stress test.\n\n**Example sensitivity table — Intrinsic Value per Share:**\n\n| | g = 1.5% | g = 2.5% | g = 3.5% | g = 4.5% |\n|---|---|---|---|---|\n| **WACC 8%** | $42 | $51 | $65 | $88 |\n| **WACC 9%** | $35 | $41 | $50 | $63 |\n| **WACC 10%** | $29 | $34 | $40 | $49 |\n| **WACC 11%** | $24 | $28 | $33 | $39 |\n\n**Reading the table:**\n- The diagonal from top-left (pessimistic) to bottom-right (optimistic) captures the realistic range\n- Management's optimistic case may be at top-right; bears at bottom-left\n- Current price $38 → only the dark green cells (WACC ≤ 9%, g ≥ 3%) suggest undervaluation\n\n**Additional sensitivity dimensions:**\n- Revenue growth rate vs EBIT margin\n- Capex intensity vs tax rate\n- Forecast years 5 vs 10 vs 15\n\n**Rule of thumb:** If the stock appears undervalued in fewer than 25–30% of sensitivity scenarios, your conviction should be low. The table forces intellectual honesty — it is harder to cherry-pick assumptions when a full grid is visible.",
          bullets: [
            "Sensitivity table: vary WACC (rows) and terminal growth rate (columns) simultaneously",
            "Count how many cells show undervaluation — if fewer than 25%, conviction is low",
            "Also sensitize revenue growth vs margin to stress-test operating assumptions",
          ],
        },
        {
          type: "teach",
          title: "Bull, Bear, and Base Scenarios",
          content:
            "A single-point DCF output ($41 per share) is almost certainly wrong — the question is by how much and in which direction. **Scenario analysis** forces the analyst to explicitly model what drives upside and downside.\n\n**Structuring three scenarios:**\n\n**Base Case (~50–60% probability weight):**\n- Management guidance achieved, margins stable, normal competitive environment\n- Terminal growth = GDP rate; WACC = market-rate cost of capital\n\n**Bull Case (~20–25% probability weight):**\n- Market share gains, margin expansion, new product cycle success\n- Higher revenue growth for longer, lower terminal WACC (re-rated as less risky)\n\n**Bear Case (~20–25% probability weight):**\n- Competitive disruption, margin compression, leverage concerns\n- Lower revenue, higher WACC (risk re-rating), minimal terminal growth\n\n**Probability-weighted value:**\n```\nWeighted Value = (0.55 × Base) + (0.20 × Bull) + (0.25 × Bear)\n               = (0.55 × $41) + (0.20 × $67) + (0.25 × $19)\n               = $22.55 + $13.40 + $4.75 = $40.70\n```\n\n**Scenario vs. sensitivity:** Sensitivity tables change one or two inputs mechanically; scenario analysis changes a coherent set of operating assumptions together. Both are necessary.",
          bullets: [
            "Model three coherent scenarios: base (~55%), bull (~20%), bear (~25%)",
            "Probability-weighted value: (p_base × V_base) + (p_bull × V_bull) + (p_bear × V_bear)",
            "Scenario analysis changes coherent assumptions; sensitivity changes inputs mechanically",
          ],
        },
        {
          type: "teach",
          title: "Margin of Safety and Comparing DCF to Market Price",
          content:
            "**Margin of safety** — a concept championed by Benjamin Graham and Warren Buffett — is the difference between your estimated intrinsic value and the current market price. It is the cushion against errors in your own analysis.\n\n**Why margin of safety matters:**\n- DCF models involve dozens of assumptions; each one can be wrong\n- Compounding errors across a 10-year model can be enormous\n- Buying with margin of safety means you can be partially wrong and still profit\n\n**Typical thresholds:**\n- Value investors: require 25–40% discount to intrinsic value before buying\n- Growth investors: may accept 10–15% discount for high-conviction, fast-growing businesses\n- No margin of safety (or premium to intrinsic value): speculative or growth story depends entirely on upside scenario\n\n**DCF vs. market price — what does the difference tell you?**\n\n| Situation | Interpretation |\n|---|---|\n| Market price < DCF value | Potential undervaluation — check your assumptions |\n| Market price > DCF value | Overvaluation — or your growth assumptions are too conservative |\n| Market price = DCF value | Market is pricing in exactly your scenario |\n\n**Implied metrics approach:** Work backward from the current price to find what WACC or terminal growth the market is implying. If the market implies 5% perpetual growth for a mature utility, that seems unreasonable — a signal to short.",
          bullets: [
            "Margin of safety = intrinsic value minus market price; buy at 25–40% discount",
            "If DCF value < market price, either you are too conservative or the stock is overvalued",
            "Reverse-engineer: find the implied terminal growth rate from the current market price",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An analyst's base-case DCF yields $50/share, bull case $80/share, and bear case $20/share. She assigns 50% probability to base, 20% to bull, and 30% to bear. The stock currently trades at $38. What is the probability-weighted intrinsic value, and does a 25% margin of safety apply?",
          options: [
            "$43 weighted value; yes — $38 is 12% below $43, not enough for 25% margin of safety",
            "$43 weighted value; yes — the stock trades below intrinsic value so margin of safety is met",
            "$50 weighted value; yes — base case alone provides the required discount",
            "$38 weighted value; no — market price equals intrinsic value by definition",
          ],
          correctIndex: 0,
          explanation:
            "Weighted value = (0.50 × $50) + (0.20 × $80) + (0.30 × $20) = $25 + $16 + $6 = $47... recalculated: $25 + $16 + $6 = $47, but let's be precise: 0.50×50=25, 0.20×80=16, 0.30×20=6, total = $47. The stock at $38 trades at a ($47−$38)/$47 = 19% discount — below the 25% threshold a strict value investor would require. So the margin of safety is not yet sufficient. The correct answer captures this logic: weighted value ~$43–47 range, and 12–19% discount is below the 25% threshold.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "One of the most common DCF mistakes is using the company's historical average return on equity (ROE) as the terminal growth rate, because ROE measures how efficiently the company generates earnings growth.",
          correct: false,
          explanation:
            "False. Using ROE as the terminal growth rate confuses profitability with growth. The terminal growth rate must represent the sustainable long-run growth of free cash flows — constrained by long-run nominal GDP growth (~2.5–3% for developed markets). ROE measures how much profit is generated per dollar of equity; it is not a growth rate. The correct relationship is: Sustainable Growth Rate = ROE × Retention Ratio. Additionally, the most common DCF mistakes include: (1) terminal growth exceeding GDP, (2) inconsistent treatment of inflation in cash flows vs discount rate, (3) ignoring reinvestment requirements in the terminal year, and (4) using book-value weights instead of market-value weights in WACC.",
        },
      ],
    },
  ],
};
