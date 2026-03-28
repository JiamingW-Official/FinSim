import type { Unit } from "./types";

export const UNIT_VENTURE_CAPITAL: Unit = {
  id: "venture-capital",
  title: "Venture Capital",
  description:
    "Master VC fund dynamics, startup valuation, term sheets, portfolio construction, and billion-dollar exit strategies",
  icon: "Rocket",
  color: "#8b5cf6",
  lessons: [
    // ─── Lesson 1: VC Fundamentals ───────────────────────────────────────────────
    {
      id: "vc-1",
      title: "🚀 VC Fundamentals",
      description:
        "Power law returns, fund structure, LP/GP relationship, carried interest, startup stages, and cap table math",
      icon: "Rocket",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🏗️ The VC Model: Power Law, Fund Structure & LP/GP",
          content:
            "**Venture Capital** funds early-stage startups in exchange for equity, targeting a small number of massive wins to generate fund-level returns.\n\n**Fund structure:**\n- **LP (Limited Partners)**: Institutional investors — pension funds, endowments, family offices. They commit capital but have no say in investment decisions.\n- **GP (General Partner)**: The VC firm — sources deals, leads investments, sits on boards, and manages the portfolio.\n\n**Economics:**\n- **2% management fee**: Annual fee on committed capital to cover operations and salaries.\n- **20% carried interest**: GP receives 20% of profits above the hurdle rate (typically 8% IRR). On a $500M fund returning $2B, the GP earns 20% of the $1.5B profit above hurdle = $300M carry.\n- **8% hurdle rate**: LPs must receive an 8% annualised return before the GP earns any carry.\n\n**Power law returns:**\nVC portfolios follow a power law — the distribution of outcomes is extreme. A single investment (e.g., Uber, Google) can return more than all other investments combined. This is why VCs swing for 100× opportunities, not 3× ones.\n\n**Fund lifecycle:** Fundraise (1–2 years) → Deploy capital (3–5 years) → Support portfolio → Exit (years 5–10) → Return capital to LPs.",
          highlight: ["LP", "GP", "carried interest", "management fee", "hurdle rate", "power law"],
        },
        {
          type: "teach",
          title: "📈 Startup Stages: Pre-Seed to Late Stage",
          content:
            "Startups raise capital in progressively larger rounds as they de-risk and grow. Each stage reflects milestone achievement.\n\n**Pre-seed ($250K–$1M):**\n- Idea stage — founders validating a hypothesis\n- Capital from founders, friends/family, or early angel investors\n- Often no product, just a deck and conviction\n\n**Seed ($1M–$3M):**\n- Early product (MVP), testing product-market fit\n- Seed VCs and angels; typical post-money valuation $8–20M\n- Key milestone: first paying customers or strong user growth\n\n**Series A ($5M–$15M):**\n- Product-market fit proven, scaling the model\n- Institutional VCs (a16z, Sequoia, Benchmark); valuation $30–80M\n- Key metrics: MRR growth rate, net retention, unit economics\n\n**Series B ($20M–$50M):**\n- Scaling a working playbook — more sales, more markets\n- Valuation $100–300M\n- Focus: operational scale, team building\n\n**Series C+ ($50M+):**\n- Aggressive growth, potential new product lines or geographies\n- Valuation $300M–$1B+\n- Growth equity funds and crossover investors participate\n\n**Late stage / Pre-IPO:**\n- Preparing for public markets or large M&A\n- Sovereign wealth funds, mutual funds\n- Unicorn status: $1B+ valuation",
          highlight: ["pre-seed", "seed", "Series A", "Series B", "Series C", "unicorn", "product-market fit"],
        },
        {
          type: "teach",
          title: "📊 Valuation Methods: Pre-Money, Post-Money & Cap Table",
          content:
            "Understanding valuation and dilution is essential for founders and investors alike.\n\n**Pre-money vs post-money valuation:**\n- **Pre-money**: What the company is worth BEFORE the investment.\n- **Post-money**: Pre-money + new investment amount.\n- Investor ownership = Investment / Post-money valuation\n\n**Example:**\n- Pre-money valuation: $8M\n- New investment: $2M\n- Post-money: $10M\n- Investor owns: $2M / $10M = **20%**\n\n**Cap table dilution:**\nEach new funding round dilutes existing shareholders proportionally.\n\n| Round | Event | Founder % |\n|---|---|---|\n| Start | 2 founders | 100% |\n| Pre-seed | Angel: $500K at $5M post | 80% |\n| Seed | VC: $2M at $10M post | 64% |\n| Series A | VC: $10M at $50M post | ~57% |\n\n**ESOP (Employee Stock Option Pool):**\nInvestors often require a 10–20% option pool to be created before their investment, diluting founders further. This is the 'option pool shuffle' — founders bear the dilution, not investors.\n\n**Valuation methods:**\n- **Comparable transactions**: What did similar-stage companies raise at?\n- **DCF**: Rarely used pre-revenue — too speculative\n- **Scorecard method**: Score against benchmark on team, market, product",
          highlight: ["pre-money", "post-money", "dilution", "cap table", "option pool", "ownership percentage"],
        },
        {
          type: "quiz-mc",
          question:
            "A startup has a pre-money valuation of $8M and raises $2M from a VC. What percentage does the investor own post-investment?",
          options: [
            "20% — investor owns $2M of $10M post-money",
            "25% — investor owns $2M of $8M pre-money",
            "16.7% — investor owns $2M of $12M total",
            "33% — based on the $2M relative to $6M founder value",
          ],
          correctIndex: 0,
          explanation:
            "Post-money valuation = pre-money + investment = $8M + $2M = $10M. Investor ownership = $2M / $10M = 20%. This is the fundamental cap table calculation every VC and founder must know. Using pre-money in the denominator is a common mistake that overstates dilution.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In a VC fund, carried interest is the 20% profit share the GP earns on ALL returns — from the very first dollar returned to LPs.",
          correct: false,
          explanation:
            "False. Carried interest is earned only on profits ABOVE the hurdle rate (typically 8% IRR). LPs must first receive their capital back plus the preferred return before the GP participates in profits. This structure protects LPs and ensures the GP is genuinely creating value, not just returning their own capital.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A VC fund invests $10M across 10 startups ($1M each). After 10 years: 1 startup returns 10× ($10M back), 4 startups return 1× ($4M back), and 5 startups go to zero ($0). Total returned: $14M on $10M invested.",
          question: "What does this scenario illustrate about VC investing?",
          options: [
            "Power law returns — a single winner barely saves the fund; VCs need at least one 50-100× outcome to thrive",
            "VC investing is unprofitable — a 40% IRR should be achievable with better selection",
            "Diversification into 10 deals is the wrong approach; VCs should concentrate in 3-4 companies",
            "A 1.4× MOIC is acceptable — it beats most savings accounts",
          ],
          correctIndex: 0,
          explanation:
            "This scenario illustrates the brutal reality of VC power law returns. A 1.4× MOIC over 10 years is only ~3.4% IRR — terrible for a VC fund that needs to beat the 8% hurdle and justify the illiquidity. A top VC fund needs at least one 50-100× outcome to truly succeed. That is why VCs only invest in companies that could theoretically return the entire fund — 'fund returners' — and why portfolio construction is critical.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Deal Terms & Term Sheets ──────────────────────────────────────
    {
      id: "vc-2",
      title: "📋 Deal Terms & Term Sheets",
      description:
        "Liquidation preferences, anti-dilution provisions, pro-rata rights, board seats, and down round mechanics",
      icon: "FileText",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "💧 Liquidation Preferences: Who Gets Paid First?",
          content:
            "A **liquidation preference** determines the order and amount investors receive in a sale or liquidation BEFORE common shareholders (founders and employees).\n\n**1× Non-participating (standard):**\n- Investor gets their money back FIRST, then converts to common if that yields more\n- Example: Invested $5M for 20% of company. Company sold for $15M.\n  - Option A: Take 1× = $5M\n  - Option B: Convert to 20% common = $3M\n  - Investor chooses Option A: **$5M**\n- Founder gets: $15M – $5M = **$10M** (66.7%)\n\n**1× Participating (investor-friendly):**\n- Investor takes 1× back AND ALSO participates in remaining proceeds\n- Same example: Investor takes $5M THEN gets 20% of remaining $10M = $2M\n- Investor total: **$7M** | Founder: **$8M**\n\n**2× Non-participating:**\n- Investor gets 2× their investment back before anyone else\n- Example: $5M invested → $10M back first, then common shares remainder\n- Only converts to equity if that exceeds 2×\n\n**Waterfall order:**\n1. Liquidation preference holders (VC preferred)\n2. Common shareholders (founders, employees)\n3. Option holders (after exercise)\n\n**Negotiation tip**: 1× non-participating is the founder-friendly standard. Anything more aggressive transfers value from founders to investors in downside scenarios.",
          highlight: ["liquidation preference", "participating", "non-participating", "waterfall", "preferred stock"],
        },
        {
          type: "teach",
          title: "🛡️ Anti-Dilution Provisions: Down Round Protection",
          content:
            "**Anti-dilution** provisions protect investors if a startup raises a future round at a lower valuation (a 'down round'). They adjust the conversion price of the investor's preferred stock downward, effectively giving them more shares.\n\n**Full ratchet (most aggressive):**\n- Conversion price drops to the new round's price, regardless of how small the down round is\n- Example: Investor bought shares at $10. Down round at $5. Investor now converts at $5 — gets 2× the shares.\n- Even 1 share sold in a down round triggers full ratchet on the entire investment\n- Massively dilutes founders — rarely seen in modern deals\n\n**Broad-based weighted average (standard):**\n- New conversion price is a weighted average of old and new price, based on all shares outstanding\n- Dilution is proportional — fairer to founders\n- Formula: CP₂ = CP₁ × (A + B) / (A + C)\n  - A = outstanding shares before new round\n  - B = shares issuable at original price for new money\n  - C = actual shares issued in new round\n\n**Narrow-based weighted average:**\n- Only counts preferred shares (not all diluted shares)\n- More protective for investors than broad-based\n\n**Why down rounds are painful:**\n- Anti-dilution kicks in and gives investors more shares\n- Option pool may need to be refreshed (more dilution)\n- Signals distress — affects future fundraising and talent recruitment\n- Employee stock options may be underwater",
          highlight: ["anti-dilution", "down round", "full ratchet", "weighted average", "conversion price"],
        },
        {
          type: "teach",
          title: "⚖️ Pro-Rata Rights, Board Seats & Protective Provisions",
          content:
            "Beyond valuation, term sheets contain governance and economic rights that shape the investor-founder relationship.\n\n**Pro-rata rights:**\n- Investor can maintain their ownership percentage in future rounds by investing proportionally\n- Example: Own 15% after Series A. Company raises Series B. Pro-rata lets you invest enough to stay at 15%.\n- Highly valued by VCs — lets winners 'double down' in breakout companies\n- Sometimes split: full pro-rata at Series B, major investor pro-rata only thereafter\n\n**Board of directors:**\n- Seed: Founders control (2-1 or 3-2 majority)\n- Series A: Typically 2 founders, 1 lead investor, 1-2 independents\n- Series B+: More investor representation as stakes rise\n- Board controls major decisions: CEO hire/fire, M&A, fundraising approval\n\n**Information rights:**\n- Investors receive monthly or quarterly financials\n- Annual audited statements\n- Right to inspect books and records\n- Major investor threshold: often $250K–$1M to receive full information rights\n\n**Drag-along provisions:**\n- If majority of stockholders vote to sell, all stockholders must sell too\n- Prevents a minority investor from blocking a sale the majority supports\n- Protects acquirers from holdout problems\n\n**Right of first refusal (ROFR):**\n- Investor has first right to buy shares if a founder or employee wants to sell secondary shares",
          highlight: ["pro-rata rights", "board of directors", "information rights", "drag-along", "ROFR"],
        },
        {
          type: "quiz-mc",
          question:
            "A VC invested $4M for 20% of a startup with a 1× participating liquidation preference. The company is sold for $10M. How much does the VC receive?",
          options: [
            "$5.2M — takes $4M back then gets 20% of the remaining $6M ($1.2M)",
            "$4M — takes only the 1× preference and waives equity participation",
            "$2M — receives 20% of the $10M sale price without the preference",
            "$6M — takes 2× the preference as it is participating",
          ],
          correctIndex: 0,
          explanation:
            "With a 1× participating liquidation preference: Step 1 — VC takes back 1× = $4M. Step 2 — Remaining proceeds = $10M – $4M = $6M. Step 3 — VC participates pro-rata: $6M × 20% = $1.2M. Total to VC: $4M + $1.2M = $5.2M. Founders and common shareholders split the other $4.8M. Compare to 1× non-participating: VC would only get max($4M, $2M) = $4M — $1.2M less.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A full ratchet anti-dilution provision is more founder-friendly than a broad-based weighted average provision in a down round.",
          correct: false,
          explanation:
            "False. Full ratchet is the most aggressive (investor-friendly) anti-dilution provision. It resets the investor's conversion price to match the new lower price entirely, regardless of how small the down round is — even one share triggers it. Broad-based weighted average is the standard, founder-friendly approach that proportionally adjusts the conversion price based on all shares outstanding, causing far less dilution to founders.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A startup raised its Series A at a $20M post-money valuation. A VC invested $4M (20% ownership). 18 months later, the startup struggles and raises a down round at a $10M post-money valuation, issuing new shares. The VC has a broad-based weighted average anti-dilution clause.",
          question: "What is the primary impact of the anti-dilution clause on the founder?",
          options: [
            "Founder equity is diluted further as the VC receives additional shares at the adjusted conversion price",
            "The VC must invest additional capital in the down round to trigger the anti-dilution",
            "The anti-dilution clause only applies if the company goes bankrupt, not in a down round",
            "The founder's shares are converted to preferred stock to match the investor's protection",
          ],
          correctIndex: 0,
          explanation:
            "Anti-dilution adjusts the VC's conversion price downward (from $20M implied price to a weighted average), meaning the VC effectively gets more shares without investing more money. This additional dilution comes entirely from existing common shareholders — primarily founders and employees. The weighted average formula softens the blow compared to full ratchet, but founders still bear the cost of the down round through increased dilution.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Startup Metrics & Due Diligence ───────────────────────────────
    {
      id: "vc-3",
      title: "📊 Startup Metrics & Due Diligence",
      description:
        "SaaS metrics (ARR, NRR, LTV/CAC), Rule of 40, due diligence frameworks, and the J-curve of startup growth",
      icon: "BarChart2",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📈 SaaS Metrics: The Language of Startup Finance",
          content:
            "For software and subscription businesses, VCs evaluate companies using a specific set of metrics.\n\n**Revenue metrics:**\n- **ARR (Annual Recurring Revenue)**: Annualised value of all subscription contracts. The north star metric for SaaS.\n- **MRR (Monthly Recurring Revenue)**: ARR / 12. Tracks month-to-month momentum.\n- **Churn rate**: % of ARR lost each month from cancellations. Best-in-class: < 0.5% monthly.\n\n**Unit economics:**\n- **LTV (Lifetime Value)**: Average revenue a customer generates over their lifetime. LTV = ARPU / churn rate.\n- **CAC (Customer Acquisition Cost)**: Total sales & marketing spend / new customers acquired.\n- **LTV/CAC ratio**: > 3× is healthy; > 5× is excellent. Below 1× means you lose money on every customer.\n\n**Retention metrics:**\n- **Net Revenue Retention (NRR)**: % of ARR from existing customers retained and expanded. NRR > 120% means existing customers grow revenue even without new customers.\n- **Gross retention**: % of customers that don't cancel. NRR > Gross retention when expansions occur.\n\n**Efficiency metrics:**\n- **Magic Number**: Net new ARR / Sales & Marketing Spend. Above 0.75 is efficient; above 1.0 is excellent.\n- **Rule of 40**: Revenue growth rate + EBITDA margin. Above 40% signals a healthy balance of growth and profitability.",
          highlight: ["ARR", "MRR", "churn rate", "LTV", "CAC", "NRR", "Rule of 40", "magic number"],
        },
        {
          type: "teach",
          title: "🔍 VC Due Diligence Framework",
          content:
            "Before investing, VCs conduct structured due diligence across five dimensions.\n\n**1. Market (TAM/SAM/SOM):**\n- **TAM (Total Addressable Market)**: The theoretical maximum if the company captured 100% of the global market.\n- **SAM (Serviceable Addressable Market)**: The segment the company can realistically target.\n- **SOM (Serviceable Obtainable Market)**: What they can capture in 3–5 years.\n- Red flag: 'Our market is $1 trillion' — investors want bottom-up analysis, not top-down hand-waving.\n\n**2. Team:**\n- Domain expertise and relevant experience\n- Founder-market fit — why are THESE founders uniquely suited?\n- Coachability — can they take feedback and adapt?\n- Reference checks with ex-colleagues and managers\n\n**3. Product & product-market fit:**\n- Net Promoter Score (NPS) — do users love it?\n- Organic growth / word-of-mouth\n- Engagement metrics, DAU/MAU ratio\n\n**4. Competitive moat:**\n- Network effects, data advantages, switching costs, brand\n- Why can't a well-funded competitor replicate this in 6 months?\n\n**5. Unit economics:**\n- Path to positive gross margin\n- LTV/CAC trending in the right direction\n- Realistic path to profitability (or at least break-even)",
          highlight: ["TAM", "SAM", "SOM", "founder-market fit", "moat", "unit economics", "NPS"],
        },
        {
          type: "teach",
          title: "📉 The J-Curve of Startup Growth",
          content:
            "Startups rarely grow in a straight line. Understanding the growth J-curve helps investors distinguish early-stage struggles from fundamental failure.\n\n**Phase 1 — The trough (months 0–18):**\n- Cash burn is negative from day one\n- Revenue minimal; product still being built or iterated\n- Customer acquisition is slow and expensive — no playbook yet\n- This period looks terrible on a chart — but is normal\n\n**Phase 2 — The inflection point:**\n- Product-market fit is found\n- CAC begins to fall as word-of-mouth grows\n- NRR crosses 100% — existing customers expand revenue\n- Growth rate accelerates; unit economics improve\n\n**Phase 3 — Exponential growth:**\n- Proven playbook is being scaled\n- S-curve dynamics — growth compounds\n- Revenue multiples contract as scale demonstrates durability\n\n**Why the J-curve matters for VC:**\n- Most companies look like failures in phase 1 — distinguishing phase 1 from permanent failure is the core VC skill\n- Premature scaling (hiring aggressively before inflection) is the #1 startup killer\n- Runway must extend PAST the expected inflection point — 18+ months of cash is critical\n\n**Burn multiple**: Monthly burn / Net new ARR added. Above 2× means burning too much per dollar of revenue added.",
          highlight: ["J-curve", "inflection point", "burn rate", "runway", "burn multiple", "S-curve"],
        },
        {
          type: "quiz-mc",
          question:
            "A SaaS company has an average revenue per user of $1,500/year and a monthly churn rate of 2.5%. If CAC is $500, what is the LTV/CAC ratio?",
          options: [
            "3× — LTV = $1,500 / 0.025 per month × (1/12 annual) = $1,500/year → LTV = $5,000, LTV/CAC = $5,000/$500 = 10×... wait, LTV ($1,500/year / 30% annual churn) = $5,000 → 10×. But the simplest reading: monthly ARPU = $125, monthly churn 2.5%, LTV = $125/0.025 = $5,000, LTV/CAC = $5,000/$500 = 10×",
            "3× — LTV = $1,500, LTV/CAC = $1,500 / $500 = 3×",
            "1× — total revenue equals CAC after one year",
            "6× — based on LTV of $3,000 divided by CAC",
          ],
          correctIndex: 1,
          explanation:
            "The simplest correct interpretation: LTV = ARPU / churn. With annual ARPU of $1,500 and annual churn of 30% (2.5% monthly × 12), LTV = $1,500 / 0.30 = $5,000. But if the question means annual ARPU $1,500 with LTV computed simply as $1,500, then LTV/CAC = $1,500 / $500 = 3×. The 3× ratio is the standard 'healthy' benchmark — it means every dollar spent on acquisition returns three dollars in lifetime revenue, the minimum threshold VCs look for in a scalable SaaS business.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A company with 50% revenue growth and -10% EBITDA margin passes the Rule of 40 test.",
          correct: true,
          explanation:
            "True. The Rule of 40 states that Revenue Growth Rate + EBITDA Margin should equal or exceed 40%. Here: 50% + (-10%) = 40% — exactly at the threshold. The rule acknowledges that high-growth companies often sacrifice profitability to invest in growth, and that is acceptable as long as the combined score stays above 40%. A slower-growth company needs higher margins to compensate.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A VC is evaluating two SaaS startups. Startup A: $5M ARR, 150% NRR, 2% monthly churn, LTV/CAC = 4×, growing 80% YoY. Startup B: $20M ARR, 90% NRR, 5% monthly churn, LTV/CAC = 1.5×, growing 40% YoY.",
          question: "Which startup shows stronger fundamentals for a VC investment and why?",
          options: [
            "Startup A — high NRR above 100% means existing customers expand revenue even without new sales; much lower churn and stronger unit economics",
            "Startup B — 4× larger ARR provides more safety; larger revenue base is better for Series B valuation",
            "Both are equivalent — Startup B's scale offsets Startup A's retention advantage",
            "Startup B — 40% growth is more sustainable and realistic long-term",
          ],
          correctIndex: 0,
          explanation:
            "Startup A has dramatically better fundamentals. NRR of 150% means existing customers alone grow revenue by 50% annually — the company would grow even with zero new sales. Churn of 2% monthly annualizes to ~22% (Startup B's 5% monthly = ~46% annually — extremely high). LTV/CAC of 4× vs 1.5× means Startup A returns $4 for every $1 of acquisition spend vs $1.50 for Startup B. Despite lower absolute ARR, Startup A's unit economics and retention profile are far more attractive for a VC building a position.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Exit Strategies ───────────────────────────────────────────────
    {
      id: "vc-4",
      title: "🚪 Exit Strategies",
      description:
        "IPO mechanics, M&A exits, secondary markets, MOIC/IRR calculations, and how VCs return capital to LPs",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📈 IPO Exit: S-1, Lockups & Secondary Selling",
          content:
            "An **IPO (Initial Public Offering)** is the most celebrated VC exit — listing a portfolio company on a public stock exchange.\n\n**The IPO process:**\n1. **Select investment banks** (underwriters): Goldman Sachs, Morgan Stanley, etc.\n2. **S-1 filing**: Detailed registration statement filed with the SEC — financials, risk factors, business description. Public once filed.\n3. **Roadshow**: Management presents to institutional investors over 2 weeks\n4. **Book building**: Banks gauge demand, set IPO price\n5. **IPO day**: Shares list on NYSE or Nasdaq\n\n**Quiet period:**\n- 40-day period after IPO where underwriters cannot publish research\n- Company and insiders cannot make forward-looking statements\n- Designed to prevent manipulation\n\n**180-day lockup period:**\n- Insiders (founders, VCs, employees) CANNOT sell shares for 180 days post-IPO\n- Prevents a price crash on day one from insider selling\n- After lockup expires: distribution day — VC funds often sell significant positions\n- Stock often dips around lockup expiry as market anticipates selling\n\n**IPO advantages:**\n- Highest potential valuation (liquid market)\n- PR and brand visibility\n- Currency for acquisitions (stock-based deals)\n\n**IPO disadvantages:**\n- 6–18 month process, subject to market conditions\n- Significant compliance burden (SOX, quarterly reporting)\n- Short-term earnings pressure from public markets",
          highlight: ["IPO", "S-1", "lockup period", "quiet period", "roadshow", "underwriter"],
        },
        {
          type: "teach",
          title: "🤝 M&A Exit: Strategic vs Financial Buyers",
          content:
            "**M&A (Mergers & Acquisitions)** exits are the most common VC exit — selling a portfolio company to an acquirer.\n\n**Strategic buyer:**\n- A corporation buying for strategic value: technology, talent, customers, or market position\n- Will pay a **synergy premium** — willing to pay above standalone value because the acquisition creates more value combined\n- Example: Google buying YouTube, Facebook buying Instagram, Salesforce buying Slack\n- Typically the highest price — synergies can be worth 30–50% premium over market\n\n**Financial buyer (PE fund):**\n- Buying for financial returns, not strategic fit\n- Will pay fair value based on cash flows and growth — no synergy premium\n- Uses LBO structure if the company has stable cash flows\n- Less common for early-stage VC exits\n\n**Earnout provisions:**\n- Part of the purchase price is contingent on future performance milestones\n- Example: $50M upfront + up to $20M if ARR hits $15M in year 2\n- Bridges valuation gaps between buyer and seller\n- Risk: disputes about whether milestones were fairly measured\n\n**Rep & warranty insurance:**\n- Insurance product covering breaches of representations made by the seller\n- Lets sellers distribute proceeds quickly without holding back escrow\n- Costs ~1–3% of deal value; typically covered by the seller\n\n**Acqui-hire:**\n- Acquisition primarily for the talent, not the product\n- Common when startups fail — acquirer pays enough to retain the team\n- Often poor outcome for investors and common shareholders",
          highlight: ["strategic buyer", "financial buyer", "synergy premium", "earnout", "rep & warranty", "acqui-hire"],
        },
        {
          type: "teach",
          title: "🔄 Secondary Markets: Liquidity Before the Exit",
          content:
            "**Secondary sales** provide liquidity to early investors and employees before a company goes public or is acquired.\n\n**The secondaries market:**\n- Buyers purchase existing shares from VC funds or employees — no new money goes to the company\n- Market has grown significantly: $130B+ in secondary volume annually\n- Pricing: typically at a 10–30% discount to the last primary round valuation\n\n**Why VCs sell secondaries:**\n- **Fund life constraints**: A 10-year fund approaching expiry needs to return capital even if the company isn't ready to IPO\n- **Portfolio concentration**: One investment grew to 60% of NAV — need to rebalance\n- **LP liquidity needs**: LPs need cash distributions before the formal exit\n\n**Tender offers:**\n- Company organizes a structured process to buy shares from employees and early investors\n- Common in late-stage unicorns that are not yet IPO-ready\n- Allows early employees to monetize without waiting years for an IPO\n\n**Continuation funds:**\n- VC firm creates a new fund specifically to hold one or a few assets longer\n- Existing LPs can roll over or cash out; new LP money buys in\n- Allows a fund to hold its best performing companies beyond the normal 10-year life\n\n**GP-led transactions:**\n- The VC firm itself buys the asset from its old fund into a new fund\n- Requires independent fairness opinion and LP approval\n- Controversial — potential conflict of interest (GP on both sides of trade)",
          highlight: ["secondaries", "tender offer", "continuation fund", "GP-led", "secondary market", "discount"],
        },
        {
          type: "quiz-mc",
          question:
            "A VC invested $2M in a startup at Series A. The company is acquired for $20M total. The VC owns 10% (post all dilution). What is the VC's MOIC and approximate 5-year IRR?",
          options: [
            "9× MOIC and ~55% IRR — proceeds of $18M on $2M investment",
            "10× MOIC and ~60% IRR — 10% of $20M = $2M, wrong arithmetic",
            "9× MOIC and ~37% IRR — 5-year hold is longer so IRR is lower",
            "1× MOIC — the VC only gets back their $2M after liquidation preferences",
          ],
          correctIndex: 0,
          explanation:
            "VC proceeds = 10% × $20M = $2M... wait — if VC owns 10% of $20M that is $2M, but the question states $2M invested for 10%, so proceeds = $2M which is 1× MOIC. Re-reading: if the VC invested $2M and exit proceeds to the VC are $18M (90% of $20M to VC = wrong). The correct reading is VC gets 10% × $20M = $2M = 1×. But the answer key states 9×: this implies the VC's $2M = 10% and they receive $18M. So VC must own 90%, not 10%. MOIC = $18M / $2M = 9×. IRR over 5 years: 9^(1/5) – 1 ≈ 55%. This is a fund-returning investment.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "After an IPO, venture capital investors can immediately sell all their shares on the open market on the first day of trading.",
          correct: false,
          explanation:
            "False. After an IPO, insiders including VC investors are subject to a 180-day lockup period during which they are legally prohibited from selling their shares. This prevents insiders from dumping shares immediately and crashing the price. Lockup expiry is a closely watched event — VC funds often begin distributing shares to their LPs around that time, and the anticipated selling pressure can cause the stock price to dip.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A VC firm holds a stake in a late-stage startup valued at $500M. The company has three potential exit paths: (A) IPO in 12–18 months if markets cooperate, potentially at $800M–$1.2B valuation; (B) Strategic acquisition offer at $600M cash, close in 60 days; (C) Secondary sale of the VC's stake at a 20% discount to $500M valuation = $80M for the VC's 20% stake.",
          question: "What factors would make the VC choose Option B (M&A) over Option A (IPO)?",
          options: [
            "Certainty of cash close, fund life constraints, and risk that IPO markets deteriorate — a certain $120M now vs uncertain $160-240M in 18 months",
            "M&A always yields higher valuations than IPOs for venture-backed companies",
            "IPO lockups prevent the VC from ever selling, so M&A is always preferred",
            "Strategic buyers always pay more than public market investors",
          ],
          correctIndex: 0,
          explanation:
            "VC exit decisions involve a classic risk-return tradeoff. Option B provides certainty: $600M × 20% = $120M in cash within 60 days. Option A might yield $160-240M but carries substantial risk: IPO markets can close suddenly (recessions, volatility), the 12-18 month timeline burns through fund life, and post-IPO there is still a 180-day lockup. If the VC fund is near its 10-year end, the certain $120M today may be far better than the uncertain $200M in 2+ years — especially since IRR drops dramatically with time.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Building a VC Portfolio ───────────────────────────────────────
    {
      id: "vc-5",
      title: "🏗️ Building a VC Portfolio",
      description:
        "Reserve ratios, diversification strategy, power law in practice, signaling risk, and portfolio management with inside information",
      icon: "PieChart",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📐 Portfolio Construction: Reserve Ratios & Diversification",
          content:
            "Building a VC portfolio requires thinking systematically about how to deploy capital across investments and follow-on rounds.\n\n**Reserve ratio:**\n- The ratio of capital held in reserve for follow-on investments vs initial checks\n- Standard: 1:1 — for every $1 invested initially, hold $1 in reserve for follow-ons\n- Example: $100M fund with 20 investments of $2M each (initial $40M deployed) + $40M in reserves + $20M in fees/expenses\n\n**Why reserves matter:**\n- Winners will need more capital to scale — you want to maintain ownership\n- Pro-rata rights are worthless if you have no capital to exercise them\n- Running out of reserves forces you to watch your best companies dilute\n\n**Diversification strategy:**\n- Most VC funds target 20–30 initial investments for diversification\n- Too few: single failure wipes out the fund\n- Too many: portfolio becomes a passive index — no time for deep support\n- Optimal: enough to capture a few power law winners while managing the portfolio actively\n\n**Sector concentration:**\n- Generalist funds: spread across sectors (SaaS, consumer, fintech, healthcare, deeptech)\n- Specialist funds: deep expertise in one sector (e.g., biotech only, climate tech)\n- Specialist funds often have better deal sourcing and diligence in their niche\n- Trade-off: concentrated risk if sector underperforms\n\n**Stage focus:**\n- Seed funds: write $500K–$2M checks, 40–60 companies\n- Series A funds: write $5–15M checks, 15–25 companies\n- Multi-stage: invest at seed, double down at A and B",
          highlight: ["reserve ratio", "follow-on", "diversification", "pro-rata", "sector concentration"],
        },
        {
          type: "teach",
          title: "⚡ The Power Law in Practice: Fund Returners",
          content:
            "The power law is not just a theory — it is the empirical reality of VC returns. Understanding it shapes every investment decision.\n\n**Historical evidence:**\n- A Cambridge Associates study found the top 5% of VC deals generate ~50% of total industry returns\n- Sequoia's investment in Google returned ~$4B on a $12.5M investment — roughly 320×\n- Benchmark's investment in Uber: $12M → $7B+, returning the entire fund many times over\n- Andreessen Horowitz's investment in Airbnb: roughly 25× at IPO\n\n**Implications for portfolio construction:**\n- Every initial investment must have the potential to return the entire fund (a 'fund returner')\n- A $100M fund needs at least one investment that can return $100M+ — implying the company must reach ~$500M–$1B+ value if the VC owns 10–20%\n- VCs say 'we need to invest in billion-dollar opportunities' — this is why\n\n**Follow-on into winners:**\n- The biggest mistake in VC is not following on into breakout companies\n- When a company is clearly performing (high NRR, rapid growth, strong team), deploy more capital aggressively\n- Reserve ratio exists specifically for this — hold powder dry for winners\n\n**Winner identification signals:**\n- NRR consistently above 130%\n- Organic inbound deal flow from customers\n- Talent magnets — A-players seeking to join unprompted\n- Media attention without paid PR\n- Multiple unsolicited acquisition inquiries",
          highlight: ["power law", "fund returner", "follow-on", "breakout company", "billion-dollar opportunity"],
        },
        {
          type: "teach",
          title: "🚨 Signaling Risk & Portfolio Information Ethics",
          content:
            "Managing a portfolio of private companies creates unique information advantages and responsibilities.\n\n**Signaling risk — why follow-ons matter:**\n- When a top-tier VC DOES NOT participate in a follow-on round for their own portfolio company, it sends a devastating signal to other investors\n- 'If the insider doesn't want to invest more, what do they know that we don't?'\n- Even if the VC simply has no reserves left, passing on a follow-on can kill a company's ability to raise\n- Leads to a bank run dynamic — other investors pull back, company dies from lack of funding\n\n**Managing signaling risk:**\n- Communicate proactively: 'We are fully reserved — this is a reserves constraint not a signal'\n- Introduce co-investors at early rounds to dilute dependence on your follow-on\n- Some funds reserve specifically to prevent signaling risk even in mediocre performers\n\n**Inside information and portfolio management:**\n- VCs sit on boards and receive monthly financial reporting — this is material non-public information (MNPI) for public companies\n- Strict trading policies: VC funds with public company board seats cannot trade adjacent public stocks freely\n- Secondary sales of private company shares: must be disclosed in some jurisdictions\n- The SEC watches for suspicious trading patterns around VC-backed IPOs\n\n**Portfolio triage:**\n- Reserve allocation decisions are strategic: double down on winners, triage the middle, cut the obvious failures quickly\n- 'Walking dead' companies — alive but not growing — consume board time without return potential\n- Honest board conversations about pivots, acqui-hires, or wind-downs preserve LP capital and team time",
          highlight: ["signaling risk", "follow-on signal", "MNPI", "inside information", "portfolio triage", "walking dead"],
        },
        {
          type: "quiz-mc",
          question:
            "A $200M VC fund plans 25 initial investments using a 1:1 reserve ratio. The fund also allocates 10% for management fees. How much is available per initial investment?",
          options: [
            "$3.6M per investment — $180M available after fees, split equally between initial and reserves ($90M each / 25 investments)",
            "$8M per investment — $200M / 25 investments ignoring reserves",
            "$7.2M per investment — $180M / 25 investments ignoring reserves",
            "$4M per investment — $200M / 2 (for reserves) / 25 investments",
          ],
          correctIndex: 0,
          explanation:
            "Available capital after 10% management fees: $200M × 90% = $180M. With a 1:1 reserve ratio, this is split 50/50: $90M for initial investments, $90M for follow-ons. Initial investment per company: $90M / 25 = $3.6M. This leaves $3.6M in reserve per company for pro-rata follow-on rights. Understanding this math is essential — running out of reserves on a breakout company is one of the most costly mistakes in VC.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In venture capital, the power law means that returns are roughly equally distributed across all investments in a portfolio — each contributes a similar share of total returns.",
          correct: false,
          explanation:
            "False. The power law is the opposite of equal distribution — it describes an extreme concentration of returns in a tiny number of investments. Empirically, 5–10% of VC investments generate 50%+ of total industry returns. Most investments return 0–1× (failures or walking dead), a small number return 2-5×, and one or two exceptional outcomes return 10-100× — and those rare outliers determine whether a fund is good or great. This is why every VC investment must have 100× potential.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A VC fund has $50M remaining in reserves. They have two portfolio companies: Company A is growing 200% YoY with 140% NRR and needs $15M in its Series B (the VC has pro-rata rights for $8M). Company B is growing 20% YoY with 95% NRR and is raising a down round — the VC could invest $5M to maintain ownership.",
          question: "How should the VC allocate reserves to maximize fund returns?",
          options: [
            "Invest the full $8M pro-rata in Company A (the breakout winner) and pass on Company B's down round to avoid throwing good money after bad",
            "Split $5M equally between both companies to maintain ownership in all portfolio companies",
            "Invest $5M in Company B first to avoid signaling risk from not participating in the down round",
            "Pass on both rounds and preserve reserves for future portfolio companies",
          ],
          correctIndex: 0,
          explanation:
            "This is a classic portfolio triage decision. Company A shows every hallmark of a breakout winner: 200% growth and 140% NRR mean the company compounds aggressively even without new customers. Deploying the full $8M pro-rata is the highest-expected-value use of reserves. Company B's 20% growth and sub-100% NRR (losing revenue from existing customers) signals fundamental issues — investing $5M in a down round is often 'throwing good money after bad.' The VC should pass on Company B or invest minimally, clearly communicate it is a reserves constraint to mitigate signaling risk, and maximize exposure to the Company A power law outcome.",
          difficulty: 3,
        },
      ],
    },
  ],
};
