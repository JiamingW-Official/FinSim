import type { Unit } from "./types";

export const UNIT_SECTOR_ANALYSIS: Unit = {
 id: "sector-analysis",
 title: "Sector Analysis & Rotation",
 description:
 "Understand GICS sectors, their economic drivers, and how to rotate for alpha",
 icon: "PieChart",
 color: "#8B5CF6",
 lessons: [
 // Lesson 1: GICS Framework 
 {
 id: "sa-1",
 title: "GICS Framework",
 description:
 "11 GICS sectors, ICB vs GICS classification systems, S&P 500 sector weights, and how reclassifications affect benchmarks",
 icon: "PieChart",
 xpReward: 75,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "The 11 GICS Sectors",
 content:
 "The **Global Industry Classification Standard (GICS)** was developed jointly by MSCI and S&P in 1999 to provide a consistent framework for classifying companies across global equity markets. Every publicly traded company is assigned to one of **11 sectors**, which are further subdivided into 25 industry groups, 74 industries, and 163 sub-industries.\n\n**The 11 GICS sectors:**\n\n1. **Information Technology** — semiconductors, software, hardware, IT services (Apple, Microsoft, NVIDIA)\n2. **Health Care** — pharmaceuticals, biotech, medical devices, hospitals (UnitedHealth, Johnson & Johnson, Eli Lilly)\n3. **Financials** — banks, insurance, asset managers, capital markets (JPMorgan, Berkshire Hathaway, Visa)\n4. **Consumer Discretionary** — autos, retail, restaurants, media, e-commerce (Amazon, Tesla, McDonald's)\n5. **Consumer Staples** — food, beverages, household products, tobacco (Procter & Gamble, Coca-Cola, Walmart)\n6. **Industrials** — aerospace, defense, machinery, transportation, construction (Boeing, Honeywell, UPS)\n7. **Energy** — oil & gas exploration, refining, pipelines, equipment (ExxonMobil, Chevron, EOG Resources)\n8. **Materials** — chemicals, metals & mining, paper, construction materials (Linde, Freeport-McMoRan, Nucor)\n9. **Utilities** — electric, gas, water utilities; renewable energy (NextEra Energy, Duke Energy, Southern Company)\n10. **Real Estate** — REITs and real estate management/development (Prologis, American Tower, Equinix)\n11. **Communication Services** — telecom, media, entertainment, internet platforms (Meta, Alphabet, Netflix, AT&T)\n\nGICS is the most widely adopted classification system globally — it underlies the SPDR Select Sector ETFs (XLK, XLF, XLE, etc.), most institutional benchmarks, and the majority of risk factor models.",
 highlight: [
 "GICS",
 "11 sectors",
 "Information Technology",
 "Health Care",
 "Financials",
 "Consumer Discretionary",
 "Consumer Staples",
 "Industrials",
 "Energy",
 "Materials",
 "Utilities",
 "Real Estate",
 "Communication Services",
 ],
 },
 {
 type: "teach",
 title: "ICB vs GICS: Two Classification Systems",
 content:
 "While GICS dominates in North America, **ICB (Industry Classification Benchmark)** — originally developed by FTSE and Dow Jones, now owned by FTSE Russell — is widely used in European and emerging markets. Understanding both is important for global investing.\n\n**Key structural differences:**\n\n| Feature | GICS | ICB |\n|---|---|---||\n| Sectors | 11 | 11 (but differently named) |\n| Industry Groups | 25 | 20 |\n| Owner | MSCI / S&P | FTSE Russell |\n| Primary use | US/global benchmarks | European/UK markets |\n\n**Notable classification differences:**\n- ICB uses \"Telecommunications\" as a sector name vs GICS \"Communication Services\"\n- ICB includes \"Technology\" rather than \"Information Technology\"\n- Real estate is classified differently: in GICS it became its own sector in 2016 (split from Financials); in ICB it was already separate earlier\n- **Banks**: ICB separates banks into their own super-sector; GICS groups them within Financials alongside insurance and asset managers\n\n**Why it matters in practice:**\nAn \"underweight financials\" call means different things depending on which classification you use. An ICB financials basket excludes real estate; a GICS financials basket excludes real estate but may include different proportions of insurance vs banking. Always clarify which framework an analyst is using when discussing sector positioning.",
 highlight: [
 "ICB",
 "GICS",
 "FTSE Russell",
 "MSCI",
 "Real Estate",
 "Communication Services",
 "classification",
 ],
 },
 {
 type: "teach",
 title: "S&P 500 Sector Weights & Historical Shifts",
 content:
 "Sector weights in major indices change dramatically over decades, reflecting the evolution of the economy. Understanding these shifts provides context for benchmark risk and active positioning.\n\n**Current approximate S&P 500 sector weights (2024–2025):**\n- Information Technology: ~29%\n- Financials: ~13%\n- Health Care: ~12%\n- Consumer Discretionary: ~10%\n- Industrials: ~9%\n- Communication Services: ~9%\n- Consumer Staples: ~6%\n- Energy: ~4%\n- Real Estate: ~2%\n- Materials: ~2%\n- Utilities: ~2%\n\n**Historical weight evolution:**\n- **1980**: Energy was ~30% of the S&P 500 at the peak of the oil boom — today it is just 4%\n- **2000**: Technology reached ~35% of the S&P 500 at the dot-com peak — then crashed back to ~15%\n- **2016**: Real Estate became its own GICS sector (split from Financials), instantly changing benchmark weights\n- **2018**: GICS reclassified Google, Facebook, Twitter, and Netflix into Communication Services from IT and Consumer Discretionary\n\n**The benchmark reclassification effect:**\nWhen GICS moved Alphabet and Facebook to Communication Services in September 2018, IT's weight dropped ~4 percentage points immediately. Index funds had to execute billions in rebalancing trades. Managers benchmarked to GICS had instant tracking error if they didn't adjust.",
 highlight: [
 "S&P 500",
 "sector weights",
 "Information Technology",
 "Energy",
 "30%",
 "reclassification",
 "Communication Services",
 "2018",
 "benchmark",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "In 2018, GICS reclassified Alphabet (Google) and Meta (Facebook) from Information Technology and Consumer Discretionary respectively into Communication Services. What was the most immediate market impact of this reclassification?",
 options: [
 "Index funds benchmarked to GICS had to execute large rebalancing trades, buying Communication Services ETFs and selling IT/Consumer Discretionary — creating instant tracking error for managers who didn't adjust",
 "The stocks' prices dropped sharply because Communication Services is considered a lower-quality sector than Information Technology",
 "Active managers who were overweight IT automatically became overweight Communication Services with no portfolio changes needed",
 "The reclassification had no market impact because the underlying businesses and their financials did not change",
 ],
 correctIndex: 0,
 explanation:
 "GICS reclassifications force passive funds to mechanically rebalance their sector exposures. When Alphabet and Meta moved to Communication Services, SPDR's XLK (IT ETF) had to sell those holdings and XLC (Communication Services ETF) had to buy them — generating significant trading volumes. Active managers benchmarked to GICS sectors faced instant tracking error if their portfolios hadn't been adjusted in anticipation. The businesses themselves didn't change, but their classification — and therefore benchmark weightings — shifted dramatically.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Real Estate has always been one of the original 11 GICS sectors since the standard was created in 1999.",
 correct: false,
 explanation:
 "False. Real Estate was originally classified as part of the Financials sector when GICS launched in 1999. MSCI and S&P elevated Real Estate to its own standalone 11th GICS sector in August 2016, recognizing that REITs and real estate companies have fundamentally different economic characteristics from banks and insurance companies. This was the first structural change to the GICS sector count since its inception. The split meant that Financials' index weight declined overnight as Real Estate companies were carved out.",
 difficulty: 1,
 },
 ],
 },

 // Lesson 2: Sector Characteristics 
 {
 id: "sa-2",
 title: "Sector Characteristics",
 description:
 "Cyclical vs defensive vs rate-sensitive sectors, beta by sector, earnings volatility, dividend yields, leverage patterns, and stress correlations",
 icon: "BarChart2",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Cyclical vs Defensive vs Rate-Sensitive Sectors",
 content:
 "Sectors are commonly grouped by how sensitive their revenues and earnings are to the business cycle:\n\n**Cyclical sectors** — revenues rise and fall sharply with economic growth:\n- **Consumer Discretionary**: Consumers cut spending on restaurants, vacations, and new cars in recessions; splurge in expansions. High earnings volatility.\n- **Industrials**: Capital spending by corporations collapses in downturns; rebounds sharply in recoveries\n- **Energy**: Revenue tied to commodity prices, which are highly cyclical\n- **Materials**: Metals and chemicals demand tracks industrial production closely\n- **Financials**: Bank earnings tied to loan growth, credit losses, and interest rate spreads — all cyclical\n\n**Defensive sectors** — revenues are relatively stable across the cycle:\n- **Consumer Staples**: Food, household products, tobacco — inelastic demand regardless of economic conditions\n- **Health Care**: People don't postpone cancer treatment in a recession; prescription drug demand is stable\n- **Utilities**: Electricity and gas usage changes little with the economy; regulated revenue provides stability\n\n**Rate-sensitive sectors** — valuations and cash flows are particularly sensitive to interest rate changes:\n- **Utilities**: Valued for their stable dividend yield; high debt loads are re-priced as rates move\n- **Real Estate (REITs)**: Long-duration assets; high debt; yield-seeking investors rotate out when bond yields rise\n- **Financials**: Banks benefit from rising rates (net interest margins expand) but face credit risk; insurance benefits from higher investment yields\n\nNote that \"rate-sensitive\" cuts both ways — utilities and REITs typically suffer when rates rise, while bank earnings improve.",
 highlight: [
 "cyclical",
 "defensive",
 "rate-sensitive",
 "Consumer Discretionary",
 "Consumer Staples",
 "Health Care",
 "Utilities",
 "Real Estate",
 "Financials",
 ],
 },
 {
 type: "teach",
 title: "Beta, Earnings Volatility & Dividend Yield by Sector",
 content:
 "Sector characteristics can be quantified through beta, earnings variability, and dividend yield patterns — key inputs for portfolio construction.\n\n**Typical sector betas vs S&P 500 (approximate ranges):**\n- **Information Technology**: 1.2–1.5 (high beta; growth-oriented)\n- **Consumer Discretionary**: 1.1–1.3\n- **Financials**: 1.1–1.4 (high beta to economic cycle)\n- **Materials**: 1.0–1.3\n- **Industrials**: 1.0–1.2\n- **Energy**: 0.9–1.2 (can spike with oil shocks)\n- **Communication Services**: 0.8–1.1\n- **Health Care**: 0.7–0.9 (defensive)\n- **Consumer Staples**: 0.5–0.7\n- **Utilities**: 0.3–0.6 (lowest beta; bond-like)\n- **Real Estate**: 0.7–1.0\n\n**Earnings volatility:**\nEnergy and Materials have the highest EPS volatility (oil price swings translate directly to profits). Consumer Staples and Utilities have the most stable EPS trajectories.\n\n**Dividend yield patterns:**\n- **High yield**: Utilities (~3–4%), Real Estate/REITs (~3–4%), Energy (~2–4%), Consumer Staples (~2–3%)\n- **Low/no yield**: IT (~0.8%), Consumer Discretionary (~1%), Communication Services (~1%) — growth companies reinvest rather than pay dividends\n- REITs are legally required to distribute at least 90% of taxable income, ensuring persistently high yields\n- Utilities' regulated earnings support predictable dividend growth, making them bond substitutes in low-rate environments",
 highlight: [
 "beta",
 "dividend yield",
 "earnings volatility",
 "Utilities",
 "REITs",
 "90%",
 "Consumer Staples",
 "Information Technology",
 ],
 },
 {
 type: "teach",
 title: "Leverage Patterns & Stress Correlations",
 content:
 "Sector balance sheet characteristics differ markedly, affecting their behavior during market stress.\n\n**Leverage by sector:**\n- **Utilities**: Typically carry **5–8× debt/EBITDA** — among the highest in the S&P 500. This is acceptable because cash flows are highly predictable and regulated. However, high leverage means utilities are very sensitive to interest rate moves.\n- **REITs**: Similarly high leverage (loan-to-value ratios of 30–50% common). Debt is typically fixed-rate long-term, but refinancing risk exists.\n- **Technology**: Many large-cap tech companies carry **net cash** positions (more cash than debt). Apple, Microsoft, and Alphabet have historically held hundreds of billions in net cash.\n- **Financials** (banks): Banks are inherently levered (~10:1 assets/equity) but this is the business model — deposit-funded lending. Leverage is monitored by regulatory capital ratios, not conventional debt ratios.\n\n**Correlations during market stress:**\nIn severe market drawdowns (e.g., 2008, March 2020), correlations across all sectors rise toward 1.0 — diversification benefits collapse precisely when needed most. However, the ordering of sector declines is relatively consistent:\n- **First to fall hardest**: Financials, Consumer Discretionary, Energy, Materials\n- **Most resilient**: Consumer Staples, Utilities, Health Care\n- **Exception**: In a rapid rate-spike environment (2022), Utilities and REITs fall alongside growth stocks — both are long-duration assets hurt by rising discount rates",
 highlight: [
 "leverage",
 "Utilities",
 "REITs",
 "debt/EBITDA",
 "net cash",
 "stress correlation",
 "2008",
 "2022",
 "long-duration",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "In 2022, both high-growth technology stocks and utility stocks declined significantly despite utilities being considered 'defensive.' What characteristic explains why utilities underperformed during a rapid interest rate rise?",
 options: [
 "Utilities are long-duration assets with high debt loads — rising discount rates compress their valuations just as rising rates compress the present value of long-duration bonds",
 "Utility revenues are directly tied to industrial production, which fell during the 2022 economic slowdown",
 "Utilities have high beta (1.3–1.5) and always underperform in rising rate environments regardless of other factors",
 "Utility stocks underperformed because inflation raised their input costs faster than they could pass through to customers",
 ],
 correctIndex: 0,
 explanation:
 "Utilities behave like long-duration bonds: their value comes from stable, predictable cash flows extending far into the future. When interest rates rise sharply, the discount rate applied to those future cash flows increases, compressing present values. Additionally, utilities carry high debt (5-8× EBITDA), making their financing costs sensitive to rate moves. In 2022, the Fed's aggressive hiking cycle hit both growth stocks (low near-term earnings, long-duration value) and utilities (stable but distant cash flows, high leverage) — both are long-duration assets in different ways.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "REITs are required by law to distribute at least 90% of their taxable income as dividends, which is why they typically have higher dividend yields than most other sectors.",
 correct: true,
 explanation:
 "True. To qualify for REIT status (and the associated pass-through tax treatment), a REIT must distribute at least 90% of its taxable income to shareholders as dividends each year. Because REITs cannot retain the majority of their earnings, they must continually access capital markets to fund growth — issuing equity or debt to finance new property acquisitions. This mandatory distribution requirement is the structural reason REITs consistently offer dividend yields of 3–5%, significantly above the S&P 500 average, making them attractive to income-oriented investors.",
 difficulty: 1,
 },
 ],
 },

 // Lesson 3: Economic Cycle Rotation 
 {
 id: "sa-3",
 title: "Economic Cycle Rotation",
 description:
 "4-phase cycle rotation, the Fidelity sector wheel, yield curve impact on financials and utilities, and commodity sector timing",
 icon: "RefreshCw",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The 4-Phase Cycle & Classic Sector Rotation",
 content:
 "Different sectors systematically outperform at different stages of the business cycle because their revenue and profit drivers are tied to economic conditions.\n\n**Phase 1 — Early Expansion (Recovery):**\nThe economy is emerging from recession. Credit is loosening, consumers are starting to spend, and business investment is beginning to recover. \n- **Outperformers**: Consumer Discretionary (pent-up spending), Financials (loan growth, tighter credit spreads), Industrials (early capex cycle), small-cap stocks generally\n- **Underperformers**: Utilities and Consumer Staples (sold as risk appetite returns)\n\n**Phase 2 — Mid Expansion:**\nGrowth is solid and self-sustaining. Hiring is strong, corporate profits are accelerating, and animal spirits are high.\n- **Outperformers**: Information Technology (corporate IT spending, innovation investment), Health Care, broad equity market\n- This is the \"goldilocks\" phase — the longest and most rewarding for equity investors\n\n**Phase 3 — Late Expansion:**\nThe economy is running hot. Inflation is rising, wages are pressing on margins, and the Fed is hiking rates.\n- **Outperformers**: Energy (oil demand at peak, commodity prices rising), Materials (metals prices at cycle highs), inflation-linked bonds (TIPS)\n- **Underperformers**: Rate-sensitive sectors (Utilities, REITs) as rising yields hit valuations\n\n**Phase 4 — Contraction (Recession):**\nGDP is falling, unemployment is rising, credit is tightening.\n- **Outperformers**: Consumer Staples (inelastic demand), Utilities (stable revenues), Health Care (non-discretionary spend), government bonds\n- **Underperformers**: Everything cyclical — Financials, Consumer Discretionary, Industrials, Materials, Energy",
 highlight: [
 "early expansion",
 "mid expansion",
 "late expansion",
 "contraction",
 "Consumer Discretionary",
 "Financials",
 "Information Technology",
 "Energy",
 "Consumer Staples",
 "Utilities",
 ],
 },
 {
 type: "teach",
 title: "The Fidelity Sector Rotation Wheel",
 content:
 "Fidelity Investments popularized the **sector rotation wheel**, a visual framework showing how sectors rotate through the economic cycle. It remains one of the most referenced tools in active equity management.\n\n**The Fidelity wheel framework (clockwise cycle):**\nThe wheel maps sectors against the business cycle phases, with the key insight that **financial markets lead the economy by 6–12 months** — so sector positioning must anticipate cycle transitions before they're confirmed in economic data.\n\n**Practical rotation sequence:**\n1. As recession deepens rotate INTO Consumer Staples, Utilities, Health Care\n2. As early signs of recovery emerge (leading indicators turning, yield curve steepening) rotate INTO Financials, Consumer Discretionary\n3. As expansion matures rotate INTO Technology, Industrials\n4. As late expansion signals build rotate INTO Energy, Materials, Commodities\n5. As peak approaches reduce cyclicals, rotate back into defensives\n\n**The anticipation challenge:**\nThe wheel only works if you rotate **before** the economic transition is confirmed. By the time the NBER declares a recession over, Consumer Discretionary has typically already gained 20–30% from the bottom. The market prices the recovery before economists announce it.\n\n**Limitations of the model:**\n- Cycles are irregular in length and intensity; 2001 and 2020 recessions lasted only 8 months\n- Structural breaks (COVID, 2022 inflation shock) can disrupt expected rotation patterns\n- Many sector moves reflect valuation changes, not just earnings — a sector can outperform just by re-rating",
 highlight: [
 "Fidelity",
 "sector rotation wheel",
 "6-12 months",
 "financial markets lead",
 "Financials",
 "Consumer Discretionary",
 "Energy",
 "Materials",
 "anticipation",
 ],
 },
 {
 type: "teach",
 title: "Yield Curve, Financials, Utilities & Commodity Timing",
 content:
 "Two of the most important sector-macro linkages are the yield curve's impact on financials and utilities, and commodity price cycles.\n\n**Yield curve and Financials (banks):**\nBank profitability is driven by the **net interest margin (NIM)** — the spread between what banks earn on loans and what they pay on deposits. This spread is heavily influenced by the yield curve slope.\n- **Steep yield curve** (long rates much higher than short rates): Banks borrow short (deposits) and lend long (mortgages, business loans). Wide spreads = high NIM = strong bank earnings\n- **Flat/inverted yield curve**: Spreads compress; NIM falls; bank earnings suffer. An inverted curve (2-year > 10-year) is especially damaging — borrowing costs exceed lending returns\n- Historical pattern: Bank stocks typically outperform early in rate hike cycles (rising NIM) but underperform when inversion happens (spread compression + credit deterioration)\n\n**Yield curve and Utilities:**\nUtilities are negatively correlated with interest rates:\n- Rising rates utility stocks fall (yield alternative improves; higher debt costs; higher discount rates)\n- Falling rates utility stocks rally (yield spread vs bonds widens; debt costs fall)\n\n**Commodity sector timing:**\n- Energy and Materials sectors track commodity prices, which peak in the **late expansion** phase when demand is highest and supply hasn't caught up\n- Commodity sectors typically underperform in early recovery (prices still depressed) and in contraction (demand collapses)\n- The best entry for commodity stocks is when the commodity is near cycle lows but leading economic indicators are turning up",
 highlight: [
 "yield curve",
 "net interest margin",
 "NIM",
 "steep yield curve",
 "inverted yield curve",
 "Utilities",
 "Financials",
 "commodity timing",
 "late expansion",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "The Federal Reserve has been raising interest rates for 18 months. The yield curve is now inverted (2-year Treasury yields 5.2%, 10-year Treasury yields 4.6%). Which sector is most likely to see earnings pressure from this yield curve shape?",
 options: [
 "Financials (banks) — an inverted yield curve compresses net interest margins because banks borrow at short-term rates but lend at long-term rates; when short rates exceed long rates, lending becomes less profitable",
 "Energy — inverted yield curves signal falling oil demand, directly reducing energy company revenues",
 "Consumer Staples — staples companies rely heavily on short-term debt financing, making them uniquely vulnerable to high short-term rates",
 "Information Technology — tech companies' growth projections depend on a steep yield curve to calculate their discounted cash flows",
 ],
 correctIndex: 0,
 explanation:
 "Banks are structurally exposed to yield curve inversion. Their core business model — borrow short (accept deposits at short-term rates) and lend long (mortgages, corporate loans at long-term rates) — depends on the spread between these rates being positive. When the curve inverts and 2-year yields exceed 10-year yields, that spread disappears or goes negative, compressing net interest margins and reducing bank profitability. Historically, an inverted yield curve has been associated with declining bank earnings and eventual credit deterioration as the economy slows, making financials a typical underperformer during inversion periods.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An investor observes the following signals: the ISM Manufacturing PMI has risen from 47 to 52 over the past three months, the unemployment rate has stopped rising and ticked slightly lower, consumer confidence is recovering from multi-year lows, and the Federal Reserve has just made its second interest rate cut. Corporate credit spreads have narrowed from 500 bps to 350 bps over the past six months.",
 question:
 "Based on the Fidelity sector rotation framework, which sectors are best positioned for the next 12 months?",
 options: [
 "Financials and Consumer Discretionary — the signals indicate early expansion; these sectors lead recoveries as loan growth returns, credit spreads tighten, and consumer spending recovers",
 "Energy and Materials — commodity sectors always outperform when the Fed is cutting rates, regardless of cycle phase",
 "Consumer Staples and Utilities — defensive sectors should be maintained as the economy is still fragile and risks remain elevated",
 "Information Technology — IT always outperforms in the 12 months following a Fed rate cut due to lower discount rates",
 ],
 correctIndex: 0,
 explanation:
 "The data describes an early expansion/recovery phase: PMI crossing above 50 (manufacturing re-expanding), unemployment stabilizing, consumer confidence recovering, the Fed cutting rates, and credit spreads tightening sharply. The Fidelity rotation model places Financials and Consumer Discretionary as the primary outperformers in early expansion — banks benefit from normalizing credit conditions and improving loan growth; consumer discretionary companies benefit from recovering spending. Defensive sectors (Staples, Utilities) typically underperform as risk appetite returns. Energy and Materials shine later in the cycle when inflation builds, not at the recovery inflection point.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Implementation 
 {
 id: "sa-4",
 title: "Implementation: Sector ETFs & Strategy",
 description:
 "Sector ETF comparison (XLK/XLF/XLE/XLV/XLU), active vs passive tilts, relative strength analysis, top-down vs bottom-up, and common mistakes",
 icon: "TrendingUp",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Sector ETF Landscape: SPDR Select Sector Series",
 content:
 "The **SPDR Select Sector ETFs** launched in 1998 are the most liquid and widely-used instruments for pure sector exposure. They partition the S&P 500 into sector-specific funds.\n\n**Key SPDR Select Sector ETFs:**\n\n| ETF | Sector | Approx AUM | Expense Ratio |\n|-----|--------|-----------|---------------|\n| **XLK** | Information Technology | ~$70B | 0.09% |\n| **XLF** | Financials | ~$40B | 0.09% |\n| **XLE** | Energy | ~$35B | 0.09% |\n| **XLV** | Health Care | ~$37B | 0.09% |\n| **XLU** | Utilities | ~$16B | 0.09% |\n| **XLI** | Industrials | ~$19B | 0.09% |\n| **XLB** | Materials | ~$6B | 0.09% |\n| **XLC** | Communication Services | ~$20B | 0.09% |\n| **XLRE** | Real Estate | ~$7B | 0.09% |\n| **XLP** | Consumer Staples | ~$14B | 0.09% |\n| **XLY** | Consumer Discretionary | ~$22B | 0.09% |\n\n**Alternatives for more granular exposure:**\n- **iShares ETFs** (IYW, IYF, IYE) offer similar coverage at slightly higher fees\n- **Vanguard sector ETFs** (VGT, VFH, VDE) are lower cost but exclude non-S&P 500 names\n- **Equal-weight versions** (RSPT, RYF) reduce mega-cap concentration: XLK's market-cap weight means ~60% in Apple + Microsoft + NVIDIA alone\n- **Sub-sector ETFs**: SOXX (semiconductors), KRE (regional banks), XBI (biotech) for targeted exposure within a GICS sector\n\n**Concentration risk in sector ETFs:**\nXLK is heavily concentrated in its top 3 holdings. An investor buying XLK for \"tech sector exposure\" is substantially buying Apple, Microsoft, and NVIDIA — not a diversified technology basket.",
 highlight: [
 "SPDR",
 "XLK",
 "XLF",
 "XLE",
 "XLV",
 "XLU",
 "sector ETF",
 "equal-weight",
 "concentration risk",
 "0.09%",
 ],
 },
 {
 type: "teach",
 title: "Active vs Passive Sector Tilts & Relative Strength",
 content:
 "Sector rotation can be implemented on a spectrum from pure passive (hold all sectors at index weight) to active (concentrate in cycle-appropriate sectors).\n\n**Passive sector investing:**\nHolding all 11 SPDR ETFs at their S&P 500 weights is functionally equivalent to owning SPY — useful for tax management or precision transitions but not for alpha generation.\n\n**Active tilts — the institutional approach:**\nProfessional managers typically express sector views as **relative over/underweights vs benchmark** rather than binary in/out decisions:\n- **+3% to +5% overweight** in favored sectors (e.g., +4% overweight Financials at cycle recovery)\n- **-2% to -4% underweight** in unfavored sectors (e.g., -3% underweight Utilities during rate hikes)\n- Total active weights must sum to zero (overweights equal underweights)\n\n**Relative strength analysis:**\nRelative strength measures a sector's performance vs the benchmark over rolling periods. Methodology:\n1. Calculate the ratio of sector ETF (e.g., XLK) to S&P 500 (SPY): XLK/SPY\n2. Plot this ratio over time — a rising ratio means the sector is outperforming\n3. Apply a 52-week moving average to the ratio for trend confirmation\n4. **Momentum rule**: Sectors with rising relative strength tend to continue outperforming (sector momentum has shown historical persistence of 3–12 months)\n\n**Top-down vs bottom-up:**\n- **Top-down**: Start with macro view identify cycle phase select best sectors pick best stocks within sectors\n- **Bottom-up**: Start with individual stock analysis sector allocation falls out of stock picks\n- Most institutional equity managers blend both: use macro to set sector tilts, then use fundamental stock selection within sectors for additional alpha",
 highlight: [
 "relative strength",
 "active tilt",
 "overweight",
 "underweight",
 "top-down",
 "bottom-up",
 "sector momentum",
 "XLK/SPY",
 "benchmark",
 ],
 },
 {
 type: "teach",
 title: "Sector Momentum Strategy & Common Mistakes",
 content:
 "Academic research has documented that sector momentum — buying recent outperformers and selling recent underperformers — has generated positive risk-adjusted returns historically.\n\n**The sector momentum strategy:**\n- Rank all 11 sectors by trailing 3-, 6-, or 12-month total return\n- Overweight the top 3–4 sectors; underweight the bottom 3–4 sectors\n- Rebalance monthly or quarterly\n- Historical Sharpe ratios: sector momentum has generated 0.3–0.5 additional Sharpe vs the index, though with significant drawdowns in momentum crashes\n\n**Momentum crashes:**\nIn sharp market reversals, prior sector leaders (often growth sectors) sell off hardest as leverage unwinds — sector momentum can underperform dramatically for 1–3 months after major cycle turns.\n\n**Common mistakes in sector rotation:**\n\n1. **Fighting the macro cycle**: Buying beaten-down cyclicals during a recession because they're \"cheap\" — value traps abound in late cycle and early contraction\n\n2. **Confusing secular with cyclical**: Tech has structural tailwinds beyond the business cycle. Treating a 20% tech selloff as cyclical when it's actually mean-reversion from bubble valuations is a common error\n\n3. **Overly frequent rotation**: Transaction costs and tax drag can eliminate the alpha from rotation strategies that trade too often; most academic evidence supports quarterly, not monthly, rebalancing\n\n4. **Ignoring within-sector dispersion**: XLE's performance doesn't mean all energy companies perform the same; integrated majors (Exxon) and E&P companies (EOG) can diverge significantly\n\n5. **Benchmark anchoring**: Defining overweight/underweight only relative to S&P 500 may be wrong for portfolios with different mandates (dividend, value, global)",
 highlight: [
 "sector momentum",
 "momentum crash",
 "common mistakes",
 "fighting the cycle",
 "secular vs cyclical",
 "transaction costs",
 "within-sector dispersion",
 "quarterly rebalancing",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "An investor uses a top-down sector rotation strategy and identifies we are in the late expansion phase. They want to implement their view using sector ETFs. Which combination best reflects the classic late-expansion playbook?",
 options: [
 "Overweight XLE (Energy) and XLB (Materials); underweight XLU (Utilities) and XLP (Consumer Staples) — commodity sectors peak late cycle while rate-sensitive defensives are hit by rising rates",
 "Overweight XLU (Utilities) and XLP (Consumer Staples); underweight XLE (Energy) and XLK (Technology) — defensive sectors always outperform when growth is strong",
 "Overweight XLF (Financials) and XLY (Consumer Discretionary); underweight XLE (Energy) and XLB (Materials) — early recovery plays still lead in late expansion",
 "Equal weight all 11 sector ETFs — late expansion is the most uncertain phase and diversification reduces risk",
 ],
 correctIndex: 0,
 explanation:
 "Late expansion is characterized by rising inflation, commodities at cycle highs, and rising interest rates. Energy (XLE) and Materials (XLB) are the classic late-cycle outperformers — their revenues are directly tied to commodity prices that peak in this phase. Utilities (XLU) and Consumer Staples (XLP) underperform late expansion: utilities are hurt by rising rates (high leverage, yield spread vs bonds narrows), and staples' defensive premium is sold as growth momentum continues. The transition from cyclicals back to defensives happens at the cycle peak/early contraction — not yet in late expansion.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Buying the sector with the worst trailing 12-month performance (the 'cheapest' sector by recent return) is typically the optimal sector rotation strategy because mean reversion guarantees underperforming sectors will catch up.",
 correct: false,
 explanation:
 "False. Academic evidence actually supports the opposite: sector momentum (buying recent outperformers) has historically generated better risk-adjusted returns than contrarian sector rotation (buying laggards). Mean reversion in sectors is a real phenomenon, but it plays out over multi-year cycles, not reliably within 12 months. More importantly, apparent 'cheapness' from poor recent performance often reflects deteriorating fundamentals — a sector underperforming because its underlying earnings are structurally declining (e.g., legacy retail, coal) is a value trap, not a mean-reversion opportunity. Successful cycle rotation requires understanding WHY a sector has underperformed and whether the macro environment supports a reversal.",
 difficulty: 2,
 },
 ],
 },
 ],
};
