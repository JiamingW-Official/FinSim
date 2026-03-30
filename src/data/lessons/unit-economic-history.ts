import type { Unit } from "./types";

export const UNIT_ECONOMIC_HISTORY: Unit = {
 id: "economic-history",
 title: "Economic History & Long-Run Investing",
 description:
 "Two centuries of equity returns, great bubbles and crashes, inflation regimes, emerging market crises, and the timeless lessons investors keep learning the hard way",
 icon: "Landmark",
 color: "#7c3aed",
 lessons: [
 // Lesson 1: Market History 
 {
 id: "eh-1",
 title: "200 Years of Market History",
 description:
 "Siegel's Stocks for the Long Run data, drawdowns and recoveries, real vs nominal returns, and how US equities compare to global markets",
 icon: "TrendingUp",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Siegel's Grand Experiment",
 content:
 "In 1994, Wharton professor Jeremy Siegel published *Stocks for the Long Run*, compiling the most comprehensive long-run equity return dataset ever assembled. The results were striking.\n\n**US equity returns, 1802–2012:**\n- **Real return on stocks**: ~6.7% per year after inflation\n- **Real return on bonds**: ~3.5% per year after inflation\n- **Real return on bills**: ~2.7% per year after inflation\n- **Real return on gold**: ~0.6% per year after inflation\n\nA single dollar invested in US stocks in 1802 grew to over **$700,000 in real terms** by 2012. The same dollar in bonds grew to $1,800. In gold: just $4.50.\n\n**The power of 6.7%:**\nAt 6.7% real, a portfolio doubles in real purchasing power every ~10.7 years (Rule of 72: 72/6.7 = 10.7). Over a 40-year career, $10,000 invested becomes $130,000 in real terms — without adding a cent. This is why equities dominate long-run wealth building.\n\n**Nominal vs real:**\nNominal US equity returns (including inflation) have averaged ~9–10% since 1926. Real returns strip away inflation. The distinction matters enormously: at 3% inflation, a nominal 9% return delivers only a ~6% real gain. Always think in real terms when planning for retirement decades away.",
 highlight: [
 "Stocks for the Long Run",
 "6.7% real return",
 "$700,000 in real terms",
 "6× bonds",
 "nominal vs real",
 "Rule of 72",
 ],
 },
 {
 type: "teach",
 title: "Drawdowns, Bear Markets & Recovery Times",
 content:
 "Strong long-run returns come with frightening short-run volatility. Understanding historical drawdowns prevents panic selling at the worst moments.\n\n**Major US equity drawdowns:**\n| Event | Peak-to-Trough | Recovery Time |\n|---|---|---|\n| Great Depression (1929–32) | -89% | 25 years |\n| 1973–74 bear market | -48% | 7 years |\n| Dot-com bust (2000–02) | -49% | 7 years |\n| Global Financial Crisis (2007–09) | -57% | 5 years |\n| COVID crash (2020) | -34% | 5 months |\n\n**Key observations:**\n- **Average bear market** (20% decline): -36% loss, lasts ~9.6 months\n- **Average recovery**: 27 months from trough to new high\n- **Frequency**: Bear markets occur roughly every 3.5 years\n- Despite all of these, the long-run upward trend has never failed to resume\n\n**The cruel arithmetic of losses:**\nA 50% loss requires a 100% gain to break even. A 90% loss requires a 900% gain. This asymmetry is why preventing catastrophic losses matters — not just for the loss itself, but the opportunity cost of waiting to recover.\n\n**The survivor's insight:**\nInvestors who held through every single drawdown in the 20th century — including the Great Depression — still earned that ~6.7% real return. Those who sold at bottoms locked in permanent losses.",
 highlight: [
 "Great Depression -89%",
 "bear market",
 "-36% average",
 "27 months recovery",
 "50% loss requires 100% gain",
 "sold at bottoms",
 ],
 },
 {
 type: "teach",
 title: "International Comparisons",
 content:
 "US equity exceptionalism is real — but may not persist. Understanding global return history guards against home-country bias.\n\n**Dimson-Marsh-Staunton (DMS) global data:**\nThe Credit Suisse Global Investment Returns Yearbook compiled 123 years of returns across 35 countries. Key findings:\n- US equities: **6.4% real** (1900–2022)\n- World ex-US equities: **4.5% real**\n- UK: 5.4% real; Japan: 4.2%; Germany: 3.2%; France: 3.1%\n- Germany and Japan investors saw near-total wipeouts in the 1940s\n\n**The US exceptionalism debate:**\nThe US outperformed because of: rule of law, property rights, liquid capital markets, technological leadership, demographic tailwinds, and no wartime occupation of the homeland. Some argue US outperformance was partly **luck** — starting the 20th century war-free while Europe suffered two world wars.\n\n**Survivorship bias warning:**\nWe study the US, UK, and Japan because they survived as investable markets. The Russian, Chinese, and many European markets saw near-zero returns after communist takeovers or war. Picking survivors artificially inflates expected returns. A global investor in 1900 who spread bets would have done worse than the US-only retrospective suggests.\n\n**Practical implication:**\nGlobal diversification captures returns from multiple sources and reduces single-country catastrophe risk. Even if the US continues to lead, adding international exposure at lower valuations improves risk-adjusted returns.",
 highlight: [
 "Dimson-Marsh-Staunton",
 "6.4% real US",
 "4.5% real world ex-US",
 "survivorship bias",
 "Germany near-total wipeout",
 "global diversification",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "According to Jeremy Siegel's long-run data, what was the approximate real (inflation-adjusted) annual return of US stocks from 1802 to 2012?",
 options: [
 "~6.7% per year",
 "~3.5% per year",
 "~10% per year",
 "~1.5% per year",
 ],
 correctIndex: 0,
 explanation:
 "Siegel's landmark dataset shows US stocks returned ~6.7% per year in real terms over 210 years. Bonds returned ~3.5% real, and gold only ~0.6% real. This long-run equity premium is the empirical foundation for why equities dominate wealth-building portfolios.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "An investor who sold US stocks during every major bear market since 1900 and bought back at the bottom would have significantly outperformed a buy-and-hold investor.",
 correct: false,
 explanation:
 "Research consistently shows that market timing — selling in bear markets and buying back — is nearly impossible to execute correctly. Most investors who sell in fear miss the sharpest recovery rallies (often occurring in the first few weeks after a bottom). Studies show missing just the 10 best days in a 20-year period can cut total returns by more than 50%. Buy-and-hold has beaten most tactical approaches historically.",
 difficulty: 1,
 },
 ],
 },

 // Lesson 2: Great Bubbles 
 {
 id: "eh-2",
 title: "Anatomy of Great Bubbles",
 description:
 "Tulip mania, South Sea, 1929, dot-com, 2008 housing, crypto — common anatomy and warning signs every investor must recognize",
 icon: "AlertTriangle",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The Bubble Anatomy",
 content:
 "Every speculative bubble in history — from 17th-century tulips to 21st-century crypto — follows a remarkably similar pattern. Economist Hyman Minsky codified this as the **Minsky Cycle**, and Charles Kindleberger popularized it in *Manias, Panics, and Crashes* (1978).\n\n**The five stages:**\n1. **Displacement**: A new technology, asset, or policy creates a genuine opportunity (internet, rail, canals, easy credit)\n2. **Boom**: Prices rise, attracting more buyers. Credit expands. Early investors get rich, validating the thesis.\n3. **Euphoria**: Valuations become untethered from fundamentals. \"This time is different\" narratives dominate. Novice investors pile in. Debt levels soar.\n4. **Distress**: A triggering event (rate hike, fraud revelation, unexpected bad news) stops the price rise. Some insiders quietly sell.\n5. **Revulsion**: Panic selling. Credit contracts suddenly. Prices collapse far below fundamental value. Bankruptcies cascade.\n\n**Common warning signs:**\n- **Valuation metrics** at multi-decade extremes (P/E, price-to-sales, market cap/GDP)\n- **Narrative justification** for why traditional metrics no longer apply\n- **Easy credit** driving purchases by people who couldn't afford the asset at fair value\n- **Media saturation** — asset appears on magazine covers, dinner party conversations\n- **Leverage concentration** — margin debt, mortgage debt, or borrowed funds dominant\n- **Retail participation spike** — Robinhood sign-ups, shoeshine-boy stock tips",
 highlight: [
 "Minsky Cycle",
 "displacement",
 "euphoria",
 "this time is different",
 "media saturation",
 "leverage concentration",
 ],
 },
 {
 type: "teach",
 title: "Historic Bubbles: From Tulips to Dot-Com",
 content:
 "The historical record of bubbles is surprisingly consistent in anatomy, even across centuries.\n\n**Tulip Mania (1636–37):**\nDutch tulip bulb prices rose 20× in one month during winter 1636–37, then collapsed 99% in weeks. Rare 'broken' tulips (caused by a mosaic virus creating color streaks) traded for 10 years' wages. The collapse ruined many middle-class Dutch families.\n\n**South Sea Bubble (1720):**\nThe South Sea Company received a monopoly on British trade with South America in exchange for assuming government debt. Share prices rose 10× in months. Parliament members, Newton, and the king himself invested. Newton famously said he could *\"calculate the motions of the heavenly bodies, but not the madness of people.\"* He lost £20,000 (millions in today's terms) re-entering near the top.\n\n**Railroad Mania (1840s):**\nBritain's first great infrastructure bubble. Parliament approved 272 Railway Acts in 1846 alone. Many routes were never built. Capital destruction was enormous, though railways that survived transformed the economy.\n\n**1929 Stock Market Bubble:**\n- US stocks rose 5× from 1924–1929 on buying by margin (borrowed) investors\n- Margin buying required only 10% down — 90% borrowed\n- P/E ratios reached ~30× (vs ~15× historical average)\n- September 1929 peak; Black Thursday (Oct 24) and Black Tuesday (Oct 29) crash\n- Dow fell **89%** peak-to-trough over 3 years\n\n**Dot-com Bubble (1995–2000):**\n- NASDAQ rose 400% from 1995 to March 2000 peak\n- Companies with no revenue and losses valued at billions\n- Pets.com spent $11.8M on Super Bowl ads; went bankrupt 9 months after IPO\n- NASDAQ fell **78%** from peak; many stocks went to zero",
 highlight: [
 "tulip mania 99% collapse",
 "South Sea Bubble",
 "Newton lost £20,000",
 "margin 10% down",
 "Dow fell 89%",
 "NASDAQ fell 78%",
 "Pets.com",
 ],
 },
 {
 type: "teach",
 title: "2008 Housing & Crypto Bubbles",
 content:
 "Modern bubbles benefit from more sophisticated financial engineering — but not from superior human psychology.\n\n**2008 US Housing Bubble:**\n- US home prices rose ~80% from 2000–2006, fueled by low rates and easy mortgage lending\n- **NINJA loans**: No Income, No Job, No Assets — lenders approved mortgages with no verification\n- Mortgage-backed securities (MBS) and CDOs distributed and disguised risk globally\n- Rating agencies gave AAA to securities backed by subprime loans\n- When prices fell just 10%, the entire leveraged system collapsed\n- US home prices fell ~30% nationally; some markets (Las Vegas, Miami) fell 60%+\n- $8 trillion in US household wealth destroyed\n\n**Crypto Bubbles (2017 & 2021):**\n- Bitcoin rose from ~$1,000 to ~$20,000 in 2017, fell back to ~$3,200 by end of 2018 (-84%)\n- 2021 cycle: Bitcoin peaked at ~$69,000; Ethereum at ~$4,800\n- NFT market hit $25B in sales; many NFTs now worth near zero\n- Terra/Luna algorithmic stablecoin: ~$40B market cap near zero in 72 hours (May 2022)\n- FTX fraud: $32B exchange collapsed, billions in customer funds missing\n\n**Consistent lessons:**\n1. Leverage turns corrections into crises\n2. \"New paradigm\" narratives always appear near peaks\n3. Fraud concentrates during bubbles (easier to hide losses in rising markets)\n4. Bubbles don't pop because of valuation alone — they need a catalyst to reverse sentiment\n5. Post-bubble assets often overshoot to the downside — staying cheap for years",
 highlight: [
 "NINJA loans",
 "AAA to subprime",
 "$8 trillion destroyed",
 "Bitcoin -84%",
 "Terra/Luna near zero",
 "FTX fraud",
 "leverage turns corrections into crises",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "According to the Minsky Cycle model, what characterizes the 'euphoria' phase of a speculative bubble?",
 options: [
 "Valuations become untethered from fundamentals, 'this time is different' narratives dominate, and novice investors pile in with borrowed money",
 "A new technology or policy creates a genuine profit opportunity, attracting early smart money investors",
 "An unexpected negative event triggers price declines and insider selling begins",
 "Panic selling causes prices to collapse well below fundamental value as credit contracts",
 ],
 correctIndex: 0,
 explanation:
 "The euphoria phase is the most dangerous period of a bubble — it feels like permanent prosperity but valuations are detached from reality. 'This time is different' thinking (railways changed geography forever, internet changed all business, crypto replaces money) provides intellectual cover. Easy credit enables unsophisticated buyers to participate. The euphoria phase is when risk is highest even though it feels safest.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "It's 1999. You work in tech and notice that internet companies are being valued at hundreds of times revenue (or with no revenue at all). Your colleagues are getting rich, IPOs are oversubscribed within hours, and financial media says the old valuation rules don't apply in the 'New Economy.'",
 question: "What does history suggest is the most likely outcome?",
 options: [
 "A bubble is forming. History shows when valuations become untethered from fundamentals and 'new paradigm' narratives dominate, a painful correction follows — even if timing is impossible to predict precisely",
 "The market is correctly pricing future earnings. Technology genuinely changes everything, and traditional valuation metrics are obsolete",
 "Because it involves real technology with real uses, this bubble will resolve through a 'soft landing' with gradual P/E normalization rather than a crash",
 "Since central banks can now prevent recessions with monetary policy, the bubble can be sustained indefinitely through rate cuts if needed",
 ],
 correctIndex: 0,
 explanation:
 "This describes the dot-com bubble perfectly. The NASDAQ fell 78% from its March 2000 peak. 'The internet changes everything' was true — but that didn't mean any particular valuation was justified. History shows the underlying technology can be real and transformative while simultaneously supporting an unsustainable price bubble. Timing the top is impossible, but recognizing bubble conditions (extreme valuations + narrative justification + retail frenzy + leverage) is the first step to protecting capital.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Great Depressions & Recoveries 
 {
 id: "eh-3",
 title: "Depressions, Crises & Recoveries",
 description:
 "The 1929 Great Depression, Japan's lost decades, and the 2008 GFC response — causes, policy mistakes, and what worked",
 icon: "BarChart2",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The Great Depression: Causes & Policy Failures",
 content:
 "The 1929–1933 Great Depression remains the most studied economic catastrophe in history — largely because policy mistakes turned a bad recession into a decade-long depression.\n\n**Background — the roaring twenties:**\n- 1920s US saw rising productivity, electrification, the automobile revolution, and speculative excess\n- Stocks rose 5× from 1924–1929, largely on margin buying\n- Federal Reserve kept rates too low too long, fueling speculation\n\n**The crash:**\n- Dow Jones peaked September 1929; Black Thursday (Oct 24) and Black Tuesday (Oct 29) saw -12% single-day drops\n- Initial crash: -47% by November 1929\n- The crash by itself would not have caused a Great Depression — the policy response did\n\n**The policy mistakes:**\n1. **Fed tightened money supply** as banks failed — allowed 1/3 of US banks to collapse (9,000 banks failed 1930–33), wiping out savings\n2. **Smoot-Hawley Tariff (1930)**: Congress raised tariffs to 45–50% average. Global trade collapsed 66%. Retaliatory tariffs destroyed US exports.\n3. **Balanced budget obsession**: Hoover administration raised taxes in 1932 during the depression, contractionary fiscal policy\n4. **Gold standard strait-jacket**: Countries on gold couldn't expand money supply. Countries that left gold first (UK 1931, US 1933) recovered first\n\n**Economic devastation:**\n- US GDP fell 30% in 3 years\n- Unemployment hit 25% (from 3.2% in 1929)\n- Prices fell 25% (deflation) — making debt burdens unbearable\n- Global trade fell 66%\n\n**Roosevelt's New Deal (1933+):**\nFDR abandoned gold (1933), created FDIC bank deposit insurance, launched massive public works, and provided emergency relief. Recovery was fitful — a 1937 premature austerity push caused a second recession.",
 highlight: [
 "9,000 banks failed",
 "Smoot-Hawley Tariff",
 "trade collapsed 66%",
 "gold standard strait-jacket",
 "GDP fell 30%",
 "unemployment 25%",
 "FDIC",
 ],
 },
 {
 type: "teach",
 title: "Japan's Lost Decades",
 content:
 "Japan's post-bubble experience (1990–2020) is the most important modern case study in economic stagnation — and a cautionary tale for any debt-laden economy.\n\n**The bubble (1986–1989):**\n- Plaza Accord (1985) appreciated the yen sharply — Bank of Japan cut rates to cushion the blow\n- Low rates fueled massive land and stock speculation\n- By 1989, Tokyo's Imperial Palace grounds were theoretically worth more than all of California\n- Nikkei 225 peaked at **38,957** on December 29, 1989\n\n**The collapse:**\n- Bank of Japan hiked rates sharply in 1989–1990 to cool speculation\n- Nikkei fell **80%** over 13 years (trough: 7,607 in 2003)\n- As of 2024, the Nikkei only recently surpassed its 1989 peak — **35 years later**\n- Property prices fell 70%+ in major cities\n\n**Why Japan stagnated:**\n1. **Zombie banks**: Banks refused to write off bad loans, keeping insolvent companies on life support\n2. **Zombie companies**: Companies kept alive by bank forbearance, consuming capital but not growing\n3. **Deflation trap**: Consumers delayed purchases expecting lower prices — reducing demand further\n4. **Demographics**: Japan's working-age population peaked in the mid-1990s; declining demographics suppressed growth\n5. **Delayed policy response**: Bank of Japan was slow to cut rates; fiscal stimulus was applied and withdrawn erratically\n\n**Lesson for investors:**\nEquity indices can remain below their peaks for decades. Buying Japanese stocks in 1989 at reasonable-seeming valuations led to a generational loss. Valuation discipline and diversification matter enormously.",
 highlight: [
 "Plaza Accord",
 "Nikkei peaked 38,957",
 "Nikkei fell 80%",
 "35 years to recover",
 "zombie banks",
 "deflation trap",
 "demographics",
 ],
 },
 {
 type: "teach",
 title: "The 2008 GFC: Crisis & Response",
 content:
 "The 2008 Global Financial Crisis was the most severe since the Great Depression — but policymakers had studied 1929 and applied different lessons.\n\n**Cause — housing and leverage:**\n- US home prices fell ~20% from 2006–2008 — seemingly modest by historical standards\n- But trillions of dollars of mortgage-backed securities and derivatives were **leveraged 30–40×**\n- When underlying collateral fell 5–10%, leveraged positions faced margin calls, forcing fire-sales\n- Lehman Brothers ($600B in assets, 30× leverage) failed September 15, 2008 — triggering global panic\n\n**The response:**\n- **Fed**: Dropped rates to 0%, deployed unprecedented emergency lending facilities (TALF, CPFF, MMIFF)\n- **TARP** ($700B): Treasury purchased toxic assets and recapitalized banks\n- **FDIC**: Guaranteed bank debt, preventing bank runs\n- **Fiscal stimulus**: $787B American Recovery and Reinvestment Act (2009)\n- **Fed QE1**: Purchased $1.25T of mortgage-backed securities — first quantitative easing in US history\n\n**How 2008 differed from 1929:**\n| Factor | 1929–33 | 2008–09 |\n|---|---|---|\n| Bank failures | 9,000 | ~500 (FDIC-managed) |\n| Money supply | -33% | +10% (QE) |\n| Trade policy | +45% tariffs | Maintained open trade |\n| GDP decline | -30% | -4% |\n| Unemployment peak | 25% | 10% |\n\n**Lesson:** Aggressive fiscal + monetary policy prevented Great Depression 2.0. The Bernanke Fed's academic work on the Depression directly informed the response.",
 highlight: [
 "leveraged 30-40x",
 "Lehman Brothers failed",
 "TARP $700B",
 "QE1",
 "GDP -4% vs -30%",
 "unemployment 10% vs 25%",
 "Bernanke",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Which of the following was NOT a major policy mistake that deepened the Great Depression?",
 options: [
 "The Federal Reserve cutting interest rates aggressively to prevent bank failures",
 "Passing the Smoot-Hawley Tariff in 1930, which triggered retaliatory tariffs and collapsed global trade",
 "Allowing 9,000 banks to fail between 1930 and 1933, wiping out deposits",
 "Raising taxes in 1932 under President Hoover while the economy was already contracting",
 ],
 correctIndex: 0,
 explanation:
 "The Federal Reserve actually TIGHTENED monetary policy during the Depression, allowing the money supply to collapse by one-third as banks failed. This was the opposite of what was needed. Ben Bernanke, who became Fed Chair in 2006, wrote his academic career on this error — and directly applied the lesson by aggressively expanding the money supply in 2008-09. The other three options were real, devastating policy mistakes.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "An investor who purchased Japanese stocks at the 1989 Nikkei peak at a P/E ratio of roughly 60× would have recovered their investment within 10 years.",
 correct: false,
 explanation:
 "The Nikkei peaked at 38,957 in December 1989 and did not return to that level until 2024 — 35 years later. This is the strongest real-world evidence that buying at extreme valuations (P/E ~60× at the 1989 Nikkei peak) can result in generational losses. It also demonstrates that entire national equity markets can underperform for decades, which is why international diversification and valuation discipline are critical.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Inflation Regimes 
 {
 id: "eh-4",
 title: "Inflation Regimes Through History",
 description:
 "Weimar hyperinflation, 1970s stagflation, the Volcker shock, and 2021–23 inflation — portfolio lessons from each episode",
 icon: "DollarSign",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Hyperinflation: Weimar Germany",
 content:
 "Hyperinflation — defined as price increases exceeding 50% per month — has occurred dozens of times in history. The Weimar Germany episode of 1921–23 is the archetype.\n\n**Background:**\nGermany lost WWI and was saddled with enormous reparations under the Treaty of Versailles (132 billion gold marks). Germany had also financed the war by printing money, emerging from the conflict with significant inflation already.\n\n**The spiral:**\n- 1921: Germany began printing money to pay reparations — inflation began\n- January 1923: French and Belgian troops occupied the Ruhr (Germany's industrial heartland) to enforce reparations. Germany declared 'passive resistance' — paying workers to do nothing — and printed money to fund it\n- **Peak inflation rate**: ~29,500% per month (November 1923)\n- By October 1923, the exchange rate was **4.2 trillion marks per US dollar**\n- Workers were paid twice daily and would sprint to shops before prices rose again\n- A loaf of bread cost 200 billion marks\n\n**Asset performance during hyperinflation:**\n- Cash/bonds: Destroyed (real value zero)\n- **Real assets (land, buildings)**: Largely preserved\n- **Equities**: Mixed — shares in real businesses retained some value, but gains were often less than inflation\n- **Gold**: Preserved purchasing power\n- **Foreign currency**: Held its value perfectly — those with access to dollars, pounds, or gold were insulated\n\n**Resolution:** The Rentenmark (November 1923) replaced 1 trillion old marks — ending hyperinflation almost instantly through credible monetary reform and a new central bank.",
 highlight: [
 "50% per month",
 "Weimar Germany",
 "29,500% per month",
 "4.2 trillion marks per dollar",
 "cash and bonds destroyed",
 "real assets preserved",
 "Rentenmark",
 ],
 },
 {
 type: "teach",
 title: "1970s Stagflation & the Volcker Shock",
 content:
 "The 1970s US inflation episode is the most policy-relevant for modern investors — combining supply shocks, policy errors, and eventual painful correction.\n\n**Causes of 1970s inflation:**\n1. **Oil price shocks**: OPEC's 1973 embargo quadrupled oil prices; 1979 Iranian Revolution doubled them again\n2. **Wage-price spiral**: Strong unions negotiated cost-of-living adjustments, embedding inflation in wages\n3. **Nixon's abandonment of gold (1971)**: Removed the anchor on dollar creation\n4. **Fed 'go-stop' policy**: Fed kept rates too low trying to minimize unemployment\n5. **Vietnam/Great Society fiscal spending**: Guns-and-butter spending created demand-pull inflation\n\n**The 1970s in numbers:**\n- US CPI peaked at **13.5% in 1979** (year-over-year)\n- Real returns on bonds: **Negative** throughout the decade (bonds were called 'certificates of confiscation')\n- Real returns on stocks: Nearly zero from 1968–1982 despite nominal gains\n- Gold: Rose from $35/oz (1971) to **$850/oz (1980)** — a 24× gain\n- Real estate and commodities significantly outperformed financial assets\n\n**The Volcker Shock (1979–1982):**\nFed Chair Paul Volcker was appointed by Carter in 1979 with one mandate: kill inflation. His approach:\n- Fed funds rate hiked to **20%** (peak June 1981)\n- Deliberately induced the 1981–82 recession: unemployment hit 10.8%, worst since Great Depression\n- Resulted in two recessions in three years\n- **Result**: Inflation fell from 13.5% to 3% by 1983\n- Bond bull market of 1982–2020 began — 40 years of falling rates and rising bond prices",
 highlight: [
 "OPEC embargo",
 "wage-price spiral",
 "CPI peaked 13.5%",
 "bonds: certificates of confiscation",
 "gold 24× gain",
 "Volcker",
 "20% interest rates",
 "40-year bond bull market",
 ],
 },
 {
 type: "teach",
 title: "2021–2023 Inflation: Return of an Old Threat",
 content:
 "After nearly four decades of low inflation, the 2021–23 episode reminded a generation of investors that inflation risk is real — and taught new portfolio lessons.\n\n**Causes:**\n1. **COVID fiscal stimulus**: US government sent $5T+ in pandemic relief; M2 money supply grew 27% in 2020 alone\n2. **Supply chain disruptions**: Lockdowns, semiconductor shortages, shipping bottlenecks created supply shortfalls\n3. **Commodity shock**: Russia's invasion of Ukraine (Feb 2022) sent natural gas, wheat, and oil prices surging\n4. **Housing shortage**: Rental costs rose sharply as construction lagged demand\n5. **Fed's slow response**: Fed characterized 2021 inflation as 'transitory' and delayed rate hikes\n\n**The episode in numbers:**\n- US CPI peaked at **9.1% (June 2022)**, highest since 1981\n- Euro area CPI peaked at **10.6%** (October 2022)\n- Fed hiked from 0% to **5.25–5.5%** (fastest hiking cycle in 40 years, 2022–2023)\n- US 60/40 portfolio returned approximately **-16% in 2022** — stocks and bonds fell together\n- TIPS (inflation-linked bonds) outperformed nominal bonds\n- Commodities index +30% in 2022 while stocks fell -18%\n\n**Portfolio lessons from inflation history:**\n| Asset | Moderate Inflation | High Inflation | Hyperinflation |\n|---|---|---|---|\n| Equities | Mixed | Poor short-run | Mixed |\n| Nominal bonds | Very poor | Terrible | Zero |\n| TIPS | Good | Good | Moderate |\n| Real estate | Good | Good | Good |\n| Gold | Good | Good | Good |\n| Commodities | Excellent | Excellent | Moderate |\n\n**Key takeaway**: Nominal bonds are the worst inflation hedge. Diversifying into real assets, commodities, TIPS, and international stocks (non-dollar) provides inflation protection.",
 highlight: [
 "M2 grew 27%",
 "transitory",
 "CPI peaked 9.1%",
 "5.25-5.5%",
 "60/40 returned -16%",
 "commodities +30%",
 "TIPS",
 "nominal bonds worst hedge",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Which asset class historically performs WORST during high-inflation periods?",
 options: [
 "Long-duration nominal government bonds",
 "Gold and precious metals",
 "Real estate investment trusts (REITs)",
 "Commodity futures",
 ],
 correctIndex: 0,
 explanation:
 "Long-duration nominal bonds are the worst performers in high inflation. When inflation rises, bond prices fall (yields rise), and the fixed coupon payments are eroded in real terms. 1970s investors called bonds 'certificates of confiscation.' The 2022 experience was a vivid reminder — when CPI reached 9.1%, the Bloomberg US Aggregate Bond Index fell ~13%. Gold, commodities, and real assets have historically provided inflation protection.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "The Volcker disinflation of 1979–1983 was achieved with minimal economic pain — a short, shallow recession allowed inflation to fall quickly.",
 correct: false,
 explanation:
 "The Volcker disinflation required enormous economic pain. The Fed funds rate was raised to 20%, deliberately inducing two recessions in three years (1980 and 1981–82). Unemployment reached 10.8%, the highest since the Great Depression. Construction and auto industries were devastated. Farmers protested outside the Fed with tractors. However, the willingness to accept short-run pain to restore price stability was vindicated — inflation fell from 13.5% to 3%, launching the 1982–2020 bull market in bonds.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 5: Emerging Market Crises 
 {
 id: "eh-5",
 title: "Emerging Market Crises",
 description:
 "Mexico 1994, Asia 1997, Russia/LTCM 1998, Argentina 2001 — contagion mechanisms, the IMF role, and what EM investors must know",
 icon: "Globe",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "The 1994 Tequila Crisis & Asian Contagion",
 content:
 "Emerging market crises follow a recognizable template: currency peg + external debt + capital outflows = sudden stop.\n\n**Mexico 1994 — The Tequila Crisis:**\nMexico pegged the peso to the dollar and issued large quantities of dollar-indexed short-term government bonds (Tesobonos). Political instability (Chiapas uprising, presidential assassination) spooked investors.\n- Capital outflows drained foreign reserves rapidly\n- December 20, 1994: Mexico devalued the peso — but only 15%, perceived as inadequate\n- Panic selling: peso fell **50%** within weeks; stock market collapsed\n- $50 billion US-led bailout (Clinton's use of the Exchange Stabilization Fund, bypassing Congress)\n- Contagion spread to Argentina, Brazil, and other Latin American markets\n\n**The 1997 Asian Financial Crisis:**\nThailand, South Korea, Indonesia, Malaysia, Philippines all experienced the same pattern:\n- Currencies **pegged** to the dollar, encouraging dollar-denominated borrowing\n- Current account deficits financed by short-term foreign capital\n- Real estate and stock market bubbles fueled by cheap credit\n- When the dollar strengthened in 1996–97, export competitiveness fell\n- July 2, 1997: Thailand floated the baht (devalued 37%); contagion spread across Asia\n\n**The devastation:**\n| Country | Currency Fall | GDP Change |\n|---|---|---|\n| Thailand | -54% | -10.8% |\n| Indonesia | -80% | -13.1% |\n| South Korea | -46% | -5.8% |\n| Malaysia | -40% | -7.4% |\n\n**Key mechanisms:**\n- **Balance sheet effects**: Dollar debts became unpayable as local currency collapsed\n- **Current account reversal**: $100B capital inflow $120B outflow in one year\n- **Bank runs and credit crunch**: Domestic lending collapsed, amplifying recession",
 highlight: [
 "Tequila Crisis",
 "peso fell 50%",
 "Tesobonos",
 "Thailand floated baht",
 "Indonesia -80% currency",
 "balance sheet effects",
 "sudden stop",
 ],
 },
 {
 type: "teach",
 title: "Russia 1998, LTCM & Argentina 2001",
 content:
 "The 1998 Russian crisis demonstrated how EM shocks transmit to developed markets — almost taking down the global financial system.\n\n**Russia 1998:**\n- Russia was running large fiscal deficits, pegging the ruble, and issuing short-term government bonds (GKOs) at increasingly high yields\n- Asian crisis reduced commodity prices — Russia (oil/gas dependent) saw revenues collapse\n- August 17, 1998: Russia **defaulted on GKOs** and devalued the ruble (-75% in weeks)\n- First sovereign default by a nuclear power in modern history\n\n**LTCM — A Hedge Fund Nearly Destroys the System:**\nLong-Term Capital Management was a $125B hedge fund (with Nobel laureates Merton and Scholes as partners), leveraged **25:1**.\n- Their models assumed crisis correlations were temporary, mean-reverting divergences\n- Russia's default caused correlations to spike — divergences widened instead of narrowing\n- LTCM lost 44% in August 1998 alone; facing collapse with ~$1.25T in derivatives exposure\n- Fed organized a $3.6B private bailout by 14 banks to prevent a disorderly unwinding\n\n**Lesson from LTCM:** Risk models based on historical correlations fail precisely when you need them most. Leverage amplifies tail events catastrophically.\n\n**Argentina 2001:**\n- Argentina had pegged the peso to the dollar at 1:1 since 1991 (the 'Convertibility Plan')\n- By 2001: recession, rising debt-to-GDP, political instability\n- December 2001: Bank runs, IMF suspended bailout; Argentina defaulted on **$93B** (largest sovereign default in history at the time)\n- Government froze bank accounts ('corralito') to prevent capital flight\n- Peso devalued ~75%; middle class savings wiped out\n- Economy contracted 10.9% in 2002; unemployment hit 21.5%",
 highlight: [
 "Russia defaulted on GKOs",
 "ruble -75%",
 "LTCM 25:1 leverage",
 "Nobel laureates",
 "correlations spike in crisis",
 "Argentina $93B default",
 "corralito",
 ],
 },
 {
 type: "teach",
 title: "Contagion Mechanics & IMF Role",
 content:
 "Understanding why crises spread and the IMF's role helps investors assess EM risk in their portfolios.\n\n**Contagion transmission channels:**\n1. **Trade linkages**: If Thailand's economy collapses, its trading partners see reduced export demand\n2. **Financial linkages**: Banks and funds with cross-border exposure sell other EM assets to raise cash\n3. **Investor psychology**: 'Hot money' — short-term speculative capital — flees the entire EM asset class regardless of individual country fundamentals\n4. **Competitive devaluation**: When one country devalues, neighbors must consider doing so to maintain export competitiveness\n5. **Commodity prices**: EM crises often reduce commodity demand, hurting commodity-exporting EMs\n\n**The IMF's role:**\nThe International Monetary Fund provides emergency loans to countries facing balance-of-payments crises — but with conditions ('conditionality'):\n- **Typical conditions**: Fiscal austerity, higher interest rates to defend currency, privatization, capital account liberalization\n- **Criticism**: Austerian conditions often deepened recessions during the acute crisis phase\n- **Asian crisis IMF response** was widely criticized for requiring contractionary policies when economies already collapsing\n- **Argentina**: IMF supported the peg far too long, then withdrew support, worsening the crash\n- **Post-2008 reform**: IMF began lending with fewer conditions, more flexible approaches\n\n**For investors:**\n- **Country-specific risk factors**: Debt/GDP, current account deficit, FX reserves coverage (months of imports), dollar-denominated debt share, political stability\n- **Warning signs**: Rapidly falling reserves, rising domestic rates despite currency weakness, widening sovereign spreads\n- **IMF program = distress signal**: IMF involvement confirms crisis but also provides floor",
 highlight: [
 "hot money",
 "competitive devaluation",
 "IMF conditionality",
 "austerity deepened recessions",
 "FX reserves coverage",
 "sovereign spreads",
 "IMF program = floor",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "What was the critical structural vulnerability that made Thailand, Indonesia, and South Korea susceptible to the 1997 Asian Financial Crisis?",
 options: [
 "They had pegged currencies to the dollar while running current account deficits financed by short-term foreign capital, creating a mismatch vulnerable to sudden capital outflows",
 "They had large government budget deficits that required constant money printing, leading to inflation that undermined their currencies",
 "Their stock markets were overvalued at P/E ratios exceeding 40×, and when these corrected it triggered currency crises through wealth effects",
 "US interest rate hikes by the Federal Reserve directly caused their currencies to be targeted by speculators like George Soros",
 ],
 correctIndex: 0,
 explanation:
 "The Asian crisis countries shared a common vulnerability: dollar-pegged currencies combined with current account deficits funded by short-term foreign capital. This created a maturity and currency mismatch — they borrowed short-term in dollars and lent long-term in local currency. When capital flows reversed, they faced a classic 'sudden stop': reserves depleted, forced devaluation, and balance sheet destruction as local-currency revenues became insufficient to service dollar debts.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "LTCM's sophisticated risk models and the involvement of Nobel Prize-winning economists protected it from the 1998 Russian crisis losses.",
 correct: false,
 explanation:
 "LTCM is the definitive case study in model risk. Despite having two Nobel laureates (Merton and Scholes) as partners and some of the most sophisticated risk models ever built, LTCM lost 44% in a single month (August 1998). Their models were based on historical correlations — but crises cause correlations to move to 1 (everything falls together). The model assumed mean reversion; reality delivered divergence. Their 25:1 leverage turned model errors into near-catastrophic losses that required a Fed-organized private-sector bailout.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 6: Long-Run Lessons 
 {
 id: "eh-6",
 title: "Long-Run Investing Lessons",
 description:
 "What 200 years of data teach us — stocks beat bonds, mean reversion of valuations, never sell bottoms, and global diversification",
 icon: "Target",
 xpReward: 90,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Stocks Beat Bonds — The Data",
 content:
 "The equity risk premium — the extra return stocks earn over safe bonds — is the most robustly documented fact in financial economics.\n\n**The numbers:**\n- US equity real return (1926–2023): ~7.0% per year\n- US 10-year Treasury real return: ~2.0% per year\n- **Equity risk premium (ERP)**: ~5% per year\n\n**Compounding the difference:**\n$10,000 invested for 40 years at:\n- 7% (stocks): $149,745\n- 2% (bonds): $22,080\n\nThe 5% annual difference compounds into a **6.8× difference** in terminal wealth.\n\n**Why the premium persists:**\n1. **Equity holders bear more risk** — they get paid after creditors in bankruptcy, face dividend cuts in recessions\n2. **Investors demand compensation** for volatility risk (drawdowns up to 89%)\n3. **Long time horizons**: The premium is highly reliable over 20+ year periods but unreliable in any single year\n4. **Behavioral factors**: Investors chronically overvalue safety, undervalue long-run equity compounding\n\n**When does the premium fail?**\n- Short horizons: Stocks underperform bonds ~40% of rolling 1-year periods\n- After extreme valuations: US stocks bought at CAPE > 30 have historically underperformed bonds over the next 10 years\n- Single-country concentration: Japan 1989 buyers saw negative real stock returns for 30 years\n\n**The practical rule:**\nFor money you need in 0–5 years, bonds are safer. For money with a 15+ year horizon, equity exposure is supported by 200 years of global data.",
 highlight: [
 "7% real stocks vs 2% real bonds",
 "equity risk premium 5%",
 "6.8× terminal wealth difference",
 "unreliable short-term",
 "CAPE > 30",
 "15+ year horizon",
 ],
 },
 {
 type: "teach",
 title: "Mean Reversion of Valuations",
 content:
 "Valuations are powerful long-run return predictors — and markets have always eventually reverted toward fair value.\n\n**The CAPE ratio (Shiller P/E):**\nRobert Shiller's Cyclically Adjusted P/E ratio divides current price by average 10-year inflation-adjusted earnings. This smooths out business cycle distortions.\n\n**CAPE and 10-year forward returns:**\n| CAPE Range | Avg 10-yr Annual Return |\n|---|---|\n| Below 10 | +15% to +20% |\n| 10–15 | +12% to +15% |\n| 15–20 | +8% to +12% |\n| 20–25 | +5% to +8% |\n| 25+ | +0% to +5% |\n| 30+ | Often negative |\n\n- Buying when CAPE was below 10 (1920s, 1940s, 1982, 2009) delivered the highest returns\n- Buying when CAPE exceeded 30 (1929, 1999, 2021) historically delivered poor returns over the following decade\n\n**Mean reversion mechanisms:**\n1. **Earnings growth catches up**: If prices run ahead of earnings, earnings eventually grow into the valuation\n2. **Price correction**: Alternatively, prices fall to bring valuations back to mean\n3. **Combination**: Both happen — partial price drop plus earnings recovery\n\n**What mean reversion doesn't tell you:**\n- **Timing**: CAPE can remain elevated for 5–10 years before mean reversion. Shiller himself noted CAPE reached expensive levels in 1996 — the market doubled before crashing in 2000.\n- **Direction**: Mean reversion can come from either side\n\n**Practical use:**\nUse CAPE for strategic asset allocation (reduce equity allocation when very expensive, increase when cheap) — not for market timing.",
 highlight: [
 "CAPE ratio",
 "Shiller P/E",
 "CAPE < 10: +15-20% returns",
 "CAPE 30+: often negative",
 "mean reversion",
 "strategic asset allocation",
 ],
 },
 {
 type: "teach",
 title: "Never Sell at Bottoms — And Global Diversification",
 content:
 "The two most actionable lessons from 200 years of market history: behavioral discipline at bottoms, and geographical diversification.\n\n**The cost of selling at bottoms:**\nFidelity studied the returns of investors in their 401(k) accounts during the 2008–09 crisis:\n- Investors who **stayed fully invested**: recovered by 2013, went on to 5× their peak 2007 values by 2023\n- Investors who **sold at the 2009 trough** (S&P 500 at 676): Often bought back much later — missing the 400%+ recovery\n- J.P. Morgan study: Missing the best 10 days in a 20-year period cuts returns from 9.5% to 5.3%\n- Missing the best 20 days: Returns fall to 2.1%\n- The best days cluster immediately after the worst — those who panic-sell miss them\n\n**Why investors sell at bottoms:**\n1. **Loss aversion**: Losses feel 2× more painful than equivalent gains feel good (Kahneman/Tversky)\n2. **Narrative extrapolation**: At bottoms, news flow is maximally negative — investors extrapolate recession into permanent depression\n3. **Social proof**: Everyone seems to be selling; it feels prudent to follow\n4. **Inability to fund losses**: Forced sellers (margin calls, redemptions, job loss) have no choice\n\n**Global diversification benefits:**\n- **Valuation dispersion**: When US CAPE is 30+, many international markets trade at 10–15×\n- **Return diversification**: Correlation between US and international stocks averages 0.6–0.8 — meaningful diversification benefit\n- **Currency diversification**: Non-dollar assets provide partial hedge against dollar weakness\n- **Data**: From 1900–2022, the world ex-US portfolio returned only 1.5% less per year than the US — but with significantly lower concentration risk\n- **Rebalancing premium**: Global portfolio allows disciplined rebalancing (sell high, buy low) across geographies\n\n**The simple long-run framework:**\n1. Own a globally diversified equity portfolio\n2. Monitor valuation and adjust allocation modestly at extremes\n3. Automate contributions to prevent behavioral errors\n4. Never sell in a panic — downturns are sales, not catastrophes",
 highlight: [
 "stay invested: 5× 2007 peak by 2023",
 "missing 10 best days: 9.5% 5.3%",
 "best days cluster after worst",
 "loss aversion",
 "narrative extrapolation",
 "global valuation dispersion",
 "rebalancing premium",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "The Shiller CAPE ratio of the US stock market has historically been most useful for:",
 options: [
 "Predicting 10-year forward equity returns — with high CAPE predicting lower future returns — though it provides little guidance on short-term timing",
 "Precisely identifying market tops and bottoms to enable optimal market timing",
 "Measuring short-term momentum — a rising CAPE signals strong earnings growth and short-run price gains",
 "Comparing current interest rates to equity yields to determine optimal bond-to-equity allocation",
 ],
 correctIndex: 0,
 explanation:
 "The CAPE ratio is a powerful 10-year return predictor but a terrible timing tool. Shiller noted in 1996 that CAPE looked expensive — the market then doubled before crashing in 2000. Investors who sold in 1996 based on CAPE missed massive gains. However, those who bought at CAPE > 30 in 1999 endured a lost decade. Use CAPE for strategic asset allocation (modestly overweight international when US CAPE is extremely high), not to call tops or bottoms.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "It's March 2009. The S&P 500 has fallen 57% from its 2007 peak. Unemployment is rising toward 10%. Major banks nearly failed. The financial media is running articles asking 'Is capitalism finished?' Your $100,000 equity portfolio is now worth $43,000. Your neighbor tells you to sell before it goes to zero.",
 question:
 "What does 200 years of market history suggest is the right course of action?",
 options: [
 "Hold — and if possible, buy more. March 9, 2009 was the exact market trough. Historically, the best returns come immediately after maximum pessimism, and selling at bottoms locks in permanent losses",
 "Sell half and wait for confirmation of recovery before reinvesting — this prudent approach limits further downside while retaining some upside exposure",
 "Sell everything and buy gold — the 2009 crisis was structural, not cyclical, and the stock market would underperform gold for the next decade",
 "Sell and hold cash until unemployment peaks, then reinvest — economic indicators have historically led market recoveries by 6–12 months",
 ],
 correctIndex: 0,
 explanation:
 "March 9, 2009 was the exact bottom of the GFC bear market. From that low, the S&P 500 rose 400%+ over the next decade. Investors who sold at the bottom and waited for 'confirmation' typically bought back at significantly higher prices, missing the sharpest rally days. Fidelity found that 401(k) investors who stayed invested through the crisis recovered by 2013 and had 5× their 2007 peak values by 2023. History uniformly shows: maximum pessimism = maximum opportunity, and selling at bottoms is the most costly investing mistake.",
 difficulty: 2,
 },
 ],
 },
 ],
};
