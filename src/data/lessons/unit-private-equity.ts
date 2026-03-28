import type { Unit } from "./types";

export const UNIT_PRIVATE_EQUITY: Unit = {
  id: "private-equity",
  title: "Private Equity & Venture Capital",
  description:
    "Understand LBOs, VC funding rounds, due diligence, value creation, and PE exit strategies — the world beyond public markets",
  icon: "🏦",
  color: "#7c3aed",
  lessons: [
    // ─── Lesson 1: PE Fundamentals & LBO ────────────────────────────────────────
    {
      id: "pe-1",
      title: "🏦 PE Fundamentals & LBO",
      description:
        "PE fund structure, the 2/20 fee model, leveraged buyout mechanics, and value creation levers",
      icon: "Building2",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🏗️ PE Fund Structure: LP, GP & the 2/20 Model",
          content:
            "**Private Equity** pools capital from institutional investors to acquire companies, improve them, and sell at a profit.\n\n**Fund structure:**\n- **LP (Limited Partners)**: The investors — pension funds, endowments, sovereign wealth funds. They provide 99% of capital but have limited liability.\n- **GP (General Partner)**: The fund managers who source deals, manage portfolio companies, and make all investment decisions.\n\n**The 2/20 fee model:**\n- **2% management fee**: Charged annually on committed capital. On a $1B fund, that is $20M/year to cover salaries and operations.\n- **20% carried interest**: The GP receives 20% of all profits above the hurdle rate (typically 8% IRR). This is the primary incentive.\n\nExample: $1B fund returns $2B. Profit = $1B. After hurdle, GP carry = $200M. LPs keep $800M.\n\n**Fund lifecycle:** Fundraise → Investment period (3–5 years) → Hold portfolio → Exit → Return capital. Total fund life ~10 years.",
          highlight: ["LP", "GP", "carried interest", "management fee", "hurdle rate"],
        },
        {
          type: "teach",
          title: "💪 Leveraged Buyout (LBO) Mechanics",
          content:
            "A **Leveraged Buyout (LBO)** acquires a company using a mix of equity and debt — typically 60–70% debt — so the PE firm needs less of its own capital upfront.\n\n**Why use debt?**\n- Interest is tax-deductible, reducing the effective cost\n- The company's own cash flows repay the debt over time\n- Leverage amplifies equity returns\n\n**LBO math example:**\n- Purchase price: $1B (company with $100M EBITDA at 10× multiple)\n- Debt: $700M | Equity: $300M\n- After 5 years: operational improvements raise value to $1.5B\n- Debt repaid to $700M (interest-only scenario) → Exit equity = $800M\n- **MOIC = $800M / $300M = 2.7×**\n\n**Four value creation levers:**\n1. **Multiple expansion** — buy at 10× EBITDA, exit at 12×\n2. **Revenue growth** — new markets, pricing, acquisitions\n3. **Margin improvement** — cost cutting, operational efficiency\n4. **Deleveraging** — debt repayment increases equity value",
          highlight: ["LBO", "leverage", "MOIC", "multiple expansion", "deleveraging"],
        },
        {
          type: "teach",
          title: "📈 PE Returns: IRR vs MOIC",
          content:
            "PE funds target **20–25% IRR** (Internal Rate of Return), though the industry average is closer to ~13% net of fees.\n\n**MOIC (Multiple of Invested Capital)**: Total value returned divided by equity invested.\n- 1× = break even, 2× = doubled, 3× = tripled\n\n**IRR**: Annualised return accounting for timing.\n- The same 2× MOIC over 3 years (~26% IRR) is far better than 2× over 7 years (~10% IRR)\n- Time kills IRR — PE firms prefer fast holds\n\n**IRR vs MOIC tension:**\n| Scenario | MOIC | Hold | IRR |\n|---|---|---|---|\n| Fast exit | 2× | 3 yr | 26% |\n| Slow exit | 2× | 7 yr | 10% |\n| High return | 4× | 7 yr | 22% |\n\n**Hurdle rate**: Typically 8% preferred return. Below this, LPs get 100% of profits. Above it, the GP earns the 20% carry.",
          highlight: ["IRR", "MOIC", "hurdle rate", "hold period", "carry"],
        },
        {
          type: "quiz-mc",
          question:
            "What is 'carried interest' in a private equity fund?",
          options: [
            "The GP's 20% share of profits above the hurdle rate",
            "The 2% annual management fee charged on committed capital",
            "Interest paid on the leveraged debt used in an LBO",
            "The return earned by LPs on their invested capital",
          ],
          correctIndex: 0,
          explanation:
            "Carried interest is the GP's profit share — typically 20% of gains above the hurdle rate (usually 8% IRR). It aligns the GP's incentives with LP returns and is the primary way fund managers get wealthy. The 2% fee covers operating costs, while carry is the real upside.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A PE firm buys a company for $500M using $350M debt and $150M equity. After 4 years the company is worth $750M and the debt has been paid down to $300M.",
          question: "What is the equity MOIC?",
          options: [
            "3.0× — exit equity of $450M divided by $150M invested",
            "1.5× — based on total enterprise value increase",
            "2.1× — exit equity of $315M divided by $150M invested",
            "5.0× — based on leverage ratio applied to returns",
          ],
          correctIndex: 0,
          explanation:
            "Exit equity = Exit EV – Remaining debt = $750M – $300M = $450M. MOIC = $450M / $150M = 3.0×. Leverage amplified equity returns: the enterprise value grew 50% but equity grew 200%, illustrating why LBOs use significant debt.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Venture Capital ───────────────────────────────────────────────
    {
      id: "pe-2",
      title: "🚀 Venture Capital",
      description:
        "VC vs PE differences, funding rounds from pre-seed to Series C, term sheet basics, and the power law",
      icon: "Rocket",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "⚖️ VC vs PE: Key Differences",
          content:
            "**Venture Capital** and **Private Equity** both invest in private companies, but their strategies differ fundamentally.\n\n| Factor | Venture Capital | Private Equity |\n|---|---|---|\n| Stage | Early-stage startups | Mature, cash-flowing companies |\n| Leverage | None — pure equity | 60–70% debt (LBO) |\n| Ownership | Minority stakes (10–30%) | Majority control (>50%) |\n| Revenue | Pre-revenue to early revenue | Established revenue + EBITDA |\n| Risk | Very high — most fail | Moderate — known cash flows |\n| Return driver | Massive growth (100×) | Multiple expansion + debt paydown |\n| Fund life | 7–10 years | 5–7 years |\n\n**Key insight**: VC accepts that 80% of investments may fail, expecting 1–2 massive winners to return the entire fund. PE firms rarely see complete losses but target more predictable 2–3× returns.",
          highlight: ["VC", "PE", "minority stake", "majority control", "leverage"],
        },
        {
          type: "teach",
          title: "💰 Funding Rounds: Pre-Seed to Series C",
          content:
            "Startups raise capital in stages, with each round reflecting increased validation and higher valuations.\n\n**Pre-seed ($500K–$2M):**\n- Idea stage, often friends/family or angel investors\n- Product may not exist yet\n\n**Seed ($2M–$5M):**\n- Early product, initial traction, pre-revenue or minimal revenue\n- Seed VCs and angels; typical valuation $10–20M\n\n**Series A ($5M–$20M):**\n- Proven product-market fit, growing revenue\n- Institutional VCs; valuation $30–80M\n- Key metrics: MRR growth, retention, unit economics\n\n**Series B ($20M–$60M):**\n- Scaling a working model, expansion\n- Valuation $100–300M\n\n**Series C ($60M+):**\n- Large-scale growth, pre-IPO or international expansion\n- Valuation $300M–$1B+\n\n**Late stage / Pre-IPO:**\n- Growth equity, sovereign wealth funds may participate\n- Valuation often $1B+ (unicorn status)",
          highlight: ["pre-seed", "seed", "Series A", "Series B", "Series C", "unicorn"],
        },
        {
          type: "teach",
          title: "📋 Term Sheet Basics & Power Law",
          content:
            "A **term sheet** is the non-binding document outlining investment terms before the legal agreement.\n\n**Key term sheet concepts:**\n- **Pre-money valuation**: Company's value BEFORE the new investment. If pre-money = $10M and VC invests $2M, post-money = $12M.\n- **Post-money valuation**: Pre-money + new investment. VC owns $2M / $12M = 16.7%.\n- **Liquidation preference**: VCs get their money back first in a sale or liquidation — often 1× non-participating.\n- **Anti-dilution**: Protects VCs from down rounds — full ratchet (aggressive) or broad-based weighted average (friendly).\n- **Pro-rata rights**: VC can maintain their percentage in future rounds by investing more.\n\n**The VC Power Law:**\nVC returns follow a power law — a small number of investments return enormous multiples.\n- Top 1% of investments often return 50%+ of a fund's total gains\n- Most startups fail or return < 1×\n- Strategy: invest in potential 100× companies, not just 3× ones\n\n**Cap table evolution:**\nFounders (80%) → Angels reduce to 60% → Seed reduces to 45% → Series A reduces to 35%",
          highlight: ["pre-money valuation", "post-money valuation", "liquidation preference", "anti-dilution", "power law"],
        },
        {
          type: "quiz-mc",
          question:
            "In venture capital, what is 'pre-money valuation'?",
          options: [
            "The company's value before the new investment is added",
            "The company's value after subtracting the new investment",
            "The total amount of money a VC fund has raised from LPs",
            "The minimum return a VC expects before paying carried interest",
          ],
          correctIndex: 0,
          explanation:
            "Pre-money valuation is what the company is worth before new capital is injected. If the pre-money is $10M and a VC invests $2M, the post-money valuation is $12M, and the VC owns 2/12 = 16.7%. This is the key negotiation point in every funding round.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Venture capital funds typically use significant debt (leverage) to amplify returns, similar to private equity LBO funds.",
          correct: false,
          explanation:
            "False. VC funds invest purely in equity — no leverage. Startups rarely have the predictable cash flows needed to service debt, and early-stage companies often have no revenue at all. PE leveraged buyouts apply to mature, cash-generating businesses. VC relies on equity growth and the power law, not financial engineering.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: PE Deal Sourcing & Due Diligence ──────────────────────────────
    {
      id: "pe-3",
      title: "🔍 Deal Sourcing & Due Diligence",
      description:
        "How PE firms find deals, conduct quality of earnings analysis, and structure transactions",
      icon: "Search",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🎯 Deal Sourcing: Proprietary vs Auction",
          content:
            "Finding the right company to buy is as important as managing it. PE firms source deals through two main channels:\n\n**Proprietary deals (preferred):**\n- Direct outreach to business owners — relationship-driven\n- No competitive bidding → lower prices, more negotiating power\n- Built through years of industry networking\n- Example: A PE firm calls a founder directly after following the business for 3 years\n\n**Auction processes (common):**\n- Investment banks run a structured sale process\n- Multiple PE bidders submit offers simultaneously\n- Seller maximizes price; buyer competes on valuation AND certainty of close\n- Competitive auctions often result in 20–30% higher prices\n\n**Deal sourcing channels:**\n- Investment bankers (sell-side M&A mandates)\n- Management teams of existing portfolio companies\n- Industry conferences and trade shows\n- Intermediaries and business brokers\n- Direct owner outreach (\"cold calling\" CEOs)",
          highlight: ["proprietary deal", "auction process", "investment bankers", "deal sourcing"],
        },
        {
          type: "teach",
          title: "🔬 Due Diligence: Four Core Areas",
          content:
            "Before committing capital, PE firms spend 4–8 weeks conducting thorough **due diligence** across four areas:\n\n**1. Financial DD:**\n- Quality of Earnings (QoE) analysis — detailed EBITDA review\n- Cash flow analysis, working capital assessment\n- Historical revenue and margin trends\n\n**2. Commercial DD:**\n- Market size and growth rate (TAM, SAM, SOM)\n- Competitive positioning and moat\n- Customer interviews — concentration risk, satisfaction, churn\n- Red flag: if top 3 customers > 30% of revenue, high risk\n\n**3. Legal DD:**\n- Contracts, IP ownership, litigation history\n- Regulatory compliance, environmental liabilities\n- Employee agreements and non-competes\n\n**4. Management DD:**\n- Team track record and experience\n- Culture assessment and retention risk\n- Reference checks on executives\n- Red flag: projections 3× above historical growth are suspicious",
          highlight: ["due diligence", "quality of earnings", "commercial DD", "customer concentration", "management DD"],
        },
        {
          type: "teach",
          title: "📊 Quality of Earnings & Deal Structure",
          content:
            "**Quality of Earnings (QoE)** is the most important financial analysis in PE — it strips away accounting noise to find the true, recurring EBITDA.\n\n**Common QoE adjustments:**\n- Remove one-time items: litigation settlements, restructuring charges\n- Add back: owner compensation above market rate\n- Normalize: working capital seasonality\n- Remove: non-recurring revenue (one-time government contract)\n\nExample: Reported EBITDA = $20M. After QoE: remove one-time gain ($3M), add back excess owner salary ($1M) → Adjusted EBITDA = **$18M**\n\n**Deal structure layers (capital stack):**\n1. **Senior secured debt** (50–55% of capital) — lowest cost, first to be repaid\n2. **Second lien / unitranche** (10–15%) — slightly higher rate\n3. **Mezzanine debt** (5–10%) — high yield, sometimes with warrants\n4. **Preferred equity** (0–5%) — hybrid, often from growth equity investors\n5. **Common equity** (20–30%) — PE firm + management rollover",
          highlight: ["quality of earnings", "QoE", "adjusted EBITDA", "capital stack", "mezzanine"],
        },
        {
          type: "quiz-mc",
          question:
            "What is 'quality of earnings' analysis in PE due diligence?",
          options: [
            "Adjusting reported EBITDA to reflect normalized, recurring earnings",
            "Assessing whether the management team has high-quality skills",
            "Evaluating the credit quality of the debt used to finance the LBO",
            "Reviewing the company's earnings guidance for the next 5 years",
          ],
          correctIndex: 0,
          explanation:
            "Quality of Earnings (QoE) analysis adjusts reported EBITDA to remove one-time items, non-recurring revenues, and accounting distortions — revealing the true, sustainable earnings power of the business. It is the most critical financial step in PE due diligence and directly determines how much debt a company can support.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In a PE auction process, the highest bid always wins the deal.",
          correct: false,
          explanation:
            "False. While price matters, sellers also weigh certainty of close, speed of execution, management chemistry, and deal structure. A slightly lower bid with no financing contingencies and a credible close track record often beats the highest number. In competitive auctions, PE firms differentiate on 'highest and best' — value plus certainty.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Value Creation & Operations ───────────────────────────────────
    {
      id: "pe-4",
      title: "⚙️ Value Creation & Operations",
      description:
        "100-day plans, revenue enhancement, cost optimization, EBITDA bridges, and management incentives",
      icon: "Settings",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📅 The 100-Day Plan",
          content:
            "The first 100 days after acquisition are critical. PE firms arrive with a plan to establish control, assess the business, and capture quick wins.\n\n**Governance (Days 1–30):**\n- Install new board of directors\n- Review financial reporting systems\n- Establish monthly operating cadence\n- Assess management team — who stays, who goes?\n\n**Assessment (Days 30–60):**\n- Deep dive into all business units\n- Customer satisfaction surveys\n- Employee town halls\n- Identify operational bottlenecks\n\n**Quick wins (Days 60–100):**\n- Pricing adjustments — often 2–5% revenue uplift with no cost\n- Supplier renegotiation — leverage scale for better terms\n- Eliminate redundant costs\n- Launch add-on acquisition search\n\n**Why it matters**: Research shows PE-backed companies that execute structured 100-day plans outperform peers by 20–30% in EBITDA improvement over 3 years.",
          highlight: ["100-day plan", "governance", "quick wins", "management assessment"],
        },
        {
          type: "teach",
          title: "📈 Revenue Enhancement Strategies",
          content:
            "PE firms grow revenue through four primary levers:\n\n**1. Pricing power:**\n- Raise prices 2–5% on captive customers\n- Introduce tiered pricing or premium SKUs\n- Example: SaaS company increases annual contract value 8% → adds $4M revenue on $50M ARR\n\n**2. Geographic expansion:**\n- Bring a regional business national or international\n- Replicate proven unit economics in new markets\n\n**3. New products/services:**\n- Cross-sell to existing customer base (higher margin, lower CAC)\n- Launch adjacent product lines leveraging existing relationships\n\n**4. Bolt-on acquisitions (add-ons):**\n- Acquire smaller competitors to add scale, geography, or products\n- Typically bought at 4–6× EBITDA, added to a platform trading at 8–12×\n- The multiple arbitrage alone creates value: buy at 5×, get valued at 10× = instant 2× on that acquisition\n\n**EBITDA bridge example:**\nYear 1: $20M → Year 3: $30M\nPricing: +$2M | New products: +$3M | Add-on: +$5M = **+$10M**",
          highlight: ["pricing power", "bolt-on acquisition", "add-on", "multiple arbitrage", "EBITDA bridge"],
        },
        {
          type: "teach",
          title: "💰 Management Incentives & Cost Optimization",
          content:
            "**Aligning management with PE:**\n\n- **Rollover equity**: Sellers reinvest 10–20% of proceeds into the new deal — skin in the game\n- **Management carve-out**: Reserved pool (typically 5–10% of equity) for key managers\n- **Milestone bonuses**: Cash bonuses tied to EBITDA targets or exit multiples\n- **Ratchet mechanisms**: Management earns more equity if returns exceed thresholds\n\n**Cost optimization levers:**\n\n1. **Procurement**: Consolidate suppliers, volume discounts — often 2–4% COGS savings\n2. **Back-office consolidation**: Shared services for finance, HR, IT across portfolio\n3. **Headcount optimization**: Remove layers of management, outsource non-core functions\n4. **Real estate**: Renegotiate leases, consolidate offices\n5. **Working capital**: Reduce DSO (days sales outstanding), optimize inventory\n\n**Key principle**: PE does not simply slash costs — it invests where ROI is clear and cuts where it is not. Over-cutting damages growth.",
          highlight: ["rollover equity", "management carve-out", "ratchet", "procurement", "working capital"],
        },
        {
          type: "quiz-mc",
          question:
            "What is a 'bolt-on acquisition' in private equity?",
          options: [
            "Acquiring a smaller company to add to an existing portfolio company",
            "The initial platform company that a PE firm acquires first",
            "A defensive acquisition to prevent a competitor from buying a target",
            "Borrowing additional debt after the initial LBO to fund growth",
          ],
          correctIndex: 0,
          explanation:
            "A bolt-on (or add-on) acquisition means buying a smaller company and merging it into an existing portfolio company (the 'platform'). This drives multiple expansion (bolt-ons are bought cheaper), adds revenue, and creates synergies. It is one of PE's most powerful value creation tools — buy at 5× EBITDA, get valued at 10× platform multiple = immediate value creation.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A PE firm owns a $50M EBITDA business trading at 10× ($500M EV). It acquires a $10M EBITDA bolt-on for $50M (5× EBITDA). The combined business now has $60M EBITDA and still trades at 10×.",
          question: "What is the implied value creation from the bolt-on multiple arbitrage alone?",
          options: [
            "$50M — the bolt-on is now valued at $100M (10× $10M) vs the $50M paid",
            "$10M — simply the EBITDA added by the acquisition",
            "$0 — no value created, multiples are the same",
            "$150M — total combined enterprise value increase",
          ],
          correctIndex: 0,
          explanation:
            "The bolt-on EBITDA of $10M, now part of the platform, gets valued at 10× = $100M. But it was purchased for $50M (5× multiple). The multiple arbitrage creates $50M of instant value. Combined EV = $60M × 10 = $600M vs. $500M + $50M spent = $550M deployed → $50M value creation from the multiple re-rating alone.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Exits & Performance Metrics ───────────────────────────────────
    {
      id: "pe-5",
      title: "🚪 Exits & Performance Metrics",
      description:
        "Exit routes (IPO, trade sale, secondary buyout), MOIC, IRR, J-curve, and vintage year performance",
      icon: "TrendingUp",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🚪 Three Exit Routes",
          content:
            "PE firms must eventually sell their investment to return capital to LPs. There are three primary exit routes:\n\n**1. IPO (Initial Public Offering):**\n- List the company on a stock exchange\n- Best for large, high-profile companies with strong growth\n- Longer process (6–18 months), subject to market conditions\n- PE firm often retains shares and sells over lockup period (6 months)\n- Example: Uber, Airbnb (PE/VC-backed)\n\n**2. Strategic sale (trade sale / M&A):**\n- Sell to a corporate acquirer (strategic buyer)\n- Buyer pays a premium for synergies — typically the highest price\n- Clean exit — PE firm receives cash and is done\n- Most common PE exit route (~40% of exits)\n\n**3. Secondary buyout (SBO):**\n- Sell to another PE firm\n- Common when company has more growth runway but is too large for original fund\n- Seller gets liquidity; buyer sees remaining value creation opportunity\n- Critics say SBOs just 'pass the parcel' without real value creation",
          highlight: ["IPO", "strategic sale", "secondary buyout", "SBO", "exit route"],
        },
        {
          type: "teach",
          title: "📊 MOIC & IRR: The Two Key Metrics",
          content:
            "PE performance is measured by two complementary metrics:\n\n**MOIC (Multiple of Invested Capital):**\nMOIC = Total value returned / Equity invested\n- 1× = returned principal, 2× = doubled, 3× = tripled\n- Does NOT account for time — a 3× over 2 years vs 10 years is very different\n\n**IRR (Internal Rate of Return):**\n- Annualised return, accounting for timing of cash flows\n- Time kills IRR: same MOIC over more years = lower IRR\n\n| MOIC | Hold Period | Approximate IRR |\n|---|---|---|\n| 2× | 3 years | 26% |\n| 2× | 5 years | 15% |\n| 2× | 10 years | 7% |\n| 3× | 5 years | 25% |\n| 4× | 5 years | 32% |\n\n**Why both matter:**\n- MOIC tells you how much money you made\n- IRR tells you how efficiently you made it\n- A 3× MOIC over 10 years (~12% IRR) is mediocre; 3× over 4 years (~32% IRR) is exceptional",
          highlight: ["MOIC", "IRR", "hold period", "time value", "returns"],
        },
        {
          type: "teach",
          title: "📉 The J-Curve & Vintage Year Performance",
          content:
            "**The J-Curve:**\nPE fund performance follows a characteristic J-shaped curve over time.\n\n**Early years (negative):**\n- Management fees are charged immediately on committed capital\n- Deals take 1–3 years to source, so capital is deployed slowly\n- Invested companies not yet showing value improvement\n- Result: negative net returns in years 1–3\n\n**Middle years (inflection):**\n- Portfolio companies begin showing operational improvements\n- Some early exits return capital\n- Net asset value starts rising sharply\n\n**Late years (positive):**\n- Successful exits distribute cash to LPs\n- Cumulative distributions exceed capital called\n- The J-curve resolves upward\n\n**Vintage year:**\n- The year a PE fund made its first investment\n- Returns vary dramatically by vintage: 2006/2007 vintage funds (pre-GFC) underperformed; 2009 vintage (post-GFC bottom) outperformed dramatically\n- Timing the economic cycle matters enormously in PE\n\n**DPI vs TVPI:**\n- **DPI (Distributed to Paid-In)**: Cash actually returned — realized\n- **TVPI (Total Value to Paid-In)**: DPI + remaining portfolio value (unrealized)",
          highlight: ["J-curve", "vintage year", "DPI", "TVPI", "management fees"],
        },
        {
          type: "quiz-mc",
          question:
            "Why does private equity show a 'J-curve' in early fund years?",
          options: [
            "Management fees and deal costs create losses before portfolio companies generate returns",
            "PE funds invest all capital on day one, causing immediate dilution",
            "LPs withdraw capital in early years, reducing the fund's net asset value",
            "Interest rates are typically higher when PE funds are first raised",
          ],
          correctIndex: 0,
          explanation:
            "The J-curve reflects the reality of PE fund economics: management fees are charged from day one on committed capital, while investments take 1–3 years to source and even longer to improve. Early years show negative net returns (the bottom of the J) before portfolio value creation and exits push returns sharply positive — forming the upswing of the J.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A PE fund invested $200M in equity in a company in 2019. They exit in 2024 (5-year hold) for total proceeds of $500M.",
          question: "What are the approximate MOIC and IRR?",
          options: [
            "2.5× MOIC and ~20% IRR",
            "2.5× MOIC and ~10% IRR",
            "1.5× MOIC and ~15% IRR",
            "3.0× MOIC and ~25% IRR",
          ],
          correctIndex: 0,
          explanation:
            "MOIC = $500M / $200M = 2.5×. For a 2.5× MOIC over 5 years, IRR ≈ (2.5)^(1/5) – 1 = 1.201 – 1 = 20.1%. This is a strong but realistic PE return — above the industry average of ~13% but below the 25% top-quartile target. Both metrics together give the full picture of how the investment performed.",
          difficulty: 3,
        },
      ],
    },
  ],
};
