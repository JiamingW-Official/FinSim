import type { Unit } from "./types";

export const UNIT_MACRO_INVESTING: Unit = {
 id: "macro-investing",
 title: "Global Macro Investing",
 description:
 "Master economic indicators, monetary and fiscal policy, currency markets, and top-down macro strategies used by the world's elite hedge funds",
 icon: "",
 color: "#06b6d4",
 lessons: [
 // Lesson 1: Economic Indicators Deep Dive 
 {
 id: "macro-investing-1",
 title: "Economic Indicators Deep Dive",
 description:
 "Leading, lagging, and coincident indicators — the dashboard every macro investor monitors",
 icon: "BarChart2",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Leading Indicators: Seeing Around the Corner",
 content:
 "**Leading indicators** change *before* the economy changes — they predict future economic activity.\n\nKey leading indicators:\n- **Stock market**: Equity prices fall months before recessions begin as investors price in future earnings declines.\n- **PMI (Purchasing Managers' Index)**: Survey of business managers. Above 50 = expansion, below 50 = contraction. Highly predictive.\n- **Yield curve (10y–2y spread)**: When short-term rates exceed long-term rates (inverted), a recession typically follows within 12–18 months. Has predicted every US recession since 1960.\n- **Housing permits**: New building permits indicate future construction activity and consumer confidence in the economy.\n- **Consumer confidence**: Surveys (Conference Board, Michigan) measure willingness to spend. Falling confidence precedes consumer pullback.\n\n**Why they matter**: Leading indicators let investors position *before* the economy shifts, not after.",
 highlight: ["leading indicators", "PMI", "yield curve", "consumer confidence", "housing permits"],
 },
 {
 type: "teach",
 title: "Lagging & Coincident Indicators",
 content:
 "**Lagging indicators** confirm trends that have already begun. They validate what leading indicators predicted.\n\nKey lagging indicators:\n- **Unemployment rate**: Peaks after a recession ends. Companies rehire slowly and cautiously.\n- **CPI (Consumer Price Index)**: Inflation responds slowly to monetary policy — typically with a 12–18 month lag.\n- **Bank lending rates**: Prime rates adjust after the Fed moves, and lending tightens after credit conditions have already deteriorated.\n\n**Coincident indicators** move *with* the economy in real time:\n- **GDP**: The broadest measure — released quarterly with a delay.\n- **Industrial production**: Monthly output of factories, mines, and utilities.\n- **Retail sales**: Monthly consumer spending data, highly watched by markets.\n\n**Practical use**: Lagging indicators confirm a call. If PMI (leading) signals contraction AND unemployment rises (lagging), the macro picture is clear.",
 highlight: ["lagging indicators", "coincident indicators", "unemployment", "CPI", "GDP", "retail sales"],
 },
 {
 type: "teach",
 title: "GDP Components & the Business Cycle",
 content:
 "**GDP = C + I + G + (X – M)**\n\nFor the US economy:\n- **C — Consumption** (~70%): The dominant driver. Consumer spending on goods and services.\n- **I — Investment** (~18%): Business fixed investment (equipment, structures) + residential construction.\n- **G — Government spending** (~17%): Federal, state, local purchases (excludes transfer payments).\n- **(X – M) — Net exports** (~–5%): The US runs a persistent trade deficit, so this component is negative.\n\n**The Business Cycle — four phases:**\n1. **Expansion**: Output rises, unemployment falls, confidence builds.\n2. **Peak**: Economy at full capacity, inflation pressures build, Fed may tighten.\n3. **Contraction (Recession)**: GDP falls for two consecutive quarters. Layoffs rise, capex cut.\n4. **Trough Recovery**: Leading indicators turn up, credit loosens, cycle restarts.\n\nMacro investors rotate between sectors based on cycle phase: early cycle favors financials/consumer discretionary; late cycle favors energy/materials.",
 highlight: ["GDP", "business cycle", "expansion", "contraction", "recession", "trough"],
 },
 {
 type: "quiz-mc",
 question:
 "Which indicator is considered the most forward-looking for predicting economic conditions?",
 options: [
 "The yield curve (specifically the 10y–2y spread)",
 "The unemployment rate",
 "GDP growth rate",
 "The Consumer Price Index (CPI)",
 ],
 correctIndex: 0,
 explanation:
 "The yield curve — particularly the 10-year minus 2-year Treasury spread — is widely regarded as the most reliable leading indicator. An inverted yield curve has preceded every US recession since 1960, typically by 12–18 months. GDP and CPI are coincident/lagging, while unemployment is a lagging indicator.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A PMI reading of 48 indicates that the manufacturing sector is expanding.",
 correct: false,
 explanation:
 "False. A PMI reading below 50 indicates contraction — manufacturing activity is shrinking. A reading above 50 indicates expansion. The 50 level is the neutral dividing line for this diffusion index.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are a macro analyst. The yield curve just inverted (10y–2y spread turned negative), the PMI dropped from 53 to 48, and housing permits fell 15% year-over-year. However, the unemployment rate is still at a 50-year low of 3.5% and GDP growth is positive at 2.1%.",
 question: "How should you interpret this data for your economic outlook?",
 options: [
 "Cautiously bearish — leading indicators signal contraction ahead; lagging data still looks fine but will catch up",
 "Strongly bullish — low unemployment and positive GDP prove the economy is healthy",
 "Neutral — mixed signals mean no actionable macro view is possible",
 "Bearish immediately — the economy is already in recession based on PMI alone",
 ],
 correctIndex: 0,
 explanation:
 "Leading indicators (inverted yield curve, PMI below 50, falling housing permits) are signaling contraction ahead. Unemployment and GDP are lagging/coincident indicators that look backward — they will likely deteriorate over the next 6–18 months as the slowdown materializes. A skilled macro investor positions defensively now, not after the data turns.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Monetary Policy & Markets 
 {
 id: "macro-investing-2",
 title: "Monetary Policy & Markets",
 description:
 "How the Federal Reserve shapes economies and asset prices through rates, QE, and forward guidance",
 icon: "Landmark",
 xpReward: 90,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The Fed's Dual Mandate & Tools",
 content:
 "The **Federal Reserve** operates under a dual mandate from Congress:\n1. **Price stability**: Target 2% inflation (PCE deflator preferred measure)\n2. **Maximum employment**: Achieve the highest sustainable employment level\n\nWhen both goals conflict — as in 2022, when inflation hit 9% with full employment — the Fed must choose. It chose inflation control, hiking rates aggressively.\n\n**The Fed's three main tools:**\n- **Federal Funds Rate** (main tool): The interest rate banks charge each other for overnight lending. Every other rate in the economy is anchored to this.\n- **Quantitative Easing (QE) / Quantitative Tightening (QT)**: The Fed buys (QE) or sells (QT) Treasuries and MBS to expand or shrink its balance sheet, directly influencing long-term rates.\n- **Forward guidance**: Public communication about future policy path. When Powell says 'higher for longer,' markets reprice immediately — no action needed.",
 highlight: ["Federal Reserve", "dual mandate", "Federal Funds Rate", "QE", "QT", "forward guidance"],
 },
 {
 type: "teach",
 title: "Transmission Mechanism & the Taylor Rule",
 content:
 "**How monetary policy reaches the real economy** — the transmission mechanism:\n\nFed raises rates borrowing costs rise mortgage rates, auto loans, corporate debt more expensive businesses cut investment, consumers spend less demand falls inflation cools eventually unemployment may rise\n\nThis process takes **12–18 months** on average, which is why central bankers must act on forecasts, not current data.\n\n**The Taylor Rule** (John Taylor, Stanford) provides a formula for the 'correct' Fed Funds Rate:\n\n**Fed Funds Rate = 2% + 1.5 × (Inflation – 2%) + 0.5 × Output Gap**\n\nExample with inflation at 5%, output gap at +1%:\nFFR = 2% + 1.5 × (5% – 2%) + 0.5 × 1% = 2% + 4.5% + 0.5% = **7%**\n\nThis rule suggested rates were far too low in 2021 when inflation surged — a useful diagnostic even if the Fed doesn't follow it mechanically.",
 highlight: ["transmission mechanism", "Taylor Rule", "output gap", "monetary policy lag"],
 },
 {
 type: "teach",
 title: "Rate Hikes vs Rate Cuts: Market Impact",
 content:
 "**Rate hikes** (tightening):\n- **USD strengthens**: Higher US rates attract foreign capital seeking yield dollar demand rises\n- **Bonds fall**: Existing bonds lose value as new bonds offer higher yields (price and yield move inversely)\n- **P/E compression for stocks**: Higher discount rates reduce present value of future earnings. Growth stocks (long duration) hurt most.\n- **Emerging markets stressed**: Dollar-denominated debt becomes more expensive; capital flows out of EM\n\n**Rate cuts** (easing) — mirror image:\n- **USD weakens**: Lower yields make US assets less attractive relative to alternatives\n- **Bonds rally**: Existing higher-coupon bonds become more valuable\n- **P/E expansion**: Lower discount rates boost stock valuations, especially growth\n- **EM rally**: Capital flows toward higher-yielding EM assets\n\n**Practical rule**: When the Fed pivots (changes direction), it marks a major inflection point for *all* asset classes simultaneously.",
 highlight: ["rate hike", "rate cut", "P/E compression", "duration", "emerging markets", "pivot"],
 },
 {
 type: "quiz-mc",
 question:
 "When the Fed raises interest rates, what typically happens to growth stock valuations?",
 options: [
 "They fall — future cash flows are discounted at a higher rate, reducing present value",
 "They rise — higher rates signal a strong economy which boosts earnings",
 "They are unaffected — only bond prices respond to interest rate changes",
 "They rise initially then fall — a 6-month lag before impact is seen",
 ],
 correctIndex: 0,
 explanation:
 "Growth stocks are long-duration assets — most of their value comes from earnings far in the future. When the discount rate rises, those future cash flows are worth less today (present value falls). A stock with 80% of its value in years 10+ is far more sensitive to rate changes than a value stock earning steady dividends now. This is why high-multiple tech stocks fell ~70% in 2022 as rates surged.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The Federal Reserve directly sets the interest rates on 30-year mortgages and 10-year Treasury bonds.",
 correct: false,
 explanation:
 "False. The Fed directly controls only the Federal Funds Rate (overnight bank lending rate). Long-term rates like the 10-year Treasury and 30-year mortgage are set by market forces — supply, demand, and inflation expectations. The Fed can influence long-term rates indirectly through QE/QT and forward guidance, but it does not set them directly.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Inflation is running at 6%. The output gap is +2% (economy running above potential). Using the Taylor Rule: Fed Funds Rate = 2% + 1.5 × (inflation – 2%) + 0.5 × output gap.",
 question: "What does the Taylor Rule suggest the Fed Funds Rate should be?",
 options: [
 "9% — calculated as 2% + 1.5×(6%–2%) + 0.5×2%",
 "6% — equal to the current inflation rate",
 "4% — using a simplified 2% real rate plus inflation",
 "2% — the Fed's long-run neutral rate",
 ],
 correctIndex: 0,
 explanation:
 "Taylor Rule: 2% + 1.5 × (6% – 2%) + 0.5 × 2% = 2% + 6% + 1% = 9%. This illustrates how aggressively the rule prescribes tightening when inflation is high and the economy is overheating. In 2022, some economists used the Taylor Rule to argue the Fed needed to hike far more than markets expected.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Fiscal Policy & Deficits 
 {
 id: "macro-investing-3",
 title: "Fiscal Policy & Deficits",
 description:
 "Government spending, deficits, debt sustainability, bond vigilantes, and Modern Monetary Theory",
 icon: "Building",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Government Spending & the Multiplier Effect",
 content:
 "**Fiscal policy** is how governments use taxation and spending to influence the economy.\n\n**Expansionary fiscal policy** (stimulus):\n- Government increases spending or cuts taxes puts money in consumers' pockets\n- **Multiplier effect**: Each $1 of government spending generates more than $1 of GDP growth\n\nWhy? Because the initial spending becomes someone else's income, who then spends a portion, and so on.\n\n**Multiplier = 1 / (1 – MPC)**\nWhere MPC = Marginal Propensity to Consume (fraction of extra income spent)\n\nWith MPC = 0.67: Multiplier = 1 / (1 – 0.67) = **3×**\nWith MPC = 0.33: Multiplier = 1 / (1 – 0.33) = **1.5×**\n\nIn practice, multipliers range from **0.5–1.5×** due to leakages: savings, taxes, imports.\n\n**Contractionary fiscal policy**: Spending cuts or tax hikes — used to cool overheating economies or reduce deficits.",
 highlight: ["fiscal policy", "multiplier effect", "MPC", "expansionary", "contractionary"],
 },
 {
 type: "teach",
 title: "Deficits, National Debt & Sustainability",
 content:
 "**Government deficit**: Occurs when spending exceeds tax revenue in a given year.\n**National debt**: The cumulative total of all past deficits (minus surpluses).\n\n**Key sustainability metric: Debt-to-GDP ratio**\nUS: ~120% (as of 2025). Japan: ~260%. Germany: ~65%.\n\n**Why the US can sustain higher debt:**\n- The dollar is the global **reserve currency** — global demand for USD-denominated assets is structurally high\n- The US can borrow in its own currency — it cannot technically be forced to default\n- Deep, liquid Treasury market absorbs large issuance\n\n**Warning signs of unsustainable debt:**\n- Interest payments consuming a large share of government revenue (US approaching 15% in 2025)\n- Rising debt while economic growth stagnates\n- Loss of reserve currency status (hypothetical but monitored)\n\n**Deficit types:**\n- **Cyclical deficit**: Caused by recession (tax receipts fall, social spending rises automatically)\n- **Structural deficit**: Exists even at full employment — indicates fundamental spending/revenue mismatch",
 highlight: ["deficit", "national debt", "debt-to-GDP", "reserve currency", "structural deficit"],
 },
 {
 type: "teach",
 title: "Bond Vigilantes, Crowding Out & MMT",
 content:
 "**Bond vigilantes**: Investors who protest excessive government borrowing by *selling* bonds, driving yields higher. Higher yields raise government borrowing costs — a market-imposed discipline on fiscal policy.\n\nFamous example: In 1994, the bond market sold off sharply as deficits rose, forcing fiscal discipline. James Carville: 'I want to be reincarnated as the bond market — you can intimidate everybody.'\n\n**Crowding out effect**: When the government borrows heavily, it competes with private borrowers for funds. This pushes up interest rates, discouraging private investment — the government 'crowds out' private capital spending.\n\nCrowding out equation: Government borrowing Interest rates Business investment Long-run growth\n\n**Modern Monetary Theory (MMT)**: Controversial view that a government issuing its own currency can never run out of money — deficits only matter if they cause inflation. MMT advocates argue the constraint is inflation, not debt levels.\n\n**Critics of MMT**: Ignore bond market discipline, risk hyperinflation if monetization is unchecked (Argentina, Zimbabwe).",
 highlight: ["bond vigilantes", "crowding out", "Modern Monetary Theory", "MMT", "monetization"],
 },
 {
 type: "quiz-mc",
 question:
 "What is the 'crowding out' effect in fiscal policy?",
 options: [
 "Government borrowing raises interest rates, discouraging private investment",
 "Tax cuts cause consumers to crowd retail stores, boosting GDP",
 "Central bank bond purchases push private investors out of safe assets",
 "High tariffs crowd out imports, benefiting domestic producers",
 ],
 correctIndex: 0,
 explanation:
 "Crowding out occurs when increased government borrowing raises the overall demand for credit, pushing up interest rates. Higher borrowing costs then reduce private investment — businesses cancel or defer capital projects. This is a key argument for fiscal restraint: heavy government spending can partially offset itself by depressing private-sector activity.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A government running a budget deficit must immediately raise taxes or cut spending to avoid default.",
 correct: false,
 explanation:
 "False. Governments can finance deficits by issuing bonds (borrowing from markets). Sustainability depends on whether the interest rate on the debt exceeds the economic growth rate over time — if growth exceeds the interest rate, debt-to-GDP can stabilize or decline even without primary surpluses. Countries with reserve currencies have even more flexibility. Default is a political choice, not an arithmetic inevitability.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A government running a 8% of GDP deficit announces a major new infrastructure program adding another 3% of GDP in spending. Bond yields spike 150 basis points over the next month. The finance ministry is scrambling to contain the damage.",
 question: "What economic phenomenon best describes what is occurring?",
 options: [
 "Bond vigilantes imposing market discipline by selling government bonds",
 "The multiplier effect boosting economic confidence and investment",
 "Quantitative easing causing inflation expectations to rise",
 "Crowding in — private investors matching government infrastructure investment",
 ],
 correctIndex: 0,
 explanation:
 "This is a textbook bond vigilante episode. The bond market reacted to perceived fiscal irresponsibility by selling government bonds, pushing yields sharply higher. This raises the government's borrowing cost and can force fiscal retrenchment — demonstrating that market discipline can constrain fiscal policy even when a government technically has the power to borrow.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Currency Markets & Trade 
 {
 id: "macro-investing-4",
 title: "Currency Markets & Trade",
 description:
 "PPP, the Big Mac Index, current account dynamics, trade wars, and currency intervention mechanics",
 icon: "Globe",
 xpReward: 90,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Purchasing Power Parity (PPP)",
 content:
 "**Purchasing Power Parity (PPP)** is the theory that exchange rates should adjust so that identical goods cost the same in every country.\n\n**Absolute PPP**: If a basket of goods costs $100 in the US and ¥14,000 in Japan, the exchange rate should be 140 ¥/$.\n\n**Relative PPP**: Exchange rates change over time proportional to inflation differentials.\nIf US inflation = 3% and Eurozone inflation = 1%, the USD should depreciate ~2% against the EUR annually.\n\n**Big Mac Index** (The Economist): A humorous but insightful PPP measure. If a Big Mac costs $5.50 in the US and ¥700 in Japan:\nImplied rate: 700/5.50 = 127 ¥/$\nIf actual rate is 150 ¥/$, the yen is **undervalued** by ~15% on a PPP basis.\n\n**Limitations of PPP:**\n- Only works for tradable goods — ignores services, real estate, haircuts\n- Can diverge from market rates for years or decades due to capital flows, geopolitics\n- Best used as a long-run anchor, not short-term trading signal",
 highlight: ["PPP", "purchasing power parity", "Big Mac Index", "undervalued", "overvalued", "inflation differential"],
 },
 {
 type: "teach",
 title: "Current Account vs Capital Account",
 content:
 "A country's **Balance of Payments** records all economic transactions with the rest of the world.\n\n**Current Account**: Trade in goods and services + income flows + transfers\n- **Trade surplus**: Exports > Imports (e.g., Germany, China) net foreign savings upward pressure on currency\n- **Trade deficit**: Imports > Exports (e.g., US) net borrowing from abroad downward pressure on currency\n- The US runs a persistent trade deficit (~$1 trillion/year) due to high consumption and the dollar's reserve currency role\n\n**Capital Account** (Financial Account): Cross-border investment and financial flows\n- Foreign Direct Investment (FDI): building factories abroad\n- Portfolio flows: buying foreign stocks, bonds\n- A country with a current account deficit must attract offsetting capital inflows\n\n**Key identity**: Current Account + Capital Account = 0\nThis means a US trade deficit is always mirrored by foreigners investing in US assets — they take our dollars and buy Treasuries, stocks, or real estate.",
 highlight: ["current account", "capital account", "trade deficit", "trade surplus", "balance of payments"],
 },
 {
 type: "teach",
 title: "Trade Wars & Currency Intervention",
 content:
 "**Trade war mechanics:**\n- Country A imposes **tariffs** (taxes on imports) to protect domestic industries\n- Effect on importers: higher costs domestic prices rise consumers pay more\n- Effect on exporters from Country B: lose market access, may retaliate\n- Retaliation cycles can escalate into full trade wars (US–China 2018–2019)\n\n**Who really pays tariffs?**: Primarily domestic consumers and businesses that use imported inputs — not foreign producers (unless the foreign currency weakens to offset the tariff).\n\n**Currency intervention:**\n- Central banks buy or sell their own currency to manage exchange rates\n- **To weaken currency**: Sell domestic currency, buy foreign currency increases supply of domestic currency\n- **To strengthen currency**: Buy domestic currency with foreign reserves reduces supply\n\n**Example**: Japan's Ministry of Finance intervened in 2022 by buying yen when USD/JPY hit 151, temporarily pulling it back below 145. Such interventions are short-term tools — fundamental macro forces ultimately prevail.\n\n**Currency manipulation concerns**: Countries accused of deliberately weakening their currency gain export competitiveness at others' expense.",
 highlight: ["tariffs", "trade war", "currency intervention", "currency manipulation", "retaliation"],
 },
 {
 type: "quiz-mc",
 question:
 "What does it mean when a currency is said to be 'overvalued' by PPP?",
 options: [
 "It's more expensive than its equivalent purchasing power suggests it should be",
 "The central bank has been buying the currency to prop it up artificially",
 "The country's current account is in surplus, creating excess demand for the currency",
 "The currency has risen more than 20% in the past year",
 ],
 correctIndex: 0,
 explanation:
 "A currency is PPP-overvalued when it buys fewer goods than an equivalent amount of another currency, adjusted for price levels. In other words, prices in that country are high relative to the rest of the world — the currency has too much purchasing power relative to what PPP theory predicts. This typically means the currency will tend to depreciate over the long run.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "When the US imposes a 25% tariff on imported steel, the cost is primarily borne by the foreign steel producers, who must lower their prices.",
 correct: false,
 explanation:
 "False. While some cost may be borne by foreign producers depending on market conditions, tariffs are primarily paid by domestic importers — US companies buying the steel. These businesses typically pass higher costs to consumers or absorb them as margin compression. The Congressional Budget Office and most economists find that tariff costs fall disproportionately on domestic consumers and downstream industries.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "The euro/dollar exchange rate is 1.10 (1 euro buys $1.10). An economist calculates that based on a broad basket of goods, the 'fair value' PPP exchange rate should be 1.25. Eurozone inflation is running at 2.5% and US inflation at 4.0%.",
 question: "What can you conclude about the euro and what does relative PPP predict?",
 options: [
 "The euro is undervalued vs PPP; relative PPP predicts the euro should appreciate as US inflation is higher",
 "The euro is overvalued vs PPP; relative PPP predicts the euro should depreciate",
 "The euro is fairly valued; PPP and inflation data are contradictory",
 "No conclusion is possible without knowing trade flow data",
 ],
 correctIndex: 0,
 explanation:
 "At 1.10 vs fair value of 1.25, the euro buys fewer dollars than PPP suggests — it is undervalued by about 12%. Relative PPP predicts exchange rate changes based on inflation differentials: since US inflation (4%) > Eurozone inflation (2.5%), the dollar should depreciate (or equivalently, the euro should appreciate) at roughly 1.5% per year. Both signals point in the same direction — euro should strengthen over time.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Global Macro Strategies 
 {
 id: "macro-investing-5",
 title: "Global Macro Strategies",
 description:
 "Top-down investing, thematic bets, macro hedge fund legend plays, risk-on/risk-off, and regime investing",
 icon: "TrendingUp",
 xpReward: 100,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Top-Down Investing & Thematic Plays",
 content:
 "**Top-down investing** starts with the macro picture and drills down to specific securities:\n\n1. **Macro view**: Is growth accelerating or decelerating? Is inflation rising or falling?\n2. **Country/Region**: Which economies will outperform in this environment?\n3. **Sector**: Which sectors benefit from current regime (e.g., energy in high-inflation; tech in low-rate growth)?\n4. **Security**: Which specific stocks, bonds, or currencies best express the view?\n\n**Thematic investing** identifies **secular trends** — multi-year structural shifts — and builds baskets of beneficiaries:\n- **Aging populations**: Healthcare, senior care, pharma ETFs\n- **AI & automation**: Semiconductor companies, cloud providers, robotics\n- **Energy transition**: Solar, wind, battery storage, grid infrastructure\n- **Deglobalization**: Defense, domestic manufacturing, rare earth producers\n\nThematic investing requires patience — secular trends take years or decades to fully play out. Near-term macro volatility can shake out weak hands before the thesis pays off.\n\n**Key difference from bottom-up**: A top-down investor buys the *wave*, not the individual surfer.",
 highlight: ["top-down investing", "thematic investing", "secular trend", "sector rotation"],
 },
 {
 type: "teach",
 title: "Global Macro Hedge Funds: Soros & Druckenmiller",
 content:
 "**Global macro hedge funds** make large, concentrated bets on currencies, interest rates, commodities, and country indices based on macroeconomic analysis.\n\n**George Soros — Breaking the Bank of England (1992):**\nSoros identified that the British pound was overvalued and unsustainably pegged to the Deutsche Mark in the European Exchange Rate Mechanism. He built a massive short-sterling position (~$10 billion). When the UK was forced to devalue, he reportedly made **$1 billion in a single day**. The key: macro analysis + conviction to size the trade.\n\n**Stanley Druckenmiller's process:**\n- Start with the macro theme (where is global capital flowing?)\n- Find the best *instrument* to express that view (not always the obvious one)\n- 'It's not whether you're right or wrong — it's how much you make when you're right'\n- Size matters: Druckenmiller says great macro traders make big bets on high-conviction ideas\n\n**Common macro strategies:**\n- **Currency carry trade**: Borrow in low-rate currency (JPY), invest in high-rate currency (AUD/NZD) — profits from interest rate differential\n- **Bond relative value**: Long one country's bonds vs short another's based on yield spread analysis\n- **Commodity macro**: Oil, metals positions based on demand/supply cycles + dollar thesis",
 highlight: ["global macro", "Soros", "Druckenmiller", "short sterling", "carry trade", "conviction sizing"],
 },
 {
 type: "teach",
 title: "Risk-On / Risk-Off & Macro Regime Investing",
 content:
 "**Risk-on vs Risk-off** describes the dominant mood in global markets:\n\n**Risk-on**: Investors are confident — money flows toward higher-risk, higher-return assets\n- Equities rally (especially EM and small caps)\n- High-yield corporate bonds outperform\n- Commodities (copper, oil) rise\n- Currencies: AUD, NZD, EM currencies strengthen\n- USD and JPY weaken (safe haven demand falls)\n\n**Risk-off**: Fear dominates — capital retreats to safety\n- US Treasuries rally (flight to quality)\n- USD strengthens (global reserve currency)\n- Gold rises (store of value)\n- JPY strengthens (Japan is a net creditor nation; yen repatriated in stress)\n- Equities fall; EM sells off sharply\n\n**Macro regime framework** — four quadrants based on growth and inflation:\n| | High Growth | Low Growth |\n|---|---|---|\n| **High Inflation** | Commodities, Energy, TIPS | Cash, Short Duration Bonds |\n| **Low Inflation** | Equities, EM, Credit | Long Bonds, Gold, Defensives |\n\nBy identifying which regime you're in, macro investors tilt their portfolio accordingly — not trying to pick stocks but to be in the right *asset classes* at the right time.",
 highlight: ["risk-on", "risk-off", "macro regime", "flight to quality", "safe haven", "JPY", "USD", "gold"],
 },
 {
 type: "quiz-mc",
 question:
 "In a 'risk-off' environment, which assets typically benefit?",
 options: [
 "US Treasuries, USD, Gold, and Japanese Yen",
 "Emerging market equities, high-yield bonds, copper, and Australian dollar",
 "Technology stocks, Bitcoin, small-cap growth, and oil",
 "Real estate investment trusts, European equities, and commodities",
 ],
 correctIndex: 0,
 explanation:
 "In risk-off episodes, investors flee to safety. US Treasuries benefit from flight-to-quality buying, pushing prices up and yields down. The USD strengthens as global investors repatriate capital. Gold acts as a store of value during uncertainty. The JPY strengthens because Japan is a net creditor nation — Japanese investors liquidate foreign assets and repatriate yen. All other options describe risk-on assets.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A top-down macro investor would typically start their analysis by screening for individual stocks with the best earnings growth before considering the broader economic environment.",
 correct: false,
 explanation:
 "False. Top-down investing starts with the macro view (global growth, inflation, monetary policy, geopolitics) and works down to country/region, then sector, then individual securities. Starting with individual stock screens is the bottom-up approach. The key distinction is that top-down investors believe the macro environment determines which sectors and regions will outperform — picking the right wave matters more than picking the best surfer.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "It's early 2023. Inflation has peaked and is declining from 9% toward 4%. The Fed is nearing the end of its hiking cycle. GDP growth is slowing but remains positive (soft landing scenario). Leading indicators have stabilized. Which macro regime quadrant does this describe?",
 question: "What is the appropriate portfolio tilt for this macro regime?",
 options: [
 "Transitioning toward the 'low inflation, moderate growth' quadrant — favor equities, credit, and long-duration bonds",
 "Remain in the 'high inflation, high growth' quadrant — overweight commodities and energy",
 "Move to full 'risk-off' — buy only gold and cash as recession is inevitable",
 "Underweight all risk assets — MMT predicts government deficits will cause hyperinflation",
 ],
 correctIndex: 0,
 explanation:
 "Declining inflation + Fed pivot approaching + stable growth = transitioning toward the favorable 'low inflation, moderate growth' quadrant. This environment historically favors equities (P/E expansion from lower rates), investment-grade credit (spreads tighten), and longer-duration bonds (yields fall as Fed cuts). This described 2023–2024 precisely: stocks rallied strongly as inflation fell without a recession.",
 difficulty: 3,
 },
 ],
 },
 ],
};
