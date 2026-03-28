import type { Unit } from "./types";

export const UNIT_INFLATION_ECONOMICS: Unit = {
  id: "inflation-economics",
  title: "Inflation & Economic Fundamentals",
  description:
    "Understand inflation measures, its causes, how it affects investments, supply chains, and what stagflation means for markets",
  icon: "📈",
  color: "#ef4444",
  lessons: [
    // ─── Lesson 1: Understanding Inflation ──────────────────────────────────────
    {
      id: "inflation-1",
      title: "📈 Understanding Inflation",
      description:
        "CPI, PCE, PPI, and hyperinflation — the key measures and what they tell us",
      icon: "TrendingUp",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "💸 What Is Inflation?",
          content:
            "**Inflation** is a sustained increase in the general price level of goods and services over time — which means your money buys less.\n\nIf a basket of groceries costs $100 today and $104 next year, inflation is 4%. The **purchasing power** of $1 has eroded — it now buys what $0.96 bought last year.\n\n**Why it matters to investors:**\n- Cash loses real value during inflation\n- Fixed income (bonds) erodes in real terms\n- Equity returns must be evaluated in *real* (inflation-adjusted) terms\n- Central banks raise interest rates to slow inflation — which moves all asset prices\n\n**Mild inflation (1–3%) is normal and even healthy** — it encourages spending over hoarding. But high or unpredictable inflation destroys economic planning and savings.",
          highlight: ["inflation", "purchasing power", "real value", "interest rates"],
        },
        {
          type: "teach",
          title: "📊 CPI, PCE, and PPI Explained",
          content:
            "The three main inflation measures tracked by investors and policymakers:\n\n**CPI — Consumer Price Index:**\nMeasures the cost of a fixed basket of goods (housing, food, energy, healthcare, etc.). Published monthly by the Bureau of Labor Statistics.\n- **Headline CPI**: includes all items\n- **Core CPI**: excludes food and energy (more volatile) — better signal of underlying inflation\n\n**PCE — Personal Consumption Expenditures:**\nThe **Fed's preferred measure**. Key difference from CPI: PCE weights shift with actual consumer behavior. If beef gets expensive and consumers switch to chicken, PCE captures that substitution — CPI does not. PCE tends to run 0.3–0.5% lower than CPI.\n\n**PPI — Producer Price Index:**\nMeasures prices at the **producer/wholesale level** — before goods reach consumers. PPI is an upstream leading indicator: a spike in PPI typically filters through to CPI within 1–3 months.\n\n**Summary:**\n| Measure | Published by | Used for |\n|---------|-------------|----------|\n| CPI | BLS | COLA adjustments, TIPS |\n| PCE | BEA | Fed's 2% inflation target |\n| PPI | BLS | Leading indicator for CPI |",
          highlight: ["CPI", "PCE", "PPI", "core CPI", "headline", "Fed"],
        },
        {
          type: "teach",
          title: "🔥 Hyperinflation: When It All Breaks Down",
          content:
            "**Hyperinflation** is defined as inflation exceeding **50% per month** — prices more than double every 51 days.\n\n**Historical examples:**\n- **Weimar Germany (1921–1923)**: Prices doubled every 3.7 days at peak. Workers were paid twice daily and rushed to spend before prices rose further. A wheelbarrow of cash was needed to buy bread.\n- **Zimbabwe (2007–2008)**: Peak monthly rate of 79.6 billion percent. The government printed 100-trillion-dollar banknotes. The economy eventually dollarized.\n- **Venezuela (2018)**: Inflation hit 1,000,000% annually. Bolivar lost 99.99% of its value; citizens fled with whatever dollars they could find.\n\n**Common causes of hyperinflation:**\n1. Government printing money to finance spending (monetizing debt)\n2. Loss of confidence in the currency\n3. Supply collapses combined with massive money growth\n\n**Lesson for investors**: Diversifying across currencies, hard assets, and foreign equities is a hedge against tail-risk monetary collapse.",
          highlight: ["hyperinflation", "Weimar Germany", "Zimbabwe", "Venezuela", "monetizing debt"],
        },
        {
          type: "quiz-mc",
          question:
            "Why does the Federal Reserve prefer PCE over CPI as its primary inflation measure?",
          options: [
            "PCE weights adjust based on actual consumer behavior, making it more accurate",
            "PCE is published more frequently than CPI each month",
            "CPI excludes energy and food prices, making it too volatile",
            "PCE measures wholesale prices before they reach consumers",
          ],
          correctIndex: 0,
          explanation:
            "PCE (Personal Consumption Expenditures) adjusts its basket weights as consumers substitute between goods — if beef prices spike and consumers switch to chicken, PCE captures that shift. CPI uses a fixed basket that does not adapt. This substitution effect makes PCE a more accurate real-world reflection of consumer spending patterns.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The Producer Price Index (PPI) is a lagging indicator that confirms CPI trends after they have already appeared in consumer prices.",
          correct: false,
          explanation:
            "False. PPI is a leading indicator — it measures prices at the wholesale/producer level before goods reach consumers. A spike in PPI typically flows through to CPI within 1–3 months, giving economists an early warning signal of where consumer inflation is heading.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A country's CPI is running at 6% annually. Its PCE is reported at 5.4%. The PPI jumped 9% last month while CPI was still at 6%. A central bank economist is deciding whether to raise interest rates aggressively.",
          question: "What does the PPI spike most likely signal?",
          options: [
            "Consumer inflation will likely accelerate over the next 1–3 months as producer costs pass through",
            "The economy is entering deflation because PPI is falling relative to CPI",
            "PCE will decline next month because consumers are substituting to cheaper goods",
            "Interest rates should be cut immediately to stimulate production",
          ],
          correctIndex: 0,
          explanation:
            "PPI measures upstream (producer-level) prices. When PPI surges well above CPI, it signals that cost pressures in the production pipeline have not yet fully passed through to consumers. Within 1–3 months, businesses typically raise retail prices to restore margins, driving CPI higher. This is a classic leading signal for the Fed to act preemptively.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Causes of Inflation ──────────────────────────────────────────
    {
      id: "inflation-2",
      title: "⚙️ Causes of Inflation",
      description:
        "Demand-pull, cost-push, wage-price spirals, and the monetary explanation",
      icon: "Settings",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📥 Demand-Pull vs Cost-Push Inflation",
          content:
            "**Demand-Pull Inflation** — 'Too much money chasing too few goods'\nOccurs when aggregate demand in an economy exceeds aggregate supply.\n- Triggered by fiscal stimulus, low interest rates, consumer confidence surges, or booming exports\n- Economy is 'overheating': companies can't produce fast enough, so prices rise\n- Example: Post-COVID stimulus checks flooded consumers with cash while supply chains were constrained → prices surged\n\n**Cost-Push Inflation** — Supply shocks drive up production costs\nOccurs when input costs for producers rise sharply, forcing them to pass costs to consumers.\n- **Energy shocks**: OPEC oil embargo 1973 quadrupled oil prices overnight\n- **Supply chain disruptions**: COVID-19 shutdown factories, snarled shipping, created shortages\n- **Commodity spikes**: Drought → wheat prices rise → food inflation\n- Example: Global semiconductor shortage 2020–2022 raised costs across autos, electronics, appliances\n\n**Key distinction:**\n| Type | Cause | Remedy |\n|------|-------|--------|\n| Demand-pull | Excess demand | Raise rates, reduce stimulus |\n| Cost-push | Supply disruption | Improve supply (rates less effective) |",
          highlight: ["demand-pull", "cost-push", "supply shock", "overheating", "OPEC"],
        },
        {
          type: "teach",
          title: "🔄 The Wage-Price Spiral",
          content:
            "**Built-in (structural) inflation** arises from expectations and feedback loops — the most dangerous kind.\n\n**The wage-price spiral mechanism:**\n1. Inflation rises → workers' real wages fall\n2. Workers demand higher nominal wages to maintain living standards\n3. Companies face higher labor costs → raise prices to preserve margins\n4. Higher prices → workers demand even higher wages\n5. Repeat → self-fulfilling inflationary cycle\n\n**Historical example — 1970s US:**\nOPEC oil shock raised costs across the economy. Workers negotiated cost-of-living adjustment (COLA) clauses. Wages and prices chased each other upward. Fed Chair Paul Volcker ultimately broke the cycle in 1979–1981 by raising rates to 20% — causing a painful recession but finally ending the spiral.\n\n**Why expectations matter:**\nIf businesses and workers expect 6% inflation, they act as if it's already happening (wage demands, price increases). These **inflation expectations** become self-fulfilling.\n\n**The Fed's anchor**: Keeping long-run inflation expectations at 2% is the Fed's most important tool. Once expectations become 'unanchored,' the spiral is much harder to stop.",
          highlight: ["wage-price spiral", "COLA", "inflation expectations", "Volcker", "unanchored"],
        },
        {
          type: "teach",
          title: "💵 Friedman's Monetary Explanation & 2021–2023 Inflation",
          content:
            "**Milton Friedman's famous dictum:**\n'Inflation is always and everywhere a monetary phenomenon.'\n\nThe logic: if money supply grows faster than economic output, each dollar chases a proportionally larger share of goods — prices must rise.\n\n**Quantity Theory of Money:** MV = PQ\n- M = money supply, V = velocity of money\n- P = price level, Q = real output\n- If M doubles and Q stays fixed, P must double\n\n**2021–2023 US Inflation Episode:**\nA perfect storm of causes:\n1. **Demand surge**: $5+ trillion in fiscal stimulus (CARES Act, American Rescue Plan) injected cash into households\n2. **Supply chain disruption**: COVID shutdowns created shortages across electronics, autos, furniture, appliances\n3. **Labor market tightness**: 'Great Resignation' reduced labor supply → wages surged → cost-push\n4. **Energy spike**: Russia-Ukraine war in 2022 drove oil and gas prices sharply higher\n\nResult: **CPI peaked at 9.1% in June 2022** — the highest in 40 years. The Fed responded with 11 rate hikes totaling 525 basis points (5.25%) in 2022–2023.",
          highlight: ["Friedman", "MV=PQ", "money supply", "2022 inflation", "rate hikes", "basis points"],
        },
        {
          type: "quiz-mc",
          question:
            "What is a 'wage-price spiral' in the context of inflation?",
          options: [
            "Workers demand higher wages due to inflation, which raises costs, leading to more inflation",
            "Wages rise faster than prices, causing deflation as consumers lose purchasing power",
            "Companies cut wages during inflation to reduce costs and stabilize prices",
            "A government policy that ties wage growth directly to GDP growth",
          ],
          correctIndex: 0,
          explanation:
            "A wage-price spiral is a self-reinforcing feedback loop: inflation erodes workers' real purchasing power, so they demand higher nominal wages. Companies, facing higher labor costs, raise prices to protect margins. Higher prices then trigger further wage demands. This cycle can become self-sustaining and is one of the most difficult inflationary dynamics for central banks to break.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Cost-push inflation caused by a supply shock is best addressed by raising interest rates, since higher rates reduce spending and quickly restore supply.",
          correct: false,
          explanation:
            "False. Raising interest rates addresses demand-pull inflation by cooling spending. But cost-push inflation stems from supply disruptions — higher rates do not fix a shortage of semiconductors, a blocked shipping route, or a drought. Rate hikes during supply-side inflation risk causing a recession without fully resolving the price pressures, leaving policymakers with limited good options.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "In 2021, the US government distributed $1,400 stimulus checks to most Americans while many factories in Asia remained shut due to COVID restrictions. Used car prices jumped 45%, lumber prices tripled, and restaurant menus repriced weekly.",
          question: "Which type(s) of inflation best describe this episode?",
          options: [
            "Both demand-pull (stimulus cash) and cost-push (supply chain disruptions) simultaneously",
            "Pure cost-push only, because supply chains were the root cause",
            "Built-in inflation only, caused by a wage-price spiral from higher oil prices",
            "Hyperinflation triggered by excessive money printing beyond the Fed's control",
          ],
          correctIndex: 0,
          explanation:
            "The 2021–2022 inflation episode was a rare combination: stimulus created massive demand-pull (households flush with cash spent heavily), while COVID shutdowns and shipping disruptions caused severe cost-push inflation. Both forces hit simultaneously — making the inflationary episode particularly sharp and broad-based across categories.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Inflation & Investments ──────────────────────────────────────
    {
      id: "inflation-3",
      title: "💼 Inflation & Investments",
      description:
        "Real returns, TIPS, gold, equities, and real assets as inflation hedges",
      icon: "Briefcase",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📉 Real Returns: What Inflation Does to Your Portfolio",
          content:
            "**The fundamental rule:** What you earn minus inflation is what you actually gain.\n\n**Real Return = Nominal Return − Inflation Rate**\n\nExamples:\n- Stocks return 7%, inflation is 4% → Real return = **3%**\n- Savings account earns 1%, inflation is 6% → Real return = **–5%** (you are losing purchasing power)\n- Bond yields 4%, inflation is 4% → Real return = **0%** (breaking even)\n\n**The Fisher Effect** (named after economist Irving Fisher):\nNominal Rate ≈ Real Rate + Expected Inflation\nWhen markets expect higher inflation, nominal bond yields rise accordingly.\n\n**Historical context:**\nIn the 1970s, stocks returned about 5–7% nominally, but with 8–12% inflation, real returns were deeply negative for most of the decade. Investors who held stocks 'felt' they were making money while actually losing ground.\n\n**Key insight**: Always evaluate investments using real returns, especially during inflationary periods. A 10% return in 9% inflation is barely better than holding cash.",
          highlight: ["real return", "nominal return", "Fisher Effect", "inflation rate", "purchasing power"],
        },
        {
          type: "teach",
          title: "🛡️ TIPS, Gold, and Inflation Hedges",
          content:
            "**TIPS — Treasury Inflation-Protected Securities:**\nUS government bonds where the **principal adjusts with CPI**.\n- If CPI rises 5%, a $1,000 TIPS bond becomes $1,050 in principal\n- Interest is paid on the adjusted principal — so your coupon grows with inflation\n- At maturity you receive the greater of the original or inflation-adjusted principal\n- Result: **guaranteed positive real return** (equal to the TIPS yield at purchase)\n- Trade-off: lower nominal yields than regular Treasuries; if inflation is low, you'd have done better with regular bonds\n\n**Gold as inflation hedge — Mixed evidence:**\n- 1970s: Gold surged from $35/oz to $850/oz as inflation raged → excellent hedge\n- 2021–2022: Inflation hit 40-year highs, yet gold was flat to down → poor hedge\n- Gold is best thought of as a hedge against **currency debasement and tail risk** — not reliable for ordinary inflation cycles\n\n**Real Assets as inflation hedges:**\n- **Real estate**: Rents typically rise with inflation; property values often track or exceed CPI\n- **Commodities**: Raw materials (oil, wheat, copper) are inputs to inflation itself — prices tend to rise with CPI\n- **Infrastructure**: Toll roads, utilities, pipelines — often have regulated pricing tied to CPI",
          highlight: ["TIPS", "CPI-adjusted", "gold", "real assets", "commodities", "real estate"],
        },
        {
          type: "teach",
          title: "📊 Equities vs Inflation: Pricing Power Is Everything",
          content:
            "**Conventional wisdom**: Stocks are a good long-run inflation hedge because companies own real assets and can raise prices.\n\n**The nuance**: Not all companies can raise prices equally.\n\n**High pricing power (inflation winners):**\n- Luxury goods (Louis Vuitton, Hermes): customers accept price increases\n- Energy companies: sell a commodity whose price drives inflation\n- Healthcare, essential consumer staples: demand is inelastic\n- Tech platforms with high switching costs\n\n**Low pricing power (inflation losers):**\n- Retailers with heavy competition (Walmart can't easily raise prices)\n- Long-duration growth stocks: their far-future earnings get discounted harder as rates rise\n- Fixed-fee service businesses with locked-in contracts\n\n**The rate-hike effect on equities:**\nWhen the Fed raises rates to fight inflation, it also raises the discount rate applied to future earnings. This especially hurts high-P/E growth stocks — their valuations compress even if earnings stay intact.\n\n**2022 example**: NASDAQ fell 33% in 2022 not because earnings collapsed, but because rising rates raised the discount rate, compressing multiples on future growth.",
          highlight: ["pricing power", "discount rate", "rate hike", "P/E compression", "inelastic demand"],
        },
        {
          type: "quiz-mc",
          question:
            "What does TIPS stand for and what makes it unique as an investment?",
          options: [
            "Treasury Inflation-Protected Securities; principal adjusts with CPI, guaranteeing real return",
            "Total Interest Payment Securities; coupon payments rise when nominal rates increase",
            "Treasury Index Price Shares; traded like ETFs and benchmarked to the CPI index",
            "Tax-Indexed Preferred Securities; dividends are indexed to inflation for tax efficiency",
          ],
          correctIndex: 0,
          explanation:
            "TIPS are US Treasury bonds where the principal value adjusts upward with CPI inflation. Interest is paid on this adjusted principal, so your coupon grows as inflation rises. At maturity, you receive the greater of the original or inflation-adjusted principal. This structure guarantees that the real (inflation-adjusted) return equals the TIPS yield you locked in at purchase.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Gold reliably outperforms stocks during inflationary periods, making it the best inflation hedge for a long-term portfolio.",
          correct: false,
          explanation:
            "False. Gold's record as an inflation hedge is mixed. While it surged dramatically during the 1970s inflation, it performed poorly during the 2021–2022 inflation surge when CPI hit 9% yet gold was roughly flat to down. Over very long periods, stocks with strong pricing power have proven more reliable inflation hedges than gold. Gold is better characterized as a hedge against currency collapse or tail-risk scenarios.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor holds three assets: (1) a 10-year nominal Treasury bond yielding 3%, (2) a TIPS bond with a 1% real yield, (3) shares of a consumer staples company with consistent 5% annual price increases on its products. Inflation unexpectedly rises to 5% and stays elevated for three years.",
          question: "Which asset is likely to perform best in real terms?",
          options: [
            "The consumer staples company, as its pricing power preserves real earnings",
            "The nominal Treasury bond, since its 3% yield exceeds the 1% TIPS yield",
            "The TIPS bond alone, since it is the only instrument designed for inflation",
            "All three perform identically since inflation affects all assets equally",
          ],
          correctIndex: 0,
          explanation:
            "The nominal Treasury yields only 3% against 5% inflation — a –2% real return. TIPS at 1% real yield does protect purchasing power but provides only 1% real return. The consumer staples company can raise prices 5%+, maintaining real revenues and earnings — potentially delivering solid real equity returns. Strong pricing power is arguably the best inflation protection for long-term investors.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Supply Chain & Trade ─────────────────────────────────────────
    {
      id: "inflation-4",
      title: "🚢 Supply Chain & Trade",
      description:
        "Just-in-time vs just-in-case, reshoring, semiconductor shortages, and global chokepoints",
      icon: "Ship",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🏭 Supply Chain Basics",
          content:
            "A **supply chain** is the full network of activities required to deliver a product to the end consumer:\n\n**Raw Materials → Manufacturing → Distribution → Retail → Consumer**\n\nExample — a smartphone:\n1. **Raw materials**: Lithium (Chile/Australia), rare earths (China), copper (Peru)\n2. **Components**: Chips (TSMC in Taiwan), screens (Samsung in Korea), cameras (Sony in Japan)\n3. **Assembly**: Foxconn factories in China/India/Vietnam\n4. **Distribution**: Ocean freight → ports → regional warehouses → retail stores\n5. **Consumer**: You\n\n**Why supply chains matter for inflation:**\nAny disruption at any link raises costs and creates shortages. A bottleneck at one node (say, chip manufacturing) can halt production across dozens of downstream industries.\n\n**Globalization's promise and peril:**\nDecades of globalization created hyper-efficient but fragile supply chains. Countries and companies specialized in what they do cheapest — but created deep dependencies on single sources.",
          highlight: ["supply chain", "raw materials", "distribution", "bottleneck", "globalization"],
        },
        {
          type: "teach",
          title: "⏱️ Just-in-Time vs Just-in-Case",
          content:
            "**Just-in-Time (JIT) Manufacturing:**\nPioneered by Toyota in the 1970s, JIT means receiving inputs only as they are needed in production — minimizing inventory holding costs.\n\n**Benefits of JIT:**\n- Dramatically reduces warehouse space and inventory costs\n- Eliminates waste (unused parts, expired goods)\n- Forces suppliers to be precise and reliable\n- Frees up capital that would otherwise be tied up in inventory\n\n**COVID-19 exposed JIT's fatal flaw:**\nWhen demand surged and factories in Asia shut simultaneously, companies had zero buffer inventory. A single disruption became an immediate shortage.\n- Car manufacturers had to shut assembly lines for weeks due to chip shortages\n- Hospitals ran out of PPE within days\n- Toilet paper disappeared from shelves in days, not weeks\n\n**Just-in-Case (JIC) as the response:**\nPost-COVID, many companies shifted toward holding strategic buffer inventory ('safety stock') — accepting higher costs for resilience.\n- Apple reportedly started stockpiling critical chips 12+ months in advance\n- US Strategic Petroleum Reserve exists for exactly this reason for energy\n\n**Trade-off**: JIC increases costs by 10–30% but dramatically reduces catastrophic shortage risk.",
          highlight: ["just-in-time", "JIT", "Toyota", "just-in-case", "buffer inventory", "safety stock"],
        },
        {
          type: "teach",
          title: "🌐 Reshoring, Semiconductor Shortage & Trade Chokepoints",
          content:
            "**Reshoring and Nearshoring:**\n- **Reshoring**: Moving production back to the home country (US companies returning manufacturing from China)\n- **Nearshoring**: Moving production to nearby countries (US companies moving to Mexico or Canada)\n- **Friend-shoring**: Relocating supply chains to allied countries to reduce geopolitical risk\n\nDriven by: COVID disruptions, US-China trade tensions, rising Chinese labor costs, and the CHIPS Act ($52B in US semiconductor subsidies).\n\n**Semiconductor Shortage 2020–2023:**\nSemiconductors are the 'oil of the 21st century' — they're in every electronic device, car, appliance, and industrial system.\n- Global chip shortage began when COVID demand surged for PCs and devices while auto demand initially crashed (auto companies cancelled orders), then rebounded\n- Chip fabrication plants ('fabs') have 6-month lead times — you can't just turn production on overnight\n- TSMC controls ~90% of the most advanced chips; its concentration in Taiwan is a geopolitical flashpoint\n- Auto industry alone lost an estimated $210B in revenue in 2021 due to chip shortages\n\n**Global Trade Chokepoints:**\n| Chokepoint | % of Global Trade | Risk |\n|------------|------------------|------|\n| Suez Canal | ~12% | Blocked (Ever Given 2021); Houthi attacks 2024 |\n| Strait of Malacca | ~25% (Asia trade) | Piracy, China-Taiwan tensions |\n| Panama Canal | ~5% | Drought-driven capacity limits 2023 |\n| Strait of Hormuz | ~20% (oil) | Iran, Middle East conflicts |",
          highlight: ["reshoring", "nearshoring", "semiconductor", "TSMC", "Suez Canal", "Strait of Malacca", "chokepoints"],
        },
        {
          type: "quiz-mc",
          question:
            "What vulnerability did COVID-19 expose in just-in-time manufacturing?",
          options: [
            "Single points of failure in supply chains caused shortages when disrupted",
            "JIT manufacturing is too expensive during periods of high inflation",
            "Warehouses built for JIT systems were too large to quickly convert to other uses",
            "JIT relies on domestic suppliers, which couldn't scale up fast enough",
          ],
          correctIndex: 0,
          explanation:
            "JIT manufacturing eliminates buffer inventory to minimize costs — but this means zero tolerance for supply disruptions. When COVID shut factories and disrupted shipping simultaneously, companies had no safety stock to bridge the gap. Single points of failure (a chip factory, a shipping port, a key supplier) immediately caused downstream shortages across entire industries. The efficiency of JIT became its critical weakness.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The Suez Canal handles more than 50% of global seaborne trade, making it the single most important shipping chokepoint in the world.",
          correct: false,
          explanation:
            "False. The Suez Canal handles approximately 12% of global seaborne trade — significant, but not a majority. When the Ever Given container ship blocked the canal for six days in 2021, it disrupted about $9 billion of trade per day. The Strait of Malacca, connecting the Indian and Pacific Oceans, handles roughly 25% of Asia-bound trade. The Strait of Hormuz carries about 20% of global oil. No single chokepoint handles a majority of global trade.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A US automaker sources 80% of its microcontrollers from a single fab in Taiwan. Geopolitical tensions cause the fab to reduce shipments by 30% for three months. The automaker has only two weeks of chip inventory (JIT model). Switching to an alternative supplier would take six months.",
          question: "What best describes the strategic error and its likely consequence?",
          options: [
            "Over-reliance on a single supplier with no buffer inventory will force production halts within weeks",
            "The 30% reduction is manageable because JIT systems automatically adjust production schedules",
            "The six-month switching timeline is irrelevant because spot-market chips are always available",
            "The automaker should immediately raise vehicle prices to offset future chip costs",
          ],
          correctIndex: 0,
          explanation:
            "With only two weeks of buffer inventory and a single concentrated supplier, a 30% supply cut will exhaust buffer stock within days of supply normalization. The six-month alternative supplier lead time offers no near-term relief. The result: production lines shut down, vehicles are unfinished, and revenue collapses — exactly what happened to the global auto industry in 2021. This illustrates why supply chain concentration and lack of safety stock create existential operational risk.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Stagflation & Economic Cycles ────────────────────────────────
    {
      id: "inflation-5",
      title: "📉 Stagflation & Economic Cycles",
      description:
        "The worst of both worlds: stagflation, the Phillips Curve, and the Fed's impossible dilemma",
      icon: "AlertTriangle",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "😰 What Is Stagflation?",
          content:
            "**Stagflation** is the simultaneous combination of:\n- **High inflation** (rising prices)\n- **Stagnant economic growth** (GDP near zero or negative)\n- **High unemployment** (jobs scarce despite inflation)\n\nThis is the **worst-case scenario for policymakers** because the standard tools to fix each problem make the other worse:\n- To fight inflation → raise rates → slows economy → increases unemployment\n- To fight unemployment → cut rates → stimulates economy → worsens inflation\n\n**Why it's so unusual:**\nConventional macroeconomic theory (the Phillips Curve) said stagflation was impossible — inflation and unemployment were supposed to move in opposite directions.\n\n**Stagflation destroys two groups simultaneously:**\n- Workers: lose purchasing power from inflation AND face job insecurity from stagnation\n- Investors: bonds erode from inflation, equities drop from weak growth — nowhere to hide\n\n**The 1970s proved stagflation is possible** when supply shocks combine with bad policy — and it can last years.",
          highlight: ["stagflation", "stagnant growth", "high inflation", "unemployment", "impossible dilemma"],
        },
        {
          type: "teach",
          title: "🛢️ 1970s Stagflation: The Defining Case Study",
          content:
            "**The 1970s US stagflation** remains the most severe episode in modern US economic history.\n\n**Timeline:**\n1. **1971**: Nixon ends gold standard (Bretton Woods collapses). Dollar weakens. Inflation begins.\n2. **1973**: OPEC oil embargo — Arab nations cut oil exports to countries supporting Israel in Yom Kippur War. Oil prices quadrupled overnight from $3 to $12/barrel.\n3. **1974–1975**: US inflation hit **12%**, unemployment hit **9%**, GDP contracted → full stagflation\n4. **1979**: Iranian Revolution removes Iranian oil from world markets. Oil hits $34/barrel. Second energy shock.\n5. **Peak stagflation (1980)**: Inflation at **14.8%**, unemployment at **7.5%**, prime rate at **20%**\n\n**What ended it:**\nPaul Volcker, appointed Fed Chair in 1979, deliberately induced a severe recession by raising the fed funds rate to 20%. Called the 'Volcker Shock' — it caused unemployment to hit 10.8% but broke the back of inflation expectations.\n\n**Investment implications from the 1970s:**\n- Stocks: near-zero real returns for a decade\n- Bonds: devastated by inflation\n- Winners: oil, commodities, real estate, gold (rose 20× during the decade)",
          highlight: ["OPEC", "oil embargo", "Volcker", "Volcker Shock", "1970s", "inflation expectations"],
        },
        {
          type: "teach",
          title: "📈 Phillips Curve & 2022–2024 Rate Cycle",
          content:
            "**The Phillips Curve** was proposed by economist A.W. Phillips in 1958:\nThere is an **inverse relationship** between inflation and unemployment:\n- Low unemployment → workers have power → wages and inflation rise\n- High unemployment → workers have less power → wages and inflation fall\n\nCentral banks used this to calibrate policy: accept slightly higher unemployment to reduce inflation, or accept slightly higher inflation to boost employment.\n\n**Stagflation broke the Phillips Curve:**\nIn the 1970s, high inflation and high unemployment coexisted — contradicting the curve. The explanation: supply shocks can cause both simultaneously. The curve shifted, not just moved along it.\n\n**Modern applications:**\nThe Phillips Curve still provides rough guidance, but economists now use 'augmented' versions that include inflation expectations.\n\n**2022–2024 Fed Rate Cycle:**\nFacing 9.1% CPI in 2022, the Fed raised rates 525 basis points in 16 months — the fastest tightening cycle in 40 years.\n- Goal: cool demand and lower inflation without causing a severe recession ('soft landing')\n- Result (as of 2024): inflation fell back toward 3%, unemployment remained near 4% — a rare soft landing\n- Risk: rate hikes work with 12–18 month lags — the full impact may not yet be visible in GDP data",
          highlight: ["Phillips Curve", "soft landing", "rate cycle", "525 basis points", "tightening", "inflation expectations"],
        },
        {
          type: "quiz-mc",
          question:
            "Why is stagflation so difficult for central banks to fight?",
          options: [
            "Raising rates to fight inflation worsens unemployment; cutting rates to fight recession worsens inflation",
            "Central banks lack the legal authority to address unemployment directly",
            "Stagflation only occurs during wartime, when normal monetary policy is suspended",
            "The Phillips Curve predicts that inflation and unemployment cannot occur simultaneously",
          ],
          correctIndex: 0,
          explanation:
            "Stagflation creates a policy trap: the conventional cure for inflation is raising interest rates, which slows economic activity and raises unemployment — making the stagnation worse. The conventional cure for high unemployment (cutting rates, stimulus) risks igniting more inflation — making prices worse. Central banks are caught in a no-win dilemma, as there is no single tool that simultaneously reduces inflation AND boosts employment.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The Phillips Curve has been proven to be a universal and reliable law of macroeconomics, valid across all economic conditions including supply shocks.",
          correct: false,
          explanation:
            "False. The Phillips Curve describes a general tendency for inflation and unemployment to be inversely related, but the 1970s stagflation demonstrated it is not a universal law. Supply shocks can shift the entire curve — causing both high inflation and high unemployment simultaneously. Modern economists use 'augmented' versions that incorporate inflation expectations and supply-side factors, and treat the curve as a loose guideline rather than an iron law.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A central bank faces: CPI at 8%, GDP growth at –0.5% for two consecutive quarters (technical recession), and unemployment at 7.5%. Inflation expectations surveys show businesses expect 7% inflation next year. The supply shock causing the situation (an energy crisis) remains unresolved.",
          question: "What makes this a classic stagflation scenario and why is policy so difficult?",
          options: [
            "All three conditions — high inflation, negative growth, and high unemployment — coexist, and any policy tool that helps one worsens another",
            "The negative GDP growth means deflation is likely next, so the central bank should wait",
            "High inflation expectations mean the central bank should immediately cut rates to boost growth",
            "This is demand-pull inflation, so fiscal stimulus will resolve both unemployment and inflation",
          ],
          correctIndex: 0,
          explanation:
            "This scenario is textbook stagflation: high inflation (8% CPI), economic contraction (–0.5% GDP two quarters), and high unemployment (7.5%) all coexist. Rate hikes to fight inflation risk deepening the recession and worsening unemployment. Rate cuts to stimulate growth would worsen the already-elevated inflation expectations. The unresolved supply shock means fiscal or monetary stimulus won't fix the underlying cause. Policymakers must choose between bad and worse options — the defining feature of stagflation.",
          difficulty: 3,
        },
      ],
    },
  ],
};
