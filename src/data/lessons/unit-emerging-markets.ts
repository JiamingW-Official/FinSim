import type { Unit } from "./types";

export const UNIT_EMERGING_MARKETS: Unit = {
  id: "emerging-markets-investing",
  title: "Emerging Markets Investing",
  description:
    "Navigate the high-growth, high-risk world of emerging markets — from BRICS and MSCI indices to currency hedging, political risk, sovereign bonds, and portfolio construction across 50+ developing economies",
  icon: "🌏",
  color: "#0f766e",
  lessons: [
    // ─── Lesson 1: What Are Emerging Markets? ─────────────────────────────────
    {
      id: "emerging-markets-investing-1",
      title: "🌍 What Are Emerging Markets?",
      description:
        "Understand the BRICS nations, MSCI EM index composition, and why developing economies offer higher growth potential alongside unique risks",
      icon: "Globe",
      xpReward: 80,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "Defining Emerging Markets",
          content:
            "**Emerging markets (EM)** are economies transitioning from developing to developed status — characterized by rapid industrialization, growing middle classes, and expanding capital markets. They sit between frontier markets (less developed, less liquid) and developed markets (stable, mature economies like the US, Germany, or Japan).\n\n**Key characteristics of emerging markets:**\n- **GDP per capita**: Typically $1,000–$20,000 per year (developed markets exceed $25,000)\n- **Market capitalization**: Smaller relative to GDP but growing rapidly\n- **Institutional quality**: Less robust regulatory frameworks, legal systems, and property rights\n- **Capital flows**: More sensitive to global risk appetite — capital rushes in when investors seek yield and flees during crises\n- **Demographics**: Often younger populations with expanding labor forces\n\n**Why they matter:**\n- EM countries represent roughly 60% of global GDP (purchasing power parity)\n- They are responsible for the majority of incremental global economic growth\n- They offer diversification benefits as their economic cycles differ from developed markets\n\n**Common examples:** China, India, Brazil, South Korea, Taiwan, South Africa, Mexico, Indonesia, Russia (pre-2022 sanctions), Saudi Arabia, Poland, Turkey\n\n**Classification nuance:** Different providers disagree — South Korea is a \"developed\" market by FTSE Russell but still classified as \"emerging\" by MSCI, costing Korean exchanges billions in benchmark flows. These classification decisions have enormous real-world capital allocation consequences.",
          highlight: ["emerging markets", "frontier markets", "GDP per capita", "capital flows", "demographics"],
        },
        {
          type: "teach",
          title: "BRICS and the EM Landscape",
          content:
            "**BRICS** — originally coined by Goldman Sachs economist Jim O'Neill in 2001 — grouped Brazil, Russia, India, China, and South Africa as the dominant emerging economies expected to reshape the global order.\n\n**Original BRICS thesis:**\nO'Neill projected that by 2050, the BRICS economies would collectively exceed the G7 in economic size. The core driver: enormous populations combined with liberalizing economic policies, improving education, and technology adoption.\n\n**How the BRICS story unfolded:**\n- **China**: Exceeded all expectations — now the world's 2nd largest economy by nominal GDP, largest by PPP\n- **India**: Grew into the 5th largest economy, on track to be 3rd by 2030\n- **Brazil**: Slowed significantly; commodity dependence and political instability constrained growth\n- **Russia**: Sanctions following the 2022 Ukraine invasion effectively excluded Russia from Western capital markets\n- **South Africa**: Persistent structural issues — unemployment ~32%, infrastructure decay, energy crisis\n\n**BRICS expansion (2024):** Egypt, Ethiopia, Iran, Saudi Arabia, and UAE joined the bloc, reflecting growing EM political ambitions to create alternatives to USD-dominated financial systems.\n\n**Beyond BRICS — the broader EM universe:**\n- **MINT countries**: Mexico, Indonesia, Nigeria, Turkey — next tier of large EM economies\n- **Asian tigers**: South Korea, Taiwan, Singapore, Hong Kong (now often classified as developed)\n- **Southeast Asia**: Vietnam, Thailand, Philippines — beneficiaries of supply chain diversification from China\n\n**Key takeaway:** BRICS is a political and economic concept, not an investment strategy. The divergent trajectories of its members illustrate why country-level analysis matters enormously in EM investing.",
          highlight: ["BRICS", "Jim O'Neill", "MINT", "supply chain diversification", "country-level analysis"],
        },
        {
          type: "teach",
          title: "The MSCI Emerging Markets Index",
          content:
            "The **MSCI Emerging Markets Index** is the most widely tracked benchmark for EM equity investing, with over $2 trillion in assets benchmarked to it. Understanding its composition is essential for any EM investor.\n\n**MSCI EM composition (approximate, as of 2025):**\n- China: ~25–30% (varies significantly with regulatory environment)\n- India: ~18–20%\n- Taiwan: ~15–17%\n- South Korea: ~12–13%\n- Brazil: ~5–6%\n- Saudi Arabia: ~4–5%\n- Mexico, South Africa, Indonesia: ~2–3% each\n- Remaining ~24 countries: balance\n\n**What the index reveals:**\n- The index is heavily concentrated — the top 3 countries (China, India, Taiwan) often exceed 55–60% of total weight\n- Technology dominates: TSMC (Taiwan Semiconductor) and Samsung are among the largest holdings\n- \"Emerging\" is a misnomer for Taiwan and Korea — these are highly sophisticated economies; their inclusion reflects historical precedent and MSCI's conservative reclassification process\n\n**EM Growth vs Developed Markets:**\n- EM economies grew at an average of 4–6% real GDP annually in the 2000s–2010s vs. 1.5–2.5% for developed markets\n- This growth premium does NOT automatically translate to equity returns — dilution, governance, and valuation matter\n- A famous academic puzzle: countries with higher GDP growth have historically shown no systematic equity outperformance vs. lower-growth countries\n\n**Practical implication:** When buying an EM index fund, you are primarily buying China, India, and Taiwanese semiconductor exposure — know what you own.",
          highlight: ["MSCI EM Index", "benchmark", "China", "India", "TSMC", "growth premium"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor purchases an MSCI Emerging Markets index fund. Approximately what combined weight do China, India, and Taiwan typically represent in the index?",
          options: [
            "55–60% of total index weight",
            "20–25% of total index weight",
            "75–80% of total index weight",
            "30–35% of total index weight",
          ],
          correctIndex: 0,
          explanation:
            "China (~25–30%), India (~18–20%), and Taiwan (~15–17%) together often represent 55–60% of the MSCI EM index. This heavy concentration means an \"emerging markets\" fund is primarily a bet on a handful of large Asian economies — particularly on Chinese regulatory/economic conditions, Indian growth, and Taiwanese semiconductor dominance. Investors expecting broad diversification across 25+ countries are often surprised by this concentration.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Countries with faster GDP growth rates consistently produce higher stock market returns for equity investors compared to slower-growing countries.",
          correct: false,
          explanation:
            "This is one of the most important — and counterintuitive — findings in global finance. High GDP growth does NOT reliably translate to superior equity returns. Several reasons explain this: (1) Growth is often funded by new share issuance, diluting existing shareholders; (2) High-growth opportunities attract capital quickly, bidding up valuations before the growth materializes; (3) Much EM growth accrues to private companies, not listed ones; (4) Governance issues mean public shareholders capture less of the value created. Historical data across many decades shows little positive correlation between national GDP growth and stock returns.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Currency Risk in EM ────────────────────────────────────────
    {
      id: "emerging-markets-investing-2",
      title: "💱 Currency Risk in Emerging Markets",
      description:
        "Understand how exchange rate volatility affects EM returns, the difference between local and USD-denominated bonds, and key hedging approaches",
      icon: "DollarSign",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Exchange Rate Volatility in EM",
          content:
            "Currency risk is one of the most significant — and frequently underestimated — components of emerging market investing. When you invest in EM assets, your total return has two components: (1) the local-currency asset return and (2) the currency return relative to your home currency.\n\n**Why EM currencies are more volatile:**\n- **Smaller, less liquid markets**: EM currency markets have lower trading volumes; large capital flows cause larger price moves\n- **Commodity dependence**: Many EM currencies (Brazilian Real, Russian Ruble, South African Rand) are heavily tied to commodity prices\n- **Current account imbalances**: Countries running large trade deficits depend on foreign capital inflows; when sentiment shifts, currencies can collapse rapidly\n- **Interest rate differentials**: High EM interest rates attract \"carry trade\" inflows, which can reverse violently during global risk-off episodes\n- **Political events**: Elections, policy changes, or geopolitical crises create sharp currency moves\n\n**Historical examples of EM currency crises:**\n- **1997 Asian Financial Crisis**: Thai Baht devalued 50%+; Indonesian Rupiah fell 80%+ against USD\n- **2018 Argentine Peso**: Lost 50% of value in one year amid IMF debt crisis\n- **2021 Turkish Lira**: Lost ~80% over 5 years as central bank kept rates low despite 80%+ inflation\n- **2022 Sri Lankan Rupee**: Collapsed 80%+ amid sovereign debt crisis\n\n**The currency math:**\nIf a Brazilian stock rises 20% in Reais but the Real depreciates 15% against USD, a USD-based investor earns approximately only 3% (20% × 0.85 ≈ 17%, minus the currency drag makes it roughly 3%). Currency effects can eliminate or even reverse positive local-currency returns.",
          highlight: ["currency risk", "carry trade", "current account", "currency crisis", "local-currency return"],
        },
        {
          type: "teach",
          title: "Local vs USD-Denominated EM Bonds",
          content:
            "EM fixed income investors must choose between two fundamentally different types of bonds — a choice that determines which risks they are taking on.\n\n**Hard currency bonds (USD-denominated):**\n- Also called \"external debt\" — issued in USD, EUR, or other major currencies\n- **No currency risk for USD investors**: You buy and receive principal/interest in USD\n- **Credit risk remains**: The issuing government or company can still default\n- **Benchmark**: JP Morgan EMBI (Emerging Market Bond Index)\n- **Typical buyers**: Global institutional investors, pension funds wanting EM yield without currency complexity\n- **Examples**: Brazil 10-year USD sovereign bond, Mexico corporate bonds in USD\n\n**Local currency bonds:**\n- Issued in the country's own currency (Brazilian Real, Indian Rupee, South African Rand, etc.)\n- **Full currency exposure**: Returns depend heavily on exchange rate movements\n- **Benchmark**: JP Morgan GBI-EM (Government Bond Index - Emerging Markets)\n- **Potential advantages**: Higher nominal yields, potential currency appreciation, exposure to local monetary policy\n- **Risks**: Currency depreciation, capital controls that prevent repatriation of funds\n\n**The yield premium:**\nLocal currency bonds typically offer significantly higher nominal yields than hard currency equivalents — but this premium often simply reflects expected currency depreciation. A 12% yield in Turkish lira bonds sounds attractive, but if the Lira depreciates 15% that year, your USD return is -3%.\n\n**Rule of thumb:** The yield differential between local-currency and USD bonds provides the market's implicit forecast of expected currency depreciation (uncovered interest parity).",
          highlight: ["hard currency bonds", "local currency bonds", "EMBI", "GBI-EM", "capital controls", "yield premium"],
        },
        {
          type: "teach",
          title: "Hedging Currency Exposure",
          content:
            "Investors can reduce or eliminate EM currency risk through hedging, but it comes at a cost. Understanding the mechanics and economics of currency hedging is essential.\n\n**Currency forward contracts:**\nThe most common hedging tool. You agree today to sell a foreign currency at a predetermined exchange rate at a future date.\n- **Example**: You hold Brazilian stocks worth 1 million BRL. You sell BRL forward for USD. If BRL depreciates, your forward contract profits offset stock losses.\n- **Cost**: The forward rate reflects interest rate differentials. High-interest-rate EM currencies have a forward discount, meaning you pay a significant hedging cost — often 5–10% per year for currencies like the Turkish Lira or Brazilian Real.\n\n**Currency ETF options:**\n- **Unhedged EM ETFs** (e.g., EEM): Full currency exposure, no additional cost\n- **Currency-hedged EM ETFs** (e.g., DBEM): Currency risk removed, but hedging cost embedded in expenses and drag\n\n**Should you hedge?**\n- **Short-term horizons**: Currency volatility dominates returns over 1–2 years; hedging reduces noise\n- **Long-term horizons**: Over 10+ years, valuation and economic fundamentals tend to dominate; currency effects partially revert\n- **High-yield EM currencies**: Hedging cost often exceeds the diversification benefit — paying 8% per year to hedge Turkish Lira exposure is rarely economic\n- **Low-yield EM currencies** (Chinese Yuan, South Korean Won): Cheaper to hedge, sometimes worth it\n\n**The practical reality:** Most long-term EM equity investors accept currency risk as part of the return stream, viewing EM currency exposure as a diversifying asset within a global portfolio.",
          highlight: ["forward contracts", "hedging cost", "interest rate differential", "unhedged", "currency-hedged"],
        },
        {
          type: "quiz-mc",
          question:
            "An Indian equity fund returns +25% in Indian Rupee terms over one year. The Indian Rupee depreciates 8% against the US Dollar over the same period. What is the approximate USD return for a US-based investor?",
          options: [
            "Approximately +15%",
            "Approximately +25%",
            "Approximately +33%",
            "Approximately +17%",
          ],
          correctIndex: 0,
          explanation:
            "The USD return = (1 + local return) × (1 + currency return) − 1. Here: (1.25) × (0.92) − 1 = 1.15 − 1 = +15%. The 8% currency depreciation significantly reduces the 25% local return. This illustrates why currency risk is a critical component of EM investing — even strong local-currency performance can be substantially eroded by exchange rate moves.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Maria is a USD-based investor holding Turkish government bonds denominated in Turkish Lira. The bonds pay a 20% annual yield. Over the year, the Turkish Lira depreciates 25% against the US Dollar. Turkey's inflation rate is 60%.",
          question: "What is the approximate USD return on Maria's investment, and how should she interpret the high yield?",
          options: [
            "USD return ≈ −10%; the high yield reflected expected currency depreciation, not real purchasing power gain",
            "USD return ≈ +20%; the yield is pure profit regardless of currency moves",
            "USD return ≈ +45%; combining yield and some currency appreciation",
            "USD return ≈ −5%; the bond is risk-free since it is a government bond",
          ],
          correctIndex: 0,
          explanation:
            "USD return = (1.20) × (0.75) − 1 = 0.90 − 1 = −10%. Despite a 20% nominal yield, the 25% currency depreciation produces a negative USD return. This illustrates the \"yield illusion\" in high-EM currencies: extremely high nominal yields typically reflect high inflation and expected currency depreciation, not genuine return. The uncovered interest parity theory predicts exactly this — high-yield currencies tend to depreciate, eliminating the nominal yield advantage for foreign investors.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Political & Regulatory Risk ─────────────────────────────────
    {
      id: "emerging-markets-investing-3",
      title: "⚖️ Political & Regulatory Risk",
      description:
        "Navigate capital controls, expropriation threats, governance scores, and how to assess the rule of law before investing in a country",
      icon: "Shield",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Capital Controls and Expropriation",
          content:
            "Political risk encompasses the range of government actions that can impair the value of foreign investments. Two of the most severe forms are capital controls and expropriation.\n\n**Capital controls:**\nGovernments restrict the movement of money across their borders to defend currencies, prevent capital flight, or manage financial crises.\n\n**Types of capital controls:**\n- **Inflow controls**: Taxes or restrictions on foreign money entering (e.g., Brazil's IOF tax on foreign bond purchases)\n- **Outflow controls**: Limits on money leaving — the most dangerous for investors\n- **Repatriation restrictions**: Profits can be earned in local currency but converting to USD requires government approval\n- **Exchange rate controls**: Multiple official exchange rates; the \"official\" rate differs greatly from the market rate\n\n**Real examples:**\n- **Argentina (2019)**: Strict capital controls imposed overnight; investors holding Argentine assets could not easily exit\n- **Russia (2022)**: Complete asset freeze; Western investors holding Russian stocks saw them become effectively worthless after sanctions\n- **China**: The RMB has a managed exchange rate; foreign investors access Chinese equities through restricted channels\n\n**Expropriation:**\nGovernment seizure of private assets — with or without compensation. Forms include:\n- **Direct nationalization**: Government takes 100% ownership (Venezuela nationalized oil, steel, and banking sectors)\n- **Creeping expropriation**: Regulations progressively squeeze foreign investors (high taxes, price controls, forced local partnerships)\n- **Regulatory taking**: New laws make a business uneconomical without formal seizure\n\n**Protection mechanisms:**\n- Bilateral Investment Treaties (BITs): Legal agreements between countries providing minimum investor protections\n- ICSID arbitration: International Centre for Settlement of Investment Disputes — foreign investors can sue governments\n- Political risk insurance: Products from MIGA (World Bank) or private insurers",
          highlight: ["capital controls", "expropriation", "repatriation", "nationalization", "bilateral investment treaties"],
        },
        {
          type: "teach",
          title: "Governance Scores and Rule of Law",
          content:
            "Quantifying political risk is challenging but essential. Several frameworks help investors assess country-level governance quality.\n\n**World Bank Worldwide Governance Indicators (WGI):**\nSix dimensions scored from −2.5 (weakest) to +2.5 (strongest):\n1. **Voice and Accountability**: Political freedoms, civil liberties, free press\n2. **Political Stability**: Likelihood of government overthrow or political violence\n3. **Government Effectiveness**: Quality of public services and bureaucracy\n4. **Regulatory Quality**: Ability to formulate sound policies for private sector development\n5. **Rule of Law**: Contract enforcement, property rights, courts, police\n6. **Control of Corruption**: Extent to which public power is exercised for private gain\n\n**Why rule of law matters most for investors:**\n- Without enforceable contracts, business agreements are meaningless\n- Without property rights protection, minority shareholders can be expropriated by controlling shareholders\n- Without independent courts, disputes with the government cannot be fairly resolved\n\n**Transparency International Corruption Perceptions Index:**\nAnnual ranking of 180+ countries. Chronic high corruption in countries like Venezuela (#177), Yemen (#176), and Syria (#180) correlates with poor investor outcomes.\n\n**Practical use of governance scores:**\n- Countries with improving governance scores tend to attract capital inflows and see equity reratings\n- Countries with deteriorating governance trigger capital flight\n- Governance trajectories matter as much as current levels — a corrupt country improving is often investable; a well-governed country regressing can be a trap\n\n**The governance discount:**\nEM equities often trade at 30–60% lower valuations than equivalent developed-market stocks — partly reflecting genuine governance risk and partly reflecting investor psychology.",
          highlight: ["World Bank WGI", "rule of law", "corruption", "governance score", "governance discount"],
        },
        {
          type: "quiz-tf",
          statement:
            "A country with high nominal interest rates and improving GDP growth is always a safe investment destination, regardless of its governance scores.",
          correct: false,
          explanation:
            "High interest rates and GDP growth are insufficient safeguards against investment losses in poorly governed countries. Governance risks — including sudden capital controls, expropriation, corruption-driven contract disputes, or political instability — can cause total loss of invested capital regardless of economic performance metrics. Venezuela and Zimbabwe demonstrated strong nominal GDP growth during certain periods while simultaneously destroying investor wealth through expropriation and hyperinflation. Governance quality is a prerequisite for sustainable investment returns.",
          difficulty: 1,
        },
        {
          type: "quiz-mc",
          question:
            "Argentina imposes overnight capital controls, preventing foreign investors from converting Argentine Pesos to US Dollars. What risk category does this event represent, and what is its primary impact on investors?",
          options: [
            "Political risk — capital controls trap investors in local currency, preventing repatriation of funds",
            "Credit risk — the government is defaulting on its bonds",
            "Liquidity risk — the stock exchange has temporarily suspended trading",
            "Market risk — equity valuations have declined due to macroeconomic conditions",
          ],
          correctIndex: 0,
          explanation:
            "Capital controls are a form of political risk — a government action that impairs investor rights. The primary impact is the inability to repatriate funds: investors may hold profitable local-currency positions but cannot convert those profits back to their home currency. This creates a \"trapped\" situation where accounting gains do not translate to real returns. Capital controls have historically been implemented by Argentina, Russia, Venezuela, Malaysia (1998), Iceland (2008), and Cyprus (2013) during periods of balance of payments stress.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: EM Equity Strategies ──────────────────────────────────────
    {
      id: "emerging-markets-investing-4",
      title: "📈 EM Equity Strategies",
      description:
        "Explore country allocation approaches, sector tilts in EM, and whether the small-cap premium exists in emerging markets",
      icon: "BarChart2",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Country Allocation in EM Portfolios",
          content:
            "Country selection is the dominant driver of EM equity returns — far more so than stock selection within a country. Getting the country allocation right is the single most important EM investment decision.\n\n**Why country matters more than stock selection in EM:**\n- Within a country, stocks tend to rise and fall together during currency crises, recessions, or political upheaval\n- A brilliant stock pick in Venezuela returned nothing when the country collapsed; mediocre stocks in Vietnam returned 5× over a decade\n- Country-specific factors (interest rate policy, regulatory environment, currency strength) create correlation among all domestic stocks\n\n**Frameworks for country allocation:**\n\n**1. Valuation-based (cyclically adjusted P/E — CAPE):**\n- Buy countries with low CAPE ratios relative to history and global peers\n- Historically, buying the 10 cheapest EM countries by CAPE has outperformed buying the 10 most expensive\n- Risk: cheap countries are often cheap for good reasons (governance, political instability)\n\n**2. Macro momentum:**\n- Overweight countries with improving current account balances, falling inflation, and rising earnings revisions\n- Underweight deteriorating macro fundamentals\n\n**3. Political risk calendar:**\n- EM elections often cause volatility followed by recovery; reducing exposure before uncertain elections and adding after can add value\n- Policy pivots (new central bank governor, trade agreements) create re-rating opportunities\n\n**4. Benchmark-relative:**\n- Passive investors accept MSCI EM weights\n- Active managers express conviction by over/underweighting countries vs. the benchmark\n\n**Concentration vs. diversification tradeoff:**\nA fully diversified 25-country EM portfolio reduces country risk but also dilutes the impact of correct country calls. Most successful EM active managers maintain meaningful concentration: 4–8 countries comprising 70%+ of the portfolio.",
          highlight: ["country allocation", "CAPE", "macro momentum", "political risk", "benchmark-relative"],
        },
        {
          type: "teach",
          title: "Sector Tilts and EM Growth Themes",
          content:
            "EM equity markets have a distinctive sector structure that differs significantly from developed markets, creating both opportunities and concentration risks.\n\n**EM sector composition vs. developed markets:**\n- **Technology**: Large weight due to Taiwan (TSMC, MediaTek) and South Korea (Samsung, SK Hynix) — semiconductor dominance\n- **Financials**: Large weight in countries like India, Brazil, China — banking sectors still expanding to serve unbanked populations\n- **Energy & Materials**: Significant in commodity-exporting EM (Brazil, Saudi Arabia, South Africa, Russia)\n- **Consumer Discretionary**: Growing rapidly as middle-class expands — e-commerce, autos, leisure\n- **Healthcare**: Underpenetrated sector growing with rising incomes and aging populations\n- **Technology underrepresentation**: Innovative EM tech companies often list in the US (Alibaba, Pinduoduo) rather than locally, reducing local market exposure\n\n**Structural EM growth themes:**\n1. **Middle class expansion**: 1.4 billion people expected to join the middle class by 2030, predominantly in Asia and Africa — driving consumer spending on branded goods, financial services, travel\n2. **Financial inclusion**: Smartphone-enabled banking, microfinance, insurance penetration — massive addressable market in Southeast Asia, Africa, India\n3. **Infrastructure buildout**: Roads, ports, power grids, digital infrastructure still being built — decades of capex ahead in Africa and South Asia\n4. **Nearshoring beneficiaries**: Mexico, Vietnam, Indonesia benefit as companies diversify supply chains away from China\n5. **Energy transition**: EM countries like Chile (lithium), Congo (cobalt), Indonesia (nickel) control critical battery materials\n\n**Sector tilt considerations:**\n- EM financials carry additional political risk (government directed lending, state ownership)\n- EM commodity stocks correlate highly with global commodity prices — adding China-correlated cyclicality",
          highlight: ["semiconductor", "middle class", "financial inclusion", "nearshoring", "energy transition"],
        },
        {
          type: "teach",
          title: "The Small-Cap EM Premium",
          content:
            "Academic research documents a **small-cap premium** in developed markets — smaller companies have historically outperformed large caps over long periods. Does this premium exist in emerging markets? The evidence is nuanced.\n\n**Evidence for the EM small-cap premium:**\n- The MSCI EM Small Cap Index has outperformed the MSCI EM (large/mid cap) index over many long-term periods\n- Structural reasons for outperformance: less analyst coverage means more pricing inefficiencies, local companies can exploit domestic growth opportunities not accessible to multinationals\n- Better alignment with domestic consumption themes — local brands, regional banks, domestic infrastructure\n\n**Evidence against / complications:**\n- **Liquidity risk**: EM small caps are thinly traded; bid-ask spreads can be enormous; exiting positions in a crisis can be impossible\n- **Governance premium**: Small EM companies often have weaker corporate governance, higher expropriation risk, less transparent financial reporting\n- **Survivorship bias**: Many small EM companies that went bankrupt or were delisted are excluded from historical return databases, overstating true performance\n- **Transaction costs**: High trading costs in small EM stocks erode theoretical premium substantially\n\n**Frontier markets vs. EM small caps:**\nSome investors access early-stage growth through **frontier markets** — the next tier below EM (Vietnam, Nigeria, Kenya, Morocco, Bangladesh). Frontier markets can offer:\n- Lower correlation with developed and EM markets (genuine diversification)\n- Access to early-stage economic development\n- Extremely illiquid, high-risk — currency crises, governance failures are common\n\n**Practical framework:**\nThe EM small-cap premium is real but only capturable by investors with long time horizons, high risk tolerance, and the operational capability to trade in illiquid markets. For most investors, a core large-cap EM position with selective small-cap satellite positions is appropriate.",
          highlight: ["small-cap premium", "liquidity risk", "governance premium", "frontier markets", "analyst coverage"],
        },
        {
          type: "quiz-mc",
          question:
            "Which single factor has historically been the most important driver of returns for an emerging market equity portfolio?",
          options: [
            "Country allocation — which countries are owned and at what weights",
            "Individual stock selection within each country",
            "Sector tilts between technology and consumer stocks",
            "Timing of purchases relative to the global economic cycle",
          ],
          correctIndex: 0,
          explanation:
            "Country allocation dominates EM equity returns. Within any given country, stocks tend to be highly correlated with each other — they rise and fall together in response to currency moves, political events, interest rate changes, and macro conditions. The decision of how much to allocate to China vs. India vs. Brazil vs. Vietnam has historically explained far more return variation than stock selection within those countries. This is why top EM investors spend the majority of their research on country-level macro analysis.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Investors should always prefer EM small-cap stocks over large-cap EM stocks because academic research proves small caps consistently outperform with minimal additional risk.",
          correct: false,
          explanation:
            "The small-cap EM premium exists in academic studies but comes with substantial practical complications. EM small caps carry significant additional risks: extreme illiquidity making exits in crises nearly impossible, weaker governance and financial transparency, higher transaction costs that erode theoretical returns, and survivorship bias in historical data. The premium is not \"minimal risk\" — it is compensation for taking on very real liquidity and governance risks. For most investors without specialized EM small-cap infrastructure, the premium is difficult or impossible to capture in practice.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: EM Fixed Income ─────────────────────────────────────────────
    {
      id: "emerging-markets-investing-5",
      title: "🏦 Emerging Market Fixed Income",
      description:
        "Master sovereign bonds, local currency debt, EM corporate credit, and how to assess default risk in developing economies",
      icon: "FileText",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Sovereign Bonds and Default Risk",
          content:
            "**EM sovereign bonds** are debt instruments issued by national governments of developing countries. They offer higher yields than developed-market government bonds but carry default risk that DM sovereigns typically do not.\n\n**Why EM sovereigns default:**\n- **Revenue shocks**: Commodity-dependent economies (oil, copper, coffee) face volatile revenues when commodity prices fall\n- **Currency mismatch**: Debt in USD, revenue in local currency — if the currency depreciates sharply, the debt burden becomes unserviceable\n- **Rollover risk**: Short-term debt that cannot be refinanced as creditors lose confidence\n- **Political decisions**: Some sovereigns can repay but choose not to — selective defaults driven by political calculations\n\n**Historical sovereign defaults:**\n- **Argentina (2001, 2014, 2020)**: Serial defaulter; $100 billion 2001 default was the largest in history at the time\n- **Russia (1998)**: Default on domestic ruble-denominated debt shocked global markets\n- **Ecuador (2008)**: First \"strategic\" default — the government could pay but chose not to\n- **Zambia (2020), Sri Lanka (2022)**: Covid/commodity shock defaults\n\n**Credit ratings and spreads:**\n- Rating agencies (Moody's, S&P, Fitch) assess sovereign creditworthiness — from investment grade (BBB− and above) to high yield (\"junk\")\n- **Spread**: The yield premium over US Treasuries reflects default risk. A 500bp spread on a 10-year bond means investors demand 5% additional annual yield as default compensation\n- **EMBI spread**: JP Morgan's index spread over US Treasuries is the key barometer of EM debt market stress — rising spreads signal deteriorating conditions\n\n**IMF as lender of last resort:**\nThe International Monetary Fund provides emergency financing to sovereigns, typically with economic reform conditions attached. An IMF program often signals serious distress but also provides a potential floor for recovery.",
          highlight: ["sovereign default", "currency mismatch", "EMBI spread", "credit rating", "IMF", "rollover risk"],
        },
        {
          type: "teach",
          title: "Local Currency Bonds and the GBI-EM",
          content:
            "**Local currency EM bonds** (government bonds issued in the country's own currency) represent a distinct asset class with different risk/return characteristics from hard currency bonds.\n\n**JP Morgan GBI-EM Index:**\nThe benchmark for local currency EM government bonds. As of 2025, it includes bonds from ~18–20 countries including Brazil, Mexico, Indonesia, Poland, South Africa, Thailand, and others. China was added to the GBI-EM in 2020, now representing ~10% of the index.\n\n**Key features of local currency bonds:**\n- **Higher nominal yields**: Reflect local inflation and exchange rate expectations\n- **Full currency exposure**: The dominant risk factor over most time horizons\n- **Duration risk**: Longer-maturity local bonds carry interest rate sensitivity\n- **Inflation linkage**: Some countries issue inflation-linked local bonds (Brazil's NTN-Bs, Mexico's Udibonos) providing inflation protection in local terms\n\n**Why hold local currency bonds?**\n1. **Yield advantage**: Even after expected depreciation, some investors find local bonds offer positive risk-adjusted returns vs. Treasuries\n2. **Currency appreciation potential**: If EM currencies appreciate (driven by commodity booms, improving current accounts), the currency gain amplifies already attractive yields\n3. **Monetary policy divergence**: When EM central banks cut rates ahead of developed markets, local bond prices rise\n4. **Correlation benefits**: Local EM bond returns have historically shown low correlation with US Treasuries and investment-grade bonds\n\n**Inclusion dynamics:**\nWhen a country's bonds are added to major indices (GBI-EM, Bloomberg EM indices), passive funds are mechanically forced to buy — this index inclusion process can be a positive catalyst for local bond prices.",
          highlight: ["GBI-EM", "local currency", "inflation-linked", "duration risk", "index inclusion", "currency appreciation"],
        },
        {
          type: "teach",
          title: "EM Corporate Credit",
          content:
            "**EM corporate bonds** — debt issued by companies in emerging market countries — represent the fastest-growing segment of the EM fixed income universe, with the market exceeding $2 trillion in outstanding hard-currency debt.\n\n**Characteristics of EM corporate credit:**\n- Most EM corporate bonds are issued in USD (hard currency) — this is a deliberate choice to access deeper investor pools\n- The market spans investment grade (e.g., Saudi Aramco, PEMEX, Petrobras when in favor) through high yield and distressed names\n- **Sectors**: Energy, metals/mining, banks, real estate, and utilities dominate\n- **Benchmark**: JP Morgan CEMBI (Corporate Emerging Market Bond Index)\n\n**Double subordination risk:**\nEM corporate bonds carry TWO layers of credit risk:\n1. **Company-specific credit risk**: The company's ability to service its debt\n2. **Sovereign ceiling risk**: If the sovereign defaults, the company may face capital controls making it impossible to transfer USD to bondholders even if the company itself remains solvent\n\nThis is why EM corporates are rarely rated above their sovereign ceiling — a Mexican company cannot sustainably be AAA if Mexico is BBB.\n\n**The EM corporate opportunity set:**\n- **Investment grade EM corps**: Often offer 50–150bp yield premium over US IG for the same rating — reflects EM discount rather than higher fundamental risk for large, well-known issuers\n- **EM high yield**: Mix of leveraged buyouts (rare in EM), commodity companies, real estate developers (Chinese property sector 2021–2023 crisis was a notable example)\n\n**Chinese real estate crisis (2021–2023) case study:**\nEvergrande, Country Garden, and dozens of Chinese property developers defaulted on $500B+ in bonds — the largest EM credit event in decades. This showed how sector concentration and regulatory risk (China's \"three red lines\" policy) can create systemic EM credit crises.",
          highlight: ["EM corporate bonds", "CEMBI", "sovereign ceiling", "double subordination", "Evergrande", "investment grade"],
        },
        {
          type: "quiz-mc",
          question:
            "A Mexican corporation with strong financials wants to issue bonds. Mexico's sovereign credit rating is BBB. Which statement best describes the likely rating and yield of the Mexican corporate bond?",
          options: [
            "The corporate bond will likely be rated at or below BBB due to sovereign ceiling constraints, with a yield spread above comparable US BBB corporates",
            "The corporate bond can receive any rating regardless of the sovereign, based solely on the company's financials",
            "The corporate bond will be rated AAA if the company has no debt and strong cash flows",
            "The corporate bond will have a lower yield than US Treasury bonds if the company is highly profitable",
          ],
          correctIndex: 0,
          explanation:
            "The sovereign ceiling principle means that a company operating in a country generally cannot be rated higher than its sovereign — a Mexican company is unlikely to be rated above BBB (Mexico's sovereign rating) because sovereign default would likely impair the company's ability to service foreign currency debt (capital controls, economic disruption). Additionally, EM corporates typically carry a yield premium of 50–150 basis points over developed-market peers at the same rating, reflecting the EM discount.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An emerging market country that has previously defaulted on its sovereign debt cannot access international bond markets again and is permanently excluded from the EMBI index.",
          correct: false,
          explanation:
            "Serial defaulters can and do return to international capital markets. Argentina has defaulted multiple times (1989, 2001, 2014, 2020) yet continues to issue international bonds and remains tracked in EM indices. The key mechanism is debt restructuring: creditors accept losses in exchange for new bonds with more sustainable terms, and the country eventually regains market access. Investors in post-default bonds sometimes earn exceptional returns if recovery values exceed the distressed prices. The IMF program, creditor negotiations, and demonstrated fiscal reform are the typical pathway back to market access.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Building an EM Portfolio ───────────────────────────────────
    {
      id: "emerging-markets-investing-6",
      title: "🗺️ Building an EM Portfolio",
      description:
        "Put it all together — portfolio construction principles, benchmark vs. active approaches, frontier market access, and sizing EM within a global allocation",
      icon: "PieChart",
      xpReward: 110,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Diversification Principles in EM Portfolios",
          content:
            "Building an EM portfolio requires applying diversification principles that differ from developed-market portfolio construction — correlations are higher, risks are more systemic, and liquidity can evaporate suddenly.\n\n**Sources of return and risk in EM portfolios:**\n1. **Beta to global equities**: EM equities correlate ~0.7–0.8 with global developed equities in normal markets, rising toward 1.0 in crises (\"correlation goes to 1 in a crash\")\n2. **EM-specific risk premium**: The additional return demanded for EM's higher volatility, governance risk, and currency risk\n3. **Country-specific alpha**: Returns from correct country allocation vs. benchmark\n4. **Stock selection alpha**: Rarer — requires deep local market knowledge\n\n**Diversification across EM dimensions:**\n- **Geographical diversification**: Spread across Asia, Latin America, EMEA (Europe, Middle East, Africa) — these regions have different economic drivers and crisis sensitivities\n- **Asset class diversification**: Combining EM equities, hard currency bonds, and local currency bonds creates a more resilient EM portfolio\n- **Sector diversification**: Avoid concentration in one sector (e.g., China tech, Brazilian banks, Gulf energy)\n- **Currency diversification**: A mix of commodity currencies (BRL, ZAR), growth currencies (INR, IDR), and relatively stable currencies (CNY, KRW) creates balance\n\n**Correlation traps in EM:**\n- During the 2008 Global Financial Crisis, virtually all EM assets fell simultaneously, regardless of fundamentals\n- During the 2013 \"Taper Tantrum\" (Fed signaling rate increases), all EM currencies fell together despite divergent economies\n- EM diversification benefits are greatest in calm markets; they diminish precisely when you need them most\n\n**Position sizing:**\n- Country concentration should reflect conviction and liquidity — allocating more than 15–20% to a single country in a diversified EM fund creates excessive single-country risk\n- Frontier market positions should be sized at 2–5% maximum due to liquidity constraints",
          highlight: ["beta", "EM-specific premium", "geographical diversification", "correlation trap", "position sizing"],
        },
        {
          type: "teach",
          title: "Benchmark vs. Active EM Management",
          content:
            "One of the most consequential decisions for EM investors is whether to invest passively (track the MSCI EM index) or actively (pay higher fees for a manager attempting to beat the benchmark).\n\n**The case for passive EM investing:**\n- **Lower costs**: Passive EM ETFs charge 0.10–0.25% expense ratios; active EM funds charge 0.75–1.5%+\n- **Broad diversification**: Automatic exposure to all index countries and sectors\n- **Difficult to beat**: Over 10-year periods, the majority of active EM managers underperform net of fees\n- **Simplicity**: No manager selection risk — a persistent source of return destruction\n\n**The case for active EM management:**\n- **Market inefficiency**: EM markets are less researched, information asymmetry is greater — skill has more opportunity to add value\n- **Country allocation flexibility**: Passive funds cannot avoid poorly governed countries or reduce China when regulatory risk is high; active managers can\n- **Benchmark construction issues**: The MSCI EM is backward-looking (adding countries after they have already run up) and includes state-owned enterprises with poor governance\n- **Liquidity management**: Active managers can avoid the most illiquid names that passive funds must hold\n- **Factor tilts**: Systematic value, momentum, or quality tilts within EM can add return with modest cost increase (\"smart beta\")\n\n**Evidence on active EM performance:**\nActive EM managers have historically had better relative performance vs. passive than active developed-market managers — but \"better\" means approximately 40–45% beat their benchmark over 10 years vs. 20–25% in US large caps. Most still underperform.\n\n**Hybrid approach:**\n- Core position (60–70%): Low-cost passive EM ETF\n- Satellite positions (30–40%): Active fund with conviction country tilts, or direct single-country ETFs for targeted expression",
          highlight: ["passive investing", "active management", "expense ratio", "benchmark construction", "smart beta", "hybrid approach"],
        },
        {
          type: "teach",
          title: "Sizing EM in a Global Portfolio",
          content:
            "How much of a global equity portfolio should be allocated to emerging markets? This decision involves balancing growth potential, risk management, and investor circumstances.\n\n**Market-cap weight baseline:**\nEM equities represent approximately 10–12% of global market capitalization (MSCI ACWI benchmark). A pure market-cap-weighted investor holds this proportion automatically.\n\n**Arguments for overweighting EM (15–30%):**\n- Superior long-term GDP growth prospects\n- Younger demographics providing economic tailwinds\n- Attractive valuations: EM often trades at 40–60% discount to US equities on CAPE/P/E basis\n- Underweighting EM means missing the majority of the world's economic growth\n- Currency diversification benefit for USD-heavy investors\n\n**Arguments for underweighting EM (5–10%):**\n- Higher volatility: EM equities have historically shown 25–30% annualized volatility vs. 15–20% for US equities\n- Currency drag: USD-based investors have historically faced negative currency returns from EM exposure\n- Governance and political risk requiring constant monitoring\n- The growth paradox: high EM GDP growth has not reliably produced high EM equity returns\n\n**Practical allocation guidelines:**\n- **Conservative investor** (short horizon, low risk tolerance): 5–8% EM, primarily large-cap hard currency denominated\n- **Balanced investor** (10+ year horizon): 10–15% EM, split between equity and hard currency bonds\n- **Growth-oriented investor** (long horizon, high risk tolerance): 15–25% EM, including local currency bonds and small cap\n- **Specialist EM investor**: 50%+ with single-country and frontier market positions\n\n**The rebalancing benefit:**\nEM's higher volatility creates rebalancing opportunities — systematically buying more EM after large drawdowns (sell-offs of 30–50% are common in EM crises) and trimming after strong runs has added meaningful return in historical simulations.",
          highlight: ["market-cap weight", "overweighting", "underweighting", "rebalancing", "CAPE discount", "volatility"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "David is a 35-year-old investor with a 30-year investment horizon, moderate risk tolerance, and a globally diversified portfolio. He currently holds 70% US equities, 20% international developed equities, and 10% US bonds. He has no EM exposure. Global EM equities trade at a 50% discount to US equities on a CAPE basis.",
          question: "What EM allocation strategy best suits David's situation, and what are the key implementation considerations?",
          options: [
            "Add 10–15% EM equity via a low-cost passive ETF as a core position, with a small satellite in an active EM fund; rebalance annually; accept currency volatility given the 30-year horizon",
            "Allocate 50% of his portfolio to EM immediately to maximize exposure to the cheapest asset class by CAPE",
            "Avoid EM entirely because the valuation discount proves these markets have permanently inferior governance",
            "Only buy EM bonds instead of equities to avoid currency risk while gaining EM exposure",
          ],
          correctIndex: 0,
          explanation:
            "For a 35-year-old with a 30-year horizon and moderate risk tolerance, a 10–15% EM equity allocation is appropriate — meaningful enough to capture the growth premium and CAPE discount, but not so concentrated as to dominate risk. A passive core (low cost, broad diversification) with an active satellite (flexibility on country allocation) is a sensible hybrid. Currency volatility matters less over 30 years as shorter-term fluctuations tend to revert. Annual rebalancing ensures he systematically buys more EM after drawdowns. Allocating 50% would be too aggressive for \"moderate\" risk tolerance; avoiding EM entirely would miss significant potential return from the valuation discount.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "An investor compares two options: (A) a passive MSCI EM ETF with 0.15% expense ratio and (B) an active EM fund with 1.20% expense ratio. The active fund's manager has beaten the benchmark by an average of 0.90% per year over the past 10 years. Which option has delivered higher net-of-fee returns to investors?",
          options: [
            "The passive ETF — the active fund's 0.90% gross outperformance is more than offset by the 1.05% fee difference (1.20% − 0.15%), resulting in net underperformance of 0.15%/year",
            "The active fund — 0.90% outperformance proves skill and will continue compounding",
            "Both deliver identical returns since the active fund's alpha exactly offsets its higher fees",
            "The active fund because past outperformance is the best predictor of future performance",
          ],
          correctIndex: 0,
          explanation:
            "The fee difference is 1.05% per year (1.20% − 0.15%). The active fund's 0.90% gross outperformance does not overcome this 1.05% cost gap — resulting in net underperformance of approximately 0.15% per year. Over 30 years, 0.15%/year compounded represents a meaningful wealth gap. This illustrates why fee minimization is critical: past outperformance does not predict future outperformance (studies show minimal persistence in active manager alpha), and the fee gap compounds relentlessly. Most investors are better served by the lower-cost passive option unless they have strong evidence of a manager's sustained edge.",
          difficulty: 2,
        },
      ],
    },
  ],
};
