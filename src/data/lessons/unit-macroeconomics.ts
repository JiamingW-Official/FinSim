import type { Unit } from "./types";

export const UNIT_MACROECONOMICS: Unit = {
  id: "macroeconomics",
  title: "Macroeconomics",
  description:
    "Master business cycles, monetary and fiscal policy, international trade, and inflation dynamics",
  icon: "Globe",
  color: "#10b981",
  lessons: [
    // ─── Lesson 1: Business Cycles & Growth ──────────────────────────────────────
    {
      id: "macroeconomics-1",
      title: "Business Cycles & Growth",
      description:
        "Business cycle phases, GDP components, economic growth theories, and the paradox of thrift",
      icon: "TrendingUp",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Four Phases of the Business Cycle",
          content:
            "Every economy moves through a repeating sequence of **four phases**:\n\n1. **Expansion**: Rising employment, output, and consumer confidence. Credit is easy, businesses invest, wages grow. The longest phase — US expansions have averaged ~5 years.\n\n2. **Peak**: The economy hits maximum output. Capacity constraints appear — factories run at full tilt, labor is scarce, wages and commodity prices spike. Inflationary pressure builds. The Fed typically tightens at this stage.\n\n3. **Contraction (Recession)**: Output falls, unemployment rises, business investment is cut, consumers retrench. Companies delay hiring and capex. Credit conditions tighten.\n\n4. **Trough**: The bottom of the cycle. Output stops declining. **Leading indicators turn up** — PMI, building permits, consumer confidence begin to recover *before* employment does.\n\n**NBER Recession Definition**: The National Bureau of Economic Research (NBER), the official US arbiter, defines a recession as a **significant decline in economic activity that is widespread across the economy and lasts more than a few months** — tracking employment, income, industrial production, and retail sales. The popular shorthand of 'two consecutive quarters of negative GDP' is NOT the official NBER definition — it is an oversimplification that can miss recessions and false-flag others.",
          highlight: [
            "expansion",
            "peak",
            "contraction",
            "trough",
            "NBER",
            "recession",
            "leading indicators",
          ],
        },
        {
          type: "teach",
          title: "GDP Components & the Paradox of Thrift",
          content:
            "**GDP = C + I + G + NX** (the national income identity)\n\n- **C — Consumption** (~69% of US GDP): Household spending on goods and services. The dominant driver of the economy.\n- **I — Investment** (~18%): Business fixed investment (equipment, buildings) + residential construction + inventory changes.\n- **G — Government spending** (~17%): Federal, state, and local purchases. Excludes transfer payments (Social Security, Medicare) — those are counted when spent.\n- **NX — Net Exports** (~-4%): Exports minus imports. The US runs a persistent trade deficit so this component is negative.\n\n**Real vs Nominal GDP**: Nominal GDP uses current prices; real GDP adjusts for inflation using a price index. The **GDP deflator** = (Nominal GDP / Real GDP) × 100 — a broad measure of economy-wide inflation.\n\n**Paradox of Thrift** (Keynes): Individually, saving more seems prudent. But if *everyone* saves more simultaneously, aggregate demand collapses — less spending → lower income → lower output → the economy actually shrinks. What is rational for each household is destructive for the whole. This is why governments stimulate demand during recessions rather than encouraging belt-tightening.",
          highlight: [
            "GDP",
            "consumption",
            "investment",
            "government spending",
            "net exports",
            "real GDP",
            "GDP deflator",
            "paradox of thrift",
          ],
        },
        {
          type: "teach",
          title: "Economic Growth Theories",
          content:
            "Why do some countries grow rich while others stagnate? Economists have debated this for centuries.\n\n**Solow Growth Model** (Robert Solow, 1956):\n- Growth comes from **capital accumulation** (investing in machines, buildings) and **labor**\n- But capital has **diminishing returns** — each additional machine adds less output than the previous one\n- In the long run, growth must come from **technology** (total factor productivity, TFP) — but Solow treated technology as *exogenous*, falling from the sky\n- **Convergence hypothesis**: Poor countries should grow faster than rich ones (they have lower capital per worker, so returns are higher)\n\n**Endogenous Growth Theory** (Romer, Lucas, 1980s–90s):\n- Technology and knowledge are **endogenous** — they are produced inside the economy by R&D and education\n- **Knowledge spillovers**: When one firm discovers something, others can learn from it — unlike physical capital, knowledge is non-rival\n- **Human capital**: Investment in education and skills raises the quality of labor and drives sustained growth\n- **Total Factor Productivity (TFP)**: The portion of output growth not explained by capital or labor — the 'magic residual' that captures technology, institutions, and organizational efficiency",
          highlight: [
            "Solow growth model",
            "capital accumulation",
            "diminishing returns",
            "total factor productivity",
            "TFP",
            "endogenous growth",
            "human capital",
            "knowledge spillovers",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "What is the official NBER definition of a recession?",
          options: [
            "A significant decline in economic activity spread across the economy lasting more than a few months",
            "Two consecutive quarters of negative GDP growth",
            "An unemployment rate above 6% for at least three months",
            "A decline in stock market indices of more than 20% from peak",
          ],
          correctIndex: 0,
          explanation:
            "The NBER Business Cycle Dating Committee defines a recession as a significant decline in economic activity that is spread across the economy and lasts more than a few months, normally visible in GDP, employment, real income, industrial production, and retail sales. The '2 consecutive quarters of negative GDP' rule is a popular heuristic but is not the official definition — it misses recessions identified in other data and can technically occur without a formal NBER recession being declared.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "If all households in an economy simultaneously increase their savings rate, the economy will grow faster because higher savings leads to more investment.",
          correct: false,
          explanation:
            "False — this is the Paradox of Thrift, identified by Keynes. When everyone saves more at once, consumer spending falls sharply. Lower spending means lower business revenues, leading to layoffs and income cuts. As income falls, people can no longer save the intended higher amount anyway. The collective attempt to save more actually reduces income and may not increase aggregate savings at all. In a recession, governments must spend more (dissave) to offset the private sector's desire to retrench.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An economist observes the following data: GDP growth has been positive for 8 quarters; unemployment is at a 30-year low of 3.4%; CPI inflation has risen from 2% to 5.5%; the PMI just dropped from 56 to 49; consumer confidence fell sharply; and housing permit applications declined 18% year-over-year.",
          question:
            "Based on the business cycle framework, what phase is the economy most likely entering?",
          options: [
            "Transitioning from peak toward contraction — leading indicators signal the expansion is ending",
            "Mid-expansion — low unemployment and positive GDP confirm continued growth ahead",
            "Early trough — the economy has already bottomed and is about to recover",
            "Deep recession — unemployment below 4% is a recession indicator",
          ],
          correctIndex: 0,
          explanation:
            "The economy displays classic late-cycle / peak signals transitioning toward contraction. Positive GDP and low unemployment are lagging/coincident indicators that reflect the past. The forward-looking signals are concerning: PMI dropping below 50 (contraction in manufacturing), falling consumer confidence, and declining housing permits are all leading indicators signaling a slowdown ahead. Rising inflation confirms capacity constraints at the peak. A prudent investor would begin rotating defensively rather than waiting for lagging data to confirm the turn.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Monetary Policy ─────────────────────────────────────────────
    {
      id: "macroeconomics-2",
      title: "Monetary Policy",
      description:
        "Central bank tools, transmission mechanisms, inflation targeting frameworks, and the Fed dot plot",
      icon: "Landmark",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Central Bank Tools",
          content:
            "Central banks have a powerful toolkit for managing the economy:\n\n**Primary tools:**\n- **Federal Funds Rate targeting**: The interest rate at which banks lend reserves to each other overnight. This anchors all short-term rates in the economy. The Fed sets a *target range* (e.g., 5.25–5.50%) and uses open market operations to keep rates there.\n- **Open Market Operations (OMO)**: The Fed buys Treasuries to inject reserves (lowering rates) or sells Treasuries to drain reserves (raising rates). The main daily tool.\n- **Reserve Requirements**: The fraction of deposits banks must hold in reserve. Rarely used in modern practice — the Fed moved to an 'ample reserves' framework.\n- **Discount Window**: Direct lending to banks at the discount rate (slightly above fed funds). Acts as emergency backstop.\n- **Interest on Excess Reserves (IOER) / Interest on Reserve Balances (IORB)**: The Fed pays banks to hold reserves — now the *primary* rate-control mechanism in the ample-reserves framework.\n\n**Balance sheet tools:**\n- **Quantitative Easing (QE)**: Fed buys longer-term Treasuries and mortgage-backed securities (MBS) → increases bank reserves → pushes down long-term yields → stimulates borrowing and asset prices\n- **Quantitative Tightening (QT)**: Reverse of QE — the Fed allows its balance sheet to shrink by not reinvesting proceeds from maturing bonds",
          highlight: [
            "Federal Funds Rate",
            "open market operations",
            "reserve requirements",
            "discount window",
            "IOER",
            "quantitative easing",
            "QE",
            "quantitative tightening",
            "QT",
          ],
        },
        {
          type: "teach",
          title: "Transmission Mechanism & Policy Lags",
          content:
            "Monetary policy does not work instantly — it flows through the economy via several channels, each taking time:\n\n**Interest Rate Channel**: Higher policy rates → higher borrowing costs for mortgages, auto loans, corporate debt → reduced consumer spending and business investment → lower demand → lower inflation. The most direct channel.\n\n**Credit Channel**: Higher rates tighten bank lending standards, reduce collateral values, and constrain credit availability — especially for small businesses and households that can't access capital markets directly.\n\n**Asset Price Channel**: Higher rates lower equity valuations (higher discount rate) and home prices (higher mortgage costs) → negative wealth effect → reduced consumer spending.\n\n**Exchange Rate Channel**: Higher US rates attract foreign capital → USD strengthens → US exports become more expensive abroad, imports cheaper → trade deficit widens → domestic demand contracts.\n\n**Policy Lags — why this is hard:**\n- **Inside lag**: Time from recognizing a problem to implementing policy (weeks to months)\n- **Outside lag**: Time from policy action to economic impact (**18–24 months** on average)\n\nBecause policy acts on forecasts of *future* conditions, central bankers must constantly guess where the economy will be two years from now — an inherently uncertain task.",
          highlight: [
            "interest rate channel",
            "credit channel",
            "asset price channel",
            "exchange rate channel",
            "inside lag",
            "outside lag",
            "18-24 months",
          ],
        },
        {
          type: "teach",
          title: "Monetary Policy Frameworks & the Dot Plot",
          content:
            "**Inflation Targeting**: Most major central banks (Fed, ECB, Bank of England) explicitly target a specific inflation rate. The Fed targets **2% PCE inflation** (Personal Consumption Expenditures deflator — broader than CPI).\n\n**Average Inflation Targeting (AIT)**: Adopted by the Fed post-2020. Rather than targeting 2% at every moment, the Fed allows inflation to run above 2% for a period to make up for below-target years. This gives more room to keep rates low during weak recoveries — but contributed to the slow response to 2021–2022 inflation.\n\n**Dual Mandate**: Unlike the ECB (price stability only), the US Fed has a **dual mandate** from Congress: (1) price stability and (2) maximum employment. When these goals conflict — e.g., full employment with high inflation — the Fed must choose, creating difficult trade-offs.\n\n**Forward Guidance**: The Fed communicates its future rate intentions through speeches, FOMC statements, and the **dot plot** — a chart showing each Fed official's anonymous projection for future fed funds rates. When the dot plot shifts hawkish (higher projected rates), markets reprice immediately, even before any rate move. Forward guidance is a powerful tool that acts through expectations alone.\n\n**Neutral Rate (r*)**: The theoretical interest rate that neither stimulates nor restricts the economy. Policy above r* is restrictive; below r* is accommodative. The Fed estimates r* at roughly 2.5–3% in nominal terms.",
          highlight: [
            "inflation targeting",
            "PCE",
            "average inflation targeting",
            "AIT",
            "dual mandate",
            "forward guidance",
            "dot plot",
            "neutral rate",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "When the Federal Reserve conducts Quantitative Easing (QE), what is the primary mechanism by which it stimulates the economy?",
          options: [
            "The Fed buys Treasuries and MBS, increasing bank reserves and pushing down long-term yields to encourage borrowing",
            "The Fed prints new currency and distributes it directly to households as stimulus checks",
            "The Fed lowers the federal funds rate to zero and guarantees all bank deposits",
            "The Fed sells its gold reserves to create liquidity in the financial system",
          ],
          correctIndex: 0,
          explanation:
            "In QE, the Fed purchases longer-term Treasury bonds and mortgage-backed securities from banks and other financial institutions. This injects reserves into the banking system and increases demand for these bonds, raising their prices and lowering their yields. Lower long-term yields reduce mortgage rates, corporate borrowing costs, and boost asset prices — stimulating economic activity. The Fed creates these reserves electronically — not by physically printing cash.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Lower interest rates will always cause inflation to rise.",
          correct: false,
          explanation:
            "False — the relationship depends critically on the output gap (whether the economy is above or below its potential). If an economy is severely depressed with high unemployment and slack capacity (a large negative output gap), lower rates may stimulate activity without generating inflation — prices won't rise if demand is far below supply. Japan maintained near-zero rates for decades while struggling with deflation, not inflation. Lower rates cause inflation only when the economy is at or near full capacity, where additional demand bids up prices rather than output.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A central bank faces stagflation: GDP growth has turned negative (-1.5%), unemployment has risen to 7%, but inflation is running at 8% — well above the 2% target. The economy is simultaneously suffering from high inflation AND a recession.",
          question:
            "What is the fundamental challenge of monetary policy in a stagflation scenario?",
          options: [
            "The dual mandate creates a direct conflict — raising rates to fight inflation worsens the recession, while cutting rates to support growth worsens inflation",
            "The central bank has no tools to address stagflation and must wait for it to resolve naturally",
            "Stagflation is easily solved by QE, which addresses both problems simultaneously",
            "The central bank should immediately cut rates since unemployment is more important than inflation",
          ],
          correctIndex: 0,
          explanation:
            "Stagflation (simultaneous inflation and recession — as experienced in the 1970s) is the hardest policy environment because the central bank's tools cut both ways. Raising rates to fight inflation will deepen the recession further. Cutting rates to support growth will worsen inflation. The Fed faced this exact dilemma in the 1970s, ultimately resolving it only through Paul Volcker's aggressive rate hikes in 1980–81 — which caused a deep recession but broke the inflation spiral. Supply-side shocks (like an oil embargo) that cause both higher prices AND lower output are the usual culprit.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Fiscal Policy ──────────────────────────────────────────────
    {
      id: "macroeconomics-3",
      title: "Fiscal Policy",
      description:
        "Government spending, automatic stabilizers, national debt sustainability, and fiscal policy limitations",
      icon: "Building",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Government Spending, Taxation & Automatic Stabilizers",
          content:
            "**Fiscal policy** is the use of government spending and taxation to influence aggregate demand and economic output.\n\n**Automatic stabilizers** are fiscal mechanisms that respond to economic conditions *without* any policy decision:\n- **Unemployment insurance**: When workers lose jobs, UI payments automatically increase — sustaining household spending without waiting for Congress to act\n- **Progressive income taxes**: In booms, higher incomes push people into higher tax brackets, automatically cooling demand. In recessions, falling incomes mean lower tax collections, providing an automatic cushion\n- These stabilizers smooth the cycle passively and quickly\n\n**Discretionary fiscal policy** requires deliberate legislative or executive action:\n- **Expansionary**: Increase government spending or cut taxes during recessions\n- **Contractionary**: Cut spending or raise taxes to cool inflation or reduce deficits\n\n**Fiscal multiplier**: Government spending multiplier = 1 / (1 – MPC), where MPC is the Marginal Propensity to Consume. If the government spends $100 billion and MPC = 0.75, the multiplier = 4 — meaning $100bn of spending generates $400bn in GDP.\n\nIn practice, real-world multipliers are **smaller (0.5–1.5×)** due to leakages: taxes on additional income, savings, imports, and crowding out of private investment.",
          highlight: [
            "automatic stabilizers",
            "unemployment insurance",
            "progressive income taxes",
            "discretionary fiscal policy",
            "fiscal multiplier",
            "MPC",
          ],
        },
        {
          type: "teach",
          title: "National Debt, Deficits & Sustainability",
          content:
            "**Key distinction:**\n- **Deficit**: The *annual flow* — the amount by which government spending exceeds revenue in a single year\n- **National debt**: The *accumulated stock* — the sum of all past deficits minus surpluses\n\n**Debt-to-GDP ratio** is the primary sustainability metric. A country can sustain debt indefinitely if economic growth (g) exceeds the interest rate on the debt (r):\n- If g > r: Debt-to-GDP ratio falls automatically even with small deficits\n- If r > g: Debt spirals upward — primary surplus required to stabilize\n\n**Why the US can run large deficits:**\n- The USD is the world's **reserve currency** — global demand for Treasury securities is structurally high\n- The US borrows in its own currency — it controls the printing press (though monetizing debt causes inflation)\n- Deep, liquid bond market absorbs enormous issuance\n\n**Crowding out hypothesis**: Heavy government borrowing raises interest rates, discouraging private investment — the government 'crowds out' private capital spending, reducing long-term growth.\n\n**MMT perspective** (Modern Monetary Theory): A government issuing its own currency faces no financing constraint — deficits are only problematic if they cause inflation, not because of debt levels. Critics argue this ignores bond market discipline and the risk of runaway inflation.",
          highlight: [
            "deficit",
            "national debt",
            "debt-to-GDP",
            "reserve currency",
            "crowding out",
            "Modern Monetary Theory",
            "MMT",
          ],
        },
        {
          type: "teach",
          title: "Fiscal Policy Limitations",
          content:
            "Despite its appeal, fiscal policy faces significant real-world constraints:\n\n**Implementation lag**: Unlike monetary policy (which the Fed can implement at 8 FOMC meetings per year), fiscal policy requires legislation — budget debates, political negotiation, and committee processes can take months or years. By the time stimulus arrives, the recession may be over.\n\n**Crowding out**: Government borrowing competes for loanable funds, potentially raising interest rates and reducing private investment — partially offsetting the stimulus effect.\n\n**Ricardian Equivalence** (Robert Barro): A controversial theory proposing that rational consumers, knowing that deficits today mean higher taxes tomorrow, *save* today's tax cut in anticipation of future tax bills — perfectly offsetting the fiscal stimulus. In practice, full Ricardian equivalence doesn't hold (consumers are not perfectly rational or forward-looking), but partial offsetting effects are real.\n\n**Political constraints**: Deficit reduction requires either spending cuts (politically painful) or tax increases (politically painful). Democratic systems systematically bias toward deficits — spending benefits are visible and immediate while costs are deferred.\n\n**Debt sustainability limits**: If investors lose confidence in debt repayment, yields spike and borrowing costs become prohibitive — the 'bond vigilante' constraint. Emerging market countries face this risk acutely.",
          highlight: [
            "implementation lag",
            "crowding out",
            "Ricardian equivalence",
            "political constraints",
            "debt sustainability",
            "bond vigilantes",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Which of the following is the best example of an automatic stabilizer?",
          options: [
            "Unemployment insurance payments that rise automatically when workers lose jobs in a recession",
            "A congressional vote to cut income taxes by $500 billion during a recession",
            "The Federal Reserve cutting interest rates by 50 basis points",
            "The government announcing a $1 trillion infrastructure spending program",
          ],
          correctIndex: 0,
          explanation:
            "Unemployment insurance is the classic automatic stabilizer — it requires no congressional vote or policy decision. When workers are laid off, UI payments automatically flow to them, sustaining purchasing power and preventing the recession from deepening further. The payments then shrink automatically as the labor market recovers. Options B and D require legislative action (discretionary fiscal policy) and Option C is monetary policy, not fiscal.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Government budget deficits always cause inflation.",
          correct: false,
          explanation:
            "False — whether deficits cause inflation depends on two key factors: (1) how they are financed and (2) the state of the output gap. If deficits are financed by issuing bonds (borrowing from markets), money supply does not directly increase. If financed by central bank money creation (monetization), inflation is more likely. Most critically, if the economy has substantial slack (high unemployment, unused capacity), deficit spending can boost output and employment without raising prices — because supply can expand to meet demand. Deficits during the 2008–2015 period and 2020 recession produced little inflation; deficits in 2021–2022 on top of a stimulated economy with supply disruptions contributed to high inflation.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An economy is in a recession. The government announces $200 billion in spending on infrastructure. Economists estimate the MPC at 0.8. The central bank independently raises interest rates by 1% in response to fiscal stimulus concerns, which economists estimate will reduce private investment by $50 billion.",
          question:
            "What is the net fiscal multiplier effect on GDP, accounting for crowding out?",
          options: [
            "Fiscal multiplier boosts GDP by $1 trillion, but crowding out reduces it by $50 billion — net boost is approximately $950 billion",
            "The multiplier is exactly 1 — $200 billion in spending adds $200 billion to GDP",
            "No net effect — Ricardian equivalence means consumers save the equivalent amount",
            "GDP contracts — rate hikes always outweigh fiscal stimulus",
          ],
          correctIndex: 0,
          explanation:
            "With MPC = 0.8, the fiscal multiplier = 1/(1-0.8) = 5. $200 billion × 5 = $1 trillion gross boost to GDP. But the 1% rate hike crowds out $50 billion in private investment, reducing the net impact to approximately $950 billion. In practice, the multiplier is also reduced by taxes on additional income, import leakage, and partial Ricardian equivalence — real multipliers are typically 0.5–1.5×, not 5×. But this scenario illustrates the conceptual mechanics: fiscal expansion and monetary tightening can work at cross-purposes.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: International Trade & Finance ──────────────────────────────
    {
      id: "macroeconomics-4",
      title: "International Trade & Finance",
      description:
        "Comparative advantage, balance of payments, exchange rate systems, and the impossible trilemma",
      icon: "Globe",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Trade Theory: Comparative vs Absolute Advantage",
          content:
            "**Absolute advantage**: Country A produces something more efficiently than Country B. Intuitive, but incomplete.\n\n**Comparative advantage** (David Ricardo, 1817): The deeper insight. A country should specialize in goods where it has the *lowest opportunity cost*, not the lowest absolute cost. Trade is beneficial even if one country is better at producing *everything*.\n\n**Example**: The US is better at producing both wheat and cloth than Portugal. But:\n- US opportunity cost of wheat: Give up 1 unit of cloth per bushel\n- Portugal opportunity cost of wheat: Give up 0.5 units of cloth per bushel\n\nPortugal has a comparative advantage in wheat (lower opportunity cost). The US has comparative advantage in cloth. Both gain by specializing and trading — even though the US is absolutely more productive at both.\n\n**Gains from trade**: Specialization allows countries to consume beyond their production possibility frontier. Global output is maximized when each country produces what it does at lowest opportunity cost.\n\n**Heckscher-Ohlin theory**: Countries export goods that intensively use their abundant factors of production:\n- Labor-abundant countries export labor-intensive goods (China: manufacturing)\n- Capital-abundant countries export capital-intensive goods (US: aircraft, software)\n- Land-abundant countries export resource-intensive goods (Australia: minerals, wheat)",
          highlight: [
            "absolute advantage",
            "comparative advantage",
            "opportunity cost",
            "Ricardo",
            "gains from trade",
            "Heckscher-Ohlin",
            "factor endowment",
          ],
        },
        {
          type: "teach",
          title: "Balance of Payments",
          content:
            "The **Balance of Payments (BoP)** records all economic transactions between a country's residents and the rest of the world. It must always balance to zero.\n\n**Current Account** — trade in goods, services, income, and transfers:\n- **Trade balance**: Goods exports minus imports (merchandise trade)\n- **Services balance**: Financial services, tourism, intellectual property licensing\n- **Primary income**: Investment income (dividends, interest) earned abroad vs paid to foreigners\n- **Secondary income**: Remittances, foreign aid\n\n**Capital Account** — small; records transfers of assets (debt forgiveness, migrant transfers)\n\n**Financial Account** — cross-border investment flows:\n- Foreign Direct Investment (FDI): companies building factories abroad\n- Portfolio investment: stocks and bonds bought across borders\n- Reserve assets: central bank purchases of foreign currencies\n\n**The fundamental identity**: Current Account + Financial Account = 0\nA US current account deficit means the US imports more than it exports. Those extra imports must be paid for somehow — by foreigners investing in the US (buying Treasuries, stocks, real estate). So a trade deficit is *always* mirrored by foreign capital inflows.\n\n**Twin deficits hypothesis**: A government budget deficit tends to produce a current account deficit — government borrowing attracts foreign capital (appreciating the currency), making exports less competitive and imports cheaper.",
          highlight: [
            "balance of payments",
            "current account",
            "financial account",
            "trade balance",
            "FDI",
            "twin deficits",
            "capital inflows",
          ],
        },
        {
          type: "teach",
          title: "Exchange Rate Systems & the Impossible Trilemma",
          content:
            "Countries must choose how to manage their exchange rates:\n\n**Fixed exchange rate** (currency peg): Central bank maintains a set exchange rate by buying/selling foreign reserves. Provides stability for trade but requires large reserves and limits monetary policy independence.\n- *Bretton Woods* (1944–1971): All currencies pegged to USD, USD pegged to gold at $35/oz. Collapsed when the US ran out of gold reserves.\n\n**Floating exchange rate**: Market supply and demand determine the rate. Allows independent monetary policy but creates uncertainty for traders.\n\n**Managed float** (dirty float): Market-determined with occasional central bank intervention — most major currencies today.\n\n**Currency board**: Extreme fixed peg where the domestic currency is fully backed by foreign reserves and the central bank has no independent monetary policy (Hong Kong's HKD pegged to USD since 1983).\n\n**The Impossible Trilemma** (Mundell-Fleming): A country cannot simultaneously have all three:\n1. **Free capital flows** (money moves freely across borders)\n2. **Fixed exchange rate** (stable, predictable currency)\n3. **Independent monetary policy** (set interest rates domestically)\n\nChoose any two:\n- EU pre-2010 periphery: free capital + fixed exchange → no monetary policy\n- China historically: fixed exchange + monetary policy → capital controls\n- US/UK/Japan: free capital + monetary policy → floating exchange rate",
          highlight: [
            "fixed exchange rate",
            "floating exchange rate",
            "managed float",
            "currency board",
            "impossible trilemma",
            "Mundell-Fleming",
            "capital controls",
            "Bretton Woods",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Portugal can produce wine at an opportunity cost of 1 unit of cloth, while England can produce wine at an opportunity cost of 2 units of cloth. England is more productive at producing both wine and cloth in absolute terms. What does comparative advantage theory predict?",
          options: [
            "Portugal should specialize in wine and England in cloth — both gain from trade despite England's absolute advantage in both",
            "England should produce everything since it has absolute advantage in both goods",
            "No trade will occur because England is more efficient at both goods",
            "Portugal should import both wine and cloth from England to benefit from England's superior productivity",
          ],
          correctIndex: 0,
          explanation:
            "This is Ricardo's core insight. Portugal has a comparative advantage in wine (opportunity cost = 1 cloth vs England's 2 cloth). England has a comparative advantage in cloth (opportunity cost = 0.5 wine vs Portugal's 1 wine). Even though England is absolutely more productive at both, specialization and trade allows both countries to consume more than they could produce alone. Comparative advantage — not absolute productivity — drives the gains from trade. This principle remains one of the most powerful and counterintuitive results in economics.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A persistent current account deficit is always a sign of economic weakness and must be reduced immediately.",
          correct: false,
          explanation:
            "False. A current account deficit simply means a country is a net importer of goods and services and a net recipient of foreign capital. This can reflect economic *strength*: the US runs a large deficit partly because foreign investors find the US an attractive destination (safe Treasuries, high-return equities). The capital inflows that mirror the deficit fund productive investment. Australia ran persistent current account deficits for decades while maintaining strong growth. Deficits become problematic when they finance unproductive consumption, when foreign debt is in another currency, or when sudden capital withdrawal could cause a crisis — not because deficits are inherently bad.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A small open economy wants to attract foreign investment (free capital flows) while maintaining a fixed exchange rate pegged to the USD to provide currency stability for its export businesses. Its central bank currently has the ability to set domestic interest rates independently.",
          question:
            "According to the Impossible Trilemma (Mundell-Fleming), what must this country sacrifice?",
          options: [
            "Independent monetary policy — it cannot maintain free capital flows, a fixed exchange rate, AND independent monetary policy simultaneously",
            "Free capital flows — it must impose capital controls to maintain both the peg and monetary policy",
            "The fixed exchange rate — it must move to a floating exchange rate",
            "Nothing — the trilemma is a theoretical construct that does not apply in practice",
          ],
          correctIndex: 0,
          explanation:
            "The Impossible Trilemma states that only two of three goals can be achieved simultaneously. By choosing free capital flows + fixed exchange rate, the country must surrender independent monetary policy. Why? If the central bank raises rates above the US level, capital floods in, creating upward pressure on the exchange rate — forcing the central bank to buy foreign reserves and lower domestic rates to maintain the peg. Effectively, the country's interest rates must track the anchor country's (US) rates. The Eurozone demonstrated this: member countries had free capital flows and fixed exchange rates (the euro) but no national monetary policy — the ECB set one rate for all.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Inflation & Deflation Dynamics ─────────────────────────────
    {
      id: "macroeconomics-5",
      title: "Inflation & Deflation Dynamics",
      description:
        "Quantity theory of money, Phillips Curve, NAIRU, hyperinflation mechanics, and the deflation trap",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Quantity Theory of Money",
          content:
            "**The Equation of Exchange**: **MV = PQ**\n\nWhere:\n- **M** = Money supply (quantity of money in circulation)\n- **V** = Velocity of money (how many times each dollar is spent per year)\n- **P** = Price level (average prices across the economy)\n- **Q** = Real output (quantity of goods and services produced)\n\nRearranging: **P = MV / Q** — prices depend on money supply, velocity, and real output.\n\n**Monetarism** (Milton Friedman): 'Inflation is always and everywhere a monetary phenomenon.' If V and Q are roughly stable, increases in M translate directly into increases in P. Policy implication: control the money supply to control inflation.\n\n**The velocity critique**: V is not stable — it fluctuates substantially, especially during financial crises. In 2008–2009, the Fed massively increased M (QE) but velocity collapsed as banks hoarded reserves and consumers deleveraged — so P barely moved. Similarly in 2020. The QE-inflation link is therefore not mechanical.\n\n**Demand-pull vs cost-push inflation:**\n- **Demand-pull**: Too much money chasing too few goods. Output exceeds potential, driving up prices.\n- **Cost-push**: Supply shocks raise input costs (oil, labor), which firms pass on as higher prices — even if demand is weak. Example: 1970s OPEC oil embargo.",
          highlight: [
            "MV=PQ",
            "quantity theory of money",
            "velocity",
            "monetarism",
            "Friedman",
            "demand-pull inflation",
            "cost-push inflation",
          ],
        },
        {
          type: "teach",
          title: "Phillips Curve & NAIRU",
          content:
            "**The Original Phillips Curve** (A.W. Phillips, 1958): Observed an empirical inverse relationship between unemployment and wage inflation in UK data 1861–1957. Lower unemployment → higher wage pressure → higher inflation.\n\nPolicymakers in the 1960s believed they could 'trade off' lower unemployment for higher inflation — a menu of choices.\n\n**Stagflation breaks the curve**: In the 1970s, the US experienced *both* high inflation and high unemployment simultaneously — something the original Phillips curve said was impossible. Supply shocks (oil embargo) shifted the entire curve outward.\n\n**Expectations-Augmented Phillips Curve** (Friedman and Phelps, 1968): The trade-off is only temporary. If workers expect 5% inflation, they demand 5% wage increases — keeping real wages flat. There is no *long-run* trade-off between unemployment and inflation. Only *surprises* work, and they only work temporarily.\n\n**NAIRU — Non-Accelerating Inflation Rate of Unemployment**: The unemployment rate at which inflation neither accelerates nor decelerates. At NAIRU, the economy is at its 'natural rate' — consistent with stable inflation. Below NAIRU → labor market tight → wages rise faster → inflation accelerates. Above NAIRU → slack → inflation decelerates.\n\nThe Fed estimates NAIRU at around 4–4.5% for the US (though the true rate is unobservable and shifts over time).",
          highlight: [
            "Phillips Curve",
            "stagflation",
            "expectations-augmented Phillips Curve",
            "Friedman",
            "Phelps",
            "NAIRU",
            "natural rate of unemployment",
            "inflation expectations",
          ],
        },
        {
          type: "teach",
          title: "Hyperinflation & the Deflation Trap",
          content:
            "**Hyperinflation mechanics**: Conventionally defined as inflation exceeding 50% per month. Once confidence in a currency collapses, it can accelerate into a self-reinforcing spiral:\n\n1. Government prints money to finance deficits\n2. More money → higher prices → citizens spend money faster to avoid holding depreciating currency\n3. **Velocity surges** as everyone rushes to exchange money for real goods\n4. Faster spending creates more inflation → MV = PQ spins out of control\n5. Wage-price spiral: workers demand higher wages → firms raise prices to cover wage costs → wages rise again\n\nHistorical examples:\n- **Germany 1923**: Weimar Republic printed marks to pay WWI reparations. Exchange rate went from 4 marks/USD to 4.2 *trillion* marks/USD in 18 months\n- **Zimbabwe 2008**: 89.7 sextillion percent annual inflation at peak — the central bank issued a 100 trillion Zimbabwe dollar note\n\n**Deflation trap** (Fisher Debt Deflation, 1933): Falling prices seem beneficial for consumers but create a devastating spiral:\n1. Falling prices → consumers delay purchases (why buy today if it's cheaper tomorrow?)\n2. Lower demand → businesses cut prices more → workers laid off\n3. Falling wages increase the *real* burden of fixed debt → defaults rise\n4. Bank losses → credit contraction → less investment → more deflation\n\n**Japan's Lost Decade**: Prolonged deflation (1990s–2010s) after asset bubble burst. Despite near-zero interest rates, deflation expectations kept consumers and businesses from spending — the liquidity trap.\n\n**Why central banks target positive inflation**: Slight positive inflation (1–3%) provides a buffer against the deflation trap, gives monetary policy positive 'ammunition,' and allows gradual real wage adjustment.",
          highlight: [
            "hyperinflation",
            "wage-price spiral",
            "velocity",
            "Weimar Germany",
            "Zimbabwe",
            "deflation trap",
            "Fisher debt deflation",
            "Japan",
            "liquidity trap",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "What is the NAIRU (Non-Accelerating Inflation Rate of Unemployment)?",
          options: [
            "The unemployment rate at which inflation neither accelerates nor decelerates — consistent with stable prices",
            "The minimum unemployment rate an economy can achieve without entering recession",
            "The unemployment rate that automatically triggers Federal Reserve rate cuts",
            "The level of unemployment at which nominal wages stop rising",
          ],
          correctIndex: 0,
          explanation:
            "NAIRU is the unemployment rate consistent with stable (non-accelerating) inflation. When actual unemployment falls *below* NAIRU, the labor market is too tight — companies compete aggressively for workers, bidding up wages, which firms pass on as higher prices. Inflation then accelerates. When unemployment is *above* NAIRU, there is labor market slack — wage growth slows, reducing inflationary pressure and causing inflation to decelerate. NAIRU is unobservable and estimated to be around 4–4.5% for the US, though it shifts over time with structural changes in the labor market.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Deflation (falling prices) is always better for consumers because their money buys more goods and services.",
          correct: false,
          explanation:
            "False — deflation can be severely harmful through multiple channels. The Fisher Debt Deflation spiral shows that falling prices increase the real burden of fixed debts, leading to defaults and credit contraction. Consumers who expect prices to fall further delay purchases ('why buy today if it's cheaper next month?'), collapsing demand and causing businesses to cut jobs and prices further. The resulting death spiral — as Japan experienced for two decades — is one of the most damaging macroeconomic outcomes. Slight positive inflation (1–3%) is widely preferred by central banks precisely because deflation can be nearly impossible to escape once entrenched.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A commodity-dependent emerging market runs large fiscal deficits funded by central bank money printing. Commodity export revenues collapse, the exchange rate falls 60% against the USD, import prices surge, workers demand wage increases to keep up with rising living costs, and businesses raise prices in anticipation of future wage demands. Annual inflation reaches 200% and is accelerating.",
          question:
            "Which inflation dynamics are most prominently at work in this scenario?",
          options: [
            "Wage-price spiral combined with monetary financing of deficits — classic hyperinflation precursors",
            "Demand-pull inflation driven by excessive consumer spending and tight labor markets",
            "Cost-push inflation driven by a supply shortage of domestic goods — unrelated to money supply",
            "Deflation trap — falling asset prices causing money velocity to collapse",
          ],
          correctIndex: 0,
          explanation:
            "This scenario exhibits the classic hyperinflation dynamic. Central bank money printing (M increases) + collapsed exchange rate (import costs surge → cost-push) → workers demand wage increases to protect real wages → businesses pre-emptively raise prices (expectations) → this validates the wage demands → spiral accelerates. The quantity theory (MV = PQ) is fully in play: money supply is growing, and velocity is rising as people spend money faster before it loses more value. This closely resembles Argentina, Venezuela, or Zimbabwe episodes where fiscal monetization combined with exchange rate collapse ignited hyperinflation.",
          difficulty: 3,
        },
      ],
    },
  ],
};
