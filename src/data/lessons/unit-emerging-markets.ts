import type { Unit } from "./types";

export const UNIT_EMERGING_MARKETS: Unit = {
  id: "emerging-markets",
  title: "Emerging Markets Investing",
  description:
    "Master EM investing: country risk, currency exposure, political risk, EM equity/debt strategies, and frontier markets",
  icon: "MapPin",
  color: "#ec4899",
  lessons: [
    // ─── Lesson 1: EM Framework & Classification ────────────────────────────────
    {
      id: "em-1",
      title: "EM Framework & Classification",
      description:
        "MSCI EM universe, DM vs EM vs Frontier differences, the equity premium, and current EM themes",
      icon: "Globe",
      xpReward: 70,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The MSCI EM Universe",
          content:
            "The **MSCI Emerging Markets Index** is the global benchmark for EM investing, covering **24 countries** and approximately **$7 trillion** in market capitalization.\n\n**Country Weights (approximate 2024):**\n- **China**: ~31% — the dominant EM weight; includes A-shares, H-shares, and some ADRs\n- **India**: ~17% — fast-rising weight as India's economy and market grow\n- **Taiwan**: ~15% — heavily concentrated in semiconductors (TSMC alone is ~10% of EM)\n- **South Korea**: ~12% — tech and industrials (Samsung, SK Hynix, Hyundai)\n- **Brazil, Saudi Arabia, South Africa, Mexico, Indonesia**: ~25% combined\n\n**EM vs Global Context:**\nEM represents roughly 12–13% of global equity market cap, yet EM economies produce ~40% of global GDP. This gap reflects:\n1. Many large EM companies remain state-owned and unlisted\n2. Private companies in EM often don't access public markets\n3. Lower valuations and less equity culture in some markets\n\n**Key MSCI classification criteria:**\n- Economic development level (per capita income)\n- Market size and liquidity (minimum market cap and turnover requirements)\n- Market accessibility (capital controls, foreign ownership limits, settlement reliability)",
          highlight: ["MSCI Emerging Markets", "24 countries", "$7 trillion", "China", "India", "Taiwan", "South Korea", "classification criteria"],
        },
        {
          type: "teach",
          title: "DM vs EM vs Frontier: A Risk Spectrum",
          content:
            "Markets are classified along a spectrum from most to least developed:\n\n**Developed Markets (DM) — 23 countries:**\nUS, UK, Germany, Japan, Canada, Australia, Singapore, etc.\n- Deep, liquid markets with tight spreads\n- Strong rule of law, independent central banks\n- Low political risk, reliable settlement\n- Typical P/E: 18–24×\n\n**Emerging Markets (EM) — 24 countries:**\nChina, India, Brazil, Taiwan, South Korea, Mexico, etc.\n- Larger, more liquid than frontier — adequate for institutional capital\n- Growing economies but weaker institutions\n- Currency volatility, moderate political risk\n- Typical P/E: 11–16×\n\n**Frontier Markets (FM) — ~30 countries:**\nVietnam, Nigeria, Bangladesh, Romania, Kazakhstan, Sri Lanka, etc.\n- Smaller market caps, lower liquidity\n- Often higher growth potential but harder to access\n- Potential diversification benefit (low correlation to global markets)\n- Very wide bid-ask spreads; exit can be difficult\n\n**The Risk-Return Tradeoff:**\nMoving from DM → EM → Frontier: higher expected returns, higher volatility, lower liquidity, and less institutional protection. Each step up in risk should be accompanied by larger position sizing discipline and longer investment horizons.",
          highlight: ["developed markets", "emerging markets", "frontier markets", "DM", "EM", "FM", "liquidity", "risk spectrum"],
        },
        {
          type: "teach",
          title: "The EM Equity Premium & Current Themes",
          content:
            "**EM Equity Risk Premium:**\nHistorically, EM equities have offered approximately **2–3% annual excess return** over DM equities (measured over long cycles). This premium compensates investors for:\n- **Political risk**: Policy reversals, expropriation, elections\n- **Liquidity risk**: Smaller free floats, capital controls, harder exit\n- **Currency risk**: EM currencies have a long-term tendency to depreciate vs USD\n- **Governance risk**: Weaker shareholder protections, related-party transactions\n\nImportant caveat: the EM premium is highly variable. In some decades (2000s), EM dramatically outperformed. In others (2010s), EM dramatically underperformed. Timing EM exposure is notoriously difficult.\n\n**Current EM Investment Themes (2024–2026):**\n\n**India Growth Story**: Demographics, digital infrastructure (UPI payments, Aadhaar ID), manufacturing shift away from China, growing middle class. India is now the 5th-largest equity market globally.\n\n**Latin America Commodities**: Brazil (iron ore, soybeans, oil), Chile (copper, lithium for EV batteries), Mexico (nearshoring from US companies). Commodity-linked economies benefit from energy transition.\n\n**EM Tech Ecosystem**: Taiwan's semiconductor dominance (TSMC), South Korea's memory chips and displays (Samsung, SK Hynix, LG), India's IT services (Infosys, TCS, Wipro).",
          highlight: ["EM equity premium", "2–3%", "political risk", "liquidity risk", "currency risk", "India", "Latin America", "EM tech"],
        },
        {
          type: "quiz-mc",
          question:
            "South Korea is classified as an Emerging Market by MSCI but as a Developed Market by FTSE. Why does this classification difference matter to investors?",
          options: [
            "Index funds tracking MSCI EM include South Korea with a ~12% weight, while FTSE EM funds exclude it — creating different sector/country exposures for seemingly similar 'EM' products",
            "It only matters to Korean domestic investors and has no practical effect on foreign portfolios",
            "MSCI and FTSE classifications are always identical and any difference is a data error",
            "South Korea is classified as DM by both MSCI and FTSE",
          ],
          correctIndex: 0,
          explanation:
            "This classification gap has real portfolio implications. MSCI EM-tracking funds (like EEM, VWO) include South Korea at ~12% weight, while FTSE EM-tracking funds (like Vanguard's international products outside the US) exclude it. An investor comparing 'EM exposure' between two funds may unknowingly hold very different country allocations. South Korea is well-developed economically but its market accessibility features (foreign ownership limits, currency hedging mechanics) historically kept MSCI from upgrading it to DM.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Because emerging market economies produce approximately 40% of global GDP, EM equities represent roughly 40% of global stock market capitalization.",
          correct: false,
          explanation:
            "False. Despite contributing ~40% of global GDP, EM equities represent only about 12–13% of global market cap. The gap exists because many large EM companies are state-owned and not publicly listed, equity culture is less developed in some EM countries, and lower P/E multiples applied to EM earnings compress market cap. This gap between economic weight and market weight is itself an argument for why EM may offer long-run growth opportunities.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 2: Political & Country Risk ─────────────────────────────────────
    {
      id: "em-2",
      title: "Political & Country Risk",
      description:
        "Regime stability, nationalization, sanctions, capital controls, political risk insurance, and the Turkey 2018 crisis",
      icon: "Shield",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Political Risk Factors",
          content:
            "**Political risk** is the probability that government actions or instability will negatively affect investment returns. Key dimensions:\n\n**Rule of Law (0–100 scale, World Bank):**\nMeasures confidence in contract enforcement, property rights, police, and courts. Low scores signal that contracts may not be enforced and investors have limited legal recourse.\n- Norway: 99/100 | US: 88/100 | Brazil: 46/100 | Nigeria: 20/100\n\n**Property Rights & Expropriation:**\nCan the government seize your assets? Many EM constitutions allow nationalization 'in the public interest.' The question is whether compensation is fair and timely.\n\n**Corruption (Transparency International CPI):**\nHigh corruption increases operating costs (bribes, regulatory delays) and unpredictability. It also often signals weak rule of law.\n- Denmark: 90/100 | South Korea: 63/100 | India: 39/100 | Venezuela: 13/100\n\n**Election Risk:**\nPolicy reversals after elections are common in EM. A pro-business government replaced by a populist government can trigger multiple compression overnight.\n\n**Regime Stability:**\nMilitary coups, constitutional crises, and civil unrest are tail risks in some EM countries. Portfolio positions should be sized to survive a sudden regime change event.",
          highlight: ["political risk", "rule of law", "property rights", "expropriation", "corruption", "election risk", "regime stability"],
        },
        {
          type: "teach",
          title: "Nationalization, Sanctions & Capital Controls",
          content:
            "**Nationalization Risk:**\nResource-rich EM countries have historically expropriated foreign assets in oil, gas, and mining.\n- **Venezuela**: Hugo Chávez nationalized Exxon, ConocoPhillips, and local utilities (2007–2008). Compensation was minimal; international arbitration took years.\n- **Bolivia**: Evo Morales nationalized the natural gas sector in 2006 ('May Day Nationalizations'), forcing foreign operators to renegotiate contracts under unfavorable terms.\n- **Pattern**: Nationalization risk spikes when commodity prices are high (government wants more revenue) or during political transitions to left-wing populist governments.\n\n**Sanctions Risk:**\nThe most extreme form of political risk — can cause total loss of investment.\n- **Russia 2022**: After the Ukraine invasion, SWIFT disconnection and asset freezes made Russian equities worthless to Western holders. No selling, no dividends, no repatriation.\n\n**Capital Controls:**\nGovernments restrict money flowing in or out.\n- **Argentina**: Multiple currency crises saw the official exchange rate diverge by 100%+ from the black market rate. Investors trapped at artificially unfavorable rates.\n- **China**: The RMB is not fully convertible. Foreign investors must use approved channels (Stock Connect, QFII) with daily quota limits.\n- **Iceland 2008**: Post-banking crisis capital controls froze foreign investors in Icelandic assets for years.",
          highlight: ["nationalization", "Venezuela", "Bolivia", "sanctions", "Russia 2022", "capital controls", "Argentina", "China"],
        },
        {
          type: "teach",
          title: "Political Risk Insurance & Case Study: Turkey 2018",
          content:
            "**Political Risk Insurance:**\nInstitutional investors and multinationals can insure against political risk through:\n- **MIGA (Multilateral Investment Guarantee Agency)**: World Bank affiliate providing guarantees against expropriation, breach of contract, currency inconvertibility, and war/civil disturbance.\n- **DFC (US Development Finance Corporation)**: Formerly OPIC — provides political risk insurance for US investors in developing countries.\n- **Private insurers**: Lloyd's of London syndicates, AIG, Zurich offer political risk policies for specific project or country exposures.\nCoverage is expensive (1–3% of insured value per year) and does not cover market losses — only political events.\n\n**Case Study — Turkey 2018 Currency & Rate Crisis:**\nTurkey's lira lost over **40% of its value** against the USD in a matter of months in 2018. Here's what triggered the collapse:\n1. **High inflation** (>15%) demanded higher interest rates to cool the economy\n2. **President Erdogan** publicly stated that high interest rates cause inflation — the opposite of mainstream economics — and pressured the central bank NOT to hike\n3. **Central bank independence eroded**: The market interpreted rate hike refusal as the central bank losing credibility\n4. **Confidence collapse**: Foreign investors fled Turkish assets; every lira sold pushed the exchange rate lower\n5. **Debt spiral**: Turkish companies with USD debt saw their debt burden soar in lira terms as the currency fell\n\n**Lesson**: Central bank independence is a critical institutional factor for EM investors. When it is undermined, currency crises follow quickly.",
          highlight: ["MIGA", "DFC", "political risk insurance", "Turkey 2018", "central bank independence", "lira collapse", "Erdogan"],
        },
        {
          type: "quiz-mc",
          question:
            "An EM country has a World Bank Rule of Law score of 25/100. How should this affect the discount rate used to value companies in that country?",
          options: [
            "Add a country risk premium of 3–5%+ to the discount rate — weak rule of law signals higher expropriation, contract breach, and regulatory risk that demand higher expected returns",
            "Use a lower discount rate because weak institutions mean companies face less regulatory oversight and lower compliance costs",
            "The Rule of Law score is irrelevant — only GDP growth rate matters for discount rates",
            "Apply a 10% discount to book value but do not change the discount rate",
          ],
          correctIndex: 0,
          explanation:
            "A Rule of Law score of 25/100 indicates very weak contract enforcement, property rights, and institutional predictability. This translates directly into a higher country risk premium (CRP) added to the cost of equity. Using Damodaran's approach: CRP = Country Default Spread × (Equity Volatility / Bond Volatility). For a country with such weak institutions, total equity risk premium could easily be 10–15% — nearly double a DM rate — resulting in much lower P/E multiples even for companies with identical earnings growth.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Turkey in mid-2018: CPI inflation is running at 16%, the Turkish lira has been weakening, and Turkish companies have large USD-denominated debt. The President announces he will not allow the central bank to raise interest rates because he believes 'high rates cause inflation.'",
          question: "What chain of events is most likely to follow this announcement for foreign equity investors in Turkey?",
          options: [
            "Investors lose confidence in central bank independence → lira sells off sharply → USD debt burden explodes in lira terms → equity market crashes",
            "Low interest rates stimulate growth, boosting corporate earnings and lifting equity prices",
            "The lira strengthens because low rates encourage domestic borrowing and investment",
            "Foreign investors increase their Turkey allocation because low rates boost equity valuations",
          ],
          correctIndex: 0,
          explanation:
            "This is exactly what unfolded in Turkey in 2018. When a president signals they will override the central bank's mandate to fight inflation, markets interpret it as a loss of monetary credibility. Investors sell Turkish assets (lira, bonds, equities). The lira depreciates sharply. Turkish companies with USD debt — which many had borrowed cheaply — now see their debt balloon in lira terms, risking insolvency. The equity market falls both from earnings pressure and multiple compression as investors demand a higher risk premium.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: EM Currency & Fixed Income ────────────────────────────────────
    {
      id: "em-3",
      title: "EM Currency & Fixed Income",
      description:
        "Hard vs local currency EM debt, sovereign spreads, EMBI index, duration risk, and historical EM debt crises",
      icon: "Banknote",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Hard Currency EM Debt",
          content:
            "**Hard currency EM debt** is issued by EM sovereigns or corporations in a stable foreign currency — almost always **USD**, occasionally EUR.\n\n**Key characteristics:**\n- No direct currency risk for USD-based investors (the bond pays USD regardless of local FX)\n- Does carry **sovereign credit risk** — the government may default even on its own dollar bonds\n- Benchmarked against the **JPMorgan EMBI (Emerging Markets Bond Index)** family\n  - EMBI Global: ~70+ countries, sovereign and quasi-sovereign USD bonds\n  - EMBI spread: yield spread over US Treasuries — the premium investors demand for EM credit risk\n\n**Current EMBI Spreads (illustrative ranges):**\n- Investment-grade EM (Chile, Poland, Czech Republic): 80–150 bps over UST\n- High-yield EM (Brazil, Indonesia, South Africa): 200–350 bps over UST\n- Distressed EM (Argentina, Pakistan, Egypt): 700–2,000+ bps over UST\n\n**Sovereign spread drivers:**\n- Debt/GDP ratio and external debt profile\n- Foreign exchange reserves (months of import coverage)\n- Current account balance\n- Political stability and institutional quality\n- Commodity export dependence\n\n**USD debt trap**: Borrowing in USD is cheaper initially, but if the local currency depreciates, the burden of repayment grows in local currency terms — the classic EM debt spiral.",
          highlight: ["hard currency", "USD-denominated", "EMBI", "sovereign spread", "basis points", "credit risk", "USD debt trap"],
        },
        {
          type: "teach",
          title: "Local Currency EM Debt & Currency Risk",
          content:
            "**Local currency EM debt** is issued and repaid in the borrower's own currency (BRL, CNY, IDR, ZAR, INR, TRY, etc.).\n\n**Key indices:**\n- **JPMorgan GBI-EM (Government Bond Index – Emerging Markets)**: Benchmark for local currency sovereign bonds\n- Major markets: China (~10%), Brazil (~9%), India (~8%), Indonesia (~7%), Mexico (~7%)\n\n**The yield advantage:**\nLocal EM bond yields are typically much higher than USD bonds:\n- Brazilian 10-year local bond: ~11–13%\n- Indonesian 10-year: ~6–7%\n- Indian 10-year: ~7–8%\n- vs US 10-year: ~4–4.5%\n\nHowever, the additional yield must compensate for **FX risk** — if the BRL depreciates 10%, a 13% Brazilian bond delivers only ~3% in USD terms.\n\n**Duration considerations in EM:**\nShorter duration is generally more appropriate in EM fixed income because:\n1. **Higher political risk** — policy reversals hit longer bonds harder (greater price sensitivity)\n2. **Higher inflation risk** — EM central banks often face credibility challenges\n3. **Liquidity risk** — long-dated EM bonds can be very illiquid in crisis periods\n\n**EM central bank dynamics:**\nEM central banks that raise rates aggressively tend to attract capital inflows → stronger local currency but slower GDP growth. This creates a difficult tradeoff that investors must monitor.",
          highlight: ["local currency", "GBI-EM", "BRL", "CNY", "IDR", "yield advantage", "FX risk", "duration", "EM central banks"],
        },
        {
          type: "teach",
          title: "EM Debt Crises: Historical Lessons",
          content:
            "EM debt crises follow recurring patterns. Understanding history helps identify vulnerabilities:\n\n**1980s Latin America Debt Crisis:**\n- Countries borrowed heavily in USD during the 1970s petrodollar recycling boom\n- US Fed under Volcker raised rates sharply to 20%+ in 1981\n- USD strengthened dramatically; EM debt servicing costs exploded\n- Mexico defaulted in 1982; Brazil, Argentina, Chile followed\n- Result: 'Lost decade' of EM growth; Brady Bond restructuring in late 1980s\n\n**1997 Asian Financial Crisis:**\n- Thailand, Indonesia, South Korea had large current account deficits financed by short-term USD debt\n- Thailand broke its USD peg in July 1997; contagion spread across Asia rapidly\n- Indonesian rupiah lost ~80% of value; Korean won fell ~50%\n- IMF bailouts came with harsh austerity conditions\n- Key lesson: Currency pegs + foreign currency debt = extreme fragility\n\n**2022 Sri Lanka Crisis:**\n- Aggressive tax cuts + COVID tourism collapse depleted foreign exchange reserves\n- Could not service USD debt or import fuel/food\n- First sovereign default in Sri Lanka's history; political revolution followed\n- IMF bailout secured only after 18 months of severe economic collapse\n\n**Common EM Crisis Triggers:**\n1. Large current account deficit + short-term USD debt\n2. Falling FX reserves below 3 months of imports\n3. Loss of central bank credibility (rate suppression)\n4. External shocks (commodity price collapse, global rate hike cycles)",
          highlight: ["1980s debt crisis", "1997 Asian crisis", "Sri Lanka 2022", "USD peg", "current account deficit", "FX reserves", "contagion"],
        },
        {
          type: "quiz-mc",
          question:
            "A Brazilian 10-year government bond yields 11%, while the US 10-year Treasury yields 4.5%. What does this 6.5% spread primarily reflect?",
          options: [
            "Compensation for Brazil's sovereign credit risk, currency risk (BRL/USD), inflation risk, and political/institutional uncertainty — all priced into the yield premium",
            "Brazilian bond markets are less efficient and regularly misprice bonds by 6–7%",
            "Brazil has higher GDP growth, and higher growth always produces higher bond yields",
            "The spread is driven entirely by Brazil's larger debt-to-GDP ratio, with no other factors",
          ],
          correctIndex: 0,
          explanation:
            "The 6.5% spread over US Treasuries is a composite risk premium. For a local currency bond, it includes: (1) expected BRL depreciation vs USD (historically BRL depreciates over time), (2) Brazil's sovereign credit risk (if inflation or politics deteriorate, default risk rises), (3) inflation risk premium (Brazil's CPI is structurally higher), and (4) liquidity risk premium. A USD-based investor buying Brazilian local bonds needs the BRL to not depreciate by more than ~6.5% per year just to break even vs US Treasuries.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Hard currency EM bonds (USD-denominated) eliminate all investment risk for USD-based investors because there is no currency exposure.",
          correct: false,
          explanation:
            "False. While hard currency EM bonds eliminate direct FX risk for USD investors, significant risks remain: (1) Sovereign credit risk — the government may default even on USD bonds (Argentina has done this multiple times). (2) Spread widening risk — even without default, rising risk premiums compress bond prices. (3) Liquidity risk — in crises, EM USD bonds can become very illiquid with wide bid-ask spreads. (4) Indirect political risk — sanctions or capital controls can prevent coupon payments or principal repayment.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: China Investing ───────────────────────────────────────────────
    {
      id: "em-4",
      title: "China Investing",
      description:
        "A-shares vs H-shares vs ADRs, VIE structure risk, regulatory crackdowns, China macro, and Taiwan tension premium",
      icon: "Building2",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "China Market Structure: A-Shares, H-Shares & ADRs",
          content:
            "China has a uniquely fragmented market structure with three main share classes accessible to foreign investors:\n\n**A-Shares (onshore, Shanghai/Shenzhen):**\n- Traded in CNY on China's domestic exchanges (SSE and SZSE)\n- Historically restricted to domestic investors; now accessible via Stock Connect program (Shanghai-HK and Shenzhen-HK links) with daily quota limits\n- Includes all major domestic Chinese companies: Kweichow Moutai, BYD, CATL, Industrial and Commercial Bank\n- MSCI partially includes A-shares in EM index (~5% inclusion factor vs full weight)\n\n**H-Shares (Hong Kong listed):**\n- Chinese mainland companies listed on the Hong Kong Stock Exchange, traded in HKD\n- No foreign ownership restrictions — accessible to any investor\n- Examples: HSBC, Tencent (actually a Red Chip), China Mobile, CNOOC, Ping An\n- Hang Seng China Enterprises Index (HSCEI) tracks H-shares\n\n**ADRs (US-listed):**\n- Chinese companies listed on NYSE or NASDAQ, traded in USD\n- Examples: Alibaba (BABA), JD.com (JD), Baidu (BIDU), NIO, Pinduoduo (PDD)\n- Additional risk layer: VIE (Variable Interest Entity) structure\n\n**H-share/A-share premium (AH premium):**\nThe same company's H-shares often trade at a discount to its A-shares because:\n- A-share market has more domestic retail investors (less sophisticated, more momentum-driven)\n- Foreign investors cannot freely access A-shares, reducing arbitrage",
          highlight: ["A-shares", "H-shares", "ADR", "Stock Connect", "MSCI inclusion", "Hang Seng", "VIE", "AH premium"],
        },
        {
          type: "teach",
          title: "VIE Structure Risk & Regulatory Crackdowns",
          content:
            "**VIE (Variable Interest Entity) Structure:**\nChina prohibits foreign ownership of companies in many sectors (internet, media, education, telecom). To access US capital markets, Chinese tech companies use a workaround:\n1. A Chinese company creates an offshore Cayman Islands holding company\n2. The Cayman entity lists shares in the US (ADRs)\n3. US investors own shares in the Cayman entity, not the actual Chinese operating company\n4. The Cayman entity has contractual arrangements (VIE agreements) to receive profits from the Chinese operating company\n\n**The risk**: VIE agreements are NOT legally tested in Chinese courts. If the Chinese government decided to invalidate VIE structures, US shareholders would own a shell Cayman company with no real assets. This is a known, material risk that is currently unresolved.\n\n**Regulatory Crackdowns (2020–2022):**\n- **Alibaba**: Ant Group IPO cancelled in November 2020; Alibaba fined $18B by SAMR (antitrust); Jack Ma disappeared from public view. Alibaba stock fell ~75% from peak.\n- **Didi**: Forced to delist from NYSE in 2022 after regulators ordered app removal citing data security concerns; launched IPO investigation post-listing.\n- **Education sector**: July 2021 — Chinese government banned for-profit tutoring for school-age students overnight. TAL Education and New Oriental lost 90%+ of value in weeks.\n- **Tech sector broadly**: Beijing pushed through 'platform economy' regulations targeting Tencent, Meituan, and others.\n\n**Lesson**: Regulatory risk in China is not incremental — it can be sudden, severe, and target entire sectors.",
          highlight: ["VIE structure", "Cayman entity", "Alibaba", "Didi", "education crackdown", "regulatory risk", "platform economy"],
        },
        {
          type: "teach",
          title: "China Macro & Taiwan Risk Premium",
          content:
            "**China Macroeconomic Challenges:**\n\n**Property Sector Debt Crisis:**\nChina's property sector (historically ~25% of GDP including construction) accumulated unsustainable debt levels. Evergrande defaulted on ~$300B in liabilities in 2021. Country Garden, Sunac, and others followed. Property investment and consumer confidence fell sharply — a significant drag on China's growth model.\n\n**Demographic Headwind:**\nChina's working-age population peaked and is now declining. The one-child policy legacy means an aging population with an inadequate pension system. Workforce decline structurally reduces potential GDP growth.\n\n**China Growth Slowdown:**\nAfter decades of 8–10% GDP growth, China is now growing at 4–5%. The era of hypergrowth driven by urbanization, infrastructure, and export manufacturing is largely over.\n\n**US-China Decoupling:**\nOngoing trade war (tariffs up to 145% on some goods), tech export restrictions (CHIPS Act, Huawei restrictions), and supply chain reshoring create structural headwinds for China-exposed investments.\n\n**Taiwan Risk (Cross-Strait Tension Premium):**\nTaiwan produces ~90% of the world's most advanced semiconductors (TSMC). Military tension between China and Taiwan creates a geopolitical risk premium:\n- TSMC and Taiwan-listed companies trade at a discount to reflect invasion risk\n- US defense commitments to Taiwan are ambiguous ('strategic ambiguity')\n- A Taiwan conflict would be catastrophic for global semiconductor supply — priced into risk premiums of all Taiwan-exposed companies globally",
          highlight: ["Evergrande", "property crisis", "aging population", "growth slowdown", "decoupling", "Taiwan", "TSMC", "cross-strait tension"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor holds Chinese ADRs (e.g., BABA, BIDU) listed on US exchanges. A major regulatory crackdown is announced targeting the platform economy. What options does the investor realistically have?",
          options: [
            "Sell the ADRs on the US exchange at market price, accept the loss, or hold and await regulatory clarity — but cannot easily convert to H-shares or A-shares without a separate account",
            "Automatically convert ADRs to H-shares at the same price through their US broker",
            "File a claim with MIGA insurance for regulatory losses",
            "The US SEC will suspend the crackdown to protect US investor interests",
          ],
          correctIndex: 0,
          explanation:
            "US investors in Chinese ADRs have limited options. They can sell on the US market (accepting whatever price the market offers) or hold and wait. Converting to Hong Kong H-shares requires a Hong Kong brokerage account and involves a separate conversion process. MIGA insurance covers expropriation and war risk, not regulatory actions affecting stock prices. The US SEC has no authority over Chinese domestic regulatory decisions. This illustrates why position sizing in high-regulatory-risk countries is critical.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "When a US investor buys Alibaba's US-listed ADRs, they are acquiring direct legal ownership of Alibaba's Chinese operating businesses.",
          correct: false,
          explanation:
            "False. Due to the VIE (Variable Interest Entity) structure, US investors buying BABA ADRs own shares in a Cayman Islands holding company, not in Alibaba's actual Chinese operating businesses. The Cayman entity has contractual rights to receive profits from the Chinese operations — but these contracts have never been fully tested in Chinese courts. If the Chinese government invalidated VIE agreements, US shareholders would own a shell entity. This is a disclosed but unresolved structural risk for all Chinese tech ADRs.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: India & ASEAN Growth Stories ──────────────────────────────────
    {
      id: "em-5",
      title: "India & ASEAN Growth Stories",
      description:
        "India demographics and digital infrastructure, Nifty50/Sensex, ASEAN nations, RCEP, and EM investment vehicles",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "India: The Demographic & Digital Story",
          content:
            "India has emerged as one of the most compelling structural growth stories in global markets:\n\n**Demographic Advantage:**\n- **Largest working-age population in the world** (surpassed China in 2023)\n- Median age ~28 years vs China's ~39 and Germany's ~47\n- A younger workforce means higher labor force growth, more consumers entering peak spending years, and longer runway for productivity gains\n- Unlike China, India's demographic dividend is still ahead, not behind\n\n**Digital Public Infrastructure (DPI):**\nIndia built a world-class digital stack that is enabling financial inclusion at scale:\n- **Aadhaar**: Biometric national ID covering 1.4+ billion people — eliminates fake identities, enables KYC in seconds\n- **UPI (Unified Payments Interface)**: Real-time interbank payment system processing ~10 billion transactions/month — the most-used digital payment system in the world\n- **DigiLocker**: Government document storage — tax returns, licenses, certificates all digital\n- **ONDC (Open Network for Digital Commerce)**: Open e-commerce protocol challenging Amazon/Flipkart monopoly\n\nThis infrastructure dramatically lowers the cost of delivering financial services, healthcare, and commerce to hundreds of millions of previously underserved Indians — creating massive investable opportunities.",
          highlight: ["demographics", "working-age population", "Aadhaar", "UPI", "digital infrastructure", "financial inclusion", "India growth story"],
        },
        {
          type: "teach",
          title: "India Equity Markets & Sectoral Opportunities",
          content:
            "**Indian Equity Markets:**\n- **BSE (Bombay Stock Exchange)**: Asia's oldest exchange (1875); home to the **Sensex** (30-stock index)\n- **NSE (National Stock Exchange)**: Larger by volume; home to the **Nifty 50** (50-stock index) — the primary institutional benchmark\n- India is now the **4th-largest equity market globally** by market cap (~$4.5T), overtaking Hong Kong\n- Foreign Portfolio Investors (FPIs) face ownership limits by sector; insurance capped at 49%, defense at 26% for foreign entities\n\n**Key Sectoral Opportunities:**\n\n**Financials (Largest sector, ~30% of Nifty):**\nIndia's banking penetration is still growing — rural India is significantly underbanked. HDFC Bank, ICICI Bank, and Kotak Mahindra have multi-decade runway. NBFCs (Non-Bank Financial Companies) serve segments too small for traditional banks.\n\n**IT Services (~15% of Nifty):**\nInfosys, TCS, Wipro, HCL Tech — global delivery of software engineering. India's IT sector benefits from English proficiency, STEM graduates (1.5M engineering graduates/year), and a 30–40% cost advantage vs US talent.\n\n**Consumer (~12%):**\nHindustan Unilever, ITC, Asian Paints — playing the rising middle class. India's consumer market is projected to become the 3rd-largest globally by 2027.\n\n**Valuation note**: India's premium P/E (~22× forward) vs peers like Brazil (~9×) reflects higher growth expectations and stronger institutional quality — investors pay up for the better growth + governance combination.",
          highlight: ["Sensex", "Nifty 50", "BSE", "NSE", "HDFC Bank", "Infosys", "TCS", "financial inclusion", "IT services", "consumer"],
        },
        {
          type: "teach",
          title: "ASEAN: Southeast Asia's Growth Engines",
          content:
            "**ASEAN (Association of Southeast Asian Nations)** — 10 countries, ~680 million people, ~$3.6T combined GDP — is one of the world's most dynamic regional blocs.\n\n**Key Markets:**\n\n**Indonesia (~280M people):**\nLargest ASEAN economy; abundant natural resources (nickel, coal, palm oil). Jakarta Stock Exchange (IDX) dominated by banks, commodities, and consumer staples. Nickel reserves critical for EV batteries make Indonesia a strategic economy.\n\n**Vietnam (Manufacturing Hub):**\nBeneficiary of US-China decoupling — factories relocated from China to Vietnam (Nike, Samsung, Apple supply chain). Strong GDP growth (6–7%/year), young workforce, improving infrastructure. HOSE (Ho Chi Minh Stock Exchange) is frontier market-classified; upgrade to EM status pending.\n\n**Philippines (~115M people):**\nLarge remittance economy (overseas workers), English-speaking BPO hub, growing consumer market. PSEi index heavily weighted toward conglomerates (Ayala Corp, SM Investments, JG Summit).\n\n**Thailand:**\nMature ASEAN market; strong manufacturing (auto parts, electronics), tourism. SET index — one of ASEAN's most liquid markets.\n\n**ASEAN Integration:**\n- **RCEP (Regional Comprehensive Economic Partnership)**: World's largest free trade agreement by population and GDP — covers ASEAN+6 (China, Japan, South Korea, Australia, New Zealand). Reduces tariffs and harmonizes trade rules across 15 countries.\n- **ASEAN+3 (China, Japan, South Korea)**: Financial cooperation frameworks including Chiang Mai Initiative (currency swap agreements to prevent 1997-style crises)",
          highlight: ["ASEAN", "Indonesia", "Vietnam", "Philippines", "Thailand", "RCEP", "ASEAN+3", "manufacturing hub", "decoupling beneficiary"],
        },
        {
          type: "teach",
          title: "EM Investment Vehicles: ETFs, Active Funds & ADRs",
          content:
            "**Broad EM ETFs:**\n- **VWO** (Vanguard FTSE Emerging Markets ETF): Largest EM ETF by AUM; ~0.08% expense ratio; tracks FTSE EM (excludes South Korea)\n- **EEM** (iShares MSCI Emerging Markets ETF): Tracks MSCI EM (includes South Korea); older, more liquid options market for hedging\n- **IEMG** (iShares Core MSCI Emerging Markets): Broader coverage than EEM; lower expense ratio\n\n**Single-Country ETFs:**\n- **INDA** (iShares MSCI India ETF): Pure India exposure; Nifty 50 and large-cap Indian stocks\n- **EWZ** (iShares MSCI Brazil ETF): Brazil; heavily weighted to commodities and financials\n- **FXI** (iShares China Large-Cap ETF): Top 50 Chinese H-shares; dominated by financials and tech\n- **MCHI** (iShares MSCI China ETF): Broader China coverage including A-shares\n- **EWT** (iShares MSCI Taiwan ETF): Taiwan; ~60% TSMC and semiconductor sector\n\n**Active EM Funds:**\nArgument for active management is stronger in EM than DM because:\n- Less efficient price discovery in smaller EM markets\n- Country allocation matters enormously (India vs Brazil can differ by 50%+ in a year)\n- Stock-level due diligence uncovers governance issues that indices don't screen for\n\n**Direct ADRs:**\nFor individual stock exposure: BABA (Alibaba), INFY (Infosys), VALE (Vale), PBR (Petrobras), ITUB (Itaú Unibanco). Higher conviction, higher concentration risk.",
          highlight: ["VWO", "EEM", "IEMG", "INDA", "EWZ", "FXI", "EWT", "active management", "ADR", "single-country ETF"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor compares two EM opportunities: India's Nifty 50 index trades at a forward P/E of 22×, with GDP growth of 7%/year and a Rule of Law score of 55/100. Brazil's Bovespa index trades at a forward P/E of 9×, with GDP growth of 2.5%/year and a Rule of Law score of 45/100.",
          question: "Which market is likely the better value opportunity, and what is the strongest argument?",
          options: [
            "India at 22× is arguably better value despite the higher P/E — faster growth, better governance, digital infrastructure, and a stronger structural growth story justify the premium",
            "Brazil at 9× is definitively better value — lower P/E always means better value regardless of growth",
            "Both are identical in value because P/E × growth rate is equal for both",
            "Neither is investable because both have Rule of Law scores below 75/100",
          ],
          correctIndex: 0,
          explanation:
            "This is the classic growth vs valuation debate. A 9× P/E sounds cheap, but if Brazil grows at 2.5% with weaker institutions, the intrinsic value may not be higher than India at 22× with 7% growth and improving governance. Using a PEG ratio: India = 22/7 = 3.1×; Brazil = 9/2.5 = 3.6× — India actually appears cheaper on a growth-adjusted basis. Additionally, India's superior Rule of Law, digital infrastructure advantages, and demographic tailwinds suggest the growth rate is more sustainable. However, Brazil's commodity exposure (iron ore, oil, soybeans, lithium) provides a different kind of value — a portfolio might hold both for diversification.",
          difficulty: 3,
        },
      ],
    },
  ],
};
