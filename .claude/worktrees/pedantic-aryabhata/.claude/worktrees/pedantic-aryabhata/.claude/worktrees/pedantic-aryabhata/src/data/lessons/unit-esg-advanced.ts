import type { Unit } from "./types";

export const UNIT_ESG_ADVANCED: Unit = {
  id: "esg-advanced",
  title: "Advanced ESG & Impact",
  description:
    "Master ESG measurement, climate finance, shareholder engagement, performance debate, and impact investing",
  icon: "Leaf",
  color: "#16a34a",
  lessons: [
    // ─── Lesson 1: ESG Measurement & Data ────────────────────────────────────────
    {
      id: "esg-adv-1",
      title: "ESG Measurement & Data",
      description:
        "Rating agency divergence, materiality frameworks, data challenges, and emissions accounting",
      icon: "BarChart2",
      xpReward: 80,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Rating Agency Divergence",
          content:
            "ESG ratings suffer from a fundamental measurement problem: the five major agencies frequently disagree — and the disagreement is larger than most investors realize.\n\n**The Big Five ESG Raters:**\n- **MSCI ESG Ratings** — CCC to AAA scale; ~14,000 companies; industry-specific materiality weights\n- **Sustainalytics** — 0–100 unmanaged risk score (lower = better); separates exposure from management quality\n- **S&P Global (DJSI)** — Annual Corporate Sustainability Assessment; selects top 10% per sector\n- **ISS ESG** — Proxy advisory heritage; strong governance focus; E/S/G pillar structure\n- **Bloomberg ESG** — Raw data-heavy; integrates into Bloomberg Terminal; 15,000+ companies\n\n**The Correlation Problem:**\nA landmark 2019 MIT Sloan study (Berg, Kölbel, Rigobon) measured cross-agency ESG rating correlations. The result: an average correlation of only **0.54** across six major providers. For context, Moody's and S&P credit ratings correlate at approximately **0.92**.\n\nThis is not a measurement error — it reflects genuine methodological differences:\n1. **Material issues differ:** Which ESG indicators are tracked at all\n2. **Measurement differs:** How the same indicator is quantified (emissions per revenue vs. per employee)\n3. **Weights differ:** How much each pillar and sub-issue contributes to the final score\n\n**Investor implication:** A stock can simultaneously score AAA at MSCI and carry 'high risk' at Sustainalytics. Single-agency reliance creates a false sense of ESG precision.",
          highlight: [
            "MSCI",
            "Sustainalytics",
            "S&P Global",
            "ISS ESG",
            "Bloomberg ESG",
            "correlation 0.54",
            "rating divergence",
          ],
        },
        {
          type: "teach",
          title: "Materiality Frameworks",
          content:
            "**Materiality** determines which ESG issues are financially significant for a given company. The same issue can be highly material for one industry and irrelevant for another. Four frameworks dominate professional practice:\n\n**SASB (Sustainability Accounting Standards Board)**\nSector-specific: 77 distinct industry standards. Each identifies the small set of ESG issues most likely to affect enterprise value in that sector.\n- Water consumption: Highly material for **semiconductors** (fabs use billions of gallons), **agriculture**, and **beverages** — but immaterial for investment banks\n- Data security: Highly material for **banks and fintech** — not for mining companies\n- Labor practices: Most material in **apparel supply chains** and **healthcare staffing**\n\n**GRI (Global Reporting Initiative)**\nComprehensive disclosure standard for all stakeholders — not just investors. Covers 36 topic-specific standards. Often used for corporate sustainability reports. Broader than SASB, less prescriptive about financial materiality.\n\n**TCFD (Task Force on Climate-related Financial Disclosures)**\nClimate-specific framework developed at the G20's request. Structures disclosure across four pillars: Governance, Strategy, Risk Management, Metrics & Targets. Requires companies to model financial impacts under different warming scenarios (1.5°C, 2°C, >3°C). Now mandatory for large UK companies and incorporated into many global standards.\n\n**ISSB (International Sustainability Standards Board)**\nLaunched 2022 under the IFRS Foundation. Published IFRS S1 (general sustainability) and IFRS S2 (climate) in 2023. Designed as a global baseline that national regulators can build upon. Explicitly incorporates TCFD and SASB concepts. Currently adopted or being adopted in Australia, Canada, UK, Singapore, Brazil, and others — the strongest convergence driver in ESG history.",
          highlight: [
            "SASB",
            "GRI",
            "TCFD",
            "ISSB",
            "IFRS S1",
            "IFRS S2",
            "materiality",
            "sector-specific",
          ],
        },
        {
          type: "teach",
          title: "ESG Data Challenges",
          content:
            "Even with good frameworks, ESG data has structural limitations that every analyst must understand:\n\n**Self-Reported Data Reliability**\nThe majority of ESG data comes from companies' own sustainability reports. Companies select what to disclose, how to measure it, and how to frame it. Independent verification is still rare: only ~50% of S&P 500 companies have their GHG emissions third-party verified.\n\n**Greenwashing Detection**\nLanguage vs. action divergence is the core test. Red flags:\n- Ambitious net-zero pledges with no interim milestones or credible capex commitments\n- Reporting improved Scope 1 emissions while Scope 3 (supply chain + product use) grows unchecked\n- Marketing minor improvements ('30% recycled packaging') as transformational sustainability leadership\n- Using low-quality carbon offsets to claim neutrality rather than reducing absolute emissions\n\n**Scope 1, 2, and 3 Emissions**\nThe GHG Protocol defines three emission categories:\n- **Scope 1:** Direct emissions from owned/controlled sources (factory smokestacks, company fleet)\n- **Scope 2:** Indirect emissions from purchased electricity, heat, steam, or cooling\n- **Scope 3:** All other indirect emissions — both **upstream** (suppliers, raw materials) and **downstream** (product use, end-of-life). For most companies, Scope 3 represents **70–95% of total footprint**, yet it is the hardest to measure accurately and historically the least reported.\n\n**EU CSRD (Corporate Sustainability Reporting Directive)**\nEffective from 2024 financial year onwards (phased), CSRD mandates comprehensive sustainability reporting for large EU companies (50,000+ companies affected). Requires third-party assurance, double materiality assessment (financial + impact materiality), and alignment with European Sustainability Reporting Standards (ESRS). The most ambitious mandatory ESG reporting regime globally.",
          highlight: [
            "Scope 1",
            "Scope 2",
            "Scope 3",
            "self-reported",
            "greenwashing",
            "CSRD",
            "third-party verification",
            "double materiality",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An automotive company reports its Scope 3 emissions. A customer drives a car they purchased from this company for 10 years, generating exhaust emissions. How are these classified?",
          options: [
            "Downstream Scope 3 — customer use of sold products is a downstream Scope 3 category",
            "Scope 1 — the company indirectly controls what its cars emit",
            "Scope 2 — because the fuel is an energy input into the product",
            "These emissions are not reportable under GHG Protocol",
          ],
          correctIndex: 0,
          explanation:
            "The GHG Protocol identifies 15 Scope 3 categories. 'Use of sold products' is Category 11, a downstream Scope 3 emission. For automotive companies, this is typically by far the largest emissions category — often representing over 80% of their total GHG footprint. This is why automakers face intense pressure to electrify their fleets; EVs reduce Scope 3 downstream emissions by transferring the emission source to electricity generation.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "ESG rating agency scores are about as consistent with each other as credit ratings from Moody's and S&P — the correlation between major ESG raters is above 0.90.",
          correct: false,
          explanation:
            "False. The Berg, Kölbel, and Rigobon (2019) MIT Sloan study found the average correlation between six major ESG raters was approximately 0.54 — far below the ~0.92 correlation seen between Moody's and S&P credit ratings. This divergence stems from different scopes of measurement, different indicator definitions, and different materiality weightings. It means two ESG funds can hold very different companies while both claiming to be 'ESG-focused.'",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A large fast-fashion retailer publishes a glossy sustainability report highlighting that 100% of its headquarters electricity comes from renewables and that it has reduced Scope 1 emissions by 20% over five years. However, the company has expanded its manufacturing base in countries with high coal intensity, uses unverified carbon offsets to claim 'carbon neutrality,' and Scope 3 upstream supply chain emissions have grown by 40% over the same period.",
          question:
            "An ESG analyst reviewing this company's report should most likely conclude:",
          options: [
            "This is a greenwashing pattern — headline metrics mask deteriorating supply chain performance",
            "The company demonstrates genuine ESG leadership through renewable energy commitment",
            "The Scope 1 reduction proves real emissions management and the offsets fill the gap",
            "Supply chain emissions are irrelevant because they fall outside the company's direct control",
          ],
          correctIndex: 0,
          explanation:
            "This is a classic greenwashing pattern. Highlighting renewable HQ electricity (Scope 2) and modest Scope 1 reductions while Scope 3 upstream emissions grow 40% and unverified offsets mask the remainder is precisely the 'language vs. action' divergence ESG analysts are trained to detect. Supply chain emissions (upstream Scope 3) are a core financial and reputational risk for fast-fashion companies — ignoring them understates true climate exposure. A credible report would address absolute Scope 3 reduction targets and supplier engagement programs.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Climate Finance ────────────────────────────────────────────────
    {
      id: "esg-adv-2",
      title: "Climate Finance",
      description:
        "Physical and transition risk, carbon markets, green bonds, and sustainability-linked finance",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Physical vs Transition Risk",
          content:
            "Climate risk divides into two fundamentally different categories, each requiring a different analytical approach:\n\n**Physical Risk**\nDirect financial damages from climate change itself:\n- **Acute risks:** Increased frequency/severity of hurricanes, floods, wildfires, and heat events destroy physical assets, disrupt supply chains, and increase insurance costs. Example: A coastal data center with $500M in assets faces increasing flood probability as sea levels rise.\n- **Chronic risks:** Long-term shifts — sea level rise strands real estate, heat stress reduces agricultural yields, water scarcity disrupts manufacturing.\n\nPhysical risk is typically most acute for real estate, utilities, agriculture, and insurance companies. It is already affecting asset valuations in flood-prone regions.\n\n**Transition Risk**\nFinancial losses from the shift to a low-carbon economy:\n- **Policy risk:** Carbon taxes, emissions trading schemes, fuel efficiency standards. A coal power plant faces stranded asset risk when carbon prices make it uneconomical to operate.\n- **Technology risk:** Renewable energy cost declines (solar -90% since 2010) strand capital in incumbent fossil fuel infrastructure.\n- **Market/reputational risk:** Consumer shifts toward sustainable products, investor exclusions, talent recruitment challenges.\n\n**TCFD Scenario Analysis**\nThe Task Force on Climate-related Financial Disclosures requires companies to model financial impacts under three warming scenarios:\n- **1.5°C pathway:** Rapid, aggressive transition — high transition risk, lower physical risk\n- **2°C pathway:** Moderate transition — balanced risk profile, still Paris-compatible\n- **>3°C (business as usual):** Minimal transition — low short-term transition risk but catastrophic long-run physical risk\n\nCompanies must disclose which scenario is most material to their business model — a key tool for investor analysis of climate exposure.",
          highlight: [
            "physical risk",
            "transition risk",
            "stranded assets",
            "TCFD scenarios",
            "1.5°C",
            "2°C",
            "acute risk",
            "chronic risk",
          ],
        },
        {
          type: "teach",
          title: "Carbon Markets",
          content:
            "Carbon markets put a price on greenhouse gas emissions, creating financial incentives to reduce them. Two distinct market types exist:\n\n**Compliance Carbon Markets (Cap and Trade)**\nMandatory government-run systems:\n- **EU Emissions Trading System (EU ETS):** The world's largest carbon market. Covers ~40% of EU GHG emissions. Cap declines annually; companies buy allowances (EUAs) for excess emissions. Price: €60–90 per metric ton CO2e (2023–2024). Phase 4 (2021–2030) tightens the cap by 4.3% annually.\n- **California Cap-and-Trade:** Links with Quebec. ~$30–35/ton.\n- **UK ETS, South Korea ETS, China ETS (world's largest by coverage)** — growing ecosystem of national/regional markets.\n\n**Voluntary Carbon Markets (VCM)**\nCompanies voluntarily offset emissions by purchasing carbon credits from verified projects (reforestation, methane capture, cookstove programs). Prices range from $3–$50/ton depending on project quality.\n\nKey quality debates:\n- **Additionality:** Would the emission reduction have happened anyway without carbon credit revenue?\n- **Permanence:** Will a forest offset actually sequester carbon for 100 years, or will it be logged or burned?\n- **Leakage:** Does protecting one forest shift deforestation elsewhere?\n- Standards include Verra (VCS), Gold Standard, American Carbon Registry.\n\n**Carbon Border Adjustment Mechanism (CBAM)**\nEU policy effective 2026: imports of carbon-intensive goods (steel, cement, aluminum, fertilizers, electricity) must purchase CBAM certificates equal to the EU ETS price. Prevents 'carbon leakage' where production shifts to low-regulation countries.\n\n**Corporate Internal Carbon Pricing**\nMany multinationals (Microsoft, BP, Shell) set internal shadow carbon prices ($50–150/ton) applied to capital budgeting decisions — a project must be viable even at that carbon cost. Aligns investment decisions with anticipated future regulation.",
          highlight: [
            "EU ETS",
            "cap and trade",
            "voluntary carbon markets",
            "additionality",
            "permanence",
            "CBAM",
            "internal carbon pricing",
          ],
        },
        {
          type: "teach",
          title: "Green Bonds & Sustainability-Linked Bonds",
          content:
            "Climate finance has spawned an entire fixed income asset class. The labeled bond market now exceeds $1 trillion in annual issuance:\n\n**Green Bonds**\nProceed from issuance are exclusively used to fund specific green projects:\n- Renewable energy (solar/wind farms)\n- Green buildings (LEED/BREEAM certified)\n- Clean transportation (EV infrastructure, electric rail)\n- Water management, sustainable forestry\n\nKey governance standard: **ICMA Green Bond Principles (GBP)** — four core components: use of proceeds, project evaluation & selection, management of proceeds, and reporting. Most issuers obtain a **second-party opinion (SPO)** from firms like Vigeo Eiris, Sustainalytics, or DNV verifying alignment.\n\nLimitation: Green bond proceeds fund specific projects, but the issuer's overall business may still be unsustainable. An oil company can issue a green bond for a solar farm while expanding upstream drilling.\n\n**Sustainability-Linked Bonds (SLBs)**\nStructurally different: proceeds can be used for any purpose, but the **coupon is tied to ESG performance targets (KPIs)**:\n- If the issuer misses a target (e.g., Scope 1 emissions reduction of 30% by 2025), the coupon steps up by 25–50 bps (the 'step-up mechanism')\n- KPIs should be material, ambitious, and independently verified\n- Growing but controversial: critics note weak targets and one-sided step-ups (up if missed, no discount if achieved early)\n\n**EU Green Bond Standard (EU GBS)**\nVoluntary but rigorous: requires 100% EU Taxonomy alignment for proceeds, mandatory third-party pre- and post-issuance review, and enhanced reporting. Stricter than GBP — prevents 'green label arbitrage.'\n\n**The labeling landscape:**\n- Green bonds → environmental use of proceeds\n- Social bonds → social use of proceeds (affordable housing, healthcare access)\n- Sustainability bonds → mix of green + social proceeds\n- Sustainability-linked bonds → issuer-level ESG target linkage\n- Transition bonds → funding carbon-intensive industries' low-carbon transition (controversial)",
          highlight: [
            "green bonds",
            "sustainability-linked bonds",
            "SLB",
            "step-up mechanism",
            "second-party opinion",
            "EU Green Bond Standard",
            "Green Bond Principles",
            "use of proceeds",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "TCFD stands for the Task Force on Climate-related Financial Disclosures. Which organization established it and why?",
          options: [
            "The Financial Stability Board, at the request of the G20, to standardize how companies disclose climate-related financial risks to investors",
            "The UN Environment Programme, as part of the Paris Agreement to replace national emissions reporting",
            "The International Accounting Standards Board, to update IFRS financial statement requirements for carbon assets",
            "The SEC, to require US public companies to file annual climate risk filings by 2020",
          ],
          correctIndex: 0,
          explanation:
            "The TCFD was established by the Financial Stability Board (FSB) in 2015, at the request of G20 Finance Ministers. The motivation: financial regulators recognized that climate-related risks were not consistently or comparably disclosed, leaving investors and lenders unable to properly assess climate exposure. TCFD's four-pillar framework (Governance, Strategy, Risk Management, Metrics & Targets) with scenario analysis has since been adopted or mandated in the UK, EU, Australia, Canada, Japan, Singapore, and New Zealand.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "All carbon offsets provide equivalent climate benefit — one metric ton of CO2 avoided through a cookstove project is equivalent to one metric ton avoided through a forest protection project.",
          correct: false,
          explanation:
            "False. Carbon offsets vary enormously in quality based on permanence, additionality, and verification rigor. A forest protection offset faces risks of reversal (fire, logging, disease) that make it potentially non-permanent. A cookstove project offset reduces actual fossil fuel combustion immediately and permanently. Additionality is also unequal: some forest projects protect forests that weren't actually at risk. Leading rating services (BeZero, Sylvera, Calyx Global) have emerged specifically to rate offset quality, precisely because '1 tonne = 1 tonne' is a dangerous oversimplification.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A European utility company plans to issue a €500M bond to finance three offshore wind farms that will generate 1.2 GW of renewable capacity. The CFO is deciding between a standard green bond with ICMA Green Bond Principles alignment and a second-party opinion, or an EU Green Bond Standard (EU GBS) compliant bond. The EU GBS requires full EU Taxonomy alignment documentation, mandatory pre-issuance external review, and enhanced annual reporting.",
          question:
            "Which bond type is likely to attract the lowest yield (i.e., offer the lowest financing cost to the issuer), and why?",
          options: [
            "EU GBS bond — stricter certification signals higher quality and attracts ESG-mandated investors who accept a 'greenium' (lower yield)",
            "Standard green bond — broader eligibility means larger investor base and more competitive pricing",
            "Neither — green labels have no effect on bond pricing in efficient markets",
            "The standard green bond — it has lower legal liability and documentation costs that translate to pricing advantages",
          ],
          correctIndex: 0,
          explanation:
            "Research consistently documents a 'greenium' — a yield premium for green bonds relative to conventional bonds from the same issuer. EU GBS bonds command a larger greenium than standard green bonds because the stricter EU Taxonomy alignment and mandatory assurance reduce greenwashing risk for ESG-mandated investors (who face regulatory pressure to hold only high-quality green assets under SFDR). For a creditworthy utility with clearly eligible wind farm proceeds, the EU GBS certification is likely the optimal financing strategy.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Shareholder Engagement & Stewardship ──────────────────────────
    {
      id: "esg-adv-3",
      title: "Shareholder Engagement & Stewardship",
      description:
        "Active ownership, ESG activism, proxy voting, and governance best practices",
      icon: "Users",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Active Ownership Spectrum",
          content:
            "Owning shares in a company grants legal rights — and ESG investors increasingly use those rights to influence corporate behavior. The active ownership toolkit runs from soft to confrontational:\n\n**1. Proxy Voting**\nEvery publicly traded company holds an Annual General Meeting (AGM) where shareholders vote on:\n- **Board director elections** — vote against directors who lack independence or fail ESG oversight duties\n- **Executive compensation** — 'Say on Pay' votes; vote against excessive pay packages disconnected from ESG metrics\n- **Shareholder resolutions** — vote for resolutions requesting climate risk disclosure, pay equity reporting, political contribution transparency\n- **Capital structure** — share issuances, mergers, anti-takeover defenses\n\nLarge passive managers (BlackRock, Vanguard, State Street) own ~20% of most major companies and vote at thousands of AGMs annually. Their proxy voting guidelines increasingly incorporate ESG criteria — creating significant de facto pressure on companies.\n\n**2. Direct Engagement**\nPrivate dialogue between investors and company management/board. Can address specific ESG concerns: supply chain transparency, board diversity gaps, climate target credibility. More effective than voting alone because it allows back-and-forth exchange of information. Academic studies (Dimson, Karakas, Li 2015) show engagement leads to positive abnormal returns of ~2.3% over one year when successful.\n\n**3. Escalation**\nWhen quiet engagement fails: public letter campaigns, voting against board members, filing shareholder resolutions, coordinating with other investors, or engaging media.\n\n**4. Divestment**\nThe ultimate sanction — sell all shares. Preserves no ongoing influence. Evidence on effectiveness is mixed: divestment primarily works through reputational pressure and potential cost-of-capital effects if widespread, but the direct financial impact on the company is limited (secondary market transactions don't affect company cash flows).",
          highlight: [
            "proxy voting",
            "say on pay",
            "shareholder resolutions",
            "engagement",
            "divestment",
            "active ownership",
            "escalation",
          ],
        },
        {
          type: "teach",
          title: "ESG Shareholder Activism",
          content:
            "ESG activism uses the shareholder rights framework to force strategic change at companies — and recent years have produced landmark victories:\n\n**Engine No. 1 vs. ExxonMobil (2021)**\nThe most celebrated ESG activist campaign in corporate history. Engine No. 1, a tiny hedge fund holding just **0.02% of ExxonMobil's shares**, launched a proxy contest arguing ExxonMobil's board lacked energy transition expertise and its climate strategy was financially reckless.\n\nOutcome: Engine No. 1 won **3 of 4** proposed board seats — including candidates with renewable energy expertise. This was only possible because large passive managers (BlackRock, Vanguard, State Street) sided with Engine No. 1. The lesson: small activists can punch far above their weight if their thesis resonates with large passive holders.\n\n**Say on Climate**\nAn emerging mechanism where companies put their climate transition plans to shareholder advisory votes. Unlike binding proxy votes, these are advisory — but 'no' votes generate significant reputational pressure. Major companies (Shell, Rio Tinto, Moody's) have adopted Say on Climate after investor pressure.\n\n**Investor Coalitions**\nCollective investor action amplifies individual voices:\n- **UN PRI (Principles for Responsible Investment):** 5,000+ signatories managing $120T+ committed to ESG integration\n- **Climate Action 100+:** 700 investors managing $68T engaging the 166 highest-emitting companies on climate plans\n- **Net Zero Asset Managers:** 300+ firms managing $57T committed to net-zero portfolios by 2050\n- **30%Club:** Investors pushing for 30%+ female board representation globally\n\nCoalition membership creates accountability, shared resources for engagement, and coordinated voting power that individual investors lack.",
          highlight: [
            "Engine No. 1",
            "ExxonMobil",
            "0.02% stake",
            "Say on Climate",
            "Climate Action 100+",
            "Net Zero Asset Managers",
            "UN PRI",
          ],
        },
        {
          type: "teach",
          title: "Governance Best Practices",
          content:
            "Governance — the 'G' in ESG — is the most directly actionable pillar and the one with the most mature, evidence-based standards:\n\n**Board Independence**\n- Majority independent non-executive directors (NEDs) are a baseline expectation\n- Independent board chair (separate from CEO) is considered best practice; combined chair/CEO concentrates power\n- Lead independent director required when roles are combined\n- Independence tests: no current/recent employment, no significant business relationship, no family ties to management\n\n**Board Diversity**\nBeyond gender, effective boards need diversity of skills, industries, geographies, and tenure:\n- **Gender diversity:** EU requirements mandate 40% female directors for listed companies by 2026. Evidence (McKinsey 'Diversity Wins') links gender diversity to outperformance.\n- **Skills diversity:** Cybersecurity, climate science, and financial technology expertise are increasingly flagged as board gaps\n- **Overboarding:** Directors serving on too many boards (typically 5+) are flagged as unable to devote sufficient time\n\n**Executive Pay Alignment**\n- Long-term incentive plans (LTI) should include ESG KPIs (typically 10–30% of total long-term incentive award)\n- Metrics: Scope 1/2 emissions reductions, safety performance, board diversity progress, customer satisfaction\n- Clawback provisions allow recovery of compensation if financial restatements or misconduct occur\n- Pay ratios: CEO-to-median-worker ratio disclosed in US since 2018; extreme ratios (500:1+) are proxy advisory red flags\n\n**Anti-Takeover Defenses**\n- **Poison pills (shareholder rights plans):** Allow existing shareholders to buy shares at discount if any party acquires 15%+, diluting the acquirer. Protect management but can entrench underperformance.\n- **Staggered boards:** Only one-third of directors up for election each year, making hostile takeovers take 3+ years. ISS and Glass Lewis routinely recommend 'against' votes on proposals to create staggered boards.\n- **Dual-class share structures:** Founders retain super-voting shares (Google/Alphabet, Facebook/Meta). Limits shareholder democracy; controversial in ESG frameworks.",
          highlight: [
            "board independence",
            "board diversity",
            "executive pay",
            "ESG KPIs",
            "clawback",
            "poison pill",
            "staggered board",
            "dual-class shares",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In the 2021 Engine No. 1 vs. ExxonMobil proxy contest, Engine No. 1 succeeded in winning board seats despite holding only 0.02% of ExxonMobil's shares. What was the primary reason this was possible?",
          options: [
            "Large passive asset managers (BlackRock, Vanguard, State Street) voted in favor of Engine No. 1's director candidates, providing the decisive voting margin",
            "Engine No. 1 filed a regulatory complaint that forced ExxonMobil to accept the new directors without a shareholder vote",
            "ExxonMobil's board voluntarily agreed to add climate-focused directors after the media attention",
            "Engine No. 1 used options contracts to temporarily increase its voting power above 50% for the AGM",
          ],
          correctIndex: 0,
          explanation:
            "Engine No. 1's victory was only possible because the 'Big Three' passive managers — BlackRock, Vanguard, and State Street — each holding 5–8% of ExxonMobil, sided with the activist. Their combined voting power, motivated by concerns about ExxonMobil's long-term climate strategy, provided the margin of victory. This episode demonstrated that ESG-aligned passive manager voting behavior has fundamentally changed corporate governance dynamics — small activists can win if their arguments resonate with passive giants.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "ESG investors who divest (sell) their shares in a polluting company are more likely to change that company's ESG behavior than investors who remain as shareholders and engage directly with management.",
          correct: false,
          explanation:
            "False. Divestment is the weakest tool for changing company behavior. When you sell shares in the secondary market, a non-ESG buyer purchases them at the prevailing market price — the company's cash flows, management team, and strategy remain unchanged. Academic evidence (Dimson, Karakas, Li 2015) shows direct engagement produces measurable improvements in ESG practices with associated positive stock returns. Divestment's main mechanism of influence is reputational pressure and potential cost-of-capital effects — but these are diffuse and slow. Investors who sell lose their legal right to vote at AGMs and engage with management entirely.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You manage a $500M ESG equity fund and hold 1.2% of a large mining company. The company's board has nine members, seven of whom are male and six have been directors for over 12 years (limiting board freshness). The company also has a combined CEO/Chairman role. Management proposes a new equity compensation plan for the CEO worth $40M over three years, with zero ESG-linked metrics. You are preparing your proxy vote and deciding whether to also initiate direct engagement.",
          question:
            "What is the most governance-sound course of action for the AGM and post-AGM period?",
          options: [
            "Vote against the compensation plan and the election of the longest-tenured board member serving on the compensation committee; simultaneously send a private engagement letter requesting CEO/Chair separation and ESG metric inclusion in future LTI plans",
            "Abstain from all votes to preserve the investor relationship and avoid reputational risk from a confrontational stance",
            "Vote in favor of management proposals to maintain goodwill for future engagement effectiveness",
            "Immediately divest the position to signal disapproval, then re-engage once a new management team is appointed",
          ],
          correctIndex: 0,
          explanation:
            "Governance best practice calls for using both proxy voting and direct engagement in sequence. Voting against the compensation plan (no ESG linkage, excessive quantum) and the longest-serving compensation committee member (overtenure reduces independence) sends a clear signal through official AGM records — which get scrutinized by management, proxy advisors, and media. Simultaneous private engagement provides a constructive path forward: CEO/Chair separation improves oversight, and ESG LTI metrics align compensation with long-term value creation. Abstaining or supporting poor governance to preserve relationships is a stewardship failure; immediate divestment sacrifices the ability to influence from within.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: ESG Performance Debate ────────────────────────────────────────
    {
      id: "esg-adv-4",
      title: "The ESG Performance Debate",
      description:
        "Academic evidence, factor attribution, regulatory dynamics, and the ESG outperformance question",
      icon: "Scale",
      xpReward: 80,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Academic Evidence on ESG and Returns",
          content:
            "The relationship between ESG and financial performance is one of the most studied questions in modern finance — and the evidence is more nuanced than advocates or critics typically acknowledge:\n\n**The Landmark Meta-Study**\nFriede, Busch & Bassen (2015) analyzed **2,200+ empirical studies** on ESG and corporate financial performance (CFP). Their findings:\n- ~63% of studies showed a **positive** ESG-CFP relationship\n- ~8% showed negative\n- ~26% showed neutral/mixed\nConclusion: 'The orientation toward ESG criteria appears to pay off.' But — correlation, not causation. And publication bias likely inflates positive findings.\n\n**The Green Premium Paper**\nPastor, Stambaugh & Taylor (2021, Journal of Financial Economics) developed a theoretical model predicting:\n- ESG assets have **positive alpha** in a transition period (as ESG demand grows, green assets are revalued upward)\n- But they have **lower expected returns going forward** because their prices have risen to reflect lower climate risk\nThis predicts the pattern actually observed: ESG outperformed through ~2021, then mean-reverted as valuations stretched.\n\n**Heterogeneity and Caveats**\nESG performance results are highly sensitive to:\n- **Time period:** 2010–2020 showed consistent ESG outperformance; 2022 showed sharp underperformance\n- **ESG definition:** Exclusion-based vs. integration-based vs. impact funds behave very differently\n- **Geography:** European ESG funds outperformed US; emerging market results are mixed\n- **Survivorship bias:** Underperforming ESG funds are discontinued and excluded from historical databases, mechanically improving average reported performance",
          highlight: [
            "Friede Busch Bassen",
            "2,200 studies",
            "Pastor Stambaugh Taylor",
            "green premium",
            "survivorship bias",
            "positive alpha",
          ],
        },
        {
          type: "teach",
          title: "Risk-Adjusted Returns and Factor Exposure",
          content:
            "The most rigorous critique of ESG outperformance claims comes from **factor analysis**: much of what appears to be ESG alpha may simply be exposure to well-known systematic risk factors.\n\n**The Quality Factor Connection**\nHigh-ESG companies tend to cluster in characteristics associated with the **Quality factor**:\n- High return on equity (ROE)\n- Low financial leverage\n- Stable earnings\n- Strong cash flow generation\n- Low accruals (high earnings quality)\n\nWhen ESG fund returns are regressed against Fama-French factor models (Market, Size, Value, Profitability, Investment), a substantial portion of apparent ESG alpha is explained by Quality/Profitability factor loading — not by ESG itself.\n\n**The 2022 Case Study**\nIn 2022, the energy sector returned +65% (S&P 500 Energy) while the S&P 500 fell 18%. Most ESG funds exclude or underweight energy, so they:\n- Missed the biggest sector rally\n- Underperformed the S&P 500 by 5–10 percentage points on average\nThis was not evidence of ESG 'failure' — it was the structural consequence of sector exclusion in a commodity supercycle driven by geopolitical shock. But it illustrates that ESG performance is highly **period-dependent**.\n\n**The Expanding Universe Problem**\nAssets labeled 'ESG' grew from $22T (2016) to $35T+ (2022) globally. As more money chased ESG assets:\n- Green stock valuations expanded (multiple expansion), generating apparent returns\n- This is a one-time revaluation effect, not a persistent alpha source\n- When ESG fund flows slowed or reversed (2022–2023), multiple compression contributed to underperformance\n\n**Net conclusion:** After proper factor adjustment and accounting for period dependency, ESG portfolios appear approximately **risk-return neutral** to the broad market — neither meaningfully better nor worse on a risk-adjusted basis.",
          highlight: [
            "quality factor",
            "Fama-French",
            "factor attribution",
            "multiple expansion",
            "energy sector 2022",
            "period-dependent",
            "risk-adjusted",
          ],
        },
        {
          type: "teach",
          title: "Regulatory and Flow Dynamics",
          content:
            "Beyond pure financial performance, regulatory and flow dynamics are reshaping the ESG investment landscape:\n\n**SFDR Classification System (EU)**\nThe Sustainable Finance Disclosure Regulation classifies investment products:\n- **Article 6:** No sustainability integration claims. Standard products with no specific ESG mandate.\n- **Article 8:** 'Light green' funds that 'promote' environmental or social characteristics as part of their investment process. Broad category — can include ESG-tilted index funds.\n- **Article 9:** 'Dark green' funds with a **specific sustainable investment objective** — measurable positive environmental or social outcomes. Highest disclosure and reporting burden.\n\nArticle 9 classification became a competitive advantage, driving a wave of fund reclassifications to Article 9 in 2021–2022. Then the European Securities and Markets Authority (ESMA) issued guidance clarifying Article 9 requirements — causing a mass wave of **'SFDR downgrades'** from Article 9 to Article 8 as managers realized their funds didn't qualify. A cautionary tale about regulatory arbitrage.\n\n**SEC Climate Disclosure Rule (US)**\nFinalised 2024 (under legal challenge): requires large US public companies to disclose Scope 1 and Scope 2 GHG emissions, material climate risks, and governance of climate risks in SEC annual filings. Standardizes what had been voluntary and inconsistent disclosure.\n\n**Greenwashing Enforcement**\nRegulators are increasingly active:\n- SEC enforcement against DWS (Deutsche Bank's asset manager) and Goldman Sachs over misleading ESG fund disclosures (2023–2024)\n- EU ESMA and national regulators investigating fund naming and marketing practices\n- Outcome: ESG terminology is being standardized and the cost of greenwashing claims is rising\n\n**The Flow-Performance Dynamic**\nIn 2020–2021, ESG fund inflows exceeded $50B+ annually in the US alone. This sustained demand drove price appreciation of ESG-heavy assets. When flows slowed in 2022 (partly due to US political ESG backlash), the multiple expansion reversed — demonstrating that ESG performance is partly a reflexive flow story, not purely fundamental.",
          highlight: [
            "SFDR Article 6",
            "Article 8",
            "Article 9",
            "SFDR downgrade",
            "SEC climate disclosure",
            "greenwashing enforcement",
            "fund flows",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Under the EU SFDR framework, a fund classified as Article 9 must have which defining characteristic?",
          options: [
            "A specific sustainable investment objective with measurable positive environmental or social outcomes",
            "At least 50% of holdings in companies with MSCI ESG ratings of A or above",
            "Full exclusion of fossil fuels, tobacco, weapons, and gambling from the investable universe",
            "Second-party opinion verification of all portfolio companies' sustainability reports",
          ],
          correctIndex: 0,
          explanation:
            "Article 9 ('dark green') funds must have a specific sustainable investment objective as their primary goal — not just ESG integration or promotion. They must demonstrate that investments contribute to sustainable objectives and do no significant harm to other environmental or social objectives. MSCI rating thresholds, exclusion lists, and SPO verification are not the defining SFDR criteria — the objective-based requirement is. This strict definition caused widespread Article 9 downgrades to Article 8 when ESMA clarified the standard in late 2022.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Academic research confirms that ESG investing reliably generates superior risk-adjusted returns across all time periods and markets, making it a free lunch for investors.",
          correct: false,
          explanation:
            "False. The evidence on ESG performance is period-dependent, geography-dependent, and strategy-dependent. After controlling for factor exposures (particularly the Quality factor), apparent ESG alpha is substantially reduced. The 2022 performance episode — when energy exclusions caused widespread ESG underperformance — illustrated that ESG portfolios carry structural tilts that create both upside and downside relative to broad market indices. The Friede et al. meta-study showed mostly positive results but suffers from publication bias and cannot control for survivorship bias in fund data. ESG is better characterized as approximately risk-return neutral after factor adjustment, not a persistent alpha generator.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A pension fund CIO reviews the 3-year performance of their ESG equity mandate: the fund returned 11.2% annualized vs. the benchmark's 10.8% — a 40 bps outperformance. The investment consultant runs a Fama-French factor regression and finds the fund has a statistically significant positive loading on the Profitability/Quality factor. The alpha after factor adjustment is -0.2% (not statistically significant).",
          question:
            "What is the most accurate interpretation of the ESG mandate's performance?",
          options: [
            "The raw outperformance is explained by Quality factor exposure, not ESG itself — after adjustment, ESG added no statistically significant value",
            "The 40 bps outperformance proves ESG integration creates alpha that justifies the higher management fee",
            "The negative factor-adjusted alpha proves ESG destroys value and the mandate should be terminated",
            "Factor regressions are inappropriate for ESG funds because they are designed to deviate from standard factor exposures",
          ],
          correctIndex: 0,
          explanation:
            "The correct interpretation is that the raw outperformance is explained by the Quality/Profitability factor tilt inherent in high-ESG portfolios, not by the ESG process itself. Factor-adjusted alpha of -0.2% (statistically insignificant) means ESG integration neither added nor destroyed value — consistent with the academic consensus that ESG is approximately risk-return neutral after factor adjustment. This finding doesn't justify terminating the mandate (the fund met its benchmark), but it does mean the 40 bps 'outperformance' is not evidence of ESG skill — it's a well-understood risk factor reward.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Impact Investing & SDGs ───────────────────────────────────────
    {
      id: "esg-adv-5",
      title: "Impact Investing & SDGs",
      description:
        "The impact investing spectrum, UN Sustainable Development Goals, measuring impact, and blended finance",
      icon: "Globe",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "The Impact Investing Spectrum",
          content:
            "Impact investing is often confused with ESG integration, but it occupies a distinct and more demanding position on the sustainable finance spectrum:\n\n**The Full Spectrum (least to most intentional)**\n\n1. **ESG Risk Integration:** Consider ESG factors as financially material risks in standard investment analysis. No specific positive outcome targeted. Most common approach among large asset managers.\n\n2. **ESG Screening/Tilting:** Exclude harmful activities or overweight ESG leaders. Values-driven but primarily risk-management focused. Does not require measurable positive outcomes.\n\n3. **Thematic Investing:** Concentrated exposure to sustainability themes — clean energy, water infrastructure, sustainable agriculture, healthcare access. Some intentionality but outcome measurement varies.\n\n4. **Impact Investing:** Three required elements:\n   - **Intentionality:** The investor explicitly intends to contribute to a positive outcome\n   - **Measurability:** The outcome is quantified with specific metrics (jobs created, CO2 avoided, access to clean water for N people)\n   - **Additionality:** The positive outcome would not have occurred at the same scale without the investment\n\n5. **Philanthropy:** Accepts zero or negative financial return to maximize social impact. Not an investment category.\n\n**GIIN Market Size**\nThe Global Impact Investing Network (GIIN) estimated global impact AUM at **$1.164 trillion** in 2022 — up from just $114B in 2017. The market has grown 10x in five years, driven by institutional appetite, SDG frameworks, and improving impact measurement standards.\n\n**Return Expectations**\nImpact investments span the return spectrum:\n- **Market-rate impact:** Renewable energy infrastructure, affordable housing REITs, green bonds. Competitive risk-adjusted returns.\n- **Below-market (concessionary):** Accepted to reach underserved populations — microfinance for very small borrowers, conservation finance in illiquid markets.\n- **Catalytic/first-loss:** Development finance institutions (World Bank IFC, OPIC/DFC) take first-loss positions to crowd in commercial capital.",
          highlight: [
            "intentionality",
            "measurability",
            "additionality",
            "GIIN",
            "impact investing",
            "thematic investing",
            "concessionary returns",
            "blended finance",
          ],
        },
        {
          type: "teach",
          title: "UN Sustainable Development Goals (SDGs)",
          content:
            "The United Nations SDGs provide the dominant organizing framework for impact investment globally:\n\n**The Framework**\nAdopted September 2015, in force through 2030:\n- **17 Goals** spanning poverty, hunger, health, education, gender equality, clean water, affordable energy, decent work, sustainable cities, climate, marine and terrestrial ecosystems, institutions, and global partnerships\n- **169 Targets** with specific measurable outcomes\n- **232 Indicators** for tracking progress\n\n**The Financing Gap**\nThe UN estimates that achieving the SDGs by 2030 requires approximately **$4–6 trillion per year** in investment. Public sector budgets globally can cover perhaps $1.5–2T. The gap: **$2–4 trillion annually** that must come from private capital.\n\nThis framing transformed the SDG agenda from a government policy framework into an investment opportunity narrative — and catalyzed the entire impact investing ecosystem.\n\n**Key SDGs for Private Capital**\n- **SDG 7 (Affordable Clean Energy):** $1T+ annual solar/wind/storage investment opportunity\n- **SDG 11 (Sustainable Cities):** Green building retrofit, affordable housing, EV infrastructure\n- **SDG 13 (Climate Action):** Carbon markets, green bonds, climate resilience infrastructure\n- **SDG 8 (Decent Work):** SME finance in emerging markets, workforce development funds\n- **SDG 3 (Good Health):** Healthcare access funds in underserved markets\n\n**Blended Finance**\nA structural solution to crowd private capital into SDG-aligned investments that commercial investors perceive as too risky:\n- Development Finance Institutions (World Bank IFC, Asian Development Bank, European Investment Bank) provide **concessional capital** (below-market loans, guarantees, first-loss tranches)\n- This 'de-risks' the investment structure for commercial investors who can now earn market returns on a senior tranche\n- Example: A blended finance structure for a solar project in Sub-Saharan Africa: IFC takes first-loss equity (15%), a foundation provides mezzanine (20%), commercial investors buy senior debt (65%) at market rates",
          highlight: [
            "SDGs",
            "17 Goals",
            "financing gap",
            "blended finance",
            "IFC",
            "$4 trillion",
            "SDG 7",
            "SDG 13",
            "concessional capital",
          ],
        },
        {
          type: "teach",
          title: "Measuring Impact",
          content:
            "The core discipline that separates genuine impact investing from ESG marketing is **rigorous outcome measurement**. This is harder than it sounds:\n\n**IRIS+ (Impact Reporting and Investment Standards Plus)**\nDeveloped by the GIIN, IRIS+ is the global catalog of standardized impact metrics:\n- 1,000+ metrics across sectors and SDG alignment\n- Provides common language for investors and investees\n- Examples: 'FP5120B' = number of individuals who received healthcare; 'PI7300' = metric tons of CO2e avoided\n- Enables portfolio-level aggregation: a fund with 20 healthcare investments can report total patients served\n\n**Theory of Change**\nA logic framework connecting investment inputs to intended outcomes:\n- **Inputs:** Capital deployed ($)\n- **Activities:** What the investee does with the money (build clinics, train nurses)\n- **Outputs:** Direct measurable results (50 clinics built, 200 nurses trained)\n- **Outcomes:** Changes in condition (5,000 additional patients receiving care annually)\n- **Impact:** Long-term change attributable to the investment (improved health indicators in target region)\n\n**Additionality Challenge**\nThe hardest question in impact measurement: would this positive outcome have occurred anyway without this investment?\n- A solar farm in Germany that could attract commercial financing without impact capital → low additionality\n- A rural clean water project in a country with no other financing sources → high additionality\n- **Counterfactual analysis** is essential but methodologically challenging\n\n**Impact Washing**\nThe impact equivalent of greenwashing:\n- Claiming impact credit for outcomes that would have happened anyway\n- Reporting outputs (loans made) as impacts (lives improved)\n- Cherry-picking the best outcome stories without systematic measurement\n- Refusing third-party verification of impact claims\n\n**SROI (Social Return on Investment)**\nA financial proxy for social value: SROI = (Net Present Value of Social Benefits) ÷ Investment. Example: £1 invested in an employment training program generates £7 in social value (reduced welfare payments + tax contributions + improved health outcomes). A helpful communication tool but highly sensitive to assumptions.",
          highlight: [
            "IRIS+",
            "Theory of Change",
            "additionality",
            "impact washing",
            "SROI",
            "GIIN",
            "counterfactual",
            "outputs vs outcomes",
          ],
        },
        {
          type: "quiz-mc",
          question: "GIIN stands for which organization in impact investing?",
          options: [
            "Global Impact Investing Network — the leading industry body that developed IRIS+ metrics standards and publishes annual impact market sizing",
            "Green Investment and Innovation Network — the EU body overseeing the EU Taxonomy for sustainable activities",
            "Global Institutional Investor Network — the UN coalition of sovereign wealth funds and pension funds",
            "Governance and Impact Investment Nexus — the World Bank affiliate for development finance",
          ],
          correctIndex: 0,
          explanation:
            "GIIN stands for Global Impact Investing Network, founded in 2009. It is the preeminent industry body for impact investing globally, responsible for developing IRIS+ (the standardized impact metrics catalog), publishing annual State of the Market surveys (including market size estimates), and providing practitioner resources. Its 2022 survey estimated global impact AUM at $1.164 trillion. The GIIN is a non-profit supported by foundations, DFIs, and leading impact investors.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Public funding from governments and development finance institutions is sufficient to close the SDG financing gap — private capital involvement in SDG-aligned investments is welcome but not essential for achieving the 2030 Goals.",
          correct: false,
          explanation:
            "True that this is False. The UN estimates the annual SDG financing gap at $4–6 trillion, of which public budgets can realistically cover $1.5–2 trillion. The remaining $2–4 trillion per year must come from private capital — there is simply no realistic scenario where public money alone closes the gap by 2030. This is the foundational argument for the entire blended finance and impact investing ecosystem: mobilizing private capital toward SDG-aligned investment through de-risking structures, impact measurement frameworks, and commercial return opportunities.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A $200M impact fund is conducting due diligence on two potential investments in Sub-Saharan Africa: (A) A solar energy company providing off-grid solar home systems to 200,000 households with no electricity access. The company has been operating for 3 years, has IRIS+ tracked metrics, third-party verified carbon credits, and cannot access commercial bank financing due to perceived country risk. (B) A large solar farm in South Africa that sells electricity to the national grid at market rates. The project has investment-grade sovereign payment guarantees and could attract commercial project finance without the impact fund's involvement.",
          question:
            "From a genuine impact investing perspective, which investment better demonstrates the key criteria of intentionality, additionality, and measurability?",
          options: [
            "Investment A — high additionality (would not happen without impact capital), high measurability (IRIS+ tracked), clear intentionality (serving households with no electricity access)",
            "Investment B — larger absolute scale of solar capacity justifies prioritizing it despite lower additionality",
            "Both are equivalent — both generate clean energy and reduce carbon emissions, which satisfies impact criteria",
            "Investment B — sovereign guarantees reduce risk and allow the fund to deploy more capital efficiently",
          ],
          correctIndex: 0,
          explanation:
            "Investment A is the clearly superior impact investment across all three criteria. Additionality: without the impact fund, these 200,000 off-grid households would remain without electricity — the fund's capital is genuinely enabling an outcome that wouldn't otherwise occur. Measurability: IRIS+ metrics and third-party verified carbon credits provide rigorous outcome tracking. Intentionality: the investment targets energy access for underserved populations, not just any clean energy. Investment B could attract commercial finance independently (low additionality) — directing impact capital there 'crowds out' rather than 'crowds in' commercial investors, which is the opposite of blended finance's purpose.",
          difficulty: 3,
        },
      ],
    },
  ],
};
