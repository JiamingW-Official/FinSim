import type { Unit } from "./types";

export const UNIT_IMPACT_INVESTING: Unit = {
  id: "impact-investing",
  title: "Impact Investing & Sustainable Finance",
  description:
    "Master the full sustainable finance spectrum — from philanthropy to impact-first capital, ESG frameworks, green bonds, impact measurement, and the ongoing performance debate",
  icon: "",
  color: "#059669",
  lessons: [
    // ─── Lesson 1: Sustainable Finance Spectrum ──────────────────────────────────
    {
      id: "impact-investing-1",
      title: "The Sustainable Finance Spectrum",
      description:
        "Map the full continuum from philanthropy to ESG integration, and understand the GIIN definition of impact investing",
      icon: "BookOpen",
      xpReward: 60,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "A Spectrum, Not a Binary Choice",
          content:
            "Sustainable finance is not a single strategy — it is a **spectrum of approaches** that blend financial return with social or environmental intent. Understanding where each approach sits helps investors choose the right tool for their goals.\n\nFrom left (pure impact) to right (pure return), the spectrum runs:\n\n**1. Philanthropy:** Capital deployed with zero expectation of financial return. Grants to nonprofits, charitable foundations. Measured purely by social outcomes.\n\n**2. Impact-First Investing (Concessionary):** Below-market returns accepted in exchange for outsized social/environmental impact. Example: a community development loan at 2% to fund affordable housing in a low-income neighbourhood.\n\n**3. Impact Investing (Market-Rate):** Competitive financial returns alongside measurable positive outcomes. Example: a clean energy infrastructure fund targeting 8–10% IRR while generating GW of renewable capacity.\n\n**4. ESG Integration:** Mainstream investing that incorporates Environmental, Social, and Governance factors as financially material risk inputs. No explicit impact target — but risk-adjusted returns improve by avoiding ESG-related landmines.\n\n**5. Exclusionary Screening:** Remove specific sectors (tobacco, coal, weapons) from an otherwise conventional portfolio. Values-driven but no active positive mission.\n\n**6. Best-in-Class:** Hold the top ESG performers within each sector. Oil companies can appear if they score best on ESG metrics relative to peers.\n\n**7. Conventional Investing:** Pure risk-return optimization with no ESG factor consideration.",
          highlight: [
            "sustainable finance spectrum",
            "philanthropy",
            "impact-first",
            "ESG integration",
            "exclusionary screening",
            "best-in-class",
          ],
        },
        {
          type: "teach",
          title: "GIIN Definition and the Four Core Characteristics",
          content:
            "The **Global Impact Investing Network (GIIN)**, founded in 2009, is the primary industry body for impact investing. Its widely-adopted definition requires four characteristics:\n\n**1. Intentionality:** The investor must *intend* to generate positive social or environmental impact — not merely accept it as a side effect. An accidental positive outcome does not qualify.\n\n**2. Return Expectation:** Impact investments expect a financial return on capital, ranging from below-market (concessionary) to risk-adjusted market rate. Pure philanthropy is outside scope.\n\n**3. Range of Asset Classes:** Impact investing spans public equity, private equity, private debt, real assets, and green bonds. It is not limited to venture capital or developing markets.\n\n**4. Impact Measurement:** The investor commits to measuring and reporting on social/environmental performance. Without measurement, there is no accountability — a key distinction from ESG integration.\n\n**GIIN Market Size:** The GIIN's 2023 survey estimated the global impact investing market at approximately **$1.164 trillion** in assets under management, up from $502 billion in 2019. While large in absolute terms, this remains under 1% of global assets under management.\n\n**Who invests in impact?** Development Finance Institutions (DFIs) like the IFC, CDC Group, and DEG hold the largest shares. Private foundations (Ford, Gates, MacArthur), pension funds, and family offices make up a growing share. Retail products (impact ETFs, green bonds) are the fastest-growing segment.",
          highlight: [
            "GIIN",
            "intentionality",
            "return expectation",
            "impact measurement",
            "Development Finance Institutions",
            "$1.164 trillion",
          ],
        },
        {
          type: "teach",
          title: "Exclusionary Screening vs. Best-in-Class vs. ESG Integration",
          content:
            "Three common strategies that are often confused but differ meaningfully in construction and outcomes:\n\n**Exclusionary (Negative) Screening:**\n- Remove companies or sectors that fail ethical or ESG criteria\n- Binary: include or exclude based on revenue thresholds (e.g., >5% coal revenue → out)\n- Pros: Simple, values-aligned, avoids reputational risk\n- Cons: Reduces investable universe, may harm diversification, companies face no direct consequence\n- Example: A pension fund removes all tobacco stocks from its global equity portfolio\n\n**Best-in-Class (Positive Screening):**\n- Hold the highest-ESG-scoring companies within each sector\n- Preserves full sector diversification — an oil major with industry-leading emissions management qualifies\n- Rationale: Rewards leaders, incentivises sector-wide improvement\n- Example: MSCI World ESG Leaders Index selects top 50% ESG scorers per sector\n\n**ESG Integration:**\n- Embed ESG data into fundamental analysis and DCF/valuation models\n- Adjust discount rates, revenue forecasts, cost structures based on ESG risk exposure\n- Does not necessarily exclude any sector or company\n- Example: BlackRock tilts portfolio weights toward companies with high governance scores, treating poor governance as a valuation risk factor\n\n**Key insight:** These three can co-exist in a single portfolio — you can apply a hard exclusion list, then use best-in-class for remaining stocks, and overlay ESG integration signals on top.",
          highlight: [
            "exclusionary screening",
            "best-in-class",
            "ESG integration",
            "revenue thresholds",
            "sector diversification",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A pension fund manager says: 'We include ESG risk factors in our discounted cash flow models and adjust our discount rates for high-carbon companies, but we do not exclude any sectors.' Which sustainable finance approach does this describe?",
          options: [
            "ESG Integration — ESG data is used as a risk input in valuation without sector exclusions",
            "Impact-First Investing — below-market returns accepted for carbon reduction",
            "Exclusionary Screening — high-carbon companies are penalised and removed",
            "Best-in-Class — only the top ESG performers in each sector are held",
          ],
          correctIndex: 0,
          explanation:
            "ESG Integration embeds ESG factors into financial valuation models without requiring exclusions. Adjusting discount rates for carbon risk while retaining all sectors is the defining feature. Exclusionary screening would remove the high-carbon companies entirely, which this manager explicitly does not do.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "According to the GIIN definition, an investment that accidentally generates positive environmental outcomes qualifies as an impact investment.",
          correct: false,
          explanation:
            "False. Intentionality is the first and most critical of the four GIIN characteristics. The investor must deliberately intend to generate positive social or environmental outcomes — accidental side effects do not qualify. Without intentionality, any company that happens to sell a useful product could be called an impact investment, which would make the concept meaningless.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: ESG Framework ──────────────────────────────────────────────────
    {
      id: "impact-investing-2",
      title: "The ESG Framework",
      description:
        "Deep-dive into E/S/G pillars, materiality standards (SASB/GRI), double materiality, and why rating agencies disagree",
      icon: "Layers",
      xpReward: 70,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Three Pillars in Depth",
          content:
            "**Environmental (E):** Measures a company's interaction with the natural world.\n- **Climate:** Scope 1 (direct), Scope 2 (purchased electricity), Scope 3 (supply chain + product use) greenhouse gas emissions; net-zero alignment\n- **Resource use:** Water withdrawal intensity, raw material sourcing, biodiversity impact\n- **Pollution:** Air quality, toxic waste disposal, plastic output\n- **Physical risk:** Exposure of assets to floods, wildfires, sea-level rise\n- **Transition risk:** Regulatory carbon pricing, stranded asset risk, green technology disruption\n\n**Social (S):** Manages relationships with people — employees, communities, customers.\n- **Labour:** Living wages, safety (lost-time injury rate), collective bargaining, forced labour in supply chains\n- **Diversity, Equity & Inclusion (DEI):** Board and workforce gender and ethnicity metrics, pay gap analysis\n- **Customer & product:** Data privacy, product safety, responsible marketing, financial inclusion\n- **Community:** Local economic impact, Indigenous peoples' rights, political contributions\n\n**Governance (G):** How the company is controlled and held accountable.\n- **Board:** Independence %, diversity, skill mix, director overboarding\n- **Incentives:** Executive pay structure, long-term performance linkage, pay ratio\n- **Transparency:** Audit quality, related-party transactions, lobbying disclosure\n- **Shareholder rights:** Voting structure (dual-class shares), anti-takeover provisions, activist access\n- **Ethics:** Anti-corruption, whistleblower policies, tax transparency\n\nGovernance is often cited as the most financially actionable pillar — weak governance predates most major accounting scandals.",
          highlight: [
            "Scope 1",
            "Scope 2",
            "Scope 3",
            "transition risk",
            "physical risk",
            "board independence",
            "ESG pillars",
          ],
        },
        {
          type: "teach",
          title: "Materiality: SASB, GRI, and the Two Standards",
          content:
            "Not all ESG issues are equally important for every company. **Materiality** determines which ESG factors are financially or socially significant for a given company.\n\n**SASB (Sustainability Accounting Standards Board):**\n- Industry-specific standards for 77 sectors\n- Focuses on **single (financial) materiality** — which ESG topics are likely to affect a company's financial performance\n- Example: For airlines, SASB considers fuel efficiency and labour relations material; biodiversity is not\n- Now part of the IFRS Foundation (merged to form the ISSB)\n\n**GRI (Global Reporting Initiative):**\n- The most widely used global sustainability reporting standard (used by 75%+ of G250 companies)\n- Focuses on **impact materiality** — which ESG topics represent the company's significant *impacts on the world*, regardless of financial effect\n- A mining company must report its impact on community water supplies even if that impact never affects the stock price\n- GRI's audience: civil society, NGOs, affected communities — not just investors\n\n**Key difference:**\n- SASB: *How does the world affect the company's finances?*\n- GRI: *How does the company affect the world?*\n\n**Double Materiality (EU standard):**\nThe EU's CSRD (Corporate Sustainability Reporting Directive) requires companies to report on **both** dimensions simultaneously:\n1. Financial materiality (inside-out): ESG risks to the company's performance\n2. Impact materiality (outside-in): Company's impacts on people and environment\n\nDouble materiality is now the reporting standard for ~50,000 European companies.",
          highlight: [
            "SASB",
            "GRI",
            "single materiality",
            "impact materiality",
            "double materiality",
            "CSRD",
            "77 sectors",
          ],
        },
        {
          type: "teach",
          title: "ESG Rating Disagreement: Why Agencies Diverge",
          content:
            "One of the most surprising findings in ESG research is how little agreement exists between major ESG rating agencies.\n\n**Empirical finding:** A landmark 2019 MIT Sloan study (Berg, Kölbel, Rigobon) measured pairwise correlation across six major ESG agencies and found an average correlation of only **0.54–0.61** — compared to a 0.99 correlation between Moody's and S&P credit ratings.\n\n**Three root causes of divergence:**\n\n**1. Scope Divergence:** What gets measured\n- Agency A tracks 300 indicators; Agency B tracks 80 different indicators\n- A company may perform well on indicators one agency tracks but poorly on those another uses\n- Example: MSCI tracks 37 ESG key issues; Sustainalytics covers different indicator sets\n\n**2. Measurement Divergence:** How indicators are quantified\n- Carbon intensity measured per $1M revenue vs. per employee vs. per unit of output produces different company rankings\n- Same underlying data, different normalisation → different scores\n\n**3. Weight Divergence:** How much each factor counts\n- Agency A may weight governance at 40%; Agency B at 15%\n- A company with poor environmental but excellent governance will score very differently\n\n**Real-world example:** Tesla has ranged from CCC to AAA on MSCI in different periods; Sustainalytics consistently rates it 'High Risk' due to governance concerns (CEO dual role, board composition). Neither rating is objectively wrong — they reflect different methodological choices.\n\n**Investor implication:** Never rely on a single ESG rating. Triangulate across multiple providers, or examine the underlying raw data metrics directly.",
          highlight: [
            "rating divergence",
            "correlation 0.54",
            "scope divergence",
            "measurement divergence",
            "weight divergence",
            "Tesla ESG",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "SASB and GRI take different approaches to materiality. A food company is assessing whether to report its impact on farmers' livelihoods in its supply chain. Under which standard would this most clearly be required?",
          options: [
            "GRI — because GRI focuses on the company's impacts on the world, including communities and supply chain workers",
            "SASB — because supply chain issues are financially material for food companies",
            "Both standards require identical supply chain disclosures",
            "Neither — farmer livelihoods are a political issue, not an ESG reporting item",
          ],
          correctIndex: 0,
          explanation:
            "GRI focuses on impact materiality — what impacts does the company have on the world, regardless of financial effect. Reporting on impacts to farmers' livelihoods in the supply chain is clearly within GRI's scope. SASB may also consider supply chain labour material if it poses financial risk (reputational, regulatory), but GRI would require this disclosure more broadly even if the financial impact is minimal.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The EU's double materiality standard requires companies to report only on ESG risks that could affect their own financial performance.",
          correct: false,
          explanation:
            "False. Double materiality requires reporting on both dimensions: (1) financial materiality — how ESG factors affect the company's financial performance, AND (2) impact materiality — how the company's activities affect people and the environment. Single materiality (financial only) is the SASB/IFRS approach. The EU CSRD mandates both, making it more demanding than either standard alone.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Impact Measurement ────────────────────────────────────────────
    {
      id: "impact-investing-3",
      title: "Impact Measurement",
      description:
        "Master IRIS+ metrics, SROI, SDG alignment, additionality, attribution challenges, and theory of change",
      icon: "BarChart2",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "IRIS+ and Standardised Impact Metrics",
          content:
            "Measuring impact is far harder than measuring financial returns. The industry has converged on a common taxonomy:\n\n**IRIS+ (Impact Reporting and Investment Standards):**\nManaged by the GIIN, IRIS+ is the globally recognised system for measuring, managing, and optimising impact. It functions like GAAP for impact — a shared language.\n\nKey features:\n- **Thematic taxonomy:** 18 impact themes (agriculture, education, energy, financial inclusion, health, housing, water, etc.)\n- **Standardised metrics:** Each theme has defined metrics with consistent calculation methodology\n- Example metrics: 'PI7555 — Number of individuals who received financial services', 'PI3716 — Total renewable energy generated (MWh)'\n- **Core Metrics Sets:** Curated short lists of the most important metrics per theme (makes reporting practical)\n- **SDG alignment tags:** Each IRIS+ metric is tagged to relevant UN Sustainable Development Goals\n\n**Other widely used frameworks:**\n- **B Impact Assessment (B Lab):** Scores companies on governance, workers, community, environment, customers (max 200 points; 80+ qualifies for B Corp certification)\n- **IFC Operating Principles for Impact Management:** 9 principles adopted by 140+ DFIs and fund managers\n- **SFDR Principal Adverse Impacts (PAIs):** 14 mandatory + 31 optional disclosure indicators for EU funds",
          highlight: [
            "IRIS+",
            "GIIN",
            "standardised metrics",
            "SDG alignment",
            "B Corp",
            "IFC Operating Principles",
            "PAIs",
          ],
        },
        {
          type: "teach",
          title: "SROI, SDG Alignment, and Theory of Change",
          content:
            "**Social Return on Investment (SROI):**\nA framework for quantifying social value created relative to investment cost.\n\n- Formula: SROI = Net Present Value of Social Value / Total Investment\n- Example: A job training program costs $500,000 and creates $2.1M NPV of social value (via participant earnings increase, reduced government benefits, health improvements) → SROI = 4.2:1\n- **Proxies are required:** Social value is estimated using financial proxies. A quality-adjusted life year (QALY) might be valued at $50,000; access to clean water per household at $1,200/year.\n- **Limitation:** Highly sensitive to proxy choices. SROI can be manipulated by selecting generous proxies.\n\n**SDG Alignment:**\nThe UN's 17 Sustainable Development Goals and 169 targets provide a universal framework for categorising impact intent. Common investor alignments:\n- SDG 7 (Affordable Clean Energy) → renewable energy investments\n- SDG 1 (No Poverty) → microfinance, financial inclusion\n- SDG 11 (Sustainable Cities) → affordable housing, public transit\n- SDG 13 (Climate Action) → carbon removal, climate adaptation\n\n**Theory of Change (ToC):**\nA causal chain mapping from *inputs* → *activities* → *outputs* → *outcomes* → *impact*.\n- Inputs: Capital deployed, staff time\n- Activities: What the organisation does (e.g., provide microloans)\n- Outputs: Direct, measurable results (e.g., 3,500 loans disbursed)\n- Outcomes: Short/medium-term changes (e.g., 78% of borrowers report income increase)\n- Impact: Long-term change in the world (e.g., 1,200 households lifted above poverty line)\n\nTheory of Change forces impact investors to be explicit about the causal logic connecting capital to outcomes.",
          highlight: [
            "SROI",
            "Social Return on Investment",
            "SDG alignment",
            "theory of change",
            "inputs outputs outcomes",
            "QALY",
          ],
        },
        {
          type: "teach",
          title: "Additionality and the Attribution Challenge",
          content:
            "Two concepts separate genuine impact from 'impact washing':\n\n**Additionality:**\nThe impact would **not have occurred without this specific investment**. It is the counterfactual test.\n\nStrong additionality:\n- Providing capital to a startup in a market with no other investors (frontier markets, underserved communities)\n- First-loss capital enabling other investors to enter by absorbing downside risk\n- Patient capital with a 15-year horizon that commercial banks would not provide\n\nWeak additionality:\n- Buying shares of a large-cap green energy company in a liquid public market. The company would have raised that capital regardless — your secondary market purchase changes nothing operationally.\n- This is why many impact purists argue that only *primary market* investments (new capital directly to the company or project) generate additionality.\n\n**The Attribution Challenge:**\nEven when impact occurs, how much is attributable to the specific investment?\n\n- A microfinance borrower's income doubles. Was that the loan? The economic cycle? Her own skills? A new infrastructure project in her village?\n- Randomised Controlled Trials (RCTs) are the gold standard for attribution (like clinical trials for medicine) but are expensive, slow, and often impractical\n- Most impact investors use **control groups, before/after comparisons, or contribution narratives** instead of strict attribution\n\n**Contribution vs. causation:** Many practitioners use the language of 'contribution to change' rather than claiming direct causation — a more honest framing that acknowledges the complexity of social outcomes.",
          highlight: [
            "additionality",
            "counterfactual",
            "primary market",
            "attribution challenge",
            "RCT",
            "contribution narrative",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An impact fund manager claims that buying 10,000 shares of Tesla on the Nasdaq generates climate impact because Tesla makes electric vehicles. What is the primary impact investing critique of this claim?",
          options: [
            "It fails the additionality test — the shares were already issued and Tesla receives no new capital from secondary market trades",
            "Electric vehicles have no measurable environmental benefit",
            "The fund should have used GRI reporting standards before making the claim",
            "The investment fails the GIIN's return expectation requirement",
          ],
          correctIndex: 0,
          explanation:
            "Additionality requires that the impact would not have occurred without the specific investment. Buying existing shares on a secondary market does not provide Tesla with new capital to build more factories or develop more EVs. Tesla's operations are unaffected by this trade. Genuine additionality in this context would require participating in a new share offering or providing direct project financing. This is the core critique of 'impact washing' via liquid public equity purchases.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A Randomised Controlled Trial (RCT) is the standard method used by most impact investors to attribute social outcomes to their investments.",
          correct: false,
          explanation:
            "False. While RCTs are the methodological gold standard for attributing outcomes (like clinical trials in medicine), they are expensive, time-consuming, and often impractical in investment contexts. Most impact investors instead use contribution narratives, before/after comparisons, or control group benchmarks. RCTs are used in academic research and by large DFIs for evaluating development interventions, but they are not standard practice for portfolio companies.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Green & Social Bonds ──────────────────────────────────────────
    {
      id: "impact-investing-4",
      title: "Green & Social Bonds",
      description:
        "Understand ICMA Green Bond Principles, use-of-proceeds mechanics, greenwashing risk, social bonds, and sustainability-linked bonds",
      icon: "TrendingUp",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Green Bond Principles and Use of Proceeds",
          content:
            "A **green bond** is a fixed-income instrument where the proceeds are exclusively applied to finance or refinance green projects. The market grew from near-zero in 2007 to over **$2.5 trillion** in cumulative issuance by 2024.\n\n**ICMA Green Bond Principles (GBP):**\nPublished by the International Capital Market Association, the GBP are the globally recognised voluntary framework. Four core components:\n\n**1. Use of Proceeds:**\nProceeds must finance one of the recognised green project categories:\n- Renewable energy (solar, wind, hydro, tidal)\n- Energy efficiency (building retrofits, industrial processes)\n- Clean transportation (electric vehicles, rail)\n- Sustainable water management\n- Pollution prevention and control\n- Climate change adaptation\n- Green buildings (LEED/BREEAM certified)\n- Sustainable land use and forestry\n- Biodiversity conservation\n\n**2. Process for Project Evaluation and Selection:**\nIssuer must clearly communicate the environmental sustainability objectives and criteria used to determine project eligibility.\n\n**3. Management of Proceeds:**\nProceeds must be tracked — typically held in a sub-account or tracked via formal allocation tracking. Unallocated proceeds must be held in liquid instruments (cash, money market).\n\n**4. Reporting:**\nAnnual reporting on: (a) allocation of proceeds across projects, (b) environmental impact metrics (MWh generated, tCO2e avoided, litres of water saved).\n\n**Second Party Opinion (SPO):** Most issuers commission an independent reviewer (Sustainalytics, S&P, Vigeo Eiris) to verify alignment with GBP before issuance — not legally required but market-expected.",
          highlight: [
            "green bond",
            "ICMA Green Bond Principles",
            "use of proceeds",
            "Second Party Opinion",
            "$2.5 trillion",
            "renewable energy",
          ],
        },
        {
          type: "teach",
          title: "Greenwashing Risk in the Bond Market",
          content:
            "Despite the Green Bond Principles framework, the bond market has seen several high-profile greenwashing controversies:\n\n**Bond-level greenwashing patterns:**\n- **Ring-fencing without additionality:** A corporation issues a green bond to refinance an existing wind farm that was built years ago with conventional financing. No new green projects are funded — just labelling old assets.\n- **Vague use-of-proceeds:** 'General environmental improvements' or 'climate-related expenditures' without specific project lists.\n- **Transition greenwashing:** A coal company issues a 'transition bond' claiming to fund a shift to natural gas. Critics argue this is incremental improvement, not genuine green transition.\n- **Proceeds misallocation:** Issuer fails to actually ring-fence proceeds; green bond money commingles with general corporate funds.\n\n**Real examples:**\n- SolarWinds and several Spanish property developers issued green bonds where underlying assets were later found to not meet stated criteria\n- Repsol's 2017 green bond (€500M) was excluded from major green bond indices because the company's core business remained oil and gas\n\n**Protection mechanisms:**\n- Independent Second Party Opinions (SPOs) before issuance\n- Post-issuance impact reports reviewed by external verifiers\n- EU Green Bond Standard (EU GBS): Stricter standard requiring full EU Taxonomy alignment — more credible but fewer issuers qualify\n- Climate Bonds Initiative (CBI) certification: Sector-specific standards with approved verifiers",
          highlight: [
            "greenwashing",
            "ring-fencing",
            "additionality",
            "EU Green Bond Standard",
            "Climate Bonds Initiative",
            "Second Party Opinion",
          ],
        },
        {
          type: "teach",
          title: "Social Bonds and Sustainability-Linked Bonds",
          content:
            "Beyond green bonds, two other labelled bond structures have grown significantly:\n\n**Social Bonds:**\nProceeds finance projects with positive social outcomes. ICMA Social Bond Principles mirror the GBP structure but focus on social project categories:\n- Affordable housing\n- Access to essential services (healthcare, education, financial services)\n- Employment generation / job retention for underserved communities\n- Food security and sustainable food systems\n- Socioeconomic advancement for vulnerable populations\n\nIssuance surged in 2020 as governments and development banks issued COVID-19 social bonds to finance healthcare and economic relief.\n\n**Sustainability Bonds:** Combine green and social use-of-proceeds in a single instrument.\n\n---\n\n**Sustainability-Linked Bonds (SLBs):**\nA fundamentally different structure — **proceeds are general purpose** but the coupon or principal is tied to the issuer achieving specific Sustainability Performance Targets (SPTs).\n\nMechanism:\n- Issuer sets Key Performance Indicators (KPIs) — e.g., 'Reduce Scope 1+2 emissions by 30% by 2030'\n- If KPIs are missed, the coupon increases by a penalty step-up (typically 25–50 bps)\n- Investors bear coupon risk in exchange for alignment with the issuer's sustainability trajectory\n\nKey distinction from green bonds: SLBs do not restrict use of proceeds. An oil company can issue an SLB for general corporate purposes, with the coupon tied to an emissions reduction target.\n\n**Criticism:** Penalty step-ups are often too small to genuinely incentivise behaviour change. Targets set too conservatively ('below business as usual') also diminish credibility.",
          highlight: [
            "social bonds",
            "Social Bond Principles",
            "Sustainability-Linked Bonds",
            "SLB",
            "KPI",
            "step-up coupon",
            "Sustainability Performance Targets",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Company X issues a $500M bond and labels it a 'Green Bond.' The proceeds will refinance an existing coal plant that is being converted to natural gas. No new renewable energy projects will be funded. Which issue does this raise?",
          options: [
            "Greenwashing — the proceeds fund a fossil fuel asset with no clear additionality for genuinely green projects",
            "This is an acceptable green bond because natural gas emits less CO2 than coal",
            "The bond is non-compliant only if it lacks a Second Party Opinion",
            "There is no issue — refinancing existing projects is explicitly permitted under the Green Bond Principles",
          ],
          correctIndex: 0,
          explanation:
            "While the GBP technically allows refinancing of existing projects, a coal-to-gas conversion is controversial and unlikely to qualify under rigorous standards like the EU Green Bond Standard or Climate Bonds Initiative certification. Natural gas is not in the GBP's eligible use-of-proceeds categories for clean energy, and this is a clear transition greenwashing scenario. Genuine green bonds fund renewable energy or deep efficiency upgrades, not fossil fuel infrastructure.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Which key feature distinguishes a Sustainability-Linked Bond (SLB) from a standard Green Bond?",
          options: [
            "SLBs do not restrict use of proceeds — instead, the coupon is adjusted if the issuer misses sustainability KPI targets",
            "SLBs must only fund renewable energy projects, while green bonds fund any environmental project",
            "SLBs have no Second Party Opinion requirement, while green bonds require one by law",
            "SLBs pay a lower fixed coupon than green bonds because of the sustainability premium",
          ],
          correctIndex: 0,
          explanation:
            "The defining feature of SLBs is general-purpose proceeds combined with coupon step-up/step-down mechanics tied to Sustainability Performance Targets. A company can use SLB proceeds for working capital, acquisitions, or debt refinancing — the sustainability linkage is in the financial terms, not the use of funds. Green bonds, by contrast, require specific use-of-proceeds for eligible green projects.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Impact by Asset Class ─────────────────────────────────────────
    {
      id: "impact-investing-5",
      title: "Impact by Asset Class",
      description:
        "How impact is expressed through public equity engagement, private impact funds, microfinance, affordable housing, and clean energy infrastructure",
      icon: "ShieldCheck",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Public Equity: Engagement and Stewardship",
          content:
            "Public equity is the largest asset class by market capitalisation but arguably the hardest to use for direct impact — investors buy existing shares, providing no new capital to companies.\n\n**How public equity investors generate impact:**\n\n**1. Shareholder Engagement:**\n- Direct dialogue with management and boards on ESG improvements\n- Filing shareholder resolutions requiring disclosure or policy changes\n- Coordinated engagement via initiatives: Climate Action 100+ (represents $68T in AUM), PRI Collaborative Engagement, IIGCC\n- Example: Engine No. 1, a tiny activist fund, won three board seats at ExxonMobil in 2021 by rallying large institutional shareholders around a climate transition plan\n\n**2. Proxy Voting:**\n- Institutional investors vote at AGMs on resolutions covering executive pay, board composition, climate strategy, political lobbying disclosure\n- 'Say on Climate' votes require companies to present and defend their climate transition plans annually\n- Asset managers publish proxy voting guidelines — check if stated ESG values align with actual voting record\n\n**3. Capital Allocation Signals:**\n- Large institutional divestment campaigns can raise a company's cost of capital over time\n- ESG inclusion/exclusion in major indices affects passive fund flows significantly\n- Being excluded from the S&P 500 ESG Index or MSCI ESG Leaders has reputational and capital allocation consequences\n\n**Limitation:** Public equity impact relies on indirect mechanisms. Without meaningful engagement, simply holding ESG-screened stocks in a passive fund creates minimal direct impact.",
          highlight: [
            "shareholder engagement",
            "proxy voting",
            "Climate Action 100+",
            "Engine No. 1",
            "divestment",
            "Say on Climate",
          ],
        },
        {
          type: "teach",
          title: "Private Markets: PE Impact Funds and Microfinance",
          content:
            "Private markets offer stronger additionality because capital goes directly to businesses and projects.\n\n**Private Equity Impact Funds:**\n- Invest directly in companies at growth stage with explicit social/environmental mandates\n- Example sectors: clean technology, healthcare access, education technology, sustainable agriculture\n- Major managers: TPG Rise Fund (Bono co-founded), Leapfrog Investments (financial inclusion), Bridges Fund Management (UK social impact)\n- **Impact thesis:** Investment value creation is tied to the underlying social/environmental outcome\n- Return profile: Similar to conventional PE (10–20% target IRR) but with measurable impact metrics reported quarterly\n- **Co-investment with DFIs:** Development Finance Institutions (IFC, FMO, Proparco) often anchor private impact funds with first-loss or concessionary tranches to attract commercial co-investors\n\n**Microfinance:**\n- Provides small loans, savings, and insurance to low-income borrowers excluded from formal banking\n- Pioneered by Grameen Bank (Bangladesh, Muhammad Yunus, 1983) — Nobel Peace Prize 2006\n- Global market: ~$165 billion in microloan portfolios (2023), reaching 140+ million borrowers\n- **Investment vehicles:** Microfinance Investment Vehicles (MIVs) — pooled debt funds lending to Microfinance Institutions (MFIs)\n- **Returns:** 3–6% net for senior debt MIVs; lower correlation with public markets\n- **Controversy:** High interest rates (20–40% in many markets, reflecting high operational cost of small-ticket lending); over-indebtedness crises (India 2010, Bosnia 2009)\n- **Financial inclusion lens:** Microsavings, microinsurance, and mobile money (M-Pesa) now complement microlending",
          highlight: [
            "private equity impact",
            "TPG Rise Fund",
            "Leapfrog",
            "microfinance",
            "Grameen Bank",
            "MIVs",
            "DFIs",
            "financial inclusion",
          ],
        },
        {
          type: "teach",
          title: "Affordable Housing and Clean Energy Infrastructure",
          content:
            "Two asset classes where impact and financial returns have proven most complementary:\n\n**Affordable Housing:**\n- In the US, the Low Income Housing Tax Credit (LIHTC) programme is the primary vehicle — federal tax credits allocated to states, syndicated through funds to developers\n- LIHTC has financed ~3.5 million affordable housing units since 1987; typical fund returns of 5–8% post-tax\n- Community Development Finance Institutions (CDFIs) — specialised lenders providing below-market debt to affordable housing developers in underserved areas\n- **Social impact bond (SIB):** Government pays for outcomes; private investors fund upfront. Example: Peterborough Prison SIB (UK, 2010) — investors funded prisoner rehabilitation; government repaid if reoffending fell by >7.5%.\n- Impact: addresses SDG 11 (Sustainable Cities), reduces homelessness, improves health outcomes\n\n**Clean Energy Infrastructure:**\n- Solar, wind, hydro, and battery storage projects — typically financed through infrastructure funds or project finance structures\n- Long-term contracted revenues (Power Purchase Agreements, PPAs, 10–25 years) provide stable cash flows\n- Returns: 6–10% target IRR for operational assets; higher for development-stage assets\n- Institutional appetite: Pension funds, insurance companies, sovereign wealth funds drawn by inflation-linked returns and long duration matching liabilities\n- **Development Finance:** DFIs provide first-loss or subordinated debt to crowd in private capital in higher-risk markets (Sub-Saharan Africa, South and Southeast Asia)\n- Impact: Each GW of solar displaces ~1.5 million metric tons of CO2 equivalent annually (vs coal)",
          highlight: [
            "affordable housing",
            "LIHTC",
            "CDFI",
            "social impact bond",
            "clean energy infrastructure",
            "PPA",
            "project finance",
            "first-loss",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Engine No. 1, a small activist fund, successfully placed three directors on ExxonMobil's board in 2021 focused on climate transition. What impact mechanism does this represent?",
          options: [
            "Shareholder engagement — using ownership rights to influence corporate governance and strategy",
            "Exclusionary screening — the fund sold Exxon shares to signal disapproval",
            "Impact investing — Engine No. 1 is classified as an impact fund under GIIN criteria",
            "Greenwashing — the campaign was PR-driven without genuine operational change",
          ],
          correctIndex: 0,
          explanation:
            "The Engine No. 1 / ExxonMobil campaign is a landmark example of shareholder engagement — using proxy voting and shareholder coordination to influence board composition and corporate strategy. Engine No. 1 remained an investor and used ownership rights to drive change from inside. This is the opposite of divestment and demonstrates that engaged ownership can be more impactful than exiting a position.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Microfinance has a universally positive impact on borrowers and has never led to debt crises or over-indebtedness in the markets where it operates.",
          correct: false,
          explanation:
            "False. Microfinance has faced serious over-indebtedness crises — most notably in Andhra Pradesh, India in 2010 and Bosnia in 2009 — where aggressive lending by multiple competing MFIs to the same borrowers led to a wave of defaults and, in the Indian case, reported suicides among over-indebted borrowers. These crises prompted regulatory intervention and prompted the sector to develop responsible finance standards including client protection principles. Microfinance remains a valuable tool for financial inclusion but is not without risks.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: The Performance Debate ────────────────────────────────────────
    {
      id: "impact-investing-6",
      title: "The Impact Performance Debate",
      description:
        "Examine ESG alpha evidence, performance during crises, greenwashing scandals, and the long-term vs. short-term trade-off",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "ESG Alpha: What the Meta-Analyses Say",
          content:
            "The empirical evidence on whether ESG investing generates superior financial returns is more nuanced than advocates or critics claim.\n\n**Key Meta-Analyses:**\n\n**Friede, Busch & Bassen (2015):** Reviewed 2,200+ individual studies spanning 40 years. Finding: ~63% showed a positive relationship between ESG scores and corporate financial performance (CFP). Only ~10% showed negative. The relationship was strongest for governance factors and in emerging markets.\n\n**Morgan Stanley Institute for Sustainable Investing (2019):** Analysed 10,723 open-end mutual funds and ETFs from 2004–2018. Finding: Sustainable funds matched or exceeded median returns of conventional funds in 64% of time periods studied, with lower downside risk.\n\n**NYU Stern CSB Meta-Analysis (2021):** 1,000+ studies. Finding: ESG-climate focused strategies show the strongest positive performance link; social factors show the weakest and most mixed evidence.\n\n**Critical caveats:**\n- **Survivorship bias:** Underperforming ESG funds close and are removed from databases, inflating average performance metrics\n- **Publication bias:** Studies with positive ESG-performance links are more likely to be published\n- **Look-back period dependency:** ESG outperformed largely because it overweighted tech (2010–2021). Remove tech sector and the ESG advantage largely disappears\n- **Correlation vs. causation:** High ESG scores may proxy for high-quality, profitable businesses — companies that score well on ESG tend to have better management, stronger moats, and lower regulatory risk. It may be management quality driving both ESG scores and returns, not the ESG factor itself.",
          highlight: [
            "meta-analysis",
            "Friede Busch Bassen",
            "63% positive",
            "survivorship bias",
            "publication bias",
            "ESG alpha",
          ],
        },
        {
          type: "teach",
          title: "ESG During Crises and Greenwashing Scandals",
          content:
            "**ESG During Market Crises:**\n\n*COVID-19 (2020):* ESG funds outperformed significantly during the initial crash and recovery. Key reason: ESG funds were underweight energy (which cratered as lockdowns crushed oil demand) and overweight healthcare and technology (which surged). Morningstar found 75% of ESG funds ranked in the top half of their category in 2020.\n\n*Russia-Ukraine War (2022):* The opposite effect. Energy stocks (oil, gas, coal) and defence surged. ESG funds, which systematically exclude or underweight these sectors, underperformed by 5–10 percentage points vs. conventional benchmarks. Illustrated the structural cost of ESG exclusion during geopolitical crises.\n\n*Conclusion:* ESG performance is highly regime-dependent. It tends to outperform in low-inflation, tech-growth regimes and underperform in commodity super-cycles and geopolitical crises.\n\n---\n\n**Major Greenwashing Scandals:**\n\n**DWS (2021–2022):** Germany's largest asset manager faced SEC and BaFin investigations after a whistleblower alleged it overstated the ESG integration in funds managing ~$500B. DWS's former head of sustainability resigned. Led to first-ever regulatory fine for ESG misrepresentation.\n\n**Goldman Sachs Asset Management (2022):** SEC fined GSAM $4M for failing to follow its own ESG policies in several mutual funds — including inadequate ESG questionnaire completion and inconsistent screening application.\n\n**Tarpon Investimentos Brazil (2021):** Private equity firm accused of funding deforestation while marketing as ESG-aligned.\n\nThese cases established a precedent: regulators will pursue ESG greenwashing under existing securities fraud frameworks.",
          highlight: [
            "COVID ESG outperformance",
            "2022 underperformance",
            "DWS scandal",
            "Goldman GSAM",
            "greenwashing SEC",
            "regime-dependent",
          ],
        },
        {
          type: "teach",
          title: "Long-Term vs. Short-Term and the Fiduciary Debate",
          content:
            "**The Long-Term vs. Short-Term Tension:**\nMany ESG benefits are long-term structural improvements (avoided regulatory costs, better talent retention, lower cost of capital) that do not appear in quarterly earnings.\n\nShort-term market participants — hedge funds, high-frequency traders — have little incentive to price these long-run benefits. This creates **ESG mispricing** that long-term investors can potentially exploit.\n\nCounterargument: Markets are forward-looking. If ESG benefits are well-known, they are likely already priced in. The ESG premium may have already been 'harvested' as ESG assets grew from $500B to $35T+ in a decade.\n\n---\n\n**The Fiduciary Duty Debate:**\n\n**Traditional view:** Fiduciaries must maximise risk-adjusted returns for beneficiaries. Considering ESG factors that don't affect returns violates fiduciary duty.\n\n**Modern view (gaining ground):** ESG factors ARE material risks. Ignoring climate risk, governance failures, and social licence to operate is a failure of fiduciary duty. The UK Law Commission (2014) and the UN PRI's legal framework confirm that long-term ESG risk consideration is consistent with fiduciary duty.\n\n**US political backlash:** ~20 US states passed anti-ESG legislation 2022–2023, forbidding state pension funds from using ESG criteria if it imposes any financial cost. This creates legal uncertainty for US pension fund ESG investing.\n\n**European contrast:** The EU's SFDR and CSRD mandate ESG disclosure and make ESG integration a regulatory obligation for financial advisors and product manufacturers.",
          highlight: [
            "long-term vs short-term",
            "fiduciary duty",
            "ESG mispricing",
            "anti-ESG legislation",
            "SFDR",
            "CSRD",
            "UN PRI fiduciary",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A 2021 meta-analysis of 1,000+ studies found that ESG-performance relationships are strongest for which factor?",
          options: [
            "Climate and environmental strategies show the strongest performance link; social factors show the weakest",
            "Social factors (employee welfare) consistently show the strongest positive returns",
            "Governance factors always outperform environmental and social factors in all markets",
            "All three pillars show equally strong positive performance across all studies",
          ],
          correctIndex: 0,
          explanation:
            "The NYU Stern CSB 2021 meta-analysis found that ESG strategies focused on climate and environmental factors showed the strongest positive performance relationship. Social factors produced the weakest and most mixed evidence. This aligns with the intuition that climate-focused strategies overweight clean tech and underweight fossil fuels — a positioning that was financially rewarding during the 2010s low-carbon growth cycle.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A large European pension fund currently holds no fossil fuel stocks (exclusion-based ESG policy). In Q1 2022, oil prices surged 60% following the Russia-Ukraine war. The fund's equity portfolio underperformed its benchmark by 7.4 percentage points. The fund's board is now debating whether to maintain its exclusion policy.",
          question:
            "Which argument BEST supports maintaining the exclusion policy despite the 2022 underperformance?",
          options: [
            "The 2022 underperformance reflects a short-term commodity shock; the fund's long-term risk-adjusted returns and ESG mandate better serve its 30-year liability profile",
            "The fund should immediately add fossil fuel exposure to match the benchmark and maximise short-term returns",
            "The 7.4% underperformance proves ESG exclusion always destroys value and should be abandoned",
            "The fund should switch to a sustainability-linked bond portfolio to avoid equity market volatility",
          ],
          correctIndex: 0,
          explanation:
            "The core defence of long-term ESG exclusion policies is that short-term commodity cycles do not invalidate the structural risk reduction thesis. A pension fund with a 30-year liability horizon is exposed to long-run transition risk — stranded fossil fuel assets, carbon pricing, regulatory phase-outs. A single year of commodity-driven underperformance does not override decades of potential benefit from excluding high-transition-risk assets. The appropriate response is to document the short-term cost and reaffirm the long-term rationale, not to abandon the policy.",
          difficulty: 3,
        },
      ],
    },
  ],
};
