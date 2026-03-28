import type { Unit } from "./types";

export const UNIT_ESG_INVESTING: Unit = {
  id: "esg-investing",
  title: "ESG Investing Masterclass",
  description:
    "Master Environmental, Social, and Governance investing — from ESG scoring and greenwashing to strategies, performance debates, and portfolio construction",
  icon: "🌱",
  color: "#10b981",
  lessons: [
    // ─── Lesson 1: What Is ESG? ──────────────────────────────────────────────────
    {
      id: "esg-1",
      title: "🌍 What Is ESG?",
      description:
        "Understand the three pillars of ESG, its history from SRI to impact investing, and the key rating agencies",
      icon: "BookOpen",
      xpReward: 60,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "The Three Pillars of ESG",
          content:
            "**ESG** stands for **Environmental, Social, and Governance** — a framework for evaluating non-financial factors that can affect a company's long-term risk and performance.\n\n**Environmental (E):** How a company interacts with the natural world.\n- Climate change strategy and carbon emissions\n- Air and water pollution, waste management\n- Water usage intensity and biodiversity impact\n- Clean energy transition and stranded asset risk\n\n**Social (S):** How a company manages relationships with people.\n- Labor standards, worker safety, fair wages\n- Diversity, equity, and inclusion (DEI) programs\n- Supply chain human rights due diligence\n- Data privacy, product safety, community relations\n\n**Governance (G):** How a company is led and controlled.\n- Board independence and composition\n- Executive compensation and pay ratios\n- Shareholder rights (voting, anti-takeover provisions)\n- Audit quality, accounting transparency, anti-corruption\n\nGovernance is often called the **most actionable** pillar — poor governance frequently predicts accounting fraud and mismanagement before financial statements reveal problems.",
          highlight: ["Environmental", "Social", "Governance", "ESG", "board independence", "carbon emissions"],
        },
        {
          type: "teach",
          title: "From SRI to ESG to Impact Investing",
          content:
            "ESG did not emerge overnight — it evolved through three distinct eras of responsible investing:\n\n**1. Socially Responsible Investing (SRI) — 1960s–1990s:**\nRooted in religious and ethical values. Investors excluded 'sin stocks' — tobacco, alcohol, weapons, gambling. A blunt, values-driven approach. The UN-backed CERES principles (1989) formalized environmental screens for institutional investors.\n\n**2. ESG Integration — 2000s–2010s:**\nThe UN's 2006 *Principles for Responsible Investment (PRI)* shifted the framing: ESG factors are financially material, not just ethical. Signatories now represent over $120 trillion in assets under management. ESG became a risk management tool as much as a values tool.\n\n**3. Impact Investing — 2010s–present:**\nGoes beyond 'do less harm' to actively pursue measurable positive outcomes. Impact investors target specific UN Sustainable Development Goals (SDGs) — renewable energy capacity, affordable housing units, or lives improved. Return expectations range from below-market (concessionary) to market-rate.\n\nToday most large asset managers blend all three approaches depending on mandate.",
          highlight: ["SRI", "ESG Integration", "Impact Investing", "PRI", "SDGs", "Principles for Responsible Investment"],
        },
        {
          type: "teach",
          title: "Key ESG Rating Agencies",
          content:
            "Just as credit agencies (Moody's, S&P) rate debt, ESG rating agencies score companies on sustainability factors. The major players:\n\n**MSCI ESG Ratings** — Scale of CCC (worst) to AAA. Covers ~14,000 companies. Focus on financially material ESG risks by industry. Widely used by institutional investors.\n\n**Sustainalytics (Morningstar)** — Measures unmanaged ESG risk on a 0–100 scale (lower = better). Decomposes scores into Exposure (industry risk) and Management (company response).\n\n**ISS ESG** — Proxy advisory firm that also provides ESG scores. Strong focus on governance and proxy voting recommendations.\n\n**Bloomberg ESG Data** — Covers 15,000+ companies; integrates with Bloomberg Terminal. Raw data-heavy, less opinionated scoring.\n\n**S&P Global / Dow Jones Sustainability Index (DJSI)** — Annual Corporate Sustainability Assessment (CSA). DJSI selects top 10% of each sector.\n\n**Key limitation:** These agencies often disagree significantly — a company can score AAA at MSCI and poorly at Sustainalytics. This divergence is not a bug but reflects genuinely different methodologies.",
          highlight: ["MSCI", "Sustainalytics", "ISS", "Bloomberg", "DJSI", "ESG ratings"],
        },
        {
          type: "quiz-mc",
          question:
            "A company awards its CEO a $50M pay package while board members are all former executives with personal relationships to the CEO. Which ESG pillar does this primarily fall under?",
          options: [
            "Governance — executive compensation and board independence are governance issues",
            "Social — because it affects employee morale and public perception",
            "Environmental — because large pay packages increase the carbon footprint of operations",
            "None — executive pay is a purely financial metric outside ESG scope",
          ],
          correctIndex: 0,
          explanation:
            "Executive compensation and board independence are core Governance (G) concerns. A board lacking independence cannot objectively challenge management, creating oversight risk. ESG analysts specifically flag high CEO pay ratios and insider-dominated boards as red flags in the Governance pillar.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Socially Responsible Investing (SRI) and ESG Integration use the same methodology — both simply exclude companies with harmful activities.",
          correct: false,
          explanation:
            "False. SRI uses exclusionary screening based on values (cut out tobacco, weapons, etc.). ESG Integration, by contrast, incorporates ESG factors as financially material risk indicators into standard valuation models — it does not necessarily exclude any sector. A company in a 'controversial' industry can still receive a high ESG integration weight if it manages those risks well relative to peers.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: ESG Data & Scoring ────────────────────────────────────────────
    {
      id: "esg-2",
      title: "📊 ESG Data & Scoring",
      description:
        "How ESG scores are built, why agencies disagree, and how to spot greenwashing",
      icon: "BarChart2",
      xpReward: 70,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "How ESG Scores Are Calculated",
          content:
            "ESG scores are not a single number from a single source — they are constructed estimates built from layers of data:\n\n**Step 1 — Data Collection:**\n- **Self-reported disclosures:** Company sustainability reports, proxy filings, CDP climate questionnaires. Companies control the narrative here.\n- **Third-party verification:** Some metrics (carbon audits, workforce safety records) are independently verified.\n- **Controversy flags:** News sentiment analysis, regulatory fines, litigation events, NGO reports. Automatically trigger score penalties.\n\n**Step 2 — Materiality Weighting:**\nDifferent ESG factors matter differently by industry. For an oil company, carbon emissions are highly material. For a software firm, data privacy and employee diversity dominate. Rating agencies use **industry-specific materiality maps** to weight factors accordingly.\n\n**Step 3 — Normalization & Peer Comparison:**\nScores are typically **sector-relative**. An oil & gas company can score in the top ESG tier within its sector even if its absolute emissions are high, because it manages those risks better than peers. This matters: it means an oil company can appear in an 'ESG fund.'\n\n**Step 4 — Scoring & Aggregation:**\nWeighted factors combine into pillar scores (E, S, G) and an overall ESG score. Methodologies vary widely across agencies.",
          highlight: ["self-reported", "controversy flags", "materiality", "sector-relative", "peer comparison"],
        },
        {
          type: "teach",
          title: "The ESG Score Divergence Problem",
          content:
            "One of the most important — and most underappreciated — features of ESG investing is that rating agencies frequently **disagree with each other**.\n\n**Empirical finding:** A 2019 MIT Sloan study by Florian Berg, Julian Kölbel, and Roberto Rigobon found that ESG ratings from six major agencies had an average correlation of only **0.61** — far lower than credit ratings (0.99 between Moody's and S&P).\n\n**Sources of disagreement:**\n1. **Scope divergence:** What gets measured. Agency A may track 200 indicators, Agency B only 80. Different sets of indicators produce different scores.\n2. **Measurement divergence:** How indicators are measured. Carbon intensity per revenue vs. per employee produces different rankings.\n3. **Weight divergence:** How much each factor counts. Agency A weights governance at 40%, Agency B at 20%.\n\n**Real-world example:** Tesla has received MSCI ratings ranging from CCC to AAA in different periods, while Sustainalytics consistently rated it as a higher-risk company due to governance concerns and Elon Musk's dual role.\n\n**Investor implication:** Do not rely on a single ESG rating. Triangulate across multiple providers or examine underlying raw data metrics directly.",
          highlight: ["score divergence", "correlation 0.61", "scope divergence", "measurement divergence", "weight divergence"],
        },
        {
          type: "teach",
          title: "Greenwashing — What It Is and How to Detect It",
          content:
            "**Greenwashing** occurs when a company — or fund — misrepresents its environmental or social credentials to appear more sustainable than it actually is.\n\n**Common company-level greenwashing tactics:**\n- Publishing ambitious net-zero pledges without credible roadmaps or interim targets\n- Reporting one positive metric (renewable energy use at headquarters) while ignoring far larger negative footprints (Scope 3 supply chain emissions)\n- Labeling products 'eco-friendly' based on a single attribute (recyclable packaging) while ignoring other harms (toxic ingredients)\n- Offsetting emissions via low-quality carbon credits rather than reducing them\n\n**Fund-level greenwashing:**\n- Marketing a fund as 'ESG' while holding major fossil fuel or tobacco positions\n- Using ESG in the fund name without substantive ESG screening in the methodology\n- 'ESG washing' by simply adding ESG analysis to existing stock picks without changing holdings\n\n**Detection techniques:**\n- Check the fund's actual top-10 holdings vs. its ESG claims\n- Review the prospectus exclusion list — are meaningful sectors excluded?\n- Compare disclosed Scope 1/2/3 emissions to industry benchmarks\n- Look for third-party verification of sustainability claims (SBTi, CDP A-list)\n- Use the EU's SFDR Article classification: Article 9 (darkest green) vs. Article 8 vs. Article 6",
          highlight: ["greenwashing", "net-zero pledges", "Scope 3", "carbon offsets", "SFDR", "Article 9"],
        },
        {
          type: "quiz-mc",
          question:
            "A fund is marketed as an 'ESG Leaders' fund but its top 10 holdings include two major oil producers and a tobacco company. What term best describes this situation?",
          options: [
            "Greenwashing — the fund misrepresents its ESG credentials",
            "Best-in-class selection — those companies may score well within their sectors",
            "Negative screening — exclusions are applied at the index level",
            "Impact investing — the fund is measuring improved ESG outcomes over time",
          ],
          correctIndex: 0,
          explanation:
            "This is greenwashing — the fund's marketing claims are not aligned with its actual holdings. While best-in-class strategies can hold oil companies, a fund labeled 'ESG Leaders' with tobacco and oil as top positions likely has misleading marketing. Investors should always check actual holdings against stated ESG methodology.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An ESG analyst at a pension fund is comparing the ESG scores of a large airline. MSCI rates it AA (strong), while Sustainalytics rates it at 35 (high risk). The analyst notes that MSCI weights safety and fleet efficiency heavily, while Sustainalytics weights carbon intensity and labor relations more.",
          question: "What is the most likely cause of the rating divergence for this airline?",
          options: [
            "Weight divergence — the agencies assign different importance to the same ESG factors",
            "Fraud — one agency must have incorrect underlying data",
            "Scope divergence — only one agency measures the airline's emissions",
            "The airline's ESG performance genuinely improved between the two rating dates",
          ],
          correctIndex: 0,
          explanation:
            "This is a classic case of weight divergence. Both agencies are measuring the same company but weighting factors differently — MSCI prioritizes operational safety and efficiency while Sustainalytics emphasizes carbon risk and labor. Neither is necessarily wrong; they reflect different views on what is financially material for airlines. This underscores why triangulating multiple ESG sources is essential.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: ESG Investment Strategies ─────────────────────────────────────
    {
      id: "esg-3",
      title: "♻️ ESG Investment Strategies",
      description:
        "Exclusion screening, ESG integration, best-in-class, thematic funds, and impact investing",
      icon: "Layers",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Exclusion / Negative Screening",
          content:
            "**Exclusion screening** (also called negative screening) is the oldest and simplest ESG strategy: systematically exclude companies or entire sectors that fail ethical or ESG criteria.\n\n**Common exclusion categories:**\n- **Fossil fuels:** Coal mining, oil sands, thermal coal power generation\n- **Weapons:** Controversial weapons (cluster munitions, landmines, nuclear — varying by mandate), conventional weapons manufacturers\n- **Tobacco:** Both manufacturers and often distributors\n- **Gambling:** Casinos, online gambling platforms\n- **Alcohol:** Sometimes excluded in Islamic finance (Shariah-compliant funds)\n- **Adult entertainment:** Explicit content production\n\n**Threshold-based exclusions:** Many funds don't apply a binary exclude/include rule but use revenue thresholds (e.g., exclude if >5% of revenue from tobacco; >25% from fossil fuels).\n\n**Pros:** Simple to communicate; clearly aligns with stated values; avoids reputational risk for the investor.\n\n**Cons:** Reduces the investable universe, potentially harming diversification; may simply transfer ownership to non-ESG investors without changing company behavior; companies at the margin may be unfairly penalized.\n\nExclusion screening is the **most widely used** ESG approach globally — the Global Sustainable Investment Alliance (GSIA) estimates $15+ trillion in exclusion-screened assets.",
          highlight: ["exclusion screening", "negative screening", "fossil fuels", "tobacco", "revenue thresholds"],
        },
        {
          type: "teach",
          title: "ESG Integration and Best-in-Class",
          content:
            "**ESG Integration** embeds ESG data directly into fundamental analysis and valuation models rather than excluding sectors outright.\n\nHow analysts integrate ESG:\n- Adjust the **discount rate (WACC)** upward for high-ESG-risk companies (e.g., +50–100 bps for poor governance)\n- Model **regulatory risk** — carbon pricing, emissions caps, potential litigation costs\n- Adjust **revenue growth** forecasts — poor social practices increase employee turnover costs and customer boycott risk\n- Flag governance red flags as early warning indicators of potential accounting restatements\n\nThis approach is popular with large active managers (BlackRock, Fidelity) because it doesn't exclude sectors but still reflects ESG risk in stock selection.\n\n---\n\n**Best-in-Class (Positive Screening)** selects the **top ESG performers within each sector** rather than excluding sectors entirely.\n\nKey feature: An oil company, a weapons manufacturer, and a tobacco company can all appear in a best-in-class ESG portfolio — if they score highest on ESG metrics relative to their sector peers.\n\nRationale: Rewarding sector leaders incentivizes improvement. Also maintains full market diversification.\n\nExample: The MSCI World ESG Leaders Index uses best-in-class selection, which is why it can still hold energy companies — just the highest-scoring ones.",
          highlight: ["ESG Integration", "best-in-class", "WACC adjustment", "regulatory risk", "positive screening"],
        },
        {
          type: "teach",
          title: "Thematic ESG and Impact Investing",
          content:
            "**Thematic ESG Funds** concentrate on specific sustainability themes rather than broad ESG scores:\n\n- **Clean Energy ETFs:** iShares Global Clean Energy (ICLN), Invesco Solar (TAN). Focused on solar, wind, hydro, energy storage companies.\n- **Water Funds:** Invesco Water Resources (PHO). Utilities, water treatment, infrastructure.\n- **Gender Lens Funds:** Parity (WOMN) — screen for companies with strong female leadership and gender pay equity.\n- **Biodiversity Funds:** Emerging category — focus on companies reducing deforestation, protecting ecosystems.\n- **Circular Economy:** Companies reducing waste, enabling reuse and recycling.\n\nThematic funds offer pure-play exposure to sustainability mega-trends but carry **concentration risk** — they are highly sensitive to policy changes (e.g., IRA incentives for clean energy) and can be volatile.\n\n---\n\n**Impact Investing** goes furthest: capital deployed with explicit intent to generate a **measurable, positive social or environmental outcome** alongside financial return.\n\n- **Metrics matter:** Impact funds report on specific outcomes — MWh of renewable energy generated, metric tons of CO2 avoided, number of households served with affordable finance.\n- **Additionality principle:** The impact would not have occurred without the investment.\n- **Vehicles:** Green bonds, social impact bonds, private equity impact funds, community development financial institutions (CDFIs).",
          highlight: ["thematic ESG", "clean energy", "impact investing", "additionality", "green bonds", "circular economy"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor uses the best-in-class ESG strategy for their equity portfolio. Which statement is most accurate about their portfolio?",
          options: [
            "It will always hold some fossil fuel companies if they score highest on ESG within the energy sector",
            "It excludes all fossil fuel, tobacco, and weapons companies by definition",
            "It only holds renewable energy and technology companies",
            "It requires every holding to have net-zero carbon emissions by 2030",
          ],
          correctIndex: 0,
          explanation:
            "Best-in-class selects the top ESG scorers within each sector — including energy, materials, and defense. This means the portfolio can and often does hold fossil fuel companies that rank best on ESG metrics relative to sector peers. This is a deliberate design choice: it maintains diversification and rewards leaders within controversial industries.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Impact investing always sacrifices financial returns in exchange for social or environmental outcomes (concessionary returns).",
          correct: false,
          explanation:
            "False. While some impact investments do accept below-market (concessionary) returns to maximize social outcomes, many impact investors target full market-rate returns. Examples include green bonds issued by investment-grade corporations, renewable energy infrastructure funds, and microfinance institutions that have delivered competitive risk-adjusted returns. The spectrum of impact investing ranges from concessionary to market-rate.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: ESG Performance Debate ────────────────────────────────────────
    {
      id: "esg-4",
      title: "📈 The ESG Performance Debate",
      description:
        "Examine academic evidence, the ESG premium, risk reduction arguments, and the 2022 underperformance episode",
      icon: "TrendingUp",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Academic Evidence: The 2010–2022 Record",
          content:
            "The empirical case for ESG's financial performance is more nuanced than ESG advocates or critics often admit.\n\n**2010–2020: ESG Outperformance**\nDuring this decade, ESG funds broadly outperformed traditional benchmarks, particularly in the US and Europe. Key drivers:\n- Tech sector (high ESG scores, low emissions) dominated equity returns\n- Energy sector (low ESG scores) underperformed as oil prices were range-bound\n- COVID-19 in 2020: ESG funds held up better because they were underweight energy and overweight quality/growth stocks\n\n**2021–2022: ESG Underperformance**\nThe Russia-Ukraine war (Feb 2022) triggered the worst period for ESG funds in modern history:\n- Commodity prices surged — oil, gas, coal, and defense stocks soared\n- ESG funds excluded or underweighted energy and defense — missing the biggest sector rally of the year\n- The S&P 500 Energy sector gained +65% in 2022 while ESG funds largely missed it\n- Many flagship ESG ETFs underperformed the S&P 500 by 5–10 percentage points in 2022\n\n**Meta-analysis consensus (Friede, Busch & Bassen 2015):** Reviewed 2,000+ studies — roughly 63% found a positive relationship between ESG and corporate financial performance. But correlation is not causation, and survivorship bias inflates positive findings.",
          highlight: ["outperformance", "underperformance 2022", "energy rally", "Russia-Ukraine", "meta-analysis"],
        },
        {
          type: "teach",
          title: "The ESG Premium and Risk Reduction Argument",
          content:
            "**The ESG Premium (Lower Cost of Capital)**\nHigh-ESG firms may benefit from a **lower cost of capital** — a structural advantage:\n- Large ESG-mandated funds (pension funds, sovereign wealth funds) buy and hold high-ESG stocks, increasing demand and depressing yields on green bonds\n- Lower regulatory risk → lower uncertainty → lower risk premium investors demand\n- Better access to debt capital markets: ESG-linked loans often carry lower interest rates tied to ESG KPI targets\n\nThis creates a potential **virtuous cycle**: high ESG → lower cost of capital → better investment economics → higher returns.\n\n**Risk Reduction: The Governance Signal**\nPerhaps the strongest practical case for ESG is its value as a **risk screening tool**:\n\n- **Governance flags predict accounting fraud:** Enron, WorldCom, and more recently Wirecard all showed significant governance red flags (board captured by management, opaque accounting) years before collapse\n- **Social flags predict litigation:** Companies with poor worker safety records, supply chain issues, or data privacy failures are significantly more likely to face costly lawsuits (e.g., Facebook Cambridge Analytica, Boeing 737 Max)\n- **Environmental flags predict stranded assets:** Coal companies with high ESG risk scores in 2015 suffered average stock price declines of 60%+ by 2022 as regulatory transition risk materialized\n\nFramed this way, ESG is less about ethics and more about **systematic risk identification**.",
          highlight: ["ESG premium", "lower cost of capital", "governance signal", "stranded assets", "risk screening"],
        },
        {
          type: "teach",
          title: "Counter-Arguments and Ongoing Debate",
          content:
            "The ESG skeptic's case is well-reasoned and should not be dismissed:\n\n**1. Exclusion reduces diversification:**\nModern Portfolio Theory (Markowitz) shows that every excluded security increases idiosyncratic risk. Excluding entire sectors (energy, defense) removes natural portfolio hedges against geopolitical and inflation shocks — exactly what happened in 2022.\n\n**2. ESG ratings are unreliable:**\nThe low inter-agency correlation (avg. 0.61) discussed in Lesson 2 means ESG scores may not accurately measure what they claim. A fund labeled ESG could hold substantially different risk exposures than investors expect.\n\n**3. Higher costs:**\nActive ESG funds charge average expense ratios of 0.3–0.6%, vs. 0.03–0.1% for passive index funds. Over 30 years, this fee drag can compound to substantial underperformance even if gross returns are identical.\n\n**4. Engagement vs. divestment paradox:**\nWhen ESG investors divest from 'bad' companies, they simply transfer shares to non-ESG investors at a slight discount. The company raises no new capital and faces no direct financial consequence. Some argue staying invested and voting at shareholder meetings (engagement) produces more real-world change.\n\n**5. Political backlash (ESG backlash in the US):**\nSeveral US states (Texas, Florida) have passed laws restricting state pension fund ESG investing, arguing it violates fiduciary duty to maximize returns. This creates regulatory and career risk for ESG advocates.",
          highlight: ["diversification", "exclusion cost", "fee drag", "engagement vs. divestment", "fiduciary duty"],
        },
        {
          type: "quiz-mc",
          question:
            "Many ESG funds significantly underperformed the S&P 500 in 2022. What was the primary driver of this underperformance?",
          options: [
            "ESG funds were underweight energy stocks, which surged due to the Russia-Ukraine war",
            "ESG companies reported worse earnings than expected across all sectors",
            "ESG fund managers made poor stock selections within each sector",
            "Interest rate rises uniquely hurt high-ESG companies more than others",
          ],
          correctIndex: 0,
          explanation:
            "The Russia-Ukraine war drove massive outperformance in energy (oil, gas, coal) and defense sectors in 2022. Most ESG funds exclude or underweight these sectors. As the S&P 500 Energy sector gained ~65% that year, ESG funds missed the rally. This was a structural issue with exclusion-based strategies, not individual stock-picking. It highlighted the diversification cost of ESG exclusions.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "When ESG investors divest from a polluting company, the company must immediately reduce operations because it loses access to capital.",
          correct: false,
          explanation:
            "False. Secondary market divestment simply transfers existing shares to other investors — the company receives no new cash and faces no direct operational constraint. The main mechanism through which divestment affects companies is reputational pressure, potential increases in cost of capital (if widespread), and exclusion from ESG-linked index products. Direct impact is strongest when combined with shareholder engagement, proxy voting, and primary market exclusion (refusing to participate in new share issuances).",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: ESG in Practice ────────────────────────────────────────────────
    {
      id: "esg-5",
      title: "🛠️ ESG in Practice",
      description:
        "Read fund prospectuses, understand key metrics, navigate EU regulations, and build an ESG portfolio",
      icon: "ShieldCheck",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Reading an ESG Fund Prospectus",
          content:
            "When evaluating any ESG fund, the **prospectus and Statement of Additional Information (SAI)** contain the legally binding methodology. Key sections to examine:\n\n**1. ESG Methodology Description:**\n- Does the fund use exclusions, ESG integration, best-in-class, or thematic approach?\n- Which ESG data providers does it rely on (MSCI, Sustainalytics, in-house)?\n- Are ESG criteria binding (hard screens) or advisory (soft tilts)?\n\n**2. Exclusion List:**\n- Specific sectors and revenue thresholds excluded\n- How are controversial weapons defined (e.g., does it exclude all defense or only cluster munitions)?\n\n**3. Engagement Policy:**\n- Does the fund actively vote proxies in line with ESG principles?\n- Does it file shareholder resolutions or engage in direct management dialogue?\n- Passive stewardship (voting) vs. active engagement makes a meaningful difference in real-world impact\n\n**4. ESG Reporting and Transparency:**\n- Does the fund publish annual ESG impact reports?\n- Does it disclose portfolio carbon footprint, weighted average ESG scores?\n- EU funds must now disclose under SFDR — look for Article 8 or Article 9 classification\n\n**5. Fee Structure:**\n- Compare expense ratio to non-ESG equivalent — is the ESG premium justified?\n\n**Red flags:** Vague language ('considers ESG factors'), no binding exclusions, no engagement policy, no third-party data provider disclosed.",
          highlight: ["prospectus", "exclusion list", "engagement policy", "SFDR", "Article 8", "Article 9", "proxy voting"],
        },
        {
          type: "teach",
          title: "Key ESG Metrics to Know",
          content:
            "Beyond rating scores, sophisticated ESG investors look at **raw metric data** for more precise analysis:\n\n**Environmental Metrics:**\n- **Carbon Intensity:** Scope 1+2 CO2-equivalent emissions per $1M of revenue (tCO2e/$M revenue). Enables comparison across company sizes. Example: Company A emits 85 tCO2e/$M vs. sector average 120 → 29% below average.\n- **Scope 1:** Direct emissions (company-owned sources, company vehicles)\n- **Scope 2:** Indirect — purchased electricity and heat\n- **Scope 3:** All other indirect emissions (supply chain, product use, end-of-life). Often 70–90% of total footprint but hardest to measure.\n- **Water Withdrawal Intensity:** Cubic meters of water withdrawn per unit of production. Critical for beverage, semiconductor, agriculture companies.\n\n**Social Metrics:**\n- **Board Gender Diversity %:** Share of female board directors. MSCI finds companies with 3+ female directors outperform on governance metrics.\n- **CEO Pay Ratio:** CEO total compensation ÷ median employee pay. US companies must disclose since 2018 (Dodd-Frank).\n- **Lost Time Injury Rate (LTIR):** Safety metric — incidents per 200,000 employee hours.\n\n**Governance Metrics:**\n- **Board Independence %:** Share of independent non-executive directors\n- **Audit Quality Score:** Auditor tenure, non-audit fee ratio, restatement history",
          highlight: ["carbon intensity", "Scope 1", "Scope 2", "Scope 3", "water intensity", "board diversity", "CEO pay ratio"],
        },
        {
          type: "teach",
          title: "EU Taxonomy, SFDR, and Global Regulations",
          content:
            "Regulation is rapidly reshaping ESG disclosure standards — especially in Europe:\n\n**EU Taxonomy for Sustainable Activities:**\nA classification system defining which economic activities qualify as 'environmentally sustainable.' Activities must:\n1. Make a substantial contribution to one of 6 environmental objectives (climate mitigation, adaptation, water, circular economy, pollution prevention, biodiversity)\n2. Do No Significant Harm (DNSH) to the other five\n3. Meet minimum social safeguards\n\nCompanies in the EU must disclose what % of revenue, capex, and opex is Taxonomy-aligned.\n\n**SFDR (Sustainable Finance Disclosure Regulation) — EU, effective 2021:**\nRequires financial product ESG disclosures at three levels:\n- **Article 6:** No sustainability integration claims — standard products\n- **Article 8:** Products that 'promote' environmental or social characteristics\n- **Article 9:** Products with a specific sustainable investment objective (impact funds)\n\nArticle 8 and 9 products face strict disclosure requirements; greenwashing Article 9 funds to Article 8 has been common ('SFDR downgrade').\n\n**US SEC Climate Disclosure Rule (2024):**\nRequires large public companies to disclose Scope 1 and 2 emissions, material climate risks, and climate-related governance processes in annual reports.\n\n**ISSB (International Sustainability Standards Board):**\nGlobal baseline standards for climate-related (IFRS S2) and sustainability (IFRS S1) disclosures — adopted in Australia, Canada, UK, and many emerging markets.",
          highlight: ["EU Taxonomy", "SFDR", "Article 6", "Article 8", "Article 9", "ISSB", "SEC climate disclosure", "Do No Significant Harm"],
        },
        {
          type: "quiz-mc",
          question:
            "A manufacturing company emits 500,000 metric tons of CO2 per year and generates $800M in revenue. What is its carbon intensity?",
          options: [
            "625 tCO2e per $1M revenue — calculated as 500,000 ÷ 800",
            "500,000 tCO2e per $1M revenue — using total emissions as the metric",
            "0.0016 — revenue per ton of emissions",
            "62.5 tCO2e per $1M revenue — divided by 10 for unit conversion",
          ],
          correctIndex: 0,
          explanation:
            "Carbon intensity = Total emissions ÷ Revenue in $M = 500,000 tCO2e ÷ 800 = 625 tCO2e per $1M revenue. This normalizes emissions by economic output, enabling fair comparisons between companies of different sizes. A company with high absolute emissions but very high revenue may have lower carbon intensity than a smaller competitor.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "An investor wants to build an ESG portfolio with broad market diversification but also a meaningful overweight to the clean energy transition. Which combination makes most sense?",
          options: [
            "A broad ESG integration ETF (core) + a clean energy thematic ETF (satellite tilt)",
            "100% allocation to a single clean energy ETF for maximum impact",
            "Exclusion-only fund (no fossil fuels) as the sole holding",
            "Invest only in individual ESG-rated bonds, avoiding equities entirely",
          ],
          correctIndex: 0,
          explanation:
            "A core-satellite approach balances diversification with conviction. The broad ESG integration ETF provides market-like returns with ESG risk management across all sectors. The clean energy satellite provides targeted thematic exposure. This avoids concentration risk while aligning the portfolio with sustainability themes. Putting 100% in a thematic ETF creates sector-specific risk (as seen with clean energy funds in 2022 rate rises).",
          difficulty: 3,
        },
      ],
    },
  ],
};
