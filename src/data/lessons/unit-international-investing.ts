import type { Unit } from "./types";

export const UNIT_INTERNATIONAL_INVESTING: Unit = {
  id: "international-investing",
  title: "International Investing",
  description:
    "Master global portfolio construction: ADRs, country risk, currency impact, international ETFs, and navigating China's complex equity landscape",
  icon: "Globe2",
  color: "#0ea5e9",
  lessons: [
    // ─── Lesson 1: Why Invest Internationally ────────────────────────────────────
    {
      id: "intl-1",
      title: "Why Invest Internationally",
      description:
        "Diversification benefits, valuation disparities, growth opportunities, and the home bias trap that costs investors returns",
      icon: "Globe",
      xpReward: 60,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "The Home Bias Trap",
          content:
            "Most investors dramatically over-allocate to their home country — a behavioral pattern called **home bias**.\n\n**The Numbers:**\n- US investors: ~80% of equity holdings are US stocks, yet the US is ~60% of global market cap\n- Australian investors: hold ~66% domestic despite Australia being ~2% of global cap\n- Japanese investors: hold ~55% domestic despite Japan being ~6% of global cap\n\n**Why Home Bias Exists:**\n- Familiarity: investors know Nike, Apple, and Amazon from daily life\n- Perceived safety: foreign investing feels riskier even when it isn't\n- Currency discomfort: seeing prices in JPY or EUR feels uncertain\n- News flow: investors absorb more US business news than international\n\n**The Real Cost of Home Bias:**\nBy over-weighting the US, investors:\n1. Miss diversification benefits (different economic cycles)\n2. Forego exposure to faster-growing economies\n3. Concentrate in richly-valued markets when cheaper alternatives exist\n4. Accept single-country political and regulatory risk\n\nThe remedy is not to eliminate home bias entirely, but to be intentional: hold roughly 30–40% international equities as a starting framework.",
          highlight: ["home bias", "diversification", "30–40% international", "over-allocation", "economic cycles"],
        },
        {
          type: "teach",
          title: "Diversification Benefits & Historical Returns",
          content:
            "**Correlation is the Key Metric:**\nInternational diversification works because different markets don't move in lockstep. Lower correlation between two assets = greater diversification benefit.\n\n**Historical Correlations (20-year avg):**\n- US vs Developed International (EAFE): ~0.86 — moderate diversification\n- US vs Emerging Markets: ~0.75 — meaningful diversification\n- US vs Frontier Markets: ~0.50 — strong diversification\n\nNote: Correlations increase during crises (2008, 2020) — so-called \"correlation breakdown\" when you need diversification most.\n\n**Historical Return Cycles (Annualized):**\n\n| Period | S&P 500 | MSCI EAFE | MSCI EM |\n|--------|---------|----------|---------|\n| 2000–2009 | -1.0% | +1.6% | +9.8% |\n| 2010–2019 | +13.6% | +5.7% | +3.7% |\n| 2020–2024 | +15.7% | +8.1% | +2.1% |\n\nLesson: performance leadership rotates. The 2000s \"lost decade\" for US stocks was a golden decade for international. Diversification means never being fully wrong — and never being fully right either.\n\n**Efficient Frontier Impact:**\nAdding international equities to a US-only portfolio shifts the efficient frontier upward and to the left — same expected return with lower volatility, or higher expected return for the same volatility.",
          highlight: ["correlation", "efficient frontier", "MSCI EAFE", "MSCI EM", "lost decade", "performance rotation"],
        },
        {
          type: "teach",
          title: "Valuation Disparity & Growth Opportunity",
          content:
            "**Why Valuations Differ Globally:**\nNot all stock markets trade at the same price-to-earnings multiple. Differences reflect:\n- Growth expectations\n- Interest rate environments\n- Geopolitical risk premiums\n- Earnings quality and accounting standards\n- Currency risk compensation\n\n**Shiller CAPE Ratios (Cyclically Adjusted P/E, 2024):**\n- US: ~33× — elevated by historical standards\n- UK: ~14× — discounted due to energy/finance sector weight\n- Germany: ~16× — industrial economy at moderate valuation\n- Japan: ~22× — re-rated upward with corporate governance reforms\n- India: ~30× — premium for high growth\n- Brazil: ~9× — political/currency risk discount\n- China: ~11× — regulatory and geopolitical risk discount\n\n**Valuation Disparity Opportunity:**\nWhen the US CAPE is 2–3× that of other developed markets, rational investors allocate more internationally. This is called **CAPE-based tactical allocation**. Research by Meb Faber (\"Global Value\") shows buying the world's cheapest markets by CAPE has historically generated superior long-run returns.\n\n**Growth Opportunity:**\nEM countries like India, Indonesia, Vietnam, and Nigeria offer:\n- Younger demographics (median age 26–28 vs 38+ in US)\n- Low but rising income levels (larger addressable consumer market growth)\n- Infrastructure buildout multiplying economic activity\n- Tech leapfrogging: mobile payments, digital banking without legacy infrastructure",
          highlight: ["CAPE ratio", "valuation disparity", "Shiller CAPE", "tactical allocation", "growth opportunity", "demographics"],
        },
        {
          type: "quiz-mc",
          question:
            "A US investor holds 85% of their equity portfolio in US stocks. The US represents about 60% of global market cap. This investor's portfolio most likely suffers from:",
          options: [
            "Home bias — over-allocation to the domestic market relative to its global weight",
            "Currency risk — holding too many foreign assets",
            "Benchmark risk — underweighting the S&P 500",
            "Emerging market overexposure — too much concentration in volatile markets",
          ],
          correctIndex: 0,
          explanation:
            "The investor holds 85% in a market that represents ~60% of global cap — a 25 percentage point overweight. This is classic home bias. It reduces diversification benefit, concentrates in one country's economic cycle, and misses potentially cheaper international valuations. The rational starting point is to hold international roughly proportional to global market cap (about 40%), though a modest home bias is understandable given currency, tax, and liquidity considerations.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "International diversification provides the greatest benefit during market crises, because correlations between global markets tend to fall sharply when volatility spikes.",
          correct: false,
          explanation:
            "False. This is the 'correlation breakdown' problem — when crises hit, correlations typically RISE toward 1.0 as investors globally sell risk assets simultaneously. During the 2008 financial crisis and the 2020 COVID crash, nearly all equity markets fell together. Diversification works best in normal periods; it partially fails precisely when investors most want protection. This is why including true non-correlated assets (bonds, commodities, alternatives) is important — not just geographic diversification.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: ADRs & GDRs ───────────────────────────────────────────────────
    {
      id: "intl-2",
      title: "ADRs & GDRs",
      description:
        "How American Depositary Receipts work, Level 1/2/3 programs, ADR ratios, and the depositary bank's role",
      icon: "Building2",
      xpReward: 70,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What Is an ADR?",
          content:
            "An **American Depositary Receipt (ADR)** is a US-listed security that represents ownership of shares in a foreign company. ADRs allow US investors to buy foreign stocks through US brokers, in USD, during US market hours, without opening overseas brokerage accounts.\n\n**How ADRs Work — The Mechanism:**\n1. A US **depositary bank** (typically Bank of New York Mellon, Citibank, or JP Morgan) purchases foreign shares in the local market\n2. The depositary holds those shares in a custodian account in the foreign country\n3. The depositary issues **ADR certificates** in the US, each representing a specific number of underlying foreign shares\n4. US investors trade these ADR certificates on US exchanges (NYSE, NASDAQ, OTC)\n5. Dividends paid in foreign currency are converted to USD by the depositary before distribution\n\n**ADR vs GDR:**\n- **ADR**: Listed in the US (NYSE, NASDAQ, or OTC markets)\n- **GDR (Global Depositary Receipt)**: Listed in multiple markets simultaneously — often London Stock Exchange or Luxembourg. Used by companies wanting broader global investor access.\n\n**Examples of Well-Known ADRs:**\n- **BABA** — Alibaba (China H-share ADR)\n- **ASML** — ASML Holding (Netherlands)\n- **SAP** — SAP SE (Germany)\n- **NVO** — Novo Nordisk (Denmark)\n- **TM** — Toyota Motor (Japan)",
          highlight: ["ADR", "GDR", "depositary bank", "Bank of New York Mellon", "Citibank", "underlying shares", "USD"],
        },
        {
          type: "teach",
          title: "Sponsored vs Unsponsored ADRs & Level 1/2/3",
          content:
            "**Sponsored vs Unsponsored:**\n\n**Sponsored ADR**: The foreign company actively participates in establishing the ADR program. The company files disclosures with the SEC and has a formal agreement with the depositary bank. Investors receive full shareholder rights including voting.\n\n**Unsponsored ADR**: Created by a depositary bank without the foreign company's direct involvement. Multiple competing unsponsored ADRs can exist for the same company. Less regulatory oversight; voting rights may be limited. Common for large multinationals whose shares are in demand by US investors.\n\n**Three Levels of Sponsored ADRs:**\n\n**Level 1 — OTC Markets only:**\n- Traded on OTC Bulletin Board or Pink Sheets, not major exchanges\n- Minimal SEC reporting — only required to comply with home country standards\n- Cannot raise new capital in the US\n- Example: Many European and Asian companies testing US investor interest\n\n**Level 2 — Listed on NYSE/NASDAQ:**\n- Must register with SEC and file Form 20-F (annual report equivalent)\n- Must reconcile financials to US GAAP or IFRS\n- Higher visibility and liquidity\n- Cannot raise new capital via the ADR\n\n**Level 3 — Full US Public Offering:**\n- Can issue NEW shares and raise capital from US investors\n- Full SEC registration and ongoing reporting (Form 20-F annually, 6-K for material events)\n- Most rigorous disclosure requirements\n- Used by companies doing IPOs in the US: e.g., Alibaba's 2014 NYSE IPO was a Level 3 ADR",
          highlight: ["Level 1", "Level 2", "Level 3", "sponsored", "unsponsored", "SEC", "Form 20-F", "NYSE", "NASDAQ", "OTC"],
        },
        {
          type: "teach",
          title: "ADR Ratios, Currency Conversion & Costs",
          content:
            "**ADR Ratio (Ratio of Underlying Shares):**\nEach ADR represents a specific number of underlying foreign shares — the **ADR ratio**. This is set at inception to bring the ADR price into a \"normal\" US trading range ($5–$50).\n\n**Examples:**\n- **Toyota (TM)**: 1 ADR = 2 ordinary shares. If Toyota ordinary = ¥3,000 and USD/JPY = 150, then TM ≈ (3,000 × 2) / 150 = **$40**\n- **ASML (ASML)**: 1 ADR = 1 ordinary share (both trade at similar prices)\n- **Infosys (INFY)**: 1 ADR = 1 ordinary share\n- Some ADRs are fractional: 1 ADR = 0.1 ordinary shares (for very expensive home-market stocks)\n\n**Currency Conversion:**\nWhen a foreign company pays a dividend in local currency (e.g., ¥50/share), the depositary bank:\n1. Receives the yen dividend from the custodian in Japan\n2. Converts yen to USD at the current spot rate (minus fees)\n3. Distributes USD dividends to ADR holders\n\nThis means ADR dividend yields fluctuate with exchange rates — a 5% yield in local terms might become 3% or 7% in USD terms depending on currency moves.\n\n**Depositary Bank Fees:**\nADR holders typically pay a **depositary fee** of $0.01–$0.05 per ADR per year, deducted from dividend payments or charged directly. This is a small but real cost of the ADR structure.\n\n**Arbitrage Mechanism:**\nIf the ADR price diverges significantly from the underlying adjusted for exchange rate, sophisticated traders execute arbitrage: buying the cheap leg and shorting the expensive leg until prices converge. This keeps ADR prices closely aligned with their underlying shares.",
          highlight: ["ADR ratio", "currency conversion", "depositary fee", "arbitrage", "dividend conversion", "underlying shares"],
        },
        {
          type: "quiz-mc",
          question:
            "Toyota ordinary shares trade at ¥3,600 on the Tokyo Stock Exchange. The ADR ratio is 1 ADR = 2 ordinary shares, and USD/JPY = 144. What is the theoretical fair value of one Toyota ADR in USD?",
          options: [
            "$50.00 — calculated as (3,600 × 2) / 144",
            "$25.00 — calculated as 3,600 / 144",
            "$25.00 — calculated as (3,600 / 2) / 144",
            "$72.00 — calculated as 3,600 / 50",
          ],
          correctIndex: 0,
          explanation:
            "Each ADR represents 2 ordinary shares, so the value in yen is 3,600 × 2 = ¥7,200. Dividing by the exchange rate: ¥7,200 / 144 = $50.00. If the ADR trades significantly away from this level, arbitrageurs would trade the divergence until prices converge. The ADR ratio is set at inception to place the US-listed price in a normal range, not to reflect a 1:1 share count.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A Level 1 ADR can be listed on the NYSE and allows the foreign company to raise new capital from US public investors.",
          correct: false,
          explanation:
            "False on both counts. Level 1 ADRs are restricted to OTC markets (Pink Sheets / OTC Bulletin Board) and cannot be listed on major exchanges like the NYSE or NASDAQ. Level 1 also cannot be used to raise new capital from US investors. To list on a major exchange, the company needs a Level 2 ADR (no new capital) or Level 3 ADR (can raise new capital through public offerings).",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 3: Country Risk Analysis ────────────────────────────────────────
    {
      id: "intl-3",
      title: "Country Risk Analysis",
      description:
        "Political risk, currency risk, regulatory risk, IFRS vs US GAAP, and the EM vs frontier market distinction",
      icon: "ShieldAlert",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Political & Regulatory Risk",
          content:
            "**Political Risk** refers to the possibility that government actions will negatively affect the value of investments. It spans a spectrum:\n\n**Low Political Risk (Developed Markets):**\n- Rule of law — contracts are enforceable\n- Property rights protected\n- Independent judiciary\n- Democratic accountability reduces policy reversals\n\n**Moderate Political Risk (Most EM):**\n- Periodic election-driven policy swings\n- State-owned enterprises competing with private sector\n- Selective enforcement of regulations\n- Foreign ownership limits in strategic sectors\n\n**High Political Risk Examples:**\n- **Nationalization/Expropriation**: Venezuela nationalized oil assets in 2007; Bolivia nationalized lithium in 2023\n- **Capital Controls**: Argentina imposed capital controls limiting USD purchases; Egypt restricted USD repatriation\n- **Sanctions**: US sanctions on Russia (2022) made Russian ADRs untradeable overnight; investors effectively lost access\n- **Regulatory reversals**: China's 2021 crackdown on EdTech companies (TAL Education, New Oriental) wiped out 80–90% of market cap in weeks\n\n**Accounting Standards Risk:**\n- **IFRS** (International Financial Reporting Standards): used in 140+ countries — EU, UK, Australia, Canada, India\n- **US GAAP**: used in the United States; Level 2/3 ADRs must reconcile to US GAAP or use IFRS\n- **China GAAP**: diverges meaningfully from IFRS — more management discretion, related-party transactions harder to detect\n- **Auditing standards**: PCAOB inspection rights were denied in China until 2022; audit quality concerns persist",
          highlight: ["political risk", "nationalization", "capital controls", "sanctions", "IFRS", "US GAAP", "China GAAP", "expropriation"],
        },
        {
          type: "teach",
          title: "Currency Risk & Emerging vs Frontier Markets",
          content:
            "**Currency Risk in International Investing:**\nWhen you invest in a foreign stock, you hold two positions simultaneously:\n1. The stock position (in local currency)\n2. A currency position (local currency vs your home currency)\n\nIf the Brazilian real depreciates 20% against the USD while Petrobras stock rises 15% in BRL, your USD return is approximately +15% - 20% = **-5%**.\n\n**EM Currency Structural Bias:**\nEM currencies have a long-run tendency to depreciate against the USD due to:\n- Higher inflation rates in EM economies (purchasing power parity)\n- Commodity dependence creating cyclical currency volatility\n- Capital flow reversals during global risk-off episodes (\"sudden stops\")\n\n**Emerging vs Frontier Markets — Risk Differences:**\n\n| Feature | Emerging Markets | Frontier Markets |\n|---------|-----------------|------------------|\n| MSCI Countries | 24 | ~30 |\n| Liquidity | Adequate for institutions | Often thin |\n| Political Stability | Moderate | Low to moderate |\n| Currency Volatility | Medium-High | High |\n| Entry/Exit | Relatively easy | Can be difficult |\n| Correlation to DM | ~0.75 | ~0.50 |\n| Example | Brazil, India | Vietnam, Nigeria |\n\n**Credit Ratings as Country Risk Proxy:**\nSovereign credit ratings (S&P, Moody's, Fitch) reflect ability and willingness to repay debt. Investment grade (BBB-/Baa3 or above) vs speculative grade (\"junk\") status affects borrowing costs and often predicts currency stress.\n\n- Brazil: BB (speculative grade) — significant currency risk\n- India: BBB- (lowest investment grade) — moderate risk\n- Germany: AAA — minimal credit risk",
          highlight: ["currency risk", "EM currencies", "depreciation", "frontier markets", "sovereign credit rating", "investment grade", "capital flow reversals"],
        },
        {
          type: "quiz-mc",
          question:
            "In 2021, China's government issued new regulations that effectively prohibited for-profit tutoring of school-age children. Companies like TAL Education and New Oriental saw their stocks fall 80–90% within weeks. This illustrates which type of international investment risk?",
          options: [
            "Regulatory risk — sudden government policy reversals can devastate entire industries overnight",
            "Currency risk — the yuan depreciated sharply against the USD",
            "Liquidity risk — investors were unable to sell their shares due to thin markets",
            "Interest rate risk — rising Chinese rates reduced EdTech company valuations",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook case of regulatory risk — the Chinese government unilaterally restructured the entire for-profit education industry without warning or compensation. The companies were legally operating businesses; policy changed overnight. Currency and liquidity were not primary factors. This highlights why country risk analysis must include an assessment of the government's willingness to intervene in private enterprise, and why a higher discount rate (lower P/E multiple) is warranted for companies operating in high-regulatory-risk jurisdictions.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "IFRS and US GAAP are effectively identical accounting standards, so financial statements from European companies are directly comparable to US companies without any adjustments.",
          correct: false,
          explanation:
            "False. While IFRS and US GAAP have converged significantly over the past 20 years, meaningful differences remain. Key divergences include: LIFO inventory accounting (allowed under US GAAP, prohibited under IFRS), development costs (IFRS may capitalize, US GAAP expenses), goodwill impairment testing methods, and certain financial instrument treatments. Analysts must understand these differences when comparing cross-border valuations. Level 2 ADR filers must either use IFRS or reconcile to US GAAP in Form 20-F filings.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Currency Impact ───────────────────────────────────────────────
    {
      id: "intl-4",
      title: "Currency Impact on Returns",
      description:
        "Local vs USD returns, USD strength effects on EM, strategic vs tactical hedging, and hedging cost calculations",
      icon: "TrendingUp",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Local Returns vs USD Returns",
          content:
            "**The Two-Return Problem:**\nAn international investor earns two simultaneous returns:\n1. **Local return**: how the stock performed in its home currency\n2. **Currency return**: how the home currency moved versus USD\n\n**Combined USD Return (approximate formula):**\n`USD Return ≈ Local Return + Currency Return`\n\n*More precisely: (1 + Local) × (1 + Currency) - 1*\n\n**Real-World Examples:**\n\n*Example 1 — Currency Tailwind:*\nJapanese stock rises 10% in yen. Japanese yen appreciates 8% vs USD.\nUSD Return ≈ 10% + 8% = **+18%**\n\n*Example 2 — Currency Headwind:*\nBrazilian stock rises 20% in BRL. Brazilian real depreciates 25% vs USD.\nUSD Return ≈ 20% - 25% = **-5%** (stock outperformed in local terms, investor still lost money)\n\n*Example 3 — Local loss, currency gain:*\nEuropean stock falls 5% in euros. Euro appreciates 10% vs USD.\nUSD Return ≈ -5% + 10% = **+5%**\n\n**Why This Matters for Interpretation:**\nIndex returns in USD (MSCI reporting) already include currency. When comparing manager performance, you need to know: is the benchmark currency-hedged or unhedged? A European manager with strong stock selection may look poor to a US investor if the euro weakens — or excellent if the euro strengthens — independent of skill.",
          highlight: ["local return", "USD return", "currency return", "currency tailwind", "currency headwind", "MSCI reporting"],
        },
        {
          type: "teach",
          title: "USD Strength & Its Impact on EM",
          content:
            "**Why a Strong Dollar Hurts EM:**\nThe US dollar is the global reserve currency and the denomination of most commodity trade and EM external debt. When the dollar strengthens:\n\n1. **EM debt burden rises**: If an EM country borrowed in USD (as many do), a stronger dollar means more local currency is needed to service the same USD debt payments\n\n2. **Capital outflows**: Investors move capital from EM back to the US to capture higher USD yields — putting pressure on EM currencies to depreciate further\n\n3. **Commodity prices fall**: Commodities are priced in USD globally; a stronger dollar makes commodities cheaper in USD terms, hurting commodity-exporting EM countries (Brazil, Chile, South Africa)\n\n4. **Corporate FX mismatches**: EM companies that earn in local currency but have USD debt face a squeeze when the dollar strengthens\n\n**Historical Precedent — The \"Dollar Smile\":**\nThe dollar tends to strengthen during two scenarios:\n- US economic outperformance (capital flows to the US)\n- Global risk-off / crisis (safe-haven demand for USD)\nBoth scenarios are bad for EM equities, creating a double whammy: EM stocks fall AND the currency depreciates simultaneously.\n\n**2022 Case Study:**\nThe Fed hiked rates aggressively → USD surged ~15% → Most EM currencies depreciated → EM equities fell in local terms AND lost more in USD terms → Worst EM year in a decade.\n\n**Policy Response:**\nEM central banks often raise rates to defend their currencies even when domestic economies don't require it — to prevent capital outflows and currency collapse. This creates the \"EM monetary policy trap.\"",
          highlight: ["USD strength", "dollar smile", "EM debt", "capital outflows", "commodity prices", "monetary policy trap", "risk-off"],
        },
        {
          type: "teach",
          title: "Currency Hedging: Strategy & Costs",
          content:
            "**Should You Hedge Currency Exposure?**\nThis is one of the most debated questions in international investing.\n\n**Arguments FOR hedging:**\n- Reduces volatility of USD returns\n- Removes currency uncertainty for investors with USD liabilities\n- In a rising-dollar environment, hedged international outperforms unhedged\n- Hedged ETFs (e.g., EWJ vs HEWJ for Japan) exist for easy implementation\n\n**Arguments AGAINST hedging:**\n- Long-run currency effects tend to wash out (purchasing power parity)\n- EM currencies often can't be efficiently hedged — forward markets are thin\n- Hedging costs can be significant (see below)\n- Currency exposure adds diversification vs a USD-dominated portfolio\n\n**Hedging Cost Calculation — Interest Rate Parity:**\nThe cost to hedge equals the interest rate differential between the two currencies:\n\n`Annual Hedging Cost ≈ Foreign Interest Rate − US Interest Rate`\n\nExamples (2024 approximate rates):\n- Hedging EUR: EUR rate ~3.5%, USD rate ~5.3% → **Cost = −1.8%** (actually a benefit — you EARN when hedging EUR!)\n- Hedging JPY: JPY rate ~0.5%, USD rate ~5.3% → **Cost = +4.8%** per year to hedge yen\n- Hedging BRL: BRL rate ~10.5%, USD rate ~5.3% → **Cost = −5.2%** (benefit when hedging BRL)\n\n**Strategic vs Tactical Hedging:**\n- **Strategic**: Permanent hedge on 50% of foreign currency exposure — reduces volatility without taking a view\n- **Tactical**: Actively adjust hedge ratio based on USD outlook — 0% hedged when USD is expected to weaken, 100% when expected to strengthen",
          highlight: ["currency hedging", "interest rate parity", "hedging cost", "hedged ETF", "strategic hedging", "tactical hedging", "purchasing power parity"],
        },
        {
          type: "quiz-mc",
          question:
            "A US investor holds Japanese stocks that rise 12% in yen. During the same period, the Japanese yen depreciates 15% versus the USD. What is the investor's approximate USD return?",
          options: [
            "Approximately -3% — the currency loss more than offsets the local stock gain",
            "Approximately +27% — local and currency returns add together favorably",
            "Approximately +12% — currency moves don't affect USD returns on foreign stocks",
            "Approximately -15% — only the currency return matters for USD investors",
          ],
          correctIndex: 0,
          explanation:
            "USD return ≈ Local return + Currency return = +12% + (−15%) = −3%. More precisely: (1.12 × 0.85) − 1 = 0.952 − 1 = −4.8%. The currency loss more than offset the solid local stock performance. This illustrates why a US investor holding unhedged Japanese stocks must care about USD/JPY movements, not just Nikkei performance. Japan's low interest rates make the yen vulnerable during risk-off episodes, and hedging yen exposure costs approximately 4–5% per year given the large interest rate differential.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Currency hedging always reduces risk for international investors and should therefore always be applied to all foreign equity holdings.",
          correct: false,
          explanation:
            "False. While hedging reduces currency volatility, it introduces its own costs and risks. For many EM currencies, hedging is expensive or impractical due to thin forward markets. Currency exposure can actually add diversification value to a USD-dominated portfolio. The cost of hedging (interest rate differential) can be substantial — hedging Japanese yen exposure costs ~4–5% per year. And over long periods, currencies tend to revert toward purchasing power parity, so hedging may sacrifice return for reduced short-term volatility. A strategic 50% hedge is often more appropriate than all-or-nothing.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: International ETFs ────────────────────────────────────────────
    {
      id: "intl-5",
      title: "International ETFs",
      description:
        "MSCI EAFE (VEA), MSCI EM (VWO), single-country ETFs, smart beta international, expense ratios, and tracking error",
      icon: "BarChart3",
      xpReward: 70,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "Core International ETF Building Blocks",
          content:
            "International ETFs are the most efficient way for most investors to gain global diversification. Here are the key building blocks:\n\n**Broad Developed International — MSCI EAFE:**\n- **VEA** (Vanguard FTSE Developed Markets): ~0.05% expense ratio, ~4,000 holdings, covers Europe/Australasia/Far East excluding US/Canada\n- **EFA** (iShares MSCI EAFE): ~0.32% expense ratio, slightly different index methodology\n- **SPDW** (SPDR Portfolio Developed World ex-US): ~0.04% expense ratio\n- Top country weights: Japan (~23%), UK (~14%), France (~12%), Germany (~10%), Switzerland (~9%)\n\n**Broad Emerging Markets — MSCI EM:**\n- **VWO** (Vanguard FTSE Emerging Markets): ~0.08% expense ratio; note: uses FTSE index which excludes South Korea\n- **EEM** (iShares MSCI EM): ~0.68% expense ratio — more expensive but often more liquid for trading\n- **IEMG** (iShares Core MSCI EM): ~0.09% expense ratio — the iShares low-cost alternative\n- Top country weights: China (~28%), India (~18%), Taiwan (~17%), South Korea (~14% — in IEMG/EEM only)\n\n**All-World ex-US — One Fund Solution:**\n- **VXUS** (Vanguard Total International Stock): combines developed + emerging, ~0.07% ER, ~8,000 holdings\n- **IXUS** (iShares Core MSCI Total International): ~0.07% ER, similar coverage\n\n**Pro Tip**: For long-term investors, VXUS or SPDW provides the simplest single-fund international exposure. The extra 0.5–0.6% expense ratio of older ETFs like EEM and EFA compounds significantly over decades.",
          highlight: ["VEA", "VWO", "EEM", "IEMG", "VXUS", "expense ratio", "MSCI EAFE", "MSCI EM", "FTSE"],
        },
        {
          type: "teach",
          title: "Single-Country ETFs & Smart Beta International",
          content:
            "**Single-Country ETFs:**\nFor tactical tilts or conviction bets on specific countries:\n\n- **EWJ** — iShares Japan, ~0.50% ER; **HEWJ** — currency-hedged Japan variant\n- **EWG** — iShares Germany, ~0.50% ER\n- **EWZ** — iShares Brazil, ~0.58% ER; high tracking error due to currency volatility\n- **EPI** — WisdomTree India Earnings, ~0.84% ER; earnings-weighted (not market-cap weighted)\n- **KWEB** — KraneShares CSI China Internet, ~0.70% ER; concentrated China tech exposure\n- **MCHI** — iShares MSCI China, ~0.58% ER; broader China exposure\n\n**Consideration**: Single-country ETFs have higher expense ratios and concentrated risk. Use only for deliberate tactical allocations, not as core holdings.\n\n**Smart Beta International ETFs:**\nFactor-based approaches applied to international markets:\n\n- **VYMI** (Vanguard International High Dividend): tilts toward value/income internationally, ~0.22% ER\n- **IQLT** (iShares MSCI International Quality): selects high ROE, stable earnings, low leverage companies globally\n- **DFAX** (Dimensional International Core Equity Market): academic factor tilts (size + value), ~0.18% ER\n- **EFAV** (iShares MSCI EAFE Min Vol): low-volatility factor internationally, reduces drawdowns\n\n**Tracking Error:**\nThe difference between an ETF's return and its benchmark index return. Causes include:\n- Expense ratio drag\n- Transaction costs from index rebalancing\n- Sampling (large indices may not hold every stock)\n- Currency conversion friction\n- Securities lending income (can REDUCE tracking error)\n\nGood international ETF tracking error: < 0.5% annually. Poor: > 1% annually.",
          highlight: ["EWJ", "EWZ", "KWEB", "MCHI", "smart beta", "tracking error", "factor tilts", "VYMI", "EFAV"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor wants the lowest-cost way to hold broad emerging market exposure. Which choice has the highest expense ratio, making it the least efficient for a long-term buy-and-hold investor?",
          options: [
            "EEM at ~0.68% expense ratio",
            "VWO at ~0.08% expense ratio",
            "IEMG at ~0.09% expense ratio",
            "SPDW at ~0.04% expense ratio",
          ],
          correctIndex: 0,
          explanation:
            "EEM (iShares MSCI Emerging Markets ETF) has an expense ratio of ~0.68%, significantly higher than modern low-cost alternatives. On a $100,000 investment, EEM costs $680/year vs $80/year for VWO — a $600 annual difference that compounds dramatically over decades. EEM remains popular for institutional traders because of its deep liquidity and large options market, but for buy-and-hold investors, VWO or IEMG are far more cost-efficient. Note that SPDW is a developed markets (not EM) ETF.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "VWO (Vanguard FTSE Emerging Markets) and EEM (iShares MSCI Emerging Markets) track the same index and therefore hold identical country allocations.",
          correct: false,
          explanation:
            "False. VWO tracks the FTSE Emerging Markets Index, while EEM tracks the MSCI Emerging Markets Index. A key difference: FTSE classifies South Korea as a Developed Market and excludes it from EM, while MSCI classifies South Korea as an Emerging Market and includes it at ~12–14% weight. This means VWO does NOT hold Samsung, SK Hynix, or other South Korean companies, while EEM and IEMG do. Investors who assume all 'EM ETFs' are equivalent could unknowingly have very different country exposures.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: China Investing ────────────────────────────────────────────────
    {
      id: "intl-6",
      title: "China Investing",
      description:
        "A-shares, H-shares, ADRs, VIE structures, MSCI China inclusion, regulatory risk, delisting risk, and the opportunity vs risk calculus",
      icon: "Landmark",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "China's Complex Share Structure",
          content:
            "Investing in China is uniquely complex because the same company may have multiple share classes listed in different markets:\n\n**A-Shares — Shanghai/Shenzhen Stock Exchange:**\n- Renminbi (RMB)-denominated shares listed on mainland Chinese exchanges\n- Historically restricted to domestic Chinese investors; foreigners access via **Stock Connect** (Shanghai-HK and Shenzhen-HK) or QFII quota\n- Include both large state-owned enterprises and private companies\n- Higher valuations than H-shares due to domestic liquidity and retail investor participation\n- Represent the broadest cross-section of the Chinese economy\n\n**H-Shares — Hong Kong Stock Exchange:**\n- Same mainland Chinese company, but Hong Kong-listed shares denominated in HKD\n- Open to international investors without restrictions\n- Typically trade at a **discount to A-shares** (the \"A-H Premium\") of 15–40%\n- More institutionally held; subject to international accounting standards\n\n**ADRs — US-Listed:**\n- Many large Chinese companies (Alibaba, Baidu, JD.com, NetEase) list ADRs on NYSE or NASDAQ\n- Convenient USD-denominated access for US investors\n- Subject to **delisting risk** (see below) and VIE structure risk\n- Typically track H-share prices closely via arbitrage\n\n**Red Chips & P-Chips:**\n- **Red Chips**: HK-listed companies with majority state ownership (e.g., CNOOC)\n- **P-Chips**: HK-listed companies incorporated in offshore jurisdictions but operating in mainland China (private companies)",
          highlight: ["A-shares", "H-shares", "ADRs", "Stock Connect", "A-H Premium", "Red Chips", "P-Chips", "HKD", "RMB"],
        },
        {
          type: "teach",
          title: "VIE Structures & MSCI China Inclusion",
          content:
            "**The VIE Structure — A Critical Legal Risk:**\n\nChina prohibits foreign investment in certain sectors (internet, media, education, telecom). Yet companies like Alibaba, Tencent, and Baidu needed foreign capital to grow. The solution: the **Variable Interest Entity (VIE)** structure.\n\n**How VIE Works:**\n1. A Chinese founder creates two entities: an onshore Chinese operating company and an offshore holding company (often Cayman Islands)\n2. The Chinese operating company (VIE) holds all licenses and operates the actual business\n3. The offshore holding company controls the VIE through a series of contracts (not equity ownership)\n4. Foreign investors (including US public market investors) own shares in the offshore entity\n5. Investors rely on contractual rights rather than direct ownership of the Chinese business\n\n**VIE Risk:**\n- The VIE structure has never been fully tested in Chinese courts\n- If the Chinese government invalidates VIE contracts, foreign shareholders could theoretically own nothing\n- Chinese regulators have repeatedly stated VIEs operate in a \"legal gray area\"\n- When you buy Alibaba ADRs, you technically own shares in a Cayman Islands entity that has contracts with the operating business — not the business itself\n\n**MSCI China Inclusion:**\n- MSCI began adding China A-shares to the MSCI EM Index in 2018\n- Current inclusion factor: ~20% of A-shares market cap (not full inclusion)\n- Full inclusion would make China ~40%+ of MSCI EM — MSCI is cautious about capital controls, trading suspensions, and QFII constraints\n- MSCI China (the combined H-share + ADR + partial A-share index) is already ~28% of MSCI EM",
          highlight: ["VIE", "Variable Interest Entity", "Cayman Islands", "contractual rights", "MSCI inclusion", "A-share inclusion factor", "legal gray area"],
        },
        {
          type: "teach",
          title: "Regulatory Risk, Delisting Risk & Opportunity vs Risk",
          content:
            "**Regulatory Risk — Recent Examples:**\n\n**Ant Financial IPO Halt (2020):** Alibaba founder Jack Ma criticized regulators publicly. Days before Ant Financial's planned $37B IPO (the world's largest ever), Chinese regulators abruptly canceled it. Alibaba shares fell 25%+ in weeks.\n\n**DiDi Delisting (2021):** Ride-hailing giant DiDi raised $4.4B in its US IPO. Chinese regulators then ordered app stores to remove DiDi, citing data security concerns — punishing the company for proceeding with a US listing that exposed Chinese user data to US regulators. DiDi delisted from NYSE at a fraction of its IPO price.\n\n**2021 Tech Crackdown:** Broad regulatory action hit Alibaba (antitrust fine $2.8B), Tencent, Meituan, and dozens of other internet companies. Combined market cap loss: $1+ trillion.\n\n**US Delisting Risk — HFCAA:**\nThe **Holding Foreign Companies Accountable Act (HFCAA, 2020)** requires foreign companies listed in the US to allow PCAOB audit inspections. Companies from countries that block PCAOB inspection face delisting after 3 consecutive years. This targeted Chinese ADRs specifically. In 2022, after extended negotiations, China allowed PCAOB access — temporarily resolving the immediate delisting risk. However, geopolitical tensions could revive this threat.\n\n**The Opportunity vs Risk Calculus:**\n- China is the world's second-largest economy with deep, liquid equity markets\n- Chinese companies often trade at significant discounts to US peers on earnings multiples\n- BUT: regulatory risk, VIE structure, delisting risk, and US-China geopolitical tension are structural\n- Many institutional investors apply a \"China discount\" of 20–30% to fundamental valuations\n- Position sizing discipline is critical — China should rarely exceed 5–10% of a total portfolio given concentrated risk",
          highlight: ["Ant Financial", "DiDi", "HFCAA", "PCAOB", "delisting risk", "tech crackdown", "China discount", "position sizing"],
        },
        {
          type: "quiz-mc",
          question:
            "When a US investor buys Alibaba ADRs (BABA), what do they actually own from a legal standpoint?",
          options: [
            "Shares in a Cayman Islands holding company that has contractual rights (not equity ownership) over Alibaba's Chinese operating entities",
            "Direct equity ownership in Alibaba's Chinese subsidiaries registered in Hangzhou",
            "A proportional claim on Alibaba's physical assets and intellectual property in China",
            "US Treasury-backed certificates that replicate Alibaba's economic performance",
          ],
          correctIndex: 0,
          explanation:
            "Due to China's restrictions on foreign ownership in internet/tech, Alibaba uses a VIE (Variable Interest Entity) structure. Foreign investors own shares in a Cayman Islands holding company, which has contractual arrangements (not direct equity ownership) with the Chinese operating entities. The Chinese operating company holds all the actual licenses and assets. This means if Chinese courts invalidate VIE contracts, foreign shareholders could theoretically have no enforceable claim on the Chinese business. This legal ambiguity is why Chinese tech stocks trade at a discount to comparable Western peers.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You manage a $500,000 diversified portfolio. You want to add China exposure for valuation and growth reasons. Chinese large-cap tech trades at 12× forward earnings vs US tech at 28×. However, you're aware of VIE risk, potential HFCAA delisting, and China's history of sudden regulatory crackdowns.",
          question: "Which approach best reflects prudent position sizing for China exposure given the known risks?",
          options: [
            "Allocate 4–5% ($20–25K) via a broad MSCI China ETF — meaningful exposure while limiting idiosyncratic risk",
            "Allocate 25% ($125K) — the valuation discount justifies a large overweight",
            "Avoid China entirely — regulatory risk makes any allocation imprudent",
            "Buy concentrated single-stock China ADRs to maximize the valuation discount capture",
          ],
          correctIndex: 0,
          explanation:
            "A 4–5% allocation captures the valuation opportunity while respecting the multiple structural risks: VIE legal ambiguity, HFCAA delisting threats, regulatory reversal risk, and US-China geopolitical escalation. A broad ETF (like MCHI or KWEB) avoids single-company regulatory risk. The 25% allocation is excessive — concentration in a single country with multiple idiosyncratic risks violates basic diversification principles. Complete avoidance ignores legitimate valuation opportunity. Single-stock concentration amplifies company-specific regulatory risk as seen with DiDi, Alibaba, and New Oriental.",
          difficulty: 3,
        },
      ],
    },
  ],
};
