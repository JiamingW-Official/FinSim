import type { Unit } from "./types";

export const UNIT_INTERNATIONAL_MARKETS: Unit = {
  id: "international-markets",
  title: "International Markets & Global Investing",
  description:
    "Master global market structure, currency risk, emerging vs developed markets, geopolitical risk, and building a diversified international portfolio",
  icon: "🌍",
  color: "#6366f1",
  lessons: [
    // ─── Lesson 1: Global Market Structure ──────────────────────────────────────
    {
      id: "intl-1",
      title: "🌐 Global Market Structure",
      description:
        "Major exchanges worldwide, market cap by country, trading hours, and key global indices",
      icon: "Globe",
      xpReward: 70,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🏛️ Major Exchanges Around the World",
          content:
            "Equity markets operate on exchanges across every continent, each with distinct characteristics.\n\n**Americas:**\n- **NYSE & NASDAQ (US)**: World's largest by market cap — home to Apple, Microsoft, Amazon. NYSE lists many blue-chip industrials; NASDAQ is tech-heavy.\n- **TSX (Canada)**: Toronto Stock Exchange — dominated by financials, energy, and mining.\n\n**Europe:**\n- **LSE (London)**: UK's primary exchange; FTSE 100 includes multinationals like Shell and HSBC.\n- **Euronext (Europe)**: Pan-European exchange operating in Paris, Amsterdam, Brussels, Lisbon, Dublin, and Oslo.\n- **Deutsche Börse / Xetra (Germany)**: Home of DAX — German industrial and automotive giants.\n\n**Asia-Pacific:**\n- **TSE (Japan)**: Tokyo Stock Exchange — Nikkei 225 tracks Japan's top blue chips.\n- **SSE & SZSE (China)**: Shanghai and Shenzhen exchanges — A-shares (mainland China investors) and H-shares (Hong Kong).\n- **BSE & NSE (India)**: Bombay and National Stock Exchanges — fastest-growing major market.\n- **ASX (Australia)**: Australian Securities Exchange — strong in mining, banks, and REITs.\n\n**Why it matters**: Each exchange has different listing standards, investor protections, and liquidity profiles — all factors in assessing investment risk.",
          highlight: ["NYSE", "NASDAQ", "LSE", "Euronext", "TSE", "SSE", "BSE", "ASX", "TSX"],
        },
        {
          type: "teach",
          title: "📊 Global Market Cap & Trading Hours",
          content:
            "**Market Cap Distribution (approximate 2024):**\n- United States: ~42% of global market cap\n- Europe: ~18%\n- China: ~10%\n- Japan: ~6%\n- Emerging Markets (ex-China): ~12%\n- Rest of World: ~12%\n\nThe US dominates global markets — many investors unknowingly hold concentrated US exposure.\n\n**Trading Hours & Time Zones:**\nBecause exchanges span all time zones, *someone* is always trading:\n- Tokyo opens first (0:00–6:00 UTC)\n- European markets open mid-morning UTC (7:00–15:30)\n- US markets overlap with Europe's close (13:30–20:00 UTC)\n- After US close, Asia re-opens — creating a near-24-hour cycle\n\n**Implication for investors:**\n- Overnight gaps: A US investor can wake up to significant moves in their foreign holdings.\n- Liquidity windows: ADRs (US-listed foreign shares) trade in US hours but may gap at open to reflect overnight foreign market moves.\n- Arbitrage: When the same company trades in two markets, prices must converge within the trading session.",
          highlight: ["market cap", "trading hours", "time zones", "ADR", "liquidity", "arbitrage"],
        },
        {
          type: "teach",
          title: "📈 Key Global Indices",
          content:
            "**Single-Country Indices:**\n- **S&P 500**: 500 large US companies — most tracked index in the world\n- **FTSE 100**: 100 largest UK-listed companies\n- **DAX**: 40 largest German companies (total return index — dividends reinvested)\n- **Nikkei 225**: 225 Japanese blue chips, price-weighted like the DJIA\n- **Hang Seng**: Major Hong Kong companies including Chinese H-shares\n- **S&P/ASX 200**: 200 largest Australian companies\n\n**Multi-Country Indices (by MSCI):**\n- **MSCI World**: Covers ~1,500 stocks across **23 developed countries** (US, Europe, Japan, Australia, Canada, etc.). No emerging markets.\n- **MSCI Emerging Markets (EM)**: ~1,400 stocks across 24 emerging market countries. China, India, Taiwan, South Korea make up ~60%.\n- **MSCI ACWI (All Country World Index)**: Combines Developed + Emerging — ~2,900 stocks across 47 countries.\n\n**Why indices matter**: They serve as benchmarks. A global equity fund is judged against MSCI ACWI; a European fund against MSCI Europe. Outperforming your benchmark is the definition of alpha.",
          highlight: ["S&P 500", "FTSE 100", "DAX", "Nikkei 225", "MSCI World", "MSCI Emerging Markets", "MSCI ACWI", "benchmark"],
        },
        {
          type: "quiz-mc",
          question:
            "Which index covers approximately 1,500 stocks across 23 developed countries, excluding emerging markets?",
          options: [
            "MSCI World",
            "MSCI ACWI",
            "MSCI Emerging Markets",
            "S&P Global 1200",
          ],
          correctIndex: 0,
          explanation:
            "MSCI World covers ~1,500 stocks in 23 developed market countries. It does NOT include emerging markets. MSCI ACWI (All Country World Index) adds both developed and emerging markets together for ~47 countries total.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The United States represents approximately 75% of global equity market capitalization.",
          correct: false,
          explanation:
            "False. The US represents approximately 42% of global market cap — still the largest single country by far, but not three-quarters. Europe is about 18%, China about 10%, and Japan about 6%. This is why international diversification matters: the majority of global opportunity is outside the US.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 2: Currency Risk & Hedging ──────────────────────────────────────
    {
      id: "intl-2",
      title: "💱 Currency Risk & Hedging",
      description:
        "How FX movements affect returns, hedged vs unhedged ETFs, carry trade, and covered interest parity",
      icon: "ArrowLeftRight",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "💹 How Currency Movements Affect Returns",
          content:
            "When investing internationally, your total return has two components:\n\n**Total Return (USD) = Local Return + FX Return** (approximately)\n\nMore precisely:\n(1 + Total Return) = (1 + Local Return) × (1 + FX Return)\n\n**Example — Japanese stock:**\n- Stock gains +10% in Japanese Yen (JPY)\n- But JPY weakens 8% vs US Dollar\n- USD return = (1.10 × 0.92) – 1 = 1.012 – 1 ≈ **+1.2%**\n\nThe currency headwind nearly wiped out a strong local gain.\n\n**Example — Euro-zone stock:**\n- Stock falls –3% in EUR\n- EUR strengthens +7% vs USD\n- USD return = (0.97 × 1.07) – 1 = 1.038 – 1 ≈ **+3.8%**\n\nCurrency tailwind turned a local loss into a USD gain.\n\n**Key insight**: Currency effects can be larger than stock price movements over short horizons. A 15% currency swing is not unusual in EM countries. Understanding your net FX exposure is essential for international investors.",
          highlight: ["local return", "FX return", "currency risk", "currency headwind", "currency tailwind"],
        },
        {
          type: "teach",
          title: "🛡️ Hedged vs Unhedged ETFs",
          content:
            "**Unhedged ETFs** give you full exposure to both the foreign market AND the currency:\n- **EWJ** (iShares MSCI Japan ETF): You own Japanese stocks + JPY/USD exposure\n- If Japan rises 10% but JPY falls 8%, you net roughly 1–2%\n\n**Hedged ETFs** neutralize the currency, giving you the local equity return:\n- **DXJ** (WisdomTree Japan Hedged Equity ETF): Hedges out JPY/USD movement\n- If Japan rises 10% and JPY falls 8%, you still get approximately +10%\n\n**Currency Hedging Cost:**\nHedging is NOT free. The cost is approximately the **interest rate differential** between the two currencies (covered interest parity).\n\nCost ≈ Foreign Rate – Domestic Rate\n\nIf Japan rates = 0.1% and US rates = 5.0%:\nHedging cost ≈ 5.0% – 0.1% = **~4.9% per year**\n\nA hedged ETF would underperform the unhedged version by ~4.9% per year IF the currency stayed flat. Hedging makes sense when:\n1. The carry cost is low (rates are similar)\n2. You expect the foreign currency to depreciate\n3. Your investment horizon is short",
          highlight: ["EWJ", "DXJ", "hedged ETF", "unhedged ETF", "interest rate differential", "covered interest parity"],
        },
        {
          type: "teach",
          title: "📈 Carry Trade: Profiting from Rate Differentials",
          content:
            "The **carry trade** exploits differences in interest rates between countries.\n\n**Mechanics:**\n1. Borrow in a low-interest-rate currency (e.g., JPY at 0.1%)\n2. Convert to a high-interest-rate currency (e.g., AUD at 4.5%)\n3. Invest in that currency's assets\n4. Earn the spread: ~4.4% per year — as long as the exchange rate doesn't move against you\n\n**The risk:**\nCarry trades can unwind violently. In 2008, the JPY/USD carry trade collapsed — the JPY surged 20% in weeks as investors rushed to repay JPY loans. Losses exceeded years of accumulated carry.\n\n**Covered Interest Parity (CIP):**\nIn theory, you can't profit risk-free from rate differentials because:\nForward Rate / Spot Rate ≈ (1 + Domestic Rate) / (1 + Foreign Rate)\n\nIf CIP holds, the forward exchange rate will fully offset the rate differential — no free lunch. In practice, CIP breaks down for carry traders because they are taking currency risk (they do NOT hedge via forwards). The carry trade is thus a bet that exchange rates won't move enough to offset the rate differential.",
          highlight: ["carry trade", "interest rate differential", "covered interest parity", "forward rate", "spot rate", "unwinding"],
        },
        {
          type: "quiz-mc",
          question:
            "A European stock returns +8% in EUR for the year. The EUR weakens 5% against the USD. What is the approximate USD return?",
          options: [
            "~+3% — currency drag reduces the EUR gain",
            "~+13% — currency moves add to local return",
            "~+8% — currency effects cancel out over time",
            "~–5% — the currency loss dominates",
          ],
          correctIndex: 0,
          explanation:
            "Total USD return = (1.08 × 0.95) – 1 = 1.026 – 1 ≈ +2.6%, approximately +3%. The EUR depreciation by 5% partially offsets the 8% local stock gain. This illustrates how currency headwinds reduce international returns for USD-based investors.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Currency hedging in ETFs is always beneficial because it removes unpredictable currency risk without any cost.",
          correct: false,
          explanation:
            "False. Currency hedging has a real cost — approximately equal to the interest rate differential between the two countries. If US rates are 5% and Japanese rates are 0.1%, hedging a Japan exposure costs ~4.9% per year. Hedging is only beneficial if the foreign currency depreciates by more than the hedging cost.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Emerging vs Developed Markets ────────────────────────────────
    {
      id: "intl-3",
      title: "🚀 Emerging vs Developed Markets",
      description:
        "Risk-return profiles, BRICS, frontier markets, EM valuations, and why EM often disappoints",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🏙️ Developed Markets: Stability at a Price",
          content:
            "**Developed Markets (DM)** are characterized by:\n- **Stable institutions**: Rule of law, property rights, independent central banks\n- **Deep, liquid markets**: Large free float, tight bid-ask spreads, reliable settlement\n- **Regulatory transparency**: Strong disclosure requirements, minority investor protections\n- **Lower growth**: Mature economies — GDP growth typically 1–3% per year\n\n**Key DM countries/blocs:**\n- United States, Canada\n- United Kingdom, Germany, France, Switzerland, Netherlands\n- Japan, Australia, Singapore, Hong Kong, South Korea (recently reclassified)\n- Nordic countries (Sweden, Norway, Denmark, Finland)\n\n**Valuation**: DM stocks typically trade at higher P/E multiples (15–25×) reflecting lower risk premiums. Investors accept lower expected returns in exchange for more predictable outcomes.\n\n**The tradeoff**: You pay more (higher multiple) for greater predictability, stronger institutions, and lower tail risk. For most long-term investors, a core DM allocation makes sense before adding EM exposure.",
          highlight: ["developed markets", "rule of law", "liquidity", "stability", "P/E", "risk premium"],
        },
        {
          type: "teach",
          title: "🌱 Emerging Markets: Growth with Risk",
          content:
            "**Emerging Markets (EM)** offer higher potential returns alongside higher risks:\n\n**Characteristics:**\n- Higher GDP growth potential (3–8%+ per year)\n- Less mature institutions — policy uncertainty, weaker rule of law\n- Currency volatility — EM currencies often depreciate vs USD over time\n- Political risk — elections, policy reversals, expropriation risk\n- Liquidity risk — smaller free floats, wider spreads, harder to exit large positions\n\n**Major EM countries (MSCI EM index):**\nChina (~30%), India (~20%), Taiwan (~18%), South Korea (~13%), Brazil, Saudi Arabia, South Africa, Mexico, Indonesia\n\n**The EM paradox — higher growth ≠ higher returns:**\nDespite GDP growth rates often 2–3× higher than DM, EM stock returns have frequently disappointed:\n1. High growth is often already priced in (high expectations)\n2. Growth accrues to workers/government, not equity shareholders\n3. Dilution from new share issuance is common\n4. Currency depreciation erodes USD returns\n\n**Frontier Markets**: The next tier below EM — Vietnam, Nigeria, Bangladesh, Kazakhstan, Romania. Higher risk, lower liquidity, but potentially uncorrelated to global markets.",
          highlight: ["emerging markets", "political risk", "currency risk", "BRICS", "frontier markets", "EM paradox"],
        },
        {
          type: "teach",
          title: "📉 BRICS & EM Valuations",
          content:
            "**BRICS** (Brazil, Russia, India, China, South Africa) were celebrated as the engines of 21st-century growth. Reality has been uneven:\n\n- **Brazil**: Volatile — political instability, commodity dependence, high inflation\n- **Russia**: Sanctioned in 2022; stocks became untradeable for Western investors\n- **India**: Strong performer — demographic dividend, growing middle class, tech sector\n- **China**: Complex — regulatory crackdowns (Alibaba, Didi, education sector) spooked investors; property crisis (Evergrande)\n- **South Africa**: Structural challenges — power outages, high unemployment, political uncertainty\n\n**EM Valuations: Cheap or Value Trap?**\nEM stocks historically trade at lower P/E multiples than DM:\n- MSCI EM P/E: ~12–15×\n- MSCI World P/E: ~18–22×\n\nThe discount can reflect:\n1. **Genuine value opportunity**: Stocks are cheap relative to growth\n2. **Value trap**: Cheap for good reasons — poor governance, structural headwinds\n3. **Risk premium**: Investors demand higher expected returns for real risks\n\nHistorical evidence suggests the EM risk premium exists but is episodic — EM outperforms in commodity booms and dollar weakness cycles.",
          highlight: ["BRICS", "India", "China", "value trap", "EM valuation", "P/E discount", "risk premium"],
        },
        {
          type: "quiz-mc",
          question:
            "What primarily defines a market as 'emerging'?",
          options: [
            "Developing economy, lower market efficiency, and higher investment risk compared to developed markets",
            "GDP per capita below $10,000 per year",
            "Stock market established less than 50 years ago",
            "Annual stock market returns above 10% per year",
          ],
          correctIndex: 0,
          explanation:
            "Emerging markets are defined by a combination of factors: a developing (but not necessarily very poor) economy, less mature financial market infrastructure, weaker institutional protections, and higher risk-return profiles. Many EM countries like South Korea and Taiwan have GDP per capita comparable to Southern Europe — classification is about market development, not income alone.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor allocates 20% of their portfolio to an EM fund. Over the next year, EM GDP grows 6% while DM GDP grows 2%. The EM fund returns –8% while the DM fund returns +14%.",
          question: "What best explains the EM underperformance despite stronger economic growth?",
          options: [
            "GDP growth was already priced in, currency depreciated, and country-specific risks materialized",
            "The EM fund manager made poor stock selections unrelated to macro conditions",
            "Investors simply prefer DM stocks regardless of fundamentals",
            "EM countries always underperform regardless of growth rates",
          ],
          correctIndex: 0,
          explanation:
            "This illustrates the EM paradox: higher GDP growth does not automatically translate to equity returns. High growth expectations may already be priced in (high multiples at entry), currency depreciation reduces USD returns, and country-specific risks (political, regulatory) can cause multiple compression. The relationship between economic growth and stock returns is weak, especially in EM.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Geopolitical & Regulatory Risk ───────────────────────────────
    {
      id: "intl-4",
      title: "⚠️ Geopolitical & Regulatory Risk",
      description:
        "Country risk premiums, capital controls, sanctions, ADRs/GDRs, and foreign ownership limits",
      icon: "Shield",
      xpReward: 80,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🌐 Country Risk Premium",
          content:
            "Every country carries a **country risk premium (CRP)** — an additional return demanded by investors for bearing country-specific risks not present in a stable DM investment.\n\nCRP reflects:\n- **Political risk**: Government instability, coup risk, expropriation\n- **Regulatory risk**: Sudden law changes, corruption, opaque courts\n- **Default risk**: Sovereign debt default spreading to private companies\n- **Convertibility risk**: Risk that you cannot repatriate your profits\n\n**Damodaran's approach to CRP:**\nCRP = (Country Default Spread) × (Equity Market Volatility / Bond Market Volatility)\n\nExample: Brazil CDS spread = 2.5%, equity/bond vol ratio = 1.5×\nCRP = 2.5% × 1.5 = **3.75%**\n\nThis is added to the equity risk premium when discounting Brazilian company cash flows:\nCost of Equity = Risk-Free Rate + Beta × (ERP + CRP)\n\n**Practical implication**: A Brazilian company growing at the same rate as a US peer should trade at a lower P/E because its cash flows are discounted at a higher rate. CRP explains much of the EM valuation discount.",
          highlight: ["country risk premium", "CRP", "political risk", "expropriation", "convertibility risk", "equity risk premium"],
        },
        {
          type: "teach",
          title: "🚧 Capital Controls, Sanctions & Nationalization",
          content:
            "**Capital Controls**: Restrictions on the movement of money in or out of a country.\n- **Argentina**: Multiple currency crises — official vs black market exchange rates diverged by 100%+; investors effectively trapped their capital at unfavorable rates\n- **China**: RMB is not freely convertible. Foreign investors must use approved channels (Stock Connect, QFII quotas). Capital controls limit the ability to exit quickly.\n- **Iceland 2008**: Post-financial crisis capital controls froze foreign investors in Icelandic assets for years.\n\n**Nationalization Risk**: Government takes control of private assets — often with inadequate compensation.\n- Venezuela nationalized oil companies and utilities under Chávez\n- Zimbabwe's land seizures destroyed agricultural sector value\n- Saudi Arabia effectively forced Saudi Aramco to remain state-controlled\n\n**Sanctions Risk** (the most extreme form):\n- **Russia 2022**: Following the Ukraine invasion, Western governments imposed sweeping sanctions.\n- Russian stocks in Western portfolios **became effectively worthless/untradeable**.\n- London-listed Russian ADRs were suspended; settlement systems (Euroclear) froze Russian assets.\n- Investors could not sell, receive dividends, or repatriate capital.\n\n**Lesson**: Geopolitical risk can cause total loss, not just underperformance. Position sizing in high-risk countries should reflect this.",
          highlight: ["capital controls", "nationalization", "sanctions", "Argentina", "China", "Russia 2022"],
        },
        {
          type: "teach",
          title: "🌉 ADRs, GDRs & Foreign Ownership Limits",
          content:
            "**American Depositary Receipts (ADRs)** allow US investors to buy shares in foreign companies on US exchanges, in USD, without dealing with foreign brokers.\n\n- Bank (e.g., JPMorgan) holds foreign shares and issues corresponding receipts\n- ADRs trade on NYSE or NASDAQ during US hours\n- Dividends paid in USD (after foreign withholding tax)\n- Examples: Alibaba (BABA), TSMC (TSM), Toyota (TM), Novo Nordisk (NVO)\n\n**Global Depositary Receipts (GDRs)**: Same concept but listed on European exchanges (London, Luxembourg).\n\n**Risks specific to ADRs/GDRs**:\n- ADR holders may have weaker voting rights than ordinary shareholders\n- If the underlying exchange halts trading, the ADR can become illiquid\n- Russia 2022 demonstrated that ADRs can be suspended and become worthless\n\n**Foreign Ownership Limits**:\n- **China A-shares**: Mainland Chinese stocks restricted to foreign investors via Stock Connect (Shanghai-Hong Kong and Shenzhen-Hong Kong programs) with daily quota limits\n- **India FPI Limits**: Foreign Portfolio Investors face aggregate ownership caps (typically 24% of paid-up capital per company, with sectoral caps in banking, insurance, defense)\n- **Vietnam**: Many companies cap foreign ownership at 49% to protect strategic industries\n\nThese limits can create price dislocations between the same company's shares in different markets.",
          highlight: ["ADR", "GDR", "depositary receipt", "Stock Connect", "foreign ownership limits", "FPI limits"],
        },
        {
          type: "quiz-mc",
          question:
            "What happened to Western investors who held Russian ADRs after the 2022 Ukraine invasion sanctions?",
          options: [
            "Their ADRs were suspended and became effectively worthless and untradeable",
            "They received a cash buyout at the pre-invasion price from the Russian government",
            "The ADRs continued trading but at a 30% discount to pre-invasion prices",
            "The ADRs were automatically converted to US Treasury bonds",
          ],
          correctIndex: 0,
          explanation:
            "Russian ADRs were suspended on Western exchanges following the 2022 sanctions. Settlement systems like Euroclear froze Russian assets, making it impossible for Western investors to sell, receive dividends, or repatriate capital. The ADRs became effectively worthless for Western holders — a stark illustration of how sanctions can cause total loss of investment, not just underperformance.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "ADR holders always have identical voting rights and the same economic claims as holders of the underlying foreign shares.",
          correct: false,
          explanation:
            "False. ADR holders may have weaker or no voting rights compared to ordinary shareholders in the foreign company. The bank issuing the ADR (depository bank) holds the underlying shares and may not pass through voting rights. Additionally, in extreme scenarios like sanctions or exchange halts, ADR holders can face additional liquidity risks not borne by local shareholders.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Building a Global Portfolio ──────────────────────────────────
    {
      id: "intl-5",
      title: "🏗️ Building a Global Portfolio",
      description:
        "Home bias, diversification benefits, global ETFs, foreign dividend taxes, and rebalancing across currencies",
      icon: "Globe2",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🏠 The Home Bias Problem",
          content:
            "**Home bias** is the well-documented tendency of investors to overweight their home country stocks, often dramatically.\n\nSurvey data consistently shows:\n- US investors hold ~75–80% of their equity in US stocks\n- UK investors hold ~50–60% in UK stocks\n- Japanese investors hold ~55% in Japanese stocks\n\n**The mathematical problem**: The US represents ~42% of global market cap. Holding 80% in US stocks means you are **dramatically overweight** the US relative to a market-cap-weighted world portfolio.\n\n**Why home bias exists:**\n1. Familiarity — investors know US brands and companies\n2. Currency certainty — no FX risk on domestic holdings\n3. Tax simplicity — no foreign withholding tax\n4. Perceived information edge — you can follow domestic news\n\n**Why it's a problem:**\n1. Concentration risk — when the US market falls, 80% of your portfolio falls\n2. You miss global opportunities — India, Japan, and European stocks can outperform for years\n3. Sector bias — US is very tech-heavy; global diversification provides healthcare, energy, industrials exposure\n4. Valuation risk — when US P/E is high (25–30×), international stocks may offer better value",
          highlight: ["home bias", "market cap weight", "concentration risk", "diversification", "US overweight"],
        },
        {
          type: "teach",
          title: "📦 Practical Implementation: Global ETFs",
          content:
            "**Total World ETFs** — single fund covering the entire global equity market:\n- **VT** (Vanguard Total World Stock ETF): ~9,000 stocks, 49 countries, 0.07% expense ratio. Auto-rebalances as global weights shift.\n- **VXUS** (Vanguard Total International Stock ETF): Everything *except* the US — good for investors who already have US exposure and want only international.\n\n**Regional ETFs:**\n- **EFA**: MSCI EAFE (Europe, Australasia, Far East) — developed markets ex-US\n- **EEM** / **VWO**: MSCI Emerging Markets\n- **VGK**: Vanguard European ETF\n- **EWJ**: iShares MSCI Japan ETF\n\n**Single-Country ETFs:**\n- **EWZ** (Brazil), **INDA** (India), **FXI** (China large-cap), **EWA** (Australia)\n- Higher concentration risk — useful for tactical views, not core holdings\n\n**Factor tilt within international:**\n- International value has historically outperformed — EFV (iShares EAFE Value)\n- Small-cap international adds diversification — VSS (Vanguard FTSE All-World ex-US Small Cap)\n\n**Rule of thumb for a balanced global portfolio:**\nMarket-cap weight: ~42% US + ~35% other DM + ~12% EM + ~11% frontier/cash\nA simpler version: 60% VTI (US total market) + 40% VXUS (international)",
          highlight: ["VT", "VXUS", "EFA", "EEM", "VWO", "total world ETF", "regional ETF", "single-country ETF"],
        },
        {
          type: "teach",
          title: "🧾 Tax Considerations & Rebalancing",
          content:
            "**Foreign Dividend Withholding Tax:**\nWhen a foreign company pays you a dividend, the foreign country withholds a tax — typically 15–30% — before you receive the cash.\n\nCommon withholding rates:\n- Germany: 26.375% | France: 30% | Japan: 15.315%\n- Switzerland: 35% (but treaty reduces to 15% for US investors)\n- Canada: 15% | Australia: 30% (reduced to 15% via treaty)\n\nThis is the **primary drag on international dividend investing** — you pay foreign tax in addition to US tax on the net dividend.\n\n**Tax Treaty Benefits:**\nThe US has tax treaties with ~60+ countries that reduce withholding to 15% (sometimes less for qualified recipients like pension funds).\n\n**Form 1116 (Foreign Tax Credit):**\nUS taxpayers can typically claim a credit for foreign taxes paid — offsetting US tax liability. This effectively eliminates double taxation for many investors.\n\n**Important exception**: Dividends received via ADRs in IRAs/401(k)s do NOT benefit from the foreign tax credit — the withholding is simply lost, making tax-advantaged accounts suboptimal for high-yielding international stocks.\n\n**Rebalancing across currencies:**\n- If USD strengthens, your international holdings shrink in USD terms — you buy more international to rebalance\n- If you own both hedged and unhedged international ETFs, consider maintaining target hedge ratio\n- Annual rebalancing is sufficient for most long-term investors",
          highlight: ["foreign withholding tax", "Form 1116", "foreign tax credit", "tax treaty", "rebalancing", "IRA limitation"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the primary drag on international dividend investing for US-based investors?",
          options: [
            "Foreign tax withholding on dividends, typically 15–30% taken before the investor receives payment",
            "Higher brokerage commissions on foreign stocks",
            "Currency conversion fees charged by the exchanges",
            "US capital gains tax rates are higher on foreign income",
          ],
          correctIndex: 0,
          explanation:
            "Foreign governments withhold tax on dividends before they reach the US investor — typically 15–30% depending on the country and any applicable tax treaties. While a Form 1116 foreign tax credit can offset this in taxable accounts, dividends received through international ETFs in retirement accounts (IRA, 401k) lose this foreign withholding permanently with no offsetting credit available.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor has a $100,000 portfolio that is 85% in US stocks. The US represents 42% of global market cap. International stocks have traded at a 30% P/E discount to US stocks for the past decade.",
          question: "What is the strongest case for adding international exposure to this portfolio?",
          options: [
            "Reduce home bias concentration risk and access cheaper valuations — international stocks at lower P/E offer better prospective returns",
            "International stocks always outperform US stocks over any 10-year period",
            "Adding international stocks eliminates all currency risk through natural diversification",
            "US stocks are prohibited from being the dominant holding in a balanced portfolio",
          ],
          correctIndex: 0,
          explanation:
            "The investor is dramatically overweight the US (85% vs 42% market weight) — classic home bias. Adding international exposure reduces concentration risk and accesses potentially better valuations (30% P/E discount historically). International diversification doesn't eliminate currency risk (that requires hedging) and doesn't guarantee outperformance, but it improves the risk-adjusted return profile by reducing dependence on any single country's market cycle.",
          difficulty: 3,
        },
      ],
    },
  ],
};
